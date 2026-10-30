---
titulo: Harness engineering
descripcion: Disciplina de diseñar el entorno, los controles y la verificación de un agente para que acierte a la primera y se corrija solo, y mejorarlo con cada fallo.
creado: 2026-10-29
categoria: agentes
ingles: Harness engineering
aliases: [ingeniería de harness, ingeniería del arnés]
tags: [agentes, harness, disciplinas]
relacionados: ["[[disciplinas/harness-engineering]]", "[[glosario/harness]]", "[[cursos/harness-engineering/index]]", "[[biblioteca/harness-engineering-openai]]"]
---

Harness engineering es diseñar todo lo que rodea al modelo, el [[glosario/harness]], para que un agente acierte más a menudo y detecte solo sus errores antes de que llegue una persona. Va más allá del prompt y del contexto: incluye herramientas, sandbox, tests, linters, hooks, verificadores, orquestación y el bucle de mejora del propio harness.

## En la práctica

El término cuajó en 2026 con [*Harness engineering*](https://openai.com/index/harness-engineering/) de OpenAI (febrero) y el artículo de [Birgitta Böckeler](https://martinfowler.com/articles/harness-engineering.html) (abril). Böckeler ordena las piezas en **guías** (actúan antes: specs, `AGENTS.md`, ejemplos) y **sensores** (actúan después: tests, linters, revisión), y cada una puede ser computacional, determinista y barata, o inferencial, como un [[glosario/modelo-juez]]. La regla de trabajo es el bucle de mejora: cada fallo que se repite se convierte en una guía o un sensor nuevo, y cada pieza que un modelo mejor hace innecesaria se retira. Mide también su coste: [Naresh Jain](https://martinfowler.com/articles/are-harnesses-worth-the-cost.html) (octubre de 2026) midió con un modelo frontera unas 10,5 veces más tokens y el triple de tiempo con el harness completo, y recomienda probar primero sin él.

## No confundir con

- **Prompt engineering**: redactar instrucciones.
- **[[disciplinas/context-engineering]]**: elegir qué tokens entran en cada llamada. Es una parte del harness.

## Ver también

- [[glosario/guias-y-sensores]]
- [[cursos/harness-engineering/01-del-prompt-al-harness]]
- [[cursos/harness-engineering/12-probar-y-evolucionar-el-harness]]
- [[roadmap/90-harness/index]]
