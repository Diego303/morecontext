---
titulo: Leyes de escalado y Chinchilla (Kaplan 2020, Hoffmann 2022)
descripcion: Dos papers que midieron cómo mejora un modelo al crecer en parámetros, datos y cómputo, y por qué el segundo corrigió al primero sobre cómo repartir el presupuesto.
creado: 2026-10-29
tags: [biblioteca, fundamentos, escalado, entrenamiento]
relacionados: ["[[glosario/leyes-de-escalado]]", "[[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]", "[[biblioteca/gpt-3-few-shot]]", "[[modelos/05-elegir-modelo-por-tarea]]"]
autores: Kaplan et al.; Hoffmann et al.
anio: 2022
url: https://arxiv.org/abs/2203.15556
tipo: paper
tema: fundamentos
nivel: intermedio
---

Esta ficha comenta dos papers que se leen juntos. En *Scaling Laws for Neural Language Models* ([Kaplan et al., 2020](https://arxiv.org/abs/2001.08361)), un equipo de OpenAI midió que el error de un modelo de lenguaje baja de forma predecible al aumentar su tamaño, sus datos y su cómputo. En *Training Compute-Optimal Large Language Models* ([Hoffmann et al., 2022](https://arxiv.org/abs/2203.15556)), un equipo de DeepMind repitió la pregunta con más cuidado y concluyó que los modelos grandes de la época estaban entrenados con muy pocos datos.

## La idea clave

**Kaplan et al.** entrenan Transformers de entre unos 768 y 1.500 millones de parámetros (sin contar los *embeddings*) y miden la pérdida, es decir, lo bien que predicen el siguiente token. Su hallazgo es que la pérdida sigue una **ley de potencia** respecto a cada uno de tres factores: [[glosario/parametros|parámetros]] (N), datos (D) y cómputo (C), siempre que ninguno de los otros dos haga de cuello de botella. La tendencia se mantiene a lo largo de más de siete órdenes de magnitud. Los exponentes que dan en la sección 1.2 son pequeños (unos 0,076 para N, 0,095 para D y 0,050 para C): cada mejora cuesta mucho, pero se puede predecir. La forma del modelo (profundidad frente a anchura) importa poco.

De ahí sacan una receta para gastar un presupuesto fijo. Como los modelos grandes aprenden más de cada ejemplo, conviene entrenar **modelos muy grandes, con relativamente pocos datos, y parar antes de que converjan**. En su ajuste, el tamaño óptimo crece aproximadamente como C^0,73, mientras que los datos crecen mucho más despacio. Lo resumen en una frase: «Big models may be more important than big data».

**Hoffmann et al.** entrenan más de 400 modelos, de 70 millones a más de 16.000 millones de parámetros, con entre 5.000 y 500.000 millones de tokens, y estiman el reparto óptimo con tres métodos distintos. Los tres coinciden: **parámetros y tokens deben crecer al mismo ritmo**. Si duplicas el tamaño del modelo, duplica también los datos. Para comprobarlo entrenan Chinchilla, con 70.000 millones de parámetros y cuatro veces más datos que Gopher (280.000 millones), con el mismo cómputo. Según su resumen, Chinchilla supera a Gopher y a otros modelos mayores, como GPT-3, en una amplia gama de tareas.

La regla de unos 20 tokens por parámetro que verás citada a menudo es una simplificación de estos resultados. Si la usas para algo serio, compruébala en las tablas del paper.

## Por qué importa hoy

- **Explica por qué un modelo pequeño reciente puede superar a uno grande antiguo.** El tamaño no lo es todo: los datos y el cómputo con que se entrenó cuentan igual. Ten esto presente al leer fichas de modelos y al [[modelos/05-elegir-modelo-por-tarea|elegir modelo por tarea]].
- **Los modelos pequeños bien entrenados abaratan la inferencia.** Hoffmann et al. ya señalan que un modelo más pequeño cuesta menos de ajustar y de servir. Si un modelo se va a usar millones de veces, puede compensar entrenarlo más allá del óptimo de Chinchilla: pagas más una vez al entrenar y menos en cada llamada. Ten esa cuenta en mente cuando compares [[glosario/pesos-abiertos|modelos de pesos abiertos]] de distintos tamaños para ejecutarlos tú.
- **La pérdida baja de forma predecible; lo que puedes hacer con el modelo, no tanto.** Las leyes hablan de predecir el siguiente token. Si una mejora de pérdida se traduce en que tu agente resuelva mejor tu tarea solo lo sabes con [[glosario/evals|evals]] propias.

## Qué leer primero

- **Kaplan**: la sección 1.1 (resumen de hallazgos) y la 1.2 (las ecuaciones), con la figura 1. En dos páginas tienes el paper. Si quieres el reparto del cómputo, la sección 6.
- **Hoffmann**: la introducción con la figura 1, que compara sus predicciones con las de Kaplan, y la sección 3 con los tres métodos (si solo lees uno, el de perfiles IsoFLOP). Después, el comienzo de la sección 4 con los resultados de Chinchilla.

Sáltate los apéndices y las tablas tarea a tarea.

## Qué ha envejecido

- **El reparto de Kaplan.** Hoffmann et al. atribuyen buena parte de la diferencia a decisiones experimentales de Kaplan, entre ellas cómo se fijó el calendario de la tasa de aprendizaje. Kaplan sigue siendo la referencia de la idea de ley de potencia; su receta concreta de reparto, no.
- **Optimizar solo el entrenamiento.** Ambos papers buscan la mejor pérdida para un cómputo de entrenamiento dado. No tienen en cuenta el coste de servir el modelo, que en producción suele pesar más.
- **Lo que no miden.** Hablan de preentrenar modelos densos. El ajuste con preferencias, el aprendizaje por refuerzo y el cómputo en tiempo de inferencia de los [[glosario/modelo-de-razonamiento|modelos de razonamiento]] son otros ejes de escalado que quedan fuera.
- **Los límites.** Kaplan ya advierte que las tendencias tienen que aplanarse en algún momento, porque el lenguaje natural tiene una entropía mayor que cero.

## Dónde lo ves en MoreContext

- [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]: parámetros, datos y fases de entrenamiento.
- [[glosario/leyes-de-escalado]], [[glosario/parametros]] y [[glosario/preentrenamiento]].
- [[cursos/agentes-con-modelos-abiertos/06-local-o-api]]: cuándo un modelo pequeño en local te basta.
- [[biblioteca/deepseek-r1]]: el escalado que llegó después, el del razonamiento.
