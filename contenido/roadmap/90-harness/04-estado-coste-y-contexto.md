---
titulo: Estado, coste y contexto
descripcion: Guarda el estado en disco con un solo escritor, reanuda tras una interrupción, mide el coste leyendo los transcripts, pon un presupuesto y mantén pequeño el contexto de cada agente.
creado: 2026-10-29
orden: 4
minutos: 30
tipo: teoria
objetivos:
  - Explicar por qué el estado de un agente vive en disco y tiene un único escritor.
  - Seguir un procedimiento para reanudar una tarea interrumpida sin reconstruir la conversación.
  - Calcular el uso de tokens de una sesión a partir de su transcript, contando cada mensaje una vez.
  - Aplicar tres técnicas para mantener mínimo el contexto de cada agente y saber cuándo traspasar la sesión.
requiere: ["[[roadmap/90-harness/03-permisos-y-hooks]]"]
tags: [harness, estado, costes, contexto]
relacionados: ["[[cursos/harness-engineering/10-coste-y-presupuesto]]", "[[cursos/harness-engineering/11-sesiones-largas]]", "[[glosario/traspaso-de-sesion]]", "[[recetas/coste-por-subagente]]", "[[cursos/context-engineering/04-contexto-para-agentes-largos]]"]
---

Al terminar esta lección sabrás qué tiene que sobrevivir a una sesión de un agente, cómo retomarla si se corta, cuánto ha costado leyendo los propios registros de la herramienta y cómo evitar que el contexto se llene de ruido. Son las tres piezas que convierten un agente de una tarde en uno que trabaja días sobre un repositorio.

## La idea

La ventana de contexto no es memoria de trabajo para horas. Se llena, se compacta y, con una interrupción, desaparece. Todo lo que importe para continuar tiene que estar **fuera del modelo**: en archivos, en git y en un registro de eventos. Y lo que está fuera tiene que ser **coherente**, porque varios procesos (el agente, sus subagentes, tus scripts) lo tocan.

## Estado en disco y un solo escritor

En el harness del autor, cada funcionalidad tiene una carpeta con su estado:

| Archivo | Qué guarda | Quién lo escribe |
|---|---|---|
| `state.yaml` | Fase actual, intentos, decisión de la puerta, siguiente acción | Solo el motor de estado |
| `event.log` | Una línea JSON por evento (transiciones, fin de cada subagente con su coste) | El motor y el hook de coste, solo añadiendo |
| `SDD/…` | La spec | El agente de diseño |
| `implementation.md`, `verification.md`… | Informes de cada fase | El agente de esa fase |

Dos reglas hacen que funcione:

1. **Un solo escritor por artefacto.** Si dos procesos pueden escribir `state.yaml`, tarde o temprano uno pisa al otro y nadie sabe cuál es la verdad. El modelo no edita el estado: pide una transición y un script la aplica (o la rechaza sin escribir nada). El hook de seguridad de la lección 3 es el que lo hace cumplir.
2. **El registro solo crece.** `event.log` es JSONL de solo añadir: no se reescribe para ocultar una inconsistencia. Es la memoria auditable de lo que pasó.

Anthropic llega a lo mismo por otro camino en su arnés para tareas largas: un archivo de progreso, git como historial y una lista de funcionalidades en **JSON** en la que el agente solo puede cambiar `passes` de `false` a `true`. Eligieron JSON porque el modelo lo reescribe menos que un Markdown. El patrón está en [[patrones/10-inicializador-y-agente-de-trabajo]].

## Reanudar tras una interrupción

Con el estado en disco, reanudar es un procedimiento, no un acto de memoria. El del autor (su skill `feature-resume`):

1. Lee el estado y pasa el validador. Si hay errores, se resuelven antes de avanzar.
2. Mira los últimos eventos: última transición y último fin de cada agente.
3. Si hay un **bloqueo activo** reciente, otra sesión puede estar trabajando: pregunta. Si es antiguo, pide confirmación para tomarlo.
4. Si hay una **puerta pendiente**, nunca se da por aprobada: espera a la persona.
5. Si una fase se cortó sin terminar, se relanza con la misma cabecera e intento; si terminó, se aplica su transición y las comprobaciones deciden.
6. Nunca se concede por esta vía un intento extra que debía decidir una persona.

