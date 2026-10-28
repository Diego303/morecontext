---
titulo: Servidor MCP
descripcion: Programa que expone herramientas, recursos y prompts a través del protocolo MCP para que cualquier aplicación compatible los use.
creado: 2026-07-23
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

En local se comunica por `stdio`; en remoto, por *Streamable HTTP*. Aplica [[glosario/minimo-privilegio]]: un servidor expone acciones reales y cualquier contenido que devuelva llega al modelo.

## Ver también

- [[cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor]]
- [[recetas/servidor-mcp-de-solo-lectura]]
- [[sistemas/asistente-de-datos-con-mcp]]
- [[cursos/mcp-de-cero-a-servidor/04-seguridad-y-despliegue]]
