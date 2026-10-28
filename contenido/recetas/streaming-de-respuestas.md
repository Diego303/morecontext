---
titulo: Streaming de respuestas
descripcion: Muestra la respuesta del modelo a medida que se genera, en consola y en un endpoint web con Server-Sent Events, sin perder el mensaje final ni el stop_reason.
creado: 2026-10-01
nivel: inicial
minutos: 15
tema: produccion
stack: [python, anthropic, fastapi]
tags: [streaming, latencia, ux]
relacionados: ["[[docs/fundamentos/04-streaming]]", "[[glosario/streaming]]", "[[roadmap/100-produccion/03-latencia]]", "[[disciplinas/ux-de-agentes]]"]
---

## Problema

Tu asistente tarda varios segundos en contestar y el usuario mira una pantalla vacía. La respuesta completa tarda lo mismo con o sin streaming, pero con [[glosario/streaming|streaming]] el primer texto aparece enseguida y la espera se siente distinta.

Quieres mostrar el texto conforme llega, tanto en un script como en una web, y seguir teniendo al final el mensaje completo con su `stop_reason` y su `usage`.

## Ingredientes

- Python 3.10 o superior.
- `pip install anthropic` (y `fastapi uvicorn` para el paso 3).
- La variable de entorno `ANTHROPIC_API_KEY`.

## Pasos

1. **Usa `messages.stream` como gestor de contexto.** `stream.text_stream` va entregando trozos de texto. Al terminar, `stream.get_final_message()` devuelve el mismo objeto `Message` que tendrías sin streaming: contenido, [[glosario/stop-reason|stop_reason]] y `usage`.

2. **Mide el tiempo hasta el primer token.** Es la métrica que nota el usuario. El tiempo total apenas cambia.

```python title="streaming.py"
import sys
import time

import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()


def responder(pregunta: str) -> anthropic.types.Message:
    inicio = time.monotonic()
    primer_token = None
    with client.messages.stream(
        model=MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": pregunta}],
    ) as stream:
        for texto in stream.text_stream:
            if primer_token is None:
                primer_token = time.monotonic() - inicio
            print(texto, end="", flush=True)
        final = stream.get_final_message()  # el mensaje completo, igual que sin streaming

    print()
    print(f"\n[primer token: {(primer_token or 0):.2f} s | total: {time.monotonic() - inicio:.2f} s | "
          f"stop_reason: {final.stop_reason} | salida: {final.usage.output_tokens} tokens]", file=sys.stderr)
    if final.stop_reason == "max_tokens":
        print("[aviso: la respuesta se cortó por max_tokens]", file=sys.stderr)
    return final


if __name__ == "__main__":
    responder(" ".join(sys.argv[1:]) or "Explica en tres párrafos qué es una ventana de contexto.")
```

Ejecútalo: `python streaming.py "¿Qué es un token?"`.

3. **Llévalo a una web con Server-Sent Events.** El navegador recibe una línea `data:` por cada trozo. Al final, un evento con `fin` y el `stop_reason` para que la interfaz sepa que ha terminado y si la respuesta se cortó.

```python title="web.py"
import json

import anthropic
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()
app = FastAPI()


class Pregunta(BaseModel):
    texto: str


def eventos(pregunta: str):
    with client.messages.stream(
        model=MODEL, max_tokens=1024, messages=[{"role": "user", "content": pregunta}]
    ) as stream:
        for texto in stream.text_stream:
            yield f"data: {json.dumps({'texto': texto})}\n\n"
        final = stream.get_final_message()
    yield f"data: {json.dumps({'fin': True, 'stop_reason': final.stop_reason})}\n\n"


@app.post("/preguntar")
def preguntar(p: Pregunta):
    # una función generadora normal: FastAPI la recorre en un hilo aparte
    return StreamingResponse(eventos(p.texto), media_type="text/event-stream")
```

Arráncalo con `uvicorn web:app --reload`.

4. **Consúmelo desde el navegador.** `EventSource` solo admite GET, así que para un POST lee el cuerpo como flujo:

```js title="cliente.js"
const resp = await fetch("/preguntar", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ texto: "¿Qué es un token?" }),
});
const lector = resp.body.pipeThrough(new TextDecoderStream()).getReader();
let resto = "";
while (true) {
  const { value, done } = await lector.read();
  if (done) break;
  resto += value;
  const eventos = resto.split("\n\n");
  resto = eventos.pop(); // el último puede estar a medias
  for (const ev of eventos) {
    const datos = JSON.parse(ev.replace(/^data: /, ""));
    if (datos.texto) document.querySelector("#respuesta").textContent += datos.texto;
  }
}
```

## Cómo comprobar que funciona

```text
# salida de ejemplo
Un token es la unidad mínima de texto con la que trabaja el modelo…

[primer token: 0.62 s | total: 4.80 s | stop_reason: end_turn | salida: 212 tokens]
```

- El texto aparece por partes, no de golpe al final.
- El tiempo hasta el primer token es una fracción pequeña del total.
- Con `curl -N -X POST localhost:8000/preguntar -H 'Content-Type: application/json' -d '{"texto":"hola"}'` ves llegar los eventos uno a uno. Si llegan todos juntos, algo en medio (un proxy, la compresión) está acumulando la respuesta.
- Baja `max_tokens` a 20: debe aparecer el aviso de `max_tokens` y el evento final con ese `stop_reason`.

## Variaciones

- **TypeScript.** Con `@anthropic-ai/sdk`: `const stream = client.messages.stream({...}); stream.on("text", (t) => process.stdout.write(t)); const final = await stream.finalMessage();`.
- **Herramientas.** Con herramientas, el stream también trae bloques `tool_use` cuyo `input` llega por partes. No ejecutes nada hasta tener el mensaje final: usa `get_final_message()` y sigue el bucle normal ([[docs/herramientas/01-uso-de-herramientas]]).
- **Eventos completos.** Itera `for evento in stream:` para recibir todos los eventos (`message_start`, `content_block_delta`, `message_delta`, `message_stop`…). Útil para mostrar progreso de herramientas o razonamiento.
- **Asíncrono.** `anthropic.AsyncAnthropic` con `async with client.messages.stream(...) as stream:` y `async for texto in stream.text_stream:`.
- **Cancelar.** Si el usuario cierra la pestaña, sal del bucle: al salir del `with` se cierra la conexión y dejas de generar tokens.

## Errores típicos

- **Olvidar el mensaje final.** Sin `get_final_message()` no tienes `stop_reason` ni `usage`, y no sabrás si la respuesta se cortó ni cuánto costó.
- **Proxies que acumulan.** Algunos servidores y CDN guardan la respuesta entera antes de enviarla. Desactiva el *buffering* para esa ruta (en nginx, `proxy_buffering off`) y no comprimas el flujo.
- **Validar JSON trozo a trozo.** Si pides salida estructurada, el JSON solo es válido al final. Parsea el mensaje completo.
- **Ejecutar herramientas con argumentos a medias.** Espera al final del bloque `tool_use`.
- **Pensar que el streaming abarata.** Cuesta lo mismo. Mejora la latencia percibida, no la total ([[docs/produccion/03-latencia]]).
- **Errores a mitad.** Si la conexión se corta a mitad, el texto mostrado queda incompleto. Indícalo en la interfaz y ofrece reintentar ([[recetas/reintentos-y-limites-de-tasa]]).
