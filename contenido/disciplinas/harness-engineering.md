---
titulo: Harness engineering
descripcion: La disciplina de diseñar el entorno de un agente para que sea fiable, verificable, reanudable, seguro y barato, con sus principios, cuándo compensa y cuándo retirar piezas.
creado: 2026-10-29
orden: 13
tipo: disciplina
tags: [harness, disciplina, agentes-de-codigo]
relacionados: ["[[glosario/harness-engineering]]", "[[roadmap/90-harness/index]]", "[[cursos/harness-engineering/index]]", "[[glosario/guias-y-sensores]]", "[[blog/2026-10-27-el-arnes-importa-y-cuesta]]"]
---

Harness engineering es diseñar todo lo que rodea al modelo en un agente: instrucciones, herramientas y permisos, entorno, controles deterministas, orquestación, estado, verificación y coste. El objetivo es que un modelo no determinista produzca trabajo **fiable, verificable, reanudable, seguro y con coste controlado**, sin quitarle el juicio: se delimita dónde actúa, con qué información, qué evidencia deja y quién decide al final.

## Qué es

La ecuación de partida es **agente = modelo + [[glosario/harness|harness]]**. El término se asentó entre finales de 2025 y la primavera de 2026: Anthropic ya hablaba de *harnesses* para tareas largas en noviembre de 2025, OpenAI publicó [*Harness engineering*](https://openai.com/index/harness-engineering/) en febrero de 2026 y Birgitta Böckeler lo ordenó en [*Harness engineering for coding agent users*](https://martinfowler.com/articles/harness-engineering.html) (abril de 2026). La historia completa está en [[roadmap/90-harness/01-que-es-un-harness]].

Böckeler propone dos ejes para clasificar cualquier control:

| | Computacional (determinista) | Inferencial (con un modelo) |
|---|---|---|
| **Guía** (*feedforward*, antes de actuar) | Plantillas, esquemas, generadores, reglas de arquitectura | Instrucciones, specs, ejemplos, skills |
| **Sensor** (*feedback*, después de actuar) | Tests, linters, *type checkers*, tests estructurales | Revisión con IA, modelo como juez |

Los controles computacionales son baratos, rápidos y repetibles: úsalos siempre que lleguen. Los inferenciales son caros y no deterministas: resérvalos para lo que el código no puede juzgar ([[glosario/guias-y-sensores]]). Böckeler añade que, de lo que se puede regular, la mantenibilidad es lo más resuelto y el **comportamiento** lo menos: ahí es donde más falta hacen la aceptación ejecutable y las evals.

## Por qué importa

Porque el harness mueve resultados con el modelo fijo. LangChain subió su agente de 52,8 % a 66,5 % en Terminal-Bench 2.0 cambiando solo el harness ([*Improving Deep Agents with harness engineering*](https://www.langchain.com/blog/improving-deep-agents-with-harness-engineering), febrero de 2026).

Y porque **no siempre compensa**. Naresh Jain lo midió en [*Are Harnesses Worth the Cost?*](https://martinfowler.com/articles/are-harnesses-worth-the-cost.html) (13 de octubre de 2026): con un modelo frontera que ya acertaba 10 de 10, el harness completo multiplicó por siete el coste sin ganar fiabilidad; con un modelo barato pasó de 3 de 10 a 10 de 10 y salió un 33 % más barato que el frontera sin harness. Fue un único servicio nuevo con diez ejecuciones por modelo: un caso, no una regla. Su recomendación: mide primero sin harness extra y, si el modelo acierta de forma consistente, añade solo una puerta de aceptación final.

Anthropic da la otra mitad en [*Harness design for long-running application development*](https://www.anthropic.com/engineering/harness-design-long-running-apps) (marzo de 2026): cada componente del harness codifica una suposición sobre lo que el modelo no puede hacer solo, y conviene **retirarlo** cuando un modelo nuevo la invalida. Ellos quitaron fases enteras de su propio harness al cambiar de modelo.

## Prácticas concretas

Los nueve principios de diseño del harness del autor, aplicables a cualquier agente:

1. **IA en lo semántico, código en los bordes.** El modelo decide qué hacer; el código decide si es legal. Una transición la pide el modelo y la valida un script.
2. **Evidencia sobre afirmaciones.** «Hecho» solo con un comando ejecutado después del último cambio ([[disciplinas/verificar-antes-de-dar-por-hecho]]).
3. **Mínimo privilegio.** Cada agente puede escribir solo sus artefactos ([[glosario/minimo-privilegio]]).
4. **Fallo en cerrado.** Si un control de seguridad falla, bloquea ([[glosario/fallo-en-cerrado]]).
5. **Instrucciones distintas de datos.** Lo que se lee en archivos y herramientas nunca da órdenes.
6. **Bucles acotados.** Un número fijo de reintentos automáticos (en el harness del autor, una reparación) y después decide una persona.
7. **Contexto mínimo.** Cada token cuesta en cada agente: se guarda en disco y se pasa por referencia.
8. **Un solo escritor por artefacto.** Elimina carreras y responsabilidades difusas.
9. **Complejidad solo con evidencia.** Nada de memoria vectorial, motores de grafos ni enrutadores de modelos hasta que una necesidad medida lo pida.

Y tres hábitos que los sostienen:

- **Sensores que enseñan.** OpenAI escribe los mensajes de sus linters con la instrucción de arreglo incluida: el sensor también es una guía para el siguiente intento.
- **Instrucciones como índice.** Un `AGENTS.md` corto que apunta a `docs/`, no un manual que se carga entero en cada turno.
- **Bucle de mejora del harness.** Böckeler lo llama *steering loop*: cada vez que un fallo se repite, cambia el harness (una regla, un test, un hook), no solo el prompt de esa tarea.

## Señales de que lo haces mal

- Tu `CLAUDE.md` o `AGENTS.md` tiene cientos de líneas y el agente sigue ignorando la mitad.
- Las reglas importantes («no hagas push», «no leas `.env`») están solo en el prompt.
- Tus sensores son mudos: el linter dice «error» pero no cómo arreglarlo.
- El revisor comparte contexto con quien escribió el código y aprueba lo que este ya justificó.
- No sabes cuánto cuesta una tarea ni podrías decirlo leyendo tus registros.
- Hay piezas que nadie sabe por qué existen o que se añadieron para un modelo que ya no usas.
- Pasaste a varios agentes antes de tener un comando que diga si el trabajo está bien.

## Cómo empezar mañana

1. Elige cinco tareas reales que hayas hecho con tu agente y ejecútalas sin cambiar nada. Anota cuántas salen bien a la primera.
2. Escribe un comando que diga si cada una está bien (tests, un script, un `acceptance.yaml`). Es tu puerta final.
3. Añade un hook que bloquee lo que nunca debe pasar en tu repositorio y pruébalo ([[roadmap/90-harness/03-permisos-y-hooks]]).
4. Registra coste y eventos por sesión ([[roadmap/90-harness/05-un-harness-minimo]]).
5. Durante dos semanas, por cada fallo que se repita, añade una pieza al harness y apunta por qué. Cada mes, revisa la lista y quita lo que ya no haga falta.

Cuando quieras ver un harness completo con estos principios aplicados pieza a pieza, sigue [[cursos/harness-engineering/index]].

## Para seguir

- [[roadmap/90-harness/02-las-piezas-de-un-harness]]
- [[cursos/harness-engineering/04-patrones-y-principios]]
- [[disciplinas/context-engineering]]
- [[sistemas/harness-sdd-claude-code]]
