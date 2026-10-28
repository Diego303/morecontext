---
titulo: Streaming
descripcion: Recibir la respuesta del modelo por partes a medida que se genera, en lugar de esperar a que termine entera.
creado: 2026-10-02
categoria: produccion
aliases: [respuesta en streaming, transmisión incremental, server-sent events]
tags: [produccion, api]
relacionados: ["[[docs/fundamentos/04-streaming]]", "[[recetas/streaming-de-respuestas]]"]
---

El *streaming* es recibir la respuesta del modelo en fragmentos conforme se genera. El usuario empieza a leer en cuanto llega el primer [[glosario/token]] y no tiene que esperar a que se complete toda la respuesta. La API de Anthropic lo envía como eventos del servidor (*server-sent events*).

## En la práctica

```python
with client.messages.stream(model=MODEL, max_tokens=1024, messages=messages) as stream:
    for texto in stream.text_stream:
        print(texto, end="", flush=True)
    final = stream.get_final_message()  # respuesta completa, con stop_reason y usage
```

No reduce el tiempo total ni el coste, pero mejora mucho la [[glosario/latencia]] percibida en interfaces de chat y voz. También evita cortes por tiempo de espera en respuestas largas. Si usas herramientas, los argumentos de `tool_use` llegan troceados: espera al mensaje final para ejecutarlas.

## Ver también

- [[docs/fundamentos/04-streaming]]
- [[recetas/streaming-de-respuestas]]
- [[roadmap/100-produccion/03-latencia]]
- [[sistemas/agente-de-voz]]
