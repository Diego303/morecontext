---
titulo: La atención en traducción automática (Bahdanau, Cho y Bengio, 2014)
descripcion: "El paper que dejó de comprimir la frase entera en un vector y dejó que el traductor mirase en cada paso las palabras que necesitaba: el origen de la atención."
creado: 2026-10-29
tags: [biblioteca, fundamentos, atencion, secuencias]
relacionados: ["[[glosario/atencion]]", "[[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]", "[[biblioteca/attention-is-all-you-need]]", "[[biblioteca/lstm]]"]
autores: Bahdanau, Cho y Bengio
anio: 2014
url: https://arxiv.org/abs/1409.0473
tipo: paper
tema: fundamentos
nivel: intermedio
---

*Neural Machine Translation by Jointly Learning to Align and Translate* se publicó en arXiv en 2014 y se presentó en ICLR 2015. Ataca un problema concreto de los traductores neuronales de la época y, para resolverlo, introduce el mecanismo que hoy llamamos [[glosario/atencion|atención]]. Tres años después, el [[glosario/transformer|Transformer]] construiría todo un modelo a partir de esa idea.

## La idea clave

Los traductores neuronales de 2014 eran codificador-decodificador: una red recurrente leía la frase de origen y la comprimía en **un único vector de tamaño fijo**; otra red generaba la traducción a partir de ese vector. Los autores sospechan que ese vector es un cuello de botella: da igual que la frase tenga cinco palabras o cincuenta, todo tiene que caber en el mismo espacio.

Su propuesta, que llaman RNNsearch, cambia dos cosas:

1. **El codificador no resume: anota.** Una red recurrente bidireccional lee la frase en los dos sentidos y produce una anotación por cada palabra, que resume esa palabra y su entorno.
2. **El decodificador elige qué mirar en cada paso.** Antes de generar cada palabra de la traducción, una pequeña red puntúa lo relevante que es cada anotación de origen dado lo que lleva traducido. Esas puntuaciones pasan por un *softmax* y se convierten en pesos que suman 1. El contexto para esa palabra es la media ponderada de las anotaciones.

Como todo es diferenciable, el «alineamiento» entre palabras de origen y destino se aprende junto con la traducción, sin etiquetarlo. Los autores lo describen como un mecanismo de atención en el decodificador: ya no hace falta meter toda la frase en un vector, porque el modelo puede volver a consultarla.

### Qué demostró

En traducción de inglés a francés (WMT '14), la tabla 1 del [paper](https://arxiv.org/abs/1409.0473) da 26,75 de BLEU a RNNsearch-50 frente a 17,82 del codificador-decodificador clásico entrenado igual. Con todas las frases, el sistema estadístico de referencia (Moses) seguía por delante (33,30); en las frases sin palabras desconocidas, la versión entrenada más tiempo lo superaba (36,15 frente a 35,63). La diferencia importante está en las frases largas: el modelo clásico se degrada al crecer la longitud, mientras que RNNsearch-50, según los autores, no muestra deterioro «even with sentences of length 50 or more». Las matrices de pesos de alineamiento, además, coinciden con la intuición de un traductor humano.

## Por qué importa hoy

Cada vez que un modelo genera un [[glosario/token|token]], hace a gran escala lo que propone este paper: pondera todo lo que hay en su contexto y decide qué pesa más. De ahí salen dos ideas que usas a diario:

- **Acceso directo frente a resumen.** El paper muestra lo que se pierde al comprimir todo en un estado fijo. Cuando un agente compacta su historial o un subagente devuelve un resumen, eliges compresión y aceptas perder detalle. A veces compensa; conviene saber que es un intercambio.
- **El coste de mirar todo.** Los autores ya advierten que calcular un peso por cada palabra de origen para cada palabra de destino es aceptable en frases de 15 a 40 palabras, pero podría limitar otras aplicaciones. Con contextos de cientos de miles de tokens, ese coste explica por qué la [[glosario/ventana-de-contexto|ventana de contexto]] tiene límite y por qué pagas cada token de entrada.

## Qué leer primero

1. **La sección 1**, donde plantean el cuello de botella del vector fijo.
2. **La sección 3.1**, con el decodificador y las ecuaciones 5 y 6 (pesos y vector de contexto). Es media página y contiene toda la idea.
3. **La sección 5.2**: la figura 3 con las matrices de alineamiento y el apartado sobre frases largas, con ejemplos de traducción.

Sáltate la sección 6 (trabajo relacionado) y los apéndices A y B salvo que vayas a implementarlo.

## Qué ha envejecido

- **Las redes recurrentes.** El Transformer eliminó la recurrencia y se quedó solo con la atención.
- **La forma de puntuar.** Aquí la relevancia la calcula una pequeña red (atención aditiva). El Transformer usa un producto escalar escalado, más rápido en GPU.
- **El vocabulario.** Usan las 30.000 palabras más frecuentes por idioma y todo lo demás se convierte en «desconocido». Los propios autores señalan las palabras raras como el reto pendiente. Hoy los [[glosario/tokenizador|tokenizadores]] de subpalabras lo resuelven.

## Dónde lo ves en MoreContext

- [[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]: la atención explicada desde cero, después de las RNN y la LSTM.
- [[glosario/atencion]] y [[glosario/embeddings]].
- [[biblioteca/attention-is-all-you-need]]: lo que pasó cuando la atención se quedó sola.
- [[cursos/context-engineering/01-el-contexto-como-presupuesto]]: por qué mirar todo el contexto tiene un precio.
