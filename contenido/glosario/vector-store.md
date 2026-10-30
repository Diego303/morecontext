---
titulo: Vector store
descripcion: Base de datos que guarda embeddings y permite buscar rápidamente los vectores más parecidos a una consulta.
creado: 2026-08-05
actualizado: 2026-10-29
categoria: contexto
aliases: [base de datos vectorial, vector database, índice vectorial]
tags: [rag, contexto]
relacionados: ["[[glosario/embeddings]]", "[[docs/contexto/03-rag]]"]
---

Un *vector store* es un almacén especializado en [[glosario/embeddings]]: guarda cada vector junto con su texto y sus metadatos, y responde a la pregunta «¿qué vectores se parecen más a este?» sin comparar uno por uno con todo el índice. Es el componente de búsqueda de la mayoría de sistemas [[glosario/rag|RAG]].

## En la práctica

Para buscar rápido en colecciones grandes, usa índices de vecinos aproximados ([[glosario/ann|ANN]], como [[glosario/hnsw|HNSW]]): sacrifican algo de exactitud a cambio de velocidad. Elige según volumen y operación: una extensión vectorial en tu base de datos actual (como [[herramientas/pgvector]] en PostgreSQL) suele bastar para empezar, y un servicio dedicado (Qdrant, LanceDB, Chroma, todos con versión open source) tiene sentido cuando crece el corpus o la carga. Aprovecha los filtros por metadatos (cliente, fecha, tipo de documento) para no recuperar fragmentos que el usuario no debería ver; en un sistema [[glosario/multi-tenant]] es obligatorio. Si combinas con [[glosario/bm25|BM25]], asegúrate de que el sistema lo admite o de que puedes fusionar resultados tú (en Chroma, por ejemplo, la búsqueda híbrida es solo de su servicio en la nube).

## No confundir con

- **Buscador de texto completo**: indexa palabras, no significado. Para combinarlos, ver [[glosario/busqueda-hibrida]].

## Ver también

- [[roadmap/30-contexto-y-rag/01-embeddings]]
- [[docs/contexto/03-rag]]
- [[cursos/rag-a-fondo/02-indexar-bien]]
- [[glosario/similitud-coseno]]
- [[docs/modelos-abiertos/05-bases-vectoriales]]
