---
titulo: Dejar pensar al modelo
descripcion: Cómo usar el razonamiento adaptativo y el nivel de esfuerzo, en qué tareas mejora el resultado, en cuáles no y por qué no equivale a pedir explicaciones largas.
creado: 2026-10-11
actualizado: 2026-10-29
orden: 4
tags: [razonamiento, effort, thinking, modelos]
relacionados: ["[[glosario/razonamiento-extendido]]", "[[glosario/esfuerzo]]", "[[docs/prompting/04-razonamiento]]", "[[radar/2026-08-25-razonamiento-adaptativo]]", "[[glosario/modelo-de-razonamiento]]"]
---

**Principio**: en tareas que requieren varios pasos de análisis, deja que el modelo razone antes de responder, y ajusta cuánto razona según la dificultad.

## Por qué funciona

Un modelo genera la respuesta token a token. Si tiene que dar la conclusión en la primera frase, la conclusión se decide sin haber analizado nada. Si antes escribe su análisis, cada paso se apoya en los anteriores. Es la idea de la [[glosario/cadena-de-pensamiento|cadena de pensamiento]] que estudiaron [Wei et al. (2022)](https://arxiv.org/abs/2201.11903) y [Kojima et al. (2022)](https://arxiv.org/abs/2205.11916). Los modelos actuales la integran: pueden razonar en bloques `thinking` separados de la respuesta, sin que tengas que pedirlo en el prompt.

## Razonamiento adaptativo y esfuerzo

En los modelos actuales de Claude (la familia 5.x), el [[glosario/razonamiento-extendido|razonamiento]] es **adaptativo por defecto**: aunque no envíes el campo `thinking`, el modelo decide cuánto pensar según la tarea, poco en preguntas sencillas y más en problemas difíciles. Puedes escribirlo explícito con `thinking={"type": "adaptive"}`. Tú lo regulas con el nivel de [[glosario/esfuerzo|esfuerzo]] en `output_config={"effort": ...}`: `low`, `medium`, `high`, `xhigh` o `max`.

| Modelo | Esfuerzo por defecto | ¿Se puede desactivar el razonamiento? |
|---|---|---|
| `claude-opus-5-5` | `medium` | No |
| `claude-sonnet-5-5` | `high` | No; `{"type": "between_tools"}` quita el razonamiento previo a las herramientas |
| `claude-haiku-5-5` | `medium` | Sí, con `{"type": "disabled"}`, hasta esfuerzo `high` |
| `claude-fable-5-1` | `high` | No |

Datos de octubre de 2026; compruébalos en la [documentación oficial](https://platform.claude.com/docs) cuando cambie la familia.

Por defecto el bloque `thinking` llega **vacío** (`display: "omitted"`): solo trae la firma. Si quieres leer un resumen del razonamiento, pide `display: "summarized"`, como en el ejemplo.

```python tab="Python" title="razonar.py"
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

resp = client.messages.create(
    model=MODEL,
    max_tokens=16000,                     # límite duro: incluye razonamiento y respuesta
    thinking={"type": "adaptive", "display": "summarized"},  # sin display, el bloque llega vacío
    output_config={"effort": "high"},     # orientativo: cuánto se esfuerza
    messages=[{"role": "user", "content": "Tenemos tres almacenes y estos costes de envío… ¿Qué asignación minimiza el coste total?"}],
)

for bloque in resp.content:
    if bloque.type == "thinking":
        print("[razonamiento]", bloque.thinking[:200], "…")
    elif bloque.type == "text":
        print(bloque.text)
print(resp.stop_reason, resp.usage.output_tokens)
```

```ts tab="TypeScript" title="razonar.ts"
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5-5";
const client = new Anthropic();

const resp = await client.messages.create({
  model: MODEL,
  max_tokens: 16000,
  thinking: { type: "adaptive", display: "summarized" },
  output_config: { effort: "high" },
  messages: [{ role: "user", content: "Tenemos tres almacenes y estos costes de envío… ¿Qué asignación minimiza el coste total?" }],
});
for (const b of resp.content) {
  if (b.type === "thinking") console.log("[razonamiento]", b.thinking.slice(0, 200), "…");
  else if (b.type === "text") console.log(b.text);
}
console.log(resp.stop_reason, resp.usage.output_tokens);
```

Dos controles de coste distintos: `max_tokens` es un **límite duro** (la respuesta se corta si se alcanza, con `stop_reason` igual a `max_tokens`), y `effort` es **orientativo** (inclina al modelo a pensar más o menos). Los tokens de razonamiento cuentan como tokens de salida. El modo antiguo, con un presupuesto manual (`{"type": "enabled", "budget_tokens": N}`), **devuelve 400** en todos los modelos 5.x: si migras código que lo usa, cámbialo por `effort`. Para tareas largas existe además, en beta, un presupuesto orientativo por tarea (`output_config.task_budget`, ver [[glosario/presupuesto-de-tarea]]). Con `xhigh` o `max`, la documentación recomienda un `max_tokens` de al menos 64k.

En un agente con herramientas, conserva los bloques `thinking` en el historial tal cual llegaron: el modelo los necesita para continuar su razonamiento entre llamadas. Basta con añadir `resp.content` completo ([[docs/agentes/01-el-bucle-agentico]]).

## Cuándo ayuda

| Tarea | Esfuerzo de partida |
|---|---|
| Clasificar, extraer campos, reformatear | `low` (o sin razonamiento en Haiku 5.5) |
| Responder con documentos, redactar con criterios | `low` o `medium` |
| Depurar código, análisis con varios factores, planificar | `medium` o `high` |
| Matemáticas, lógica, problemas con muchas restricciones | `high` o más |
| Agentes que planifican tareas largas | `high`; mide si un nivel menor basta |

Son puntos de partida. Prueba con tu conjunto de [[glosario/evals|evals]]: sube el esfuerzo si fallan casos difíciles y bájalo mientras la calidad se mantenga.

## Cuándo no aplica

- **Tareas simples**: más razonamiento solo añade latencia y coste. Una clasificación no mejora porque el modelo piense más.
- **Falta de información**: si el dato no está en el contexto, pensar más no lo crea. Arregla el contexto ([[modelos/02-ingenieria-de-contexto]]).
- **Instrucciones ambiguas**: el modelo razonará con detalle hacia el objetivo equivocado. Arregla el prompt.
- **Latencia crítica**: en voz o autocompletado, el tiempo de pensar se nota. Valora un esfuerzo bajo, un modelo que permita desactivarlo o un modelo más rápido ([[modelos/05-elegir-modelo-por-tarea]]).

Regla práctica: en tareas sencillas empieza con esfuerzo `low` y súbelo solo cuando las evals muestren que hace falta. En modelos abiertos, casi todos traen el razonamiento activado por defecto y lo controlan con parámetros distintos por familia: consulta [[modelos/12-inferencia-local]].

## No confundir con pedir explicaciones largas

Activar el razonamiento y pedir «explica tu razonamiento paso a paso en la respuesta» son cosas distintas.

```text title="Antes"
Decide si este contrato tiene cláusulas abusivas.
Explica detalladamente tu razonamiento paso a paso antes de dar la conclusión.
```

```text title="Después"
(con thinking adaptativo y effort "high")
Decide si este contrato tiene cláusulas abusivas.
Responde con la conclusión en una frase y, después, una línea por cláusula problemática
con el número de cláusula y el motivo.
```

En el «antes», el razonamiento se mezcla con la respuesta, la alarga y el usuario tiene que leerlo todo. Además, la documentación de Claude desaconseja pedir el razonamiento paso a paso en la salida: puede disparar rechazos de la categoría `reasoning_extraction` ([[glosario/rechazo]]). En el «después», el modelo piensa en su bloque `thinking` y la respuesta queda limpia; si quieres ver ese razonamiento, usa `display: "summarized"`. Si necesitas justificar la decisión ante una persona, pide una justificación breve en la respuesta: es un requisito de formato, aparte del razonamiento interno.

Con modelos sin razonamiento integrado (o con él desactivado), pedir al modelo que razone en una etiqueta `<analisis>` antes de responder sigue siendo una técnica válida. Luego extraes solo lo que hay fuera de la etiqueta.

## Para seguir

- [[docs/prompting/04-razonamiento]]: referencia técnica.
- [[modelos/06-parametros]]: `max_tokens` y `effort` junto al resto de parámetros.
- [[modelos/05-elegir-modelo-por-tarea]]: a veces es mejor un modelo más capaz con poco esfuerzo que uno pequeño con mucho.
