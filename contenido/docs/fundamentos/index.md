---
titulo: Fundamentos
descripcion: Referencia básica de la API de mensajes, desde la primera llamada hasta los roles, los bloques de contenido y el streaming.
creado: 2026-07-14
actualizado: 2026-10-29
orden: 1
tags: [api, fundamentos]
relacionados: ["[[roadmap/00-fundamentos/index]]", "[[glosario/llm]]", "[[glosario/token]]"]
---

Este grupo reúne la referencia de lo que usas en cualquier aplicación con un [[glosario/llm|LLM]]: cómo se hace una petición, qué forma tienen los mensajes, qué devuelve el modelo y cómo recibir la respuesta mientras se genera. Todo lo que viene después en la documentación (herramientas, contexto, agentes) se apoya en estas piezas.

Los ejemplos usan la API de Mensajes de Anthropic como implementación de referencia. Los conceptos (roles, bloques, motivo de parada, [[glosario/token|tokens]]) existen con otros nombres en otros proveedores.

## Artículos

| Artículo | Para qué lo consultas |
|---|---|
| [[docs/fundamentos/01-introduccion]] | Convenciones de la documentación, instalación del SDK, clave de API y cómo se relaciona con el roadmap. |
| [[docs/fundamentos/02-tu-primera-llamada]] | Parámetros obligatorios de una petición, forma de la respuesta, `stop_reason`, `usage` y errores HTTP. |
| [[docs/fundamentos/03-api-de-mensajes]] | Roles `user` y `assistant`, alternancia, tipos de bloque y cómo mantener una conversación. |
| [[docs/fundamentos/04-streaming]] | Recibir la respuesta por fragmentos, eventos del flujo y cuándo compensa. |
| [[docs/fundamentos/05-versiones-de-api-y-sdks]] | Qué fija `anthropic-version`, qué rompió la versión `2026-10-21` (adiós a `temperature`) y cómo migrar. |
| [[docs/fundamentos/06-motivos-de-parada-y-rechazos]] | Cada `stop_reason`, qué hace tu bucle con él y cómo tratar un rechazo. |

## Por dónde empezar

Si nunca has llamado a una API de modelos, haz antes el nivel [[roadmap/00-fundamentos/index]]: enseña lo mismo paso a paso, con ejercicios. Vuelve aquí cuando necesites comprobar un parámetro, un campo de la respuesta o un caso límite.

Si ya tienes una llamada funcionando, salta a [[docs/fundamentos/03-api-de-mensajes]]: casi todos los errores de principiante con agentes salen de no entender bien la estructura de bloques.

Si traes código escrito antes de octubre de 2026, lee primero [[docs/fundamentos/05-versiones-de-api-y-sdks]]: el SDK 2.x rechaza parámetros que antes eran habituales. Para la misma llamada con un framework o con un modelo local, mira las pestañas de [[docs/fundamentos/02-tu-primera-llamada]] y los grupos [[docs/frameworks/index]] y [[docs/modelos-abiertos/index]].
