---
titulo: La respuesta más probable no es la respuesta correcta
descripcion: Por qué un LLM devuelve la continuación más probable según su contexto y su entrenamiento, qué es que un modelo delire y qué cambia eso cuando construyes agentes.
creado: 2026-10-15
estado: revision
tipo: ensayo
destacado: false
tags: [llm, alucinaciones, agentes, verificacion]
relacionados: ["[[roadmap/00-fundamentos/01-que-es-un-llm]]", "[[glosario/alucinacion]]", "[[cursos/ruta-en-video/04-fase-3-llms-tokens-y-contexto]]", "[[disciplinas/verificar-antes-de-dar-por-hecho]]"]
---

Si tuviera que quedarme con una sola idea de todo lo que he aprendido sobre IA, sería esta: un [[glosario/llm|LLM]] te da la respuesta más probable, y la más probable puede coincidir con la correcta o no. La escribí en las notas de la fase 3 de mi ruta y la repetí en la de agentes, porque es lo primero que se olvida cuando las respuestas empiezan a ser buenas.

## Token a token

Un LLM genera texto un [[glosario/token|token]] detrás de otro. Recibe todo el contexto (tus instrucciones, la conversación, los documentos, los resultados de herramientas), calcula qué token debería venir a continuación, lo añade y vuelve a empezar. Así hasta completar la respuesta.

En cada paso lo que sale es una distribución de probabilidad sobre los tokens posibles. Para «El perro corre por el», el modelo podría repartirla más o menos así:

```text
# salida de ejemplo (probabilidades ilustrativas)
parque  → 0.42
campo   → 0.21
jardín  → 0.12
bosque  → 0.08
...
```

Después se elige un token según cómo esté configurada la generación. Esa distribución sale de los [[glosario/parametros|parámetros]] del modelo, ajustados durante el entrenamiento para predecir bien el siguiente token en cantidades enormes de texto. El modelo no consulta ninguna base de datos de respuestas correctas. Lo cuento con más calma en [[roadmap/00-fundamentos/01-que-es-un-llm]] y en [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]].

De ahí sale todo lo demás. La respuesta es la continuación más probable **dada esa entrada y ese entrenamiento**. Cambia la entrada y cambia la respuesta. Si al modelo le falta un dato, la continuación más probable no lo va a incluir; va a rellenar el hueco con lo que suele ir ahí.

## Delirar

Los modelos que usamos hoy están entrenados con muchísima información y son la vanguardia de lo que hay, así que casi nunca fallan en lo simple. Pero deliran. Llamo delirar a cuando te dan algo regular o directamente incorrecto, con el mismo tono seguro con el que aciertan. En la industria se le llama [[glosario/alucinacion|alucinación]].

Delirar es una consecuencia natural del mecanismo, y por eso conviene esperarlo en vez de sorprenderse. Lo veo sobre todo en tres situaciones:

- **Le falta información.** Le preguntas por un procedimiento interno de tu empresa o por una librería propia. No lo sabe, pero conoce de sobra la forma que tiene una respuesta sobre ese tema, y la produce.
- **La pregunta es ambigua.** Lo más probable es la interpretación más común, que quizá no es la que tú tenías en la cabeza.
- **El contexto está lleno de ruido.** Si el dato correcto está enterrado entre veinte documentos que no vienen al caso, pesa menos de lo que debería. Es el efecto [[glosario/lost-in-the-middle|lost in the middle]].

Las tres se arreglan cambiando lo que entra. Por eso insisto en que **el contexto mueve la probabilidad**. Dale los documentos correctos con [[glosario/rag|RAG]], instrucciones precisas y ejemplos, quita lo que sobra, y la respuesta más probable se acerca a la correcta. En RAG lo resumo con una regla: si la recuperación falla, cambiar a un modelo más grande no arregla nada. Al modelo le llega información equivocada y la respuesta sale mal.

## Por qué importa más en un agente

En un chat, si el modelo delira, lo lees y lo descartas. Tú eres el filtro. En un [[glosario/agente|agente]] ese filtro desaparece en muchos pasos.

Un agente usa un LLM para razonar y decidir qué hacer en cada vuelta del [[glosario/bucle-agentico|bucle agéntico]]: qué herramienta llamar, con qué argumentos y cuándo ha terminado. Cada una de esas decisiones también es la continuación más probable. Si en el paso tres concluye que un archivo no existe porque lo buscó mal, los pasos cuatro a diez se construyen sobre ese error. Y la decisión más delicada de todas, «ya está hecho», también es una predicción.

Lo vi claro al construir mi harness. Entre los problemas que tenía que resolver anoté uno que aparece una y otra vez: la tendencia del modelo a declarar éxito sin evidencia. Produce PASS falsos y, a veces, tests debilitados para que pasen. No hace falta suponer mala intención: después de mucho trabajo, «terminado» es una continuación muy probable.

## Lo que hago al respecto

No intento convencer al modelo de que no se equivoque. Diseño el sistema contando con que a veces se equivocará:

1. **Le doy el contexto que no tiene.** Lo interno de una empresa o lo tuyo propio, un LLM general no lo sabe. Se lo das en la entrada o se lo trae un sistema de recuperación.
2. **Le pido salidas comprobables.** Respuestas con citas que se pueden verificar ([[roadmap/30-contexto-y-rag/05-respuestas-con-citas]]), JSON que cumple un esquema ([[glosario/salida-estructurada|salida estructurada]]), un diff concreto en vez de una explicación.
3. **Compruebo con código lo que se puede comprobar con código.** En mi harness hay un principio que manda sobre los demás: IA en lo semántico, código en los bordes. El modelo decide qué evento aplicar; el código decide si es legal. «Hecho» solo cuenta con un comando ejecutado después del último cambio, y el agente revisor ejecuta la [[glosario/aceptacion-ejecutable|aceptación ejecutable]] él mismo, sin reutilizar la del agente que construyó.
4. **Reservo al humano lo que no se puede comprobar con código.** Qué se construye, si la especificación tiene sentido, si un riesgo merece la pena.

Nada de esto le quita valor a los modelos. Hacen bien muchísimas cosas, y por eso los uso a diario. Pero conviene recordar de dónde salen sus respuestas: de matemáticas, y la respuesta más probable es lo mejor que esas matemáticas saben dar. Tenerlo presente es lo que te permite construir encima con criterio.

## Para seguir

- [[cursos/ruta-en-video/04-fase-3-llms-tokens-y-contexto]]: la fase de la ruta donde nace esta idea.
- [[cursos/la-ia-por-dentro/03-de-las-reglas-a-las-probabilidades]]: por qué la IA moderna trabaja con probabilidades en lugar de reglas.
- [[disciplinas/verificar-antes-de-dar-por-hecho]]: la forma de trabajar que sale de aquí.
- [[roadmap/70-flujos-con-especificacion/04-aceptacion-ejecutable]]: cómo convertir «hecho» en un comando.

*Borrador inicial: pendiente de reescribir con la voz del autor.*
