---
titulo: Motivos de parada y rechazos
descripcion: Qué significa cada stop_reason de la API de Claude, qué debe hacer tu bucle con cada uno y cómo tratar un rechazo con su categoría, su coste y un modelo de respaldo.
creado: 2026-10-29
orden: 6
nivel: intermedio
tags: [api, stop-reason, rechazos, fallback, agentes]
aliases: [stop_reason, Refusal, Rechazos]
relacionados: ["[[glosario/stop-reason]]", "[[glosario/rechazo]]", "[[recetas/fallback-ante-rechazos]]", "[[docs/agentes/01-el-bucle-agentico]]"]
---

El **motivo de parada** (`stop_reason`) es el campo de cada respuesta de la API de Mensajes que dice por qué el modelo dejó de generar: terminó, pide una herramienta, se quedó sin tokens, el servidor pausó el turno o **se negó a seguir**. Es la única señal fiable para decidir qué hace tu [[glosario/bucle-agentico|bucle agéntico]] a continuación. Un [[glosario/rechazo|rechazo]] (`refusal`) no es un error HTTP: llega con código 200, así que si tu código solo vigila excepciones, nunca lo verá.

El bucle completo está en [[docs/agentes/01-el-bucle-agentico]]; aquí está la referencia de cada valor y de los rechazos.

## Los valores y qué hacer con cada uno

Valores de `anthropic.types.StopReason` en el SDK 2.3.0, más el de la beta de compactación:

| `stop_reason` | Qué pasó | Qué hace tu bucle |
|---|---|---|
| `end_turn` | El modelo terminó su turno | Devolver el texto y salir |
| `tool_use` | Pide una o más herramientas | Ejecutar cada `tool_use` y devolver todos los `tool_result` en un único mensaje `user` |
| `max_tokens` | Llegó a tu `max_tokens` a mitad de respuesta | La salida está cortada. No ejecutes un `tool_use` incompleto. Sube el límite o pide continuar, con un tope de reintentos |
| `stop_sequence` | Apareció una de tus `stop_sequences` | Fin controlado. `resp.stop_sequence` dice cuál |
| `pause_turn` | El servidor pausó un turno largo de [[docs/herramientas/03-herramientas-del-servidor\|herramientas del servidor]] | Reenviar la conversación con la respuesta como `assistant` y **las mismas `tools`**, sin mensaje `user` nuevo |
| `refusal` | El modelo se niega a continuar | No reintentar igual. Leer `stop_details`, decidir respaldo o mensaje al usuario, registrar |
| `model_context_window_exceeded` | `entrada + max_tokens` superaba la [[glosario/ventana-de-contexto\|ventana de contexto]] y la generación se cortó al llenarla | Igual que `max_tokens`, pero el remedio es **reducir el contexto**: compactar, limpiar o resumir |
| `compaction` (beta) | Con `pause_after_compaction`, el servidor compactó y se detuvo | Reenviar con el bloque `compaction` y, si quieres, añadir estado antes de seguir ([[docs/contexto/05-compactacion-y-limpieza-en-el-servidor]]) |

Sobre `model_context_window_exceeded`: desde Claude 4.5, si `input_tokens + max_tokens` supera la ventana, la API **acepta** la petición y corta cuando se llena, en vez de devolver un 400 de entrada. Con 1M de contexto en los modelos actuales es raro, pero en un agente que acumula resultados de herramientas durante horas llega.

