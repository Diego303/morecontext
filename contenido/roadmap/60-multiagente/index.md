---
titulo: Nivel 60 · Sistemas multiagente
descripcion: Cuándo merece la pena repartir el trabajo entre varios agentes, cómo orquestarlos con código y cómo medir lo que cuestan.
creado: 2026-09-14
nivel: 60
horas: 5
objetivo: Decidir con criterio si un problema necesita varios agentes y, cuando lo necesita, construir un orquestador con subagentes en paralelo cuyo coste puedas medir.
prerrequisitos: ["[[roadmap/40-primer-agente/index]]", "[[roadmap/40-primer-agente/03-condiciones-de-parada]]"]
proyecto:
  titulo: Investigador con subagentes en paralelo
  descripcion: Un orquestador recibe una pregunta abierta, la divide en 3–5 subpreguntas independientes, lanza un subagente de búsqueda por cada una con asyncio y sintetiza una respuesta con fuentes.
  entregable: Un script ejecutable con límite de concurrencia y manejo de fallos parciales, más una tabla que compare tokens, coste estimado y tiempo frente a la versión con un solo agente sobre las mismas 5 preguntas.
tags: [agentes, multiagente, orquestacion]
relacionados: ["[[cursos/sistemas-multiagente/index]]", "[[sistemas/investigacion-multiagente]]", "[[patrones/06-orquestador-trabajadores]]"]
---

En el nivel 40 construiste un [[glosario/agente]] que trabaja solo en un [[glosario/bucle-agentico]]. Aquí das el paso siguiente: un [[glosario/orquestador]] que reparte trabajo entre varios [[glosario/subagente|subagentes]]. Es la parte del roadmap donde más fácil resulta complicarse sin necesidad, así que el nivel empieza por la pregunta incómoda: ¿de verdad lo necesitas?

## Para quién es

Para quien ya tiene un agente con herramientas funcionando, sabe leer sus trazas y le pone límites de pasos y de gasto. Si alguna de esas tres cosas te suena lejana, repasa antes [[roadmap/40-primer-agente/06-depurar-con-trazas]] y [[roadmap/40-primer-agente/03-condiciones-de-parada]].

## Qué vas a aprender

Al terminar sabrás distinguir los problemas que se benefician de varios agentes (búsquedas amplias y separables, contextos que no caben juntos) de los que solo se complican. Sabrás escribir un orquestador en Python con subagentes como herramientas o como tareas paralelas, pasarles instrucciones autocontenidas, recoger sus resultados aunque alguno falle y calcular cuánto te cuesta cada respuesta.

## Lecciones

1. [[roadmap/60-multiagente/01-cuando-no-usar-multiagente]]. Los costes reales de añadir agentes y una lista de preguntas para decidir. Empieza aquí aunque tengas prisa.
2. [[roadmap/60-multiagente/02-orquestador-y-subagentes]]. El esqueleto con código: un subagente expuesto como herramienta y otro lanzado como tarea.
3. [[roadmap/60-multiagente/03-pasar-contexto-entre-agentes]]. Cómo escribir la tarea para un subagente que no sabe nada de la conversación y qué pedirle que devuelva.
4. [[roadmap/60-multiagente/04-paralelismo]]. `asyncio.gather`, semáforos para limitar la concurrencia y qué hacer cuando falla uno de cinco.
5. [[roadmap/60-multiagente/05-coste-de-multiplicar-agentes]]. Por qué los tokens se multiplican y cómo medirlo con `usage` antes de decidir.

## Proyecto del nivel

Construyes un investigador como el de [[sistemas/investigacion-multiagente]], en pequeño. El orquestador divide la pregunta, los subagentes buscan en paralelo y una última llamada sintetiza. Lo importante del entregable es la tabla comparativa: si la versión multiagente no gana en calidad o en tiempo para tus preguntas, la conclusión correcta es quedarte con un solo agente.

> [!consejo] Mide desde el primer día
> Registra `usage` de cada llamada desde la primera versión. Sin esos números, la lección 5 se queda en opinión.

## Para seguir

Cuando termines, el nivel [[roadmap/80-evals/index]] te da las herramientas para comprobar si tu sistema multiagente responde mejor que el agente simple. Si quieres profundizar en arquitecturas y estado compartido, sigue con el curso [[cursos/sistemas-multiagente/index]].
