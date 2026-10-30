---
titulo: Cross-encoder
descripcion: Modelo que lee consulta y documento juntos y devuelve una puntuación de relevancia; el tipo de modelo habitual en el reranking.
creado: 2026-10-29
categoria: contexto
ingles: Cross-encoder
aliases: [cross-encoder, crossencoder, codificador cruzado, reranker cross-encoder]
tags: [rag, busqueda, reranking]
relacionados: ["[[glosario/reranking]]", "[[glosario/bi-encoder]]", "[[docs/modelos-abiertos/04-embeddings-y-rerankers]]"]
---

Un *cross-encoder* recibe la consulta y un documento concatenados en una sola entrada y devuelve un número: lo relevante que es ese documento para esa consulta. Como el modelo atiende a las dos a la vez, capta relaciones que se pierden al comparar dos vectores calculados por separado.

## En la práctica

No puedes precalcular nada: cada par consulta-documento es una pasada del modelo. Por eso no sirve para buscar en todo el corpus y se usa en la segunda fase, el [[glosario/reranking]]: el [[glosario/bi-encoder]] o la [[glosario/busqueda-hibrida]] traen, por ejemplo, 50 candidatos y el cross-encoder los reordena para quedarte con 5. En sentence-transformers se usa con `CrossEncoder(modelo).predict(pares)` o `.rank(consulta, pasajes)`; entre los abiertos están bge-reranker-v2-m3 y mxbai-rerank (revisa la licencia de cada uno). Su coste crece con el número de candidatos y su longitud: mide la latencia que añade y si el [[glosario/recall-at-k|recall@5]] mejora lo bastante para pagarla.

## No confundir con

- **[[glosario/bi-encoder]]**: codifica por separado y compara vectores. Rápido y escalable, menos fino.
- **Reranking con un LLM**: le pides a un modelo generativo que puntúe o elija fragmentos. Es más fácil de ajustar con instrucciones y más caro por candidato.

## Ver también

- [[glosario/reranking]]
- [[roadmap/30-contexto-y-rag/04-reranking]]
- [[cursos/rag-a-fondo/03-recuperar-bien]]
- [[docs/modelos-abiertos/04-embeddings-y-rerankers]]
