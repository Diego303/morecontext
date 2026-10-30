---
titulo: OpenAI Agents SDK
descripcion: "Referencia del OpenAI Agents SDK (MIT): Agent, Runner, function_tool, handoffs, guardrails, aprobación, sesiones y tracing, usado con Claude a través de LiteLLM."
creado: 2026-10-29
orden: 6
nivel: intermedio
tags: [frameworks, openai-agents-sdk, agentes, open-source, python, multiagente]
relacionados: ["[[herramientas/openai-agents-sdk]]", "[[glosario/handoff]]", "[[glosario/guardrails]]", "[[herramientas/litellm]]"]
---

El **OpenAI Agents SDK** (`openai-agents`, licencia **MIT**, versión 0.24.0 a 15 de octubre de 2026) es un SDK pequeño para agentes y multiagente. Sus primitivas son pocas: un `Agent` es configuración (instrucciones, herramientas, a quién puede pasar la conversación), `Runner` ejecuta el bucle, y alrededor hay *handoffs*, *guardrails*, aprobación humana, sesiones y trazas. Aunque lo publica OpenAI, se declara independiente del proveedor: con el extra `[litellm]` funciona con Claude y con modelos locales. Tiene versión para TypeScript, `@openai/agents` ([[docs/frameworks/11-agentes-en-typescript]]).

Lo que es comercial aquí es el panel de trazas de la plataforma de OpenAI, que además es **el destino por defecto de las trazas**. Lo verás más abajo.

## Modelo mental

- `Agent(name, instructions, tools, handoffs, output_type, …)` no ejecuta nada: describe un agente.
- `Runner.run(agente, entrada, max_turns=10)` hace el [[glosario/bucle-agentico|bucle]]: llama al modelo, ejecuta herramientas, repite hasta una salida final o hasta `max_turns`.
- Un **[[glosario/handoff|handoff]]** se le ofrece al modelo como una herramienta más, `transfer_to_<nombre>`. Si la llama, el agente activo cambia y la conversación sigue con el especialista.
- `agente.as_tool(tool_name, tool_description)` hace lo contrario: el otro agente trabaja como herramienta y devuelve su resultado sin quedarse con la conversación. Es el [[patrones/06-orquestador-trabajadores|orquestador y trabajadores]].

## API esencial

| Pieza | Firma (0.24.0) |
|---|---|
| `Agent` | `name`, `instructions`, `tools`, `handoffs`, `handoff_description`, `model`, `model_settings`, `output_type`, `input_guardrails`, `output_guardrails`, `mcp_servers`, `hooks`, `tool_use_behavior` |
| `Runner` | `run(starting_agent, input, *, context=None, max_turns=10, session=None, run_config=None, …)`, `run_sync`, `run_streamed` |
| Herramientas | `@function_tool(failure_error_function=…, needs_approval=False, strict_mode=True, timeout=…)` |
| Ajustes | `ModelSettings(max_tokens=…, tool_choice=…, parallel_tool_calls=…, reasoning=…)` |
| Sesiones | `SQLiteSession(session_id, db_path=":memory:")` |
| Modelos | `LitellmModel(model, base_url=None, api_key=None)` en `agents.extensions.models.litellm_model` |
| MCP | `agents.mcp.MCPServerStdio`, `MCPServerStreamableHttp`, `HostedMCPTool` |

## Claude y modelos locales

```bash
pip install "openai-agents[litellm]"
export ANTHROPIC_API_KEY=...          # LiteLLM lee la clave del proveedor
```

Claude va por `LitellmModel(model="anthropic/claude-sonnet-5-5")`, y Ollama por `LitellmModel(model="ollama_chat/qwen3")` u `OpenAIChatCompletionsModel` apuntando a `http://localhost:11434/v1`. La ruta de Ollama no se ha ejecutado contra un servidor real en esta página. [[herramientas/litellm|LiteLLM]] traduce entre formatos de proveedor: es una dependencia más que vigilar, y el extra `[litellm]` fija una versión concreta (1.83.0 hoy), no la última. Fija versiones y usa hashes en `requirements`.

## Ejemplo completo

Un triaje que pasa las devoluciones a un especialista, con un error de herramienta visible para el modelo, un reembolso que espera aprobación, un *guardrail* de entrada y una sesión persistente en SQLite.

