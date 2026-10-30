---
titulo: LangChain
descripcion: "Referencia de LangChain 1.x para agentes: paquetes, init_chat_model, mensajes, @tool, create_agent, middleware, salida estructurada, Claude y Ollama, y migración desde 0.x."
creado: 2026-10-29
orden: 4
nivel: intermedio
tags: [frameworks, langchain, agentes, open-source, python]
relacionados: ["[[herramientas/langchain]]", "[[cursos/langchain-y-langgraph/03-tu-primer-agente-con-create-agent]]", "[[cursos/langchain-y-langgraph/04-middleware]]", "[[docs/frameworks/05-langgraph]]"]
---

**LangChain** es una librería de Python (y de TypeScript, ver [[docs/frameworks/11-agentes-en-typescript]]) para construir agentes con un [[glosario/bucle-agentico|bucle agéntico]] ya escrito, `create_agent`, que personalizas con [[glosario/middleware|middleware]]. Por debajo, `create_agent` compila un grafo de [[docs/frameworks/05-langgraph|LangGraph]]: de ahí hereda persistencia, interrupciones y streaming. Esta página es la referencia de la serie 1.x (`langchain` 1.4.7 y `langchain-core` 1.7.2 a 29 de octubre de 2026), con licencia **MIT**. Lo comercial está aparte: **LangSmith** (trazas, evals y despliegue) es un servicio de pago y no hace falta para nada de lo que sigue.

Si vienes del bucle a mano de [[roadmap/40-primer-agente/02-el-bucle-agentico]], piensa en `create_agent` como ese mismo `while` con los `tool_result` ya montados. Lo que cambia es dónde pones tu código: en vez de editar el bucle, añades middleware.

## Paquetes

Desde la 1.0, `langchain` es pequeño y lo antiguo vive en otro paquete. El equipo se comprometió a no romper la API hasta la 2.0.

| Paquete | Qué trae |
|---|---|
| `langchain` | `langchain.agents` (`create_agent`, middleware, salida estructurada), `langchain.messages`, `langchain.tools`, `langchain.chat_models`, `langchain.embeddings` y, desde la 1.4, `langchain.mcp` (beta) |
| `langchain-core` | Las abstracciones: mensajes, `BaseChatModel`, runnables, modelos simulados para pruebas |
| `langchain-anthropic` | `ChatAnthropic` y el middleware específico de Claude |
| `langchain-ollama` | `ChatOllama` para modelos locales |
| `langchain-classic` | Lo de la 0.x: cadenas, *retrievers*, `hub`, exportaciones de `langchain-community` |

```bash
pip install langchain langchain-anthropic          # + langchain-ollama para local
```

## Modelos: `init_chat_model`

`init_chat_model("proveedor:modelo", **kwargs)` construye el cliente de chat del proveedor. Con `"anthropic:…"` devuelve un `ChatAnthropic`; con `"ollama:…"`, un `ChatOllama`. Así cambias de modelo tocando una línea.

```python title="modelos_langchain.py"
from langchain.chat_models import init_chat_model

MODEL = "anthropic:claude-sonnet-5-5"

claude = init_chat_model(MODEL, max_tokens=2048)          # lee ANTHROPIC_API_KEY
local = init_chat_model("ollama:qwen3", num_ctx=32768)    # Ollama en http://localhost:11434
```

Tres detalles de `ChatAnthropic` (`langchain-anthropic` 1.7.7) que conviene saber antes de la primera factura:

- **Sin `max_tokens`, toma el máximo del perfil del modelo** (128 000 en `claude-sonnet-5-5`). Pásalo siempre: es tu tope de gasto por llamada ([[glosario/max-tokens]]).
- **`temperature`, `top_p` y `top_k` lanzan `ValueError`** con `claude-sonnet-5-5` si no son el valor por defecto. Coincide con la API de Claude, que ya no los acepta. Con Ollama sí existen.
- **`effort="low" | "medium" | "high" | "xhigh" | "max"`** se traduce a razonamiento adaptativo (`thinking={"type": "adaptive", "display": "summarized"}`). Ver [[docs/prompting/04-razonamiento]].

`ChatAnthropic` acepta también `thinking`, `output_config`, `betas`, `mcp_servers`, `context_management`, `stop_sequences` y `max_retries` (2 por defecto). Las herramientas del servidor de Anthropic se pasan como dict en `tools` y llegan tal cual ([[docs/herramientas/03-herramientas-del-servidor]]).

Para local, `ChatOllama` admite `model`, `base_url`, `num_ctx`, `temperature`, `reasoning`, `keep_alive` y `format`. Elige un modelo abierto que sepa llamar herramientas: si no, verás [[problemas/modelo-local-no-llama-herramientas]].

