---
titulo: RAG
descripcion: Técnica que recupera fragmentos relevantes de tus documentos y los añade al contexto para que el modelo responda con ellos.
creado: 2026-08-01
categoria: contexto
ingles: Retrieval-Augmented Generation
aliases: [Retrieval-Augmented Generation, generación aumentada por recuperación, recuperación aumentada]
tags: [rag, contexto]
relacionados: ["[[docs/contexto/03-rag]]", "[[cursos/rag-a-fondo/index]]"]
---

RAG (*Retrieval-Augmented Generation*) es buscar en tus propias fuentes la información relevante para una pregunta e incluirla en el contexto antes de que el modelo responda. Así el modelo trabaja con datos actualizados y privados que no vio en su entrenamiento, y puede citar de dónde sale cada afirmación. El término viene de Lewis et al. (2020).

## En la práctica

Tiene dos fases. **Indexar**: trocear los documentos ([[glosario/chunking]]), calcular sus [[glosario/embeddings]] y guardarlos en un [[glosario/vector-store]]. **Consultar**: buscar los fragmentos más parecidos a la pregunta, idealmente con [[glosario/busqueda-hibrida]] y [[glosario/reranking]], y pasárselos al modelo con instrucciones de citar. Muchos fallos nacen en la recuperación: evalúa por separado si los fragmentos correctos llegan al contexto.

## No confundir con

- **[[glosario/fine-tuning]]**: cambia el modelo. RAG no lo toca; cambia lo que lee.
- **[[glosario/contexto-largo]]**: meterlo todo en la ventana. Funciona con poco material, pero es más caro y el modelo aprovecha peor la información enterrada.

## Ver también

- [[docs/contexto/03-rag]]
- [[cursos/rag-a-fondo/01-anatomia-de-un-rag]]
- [[sistemas/rag-con-citas]]
- [[glosario/grounding]]
