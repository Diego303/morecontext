# Investigación 2A · Frameworks open source para construir agentes

> Para MoreContext (morecontextai.com) · 29 de octubre de 2026
> Alcance: frameworks y SDK para construir agentes (LangChain, LangGraph, Deep Agents, OpenAI Agents SDK, Pydantic AI, LlamaIndex, CrewAI, ADK, Microsoft Agent Framework, smolagents, Haystack, DSPy, Strands, Agno, Mastra, Vercel AI SDK, LangChain.js/LangGraph.js). La infraestructura open source (modelos abiertos, inferencia local, bases vectoriales, observabilidad, evals y agentes de código) la cubre otro informe.

## Método y límites (léelo primero)

- **Versiones**: consultadas el 29-10-2026 en la API JSON de PyPI (`https://pypi.org/pypi/<paquete>/json`) y con `npm view`. Licencias contrastadas con los ficheros `LICENSE` y `METADATA` de los paquetes instalados.
- **APIs**: instalé las versiones actuales en entornos virtuales separados (Python 3.13.17) y comprobé firmas con `inspect.signature`, nombres exportados y el código fuente instalado. En TypeScript instalé los paquetes y compilé con `tsc --noEmit` (TypeScript 7.0.2). Comprobé que el compilador detecta errores reales con un archivo de control.
- **Ejecución**: todos los ejemplos marcados como VERIFICADO **se han ejecutado** con modelos simulados: `GenericFakeChatModel` con `bind_tools`, `TestModel`/`FunctionModel` en Pydantic AI, un `Model` propio en el OpenAI Agents SDK, `DummyLM` en DSPy, `MockLanguageModelV4` en el AI SDK y `FakeToolCallingModel` en LangChain.js. **No hay llamadas reales a Claude ni a Ollama**: no había clave ni servidor Ollama. Para Claude inspeccioné el *payload* exacto que `ChatAnthropic` enviaría (`_get_request_payload`).
- **Web**: leí las páginas oficiales de LangChain (agents, middleware, structured output, interrupts, changelog, release v1, blog 1.0, blog de Deep Agents v0.7, harness). **El presupuesto de búsquedas web de la sesión se agotó a mitad del trabajo** (límite compartido entre agentes) y varios dominios de documentación no estaban en la lista permitida. Para el resto de frameworks usé fuentes primarias publicadas por los propios mantenedores: README de PyPI/npm, metadatos, ficheros LICENSE y código instalado. Lo que no pude confirmar así está marcado **SIN CONFIRMAR**.
- Ejemplos, pruebas y registro: `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-2a/ejemplos/` (con `README.md` y `ejecutar_todo.sh`). La salida completa de la última ejecución está en `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-2a/logs/ejecutar_todo.log`.

---

## 1. Resumen ejecutivo

1. **LangChain 1.4.7 y LangGraph 1.2.18** (MIT, estables, compromiso de «no breaking changes until 2.0» desde octubre de 2025) son hoy la pareja más completa para enseñar con open source. `create_agent` resuelve el bucle agéntico. LangGraph es el grafo explícito que hay debajo, y lo usas cuando necesitas controlar cada paso.
2. **Trampas verificadas en LangChain/LangGraph 1.x**: el `recursion_limit` por defecto de LangGraph es 10007, así que sin límite explícito no hay tope de pasos. Y si una herramienta lanza una excepción, **el agente se rompe** y el error no vuelve al modelo. Solo vuelven solos los errores de validación de argumentos. Para el equivalente a `is_error: true` hace falta `ToolErrorMiddleware(on_error=…)` (langchain ≥ 1.3.14) o lanzar `ToolException` con `handle_tool_error=True`. Esto afecta directamente a la lección `roadmap/20-herramientas/03-errores-e-is-error`.
3. **Más trampas verificadas con Claude en `langchain-anthropic` 1.7.7**: sin `max_tokens`, `ChatAnthropic` toma el máximo del perfil del modelo (128000 en `claude-sonnet-5-5`). Con `claude-sonnet-5-5`, cualquier `temperature`, `top_p` o `top_k` distinto del valor por defecto lanza `ValueError`. `effort=` activa `thinking={"type": "adaptive", "display": "summarized"}`. Y `@tool` sin `parse_docstring=True` no pasa a cada campo del esquema la descripción escrita en `Args:`.
4. **MCP en LangChain cambió en 2026**: `langchain-mcp-adapters` 0.3.2 (la última) exige `mcp<2` y **falla al importar con `mcp` 2.x** (verificado). LangChain 1.4.0 (1-9-2026) trae `langchain.mcp.MCPAdapter` (beta, sobre FastMCP 4), que sí funciona con `mcp` 2.3.0 (verificado). El protocolo es el mismo: un cliente con mcp 1.x habla con un servidor hecho con mcp 2.x (verificado).
5. **Deep Agents 0.7.32** (MIT, beta) es el «arnés» de LangChain: archivos virtuales, subagentes (`task`), resumen automático y caché de prompts de Anthropic. **Desde la 0.7 (julio de 2026) `write_todos` ya no viene por defecto**: hay que añadir `TodoListMiddleware()`. El agente de terminal es `deepagents-code` (MIT); `deepagents-cli` está obsoleto.
6. **Lo comercial está separado de lo abierto**. En LangChain son MIT `langgraph`, los checkpointers, `langgraph-cli` y `deepagents`. El servidor `langgraph-api` (Agent Server) es **Elastic-2.0**, una licencia *source-available* que no es open source OSI. LangSmith (trazas, evals, despliegue, Managed Deep Agents) es comercial.
7. **OpenAI Agents SDK 0.24.0** (MIT) usa Claude vía `LitellmModel("anthropic/…")` (extra `[litellm]`). Por defecto **exporta las trazas a la plataforma de OpenAI** (`https://api.openai.com/v1/traces/ingest`) y devuelve al modelo un error genérico, no el texto de la excepción. Tiene `needs_approval=True` para aprobación humana y handoffs como herramientas `transfer_to_<agente>`.
8. **Pydantic AI 2.63.0** (MIT, estable) es la opción más tipada: `deps_type`, `output_type` validado y aprobación humana con `requires_approval=True`, `DeferredToolRequests` y `DeferredToolResults`. Trae `TestModel`/`FunctionModel` para probar sin API y durabilidad con Temporal, DBOS o Prefect. Ojo: en la 2.x `result.usage` es una propiedad, no un método.
9. **Vercel AI SDK va por la v7** (`ai` 7.0.157, Apache-2.0). `generateText` hace **un solo paso por defecto** (`isStepCount(1)`): sin `stopWhen` no hay bucle y el texto sale vacío si el modelo pidió una herramienta (verificado). `ToolLoopAgent` para por defecto a los 20 pasos. `stepCountIs` es ahora un alias de `isStepCount`. Un modelo pasado como string se resuelve por el AI Gateway de Vercel salvo que configures otro proveedor.
10. **Microsoft Agent Framework 1.23.0** (MIT) es el sucesor declarado de Semantic Kernel, y el README de SK lo anuncia como 1.0 estable. AutoGen no publica nada en PyPI desde el 30-9-2025. **Google ADK 2.13.0** (Apache-2.0) existe también en Java, Kotlin, Go y TypeScript (`@google/adk` 2.4.0) y usa Claude vía `LiteLlm`.
11. **CrewAI 1.15.33** (MIT; CrewAI AMP es comercial) necesita el extra `crewai[anthropic]` para Claude nativo, fija `pydantic<2.13` y `mcp<2`, y activa por defecto telemetría anónima. **smolagents** (Apache-2.0) avisa en su README de que su `LocalPythonExecutor` por defecto «is **not a security sandbox**».
12. **LiteLLM** sostiene la compatibilidad con Claude de varios frameworks (OpenAI Agents SDK, ADK, smolagents, DSPy). Las versiones 1.82.7 y 1.82.8 no existen hoy en PyPI, con un hueco de publicación entre el 22 y el 31 de marzo de 2026. Según lo que recuerdo, se retiraron tras un compromiso de la cadena de suministro (**SIN CONFIRMAR** en fuente primaria en esta sesión). Recomendación para la web: fijar versiones y usar hashes.
13. **Probar agentes sin API es posible en todos los frameworks principales** con modelos simulados, y es contenido que falta en la web: abarata los evals de trayectoria y las pruebas en CI.
14. **Recomendación editorial**: mantener el SDK de Anthropic como referencia (el bucle a mano enseña el mecanismo) y añadir un curso `cursos/langchain-y-langgraph/`, un grupo `docs/frameworks/` y una sección «Con un framework» en unas 15 páginas existentes. **Hay que decidir antes cómo funcionan las pestañas**: el script actual guarda una sola etiqueta para toda la web, así que una pestaña «LangGraph» pisaría la preferencia Python/TypeScript (ver §5.5).

---

## 2. Versiones verificadas

### 2.1 Python (PyPI, 29-10-2026)

| Paquete | Versión | Licencia | Fecha de la versión | Estado (clasificador PyPI) | URL |
|---|---|---|---|---|---|
| langchain | 1.4.7 | MIT | 2026-10-21 | 5 - Production/Stable | https://pypi.org/project/langchain/ |
| langchain-core | 1.7.2 | MIT | 2026-10-29 | 5 - Production/Stable | https://pypi.org/project/langchain-core/ |
| langchain-anthropic | 1.7.7 | MIT | 2026-10-27 | 5 - Production/Stable | https://pypi.org/project/langchain-anthropic/ |
| langchain-ollama | 1.1.0 | MIT | 2026-04-07 | 5 - Production/Stable | https://pypi.org/project/langchain-ollama/ |
| langchain-classic | 1.0.8 | MIT | 2026-06-10 | 5 - Production/Stable | https://pypi.org/project/langchain-classic/ |
| langgraph | 1.2.18 | MIT | 2026-10-26 | 5 - Production/Stable | https://pypi.org/project/langgraph/ |
| langgraph-prebuilt | 1.1.1 | MIT | 2026-10-15 | 5 - Production/Stable | https://pypi.org/project/langgraph-prebuilt/ |
| langgraph-checkpoint | 4.3.1 | MIT | 2026-10-26 | (sin clasificador) | https://pypi.org/project/langgraph-checkpoint/ |
| langgraph-checkpoint-sqlite | 3.1.2 | MIT | 2026-10-12 | (sin clasificador) | https://pypi.org/project/langgraph-checkpoint-sqlite/ |
| langgraph-checkpoint-postgres | 3.2.0 | MIT | 2026-10-14 | (sin clasificador) | https://pypi.org/project/langgraph-checkpoint-postgres/ |
| langgraph-supervisor | 0.0.31 | MIT | 2025-11-19 | (README: «We now recommend using the supervisor pattern directly via tools») | https://pypi.org/project/langgraph-supervisor/ |
| langgraph-swarm | 0.1.0 | MIT | 2025-12-04 | (sin clasificador) | https://pypi.org/project/langgraph-swarm/ |
| langgraph-cli | 0.4.40 | MIT | 2026-10-26 | — | https://pypi.org/project/langgraph-cli/ |
| langgraph-api (Agent Server) | 0.16.9 | **Elastic-2.0** | 2026-10-28 | — | https://pypi.org/project/langgraph-api/ |
| deepagents | 0.7.32 | MIT | 2026-10-23 | 4 - Beta | https://pypi.org/project/deepagents/ |
| deepagents-code | 0.2.2 | MIT | (SIN CONFIRMAR) | — | https://pypi.org/project/deepagents-code/ |
| deepagents-cli | 0.3.0 | MIT | 2026-08-24 | 7 - Inactive (obsoleto) | https://pypi.org/project/deepagents-cli/ |
| managed-deepagents | 0.10.0 | MIT (herramienta; el runtime es LangSmith) | (SIN CONFIRMAR) | — | https://pypi.org/project/managed-deepagents/ |
| langchain-mcp-adapters | 0.3.2 | MIT | 2026-08-06 | exige `mcp<2` | https://pypi.org/project/langchain-mcp-adapters/ |
| openai-agents | 0.24.0 | MIT | 2026-10-15 | (sin clasificador) | https://pypi.org/project/openai-agents/ |
| pydantic-ai / pydantic-ai-slim | 2.63.0 | MIT | 2026-10-28 | 5 - Production/Stable | https://pypi.org/project/pydantic-ai/ |
| pydantic-graph | 2.63.0 | MIT | 2026-10-28 | 5 - Production/Stable | https://pypi.org/project/pydantic-graph/ |
| llama-index-core | 0.14.25 | MIT | 2026-09-21 | (sin clasificador) | https://pypi.org/project/llama-index-core/ |
| llama-index-llms-anthropic | 0.12.3 | MIT | 2026-10-12 | — | https://pypi.org/project/llama-index-llms-anthropic/ |
| llama-index-llms-ollama | 0.11.0 | MIT | 2026-08-31 | — | https://pypi.org/project/llama-index-llms-ollama/ |
| crewai | 1.15.33 | MIT (según README; el wheel no declara licencia) | 2026-10-28 | (sin clasificador); Python <3.14 | https://pypi.org/project/crewai/ |
| smolagents | 1.26.0 | Apache-2.0 | 2026-05-29 | (sin clasificador) | https://pypi.org/project/smolagents/ |
| dspy | 3.4.1 | MIT | 2026-10-12 | 3 - Alpha (clasificador) | https://pypi.org/project/dspy/ |
| google-adk | 2.13.0 | Apache-2.0 | 2026-10-23 | (sin clasificador) | https://pypi.org/project/google-adk/ |
| haystack-ai | 3.4.1 | Apache-2.0 | 2026-10-21 | 5 - Production/Stable | https://pypi.org/project/haystack-ai/ |
| anthropic-haystack | 8.0.1 | Apache-2.0 | 2026-10-23 | 4 - Beta | https://pypi.org/project/anthropic-haystack/ |
| ollama-haystack | 7.0.2 | Apache-2.0 | 2026-10-16 | 4 - Beta | https://pypi.org/project/ollama-haystack/ |
| strands-agents | 1.62.0 | Apache-2.0 | 2026-10-21 | 5 - Production/Stable | https://pypi.org/project/strands-agents/ |
| agno | 3.1.12 | Apache-2.0 | 2026-10-29 | 5 - Production/Stable | https://pypi.org/project/agno/ |
| agent-framework / agent-framework-core | 1.23.0 | MIT | 2026-10-22 | 5 - Production/Stable | https://pypi.org/project/agent-framework/ |
| agent-framework-anthropic / -ollama | 1.0.0b261022 | MIT | 2026-10-22 (por el sufijo) | beta | https://pypi.org/project/agent-framework-anthropic/ |
| semantic-kernel | 1.46.0 | MIT | 2026-10-28 | 5 - Production/Stable | https://pypi.org/project/semantic-kernel/ |
| autogen-agentchat | 0.7.5 | MIT | 2025-09-30 | sin versiones desde entonces | https://pypi.org/project/autogen-agentchat/ |
| litellm | 1.106.6 (`openai-agents[litellm]` instala 1.83.0) | MIT | 2026-10-28 | — | https://pypi.org/project/litellm/ |
| mcp (SDK de Python) | 2.3.0 | MIT | 2026-10-02 | 5 - Production/Stable | https://pypi.org/project/mcp/ |
| anthropic (SDK) | 2.3.0 | Apache-2.0 | 2026-10-23 | — | https://pypi.org/project/anthropic/ |
| langsmith (cliente) | 0.14.16 | MIT (el servicio es comercial) | 2026-10-29 | — | https://pypi.org/project/langsmith/ |