```python title="agentes_openai_sdk.py"
import asyncio
import json

from agents import (Agent, GuardrailFunctionOutput, ModelSettings, Runner, SQLiteSession,
                    function_tool, input_guardrail, set_tracing_disabled)
from agents.extensions.models.litellm_model import LitellmModel

MODEL = LitellmModel(model="anthropic/claude-sonnet-5-5")   # local: LitellmModel(model="ollama_chat/qwen3")
set_tracing_disabled(True)   # las trazas van por defecto a la plataforma de OpenAI; desactívalas o usa tu exportador

PEDIDOS = {"ana@example.com": [{"id": "P-1001", "estado": "enviado"}]}


def error_visible(ctx, error: Exception) -> str:
    return f"Error: {error}"          # por defecto el modelo solo ve un mensaje genérico


@function_tool(failure_error_function=error_visible)
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email.

    Args:
        email: Email del cliente.
    """
    if email.lower() not in PEDIDOS:
        raise ValueError(f"No hay ningún cliente con email {email}")
    return json.dumps(PEDIDOS[email.lower()], ensure_ascii=False)


@function_tool(needs_approval=True)             # pausa la ejecución hasta que un humano apruebe
def reembolsar(pedido_id: str, importe_eur: float) -> str:
    """Emite un reembolso. Acción irreversible."""
    return f"Reembolso de {importe_eur} € emitido para {pedido_id}."


@input_guardrail
async def sin_datos_de_tarjeta(ctx, agent, entrada) -> GuardrailFunctionOutput:
    texto = entrada if isinstance(entrada, str) else json.dumps(entrada, ensure_ascii=False)
    return GuardrailFunctionOutput(output_info=None, tripwire_triggered="tarjeta" in texto.lower())


def crear_agentes(model=MODEL):
    ajustes = ModelSettings(max_tokens=1024)
    devoluciones = Agent(
        name="Devoluciones", model=model, model_settings=ajustes,
        handoff_description="Especialista en devoluciones y reembolsos.",
        instructions="Gestiona devoluciones. Antes de reembolsar, confirma el pedido.",
        tools=[ver_pedidos, reembolsar],
    )
    triaje = Agent(
        name="Soporte", model=model, model_settings=ajustes,
        instructions="Eres el soporte de una tienda. Para devoluciones, pasa al especialista.",
        tools=[ver_pedidos],
        handoffs=[devoluciones],                 # se expone al modelo como herramienta transfer_to_devoluciones
        input_guardrails=[sin_datos_de_tarjeta],
    )
    return triaje, devoluciones


async def main():
    triaje, _ = crear_agentes()
    sesion = SQLiteSession("cliente-ana", "conversaciones.db")   # el historial se guarda entre ejecuciones
    r = await Runner.run(triaje, "Quiero devolver P-1001", session=sesion, max_turns=10)
    while r.interruptions:                                       # needs_approval => pausa
        estado = r.to_state()
        for item in r.interruptions:
            estado.approve(item)                                 # o estado.reject(item)
        r = await Runner.run(triaje, estado)
    print(r.final_output, "| último agente:", r.last_agent.name)


if __name__ == "__main__":
    asyncio.run(main())
```

Qué hace cada pieza:

- **Errores de herramienta.** Si una herramienta lanza una excepción, el SDK no rompe el bucle, pero al modelo le llega un texto genérico: «An error occurred while running the tool. Please try again.». Con `failure_error_function` decides qué ve, que es lo que haces con `is_error` en [[roadmap/20-herramientas/03-errores-e-is-error]].
- **Aprobación.** Con `needs_approval=True`, `Runner.run` termina con `r.interruptions` en vez de ejecutar. `r.to_state()` da un `RunState` serializable; `estado.approve(item)` o `estado.reject(item)` y otra llamada a `Runner.run` con ese estado reanudan. Puedes guardar el estado y reanudar más tarde ([[docs/agentes/03-humano-en-el-bucle]]).
- **Guardrails.** Un `@input_guardrail` corre sobre la entrada; si devuelve `tripwire_triggered=True`, el run lanza `InputGuardrailTripwireTriggered`. Por defecto corre **en paralelo** con la primera llamada del agente (`run_in_parallel=True`), así que esa llamada se paga igual; con `@input_guardrail(run_in_parallel=False)` se ejecuta antes y bloquea de verdad. Hay también `@output_guardrail` para validar la salida final ([[glosario/guardrails]]).
- **Sesiones.** `SQLiteSession` guarda los mensajes entre ejecuciones con la misma clave: no tienes que reenviar el historial tú.
- **Parada.** `max_turns` (10 por defecto) lanza `MaxTurnsExceeded`. `tool_use_behavior` y `StopAtTools` cortan el bucle cuando se llama a ciertas herramientas ([[roadmap/40-primer-agente/03-condiciones-de-parada]]).

Con `output_type=MiModelo` en el `Agent`, `r.final_output` llega como instancia validada de ese modelo de Pydantic en vez de texto ([[glosario/salida-estructurada]]).

## Probarlo sin API

