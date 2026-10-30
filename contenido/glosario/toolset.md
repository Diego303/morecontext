---
titulo: Toolset
descripcion: Un grupo de herramientas que se declara como una sola entrada en tools, con configuración por herramienta, en la API de Claude.
creado: 2026-10-29
categoria: herramientas
ingles: Toolset
aliases: [toolset, conjunto de herramientas, mcp_toolset]
tags: [herramientas, api]
relacionados: ["[[docs/herramientas/07-mcp-desde-la-api]]", "[[docs/herramientas/04-uso-del-ordenador]]", "[[glosario/tool-use]]"]
---

Un *toolset* agrupa varias herramientas relacionadas en **una sola entrada** de `tools`. En vez de definir cada herramienta, declaras el conjunto y ajustas sus miembros con `default_config` y `configs` (por ejemplo, `enabled` y `defer_loading`). En la API de Claude aparecen tres familias: los de cliente para [[glosario/uso-del-ordenador]] y del navegador, `mcp_toolset` para el conector MCP y `agent_toolset_20260401` en [[glosario/managed-agents]].

## En la práctica

Con el conector MCP, un *toolset* expone las herramientas de un servidor remoto y te deja apagar las peligrosas:

```json
{"type": "mcp_toolset", "mcp_server_name": "github",
 "default_config": {"enabled": true, "defer_loading": false},
 "configs": {"delete_repository": {"enabled": false}}}
```

Los *toolsets* de cliente (ordenador y navegador) van sin `name`; el `tool_use` que recibes trae `toolset_name` (`computer` o `browser`) para saber a qué conjunto pertenece. No admiten `strict`, `input_examples` ni `tool_choice` de tipo `tool`. Combinado con `defer_loading`, un *toolset* grande no llena el contexto: ver [[glosario/carga-diferida-de-herramientas]].

## No confundir con

- **[[glosario/servidor-mcp]]**: el programa que ofrece las herramientas; el *toolset* es cómo las declaras en la petición.
- **Toolkit de LangChain**: una agrupación en tu código; la API recibe herramientas sueltas.

## Ver también

- [[docs/herramientas/07-mcp-desde-la-api]]
- [[docs/herramientas/04-uso-del-ordenador]]
- [[docs/agentes/04-managed-agents]]
