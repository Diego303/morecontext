---
titulo: "Sesiones largas: canario, traspaso y recuperación"
descripcion: Tres técnicas del harness para trabajar horas sin perder el hilo, un canario que delata el contexto saturado, un traspaso a una sesión nueva y la reanudación segura con estado en disco y lock.
creado: 2026-10-29
orden: 11
minutos: 30
tipo: practica
objetivos:
  - Instalar un canario de contexto en tu CLAUDE.md y saber qué hacer cuando falla
  - Generar un prompt de traspaso que lleve solo lo que no está en disco
  - Reanudar una feature interrumpida comprobando fase, lock, gate y runtimes antes de lanzar nada
requiere: ["[[cursos/harness-engineering/06-el-flujo-como-maquina-de-estados]]", "[[cursos/context-engineering/04-contexto-para-agentes-largos]]"]
relacionados: ["[[recetas/canario-de-contexto]]", "[[glosario/canario-de-contexto]]", "[[glosario/traspaso-de-sesion]]", "[[problemas/contexto-saturado-en-sesiones-largas]]"]
tags: [harness, claude-code, contexto, sesiones-largas, recuperacion]
---

Al terminar esta lección tendrás una señal visible de que el contexto del orquestador está saturado, un procedimiento para pasar a una sesión limpia sin perder decisiones y otro para retomar una feature cortada a mitad sin duplicar trabajo ni saltarte una aprobación.

## La idea

Una sesión de Claude Code que coordina features durante horas sufre tres problemas distintos, y cada uno tiene su respuesta:

| Problema | Síntoma | Respuesta del harness |
|---|---|---|
| El contexto del orquestador se satura | Olvida reglas, re-explora, se contradice | **Canario** en `CLAUDE.md` y **traspaso** con `/new-session` |
| La sesión se corta | Una feature queda a mitad de fase | Estado en disco + skill **`feature-resume`** |
| Dos sesiones sobre la misma feature | Trabajo duplicado o pisado | **Lock** en `state.yaml`, obsoleto por inactividad |

