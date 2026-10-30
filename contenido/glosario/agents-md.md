---
titulo: AGENTS.md
descripcion: Archivo Markdown abierto, en la raíz de un repositorio, con las instrucciones del proyecto para agentes de código, sin depender de una herramienta concreta.
creado: 2026-10-29
categoria: agentes
aliases: [agents.md, AGENTS]
tags: [agentes, agentes-de-codigo, estandares]
relacionados: ["[[docs/estandares/04-agent-skills-y-agents-md]]", "[[docs/claude-code/01-memoria-claude-md-y-agents-md]]", "[[plantillas/agents-md]]", "[[glosario/claude-md]]"]
---

`AGENTS.md` es un formato abierto para dar instrucciones a agentes de código: un archivo Markdown, sin esquema, en la raíz del repositorio. Cuenta lo que un agente necesita saber del proyecto y no puede deducir rápido del código: stack, comandos de prueba, convenciones y decisiones ya fijadas. Es uno de los proyectos de la Agentic AI Foundation.

## En la práctica

Escribe reglas observables y comprobables («los tests se ejecutan con `uv run pytest -q`»), no deseos («escribe buen código»): cada línea se paga en tokens en cada sesión. OpenAI contó en [*Harness engineering*](https://openai.com/index/harness-engineering/) (febrero de 2026) que su `AGENTS.md` tiene unas cien líneas y funciona como índice que apunta a `docs/`. Claude Code lo lee de forma nativa cuando no hay `CLAUDE.md`; si tienes los dos, impórtalo desde `CLAUDE.md` con `@AGENTS.md`. En el harness del autor, `AGENTS.md` guarda las reglas del proyecto y queda por debajo del contrato del harness en precedencia.

Qué otras herramientas lo leen y con qué precedencia cambia con frecuencia: compruébalo en la documentación de cada una.

## No confundir con

- **[[glosario/claude-md]]**: el archivo propio de Claude Code, con niveles e imports.
- **[[glosario/skill]]**: un procedimiento que se carga cuando hace falta; `AGENTS.md` se lee siempre.

## Ver también

- [[cursos/agentes-de-codigo/02-contexto-del-repositorio]]
- [[glosario/divulgacion-progresiva]]
- [[glosario/harness]]
