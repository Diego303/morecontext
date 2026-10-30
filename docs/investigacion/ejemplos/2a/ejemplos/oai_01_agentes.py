"""OpenAI Agents SDK (open source, MIT) · agente de soporte con herramientas,
handoff a un especialista, guardrail de entrada y sesión persistente, usando
Claude a través de LiteLLM.

pip install -U "openai-agents[litellm]"
export ANTHROPIC_API_KEY=...       # LiteLLM lee la clave del proveedor
"""
import asyncio
import json

from agents import (Agent, GuardrailFunctionOutput, ModelSettings, Runner, SQLiteSession,
                    function_tool, input_guardrail, set_tracing_disabled)
from agents.extensions.models.litellm_model import LitellmModel

MODEL = LitellmModel(model="anthropic/claude-sonnet-5-5")   # local: LitellmModel(model="ollama_chat/qwen3")
set_tracing_disabled(True)   # las trazas van por defecto a la plataforma de OpenAI; desactívalas o usa tu exportador

PEDIDOS = {"ana@example.com": [{"id": "P-1001", "estado": "enviado"}]}


def error_visible(ctx, error: Exception) -> str:
    return f"Error: {error}"          # por defecto el modelo solo ve un mensaje genérico


@function_tool(failure_error_function=error_visible)
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email.

    Args:
        email: Email del cliente.
    """
    if email.lower() not in PEDIDOS:
        raise ValueError(f"No hay ningún cliente con email {email}")
    return json.dumps(PEDIDOS[email.lower()], ensure_ascii=False)


@function_tool(needs_approval=True)             # pausa la ejecución hasta que un humano apruebe
def reembolsar(pedido_id: str, importe_eur: float) -> str:
    """Emite un reembolso. Acción irreversible."""
    return f"Reembolso de {importe_eur} € emitido para {pedido_id}."


@input_guardrail
async def sin_datos_de_tarjeta(ctx, agent, entrada) -> GuardrailFunctionOutput:
    texto = entrada if isinstance(entrada, str) else json.dumps(entrada, ensure_ascii=False)
    return GuardrailFunctionOutput(output_info=None, tripwire_triggered="tarjeta" in texto.lower())


def crear_agentes(model=MODEL):
    ajustes = ModelSettings(max_tokens=1024)
    devoluciones = Agent(
        name="Devoluciones", model=model, model_settings=ajustes,
        handoff_description="Especialista en devoluciones y reembolsos.",
        instructions="Gestiona devoluciones. Antes de reembolsar, confirma el pedido.",
        tools=[ver_pedidos, reembolsar],
    )
    triaje = Agent(
        name="Soporte", model=model, model_settings=ajustes,
        instructions="Eres el soporte de una tienda. Para devoluciones, pasa al especialista.",
        tools=[ver_pedidos],
        handoffs=[devoluciones],                 # se expone al modelo como herramienta transfer_to_devoluciones
        input_guardrails=[sin_datos_de_tarjeta],
    )
    return triaje, devoluciones


async def main():
    triaje, _ = crear_agentes()
    sesion = SQLiteSession("cliente-ana", "conversaciones.db")   # el historial se guarda entre ejecuciones
    r = await Runner.run(triaje, "Quiero devolver P-1001", session=sesion, max_turns=10)
    while r.interruptions:                                       # needs_approval => pausa
        estado = r.to_state()
        for item in r.interruptions:
            estado.approve(item)                                 # o estado.reject(item)
        r = await Runner.run(triaje, estado)
    print(r.final_output, "| último agente:", r.last_agent.name)


if __name__ == "__main__":
    asyncio.run(main())
