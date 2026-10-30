---
titulo: "Parámetros: max_tokens, temperatura y compañía"
descripcion: Qué parámetros de generación admite hoy la API de Claude (max_tokens, stop_sequences, thinking, effort) y dónde siguen existiendo temperature y top_p.
creado: 2026-10-13
actualizado: 2026-10-29
orden: 6
tags: [parametros, temperatura, max-tokens, modelos]
relacionados: ["[[glosario/max-tokens]]", "[[glosario/esfuerzo]]", "[[glosario/temperatura]]", "[[docs/fundamentos/05-versiones-de-api-y-sdks]]", "[[modelos/11-modelos-abiertos]]"]
---

**Principio**: los parámetros afinan el comportamiento, pero no arreglan un mal prompt; toca pocos, por un motivo concreto y midiendo el efecto.

## Por qué funciona

Los parámetros controlan cómo se genera la respuesta: cuánto puede durar, cuándo parar y cuánto razona el modelo. Los valores por defecto están pensados para funcionar bien en la mayoría de los casos. Cambiarlos sin motivo suele empeorar las cosas o no cambiar nada. Cambiarlos con un objetivo concreto (cortar en un punto, controlar el gasto, más o menos razonamiento) sí ayuda.

Desde la versión `2026-10-21` de la API de Claude, la lista es más corta que hace un año: los parámetros de muestreo (`temperature`, `top_p`, `top_k`) **ya no existen**. Esta página cuenta qué queda, por qué se quitaron y dónde siguen vivos.

## Referencia rápida

Parámetros de `messages.create` en la API de Claude (SDK `anthropic` 2.x):

| Parámetro | Qué controla | Valor de partida | Cuándo tocarlo |
|---|---|---|---|
| `max_tokens` | Máximo de tokens de salida, razonamiento incluido. Obligatorio. | Holgado: el doble de lo que ocupa una respuesta larga. | Siempre: ajústalo a tu tarea. |
| `stop_sequences` | Cadenas que detienen la generación. | Ninguna. | Para cortar en una etiqueta de cierre o un separador. |
| `thinking` | Cómo razona el modelo. En los 5.x es adaptativo por defecto. | No lo envíes, o `{"type": "adaptive"}`. | `display: "summarized"` para leer el razonamiento. |
| `output_config.effort` | Cuánto trabajo pone el modelo. | El del modelo (`medium` u `high`). | Sube en tareas difíciles; baja para ahorrar. |
| `output_config.format` | Esquema JSON que debe cumplir la respuesta. | Sin esquema. | Cuando un programa lee la salida. |
| `temperature`, `top_p`, `top_k` | Ya no existen en la API de Claude. | No aplica. | Nunca con Claude: el SDK 2.x lanza `TypeError`. |

## max_tokens

[[glosario/max-tokens|max_tokens]] es un **límite duro**. Si el modelo lo alcanza, la respuesta se corta donde esté y `stop_reason` vale `max_tokens`. No es un objetivo de longitud: el modelo no intenta llenarlo ni ajustarse a él. Para controlar la longitud, pídela en el prompt («máximo 100 palabras») y usa `max_tokens` como red de seguridad.

```python title="max_tokens.py"
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

resp = client.messages.create(
    model=MODEL, max_tokens=300,
    messages=[{"role": "user", "content": "Resume el texto en tres frases: …"}],
)
if resp.stop_reason == "max_tokens":
    # la respuesta está incompleta: no la muestres como si estuviera bien
    raise RuntimeError("Respuesta cortada; sube max_tokens o pide algo más corto")
```

Los modelos actuales de Claude razonan por defecto, y los tokens de pensamiento también cuentan dentro de `max_tokens`. Deja margen de sobra o el razonamiento se comerá el espacio de la respuesta. Con esfuerzo `xhigh` o `max`, la documentación recomienda al menos 64k.

```diff
- max_tokens=500, output_config={"effort": "high"}
+ max_tokens=16000, output_config={"effort": "high"}
```

