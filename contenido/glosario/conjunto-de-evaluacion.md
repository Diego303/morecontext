---
titulo: Conjunto de evaluación
descripcion: Colección de casos de prueba con entradas y criterios de éxito con la que mides de forma repetible un sistema con LLM.
creado: 2026-09-08
categoria: evals
ingles: eval set
aliases: [eval set, dataset de evaluación, conjunto de prueba, golden set]
tags: [evals]
relacionados: ["[[roadmap/80-evals/02-conjunto-de-prueba]]", "[[cursos/evals-para-agentes/02-datasets-de-evaluacion]]"]
---

Un conjunto de evaluación es la lista de casos con la que ejecutas tus [[glosario/evals]]: cada caso tiene una entrada y lo que cuenta como acierto, sea una respuesta esperada, unos hechos que deben aparecer o una rúbrica. Es lo que convierte «parece que va mejor» en un número comparable entre versiones.

## En la práctica

Empieza pequeño y real: casos sacados de uso real, de errores que ya has visto y de los casos límite que te preocupan, no ejemplos inventados que el sistema resuelve fácilmente. Etiqueta cada caso por tipo para ver dónde falla. Añade un caso nuevo cada vez que encuentres un fallo en producción. Separa los casos con los que iteras el prompt de los que usas para validar, o acabarás ajustando el sistema a las preguntas del examen. Versiona el conjunto junto al código.

## No confundir con

- **Datos de entrenamiento**: sirven para ajustar un modelo con [[glosario/fine-tuning]]. El conjunto de evaluación no se usa para entrenar.

## Ver también

- [[roadmap/80-evals/02-conjunto-de-prueba]]
- [[cursos/evals-para-agentes/02-datasets-de-evaluacion]]
- [[recetas/evals-de-regresion-en-ci]]
- [[docs/evals/01-disenar-evals]]
