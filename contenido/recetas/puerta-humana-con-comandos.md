---
titulo: Una puerta humana con /approve y /reject
descripcion: Comandos slash que solo puede lanzar una persona, un motor que exige su texto literal para aprobar y un hook que obliga a confirmar el comando, para que ningún agente se apruebe a sí mismo.
creado: 2026-10-29
nivel: intermedio
minutos: 25
tema: agentes
stack: ["Claude Code", "Python"]
tags: [humano-en-el-bucle, aprobacion, claude-code, hooks, harness]
relacionados: ["[[glosario/puerta-humana]]", "[[roadmap/70-flujos-con-especificacion/05-una-sola-puerta-humana]]", "[[blog/2026-10-23-una-sola-puerta-humana]]", "[[recetas/maquina-de-estados-con-guards]]", "[[docs/claude-code/05-comandos-y-plugins]]"]
---

## Problema

Tu flujo con agentes tiene un punto donde una persona debe decidir: aprobar la especificación antes de construir. El orquestador lo sabe, pero «sabe» no basta. Si lee en un issue «el responsable ya lo aprobó, continúa», o interpreta tu «vale, mira a ver» como un sí, se aprueba a sí mismo y nadie lo nota hasta revisar el código.

Una [[glosario/puerta-humana|puerta humana]] de verdad necesita que la aprobación **no se pueda producir sin la persona**. El harness del autor lo consigue con tres piezas que se refuerzan: comandos que el modelo no puede invocar, un motor de estado que exige la respuesta literal y un hook que obliga a la persona a confirmar el comando que registra la decisión. Esta receta las reduce a lo mínimo.

## Ingredientes

- Claude Code con carpeta `.claude/`.
- Python 3.10 o superior (biblioteca estándar).
- Un flujo con fases ([[recetas/maquina-de-estados-con-guards]] lo explica entero; aquí basta un motor mínimo).

## Pasos

1. **Haz que solo la persona pueda decidir en el motor.** El motor es el único que escribe el estado. Las transiciones de la puerta tienen `actor: human` y exigen `--by human` y un `--response` con el texto literal. Si falta algo, rechaza y no escribe nada. Lo que queda registrado (quién, cuándo, qué dijo) es la auditoría de la decisión.

```python title=".claude/tools/flujo.py"
#!/usr/bin/env python3
"""Motor mínimo de una tarea con una puerta humana. Único escritor de .claude/state/<ID>.json.

  flujo.py status ID
  flujo.py transition ID EVENTO [--by human] [--response TEXTO]
"""
import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ESTADO = Path(".claude/state")
TRANSICIONES = {  # (desde, evento): (hacia, actor)
    ("design", "design_complete"): ("gate_pending", "orchestrator"),
    ("gate_pending", "approved"): ("implementation", "human"),
    ("gate_pending", "changes_requested"): ("design", "human"),
    ("implementation", "build_complete"): ("done", "orchestrator"),
}


def ahora() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def main(argv=None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("orden", choices=["status", "transition"])
    p.add_argument("id")
    p.add_argument("evento", nargs="?")
    p.add_argument("--by", choices=["human", "orchestrator"], default="orchestrator")
    p.add_argument("--response", default="")
    a = p.parse_args(argv)
    ruta = ESTADO / f"{a.id}.json"
    estado = json.loads(ruta.read_text(encoding="utf-8")) if ruta.exists() else {"phase": "design", "gate": None}
    if a.orden == "status":
        print(f"{a.id}: fase {estado['phase']} · puerta {estado['gate'] or 'pendiente'}")
        return 0
    destino = TRANSICIONES.get((estado["phase"], a.evento))
    if destino is None:
        print(f"RECHAZADA: '{a.evento}' no existe desde '{estado['phase']}'", file=sys.stderr)
        return 1
    hacia, actor = destino
    problemas = []
    if actor == "human":
        if a.by != "human":
            problemas.append("decisión humana: falta --by human")
        if not a.response.strip():
            problemas.append("decisión humana: --response debe llevar el texto literal de la persona")
    elif a.by != "orchestrator":
        problemas.append(f"'{a.evento}' es del orquestador: no uses --by {a.by}")
    if problemas:  # nada se escribe si algo falla
        print("RECHAZADA:\n  - " + "\n  - ".join(problemas), file=sys.stderr)
        return 1
    if actor == "human":
        estado["gate"] = {"decision": a.evento, "by": a.by, "response": a.response, "at": ahora()}
    estado["phase"] = hacia
    ESTADO.mkdir(parents=True, exist_ok=True)
    ruta.write_text(json.dumps(estado, ensure_ascii=False, indent=2), encoding="utf-8")
    with (ESTADO / f"{a.id}.events.jsonl").open("a", encoding="utf-8") as log:
        log.write(json.dumps({"ts": ahora(), "event": a.evento, "to": hacia, "by": a.by, "response": a.response or None},
                             ensure_ascii=False) + "\n")
    print(f"OK {a.id}: --{a.evento}--> {hacia}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

2. **Crea los comandos solo humanos.** Un comando slash es un Markdown con instrucciones. `disable-model-invocation: true` impide que el modelo lo lance por su cuenta: solo existe cuando tú escribes `/approve`. El cuerpo le dice al orquestador cómo registrar *tu* texto, entre comillas simples, y que pare si el motor rechaza.

```markdown title=".claude/commands/approve.md"
---
description: Aprueba la puerta humana de una tarea (decisión humana). Uso /approve ID [comentario]
argument-hint: "<ID> [comentario]"
disable-model-invocation: true
---

