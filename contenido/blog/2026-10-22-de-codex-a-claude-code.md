---
titulo: "De Codex a Claude Code: cómo evolucionó mi harness"
descripcion: La historia de mi harness desde el bundle 0.4.0 para Codex hasta el 0.8.0 en Claude Code, qué cambió en cada versión, por qué, y lo que aprendí por el camino.
creado: 2026-10-22
estado: revision
tipo: nota-de-campo
destacado: false
tags: [harness, claude-code, codex, sdd]
relacionados: ["[[sistemas/harness-sdd-claude-code]]", "[[cursos/harness-engineering/12-probar-y-evolucionar-el-harness]]", "[[cursos/harness-engineering/index]]", "[[glosario/harness]]"]
---

Mi [[glosario/harness|harness]] no nació en Claude Code. El punto de partida fue un bundle 0.4.0 nativo de Codex, generado con una herramienta llamada harness-cli. La versión de hoy es la 0.8.0 y vive en Claude Code. Entre medias cambió casi todo lo de fuera y bastante poco de lo de dentro. Esta nota cuenta ese camino y lo que aprendí en cada paso.

## 0.4.0: la idea ya estaba

La 0.4.0 ya tenía el esqueleto que conservo. Una sesión principal que hace de [[glosario/orquestador|orquestador]] y cuatro subagentes en serie: explorer, designer, builder y verifier. Un contrato de flujo en `workflow.toml` con fases, eventos, actores y guards. [[glosario/veredicto|Veredictos]] estructurados (`PASS`, `FAIL_REPAIRABLE`, `FAIL_NONREPAIRABLE`, `BLOCKED_TOOLING`) en lugar de frases como «parece correcto». Un solo gate humano obligatorio y un solo repair automático.

Y una lista de cosas que decidió no tener: base de datos de memoria o vector store, motor externo de grafos, router de modelos, bucles abiertos de autoevaluación, dependencias de Python externas. Esa lista sigue siendo de lo que más valoro. Las ausencias estaban elegidas a propósito, por simplicidad, y solo se revisan cuando hay una necesidad observada y medible.

Todo era nativo de Codex: la carpeta `.codex/`, un `config.toml`, agentes definidos en TOML con su modelo y su esfuerzo de razonamiento, y `AGENTS.md` como punto de entrada.

## Lo que fallaba

Pero tenía agujeros, y casi todos eran el mismo problema con distintas caras: **cosas que el sistema afirmaba sin comprobar**.

- El registro de qué subagentes se habían ejecutado (`runtime-agents.yaml`) lo escribía el orquestador. Es decir, el propio modelo declaraba que un agente había corrido.
- El runner de aceptación era un stub que devolvía éxito, y la comprobación de trazabilidad también era un stub.
- El validador tenía cuatro tests.
- `blocked` era una fase terminal. Si algo se bloqueaba, la única salida era editar el estado a mano.
- Había un segundo gate humano, GATE#2, para aprobar el código, y llegaba antes de saber si pasaba la aceptación. Aprobabas sin la evidencia que justificara aprobar.

Y errores más prosaicos en el bundle generado: un script de arranque que inicializaba git en una subcarpeta, referencias a funciones y comandos que no existían y la configuración de MCP en una ruta que Claude Code no lee.

## 0.5.0: traducir a lo nativo

Al pasar a Claude Code tenía dos opciones: emular la estructura de Codex o traducirla a las primitivas propias de la herramienta. Traduje:

- `.codex/` y `config.toml` pasaron a `.claude/` y `settings.json`. Los agentes en TOML pasaron a [[docs/claude-code/02-subagentes|subagentes]] en Markdown con frontmatter (`model`, `effort`, `tools`, `maxTurns`).
- La entrada dejó de ser `AGENTS.md` y pasó a un [[glosario/claude-md|CLAUDE.md]] que importa `HARNESS.md` y `AGENTS.md`, porque Claude Code descubre `CLAUDE.md`.
- La profundidad máxima de 1 se convirtió en agentes sin la herramienta `Agent` más la variable `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1`.

Y arreglé lo que fallaba, siempre en la misma dirección: que el código compruebe lo que antes se afirmaba.

