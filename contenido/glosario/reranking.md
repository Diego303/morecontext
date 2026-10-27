---
titulo: Reranking
descripcion: Segunda fase de búsqueda que reordena los candidatos recuperados con un modelo más preciso y se queda con los mejores.
creado: 2026-08-07
categoria: contexto
aliases: [reordenación, reclasificación, re-ranking]
tags: [rag, busqueda]
relacionados: ["[[roadmap/30-contexto-y-rag/04-reranking]]", "[[cursos/rag-a-fondo/03-recuperar-bien]]"]
---

*Reranking* es reordenar los resultados de una primera búsqueda con un modelo más caro y más preciso. La primera fase ([[glosario/embeddings]], [[glosario/bm25|BM25]] o [[glosario/busqueda-hibrida]]) es rápida y recupera, por ejemplo, 50 candidatos; el *reranker* puntúa cada uno frente a la pregunta y pasas al modelo solo los mejores.

## En la práctica

Un *reranker* típico es un modelo de tipo *cross-encoder*: lee la pregunta y el fragmento juntos, y por eso juzga la relevancia mejor que comparar dos vectores calculados por separado. Es demasiado lento para todo el corpus, de ahí las dos fases. También puedes usar un LLM como reranker pidiéndole que puntúe o elija fragmentos. Mide si compensa: añade latencia y coste en cada consulta.

## Ver también

- [[roadmap/30-contexto-y-rag/04-reranking]]
- [[cursos/rag-a-fondo/03-recuperar-bien]]
- [[glosario/rag]]
- [[glosario/recuperacion-contextual]]
