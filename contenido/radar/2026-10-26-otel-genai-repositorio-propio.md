---
titulo: Las convenciones GenAI de OpenTelemetry se independizan
descripcion: Las convenciones gen_ai.* de OpenTelemetry pasan a su propio repositorio y siguen en estado Development, así que fija versiones antes de construir paneles sobre ellas.
creado: 2026-10-26
categoria: herramientas
tags: [observabilidad, opentelemetry, produccion]
fuente:
  titulo: "OpenTelemetry · Semantic Conventions for Generative AI (repositorio)"
  url: https://github.com/open-telemetry/semantic-conventions-genai
relacionados: ["[[docs/produccion/04-opentelemetry-genai]]", "[[glosario/convenciones-genai-otel]]", "[[disciplinas/observabilidad]]", "[[docs/produccion/01-observabilidad]]"]
---

## Qué es

Las [[glosario/convenciones-genai-otel|convenciones semánticas GenAI]] de OpenTelemetry definen cómo nombrar spans y atributos de llamadas a modelos, agentes y herramientas: `invoke_agent`, `chat`, `execute_tool`, `gen_ai.usage.input_tokens`… Con la versión 1.42.0 (junio de 2026) salieron del repositorio principal de convenciones a uno propio, `open-telemetry/semantic-conventions-genai`, que incluye también las de MCP y las específicas de proveedores. Las páginas antiguas de opentelemetry.io son ahora avisos de traslado, y el paquete de Python `opentelemetry-semantic-conventions` marca sus constantes `gen_ai.*` como trasladadas. Todo sigue en estado *Development*: ningún atributo `gen_ai.*` es estable, y el repositorio nuevo aún no publica versiones etiquetadas.

## Qué cambia en la práctica

- Las convenciones de agentes evolucionan a su ritmo, separadas del resto. Habrá cambios.
- Ya hay renombres que rompen paneles: `gen_ai.system` pasó a `gen_ai.provider.name`, y `gen_ai.prompt`/`gen_ai.completion` desaparecieron.
- El contenido de prompts y respuestas es opt-in, y cada instrumentación lo activa a su manera.
- Las herramientas ya emiten telemetría con estos nombres; el SDK de Anthropic 2.x, por ejemplo, crea un span por llamada si hay un proveedor de trazas registrado.

## Qué hacer

1. Usa los nombres `gen_ai.*` actuales, pero fija la versión de cada instrumentación y lee su changelog antes de actualizar.
2. Lo que no esté en la convención, en tu propio espacio de atributos (`app.*`).
3. Instrumenta un bucle a mano para entender el árbol: [[docs/produccion/04-opentelemetry-genai]].
