---
titulo: Servir un modelo abierto con vLLM
descripcion: Arranca vllm serve con tool calling, razonamiento y salidas estructuradas, ciérralo con clave y CORS, ajusta la memoria y compruébalo con el cliente de OpenAI.
creado: 2026-10-29
nivel: intermedio
minutos: 40
tema: produccion
stack: [vLLM, Python]
tags: [vllm, inferencia, modelos-abiertos, tool-calling, open-source]
relacionados: ["[[herramientas/vllm]]", "[[docs/modelos-abiertos/02-vllm-y-llama-cpp]]", "[[cursos/agentes-con-modelos-abiertos/03-servir-modelos-en-produccion]]", "[[modelos/12-inferencia-local]]", "[[problemas/modelo-local-no-llama-herramientas]]"]
---

## Problema

Has probado un modelo de [[glosario/pesos-abiertos|pesos abiertos]] en tu portátil con Ollama y quieres servirlo en una GPU para tu equipo o para un agente en producción. Necesitas un servidor que aguante varias peticiones a la vez, que devuelva las llamadas a herramientas como `tool_calls` y no como texto, y que no quede abierto a cualquiera.

[[herramientas/vllm|vLLM]] (Apache-2.0) es el servidor de referencia para GPU: expone una API compatible con OpenAI y agrupa peticiones en lotes de forma continua. La versión de esta receta es la 0.32.0, del 18 de octubre de 2026 ([notas de versión](https://github.com/vllm-project/vllm/releases/tag/v0.32.0)). Si buscabas TGI: está archivado desde marzo de 2026 ([[radar/2026-10-29-tgi-archivado-y-llama-cpp-semver]]).

## Ingredientes

- Una máquina Linux con GPU y memoria suficiente para el modelo (paso 1).
- Python 3.11 o superior (la 0.32 dejó de admitir la 3.10) y `pip install vllm`.
- La *model card* del modelo que vas a servir: de ahí salen los *flags* de herramientas y razonamiento.
- En tu equipo, `pip install openai` para probarlo.

> [!nota] Qué se ha ejecutado aquí
> En la máquina donde se escribió esta receta no hay GPU, así que `vllm serve` no se ha ejecutado. Los comandos son los de las *model cards* y la documentación de vLLM. El script de prueba sí se ha ejecutado contra un servidor simulado para validar las peticiones que construye; la salida de abajo es de ejemplo.

## Pasos

1. **Haz la cuenta de memoria antes de descargar nada.** Los pesos ocupan aproximadamente *parámetros × bits por peso / 8*. En un modelo de [[glosario/mezcla-de-expertos|mezcla de expertos]] cuentan **todos** los parámetros, no solo los activos: Qwen3.6-35B-A3B activa unos 3B por token, pero en BF16 (16 bits) sus pesos rondan 35 × 16 / 8 = 70 GB (cuenta propia con la fórmula). Encima va la [[glosario/kv-cache|KV cache]], que crece con el contexto y con las peticiones en paralelo. El detalle está en [[modelos/12-inferencia-local]].

2. **Copia los *flags* de la *model card*.** El *tool calling* necesita dos: `--enable-auto-tool-choice` (obligatorio) y `--tool-call-parser` con el *parser* que corresponda al formato del modelo. El razonamiento se separa del texto con `--reasoning-parser`. Ejemplos tal como los publican las *model cards* y la documentación:

```bash
# Qwen3.6-35B-A3B con herramientas y razonamiento
vllm serve Qwen/Qwen3.6-35B-A3B --max-model-len 262144 \
  --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder

# Mistral Small 4 en dos GPU
vllm serve mistralai/Mistral-Small-4-119B-2603 --max-model-len 262144 --tensor-parallel-size 2 \
  --tool-call-parser mistral --enable-auto-tool-choice --reasoning-parser mistral

# gpt-oss-20b
vllm serve openai/gpt-oss-20b --enable-auto-tool-choice --tool-call-parser openai
```

   Si la *model card* no da *parser*, la 0.32 trae uno genérico, `hf`, que lee la plantilla de respuesta del propio *checkpoint* (`--tool-call-parser hf`).

3. **Ajusta contexto y memoria.** `--max-model-len` fija el contexto máximo. Si lo pones por encima de lo que cabe en la memoria que queda tras cargar los pesos, el servidor **no arranca**. Bájalo a lo que de verdad necesitas (un agente suele vivir con mucho menos que el máximo de la *card*) y deja margen con `--gpu-memory-utilization`, porque vLLM no debe contar con toda la VRAM.

4. **Ciérralo antes de exponerlo.** Dos cosas:
   - `--api-key` (o la variable `VLLM_API_KEY`) exige la clave en las rutas `/v1`, `/v2` e `/inference`. La documentación avisa de que otras rutas quedan sin autenticar, así que pon además un *proxy* o una red privada delante ([servidor compatible con OpenAI](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/)).
   - Desde la 0.32 el CORS viene cerrado: ningún origen de navegador puede llamar al servidor. Si tienes una interfaz web, abre solo su origen con `--allowed-origins` (lista JSON; comprueba el formato con `vllm serve --help`).

```bash
export VLLM_API_KEY="cambia-esto"
vllm serve Qwen/Qwen3.6-35B-A3B --max-model-len 65536 --gpu-memory-utilization 0.90 \
  --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder \
  --allowed-origins '["https://interno.tuempresa.es"]'
```

5. **Llámalo con el cliente de OpenAI.** Es el mismo código que usarías contra Ollama cambiando `base_url`. El script prueba las tres cosas que importan a un agente: que el modelo responde, que las herramientas llegan como `tool_calls` y que la salida estructurada cumple el esquema.

```python title="probar_vllm.py"
import json

from openai import OpenAI

BASE_URL = "http://localhost:8000/v1"
MODEL = "Qwen/Qwen3.6-35B-A3B"  # el nombre con el que arrancaste vllm serve

client = OpenAI(base_url=BASE_URL, api_key="EMPTY")  # pon tu clave si arrancaste con --api-key

# 1. El servidor responde y sirve el modelo esperado
print([m.id for m in client.models.list().data])

# 2. Tool calling: la llamada debe llegar en tool_calls, no como texto
TOOLS = [{"type": "function", "function": {
    "name": "buscar_pedido",
    "description": "Devuelve el estado de un pedido a partir de su identificador.",
    "parameters": {"type": "object",
                   "properties": {"pedido_id": {"type": "string", "description": "p. ej. A-123"}},
                   "required": ["pedido_id"]}}}]
r = client.chat.completions.create(
    model=MODEL, max_tokens=1024, tools=TOOLS,
    messages=[{"role": "user", "content": "¿Cómo va mi pedido A-123?"}],
)
msg = r.choices[0].message
print("finish_reason:", r.choices[0].finish_reason)
print("razonamiento:", (getattr(msg, "reasoning", None) or "")[:80])
for call in msg.tool_calls or []:
    print("tool_call:", call.function.name, json.loads(call.function.arguments))
if not msg.tool_calls:
    print("SIN tool_calls. Texto:", msg.content)  # parser equivocado o modelo sin herramientas

# 3. Salida estructurada con JSON Schema, sin razonamiento para esta petición
ESQUEMA = {"type": "object",
           "properties": {"categoria": {"type": "string", "enum": ["facturacion", "envio", "devolucion", "otro"]},
                          "urgente": {"type": "boolean"}},
           "required": ["categoria", "urgente"], "additionalProperties": False}
r = client.chat.completions.create(
    model=MODEL, max_tokens=256,
    messages=[{"role": "user", "content": "Clasifica: 'Me cobrasteis dos veces, lo necesito hoy'"}],
    response_format={"type": "json_schema", "json_schema": {"name": "ticket", "schema": ESQUEMA}},
    extra_body={"chat_template_kwargs": {"enable_thinking": False}},
)
print("ticket:", json.loads(r.choices[0].message.content))  # valida siempre en tu código

# 4. Elegir entre opciones cerradas
r = client.chat.completions.create(
    model=MODEL, max_tokens=16,
    messages=[{"role": "user", "content": "¿El paquete llegó roto? Responde sí o no: 'La caja venía aplastada'"}],
    extra_body={"structured_outputs": {"choice": ["sí", "no"]},
                "chat_template_kwargs": {"enable_thinking": False}},
)
print("choice:", r.choices[0].message.content)
```

Tres detalles del script:

- El razonamiento llega en `message.reasoning`. La documentación de vLLM avisa de que antes se llamaba `reasoning_content` ([salidas de razonamiento](https://docs.vllm.ai/en/latest/features/reasoning_outputs/)); si actualizas desde una versión antigua, revisa ese nombre.
- `chat_template_kwargs: {"enable_thinking": False}` apaga el razonamiento de Qwen solo en esa petición. Otras familias lo controlan con otros nombres (`reasoning_effort`, niveles `low`/`high`…): mira la tabla de [[modelos/11-modelos-abiertos]].
- La salida estructurada es [[glosario/decodificacion-restringida|decodificación restringida]]: el servidor solo deja generar lo que encaja en el esquema. Garantiza la forma, no que el contenido sea correcto.

## Cómo comprobar que funciona

Con el servidor arrancado, ejecuta `python probar_vllm.py`. Lo que debes ver:

```text
# salida de ejemplo
['Qwen/Qwen3.6-35B-A3B']
finish_reason: tool_calls
razonamiento: El usuario pregunta por el pedido A-123; necesito consultar su estado...
tool_call: buscar_pedido {'pedido_id': 'A-123'}
ticket: {'categoria': 'facturacion', 'urgente': True}
choice: sí
```

- **`finish_reason: tool_calls` y una línea `tool_call:`**: el *parser* es el correcto. Si sale «SIN tool_calls» con un JSON dentro del texto, el *parser* no corresponde al modelo (ver [[problemas/modelo-local-no-llama-herramientas]]).
- **`ticket` se parsea** y solo trae las dos claves del esquema.
- **Desde el navegador**, una llamada desde un origen que no está en `--allowed-origins` debe fallar por CORS. Si no falla, lo has dejado abierto.
- **Sin la clave**, `curl http://localhost:8000/v1/models` debe rechazarse si arrancaste con `--api-key`.

Para medir calidad y no solo forma, pasa las mismas [[glosario/evals|evals]] que usas con tu modelo de referencia ([[docs/modelos-abiertos/08-evals-abiertas]]).

## Variaciones

- **Forzar herramientas.** A diferencia de la API de Claude, vLLM acepta `tool_choice` con `auto`, `required`, `none` o una función concreta. Con `required` o una función, usa salidas estructuradas por debajo: garantiza una llamada que se puede parsear, no una buena.
- **API de Anthropic.** vLLM también expone `/v1/messages`, pero con lagunas documentadas en su RFC #58647: ignora `thinking`, descarta `is_error`, no acepta `x-api-key` y los errores no tienen formato Anthropic. Más en [[radar/2026-10-28-apis-anthropic-en-local]] y [[docs/modelos-abiertos/03-apis-compatibles-y-litellm]].
- **Caché de prefijo.** `--enable-prefix-caching` reutiliza el cálculo de prefijos repetidos, como el *prompt* de sistema de un agente.
- **Varios modelos detrás de una URL.** Pon [[herramientas/litellm|LiteLLM]] delante para enrutar entre vLLM, Ollama y APIs comerciales con el mismo cliente.
- **Kubernetes.** KServe (Apache-2.0) sirve modelos en un clúster; vLLM sigue siendo el motor.
- **Alternativas.** SGLang (Apache-2.0) tiene los mismos `--tool-call-parser` y `--reasoning-parser`; [[herramientas/llama-cpp|llama.cpp]] sirve modelos GGUF cuantizados en CPU o GPU modesta.

## Errores típicos

- **Olvidar `--enable-auto-tool-choice`.** La documentación lo marca como obligatorio: sin él, el modo `auto` que usan los agentes no está activo.
- **Elegir el *parser* por intuición.** Que el modelo sea «tipo Qwen» no basta: Qwen 3.6, Nemotron 3 y Granite 4.2 usan `qwen3_coder` según sus *cards*; gpt-oss usa `openai`. Cópialo de la *card*.
- **`--max-model-len` del máximo de la *card* en una GPU que no lo aguanta.** El servidor falla al arrancar. Bájalo.
- **Contar solo los parámetros activos** de un MoE al elegir GPU.
- **Fiarte de `--api-key` como única barrera.** Solo protege algunas rutas: red privada o *proxy* delante.
- **Copiar el muestreo de tu código de Claude.** Los modelos abiertos recomiendan su propio muestreo en la *card* (DeepSeek V4, por ejemplo, temperatura 1.0). Usa el de la *card*, no `temperature=0` por costumbre.
- **Apuntar una interfaz web al servidor tras actualizar a 0.32** y no entender el error: es el CORS cerrado por defecto.
