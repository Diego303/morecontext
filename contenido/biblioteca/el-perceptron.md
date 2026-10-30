---
titulo: El perceptrón (Rosenblatt, 1958)
descripcion: El artículo que propuso una máquina que aprende ajustando conexiones, y por qué su límite explica las capas ocultas de cualquier red actual.
creado: 2026-10-29
tags: [biblioteca, fundamentos, redes-neuronales]
relacionados: ["[[glosario/perceptron]]", "[[cursos/la-ia-por-dentro/04-la-neurona-y-la-red]]", "[[biblioteca/backpropagation]]"]
autores: Rosenblatt
anio: 1958
url: https://pubmed.ncbi.nlm.nih.gov/13602029/
tipo: paper
tema: fundamentos
nivel: intermedio
---

Frank Rosenblatt publicó en 1958, en *Psychological Review*, un modelo teórico de cómo un sistema nervioso podría guardar información y usarla para reconocer patrones. Lo llamó perceptrón. Es un artículo de psicología con mucha estadística, escrito antes de que existiera la palabra *deep learning*, y aun así contiene la pieza de la que están hechas las redes que usas hoy a través de una API.

## La idea clave

Rosenblatt arranca con tres preguntas: cómo detecta un organismo la información del mundo, en qué forma la guarda y cómo influye lo guardado en lo que reconoce y hace. Frente a la idea de una memoria «codificada», donde cada recuerdo sería una imagen almacenada en un sitio concreto, defiende la postura conexionista: **la información vive en las conexiones** entre unidades, y aprender consiste en cambiar la fuerza de esas conexiones.

Su perceptrón tiene tres tipos de unidades. Unos puntos sensoriales hacen de retina; unas unidades de asociación reciben conexiones aleatorias desde esa retina; y unas unidades de respuesta deciden qué ha visto el sistema. Cuando el sistema responde, un refuerzo modifica las unidades de asociación que participaron, de modo que estímulos parecidos tiendan a producir la misma respuesta. Las conexiones con la retina no se aprenden: son aleatorias y fijas. El grueso del artículo calcula, con probabilidades, cuánto puede aprender un sistema así y cómo generaliza a estímulos que no ha visto nunca.

La versión que se enseña hoy (una suma ponderada de entradas, un umbral y una regla que corrige los pesos cuando el sistema se equivoca) es una destilación posterior de esta idea. Si buscas esa fórmula en el artículo, la encontrarás con otra notación y rodeada de análisis estadístico.

## Por qué importa hoy

Un [[glosario/llm|LLM]] es, en su nivel más bajo, una cantidad enorme de unidades que calculan sumas ponderadas y las pasan por una [[glosario/funcion-de-activacion|función de activación]]. La intuición de Rosenblatt de que el conocimiento queda repartido en los pesos explica cosas que ves al construir agentes:

- El modelo «sabe» cosas que no puede citar, porque no hay un sitio donde esté guardado cada dato. Por eso, si necesitas fuentes, se las das en el contexto con [[glosario/rag|RAG]] y le pides que cite.
- Actualizar lo que sabe un modelo exige reentrenar sus [[glosario/parametros|parámetros]]. Darle información nueva en el prompt es mucho más barato.
- Lo que importa es cómo generaliza a casos nuevos. Es la misma pregunta que te haces con [[glosario/evals|evals]]: no basta con que acierte los ejemplos que ya conoce.

## Qué leer primero

El artículo es largo y tiene el estilo de su época. Para quedarte con lo esencial:

1. **El planteamiento inicial**, con las tres preguntas y la comparación entre memoria codificada y conexionista. Son las primeras páginas y se leen bien.
2. **La descripción de cómo se organiza un perceptrón**, con su figura de retina, áreas de asociación y respuestas.
3. **La evaluación final**, donde Rosenblatt resume qué puede hacer el modelo y qué no.

Sáltate las derivaciones de probabilidades de los distintos sistemas salvo que te interese la historia de la disciplina. No necesitas seguirlas para entender lo que vino después.

## Qué ha envejecido

- **La biología.** El perceptrón se presenta como modelo del cerebro. Las redes actuales ya no se justifican así: son funciones que se ajustan a datos.
- **El límite de una sola capa ajustable.** Si solo aprende la última capa, el sistema separa las clases con una frontera lineal. No puede aprender algo tan simple como el XOR (verdadero si exactamente una de dos entradas lo es). Para eso hace falta entrenar capas ocultas, y eso llegó con [[biblioteca/backpropagation|backpropagation]].
- **La regla de aprendizaje.** El refuerzo de Rosenblatt no es el [[glosario/descenso-del-gradiente|descenso del gradiente]] con el que se entrena hoy cualquier red.

## Dónde lo ves en MoreContext

- [[cursos/la-ia-por-dentro/04-la-neurona-y-la-red]]: programas un perceptrón en numpy y compruebas por qué falla con el XOR.
- [[cursos/la-ia-por-dentro/01-ia-machine-learning-y-deep-learning]]: el mapa de dónde encaja todo esto.
- [[glosario/perceptron]], [[glosario/red-neuronal]] y [[glosario/funcion-de-activacion]]: las definiciones cortas.
- [[biblioteca/backpropagation]]: el artículo que resolvió cómo entrenar las capas ocultas.
