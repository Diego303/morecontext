---
titulo: La IA por dentro
descripcion: Qué hay debajo de un LLM, del machine learning a la neurona y al Transformer, con intuición y numpy, para quien va a usar modelos y no a entrenarlos.
creado: 2026-10-29
orden: 9
nivel: inicial
horas: 4
objetivo: Entender con intuición cómo aprende una red neuronal y cómo funciona la atención del Transformer, para tomar mejores decisiones al usar LLM y construir agentes con ellos.
requiere: []
relacionados: ["[[cursos/ruta-en-video/index]]", "[[roadmap/00-fundamentos/01-que-es-un-llm]]", "[[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]", "[[blog/2026-10-16-cuanto-saber-de-redes-neuronales]]"]
tags: [fundamentos, machine-learning, redes-neuronales]
---

Un [[glosario/llm|LLM]] es una [[glosario/red-neuronal|red neuronal]] muy grande que ha aprendido a predecir el siguiente [[glosario/token|token]]. Este curso abre esa caja por orden: qué significa aprender de datos, cómo funciona una neurona, cómo se ajustan millones de parámetros con el [[glosario/descenso-del-gradiente|descenso del gradiente]] y la [[glosario/backpropagation|backpropagation]], por qué un modelo puede memorizar en lugar de generalizar y cómo la [[glosario/atencion|atención]] del [[glosario/transformer|Transformer]] llevó a los LLM que usas hoy.

Cada lección explica primero la intuición y después la enseña con un script pequeño de numpy que puedes ejecutar en tu portátil, sin GPU ni librerías de deep learning. Las fórmulas son pocas y aparecen solo cuando aclaran algo.

## Por qué es opcional

El autor lo plantea así en su ruta de aprendizaje: si vas a usar modelos ya entrenados y a construir agentes con ellos, esta parte se mira por encima, sin tomar mil apuntes. Para llamar a una API no necesitas derivadas ni álgebra lineal.

Aun así, saber qué hay debajo te da criterio. Entiendes por qué un modelo alucina con total seguridad, por qué no recuerda nada entre llamadas, por qué evaluar con los mismos ejemplos que pusiste en el prompt te engaña y por qué el contexto largo cuesta lo que cuesta. Todo eso pesa en decisiones que tomas cada semana cuando construyes con LLM.

Si tu objetivo es entrenar modelos, este curso es solo la puerta. Como ampliación, el autor recomienda el [Machine Learning Crash Course de Google](https://developers.google.com/machine-learning/crash-course?hl=es-419), que va mucho más a fondo.

## Para quién

Para desarrolladores que ya usan LLM, o empiezan con ellos, y quieren entender el mecanismo sin dedicarse a la investigación. También para quien ha visto los vídeos de las fases 0 a 2 de la ruta en vídeo y quiere fijarlos con código propio.

## Requisitos

Ninguno obligatorio. Ayuda saber Python básico y tener numpy instalado (`pip install numpy`). Las matemáticas no pasan de multiplicar, sumar y la idea de pendiente. Si quieres contexto previo, lee [[roadmap/00-fundamentos/01-que-es-un-llm]].

## Temario

1. [[cursos/la-ia-por-dentro/01-ia-machine-learning-y-deep-learning]]. Qué contiene a qué, programar reglas frente a aprender de datos, qué es un modelo y por qué el deep learning despegó cuando lo hizo.
2. [[cursos/la-ia-por-dentro/02-aprendizaje-supervisado-y-no-supervisado]]. De dónde sale la señal que guía al modelo: etiquetas, estructura o recompensa, y por qué el preentrenamiento de un LLM es autosupervisado.
3. [[cursos/la-ia-por-dentro/03-de-las-reglas-a-las-probabilidades]]. Por qué se modela con probabilidades, cómo genera texto un LLM y por qué la respuesta más probable no siempre es la correcta.
4. [[cursos/la-ia-por-dentro/04-la-neurona-y-la-red]]. Pesos, sesgo y activación; el perceptrón y su límite con XOR; capas ocultas y la regresión lineal como caso más simple.
5. [[cursos/la-ia-por-dentro/05-como-aprende-una-red]]. Función de pérdida, descenso del gradiente y backpropagation, con una red que aprende XOR.
6. [[cursos/la-ia-por-dentro/06-sobreajuste-y-generalizacion]]. Memorizar frente a generalizar, entrenamiento, validación y test, y el paralelo con los evals de un agente.
7. [[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]. Embeddings, RNN y LSTM, la atención y el Transformer, y el camino hasta los LLM actuales.

## Qué construyes

Una colección de scripts cortos, ninguno de más de 40 líneas, todos ejecutados y con su salida real en la lección:

- una regla aprendida de datos ruidosos y un modelo de lenguaje de juguete que cuenta palabras;
- un perceptrón que aprende AND y OR y no consigue aprender XOR;
- una red de dos capas que aprende XOR con backpropagation escrita a mano;
- el descenso del gradiente de una regresión lineal con tres tasas de aprendizaje;
- una curva de sobreajuste con polinomios y su arreglo con regularización;
- la atención de producto escalar con softmax y máscara causal sobre tres vectores.

## Cómo encaja con el resto

Este curso es la versión escrita, con código propio, de las fases 0, 1 y 2 de la [[cursos/ruta-en-video/index|ruta en vídeo]]. Al terminarlo, sigue con [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]] y con el resto del [[roadmap/00-fundamentos/index|nivel de fundamentos]], donde dejas la teoría y haces tu primera llamada a un modelo.

> [!consejo] Cómo aprovecharlo
> Ejecuta cada script y cambia un número antes de leer la explicación. Romper el ejemplo a propósito enseña más que leerlo dos veces.