### 2.2 TypeScript (npm, 29-10-2026)

| Paquete | Versión | Licencia | Fecha | URL |
|---|---|---|---|---|
| langchain | 1.6.0 | MIT | 2026-10-28 | https://www.npmjs.com/package/langchain |
| @langchain/core | 1.3.2 | MIT | 2026-10-29 | https://www.npmjs.com/package/@langchain/core |
| @langchain/anthropic | 1.6.0 | MIT | 2026-10-22 | https://www.npmjs.com/package/@langchain/anthropic |
| @langchain/ollama | 1.3.0 | MIT | 2026-06-17 | https://www.npmjs.com/package/@langchain/ollama |
| @langchain/langgraph | 1.5.3 | MIT | 2026-10-26 | https://www.npmjs.com/package/@langchain/langgraph |
| @langchain/mcp-adapters | 2.0.1 | MIT | 2026-10-06 | https://www.npmjs.com/package/@langchain/mcp-adapters |
| deepagents (JS) | 1.16.1 | MIT | 2026-10-29 | https://www.npmjs.com/package/deepagents |
| ai (Vercel AI SDK) | 7.0.157 | Apache-2.0 | 2026-10-29 | https://www.npmjs.com/package/ai |
| @ai-sdk/anthropic | 4.0.92 | Apache-2.0 | 2026-10-29 | https://www.npmjs.com/package/@ai-sdk/anthropic |
| ollama-ai-provider-v2 (comunidad) | 4.1.0 | Apache-2.0 | 2026-10-22 | https://www.npmjs.com/package/ollama-ai-provider-v2 |
| @mastra/core | 1.80.0 | Apache-2.0 salvo carpetas `ee/` | 2026-10-28 | https://www.npmjs.com/package/@mastra/core |
| @openai/agents | 0.21.0 | MIT | 2026-10-20 | https://www.npmjs.com/package/@openai/agents |
| @openai/agents-extensions | 0.21.0 | MIT | 2026-10-20 | https://www.npmjs.com/package/@openai/agents-extensions |
| @google/adk | 2.4.0 | Apache-2.0 | 2026-10-28 | https://www.npmjs.com/package/@google/adk |
| @strands-agents/sdk | 1.22.0 | Apache-2.0 | 2026-10-21 | https://www.npmjs.com/package/@strands-agents/sdk |
| @modelcontextprotocol/sdk | 1.32.2 | MIT | 2026-10-23 | https://www.npmjs.com/package/@modelcontextprotocol/sdk |
| zod | 4.6.7 | MIT | 2026-10-12 | https://www.npmjs.com/package/zod |

### 2.3 Open source frente a comercial

| Proyecto | Open source | Comercial / servicio aparte |
|---|---|---|
| LangChain | `langchain`, `langchain-core`, integraciones, `langgraph`, checkpointers, `langgraph-cli`, `deepagents`, `deepagents-code` (MIT) | **LangSmith**: trazas, evals y despliegue, incluido Managed Deep Agents. `langgraph-api` (Agent Server) es Elastic-2.0: puedes leer el código, pero no es OSI y limita ofrecerlo como servicio gestionado |
| CrewAI | Framework (MIT) | **CrewAI AMP Suite** (plano de control, observabilidad) |
| Haystack | `haystack-ai` (Apache-2.0) | **Haystack Enterprise** (soporte y plataforma de deepset) |
| Mastra | Apache-2.0 | Código bajo carpetas `ee/` con licencia empresarial (`@mastra/core/auth/ee`, `agent-builder/ee`) |
| OpenAI Agents SDK | SDK (MIT) | Panel de trazas de la plataforma OpenAI (destino por defecto de las trazas) |
| Pydantic AI | SDK, `pydantic-graph`, evals (MIT) | **Logfire** (opcional; vale cualquier backend OpenTelemetry) |
| Agno | Apache-2.0 | AgentOS / Company OS: SIN CONFIRMAR qué parte es de pago |
| Google ADK, Microsoft Agent Framework, Strands | Apache-2.0 / MIT / Apache-2.0 | Sus nubes (Vertex AI, Azure AI Foundry, Amazon Bedrock) son de pago; Strands usa **Bedrock por defecto** si no pasas `model` |
| Vercel AI SDK | Apache-2.0 | **AI Gateway**: un modelo como string pasa por `globalThis.AI_SDK_DEFAULT_PROVIDER ?? gateway` |
| smolagents | Apache-2.0 | Sandboxes de terceros (E2B, Modal, Blaxel) |

---

## 3. Framework por framework

### 3.1 LangChain 1.x (Python)

**Qué es.** Una librería para construir agentes con un bucle ya hecho (`create_agent`) que se personaliza con *middleware*. Desde la 1.0 el paquete `langchain` se reduce a `langchain.agents`, `langchain.messages`, `langchain.tools`, `langchain.chat_models`, `langchain.embeddings` y, desde la 1.4, `langchain.mcp` (beta). Lo antiguo (cadenas, retrievers, `hub`, exportaciones de `langchain-community`) está en `langchain-classic`. `create_agent` sustituye a `langgraph.prebuilt.create_react_agent`, que ahora avisa: «Deprecated in LangGraph V1.0 to be removed in V2.0».

**Modelo mental.** `create_agent` compila un grafo de LangGraph con dos nodos, `model` y `tools`, más los nodos que añade cada middleware. El estado es una lista de mensajes: `HumanMessage` → `AIMessage(tool_calls=[…])` → `ToolMessage` → `AIMessage`. El middleware se engancha en `before_agent`, `before_model`, `wrap_model_call`, `wrap_tool_call`, `after_model` y `after_agent`. Al estar construido sobre LangGraph hereda persistencia (`checkpointer`), interrupciones y streaming.

**API exacta verificada** (`inspect.signature`, langchain 1.4.7):

```text
create_agent(model: str | BaseChatModel, tools: Sequence[BaseTool | Callable | dict] | None = None, *,
             system_prompt: str | SystemMessage | None = None, middleware: Sequence[AgentMiddleware] = (),
             response_format: ResponseFormat | type | dict | None = None, state_schema=None, context_schema=None,
             checkpointer=None, store=None, interrupt_before=None, interrupt_after=None, debug=False,
             name=None, cache=None, transformers=None) -> CompiledStateGraph
```

- `model`: string `"proveedor:modelo"` (`"anthropic:claude-sonnet-5-5"`, `"ollama:qwen3"`) o una instancia. `init_chat_model(model, *, model_provider=None, configurable_fields=None, config_prefix=None, **kwargs)` construye la instancia; verificado que `"anthropic:…"` da `ChatAnthropic` y `"ollama:…"` da `ChatOllama`.
- `@tool` (`from langchain.tools import tool`): `tool(name_or_callable=None, runnable=None, *, description=None, return_direct=False, args_schema=None, infer_schema=True, response_format="content", parse_docstring=False, error_on_invalid_docstring=True, extras=None)`. También exporta `ToolRuntime`, `InjectedState`, `InjectedStore`, `InjectedToolCallId` y `ToolException`.
- Salida estructurada (`from langchain.agents.structured_output import ToolStrategy, ProviderStrategy`):
  - `ToolStrategy(schema, *, tool_message_content=None, handle_errors=True)`.
  - `ProviderStrategy(schema, *, strict=None)`.
  - Si pasas el esquema directamente, LangChain elige `ProviderStrategy` cuando el perfil del modelo indica soporte nativo; Anthropic aparece entre los proveedores con soporte. El resultado llega en `resultado["structured_response"]`.
- **Middleware incluido** (`langchain.agents.middleware`, nombres exactos verificados): `HumanInTheLoopMiddleware(interrupt_on, *, description_prefix, edit_notice, interrupt_mode="batched"|"per_call")`, `SummarizationMiddleware(model, *, trigger=("tokens"|"messages"|"fraction", n), keep=("messages", 20), …)`, `PIIMiddleware(pii_type, *, strategy="redact"|"block"|"mask"|"hash", detector=None, apply_to_input=True, apply_to_output=False, apply_to_tool_results=False)`, `ModelCallLimitMiddleware(*, thread_limit=None, run_limit=None, exit_behavior="end"|"error")`, `ToolCallLimitMiddleware(*, tool_name=None, thread_limit=None, run_limit=None, exit_behavior="continue")`, `ModelFallbackMiddleware(first_model, *additional_models)`, `ModelRetryMiddleware`, `ToolRetryMiddleware`, `ToolErrorMiddleware(on_error=None, *, aon_error=None, tools=None)`, `TodoListMiddleware`, `LLMToolSelectorMiddleware`, `ContextEditingMiddleware(edits=[ClearToolUsesEdit(...)])`, `ShellToolMiddleware`, `FilesystemFileSearchMiddleware`, `ProviderToolSearchMiddleware`, `LLMToolEmulator`. Hay decoradores para escribir el tuyo: `@before_model`, `@after_model`, `@wrap_model_call`, `@wrap_tool_call`, `@dynamic_prompt`, `@before_agent` y `@after_agent`.
- **Middleware de Anthropic** (`langchain_anthropic.middleware`): `AnthropicPromptCachingMiddleware(type="ephemeral", ttl="5m"|"1h", min_messages_to_cache=0, unsupported_model_behavior="warn")`, `ClaudeBashToolMiddleware`, `StateClaudeTextEditorMiddleware`, `FilesystemClaudeTextEditorMiddleware`, `StateClaudeMemoryMiddleware`, `FilesystemClaudeMemoryMiddleware` y `StateFileSearchMiddleware`. Verificado en el *payload*: el middleware de caché añade `"cache_control": {"type": "ephemeral", "ttl": "5m"}` en el nivel superior de la petición (caché automática) y en el bloque `system`.
- **`ChatAnthropic`** (langchain-anthropic 1.7.7). Campos relevantes: `model`, `max_tokens`, `thinking` (dict), `effort` (alias de `reasoning_effort`: `"low"|"medium"|"high"|"xhigh"|"max"`), `output_config`, `betas`, `mcp_servers`, `context_management`, `container`, `inference_geo`, `max_retries=2` y `stop_sequences`.
  - Según el docstring, en Opus 5.5 no se puede desactivar el razonamiento y en Opus 4.7+, Opus 5, Opus 5.5 y Sonnet 5 se eliminó `budget_tokens`.
  - Con `claude-sonnet-5-5`, el código **rechaza** `temperature`/`top_p` con valores no por defecto, `top_k` y `thinking={"type": "disabled"}`.
  - Las herramientas del servidor se pasan como dict en `tools` y llegan tal cual (verificado con la búsqueda web; consulta la versión vigente de cada herramienta en la documentación de Anthropic).
  - `bind_tools(tools, *, tool_choice=None, parallel_tool_calls=None, strict=None)` y `with_structured_output(schema, *, include_raw=False, method="function_calling"|"json_schema")`.
- **Content blocks estándar**: `AIMessage.content_blocks` normaliza los bloques del proveedor. Verificado: `thinking` → `reasoning`, `text` → `text`, `tool_use` → `tool_call`. `AIMessage.text` es una propiedad.
- **`ChatOllama`** (langchain-ollama 1.1.0): `model`, `base_url`, `reasoning` (bool o str), `num_ctx`, `temperature`, `keep_alive`, `format`, `validate_model_on_init`.

**Ejemplo VERIFICADO**: agente con dos herramientas (`ejemplos/lc_01_agente.py`, probado en `test_lc_01.py`).

```python title="agente_langchain.py"
import json

from langchain.agents import create_agent
from langchain.agents.middleware import ModelCallLimitMiddleware, ToolErrorMiddleware
from langchain.chat_models import init_chat_model
from langchain.tools import tool

MODEL = "anthropic:claude-sonnet-5-5"     # o "ollama:qwen3" con langchain-ollama y Ollama en marcha

PEDIDOS = {"ana@example.com": [{"id": "P-1001", "estado": "enviado", "fecha": "2026-09-10"}]}
AYUDA = {"devoluciones": "Tienes 30 días desde la entrega para devolver un producto sin usar."}


@tool(parse_docstring=True)                # sin esto, "Args:" no llega al esquema de cada campo
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
    # Sin este middleware, una excepción dentro de la herramienta corta la ejecución.
    # Con él, vuelve al modelo como ToolMessage(status="error"), el equivalente a is_error.
    return f"Error: {exc}"


SYSTEM = "Eres el asistente de soporte de una tienda online. Usa las herramientas para consultar datos; no los inventes."


def crear_agente(model=None):
    # Pon max_tokens explícito: si no, ChatAnthropic usa el máximo del perfil del modelo.
    model = model or init_chat_model(MODEL, max_tokens=2048)
    return create_agent(
        model=model,                       # string "proveedor:modelo" o instancia (ChatAnthropic, ChatOllama…)
        tools=[ver_pedidos, buscar_ayuda],
        system_prompt=SYSTEM,
        middleware=[
            ToolErrorMiddleware(on_error=error_para_el_modelo),
            ModelCallLimitMiddleware(run_limit=10, exit_behavior="end"),  # límite de llamadas al modelo
        ],
    )


if __name__ == "__main__":
    agente = crear_agente()
    resultado = agente.invoke(
        {"messages": [{"role": "user", "content": "Soy ana@example.com. ¿Dónde está mi pedido y hasta cuándo puedo devolverlo?"}]}
    )
    for m in resultado["messages"]:          # la traza completa: human → ai(tool_calls) → tool → ai
        m.pretty_print()
```

Salida real de la prueba con modelo simulado:

```text
CASO 1 tipos: ['HumanMessage', 'AIMessage', 'ToolMessage', 'ToolMessage', 'AIMessage']
CASO 2 ToolMessage status: error | content: Error: No hay ningún cliente con email nadie@example.com
```

