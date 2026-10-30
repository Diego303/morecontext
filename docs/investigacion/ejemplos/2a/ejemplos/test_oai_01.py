"""Prueba oai_01_agentes con un Model falso (sin API): herramientas, error de
herramienta, handoff, needs_approval, guardrail, sesión y max_turns."""
import asyncio
import os
import tempfile

from agents import InputGuardrailTripwireTriggered, MaxTurnsExceeded, Runner, SQLiteSession, Usage
from agents.items import ModelResponse
from agents.models.interface import Model
from openai.types.responses import ResponseFunctionToolCall, ResponseOutputMessage, ResponseOutputText

from oai_01_agentes import crear_agentes


def llamada(nombre, args, cid):
    return ResponseFunctionToolCall(type="function_call", name=nombre, arguments=args, call_id=cid, id=cid)


def texto(t):
    return ResponseOutputMessage(id="m", type="message", role="assistant", status="completed",
                                 content=[ResponseOutputText(type="output_text", text=t, annotations=[])])


class Guion(Model):
    def __init__(self, pasos):
        self.pasos, self.vistos = list(pasos), []

    async def get_response(self, system_instructions, input, model_settings, tools, output_schema, handoffs,
                           tracing, **kw):
        self.vistos.append((system_instructions[:20] if system_instructions else None, sorted(t.name for t in tools),
                            [h.tool_name for h in handoffs]))
        return ModelResponse(output=[self.pasos.pop(0)], usage=Usage(), response_id=None)

    def stream_response(self, *a, **k):
        raise NotImplementedError


async def main():
    # 1) herramienta OK + error de herramienta devuelto al modelo
    m = Guion([llamada("ver_pedidos", '{"email": "nadie@example.com"}', "c1"),
               llamada("ver_pedidos", '{"email": "ana@example.com"}', "c2"), texto("Tu pedido P-1001 está enviado.")])
    triaje, _ = crear_agentes(m)
    db = os.path.join(tempfile.mkdtemp(), "s.db")
    s = SQLiteSession("ana", db)
    r = await Runner.run(triaje, "¿Dónde está mi pedido?", session=s)
    outs = [i.output for i in r.new_items if i.type == "tool_call_output_item"]
    print("1) final:", r.final_output, "| salidas tools:", [o[:60] for o in outs])
    print("   herramientas vistas:", m.vistos[0])
    print("   items en sesión:", len(await SQLiteSession("ana", db).get_items()))

    # 2) handoff a Devoluciones + needs_approval -> interrupción, aprobar y reanudar
    m = Guion([llamada("transfer_to_devoluciones", "{}", "h1"),
               llamada("reembolsar", '{"pedido_id": "P-1001", "importe_eur": 49.9}', "r1"),
               texto("Reembolso emitido.")])
    triaje, _ = crear_agentes(m)
    r = await Runner.run(triaje, "Quiero devolver P-1001")
    print("2) interrupciones:", [(i.name if hasattr(i, 'name') else type(i).__name__) for i in r.interruptions],
          "| agente:", r.last_agent.name)
    estado = r.to_state()
    for item in r.interruptions:
        estado.approve(item)
    r = await Runner.run(triaje, estado)
    print("   tras aprobar:", r.final_output, "| último agente:", r.last_agent.name)

    # 3) guardrail de entrada
    try:
        await Runner.run(crear_agentes(Guion([texto("x")]))[0], "Mi tarjeta es 4111…")
    except InputGuardrailTripwireTriggered as e:
        print("3) guardrail disparado:", type(e).__name__)

    # 4) max_turns como condición de parada
    m = Guion([llamada("ver_pedidos", '{"email": "ana@example.com"}', f"x{i}") for i in range(10)])
    try:
        await Runner.run(crear_agentes(m)[0], "bucle", max_turns=3)
    except MaxTurnsExceeded as e:
        print("4) MaxTurnsExceeded:", e)


asyncio.run(main())
