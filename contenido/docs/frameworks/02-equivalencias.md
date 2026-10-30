---
titulo: Equivalencias entre SDK y frameworks
descripcion: "Cómo se llama cada concepto de MoreContext (bucle, parada, enrutado, orquestador, aprobación, memoria, MCP, salida estructurada, trazas…) en el SDK de Anthropic, LangChain, LangGraph, OpenAI Agents SDK y Pydantic AI."
creado: 2026-10-29
orden: 2
nivel: intermedio
tags: [frameworks, referencia, langchain, langgraph, openai-agents-sdk, pydantic-ai]
relacionados: ["[[docs/frameworks/01-elegir-framework]]", "[[glosario/framework-de-agentes]]", "[[patrones/09-elegir-patron]]", "[[cursos/langchain-y-langgraph/index]]"]
---

MoreContext explica cada idea primero con el SDK de Anthropic y el bucle escrito a mano, porque así se ve el mecanismo. Esta página es el diccionario para cuando cambias a un [[glosario/framework-de-agentes|framework]]: para cada concepto, el nombre exacto de la pieza en el SDK de Anthropic, [[docs/frameworks/04-langchain|LangChain]] 1.4, [[docs/frameworks/05-langgraph|LangGraph]] 1.2, el [[docs/frameworks/06-openai-agents-sdk|OpenAI Agents SDK]] 0.24 y [[docs/frameworks/07-pydantic-ai|Pydantic AI]] 2.63 (versiones de 29 de octubre de 2026). La primera columna enlaza a donde se explica el concepto.

«Tu código» significa que el framework no trae una pieza para eso: lo escribes con Python normal, igual que con el SDK. Todos los nombres se comprobaron con los paquetes instalados.

## SDK de Anthropic, LangChain y LangGraph

| Concepto | SDK de Anthropic (referencia) | LangChain | LangGraph |
|---|---|---|---|
| [[patrones/02-llamada-aumentada\|Llamada aumentada]] | `client.messages.create(system=…, tools=…, messages=…)` | `init_chat_model(...).bind_tools(tools).invoke(msgs)` | Un nodo que llama a `llm.bind_tools(...)` |
| [[roadmap/20-herramientas/01-ciclo-tool-use\|tool_use / tool_result]] | Bloques `tool_use` → `tool_result` | `AIMessage.tool_calls` → `ToolMessage(tool_call_id=…)` | `ToolNode(tools)` ejecuta y devuelve los `ToolMessage` |
| [[roadmap/20-herramientas/03-errores-e-is-error\|Error de herramienta]] | `tool_result` con `is_error: true` | `ToolMessage(status="error")`; **hace falta `ToolErrorMiddleware`** para excepciones | `ToolNode` solo captura argumentos inválidos; el resto se propaga |
| [[roadmap/40-primer-agente/02-el-bucle-agentico\|Bucle agéntico]] | Tu `while` sobre `stop_reason` | `create_agent(model, tools, …)` | `StateGraph` modelo ⇄ `ToolNode` con `tools_condition` |
| [[roadmap/40-primer-agente/03-condiciones-de-parada\|Condiciones de parada]] | `max_pasos`, `stop_reason`, `max_tokens` | `ModelCallLimitMiddleware(run_limit=…)`, `ToolCallLimitMiddleware` | `config["recursion_limit"]` → `GraphRecursionError`; aristas a `END` |
| [[patrones/03-encadenado\|Encadenado]] | Funciones en secuencia con comprobaciones | Llamadas en secuencia | `add_edge` en serie, o `@entrypoint` + `@task` |
| [[patrones/04-enrutado\|Enrutado]] | Clasificar con salida estructurada + `if` | `with_structured_output(Ruta, method="json_schema")` + `if` | `add_conditional_edges(origen, fn, [...])` o `Command(goto=…)` |
| [[patrones/05-paralelizacion\|Paralelización]] | `asyncio.gather` | `model.batch([...])` | Varias aristas desde un nodo, o `Send`, más un reductor |
| [[patrones/06-orquestador-trabajadores\|Orquestador y trabajadores]] | Plan en JSON + `gather` + síntesis | Subagentes como herramientas; [[docs/frameworks/10-deep-agents\|Deep Agents]] `subagents=[…]` → `task` | `Send` (map-reduce) con `Annotated[list, operator.add]` |
| [[patrones/07-evaluador-optimizador\|Evaluador-optimizador]] | Bucle generar → criticar | Tu código con dos llamadas | Ciclo con una arista condicional de vuelta |
| [[docs/agentes/03-humano-en-el-bucle\|Humano en el bucle]] | Pausar tu bucle antes de ejecutar y guardar `messages` | `HumanInTheLoopMiddleware(interrupt_on=…)` + `Command(resume={"decisions": [...]})` | `interrupt(valor)` + `Command(resume=…)` + checkpointer + `thread_id` |
| [[docs/contexto/04-memoria\|Memoria]] | Tú guardas `messages` | `checkpointer` + `thread_id`; `store` + `ToolRuntime` | `InMemorySaver` / `SqliteSaver` / `PostgresSaver`; `InMemoryStore` / `PostgresStore` |
| [[docs/herramientas/02-mcp\|MCP]] | Cliente `mcp` y convertir herramientas, o el conector `mcp_servers` | `langchain.mcp.MCPAdapter` (beta) | Las mismas herramientas en un `ToolNode` |
| [[docs/prompting/03-salida-estructurada\|Salida estructurada]] | `output_config={"format": …}` o `messages.parse(output_format=…)` | `response_format=Modelo` → `structured_response` | `llm.with_structured_output(M, method="json_schema")` dentro de un nodo |
| [[docs/fundamentos/04-streaming\|Streaming]] | `client.messages.stream(...)` | `agent.stream(..., stream_mode="messages")` | `graph.stream(stream_mode="updates" \| "messages" \| "custom")` |
| [[roadmap/40-primer-agente/06-depurar-con-trazas\|Trazas]] | Registrar `messages`, `stop_reason` y `usage` | `pretty_print()`, callbacks, OpenTelemetry o LangSmith (comercial) | `stream_mode="debug"`, `get_state_history(config)` |

