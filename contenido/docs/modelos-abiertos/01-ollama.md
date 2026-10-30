---
titulo: Ollama
descripcion: Referencia de Ollama para agentes, con comandos, Modelfile, API nativa y compatibles con OpenAI y Anthropic, tool calling, format con JSON Schema, variables de entorno, embeddings y errores típicos.
creado: 2026-10-29
orden: 1
nivel: inicial
tags: [ollama, inferencia, local, api]
relacionados: ["[[herramientas/ollama]]", "[[cursos/agentes-con-modelos-abiertos/02-tu-primer-modelo-en-local]]", "[[recetas/agente-local-con-ollama]]", "[[docs/modelos-abiertos/03-apis-compatibles-y-litellm]]"]
---

[[herramientas/ollama|Ollama]] es un servidor local que descarga modelos de pesos abiertos (en formato [[glosario/gguf|GGUF]] y MLX), decide cuánto de cada modelo va a la GPU y a la CPU, y los expone por HTTP con tres APIs: la nativa (`/api/*`), una compatible con OpenAI (`/v1/*`) y una compatible con Anthropic (`/v1/messages`). Esta referencia corresponde a **Ollama v0.40.12** (27 de octubre de 2026) y al cliente Python `ollama` 0.6.3. El cliente Python es MIT; la licencia del servidor figura como MIT en el repositorio.

Los comandos de esta página siguen la documentación oficial y no se han ejecutado en el entorno de prueba de MoreContext (sin GPU ni Ollama). El código Python sí se ha ejecutado, contra un servidor que imita las rutas de Ollama.

## Comandos

| Comando | Qué hace |
|---|---|
| `ollama pull <modelo>` | Descarga un modelo (`qwen3.6:27b`, `gemma4:12b`…) |
| `ollama run <modelo> ["prompt"]` | Chat en terminal o una respuesta suelta |
| `ollama serve` | Arranca el servidor (las apps de escritorio lo hacen solas) |
| `ollama ps` | Modelos cargados, con `PROCESSOR` (reparto GPU/CPU) y `CONTEXT` (contexto real) |
| `ollama list` / `ollama show <modelo>` | Modelos descargados / detalles, plantilla y capacidades |
| `ollama create <nombre> -f Modelfile` | Crea un modelo derivado con tus parámetros |
| `ollama launch {claude\|codex\|opencode\|droid}` | Conecta un agente de código al servidor local (ver [[docs/modelos-abiertos/10-agentes-de-codigo-abiertos]]) |

Los nombres con etiqueta `:cloud` **no son locales**: el modelo corre en ollama.com y tus datos salen de la máquina.

## Variables de entorno

| Variable | Defecto | Para qué |
|---|---|---|
| `OLLAMA_HOST` | `127.0.0.1:11434` | Dirección de escucha; `0.0.0.0:11434` lo expone a la red (sin autenticación) |
| `OLLAMA_CONTEXT_LENGTH` | según la VRAM (ver abajo) | Contexto por defecto de todos los modelos |
| `OLLAMA_KEEP_ALIVE` | 5 min | Tiempo que un modelo sigue cargado sin uso |
| `OLLAMA_NUM_PARALLEL` | 1 | Peticiones simultáneas por modelo; la memoria crece con paralelo × contexto |
| `OLLAMA_MAX_LOADED_MODELS` | 3 × GPU (3 en CPU) | Modelos cargados a la vez |
| `OLLAMA_MAX_QUEUE` | 512 | Cola; al llenarse devuelve 503 |
| `OLLAMA_FLASH_ATTENTION` | desactivada | Activa Flash Attention |
| `OLLAMA_KV_CACHE_TYPE` | `f16` | `q8_0` o `q4_0` para ahorrar memoria de [[glosario/kv-cache|KV cache]] (requiere Flash Attention) |
| `OLLAMA_MODELS` | la carpeta de Ollama del usuario | Carpeta donde se guardan los modelos |

## El contexto: num_ctx

Es el ajuste que más agentes rompe. `num_ctx` es la ventana que Ollama reserva; si la conversación la supera, **descarta el principio sin error**. La documentación se contradice sobre el valor por defecto: la página de contexto dice que depende de la VRAM (4k con menos de 24 GiB, 32k de 24 a 48 GiB, 256k con 48 GiB o más), la FAQ dice 4096 y la referencia del Modelfile, 2048. Compruébalo siempre con `ollama ps`. Para agentes, herramientas de código y búsqueda web, Ollama recomienda **al menos 64 000 tokens**.

