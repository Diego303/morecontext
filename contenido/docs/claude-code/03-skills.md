---
titulo: Skills en Claude Code
descripcion: Referencia de las skills en Claude Code - ubicaciones y precedencia, todos los campos del frontmatter, quién las invoca, sustituciones, precarga en subagentes y cómo restringirlas.
creado: 2026-10-29
orden: 3
nivel: intermedio
tags: [claude-code, skills, contexto]
relacionados: ["[[roadmap/50-skills/index]]", "[[glosario/skill]]", "[[plantillas/skill]]", "[[docs/estandares/04-agent-skills-y-agents-md]]"]
---

Una skill de Claude Code es una carpeta con un `SKILL.md` que enseña al agente un procedimiento y que se carga solo cuando hace falta. Claude Code implementa el estándar abierto Agent Skills y le añade campos propios. Este artículo es la referencia rápida; si es la primera vez que escribes una, sigue antes el [[roadmap/50-skills/index|nivel 50 del roadmap]], que explica el porqué y tiene una práctica completa.

## Ubicaciones y precedencia

| Ubicación | Ruta | Se invoca como |
|---|---|---|
| Empresa | `.claude/skills/<nombre>/SKILL.md` en el directorio de configuración gestionada | `/nombre` |
| Personal | `~/.claude/skills/<nombre>/SKILL.md` | `/nombre` |
| Proyecto | `.claude/skills/<nombre>/SKILL.md` | `/nombre` |
| Anidada | `<subdir>/.claude/skills/<nombre>/SKILL.md` | `/nombre` |
| Directorio añadido | `.claude/skills/` de una carpeta pasada con `--add-dir` | `/nombre` |
| Plugin | `<plugin>/skills/<nombre>/SKILL.md` | `/plugin:nombre` |

Con nombres repetidos gana empresa sobre personal y personal sobre proyecto. Las de plugin no chocan porque llevan prefijo.

**Comandos.** Los comandos personalizados se han fusionado con las skills: `.claude/commands/deploy.md` y `.claude/skills/deploy/SKILL.md` crean el mismo `/deploy` y funcionan igual. Los archivos de `.claude/commands/` siguen funcionando, y si una skill y un comando se llaman igual, gana la skill ([[docs/claude-code/05-comandos-y-plugins]]).

## Frontmatter

En Claude Code todos los campos son opcionales. Los seis del estándar (`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`) se aceptan; `license`, `compatibility` y `metadata` se ignoran.

| Campo | Qué hace |
|---|---|
| `name` | Nombre en el menú `/`. Por defecto, el del directorio |
| `description` | Qué hace y cuándo usarla; es lo que decide la activación. Por defecto, la primera línea no vacía del cuerpo |
| `when_to_use` | Frases o situaciones de activación; se añade a `description` |
| `argument-hint` | Pista de autocompletado (`"[FEATURE-ID]"`) |
| `arguments` | Argumentos con nombre para sustituir `$nombre` |
| `disable-model-invocation` | `true`: solo la lanza el humano; no entra en el contexto ni se puede precargar en subagentes |
| `user-invocable` | `false`: no aparece en el menú `/`; solo la usa el modelo |
| `allowed-tools` | Herramientas que Claude puede usar sin pedir permiso en el turno que invoca la skill; la concesión se borra con tu siguiente mensaje |
| `disallowed-tools` | Herramientas retiradas mientras la skill está activa |
| `model`, `effort` | Modelo y esfuerzo durante el resto del turno; no se guardan en la configuración |
| `context` | `fork`: se ejecuta en un subagente aparte |
| `agent` | Tipo de subagente para `context: fork` (`Explore`, `Plan`, `general-purpose` o uno propio; por defecto `general-purpose`) |
| `background` | Con `context: fork`; `false` para esperar el resultado en el mismo turno (por defecto `true`) |
| `hooks` | Hooks que se registran al invocarla y siguen activos el resto de la sesión |
| `paths` | Globs: solo se activa sola al trabajar con archivos que encajan |
| `shell` | `bash` (por defecto) o `powershell` para los bloques dinámicos |

En el listado que ve el modelo, `description` más `when_to_use` se truncan a **1.536 caracteres**. El estándar limita `description` a 1.024: si quieres portabilidad, quédate por debajo. Mantén `SKILL.md` por debajo de 500 líneas.

## Quién la invoca y qué cuesta

| Frontmatter | Humano (`/nombre`) | Modelo | En el contexto |
|---|---|---|---|
| (por defecto) | Sí | Sí | La descripción siempre; el cuerpo al usarla |
| `disable-model-invocation: true` | Sí | No | Nada hasta que el humano la lanza |
| `user-invocable: false` | No | Sí | La descripción siempre |

En una sesión normal solo las descripciones viven en el contexto. Los subagentes con skills precargadas funcionan al revés: reciben el contenido completo al arrancar.

## Sustituciones e inyección dinámica

