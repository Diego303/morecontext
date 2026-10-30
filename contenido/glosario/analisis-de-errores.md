---
titulo: Análisis de errores
descripcion: Leer trazas reales, anotar a mano dónde falla el sistema y agrupar los fallos en una taxonomía antes de automatizar ninguna eval.
creado: 2026-10-29
categoria: evals
ingles: Error analysis
aliases: [error analysis, open coding, axial coding, análisis de fallos]
tags: [evals, observabilidad]
relacionados: ["[[recetas/analisis-de-errores-de-trazas]]", "[[glosario/trayectoria]]", "[[disciplinas/evals]]"]
---

El análisis de errores es el método que propone [Hamel Husain y Shreya Shankar](https://hamel.dev/blog/posts/evals-faq/why-is-error-analysis-so-important-in-llm-evals-and-how-is-it-performed.html) para decidir qué evaluar: lees trazas de tu sistema, anotas qué va mal con tus palabras y agrupas esas notas en categorías que puedes contar. Las evals automáticas salen después, una por cada modo de fallo que importa.

## En la práctica

1. Reúne unas 100 trazas realistas y variadas.
2. ***Open coding***: lee al menos 30 a mano y escribe notas libres; en cada una apunta el **primer** fallo, porque los siguientes suelen ser consecuencia.
3. ***Axial coding***: agrupa las notas en una taxonomía y cuenta cuántas caen en cada categoría.
4. Repite con trazas nuevas hasta que no aparezcan categorías nuevas (saturación).

Para cada categoría frecuente, escribe una comprobación binaria (pasa o falla) con código o con un [[glosario/modelo-juez]] validado. Husain y Shankar insisten en no saltarse este paso.

## No confundir con

- **Métricas genéricas** (ROUGE, BERTScore, «utilidad» de 1 a 5): no salen de tus fallos y rara vez te dicen qué arreglar.

## Ver también

- [[recetas/analisis-de-errores-de-trazas]]
- [[roadmap/40-primer-agente/06-depurar-con-trazas]]
- [[cursos/evals-para-agentes/02-datasets-de-evaluacion]]
- [[recetas/validar-un-modelo-juez]]