## Mensajes

El estado de un agente es una lista de mensajes. Equivalen uno a uno a los de la API de Mensajes:

| LangChain | API de Claude |
|---|---|
| `SystemMessage` | `system` |
| `HumanMessage` | mensaje `user` con texto |
| `AIMessage` con `.tool_calls` (`name`, `args`, `id`) | mensaje `assistant` con bloques `tool_use` |
| `ToolMessage(tool_call_id=…, status="error")` | bloque `tool_result` con `is_error: true` |

`AIMessage.text` devuelve el texto y `AIMessage.content_blocks` normaliza los bloques del proveedor (`thinking` pasa a `reasoning`, `tool_use` a `tool_call`). Puedes pasar mensajes como dicts (`{"role": "user", "content": "…"}`) o tuplas (`("user", "…")`).

## Herramientas con `@tool`

`@tool` (de `langchain.tools`) convierte una función en herramienta: el nombre sale de la función, la descripción del docstring y el esquema de los tipos. Con `parse_docstring=True`, la descripción de cada argumento en la sección `Args:` llega al [[glosario/tool-use|esquema de la herramienta]]; sin él, se pierde. Para un esquema explícito, `args_schema=MiModeloPydantic`.

Otras piezas de `langchain.tools`: `ToolRuntime` (acceso al estado, al contexto y al *store* desde la herramienta), `InjectedToolCallId` y `ToolException`.

## `create_agent`

```text
create_agent(model, tools=None, *, system_prompt=None, middleware=(), response_format=None,
             state_schema=None, context_schema=None, checkpointer=None, store=None,
             interrupt_before=None, interrupt_after=None, debug=False, name=None, cache=None)
```

| Parámetro | Para qué |
|---|---|
| `model` | String `"proveedor:modelo"` o una instancia (`ChatAnthropic`, `ChatOllama`…). Usa la instancia para fijar `max_tokens` |
| `tools` | Funciones con `@tool`, `BaseTool` o dicts (herramientas del servidor) |
| `system_prompt` | Texto o `SystemMessage` |
| `middleware` | Lista de middleware; el primero es el más externo |
| `response_format` | Esquema de la respuesta final (ver más abajo) |
| `checkpointer` | Persistencia por `thread_id`; lo necesitan la memoria de conversación y la aprobación humana ([[glosario/checkpointer]]) |
| `store` | Memoria a largo plazo entre hilos |
| `context_schema` | Tipo del contexto de ejecución (usuario, permisos) que reciben herramientas y middleware |

`create_agent` sustituye a `langgraph.prebuilt.create_react_agent`, que avisa de que se elimina en LangGraph 2.0.

## Ejemplo completo

Un agente de soporte con dos herramientas, un middleware propio que registra cada llamada, el tratamiento de errores y un tope de llamadas al modelo.

```python title="agente_langchain.py"
import json
import logging

from langchain.agents import create_agent
from langchain.agents.middleware import ModelCallLimitMiddleware, ToolErrorMiddleware, wrap_tool_call
from langchain.chat_models import init_chat_model
from langchain.tools import tool

MODEL = "anthropic:claude-sonnet-5-5"     # local: "ollama:qwen3" (pip install langchain-ollama)

PEDIDOS = {"ana@example.com": [{"id": "P-1001", "estado": "enviado", "fecha": "2026-09-10"}]}
AYUDA = {"devoluciones": "Tienes 30 días desde la entrega para devolver un producto sin usar."}
log = logging.getLogger("agente")


@tool(parse_docstring=True)                # sin esto, lo de "Args:" no llega al esquema
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email. Devuelve id, estado y fecha de cada pedido.

    Args:
        email: Email del cliente.
    """
    pedidos = PEDIDOS.get(email.lower())
    if pedidos is None:
        raise ValueError(f"No hay ningún cliente con email {email}")
    return json.dumps(pedidos, ensure_ascii=False)


@tool
def buscar_ayuda(tema: str) -> str:
    """Busca en el centro de ayuda por tema. Úsala para políticas: devoluciones, envíos, pagos."""
    tema = tema.lower()
    return next((t for k, t in AYUDA.items() if k in tema or tema in k), "Sin resultados.")


def error_para_el_modelo(exc: Exception, request) -> str:
    return f"Error: {exc}"                 # vuelve como ToolMessage(status="error"): tu is_error


@wrap_tool_call
def registrar(request, handler):
    # Middleware propio: envuelve cada ejecución de herramienta (aquí, para trazarla).
    log.info("tool %s %s", request.tool_call["name"], request.tool_call["args"])
    return handler(request)


def crear_agente(model=None):
    model = model or init_chat_model(MODEL, max_tokens=2048)   # max_tokens explícito siempre
    return create_agent(
        model=model,
        tools=[ver_pedidos, buscar_ayuda],
        system_prompt="Eres el soporte de una tienda online. Usa las herramientas; no inventes datos.",
        middleware=[
            registrar,
            ToolErrorMiddleware(on_error=error_para_el_modelo),
            ModelCallLimitMiddleware(run_limit=10, exit_behavior="end"),
        ],
    )


if __name__ == "__main__":
    agente = crear_agente()
    r = agente.invoke({"messages": [{"role": "user", "content": "Soy ana@example.com. ¿Dónde está mi pedido?"}]})
    for m in r["messages"]:                # la traza: human → ai(tool_calls) → tool → ai
        m.pretty_print()
```

