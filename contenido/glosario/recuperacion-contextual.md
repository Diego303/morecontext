---
titulo: Recuperación contextual
descripcion: Técnica de RAG que añade a cada fragmento una breve explicación de su contexto en el documento antes de indexarlo.
creado: 2026-08-08
actualizado: 2026-10-29
categoria: contexto
ingles: contextual retrieval
aliases: [contextual retrieval, embeddings contextuales, fragmentos contextualizados]
tags: [rag, busqueda]
relacionados: ["[[cursos/rag-a-fondo/03-recuperar-bien]]", "[[glosario/chunking]]"]
---

La recuperación contextual es una técnica que Anthropic describió en [*Introducing Contextual Retrieval*](https://www.anthropic.com/news/contextual-retrieval) (19 sept. 2024; hoy la página se titula *Contextual retrieval in AI systems*): antes de indexar cada fragmento, un modelo genera una o dos frases que lo sitúan dentro de su documento y se anteponen al texto del fragmento. Así, un trozo que dice «los ingresos crecieron un 3 %» pasa a indicar de qué empresa y de qué trimestre habla.

## En la práctica

Para cada fragmento llamas al modelo con el documento completo y el fragmento, y le pides el contexto breve. Ese texto enriquecido se usa tanto para calcular los [[glosario/embeddings]] como para el índice [[glosario/bm25|BM25]], y luego se combina con [[glosario/busqueda-hibrida]] y [[glosario/reranking]]. El coste está en la indexación, una llamada por fragmento: usa [[glosario/prompt-caching]] para no pagar el documento completo en cada una. No depende de Claude: puedes generar esos contextos con un modelo abierto en local, sin pagar por llamada. Compara con tus evals si mejora la recuperación en tu corpus.

## No confundir con

- **Solapamiento entre fragmentos**: repite texto vecino, pero no explica a qué documento o sección pertenece el fragmento.
- **[[glosario/late-chunking]]**: ataca el mismo problema sin llamar a un LLM, calculando los embeddings sobre el documento entero antes de trocear.

## Ver también

- [[cursos/rag-a-fondo/03-recuperar-bien]]
- [[glosario/chunking]]
- [[glosario/rag]]
- [[cursos/rag-a-fondo/02-indexar-bien]]
- [[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]
