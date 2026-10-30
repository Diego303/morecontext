---
titulo: Probar y evolucionar el harness
descripcion: El validador, la suite de tests y las métricas que permiten cambiar el harness sin romperlo, cómo extenderlo con especialistas y skills, y cómo evolucionó de la versión 0.4 para Codex a la 0.8.
creado: 2026-10-29
orden: 12
minutos: 40
tipo: teoria
objetivos:
  - Distinguir qué comprueba el validador y qué comprueban los tests, y ejecutar ambos tras cualquier cambio
  - Añadir un especialista o una skill al harness sin romper sus invariantes
  - Decidir una evolución del harness a partir de métricas y de una auditoría, no de intuiciones
requiere: ["[[cursos/harness-engineering/09-seguridad-en-profundidad]]", "[[cursos/harness-engineering/10-coste-y-presupuesto]]"]
relacionados: ["[[blog/2026-10-26-auditar-tu-propio-harness]]", "[[blog/2026-10-22-de-codex-a-claude-code]]", "[[plantillas/subagente]]", "[[plantillas/skill]]"]
tags: [harness, claude-code, tests, validacion, evolucion]
---

Al terminar esta lección sabrás cómo se protege el harness de sí mismo: qué detecta su validador, qué fijan sus 95 tests, cómo se añade un agente o una skill sin romper nada y con qué criterio se decide que algo merece entrar. Acabarás con un especialista nuevo registrado y validado en tu copia.

## La idea

Un harness es software, y como cualquier software se rompe cuando lo cambias. Peor: se rompe en silencio. Una guard que el contrato cita y nadie implementa, un agente que de pronto puede lanzar subagentes, un alias de modelo que deja de tener precio. Nada de eso da un error al arrancar Claude Code; lo descubres cuando una feature se queda atascada o, peor, cuando algo que debía bloquearse pasa.

Por eso el bundle trae dos piezas que no hacen nada por tus features y lo hacen todo por el harness (las piezas 14 y 15 de la lección 3):

- **Autoverificación**: `validate_harness.py`, que comprueba estructura y coherencia, y una suite de tests que comprueba comportamiento.
- **Evolución con evidencia**: una tabla de qué cambiar y cuándo, métricas para saber si toca y una auditoría periódica.

La regla de `.claude/README.md` es corta: tras cualquier cambio, validador y tests.

## El validador

```bash title="modos de validate_harness.py"
python3 .claude/tools/validate_harness.py                         # bundle y todas las features
python3 .claude/tools/validate_harness.py --feature DEMO-001      # bundle y una feature
python3 .claude/tools/validate_harness.py --feature DEMO-001 --pre-gate   # lo que usa el designer
python3 .claude/tools/validate_harness.py --json                  # para la skill harness-doctor
```

Sale con 0 si no hay errores; los avisos no bloquean. Comprueba, entre otras cosas:

- **Archivos obligatorios**: 19, del `CLAUDE.md` a `verify.sh`.
- **Configuración**: modo válido, `warn_usd ≤ limit_usd`, tabla de precios con los cinco campos numéricos por modelo, `long_context` bien formado.
- **Contrato**: fases sin duplicados, veredictos exactos, `max_repair_attempts == 1`, transiciones con actor válido, ninguna salida de una fase terminal y **cada guard citada implementada** en el diccionario `GUARDS`.
- **Agentes**: el nombre del archivo, el del frontmatter y el del registro coinciden; los canónicos declaran `model` y `effort`; ninguno tiene `Agent` ni `Task`; aviso si usan `memory` (estado oculto) o un alias de modelo.
- **Skills y comandos**: `name` igual a la carpeta, `description` de 1 a 1.536 caracteres.
- **Hooks**: `guard.py` cubre `Bash|Edit|Write|MultiEdit|NotebookEdit` y `Read|Grep|Glob`, y `ledger.py` está en `SubagentStop`.
- **Versión**: la última entrada de `CHANGELOG.md` coincide con `bundle_version`.
- **Features**: estado coherente con la fase, contadores (`build = 1 + repair + human_retries`), lock liberado en las esperas y los invariantes de cada fase.

Recién instalado da un único aviso. Con tres cambios descuidados en una copia (una guard inventada en el contrato, `Agent` en el explorer y un alias en el reviewer):

```text
$ python3 .claude/tools/validate_harness.py
ERROR transition_guard .claude/contracts/workflow.toml: start_exploration: guard sin implementacion 'tests_verdes'
ERROR agent_depth .claude/agents/explorer.md: los subagentes del harness no lanzan subagentes (max_depth = 1)
WARNING agent_model_alias .claude/agents/reviewer.md: alias de modelo 'sonnet': fija el ID completo (un alias cambia de modelo y de precio sin aviso)
WARNING verify_placeholder .claude/bootstrap/verify.sh: verify.sh sin configurar: añade lint/tests del proyecto (skill project-bootstrap)
Harness validation FAILED (2 errores, 2 avisos)
```

