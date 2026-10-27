---
titulo: Embeddings
descripcion: Vectores numéricos que representan el significado de un texto, de forma que textos parecidos quedan cerca.
creado: 2026-08-03
categoria: contexto
aliases: [embedding, incrustaciones, vectores semánticos]
tags: [rag, contexto]
relacionados: ["[[roadmap/30-contexto-y-rag/01-embeddings]]", "[[glosario/vector-store]]"]
---

Un *embedding* es un vector de números que un modelo especializado asigna a un texto. Está construido para que textos con significado parecido tengan vectores cercanos, aunque no compartan palabras: «devolver un pedido» y «reembolso de una compra» quedan próximos. Es la base de la búsqueda semántica.

## En la práctica

Calculas el embedding de cada fragmento de tus documentos, lo guardas en un [[glosario/vector-store]] y, en cada consulta, calculas el de la pregunta y buscas los vecinos más cercanos, normalmente con [[glosario/similitud-coseno]]. Usa el mismo modelo de embeddings para indexar y para consultar: vectores de modelos distintos no son comparables. Anthropic no ofrece modelo de embeddings propio, así que usa el proveedor que prefieras.

## No confundir con

- **[[glosario/token|Tokens]]**: la unidad en que el modelo lee texto. Un embedding resume un texto entero en un único vector.
- **[[glosario/bm25|BM25]]**: búsqueda por palabras exactas. Por eso se combinan en la [[glosario/busqueda-hibrida]].

## Ver también

- [[roadmap/30-contexto-y-rag/01-embeddings]]
- [[docs/contexto/03-rag]]
- [[recetas/busqueda-hibrida-con-bm25]]
- [[glosario/chunking]]
