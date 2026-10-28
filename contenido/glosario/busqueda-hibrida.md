---
titulo: Búsqueda híbrida
descripcion: Combinar búsqueda por palabras clave y búsqueda vectorial y fusionar sus resultados para recuperar mejor.
creado: 2026-08-06
categoria: contexto
ingles: hybrid search
aliases: [hybrid search, búsqueda mixta, recuperación híbrida]
tags: [rag, busqueda]
relacionados: ["[[roadmap/30-contexto-y-rag/03-busqueda-hibrida]]", "[[recetas/busqueda-hibrida-con-bm25]]"]
---

La búsqueda híbrida lanza la misma consulta contra dos índices, uno léxico ([[glosario/bm25|BM25]]) y uno vectorial ([[glosario/embeddings]]), y combina los resultados en una sola lista. Cada método cubre los fallos del otro: el léxico acierta con términos exactos y el vectorial con paráfrasis y sinónimos.

## En la práctica

Las puntuaciones de BM25 y de similitud vectorial no están en la misma escala, así que no se suman sin más. Lo habitual es fusionar por posición con *Reciprocal Rank Fusion* (RRF): cada documento suma `1 / (k + posición)` en cada lista donde aparece, con `k` en torno a 60. Después, un [[glosario/reranking]] reordena los mejores candidatos antes de pasarlos al modelo. Mide con tus preguntas reales si cada pieza mejora la recuperación.

## No confundir con

- **[[glosario/recuperacion-contextual]]**: mejora lo que se indexa en cada fragmento; se combina con la búsqueda híbrida, no la sustituye.

## Ver también

- [[roadmap/30-contexto-y-rag/03-busqueda-hibrida]]
- [[recetas/busqueda-hibrida-con-bm25]]
- [[cursos/rag-a-fondo/03-recuperar-bien]]
- [[glosario/rag]]
