---
titulo: "InstructGPT: seguir instrucciones con feedback humano (Ouyang et al., 2022)"
descripcion: Cómo OpenAI convirtió un modelo que continúa texto en uno que sigue instrucciones, con demostraciones, un modelo de recompensa y aprendizaje por refuerzo.
creado: 2026-10-29
tags: [biblioteca, fundamentos, rlhf, entrenamiento, alineamiento]
relacionados: ["[[glosario/rlhf]]", "[[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]", "[[biblioteca/gpt-3-few-shot]]", "[[biblioteca/constitutional-ai]]"]
autores: Ouyang et al.
anio: 2022
url: https://arxiv.org/abs/2203.02155
tipo: paper
tema: fundamentos
nivel: intermedio
---

*Training language models to follow instructions with human feedback* parte de una observación: hacer un modelo más grande no lo hace mejor siguiendo lo que el usuario quiere. [[biblioteca/gpt-3-few-shot|GPT-3]] podía inventar, ser tóxico o no hacer caso. Este paper describe cómo OpenAI lo ajustó con feedback humano para que siguiera instrucciones, y el resultado, InstructGPT, es el antecedente directo de los modelos conversacionales que usas hoy.

## La idea clave

La receta tiene tres pasos, dibujados en la figura 2 del paper:

```mermaid
flowchart LR
  P[Prompts reales y de etiquetadores] --> S[1 · SFT con demostraciones]
  S --> R[2 · Modelo de recompensa con rankings]
  R --> L[3 · RL con PPO contra la recompensa]
  L --> I[InstructGPT]
```

1. **Ajuste supervisado (SFT).** Un equipo de etiquetadores escribe la respuesta ideal para una colección de prompts, parte de ellos enviados por usuarios a la API de OpenAI. Con esas demostraciones se ajusta GPT-3.
2. **Modelo de recompensa.** Para cada prompt, el modelo genera varias respuestas y los etiquetadores las ordenan de mejor a peor. Con esas comparaciones se entrena un modelo que, dada una respuesta, predice cuánto la preferiría una persona.
3. **Aprendizaje por refuerzo.** Se optimiza el modelo con PPO para maximizar esa recompensa, con una penalización que le impide alejarse demasiado del modelo supervisado. Una variante mezcla además gradientes del preentrenamiento para no perder rendimiento en tareas públicas, lo que los autores llaman reducir el «impuesto de alineamiento».

Los pasos 2 y 3 son lo que se conoce como [[glosario/rlhf|RLHF]]. El resultado más citado está en el [resumen](https://arxiv.org/abs/2203.02155): las personas preferían las respuestas de un InstructGPT de 1.300 millones de parámetros a las de GPT-3 con 175.000 millones, con cien veces menos parámetros. El paper también mide mejoras en veracidad y menos texto tóxico, aunque InstructGPT sigue cometiendo errores simples.

## Por qué importa hoy

- **Tu prompt de sistema funciona porque el modelo se entrenó para obedecer.** La diferencia entre un modelo base y uno ajustado con instrucciones es la que hay entre tener que disfrazar la tarea de documento y poder pedirla. Escribir [[roadmap/10-prompting/01-instrucciones-claras|instrucciones claras]] tiene sentido gracias a este entrenamiento.
- **Obedecer también es un riesgo.** Los autores reconocen que InstructGPT sigue instrucciones aunque sean dañinas. Un agente que lee una página web o un correo con órdenes escondidas tiende a seguirlas. Esa disposición a obedecer es parte de lo que hace posible la [[glosario/inyeccion-de-prompt|inyección de prompt]].
- **El modelo de recompensa es un juez aprendido.** La idea de entrenar un evaluador con comparaciones humanas reaparece cuando usas un [[glosario/modelo-juez|modelo juez]] en tus evals. Igual que aquí, ese juez solo vale si lo contrastas con etiquetas humanas.
- **¿Alineado con quién?** La sección 5.2 insiste en que el modelo aprende las preferencias de un grupo concreto de etiquetadores, de los investigadores que escriben sus instrucciones y de los clientes de la API. Cuando un modelo responde con un tono o unos criterios que no son los tuyos, parte de la explicación está aquí.

## Qué leer primero

1. **La sección 1** con la figura 1 (preferencias frente a tamaño) y la figura 2 (los tres pasos).
2. **La sección 3.5**, con los tres modelos: SFT, recompensa y RL.
3. **La sección 4.1**, con los resultados sobre los prompts de la API.
4. **Las secciones 5.2 y 5.3**: a quién se alinea y limitaciones.

Sáltate los resultados detallados sobre conjuntos públicos de la sección 4.2. Los apéndices sobre cómo se seleccionó y se instruyó a los etiquetadores te servirán si montas tu propio proceso de etiquetado para evals.

## Qué ha envejecido

- **PPO y el modelo de recompensa separado.** Hoy hay métodos que optimizan preferencias directamente, sin un bucle de refuerzo tan costoso, y otros que sustituyen parte del feedback humano por feedback de otro modelo, como [[biblioteca/constitutional-ai|Constitutional AI]].
- **El objetivo.** InstructGPT busca respuestas útiles, veraces e inofensivas en una conversación. El entrenamiento de los modelos actuales añade razonamiento, uso de herramientas y tareas largas, a menudo con recompensas que se pueden verificar ([[biblioteca/deepseek-r1|DeepSeek-R1]]).
- **Las métricas.** Los conjuntos de veracidad y toxicidad del paper son de su época.

## Dónde lo ves en MoreContext

- [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]: preentrenamiento, ajuste con instrucciones y preferencias.
- [[glosario/rlhf]], [[glosario/fine-tuning]] y [[glosario/aprendizaje-por-refuerzo]].
- [[docs/evals/02-modelo-como-juez]] y [[recetas/validar-un-modelo-juez]]: el juez aprendido en tus evals.
- [[cursos/seguridad-y-prompt-injection/02-inyeccion-directa-e-indirecta]]: el lado oscuro de obedecer.
