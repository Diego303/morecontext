---
titulo: Atención
descripcion: Mecanismo por el que cada token de un Transformer combina la información de los demás según lo relevantes que le resultan.
creado: 2026-10-29
categoria: fundamentos
ingles: Attention
aliases: [Attention, autoatención, self-attention, mecanismo de atención]
tags: [fundamentos, transformer, atencion]
relacionados: ["[[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]", "[[glosario/transformer]]", "[[biblioteca/attention-is-all-you-need]]"]
---

La atención es el mecanismo con el que una red decide, para cada elemento de una secuencia, cuánto peso dar a cada uno de los demás, y mezcla su información en esa proporción. La propusieron Bahdanau, Cho y Bengio en 2014 para traducción automática, y el [[glosario/transformer|Transformer]] (Vaswani et al., 2017) la convirtió en su pieza central. En la **autoatención**, cada [[glosario/token|token]] produce una consulta, una clave y un valor; su consulta se compara con las claves de los demás, softmax convierte esas puntuaciones en pesos que suman 1 y con ellos se mezclan los valores.

## En la práctica

Explica tres cosas que ves a diario. Cada token de la respuesta puede atender a cualquier parte del contexto, y por eso funciona pasar documentos en el prompt. Como los pesos suman 1, el texto irrelevante reparte la atención, y más contexto no siempre es mejor ([[glosario/context-rot]], [[glosario/lost-in-the-middle]]). Y como cada token se compara con todos, el coste crece con la longitud: de ahí el límite de la [[glosario/ventana-de-contexto|ventana de contexto]] y el ahorro del [[glosario/prompt-caching|prompt caching]].

## No confundir con

- **[[glosario/transformer|Transformer]]**: la arquitectura completa. La atención es una de sus piezas, junto a las capas densas, las conexiones residuales y la normalización.

## Ver también

- [[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]
- [[biblioteca/atencion-bahdanau]]
- [[biblioteca/attention-is-all-you-need]]
- [[cursos/context-engineering/01-el-contexto-como-presupuesto]]
