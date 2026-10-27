---
titulo: Evaluar un RAG
descripcion: Un banco de evaluación con fragmentos relevantes etiquetados, métricas de recuperación (recall@k, MRR) y de respuesta (fidelidad, citas, abstención) y cómo leerlas.
creado: 2026-09-23
orden: 4
minutos: 60
tipo: proyecto
objetivos:
  - Construir un conjunto de evaluación con preguntas, fragmentos relevantes y casos sin respuesta.
  - Calcular recall@k y MRR sobre la recuperación.
  - Evaluar fidelidad y validez de citas con comprobaciones de código y un modelo juez.
  - Interpretar los resultados para decidir el siguiente cambio en el sistema.
requiere: ["[[cursos/rag-a-fondo/03-recuperar-bien]]"]
relacionados: ["[[glosario/conjunto-de-evaluacion]]", "[[glosario/modelo-juez]]", "[[cursos/evals-para-agentes/index]]", "[[roadmap/80-evals/03-codigo-o-modelo-juez]]", "[[sistemas/rag-con-citas]]"]
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
```

Cómo reunir los casos:

1. **Consultas reales** de tus usuarios o de tus registros, que son las que importan.
2. **Generación asistida**: pide a un modelo que redacte preguntas a partir de fragmentos concretos, y revísalas a mano. Las preguntas generadas tienden a copiar el vocabulario del fragmento y resultan demasiado fáciles; reescribe algunas con las palabras que usaría un usuario.
3. **Fallos conocidos**: cada fallo que diagnosticaste en la lección 1 entra en el banco.

Con 30 a 50 casos ya ves diferencias grandes entre variantes. Los ids estables de la [[cursos/rag-a-fondo/02-indexar-bien|lección 2]] son lo que hace que este banco siga valiendo cuando reindexas. Más sobre construir conjuntos en [[cursos/evals-para-agentes/02-datasets-de-evaluacion]].

## Métricas de recuperación

- **recall@k**: fracción de fragmentos relevantes que aparecen en los primeros k. Mídelo en la fase amplia (k = 50) y en lo que llega al contexto (k = 5).
- **MRR** (*Mean Reciprocal Rank*): media de `1 / posición` del primer relevante. Premia que el bueno salga arriba; vale 1 si siempre está primero.
- **Tasa de acierto@k** (*hit rate*): fracción de preguntas con al menos un relevante en el top k. Más fácil de explicar a negocio.

```python title="metricas_recuperacion.py"
def recall_at_k(recuperados: list[str], relevantes: list[str], k: int) -> float:
    if not relevantes:
        return float("nan")                    # sin relevantes: no aplica
    return len(set(recuperados[:k]) & set(relevantes)) / len(relevantes)

def rr(recuperados: list[str], relevantes: list[str]) -> float:
    for pos, doc_id in enumerate(recuperados, start=1):
        if doc_id in relevantes:
            return 1.0 / pos
    return 0.0

def evaluar_recuperacion(casos, recuperar, k_amplio=50, k_ctx=5):
    filas = []
    for c in casos:
        if not c["relevantes"]:
            continue
        ids = recuperar(c["pregunta"])
        filas.append({"id": c["id"],
                      f"recall@{k_amplio}": recall_at_k(ids, c["relevantes"], k_amplio),
                      f"recall@{k_ctx}": recall_at_k(ids, c["relevantes"], k_ctx),
                      "rr": rr(ids, c["relevantes"])})
    n = len(filas)
    medias = {m: sum(f[m] for f in filas) / n for m in filas[0] if m != "id"}
    medias["MRR"] = medias.pop("rr")
    return medias, filas
```

Lee las dos recall juntas. Recall@50 alta y recall@5 baja señalan al reranking. Recall@50 baja señala a indexación, troceado o consulta: ahí el reranker no puede hacer nada.

## Métricas de respuesta

Tres preguntas, de más barata a más cara:

1. **¿Las citas son válidas?** Cada id citado existe y estaba en el contexto. Es código puro.
2. **¿Se abstiene cuando debe?** En los casos sin relevantes, la respuesta debe decir que no lo sabe. Se puede comprobar con un juez o con una marca fija que pidas en el prompt.
3. **¿Es fiel?** Cada afirmación está respaldada por el fragmento que cita. Aquí necesitas un [[glosario/modelo-juez|modelo juez]].

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
> Etiqueta tú 20 respuestas y compara con el juez. Si discrepa a menudo, ajusta la instrucción o divide la tarea. Los jueces tienen sesgos conocidos (Zheng et al., 2023, [*Judging LLM-as-a-Judge*](https://arxiv.org/abs/2306.05685)); lo tratas a fondo en [[cursos/evals-para-agentes/03-graders]].

## Leer el informe

Ejecuta el banco con cada variante y pon las métricas en una tabla, junto con coste y latencia medios. Así se lee:

- **Mejora la recuperación y no la respuesta**: el cuello de botella está en la generación (prompt, orden, número de fragmentos).
- **Baja la fidelidad y sube la corrección**: el modelo responde con conocimiento propio; refuerza la instrucción de usar solo fragmentos o revisa si faltan documentos.
- **Abstención baja en casos sin respuesta**: el sistema inventa. Prioridad alta en producción.
- **Diferencias de uno o dos casos**: con 40 preguntas, eso es ruido. Mira los casos concretos antes de concluir.

Mira siempre algunas trazas de los casos que cambiaron de resultado. Los números te dicen dónde mirar; las trazas te dicen por qué.

## Ejercicio

> [!ejercicio] Proyecto del curso: el informe comparativo
> Construye un banco de al menos 30 preguntas (con un mínimo de 5 sin respuesta en el corpus) y evalúa las cuatro variantes de la lección 3. Genera una tabla con recall@50, recall@5, MRR, tasa de citas válidas, fidelidad media, tasa de abstención correcta, coste y latencia por consulta.
>
> Está bien si la tabla está completa, si has calibrado el juez de fidelidad contra al menos 20 etiquetas tuyas y si escribes un párrafo con la variante elegida y por qué, apoyado en dos o más métricas.

> [!ejercicio]- Pistas
> Ejecuta primero solo las métricas de recuperación: son baratas y te dicen qué variantes merece la pena evaluar con el juez. Para la abstención, pide en el prompt una frase fija («No encuentro esa información en la documentación») y compruébala con código.

## Resumen

- Evalúa recuperación y respuesta por separado, y la recuperación primero.
- recall@k en dos cortes (amplio y contexto) localiza el problema; MRR mide si el bueno sale arriba.
- Citas válidas se comprueban con código; fidelidad, con un juez calibrado.
- Incluye preguntas sin respuesta: la abstención es una métrica de seguridad.
- Usa los números para elegir qué trazas leer.

## Para seguir

- [[sistemas/rag-con-citas]]
- [[cursos/evals-para-agentes/index]]
- [[recetas/modelo-juez-con-rubrica]]
