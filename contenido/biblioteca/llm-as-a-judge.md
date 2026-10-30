---
titulo: Judging LLM-as-a-Judge (Zheng et al., 2023)
descripcion: El paper que estudió en serio usar un LLM como juez, catalogó sus sesgos (posición, verbosidad, autopreferencia) y propuso cómo mitigarlos. Qué sigue vigente al evaluar agentes.
creado: 2026-10-29
tags: [biblioteca, evals, modelo-juez]
relacionados: ["[[glosario/modelo-juez]]", "[[docs/evals/02-modelo-como-juez]]", "[[recetas/validar-un-modelo-juez]]", "[[biblioteca/demystifying-evals]]"]
autores: Zheng et al.
anio: 2023
url: https://arxiv.org/abs/2306.05685
tipo: paper
tema: evals
nivel: intermedio
---

*Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena* (Zheng y colaboradores, junio de 2023) responde a un problema que apareció con los primeros asistentes de chat: los benchmarks clásicos de opción múltiple no medían lo que la gente valoraba de una conversación, y la evaluación humana era cara y lenta. La propuesta es usar un LLM fuerte como juez, y el paper se dedica sobre todo a comprobar cuándo se puede fiar uno de él.

## La idea clave

El trabajo presenta dos bancos de pruebas. **MT-Bench** es un conjunto de preguntas abiertas de varios turnos, pensadas para separar asistentes buenos de mediocres. **Chatbot Arena** es una plataforma en la que usuarios reales conversan con dos modelos anónimos a la vez y votan cuál responde mejor. Las dos fuentes dan preferencias humanas con las que comparar al juez.

Después estudia tres formas de usar un [[glosario/modelo-juez|modelo juez]]:

- **Comparación por pares**: «¿es mejor A o B?».
- **Puntuación de una respuesta** en una escala.
- **Calificación guiada por referencia**: el juez compara con una respuesta de referencia, útil en matemáticas.

**Lo que más ha perdurado es el catálogo de sesgos del juez**, con su mitigación:

| Sesgo | Qué pasa | Mitigación habitual |
|---|---|---|
| Posición | En pares, favorece una de las posiciones | Juzgar dos veces intercambiando el orden; empate si cambia |
| Verbosidad | Prefiere respuestas largas aunque no sean mejores | Criterios concretos; medir longitud aparte |
| Autopreferencia | Puede favorecer respuestas de su propio modelo | Calibrar con humanos; juez de otra familia |
| Razonamiento limitado | Falla al juzgar matemáticas o lógica | Darle la respuesta de referencia o comprobar con código |

El paper propone y mide dos mitigaciones: juzgar en los dos órdenes contra el sesgo de posición y el juez guiado por referencia contra el razonamiento limitado. La verbosidad y la autopreferencia las documenta; las mitigaciones de la tabla para esas dos son práctica habitual posterior.

La conclusión de los autores es que un juez fuerte, con GPT-4 en su caso, coincide con las preferencias humanas en más del 80 % de los casos, el mismo nivel de acuerdo que hay entre dos personas. Eso convirtió al juez en una herramienta aceptable para evaluar a escala, siempre que se controlen sus sesgos.

## Por qué importa hoy

Casi cualquier eval de un agente acaba teniendo un criterio que el código no puede comprobar: si la respuesta es fiel a la fuente, si el tono es correcto, si el agente explicó bien lo que hizo. Ahí entra un juez, y los sesgos de este paper son los que te vas a encontrar.

La práctica actual ha añadido rigor encima:

- **Calibrar siempre.** [[biblioteca/demystifying-evals]] insiste en calibrar los graders de modelo contra personas y en dar al juez una opción «Unknown».
- **Etiquetas binarias.** Hamel Husain y Shreya Shankar recomiendan veredictos de pasa o falla en lugar de escalas tipo Likert, y validar el juez midiendo sus tasas de verdaderos positivos y verdaderos negativos (TPR y TNR) frente a etiquetas humanas.
- **Un criterio por juez.** Si un juez evalúa cinco cosas a la vez, no sabrás cuál falló.

> [!aviso] El juez también se evalúa
> Un juez sin calibrar es una opinión automática. Si cambias de modelo juez o de rúbrica, tus números cambian aunque el sistema evaluado siga igual: registra ambas versiones junto a cada resultado.

## Qué leer primero

1. **La introducción**: el problema que motiva usar un juez.
2. **La parte sobre los sesgos y sus mitigaciones**: es la sección que más usarás.
3. **La comparación del acuerdo entre juez y humanos**: para entender qué significa «fiarse» de un juez.

Las tablas que comparan los asistentes de 2023 entre sí puedes hojearlas: los modelos han cambiado por completo.

## Qué ha envejecido

- **Lo que se evalúa.** El paper juzga respuestas de chat de un solo intercambio o de pocos turnos. Un agente produce trayectorias con llamadas a herramientas y cambios de estado; hoy se califica sobre todo el resultado final del entorno y se usa el juez para lo que el código no ve.
- **Las escalas numéricas.** Puntuar de 1 a 10 da números inestables; la práctica actual prefiere criterios binarios con anclas claras.
- **El ranking como referencia.** Clasificaciones generales como las de Chatbot Arena o MT-Bench no te dicen cómo rinde un modelo en tu tarea. Para elegir, construye tu propio [[glosario/conjunto-de-evaluacion|conjunto de evaluación]].

## Dónde lo ves en MoreContext

- [[docs/evals/02-modelo-como-juez]]: la referencia completa, con los sesgos y la calibración.
- [[roadmap/80-evals/03-codigo-o-modelo-juez]]: cuándo usar código y cuándo un juez.
- [[recetas/modelo-juez-con-rubrica]] y [[recetas/validar-un-modelo-juez]]: escribir el juez y validarlo con TPR y TNR.
- [[cursos/evals-para-agentes/03-graders]]: la comparación por pares con intercambio de orden, en código.
- [[docs/evals/03-benchmarks-publicos]] y [[glosario/contaminacion-de-benchmark]]: cómo leer los rankings públicos.
