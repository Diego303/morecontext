---
titulo: RLHF
descripcion: Ajustar un LLM con aprendizaje por refuerzo usando un modelo de recompensa entrenado con preferencias humanas.
creado: 2026-10-29
categoria: fundamentos
ingles: Reinforcement learning from human feedback
aliases: [Reinforcement learning from human feedback, aprendizaje por refuerzo con feedback humano, modelo de recompensa]
tags: [fundamentos, entrenamiento, alineamiento]
relacionados: ["[[biblioteca/instructgpt]]", "[[glosario/aprendizaje-por-refuerzo]]", "[[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]"]
---

RLHF (*reinforcement learning from human feedback*) es la técnica de alineamiento que convirtió los modelos preentrenados en asistentes. Tiene tres pasos: personas comparan pares de respuestas a la misma petición y eligen la mejor; con esas comparaciones se entrena un **modelo de recompensa**; y el LLM se optimiza con [[glosario/aprendizaje-por-refuerzo|aprendizaje por refuerzo]] para producir respuestas que ese modelo puntúe alto. Es la receta de InstructGPT ([Ouyang et al., 2022](https://arxiv.org/abs/2203.02155)), que la aplicó después de un ajuste supervisado con instrucciones.

## En la práctica

De esta fase salen los rasgos de «personalidad» que notas: cortesía, prudencia, rechazos ante peticiones dañinas. Y sus efectos secundarios: respuestas más largas de lo necesario, tendencia a darte la razón y algún rechazo en peticiones legítimas. Se corrigen en el prompt: pide formato y longitud, y da contexto legítimo cuando rechace algo razonable. En InstructGPT, las personas preferían un modelo ajustado de 1.300 millones de parámetros a GPT-3, con 175.000 millones: el tamaño no lo es todo.

## No confundir con

- ***Constitutional AI*** (RLAIF): sustituye parte del feedback humano por el de otro modelo guiado por principios escritos ([Bai et al., 2022](https://arxiv.org/abs/2212.08073)).
- **Optimización directa con preferencias**: variantes que aprenden de los pares sin entrenar un modelo de recompensa aparte.
- **[[glosario/fine-tuning|Fine-tuning]] supervisado**: imita respuestas de ejemplo, sin comparar alternativas.

## Ver también

- [[biblioteca/instructgpt]]
- [[biblioteca/constitutional-ai]]
- [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]
- [[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]