La clave es el paso 5: el registro dice si el agente de una fase llegó a terminar. Sin ese dato, reanudar es adivinar.

## Medir el coste por transcript

Claude Code guarda cada sesión como un archivo JSONL en `~/.claude/projects/<ruta-del-proyecto>/<sesión>.jsonl`, y los subagentes en `<sesión>/subagents/agent-<id>.jsonl`. Las líneas de tipo `assistant` llevan `message.id`, `message.model` y `message.usage` con los mismos campos que la API: `input_tokens`, `output_tokens`, `cache_creation_input_tokens` y `cache_read_input_tokens`. El hook recibe la ruta en `transcript_path`.

Hay una trampa: **un mismo mensaje aparece en varias líneas** (una por bloque de contenido, con el mismo `message.id`), y en las primeras `output_tokens` aún no es el final. Si sumas todas las líneas, cuentas de más. Cuenta cada mensaje una vez, quedándote con la línea de más salida:

```python title="uso.py"
import json
import sys
from pathlib import Path

CAMPOS = ("input_tokens", "output_tokens", "cache_creation_input_tokens", "cache_read_input_tokens")

def uso_de_sesion(transcript: Path) -> dict[str, int]:
    """Suma el usage de cada mensaje del asistente una sola vez."""
    por_mensaje: dict[str, dict] = {}
    for linea in transcript.open(encoding="utf-8"):
        registro = json.loads(linea)
        mensaje = registro.get("message") or {}
        if registro.get("type") != "assistant" or "usage" not in mensaje:
            continue
        uso, previo = mensaje["usage"], por_mensaje.get(mensaje["id"])
        if previo is None or uso["output_tokens"] >= previo["output_tokens"]:
            por_mensaje[mensaje["id"]] = uso  # la última línea del mensaje trae el output final
    return {c: sum(u.get(c, 0) for u in por_mensaje.values()) for c in CAMPOS}

if __name__ == "__main__":
    print(uso_de_sesion(Path(sys.argv[1])))
```

Con un transcript de muestra de cuatro líneas, en el que `msg_01` aparece dos veces (un bloque de texto y una llamada a herramienta):

```text
$ python3 uso.py muestra.jsonl
{'input_tokens': 8, 'output_tokens': 125, 'cache_creation_input_tokens': 9600, 'cache_read_input_tokens': 9000}
```

Fíjate en que casi toda la entrada va por caché: es lo normal en un agente de código, y por eso el coste no se calcula solo con `input_tokens`. Para pasar a dinero:

- **Una tarifa por categoría y por modelo**: entrada, salida, escritura en caché (que cuesta distinto si es de 5 minutos o de 1 hora; el detalle viene en `usage.cache_creation`) y lectura de caché. Cópialas de la página oficial de precios y anota la fecha: cambian.
- **Un modelo sin precio es un error, no un cero.** El harness del autor bloquea el trabajo nuevo si aparece un modelo que no está en su tabla: sin precio no hay control.

## Presupuesto

Un presupuesto útil tiene tres estados, como en el harness del autor: `BUDGET_OK`, `BUDGET_WARN` (por encima del aviso: sigue y avisa) y `BUDGET_EXCEEDED` (por encima del límite: **no se lanza trabajo nuevo** y decide una persona). Lo que se bloquea es el trabajo nuevo, no lo que está a medias. En la lección 5 lo implementas dentro del hook `PreToolUse`: si el presupuesto está agotado, cualquier herramienta recibe `deny`.

El Claude Agent SDK y `claude -p` ofrecen además un tope en dólares por ejecución (`max_budget_usd`, `--max-budget-usd`). Úsalo. Un presupuesto propio añade lo que ese tope no sabe: un límite por tarea a lo largo de varias sesiones, un aviso antes de llegar y una línea en tu registro.

## Contexto mínimo por agente

