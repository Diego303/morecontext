---
titulo: Cuánto necesitas saber de redes neuronales para construir agentes
descripcion: Qué merece la pena entender de redes neuronales, entrenamiento y Transformers si usas modelos ya entrenados para construir agentes, y qué puedes ver por encima.
creado: 2026-10-16
estado: revision
tipo: ensayo
destacado: false
tags: [fundamentos, redes-neuronales, aprendizaje]
relacionados: ["[[cursos/la-ia-por-dentro/index]]", "[[cursos/ruta-en-video/02-fase-1-redes-neuronales]]", "[[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]", "[[glosario/red-neuronal]]"]
---

Es una pregunta que sale mucho, sobre todo entre desarrolladores que quieren empezar con agentes y abren un vídeo de backpropagation lleno de derivadas: ¿necesito entender esto? Mi respuesta corta es que necesitas la intuición y no la matemática, salvo que vayas a crear modelos. La larga es esta entrada.

## El orden de las cosas

Las fases 0 a 2 de mi ruta cuentan cómo hemos llegado hasta aquí. Primero el mapa: la IA contiene al [[glosario/aprendizaje-automatico|machine learning]], y este al [[glosario/aprendizaje-profundo|deep learning]]. Se trabajaba con modelos de IA mucho antes del boom de ChatGPT. Se fueron creando arquitecturas, que son los cimientos o formas de construir esos modelos, y de una de ellas, el [[glosario/transformer|Transformer]], salieron los LLM.

Por debajo de todo hay [[glosario/red-neuronal|redes neuronales]]: neuronas, pesos, [[glosario/funcion-de-activacion|funciones de activación]], una [[glosario/funcion-de-perdida|función de pérdida]] que mide cuánto se equivoca la red, el [[glosario/descenso-del-gradiente|descenso del gradiente]] para corregirla y [[glosario/backpropagation|backpropagation]] para repartir esa corrección entre las capas. Un LLM es, en el fondo, una red neuronal muy grande.

La fase 2 es el salto: de redes dedicadas a una sola tarea a modelos con arquitecturas más complejas, de ahí a los LLM, después al chat y ahora a las herramientas de agentes.

## Mi criterio

Si te dedicas a usar agentes o a construirlos con los LLMs que ya ha creado el mercado (los de OpenAI, los de Anthropic y compañía), las fases 1 y 2 son secundarias. Míralas por encima. Para mí eso significa verlas sin tomar mil apuntes, quedándote con la idea de cómo funciona todo por detrás. Mucho de lo que hay ahí es más matemáticas y algoritmia que otra cosa.

Si vas a dedicarte a crear modelos, el criterio cambia por completo. Ahí la matemática es tu trabajo y merece la pena ir a fondo, con los vídeos de DotCSV y los cursos de machine learning de Google, que piden Python y TensorFlow.

La prueba que uso para decidir es una pregunta: **¿esto cambia alguna decisión que vaya a tomar al construir un agente?** Si la respuesta es no, es cultura general. Está bien tenerla, pero por encima.

## Lo que sí merece la pena entender

Hay cuatro ideas de esas fases que uso a menudo, aunque no escriba ni una derivada. Las cuatro pasan la prueba de la pregunta: cada una cambia alguna decisión práctica.

**1. Un modelo aprende ajustando parámetros para predecir.** El entrenamiento es un bucle: el modelo predice, se compara la predicción con lo que debería salir, se calcula el error y se ajustan los [[glosario/parametros|parámetros]]. Repetido una cantidad enorme de veces. De aquí salen tres consecuencias prácticas. El modelo es probabilístico, y eso explica que delire ([[blog/2026-10-15-la-respuesta-mas-probable]]). Su conocimiento se queda fijo cuando termina el entrenamiento. Y lo que le cuentas en el prompt no cambia sus parámetros: el contexto es información disponible ahora, que desaparece en cuanto sale de la [[glosario/ventana-de-contexto|ventana de contexto]].

**2. La diferencia entre memorizar y generalizar.** El [[glosario/sobreajuste|sobreajuste]] es cuando una red se aprende de memoria los ejemplos de entrenamiento y falla con los nuevos. La misma trampa aparece al evaluar un agente: si tus casos de prueba son los mismos ejemplos que pusiste en el prompt, lo que mides es si repite lo que ya vio. Por eso conviene separar siempre los ejemplos del prompt del [[glosario/conjunto-de-evaluacion|conjunto de evaluación]], y desconfiar de un resultado perfecto con los mismos casos con los que ajustaste el prompt.

**3. Por qué el Transformer cambió las reglas.** La [[glosario/atencion|atención]] permite que cada token tenga en cuenta a los tokens que lo preceden en el contexto, y el cálculo se puede paralelizar. Es la idea de *Attention Is All You Need* (Vaswani et al., 2017). No necesitas las fórmulas. Sí te conviene la intuición: el modelo tiene en cuenta todo lo que hay en su ventana, y lo que metes ahí compite por su atención. De esa intuición sale buena parte de la [[disciplinas/context-engineering|ingeniería de contexto]], y con ella la costumbre de no meterlo todo «por si acaso».

**4. Qué cuesta entrenar.** Saber que entrenar es ajustar parámetros con muchos datos y mucho cómputo te da criterio cuando alguien propone hacer [[glosario/fine-tuning|fine-tuning]] para que el modelo «sepa» cosas de su empresa. Sin entender qué es entrenar, el fine-tuning parece la forma natural de «enseñar» algo al modelo, pero casi siempre es más barato y sencillo darle esos documentos con [[glosario/rag|RAG]]. Lo resumo con la pirámide de [[cursos/ia-en-la-empresa/02-la-piramide-de-personalizacion]]: el prompting cambia las instrucciones, RAG aporta conocimiento y el fine-tuning adapta el comportamiento.

## Lo que puedes ver por encima

- **La matemática de backpropagation a mano.** Entender que el error se propaga hacia atrás capa a capa es suficiente.
- **Programar una red neuronal desde cero.** Es un ejercicio muy bonito para entenderla, pero no lo necesitas para construir agentes.
- **Las redes convolucionales y las GAN.** Explican de dónde vienen los modelos de imagen. Si no trabajas con imagen, por encima.
- **Los modelos de difusión.** Son el otro gran salto, en paralelo a los LLM, y en mi ruta están marcados como secundarios.
- **El álgebra lineal.** Si vienes sin matemáticas, no te obsesiones: el objetivo es intuición. Puedes avanzar y volver luego.

Hay un beneficio más. Entender esta evolución da criterio para leer noticias de IA sin que te vendan humo. Cuando sabes que un LLM es una red entrenada para predecir el siguiente token, muchos titulares se leen de otra manera.

## Para seguir

- [[cursos/la-ia-por-dentro/index]]: el curso donde explico estas ideas con calma, de la neurona a la atención.
- [[cursos/ruta-en-video/02-fase-1-redes-neuronales]] y [[cursos/ruta-en-video/03-fase-2-de-las-rnn-a-los-transformers]]: los vídeos, con su marca de profundidad.
- [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]: lo justo del entrenamiento para usar bien un LLM.
- [[modelos/10-prompting-rag-o-fine-tuning]]: cómo decidir entre prompting, RAG y fine-tuning.

*Borrador inicial: pendiente de reescribir con la voz del autor.*
