---
titulo: "Fase 4 · Herramientas de IA para programar"
descripcion: "Autocompletado, chat en el editor y agentes de código: cómo evolucionaron las herramientas de IA para programar y por qué no sustituyen entender tu código."
creado: 2026-10-29
revisado: 2026-10-29
orden: 7
minutos: 62
tipo: teoria
profundidad: imprescindible
objetivos:
  - Distinguir autocompletado, chat y agente en el editor por quién escribe el código y qué contexto ve.
  - Explicar por qué muchos tutoriales de editores con IA ya hablan sobre todo de agentes.
  - Aplicar tres comprobaciones antes de aceptar código generado por una herramienta de IA.
requiere: ["[[cursos/ruta-en-video/04-fase-3-llms-tokens-y-contexto]]"]
relacionados: ["[[cursos/agentes-de-codigo/index]]", "[[blog/2026-10-18-del-autocompletado-al-agente]]", "[[disciplinas/pair-programming-con-agentes]]", "[[herramientas/claude-code]]"]
tags: [ruta-en-video, agentes-de-codigo, editores]
---

Al terminar esta fase sabrás qué hace cada tipo de herramienta de IA para programar, de dónde vienen y cómo evitar que te quiten el criterio de ingeniería. Es el paso previo a la fase 5: dominar los asistentes de código antes de hablar de agentes autónomos.

## Qué vas a ver

