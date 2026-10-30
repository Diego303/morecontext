---
titulo: Evaluar un RAG
descripcion: Un banco de evaluación con fragmentos relevantes etiquetados, métricas de recuperación (recall@k, precision@k, MRR, NDCG) y de respuesta (fidelidad, citas, abstención) y cómo leerlas.
creado: 2026-09-23
actualizado: 2026-10-29
orden: 10
minutos: 60
tipo: proyecto
objetivos:
  - Construir un conjunto de evaluación con preguntas, fragmentos relevantes y casos sin respuesta.
  - Calcular recall@k, precision@k, MRR y NDCG sobre la recuperación.
  - Evaluar fidelidad y validez de citas con comprobaciones de código y un modelo juez.
  - Interpretar los resultados para decidir el siguiente cambio en el sistema.
requiere: ["[[cursos/rag-a-fondo/03-recuperar-bien]]"]
relacionados: ["[[glosario/conjunto-de-evaluacion]]", "[[glosario/modelo-juez]]", "[[cursos/evals-para-agentes/index]]", "[[roadmap/80-evals/03-codigo-o-modelo-juez]]", "[[herramientas/ragas]]"]
tags: [rag, evals, metricas]
---

Al terminar tendrás un banco de evaluación para tu RAG que mide por separado la recuperación y la respuesta, y un informe que compara variantes. Con él dejarás de decidir por impresión («parece que va mejor») y podrás decir qué cambio mejoró qué métrica y a qué coste.

## La idea

En la [[cursos/rag-a-fondo/01-anatomia-de-un-rag|lección 1]] separaste fallos de recuperación y de generación. La evaluación sigue la misma frontera:

- **Recuperación**: ¿los fragmentos relevantes llegaron a los primeros puestos? Se mide sin llamar al modelo generador, así que es barata y rápida.
- **Respuesta**: con lo que llegó, ¿la respuesta es correcta, se apoya en los fragmentos y cita bien? ¿Se abstiene cuando no hay información?

Si la recuperación es mala, las métricas de respuesta no te dicen nada útil. Por eso se mide primero.

```mermaid
flowchart LR
  D[Banco de preguntas] --> R[Recuperar]
  R --> MR[recall@k, MRR]
  R --> G[Generar]
  G --> C[Citas válidas: código]
  G --> F[Fidelidad: modelo juez]
  MR --> I[Informe]
  C --> I
  F --> I
```

## El banco de evaluación

Cada caso lleva la pregunta, los ids de los fragmentos que la responden y, opcionalmente, una respuesta de referencia. Incluye a propósito **preguntas sin respuesta** en tu corpus: miden si el sistema se abstiene en lugar de inventar.

```json title="banco_rag.jsonl"
{"id": "q01", "pregunta": "¿Cuántos días tengo para pedir un reembolso?", "relevantes": ["a3f9c2e1b0d4e5f6"], "referencia": "30 días desde la compra."}
{"id": "q02", "pregunta": "¿El plan Pro incluye SSO?", "relevantes": ["7c1d0e9a8b2f3c4d", "9e8d7c6b5a4f3e2d"], "referencia": "Sí, desde la versión 4."}
{"id": "q03", "pregunta": "¿Tenéis oficina en Lisboa?", "relevantes": [], "referencia": null}
{"id": "q04", "pregunta": "¿Cómo activo la doble verificación?", "relevantes": ["5b4a3c2d1e0f9a8b", "1f2e3d4c5b6a7980"], "grados": {"5b4a3c2d1e0f9a8b": 2, "1f2e3d4c5b6a7980": 1}, "referencia": "Desde Ajustes > Seguridad."}
```

El campo `grados` es opcional: distingue un fragmento que contiene la respuesta (2) de uno que solo ayuda (1), y lo usa NDCG. Si al principio no sabes los ids de fragmento, empieza etiquetando el documento esperado (`"fuentes": ["politica_reembolsos.pdf"]`) y mide a nivel de documento; afinarás a fragmento cuando el banco crezca. Lo que importa es que el banco no cambie entre variantes: así puedes comparar la v1 con la v2 de tu RAG y saber si mejoró de verdad.

Cómo reunir los casos:

