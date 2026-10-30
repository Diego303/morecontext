---
titulo: Patrones de orquestación y principios de diseño
descripcion: Los siete patrones que combina el harness, los nueve principios que lo sostienen con la línea de código que hace cumplir cada uno y las primitivas de Claude Code con que se construye.
creado: 2026-10-29
orden: 4
minutos: 30
tipo: teoria
objetivos:
  - Reconocer en el harness pipeline, router, orquestador-trabajadores, evaluador-optimizador acotado, máquina de estados, humano en el bucle y SDD
  - Relacionar cada uno de los nueve principios con el mecanismo determinista que lo aplica
  - Elegir la primitiva de Claude Code adecuada para cada pieza de un harness propio
requiere: ["[[cursos/harness-engineering/03-las-quince-piezas]]", "[[patrones/09-elegir-patron]]"]
relacionados: ["[[patrones/index]]", "[[docs/claude-code/index]]", "[[disciplinas/spec-primero]]", "[[recetas/maquina-de-estados-con-guards]]"]
tags: [harness, patrones, claude-code]
---

Al terminar esta lección sabrás leer el harness como una combinación de patrones conocidos y no como una caja negra. Podrás decir qué principio justifica cada restricción y con qué primitiva de Claude Code se implementa, que es justo lo que necesitas para diseñar el tuyo.

## La idea

El harness no inventa patrones. Combina siete que ya conoces de [[patrones/index]] y los ata con nueve principios. La diferencia con un diagrama de pizarra es que aquí cada patrón tiene un archivo y cada principio tiene una línea de código que lo hace cumplir. El propio contrato los nombra en su primera sección: pipeline, router, evaluador-optimizador acotado y máquina de estados.

## Siete patrones, cada uno en su sitio

| Patrón | Mecanismo | En el harness | Para profundizar |
| --- | --- | --- | --- |
| Pipeline | Etapas en serie; cada una consume la salida de la anterior | explorer → designer → builder → reviewer | [[patrones/03-encadenado]] |
| Router | Una señal estructurada decide el siguiente paso | El orquestador elige el evento según `RESULT` y `VERDICT`; el motor lo valida | [[patrones/04-enrutado]] |
| Orquestador-trabajadores | Un agente coordina y delega con contexto limpio | Sesión principal como orquestador; profundidad 1 | [[patrones/06-orquestador-trabajadores]] |
| Evaluador-optimizador | Uno produce, otro evalúa y devuelve | Reviewer → builder, acotado a una vuelta | [[patrones/07-evaluador-optimizador]] |
| Máquina de estados | Fases y transiciones explícitas con condiciones | `workflow.toml` + `feature.py` | [[recetas/maquina-de-estados-con-guards]] |
| Humano en el bucle | Decisiones reservadas a personas | GATE#1 y todas las salidas de `blocked` | [[disciplinas/humano-en-el-bucle]] |
| SDD | Se especifica y aprueba antes de construir | `design` → GATE#1 → spec congelada por hash | [[disciplinas/spec-primero]] |

### Un workflow cuyos pasos son agentes

Visto desde arriba, el harness es un [[glosario/workflow|workflow]]: el orden de las fases está fijado en el contrato. Dentro de cada fase trabaja un agente autónomo que decide cómo explorar o cómo implementar. Es el peldaño intermedio de [[patrones/01-workflows-vs-agentes]], y es deliberado: la parte cara de equivocarse (saltarse la aprobación, archivar sin pruebas) queda en el workflow; la parte que necesita juicio, en el agente.

Hay un matiz con el orquestador. En el patrón clásico, el orquestador decide sobre la marcha en qué subtareas dividir el trabajo. Aquí no: los cuatro trabajadores y su orden están fijados. El orquestador decide qué evento aplicar y qué contexto mínimo pasar en el prompt. Se parece más a [[patrones/11-planificador-generador-evaluador]] (designer, builder y reviewer, con la aceptación como contrato entre ellos) que a un orquestador libre.

### Un router que no puede equivocarse de salida

El reviewer termina su informe con `NEXT: pass | repairable_failure | human_required`. El orquestador lee esa señal y elige el evento. Si elige mal, una guard lo frena. Esta es la que impide mandar al humano un fallo que tenía arreglo automático, o un PASS:

```python title=".claude/tools/validate_harness.py"
def g_verdict_requires_human(ctx: Context) -> list[str]:
    data, problems = _verification(ctx)
    if problems or not data:
        return problems
    budget_left = (ctx.attempts.get("repair") or 0) < ctx.workflow["workflow"]["max_repair_attempts"]
    if data.get("verdict") == "PASS":
        return ["el veredicto es PASS: usa el evento pass"]
    if data.get("verdict") == "FAIL_REPAIRABLE" and budget_left and _repairable(data):
        return ["fallo reparable con presupuesto disponible: usa repairable_failure"]
    return []
```

