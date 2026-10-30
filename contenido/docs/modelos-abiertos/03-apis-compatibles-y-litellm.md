---
titulo: APIs compatibles y LiteLLM
descripcion: Cómo funciona la compatibilidad con las APIs de OpenAI y Anthropic en Ollama, vLLM, llama.cpp, LM Studio y SGLang, qué se pierde al cambiar base_url y cómo usar LiteLLM como SDK y como pasarela.
creado: 2026-10-29
orden: 3
nivel: intermedio
tags: [api, openai, anthropic, litellm, compatibilidad]
relacionados: ["[[herramientas/litellm]]", "[[docs/modelos-abiertos/01-ollama]]", "[[cursos/agentes-con-modelos-abiertos/06-local-o-api]]", "[[patrones/04-enrutado]]"]
---

Una **API compatible** es un servidor que acepta peticiones con el formato de otro proveedor para que su SDK funcione cambiando solo la dirección (`base_url`). El formato de OpenAI Chat Completions es el estándar de facto: lo implementan todos los motores abiertos. Desde 2026 se extiende también el formato de la API de Mensajes de Anthropic, de modo que el código de MoreContext puede apuntar a un modelo local. «Compatible» casi nunca significa «idéntico»: esta página dice qué se mantiene, qué se pierde y cómo usar [[herramientas/litellm|LiteLLM]] para no depender de ninguno.

## Quién implementa qué

Estado a 29 de octubre de 2026:

