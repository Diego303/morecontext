---
titulo: Middleware de agente
descripcion: Código que se engancha en puntos fijos del bucle de un agente, antes o después del modelo o de una herramienta, para cambiar su comportamiento sin reescribirlo.
creado: 2026-10-29
categoria: agentes
ingles: Agent middleware
aliases: [middleware, agent middleware, AgentMiddleware]
tags: [agentes, langchain, frameworks, harness]
relacionados: ["[[cursos/langchain-y-langgraph/04-middleware]]", "[[docs/frameworks/04-langchain]]", "[[glosario/hook]]", "[[glosario/framework-de-agentes]]"]
---

Un middleware de agente es una pieza de código que el bucle llama en momentos concretos de cada vuelta. Sirve para añadir límites, aprobaciones, resúmenes o caché a un agente ya hecho sin tocar el bucle.

## En la práctica

En LangChain 1.x, `create_agent(..., middleware=[...])` acepta una lista de middleware que se enganchan en `before_agent`, `before_model`, `wrap_model_call`, `wrap_tool_call`, `after_model` y `after_agent`. Vienen varios hechos: `ModelCallLimitMiddleware` (tope de llamadas), `HumanInTheLoopMiddleware` (aprobación), `SummarizationMiddleware` (compactación), `PIIMiddleware`, `ToolErrorMiddleware` y, para Claude, `AnthropicPromptCachingMiddleware`. `ToolErrorMiddleware` merece atención: sin él, una excepción dentro de una herramienta rompe el agente en vez de volver al modelo como error. Para los tuyos hay decoradores (`@before_model`, `@wrap_tool_call`…).

Muchas mejoras de un [[glosario/harness]] son middleware: LangChain mejoró Deep Agents con uno que verifica contra la spec antes de terminar y otro que detecta bucles de edición. Recuerda que algunos inyectan texto en el prompt y cuestan tokens en cada llamada.

## No confundir con

- **[[glosario/hook]] de Claude Code**: misma idea, pero es un proceso externo que se configura en `settings.json`.
- **Middleware web**: el de un servidor HTTP.

## Ver también

- [[cursos/langchain-y-langgraph/03-tu-primer-agente-con-create-agent]]
- [[herramientas/langchain]]
- [[glosario/guardrails]]
