---
titulo: Plantilla de chat
descripcion: Regla que convierte la lista de mensajes con roles y herramientas en el texto con tokens especiales que el modelo vio al entrenar; si no coincide, el modelo rinde peor.
creado: 2026-10-29
categoria: fundamentos
ingles: Chat template
aliases: [chat template, plantilla Jinja, formato de chat]
tags: [fundamentos, modelos-abiertos, inferencia-local]
relacionados: ["[[modelos/11-modelos-abiertos]]", "[[glosario/tokenizador]]", "[[problemas/modelo-local-no-llama-herramientas]]", "[[glosario/gguf]]"]
---

Un modelo no recibe «mensajes»: recibe una secuencia de [[glosario/token|tokens]]. La plantilla de chat es la regla que traduce la lista de mensajes (sistema, usuario, asistente, llamadas y resultados de herramientas) a esa secuencia, con los marcadores especiales que el modelo aprendió a reconocer durante su entrenamiento.

## En la práctica

Con una API comercial no la ves: la aplica el proveedor. Con [[glosario/pesos-abiertos]], la aplica tu motor de inferencia, y suele venir como plantilla Jinja junto al tokenizador o dentro del [[glosario/gguf]]. Por eso importa:

- En llama.cpp, `--jinja` (activado por defecto) es lo que permite el *tool calling*.
- Algunos modelos cambian de comportamiento con argumentos de la plantilla: en Qwen 3.6, `chat_template_kwargs: {"enable_thinking": false}` apaga el razonamiento.
- No todos usan Jinja: gpt-oss exige el formato *harmony* y DeepSeek V4 se formatea con su propio `encoding.py`.

Una plantilla equivocada o desactualizada no da error: el modelo responde, pero peor, o devuelve las llamadas a herramientas como texto. Si un modelo local «no llama a las herramientas», revisa la plantilla y el *parser* antes que el prompt.

## No confundir con

- **[[glosario/prompt-de-sistema]]**: el contenido que tú escribes; la plantilla decide cómo se codifica.
- **Plantillas de prompt** (como las de [[plantillas/index]]): texto reutilizable, no un formato de tokens.

## Ver también

- [[cursos/agentes-con-modelos-abiertos/04-herramientas-con-modelos-abiertos]]
- [[docs/modelos-abiertos/02-vllm-y-llama-cpp]]
