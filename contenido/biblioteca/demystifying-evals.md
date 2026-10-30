---
titulo: Demystifying evals for AI agents (Anthropic, 2026)
descripcion: "La guía de Anthropic para evaluar agentes: vocabulario común, tipos de graders, capacidad frente a regresión, pass@k frente a pass^k y una hoja de ruta que empieza con 20 a 50 tareas."
creado: 2026-10-29
tags: [biblioteca, evals, agentes, graders]
relacionados: ["[[cursos/evals-para-agentes/01-que-medir]]", "[[cursos/evals-para-agentes/03-graders]]", "[[glosario/pass-k]]", "[[disciplinas/evals]]"]
autores: Grace, Hadfield, Olivares y De Jonghe (Anthropic)
anio: 2026
url: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
tipo: ensayo
tema: evals
nivel: intermedio
---

*Demystifying evals for AI agents* (Mikaela Grace y otros tres autores, Anthropic, 9 de enero de 2026) es una de las guías de referencia para evaluar agentes. Parte de un diagnóstico conocido: sin [[glosario/evals|evals]], los equipos descubren los problemas en producción, arreglan uno y rompen otro, y cuando los usuarios dicen que el agente ha empeorado van «flying blind». El texto ordena el vocabulario, compara formas de calificar y propone una hoja de ruta de cero a uno.

## La idea clave

Lo primero que aporta es un vocabulario común, que conviene adoptar tal cual:

- **Tarea**: una prueba con entradas y criterio de éxito definidos.
- **Ensayo** (*trial*): un intento de una tarea. Se lanzan varios porque la salida varía.
- **Grader**: la lógica que puntúa un aspecto del resultado; una tarea puede tener varios.
- **Transcripción**: el registro completo del ensayo, con llamadas a herramientas y razonamiento. Es la [[glosario/trayectoria|trayectoria]].
- **Resultado** (*outcome*): el estado final del entorno. Si la reserva existe en la base de datos, no si el agente dijo que la hizo.
- **Arnés de evaluación** y **arnés del agente**: cuando evalúas «un agente», evalúas modelo y [[glosario/harness|harness]] juntos.

Sobre ese vocabulario, tres distinciones:

1. **Graders de código, de modelo y humanos.** El código es rápido, barato y reproducible, pero frágil ante variaciones válidas. El modelo es flexible, pero no determinista y hay que calibrarlo contra personas. Las personas son el patrón oro, caro y lento.
2. **Capacidad frente a regresión.** Una eval de capacidad empieza con tasa baja y da «una colina que subir». Una de regresión debería estar cerca del 100 %. Cuando una eval de capacidad se satura, se «gradúa» a la suite de regresión.
3. **pass@k frente a pass^k.** pass@k es la probabilidad de al menos un acierto en k intentos; pass^k, la de que acierten los k. Con un 75 % de acierto por ensayo, pass^3 queda en torno al 42 %, [según el artículo](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents). Para un agente de cara al cliente, lo que importa es pass^k.

## Por qué importa hoy

Porque la hoja de ruta es aplicable mañana. Los pasos que más cambian la práctica:

- **Empieza pronto y pequeño.** De 20 a 50 tareas sencillas sacadas de fallos reales son un buen comienzo; al principio los cambios tienen efectos grandes y se ven con pocas muestras.
- **Tareas sin ambigüedad.** Una buena tarea es aquella en la que dos expertos llegan por separado al mismo veredicto, con una solución de referencia que prueba que se puede resolver. Un 0 % en muchos ensayos suele indicar una tarea rota.
- **Conjuntos equilibrados.** Prueba también cuándo el agente *no* debe hacer algo. En la búsqueda web de Claude.ai tuvieron que equilibrar no buscar cuando hacía falta y buscar cuando sobraba.
- **Entorno limpio por ensayo.** En un caso, Claude miró el historial de git de ensayos anteriores y sacó ventaja.
- **Califica lo producido, no el camino exacto**, con crédito parcial y una opción «Unknown» para el juez.
- **Lee las transcripciones.** El ejemplo de CORE-Bench lo muestra: Opus 4.5 pasó de un 42 % a cerca del 95 % al arreglar una calificación rígida (penalizaba «96.12» frente a «96.124991…»), especificaciones ambiguas y un andamiaje demasiado restrictivo. Los fallos deben parecer justos.

> [!consejo] El queso suizo
> El texto compara evals automáticas, monitorización en producción, A/B, feedback de usuarios, revisión de transcripciones y estudios con personas, y lo resume con el modelo del queso suizo: ninguna capa lo atrapa todo; juntas, cubren más.

## Qué leer primero

1. **«The structure of an evaluation»**: el vocabulario.
2. **«Types of graders for agents»** y **«Capability vs. regression evals»**: la tabla de graders y la distinción clave.
3. **«Going from zero to one»**: los pasos 0 a 8. Es la parte para imprimir.
4. La sección por tipo de agente (código, conversacional, investigación, uso del ordenador) que se parezca al tuyo.

## Qué ha envejecido

Tiene meses, así que poco. Dos cosas que vigilar:

- **Los benchmarks citados** se mueven deprisa. El texto usa SWE-bench Verified como ejemplo de saturación, y en febrero de 2026 OpenAI dejó de reportarlo por defectos en las tareas y contaminación. Lo cuenta [[docs/evals/03-benchmarks-publicos]].
- **El apéndice de frameworks** (Harbor, Braintrust, LangSmith, Langfuse, Arize) cambiará. Su consejo sí perdura: elige uno rápido y dedica el esfuerzo a tareas y graders. Ojo con la licencia: LangSmith es comercial; [[herramientas/langfuse]] y [[herramientas/arize-phoenix]] son open source.

Para validar el juez con más rigor, la guía se complementa con el análisis de errores y las etiquetas binarias de Hamel Husain y Shreya Shankar, que ves en [[recetas/validar-un-modelo-juez]].

## Dónde lo ves en MoreContext

- [[cursos/evals-para-agentes/01-que-medir]], [[cursos/evals-para-agentes/02-datasets-de-evaluacion]], [[cursos/evals-para-agentes/03-graders]] y [[cursos/evals-para-agentes/04-evals-en-el-dia-a-dia]]: el curso que desarrolla cada idea.
- [[glosario/pass-k]]: las dos métricas, con su cálculo.
- [[roadmap/80-evals/04-evals-de-trayectoria]]: transcripciones y resultado final.
- [[roadmap/80-evals/05-regresiones-en-ci]] y [[recetas/evals-de-regresion-en-ci]]: la suite de regresión en CI.
- [[recetas/analisis-de-errores-de-trazas]]: leer transcripciones con método.
- [[biblioteca/llm-as-a-judge]]: de dónde vienen los sesgos del juez.
