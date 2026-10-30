---
titulo: Pregunta multi-hop
descripcion: Pregunta que solo se responde encadenando varias piezas de información, donde cada búsqueda depende del resultado de la anterior.
creado: 2026-10-29
categoria: contexto
ingles: Multi-hop question
aliases: [multi-hop, multi-hop question, pregunta de varios saltos, razonamiento multi-hop, multi-hop QA]
tags: [rag, busqueda, agentes]
relacionados: ["[[cursos/rag-a-fondo/09-cuando-el-rag-vectorial-no-basta]]", "[[glosario/rag-agentico]]", "[[glosario/reescritura-de-consulta]]"]
---

Una pregunta multi-hop necesita varios «saltos»: encontrar un dato intermedio y usarlo para buscar el siguiente. «¿Quién dirigía el departamento cuando se aprobó la política X?» exige recuperar la política, leer su fecha y buscar después quién dirigía el departamento en esa fecha. Ningún fragmento contiene la respuesta entera.

## En la práctica

Una sola búsqueda top-K suele fallar: la pregunta se parece a la política X, no al organigrama de 2024, y el segundo documento no aparece. Tres formas de resolverlo:

- **Descomponer** la pregunta en subpreguntas con [[glosario/reescritura-de-consulta]] y recuperar para cada una. Sirve si los saltos se conocen de antemano.
- **Recuperar en bucle**: dar la búsqueda al modelo como herramienta y dejar que busque, lea y vuelva a buscar con lo aprendido. Es [[glosario/rag-agentico|RAG agéntico]]; pon un límite de búsquedas.
- **Usar estructura**: si las relaciones entre entidades son el núcleo del dominio, un grafo ([[glosario/graphrag]]) o una base de datos con SQL las resuelven mejor que los vectores.

Mete en tu [[glosario/conjunto-de-evaluacion]] algunas preguntas multi-hop con todos los fragmentos necesarios etiquetados: un buen [[glosario/recall-at-k|recall@K]] medio puede esconder que estas fallan siempre.

## No confundir con

- **Pregunta compuesta**: «¿Cuál es la política de España y la de Portugal?». Son dos búsquedas independientes; en multi-hop, la segunda depende de la primera.

## Ver también

- [[cursos/rag-a-fondo/09-cuando-el-rag-vectorial-no-basta]]
- [[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]
- [[glosario/rag-agentico]]
