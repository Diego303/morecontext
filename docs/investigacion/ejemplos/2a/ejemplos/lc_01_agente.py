"""LangChain 1.x · agente de soporte con dos herramientas (el mismo caso que
roadmap/40-primer-agente/02-el-bucle-agentico, sin escribir el bucle a mano).

pip install -U langchain langchain-anthropic      # Claude
pip install -U langchain langchain-ollama         # modelo local con Ollama
"""
import json

from langchain.agents import create_agent
from langchain.agents.middleware import ModelCallLimitMiddleware, ToolErrorMiddleware
from langchain.chat_models import init_chat_model
from langchain.tools import tool

MODEL = "anthropic:claude-sonnet-5-5"     # o "ollama:qwen3" con langchain-ollama y Ollama en marcha

PEDIDOS = {"ana@example.com": [{"id": "P-1001", "estado": "enviado", "fecha": "2026-09-10"}]}
AYUDA = {"devoluciones": "Tienes 30 días desde la entrega para devolver un producto sin usar."}


@tool(parse_docstring=True)                # sin esto, "Args:" no llega al esquema de cada campo
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email. Devuelve id, estado y fecha de cada pedido.

    Args:
        email: Email del cliente.
    """
    pedidos = PEDIDOS.get(email.lower())
    if pedidos is None:
        raise ValueError(f"No hay ningún cliente con email {email}")
    return json.dumps(pedidos, ensure_ascii=False)


@tool
def buscar_ayuda(tema: str) -> str:
    """Busca en el centro de ayuda por tema. Úsala para políticas: devoluciones, envíos, pagos."""
    tema = tema.lower()
    return next((t for k, t in AYUDA.items() if k in tema or tema in k), "Sin resultados.")


def error_para_el_modelo(exc: Exception, request) -> str:
    # Sin este middleware, una excepción dentro de la herramienta corta la ejecución.
    # Con él, vuelve al modelo como ToolMessage(status="error"), el equivalente a is_error.
    return f"Error: {exc}"


SYSTEM = "Eres el asistente de soporte de una tienda online. Usa las herramientas para consultar datos; no los inventes."


def crear_agente(model=None):
    # Pon max_tokens explícito: si no, ChatAnthropic usa el máximo del perfil del modelo.
    model = model or init_chat_model(MODEL, max_tokens=2048)
    return create_agent(
        model=model,                       # string "proveedor:modelo" o instancia (ChatAnthropic, ChatOllama…)
        tools=[ver_pedidos, buscar_ayuda],
        system_prompt=SYSTEM,
        middleware=[
            ToolErrorMiddleware(on_error=error_para_el_modelo),
            ModelCallLimitMiddleware(run_limit=10, exit_behavior="end"),  # límite de llamadas al modelo
        ],
    )


if __name__ == "__main__":
    agente = crear_agente()
    resultado = agente.invoke(
        {"messages": [{"role": "user", "content": "Soy ana@example.com. ¿Dónde está mi pedido y hasta cuándo puedo devolverlo?"}]}
    )
    for m in resultado["messages"]:          # la traza completa: human → ai(tool_calls) → tool → ai
        m.pretty_print()