## OpenAI Agents SDK y Pydantic AI

| Concepto | OpenAI Agents SDK | Pydantic AI |
|---|---|---|
| [[patrones/02-llamada-aumentada\|Llamada aumentada]] | `Agent(instructions, tools)` + `Runner.run` | `Agent(model, instructions, tools, deps_type)` |
| [[roadmap/20-herramientas/01-ciclo-tool-use\|tool_use / tool_result]] | `@function_tool`; items `tool_call_item` → `tool_call_output_item` | `ToolCallPart` → `ToolReturnPart` |
| [[roadmap/20-herramientas/03-errores-e-is-error\|Error de herramienta]] | El bucle sigue, pero con un texto genérico; `failure_error_function` para el mensaje real | `ModelRetry("…")` → `RetryPromptPart`; tras `retries`, `UnexpectedModelBehavior` |
| [[roadmap/40-primer-agente/02-el-bucle-agentico\|Bucle agéntico]] | `Runner.run` / `run_sync` | `agent.run` / `run_sync` / `iter` |
| [[roadmap/40-primer-agente/03-condiciones-de-parada\|Condiciones de parada]] | `max_turns` (10) → `MaxTurnsExceeded`; `tool_use_behavior`, `StopAtTools` | `UsageLimits(request_limit, tool_calls_limit, total_tokens_limit…)` → `UsageLimitExceeded` |
| [[patrones/03-encadenado\|Encadenado]] | Tu código entre varios `Runner.run` | Tu código, o `pydantic-graph` |
| [[patrones/04-enrutado\|Enrutado]] | `handoffs=[…]` (el modelo elige con `transfer_to_<agente>`) | `output_type` con unión de modelos + `if` |
| [[patrones/05-paralelizacion\|Paralelización]] | `asyncio.gather(Runner.run(...), …)` | `asyncio.gather(agent.run(...), …)`; `Fork` / `Join` en `pydantic-graph` |
| [[patrones/06-orquestador-trabajadores\|Orquestador y trabajadores]] | `agente.as_tool(...)` | Un agente que llama a otro dentro de una `@agent.tool` |
| [[patrones/07-evaluador-optimizador\|Evaluador-optimizador]] | Agente juez en bucle, u `output_guardrails` | `@agent.output_validator` + `ModelRetry` |
| [[docs/agentes/03-humano-en-el-bucle\|Humano en el bucle]] | `function_tool(needs_approval=True)` → `result.interruptions` → `state.approve` / `reject` | `requires_approval=True` → `DeferredToolRequests` → `DeferredToolResults(approvals=…)` |
| [[docs/contexto/04-memoria\|Memoria]] | `SQLiteSession` y otras `Session` | `message_history=r.all_messages()` + tu almacenamiento |
| [[docs/herramientas/02-mcp\|MCP]] | `MCPServerStdio`, `MCPServerStreamableHttp`, `HostedMCPTool` | `MCPToolset` (extra `[mcp]`) o `capabilities=[MCP(url)]` |
| [[docs/prompting/03-salida-estructurada\|Salida estructurada]] | `Agent(output_type=Modelo)` → `final_output` | `output_type=Modelo` (`ToolOutput`, `NativeOutput`, `PromptedOutput`) |
| [[docs/fundamentos/04-streaming\|Streaming]] | `Runner.run_streamed(...)` → `stream_events()` | `run_stream` / `run_stream_events` |
| [[roadmap/40-primer-agente/06-depurar-con-trazas\|Trazas]] | Tracing integrado, **por defecto a la plataforma de OpenAI**; `set_tracing_disabled`, procesadores propios | Logfire (comercial) u OpenTelemetry; `capture_run_messages` |

