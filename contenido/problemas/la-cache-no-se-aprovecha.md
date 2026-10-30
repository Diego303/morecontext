---
titulo: El prompt caching no ahorra nada
descripcion: Por qué cache_read_input_tokens sale a 0 aunque actives la caché, cómo leer usage y diagnostics para encontrar el cambio de prefijo y qué corregir.
creado: 2026-10-29
sintoma: El prompt caching no ahorra nada
tema: produccion
nivel: intermedio
tags: [prompt-caching, costes, diagnostico, produccion]
relacionados: ["[[recetas/diagnosticar-fallos-de-cache]]", "[[docs/contexto/02-prompt-caching]]", "[[glosario/prompt-caching]]", "[[roadmap/100-produccion/02-costes-y-prompt-caching]]"]
---

Añadiste `cache_control` y la factura sigue igual, o sube. En cada respuesta, `usage.cache_read_input_tokens` vale 0 y `cache_creation_input_tokens` vuelve a ser casi toda la entrada: escribes la caché en cada llamada (algo más cara que la entrada normal) y no la lees nunca. No hay error ni aviso; solo esos números.

## Causas

La caché funciona por **prefijo exacto**, en el orden `tools` → `system` → `messages`. Cualquier byte distinto invalida ese punto y todo lo que va detrás ([[glosario/prompt-caching]]).

- **Algo dinámico al principio.** La fecha, la hora, un id de petición o el nombre del usuario en el `system`.
- **Herramientas que cambian de orden** o se serializan distinto en cada llamada (un `dict` de *plugins*, un servidor MCP sin orden determinista). Cambiar las herramientas invalida toda la caché.
- **Historial que no es solo-añadir.** Recortas mensajes antiguos, reescribes un `tool_result` o reconstruyes el turno del asistente desde su texto.
- **Parámetros que cambian a mitad:** otro modelo o `speed` (un *router*, un *fallback*), o un cambio en `tool_choice` o `thinking`.
- **Prefijo por debajo del mínimo.** En los modelos actuales, 512 tokens; por debajo no se cachea y no da error.
- **Ha pasado el TTL.** La caché por defecto dura 5 minutos; entre llamadas más espaciadas la entrada ya no está (hay TTL de una hora con `"ttl": "1h"`).

## Cómo confirmarlo

Lee `usage` en cada llamada y pide a la API que te diga dónde divergió tu petición respecto a la anterior con `diagnostics` (GA desde el 23 de septiembre de 2026):

```python title="cache_informe.py"
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()


def informar(resp) -> str:
    u = resp.usage
    leidos, escritos = u.cache_read_input_tokens or 0, u.cache_creation_input_tokens or 0
    total = u.input_tokens + leidos + escritos
    motivo = "sin divergencia"
    if resp.diagnostics and resp.diagnostics.cache_miss_reason:
        motivo = resp.diagnostics.cache_miss_reason.type     # system_changed, tools_changed…
    return f"leídos {leidos}/{total} · escritos {escritos} · {motivo}"


def preguntar(system: str, messages: list[dict], anterior: str | None):
    resp = client.messages.create(
        model=MODEL, max_tokens=1024, system=system, messages=messages,
        cache_control={"type": "ephemeral"},                   # caché automática
        diagnostics={"previous_message_id": anterior},         # None en el primer turno
    )
    print(informar(resp))
    return resp


def prefijo_cacheable(system: str, tools: list[dict]) -> int:
    """Si sale por debajo del mínimo del modelo (512 en los actuales), no se cachea nada."""
    return client.messages.count_tokens(model=MODEL, system=system, tools=tools,
                                        messages=[{"role": "user", "content": "x"}]).input_tokens
```

`cache_miss_reason.type` vale `model_changed`, `system_changed`, `tools_changed`, `messages_changed`, `previous_message_not_found` o `unavailable` (otro parámetro cambió). Este código lo comprobé con el SDK 2.3.0 y el simulador del proyecto, que no calcula la caché: no he podido reproducir un fallo de caché real aquí, así que los motivos y el mínimo vienen de la documentación oficial ([diagnóstico de caché](https://platform.claude.com/docs/en/build-with-claude/cache-diagnostics)). Si `diagnostics` es `None` y aun así lees 0, las peticiones coinciden: mira el TTL y el tamaño del prefijo.

## Arreglo

| Motivo | Qué cambiar |
|---|---|
| `system_changed` | `system` constante byte a byte; lo dinámico, al primer mensaje `user` |
| `tools_changed` | Misma lista, mismo orden (ordénalas por nombre), `json.dumps(..., sort_keys=True)` si generas esquemas |
| `messages_changed` | Historial solo-añadir; reenvía `resp.content` tal cual |
| `model_changed` / `unavailable` | No cambies modelo ni parámetros dentro de una conversación; para cambiar instrucciones usa un mensaje de sistema intermedio ([[docs/contexto/06-mensajes-de-sistema-a-mitad-de-conversacion]]) |
| Sin motivo y 0 leídos | Prefijo mayor que el mínimo, o `"ttl": "1h"` si las llamadas están espaciadas |

Corrige un motivo cada vez: la API solo informa de la primera divergencia. El procedimiento completo, con salida de ejemplo, está en [[recetas/diagnosticar-fallos-de-cache]].

## Cómo evitarlo

- Diseña el prompt de fuera adentro: herramientas y `system` estables, documentos estables, y lo variable al final ([[recetas/recortar-costes-con-prompt-caching]]).
- Registra la proporción leída (`cache_read / total`) como atributo de cada traza y alerta si baja ([[docs/produccion/01-observabilidad]]).
- Deja `diagnostics` activado en desarrollo y en una muestra de producción.
- Recuerda que en Ollama la API compatible con Anthropic no tiene *prompt caching*; esos números no significan lo mismo en local ([[docs/modelos-abiertos/01-ollama]]).

## Ver también

- [[docs/contexto/02-prompt-caching]]
- [[roadmap/100-produccion/02-costes-y-prompt-caching]]
- [[docs/produccion/02-costes-y-limites]]
- [[radar/2026-07-21-prompt-caching-palanca-de-coste]]
