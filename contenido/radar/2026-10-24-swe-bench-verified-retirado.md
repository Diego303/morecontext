---
titulo: SWE-bench Verified deja de medir la frontera
descripcion: OpenAI deja de reportar SWE-bench Verified por tareas defectuosas y contaminación, y Anthropic mide que la infraestructura sola mueve 6 puntos en un benchmark agéntico.
creado: 2026-10-24
categoria: evals
tags: [evals, benchmarks, contaminacion]
fuente:
  titulo: "OpenAI, 23 feb. 2026 · Why SWE-bench Verified no longer measures frontier coding capabilities"
  url: https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/
relacionados: ["[[docs/evals/03-benchmarks-publicos]]", "[[glosario/contaminacion-de-benchmark]]", "[[docs/evals/01-disenar-evals]]", "[[disciplinas/evals]]"]
---

## Qué es

El 23 de febrero de 2026, OpenAI dejó de reportar SWE-bench Verified, el benchmark de referencia en agentes de código, y pidió a otros laboratorios que hicieran lo mismo. Auditó 138 de sus 500 problemas, los que o3 no resolvía de forma consistente: el 59,4 % tenía fallos materiales en los tests o en el enunciado (tests que exigen una implementación concreta o que comprueban cosas que nadie pidió). Además, los modelos frontera que probó reproducían en algunas tareas el arreglo original o el texto literal del problema: los habían visto al entrenarse. Recomienda SWE-bench Pro mientras prepara evaluaciones nuevas.

Unas semanas antes, [Anthropic (5 feb. 2026)](https://www.anthropic.com/engineering/infrastructure-noise) midió que en Terminal-Bench 2.0 la configuración de recursos sola, con el mismo modelo, mueve el resultado 6 puntos porcentuales.

## Qué cambia en la práctica

- Una cifra alta en SWE-bench Verified ya no dice mucho de un modelo de 2026.
- Las diferencias de menos de 3 puntos en benchmarks agénticos merecen escepticismo mientras no se documente la configuración.
- Las comparativas solo valen con el mismo arnés, los mismos recursos y el mismo número de intentos.

## Qué hacer

1. No elijas modelo por un leaderboard: úsalo para hacer la lista corta. Cómo leerlo, en [[docs/evals/03-benchmarks-publicos]].
2. Decide con tu propio conjunto de tareas sacadas de fallos reales ([[docs/evals/01-disenar-evals]]).
3. Repite cada tarea varias veces y mide [[glosario/pass-k|pass^k]], no un único intento.
