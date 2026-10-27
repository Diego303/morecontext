---
titulo: "Parámetros: max_tokens, temperatura y compañía"
descripcion: Qué hace cada parámetro de generación (max_tokens, temperature, top_p, stop_sequences, effort), valores de partida razonables y los errores más comunes.
creado: 2026-10-13
orden: 6
tags: [parametros, temperatura, max-tokens, modelos]
relacionados: ["[[glosario/max-tokens]]", "[[glosario/temperatura]]", "[[glosario/top-p]]", "[[glosario/esfuerzo]]"]
---

**Principio**: los parámetros afinan el comportamiento, pero no arreglan un mal prompt; toca pocos, por un motivo concreto y midiendo el efecto.

## Por qué funciona

Los parámetros controlan cómo se genera la respuesta: cuánto puede durar, cuánta variedad hay al elegir cada token, cuándo parar y cuánto razonar. Los valores por defecto están pensados para funcionar bien en la mayoría de los casos. Cambiarlos sin motivo suele empeorar las cosas o no cambiar nada. Cambiarlos con un objetivo concreto (más repetibilidad, cortar en un punto, controlar el gasto) sí ayuda.

## Referencia rápida

| Parámetro | Qué controla | Valor de partida | Cuándo tocarlo |
|---|---|---|---|
| `max_tokens` | Máximo de tokens de salida, razonamiento incluido. Obligatorio. | El doble de lo que esperas que ocupe una respuesta larga. | Siempre: ajústalo a tu tarea. |
| `temperature` | Aleatoriedad al elegir cada token. | El valor por defecto. | Bájalo para tareas que necesitan respuestas repetibles. |
| `top_p` | Elige solo entre los tokens que suman esa probabilidad. | El valor por defecto. | Rara vez. Si lo tocas, deja `temperature` por defecto. |
| `stop_sequences` | Cadenas que detienen la generación. | Ninguna. | Para cortar en una etiqueta de cierre o un separador. |
| `thinking` | Activa el razonamiento adaptativo. | Desactivado en tareas simples. | Tareas con varios pasos de análisis. |
| `output_config.effort` | Cuánto se esfuerza el modelo. | `medium` si usas razonamiento. | Sube en tareas difíciles; baja para ahorrar. |

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

Con razonamiento activado, los tokens de pensamiento también cuentan. Deja margen de sobra o el razonamiento se comerá el espacio de la respuesta.

```diff
- max_tokens=500, thinking={"type": "adaptive"}, output_config={"effort": "high"}
+ max_tokens=16000, thinking={"type": "adaptive"}, output_config={"effort": "high"}
```

## temperature y top_p

La [[glosario/temperatura|temperatura]] regula cuánto se aleja el modelo del token más probable. Más baja, respuestas más parecidas entre ejecuciones; más alta, más variedad. [[glosario/top-p|top_p]] recorta la lista de candidatos a los más probables que sumen esa probabilidad.

Tres cosas que conviene saber:

- **Temperatura baja no garantiza respuestas idénticas.** Reduce la variación, pero dos llamadas iguales pueden diferir. Si necesitas determinismo, cachea respuestas o valida en código.
- **Toca uno, no los dos.** Ajustar `temperature` y `top_p` a la vez hace difícil saber qué produjo el efecto, y algunos modelos no aceptan ambos en la misma petición.
- **Con razonamiento activado hay restricciones** en los parámetros de muestreo. Consulta en la [documentación oficial](https://platform.claude.com/docs) cuáles admite cada modelo.

```text title="Antes"
temperature=0.0 para «que no alucine».
```

```text title="Después"
temperature por defecto. Para reducir invenciones: contexto con las fuentes,
instrucción de responder solo con ellas y de decir «no lo sé» si no está.
```

La temperatura no tiene relación directa con la veracidad. Un modelo con temperatura baja puede inventar algo con mucha consistencia. Contra las [[glosario/alucinacion|alucinaciones]] funciona el [[glosario/grounding|grounding]], no el muestreo.

## stop_sequences

Detienen la generación cuando aparece una cadena. La respuesta trae `stop_reason` igual a `stop_sequence` y en `resp.stop_sequence` cuál se encontró. La cadena de parada no se incluye en el texto.

```python title="stop.py"
# mismos client y MODEL que en el ejemplo anterior
resp = client.messages.create(
    model=MODEL, max_tokens=500,
    stop_sequences=["</respuesta>"],
    messages=[{"role": "user", "content": "Responde dentro de <respuesta></respuesta>: ¿qué es un token?"}],
)
if resp.stop_reason == "stop_sequence":
    texto = resp.content[0].text.split("<respuesta>")[-1].strip()
```

Útil para cortar en cuanto termina la parte que te interesa y no pagar tokens de más. Si lo que quieres es JSON, mejor usa [[modelos/03-formato-y-salidas-estructuradas|salidas estructuradas]].

## effort

El [[glosario/esfuerzo|esfuerzo]] (`output_config={"effort": ...}`) orienta cuánto trabajo pone el modelo, sobre todo en razonamiento: `low`, `medium`, `high`, `xhigh` o `max`, según lo que admita cada modelo. Es orientativo: no limita los tokens como `max_tokens`, pero cambia mucho el gasto típico. Ver [[modelos/04-dejar-pensar-al-modelo]].

## Errores frecuentes

| Error | Consecuencia | Arreglo |
|---|---|---|
| `max_tokens` justo para la respuesta media | Las respuestas largas salen cortadas | Margen amplio y comprobar `stop_reason` |
| Usar `max_tokens` para controlar la longitud | Texto cortado a mitad de frase | Pedir la longitud en el prompt |
| Temperatura 0 «contra alucinaciones» | Falsa seguridad | Grounding y abstención |
| Cambiar varios parámetros a la vez | No sabes qué ayudó | Uno cada vez, medido con evals |
| Effort `max` por defecto | Coste y latencia altos sin mejora | Empezar en `medium` y ajustar |

## Cuándo no aplica

En prototipos y la mayoría de tareas, deja todo por defecto salvo `max_tokens`. Invierte primero en el prompt y en el contexto: suelen tener mucho más efecto que cualquier parámetro.

## Para seguir

- [[roadmap/00-fundamentos/04-primera-llamada-api]]: los parámetros en tu primera llamada.
- [[docs/fundamentos/03-api-de-mensajes]]: la referencia de la petición.
- [[modelos/08-antipatrones]]: más errores frecuentes.
