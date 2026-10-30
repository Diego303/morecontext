---
titulo: Backpropagation
descripcion: Algoritmo que calcula el gradiente de la pérdida respecto a todos los pesos de una red con una pasada hacia atrás.
creado: 2026-10-29
categoria: fundamentos
ingles: Backpropagation
aliases: [retropropagación, propagación hacia atrás, backprop]
tags: [fundamentos, entrenamiento, redes-neuronales]
relacionados: ["[[cursos/la-ia-por-dentro/05-como-aprende-una-red]]", "[[biblioteca/backpropagation]]", "[[glosario/descenso-del-gradiente]]"]
---

La backpropagation (retropropagación) calcula cuánto contribuye cada peso de una [[glosario/red-neuronal|red neuronal]] al error, con una pasada hacia delante y otra hacia atrás. Aplica la regla de la cadena desde la salida hacia la entrada: el error de cada capa se reparte a la anterior según los pesos que las conectan, y cada capa reutiliza lo que ya calculó la siguiente, así que no se repite trabajo.

## En la práctica

Es lo que hace viable entrenar redes con miles de millones de [[glosario/parametros|parámetros]]. La alternativa ingenua, mover cada peso y recalcular la pérdida, exigiría una pasada completa por parámetro. Rumelhart, Hinton y Williams la popularizaron en *Learning representations by back-propagating errors* (Nature, 1986): la idea tenía precedentes, pero su artículo mostró que entrenaba redes de varias capas y que las capas ocultas aprendían representaciones útiles. Hoy nadie la escribe a mano; PyTorch o JAX la calculan con diferenciación automática. En tu agente no ocurre nunca: en inferencia los pesos están congelados.

## No confundir con

- **[[glosario/descenso-del-gradiente|Descenso del gradiente]]**: usa los gradientes que calcula la backpropagation para actualizar los pesos.

## Ver también

- [[cursos/la-ia-por-dentro/05-como-aprende-una-red]]
- [[biblioteca/backpropagation]]
- [[glosario/funcion-de-perdida]]
