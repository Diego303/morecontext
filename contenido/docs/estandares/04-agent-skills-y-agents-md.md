---
titulo: Agent Skills y AGENTS.md
descripcion: Especificación abierta de SKILL.md (campos, divulgación progresiva y validación), su gobernanza en la AAIF y el formato AGENTS.md, con su relación con CLAUDE.md.
creado: 2026-10-29
orden: 4
nivel: intermedio
tags: [skills, agents-md, estandares, agentes-de-codigo]
relacionados: ["[[glosario/skill]]", "[[glosario/agents-md]]", "[[docs/claude-code/03-skills]]", "[[docs/claude-code/01-memoria-claude-md-y-agents-md]]", "[[roadmap/50-skills/index]]"]
---

Dos formatos abiertos resuelven el mismo problema desde lados distintos: **dar a un agente conocimiento que no está en sus pesos sin llenarle el contexto**. **Agent Skills** empaqueta procedimientos reutilizables (una carpeta con un `SKILL.md`) que el agente carga solo cuando le hacen falta. **AGENTS.md** es un único archivo Markdown en la raíz de un repositorio con las instrucciones de ese proyecto para agentes de código. Los dos están hoy en la Agentic AI Foundation. Esta página documenta el formato de cada uno y quién los lee; para aprender a escribir *skills* desde cero, sigue el nivel [[roadmap/50-skills/index]].

## Agent Skills: el formato

Una [[glosario/skill|skill]] es una carpeta. El único archivo obligatorio es `SKILL.md`: un frontmatter YAML y un cuerpo Markdown con las instrucciones. Puede llevar además carpetas opcionales.

```text
revisar-migraciones/
├── SKILL.md          # obligatorio: frontmatter + instrucciones
├── scripts/          # código que el agente ejecuta (en vez de leerlo)
├── references/       # documentación que lee solo si la necesita
└── assets/           # plantillas, esquemas, ficheros de ejemplo
```

```markdown title="revisar-migraciones/SKILL.md"
---
name: revisar-migraciones
description: Revisa migraciones de base de datos antes de aplicarlas. Úsala cuando el usuario pida revisar, validar o aplicar una migración SQL o un archivo de alembic.
license: Apache-2.0
compatibility: Necesita psql y acceso de solo lectura a la base de datos de staging.
metadata:
  autor: equipo-datos
  version: "1.2"
---

# Revisar migraciones

1. Ejecuta `scripts/plan.sh <archivo>` y lee el plan.
2. Bloquea la migración si borra columnas con datos o bloquea tablas grandes. Los criterios están en `references/criterios.md`.
3. Devuelve un veredicto: aprobar, aprobar con cambios o rechazar, con el motivo.
```

| Campo | Obligatorio | Restricciones |
|---|---|---|
| `name` | Sí | 1–64 caracteres de `a-z`, `0-9` y `-`; sin guion al principio ni al final, sin `--`; **igual al nombre de la carpeta** |
| `description` | Sí | 1–1.024 caracteres. Qué hace **y cuándo usarla**: es lo único que el agente lee para decidir |
| `license` | No | Licencia de la *skill* |
| `compatibility` | No | Hasta 500 caracteres: requisitos de entorno (herramientas, red, sistema) |
| `metadata` | No | Mapa de cadenas a cadenas para lo que quieras (autor, versión…) |
| `allowed-tools` | No, **experimental** | Herramientas preaprobadas, separadas por espacios: `Bash(git:*) Read` |