| Vídeo | Canal | Duración | Idioma | Profundidad |
|---|---|---|---|---|
| [Curso de IA para programadores: herramientas y agentes en el editor (24:30–56:30)](https://www.youtube.com/watch?v=2aN_-m1uU4k) | midudev | 32 min | español | a fondo |
| [Comparativa de herramientas de IA para programar](https://www.youtube.com/watch?v=csIAc8rwooc) | MoureDev | — | español | a fondo |
| [La IA no sustituye entender qué hace tu código](https://www.youtube.com/watch?v=MgtM_Ktuc5A) | BettaTech | — | español | a fondo |

Los títulos describen el tema según la ruta del autor; «—» indica una duración sin confirmar. El tiempo de la lección suma el tramo de midudev, una estimación por lo bajo de 10 minutos por cada uno de los otros dos vídeos y 10 minutos de lectura.

## Lo que importa

El autor considera este bloque bastante importante, porque aquí se cruzan dos caminos: las herramientas de IA que ya son agentes y que usas a diario, y lo que necesitas saber si quieres crear tus propios agentes. Estas herramientas empezaron como asistentes de código, con un chat lateral o autocompletado. Después incorporaron agentes autónomos: les das una tarea y piensan, planifican y usan sus propias herramientas para leer y editar archivos. La diferencia con un chat es clara: el chat te da respuestas y te toca copiar y pegar a mano; el agente actúa.

Son de lo más usado ahora: editores que cruzan el desarrollo con la IA, como Visual Studio Code con extensiones, Cursor, Windsurf o Antigravity de Google, este último derivado de VS Code. El autor deja fuera de esta fase las aplicaciones de Codex y de Claude (Claude Code, Cowork), porque encajan mejor en la fase de agentes.

Su nota final explica algo que despista a mucha gente. Hace un año, estas herramientas eran editores con ayudas de IA: chat lateral, autocompletado. Ahora todo se ha orientado a agentes, y los tutoriales han cambiado con ello: el de Cursor, por ejemplo, acaba hablando de agentes, MCP y skills, que en esta ruta llegan más adelante. Lo que te tienes que llevar de aquí es la parte de asistencia: cómo se pasó de un chat en la web a herramientas que ayudan al programador dentro de su editor, cuando la IA todavía no actuaba sola creando archivos.

Los tres niveles, comparados:

| Nivel | Quién escribe | Qué contexto ve | Qué revisas tú |
|---|---|---|---|
| Autocompletado | Tú; la IA sugiere la línea siguiente | El archivo y lo cercano al cursor | Cada sugerencia, al aceptarla |
| Chat (web o lateral) | La IA propone; tú copias o aplicas | Lo que pegas o seleccionas | El fragmento antes de usarlo |
| Agente en el editor | La IA edita archivos y ejecuta comandos | El repositorio, la terminal, los resultados | El diff completo y las pruebas |

Cuanto más baja la tabla, más trabajo hace la herramienta y más importante es revisar. El ángulo de BettaTech es justo ese: la IA no sustituye entender qué hace tu código. Si aceptas cambios que no entiendes, el día que algo falle no sabrás por dónde empezar. Las herramientas deterministas (tests, linters, el compilador) son tu mejor aliado para verificar lo que genera un modelo; lo retomarás en la fase 9.

> [!consejo] Planifica antes de cambios grandes
> Casi todos los editores con agente tienen un modo de planificación: el agente explora el proyecto y propone un plan antes de tocar nada. Para refactorizaciones o funcionalidades grandes, revisa y corrige ese plan antes de dejarle implementar.

## Cómo verlo

1. **El tramo de midudev, del minuto 24:30 al 56:30.** Primero la evolución de las herramientas; después los agentes en VS Code, sus modos y la vuelta atrás a un punto anterior. Fíjate en cómo cambia lo que puede hacer la IA según el modo.
2. **La comparativa de MoureDev.** Apunta en qué se diferencian las herramientas en lo que importa: qué contexto ven, qué pueden ejecutar y cuánto cuestan.
3. **El vídeo de BettaTech, al final.** Combina bases de la IA con temas más avanzados; quédate con su criterio de revisión.
4. **Qué saltarte:** los precios, los planes y los modelos concretos de cada editor. Cambian casi cada mes.

## Practícalo en MoreContext

- [[cursos/agentes-de-codigo/01-como-trabaja-un-agente-de-codigo]] y [[cursos/agentes-de-codigo/02-contexto-del-repositorio]]: qué hace por dentro un agente de código y qué contexto le das.
- [[cursos/agentes-de-codigo/04-revisar-y-confiar]]: cuándo fiarte de un cambio generado y cómo revisarlo.
- [[disciplinas/explorar-planificar-implementar-verificar]] y [[disciplinas/cambios-pequenos-y-revisables]]: la forma de trabajar que evita los cambios que no puedes revisar.
- [[disciplinas/verificar-antes-de-dar-por-hecho]]: tests y comprobaciones antes de aceptar.
- Fichas de herramientas: [[herramientas/claude-code]], [[herramientas/cline]], [[herramientas/aider]] y [[herramientas/opencode]].

## Ejercicio

> [!ejercicio] La misma tarea en los tres niveles
> Elige una tarea pequeña en un proyecto tuyo (añadir una validación, un endpoint o un test). Hazla tres veces: con autocompletado, con el chat y con un agente. Anota el tiempo, cuántas veces tuviste que corregir y qué revisaste en cada caso.
>
> Está bien si las tres versiones pasan los mismos tests, si explicas qué nivel fue más rápido y cuál te dejó más tranquilo y si identificas al menos una cosa que el agente hizo y no le habías pedido.

> [!ejercicio]- Pistas
> Escribe el test antes de empezar: te da una forma objetiva de comparar. Para lo que el agente hace sin pedírselo, mira el diff completo, no solo los archivos que esperabas.

## Resumen

- Las herramientas pasaron de autocompletar y chatear a agentes que editan y ejecutan.
- Por eso los tutoriales actuales mezclan asistencia con agentes, MCP y skills.
- Cuanto más autónoma es la herramienta, más importa revisar el diff y ejecutar los tests.
- La IA no sustituye entender tu código: el criterio de ingeniería sigue siendo tuyo.

## Para seguir

- [[cursos/ruta-en-video/08-fase-5-que-es-un-agente]]
- [[cursos/agentes-de-codigo/index]]
- [[blog/2026-10-18-del-autocompletado-al-agente]]
