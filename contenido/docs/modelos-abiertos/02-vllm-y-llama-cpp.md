---
titulo: vLLM y llama.cpp
descripcion: Referencia de vLLM (vllm serve, tool calling con parsers, salidas estructuradas, CORS y memoria) y de llama.cpp (llama-server, GGUF, cuantizaciones y el nuevo puerto 9931), y cuándo usar cada uno.
creado: 2026-10-29
orden: 2
nivel: avanzado
tags: [vllm, llama-cpp, gguf, inferencia, gpu]
relacionados: ["[[herramientas/vllm]]", "[[herramientas/llama-cpp]]", "[[recetas/servir-un-modelo-con-vllm]]", "[[cursos/agentes-con-modelos-abiertos/03-servir-modelos-en-produccion]]"]
---

[[herramientas/vllm|vLLM]] y [[herramientas/llama-cpp|llama.cpp]] son los dos motores abiertos que sirven modelos de pesos abiertos con una API compatible con OpenAI. vLLM está pensado para GPU y muchos usuarios a la vez; llama.cpp, para correr en casi cualquier sitio (CPU, Mac, GPU de consumo) con modelos [[glosario/gguf|GGUF]] [[glosario/cuantizacion|cuantizados]]. Esta referencia corresponde a **vLLM 0.32.0** (18 de octubre de 2026, Apache 2.0) y a **llama.cpp v0.7.0** (15 de octubre de 2026, MIT).

Ninguno de los comandos de esta página se ha ejecutado en el entorno de prueba de MoreContext (no hay GPU): siguen la documentación oficial y las *model cards*. El cliente es el SDK `openai` de siempre, que sí está probado contra un servidor simulado en [[docs/modelos-abiertos/03-apis-compatibles-y-litellm]].

## vLLM

### Instalar y arrancar

```bash
pip install vllm                    # Python ≥ 3.11; transformers entre 5.16.1 y 5.20
vllm serve Qwen/Qwen3.6-35B-A3B --max-model-len 262144 \
  --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder
```