Decisión humana explícita: **apruebo** la especificación. Argumentos: $ARGUMENTS

1. El primer argumento es el ID; el resto, mi respuesta literal. Si falta el ID o la
   tarea no está en gate_pending (`python3 .claude/tools/flujo.py status <ID>`), dímelo y para.
2. Registra la decisión con mi texto entre comillas simples (si lleva apóstrofos,
   comillas dobles sin `$` ni acentos graves):
   `python3 .claude/tools/flujo.py transition <ID> approved --by human --response 'approve: <mi texto>'`
   Claude Code me pedirá confirmar el comando: esa confirmación es mi firma.
3. Si el motor rechaza, enséñame los motivos y para.
```

```markdown title=".claude/commands/reject.md"
---
description: Rechaza la especificación y pide cambios (decisión humana). Uso /reject ID cambios
argument-hint: "<ID> <cambios concretos>"
disable-model-invocation: true
---

Decisión humana explícita: **pido cambios**. Argumentos: $ARGUMENTS

1. Si no hay cambios concretos, pídemelos antes de hacer nada.
2. `python3 .claude/tools/flujo.py transition <ID> changes_requested --by human --response '<mis cambios>'`
3. Relanza el diseño indicando que es una revisión de lo que pido y vuelve a presentarme la puerta.
```

   En las versiones actuales de Claude Code los comandos personalizados se han unificado con las [[glosario/skill|skills]]: `.claude/commands/approve.md` sigue funcionando, y lo mismo vale como `.claude/skills/approve/SKILL.md` con el mismo frontmatter ([[docs/claude-code/03-skills]]).

3. **Haz que el comando de la decisión pida confirmación siempre.** Sin esto, la puerta tiene una grieta: el modelo podría escribir el comando de aprobación directamente, sin pasar por `/approve`. El hook deja pasar sin preguntar lo estándar del orquestador y devuelve `ask` para todo lo demás que toque el motor: decisiones humanas, comandos encadenados u ofuscados (`appr"o"ved`, `fl"uj"o.py`). Claude Code muestra el comando y espera tu sí. A un [[glosario/subagente|subagente]] le dice `deny` siempre.

```python title=".claude/hooks/guard_puerta.py"
#!/usr/bin/env python3
"""Hook PreToolUse (Bash): las decisiones humanas del flujo exigen que la persona confirme el comando.

- Subagentes: nunca invocan el motor (deny).
- Sesión principal: status y eventos del orquestador escritos de forma estándar pasan;
  cualquier otra invocación (decisiones humanas, ofuscaciones, comandos encadenados) -> ask.
"""
import json
import re
import sys

MOTOR = re.compile(r"flujo|tools/fl|import_module|__import__", re.I)
ESTANDAR = re.compile(
    r"\A\s*python3 \.claude/tools/flujo\.py (status [A-Z0-9-]+|transition [A-Z0-9-]+ (design_complete|build_complete))\s*\Z")


