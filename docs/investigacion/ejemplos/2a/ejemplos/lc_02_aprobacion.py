"""LangChain 1.x · aprobación humana antes de un reembolso (HumanInTheLoopMiddleware).

La pausa es un interrupt de LangGraph: hace falta un checkpointer y un thread_id,
y se reanuda con Command(resume=...). El mismo caso que recetas/aprobacion-humana-antes-de-actuar.
"""
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.checkpoint.memory import InMemorySaver   # en producción: SqliteSaver / PostgresSaver
from langgraph.types import Command

MODEL = "anthropic:claude-sonnet-5-5"


@tool
def ver_pedido(pedido_id: str) -> str:
    """Devuelve estado e importe de un pedido por su id (formato P-NNNN)."""
    return '{"id": "%s", "estado": "entregado", "importe_eur": 49.90}' % pedido_id


@tool
def reembolsar(pedido_id: str, importe_eur: float, motivo: str) -> str:
    """Emite un reembolso. Acción irreversible: solo tras confirmar el pedido con ver_pedido."""
    return f"Reembolso de {importe_eur} € emitido para {pedido_id}."


def crear_agente(model=None, checkpointer=None):
    return create_agent(
        model=model or init_chat_model(MODEL, max_tokens=2048),
        tools=[ver_pedido, reembolsar],
        system_prompt="Eres un agente de soporte. Antes de reembolsar, comprueba el pedido.",
        middleware=[
            HumanInTheLoopMiddleware(
                interrupt_on={
                    "reembolsar": {"allowed_decisions": ["approve", "edit", "reject"]},
                    "ver_pedido": False,                     # solo lectura: sin pausa
                }
            )
        ],
        checkpointer=checkpointer or InMemorySaver(),
    )


def revisar(peticion: dict) -> dict:
    """Aquí iría tu interfaz. Devuelve una decisión por cada acción, en el mismo orden."""
    decisiones = []
    for accion in peticion["action_requests"]:
        print(f"¿Aprobar {accion['name']}({accion['args']})? [s/n]")
        ok = input().strip().lower() == "s"
        decisiones.append({"type": "approve"} if ok else
                          {"type": "reject", "message": "El supervisor no aprueba este reembolso."})
    return {"decisions": decisiones}


if __name__ == "__main__":
    agente = crear_agente()
    config = {"configurable": {"thread_id": "ticket-123"}}     # mismo thread_id para reanudar
    salida = agente.invoke(
        {"messages": [{"role": "user", "content": "Quiero que me devolváis el pedido P-1001, llegó roto."}]},
        config, version="v2",
    )
    while salida.interrupts:                                    # el agente está en pausa
        salida = agente.invoke(Command(resume=revisar(salida.interrupts[0].value)), config, version="v2")
    print(salida.value["messages"][-1].content)
