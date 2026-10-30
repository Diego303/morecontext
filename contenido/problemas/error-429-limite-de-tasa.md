---
titulo: "Error 429: demasiadas peticiones"
descripcion: Qué límite de tasa estás superando cuando la API responde 429, qué reintenta ya el SDK, cómo respetar retry-after y cómo controlar la concurrencia para no vivir en el error.
creado: 2026-10-29
sintoma: "Error 429: demasiadas peticiones"
tema: produccion
nivel: intermedio
tags: [produccion, limites-de-tasa, reintentos, errores]
relacionados: ["[[recetas/reintentos-y-limites-de-tasa]]", "[[docs/produccion/02-costes-y-limites]]", "[[roadmap/100-produccion/06-despliegue]]", "[[problemas/la-cache-no-se-aprovecha]]"]
---

Un proceso por lotes, unas evals en paralelo o un pico de usuarios, y empiezan a fallar las llamadas con un 429. En Python, con los reintentos del SDK agotados, lo ves así (formato real del SDK 2.3.0; el texto de `message` dice qué límite superaste):

```text
anthropic.RateLimitError: Error code: 429 - {'type': 'error', 'error': {'type': 'rate_limit_error', 'message': '…'}}
```

## Causas

La API mide tres límites por clase de modelo: **peticiones por minuto (RPM)**, **tokens de entrada por minuto (ITPM)** y **tokens de salida por minuto (OTPM)**. Superar cualquiera da 429. Se reponen de forma continua (algoritmo de *token bucket*), no se reinician cada minuto ([límites de tasa](https://platform.claude.com/docs/en/api/rate-limits)).

- **Demasiada concurrencia.** Veinte hilos contra un límite pensado para cuatro.
- **Peticiones grandes.** Pocas peticiones con prompts enormes agotan el ITPM antes que el RPM.
- **Un pico brusco.** La documentación avisa de los límites de aceleración: si tu organización sube el uso de golpe, puedes recibir 429 aunque estés por debajo de tus límites nominales.
- **El límite de gasto.** Un 429 con `error.details.error_code` igual a `enforced_spend_limit_reached` no trae `retry-after` y no se arregla reintentando: has llegado al tope de gasto.
- **Reintentar sin esperar.** Tu bucle repite al instante, y cada reintento consume del mismo cubo.

No lo confundas con el **529**: es saturación de la API, no tu límite. El SDK los reintenta igual.

## Cómo confirmarlo

Lee las cabeceras de la respuesta 429 (`e.response.headers`): `retry-after` dice cuántos segundos esperar, y las `anthropic-ratelimit-requests-*`, `anthropic-ratelimit-input-tokens-*` y `anthropic-ratelimit-output-tokens-*` (con `-limit`, `-remaining` y `-reset`) dicen cuál de los tres se agotó. Con `ANTHROPIC_LOG=debug` ves cada reintento del SDK. Si `remaining` de tokens llega a 0 con pocas peticiones, el problema es el tamaño, no el número.

## Arreglo

1. **Deja reintentar al SDK.** Reintenta solo 429, 5xx, 408, 409 y errores de conexión, con *backoff* exponencial y *jitter*, y respeta `retry-after`. Lo comprobé con el simulador del proyecto: con dos 429 con `retry-after: 2` y `max_retries=2`, la llamada termina bien tras 3 peticiones y unos 4 s; con `max_retries=0`, salta el `RateLimitError` a la primera.

```python title="cliente.py"
import anthropic

client = anthropic.Anthropic(max_retries=5, timeout=120.0)   # lotes: más paciencia
rapido = client.with_options(max_retries=1)                   # interfaz: que el usuario no espere minutos
```

2. **Limita la concurrencia.** Es lo que de verdad elimina el 429 sostenido:

```python title="lotes.py"
import asyncio

import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.AsyncAnthropic(max_retries=5)
limite = asyncio.Semaphore(4)                     # como mucho 4 peticiones a la vez


async def resumir(texto: str) -> str:
    async with limite:
        resp = await client.messages.create(
            model=MODEL, max_tokens=300,
            messages=[{"role": "user", "content": f"Resume en una frase:\n\n{texto}"}],
        )
    return "".join(b.text for b in resp.content if b.type == "text")


async def main(textos: list[str]) -> list[str]:
    return await asyncio.gather(*(resumir(t) for t in textos))
```

3. **Si el SDK se rinde en un lote**, captura `anthropic.RateLimitError`, espera más (desde decenas de segundos) y reintenta tú; distingue el 429 de gasto, que no debes reintentar. La capa completa está en [[recetas/reintentos-y-limites-de-tasa]].

## Cómo evitarlo

- **Usa la caché.** En la mayoría de modelos, `cache_read_input_tokens` no cuenta para el ITPM: un prefijo bien cacheado multiplica lo que te cabe por minuto ([[problemas/la-cache-no-se-aprovecha]]).
- Pide `max_tokens` realista: la salida cuenta para el OTPM.
- Sube el tráfico de forma gradual al lanzar algo nuevo.
- Para trabajo que no corre prisa, la API de lotes tiene sus propios límites y es más barata ([[docs/produccion/02-costes-y-limites]]).
- Encola el trabajo y registra cada 429 en tus trazas: un aumento sostenido es la señal de que necesitas más límite o menos concurrencia ([[disciplinas/observabilidad]]).
- Si un agente reintenta un turno entero, no repitas herramientas con efectos (un correo, un pago) que ya se ejecutaron.

## Ver también

- [[recetas/reintentos-y-limites-de-tasa]]
- [[docs/produccion/02-costes-y-limites]]
- [[roadmap/100-produccion/03-latencia]]
- [[glosario/fallback-de-modelo]]
