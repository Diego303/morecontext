---
titulo: Agentes de código
descripcion: Cómo trabaja un agente que lee, edita y prueba código en tu repositorio, y cómo guiarlo y revisar su trabajo para fiarte de lo que entrega.
creado: 2026-09-14
actualizado: 2026-10-29
orden: 5
nivel: intermedio
horas: 4
objetivo: Construir y dirigir un agente de código que explora un repositorio, propone un plan, hace cambios pequeños y los verifica con tests antes de entregarlos.
requiere: ["[[roadmap/20-herramientas/index]]", "[[roadmap/40-primer-agente/index]]"]
relacionados: ["[[sistemas/agente-de-codigo]]", "[[disciplinas/explorar-planificar-implementar-verificar]]", "[[disciplinas/cambios-pequenos-y-revisables]]", "[[disciplinas/pair-programming-con-agentes]]", "[[docs/claude-code/index]]"]
tags: [agentes, codigo, herramientas]
---

Un agente de código es un [[glosario/agente|agente]] cuyo entorno es un repositorio: lee archivos, busca, edita y ejecuta comandos hasta que la tarea está hecha y los tests lo confirman. El mecanismo es el mismo [[glosario/bucle-agentico|bucle agéntico]] que viste en el roadmap. Lo que cambia es el entorno: un repositorio tiene convenciones implícitas, efectos secundarios y una forma objetiva de comprobar el trabajo (compila o no, los tests pasan o no). Este curso va de aprovechar eso.

## Para quién

Para desarrolladores que ya usan agentes de código a diario y quieren entender qué pasa por dentro, y para quien quiere construir uno propio para su equipo o su CI. Si nunca has escrito un bucle con [[glosario/tool-use|tool use]], empieza por [[roadmap/20-herramientas/index]] y [[roadmap/40-primer-agente/index]].

## Requisitos

- Haber completado [[roadmap/20-herramientas/01-ciclo-tool-use]] y [[roadmap/40-primer-agente/02-el-bucle-agentico]].
- Python 3.10+ o Node 18+, git y un repositorio de prueba con tests (sirve cualquier proyecto pequeño tuyo).
- Recomendable: [[roadmap/40-primer-agente/06-depurar-con-trazas]], porque vas a leer muchas trazas.

## Temario

1. [[cursos/agentes-de-codigo/01-como-trabaja-un-agente-de-codigo]]. Las cuatro herramientas que importan (leer, buscar, editar, ejecutar), por qué editar por reemplazo exacto funciona mejor que reescribir archivos, y un agente mínimo de unas cien líneas.
2. [[cursos/agentes-de-codigo/02-contexto-del-repositorio]]. El archivo de memoria del proyecto (un `CLAUDE.md` o `AGENTS.md`): qué poner, qué no, cómo lo cargan las herramientas y cómo mantenerlo. Precargar frente a descubrir bajo demanda.
3. [[cursos/agentes-de-codigo/03-explorar-planificar-implementar-verificar]]. El flujo de trabajo que separa lo que el agente entiende de lo que toca. Herramientas distintas en cada fase y el plan como artefacto revisable.
4. [[cursos/agentes-de-codigo/04-revisar-y-confiar]]. Cómo revisar lo que entrega, qué señales indican que no debes fiarte y cómo graduar la autonomía según lo reversible que sea cada acción.

## Dónde encajan Claude Code, Codex, OpenCode y los demás

Los agentes de código que usas a diario son este mismo bucle con mucho trabajo de producto alrededor: más herramientas, permisos, *sandbox*, memoria, subagentes y una interfaz. En el curso construyes el núcleo a mano para entender qué hacen y por qué fallan; con eso delante, configurar cualquiera de ellos deja de ser magia.

| Agente | Licencia | Qué conviene saber |
|---|---|---|
| [[herramientas/claude-code\|Claude Code]] | Propietaria (Anthropic) | Lee `CLAUDE.md` y, si no hay, `AGENTS.md`; subagentes, *skills*, *hooks*, reglas de permisos y *sandbox* de Bash. Referencia completa en [[docs/claude-code/index]] |
| Codex CLI (OpenAI) | Apache-2.0 | Agente de terminal; con `--oss` trabaja contra modelos locales |
| [[herramientas/opencode\|OpenCode]] | MIT | Agente de terminal que acepta cualquier proveedor, también un endpoint local compatible con OpenAI |
| [[herramientas/aider\|Aider]], [[herramientas/cline\|Cline]], [[herramientas/openhands\|OpenHands]], Gemini CLI | Apache-2.0 o MIT | Variantes del mismo bucle: edición sobre git en terminal, extensión de editor, desarrollo en *sandbox* Docker |

Los abiertos se pueden conectar a un modelo de pesos abiertos servido en local; piden un modelo que llame bien a herramientas y al menos 64k de contexto ([[recetas/agente-de-codigo-con-modelo-local]]). Cuando ya domines el bucle, el siguiente paso es diseñar el entorno que lo rodea: especificaciones, veredictos, permisos y sesiones largas. Eso es [[cursos/harness-engineering/index]].

## Qué construyes

Un agente de código en Python (con equivalente en TypeScript) que:

- trabaja confinado a la carpeta del repositorio y con una lista de comandos permitidos;
- carga las convenciones del proyecto desde un archivo de memoria;
- separa exploración de solo lectura, plan aprobado e implementación;
- ejecuta los tests después de cada cambio y no da la tarea por terminada si fallan;
- entrega un diff pequeño junto a un informe de alarmas (tests tocados, archivos fuera de alcance, dependencias nuevas).

Es la base del sistema completo descrito en [[sistemas/agente-de-codigo]].

> [!consejo] Cómo aprovecharlo
> Haz los ejercicios sobre un repositorio real tuyo, no sobre uno de juguete. Las convenciones implícitas de un proyecto de verdad son lo que hace fallar a un agente, y es justo lo que vas a aprender a darle.
