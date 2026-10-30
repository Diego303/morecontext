---
titulo: Probar agentes sin API con modelos simulados
descripcion: Escribe pruebas de trayectoria que corren en CI sin clave ni coste, con modelos simulados en LangChain, Pydantic AI y el OpenAI Agents SDK, y con un transporte falso para el SDK de Anthropic.
creado: 2026-10-29
nivel: intermedio
minutos: 35
tema: evals
stack: ["Python", "pytest", "LangChain", "Pydantic AI"]
tags: [evals, pruebas, ci, langchain, pydantic-ai, trayectoria]
relacionados: ["[[glosario/modelo-simulado]]", "[[roadmap/80-evals/04-evals-de-trayectoria]]", "[[recetas/evals-de-regresion-en-ci]]", "[[cursos/langchain-y-langgraph/11-observar-y-evaluar]]", "[[docs/frameworks/02-equivalencias]]"]
---

## Problema

Cada cambio en tu agente (un prompt, una herramienta nueva, una versión del framework) puede romper el bucle: que una excepción ya no vuelva al modelo, que el límite de pasos deje de cortar, que el `tool_result` salga mal emparejado. Probarlo contra la API real es lento, cuesta dinero y no es determinista, así que en la práctica no se prueba.

Un [[glosario/modelo-simulado|modelo simulado]] devuelve respuestas escritas por ti en el orden que quieras: «primero pide esta herramienta con estos argumentos, luego contesta esto». Con él pruebas **tu** código (el bucle, las herramientas, los límites, los errores) en milisegundos y en CI. No pruebas la calidad del modelo: eso es trabajo de las [[glosario/evals|evals]] ([[roadmap/80-evals/04-evals-de-trayectoria]]).

## Ingredientes

- Python 3.10 o superior y `pip install pytest`.
- El framework que uses: `langchain` 1.4, `pydantic-ai` 2.63, `openai-agents` 0.24 o `anthropic` 2.x.
- Un agente que **reciba el modelo desde fuera**. Es el único cambio de diseño que necesitas.

## Pasos

1. **Inyecta el modelo.** Si tu agente crea el modelo dentro, la prueba no puede cambiarlo. Pásalo como parámetro con un valor por defecto real:

```python title="agente_soporte.py"
import json

from langchain.agents import create_agent
from langchain.agents.middleware import ModelCallLimitMiddleware, ToolErrorMiddleware
from langchain.chat_models import init_chat_model
from langchain.tools import tool

MODEL = "anthropic:claude-sonnet-5-5"
PEDIDOS = {"ana@example.com": [{"id": "P-1001", "estado": "enviado"}]}


@tool
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email."""
    if email.lower() not in PEDIDOS:
        raise ValueError(f"No hay ningún cliente con email {email}")
    return json.dumps(PEDIDOS[email.lower()], ensure_ascii=False)


@tool
def reembolsar(pedido_id: str, importe_eur: float) -> str:
    """Emite un reembolso. Acción irreversible."""
    return f"Reembolso de {importe_eur} € emitido para {pedido_id}."


def crear_agente(modelo=None):                  # el modelo se inyecta: así las pruebas no tocan la API
    return create_agent(
        model=modelo or init_chat_model(MODEL, max_tokens=2048),
        tools=[ver_pedidos, reembolsar],
        system_prompt="Eres el soporte de una tienda. Usa las herramientas; no inventes datos.",
        middleware=[ToolErrorMiddleware(on_error=lambda exc, req: f"Error: {exc}"),
                    ModelCallLimitMiddleware(run_limit=5, exit_behavior="end")],
    )
```

2. **Decide qué asertar.** Una prueba de trayectoria mira tres cosas, nunca el texto exacto que generaría un modelo real:
   - **Qué herramientas se llamaron, en qué orden y con qué argumentos** (la [[glosario/trayectoria|trayectoria]]).
   - **Qué recibió el modelo de vuelta**: el resultado, o el error marcado como error.
   - **Cómo paró**: respuesta final, límite de pasos o error controlado.

3. **Escribe las pruebas con el modelo simulado de tu framework.** Cada pestaña es un archivo de pytest que corre sin red ni clave.