Cada token que entra cuesta dinero, latencia y atención. Chroma midió en 18 modelos que el rendimiento cae al crecer la entrada incluso en tareas sencillas ([[glosario/context-rot]]). Tres prácticas del harness del autor:

1. **Subagentes con contexto limpio.** Cada fase arranca sin la conversación anterior y lee solo su contrato y sus archivos. El orquestador conoce el flujo pero no el código; cada subagente conoce el código de su fase pero no el flujo.
2. **Informes, no artefactos.** El orquestador lee el informe de retorno de cada subagente (resultado, siguiente paso, bloqueos, alertas de seguridad) y el estado. Abre un artefacto solo para tomar una decisión concreta.
3. **Pasar por referencia.** Se pasa la ruta de un archivo, no su contenido. Lo que se aprende se escribe en disco y el siguiente agente lo lee si lo necesita.

Y las instrucciones, cortas: OpenAI mantiene su `AGENTS.md` en unas cien líneas que funcionan como índice hacia `docs/`.

## Compactación y traspaso de sesión

Cuando la conversación se acerca al límite, la herramienta [[glosario/compactacion|compacta]]: resume lo anterior y sigue. Es cómodo y pierde detalle. El mantenedor de Spec Kit observó que la fiabilidad baja después de compactar, y Anthropic contó en marzo de 2026 que con algunos modelos necesitaba *context resets* (ventana nueva con un traspaso estructurado) en lugar de compactar, y con otros más recientes ya no.

El harness del autor detecta la saturación con un **[[glosario/canario-de-contexto|canario]]**: una instrucción en `CLAUDE.md` pide empezar cada respuesta con una marca fija, por ejemplo `<TU NOMBRE> ·`. Cuando el agente deja de ponerla, las instrucciones del principio ya no pesan lo suficiente: es hora de cambiar de sesión. Entonces una skill escribe un **[[glosario/traspaso-de-sesion|traspaso]]** en un archivo (qué tarea, en qué fase, qué decisiones, qué falta) y lo pegas en una sesión nueva. Como el estado ya está en disco, el traspaso es corto. Lo tienes en [[recetas/canario-de-contexto]] y en [[cursos/harness-engineering/11-sesiones-largas]].

## Errores frecuentes

- Dejar que el modelo edite el archivo de estado «porque es más rápido».
- Sumar todas las líneas del transcript y contar mensajes varias veces.
- Calcular el coste solo con `input_tokens` y olvidar la caché.
- Tratar un modelo sin precio como gratis.
- Pasar a cada subagente la conversación entera «por si acaso».

## Ejercicio

> [!ejercicio] Cuánto costó tu última sesión
> Busca el transcript de tu última sesión de Claude Code en `~/.claude/projects/`. Ejecuta `uso.py` sobre él y sobre los de sus subagentes, si los hay. Después multiplica cada categoría por las tarifas oficiales actuales del modelo y anota la fecha de esas tarifas.
>
> **Está bien si**: el script no cuenta dos veces ningún `message.id` (compruébalo contando ids distintos), separas el coste de la sesión principal del de los subagentes y puedes decir qué fracción de la entrada fue lectura de caché.

> [!ejercicio]- Pistas
> Para contar ids distintos, añade a `uso.py` un `print(len(por_mensaje))` antes del `return` y compáralo con el número de líneas `assistant` del archivo. Los transcripts de subagentes están en la carpeta con el nombre de la sesión, dentro de `subagents/`.

## Resumen

- El estado vive en disco, con un solo escritor por artefacto y un registro que solo crece.
- Reanudar es un procedimiento: estado, validador, últimos eventos, bloqueos y puertas que nunca se infieren.
- El coste sale de los transcripts, contando cada mensaje una vez y con la caché separada.
- Un presupuesto tiene aviso y límite, y un modelo sin precio bloquea.
- Contexto mínimo por agente; cuando se satura, traspaso a una sesión nueva.

## Para seguir

- [[roadmap/90-harness/05-un-harness-minimo]]
- [[cursos/harness-engineering/10-coste-y-presupuesto]]
- [[problemas/contexto-saturado-en-sesiones-largas]]
- [[sistemas/agente-de-larga-duracion]]
