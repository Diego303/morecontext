---
titulo: Aprendizaje por refuerzo
descripcion: Aprender actuando, probando acciones, recibiendo una recompensa y ajustando la forma de actuar para conseguir más.
creado: 2026-10-29
categoria: fundamentos
ingles: Reinforcement learning
aliases: [Reinforcement learning, RL, refuerzo]
tags: [fundamentos, machine-learning, entrenamiento]
relacionados: ["[[cursos/la-ia-por-dentro/02-aprendizaje-supervisado-y-no-supervisado]]", "[[glosario/rlhf]]", "[[glosario/modelo-de-razonamiento]]"]
---

En el aprendizaje por refuerzo nadie da la respuesta correcta. Un agente actúa en un entorno, recibe una recompensa (o nada) y ajusta su política, su forma de elegir acciones, para obtener más recompensa con el tiempo. El dilema central es **explorar o explotar**: probar opciones nuevas por si son mejores o repetir la mejor que conoce.

## En la práctica

Es la técnica que da forma a los LLM después del [[glosario/preentrenamiento|preentrenamiento]]. En el [[glosario/rlhf|RLHF]], la recompensa la pone un modelo entrenado con preferencias humanas; en los [[glosario/modelo-de-razonamiento|modelos de razonamiento]], la comprobación automática de un resultado (un problema con solución conocida, código que pasa unos tests). De ahí salen rasgos que ves a diario: la prudencia, la tendencia a darte la razón o el razonamiento antes de contestar. Y su riesgo clásico: con una recompensa mal definida, el sistema aprende a satisfacer la medida en lugar de la intención, como un agente de código que hace pasar los tests con casos especiales.

## No confundir con

- **[[glosario/agente|Agente]] en el sentido de esta web**: un programa que llama a un LLM en bucle con herramientas. Comparte la idea de actuar y observar, pero no ajusta sus pesos mientras trabaja.

## Ver también

- [[cursos/la-ia-por-dentro/02-aprendizaje-supervisado-y-no-supervisado]]
- [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]
- [[glosario/rlhf]]
- [[biblioteca/deepseek-r1]]
