---
titulo: tool_choice
descripcion: Parámetro que controla si el modelo puede, debe o no debe usar herramientas; los modelos 5.5 de Claude ya no admiten forzar una.
creado: 2026-07-25
actualizado: 2026-10-29
categoria: herramientas
aliases: [elección de herramienta, forzar herramienta]
tags: [herramientas, api]
relacionados: ["[[roadmap/20-herramientas/04-tool-choice]]", "[[docs/herramientas/01-uso-de-herramientas]]"]
---

`tool_choice` es el parámetro de la API de Mensajes que decide qué libertad tiene el modelo para usar las herramientas que le pasas en `tools`. Por defecto elige él; con este parámetro puedes prohibírselas y, en algunos modelos, obligarle a usar alguna o una concreta.

## En la práctica

| Valor | Comportamiento |
|---|---|
| `{"type": "auto"}` | Por defecto: el modelo decide si usa herramientas |
| `{"type": "any"}` | Debe usar al menos una, la que elija |
| `{"type": "tool", "name": "extraer_factura"}` | Debe usar esa herramienta |
| `{"type": "none"}` | No puede usar herramientas |

> [!aviso] No fuerces herramientas en los modelos 5.5
> `any` y `tool` devuelven 400 en Opus 5.5, Sonnet 5.5, Fable 5.1 y Mythos 5.1, y también con el razonamiento manual (`budget_tokens`) en modelos anteriores. `auto` y `none` funcionan en todos.

Forzar una herramienta se usaba para extraer datos o para «entregar el resultado al final». Hoy, para eso: pide [[glosario/salida-estructurada]] con `output_config.format` en la última llamada, deja disponible solo la herramienta de entrega o da la instrucción en un [[glosario/mensaje-de-sistema-intermedio]]. Añade `"disable_parallel_tool_use": True` si necesitas como mucho una llamada por turno. Si usas la API compatible con Anthropic de Ollama, `tool_choice` no está disponible.

## Ver también

- [[roadmap/20-herramientas/04-tool-choice]]
- [[docs/herramientas/01-uso-de-herramientas]]
- [[glosario/tool-use]]
- [[glosario/salida-estructurada]]
- [[recetas/entregar-resultado-sin-forzar-herramienta]]
- [[radar/2026-10-23-no-se-puede-forzar-herramienta]]
