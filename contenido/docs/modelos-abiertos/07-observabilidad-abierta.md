---
titulo: "Observabilidad abierta: Langfuse, Phoenix y OpenTelemetry"
descripcion: Cómo trazar un agente con herramientas abiertas (Langfuse SDK v5, Arize Phoenix, OpenLLMetry) sobre OpenTelemetry y los atributos gen_ai.*, con sus licencias exactas.
creado: 2026-10-29
orden: 7
nivel: intermedio
tags: [observabilidad, trazas, opentelemetry, langfuse, phoenix, modelos-abiertos]
relacionados: ["[[docs/produccion/04-opentelemetry-genai]]", "[[herramientas/langfuse]]", "[[herramientas/arize-phoenix]]", "[[recetas/trazas-con-langfuse]]"]
---

La [[glosario/observabilidad|observabilidad]] de un agente es poder reconstruir cada ejecución: qué llamadas hizo al modelo, con cuántos tokens, qué herramientas ejecutó y dónde falló. Las herramientas abiertas para esto ya hablan el mismo idioma, **OpenTelemetry**: tu código emite *spans* con atributos `gen_ai.*` y los mandas por OTLP a Langfuse, a Phoenix o a cualquier backend de trazas que ya uses. Aquí ves cómo instrumentar con cada una y qué licencia tiene cada pieza, que no es la misma.

## Las piezas y sus licencias

| Herramienta | Versión (oct. 2026) | Licencia | Qué es |
|---|---|---|---|
| [[herramientas/langfuse\|Langfuse]] SDK Python | 5.0.4 (21 oct.) · JS `@langfuse/tracing` 6.0.2 | SDK: MIT. Servidor: MIT salvo las carpetas `ee/`, de licencia comercial (detalle en la [[herramientas/langfuse|ficha]]) | Plataforma de trazas, *prompts*, datasets y evals; autoalojable |
| [[herramientas/arize-phoenix\|Arize Phoenix]] | servidor 20.26.1 · `arize-phoenix-otel` 0.17.2 | **Servidor: Elastic-2.0 (no OSI)** · `arize-phoenix-otel`: Apache-2.0 | Trazas OpenInference/OTel y evals; `phoenix serve` |
| OpenLLMetry (`traceloop-sdk`) | 0.62.4 | Apache-2.0 | Instrumentadores OTel para proveedores de LLM y bases vectoriales |
| Convenciones GenAI de OTel | `opentelemetry-semantic-conventions` 0.66b2 | Apache-2.0 | Los nombres de atributos `gen_ai.*` |

> [!aviso] Phoenix no es open source en sentido OSI
> Su README dice «open-source», pero la licencia del servidor es Elastic License 2.0: puedes usarlo y autoalojarlo, pero no ofrecerlo como servicio gestionado a terceros. Si eso no te afecta, es una buena opción; si redistribuyes, revísalo.

## La base común: spans `gen_ai.*`

