---
titulo: Bi-encoder
descripcion: Modelo que codifica consulta y documento por separado en dos vectores comparables; es lo que hace un modelo de embeddings.
creado: 2026-10-29
categoria: contexto
ingles: Bi-encoder
aliases: [bi-encoder, biencoder, dual encoder, codificador dual]
tags: [rag, busqueda, embeddings]
relacionados: ["[[glosario/embeddings]]", "[[glosario/cross-encoder]]", "[[docs/modelos-abiertos/04-embeddings-y-rerankers]]"]
---

Un *bi-encoder* convierte la consulta y cada documento en un vector por separado, con el mismo modelo o con dos modelos entrenados juntos, y mide su parecido con una operación barata como la [[glosario/similitud-coseno]]. Los modelos de [[glosario/embeddings]] que usas en un RAG son bi-encoders.

## En la práctica

Su ventaja es que el trabajo caro se hace una vez: calculas los vectores de todo el corpus al indexar, los guardas en un [[glosario/vector-store]] y en cada consulta solo codificas la pregunta y buscas vecinos con un índice [[glosario/ann|ANN]]. Por eso escala a millones de fragmentos. Su límite es que consulta y documento nunca se «ven»: todo el significado tiene que caber en un vector, y se le escapan matices como negaciones o qué entidad hace qué. Muchos modelos distinguen cómo codificar consultas y documentos (en sentence-transformers, `encode_query` y `encode_document`); respeta esa diferencia o perderás calidad.

## No confundir con

- **[[glosario/cross-encoder]]**: lee consulta y documento juntos y da una puntuación. Más preciso y demasiado lento para todo el corpus; se usa para el [[glosario/reranking]] de los candidatos del bi-encoder.
- **[[glosario/interaccion-tardia]]** (ColBERT): codifica por separado, pero guarda un vector por token y compara token a token.

## Ver también

- [[docs/modelos-abiertos/04-embeddings-y-rerankers]]
- [[roadmap/30-contexto-y-rag/01-embeddings]]
- [[cursos/rag-a-fondo/03-recuperar-bien]]
- [[glosario/cross-encoder]]
