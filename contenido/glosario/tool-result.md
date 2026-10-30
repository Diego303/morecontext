---
titulo: Tool result
descripcion: Bloque con el que devuelves al modelo el resultado de ejecutar una herramienta que pidió, enlazado por su identificador.
creado: 2026-07-24
actualizado: 2026-10-29
categoria: herramientas
aliases: [tool_result, resultado de herramienta]
tags: [herramientas, api]
relacionados: ["[[roadmap/20-herramientas/01-ciclo-tool-use]]", "[[roadmap/20-herramientas/03-errores-e-is-error]]"]
---

Un *tool result* es la respuesta de tu aplicación a un bloque `tool_use` del modelo. Lleva el `tool_use_id` de la petición a la que responde y el contenido del resultado, de modo que el modelo sepa qué salió de cada llamada y pueda seguir razonando.

## En la práctica

Va en un mensaje con rol `user`, con un bloque por cada `tool_use` de la respuesta anterior, todos en el mismo mensaje y antes de cualquier texto:

```python
{"role": "user", "content": [
    {"type": "tool_result", "tool_use_id": "toolu_01A…", "content": "3 pedidos encontrados: …"},
    {"type": "tool_result", "tool_use_id": "toolu_01B…", "content": "Cliente no existe", "is_error": True},
]}
```

Si la herramienta falla, no lances la excepción hacia arriba: devuelve `is_error: True` con un mensaje que explique qué pasó y cómo corregirlo. El modelo suele reintentar con otros argumentos. En LangChain, una excepción dentro de una herramienta rompe el agente: añade `ToolErrorMiddleware` para que vuelva al modelo como error. Recorta resultados largos: todo lo que devuelves ocupa [[glosario/ventana-de-contexto]]. En la [[glosario/llamada-programatica]] el mensaje de respuesta debe llevar solo bloques `tool_result`, sin texto.

## Ver también

- [[roadmap/20-herramientas/01-ciclo-tool-use]]
- [[roadmap/20-herramientas/03-errores-e-is-error]]
- [[docs/herramientas/01-uso-de-herramientas]]
- [[glosario/tool-use]]
- [[problemas/tool-result-sin-tool-use]]
