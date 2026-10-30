---
titulo: "Fase 1 · Redes neuronales por dentro"
descripcion: "La neurona, la red, el descenso del gradiente, backpropagation y el sobreajuste con DotCSV, vistos por encima para entender qué hay debajo de un LLM."
creado: 2026-10-29
revisado: 2026-10-29
orden: 2
minutos: 124
tipo: teoria
profundidad: por-encima
objetivos:
  - Describir qué calcula una neurona artificial y cómo se encadenan en capas.
  - Explicar en cinco pasos cómo aprende una red con una función de pérdida, el gradiente y backpropagation.
  - Reconocer el sobreajuste y relacionarlo con evaluar un agente con los mismos ejemplos que tiene en el prompt.
requiere: ["[[cursos/ruta-en-video/01-fase-0-que-es-la-ia]]"]
relacionados: ["[[cursos/la-ia-por-dentro/04-la-neurona-y-la-red]]", "[[cursos/la-ia-por-dentro/05-como-aprende-una-red]]", "[[blog/2026-10-16-cuanto-saber-de-redes-neuronales]]", "[[glosario/backpropagation]]"]
tags: [ruta-en-video, redes-neuronales, deep-learning]
---

Al terminar esta fase podrás explicar qué hay debajo de un modelo: neuronas, pesos, funciones de activación, una función de pérdida y el algoritmo que ajusta los pesos. Es casi todo terreno de DotCSV, porque los demás canales de la ruta no bajan a este nivel matemático. El objetivo es la intuición, no dominar el álgebra.

## Qué vas a ver

Todos los vídeos son de DotCSV y en español.

