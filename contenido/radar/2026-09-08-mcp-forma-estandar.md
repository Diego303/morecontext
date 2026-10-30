---
titulo: MCP se asienta como forma estándar de conectar herramientas
descripcion: El Model Context Protocol se ha convertido en la manera habitual de exponer herramientas y datos a aplicaciones de IA sin integraciones a medida.
creado: 2026-09-08
actualizado: 2026-10-29
categoria: herramientas
tags: [mcp, herramientas, integraciones]
fuente:
  titulo: Model Context Protocol · especificación
  url: https://modelcontextprotocol.io
relacionados: ["[[glosario/mcp]]", "[[docs/herramientas/02-mcp]]", "[[cursos/mcp-de-cero-a-servidor/index]]", "[[blog/2026-07-30-por-que-mcp-importa]]"]
---

## Qué es

[[glosario/mcp|MCP]] (Model Context Protocol) es un estándar abierto para conectar aplicaciones de IA con herramientas y datos. Un *host* (el asistente o tu aplicación) crea un *cliente* por cada [[glosario/servidor-mcp|servidor MCP]], y cada servidor expone *tools*, *resources* y *prompts*. Funciona en local por `stdio` y en remoto por *Streamable HTTP*. Lo que vemos es que cada vez más clientes lo soportan y cada vez más servicios publican su servidor, así que escribir un conector a medida por cada pareja aplicación-herramienta deja de tener sentido.

## Qué cambia en la práctica

- Un servidor que escribes una vez sirve para varios hosts compatibles.
- La calidad de las herramientas sigue siendo cosa tuya: nombres, descripciones y esquemas pesan tanto como con [[glosario/tool-use|tool use]] directo.
- Conectar un servidor de terceros es dar acceso a tu agente. Lo que devuelve es entrada no confiable y puede traer [[glosario/inyeccion-de-prompt|inyección de prompt]].

## Qué hacer

1. Si tus herramientas se van a reutilizar fuera de una sola aplicación, empaquétalas como servidor MCP: [[cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor]].
2. Empieza por uno de solo lectura con la receta [[recetas/servidor-mcp-de-solo-lectura]].
3. Antes de conectar servidores ajenos, revisa permisos y origen: [[cursos/mcp-de-cero-a-servidor/04-seguridad-y-despliegue]].
4. Diseña cada herramienta con el criterio de [[disciplinas/diseno-de-herramientas]].

> [!nota] Actualización (oct. 2026)
> Esta entrada no recogía la revisión `2026-07-28` de la especificación, publicada semanas antes: MCP pasa a ser **sin estado**. Ya no hay saludo `initialize` ni sesiones de protocolo, cada petición lleva su versión y capacidades en `_meta`, el servidor anuncia lo que ofrece con `server/discover`, y Roots, Sampling, Logging y HTTP+SSE quedan deprecados. Los SDK actuales son `mcp` 2.x en Python y `@modelcontextprotocol/server` y `/client` en TypeScript. El proyecto está además en la Agentic AI Foundation (Linux Foundation), junto a A2A, AGENTS.md y Agent Skills. Detalle en [[docs/estandares/01-mcp-2026-07-28]] y en [[radar/2026-10-25-mcp-sin-estado]].