Cambiar a Ollama: `MODEL = "ollama:qwen3"` (con `pip install langchain-ollama` y el modelo descargado) o pasar `ChatOllama(model="qwen3", reasoning=True)`. No lo ejecuté contra un Ollama real. Elige un modelo local que admita *tool calling*; eso lo cubre el informe de infraestructura.

**Ejemplo VERIFICADO**: aprobación humana (`ejemplos/lc_02_aprobacion.py`; probados aprobar, rechazar y editar).

```python title="aprobacion_langchain.py"
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.checkpoint.memory import InMemorySaver   # en producción: SqliteSaver / PostgresSaver
from langgraph.types import Command

MODEL = "anthropic:claude-sonnet-5-5"


@tool
def ver_pedido(pedido_id: str) -> str:
    """Devuelve estado e importe de un pedido por su id (formato P-NNNN)."""
    return '{"id": "%s", "estado": "entregado", "importe_eur": 49.90}' % pedido_id


@tool
def reembolsar(pedido_id: str, importe_eur: float, motivo: str) -> str:
    """Emite un reembolso. Acción irreversible: solo tras confirmar el pedido con ver_pedido."""
    return f"Reembolso de {importe_eur} € emitido para {pedido_id}."


agente = create_agent(
    model=init_chat_model(MODEL, max_tokens=2048),
    tools=[ver_pedido, reembolsar],
    system_prompt="Eres un agente de soporte. Antes de reembolsar, comprueba el pedido.",
    middleware=[HumanInTheLoopMiddleware(interrupt_on={
        "reembolsar": {"allowed_decisions": ["approve", "edit", "reject"]},
        "ver_pedido": False,                                   # solo lectura: sin pausa
    })],
    checkpointer=InMemorySaver(),
)

config = {"configurable": {"thread_id": "ticket-123"}}          # mismo thread_id para reanudar
salida = agente.invoke({"messages": [{"role": "user", "content": "Devolvedme P-1001, llegó roto."}]},
                       config, version="v2")
while salida.interrupts:                                        # el agente está en pausa
    peticion = salida.interrupts[0].value                       # {"action_requests": [...], "review_configs": [...]}
    decisiones = [{"type": "approve"} for _ in peticion["action_requests"]]   # o reject / edit
    salida = agente.invoke(Command(resume={"decisions": decisiones}), config, version="v2")
print(salida.value["messages"][-1].content)
```

Decisiones verificadas:
- `{"type": "approve"}`.
- `{"type": "reject", "message": "…"}`: el modelo recibe un `ToolMessage` con `status="error"` y el texto «User rejected the tool call…».
- `{"type": "edit", "edited_action": {"name": …, "args": {…}}}`.
- `{"type": "respond", "message": "…"}`.

Con `invoke(..., version="v2")` el resultado es un `GraphOutput` con `.value` y `.interrupts`. Sin `version="v2"` es un dict con la clave `"__interrupt__"`. Las dos formas están verificadas.

**Cuándo sí.**
- Agentes que encajan en el bucle modelo → herramientas → respuesta y que necesitan piezas de producción ya hechas: límites, reintentos, resumen, PII, aprobación o caché de Anthropic.
- Cambiar de proveedor sin reescribir: Claude y Ollama con la misma API.

**Cuándo no.**
- Si la lección enseña el mecanismo: el bucle a mano de MoreContext es más claro.
- Flujos con pasos deterministas mezclados o con ramas propias: ahí va LangGraph directamente.
- Si te molesta depender de un ecosistema que se mueve deprisa: hubo una versión menor cada 2–4 meses en 2026 según el changelog.

**Trampas conocidas (todas verificadas).**
- Las excepciones en herramientas rompen el bucle salvo con `ToolErrorMiddleware`.
- `max_tokens` por defecto enorme con Claude.
- `temperature` prohibida en `claude-sonnet-5-5`.
- `parse_docstring=True` es necesario para que las descripciones de `Args:` lleguen al esquema.
- `GenericFakeChatModel` no implementa `bind_tools`: para probar `create_agent` sin API, crea una subclase (ver `ejemplos/_fakes.py`).
- `ModelCallLimitMiddleware(exit_behavior="end")` termina con un `AIMessage` cuyo texto es «Model call limits exceeded: run limit (2/2)». Con `"error"` lanza `ModelCallLimitExceededError`.

**Fuentes.**
- Agents: https://docs.langchain.com/oss/python/langchain/agents
- Middleware incluido: https://docs.langchain.com/oss/python/langchain/middleware/built-in.md
- Salida estructurada: https://docs.langchain.com/oss/python/langchain/structured-output.md
- Release v1: https://docs.langchain.com/oss/python/releases/langchain-v1.md
- Changelog: https://docs.langchain.com/oss/python/langchain/changelog-py
- Código instalado: `site-packages/langchain/agents/middleware/*.py` y `site-packages/langchain_anthropic/chat_models.py`.

### 3.2 LangGraph 1.x

**Qué es.** Un runtime de grafos con estado para agentes y workflows: nodos (funciones), aristas (fijas o condicionales) y un estado tipado que se fusiona con reductores. Lo usa por debajo `create_agent` y también Deep Agents.

**Modelo mental.** Cada nodo recibe el estado y devuelve una actualización parcial. Los reductores deciden cómo se combina: `add_messages` añade mensajes y `operator.add` concatena listas. La ejecución avanza por superpasos, y el checkpointer guarda el estado al final de cada uno bajo un `thread_id`. Gracias a eso se puede pausar (`interrupt`), reanudar, volver atrás en el historial o recuperarse de un fallo.

**API exacta verificada** (langgraph 1.2.18):
- `from langgraph.graph import StateGraph, START, END, MessagesState, add_messages`. `MessageGraph` sigue exportado.
- `StateGraph(state_schema, context_schema=None, *, input_schema=None, output_schema=None)`.
- `add_node(node, action=None, *, defer=False, metadata=None, input_schema=None, retry_policy=None, cache_policy=None, error_handler=None, destinations=None, timeout=None, trace_policy=None)`.
- `add_conditional_edges(source, path, path_map=None)`.
- `compile(checkpointer=None, *, cache=None, store=None, interrupt_before=None, interrupt_after=None, debug=False, name=None, transformers=None)`.
- `ToolNode` y `tools_condition` **siguen en `langgraph.prebuilt`** (paquete `langgraph-prebuilt` 1.1.1). `ToolNode(tools, *, name="tools", handle_tool_errors=<por defecto>, messages_key="messages", wrap_tool_call=None, awrap_tool_call=None)`. El manejador por defecto **solo captura `ToolInvocationError`** (argumentos inválidos) y relanza el resto. Es el origen de la trampa de §3.1.
- `from langgraph.types import Command, Send, interrupt, RetryPolicy, CachePolicy, TimeoutPolicy, Durability, StreamMode`:
  - `Command(*, graph=None, update=None, resume=None, goto=())`.
  - `Send(node, arg, *, timeout=None)`.
  - `interrupt(value, *, response_schema=None)`.
  - `StreamMode` = `"values" | "updates" | "checkpoints" | "tasks" | "debug" | "messages" | "custom"`.
  - `Durability` = `"sync" | "async" | "exit"`.
- Ejecución:
  - `invoke(input, config=None, *, context=None, stream_mode="values", durability=None, version="v1"|"v2", …)`; con `"v2"` devuelve `GraphOutput(.value, .interrupts)`.
  - `stream(..., stream_mode=…, subgraphs=False, version="v1"|"v2")`.
  - `stream_events(..., version="v1"|"v2"|"v3")`: la v3 es el protocolo nuevo centrado en *content blocks*, en beta desde la 1.2.0 (12-5-2026).
- Checkpointers:
  - `from langgraph.checkpoint.memory import InMemorySaver`.
  - `from langgraph.checkpoint.sqlite import SqliteSaver` (paquete `langgraph-checkpoint-sqlite`): **`SqliteSaver.from_conn_string("agente.db")` es el gestor de contexto**. `SqliteSaver(conn)` no lo es (verificado: `TypeError`).
  - `from langgraph.checkpoint.postgres import PostgresSaver` (paquete `langgraph-checkpoint-postgres`).
- Store de memoria a largo plazo: `from langgraph.store.memory import InMemoryStore` (`InMemoryStore(*, index=None)`, con búsqueda semántica si configuras `index`) y `PostgresStore` en producción. Desde una herramienta se accede con `runtime.store` (`ToolRuntime`).
- Functional API: `from langgraph.func import entrypoint, task`. `entrypoint(checkpointer=None, store=None, cache=None, context_schema=None, cache_policy=None, retry_policy=None, timeout=None)` y `task(func=None, *, name=None, retry_policy=None, cache_policy=None, timeout=None)`.
- Límite de pasos: `config["recursion_limit"]` → `langgraph.errors.GraphRecursionError` (verificado). El valor por defecto es 10007: ver Trampas.

**Reglas de `interrupt()`** (documentación oficial, verificadas en parte):
- No lo envuelvas en un `try/except` genérico: funciona lanzando una excepción especial.
- **Al reanudar, el nodo se ejecuta otra vez desde el principio** (verificado): el código anterior al `interrupt` se repite, así que debe ser idempotente.
- Las interrupciones se emparejan por posición: no las saltes condicionalmente.
- Pasa solo valores serializables en JSON.
- Con varias interrupciones en paralelo, reanuda con un dict `{interrupt.id: valor}`.

**Ejemplo VERIFICADO**: bucle agéntico como grafo, con nodo de aprobación y SQLite (`ejemplos/lg_01_grafo_aprobacion.py`). La prueba pausa, cierra la conexión, abre otra sobre el mismo archivo y reanuda.

```python title="grafo_aprobacion.py"
from langchain.chat_models import init_chat_model
from langchain.messages import SystemMessage, ToolMessage
from langchain.tools import tool
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from langgraph.types import Command, interrupt

MODEL = "anthropic:claude-sonnet-5-5"
SENSIBLES = {"reembolsar"}                     # herramientas que necesitan aprobación


@tool
def ver_pedido(pedido_id: str) -> str:
    """Devuelve estado e importe de un pedido por su id (formato P-NNNN)."""
    return '{"id": "%s", "estado": "entregado", "importe_eur": 49.90}' % pedido_id


@tool
def reembolsar(pedido_id: str, importe_eur: float) -> str:
    """Emite un reembolso. Acción irreversible: solo tras confirmar el pedido con ver_pedido."""
    return f"Reembolso de {importe_eur} € emitido para {pedido_id}."


TOOLS = [ver_pedido, reembolsar]
SYSTEM = SystemMessage("Eres un agente de soporte. Antes de reembolsar, comprueba el pedido.")


def construir(modelo=None, checkpointer=None):
    llm = (modelo or init_chat_model(MODEL, max_tokens=2048)).bind_tools(TOOLS)

    def llamar_modelo(state: MessagesState):
        respuesta = llm.invoke([SYSTEM, *state["messages"]])
        return {"messages": [respuesta]}           # add_messages lo añade al historial

    def decidir(state: MessagesState):
        return "aprobar" if state["messages"][-1].tool_calls else END

    def aprobar(state: MessagesState):
        llamadas = state["messages"][-1].tool_calls
        pendientes = [c for c in llamadas if c["name"] in SENSIBLES]
        if not pendientes:
            return Command(goto="herramientas")
        # Pausa el grafo. El valor viaja al llamante en __interrupt__ / .interrupts.
        # Al reanudar, el nodo se ejecuta otra vez desde el principio e interrupt()
        # devuelve lo que pasaste en Command(resume=...).
        decision = interrupt({"pendientes": [{"name": c["name"], "args": c["args"]} for c in pendientes]})
        if decision == "aprobar":
            return Command(goto="herramientas")
        # Rechazo: un ToolMessage por cada tool_call (también las no sensibles) y vuelta al modelo.
        rechazos = [ToolMessage(content="Rechazado por un humano: no lo ejecutes otra vez.",
                                tool_call_id=c["id"], name=c["name"], status="error") for c in llamadas]
        return Command(goto="modelo", update={"messages": rechazos})

    g = StateGraph(MessagesState)
    g.add_node("modelo", llamar_modelo)
    g.add_node("aprobar", aprobar, destinations=("herramientas", "modelo"))
    g.add_node("herramientas", ToolNode(TOOLS))
    g.add_edge(START, "modelo")
    g.add_conditional_edges("modelo", decidir, ["aprobar", END])
    g.add_edge("herramientas", "modelo")
    return g.compile(checkpointer=checkpointer)


if __name__ == "__main__":
    # SqliteSaver persiste el estado en disco: puedes parar el proceso y reanudar después.
    with SqliteSaver.from_conn_string("agente.db") as cp:
        grafo = construir(checkpointer=cp)
        config = {"configurable": {"thread_id": "ticket-123"}, "recursion_limit": 25}  # tope de pasos
        out = grafo.invoke({"messages": [("user", "Devolvedme el pedido P-1001, llegó roto.")]}, config, version="v2")
        while out.interrupts:
            print("Pendiente de aprobación:", out.interrupts[0].value)
            respuesta = "aprobar" if input("¿Aprobar? [s/n] ").lower() == "s" else "rechazar"
            out = grafo.invoke(Command(resume=respuesta), config, version="v2")
        print(out.value["messages"][-1].content)
```

Para una versión sin aprobación basta `g.add_conditional_edges("modelo", tools_condition)` (de `langgraph.prebuilt`), que enruta a `"tools"` o a `END`. Así está en el ejemplo TypeScript de §3.14.

**Ejemplo VERIFICADO**: orquestador y trabajadores con `Send` (`ejemplos/lg_02_orquestador_send.py`). En la prueba, tres trabajadores de 0,2 s tardaron 0,41 s en total con 4 hilos distintos: se ejecutan en paralelo.

