---
titulo: Documentación
descripcion: Referencia por temas para consultar mientras construyes, de la API de mensajes a la seguridad, con ejemplos completos y tablas de parámetros.
creado: 2026-07-04
orden: 3
tags: [docs]
relacionados: ["[[roadmap/index]]", "[[recetas/index]]", "[[glosario/index]]"]
---

La documentación es la **referencia por temas** de MoreContext. Aquí vienes a consultar algo concreto mientras construyes: qué bloques tiene una respuesta, cómo se marca un error de herramienta, dónde se pone el punto de caché.

## Cómo está organizada

Ocho grupos, del más básico al más operativo. Cada grupo tiene una portada con la lista comentada de sus artículos.

- [[docs/fundamentos/index]]: la API de mensajes, roles, bloques y [[glosario/streaming|streaming]]. Empieza por [[docs/fundamentos/03-api-de-mensajes]].
- [[docs/prompting/index]]: prompt de sistema, ejemplos, [[docs/prompting/03-salida-estructurada|salida estructurada]] y razonamiento.
- [[docs/herramientas/index]]: [[docs/herramientas/01-uso-de-herramientas]], MCP, herramientas del servidor y uso del ordenador.
- [[docs/contexto/index]]: ventana de contexto, [[docs/contexto/02-prompt-caching|prompt caching]], RAG y memoria.
- [[docs/agentes/index]]: [[docs/agentes/01-el-bucle-agentico|el bucle agéntico]], subagentes y aprobación humana.
- [[docs/evals/index]]: diseñar evals y usar un modelo como juez.
- [[docs/produccion/index]]: observabilidad, costes, límites y latencia.
- [[docs/seguridad/index]]: [[docs/seguridad/01-prompt-injection|prompt injection]] y mínimo privilegio.

Cada artículo empieza con una definición, sigue con secciones de referencia y un ejemplo completo, y termina con los errores habituales y enlaces relacionados.

## Docs o roadmap

| Si quieres… | Ve a |
|---|---|
| Aprender un tema desde cero, en orden | [[roadmap/index]] |
| Consultar un parámetro, un formato o un caso límite | Documentación |
| Resolver un problema concreto en pocos pasos | [[recetas/index]] |
| Saber qué significa una palabra | [[glosario/index]] |

Las lecciones del roadmap enlazan a los artículos de docs cuando necesitas el detalle. Los artículos de docs no explican desde cero: dan por hecho que conoces lo básico.

> [!nota] Datos que cambian
> Nombres de modelo, precios y límites cambian a menudo. La documentación explica el concepto y remite a la [documentación oficial de la API](https://platform.claude.com/docs) para las cifras.
