import json

from pydantic_ai import DeferredToolRequests, DeferredToolResults, ToolDenied, UsageLimits, UsageLimitExceeded
from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart
from pydantic_ai.models.function import AgentInfo, FunctionModel
from pydantic_ai.models.test import TestModel

from pai_01_agente import Deps, Respuesta, agente

deps = Deps(pedidos={"ana@example.com": [{"id": "P-1001", "estado": "enviado"}]}, email_cliente="ana@example.com")

# 1) TestModel: llama a las herramientas indicadas y genera una salida válida según el esquema
with agente.override(model=TestModel(call_tools=["ver_pedidos"])):
    r = agente.run_sync("¿Dónde está mi pedido?", deps=deps)
print("1) TestModel:", type(r.output).__name__, r.output, "| requests:", r.usage.requests)


# 2) FunctionModel: guion exacto; reembolsar requiere aprobación -> DeferredToolRequests
def guion(mensajes, info: AgentInfo) -> ModelResponse:
    n = len(mensajes)
    if n == 1:
        return ModelResponse(parts=[ToolCallPart("ver_pedidos", {}, tool_call_id="t1")])
    if n == 3:
        return ModelResponse(parts=[ToolCallPart("reembolsar", {"pedido_id": "P-1001", "importe_eur": 49.9}, tool_call_id="t2")])
    ultimo = mensajes[-1].parts[-1]
    out = info.output_tools[0]
    return ModelResponse(parts=[ToolCallPart(out.name, {"respuesta": f"Hecho: {getattr(ultimo, 'content', '')}",
                                                        "pedidos_citados": ["P-1001"], "escalar": False})])


with agente.override(model=FunctionModel(guion)):
    r = agente.run_sync("Devolvedme P-1001", deps=deps)
    print("2) salida:", type(r.output).__name__, [(c.tool_name, c.args) for c in r.output.approvals])
    for decision in [True, ToolDenied("El supervisor no lo aprueba.")]:
        res = DeferredToolResults(approvals={r.output.approvals[0].tool_call_id: decision})
        r2 = agente.run_sync(message_history=r.all_messages(), deferred_tool_results=res, deps=deps)
        print("   decisión", decision if decision is True else "ToolDenied", "->", r2.output.respuesta)

# 3) Límite de peticiones como condición de parada
with agente.override(model=TestModel(call_tools=["ver_pedidos"])):
    try:
        agente.run_sync("x", deps=deps, usage_limits=UsageLimits(request_limit=1))
    except UsageLimitExceeded as e:
        print("3) UsageLimitExceeded:", e)

# 4) ModelRetry con cliente inexistente
otro = Deps(pedidos={}, email_cliente="nadie@example.com")
with agente.override(model=TestModel(call_tools=["ver_pedidos"])):
    try:
        agente.run_sync("x", deps=otro)
    except Exception as e:
        print("4) tras agotar retries:", type(e).__name__, str(e)[:90])