```python title="orquestador_langgraph.py"
import operator
from typing import Annotated, TypedDict

from langchain.chat_models import init_chat_model
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send
from pydantic import BaseModel, Field

MODEL = "anthropic:claude-sonnet-5-5"
MAX_SUBTAREAS = 6


class Subtarea(BaseModel):
    objetivo: str
    contexto: str
    formato_respuesta: str


class Plan(BaseModel):
    subtareas: list[Subtarea] = Field(description="Subtareas independientes entre sí")


class Estado(TypedDict):
    tarea: str
    subtareas: list[Subtarea]
    resultados: Annotated[list[str], operator.add]   # cada trabajador añade; no se pisan
    respuesta: str


class EstadoTrabajador(TypedDict):                   # lo que recibe cada trabajador vía Send
    subtarea: Subtarea


def construir(modelo=None):
    llm = modelo or init_chat_model(MODEL, max_tokens=2048)
    planificador = llm.with_structured_output(Plan)   # salida estructurada para el plan

    def planificar(state: Estado):
        plan = planificador.invoke(
            f"Divide la tarea en como mucho {MAX_SUBTAREAS} subtareas independientes.\n<tarea>\n{state['tarea']}\n</tarea>")
        return {"subtareas": plan.subtareas[:MAX_SUBTAREAS]}     # el límite lo impone tu código

    def repartir(state: Estado):
        return [Send("trabajador", {"subtarea": s}) for s in state["subtareas"]]

    def trabajador(state: EstadoTrabajador):
        s = state["subtarea"]
        r = llm.invoke(f"Objetivo: {s.objetivo}\n<contexto>\n{s.contexto}\n</contexto>\n"
                       f"Formato de respuesta: {s.formato_respuesta}")
        return {"resultados": [f"<resultado objetivo='{s.objetivo}'>\n{r.text}\n</resultado>"]}

    def sintetizar(state: Estado):
        r = llm.invoke(f"<tarea>\n{state['tarea']}\n</tarea>\n" + "\n\n".join(state["resultados"])
                       + "\nSintetiza los resultados en una respuesta final.")
        return {"respuesta": r.text}

    g = StateGraph(Estado)
    g.add_node("planificar", planificar)
    g.add_node("trabajador", trabajador)
    g.add_node("sintetizar", sintetizar)
    g.add_edge(START, "planificar")
    g.add_conditional_edges("planificar", repartir, ["trabajador"])
    g.add_edge("trabajador", "sintetizar")            # sintetizar espera a todos los trabajadores
    g.add_edge("sintetizar", END)
    return g.compile()


if __name__ == "__main__":
    grafo = construir()
    out = grafo.invoke({"tarea": "Compara las condiciones de teletrabajo de los convenios de A, B y C."},
                       {"max_concurrency": 4})       # tope de trabajadores en paralelo
    print(out["respuesta"])
```

**Ejemplo VERIFICADO**: Functional API y memoria a largo plazo (`ejemplos/lg_03_functional_y_memoria.py`). La prueba confirma dos cosas: al reanudar tras `interrupt`, la `@task` del borrador **no se vuelve a ejecutar** (2 llamadas en total, no 3), y un segundo `thread_id` lee del store lo que guardó el primero.

```python title="functional_y_memoria.py"
from dataclasses import dataclass

from langchain.agents import create_agent
from langchain.tools import ToolRuntime, tool
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.func import entrypoint, task
from langgraph.store.memory import InMemoryStore
from langgraph.types import interrupt


def crear_flujo(llm):
    @task
    def borrador(tema: str) -> str:
        return llm.invoke(f"Escribe un borrador breve sobre: {tema}").text

    @task
    def pulir(texto: str, nota: str) -> str:
        return llm.invoke(f"Mejora este texto según la nota.\nNota: {nota}\n<texto>\n{texto}\n</texto>").text

    @entrypoint(checkpointer=InMemorySaver())
    def flujo(tema: str) -> str:
        b = borrador(tema).result()                 # .result() espera a la tarea
        nota = interrupt({"borrador": b, "pregunta": "¿Qué cambiarías?"})
        return pulir(b, nota).result()

    return flujo


@dataclass
class Contexto:
    user_id: str


@tool
def guardar_preferencia(preferencia: str, runtime: ToolRuntime[Contexto]) -> str:
    """Guarda una preferencia duradera del usuario (idioma, formato, tono)."""
    runtime.store.put(("preferencias", runtime.context.user_id), "general", {"texto": preferencia})
    return "Guardado."


@tool
def leer_preferencias(runtime: ToolRuntime[Contexto]) -> str:
    """Devuelve las preferencias guardadas del usuario."""
    item = runtime.store.get(("preferencias", runtime.context.user_id), "general")
    return item.value["texto"] if item else "Sin preferencias guardadas."


agente = create_agent("anthropic:claude-sonnet-5-5", [guardar_preferencia, leer_preferencias],
                      context_schema=Contexto, store=InMemoryStore(), checkpointer=InMemorySaver())
# agente.invoke({...}, {"configurable": {"thread_id": "t1"}}, context=Contexto(user_id="u42"))
```

**Plataforma, licencias y paquetes satélite.**
- `langgraph dev` (de `langgraph-cli[inmem]`, MIT) levanta el servidor de desarrollo con Studio. El servidor (`langgraph-api`, Elastic-2.0) es lo que despliega LangSmith.
- El nombre comercial exacto del despliegue hoy es SIN CONFIRMAR: las URL de documentación se han movido de `langgraph-platform/` a `langsmith/`. El changelog dice que «on LangSmith one [checkpointer] is provisioned automatically».
- `langgraph-supervisor`: su README recomienda ahora hacer el supervisor «directly via tools». `langgraph-swarm` 0.1.0 no tiene versiones desde diciembre de 2025. No los propondría para contenido nuevo.

**Cuándo sí.**
- Workflows con pasos fijos y pasos agénticos mezclados.
- Aprobaciones humanas que pueden tardar días (checkpointer persistente).
- Paralelismo con `Send`, ciclos de evaluador-optimizador, subgrafos.
- Cuando necesitas reanudar tras un fallo o «viajar en el tiempo» por el historial (`get_state_history`).

**Cuándo no.**
- Un agente simple con herramientas: `create_agent` ya es ese grafo.
- Un encadenado de 2–3 llamadas: tres funciones normales se leen mejor.

**Trampas.**
- El código antes de `interrupt` se repite al reanudar.
- `SqliteSaver.from_conn_string` es el gestor de contexto.
- `recursion_limit` cuenta superpasos, no llamadas al modelo. **Por defecto vale 10007** en langgraph 1.2.18 (`langgraph/_internal/_config.py`, configurable con `LANGGRAPH_DEFAULT_RECURSION_LIMIT`), no 25 como en `langchain_core`. En la práctica no hay límite: ponlo siempre explícito.
- Los reductores: sin `Annotated[list, operator.add]`, los trabajadores en paralelo se pisan.

**Fuentes.**
- Interrupts: https://docs.langchain.com/oss/python/langgraph/interrupts
- Changelog: https://docs.langchain.com/oss/python/langchain/changelog-py
- Blog 1.0: https://www.langchain.com/blog/langchain-langgraph-1dot0
- README en PyPI de `langgraph-api` (licencia), `langgraph-cli` y `langgraph-supervisor`.

### 3.3 Deep Agents (`deepagents` 0.7.32)

**Qué es.** El «arnés» de LangChain para agentes largos al estilo de los agentes de código, construido con `create_agent` y middleware:
- archivos virtuales: `ls`, `read_file`, `write_file`, `edit_file`, `delete`, `glob` y `grep`;
- `execute`, solo con un *backend* de sandbox;
- subagentes mediante la herramienta `task`, con un subagente `general-purpose` por defecto;
- resumen automático al 85 % del contexto;
- descarga a archivos de los resultados de más de 20 000 tokens;
- *skills* (`SKILL.md`), memoria (`AGENTS.md`) y caché de Anthropic.

**Cambios de la 0.7** (24-7-2026, verificados en las notas de versión y en el código):
- El prompt base del sistema queda vacío.
- **`TodoListMiddleware` es opcional**: según el blog, sus evals no mostraron una mejora significativa.
- `write_file` sobrescribe, y hay una herramienta `delete` nueva.
- `FilesystemBackend`/`LocalShellBackend` pasan a `virtual_mode=True`.
- Se eliminan los *factories* de backend.
- Pasar `model=None` está obsoleto desde la 0.5.3. El modelo por defecto que se usaría hoy es `ChatAnthropic(model_name="claude-sonnet-4-6")`.

**Sobre la documentación**: la página del *harness* todavía lista `write_todos` como incluido, en contra del código y de las notas de la 0.7. Hay que avisarlo al lector.

**API verificada.**
- `create_deep_agent(model=None, tools=None, system_prompt=None, middleware=(), subagents=None, skills=None, memory=None, permissions=None, backend=None, interrupt_on=None, response_format=None, state_schema=None, context_schema=None, checkpointer=None, store=None, debug=False, name=None, cache=None)`.
- Un `SubAgent` es un dict con las claves `name`, `description`, `system_prompt`, `tools`, `model`, `middleware`, `interrupt_on`, `skills`, `permissions`, `response_format` y `mode`.
- Backends (`deepagents.backends`): `StateBackend`, `StoreBackend`, `FilesystemBackend`, `CompositeBackend`, `LocalShellBackend`, `LangSmithSandbox` y `ContextHubBackend`.

**Ejemplo VERIFICADO** (`ejemplos/da_01_deep_agent.py`). La prueba registró qué herramientas ve cada modelo: el principal ve `task` y `write_todos`, el subagente no.

```python title="deep_agent.py"
from deepagents import create_deep_agent
from langchain.agents.middleware import TodoListMiddleware
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.checkpoint.memory import InMemorySaver

MODEL = "anthropic:claude-sonnet-5-5"


@tool
def buscar_web(consulta: str) -> str:
    """Busca en la web y devuelve los 3 primeros resultados con título y URL."""
    return f"(resultados simulados para «{consulta}»)"   # aquí iría tu buscador real


INVESTIGADOR = {
    "name": "investigador",
    "description": "Investiga UNA pregunta concreta y devuelve hallazgos con fuentes. Dale una pregunta acotada.",
    "system_prompt": "Investiga solo la pregunta que te dan. Devuelve hallazgos breves, cada uno con su URL.",
    "tools": [buscar_web],
}

agente = create_deep_agent(
    model=init_chat_model(MODEL, max_tokens=4096),   # pásalo siempre: model=None está obsoleto
    tools=[buscar_web],
    system_prompt="Eres un analista. Planifica con write_todos, delega preguntas acotadas "
                  "con task y escribe el informe final en /informe.md.",
    subagents=[INVESTIGADOR],
    middleware=[TodoListMiddleware()],               # desde deepagents 0.7 write_todos es opcional
    checkpointer=InMemorySaver(),
)
out = agente.invoke({"messages": [("user", "Compara LangGraph y Pydantic AI para agentes con aprobación humana.")]},
                    {"configurable": {"thread_id": "inv-1"}})
print(out["files"]["/informe.md"])                   # el sistema de archivos virtual vive en el estado
```

**Herramientas de línea de comandos.**
- `deepagents-code` 0.2.2 (MIT): agente de código en terminal.
- `managed-deepagents` (`mda`): despliega en un runtime gestionado de LangSmith, que es comercial.
- `deepagents-cli` está marcado como «DEPRECATED … final release».

**Cuándo sí.** Tareas largas y abiertas (investigación, análisis de repositorios) donde compensan los archivos como memoria de trabajo y los subagentes con contexto limpio.

**Cuándo no.** Tareas cortas: la propia LangChain midió unos 2 000 tokens de entrada base por turno con la 0.7, frente a unos 6 000 en la 0.6, según su blog. Tampoco si quieres controlar cada herramienta que ve el modelo.

**Fuentes.**
- Blog de la v0.7: https://langchain.com/blog/deep-agents-v0-7
- Notas de la 0.7.0 (espejo de GitHub Releases): https://newreleases.io/project/github/langchain-ai/deepagents/release/deepagents==0.7.0
- Harness: https://docs.langchain.com/oss/python/deepagents/harness/index.html
- Docstring de `deepagents/graph.py`.

### 3.4 MCP en LangChain/LangGraph

Hay **dos caminos** y conviene enseñar el nuevo.

| | `langchain.mcp.MCPAdapter` (nuevo) | `langchain-mcp-adapters` (anterior) |
|---|---|---|
| Instalación | `pip install "langchain[mcp]"` → fastmcp 4.1.4 → **mcp 2.3.0** | `pip install langchain-mcp-adapters` → **mcp 1.30.0** (`mcp<2`) |
| Estado | Beta desde langchain 1.4.0 (1-9-2026); avisa con `LangChainBetaWarning` | Según el changelog, `MCPAdapter` lo sustituye |
| API | `async with MCPAdapter(target) as mcp: tools = await mcp.list_tools()`. `target` puede ser una URL http(s), un `Path` (stdio), un servidor en proceso o un cliente FastMCP. **Un `str` que no sea URL se rechaza** a propósito | `MultiServerMCPClient(connections, *, callbacks=None, tool_interceptors=None, tool_name_prefix=False, handle_tool_errors=True)` · `await client.get_tools(server_name=None)` · `client.session("nombre")` · `get_prompt`, `get_resources` |
| Peticiones del servidor a mitad de llamada (*elicitation*) | Se convierten en `interrupt()` de LangGraph | — |

**Verificado:**
- Con `mcp` 2.x instalado, `langchain-mcp-adapters` falla: `ImportError: cannot import name 'RequestContext' from 'mcp.shared.context'`. Lo comprobé ejecutando, sin modificar nada, en el venv del coordinador (`mc2`), que tiene 0.3.1 + mcp 2.3.0.
- Con los dos caminos, un `ToolError` del servidor llega al modelo como `ToolMessage(status="error")` con el texto «Error executing tool ver_pedidos: …».
- Un cliente con mcp 1.30 habla sin problemas con un servidor ejecutado con mcp 2.3.0.

**Ejemplo VERIFICADO** (`ejemplos/mcp_02_langchain_mcp.py` + `mcp_servidor_pedidos.py`).

```python title="agente_con_mcp.py"
import asyncio
import warnings
from pathlib import Path

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_core._api import LangChainBetaWarning

warnings.filterwarnings("ignore", category=LangChainBetaWarning)    # el namespace avisa de que es beta
from langchain.mcp import MCPAdapter  # noqa: E402

MODEL = "anthropic:claude-sonnet-5-5"
SERVIDOR = Path(__file__).with_name("mcp_servidor_pedidos.py")      # Path => stdio; un str solo puede ser URL http(s)


async def main():
    async with MCPAdapter(SERVIDOR) as mcp:                          # o MCPAdapter("https://mcp.example.com/mcp")
        tools = await mcp.list_tools()
        agente = create_agent(init_chat_model(MODEL, max_tokens=1024), tools)
        return await agente.ainvoke({"messages": [("user", "¿Qué pedidos tiene ana@example.com?")]})   # tools async: ainvoke


if __name__ == "__main__":
    print(asyncio.run(main())["messages"][-1].content)
```

La alternativa anterior, también verificada (`ejemplos/mcp_01_agente_con_mcp.py`), es `MultiServerMCPClient({"pedidos": {"transport": "stdio", "command": sys.executable, "args": [SERVIDOR]}})` seguido de `tools = await cliente.get_tools()`.

