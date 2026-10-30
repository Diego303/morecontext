---
titulo: Sobreajuste
descripcion: Cuando un modelo memoriza sus datos de entrenamiento, incluido el ruido, y falla con casos nuevos; también te pasa al evaluar un agente.
creado: 2026-10-29
categoria: fundamentos
ingles: Overfitting
aliases: [Overfitting, sobreajustar, overfit]
tags: [fundamentos, machine-learning, evals]
relacionados: ["[[cursos/la-ia-por-dentro/06-sobreajuste-y-generalizacion]]", "[[glosario/conjunto-de-evaluacion]]", "[[glosario/contaminacion-de-benchmark]]"]
---

Hay sobreajuste cuando un modelo aprende los ejemplos de entrenamiento, incluido su ruido, en lugar del patrón que hay detrás: acierta con lo que ha visto y falla con lo nuevo. Se detecta comparando el error de entrenamiento con el de un conjunto de validación. El primero sigue bajando; el segundo baja, se aplana y empieza a subir.

## En la práctica

Los remedios clásicos son más datos, un modelo más simple, regularización, parar a tiempo (*early stopping*) y *dropout* ([Srivastava et al., 2014](https://jmlr.org/papers/v15/srivastava14a.html)). A ti te afecta sobre todo al evaluar un agente. Si iteras un prompt mirando unos casos y luego mides con esos mismos, mides memoria: saca los ejemplos [[glosario/few-shot|few-shot]] del [[glosario/conjunto-de-evaluacion|conjunto de evaluación]] y guarda casos reservados. Añadir una regla al prompt por cada fallo también es sobreajustarlo. Y un benchmark que el modelo vio al entrenarse sobrestima su capacidad ([[glosario/contaminacion-de-benchmark|contaminación]]).

## No confundir con

- **Subajuste** (*underfitting*): el modelo es demasiado simple y falla también en entrenamiento.
- **Fuga de datos**: información del conjunto de evaluación que se cuela en el de entrenamiento; produce el mismo verde engañoso por otra vía.

## Ver también

- [[cursos/la-ia-por-dentro/06-sobreajuste-y-generalizacion]]
- [[roadmap/80-evals/02-conjunto-de-prueba]]
- [[cursos/evals-para-agentes/02-datasets-de-evaluacion]]
