"""LangChain >= 1.4 · MCP nativo con langchain.mcp.MCPAdapter (beta, sobre FastMCP 4,
compatible con el SDK mcp 2.x). Sucesor de langchain-mcp-adapters.

pip install -U "langchain[mcp,anthropic]"
"""
import asyncio
import sys
import warnings
from pathlib import Path

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_core._api import LangChainBetaWarning

warnings.filterwarnings("ignore", category=LangChainBetaWarning)    # el namespace avisa de que es beta
from langchain.mcp import MCPAdapter  # noqa: E402

MODEL = "anthropic:claude-sonnet-5-5"
SERVIDOR = Path(__file__).with_name("mcp_servidor_pedidos.py")      # Path => stdio; un str solo puede ser URL http(s)


async def main(model=None, pregunta="¿Qué pedidos tiene ana@example.com?"):
    async with MCPAdapter(SERVIDOR) as mcp:                          # o MCPAdapter("https://mcp.example.com/mcp")
        tools = await mcp.list_tools()
        agente = create_agent(model or init_chat_model(MODEL, max_tokens=1024), tools)
        return await agente.ainvoke({"messages": [("user", pregunta)]})


if __name__ == "__main__":
    print(asyncio.run(main())["messages"][-1].content)