Las convenciones semánticas GenAI de OpenTelemetry se movieron en junio de 2026 a su propio repositorio, [`open-telemetry/semantic-conventions-genai`](https://github.com/open-telemetry/semantic-conventions-genai), y siguen en estado *Development*: pueden cambiar entre versiones, así que fija la versión de tu instrumentación. El cambio que más rompe: **`gen_ai.system` queda obsoleto y lo sustituye `gen_ai.provider.name`** (comprobado en el paquete 0.66b2, que marca `gen_ai.system` como «Deprecated: Replaced by `gen_ai.provider.name`»).

El árbol típico de un agente es un span `invoke_agent` por petición, con hijos `chat` por cada llamada al modelo y `execute_tool` por cada herramienta:

| Atributo | En qué span | Ejemplo |
|---|---|---|
| `gen_ai.operation.name` | Todos | `invoke_agent`, `chat`, `execute_tool`, `embeddings`, `retrieval` |
| `gen_ai.provider.name` | `chat` | `ollama`, `anthropic` |
| `gen_ai.request.model` · `gen_ai.response.model` | `chat` | `qwen3.6:27b` |
| `gen_ai.usage.input_tokens` · `gen_ai.usage.output_tokens` | `chat` | 42 · 9 |
| `gen_ai.response.finish_reasons` | `chat` | `["tool_calls"]` |
| `gen_ai.tool.name` · `gen_ai.tool.call.id` | `execute_tool` | `buscar_pedido` · `call_1` |
| `gen_ai.agent.name` · `gen_ai.conversation.id` | `invoke_agent` | `soporte` · `sesion-42` |

El contenido de los mensajes (`gen_ai.input.messages`, `gen_ai.output.messages`) es opcional y debe activarse a propósito: son datos de tus usuarios. La explicación completa, con el código a mano con el SDK de OpenTelemetry, está en [[docs/produccion/04-opentelemetry-genai]]; aquí nos centramos en las herramientas.

## Langfuse SDK v5

El SDK de Python v5 está construido sobre OpenTelemetry: cada observación es un span OTel. Si encuentras tutoriales con `langfuse.trace()` o `span()` del cliente v2, o que hablan del «SDK v3» como el actual, están desfasados. La API v5:

- `get_client()` devuelve el cliente configurado por variables de entorno: `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` y `LANGFUSE_BASE_URL` (por ejemplo `http://localhost:3000` si lo autoalojas).
- `@observe(as_type=…)` convierte una función en una observación. Tipos: `span`, `generation`, `embedding`, `agent`, `tool`, `chain`, `retriever`, `evaluator` y `guardrail`.
- `start_as_current_observation(as_type=…, name=…, model=…)` abre una observación como gestor de contexto, para cuando no quieres decorar una función.
- `propagate_attributes(user_id=, session_id=, tags=…)` aplica esos atributos a todo lo que se ejecute dentro.
- `from langfuse.openai import OpenAI` envuelve el cliente de OpenAI (también contra Ollama o vLLM en `/v1`) y registra cada llamada como `generation`.

Este ejemplo se ejecutó con `langfuse` 5.0.4 **sin servidor**: el constructor acepta un `span_exporter` de OpenTelemetry, y aquí uno en memoria recoge los spans para imprimirlos. La llamada al modelo está simulada; en tu código sería el `client.chat.completions.create(...)` del envoltorio.

```python title="langfuse_local.py"
from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter
from langfuse import Langfuse, get_client, observe, propagate_attributes

memoria = InMemorySpanExporter()                 # en vez de enviar a un servidor, guarda los spans
Langfuse(public_key="pk-lf-demo", secret_key="sk-lf-demo",
         base_url="http://localhost:3000", span_exporter=memoria)
langfuse = get_client()

MODEL = "qwen3.6:27b"

@observe(as_type="tool")
def buscar_pedido(pedido_id: str) -> dict:
    return {"pedido_id": pedido_id, "estado": "enviado"}

@observe(as_type="agent")
def agente(pregunta: str) -> str:
    with propagate_attributes(session_id="sesion-42", user_id="usuario-7", tags=["local"]):
        with langfuse.start_as_current_observation(as_type="generation", name="chat", model=MODEL,
                                                   input=pregunta) as gen:
            # aquí iría la llamada real al modelo; simulamos su respuesta y su uso
            gen.update(output="tool_call buscar_pedido", usage_details={"input": 42, "output": 9})
        datos = buscar_pedido("A-123")
        return f"Tu pedido está {datos['estado']}."

print(agente("¿Cómo va mi pedido A-123?"))
langfuse.flush()
for s in memoria.get_finished_spans():
    a = s.attributes
    print(f"{s.name:14} tipo={a.get('langfuse.observation.type')} sesion={a.get('session.id')} modelo={a.get('langfuse.observation.model.name')}")
```

```text
Tu pedido está enviado.
chat           tipo=generation sesion=sesion-42 modelo=qwen3.6:27b
buscar_pedido  tipo=tool sesion=sesion-42 modelo=None
agente         tipo=agent sesion=sesion-42 modelo=None
```

Los spans terminan de dentro afuera: primero la generación, después la herramienta y por último el agente que las contiene. La sesión se propaga a los tres. En producción quita `span_exporter`, pon las tres variables de entorno y llama a `get_client().flush()` al final de los scripts cortos para no perder los últimos spans. El montaje con un servidor autoalojado está en [[recetas/trazas-con-langfuse]]; los requisitos del servidor (bases de datos, almacenamiento) consúltalos en la documentación de Langfuse, porque cambian entre versiones.

## Arize Phoenix

Phoenix arranca en local con `phoenix serve` (o `uvx arize-phoenix serve`, imagen Docker `arizephoenix/phoenix` o Helm) y sirve la interfaz y el colector OTLP en `http://localhost:6006`. Se instrumenta con `arize-phoenix-otel` y los instrumentadores OpenInference (hay para OpenAI, Anthropic, LangChain y LangGraph, LlamaIndex, LiteLLM, Ollama, CrewAI y otros):

```python nocheck title="trazas_phoenix.py"
from phoenix.otel import register
from openai import OpenAI

tracer_provider = register(project_name="agente-local", endpoint="http://localhost:6006/v1/traces",
                           auto_instrument=True, batch=True)   # auto_instrument: instrumentadores OpenInference instalados
tracer = tracer_provider.get_tracer(__name__)
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

@tracer.agent                                  # también .tool, .chain y .llm
def agente(pregunta: str) -> str:
    r = client.chat.completions.create(model="qwen3.6:27b", messages=[{"role": "user", "content": pregunta}])
    return r.choices[0].message.content
```

Firmas verificadas contra `arize-phoenix-otel` 0.17.2; no se ha ejecutado contra un servidor. `register()` usa por defecto un procesador síncrono (`SimpleSpanProcessor`) y la propia librería avisa de que en producción conviene `batch=True`. Variables equivalentes: `PHOENIX_COLLECTOR_ENDPOINT`, `PHOENIX_PROJECT_NAME` y `PHOENIX_API_KEY`. Ojo: OpenInference usa su propio esquema de atributos además de los `gen_ai.*`; si mezclas backends, comprueba qué ve cada uno.

## OpenLLMetry

OpenLLMetry (`traceloop-sdk`) es un conjunto de instrumentadores OpenTelemetry que parchean las librerías por ti: proveedores de modelos (OpenAI, Anthropic, Ollama…), frameworks (LangChain, LlamaIndex) y bases vectoriales (Chroma, LanceDB, Qdrant, Weaviate…). Se inicializa con `Traceloop.init(...)` y exporta por OTLP a donde digas, Langfuse y Phoenix incluidos. Encaja cuando quieres trazas sin tocar tu código; el precio es menos control sobre qué se registra, así que revisa que no capture contenido que no debería.

## Cuál usar

| Si… | Usa |
|---|---|
| Quieres una plataforma completa (trazas, *prompts*, datasets, evals) autoalojada con SDK MIT | Langfuse |
| Quieres algo local en un comando para depurar, y la ELv2 no te afecta | Phoenix |
| Ya tienes un backend OTel (Jaeger, Grafana Tempo, Datadog…) | Spans `gen_ai.*` a mano o con OpenLLMetry, y OTLP a tu backend |
| No quieres tocar el código de la aplicación | OpenLLMetry o `auto_instrument` de Phoenix |

Lo que no cambia con la herramienta: un span por llamada y por herramienta bajo un span de agente, `usage` y motivo de parada en cada llamada, identificador de conversación para agrupar y una política de qué contenido se guarda. Ver [[docs/produccion/01-observabilidad]].

## Errores frecuentes

| Error | Consecuencia | Arreglo |
|---|---|---|
| Seguir un tutorial del SDK v2 de Langfuse | `trace()` y `span()` no existen o están obsoletos | API v5: `@observe`, `start_as_current_observation` |
| Usar `gen_ai.system` | Paneles vacíos en backends actualizados | `gen_ai.provider.name` |
| Script corto sin `flush()` | Se pierden las últimas trazas | `get_client().flush()` antes de salir |
| Capturar prompts y respuestas por defecto | Datos personales en el backend de trazas | Contenido solo con política de datos y enmascarado |
| Procesador síncrono en producción | Latencia añadida en cada llamada | Procesador por lotes (`batch=True` en Phoenix) |

## Ver también

- [[docs/produccion/04-opentelemetry-genai]]: las convenciones GenAI a fondo.
- [[recetas/analisis-de-errores-de-trazas]]: qué hacer con cien trazas.
- [[docs/modelos-abiertos/08-evals-abiertas]]: de la traza al caso de prueba.
- [[glosario/convenciones-genai-otel]]
