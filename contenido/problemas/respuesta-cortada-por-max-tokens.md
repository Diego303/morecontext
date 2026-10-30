---
titulo: La respuesta se corta a medias
descripcion: Qué pasa cuando stop_reason es max_tokens, por qué un tool_use cortado no se puede ejecutar y cómo reintentar con más margen, pedir menos o usar streaming.
creado: 2026-10-29
sintoma: La respuesta se corta a medias
tema: produccion
nivel: intermedio
tags: [max-tokens, stop-reason, streaming, produccion]
relacionados: ["[[docs/fundamentos/06-motivos-de-parada-y-rechazos]]", "[[glosario/max-tokens]]", "[[glosario/stop-reason]]", "[[problemas/json-invalido-del-modelo]]"]
---

El texto acaba a mitad de frase («…y el tercer paso consiste en conf»), el JSON se queda sin cerrar y `json.loads` falla, o el agente intenta ejecutar una herramienta con argumentos incompletos. No hay excepción: la API responde 200 y en la respuesta pone `stop_reason: "max_tokens"`. Si tu código no mira ese campo, trata la respuesta cortada como si estuviera completa.

## Causas

- **`max_tokens` demasiado bajo para la tarea.** Es un tope duro de salida: al llegar, el modelo para donde esté ([[glosario/max-tokens]]). Con razonamiento adaptativo, el `thinking` también cuenta dentro de ese tope.
- **Pides demasiado en una sola respuesta.** Un informe entero, un archivo de 800 líneas o una lista de 200 elementos.
- **El corte cae en un `tool_use`.** El último bloque es una llamada con el `input` incompleto. No es ejecutable: si lo ejecutas, falla o hace algo que nadie pidió.
- **Copiaste un `max_tokens` pequeño de un ejemplo** pensado para respuestas cortas.

No lo confundas con `model_context_window_exceeded`: ese motivo indica que la entrada más `max_tokens` no cabía en la ventana y la API cortó por ahí ([[docs/fundamentos/06-motivos-de-parada-y-rechazos]]).

## Cómo confirmarlo

Registra `stop_reason` y `usage.output_tokens` de cada llamada. Si `output_tokens` coincide con tu `max_tokens` y el motivo es `max_tokens`, ya está. Mira el tipo del último bloque de `resp.content`: si es `tool_use`, el corte cayó en una llamada.

## Arreglo

Comprueba siempre `stop_reason` y, si es `max_tokens`, repite con más margen hasta un tope que estés dispuesto a pagar. Usa streaming:

```python title="pedir.py"
import anthropic

MODEL = "claude-sonnet-5-5"
TOPE = 64_000   # lo máximo que estás dispuesto a pagar por una respuesta
client = anthropic.Anthropic()


def pedir(messages: list[dict], max_tokens: int = 4096, **kwargs) -> anthropic.types.Message:
    while True:
        # con streaming no hay límite de 10 minutos en el SDK y ves el texto mientras llega
        with client.messages.stream(model=MODEL, max_tokens=max_tokens, messages=messages, **kwargs) as s:
            resp = s.get_final_message()
        if resp.stop_reason != "max_tokens":
            return resp
        if max_tokens >= TOPE:
            raise RuntimeError(f"respuesta incompleta incluso con max_tokens={max_tokens}")
        cortado = resp.content[-1].type if resp.content else "nada"
        print(f"cortada en un bloque {cortado} con max_tokens={max_tokens}; repito con el doble")
        max_tokens = min(max_tokens * 2, TOPE)
```

Con el simulador de la API, una respuesta cortada en texto y otra cortada en un `tool_use` dan:

```text
cortada en un bloque text con max_tokens=4096; repito con el doble
cortada en un bloque tool_use con max_tokens=8192; repito con el doble
end_turn Informe completo. [4096, 8192, 16384]
```

Por qué streaming: si subes `max_tokens` sin él, el SDK 2.3.0 se niega a enviar la petición. En mi prueba, `max_tokens=21333` pasa y `32000` ya lanza, antes de llegar a la red:

```text
ValueError: Streaming is required for operations that may take longer than 10 minutes. See https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/python#long-requests for more details
```

Repetir la petición entera es lo más simple y lo único válido cuando el corte cae en un `tool_use`. Para textos muy largos, es mejor **pedir menos**: divide la tarea (un apartado por llamada, o que el agente escriba el archivo por partes con una herramienta) en lugar de subir el tope sin fin ([[patrones/03-encadenado]]).

## Cómo evitarlo

- Trata `max_tokens` en todos los puntos donde lees una respuesta, también dentro del [[glosario/bucle-agentico|bucle agéntico]] y antes de parsear JSON ([[problemas/json-invalido-del-modelo]]).
- Dimensiona `max_tokens` por tipo de tarea y vigila la proporción de cortes en tus trazas ([[docs/produccion/01-observabilidad]]).
- Con `effort` alto el razonamiento ocupa más; la documentación recomienda al menos 64k de `max_tokens` con `xhigh` o `max` ([[docs/prompting/04-razonamiento]]).
- En LangChain, pasa siempre `max_tokens` a `init_chat_model` o `ChatAnthropic`: sin él usa el máximo del modelo y el problema se vuelve de coste.

## Ver también

- [[glosario/stop-reason]]
- [[docs/fundamentos/04-streaming]]
- [[recetas/streaming-de-respuestas]]
- [[modelos/06-parametros]]