> [!aviso] Un valor nuevo no debe colgar tu agente
> La [política de versiones](https://platform.claude.com/docs/en/api/versioning) permite añadir valores a campos tipo enumeración sin versión nueva. Trata cada valor conocido de forma explícita y lanza un error visible ante uno desconocido.

## Rechazos

Los modelos con clasificadores de seguridad (Fable 5.1, Fable 5, Opus 5.5, Opus 5, Sonnet 5.5 y Haiku 5.5) pueden devolver `stop_reason: "refusal"`. La respuesta trae `stop_details`:

| Campo | Valores |
|---|---|
| `stop_details.type` | `"refusal"` |
| `stop_details.category` | `cyber`, `bio`, `frontier_llm`, `reasoning_extraction`, `general_harms` o `null` |
| `stop_details.explanation` | Texto legible u `null`. No es estable: muéstralo o regístralo, no lo analices |

**Un rechazo también puede costar.** Desde el 24 sep. 2026, un rechazo sin salida se factura si la categoría es `bio`, `frontier_llm` o `reasoning_extraction` (según la [documentación de rechazos](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback), consultada el 29 oct. 2026). Reintentar la misma petición en bucle multiplica ese coste sin cambiar el resultado.

Qué hacer según el caso:

| Situación | Respuesta razonable |
|---|---|
| Petición legítima en un dominio sensible (seguridad informática, biología docente) | Respaldo a otro modelo (abajo) y mensaje claro si también rechaza |
| `reasoning_extraction` | Deja de pedir «explica tu razonamiento paso a paso» en la salida. Pide una explicación breve o lee el razonamiento con `thinking={"type": "adaptive", "display": "summarized"}` ([[docs/prompting/04-razonamiento]]) |
| Contenido que tu producto no debe atender | Mensaje al usuario y fin. Registra la categoría para tus métricas |
| Rechazo dentro de un agente con herramientas | Salir del bucle sin añadir el turno; si la tarea era larga, guarda el progreso para retomarla |

## Respaldo ante rechazos

Hay dos formas de que otro modelo responda cuando el principal rechaza. Las dos son **beta**.

**En el servidor** (cabecera `server-side-fallback-2026-07-01`): pasas `fallbacks="default"` o una lista de hasta 3 entradas `[{"model": …}]`. Si el principal rechaza, la API reintenta dentro de la misma petición. La respuesta empieza con un bloque `{"type": "fallback", "from": …, "to": …, "trigger": {"type": "refusal", "category": …}}` y el uso de cada modelo se desglosa en `usage.iterations`. Si el modelo de respaldo está limitado o saturado, vuelve el rechazo con `stop_details.recommended_model` como pista. Cada modelo principal solo admite como respaldo los de su `allowed_fallback_models` (Models API con la cabecera beta); con `"default"`, Sonnet 5.5 reintenta `cyber` y `frontier_llm` en Sonnet 5 y deja en pie el resto. Haiku 5.5 no tiene respaldo en servidor y Batch no admite `fallbacks`. En los tipos del SDK, cada entrada admite además `max_tokens`, `output_config`, `speed` y `thinking` propios.

**En el cliente**: `BetaRefusalFallbackMiddleware` (de `anthropic.lib.middleware`) reproduce la misma cadena desde tu proceso. Solo actúa sobre `client.beta.messages`. Con un `BetaFallbackState` compartido, las peticiones siguientes de la conversación empiezan directamente en el modelo que aceptó.

```python title="fallback.py"
import anthropic
from anthropic.lib.middleware import BetaFallbackState, BetaRefusalFallbackMiddleware

MODEL = "claude-sonnet-5-5"
MODELO_RESPALDO = "claude-sonnet-5"
BETA_FALLBACK = "server-side-fallback-2026-07-01"

# 1) En el servidor: la API reintenta con otro modelo dentro de la misma petición
client = anthropic.Anthropic()
resp = client.beta.messages.create(
    model=MODEL, max_tokens=1024, betas=[BETA_FALLBACK],
    fallbacks=[{"model": MODELO_RESPALDO}],   # o "default"
    messages=[{"role": "user", "content": "Explica cómo funciona un ataque de inyección SQL y cómo evitarlo."}],
)
for b in resp.content:
    if b.type == "fallback":
        print(f"respaldo: {b.from_.model} → {b.to.model} ({b.trigger.category})")
print(resp.stop_reason, "".join(b.text for b in resp.content if b.type == "text"))

# 2) En el cliente: el middleware reproduce la misma cadena desde tu proceso
cliente_resp = anthropic.Anthropic(middleware=[BetaRefusalFallbackMiddleware([{"model": MODELO_RESPALDO}])])
estado = BetaFallbackState()          # fija el modelo que aceptó para el resto de la conversación
with estado:
    r2 = cliente_resp.beta.messages.create(
        model=MODEL, max_tokens=1024,
        messages=[{"role": "user", "content": "Explica cómo funciona un ataque de inyección SQL y cómo evitarlo."}],
    )
print(r2.stop_reason, [b.type for b in r2.content])
```

En Python el campo `from` del bloque se lee como `from_` (`from` es palabra reservada). Probado con el simulador: en el segundo caso, la primera llamada devuelve `refusal`, el middleware repite la petición con `claude-sonnet-5` y la respuesta servida lleva un bloque `fallback` delante del texto. El paso a paso, con criterios para elegir la cadena, está en [[recetas/fallback-ante-rechazos]] y el concepto en [[glosario/fallback-de-modelo]].

> [!consejo] El respaldo es una decisión de producto
> Un modelo de respaldo cambia coste, latencia y comportamiento. Decide qué categorías merecen respaldo, registra cada salto (`usage.iterations`) y evalúa el modelo de respaldo con tus evals igual que el principal.

## Ejemplo completo: un bucle que trata todos los motivos

```python tab="Python" title="bucle_paradas.py"
import anthropic

MODEL = "claude-sonnet-5-5"
MAX_PASOS = 10
MAX_CONTINUACIONES = 2
client = anthropic.Anthropic()

TOOLS = [{
    "name": "buscar_docs",
    "description": "Busca en la documentación interna. Devuelve hasta 5 fragmentos con su título.",
    "input_schema": {"type": "object", "properties": {"consulta": {"type": "string"}}, "required": ["consulta"]},
}]

def buscar_docs(consulta: str) -> str:
    return f"Sin resultados para «{consulta}»"  # sustituye por tu buscador

class Rechazo(Exception):
    def __init__(self, categoria: str | None, explicacion: str | None):
        super().__init__(f"rechazo ({categoria})")
        self.categoria, self.explicacion = categoria, explicacion

def texto(resp) -> str:
    return "".join(b.text for b in resp.content if b.type == "text")

def agente(pregunta: str) -> str:
    mensajes = [{"role": "user", "content": pregunta}]
    continuaciones = 0
    for _ in range(MAX_PASOS):
        resp = client.messages.create(model=MODEL, max_tokens=2048, tools=TOOLS, messages=mensajes)
        motivo = resp.stop_reason

        if motivo in ("end_turn", "stop_sequence"):
            return texto(resp)

        if motivo == "refusal":
            # No se añade al historial ni se reintenta igual: se sale del bucle
            d = resp.stop_details
            raise Rechazo(d.category if d else None, d.explanation if d else None)

        mensajes.append({"role": "assistant", "content": resp.content})

        if motivo == "tool_use":
            resultados = [
                {"type": "tool_result", "tool_use_id": b.id, "content": buscar_docs(**b.input)}
                for b in resp.content if b.type == "tool_use"
            ]
            mensajes.append({"role": "user", "content": resultados})
        elif motivo == "pause_turn":
            continue  # mismas tools, sin mensaje user nuevo
        elif motivo in ("max_tokens", "model_context_window_exceeded"):
            if any(b.type == "tool_use" for b in resp.content) or continuaciones >= MAX_CONTINUACIONES:
                raise RuntimeError(f"Respuesta cortada ({motivo}): sube max_tokens o reduce el contexto")
            continuaciones += 1
            mensajes.append({"role": "user", "content": "Sigue exactamente donde lo dejaste."})
        else:
            raise RuntimeError(f"stop_reason desconocido: {motivo}")
    raise RuntimeError(f"Sin terminar tras {MAX_PASOS} pasos")
```

Probado con el simulador en cuatro recorridos: herramienta → `pause_turn` → `max_tokens` → `end_turn` (devuelve el texto continuado); herramienta → `refusal` con categoría `cyber` (lanza `Rechazo` con categoría y explicación); `model_context_window_exceeded` repetido (se rinde tras dos continuaciones); y `refusal` sin `stop_details` (categoría `None`, sin romper). Tres decisiones del código:

- **El rechazo sale como excepción propia.** Quien llama decide si hay respaldo, mensaje o alerta; el bucle no improvisa.
- **Las dos formas de corte comparten rama pero no remedio.** Pedir continuar sirve para `max_tokens`; con `model_context_window_exceeded` es mejor activar compactación que seguir llenando la ventana.
- **Nunca se ejecuta un `tool_use` de una respuesta cortada:** sus argumentos pueden estar incompletos.

## Errores frecuentes

- **Tratar `refusal` como texto final.** El usuario recibe una respuesta vacía o a medias sin explicación.
- **Reintentar un rechazo en bucle.** Mismo resultado, más coste (algunas categorías se facturan).
- **Confundir `max_tokens` con `model_context_window_exceeded`.** Subir `max_tokens` empeora el segundo.
- **Añadir un mensaje `user` tras `pause_turn`.** El modelo pierde el hilo del turno pausado.
- **Pedir el razonamiento paso a paso en la respuesta.** Dispara rechazos `reasoning_extraction`.

## Ver también

- [[docs/agentes/01-el-bucle-agentico]]: el bucle completo, con límites.
- [[roadmap/40-primer-agente/03-condiciones-de-parada]]: elegir límites de pasos y presupuesto.
- [[problemas/respuesta-cortada-por-max-tokens]]: cuando la respuesta se corta.
- [[recetas/fallback-ante-rechazos]]: respaldo paso a paso.
- [[glosario/stop-reason]] y [[glosario/rechazo]].
