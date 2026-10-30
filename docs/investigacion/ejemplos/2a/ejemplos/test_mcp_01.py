import asyncio
import importlib.metadata as md

from langchain_core.messages import AIMessage

from _fakes import guion, llamada
from mcp_01_agente_con_mcp import crear_cliente, main

print("mcp", md.version("mcp"), "| langchain-mcp-adapters", md.version("langchain-mcp-adapters"))


async def probar():
    tools = await crear_cliente().get_tools()
    t = tools[0]
    print("tool:", t.name, "|", t.description, "| args:", t.args, "| response_format:", t.response_format)
    for email, final in [("ana@example.com", "Tienes P-1001."), ("nadie@example.com", "No encuentro ese email.")]:
        m = guion(AIMessage(content="", tool_calls=[llamada("ver_pedidos", {"email": email}, "m1")]),
                  AIMessage(content=final))
        try:
            r = await main(m, f"pedidos de {email}")
            tm = [x for x in r["messages"] if x.type == "tool"][0]
            print(f"  {email}: status={tm.status} content={str(tm.content)[:90]}")
        except Exception as e:
            print(f"  {email}: EXCEPCIÓN {type(e).__name__}: {str(e)[:120]}")


asyncio.run(probar())
