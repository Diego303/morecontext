---
titulo: Por qué tu primer agente debería ser un workflow
descripcion: Un ensayo sobre por qué conviene empezar con pasos fijos en código y dejar la autonomía del modelo para cuando de verdad la necesitas.
creado: 2026-10-12
estado: revision
tipo: ensayo
destacado: true
tags: [agentes, workflows, diseno]
relacionados: ["[[patrones/01-workflows-vs-agentes]]", "[[roadmap/40-primer-agente/01-que-es-un-agente]]", "[[patrones/09-elegir-patron]]", "[[glosario/workflow]]"]
---

Cuando alguien me dice que quiere construir su primer agente, casi siempre está describiendo otra cosa. Quiere que un modelo lea un correo, lo clasifique, busque el pedido y redacte una respuesta. Eso tiene cuatro pasos, siempre los mismos y en el mismo orden. Es un [[glosario/workflow|workflow]]. Y defiendo que es exactamente lo que debería construir primero.

## Dos cosas que llamamos igual

Tomo la distinción de *Building effective agents*, el artículo que Anthropic publicó en diciembre de 2024 y que me sigue pareciendo la mejor brújula en este tema. Un **workflow** es un sistema donde los modelos y las herramientas se orquestan por caminos definidos en tu código. Un **[[glosario/agente|agente]]** es un sistema donde el modelo dirige su propio proceso: decide qué herramienta usar, cuándo y cuándo ha terminado, dentro de un [[glosario/bucle-agentico|bucle agéntico]].

Las dos cosas usan las mismas piezas: llamadas al modelo, [[glosario/tool-use|herramientas]], recuperación. La diferencia está en quién decide el siguiente paso. En un workflow lo decides tú al escribir el código. En un agente lo decide el modelo en cada vuelta. Lo explico con más calma en [[patrones/01-workflows-vs-agentes]].

## Lo que ganas con el control

Mi argumento principal es sencillo: **cada decisión que le quitas al modelo es una decisión que puedes probar, medir y depurar.**

Piensa en el correo de soporte. Si lo montas como [[patrones/03-encadenado|encadenado de prompts]], tienes un paso de clasificación con una salida cerrada, un paso de búsqueda con una consulta concreta y un paso de redacción con un contexto acotado. Entre cada paso puedes poner una comprobación en código. Si la clasificación falla, lo ves en la clasificación. Si el borrador es malo, sabes qué contexto recibió.

Si lo montas como agente, el modelo puede buscar el pedido antes de clasificar, buscarlo dos veces, decidir que no hace falta buscarlo o redactar sin haberlo encontrado. Todas esas trayectorias son posibles y todas tienes que evaluarlas. La [[glosario/trayectoria|trayectoria]] se convierte en una variable más, y las variables cuestan.

Esto se nota en tres sitios:

- **Evals.** En un workflow puedes evaluar cada paso por separado con casos pequeños. En un agente necesitas además [[roadmap/80-evals/04-evals-de-trayectoria|evals de trayectoria]], que son más caras de construir y de mantener.
- **Coste y latencia.** Un workflow hace un número conocido de llamadas. Un agente hace las que necesite, y a veces necesita muchas más de las que esperabas. Por eso un agente exige [[roadmap/40-primer-agente/03-condiciones-de-parada|condiciones de parada y presupuesto]] desde el primer día.
- **Depuración.** Leer la traza de un workflow es leer un registro lineal. Leer la de un agente es reconstruir por qué el modelo eligió cada cosa.

## La objeción razonable

La objeción que más respeto es esta: «si escribo todos los pasos, no estoy aprovechando lo que el modelo sabe hacer». Es cierta en parte. Hay tareas donde el número de pasos no se puede prever: depurar un fallo en un repositorio, investigar una pregunta abierta, navegar una web que cambia. Ahí un workflow se vuelve un laberinto de condiciones y el [[patrones/08-agente-autonomo|agente autónomo]] es la herramienta correcta.

Pero esa no suele ser la primera tarea de nadie. La primera tarea suele ser algo que una persona ya hace siguiendo un procedimiento. Si el procedimiento existe, escríbelo. El modelo aporta su valor dentro de cada paso: entender texto libre, extraer datos, redactar. No necesita además decidir el orden.

Hay un segundo matiz. Entre el workflow rígido y el agente libre hay una escalera. El [[patrones/04-enrutado|enrutado]] deja que el modelo elija el camino entre varios que tú defines. El [[patrones/06-orquestador-trabajadores|orquestador con trabajadores]] deja que divida la tarea. El [[patrones/07-evaluador-optimizador|evaluador-optimizador]] deja que itere sobre su propio resultado con un criterio claro. Puedes subir un peldaño cada vez que tengas evidencia de que lo necesitas. El árbol de decisión de [[patrones/09-elegir-patron]] sirve para eso.

## La autonomía como deuda

Me gusta pensar la autonomía como una forma de deuda técnica que a veces vale la pena contraer. Te da flexibilidad ahora y te cobra después en evals, en observabilidad, en seguridad y en sorpresas de coste. Cuantas más herramientas con efectos tenga el agente, más intereses pagas: cada una es un punto donde una [[glosario/inyeccion-de-prompt|inyección de prompt]] o un error de razonamiento se convierte en una acción real.

Un workflow también tiene riesgos, claro. Pero los riesgos están en sitios que conoces, porque los pusiste tú. Puedes poner [[glosario/humano-en-el-bucle|aprobación humana]] justo antes del paso que envía el correo, y sabes que no hay otro camino por el que se envíe.

## Cómo lo haría

Si hoy tuviera que montar ese asistente de soporte, haría esto:

1. Escribiría el procedimiento como lo haría una persona, paso a paso.
2. Convertiría cada paso en una llamada al modelo o en código normal, con entradas y salidas definidas. Usaría [[glosario/salida-estructurada|salidas estructuradas]] donde un paso alimente a otro.
3. Montaría un [[glosario/conjunto-de-evaluacion|conjunto de evaluación]] pequeño por paso.
4. Solo si los casos reales muestran que el orden fijo no funciona, dejaría que el modelo decida ese tramo concreto.

Lo que saco de *Building effective agents* se resume en una idea que el artículo repite: busca la solución más simple posible y añade complejidad solo cuando la necesites. Un workflow bien hecho te deja la base sobre la que, si llega el caso, construirás un agente que entiendes. Si quieres el recorrido completo, empieza por [[roadmap/40-primer-agente/01-que-es-un-agente]].

*Borrador inicial: pendiente de reescribir con la voz del autor.*
