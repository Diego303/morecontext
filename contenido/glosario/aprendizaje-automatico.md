---
titulo: Aprendizaje automático
descripcion: Rama de la IA en la que el sistema saca su comportamiento de ejemplos en lugar de reglas escritas a mano.
creado: 2026-10-29
categoria: fundamentos
ingles: Machine learning
aliases: [Machine learning, ML, aprendizaje máquina]
tags: [fundamentos, machine-learning]
relacionados: ["[[cursos/la-ia-por-dentro/01-ia-machine-learning-y-deep-learning]]", "[[glosario/aprendizaje-profundo]]", "[[glosario/aprendizaje-supervisado]]"]
---

El aprendizaje automático (*machine learning*) es la parte de la inteligencia artificial en la que nadie escribe la regla: se dan ejemplos a un algoritmo y este ajusta los [[glosario/parametros|parámetros]] de un modelo para equivocarse lo menos posible con ellos. Lo que importa después es que acierte con casos que no ha visto, es decir, que generalice.

## En la práctica

Todo el machine learning tiene tres ingredientes: datos, parámetros y una medida del error, la [[glosario/funcion-de-perdida|función de pérdida]]. Un [[glosario/llm|LLM]] es machine learning a gran escala, pero cuando construyes un [[glosario/agente|agente]] no entrenas nada: usas un modelo ya entrenado y lo rodeas de código normal. Reparte el trabajo con ese criterio. Reglas escritas por ti donde la regla se conoce (validar un importe, comprobar un permiso) y el modelo donde hace falta lenguaje o juicio.

## No confundir con

- **Inteligencia artificial**: el paraguas, que incluye también sistemas de reglas y búsqueda que no aprenden nada, como un programa de ajedrez clásico.
- **[[glosario/aprendizaje-profundo|Aprendizaje profundo]]**: el subconjunto del machine learning que usa redes neuronales de muchas capas.

## Ver también

- [[cursos/la-ia-por-dentro/01-ia-machine-learning-y-deep-learning]]
- [[cursos/la-ia-por-dentro/02-aprendizaje-supervisado-y-no-supervisado]]
- [[glosario/aprendizaje-supervisado]]
- [[glosario/sobreajuste]]
- [[cursos/ruta-en-video/01-fase-0-que-es-la-ia]]
