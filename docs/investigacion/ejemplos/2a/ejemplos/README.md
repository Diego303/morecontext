# Ejemplos verificados · Investigación 2A (frameworks open source)

Cada ejemplo usa Claude con la integración oficial del framework y se ha **ejecutado con modelos simulados** (sin claves ni red) el 29-10-2026. Los archivos `test_*.py` son las pruebas; los demás son el código que se puede publicar.

## Cómo ejecutarlos

```bash
cd /tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-2a/ejemplos
bash ejecutar_todo.sh            # todas las pruebas; salida guardada en ../logs/ejecutar_todo.log
../venv/bin/python test_lg_01.py # una sola
```

Con una clave real: `export ANTHROPIC_API_KEY=...` y `../venv/bin/python lc_01_agente.py` (cualquiera que tenga `if __name__ == "__main__"`).

## Entornos (uno por framework para evitar conflictos de dependencias)

| venv (en `tmp-2a/`) | Paquetes clave |
|---|---|
| `venv` | langchain 1.4.7, langchain-core 1.7.2, langchain-anthropic 1.7.7, langchain-ollama 1.1.0, langgraph 1.2.18, langgraph-checkpoint-sqlite 3.1.2, deepagents 0.7.32, langchain-mcp-adapters 0.3.2 (**mcp 1.30.0**), openai-agents 0.24.0 [+litellm 1.83.0], pydantic-ai-slim 2.63.0 |
| `venv-lcmcp` | langchain[mcp,anthropic] 1.4.7 → fastmcp 4.1.4, **mcp 2.3.0** |
| `venv-llamaindex` | llama-index-core 0.14.25, llama-index-llms-anthropic 0.12.3, llama-index-llms-ollama 0.11.0 |
| `venv-crewai` | crewai[anthropic] 1.15.33 (fija pydantic 2.12.5, mcp<2) |
| `venv-smolagents` | smolagents[litellm] 1.26.0 |
| `venv-dspy` | dspy 3.4.1 |
| `venv-adk` | google-adk 2.13.0 + litellm |
| `venv-haystack` | haystack-ai 3.4.1, anthropic-haystack 8.0.1, ollama-haystack 7.0.2 |
| `venv-strands` | strands-agents[anthropic,ollama] 1.62.0 |
| `venv-agno` | agno 3.1.12 |
| `venv-maf2` | agent-framework-core 1.23.0, agent-framework-anthropic/ollama 1.0.0b261022 |

`venv-maf` (agent-framework 1.19.0) quedó con una versión antigua al resolver el metapaquete: no usarlo.

## Qué prueba cada archivo

| Ejemplo | Prueba | Qué se verificó |
|---|---|---|
| `lc_01_agente.py` | `test_lc_01.py` | `create_agent` + `@tool(parse_docstring=True)`; dos tool_calls en paralelo → dos `ToolMessage`; **sin `ToolErrorMiddleware` una excepción de herramienta rompe el agente**; con él vuelve como `status="error"`; `ModelCallLimitMiddleware` |
| `lc_02_aprobacion.py` | `test_lc_02.py` | `HumanInTheLoopMiddleware` con approve / reject / edit; `invoke(..., version="v2")` → `GraphOutput.interrupts`; `Command(resume={"decisions": [...]})` |
| `lg_01_grafo_aprobacion.py` | `test_lg_01.py` | `StateGraph(MessagesState)`, `ToolNode`, aristas condicionales, `interrupt()` + `Command(resume=…)`, `SqliteSaver.from_conn_string` reanudando en otra conexión, `recursion_limit` → `GraphRecursionError`, `stream_mode="updates"` |
| `lg_02_orquestador_send.py` | `test_lg_02.py` | Map-reduce con `Send`, reductor `operator.add`, ejecución paralela real (0,41 s frente a 0,8 s en serie) |
| `lg_03_functional_y_memoria.py` | `test_lg_03.py` | `@entrypoint`/`@task` + `interrupt` (la tarea no se repite al reanudar); `InMemoryStore` + `ToolRuntime` compartiendo memoria entre threads |
| `da_01_deep_agent.py` | `test_da_01.py` | `create_deep_agent` con subagente (`task`), archivos virtuales (`files` en el estado) y `TodoListMiddleware` (desde 0.7 `write_todos` no viene por defecto) |
| `mcp_01_agente_con_mcp.py` + `mcp_servidor_pedidos.py` | `test_mcp_01.py` | `MultiServerMCPClient` stdio; error del servidor → `status="error"`; **0.3.2 no importa con mcp 2.x**; cliente mcp 1.x ↔ servidor mcp 2.x sí interopera |
| `mcp_02_langchain_mcp.py` | `test_mcp_02.py` (venv-lcmcp) | `langchain.mcp.MCPAdapter` (beta) con mcp 2.3.0 |
| `oai_01_agentes.py` | `test_oai_01.py` | `Agent`, `Runner.run`, `function_tool`, handoff, `needs_approval` + `RunState.approve`, `input_guardrail`, `SQLiteSession`, `MaxTurnsExceeded`, `LitellmModel` |
| `pai_01_agente.py` | `test_pai_01.py` | `Agent(deps_type, output_type=[Modelo, DeferredToolRequests])`, `@agent.tool`, `requires_approval`, `DeferredToolResults`/`ToolDenied`, `UsageLimits`, `ModelRetry`, `TestModel`/`FunctionModel` |
| `li_01_llamaindex.py` | `test_li_01.py` | `Workflow` + `@step` + eventos + `ctx.store`; construcción de `FunctionAgent` con `Anthropic` |
| `crew_01_crewai.py` | `test_crew_01.py` (venv-crewai) | Construcción del `Crew` con `LLM("anthropic/…")` → `AnthropicCompletion`; `Flow` con `@start`/`@listen` ejecutado |
| `otros_01_minimos.py` | `… <framework>` | Construcción con Claude de smolagents, DSPy (con `DummyLM`, ejecutado), ADK, Haystack, Strands y Microsoft Agent Framework |
| `../ts/*.ts` | `npx tsc --noEmit`, `node test_aisdk.mjs`, `node test_langchain.mjs` | AI SDK v7 (`generateText`+`stopWhen`, `ToolLoopAgent`, `needsApproval`), LangChain.js `createAgent` + HITL, LangGraph.js, OpenAI Agents JS + `aisdk()`, Mastra |

`_fakes.py` contiene `FakeToolModel`: `GenericFakeChatModel` de langchain_core no implementa `bind_tools` y `create_agent` lo necesita.
