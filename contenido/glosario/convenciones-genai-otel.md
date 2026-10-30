---
titulo: Convenciones GenAI de OpenTelemetry
descripcion: Los nombres estándar de spans, atributos y métricas gen_ai.* para trazar llamadas a modelos, herramientas y agentes con OpenTelemetry.
creado: 2026-10-29
categoria: produccion
ingles: OpenTelemetry GenAI semantic conventions
aliases: [OTel GenAI, gen_ai, GenAI semantic conventions, semconv GenAI]
tags: [observabilidad, produccion]
relacionados: ["[[docs/produccion/04-opentelemetry-genai]]", "[[glosario/observabilidad]]", "[[radar/2026-10-26-otel-genai-repositorio-propio]]"]
---

Las convenciones semánticas GenAI de OpenTelemetry fijan cómo se llaman los spans, atributos y métricas cuando trazas aplicaciones con LLM y agentes, para que cualquier backend entienda las trazas de cualquier biblioteca. Siguen en desarrollo (estado *Development*) y desde junio de 2026 viven en su propio [repositorio](https://github.com/open-telemetry/semantic-conventions-genai), que incluye también convenciones para MCP.

## En la práctica

El árbol típico de un agente es `invoke_agent` → `chat` (una por llamada al modelo) → `execute_tool` (una por herramienta); un subagente anida otro `invoke_agent`. Algunos atributos habituales: `gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens` y `gen_ai.response.finish_reasons`. El contenido de prompts y respuestas (`gen_ai.input.messages`, `gen_ai.output.messages`) solo se captura si lo activas, por privacidad ([OpenTelemetry, may. 2026](https://opentelemetry.io/blog/2026/genai-observability/)). Como los nombres aún cambian entre versiones, fija la versión de tu instrumentación y añade el coste calculado como atributo propio.

## No confundir con

- **Una plataforma de trazas** (Langfuse, Phoenix…): las convenciones son el vocabulario; la plataforma guarda y muestra los datos.

## Ver también

- [[docs/produccion/04-opentelemetry-genai]]
- [[roadmap/100-produccion/01-observabilidad-y-trazas]]
- [[docs/modelos-abiertos/07-observabilidad-abierta]]
- [[recetas/trazas-con-langfuse]]
