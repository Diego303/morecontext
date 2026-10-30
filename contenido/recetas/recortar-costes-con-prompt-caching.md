---
titulo: Recortar costes con prompt caching
descripcion: Cachea la parte fija de tus peticiones (sistema, herramientas, documentos) con cache_control y comprueba con usage cuántos tokens se leen de caché.
creado: 2026-09-17
actualizado: 2026-10-29
nivel: inicial
minutos: 15
tema: produccion
stack: [python, anthropic]
tags: [costes, prompt-caching, produccion]
relacionados: ["[[docs/contexto/02-prompt-caching]]", "[[roadmap/100-produccion/02-costes-y-prompt-caching]]", "[[glosario/prompt-caching]]", "[[radar/2026-07-21-prompt-caching-palanca-de-coste]]"]
---

## Problema

Tu asistente envía en cada petición el mismo prompt de sistema largo, las mismas definiciones de herramientas o el mismo manual de 5 000 [[glosario/token|tokens]]. Pagas esos tokens de entrada una y otra vez, y además el modelo tarda más en empezar a responder.

Con [[glosario/prompt-caching|prompt caching]] la API guarda ese prefijo común. Las siguientes peticiones que empiezan igual lo leen de caché, que cuesta mucho menos que la entrada normal y suele reducir la [[glosario/latencia|latencia]].

## Ingredientes

