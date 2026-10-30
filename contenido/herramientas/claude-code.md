---
titulo: Claude Code
descripcion: Agente de código de Anthropic para terminal, editor y CI, propietario, que se configura con CLAUDE.md, skills, subagentes, hooks, permisos y MCP.
creado: 2026-10-29
tags: [agente-de-codigo, claude-code, terminal]
relacionados: ["[[docs/claude-code/index]]", "[[cursos/agentes-de-codigo/index]]", "[[herramientas/claude-agent-sdk]]", "[[sistemas/harness-sdd-claude-code]]"]
categoria: agente-de-codigo
licencia: propietaria
open_source: false
lenguajes: [TypeScript]
url: https://code.claude.com/docs
repositorio: https://github.com/anthropics/claude-code
version: "2.1.312"
revisado: 2026-10-29
---

Claude Code es el agente de código de Anthropic. Trabaja en tu repositorio desde la terminal (y desde el editor o en CI): lee ficheros, ejecuta comandos, edita y verifica en bucle. Se distribuye por npm (`@anthropic-ai/claude-code`) y es **propietario**: su licencia remite al README, no a una licencia open source. El repositorio público de GitHub sirve para incidencias y documentación, no contiene el código del agente. Se usa con una cuenta de Claude o con clave de API.

## Para qué sirve

- Delegar tareas de código completas con un flujo de [[disciplinas/explorar-planificar-implementar-verificar]].
- Construir tu propio [[glosario/harness]] sobre él con sus primitivas:
  - [[glosario/claude-md]] (gestionado → usuario → proyecto → local; se concatenan) y lectura nativa de [[glosario/agents-md]] cuando no hay `CLAUDE.md`.
  - [[glosario/skill|Skills]] en `.claude/skills/<nombre>/SKILL.md` y [[glosario/subagente|subagentes]] en `.claude/agents/*.md`.
  - [[glosario/hook|Hooks]] (33 eventos; salir con código 2 bloquea) y permisos `allow`/`ask`/`deny`, evaluados deny → ask → allow.
  - Servidores [[glosario/mcp]], plugins, *worktrees* y tareas en segundo plano.
- Automatizar en CI con el modo *headless* (`claude -p`).

## Cuándo usarla

Cuando usas modelos de Claude y quieres el agente con más primitivas de control para montar un flujo de trabajo serio, como [[sistemas/harness-sdd-claude-code]]. Si lo que quieres es el mismo bucle dentro de tu propia aplicación, existe [[herramientas/claude-agent-sdk]].

## Cuándo no

- Si necesitas una herramienta open source o auditar el código del agente: [[herramientas/opencode]], [[herramientas/cline]] o [[herramientas/aider]].
- Para usarlo con modelos locales como opción principal: se puede apuntar a Ollama (`ANTHROPIC_BASE_URL=http://localhost:11434`, `ANTHROPIC_AUTH_TOKEN=ollama`, `ANTHROPIC_API_KEY=""`, o `ollama launch claude`), pero el agente sigue siendo propietario y la calidad depende del modelo local.

> [!peligro] El sandbox no lo cubre todo
> El *sandbox* de Bash (Seatbelt en macOS, bubblewrap en Linux) **no cubre** las herramientas de ficheros, MCP ni los *hooks*. Y `claude -p` sin `--bare` ejecuta los *hooks* y servidores MCP del repositorio **sin mostrar el diálogo de confianza**: cuidado en CI con repositorios ajenos ([[docs/claude-code/06-permisos-y-sandbox]]).

## Ejemplo mínimo

```bash
npm install -g @anthropic-ai/claude-code
cd tu-proyecto
claude                     # sesión interactiva en el repositorio
```

En CI, modo *headless* con salida JSON y sin cargar la configuración del repositorio:

```bash
claude -p "Revisa el diff y lista los riesgos" --bare --output-format json --max-budget-usd 1
```

`--bare` ignora *hooks*, *skills*, plugins, MCP, memoria y `CLAUDE.md`, y solo usa `ANTHROPIC_API_KEY`: es el modo recomendado para scripts. Un *hook* que bloquea comandos peligrosos está paso a paso en [[recetas/hook-que-bloquea-comandos-peligrosos]]. No se ha ejecutado aquí (sin credenciales).

## Alternativas

- [[herramientas/opencode]], [[herramientas/cline]], [[herramientas/aider]], [[herramientas/goose]] y [[herramientas/openhands]]: agentes open source.
- Codex CLI (Apache-2.0) y Gemini CLI (Apache-2.0): ver [[docs/modelos-abiertos/10-agentes-de-codigo-abiertos]].
- [[herramientas/claude-agent-sdk]]: el mismo agente como biblioteca.

## Enlaces

- Documentación: [code.claude.com/docs](https://code.claude.com/docs)
- Paquete npm: [npmjs.com/package/@anthropic-ai/claude-code](https://www.npmjs.com/package/@anthropic-ai/claude-code)
- Repositorio (incidencias): [github.com/anthropics/claude-code](https://github.com/anthropics/claude-code)