El SDK define una interfaz `Model` con `get_response`. Si la implementas con una lista de respuestas guionizadas, pruebas handoffs, aprobaciones y errores sin red ni clave ([[glosario/modelo-simulado]]):

```python title="prueba_agentes_openai.py"
import asyncio

from agents import Runner, Usage
from agents.items import ModelResponse
from agents.models.interface import Model
from openai.types.responses import ResponseFunctionToolCall, ResponseOutputMessage, ResponseOutputText

from agentes_openai_sdk import crear_agentes


def llamada(nombre, args_json, cid):
    return ResponseFunctionToolCall(type="function_call", name=nombre, arguments=args_json, call_id=cid, id=cid)


def texto(t):
    return ResponseOutputMessage(id="m", type="message", role="assistant", status="completed",
                                 content=[ResponseOutputText(type="output_text", text=t, annotations=[])])


class Guion(Model):
    """Model propio: devuelve las respuestas guionizadas en orden, sin red."""
    def __init__(self, pasos):
        self.pasos = list(pasos)

    async def get_response(self, system_instructions, input, model_settings, tools, output_schema,
                           handoffs, tracing, **kwargs):
        return ModelResponse(output=[self.pasos.pop(0)], usage=Usage(), response_id=None)

    def stream_response(self, *args, **kwargs):
        raise NotImplementedError


async def handoff_y_aprobacion():
    modelo = Guion([llamada("transfer_to_devoluciones", "{}", "h1"),
                    llamada("reembolsar", '{"pedido_id": "P-1001", "importe_eur": 49.9}', "r1"),
                    texto("Reembolso emitido.")])
    triaje, _ = crear_agentes(modelo)
    r = await Runner.run(triaje, "Quiero devolver P-1001")
    assert r.last_agent.name == "Devoluciones" and len(r.interruptions) == 1   # pausado
    estado = r.to_state()
    estado.approve(r.interruptions[0])
    r = await Runner.run(triaje, estado)
    assert r.final_output == "Reembolso emitido."


def test_handoff_y_aprobacion():          # pytest sin plugins de asyncio
    asyncio.run(handoff_y_aprobacion())
```

La prueba pasa: el handoff cambia el agente activo a «Devoluciones», el reembolso se para hasta la aprobación y, al aprobar, se ejecuta. Más casos en [[recetas/probar-agentes-sin-api]].

## Trazas

El tracing viene **activado** y exporta a `https://api.openai.com/v1/traces/ingest`. Sin clave de OpenAI falla al exportar (verás errores en el log) y, con clave, envía tus prompts y resultados a un tercero. Tres opciones:

1. Desactivarlo: `set_tracing_disabled(True)` o la variable `OPENAI_AGENTS_DISABLE_TRACING`.
2. Sustituir el destino: `set_trace_processors([...])` con tu propio procesador.
3. Añadir uno más: `add_trace_processor(...)`, por ejemplo hacia OpenTelemetry ([[docs/produccion/04-opentelemetry-genai]]).

Para depurar sin panel, `r.new_items` lista lo que pasó en el run: mensajes, llamadas a herramientas (`tool_call_item`) y sus resultados (`tool_call_output_item`).

> [!aviso] Revisa adónde van tus datos
> El valor por defecto manda el contenido de cada run a la plataforma de OpenAI aunque el modelo sea Claude. Si trabajas con datos de clientes, decide el destino de las trazas antes del primer despliegue.

## Cuándo encaja

- Triaje entre especialistas con handoffs y guardrails declarativos.
- Equipos que quieren un SDK pequeño, con pocas ideas que aprender.
- Sesiones listas sin montar base de datos.

Cuándo no:

- Flujos largos que deben sobrevivir a una caída a mitad de paso. `RunState` se serializa, pero no hay checkpoints por paso como en [[docs/frameworks/05-langgraph|LangGraph]].
- Si no quieres LiteLLM entre tu código y Claude. Con Claude como único modelo, el [[herramientas/anthropic-sdk|SDK de Anthropic]] o el [[docs/frameworks/03-claude-agent-sdk|Claude Agent SDK]] te dan acceso directo a lo nuevo de la API.

## Errores frecuentes

- No fijar `max_tokens` en `ModelSettings`.
- Dejar el error genérico de herramientas: el modelo reintenta a ciegas.
- Olvidar el tracing por defecto.
- Esperar que `max_turns` sea alto: son 10.

## Ver también

- [[docs/frameworks/02-equivalencias]]: cómo se llama cada concepto aquí y en los demás.
- [[glosario/handoff]] y [[patrones/04-enrutado]]: el handoff es un enrutado que decide el modelo.
- [[herramientas/openai-agents-sdk]]: ficha del directorio.
- [[docs/frameworks/01-elegir-framework]]: cuándo compensa frente a los demás.
