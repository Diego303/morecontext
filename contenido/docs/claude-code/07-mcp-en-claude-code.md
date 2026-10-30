---
titulo: MCP en Claude Code
descripcion: Cómo añadir servidores MCP a Claude Code con claude mcp add y .mcp.json, sus tres alcances, la aprobación de servidores del proyecto, los permisos de sus herramientas, el coste en contexto y la seguridad.
creado: 2026-10-29
orden: 7
nivel: intermedio
tags: [claude-code, mcp, herramientas, seguridad]
relacionados: ["[[glosario/servidor-mcp]]", "[[docs/herramientas/02-mcp]]", "[[cursos/mcp-de-cero-a-servidor/index]]", "[[problemas/servidor-mcp-no-aparece]]"]
---

Claude Code es un cliente [[glosario/mcp|MCP]]: puede conectarse a servidores que le dan herramientas nuevas (consultar una base de datos, leer incidencias, manejar un navegador). Cada herramienta de un servidor aparece como `mcp__<servidor>__<herramienta>` y se gobierna con los mismos permisos y hooks que las integradas. Este artículo explica cómo se añaden, dónde se guardan, cuánto cuestan en contexto y qué riesgos traen. El protocolo en sí está en [[docs/herramientas/02-mcp]].

## Añadir un servidor

```bash
# Remoto por HTTP (Streamable HTTP)
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Remoto con cabecera de autenticación
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ \
  --header "Authorization: Bearer $GITHUB_PAT"

# Local por stdio: todo lo que va tras -- es el comando del servidor
claude mcp add --transport stdio --env DB_URL=postgresql://lectura@localhost/app db \
  -- npx -y @bytebase/dbhub --dsn "$DB_URL"
```

Opciones: `--transport` (`-t`) `http`, `sse` (deprecado) o `stdio`; `--header` (`-H`); `--env` (`-e`) repetible; `--scope` (`-s`) `local`, `project` o `user`. El `--` separa las opciones de Claude Code del comando del servidor, que recibe intacto lo que va detrás. Para gestionar: `claude mcp list`, `claude mcp get <nombre>`, `claude mcp remove <nombre>`, `claude mcp login <nombre>` (OAuth desde la terminal) y `claude mcp add-json <nombre> '<json>'`. Dentro de la sesión, `/mcp` muestra el estado de cada servidor, sus herramientas y permite autenticar, reconectar o desactivarlo.

## Alcances

| Alcance | Se carga en | Se comparte | Dónde se guarda |
|---|---|---|---|
| `local` (por defecto) | Este proyecto | No | `~/.claude.json`, bajo la ruta del proyecto |
| `project` | Este proyecto | Sí, con git | `.mcp.json` en la raíz del repositorio |
| `user` | Todos tus proyectos | No | `~/.claude.json` |

Si el mismo servidor está en varios sitios, Claude Code se conecta una vez con la definición de mayor prioridad, sin mezclar campos: local, proyecto, usuario, servidores de plugins y, al final, conectores de claude.ai. Un servidor que la organización da con `managedMcpServers` está por encima de todos.

El alcance `local` de MCP no es `.claude/settings.local.json`: vive en `~/.claude.json`. Úsalo para servidores con credenciales que no deben llegar al repositorio.

## .mcp.json

```json title=".mcp.json"
{
  "mcpServers": {
    "api-interna": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.ejemplo.com}/mcp",
      "headers": {"Authorization": "Bearer ${API_KEY}"}
    },
    "db": {
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub@<version-fijada>", "--dsn", "${DB_URL}"],
      "env": {},
      "timeout": 600000
    }
  }
}
```

- Los servidores stdio usan `command`, `args` y `env`; los remotos, `type`, `url` y `headers`. Una entrada con `url` y sin `type` es un error y se ignora.
- `${VAR}` y `${VAR:-valor}` se expanden en `command`, `args`, `env`, `url` y `headers`. Una variable sin definir y sin valor por defecto se deja tal cual, con un aviso en `claude mcp list`.
- Las credenciales del propio Claude Code (`ANTHROPIC_API_KEY` y similares) **se leen vacías** en `url` y `headers` de un servidor remoto: no se pueden filtrar así.
- `timeout` (milisegundos) limita las llamadas a herramientas de ese servidor.
- **Nunca pongas tokens literales** en un `.mcp.json` versionado: referencias a variables de entorno, como en el ejemplo.

## Aprobación de servidores del proyecto

Un `.mcp.json` lo puede escribir cualquiera que tenga acceso al repositorio, así que en sesiones interactivas Claude Code **pide aprobación** antes de usar cada servidor de alcance `project`. `claude mcp reset-project-choices` borra esas decisiones. `enableAllProjectMcpServers` y `enabledMcpjsonServers` en el `.claude/settings.json` del repositorio no cuentan hasta que confías en la carpeta, y `disabledMcpjsonServers` rechaza un servidor por nombre en cualquier modo.

En `claude -p` y en el Agent SDK no hay diálogo: **los servidores del proyecto se conectan sin preguntar**. Para evitarlo, `--bare`, `--strict-mcp-config` con tu propio `--mcp-config`, o `--setting-sources` sin el proyecto ([[docs/claude-code/08-modo-headless-y-ci]]).

