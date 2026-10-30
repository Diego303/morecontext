---
titulo: Agentes
descripcion: Referencia para construir agentes con la API de Mensajes, desde el bucle básico hasta subagentes y aprobación humana.
creado: 2026-10-14
actualizado: 2026-10-29
orden: 5
tags: [agentes, docs]
relacionados: ["[[glosario/agente]]", "[[roadmap/40-primer-agente/index]]", "[[patrones/08-agente-autonomo]]"]
---

Un [[glosario/agente|agente]] es un modelo que decide sus propios pasos dentro de un bucle: pide herramientas, lee los resultados y sigue hasta terminar la tarea. Este grupo reúne la referencia técnica para construirlo bien. Aquí no hay teoría de introducción: para eso está el nivel [[roadmap/40-primer-agente/index]] del roadmap.

## Qué cubre

- **[[docs/agentes/01-el-bucle-agentico]]**. La pieza central. Cómo se escribe el bucle, qué hacer con cada `stop_reason`, cómo devolver los `tool_result` y cómo poner límites de pasos y de gasto. Si solo lees un artículo, que sea este.
- **[[docs/agentes/02-subagentes]]**. Cuándo conviene que un agente delegue en otros con contexto propio, cómo se reparte el trabajo y qué cuesta. Úsalo cuando el contexto de un único agente se te llena o cuando hay subtareas independientes que pueden ir en paralelo.
- **[[docs/agentes/03-humano-en-el-bucle]]**. Dónde poner puntos de aprobación, cómo pausar el bucle sin perder el estado y cómo devolverle al modelo un «no» del usuario.
- **[[docs/agentes/04-managed-agents]]**. El *harness* alojado de Anthropic: agentes, entornos, sesiones y eventos, y cuándo compensa frente al Agent SDK o la API en bruto.

Cada artículo muestra primero el bucle escrito a mano con el SDK y después cómo se hace con un framework abierto (LangGraph, LangChain), para que veas qué te da y qué te esconde.

## Antes de empezar

Necesitas dominar el ciclo de herramientas: [[docs/herramientas/01-uso-de-herramientas]] lo explica en detalle. Y antes de construir un agente, pregúntate si te basta un [[glosario/workflow|workflow]] con pasos fijos. [[patrones/01-workflows-vs-agentes]] te ayuda a decidirlo; la respuesta suele ser que sí, al menos al principio.

## Hechos o a mano

Entre escribir el bucle y delegarlo todo hay un espectro: la API en bruto (este grupo), un framework open source ([[docs/frameworks/index]]), el Claude Agent SDK, que es el *harness* de Claude Code como biblioteca ([[docs/frameworks/03-claude-agent-sdk]]), Claude Code como agente listo para usar ([[docs/claude-code/index]]) y Managed Agents. Con modelos abiertos, el bucle es el mismo; cambia el servidor ([[docs/modelos-abiertos/index]]).

## Para seguir

Cuando el agente funcione, pasa a medirlo con [[docs/evals/index]] y a vigilarlo con [[docs/produccion/index]]. Antes de darle herramientas que escriben o borran, lee [[docs/seguridad/index]].
