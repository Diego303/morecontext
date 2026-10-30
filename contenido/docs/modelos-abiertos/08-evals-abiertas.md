---
titulo: Evals con herramientas abiertas
descripcion: Qué herramienta abierta usar para cada tipo de eval (promptfoo, DeepEval, RAGAS, Inspect AI), cómo configurarlas con un modelo local y las trampas de un juez local.
creado: 2026-10-29
orden: 8
nivel: intermedio
tags: [evals, promptfoo, deepeval, ragas, inspect-ai, modelo-juez, modelos-abiertos]
relacionados: ["[[glosario/evals]]", "[[docs/evals/02-modelo-como-juez]]", "[[recetas/evals-con-promptfoo]]", "[[recetas/validar-un-modelo-juez]]"]
---

Las [[glosario/evals|evals]] comprueban, con casos fijos y criterios explícitos, si tu prompt, tu modelo o tu agente hace lo que debe. Las herramientas abiertas te dan el andamiaje (casos, ejecución, aserciones, informes, CI) y te dejan elegir el modelo que responde y el que juzga, también uno local. Esta página dice cuál usar para qué, cómo arrancar cada una y dónde se rompe un [[glosario/modelo-juez|modelo juez]] local.

## Cuál para qué

| Necesidad | Herramienta | Versión · licencia |
|---|---|---|
| Comparar *prompts* y modelos en YAML, sin código; *red teaming*; CI | [[herramientas/promptfoo\|promptfoo]] | 0.125.1 · MIT (ahora «parte de OpenAI», sigue siendo MIT) |
| Tests de tu app al estilo pytest, con jueces y métricas de agente | [[herramientas/deepeval\|DeepEval]] | 4.3.2 · Apache-2.0 |
| Métricas específicas de RAG (fidelidad, precisión del contexto…) | [[herramientas/ragas\|RAGAS]] | 0.4.3 · Apache-2.0 |
| Evals reproducibles de agentes con *sandbox*, límites y registro | [[herramientas/inspect-ai\|Inspect AI]] (UK AISI) | 0.3.286 · MIT |
| Benchmarks académicos de modelos base | lm-evaluation-harness | 0.4.13 · MIT; no sirve para evaluar tu app |

Versiones según PyPI y npm a 29 de octubre de 2026. `evals` de OpenAI no publica versiones en PyPI desde mayo de 2024: no lo uses para proyectos nuevos.

## promptfoo: casos en YAML

promptfoo lee un `promptfooconfig.yaml` con *prompts*, proveedores y casos con aserciones, y ejecuta la matriz completa. Esta configuración pasa `promptfoo validate` con la 0.125.1 («Configuration is valid.»):

```yaml title="promptfooconfig.yaml"
# ejecuta: npx promptfoo@latest eval
description: Clasificador de tickets con un modelo local
prompts:
  - "Clasifica el ticket en facturacion, envio, devolucion u otro. Responde solo la categoría.\n\nTicket: {{ticket}}"
providers:
  - id: ollama:chat:qwen3.6:27b
    config: { temperature: 0 }
defaultTest:
  options:
    provider: ollama:chat:qwen3.6:27b   # juez local para llm-rubric (si no, usa uno de pago)
tests:
  - vars: { ticket: "Me cobrasteis dos veces este mes" }
    assert: [{ type: icontains, value: facturacion }]
  - vars: { ticket: "El paquete no ha llegado" }
    assert:
      - { type: icontains, value: envio }
      - { type: llm-rubric, value: "Responde con una sola palabra, sin explicación" }
```

Tres detalles que muerden: `llm-rubric` usa por defecto un proveedor de pago si no le das otro en `defaultTest.options.provider`; la telemetría está activada por defecto (`PROMPTFOO_DISABLE_TELEMETRY=1` para apagarla); y `OLLAMA_BASE_URL` cambia el host de Ollama. Prefiere aserciones deterministas (`icontains`, `is-json`, `contains-json`, `javascript`, `is-valid-openai-tools-call`, `tool-call-f1`) y deja `llm-rubric` para lo que no se puede comprobar con código. Paso a paso y en CI: [[recetas/evals-con-promptfoo]] y [[recetas/evals-de-regresion-en-ci]].