**Consecuencia para MoreContext.** La guía (§8) fija el SDK `mcp` 2.x (`MCPServer`). Si un curso usa `langchain-mcp-adapters`, el servidor y el cliente deben ir en entornos distintos. Lo más sencillo es usar `langchain[mcp]`.

### 3.5 OpenAI Agents SDK (`openai-agents` 0.24.0, MIT)

**Qué es.** Un SDK ligero de OpenAI para agentes y multiagente, que se declara «provider-agnostic» (Responses, Chat Completions y otros modelos vía LiteLLM o any-llm). Sus primitivas son agentes, `Runner`, herramientas, handoffs, guardrails, sesiones, humano en el bucle y tracing. Tiene versión JS: `@openai/agents` 0.21.0.

**Modelo mental.** Un `Agent` es configuración: instrucciones, herramientas, handoffs, guardrails y `output_type`. `Runner.run` ejecuta el bucle hasta una salida final o hasta `max_turns`. Un handoff se expone al modelo como la herramienta `transfer_to_<nombre>` (verificado) y cambia el agente activo.

**API verificada.**
- Campos de `Agent`: `name`, `handoff_description`, `tools`, `mcp_servers`, `mcp_config`, `instructions`, `prompt`, `handoffs`, `model`, `model_settings`, `input_guardrails`, `output_guardrails`, `output_type`, `hooks`, `tool_use_behavior` y `reset_tool_choice`. Tiene además `as_tool()` para usar un agente como herramienta.
- `Runner.run(starting_agent, input, *, context=None, max_turns=10, hooks=None, run_config=None, error_handlers=None, previous_response_id=None, auto_previous_response_id=False, conversation_id=None, session=None)`, además de `run_sync` y `run_streamed`.
- `function_tool(func=None, *, name_override, description_override, docstring_style, use_docstring_info=True, failure_error_function=<por defecto>, strict_mode=True, is_enabled=True, needs_approval=False, tool_input_guardrails, tool_output_guardrails, timeout, …)`.
- `SQLiteSession(session_id, db_path=":memory:", …)`.
- `ModelSettings(max_tokens=…, temperature, tool_choice, parallel_tool_calls, reasoning, …)`.
- `LitellmModel(model, base_url=None, api_key=None, …)` en `agents.extensions.models.litellm_model` (extra `[litellm]`). Existe también `AnyLLMModel` (extra `[any-llm]`).
- MCP: `agents.mcp.MCPServerStdio`, `MCPServerStreamableHttp`, `MCPServerSse` y `HostedMCPTool`.

**Ejemplo VERIFICADO** (`ejemplos/oai_01_agentes.py`). La prueba cubre herramientas, error de herramienta, handoff, `needs_approval` con aprobación y reanudación, guardrail, sesión SQLite y `MaxTurnsExceeded`.

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


ajustes = ModelSettings(max_tokens=1024)
devoluciones = Agent(name="Devoluciones", model=MODEL, model_settings=ajustes,
                     handoff_description="Especialista en devoluciones y reembolsos.",
                     instructions="Gestiona devoluciones. Antes de reembolsar, confirma el pedido.",
                     tools=[ver_pedidos, reembolsar])
triaje = Agent(name="Soporte", model=MODEL, model_settings=ajustes,
               instructions="Eres el soporte de una tienda. Para devoluciones, pasa al especialista.",
               tools=[ver_pedidos], handoffs=[devoluciones], input_guardrails=[sin_datos_de_tarjeta])


async def main():
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

Verificado en la prueba:
- Con `failure_error_function=error_visible`, el modelo recibe «Error: No hay ningún cliente con email nadie@example.com».
- Sin ella, recibe «An error occurred while running the tool. Please try again.» (`default_tool_error_function`).
- El bucle de aprobación con `r.to_state()` y `estado.approve(item)` reanuda y ejecuta el reembolso. `RunState.reject` también existe.

**Claude y Ollama.** Claude va por `LitellmModel("anthropic/…")`. Ollama, por `LitellmModel("ollama_chat/<modelo>")` o con `OpenAIChatCompletionsModel` apuntando a `http://localhost:11434/v1` (SIN EJECUTAR contra Ollama real). En JS se usa `aisdk(anthropic("…"))` de `@openai/agents-extensions/ai-sdk` (compilado en §3.14).

**Cuándo sí.** Triaje con handoffs entre especialistas, guardrails declarativos, sesiones listas y un SDK pequeño con un modelo mental simple.

**Cuándo no.** Si necesitas grafos con estado durable y reanudación tras caídas: hay `RunState` serializable, pero no checkpointer por pasos al estilo LangGraph. Tampoco si no quieres depender de LiteLLM para Claude.

**Trampas.**
- Tracing activo por defecto con destino OpenAI: sin clave de OpenAI falla al exportar, y además envía datos a un tercero. Se desactiva con `set_tracing_disabled(True)` o `OPENAI_AGENTS_DISABLE_TRACING`.
- El error genérico por defecto de las herramientas.
- `max_turns=10` por defecto.
- `openai-agents[litellm]` fija litellm 1.83.0, no la última.

**Fuentes.** README en PyPI de `openai-agents`; código instalado: `agents/tool.py` (`default_tool_error_function`) y `agents/tracing/processors.py` (endpoint de ingesta).

### 3.6 Pydantic AI (`pydantic-ai` 2.63.0, MIT, estable)

**Qué es.** El framework de agentes del equipo de Pydantic: tipado de extremo a extremo, salida validada, dependencias inyectadas y modelo intercambiable. Lo complementan `pydantic-graph` (flujo tipado, con `GraphBuilder`, `Fork` y `Join`), `pydantic-evals` y la durabilidad con Temporal, DBOS o Prefect (`pydantic_ai.durable_exec.*`; extra `[temporal]`).

**API verificada.**
- `Agent(model, output_type, instructions, system_prompt, deps_type, name, description, model_settings, retries, validation_context, tools, toolsets, defer_model_check, end_strategy, metadata, tool_timeout, max_concurrency, capabilities)`.
- `@agent.tool` (recibe `RunContext`) y `@agent.tool_plain`, con `requires_approval`, `strict`, `retries`, `sequential` y `timeout`.
- `@agent.output_validator`.
- `run`, `run_sync`, `run_stream`, `run_stream_events`, `iter` y `override`.
- Salida: `ToolOutput`, `NativeOutput`, `PromptedOutput`.
- `UsageLimits(request_limit, tool_calls_limit, input_tokens_limit, output_tokens_limit, total_tokens_limit, cost_limit, …)`.
- `AnthropicModelSettings` con claves `anthropic_effort`, `anthropic_thinking`, `anthropic_cache_instructions`, `anthropic_cache_tool_definitions`, `anthropic_cache_messages`, `anthropic_betas`, `anthropic_context_management`…
- Ollama: `OllamaModel("qwen3", provider=OllamaProvider(base_url="http://localhost:11434/v1"))` o la cadena `"ollama:qwen3"` (construcción verificada).
- MCP: `pydantic_ai.mcp.MCPToolset`, que requiere `pydantic-ai-slim[mcp]` y usa fastmcp, o `capabilities=[MCP(url)]`.

**Ejemplo VERIFICADO** (`ejemplos/pai_01_agente.py`; probado con `TestModel` y `FunctionModel`).

```python title="agente_pydantic_ai.py"
from dataclasses import dataclass

from pydantic import BaseModel, Field
from pydantic_ai import Agent, DeferredToolRequests, ModelRetry, RunContext, UsageLimits
from pydantic_ai.models.anthropic import AnthropicModelSettings

MODEL = "anthropic:claude-sonnet-5-5"
# Local: from pydantic_ai.models.ollama import OllamaModel; from pydantic_ai.providers.ollama import OllamaProvider
#        MODEL = OllamaModel("qwen3", provider=OllamaProvider(base_url="http://localhost:11434/v1"))


@dataclass
class Deps:                                   # lo que tus herramientas necesitan (BD, cliente HTTP, usuario…)
    pedidos: dict[str, list[dict]]
    email_cliente: str


class Respuesta(BaseModel):
    respuesta: str = Field(description="Texto para el cliente")
    pedidos_citados: list[str] = Field(description="Ids de pedido usados en la respuesta")
    escalar: bool = Field(description="True si necesita un humano")


agente = Agent(
    MODEL,
    deps_type=Deps,
    output_type=[Respuesta, DeferredToolRequests],   # DeferredToolRequests: el run puede acabar pidiendo aprobación
    instructions="Eres el soporte de una tienda. Usa las herramientas; no inventes datos.",
    model_settings=AnthropicModelSettings(max_tokens=1024, anthropic_effort="medium"),
    retries=2,                                       # reintentos por validación/ModelRetry
)


@agente.tool
def ver_pedidos(ctx: RunContext[Deps]) -> list[dict]:
    """Lista los pedidos del cliente autenticado."""
    pedidos = ctx.deps.pedidos.get(ctx.deps.email_cliente)
    if pedidos is None:
        raise ModelRetry("Ese cliente no tiene pedidos; pide otro email.")   # vuelve al modelo como reintento
    return pedidos


@agente.tool_plain(requires_approval=True)          # no se ejecuta sin aprobación humana
def reembolsar(pedido_id: str, importe_eur: float) -> str:
    """Emite un reembolso. Acción irreversible."""
    return f"Reembolso de {importe_eur} € emitido para {pedido_id}."


if __name__ == "__main__":
    deps = Deps(pedidos={"ana@example.com": [{"id": "P-1001", "estado": "enviado"}]}, email_cliente="ana@example.com")
    r = agente.run_sync("¿Dónde está mi pedido?", deps=deps, usage_limits=UsageLimits(request_limit=10))
    print(r.output)            # Respuesta(...) validada por Pydantic, o DeferredToolRequests si pide aprobación
    print(r.usage)             # en la 2.x es una propiedad, no un método
```

Aprobación verificada: si `r.output` es `DeferredToolRequests`, se reanuda con `agente.run_sync(message_history=r.all_messages(), deferred_tool_results=DeferredToolResults(approvals={call_id: True o ToolDenied("motivo")}), deps=deps)`. Límite verificado: `UsageLimitExceeded`. Tras agotar `retries` con `ModelRetry` salta `UnexpectedModelBehavior`.

**Cuándo sí.**
- Salida estructurada como contrato (extracción documental) y dependencias tipadas.
- Probar sin API (`TestModel`, `FunctionModel`, `agent.override`).
- Durabilidad sobre un motor que ya tengas (Temporal).

**Cuándo no.** Grafos multiagente complejos con interrupciones encadenadas: es posible con `pydantic-graph`, pero hay menos ejemplos. Tampoco si quieres el ecosistema de integraciones de LangChain.

**Trampas.**
- `result.usage` es una propiedad.
- El banner de consola en la 2.x se quita con `PYDANTIC_AI_NO_BANNER=1`.
- MCP necesita el extra `[mcp]`.

**Fuentes.** README en PyPI de `pydantic-ai`; código instalado.

### 3.7 LlamaIndex (`llama-index-core` 0.14.25, MIT)

**Qué es.** Un framework orientado a datos y RAG, con ingesta, índices y *retrievers*, más agentes sobre *Workflows* (motor de eventos; paquete `llama-index-workflows` 2.26.1). LlamaCloud y LlamaParse son servicios comerciales (SIN CONFIRMAR los detalles en esta sesión).

**API verificada.**
- `Workflow(timeout=45.0, …)` con métodos `@step async def …(self, ctx: Context, ev: X) -> Y`. Los eventos heredan de `Event`; el flujo empieza con `StartEvent` y acaba con `StopEvent(result=…)`. El estado compartido se guarda con `await ctx.store.set/get`.
- `FunctionAgent(tools, llm, system_prompt, can_handoff_to, output_cls, …)` y `AgentWorkflow(agents, root_agent, …)` en `llama_index.core.agent.workflow`. `await agente.run(user_msg=…)`.
- `from llama_index.llms.anthropic import Anthropic` (`model`, `max_tokens`, `thinking_dict`, `cache_idx`) y `from llama_index.llms.ollama import Ollama` (`model`, `base_url`, `request_timeout`, `thinking`, `context_window`).
- `VectorStoreIndex.from_documents(documents, storage_context=None, transformations=None, …)`.

**Ejemplo VERIFICADO** (`ejemplos/li_01_llamaindex.py`): un Workflow con una comprobación hecha en código ejecutado, y la construcción de `FunctionAgent` con Claude.

```python title="llamaindex_workflow.py"
from llama_index.core.agent.workflow import FunctionAgent
from llama_index.core.workflow import Context, Event, StartEvent, StopEvent, Workflow, step
from llama_index.llms.anthropic import Anthropic


class Borrador(Event):
    texto: str


class Encadenado(Workflow):
    def __init__(self, generar, **kw):
        super().__init__(**kw)
        self.generar = generar                      # función async texto -> texto (el LLM)

    @step
    async def escribir(self, ctx: Context, ev: StartEvent) -> Borrador:
        await ctx.store.set("intentos", 0)
        return Borrador(texto=await self.generar(f"Escribe un titular sobre: {ev.tema}"))

    @step
    async def revisar(self, ctx: Context, ev: Borrador) -> Borrador | StopEvent:
        intentos = await ctx.store.get("intentos") + 1
        await ctx.store.set("intentos", intentos)
        if len(ev.texto) <= 60 or intentos >= 3:    # la comprobación es código, no otro LLM
            return StopEvent(result=ev.texto)
        return Borrador(texto=await self.generar(f"Acórtalo a 60 caracteres: {ev.texto}"))


def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email."""
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


agente = FunctionAgent(tools=[ver_pedidos], llm=Anthropic(model="claude-sonnet-5-5", max_tokens=1024),
                       system_prompt="Eres el soporte de una tienda. Usa las herramientas; no inventes datos.")
# respuesta = await agente.run(user_msg="Soy ana@example.com, ¿y mi pedido?")
```

**Cuándo sí.** RAG con mucha ingesta y conectores de datos, y workflows por eventos. **Cuándo no.** Agentes sin documentos: aporta poco frente a SDK más pequeños.

### 3.8 CrewAI (`crewai` 1.15.33, MIT; CrewAI AMP comercial)

**Qué es.** Un framework de alto nivel con dos piezas:
- **Crews**: agentes con `role`, `goal` y `backstory`, y tareas con `description` y `expected_output`, en `Process.sequential` o `Process.hierarchical`.
- **Flows**: orquestación por eventos con `@start`, `@listen` y `@router` y estado Pydantic.

