---
titulo: Contexto largo
descripcion: Trabajar con entradas de muchos tokens en una sola petición, con sus ventajas y sus límites prácticos de calidad y coste.
creado: 2026-09-22
categoria: contexto
ingles: long context
aliases: [long context, contexto extenso, ventana larga]
tags: [contexto]
relacionados: ["[[modelos/07-documentos-largos]]", "[[radar/2026-09-22-contexto-largo-no-sustituye-recuperacion]]"]
---

Contexto largo es usar ventanas de contexto grandes para pasarle al modelo documentos enteros, repositorios o historiales extensos en una sola petición, en lugar de recuperar solo fragmentos. Simplifica la arquitectura, pero no es gratis: cada token cuesta, añade [[glosario/latencia]] y el modelo no aprovecha todo el contexto por igual.

## En la práctica

Liu et al. (2023) mostraron en *Lost in the Middle* que los modelos usan peor la información situada en mitad de un contexto largo que la del principio o el final. Para mitigarlo: pon los documentos arriba y la pregunta al final, etiqueta cada documento, pide que extraiga las citas relevantes antes de responder y usa [[glosario/prompt-caching]] si vas a preguntar varias veces sobre el mismo material. Si el corpus no cabe o cambia a menudo, combínalo con [[glosario/rag|RAG]].

## No confundir con

- **[[glosario/ventana-de-contexto]]**: el límite técnico de tokens. Contexto largo es la práctica de llenarla.

## Ver también

- [[modelos/07-documentos-largos]]
- [[radar/2026-09-22-contexto-largo-no-sustituye-recuperacion]]
- [[cursos/context-engineering/02-que-meter-y-que-no]]
- [[glosario/compactacion]]