```python tab="LangChain" title="test_agente_langchain.py"
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain_core.messages import AIMessage

from agente_soporte import crear_agente


class FakeToolModel(GenericFakeChatModel):
    """GenericFakeChatModel no implementa bind_tools y create_agent lo necesita."""
    def bind_tools(self, tools, **kwargs):
        return self


def llamada(nombre, args, id_):
    return {"name": nombre, "args": args, "id": id_, "type": "tool_call"}


def ejecutar(*respuestas):
    modelo = FakeToolModel(messages=iter(respuestas))
    return crear_agente(modelo).invoke({"messages": [("user", "¿Dónde está mi pedido? Soy ana@example.com")]})


def trayectoria(resultado):
    """[(herramienta, args)] en el orden en que el agente las pidió."""
    return [(c["name"], c["args"]) for m in resultado["messages"] if m.type == "ai" for c in m.tool_calls]


def test_consulta_y_responde():
    r = ejecutar(AIMessage(content="", tool_calls=[llamada("ver_pedidos", {"email": "ana@example.com"}, "c1")]),
                 AIMessage(content="Tu pedido P-1001 está enviado."))
    assert trayectoria(r) == [("ver_pedidos", {"email": "ana@example.com"})]
    herramienta = [m for m in r["messages"] if m.type == "tool"][0]
    assert herramienta.status == "success" and "P-1001" in herramienta.content
    assert r["messages"][-1].content == "Tu pedido P-1001 está enviado."


def test_el_error_de_herramienta_vuelve_al_modelo():
    r = ejecutar(AIMessage(content="", tool_calls=[llamada("ver_pedidos", {"email": "nadie@example.com"}, "c1")]),
                 AIMessage(content="No encuentro ese email."))
    herramienta = [m for m in r["messages"] if m.type == "tool"][0]
    assert herramienta.status == "error" and "No hay ningún cliente" in herramienta.content


def test_para_aunque_el_modelo_no_pare():
    bucle = [AIMessage(content="", tool_calls=[llamada("ver_pedidos", {"email": "ana@example.com"}, f"c{i}")])
             for i in range(20)]
    r = ejecutar(*bucle)
    assert len(trayectoria(r)) == 5                     # run_limit=5: cinco llamadas al modelo como mucho
    assert "limit" in r["messages"][-1].content.lower()
```

```python tab="Pydantic AI" title="test_agente_pai.py"
from dataclasses import dataclass

from pydantic_ai import Agent, RunContext
from pydantic_ai.messages import ModelResponse, TextPart, ToolCallPart, ToolReturnPart
from pydantic_ai.models.function import AgentInfo, FunctionModel
from pydantic_ai.models.test import TestModel

MODEL = "anthropic:claude-sonnet-5-5"


@dataclass
class Deps:
    pedidos: dict[str, list[dict]]


agente = Agent(MODEL, deps_type=Deps, instructions="Eres el soporte de una tienda. Usa las herramientas.",
               defer_model_check=True)       # sin esto, crear el agente ya exige ANTHROPIC_API_KEY


@agente.tool
def ver_pedidos(ctx: RunContext[Deps], email: str) -> list[dict]:
    """Lista los pedidos de un cliente por su email."""
    return ctx.deps.pedidos.get(email.lower(), [])


DEPS = Deps(pedidos={"ana@example.com": [{"id": "P-1001", "estado": "enviado"}]})


def partes(resultado, tipo):
    return [p for m in resultado.all_messages() for p in m.parts if isinstance(p, tipo)]


def test_testmodel_llama_a_la_herramienta():
    # TestModel genera argumentos válidos según el esquema: comprueba el cableado, no la lógica
    with agente.override(model=TestModel(call_tools=["ver_pedidos"])):
        r = agente.run_sync("¿Dónde está mi pedido?", deps=DEPS)
    assert [p.tool_name for p in partes(r, ToolCallPart)] == ["ver_pedidos"]


def test_functionmodel_con_guion():
    def guion(mensajes, info: AgentInfo) -> ModelResponse:
        if len(mensajes) == 1:                       # primer turno: pide la herramienta
            return ModelResponse(parts=[ToolCallPart("ver_pedidos", {"email": "ana@example.com"})])
        return ModelResponse(parts=[TextPart("Tu pedido P-1001 está enviado.")])

    with agente.override(model=FunctionModel(guion)):
        r = agente.run_sync("Soy ana@example.com, ¿y mi pedido?", deps=DEPS)
    assert partes(r, ToolCallPart)[0].args == {"email": "ana@example.com"}
    assert partes(r, ToolReturnPart)[0].content == [{"id": "P-1001", "estado": "enviado"}]
    assert r.output == "Tu pedido P-1001 está enviado."
    assert r.usage.requests == 2                      # en la 2.x, usage es una propiedad
```

