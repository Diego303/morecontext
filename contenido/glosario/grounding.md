---
titulo: Grounding
descripcion: Anclar las respuestas del modelo a fuentes concretas que tiene en el contexto, para que pueda justificarlas y citarlas.
creado: 2026-08-12
actualizado: 2026-10-29
categoria: contexto
aliases: [anclaje, anclaje en fuentes, respuesta fundamentada]
tags: [rag, fiabilidad]
relacionados: ["[[roadmap/30-contexto-y-rag/05-respuestas-con-citas]]", "[[sistemas/rag-con-citas]]"]
---

*Grounding* es hacer que el modelo responda a partir de información concreta que le das (documentos, resultados de búsqueda, datos de una herramienta) y no de lo que recuerda de su entrenamiento. Una respuesta está bien anclada cuando cada afirmación se puede rastrear hasta un fragmento de esas fuentes.

## En la práctica

Tres piezas: meter las fuentes en el contexto con identificadores (`<doc id="3">…</doc>`), pedir que cada afirmación cite el identificador o la frase exacta, y permitir que el modelo diga que la información no está. Después, verifica con código que las citas existen en el texto original. Es la defensa principal contra la [[glosario/alucinacion]] en sistemas [[glosario/rag|RAG]], y se mide con la [[glosario/fidelidad]]. La API de Claude tiene además citas nativas (`"citations": {"enabled": true}` en los documentos), que no se pueden combinar con la [[glosario/salida-estructurada]].

## No confundir con

- **[[glosario/rag|RAG]]**: es la arquitectura que trae las fuentes. El grounding es la propiedad de que la respuesta se apoye en ellas; puedes tener RAG y respuestas mal ancladas.

## Ver también

- [[roadmap/30-contexto-y-rag/05-respuestas-con-citas]]
- [[sistemas/rag-con-citas]]
- [[modelos/07-documentos-largos]]
- [[glosario/alucinacion]]
- [[problemas/el-rag-encuentra-pero-responde-mal]]