| Variable | Valor |
|---|---|
| `$ARGUMENTS` | Todo lo que el humano escribió tras `/nombre` |
| `$0` … `$N`, `$nombre` | Argumentos por posición o por nombre (`arguments`) |
| `${CLAUDE_SKILL_DIR}` | Carpeta de la skill (en un plugin, su subcarpeta, no la raíz del plugin) |
| `${CLAUDE_PROJECT_DIR}`, `${CLAUDE_PLUGIN_ROOT}` | Raíz del proyecto y del plugin |
| `${CLAUDE_SESSION_ID}`, `${CLAUDE_EFFORT}` | Sesión y esfuerzo actuales |

`` !`comando` `` (o un bloque de código cuya marca de lenguaje es `!`) ejecuta el comando **antes** de que el modelo lea la skill e inserta su salida. Es útil para inyectar el estado del repositorio, y es también código que se ejecuta al invocar la skill: el ajuste `disableSkillShellExecution` lo desactiva.

## Precarga en subagentes y ejecución en fork

- **Precarga**: `skills: [nombre-a, nombre-b]` en el frontmatter de un subagente inyecta el contenido completo de esas skills al arrancar (hasta 32 nombres). El subagente puede seguir invocando otras skills con la herramienta `Skill` salvo que se la quites.
- **Fork**: `context: fork` hace lo contrario: la skill arranca un subagente del tipo `agent` y le da el contenido de la skill como prompt. Ese subagente no ve tu conversación, así que la skill debe ser autocontenida.

## Ejemplo completo

La skill de notas de versión del [[roadmap/50-skills/04-escribir-tu-primera-skill|ejercicio del roadmap]] usa solo el estándar para ser portable. Esta variante aprovecha los campos de Claude Code:

````markdown title=".claude/skills/notas-de-version/SKILL.md"
---
name: notas-de-version
description: Redacta las notas de versión a partir de los commits desde la última etiqueta. Úsala cuando pidan notas de versión, changelog o release notes. No la uses para mensajes de commit.
argument-hint: "[rango, p. ej. v1.2.0..HEAD]"
allowed-tools: Bash(python3 ${CLAUDE_SKILL_DIR}/scripts/agrupar_commits.py *)
effort: medium
---

# Notas de versión

Estado actual del repositorio:

!`git describe --tags --abbrev=0`

1. Ejecuta `python3 ${CLAUDE_SKILL_DIR}/scripts/agrupar_commits.py $ARGUMENTS`.
2. Redacta las secciones Cambios incompatibles, Añadido, Corregido y Rendimiento
   con cada cambio escrito para quien usa el producto.
3. Propón la versión SemVer siguiente. No crees etiquetas ni hagas commits.
````

Qué aporta cada extensión: `argument-hint` documenta el argumento en el autocompletado; `allowed-tools` preaprueba **solo** ese script, de modo que la skill no pide permiso para ejecutarlo pero no abre la puerta a otros comandos; `${CLAUDE_SKILL_DIR}` hace que la ruta funcione desde cualquier directorio; `` !`git describe…` `` inyecta la última etiqueta sin gastar una llamada a herramienta. El precio: esta versión ya no es portable a otros clientes del estándar.

Ejemplos reales en el harness del autor: `feature-cost` y `sdd-feature-planning` usan `argument-hint`; `new-session` usa `disable-model-invocation: true` porque solo tiene sentido cuando el humano decide cambiar de sesión.

## Restringir el acceso

- Todas las skills: regla `Skill` en `permissions.deny`.
- Unas concretas: `Skill(commit)` para una exacta, `Skill(deploy *)` para un prefijo con argumentos, en `allow` o `deny`.
- En el Agent SDK, la opción `skills=` (`"all"` o una lista de nombres) filtra qué skills ve la sesión. Es un filtro de contexto, no un sandbox: los archivos siguen accesibles.

## Errores típicos

- **Una skill que no se activa nunca**: la descripción no contiene las palabras con las que se pide la tarea. Pruébala con casos ([[roadmap/50-skills/04-escribir-tu-primera-skill]]).
- **`allowed-tools` demasiado amplio** (`Bash`): mientras la skill está activa, cualquier comando pasa sin preguntar.
- **Esperar que una skill con `disable-model-invocation` se precargue** en un subagente: ese campo lo impide.
- **Skills que se pisan**: dos descripciones parecidas compiten; añade a cada una cuándo no usarla.
- **`` !`cmd` `` en skills de terceros sin revisar**: se ejecuta al invocarla ([[roadmap/50-skills/05-skills-en-equipo]]).

## Ver también

- [[roadmap/50-skills/03-carga-bajo-demanda]]: el coste en contexto, medido.
- [[docs/claude-code/02-subagentes]]: el campo `skills` de los subagentes.
- [[plantillas/skill]]: plantilla lista para copiar.
- [[docs/seguridad/04-mcp-y-skills-de-terceros]]: revisar skills ajenas.