1. **Consultas reales** de tus usuarios o de tus registros, que son las que importan.
2. **Generación asistida**: pide a un modelo que redacte preguntas a partir de fragmentos concretos, y revísalas a mano. Las preguntas generadas tienden a copiar el vocabulario del fragmento y resultan demasiado fáciles; reescribe algunas con las palabras que usaría un usuario.
3. **Fallos conocidos**: cada fallo que diagnosticaste en la lección 1 entra en el banco.

Con 30 a 50 casos ya ves diferencias grandes entre variantes. Los ids estables de la [[cursos/rag-a-fondo/02-indexar-bien|lección 2]] son lo que hace que este banco siga valiendo cuando reindexas. Más sobre construir conjuntos en [[cursos/evals-para-agentes/02-datasets-de-evaluacion]].

## Métricas de recuperación

- **recall@k**: fracción de fragmentos relevantes que aparecen en los primeros k. Mídelo en la fase amplia (k = 50) y en lo que llega al contexto (k = 5).
- **MRR** (*Mean Reciprocal Rank*): media de `1 / posición` del primer relevante. Premia que el bueno salga arriba; vale 1 si siempre está primero.
- **precision@k**: de los k recuperados, fracción que es relevante. Recall te dice si el bueno entró; precision, cuánto ruido lo acompaña. Con k = 5, una precision baja significa que el modelo recibe muchos fragmentos que no ayudan.
- **Tasa de acierto@k** (*hit rate*): fracción de preguntas con al menos un relevante en el top k. Más fácil de explicar a negocio.
- **NDCG@k** (*Normalized Discounted Cumulative Gain*): como MRR, premia el buen orden, pero admite grados de relevancia (muy relevante, algo relevante, irrelevante) y tiene en cuenta todos los relevantes, no solo el primero. Vale 1 si el orden es el ideal. Úsalo cuando tu banco tenga `grados`.

Todas son métricas del recuperador, independientes del modelo generador. Las tienes en el glosario: [[glosario/recall-at-k]], [[glosario/mrr]] y [[glosario/ndcg]].

```python title="metricas_recuperacion.py"
import math

def recall_at_k(recuperados: list[str], relevantes: list[str], k: int) -> float:
    if not relevantes:
        return float("nan")                    # sin relevantes: no aplica
    return len(set(recuperados[:k]) & set(relevantes)) / len(relevantes)

def rr(recuperados: list[str], relevantes: list[str]) -> float:
    for pos, doc_id in enumerate(recuperados, start=1):
        if doc_id in relevantes:
            return 1.0 / pos
    return 0.0

def precision_at_k(recuperados: list[str], relevantes: list[str], k: int) -> float:
    top = recuperados[:k]
    return len(set(top) & set(relevantes)) / len(top) if top else 0.0

def ndcg_at_k(recuperados: list[str], grados: dict[str, int], k: int) -> float:
    def dcg(valores):
        return sum((2 ** g - 1) / math.log2(pos + 1) for pos, g in enumerate(valores, start=1))
    real = dcg([grados.get(d, 0) for d in recuperados[:k]])
    ideal = dcg(sorted(grados.values(), reverse=True)[:k])
    return real / ideal if ideal else 0.0

def evaluar_recuperacion(casos, recuperar, k_amplio=50, k_ctx=5):
    filas = []
    for c in casos:
        if not c["relevantes"]:
            continue
        ids = recuperar(c["pregunta"])
        grados = c.get("grados") or {i: 1 for i in c["relevantes"]}   # binaria si no hay grados
        filas.append({"id": c["id"],
                      f"recall@{k_amplio}": recall_at_k(ids, c["relevantes"], k_amplio),
                      f"recall@{k_ctx}": recall_at_k(ids, c["relevantes"], k_ctx),
                      f"precision@{k_ctx}": precision_at_k(ids, c["relevantes"], k_ctx),
                      f"ndcg@{k_ctx}": ndcg_at_k(ids, grados, k_ctx),
                      "rr": rr(ids, c["relevantes"])})
    n = len(filas)
    medias = {m: sum(f[m] for f in filas) / n for m in filas[0] if m != "id"}
    medias["MRR"] = medias.pop("rr")
    return medias, filas
```

