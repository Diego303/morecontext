---
titulo: NDCG
descripcion: Métrica de ranking que admite grados de relevancia y penaliza que lo más relevante aparezca abajo; va de 0 a 1.
creado: 2026-10-29
categoria: contexto
ingles: Normalized Discounted Cumulative Gain
aliases: [Normalized Discounted Cumulative Gain, NDCG, nDCG, NDCG@K, ganancia acumulada descontada]
tags: [rag, evals, metricas]
relacionados: ["[[cursos/rag-a-fondo/10-evaluar-un-rag]]", "[[glosario/mrr]]", "[[glosario/recall-at-k]]"]
---

NDCG (*Normalized Discounted Cumulative Gain*) evalúa un ranking cuando la relevancia tiene grados: un documento puede ser muy relevante (2), algo relevante (1) o nada (0). Suma la relevancia de cada resultado descontada por su posición y divide entre la del orden ideal, así que vale 1 si el ranking es perfecto.

## En la práctica

```python
import math

def dcg(rels: list[int]) -> float:
    return sum(r / math.log2(i + 1) for i, r in enumerate(rels, start=1))

def ndcg_at_k(rels: list[int], k: int) -> float:
    ideal = dcg(sorted(rels, reverse=True)[:k])
    return dcg(rels[:k]) / ideal if ideal else 0.0

ndcg_at_k([1, 2, 0, 0, 1], k=5)   # ≈ 0.85: el más relevante salió segundo
```

El ideal se calcula aquí con los relevantes que aparecen en la lista; en un banco serio, usa todos los etiquetados para esa pregunta. Merece la pena cuando etiquetas con grados, por ejemplo al comparar rerankers o al distinguir el fragmento que responde del que solo da contexto. Si tus etiquetas son de sí o no y te importa sobre todo el primero, [[glosario/mrr|MRR]] y [[glosario/recall-at-k|Recall@K]] son más fáciles de explicar.

## No confundir con

- **[[glosario/mrr]]**: solo mira el primer relevante y en binario.
- **[[glosario/recall-at-k]]**: cuenta cuántos relevantes entran en el top K, sin importar su orden dentro.

## Ver también

- [[cursos/rag-a-fondo/10-evaluar-un-rag]]
- [[glosario/conjunto-de-evaluacion]]
- [[glosario/reranking]]
