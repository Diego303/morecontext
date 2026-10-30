---
titulo: Nivel 30 · Contexto, memoria y RAG
descripcion: "Aprende a dar al modelo la información justa: embeddings, troceado, búsqueda híbrida, reranking, respuestas con citas comprobables y memoria entre sesiones."
creado: 2026-08-18
actualizado: 2026-10-29
nivel: 30
horas: 6
objetivo: Construir un sistema que recupera fragmentos relevantes de tus documentos, responde citándolos y recuerda lo importante entre sesiones.
prerrequisitos: ["[[roadmap/20-herramientas/index]]", "[[roadmap/10-prompting/03-formato-de-salida]]", "[[roadmap/00-fundamentos/03-ventana-de-contexto]]"]
proyecto:
  titulo: Asistente sobre tu documentación con citas verificadas
  descripcion: Un asistente de línea de comandos que indexa una carpeta de documentos Markdown, recupera con búsqueda híbrida y reranking, responde citando fragmentos numerados, comprueba cada cita y guarda en un archivo las preferencias del usuario entre sesiones.
  entregable: Un repositorio con indexar.py, preguntar.py y memoria.json, más un archivo preguntas.jsonl con 20 preguntas, la respuesta esperada y el fragmento que debe aparecer citado, y un informe breve con cuántas aciertan y cuántas citas fallan la verificación.
tags: [rag, contexto, memoria, embeddings]
relacionados: ["[[docs/contexto/03-rag]]", "[[sistemas/rag-con-citas]]", "[[cursos/rag-a-fondo/index]]", "[[glosario/rag]]"]
---

Hasta ahora el modelo solo sabía lo que traía de serie y lo que tú escribías en el prompt. En este nivel aprendes a darle **la información justa de tus propios documentos** en cada llamada, y a que recuerde lo importante de una conversación a la siguiente. Es la base de casi cualquier asistente útil en una empresa.

## Para quién es

Para quien ya sabe hacer llamadas a la API, pedir salida estructurada y usar herramientas (niveles 00 a 20). No necesitas saber matemáticas más allá del producto escalar, que se explica en la primera lección.

## Qué vas a construir

El proyecto es un asistente sobre una carpeta de documentos. Lo montas pieza a pieza: cada lección añade una capa y al final tienes el sistema completo. La pieza central es la [[glosario/rag|recuperación aumentada]] (*RAG*): buscar fragmentos relevantes y meterlos en el contexto antes de preguntar. El criterio de calidad está en el entregable: no basta con que responda bien; cada cita tiene que existir en el fragmento citado.

## Lecciones

1. [[roadmap/30-contexto-y-rag/01-embeddings]]. Qué es un vector de *embedding*, cómo se compara con similitud coseno y cómo montar una búsqueda semántica mínima con una función `embed()` independiente del proveedor.
2. [[roadmap/30-contexto-y-rag/02-chunking]]. Cómo trocear documentos respetando su estructura, con solapamiento y metadatos. De aquí sale la mitad de la calidad de un RAG.
3. [[roadmap/30-contexto-y-rag/03-busqueda-hibrida]]. Por qué los vectores fallan con códigos y nombres propios, cómo funciona BM25 y cómo fusionar ambas listas con RRF.
4. [[roadmap/30-contexto-y-rag/04-reranking]]. Recuperar mucho y quedarte con poco: reordenar candidatos con un modelo antes de pasarlos al contexto.
5. [[roadmap/30-contexto-y-rag/05-respuestas-con-citas]]. Fragmentos numerados en etiquetas XML, respuestas con citas literales y un verificador en código que las comprueba.
6. [[roadmap/30-contexto-y-rag/06-memoria-entre-sesiones]]. Qué merece la pena recordar, resumen frente a hechos y cómo mantener un archivo de memoria sin que se llene de basura.

> [!consejo] Mide desde la lección 1
> Escribe ya tus 20 preguntas de prueba con el fragmento que debería salir. Cada lección cambia algo de la recuperación, y sin esas preguntas no sabrás si has mejorado o empeorado. Lo verás a fondo en [[roadmap/80-evals/02-conjunto-de-prueba]].

## Recetas para el proyecto

Cada lección tiene una receta que resuelve su pieza de forma completa, por si te atascas o quieres comparar:

- [[recetas/rag-minimo-viable]]: el asistente entero en su versión más simple, para tener algo que mejorar desde el primer día.
- [[recetas/trocear-documentos]] y [[recetas/chunks-padre-hijo]]: troceado por estructura y la técnica de buscar en pequeño y responder en grande (lección 2).
- [[recetas/fusionar-rankings-con-rrf]]: la fusión de listas de la lección 3, aislada y con pruebas.
- [[recetas/rag-local-con-pgvector]] y [[recetas/busqueda-hibrida-con-qdrant]]: el mismo índice sobre una base vectorial abierta, cuando una lista en memoria se queda corta.
- [[recetas/pdf-a-markdown-con-docling]]: si tus documentos son PDF y no Markdown.
- [[recetas/depurar-un-rag]] y [[recetas/reindexado-incremental]]: qué revisar cuando falla y cómo mantener el índice al día.

Si algo no funciona, empieza por los dos problemas más comunes: [[problemas/el-rag-no-encuentra-el-documento]] y [[problemas/el-rag-encuentra-pero-responde-mal]].

## Después de este nivel

Con recuperación y memoria resueltas, el siguiente paso es dejar que el modelo decida qué hacer en un bucle: [[roadmap/40-primer-agente/index]]. Si quieres profundizar en RAG antes, sigue con [[cursos/rag-a-fondo/index]] o lee la ficha de sistema [[sistemas/rag-con-citas]]. El curso continúa donde acaba este nivel:

- [[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]: cómo buscan rápido las bases vectoriales (ANN, HNSW, IVF y PQ).
- [[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]: reescritura de consultas, multi-query, HyDE y compresión de contexto.
- [[cursos/rag-a-fondo/06-el-corpus-manda]]: PDF, OCR, tablas y jerarquía de documentos reales.
- [[cursos/rag-a-fondo/07-permisos-y-multi-tenant]]: que cada usuario solo recupere lo que puede ver.
- [[cursos/rag-a-fondo/08-mantener-el-indice]]: documentos que cambian, reindexado y versiones del modelo de *embeddings*.
- [[cursos/rag-a-fondo/09-cuando-el-rag-vectorial-no-basta]]: GraphRAG, RAG agéntico y contexto largo.

Y si quieres el sistema entero sin depender de ninguna API, [[cursos/agentes-con-modelos-abiertos/05-rag-cien-por-cien-local]] lo monta con modelos abiertos en tu máquina.
