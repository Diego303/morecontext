---
titulo: DSPy
descripcion: Framework abierto para programar con modelos mediante firmas y módulos, y optimizar sus prompts contra una métrica con tus datos.
creado: 2026-10-29
tags: [frameworks, evals, optimizacion, python, open-source]
relacionados: ["[[docs/frameworks/09-otros-frameworks]]", "[[cursos/evals-para-agentes/index]]", "[[glosario/conjunto-de-evaluacion]]", "[[docs/evals/01-disenar-evals]]"]
categoria: framework
licencia: MIT
open_source: true
lenguajes: [Python]
url: https://github.com/stanfordnlp/dspy
repositorio: https://github.com/stanfordnlp/dspy
version: "3.4.1"
revisado: 2026-10-29
---

DSPy propone, con el lema de su README, `Programming—not prompting`. Declaras qué entra y qué sale de cada paso (una *signature*), lo envuelves en un módulo (`Predict`, `ChainOfThought`, `ReAct`…) y un optimizador ajusta los prompts, o los pesos, para maximizar una métrica sobre tus ejemplos.

**Licencia**: MIT, open source. No tiene parte comercial conocida. Ojo con el estado: su clasificador en PyPI es «3 - Alpha», aunque vaya por la versión 3.4.1.

## Para qué sirve

- Tareas con métrica clara y datos etiquetados: clasificación, extracción, respuestas que se pueden puntuar.
- Optimizar prompts de forma sistemática con `dspy.MIPROv2`, `dspy.GEPA`, `dspy.SIMBA` o `dspy.BootstrapFewShot`, y medir con `dspy.Evaluate`.
- Agentes sencillos con `dspy.ReAct(signature, tools, max_iters=…)` y `dspy.CodeAct`.

## Cuándo usarla

Cuando ya tienes un [[glosario/conjunto-de-evaluacion|conjunto de evaluación]] y una métrica, y ajustar el prompt a mano se ha vuelto lento. Encaja con lo que se enseña en [[cursos/evals-para-agentes/index]].

## Cuándo no

En prototipos sin datos ni métrica: sin ellos, los optimizadores no tienen contra qué optimizar y te quedas con una capa más entre tú y el prompt.

## Ejemplo mínimo

```python nocheck title="dspy_clasificar.py"
import dspy


class Clasificar(dspy.Signature):
    """Clasifica un ticket de soporte."""
    ticket: str = dspy.InputField()
    categoria: str = dspy.OutputField(desc="facturacion | envio | cuenta | producto")


dspy.configure(lm=dspy.LM("anthropic/claude-sonnet-5-5", max_tokens=1024))
pred = dspy.ChainOfThought(Clasificar)(ticket="Me habéis cobrado dos veces")
print(pred.categoria, "|", pred.reasoning)
```

Lo ejecuté en un entorno aparte con `dspy` 3.4.1, cambiando el modelo por `DummyLM` (el modelo simulado de DSPy, en `dspy.utils.dummies`): imprime `facturacion | habla de un cobro`. `ChainOfThought` añade el campo `reasoning` a la salida sin que lo declares. DSPy llega a Claude a través de [[herramientas/litellm]] (`"anthropic/…"`).

> [!consejo] Empieza por la métrica
> Antes de elegir optimizador, escribe la función que dice si una predicción es buena y prueba el módulo sin optimizar con `dspy.Evaluate`. Ese número es tu línea base.

## Alternativas

- [[herramientas/promptfoo]] o [[herramientas/deepeval]] para evaluar prompts que sigues escribiendo a mano.
- [[herramientas/pydantic-ai]] si solo necesitas salida tipada y validada.
- [[herramientas/inspect-ai]] para evals de agentes más complejas.

## Enlaces

- [PyPI](https://pypi.org/project/dspy/) (README con la API y los optimizadores)
- En MoreContext: [[docs/frameworks/09-otros-frameworks]] · [[docs/evals/01-disenar-evals]] · [[glosario/evals]]
