---
titulo: El contexto es un presupuesto, no un cajón
descripcion: Por qué conviene tratar la ventana de contexto como un recurso escaso que se reparte con criterio y no como un sitio donde meterlo todo por si acaso.
creado: 2026-09-28
estado: revision
tipo: ensayo
tags: [contexto, context-engineering]
relacionados: ["[[disciplinas/context-engineering]]", "[[cursos/context-engineering/01-el-contexto-como-presupuesto]]", "[[modelos/02-ingenieria-de-contexto]]", "[[glosario/ventana-de-contexto]]"]
---

Hay una forma de trabajar con modelos que llamo «el cajón». Tienes una [[glosario/ventana-de-contexto|ventana de contexto]] grande, así que metes el prompt de sistema completo, todas las herramientas, el historial entero, los diez documentos que devolvió la búsqueda y un par de ejemplos más por si acaso. Cabe. Y si cabe, ¿por qué no?

Mi respuesta es que cada token que entra compite con los demás por la atención del modelo, cuesta dinero y añade [[glosario/latencia|latencia]]. La ventana es un presupuesto. Y como cualquier presupuesto, lo que importa es en qué lo gastas.

## Tres costes que no se ven en el prompt

**El coste en dinero.** Pagas por [[glosario/token|tokens]] de entrada en cada llamada. En un agente, cada vuelta del bucle reenvía todo lo anterior. Un documento de más en el primer paso se paga en todos los siguientes. El [[glosario/prompt-caching|prompt caching]] reduce mucho este coste cuando el prefijo es estable, pero no lo elimina, y deja de funcionar en cuanto algo cambia al principio.

**El coste en atención.** Liu et al. mostraron en *Lost in the Middle* (2023) que los modelos aprovechan peor la información situada en mitad de contextos largos. Los modelos han cambiado desde entonces, pero la intuición sigue siendo útil: si el dato importante está rodeado de ruido, tienes más papeletas de que se pierda. Meter más no garantiza que el modelo use lo que necesita.

**El coste en claridad.** Un contexto lleno de instrucciones parciales, ejemplos que no aplican y herramientas que no vienen al caso obliga al modelo a decidir qué ignorar. Esa decisión la tomaría mejor tú, antes de la llamada.

## Pensar como quien reparte un presupuesto

Anthropic lo plantea en *Effective context engineering for AI agents* (2025): el objetivo es encontrar el conjunto más pequeño de tokens con mucha señal que maximice la probabilidad del resultado que buscas. Me parece una buena definición de la [[disciplinas/context-engineering|ingeniería de contexto]], y tiene consecuencias prácticas.

La primera es que cada bloque del contexto tiene que justificar su sitio. Antes de añadir algo, me pregunto qué decisión del modelo cambia si lo quito. Si la respuesta es «ninguna», sobra.

La segunda es que el orden importa. Documentos largos arriba, instrucciones y pregunta al final, cosas estables antes que variables. Lo explicamos en [[modelos/02-ingenieria-de-contexto]] y en [[modelos/07-documentos-largos]]. Ese orden además es el que permite que la caché funcione.

La tercera es que hay que repartir entre tipos de contenido. Un agente tiene al menos cinco consumidores de presupuesto:

- El [[glosario/prompt-de-sistema|prompt de sistema]]: rol, reglas, formato.
- Las definiciones de herramientas: cada herramienta cuesta tokens aunque no se use.
- El conocimiento recuperado con [[glosario/rag|RAG]] o leído de archivos.
- El historial de la conversación y los [[glosario/tool-result|resultados de herramientas]].
- El espacio de salida, incluido el razonamiento, que limitas con [[glosario/max-tokens|max_tokens]].

Si uno de ellos crece sin control, se come a los demás. El caso más habitual es el historial de un agente: resultados de herramientas enormes que nadie vuelve a leer y que viajan en cada llamada.

## Herramientas para gastar menos

No hace falta inventar nada. Las técnicas existen y son conocidas:

- **Recuperar en vez de pegar.** Trae los fragmentos relevantes con [[glosario/busqueda-hibrida|búsqueda híbrida]] y [[glosario/reranking|reranking]] en lugar del documento entero. Lo argumentamos en el radar [[radar/2026-09-22-contexto-largo-no-sustituye-recuperacion]].
- **Resultados de herramienta cortos.** Una herramienta bien diseñada devuelve lo que el modelo necesita, no la respuesta cruda de la API. Lo cuenta *Writing effective tools for agents* y lo recogemos en [[disciplinas/diseno-de-herramientas]].
- **Compactar.** Cuando el historial crece, resúmelo y sustituye lo viejo por el resumen. Es la [[glosario/compactacion|compactación]].
- **Memoria externa.** Lo que el agente necesita recordar pero no consultar en cada paso puede vivir fuera, en un archivo o una base de datos ([[glosario/memoria|memoria]]).
- **Delegar.** Un [[glosario/subagente|subagente]] con su propia ventana puede leer mucho y devolver poco.

## Lo que no estoy diciendo

No defiendo los prompts minimalistas por principio. Un prompt corto al que le falta contexto produce respuestas genéricas o inventadas. A menudo el arreglo de un mal resultado es **añadir** el contexto que faltaba: un ejemplo, una restricción, el documento correcto. Gastar bien un presupuesto también significa gastar donde hace falta.

Tampoco digo que las ventanas grandes no sirvan. Sirven, y mucho, cuando la tarea necesita ver algo entero. Lo que digo es que la decisión de meter algo debe ser deliberada.

## Cómo empezar

Si quieres aplicar esto mañana, coge una llamada de tu sistema y haz inventario: cuántos tokens van a cada uno de esos cinco consumidores. Puedes contarlos con `client.messages.count_tokens` y mirar `resp.usage`. Casi siempre aparece un bloque que nadie recuerda por qué está ahí. Quítalo, ejecuta tus evals y mira qué pasa. El curso [[cursos/context-engineering/index]] sigue a partir de ahí.

*Borrador inicial: pendiente de reescribir con la voz del autor.*