El enrutado lo hace el modelo; la tabla de rutas válidas, el código.

## Nueve principios y quién los hace cumplir

1. **IA en lo semántico, código en los bordes.** El modelo decide qué evento aplicar; `feature.py` decide si es legal ejecutando las guards del contrato.
2. **Evidencia sobre afirmaciones.** «Hecho» solo con un comando ejecutado tras el último cambio: la guard `required_checks_passed` rechaza resultados anteriores a la entrada en verificación.
3. **[[glosario/minimo-privilegio|Mínimo privilegio]].** Cada agente escribe solo sus artefactos: `AGENT_SCOPES` en `guard.py` y la lista `tools:` de cada agente.
4. **[[glosario/fallo-en-cerrado|Fallo en cerrado]].** Si un control falla, bloquea: el guard convierte cualquier excepción en `deny` y un modelo sin precio bloquea el trabajo nuevo.
5. **Instrucciones separadas de datos.** Lo leído en archivos y herramientas nunca da órdenes: `HARNESS.md` §10, la cláusula de cada agente y el campo `SECURITY` de sus informes.
6. **Bucles acotados.** Número fijo de reintentos automáticos: `max_repair_attempts = 1`, que el validador exige.
7. **Contexto mínimo.** Se persiste en disco y se pasa por referencia: `omitClaudeMd`, informes de retorno y rutas en lugar de contenidos.
8. **Un solo escritor por artefacto.** Elimina carreras y responsabilidades difusas: la tabla de propiedad de `HARNESS.md` §8, que `guard.py` aplica a Edit y Write.
9. **Complejidad solo con evidencia.** Nada de memoria vectorial ni motores de grafos hasta que una necesidad medida lo pida: tabla de evolución en `HARNESS.md` §14 y `feature.py metrics` para medir.

El cuarto principio es el que más se olvida en harnesses caseros. Este es el final real de `guard.py`:

```python title=".claude/tools/guard.py"
def main() -> int:
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        decision = evaluate(payload)
    except Exception as exc:  # noqa: BLE001 - fail closed: ante la duda, se bloquea
        _log(f"error inesperado: {exc!r}")
        decision = _decision("deny", "El hook de seguridad fallo y bloquea por precaucion. Revisa "
                                     ".claude/state/hook-errors.log.")
    if decision:
        print(json.dumps(decision, ensure_ascii=False))
    return 0
```

Un control que falla en abierto convierte cada fallo en una autorización silenciosa. Este falla en cerrado y deja rastro en un log que el validador vigila.

## Las primitivas de Claude Code

Todo lo anterior se construye con piezas estándar de Claude Code. No hay plugin ni servidor propio:

| Primitiva | Cómo la usa el harness | Referencia |
| --- | --- | --- |
| `CLAUDE.md` con imports `@ruta` | Convierte la sesión principal en orquestador e importa `HARNESS.md` y `AGENTS.md` | [[docs/claude-code/01-memoria-claude-md-y-agents-md]] |
| Subagentes (`.claude/agents/*.md`) | Los cuatro canónicos, con `tools`, `model`, `effort`, `maxTurns`, `skills` y `omitClaudeMd` | [[docs/claude-code/02-subagentes]] |
| Skills (`.claude/skills/<n>/SKILL.md`) | 16 procedimientos; algunos precargados en agentes; tres solo humanos | [[docs/claude-code/03-skills]] |
| Comandos (`.claude/commands/*.md`) | `/approve` y `/reject`, que el modelo no puede invocar | [[docs/claude-code/05-comandos-y-plugins]] |
| Hooks en `settings.json` | `PreToolUse` → `guard.py`; `SubagentStop` → `ledger.py hook` | [[docs/claude-code/04-hooks]] |
| Permisos en `settings.json` | Preaprueba las herramientas del harness; prohíbe `git push`, `sudo` y leer `.env` o claves | [[docs/claude-code/06-permisos-y-sandbox]] |
| `env` en `settings.json` | `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH = "1"` | [[docs/claude-code/02-subagentes]] |
| Transcripts (`~/.claude/projects/…/*.jsonl`) | `ledger.py` mide tokens y coste; las guards verifican cada ejecución contra su transcript | [[cursos/harness-engineering/10-coste-y-presupuesto]] |
| MCP (`.mcp.json` en la raíz) | Documentado con un ejemplo; los agentes canónicos no lo usan | [[docs/claude-code/07-mcp-en-claude-code]] |

Tres decisiones merecen explicación.

