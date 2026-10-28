---
titulo: Salida estructurada
descripcion: Respuesta del modelo en un formato definido, normalmente JSON que cumple un esquema, lista para procesarla con código.
creado: 2026-08-11
categoria: prompting
ingles: structured outputs
aliases: [structured outputs, salidas estructuradas, salida JSON]
tags: [prompting, api]
relacionados: ["[[docs/prompting/03-salida-estructurada]]", "[[modelos/03-formato-y-salidas-estructuradas]]"]
---

Una salida estructurada es una respuesta con forma fija (normalmente JSON que cumple un JSON Schema) en lugar de texto libre, para que tu código pueda leerla sin adivinar. Puede pedirse con instrucciones y ejemplos, o garantizarse con la API.

## En la práctica

En la API de Anthropic, `output_config={"format": {"type": "json_schema", "schema": {...}}}` devuelve JSON válido según el esquema en el bloque de texto. Para herramientas, `strict: True` garantiza que los argumentos cumplen el `input_schema`. Con Pydantic, `client.messages.parse(..., output_format=MiModelo)` te da `.parsed_output`. Hay limitaciones: sin esquemas recursivos ni restricciones numéricas o de longitud, y `additionalProperties` debe ser `false`. El esquema garantiza la forma, no que el contenido sea correcto: sigue validando valores en tu código.

## No confundir con

- **[[glosario/function-calling]]**: el modelo pide ejecutar algo. Aquí solo devuelve datos con forma.

## Ver también

- [[docs/prompting/03-salida-estructurada]]
- [[roadmap/10-prompting/03-formato-de-salida]]
- [[recetas/extraer-facturas-a-json]]
- [[sistemas/extraccion-documental]]
