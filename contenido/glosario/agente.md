---
titulo: Agente
descripcion: Sistema en el que un modelo decide en un bucle qué herramientas usar y qué pasos dar hasta completar una tarea.
creado: 2026-07-08
categoria: agentes
ingles: agent
aliases: [agent, agente de IA, AI agent]
tags: [agentes]
relacionados: ["[[roadmap/40-primer-agente/01-que-es-un-agente]]", "[[patrones/08-agente-autonomo]]"]
---

Un agente es un sistema en el que un [[glosario/llm|LLM]] dirige su propio proceso: decide qué herramientas llamar, observa los resultados y elige el siguiente paso hasta terminar la tarea o chocar con un límite. Lo que lo distingue de un [[glosario/workflow]] es quién decide el camino: en el workflow lo fija tu código; en el agente, el modelo.

## En la práctica

Técnicamente es un [[glosario/bucle-agentico]]: llamas al modelo con herramientas, ejecutas cada `tool_use` que pide, devuelves un [[glosario/tool-result]] por cada uno y repites mientras `stop_reason` sea `"tool_use"`. La fiabilidad depende de lo que rodea al bucle: herramientas bien descritas, límite de pasos y de gasto, trazas para depurar y [[glosario/humano-en-el-bucle|aprobación humana]] antes de acciones irreversibles.

## No confundir con

- **Workflow**: pasos fijos orquestados por código, aunque cada paso use un modelo. Es más predecible y barato; empieza por ahí si la tarea lo permite.
- **Chatbot**: responde turno a turno, pero no actúa sobre el entorno.

## Ver también

- [[roadmap/40-primer-agente/01-que-es-un-agente]]
- [[patrones/01-workflows-vs-agentes]]
- [[patrones/08-agente-autonomo]]
- [[glosario/tool-use]]