| Motor | OpenAI Chat Completions | OpenAI Responses | Anthropic `/v1/messages` | Base URL habitual |
|---|---|---|---|---|
| [[herramientas/ollama|Ollama]] v0.40.12 | Sí (sin `tool_choice`) | Sí, sin estado | Sí (sin `tool_choice`, caché ni `count_tokens`) | `http://localhost:11434/v1` · Anthropic: `http://localhost:11434` |
| [[herramientas/vllm|vLLM]] 0.32.0 | Sí, con `tool_choice` | Sí | Sí, con lagunas (RFC #58647) | `http://localhost:8000/v1` |
| [[herramientas/llama-cpp|llama.cpp]] v0.7.0 | Sí | Sí | Sí | `http://localhost:9931/v1` (puerto por defecto desde v0.7.0) |
| [[herramientas/lm-studio|LM Studio]] 0.4.x | Sí | Sí | Desde 0.4.1 | `http://localhost:1234/v1` |
| SGLang 0.5.22 | Sí | sin confirmar | En el router | `http://localhost:30000/v1` |
| LiteLLM *proxy* | Sí | sin confirmar | Sí | `http://localhost:4000` |

LM Studio es una aplicación propietaria y gratuita; el resto son open source (Ollama: cliente MIT verificado; servidor MIT según su repositorio).

## Cambiar de proveedor con base_url

El mismo cliente vale para todos. La clave es obligatoria para los SDK aunque los servidores locales la ignoren (salvo que configures `--api-key` en llama.cpp o vLLM).

```python title="cliente_compatible.py"
from openai import OpenAI

SERVIDORES = {                                       # elige uno; el código de abajo no cambia
    "ollama": ("http://localhost:11434/v1", "qwen3.6:27b"),
    "vllm": ("http://localhost:8000/v1", "Qwen/Qwen3.6-35B-A3B"),
    "llama.cpp": ("http://localhost:9931/v1", "qwen3.8-27b"),
}
BASE_URL, MODEL = SERVIDORES["ollama"]
client = OpenAI(base_url=BASE_URL, api_key="local")

r = client.chat.completions.create(model=MODEL, max_tokens=256,
    messages=[{"role": "user", "content": "Resume en una frase: el pedido A-123 salió ayer."}])
print(r.choices[0].message.content, "·", r.usage.prompt_tokens, "+", r.usage.completion_tokens, "tokens")
```

El nombre del modelo cambia según el motor: el de `ollama list` en Ollama, el repositorio de Hugging Face en vLLM y lo que muestre `/v1/models` en llama.cpp. Pídelo a `/v1/models` en lugar de suponerlo.

## La API de Anthropic en local

Con el SDK `anthropic`, `base_url` es la raíz del servidor: el SDK añade `/v1/messages`.

```python title="anthropic_local.py"
import anthropic

MODEL = "qwen3.6:27b"
client = anthropic.Anthropic(base_url="http://localhost:11434", api_key="ollama")

resp = client.messages.create(model=MODEL, max_tokens=512,
                              messages=[{"role": "user", "content": "Hola, ¿qué modelo eres?"}])
print(resp.stop_reason, resp.content[0].text)
```

Comprobado con el simulador de la API de Mensajes de MoreContext: las peticiones salen a `http://localhost:11434/v1/messages` y el bucle con `tool_use` y `tool_result` funciona igual que contra Claude (el bucle completo está en [[cursos/agentes-con-modelos-abiertos/04-herramientas-con-modelos-abiertos]]). Lo que **no** se garantiza en local:

- **Ollama**: sin `tool_choice`, *prompt caching*, `count_tokens`, *batches*, citas ni PDF; `budget_tokens` se acepta y no se aplica; `usage` aproximado.
- **vLLM**: ignora `thinking`, descarta `is_error` en los `tool_result`, no acepta `x-api-key` (usa `Authorization: Bearer`) y devuelve errores sin el formato de Anthropic.
- **En todos**: la calidad del *tool use* depende del modelo, no del formato.

Y al revés: parámetros que la API de Claude ya no acepta, como `temperature`, siguen existiendo en los modelos abiertos. Si tu código los quitó para Claude, puede que quieras volver a ponerlos en local según la *model card*.

## Compatible no es idéntico

Las diferencias que rompen código en producción:

| Área | Qué cambia |
|---|---|
| Campos no soportados | `tool_choice` (Ollama), `logprobs`, `n`, `logit_bias`: unos se ignoran, otros dan error |
| Razonamiento | Llega en campos distintos: `reasoning_content`, `thinking` o `reasoning`, según motor y modelo |
| `usage` | Recuentos aproximados o ausentes en *streaming* (en OpenAI, pide `stream_options.include_usage`) |
| Errores | Códigos y cuerpos distintos; un error en mitad de un *stream* puede llegar como texto |
| Contexto | No hay campo estándar: Ollama lo fija en el Modelfile; vLLM y llama.cpp, al arrancar |
| `max_tokens` | Opcional en OpenAI; si falta, Ollama no pone límite (`num_predict` = -1) |

La regla práctica: escribe una prueba de humo por motor (una llamada simple, una con herramientas, una con esquema) y ejecútala cada vez que actualices el motor o el modelo.

## LiteLLM

[[herramientas/litellm|LiteLLM]] (MIT; 1.106.6, 28 de octubre de 2026) traduce entre el formato OpenAI y más de cien proveedores. Tiene dos caras: un **SDK** que llamas desde Python y un ***proxy*** que despliegas como servicio. Proveedores locales verificados en `litellm.provider_list`: `ollama`, `ollama_chat`, `hosted_vllm`, `vllm`, `lm_studio` y `llamafile`.

### Como SDK

```python title="litellm_sdk.py"
from litellm import completion

LOCAL = "ollama_chat/qwen3.6:27b"          # proveedor/modelo; en la nube: "anthropic/claude-sonnet-5-5"

r = completion(model=LOCAL, api_base="http://localhost:11434", max_tokens=512,
               messages=[{"role": "user", "content": "Resume en una frase: el pedido A-123 salió ayer."}])
print(r.choices[0].message.content)
print(r.usage.prompt_tokens, r.usage.completion_tokens)
```

Ejecutado con LiteLLM 1.83 contra un servidor que imita Ollama. Lo interesante es lo que hizo por debajo: consultó `/api/show` para conocer el modelo y tradujo la llamada a la API nativa, con `max_tokens` convertido en `num_predict`:

```text
El pedido A-123 se envió ayer.
120 18
['/api/show', '/api/show', '/api/chat', '/api/show', '/api/show']
{'model': 'qwen3.6:27b', 'options': {'num_predict': 512}, 'stream': False}
```

Usa `ollama_chat/` (API de chat) y no `ollama/` para conversaciones y herramientas. El SDK expone también `litellm.anthropic.messages` para hablar en formato Anthropic con cualquier proveedor.

### Como pasarela

```yaml title="litellm.yaml"
model_list:
  - model_name: local
    litellm_params:
      model: ollama_chat/qwen3.6:27b
      api_base: http://localhost:11434
  - model_name: local-gpu
    litellm_params:
      model: hosted_vllm/Qwen/Qwen3.6-35B-A3B
      api_base: http://vllm:8000/v1
  - model_name: claude
    litellm_params:
      model: anthropic/claude-sonnet-5-5
      api_key: os.environ/ANTHROPIC_API_KEY
```

```bash
pip install "litellm[proxy]"
litellm --config litellm.yaml      # puerto 4000 por defecto (--port para cambiarlo)
```

El formato de `model_list` y las opciones `--config` y `--port` están comprobados en el paquete instalado; el *proxy* no se ha arrancado en el entorno de prueba. Las aplicaciones usan `http://localhost:4000` con el SDK de OpenAI o de Anthropic y piden `model="local"`, `"local-gpu"` o `"claude"`. El *proxy* enruta también `/v1/messages`, así que agentes de código como Claude Code, Codex u OpenCode pueden ir contra cualquier modelo de la lista.

> [!aviso] Fija la versión de LiteLLM
> LiteLLM publica versiones con mucha frecuencia y es una dependencia con acceso a todas tus claves de API. Fija la versión exacta (y usa hashes en el `requirements.txt`) en lugar de instalar la última.

## Errores típicos

| Síntoma | Causa | Arreglo |
|---|---|---|
| `404` en `/v1/v1/messages` o en `/messages` | `base_url` con o sin `/v1` según el SDK | OpenAI: termina en `/v1`; Anthropic: raíz del servidor |
| `tool_choice` ignorado | El motor no lo implementa (Ollama) | Instrucción en el *prompt* o esquema para el resultado |
| El SDK pide clave | Los SDK la exigen siempre | Cualquier cadena, salvo que el servidor tenga `--api-key` |
| El razonamiento aparece en el texto | El motor no lo separa o falta `--reasoning-parser` | Configura el *parser*; lee el campo de razonamiento del motor |
| Respuestas cortadas o infinitas | `max_tokens` ausente o traducido distinto | Ponlo siempre y comprueba qué llega al servidor |
| LiteLLM llama a un modelo inesperado | Prefijo de proveedor equivocado (`ollama/` frente a `ollama_chat/`) | Revisa el prefijo en `model` |

## Ver también

- [[docs/modelos-abiertos/01-ollama]] y [[docs/modelos-abiertos/02-vllm-y-llama-cpp]]: los motores en detalle.
- [[cursos/agentes-con-modelos-abiertos/06-local-o-api]]: enrutar entre local y API.
- [[patrones/04-enrutado]]: el patrón detrás de la pasarela.
- [[docs/fundamentos/05-versiones-de-api-y-sdks]]: versiones de la API de Claude y sus SDK.
