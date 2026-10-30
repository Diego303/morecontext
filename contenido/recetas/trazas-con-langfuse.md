---
titulo: Trazas de un agente con Langfuse
descripcion: Instrumenta un agente de LangChain con el SDK v5 de Langfuse (OpenTelemetry) para ver cada paso, herramienta, error y token en una traza, en Langfuse Cloud o autoalojado con Docker.
creado: 2026-10-29
nivel: intermedio
minutos: 30
tema: produccion
stack: ["Langfuse", "Python"]
tags: [produccion, observabilidad, trazas, langfuse, opentelemetry, langchain]
relacionados: ["[[herramientas/langfuse]]", "[[docs/modelos-abiertos/07-observabilidad-abierta]]", "[[roadmap/100-produccion/01-observabilidad-y-trazas]]", "[[docs/produccion/04-opentelemetry-genai]]", "[[recetas/analisis-de-errores-de-trazas]]"]
---

## Problema

Tu agente funciona en local, pero en producción alguien dice «ha contestado una tontería» y no sabes qué pasó: qué herramientas llamó, con qué argumentos, qué le devolvieron, cuántos pasos dio y cuánto costó. Necesitas una traza por petición con cada llamada al modelo y cada herramienta anidadas, agrupadas por usuario y conversación, y que no tengas que mandar tus datos a un servicio que no controlas.

[[herramientas/langfuse|Langfuse]] es una plataforma de [[glosario/observabilidad|observabilidad]] para aplicaciones con LLM. El SDK de Python (v5, licencia MIT) está construido sobre OpenTelemetry. Puedes usar su nube o autoalojar el servidor.

## Ingredientes

