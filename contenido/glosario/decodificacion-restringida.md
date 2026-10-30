---
titulo: Decodificación restringida
descripcion: Técnica del motor de inferencia que, en cada token, descarta los que romperían un esquema o una gramática, para que la salida tenga siempre el formato pedido.
creado: 2026-10-29
categoria: prompting
ingles: Constrained decoding
aliases: [constrained decoding, salidas estructuradas garantizadas, guided decoding]
tags: [prompting, salida-estructurada, modelos-abiertos]
relacionados: ["[[glosario/salida-estructurada]]", "[[docs/prompting/03-salida-estructurada]]", "[[problemas/json-invalido-del-modelo]]", "[[docs/modelos-abiertos/02-vllm-y-llama-cpp]]"]
---

La decodificación restringida limita, token a token, lo que el modelo puede generar: el motor calcula qué tokens mantienen la salida dentro de un JSON Schema, una lista de opciones o una gramática, y descarta el resto antes de elegir. El resultado cumple el formato por construcción, sin depender de que el modelo «obedezca».

## En la práctica

En modelos abiertos lo activas en el servidor: en vLLM con `response_format` de tipo `json_schema` o `structured_outputs` (por ejemplo, una lista `choice`); en Ollama con `format` y un JSON Schema; en `llama-server` con `-j/--json-schema`. En la API de Claude pides el mismo resultado con `output_config.format` o con `strict: true` en una herramienta.

Garantiza la forma, no el contenido. La documentación de vLLM lo resume al hablar de forzar herramientas: asegura una llamada que se puede parsear, no una buena. Sigue validando los valores en tu código y evalúa la calidad aparte. Y prefiere esquemas simples: cada restricción que añades limita también lo que el modelo puede expresar.

## No confundir con

- **[[glosario/salida-estructurada]]**: el objetivo (una respuesta en un formato fijo); esta técnica es una forma de conseguirlo.
- **Pedir JSON en el prompt**: funciona casi siempre, pero nada lo garantiza.

## Ver también

- [[roadmap/10-prompting/03-formato-de-salida]]
- [[recetas/extraer-facturas-a-json]]
- [[glosario/tool-choice]]
