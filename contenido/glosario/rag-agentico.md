---
titulo: RAG agéntico
descripcion: RAG en el que el propio agente decide cuándo buscar, qué consulta lanzar y si lo recuperado basta, en varias vueltas.
creado: 2026-10-29
categoria: contexto
ingles: Agentic RAG
aliases: [agentic RAG, RAG con agentes, recuperación agéntica]
tags: [rag, agentes]
relacionados: ["[[glosario/rag]]", "[[cursos/rag-a-fondo/09-cuando-el-rag-vectorial-no-basta]]", "[[glosario/bucle-agentico]]"]
---

En el [[glosario/rag]] clásico tu código recupera una vez, antes de llamar al modelo. En el RAG agéntico la recuperación es una herramienta dentro del [[glosario/bucle-agentico]]: el agente decide cuándo buscar, qué consulta lanzar, en qué fuente, y si lo que encontró basta o tiene que reformular y volver a buscar ([Singh et al., 2025](https://arxiv.org/abs/2501.09136)).

## En la práctica

Brilla con preguntas [[glosario/multi-hop]], fuentes diversas (documentos, SQL, web) y casos en los que la primera búsqueda suele fallar. Los agentes de código son el ejemplo más claro: recuperan *just-in-time* con `grep`, `glob` y lectura de archivos, sin embeddings. A cambio, cada vuelta añade una llamada al modelo, latencia y coste, así que pon un límite de búsquedas y registra cada consulta en la traza para evaluarla. Si una sola búsqueda resuelve la mayoría de preguntas, el RAG clásico es más barato y predecible.

## No confundir con

- **[[glosario/reescritura-de-consulta]]**: un paso fijo que reformula la pregunta antes de buscar; no decide si volver a buscar.

## Ver también

- [[cursos/rag-a-fondo/09-cuando-el-rag-vectorial-no-basta]]
- [[docs/contexto/03-rag]]
- [[patrones/08-agente-autonomo]]
- [[glosario/graphrag]]
