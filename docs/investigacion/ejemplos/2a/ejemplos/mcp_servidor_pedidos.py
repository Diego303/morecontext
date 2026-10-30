"""Servidor MCP mínimo (stdio) con una herramienta de solo lectura.

Funciona con el SDK `mcp` 2.x (MCPServer) y con 1.x (FastMCP), porque
langchain-mcp-adapters 0.3.2 todavía exige mcp<2.
"""
try:
    from mcp.server.mcpserver import MCPServer as Servidor          # mcp 2.x
    from mcp.server.mcpserver.exceptions import ToolError
except ImportError:
    from mcp.server.fastmcp import FastMCP as Servidor              # mcp 1.x
    from mcp.server.fastmcp.exceptions import ToolError

mcp = Servidor("pedidos")
PEDIDOS = {"ana@example.com": [{"id": "P-1001", "estado": "enviado"}]}


@mcp.tool()
def ver_pedidos(email: str) -> list[dict]:
    """Lista los pedidos de un cliente por su email."""
    if email.lower() not in PEDIDOS:
        raise ToolError(f"No hay ningún cliente con email {email}")
    return PEDIDOS[email.lower()]


if __name__ == "__main__":
    mcp.run()          # stdio por defecto
