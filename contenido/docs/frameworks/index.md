---
titulo: Frameworks de agentes
descripcion: "Referencia de los SDK y frameworks para construir agentes (Claude Agent SDK, LangChain, LangGraph, OpenAI Agents SDK, Pydantic AI, LlamaIndex y más), con licencias, equivalencias y código probado."
creado: 2026-10-29
orden: 10
tags: [frameworks, docs, open-source]
relacionados: ["[[glosario/framework-de-agentes]]", "[[cursos/langchain-y-langgraph/index]]", "[[roadmap/40-primer-agente/02-el-bucle-agentico]]"]
---

Un [[glosario/framework-de-agentes|framework de agentes]] es una librería que trae hecho el bucle agéntico y las piezas de alrededor: herramientas, límites, aprobación humana, memoria, trazas. En MoreContext cada concepto se explica primero con el SDK de Anthropic y el bucle escrito a mano, porque así ves el mecanismo. Este grupo es el siguiente paso: cómo se hace lo mismo con los frameworks, qué esconde cada uno y dónde muerde.

Todo el código de estas páginas se ha ejecutado con [[glosario/modelo-simulado|modelos simulados]] (o compilado, en TypeScript) con las versiones de octubre de 2026, y cada página muestra el modelo real (Claude) y cómo cambiar a uno local con Ollama cuando el framework lo permite.

## Tres familias

- **El SDK del proveedor.** Llamas a la API y escribes el bucle. Para Claude hay dos: el SDK de cliente (`anthropic`, en todo MoreContext) y el Claude Agent SDK, que trae el harness de Claude Code como librería.
- **Frameworks de bucle, open source.** El bucle modelo → herramientas → respuesta ya está escrito y lo configuras: LangChain, Pydantic AI, OpenAI Agents SDK, LlamaIndex, el AI SDK de Vercel.
- **Grafos y harnesses.** Defines pasos con estado (LangGraph) o te apoyas en un harness con opiniones (Deep Agents, CrewAI).

## Los artículos

1. **[[docs/frameworks/01-elegir-framework]]**. Ocho criterios, un árbol de decisión y una tabla comparativa. Empieza aquí.
2. **[[docs/frameworks/02-equivalencias]]**. El diccionario: cómo se llama cada concepto de la web en cada framework, con enlace a donde se explica. Tenlo abierto cuando traduzcas un ejemplo del SDK a un framework, o al revés.
3. **[[docs/frameworks/03-claude-agent-sdk]]**. Claude Code como librería: `query()`, opciones, herramientas MCP en proceso, hooks, permisos, subagentes y sesiones. Términos comerciales de Anthropic.
4. **[[docs/frameworks/04-langchain]]**. `create_agent`, middleware y salida estructurada. MIT.
5. **[[docs/frameworks/05-langgraph]]**. Estado, `interrupt`, checkpointers, `Send` y durabilidad. MIT; el despliegue gestionado es de pago.
6. **[[docs/frameworks/06-openai-agents-sdk]]**. Handoffs, guardrails, sesiones y trazas, con Claude vía LiteLLM. MIT.
7. **[[docs/frameworks/07-pydantic-ai]]**. Salida tipada, dependencias y las mejores herramientas para probar sin API. MIT.
8. **[[docs/frameworks/08-llamaindex]]**. Ingesta, índices y agentes para RAG. MIT.
9. **[[docs/frameworks/09-otros-frameworks]]**. CrewAI, Google ADK, Microsoft Agent Framework, smolagents, Haystack, DSPy, Strands y Agno, con sus trampas.
10. **[[docs/frameworks/10-deep-agents]]**. El harness de LangChain para tareas largas. MIT, beta.
11. **[[docs/frameworks/11-agentes-en-typescript]]**. AI SDK, LangChain.js, LangGraph.js, Mastra, OpenAI Agents JS y el Claude Agent SDK en TypeScript.

## Open source y comercial

Casi todo lo que aparece aquí es código con licencia MIT o Apache-2.0. Lo que no lo es se dice en cada página: los términos comerciales del Claude Agent SDK, los servicios de pago que acompañan a varios frameworks (LangSmith, CrewAI AMP, Logfire, LlamaCloud, el AI Gateway de Vercel) y licencias intermedias como la Elastic-2.0 del servidor de LangGraph, que permite leer el código pero no es open source OSI.

## Antes de empezar

Si no has escrito nunca un bucle agéntico, hazlo primero con [[roadmap/40-primer-agente/02-el-bucle-agentico]]. Si prefieres aprender un framework paso a paso, con ejercicios, el curso [[cursos/langchain-y-langgraph/index]] rehace el agente del nivel 40 con LangChain y LangGraph.
