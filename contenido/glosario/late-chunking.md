---
titulo: Late chunking
descripcion: Codificar el documento entero con un modelo de embeddings de contexto largo y trocear después, para que cada fragmento conserve el contexto del documento.
creado: 2026-10-29
categoria: contexto
ingles: Late chunking
aliases: [late chunking, troceado tardío, chunking tardío]
tags: [rag, embeddings]
relacionados: ["[[glosario/chunking]]", "[[glosario/recuperacion-contextual]]", "[[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]"]
---

*Late chunking* invierte el orden habitual del [[glosario/chunking]]. En lugar de trocear el documento y calcular un embedding por trozo, pasas el documento completo por un modelo de [[glosario/embeddings]] de contexto largo, obtienes un vector por token y troceas **después**, promediando (*mean pooling*) los tokens de cada fragmento. Lo propusieron [Günther et al. (Jina AI, 2024)](https://arxiv.org/abs/2409.04701).

## En la práctica

El beneficio aparece con referencias que cruzan fragmentos. Si un trozo dice «la ciudad tiene 3,7 millones de habitantes» y el nombre de la ciudad estaba dos párrafos antes, el troceado normal pierde ese vínculo; con *late chunking*, los vectores de esos tokens ya «vieron» el nombre. Necesitas un modelo que acepte el documento entero en su ventana y que te dé las salidas por token (no solo el vector final), así que no vale cualquier API de embeddings. Los documentos más largos que esa ventana hay que partirlos antes igualmente.

## No confundir con

- **[[glosario/recuperacion-contextual]]**: un LLM escribe un texto de contexto para cada fragmento antes de calcular su embedding. Más caro al indexar y no exige un modelo especial.
- **[[glosario/interaccion-tardia]]**: guarda un vector por token también en el índice; *late chunking* guarda uno por fragmento.

## Ver también

- [[roadmap/30-contexto-y-rag/02-chunking]]
- [[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]
- [[recetas/chunks-padre-hijo]]
- [[docs/modelos-abiertos/04-embeddings-y-rerankers]]
