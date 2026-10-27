---
titulo: Esfuerzo (effort)
descripcion: Parámetro que orienta cuánto razonamiento y cuántos tokens dedica el modelo a una respuesta, de bajo a máximo.
creado: 2026-08-26
categoria: prompting
ingles: effort
aliases: [effort, nivel de esfuerzo]
tags: [prompting, razonamiento, costes]
relacionados: ["[[docs/prompting/04-razonamiento]]", "[[modelos/04-dejar-pensar-al-modelo]]"]
---

El esfuerzo es un ajuste de la API que indica al modelo cuánto trabajo dedicar a una respuesta: cuánto razonar, con cuánto detalle responder y cuántas llamadas a herramientas hacer. Más esfuerzo suele dar mejores resultados en tareas difíciles a cambio de más tokens y [[glosario/latencia]].

## En la práctica

Se pasa en `output_config={"effort": "medium"}` con valores `"low"`, `"medium"`, `"high"`, `"xhigh"` o `"max"`; no todos los modelos aceptan todos los niveles. Se usa junto a `thinking={"type": "adaptive"}` del [[glosario/razonamiento-extendido]]. Es orientativo: el modelo lo interpreta, pero no garantiza un número de tokens. El límite duro sigue siendo [[glosario/max-tokens]]. Empieza con un nivel medio y mide con tus [[glosario/evals]]: baja el esfuerzo en tareas sencillas y de mucho volumen, y súbelo donde los errores salgan caros.

## No confundir con

- **[[glosario/temperatura]]**: controla la aleatoriedad del muestreo, no cuánto piensa el modelo.
- **`budget_tokens`**: el modo antiguo de fijar un presupuesto exacto de razonamiento.

## Ver también

- [[docs/prompting/04-razonamiento]]
- [[modelos/04-dejar-pensar-al-modelo]]
- [[modelos/06-parametros]]
- [[radar/2026-08-25-razonamiento-adaptativo]]