Su README dice que no depende de LangChain. Con `crewai[anthropic]`, `LLM("anthropic/…")` resuelve al proveedor nativo `AnthropicCompletion` (verificado). Sin el extra lanza `ImportError` pidiéndolo.

**API verificada.**
- `Agent(role, goal, backstory, tools, llm, max_iter, allow_delegation, memory, knowledge_sources, mcps, …)`.
- `Task(description, expected_output, agent, context, output_pydantic, human_input, guardrail, async_execution, tools, markdown)`.
- `Crew(agents, tasks, process, memory, manager_llm, planning, …)` y `crew.kickoff(inputs={...})`.
- `from crewai.flow.flow import Flow, start, listen, router` y `from crewai.tools import tool`.

**Ejemplo VERIFICADO**, construcción del Crew y ejecución del Flow sin LLM (`ejemplos/crew_01_crewai.py`).

```python title="crew.py"
from crewai import LLM, Agent, Crew, Process, Task
from crewai.flow.flow import Flow, listen, start
from crewai.tools import tool
from pydantic import BaseModel

llm = LLM(model="anthropic/claude-sonnet-5-5", max_tokens=1024)   # local: LLM(model="ollama/qwen3", base_url="http://localhost:11434")


@tool("buscar_docs")
def buscar_docs(consulta: str) -> str:
    """Busca en la documentación interna y devuelve fragmentos relevantes."""
    return f"(fragmentos simulados para «{consulta}»)"


def crear_crew() -> Crew:
    investigador = Agent(role="Investigador", goal="Reunir hechos verificables con su fuente",
                         backstory="Analista meticuloso.", tools=[buscar_docs], llm=llm, max_iter=5)
    redactor = Agent(role="Redactor", goal="Escribir resúmenes claros en español",
                     backstory="Editor técnico.", llm=llm)
    investigar = Task(description="Investiga: {tema}", expected_output="5 hechos con fuente", agent=investigador)
    redactar = Task(description="Resume los hallazgos en 3 párrafos", expected_output="Resumen en markdown",
                    agent=redactor, context=[investigar])
    return Crew(agents=[investigador, redactor], tasks=[investigar, redactar], process=Process.sequential)


class Estado(BaseModel):
    tema: str = ""
    resumen: str = ""


class Informe(Flow[Estado]):
    @start()
    def preparar(self):
        self.state.tema = self.state.tema.strip() or "agentes de IA"

    @listen(preparar)
    def investigar(self):
        self.state.resumen = crear_crew().kickoff(inputs={"tema": self.state.tema}).raw
        return self.state.resumen
```

**Cuándo sí.** Prototipos de «equipos» con roles, si el equipo ya piensa así. **Cuándo no.** Cuando necesitas saber exactamente qué prompt llega al modelo y por qué: el *role-play* añade texto que no escribes tú. Tampoco con Python 3.14 (exige `<3.14`) o si tu proyecto necesita pydantic ≥ 2.13 (fija `<2.13`).

**Trampas.**
- Telemetría anónima activada por defecto; se desactiva con `CREWAI_DISABLE_TELEMETRY=true` o con `OTEL_SDK_DISABLED=true`.
- `mcp<2`.
- El Flow imprime paneles en consola.

**Fuentes.** README en PyPI (secciones License, Telemetry y CrewAI AMP Suite).

### 3.9 Google ADK (`google-adk` 2.13.0, Apache-2.0)

**API verificada.**
- `from google.adk.agents import Agent` (es el mismo objeto que `LlmAgent`), `SequentialAgent`, `ParallelAgent` y `LoopAgent`.
- Campos de `LlmAgent`: `name`, `model`, `instruction`, `tools`, `sub_agents`, `output_schema`, `output_key`, `planner`, `code_executor`, `before_/after_model_callback` y `before_/after_tool_callback`.
- `from google.adk.models.lite_llm import LiteLlm` → `LiteLlm(model="anthropic/claude-sonnet-5-5")`, construcción verificada.
- `google.adk.models.anthropic_llm.Claude` existe y necesita el paquete `anthropic`; probablemente es para Claude en Vertex AI (SIN CONFIRMAR).
- `from google.adk.runners import Runner, InMemoryRunner` y `run_async(user_id, session_id, new_message, …)`.
- Hay módulo `google.adk.a2a` para el protocolo Agent2Agent.

**Lenguajes**: el README enlaza ADK Java, Kotlin, Go y TypeScript (`@google/adk` 2.4.0 en npm, verificado). La construcción con Claude está verificada en `ejemplos/otros_01_minimos.py adk`.

**Cuándo sí.** Equipos en Google Cloud, agentes jerárquicos con `sub_agents`, interoperabilidad A2A. **Cuándo no.** Si Claude es tu modelo principal, porque dependes de LiteLLM o de Vertex.

### 3.10 Microsoft Agent Framework (`agent-framework` 1.23.0, MIT)

**Estado.** El README de Semantic Kernel dice: «Semantic Kernel is now Microsoft Agent Framework… the enterprise‑ready successor… now available at version 1.0 as a production-ready release». La fecha exacta de la 1.0 queda SIN CONFIRMAR. AutoGen (`autogen-agentchat`) no publica en PyPI desde el 30-9-2025. Que Microsoft lo considere también su sucesor oficial queda SIN CONFIRMAR en esta sesión.

**API verificada** (`venv-maf2`):
- `from agent_framework import Agent, tool, WorkflowBuilder, Executor, handler, MCPStdioTool, MCPStreamableHTTPTool`.
- `Agent(client, instructions, name, description, tools, default_options, context_providers, middleware, compaction_strategy, …)`.
- `from agent_framework.anthropic import AnthropicClient` (`AnthropicClient(model=…, api_key=…)`; paquete en beta `1.0.0b261022`).
- `from agent_framework.ollama import OllamaChatClient`.
- Ejecución: `await agente.run("…")`.

**Trampa**: `pip install agent-framework` (el metapaquete con todas las integraciones) resolvió a la 1.19.0 en mi entorno. Instalar `agent-framework-core==1.23.0` y las integraciones que necesites dio la versión actual.

### 3.11 smolagents (1.26.0, Apache-2.0)

**API verificada.**
- `CodeAgent(tools, model, additional_authorized_imports, planning_interval, executor_type, executor_kwargs, …)`: el modelo escribe y ejecuta Python.
- `ToolCallingAgent(tools, model, max_steps)`.
- `@tool` exige un docstring con `Args:` por parámetro.
- Modelos: `LiteLLMModel(model_id="anthropic/claude-sonnet-5-5")`, `InferenceClientModel`, `TransformersModel` y `OpenAIModel`.
- Ejecutores: `LocalPythonExecutor` (por defecto, verificado), `E2BExecutor`, `DockerExecutor`, `ModalExecutor` y `BlaxelExecutor`.

**Advertencia oficial (README)**: «The built-in `LocalPythonExecutor` is **not a security sandbox**. It applies some restrictions but can be bypassed and must not be used as a security boundary.»

**Cuándo sí.** Enseñar «agentes que actúan escribiendo código»; el README dice que la lógica cabe en unas 1 000 líneas, así que se puede leer entera. **Cuándo no.** En producción sin un sandbox real.

### 3.12 Haystack (`haystack-ai` 3.4.1, Apache-2.0; Haystack Enterprise comercial)

La serie actual es la **3.x**, no la 2.x. Qué cambió de la 2 a la 3 queda SIN CONFIRMAR: no leí el changelog.

**API verificada.**
- `from haystack import Pipeline, component`.
- `from haystack.components.agents import Agent` → `Agent(chat_generator, tools, system_prompt, user_prompt, required_variables, exit_conditions, state_schema, max_agent_steps, streaming_callback, raise_on_tool_invocation_failure, tool_concurrency_limit, …)`.
- `from haystack.tools import tool, Tool, Toolset, create_tool_from_function`.
- `from haystack_integrations.components.generators.anthropic import AnthropicChatGenerator` (`model`, `generation_kwargs`, `tools`, `anthropic_server_tools`, …).
- `OllamaChatGenerator(model, url, …)`.
- Hayhooks expone pipelines como REST o MCP.

**Cuándo sí.** RAG de producción con pipelines explícitos y componentes intercambiables. **Cuándo no.** Agentes conversacionales simples.

### 3.13 DSPy (3.4.1, MIT; clasificador PyPI «3 - Alpha»)

**Qué es.** Según su README, «Programming—not prompting». Declaras *signatures* y módulos, y unos optimizadores ajustan prompts o pesos contra una métrica.

**API verificada.**
- `dspy.LM("anthropic/claude-sonnet-5-5", max_tokens=1024)` y `dspy.configure(lm=…)`.
- `class X(dspy.Signature)` con `dspy.InputField()`/`dspy.OutputField(desc=…)`.
- Módulos: `dspy.Predict`, `dspy.ChainOfThought`, `dspy.ReAct(signature, tools, max_iters=20)`, `dspy.CodeAct`, `dspy.Refine` y `dspy.BestOfN`.
- Optimizadores: `dspy.MIPROv2`, `dspy.GEPA(metric, auto, reflection_lm, …)`, `dspy.SIMBA` y `dspy.BootstrapFewShot`.
- `dspy.Evaluate`.

**Ejemplo VERIFICADO**, ejecutado con `DummyLM`:

```python title="dspy_clasificar.py"
import dspy


class Clasificar(dspy.Signature):
    """Clasifica un ticket de soporte."""
    ticket: str = dspy.InputField()
    categoria: str = dspy.OutputField(desc="facturacion | envio | cuenta | producto")


dspy.configure(lm=dspy.LM("anthropic/claude-sonnet-5-5", max_tokens=1024))
pred = dspy.ChainOfThought(Clasificar)(ticket="Me habéis cobrado dos veces")
print(pred.categoria, pred.reasoning)
```

**Cuándo sí.** Tareas con métrica clara y datos etiquetados, cuando quieres optimizar prompts de forma sistemática; casa con el nivel 80 (Evals). **Cuándo no.** Prototipos sin conjunto de evaluación.

### 3.14 Strands, Agno, Mastra, Vercel AI SDK, LangChain.js y LangGraph.js

