---
titulo: Aprendizaje supervisado
descripcion: Aprender de ejemplos que traen su respuesta correcta, para clasificar o predecir números en casos nuevos.
creado: 2026-10-29
categoria: fundamentos
ingles: Supervised learning
aliases: [Supervised learning, datos etiquetados, aprendizaje con etiquetas]
tags: [fundamentos, machine-learning]
relacionados: ["[[cursos/la-ia-por-dentro/02-aprendizaje-supervisado-y-no-supervisado]]", "[[glosario/aprendizaje-no-supervisado]]", "[[glosario/conjunto-de-evaluacion]]"]
---

En el aprendizaje supervisado cada ejemplo de entrenamiento trae su etiqueta, la respuesta correcta: este correo es spam, este piso costó tanto. El modelo aprende la relación entre entrada y respuesta para aplicarla a casos que no ha visto. Si predice una categoría, es **clasificación**; si predice un número continuo, **regresión**.

## En la práctica

Su límite es el coste de las etiquetas: alguien tiene que revisar miles de ejemplos. En un LLM aparece en el ajuste con instrucciones, un [[glosario/fine-tuning|fine-tuning]] con pares de instrucción y respuesta escritos o revisados por personas. Y aparece en tu trabajo más de lo que parece. Los ejemplos [[glosario/few-shot|few-shot]] son pares de entrada y salida que el modelo imita sin cambiar sus pesos, y un [[glosario/conjunto-de-evaluacion|conjunto de evaluación]] es un dataset etiquetado: constrúyelo con el mismo cuidado y sin mezclarlo con los ejemplos del prompt ([[glosario/sobreajuste|sobreajuste]]).

## No confundir con

- **[[glosario/aprendizaje-no-supervisado|Aprendizaje no supervisado]]**: no hay etiquetas; busca estructura en los datos.
- **Aprendizaje autosupervisado**: las etiquetas salen de los propios datos, como el siguiente token en el [[glosario/preentrenamiento|preentrenamiento]].
- **[[glosario/aprendizaje-por-refuerzo|Aprendizaje por refuerzo]]**: una recompensa después de actuar, sin respuesta correcta.

## Ver también

- [[cursos/la-ia-por-dentro/02-aprendizaje-supervisado-y-no-supervisado]]
- [[roadmap/80-evals/02-conjunto-de-prueba]]
- [[glosario/aprendizaje-automatico]]