El primero es el más valioso: ata el contrato al código. `workflow.toml` puede decir lo que quiera, pero si cita una guard que no existe, el validador lo rechaza antes de que una transición la necesite.

## Los tests

Solo biblioteca estándar (`unittest`), 95 tests en 11 archivos que se ejecutan sin red y sin Claude Code (el tiempo depende de tu máquina):

```text
$ python3 -m unittest discover -s .claude/tests
...............................................................................................
----------------------------------------------------------------------
Ran 95 tests in 1.332s

OK
```

| Archivo | Tests | Qué fija |
|---|---|---|
| `test_feature_flow.py` | 6 | Camino feliz con un repair, transiciones ilegales, firma de GATE#1, spec congelada, segundo fallo al humano, presupuesto |
| `test_engine_extras.py` | 7 | `MODE: repair`, `retry_exploration` como `replan`, lock por inactividad, especialistas, métricas |
| `test_guard.py`, `test_guard_gate.py`, `test_guard_readonly.py` | 13 + 4 + 14 | Alcances, Bash de solo lectura, léxico, secretos, firma humana y ofuscaciones |
| `test_security_rules.py` | 8 | Aceptación sensible, yolo, spec presentada, runtime falsificado, uso sin precio |
| `test_ledger.py`, `test_bundle_extras.py` | 10 + 13 | Precios por categoría, *streaming*, cabecera, contexto largo, registro, configuración |
| `test_run_acceptance.py` | 4 | Spec no aprobada, estados, parciales, entorno sin secretos y salida redactada |
| `test_validate_harness.py`, `test_harness_lib.py` | 10 + 6 | El bundle actual es válido, esquema de aceptación, trazabilidad, YAML estricto |

La clave está en `support.py`: cada test monta un proyecto temporal copiando el bundle real y simula subagentes escribiendo transcripts con el mismo formato que Claude Code y disparando el hook de verdad.

```python title=".claude/tests/support.py"
def make_project(tmp: Path) -> hl.Paths:
    for name in ("CLAUDE.md", "AGENTS.md", "HARNESS.md"):
        shutil.copy(REAL_ROOT / name, tmp / name)
    shutil.copytree(
        REAL_ROOT / ".claude", tmp / ".claude",
        ignore=shutil.ignore_patterns("state", "__pycache__", "*-workspace"),
    )
    (tmp / ".claude" / "state").mkdir()
    return hl.Paths(tmp)
```

Así los tests prueban **el bundle que tienes**, no una versión de laboratorio: si cambias un agente o el contrato, `test_current_bundle_is_valid` lo nota. Y lo prueban sin red, sin Claude Code y sin gastar un token.

Que todo sea *stdlib* tiene un motivo concreto. El harness lee YAML (estado, aceptación, frontmatter) con un subconjunto estricto propio en `harness_lib.py`: rechaza anclas, etiquetas, tabuladores, claves duplicadas y valores ambiguos, y el volcador comprueba que puede releer lo que escribe. Mismo comportamiento en cualquier máquina; si PyYAML está instalado, un test compara ambos.

## Skills, plantillas y bootstrap

El bundle trae 16 skills: unas las precargan los agentes (`acceptance-criteria` en el designer, `test-driven-development`, `systematic-debugging` y `verification-before-completion` en el builder…), otras son procedimientos del orquestador (`sdd-feature-planning`, `feature-resume`, `feature-cost`) y tres son solo humanas (`caveman`, `ponytail`, `new-session`, con `disable-model-invocation: true`). `.claude/skills/README.md` registra la procedencia y la auditoría de cada una: antes de añadir una de terceros, léela entera y busca instrucciones que intenten cambiar permisos, hooks o el flujo.

Las plantillas de agente y de skill viven en `.claude/templates/`, no en `agents/` ni en `skills/`, para que Claude Code no las descubra como reales. Los detalles de ambas primitivas están en [[docs/claude-code/02-subagentes]] y [[docs/claude-code/03-skills]].

`init.sh` se puede repetir sin riesgo: comprueba Python, inicializa git si falta, valida y pasa los tests. `verify.sh` es la regresión del proyecto, y viene como marcador:

```bash title=".claude/bootstrap/verify.sh"
# HARNESS_VERIFY_PLACEHOLDER
echo "verify.sh sin configurar: añade aquí lint y tests del proyecto (skill project-bootstrap)."
exit 0
```

