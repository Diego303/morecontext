---
titulo: Los modelos de lenguaje aprenden con pocos ejemplos (GPT-3, 2020)
descripcion: El paper de GPT-3 mostró que un modelo grande resuelve tareas nuevas con instrucciones y ejemplos en el prompt, sin reentrenar. Es el origen del prompting tal como lo practicas.
creado: 2026-10-29
tags: [biblioteca, prompting, few-shot, llm]
relacionados: ["[[glosario/few-shot]]", "[[roadmap/10-prompting/02-ejemplos-few-shot]]", "[[biblioteca/instructgpt]]", "[[biblioteca/leyes-de-escalado-y-chinchilla]]"]
autores: Brown et al.
anio: 2020
url: https://arxiv.org/abs/2005.14165
tipo: paper
tema: prompting
nivel: intermedio
---

*Language Models are Few-Shot Learners* presenta GPT-3, un modelo de lenguaje de 175.000 millones de [[glosario/parametros|parámetros]] según el [resumen del paper](https://arxiv.org/abs/2005.14165), y hace una pregunta sencilla: ¿puede un modelo así resolver una tarea nueva solo con una descripción y unos ejemplos en el texto de entrada, sin tocar sus pesos? La respuesta, con matices, fue que sí. Ese resultado está en la base de cómo programas hoy un modelo: escribiendo su contexto.

## La idea clave

Antes de GPT-3, adaptar un modelo a una tarea significaba [[glosario/fine-tuning|fine-tuning]]: miles de ejemplos etiquetados y una nueva ronda de entrenamiento por cada tarea. El paper propone otra vía, que llama **aprendizaje en contexto** (*in-context learning*): el modelo recibe la tarea como texto y la resuelve en la misma pasada, sin actualizar ningún peso.

La sección 2 define los cuatro escenarios que compara, y la figura 2.1 los dibuja con un ejemplo de traducción:

- **[[glosario/zero-shot|Zero-shot]]**: solo la descripción de la tarea.
- **One-shot**: la descripción y un ejemplo resuelto.
- **[[glosario/few-shot|Few-shot]]**: la descripción y varios ejemplos, tantos como quepan en la ventana de contexto del modelo (en el paper, de 10 a 100 en la mayoría de tareas).
- **Fine-tuning**: el método clásico, que el paper deja fuera de sus experimentos principales.

Entrenaron ocho tamaños de modelo con la misma arquitectura y midieron cada escenario en decenas de tareas. El patrón que se repite es que **los ejemplos en contexto ayudan más cuanto más grande es el modelo**. En algunas tareas, el few-shot de GPT-3 se acercaba a sistemas ajustados específicamente; en otras quedaba lejos.

## Por qué importa hoy

Todo lo que haces en un [[glosario/prompt|prompt]] descansa en este resultado. Tu [[glosario/prompt-de-sistema|prompt de sistema]], las descripciones de tus herramientas y los ejemplos que añades para fijar un formato son aprendizaje en contexto. Por eso un agente cambia de comportamiento cuando cambias el texto que le das, y por eso el contexto es lo primero que debes revisar cuando algo falla.

El paper también deja dos avisos que siguen vigentes:

- **No está claro qué aprende el modelo en contexto.** Los propios autores reconocen en las limitaciones que no saben si el modelo aprende la tarea de cero al leer los ejemplos o reconoce una tarea que ya vio al entrenar. Para ti, la consecuencia es práctica: comprueba con tus propios casos de prueba, no con la intuición.
- **La contaminación de los benchmarks.** La sección 4 dedica un análisis entero a medir cuánto de los conjuntos de evaluación aparecía en los datos de entrenamiento. Es el antecedente directo de la [[glosario/contaminacion-de-benchmark|contaminación de benchmarks]] que hoy complica leer cualquier tabla de resultados.

## Qué leer primero

El paper es muy largo. Lee esto y deja el resto:

1. **La sección 1**, con las figuras que muestran cómo mejora el aprendizaje en contexto con el tamaño del modelo.
2. **El principio de la sección 2** y la figura 2.1: las definiciones de zero-shot, one-shot y few-shot.
3. **La sección 5, Limitations.** Es corta y honesta: repeticiones en textos largos, fallos de sentido común físico, el coste de servir un modelo tan grande y la duda sobre qué se aprende en contexto.
4. **La sección 4**, sobre contaminación, si te interesan las evals.

Sáltate la sección 3 (resultados tarea a tarea) salvo la que te interese. La sección 6 sobre impacto social (mal uso, sesgos y energía) merece una lectura aparte.

## Qué ha envejecido

- **Un modelo base, sin instrucciones.** GPT-3 continúa texto; no sigue órdenes. Había que disfrazar cada tarea de documento a medio escribir. Los modelos conversacionales llegaron después, con el ajuste de [[biblioteca/instructgpt|InstructGPT]].
- **La ventana de contexto.** Los ejemplos tenían que caber en una ventana diminuta comparada con las actuales, y eso condicionaba el número de ejemplos.
- **Ejemplos para el formato.** Hoy el formato se garantiza con [[glosario/salida-estructurada|salidas estructuradas]]. Los ejemplos siguen siendo útiles para el estilo, los criterios y los casos frontera.
- **Los benchmarks.** La mayoría de las tareas evaluadas están saturadas o se consideran contaminadas.

## Dónde lo ves en MoreContext

- [[roadmap/10-prompting/02-ejemplos-few-shot]] y [[docs/prompting/02-ejemplos-few-shot]]: cómo elegir y colocar ejemplos hoy.
- [[roadmap/10-prompting/01-instrucciones-claras]]: la otra mitad del aprendizaje en contexto.
- [[glosario/few-shot]], [[glosario/zero-shot]] y [[glosario/contaminacion-de-benchmark]].
- [[docs/evals/03-benchmarks-publicos]]: cómo leer una tabla de resultados sin creértela entera.