El [[docs/frameworks/03-claude-agent-sdk|Claude Agent SDK]] no aparece en las tablas porque no es un framework para montar piezas: trae el bucle de Claude Code entero. Sus equivalentes son otros: `max_turns` y `max_budget_usd` para parar, `can_use_tool` y hooks `PreToolUse` para aprobar, `agents` para subagentes, `mcp_servers` para MCP, `output_format` para la salida estructurada y `resume` para la memoria de la sesión.

## La fila que más importa: los errores de herramienta

La diferencia que más sorprende al pasar del SDK a un framework es qué pasa cuando una herramienta lanza una excepción. Con el SDK lo decides tú; cada framework tiene su valor por defecto, y en LangChain y LangGraph ese valor es **romper el agente**. Así se consigue en cada uno que el modelo lea el error y pueda corregirse:

```python tab="Python" title="error_sdk.py"
def ejecutar(bloque, funciones: dict) -> dict:
    """Convierte un bloque tool_use en su tool_result; los fallos vuelven al modelo con is_error."""
    try:
        salida = funciones[bloque.name](**bloque.input)
        return {"type": "tool_result", "tool_use_id": bloque.id, "content": str(salida)}
    except Exception as e:
        return {"type": "tool_result", "tool_use_id": bloque.id, "content": f"Error: {e}", "is_error": True}
```

```python tab="LangChain" title="error_langchain.py"
from langchain.agents import create_agent
from langchain.agents.middleware import ToolErrorMiddleware

MODEL = "anthropic:claude-sonnet-5-5"


def error_para_el_modelo(exc: Exception, request) -> str:
    return f"Error: {exc}"                     # llega como ToolMessage(status="error")


def crear(tools, model=MODEL):
    # Sin el middleware, la excepción se propaga y corta el agente.
    return create_agent(model, tools, middleware=[ToolErrorMiddleware(on_error=error_para_el_modelo)])
```

```python tab="OpenAI Agents SDK" title="error_openai_agents.py"
from agents import function_tool


def error_visible(ctx, error: Exception) -> str:
    return f"Error: {error}"                   # sin esto, el modelo ve un mensaje genérico


@function_tool(failure_error_function=error_visible)
def ver_pedido(pedido_id: str) -> str:
    """Devuelve el estado de un pedido."""
    raise ValueError(f"No existe el pedido {pedido_id}")
```

```python tab="Pydantic AI" title="error_pydantic_ai.py"
from pydantic_ai import Agent, ModelRetry

MODEL = "anthropic:claude-sonnet-5-5"
agente = Agent(MODEL, retries=2, defer_model_check=True)


@agente.tool_plain
def ver_pedido(pedido_id: str) -> str:
    """Devuelve el estado de un pedido."""
    if not pedido_id.startswith("P-"):
        raise ModelRetry("El id tiene formato P-NNNN.")   # vuelve al modelo y reintenta (máx. retries)
    return '{"estado": "enviado"}'
```

Los cuatro se ejecutaron con modelos simulados: el SDK devuelve el `tool_result` con `is_error`, LangChain un `ToolMessage` con `status="error"` y el texto «Error: …», el Agents SDK «Error: No existe el pedido X» en lugar del mensaje genérico, y Pydantic AI reintenta hasta agotar `retries` y termina con `UnexpectedModelBehavior`. En el [[docs/frameworks/11-agentes-en-typescript|AI SDK de TypeScript]] el error vuelve solo al modelo como `tool-error`.

## Cómo leer estas tablas

- **Nombre parecido no es comportamiento igual.** Revisa los valores por defecto: el `recursion_limit` de LangGraph (10 007) no frena nada, el `max_turns` del Agents SDK (10) frena pronto, y `ChatAnthropic` sin `max_tokens` usa el máximo del modelo.
- **«Tu código» no es una carencia.** El encadenado o el evaluador-optimizador son tres funciones y un `for`; un framework no los mejora por meterlos en un grafo.
- **Los nombres cambian deprisa.** Entre mayo y octubre de 2026 LangChain añadió `langchain.mcp`, `version="v2"` en `invoke` y un protocolo de eventos nuevo. Fija versiones y vuelve a la página del framework si algo no cuadra.
- **Salida estructurada con Claude 5.5**: no fuerces herramientas. `with_structured_output` necesita `method="json_schema"` con `ChatAnthropic`, y `ToolStrategy` de LangChain fuerza `tool_choice="any"`, que esos modelos rechazan ([[recetas/entregar-resultado-sin-forzar-herramienta]]).

Para probar que tu traducción se comporta como el original sin gastar en llamadas, escribe la misma prueba de trayectoria con un [[glosario/modelo-simulado|modelo simulado]] en cada lado ([[recetas/probar-agentes-sin-api]]).

## Ver también

- [[docs/frameworks/01-elegir-framework]]: cuál usar y por qué.
- [[cursos/langchain-y-langgraph/01-cuando-usar-un-framework]]: la misma pregunta, en el curso.
- [[patrones/index]]: los patrones de la primera columna, explicados.
- [[glosario/middleware]], [[glosario/handoff]] y [[glosario/checkpointer]]: los términos que solo existen en los frameworks.
