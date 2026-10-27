---
titulo: Tool use
descripcion: Capacidad del modelo de pedir a tu aplicación que ejecute una herramienta definida por ti y de usar el resultado.
creado: 2026-07-20
categoria: herramientas
aliases: [uso de herramientas, tool_use, herramientas del modelo]
tags: [herramientas, api]
relacionados: ["[[docs/herramientas/01-uso-de-herramientas]]", "[[roadmap/20-herramientas/01-ciclo-tool-use]]"]
---

*Tool use* es el mecanismo por el que un modelo, en mitad de una respuesta, pide ejecutar una herramienta que tú has descrito: buscar en una base de datos, llamar a una API, leer un archivo. El modelo elige la herramienta y genera los argumentos; tu código la ejecuta y le devuelve el resultado para que continúe.

## En la práctica

Defines cada herramienta con `name`, `description` e `input_schema` (JSON Schema) en el parámetro `tools`. Si el modelo decide usarla, la respuesta trae `stop_reason == "tool_use"` y uno o varios bloques `tool_use` con `id`, `name` e `input`. Respondes con un mensaje `user` que contiene un [[glosario/tool-result]] por cada `tool_use`, todos en el mismo mensaje y antes de cualquier texto. Puedes condicionar la elección con [[glosario/tool-choice]].

## No confundir con

- **[[glosario/function-calling]]**: es el mismo concepto con el nombre que usan otros proveedores.
- **[[glosario/mcp|MCP]]**: estandariza cómo se publican herramientas para muchas aplicaciones; tool use es cómo el modelo las invoca.

## Ver también

- [[roadmap/20-herramientas/01-ciclo-tool-use]]
- [[docs/herramientas/01-uso-de-herramientas]]
- [[disciplinas/diseno-de-herramientas]]
- [[glosario/bucle-agentico]]
