---
titulo: A2A
descripcion: Protocolo abierto para que un agente delegue tareas en otro agente remoto, descubierto por su Agent Card, sin ver sus herramientas ni su modelo.
creado: 2026-10-29
categoria: herramientas
ingles: Agent2Agent protocol
aliases: [Agent2Agent, protocolo A2A, agent-to-agent]
tags: [herramientas, protocolo, estandares, multiagente]
relacionados: ["[[docs/estandares/03-a2a]]", "[[glosario/agent-card]]", "[[glosario/mcp]]", "[[cursos/sistemas-multiagente/index]]"]
---

A2A (*Agent2Agent*) es un protocolo abierto para que un agente encargue trabajo a otro agente, aunque estén hechos con frameworks distintos y los mantengan organizaciones distintas. El agente remoto es opaco: quien llama ve su descripción y el estado de la tarea, no su prompt, sus herramientas ni su modelo. Hoy está en la Agentic AI Foundation y la versión vigente es la 1.0.

## En la práctica

El agente remoto publica su [[glosario/agent-card]] en `/.well-known/agent-card.json`: nombre, qué sabe hacer (*skills*), interfaces y esquemas de autenticación. El cliente le envía un mensaje (`SendMessage`) y recibe una **tarea** con estados (`WORKING`, `INPUT_REQUIRED`, `COMPLETED`, `FAILED`…), un historial y artefactos de salida. Puede seguirla por *streaming* o con notificaciones, porque una tarea puede durar segundos u horas. Hay bindings JSON-RPC, HTTP+JSON y gRPC, y SDK oficiales; en Python, `a2a-sdk` (Apache 2.0).

Úsalo cuando el otro agente lo opera otro equipo o empresa. Si los dos son tuyos y viven en el mismo proceso, un [[glosario/subagente]] o un [[glosario/handoff]] es más simple.

## No confundir con

- **[[glosario/mcp]]**: conecta un agente con herramientas y datos; A2A conecta agentes entre sí. Son complementarios.

## Ver también

- [[cursos/sistemas-multiagente/01-arquitecturas]]
- [[docs/estandares/index]]
- [[glosario/orquestador]]