```python tab="OpenAI Agents SDK" title="test_agente_openai_sdk.py"
import asyncio

from agents import Agent, Runner, Usage, function_tool, set_tracing_disabled
from agents.items import ModelResponse
from agents.models.interface import Model
from openai.types.responses import ResponseFunctionToolCall, ResponseOutputMessage, ResponseOutputText

set_tracing_disabled(True)          # sin esto, el SDK intenta enviar las trazas a la plataforma de OpenAI


@function_tool
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email."""
    return '[{"id": "P-1001", "estado": "enviado"}]'


class ModeloGuion(Model):
    """Un Model propio: devuelve las salidas guionizadas y anota qué herramientas vio."""
    def __init__(self, salidas):
        self.salidas, self.herramientas_vistas = list(salidas), []

    async def get_response(self, system_instructions, input, model_settings, tools, output_schema,
                           handoffs, tracing, **kwargs):
        self.herramientas_vistas.append(sorted(t.name for t in tools))
        return ModelResponse(output=[self.salidas.pop(0)], usage=Usage(), response_id=None)

    def stream_response(self, *args, **kwargs):
        raise NotImplementedError


def test_agents_sdk():
    llamada = ResponseFunctionToolCall(type="function_call", name="ver_pedidos",
                                       arguments='{"email": "ana@example.com"}', call_id="c1", id="c1")
    texto = ResponseOutputMessage(id="m1", type="message", role="assistant", status="completed",
                                  content=[ResponseOutputText(type="output_text", text="Enviado.", annotations=[])])
    modelo = ModeloGuion([llamada, texto])
    agente = Agent(name="Soporte", instructions="Eres el soporte.", tools=[ver_pedidos], model=modelo)
    r = asyncio.run(Runner.run(agente, "¿Dónde está mi pedido?", max_turns=5))
    llamadas = [i.raw_item.arguments for i in r.new_items if i.type == "tool_call_item"]
    assert llamadas == ['{"email": "ana@example.com"}']
    assert r.final_output == "Enviado."
    assert modelo.herramientas_vistas[0] == ["ver_pedidos"]
```

```python tab="Python" title="test_agente_sdk.py"
import json

import anthropic
import httpx2                                    # el SDK anthropic 2.x usa httpx2

MODEL = "claude-sonnet-5-5"
TOOLS = [{"name": "ver_pedidos", "description": "Lista los pedidos de un cliente por su email.",
          "input_schema": {"type": "object", "properties": {"email": {"type": "string"}}, "required": ["email"]}}]


def agente(pregunta: str, client: anthropic.Anthropic, max_pasos: int = 5) -> str:
    """El bucle a mano; en tu proyecto vive en su módulo y recibe el cliente."""
    mensajes = [{"role": "user", "content": pregunta}]
    for _ in range(max_pasos):
        r = client.messages.create(model=MODEL, max_tokens=1024, tools=TOOLS, messages=mensajes)
        mensajes.append({"role": "assistant", "content": r.content})
        if r.stop_reason != "tool_use":
            return "".join(b.text for b in r.content if b.type == "text")
        mensajes.append({"role": "user", "content": [
            {"type": "tool_result", "tool_use_id": b.id, "content": '[{"id": "P-1001"}]'}
            for b in r.content if b.type == "tool_use"]})
    return "[límite de pasos]"


def cliente_simulado(respuestas, peticiones):
    """Un transporte HTTP falso: el SDK real serializa y parsea, pero nada sale a la red."""
    def responder(request):
        cuerpo = json.loads(request.content)
        peticiones.append(cuerpo)
        r = respuestas[len(peticiones) - 1]
        return httpx2.Response(200, json={
            "id": f"msg_{len(peticiones)}", "type": "message", "role": "assistant", "model": cuerpo["model"],
            "content": r["content"], "stop_reason": r["stop_reason"], "stop_sequence": None,
            "usage": {"input_tokens": 100, "output_tokens": 20}})
    return anthropic.Anthropic(api_key="test", max_retries=0,
                               http_client=httpx2.Client(transport=httpx2.MockTransport(responder)))


def test_bucle_con_sdk():
    peticiones = []
    client = cliente_simulado([
        {"stop_reason": "tool_use", "content": [{"type": "tool_use", "id": "toolu_1", "name": "ver_pedidos",
                                                 "input": {"email": "ana@example.com"}}]},
        {"stop_reason": "end_turn", "content": [{"type": "text", "text": "Tu pedido está enviado."}]},
    ], peticiones)
    assert agente("¿Dónde está mi pedido?", client) == "Tu pedido está enviado."
    resultado = peticiones[1]["messages"][-1]["content"][0]   # lo que tu código devolvió al modelo
    assert resultado["type"] == "tool_result" and resultado["tool_use_id"] == "toolu_1"
    assert "temperature" not in peticiones[0]                 # la API 2026-10-21 ya no lo acepta
```

