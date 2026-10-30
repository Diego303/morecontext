---
titulo: Skill con procedimiento y recursos
descripcion: Plantilla de SKILL.md con frontmatter del estándar Agent Skills y extensiones de Claude Code, cuándo usarla, procedimiento, salida, recursos bajo demanda y límites.
creado: 2026-10-29
tipo: skill
formato: md
archivo: ".claude/skills/<nombre>/SKILL.md"
tags: [plantillas, skills, claude-code, agent-skills]
relacionados: ["[[roadmap/50-skills/02-anatomia-de-una-skill]]", "[[roadmap/50-skills/04-escribir-tu-primera-skill]]", "[[docs/claude-code/03-skills]]", "[[glosario/skill]]", "[[plantillas/subagente]]"]
---

Una [[glosario/skill|skill]] es una carpeta con un `SKILL.md` que enseña a un agente **un procedimiento**: cuándo aplicarlo, qué pasos seguir, qué entregar y dónde parar. Se carga por [[glosario/divulgacion-progresiva|divulgación progresiva]]: el agente ve siempre el nombre y la descripción; el cuerpo, solo cuando la tarea encaja; y los archivos de la carpeta (referencias, scripts, plantillas), solo si un paso los pide. Por eso una skill bien hecha casi no ocupa contexto hasta que hace falta. Esta plantilla sigue el formato abierto [Agent Skills](https://agentskills.io) y marca qué campos son extensiones de Claude Code.

## Cuándo usarla

- Cuando explicas al agente el mismo procedimiento por tercera vez: preparar una release, revisar una migración, escribir un ADR.
- Cuando el procedimiento necesita material que no quieres cargar siempre: una guía larga, un script, una plantilla de salida.
- Para precargar conocimiento en un subagente concreto ([[plantillas/subagente]]) con su campo `skills`.
- No la uses para reglas que deben estar presentes en todas las tareas: eso va en `AGENTS.md` ([[plantillas/agents-md]]).

## La plantilla

```markdown title=".claude/skills/<nombre>/SKILL.md"
---
# Estándar Agent Skills (obligatorios)
name: <nombre-de-la-skill>
description: <Qué hace y cuándo usarla, con las frases o situaciones que deben activarla. Di también cuándo NO usarla si hay skills parecidas.>
# Estándar Agent Skills (opcionales)
license: <MIT>
compatibility: <requisitos del entorno, p. ej. git y python3 en el PATH>
# Extensiones de Claude Code (opcionales; bórralas si subes la skill a claude.ai o a la Skills API)
argument-hint: "[<argumento>]"
disable-model-invocation: false
---

# <nombre-de-la-skill>

## Cuándo usarla

- <Situación concreta que la activa>
- No la uses para <caso parecido>: para eso está `<otra-skill>`.

## Resultado

<Qué deja hecho la skill al terminar: un archivo, un informe, un cambio de estado.>

## Procedimiento

1. <Paso concreto, en imperativo. Explica el porqué si no es obvio.>
2. <Paso que necesita detalle: lee `${CLAUDE_SKILL_DIR}/references/<guia>.md` solo si <condición>.>
3. <Paso que ejecuta un script: `python3 ${CLAUDE_SKILL_DIR}/scripts/<script>.py <argumentos>`.>
4. Antes de terminar, comprueba <criterio verificable>.

## Salida

<Formato exacto de lo que devuelve o escribe: ruta, secciones, campos.>

## Recursos

- `references/<guia>.md`: <qué detalle contiene>. Se lee bajo demanda.
- `scripts/<script>.py`: <qué hace>. Se ejecuta; no hace falta leerlo entero.
- `assets/<plantilla>`: <qué plantilla rellena>.

## Límites

- <Lo que la skill no hace>
- Para si <condición> y <qué hacer en su lugar: preguntar, escalar, otra skill>.
```

## Cómo rellenarla

**Frontmatter del estándar.** Funciona en cualquier agente que siga Agent Skills.

| Campo | Regla |
| --- | --- |
| `name` | Obligatorio. 1 a 64 caracteres en minúsculas, números y guiones, sin guion al principio ni al final ni dos seguidos. **Igual al nombre de la carpeta.** En Claude Code es también el comando `/<nombre>`. |
| `description` | Obligatorio. Hasta 1024 caracteres. Es lo único que el agente ve siempre: escribe qué hace y cuándo usarla, con las palabras que diría quien la necesita. |
| `license`, `compatibility`, `metadata` | Opcionales. `compatibility` admite hasta 500 caracteres; `metadata` es un mapa de cadenas. |
| `allowed-tools` | Opcional y experimental en el estándar: herramientas preaprobadas mientras corre la skill. |

**Extensiones de Claude Code.** Las lee Claude Code. Otros agentes suelen ignorarlas, pero claude.ai y la Skills API solo admiten los campos del estándar y rechazan la skill con un error si encuentran otro: quítalas antes de subirla allí. Las más útiles: `argument-hint` (ayuda del autocompletado), `disable-model-invocation: true` (solo la lanzas tú con `/<nombre>`; el modelo no la carga por su cuenta), `when_to_use` (amplía la descripción), `user-invocable`, `model`, `effort` y `context: fork` (la ejecuta en un contexto aparte). Claude Code recorta `description` más `when_to_use` a 1536 caracteres en su listado y acepta los campos `license`, `compatibility` y `metadata` del estándar, aunque no los usa. La lista completa está en [[docs/claude-code/03-skills]].

**Cuerpo.** Por debajo de 500 líneas, y mejor mucho menos. El detalle va a `references/`, el código determinista a `scripts/` y las plantillas de salida a `assets/`, que son las carpetas del estándar. En Claude Code, `${CLAUDE_SKILL_DIR}` apunta a la carpeta de la skill: úsalo en las rutas para que los pasos funcionen desde cualquier directorio de trabajo.

**Procedimiento.** Pasos en imperativo, cada uno con algo observable. El último comprueba el resultado antes de darlo por hecho.

**Límites.** Lo que la skill no hace y cuándo debe parar. Sin esta sección, una skill tiende a crecer hasta hacer el trabajo de otra.

## Ejemplo

Una skill que solo lanzas tú para preparar la entrada del changelog de una versión:

```markdown title=".claude/skills/entrada-de-changelog/SKILL.md"
---
name: entrada-de-changelog
description: Redacta la entrada de CHANGELOG.md de la próxima versión a partir de los commits desde la última etiqueta, agrupados por tipo de Conventional Commits. Úsala cuando pidan preparar el changelog o las notas de una versión. No etiqueta ni publica.
disable-model-invocation: true
argument-hint: "[versión]"
---

# entrada-de-changelog

## Resultado

Una sección `## [<versión>]` nueva al principio de CHANGELOG.md, sin commit.

## Procedimiento

1. Ejecuta `git describe --tags --abbrev=0` para obtener la última etiqueta.
2. Lista los commits con `git log --oneline <etiqueta>..HEAD`.
3. Agrupa por tipo: feat en «Añadido», fix en «Corregido», el resto en «Otros». Descarta chore y ci.
4. Escribe la sección con una línea por cambio y el ID de la feature entre paréntesis.
5. Enseña el diff de CHANGELOG.md y para.

## Límites

- No crea etiquetas, no hace commit ni publica.
- Si no hay etiquetas, pregunta desde qué commit empezar.
```

## Errores típicos

- **Una descripción genérica** («ayuda con el changelog»). El agente no sabe cuándo usarla y no la usa, o la usa siempre. Escribe disparadores concretos y cuándo no aplica.
- **`name` distinto del nombre de la carpeta.** Rompe el estándar y confunde el comando.
- **Todo en `SKILL.md`.** Mil líneas que se cargan enteras en cuanto la skill se activa. Divide en `references/`.
- **Rutas relativas al directorio de trabajo** en los scripts: fallan en cuanto el agente trabaja en otra carpeta. Usa `${CLAUDE_SKILL_DIR}`.
- **Skills de terceros sin revisar.** Una skill puede traer scripts que ejecutará tu agente. Léela entera antes de instalarla y fija su versión ([[roadmap/50-skills/05-skills-en-equipo]]).
- **Skills que se activan solas y chocan** con el formato de otras: si solo tiene sentido cuando tú la pides, `disable-model-invocation: true`.

## Relacionadas

- [[roadmap/50-skills/02-anatomia-de-una-skill]]: las partes de una skill.
- [[roadmap/50-skills/03-carga-bajo-demanda]]: por qué no llena el contexto.
- [[roadmap/50-skills/04-escribir-tu-primera-skill]]: paso a paso.
- [[docs/claude-code/03-skills]]: referencia de skills en Claude Code.
- [[plantillas/subagente]]: cómo precargarla en un subagente.
