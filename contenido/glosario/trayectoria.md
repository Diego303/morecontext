---
titulo: Trayectoria
descripcion: Secuencia completa de pasos de un agente en una tarea, con sus llamadas a herramientas, resultados y respuestas intermedias.
creado: 2026-09-12
actualizado: 2026-10-29
categoria: evals
ingles: trajectory
aliases: [trajectory, traza del agente, recorrido del agente]
tags: [evals, agentes]
relacionados: ["[[roadmap/80-evals/04-evals-de-trayectoria]]", "[[roadmap/40-primer-agente/06-depurar-con-trazas]]"]
---

La trayectoria de un [[glosario/agente]] es el registro ordenado de todo lo que hizo para resolver una tarea: cada llamada al modelo, cada herramienta que pidió con sus argumentos, cada resultado que recibió y la respuesta final. Dos agentes pueden llegar a la misma respuesta por caminos muy distintos en coste, riesgo y fiabilidad.

## En la práctica

Evaluar la trayectoria responde preguntas que la respuesta final oculta: ¿usó la herramienta correcta?, ¿repitió búsquedas?, ¿intentó una acción prohibida?, ¿cuántos pasos y tokens gastó? Combina comprobaciones con código (herramientas obligatorias o vetadas, número máximo de pasos) con un [[glosario/modelo-juez]] para criterios como «buscó antes de afirmar». Para tener trayectorias que evaluar necesitas [[glosario/observabilidad]]: guarda cada paso con su entrada, su salida y su `usage`, idealmente con las [[glosario/convenciones-genai-otel]]. Leer un centenar de trayectorias y clasificar sus fallos ([[glosario/analisis-de-errores]]) es el mejor punto de partida para decidir qué medir. En LangGraph, `get_state_history` te devuelve cada paso de un hilo.

## No confundir con

- **Evaluación del resultado final**: mira solo qué respondió el agente, no cómo llegó.

## Ver también

- [[roadmap/80-evals/04-evals-de-trayectoria]]
- [[roadmap/40-primer-agente/06-depurar-con-trazas]]
- [[cursos/evals-para-agentes/01-que-medir]]
- [[blog/2026-07-15-como-leer-una-traza]]
- [[recetas/analisis-de-errores-de-trazas]]
