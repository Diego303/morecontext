---
titulo: Alucinación
descripcion: Respuesta del modelo que suena plausible pero es falsa o no está respaldada por ninguna fuente.
creado: 2026-07-03
categoria: fundamentos
ingles: hallucination
aliases: [hallucination, alucinaciones, confabulación]
tags: [fundamentos, fiabilidad]
relacionados: ["[[glosario/grounding]]", "[[roadmap/30-contexto-y-rag/05-respuestas-con-citas]]"]
---

Una alucinación es una salida del modelo que suena segura y coherente pero es falsa o no se apoya en ningún dato que el modelo tenga delante: una cita inventada, una función de una librería que no existe, una cifra sin origen. Ocurre porque un [[glosario/llm|LLM]] genera el texto más probable dado el contexto, y lo probable no siempre coincide con lo cierto.

## En la práctica

No se elimina, se acota. Las palancas que funcionan: dar al modelo las fuentes en el contexto ([[glosario/rag|RAG]]), pedirle que cite el fragmento exacto en que se apoya, permitirle decir «no lo sé» y comprobar las citas con código. En agentes, las herramientas reducen el problema porque el modelo consulta datos reales en lugar de recordarlos.

## No confundir con

- **Error de razonamiento**: el modelo tiene los datos correctos y saca una conclusión equivocada. Se ataca con [[glosario/razonamiento-extendido|razonamiento]] o descomponiendo la tarea.
- **Información desactualizada**: era cierta cuando se entrenó el modelo y ya no lo es.

## Ver también

- [[glosario/grounding]]
- [[roadmap/30-contexto-y-rag/05-respuestas-con-citas]]
- [[sistemas/rag-con-citas]]
- [[roadmap/00-fundamentos/01-que-es-un-llm]]
