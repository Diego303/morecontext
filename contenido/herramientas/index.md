---
titulo: Herramientas
descripcion: Directorio curado y sin afiliados de frameworks, SDK e infraestructura para construir agentes, con licencia, versión revisada y cuándo usar cada uno.
creado: 2026-10-29
orden: 14
tags: [herramientas, directorio, open-source]
relacionados: ["[[docs/frameworks/01-elegir-framework]]", "[[docs/frameworks/02-equivalencias]]", "[[glosario/pesos-abiertos]]", "[[glosario/open-source-ai]]"]
---

Un directorio corto de las herramientas que de verdad sirven para construir agentes. Cada ficha dice qué es, cuándo usarla, **cuándo no**, un ejemplo mínimo comprobado y qué alternativas tiene. Si dudas entre usar un framework o el SDK a pelo, empieza por [[docs/frameworks/01-elegir-framework]].

## Criterio de inclusión

Entra una herramienta si cumple las tres cosas: es útil para construir, evaluar o desplegar agentes; está mantenida (versiones recientes y comunidad activa); y tiene documentación suficiente para empezar sin adivinar. Incluimos también herramientas propietarias cuando son relevantes, diciendo siempre que lo son.

**Sin afiliados.** Nadie paga por aparecer, no hay enlaces de afiliado ni patrocinios, y los enlaces apuntan a la documentación, al registro de paquetes o al repositorio oficial.

## Open source, pesos abiertos y propietario

- **Open source**: el código tiene una licencia aprobada por la OSI (MIT, Apache-2.0, BSD…). Puedes usarlo, modificarlo y redistribuirlo.
- **Pesos abiertos**: se descargan los pesos de un modelo, con la licencia que sea. No equivale a *[[glosario/open-source-ai|open source AI]]*, que exige también datos y código ([[glosario/pesos-abiertos]]).
- **Propietario o comercial**: licencia del fabricante o servicio de pago. Ojo con el término medio: licencias *source-available* como Elastic-2.0 (el servidor de LangGraph, Phoenix) dejan leer el código pero no son OSI.

Muchos proyectos abiertos tienen una parte comercial al lado (LangSmith, CrewAI AMP, Logfire…). Cada ficha la nombra.

## Cómo leer una ficha

La cabecera resume: **categoría**, **licencia** (identificador SPDX o «propietaria»), si es **open source**, **lenguajes**, **versión revisada** y **fecha de revisión**. Todas las fichas se revisaron el 29 de octubre de 2026 contra PyPI, npm, el `LICENSE` de cada repositorio y los paquetes instalados. Si lees esto mucho después, comprueba la versión antes de copiar código.

## Frameworks y SDK

- **SDK de proveedor**: [[herramientas/anthropic-sdk]] · [[herramientas/claude-agent-sdk]] · [[herramientas/vercel-ai-sdk]]
- **Frameworks de agentes**: [[herramientas/langchain]] · [[herramientas/langgraph]] · [[herramientas/deepagents]] · [[herramientas/openai-agents-sdk]] · [[herramientas/pydantic-ai]] · [[herramientas/crewai]] · [[herramientas/google-adk]] · [[herramientas/microsoft-agent-framework]] · [[herramientas/smolagents]] · [[herramientas/strands-agents]] · [[herramientas/mastra]]
- **Datos, RAG y optimización**: [[herramientas/llamaindex]] · [[herramientas/haystack]] · [[herramientas/dspy]]
- **Protocolo y pasarela**: [[herramientas/mcp-sdks]] · [[herramientas/litellm]]

## Infraestructura

- **Inferencia local**: [[herramientas/ollama]] · [[herramientas/vllm]] · [[herramientas/llama-cpp]] · [[herramientas/lm-studio]]
- **Bases vectoriales**: [[herramientas/pgvector]] · [[herramientas/qdrant]] · [[herramientas/chroma]] · [[herramientas/lancedb]]
- **Ingesta**: [[herramientas/docling]]
- **Observabilidad**: [[herramientas/langfuse]] · [[herramientas/arize-phoenix]]
- **Evals**: [[herramientas/promptfoo]] · [[herramientas/deepeval]] · [[herramientas/ragas]] · [[herramientas/inspect-ai]]
- **Guardrails**: [[herramientas/llama-guard]]
- **Agentes de código**: [[herramientas/claude-code]] · [[herramientas/aider]] · [[herramientas/cline]] · [[herramientas/opencode]] · [[herramientas/openhands]] · [[herramientas/goose]]
- **Interfaz**: [[herramientas/open-webui]]

Para ver cómo se llama el mismo concepto en cada framework, consulta [[docs/frameworks/02-equivalencias]].
