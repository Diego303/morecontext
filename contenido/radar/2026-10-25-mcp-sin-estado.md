---
titulo: MCP pasa a ser un protocolo sin estado
descripcion: La especificación MCP 2026-07-28 elimina el saludo initialize y las sesiones. Qué cambia en tus servidores, en los SDK y qué hacer si guardabas estado.
creado: 2026-10-25
categoria: herramientas
tags: [mcp, especificacion, servidores, sdk]
fuente:
  titulo: Key Changes · Especificación MCP 2026-07-28
  url: https://modelcontextprotocol.io/specification/2026-07-28/changelog
relacionados: ["[[docs/estandares/01-mcp-2026-07-28]]", "[[recetas/servidor-mcp-sin-estado-con-handles]]", "[[glosario/mrtr]]", "[[radar/2026-09-08-mcp-forma-estandar]]"]
---

## Qué es

La revisión `2026-07-28` de [[glosario/mcp|MCP]], publicada el 28 de julio de 2026, convierte el protocolo en **sin estado** ([cambios de la especificación](https://modelcontextprotocol.io/specification/2026-07-28/changelog)). Desaparecen el saludo `initialize`/`notifications/initialized` y la cabecera `Mcp-Session-Id`. Cada petición lleva en `_meta` la versión del protocolo y las capacidades del cliente, y todo servidor debe implementar `server/discover` para anunciar versiones, capacidades e identidad. Las peticiones que iniciaba el servidor (*sampling*, *elicitation*, *roots*) se sustituyen por [[glosario/mrtr|MRTR]]: el servidor responde `input_required` y el cliente reintenta con los datos que faltaban.

Los SDK ya hablan esta versión: Python `mcp` 2.0.0 (28 jul.) y, en TypeScript, la v2 se divide en `@modelcontextprotocol/server` y `@modelcontextprotocol/client` (2.0.0, 27 jul.). El paquete único `@modelcontextprotocol/sdk` sigue publicándose como línea v1.

## Qué cambia en la práctica

- Un [[glosario/servidor-mcp|servidor]] remoto se escala detrás de un balanceador normal: cualquier réplica atiende cualquier petición.
- Lo que guardabas por sesión (un carrito, una conexión abierta, un cursor) ya no tiene dónde vivir. La especificación pide *handles* explícitos: identificadores que crea el servidor y que el modelo pasa como argumentos normales de la herramienta.
- Roots, Sampling, Logging y el transporte HTTP+SSE quedan deprecados, con al menos doce meses de margen. Alternativas propuestas: pasar rutas como parámetros, llamar directamente a la API del proveedor y registrar en `stderr` u OpenTelemetry.
- `tools/list` debería devolver las herramientas en orden determinista, lo que también ayuda al [[glosario/prompt-caching|prompt caching]] del modelo.

## Qué hacer

1. Si tu servidor guardaba estado por sesión, pásalo a handles con la receta [[recetas/servidor-mcp-sin-estado-con-handles]].
2. Actualiza el SDK: `MCPServer` (antes `FastMCP`) en Python `mcp` 2.x y `@modelcontextprotocol/server` en TypeScript, como en [[cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor]].
3. Antes de construir algo nuevo sobre Sampling o Roots, lee el detalle de la revisión en [[docs/estandares/01-mcp-2026-07-28]].
