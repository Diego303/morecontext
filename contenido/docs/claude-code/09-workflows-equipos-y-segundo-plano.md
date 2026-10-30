---
titulo: Workflows, equipos de agentes y segundo plano
descripcion: Las formas de trabajar en paralelo con Claude Code - subagentes en segundo plano y fork, sesiones en segundo plano, worktrees, dynamic workflows y equipos de agentes - y cuándo usar cada una frente a un harness propio.
creado: 2026-10-29
orden: 9
nivel: avanzado
tags: [claude-code, paralelismo, workflows, multiagente, worktrees]
relacionados: ["[[disciplinas/trabajo-en-paralelo-con-agentes]]", "[[cursos/harness-engineering/13-features-en-paralelo-con-olas]]", "[[glosario/worktree]]", "[[recetas/features-en-paralelo-con-worktrees]]"]
---

Claude Code ofrece varias formas de hacer más de una cosa a la vez, y se diferencian en una pregunta: **quién lleva el plan**. Con subagentes, lo lleva Claude turno a turno dentro de tu sesión; con sesiones en segundo plano, lo llevas tú; con un *dynamic workflow*, un script; con un equipo de agentes, un agente líder. Este artículo es la referencia de cada mecanismo y termina comparándolos con un harness propio como el del autor.

## Subagentes en segundo plano y modo fork

Sin configuración, un subagente que Claude lanza desde la conversación principal **arranca en segundo plano**: tu sesión sigue respondiendo mientras trabaja, y sus peticiones de permiso aparecen en ella. `background: true` en el frontmatter lo mantiene en segundo plano aunque Claude pida esperarlo. `/tasks` lista lo que corre en segundo plano en la sesión.

El **modo fork**, activo por defecto en sesiones interactivas, lanza subagentes que **heredan la conversación completa** en lugar de empezar de cero. Ahorra escribir un encargo autocontenido a cambio de un contexto inicial más grande. Se desactiva con `CLAUDE_CODE_FORK_SUBAGENT=0`; `/subtask` lanza uno a mano y `/fork` copia la sesión entera a una sesión en segundo plano. Los detalles de los subagentes están en [[docs/claude-code/02-subagentes]].

## Sesiones en segundo plano

```bash
claude --bg "investiga por qué falla de forma intermitente el test de SettingsChangeDetector"
claude agents            # vista de agentes: todas las sesiones, su estado y cuáles te necesitan
claude attach <id|nombre> # abrir una sesión como interactiva en esta terminal
claude logs <id|nombre>   # su salida reciente
claude stop <id>          # pararla (alias: claude kill)
claude respawn <id>       # reiniciarla; reanuda su conversación si la tiene
```

Cada sesión es una conversación completa e independiente. Antes de editar archivos, una sesión lanzada con `--bg` o desde la vista de agentes **se mueve a un worktree propio** bajo `.claude/worktrees/`, para que varias sesiones lean el mismo checkout pero escriban cada una en el suyo (`worktree.bgIsolation: "none"` lo desactiva). La vista de agentes está en vista previa de investigación.

## Worktrees

Un [[glosario/worktree|worktree]] de git es un segundo directorio de trabajo del mismo repositorio, con su propia rama. Claude Code lo usa en tres sitios:

- `claude -w` / `--worktree`: arranca una sesión en un worktree nuevo.
- `isolation: worktree` en el frontmatter de un subagente: trabaja en un worktree temporal.
- `worktree.baseRef` fija la referencia desde la que se crean.

Los hooks `WorktreeCreate` y `WorktreeRemove` permiten personalizar cómo se crean y se borran (por ejemplo, copiar un `.env` de desarrollo o instalar dependencias).

## Dynamic workflows

Un *dynamic workflow* es un **script de JavaScript que orquesta muchos subagentes**. Claude lo escribe para la tarea que describes, un *runtime* lo ejecuta en segundo plano y los resultados intermedios viven en variables del script, no en el contexto de Claude: tu conversación solo recibe el resultado final. Encaja con trabajos demasiado grandes para coordinarlos turno a turno: auditar todos los endpoints, migrar 500 archivos, investigar con fuentes contrastadas entre sí.

