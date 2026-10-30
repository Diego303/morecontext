---
titulo: Agentes de código abiertos
descripcion: Licencia real de cada agente de código (OpenCode, Codex CLI, Gemini CLI, Cline, Kilo Code, Aider, OpenHands), cómo conectarlos a un modelo local con ollama launch y qué contexto necesitan.
creado: 2026-10-29
orden: 10
nivel: intermedio
tags: [agentes-de-codigo, modelos-abiertos, ollama, licencias, agents-md]
relacionados: ["[[sistemas/agente-de-codigo]]", "[[recetas/agente-de-codigo-con-modelo-local]]", "[[herramientas/opencode]]", "[[glosario/agents-md]]"]
---

Un **agente de código** es un bucle agéntico especializado: lee tu repositorio, edita ficheros, ejecuta comandos y tests, y repite hasta terminar la tarea. Varios de los más usados tienen el código publicado con licencia OSI y aceptan cualquier modelo, también uno de [[glosario/pesos-abiertos|pesos abiertos]] servido en tu máquina. Esta página separa lo que es open source de lo que no, explica cómo conectarlos a un modelo local y qué esperar de ellos.

## Licencias

| Agente | Versión (oct. 2026) | Licencia | Tipo |
|---|---|---|---|
| [[herramientas/opencode\|OpenCode]] (`opencode-ai`) | 1.19.5 | MIT | Terminal, cualquier proveedor |
| Codex CLI (`@openai/codex`) | 0.166.0 (29 oct.) | Apache-2.0 | Terminal; `--oss` para modelos locales |
| Gemini CLI (`@google/gemini-cli`) | 0.66.0 | Apache-2.0 | Terminal |
| [[herramientas/cline\|Cline]] (CLI y extensión) | 3.0.74 | Apache-2.0 | Editor y terminal; MCP, reglas y *skills*; cualquier endpoint compatible con OpenAI |
| Kilo Code CLI (`@kilocode/cli`) | 7.8.18 | MIT | Terminal |
| [[herramientas/aider\|Aider]] | 0.86.2 (12 feb. 2026) | Apache-2.0 | Edición sobre git; requiere Python < 3.13; sin versiones desde febrero |
| [[herramientas/openhands\|OpenHands]] | 1.11.0 (9 jul.) | MIT | Agente de desarrollo con sandbox Docker |
| Continue CLI | 1.5.47 (jun. 2026) | Apache-2.0 | Menos actividad reciente |
| Crush (Charm) | 0.99.0 | **FSL-1.1-MIT** | Fuente disponible, **no OSI** al publicarse (pasa a MIT con el tiempo) |
| [[herramientas/claude-code\|Claude Code]] | No aplica | **Propietario** | Aquí solo como cliente de un modelo local |

Licencias leídas del `LICENSE` de cada paquete en npm o PyPI. De [[herramientas/goose|goose]], Roo Code y Qwen Code no se pudo confirmar licencia y versión para esta página: consúltalas en sus repositorios.

Tres categorías que conviene no mezclar:

- **Open source (OSI)**: puedes usar, modificar y redistribuir, también comercialmente. Todos los de la tabla menos los dos últimos.
- **Fuente disponible**: ves el código, pero la licencia limita algún uso (la FSL prohíbe usos competidores durante un tiempo). Crush está aquí.
- **Propietario**: Claude Code. Que pueda hablar con un modelo local no lo convierte en abierto, y su licencia rige igual.

## Conectarlos a un modelo local

