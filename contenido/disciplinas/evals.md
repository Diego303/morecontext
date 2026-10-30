---
titulo: Evals como disciplina
descripcion: Medir de forma repetible si tu aplicación de IA hace lo que debe, antes y después de cada cambio, y usar esa medida para decidir.
creado: 2026-08-11
actualizado: 2026-10-29
orden: 2
tipo: disciplina
tags: [evals, calidad]
relacionados: ["[[roadmap/80-evals/index]]", "[[cursos/evals-para-agentes/index]]", "[[docs/evals/01-disenar-evals]]", "[[recetas/evals-de-regresion-en-ci]]"]
---

Hacer [[glosario/evals|evals]] es tener un conjunto de casos, una forma de puntuarlos y la costumbre de ejecutarlos cada vez que cambias algo. Como disciplina, significa que ninguna decisión sobre prompts, modelos o herramientas se toma «porque parece que va mejor».

## Qué es

Una eval tiene tres piezas:

1. **Casos**: entradas reales o realistas, con lo que esperas que pase. Es tu [[glosario/conjunto-de-evaluacion|conjunto de evaluación]].
2. **Grader**: la forma de puntuar cada salida. Puede ser código (¿el JSON valida?, ¿la categoría coincide?), un [[glosario/modelo-juez|modelo juez]] con una rúbrica o una persona.
3. **Ejecución**: un script que pasa todos los casos, agrega la nota y la compara con la anterior.

En agentes también importa el camino. Una eval de [[glosario/trayectoria|trayectoria]] mira qué herramientas llamó el agente, en qué orden y cuántas vueltas dio, además de la respuesta final. Lo trata [[roadmap/80-evals/04-evals-de-trayectoria]]. Aun así, Anthropic recomienda puntuar sobre todo el resultado (el estado final: ¿existe la reserva?, ¿pasan los tests?) y no el camino exacto, porque un agente puede llegar bien por otra ruta ([*Demystifying evals for AI agents*](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), 9 ene. 2026).

## Por qué importa

Los modelos generan texto con variación. Un cambio en el prompt que arregla un caso puede romper otros tres que no estás mirando. Sin evals solo te enteras cuando un usuario se queja.

Las evals también te dejan cambiar de modelo con datos. Cuando sale uno nuevo o quieres bajar a uno más barato, ejecutas la suite y comparas. Sin ella, la decisión es una apuesta. Es el método que propone [[modelos/05-elegir-modelo-por-tarea]]: empieza por el más capaz, mide y baja de nivel mientras la nota aguante.

```mermaid
flowchart LR
  C[Cambio] --> E[Ejecutar evals]
  E --> N{¿Nota ≥ anterior?}
  N -- sí --> M[Merge]
  N -- no --> F[Mirar los fallos]
  F --> C
  P[Fallos en producción] --> A[Nuevos casos]
  A --> E
```

## Prácticas concretas

