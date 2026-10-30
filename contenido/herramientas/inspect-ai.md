---
titulo: Inspect
descripcion: Framework del UK AI Security Institute para evals reproducibles de modelos y agentes, con sandbox, límites de tokens, tiempo y coste, y registro de cada ejecución.
creado: 2026-10-29
tags: [evals, agentes, sandbox]
relacionados: ["[[docs/modelos-abiertos/08-evals-abiertas]]", "[[cursos/evals-para-agentes/01-que-medir]]", "[[glosario/trayectoria]]"]
categoria: evals
licencia: MIT
open_source: true
lenguajes: [Python]
url: https://inspect.aisi.org.uk/
repositorio: https://github.com/UKGovernmentBEIS/inspect_ai
version: "0.3.286"
revisado: 2026-10-29
---

Inspect (paquete `inspect-ai`, MIT) es un framework de [[glosario/evals]] del UK AI Security Institute. Una eval es una `Task` con tres piezas: un *dataset* de `Sample`, unos *solvers* (lo que hace el modelo o el agente: mensaje de sistema, generación, uso de herramientas) y un *scorer* que puntúa. Cada ejecución queda en un registro que puedes inspeccionar después, paso a paso.

## Para qué sirve

- Evaluar **agentes**, no solo respuestas: herramientas ejecutadas en *sandbox* Docker y la [[glosario/trayectoria]] completa en el registro.
- Poner límites por tarea: `message_limit`, `token_limit`, `time_limit` y `cost_limit`, además de una política de aprobación (`approval=`).
- Comparar modelos de la API y locales con la misma tarea: proveedores `ollama/`, `vllm/`, `sglang/`, `llama_cpp_python/`, `openai_compatible/` y los comerciales.

## Cuándo usarla

Cuando necesitas evals reproducibles de agentes que ejecutan acciones, con aislamiento y límites, y quieres poder auditar qué pasó en cada muestra. Es la opción más completa para lo que plantea [[cursos/evals-para-agentes/01-que-medir]].

## Cuándo no

- Para un primer conjunto de casos de un *prompt*: [[herramientas/promptfoo]] es más rápido de montar.
- Si tus evals ya son tests de pytest: [[herramientas/deepeval]].
- Para benchmarks académicos de modelos base: no es su objetivo principal, y esos benchmarks no miden tu aplicación.

## Ejemplo mínimo

Comprobado con `inspect-ai` 0.3.286 y el modelo simulado `mockllm/model`: la tarea carga y arranca; la ejecución se cortó porque el entorno no tenía red para descargar el tokenizador. Está en un entorno aparte del de la web, por eso el bloque no se valida automáticamente.

```python nocheck title="tarea.py"
from inspect_ai import Task, task
from inspect_ai.dataset import Sample
from inspect_ai.scorer import includes
from inspect_ai.solver import generate, system_message

@task
def clasificar_tickets():
    return Task(
        dataset=[
            Sample(input="Me cobrasteis dos veces este mes", target="facturacion"),
            Sample(input="El paquete no ha llegado", target="envio"),
        ],
        solver=[system_message("Clasifica el ticket: facturacion, envio, devolucion u otro. Responde solo la categoría."),
                generate()],
        scorer=includes(),
        message_limit=4,  # límites de la tarea
    )
```

```bash
pip install inspect-ai
inspect eval tarea.py --model mockllm/model          # prueba la tarea sin modelo real
inspect eval tarea.py --model ollama/qwen3.6:27b     # con un modelo local
inspect view                                         # visor de los registros
```

`includes()` da por buena la muestra si la salida contiene el `target`. Para agentes, sustituye `generate()` por un *solver* con herramientas y añade `sandbox="docker"` a la `Task`, para que el código que ejecute el agente no toque tu máquina ([[glosario/sandbox]]).

> [!consejo] Empieza con el modelo simulado
> `mockllm/model` te deja comprobar que la tarea, el *dataset* y el *scorer* están bien antes de gastar tokens o GPU.

## Alternativas

- [[herramientas/promptfoo]]: YAML y CLI, más ligero.
- [[herramientas/deepeval]]: estilo pytest.
- [[herramientas/ragas]]: métricas específicas de RAG.

## Enlaces

- Documentación: [inspect.aisi.org.uk](https://inspect.aisi.org.uk/)
- Repositorio: [github.com/UKGovernmentBEIS/inspect_ai](https://github.com/UKGovernmentBEIS/inspect_ai)
