---
titulo: Reintentos y límites de tasa
descripcion: Qué reintenta ya el SDK por ti ante errores 429 y 529, cómo ajustar max_retries y cómo añadir una capa de backoff y control de concurrencia para trabajos por lotes.
creado: 2026-09-24
nivel: inicial
minutos: 15
tema: produccion
stack: [python, anthropic]
tags: [produccion, errores, limites-de-tasa]
relacionados: ["[[docs/produccion/02-costes-y-limites]]", "[[roadmap/100-produccion/06-despliegue]]", "[[disciplinas/observabilidad]]", "[[recetas/evals-de-regresion-en-ci]]"]
---

## Problema

Lanzas un proceso que hace cientos de llamadas (resumir documentos, ejecutar evals, reprocesar tickets) y a mitad empiezan los errores: `429 Too Many Requests` porque superas tu límite de tasa, o `529 Overloaded` porque la API está saturada en ese momento. El script se cae y pierdes el trabajo hecho.

Antes de escribir tu propio bucle de reintentos, conviene saber qué hace ya el SDK por ti.

## Ingredientes

- Python 3.10 o superior.
- `pip install anthropic`
- La variable de entorno `ANTHROPIC_API_KEY`.
- Conocer tus límites de tasa: están en la consola de tu cuenta y dependen de tu nivel de uso ([documentación oficial](https://platform.claude.com/docs)).

## Pasos

1. **Entiende lo que el SDK ya hace.** El cliente oficial reintenta automáticamente, **2 veces por defecto**, los errores de conexión, los *timeouts* y las respuestas 408, 409, 429 y 5xx (incluido el 529). Espera entre intentos con *backoff* exponencial y algo de aleatoriedad (*jitter*), y si la respuesta trae la cabecera `retry-after`, espera lo que indica. Para una aplicación interactiva, esto suele bastar.

2. **Ajusta `max_retries` y `timeout` según el uso.** En un proceso por lotes puedes permitirte esperar más. En una interfaz donde un usuario espera, menos.

```python title="config.py"
import anthropic

# proceso por lotes: más paciencia
client = anthropic.Anthropic(max_retries=5, timeout=120.0)

# una llamada concreta con otra política, sin crear otro cliente
rapido = client.with_options(max_retries=1, timeout=20.0)

# desactivar los reintentos del SDK si los gestionas tú
sin_reintentos = anthropic.Anthropic(max_retries=0)
```

3. **Añade una capa propia solo para lotes.** Si el SDK agota sus reintentos, tu proceso no debería morir: espera más tiempo y vuelve a intentarlo. Distingue lo transitorio (429, 5xx, conexión) de lo que no se arregla reintentando (400, 401, 403, 404, 413). El SDK cubre los picos cortos; tu capa espera más (desde 10 s) solo cuando el SDK se rinde.

4. **Limita la concurrencia.** El reintento cura los picos, pero si lanzas 50 hilos contra un límite pensado para menos, vivirás en el 429. Un `ThreadPoolExecutor` con pocos trabajadores es el control más simple.

```python title="reintentos.py"
import logging
import random
import time
from concurrent.futures import ThreadPoolExecutor

import anthropic

MODEL = "claude-sonnet-5-5"
logging.basicConfig(level=logging.WARNING)
log = logging.getLogger("lotes")

# 1. El SDK ya reintenta con backoff exponencial. Para lotes, dale más margen.
client = anthropic.Anthropic(max_retries=5, timeout=120.0)

REINTENTABLES = {429, 500, 502, 503, 504, 529}


def _espera(retry_after: str | None, base: float, intento: int) -> float:
    if retry_after:
        try:
            return float(retry_after)  # el servidor sabe cuándo habrá hueco
        except ValueError:
            pass
    return base * 2**intento * random.uniform(0.5, 1.0)  # exponencial con jitter


def crear_con_paciencia(intentos: int = 4, base: float = 10.0, **kwargs):
    """2. Capa extra para trabajos por lotes: si el SDK agota sus reintentos, espera más y repite."""
    for intento in range(intentos):
        try:
            return client.messages.create(**kwargs)
        except anthropic.APIStatusError as e:
            if e.status_code not in REINTENTABLES or intento == intentos - 1:
                raise  # 400, 401, 403, 413…: reintentar no lo arregla
            espera = _espera(e.response.headers.get("retry-after"), base, intento)
            log.warning("HTTP %s, reintento %d en %.1f s", e.status_code, intento + 1, espera)
        except anthropic.APIConnectionError:
            if intento == intentos - 1:
                raise
            espera = _espera(None, base, intento)
            log.warning("Error de conexión, reintento %d en %.1f s", intento + 1, espera)
        time.sleep(espera)


def resumir(texto: str) -> str:
    resp = crear_con_paciencia(
        model=MODEL,
        max_tokens=300,
        messages=[{"role": "user", "content": f"Resume en una frase:\n\n{texto}"}],
    )
    return next(b.text for b in resp.content if b.type == "text")


if __name__ == "__main__":
    textos = [f"Texto de ejemplo número {i}." for i in range(20)]
    # 3. Limita la concurrencia: 20 hilos contra un límite de tasa solo generan más 429
    with ThreadPoolExecutor(max_workers=4) as pool:
        for i, resumen in enumerate(pool.map(resumir, textos)):
            print(i, resumen)
```

## Cómo comprobar que funciona

- **Mira los reintentos del SDK.** Ejecuta con `ANTHROPIC_LOG=debug python reintentos.py` y verás cada petición y cada reintento.
- **Fuerza errores.** Pon `max_workers=50` y observa los avisos `HTTP 429, reintento…`: el proceso debe terminar igualmente, solo que más despacio.
- **Comprueba que no reintenta lo que no debe.** Cambia `MODEL` por un nombre inexistente: debe fallar a la primera, sin esperas.

```text
# salida de ejemplo
WARNING:lotes:HTTP 429, reintento 1 en 7.3 s
WARNING:lotes:HTTP 529, reintento 2 en 14.8 s
0 El texto número 0 es un ejemplo breve.
1 ...
```

## Variaciones

- **Asíncrono.** Con `anthropic.AsyncAnthropic` y `asyncio.Semaphore(4)` para limitar la concurrencia. Los reintentos automáticos funcionan igual.
- **Guardar progreso.** En lotes largos, escribe cada resultado en disco nada más obtenerlo y salta los ya hechos al reanudar. Un fallo definitivo no debe obligarte a repetir lo que ya pagaste.
- **API de lotes.** Si no necesitas la respuesta al momento, la API ofrece procesamiento por lotes asíncrono con condiciones propias de precio y plazo. Consulta la [documentación oficial](https://platform.claude.com/docs).
- **Modelo de reserva.** Ante 529 persistentes en tareas no críticas, puedes caer a otro modelo. Hazlo explícito en tus trazas para no mezclar resultados sin saberlo.
- **Respuestas en streaming.** Si el error llega a mitad de un streaming, el SDK no puede reintentar lo ya emitido. Decide si reintentas la petición entera ([[recetas/streaming-de-respuestas]]).

## Errores típicos

- **Apilar reintentos sin hacer la cuenta.** Los intentos se multiplican: en esta receta, 4 intentos de tu capa por 6 del SDK (1 + `max_retries=5`) dan hasta 24 peticiones. Es aceptable en un lote nocturno y un disparate en una interfaz. En una aplicación interactiva, deja que reintente solo el SDK.
- **Reintentar errores 400.** Una petición mal formada falla igual la décima vez. Corrige la petición.
- **Backoff sin jitter.** Si todos tus hilos reintentan exactamente a la vez, chocan otra vez a la vez.
- **Ignorar `retry-after`.** El servidor te dice cuándo volver. Esperar menos solo produce otro 429.
- **Reintentar acciones con efectos.** Si tu agente ejecutó una herramienta que envía un correo y luego falla la llamada al modelo, repetir el turno entero puede enviarlo dos veces. Separa la ejecución de herramientas del reintento de la llamada.
- **No registrar los reintentos.** Un aumento de 429 es una señal temprana de que necesitas más límite o menos concurrencia ([[disciplinas/observabilidad]]).
