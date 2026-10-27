---
titulo: Chunking
descripcion: Trocear documentos en fragmentos del tamaño adecuado para indexarlos y recuperarlos en un sistema RAG.
creado: 2026-08-04
categoria: contexto
aliases: [troceado, troceo, fragmentación de documentos]
tags: [rag, contexto]
relacionados: ["[[roadmap/30-contexto-y-rag/02-chunking]]", "[[recetas/trocear-documentos]]"]
---

*Chunking* es dividir los documentos en fragmentos (*chunks*) antes de indexarlos, para que la búsqueda devuelva trozos relevantes y del tamaño justo en lugar de documentos enteros. Es el primer paso de cualquier [[glosario/rag|RAG]] y uno de los que más influyen en la calidad final.

## En la práctica

Las decisiones clave son tres: tamaño del fragmento, solapamiento entre fragmentos consecutivos y dónde cortar. Cortar por estructura (títulos, párrafos, funciones) suele funcionar mejor que cortar cada N caracteres, porque no parte ideas por la mitad. Guarda con cada fragmento sus metadatos (documento, sección, página) para poder citar la fuente. Un fragmento demasiado pequeño pierde contexto; uno demasiado grande diluye el [[glosario/embeddings|embedding]] y gasta tokens. Mide con tus propias preguntas antes de fijar valores.

## No confundir con

- **[[glosario/tokenizador|Tokenización]]**: divide texto en tokens para el modelo, no en fragmentos para buscar.

## Ver también

- [[roadmap/30-contexto-y-rag/02-chunking]]
- [[recetas/trocear-documentos]]
- [[cursos/rag-a-fondo/02-indexar-bien]]
- [[glosario/recuperacion-contextual]]
