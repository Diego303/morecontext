---
titulo: SDK de MCP
descripcion: Los SDK oficiales del Model Context Protocol para escribir servidores y clientes MCP, con la especificación 2026-07-28 sin estado, en Python, TypeScript y otros lenguajes.
creado: 2026-10-29
tags: [mcp, protocolo, servidores, python, typescript, open-source]
relacionados: ["[[cursos/mcp-de-cero-a-servidor/index]]", "[[docs/estandares/01-mcp-2026-07-28]]", "[[recetas/servidor-mcp-de-solo-lectura]]", "[[glosario/servidor-mcp]]"]
categoria: protocolo
licencia: MIT AND Apache-2.0
open_source: true
lenguajes: [Python, TypeScript, C#, Go, Rust, Ruby, Java, Swift, PHP, Kotlin]
url: https://modelcontextprotocol.io
repositorio: https://github.com/modelcontextprotocol/python-sdk
version: "2.3.0"
revisado: 2026-10-29
---

[[glosario/mcp|MCP]] es el estándar abierto para conectar aplicaciones de IA con herramientas y datos, y sus SDK oficiales son la forma de implementarlo: escribes un [[glosario/servidor-mcp|servidor]] que expone *tools*, *resources* y *prompts*, y cualquier *host* compatible (Claude Code, Claude Desktop, IDE, frameworks) puede usarlo. La especificación vigente es la `2026-07-28`, **sin estado**: no hay saludo `initialize` ni sesiones de protocolo.

**Licencia**: open source, con una transición en curso. El SDK de Python (`mcp` 2.3.0) y la línea v1 de TypeScript (`@modelcontextprotocol/sdk` 1.32.2) son MIT. Los paquetes de la v2 de TypeScript (`@modelcontextprotocol/server` y `/client`, 2.4.0) declaran Apache-2.0 en npm, y el `LICENSE` del repositorio explica que el proyecto pasa de MIT a Apache-2.0: el código nuevo es Apache-2.0 y el de autores que aún no han consentido el cambio sigue en MIT. Ambas son licencias OSI. No hay parte comercial: los servidores que publican terceros sí pueden serlo.

## Para qué sirve

- Exponer tu API, base de datos o sistema interno como herramientas que cualquier agente compatible puede usar, sin integrarlo en cada framework.
- Clientes MCP en tus propios agentes.
- Probar servidores en proceso, sin transporte, con el cliente del SDK.

Hay SDK de nivel 1 (TypeScript, Python, C#, Go, Rust y Ruby), de nivel 2 (Java) y de nivel 3 (Swift, PHP y Kotlin).

## Cuándo usarla

Cuando una capacidad la van a consumir varios agentes o *hosts*, o la quieres usar desde Claude Code y desde tu propio agente a la vez.

## Cuándo no

Para una herramienta que solo usa un agente tuyo: una función normal declarada en `tools` es más simple. Y si te basta con un servidor remoto desde la API de Claude, mira el conector MCP de la API ([[docs/herramientas/07-mcp-desde-la-api]]), que solo admite herramientas y servidores remotos.

## Ejemplo mínimo

Servidor de Python con un error legible para el modelo, probado con el cliente en proceso:

```python title="servidor_pedidos.py"
import asyncio

from pydantic import BaseModel
from mcp import Client
from mcp.server.mcpserver import MCPServer
from mcp.server.mcpserver.exceptions import ToolError

mcp = MCPServer("pedidos", instructions="Consulta pedidos de la tienda. Solo lectura.")
PEDIDOS = {"A-1": {"estado": "enviado", "total": 42.5}}


class Pedido(BaseModel):                               # genera output_schema y structured_content
    id: str
    estado: str
    total: float


@mcp.tool()
def consultar_pedido(id_pedido: str) -> Pedido:
    """Devuelve el estado y el total de un pedido por su identificador (p. ej. A-1)."""
    if id_pedido not in PEDIDOS:
        raise ToolError(f"No existe el pedido {id_pedido}. Formato: letra-guion-número.")   # el modelo lo lee
    return Pedido(id=id_pedido, **PEDIDOS[id_pedido])


async def probar():
    async with Client(mcp) as c:                       # cliente en proceso: ideal para tests
        ok = await c.call_tool("consultar_pedido", {"id_pedido": "A-1"})
        mal = await c.call_tool("consultar_pedido", {"id_pedido": "Z-9"})
        print(ok.is_error, ok.structured_content, "|", mal.is_error, mal.content[0].text)


if __name__ == "__main__":
    asyncio.run(probar())                              # en producción: mcp.run() (stdio) o mcp.run(transport="streamable-http")
```

Lo ejecuté con `mcp` 2.3.0: la primera llamada devuelve `False {'id': 'A-1', 'estado': 'enviado', 'total': 42.5}` y la segunda `True` con el texto «Error executing tool consultar_pedido: No existe el pedido Z-9…». Si devuelves un `dict` en lugar del modelo Pydantic, `structured_content` llega vacío.

El equivalente en TypeScript (v2) compila con `tsc --strict`:

```ts title="servidor.ts"
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

const server = new McpServer({ name: "pedidos", version: "1.0.0" });
server.registerTool("consultar_pedido", {
    description: "Devuelve el estado de un pedido por su identificador (p. ej. A-1).",
    inputSchema: z.object({ idPedido: z.string() }),
  },
  async ({ idPedido }) => idPedido === "A-1"
    ? { content: [{ type: "text", text: JSON.stringify({ id: idPedido, estado: "enviado" }) }] }
    : { isError: true, content: [{ type: "text", text: `No existe el pedido ${idPedido}` }] });
await server.connect(new StdioServerTransport());
```

> [!aviso] Nombres que cambiaron en 2026
> En Python, la clase de la serie 1.x se llamaba `FastMCP` y `mcp.server.fastmcp` ya no existe en la 2.x. En TypeScript, la v2 se reparte en `@modelcontextprotocol/server` y `@modelcontextprotocol/client` (2.4.0); el paquete único `@modelcontextprotocol/sdk` sigue como línea v1 (1.32.2). Algunas librerías aún exigen `mcp<2`, como `langchain-mcp-adapters` o CrewAI: no las mezcles con el SDK 2.x en el mismo entorno.

## Alternativas

- `langchain.mcp.MCPAdapter` en [[herramientas/langchain]] para consumir servidores desde un agente.
- `create_sdk_mcp_server` del [[herramientas/claude-agent-sdk]] para servidores en proceso.
- Herramientas normales del [[herramientas/anthropic-sdk]] si nadie más va a usarlas.

## Enlaces

- [Especificación y documentación](https://modelcontextprotocol.io) · [PyPI de `mcp`](https://pypi.org/project/mcp/) · [npm de `@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- En MoreContext: [[cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor]] · [[docs/estandares/01-mcp-2026-07-28]] · [[recetas/servidor-mcp-sin-estado-con-handles]]
