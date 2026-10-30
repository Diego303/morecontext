---
titulo: Salidas estructuradas garantizadas por esquema
descripcion: La API puede garantizar que la respuesta o los argumentos de una herramienta cumplen un JSON Schema; cambia cómo pides y validas JSON.
creado: 2026-08-11
actualizado: 2026-10-29
categoria: herramientas
tags: [salida-estructurada, json, api]
fuente:
  titulo: Documentación de la API de Claude
  url: https://platform.claude.com/docs
relacionados: ["[[glosario/salida-estructurada]]", "[[docs/prompting/03-salida-estructurada]]", "[[modelos/03-formato-y-salidas-estructuradas]]", "[[recetas/extraer-facturas-a-json]]"]
---

## Qué es

Pedir JSON en el prompt y rezar ya no es la única opción. En la API de Claude tienes dos mecanismos de [[glosario/salida-estructurada|salida estructurada]] con garantía de esquema:

- `output_config={"format": {"type": "json_schema", "schema": {...}}}`: la respuesta llega en el bloque de texto como JSON válido según el esquema.
- `strict: True` en la definición de una herramienta: los argumentos del `tool_use` cumplen su `input_schema`.

Con Pydantic, `client.messages.parse(..., output_format=MiModelo)` devuelve el objeto en `.parsed_output`.

## Qué cambia en la práctica

- Desaparecen los errores de parseo y los campos que faltan. Puedes quitar reintentos por «JSON roto».
- El esquema tiene limitaciones: sin esquemas recursivos, sin restricciones numéricas ni de longitud, y `additionalProperties` debe ser `false`.
- **Que el JSON sea válido no lo hace correcto.** Una fecha bien formada puede ser la fecha equivocada. La validación de negocio sigue en tu código.

## Qué hacer

1. Pasa tus extracciones a `output_config.format` y tus herramientas críticas a `strict`: [[docs/prompting/03-salida-estructurada]].
2. Mueve los rangos y longitudes que el esquema no admite a validación propia tras la respuesta.
3. Mantén ejemplos de salida en el prompt para guiar el contenido: [[modelos/03-formato-y-salidas-estructuradas]].
4. Practica con la receta [[recetas/extraer-facturas-a-json]] o el sistema [[sistemas/extraccion-documental]].

> [!nota] Actualización (oct. 2026)
> Las salidas estructuradas son GA en todos los modelos actuales. Dos matices a lo de arriba. Primero, la garantía vale para respuestas completas: con `stop_reason` `max_tokens` o `refusal` el JSON puede quedar a medias, así que comprueba la parada antes de parsear ([[problemas/json-invalido-del-modelo]]). Segundo, para obligar a entregar con una herramienta ya no sirve forzarla con `tool_choice` (400 en los modelos 5.5): usa `output_config.format` en el último paso, como en [[recetas/entregar-resultado-sin-forzar-herramienta]]. En LangChain, `with_structured_output(..., method="json_schema")`.