> [!aviso] Una excepción en una herramienta rompe el agente
> Por defecto, solo vuelven al modelo los errores de validación de argumentos. Cualquier otra excepción dentro de la herramienta se propaga y corta la ejecución, y el modelo nunca se entera. Para el equivalente a `is_error: true` ([[roadmap/20-herramientas/03-errores-e-is-error]]) añade `ToolErrorMiddleware(on_error=…)` (langchain ≥ 1.3.14) o lanza `ToolException` en una herramienta con `handle_tool_error=True`.

### Probarlo sin API

`GenericFakeChatModel` de `langchain-core` devuelve los mensajes que le das, en orden. No implementa `bind_tools`, que `create_agent` llama, así que basta una subclase de dos líneas. Con ella fijas la [[glosario/trayectoria|trayectoria]] esperada en una prueba de `pytest` que corre en CI sin clave ni red ([[glosario/modelo-simulado]]):

```python title="prueba_agente_langchain.py"
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain_core.messages import AIMessage

from agente_langchain import crear_agente


class ModeloGuion(GenericFakeChatModel):
    def bind_tools(self, tools, **kwargs):     # GenericFakeChatModel no lo implementa
        return self


def test_error_de_herramienta_vuelve_al_modelo():
    modelo = ModeloGuion(messages=iter([
        AIMessage(content="", tool_calls=[{"name": "ver_pedidos", "args": {"email": "nadie@example.com"},
                                           "id": "c1", "type": "tool_call"}]),
        AIMessage(content="No encuentro ese email. ¿Puedes revisarlo?"),
    ]))
    r = crear_agente(modelo).invoke({"messages": [{"role": "user", "content": "Soy nadie@example.com"}]})
    tool_msg = next(m for m in r["messages"] if m.type == "tool")
    assert tool_msg.status == "error"
    assert "No hay ningún cliente" in tool_msg.content
    assert r["messages"][-1].content.startswith("No encuentro")
```

Si quitas `ToolErrorMiddleware`, la prueba falla con el `ValueError` de la herramienta. Más técnicas en [[recetas/probar-agentes-sin-api]].

## Middleware

El middleware se engancha en puntos fijos del bucle: `before_agent`, `before_model`, `wrap_model_call`, `wrap_tool_call`, `after_model` y `after_agent`. Para escribir el tuyo tienes un decorador por punto (`@before_model`, `@wrap_tool_call`, `@dynamic_prompt`…) o la clase `AgentMiddleware`. El incluido en `langchain.agents.middleware`:

| Middleware | Qué hace |
|---|---|
| `HumanInTheLoopMiddleware(interrupt_on={…})` | Pausa antes de ciertas herramientas; decisiones `approve`, `edit`, `reject`, `respond`. Necesita `checkpointer` |
| `ModelCallLimitMiddleware(run_limit=…, thread_limit=…, exit_behavior="end" \| "error")` | Tope de llamadas al modelo ([[roadmap/40-primer-agente/03-condiciones-de-parada]]) |
| `ToolCallLimitMiddleware(tool_name=…, run_limit=…)` | Tope de llamadas a una herramienta o a todas |
| `ToolErrorMiddleware(on_error=…)` | Devuelve las excepciones al modelo como error |
| `ModelRetryMiddleware`, `ToolRetryMiddleware` | Reintentos |
| `ModelFallbackMiddleware(primero, *otros)` | Cambia de modelo si falla ([[glosario/fallback-de-modelo]]) |
| `SummarizationMiddleware(model, trigger=…, keep=…)` | Resume el historial al llegar a un umbral ([[glosario/compactacion]]) |
| `ContextEditingMiddleware(edits=[ClearToolUsesEdit(...)])` | Limpia resultados de herramientas antiguos |
| `PIIMiddleware(tipo, strategy="redact" \| "block" \| "mask" \| "hash")` | Detecta y trata datos personales |
| `TodoListMiddleware`, `LLMToolSelectorMiddleware`, `ShellToolMiddleware`, `LLMToolEmulator` | Lista de tareas, preselección de herramientas, shell y herramientas emuladas por un modelo |

