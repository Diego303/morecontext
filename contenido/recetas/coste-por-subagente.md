---
titulo: Medir el coste de cada subagente
descripcion: Un hook SubagentStop que lee el transcript de cada subagente de Claude Code, suma los tokens por categoría y estima su coste con una tabla de precios fechada y con fuente.
creado: 2026-10-29
nivel: avanzado
minutos: 35
tema: produccion
stack: ["Claude Code", "Python"]
tags: [coste, hooks, subagentes, claude-code, observabilidad]
relacionados: ["[[cursos/harness-engineering/10-coste-y-presupuesto]]", "[[roadmap/90-harness/04-estado-coste-y-contexto]]", "[[roadmap/60-multiagente/05-coste-de-multiplicar-agentes]]", "[[docs/produccion/02-costes-y-limites]]", "[[docs/claude-code/04-hooks]]"]
---

## Problema

Repartes el trabajo entre [[glosario/subagente|subagentes]]: uno explora, otro diseña, otro construye, otro revisa. Al final del mes la cuenta sube y no sabes quién gasta. ¿El revisor relee el repo entero? ¿El constructor reintenta sin parar? Sin una cifra por agente no puedes decidir qué recortar ni poner un presupuesto que pare a tiempo.

Claude Code guarda un transcript JSONL por subagente con el `usage` real de cada respuesta. Esta receta lo lee al terminar cada subagente con un [[glosario/hook|hook]] `SubagentStop` y apunta tokens y coste en un libro mayor. Es la versión reducida del `ledger.py` del harness del autor.

## Ingredientes

