---
titulo: Qué hacer cuando el modelo rechaza
descripcion: Trata stop_reason refusal y stop_details.category en tu bucle, reintenta con fallbacks en el servidor o con el middleware del SDK, y registra cada rechazo porque llega con HTTP 200.
creado: 2026-10-29
nivel: intermedio
minutos: 20
tema: produccion
stack: ["Python"]
tags: [rechazos, fallback, produccion, observabilidad, api]
relacionados: ["[[docs/fundamentos/06-motivos-de-parada-y-rechazos]]", "[[glosario/rechazo]]", "[[glosario/fallback-de-modelo]]", "[[recetas/reintentos-y-limites-de-tasa]]"]
---

## Problema

Un cliente de tu asistente pregunta cómo auditar los puertos abiertos de su propio servidor. La respuesta llega con HTTP 200, `content` vacío y `stop_reason: "refusal"`. Tu bucle solo distinguía `tool_use` y `end_turn`, así que devuelve una cadena vacía o revienta en un `next(...)` sobre bloques de texto que no existen. Y tu panel de errores no ve nada, porque no hubo ningún error HTTP.

Los modelos con clasificadores de seguridad (Fable 5.1, Fable 5, Opus 5.5, Opus 5, Sonnet 5.5 y Haiku 5.5) pueden declinar una petición. Es un [[glosario/rechazo|rechazo]], y la documentación lo trata como un final más del bucle, con su propia salida: reenviar la misma petición a otro modelo, que normalmente sí la atiende ([Refusals and fallback](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback)).

## Ingredientes

- Python 3.10 o superior y `pip install "anthropic>=2"`.
- La variable de entorno `ANTHROPIC_API_KEY`.
- Para el *fallback* en el servidor, la beta `server-side-fallback-2026-07-01` (API de Claude y Claude Models on Google Cloud gestionado por Anthropic).

## Pasos

1. **Detecta el rechazo por `stop_reason`.** Nunca por `content` ni por los campos internos de `stop_details`, que pueden ser `None`. `stop_details` trae `type: "refusal"`, `category` y `explanation`. Las categorías son `cyber`, `bio`, `frontier_llm`, `reasoning_extraction`, `general_harms` o `None` (un valor normal y permanente). `explanation` es texto para mostrar, no para analizar: cambia.

2. **Descarta la salida parcial.** Un rechazo puede llegar antes de cualquier salida o a mitad del *streaming*. En el segundo caso, lo que ya recibiste está incompleto: no lo enseñes como respuesta.

3. **Separa lo que se arregla reintentando de lo que no.** `reasoning_extraction` aparece cuando el prompt pide reproducir el razonamiento en la salida (una sección `<thinking>` o un campo `razonamiento` en el JSON). No tiene modelo de respaldo recomendado: cambia el prompt. Para el resto, reintenta en otro modelo; repetir en el mismo suele dar otro rechazo.

4. **Elige dónde vive el *fallback*.** La opción más simple es el servidor: `fallbacks="default"` reintenta dentro de la misma llamada con el modelo que Anthropic recomienda para esa categoría. También puedes pasar una lista de hasta tres modelos, que se prueban en orden y deben estar entre los `allowed_fallback_models` del modelo principal (los publica la Models API). Para Sonnet 5.5, la guía de migración de la documentación dice que `"default"` reintenta los rechazos `cyber` y `frontier_llm` en Sonnet 5 y deja en pie `bio`, `reasoning_extraction` y `general_harms`. Por eso el ejemplo usa Sonnet 5 en las listas: antes de poner otro modelo (por ejemplo, Opus 4.8), lee `allowed_fallback_models` del principal en la Models API con la cabecera beta, porque la documentación no publica la lista por modelo. La respuesta dice quién contestó en `model`, marca el relevo con un bloque `fallback` y desglosa cada intento en `usage.iterations` (el que sirvió aparece como `fallback_message`).

5. **Registra y avisa.** Emite un evento por cada rechazo y otro por cada respuesta servida por el respaldo, y alerta por la diferencia entre ambos ([[disciplinas/observabilidad]]). Tu monitor de 5xx no los verá nunca.

6. **Ten en cuenta el coste.** Desde el 24 de septiembre de 2026, un rechazo antes de cualquier salida se factura si su categoría es `bio`, `frontier_llm` o `reasoning_extraction`; en las demás, no. Cuenta siempre para los límites de tasa.

