---
titulo: RAG a fondo
descripcion: Monográfico para pasar de un RAG que funciona en la demo a uno que puedes medir, depurar y mejorar con datos en producción.
creado: 2026-09-14
actualizado: 2026-10-29
orden: 1
nivel: intermedio
horas: 8
objetivo: Diseñar, indexar, recuperar, mantener y evaluar un sistema RAG con métricas de recuperación y de respuesta, y saber en qué etapa falla cuando falla.
requiere: ["[[roadmap/30-contexto-y-rag/index]]", "[[roadmap/20-herramientas/index]]"]
relacionados: ["[[sistemas/rag-con-citas]]", "[[docs/contexto/03-rag]]", "[[glosario/rag]]", "[[recetas/busqueda-hibrida-con-bm25]]", "[[plantillas/checklist-de-rag]]"]
tags: [rag, recuperacion, evals]
---

En el [[roadmap/30-contexto-y-rag/index|nivel 30 del roadmap]] montaste un [[glosario/rag|RAG]] que responde con citas. Este curso empieza donde aquel termina: qué pasa cuando tienes miles de documentos sucios, preguntas ambiguas y un usuario que dice «se lo ha inventado». Aquí aprendes a tratar el RAG como un sistema con etapas que se miden una a una.

## Objetivo

Al terminar sabrás construir un RAG cuyas decisiones puedes justificar con números. Sabrás limpiar y trocear con criterio, elegir y ajustar una base vectorial, combinar búsqueda léxica y vectorial, aplicar [[glosario/recuperacion-contextual|recuperación contextual]] y técnicas de consulta avanzadas, filtrar por permisos, mantener el índice al día y medir con recall@k, precision@k, MRR, NDCG, fidelidad y calidad de citas. Lo más útil: sabrás distinguir un fallo de recuperación de un fallo de generación, y reconocer cuándo el RAG vectorial no es la herramienta adecuada.

## Para quién

Para desarrolladores que ya tienen un RAG básico (o lo han hecho siguiendo el roadmap) y quieren llevarlo a producción. Si nunca has generado [[glosario/embeddings|embeddings]] ni has troceado un documento, haz antes el nivel 30 completo.

## Requisitos

- [[roadmap/30-contexto-y-rag/index]]: embeddings, [[glosario/chunking|chunking]], [[glosario/busqueda-hibrida|búsqueda híbrida]], [[glosario/reranking|reranking]] y citas a nivel básico.
- [[roadmap/20-herramientas/index]]: para entender el RAG como herramienta dentro de un agente.
- Recomendable: [[roadmap/80-evals/index]], aunque la lección 10 explica lo necesario.

Necesitas Python 3.11 o superior, una clave de la API de Anthropic y acceso a un proveedor de embeddings (el que prefieras; Anthropic no ofrece modelo de embeddings). Si prefieres que todo corra en tu máquina, con embeddings y modelo abiertos, combina el curso con [[cursos/agentes-con-modelos-abiertos/05-rag-cien-por-cien-local]].

## Temario

El curso tiene tres bloques. Las lecciones 1 a 3 montan la tubería básica bien hecha; de la 4 a la 9 profundizas en cada pieza y en los casos difíciles; la 10 lo mide todo.

1. [[cursos/rag-a-fondo/01-anatomia-de-un-rag]]. Las dos tuberías (indexación y consulta), qué decide cada etapa y cómo fallan. Montas un esqueleto con trazas por etapa para depurar desde el primer día.
2. [[cursos/rag-a-fondo/02-indexar-bien]]. Limpieza de HTML y PDF, deduplicado, troceado que respeta la estructura, identificadores estables y metadatos útiles para filtrar y para citar.
3. [[cursos/rag-a-fondo/03-recuperar-bien]]. Fusión de rankings con RRF, reranking con modelo, filtros por metadatos y recuperación contextual según el método que Anthropic publicó en 2024, con [[glosario/prompt-caching|prompt caching]] para que salga barato.
4. [[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]. Qué hace una base vectorial: búsqueda aproximada ([[glosario/ann|ANN]]), [[glosario/hnsw|HNSW]], IVF y cuantización, y los parámetros que cambian recall y latencia en pgvector y Qdrant.
5. [[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]. Reescritura de consulta, multi-query, [[glosario/hyde|HyDE]], descomposición, fragmentos padre e hijo y recuperación adaptativa, con lo que cuesta cada una en llamadas extra.
6. [[cursos/rag-a-fondo/06-el-corpus-manda]]. PDF difíciles, OCR, tablas, duplicados y jerarquía documental, con herramientas abiertas de ingesta.
7. [[cursos/rag-a-fondo/07-permisos-y-multi-tenant]]. La autorización va en la recuperación: filtros obligatorios, varios clientes en un índice, inyección en documentos y datos personales.
8. [[cursos/rag-a-fondo/08-mantener-el-indice]]. Indexación incremental con hashes, borrados, cambio de modelo de embeddings sin cortar el servicio y frescura de los datos.
9. [[cursos/rag-a-fondo/09-cuando-el-rag-vectorial-no-basta]]. Datos estructurados, preguntas [[glosario/multi-hop|multi-hop]], [[glosario/graphrag|GraphRAG]], [[glosario/rag-agentico|RAG agéntico]] y cuándo meter todo en el contexto en lugar de recuperar.
10. [[cursos/rag-a-fondo/10-evaluar-un-rag]]. Un conjunto de evaluación con fragmentos relevantes etiquetados, métricas de recuperación (recall@k, precision@k, MRR, NDCG) y de respuesta (fidelidad, citas, abstención), RAGAS como alternativa abierta y cómo leer los resultados para decidir el siguiente cambio.

Cada lección trae código ejecutable y un ejercicio con criterio de aceptación. Las lecciones se apoyan unas en otras: el índice de la 2 es el que recuperas en la 3, ajustas de la 4 a la 8 y evalúas en la 10. Si vas con prisa, haz 1, 2, 3 y 10, y vuelve a las intermedias cuando tus métricas señalen la etapa que falla.

## Qué construyes

Un RAG sobre una colección de documentos tuya (la documentación de tu equipo, un manual, tus notas) con:

- un indexador incremental que limpia, trocea y guarda metadatos con IDs estables;
- un recuperador híbrido con reranking y contexto añadido a cada fragmento, sobre una base vectorial con parámetros elegidos a propósito;
- filtros de permisos aplicados en la consulta al índice;
- un banco de evaluación con al menos 30 preguntas etiquetadas y un informe que compara variantes.

> [!consejo] Usa tus propios documentos
> Los corpus de ejemplo están demasiado limpios. Los problemas interesantes (tablas rotas, versiones duplicadas, jerga interna) solo aparecen con documentos reales.

Si quieres ver el resultado como arquitectura completa, consulta el sistema [[sistemas/rag-con-citas]]. Para repasar antes de producción, usa la [[plantillas/checklist-de-rag]]; si algo falla, empieza por [[recetas/depurar-un-rag]].
