---
titulo: Agent Card
descripcion: El documento JSON con el que un agente A2A anuncia quién es, dónde escucha, qué sabe hacer y cómo hay que autenticarse.
creado: 2026-10-29
categoria: agentes
ingles: Agent Card
aliases: [AgentCard, agent-card.json, tarjeta de agente]
tags: [a2a, estandares, agentes]
relacionados: ["[[glosario/a2a]]", "[[docs/estandares/03-a2a]]", "[[glosario/mcp]]"]
---

La Agent Card es la «tarjeta de visita» de un agente en el protocolo [[glosario/a2a]]. Es un documento JSON que el agente publica en `/.well-known/agent-card.json` para que otros agentes lo descubran antes de enviarle tareas: qué es, en qué URL y con qué protocolo atiende, qué capacidades soporta, qué sabe hacer y qué autenticación exige.

## En la práctica

Según el `a2a.proto` del SDK oficial (A2A 1.0), sus campos principales son `name`, `description`, `version` y `provider`; `supported_interfaces` (URL, *binding* JSON-RPC, gRPC o HTTP+JSON, y versión del protocolo); `capabilities` (`streaming`, `push_notifications`, `extensions`, `extended_agent_card`); `security_schemes` (clave de API, HTTP, OAuth2, OIDC, mTLS); los modos de entrada y salida por defecto; `skills`, cada una con `id`, `name`, `description`, `tags` y `examples`; y `signatures` para tarjetas firmadas. Si el agente ofrece más detalle a clientes autenticados, se pide con `GetExtendedAgentCard`. Escribe las `skills` como escribirías descripciones de herramientas: el agente cliente decide con ellas.

## No confundir con

- **[[glosario/skill]]** (Agent Skills): una carpeta con `SKILL.md`. Las `skills` de una Agent Card son solo descripciones de lo que el agente remoto ofrece.
- **Server Cards de MCP**: la extensión (beta) para descubrir los metadatos de un [[glosario/servidor-mcp]] antes de conectar.

## Ver también

- [[docs/estandares/03-a2a]]
- [[docs/estandares/02-extensiones-mcp]]
- [[docs/estandares/index]]
