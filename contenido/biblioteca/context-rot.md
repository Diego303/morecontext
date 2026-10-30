---
titulo: Context rot (Chroma, 2025)
descripcion: El informe que midió en 18 modelos cómo cae el rendimiento al crecer la entrada, incluso en tareas triviales, y por qué importa tanto cómo presentas la información.
creado: 2026-10-29
tags: [biblioteca, contexto, context-rot, contexto-largo]
relacionados: ["[[glosario/context-rot]]", "[[biblioteca/lost-in-the-middle]]", "[[biblioteca/context-engineering-anthropic]]", "[[cursos/context-engineering/01-el-contexto-como-presupuesto]]"]
autores: Hong, Troynikov y Huber (Chroma)
anio: 2025
url: https://www.trychroma.com/research/context-rot
tipo: ensayo
tema: contexto
nivel: intermedio
---

*Context Rot: How Increasing Input Tokens Impacts LLM Performance* (Kelly Hong, Anton Troynikov y Jeff Huber, informe técnico de Chroma, 14 de julio de 2025) pone a prueba una suposición cómoda: que un modelo trata igual el token 1.000 que el 100.000. No es así. El rendimiento se vuelve menos fiable a medida que crece la entrada, aunque la tarea sea sencilla y la información esté ahí. Es la medición empírica más citada del fenómeno que hoy llamamos [[glosario/context-rot|context rot]].

## La idea clave

Los autores parten de una crítica a la prueba de la «aguja en un pajar»: mide recuperación casi literal, y sacar buena nota en ella da una impresión falsa de que el contexto largo funciona igual en todo. **Su diseño mantiene constante la dificultad de la tarea y varía solo la longitud de la entrada**, para aislar el efecto del tamaño.

Con ese diseño evalúan [18 modelos](https://www.trychroma.com/research/context-rot) de Anthropic, OpenAI, Google y Alibaba (familias Claude 4, GPT-4.1, Gemini 2.5 y Qwen3, entre otras) y encuentran varias cosas que no son obvias:

- **La similitud entre pregunta y respuesta importa.** Cuando la «aguja» se parece poco a la pregunta, el rendimiento cae más rápido al crecer la entrada. Con entradas cortas, los modelos aciertan igual.
- **Un solo distractor ya empeora.** Basta un texto parecido a la respuesta, pero incorrecto, para bajar el rendimiento respecto a la aguja sola; con cuatro, peor. Los modelos no reaccionan igual: en las pruebas, los Claude tendían a abstenerse cuando dudaban y los GPT daban más respuestas erróneas con seguridad.
- **La estructura coherente perjudica.** Con el pajar barajado frase a frase, los resultados fueron mejores que con el texto original en los 18 modelos. Los autores no explican el mecanismo; lo dejan como hallazgo.
- **Contexto enfocado frente a historial completo.** En LongMemEval, con unos 113.000 tokens de historial completo frente a unos 300 de versión enfocada, todas las familias rindieron bastante mejor con la versión enfocada. El razonamiento extendido ayudó en ambas, pero no cerró la distancia.
- **Ni siquiera copiar es seguro.** Al pedir repetir una secuencia de palabras repetidas con una distinta en medio, el rendimiento empeoró con la longitud en todos los modelos.

La conclusión de los autores es que importa más **cómo se presenta** la información que el simple hecho de que esté en el contexto.

## Por qué importa hoy

Cuando una ventana admite cientos de miles de tokens, la tentación es meterlo todo. Este informe es el argumento empírico para no hacerlo:

- **En RAG, la precisión gana a la exhaustividad.** Un fragmento recuperado que se parece a la respuesta pero no lo es actúa como distractor. Por eso el [[glosario/reranking|reranking]] y recuperar menos fragmentos y mejores suele mejorar la respuesta. Es una causa típica de [[problemas/el-rag-encuentra-pero-responde-mal]].
- **En agentes largos, el historial se degrada solo.** Cada resultado de herramienta que ya no hace falta es ruido para las decisiones siguientes. De ahí la [[glosario/compactacion|compactación]], las notas fuera de la ventana y los subagentes.
- **El tamaño nominal de la ventana no dice cuánto puedes usar bien.** Eso solo lo sabes midiendo con tus tareas a distintas longitudes.

> [!aviso] Tareas simples a propósito
> Las pruebas son deliberadamente fáciles. Los autores esperan que en tareas reales la degradación sea mayor, pero no lo midieron. No traslades sus porcentajes a tu caso: mide el tuyo.

## Qué leer primero

1. **La introducción**, con la crítica a la aguja en un pajar y el diseño experimental.
2. **«Impact of Distractors»** y **«LongMemEval»**: los dos resultados que más se aplican a RAG y a agentes.
3. **«Haystack Structure»**: el hallazgo más sorprendente.
4. **«Limitations & Future Work»**: qué no demuestra el informe.

El apéndice explica cómo calibraron el juez (GPT-4.1) contra etiquetas humanas; es un buen ejemplo de [[recetas/validar-un-modelo-juez|validación de un juez]].

## Qué ha envejecido

Los modelos evaluados ya no son los de frontera, así que las diferencias entre proveedores que muestra pueden no valer hoy. Lo que perdura es el patrón: dos meses después, Anthropic da la degradación por presente en todos los modelos, en mayor o menor grado, y construye sobre ella su ensayo de *context engineering*.

Dos límites que reconocen los propios autores: no explican por qué ocurre la degradación, y algunos resultados se apoyan solo en dos temas de pajar, lo que limita cuánto se pueden generalizar.

## Dónde lo ves en MoreContext

- [[cursos/context-engineering/01-el-contexto-como-presupuesto]]: el contexto como presupuesto, con este informe como base.
- [[biblioteca/lost-in-the-middle]]: el trabajo anterior sobre la posición de la información.
- [[biblioteca/context-engineering-anthropic]]: las técnicas que responden a este problema.
- [[radar/2026-09-22-contexto-largo-no-sustituye-recuperacion]] y [[modelos/07-documentos-largos]]: por qué la ventana grande no sustituye a recuperar bien.
- [[problemas/contexto-saturado-en-sesiones-largas]] y [[recetas/canario-de-contexto]]: el síntoma en sesiones largas y cómo detectarlo.
- [[roadmap/30-contexto-y-rag/04-reranking]]: quitar distractores antes de responder.
