---
titulo: Servidor MCP
descripcion: Programa que expone herramientas, recursos y prompts a través del protocolo MCP para que cualquier aplicación compatible los use.
creado: 2026-07-23
actualizado: 2026-10-29
categoria: herramientas
ingles: MCP server
aliases: [MCP server, servidores MCP]
tags: [herramientas, mcp]
relacionados: ["[[cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor]]", "[[recetas/servidor-mcp-de-solo-lectura]]"]
---

Un servidor MCP es el programa que ofrece capacidades a través del [[glosario/mcp|Model Context Protocol]]: *tools* que el modelo puede invocar, *resources* con datos de lectura y *prompts* reutilizables. Un *host* (un IDE, un asistente de escritorio, tu propio agente) se conecta a él mediante un cliente y presenta esas herramientas al modelo.

## En la práctica

Con el SDK de Python, un servidor mínimo cabe en pocas líneas:

```python
from mcp.server.mcpserver import MCPServer

mcp = MCPServer("pedidos")

@mcp.tool()
def buscar_pedido(pedido_id: str) -> str:
    """Devuelve el estado de un pedido por su identificador."""
    return f"Pedido {pedido_id}: enviado"

if __name__ == "__main__":
    mcp.run()  # stdio por defecto
```

En local se comunica por `stdio`; en remoto, por *Streamable HTTP* (`mcp.run(transport="streamable-http")`). Los errores que el modelo debe leer se lanzan con `ToolError`. En TypeScript, el SDK v2 es `@modelcontextprotocol/server` (`new McpServer(...)` y `registerTool`).

Desde la revisión `2026-07-28` el protocolo no tiene sesiones: si tu servidor necesita estado entre llamadas, créalo tú y devuelve un identificador (un *handle*) que el modelo pase en la siguiente. Aplica [[glosario/minimo-privilegio]]: un servidor expone acciones reales y cualquier contenido que devuelva llega al modelo. Si instalas servidores de terceros, revisa sus descripciones ([[glosario/envenenamiento-de-herramientas]]) y fija la versión ([[glosario/rug-pull]]).

## Ver también

- [[cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor]]
- [[recetas/servidor-mcp-de-solo-lectura]]
- [[sistemas/asistente-de-datos-con-mcp]]
- [[cursos/mcp-de-cero-a-servidor/04-seguridad-y-despliegue]]
- [[recetas/servidor-mcp-sin-estado-con-handles]]
- [[herramientas/mcp-sdks]]
