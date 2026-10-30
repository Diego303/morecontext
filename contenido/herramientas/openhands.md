---
titulo: OpenHands
descripcion: Plataforma open source para ejecutar agentes de desarrollo en local, en Docker o en un servidor, con automatizaciones por eventos y cualquier modelo.
creado: 2026-10-29
tags: [agente-de-codigo, sandbox, automatizacion]
relacionados: ["[[docs/modelos-abiertos/10-agentes-de-codigo-abiertos]]", "[[sistemas/agente-de-larga-duracion]]", "[[glosario/sandbox]]"]
categoria: agente-de-codigo
licencia: MIT
open_source: true
lenguajes: [Python, TypeScript]
url: https://docs.openhands.dev/overview/introduction
repositorio: https://github.com/OpenHands/OpenHands
version: "1.11.0"
revisado: 2026-10-29
---

OpenHands es una plataforma open source (MIT) para ejecutar agentes de desarrollo de software. El agente trabaja sobre un servidor de agentes (*Agent Server*, una API REST) que puede correr en tu portátil, en un contenedor Docker o en una máquina en la nube, y se maneja desde una interfaz web llamada **Agent Canvas**. Se conecta a cualquier LLM y también puede orquestar otros agentes compatibles con ACP (Agent-Client Protocol), como Claude Code, Codex o Gemini.

**El proyecto está cambiando de forma.** El README avisa de que el código se está moviendo: el agente y el servidor viven ahora en `OpenHands/software-agent-sdk` y la interfaz en `OpenHands/agent-canvas`. La versión 1.11.0 del paquete `openhands-ai` es del 9 de julio; la imagen de Agent Canvas del README es una *release candidate* (`1.0.0-rc.11`). Cuenta con cambios.

## Para qué sirve

- Agentes que siguen trabajando en un servidor con el portátil cerrado ([[sistemas/agente-de-larga-duracion]]).
- Automatizaciones programadas o disparadas por eventos de Slack, GitHub o Linear (revisión de código, actualización de dependencias).
- Varios *backends* (local, compartido con el equipo, nube) desde la misma interfaz.

## Cuándo usarla

Cuando quieres agentes de código como servicio interno de tu equipo, autoalojados, con *sandbox* y disparadores, y no solo un agente en tu terminal.

## Cuándo no

- Para trabajar tú con un agente en la terminal: [[herramientas/opencode]], [[herramientas/aider]] o [[herramientas/claude-code]] son más directos.
- Si necesitas estabilidad de API ahora mismo: espera a que termine la transición a Agent Canvas.

> [!peligro] Sin sandbox, acceso total
> Las opciones «sin *sandbox*» y «desde el código fuente» ejecutan el servidor del agente directamente en tu máquina: **el agente tiene acceso completo a tu sistema de ficheros**. Usa la opción con Docker y monta solo la carpeta de proyectos ([[cursos/seguridad-y-prompt-injection/04-permisos-y-sandbox]]).

## Ejemplo mínimo

Con *sandbox* Docker, del README (no se ha ejecutado aquí):

```bash
export PROJECTS_PATH="$HOME/projects"   # solo esta carpeta será visible para el agente
mkdir -p "$PROJECTS_PATH" "$HOME/.openhands"

docker run -it --rm \
  -p 8000:8000 \
  -v "$HOME/.openhands:/home/openhands/.openhands" \
  -v "${PROJECTS_PATH}:/projects" \
  ghcr.io/openhands/agent-canvas:1.0.0-rc.11
```

Abre `http://localhost:8000`, configura el modelo en los ajustes de LLM y elige un proyecto de `/projects`. Para exponerlo a tu equipo, sigue la guía de autoalojamiento y su apartado de endurecimiento de seguridad.

## Alternativas

- [[herramientas/goose]]: agente abierto con escritorio, CLI y extensiones MCP.
- [[herramientas/cline]]: CLI y extensión con aprobaciones.
- [[herramientas/claude-code]]: propietario; con su modo *headless* también sirve en CI ([[docs/claude-code/08-modo-headless-y-ci]]).

## Enlaces

- Documentación: [docs.openhands.dev](https://docs.openhands.dev/overview/introduction)
- Autoalojamiento: [docs.openhands.dev/…/backend-setup/vm](https://docs.openhands.dev/openhands/usage/agent-canvas/backend-setup/vm)
- Repositorio principal: [github.com/OpenHands/OpenHands](https://github.com/OpenHands/OpenHands)
- Agent Canvas: [github.com/OpenHands/agent-canvas](https://github.com/OpenHands/agent-canvas)
