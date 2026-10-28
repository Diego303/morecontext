---
titulo: Modelo juez
descripcion: Usar un LLM para puntuar las salidas de otro sistema con una rúbrica, cuando el criterio no se puede comprobar con código.
creado: 2026-09-10
categoria: evals
ingles: LLM-as-a-judge
aliases: [LLM-as-a-judge, LLM como juez, juez LLM]
tags: [evals]
relacionados: ["[[docs/evals/02-modelo-como-juez]]", "[[recetas/modelo-juez-con-rubrica]]"]
---

Un modelo juez es un LLM al que le pasas una salida, el contexto y una rúbrica, y que devuelve una puntuación o un veredicto. Sirve para criterios que el código no puede comprobar: si una respuesta es fiel a la fuente, si responde a lo preguntado, si el tono es adecuado. Zheng et al. (2023) estudiaron su fiabilidad y sus sesgos.

## En la práctica

Los sesgos documentados incluyen preferir la respuesta que aparece primero, preferir respuestas más largas y favorecer textos de su propio modelo. Para reducirlos: una rúbrica concreta con criterios binarios o escalas cortas, pedir el razonamiento antes del veredicto, devolver el resultado como [[glosario/salida-estructurada]] y, al comparar dos salidas, alternar su orden. Antes de fiarte, compara sus notas con las de una persona en una muestra.

## No confundir con

- **Evaluación con código**: comprobaciones deterministas (JSON válido, campo correcto). Úsala siempre que puedas; es más barata y estable.

## Ver también

- [[docs/evals/02-modelo-como-juez]]
- [[roadmap/80-evals/03-codigo-o-modelo-juez]]
- [[recetas/modelo-juez-con-rubrica]]
- [[cursos/evals-para-agentes/03-graders]]