```python title="rechazos.py"
import json
import logging

import anthropic

MODEL = "claude-sonnet-5-5"
BETA_FALLBACK = "server-side-fallback-2026-07-01"
client = anthropic.Anthropic()
log = logging.getLogger("rechazos")

# categorías sin modelo de respaldo recomendado: hay que cambiar el prompt, no reintentar
CAMBIAR_PROMPT = {"reasoning_extraction"}


class Rechazado(Exception):
    def __init__(self, categoria, explicacion):
        super().__init__(f"rechazo ({categoria}): {explicacion}")
        self.categoria = categoria


def registrar(resp, tarea: str) -> None:
    """Un evento por rechazo y otro por respuesta servida por el respaldo: el 200 no lo ve tu monitor de errores."""
    respaldo = any(i.type == "fallback_message" for i in (resp.usage.iterations or []))
    if resp.stop_reason == "refusal":
        d = resp.stop_details
        log.warning(json.dumps({"evento": "rechazo", "tarea": tarea, "modelo": resp.model, "id": resp.id,
                                "categoria": d.category if d else None}))
    elif respaldo:
        de = next((b for b in resp.content if b.type == "fallback"), None)
        log.info(json.dumps({"evento": "servido_por_respaldo", "tarea": tarea, "modelo": resp.model, "id": resp.id,
                             "categoria": de.trigger.category if de else None}))


def llamar(messages: list, tarea: str, **kw):
    resp = client.beta.messages.create(
        betas=[BETA_FALLBACK], model=MODEL, max_tokens=4096, messages=messages,
        fallbacks="default",  # el servidor reintenta con el modelo que recomienda para esa categoría
        **kw,
    )
    registrar(resp, tarea)
    if resp.stop_reason == "refusal":  # decide por stop_reason, nunca por content
        d = resp.stop_details
        raise Rechazado(d.category if d else None, d.explanation if d else None)
    return resp


def responder(pregunta: str, tarea: str = "soporte") -> str:
    messages = [{"role": "user", "content": pregunta}]
    try:
        resp = llamar(messages, tarea)
    except Rechazado as r:
        if r.categoria in CAMBIAR_PROMPT:
            return "[error de diseño: el prompt pide el razonamiento en la salida]"
        return "No puedo ayudarte con esta petición. Si crees que es un error, escríbenos a soporte."
    # guarda resp.content tal cual (con el bloque fallback en su sitio) si la conversación sigue
    messages.append({"role": "assistant", "content": resp.content})
    return "".join(b.text for b in resp.content if b.type == "text")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    print(responder("¿Cómo audito los puertos abiertos de mi propio servidor?"))
```

En un [[glosario/bucle-agentico|bucle agéntico]], `Rechazado` es una parada más junto a `max_tokens` o `pause_turn`: el bucle la captura, guarda la traza y decide si sigue con otro plan o se detiene ([[docs/agentes/01-el-bucle-agentico]]).

## Cómo comprobar que funciona

Probado con el simulador de la API del proyecto, que devuelve las formas de respuesta de la documentación (un rechazo `cyber` con `content` vacío, una respuesta servida por el respaldo con su bloque `fallback` y su `usage.iterations`, y un rechazo `reasoning_extraction`). El caso 4 es la variante con *middleware* de más abajo, ejecutada de verdad: el SDK reintenta solo. Salida real (sin las líneas de log HTTP):

```text
1) servidor: respaldo servido
INFO {"evento": "servido_por_respaldo", "tarea": "soporte", "modelo": "claude-sonnet-5", "id": "msg_0000", "categoria": "cyber"}
   Usa nmap contra tu propia IP con permiso del propietario...
   petición con fallbacks: default
2) servidor: rechazo que se mantiene
WARNING {"evento": "rechazo", "tarea": "soporte", "modelo": "claude-sonnet-5-5", "id": "msg_0000", "categoria": "cyber"}
   No puedo ayudarte con esta petición. Si crees que es un error, escríbenos a soporte.
3) servidor: reasoning_extraction
WARNING {"evento": "rechazo", "tarea": "soporte", "modelo": "claude-sonnet-5-5", "id": "msg_0000", "categoria": "reasoning_extraction"}
   [error de diseño: el prompt pide el razonamiento en la salida]
4) cliente: middleware
   [claude-sonnet-5] Usa nmap contra tu propia IP...
   modelos pedidos: ['claude-sonnet-5-5', 'claude-sonnet-5']
   [claude-sonnet-5] Usa nmap contra tu propia IP...
   modelos pedidos: ['claude-sonnet-5-5', 'claude-sonnet-5', 'claude-sonnet-5']
   bloques reenviados en el turno 2: ['text']
```

