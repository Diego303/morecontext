---
titulo: «Haz que funcione» no es una instrucción
descripcion: Por qué un agente necesita instrucciones detalladas con objetivo, contexto, restricciones y criterio de aceptación, con un ejemplo de la misma petición antes y después.
creado: 2026-10-19
estado: revision
tipo: ensayo
destacado: false
tags: [prompting, agentes, especificacion]
relacionados: ["[[roadmap/10-prompting/01-instrucciones-claras]]", "[[roadmap/70-flujos-con-especificacion/01-de-improvisar-a-especificar]]", "[[plantillas/agents-md]]", "[[problemas/el-modelo-ignora-instrucciones]]"]
---

Un [[glosario/agente|agente]] es una herramienta autónoma que piensa y razona. Hará las cosas mejor o peor y se podrá equivocar, pero con unas instrucciones buenas puede implementar una tarea de código él solo. Con unas malas, también hará cosas. Ese es el problema.

«Haz que funcione» es la instrucción mala por excelencia. Sale sola cuando vas con prisa, y suele acabar igual: el agente hace algo y declara que funciona.

## Qué hace un agente con una instrucción vaga

Los LLMs son un monstruo, para bien y para mal. Te hacen muchas cosas, pero si no les das guías y restricciones, te hacen cosas que asumen que quieres y que a lo mejor no quieres así, o no quieres tanto.

Tampoco hace falta suponer pereza ni mala fe. Cada paso del agente es la continuación más probable de su contexto ([[blog/2026-10-15-la-respuesta-mas-probable]]). Si el contexto dice «haz que funcione», hay muchos caminos probables que acaban en algo que «funciona»: capturar la excepción y devolver un valor por defecto, relajar el test que falla, reescribir el módulo entero con un diseño que nadie pidió. Todos cumplen la letra de la instrucción.

Al construir mi harness anoté estos fallos como problemas que el entorno del agente tiene que resolver. Dos de ellos se agravan mucho con instrucciones vagas: la tendencia a declarar éxito sin evidencia (PASS falsos, tests debilitados) y la deriva de alcance (refactors no pedidos, rediseños en mitad de la implementación).

## Antes y después

Un caso inventado, pero de los que pasan: un endpoint de login que devuelve error 500 con algunos usuarios.

```text title="Antes"
El login falla. Haz que funcione.
```

```text title="Después"
Contexto: API en Python con FastAPI. El login está en app/auth/login.py
y sus tests en tests/test_login.py.

Problema: POST /login devuelve 500 cuando el email tiene mayúsculas
("Ana@Ejemplo.com"). Con el mismo email en minúsculas funciona.

Objetivo: que el login no distinga mayúsculas en el email.

Restricciones:
- No cambies el esquema de la base de datos ni migres datos.
- No toques otros endpoints ni añadas dependencias.
- No modifiques ni borres tests existentes.

Hecho cuando:
- Hay un test nuevo que reproduce el fallo y ahora pasa.
- `pytest tests/test_login.py` pasa entero.

Entrega: la causa raíz en dos o tres frases y la lista de archivos tocados.
```

Las dos piden lo mismo. La segunda cierra los caminos malos: el agente no puede relajar un test, no puede migrar la tabla de usuarios y no puede decir «hecho» sin un comando que lo demuestre. Y al pedir la causa raíz por escrito, si el problema resulta ser otro distinto del que sospechaba, me voy a enterar.

## Las piezas de una buena instrucción

La segunda versión tiene la estructura de cualquier buen prompt: objetivo, contexto, restricciones, formato y, cuando hacen falta, ejemplos. Para un agente hay una pieza que lo cambia todo: **el criterio de aceptación**, escrito como algo que se puede comprobar.

- **Objetivo**: qué tiene que ser verdad al terminar.
- **Contexto**: lo que el agente no puede adivinar. Dónde está el código, qué stack usas, qué has probado ya.
- **Restricciones**: lo que no debe tocar. Es la parte que más se olvida y la que más problemas evita.
- **Criterio de aceptación**: un comando, un test o un archivo que demuestra que está hecho.
- **Entrega** (el formato): qué quieres que te devuelva para poder revisarlo rápido.

No todas las tareas necesitan las cinco con este detalle. Pero cuanto más autónomo es el agente y más grande la tarea, más caro sale omitir alguna.

## Saber informática es saber qué pedir

Por eso sigue siendo tan importante aprender informática. Fíjate en lo que hace falta para escribir la segunda instrucción: saber qué significa un 500, sospechar de una comparación de cadenas, saber que una migración de datos es algo que no quieres de rebote y saber que un test que reproduce el fallo vale más que diez explicaciones. Quien no sabe eso no puede escribir esa instrucción. Y tampoco puede revisar lo que le devuelvan.

Si sabes qué quieres crear, puedes darle al agente guías e instrucciones muy buenas para que lo implemente de la mejor forma posible. Si no lo sabes, el agente decide por ti, y decide lo más probable, que no tiene por qué ser lo mejor para tu caso. Usar bien un agente pide saber cómo funciona y, sobre todo, entender qué le estás pidiendo.

## Cuando la instrucción crece

Hay tareas en las que la instrucción buena ocupa una página. A partir de ahí conviene cambiar de herramienta: escribir una especificación, que alguien la apruebe y que el agente la siga. Es lo que propone el [[glosario/sdd|Spec-Driven Development]], y es como trabaja mi harness. Un agente diseñador escribe la propuesta, los requisitos, el diseño, las tareas y los [[glosario/aceptacion-ejecutable|criterios de aceptación ejecutables]]; yo apruebo; y solo entonces se construye. Lo cuento en [[roadmap/70-flujos-con-especificacion/01-de-improvisar-a-especificar]] y en [[blog/2026-10-23-una-sola-puerta-humana]].

Y hay reglas que se repiten en todas las tareas: el stack, los comandos de test, las convenciones. Esas van una sola vez en un [[glosario/agents-md|AGENTS.md]]. La plantilla del mío empieza con una advertencia que aplico a todo lo que escribo para un agente: escribe solo reglas observables y verificables, porque cada regla vaga se paga en tokens en cada agente y no cambia nada. «Escribe código limpio» es una regla vaga. «Las funciones públicas llevan anotaciones de tipo y el typecheck del proyecto pasa sin errores» es una regla que el agente puede cumplir y tú puedes verificar.

## Para seguir

- [[roadmap/10-prompting/01-instrucciones-claras]]: la lección de base sobre instrucciones y contexto.
- [[plantillas/prompt-de-sistema-de-agente]]: una plantilla para el prompt de sistema de un agente con herramientas.
- [[plantillas/agents-md]]: el AGENTS.md que uso como punto de partida.
- [[cursos/ruta-en-video/08-fase-5-que-es-un-agente]]: la fase de la ruta donde escribí esta nota.

*Borrador inicial: pendiente de reescribir con la voz del autor.*
