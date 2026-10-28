---
titulo: "MCP: de cero a tu propio servidor"
descripcion: Monográfico sobre Model Context Protocol, desde entender sus primitivas hasta escribir, probar, asegurar y desplegar tu propio servidor en Python o TypeScript.
creado: 2026-09-28
orden: 2
nivel: intermedio
horas: 4
objetivo: Entender la arquitectura y las primitivas de MCP, conectar servidores existentes a tu agente y construir y desplegar con precauciones un servidor propio.
requiere: ["[[roadmap/20-herramientas/index]]", "[[roadmap/40-primer-agente/index]]"]
relacionados: ["[[glosario/mcp]]", "[[docs/herramientas/02-mcp]]", "[[recetas/servidor-mcp-de-solo-lectura]]", "[[sistemas/asistente-de-datos-con-mcp]]"]
tags: [mcp, herramientas, servidores]
---

En el roadmap conectaste un servidor [[glosario/mcp|MCP]] a tu agente en una sola lección ([[roadmap/20-herramientas/05-mcp-conectar-un-servidor]]). Este curso abre la caja: qué viaja por el protocolo, para qué sirve cada primitiva, cómo escribir un servidor que un modelo use bien y qué precauciones tomar antes de exponerlo fuera de tu máquina.

## Objetivo

Al terminar sabrás explicar la arquitectura *host*, *cliente* y *servidor*, elegir entre *tools*, *resources* y *prompts* para cada capacidad, conectar servidores de terceros con criterio y construir un [[glosario/servidor-mcp|servidor MCP]] propio, probarlo y desplegarlo con un modelo de seguridad razonable.

## Para quién

Para desarrolladores que ya han usado herramientas con la API de un modelo y quieren dejar de reescribir la misma integración para cada aplicación. También para equipos que quieren exponer un sistema interno (una base de datos, una API, una wiki) a varios agentes a la vez.

## Requisitos

- [[roadmap/20-herramientas/index]]: el ciclo de [[glosario/tool-use|tool use]], JSON Schema e `is_error`.
- [[roadmap/40-primer-agente/index]]: el bucle agéntico, porque en la lección 2 conectas MCP a uno.
- Python 3.11 o superior; Node.js si quieres seguir las versiones en TypeScript.

## Temario

1. [[cursos/mcp-de-cero-a-servidor/01-que-resuelve-mcp]]. El problema de las integraciones repetidas, la arquitectura, el ciclo de vida de una sesión, las tres primitivas del servidor y los dos transportes. Lees mensajes JSON-RPC reales para que nada sea magia.
2. [[cursos/mcp-de-cero-a-servidor/02-usar-servidores-existentes]]. Configurar servidores en un host, escribir tu propio cliente que traduce herramientas MCP a la API de Mensajes y evaluar un servidor de terceros antes de confiar en él.
3. [[cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor]]. Un servidor de notas con MCPServer en Python (con tools, resources y prompts) y su equivalente en TypeScript. Descripciones que el modelo entiende, errores útiles y pruebas con el Inspector.
4. [[cursos/mcp-de-cero-a-servidor/04-seguridad-y-despliegue]]. Amenazas propias de MCP, transporte Streamable HTTP, autorización según la especificación, límites, auditoría y una lista de comprobación antes de publicar.

## Qué construyes

Un servidor MCP sobre una fuente de datos tuya, con al menos dos herramientas de lectura, un *resource* y un *prompt*, probado con el Inspector y conectado a un agente propio que lo usa para responder preguntas. Al final del curso lo preparas para despliegue remoto con autenticación y registro de auditoría.

> [!nota] Fuente de verdad
> MCP evoluciona. Los conceptos de este curso son estables, pero los detalles de transporte, autorización y SDK cambian entre revisiones. La especificación vigente está en [modelcontextprotocol.io](https://modelcontextprotocol.io); consúltala antes de desplegar.

Si quieres ver un caso completo, el sistema [[sistemas/asistente-de-datos-con-mcp]] usa todo lo que aprendes aquí.
