---
titulo: El arnés importa (y cuesta)
descripcion: Lo que dicen las mediciones de 2026 sobre el arnés de un agente (mueve resultados, pero puede multiplicar el coste sin ganar nada) y qué hago con eso en mi propio harness.
creado: 2026-10-27
estado: revision
tipo: analisis
destacado: false
tags: [harness, coste, evals, agentes]
relacionados: ["[[disciplinas/harness-engineering]]", "[[cursos/harness-engineering/10-coste-y-presupuesto]]", "[[sistemas/harness-sdd-claude-code]]", "[[radar/2026-10-22-harness-engineering]]"]
---

Llevo meses construyendo un [[glosario/harness|harness]] para trabajar con agentes de código, y este otoño han salido dos mediciones que me han hecho mirarlo con otros ojos. Una dice que el arnés mueve los resultados más de lo que solemos admitir. La otra, que puede costar siete veces más sin mejorar nada. Las dos son ciertas a la vez, y entender por qué es lo que separa un arnés útil de uno que solo da sensación de control.

## El arnés mueve la aguja

En febrero, LangChain publicó un experimento limpio: [cambiar solo el arnés de su agente, con el modelo fijo](https://www.langchain.com/blog/improving-deep-agents-with-harness-engineering), lo llevó de 52,8 % a 66,5 % en Terminal-Bench 2.0. Trece puntos y pico sin tocar el modelo. Lo que cambiaron no tiene nada de exótico: un prompt que obliga a construir y verificar, un middleware que intercepta al agente antes de terminar para que compruebe su trabajo contra la tarea, otro que le enseña el entorno al arrancar, avisos de tiempo, detección de bucles cuando edita el mismo archivo una y otra vez, y más esfuerzo de razonamiento al planificar y al verificar que al implementar.

Me gusta un detalle que suele pasar desapercibido: subir el esfuerzo al máximo en todos los pasos dio peor resultado (53,9 %) que dejarlo en alto, por los *timeouts*. Más no es mejor. Ya ahí se ve que el arnés tiene un coste.

Esto encaja con lo que vemos todos los días: el mismo modelo parece otro con buenas instrucciones, un sandbox decente y tests que puede ejecutar. Por eso cada vez que alguien compara modelos con una tabla, pregunto con qué arnés.

## Y puede costar siete veces más

En octubre, Naresh Jain publicó en martinfowler.com [*Are Harnesses Worth the Cost?*](https://martinfowler.com/articles/are-harnesses-worth-the-cost.html). El experimento es pequeño y está bien contado: un servicio Java concreto, dos modelos (uno frontera y otro barato), diez ejecuciones por condición, con y sin arnés, y un evaluador independiente con 178 tests de aceptación que el arnés nunca vio. El arnés eran specs OpenAPI y AsyncAPI, ejemplos, una skill de desarrollo de APIs, dependencias simuladas por contrato y sensores de tests.

Los resultados:

- Con el modelo frontera, 10 de 10 con arnés y 10 de 10 sin él. El arnés gastó unas 10,5 veces más tokens, tardó casi el triple y costó unas 7 veces más. No ganó nada en fiabilidad.
- Con el modelo barato, el arnés lo llevó de 3 de 10 a 10 de 10. Y ese modelo barato con arnés salió un 33 % más barato por intento que el frontera sin arnés.

La conclusión de Jain es la frase que me llevo: lo que cambia con la capacidad del modelo no es si hacen falta sensores independientes, sino **cuándo se ejecutan**. Con un modelo que acierta solo, basta una puerta de aceptación final. Con uno que falla de forma irregular, el arnés tiene que acompañarlo todo el camino. Él mismo advierte de los límites: una muestra pequeña, un servicio nuevo y un enunciado muy detallado. No es una ley; es una medición honesta que invita a hacer la tuya.

## Cada pieza es una suposición

La tercera idea viene de Anthropic, de [marzo](https://www.anthropic.com/engineering/harness-design-long-running-apps): cada componente de un arnés codifica una suposición sobre lo que el modelo no puede hacer solo. Y esas suposiciones caducan. En su arnés de planificador, generador y evaluador, al pasar a modelos más capaces quitaron los sprints, dejaron el evaluador en una sola pasada final y dejaron de necesitar los reinicios de contexto. Su ejemplo de coste es elocuente: 20 minutos y 9 dólares con el agente solo (y un juego que no funcionaba), 6 horas y 200 dólares con el arnés completo (y uno jugable). Merece la pena, dicen, cuando la tarea está más allá de lo que el modelo hace bien solo.

Junta las tres y sale una regla sencilla: **el arnés hay que medirlo como cualquier otra dependencia**. Aporta donde el modelo falla, cuesta siempre, y lo que hoy es necesario puede sobrar con el modelo siguiente.

## Qué hago en mi harness

Mi harness tiene muchas piezas: un orquestador, cuatro agentes, una máquina de estados, spec congelada por hash, aceptación ejecutable, guards de seguridad. Es fácil leer lo anterior y pensar que me sobra la mitad. Lo he revisado con esa pregunta, y esto es lo que hago:

**Mido el coste de verdad, por feature y por agente.** Un hook lee al terminar cada subagente su transcript, suma el `usage` real y lo valora con una tabla de precios fechada. Cada feature tiene presupuesto, y al superarlo se para el trabajo nuevo hasta que yo decido. Si no supiera cuánto cuesta cada pieza, no podría decir si compensa. Lo explico en [[cursos/harness-engineering/10-coste-y-presupuesto]].

**Pongo el modelo caro solo donde un error sale más caro.** El designer, que escribe la especificación, usa Opus; el resto, Sonnet. Es la versión pequeña de la idea de Jain: más capacidad donde se decide, arnés y verificación donde se ejecuta.

**La verificación independiente no la quito nunca.** El reviewer ejecuta él mismo los criterios de aceptación aprobados y solo un `PASS` con evidencia fresca cierra la feature. Es exactamente la puerta final que Jain recomienda incluso con modelos frontera. Lo que sí he acotado es el bucle: un único repair automático, y si vuelve a fallar decido yo. Un bucle abierto de autocorrección es el sitio donde un arnés quema dinero sin que nadie lo vea.

**Lo que no está, no está por decisión.** Mantengo una lista de límites deliberados, cosas que el harness no tiene: memoria vectorial, motor de grafos, router de modelos, bucles de autoevaluación abiertos. El contrato lo dice así: complejidad solo con evidencia. Cada una de esas piezas sería una suposición más que pagar en tokens y en mantenimiento sin haber medido que hiciera falta.

**Retiro lo que la herramienta ya hace.** Claude Code lee ahora `AGENTS.md` de forma nativa (si no hay `CLAUDE.md`) y trae worktrees; parte de mi harness es anterior a eso. Cuando una pieza propia queda cubierta por una nativa, la retiro o la reduzco a lo mínimo. Lo cuento en [[blog/2026-10-22-de-codex-a-claude-code]].

**Y me hago la pregunta de Jain con cada modelo nuevo.** ¿Esta pieza sigue sosteniendo algo, o solo cuesta? La forma de responderla no es la intuición: es ejecutar las mismas features con y sin la pieza y comparar coste y resultado. Es lo que intento hacer al evolucionar el harness ([[cursos/harness-engineering/12-probar-y-evolucionar-el-harness]]).

## La lección

Un arnés no es bueno por tener muchas piezas ni malo por costar. Es bueno si cada pieza paga su coste en fiabilidad, y eso solo se sabe midiendo. Mi orden de preguntas hoy es este: ¿el modelo acierta solo de forma consistente? Entonces, puerta final y poco más. ¿Falla de forma irregular? Entonces guías y sensores baratos durante el camino. ¿Cuánto cuesta cada pieza? Si no lo sé, ese es el primer trabajo.

## Para seguir

- [[disciplinas/harness-engineering]]: la disciplina, con guías, sensores y cuándo compensa.
- [[sistemas/harness-sdd-claude-code]]: mi harness pieza a pieza.
- [[cursos/harness-engineering/index]]: el curso para construir el tuyo.
- [[docs/evals/03-benchmarks-publicos]]: por qué una cifra de benchmark depende del arnés con el que se midió.

*Borrador inicial: pendiente de reescribir con la voz del autor.*
