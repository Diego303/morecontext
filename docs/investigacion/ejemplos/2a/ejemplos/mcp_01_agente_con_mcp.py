"""langchain-mcp-adapters · cargar las herramientas de uno o varios servidores MCP
en un agente de LangChain (o en un ToolNode de LangGraph).

pip install -U langchain-mcp-adapters langchain langchain-anthropic
"""
import asyncio
import sys
from pathlib import Path

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_mcp_adapters.client import MultiServerMCPClient

MODEL = "anthropic:claude-sonnet-5-5"
SERVIDOR = str(Path(__file__).with_name("mcp_servidor_pedidos.py"))


def crear_cliente() -> MultiServerMCPClient:
    return MultiServerMCPClient({
        "pedidos": {"transport": "stdio", "command": sys.executable, "args": [SERVIDOR]},
        # "docs": {"transport": "streamable_http", "url": "https://mcp.example.com/mcp"},
    })


async def main(model=None, pregunta="¿Qué pedidos tiene ana@example.com?"):
    cliente = crear_cliente()
    tools = await cliente.get_tools()          # cada tool MCP se convierte en un BaseTool de LangChain
    agente = create_agent(model or init_chat_model(MODEL, max_tokens=1024), tools)
    return await agente.ainvoke({"messages": [("user", pregunta)]})   # las tools MCP son async: usa ainvoke


if __name__ == "__main__":
    print(asyncio.run(main())["messages"][-1].content)