- En el caso 4, el segundo turno va directo al modelo de respaldo: `BetaFallbackState` recuerda qué modelo aceptó. Y el *middleware* quita del historial el bloque `fallback` que añadió él.
- Con la API real, provoca un rechazo de `reasoning_extraction` pidiendo en el prompt «escribe tu razonamiento completo antes de responder» y comprueba que tu código lo trata como fallo de diseño.

## Variaciones

- ***Middleware* en el cliente.** Funciona en cualquier plataforma con un SDK de Anthropic y es la única vía automática para Haiku 5.5, que no tiene *fallback* en el servidor (con una lista, 400). Se configura una vez en el cliente y solo actúa sobre `client.beta.messages`. Nunca lo combines con `fallbacks=` en la misma petición.

```python title="respaldo_cliente.py"
import anthropic

MODEL = "claude-sonnet-5-5"
MODELO_RESPALDO = "claude-sonnet-5"

# solo actúa sobre client.beta.messages; no lo combines con fallbacks= en la misma petición
client = anthropic.Anthropic(
    middleware=[anthropic.BetaRefusalFallbackMiddleware([{"model": MODELO_RESPALDO}])],
)
estado = anthropic.BetaFallbackState()  # uno por conversación: fija el modelo que aceptó


def turno(messages: list) -> str:
    with estado:
        resp = client.beta.messages.create(model=MODEL, max_tokens=4096, messages=messages)
    messages.append({"role": "assistant", "content": resp.content})
    if resp.stop_reason == "refusal":  # todos los modelos de la lista rechazaron
        return "[rechazado]"
    return f"[{resp.model}] " + "".join(b.text for b in resp.content if b.type == "text")
```

- **Reintento manual.** Con HTTP en bruto o lógica propia: detecta el rechazo, reenvía al modelo de respaldo y quédate en él el resto de la conversación. Si la petición usaba `thinking: {"type": "between_tools"}`, cámbialo antes (solo lo acepta Sonnet 5.5). Para no pagar dos veces la escritura de la caché existe el *fallback credit*; está en la documentación oficial.
- **Lotes.** En Message Batches un rechazo llega como `succeeded` con `stop_reason: "refusal"`, y `fallbacks` no está admitido: recoge los rechazados y reenvíalos a otro modelo en un lote nuevo.
- **Multiagente.** `fallbacks` no se hereda en las llamadas que hacen tus herramientas o tus subagentes. Configúralo en cada ruta que llame al modelo, incluidos reintentos y trabajos en segundo plano ([[docs/agentes/02-subagentes]]).

## Errores típicos

- **Ramificar por `content` vacío.** Un rechazo a mitad de *streaming* trae contenido parcial. Mira `stop_reason`.
- **Reintentar en el mismo modelo.** Suele volver a rechazar y pagas otra vez. El reintento va a otro modelo; los 429 y 5xx son otra historia ([[recetas/reintentos-y-limites-de-tasa]]).
- **Mover o quitar el bloque `fallback` al reenviar el turno.** La API usa su posición para validar los bloques de razonamiento a su alrededor. Reenvía el `content` tal cual.
- **Pedir el razonamiento en la salida.** Campos `razonamiento`, `traza` o secciones `<thinking>` disparan `reasoning_extraction` (y se facturan). Pide una explicación breve o lee el razonamiento resumido con `thinking={"type": "adaptive", "display": "summarized"}` ([[docs/prompting/04-razonamiento]]).
- **Volver al modelo principal en el turno siguiente.** Sin estado compartido, cada turno vuelve a probar el modelo que rechazó. Usa un `BetaFallbackState` por conversación o fija el modelo en tu código.
- **Dimensionar mal el respaldo.** Si el modelo de respaldo está limitado por tasa, el servidor no lo intenta y te devuelve el rechazo, con `stop_details.recommended_model` como pista. Sus límites tienen que cubrir el volumen de rechazos que esperas.
