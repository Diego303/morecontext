---
titulo: Evals
descripcion: Referencia para medir la calidad de prompts y agentes con conjuntos de prueba, graders de código y modelos juez.
creado: 2026-10-14
orden: 6
tags: [evals, docs]
relacionados: ["[[glosario/evals]]", "[[roadmap/80-evals/index]]", "[[disciplinas/evals]]"]
---

Las [[glosario/evals|evals]] son pruebas automáticas para sistemas con modelos de lenguaje: un conjunto de casos, una forma de puntuar cada respuesta y un número que puedes comparar entre versiones. Sin ellas, cada cambio de prompt o de modelo es una apuesta. Este grupo es la referencia técnica; el porqué y la práctica guiada están en el nivel [[roadmap/80-evals/index]].

## Qué cubre

- **[[docs/evals/01-disenar-evals]]**. Cómo pasar de «parece que va bien» a un conjunto de prueba con criterios de éxito, cómo elegir el tipo de grader para cada criterio y cómo montar un arnés mínimo que puedas ejecutar en cada cambio. Empieza aquí.
- **[[docs/evals/02-modelo-como-juez]]**. Cuándo usar un modelo para puntuar respuestas, cómo escribir la rúbrica, cómo obtener veredictos estructurados y cómo comprobar que el juez coincide con tu criterio. Incluye los sesgos conocidos y cómo mitigarlos.

## Cómo se relaciona con lo demás

Las evals sostienen casi todas las decisiones del resto de la documentación. Para elegir modelo, la [[modelos/05-elegir-modelo-por-tarea|guía de modelos]] propone bajar de tier midiendo con evals. Para un agente, interesa también cómo llegó a la respuesta: eso es la [[glosario/trayectoria|trayectoria]], tratada en [[roadmap/80-evals/04-evals-de-trayectoria]]. Y para que no se rompan sin avisar, ejecútalas en integración continua con [[recetas/evals-de-regresion-en-ci]].

Si quieres un recorrido más completo y centrado en agentes, sigue el curso [[cursos/evals-para-agentes/index]].
