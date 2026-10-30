---
titulo: "SDK del proveedor o framework: cómo elijo"
descripcion: "Por qué esta web enseña primero el bucle a mano con el SDK, cuándo uso yo un framework y qué coste tiene cada capa de abstracción que añades a un agente."
creado: 2026-10-28
estado: revision
tipo: ensayo
destacado: false
tags: [frameworks, agentes, opinion, open-source]
relacionados: ["[[docs/frameworks/01-elegir-framework]]", "[[docs/frameworks/02-equivalencias]]", "[[roadmap/40-primer-agente/02-el-bucle-agentico]]", "[[cursos/langchain-y-langgraph/index]]"]
---

Me preguntan a menudo por qué MoreContext enseña los agentes con el SDK de Anthropic y un `while` escrito a mano, cuando existen LangChain, LangGraph, Pydantic AI y una docena más. La sospecha suele ser que es por pereza o por fidelidad a un proveedor. Ninguna de las dos: el bucle a mano es la única forma que conozco de que entiendas qué hace el framework cuando lo uses después.

## El bucle cabe en una pantalla

Un [[glosario/bucle-agentico|bucle agéntico]] son unas cuarenta líneas: llamas al modelo, miras el `stop_reason`, ejecutas las herramientas que pidió, devuelves un `tool_result` por cada `tool_use` y repites hasta que termina o hasta que tu límite dice basta. Lo explico entero en [[roadmap/40-primer-agente/02-el-bucle-agentico]].

Cuando lo has escrito tú, todo lo demás se vuelve legible. Ves un `HumanInTheLoopMiddleware` y sabes que es una pausa entre el `tool_use` y la ejecución. Ves un `checkpointer` y sabes que es guardar la lista de mensajes con una clave. Ves un handoff y sabes que es una herramienta más que cambia el prompt de sistema. El framework deja de ser magia y pasa a ser código que podrías haber escrito, ordenado de una manera concreta.

Al revés no funciona. Si empiezas por `create_agent`, el día que el agente hace algo raro no sabes dónde mirar, porque nunca has visto las piezas por separado.

## Lo que aprendí instalándolos todos

Para preparar la sección de [[docs/frameworks/index|frameworks]] instalamos las versiones de octubre de 2026 y ejecutamos cada ejemplo con modelos simulados. Me quedo con una lista de sorpresas, todas de valores por defecto:

- En LangChain, una excepción dentro de una herramienta **corta el agente**. Solo vuelven al modelo los errores de validación de argumentos. Para el equivalente a `is_error` hace falta un middleware.
- `ChatAnthropic` sin `max_tokens` usa el máximo del modelo.
- El `recursion_limit` por defecto de LangGraph es tan alto que no frena nada.
- El OpenAI Agents SDK manda las trazas a la plataforma de OpenAI aunque el modelo sea Claude, y al modelo le devuelve un error genérico cuando falla una herramienta.
- `generateText` del AI SDK hace un solo paso si no le pasas `stopWhen`: el modelo pide la herramienta y la respuesta sale vacía.
- Deep Agents quitó `write_todos` de los valores por defecto en una versión menor.

Cada una de estas cosas es una decisión razonable que alguien tomó por ti. El problema aparece cuando no sabes que existen, y no lo sabes si nunca has escrito la versión sin framework, porque no tienes con qué comparar.

## El coste de cada capa

Cada capa de abstracción cobra tres impuestos.

El primero son **tokens**. El middleware y los harnesses añaden texto de sistema y definiciones de herramientas en cada llamada. A veces vale la pena: la lista de tareas, el resumen del historial, los subagentes. A veces no: la propia LangChain quitó la lista de tareas de Deep Agents porque sus evals no mostraban que mejorara lo bastante para lo que costaba. Me parece la decisión más honesta de todo el ecosistema este año.

El segundo es **depuración**. Entre tu código y la API hay más saltos. Si el framework no te deja ver los mensajes exactos que se envían, una regresión puede tardar horas en encontrarse.

El tercero es **ritmo**. LangChain sacó dos versiones menores con API nueva entre mayo y octubre. Si tu agente vive dos años, vas a pagar migraciones.

## Cuándo uso cada cosa

Mi criterio, que no pretende ser universal:

**SDK a mano** cuando el agente es pequeño, el proveedor es uno y quiero las novedades de la API el primer día: un clasificador, un extractor, un agente con tres herramientas. También para todo lo que enseño.

**Claude Code y su SDK** cuando el trabajo es de agente de código: archivos, terminal, búsqueda. Mi propio harness de desarrollo está montado sobre Claude Code, con hooks, subagentes y una sola puerta humana ([[blog/2026-10-23-una-sola-puerta-humana]]). No reescribiría esas piezas para ganar control que no necesito.

**LangGraph** cuando aparecen pausas largas, reanudación tras una caída o pasos en paralelo con estado compartido. Escribir eso a mano es posible, pero acabas reinventando un checkpointer peor.

**Pydantic AI** cuando la salida estructurada es el contrato y quiero pruebas sin API desde el primer día. Su `TestModel` y su `FunctionModel` son lo mejor que he visto para eso.

**LangChain `create_agent`** cuando necesito cambiar de proveedor sin reescribir, o probar el mismo agente con Claude y con un modelo local en Ollama.

Y casi nunca un framework de alto nivel con roles para algo que va a producción. Para enseñar una idea en una tarde, sí.

## Una regla que me funciona

Antes de adoptar un framework, construyo el mismo agente pequeño con el SDK y con él, y me hago cinco preguntas: si veo los mensajes exactos, qué pasa cuando una herramienta falla, dónde pongo el tope de pasos y de gasto, cómo pauso y reanudo, y si puedo escribir una prueba sin API. Las he puesto en [[docs/frameworks/01-elegir-framework]]. Si después de una tarde no sé responder a alguna, el framework me va a costar más de lo que me ahorra.

Uso varios frameworks y seguiré usándolos. Lo que busco es que cada abstracción sea una decisión tomada a sabiendas.

## Para seguir

- [[docs/frameworks/01-elegir-framework]]: los criterios, el árbol y la tabla.
- [[docs/frameworks/02-equivalencias]]: cómo se llama cada pieza en cada framework.
- [[cursos/langchain-y-langgraph/index]]: el agente del nivel 40, rehecho con LangChain y LangGraph.
- [[recetas/probar-agentes-sin-api]]: la costumbre que más me ha ahorrado.
- [[blog/2026-10-12-tu-primer-agente-deberia-ser-un-workflow]]: la decisión que va antes de esta.
