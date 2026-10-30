---
titulo: llama.cpp
descripcion: Motor de inferencia en C/C++ para modelos GGUF cuantizados, con un servidor HTTP compatible con OpenAI y Anthropic.
creado: 2026-10-29
tags: [inferencia, modelos-abiertos, local, gguf]
relacionados: ["[[docs/modelos-abiertos/02-vllm-y-llama-cpp]]", "[[modelos/12-inferencia-local]]", "[[glosario/cuantizacion]]", "[[radar/2026-10-29-tgi-archivado-y-llama-cpp-semver]]"]
categoria: inferencia
licencia: MIT
open_source: true
lenguajes: [C++]
url: https://github.com/ggml-org/llama.cpp
repositorio: https://github.com/ggml-org/llama.cpp
version: "0.7.0"
revisado: 2026-10-29
---

llama.cpp es un motor de inferencia escrito en C/C++ que ejecuta modelos en formato [[glosario/gguf]] en CPU, GPU o Apple Silicon. Trae `llama-server`, un servidor HTTP con endpoints compatibles con OpenAI (chat, completions, responses, embeddings), con la API de mensajes de Anthropic, *rerank* y `/health`. Licencia MIT. Muchas herramientas locales se apoyan en él por debajo.

## Para qué sirve

- Ejecutar modelos [[glosario/cuantizacion|cuantizados]] con control fino: tamaño de contexto (`-c`), capas en GPU (`-ngl`), formato del razonamiento, esquema JSON de salida (`-j`).
- Descargar y servir un modelo de Hugging Face en un comando con `-hf usuario/modelo[:quant]` (Q4_K_M por defecto).
- Repartir un modelo [[glosario/mezcla-de-expertos|MoE]] entre GPU y RAM con `--moe-cache-mib`.
- Conectar servidores MCP stdio al propio servidor con `--mcp-servers-config`.

## Cuándo usarla

Cuando quieres el motor sin capas encima: máquinas modestas, despliegues sin Python, contenedores pequeños o control exacto de la cuantización. La tabla de bits por peso del README de `llama-quantize` (Q4_K_M ≈ 4,89; Q8_0 ≈ 8,50) es la base para calcular memoria, como explica [[modelos/12-inferencia-local]].

## Cuándo no

- Si solo quieres probar modelos con comodidad: [[herramientas/ollama]] o [[herramientas/lm-studio]] gestionan descargas y memoria por ti.
- Si sirves a muchos usuarios concurrentes en GPU: [[herramientas/vllm]] hace *continuous batching* y tiene más *parsers* de herramientas.

> [!aviso] Cambio de puerto en la v0.7.0
> Desde la v0.7.0 (15 oct. 2026, la primera con versiones semánticas) `llama-server` escucha por defecto en el **puerto 9931**; las imágenes Docker mantienen el 8080. Los tutoriales con `localhost:8080` fallan si no fijas `--port`.

## Ejemplo mínimo

```bash
# Descarga el GGUF de Hugging Face y sirve con 64k de contexto en un puerto explícito
llama-server -hf ggml-org/Qwen3.8-27B-GGUF:Q4_K_M -c 65536 --port 8080
curl http://localhost:8080/health
```

Cualquier cliente compatible con OpenAI sirve. `--jinja` viene activado por defecto y es lo que permite el *tool calling* con la [[glosario/plantilla-de-chat]] del modelo.

```python title="cliente_llama_cpp.py"
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8080/v1", api_key="local")  # sin --api-key, la clave se ignora
MODEL = client.models.list().data[0].id   # el modelo que sirve llama-server

r = client.chat.completions.create(
    model=MODEL,
    max_tokens=512,
    messages=[{"role": "user", "content": "Explica qué es el KV cache en dos frases."}],
)
print(r.choices[0].message.content)
```

No se ha ejecutado aquí (sin modelo descargado); los comandos son los del README del servidor. Trampas: plantillas sin soporte de herramientas (el *handler* genérico gasta más tokens) y un [[glosario/kv-cache]] cuantizado de forma agresiva, que la propia documentación desaconseja para *tool calling*.

## Alternativas

- [[herramientas/ollama]]: servidor local más cómodo, con biblioteca de modelos.
- [[herramientas/lm-studio]]: aplicación de escritorio.
- [[herramientas/vllm]]: servidor para GPU y producción.

Para el detalle de flags y despliegue: [[docs/modelos-abiertos/02-vllm-y-llama-cpp]] y [[cursos/agentes-con-modelos-abiertos/03-servir-modelos-en-produccion]].

## Enlaces

- Repositorio: [github.com/ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp)
- README del servidor: [tools/server/README.md](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)
- *Function calling*: [docs/function-calling.md](https://github.com/ggml-org/llama.cpp/blob/master/docs/function-calling.md)
- Notas de la v0.7.0: [releases/tag/v0.7.0](https://github.com/ggml-org/llama.cpp/releases/tag/v0.7.0)
