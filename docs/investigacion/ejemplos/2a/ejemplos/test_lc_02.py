from langchain_core.messages import AIMessage
from langgraph.types import Command

from _fakes import guion, llamada
from lc_02_aprobacion import crear_agente

for decision in [{"type": "approve"}, {"type": "reject", "message": "No aprobado."},
                 {"type": "edit", "edited_action": {"name": "reembolsar",
                  "args": {"pedido_id": "P-1001", "importe_eur": 20.0, "motivo": "parcial"}}}]:
    modelo = guion(
        AIMessage(content="", tool_calls=[llamada("ver_pedido", {"pedido_id": "P-1001"}, "c1")]),
        AIMessage(content="", tool_calls=[llamada("reembolsar", {"pedido_id": "P-1001", "importe_eur": 49.9, "motivo": "roto"}, "c2")]),
        AIMessage(content="Hecho."),
    )
    agente = crear_agente(modelo)
    config = {"configurable": {"thread_id": "t-" + decision["type"]}}
    out = agente.invoke({"messages": [{"role": "user", "content": "Devolución P-1001"}]}, config, version="v2")
    print(type(out).__name__, "| interrupts:", len(out.interrupts))
    req = out.interrupts[0].value
    print("  action_requests:", [(a["name"], a["args"]) for a in req["action_requests"]])
    print("  review_configs:", req["review_configs"])
    out = agente.invoke(Command(resume={"decisions": [decision]}), config, version="v2")
    tool_msgs = [m for m in out.value["messages"] if m.type == "tool"]
    print(f"  {decision['type']} ->", [(m.name, m.status, m.content[:60]) for m in tool_msgs])
    print("  estado guardado:", agente.get_state(config).next)