- Python 3.10 o superior: `pip install langfuse "langchain[anthropic]"` (langfuse 5.0.4, langchain 1.4).
- Un servidor de Langfuse:
  - **Cloud**: crea un proyecto en [cloud.langfuse.com](https://cloud.langfuse.com) y copia las claves.
  - **Autoalojado**: Docker con Compose. El despliegue levanta la web, un *worker*, PostgreSQL, ClickHouse, Redis y un almacenamiento compatible con S3 (MinIO); la interfaz queda en `http://localhost:3000`.

```bash
git clone https://github.com/langfuse/langfuse.git && cd langfuse
docker compose up -d          # antes de exponerlo, cambia en el compose todos los secretos de ejemplo
```

- Las tres variables de entorno del proyecto:

```bash
export LANGFUSE_PUBLIC_KEY="pk-lf-..."
export LANGFUSE_SECRET_KEY="sk-lf-..."
export LANGFUSE_BASE_URL="http://localhost:3000"     # o https://cloud.langfuse.com (el valor por defecto)
```

> [!aviso] Revisa la licencia antes de autoalojar
> El SDK es MIT. El servidor es MIT salvo las carpetas `ee/`, que llevan licencia comercial; consulta el `LICENSE` del repositorio y la guía oficial de autoalojamiento antes de decidir qué despliegas y para cuántos usuarios.

## Pasos

1. **Una traza por petición.** Decora la función que atiende la petición con `@observe(as_type="agent")`: crea la observación raíz. Todo lo que pase dentro (llamadas al modelo, herramientas) cuelga de ella.

2. **Engancha LangChain con el `CallbackHandler`.** Se pasa en `config={"callbacks": [...]}` y convierte cada paso del grafo en una observación hija: las llamadas al modelo como `generation` (con modelo y tokens) y las herramientas como `tool` (con entrada, salida y error).

3. **Propaga quién y en qué conversación.** `propagate_attributes(user_id=…, session_id=…, tags=…)` copia esos atributos a todas las observaciones hijas. En la interfaz agrupas por sesión (toda una conversación) y filtras por usuario o etiqueta.

```python title="agente_trazado.py"
import json

from langchain.agents import create_agent
from langchain.agents.middleware import ModelCallLimitMiddleware, ToolErrorMiddleware
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langfuse import get_client, observe, propagate_attributes
from langfuse.langchain import CallbackHandler

MODEL = "anthropic:claude-sonnet-5-5"     # o "ollama:qwen3.6:27b": la instrumentación es la misma
PEDIDOS = {"ana@example.com": [{"id": "P-1001", "estado": "enviado"}]}


@tool
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email."""
    if email.lower() not in PEDIDOS:
        raise ValueError(f"No hay ningún cliente con email {email}")
    return json.dumps(PEDIDOS[email.lower()], ensure_ascii=False)


def crear_agente(modelo=None):
    return create_agent(
        model=modelo or init_chat_model(MODEL, max_tokens=1024),
        tools=[ver_pedidos],
        system_prompt="Eres el soporte de una tienda. Usa las herramientas; no inventes datos.",
        middleware=[ToolErrorMiddleware(on_error=lambda exc, req: f"Error: {exc}"),
                    ModelCallLimitMiddleware(run_limit=8, exit_behavior="end")],
    )


@observe(as_type="agent", name="soporte")          # observación raíz: una traza por petición
def atender(pregunta: str, usuario: str, sesion: str, agente=None) -> str:
    agente = agente or crear_agente()
    # user_id, session_id y tags se copian a todas las observaciones hijas
    with propagate_attributes(user_id=usuario, session_id=sesion, tags=["soporte", "produccion"]):
        resultado = agente.invoke(
            {"messages": [("user", pregunta)]},
            config={"callbacks": [CallbackHandler()],    # cada llamada al modelo y a herramientas, como hija
                    "recursion_limit": 25},
        )
    return resultado["messages"][-1].content


if __name__ == "__main__":
    print(atender("¿Dónde está mi pedido? Soy ana@example.com", usuario="u-42", sesion="ticket-123"))
    get_client().flush()          # en scripts cortos: vacía el buffer antes de salir
```

4. **Vacía el buffer al salir.** El SDK envía en lotes y en segundo plano. En un servidor web no hace falta hacer nada; en un script o un *job* que termina enseguida, llama a `get_client().flush()` o perderás las últimas trazas.

5. **Mira lo que importa en la interfaz.** Abre una traza y recórrela de arriba abajo:
   - **Número de `generation`**: cuántas veces llamó al modelo. Muchas más de las esperadas indican un bucle ([[problemas/el-agente-repite-la-misma-herramienta]]).
   - **Observaciones `tool` con nivel `ERROR`**: herramientas que fallaron, con el mensaje. Aunque el agente se recupere, cada error es un paso pagado.
   - **Tokens de entrada por paso**: si crecen en cada vuelta, el historial se acumula; ahí está el coste.
   - **Coste**: Langfuse lo calcula a partir del modelo y los tokens de cada `generation` cuando conoce el precio de ese modelo. Para un modelo local o uno que no reconozca, define su precio en la configuración de modelos del proyecto, o envía tú el coste con `cost_details` al actualizar la `generation`; si no, el coste queda vacío.
   - **Latencia por observación**: cuál de los pasos se come el tiempo.

## Cómo comprobar que funciona

Sin servidor, el SDK no envía nada. Para comprobar la instrumentación, la ejecuté con un `InMemorySpanExporter` de OpenTelemetry en lugar del exportador de Langfuse (el constructor acepta `span_exporter=`) y un [[glosario/modelo-simulado|modelo simulado]] que primero se equivoca de email y luego acierta. La prueba:

```python title="probar_trazas.py"
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain_core.messages import AIMessage
from langfuse import Langfuse
from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter

exportador = InMemorySpanExporter()
langfuse = Langfuse(public_key="pk-lf-prueba", secret_key="sk-lf-prueba", span_exporter=exportador)

from agente_trazado import atender, crear_agente  # noqa: E402


class FakeToolModel(GenericFakeChatModel):
    def bind_tools(self, tools, **kwargs):
        return self


uso = {"input_tokens": 812, "output_tokens": 41, "total_tokens": 853}
modelo = FakeToolModel(messages=iter([
    AIMessage(content="", tool_calls=[{"name": "ver_pedidos", "args": {"email": "nadie@example.com"}, "id": "c1", "type": "tool_call"}],
              usage_metadata=uso),
    AIMessage(content="", tool_calls=[{"name": "ver_pedidos", "args": {"email": "ana@example.com"}, "id": "c2", "type": "tool_call"}],
              usage_metadata=uso),
    AIMessage(content="Tu pedido P-1001 está enviado.", usage_metadata=uso),
]))
print("respuesta:", atender("¿Dónde está mi pedido?", usuario="u-42", sesion="ticket-123", agente=crear_agente(modelo)))
langfuse.flush()

for s in sorted(exportador.get_finished_spans(), key=lambda s: s.start_time):
    a = s.attributes
    print(f"{s.name:<22} tipo={a.get('langfuse.observation.type', '-'):<10} "
          f"nivel={a.get('langfuse.observation.level', '-'):<7} uso={a.get('langfuse.observation.usage_details', '-')}")
print("atributos propagados:", {k: v for k, v in s.attributes.items() if k in ("user.id", "session.id", "langfuse.trace.tags")})
```

Salida real (langfuse 5.0.4, opentelemetry-sdk 1.45.2), quitando las observaciones `chain` intermedias (los nodos `model` y `tools` y los *hooks* del middleware):

```text
respuesta: Tu pedido P-1001 está enviado.
soporte                tipo=agent      nivel=-       uso=-
LangGraph              tipo=chain      nivel=-       uso=-
FakeToolModel          tipo=generation nivel=-       uso={"input": 812, "output": 41, "total": 853}
ver_pedidos            tipo=tool       nivel=ERROR   uso=-
FakeToolModel          tipo=generation nivel=-       uso={"input": 812, "output": 41, "total": 853}
ver_pedidos            tipo=tool       nivel=-       uso=-
FakeToolModel          tipo=generation nivel=-       uso={"input": 812, "output": 41, "total": 853}
atributos propagados: {'user.id': 'u-42', 'session.id': 'ticket-123', 'langfuse.trace.tags': ('soporte', 'produccion')}
```

Todas las observaciones comparten la misma traza; la herramienta que falló queda marcada como `ERROR` aunque `ToolErrorMiddleware` devolviera el error al modelo. Dos comprobaciones más, también ejecutadas: con `LANGFUSE_TRACING_ENABLED=false` el agente funciona igual y no se exporta ninguna observación, y sin claves el cliente avisa («Client will be disabled») y sigue sin romper la aplicación.

## Variaciones

- **Sin LangChain.** El envoltorio `from langfuse.openai import OpenAI` registra cada llamada como `generation`, también contra Ollama (`base_url="http://localhost:11434/v1"`). Para tu propio bucle con el SDK de Anthropic, abre observaciones a mano con `get_client().start_as_current_observation(as_type="generation", name="claude", model=MODEL)` y actualízalas con `usage_details`.
- **Herramientas propias.** `@observe(as_type="tool")` sobre cualquier función crea su observación con entrada y salida.
- **Datos sensibles.** El constructor admite `mask=` para limpiar entradas y salidas antes de enviarlas, y `sample_rate=` para muestrear con mucho tráfico.
- **Exportar a otro backend.** Como es OpenTelemetry, puedes pasar tu propio `span_exporter` o `tracer_provider`; las convenciones `gen_ai.*` las explica [[docs/produccion/04-opentelemetry-genai]]. Alternativa con licencia Elastic 2.0: [[herramientas/arize-phoenix]].
- **De trazas a evals.** Cien trazas leídas a mano son el mejor conjunto de prueba que tendrás ([[recetas/analisis-de-errores-de-trazas]]).

## Errores típicos

- **Usar ejemplos del SDK v2 o v3.** `langfuse.trace()` y `span()` del cliente antiguo están obsoletos; en la v5 se usa `@observe`, `start_as_current_observation` y `propagate_attributes`.
- **`LANGFUSE_HOST` en lugar de `LANGFUSE_BASE_URL`.** Sigue funcionando pero está obsoleta; con las dos, gana la nueva.
- **No llamar a `flush()` en scripts.** El proceso termina antes de que salga el lote.
- **Crear un `CallbackHandler` sin traza raíz.** Funciona, pero cada `invoke` es una traza suelta: sin `@observe` arriba no ves la petición como una unidad ni le pegas usuario y sesión.
- **Mandar datos personales sin máscara.** Las trazas guardan prompts y resultados completos: aplica `mask` o redacta en la herramienta.
- **Exponer el servidor con los secretos de ejemplo.** Cámbialos antes de abrir el puerto 3000 a la red.
