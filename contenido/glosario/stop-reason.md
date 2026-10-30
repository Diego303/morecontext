---
titulo: Stop reason
descripcion: Campo de la respuesta que indica por qué el modelo dejó de generar y, por tanto, qué debe hacer tu código después.
creado: 2026-07-23
actualizado: 2026-10-29
categoria: herramientas
aliases: [stop_reason, motivo de parada, razón de parada]
tags: [api, agentes]
relacionados: ["[[roadmap/40-primer-agente/03-condiciones-de-parada]]", "[[docs/fundamentos/03-api-de-mensajes]]"]
---

`stop_reason` es el campo de cada respuesta de la API de Mensajes que explica por qué terminó la generación. Tu código debe leerlo siempre: decide si el [[glosario/bucle-agentico]] continúa, si la respuesta está completa o si algo ha ido mal.

## En la práctica

| Valor | Significado | Qué hacer |
|---|---|---|
| `end_turn` | El modelo terminó su respuesta | Mostrarla o procesarla |
| `tool_use` | Pide ejecutar herramientas | Ejecutarlas y devolver un [[glosario/tool-result]] por cada una |
| `max_tokens` | Se alcanzó [[glosario/max-tokens]] | Tratarla como incompleta |
| `stop_sequence` | Apareció una secuencia de parada tuya | Procesar hasta ahí |
| `pause_turn` | El servidor pausó un turno largo | Reenviar la respuesta, con las mismas `tools`, para que continúe |
| `refusal` | El modelo se negó a responder | Manejarlo sin reintentar a ciegas; llega con HTTP 200 y `stop_details.category` |
| `model_context_window_exceeded` | La entrada más la salida no caben en la [[glosario/ventana-de-contexto]] | Tratarla como incompleta y recortar el contexto |

El error más común es asumir que toda respuesta es texto final y no tratar `max_tokens`: un JSON cortado a medias rompe el parseo. Con la compactación en el servidor (beta) puede aparecer además `compaction`. Para el caso del [[glosario/rechazo]], un [[glosario/fallback-de-modelo]] reintenta con otro modelo.

## Ver también

- [[roadmap/40-primer-agente/03-condiciones-de-parada]]
- [[docs/fundamentos/03-api-de-mensajes]]
- [[docs/agentes/01-el-bucle-agentico]]
- [[glosario/tool-use]]
- [[docs/fundamentos/06-motivos-de-parada-y-rechazos]]
- [[problemas/respuesta-cortada-por-max-tokens]]
