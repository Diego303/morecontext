---
titulo: MRR
descripcion: Métrica de ranking que promedia uno entre la posición del primer resultado relevante; premia que el bueno salga arriba.
creado: 2026-10-29
categoria: contexto
ingles: Mean Reciprocal Rank
aliases: [Mean Reciprocal Rank, MRR, rango recíproco medio, reciprocal rank]
tags: [rag, evals, metricas]
relacionados: ["[[cursos/rag-a-fondo/10-evaluar-un-rag]]", "[[glosario/recall-at-k]]", "[[glosario/ndcg]]"]
---

MRR (*Mean Reciprocal Rank*) mide lo arriba que aparece el primer resultado relevante. Para cada pregunta se toma `1 / posición` del primer relevante (0 si no aparece) y se promedia sobre todas las preguntas. Vale 1 si el bueno sale siempre primero.

## En la práctica

```text
pregunta 1: primer relevante en la posición 1  →  1/1 = 1,00
pregunta 2: en la posición 3                    →  1/3 ≈ 0,33
pregunta 3: no aparece                          →  0
MRR = (1 + 0,33 + 0) / 3 ≈ 0,44
```

Es útil cuando una sola fuente basta para responder, como en preguntas de soporte o búsqueda de un documento concreto, y para ver si un [[glosario/reranking]] sube el fragmento correcto al primer puesto. Castiga mucho bajar de la posición 1 a la 2 (de 1 a 0,5) y muy poco de la 9 a la 10, así que se fija en la cabeza del ranking. Léelo junto a [[glosario/recall-at-k|Recall@K]]: un MRR alto con recall baja indica que aciertas arriba cuando aciertas, pero a menudo no aciertas.

## No confundir con

- **[[glosario/ndcg]]**: tiene en cuenta todos los relevantes y grados de relevancia. MRR solo mira el primero y lo trata como sí o no.
- **[[glosario/rrf|RRF]]**: también usa `1 / rango`, pero para fusionar listas, no para evaluarlas.

## Ver también

- [[cursos/rag-a-fondo/10-evaluar-un-rag]]
- [[glosario/recall-at-k]]
- [[glosario/conjunto-de-evaluacion]]