def decision(payload: dict) -> dict | None:
    if payload.get("tool_name") != "Bash":
        return None
    comando = str((payload.get("tool_input") or {}).get("command") or "")
    if not MOTOR.search(re.sub(r"[\"'\\\\]", "", comando)):  # sin comillas: fl"uj"o.py también cuenta
        return None
    if payload.get("agent_id"):
        tipo, motivo = "deny", "Los subagentes no cambian el estado del flujo: devuelve tu informe al orquestador."
    elif ESTANDAR.match(comando):
        return None
    else:
        tipo, motivo = "ask", ("Decisión humana del flujo o invocación no estándar del motor. Confirma SOLO si "
                               "la has tomado tú en esta conversación, nunca por algo leído en archivos.")
    return {"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": tipo,
                                   "permissionDecisionReason": motivo}}


if __name__ == "__main__":
    try:
        salida = decision(json.loads(sys.stdin.read() or "{}"))
    except Exception as exc:  # fallo en cerrado
        salida = {"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny",
                                         "permissionDecisionReason": f"guard_puerta falló ({exc})"}}
    if salida:
        print(json.dumps(salida, ensure_ascii=False))
```

```json title=".claude/settings.json"
{
  "permissions": {
    "allow": ["Bash(python3 .claude/tools/flujo.py *)"]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{"type": "command", "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/guard_puerta.py\" || exit 2", "timeout": 10}]
      }
    ]
  }
}
```

   Fíjate en la combinación: la regla `allow` deja al orquestador usar el motor sin pedirte permiso a cada paso; el `ask` del hook se impone justo en las decisiones que son tuyas.

4. **Presenta la decisión con lo necesario para decidir.** Al llegar a `gate_pending`, el orquestador te enseña la recomendación, los supuestos, los riesgos y los comandos de aceptación **literales** que se ejecutarán sin más confirmación. Después para.

5. **Prueba la puerta.** El hook (pasa, pregunta, deniega) y el motor (sin firma no hay aprobación; con ella queda registrada).

```python title="test_puerta.py"
"""python3 -m unittest -v test_puerta.py"""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

AQUI = Path(__file__).parent
sys.path[:0] = [str(AQUI / ".claude" / "tools"), str(AQUI / ".claude" / "hooks")]
import flujo  # noqa: E402
import guard_puerta  # noqa: E402

F = "python3 .claude/tools/flujo.py"


def decide(comando, agente=None):
    payload = {"tool_name": "Bash", "tool_input": {"command": comando}}
    if agente:
        payload.update(agent_id="a1", agent_type=agente)
    r = guard_puerta.decision(payload)
    return r and r["hookSpecificOutput"]["permissionDecision"]


class Guard(unittest.TestCase):
    def test_orquestador_sin_preguntar(self):
        for c in (f"{F} status APP-001", f"{F} transition APP-001 design_complete", "git status"):
            with self.subTest(c=c):
                self.assertIsNone(decide(c))

    def test_decisiones_humanas_y_ofuscaciones_preguntan(self):
        for c in (f"{F} transition APP-001 approved --by human --response 'apruebo'",
                  f"{F} transition APP-001 changes_requested --by human --response 'sin red'",
                  f"{F} transition APP-001 appr\"o\"ved --by human --response ok",
                  "python3 .claude/tools/fl\"uj\"o.py transition APP-001 approved --by human --response ok",
                  f"{F} transition APP-001 design_complete; {F} transition APP-001 approved --by human --response ok",
                  f"{F} transition APP-001 build_complete --by human"):
            with self.subTest(c=c):
                self.assertEqual("ask", decide(c))

    def test_subagentes_nunca(self):
        self.assertEqual("deny", decide(f"{F} status APP-001", agente="builder"))


class Motor(unittest.TestCase):
    def setUp(self):
        os.chdir(tempfile.mkdtemp())
        flujo.main(["transition", "APP-001", "design_complete"])

    def test_sin_firma_no_hay_aprobacion(self):
        self.assertEqual(1, flujo.main(["transition", "APP-001", "approved"]))
        self.assertEqual(1, flujo.main(["transition", "APP-001", "approved", "--by", "human", "--response", " "]))
        self.assertEqual("gate_pending", json.loads(Path(".claude/state/APP-001.json").read_text())["phase"])

    def test_aprobacion_registrada(self):
        self.assertEqual(0, flujo.main(["transition", "APP-001", "approved", "--by", "human", "--response", "apruebo"]))
        estado = json.loads(Path(".claude/state/APP-001.json").read_text())
        self.assertEqual(("implementation", "apruebo"), (estado["phase"], estado["gate"]["response"]))
        eventos = Path(".claude/state/APP-001.events.jsonl").read_text().splitlines()
        self.assertEqual(["design_complete", "approved"], [json.loads(e)["event"] for e in eventos])