| Vídeo | Duración | Profundidad |
|---|---|---|
| [«Regresión Lineal y Mínimos Cuadrados Ordinarios»](https://www.youtube.com/watch?v=k964_uNn3l0) | 9:43 | por encima |
| [«¿Qué es el Descenso del Gradiente? Algoritmo de Inteligencia Artificial»](https://www.youtube.com/watch?v=A6FiCDoz8_4) | 9:24 | por encima |
| [«¿Qué es una Red Neuronal? Parte 1 : La Neurona»](https://www.youtube.com/watch?v=MRIv2IwFTPg) | 9:15 | por encima |
| [«¿Qué es una Red Neuronal? Parte 2 : La Red»](https://www.youtube.com/watch?v=uwbHOpp9xkc) | 11:34 | por encima |
| [«Jugando con Redes Neuronales - Parte 2.5»](https://www.youtube.com/watch?v=FVozZVUNOOA) | 19:48 | por encima |
| [«¿Qué es una Red Neuronal? Parte 3 : Backpropagation»](https://www.youtube.com/watch?v=eNIqz_noix8) | 11:22 | por encima |
| [«¿Qué es una Red Neuronal? Parte 3.5 : Las Matemáticas de Backpropagation»](https://www.youtube.com/watch?v=M5QHwkkHgAA) | 17:21 | extra |
| [«Las Redes Neuronales... ¿Aprenden o Memorizan? - Overfitting y Underfitting - Parte 1»](https://www.youtube.com/watch?v=7-6X3DTt3R8) | 10:18 | por encima |
| [«Cómo identificar el OVERFITTING en tu RED NEURONAL - Parte 2»](https://www.youtube.com/watch?v=ZmLKqZYlYUI) | 12:15 | por encima |
| [Procesamiento del lenguaje natural (NLP), parte 1](https://www.youtube.com/watch?v=Tg1MjMIVArc) | — | por encima |
| [Procesamiento del lenguaje natural (NLP), parte 2](https://www.youtube.com/watch?v=RkYuH_K7Fx4) | — | por encima |
| [Programar una red neuronal en Python](https://www.youtube.com/watch?v=qTNUbPkR2ao) | — | extra |
| [Redes neuronales convolucionales, parte 1](https://www.youtube.com/watch?v=V8j1oENVz00) | — | extra |
| [Redes neuronales convolucionales, parte 2](https://www.youtube.com/watch?v=ysqpl6w6Wzg) | — | extra |
| [Redes generativas antagónicas (GAN)](https://www.youtube.com/watch?v=90QDe6DQXF4) | — | extra |

Títulos entre comillas: los que recoge el autor en sus notas; el resto describe el tema. «—» indica una duración sin confirmar. El tiempo de la lección suma los vídeos que no son extra (94 minutos conocidos más una estimación por lo bajo de 10 minutos por cada vídeo de NLP) y 10 minutos de lectura.

## Lo que importa

El criterio del autor para esta fase es claro: entender cómo funcionan las redes neuronales importa, pero en 2026, salvo que te dediques a crear modelos, es secundario. Si vas a usar agentes o a construirlos sobre LLM que ya existen (los de OpenAI, Anthropic, Google y compañía), míralo **por encima**: sin tomar mil apuntes, con la idea de saber qué ocurre detrás. Si vienes sin matemáticas, no te atasques aquí; puedes pasar a la fase 2 y volver después.

Lo que sí merece la pena quedarse, en cinco ideas:

1. **Una neurona** multiplica cada entrada por un peso, suma, añade un sesgo y pasa el resultado por una [[glosario/funcion-de-activacion|función de activación]]. Es poco más que una regresión lineal con una curva al final; por eso conviene ver primero el vídeo de regresión.
2. **Una red** encadena capas de neuronas. Cada capa transforma lo que recibe y la composición de muchas transformaciones simples consigue representar relaciones complejas. El [[glosario/perceptron|perceptrón]] de una sola capa no puede, por ejemplo, separar el caso XOR; con una capa oculta, sí.
3. **Aprender es minimizar un error.** Una [[glosario/funcion-de-perdida|función de pérdida]] mide cuánto se equivoca la red; el [[glosario/descenso-del-gradiente|descenso del gradiente]] mueve los pesos un paso pequeño en la dirección que más reduce ese error.
4. **[[glosario/backpropagation|Backpropagation]]** calcula ese gradiente para todos los pesos de la red de forma eficiente, aplicando la regla de la cadena desde la salida hacia atrás. Rumelhart, Hinton y Williams la popularizaron en 1986 ([Nature](https://doi.org/10.1038/323533a0)).
5. **[[glosario/sobreajuste|Sobreajuste]]**: una red que memoriza los ejemplos de entrenamiento y falla con datos nuevos. Se detecta separando datos de validación y mirando cómo evolucionan las dos curvas de error.

¿Por qué le sirve esto a quien construye agentes? Por tres conexiones directas. Un LLM es esta misma maquinaria con miles de millones de parámetros, y sus pesos no cambian mientras hablas con él: lo que «aprende» en una conversación vive en el contexto, no en la red. El sobreajuste tiene un primo cercano en los agentes: si evalúas tu prompt con los mismos ejemplos que pusiste dentro, el resultado engaña igual que una red evaluada con sus datos de entrenamiento. Y los vídeos de NLP enlazan con la fase 2: ahí empieza el problema de procesar texto como secuencia.

## Cómo verlo

1. **Cambia el orden de la lista original.** Ve primero regresión lineal y descenso del gradiente, después neurona, red y la parte 2.5, y luego backpropagation. La parte 3 usa el gradiente constantemente; si ya sabes qué es, se entiende a la primera.
2. **La parte 2.5 es para jugar.** DotCSV experimenta con una herramienta visual de redes neuronales; ver cómo cambia la frontera de decisión al añadir neuronas fija la intuición mejor que cualquier fórmula.
3. **Sobreajuste, las dos partes seguidas.** Apunta solo cómo se detecta y qué remedios existen (más datos, regularización, parar antes).
4. **NLP como puente.** Míralos justo antes de la fase 2.
5. **Lo extra, solo si te interesa crear modelos.** La parte 3.5 es el desarrollo matemático de backpropagation; el vídeo de programar una red es código en Python; las convolucionales y las GAN son sobre todo de imagen y quedan lejos de los agentes de texto.

> [!nota] Sin apuntes exhaustivos
> El autor insiste en no tomar mil apuntes en esta fase. Una línea por concepto y un dibujo de la red bastan. El tiempo que ahorres aquí lo vas a necesitar en las fases 5 a 9.

## Practícalo en MoreContext

- [[cursos/la-ia-por-dentro/04-la-neurona-y-la-red]]: un perceptrón escrito en numpy y por qué no resuelve XOR.
- [[cursos/la-ia-por-dentro/05-como-aprende-una-red]]: una red de dos capas que aprende XOR con descenso del gradiente y backpropagation, paso a paso.
- [[cursos/la-ia-por-dentro/06-sobreajuste-y-generalizacion]]: curvas de entrenamiento y validación, y el paralelo con los evals de agentes.
- [[roadmap/80-evals/02-conjunto-de-prueba]]: cómo construir un conjunto de prueba que no se solape con los ejemplos del prompt.
- Glosario de la fase: [[glosario/red-neuronal]], [[glosario/parametros]], [[glosario/funcion-de-perdida]].

## Ejercicio

> [!ejercicio] El bucle de entrenamiento en cinco pasos
> Escribe, sin código, los pasos de un ciclo de entrenamiento de una red: desde que entra un ejemplo hasta que se actualizan los pesos. Después, dibuja dos curvas de error (entrenamiento y validación) a lo largo de las épocas para una red que sobreajusta y marca el punto en el que pararías.
>
> Está bien si aparecen, en orden, la predicción, la pérdida, el gradiente, backpropagation y la actualización de pesos; si la curva de validación empieza a subir mientras la de entrenamiento sigue bajando; y si añades una frase que explique qué sería «sobreajustar» un prompt de agente.

> [!ejercicio]- Pistas
> El paso que más se olvida es la tasa de aprendizaje: el gradiente dice la dirección, la tasa decide el tamaño del paso. Para el prompt, piensa en un conjunto de casos de prueba que copia los ejemplos few-shot.

## Resumen

- Una neurona es una suma ponderada con una activación; una red, muchas capas encadenadas.
- Aprender es reducir una pérdida con el descenso del gradiente; backpropagation calcula el gradiente para todos los pesos.
- El sobreajuste aparece cuando el modelo memoriza; se ve separando datos de validación.
- Si vas a usar modelos y no a crearlos, míralo por encima y en el orden propuesto.

## Para seguir

- [[cursos/ruta-en-video/03-fase-2-de-las-rnn-a-los-transformers]]
- [[cursos/la-ia-por-dentro/index]]
- [[blog/2026-10-16-cuanto-saber-de-redes-neuronales]]
