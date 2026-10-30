---
titulo: Deep Agents
descripcion: "Referencia de Deep Agents 0.7, el harness de LangChain para tareas largas: create_deep_agent, archivos virtuales y backends, subagentes con task, resumen, caché y coste por turno."
creado: 2026-10-29
orden: 10
nivel: avanzado
tags: [frameworks, deepagents, langchain, harness, subagentes, open-source]
relacionados: ["[[herramientas/deepagents]]", "[[cursos/langchain-y-langgraph/09-deep-agents]]", "[[glosario/harness]]", "[[cursos/harness-engineering/index]]"]
---

**Deep Agents** (`deepagents` 0.7.32, 23 de octubre de 2026, licencia **MIT**, en beta) es el [[glosario/harness|harness]] de LangChain para agentes que trabajan mucho rato en tareas abiertas: investigar, analizar un repositorio, redactar un informe largo. Copia las ideas de los agentes de código: un sistema de archivos como memoria de trabajo, [[glosario/subagente|subagentes]] con contexto limpio, resumen automático del historial y caché de prompts. Por dentro es un `create_agent` de [[docs/frameworks/04-langchain|LangChain]] con una pila de [[glosario/middleware|middleware]], así que el resultado es un grafo de [[docs/frameworks/05-langgraph|LangGraph]] con checkpoints, streaming e interrupciones.

Lo comercial es aparte: `managed-deepagents` despliega el agente en un runtime gestionado de **LangSmith**, que es de pago. Todo lo que sigue funciona sin él.

## Qué te da `create_deep_agent`

```text
create_deep_agent(model=None, tools=None, system_prompt=None, middleware=(), subagents=None, skills=None,
                  memory=None, permissions=None, backend=None, interrupt_on=None, response_format=None,
                  state_schema=None, context_schema=None, checkpointer=None, store=None, debug=False, name=None)
```

Sin que hagas nada, el agente recibe:

| Pieza | Qué es |
|---|---|
| `ls`, `read_file`, `write_file`, `edit_file`, `delete`, `glob`, `grep` | Herramientas de archivos sobre el *backend* configurado |
| `execute` | Comandos de shell, solo si el backend es un *sandbox* |
| `task` | Delegar en un subagente, con un `general-purpose` por defecto |
| `SummarizationMiddleware` | Resume el historial al acercarse al límite de contexto (por defecto, al 85 %) |
| Descarga de resultados grandes | Los resultados de herramienta muy largos (más de 20 000 tokens) van a un archivo y el modelo recibe la ruta |
| `AnthropicPromptCachingMiddleware` | Siempre en la pila; con modelos que no son de Anthropic no hace nada |
| `skills`, `memory` | *Skills* (`SKILL.md`) y memoria tipo `AGENTS.md` si los pasas ([[glosario/skill]], [[glosario/agents-md]]) |
| `interrupt_on` | Aprobación humana por herramienta, con el formato de `HumanInTheLoopMiddleware` |

`tools=` **añade** a esa lista, nunca quita. Para dejar de ofrecer una herramienta incluida hay perfiles de harness (`HarnessProfile` con `excluded_tools`).

## Cambios de la 0.7 (julio de 2026)

- **`write_todos` ya no viene por defecto.** La lista de tareas pasó a ser opcional porque, según el blog de LangChain, sus evals no mostraban una mejora significativa. Si la quieres, añade `TodoListMiddleware()`. La página del harness en la documentación todavía la lista como incluida: fíate del código.
- El prompt de sistema base queda **vacío**: el modelo recibe tu `system_prompt` y poco más.
- `write_file` sobrescribe, y hay una herramienta `delete` nueva.
- `FilesystemBackend` y `LocalShellBackend` pasan a `virtual_mode=True` por defecto.
- Desaparecen las *factories* de backend: pasas instancias.
- `model=None` está obsoleto desde la 0.5.3 (hoy caería en `claude-sonnet-4-6`). Pasa siempre el modelo.

## Ejemplo: un analista con un investigador