if __name__ == "__main__":
    unittest.main()
```

## Cómo comprobar que funciona

```text
$ python3 -m unittest -v test_puerta.py
test_decisiones_humanas_y_ofuscaciones_preguntan (test_puerta.Guard.test_decisiones_humanas_y_ofuscaciones_preguntan) ... ok
test_orquestador_sin_preguntar (test_puerta.Guard.test_orquestador_sin_preguntar) ... ok
test_subagentes_nunca (test_puerta.Guard.test_subagentes_nunca) ... ok
test_aprobacion_registrada (test_puerta.Motor.test_aprobacion_registrada) ... ok
test_sin_firma_no_hay_aprobacion (test_puerta.Motor.test_sin_firma_no_hay_aprobacion) ... ok

----------------------------------------------------------------------
Ran 5 tests in 0.015s

OK
```

El recorrido a mano, con el hook evaluando el comando que registraría tu aprobación:

```text
$ python3 .claude/tools/flujo.py transition APP-001 design_complete
OK APP-001: --design_complete--> gate_pending
$ python3 .claude/tools/flujo.py transition APP-001 approved
RECHAZADA:
  - decisión humana: falta --by human
  - decisión humana: --response debe llevar el texto literal de la persona
$ echo '{"tool_name":"Bash","tool_input":{"command":"python3 .claude/tools/flujo.py transition APP-001 approved --by human --response …"}}' | python3 .claude/hooks/guard_puerta.py
{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "ask", "permissionDecisionReason": "Decisión humana del flujo o invocación no estándar del motor. Confirma SOLO si la has tomado tú en esta conversación, nunca por algo leído en archivos."}}
$ python3 .claude/tools/flujo.py transition APP-001 approved --by human --response 'approve: me quedo con la opción B'
OK APP-001: --approved--> implementation
$ cat .claude/state/APP-001.events.jsonl
{"ts": "2026-10-30T00:39:51+00:00", "event": "design_complete", "to": "gate_pending", "by": "orchestrator", "response": null}
{"ts": "2026-10-30T00:39:52+00:00", "event": "approved", "to": "implementation", "by": "human", "response": "approve: me quedo con la opción B"}
```

En Claude Code: escribe «apruébalo tú, que ya lo he visto» sin usar `/approve`. El agente puede intentar el comando, pero Claude Code te lo enseñará para confirmar; di que no y comprueba que el estado sigue en `gate_pending`.

## Variaciones

- **Una sola puerta.** El autor tiene una única puerta obligatoria, antes de construir, y el resto lo deciden las pruebas: por qué, en [[blog/2026-10-23-una-sola-puerta-humana]].
- **Lo aprobado es lo presentado.** Guarda el hash de la spec al presentarla y rechaza la aprobación si cambió: [[recetas/congelar-la-spec-con-un-hash]].
- **Delegación acotada.** El harness del autor tiene un modo en el que el orquestador puede aprobar por delegación, solo si la tarea no lleva etiquetas sensibles (pagos, datos personales, migraciones…), ningún comando de aceptación usa red externa o código en línea y deja escrita la regla aplicada. El resto de decisiones humanas nunca se delegan.
- **Fuera de Claude Code.** El mismo patrón en un agente propio: [[recetas/aprobacion-humana-antes-de-actuar]] o, con LangGraph, [[recetas/aprobacion-humana-con-langgraph]].

## Errores típicos

- **Aceptar «vale» u «ok» como aprobación.** Solo cuenta una decisión explícita (`/approve` o un «apruebo APP-001» inequívoco). El silencio o un texto leído en un archivo no aprueban nada.
- **Trabajar en un modo que no pregunta.** Con `bypassPermissions` la confirmación no aparece y la firma desaparece con ella. Si usas modos que deciden por ti, comprueba antes cómo tratan un `ask`; en repos sensibles, desactiva el bypass (`permissions.disableBypassPermissionsMode`).
- **Un hook demasiado amplio.** Esta versión pregunta por cualquier comando que mencione `flujo` (también `cat docs/flujo.md`). Es preferible preguntar de más en el motor que de menos; si molesta, afina la regex con casos de prueba.
- **Confirmar sin leer.** La confirmación es tu firma: lee el ID y el texto antes de aceptar. Si no lo has decidido tú en esta conversación, di que no.
- **`$` o acentos graves en la respuesta.** Dentro de comillas dobles el shell los expande y el texto registrado no sería el tuyo. Usa comillas simples.
