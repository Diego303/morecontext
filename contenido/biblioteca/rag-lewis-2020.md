---
titulo: Retrieval-Augmented Generation (Lewis et al., 2020)
descripcion: "El paper que dio nombre al RAG: un generador que consulta un índice de documentos al responder. Qué proponía de verdad y en qué se parece al RAG que montas hoy."
creado: 2026-10-29
tags: [biblioteca, rag, contexto, recuperacion]
relacionados: ["[[glosario/rag]]", "[[docs/contexto/03-rag]]", "[[cursos/rag-a-fondo/01-anatomia-de-un-rag]]", "[[biblioteca/lost-in-the-middle]]"]
autores: Lewis et al.
anio: 2020
url: https://arxiv.org/abs/2005.11401
tipo: paper
tema: contexto
nivel: intermedio
---

*Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*, de un equipo de Facebook AI Research con colaboradores universitarios, acuñó el término [[glosario/rag|RAG]]. Parte de un problema que sigue vigente: un modelo de lenguaje guarda conocimiento en sus pesos, pero no puede decir de dónde lo saca ni actualizarlo sin reentrenar. Su propuesta es combinar esa memoria con un índice de documentos que el modelo consulta al generar.

## La idea clave

El paper distingue dos memorias:

- **Paramétrica**: lo que el modelo aprendió en sus pesos. Aquí es BART, un modelo secuencia a secuencia preentrenado.
- **No paramétrica**: un índice de vectores densos de la Wikipedia, que se consulta con un recuperador neuronal (DPR).

Para cada pregunta, el recuperador codifica la consulta como vector, busca los fragmentos más parecidos y se los pasa al generador junto con la pregunta. Lo original es que **recuperador y generador se entrenan juntos**, de extremo a extremo: los documentos recuperados se tratan como una variable oculta y el modelo aprende a recuperar lo que le ayuda a generar la respuesta correcta, sin que nadie le diga qué documento era el bueno. Para que sea viable, el codificador de documentos y el índice se quedan fijos; solo se ajustan el codificador de consultas y el generador.

Comparan dos variantes. **RAG-Sequence** usa los mismos documentos para toda la respuesta. **RAG-Token** puede apoyarse en un documento distinto para cada token. Según el [resumen](https://arxiv.org/abs/2005.11401), el sistema logró el mejor resultado de entonces en tres tareas de preguntas abiertas y generó texto más específico y factual que un modelo solo paramétrico.

Hay un experimento pequeño que conviene no saltarse: al **cambiar el índice** de una Wikipedia antigua por otra más reciente, el modelo responde con la información nueva sin reentrenar nada.

## Por qué importa hoy

Las dos ideas de fondo son las razones por las que hoy montas un RAG:

- **Actualizar el conocimiento cambiando el índice, no el modelo.** Es más barato y rápido que el [[glosario/fine-tuning|fine-tuning]], y es lo que te permite trabajar con documentos privados o que cambian.
- **Saber de dónde sale la respuesta.** Si el modelo responde a partir de fragmentos concretos, puedes [[roadmap/30-contexto-y-rag/05-respuestas-con-citas|citarlos y comprobarlos]]. Es la base del [[glosario/grounding|grounding]].

Lo que ha cambiado es la arquitectura práctica. Hoy casi nadie entrena el recuperador y el generador juntos. Usas un LLM general sin tocar, un recuperador separado ([[glosario/embeddings|embeddings]], [[glosario/bm25|BM25]] o una [[glosario/busqueda-hibrida|búsqueda híbrida]], con [[glosario/reranking|reranking]]) y metes los fragmentos en el prompt. La calidad depende sobre todo de lo que llega al contexto. Y en un agente, la búsqueda suele ser una herramienta más que el modelo decide cuándo usar: el [[glosario/rag-agentico|RAG agéntico]].

## Qué leer primero

1. **La sección 1** con la figura 1, que dibuja el sistema completo.
2. **La sección 2.1**, con las dos variantes, y **las secciones 2.2 y 2.3**, con el recuperador y el generador.
3. **La sección 2.4** sobre entrenamiento, para entender por qué el índice se queda fijo.
4. **Los resultados adicionales de la sección 4**, con el cambio de índice y el efecto de recuperar más o menos documentos.

Sáltate los detalles de decodificación de la sección 2.5 y las tablas por tarea salvo la de preguntas abiertas.

## Qué ha envejecido

- **El entrenamiento conjunto.** Es elegante, pero exige controlar el modelo. Con modelos de API no puedes hacerlo, y con buenos recuperadores separados no suele hacer falta.
- **Los componentes.** BART y DPR tienen un tamaño y un rendimiento muy por debajo de lo que usas hoy, y la colección es solo Wikipedia troceada en pasajes cortos.
- **El presupuesto de contexto.** El generador recibe unos pocos pasajes. Con ventanas de cientos de miles de tokens, la pregunta ahora es cuánto meter y en qué orden, y ahí [[biblioteca/lost-in-the-middle|Lost in the Middle]] y el [[glosario/context-rot|context rot]] dicen que más no siempre es mejor.

## Dónde lo ves en MoreContext

- [[docs/contexto/03-rag]] y [[cursos/rag-a-fondo/01-anatomia-de-un-rag]]: el RAG actual, pieza a pieza.
- [[roadmap/30-contexto-y-rag/01-embeddings]] y [[glosario/bi-encoder]]: el tipo de recuperador que usa el paper.
- [[recetas/rag-minimo-viable]]: un RAG funcionando en una tarde.
- [[modelos/10-prompting-rag-o-fine-tuning]]: cuándo elegir RAG frente a fine-tuning.
