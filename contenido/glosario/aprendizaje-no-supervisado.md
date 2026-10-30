---
titulo: Aprendizaje no supervisado
descripcion: Aprender la estructura de unos datos sin etiquetas, agrupando ejemplos parecidos o resumiéndolos con menos números.
creado: 2026-10-29
categoria: fundamentos
ingles: Unsupervised learning
aliases: [Unsupervised learning, clustering, agrupamiento]
tags: [fundamentos, machine-learning]
relacionados: ["[[cursos/la-ia-por-dentro/02-aprendizaje-supervisado-y-no-supervisado]]", "[[glosario/aprendizaje-supervisado]]", "[[glosario/embeddings]]"]
---

El aprendizaje no supervisado recibe solo entradas, sin respuesta correcta, y busca estructura en ellas. Los dos problemas típicos son el **clustering**, agrupar ejemplos parecidos sin saber de antemano qué grupos hay (como hace k-means), y la **reducción de dimensión**, describir cada ejemplo con menos números sin perder lo importante.

## En la práctica

El algoritmo encuentra los grupos, pero no sabe qué significan: ponerles nombre te toca a ti, igual que decidir cuántos buscar. Sin etiquetas no hay respuesta con la que comparar, y por eso evaluarlo es más difícil que evaluar un modelo supervisado. Con un agente en producción es una herramienta de operación: agrupa por parecido, con [[glosario/embeddings|embeddings]], las preguntas reales de tus usuarios o los fallos de tus trazas, y verás qué casos son frecuentes y dónde fallas más ([[glosario/analisis-de-errores|análisis de errores]]).

## No confundir con

- **Aprendizaje autosupervisado**: también parte de datos sin etiquetar, pero fabrica una respuesta correcta escondiendo una parte (el siguiente token) y aprende a predecirla. Es la base del [[glosario/preentrenamiento|preentrenamiento]] de un LLM.
- **[[glosario/aprendizaje-supervisado|Aprendizaje supervisado]]**: cada ejemplo trae su etiqueta.

## Ver también

- [[cursos/la-ia-por-dentro/02-aprendizaje-supervisado-y-no-supervisado]]
- [[glosario/embeddings]]
- [[glosario/similitud-coseno]]
- [[glosario/aprendizaje-automatico]]
