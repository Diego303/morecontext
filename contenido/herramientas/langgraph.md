---
titulo: LangGraph
descripcion: Runtime abierto de grafos con estado para agentes y workflows, con checkpoints, interrupciones para aprobación humana, reanudación y paralelismo.
creado: 2026-10-29
tags: [frameworks, agentes, grafos, python, typescript, open-source]
relacionados: ["[[docs/frameworks/05-langgraph]]", "[[cursos/langchain-y-langgraph/05-langgraph-estado-nodos-y-aristas]]", "[[herramientas/langchain]]", "[[recetas/aprobacion-humana-con-langgraph]]"]
categoria: framework
licencia: MIT
open_source: true
lenguajes: [Python, TypeScript]
url: https://docs.langchain.com/oss/python/langgraph/overview
repositorio: https://github.com/langchain-ai/langgraph
version: "1.2.18"
revisado: 2026-10-29
---

LangGraph es un runtime de [[glosario/grafo-de-estado|grafos de estado]]: nodos que son funciones, aristas fijas o condicionales y un estado tipado que se fusiona con reductores. Un [[glosario/checkpointer|checkpointer]] guarda el estado tras cada paso bajo un `thread_id`, y eso permite pausar, reanudar tras un fallo o volver atrás en el historial.

**Licencia**: MIT, open source, igual que los checkpointers y `langgraph-cli`. Lo que no es abierto: el servidor de despliegue `langgraph-api` (Agent Server) usa **Elastic-2.0**, una licencia que deja leer el código pero no es OSI y limita ofrecerlo como servicio; y **LangSmith**, donde se despliega y se trazan los grafos, es comercial. Versión JavaScript: `@langchain/langgraph` 1.5.3 (MIT).

## Para qué sirve

- Workflows que mezclan pasos deterministas y pasos agénticos.
- [[glosario/humano-en-el-bucle|Aprobación humana]] con `interrupt()` + `Command(resume=…)`, aunque la respuesta tarde días (con `SqliteSaver` o `PostgresSaver`).
- Paralelismo con `Send`, ciclos de evaluador-optimizador y subgrafos.
- Memoria a largo plazo con un *store* (`InMemoryStore`, `PostgresStore`).

## Cuándo usarla

Cuando el estado y su persistencia son parte del producto: reanudar, auditar cada paso, esperar a un humano. Es lo que tendrías que construir a mano sobre el SDK.

## Cuándo no

- Un agente simple con herramientas: `create_agent` de [[herramientas/langchain]] ya es ese grafo.
- Un encadenado de dos o tres llamadas: tres funciones normales se leen mejor ([[patrones/03-encadenado]]).

## Ejemplo mínimo

El bucle agéntico como grafo: modelo ⇄ herramientas, con checkpointer y tope de pasos.

```python title="grafo_minimo.py"
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.checkpoint.memory import InMemorySaver   # en producción: SqliteSaver / PostgresSaver
from langgraph.graph import START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

MODEL = "anthropic:claude-sonnet-5-5"


@tool
def ver_pedido(pedido_id: str) -> str:
    """Devuelve el estado de un pedido por su id (formato P-NNNN)."""
    return f'{{"id": "{pedido_id}", "estado": "entregado"}}'


TOOLS = [ver_pedido]
llm = init_chat_model(MODEL, max_tokens=1024).bind_tools(TOOLS)


def modelo(state: MessagesState):
    return {"messages": [llm.invoke(state["messages"])]}   # add_messages lo añade al historial


g = StateGraph(MessagesState)
g.add_node("modelo", modelo)
g.add_node("tools", ToolNode(TOOLS))
g.add_edge(START, "modelo")
g.add_conditional_edges("modelo", tools_condition)          # a "tools" si hay tool_calls; si no, END
g.add_edge("tools", "modelo")
grafo = g.compile(checkpointer=InMemorySaver())

config = {"configurable": {"thread_id": "ticket-1"}, "recursion_limit": 25}   # pon tú el tope de pasos
for paso in grafo.stream({"messages": [("user", "¿Cómo va P-1001?")]}, config, stream_mode="updates"):
    print(list(paso))                                        # ['modelo'], ['tools'], ['modelo']
```

Lo ejecuté con un modelo simulado: imprime `['modelo']`, `['tools']`, `['modelo']` y el estado del hilo queda guardado en el checkpointer.

> [!aviso] El límite por defecto no limita
> `recursion_limit` vale 10007 por defecto en la 1.2.18: en la práctica no hay tope. Ponlo siempre. Y recuerda que, al reanudar tras `interrupt()`, el nodo se ejecuta otra vez desde el principio: lo que va antes debe poder repetirse sin efectos.

## Alternativas

- [[herramientas/langchain]] para el agente estándar sin grafo explícito.
- [[herramientas/pydantic-ai]] con `pydantic-graph` y ejecución duradera sobre Temporal.
- [[herramientas/llamaindex]] (Workflows por eventos) o [[herramientas/microsoft-agent-framework]] (`WorkflowBuilder`).
- [[herramientas/deepagents]] para tareas largas construidas sobre LangGraph.

## Enlaces

- [Interrupciones](https://docs.langchain.com/oss/python/langgraph/interrupts) · [Changelog](https://docs.langchain.com/oss/python/langchain/changelog-py) · [Anuncio de la 1.0](https://www.langchain.com/blog/langchain-langgraph-1dot0)
- [Repositorio](https://github.com/langchain-ai/langgraph) · [PyPI](https://pypi.org/project/langgraph/) · [npm](https://www.npmjs.com/package/@langchain/langgraph)
- En MoreContext: [[docs/frameworks/05-langgraph]] · [[recetas/reanudar-un-agente-tras-un-reinicio]] · [[recetas/map-reduce-con-send]]