Lee las dos recall juntas. Recall@50 alta y recall@5 baja señalan al reranking. Recall@50 baja señala a indexación, troceado o consulta: ahí el reranker no puede hacer nada. Recall@5 alta con precision@5 baja indica que sobran fragmentos: prueba a enviar menos.

## Métricas de respuesta

Cuatro preguntas, de más barata a más cara:

1. **¿Las citas son válidas?** Cada id citado existe y estaba en el contexto. Es código puro.
2. **¿Se abstiene cuando debe?** En los casos sin relevantes, la respuesta debe decir que no lo sabe. Se puede comprobar con un juez o con una marca fija que pidas en el prompt.
3. **¿Es fiel?** Cada afirmación está respaldada por los fragmentos ([[glosario/fidelidad|fidelidad]] o *faithfulness*; algunos marcos lo llaman *groundedness*). Aquí necesitas un [[glosario/modelo-juez|modelo juez]].
4. **¿Responde a lo que se preguntó?** Una respuesta fiel puede irse por las ramas. La relevancia de la respuesta se juzga con el mismo juez o comparando con la referencia.

```python title="metricas_respuesta.py"
import json, re
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

def citas_validas(respuesta: str, ids_contexto: list[str]) -> dict:
    citados = re.findall(r"\[([^\]\s]+)\]", respuesta)
    invalidas = [c for c in citados if c not in ids_contexto]
    return {"n_citas": len(citados), "invalidas": invalidas,
            "ok": bool(citados) and not invalidas}

ESQUEMA_FIDELIDAD = {
    "type": "object",
    "properties": {
        "afirmaciones": {"type": "array", "items": {
            "type": "object",
            "properties": {"texto": {"type": "string"},
                           "respaldada": {"type": "boolean"}},
            "required": ["texto", "respaldada"], "additionalProperties": False}},
        "abstiene": {"type": "boolean"},
    },
    "required": ["afirmaciones", "abstiene"], "additionalProperties": False,
}

def fidelidad(respuesta: str, fragmentos: dict[str, str]) -> dict:
    ctx = "\n\n".join(f'<f id="{i}">\n{t}\n</f>' for i, t in fragmentos.items())
    resp = client.messages.create(
        model=MODEL, max_tokens=2048,
        system=("Eres un evaluador estricto. Divide la respuesta en afirmaciones factuales. "
                "Marca cada una como respaldada solo si los fragmentos la apoyan de forma explícita. "
                "Indica si la respuesta se abstiene por falta de información."),
        messages=[{"role": "user",
                   "content": f"<fragmentos>\n{ctx}\n</fragmentos>\n\n<respuesta>\n{respuesta}\n</respuesta>"}],
        output_config={"format": {"type": "json_schema", "schema": ESQUEMA_FIDELIDAD}},
    )
    if resp.stop_reason != "end_turn":
        return {"error": resp.stop_reason}
    datos = json.loads(next(b.text for b in resp.content if b.type == "text"))
    afs = datos["afirmaciones"]
    datos["fidelidad"] = sum(a["respaldada"] for a in afs) / len(afs) if afs else 1.0
    return datos
```

La fidelidad se mide contra **los fragmentos**, no contra tu respuesta de referencia: una respuesta puede ser correcta y no estar respaldada (el modelo lo sabía de antes), y eso en un RAG es un defecto, porque el usuario no puede comprobarla. La corrección frente a la referencia es una métrica aparte, útil para saber si el sistema acierta.

