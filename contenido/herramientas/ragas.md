---
titulo: Ragas
descripcion: Biblioteca de métricas para evaluar sistemas RAG y agentes, como fidelidad, precisión y recall del contexto o acierto de herramientas.
creado: 2026-10-29
tags: [evals, rag, metricas]
relacionados: ["[[cursos/rag-a-fondo/10-evaluar-un-rag]]", "[[docs/modelos-abiertos/08-evals-abiertas]]", "[[glosario/fidelidad]]"]
categoria: evals
licencia: Apache-2.0
open_source: true
lenguajes: [Python]
url: https://docs.ragas.io
repositorio: https://github.com/vibrantlabsai/ragas
version: "0.4.3"
revisado: 2026-10-29
---

Ragas es una biblioteca de Python (Apache-2.0) con métricas para evaluar sistemas [[glosario/rag]] y agentes. La mayoría usan un [[glosario/modelo-juez]] para descomponer la respuesta en afirmaciones y compararlas con el contexto recuperado o con la referencia. Las métricas actuales viven en `ragas.metrics.collections`: `Faithfulness`, `ContextPrecision`, `ContextRecall`, `AnswerRelevancy`, `FactualCorrectness`, `ToolCallAccuracy`, `ToolCallF1`, `AgentGoalAccuracy` y otras.

## Para qué sirve

- Separar los dos fallos típicos de un RAG: **no recupera** lo que hace falta (precisión y *recall* del contexto) o **recupera pero responde mal** ([[glosario/fidelidad]]: la respuesta afirma cosas que no están en el contexto).
- Comparar dos configuraciones de recuperación con las mismas preguntas.
- Medir si un agente llamó a las herramientas esperadas.

## Cuándo usarla

Cuando ya tienes un conjunto de preguntas reales con su contexto (y, si puedes, respuestas de referencia) y quieres métricas de RAG sin implementarlas. Encaja con [[cursos/rag-a-fondo/10-evaluar-un-rag]] y con el diagnóstico de [[problemas/el-rag-encuentra-pero-responde-mal]].

## Cuándo no

- Para evals generales de *prompts* o aplicaciones: [[herramientas/promptfoo]] o [[herramientas/deepeval]].
- Como única medida: las métricas con juez son ruidosas. Combínalas con métricas deterministas de recuperación como [[glosario/recall-at-k]].

> [!aviso] Dependencias rotas
> `pip install ragas` (0.4.3, enero de 2026) resuelve `langchain-community` 0.4.x y **falla al importar** (`No module named 'langchain_community.chat_models.vertexai'`). Fija la versión: `pip install ragas==0.4.3 "langchain-community<0.4"`. Y no lo instales en el mismo entorno que una versión reciente de LangChain sin probarlo antes.

## Ejemplo mínimo

`Faithfulness` con un juez local por la API compatible con OpenAI de Ollama. Comprobado con `ragas` 0.4.3 y `langchain-community` 0.3.31 en un entorno aparte (la métrica se construye; el cálculo necesita Ollama en marcha), por eso el bloque no se valida automáticamente.

```python nocheck title="fidelidad.py"
import asyncio
from openai import AsyncOpenAI
from ragas.llms import llm_factory
from ragas.metrics.collections import Faithfulness

juez = llm_factory("qwen3.6:27b", provider="openai",
                   client=AsyncOpenAI(base_url="http://localhost:11434/v1", api_key="ollama"))
fidelidad = Faithfulness(llm=juez)

async def main():
    r = await fidelidad.ascore(
        user_input="¿Cuánto tiempo tengo para devolver?",
        response="Tienes 30 días.",
        retrieved_contexts=["Las devoluciones se aceptan durante 30 días naturales."],
    )
    print(r.value, r.reason)

if __name__ == "__main__":
    asyncio.run(main())
```

Las métricas son asíncronas (`ascore`) y devuelven un valor y una explicación (`reason`): lee las explicaciones de los casos con nota baja, porque ahí está el diagnóstico.

## Alternativas

- [[herramientas/deepeval]]: también tiene métricas de RAG, dentro de pytest.
- [[herramientas/promptfoo]]: aserciones declarativas en YAML.
- Métricas propias de recuperación (recall@k, [[glosario/mrr]]) con tus datos: baratas y deterministas.

## Enlaces

- Documentación: [docs.ragas.io](https://docs.ragas.io)
- Repositorio: [github.com/vibrantlabsai/ragas](https://github.com/vibrantlabsai/ragas)
