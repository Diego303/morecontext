---
titulo: Un canario para detectar contexto saturado
descripcion: Pide al agente que empiece cada respuesta con un prefijo fijo; cuando deja de hacerlo, el contexto está saturado y toca abrir sesión nueva con un traspaso estructurado.
creado: 2026-10-29
nivel: inicial
minutos: 15
tema: agentes
stack: ["Claude Code"]
tags: [contexto, sesiones-largas, claude-code, traspaso, harness]
relacionados: ["[[glosario/canario-de-contexto]]", "[[cursos/harness-engineering/11-sesiones-largas]]", "[[problemas/contexto-saturado-en-sesiones-largas]]", "[[glosario/traspaso-de-sesion]]", "[[plantillas/claude-md]]"]
---

## Problema

Llevas horas en la misma sesión de Claude Code. Al principio seguía tus reglas al pie de la letra; ahora se salta pasos, olvida una decisión de hace dos horas o vuelve a proponer algo que descartasteis. La [[glosario/ventana-de-contexto|ventana de contexto]] está llena de salidas de herramientas, la [[glosario/compactacion|compactación]] ha resumido lo que no debía y las instrucciones del principio pesan cada vez menos.

Lo difícil es darse cuenta **a tiempo**, antes de que el error llegue al código. El harness del autor usa un truco barato: un [[glosario/canario-de-contexto|canario de contexto]]. Una instrucción en `CLAUDE.md` obliga a empezar cada respuesta con un prefijo fijo. Mientras el agente sigue las instrucciones de memoria, el prefijo está. Cuando desaparece, es la señal para cortar y empezar una sesión nueva con un traspaso.

## Ingredientes

- Claude Code con un `CLAUDE.md` en el proyecto ([[docs/claude-code/01-memoria-claude-md-y-agents-md]]).
- Un prefijo corto y raro: tu nombre seguido de un punto medio funciona bien (`<TU NOMBRE> ·`).
- Para el traspaso, una [[glosario/skill|skill]] que solo invoque la persona.

## Pasos

1. **Pon el canario lo primero de `CLAUDE.md`.** Arriba del todo, con la palabra `IMPORTANT`, sin ambigüedad y explicando que es una señal de control, para que el modelo no lo trate como un saludo opcional ni lo comente.

```markdown title="CLAUDE.md"
## Canario de contexto

IMPORTANT: empieza SIEMPRE cada respuesta con «<TU NOMBRE> ·», incluidas las
respuestas cortas y las que siguen a una herramienta. Es una señal de control
para el humano, no un saludo: no la expliques ni la omitas.
```

   Sustituye `<TU NOMBRE>` por el tuyo. Un prefijo propio es mejor que uno genérico («OK ·»), que el modelo podría producir por casualidad.

2. **Aprende a leer la señal.** Mientras todas las respuestas empiezan por el prefijo, sigue. La primera que llega sin él es el aviso: no esperes a la tercera. Es una señal heurística, no una medida: el prefijo puede faltar por otros motivos (un estilo de salida que reescribe las respuestas, una skill que comprime el texto) y estar presente aunque el agente ya haya olvidado algo. Úsalo como alarma temprana, junto con lo que ves.

   El canario es para la sesión principal, la que acumula contexto durante horas. En el harness del autor los [[glosario/subagente|subagentes]] se configuran para no cargar `CLAUDE.md`, así que sus informes no llevan el prefijo y tampoco lo necesitan: cada uno empieza con contexto limpio.

3. **Prepara el traspaso como skill solo humana.** Cuando salta el canario, no basta con `/clear`: perderías todo lo que solo existe en la conversación. La skill `new-session` del autor genera un prompt de traspaso con eso y lo guarda en disco. `disable-model-invocation: true` impide que el modelo la lance por su cuenta.

