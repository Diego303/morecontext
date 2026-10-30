---
titulo: DeepEval
descripcion: Framework de evals para aplicaciones con LLM al estilo pytest, con métricas de modelo juez, de RAG y de agentes, que puede usar un juez local.
creado: 2026-10-29
tags: [evals, pytest, modelo-juez]
relacionados: ["[[docs/modelos-abiertos/08-evals-abiertas]]", "[[cursos/evals-para-agentes/03-graders]]", "[[glosario/modelo-juez]]"]
categoria: evals
licencia: Apache-2.0
open_source: true
lenguajes: [Python]
url: https://deepeval.com
repositorio: https://github.com/confident-ai/deepeval
version: "4.3.2"
revisado: 2026-10-29
---

DeepEval es un framework de [[glosario/evals]] en Python con licencia Apache-2.0. Escribes cada caso como un test de pytest (`LLMTestCase` con entrada, salida real y salida esperada), eliges métricas y lo lanzas con `deepeval test run`. Trae métricas genéricas con [[glosario/modelo-juez]] (`GEval`, con tu propio criterio), de RAG y de agentes (`TaskCompletionMetric`, `ToolCorrectnessMetric`).

## Para qué sirve

- Meter las evals en la misma *suite* que tus tests, con la misma CI.
- Puntuar respuestas abiertas con un criterio en lenguaje natural y un umbral.
- Medir si un agente llamó a las herramientas correctas y si completó la tarea.

## Cuándo usarla

Si tu equipo ya vive en pytest y quiere que una regresión de calidad rompa la *build* igual que un test unitario. Encaja con el enfoque de *graders* de [[cursos/evals-para-agentes/03-graders]].

## Cuándo no

- Para comparar *prompts* o modelos en una matriz sin código: [[herramientas/promptfoo]].
- Para evals de agentes con *sandbox*, límites de coste y registro reproducible: [[herramientas/inspect-ai]].
- Si no has validado al juez: una métrica `GEval` sin comprobar contra etiquetas humanas mide la opinión del juez, no la calidad ([[recetas/validar-un-modelo-juez]]).

## Ejemplo mínimo

Con un juez local en Ollama. Comprobado con `deepeval` 4.3.2 hasta donde se puede sin servidor de modelos: el juez y la métrica se construyen y pytest recoge el test (en un entorno aparte del de la web, por eso el bloque no se valida automáticamente). La evaluación en sí necesita Ollama en marcha.

```python nocheck title="test_devoluciones.py"
from deepeval import assert_test
from deepeval.metrics import GEval
from deepeval.models import OllamaModel
from deepeval.test_case import LLMTestCase, SingleTurnParams

juez = OllamaModel(model="qwen3.6:27b", base_url="http://localhost:11434")  # juez local
correccion = GEval(
    name="Corrección",
    criteria="¿La respuesta real dice lo mismo que la esperada?",
    evaluation_params=[SingleTurnParams.ACTUAL_OUTPUT, SingleTurnParams.EXPECTED_OUTPUT],
    threshold=0.7,
    model=juez,
)

def test_plazo_de_devolucion():
    caso = LLMTestCase(
        input="¿Cuánto tiempo tengo para devolver?",
        actual_output="Tienes 30 días desde la entrega.",  # aquí va la salida de tu aplicación
        expected_output="30 días naturales desde la entrega.",
    )
    assert_test(caso, [correccion])
```

```bash
pip install deepeval ollama      # OllamaModel exige el paquete ollama
deepeval test run test_devoluciones.py
```

Dos detalles de la versión 4: `LLMTestCaseParams` pasa a llamarse `SingleTurnParams` (el nombre antiguo está obsoleto), y si no pasas `model=`, `GEval` intenta usar OpenAI y falla sin `OPENAI_API_KEY`. Existe `deepeval set-ollama --model …` para configurar el juez global, pero pasar el modelo explícito es más claro y no depende de ficheros de configuración.

> [!aviso] Juez igual o mayor
> Un juez local más débil que el modelo evaluado da notas infladas. Si evalúas un modelo grande, usa un juez al menos igual de capaz.

## Alternativas

- [[herramientas/promptfoo]]: YAML y CLI, sin código.
- [[herramientas/ragas]]: métricas de RAG.
- [[herramientas/inspect-ai]]: evals reproducibles de agentes.

## Enlaces

- Documentación: [deepeval.com](https://deepeval.com)
- Repositorio: [github.com/confident-ai/deepeval](https://github.com/confident-ai/deepeval)
