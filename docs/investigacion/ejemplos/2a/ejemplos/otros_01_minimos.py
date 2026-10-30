"""Ejemplos mínimos de smolagents, DSPy, Google ADK, Haystack, Strands y Microsoft
Agent Framework. Cada función construye el agente con Claude; ninguna llama a la API
salvo que ejecutes la función `correr_*` correspondiente con una clave real.
Ejecuta cada bloque con el venv de su framework (ver README).
"""
import sys

QUIEN = sys.argv[1] if len(sys.argv) > 1 else ""


def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email.

    Args:
        email: Email del cliente.
    """
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


if QUIEN == "smolagents":
    from smolagents import CodeAgent, LiteLLMModel, ToolCallingAgent, tool

    herramienta = tool(ver_pedidos)                       # exige docstring con Args: por parámetro
    modelo = LiteLLMModel(model_id="anthropic/claude-sonnet-5-5", max_tokens=1024)  # local: "ollama_chat/qwen3"
    code = CodeAgent(tools=[herramienta], model=modelo, max_steps=6)   # escribe y ejecuta Python
    calls = ToolCallingAgent(tools=[herramienta], model=modelo, max_steps=6)  # tool calling clásico
    print("smolagents:", type(code).__name__, type(code.python_executor).__name__, "|", type(calls).__name__,
          "| tools:", list(code.tools))
    # code.run("¿Qué pedidos tiene ana@example.com?")

elif QUIEN == "dspy":
    import dspy
    from dspy.utils.dummies import DummyLM

    class Clasificar(dspy.Signature):
        """Clasifica un ticket de soporte."""
        ticket: str = dspy.InputField()
        categoria: str = dspy.OutputField(desc="facturacion | envio | cuenta | producto")

    # Real: dspy.configure(lm=dspy.LM("anthropic/claude-sonnet-5-5", max_tokens=1024))
    dspy.configure(lm=DummyLM([{"reasoning": "habla de un cobro", "categoria": "facturacion"}]))
    pred = dspy.ChainOfThought(Clasificar)(ticket="Me habéis cobrado dos veces")
    print("dspy ChainOfThought ->", pred.categoria, "| razonamiento:", pred.reasoning)
    react = dspy.ReAct("pregunta -> respuesta", tools=[ver_pedidos], max_iters=5)
    print("dspy ReAct tools:", list(react.tools))

elif QUIEN == "adk":
    from google.adk.agents import Agent
    from google.adk.models.lite_llm import LiteLlm
    from google.adk.runners import InMemoryRunner

    agente = Agent(name="soporte", model=LiteLlm(model="anthropic/claude-sonnet-5-5"),
                   instruction="Eres el soporte de una tienda. Usa las herramientas.", tools=[ver_pedidos])
    runner = InMemoryRunner(agent=agente, app_name="tienda")
    print("adk:", type(agente).__name__, agente.model.model, "| runner:", type(runner).__name__)

elif QUIEN == "haystack":
    from haystack.components.agents import Agent
    from haystack.dataclasses import ChatMessage
    from haystack.tools import create_tool_from_function
    from haystack_integrations.components.generators.anthropic import AnthropicChatGenerator

    agente = Agent(chat_generator=AnthropicChatGenerator(model="claude-sonnet-5-5", generation_kwargs={"max_tokens": 1024}),
                   tools=[create_tool_from_function(ver_pedidos)],
                   system_prompt="Eres el soporte de una tienda.", max_agent_steps=10)
    print("haystack:", type(agente).__name__, "| tools:", [t.name for t in agente.tools])
    # agente.warm_up(); agente.run(messages=[ChatMessage.from_user("¿Y mi pedido? ana@example.com")])

elif QUIEN == "strands":
    from strands import Agent, tool
    from strands.models.anthropic import AnthropicModel

    agente = Agent(model=AnthropicModel(model_id="claude-sonnet-5-5", max_tokens=1024),   # sin model= usa Bedrock
                   tools=[tool(ver_pedidos)], system_prompt="Eres el soporte de una tienda.", callback_handler=None)
    print("strands:", type(agente).__name__, "| tools:", agente.tool_names)
    # print(agente("¿Y mi pedido? ana@example.com"))

elif QUIEN == "maf":
    from agent_framework import Agent, tool
    from agent_framework.anthropic import AnthropicClient

    agente = Agent(client=AnthropicClient(model="claude-sonnet-5-5"), name="soporte",
                   instructions="Eres el soporte de una tienda.", tools=[tool(ver_pedidos)])
    print("agent-framework:", type(agente).__name__, agente.name, "| tools:", [t.name for t in agente.default_options.get("tools", [])] if isinstance(agente.default_options, dict) else "?")
    # import asyncio; print(asyncio.run(agente.run("¿Y mi pedido? ana@example.com")).text)
