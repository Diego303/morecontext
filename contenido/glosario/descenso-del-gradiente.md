---
titulo: Descenso del gradiente
descripcion: Método para entrenar modelos que mueve cada parámetro un poco en la dirección que más reduce la pérdida, y repite.
creado: 2026-10-29
categoria: fundamentos
ingles: Gradient descent
aliases: [Gradient descent, SGD, descenso del gradiente estocástico, tasa de aprendizaje, learning rate]
tags: [fundamentos, entrenamiento]
relacionados: ["[[cursos/la-ia-por-dentro/05-como-aprende-una-red]]", "[[glosario/backpropagation]]", "[[glosario/funcion-de-perdida]]"]
---

El descenso del gradiente ajusta los [[glosario/parametros|parámetros]] de un modelo dando pasos en la dirección que más reduce la [[glosario/funcion-de-perdida|función de pérdida]]. El gradiente dice cuánto sube la pérdida al mover un poco cada parámetro; se le resta, multiplicado por la **tasa de aprendizaje** (el tamaño del paso), y se repite. Es como bajar un monte con niebla notando la inclinación bajo los pies.

## En la práctica

La tasa de aprendizaje lo decide casi todo. Demasiado pequeña, avanza muy despacio; demasiado grande, cada paso se pasa del fondo y la pérdida explota hasta salir `nan`. En redes reales el gradiente se calcula con lotes pequeños elegidos al azar (descenso del gradiente estocástico, que se apoya en la aproximación estocástica de [Robbins y Monro, 1951](https://projecteuclid.org/euclid.aoms/1177729586)) y con variantes que adaptan el paso de cada parámetro, como Adam. Si algún día haces [[glosario/fine-tuning|fine-tuning]], la tasa de aprendizaje y el número de épocas serán los primeros hiperparámetros que ajustes.

## No confundir con

- **[[glosario/backpropagation|Backpropagation]]**: calcula los gradientes; el descenso del gradiente los usa para mover los pesos.

## Ver también

- [[cursos/la-ia-por-dentro/05-como-aprende-una-red]]
- [[glosario/backpropagation]]
- [[cursos/ruta-en-video/02-fase-1-redes-neuronales]]