4. **Elige el simulador según lo que pruebas.**

| Framework | Simulador | Para qué |
|---|---|---|
| LangChain / LangGraph | `GenericFakeChatModel` (con `bind_tools` como no-op) | Guion exacto de `AIMessage` con `tool_calls` |
| Pydantic AI | `TestModel(call_tools=[…])` | Comprobar el cableado: llama a las herramientas con argumentos válidos según el esquema |
| Pydantic AI | `FunctionModel(funcion)` | Guion exacto según los mensajes recibidos |
| OpenAI Agents SDK | Una subclase de `Model` | Guion exacto y registro de lo que vio el modelo |
| SDK de Anthropic | `httpx2.MockTransport` en el `http_client` | Probar tu bucle a mano y el JSON exacto que envías |

El transporte falso es el más estricto: el SDK real serializa y parsea, así que pruebas también el formato de `tool_result` y los campos que mandas. La API real además rechaza un `tool_use` sin su `tool_result`; si quieres que tus pruebas lo detecten, añade esa validación en `responder`.

5. **Mételo en CI.** Sin variables secretas: si una prueba necesita `ANTHROPIC_API_KEY`, algo construye el modelo real. En GitHub Actions basta `pytest -q` en el paso de pruebas, junto a las de [[recetas/evals-de-regresion-en-ci]], que sí llaman al modelo pero con menos frecuencia.

## Cómo comprobar que funciona

Las cuatro pestañas, ejecutadas sin `ANTHROPIC_API_KEY` en el entorno (langchain 1.4.7, pydantic-ai-slim 2.63.0, openai-agents 0.24.0, anthropic 2.3.0, pytest 9.2.0):

```text
$ env -u ANTHROPIC_API_KEY PYDANTIC_AI_NO_BANNER=1 python -m pytest -v
test_agente_langchain.py::test_consulta_y_responde PASSED                [ 14%]
test_agente_langchain.py::test_el_error_de_herramienta_vuelve_al_modelo PASSED [ 28%]
test_agente_langchain.py::test_para_aunque_el_modelo_no_pare PASSED      [ 42%]
test_agente_openai_sdk.py::test_agents_sdk PASSED                        [ 57%]
test_agente_pai.py::test_testmodel_llama_a_la_herramienta PASSED         [ 71%]
test_agente_pai.py::test_functionmodel_con_guion PASSED                  [ 85%]
test_agente_sdk.py::test_bucle_con_sdk PASSED                            [100%]
============================== 7 passed in 7.54s ===============================
```

Para saber que las pruebas sirven, rómpelas a propósito: quita `ToolErrorMiddleware` y `test_el_error_de_herramienta_vuelve_al_modelo` debe fallar (la excepción se propaga y rompe el agente); quita `ModelCallLimitMiddleware` y `test_para_aunque_el_modelo_no_pare` debe fallar.

## Variaciones

- **Grafos de LangGraph.** El mismo `FakeToolModel` sirve para un grafo que reciba el modelo como parámetro; así están probadas [[recetas/aprobacion-humana-con-langgraph]] y [[recetas/reanudar-un-agente-tras-un-reinicio]], incluidas la pausa y la reanudación.
- **Salida estructurada.** Si el agente usa `with_structured_output`, sobrescribe ese método en tu modelo falso para devolver objetos ya construidos.
- **Grabar y reproducir.** Guarda en JSON las respuestas reales de una sesión buena y úsalas como guion: una prueba de regresión con datos de verdad.
- **TypeScript.** El AI SDK trae `MockLanguageModelV4` para lo mismo ([[docs/frameworks/11-agentes-en-typescript]]).

## Errores típicos

- **Usar `GenericFakeChatModel` tal cual con `create_agent`.** No implementa `bind_tools` y falla; la subclase de dos líneas lo arregla.
- **Construir el modelo real al importar.** En Pydantic AI, `Agent("anthropic:…")` exige la clave al crearse: usa `defer_model_check=True` o crea el agente en una función. En LangChain, `init_chat_model` dentro del `or`.
- **Asertar el texto final como si fuera del modelo.** El texto lo escribiste tú en el guion. Lo que importa es la trayectoria y la parada.
- **Olvidar el tracing del Agents SDK.** Sin `set_tracing_disabled(True)` intenta exportar trazas a la plataforma de OpenAI.
- **Creer que esto sustituye a las evals.** Un modelo simulado no te dice si el modelo real elegiría bien la herramienta. Para eso, evals con modelo real ([[recetas/evals-con-promptfoo]]).