## DeepEval: tests de pytest

DeepEval escribe cada caso como un `LLMTestCase` y cada criterio como una métrica; `deepeval test run` los ejecuta como tests. En la 4.x, **`LLMTestCaseParams` pasa a llamarse `SingleTurnParams`**: los ejemplos antiguos fallan al importar.

```python nocheck title="test_devoluciones.py"
# antes: deepeval set-ollama --model qwen3.6:27b   (base URL por defecto http://localhost:11434)
from deepeval import assert_test
from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCase, SingleTurnParams

def test_devoluciones():
    correccion = GEval(name="Corrección",
                       criteria="¿La respuesta real dice lo mismo que la esperada?",
                       evaluation_params=[SingleTurnParams.ACTUAL_OUTPUT, SingleTurnParams.EXPECTED_OUTPUT],
                       threshold=0.7)
    assert_test(LLMTestCase(input="¿Cuánto tiempo tengo para devolver?",
                            actual_output="Tienes 30 días desde la entrega.",
                            expected_output="30 días naturales desde la entrega."), [correccion])
# deepeval test run test_devoluciones.py
```

Importaciones y construcción verificadas con DeepEval 4.3.2; la ejecución necesita un juez en marcha. `deepeval set-ollama` configura Ollama como modelo de evaluación. Para agentes trae `TaskCompletionMetric` y `ToolCorrectnessMetric`.

## RAGAS: métricas de RAG

RAGAS mide cosas como la [[glosario/fidelidad|fidelidad]] (¿la respuesta se apoya en el contexto recuperado?) o la precisión del contexto. En la 0.4 las métricas viven en `ragas.metrics.collections` (`Faithfulness`, `ContextPrecision`, `ContextRecall`, `AnswerRelevancy`, `FactualCorrectness`, `ToolCallAccuracy`, `AgentGoalAccuracy`…) y el juez se crea con `llm_factory`:

```python nocheck title="ragas_fidelidad.py"
import asyncio
from openai import AsyncOpenAI
from ragas.llms import llm_factory
from ragas.metrics.collections import Faithfulness

juez = llm_factory("qwen3.6:27b", provider="openai",
                   client=AsyncOpenAI(base_url="http://localhost:11434/v1", api_key="ollama"))
r = asyncio.run(Faithfulness(llm=juez).ascore(
    user_input="¿Cuánto tiempo tengo para devolver?", response="Tienes 30 días.",
    retrieved_contexts=["Las devoluciones se aceptan durante 30 días naturales."]))
print(r.value, r.reason)
```

> [!aviso] RAGAS 0.4.3 no importa con `langchain-community` 0.4
> `pip install ragas` resuelve `langchain-community` 0.4.x y la importación falla con `No module named 'langchain_community.chat_models.vertexai'`. Fija la versión: `pip install ragas==0.4.3 "langchain-community<0.4"`, y mejor en un entorno aparte del de tu agente si este usa LangChain 1.x. La 0.4.3 es de enero de 2026.

## Inspect AI: evals de agentes

Inspect AI define una tarea con un *dataset*, un *solver* (cómo responde el modelo o el agente) y un *scorer*. Su punto fuerte son los agentes: `Task` admite `sandbox=` (las herramientas se ejecutan en Docker), `message_limit`, `token_limit`, `time_limit`, `cost_limit` y `approval=`, y guarda un registro completo de cada trayectoria.

```python nocheck title="tarea.py"
from inspect_ai import Task, task
from inspect_ai.dataset import Sample
from inspect_ai.scorer import includes
from inspect_ai.solver import generate, system_message

@task
def clasificar_tickets():
    return Task(
        dataset=[Sample(input="Me cobrasteis dos veces este mes", target="facturacion"),
                 Sample(input="El paquete no ha llegado", target="envio")],
        solver=[system_message("Clasifica el ticket: facturacion, envio, devolucion u otro. Responde solo la categoría."),
                generate()],
        scorer=includes(),
    )
```

