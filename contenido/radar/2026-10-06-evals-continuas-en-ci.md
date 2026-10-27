---
titulo: Las evals pasan del notebook al CI
descripcion: Los equipos que construyen con modelos tratan las evals como tests de regresión que se ejecutan en cada cambio de prompt, herramienta o modelo.
creado: 2026-10-06
categoria: evals
tags: [evals, ci, regresiones]
relacionados: ["[[glosario/evals]]", "[[roadmap/80-evals/05-regresiones-en-ci]]", "[[recetas/evals-de-regresion-en-ci]]", "[[disciplinas/evals]]"]
---

## Qué es

Durante mucho tiempo las [[glosario/evals|evals]] vivían en un notebook: alguien las ejecutaba a mano antes de un cambio grande y se olvidaban. La práctica que se extiende es tratarlas como tests. Un [[glosario/conjunto-de-evaluacion|conjunto de evaluación]] versionado junto al código, un umbral por métrica y una ejecución automática en cada pull request que toque prompts, definiciones de herramientas o el modelo.

## Qué cambia en la práctica

- Cambiar una línea del [[glosario/prompt-de-sistema|prompt de sistema]] pasa a ser un cambio revisable con evidencia, igual que cambiar código.
- Las evals tienen que ser rápidas y baratas para caber en CI: un subconjunto pequeño en cada PR y el conjunto completo de forma periódica.
- Los graders deterministas (código) dan señal estable. El [[glosario/modelo-juez|modelo juez]] cubre lo que el código no puede medir, pero introduce varianza que hay que acotar.
- En agentes, importa también la [[glosario/trayectoria|trayectoria]]: qué herramientas usó y cuántos pasos dio.

## Qué hacer

1. Empieza con 20–50 casos reales y criterios claros: [[roadmap/80-evals/02-conjunto-de-prueba]].
2. Decide qué se puntúa con código y qué con modelo: [[roadmap/80-evals/03-codigo-o-modelo-juez]].
3. Monta el job de regresión con la receta [[recetas/evals-de-regresion-en-ci]].
4. Guarda los resultados por versión para comparar, y añade un caso cada vez que encuentres un fallo en producción ([[cursos/evals-para-agentes/04-evals-en-el-dia-a-dia]]).
