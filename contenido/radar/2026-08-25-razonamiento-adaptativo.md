---
titulo: El razonamiento pasa a ser adaptativo
descripcion: En los modelos actuales ya no fijas cuántos tokens puede pensar el modelo; activas el razonamiento adaptativo y regulas el esfuerzo.
creado: 2026-08-25
actualizado: 2026-10-29
categoria: modelos
tags: [razonamiento, effort, api]
fuente:
  titulo: Documentación de la API de Claude
  url: https://platform.claude.com/docs
relacionados: ["[[glosario/razonamiento-extendido]]", "[[glosario/esfuerzo]]", "[[docs/prompting/04-razonamiento]]", "[[modelos/04-dejar-pensar-al-modelo]]"]
---

## Qué es

El [[glosario/razonamiento-extendido|razonamiento extendido]] se configuraba con un presupuesto manual de tokens (`budget_tokens`). En la API de Claude, los modelos actuales usan **razonamiento adaptativo**: lo activas con `thinking={"type": "adaptive"}` y el modelo decide cuánto pensar según la dificultad. Tú lo orientas con el [[glosario/esfuerzo|esfuerzo]], `output_config={"effort": ...}`, con niveles de `low` a `max`. No todos los modelos aceptan todos los niveles; consulta la documentación.

```python
resp = client.messages.create(
    model=MODEL, max_tokens=16000,
    thinking={"type": "adaptive"},
    output_config={"effort": "medium"},
    messages=[{"role": "user", "content": pregunta}],
)
```

## Qué cambia en la práctica

- Dejas de afinar un número de tokens por tarea. Eliges un nivel de esfuerzo y mides.
- `effort` es orientativo. El límite duro de gasto sigue siendo [[glosario/max-tokens|max_tokens]].
- La respuesta puede traer bloques `thinking` además de `text`: tu código debe leer el contenido por tipo de bloque, no por posición.

## Qué hacer

1. Migra las llamadas con `budget_tokens` al modo adaptativo y revisa `max_tokens`.
2. Compara dos o tres niveles de esfuerzo con tu [[glosario/conjunto-de-evaluacion|conjunto de evaluación]]: calidad, latencia y coste.
3. Usa esfuerzo bajo en clasificación y extracción; súbelo en planificación y depuración. Detalles en [[docs/prompting/04-razonamiento]] y [[modelos/04-dejar-pensar-al-modelo]].

> [!nota] Actualización (oct. 2026)
> En los modelos 5.x, `budget_tokens` ya no es un modo antiguo que siga funcionando: **devuelve 400**. El razonamiento es adaptativo por defecto y en Opus 5.5 y Fable 5.1 no se puede desactivar; Sonnet 5.5 ofrece además `{"type": "between_tools"}`. Los bloques `thinking` llegan vacíos salvo que pidas `display: "summarized"`, y el esfuerzo por defecto cambia según el modelo (`medium` en Opus 5.5 y Haiku 5.5, `high` en Sonnet 5.5 y Fable 5.1). Dentro de un turno con herramientas, devuelve los bloques `thinking` sin tocar. Referencia vigente en [[docs/prompting/04-razonamiento]] y [[glosario/esfuerzo]].
