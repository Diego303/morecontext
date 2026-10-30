---
titulo: Compactación y limpieza de contexto en el servidor
descripcion: Referencia de compact_20260112, clear_tool_uses_20250919, clear_thinking_20251015 y task_budget, cuándo compactar y cuándo limpiar, y cuándo hacerlo en tu cliente.
creado: 2026-10-29
orden: 5
nivel: avanzado
tags: [contexto, compactacion, agentes-largos, beta]
aliases: [Server-side compaction, Context editing, Compactación en el servidor]
relacionados: ["[[glosario/compactacion]]", "[[recetas/compactacion-en-el-servidor]]", "[[cursos/context-engineering/03-compactacion-y-memoria]]", "[[glosario/presupuesto-de-tarea]]"]
---

La **gestión de contexto en el servidor** son las ediciones que la API de Claude aplica a la conversación antes de pasársela al modelo, configuradas con `context_management.edits`. Hay dos familias: la **[[glosario/compactacion|compactación]]**, que resume todo lo anterior en un bloque `compaction` cuando la entrada supera un umbral, y la **limpieza**, que borra resultados de herramientas o bloques de razonamiento antiguos y deja el resto intacto. Las dos son **beta** y sirven para lo mismo: que un agente de larga duración no llene la [[glosario/ventana-de-contexto|ventana de contexto]] ni pague tokens que ya no aportan.

Los conceptos (por qué compactar, qué perder y qué no) están en [[cursos/context-engineering/03-compactacion-y-memoria]]. Aquí está la referencia de la API. La receta para un bucle largo es [[recetas/compactacion-en-el-servidor]].

## Compactación: `compact_20260112`

Cabecera beta `compact-2026-01-12`.

| Parámetro | Por defecto | Qué hace |
|---|---|---|
| `type` | | `"compact_20260112"` |
| `trigger` | `{"type": "input_tokens", "value": 150000}` | Umbral de entrada que dispara la compactación. Único tipo: `input_tokens`. **Mínimo 50.000** |
| `pause_after_compaction` | `false` | Si es `true`, la API se detiene tras resumir con `stop_reason: "compaction"` |
| `instructions` | `null` | Prompt de resumen propio. **Sustituye entero** al de por defecto, no lo complementa |

Cuando salta, la respuesta **empieza** con un bloque:

```json
{"type": "compaction", "content": "Resumen: el usuario pidió revisar el módulo de pagos; ya se leyeron..."}
```

Y aquí está la regla que importa: **debes reenviar ese bloque** en las peticiones siguientes. Al recibir un bloque `compaction`, la API **ignora todo lo anterior a él**. Lo más sencillo es añadir `resp.content` entero al historial, como siempre. Puedes conservar los mensajes antiguos (la API los descarta) o quitarlos tú; el último bloque `compaction` del historial es el que manda.