```markdown title=".claude/skills/new-session/SKILL.md"
---
name: new-session
description: Genera un prompt de traspaso para seguir en una sesión nueva con el contexto que no está en disco. La invoca el humano con /new-session cuando falla el canario.
disable-model-invocation: true
argument-hint: "[foco de la próxima sesión]"
---

# Traspaso de sesión

1. Recoge el estado real, sin suponer: el estado de las tareas activas (desde
   disco), `git status --porcelain`, `git log --oneline -5` y `date +%Y%m%d-%H%M`.
2. De la conversación, extrae solo lo que NO está en disco:
   - decisiones de la persona y su motivo;
   - preferencias y restricciones que ha expresado;
   - trabajo a medias (qué, archivo, en qué punto);
   - hallazgos separados en «verificado» (con su evidencia) y «sin verificar»;
   - lo descartado y por qué.
3. Lo que ya está en archivos, por ruta: no lo copies. Máximo unas 80 líneas.
4. Guárdalo en `.claude/handoff/<fecha>.md` y muéstralo entero en un bloque de código.
5. Termina con: «Abre una sesión nueva (/clear) y pega el prompt».

## Plantilla

<TU NOMBRE> · Continúo una sesión anterior.
## Objetivo · ## Estado · ## Decisiones (no reabrir) · ## Preferencias
## Trabajo a medias · ## Hallazgos (verificado / sin verificar) · ## Descartado
## Siguiente paso exacto · ## No hacer
Antes de actuar: comprueba que el estado coincide con este resumen y dime en
3 líneas qué vas a hacer.

## Límites

No cambies el estado de ninguna tarea. No inventes: lo que no puedas
comprobar va en «sin verificar». Nada de secretos en el traspaso.
```

   Tres decisiones de diseño que importan: el traspaso **empieza con el canario** (la sesión nueva arranca con el hábito puesto), separa lo verificado de lo supuesto (para que la sesión nueva no herede una hipótesis como si fuera un hecho) y termina pidiendo que el agente confirme el estado antes de actuar.

4. **Haz el corte.** Ejecuta `/new-session`, revisa el prompt (corrige lo que esté mal: es el único momento en que puedes hacerlo barato), abre la sesión nueva con `/clear` y pégalo. Añade `.claude/handoff/` a `.gitignore`: son notas de trabajo, no historia del proyecto.

5. **Opcional: mira cuándo se perdió.** Claude Code guarda cada sesión como JSONL en `~/.claude/projects/<ruta-del-proyecto-con-guiones>/`. Este script busca la primera respuesta sin prefijo; te sirve para saber, a posteriori, a qué altura de la sesión empieza a degradarse en tu proyecto.

```python title="canario.py"
#!/usr/bin/env python3
"""¿Cuándo dejó la sesión de empezar con el canario? Lee un transcript JSONL de Claude Code.

Uso: python3 canario.py <transcript.jsonl> "<TU NOMBRE> ·"
El transcript es un formato interno de Claude Code: si cambia, ajusta texto_de().
"""
import json
import sys


def textos(ruta: str):
    """Primer texto de cada mensaje del asistente de la sesión principal (sin subagentes)."""
    vistos = set()
    with open(ruta, encoding="utf-8", errors="replace") as f:
        lineas = f.readlines()
    for linea in lineas:
        try:
            r = json.loads(linea)
        except json.JSONDecodeError:
            continue
        m = r.get("message") or {}
        if r.get("type") != "assistant" or r.get("isSidechain") or m.get("id") in vistos:
            continue
        bloques = m.get("content") if isinstance(m.get("content"), list) else []
        texto = next((b.get("text", "") for b in bloques if b.get("type") == "text" and b.get("text", "").strip()), None)
        if texto is not None:  # las líneas con solo tool_use o thinking no son respuestas
            vistos.add(m.get("id"))
            yield r.get("timestamp", "?"), texto.lstrip()


def main(ruta: str, canario: str) -> int:
    respuestas = list(textos(ruta))
    fallos = [(i, ts, t) for i, (ts, t) in enumerate(respuestas, 1) if not t.startswith(canario)]
    print(f"{len(respuestas)} respuestas, {len(fallos)} sin canario")
    if fallos:
        i, ts, t = fallos[0]
        print(f"primera sin canario: n.º {i} ({ts}): {t[:60]!r}")
        print("señal: abre una sesión nueva con un traspaso (/new-session)")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
```

