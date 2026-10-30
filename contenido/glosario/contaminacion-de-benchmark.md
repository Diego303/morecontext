---
titulo: Contaminación de benchmark
descripcion: Cuando las tareas de un benchmark o sus soluciones estaban en los datos de entrenamiento y la puntuación sobrestima lo que el modelo sabe hacer.
creado: 2026-10-29
categoria: evals
ingles: Benchmark contamination
aliases: [benchmark contamination, data contamination, contaminación de datos, fuga de test]
tags: [evals, modelos]
relacionados: ["[[docs/evals/03-benchmarks-publicos]]", "[[radar/2026-10-24-swe-bench-verified-retirado]]", "[[glosario/conjunto-de-evaluacion]]"]
---

Un benchmark está contaminado cuando el modelo vio sus tareas, o las soluciones, durante el entrenamiento. Entonces la puntuación mide en parte memoria y no capacidad, y deja de servir para comparar modelos. Con benchmarks públicos construidos a partir de repositorios y webs abiertas, el riesgo crece con cada generación de modelos.

## En la práctica

El caso más citado es SWE-bench Verified: OpenAI dejó de reportarlo el 23 de febrero de 2026 por defectos en los tests y por contaminación, y recomendó SWE-bench Pro, que reserva una parte de sus problemas fuera del acceso público ([OpenAI, feb. 2026](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/)). Para tus decisiones, la defensa más sólida es un [[glosario/conjunto-de-evaluacion]] propio, sacado de fallos reales y que no publiques. Al leer un benchmark ajeno, mira si tiene partición privada y de qué fecha son las tareas.

## No confundir con

- **[[glosario/sobreajuste]]**: memorizar el conjunto de entrenamiento propio; la contaminación es que el test se coló en el entrenamiento.
- **Ruido de infraestructura**: diferencias por recursos del entorno; Anthropic recomienda desconfiar de ventajas de menos de 3 puntos en benchmarks agénticos.

## Ver también

- [[docs/evals/03-benchmarks-publicos]]
- [[radar/2026-10-24-swe-bench-verified-retirado]]
- [[glosario/evals]]
- [[modelos/05-elegir-modelo-por-tarea]]
