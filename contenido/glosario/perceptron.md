---
titulo: Perceptrón
descripcion: La neurona artificial de Rosenblatt (1958), que aprendía sus pesos de ejemplos, y su límite con XOR.
creado: 2026-10-29
categoria: fundamentos
ingles: Perceptron
aliases: [Perceptron, perceptrón de Rosenblatt]
tags: [fundamentos, redes-neuronales, historia]
relacionados: ["[[cursos/la-ia-por-dentro/04-la-neurona-y-la-red]]", "[[biblioteca/el-perceptron]]", "[[glosario/red-neuronal]]"]
---

El perceptrón es una neurona artificial que aprende sus pesos a partir de ejemplos. Lo presentó Frank Rosenblatt en *The perceptron: A probabilistic model for information storage and organization in the brain* (Psychological Review, 1958). Calcula una suma ponderada más un sesgo y devuelve 1 si supera el umbral y 0 si no; cuando se equivoca, mueve un poco los pesos hacia la respuesta correcta.

## En la práctica

Hoy su interés es didáctico: muestra el límite que obligó a usar varias capas. Un perceptrón separa los datos con una recta, así que aprende AND y OR pero no XOR, cuyos casos no se pueden separar así. Minsky y Papert analizaron estos límites en *Perceptrons* (1969), y el interés y la financiación de las redes neuronales cayeron durante años. La salida fueron las capas ocultas con activaciones suaves, entrenadas con [[glosario/backpropagation|backpropagation]], que se popularizó en 1986. Cada neurona de un LLM sigue haciendo la misma suma ponderada.

## No confundir con

- **Perceptrón multicapa (MLP)**: nombre histórico de una [[glosario/red-neuronal|red neuronal]] densa con capas ocultas, que ya no usa el escalón de Rosenblatt sino una [[glosario/funcion-de-activacion|función de activación]] suave.

## Ver también

- [[cursos/la-ia-por-dentro/04-la-neurona-y-la-red]]
- [[biblioteca/el-perceptron]]
- [[glosario/funcion-de-activacion]]
- [[cursos/ruta-en-video/02-fase-1-redes-neuronales]]