```python title="deep_agent.py"
from deepagents import create_deep_agent
from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
from langchain.agents.middleware import TodoListMiddleware
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.store.memory import InMemoryStore

MODEL = "anthropic:claude-sonnet-5-5"     # local: "ollama:qwen3" (con contexto amplio)


@tool
def buscar_web(consulta: str) -> str:
    """Busca en la web y devuelve los 3 primeros resultados con título y URL."""
    return f"(resultados simulados para «{consulta}»)"   # aquí iría tu buscador real


INVESTIGADOR = {
    "name": "investigador",
    "description": "Investiga UNA pregunta concreta y devuelve hallazgos con fuentes. Dale una pregunta acotada.",
    "system_prompt": "Investiga solo la pregunta que te dan. Devuelve hallazgos breves, cada uno con su URL.",
    "tools": [buscar_web],
}

# Archivos: por defecto viven en el estado del hilo; lo que se escriba bajo /memoria/ va al store
# y sobrevive entre conversaciones.
archivos = CompositeBackend(
    default=StateBackend(),
    routes={"/memoria/": StoreBackend(namespace=lambda runtime: ("memoria",))},
)


def crear_agente(model=None):
    return create_deep_agent(
        model=model or init_chat_model(MODEL, max_tokens=4096),   # pásalo siempre: model=None está obsoleto
        tools=[buscar_web],
        system_prompt="Eres un analista. Planifica con write_todos, delega preguntas acotadas "
                      "con task y escribe el informe final en /informe.md.",
        subagents=[INVESTIGADOR],
        middleware=[TodoListMiddleware()],       # desde la 0.7, write_todos no viene por defecto
        backend=archivos,
        store=InMemoryStore(),                   # en producción, PostgresStore
        checkpointer=InMemorySaver(),
    )


if __name__ == "__main__":
    out = crear_agente().invoke(
        {"messages": [("user", "Compara LangGraph y Pydantic AI para agentes con aprobación humana.")]},
        {"configurable": {"thread_id": "inv-1"}})
    print(out["files"]["/informe.md"])          # el sistema de archivos virtual vive en el estado
```

Ejecutado con un [[glosario/modelo-simulado|modelo simulado]] que planifica, delega con `task`, escribe el informe y termina:

```text
# salida de ejemplo (resumida de la ejecución real)
herramientas del agente principal: buscar_web, delete, edit_file, glob, grep, ls, read_file, task, write_file, write_todos
herramientas del subagente:        buscar_web, delete, edit_file, glob, grep, ls, read_file, write_file
files: {'/informe.md': '# Informe\nLangGraph: interrupt().'}
final: Informe escrito en /informe.md
```

Dos cosas que conviene ver en esa salida. El subagente no tiene `task` ni `write_todos`: no puede delegar a su vez. Y `execute` no aparece en ninguno, porque `StateBackend` no es un sandbox. En una segunda prueba, un hilo escribió `/memoria/prefs.md` y otro hilo distinto lo leyó: la ruta `/memoria/` va al store, el resto queda en el estado de cada conversación.

### Subagentes

Un `SubAgent` es un dict con `name` y `description` obligatorios, y opcionalmente `system_prompt`, `tools`, `model`, `middleware`, `interrupt_on`, `skills`, `permissions` y `response_format`. La `description` es lo que lee el agente principal para decidir a quién delegar: escríbela como la de una herramienta ([[disciplinas/diseno-de-herramientas]]). El subagente arranca con contexto limpio y devuelve solo su respuesta final, que es justo lo que protege el contexto del principal ([[docs/agentes/02-subagentes]]). Si ya tienes un grafo compilado, pásalo como `CompiledSubAgent`; para subagentes remotos en segundo plano existe `AsyncSubAgent`.

### Backends

| Backend | Dónde viven los archivos |
|---|---|
| `StateBackend()` (por defecto) | En el estado del hilo: desaparecen con la conversación salvo que haya checkpointer |
| `StoreBackend(namespace=…)` | En el store de LangGraph: compartidos entre hilos |
| `FilesystemBackend(root_dir=…)` | En disco, dentro de `root_dir` (con `virtual_mode=True`, rutas confinadas a esa carpeta) |
| `LocalShellBackend(root_dir=…)` | Disco más `execute` en tu máquina, **sin aislamiento** |
| `CompositeBackend(default, routes={…})` | Combina los anteriores por prefijo de ruta |
| `LangSmithSandbox`, `ContextHubBackend` | Sandbox y almacenamiento de LangSmith (servicio comercial) |

