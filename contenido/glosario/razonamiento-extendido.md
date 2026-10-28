---
titulo: Razonamiento extendido
descripcion: Modo en el que el modelo genera un razonamiento interno antes de la respuesta final, a cambio de más tokens y latencia.
creado: 2026-08-25
categoria: prompting
ingles: extended thinking
aliases: [extended thinking, thinking, razonamiento adaptativo, pensamiento extendido]
tags: [prompting, razonamiento]
relacionados: ["[[docs/prompting/04-razonamiento]]", "[[modelos/04-dejar-pensar-al-modelo]]"]
---

El razonamiento extendido es un modo de la API en el que el modelo escribe un razonamiento propio (bloques `thinking`) antes de dar la respuesta. Le sirve para planificar, comprobar pasos y corregirse en tareas de varios pasos: matemáticas, código, análisis o decisiones de un agente.

## En la práctica

En los modelos actuales se activa con `thinking={"type": "adaptive"}`: el modelo decide cuánto pensar según la dificultad, y tú lo orientas con el [[glosario/esfuerzo]] en `output_config={"effort": ...}`. El presupuesto fijo `budget_tokens` es el modo antiguo. Los tokens de razonamiento se facturan como salida y cuentan dentro de [[glosario/max-tokens]]. En un [[glosario/bucle-agentico]], devuelve los bloques `thinking` tal cual en el turno del asistente junto a los `tool_use`.

## No confundir con

- **[[glosario/cadena-de-pensamiento]]**: técnica de prompting que pide razonar en el texto visible. El razonamiento extendido es una función del modelo y de la API.

## Ver también

- [[docs/prompting/04-razonamiento]]
- [[modelos/04-dejar-pensar-al-modelo]]
- [[radar/2026-08-25-razonamiento-adaptativo]]
- [[glosario/latencia]]
