---
titulo: Arize Phoenix
descripcion: Herramienta autoalojable de trazas y evals para aplicaciones con LLM sobre OpenTelemetry y OpenInference, con licencia Elastic 2.0.
creado: 2026-10-29
tags: [observabilidad, trazas, opentelemetry, evals]
relacionados: ["[[docs/modelos-abiertos/07-observabilidad-abierta]]", "[[herramientas/langfuse]]", "[[docs/produccion/04-opentelemetry-genai]]"]
categoria: observabilidad
licencia: Elastic-2.0
open_source: false
lenguajes: [Python, TypeScript]
url: https://arize.com/docs/phoenix/
repositorio: https://github.com/Arize-ai/phoenix
version: "20.27.0"
revisado: 2026-10-29
---

Arize Phoenix es un servidor de trazas y evals para aplicaciones con LLM. Recibe *spans* OpenTelemetry con las convenciones OpenInference, los muestra en una interfaz web (por defecto en `http://localhost:6006`) y permite evaluar respuestas y recuperaciones. Se arranca con `phoenix serve`, con Docker (`arizephoenix/phoenix`) o con Helm.

**Licencia.** El servidor usa **Elastic License 2.0**, que no es una licencia OSI aunque el README hable de «open-source»: permite usarlo y autoalojarlo, pero restringe ofrecerlo como servicio gestionado a terceros. Por eso esta ficha lo marca como no open source. El paquete de instrumentación `arize-phoenix-otel` sí es Apache-2.0.

## Para qué sirve

- Ver en local las trazas de un agente o un [[glosario/rag]] mientras desarrollas, sin cuenta en ningún servicio.
- Instrumentar automáticamente OpenAI, Anthropic, LangChain/LangGraph, LlamaIndex, LiteLLM, Ollama y otros con los instrumentadores OpenInference.
- Evaluar la calidad de las respuestas sobre las trazas guardadas.

## Cuándo usarla

En desarrollo y en equipos que autoalojan su observabilidad para uso interno, sobre todo si ya trabajas con OpenTelemetry.

## Cuándo no

- Si vas a ofrecer la observabilidad como servicio a clientes: la ELv2 lo impide; revisa la licencia o usa otra opción.
- Si tu política exige licencias OSI: [[herramientas/langfuse]] (núcleo MIT) u OpenLLMetry (Apache-2.0).

## Ejemplo mínimo

Ejecutado con `arize-phoenix-otel` 0.17.2 (en un entorno aparte del de comprobación de la web, por eso el bloque no se valida automáticamente). Sin servidor, el código corre igual; con `phoenix serve` arrancado, las trazas aparecen en la interfaz.

```bash
pip install arize-phoenix arize-phoenix-otel
phoenix serve          # UI y colector en http://localhost:6006
```

```python nocheck title="trazas_phoenix.py"
from phoenix.otel import register

tracer_provider = register(project_name="agente-local", endpoint="http://localhost:6006/v1/traces")
tracer = tracer_provider.get_tracer(__name__)

@tracer.tool
def buscar_pedido(pedido_id: str) -> dict:
    return {"pedido_id": pedido_id, "estado": "enviado"}

@tracer.agent
def agente(pregunta: str) -> str:
    datos = buscar_pedido("A-123")
    return f"Tu pedido {datos['pedido_id']} está {datos['estado']}."

print(agente("¿Cómo va mi pedido A-123?"))
```

`register()` usa por defecto un `SimpleSpanProcessor` (exporta cada *span* al momento) y avisa de que en producción conviene `batch=True`. Con `auto_instrument=True` instrumenta las bibliotecas que tengan su instrumentador OpenInference instalado (por ejemplo, `openinference-instrumentation-openai`). Además de `.tool` y `.agent`, hay `.chain` y `.llm`. Variables útiles: `PHOENIX_COLLECTOR_ENDPOINT`, `PHOENIX_PROJECT_NAME` y `PHOENIX_API_KEY`.

## Alternativas

- [[herramientas/langfuse]]: trazas, *prompts* y datasets; SDK MIT.
- OpenLLMetry (Apache-2.0): instrumentación OTel para cualquier *backend*.
- Un *backend* OTel genérico con las [[glosario/convenciones-genai-otel]] ([[radar/2026-10-26-otel-genai-repositorio-propio]]).

## Enlaces

- Documentación: [arize.com/docs/phoenix](https://arize.com/docs/phoenix/)
- Repositorio: [github.com/Arize-ai/phoenix](https://github.com/Arize-ai/phoenix)
