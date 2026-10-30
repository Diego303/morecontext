---
titulo: Función de pérdida
descripcion: El número que mide cuánto se equivoca un modelo con los datos; entrenar consiste en hacerlo bajar.
creado: 2026-10-29
categoria: fundamentos
ingles: Loss function
aliases: [Loss function, loss, pérdida, función de coste, entropía cruzada]
tags: [fundamentos, entrenamiento]
relacionados: ["[[cursos/la-ia-por-dentro/05-como-aprende-una-red]]", "[[glosario/descenso-del-gradiente]]", "[[glosario/evals]]"]
---

La función de pérdida convierte «lo mal que lo hace el modelo» en un solo número que se puede minimizar, y entrenar consiste en ajustar los [[glosario/parametros|parámetros]] para que baje. Las dos más comunes son el **error cuadrático medio** (MSE), para regresión, y la **entropía cruzada**, para clasificación: menos el logaritmo de la probabilidad que el modelo dio a la respuesta correcta.

## En la práctica

Un LLM se entrena con entropía cruzada sobre el siguiente [[glosario/token|token]]: cuanta menos probabilidad dio al token real, más pérdida. Que baje en entrenamiento no garantiza nada fuera, porque puede ser [[glosario/sobreajuste|sobreajuste]]. Para quien construye agentes, el paralelo útil son los [[glosario/evals|evals]]: hacen de función de pérdida de tu agente, un número que dice si cada cambio de prompt, herramientas o modelo lo mejora o lo empeora. Sin él, iteras a ciegas.

## No confundir con

- **Métrica de evaluación** (exactitud, tasa de éxito): lo que de verdad quieres medir. La pérdida es lo que minimiza el algoritmo porque es suave y derivable, y las dos no siempre coinciden.
- **[[glosario/descenso-del-gradiente|Descenso del gradiente]]**: el método que hace bajar la pérdida.

## Ver también

- [[cursos/la-ia-por-dentro/05-como-aprende-una-red]]
- [[roadmap/80-evals/01-por-que-evals]]
- [[glosario/backpropagation]]
