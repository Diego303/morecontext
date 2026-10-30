---
titulo: Context rot
descripcion: Por qué un modelo rinde peor cuanto más larga es la entrada, aunque la información que necesita esté dentro.
creado: 2026-10-29
categoria: contexto
ingles: Context rot
aliases: [context rot, degradación del contexto, pudrición del contexto]
tags: [contexto, agentes]
relacionados: ["[[biblioteca/context-rot]]", "[[disciplinas/context-engineering]]", "[[glosario/lost-in-the-middle]]"]
---

*Context rot* es la degradación del rendimiento de un modelo a medida que crece su entrada, incluso cuando el dato que necesita está presente. El término lo popularizó un estudio de Chroma ([Hong, Troynikov y Huber, 14 jul. 2025](https://www.trychroma.com/research/context-rot)) sobre 18 modelos: el acierto cae con la longitud también en tareas simples, cae más deprisa cuando la pregunta y la respuesta se parecen poco, y un solo distractor ya empeora el resultado.

## En la práctica

Que algo quepa en la [[glosario/ventana-de-contexto]] no garantiza que el modelo lo use bien. En el mismo estudio, un prompt enfocado con lo relevante superó con claridad al historial completo de una conversación. Por eso en agentes largos conviene recuperar poco y bien, [[glosario/compactacion|compactar]], sacar las notas a archivos y delegar la exploración en [[glosario/subagente|subagentes]] que devuelvan resúmenes. Un [[glosario/canario-de-contexto]] te avisa cuando el agente empieza a olvidar.

## No confundir con

- **[[glosario/lost-in-the-middle|Lost in the middle]]**: el efecto de la *posición* del dato dentro del contexto. El *context rot* habla de la *longitud* total.
- **Desbordar la ventana**: ahí la entrada no cabe y la API corta; con *context rot* cabe, pero rinde peor.

## Ver también

- [[biblioteca/context-rot]]
- [[cursos/context-engineering/02-que-meter-y-que-no]]
- [[problemas/contexto-saturado-en-sesiones-largas]]
- [[glosario/contexto-largo]]
