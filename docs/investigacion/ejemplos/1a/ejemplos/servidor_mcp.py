"""Servidor MCP mínimo (mcp 2.3.0, protocolo 2026-07-28) y prueba en memoria."""
import asyncio

from pydantic import BaseModel

from mcp import Client
from mcp.server.mcpserver import MCPServer
from mcp.server.mcpserver.exceptions import ToolError

mcp = MCPServer("pedidos", instructions="Consulta pedidos de la tienda. Solo lectura.")

PEDIDOS = {"A-1": {"estado": "enviado", "total": 42.5}}


class Pedido(BaseModel):
    id: str
    estado: str
    total: float


@mcp.tool()
def consultar_pedido(id_pedido: str) -> Pedido:
    """Devuelve el estado y el total de un pedido por su identificador (p. ej. A-1)."""
    if id_pedido not in PEDIDOS:
        raise ToolError(f"No existe el pedido {id_pedido}. Revisa el formato: letra-guion-número.")
    return Pedido(id=id_pedido, **PEDIDOS[id_pedido])


async def probar() -> None:
    async with Client(mcp) as cliente:            # conexión en proceso (tests)
        herramientas = await cliente.list_tools()
        t = herramientas.tools[0]
        print(t.name, "| input:", t.input_schema["required"], "| output:", bool(t.output_schema))
        ok = await cliente.call_tool("consultar_pedido", {"id_pedido": "A-1"})
        print("ok:", ok.is_error, ok.structured_content)
        mal = await cliente.call_tool("consultar_pedido", {"id_pedido": "Z-9"})
        print("error:", mal.is_error, mal.content[0].text)
        print("protocolo:", cliente.protocol_version)


if __name__ == "__main__":
    import sys
    if "--probar" in sys.argv:
        asyncio.run(probar())
    else:
        mcp.run()  # stdio; mcp.run(transport="streamable-http") para remoto
