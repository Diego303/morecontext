---
titulo: GraphRAG
descripcion: RAG que construye un grafo de entidades y relaciones con resúmenes por comunidades para responder preguntas sobre todo el corpus.
creado: 2026-10-29
categoria: contexto
ingles: GraphRAG
aliases: [GraphRAG, Graph RAG, RAG con grafos, RAG sobre grafo de conocimiento]
tags: [rag, grafos]
relacionados: ["[[cursos/rag-a-fondo/09-cuando-el-rag-vectorial-no-basta]]", "[[glosario/multi-hop]]", "[[glosario/rag]]"]
---

GraphRAG es un enfoque de [[glosario/rag|RAG]] que, al indexar, usa un LLM para extraer entidades y relaciones del corpus, las organiza en un grafo, agrupa el grafo en comunidades y escribe un resumen de cada una. Lo presentaron Edge et al. (Microsoft) en [*From Local to Global: A Graph RAG Approach to Query-Focused Summarization*](https://arxiv.org/abs/2404.16130) (2024) para preguntas globales, del tipo «¿cuáles son los temas principales de estos documentos?».

## En la práctica

La búsqueda vectorial recupera fragmentos parecidos a la pregunta, y eso falla cuando la respuesta no está en ningún fragmento concreto: un resumen de todo el corpus o una cadena de relaciones entre entidades. GraphRAG responde las globales combinando los resúmenes de comunidades, y las locales partiendo de las entidades de la pregunta y recorriendo sus vecinas en el grafo. El precio está en la indexación: muchas llamadas al modelo para extraer y resumir, y reconstrucciones cuando cambia el corpus. LightRAG (Guo et al., 2024) propone una indexación en grafo más ligera. Empieza por un RAG híbrido y prueba GraphRAG solo si tus evals muestran que fallan justo esas preguntas.

## No confundir con

- **Base de datos de grafos**: el almacén. GraphRAG es el método de construir y consultar el grafo para dar contexto a un LLM.
- **[[glosario/rag-agentico]]**: un agente que decide qué buscar en varios pasos; puede usar un grafo o no.

## Ver también

- [[cursos/rag-a-fondo/09-cuando-el-rag-vectorial-no-basta]]
- [[glosario/multi-hop]]
- [[glosario/rag-agentico]]
- [[docs/contexto/03-rag]]