- Claude Code con subagentes (los tuyos en `.claude/agents/` o los integrados).
- Python 3.11 o superior (`tomllib` está en la biblioteca estándar desde 3.11).
- Los precios actuales de la [página oficial de precios](https://platform.claude.com/docs/en/about-claude/pricing). Cambian: no los copies de ningún tutorial, tampoco de este.

## Pasos

1. **Entiende qué hay que sumar.** Cada respuesta del modelo trae `usage` con `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens` y, dentro de `cache_creation`, el desglose por duración de la caché (`ephemeral_5m_input_tokens`, `ephemeral_1h_input_tokens`). Son cinco categorías con precio distinto: entrada, salida, escritura en caché de 5 minutos, escritura de 1 hora y lectura de caché ([[glosario/prompt-caching]]). Si las sumas todas como «entrada», el número no se parece a la factura.

2. **Apunta la tabla de precios con fecha y fuente.** El coste es una estimación a precios de API: guarda de dónde sale y cuándo la revisaste, para que nadie la tome por eterna. Los valores de abajo son **de ejemplo**.

```toml title=".claude/precios.toml"
# USD por millón de tokens. VALORES DE EJEMPLO: copia los reales de la página oficial
# de precios y actualiza as_of cada vez que los revises.
as_of = "AAAA-MM-DD"
source = "https://platform.claude.com/docs/en/about-claude/pricing"

[models."claude-sonnet-5-5"]   # ejemplo, no son precios reales
input = 1.00
output = 5.00
cache_write_5m = 1.25
cache_write_1h = 2.00
cache_read = 0.10
```

3. **Escribe el hook.** Tres detalles que el autor descubrió leyendo transcripts reales:
   - **Streaming.** Claude Code escribe varias líneas por mensaje (una por bloque de contenido) con el mismo `message.id`, y las intermedias llevan `output_tokens` parcial. Si sumas todas, cuentas de más. Por mensaje, quédate con la línea de mayor salida.
   - **Modelo sin sufijo de fecha.** `claude-x-20261001` y `claude-x` son la misma tarifa. Las líneas `<synthetic>` no son llamadas al modelo.
   - **Dónde está el transcript.** Usa `agent_transcript_path` si la entrada del hook lo trae; si no, se deriva de `transcript_path`, `session_id` y `agent_id` (`<carpeta>/<sesión>/subagents/agent-<id>.jsonl`). Es un formato interno de Claude Code: si cambia, el hook no encuentra nada y no apunta, sin romper la sesión.

```python title=".claude/hooks/coste_subagente.py"
#!/usr/bin/env python3
"""Coste de cada subagente de Claude Code a partir de su transcript.

  coste_subagente.py hook      hook SubagentStop (JSON por stdin): añade una línea a .claude/state/coste.jsonl
  coste_subagente.py resumen   total por tipo de agente

Es una estimación a precios de API con la tabla de .claude/precios.toml. Nunca rompe la sesión.
"""
import json
import os
import re
import sys
import tomllib
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(os.environ.get("CLAUDE_PROJECT_DIR") or ".")
PRECIOS = RAIZ / ".claude" / "precios.toml"
LIBRO = RAIZ / ".claude" / "state" / "coste.jsonl"
CAMPOS = ("input", "output", "cache_write_5m", "cache_write_1h", "cache_read")


def contadores(usage: dict) -> dict:
    """usage de la API -> las cinco categorías que tienen precio propio."""
    escrito = int(usage.get("cache_creation_input_tokens") or 0)
    una_hora = int((usage.get("cache_creation") or {}).get("ephemeral_1h_input_tokens") or 0)
    return {"input": int(usage.get("input_tokens") or 0), "output": int(usage.get("output_tokens") or 0),
            "cache_write_5m": max(escrito - una_hora, 0), "cache_write_1h": una_hora,
            "cache_read": int(usage.get("cache_read_input_tokens") or 0)}


def uso_del_transcript(ruta: Path) -> dict:
    """Tokens por modelo. Cada mensaje cuenta una vez: Claude Code escribe varias líneas por mensaje
    (una por bloque) con el mismo message.id y output_tokens creciente; me quedo con la mayor."""
    por_mensaje = {}
    for linea in ruta.read_text(encoding="utf-8", errors="replace").splitlines():
        try:
            registro = json.loads(linea)
        except json.JSONDecodeError:
            continue
        mensaje = registro.get("message") or {}
        if registro.get("type") != "assistant" or not isinstance(mensaje.get("usage"), dict):
            continue
        modelo = re.sub(r"-\d{8}$", "", mensaje.get("model") or "desconocido")  # quita el sufijo de fecha
        if modelo == "<synthetic>":
            continue
        clave = mensaje.get("id") or registro.get("uuid")
        c = contadores(mensaje["usage"])
        if clave not in por_mensaje or c["output"] >= por_mensaje[clave][1]["output"]:
            por_mensaje[clave] = (modelo, c)
    total = {}
    for modelo, c in por_mensaje.values():
        acumulado = total.setdefault(modelo, dict.fromkeys(CAMPOS, 0))
        for campo in CAMPOS:
            acumulado[campo] += c[campo]
    return total


def coste(uso: dict, tabla: dict) -> tuple[float, list[str]]:
    usd, sin_precio = 0.0, []
    for modelo, c in uso.items():
        tarifas = tabla.get(modelo)
        if not tarifas:
            sin_precio.append(modelo)
            continue
        usd += sum(c[campo] * float(tarifas[campo]) for campo in CAMPOS) / 1_000_000
    return usd, sin_precio


def transcript_del_subagente(payload: dict) -> Path | None:
    if payload.get("agent_transcript_path"):
        return Path(payload["agent_transcript_path"])
    agente, sesion, principal = payload.get("agent_id"), payload.get("session_id"), payload.get("transcript_path")
    if not (agente and sesion and principal) or not re.fullmatch(r"[\w-]+", f"{agente}{sesion}"):
        return None
    return Path(principal).parent / sesion / "subagents" / f"agent-{agente}.jsonl"


def hook(raw: str) -> int:
    try:
        payload = json.loads(raw or "{}")
        ruta = transcript_del_subagente(payload)
        if payload.get("hook_event_name") != "SubagentStop" or ruta is None or not ruta.is_file():
            return 0
        precios = tomllib.loads(PRECIOS.read_text(encoding="utf-8"))
        uso = uso_del_transcript(ruta)
        usd, sin_precio = coste(uso, precios.get("models", {}))
        LIBRO.parent.mkdir(parents=True, exist_ok=True)
        with LIBRO.open("a", encoding="utf-8") as f:
            f.write(json.dumps({
                "ts": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "agent_type": payload.get("agent_type"), "agent_id": payload.get("agent_id"),
                "usage": uso, "cost_usd": round(usd, 6), "sin_precio": sin_precio,
                "precios_as_of": precios.get("as_of"), "precios_fuente": precios.get("source"),
            }, ensure_ascii=False) + "\n")
    except Exception as exc:  # contabilidad: fallo en abierto, pero que quede constancia
        print(f"coste_subagente: {exc!r}", file=sys.stderr)
    return 0


def resumen() -> int:
    filas = [json.loads(l) for l in LIBRO.read_text(encoding="utf-8").splitlines() if l.strip()]
    por_agente = {}
    for f in filas:
        slot = por_agente.setdefault(f["agent_type"], {"ejec": 0, "usd": 0.0, "output": 0})
        slot["ejec"] += 1
        slot["usd"] += f["cost_usd"]
        slot["output"] += sum(c["output"] for c in f["usage"].values())
    print(f"{'agente':<16}{'ejec':>5}{'output':>10}{'coste USD':>12}")
    for agente, s in sorted(por_agente.items(), key=lambda kv: -kv[1]["usd"]):
        print(f"{agente:<16}{s['ejec']:>5}{s['output']:>10}{s['usd']:>12.4f}")
    print(f"{'TOTAL':<31}{sum(s['usd'] for s in por_agente.values()):>12.4f}")
    faltan = sorted({m for f in filas for m in f["sin_precio"]})
    if faltan:
        print(f"AVISO: modelos sin precio (no suman): {', '.join(faltan)}")
    print(f"Precios a {filas[-1]['precios_as_of']} ({filas[-1]['precios_fuente']}). Estimación, no factura.")
    return 0


if __name__ == "__main__":
    orden = sys.argv[1] if len(sys.argv) > 1 else ""
    sys.exit(hook(sys.stdin.read()) if orden == "hook" else resumen() if orden == "resumen" else 2)
```

   Fíjate en la política de errores, opuesta a la del [[recetas/hook-que-bloquea-comandos-peligrosos|guard de seguridad]]: un hook de contabilidad **nunca bloquea** (sale siempre con 0 y deja el error en stderr). Que falle la medición no debe parar el trabajo; que falle la seguridad, sí.

4. **Regístralo en `SubagentStop`.** Sin `matcher`: interesa cualquier subagente.

```json title=".claude/settings.json"
{
  "hooks": {
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/coste_subagente.py\" hook",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

5. **Pruébalo con transcripts simulados.** Las pruebas escriben un transcript como los de Claude Code, disparan el hook con el JSON de `SubagentStop` y comprueban el desglose, el modelo sin precio y que nunca rompe la sesión.

```python title="test_coste.py"
"""python3 -m unittest -v test_coste.py"""
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HOOK = Path(__file__).parent / ".claude" / "hooks" / "coste_subagente.py"


def uso(output, entrada=10, escrito=2000, leido=0, una_hora=0):
    return {"input_tokens": entrada, "output_tokens": output, "cache_read_input_tokens": leido,
            "cache_creation_input_tokens": escrito + una_hora,
            "cache_creation": {"ephemeral_5m_input_tokens": escrito, "ephemeral_1h_input_tokens": una_hora}}


class CosteSubagente(unittest.TestCase):
    def setUp(self):
        self.repo = Path(tempfile.mkdtemp())
        (self.repo / ".claude").mkdir()
        (self.repo / ".claude" / "precios.toml").write_text(
            (Path(__file__).parent / ".claude" / "precios.toml").read_text(encoding="utf-8"), encoding="utf-8")
        self.sesiones = self.repo / "transcripts"

    def subagente(self, agente_id, tipo, lineas):
        """Simula lo que deja Claude Code: transcript de la sesión y del subagente, y dispara el hook."""
        principal = self.sesiones / "s-1.jsonl"
        sub = self.sesiones / "s-1" / "subagents" / f"agent-{agente_id}.jsonl"
        sub.parent.mkdir(parents=True, exist_ok=True)
        principal.touch()
        sub.write_text("\n".join(json.dumps(l) for l in lineas) + "\n", encoding="utf-8")
        payload = {"hook_event_name": "SubagentStop", "session_id": "s-1", "transcript_path": str(principal),
                   "agent_id": agente_id, "agent_type": tipo}
        env = {**os.environ, "CLAUDE_PROJECT_DIR": str(self.repo)}
        return subprocess.run([sys.executable, str(HOOK), "hook"], input=json.dumps(payload), env=env,
                              capture_output=True, text=True)

    def libro(self):
        return [json.loads(l) for l in (self.repo / ".claude/state/coste.jsonl").read_text().splitlines()]

    def test_streaming_cuenta_cada_mensaje_una_vez(self):
        lineas = [
            {"type": "user", "message": {"content": "Revisa el módulo de pagos"}},
            {"type": "assistant", "message": {"id": "m1", "model": "claude-sonnet-5-5-20261001", "usage": uso(1)}},
            {"type": "assistant", "message": {"id": "m1", "model": "claude-sonnet-5-5-20261001", "usage": uso(800)}},
            {"type": "assistant", "message": {"id": "m2", "model": "claude-sonnet-5-5", "usage": uso(200, leido=2000)}},
            {"type": "assistant", "message": {"id": "m3", "model": "<synthetic>", "usage": uso(999)}},
        ]
        self.assertEqual(0, self.subagente("a1", "reviewer", lineas).returncode)
        fila = self.libro()[0]
        u = fila["usage"]["claude-sonnet-5-5"]
        self.assertEqual({"input": 20, "output": 1000, "cache_write_5m": 4000, "cache_write_1h": 0, "cache_read": 2000}, u)
        # 20 x 1.00 + 1000 x 5.00 + 4000 x 1.25 + 2000 x 0.10, por millón (precios de ejemplo)
        self.assertAlmostEqual(0.01022, fila["cost_usd"])

    def test_modelo_sin_precio_queda_marcado(self):
        lineas = [{"type": "assistant", "message": {"id": "m1", "model": "claude-nuevo-9", "usage": uso(50)}}]
        self.subagente("a2", "explorer", lineas)
        self.assertEqual(["claude-nuevo-9"], self.libro()[0]["sin_precio"])

    def test_nunca_rompe_la_sesion(self):
        r = subprocess.run([sys.executable, str(HOOK), "hook"], input="{no es json", capture_output=True, text=True)
        self.assertEqual(0, r.returncode)


if __name__ == "__main__":
    unittest.main()
```

## Cómo comprobar que funciona

```text
$ python3 -m unittest -v test_coste.py
test_modelo_sin_precio_queda_marcado (test_coste.CosteSubagente.test_modelo_sin_precio_queda_marcado) ... ok
test_nunca_rompe_la_sesion (test_coste.CosteSubagente.test_nunca_rompe_la_sesion) ... ok
test_streaming_cuenta_cada_mensaje_una_vez (test_coste.CosteSubagente.test_streaming_cuenta_cada_mensaje_una_vez) ... ok

----------------------------------------------------------------------
Ran 3 tests in 0.207s

OK
```

Con cuatro subagentes simulados y los precios de ejemplo, el resumen queda así (las cifras solo valen para comprobar la aritmética):

```text
$ python3 .claude/hooks/coste_subagente.py resumen
agente           ejec    output   coste USD
builder             1      9000      0.0675
designer            1      4000      0.0300
explorer            1      2100      0.0230
reviewer            1      1500      0.0153
TOTAL                                0.1358
Precios a AAAA-MM-DD (https://platform.claude.com/docs/en/about-claude/pricing). Estimación, no factura.
```

En una sesión real, lanza un subagente (por ejemplo, «usa un subagente para listar los TODO del repo») y mira la última línea de `.claude/state/coste.jsonl`: debe tener su `agent_type`, tokens en varias categorías y un coste mayor que cero.

## Variaciones

- **Por feature.** El harness del autor pone una cabecera `FEATURE_ID: <ID>` en las primeras líneas del prompt de cada subagente; el hook la lee del primer mensaje del transcript y apunta el coste en el estado de esa feature. Así sabe cuánto costó cada feature y cuánto cada fase ([[cursos/harness-engineering/10-coste-y-presupuesto]]).
- **Presupuesto que para.** Con el libro mayor, una comprobación antes de lanzar trabajo nuevo: aviso al acercarse al límite (el autor lo dispara como tarde al 80 %) y bloqueo al superarlo, que solo una persona puede ampliar.
- **Uso sin precio = bloqueo.** El autor va más lejos que esta receta: si aparece un modelo sin tarifa, bloquea el trabajo nuevo hasta que alguien la añada. Sin precio no hay control.
- **Modo rápido y contexto largo.** Si usas un modo de velocidad con precio aparte (el `usage` lo indica en `speed`) o un modelo con tramo de contexto largo, añade a la tabla su multiplicador o su tramo y aplícalo por petición, no por total.
- **El orquestador.** La sesión principal no pasa por `SubagentStop`. El autor la estima recorriendo el transcript principal y asignando cada turno a las features que menciona; es una heurística y la marca como tal.

## Errores típicos

- **Tomar la estimación por factura.** Con un plan de suscripción no pagas por token: el número sirve para comparar agentes y features, no para conciliar con contabilidad.
- **Precios fijos en el código.** Cambian y varían por modelo, también los multiplicadores de caché. Una tabla con `as_of` y `source` se revisa; una constante enterrada, no.
- **Contar las líneas de streaming.** El síntoma: la salida sale varias veces mayor de lo esperado. Deduplica por `message.id`.
- **Sumar la caché como entrada.** Leer de caché cuesta mucho menos que la entrada normal y escribir algo más. Mezclarlas esconde justo el ahorro que buscas ([[recetas/recortar-costes-con-prompt-caching]]).
- **Un hook que bloquea.** Si el hook de coste sale con 2 por un JSON raro, para la sesión por un problema de contabilidad. Sal siempre con 0.
- **Ignorar los modelos sin precio.** Un alias que cambia de modelo sin avisar aparece como «sin precio» y su coste no suma. Fija el ID completo del modelo en tus subagentes y vigila el aviso.
