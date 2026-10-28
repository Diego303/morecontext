---
titulo: RAG a fondo
descripcion: Monográfico para pasar de un RAG que funciona en la demo a uno que puedes medir, depurar y mejorar con datos en producción.
creado: 2026-09-14
orden: 1
nivel: intermedio
horas: 5
objetivo: Diseñar, indexar, recuperar y evaluar un sistema RAG con métricas de recuperación y de respuesta, y saber en qué etapa falla cuando falla.
requiere: ["[[roadmap/30-contexto-y-rag/index]]", "[[roadmap/20-herramientas/index]]"]
relacionados: ["[[sistemas/rag-con-citas]]", "[[docs/contexto/03-rag]]", "[[glosario/rag]]", "[[recetas/busqueda-hibrida-con-bm25]]"]
tags: [rag, recuperacion, evals]
---

En el [[roadmap/30-contexto-y-rag/index|nivel 30 del roadmap]] montaste un [[glosario/rag|RAG]] que responde con citas. Este curso empieza donde aquel termina: qué pasa cuando tienes miles de documentos sucios, preguntas ambiguas y un usuario que dice «se lo ha inventado». Aquí aprendes a tratar el RAG como un sistema con etapas que se miden una a una.

## Objetivo

Al terminar sabrás construir un RAG cuyas decisiones puedes justificar con números. Sabrás limpiar y trocear con criterio, añadir metadatos que luego filtran, combinar búsqueda léxica y vectorial, aplicar [[glosario/recuperacion-contextual|recuperación contextual]] y medir con recall@k, MRR, fidelidad y calidad de citas. Lo más útil: sabrás distinguir un fallo de recuperación de un fallo de generación.

## Para quién

Para desarrolladores que ya tienen un RAG básico (o lo han hecho siguiendo el roadmap) y quieren llevarlo a producción. Si nunca has generado [[glosario/embeddings|embeddings]] ni has troceado un documento, haz antes el nivel 30 completo.

## Requisitos

- [[roadmap/30-contexto-y-rag/index]]: embeddings, [[glosario/chunking|chunking]], [[glosario/busqueda-hibrida|búsqueda híbrida]], [[glosario/reranking|reranking]] y citas a nivel básico.
- [[roadmap/20-herramientas/index]]: para entender el RAG como herramienta dentro de un agente.
- Recomendable: [[roadmap/80-evals/index]], aunque la lección 4 explica lo necesario.

Necesitas Python 3.11 o superior, una clave de la API de Anthropic y acceso a un proveedor de embeddings (el que prefieras).

## Temario

1. [[cursos/rag-a-fondo/01-anatomia-de-un-rag]]. Las dos tuberías (indexación y consulta), qué decide cada etapa y cómo fallan. Montas un esqueleto con trazas por etapa para depurar desde el primer día.
2. [[cursos/rag-a-fondo/02-indexar-bien]]. Limpieza de HTML y PDF, deduplicado, troceado que respeta la estructura, identificadores estables y metadatos útiles para filtrar y para citar.
3. [[cursos/rag-a-fondo/03-recuperar-bien]]. Fusión de rankings con RRF, reranking con modelo, filtros por metadatos y recuperación contextual según el método que Anthropic publicó en 2024, con [[glosario/prompt-caching|prompt caching]] para que salga barato.
4. [[cursos/rag-a-fondo/04-evaluar-un-rag]]. Un conjunto de evaluación con fragmentos relevantes etiquetados, métricas de recuperación (recall@k, MRR) y de respuesta (fidelidad, citas, abstención), y cómo leer los resultados para decidir el siguiente cambio.

Cada lección trae código ejecutable y un ejercicio con criterio de aceptación. Las lecciones se apoyan unas en otras: el índice de la 2 es el que recuperas en la 3 y evalúas en la 4.

## Qué construyes

Un RAG sobre una colección de documentos tuya (la documentación de tu equipo, un manual, tus notas) con:

- un indexador incremental que limpia, trocea y guarda metadatos con IDs estables;
- un recuperador híbrido con reranking y contexto añadido a cada fragmento;
- un banco de evaluación con al menos 30 preguntas etiquetadas y un informe que compara variantes.

> [!consejo] Usa tus propios documentos
> Los corpus de ejemplo están demasiado limpios. Los problemas interesantes (tablas rotas, versiones duplicadas, jerga interna) solo aparecen con documentos reales.

Si quieres ver el resultado como arquitectura completa, consulta el sistema [[sistemas/rag-con-citas]].
