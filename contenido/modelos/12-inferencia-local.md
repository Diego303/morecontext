---
titulo: "Inferencia local: memoria, cuantización y contexto"
descripcion: Cómo calcular si un modelo abierto cabe en tu máquina (pesos, KV cache y margen), qué cuantización elegir, por qué num_ctx trunca en silencio y cómo controlar el razonamiento.
creado: 2026-10-29
orden: 12
tags: [modelos-abiertos, inferencia-local, cuantizacion, kv-cache, ollama, memoria]
relacionados: ["[[glosario/cuantizacion]]", "[[glosario/kv-cache]]", "[[modelos/11-modelos-abiertos]]", "[[docs/modelos-abiertos/01-ollama]]"]
---

**Principio**: antes de descargar un modelo, haz la cuenta de memoria (pesos más KV cache más margen) con el contexto que de verdad vas a usar, y fija ese contexto tú; el valor por defecto casi nunca es el que necesitas.

## Por qué funciona

Un modelo local tiene que caber entero en la memoria de la GPU (o repartirse con la RAM, mucho más lenta). Lo que ocupa tiene tres partes, y las tres se pueden calcular antes de bajar nada:

1. **Pesos** ≈ parámetros × bits por peso / 8.
2. **[[glosario/kv-cache|KV cache]]**: las claves y valores de atención de cada token del contexto, que crecen con la longitud y con los usuarios en paralelo.
3. **Margen**: activaciones, el propio motor y lo que la GPU no deja usar. Cuenta 1–2 GB y no planifiques con el 100 % de la VRAM (esto es una regla orientativa, no una cifra publicada).

La fórmula de los pesos es la de NVIDIA en su [guía de optimización de inferencia](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/) («7B * sizeof(FP16) ~= 14 GB») y cuadra con lo que anuncia Ollama: para Qwen3.6-27B en Q4_K_M, 27 000 M × 4,89 bits / 8 ≈ 16,5 GB calculados frente a 17 GB en su biblioteca; en Q8_0, 28,7 frente a 30 GB; en BF16, 54 frente a 56 GB. La diferencia son la parte de visión, la tabla de embeddings y los metadatos.

## Cuantización: bits por peso

La [[glosario/cuantizacion|cuantización]] guarda cada peso con menos bits. Los formatos de llama.cpp, que usa Ollama en ficheros [[glosario/gguf|GGUF]], no son enteros exactos porque mezclan bloques con escalas. Bits por peso medidos en Llama-3.1-8B según el [README de `llama-quantize`](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md):

| Formato | Bits por peso | 27B ocupa (solo pesos) | Cuándo |
|---|---|---|---|
| IQ4_XS | 4,46 | ≈ 15,1 GB | Te falta poco para que quepa |
| **Q4_K_M** | 4,89 | ≈ 16,5 GB | Punto de partida habitual; el que descarga llama.cpp por defecto con `-hf` |
| Q5_K_M | 5,70 | ≈ 19,2 GB | Te sobra memoria y quieres algo más de calidad |
| Q6_K | 6,56 | ≈ 22,1 GB | Cerca de Q8 con menos memoria |
| Q8_0 | 8,50 | ≈ 28,7 GB | Calidad casi sin pérdida |
| F16 | 16,0 | ≈ 54 GB | Referencia; rara vez en local |

Cuánta calidad pierde cada formato depende del modelo y de la tarea: mídelo con tus evals, no con la tabla.

## La calculadora