> [!peligro] Shell local es tu máquina
> `LocalShellBackend` ejecuta lo que el modelo pida con tus permisos. Úsalo solo dentro de un contenedor o una máquina virtual desechable; un `root_dir` no es un sandbox ([[glosario/sandbox]], [[cursos/seguridad-y-prompt-injection/04-permisos-y-sandbox]]).

## Coste por turno

Todo lo que el harness hace por ti viaja en cada llamada: definiciones de herramientas, instrucciones de los middleware, la lista de subagentes. LangChain midió para la 0.7 unos 2 000 tokens de entrada base por turno, frente a unos 6 000 en la 0.6, según su blog. Con la caché de prompts de Anthropic activa, ese prefijo fijo se cobra a precio de lectura de caché a partir de la segunda llamada ([[docs/contexto/02-prompt-caching]]), pero sigue ocupando contexto.

Consecuencias prácticas:

- Para tareas cortas (una pregunta, dos herramientas) no compensa: un `create_agent` sin más es más barato y más predecible.
- Mide el coste de cada subagente por separado ([[recetas/coste-por-subagente]]); un `task` mal acotado multiplica el gasto.
- Fija `max_tokens` en el modelo y un tope de pasos ([[roadmap/40-primer-agente/03-condiciones-de-parada]]).

## `deepagents-code` y otros paquetes

- **`deepagents-code`** (0.2.2, MIT): un agente de código en terminal construido con Deep Agents. Es una referencia abierta útil para ver un harness completo ([[sistemas/agente-de-codigo]]).
- **`deepagents-cli`** está marcado como obsoleto («final release»): no lo uses en proyectos nuevos.
- **`managed-deepagents`** (`mda`): la herramienta es MIT, pero despliega en LangSmith, que es comercial.
- **`deepagents` para JavaScript** (1.16.2 en npm) sigue la misma idea ([[docs/frameworks/11-agentes-en-typescript]]).
- `RubricMiddleware` (en beta) evalúa la salida contra una rúbrica, al estilo del [[patrones/07-evaluador-optimizador|evaluador-optimizador]].

## Relación con el harness engineering

Deep Agents es una respuesta concreta a la pregunta que trata [[cursos/harness-engineering/index]]: qué piezas rodean al modelo para que aguante horas. Archivos como memoria externa, subagentes con contexto propio, resumen al llenarse la ventana ([[glosario/compactacion]]), descarga de resultados grandes, permisos y aprobación. Si construyes tu propio harness, léelo como inventario de piezas: cada una tiene un coste en tokens y en complejidad, y la 0.7 quitó la lista de tareas porque no ganaba lo que costaba. Esa es la lección: añade una pieza cuando una eval diga que hace falta ([[cursos/harness-engineering/03-las-quince-piezas]]).

## Cuándo usarlo

- Sí: investigación y análisis largos, tareas en las que el agente necesita escribir notas y volver a ellas, delegación a especialistas con contexto limpio.
- No: tareas cortas, flujos con pasos fijos (mejor un grafo de LangGraph), o cuando quieres controlar exactamente qué herramientas y qué texto ve el modelo.

## Errores frecuentes

- Esperar `write_todos` sin añadir `TodoListMiddleware()`.
- Pasar `model=None` y acabar en un modelo antiguo.
- Usar `LocalShellBackend` fuera de un entorno aislado.
- Buscar los archivos en disco cuando el backend es `StateBackend`: están en `out["files"]`.
- Subagentes con descripciones vagas: el principal delega mal o no delega.

## Ver también

- [[cursos/langchain-y-langgraph/09-deep-agents]]: la lección del curso.
- [[sistemas/investigacion-multiagente]]: el mismo problema sin framework.
- [[docs/frameworks/02-equivalencias]]: subagentes y orquestador en otros frameworks.
- [[herramientas/deepagents]]: ficha del directorio.