**`AGENTS.md` se importa.** Claude Code lee `AGENTS.md` de forma nativa, pero con la configuración por defecto solo cuando no hay `CLAUDE.md`. Como el harness necesita `CLAUDE.md` para el rol de orquestador, importa las reglas del proyecto con `@AGENTS.md`, que funciona en cualquier versión. Así otras herramientas que leen `AGENTS.md` comparten las mismas reglas ([[glosario/agents-md]]).

**La profundidad se fija a 1.** Por defecto, un subagente puede lanzar los suyos hasta tres niveles. El harness lo corta por dos lados: ningún agente tiene la herramienta `Agent` (el validador lo prohíbe) y `settings.json` pone la variable a 1. Un subagente que orquesta tendría que conocer el contrato completo, y precisamente no lo carga.

**Las decisiones humanas no son invocables por el modelo.** Los comandos de decisión llevan `disable-model-invocation: true`:

```yaml title=".claude/commands/approve.md"
---
description: Aprueba GATE#1 de una feature del harness (decisión humana). Uso /approve FEATURE-ID [alternativa o comentario]
argument-hint: "<FEATURE-ID> [alternativa o comentario]"
disable-model-invocation: true
---
```

Las skills `caveman`, `ponytail` y `new-session` usan el mismo campo. Además de reservarlas al humano, tiene un efecto en el contexto: su descripción no se carga para que el modelo decida si activarlas, así que no cuestan tokens hasta que las invocas.

> [!aviso] Campos que dependen de la versión de Claude Code
> `omitClaudeMd`, `effort`, `skills:` en los agentes y la variable de profundidad existen en las versiones actuales, pero son de las piezas que cambian. Tras actualizar Claude Code, comprueba con `/harness-doctor` y una feature de ejemplo que un subagente no recibe `CLAUDE.md` y que no puede lanzar otro subagente.

Un detalle de permisos que conviene tener claro: Claude Code evalúa las reglas en orden deny → ask → allow, y un hook que responde `allow` no salta una regla `deny`. En sentido contrario, un hook puede bloquear o pedir confirmación aunque una regla `allow` preapruebe la herramienta. El harness se apoya en eso: preaprueba `Edit(./**)` y sus propias CLI para no pedir permiso a cada paso (también lleva `Write(./**)`, pero Claude Code solo compara rutas con reglas `Read` y `Edit`, así que esa regla no encaja nunca y la escritura la cubre `Edit`), y deja la decisión fina (`deny` o `ask`) a `guard.py`. La contrapartida está documentada: si alguien desactiva el hook, la escritura queda libre.

## Errores frecuentes

- **Evaluador-optimizador sin tope.** Es el patrón más fácil de convertir en un bucle caro. Fija el número de vueltas en código.
- **Un orquestador que también implementa.** Mezcla el contexto del contrato con el del código y pierde las dos cosas. El harness lo prohíbe en `CLAUDE.md` y en `HARNESS.md` §4.
- **Principios sin mecanismo.** «Mínimo privilegio» escrito en un prompt no es mínimo privilegio. Si no puedes señalar la línea que lo aplica, todavía no lo tienes.

## Ejercicio

> [!ejercicio] Principio, mecanismo y tipo
> Haz una tabla con los nueve principios. Para cada uno, escribe el archivo y la función o clave que lo aplica en el bundle, y clasifícalo como **determinista** (código, configuración o hook) o **instruccional** (texto que el modelo debe seguir). Después elige uno instruccional y propón cómo reforzarlo con código.
> Está bien si: los nueve tienen archivo concreto, al menos siete son deterministas y la propuesta de refuerzo se puede probar con un test o con el validador.

> [!ejercicio]- Pistas
> El quinto principio (instrucciones separadas de datos) es mixto: la cláusula es texto, pero `guard.py` impide que un agente ejecute lo que una inyección le pida en las zonas protegidas. El séptimo depende en parte de lo que el orquestador decide poner en el prompt; la cabecera obligatoria y los informes estructurados lo acotan.

## Resumen

- El harness combina siete patrones; en la parte de arriba es un workflow y dentro de cada fase trabaja un agente.
- El router lo ejecuta el modelo, pero las guards rechazan cualquier salida que no corresponda al veredicto.
- Cada uno de los nueve principios tiene un mecanismo concreto en el bundle.
- Todo se construye con primitivas estándar de Claude Code: `CLAUDE.md`, subagentes, skills, comandos, hooks, permisos y `env`.

## Para seguir

- [[cursos/harness-engineering/05-agentes-y-orquestador]]
- [[patrones/07-evaluador-optimizador]]
- [[blog/2026-10-23-una-sola-puerta-humana]]