Se piden en lenguaje natural («usa un workflow para…») o con la palabra `ultracode` en el prompt; `/effort ultracode` deja que Claude decida cuándo usarlos en toda la sesión. Trae uno integrado, `/deep-research`. `/workflows` muestra los que corren, sus fases y lo que ha encontrado cada agente, y permite pausar, parar o guardar el script como comando.

Así es un workflow guardado:

```js title=".claude/workflows/audit-routes.js"
export const meta = {
  name: 'audit-routes',
  description: 'Audit every route handler for missing auth checks',
}

const found = await agent('List every .ts file under src/routes/.', {
  schema: { type: 'object', required: ['files'], properties: { files: { type: 'array', items: { type: 'string' } } } },
})

const audits = await pipeline(found.files, file =>
  agent(`Audit ${file} for missing authentication checks.`, { label: file }),
)

return audits.filter(Boolean)
```

Las piezas: `agent()` lanza un subagente (con `schema`, devuelve JSON que cumple el esquema; tras cinco intentos fallidos, error); `pipeline()` lanza uno por elemento de una lista; `parallel()` lanza un conjunto a la vez y espera a todos; `phase()` agrupa en la vista de progreso; `log()` muestra un mensaje; `args` recibe la entrada al invocarlo. `meta` debe ser un literal: si lleva variables o llamadas, el comando desaparece del autocompletado. Un `agent()` parado o con un error irrecuperable devuelve `null`, de ahí el `.filter(Boolean)`.

| Límite | Valor |
|---|---|
| Agentes simultáneos | 16 por defecto (menos si hay pocas CPU); `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS` de 1 a 256 |
| Elementos por `parallel()` o `pipeline()` | 4.096; una lista mayor da error |
| Agentes por ejecución | 1.000 |
| Entrada del usuario a mitad | No; para firmar entre etapas, una etapa por workflow |
| Acceso directo a archivos o shell desde el script | No; lo hacen los agentes |
| `import()` | No |

**Reanudación determinista.** `Date.now()`, `Math.random()` y `new Date()` sin argumentos **lanzan error** dentro del script. El motivo: al relanzar un workflow, el runtime lo repite en orden y cada agente completado devuelve su resultado guardado, mientras que el primero cuyo prompt cambie (y todos los posteriores) se vuelve a ejecutar. Con tiempo o azar en el script, cada relanzamiento cambiaría los prompts y se perdería todo lo hecho. Si necesitas una fecha, pásala por `args`.

**Permisos y coste.** En `claude -p` y en el Agent SDK no hay diálogo de aprobación: un workflow necesita una regla `Workflow` o `Workflow(<nombre>)`, el modo `auto`, un hook o tu callback de permisos. Sus agentes usan tus reglas de permisos, así que preaprueba lo que necesitan antes de una ejecución larga. Un workflow gasta bastante más que la misma tarea en conversación: Claude Code avisa con `Large workflow` cuando pasa de 25 agentes o de 1,5 millones de tokens previstos, y `workflowSizeGuideline` (`small`, `medium`, `large`) orienta cuántos agentes plantea. Prueba primero con un trozo pequeño del trabajo. `disableWorkflows: true` los desactiva.

## Equipos de agentes (experimental)

Un equipo de agentes es un conjunto de **sesiones completas de Claude Code** coordinadas por un líder, con una lista de tareas compartida y mensajería directa entre ellas. Está desactivado por defecto:

```json title=".claude/settings.json"
{"env": {"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"}}
```

Componentes: el **líder** (tu sesión), los **compañeros** (cada uno con su contexto), la **lista de tareas** (pendiente, en curso, completada, con dependencias y bloqueo de archivo al reclamarlas) y un **buzón** por agente en `~/.claude/teams/<equipo>/inboxes/`. Se piden en lenguaje natural («lanza tres compañeros: uno de UX, uno de arquitectura y uno que lleve la contraria»), y pueden reutilizar definiciones de `.claude/agents/`. Los hooks `TeammateIdle`, `TaskCreated` y `TaskCompleted` permiten imponer criterios de calidad. Un mensaje de otro agente nunca cuenta como aprobación tuya.