Fuente: la [especificación de agentskills.io](https://agentskills.io/specification) (consultada el 29 de octubre de 2026). Para comprobar que una *skill* cumple el formato, la implementación de referencia ofrece `skills-ref validate ./revisar-migraciones`.

## Divulgación progresiva

La clave del formato es que el agente no carga todas las *skills* a la vez. Lo hace en tres niveles, lo que se llama [[glosario/divulgacion-progresiva|divulgación progresiva]]:

1. **Metadatos**: al arrancar, solo `name` y `description` de cada *skill* (del orden de 100 tokens por *skill*).
2. **Instrucciones**: cuando la tarea encaja con una descripción, el agente lee el cuerpo de `SKILL.md`. La especificación recomienda menos de 5.000 tokens y menos de 500 líneas.
3. **Recursos**: los archivos de `scripts/`, `references/` y `assets/` solo se leen o ejecutan cuando las instrucciones los piden.

Por eso puedes instalar decenas de *skills* sin pagar su contexto en cada llamada. Y por eso **la descripción manda**: si no dice cuándo usar la *skill*, el agente no la activará; si es demasiado amplia, la activará cuando no toca. El detalle del mecanismo está en [[roadmap/50-skills/03-carga-bajo-demanda]].

> [!aviso] Una skill de terceros es código que ejecutas
> Una *skill* trae instrucciones que el agente sigue y scripts que ejecuta con tus permisos. Léela entera antes de instalarla, igual que harías con una dependencia. Ver [[docs/seguridad/04-mcp-y-skills-de-terceros]] y [[radar/2026-10-26-skills-cadena-de-suministro]].

## Gobernanza y adopción

El 22 de octubre de 2026 [Anthropic donó Agent Skills a la Agentic AI Foundation](https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation) (Linux Foundation). La donación incluye el estándar, el nombre y el logotipo, la organización de GitHub y el dominio agentskills.io. Lo mantienen a título individual ingenieros de Anthropic, Google, OpenAI y otras empresas, con David Soria Parra y Mahesh Murag como *Lead Maintainers*. No hace falta ser miembro de la fundación para usarlo ni para contribuir. La hoja de ruta propuesta empieza por versiones numeradas, un proceso formal de propuestas y una guía de seguridad para quien escribe e instala *skills*.

Según el mismo anuncio, desde que se publicó el estándar en diciembre de 2025 lo han integrado más de 70 plataformas de agentes, entre ellas ChatGPT, Cursor, GitHub Copilot y VS Code, y la comunidad ha escrito cargadores para Codex, Cursor y OpenCode. Son cifras de Anthropic, sin auditoría independiente; la lista completa de clientes está en agentskills.io.

Del lado de Anthropic, el formato se usa en tres sitios:

- **Claude Code**, con campos propios en el frontmatter (`disable-model-invocation`, `context: fork`, `paths`…): [[docs/claude-code/03-skills]].
- **La Skills API** de la plataforma de Claude, que fuera de Claude Code solo acepta los campos del estándar.
- **claude.ai**, y el Claude Agent SDK con su opción `skills=`.

Existe además la extensión de MCP *Skills over MCP*, para que un servidor MCP publique *skills* y sus archivos como recursos: [[docs/estandares/02-extensiones-mcp]].

## AGENTS.md: instrucciones de un repositorio

[[glosario/agents-md|AGENTS.md]] es un archivo Markdown en la raíz del repositorio con lo que un agente de código necesita saber de **ese** proyecto: cómo instalar, compilar y probar, qué carpetas no tocar, convenciones de estilo, cómo se hacen los commits. No tiene esquema ni campos obligatorios. La AAIF lo describe como «a simple, open format for guiding coding agents» y lo aloja como proyecto propio.

```markdown title="AGENTS.md"
# Proyecto: api-facturas

## Comandos
- Instalar: `uv sync`
- Pruebas: `uv run pytest -q` (deben pasar antes de cada commit)
- Lint: `uv run ruff check .`

## Límites
- No edites `migrations/` a mano: genera migraciones con `alembic revision --autogenerate`.
- No toques `vendor/` ni los archivos `*.lock`.

## Convenciones
- Python 3.12, tipos en todas las funciones públicas.
- Mensajes de commit: `tipo(ámbito): resumen` en español.
```

Cómo se lee, según el artículo [Measuring AGENTS.md](https://aaif.io/blog/measuring-agents-md-what-five-runs-show-that-one-doesn-t) del blog de la AAIF (22 de julio de 2026):

- Nació como el formato de OpenAI para Codex y lo han adoptado, entre otros, Cursor, Amp, opencode, Warp, Claude Code, el agente de código de GitHub Copilot y goose.
- En un monorepo puedes poner un `AGENTS.md` general en la raíz y otros en cada subproyecto: **gana el más cercano** al archivo que se edita.
- Una instrucción explícita del usuario en la conversación prevalece sobre el archivo.
- Cada herramienta pone sus propios límites de tamaño. Por ejemplo, Codex corta por defecto la cadena de instrucciones en 32 KiB (configurable con `project_doc_max_bytes`).

Cómo lo descubre y aplica cada herramienta cambia entre versiones: compruébalo en su documentación antes de depender de un detalle. Y recuerda que AGENTS.md **guía, no obliga**: lo que de verdad no debe pasar se impone con CI, protección de ramas, permisos y *sandbox*.

La plantilla [[plantillas/agents-md]] trae una versión completa lista para copiar.

## AGENTS.md y CLAUDE.md

Claude Code tiene su propio archivo de memoria, [[glosario/claude-md|CLAUDE.md]], con jerarquía (gestionado, usuario, proyecto, local) e importaciones `@ruta`. Desde la versión 2.1.277 **lee AGENTS.md de forma nativa**:

| Ajuste *Project instructions* | Comportamiento |
|---|---|
| `claude-md-or-agents-md` (por defecto) | Lee `AGENTS.md` solo si no hay `CLAUDE.md`, `.claude/CLAUDE.md` ni `CLAUDE.local.md` en el directorio de trabajo o por encima |
| `claude-md-and-agents-md` | Lee los dos |
| `managed-only` | Solo las instrucciones gestionadas por la organización |

No lee `AGENTS.local.md`, `AGENTS.override.md` ni la carpeta `.agents/`. Si quieres un único archivo para todas las herramientas y que funcione en cualquier versión de Claude Code, la forma más robusta es un `CLAUDE.md` mínimo que lo importe:

```markdown title="CLAUDE.md"
@AGENTS.md

## Solo para Claude Code
- Usa el subagente `revisor` antes de dar una tarea por terminada.
```

Así el contenido común vive en AGENTS.md y CLAUDE.md queda para lo específico de Claude Code (subagentes, hooks, *skills*). Los detalles de carga, importaciones y memoria automática están en [[docs/claude-code/01-memoria-claude-md-y-agents-md]] y la plantilla en [[plantillas/claude-md]].

## Skill o AGENTS.md

| Si es… | Ponlo en |
|---|---|
| Algo que el agente debe saber **siempre** en este repositorio (comandos, límites, estilo) | AGENTS.md |
| Un **procedimiento** que solo hace falta a veces (revisar migraciones, preparar una *release*) | Una *skill* |
| Algo que se repite **en varios proyectos** | Una *skill* compartida |
| Algo que **no debe ocurrir nunca** | Ni uno ni otro: un permiso, un hook o el CI |

Un AGENTS.md que crece sin control es contexto que pagas en cada llamada. Cuando una sección pasa de unas pocas líneas y solo aplica a una tarea concreta, muévela a una *skill*.

## Errores frecuentes

- **`name` distinto del nombre de la carpeta**: la *skill* no valida. Pasa `skills-ref validate` antes de publicarla.
- **Descripciones que dicen qué hace pero no cuándo usarla.** El agente no la activa.
- **Meter documentación entera en `SKILL.md`** en vez de en `references/`: pierdes la divulgación progresiva.
- **Confiar en `allowed-tools` como barrera de seguridad.** Es experimental y cada cliente lo interpreta a su manera.
- **Mantener CLAUDE.md y AGENTS.md duplicados a mano.** Acaban divergiendo: importa uno desde el otro.
- **Usar AGENTS.md para prohibir.** Si saltarse la regla es grave, imponla fuera del modelo.

## Ver también

- [[roadmap/50-skills/02-anatomia-de-una-skill]] y [[roadmap/50-skills/04-escribir-tu-primera-skill]].
- [[docs/claude-code/03-skills]] y [[plantillas/skill]].
- [[docs/claude-code/01-memoria-claude-md-y-agents-md]] y [[cursos/agentes-de-codigo/02-contexto-del-repositorio]].
- [[radar/2026-10-27-agent-skills-en-la-aaif]] y [[docs/estandares/index]].
