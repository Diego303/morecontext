---
titulo: Anatomía de una skill
descripcion: El SKILL.md campo a campo según el estándar y las extensiones de Claude Code, los recursos de la carpeta, dónde vive cada skill y quién la invoca, con una skill real anotada.
creado: 2026-10-29
orden: 2
minutos: 30
tipo: teoria
objetivos:
  - Escribir un frontmatter válido según el estándar Agent Skills y distinguirlo de las extensiones de Claude Code.
  - Organizar una skill en SKILL.md, scripts, referencias y recursos, y saber cuándo usar cada carpeta.
  - Elegir la ubicación de una skill (proyecto, usuario, plugin) y quién puede invocarla.
requiere: ["[[roadmap/50-skills/01-que-es-una-skill]]"]
tags: [skills, claude-code, estandares]
relacionados: ["[[glosario/skill]]", "[[docs/claude-code/03-skills]]", "[[plantillas/skill]]", "[[docs/estandares/04-agent-skills-y-agents-md]]"]
---

Al terminar esta lección podrás leer cualquier `SKILL.md` y saber qué hace cada línea, qué campos entiende cualquier cliente del estándar y cuáles solo Claude Code, y dónde guardar la skill para que la encuentre quien tiene que encontrarla.

## La idea

Una skill tiene tres capas que se corresponden con tres momentos de carga:

| Capa | Dónde está | Cuándo la lee el agente |
|---|---|---|
| Metadatos | Frontmatter YAML de `SKILL.md` (`name`, `description`) | Siempre, al arrancar |
| Instrucciones | Cuerpo Markdown de `SKILL.md` | Cuando decide usar la skill |
| Recursos | `scripts/`, `references/`, `assets/` | Solo si las instrucciones lo piden |

Escribir bien una skill es poner cada cosa en su capa: en los metadatos, lo justo para decidir; en el cuerpo, el procedimiento; en los recursos, el detalle y lo que debe ejecutarse sin razonar.

## El frontmatter según el estándar

La especificación de agentskills.io define seis campos. Son los únicos que puedes contar con que entienda cualquier cliente.

| Campo | Obligatorio | Regla |
|---|---|---|
| `name` | Sí | 1–64 caracteres `a-z`, `0-9` y `-`; sin guion al principio ni al final, sin `--`; **igual al nombre del directorio** |
| `description` | Sí | 1–1.024 caracteres; qué hace y cuándo usarla |
| `license` | No | Licencia de la skill (por ejemplo, `MIT`) |
| `compatibility` | No | Hasta 500 caracteres: requisitos de entorno («necesita git y python3») |
| `metadata` | No | Mapa de cadenas a cadenas (autor, versión…) |
| `allowed-tools` | No, experimental | Herramientas preaprobadas, separadas por espacios: `Bash(git:*) Read` |

La regla de `name` igual al directorio no es estética: muchos clientes localizan la skill por la carpeta y la invocan por el nombre. Si no coinciden, la skill se comporta de forma distinta según la herramienta.

La Skills API de Claude, fuera de Claude Code, solo acepta en el frontmatter estos seis campos. La biblioteca de referencia del estándar, `skills-ref`, los valida (lo harás en [[roadmap/50-skills/04-escribir-tu-primera-skill]]).

## Lo que añade Claude Code

Claude Code (v2.1.312, octubre de 2026) lee los campos del estándar y añade los suyos. En Claude Code todos son opcionales: si falta `name`, usa el nombre del directorio; si falta `description`, la primera línea no vacía del cuerpo.

| Campo | Para qué sirve |
|---|---|
| `when_to_use` | Frases o situaciones que deben activarla; se añade a `description` en el listado |
| `argument-hint`, `arguments` | Ayuda de autocompletado y argumentos con nombre para `$nombre` |
| `disable-model-invocation` | `true`: solo la lanza el humano con `/nombre`; su descripción no entra en el contexto |
| `user-invocable` | `false`: la oculta del menú `/`; solo la usa el modelo |
| `allowed-tools`, `disallowed-tools` | Herramientas preaprobadas o retiradas mientras la skill está activa |
| `model`, `effort` | Modelo y esfuerzo mientras la skill está activa |
| `context: fork`, `agent`, `background` | Ejecutarla en un subagente aparte, de qué tipo y si se espera su resultado |
| `paths` | Globs: solo se activa sola al trabajar con archivos que encajan |
| `hooks`, `shell` | Hooks que registra al usarse; shell de los bloques dinámicos |

