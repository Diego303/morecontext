---
titulo: Diagnosticar por qué no se aprovecha la caché
descripcion: Usa diagnostics.previous_message_id para que la API te diga dónde cambió tu prefijo (modelo, system, herramientas o mensajes) y corrige los cinco fallos típicos de prompt caching.
creado: 2026-10-29
nivel: inicial
minutos: 20
tema: produccion
stack: ["Python"]
tags: [prompt-caching, costes, diagnostico, produccion]
relacionados: ["[[problemas/la-cache-no-se-aprovecha]]", "[[recetas/recortar-costes-con-prompt-caching]]", "[[docs/contexto/02-prompt-caching]]", "[[glosario/prompt-caching]]"]
---

## Problema

Activaste [[glosario/prompt-caching|prompt caching]] y la factura no baja. En `usage`, `cache_read_input_tokens` sale a 0 en cada llamada y `cache_creation_input_tokens` vuelve a escribir el prefijo entero: pagas más que sin caché. El síntoma está descrito en [[problemas/la-cache-no-se-aprovecha]]; esta receta es la herramienta para encontrar la causa.

La caché funciona por prefijo exacto en el orden `tools` → `system` → `messages`. Basta un byte distinto para perderla, y hasta hace poco la única pista era ese 0. Desde el 23 de septiembre de 2026 es GA el diagnóstico de caché ([documentación del diagnóstico de caché](https://platform.claude.com/docs/en/build-with-claude/cache-diagnostics)): pasas el `id` de la respuesta anterior y la API compara las dos peticiones y te dice dónde divergieron.

## Ingredientes

- Python 3.10 o superior y `pip install "anthropic>=2"` (en el SDK 2.3.0, `diagnostics` es un parámetro normal de `messages.create`).
- La variable de entorno `ANTHROPIC_API_KEY`.
- La API de Claude directa: el diagnóstico no existe en Amazon Bedrock ni en Claude Models on Google Cloud gestionado por Google.

## Pasos

1. **Activa el diagnóstico en todos los turnos.** El objeto `diagnostics` es la activación: solo se guarda la huella de las peticiones que lo llevan. En el primer turno, `{"previous_message_id": None}`; en los siguientes, el `id` de la respuesta anterior. La huella son hashes y estimaciones de tokens, nunca el texto, y caduca pronto.

2. **Lee `resp.diagnostics`.** Tiene tres formas:
   - `None`: no lo pediste, es el primer turno o no hay divergencia.
   - `cache_miss_reason` a `None`: la comparación no terminó a tiempo. No concluyas nada; mira el siguiente turno.
   - `cache_miss_reason` con `type`: la primera divergencia. Los cuatro `*_changed` traen además `cache_missed_input_tokens`, una estimación de cuánto prefijo se perdió, útil como orden de magnitud y no como cifra de factura.

3. **Corrige la causa que te da, una cada vez.** La API informa solo de la primera divergencia; detrás puede haber otra.

| `type` | Qué cambió | Arreglo |
|---|---|---|
| `model_changed` | El modelo (un router, un A/B, un *fallback*) | La caché es por modelo: no lo cambies dentro de una conversación |
| `system_changed` | El `system` | Constante byte a byte; lo dinámico, al primer mensaje `user` |
| `tools_changed` | Herramientas añadidas, quitadas, reordenadas o serializadas distinto | Misma lista, mismo orden, claves ordenadas |
| `messages_changed` | Un mensaje anterior se editó, reordenó o borró | Historial solo-añadir; reenvía el `content` del asistente tal cual |
| `previous_message_not_found` | No hay huella de ese `id` | Envía `diagnostics` siempre, mismo *workspace*, turnos seguidos |
| `unavailable` | Cambió otro parámetro (`tool_choice`, `thinking`, `context_management`, `output_config`, cabeceras beta) o la diferencia está demasiado atrás | Deja fijos esos parámetros durante la conversación |

4. **Cruza el diagnóstico con `usage`.** El diagnóstico responde «¿cambió mi petición?»; `cache_read_input_tokens`, «¿acertó la caché?». Si el diagnóstico es `None` y aun así lees 0, las peticiones coinciden pero la entrada ya no estaba: o pasaron más de 5 minutos (prueba el TTL de una hora) o el prefijo no llega al mínimo cacheable, que es de 512 tokens en los modelos actuales ([[docs/contexto/02-prompt-caching]]). Compruébalo con `count_tokens`.

```python title="diagnostico_cache.py"
from datetime import datetime

import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

MANUAL = "Manual de soporte de Acme.\n" + "Sección de ejemplo con texto estable. " * 400

ARREGLO = {
    "model_changed": "mantén el mismo modelo en toda la conversación (router, A/B o fallback lo cambian)",
    "system_changed": "deja el system fijo; lo dinámico (fecha, ids) va en el primer mensaje user",
    "tools_changed": "mismas herramientas, mismo orden, esquemas serializados igual",
    "messages_changed": "historial solo-añadir; reenvía el content del asistente tal cual",
    "previous_message_not_found": "envía diagnostics en todos los turnos y no los separes mucho en el tiempo",
    "unavailable": "no cambies tool_choice, thinking, output_config ni las cabeceras beta a mitad",
}


class Conversacion:
    def __init__(self, construir_system):
        self.construir_system, self.messages, self.anterior = construir_system, [], None

    def preguntar(self, texto: str) -> str:
        self.messages.append({"role": "user", "content": texto})
        resp = client.messages.create(
            model=MODEL, max_tokens=1024, system=self.construir_system(), messages=self.messages,
            cache_control={"type": "ephemeral"},                 # caché automática
            diagnostics={"previous_message_id": self.anterior},  # None en el primer turno = activar
        )
        self.messages.append({"role": "assistant", "content": resp.content})
        self.anterior = resp.id
        informar(resp)
        return "".join(b.text for b in resp.content if b.type == "text")


def informar(resp) -> None:
    u = resp.usage
    leidos, escritos = u.cache_read_input_tokens or 0, u.cache_creation_input_tokens or 0
    total = u.input_tokens + leidos + escritos
    linea = f"{resp.id} | leídos {leidos:>5} de {total:>5} ({leidos / total:.0%}) | escritos {escritos:>5}"
    d = resp.diagnostics
    if d is None:
        print(linea, "| sin divergencia")
    elif d.cache_miss_reason is None:
        print(linea, "| comparación pendiente: mira el siguiente turno")
    else:
        r = d.cache_miss_reason
        perdidos = getattr(r, "cache_missed_input_tokens", None)  # solo en los *_changed
        print(linea, f"| {r.type} (~{perdidos} tokens tras la divergencia) → {ARREGLO[r.type]}")


if __name__ == "__main__":
    import time

    print("Con el fallo (hora en el system):")
    mal = Conversacion(lambda: f"Hoy es {datetime.now():%Y-%m-%d %H:%M:%S}.\n{MANUAL}")
    mal.preguntar("¿Cómo reseteo el router?")
    time.sleep(1)
    mal.preguntar("¿Y si la luz sigue roja?")

    print("Arreglado (system fijo, la fecha en el primer mensaje):")
    bien = Conversacion(lambda: MANUAL)
    bien.preguntar(f"Hoy es {datetime.now():%Y-%m-%d}. ¿Cómo reseteo el router?")
    bien.preguntar("¿Y si la luz sigue roja?")
```

## Cómo comprobar que funciona

Ejecutado con el simulador de la API del proyecto, ampliado para que calcule `usage` y `diagnostics` comparando cada petición con la anterior, como describe la documentación. El conteo de tokens del simulador es una estimación burda (4 caracteres por token). Salida real:

```text
Con el fallo (hora en el system):
msg_0001 | leídos     0 de  4329 (0%) | escritos  4314 | sin divergencia
msg_0002 | leídos     0 de  4329 (0%) | escritos  4314 | system_changed (~4314 tokens tras la divergencia) → deja el system fijo; lo dinámico (fecha, ids) va en el primer mensaje user
Arreglado (system fijo, la fecha en el primer mensaje):
msg_0003 | leídos     0 de  4322 (0%) | escritos  4307 | sin divergencia
msg_0004 | leídos  4307 de  4322 (100%) | escritos     0 | sin divergencia
```

- En el primer turno de cada conversación, `diagnostics` es `None` y la lectura es 0: se está escribiendo la caché. Es lo normal.
- Con la API real, cuando todo va bien, a partir del segundo turno el diagnóstico es `None` y la lectura es casi toda la entrada.
- Si ves un `*_changed` con lectura alta, el cambio está al final del prompt y un punto de corte anterior sí acertó: arréglalo, pero el impacto es pequeño.

## Los cinco fallos típicos

1. **La fecha, la hora o un id de petición en el `system`.** Da `system_changed` en cada turno. Muévelo al primer mensaje `user` o quítalo.
2. **Herramientas en orden variable.** Las construyes desde un `dict` o un registro de *plugins* y el orden cambia; o serializas el esquema con claves en orden distinto. Da `tools_changed` e invalida todo el prefijo. Ordénalas por nombre y usa `json.dumps(..., sort_keys=True)` si generas esquemas. Lo mismo vale para las herramientas que vienen de un servidor MCP, por eso la especificación 2026-07-28 recomienda orden determinista ([[docs/estandares/01-mcp-2026-07-28]]).
3. **Prefijo por debajo del mínimo.** No da error ni diagnóstico: simplemente no cachea. Mira `count_tokens`.
4. **Historial que no es solo-añadir.** Recortas mensajes viejos, reescribes un `tool_result` o reconstruyes el turno del asistente desde su texto. Da `messages_changed`. Si necesitas recortar, hazlo en bloque y pocas veces, o usa la compactación del servidor ([[recetas/compactacion-en-el-servidor]]).
5. **Cambiar parámetros a mitad.** Un router que alterna modelos (`model_changed`), un *fallback* tras un rechazo, o subir el `effort`, cambiar `tool_choice` o añadir una cabecera beta en un turno (`unavailable`). Para cambiar instrucciones o esfuerzo sin tocar el prefijo están los mensajes de sistema intermedios ([[docs/contexto/06-mensajes-de-sistema-a-mitad-de-conversacion]]).

## Variaciones

- **Con *streaming*.** `diagnostics` llega en el evento `message_start`; con `client.messages.stream(...)`, léelo del mensaje final.
- **En producción.** No imprimas: registra `cache_miss_reason.type` y la proporción leída como atributos de la traza de cada llamada ([[docs/produccion/01-observabilidad]]) y alerta cuando la proporción media baje.
- **Sin diagnóstico (Bedrock, otros proveedores, vLLM).** Calcula tú un hash de cada parte (`tools`, `system`, cada mensaje) y compáralo con la petición anterior. Es lo mismo que hace la API y sirve con cualquier caché de prefijo.

## Errores típicos

- **Activar el diagnóstico solo cuando algo falla.** Sin huella de la petición anterior obtienes `previous_message_not_found`. Déjalo siempre puesto en desarrollo y en una muestra del tráfico de producción.
- **Leer `cache_miss_reason: None` como «todo bien».** Significa «pendiente». Todo bien es `diagnostics` a `None`.
- **Comparar peticiones de *workspaces* distintos.** La huella está ligada a la organización y al *workspace*; compara la cabecera `anthropic-workspace-id` de las dos respuestas.
- **Tomar `cache_missed_input_tokens` como coste.** Se estima por bytes antes de tokenizar y puede no cuadrar con `usage.input_tokens`.
- **Arreglar varias cosas a la vez.** La API informa de la primera divergencia. Corrige, vuelve a medir y sigue.
