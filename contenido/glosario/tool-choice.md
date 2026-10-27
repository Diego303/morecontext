---
titulo: tool_choice
descripcion: Parámetro que controla si el modelo puede, debe o no debe usar herramientas, o cuál está obligado a llamar.
creado: 2026-07-25
categoria: herramientas
aliases: [elección de herramienta, forzar herramienta]
tags: [herramientas, api]
relacionados: ["[[roadmap/20-herramientas/04-tool-choice]]", "[[docs/herramientas/01-uso-de-herramientas]]"]
---

`tool_choice` es el parámetro de la API de Mensajes que decide qué libertad tiene el modelo para usar las herramientas que le pasas en `tools`. Por defecto elige él; con este parámetro puedes obligarle a usar alguna, una concreta o ninguna.

## En la práctica

| Valor | Comportamiento |
|---|---|
| `{"type": "auto"}` | Por defecto: el modelo decide si usa herramientas |
| `{"type": "any"}` | Debe usar al menos una, la que elija |
| `{"type": "tool", "name": "extraer_factura"}` | Debe usar esa herramienta |
| `{"type": "none"}` | No puede usar herramientas |

Forzar una herramienta concreta es útil para extracción: el modelo rellena el `input_schema` y tú lees los argumentos como datos. Añade `"disable_parallel_tool_use": True` si necesitas como mucho una llamada por turno. Con el [[glosario/razonamiento-extendido]] activado no todos los modos están disponibles: compruébalo en la documentación oficial.

## Ver también

- [[roadmap/20-herramientas/04-tool-choice]]
- [[docs/herramientas/01-uso-de-herramientas]]
- [[glosario/tool-use]]
- [[glosario/salida-estructurada]]
