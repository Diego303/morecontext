---
titulo: Agent Skills pasa a la Agentic AI Foundation
descripcion: Anthropic donó el estándar Agent Skills a la Agentic AI Foundation el 22 de octubre de 2026. Qué significa para quien escribe skills y cómo mantenerlas portables.
creado: 2026-10-27
categoria: herramientas
tags: [skills, estandares, gobernanza, agentes]
fuente:
  titulo: Donating Agent Skills to the Agentic AI Foundation · Anthropic
  url: https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation
relacionados: ["[[docs/estandares/04-agent-skills-y-agents-md]]", "[[roadmap/50-skills/index]]", "[[glosario/skill]]", "[[radar/2026-10-26-skills-cadena-de-suministro]]"]
---

## Qué es

El 22 de octubre de 2026 Anthropic donó Agent Skills a la Agentic AI Foundation (AAIF), de la Linux Foundation: el estándar, el nombre, el logo, la organización de GitHub y el dominio agentskills.io ([anuncio](https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation)). La AAIF ya aloja MCP, A2A y [[glosario/agents-md|AGENTS.md]], entre otros. El estándar lo mantienen, a título individual, ingenieros de Anthropic, Google, OpenAI y otras empresas, con David Soria Parra y Mahesh Murag como *lead maintainers*. Para usarlo o contribuir no hace falta ser miembro de la fundación.

Una [[glosario/skill|skill]] es una carpeta con un `SKILL.md` (frontmatter YAML y Markdown) y, si hace falta, `scripts/`, `references/` y `assets/`. El agente la carga por [[glosario/divulgacion-progresiva|divulgación progresiva]].

## Qué cambia en la práctica

- El formato deja de depender de un solo proveedor. [Según Anthropic](https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation), más de 70 plataformas de agentes lo han integrado desde que se publicó, en diciembre de 2025.
- La [especificación](https://agentskills.io/specification) marca qué es portable. Obligatorios: `name` (1–64 caracteres `a-z0-9-`, igual al nombre de la carpeta) y `description` (hasta 1.024). Opcionales: `license`, `compatibility`, `metadata` y `allowed-tools` (experimental).
- Los campos propios de un cliente, como `disable-model-invocation` o `context: fork` en Claude Code, solo valen en ese cliente. La Skills API de Anthropic, por ejemplo, acepta únicamente los seis del estándar.
- La hoja de ruta, presentada como propuesta, incluye versiones numeradas, un proceso formal de propuestas y guía de seguridad para quien escribe e instala skills.

## Qué hacer

1. Valida tus skills con `skills-ref validate ./mi-skill` y separa lo portable de lo que solo entiende un cliente. Anatomía en [[roadmap/50-skills/02-anatomia-de-una-skill]] y referencia en [[docs/estandares/04-agent-skills-y-agents-md]].
2. Trata las skills ajenas como dependencias: revísalas antes de instalarlas ([[radar/2026-10-26-skills-cadena-de-suministro]] y [[roadmap/50-skills/05-skills-en-equipo]]).
3. Si empiezas de cero, sigue el nivel [[roadmap/50-skills/index]].