- **Empieza con 20 casos, no con 2 000.** Veinte casos bien elegidos, sacados de uso real, ya cazan las regresiones gordas. Anthropic propone arrancar con 20–50 tareas sacadas de fallos reales. La suite crecerá sola con cada fallo que encuentres.
- **Antes de puntuar, lee.** Recorre un centenar de trazas, anota el primer fallo de cada una y agrupa: es el [[glosario/analisis-de-errores|análisis de errores]] y te dice qué medir ([[recetas/analisis-de-errores-de-trazas]]).
- **Cada bug de producción se convierte en un caso.** Antes de arreglarlo, añádelo a la suite y comprueba que falla. Después, que pasa.
- **Usa código siempre que puedas.** Comparar una categoría, validar un esquema o comprobar que una cita existe es barato, rápido y determinista. Reserva el modelo juez para lo que el código no puede medir (tono, completitud, fidelidad). Ver [[roadmap/80-evals/03-codigo-o-modelo-juez]].
- **Calibra al juez con humanos.** Usa etiquetas binarias (pasa o no pasa) en lugar de escalas del 1 al 10, puntúa a mano un conjunto con casos que pasan y que fallan, y mide por separado cuántos aciertos y cuántos fallos detecta el juez (TPR y TNR), como proponen Hamel Husain y Shreya Shankar ([*AI Evals FAQ*](https://hamel.dev/blog/posts/evals-faq/)). Ajusta la rúbrica hasta que ambas tasas sean altas ([[recetas/validar-un-modelo-juez]]). Zheng et al. ([MT-Bench y Chatbot Arena](https://arxiv.org/abs/2306.05685), 2023) describen sesgos del juez, como preferir respuestas largas o la primera opción.
- **Mira los fallos, no solo la media.** Un 92 % puede esconder que todos los casos en catalán fallan. Agrupa por etiqueta.
- **Repite los casos inestables.** Si un caso pasa a veces, ejecútalo 3 o 5 veces y mide la tasa de acierto. Para un agente de cara al cliente importa [[glosario/pass-k|pass^k]] (acierta las k veces), no pass@k (acierta alguna): con un 75 % por intento, acertar tres seguidas baja a un 42 %.
- **Desconfía de las diferencias pequeñas.** En benchmarks agénticos, Anthropic midió que la infraestructura sola mueve varios puntos: trata ventajas de menos de 3 puntos como ruido, en los rankings públicos y en tus propias comparaciones ([[docs/evals/03-benchmarks-publicos]]).
- **Mete las evals en CI.** Un umbral mínimo que bloquea el merge. Receta: [[recetas/evals-de-regresion-en-ci]].
- **Versiona los casos con el código.** Un archivo `evals/casos.jsonl` en el repositorio, revisado en cada PR como cualquier test.
- **No necesitas una plataforma de pago.** [[herramientas/promptfoo|promptfoo]] (MIT), [[herramientas/deepeval|DeepEval]] o [[herramientas/inspect-ai|Inspect]] ejecutan suites en local y en CI, también con un modelo abierto como juez. Si el juez local es más débil que el modelo que evalúa, sus notas tienden a salir infladas: valídalo igual que a cualquier juez ([[docs/modelos-abiertos/08-evals-abiertas]]).

## Señales de que lo haces mal

- Pruebas un cambio de prompt con tres ejemplos en el playground y lo subes.
- Nadie sabe decir qué porcentaje de casos resuelve el sistema hoy.
- La suite de evals lleva meses sin un caso nuevo.
- El modelo juez da 9/10 a todo, o nunca has medido cuánto coincide con una persona.
- Eliges modelo por una ventaja de un punto en un benchmark público.
- Las evals tardan una hora y por eso nadie las ejecuta.
- Optimizas la nota de la eval y los usuarios siguen quejándose de lo mismo (tus casos no se parecen a la realidad).

> [!consejo] Escribe las evals antes del prompt
> Si no sabes qué casos debe resolver, tampoco sabes qué prompt escribir. Lo argumenta [[blog/2026-09-10-evals-antes-que-prompts]].

## Cómo empezar mañana

1. Exporta 20 entradas reales de tus logs. Si no tienes producción, escríbelas con alguien que conozca el dominio.
2. Para cada una, escribe en una línea qué debería pasar.
3. Escribe un grader de código para lo que se pueda comprobar con código, y deja el resto para una rúbrica ([[recetas/modelo-juez-con-rubrica]]).
4. Ejecuta, guarda la nota en un archivo y conviértela en tu línea base.
5. A partir de ahí, ningún cambio entra sin ejecutar la suite.

## Para seguir

- [[roadmap/80-evals/index]]: el nivel del roadmap.
- [[cursos/evals-para-agentes/index]]: evals específicas de agentes.
- [[docs/evals/02-modelo-como-juez]]
- [[biblioteca/demystifying-evals]]
