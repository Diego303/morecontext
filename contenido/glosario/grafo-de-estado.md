---
titulo: Grafo de estado
descripcion: Forma de definir un agente o flujo como nodos que leen y actualizan un estado compartido, unidos por aristas fijas o condicionales; es el modelo de LangGraph.
creado: 2026-10-29
categoria: agentes
ingles: State graph
aliases: [state graph, StateGraph, grafo de LangGraph]
tags: [agentes, langgraph, frameworks]
relacionados: ["[[cursos/langchain-y-langgraph/05-langgraph-estado-nodos-y-aristas]]", "[[docs/frameworks/05-langgraph]]", "[[glosario/checkpointer]]", "[[glosario/workflow]]"]
---

Un grafo de estado describe un flujo como **nodos** (funciones) que reciben un estado compartido y devuelven una actualización parcial, unidos por **aristas** que dicen qué nodo va después. Es la abstracción central de LangGraph (`StateGraph`).

## En la práctica

Los **reductores** deciden cómo se combina cada actualización con el estado: `add_messages` añade mensajes en lugar de sustituirlos. Las aristas condicionales (`add_conditional_edges`) eligen el siguiente nodo según el estado, y un ciclo modelo → herramientas → modelo es el [[glosario/bucle-agentico]] de siempre, solo que explícito:

```python title="grafo.py"
from typing import TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph


class Estado(TypedDict):
    pasos: int


def contar(estado: Estado) -> dict:
    return {"pasos": estado["pasos"] + 1}  # actualización parcial


g = StateGraph(Estado)
g.add_node("contar", contar)
g.add_edge(START, "contar")
g.add_edge("contar", END)
grafo = g.compile(checkpointer=InMemorySaver())

config = {"configurable": {"thread_id": "t1"}}
print(grafo.invoke({"pasos": 0}, config))  # {'pasos': 1}
```

Úsalo cuando necesites controlar cada paso: tramos fijos mezclados con tramos agénticos, aprobaciones que tardan o reanudar tras una caída con un [[glosario/checkpointer]]. Fija tú el límite de pasos: el `recursion_limit` por defecto es muy alto.

## No confundir con

- **[[glosario/graphrag]]**: un grafo de conocimiento para recuperar información.
- **Máquina de estados del harness**: fases y transiciones con guards; la idea es parecida, pero ahí los nodos son fases de trabajo, no llamadas.

## Ver también

- [[recetas/map-reduce-con-send]]
- [[recetas/maquina-de-estados-con-guards]]
- [[herramientas/langgraph]]
