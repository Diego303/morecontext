"""LangGraph 1.x · el bucle agéntico como grafo explícito, con un nodo de
aprobación humana antes de las herramientas que modifican algo.

    modelo ──(tool_calls)──> aprobar ──> herramientas ──> modelo
       └──(sin tool_calls)──> END

pip install -U langgraph langgraph-checkpoint-sqlite langchain-anthropic
"""
from langchain.chat_models import init_chat_model
from langchain.messages import SystemMessage, ToolMessage
from langchain.tools import tool
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from langgraph.types import Command, interrupt

MODEL = "anthropic:claude-sonnet-5-5"
SENSIBLES = {"reembolsar"}                     # herramientas que necesitan aprobación


@tool
def ver_pedido(pedido_id: str) -> str:
    """Devuelve estado e importe de un pedido por su id (formato P-NNNN)."""
    return '{"id": "%s", "estado": "entregado", "importe_eur": 49.90}' % pedido_id


@tool
def reembolsar(pedido_id: str, importe_eur: float) -> str:
    """Emite un reembolso. Acción irreversible: solo tras confirmar el pedido con ver_pedido."""
    return f"Reembolso de {importe_eur} € emitido para {pedido_id}."


TOOLS = [ver_pedido, reembolsar]
SYSTEM = SystemMessage("Eres un agente de soporte. Antes de reembolsar, comprueba el pedido.")


def construir(modelo=None, checkpointer=None):
    llm = (modelo or init_chat_model(MODEL, max_tokens=2048)).bind_tools(TOOLS)

    def llamar_modelo(state: MessagesState):
        respuesta = llm.invoke([SYSTEM, *state["messages"]])
        return {"messages": [respuesta]}           # add_messages lo añade al historial

    def decidir(state: MessagesState):
        return "aprobar" if state["messages"][-1].tool_calls else END

    def aprobar(state: MessagesState):
        llamadas = state["messages"][-1].tool_calls
        pendientes = [c for c in llamadas if c["name"] in SENSIBLES]
        if not pendientes:
            return Command(goto="herramientas")
        # Pausa el grafo. El valor viaja al llamante en __interrupt__ / .interrupts.
        # Al reanudar, el nodo se ejecuta otra vez desde el principio e interrupt()
        # devuelve lo que pasaste en Command(resume=...).
        decision = interrupt({"pendientes": [{"name": c["name"], "args": c["args"]} for c in pendientes]})
        if decision == "aprobar":
            return Command(goto="herramientas")
        # Rechazo: un ToolMessage por cada tool_call (también las no sensibles) y vuelta al modelo.
        rechazos = [ToolMessage(content="Rechazado por un humano: no lo ejecutes otra vez.",
                                tool_call_id=c["id"], name=c["name"], status="error") for c in llamadas]
        return Command(goto="modelo", update={"messages": rechazos})

    g = StateGraph(MessagesState)
    g.add_node("modelo", llamar_modelo)
    g.add_node("aprobar", aprobar, destinations=("herramientas", "modelo"))
    g.add_node("herramientas", ToolNode(TOOLS))
    g.add_edge(START, "modelo")
    g.add_conditional_edges("modelo", decidir, ["aprobar", END])
    g.add_edge("herramientas", "modelo")
    return g.compile(checkpointer=checkpointer)


if __name__ == "__main__":
    # SqliteSaver persiste el estado en disco: puedes parar el proceso y reanudar después.
    with SqliteSaver.from_conn_string("agente.db") as cp:
        grafo = construir(checkpointer=cp)
        config = {"configurable": {"thread_id": "ticket-123"}, "recursion_limit": 25}  # tope de pasos
        out = grafo.invoke({"messages": [("user", "Devolvedme el pedido P-1001, llegó roto.")]}, config, version="v2")
        while out.interrupts:
            print("Pendiente de aprobación:", out.interrupts[0].value)
            respuesta = "aprobar" if input("¿Aprobar? [s/n] ").lower() == "s" else "rechazar"
            out = grafo.invoke(Command(resume=respuesta), config, version="v2")
        print(out.value["messages"][-1].content)
