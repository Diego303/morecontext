---
titulo: Function calling
descripcion: Nombre habitual de la capacidad del modelo de pedir que tu código ejecute una función con argumentos estructurados.
creado: 2026-07-20
actualizado: 2026-10-29
categoria: herramientas
aliases: [llamada a funciones, llamadas a funciones]
tags: [herramientas, api]
relacionados: ["[[glosario/tool-use]]", "[[roadmap/20-herramientas/01-ciclo-tool-use]]"]
---

*Function calling* es la capacidad de un modelo de responder, en lugar de con texto, con una petición estructurada para que tu aplicación ejecute una función: un nombre y unos argumentos en JSON que cumplen un esquema que tú definiste. El modelo nunca ejecuta nada; decide qué llamar y con qué datos. Tu código ejecuta y le devuelve el resultado.

## En la práctica

Es el mismo concepto que [[glosario/tool-use]]; el nombre cambia según el proveedor. En la API de Anthropic, la petición llega como un bloque `{"type": "tool_use", "id", "name", "input"}` con `stop_reason == "tool_use"`, y tú respondes con un [[glosario/tool-result]] que lleva el mismo `tool_use_id`. La calidad de la descripción y del `input_schema` decide si el modelo elige bien la función y rellena bien los argumentos.

Con modelos de pesos abiertos, que la llamada salga bien depende también de la [[glosario/plantilla-de-chat]] del modelo y del *parser* del servidor (en vLLM, `--enable-auto-tool-choice --tool-call-parser …`). Si un modelo local responde con texto en lugar de llamar a la herramienta, empieza por ahí.

## No confundir con

- **[[glosario/salida-estructurada]]**: obliga a que la respuesta final sea JSON con un esquema, sin que haya nada que ejecutar.
- **[[glosario/mcp|MCP]]**: estándar para exponer herramientas desde servidores; por debajo, el modelo sigue usando function calling.

## Ver también

- [[roadmap/20-herramientas/01-ciclo-tool-use]]
- [[roadmap/20-herramientas/02-definir-herramientas]]
- [[docs/herramientas/01-uso-de-herramientas]]
- [[disciplinas/diseno-de-herramientas]]
- [[problemas/modelo-local-no-llama-herramientas]]
