---
titulo: Llamada programática a herramientas
descripcion: El modelo escribe código que llama a tus herramientas dentro de un contenedor, y solo el resultado final vuelve a su contexto.
creado: 2026-10-29
categoria: herramientas
ingles: Programmatic tool calling
aliases: [programmatic tool calling, PTC, allowed_callers, llamada desde código]
tags: [herramientas, contexto, api]
relacionados: ["[[docs/herramientas/06-llamada-programatica]]", "[[docs/herramientas/03-herramientas-del-servidor]]", "[[glosario/carga-diferida-de-herramientas]]"]
---

En la llamada programática, el modelo no pide tus herramientas una a una. Escribe un programa en la herramienta de ejecución de código que las invoca como funciones, encadena resultados, filtra y agrega, y solo lo que el programa imprime vuelve a su contexto. En tareas de investigación complejas, Anthropic midió un 37 % menos de tokens ([nov. 2025](https://www.anthropic.com/engineering/advanced-tool-use)).

## En la práctica

En la API de Claude añades la ejecución de código y marcas qué herramientas puede llamar desde ella:

```json
{"tools": [
  {"type": "code_execution_20260120", "name": "code_execution"},
  {"name": "ventas_por_mes", "description": "Ventas de un mes (AAAA-MM) por tienda.",
   "input_schema": {"type": "object", "properties": {"mes": {"type": "string"}}, "required": ["mes"]},
   "allowed_callers": ["code_execution_20260120"]}
]}
```

El `tool_use` llega con `caller: {"type": "code_execution_20260120", "tool_id": "srvtoolu_…"}`. Respondes con un mensaje `user` que lleve **solo** `tool_result`, el mismo `container` y las mismas `tools`; cada llamada pendiente caduca en unos 4 minutos. Compensa con 3 o más llamadas dependientes o con datos grandes que solo necesitas resumidos. No es compatible con `strict`, `disable_parallel_tool_use` ni herramientas MCP, y `allowed_callers` no es una barrera de seguridad.

## No confundir con

- **Ejecución de código con MCP**: el patrón en el que tú presentas los servidores MCP como archivos de código que el agente lee y usa en su propio sandbox.

## Ver también

- [[docs/herramientas/06-llamada-programatica]]
- [[glosario/tool-use]]
- [[disciplinas/diseno-de-herramientas]]
- [[glosario/sandbox]]