El servidor escucha en el puerto 8000. Endpoints: `/v1/chat/completions`, `/v1/completions`, `/v1/responses`, `/v1/embeddings`, `/v1/audio/transcriptions` y `/v1/messages` (compatible con Anthropic, con lagunas: el RFC #58647 documenta que ignora `thinking`, descarta `is_error`, no acepta la cabecera `x-api-key` y no devuelve los errores con formato Anthropic).

### Opciones clave

| Opción | Qué hace | Notas |
|---|---|---|
| `--enable-auto-tool-choice` | Permite que el modelo decida llamar herramientas | Obligatoria para *tool calling* |
| `--tool-call-parser <nombre>` | Extrae `tool_calls` del texto generado | El de la *model card*; ver tabla siguiente |
| `--reasoning-parser <nombre>` | Separa el razonamiento de la respuesta | `qwen3`, `mistral`, `nemotron_v3`… según la card |
| `--chat-template <ruta>` | Sustituye la [[glosario/plantilla-de-chat|plantilla de chat]] | Solo si la del modelo falla o no existe |
| `--max-model-len` | Contexto máximo | Por encima de la memoria disponible, el arranque falla |
| `--tensor-parallel-size N` | Reparte el modelo entre N GPU | Para modelos que no caben en una |
| `--gpu-memory-utilization` | Fracción de VRAM que reserva | El resto queda para otros procesos |
| `--enable-prefix-caching` | Reutiliza la [[glosario/kv-cache|KV cache]] de prefijos comunes | Útil en agentes con sistema y herramientas fijos |
| `--allowed-origins` | Orígenes CORS | **Desde 0.32 el CORS está cerrado por defecto** |

Otro cambio de la 0.32: `max_tokens` pasa a ser un tope de salida.

### Tool calling y parsers

`tool_choice` admite `auto`, `required` (desde 0.8.3), `none` y una función concreta. Con `required` y con función concreta, vLLM usa salidas estructuradas para la llamada: garantiza que sea parseable, no que sea buena.

| Familia | `--tool-call-parser` |
|---|---|
| Qwen 3.5 / 3.6 / 3.8, Nemotron 3, Granite 4.2 | `qwen3_coder` (según sus cards) |
| Mistral Small 4 | `mistral` |
| gpt-oss | `openai` |
| Llama 4 | `llama4_pythonic` |
| DeepSeek V3 / V3.1 | `deepseek_v3`, `deepseek_v31` |
| Kimi K2 | `kimi_k2` |
| GLM 4.5 / 4.7 | `glm45`, `glm47` |
| OLMo 3 | `olmo3` |
| Otros | `hermes`, `llama3_json`, `pythonic`, `qwen3_xml`, `granite`, `granite4`; `hf` (genérico, nuevo en 0.32) |

```bash
# Mistral Small 4 en dos GPU (flags de la model card)
vllm serve mistralai/Mistral-Small-4-119B-2603 --max-model-len 262144 --tensor-parallel-size 2 \
  --tool-call-parser mistral --enable-auto-tool-choice --reasoning-parser mistral

# gpt-oss-20b
vllm serve openai/gpt-oss-20b --enable-auto-tool-choice --tool-call-parser openai
```

Un *parser* que no corresponde al modelo **no da error**: las llamadas llegan como texto en `content`. Si tu agente «termina» sin usar herramientas, es lo primero que hay que mirar ([[problemas/modelo-local-no-llama-herramientas]]).

### Salidas estructuradas

Dos vías, ambas con [[glosario/decodificacion-restringida|decodificación restringida]]:

```python title="estructurada_vllm.py"
from openai import OpenAI

MODEL = "Qwen/Qwen3.6-35B-A3B"
client = OpenAI(base_url="http://localhost:8000/v1", api_key="local")

# 1. JSON Schema en response_format
esquema = {"type": "object", "properties": {"urgente": {"type": "boolean"}}, "required": ["urgente"]}
SIN_RAZONAR = {"chat_template_kwargs": {"enable_thinking": False}}   # Qwen razona por defecto y gastaría el tope
r = client.chat.completions.create(model=MODEL, max_tokens=256,
    messages=[{"role": "user", "content": "¿Es urgente? 'Me cobrasteis dos veces, lo necesito hoy'"}],
    response_format={"type": "json_schema", "json_schema": {"name": "urgencia", "schema": esquema}},
    extra_body=SIN_RAZONAR)

# 2. Una opción cerrada con structured_outputs (extensión de vLLM)
r = client.chat.completions.create(model=MODEL, max_tokens=32,
    messages=[{"role": "user", "content": "Categoría de 'El paquete no ha llegado'"}],
    extra_body={"structured_outputs": {"choice": ["facturacion", "envio", "devolucion", "otro"]}, **SIN_RAZONAR})
print(r.choices[0].message.content)
```

### Memoria

vLLM reserva una fracción de la VRAM (`--gpu-memory-utilization`) y la reparte entre los pesos y la KV cache de las peticiones activas. Con más contexto por petición o más usuarios simultáneos, la KV cache crece y caben menos peticiones a la vez. En un modelo de [[glosario/mezcla-de-expertos|mezcla de expertos]] se cargan **todos** los parámetros. La fórmula está en [[modelos/12-inferencia-local]].

## llama.cpp

### llama-server

```bash
# descarga de Hugging Face (Q4_K_M si no indicas cuantización) y sirve con 64k de contexto
llama-server -hf ggml-org/Qwen3.8-27B-GGUF:Q4_K_M -c 65536 --port 8080
```

Cambios de la v0.7.0, la primera estable con versiones semánticas:

- **El puerto por defecto pasa de 8080 a 9931.** Las imágenes Docker mantienen 8080. Fija `--port` para no depender de ello; los tutoriales con `localhost:8080` fallan sin él.
- `--jinja` viene activado por defecto (hace falta para herramientas).
- `--moe-cache-mib` deja expertos de un MoE en la RAM de la CPU.

| Opción | Qué hace |
|---|---|
| `-hf usuario/modelo[:quant]` | Descarga de Hugging Face, con el `mmproj` multimodal si existe |
| `-c`, `--ctx-size` | Contexto (0 = el del modelo) |
| `-ngl` | Capas en GPU (`auto` por defecto) |
| `--host` / `--port` | Por defecto `127.0.0.1` y 9931 |
| `--api-key` | Exige clave en las peticiones |
| `-j`, `--json-schema` | Restringe la salida a un esquema |
| `--reasoning-format` | Cómo devolver el razonamiento |
| `--tools all` | Herramientas integradas |
| `--mcp-servers-config` | Servidores MCP (solo stdio) |

Endpoints: chat, *completions*, *responses* y *embeddings* compatibles con OpenAI, Messages compatible con Anthropic, *rerank* y `/health`. Las llamadas paralelas a herramientas se activan por petición con `parallel_tool_calls: true`.

### GGUF y cuantizaciones

Un GGUF es un único archivo con los pesos (cuantizados o no), el tokenizador, la plantilla de chat y los metadatos. La cuantización determina el tamaño. Bits por peso medidos en el README de `llama-quantize` (sobre Llama-3.1-8B):

| Cuantización | Bits por peso | 27B denso ≈ | Cuándo |
|---|---|---|---|
| IQ4_XS | 4,46 | 15,1 GB | Memoria muy justa |
| Q4_K_M | 4,89 | 16,5 GB | Punto de partida habitual (el defecto de `-hf`) |
| Q5_K_M | 5,70 | 19,2 GB | Algo más de calidad si cabe |
| Q6_K | 6,56 | 22,1 GB | Cerca de Q8 con menos memoria |
| Q8_0 | 8,50 | 28,7 GB | Calidad muy próxima a la original |
| F16 | 16,0 | 54 GB | Referencia; rara vez en local |

Los tamaños salen de parámetros × bits por peso / 8, sin KV cache ni margen. La documentación de llama.cpp avisa de que **cuantizar la KV cache de forma agresiva degrada el *tool calling***, y las plantillas sin soporte de herramientas caen en un *handler* genérico que gasta más tokens.

## Cuándo cada uno

| Situación | Elige |
|---|---|
| Varios usuarios simultáneos, GPU de centro de datos | vLLM (o SGLang) |
| Necesitas `tool_choice` forzado o salidas con esquema en el servidor | vLLM |
| Portátil, Mac, CPU o una GPU de consumo | llama.cpp (u Ollama, que lo usa por debajo) |
| Un único archivo portable y control fino de cuantización | llama.cpp |
| Prototipo rápido sin configurar nada | Ollama ([[docs/modelos-abiertos/01-ollama]]) |
| Proyecto nuevo que pensaba usar TGI | vLLM, SGLang o llama.cpp: TGI está archivado desde el 21-03-2026 |

**SGLang** 0.5.22 (Apache 2.0) es la alternativa a vLLM con el mismo papel: `python3 -m sglang.launch_server --model-path <repo> --host 0.0.0.0 --port 30000`, con `--tool-call-parser` y `--reasoning-parser`. Funciona también en Apple Silicon y su router añade `/v1/messages`.

## Errores típicos

| Síntoma | Causa | Arreglo |
|---|---|---|
| vLLM no arranca: memoria insuficiente | `--max-model-len` demasiado alto | Bájalo o usa `--tensor-parallel-size` |
| Las llamadas salen como texto | *Parser* equivocado o falta `--enable-auto-tool-choice` | El *parser* de la *model card* |
| El navegador falla tras actualizar vLLM | CORS cerrado desde 0.32 | `--allowed-origins` |
| `Connection refused` en `localhost:8080` | llama.cpp ≥ 0.7.0 escucha en 9931 | `--port 8080` o cambia el cliente |
| DeepSeek V4 responde con formato extraño | No trae plantilla Jinja | Motor con soporte específico (`encoding.py`, `deepseek-recipe`) |
| Herramientas peores tras ahorrar memoria | KV cache cuantizada agresivamente | Vuelve a `f16` o `q8_0` |

## Ver también

- [[recetas/servir-un-modelo-con-vllm]]: despliegue paso a paso.
- [[cursos/agentes-con-modelos-abiertos/03-servir-modelos-en-produccion]]: *batching*, KV cache y coste operativo.
- [[docs/modelos-abiertos/03-apis-compatibles-y-litellm]]: una pasarela delante de ambos.
- [[herramientas/vllm]] y [[herramientas/llama-cpp]].
