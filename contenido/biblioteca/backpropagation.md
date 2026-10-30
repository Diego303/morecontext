---
titulo: Aprender representaciones con backpropagation (Rumelhart, Hinton y Williams, 1986)
descripcion: La carta de cuatro páginas en Nature que mostró que una red con capas ocultas aprende sola representaciones útiles si propagas el error hacia atrás.
creado: 2026-10-29
tags: [biblioteca, fundamentos, redes-neuronales, entrenamiento]
relacionados: ["[[glosario/backpropagation]]", "[[cursos/la-ia-por-dentro/05-como-aprende-una-red]]", "[[biblioteca/el-perceptron]]", "[[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]"]
autores: Rumelhart, Hinton y Williams
anio: 1986
url: https://doi.org/10.1038/323533a0
tipo: paper
tema: fundamentos
nivel: intermedio
---

*Learning representations by back-propagating errors* es una carta breve publicada en *Nature* en 1986. Describe un procedimiento para entrenar redes de unidades parecidas a neuronas con capas intermedias, y muestra con ejemplos pequeños que esas capas acaban representando rasgos del problema que nadie les ha programado. Es el puente entre el [[biblioteca/el-perceptron|perceptrón]] y el entrenamiento de cualquier modelo actual.

## La idea clave

Defines una medida del error: la diferencia entre la salida que da la red y la que debería dar. Luego ajustas cada peso un poco en la dirección que más reduce ese error. El problema era saber cuánto contribuye al error un peso de una capa oculta, que no toca directamente la salida. La respuesta es la regla de la cadena: calculas el error en la salida y lo **propagas hacia atrás**, capa a capa, obteniendo la derivada del error respecto a cada peso. Con esas derivadas haces [[glosario/descenso-del-gradiente|descenso del gradiente]].

El método tiene dos pasadas. En la pasada hacia delante, cada unidad suma sus entradas ponderadas y aplica una función sigmoide. En la pasada hacia atrás, el error viaja en sentido contrario y cada peso recibe su parte de culpa. El artículo añade un término de inercia (*momentum*) que reutiliza parte del cambio anterior para acelerar el aprendizaje.

Lo que hace memorable la carta es el resultado, más que el cálculo. Las unidades ocultas, que no son ni entrada ni salida, **aprenden a representar rasgos importantes del dominio**. En el ejemplo de los árboles genealógicos (dos familias con la misma estructura, una inglesa y otra italiana), la red aprende sin que nadie se lo diga a codificar cosas como la generación o la rama de la familia. Esa capacidad de crear rasgos nuevos es lo que los autores señalan como diferencia frente a métodos anteriores como el del perceptrón.

## Por qué importa hoy

Todo [[glosario/llm|LLM]] se entrena con este principio. En el [[glosario/preentrenamiento|preentrenamiento]] la [[glosario/funcion-de-perdida|función de pérdida]] mide lo bien que el modelo predice el siguiente token, y backpropagation calcula cómo cambiar miles de millones de pesos para mejorarla. El [[glosario/fine-tuning|fine-tuning]] es lo mismo con tus datos.

Dos consecuencias prácticas para quien construye agentes:

- **Las representaciones internas son la razón de que funcionen los [[glosario/embeddings|embeddings]].** Un modelo entrenado así coloca textos con significado parecido en vectores cercanos, y eso es lo que aprovechas cuando buscas en un RAG.
- **El modelo aprende lo que minimiza la pérdida en sus datos.** Si la pérdida premia el texto plausible, obtienes texto plausible, que no siempre es verdadero. De ahí salen las [[glosario/alucinacion|alucinaciones]] y la necesidad de verificar.

## Qué leer primero

Son cuatro páginas: léelas enteras. Si vas con poco tiempo, céntrate en esto:

1. **El primer bloque de ecuaciones**, con la pasada hacia delante, la medida de error y las derivadas que viajan hacia atrás. Léelo después de [[cursos/la-ia-por-dentro/05-como-aprende-una-red]] y lo reconocerás todo.
2. **La figura de los árboles genealógicos** y la interpretación de lo que aprende cada unidad oculta.
3. **Los párrafos finales**, donde los autores discuten los mínimos locales y reconocen que el procedimiento no es un modelo plausible de cómo aprende el cerebro.

El ejemplo de detección de simetría es más corto y se puede ojear.

## Qué ha envejecido

- **La historia de la «invención».** La idea de calcular derivadas hacia atrás tenía antecedentes. El mérito de este artículo fue mostrar que sirve para aprender representaciones internas y darlo a conocer.
- **Las piezas.** Hoy se usan otras funciones de activación, otras funciones de pérdida para clasificar y predecir tokens, y optimizadores adaptativos en lugar del descenso con inercia del artículo. El principio de propagar el error no ha cambiado.
- **La escala.** Las redes del artículo tienen unas decenas de unidades y aprenden de un puñado de ejemplos. Hoy el mismo cálculo se reparte entre muchas GPU para ajustar miles de millones de pesos con cantidades enormes de texto.
- **El cálculo a mano.** Hoy nadie deriva estas fórmulas: las bibliotecas de diferenciación automática las calculan solas.

## Dónde lo ves en MoreContext

- [[cursos/la-ia-por-dentro/05-como-aprende-una-red]]: pérdida, gradiente y una red de dos capas que aprende el XOR en numpy.
- [[cursos/la-ia-por-dentro/06-sobreajuste-y-generalizacion]]: lo que pasa cuando la red aprende demasiado bien sus datos.
- [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]: el mismo mecanismo a escala de LLM.
- [[glosario/backpropagation]], [[glosario/descenso-del-gradiente]] y [[glosario/funcion-de-perdida]].
