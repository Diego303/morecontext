---
titulo: RRF
descripcion: Fusión de varias listas de resultados por posición, sin mirar sus puntuaciones; la forma estándar de combinar búsqueda léxica y vectorial.
creado: 2026-10-29
categoria: contexto
ingles: Reciprocal Rank Fusion
aliases: [Reciprocal Rank Fusion, RRF, fusión por rango recíproco, fusión de rankings]
tags: [rag, busqueda]
relacionados: ["[[recetas/fusionar-rankings-con-rrf]]", "[[glosario/busqueda-hibrida]]", "[[cursos/rag-a-fondo/03-recuperar-bien]]"]
---

RRF (*Reciprocal Rank Fusion*) combina varios rankings en uno usando solo la posición de cada documento en cada lista. Cada documento suma `1 / (k + rango)` por cada lista en la que aparece, con el rango empezando en 1, y se ordena por la suma. Lo propusieron Cormack, Clarke y Büttcher en [*Reciprocal Rank Fusion outperforms Condorcet and individual rank learning methods*](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf) (SIGIR 2009), con `k = 60`.

## En la práctica

Sirve porque las puntuaciones de [[glosario/bm25|BM25]] y de [[glosario/similitud-coseno]] están en escalas distintas y no se pueden sumar. Con `k = 60`, el valor habitual:

```text
doc A: 1.º en vectorial, 3.º en BM25  →  1/61 + 1/63 ≈ 0,0323
doc B: 2.º en vectorial, no está en BM25 →  1/62     ≈ 0,0161
```

Gana lo que aparece arriba en las dos listas. Un `k` mayor aplana las diferencias entre posiciones; uno menor premia más el primer puesto. Lo tienes hecho en Qdrant (`models.RrfQuery(rrf=models.Rrf(k=60))`, con pesos por lista desde la 1.17) y en LanceDB (`RRFReranker`); en pgvector se escribe en SQL. No toques `k` ni los pesos sin un [[glosario/conjunto-de-evaluacion]] que lo justifique.

## No confundir con

- **[[glosario/reranking]]**: vuelve a puntuar cada candidato con un modelo. RRF solo reordena posiciones que ya tenías; lo normal es aplicar RRF y después reranking.
- **Normalizar y sumar puntuaciones**: es posible (Qdrant ofrece DBSF), pero depende de la distribución de cada lista.

## Ver también

- [[recetas/fusionar-rankings-con-rrf]]
- [[glosario/busqueda-hibrida]]
- [[recetas/busqueda-hibrida-con-qdrant]]
- [[cursos/rag-a-fondo/03-recuperar-bien]]
