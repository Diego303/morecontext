---
titulo: Attention Is All You Need (Vaswani et al., 2017)
descripcion: "El paper del Transformer: quitar la recurrencia, quedarse solo con la atención y entrenar en paralelo. Qué leer, qué ha cambiado y qué te afecta al construir agentes."
creado: 2026-10-29
tags: [biblioteca, fundamentos, transformer, atencion]
relacionados: ["[[glosario/transformer]]", "[[glosario/atencion]]", "[[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]", "[[biblioteca/atencion-bahdanau]]"]
autores: Vaswani et al.
anio: 2017
url: https://arxiv.org/abs/1706.03762
tipo: paper
tema: fundamentos
nivel: intermedio
---

En 2017, un grupo de investigadores, la mayoría de Google, propuso una arquitectura de traducción automática sin redes recurrentes ni convoluciones, basada solo en [[glosario/atencion|atención]]. La llamaron [[glosario/transformer|Transformer]]. Casi todos los [[glosario/llm|LLM]] que usas hoy, incluidos los que mueven tus agentes, descienden de ella.

## La idea clave

Las redes recurrentes procesan una secuencia paso a paso: para calcular la posición 100 necesitas haber calculado la 99. Eso impide paralelizar el entrenamiento dentro de cada secuencia. La [[biblioteca/atencion-bahdanau|atención de Bahdanau]] ya permitía consultar cualquier palabra, pero seguía montada sobre una red recurrente. El Transformer quita la recurrencia y deja la atención como pieza central.

Las piezas, en orden:

- **Autoatención con producto escalar escalado.** Cada posición genera una consulta (*query*), una clave (*key*) y un valor (*value*). La relevancia entre dos posiciones es el producto escalar de la consulta de una y la clave de la otra, dividido por la raíz de la dimensión para que el *softmax* no se sature. El resultado es la media de los valores ponderada por esa relevancia.
- **Varias cabezas.** En lugar de una sola atención, el modelo calcula varias en paralelo sobre proyecciones distintas, y cada una puede especializarse en un tipo de relación.
- **Codificación de posición.** Como la atención no sabe de orden, se suma a cada *embedding* una señal que indica su posición (en el paper, funciones seno y coseno).
- **Máscara en el decodificador.** Al generar, cada posición solo puede mirar a las anteriores. Así el modelo predice de izquierda a derecha.
- **Bloques apilados.** Atención, una red *feed-forward* aplicada a cada posición, conexiones residuales y normalización, repetidos varias capas.

La sección 4 argumenta por qué: con autoatención, cualquier par de posiciones queda a un paso de distancia y las operaciones secuenciales por capa son constantes. A cambio, el coste por capa crece con el cuadrado de la longitud de la secuencia. Según el [resumen](https://arxiv.org/abs/1706.03762), el modelo grande logró el mejor resultado de un modelo único en traducción de inglés a francés tras entrenar 3,5 días en ocho GPU, una fracción del coste de los mejores modelos de entonces.

## Por qué importa hoy

No necesitas implementar un Transformer para construir agentes, pero varias decisiones de diseño de tu día a día salen de aquí:

- **Todo el contexto se procesa en cada llamada.** El modelo atiende a todo lo que hay en la [[glosario/ventana-de-contexto|ventana de contexto]]. Por eso cada token de entrada cuesta, y por eso el [[glosario/prompt-caching|prompt caching]] ahorra: reutiliza el procesamiento de un prefijo idéntico.
- **Se genera token a token.** La máscara del decodificador implica que la salida se produce de uno en uno, cada token condicionado por los anteriores. La salida larga es lenta, y el orden de lo que escribes en el prompt influye.
- **Poder mirar todo no garantiza usarlo bien.** La autoatención conecta cualquier par de posiciones, pero [[biblioteca/lost-in-the-middle|Lost in the Middle]] mostró que los modelos aprovechan peor lo que queda en medio. El [[glosario/context-rot|context rot]] es la versión actual del mismo problema.

## Qué leer primero

1. **La figura 1** (la arquitectura) y **la sección 3.2** entera: 3.2.1 (producto escalar escalado), 3.2.2 (varias cabezas) y 3.2.3 (los tres usos de la atención en el modelo). Es el corazón del paper.
2. **La sección 3.5**, sobre codificación de posición.
3. **La sección 4 y su tabla 1**, que comparan coste, operaciones secuenciales y distancia entre posiciones frente a capas recurrentes y convolucionales.
4. **La conclusión**, breve, donde los autores apuntan a otras modalidades y a entradas grandes.

Sáltate la sección 5 (detalles de entrenamiento) y las variantes de la sección 6 salvo que entrenes modelos.

## Qué ha envejecido

- **El codificador-decodificador completo.** El paper es de traducción. Los LLM generativos actuales suelen usar solo la mitad decodificadora.
- **Las piezas concretas.** La codificación de posición sinusoidal, la colocación de la normalización y otras elecciones se han sustituido por variantes. La estructura de bloques de atención y *feed-forward* se mantiene.
- **La escala.** Los modelos del paper son pequeños y trabajan con frases. Hoy los contextos son de cientos de miles de tokens y el coste cuadrático de la atención es una de las restricciones principales de la ingeniería.

## Dónde lo ves en MoreContext

- [[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]: de las RNN a la autoatención, paso a paso.
- [[roadmap/00-fundamentos/01-que-es-un-llm]] y [[roadmap/00-fundamentos/03-ventana-de-contexto]]: lo que implica la arquitectura para quien usa la API.
- [[glosario/transformer]], [[glosario/atencion]], [[glosario/token]] y [[glosario/embeddings]].
- [[biblioteca/gpt-3-few-shot]]: qué pasó al escalar un decodificador de Transformer.
