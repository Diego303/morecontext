---
titulo: HyDE
descripcion: Técnica de recuperación que pide al modelo una respuesta hipotética y busca con su embedding en lugar del de la pregunta.
creado: 2026-10-29
categoria: contexto
ingles: Hypothetical Document Embeddings
aliases: [Hypothetical Document Embeddings, HyDE, documento hipotético, embeddings de documento hipotético]
tags: [rag, busqueda, consulta]
relacionados: ["[[glosario/reescritura-de-consulta]]", "[[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]", "[[glosario/embeddings]]"]
---

HyDE (*Hypothetical Document Embeddings*) cambia lo que se busca: en lugar de calcular el embedding de la pregunta, pides a un LLM que escriba un documento que podría responderla, calculas el embedding de ese texto y buscas fragmentos reales parecidos. La describieron Gao, Ma, Lin y Callan en *Precise Zero-Shot Dense Retrieval without Relevance Labels* ([arXiv 2212.10496](https://arxiv.org/abs/2212.10496), 2022).

## En la práctica

Funciona porque una respuesta se parece más a otro fragmento de documentación que una pregunta corta. Ante «¿puedo devolver algo abierto?», el modelo redacta un párrafo del estilo «Los productos abiertos se aceptan en un plazo de…», y ese párrafo cae cerca de la política de devoluciones real. Lo que inventa el documento hipotético da igual: solo se usa para buscar, nunca se le enseña al usuario ni entra en el contexto. Cuesta una llamada al modelo antes de cada búsqueda, y empeora cuando el modelo no sabe nada del dominio y escribe algo que apunta a otro sitio. Pruébalo contra la consulta original con tu [[glosario/conjunto-de-evaluacion]] y combina ambas si dudas.

## No confundir con

- **[[glosario/reescritura-de-consulta]]**: reformula la pregunta como una consulta mejor. HyDE genera una respuesta falsa para buscar con ella.
- **Contexto generado para cada fragmento** ([[glosario/recuperacion-contextual]]): actúa al indexar, no al consultar.

## Ver también

- [[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]
- [[glosario/reescritura-de-consulta]]
- [[glosario/bi-encoder]]
- [[recetas/depurar-un-rag]]