Límites que importan: no funcionan en `claude -p` ni en el Agent SDK; un equipo por sesión; sin equipos anidados; el líder es fijo; `/resume` no recupera a los compañeros en proceso; **no aíslan los archivos**, así que dos compañeros que editan el mismo archivo se pisan; reparte los archivos entre ellos. Con los equipos activados, un subagente al que Claude da nombre se lanza como compañero, de modo que pueden formarse equipos sin pedirlo. El consumo de tokens crece con cada compañero; la documentación sugiere empezar con 3 a 5 y con tareas de investigación o revisión, sin escritura.

## Cuándo usar cada uno

| Mecanismo | Quién decide el siguiente paso | Dónde quedan los resultados | Úsalo cuando |
|---|---|---|---|
| Subagente | Claude, turno a turno | En el contexto de Claude | Una tarea lateral ensuciaría la conversación |
| Sesión en segundo plano | Tú | En cada sesión | Tienes tareas independientes y quieres revisarlas cuando acaben |
| Dynamic workflow | El script | En variables del script | Decenas o cientos de agentes, o resultados que deben contrastarse |
| Equipo de agentes | El líder | Lista de tareas compartida | Los trabajadores necesitan hablar entre sí y discrepar |
| Harness propio | Tu motor de estado | En disco, con contratos | Necesitas fases, puertas humanas, presupuestos y evidencia auditables |

## Frente a un harness propio: las olas del autor

El harness del autor resuelve el paralelismo de otra forma. Su versión con **olas** abre varias features a la vez, cada una en su propio worktree con su propia sesión de Claude Code y su propio flujo explorer → designer → puerta humana → builder → reviewer. Un script coordina la ola desde la sesión del árbol principal, que no lleva ninguna feature: decide qué features se pueden abrir a la vez, integra cada una con *squash* resolviendo los conflictos mecánicos, verifica y cierra. El humano aprueba la puerta de cada ventana y hace los commits y el push ([[glosario/ola]], [[sistemas/harness-sdd-olas]]).

Lo que aporta un harness así frente a las primitivas integradas:

- **Estado en disco y máquina de estados.** Cada feature tiene su fase, sus intentos y su coste en archivos que valida un motor determinista. Un workflow reanuda agentes; un harness reanuda **fases con sus garantías**.
- **Puertas humanas y firmas.** Los workflows no admiten entrada del usuario a mitad; el flujo del harness para en la puerta humana por diseño.
- **Coste por unidad de trabajo**, con presupuesto que bloquea la siguiente transición.
- **Políticas por agente** aplicadas por un hook.

Lo que aportan las primitivas integradas: no hay que mantenerlas, escalan a cientos de agentes y se escriben en una frase. Una regla práctica: usa un workflow para **trabajo ancho y de una sola pasada** (auditorías, migraciones mecánicas, investigación) y un harness para **trabajo largo que acaba en código fusionado**, donde importan la especificación, la revisión y la puerta humana. Las dos cosas se combinan: el builder de un harness puede lanzar un workflow para una migración concreta dentro de su fase.

> [!consejo] Antes de paralelizar, mira la revisión
> El cuello de botella del trabajo en paralelo suele ser la revisión humana, no los agentes. Cinco features a la vez son cinco diffs que revisar. Paraleliza solo tareas independientes y especificadas, y aísla siempre con worktrees ([[disciplinas/trabajo-en-paralelo-con-agentes]]).

## Errores típicos

- **Paralelizar escrituras sobre los mismos archivos** sin worktrees, sobre todo con equipos de agentes, que no aíslan.
- **Usar `Date.now()` en un workflow** para nombrar archivos: el script falla. Pasa la fecha por `args`.
- **Lanzar un workflow grande sin probar con un trozo**: el gasto escala con el número de agentes.
- **Esperar que un equipo funcione en CI**: no hay compañeros en `claude -p`.
- **Confundir `/agents` con `claude agents`**: el primero recuerda dónde están las definiciones de subagentes; el segundo abre la vista de sesiones en segundo plano.

## Ver también

- [[roadmap/60-multiagente/04-paralelismo]]: paralelismo explicado desde cero.
- [[cursos/harness-engineering/13-features-en-paralelo-con-olas]]: las olas paso a paso.
- [[recetas/integrar-features-en-paralelo]]: integrar sin romper nada.
- [[radar/2026-10-28-multiagente-un-solo-escritor]]: un solo escritor, varios pensadores.
