---
titulo: Modelo de razonamiento
descripcion: LLM entrenado con refuerzo para generar un razonamiento antes de responder, a cambio de más tokens y más latencia.
creado: 2026-10-29
categoria: fundamentos
ingles: Reasoning model
aliases: [Reasoning model, modelos de razonamiento, modelo razonador]
tags: [fundamentos, razonamiento, llm]
relacionados: ["[[glosario/razonamiento-extendido]]", "[[docs/prompting/04-razonamiento]]", "[[biblioteca/deepseek-r1]]"]
---

Un modelo de razonamiento es un LLM entrenado con [[glosario/aprendizaje-por-refuerzo|aprendizaje por refuerzo]] para generar un razonamiento largo antes de la respuesta final. Se entrena con tareas cuya solución se puede comprobar (problemas de matemáticas con resultado conocido, código que debe pasar unos tests) y la recompensa va al resultado, así que aprende por su cuenta a descomponer, comprobar pasos y volver atrás. Lo describieron OpenAI ([*Learning to reason with LLMs*, 2024](https://openai.com/index/learning-to-reason-with-llms/)) y DeepSeek ([DeepSeek-R1, 2025](https://arxiv.org/abs/2501.12948)).

## En la práctica

Gasta más cómputo al responder: piensa más en los problemas difíciles a cambio de más tokens y más [[glosario/latencia|latencia]]. En los modelos actuales de Claude el razonamiento es adaptativo y viene activado, y lo regulas con el [[glosario/esfuerzo|esfuerzo]] (`output_config={"effort": …}`). Los tokens de razonamiento se cobran como salida y cuentan para `max_tokens`. En un agente, sube el esfuerzo en los pasos de planificar o depurar y bájalo en los mecánicos, como clasificar o extraer campos.

## No confundir con

- **[[glosario/cadena-de-pensamiento|Cadena de pensamiento]]**: pedir en el prompt que razone paso a paso; funciona con cualquier modelo, sin entrenamiento específico.
- **[[glosario/razonamiento-extendido|Razonamiento extendido]]**: el modo de la API que activa y controla ese razonamiento.

## Ver también

- [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]
- [[docs/prompting/04-razonamiento]]
- [[modelos/04-dejar-pensar-al-modelo]]
- [[biblioteca/deepseek-r1]]
