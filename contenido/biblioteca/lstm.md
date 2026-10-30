---
titulo: Long Short-Term Memory (Hochreiter y Schmidhuber, 1997)
descripcion: Por qué las redes recurrentes olvidaban lo lejano, cómo la LSTM lo resolvió con una celda de memoria y puertas, y qué queda de esa idea en los agentes.
creado: 2026-10-29
tags: [biblioteca, fundamentos, redes-neuronales, secuencias]
relacionados: ["[[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]", "[[biblioteca/atencion-bahdanau]]", "[[biblioteca/backpropagation]]"]
autores: Hochreiter y Schmidhuber
anio: 1997
url: https://doi.org/10.1162/neco.1997.9.8.1735
tipo: paper
tema: fundamentos
nivel: intermedio
---

Una red recurrente procesa una secuencia elemento a elemento y arrastra un estado interno de un paso al siguiente. En teoría puede recordar lo que vio hace mucho; en la práctica, entrenada con [[glosario/backpropagation|backpropagation]], olvidaba casi todo lo que quedaba a más de unos pocos pasos. Este artículo de *Neural Computation* explica por qué pasa y propone una arquitectura, la LSTM, que acabó siendo la red recurrente de referencia hasta la llegada del Transformer.

## La idea clave

El diagnóstico va primero. Cuando propagas el error hacia atrás a lo largo del tiempo, en cada paso se multiplica por factores que dependen de los pesos y de las activaciones. Si esos factores son pequeños, la señal de error **se desvanece de forma exponencial**; si son grandes, explota. En ambos casos la red no aprende relaciones entre cosas separadas por muchos pasos.

La solución es una unidad especial con un camino por el que el error fluye sin decaer. Los autores la llaman «carrusel de error constante»: una celda de memoria que se conecta consigo misma con peso fijo, de modo que lo que guarda se conserva paso a paso. Una celda que lo guarda todo sería inútil, así que añaden **puertas multiplicativas** que aprenden cuándo dejar entrar información nueva (puerta de entrada) y cuándo dejar que lo guardado influya en la salida (puerta de salida).

Según el [resumen del artículo](https://doi.org/10.1162/neco.1997.9.8.1735), así la red aprende a salvar intervalos de más de 1.000 pasos, con un coste por paso y por peso constante. Los experimentos son tareas artificiales diseñadas para exigir memoria a largo plazo, como sumar dos valores marcados dentro de una secuencia larga, y la comparan con los algoritmos recurrentes de la época.

## Por qué importa hoy

Los LLM actuales no usan LSTM: usan el [[glosario/transformer|Transformer]]. Pero el problema que ataca este artículo sigue ahí, con otra forma.

Una LSTM **resume todo el pasado en un estado de tamaño fijo** y decide con sus puertas qué escribe y qué lee. Un Transformer hace lo contrario: guarda todos los [[glosario/token|tokens]] en la [[glosario/ventana-de-contexto|ventana de contexto]] y, en cada paso, mira a cualquiera de ellos con [[glosario/atencion|atención]]. Ganas acceso directo a todo, y pagas con un contexto que tiene límite y cuesta dinero en cada llamada.

Cuando un agente trabaja horas y el contexto se llena, vuelves a la pregunta de la LSTM: qué guardo, qué resumo y qué tiro. La [[glosario/compactacion|compactación]], las notas en disco y la [[glosario/memoria|memoria]] entre sesiones son puertas de escritura y lectura que decides tú en el harness en lugar de aprenderlas la red. La analogía no es exacta, pero ayuda a ver que olvidar bien es una decisión de diseño.

## Qué leer primero

1. **La sección 3**, sobre el error que decae. Es el argumento central y explica por qué fallaban las redes recurrentes. Con entender la idea basta; no hace falta seguir cada desigualdad.
2. **La sección 4**, con la celda de memoria, las dos puertas y la figura de la arquitectura.
3. **La introducción de la sección 5**, que resume qué pone a prueba cada experimento. Elige uno (el problema de la suma es el más claro) y léelo entero.
4. **La discusión**, donde los autores enumeran limitaciones y ventajas.

Sáltate el apéndice con el algoritmo detallado salvo que vayas a implementarlo.

## Qué ha envejecido

- **Falta la puerta de olvido.** La LSTM que se enseña hoy tiene una tercera puerta para vaciar la celda. Llegó en trabajos posteriores; en el artículo original la celda solo puede acumular.
- **El procesamiento secuencial.** Cada paso depende del anterior, así que no puedes procesar una secuencia larga en paralelo. Esa fue una de las razones para pasar al Transformer ([[biblioteca/attention-is-all-you-need]]).
- **Los experimentos.** Son secuencias sintéticas, no lenguaje real. Las aplicaciones en traducción y voz llegaron años después.

## Dónde lo ves en MoreContext

- [[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]: el recorrido de las RNN y la LSTM hasta la atención.
- [[biblioteca/atencion-bahdanau]]: el siguiente paso, que deja de depender de un único vector.
- [[cursos/context-engineering/03-compactacion-y-memoria]] y [[cursos/context-engineering/04-contexto-para-agentes-largos]]: qué guardar y qué olvidar cuando el estado es el contexto de un agente.
- [[glosario/red-neuronal]] y [[glosario/memoria]].
