---
titulo: Skill
descripcion: Carpeta con un SKILL.md y recursos opcionales que enseña a un agente un procedimiento y que este carga solo cuando la tarea lo pide.
creado: 2026-10-29
categoria: agentes
ingles: Agent skill
aliases: [skills, Agent Skills, agent skill, SKILL.md, habilidad]
tags: [agentes, skills, contexto]
relacionados: ["[[roadmap/50-skills/01-que-es-una-skill]]", "[[docs/estandares/04-agent-skills-y-agents-md]]", "[[docs/claude-code/03-skills]]", "[[glosario/divulgacion-progresiva]]"]
---

Una *skill* es un procedimiento empaquetado para un [[glosario/agente]]: una carpeta con un `SKILL.md` (frontmatter YAML más instrucciones en Markdown) y, si hace falta, `scripts/`, `references/` y `assets/`. El formato es un estándar abierto, Agent Skills, que hoy custodia la Agentic AI Foundation.

## En la práctica

Solo dos campos son obligatorios: `name` (igual que el nombre de la carpeta) y `description`, que dice qué hace y cuándo usarla. Esa descripción es lo único que el agente ve al principio; el cuerpo y los anexos entran en el contexto cuando la tarea los pide, por [[glosario/divulgacion-progresiva]]. Por eso la descripción decide si la skill se activa y el cuerpo conviene que sea corto. En Claude Code van en `.claude/skills/<nombre>/SKILL.md`, y `disable-model-invocation: true` hace que solo las lance una persona con `/nombre`. Una skill de terceros puede traer scripts: revísala como revisarías una dependencia.

## No confundir con

- **Herramienta** ([[glosario/tool-use]]): una función que el modelo llama con argumentos. La skill enseña *cómo* hacer algo y puede usar varias herramientas.
- **[[glosario/subagente]]**: otro agente con contexto propio. La skill se carga en el contexto del agente que la usa.

## Ver también

- [[roadmap/50-skills/03-carga-bajo-demanda]]
- [[plantillas/skill]]
- [[docs/seguridad/04-mcp-y-skills-de-terceros]]
- [[roadmap/50-skills/index]]
