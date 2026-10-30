---
titulo: Evals
descripcion: Pruebas sistemáticas que miden si un sistema con LLM hace bien su tarea, sobre casos y criterios definidos.
creado: 2026-09-01
actualizado: 2026-10-29
categoria: evals
ingles: evaluations
aliases: [evaluaciones, evaluations, eval]
tags: [evals, calidad]
relacionados: ["[[roadmap/80-evals/01-por-que-evals]]", "[[disciplinas/evals]]"]
---

Las *evals* son las pruebas automáticas de un sistema con LLM: un [[glosario/conjunto-de-evaluacion]] con entradas y lo que se espera de cada una, un criterio para puntuar cada salida y un número final que puedes comparar entre versiones. Te dicen si un cambio de prompt, de modelo o de herramienta mejora o rompe algo.

## En la práctica

Empieza con 20–50 casos reales, incluidos los que ya han fallado. Puntúa con código siempre que puedas (JSON válido, campo correcto, contiene la cita) y usa un [[glosario/modelo-juez]] solo para lo que el código no sabe juzgar, como el tono o la fidelidad a una fuente. En agentes, evalúa también la [[glosario/trayectoria]], no solo la respuesta final. Antes de escribir métricas, lee trazas reales y clasifica sus fallos ([[glosario/analisis-de-errores]]). Como el resultado varía entre ejecuciones, repite cada caso y mira [[glosario/pass-k|pass@k y pass^k]]. Ejecuta las evals en CI para detectar regresiones antes de desplegar; herramientas abiertas como promptfoo o DeepEval te ahorran el andamiaje.

## No confundir con

- **[[docs/evals/03-benchmarks-publicos|Benchmarks públicos]]**: miden modelos en tareas genéricas y sufren [[glosario/contaminacion-de-benchmark|contaminación]]. Tus evals miden tu sistema en tu tarea.
- **Tests unitarios**: comprueban código determinista; las evals aceptan variación y miden tasas.

## Ver también

- [[roadmap/80-evals/01-por-que-evals]]
- [[docs/evals/01-disenar-evals]]
- [[recetas/evals-de-regresion-en-ci]]
- [[cursos/evals-para-agentes/index]]
- [[recetas/evals-con-promptfoo]]
