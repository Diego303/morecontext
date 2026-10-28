---
titulo: Fine-tuning
descripcion: Continuar el entrenamiento de un modelo con datos propios para ajustar su comportamiento a una tarea o un estilo.
creado: 2026-10-08
categoria: fundamentos
aliases: [ajuste fino, afinado, reentrenamiento]
tags: [fundamentos, entrenamiento]
relacionados: ["[[glosario/rag]]", "[[glosario/destilacion]]"]
---

*Fine-tuning* es entrenar un poco más un modelo ya entrenado con ejemplos propios (pares de entrada y salida esperada) para que cambie su comportamiento: un formato fijo, un estilo, una clasificación muy específica. Modifica los pesos del modelo, así que el efecto persiste sin repetir instrucciones en cada llamada.

## En la práctica

Es el último recurso, no el primero. Antes, agota el prompting, los ejemplos [[glosario/few-shot]], la [[glosario/salida-estructurada]] y [[glosario/rag|RAG]]: son más baratos, más rápidos de iterar y no te atan a una versión del modelo. El fine-tuning sirve sobre todo para enseñar *cómo* responder, no para añadir conocimiento que cambia; para eso, RAG. Necesitas un buen conjunto de datos y [[glosario/evals]] para comprobar que mejora sin romper otras capacidades. Qué modelos admiten fine-tuning depende del proveedor: consulta su documentación.

## No confundir con

- **[[glosario/few-shot]]**: ejemplos en el prompt, sin cambiar el modelo.
- **[[glosario/destilacion]]**: fine-tuning con datos generados por un modelo más grande.

## Ver también

- [[modelos/05-elegir-modelo-por-tarea]]
- [[glosario/rag]]
- [[glosario/destilacion]]
