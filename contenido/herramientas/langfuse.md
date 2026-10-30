---
titulo: Langfuse
descripcion: Plataforma de observabilidad para aplicaciones con LLM, autoalojable, con trazas OpenTelemetry, gestión de prompts, datasets y evals.
creado: 2026-10-29
tags: [observabilidad, trazas, opentelemetry]
relacionados: ["[[recetas/trazas-con-langfuse]]", "[[docs/modelos-abiertos/07-observabilidad-abierta]]", "[[disciplinas/observabilidad]]", "[[glosario/convenciones-genai-otel]]"]
categoria: observabilidad
licencia: MIT
open_source: true
lenguajes: [Python, TypeScript]
url: https://langfuse.com
repositorio: https://github.com/langfuse/langfuse
version: "5.0.4"
revisado: 2026-10-29
---

Langfuse es una plataforma de [[glosario/observabilidad]] para aplicaciones con LLM: registra cada petición como una traza con sus pasos (llamadas al modelo, herramientas, recuperación), y añade gestión de *prompts*, datasets y evals. Se usa como servicio o se autoaloja. El **SDK de Python v5** (5.0.4) se basa en OpenTelemetry y es MIT, igual que el SDK de JavaScript (`@langfuse/tracing`). El servidor (`langfuse/langfuse`) es MIT, salvo las carpetas `ee/` (`ee/`, `web/src/ee/`, `worker/src/ee/` y `packages/shared/src/server/ee/`), que van bajo una licencia comercial aparte (el repositorio se define como *open core*). Por eso la ficha lo marca como open source: el núcleo lo es, y si dependes de funciones «ee», revisa su licencia antes de autoalojarlo en una empresa.

## Para qué sirve

- Ver la [[glosario/trayectoria]] completa de un agente: qué decidió, qué herramienta llamó, cuánto tardó y cuántos tokens gastó.
- Agrupar trazas por sesión y usuario para depurar conversaciones largas.
- Partir de trazas reales para el [[glosario/analisis-de-errores]] y construir datasets de evals ([[recetas/analisis-de-errores-de-trazas]]).

## Cuándo usarla

Cuando tu agente sale del notebook y necesitas responder «¿por qué hizo esto?» con datos. También si quieres que las trazas se queden en tu infraestructura, junto a un modelo local.

## Cuándo no

- Si ya tienes un *backend* OpenTelemetry y solo quieres las convenciones `gen_ai.*`: instrumenta con OTel directamente ([[docs/produccion/04-opentelemetry-genai]]).
- Si te encuentras tutoriales con `langfuse.trace()` o «SDK v3»: están desfasados; el cliente v2 está obsoleto y la versión actual es la 5.

## Ejemplo mínimo

Ejecutado con `langfuse` 5.0.4 **sin servidor**: sin `LANGFUSE_PUBLIC_KEY` el cliente avisa y se desactiva, y tu código sigue funcionando igual. Con las variables `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` y `LANGFUSE_BASE_URL`, las trazas llegan a tu instancia.

```python title="trazas_minimas.py"
from langfuse import get_client, observe, propagate_attributes

@observe(as_type="tool")
def buscar_pedido(pedido_id: str) -> dict:
    return {"pedido_id": pedido_id, "estado": "enviado"}  # tu sistema real

@observe(as_type="agent")
def agente(pregunta: str) -> str:
    with propagate_attributes(session_id="sesion-42", user_id="usuario-7"):
        datos = buscar_pedido("A-123")
        return f"Tu pedido {datos['pedido_id']} está {datos['estado']}."

print(agente("¿Cómo va mi pedido A-123?"))
get_client().flush()  # en scripts cortos, antes de salir
```

Los tipos de observación son `span`, `generation`, `embedding`, `agent`, `tool`, `chain`, `retriever`, `evaluator` y `guardrail`. Para registrar las llamadas al modelo sin tocar cada una, `from langfuse.openai import OpenAI` envuelve el cliente de OpenAI (vale también contra Ollama o vLLM). El ejemplo con un agente completo está en [[recetas/trazas-con-langfuse]].

> [!aviso] Datos sensibles en las trazas
> Las trazas guardan *prompts* y respuestas completas. Si hay datos personales o secretos, decide qué se registra y quién lo ve antes de activarlo en producción.

## Alternativas

- [[herramientas/arize-phoenix]]: trazas OpenInference/OTel y evals; licencia Elastic-2.0 (no OSI).
- OpenLLMetry (`traceloop-sdk`, Apache-2.0): solo instrumentación OTel, para enviar a cualquier *backend*.
- LangSmith: comercial, de LangChain.

## Enlaces

- Web y documentación: [langfuse.com](https://langfuse.com)
- SDK de Python: [langfuse.com/docs/observability/sdk/overview](https://langfuse.com/docs/observability/sdk/overview)
- Repositorio del SDK: [github.com/langfuse/langfuse-python](https://github.com/langfuse/langfuse-python)
- Repositorio de la plataforma: [github.com/langfuse/langfuse](https://github.com/langfuse/langfuse)