## Permisos de las herramientas MCP

```json
{
  "permissions": {
    "allow": ["mcp__db__list_tables", "mcp__db__describe_table"],
    "ask": ["mcp__db__execute_sql"],
    "deny": ["mcp__github__delete_repository"]
  }
}
```

Cuidado con el orden deny → ask → allow: un `ask` de `mcp__db__*` encajaría también con `list_tables` y anularía los `allow` de arriba. Las reglas `ask` y `deny` van herramienta a herramienta cuando convivan con `allow` del mismo servidor.

`mcp__servidor` o `mcp__servidor__*` cubren todas las herramientas de un servidor; `mcp__servidor__herramienta`, una. En `deny` y `ask`, `mcp__*` cubre todas las herramientas MCP; en `allow`, el comodín solo vale tras un servidor concreto. Las herramientas de un servidor de plugin se llaman `mcp__plugin_<plugin>_<servidor>__<herramienta>`. Los hooks `PreToolUse` reciben las llamadas MCP como cualquier otra, con `tool_name` igual a ese nombre completo.

Recuerda que el sandbox de Bash **no** cubre los servidores MCP: un servidor stdio corre con tus permisos ([[docs/claude-code/06-permisos-y-sandbox]]).

## Coste en contexto

Cada herramienta tiene una definición (nombre, descripción, esquema) que ocupa tokens. Claude Code tiene la **búsqueda de herramientas** activa por defecto: en lugar de meter todas las definiciones de todos los servidores, el modelo localiza las que necesita con la herramienta `ToolSearch`. `ENABLE_TOOL_SEARCH=false` la desactiva. Es la misma idea que la [[glosario/carga-diferida-de-herramientas|carga diferida]] de la API ([[docs/herramientas/05-busqueda-y-carga-diferida]]).

La otra mitad del coste son los **resultados**. Claude Code avisa cuando la salida de una herramienta MCP pasa de 10.000 tokens y la limita a 25.000 por defecto (`MAX_MCP_OUTPUT_TOKENS` cambia el límite, no el aviso); los resultados de texto de más de 50.000 caracteres se guardan en un archivo. Si tu servidor devuelve tablas enteras, diséñalo para paginar o filtrar.

Tiempos: `MCP_TIMEOUT` para el arranque, `MCP_TOOL_TIMEOUT` para las llamadas y `timeout` por servidor. Las llamadas largas en la conversación principal pasan a segundo plano a los 2 minutos.

## Ejemplo: el criterio del harness del autor

El harness no trae ningún servidor activo, solo un ejemplo y unas reglas en `.claude/mcp/README.md`:

```json title=".claude/mcp/mcp.json.example"
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github@<version-fijada>"],
      "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"}
    }
  }
}
```

Sus reglas resumen bien la práctica:

- **Versión fijada** (`paquete@x.y.z`). Un `npx -y paquete` sin versión ejecuta lo último que se publique: es la puerta del [[glosario/rug-pull|rug pull]].
- **El token por variable de entorno**, nunca en el archivo.
- **Las respuestas de un servidor MCP son datos no confiables**: pueden traer [[glosario/inyeccion-de-prompt|inyección de prompt]]. Por eso los cuatro agentes canónicos del harness **no** tienen herramientas MCP; si una tarea las necesita, se añaden a un especialista concreto con el campo `mcpServers` de su frontmatter.
- **Editar `.mcp.json` pide confirmación humana**: el hook `guard.py` lo trata como archivo sensible, igual que `CLAUDE.md`.

## Seguridad

> [!peligro] Un servidor MCP es código y contexto de terceros
> Un servidor stdio ejecuta un programa con tus permisos; uno remoto recibe tus datos. Sus descripciones de herramientas entran en el contexto y pueden llevar instrucciones ocultas ([[glosario/envenenamiento-de-herramientas]]). Conecta solo servidores de confianza, fija versiones, revisa qué herramientas exponen y concede el mínimo: `allow` para las de lectura, `ask` o `deny` para las que escriben.

Si combinas un servidor que lee contenido externo (web, correo, incidencias) con herramientas que acceden a datos privados y con salida a la red, tienes la [[glosario/trifecta-letal|trifecta letal]]. Rompe una de las tres patas.

## Errores típicos

- **Opciones después del nombre en `claude mcp add` con stdio**: lo que va tras `--` va al servidor. Pon `--env`, `--scope` y `--transport` antes.
- **Esperar que `local` sea `.claude/settings.local.json`**: está en `~/.claude.json`.
- **Un servidor que «no aparece»**: mira `/mcp`; puede estar pendiente de aprobación o con la entrada mal formada ([[problemas/servidor-mcp-no-aparece]]).
- **`allow` de `mcp__servidor__*` en un servidor que escribe**: preaprobaste también lo destructivo.
- **Servidores del repositorio en CI sin `--bare`**: se conectan sin preguntar.

## Ver también

- [[cursos/mcp-de-cero-a-servidor/index]]: escribir tu propio servidor.
- [[docs/seguridad/04-mcp-y-skills-de-terceros]]: revisar servidores de terceros.
- [[docs/estandares/01-mcp-2026-07-28]]: el protocolo sin estado.
- [[sistemas/asistente-de-datos-con-mcp]]: un sistema completo con MCP.
