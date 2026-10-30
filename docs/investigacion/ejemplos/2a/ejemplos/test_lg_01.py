import os
import sqlite3
import tempfile

from langchain_core.messages import AIMessage
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.errors import GraphRecursionError
from langgraph.types import Command

from _fakes import guion, llamada
from lg_01_grafo_aprobacion import construir


def modelo_guion(final="Reembolso hecho."):
    return guion(
        AIMessage(content="", tool_calls=[llamada("ver_pedido", {"pedido_id": "P-1001"}, "c1")]),
        AIMessage(content="", tool_calls=[llamada("reembolsar", {"pedido_id": "P-1001", "importe_eur": 49.9}, "c2")]),
        AIMessage(content=final),
    )


db = os.path.join(tempfile.mkdtemp(), "agente.db")
for decision in ["aprobar", "rechazar"]:
    modelo = modelo_guion("Reembolso hecho." if decision == "aprobar" else "Entendido: no se reembolsa.")
    config = {"configurable": {"thread_id": "t-" + decision}, "recursion_limit": 25}
    # 1ª "sesión": se para en el interrupt y se cierra la conexión
    with SqliteSaver.from_conn_string(db) as cp:
        g = construir(modelo, cp)
        out = g.invoke({"messages": [("user", "Devolución P-1001")]}, config, version="v2")
        print(decision, "| interrupt:", out.interrupts[0].value, "| next:", g.get_state(config).next)
    # 2ª "sesión": otro checkpointer sobre el mismo archivo, reanuda con Command(resume=...)
    with SqliteSaver.from_conn_string(db) as cp:
        g = construir(modelo, cp)
        out = g.invoke(Command(resume=decision), config, version="v2")
        print("   tool msgs:", [(m.name, m.status, m.content[:45]) for m in out.value["messages"] if m.type == "tool"])
        print("   final:", out.value["messages"][-1].content, "| next:", g.get_state(config).next)

# invoke() sin version="v2" devuelve un dict con "__interrupt__"
g = construir(modelo_guion(), SqliteSaver(sqlite3.connect(db, check_same_thread=False)))
d = g.invoke({"messages": [("user", "x")]}, {"configurable": {"thread_id": "v1"}})
print("v1 keys:", list(d.keys()))

# recursion_limit como condición de parada
bucle = guion(*[AIMessage(content="", tool_calls=[llamada("ver_pedido", {"pedido_id": "P-1"}, f"x{i}")]) for i in range(50)])
try:
    construir(bucle).invoke({"messages": [("user", "x")]}, {"recursion_limit": 6})
except GraphRecursionError as e:
    print("GraphRecursionError:", str(e)[:90])

# streaming por nodos
g = construir(guion(AIMessage(content="", tool_calls=[llamada("ver_pedido", {"pedido_id": "P-1"}, "s1")]), AIMessage(content="fin")))
for parte in g.stream({"messages": [("user", "x")]}, stream_mode="updates"):
    print("update:", list(parte.keys()))