- **Por petición** (API nativa): `options={"num_ctx": 32768}`.
- **Por modelo**: `PARAMETER num_ctx 65536` en un Modelfile. Es la única vía para la API compatible con OpenAI, que no tiene campo de contexto.
- **Para todo el servidor**: `OLLAMA_CONTEXT_LENGTH=65536`.

## Modelfile

Un Modelfile deriva un modelo con parámetros, plantilla o sistema propios. Instrucciones: `FROM`, `PARAMETER`, `TEMPLATE`, `SYSTEM`, `LICENSE`, `MESSAGE`, `REQUIRES` y `CAPABILITY`.

```text title="Modelfile"
FROM qwen3.6:27b
PARAMETER num_ctx 65536
PARAMETER num_predict 2048
PARAMETER temperature 0.7
```

```bash
ollama create qwen3.6-agente -f Modelfile
ollama ps     # tras la primera petición, CONTEXT debe decir 65536
```

Valores por defecto de los parámetros: `temperature` 0.8, `top_k` 40, `top_p` 0.9, `min_p` 0.0, `repeat_penalty` 1.0 y **`num_predict` -1, que significa sin límite de salida**. Pon siempre un tope.

## API nativa: /api/chat

La que más controla. Campos principales: `model`, `messages`, `tools`, `format`, `think`, `options` (parámetros del Modelfile por petición), `stream` y `keep_alive`.

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3.6:27b", "stream": false, "think": false,
  "messages": [{"role": "user", "content": "Hola"}],
  "options": {"num_ctx": 32768, "num_predict": 256}
}'
```

- **`think`**: `true`, `false` o un nivel (`"low"`…) según el modelo; los valores admitidos salen en `/api/show` → `thinking.values`. Casi todos los modelos recientes razonan por defecto.
- **`format`**: un JSON Schema; la salida se restringe a él. Valida igualmente en tu código.
- **Recuentos**: la respuesta trae `prompt_eval_count` (entrada) y `eval_count` (salida).

### Tool calling nativo

El cliente Python acepta funciones directamente: `convert_function_to_tool` genera el esquema a partir de la firma y del docstring (sección `Args:`). El resultado vuelve en un mensaje `role: "tool"` con `tool_name`.

```python title="agente_ollama_nativo.py"
from ollama import chat

MODEL = "qwen3.6:27b"

def buscar_pedido(pedido_id: str) -> str:
    """Devuelve el estado de un pedido.

    Args:
      pedido_id: Identificador del pedido, p. ej. A-123
    """
    return f"El pedido {pedido_id} está enviado"

FUNCIONES = {"buscar_pedido": buscar_pedido}

def agente(pregunta: str, max_pasos: int = 5) -> str:
    messages = [{"role": "user", "content": pregunta}]
    for _ in range(max_pasos):
        r = chat(model=MODEL, messages=messages, tools=[buscar_pedido], think=False,
                 options={"num_ctx": 32768, "num_predict": 1024})   # contexto y tope de salida explícitos
        messages.append(r.message)
        if not r.message.tool_calls:
            return r.message.content
        for call in r.message.tool_calls:
            fn = FUNCIONES.get(call.function.name)
            salida = fn(**call.function.arguments) if fn else f"Error: no existe {call.function.name}"
            messages.append({"role": "tool", "tool_name": call.function.name, "content": salida})
    return "Sin respuesta tras el límite de pasos."

if __name__ == "__main__":
    print(agente("¿Cómo va mi pedido A-123?"))
```

Lo que envió el cliente en la prueba (servidor simulado con un guion de dos turnos):

```text
Tu pedido A-123 está enviado.
options: {'num_ctx': 32768, 'num_predict': 1024} · think: False · tool: {"name": "buscar_pedido", "description": "Devuelve el estado de un pedido.", "parameters": {"type": "object", "required": ["pedido_id"], "properties": {"pedido_id": {"type": "string", "description": "Identificador del pedido, p. ej. A-123"}}}}
2ª petición, último mensaje: {'role': 'tool', 'content': 'El pedido A-123 está enviado', 'tool_name': 'buscar_pedido'}
```

En la API nativa los argumentos llegan ya como dict (`call.function.arguments`), no como cadena JSON. Valídalos igualmente: el servidor no comprueba que cumplan el esquema.

### Salida estructurada con format

```python title="salida_estructurada.py"
from ollama import chat
from pydantic import BaseModel

MODEL = "qwen3.6:27b"

class Ticket(BaseModel):
    categoria: str
    urgente: bool

