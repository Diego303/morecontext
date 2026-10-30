---
titulo: Prompt
descripcion: Todo el texto y los datos que envías al modelo en una petición para indicarle qué hacer y con qué información.
creado: 2026-07-14
actualizado: 2026-10-29
categoria: prompting
aliases: [instrucción, entrada del modelo, indicación]
tags: [prompting]
relacionados: ["[[roadmap/10-prompting/01-instrucciones-claras]]", "[[modelos/01-principios-de-prompting]]"]
---

Un *prompt* es la entrada que le das al modelo: instrucciones, contexto, ejemplos, documentos y la pregunta concreta. En una API de mensajes se reparte entre el [[glosario/prompt-de-sistema]], los mensajes del usuario y del asistente y, si las hay, las definiciones de herramientas. El modelo solo sabe lo que hay ahí.

## En la práctica

Un buen prompt se parece a un buen encargo a un compañero que no conoce tu proyecto: qué quieres, para qué, con qué datos, en qué formato y qué hacer si algo no está claro. Separa las partes con etiquetas (`<documento>`, `<instrucciones>`) para que no se mezclen. Versiona los prompts como código y mide cada cambio con [[glosario/evals]]: una mejora en un caso puede romper otros. Para tareas de varios pasos con agentes, el prompt suelto se queda corto: lo que funciona es una especificación con criterios de aceptación (ver [[glosario/sdd]]).

## No confundir con

- **[[glosario/prompt-de-sistema]]**: la parte fija del prompt que define rol y reglas.
- **Contexto**: término más amplio que incluye todo lo que ocupa la [[glosario/ventana-de-contexto]], también resultados de herramientas e historial. Diseñarlo es el trabajo del *context engineering*.

## Ver también

- [[roadmap/10-prompting/01-instrucciones-claras]]
- [[modelos/01-principios-de-prompting]]
- [[modelos/08-antipatrones]]
- [[disciplinas/context-engineering]]
- [[blog/2026-10-19-haz-que-funcione-no-es-una-instruccion]]
