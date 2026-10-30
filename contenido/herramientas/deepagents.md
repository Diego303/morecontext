---
titulo: Deep Agents
descripcion: El arnés abierto de LangChain para agentes de tareas largas, con archivos virtuales, subagentes con contexto limpio, resumen automático y skills.
creado: 2026-10-29
tags: [frameworks, agentes, harness, subagentes, python, open-source]
relacionados: ["[[docs/frameworks/10-deep-agents]]", "[[cursos/langchain-y-langgraph/09-deep-agents]]", "[[glosario/harness]]", "[[herramientas/langgraph]]"]
categoria: framework
licencia: MIT
open_source: true
lenguajes: [Python, TypeScript]
url: https://docs.langchain.com/oss/python/deepagents/overview
repositorio: https://github.com/langchain-ai/deepagents
version: "0.7.32"
revisado: 2026-10-29
---

Deep Agents (`deepagents`) es el [[glosario/harness|arnés]] de LangChain para agentes que trabajan mucho rato, al estilo de los agentes de código. Está construido con `create_agent` y middleware, así que por debajo es un grafo de [[herramientas/langgraph]].

**Licencia**: MIT, open source, en estado beta (clasificador «4 - Beta» en PyPI). También MIT: la versión JavaScript (`deepagents` 1.16.1 en npm) y el agente de terminal `deepagents-code`. Lo comercial: `managed-deepagents` despliega en un runtime gestionado de **LangSmith**, que es de pago.

## Para qué sirve

`create_deep_agent(...)` te da de serie:

- **Archivos virtuales** en el estado: `ls`, `read_file`, `write_file`, `edit_file`, `delete`, `glob` y `grep`. `execute` solo aparece con un *backend* de sandbox.
- **[[glosario/subagente|Subagentes]]** mediante la herramienta `task`, cada uno con su contexto limpio.
- **Resumen automático** al acercarse al límite de contexto y descarga a archivo de resultados muy grandes.
- *Skills* (`SKILL.md`), memoria (`AGENTS.md`) y caché de prompts de Anthropic.

## Cuándo usarla

Tareas largas y abiertas (investigación, análisis de un repositorio) donde compensa usar archivos como memoria de trabajo y delegar preguntas acotadas en subagentes.

## Cuándo no

- Tareas cortas: el arnés añade texto de sistema y herramientas en cada turno. LangChain midió unos 2 000 tokens de entrada base por turno con la 0.7, según su blog.
- Si quieres controlar exactamente qué herramientas ve el modelo: empieza por [[herramientas/langchain]].

## Ejemplo mínimo

```python title="deep_agent.py"
from deepagents import create_deep_agent
from langchain.agents.middleware import TodoListMiddleware
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.checkpoint.memory import InMemorySaver

MODEL = "anthropic:claude-sonnet-5-5"


@tool
def buscar_web(consulta: str) -> str:
    """Busca en la web y devuelve los 3 primeros resultados con título y URL."""
    return f"(resultados simulados para «{consulta}»)"   # aquí iría tu buscador real


INVESTIGADOR = {
    "name": "investigador",
    "description": "Investiga UNA pregunta concreta y devuelve hallazgos con fuentes.",
    "system_prompt": "Investiga solo la pregunta que te dan. Devuelve hallazgos breves, cada uno con su URL.",
    "tools": [buscar_web],
}

agente = create_deep_agent(
    model=init_chat_model(MODEL, max_tokens=4096),   # pásalo siempre: model=None está obsoleto
    tools=[buscar_web],
    system_prompt="Eres un analista. Delega preguntas acotadas con task y escribe el informe en /informe.md.",
    subagents=[INVESTIGADOR],
    middleware=[TodoListMiddleware()],               # desde la 0.7, write_todos no viene por defecto
    checkpointer=InMemorySaver(),
)
out = agente.invoke({"messages": [("user", "Compara LangGraph y Pydantic AI para aprobación humana.")]},
                    {"configurable": {"thread_id": "inv-1"}})
print(out["files"]["/informe.md"]["content"])        # los archivos virtuales viven en el estado
```

Lo ejecuté con un modelo simulado: el agente principal ve `task` y `write_todos`; el subagente, no. Cada archivo del estado es un dict con `content` y fechas, por eso el `["content"]` final.

> [!aviso] La documentación va por detrás del código
> Desde la 0.7 (julio de 2026) `write_todos` es opcional: añade `TodoListMiddleware()` si lo quieres. La página del *harness* todavía lo lista como incluido.

## Alternativas

- [[herramientas/claude-agent-sdk]]: el arnés de Claude Code como biblioteca (licencia comercial).
- [[herramientas/langgraph]] para orquestar subagentes con `Send` a tu manera.
- [[herramientas/smolagents]] si quieres agentes que actúan escribiendo código.

## Enlaces

- [Harness](https://docs.langchain.com/oss/python/deepagents/harness/index.html) · [Blog de la v0.7](https://langchain.com/blog/deep-agents-v0-7)
- [Repositorio](https://github.com/langchain-ai/deepagents) · [PyPI](https://pypi.org/project/deepagents/) · [npm](https://www.npmjs.com/package/deepagents)
- En MoreContext: [[docs/frameworks/10-deep-agents]] · [[sistemas/investigacion-multiagente]] · [[docs/agentes/02-subagentes]]