r = chat(model=MODEL,
         messages=[{"role": "user", "content": "Clasifica: 'Me cobrasteis dos veces, lo necesito hoy'"}],
         format=Ticket.model_json_schema(), options={"temperature": 0})
ticket = Ticket.model_validate_json(r.message.content)    # valida siempre
print(ticket)
```

## API compatible con OpenAI: /v1

Rutas: `/v1/chat/completions`, `/v1/completions`, `/v1/responses` (sin estado), `/v1/embeddings`, `/v1/models` y `/v1/audio/speech`. Con el SDK `openai`: `OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")` (la clave es obligatoria para el SDK y Ollama la ignora).

| Acepta en `/v1/chat/completions` | No acepta |
|---|---|
| `tools`, `response_format`, `reasoning_effort`, `stream_options.include_usage`, `max_tokens` | `tool_choice`, `logit_bias`, `n`, imágenes por URL; ningún campo de contexto (usa un Modelfile) |

`/v1/responses` no guarda estado: no acepta `previous_response_id`. El bucle completo con esta API y validación de argumentos está en [[cursos/agentes-con-modelos-abiertos/04-herramientas-con-modelos-abiertos]].

## API compatible con Anthropic: /v1/messages

El SDK `anthropic` funciona con `anthropic.Anthropic(base_url="http://localhost:11434", api_key="ollama")`: el SDK añade `/v1/messages` a esa base (comprobado con el simulador de la API de Mensajes). Admite mensajes, *streaming*, sistema, visión en base64, `tools`, `thinking` y `output_config.effort`.

**No admite** `count_tokens`, `tool_choice`, *prompt caching*, *batches*, citas ni documentos PDF. `budget_tokens` se acepta pero no se aplica, y los recuentos de `usage` son aproximados. Es lo que permite usar el código de MoreContext contra un modelo local, y también conectar Claude Code (propietario) a Ollama con `ANTHROPIC_BASE_URL=http://localhost:11434`.

## Embeddings

Modelos de la biblioteca: `qwen3-embedding` (0.6b, 4b, 8b), `bge-m3`, `embeddinggemma`, `nomic-embed-text` y `mxbai-embed-large`. Revisa la licencia de cada uno en su *model card*. Desde Python:

```python title="embeddings.py"
from ollama import embed

EMBED_MODEL = "qwen3-embedding:0.6b"
r = embed(model=EMBED_MODEL, input=["Tienes 30 días para devolverlo.", "Horario de soporte"])
print(len(r.embeddings), "vectores de", len(r.embeddings[0]), "dimensiones")
```

La API nativa es `/api/embed`; la compatible, `/v1/embeddings`. Comprueba la dimensión real antes de crear la tabla o colección (en la prueba, con un modelo simulado, salieron 64; con un modelo real será la suya). La elección de modelo está en [[docs/modelos-abiertos/04-embeddings-y-rerankers]].

## Errores típicos

| Síntoma | Causa | Arreglo |
|---|---|---|
| El agente olvida el *prompt* de sistema a mitad de conversación | `num_ctx` pequeño trunca en silencio | Súbelo y compruébalo con `ollama ps` |
| La respuesta no termina | `num_predict` = -1 por defecto | `num_predict` o `max_tokens` siempre |
| La llamada a herramienta llega como texto | Modelo sin capacidad `tools` o plantilla alterada | `ollama show <modelo>`; usa uno con *tool calling* documentado |
| `tool_choice` no tiene efecto | No implementado en `/v1` ni en `/v1/messages` | Instrucción en el *prompt* o `format` para el resultado final |
| Muy lento y `PROCESSOR` muestra CPU | El modelo no cabe en la GPU | Modelo menor o cuantización mayor; ver [[modelos/12-inferencia-local]] |
| 503 bajo carga | Cola `OLLAMA_MAX_QUEUE` llena | Más `OLLAMA_NUM_PARALLEL` (y memoria) o vLLM |
| *Tool calling* peor tras ahorrar memoria | `OLLAMA_KV_CACHE_TYPE=q4_0` | `q8_0` o `f16` |
| Otros equipos acceden a tu modelo | `OLLAMA_HOST=0.0.0.0` sin protección | Proxy con autenticación o solo `127.0.0.1` |

## Ver también

- [[cursos/agentes-con-modelos-abiertos/02-tu-primer-modelo-en-local]]: Ollama de cero, con la fórmula de memoria.
- [[recetas/agente-local-con-ollama]]: un agente con herramientas paso a paso.
- [[docs/modelos-abiertos/02-vllm-y-llama-cpp]]: cuando necesitas más concurrencia o más control.
- [[problemas/modelo-local-no-llama-herramientas]].