Lo que los une es un principio que viste en la lección 4 (contexto mínimo: se persiste en disco y se pasa por referencia): **la memoria vive en disco, no en la conversación**. Todo lo que la feature necesita para continuar está en `.claude/state/<ID>/`, y el estado solo cambia con transiciones. Una sesión nueva puede seguir donde lo dejó la anterior porque no depende de recordarla. Es la misma idea que Anthropic describe para agentes de larga duración en [*Effective harnesses for long-running agents*](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (noviembre de 2025): progreso y estado en archivos, y cada sesión arranca leyéndolos.

## El canario de contexto

Con contextos largos, el rendimiento de un modelo baja aunque la información siga ahí; Chroma lo midió en 18 modelos en [*Context Rot*](https://www.trychroma.com/research/context-rot) (julio de 2025). El problema práctico es que no lo ves venir: el orquestador sigue respondiendo con seguridad mientras empieza a saltarse reglas. El [[glosario/canario-de-contexto|canario]] es una regla trivial y visible al principio de `CLAUDE.md`:

```markdown title="CLAUDE.md"
# Claude Code — instrucciones del proyecto

## Canario de contexto

IMPORTANT: empieza SIEMPRE cada respuesta con «<TU NOMBRE> ·», incluidas las
respuestas cortas y las que siguen a una herramienta. Es una señal de control
para el humano, no un saludo: no la expliques ni la omitas.
```

El autor pone su nombre; tú pon el tuyo. Mientras cada respuesta empiece por `<TU NOMBRE> ·`, el modelo sigue atendiendo a sus instrucciones de proyecto. Cuando deja de hacerlo, es razonable sospechar que tampoco está aplicando bien el resto de `CLAUDE.md`, `HARNESS.md` y `AGENTS.md`, y conviene cambiar de sesión. Es una heurística, no una medida: no te dice cuánto se ha degradado, solo que algo que debería ser automático ha dejado de serlo. Su valor está en que cuesta casi nada y lo ves en cada respuesta sin buscarlo. La técnica completa, fuera del harness, está en [[recetas/canario-de-contexto]].

Tres detalles del diseño:

- **Solo lo lleva el orquestador.** Los subagentes tienen `omitClaudeMd: true`: no cargan `CLAUDE.md`, así que sus informes de retorno no cambian de formato.
- **Las skills lo respetan.** `caveman`, que comprime las respuestas, trae una excepción explícita para conservar el prefijo.
- **Es personal.** Si otra persona usa el harness, cambia el nombre en `CLAUDE.md`, en `caveman` y en la plantilla de `new-session`.

## El traspaso: /new-session

Cuando el canario falla, o cuando ves el contexto alto, no compactes a ciegas: haz un **[[glosario/traspaso-de-sesion|traspaso]]**. La skill `new-session` solo la invoca el humano:

```yaml title=".claude/skills/new-session/SKILL.md (frontmatter)"
name: new-session
description: Genera un prompt de traspaso para continuar en una sesión nueva con todo el contexto que no está en disco. Solo la invoca el humano con /new-session, normalmente cuando falla el canario o el contexto está alto.
disable-model-invocation: true
argument-hint: "[foco opcional de la próxima sesión]"
```

`disable-model-invocation: true` tiene dos efectos: el modelo no puede activarla por su cuenta y su descripción no ocupa contexto. El procedimiento:

1. **Recoge el estado real**, sin suponer: `feature.py status` y el `status <ID>` de cada feature activa o bloqueada, `git status --porcelain`, `git log --oneline -5` y la fecha para el nombre del archivo.
2. **Extrae de la conversación solo lo que no está en disco**: decisiones del humano y su motivo, preferencias, trabajo a medias (qué, dónde, en qué punto), hallazgos separados en *verificado* (con su evidencia) y *sin verificar*, y lo descartado con su porqué.
3. **Escribe el prompt** con secciones fijas. Lo que ya está en `.claude/state/<ID>/` va como ruta, no copiado. Máximo unas 80 líneas.
4. **Lo guarda en `.claude/handoff/<AAAAMMDD-HHMM>.md`** y lo muestra entero. Esa carpeta está fuera de git; el guard deja escribir ahí a la sesión principal, nunca a un subagente.
5. Termina pidiendo: abre una sesión nueva (`/clear`) y pega el prompt.

La plantilla empieza por el canario y acaba con una comprobación:

```text title=".claude/skills/new-session/SKILL.md (plantilla, extracto)"
<TU NOMBRE> · Continúo una sesión anterior. Eres el orquestador del harness
(CLAUDE.md y HARNESS.md siguen vigentes).

## Objetivo
## Estado del harness
## Decisiones tomadas (no reabrir)
## Preferencias del humano
## Trabajo a medias
## Hallazgos
## Descartado
## Siguiente paso exacto
## No hacer

Antes de actuar: ejecuta `feature.py status`, confirma que el estado coincide
con este resumen y dime en 3 líneas qué vas a hacer.
```

Separar «verificado» de «sin verificar» evita que una hipótesis de la sesión anterior llegue a la nueva como un hecho. Y la sección «Descartado» ahorra repetir lo que ya se probó. Anthropic describe esta misma alternativa a la [[glosario/compactacion|compactación]], una ventana nueva con un traspaso estructurado, en [*Harness design for long-running application development*](https://www.anthropic.com/engineering/harness-design-long-running-apps) (marzo de 2026). La diferencia con compactar es quién decide qué se conserva: aquí lo decide un procedimiento con secciones fijas que tú revisas antes de pegar.

## Reanudar: feature-resume y el lock

Si la sesión se cortó (cerraste la terminal, se acabó el contexto, se fue la luz), la skill `feature-resume` reconcilia el estado antes de lanzar ningún agente:

1. `feature.py status <ID>` y `validate_harness.py --feature <ID>`. Cualquier error se resuelve antes de avanzar.
2. Últimos eventos de `event.log`: la última transición y el último `subagent_stop` de cada agente.
3. **Lock** activo y reciente: otra sesión puede estar trabajando; pregunta al humano. Obsoleto: pide confirmación.
4. **GATE#1 pendiente**: nunca se infiere una aprobación.
5. **Fase de trabajo interrumpida**: si no hay `subagent_stop` del agente de la fase posterior a `phase_entered_at`, se relanza con la misma cabecera y el mismo `ATTEMPT`. Si lo hay y su artefacto existe, se aplica la transición y deciden las guards.
6. **`blocked`**: se presentan el motivo y las salidas humanas.
7. Nunca un segundo repair automático: eso es `retry_build`, una decisión humana.

El paso 5 es seguro para el motor: la guard de runtime acepta cualquier ejecución real del agente posterior a la entrada en la fase, y las transiciones, que son lo único que cambia el estado, solo ocurren una vez. Lo que un builder interrumpido dejara a medias en el código lo encontrará el siguiente al leer el repositorio, y el reviewer lo verá en el diff.

El **lock** está en `state.yaml`. Se activa al entrar en una fase de trabajo y se libera en las fases de espera humana (`gate1_pending`, `blocked`) y en las terminales. Desde la versión 0.8 se considera obsoleto por **inactividad**, no por antigüedad (hallazgo H-01 de la auditoría): antes, una feature trabajada sin pausa más de dos horas aparecía como posiblemente abandonada.

```python title=".claude/tools/feature.py"
def _last_activity(state: dict, events: list[dict]):
    """Ultima actividad conocida: updated_at del estado o el ultimo evento (transicion o subagent_stop)."""
    stamps = [hl.parse_iso(state.get("updated_at"))]
    stamps += [hl.parse_iso(event.get("ts")) for event in events[-50:]]
    stamps += [hl.parse_iso(event.get("finished_at")) for event in events[-50:] if event.get("event") == "subagent_stop"]
    known = [stamp for stamp in stamps if stamp is not None]
    return max(known) if known else None
```

El umbral es `lock_stale_minutes` en `harness.toml` (120 por defecto). Así se ve en una copia, con una feature a mitad de repair:

```text
$ python3 .claude/tools/feature.py status DEMO-001
DEMO-001 - Saludo en español
  fase: implementation (in_progress) desde 2026-10-29T19:55:17Z
  intentos: build 2 | verificacion 1 | repair 1/1 | reintentos humanos 0
  GATE#1: approved por human
  ultimo veredicto: FAIL_REPAIRABLE
  lock activo desde 2026-10-29T19:55:16Z, sin actividad desde hace 0 min
  eventos validos: build_complete (orchestrator), escalate (orchestrator), cancel (human)
  coste estimado: $0.8500 (BUDGET_OK)
  runtime explorer a-exp fin 2026-10-29T19:55:16Z
  runtime designer a-des fin 2026-10-29T19:55:16Z
  runtime builder a-b1 fin 2026-10-29T19:55:16Z
  runtime reviewer a-r1 fin 2026-10-29T19:55:17Z
  siguiente: Lanza el subagente builder (PHASE: implementation, ATTEMPT: 2, MODE: repair)
```

Todo lo que una sesión nueva necesita está ahí: fase, contadores, gate, lock, eventos válidos, coste y la siguiente acción con la cabecera exacta. El prompt para pedirlo, de `FAST-USAGE.md`:

```text
Reanuda <ID> desde el último estado seguro (feature-resume). Antes de lanzar
nada, dime en qué fase está, qué falta y qué vas a hacer.
```

## Los modos y la duración de las sesiones

El modo de orquestación decide cuánto te espera el orquestador, y con ello cuántos turnos (y cuánto contexto) consume cada feature:

```toml title=".claude/harness.toml"
[orchestration]
mode = "manual"
human_gate_tags = [
  "security-critical", "auth", "crypto", "payments", "pii",
  "compliance", "gdpr", "audit", "data-migration", "destructive",
]
lock_stale_minutes = 120
```

| Modo | Continúa solo | Para siempre en |
|---|---|---|
| `manual` | nada: para tras cada transición | todo |
| `auto` | encadena fases | GATE#1, `blocked`, `BUDGET_EXCEEDED`, fin |
| `yolo` | como `auto` y puede aprobar GATE#1 por delegación | `blocked`, `BUDGET_EXCEEDED`, fin, GATE#1 no delegable |

`manual` es el valor por defecto y el adecuado para las primeras features. `auto` es el modo de trabajo habitual. `yolo` solo delega GATE#1 si se cumple todo: validación pre-gate correcta, ningún tag de `human_gate_tags` (se comparan sin mayúsculas, sin plurales y por subcadena: `Payments` o `auth-v2` cuentan), ningún comando de aceptación sensible, nada que contradiga `AGENTS.md`, ninguna pregunta abierta de alcance o seguridad y presupuesto disponible. El motor comprueba los tags, los comandos, el `--rationale` y el presupuesto; el guard solo deja pasar `--by yolo-mode` si el modo es `yolo`. El resto de decisiones humanas nunca se delega.

> [!aviso] Más autonomía, más contexto por sesión
> En `auto` el orquestador encadena fases sin esperarte, así que una sola sesión puede llevar varias features seguidas. Vigila el canario: es justo el caso en que más se llena el contexto.

## Errores frecuentes

- **Seguir trabajando con el canario caído** «porque ya casi está». Es cuando más cuesta un error.
- **Copiar artefactos en el traspaso.** Infla el prompt y duplica la fuente de verdad: pon la ruta.
- **Reanudar «de memoria».** Ejecuta `feature-resume`; la conversación anterior no es el estado.
- **Querer liberar el lock editando `state.yaml`.** El guard lo deniega: es un archivo gestionado. Confirma con el humano y deja que la transición lo actualice.

## Ejercicio

> [!ejercicio] Canario, traspaso y reanudación
> 1. Añade el canario a la cabecera del `CLAUDE.md` de tu copia, con tu nombre.
> 2. Arranca una feature de prueba en modo `manual` y llévala hasta `implementation`. Cierra la sesión sin lanzar el builder.
> 3. Abre una sesión nueva y pide la reanudación con el prompt de `FAST-USAGE.md`.
> 4. Ejecuta `/new-session` y lee el archivo que deja en `.claude/handoff/`.
> Está bien si: todas las respuestas empiezan por tu prefijo; en el paso 3 el orquestador informa de la fase, el estado del lock y la siguiente acción sin lanzar ningún agente hasta que se lo pidas; y el traspaso tiene menos de 80 líneas, separa hallazgos verificados de no verificados y referencia `.claude/state/<ID>/` en lugar de copiar su contenido.

> [!ejercicio]- Pistas
> Si el orquestador lanza el builder directamente en el paso 3, revisa que la skill `feature-resume` está en `.claude/skills/` y que tu prompt la nombra. Para comprobar la longitud del traspaso: `wc -l .claude/handoff/*.md`.

## Resumen

- La memoria del flujo vive en `.claude/state/<ID>/`; por eso cualquier sesión puede continuar a otra.
- El canario `<TU NOMBRE> ·` es una señal barata y visible de que el orquestador ha dejado de seguir sus instrucciones.
- `/new-session` traspasa solo lo que no está en disco, con secciones fijas y rutas en lugar de copias.
- `feature-resume` reconcilia estado, eventos, lock y gate antes de lanzar nada; el lock caduca por inactividad.
- El modo (`manual`, `auto`, `yolo`) decide cuánto encadena el orquestador sin ti.

## Para seguir

- [[cursos/harness-engineering/12-probar-y-evolucionar-el-harness]]
- [[cursos/context-engineering/03-compactacion-y-memoria]]
- [[problemas/contexto-saturado-en-sesiones-largas]]
- [[blog/2026-08-22-dejar-un-agente-trabajando-horas]]