```python title="test_canario.py"
"""python3 -m unittest -v test_canario.py"""
import json
import tempfile
import unittest

import canario


def asistente(mid, texto=None, lateral=False):
    bloques = [{"type": "text", "text": texto}] if texto else [{"type": "tool_use", "id": "t1", "name": "Bash", "input": {}}]
    return {"type": "assistant", "isSidechain": lateral, "timestamp": mid, "message": {"id": mid, "content": bloques}}


class Canario(unittest.TestCase):
    def transcript(self, lineas):
        f = tempfile.NamedTemporaryFile("w", suffix=".jsonl", delete=False, encoding="utf-8")
        f.write("\n".join(json.dumps(x, ensure_ascii=False) for x in lineas) + "\n")
        f.close()
        return f.name

    def test_detecta_la_primera_respuesta_sin_prefijo(self):
        ruta = self.transcript([
            {"type": "user", "message": {"content": "empieza"}},
            asistente("m1", "Ana · Leo el estado."),
            asistente("m2"),                                  # solo tool_use: no es una respuesta
            asistente("m2", "Ana · El explorer ha terminado."),
            asistente("s1", "Informe del subagente", lateral=True),  # los subagentes no llevan canario
            asistente("m3", "He lanzado el builder."),
        ])
        self.assertEqual(["m3"], [ts for ts, t in canario.textos(ruta) if not t.startswith("Ana ·")])
        self.assertEqual(1, canario.main(ruta, "Ana ·"))

    def test_sesion_sana(self):
        ruta = self.transcript([asistente("m1", "Ana · hola"), asistente("m2", "  Ana · sigo")])
        self.assertEqual(0, canario.main(ruta, "Ana ·"))


if __name__ == "__main__":
    unittest.main()
```

## Cómo comprobar que funciona

En Claude Code, tras añadir el canario, haz una pregunta corta y otra que use una herramienta: las dos respuestas deben empezar por tu prefijo. El detector, sobre un transcript de ejemplo y con sus pruebas:

```text
$ python3 canario.py sesion.jsonl "Ana ·"
5 respuestas, 1 sin canario
primera sin canario: n.º 4 (2026-10-29T13:02:00Z): 'He lanzado el builder con ATTEMPT 2.'
señal: abre una sesión nueva con un traspaso (/new-session)
$ python3 -m unittest -v test_canario.py
test_detecta_la_primera_respuesta_sin_prefijo (test_canario.Canario.test_detecta_la_primera_respuesta_sin_prefijo) ... 3 respuestas, 1 sin canario
primera sin canario: n.º 3 (m3): 'He lanzado el builder.'
señal: abre una sesión nueva con un traspaso (/new-session)
ok
test_sesion_sana (test_canario.Canario.test_sesion_sana) ... 2 respuestas, 0 sin canario
ok

----------------------------------------------------------------------
Ran 2 tests in 0.012s

OK
```

Y la prueba que importa: la próxima vez que una sesión larga empiece a fallar, mira si el prefijo desapareció antes. Si siempre salta tarde, acorta tus sesiones o mueve más estado a disco.

## Variaciones

- **Estado en disco antes que memoria.** El canario es más útil cuanto menos dependa la sesión de la conversación: si el estado de cada tarea vive en archivos (como en [[sistemas/harness-sdd-claude-code]]), el traspaso es corto y casi todo son rutas.
- **Respetar el prefijo en otras piezas.** Si usas un estilo de salida o una skill que reescribe el formato de las respuestas, añádeles que conserven el prefijo; si no, el canario saltará en falso.
- **Recuperación de tareas.** Para una tarea interrumpida, el traspaso se complementa con una skill de reanudación que lee el estado y decide qué relanzar ([[cursos/harness-engineering/11-sesiones-largas]]).
- **Contexto más limpio desde el principio.** Delegar en subagentes las lecturas largas retrasa la saturación de la sesión principal ([[cursos/context-engineering/04-contexto-para-agentes-largos]]).

## Errores típicos

- **Ignorar el primer fallo.** «Ya lo hará en la siguiente» es justo cuando el agente empieza a mezclar decisiones. Corta en el primer aviso.
- **`/clear` sin traspaso.** Pierdes decisiones y descartes, y la sesión nueva repetirá lo que ya se probó.
- **Traspasos que copian archivos enteros.** Llenas la sesión nueva con lo que ya estaba en disco. Rutas, no contenido.
- **Dejar que el modelo invoque el traspaso.** Si la skill se dispara sola, puede cortar en mal momento o escribir traspasos que nadie revisa. Que sea solo humana.
- **Un prefijo largo o ambiguo.** Una frase entera molesta y cuesta tokens en cada respuesta; una palabra común aparece por casualidad.