- Python 3.10 o superior.
- `pip install "anthropic>=2"` (SDK 2.x).
- La variable de entorno `ANTHROPIC_API_KEY`.
- Un texto largo y estable para el contexto (`manual.md`). Tiene que superar el mínimo de tokens cacheables: 512 en los modelos actuales (oct. 2026), más en algunos anteriores. Compruébalo en la [documentación oficial](https://platform.claude.com/docs).

## Pasos

1. **Ordena la petición: lo fijo delante, lo variable detrás.** El caché funciona por prefijo en este orden: `tools` → `system` → `messages`. Si cambias algo, se invalida esa parte y todo lo posterior. Un detalle tan pequeño como meter la fecha y hora al principio del sistema rompe el caché en cada llamada.

2. **Marca el final del prefijo con `cache_control`.** Se pone en el último bloque que quieres cachear. Puedes poner hasta 4 puntos de corte por petición; si además usas la caché automática (ver Variaciones), ocupa uno de los cuatro.

3. **Mide con `usage`.** Cada respuesta trae tres contadores de entrada:
   - `cache_creation_input_tokens`: tokens escritos en caché en esta llamada (cuestan algo más que la entrada normal);
   - `cache_read_input_tokens`: tokens leídos de caché (cuestan mucho menos);
   - `input_tokens`: los que van después del último punto de corte y no se cachean.

```python title="cache.py"
from pathlib import Path

import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

MANUAL = Path("manual.md").read_text(encoding="utf-8")

# lo estable va delante; el punto de corte marca hasta dónde se cachea
SISTEMA = [
    {"type": "text", "text": "Eres el asistente de soporte de Acme. Responde solo con información del manual."},
    {"type": "text", "text": f"<manual>\n{MANUAL}\n</manual>", "cache_control": {"type": "ephemeral"}},
]


def preguntar(pregunta: str) -> str:
    resp = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SISTEMA,
        messages=[{"role": "user", "content": pregunta}],
    )
    u = resp.usage
    escritos = u.cache_creation_input_tokens or 0
    leidos = u.cache_read_input_tokens or 0
    total = u.input_tokens + escritos + leidos
    print(
        f"entrada total {total:>6} | escritos en caché {escritos:>6} | "
        f"leídos de caché {leidos:>6} ({leidos / total:.0%}) | sin caché {u.input_tokens:>4} | "
        f"salida {u.output_tokens}"
    )
    return next(b.text for b in resp.content if b.type == "text")


if __name__ == "__main__":
    n = client.messages.count_tokens(
        model=MODEL, system=SISTEMA, messages=[{"role": "user", "content": "hola"}]
    ).input_tokens
    print(f"El prefijo ocupa unos {n} tokens")
    for p in ["¿Cómo reseteo el router?", "¿Qué significa la luz roja?", "¿Cuánto dura la garantía?"]:
        preguntar(p)
```

4. **Ejecuta y mira los números**: `python cache.py`. La primera llamada escribe en caché. Las siguientes, si llegan dentro del tiempo de vida, leen.

## Cómo comprobar que funciona

```text
# salida de ejemplo
El prefijo ocupa unos 5220 tokens
entrada total   5224 | escritos en caché   5210 | leídos de caché      0 (0%) | sin caché   14 | salida 120
entrada total   5225 | escritos en caché      0 | leídos de caché   5210 (100%) | sin caché   15 | salida 98
entrada total   5223 | escritos en caché      0 | leídos de caché   5210 (100%) | sin caché   13 | salida 98
```

- A partir de la segunda llamada, `cache_read_input_tokens` debe ser casi toda la entrada.
- Si `escritos` y `leídos` son 0 siempre, el prefijo no llega al mínimo cacheable del modelo o algo cambia entre llamadas.
- Si cada llamada vuelve a escribir, busca lo que cambia en el prefijo: una fecha, un id de sesión, herramientas en distinto orden, un JSON serializado con claves en orden variable.
- Para estimar el ahorro, multiplica cada contador por su precio. Los precios y multiplicadores cambian: tómalos de la página de precios oficial, no los fijes en el código.
- En producción, registra estos tres contadores en tus trazas ([[disciplinas/observabilidad]]) y vigila la proporción leída.

## Variaciones

- **Caché automática.** En lugar de marcar bloques, pasa `cache_control={"type": "ephemeral"}` en el nivel superior de `messages.create`. La API coloca el punto de corte por ti. Es lo más sencillo en conversaciones que crecen.
- **Conversaciones largas.** Pon `cache_control` también en el último bloque del último mensaje de usuario. En cada turno se lee de caché toda la conversación anterior y solo se paga entero el turno nuevo.
- **Herramientas.** Si tienes muchas definiciones, pon `cache_control` en la última herramienta de la lista. Van primero en el prefijo, así que se aprovechan en todas las llamadas.
- **TTL de una hora.** El tiempo de vida por defecto es de 5 minutos y se renueva con cada uso. Si tus llamadas están más espaciadas, usa `{"type": "ephemeral", "ttl": "1h"}`. Escribir con TTL largo cuesta más: compensa solo si se reutiliza.
- **Con LangChain.** En un agente de `create_agent`, `AnthropicPromptCachingMiddleware` (de `langchain-anthropic`) añade `cache_control` por ti: en el bloque `system` y en el nivel superior de la petición (caché automática). Pasa siempre `max_tokens`: sin él, `ChatAnthropic` pide el máximo del modelo. Los contadores llegan en `usage_metadata` de cada `AIMessage`.

```python title="cache_langchain.py"
from pathlib import Path

from langchain.agents import create_agent
from langchain_anthropic import ChatAnthropic
from langchain_anthropic.middleware import AnthropicPromptCachingMiddleware

MODEL = "claude-sonnet-5-5"
MANUAL = Path("manual.md").read_text(encoding="utf-8")

agente = create_agent(
    ChatAnthropic(model=MODEL, max_tokens=1024),
    tools=[],
    system_prompt=f"Eres el asistente de soporte de Acme. Responde solo con el manual.\n<manual>\n{MANUAL}\n</manual>",
    middleware=[AnthropicPromptCachingMiddleware(ttl="5m")],  # marca el prefijo con cache_control
)

r = agente.invoke({"messages": [("user", "¿Cómo reseteo el router?")]})
print(r["messages"][-1].usage_metadata)
```

- **Procesos por lotes.** En evals y procesos que repiten el mismo prompt con entradas distintas, todas las llamadas comparten prefijo ([[recetas/evals-de-regresion-en-ci]]).

## Errores típicos

- **Poner lo variable delante.** La pregunta del usuario, la fecha o el nombre del cliente al principio del sistema invalidan todo lo que viene detrás.
- **Prefijo por debajo del mínimo.** No da error: simplemente no cachea. Compruébalo con `count_tokens` y con `usage`.
- **Medir el ahorro sin mirar `usage`.** Confiar en que «debería estar cacheando» no basta. Si `cache_read_input_tokens` es 0, no lo está.
- **Llamadas demasiado espaciadas.** Con más de 5 minutos entre llamadas y TTL por defecto, cada una escribe en caché y ninguna lee: pagas más que sin caché.
- **Cambiar herramientas sobre la marcha.** Añadir o quitar una herramienta invalida todo el caché, porque van primero en el prefijo.
- **Adivinar por qué falla.** La API puede decirte qué rompió la caché respecto a una petición anterior (`diagnostics`, GA): lo explica [[recetas/diagnosticar-fallos-de-cache]], y las causas habituales están en [[problemas/la-cache-no-se-aprovecha]].
- **Copiar multiplicadores de precio en el código.** Cambian. Léelos de la documentación cuando calcules costes ([[docs/produccion/02-costes-y-limites]]).