Mientras la marca exista, el validador avisa y la guard `sdd_valid` **rechaza cualquier aceptación que lo use**: un `exit 0` incondicional es un éxito que no demuestra nada. Cuando lo configures, `[verification].required_regression = "bash .claude/bootstrap/verify.sh"` en `harness.toml` obliga a que toda aceptación lo incluya como check obligatorio ([[recetas/un-verify-para-toda-la-regresion]]).

## Extender sin romper

| Quieres | Pasos |
|---|---|
| Un especialista | Copia `templates/agent.md` a `.claude/agents/<n>.md`, regístralo con `role: specialist` y su punto de inserción, valida |
| Una skill | Copia `templates/skill.md` a `.claude/skills/<n>/SKILL.md`; para precargarla, añádela a `skills:` de un agente |
| Un comando humano | `.claude/commands/<n>.md` con `description` y `disable-model-invocation: true` |
| Un hook propio | En `settings.json`, declarado en `[project].required_hooks`; conserva `guard.py` y `ledger.py` |
| Cambiar el flujo | `workflow.toml` + la guard en `GUARDS` + los efectos en `cmd_transition` + tests + `HARNESS.md` §3–4 |

Un especialista se registra así (de `.claude/docs/extending.md`):

```yaml title=".claude/agents/agent-registry.yaml (entrada de especialista)"
- name: security-auditor
  file: .claude/agents/security-auditor.md
  role: specialist
  insertion: post-implementation
  phase: verification
  triggers_on_tags: [auth]
  triggers_on_paths: ["src/auth/*", "*.sql"]
  product_writes: []
  writes: [security-auditor.md]
```

`insertion` admite `pre-gate1`, `post-implementation` y `post-verification`. `triggers_on_paths` solo se evalúa en `post-implementation`, contra las rutas cambiadas desde `base_commit`. `product_writes` es la excepción explícita para que un especialista escriba código; el validador rechaza rutas protegidas, absolutas, con `..` o que empiecen por comodín. `feature.py specialists <ID> --insertion <punto>` dice cuáles tocan y por qué. Un especialista nunca cambia la spec ni el estado, y por Bash es de solo lectura. La plantilla comentada está en [[plantillas/subagente]].

## Evolucionar con evidencia

`HARNESS.md` §14 es explícito: añade complejidad solo ante una necesidad observada.

| Necesidad observada | Evolución posible |
|---|---|
| Repairs válidos que necesitan más de una vuelta de forma recurrente | Presupuesto de repair configurable con métricas |
| Especialistas independientes que reducen tiempo de forma medible | Ejecución en paralelo |
| Calidad semántica no medible con tests | [[glosario/evals\|Evals]] con rúbrica (skill `eval-driven-development`) |
| Features que exceden la memoria documental | Índice o memoria externa |
| Varios proyectos con las mismas adaptaciones | Perfiles de dominio versionados |

La tabla viene de la referencia 0.4, que tenía una fila más: «muchas transiciones condicionales difíciles de mantener → motor de grafo». En 0.8 desapareció de la tabla y quedó como límite deliberado en `docs/architecture.md`: quince transiciones en TOML y un motor de 560 líneas cubren el problema con menos coste operativo que un motor de grafos externo. Y «paralelismo» acabó concretándose en otra cosa, las olas de la lección 13.

La evidencia la da `feature.py metrics`, que agrega todas las features de un directorio de estado (también de otro proyecto, en solo lectura). En la copia de las lecciones anteriores (ruta acortada):

```text
$ python3 .claude/tools/feature.py metrics
Metricas de .../demo/.claude/state
  features: 3 | por fase: blocked 2, exploration 1
  verificacion: PASS a la primera 0/0 (-) | con repair 0 | repairs 1
  GATE#1: presentados 1 | aprobados por {'human': 1} | cambios pedidos 0 (0 %)
  intervenciones humanas: bloqueadas alguna vez 2 | escalate 1 | human_required 1 | replan 0 | retry_build 0 | cancel 0
  subagentes: 8 ejecuciones (builder 2, designer 1, explorer 3, reviewer 2)
```

Con features reales salen además coste (media, mediana, percentil 90) y tiempo de ciclo. Qué mirar: una tasa de `PASS` a la primera baja apunta a aceptaciones vagas; muchos cambios pedidos en GATE#1, a un explorer o un `AGENTS.md` pobres; muchos `replan`, a features mal partidas.

## Auditar el propio harness

La guía completa del harness termina con una auditoría de la versión 0.5 hecha sobre la lectura íntegra de sus 84 archivos: cruza documentación y código, pasa validador y tests, y clasifica cada hallazgo por severidad (media, baja, informativa) con su evidencia (`archivo:línea`) y una recomendación. Cuatro ejemplos, todos resueltos en 0.8:

- **H-01 (media)**: el lock se marcaba obsoleto por antigüedad, no por inactividad. Una feature trabajada sin pausa parecía abandonada.
- **H-02 (media)**: `retry_exploration` tras GATE#1 no reiniciaba el gate ni el lock de la spec, a diferencia de `replan`.
- **H-03 (media, preventiva)**: los agentes usaban alias de modelo; si el alias cambiaba a un modelo sin precio, el presupuesto bloquearía todo.
- **H-06 (baja)**: con presupuestos pequeños no había aviso antes del límite.

Las correcciones del motor llegaron con su test (`test_engine_extras.py` tiene uno para H-01, H-02 y H-05). La tabla de la auditoría tiene una columna final, «Estado 0.8.0», que deja trazado qué se resolvió y qué se mantuvo a propósito (el orquestador fuera del presupuesto, por ejemplo). El método completo está en [[blog/2026-10-26-auditar-tu-propio-harness]].

## De Codex a Claude Code: 0.4 → 0.5 → 0.8

| Versión | Qué cambió | Por qué |
|---|---|---|
| 0.4 (Codex) | `.codex/`, agentes en TOML, un *verifier* y un GATE#2, `runtime-agents.yaml` escrito por el orquestador, runner y comprobación de trazabilidad sin implementar, 4 tests | Punto de partida |
| 0.5 (Claude Code) | Primitivas nativas (`CLAUDE.md`, subagentes con frontmatter, hooks); reviewer en un pase sin GATE#2; runtimes desde el hook y verificados contra el transcript; `blocked` con salidas humanas; runner real; `ledger.py` y `guard.py` nuevos; 58 tests | GATE#2 aprobaba código antes de saber si pasaba la aceptación; el orquestador podía declarar ejecuciones que no ocurrieron |
| 0.8 | Correcciones de la auditoría; léxico de shell y Bash de solo lectura; hook de secretos en `Read\|Grep\|Glob`; especialistas con `product_writes` y `triggers_on_paths`; `metrics`; precios al día; canario y `/new-session`; manuales fuera del bundle; 95 tests | Mejoras llevadas a la base desde dos harnesses derivados en uso real |

La versión 0.8 también sacó los manuales humanos a `INSTRUCCIONES/`, fuera de lo que se copia al proyecto: el explorer ya no gasta tokens leyendo la documentación del harness como si fuera la del producto. La historia completa, contada por el autor, está en [[blog/2026-10-22-de-codex-a-claude-code]].

## Errores frecuentes

- **Cambiar el contrato sin pasar el validador.** La guard que falta aparece en producción, no en el editor.
- **Debilitar un test para que pase un cambio.** Si un test de seguridad falla, el cambio probablemente abre un hueco.
- **Añadir un especialista «por si acaso».** Cada uno cuesta un subagente más por feature; añádelo cuando las métricas o los hallazgos lo pidan.
- **No registrar la procedencia de una skill de terceros.** Es parte de la superficie de ataque.

## Ejercicio

> [!ejercicio] Un especialista nuevo, validado
> En una copia del harness, crea el especialista `notas-de-version` (post-verification, `PHASE: verification`, `triggers_on_tags: ["*"]`, escribe solo `notas-de-version.md`) a partir de `.claude/templates/agent.md`, con su `name`, su `description` y su entrada en `agent-registry.yaml`.
> Está bien si: `validate_harness.py` termina con 0 errores, `python3 -m unittest discover -s .claude/tests` sigue en 95 tests en verde y `python3 .claude/tools/feature.py specialists SAMPLE-001 --insertion post-verification` lista `notas-de-version` con el motivo «siempre».

> [!ejercicio]- Pistas
> No lo llames `docs-keeper`: un test del bundle crea un especialista temporal con ese nombre y daría un nombre duplicado. Sin `--insertion`, `specialists` evalúa también `post-implementation`, que necesita git para calcular las rutas cambiadas; en una copia sin repositorio, limítalo a `post-verification`.

## Resumen

- El validador comprueba estructura y coherencia (contrato atado al código, agentes, hooks, versión, features); los tests, comportamiento.
- Los tests copian el bundle real y simulan subagentes con transcripts como los de Claude Code: prueban lo que tienes, sin red ni tokens.
- Extender es copiar una plantilla, registrar y validar; cambiar el flujo exige contrato, guard, efectos y tests.
- Las evoluciones se deciden con `feature.py metrics` y con auditorías que dejan rastro de cada hallazgo.
- De 0.4 a 0.8, cada cambio respondió a un fallo observado: GATE#2, runtimes declarados, locks, alias de modelos.

## Para seguir

- [[cursos/harness-engineering/13-features-en-paralelo-con-olas]]
- [[roadmap/80-evals/05-regresiones-en-ci]]
- [[disciplinas/harness-engineering]]
