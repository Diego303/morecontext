---
titulo: GGUF
descripcion: Formato de archivo del ecosistema llama.cpp que guarda en un solo fichero los pesos, a menudo cuantizados, y los metadatos para ejecutar un modelo en local.
creado: 2026-10-29
categoria: produccion
ingles: GGUF
aliases: [gguf, archivo GGUF, formato GGUF]
tags: [produccion, modelos-abiertos, inferencia-local]
relacionados: ["[[glosario/cuantizacion]]", "[[herramientas/llama-cpp]]", "[[herramientas/ollama]]", "[[modelos/12-inferencia-local]]"]
---

GGUF es el formato de archivo de llama.cpp y su biblioteca ggml. Un `.gguf` lleva en un solo fichero los pesos del modelo, normalmente [[glosario/cuantizacion|cuantizados]], junto con los metadatos para cargarlo: arquitectura, tokenizador y, si viene, la [[glosario/plantilla-de-chat]].

## En la práctica

Es lo que ejecutan las herramientas locales basadas en llama.cpp. Ollama descarga GGUF (y MLX en Mac), y `llama-server` puede bajar uno de Hugging Face con la cuantización en el nombre:

```bash
llama-server -hf ggml-org/Qwen3.8-27B-GGUF:Q4_K_M -c 65536 --port 8080
```

Si no indicas la cuantización, usa Q4_K_M. Fija el puerto: desde la v0.7.0 el de defecto es 9931. Un mismo modelo suele publicarse en varios GGUF (Q4_K_M, Q5_K_M, Q8_0…); elige por la memoria que tienes y comprueba con tus evals. Como el GGUF lleva la plantilla de chat, un archivo con plantilla antigua o sin soporte de herramientas puede hacer que el *tool calling* falle aunque el modelo lo soporte.

## No confundir con

- **safetensors**: el formato habitual de los pesos originales en Hugging Face, el que sirve vLLM.
- **MLX**: el formato y la biblioteca de Apple para Mac.

## Ver también

- [[docs/modelos-abiertos/02-vllm-y-llama-cpp]]
- [[docs/modelos-abiertos/01-ollama]]
- [[glosario/inferencia-local]]