Ollama trae un comando que configura y lanza el agente contra el servidor local: `ollama launch`. Según la [documentación de Ollama](https://docs.ollama.com/integrations/opencode), funciona con `claude`, `codex`, `opencode` y `droid`; `--config` configura sin abrir la sesión. Los tres más usados, a mano:

**OpenCode** lee un proveedor compatible con OpenAI de `opencode.json`:

```json title="opencode.json"
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": { "baseURL": "http://localhost:11434/v1" },
      "models": { "qwen3.6:27b": { "name": "qwen3.6:27b" } }
    }
  }
}
```

**Codex CLI** tiene el atajo `codex --oss -m gpt-oss:120b`. `ollama launch codex --config` genera un perfil en `~/.codex/ollama-launch.config.toml` con esta forma, que usas con `codex --profile ollama-launch`:

```toml title="ollama-launch.config.toml"
model = "gpt-oss:120b"
model_provider = "ollama-launch"

[model_providers.ollama-launch]
name = "Ollama"
base_url = "http://localhost:11434/v1/"
wire_api = "responses"
```

**Claude Code** habla el formato de Anthropic, que Ollama sirve en `/v1/messages`:

```bash
export ANTHROPIC_BASE_URL=http://localhost:11434
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_API_KEY=""
claude --model qwen3.6:27b
```

La documentación avisa de que los ajustes de Claude Code pueden pisar estas variables: compruébalo con `/status`. Comandos de la documentación de Ollama a 29 oct. 2026; no ejecutados aquí, porque necesitan un servidor Ollama con un modelo descargado. El recorrido completo, con un repositorio de prueba: [[recetas/agente-de-codigo-con-modelo-local]].

> [!aviso] Las etiquetas `:cloud` no son locales
> `gpt-oss:120b-cloud` o `gemma4:cloud` se ejecutan en los servidores de Ollama aunque las lances desde `ollama launch`. Si eliges un modelo abierto por privacidad, comprueba que la etiqueta no termina en `cloud`.

## Contexto mínimo: 64k

Todos estos agentes piden un modelo con herramientas y **al menos 64 000 tokens de contexto**. Lo dicen las guías de integración de Ollama para OpenCode, Codex y Claude Code. Un agente de código mete en cada llamada su prompt de sistema, las definiciones de herramientas, ficheros enteros y salidas de comandos: con los 4k u 8k que Ollama puede usar por defecto, el principio de la conversación se recorta **sin aviso** y el agente olvida la tarea o las herramientas.

Súbelo en el servidor (`OLLAMA_CONTEXT_LENGTH=65536 ollama serve`) o en un Modelfile con `PARAMETER num_ctx 65536`, y comprueba con `ollama ps` (columna `CONTEXT`) que se aplica. Recuerda que más contexto es más memoria de [[glosario/kv-cache|KV cache]]: la cuenta está en [[modelos/12-inferencia-local]].

## AGENTS.md y skills

Para que el agente conozca tu proyecto sin repetirlo en cada sesión hay dos piezas abiertas, hoy ambas en la Agentic AI Foundation:

- **[[glosario/agents-md|AGENTS.md]]**: un Markdown en la raíz del repositorio con comandos, convenciones y decisiones. Claude Code lo lee de forma nativa cuando no hay `CLAUDE.md` (o lo importas con `@AGENTS.md`). Qué otros agentes lo leen y con qué precedencia cambia con frecuencia: no se pudo confirmar agente por agente para esta página, así que compruébalo en la documentación de cada uno. Plantilla: [[plantillas/agents-md]].
- **[[glosario/skill|Skills]]**: carpetas con un `SKILL.md` que el agente carga solo cuando la tarea lo pide. Cline declara soporte de *skills* y MCP; Qwen Code también menciona *skills*. Formato y riesgos: [[docs/estandares/04-agent-skills-y-agents-md]] y [[docs/seguridad/04-mcp-y-skills-de-terceros]].

Con un modelo local, las dos cosas pesan más: cada línea de `AGENTS.md` ocupa contexto que ya es escaso. Mantenlo corto y que apunte a `docs/` para el detalle.

## Qué esperar de un modelo local

- **Los modelos pequeños fallan más en bucles largos de herramientas**: llamadas mal formadas, herramientas inventadas, repeticiones. Empieza con tareas acotadas (un fichero, un test que pasar) y sube cuando lo midas. Si no llama a herramientas, ver [[problemas/modelo-local-no-llama-herramientas]].
- **Las funciones que dependen del proveedor desaparecen**: Ollama no acepta `tool_choice` ni *prompt caching*, y la búsqueda web alojada no está en todos los modos.
- **El modelo cuenta más que el agente.** Antes de cambiar de agente, prueba el mismo con otro modelo o con más contexto.

> [!peligro] Saltarse los permisos, solo en un entorno aislado
> Flags como `--dangerously-skip-permissions` o los modos «sin preguntar» de cada agente le dejan ejecutar cualquier comando. La documentación de Ollama lo admite solo «en un entorno aislado»: un contenedor o una máquina virtual sin tus credenciales. Cómo montarlo: [[docs/modelos-abiertos/09-guardrails-y-sandbox]].

## Errores frecuentes

| Error | Consecuencia | Arreglo |
|---|---|---|
| Contexto por defecto de Ollama | El agente olvida la tarea a mitad | 64k o más, comprobado con `ollama ps` |
| Llamar «open source» a todo lo que tiene repositorio | Problemas de licencia al redistribuir | Distingue OSI, fuente disponible y propietario |
| Elegir modelo sin soporte de herramientas | El agente responde en texto y no actúa | Modelo con capacidad `tools` en la biblioteca |
| Usar un modelo `:cloud` pensando que es local | El código sale de tu máquina | Revisa la etiqueta |
| Modo sin permisos en tu máquina de trabajo | Comandos destructivos con tus credenciales | Solo en sandbox |

## Ver también

- [[sistemas/agente-de-codigo]]: cómo se construye un agente de código por dentro.
- [[cursos/agentes-de-codigo/02-contexto-del-repositorio]]: qué contarle al agente del repositorio.
- [[docs/modelos-abiertos/01-ollama]]: el servidor que hay debajo.
- [[docs/modelos-abiertos/03-apis-compatibles-y-litellm]]: servir estos agentes contra otros backends.
