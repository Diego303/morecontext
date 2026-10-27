---
titulo: "Ventanas de contexto enormes: no sustituyen a la recuperación"
descripcion: Que quepa todo en la ventana no significa que convenga meterlo. La recuperación sigue ganando en coste, latencia y precisión en la mayoría de casos.
creado: 2026-09-22
categoria: modelos
tags: [contexto, rag, contexto-largo]
fuente:
  titulo: "Liu et al., 2023 · Lost in the Middle: How Language Models Use Long Contexts"
  url: https://arxiv.org/abs/2307.03172
relacionados: ["[[glosario/contexto-largo]]", "[[glosario/rag]]", "[[modelos/07-documentos-largos]]", "[[cursos/context-engineering/01-el-contexto-como-presupuesto]]"]
---

## Qué es

Las [[glosario/ventana-de-contexto|ventanas de contexto]] de los modelos han crecido tanto que muchos corpus pequeños caben enteros. La tentación es dejar de hacer [[glosario/rag|RAG]] y pegarlo todo. La tendencia entre quienes miden es la contraria: usar el [[glosario/contexto-largo|contexto largo]] como complemento de la recuperación, no como reemplazo.

## Qué cambia en la práctica

- **Coste y latencia escalan con los tokens de entrada.** Mandar cien mil tokens en cada pregunta se paga en cada pregunta, aunque el [[glosario/prompt-caching|prompt caching]] amortigue parte.
- **La atención no es uniforme.** Liu et al. mostraron que los modelos usan peor la información situada en mitad de contextos largos. Más texto irrelevante es más ruido.
- **Sin recuperación pierdes trazabilidad.** Citar la fuente exacta es más fácil cuando sabes qué fragmentos entraron.
- El contexto largo sí ayuda cuando la tarea exige ver un documento entero: comparar versiones, revisar un contrato completo, razonar sobre un repositorio pequeño.

## Qué hacer

1. Mide antes de decidir: compara calidad, coste y latencia de «todo en contexto» frente a recuperar los mejores fragmentos con tu [[glosario/conjunto-de-evaluacion|conjunto de evaluación]].
2. Si recuperas, hazlo bien: [[roadmap/30-contexto-y-rag/03-busqueda-hibrida|búsqueda híbrida]] y [[roadmap/30-contexto-y-rag/04-reranking|reranking]].
3. Si usas documentos largos, colócalos arriba y la pregunta al final, como explica [[modelos/07-documentos-largos]].
4. Trata el contexto como un presupuesto: [[disciplinas/context-engineering]].
