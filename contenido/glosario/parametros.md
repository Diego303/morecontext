---
titulo: Parámetros
descripcion: Los números internos de un modelo, pesos y sesgos, que ajusta el entrenamiento; su recuento es el «7B» o «70B» de una ficha.
creado: 2026-10-29
categoria: fundamentos
ingles: Parameters
aliases: [Parameters, pesos, weights, parámetros del modelo]
tags: [fundamentos, entrenamiento]
relacionados: ["[[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]", "[[glosario/leyes-de-escalado]]", "[[glosario/red-neuronal]]"]
---

Los parámetros son los números internos de un modelo que el entrenamiento ajusta: en una [[glosario/red-neuronal|red neuronal]], los pesos y sesgos de cada neurona. En una recta `y = a·x + b` son dos; en un LLM, miles de millones. Cuando la ficha de un modelo de [[glosario/pesos-abiertos|pesos abiertos]] dice «7B» o «70B», cuenta cuántos tiene en miles de millones (*billions*).

## En la práctica

El número decide la memoria y el cómputo por token, así que pesa en el coste, en la [[glosario/latencia|latencia]] y en si un modelo cabe en tu máquina (la [[glosario/cuantizacion|cuantización]] reduce lo que ocupa cada uno). No basta para comparar modelos: los datos y el postentrenamiento pesan tanto como el tamaño, la [[glosario/mezcla-de-expertos|mezcla de expertos]] activa solo una parte por token y muchos proveedores comerciales no publican la cifra. Compara con tus [[glosario/evals|evals]]. Y en inferencia están congelados: el modelo no aprende de tu conversación.

## No confundir con

- **Hiperparámetros**: lo que se elige antes de entrenar, como el número de capas, la tasa de aprendizaje o las épocas.
- **Parámetros de la API** (`max_tokens`, `effort`…): opciones de cada llamada que no cambian el modelo ([[modelos/06-parametros]]).

## Ver también

- [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]
- [[cursos/la-ia-por-dentro/01-ia-machine-learning-y-deep-learning]]
- [[cursos/la-ia-por-dentro/04-la-neurona-y-la-red]]
- [[glosario/leyes-de-escalado]]
