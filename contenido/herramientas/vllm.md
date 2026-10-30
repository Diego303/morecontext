---
titulo: vLLM
descripcion: Servidor de inferencia para GPU que sirve modelos abiertos a muchos usuarios con API compatible con OpenAI y tool calling.
creado: 2026-10-29
tags: [inferencia, modelos-abiertos, produccion, gpu]
relacionados: ["[[recetas/servir-un-modelo-con-vllm]]", "[[docs/modelos-abiertos/02-vllm-y-llama-cpp]]", "[[cursos/agentes-con-modelos-abiertos/03-servir-modelos-en-produccion]]", "[[problemas/modelo-local-no-llama-herramientas]]"]
categoria: inferencia
licencia: Apache-2.0
open_source: true
lenguajes: [Python]
url: https://docs.vllm.ai
repositorio: https://github.com/vllm-project/vllm
version: "0.32.0"
revisado: 2026-10-29
---

vLLM es el servidor de referencia para servir modelos de [[glosario/pesos-abiertos]] en GPU. Agrupa peticiones de muchos usuarios a la vez (*continuous batching*), gestiona el [[glosario/kv-cache]] por bloques y expone endpoints compatibles con OpenAI (`/v1/chat/completions`, `/v1/responses`, `/v1/embeddings`…) y uno compatible con Anthropic (`/v1/messages`). Licencia Apache-2.0; requiere Python ≥ 3.11.

## Para qué sirve

- Poner un modelo abierto detrás de una API para tu equipo o tu producto, en tus GPU.
- *Tool calling* con `tool_choice` completo (`auto`, `required`, `none` o una función concreta), cosa que Ollama no ofrece.
- [[glosario/decodificacion-restringida|Salidas estructuradas]] con `response_format` (`json_schema`) o `structured_outputs`.
- *Prefix caching* (`--enable-prefix-caching`), paralelismo tensorial y de expertos para modelos grandes.

## Cuándo usarla

Cuando hay varios usuarios concurrentes, volumen estable y GPU dedicadas: la opción «abierto alojado» del marco de [[cursos/agentes-con-modelos-abiertos/06-local-o-api]]. También cuando necesitas forzar una herramienta o garantizar un formato.

## Cuándo no

- En un portátil o sin GPU: [[herramientas/ollama]] o [[herramientas/llama-cpp]].
- Para usar `/v1/messages` como si fuera la API de Claude: el RFC #58647 documenta lagunas (`thinking` ignorado, `is_error` descartado, `x-api-key` no aceptado).
- Si no vas a medir: sin evals con tu tarea no sabes si el modelo abierto llega.

> [!aviso] El parser decide si hay herramientas
> El *tool calling* exige `--enable-auto-tool-choice` y `--tool-call-parser <nombre>`. El nombre correcto lo da la *model card* (`qwen3_coder`, `mistral`, `openai`…). Con un *parser* equivocado, las llamadas llegan como texto y el agente parece que «no usa herramientas».

## Ejemplo mínimo

Flags de la *model card* de Qwen3.6-35B-A3B:

```bash
pip install vllm
vllm serve Qwen/Qwen3.6-35B-A3B --max-model-len 262144 \
  --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder
```

```python title="cliente_vllm.py"
from openai import OpenAI

MODEL = "Qwen/Qwen3.6-35B-A3B"
client = OpenAI(base_url="http://localhost:8000/v1", api_key="local")

r = client.chat.completions.create(
    model=MODEL,
    max_tokens=1024,
    messages=[{"role": "user", "content": "Dame tres riesgos de exponer un agente a internet."}],
)
print(r.choices[0].message.content)
```

No se ha ejecutado aquí (no hay GPU). Antes de arrancar, haz la cuenta de memoria: un `--max-model-len` que no cabe hace fallar el arranque, y en un MoE se cargan **todos** los parámetros, no solo los activos.

Cambios que rompen en la 0.32: CORS cerrado por defecto (las llamadas desde el navegador fallan hasta que pasas `--allowed-origins`) y `max_tokens` pasa a ser un tope de salida.

## Alternativas

- [[herramientas/llama-cpp]]: motor ligero para GGUF, también con servidor.
- [[herramientas/ollama]]: local y para pocos usuarios.
- SGLang (Apache-2.0): servidor equivalente, también en Apple Silicon. TGI está archivado desde marzo de 2026: no lo uses en proyectos nuevos.
- [[herramientas/litellm]]: una capa delante si combinas vLLM con APIs comerciales.

## Enlaces

- Documentación: [docs.vllm.ai](https://docs.vllm.ai)
- *Tool calling*: [docs.vllm.ai/en/latest/features/tool_calling](https://docs.vllm.ai/en/latest/features/tool_calling/)
- Repositorio: [github.com/vllm-project/vllm](https://github.com/vllm-project/vllm)
- Notas de la 0.32.0: [releases/tag/v0.32.0](https://github.com/vllm-project/vllm/releases/tag/v0.32.0)
