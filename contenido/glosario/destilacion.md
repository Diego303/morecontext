---
titulo: Destilación
descripcion: Entrenar un modelo pequeño con las salidas de uno más grande para que imite su comportamiento a menor coste.
creado: 2026-10-08
categoria: fundamentos
ingles: distillation
aliases: [distillation, destilación de modelos, knowledge distillation]
tags: [fundamentos, entrenamiento]
relacionados: ["[[glosario/fine-tuning]]", "[[modelos/05-elegir-modelo-por-tarea]]"]
---

La destilación es una técnica de entrenamiento en la que un modelo pequeño (el alumno) aprende a reproducir las respuestas de un modelo grande (el maestro). El resultado es un modelo más barato y rápido que se acerca a la calidad del grande en una tarea concreta, aunque suele perder capacidad general.

## En la práctica

El flujo típico: generas con el modelo grande muchas respuestas de calidad para tu tarea, las filtras con [[glosario/evals]] y haces [[glosario/fine-tuning]] del modelo pequeño con ellas. Tiene sentido cuando la tarea es estrecha, estable y de mucho volumen. Antes de intentarlo, prueba un modelo más pequeño con buen prompt y ejemplos: a menudo basta. Revisa también los términos de uso del proveedor, porque algunos restringen usar sus salidas para entrenar otros modelos.

## No confundir con

- **[[glosario/fine-tuning]]**: el método general de reentrenar con datos propios. La destilación es un caso en el que los datos los genera otro modelo.
- **Cuantización**: reduce la precisión de los pesos de un modelo, sin entrenar otro.

## Ver también

- [[glosario/fine-tuning]]
- [[modelos/05-elegir-modelo-por-tarea]]
- [[glosario/llm]]