> [!aviso] Calibra al juez antes de fiarte
> Etiqueta tú 20 respuestas y compara con el juez por separado en las que pasan y en las que fallan (tasa de verdaderos positivos y de verdaderos negativos): un juez que lo aprueba todo acierta mucho de media y no sirve. Si discrepa a menudo, ajusta la instrucción o divide la tarea. El método completo está en [[recetas/validar-un-modelo-juez]]. Los jueces tienen sesgos conocidos (Zheng et al., 2023, [*Judging LLM-as-a-Judge*](https://arxiv.org/abs/2306.05685)); lo tratas a fondo en [[cursos/evals-para-agentes/03-graders]].

## Con RAGAS

[[herramientas/ragas|RAGAS]] (Apache-2.0) es una biblioteca abierta con estas métricas ya escritas: `Faithfulness`, `ContextPrecision`, `ContextRecall`, `AnswerRelevancy`, `FactualCorrectness` y otras, en `ragas.metrics.collections`. Hace lo mismo que `fidelidad()`: descompone la respuesta en afirmaciones y pide al juez un veredicto por cada una. Te ahorra escribir los prompts; a cambio, son prompts en inglés que no controlas, así que también hay que calibrarlo.

```bash
pip install ragas==0.4.3 "langchain-community<0.4"   # con langchain-community 0.4 falla al importar
```

```python nocheck title="fidelidad_ragas.py"
import asyncio
from openai import AsyncOpenAI
from ragas.llms import llm_factory
from ragas.metrics.collections import Faithfulness

# juez local servido por Ollama con su API compatible con OpenAI
juez = llm_factory("qwen3.6:27b", provider="openai",
                   client=AsyncOpenAI(base_url="http://localhost:11434/v1", api_key="ollama"))
metrica = Faithfulness(llm=juez)

async def main():
    r = await metrica.ascore(
        user_input="¿Cuántos días tengo para pedir un reembolso?",
        response="Tienes 30 días desde la compra.",
        retrieved_contexts=["Los reembolsos se aceptan durante 30 días naturales desde la compra."],
    )
    print(r.value)          # 1.0 si todas las afirmaciones están respaldadas

asyncio.run(main())
```

Dos detalles comprobados con la versión 0.4.3. `llm_factory` exige un cliente ya creado. Y las peticiones que envía llevan `temperature` y `top_p`, que la API de Claude ya no acepta: con RAGAS usa un juez local o de otro proveedor, o sigue con tu `fidelidad()`. Si el juez es un modelo local más débil que el que evalúas, sus notas tienden a salir infladas: valídalo igual. Otras alternativas abiertas para evaluar están en [[docs/modelos-abiertos/08-evals-abiertas]].

## Leer el informe

Ejecuta el banco con cada variante y pon las métricas en una tabla, junto con coste y latencia medios. Así se lee:

- **Mejora la recuperación y no la respuesta**: el cuello de botella está en la generación (prompt, orden, número de fragmentos).
- **Baja la fidelidad y sube la corrección**: el modelo responde con conocimiento propio; refuerza la instrucción de usar solo fragmentos o revisa si faltan documentos.
- **Abstención baja en casos sin respuesta**: el sistema inventa. Prioridad alta en producción.
- **Diferencias de uno o dos casos**: con 40 preguntas, eso es ruido. Mira los casos concretos antes de concluir.

Mira siempre algunas trazas de los casos que cambiaron de resultado. Los números te dicen dónde mirar; las trazas te dicen por qué.

## Ejercicio

> [!ejercicio] Proyecto del curso: el informe comparativo
> Construye un banco de al menos 30 preguntas (con un mínimo de 5 sin respuesta en el corpus) y evalúa las cuatro variantes de la lección 3. Genera una tabla con recall@50, recall@5, precision@5, MRR, NDCG@5, tasa de citas válidas, fidelidad media, tasa de abstención correcta, coste y latencia por consulta.
>
> Está bien si la tabla está completa, si has calibrado el juez de fidelidad contra al menos 20 etiquetas tuyas y si escribes un párrafo con la variante elegida y por qué, apoyado en dos o más métricas.

> [!ejercicio]- Pistas
> Ejecuta primero solo las métricas de recuperación: son baratas y te dicen qué variantes merece la pena evaluar con el juez. Para la abstención, pide en el prompt una frase fija («No encuentro esa información en la documentación») y compruébala con código.

## Resumen

- Evalúa recuperación y respuesta por separado, y la recuperación primero.
- recall@k en dos cortes (amplio y contexto) localiza el problema; precision@k mide el ruido; MRR y NDCG miden si lo bueno sale arriba.
- Citas válidas se comprueban con código; fidelidad, con un juez calibrado.
- Incluye preguntas sin respuesta: la abstención es una métrica de seguridad.
- Usa los números para elegir qué trazas leer.

## Para seguir

- [[sistemas/rag-con-citas]]
- [[cursos/evals-para-agentes/index]]
- [[recetas/modelo-juez-con-rubrica]]
- [[recetas/validar-un-modelo-juez]]