Dos detalles prácticos. Primero, en el listado que ve el modelo, `description` más `when_to_use` se truncan a **1.536 caracteres**: pon el caso de uso principal al principio. Segundo, si quieres que la skill funcione también fuera de Claude Code, `description` debe caber en los 1.024 del estándar y no debe depender de los campos de esta tabla. Claude Code acepta `license`, `compatibility` y `metadata`, pero los ignora.

## El cuerpo: el procedimiento

El cuerpo es Markdown libre. Lo que funciona en la práctica:

- **Un resultado verificable al principio.** «Una entrada nueva en `feature_list.json`», no «ayuda a planificar».
- **Pasos numerados en imperativo**, con el porqué cuando no es obvio. El modelo sigue mejor una instrucción que entiende.
- **Límites explícitos**: qué no hace la skill y cuándo debe parar.
- **Menos de 500 líneas.** Es la recomendación del estándar y de Claude Code; el detalle va en `references/`.

En Claude Code el cuerpo admite sustituciones: `$ARGUMENTS` (lo que el humano escribió tras `/nombre`), `$0…$N`, `${CLAUDE_SKILL_DIR}` (la carpeta de la skill), `${CLAUDE_PROJECT_DIR}` y otras. También admite inyectar la salida de un comando con `` !`cmd` ``, que se ejecuta **antes** de que el modelo lea la skill; un administrador puede desactivarlo con `disableSkillShellExecution`.

## Los recursos: scripts, referencias y plantillas

- **`scripts/`**: código que el agente **ejecuta** en lugar de razonar. Si un paso es determinista (agrupar commits, validar un YAML, calcular un hash), un script lo hace siempre igual y su código no ocupa contexto: solo entra su salida.
- **`references/`**: documentación larga que el agente abre si la necesita (un esquema, una guía de estilo). El cuerpo dice cuándo leerla.
- **`assets/`**: plantillas y archivos que se copian o se rellenan.

Refiérete a ellos con rutas relativas a la carpeta de la skill. En Claude Code, `${CLAUDE_SKILL_DIR}/scripts/x.py` funciona aunque el directorio de trabajo sea otro.

## Una skill real, anotada

Esta es `feature-kickoff`, una de las skills propias del harness del autor. Convierte una idea ambigua en una feature registrada. La reproducimos casi entera; solo se han acortado los pasos 3 y 4.

```markdown title=".claude/skills/feature-kickoff/SKILL.md"
---
name: feature-kickoff
description: Convierte una idea, ticket o petición todavía ambigua en una feature
  registrada y lista para el flujo del harness - resumen, alcance, tags, riesgos y
  preguntas clave. Úsala cuando el humano traiga algo nuevo que construir ("quiero
  añadir...", "tengo esta idea", "prepara el ticket X") y todavía no exista en
  feature_list.json. No diseña ni implementa.
---

# Feature kickoff

## Resultado

Una entrada nueva en `.claude/feature_list.json` (`status: proposed`) y un
resumen breve para arrancar el flujo.

## Procedimiento

1. Lee la petición, `AGENTS.md` y `feature_list.json`. Si la feature ya
   existe, trabaja con esa entrada en lugar de duplicarla.
2. Resume en lenguaje claro: problema, alcance propuesto (dentro y fuera),
   riesgos técnicos y preguntas abiertas.
3. Pregunta solo lo que bloquea alcance, aceptación o seguridad, con un máximo
   de tres preguntas concretas. Lo demás queda como supuesto explícito.
4. Propón ID (`MAYÚSCULAS-NNN`), título, tags y, si la feature es grande,
   presupuesto. Los tags sensibles obligan a aprobación humana: no los omitas.
5. Con el visto bueno del humano, regístrala:
   `python3 .claude/tools/feature.py add <ID> "<título>" --tags a,b`
6. Ofrece arrancar el flujo con la skill `sdd-feature-planning`.

## Límites

- No diseñes la solución ni escribas código.
- No conviertas suposiciones en requisitos: márcalas como supuestos.
- No arranques el flujo sin confirmación del humano.
```

Qué fijarse:

- **La `description` hace tres cosas**: dice qué produce, da frases literales que deben activarla («quiero añadir…», «tengo esta idea») y marca el límite con otra skill («No diseña ni implementa»). Esa última frase evita que se active cuando toca `sdd-feature-planning`.
- **Solo usa campos del estándar**, así que es portable.
- **El paso 5 no deja al modelo inventar cómo se registra una feature**: le da el comando exacto de una herramienta determinista. La skill orquesta; el script decide.
- **Encadena con otra skill** (paso 6) en lugar de duplicar su contenido.