Más detalles de la documentación de [compactación](https://platform.claude.com/docs/en/build-with-claude/compaction-threshold):

- **Coste.** Resumir es una pasada extra del modelo que cuenta para límites y factura. Con la beta activa, `usage.iterations` desglosa cada pasada (`compaction` y `message`) y `usage.input_tokens` de nivel superior **no** incluye la de compactación: suma `iterations` para saber lo facturado. Reenviar un bloque ya generado no cuesta otra compactación.
- **Caché.** Puedes poner `cache_control` en el bloque `compaction`. Pon también un punto de corte al final del `system`: así esa parte sigue leyéndose de caché tras compactar.
- **Streaming.** El resumen llega en un único `content_block_delta` de tipo `compaction_delta`, sin trozos intermedios.
- **Modelos.** Todos los actuales; no Haiku 4.5, Opus 4.5 ni Sonnet 4.5.
- **Herramientas durante el resumen.** Si usas `instructions` propias en un agente con herramientas, pide expresamente que no llame a ninguna mientras resume.

### Compactación bajo demanda

Con la cabecera beta `compact-2026-09-04` decides tú el momento. No va en `edits`: es el parámetro de nivel superior `compaction={"type": "summarize"}` (con `instructions` opcional, que también sustituye al prompt por defecto). Esa petición no genera respuesta: devuelve **solo** el bloque `compaction`, firmado (`signature`), con `stop_reason: "compaction"` y el gasto en `usage.iterations` (los `input_tokens` y `output_tokens` de nivel superior valen 0). En las peticiones siguientes, con la misma cabecera, ese bloque va **el primero** en `messages`, en lugar de los mensajes que resume, y tal cual llegó. Reglas de la [documentación](https://platform.claude.com/docs/en/build-with-claude/compaction-on-demand):

- No se combina con `context_management` en la misma petición, ni con `stop_sequences`, `output_config.format` o un `tool_choice` forzado.
- El último turno del asistente no puede quedar con un `tool_use` sin su `tool_result`.
- Si no llega resumen, la respuesta es un 200 con `content` vacío: mira `stop_reason` (`max_tokens`, `tool_use`, `refusal`…) antes de buscar el bloque.
- Dejar mensajes ya resumidos **delante** del bloque da 400 (`compaction_block_misplaced`).

La documentación recomienda la compactación bajo demanda allí donde esté disponible; la de umbral sigue siendo la que menos código pide.

### Ejemplo: bucle largo con pausa tras compactar

`pause_after_compaction` es lo que permite **reinyectar estado** que no puede depender de la calidad del resumen: el plan, la spec, los criterios de aceptación.

```python title="compactacion.py"
import anthropic

MODEL = "claude-sonnet-5-5"
BETA_COMPACTACION = "compact-2026-01-12"
MAX_PASOS = 200
client = anthropic.Anthropic()

CONTEXTO = {"edits": [{
    "type": "compact_20260112",
    "trigger": {"type": "input_tokens", "value": 150_000},   # mínimo 50.000
    "pause_after_compaction": True,
    "instructions": None,                                     # None = el resumen por defecto
}]}

def leer_archivo(ruta: str) -> str:
    with open(ruta, encoding="utf-8") as f:
        return f.read()

TOOLS = [{
    "name": "leer_archivo",
    "description": "Devuelve el contenido de un archivo de texto del repositorio.",
    "input_schema": {"type": "object", "properties": {"ruta": {"type": "string"}}, "required": ["ruta"]},
}]

def tokens_facturados(resp) -> int:
    # con la beta, usage.iterations desglosa la pasada de compactación y la del mensaje
    its = getattr(resp.usage, "iterations", None) or []
    return sum(i.input_tokens + i.output_tokens for i in its) or resp.usage.input_tokens + resp.usage.output_tokens

def agente(tarea: str, plan: str) -> str:
    mensajes = [{"role": "user", "content": f"{tarea}\n\nPlan:\n{plan}"}]
    gastado = 0
    for _ in range(MAX_PASOS):
        resp = client.beta.messages.create(
            model=MODEL, max_tokens=8192, betas=[BETA_COMPACTACION],
            context_management=CONTEXTO, tools=TOOLS, messages=mensajes,
        )
        gastado += tokens_facturados(resp)
        mensajes.append({"role": "assistant", "content": resp.content})   # incluye el bloque compaction

        if resp.stop_reason == "compaction":
            # El resumen ya está en el historial; antes de seguir, vuelve a poner lo que no debe perderse
            mensajes.append({"role": "user", "content": f"Contexto compactado. Plan vigente:\n{plan}\nContinúa."})
            continue
        if resp.stop_reason == "tool_use":
            mensajes.append({"role": "user", "content": [
                {"type": "tool_result", "tool_use_id": b.id, "content": leer_archivo(**b.input)}
                for b in resp.content if b.type == "tool_use"
            ]})
            continue
        if resp.stop_reason in ("end_turn", "stop_sequence"):
            print(f"tokens facturados: {gastado}")
            return "".join(b.text for b in resp.content if b.type == "text")
        raise RuntimeError(f"stop_reason no tratado: {resp.stop_reason}")
    raise RuntimeError("Sin terminar")
```

Con el simulador (herramienta → compactación con `usage.iterations` → final), el historial queda `user, assistant, user, assistant(compaction), user` y la cuenta de tokens suma la pasada de compactación, que `usage.input_tokens` no incluye. Si no necesitas reinyectar nada, deja `pause_after_compaction` en `false`: el resumen llega al principio de una respuesta normal y el bucle sigue sin rama especial. Un bucle de producción trata además `pause_turn`, `max_tokens` y `refusal`: ver [[docs/fundamentos/06-motivos-de-parada-y-rechazos]].

## Limpieza: `clear_tool_uses_20250919` y `clear_thinking_20251015`

Cabecera beta `context-management-2025-06-27`. La API aplica la edición en el servidor; tu historial local no cambia.

**`clear_tool_uses_20250919`** borra los resultados de herramientas más antiguos y los sustituye por un texto que avisa al modelo de que se quitaron.

| Parámetro | Por defecto | Qué hace |
|---|---|---|
| `trigger` | 100.000 `input_tokens` | Cuándo empieza a limpiar. También admite `{"type": "tool_uses", "value": N}` |
| `keep` | 3 `tool_uses` | Cuántos pares `tool_use`/`tool_result` recientes se conservan |
| `clear_at_least` | ninguno | Mínimo de tokens que debe liberar; si no llega, no limpia |
| `exclude_tools` | ninguno | Herramientas cuyos resultados nunca se limpian |
| `clear_tool_inputs` | `false` | Borra también los argumentos de las llamadas (`true` o una lista de nombres) |

**`clear_thinking_20251015`** borra bloques de razonamiento de turnos anteriores. `keep` es `{"type": "thinking_turns", "value": N}` (N > 0) o `"all"`. En los modelos actuales, por defecto se conservan todos. Si combinas estrategias, **`clear_thinking_20251015` va la primera** en `edits`.

La respuesta trae `context_management.applied_edits` con lo que hizo cada edición (`cleared_input_tokens` y `cleared_tool_uses` o `cleared_thinking_turns`). Y `client.beta.messages.count_tokens` acepta el mismo `context_management` para **ver cuánto quedaría** antes de llamar.

```python title="limpieza.py"
import anthropic

MODEL = "claude-sonnet-5-5"
BETA_LIMPIEZA = "context-management-2025-06-27"
client = anthropic.Anthropic()

LIMPIEZA = {"edits": [
    {   # va la primera: conserva el razonamiento de los dos últimos turnos
        "type": "clear_thinking_20251015",
        "keep": {"type": "thinking_turns", "value": 2},
    },
    {
        "type": "clear_tool_uses_20250919",
        "trigger": {"type": "input_tokens", "value": 80_000},     # por defecto, 100.000
        "keep": {"type": "tool_uses", "value": 4},                # por defecto, 3
        "clear_at_least": {"type": "input_tokens", "value": 20_000},
        "exclude_tools": ["leer_plan"],                           # nunca se limpian
    },
]}

def llamar(mensajes: list[dict], tools: list[dict]):
    resp = client.beta.messages.create(
        model=MODEL, max_tokens=4096, betas=[BETA_LIMPIEZA],
        context_management=LIMPIEZA, tools=tools, messages=mensajes,
    )
    for e in (resp.context_management.applied_edits if resp.context_management else []):
        print(f"{e.type}: {e.cleared_input_tokens} tokens limpiados")
    return resp

def previsualizar(mensajes: list[dict], tools: list[dict]) -> int:
    """Cuenta los tokens que quedarían tras limpiar, sin generar nada."""
    r = client.beta.messages.count_tokens(model=MODEL, betas=[BETA_LIMPIEZA],
                                          context_management=LIMPIEZA, tools=tools, messages=mensajes)
    return r.input_tokens
```

**La limpieza rompe la caché desde el punto limpiado.** El prefijo cambia y pagas una escritura de caché nueva; las peticiones siguientes reutilizan el prefijo nuevo. Por eso existe `clear_at_least`: limpiar poco y a menudo sale más caro que no limpiar. Conservar el razonamiento (no limpiarlo) mantiene la caché.

Con la [herramienta de memoria](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool) (`memory_20250818`) activa, el modelo recibe un aviso al acercarse al umbral de limpieza y puede guardar lo importante antes de que se borre. Ver [[docs/contexto/04-memoria]].

## Presupuesto de tarea: `task_budget`

Cabecera beta `task-budgets-2026-03-13`. No edita el contexto: le dice al modelo cuánto le queda.

```json
{"output_config": {"task_budget": {"type": "tokens", "total": 64000, "remaining": 41000}}}
```

`total` tiene un mínimo de 20.000. El modelo ve una cuenta atrás y ajusta cuánto explora, pero **es orientativo**: nada lo corta. El tope duro sigue siendo `max_tokens` por petición y tu propio límite acumulado en el bucle ([[roadmap/40-primer-agente/03-condiciones-de-parada]]). Funciona en Fable 5.1, Mythos 5.1, Opus 5.5, Opus 5, Fable 5, Mythos 5, Sonnet 5.5, Haiku 5.5, Opus 4.8 y Opus 4.7; no en Sonnet 5, Opus 4.6, Sonnet 4.6 ni en Claude Code. Concepto en [[glosario/presupuesto-de-tarea]].

## Cuándo compactar y cuándo limpiar

| Situación | Mejor opción |
|---|---|
| Agente que lee muchos archivos o resultados de búsqueda que ya no necesita | **Limpiar** resultados de herramientas: barato y no pierde el hilo |
| Conversación larga donde importa el razonamiento acumulado | **Compactar** |
| Turnos con mucho razonamiento que ya no aporta | `clear_thinking_20251015` con `keep` pequeño |
| Estado que no puede perderse (plan, spec) | Compactar con `pause_after_compaction` y reinyectarlo, o guardarlo fuera (archivo, memoria) |
| Necesitas el mismo comportamiento con otros proveedores o modelos abiertos | Compactación **en el cliente** |

Empieza por limpiar si el contexto lo llenan resultados de herramientas; es lo habitual en agentes de código e investigación. Compacta cuando ni limpiando cabe la tarea. Los tipos del SDK admiten los tres tipos de edición en la misma lista `edits`, pero la documentación no dice cómo se combinan la compactación y la limpieza (solo que `clear_thinking_20251015` va primero entre las de limpieza): si las mezclas, mide con `count_tokens` y con una conversación real.

## Compactación en el cliente

La alternativa es resumir tú: cuando el historial pasa de un umbral, una llamada aparte genera el resumen y sustituyes los mensajes antiguos por él. Tiene sentido si usas otros proveedores o [[glosario/pesos-abiertos|modelos abiertos]], si quieres controlar qué se conserva literal o si el resumen debe pasar por tu validación. El mecanismo está en [[cursos/context-engineering/03-compactacion-y-memoria]] y frameworks como LangChain lo ofrecen como *[[glosario/middleware|middleware]]* ([[cursos/langchain-y-langgraph/04-middleware]]). Los SDK de Anthropic ya no traen compactación en cliente en su *tool runner*: la sustituye la del servidor ([[docs/fundamentos/05-versiones-de-api-y-sdks]]).

## Errores frecuentes

- **No reenviar el bloque `compaction`.** La conversación vuelve a crecer desde cero o pierde el resumen.
- **Umbral por debajo de 50.000.** La petición falla.
- **Contar mal el gasto.** `usage.input_tokens` no incluye la compactación; suma `usage.iterations`.
- **`clear_thinking_20251015` en segunda posición.** Debe ir la primera.
- **Limpiar resultados que el modelo aún necesita.** Usa `exclude_tools` para los que contienen el plan o la spec.
- **Tomar `task_budget` por un límite.** Es una pista; el límite es `max_tokens` y tu contador.

## Ver también

- [[recetas/compactacion-en-el-servidor]]: el bucle completo, paso a paso.
- [[docs/contexto/06-mensajes-de-sistema-a-mitad-de-conversacion]]: cambiar instrucciones sin romper la caché.
- [[docs/contexto/02-prompt-caching]]: cómo afecta cada edición a la caché.
- [[problemas/contexto-saturado-en-sesiones-largas]]: cuando el agente olvida y se contradice.
