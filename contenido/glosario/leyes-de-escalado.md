---
titulo: Leyes de escalado
descripcion: Relaciones empíricas que predicen cómo baja la pérdida de un modelo al crecer los parámetros, los datos y el cómputo.
creado: 2026-10-29
categoria: fundamentos
ingles: Scaling laws
aliases: [Scaling laws, leyes de escala, Chinchilla]
tags: [fundamentos, entrenamiento, llm]
relacionados: ["[[biblioteca/leyes-de-escalado-y-chinchilla]]", "[[glosario/parametros]]", "[[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]"]
---

Las leyes de escalado son relaciones empíricas entre el tamaño de un modelo, los datos con que se entrena, el cómputo empleado y su pérdida. Kaplan et al. midieron en *Scaling Laws for Neural Language Models* ([2020](https://arxiv.org/abs/2001.08361)) que la pérdida de un modelo de lenguaje baja de forma predecible, siguiendo leyes de potencia, al aumentar cada factor. Hoffmann et al. ([2022](https://arxiv.org/abs/2203.15556)) corrigieron la receta: con un presupuesto de cómputo fijo, parámetros y tokens de entrenamiento deben crecer a la par, y su modelo Chinchilla, más pequeño y entrenado con más datos, rendía mejor que otros mayores.

## En la práctica

Explican por qué los laboratorios planifican entrenamientos enormes con cierta confianza y por qué el número de [[glosario/parametros|parámetros]] no basta para comparar modelos. Para ti hay dos matices. Predicen la pérdida, que no equivale a resolver tu tarea. Y dejan fuera piezas que también cambian el resultado, como el postentrenamiento o el cómputo extra que gasta un [[glosario/modelo-de-razonamiento|modelo de razonamiento]] al responder. La comparación que vale para tu caso es la de tus [[glosario/evals|evals]].

## No confundir con

- **Escalar en inferencia**: dar más cómputo al modelo al responder (más razonamiento, más [[glosario/esfuerzo|esfuerzo]]) en lugar de al entrenarlo.

## Ver también

- [[biblioteca/leyes-de-escalado-y-chinchilla]]
- [[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]
- [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]
- [[glosario/preentrenamiento]]