Para contraste, la skill `new-session` del mismo harness empieza así:

```yaml
name: new-session
description: Genera un prompt de traspaso para continuar en una sesión nueva con todo el contexto que no está en disco. Solo la invoca el humano con /new-session, normalmente cuando falla el canario o el contexto está alto.
disable-model-invocation: true
argument-hint: "[foco opcional de la próxima sesión]"
```

`disable-model-invocation` y `argument-hint` son extensiones de Claude Code: en esa herramienta hacen que solo el humano la lance y le dan autocompletado. Un validador estricto del estándar la rechazaría por esos dos campos, y es una decisión consciente: esta skill solo tiene sentido dentro de Claude Code.

## Dónde vive cada skill

En Claude Code, de mayor a menor prioridad cuando dos tienen el mismo nombre:

| Ubicación | Ruta | Alcance |
|---|---|---|
| Empresa | `.claude/skills/<nombre>/SKILL.md` en el directorio de configuración gestionada | Toda la organización |
| Personal | `~/.claude/skills/<nombre>/SKILL.md` | Todos tus proyectos |
| Proyecto | `.claude/skills/<nombre>/SKILL.md` | Quien clone el repositorio |
| Plugin | `<plugin>/skills/<nombre>/SKILL.md` | Quien instale el plugin; se invoca como `/plugin:nombre` |

También carga las anidadas (`<subdir>/.claude/skills/`) y las de directorios añadidos con `--add-dir`. Si una skill y un comando de `.claude/commands/` se llaman igual, gana la skill. Otras herramientas del estándar usan sus propias carpetas: consulta su documentación.

## Quién la invoca

| Frontmatter | La lanza el humano | La lanza el modelo | Qué hay en el contexto |
|---|---|---|---|
| (por defecto) | Sí, con `/nombre` | Sí | La descripción siempre; la skill entera al usarla |
| `disable-model-invocation: true` | Sí | No | Nada hasta que el humano la lanza |
| `user-invocable: false` | No | Sí | La descripción siempre |

Hay una tercera vía: **precargarla en un subagente**. Un subagente con `skills: [verification-before-completion]` en su frontmatter recibe el contenido completo de esa skill al arrancar, sin esperar a que el modelo la descubra. Es lo que hace el builder del harness. Una skill con `disable-model-invocation: true` no se puede precargar.

## Errores frecuentes

- `name` distinto del directorio, o con mayúsculas y guiones bajos (`Notas_Version`).
- Una `description` que dice qué es la skill pero no cuándo usarla.
- Poner el procedimiento en `references/` y dejar el cuerpo vacío: el agente carga la skill y no sabe qué hacer.
- Usar campos de Claude Code en una skill que quieres compartir con otras herramientas sin saber que se ignorarán.

## Ejercicio

> [!ejercicio] Anota una skill
> Elige una skill que uses (tuya o pública) y anota, como en el ejemplo, qué hace cada campo del frontmatter, qué parte del cuerpo es resultado, procedimiento y límites, y qué recursos usa. Clasifica cada campo como «estándar» o «extensión de un cliente».
>
> **Está bien si** puedes decir en una frase cuándo se activa y cuándo no, cada campo está clasificado correctamente según las dos tablas de esta lección y propones al menos una mejora concreta (mover detalle a `references/`, añadir límites o una frase de activación).

> [!ejercicio]- Pistas
> Si la descripción no menciona ninguna frase que diría un usuario real, ya tienes tu mejora. Si el cuerpo pasa de 200 líneas, busca qué parte solo hace falta a veces.

## Resumen

- Tres capas: metadatos siempre, cuerpo al usarla, recursos bajo demanda.
- El estándar define `name`, `description`, `license`, `compatibility`, `metadata` y `allowed-tools`; `name` debe coincidir con el directorio.
- Claude Code añade campos como `disable-model-invocation`, `context: fork` o `paths`, que otros clientes ignoran.
- Los pasos deterministas van en `scripts/`: solo su salida ocupa contexto.
- Proyecto, usuario y plugin deciden quién tiene la skill; el frontmatter decide quién la lanza.

## Para seguir

- [[roadmap/50-skills/03-carga-bajo-demanda]]
- [[docs/claude-code/03-skills]]
- [[plantillas/skill]]
