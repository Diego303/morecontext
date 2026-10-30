---
titulo: Razonamiento extendido
descripcion: Modo en el que el modelo genera un razonamiento interno antes de la respuesta final, a cambio de más tokens y latencia.
creado: 2026-08-25
actualizado: 2026-10-29
categoria: prompting
ingles: extended thinking
aliases: [extended thinking, thinking, razonamiento adaptativo, pensamiento extendido]
tags: [prompting, razonamiento]
relacionados: ["[[docs/prompting/04-razonamiento]]", "[[modelos/04-dejar-pensar-al-modelo]]"]
---

El razonamiento extendido es un modo de la API en el que el modelo escribe un razonamiento propio (bloques `thinking`) antes de dar la respuesta. Le sirve para planificar, comprobar pasos y corregirse en tareas de varios pasos: matemáticas, código, análisis o decisiones de un agente.

## En la práctica

En los modelos 5.x de Claude es adaptativo por defecto (`thinking={"type": "adaptive"}`): el modelo decide cuánto pensar según la dificultad, y tú lo orientas con el [[glosario/esfuerzo]] en `output_config={"effort": ...}`. El presupuesto fijo `{"type": "enabled", "budget_tokens": N}` devuelve 400 en todos los modelos 5.x. En Opus 5.5 y Fable 5.1 no se puede desactivar; Sonnet 5.5 ofrece `{"type": "between_tools"}`, que sustituye a `disabled` y solo razona entre llamadas a herramientas. Por defecto el razonamiento no se muestra (`display: "omitted"`: el bloque `thinking` llega vacío, solo con su firma); para leerlo, pide `display: "summarized"`. Los tokens de razonamiento se facturan como salida y cuentan dentro de [[glosario/max-tokens]]. En un [[glosario/bucle-agentico]], devuelve los bloques `thinking` tal cual en el turno del asistente junto a los `tool_use`. Los modelos abiertos de razonamiento hacen lo mismo con su propio formato; en `ChatOllama`, el parámetro `reasoning` lo activa o lo desactiva.

## No confundir con

- **[[glosario/cadena-de-pensamiento]]**: técnica de prompting que pide razonar en el texto visible. El razonamiento extendido es una función del modelo y de la API.
- **[[glosario/modelo-de-razonamiento]]**: un modelo entrenado para razonar antes de responder. El razonamiento extendido es cómo la API expone y regula esa capacidad.

## Ver también

- [[docs/prompting/04-razonamiento]]
- [[modelos/04-dejar-pensar-al-modelo]]
- [[radar/2026-08-25-razonamiento-adaptativo]]
- [[glosario/latencia]]
- [[docs/fundamentos/05-versiones-de-api-y-sdks]]
