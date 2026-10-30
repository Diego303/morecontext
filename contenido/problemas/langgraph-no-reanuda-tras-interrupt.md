---
titulo: LangGraph no reanuda tras un interrupt
descripcion: Por qué tu grafo de LangGraph vuelve a empezar, pide otra vez la aprobación o falla al reanudar tras interrupt(), y cómo arreglarlo con checkpointer, thread_id y Command(resume=…).
creado: 2026-10-29
sintoma: LangGraph no reanuda tras un interrupt
tema: agentes
nivel: intermedio
tags: [langgraph, interrupt, humano-en-el-bucle, checkpointer]
relacionados: ["[[cursos/langchain-y-langgraph/07-humano-en-el-bucle-con-interrupt]]", "[[recetas/aprobacion-humana-con-langgraph]]", "[[glosario/checkpointer]]", "[[docs/frameworks/05-langgraph]]"]
---

Tu grafo se para en el nodo de aprobación con `interrupt()`, el humano dice «aprobado» y, al reanudar, pasa una de estas cosas: el grafo vuelve a empezar desde el primer nodo y pide la aprobación otra vez; la salida trae de nuevo `__interrupt__`; o salta un error. Estos son los mensajes reales con `langgraph` 1.2.18:

```text
RuntimeError: Cannot use Command(resume=...) without checkpointer

ValueError: Checkpointer requires one or more of the following 'configurable' keys: thread_id, checkpoint_ns, checkpoint_id
```

## Causas

Reanudar significa cargar el estado guardado del punto exacto de la pausa. Para eso LangGraph necesita tres cosas, y falta alguna:

- **Sin [[glosario/checkpointer|checkpointer]].** Sin `compile(checkpointer=…)`, `interrupt()` sí pausa y devuelve `__interrupt__` (no da error), pero el estado no se guarda en ningún sitio. Al reanudar con `Command(resume=…)` salta el `RuntimeError` de arriba.
- **Sin `thread_id`, o con otro.** El estado se guarda bajo un `thread_id`. Si no lo pasas, el `ValueError`. Si reanudas con uno distinto (lo generas en cada petición HTTP, por ejemplo), LangGraph no encuentra nada y ejecuta el grafo desde el principio con un hilo nuevo, hasta la misma pausa.
- **Reanudar con una entrada normal.** `invoke({"decision": "ok"}, config)` no reanuda: lanza una ejecución nueva sobre el hilo, empieza en `START`, repite los nodos anteriores y vuelve a pararse en el `interrupt`.
- **Checkpointer en memoria entre procesos.** `InMemorySaver` desaparece al reiniciar el servidor o si cada petición crea el grafo con un saver nuevo.

Y una que confunde aunque todo esté bien: **al reanudar, el nodo que llamó a `interrupt()` se ejecuta otra vez desde su principio**. El código anterior al `interrupt` se repite; si envía un correo, lo envía dos veces.

## Cómo confirmarlo

Reproduje los cuatro casos con un grafo de dos nodos (`redactar` → `aprobar`) y comprobé qué hace cada uno. Para el tuyo, mira el estado del hilo antes de reanudar:

```python nocheck
estado = grafo.get_state({"configurable": {"thread_id": "ticket-123"}})
print(estado.next)          # ('aprobar',) si está en pausa; () si el hilo no existe o terminó
print(estado.interrupts)    # la pausa pendiente, con su valor
```

Si `next` sale vacío en el hilo que crees pausado, el estado no está ahí: checkpointer o `thread_id`.

## Arreglo

Checkpointer al compilar, el mismo `thread_id` en la pausa y en la reanudación, y `Command(resume=…)`:

```python title="aprobacion.py"
from typing import TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt


class Estado(TypedDict):
    borrador: str
    decision: str


def redactar(estado: Estado) -> dict:
    return {"borrador": "Reembolso de 40 €"}


def aprobar(estado: Estado) -> dict:
    # todo lo que haya antes de interrupt() se repite al reanudar: que sea idempotente
    decision = interrupt({"borrador": estado["borrador"]})
    return {"decision": decision}


g = StateGraph(Estado)
g.add_node("redactar", redactar)
g.add_node("aprobar", aprobar)
g.add_edge(START, "redactar")
g.add_edge("redactar", "aprobar")
g.add_edge("aprobar", END)
grafo = g.compile(checkpointer=InMemorySaver())        # en producción, SqliteSaver o PostgresSaver

config = {"configurable": {"thread_id": "ticket-123"}}  # el mismo id para pausar y para reanudar
salida = grafo.invoke({"borrador": "", "decision": ""}, config)
print(salida["__interrupt__"][0].value)                 # lo que ve el humano
print(grafo.invoke(Command(resume="aprobado"), config)) # reanuda en aprobar, no en START
```

```text
{'borrador': 'Reembolso de 40 €'}
{'borrador': 'Reembolso de 40 €', 'decision': 'aprobado'}
```

Si la aprobación puede tardar horas o sobrevivir a un reinicio, usa un checkpointer persistente: `SqliteSaver.from_conn_string("agente.db")` (es un gestor de contexto, úsalo con `with`) o `PostgresSaver`. Guarda el `thread_id` junto al ticket o la petición, para reanudar desde otro proceso ([[recetas/reanudar-un-agente-tras-un-reinicio]]).

Con `create_agent` y `HumanInTheLoopMiddleware` aplica lo mismo: el agente necesita `checkpointer=` y reanudas con `Command(resume=…)` en el mismo hilo ([[recetas/aprobacion-humana-con-langgraph]]).

## Cómo evitarlo

- Crea el grafo y el checkpointer una vez por proceso, no por petición.
- Deriva el `thread_id` de algo estable (el id del ticket, de la conversación) y regístralo.
- No envuelvas `interrupt()` en un `try/except` genérico: funciona lanzando una excepción especial.
- Pon los efectos (enviar, pagar) en el nodo siguiente al de la aprobación, no antes del `interrupt`.
- Prueba el flujo completo de pausa y reanudación con un modelo simulado en CI ([[recetas/probar-agentes-sin-api]]).

## Ver también

- [[cursos/langchain-y-langgraph/06-memoria-y-persistencia]]
- [[docs/agentes/03-humano-en-el-bucle]]
- [[glosario/ejecucion-duradera]]
- [[herramientas/langgraph]]
