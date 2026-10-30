---
titulo: Carga diferida de herramientas
descripcion: Dar al modelo una herramienta de búsqueda y cargar las definiciones de las demás solo cuando las necesita, para no llenar el contexto.
creado: 2026-10-29
categoria: herramientas
ingles: Tool search / deferred loading
aliases: [tool search, deferred loading, defer_loading, búsqueda de herramientas]
tags: [herramientas, contexto]
relacionados: ["[[docs/herramientas/05-busqueda-y-carga-diferida]]", "[[recetas/carga-diferida-de-herramientas]]", "[[glosario/divulgacion-progresiva]]"]
---

La carga diferida de herramientas consiste en no enviar al modelo las definiciones de todas tus herramientas en cada llamada. Le das una herramienta de búsqueda y las demás quedan marcadas como diferidas: el modelo busca la que necesita y solo entonces su definición entra en el contexto. En su presentación, Anthropic midió un 85 % menos de tokens en definiciones (de unos 77K a unos 8,7K) ([Anthropic, nov. 2025](https://www.anthropic.com/engineering/advanced-tool-use)).

## En la práctica

En la API de Claude marcas cada herramienta con `"defer_loading": true` y añades una de las herramientas de búsqueda (por expresión regular o BM25). La búsqueda devuelve bloques `tool_reference` (5 por defecto). La propia herramienta de búsqueda nunca puede ser diferida, y la recomendación oficial es dejar sin diferir las 3–5 que más se usan. Como las diferidas no forman parte del prefijo, añadirlas no rompe el [[glosario/prompt-caching]].

```json
{"tools": [
  {"type": "tool_search_tool_regex", "name": "tool_search_tool_regex"},
  {"name": "crear_factura", "description": "Crea una factura para un cliente.",
   "input_schema": {"type": "object", "properties": {"cliente": {"type": "string"}}},
   "defer_loading": true}
]}
```

Compensa con más de 10 herramientas, más de 10K tokens de definiciones o varios [[glosario/servidor-mcp|servidores MCP]]. Con pocas herramientas compactas que se usan siempre, no.

## No confundir con

- **[[glosario/divulgacion-progresiva]]**: la misma idea aplicada a las [[glosario/skill|skills]] (metadatos, cuerpo y anexos por niveles).

## Ver también

- [[docs/herramientas/05-busqueda-y-carga-diferida]]
- [[recetas/carga-diferida-de-herramientas]]
- [[glosario/llamada-programatica]]
- [[disciplinas/diseno-de-herramientas]]
