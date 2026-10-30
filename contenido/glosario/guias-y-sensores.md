---
titulo: Guías y sensores
descripcion: Los dos tipos de control de un harness, los que orientan al agente antes de actuar y los que le devuelven feedback después.
creado: 2026-10-29
categoria: agentes
ingles: Feedforward and feedback controls
aliases: [guides and sensors, feedforward, feedback, controles del harness]
tags: [harness, agentes]
relacionados: ["[[glosario/harness-engineering]]", "[[disciplinas/harness-engineering]]", "[[roadmap/90-harness/02-las-piezas-de-un-harness]]"]
---

Guías y sensores es la forma en que Birgitta Böckeler ([*Harness engineering for coding agent users*, abr. 2026](https://martinfowler.com/articles/harness-engineering.html)) clasifica los controles de un [[glosario/harness]]. Las **guías** (*feedforward*) actúan antes: aumentan la probabilidad de que el agente acierte a la primera. Los **sensores** (*feedback*) actúan después: le dicen qué ha salido mal para que se corrija antes de que llegue a un humano.

## En la práctica

Guías: la spec, `AGENTS.md` como índice corto, ejemplos, [[glosario/skill|skills]]. Sensores: tests, linters, comprobaciones de tipos, [[glosario/aceptacion-ejecutable]] y revisión con un [[glosario/modelo-juez]]. Böckeler añade un segundo eje: **computacionales** (deterministas, baratos y rápidos) frente a **inferenciales** (un modelo revisa; caros y no deterministas, úsalos donde lo determinista no llega). Un sensor gana mucho si su mensaje de error incluye cómo arreglarlo. Y cada vez que un fallo se repite, mejora una guía o añade un sensor.

## No confundir con

- **[[glosario/guardrails]]**: filtran entradas o salidas en producción; guías y sensores ayudan al agente a hacer bien la tarea.

## Ver también

- [[disciplinas/harness-engineering]]
- [[roadmap/90-harness/02-las-piezas-de-un-harness]]
- [[glosario/hook]]
- [[cursos/harness-engineering/12-probar-y-evolucionar-el-harness]]
