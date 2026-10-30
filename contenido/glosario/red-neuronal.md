---
titulo: Red neuronal
descripcion: Función formada por capas de neuronas artificiales con pesos ajustables; la estructura sobre la que se construye un LLM.
creado: 2026-10-29
categoria: fundamentos
ingles: Neural network
aliases: [Neural network, redes neuronales, red neuronal artificial, MLP]
tags: [fundamentos, redes-neuronales]
relacionados: ["[[cursos/la-ia-por-dentro/04-la-neurona-y-la-red]]", "[[glosario/perceptron]]", "[[glosario/parametros]]"]
---

Una red neuronal es una composición de capas de neuronas artificiales. Cada neurona hace una suma ponderada de sus entradas, le añade un sesgo y pasa el resultado por una [[glosario/funcion-de-activacion|función de activación]]. Pesos y sesgos son los [[glosario/parametros|parámetros]] que se aprenden, y cada capa reescribe los datos para que a la siguiente le resulte más fácil resolver el problema.

## En la práctica

Un LLM es una red neuronal muy grande, un [[glosario/transformer|Transformer]], y dentro de cada uno de sus bloques hay una red densa de dos capas. Tres consecuencias para ti. El número de parámetros («7B», «70B») decide la memoria que necesitas para ejecutar un modelo en local. El conocimiento está repartido entre esos números, así que no se puede consultar ni borrar como en una base de datos. Y al usarla, los pesos están congelados: la red no aprende de tu conversación, y la [[glosario/memoria|memoria]] de un agente vive fuera, en el contexto y en archivos.

## No confundir con

- **Neurona biológica**: la inspiración existe, pero aquí solo hay sumas, multiplicaciones y una función.
- **[[glosario/perceptron|Perceptrón]]**: una sola neurona con escalón; la red apila muchas con activaciones suaves.

## Ver también

- [[cursos/la-ia-por-dentro/04-la-neurona-y-la-red]]
- [[cursos/la-ia-por-dentro/05-como-aprende-una-red]]
- [[glosario/aprendizaje-profundo]]
- [[cursos/ruta-en-video/02-fase-1-redes-neuronales]]
