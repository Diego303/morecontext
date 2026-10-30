---
titulo: Comandos y plugins
descripcion: Comandos slash propios con argumentos, comandos que solo puede lanzar el humano, plugins que empaquetan skills, agentes, hooks y MCP, marketplaces para distribuirlos y estilos de salida.
creado: 2026-10-29
orden: 5
nivel: intermedio
tags: [claude-code, comandos, plugins, distribucion]
relacionados: ["[[recetas/puerta-humana-con-comandos]]", "[[docs/claude-code/03-skills]]", "[[roadmap/50-skills/05-skills-en-equipo]]", "[[glosario/puerta-humana]]"]
---

Un **comando** de Claude Code es un prompt guardado que lanzas escribiendo `/nombre`; un **plugin** es una carpeta que empaqueta comandos, skills, subagentes, hooks y servidores MCP para instalarlos como una unidad en varios proyectos. Este artículo cubre los dos, los marketplaces con los que se distribuyen los plugins y los estilos de salida.

## Comandos propios

Un comando es un archivo Markdown en `.claude/commands/` (proyecto) o `~/.claude/commands/` (usuario). El nombre del archivo es el comando: `.claude/commands/approve.md` crea `/approve`.

Los comandos se han **fusionado con las skills**: un archivo de comando y una skill en `.claude/skills/<nombre>/SKILL.md` crean el mismo `/nombre` y funcionan igual, con el mismo frontmatter y las mismas sustituciones. Si coinciden en nombre, gana la skill. Los `.claude/commands/` existentes siguen funcionando, así que no hace falta migrarlos; para algo nuevo, usa una skill, que además admite carpeta con scripts y recursos ([[docs/claude-code/03-skills]]).

Campos de frontmatter más usados en un comando:

| Campo | Para qué |
|---|---|
| `description` | Texto en el menú `/` y, si el modelo puede invocarlo, criterio de activación |
| `argument-hint` | Pista de los argumentos en el autocompletado |
| `disable-model-invocation` | `true`: solo lo lanza el humano |
| `allowed-tools` | Herramientas preaprobadas durante ese turno |
| `model`, `effort` | Modelo y esfuerzo para ese turno |

Argumentos: `$ARGUMENTS` es todo lo que escribes tras el nombre; `$0`, `$1`… son los argumentos por posición.

## Comandos que solo puede lanzar el humano

