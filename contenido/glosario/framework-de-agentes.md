---
titulo: Framework de agentes
descripcion: Biblioteca que trae hecho el bucle de un agente y sus piezas habituales (herramientas, estado, memoria, límites, aprobación, trazas) para no escribirlas a mano.
creado: 2026-10-29
categoria: agentes
ingles: Agent framework
aliases: [agent framework, frameworks de agentes, framework]
tags: [agentes, frameworks, open-source]
relacionados: ["[[docs/frameworks/01-elegir-framework]]", "[[docs/frameworks/02-equivalencias]]", "[[cursos/langchain-y-langgraph/01-cuando-usar-un-framework]]", "[[glosario/harness]]"]
---

Un framework de agentes es una biblioteca que implementa el [[glosario/bucle-agentico]] y lo rodea de piezas listas: definición de herramientas, estado y memoria, límites de pasos, aprobación humana, salida estructurada, *streaming* y trazas. Suele permitir cambiar de proveedor de modelo sin reescribir el agente.

## En la práctica

Los open source más usados en octubre de 2026 son LangChain (`create_agent`) y LangGraph (grafo explícito), Pydantic AI, el OpenAI Agents SDK, LlamaIndex y CrewAI, casi todos con licencia MIT o Apache 2.0. Lo comercial suele ir aparte: LangSmith, el Agent Server de LangGraph (Elastic 2.0) o CrewAI AMP. El Claude Agent SDK es otra cosa: Claude Code como biblioteca, con términos comerciales de Anthropic.

MoreContext enseña primero el bucle a mano con el SDK del proveedor, para que veas `stop_reason`, los bloques y `usage`, y después el framework, diciendo qué esconde. Los valores por defecto que no ves son el coste real de la abstracción: `ChatAnthropic` sin `max_tokens` usa el máximo del modelo, el Agents SDK envía las trazas a OpenAI y en LangChain una excepción en una herramienta rompe el agente si no añades `ToolErrorMiddleware`.

## No confundir con

- **[[glosario/harness]]**: el sistema completo alrededor del modelo; un framework es una forma de construirlo.
- **SDK del proveedor**: un cliente de la API, sin bucle ni estado.

## Ver también

- [[docs/frameworks/index]]
- [[glosario/middleware]]
- [[glosario/modelo-simulado]]