```python title="memoria.py"
BPW = {"Q4_K_M": 4.89, "Q5_K_M": 5.70, "Q6_K": 6.56, "Q8_0": 8.50, "F16": 16.0}  # bits por peso (llama.cpp)

def pesos_gb(parametros: float, cuant: str) -> float:
    """Memoria de los pesos: parámetros × bits por peso / 8 (en GB decimales)."""
    return parametros * BPW[cuant] / 8 / 1e9

def kv_cache_gb(capas: int, kv_heads: int, head_dim: int, tokens: int,
                bytes_por_valor: int = 2, usuarios: int = 1) -> float:
    """2 (K y V) × capas × kv_heads × head_dim × bytes, por cada token de contexto."""
    return 2 * capas * kv_heads * head_dim * bytes_por_valor * tokens * usuarios / 1e9

for q in ("Q4_K_M", "Q8_0", "F16"):
    print(f"27B en {q:7}: {pesos_gb(27e9, q):5.1f} GB de pesos")

# Llama 2 7B (32 capas, 32 cabezas de 128 dim, sin GQA), 4096 tokens en FP16
print(f"KV cache Llama 2 7B, 4096 tokens: {kv_cache_gb(32, 32, 128, 4096):.2f} GB")
print(f"Lo mismo con 4 usuarios en paralelo: {kv_cache_gb(32, 32, 128, 4096, usuarios=4):.2f} GB")
```

```text
27B en Q4_K_M :  16.5 GB de pesos
27B en Q8_0   :  28.7 GB de pesos
27B en F16    :  54.0 GB de pesos
KV cache Llama 2 7B, 4096 tokens: 2.15 GB
Lo mismo con 4 usuarios en paralelo: 8.59 GB
```

El caso de Llama 2 7B es el que calcula NVIDIA (unos 2 GB). Para un modelo actual, saca `num_hidden_layers`, `num_key_value_heads` y la dimensión de cabeza del `config.json` del repositorio: con atención agrupada (GQA) las cabezas de clave y valor son muchas menos que las totales, y el KV cache baja en proporción. Los modelos híbridos (Qwen 3.5/3.6 intercalan capas de atención con otras que no la usan; Nemotron 3 intercala Mamba-2) solo acumulan KV cache en las capas de atención. Y recuerda multiplicar por los usuarios: con `OLLAMA_NUM_PARALLEL=4`, el contexto se reserva cuatro veces.

## MoE: se cargan todos los parámetros

En un modelo de [[glosario/mezcla-de-expertos|mezcla de expertos]] (MoE), cada token pasa solo por unos pocos expertos: el coste de cálculo depende de los parámetros **activos**. Pero todos los expertos tienen que estar en memoria, así que **la memoria depende de los totales**. Qwen3.6-35B-A3B activa unos 3B por token y ocupa 24 GB en Q4_K_M en Ollama, no 2.

```text title="Antes"
«Qwen3.6-35B-A3B solo usa 3B: me cabe en una GPU de 8 GB.»
```

```text title="Después"
35B totales × 4,89 / 8 ≈ 21 GB de pesos, más KV cache y margen.
Necesito unos 24 GB, o dejar expertos en la RAM de la CPU
(llama.cpp 0.7 lo permite con --moe-cache-mib) y aceptar que irá más lento.
```

La ventaja de un MoE en local es la velocidad por token a igual memoria, no la memoria.

## num_ctx y el truncado silencioso

La ventana que usa el motor no es la que anuncia el modelo: es la que tú configuras. En Ollama se llama `num_ctx`, y su valor por defecto es pequeño. Su propia documentación se contradice (la página de *Context length* lo hace depender de la VRAM: 4k con menos de 24 GiB, 32k entre 24 y 48, 256k por encima; la FAQ dice 4096; la referencia del Modelfile, 2048). Si el prompt no cabe, Ollama **recorta el principio sin dar error**. En un agente, el principio es el prompt de sistema y las herramientas: el modelo deja de saber qué es y qué puede hacer.

```text title="Antes"
ollama run qwen3.6:27b   → el agente «olvida» sus herramientas a partir del tercer paso.
```

```text title="Después"
OLLAMA_CONTEXT_LENGTH=65536 ollama serve     (o options={"num_ctx": 65536} por petición)
ollama ps                                    → columna CONTEXT: 65536
```

Cómo fijarlo según la API que uses:

- **API nativa**: `options={"num_ctx": 32768}` en cada petición.
- **API compatible con OpenAI** (`/v1`): no tiene campo de contexto. Usa la variable del servidor o crea un modelo con un Modelfile (`PARAMETER num_ctx 65536`) y `ollama create`.
- **Comprobación**: `ollama ps` (columnas `CONTEXT` y `PROCESSOR`) o, desde Python, `ollama.ps()`, cuyos modelos traen `context_length`, `size` y `size_vram`. Si `PROCESSOR` muestra parte en CPU, no cabe en la GPU y va a ir lento.

Para agentes, Ollama recomienda **al menos 64 000 tokens**. Dos ajustes más: `num_predict` vale -1 (sin límite) por defecto, así que pon siempre `max_tokens` o `num_predict`; y `OLLAMA_KV_CACHE_TYPE=q8_0` (requiere `OLLAMA_FLASH_ATTENTION=1`) reduce la memoria del KV cache, mientras que `q4_0` ahorra más pero empeora la calidad, y la documentación de llama.cpp avisa de que degrada el *tool calling*.

## Razonamiento por defecto

Casi todos los modelos abiertos actuales traen el razonamiento **activado por defecto**, y los tokens de pensamiento salen del mismo `max_tokens`: un clasificador que «no responde» a menudo ha gastado todo el presupuesto pensando. Cada familia lo controla con un parámetro distinto:

| Familia | Cómo se apaga o regula |
|---|---|
| Qwen 3.5 / 3.6 | `chat_template_kwargs: {"enable_thinking": false}` |
| Qwen 3.8 | además `reasoning_effort` = `xhigh` (defecto) / `medium` / `low` |
| Mistral Small 4 | `reasoning_effort` = `"none"` / `"high"` |
| Mistral Large 4 | `low` / `medium` / `high`; no se puede desactivar |
| Kimi K3 | siempre activo; `low` / `high` / `max` (defecto `max`) |
| GLM-5.3 | `low` / `high` / `max` (defecto `max`) |
| gpt-oss | `low` / `medium` / `high` (en el prompt de sistema o `reasoning_effort`) |
| Gemma 4 | `<\|think\|>` en el prompt de sistema o `enable_thinking=True` |
| Ollama (cualquiera) | `think=True / False / "low"…`; los valores admitidos salen en `/api/show` → `thinking.values` |

Con el cliente `ollama`, `think=False` y un contexto explícito en la misma llamada:

```python title="ollama_contexto.py"
from ollama import chat

MODEL = "qwen3.6:27b"

r = chat(model=MODEL,
         messages=[{"role": "user", "content": "Clasifica: 'Me cobrasteis dos veces'. Responde con una palabra."}],
         think=False,                                       # sin razonamiento para una tarea simple
         options={"num_ctx": 32768, "num_predict": 256})    # contexto y tope de salida explícitos
print(r.message.content)
```

Firma comprobada con el cliente `ollama` 0.6.3; necesita un servidor en marcha. El muestreo también cambia: usa el que recomienda la *model card* (DeepSeek V4 pide temperatura 1.0) y no copies valores pensados para otro modelo. Detalle por familia en [[modelos/11-modelos-abiertos]] y [[modelos/06-parametros]].

## Cuándo no aplica

- **Si usas una API** (Claude u otro proveedor), nada de esto es tu problema: la memoria, la cuantización y el contexto los gestiona el proveedor, y el razonamiento se regula con `effort`.
- **Si sirves con vLLM en GPU de servidor**, la cuenta de pesos y KV cache es la misma, pero el motor reserva memoria con `--gpu-memory-utilization` y limita el contexto con `--max-model-len`: ver [[docs/modelos-abiertos/02-vllm-y-llama-cpp]].
- **Si el modelo no pasa tus evals**, caber en memoria no sirve de nada. Decide primero si lo local tiene sentido: [[cursos/agentes-con-modelos-abiertos/06-local-o-api]].

## Para seguir

- [[docs/modelos-abiertos/01-ollama]]: comandos, variables y Modelfile.
- [[recetas/agente-local-con-ollama]]: un agente con herramientas en local, con `num_ctx` bien puesto.
- [[problemas/modelo-local-no-llama-herramientas]]: cuando el contexto o la plantilla fallan.
- [[glosario/inferencia-local]]