De Claude, en `langchain_anthropic.middleware`: `AnthropicPromptCachingMiddleware(ttl="5m" | "1h")` añade `cache_control` a la petición ([[docs/contexto/02-prompt-caching]]), además del middleware de las herramientas de bash, editor y memoria de Anthropic.

La aprobación humana con middleware tiene su página de curso: [[cursos/langchain-y-langgraph/07-humano-en-el-bucle-con-interrupt]].

## Salida estructurada

`response_format` fija el formato de la respuesta final, que llega validada en `resultado["structured_response"]` ([[glosario/salida-estructurada]]).

```python title="ticket_langchain.py"
from typing import Literal

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from pydantic import BaseModel, Field

MODEL = "anthropic:claude-sonnet-5-5"


class Ticket(BaseModel):
    categoria: Literal["facturacion", "envio", "cuenta", "producto"]
    urgente: bool = Field(description="True si el cliente no puede usar el servicio")
    resumen: str = Field(description="Una frase")


def crear_clasificador(model=None, estrategia=Ticket):
    # El esquema a secas deja elegir a LangChain: con Claude usa output_config.format (salida nativa).
    # ToolStrategy(Ticket) fuerza una herramienta de respuesta: solo para modelos sin salida nativa.
    return create_agent(model or init_chat_model(MODEL, max_tokens=1024), tools=[],
                        system_prompt="Clasifica el ticket de soporte.", response_format=estrategia)


if __name__ == "__main__":
    r = crear_clasificador().invoke({"messages": [("user", "Me habéis cobrado dos veces y no puedo entrar")]})
    print(r["structured_response"])        # Ticket(categoria='facturacion', urgente=True, ...)
```

- `ProviderStrategy(schema, strict=None)`: usa la salida estructurada nativa del proveedor (en Claude, `output_config.format`). Si pasas el esquema a secas, LangChain la elige cuando el perfil del modelo dice que la admite.
- `ToolStrategy(schema, handle_errors=True)`: crea una herramienta con la forma del esquema y obliga al modelo a llamarla (`tool_choice="any"`). Sirve con modelos locales sin salida nativa; si el JSON no valida, devuelve el error al modelo para que lo corrija. **Con Claude Opus 5.5 y Sonnet 5.5 no la uses**: forzar herramientas da error 400 en esos modelos ([[recetas/entregar-resultado-sin-forzar-herramienta]]).
- Fuera de un agente: `llm.with_structured_output(Modelo, method="json_schema")`. Sin `method`, `ChatAnthropic` fuerza una herramienta y con `claude-sonnet-5-5` termina en `OutputParserException`; con `"json_schema"` envía `output_config.format`.

## Migrar desde 0.x

| Antes (0.x) | Ahora (1.x) |
|---|---|
| `AgentExecutor`, `initialize_agent`, `create_react_agent` | `create_agent` |
| Cadenas (`LLMChain`, LCEL para todo), `hub`, *retrievers* | `langchain-classic` (o funciones normales) |
| Callbacks para cortar el bucle | `ModelCallLimitMiddleware`, `ToolCallLimitMiddleware` |
| `langchain-mcp-adapters` | `langchain.mcp.MCPAdapter` con `pip install "langchain[mcp]"` (beta; compatible con `mcp` 2.x). Ver [[recetas/herramientas-mcp-en-un-agente-langchain]] |
| `temperature=0` «para que sea determinista» | Con Claude no existe: usa salida estructurada y evals |

## Errores frecuentes

- **No poner `max_tokens`** y descubrir el gasto en la factura.
- **Confiar en que los errores de herramienta vuelven solos**: sin `ToolErrorMiddleware` no vuelven.
- **Olvidar `parse_docstring=True`**: el modelo ve los argumentos sin descripción y los rellena peor.
- **Mezclar `langchain-mcp-adapters` con `mcp` 2.x** en el mismo entorno: falla al importar.
- **Probar solo contra el modelo real**: cada prueba cuesta y no es reproducible. Usa un modelo simulado para la trayectoria y deja el real para las evals.

## Ver también

- [[cursos/langchain-y-langgraph/index]]: el curso completo, paso a paso.
- [[docs/frameworks/05-langgraph]]: el grafo que hay debajo de `create_agent`.
- [[docs/frameworks/02-equivalencias]]: cómo se llama cada pieza en otros frameworks.
- [[herramientas/langchain]] y [[herramientas/langgraph]]: fichas del directorio.
- [[docs/agentes/01-el-bucle-agentico]]: el mecanismo sin framework.