| 0.4.0 | 0.5.0 |
|---|---|
| El orquestador declara qué subagentes corrieron | Un [[glosario/hook|hook]] `SubagentStop` registra cada ejecución y las guards la verifican contra el transcript real |
| Runner de aceptación stub | Runner real que ejecuta la aceptación aprobada y guarda la evidencia |
| `acceptance.yaml` con campos de estado y evidencia | Aceptación inmutable, resultados en un archivo aparte y spec congelada por hash al aprobar |
| `blocked` terminal | `blocked` con salidas humanas: replanificar, reintentar o cancelar |
| Verifier + GATE#2 | Reviewer en un solo pase, sin GATE#2 |
| Sin control de coste ni guard de seguridad | `ledger.py` (coste por subagente) y `guard.py` (fronteras deterministas) |
| 4 tests | 58 tests |

La lección de esa versión: **un dato que declara el modelo vale menos que uno que mide el código.** Y un stub que devuelve éxito es peor que no tener nada, porque te da una falsa sensación de control. Por eso hoy el validador rechaza cualquier aceptación que use un `verify.sh` sin configurar: sería un éxito que no demuestra nada.

## 0.8.0: lo que enseña el uso real

Entre la 0.5 y la 0.8 el harness se fue a trabajar. Lo derivé en dos harnesses especializados para dos proyectos reales, y en ellos nacieron la 0.6 y la 0.7. En la base esas versiones no existen: la 0.8.0 es la base genérica que recoge lo que aprendieron los derivados, sin nada específico de producto.

Lo que trajo:

- **Las correcciones de la auditoría** que le hice a la 0.5.0, que cuento en [[blog/2026-10-26-auditar-tu-propio-harness]].
- **Un guard más fino.** Analiza los comandos con un léxico que respeta comillas y heredocs, así que un `grep "-> None"` ya no parece una redirección. Solo el builder escribe por Bash; el resto de subagentes son de solo lectura. Y hay un hook nuevo sobre `Read`, `Grep` y `Glob` para que nadie lea secretos.
- **IDs completos de modelo** en los agentes (`claude-sonnet-5-5`, `claude-opus-5-5`) en lugar de alias, y precios al día.
- **Herramientas para sesiones largas.** Un [[glosario/canario-de-contexto|canario de contexto]] (el orquestador empieza cada respuesta con `<TU NOMBRE> ·` y, si deja de hacerlo, el contexto está saturado) y una skill `/new-session` que guarda un prompt de [[glosario/traspaso-de-sesion|traspaso]].
- **Métricas agregadas** de todas las features con `feature.py metrics`.
- **Un cambio de estructura** que parece menor y no lo es: lo que se copia a un proyecto vive en `HARNESS/` y los manuales en `INSTRUCCIONES/`. Antes, el orquestador y el explorer cargaban o leían unos 200 KB de documentación del propio harness.

La suite de tests ha pasado de 58 a 95.

Mientras tanto, la propia herramienta también ha avanzado. Claude Code ya lee `AGENTS.md` de forma nativa cuando no hay `CLAUDE.md`, y trae worktrees nativos. Parte de mi harness es anterior a eso. No me molesta: el `@AGENTS.md` dentro de `CLAUDE.md` sigue funcionando en cualquier versión, y cuando una pieza propia queda cubierta por una nativa, lo sano es retirarla.

## Lo que me llevo

- **Mide en vez de declarar.** Runtimes, coste y aceptación salen de transcripts y comandos, nunca de lo que dice el modelo.
- **Cada estado necesita una salida.** Si para salir de un estado hay que editar un archivo a mano, alguien acabará editándolo mal.
- **Aprueba donde todavía puedes cambiar algo.** La aprobación humana sirve antes de construir, sobre la spec. Después decide la evidencia.
- **Traduce a las primitivas de tu herramienta.** Hooks, subagentes y permisos nativos dan más garantías que una emulación, y las garantías que ofrece la herramienta las mantiene otro.
- **La documentación también es contexto.** Lo que tu agente puede leer, lo paga en tokens.

Lo de dentro casi no ha cambiado: el pipeline de cuatro agentes, una sola puerta humana y un único repair siguen ahí desde la 0.4.0. Lo que ha cambiado es cuánto de todo eso se puede comprobar.

## Para seguir

- [[sistemas/harness-sdd-claude-code]]: el harness tal como es hoy, pieza a pieza.
- [[cursos/harness-engineering/index]]: el curso que lo explica desde cero.
- [[cursos/harness-engineering/12-probar-y-evolucionar-el-harness]]: cómo se prueba y cuándo merece crecer.
- [[docs/claude-code/04-hooks]]: los hooks de Claude Code en los que se apoya todo esto.

*Borrador inicial: pendiente de reescribir con la voz del autor.*
