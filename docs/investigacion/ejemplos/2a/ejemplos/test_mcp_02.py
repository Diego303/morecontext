import asyncio
import importlib.metadata as md

from langchain_core.messages import AIMessage

from _fakes import guion, llamada
from mcp_02_langchain_mcp import main

print("mcp", md.version("mcp"), "| fastmcp", md.version("fastmcp"), "| langchain", md.version("langchain"))


async def probar():
    for email, final in [("ana@example.com", "Tienes P-1001."), ("nadie@example.com", "No encuentro ese email.")]:
        m = guion(AIMessage(content="", tool_calls=[llamada("ver_pedidos", {"email": email}, "m1")]), AIMessage(content=final))
        r = await main(m, f"pedidos de {email}")
        tm = [x for x in r["messages"] if x.type == "tool"][0]
        print(f"  {email}: status={tm.status} content={str(tm.content)[:100]}")


asyncio.run(probar())
