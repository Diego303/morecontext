---
titulo: Orquestador
descripcion: Agente o componente que divide una tarea, reparte las partes entre subagentes o trabajadores y combina sus resultados.
creado: 2026-09-03
categoria: agentes
ingles: orchestrator
aliases: [orchestrator, agente orquestador, agente principal]
tags: [agentes, multiagente]
relacionados: ["[[patrones/06-orquestador-trabajadores]]", "[[roadmap/60-multiagente/02-orquestador-y-subagentes]]"]
---

El orquestador es la pieza que coordina un sistema con varios modelos: analiza la tarea, decide en qué partes dividirla, encarga cada parte a un [[glosario/subagente]] o trabajador y sintetiza lo que le devuelven. A diferencia de un pipeline fijo, la división la decide el modelo según la tarea concreta.

## En la práctica

Para el orquestador, cada subagente es una herramienta más: la llama con una instrucción y recibe un resultado resumido. Su trabajo más difícil es escribir buenos encargos (objetivo, formato de respuesta, límites, qué no repetir), porque el subagente solo sabe lo que le cuentan. Es útil cuando las subtareas son independientes y se pueden paralelizar, como investigar varias fuentes a la vez; en tareas muy secuenciales, suele salir más caro que un solo agente.

## Ver también

- [[patrones/06-orquestador-trabajadores]]
- [[roadmap/60-multiagente/02-orquestador-y-subagentes]]
- [[sistemas/investigacion-multiagente]]
- [[roadmap/60-multiagente/01-cuando-no-usar-multiagente]]
- [[disciplinas/orquestador-y-subagentes]]
