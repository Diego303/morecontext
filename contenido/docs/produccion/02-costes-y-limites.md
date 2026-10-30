---
titulo: Costes y límites
descripcion: Cómo leer usage, qué palancas reducen el coste (caché, lotes, modelo, contexto) y cómo manejar límites de tasa y errores 429 y 529 con reintentos y backoff.
creado: 2026-10-21
actualizado: 2026-10-29
orden: 2
nivel: intermedio
tags: [produccion, costes, rate-limits, reintentos, prompt-caching]
relacionados: ["[[roadmap/100-produccion/02-costes-y-prompt-caching]]", "[[recetas/reintentos-y-limites-de-tasa]]", "[[docs/contexto/02-prompt-caching]]", "[[glosario/prompt-caching]]"]
---

El coste de un sistema con modelos se mide en **[[glosario/token|tokens]]**: pagas por los tokens que envías (entrada) y por los que el modelo genera (salida), a un precio por millón que depende del modelo. Los límites de tasa son el techo de peticiones y tokens por minuto que te permite el proveedor. Este artículo explica cómo medir el gasto, cómo reducirlo y cómo convivir con esos límites sin que tu sistema se caiga.

> [!nota] Sobre las cifras
> Los precios, los multiplicadores de caché y los límites de tasa cambian y dependen del modelo y de tu cuenta. Aquí no encontrarás cifras. Consúltalas en la [documentación oficial](https://platform.claude.com/docs) y en la consola de tu cuenta.

## Leer usage

Cada respuesta trae un objeto `usage`:

| Campo | Qué cuenta |
|---|---|
| `input_tokens` | Tokens de entrada que no se leyeron ni se escribieron en caché. |
| `cache_creation_input_tokens` | Tokens de entrada que se escribieron en caché en esta petición. Cuestan algo más que la entrada normal. |
| `cache_read_input_tokens` | Tokens de entrada leídos de caché. Cuestan mucho menos que la entrada normal. |
| `output_tokens` | Tokens generados, incluidos los de razonamiento si está activado (el desglose está en `output_tokens_details.thinking_tokens`). Son los más caros. |

`usage` trae además `cache_creation` (separa las escrituras de 5 minutos y de 1 hora), `server_tool_use`, `service_tier`, `speed` e `inference_geo`. Los dos campos de caché pueden venir a `None`, así que trátalos como cero. La entrada total de la petición es la suma de los tres primeros. El coste se calcula multiplicando cada campo por su precio:

```python title="coste.py"
# Rellena PRECIOS con los valores actuales de la documentación oficial (por millón de tokens).
PRECIOS = {"entrada": 0.0, "escritura_cache": 0.0, "lectura_cache": 0.0, "salida": 0.0}

def coste(usage) -> float:
    return (usage.input_tokens * PRECIOS["entrada"]
            + (usage.cache_creation_input_tokens or 0) * PRECIOS["escritura_cache"]
            + (usage.cache_read_input_tokens or 0) * PRECIOS["lectura_cache"]
            + usage.output_tokens * PRECIOS["salida"]) / 1_000_000
```

En un agente, el coste de una tarea es la suma de todas sus llamadas. Ojo con el detalle que más sorprende: **cada vuelta del bucle reenvía el historial completo**. Una tarea de 15 pasos paga la entrada inicial 15 veces, más todo lo que se va acumulando. Por eso el caché es tan importante en agentes.

Para estimar antes de enviar, usa `client.messages.count_tokens(model=MODEL, messages=...)`, que devuelve `.input_tokens` sin generar nada. Con razonamiento adaptativo, el pensamiento se factura como salida y cuenta dentro de `max_tokens`: un `effort` alto en una tarea sencilla es dinero que no compra calidad.

## Palancas para reducir el coste

Ordenadas por la relación entre esfuerzo e impacto habitual:

| Palanca | Cuándo ayuda | Detalle |
|---|---|---|
| [[glosario/prompt-caching]] | Prefijos repetidos: prompt de sistema largo, herramientas, documentos, historial de un agente. | `cache_control` en el último bloque estable. Ver [[docs/contexto/02-prompt-caching]]. |
| Modelo adecuado | Tareas que un modelo más pequeño resuelve igual de bien. | Mide con evals antes de bajar. Ver [[modelos/05-elegir-modelo-por-tarea]]. |
| Procesamiento por lotes | Trabajo que no necesita respuesta inmediata: clasificar miles de documentos, evals nocturnas. | Descuento del 50 % a cambio de esperar. Ver abajo. |
| Contexto más corto | Historiales que crecen sin control, documentos enteros cuando bastaba un fragmento. | Recuperación selectiva, [[glosario/compactacion|compactación]]. |
| Menos salida | Respuestas más largas de lo necesario. | Pide brevedad, ajusta `max_tokens`, baja `effort` si usas razonamiento. |
| Menos pasos | Agentes que dan vueltas. | Mejores descripciones de herramientas, herramientas que devuelven lo justo. |

### Caché en un agente

En un agente, coloca un punto de caché al final de las herramientas y el prompt de sistema, que no cambian, y otro en el último mensaje del historial, que avanza en cada vuelta. Así cada llamada lee de caché todo lo anterior y solo paga entrada normal por lo nuevo. Comprueba que funciona mirando `cache_read_input_tokens` en tus trazas: si sale a cero de forma sistemática, algo del prefijo está cambiando entre llamadas (una fecha, un identificador, el orden de las herramientas).

### Procesamiento por lotes

La API de lotes (*Message Batches*) acepta muchas peticiones a la vez, las procesa de forma asíncrona y te cobra la mitad que la API normal; el descuento se acumula con el de la caché. No es apta para usuarios esperando respuesta; sí para trabajo en segundo plano. No admite `stream` ni el modo rápido (`speed: "fast"`).

```python title="lotes.py"
import time
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

textos = ["Ticket 1…", "Ticket 2…"]
lote = client.messages.batches.create(requests=[
    {"custom_id": f"ticket-{i}",
     "params": {"model": MODEL, "max_tokens": 1024,
                "output_config": {"effort": "low"},
                "messages": [{"role": "user", "content": f"Clasifica: {t}"}]}}
    for i, t in enumerate(textos)
])

while client.messages.batches.retrieve(lote.id).processing_status != "ended":
    time.sleep(60)

for r in client.messages.batches.results(lote.id):
    if r.result.type == "succeeded":
        texto = "".join(b.text for b in r.result.message.content if b.type == "text")
        print(r.custom_id, texto)
    else:
        print(r.custom_id, "falló:", r.result.type)
```

Los resultados pueden llegar en cualquier orden: usa `custom_id` para emparejarlos. El lote se procesa en 24 horas como máximo, admite hasta 100.000 peticiones o 256 MB, y sus resultados se conservan 29 días. Comprueba los límites vigentes en la documentación oficial. Dentro de cada resultado, mira también `stop_reason`: un `max_tokens` demasiado corto da respuestas cortadas sin error.

### Presupuesto por tarea

Además de optimizar, pon un techo. Acumula los tokens de cada llamada dentro del bucle del agente y detén la tarea si supera el presupuesto. Es la diferencia entre una factura alta y un error controlado. Ver [[docs/agentes/01-el-bucle-agentico]].

## Límites de tasa

El proveedor limita cuánto puedes usar por unidad de tiempo, normalmente en peticiones por minuto y en tokens de entrada y de salida por minuto, por modelo. Los límites dependen del nivel de tu cuenta. Las cabeceras de cada respuesta informan de cuánto te queda; consulta sus nombres exactos en la documentación.

Dos errores que tu sistema debe esperar:

| Código | Qué significa | Qué hacer |
|---|---|---|
| **429** | Has superado tu límite de tasa. | Esperar y reintentar. Respeta la cabecera `retry-after` si viene. Si es constante, baja la concurrencia o pide más capacidad. |
| **529** | La API está sobrecargada de forma temporal. No depende de tu cuenta. | Reintentar con *backoff*. Si persiste, degradar con elegancia (mensaje al usuario, cola, modelo alternativo). |
| 500 y similares | Error interno. | Reintentar con *backoff* un número limitado de veces. |
| 400, 401, 403, 404, 413 | Error de tu petición o de tus credenciales. | **No reintentar.** Corregir la petición. |

## Reintentos con backoff exponencial

El SDK oficial ya reintenta automáticamente algunos de estos errores (por defecto, dos veces). Puedes ajustar ese número con `max_retries` al crear el cliente (`anthropic.Anthropic(max_retries=5)`). Si necesitas más control, por ejemplo registrar cada reintento o limitar el tiempo total, desactiva los automáticos con `max_retries=0` y escribe los tuyos:

```python tab="Python" title="reintentos.py"
import random, time
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic(max_retries=0)  # los reintentos los gestionamos aquí
REINTENTABLES = {429, 500, 502, 503, 504, 529}

def crear_con_reintentos(intentos: int = 6, base: float = 1.0, tope: float = 60.0, **kwargs):
    for intento in range(intentos):
        try:
            return client.messages.create(model=MODEL, **kwargs)
        except anthropic.APIStatusError as e:
            if e.status_code not in REINTENTABLES or intento == intentos - 1:
                raise
            espera = e.response.headers.get("retry-after")
            if espera is not None:
                pausa = float(espera)
            else:  # backoff exponencial con jitter completo
                pausa = random.uniform(0, min(tope, base * 2 ** intento))
            time.sleep(pausa)
        except anthropic.APIConnectionError:
            if intento == intentos - 1:
                raise
            time.sleep(random.uniform(0, min(tope, base * 2 ** intento)))
```

```ts tab="TypeScript" title="reintentos.ts"
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5-5";
const client = new Anthropic({ maxRetries: 0 });
const REINTENTABLES = new Set([429, 500, 502, 503, 504, 529]);
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));
const leerRetryAfter = (h: unknown): string | null =>  // las cabeceras cambian de forma según la versión del SDK
  h instanceof Headers ? h.get("retry-after") : ((h as Record<string, string> | undefined)?.["retry-after"] ?? null);

export async function crearConReintentos(
  params: Omit<Anthropic.MessageCreateParamsNonStreaming, "model">, intentos = 6, baseMs = 1000, topeMs = 60_000,
) {
  for (let i = 0; ; i++) {
    try {
      return await client.messages.create({ model: MODEL, ...params });
    } catch (e) {
      const status = e instanceof Anthropic.APIError ? e.status : undefined;
      const reintentable = e instanceof Anthropic.APIConnectionError || (status !== undefined && REINTENTABLES.has(status));
      if (!reintentable || i === intentos - 1) throw e;
      const retryAfter = e instanceof Anthropic.APIError ? leerRetryAfter(e.headers) : null;
      await dormir(retryAfter ? Number(retryAfter) * 1000 : Math.random() * Math.min(topeMs, baseMs * 2 ** i));
    }
  }
}
```

El *jitter* (espera aleatoria entre cero y el tope de cada intento) evita que muchos clientes que fallaron a la vez reintenten a la vez y vuelvan a saturar el servicio.

> [!aviso] Reintentar no es idempotente en un agente
> Reintentar una llamada al modelo es seguro. Reintentar una herramienta que envía un correo o cobra un pago, no. Si una herramienta con efectos puede fallar a medias, usa claves de idempotencia en el servicio que llama.

## Controlar la concurrencia

Con muchos usuarios o [[docs/agentes/02-subagentes|subagentes]] en paralelo, el problema no es un error aislado sino ráfagas. Limita las peticiones simultáneas con un semáforo o una cola, y reparte el tráfico entre modelos si tienes límites separados. Un 429 de vez en cuando es normal; muchos seguidos indican que tu concurrencia supera tu capacidad.

## Con LangChain o un modelo local

`ChatAnthropic` acepta `max_retries` y gestiona los reintentos con el SDK; el coste lo lees en `usage_metadata` de cada `AIMessage`, con los mismos nombres de entrada y salida para cualquier proveedor. Con un modelo local no hay precio por token ni 429 de proveedor, pero sí un techo propio: la memoria de la GPU y la concurrencia que aguante el servidor. La contabilidad de tokens sigue valiendo para dimensionarlo. Ver [[docs/modelos-abiertos/01-ollama]] y [[docs/modelos-abiertos/02-vllm-y-llama-cpp]].

## Errores frecuentes

- **Reintentar errores 400**: la petición seguirá estando mal.
- **Reintentos sin tope**: un servicio caído convierte cada petición en minutos de espera.
- **Sumar solo `input_tokens`**: ignoras la caché y el cálculo de coste sale mal.
- **Optimizar sin medir**: primero registra el coste por tarea; después decide qué palanca tocar.

## Ver también

- [[recetas/reintentos-y-limites-de-tasa]]: la receta paso a paso.
- [[recetas/recortar-costes-con-prompt-caching]]: caché aplicada a un caso real.
- [[docs/produccion/01-observabilidad]]: dónde registrar `usage` y el coste por tarea.
- [[roadmap/00-fundamentos/05-coste-y-latencia]]: el concepto desde la base.
- [[docs/produccion/03-latencia]]: la otra cara de la optimización.
