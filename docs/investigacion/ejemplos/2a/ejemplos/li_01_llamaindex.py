"""LlamaIndex · (1) un Workflow con pasos y eventos tipados, y (2) un FunctionAgent con Claude.

pip install -U llama-index-core llama-index-llms-anthropic     # o llama-index-llms-ollama
"""
import asyncio

from llama_index.core.agent.workflow import FunctionAgent
from llama_index.core.workflow import Context, Event, StartEvent, StopEvent, Workflow, step
from llama_index.llms.anthropic import Anthropic

MODEL = "claude-sonnet-5-5"


# ---------- 1) Workflow: encadenado con una puerta de calidad ----------
class Borrador(Event):
    texto: str


class Encadenado(Workflow):
    def __init__(self, generar, **kw):
        super().__init__(**kw)
        self.generar = generar                      # función async texto -> texto (el LLM)

    @step
    async def escribir(self, ctx: Context, ev: StartEvent) -> Borrador:
        await ctx.store.set("intentos", 0)
        return Borrador(texto=await self.generar(f"Escribe un titular sobre: {ev.tema}"))

    @step
    async def revisar(self, ctx: Context, ev: Borrador) -> Borrador | StopEvent:
        intentos = await ctx.store.get("intentos") + 1
        await ctx.store.set("intentos", intentos)
        if len(ev.texto) <= 60 or intentos >= 3:    # la comprobación es código, no otro LLM
            return StopEvent(result=ev.texto)
        return Borrador(texto=await self.generar(f"Acórtalo a 60 caracteres: {ev.texto}"))


# ---------- 2) FunctionAgent: bucle de herramientas ya hecho ----------
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email."""
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


def crear_agente(llm=None):
    return FunctionAgent(
        tools=[ver_pedidos],                        # funciones normales: el esquema sale de la firma y el docstring
        llm=llm or Anthropic(model=MODEL, max_tokens=1024),   # local: Ollama(model="qwen3", request_timeout=120)
        system_prompt="Eres el soporte de una tienda. Usa las herramientas; no inventes datos.",
    )


async def main():
    agente = crear_agente()
    respuesta = await agente.run(user_msg="Soy ana@example.com, ¿y mi pedido?")
    print(str(respuesta))


if __name__ == "__main__":
    asyncio.run(main())
