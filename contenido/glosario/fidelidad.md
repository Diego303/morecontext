---
titulo: Fidelidad
descripcion: Métrica de respuesta de un RAG que mide qué parte de lo afirmado está respaldado por los fragmentos recuperados.
creado: 2026-10-29
categoria: contexto
ingles: Faithfulness
aliases: [faithfulness, fidelidad al contexto, groundedness, respaldo en el contexto]
tags: [rag, evals, metricas]
relacionados: ["[[cursos/rag-a-fondo/10-evaluar-un-rag]]", "[[glosario/grounding]]", "[[glosario/modelo-juez]]"]
---

La fidelidad (*faithfulness*) mide si una respuesta se apoya en el contexto que recibió el modelo. Se divide la respuesta en afirmaciones y se cuenta qué fracción está respaldada por los fragmentos recuperados: `afirmaciones respaldadas / afirmaciones totales`. Una respuesta con fidelidad 1 no dice nada que no esté en las fuentes.

## En la práctica

Se mide contra **los fragmentos**, no contra una respuesta de referencia. Una respuesta puede ser correcta y poco fiel, porque el modelo lo sabía de antes, y en un RAG eso es un defecto: el usuario no puede comprobarla en las citas. La forma habitual es un [[glosario/modelo-juez]] que extrae las afirmaciones y marca cada una como respaldada o no, con [[glosario/salida-estructurada]] para que el resultado sea contable. Calibra ese juez con unas veinte respuestas que etiquetes tú antes de fiarte de la cifra. Herramientas como [[herramientas/ragas]] o [[herramientas/deepeval]] traen una métrica de fidelidad lista, pero revisa qué instrucción usa el juez.

## No confundir con

- **Corrección**: si la respuesta coincide con la verdad o con la referencia. Se mide aparte.
- **Relevancia de la respuesta**: si contesta a lo que se preguntó. Una respuesta puede ser fiel y no responder.
- **[[glosario/grounding]]**: la propiedad que buscas al construir el sistema; la fidelidad es cómo la mides.

## Ver también

- [[cursos/rag-a-fondo/10-evaluar-un-rag]]
- [[problemas/el-rag-encuentra-pero-responde-mal]]
- [[sistemas/rag-con-citas]]
- [[glosario/alucinacion]]
