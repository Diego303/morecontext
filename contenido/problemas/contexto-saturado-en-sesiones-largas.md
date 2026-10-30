---
titulo: "Sesiones largas: el agente olvida y se contradice"
descripcion: Por qué un agente que empezó bien olvida reglas y decisiones tras horas de trabajo, cómo detectarlo con un canario y cómo seguir con traspaso, notas en disco y subagentes.
creado: 2026-10-29
sintoma: "Sesiones largas: el agente olvida y se contradice"
tema: agentes
nivel: intermedio
tags: [contexto, sesiones-largas, compactacion, canario]
relacionados: ["[[recetas/canario-de-contexto]]", "[[cursos/harness-engineering/11-sesiones-largas]]", "[[glosario/context-rot]]", "[[cursos/context-engineering/04-contexto-para-agentes-largos]]"]
---

Las primeras horas fueron bien. Ahora el agente vuelve a explorar archivos que ya leyó, propone una solución que descartasteis hace una hora, se salta reglas de `CLAUDE.md` que cumplía al principio o afirma que un test pasa sin ejecutarlo. Nada falla de forma visible: responde con la misma seguridad de siempre. A veces, justo después de una compactación automática, parece otro agente.

## Causas

- **Contexto saturado.** Cada lectura de archivo, salida de test y resultado de herramienta se acumula. Con contextos largos el rendimiento baja aunque la información siga ahí ([[glosario/context-rot]]), y las instrucciones del principio pierden peso frente a cientos de miles de tokens de ruido.
- **Compactación agresiva.** Cuando el contexto se resume para hacer sitio, el resumen conserva lo que el resumidor cree importante. Las decisiones con su motivo, lo que se descartó y las preferencias del humano son lo primero que se pierde ([[glosario/compactacion]]).
- **La memoria vive en la conversación.** Si las decisiones solo están en el chat, cuando el chat se compacta o se corta, desaparecen.
- **Un solo agente lo hace todo.** Explorar, implementar y verificar en el mismo hilo llena el contexto de detalles que la siguiente fase no necesita.
- **La ventana se llenó.** En la API, si entrada más `max_tokens` no caben, la respuesta llega con `stop_reason: "model_context_window_exceeded"`.

## Cómo confirmarlo

Pon un [[glosario/canario-de-contexto|canario]]: una regla trivial y visible al principio de las instrucciones, como empezar cada respuesta con `<TU NOMBRE> ·`. Mientras aparece, el modelo sigue atendiendo a sus instrucciones; cuando deja de aparecer, sospecha del resto. Es una heurística, no una medida. En Claude Code va en `CLAUDE.md` ([[recetas/canario-de-contexto]]). En un agente propio, compruébalo en código junto con el tamaño del contexto:

```python title="vigilar_contexto.py"
import pathlib

import anthropic

MODEL = "claude-sonnet-5-5"
CANARIO = "<TU NOMBRE> ·"
UMBRAL = 200_000          # tokens de entrada a partir de los que traspasas (ajústalo con tus evals)
client = anthropic.Anthropic()

SYSTEM = f"""Empieza SIEMPRE cada respuesta con «{CANARIO}». Es una señal de control: no la expliques."""


def tokens_de_entrada(u) -> int:
    return u.input_tokens + (u.cache_read_input_tokens or 0) + (u.cache_creation_input_tokens or 0)


def turno(messages: list[dict]) -> tuple[str, list[str]]:
    resp = client.messages.create(model=MODEL, max_tokens=4096, system=SYSTEM, messages=messages)
    messages.append({"role": "assistant", "content": resp.content})
    texto = "".join(b.text for b in resp.content if b.type == "text")
    alertas = []
    if resp.stop_reason == "model_context_window_exceeded":
        alertas.append("ventana llena: la API cortó la respuesta")
    if not texto.startswith(CANARIO):
        alertas.append("canario caído: el modelo ha dejado de seguir el system")
    if (n := tokens_de_entrada(resp.usage)) > UMBRAL:
        alertas.append(f"{n} tokens de entrada: prepara el traspaso")
    return texto, alertas


def traspaso(resumen: str, ruta: str = "TRASPASO.md") -> list[dict]:
    """Guarda en disco lo que no está en disco y arranca una conversación nueva que lo lee."""
    pathlib.Path(ruta).write_text(resumen, encoding="utf-8")
    return [{"role": "user", "content": f"Continúas una sesión anterior. Lee esto antes de actuar:\n\n{resumen}"}]
```

Con el simulador, una respuesta sin prefijo y con 211 500 tokens de entrada devuelve las dos alertas: `canario caído…` y `211500 tokens de entrada: prepara el traspaso`. Cuidado: `input_tokens` solo cuenta lo que va después del último punto de caché; el tamaño real suma también los leídos y escritos en caché.

## Arreglo

- **Traspasa en lugar de seguir.** Cuando salta el canario, genera un [[glosario/traspaso-de-sesion|traspaso]]: decisiones (con su motivo), trabajo a medias, hallazgos verificados y sin verificar, lo descartado y el siguiente paso exacto. Lo que ya está en disco va como ruta, no copiado. Abre una sesión limpia con él ([[cursos/harness-engineering/11-sesiones-largas]]).
- **Notas en disco.** Que el agente escriba decisiones y progreso en un archivo (o con la herramienta de memoria) a medida que avanza. Así cualquier sesión puede retomar ([[recetas/reanudar-un-agente-tras-un-reinicio]]).
- **Subagentes para lo ruidoso.** Exploraciones, búsquedas y lecturas largas en un [[glosario/subagente|subagente]] que devuelve un resumen corto; el contexto principal solo recibe la conclusión ([[docs/agentes/02-subagentes]]).
- **Compactación controlada.** Si compactas, que sea con instrucciones de qué conservar, o en el servidor con `compact_20260112` y limpieza de resultados viejos de herramientas ([[recetas/compactacion-en-el-servidor]]).

## Cómo evitarlo

- Diseña para que el estado viva fuera de la conversación desde el principio ([[sistemas/agente-de-larga-duracion]]).
- Una tarea por sesión. Si cambias de tema, empieza otra.
- No metas en el contexto salidas enteras: resultados de herramientas recortados y paginados ([[cursos/context-engineering/02-que-meter-y-que-no]]).
- Vigila el tamaño del contexto en tus trazas igual que vigilas el coste.

## Ver también

- [[cursos/context-engineering/03-compactacion-y-memoria]]
- [[docs/contexto/05-compactacion-y-limpieza-en-el-servidor]]
- [[biblioteca/effective-harnesses]]
- [[problemas/el-modelo-ignora-instrucciones]]