Hay otro caso de corte: si la entrada más `max_tokens` supera la [[glosario/ventana-de-contexto|ventana de contexto]], la API acepta la petición y para con `stop_reason: "model_context_window_exceeded"`. Trátalo como `max_tokens`: la salida está incompleta. Lo detalla [[problemas/respuesta-cortada-por-max-tokens]].

> [!aviso] `max_tokens` en frameworks y servidores locales
> En la API de Claude es obligatorio, pero no en todas partes. `ChatAnthropic` de LangChain, si no lo pasas, usa el máximo del modelo. Ollama genera sin límite por defecto (`num_predict` vale -1). Ponlo siempre de forma explícita.

## temperature y top_p

La [[glosario/temperatura|temperatura]] regula cuánto se aleja el modelo del token más probable al muestrear. [[glosario/top-p|top_p]] recorta la lista de candidatos a los más probables que sumen esa probabilidad, y `top_k` a los *k* más probables.

**En la API de Claude ya no se envían.** Desde la versión `2026-10-21` (la que usan el SDK `anthropic` 2.x y `@anthropic-ai/sdk` 1.x), `temperature`, `top_p` y `top_k` devuelven 400 en cualquier modelo, aunque lleven el valor por defecto. El SDK de Python ni siquiera los acepta como argumento:

```text
TypeError: Messages.create() got an unexpected keyword argument 'temperature'
```

En LangChain, `ChatAnthropic` con `claude-sonnet-5-5` rechaza también cualquier valor no predeterminado con `ValueError`. Si migras código antiguo, bórralos ([[docs/fundamentos/05-versiones-de-api-y-sdks]]).

Para lo que antes se buscaba con temperatura baja, hay herramientas mejores:

- **Formato estable**: [[modelos/03-formato-y-salidas-estructuradas|salidas estructuradas]] con `output_config.format`.
- **Decisiones estables**: rúbricas cerradas con pocas opciones (`enum`), varias muestras y voto ([[patrones/05-paralelizacion]]).
- **Regresiones detectables**: fija el ID del modelo, el esfuerzo y el esquema, y mide con [[glosario/evals|evals]].

```text title="Antes"
temperature=0.0 para «que no alucine».
```

```text title="Después"
Contexto con las fuentes, instrucción de responder solo con ellas
y de decir «no lo sé» si no está. Esquema de salida y evals.
```

La temperatura nunca tuvo relación directa con la veracidad. Un modelo con temperatura baja puede inventar algo con mucha consistencia. Contra las [[glosario/alucinacion|alucinaciones]] funciona el [[glosario/grounding|grounding]], no el muestreo.

### Dónde siguen existiendo

Fuera de la API de Claude, los parámetros de muestreo siguen siendo habituales:

- **Modelos abiertos** (Ollama, vLLM, llama.cpp): `temperature`, `top_p`, `top_k`, `min_p` y `repeat_penalty`. Usa el muestreo que recomienda la *model card* de cada modelo, no un valor copiado de otro: varios modelos de razonamiento recomiendan temperatura 1.0, y bajarla a 0 puede empeorarlos. Lo cuenta [[modelos/11-modelos-abiertos]].
- **Otros proveedores** y los frameworks que hablan con ellos (`ChatOllama(temperature=…)`, `ModelSettings` del OpenAI Agents SDK).
- En Ollama, además, `num_ctx` fija el contexto, y su valor por defecto es pequeño: **trunca el prompt en silencio**. Súbelo ([[modelos/12-inferencia-local]]).

Si tocas el muestreo en esos entornos, toca uno cada vez y mide el efecto.

## stop_sequences

Detienen la generación cuando aparece una cadena. La respuesta trae `stop_reason` igual a `stop_sequence` y en `resp.stop_sequence` cuál se encontró. La cadena de parada no se incluye en el texto.