```bash
inspect eval tarea.py --model ollama/qwen3.6:27b     # también vllm/, sglang/, openai_compatible…
inspect eval tarea.py --model mockllm/model          # sin modelo, para probar la tarea
```

Con Inspect AI 0.3.286 la tarea carga y arranca con `mockllm/model`; aquí la ejecución se cortó porque intenta descargar el tokenizador de `tiktoken` y el entorno no tenía red.

## El juez local y sus trampas

Usar un modelo local como juez es barato y privado, pero tiene un fallo de fondo: **un juez más débil que el modelo evaluado tiende a aprobar de más**, porque no detecta errores que él mismo cometería. La regla de [[docs/evals/02-modelo-como-juez]] sigue valiendo: juez igual o más capaz que el evaluado. Y antes de fiarte de él, mide cuánto coincide con tus etiquetas humanas, por separado en las respuestas buenas y en las malas:

```python title="acuerdo_juez.py"
def acuerdo(humano: list[bool], juez: list[bool]) -> dict:
    """TPR: de las respuestas buenas, cuántas aprueba el juez. TNR: de las malas, cuántas suspende."""
    vp = sum(h and j for h, j in zip(humano, juez))
    vn = sum(not h and not j for h, j in zip(humano, juez))
    buenas, malas = sum(humano), len(humano) - sum(humano)
    return {"TPR": round(vp / buenas, 2), "TNR": round(vn / malas, 2),
            "aprobado_por_juez": round(sum(juez) / len(juez), 2), "aprobado_real": round(buenas / len(humano), 2)}

# 10 respuestas etiquetadas a mano (True = correcta) y lo que dijo un juez local pequeño
humano = [True, True, True, False, True, False, False, True, False, True]
juez   = [True, True, True, True,  True, True,  False, True, True,  True]
print(acuerdo(humano, juez))
```

```text
{'TPR': 1.0, 'TNR': 0.25, 'aprobado_por_juez': 0.9, 'aprobado_real': 0.6}
```

Los datos son de juguete, pero el patrón es el que buscas: un TPR perfecto no dice nada si el TNR es bajo. Este juez da un 90 % de aprobado a un sistema que acierta el 60 %. Con 50–100 casos etiquetados tienes una medida útil; el método completo está en [[recetas/validar-un-modelo-juez]].

Más trampas con modelos locales:

- **Variación entre ejecuciones.** Fija temperatura y semilla donde el proveedor lo admita, y repite cada caso varias veces: una nota de una sola pasada es ruido.
- **Razonamiento activado por defecto.** Muchos modelos abiertos piensan antes de responder y gastan el `max_tokens` del juez; un veredicto cortado puede contar como fallo. Ver [[modelos/12-inferencia-local]].
- **Contexto truncado.** Si el caso (pregunta, contexto y respuesta) no cabe en el `num_ctx` del juez, Ollama recorta en silencio y el juez valora un texto incompleto.
- **El mismo modelo de juez y de evaluado.** Se da la razón a sí mismo; usa otro.

## Errores frecuentes

| Error | Consecuencia | Arreglo |
|---|---|---|
| `llm-rubric` sin proveedor de juez | Llamadas de pago que no esperabas | `defaultTest.options.provider` |
| Importar `LLMTestCaseParams` en DeepEval 4 | Error de importación | `SingleTurnParams` |
| `pip install ragas` sin fijar versiones | Importación rota | `ragas==0.4.3 "langchain-community<0.4"` |
| Juez local sin validar | Notas infladas | TPR y TNR contra etiquetas humanas |
| Usar lm-eval-harness para tu app | Mides el modelo base, no tu sistema | promptfoo, DeepEval o Inspect con tus casos |

## Ver también

- [[docs/evals/01-disenar-evals]]: qué casos escribir antes de elegir herramienta.
- [[recetas/modelo-juez-con-rubrica]]: rúbricas cerradas para el juez.
- [[cursos/rag-a-fondo/10-evaluar-un-rag]]: métricas de recuperación y de respuesta.
- [[docs/modelos-abiertos/07-observabilidad-abierta]]: de las trazas a los casos.
