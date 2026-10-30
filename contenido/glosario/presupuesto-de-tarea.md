---
titulo: Presupuesto de tarea
descripcion: Un presupuesto orientativo de tokens para toda una tarea agéntica, que el modelo ve como cuenta atrás para administrar su trabajo.
creado: 2026-10-29
categoria: produccion
ingles: Task budget
aliases: [task budget, task_budget, presupuesto de tokens]
tags: [produccion, costes, api]
relacionados: ["[[glosario/max-tokens]]", "[[glosario/esfuerzo]]", "[[docs/produccion/02-costes-y-limites]]"]
---

El presupuesto de tarea es una cifra de tokens que le das al modelo para **toda** una tarea con varios pasos, no para una sola respuesta. El modelo ve una cuenta atrás y la usa para repartir el trabajo: explorar menos, resumir antes o cerrar cuando se acaba. Es **orientativo**: nada lo corta al llegar a cero.

## En la práctica

En la API de Claude está en beta (`task-budgets-2026-03-13`) y va dentro de `output_config`:

```python title="presupuesto.py"
output_config = {
    "effort": "medium",
    "task_budget": {"type": "tokens", "total": 64000},  # mínimo 20.000; admite también "remaining"
}
```

Funciona en Fable 5.1, Mythos 5.1, Opus 5.5, Opus 5, Fable 5, Mythos 5, Sonnet 5.5, Haiku 5.5, Opus 4.8 y Opus 4.7; no en Sonnet 5, Opus 4.6, Sonnet 4.6 ni en Claude Code. Para un tope duro sigue haciendo falta [[glosario/max-tokens]] por llamada y un límite de pasos en tu bucle.

## No confundir con

- **[[glosario/max-tokens]]**: límite duro de una sola respuesta; la API corta al llegar.
- **[[glosario/esfuerzo]]**: cuánto piensa el modelo en cada paso, no cuánto gasta en total.
- **`max_budget_usd`** del Claude Agent SDK: un tope en dólares que tu harness hace cumplir.

## Ver también

- [[roadmap/40-primer-agente/03-condiciones-de-parada]]
- [[cursos/harness-engineering/10-coste-y-presupuesto]]
- [[docs/produccion/02-costes-y-limites]]