Hay decisiones que el modelo no debe tomar nunca por su cuenta. El harness del autor tiene dos, `/approve` y `/reject`, que deciden la única puerta humana del flujo (GATE#1). Este es `/approve` completo:

```markdown title=".claude/commands/approve.md"
---
description: Aprueba GATE#1 de una feature del harness (decisión humana). Uso /approve FEATURE-ID [alternativa o comentario]
argument-hint: "<FEATURE-ID> [alternativa o comentario]"
disable-model-invocation: true
---

Decisión humana explícita en GATE#1: **apruebo** la especificación. Argumentos: $ARGUMENTS

Como orquestador:

1. El primer argumento es el FEATURE-ID y el resto mi respuesta literal (puede
   indicar la alternativa elegida). Si falta el ID o la feature no está en
   `gate1_pending` (`python3 .claude/tools/feature.py status <ID>`), dímelo y no hagas nada más.
2. Registra la decisión con mi texto entre comillas simples (si contiene
   apóstrofos, usa comillas dobles y no incluyas `$` ni acentos graves):
   `python3 .claude/tools/feature.py transition <ID> approved --by human --response 'approve: <mi texto literal>'`
   Claude Code me pedirá confirmar el comando: esa confirmación es la firma del gate.
3. Si la transición se rechaza, muéstrame los motivos y para.
4. Si se acepta, continúa según el modo de `.claude/harness.toml`: en manual,
   dime el siguiente paso y espera; en auto o yolo, lanza el builder
   (`PHASE: implementation`, `ATTEMPT: 1`, `MODE: build`).
```

Tres capas protegen la decisión. `disable-model-invocation: true` impide que el modelo lance el comando. El texto en primera persona («apruebo») deja claro que lo que sigue es la voluntad del humano, con su respuesta literal en `$ARGUMENTS`. Y la transición real la ejecuta una herramienta que el hook de seguridad marca como `ask`, de modo que Claude Code pide confirmación aunque el modelo intentara lanzarla por otra vía: **la firma es esa confirmación**. Es una forma antigua (archivo en `commands/`) que sigue siendo válida; como skill sería idéntica. Más en [[recetas/puerta-humana-con-comandos]].

## Plugins

Un plugin es un directorio con un manifiesto `.claude-plugin/plugin.json` y sus componentes en carpetas fijas:

| Ruta | Contenido |
|---|---|
| `.claude-plugin/plugin.json` | Manifiesto; `name` es obligatorio |
| `skills/<nombre>/SKILL.md` | Skills |
| `commands/*.md` | Comandos (forma antigua de las skills) |
| `agents/*.md` | Subagentes |
| `hooks/hooks.json` | Hooks, con la misma forma que la clave `hooks` de `settings.json` |
| `.mcp.json` | Servidores MCP |
| `workflows/`, `output-styles/` | Dynamic workflows y estilos de salida |

También admite servidores LSP. Solo `plugin.json` va dentro de `.claude-plugin/`: un componente guardado ahí no se carga.

```json title="mi-plugin/.claude-plugin/plugin.json"
{
  "name": "mi-plugin",
  "description": "Notas de versión y revisión de seguridad del equipo",
  "version": "1.2.0",
  "author": {"name": "Plataforma"}
}
```

`name` se convierte en el **prefijo** de sus skills y agentes: la skill `notas-de-version` de este plugin se lanza como `/mi-plugin:notas-de-version` y su agente `reviewer` se llama `mi-plugin:reviewer`, así que dos plugins pueden traer componentes con el mismo nombre. Los hooks no tienen prefijo: si un hook está a la vez en `settings.json` y en el plugin, se ejecuta dos veces. `version` mantiene a quien lo instala en esa versión hasta que la cambies. En los archivos del plugin, `${CLAUDE_PLUGIN_ROOT}` apunta a su raíz.

Herramientas de desarrollo:

```bash
claude plugin validate ./mi-plugin        # manifiesto y frontmatter de cada componente
claude --plugin-dir ./mi-plugin           # cargarlo solo en esta sesión (también un .zip)
claude plugin init mi-tool                # crear uno en ~/.claude/skills/ que se carga siempre
claude plugin eval ./mi-plugin            # comparar el comportamiento con y sin el plugin
```

Dentro de una sesión, `/reload-plugins` aplica los cambios en disco y `/plugin` muestra los instalados y los errores de carga. El plugin oficial `plugin-dev`, del marketplace `claude-plugins-official`, ayuda a crear y validar plugins.

## Marketplaces

Un marketplace es un directorio o repositorio con `.claude-plugin/marketplace.json`, que lista plugins y dónde obtener cada uno:

```json title="mi-marketplace/.claude-plugin/marketplace.json"
{
  "name": "mi-marketplace",
  "description": "Plugins del equipo de plataforma",
  "owner": {"name": "Plataforma"},
  "plugins": [
    {"name": "mi-plugin", "source": "./plugins/mi-plugin", "description": "Notas de versión y revisión de seguridad"}
  ]
}
```

```bash
claude plugin validate ./mi-marketplace
claude plugin marketplace add mi-org/mi-marketplace     # o una ruta local
claude plugin install mi-plugin@mi-marketplace
```

El `source` de un plugin puede ser una ruta relativa a la raíz del marketplace, un repositorio de GitHub, una subcarpeta de otro repositorio, una URL de git, un `.zip`, un paquete npm o un comando. Los de git se pueden fijar a una referencia o un commit. Mantén igual el `name` de la entrada y el del `plugin.json`: si difieren, la instalación por el nombre del manifiesto falla.

Para que el equipo lo tenga al clonar el repositorio, decláralo en `.claude/settings.json` con `extraKnownMarketplaces` y `enabledPlugins`. Claude Code no los aplica hasta que cada persona acepta el diálogo de confianza de la carpeta.

> [!peligro] Instalar un plugin es ejecutar código
> Un plugin puede traer hooks que se ejecutan en cada llamada a herramienta, servidores MCP que arrancan procesos y skills con scripts. Revísalo como revisarías una dependencia, fija su versión y usa `--plugin-url` solo con archivos que controlas ([[roadmap/50-skills/05-skills-en-equipo]]).

## Estilos de salida

Un estilo de salida cambia cómo responde Claude Code. Trae cuatro integrados: `Proactive`, `Concise`, `Explanatory` y `Learning`. Los propios van en `.claude/output-styles/*.md`, con `keep-coding-instructions` para conservar las instrucciones de programación por defecto, y un plugin puede imponer el suyo con `force-for-plugin`. Se cambian con `/output-style`. Son útiles para un modo de enseñanza o de informes; para reglas del proyecto, `CLAUDE.md` sigue siendo el sitio.

## Errores típicos

- **Componentes dentro de `.claude-plugin/`**: no se cargan.
- **`--plugin-dir` apuntando a la raíz del marketplace**: no lee `marketplace.json` y no carga los plugins de `plugins/`, sin dar error.
- **Rutas con `..` en el `source`**: el validador las rechaza.
- **Copiar los hooks al plugin sin quitarlos de `settings.json`**: se ejecutan dos veces.
- **Un comando de decisión sin `disable-model-invocation`**: el modelo puede «aprobar» por ti.

## Ver también

- [[docs/claude-code/03-skills]]: el formato que comparten comandos y skills.
- [[docs/claude-code/04-hooks]]: qué puede hacer un hook que llega en un plugin.
- [[docs/claude-code/07-mcp-en-claude-code]]: servidores MCP de plugins.
- [[cursos/harness-engineering/14-especializa-el-harness]]: empaquetar tu harness.
