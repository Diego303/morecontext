---
titulo: Harness
descripcion: Todo lo que rodea al modelo en un agente, desde instrucciones y herramientas hasta permisos, estado, verificación y orquestación.
creado: 2026-10-29
categoria: agentes
ingles: Agent harness
aliases: [Arnés, arnés de agente, agent harness, harness de agente]
tags: [agentes, harness]
relacionados: ["[[roadmap/90-harness/01-que-es-un-harness]]", "[[glosario/harness-engineering]]", "[[cursos/harness-engineering/index]]", "[[disciplinas/harness-engineering]]"]
---

El harness (en español, arnés) es todo lo que hay en un [[glosario/agente]] salvo el modelo: el bucle, las instrucciones, las herramientas y sus permisos, el entorno donde se ejecutan, el estado que se guarda, los límites de pasos y gasto, la verificación y la orquestación. La fórmula que más se cita es **agente = modelo + harness**.

## En la práctica

El mismo modelo rinde muy distinto según su harness. Claude Code, Codex o Deep Agents son harness; el bucle de cuarenta líneas que escribes en el roadmap también lo es, solo que mínimo. Cuando un agente falla, pregúntate primero si falta una pieza del harness (un test que lo avise, una regla de permisos, un archivo de progreso) antes de culpar al modelo. El harness SDD del autor es un ejemplo completo: un orquestador, cuatro subagentes, un motor de estado, hooks de seguridad y una [[glosario/puerta-humana]].

## No confundir con

- **[[glosario/framework-de-agentes]]**: una biblioteca con la que puedes construir un harness. El estudio de once harness de código de [Barbaste et al.](https://arxiv.org/abs/2609.00006) (julio de 2026) observó que ninguno importa un framework genérico.
- **[[glosario/harness-engineering]]**: la disciplina de diseñarlo y mejorarlo.

## Ver también

- [[roadmap/90-harness/02-las-piezas-de-un-harness]]
- [[cursos/harness-engineering/03-las-quince-piezas]]
- [[sistemas/harness-sdd-claude-code]]
- [[glosario/bucle-agentico]]
