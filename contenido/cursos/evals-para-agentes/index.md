---
titulo: Evals para agentes
descripcion: Monográfico para evaluar agentes de verdad, con resultado, trayectoria y coste, datasets que reflejan el uso real, graders bien calibrados y evals integradas en el trabajo diario.
creado: 2026-10-07
orden: 3
nivel: intermedio
horas: 5
objetivo: Diseñar y mantener un sistema de evaluación para agentes que mida resultado, trayectoria, eficiencia y seguridad, y usarlo para decidir cada cambio.
requiere: ["[[roadmap/40-primer-agente/index]]", "[[roadmap/80-evals/index]]"]
relacionados: ["[[glosario/evals]]", "[[disciplinas/evals]]", "[[docs/evals/01-disenar-evals]]", "[[recetas/evals-de-regresion-en-ci]]"]
tags: [evals, agentes, calidad]
---

El [[roadmap/80-evals/index|nivel 80 del roadmap]] te enseñó por qué evaluar, cómo montar un conjunto de prueba y cómo llevarlo a CI. Este curso se centra en lo que hace difíciles las [[glosario/evals|evals]] de agentes: muchas formas válidas de llegar al resultado, efectos en sistemas externos, resultados que varían entre ejecuciones y graders que también se equivocan.

## Objetivo

Al terminar sabrás decidir qué medir en un agente concreto, construir y versionar un dataset de tareas con su entorno, combinar graders de código, de modelo y humanos según lo que miden, y montar una rutina en la que cada cambio de prompt, herramienta o modelo pasa por la evaluación antes de llegar a producción.

## Para quién

Para quien ya tiene un [[glosario/agente|agente]] funcionando (aunque sea pequeño) y nota que cada mejora rompe algo que antes iba bien. También para quien revisa trabajo de agentes y necesita criterios más finos que «parece que funciona».

## Requisitos

- [[roadmap/40-primer-agente/index]]: bucle agéntico, condiciones de parada y trazas.
- [[roadmap/80-evals/index]]: conjunto de prueba, modelo juez y regresiones en CI a nivel básico.
- Recomendable: [[roadmap/100-produccion/index]], para conectar evals con observabilidad.

## Temario

1. [[cursos/evals-para-agentes/01-que-medir]]. Resultado, [[glosario/trayectoria|trayectoria]], eficiencia y seguridad. Comprobar el estado final del entorno en lugar del texto, y medir la consistencia entre ejecuciones con pass@k y pass^k.
2. [[cursos/evals-para-agentes/02-datasets-de-evaluacion]]. De dónde salen las tareas, cómo se describen (entrada, entorno, criterio de éxito), cuántas hacen falta, cómo se versionan y cómo evitar que el dataset se quede viejo.
3. [[cursos/evals-para-agentes/03-graders]]. Cuándo usar código, cuándo un [[glosario/modelo-juez|modelo juez]] y cuándo una persona; rúbricas, sesgos conocidos y calibración contra etiquetas humanas.
4. [[cursos/evals-para-agentes/04-evals-en-el-dia-a-dia]]. Un ejecutor con concurrencia y comparación con la línea base, umbrales de regresión, qué ejecutar en cada PR y qué cada noche, y el ciclo que convierte fallos de producción en casos nuevos.

## Qué construyes

Un banco de evaluación para un agente tuyo con al menos 25 tareas, cada una con su entorno reproducible y su criterio de éxito; graders de los tres tipos; un ejecutor que lanza varias pruebas por tarea, calcula métricas de resultado, trayectoria y coste, y compara contra la última versión aprobada. Al final, lo enganchas a tu CI.

> [!consejo] Empieza pequeño y real
> Veinte tareas sacadas de uso real valen más que doscientas inventadas. El curso te enseña a crecer desde ahí sin perder la señal.
