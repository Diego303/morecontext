---
titulo: Disciplinas y formas de trabajar
descripcion: Las disciplinas transversales que sostienen un agente fiable y las formas de trabajar con IA en tu día a día, con prácticas concretas.
creado: 2026-07-10
orden: 7
tags: [disciplinas]
relacionados: ["[[patrones/index]]", "[[cursos/index]]", "[[sistemas/index]]"]
---

Hay cosas que no se aprenden en una lección porque atraviesan todo el trabajo: medir, observar, proteger, diseñar herramientas. Esta sección las reúne en dos bloques. Cada página dice qué es, por qué importa, qué prácticas concretas seguir, qué señales indican que lo haces mal y **cómo empezar mañana**.

## Disciplinas

Lo que un equipo debe cuidar en cualquier sistema con modelos.

- [[disciplinas/context-engineering]]: decidir qué entra en el contexto en cada paso.
- [[disciplinas/evals]]: medir la calidad de forma sistemática, antes y después de cada cambio.
- [[disciplinas/observabilidad]]: ver qué hizo el agente, cuánto costó y dónde falló.
- [[disciplinas/seguridad]]: tratar cada entrada externa como no confiable y limitar lo que puede hacer el agente.
- [[disciplinas/diseno-de-herramientas]]: herramientas que el modelo entiende y usa bien.
- [[disciplinas/ux-de-agentes]]: interfaces que muestran lo que pasa y dejan corregir.

## Formas de trabajar

Hábitos para trabajar con agentes, sobre todo con agentes de código.

- [[disciplinas/spec-primero]]: escribir qué quieres antes de pedirlo.
- [[disciplinas/pair-programming-con-agentes]]: repartir el trabajo con un agente sin perder el control.
- [[disciplinas/humano-en-el-bucle]]: dónde aprueba una persona y cómo hacerlo sin frenar todo.
- [[disciplinas/orquestador-y-subagentes]]: delegar búsquedas y subtareas para mantener limpio el contexto principal.
- [[disciplinas/explorar-planificar-implementar-verificar]]: un ciclo de cuatro fases para cambios no triviales.
- [[disciplinas/cambios-pequenos-y-revisables]]: entregas que una persona puede revisar de verdad.

## Cómo usar esta sección

No hace falta leerla en orden. Elige la disciplina que más te duela hoy y aplica una sola práctica. Si quieres profundizar, varias tienen un curso detrás: [[cursos/context-engineering/index]], [[cursos/evals-para-agentes/index]] y [[cursos/seguridad-y-prompt-injection/index]].