```python title="stop.py"
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

resp = client.messages.create(
    model=MODEL, max_tokens=500,
    stop_sequences=["</respuesta>"],
    messages=[{"role": "user", "content": "Responde dentro de <respuesta></respuesta>: ¿qué es un token?"}],
)
if resp.stop_reason == "stop_sequence":
    texto = next(b.text for b in resp.content if b.type == "text").split("<respuesta>")[-1].strip()
```

Útil para cortar en cuanto termina la parte que te interesa y no pagar tokens de más. Si lo que quieres es JSON, mejor usa [[modelos/03-formato-y-salidas-estructuradas|salidas estructuradas]].

## thinking y effort

En los modelos 5.x de Claude el [[glosario/razonamiento-extendido|razonamiento]] es **adaptativo por defecto**: el modelo decide cuánto pensar. El presupuesto manual (`{"type": "enabled", "budget_tokens": N}`) devuelve 400 en estos modelos, y en Opus 5.5 y Fable 5.1 el razonamiento no se puede desactivar. Lo que regulas es el [[glosario/esfuerzo|esfuerzo]] (`output_config={"effort": ...}`): `low`, `medium`, `high`, `xhigh` o `max`. El valor por defecto es `medium` en Opus 5.5 y Haiku 5.5, y `high` en Sonnet 5.5 y Fable 5.1.

El esfuerzo es orientativo: no limita los tokens como `max_tokens`, pero cambia mucho el gasto típico. Cambiar el `effort` de nivel superior entre llamadas invalida la caché de la conversación. Todos los detalles, en [[modelos/04-dejar-pensar-al-modelo]].

En modelos abiertos el control del razonamiento cambia de nombre según la familia (`enable_thinking`, `reasoning_effort` con valores como `none` o `max`, `think` en Ollama): consulta la tabla de [[modelos/12-inferencia-local]].

## Otros parámetros que conviene conocer

- `system`: el [[glosario/prompt-de-sistema|prompt de sistema]].
- `tool_choice`: `auto` (por defecto) o `none`. Forzar una herramienta (`any` o `tool`) devuelve 400 en Opus 5.5, Sonnet 5.5 y Fable 5.1: para entregar un resultado estructurado usa `output_config.format` ([[recetas/entregar-resultado-sin-forzar-herramienta]]).
- `cache_control`: [[glosario/prompt-caching|prompt caching]], en un bloque o en el nivel superior.
- `speed` y `service_tier`: modo rápido y prioridad, donde estén disponibles. Consulta modelos y precios en la [documentación oficial](https://platform.claude.com/docs).

## Errores frecuentes

| Error | Consecuencia | Arreglo |
|---|---|---|
| `max_tokens` justo para la respuesta media | Las respuestas largas salen cortadas | Margen amplio y comprobar `stop_reason` |
| Usar `max_tokens` para controlar la longitud | Texto cortado a mitad de frase | Pedir la longitud en el prompt |
| Pasar `temperature` o `top_p` a Claude | `TypeError` en el SDK 2.x, 400 en la API | Quitarlos; salidas estructuradas y evals |
| `budget_tokens` en un modelo 5.x | 400 | Razonamiento adaptativo y `effort` |
| Temperatura 0 en un modelo abierto de razonamiento | Peor calidad que con el valor de la *model card* | Muestreo recomendado por la card |
| Effort `max` por defecto | Coste y latencia altos sin mejora | Empezar por el valor del modelo y ajustar con evals |

## Cuándo no aplica

En prototipos y la mayoría de tareas, deja todo por defecto salvo `max_tokens`. Invierte primero en el prompt y en el contexto: suelen tener mucho más efecto que cualquier parámetro.

## Para seguir

- [[roadmap/00-fundamentos/04-primera-llamada-api]]: los parámetros en tu primera llamada.
- [[docs/fundamentos/03-api-de-mensajes]]: la referencia de la petición.
- [[docs/fundamentos/06-motivos-de-parada-y-rechazos]]: cada `stop_reason` y qué hacer con él.
- [[modelos/08-antipatrones]]: más errores frecuentes.
