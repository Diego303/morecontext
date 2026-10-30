---
titulo: Tool use
descripcion: Capacidad del modelo de pedir a tu aplicación que ejecute una herramienta definida por ti y de usar el resultado.
creado: 2026-07-20
actualizado: 2026-10-29
categoria: herramientas
aliases: [uso de herramientas, tool_use, herramientas del modelo]
tags: [herramientas, api]
relacionados: ["[[docs/herramientas/01-uso-de-herramientas]]", "[[roadmap/20-herramientas/01-ciclo-tool-use]]"]
---

*Tool use* es el mecanismo por el que un modelo, en mitad de una respuesta, pide ejecutar una herramienta que tú has descrito: buscar en una base de datos, llamar a una API, leer un archivo. El modelo elige la herramienta y genera los argumentos; tu código la ejecuta y le devuelve el resultado para que continúe.

## En la práctica

Defines cada herramienta con `name`, `description` e `input_schema` (JSON Schema) en el parámetro `tools`. Si el modelo decide usarla, la respuesta trae `stop_reason == "tool_use"` y uno o varios bloques `tool_use` con `id`, `name` e `input`. Respondes con un mensaje `user` que contiene un [[glosario/tool-result]] por cada `tool_use`, todos en el mismo mensaje y antes de cualquier texto. Puedes condicionar la elección con [[glosario/tool-choice]], aunque Opus 5.5, Sonnet 5.5 y Fable 5.1 no admiten forzarla. Con `"strict": True` en la herramienta, los argumentos cumplen siempre el esquema. Cuando tienes decenas de herramientas, la [[glosario/carga-diferida-de-herramientas]] evita meterlas todas en el contexto. En LangChain, `@tool` genera el esquema a partir de la firma y el *docstring* de tu función.

## No confundir con

- **[[glosario/function-calling]]**: es el mismo concepto con el nombre que usan otros proveedores.
- **[[glosario/mcp|MCP]]**: estandariza cómo se publican herramientas para muchas aplicaciones; tool use es cómo el modelo las invoca.

## Ver también

- [[roadmap/20-herramientas/01-ciclo-tool-use]]
- [[docs/herramientas/01-uso-de-herramientas]]
- [[disciplinas/diseno-de-herramientas]]
- [[glosario/bucle-agentico]]
- [[glosario/llamada-programatica]]
- [[cursos/langchain-y-langgraph/02-modelos-mensajes-y-herramientas]]