**Strands Agents** (`strands-agents` 1.62.0, Apache-2.0, AWS; `@strands-agents/sdk` 1.22.0).
- `Agent(model, tools, system_prompt, structured_output_model, conversation_manager, session_manager, hooks, …)`.
- `from strands.models.anthropic import AnthropicModel` → `AnthropicModel(model_id="claude-sonnet-5-5", max_tokens=1024)`.
- `OllamaModel(host, model_id=…)`.
- Multiagente: `strands.multiagent.GraphBuilder` y `Swarm`.
- **Sin `model=`, usa Amazon Bedrock** («For the default Amazon Bedrock model provider, you'll need AWS credentials», README).
- Construcción verificada.

**Agno** (3.1.12, Apache-2.0).
- `from agno.agent import Agent`, `from agno.models.anthropic import Claude`, `agno.team.Team` y `agno.workflow` (`Workflow`, `Step`, `Parallel`, `Router`, `Loop`, `HumanReview`).
- Ollama requiere `pip install ollama`.
- Envía telemetría por defecto («Prompts, messages, and outputs are never sent»); se desactiva con `AGNO_TELEMETRY=false`.

**Vercel AI SDK v7** (`ai` 7.0.157). Verificado con `tsc` y ejecutado con `MockLanguageModelV4`:

```ts title="agente.ts"
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, hasToolCall, isStepCount, tool, ToolLoopAgent } from "ai";
import { z } from "zod";

const MODEL = anthropic("claude-sonnet-5-5"); // local: import { ollama } from "ollama-ai-provider-v2"; ollama("qwen3")

const PEDIDOS: Record<string, object[]> = { "ana@example.com": [{ id: "P-1001", estado: "enviado" }] };

const verPedidos = tool({
  description: "Lista los pedidos de un cliente por su email. Devuelve id y estado de cada pedido.",
  inputSchema: z.object({ email: z.string().describe("Email del cliente") }),
  execute: async ({ email }) => {
    const pedidos = PEDIDOS[email.toLowerCase()];
    if (!pedidos) throw new Error(`No hay ningún cliente con email ${email}`); // el SDK lo devuelve al modelo como tool-error
    return pedidos;
  },
});

const reembolsar = tool({
  description: "Emite un reembolso. Acción irreversible.",
  inputSchema: z.object({ pedidoId: z.string(), importeEur: z.number() }),
  needsApproval: true, // el bucle se detiene y devuelve una petición de aprobación
  execute: async ({ pedidoId, importeEur }) => `Reembolso de ${importeEur} € emitido para ${pedidoId}.`,
});

// generateText hace UNA llamada por defecto (isStepCount(1)); stopWhen activa el bucle.
export async function responder(pregunta: string) {
  const r = await generateText({
    model: MODEL,
    system: "Eres el soporte de una tienda. Usa las herramientas; no inventes datos.",
    prompt: pregunta,
    tools: { ver_pedidos: verPedidos },
    maxOutputTokens: 1024,
    stopWhen: [isStepCount(10), hasToolCall("escalar")], // cualquiera de las dos para el bucle
  });
  for (const paso of r.steps) console.log(paso.finishReason, paso.toolCalls.map((c) => c.toolName));
  return r.text;
}

// ToolLoopAgent encapsula modelo, instrucciones y herramientas (por defecto para a los 20 pasos).
export const agente = new ToolLoopAgent({
  model: MODEL,
  instructions: "Eres el soporte de una tienda. Antes de reembolsar, comprueba el pedido.",
  tools: { ver_pedidos: verPedidos, reembolsar },
  stopWhen: isStepCount(10),
  maxOutputTokens: 1024,
});
```

Salida real con el modelo simulado:

```text
1) sin stopWhen -> pasos: 1 | finishReason: tool-calls | text: ""
2) con stopWhen -> pasos: 3 | text: Tu pedido es P-1001
   contenidos paso 1: [ 'tool-call', 'tool-error:No existe x@y.z' ]
3) ToolLoopAgent needsApproval -> pasos: 1 | contenido: [ 'tool-call', 'tool-approval-request' ]
```

**LangChain.js 1.6.0**: `createAgent({ model: "anthropic:…", tools, systemPrompt, middleware: [humanInTheLoopMiddleware({ interruptOn: {...} }), modelCallLimitMiddleware({ runLimit: 10 })], checkpointer: new MemorySaver() })`.
- Los nombres van en camelCase: `systemPrompt`, `interruptOn`, `allowedDecisions`, y el *payload* de la interrupción lleva `actionRequests`/`reviewConfigs`. `system_prompt` da error de tipos (verificado con el compilador).
- Ejecutado con `FakeToolCallingModel`: interrumpe, se aprueba con `new Command({ resume: { decisions: [{ type: "approve" }] } })` y ejecuta la herramienta.
- Exporta los mismos middleware que Python en camelCase: `toolErrorMiddleware`, `summarizationMiddleware`, `piiMiddleware`, `anthropicPromptCachingMiddleware`, `todoListMiddleware`…

**LangGraph.js 1.5.3** (compilado):

```ts title="grafo.ts"
import { ChatAnthropic } from "@langchain/anthropic";
import { tool } from "@langchain/core/tools";
import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { z } from "zod";

const llm = new ChatAnthropic({ model: "claude-sonnet-5-5", maxTokens: 2048 });
const verPedido = tool(async ({ pedidoId }) => `{"id": "${pedidoId}", "estado": "entregado"}`, {
  name: "ver_pedido",
  description: "Devuelve el estado de un pedido por su id.",
  schema: z.object({ pedidoId: z.string() }),
});
const tools = [verPedido];
const llmConTools = llm.bindTools(tools);

export const agente = new StateGraph(MessagesAnnotation)
  .addNode("modelo", async (state) => ({ messages: [await llmConTools.invoke(state.messages)] }))
  .addNode("tools", new ToolNode(tools))
  .addEdge(START, "modelo")
  .addConditionalEdges("modelo", toolsCondition, ["tools", END])
  .addEdge("tools", "modelo")
  .compile({ checkpointer: new MemorySaver() });
// await agente.invoke({ messages: [...] }, { configurable: { thread_id: "1" }, recursionLimit: 25 });
```

El map-reduce con `new Send("trabajador", { subtarea })` y `Annotation<string[]>({ reducer: (a, b) => a.concat(b), default: () => [] })` también compila (`ts/langgraph_grafo.ts`).

**OpenAI Agents JS 0.21.0** (compilado): `new Agent({ name, instructions, tools, handoffs, model: aisdk(anthropic("claude-sonnet-5-5")) })`, con `aisdk` importado de `@openai/agents-extensions/ai-sdk`, y `await run(agente, "…", { maxTurns: 10 })`.

**Mastra** (`@mastra/core` 1.80.0; compilado): `new Agent({ id, name, instructions, model: "anthropic/claude-sonnet-5-5", tools: { verPedidos } })` con `createTool({ id, description, inputSchema, outputSchema, execute })` de `@mastra/core/tools`, y `await agente.generate("…", { maxSteps: 10 })`. Los modelos como string los resuelve su router de pasarelas (models.dev, Mastra, Netlify, Azure). Qué ruta sigue exactamente `anthropic/…` queda SIN CONFIRMAR; compruébalo antes de producción. Recuerda la licencia `ee/`.

### 3.15 Comparativa honesta: cuándo usar qué

| Situación | Recomendación | Por qué |
|---|---|---|
| Aprender el mecanismo, o un producto con un solo proveedor y pocos pasos | **SDK del proveedor directamente** (la referencia actual de MoreContext) | Cero abstracción: ves `stop_reason`, bloques y `usage`; depuras leyendo `messages`; accedes antes a las funciones nuevas del proveedor (caché, razonamiento, herramientas del servidor) |
| Agente con herramientas que debe funcionar con varios proveedores, Claude y local | **LangChain `create_agent`** o **Pydantic AI** | Bucle, límites, reintentos y aprobación ya hechos. Pydantic AI si la salida tipada es el contrato; LangChain si necesitas su middleware o integraciones |
| Flujo con pasos fijos y pasos agénticos, aprobaciones que tardan, reanudación tras caídas, paralelismo | **LangGraph** (grafo explícito) | El estado y los checkpoints son el producto. `interrupt` + `thread_id` + `SqliteSaver`/`PostgresSaver` cubren lo que en el SDK tendrías que construir tú |
| Tareas largas y abiertas al estilo de los agentes de código | **Deep Agents** | Archivos, subagentes y resumen listos. Mide el coste por turno |
| Triaje entre especialistas con guardrails | **OpenAI Agents SDK** | Handoffs y guardrails declarativos; ojo al tracing por defecto y a LiteLLM para Claude |
| Prototipo de «equipo» con roles | **CrewAI** | Rápido de montar, pero controlas menos el prompt real. Antes de producción, pásalo a algo más explícito |
| RAG con mucha ingesta | **LlamaIndex** o **Haystack** | Su punto fuerte son los datos, no el bucle |
| Optimizar prompts contra una métrica | **DSPy** | Exige dataset y métrica; encaja con el nivel 80 |
| Producto web en TypeScript | **Vercel AI SDK** (o LangChain.js/LangGraph.js si quieres paridad con Python) | Streaming a la interfaz de serie. Recuerda `stopWhen` |

**Coste de la abstracción** (observado en esta investigación):
- **Valores por defecto que no ves**: `max_tokens` de 128000, tracing a OpenAI, errores silenciados o propagados según el framework, un sandbox que no es sandbox, `write_todos` que desaparece entre versiones menores.
- **Prompts añadidos**: los middleware y Deep Agents inyectan texto de sistema. La 0.7 lo redujo precisamente por coste.
- **Ritmo de cambio**: entre mayo y octubre de 2026 LangChain sacó tres versiones menores con APIs nuevas (`stream_events v3`, `version="v2"`, `langchain.mcp`, `interrupt_mode="per_call"`).

**Lock-in.**
- LangChain y LangGraph son MIT, pero el despliegue «llave en mano» (Agent Server) es Elastic-2.0 y las trazas cómodas están en LangSmith.
- Vercel resuelve los modelos en string por su gateway.
- Strands usa Bedrock por defecto.
- El tracing por defecto del Agents SDK va a OpenAI.
- La salida práctica: pasar siempre instancias explícitas del modelo y exportar trazas con OpenTelemetry a un backend tuyo. Eso lo cubre el informe de infraestructura.

**Depuración.**
- En LangGraph, `stream_mode="updates"` y `get_state_history`.
- En Pydantic AI, `capture_run_messages` y `all_messages()`.
- En el Agents SDK, `new_items` del resultado.
- En todos ellos, **escribir pruebas con modelos simulados** (ver `ejemplos/`) es la forma más barata de fijar la trayectoria esperada.

---

## 4. Equivalencias entre conceptos de MoreContext y APIs

Nombres verificados en las versiones de §2. «Tu código» significa que el framework no lo trae y lo escribes tú.

| Concepto MoreContext | Anthropic SDK (referencia) | LangChain 1.4 | LangGraph 1.2 | OpenAI Agents SDK 0.24 | Pydantic AI 2.63 |
|---|---|---|---|---|---|
| Llamada aumentada | `client.messages.create(system=…, tools=…, messages=…)` | `init_chat_model(...).bind_tools(tools).invoke(msgs)` | Un nodo que llama a `llm.bind_tools(...)` | `Agent(instructions, tools)` + `Runner.run` | `Agent(model, instructions, tools, deps_type)` |
| `tool_use` / `tool_result` / `is_error` | Bloques `tool_use` → `tool_result` con `is_error` | `AIMessage.tool_calls` → `ToolMessage(tool_call_id, status="error")`; **`ToolErrorMiddleware` para excepciones** | `ToolNode` (por defecto solo captura argumentos inválidos) | `function_tool`; items `tool_call_item`/`tool_call_output_item`; `failure_error_function` | `ToolCallPart` → `ToolReturnPart`; `ModelRetry` → `RetryPromptPart` |
| Bucle agéntico | Tu bucle sobre `stop_reason` | `create_agent(...)` | `StateGraph` modelo ⇄ `ToolNode` con `tools_condition` | `Runner.run` / `run_sync` | `agent.run` / `run_sync` / `iter` |
| Condiciones de parada | `max_pasos`, `stop_reason`, `max_tokens` | `ModelCallLimitMiddleware(run_limit=…)`, `ToolCallLimitMiddleware`, `recursion_limit` | `config["recursion_limit"]` → `GraphRecursionError`; aristas a `END` | `max_turns` → `MaxTurnsExceeded`; `tool_use_behavior` / `StopAtTools` | `UsageLimits(request_limit, tool_calls_limit, total_tokens_limit…)` → `UsageLimitExceeded` |
| Encadenado | Funciones en secuencia con comprobaciones | Llamadas en secuencia (o LCEL `|` de `langchain-core`) | `add_edge` secuencial o `@entrypoint` + `@task` | Código Python entre varios `Runner.run` | Código, o `pydantic_graph` |
| Enrutado | Clasificar con salida estructurada + `if` | `with_structured_output(Ruta)` + `if` | `add_conditional_edges(origen, fn, [...])` o `Command(goto=…)` | `handoffs=[…]` (triaje) | `output_type` con unión de modelos + `if`, o un agente router |
| Paralelización | `asyncio.gather` | `RunnableParallel` / `model.batch` | `Send` o varias aristas desde un nodo (fan-out) + reductor | `asyncio.gather(Runner.run(...), …)` | `asyncio.gather(agent.run(...))`; `pydantic_graph` `Fork`/`Join` |
| Orquestador-trabajadores | Plan JSON + `gather` + síntesis | Subagentes como herramientas; **Deep Agents** `subagents=[…]` → `task` | `Send` (map-reduce) con `Annotated[list, operator.add]` | `agente.as_tool(...)` o handoffs | Un agente que llama a otro dentro de una `@agent.tool` |
| Evaluador-optimizador | Bucle generar → criticar | Bucle con dos modelos; `RubricMiddleware` (deepagents, beta) | Ciclo con arista condicional de vuelta | Agente juez en bucle u `output_guardrails` | `@agent.output_validator` + `ModelRetry` |
| Humano en el bucle | Pausa tu bucle antes de ejecutar | `HumanInTheLoopMiddleware(interrupt_on=…)` + `Command(resume={"decisions": [...]})` | `interrupt(valor)` + `Command(resume=…)` + checkpointer + `thread_id` | `function_tool(needs_approval=True)` → `result.interruptions` → `state.approve/reject` | `requires_approval=True` → `DeferredToolRequests` → `DeferredToolResults(approvals=…)` |
| Memoria | Tú guardas `messages` | `checkpointer` + `thread_id`; `store` + `ToolRuntime` | `InMemorySaver`/`SqliteSaver`/`PostgresSaver`; `InMemoryStore`/`PostgresStore` | `Session` (`SQLiteSession`…) | `message_history=r.all_messages()` + tu almacenamiento |
| MCP | Cliente `mcp` + convertir herramientas (o `mcp_servers` del conector) | `langchain.mcp.MCPAdapter` (beta) o `langchain-mcp-adapters` (`mcp<2`) | Las mismas herramientas en `ToolNode` | `MCPServerStdio`, `MCPServerStreamableHttp`, `HostedMCPTool` | `pydantic_ai.mcp.MCPToolset` (extra `[mcp]`) o `capabilities=[MCP(url)]` |
| Salida estructurada | `output_config.format` / `messages.parse(output_format=…)` | `response_format=Modelo` (`ProviderStrategy`/`ToolStrategy`) → `structured_response`; `with_structured_output` | `llm.with_structured_output(...)` dentro de un nodo | `Agent(output_type=Modelo)` → `final_output` | `output_type=Modelo` (`ToolOutput`/`NativeOutput`/`PromptedOutput`) |
| Streaming | `client.messages.stream(...)` | `agent.stream(..., stream_mode="messages")`; `stream_events(version="v3")` | `graph.stream(stream_mode="updates"|"messages"|"custom"|…)` | `Runner.run_streamed(...)` → `stream_events()` | `run_stream` / `run_stream_events` |
| Trazas | Registrar `messages`, `stop_reason`, `usage` | LangSmith (comercial) o callbacks/OTel; `pretty_print()` | `stream_mode="debug"`, `get_state_history(config)` | Tracing integrado (por defecto a OpenAI; `set_tracing_disabled`, procesadores propios) | Logfire u OpenTelemetry (`capabilities` `Instrumentation`); `capture_run_messages` |

---

## 5. Propuestas de contenido

### 5.1 Curso nuevo: `cursos/langchain-y-langgraph/`

`index.md`: `orden: 9, nivel: intermedio, horas: 6, requiere: ["[[roadmap/40-primer-agente/index]]"]`. Objetivo: «Rehacer con LangChain y LangGraph, con Claude y con un modelo local, el agente de soporte del nivel 40, sabiendo qué hace el framework por ti y qué tienes que vigilar». Proyecto: el agente de soporte con aprobación de reembolsos, persistido en SQLite y con pruebas sin API.

| Archivo | Título | Tipo / min | Contenido y código base |
|---|---|---|---|
| `01-del-bucle-a-create-agent.md` | Del bucle a mano a `create_agent` | practica · 45 | El agente de `roadmap/40-primer-agente/02` con `create_agent`; leer la traza de mensajes; Claude y Ollama con `init_chat_model`; `max_tokens` explícito. Código: `lc_01_agente.py` |
| `02-herramientas-errores-y-limites.md` | Herramientas, errores y límites | practica · 45 | `@tool(parse_docstring=True)`, `args_schema` Pydantic, **`ToolErrorMiddleware`** (la trampa), `ModelCallLimitMiddleware`/`ToolCallLimitMiddleware`, `recursion_limit` |
| `03-middleware.md` | Middleware: aprobación, resumen y caché | practica · 50 | `HumanInTheLoopMiddleware` (approve/edit/reject/respond), `SummarizationMiddleware`, `PIIMiddleware`, `AnthropicPromptCachingMiddleware`; escribir uno propio con `@wrap_tool_call`. Código: `lc_02_aprobacion.py` |
| `04-langgraph-el-agente-como-grafo.md` | LangGraph: el agente como grafo con estado | practica · 50 | `StateGraph`, `MessagesState`, reductores, `ToolNode`/`tools_condition`, `stream_mode="updates"`; cuándo `create_agent` y cuándo grafo |
| `05-interrupciones-y-persistencia.md` | Interrupciones, persistencia y memoria | practica · 50 | `interrupt`/`Command(resume)`, `SqliteSaver.from_conn_string`, `thread_id`, reanudar tras cerrar el proceso, `InMemoryStore` + `ToolRuntime`. Código: `lg_01`, `lg_03` |
| `06-paralelismo-subagentes-y-mcp.md` | Paralelismo, subagentes y MCP | proyecto · 60 | `Send` (`lg_02`), Deep Agents (`da_01`), `langchain.mcp.MCPAdapter` (`mcp_02`); ejercicio final: pruebas con `FakeToolModel` en CI |

### 5.2 Grupo de documentación: `docs/frameworks/`

`index.md` con `orden: 9`. Artículos, todos con `nivel` de inicial a avanzado:

| Archivo | Título | Contenido |
|---|---|---|
| `01-elegir-framework.md` | Elegir framework (o ninguno) | §3.15 entera: SDK directo, framework, grafo o alto nivel; coste de abstracción; lock-in; depuración |
| `02-langchain.md` | LangChain | Referencia de `create_agent` y tabla de middleware con parámetros (§3.1) |
| `03-langgraph.md` | LangGraph | `StateGraph`, checkpointers, `interrupt`, `Send`, `stream_mode`, Functional API, store, durabilidad, licencias de la plataforma |
| `04-deep-agents.md` | Deep Agents | Arnés, backends, subagentes, cambios de la 0.7, `deepagents-code` |
| `05-openai-agents-sdk.md` | OpenAI Agents SDK | Agent, Runner, handoffs, guardrails, sessions, tracing, Claude vía LiteLLM |
| `06-pydantic-ai.md` | Pydantic AI | deps, output_type, aprobación diferida, TestModel/FunctionModel, durabilidad |
| `07-typescript.md` | Agentes en TypeScript | AI SDK v7 (`stopWhen`, `ToolLoopAgent`, `needsApproval`), LangChain.js/LangGraph.js, Mastra, Agents JS |
| `08-otros-frameworks.md` | Otros frameworks | Fichas breves: LlamaIndex, CrewAI, ADK, Microsoft Agent Framework, smolagents, Haystack, DSPy, Strands, Agno, cada una con licencia y qué parte es comercial |
| `09-equivalencias.md` | Equivalencias entre frameworks | La tabla de §4 |

### 5.3 Recetas nuevas

| Ruta | Tema / nivel | Problema |
|---|---|---|
| `recetas/agente-con-claude-u-ollama-en-langchain` | agentes · inicial | El mismo agente con Claude y con un modelo local cambiando una línea |
| `recetas/probar-agentes-sin-api` | evals · intermedio | Pruebas de trayectoria con modelos simulados en LangChain (`FakeToolModel`), Pydantic AI (`FunctionModel`), Agents SDK (`Model` propio) y AI SDK (`MockLanguageModelV4`). Base: `ejemplos/test_*.py` |
| `recetas/map-reduce-con-send` | agentes · intermedio | Orquestador y trabajadores en paralelo con LangGraph (`lg_02`) |
| `recetas/herramientas-mcp-en-langchain` | herramientas · intermedio | `MCPAdapter` frente a `langchain-mcp-adapters` y el conflicto mcp 1.x/2.x |
| `recetas/reanudar-un-agente-tras-un-reinicio` | produccion · intermedio | `SqliteSaver` + `thread_id` + `interrupt` (`lg_01`) |

### 5.4 Variantes en sistemas existentes (sección «Variantes»)

- `sistemas/soporte-con-aprobacion-humana`: variante LangGraph (`lg_01`) y equivalencias con `HumanInTheLoopMiddleware`, `needs_approval` y `requires_approval`.
- `sistemas/investigacion-multiagente`: variante Deep Agents (`da_01`) y variante LangGraph `Send` (`lg_02`).
- `sistemas/extraccion-documental`: variante Pydantic AI (`output_type` + `@agent.output_validator` + `ModelRetry`).
- `sistemas/asistente-de-datos-con-mcp`: cliente `langchain.mcp.MCPAdapter` sobre el servidor de solo lectura.
- `sistemas/agente-de-codigo`: referencia open source `deepagents-code`; smolagents `CodeAgent` y la advertencia de su `LocalPythonExecutor`.
- `sistemas/rag-con-citas`: nota sobre LlamaIndex y Haystack como alternativas de ingesta (sin código nuevo).

### 5.5 Pestañas y secciones en páginas existentes

**Decisión previa sobre las pestañas.** `docs/codigo-verificado/src/scripts/codigo.ts` guarda **una única etiqueta** en `localStorage`. Al pulsar una pestaña activa esa etiqueta en todos los grupos que la tengan. Si un grupo no la tiene, al cargar muestra la primera.

Con pestañas «LangChain»/«LangGraph», pulsar «LangGraph» sustituiría la preferencia «TypeScript» guardada, y en la página siguiente los grupos Python/TypeScript volverían a mostrar Python. Dos opciones:
- **(a) Ampliar el script** para guardar una preferencia por «familia» de etiquetas, por ejemplo una clave para lenguajes y otra para frameworks. Es un cambio de código del sitio, así que lo decide el autor (CLAUDE.md, regla 10).
- **(b) Sin tocar el script**, poner el código de frameworks en una sección aparte, «Con un framework», con sus propias pestañas `tab="LangChain"`, `tab="LangGraph"`, `tab="Pydantic AI"`, y aceptar que pisan la preferencia.

Recomiendo (a).

| Página | Qué añadir | Código |
|---|---|---|
| `roadmap/40-primer-agente/02-el-bucle-agentico` | Sección final «El mismo agente con un framework» (después de «Errores frecuentes»): pestañas LangChain / Pydantic AI / OpenAI Agents SDK, con lo que el framework hace por ti y lo que no | `lc_01`, `pai_01` (versión reducida), `oai_01` (reducida) |
| `roadmap/20-herramientas/02-definir-herramientas` | Pestaña «LangChain» en «Genera el esquema desde tu código»: `@tool(parse_docstring=True)` y `args_schema=BuscarPedidos` | Variante de `lc_01` |
| `roadmap/20-herramientas/03-errores-e-is-error` | Aviso con la trampa: en LangChain hace falta `ToolErrorMiddleware`; en el Agents SDK `failure_error_function`; en Pydantic AI `ModelRetry`; en el AI SDK el error vuelve solo (`tool-error`) | Fragmentos verificados |
| `roadmap/40-primer-agente/03-condiciones-de-parada` | Tabla «Cómo se llama el límite en cada framework» (fila «Condiciones de parada» de §4) | — |
| `patrones/03-encadenado` | Pestaña LangGraph con Functional API (`@entrypoint`/`@task`) | `lg_03` (parte 1) |
| `patrones/04-enrutado` | Pestaña LangGraph (`add_conditional_edges`) y mención a los handoffs del Agents SDK | Nuevo, corto |
| `patrones/05-paralelizacion` | Pestaña LangGraph: fan-out con `Send` | Derivado de `lg_02` |
| `patrones/06-orquestador-trabajadores` | Pestaña LangGraph junto al esqueleto actual | `lg_02` |
| `patrones/07-evaluador-optimizador` | Pestaña LangGraph (ciclo con arista condicional) y Pydantic AI (`output_validator`) | Nuevo, corto |
| `recetas/aprobacion-humana-antes-de-actuar`, `docs/agentes/03-humano-en-el-bucle`, `roadmap/100-produccion/05-humano-en-el-bucle` | Pestañas LangChain (middleware) y LangGraph (`interrupt`) | `lc_02`, `lg_01` |
| `roadmap/30-contexto-y-rag/06-memoria-entre-sesiones`, `docs/contexto/04-memoria` | Checkpointer (memoria de conversación) frente a store (memoria a largo plazo) | `lg_03` (parte 2) |
| `roadmap/20-herramientas/05-mcp-conectar-un-servidor`, `docs/herramientas/02-mcp` | «Usar el servidor desde LangChain» con `MCPAdapter` y la nota mcp 1.x/2.x | `mcp_02` |
| `docs/prompting/03-salida-estructurada` | `response_format` (LangChain), `output_type` (Pydantic AI, Agents SDK) | Fragmentos |
| `roadmap/100-produccion/02-costes-y-prompt-caching` | `AnthropicPromptCachingMiddleware` y `anthropic_cache_*` de Pydantic AI; aviso de `max_tokens` por defecto | Fragmento verificado (payload) |
| `docs/fundamentos/04-streaming`, `recetas/streaming-de-respuestas` | `stream_mode="messages"` en LangGraph; `streamText`/`ToolLoopAgent.stream` en el AI SDK | Nuevo, corto |
| `roadmap/40-primer-agente/06-depurar-con-trazas` | `stream_mode="updates"` y `get_state_history`; aviso de los destinos de traza por defecto | Fragmento |
| `docs/agentes/02-subagentes` | Deep Agents `SubAgent` y `Agent.as_tool` del Agents SDK | `da_01` |

### 5.6 Glosario (términos nuevos)

| Archivo | Término | Categoría | Inglés |
|---|---|---|---|
| `glosario/framework-de-agentes` | Framework de agentes | agentes | agent framework |
| `glosario/middleware` | Middleware (de agente) | agentes | middleware |
| `glosario/checkpointer` | Checkpointer | agentes | checkpointer |
| `glosario/grafo-de-estado` | Grafo de estado | agentes | state graph |
| `glosario/handoff` | Handoff | agentes | handoff |
| `glosario/ejecucion-duradera` | Ejecución duradera | produccion | durable execution |
| `glosario/arnes-de-agente` | Arnés de agente | agentes | agent harness |
| `glosario/modelo-simulado` | Modelo simulado | evals | fake / mock model |

### 5.7 Cambios sugeridos en la guía y el mapa

- `GUIA-CONTENIDO.md` §8: añadir una subsección «Frameworks (verificado en octubre de 2026)» con:
  - las constantes `MODEL = "anthropic:claude-sonnet-5-5"` (LangChain/Pydantic AI) y `LitellmModel("anthropic/claude-sonnet-5-5")` (Agents SDK);
  - la regla «pasa siempre `max_tokens`»;
  - «en `claude-sonnet-5-5` no uses `temperature`»;
  - «MCP en LangChain: `langchain[mcp]`»;
  - «`ToolErrorMiddleware` en todo ejemplo con herramientas que puedan fallar».
- `MAPA-CONTENIDO.md`: añadir el curso, el grupo de docs, las recetas y los términos de arriba.

---

## 6. Fuentes

**Documentación oficial leída en esta sesión**
- LangChain · Agents: https://docs.langchain.com/oss/python/langchain/agents
- LangChain · Middleware incluido: https://docs.langchain.com/oss/python/langchain/middleware/built-in.md
- LangChain · Release v1: https://docs.langchain.com/oss/python/releases/langchain-v1.md
- LangChain · Salida estructurada: https://docs.langchain.com/oss/python/langchain/structured-output.md
- LangGraph · Interrupts: https://docs.langchain.com/oss/python/langgraph/interrupts
- LangChain · Changelog (LangChain, LangGraph, Deep Agents): https://docs.langchain.com/oss/python/langchain/changelog-py
- LangChain · Blog 1.0 (22-10-2025): https://www.langchain.com/blog/langchain-langgraph-1dot0
- LangChain · Blog Deep Agents v0.7 (29-7-2026): https://langchain.com/blog/deep-agents-v0-7
- Deep Agents · Harness: https://docs.langchain.com/oss/python/deepagents/harness/index.html
- Notas de deepagents 0.7.0 (espejo de GitHub Releases, fuente secundaria): https://newreleases.io/project/github/langchain-ai/deepagents/release/deepagents==0.7.0

**Registros de paquetes** (README, metadatos y fechas leídos con la API JSON de PyPI o `npm view`)
- PyPI: https://pypi.org/project/langchain/ · /langchain-core/ · /langchain-anthropic/ · /langchain-ollama/ · /langchain-classic/ · /langgraph/ · /langgraph-prebuilt/ · /langgraph-checkpoint-sqlite/ · /langgraph-checkpoint-postgres/ · /langgraph-supervisor/ · /langgraph-swarm/ · /langgraph-cli/ · /langgraph-api/ · /deepagents/ · /deepagents-code/ · /deepagents-cli/ · /managed-deepagents/ · /langchain-mcp-adapters/ · /openai-agents/ · /pydantic-ai/ · /pydantic-graph/ · /llama-index-core/ · /crewai/ · /smolagents/ · /dspy/ · /google-adk/ · /haystack-ai/ · /anthropic-haystack/ · /strands-agents/ · /agno/ · /agent-framework/ · /semantic-kernel/ · /autogen-agentchat/ · /litellm/ · /mcp/ · /anthropic/
- npm: https://www.npmjs.com/package/langchain · @langchain/langgraph · @langchain/anthropic · @langchain/mcp-adapters · deepagents · ai · @ai-sdk/anthropic · @mastra/core · @openai/agents · @openai/agents-extensions · @google/adk · @strands-agents/sdk

**Repositorios oficiales** (enlazados desde los metadatos de PyPI; no abiertos en esta sesión)
- https://github.com/langchain-ai/langchain · https://github.com/langchain-ai/langgraph · https://github.com/langchain-ai/deepagents · https://github.com/langchain-ai/langchain-mcp-adapters
- https://github.com/openai/openai-agents-python · https://github.com/openai/openai-agents-js
- https://github.com/pydantic/pydantic-ai · https://github.com/crewAIInc/crewAI · https://github.com/huggingface/smolagents
- https://github.com/google/adk-python · https://github.com/microsoft/agent-framework · https://github.com/deepset-ai/haystack · https://github.com/strands-agents/harness-sdk · https://github.com/mastra-ai/mastra

**Código instalado consultado** (en `tmp-2a/venv*/lib/python3.13/site-packages/` y `tmp-2a/ts/node_modules/`)
- `langchain/agents/middleware/{human_in_the_loop,tool_error}.py`, `langchain/mcp/adapter.py`, `langchain_anthropic/chat_models.py`, `langgraph/prebuilt/tool_node.py`
- `deepagents/graph.py`, `agents/tool.py`, `agents/tracing/processors.py`, `pydantic_ai/mcp.py`
- `ai/dist/index.d.ts`, `@mastra/core/LICENSE.md`

**Referencia de MoreContext**: Anthropic, dic. 2024 · *Building effective agents*: https://www.anthropic.com/engineering/building-effective-agents

**SIN CONFIRMAR** (pendiente de una búsqueda web cuando haya presupuesto)
- El incidente de LiteLLM de marzo de 2026: solo está confirmado que 1.82.7 y 1.82.8 no están en PyPI.
- El nombre comercial actual del despliegue de LangGraph en LangSmith.
- La fecha de la 1.0 de Microsoft Agent Framework y el estado oficial de AutoGen.
- Los cambios de Haystack 2 → 3.
- La ruta de resolución de modelos de Mastra.
- Qué parte de Agno AgentOS es de pago.
- El destino de `google.adk.models.anthropic_llm.Claude` (¿Vertex?).
- Los detalles de LlamaCloud.
- La ejecución real contra Claude y contra Ollama de todos los ejemplos.
