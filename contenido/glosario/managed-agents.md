---
titulo: Managed Agents
descripcion: El harness de agente alojado de Anthropic, con bucle, sandbox y herramientas en su infraestructura, que controlas por API con sesiones y eventos.
creado: 2026-10-29
categoria: agentes
ingles: Claude Managed Agents
aliases: [Claude Managed Agents, agentes gestionados, harness alojado]
tags: [agentes, harness, api]
relacionados: ["[[docs/agentes/04-managed-agents]]", "[[radar/2026-10-29-harness-alojado-managed-agents]]", "[[glosario/harness]]"]
---

Claude Managed Agents es un [[glosario/harness]] de agente ya construido y configurable que Anthropic ejecuta en su infraestructura. Está en beta desde el 8 de abril de 2026. Encaja con tareas largas y asíncronas en las que no quieres programar tu propio bucle, [[glosario/sandbox]] ni capa de ejecución.

## En la práctica

Trabajas con cuatro conceptos: el **Agent** (modelo, prompt de sistema, herramientas, servidores MCP y skills), el **Environment** (el sandbox, en la nube o autoalojado, con red limitable por `allowed_hosts`), la **Session** (una ejecución) y los **Events** que envías (`user.message`, `user.interrupt`, `system.message`…) y recibes por SSE (`agent.message`, `agent.tool_use`, `session.status_idle`…). Las herramientas integradas llegan como un [[glosario/toolset]], `agent_toolset_20260401`: `bash`, `read`, `write`, `edit`, `glob`, `grep`, `web_fetch` y `web_search`, con políticas de permiso por herramienta. Se paga por hora de sesión activa además de los tokens (consulta la página de precios). No es apto para ZDR ni HIPAA, y no admite salidas estructuradas.

## No confundir con

- **Claude Agent SDK**: el mismo tipo de harness como biblioteca, pero lo ejecutas tú, en tu máquina o tu servidor.
- **API de Mensajes**: solo el modelo; el bucle y las herramientas los pones tú.

## Ver también

- [[docs/agentes/04-managed-agents]]
- [[herramientas/claude-agent-sdk]]
- [[radar/2026-10-29-harness-alojado-managed-agents]]
- [[docs/frameworks/03-claude-agent-sdk]]
