---
titulo: Recall@K
descripcion: Métrica de recuperación que mide qué parte de los fragmentos relevantes aparece entre los K primeros resultados.
creado: 2026-10-29
categoria: contexto
ingles: Recall@K
aliases: [recall@k, recall at k, exhaustividad@K, cobertura@K]
tags: [rag, evals, metricas]
relacionados: ["[[cursos/rag-a-fondo/10-evaluar-un-rag]]", "[[glosario/mrr]]", "[[glosario/ndcg]]"]
---

Recall@K responde a una pregunta: de los fragmentos que de verdad responden a la consulta, ¿cuántos están entre los K primeros que devolvió el buscador? Se calcula como `relevantes en el top K / total de relevantes` y se promedia sobre todas las preguntas del banco de evaluación.

## En la práctica

```python
def recall_at_k(recuperados: list[str], relevantes: set[str], k: int) -> float:
    return len(set(recuperados[:k]) & relevantes) / len(relevantes)

recall_at_k(["d7", "d2", "d9", "d4"], {"d2", "d5"}, k=3)   # 0.5: d2 está, d5 no
```

Es la primera métrica que mirar en un RAG: si el fragmento correcto no se recupera, el modelo no podrá usarlo por bueno que sea. Mídela en dos cortes: el amplio de la primera fase (K = 50) y lo que llega al contexto (K = 5). Recall@50 alta con recall@5 baja señala al [[glosario/reranking]]; recall@50 baja, a troceado, embeddings o consulta. Excluye del cálculo las preguntas sin relevantes, que miden abstención, y no pidas una precisión de decimales con 40 preguntas: uno o dos casos son ruido.

## No confundir con

- **Precision@K**: qué fracción de los K resultados es relevante. Mide ruido en el contexto, no cobertura.
- **Tasa de acierto@K** (*hit rate*): si hay al menos un relevante en el top K. Coincide con Recall@K cuando cada pregunta tiene un solo relevante.
- **[[glosario/mrr]]**: mira en qué posición sale el primer relevante.

## Ver también

- [[cursos/rag-a-fondo/10-evaluar-un-rag]]
- [[glosario/conjunto-de-evaluacion]]
- [[glosario/ndcg]]
- [[recetas/depurar-un-rag]]
