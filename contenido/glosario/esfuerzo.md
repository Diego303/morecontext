---
titulo: Esfuerzo (effort)
descripcion: Parámetro que orienta cuánto razonamiento y cuántos tokens dedica el modelo a una respuesta, de bajo a máximo.
creado: 2026-08-26
actualizado: 2026-10-29
categoria: prompting
ingles: effort
aliases: [effort, nivel de esfuerzo]
tags: [prompting, razonamiento, costes]
relacionados: ["[[docs/prompting/04-razonamiento]]", "[[modelos/04-dejar-pensar-al-modelo]]"]
---

El esfuerzo es un ajuste de la API que indica al modelo cuánto trabajo dedicar a una respuesta: cuánto razonar, con cuánto detalle responder y cuántas llamadas a herramientas hacer. Más esfuerzo suele dar mejores resultados en tareas difíciles a cambio de más tokens y [[glosario/latencia]].

## En la práctica

Se pasa en `output_config={"effort": "medium"}` con valores `"low"`, `"medium"`, `"high"`, `"xhigh"` o `"max"`; no todos los modelos aceptan todos los niveles. El valor por defecto cambia por modelo: `medium` en Opus 5.5 y Haiku 5.5, `high` en Sonnet 5.5 y Fable 5.1. En los modelos 5.x es la forma de regular cuánto razona el modelo con el [[glosario/razonamiento-extendido]] adaptativo: el presupuesto fijo `budget_tokens` devuelve 400. Es orientativo: el modelo lo interpreta, pero no garantiza un número de tokens. El límite duro sigue siendo [[glosario/max-tokens]]. Empieza por el valor por defecto y mide con tus [[glosario/evals]]: baja el esfuerzo en tareas sencillas y de mucho volumen, y súbelo donde los errores salgan caros. Cambiar el esfuerzo de nivel superior entre llamadas invalida la caché; en beta se puede cambiar por mensaje con un [[glosario/mensaje-de-sistema-intermedio]]. Otros proveedores y modelos abiertos tienen un ajuste parecido (`reasoning_effort` y similares), con niveles que cambian de nombre según la familia.

## No confundir con

- **[[glosario/temperatura]]**: controla la aleatoriedad del muestreo, no cuánto piensa el modelo.
- **`budget_tokens`**: el modo antiguo de fijar un presupuesto exacto de razonamiento; devuelve 400 en los modelos 5.x.
- **[[glosario/presupuesto-de-tarea]]**: un total orientativo de tokens para toda una tarea de agente, no para una respuesta.

## Ver también

- [[docs/prompting/04-razonamiento]]
- [[modelos/04-dejar-pensar-al-modelo]]
- [[modelos/06-parametros]]
- [[radar/2026-08-25-razonamiento-adaptativo]]
