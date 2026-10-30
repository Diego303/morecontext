# Investigación 1A · Vanguardia en la plataforma Claude y en los estándares abiertos de agentes

> Fecha de corte: **29 de octubre de 2026**. Todas las afirmaciones llevan fuente primaria (lista completa en §5). Lo verificado ejecutando código lo marco con **[verificado]**: paquetes instalados en un venv propio (`anthropic` 2.3.0, `claude-agent-sdk` 0.2.174, `mcp` 2.3.0, `a2a-sdk` 1.3.0; `@anthropic-ai/sdk` 1.3.0, `@anthropic-ai/claude-agent-sdk` 0.3.312, `@modelcontextprotocol/server|client` 2.4.0) y comprobados con `inspect`, `tsc` o una ejecución en memoria. El shell no llega a `api.anthropic.com`, así que **nada se ha ejecutado contra la API real**: las peticiones se verificaron con un transporte simulado (cabeceras y cuerpo que envía el SDK).
>
> Límites de esta sesión: se agotó el presupuesto compartido de búsquedas web (200) antes de cubrir A2A y AGENTS.md. Sus webs (`a2a-protocol.org`, `agents.md`) no estaban en la lista de URLs permitidas. Lo que digo de A2A sale del paquete oficial `a2a-sdk` (su README, el `.proto` y sus constantes) y de la web de la AAIF. Lo que no pude confirmar va marcado **SIN CONFIRMAR**.

---

## 1. Resumen ejecutivo

1. **Nueva versión de la API: `anthropic-version: 2026-10-21`** (21 oct. 2026). Es la primera desde 2023-06-01 y rompe compatibilidad. Elimina `temperature`, `top_p` y `top_k`: si los envías, la API devuelve 400 en cualquier modelo. Con ella salen SDK mayores: Python `anthropic` 2.0.0, TypeScript `@anthropic-ai/sdk` 1.0.0, Go v2, Java 3, C# 13, PHP 1, Ruby 2 y CLI `ant` 2. Los SDK pasan a licencia Apache 2.0, envían la clave como `Authorization: Bearer` y tipan `MessageParam` como una unión por rol (`user`, `assistant`, `system`). **[verificado]**: el SDK 2.3.0 envía `anthropic-version: 2026-10-21` y `Authorization: Bearer …`, y `temperature=` lanza `TypeError`.
2. **Familia actual: Claude 5.5 + Fable 5.1.** IDs: `claude-opus-5-5` ($4/$20), `claude-sonnet-5-5` ($2/$10), `claude-haiku-5-5` (desde $0,10/$0,50) y `claude-fable-5-1` ($10/$50). También existe `claude-mythos-5-1`. Todos tienen 1M de contexto sin cabecera beta y 128k de salida. **La documentación recomienda empezar por Opus 5.5** y subir a Fable 5.1 si las evals no llegan. Sonnet 4.5 queda deprecado (retirada el 30 nov. 2026).
3. **El razonamiento es adaptativo y en varios modelos no se puede desactivar.** En Opus 5.5 y Fable 5.1, `thinking: {"type":"disabled"}` devuelve 400. Sonnet 5.5 introduce `{"type":"between_tools"}`. `budget_tokens` devuelve 400 en todos los modelos 5.x. El esfuerzo por defecto cambia según el modelo: Opus 5.5 y Haiku 5.5 usan `medium`, Sonnet 5.5 y Fable 5.1 usan `high`. Los bloques de razonamiento llegan vacíos por defecto (`display: "omitted"`); para leerlos pide `display: "summarized"`.
4. **Forzar herramienta con `tool_choice` `any` o `tool` devuelve 400** en Opus 5.5, Sonnet 5.5, Fable 5.1 y Mythos 5.1. Esto rompe un patrón que la web usa en varias lecciones: forzar `entregar` en el último paso.
5. **La gestión del contexto pasa al servidor.** Hay compactación en servidor (`compact_20260112`, beta), compactación bajo demanda (`compact-2026-09-04`, beta), limpieza de contexto (`clear_tool_uses_20250919`, `clear_thinking_20251015`), presupuestos de tarea (`output_config.task_budget`, beta) y **mensajes `role: "system"` a mitad de conversación** (GA en modelos 5.x), con los que cambias instrucciones, herramientas o esfuerzo sin invalidar la caché.
6. **Las herramientas del servidor maduran y casi todas son GA:** `web_search_20260318`, `web_fetch_20260318`, `code_execution_20260521`, la búsqueda de herramientas (`tool_search_tool_{regex,bm25}_20251119`), la llamada programática (`allowed_callers`) y la herramienta de memoria (`memory_20250818`). La herramienta *advisor* (`advisor_20260301`) sigue en beta. Las de uso del ordenador y del navegador pasan a «toolsets» de cliente GA: `computer_toolset_20260801` y `browser_toolset_20260801`.
7. **Pasan a GA la Files API y la Skills API** (19 ago. 2026), igual que el diagnóstico de caché (23 sep.) y el modo rápido de Opus 5.5 (`speed: "fast"`, 15 oct.). En prompt caching, la lectura cuesta ahora 0,05× en Opus 5.5 y Sonnet 5.5 y 0,025× en Fable 5.1. El mínimo cacheable baja a 512 tokens en los modelos actuales.
8. **Claude Managed Agents** (beta desde el 8 abr. 2026, cabecera `managed-agents-2026-04-01`) es el *harness* alojado de Anthropic. Se construye con agentes, entornos, sesiones y eventos, y suma *sandboxes* propios, memoria, *dreams*, despliegues programados, multiagente y *outcomes*. Precio: $0,08 por hora de sesión más tokens.
9. **Claude Agent SDK** (Python 0.2.174, TS 0.3.312) es Claude Code como biblioteca. API pública verificada: `query()`, `ClaudeSDKClient`, `ClaudeAgentOptions` (55 campos), `@tool` y `create_sdk_mcp_server`, hooks, `agents`, `skills`, sesiones con almacén propio y `task_budget`.
10. **Claude Code (v2.1.312) lee `AGENTS.md` de forma nativa** desde la v2.1.277, cuando no hay `CLAUDE.md`. Tiene 33 eventos de hook, cinco tipos de hook (`command`, `http`, `mcp_tool`, `prompt`, `agent`), *dynamic workflows* (orquestación con un script JS de hasta 1.000 agentes), `/goal`, equipos de agentes (experimental) y plugins con *marketplaces*, *evals* y *mods*. `--bare` es el modo recomendado para scripts y CI.
11. **MCP 2026-07-28: el protocolo pasa a ser sin estado.** Desaparecen el saludo `initialize`/`initialized` y la cabecera `Mcp-Session-Id`. Cada petición lleva versión y capacidades en `_meta`, y aparecen `server/discover`, MRTR (`input_required`) y `subscriptions/listen`. *Tasks* pasa a ser una extensión. Roots, Sampling, Logging, HTTP+SSE y el registro dinámico de clientes (DCR) quedan deprecados. **[verificado]**: el SDK de Python `mcp` 2.3.0 (`MCPServer`) habla `2026-07-28`, y el SDK de TypeScript v2 se divide en `@modelcontextprotocol/server` y `@modelcontextprotocol/client`, que sustituyen a `@modelcontextprotocol/sdk`.
12. **Gobernanza abierta: la Agentic AI Foundation (Linux Foundation)** aloja MCP, A2A, AGENTS.md, Agent Skills (donado por Anthropic el 22 oct. 2026), goose, agentgateway, Agent Router, Open Responses, OpenEnv y OpenSandbox.
13. **A2A 1.0** existe (paquete proto `lf.a2a.v1`, `PROTOCOL_VERSION_CURRENT = '1.0'`, cabecera `A2A-Version`, Agent Card en `/.well-known/agent-card.json`, *bindings* JSON-RPC, gRPC y HTTP+JSON). SDK `a2a-sdk` 1.0.0 (20 abr. 2026), hoy 1.3.0.
14. **Agent Skills** es un estándar abierto (agentskills.io). El frontmatter obligatorio son `name` y `description`; los opcionales, `license`, `compatibility`, `metadata` y `allowed-tools` (este último experimental). Según Anthropic lo usan más de 70 plataformas, entre ellas ChatGPT, Cursor, GitHub Copilot y VS Code.

---

## 2. Hallazgos por tema

### 2.1 API de Claude (estado a 29 oct. 2026)

#### 2.1.1 Modelos

| Modelo | ID API | Precio entrada/salida (por MTok) | Contexto / salida máx. | Razonamiento | Esfuerzo por defecto | Retirada no antes de |
|---|---|---|---|---|---|---|
| Claude Fable 5.1 | `claude-fable-5-1` | $10 / $50 | 1M / 128k | adaptativo, siempre activo | `high` | 1 sep. 2027 |
| Claude Opus 5.5 | `claude-opus-5-5` | $4 / $20 | 1M / 128k | adaptativo, siempre activo | `medium` | 22 sep. 2027 |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | $2 / $10 | 1M / 128k | adaptativo (`between_tools` para apagar el previo) | `high` | 28 sep. 2027 |
| Claude Haiku 5.5 | `claude-haiku-5-5` | $0,10 / $0,50 (≤100k de prompt); $0,50 / $2,50 (>100k) | 1M / 128k | adaptativo (se puede desactivar hasta `high`) | `medium` | 7 oct. 2027 |

- **Recomendación por defecto** (página de modelos): «If you're unsure which model to use, start with Claude Opus 5.5 for most workloads. Use Claude Fable 5.1 for demanding reasoning and long-horizon agentic work, or when your evals on Claude Opus 5.5 at higher effort still fall short.»
- Posicionamiento según la tabla oficial: Fable 5.1, «demanding reasoning and long-horizon agentic work»; Opus 5.5, «long-running agentic coding and knowledge work»; Sonnet 5.5, «best combination of speed and intelligence»; Haiku 5.5, «high-volume, latency-sensitive tasks such as classification, extraction, and routing».
- Fecha de corte de conocimiento fiable: junio de 2026 en los cuatro.
- Siguen activos: `claude-mythos-5-1`, `claude-fable-5`, `claude-mythos-5`, `claude-opus-5`, `claude-sonnet-5`, `claude-opus-4-8`, `claude-opus-4-7`, `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-opus-4-5-20251101` y `claude-haiku-4-5-20251001` (este último con retirada no antes del 15 oct. 2026, ya pasada, sin anuncio de deprecación).
- **Deprecados**: `claude-sonnet-4-5-20250929` (deprecado el 30 sep. 2026; retirada el **30 nov. 2026**; sustituto: `claude-sonnet-5-5`) y `claude-mythos-preview` (deprecado el 9 jun. 2026; la documentación pone retirada «To be announced», pero el SDK 2.3.0 la fija en «June 30th, 2026» en `DEPRECATED_MODELS`. **Hay discrepancia.**)
- **Retirados en 2026**: Opus 3 (5 ene.), Sonnet 3.7 y Haiku 3.5 (19 feb.), Haiku 3 (20 abr.), Sonnet 4 y Opus 4 (15 jun.), Opus 4.1 (5 ago.).
- Ritmo de lanzamientos: Fable 5 y Mythos 5 (9 jun.), Sonnet 5 (30 jun.), Opus 5 (24 jul.), Fable 5.1 y Mythos 5.1 (1 sep.), **Opus 5.5 (22 sep.)**, **Sonnet 5.5 (28 sep.)**, **Haiku 5.5 (7 oct.)**.
- Cambios incompatibles por modelo, según las notas de versión:
  - **Opus 5.5**: no se puede desactivar el razonamiento; `tool_choice` `any` y `tool` devuelven 400.
  - **Sonnet 5.5**: `between_tools` sustituye a `disabled`; forzar herramienta devuelve 400; `computer_20251124` ya no se acepta en la API de Claude; los bloques de razonamiento quedan ligados a la cuenta que los generó.
  - **Haiku 5.5**: `budget_tokens`, los parámetros de muestreo, el *prefill* y `computer_20250124` devuelven 400.
  - **Sonnet 5** (jun.): el tokenizador usa en torno a un 30 % más de tokens.
- Los modelos se pueden consultar por código: `GET /v1/models?lifecycle=active&lifecycle=deprecated&lifecycle=retired`. Cada entrada trae los campos `lifecycle`, `line` (familia) y `capabilities` (`thinking.types`, `server_tools`, `code_execution`…).
- **[verificado]** El `Literal` de modelos del SDK Python 2.3.0 incluye `claude-haiku-5-5`, `claude-sonnet-5-5`, `claude-fable-5-1`, `claude-opus-5-5`, `claude-mythos-5-1`, `claude-sonnet-5`, `claude-fable-5`, `claude-mythos-5`, `claude-opus-5`, `claude-opus-4-8`, `claude-opus-4-7`, `claude-mythos-preview`, `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5[-20251001]`, `claude-opus-4-5[-20251101]` y `claude-sonnet-4-5[-20250929]`.
- **SIN CONFIRMAR**: las condiciones de acceso a la línea Mythos. Las notas dicen «Claude Mythos Preview gated for Project Glasswing» (7 abr.) y «Access to Claude Fable 5 and Mythos 5 restored» (1 jul.), sin más detalle.

Fuentes: platform.claude.com/docs/models/overview · …/about-claude/model-deprecations · …/release-notes/overview · anthropic.com/claude-opus-5-5.

#### 2.1.2 Versión de API 2026-10-21 y SDK mayores

| Qué cambia | Detalle |
|---|---|
| Cabecera | `anthropic-version: 2026-10-21`. Los SDK anteriores enviaban `2023-06-01`; los nuevos mayores envían `2026-10-21`. |
| Mensajes | `temperature`, `top_p` y `top_k` **eliminados**: 400 aunque lleven el valor por defecto. Un bloque `document` directamente en un mensaje `assistant` da 400. Un bloque `text` con `citations` no vacías en un mensaje `user` (también dentro de `search_result`) da 400. |
| Versiones de SDK que estrenan 2026-10-21 | Python `anthropic` **2.0.0**; TS `@anthropic-ai/sdk` **1.0.0** (y los paquetes `bedrock-sdk`, `vertex-sdk`, `foundry-sdk`, `aws-sdk` y `google-cloud-sdk` en v1); C# 13.0.0; Go `anthropic-sdk-go/v2`; Java 3.0.0; PHP 1.0.0; Ruby 2.0.0; CLI `ant` 2.0.0 (`go install …/anthropic-cli/v2/cmd/ant@latest`). |
| Autenticación | La clave viaja como `Authorization: Bearer <key>` en lugar de `X-Api-Key` (la API acepta ambas). Un cliente admite **una sola credencial**: pasar `api_key` y `auth_token` a la vez lanza error. |
| Tipos | `MessageParam` es la unión `UserMessageParam | AssistantMessageParam | SystemMessageParam`. En Python ya no se puede llamar a `MessageParam(...)`; escribe el mensaje como dict. |
| Eliminado en los SDK | Text Completions (TS, Go, Java, Ruby, CLI). Compactación en cliente (`compactionControl` / `compaction_control`) en el *tool runner* de TS y Ruby: se sustituye por `context_management.edits: [{type: "compact_20260112", …}]`. Python ya la quitó en la v1.0. |
| Bedrock | 2026-10-21 solo con modelos Claude 4.7 o posteriores. |

- Fechas (PyPI/npm): `anthropic` 1.0.0 el 20 ago. 2026 (sustituye `httpx` por `httpx2` y exige Python 3.10 o superior); 2.0.0 el 21 oct.; 2.3.0 el 23 oct. `@anthropic-ai/sdk` 1.0.0 el 21 oct.; 1.3.0 el 23 oct.
- **[verificado]** Con `anthropic==2.3.0` y un `httpx2.MockTransport`, el SDK envía `{'authorization': 'Bearer sk-test', 'anthropic-version': '2026-10-21'}`, y `client.messages.create(..., temperature=0.2)` lanza `TypeError: Messages.create() got an unexpected keyword argument 'temperature'`. `@anthropic-ai/sdk` 1.3.0 tampoco tiene `temperature` en sus tipos.

Fuentes: platform.claude.com/docs/en/api/versioning · …/api/migration-2026-10-21 · release notes (21 oct.).

#### 2.1.3 Parámetros de `messages.create` (SDK Python 2.3.0, **[verificado]** con `inspect.signature`)

`max_tokens, messages, model, cache_control, container, diagnostics, inference_geo, metadata, output_config, service_tier, speed, stop_sequences, stream, system, thinking, tool_choice, tools, user_profile_id, workspace_id` (más `extra_headers`, `extra_query`, `extra_body` y `timeout`).

| Parámetro | Qué es | Estado |
|---|---|---|
| `cache_control` (nivel superior) | Caché automática: `{"type":"ephemeral"}` (opcionalmente con `"ttl":"1h"`). Coloca un punto de corte en el último bloque cacheable y lo va moviendo según crece la conversación. | GA (desde el 19 feb. 2026) |
| `container` | ID de un contenedor de ejecución de código que quieres reutilizar (vale 30 días; se guarda un punto de control tras unos 5 min de inactividad). Con Skills: `{"skills":[{"type":"anthropic"|"custom","skill_id":…,"version":…}]}`. | GA |
| `diagnostics` | Diagnóstico de caché: `{"previous_message_id": null | "msg_…"}`. La respuesta trae `diagnostics.cache_miss_reason.type` ∈ `model_changed`, `system_changed`, `tools_changed`, `messages_changed`, `previous_message_not_found` o `unavailable`, más `cache_missed_input_tokens`. | GA (23 sep. 2026; la cabecera `cache-diagnosis-2026-04-07` ya no hace falta) |
| `inference_geo` | Residencia de datos: `"global"` (por defecto) o `"us"` (multiplica todo por 1,1). Solo modelos lanzados después del 1 feb. 2026; con modelos anteriores, 400. | GA |
| `output_config` | `{"effort": …, "format": {"type":"json_schema","schema":…}}`. En beta añade `task_budget`. | GA |
| `service_tier` | Prioridad (Priority Tier). | GA |
| `speed` | `"fast"` = modo rápido (hasta 2,5× más tokens de salida por segundo, a precio *premium*). Opus 5.5 sin cabecera; Opus 5 y Opus 4.8 con `fast-mode-2026-02-01`. No funciona con Batch. | GA para Opus 5.5 (15 oct. 2026) |
| `user_profile_id` | Asocia la petición a un perfil de usuario final (`/v1/user_profiles`, IDs `uprof_…`). Pensado para plataformas que revenden a usuarios finales; trae campos de cumplimiento (`enforcement_status`). | Endpoints en beta (lanzados el 20 oct. 2026) |
| `workspace_id` | Espacio de trabajo de destino. La respuesta trae la cabecera `anthropic-workspace-id`. | GA |

En `client.beta.messages.create` y `tool_runner` hay además `context_management`, `mcp_servers`, `fallbacks`, `fallback_credit_token`, `thread` y `betas` **[verificado]**.

#### 2.1.4 Razonamiento (`thinking`) y esfuerzo (`effort`)

- Formas: `{"type":"adaptive","display":"summarized"|"omitted"|"updates"}`, `{"type":"enabled","budget_tokens":N}`, `{"type":"disabled"}` y `{"type":"between_tools"}` (solo Sonnet 5.5, hasta esfuerzo `high`, sin más campos).
- **Comportamiento en los modelos 5.x** (Opus 5.5, Sonnet 5.5, Haiku 5.5, Fable 5.1, Mythos 5.1, Fable 5, Mythos 5, Opus 5, Sonnet 5): sin campo `thinking` el razonamiento es adaptativo; `enabled` con `budget_tokens` devuelve **400**.
  - `disabled` da 400 en Fable, Mythos y Opus 5.5.
  - En Sonnet 5.5, `disabled` da 400; usa `between_tools`.
  - En Opus 5 y Haiku 5.5, `disabled` se acepta hasta `high`; en `xhigh` y `max`, 400.
  - En Sonnet 5, `disabled` se acepta.
- `display` por defecto es `"omitted"` en todos los modelos 4.7 y posteriores: el campo `thinking` llega vacío y solo queda `signature`. `"updates"` es beta (cabecera `thinking-display-updates-2026-08-18`) y devuelve avisos de progreso entre herramientas.
- El razonamiento intercalado entre llamadas a herramientas es automático con el modo adaptativo. **Devuelve los bloques `thinking` y `redacted_thinking` sin tocar** dentro de un turno con herramientas.
- `output_config.effort` ∈ `low`, `medium`, `high`, `xhigh`, `max`. GA, sin cabecera.
  - Valores por defecto: `medium` en Opus 5.5 y Haiku 5.5; `high` en el resto.
  - `xhigh` funciona en Fable 5.1, Mythos 5.1, Fable 5, Mythos 5, Opus 5.5, Opus 5, Opus 4.8, Opus 4.7, Sonnet 5.5, Sonnet 5 y Haiku 5.5. `max` funciona además en Mythos Preview, Opus 4.6 y Sonnet 4.6.
  - Sonnet 4.5 y Haiku 4.5 no aceptan `effort`.
  - Con `xhigh` o `max`, la documentación recomienda `max_tokens` de al menos 64k.
- **Esfuerzo por mensaje** (beta `mid-conversation-output-config-2026-07-01`): añade `{"role":"system","content":[],"output_config":{"effort":"low"}}`. Así no reinicias la caché, que sí se reinicia si cambias el `effort` de nivel superior.
- `tool_choice` forzado (`any` o `tool`) devuelve 400 en Opus 5.5, Sonnet 5.5, Fable 5.1 y Mythos 5.1. Con `enabled` y `budget_tokens`, solo se admiten `auto` y `none`.

Fuentes: …/build-with-claude/thinking · …/build-with-claude/effort.

#### 2.1.5 Salidas estructuradas

- `output_config={"format":{"type":"json_schema","schema":{…}}}` para respuestas JSON, y `"strict": true` en la definición de una herramienta. GA en todos los modelos y apto para HIPAA. **No disponible en Managed Agents.**
- `output_format` (el parámetro antiguo) está deprecado: solo funciona con la cabecera `structured-outputs-2025-11-13`. En Python 1.0 y posteriores, pasar `output_format={…}` a `client.beta.messages.create()` lanza `TypeError`.
- Admite: `enum`, `const`, `anyOf`, `allOf` (sin `$ref`), `$ref` interno, `default`, formatos de cadena (`date-time`, `email`, `uri`, `uuid`…) y `minItems` 0 o 1.
- No admite: esquemas recursivos, `minimum` o `maximum`, `minLength` o `maxLength`, `additionalProperties` distinto de `false` ni `$ref` externo. Las expresiones regulares no admiten *lookahead* ni `\b`.
- Incompatibilidades: con `citations` activas devuelve 400; con *prefill* tampoco funciona.
- Ayudas del SDK: `client.messages.parse(..., output_format=PydanticModel)` → `.parsed_output` (**[verificado]**, el parámetro existe en 2.3.0) y `anthropic.transform_schema()`.

#### 2.1.6 Prompt caching

- `cache_control: {"type":"ephemeral"}` o `{"type":"ephemeral","ttl":"1h"}`. **Hasta 4 puntos de corte; la caché automática ocupa uno.** Cada punto de corte mira como mucho **20 posiciones** hacia atrás (los `tool_use` consecutivos cuentan como una, igual que los `tool_result` consecutivos).
- Escribir en caché cuesta 1,25× (5 min) o 2× (1 h) el precio de entrada. **Leer cuesta 0,1× en general, 0,05× en Opus 5.5 y Sonnet 5.5 y 0,025× en Fable 5.1 y Mythos 5.1.**
- **Mínimo cacheable**: 512 tokens en Fable 5.1, Mythos 5.1, Opus 5.5, Opus 5, Sonnet 5.5, Fable 5, Mythos 5 y Haiku 5.5. 1.024 en Opus 4.8, Sonnet 5 y Sonnet 4.6. 2.048 en Opus 4.7. 4.096 en Opus 4.6, Opus 4.5 y Haiku 4.5.
- Orden del prefijo: `tools` → `system` → `messages`. Cambiar las herramientas invalida toda la caché; cambiar `tool_choice` o añadir imágenes solo invalida la parte de `messages`.
- `usage`: `cache_creation_input_tokens`, `cache_read_input_tokens`, `input_tokens` (lo que queda después del último punto de corte) y `cache_creation.{ephemeral_5m_input_tokens, ephemeral_1h_input_tokens}`.
- **Precalentar la caché**: `max_tokens: 0` escribe la caché sin generar nada. No funciona con `stream`, razonamiento manual, salidas estructuradas, `tool_choice` forzado ni Batch.
- Las herramientas con `defer_loading: true` no forman parte del prefijo, así que añadirlas no rompe la caché.

#### 2.1.7 Herramientas que proporciona Anthropic (tabla oficial, «Tool reference»)

| Herramienta | `type` vigentes | Dónde se ejecuta | Cabecera beta |
|---|---|---|---|
| Búsqueda web | `web_search_20260318`, `web_search_20260209`, `web_search_20250305` | Servidor | Ninguna |
| *Web fetch* | `web_fetch_20260318`, `web_fetch_20260309`, `web_fetch_20260209`, `web_fetch_20250910` | Servidor | Ninguna |
| Ejecución de código | `code_execution_20260521`, `code_execution_20260120`, `code_execution_20250825` | Servidor | Ninguna |
| *Advisor* | `advisor_20260301` | Servidor | `advisor-tool-2026-03-01` |
| Búsqueda de herramientas | `tool_search_tool_regex_20251119`, `tool_search_tool_bm25_20251119` (alias sin fecha: `tool_search_tool_regex` y `tool_search_tool_bm25`) | Servidor | Ninguna |
| Conector MCP | `mcp_toolset` | Servidor | `mcp-client-2025-11-20` (más reciente: `mcp-client-2026-09-15`) |
| Memoria | `memory_20250818` | Cliente | Ninguna |
| Bash | `bash_20250124` | Cliente | Ninguna |
| Editor de texto | `text_editor_20250728` (Claude 4 y posteriores), `text_editor_20250124` | Cliente | Ninguna |
| Uso del ordenador | `computer_toolset_20260801` (GA desde el 19 ago.), `computer_20251124`, `computer_20250124` | Cliente | Ninguna / `computer-use-2025-11-24` / `computer-use-2025-01-24` |
| Uso del navegador | `browser_toolset_20260801` | Cliente | Ninguna |

Detalles que cambian cómo se construye:

- **Versiones con «filtrado dinámico» (`_20260209` y posteriores) de búsqueda y *fetch* web.** Claude escribe código que filtra los resultados antes de que entren en el contexto. El valor por defecto es `allowed_callers: ["code_execution_20260120"]`; para llamada directa, pon `["direct"]`. Con filtrado no son aptas para ZDR. Con `_20260209` y posteriores la ejecución de código es gratuita. `response_inclusion: "excluded"` (solo `_20260318`) descarta los bloques de búsqueda ya consumidos. La búsqueda cuesta $10 por cada 1.000; el *fetch*, solo tokens. Para reutilizar resultados, devuelve `encrypted_content` y `encrypted_index` sin modificar.
- **Ejecución de código.** Python 3.11, 5 GiB de RAM, 5 GiB de disco, 1 CPU y sin internet. `20260120` añade estado REPL persistente y llamada programática. `20260521` declara el límite de 90 s por celda. Los ficheros de salida van a `$OUTPUT_DIR`, vuelven como `file_id` y se descargan con `client.files.download()`. Fuera del caso gratuito: 1.550 h gratis al mes por organización y luego $0,05 por hora y contenedor.
- **`pause_turn`.** Cuando un bucle de herramientas del servidor llega a su límite (10 iteraciones por defecto), reenvía el contenido del asistente con **las mismas `tools`**.
- **Propiedades válidas en cualquier herramienta**: `cache_control`, `strict`, `defer_loading`, `allowed_callers` (`"direct"`, `"code_execution_20260120"`), `input_examples` (no en las de servidor) y `eager_input_streaming` (solo herramientas definidas por ti; sustituye a la cabecera `fine-grained-tool-streaming-2025-05-14`). **La documentación avisa de que `allowed_callers` no es una barrera de seguridad.**
- **Búsqueda de herramientas.** Marca herramientas con `defer_loading: true` (hasta 10.000 por petición). La búsqueda devuelve `tool_reference` (5 por defecto; `limit` admite de 1 a 10.000). La herramienta de búsqueda nunca puede ser diferida. Recomendación oficial: deja sin diferir las 3–5 herramientas que más se usan. Puedes implementar tu propia búsqueda devolviendo bloques `tool_reference` en un `tool_result`.
- **Llamada programática.** La herramienta se expone como función async de Python dentro del contenedor. El `tool_use` trae `caller: {"type":"code_execution_20260120","tool_id":"srvtoolu_…"}`. Respondes con un mensaje `user` que lleve **solo** `tool_result` (sin texto), el `container` y las mismas `tools`. Cada llamada pendiente expira en unos 4 min. No es compatible con `strict`, `disable_parallel_tool_use`, herramientas MCP ni los *toolsets* de ordenador o navegador. No es apta para ZDR. No funciona en Haiku 4.5.
- **Advisor (beta).** Un modelo ejecutor más barato consulta a un modelo asesor más capaz en mitad de la generación: `{"type":"advisor_20260301","name":"advisor","model":"claude-opus-5-5","max_uses":…,"max_tokens":≥1024,"caching":{…}}`. El asesor debe ser Sonnet 4.6 o superior y al menos tan capaz como el ejecutor. Se factura a la tarifa del asesor, desglosado en `usage.iterations[]`. Los asesores 5.5 devuelven `advisor_redacted_result` (cifrado).
- **Memoria.** `{"type":"memory_20250818","name":"memory"}` con los comandos `view`, `create`, `str_replace`, `insert`, `delete` y `rename` sobre `/memories`. Tu aplicación decide dónde se guarda. Ayudas: `BetaAbstractMemoryTool` y `BetaLocalFilesystemMemoryTool` (Python, `anthropic.tools`). La documentación insiste en validar rutas contra el *path traversal*.
- **Toolsets de cliente** (ordenador y navegador). Una sola entrada en `tools` sin `name`, con `configs` por miembro (`enabled`, `defer_loading`). El `tool_use` trae `toolset_name` (`computer` o `browser`). No admiten `strict`, `input_examples` ni `tool_choice` de tipo `tool`. Hay clases de ayuda en los SDK (beta, 7 oct.).

#### 2.1.8 Contexto: compactación, limpieza de contexto, presupuestos y mensajes `system`

- **Compactación en servidor** (beta `compact-2026-01-12`): `context_management={"edits":[{"type":"compact_20260112","trigger":{"type":"input_tokens","value":150000},"pause_after_compaction":False,"instructions":None}]}`. El umbral mínimo es 50.000 y el valor por defecto 150.000. La respuesta empieza con un bloque `{"type":"compaction","content":"…"}`, que **debes reenviar**: la API ignora todo lo anterior a él. Con `pause_after_compaction`, `stop_reason="compaction"` (solo existe en `BetaStopReason` **[verificado]**). No funciona en Haiku 4.5, Opus 4.5 ni Sonnet 4.5. Existe además compactación bajo demanda (beta `compact-2026-09-04`, 14 sep.); **SIN CONFIRMAR** su forma exacta, porque no leí esa página.
- **Limpieza de contexto** (beta `context-management-2025-06-27`): `clear_tool_uses_20250919` (`trigger` en `input_tokens` o `tool_uses`, `keep`, `clear_at_least`, `exclude_tools`, `clear_tool_inputs`) y `clear_thinking_20251015` (`keep: {type:"thinking_turns",value:N}` o `"all"`; debe ir primero en la lista). La respuesta trae `context_management.applied_edits`.
- **Presupuesto de tarea** (beta `task-budgets-2026-03-13`): `output_config={"task_budget":{"type":"tokens","total":64000,"remaining":…}}` con un mínimo de 20.000. Es **orientativo**: el modelo ve una cuenta atrás, pero nada lo corta; para un tope duro usa `max_tokens`. Funciona en Fable 5.1, Mythos 5.1, Opus 5.5, Opus 5, Fable 5, Mythos 5, Sonnet 5.5, Haiku 5.5, Opus 4.8 y 4.7. No funciona en Sonnet 5, Opus 4.6, Sonnet 4.6 ni en Claude Code. Sustituye a las etiquetas `<budget:token_budget>` que se inyectaban automáticamente, que siguen solo en Sonnet 5, Sonnet 4.6, Sonnet 4.5 y Haiku 4.5.
- **Mensajes `system` a mitad de conversación** (GA sin cabecera en Fable 5.1, Mythos 5.1, Fable 5, Mythos 5, Mythos Preview, Opus 5.5, Opus 5, Opus 4.8, Sonnet 5.5 y Haiku 5.5; **no en Sonnet 5**): `{"role":"system","content":"…"}` en `messages`.
  - Tiene prioridad sobre el `system` de nivel superior en los turnos siguientes y **no invalida la caché**.
  - Debe ir justo después de un turno `user` y ser el último elemento o ir seguido de un `assistant`. Entre un `tool_use` y su `tool_result` da 400.
  - **Mensajes de un solo turno** (beta `mid-conversation-system-clear-at-2026-08-21`): `clear_at: "next_user_message"`.
  - **Cambios de herramientas a mitad de conversación** (beta `inline-tools-2026-09-15` y `mid-conversation-tool-changes-2026-07-01`): bloques `tool_addition` y `tool_removal` con `tool_reference`, `tool_definition`, `mcp_tool_reference` o `mcp_toolset_reference`. Límites: 10.000 herramientas diferidas y 4 MB de definiciones.
  - Para Managed Agents, el equivalente es el evento `system.message`.
- **Ventana de contexto**: 1M por defecto, sin cabecera, en todos los modelos desde la 4.6 (la beta `context-1m-2025-08-07` se retiró el 30 abr.). Sonnet 4.5 se queda en 200k. Desde Claude 4.5, si `input + max_tokens` supera la ventana la API acepta la petición y corta con `stop_reason: "model_context_window_exceeded"`. Hasta 600 imágenes o páginas PDF por petición. **Tamaño máximo de petición: 128 MB** (desde el 28 oct. 2026; antes 32 MB).
- **Precio de contexto largo**: tarifa estándar en todo el 1M, salvo Haiku 5.5, que cobra más por encima de 100k tokens de prompt.

#### 2.1.9 Files, Skills, Batch, conteo de tokens, *streaming*, citas

- **Files API: GA** (19 ago. 2026; la cabecera `files-api-2025-04-14` ya no hace falta).
  - Métodos: `client.files.upload/list/retrieve_metadata/download/delete`.
  - Bloques: `{"type":"document","source":{"type":"file","file_id":…}}`, `image` con `source.file` y `container_upload` (para ejecución de código).
  - Límites: 500 MB por fichero, 1 TB por organización, `expires_in_seconds` entre 3.600 y 7.776.000.
  - Solo se pueden descargar los ficheros generados por herramientas.
  - No apta para ZDR. **No aceptes `file_id` que vengan del usuario final** (los ficheros son del *workspace*, no del usuario).
- **Skills API: GA** (19 ago.; `skills-2025-10-02` ya no hace falta).
  - Uso: `container={"skills":[{"type":"anthropic","skill_id":"pptx","version":"latest"}]}` junto con la herramienta de ejecución de código.
  - Hasta 20 *skills* por petición; subida de hasta 30 MB.
  - Las predefinidas son `pptx`, `xlsx`, `docx` y `pdf`. Las propias usan IDs `skill_…` y versiones `skver_…`.
  - Métodos: `client.skills.create/list/retrieve/delete` y `client.skills.versions.create`.
  - Fuera de Claude Code solo se aceptan en el frontmatter `name`, `description`, `license`, `compatibility`, `metadata` y `allowed-tools`.
  - No apta para ZDR. El contenedor no tiene red ni permite instalar paquetes.
- **Batch**: 50 % de descuento (acumulable con la caché). Hasta 100.000 peticiones o 256 MB por lote; resultados en 24 h como máximo, disponibles 29 días.
  - No admite `stream`, `speed`, `fallbacks` ni `max_tokens: 0`.
  - Beta `output-300k-2026-03-24`: hasta 300k tokens de salida en lotes.
  - Las herramientas del servidor y los servidores MCP sí funcionan en lotes.
- **Conteo de tokens**: `client.messages.count_tokens(model=…, messages=…)` → `.input_tokens` (**[verificado]**; admite además `cache_control`, `output_config`, `speed`, `system`, `thinking`, `tool_choice` y `tools`).
- ***Streaming* de herramientas**: `eager_input_streaming: true` por herramienta (GA en todos los modelos). El JSON puede llegar incompleto o inválido; devuélvelo con `is_error: true` y la clave `{"INVALID_JSON": …}`.
- **Citas y resultados de búsqueda**: siguen igual en la petición (`"citations": {"enabled": true}`), con una novedad en 2026-10-21: no se pueden enviar `citations` dentro de bloques `text` de mensajes `user`. **SIN CONFIRMAR** otros cambios: no leí esas páginas.

#### 2.1.10 Rechazos, *fallbacks* y motivos de parada

- `stop_reason` (GA, **[verificado]** en `anthropic.types.StopReason`): `end_turn`, `max_tokens`, `stop_sequence`, `tool_use`, `pause_turn`, `refusal`, `model_context_window_exceeded`. En beta se añade `compaction`.
- Los modelos con clasificadores (Fable 5.1, Fable 5, Opus 5.5, Opus 5, Sonnet 5.5 y Haiku 5.5) devuelven `stop_reason: "refusal"` con HTTP 200 y `stop_details.category` ∈ `cyber`, `bio`, `frontier_llm`, `reasoning_extraction`, `general_harms` o `null`. Un rechazo sin salida **se factura** si la categoría es `bio`, `frontier_llm` o `reasoning_extraction` (desde el 24 sep. 2026).
- ***Fallback* en servidor** (beta `server-side-fallback-2026-07-01`): `fallbacks: "default"` o una lista de hasta 3 `[{"model":"claude-opus-4-8"}]`. La respuesta inserta un bloque `{"type":"fallback","from":…,"to":…,"trigger":{"type":"refusal","category":…}}` y desglosa el uso en `usage.iterations`. Haiku 5.5 no tiene *fallback* en servidor. En el cliente: `BetaRefusalFallbackMiddleware` del SDK (`anthropic.lib.middleware`, **[verificado]**, se aplica con `client.with_middleware(...)`).
- La documentación recomienda no pedir el razonamiento paso a paso en la salida (dispara rechazos `reasoning_extraction`): pide explicaciones breves o lee el `thinking` con `display: "summarized"`.

#### 2.1.11 Mapa de recursos del SDK (Python 2.3.0, **[verificado]**)

- `client.*`: `messages` (`create`, `stream`, `parse`, `count_tokens`, `batches`), `models`, `files`, `skills`, `user_profiles`, `organization` (Admin API, GA en SDK desde el 30 sep.), `middleware` y `with_middleware()`, y `open_telemetry` (opción del cliente; exportación OpenTelemetry en beta desde el 14 oct.).
- `client.beta.*`: `messages` (con `tool_runner` y `thread`), `models`, `files`, `skills`, `user_profiles`, `webhooks` (webhooks de organización, beta `webhooks-2026-10-07`), `tunnels` (túneles MCP para servidores privados, `/v1/tunnels`, `mcp-tunnels-2026-06-22`) y los recursos de **Managed Agents**: `agents`, `environments`, `sessions`, `deployments`, `deployment_runs`, `memory_stores`, `vaults` y `dreams`.
- Otras novedades de plataforma de jul.–oct.: Claude Platform on AWS (11 may.); Claude Models on Google Cloud gestionado por Anthropic (22 oct.); claves de API con caducidad (8 jul.); claves personales y de cuenta de servicio (27 ago.); *Workbench* pasa a llamarse *playground* (18 ago.); API de analítica de uso y coste (beta, 29 oct.); *inference hooks* para Enterprise (GA el 20 oct.); API Claude Tag (beta Enterprise, 23 oct.).

#### 2.1.12 Ejemplo mínimo verificado (API, Python)

```python
# anthropic==2.3.0 · verificado con httpx2.MockTransport: cabeceras y cuerpo
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()  # ANTHROPIC_API_KEY → Authorization: Bearer; anthropic-version: 2026-10-21

resp = client.messages.create(
    model=MODEL,
    max_tokens=16000,
    system="Eres un asistente…",
    thinking={"type": "adaptive"},            # en Sonnet 5.5 no hay "disabled"; usa {"type": "between_tools"}
    output_config={"effort": "medium"},       # por defecto en Sonnet 5.5: "high"
    cache_control={"type": "ephemeral"},      # caché automática
    tools=[{
        "name": "buscar_docs", "description": "Busca en la documentación interna.", "strict": True,
        "input_schema": {"type": "object", "properties": {"q": {"type": "string"}},
                         "required": ["q"], "additionalProperties": False},
    }],
    messages=[{"role": "user", "content": "Hola"}],
)
print(resp.stop_reason, resp.usage.cache_read_input_tokens)
```

El ejemplo equivalente en TypeScript (`@anthropic-ai/sdk` 1.3.0) compila con `tsc --strict` **[verificado]**: `import Anthropic from "@anthropic-ai/sdk"`, `client.messages.create({...thinking:{type:"adaptive"}, output_config:{effort:"medium"}})` y `client.messages.countTokens(...)`.

---

### 2.2 Claude Agent SDK

**Qué es.** Claude Code como biblioteca: el mismo bucle, las mismas herramientas integradas, la misma gestión de contexto, hooks, subagentes, MCP, permisos, sesiones, *skills*, comandos, memoria (`CLAUDE.md`) y plugins. Solo existe para Python y TypeScript. Desde otros lenguajes se usa `claude -p --output-format json`.

**Versiones (registros, 29 oct. 2026):**
- Python `claude-agent-sdk` **0.2.174** (24 oct. 2026). Incluye el CLI de Claude Code **2.1.310** (`_cli_version.py`; **[verificado]** con `_bundled/claude --version`).
- TypeScript `@anthropic-ai/claude-agent-sdk` **0.3.312** (27 oct. 2026). Requiere Node 18.14 o superior. Sus *exports* son `.`, `./core`, `./browser`, `./bridge` y `./sdk-tools`.
- Licencia: Commercial Terms de Anthropic. **No se permite ofrecer el inicio de sesión de claude.ai ni sus límites en productos de terceros**; se autentica con clave de API, Bedrock, Vertex o Foundry. Hay reglas de marca: se admite «Claude Agent» o «{TuAgente} Powered by Claude»; no se admite «Claude Code».

**Cuándo usar cada producto** (tabla oficial):
- Agent SDK: el bucle corre en tu proceso.
- CLI: uso interactivo.
- Client SDK: tú implementas el bucle.
- Managed Agents: API REST alojada en la que Anthropic ejecuta el agente y el *sandbox*.

**API pública verificada (Python 0.2.174, `inspect`):**
- `query(*, prompt: str | AsyncIterable[dict], options: ClaudeAgentOptions | None = None, transport=None) -> AsyncIterator[UserMessage | AssistantMessage | SystemMessage | ResultMessage | StreamEvent | RateLimitEvent | ConversationResetMessage]`.
- `ClaudeSDKClient(options=None, transport=None)` con los métodos `connect`, `disconnect`, `query`, `receive_messages`, `receive_response`, `interrupt`, `set_model`, `set_permission_mode`, `get_context_usage`, `get_mcp_status`, `get_server_info`, `reconnect_mcp_server`, `toggle_mcp_server`, `rewind_files` y `stop_task`.
- `@tool(name, description, input_schema: type | dict, annotations=None)` y `create_sdk_mcp_server(name, version="1.0.0", tools=[...]) -> McpSdkServerConfig`. Es un servidor MCP en proceso; sus herramientas se nombran `mcp__<servidor>__<herramienta>`.
- **Campos de `ClaudeAgentOptions`**: `tools`, `allowed_tools`, `system_prompt`, `mcp_servers`, `strict_mcp_config`, `permission_mode`, `continue_conversation`, `resume`, `session_id`, `max_turns`, `max_budget_usd`, `disallowed_tools`, `model`, `fallback_model`, `betas`, `permission_prompt_tool_name`, `cwd`, `cli_path`, `settings`, `add_dirs`, `env`, `extra_args`, `max_buffer_size`, `debug_stderr` (deprecado), `stderr`, `can_use_tool`, `hooks`, `user`, `include_partial_messages`, `include_hook_events`, `forward_subagent_text`, `verbatim_prompts`, `fork_session`, `resume_session_at`, `resume_drops_turn`, `agents`, `setting_sources`, `skills`, `sandbox`, `plugins`, `max_thinking_tokens`, `thinking`, `effort`, `output_format`, `enable_file_checkpointing`, `session_store`, `session_store_flush`, `load_timeout_ms` y `task_budget`.
- **Matices que importan**:
  - `system_prompt`: con `None`, el CLI usa su valor por defecto. Las formas posibles son `{"type":"preset","preset":"claude_code","append":…,"exclude_dynamic_sections":bool,"snapshot":bool}`, `{"type":"custom","prompt":…}` y `{"type":"file","path":…}`.
  - `tools`: `list[str]`, `[]` para desactivar todas las integradas, o `{"type":"preset","preset":"claude_code"}`.
  - `allowed_tools` aprueba sin preguntar; **no limita** qué herramientas existen (eso lo hace `tools` o `disallowed_tools`).
  - `setting_sources`: con `None` **se cargan todas las fuentes** (user, project, local), igual que el CLI. Con `[]` queda aislado. Hace falta `"project"` para cargar `CLAUDE.md`.
  - `skills`: `None` (lo que haga el CLI por defecto), `"all"` o una lista de nombres. Es un filtro de contexto, **no un *sandbox***.
  - `permission_mode` ∈ `default`, `acceptEdits`, `plan`, `bypassPermissions`, `dontAsk`, `auto` (un clasificador aprueba o rechaza cada llamada).
  - `can_use_tool(tool_name, input, ToolPermissionContext) -> PermissionResultAllow(updated_input, updated_permissions) | PermissionResultDeny(message, interrupt)`. **Solo se invoca cuando las reglas dan «ask».** No se llama para lo que ya permiten `allowed_tools`, el modo o las reglas `allow`. Para vigilar todas las llamadas, usa un hook `PreToolUse`.
  - `hooks: dict[HookEvent, list[HookMatcher(matcher, hooks, timeout)]]`. El callback recibe `(input_data, tool_use_id, context)` y devuelve el JSON de salida (`hookSpecificOutput` con `permissionDecision`…). Los *matchers* de un mismo evento se ejecutan **en paralelo**.
  - El `HookEvent` de Python enumera 10 eventos: `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `PreCompact`, `Notification`, `SubagentStart` y `PermissionRequest`. El de TypeScript, `HOOK_EVENTS`, enumera **33**, los mismos que Claude Code (§2.3).
  - `agents: dict[str, AgentDefinition]`. Campos de `AgentDefinition`, en camelCase como en el CLI: `description`, `prompt`, `tools`, `disallowedTools`, `model`, `skills`, `memory`, `mcpServers`, `initialPrompt`, `maxTurns`, `background`, `effort` y `permissionMode`.
  - Sesiones: `resume`, `fork_session`, `resume_session_at`, y las funciones `list_sessions`, `get_session_info`, `get_session_messages`, `fork_session`, `rename_session`, `tag_session`, `delete_session`, `list_subagents` y `get_subagent_messages`. Para persistencia externa: `SessionStore`, `InMemorySessionStore`, las variantes `*_from_store` e `import_session_to_store`.
  - `ResultMessage`: `subtype`, `duration_ms`, `num_turns`, `session_id`, `stop_reason`, `total_cost_usd`, `usage`, `result`, `structured_output`, `model_usage`, `permission_denials`, `errors`, `terminal_reason`…
  - `verbatim_prompts=True` evita que un `@/ruta` dentro de un texto ajeno (por ejemplo, resultados de herramientas) haga leer ficheros locales. Requiere el CLI 2.1.248 o posterior. Es una defensa contra inyección.
- **TypeScript (0.3.312)**:
  - `query({prompt, options})`, con opciones en camelCase: `systemPrompt`, `allowedTools`, `permissionMode`, `mcpServers`, `hooks`, `canUseTool`, `agents`, `settingSources`, `maxTurns`, `effort`…
  - `tool(name, description, zodRawShape, handler, extras?)` y `createSdkMcpServer({name, version, tools})`.
  - Funciones de sesión equivalentes, `HOOK_EVENTS` y `BUILTIN_TOOL_NAMES`, que incluye `Agent`, `Bash`, `Edit`, `Glob`, `Grep`, `Read`, `Write`, `WebFetch`, `WebSearch`, `Skill`, `ToolSearch`, `Monitor`, `Workflow`, `TaskCreate/Get/List/Update/Stop`, `SendMessage`, `EnterWorktree`, `CronCreate`…
  - La «V2 session API» de TS aparece como **retirada** en el índice de la documentación.

**Ejemplo mínimo verificado (Python).** Se importa y construye sin errores; el *handler*, el hook y el callback de permisos se ejecutaron en local; **no se llamó a la API**. Fichero: `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-1a/ejemplos/agente_sdk.py`.

```python
import asyncio
from typing import Any
from claude_agent_sdk import (AgentDefinition, AssistantMessage, ClaudeAgentOptions, HookMatcher,
    PermissionResultAllow, PermissionResultDeny, ResultMessage, TextBlock, ToolPermissionContext,
    create_sdk_mcp_server, query, tool)

MODEL = "claude-sonnet-5-5"

@tool("contar_palabras", "Cuenta las palabras de un texto", {"texto": str})
async def contar_palabras(args: dict[str, Any]) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": str(len(args["texto"].split()))}]}

utilidades = create_sdk_mcp_server(name="utilidades", version="1.0.0", tools=[contar_palabras])

async def bloquear_rm(input_data: dict[str, Any], tool_use_id: str | None, context: Any) -> dict[str, Any]:
    if "rm -rf" in input_data.get("tool_input", {}).get("command", ""):
        return {"hookSpecificOutput": {"hookEventName": "PreToolUse",
                "permissionDecision": "deny", "permissionDecisionReason": "rm -rf no está permitido"}}
    return {}

async def decidir(nombre: str, entrada: dict[str, Any], ctx: ToolPermissionContext):
    if nombre == "Write" and str(entrada.get("file_path", "")).endswith(".env"):
        return PermissionResultDeny(message="No se escriben secretos")
    return PermissionResultAllow()

opciones = ClaudeAgentOptions(
    model=MODEL,
    system_prompt={"type": "preset", "preset": "claude_code", "append": "Responde en español."},
    setting_sources=["project"],
    allowed_tools=["Read", "Grep", "Glob", "mcp__utilidades__contar_palabras"],
    permission_mode="default",
    mcp_servers={"utilidades": utilidades},
    hooks={"PreToolUse": [HookMatcher(matcher="Bash", hooks=[bloquear_rm])]},
    can_use_tool=decidir,
    agents={"revisor": AgentDefinition(description="Revisa código; úsalo tras cambios.",
            prompt="Eres un revisor estricto.", tools=["Read", "Grep", "Glob"], model="haiku")},
    max_turns=20, effort="medium",
)

async def main() -> None:
    async for m in query(prompt="Cuenta las palabras de README.md", options=opciones):
        if isinstance(m, AssistantMessage):
            for b in m.content:
                if isinstance(b, TextBlock):
                    print(b.text)
        elif isinstance(m, ResultMessage):
            print("coste USD:", m.total_cost_usd, "sesión:", m.session_id)

asyncio.run(main())
```

**Ejemplo mínimo verificado (TypeScript).** Pasa `tsc --strict` con `@anthropic-ai/claude-agent-sdk@0.3.312`, zod 4.6.7 y TS 5.9.3. Fichero: `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-1a/ts-agent/agente.ts`.

```ts
import { query, tool, createSdkMcpServer, type HookCallback } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const MODEL = "claude-sonnet-5-5";
const contarPalabras = tool("contar_palabras", "Cuenta las palabras de un texto", { texto: z.string() },
  async ({ texto }) => ({ content: [{ type: "text", text: String(texto.split(/\s+/).filter(Boolean).length) }] }));
const utilidades = createSdkMcpServer({ name: "utilidades", version: "1.0.0", tools: [contarPalabras] });

const bloquearRm: HookCallback = async (input) => {
  if (input.hook_event_name === "PreToolUse") {
    const cmd = String((input.tool_input as { command?: string }).command ?? "");
    if (cmd.includes("rm -rf")) return { hookSpecificOutput: { hookEventName: "PreToolUse",
      permissionDecision: "deny", permissionDecisionReason: "rm -rf no está permitido" } };
  }
  return {};
};

for await (const m of query({ prompt: "Cuenta las palabras de README.md", options: {
  model: MODEL,
  systemPrompt: { type: "preset", preset: "claude_code", append: "Responde en español." },
  settingSources: ["project"],
  allowedTools: ["Read", "Grep", "Glob", "mcp__utilidades__contar_palabras"],
  permissionMode: "default",
  mcpServers: { utilidades },
  hooks: { PreToolUse: [{ matcher: "Bash", hooks: [bloquearRm] }] },
  canUseTool: async (nombre, entrada) =>
    nombre === "Write" && String(entrada.file_path ?? "").endsWith(".env")
      ? { behavior: "deny", message: "No se escriben secretos" }
      : { behavior: "allow", updatedInput: entrada },
  agents: { revisor: { description: "Revisa código; úsalo tras cambios.", prompt: "Eres un revisor estricto.",
                       tools: ["Read", "Grep", "Glob"], model: "haiku" } },
  maxTurns: 20, effort: "medium",
} })) {
  if (m.type === "assistant") for (const b of m.message.content) if (b.type === "text") console.log(b.text);
  if (m.type === "result") console.log("coste USD:", m.total_cost_usd, "sesión:", m.session_id);
}
```

Fuentes: code.claude.com/docs/en/agent-sdk.md · …/agent-sdk/python.md · …/agent-sdk/typescript.md · PyPI y npm.

---

### 2.3 Claude Code (v2.1.312, npm `@anthropic-ai/claude-code`, 27 oct. 2026)

**Instrucciones y memoria**
- **Orden de carga de `CLAUDE.md`, de lo más general a lo más concreto**:
  1. Política gestionada: `/Library/Application Support/ClaudeCode/CLAUDE.md` en macOS, `/etc/claude-code/CLAUDE.md` en Linux/WSL, `C:\Program Files\ClaudeCode\CLAUDE.md` en Windows.
  2. Usuario: `~/.claude/CLAUDE.md`.
  3. Proyecto: `./CLAUDE.md` o `./.claude/CLAUDE.md`.
  4. Local: `./CLAUDE.local.md` (para `.gitignore`).

  Los ficheros de los directorios superiores se cargan al arrancar; los de subdirectorios, cuando Claude toca un fichero dentro de ellos. **Se concatenan, no se sustituyen.** Los comentarios HTML de bloque se eliminan antes de inyectar. Límite de 4 MiB por fichero.
- **Importaciones** con `@ruta`: relativas al propio fichero, recursivas hasta **4 saltos**. No se procesan dentro de bloques de código. Si la ruta sale del proyecto, Claude Code pide aprobación.
- **`.claude/rules/*.md`**: se buscan de forma recursiva. Con frontmatter `paths: ["src/api/**/*.ts"]` solo se cargan al trabajar con ficheros que encajan. Para excluir ficheros en monorepos: `claudeMdExcludes`.
- **`AGENTS.md`: lectura nativa desde la v2.1.277** mediante el plugin integrado `cc-plugin-agents-md@builtin` (antes, `agents-md@builtin`).
  - Ajuste *Project instructions*: `claude-md-or-agents-md` (por defecto; lee `AGENTS.md` solo si no hay `CLAUDE.md`, `.claude/CLAUDE.md` ni `CLAUDE.local.md` en el directorio de trabajo o por encima), `claude-md-and-agents-md` (ambos) o `managed-only`.
  - No lee `AGENTS.local.md`, `AGENTS.override.md` ni `.agents/`.
  - Con `AGENTS.md` no se disparan los hooks `InstructionsLoaded`.
  - Alternativa compatible con todas las versiones: importarlo desde `CLAUDE.md` con `@AGENTS.md`.
- **Memoria automática**: `~/.claude/projects/<proyecto>/memory/MEMORY.md` (índice; se cargan las primeras 200 líneas o 25 KB) más un fichero por tema. Tipos: `user`, `feedback`, `project` y `reference`. Se controla con `autoMemoryEnabled`, `autoMemoryDirectory` y `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`.

***Skills* (sustituyen a los comandos personalizados; `.claude/commands/x.md` sigue funcionando)**
- Ubicaciones, de mayor a menor prioridad: enterprise, `~/.claude/skills/<n>/SKILL.md`, `.claude/skills/<n>/SKILL.md`. También se cargan las anidadas (`<subdir>/.claude/skills`), las de `--add-dir` y las de plugins (`/plugin:skill`).
- Frontmatter, todo opcional: `name`, `description`, `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`, `effort`, `context: fork`, `agent`, `background`, `hooks`, `paths`, `shell`. Acepta además `metadata`, `license` y `compatibility` del estándar, pero los ignora.
- Sustituciones: `$ARGUMENTS`, `$0…$N`, `$nombre`, `${CLAUDE_SESSION_ID}`, `${CLAUDE_EFFORT}`, `${CLAUDE_SKILL_DIR}`, `${CLAUDE_PROJECT_DIR}` y `${CLAUDE_PLUGIN_ROOT}`. Inyección dinámica con `` !`cmd` `` o un bloque ` ```! `; se desactiva con `disableSkillShellExecution`.
- En el listado, `description` + `when_to_use` se trunca a **1.536 caracteres**. Recomendación: `SKILL.md` por debajo de 500 líneas.

**Subagentes** (`.claude/agents/*.md`)
- Prioridad: gestionado > `--agents` > `.claude/agents/` > `~/.claude/agents/` > plugin.
- Frontmatter: `name` y `description` son obligatorios. El resto, opcional: `tools`, `disallowedTools`, `model` (`sonnet`, `opus`, `haiku`, `fable`, un ID o `inherit`), `permissionMode` (`default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`, `manual`), `maxTurns`, `autoCompactWindow`, `skills`, `mcpServers`, `hooks`, `memory` (`user`, `project`, `local`), `background`, `omitClaudeMd`, `effort`, `isolation: worktree`, `color`, `initialPrompt` y `experimental.cacheTtl`.
- Integrados: `Explore`, `Plan`, `general-purpose`, `statusline-setup` y `claude-code-guide`.
- Pueden lanzar subagentes propios hasta 3 niveles (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). Se ejecutan en segundo plano por defecto desde la semana 27, y el modo *fork* (un subagente que hereda la conversación) está activo por defecto desde la semana 33.

**Hooks** (33 eventos)
- Eventos: `SessionStart`, `Setup`, `UserPromptSubmit`*, `UserPromptExpansion`*, `PreToolUse`*, `PermissionRequest`, `PermissionDenied`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`*, `Notification`, `MessageDisplay`, `SubagentStart`, `SubagentStop`*, `TaskCreated`*, `TaskCompleted`*, `Stop`*, `StopFailure`, `TeammateIdle`*, `InstructionsLoaded`, `ConfigChange`*, `CwdChanged`, `DirectoryAdded`, `FileChanged`, `WorktreeCreate`*, `WorktreeRemove`*, `PreCompact`*, `PostCompact`, `PreModelSwitch`*, `PostModelSwitch`, `Elicitation`*, `ElicitationResult`*, `SessionEnd`. El asterisco marca los que pueden bloquear.
- Tipos: `command`, `http`, `mcp_tool`, `prompt` y `agent` (experimental). Tiempo máximo por defecto: 600 s para `command`, `http` y `mcp_tool`; 30 s para `prompt`; 60 s para `agent`. Con `"async": true` el hook corre en segundo plano; con `"asyncRewake": true`, además despierta a Claude si sale con 2. El campo `if` acepta sintaxis de permisos, por ejemplo `"Bash(git *)"`.
- Configuración: `{"hooks":{"PreToolUse":[{"matcher":"Bash","hooks":[{"type":"command","command":"${CLAUDE_PROJECT_DIR}/.claude/hooks/x.sh","timeout":30}]}]}}`.
- Entrada (JSON por stdin): `session_id`, `prompt_id`, `transcript_path`, `cwd`, `scratchpad_dir`, `permission_mode`, `effort.level`, `hook_event_name`, `agent_id`, `agent_type`; en eventos de herramienta, también `tool_name`, `tool_input` y `tool_use_id`.
- **Códigos de salida**: 0 = éxito (stdout se lee como JSON si es un objeto). **2 = bloqueo** (stderr llega como motivo; bloquea aunque el JSON permita). Cualquier otro = error que no bloquea (salvo `onFailure: "block"`).
- Salida: `continue`, `stopReason`, `systemMessage`, `decision: "block"` con `reason`, y `hookSpecificOutput.{permissionDecision: allow|deny|ask|defer, permissionDecisionReason, updatedInput, additionalContext}`. `additionalContext` admite como mucho 10.000 caracteres.
- Dónde se definen: los `settings.json`, la configuración gestionada, `hooks/hooks.json` de un plugin y el frontmatter de *skills* y subagentes. **Se suman, no se sustituyen.** `allowManagedHooksOnly` deja solo los gestionados.
- **Un hook `PreToolUse` que devuelve «allow» no salta las reglas `deny` ni `ask`.** Un hook que sale con 2 sí bloquea aunque haya una regla `allow`.

**Permisos y *sandbox***
- Reglas `permissions.allow`, `permissions.ask` y `permissions.deny` con la sintaxis `Herramienta(especificador)`: `Bash(npm run *)`, `Read(./.env)`, `WebFetch(domain:…)`, `mcp__srv__tool`, `Agent(model:opus)`. También admite la forma `Tool(param:value)` (semana 25) y negaciones `!` al estilo gitignore.
- **Orden de evaluación: deny → ask → allow; gana la primera coincidencia.** Un `deny` de cualquier ámbito gana a un `allow`.
- Modos: `default` (Manual), `acceptEdits`, `plan`, `auto` (clasificador en segundo plano; modo por defecto en Pro, Max y Team desde el 14 ago. 2026), `dontAsk` y `bypassPermissions`. Se bloquean con `permissions.disableBypassPermissionsMode` y `disableAutoMode`.
- *Sandbox* de Bash: `/sandbox` o `sandbox.enabled: true`.
  - Mecanismo: Seatbelt en macOS; bubblewrap y socat en Linux y WSL2; no existe en Windows nativo.
  - Claves: `filesystem.allowWrite`, `filesystem.denyWrite`, `filesystem.denyRead`, `network.allowedDomains`, `network.deniedDomains`, `excludedCommands`, `allowUnsandboxedCommands` y `autoAllowBashIfSandboxed` (por defecto `true`).
  - Se basa en el paquete abierto `@anthropic-ai/sandbox-runtime`.
  - Solo cubre Bash, PowerShell y Monitor: **las herramientas de ficheros, MCP y los hooks quedan fuera.**

**Plugins y *marketplaces***
- Estructura: `.claude-plugin/plugin.json` (con `name` obligatorio), `skills/`, `agents/`, `commands/`, `hooks/hooks.json`, `.mcp.json`, `workflows/`, `output-styles/` y LSP.
- Herramientas: `claude plugin validate|init|eval|list`, `--plugin-dir` (directorio o `.zip`; también una carpeta de plugins), `--plugin-url` y `CLAUDE_CODE_PLUGIN_DIRS`.
- Distribución: *marketplaces* con `.claude-plugin/marketplace.json` y `/plugin marketplace add`. El oficial es `claude-plugins-official`, que incluye `plugin-dev`.
- **Novedades**: `claude plugin eval` (semana 37) compara contra una línea base sin el plugin. Los *mods* son extensiones de interfaz y eventos (`tool.check`, `agent.spawn`).

***Headless* y automatización**
- `claude -p` con `--output-format text|json|stream-json`, `--input-format stream-json`, `--json-schema` (devuelve `structured_output`), `--allowedTools`, `--permission-mode`, `--permission-prompts none` (v2.1.259 o posterior), `--max-budget-usd`, `--continue` y `--resume <id|ruta.jsonl>`.
- **`--bare`** ignora hooks, *skills*, plugins, MCP, memoria y `CLAUDE.md`, y solo usa `ANTHROPIC_API_KEY`. Es el modo recomendado para scripts y CI, y **será el modo por defecto de `-p`**.
- Desde la v2.1.302, `-p` arranca en modo Manual si nada fija otro. Eventos de flujo: `system/init` (con `capabilities`, `plugin_errors` y `mcp_server_errors`) y `system/api_retry`.
- **Ojo de seguridad**: sin `--bare`, `-p` ejecuta los hooks y los servidores MCP del repositorio **sin mostrar el diálogo de confianza**.

**Otras primitivas**
- **Estilos de salida**: integrados `Proactive`, `Concise`, `Explanatory` y `Learning`. Los propios van en `.claude/output-styles/*.md` con `keep-coding-instructions` y, para plugins, `force-for-plugin`.
- **Checkpoints**: `/rewind` o Esc dos veces; guarda 100 por sesión. No registra cambios hechos con Bash ni ediciones de subagentes en segundo plano.
- ***Worktrees***: `-w/--worktree`, `isolation: worktree` y `worktree.baseRef`.
- **Segundo plano**: `--bg`, `claude agents` (agent view), `attach`, `logs` y `stop`.
- **Dynamic workflows** (desde la semana 22): un script JS que Claude escribe y el *runtime* ejecuta.
  - Funciones: `agent()`, `pipeline()`, `parallel()`, `phase()`, `log()` y la variable `args`. `meta` debe ser un literal.
  - Se guardan en `.claude/workflows/` o `~/.claude/workflows/`.
  - Límites: 16 agentes concurrentes por defecto (hasta 256), 4.096 elementos por `parallel` y 1.000 agentes por ejecución. `Date.now()` y `Math.random()` lanzan error para que la reanudación sea determinista.
  - Integrado: `/deep-research`. Con `ultracode` Claude decide cuándo usar un *workflow*.
  - Se autorizan con la regla `Workflow` o `Workflow(<nombre>)`.
- **`/goal <condición>`**: un hook `Stop` basado en *prompt*, que evalúa un modelo pequeño. Termina cuando la condición se cumple, cuando se juzga imposible o ante errores que debes arreglar tú.
- **Equipos de agentes**: experimental, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, con lista de tareas y buzones compartidos. No funciona en `-p` ni en el SDK.
- Otras: mensajería entre sesiones (semana 32) y entornos autoalojados (beta Team/Enterprise).

Fuentes: code.claude.com/docs/en/{memory,skills,sub-agents,hooks,permissions,sandboxing,plugins/create,headless,workflows,goal,agent-teams,output-styles,checkpointing,whats-new/index}.md · npm.

---

### 2.4 Claude Managed Agents (beta desde el 8 abr. 2026)

- **Qué es**: un «pre-built, configurable agent harness that runs in managed infrastructure». Encaja con tareas largas y asíncronas en las que no quieres construir tu propio bucle, *sandbox* ni capa de ejecución.
- **Cabecera**: `managed-agents-2026-04-01` (el SDK la pone sola). Endpoints: `/v1/agents`, `/v1/sessions` y `/v1/environments`. Además: `deployments` y `deployment_runs` (ejecuciones programadas con cron), `memory_stores` (beta `agent-memory-2026-07-22`), `vaults` (credenciales OAuth para MCP), `dreams` (vista previa de investigación, `dreaming-2026-04-21`) y `webhooks`.
- **Conceptos**:
  - **Agent**: modelo, *prompt* de sistema, herramientas, servidores MCP y *skills*.
  - **Environment**: *sandbox* en la nube o autoalojado; con la red `limited` se usa `allowed_hosts`.
  - **Session**: una instancia en ejecución.
  - **Events**: los que envías (`user.message`, `user.interrupt`, `user.tool_confirmation`, `user.tool_result`, `user.custom_tool_result`, `user.define_outcome`, `system.message`) y los que recibes (`agent.message`, `agent.tool_use`, `session.status_idle`…), por SSE.
- **Herramientas**: `{"type":"agent_toolset_20260401"}` con `bash`, `read`, `write`, `edit`, `glob`, `grep`, `web_fetch` y `web_search`. `configs` y `default_config` aceptan `enabled` y `permission_policy` (incluida `auto`, desde el 10 sep.). Las herramientas propias son `type: custom` (sus nombres no pueden empezar por `mcp__` ni `ant__`). MCP se conecta con el conector; *advisor* y multiagente van en el bloque `multiagent`. Los *toolsets* de ordenador y navegador **no** están disponibles aquí.
- **Funciones de 2026**: memoria (23 abr.), multiagente y *outcomes* (6 may.), *sandboxes* autoalojados (19 may.), despliegues programados (9 jun.), presupuestos por sesión (`budget={"type":"limit","max_list_cost":{"amount":"125","currency":"USD"}}`, 7 ago.), *skills* cargadas desde GitHub, `inference_geo`, *workflows* dinámicos (beta `multiagent_20261001`, 9 oct.) y restricciones de dominio para la web.
- **Dreams**: un trabajo asíncrono que revisa un almacén de memoria junto con 1 a 100 transcripciones. Fusiona duplicados, sustituye lo obsoleto y produce un **almacén nuevo** sin tocar el original.
- **Creación declarativa**: `ant apply agente.md entorno.yaml`. El agente es un Markdown con frontmatter (`name`, `model`, `tools`) y el *prompt* en el cuerpo; el CLI guarda los IDs en `claude-lock.json`.
- **Precio**: **$0,08 por hora de sesión** (se mide al milisegundo y solo mientras está `running`) más tokens a tarifa normal, sin descuento Batch. No apta para ZDR ni HIPAA.
- **Ejemplo** (de la documentación; no ejecutado):

```python
session = client.beta.sessions.create(agent=agent.id, environment_id=environment.id, title="Demo")
with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(session.id, events=[{"type": "user.message",
        "content": [{"type": "text", "text": "Genera fibonacci.txt con los 20 primeros números"}]}])
    for event in stream:
        if event.type == "agent.message":
            print("".join(b.text for b in event.content if b.type == "text"))
        elif event.type == "session.status_idle":
            break
```

Fuentes: platform.claude.com/docs/en/managed-agents/{overview,quickstart,tools,sessions,dreams} · …/about-claude/pricing · release notes.

---

### 2.5 MCP (Model Context Protocol)

**Especificación vigente: `2026-07-28`** (publicada el 28 jul. 2026; la anterior era `2025-11-25`). Cambios principales:
1. **Sin estado**: desaparecen `initialize`/`notifications/initialized` y `Mcp-Session-Id`.
   - Cada petición lleva en `_meta` las claves `io.modelcontextprotocol/protocolVersion`, `…/clientCapabilities` y `…/clientInfo`. El servidor responde con `…/serverInfo`.
   - Una versión no soportada devuelve `UnsupportedProtocolVersionError`.
   - El estado entre llamadas se guarda en *handles* que crea el servidor y que el modelo pasa como argumentos.
2. **`server/discover`** (obligatorio en el servidor): anuncia versiones, capacidades e identidad.
3. **`subscriptions/listen`** sustituye al GET HTTP y a `resources/subscribe`. Se eliminan `ping`, `logging/setLevel` y `notifications/roots/list_changed`. El nivel de log va por petición (`io.modelcontextprotocol/logLevel`).
4. **MRTR** (*Multi Round-Trip Requests*): el servidor devuelve `resultType: "input_required"` con `inputRequests`, y el cliente reintenta con `inputResponses`. Sustituye a las peticiones que iniciaba el servidor (elicitation, sampling, roots). **Todos los resultados llevan `resultType`.**
5. **Tasks** sale del núcleo a la extensión `io.modelcontextprotocol/tasks` (beta, con destino el núcleo): `tasks/get` (sondeo), `tasks/update` y `tasks/cancel`; estados `working`, `input_required`, `completed`, `failed`, `cancelled`.
6. Las respuestas de lista (`tools/list` y similares) llevan **`ttlMs` y `cacheScope`**. Se recomienda **orden determinista** de herramientas, que también ayuda a la caché del LLM. Cabeceras obligatorias en Streamable HTTP: `Mcp-Method` y `Mcp-Name`. `inputSchema` y `outputSchema` admiten cualquier JSON Schema 2020-12. Se elimina la reanudación SSE (`Last-Event-ID`).
7. **Autorización**: validar `iss` (RFC 9207), indicar `application_type`, ligar credenciales al emisor y **deprecar DCR en favor de CIMD** (*Client ID Metadata Documents*).
8. **Deprecados** (12 meses mínimo de soporte): Roots, Sampling, Logging, el transporte HTTP+SSE e `includeContext` `thisServer`/`allServers`.

**Extensiones oficiales** (repos `ext-*`):
- **MCP Apps** (`io.modelcontextprotocol/ui`, estable). Las herramientas declaran `_meta.ui.resourceUri` con un recurso `ui://` en HTML, que se renderiza en un iframe aislado y se comunica por postMessage con JSON-RPC (`ui/initialize`). Lo soportan Claude, Claude Desktop, VS Code GitHub Copilot, Microsoft 365 Copilot, Goose y Postman, entre otros. SDK: `@modelcontextprotocol/ext-apps` 2.0.4.
- **Tasks** (beta).
- **Skills over MCP** (beta).
- **Server Cards** (SEP-2127, beta): descubrir los metadatos de un servidor por HTTP antes de conectar.
- **OAuth Client Credentials** y **Enterprise-Managed Authorization** (estables).

**Registro oficial**: registry.modelcontextprotocol.io, **en vista previa**. Guarda metadatos `server.json`, no código, con espacios de nombres verificados por DNS o GitHub (`io.github.user/server`). Está pensado para agregadores, no para que los hosts lo consuman directamente.

**Gobernanza**: «Model Context Protocol a Series of LF Projects, LLC», con licencia Apache 2.0. Lead Maintainers: David Soria Parra y Den Delimarsky; seis Core Maintainers. El proyecto aparece entre los de la AAIF. **SIN CONFIRMAR en esta sesión** la fecha de la donación (Anthropic dice en su post del 22 oct. 2026 que «previously donated» MCP a la AAIF, cofundada «last year»).

**SDK** (tiers en modelcontextprotocol.io/docs/2026-07-28/sdk):
- Tier 1: TypeScript, Python, C#, Go, Rust y Ruby. Tier 2: Java. Tier 3: Swift, PHP y Kotlin.
- **Python `mcp`** 2.0.0 (28 jul. 2026); hoy 2.3.0 (2 oct.).
  - **[verificado]** `from mcp.server.mcpserver import MCPServer` y `MCPServer(name, ..., extensions=..., cache_hints=..., middleware=...)`.
  - `@mcp.tool(name, title, description, annotations, icons, meta, structured_output)` y `mcp.run(transport="stdio"|"sse"|"streamable-http")`.
  - `ToolError` en `mcp.server.mcpserver.exceptions`.
  - `mcp.server.fastmcp` ya no existe: al importarlo, un error remite a la guía de migración.
  - Cliente de alto nivel: `from mcp import Client`. `ClientSession.initialize()` queda como vía de compatibilidad.
  - `LATEST_PROTOCOL_VERSION == "2026-07-28"`.
- **TypeScript v2**: `@modelcontextprotocol/server` y `@modelcontextprotocol/client` 2.4.0 (2.0.0 el 27 jul. 2026). Más `@modelcontextprotocol/core` y adaptadores `express`, `fastify`, `hono` y `node`. **Sustituyen al paquete único `@modelcontextprotocol/sdk`**, que sigue publicándose como línea v1 (1.32.2, 23 oct.). API: `new McpServer({name, version})`, `server.registerTool(name, {description, inputSchema: z.object(...), outputSchema}, handler)` y `StdioServerTransport` desde `@modelcontextprotocol/server/stdio`.

**Conector MCP en la API de Claude** (beta `mcp-client-2025-11-20`; la versión `mcp-client-2026-09-15` la incluye y añade fijar la lista de herramientas y el bloque `mcp_tool_listing`):
- `mcp_servers=[{"type":"url","url":"https://…","name":"srv","authorization_token":"…"}]` y `tools=[{"type":"mcp_toolset","mcp_server_name":"srv","default_config":{"enabled":True,"defer_loading":False},"configs":{…}}]`.
- Solo soporta **herramientas**, sobre Streamable HTTP o SSE; los servidores stdio locales no se pueden conectar.
- Bloques de respuesta: `mcp_tool_use` y `mcp_tool_result`.
- No apto para ZDR. Funciona en Batch.
- Para servidores privados existen los túneles MCP (`/v1/tunnels`, vista previa de investigación).

**Ejemplo verificado (Python, servidor y prueba en memoria):**

```python
from pydantic import BaseModel
from mcp import Client
from mcp.server.mcpserver import MCPServer
from mcp.server.mcpserver.exceptions import ToolError

mcp = MCPServer("pedidos", instructions="Consulta pedidos de la tienda. Solo lectura.")
PEDIDOS = {"A-1": {"estado": "enviado", "total": 42.5}}

class Pedido(BaseModel):
    id: str
    estado: str
    total: float

@mcp.tool()
def consultar_pedido(id_pedido: str) -> Pedido:
    """Devuelve el estado y el total de un pedido por su identificador (p. ej. A-1)."""
    if id_pedido not in PEDIDOS:
        raise ToolError(f"No existe el pedido {id_pedido}. Revisa el formato: letra-guion-número.")
    return Pedido(id=id_pedido, **PEDIDOS[id_pedido])

async def probar():
    async with Client(mcp) as c:                       # en proceso (tests)
        ok = await c.call_tool("consultar_pedido", {"id_pedido": "A-1"})
        print(ok.is_error, ok.structured_content)      # False {'id': 'A-1', 'estado': 'enviado', 'total': 42.5}
        mal = await c.call_tool("consultar_pedido", {"id_pedido": "Z-9"})
        print(mal.is_error, mal.content[0].text)       # True "Error executing tool consultar_pedido: No existe…"
        print(c.protocol_version)                      # 2026-07-28
# mcp.run()  → stdio;  mcp.run(transport="streamable-http") → remoto
```

Lo que salió al ejecutarlo: el modelo de retorno de Pydantic genera `output_schema` y `structured_content`, y el mensaje de `ToolError` llega **con el prefijo `Error executing tool <nombre>: `**. Fichero: `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-1a/ejemplos/servidor_mcp.py`.

**Ejemplo verificado (TypeScript v2).** Compila con `tsc --strict` y se ejecutó con `InMemoryTransport` y `Client`. Fichero: `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-1a/ts-mcp/servidor.ts`.

```ts
import { McpServer, InMemoryTransport } from "@modelcontextprotocol/server";
import { Client } from "@modelcontextprotocol/client";
import { z } from "zod";

const server = new McpServer({ name: "pedidos", version: "1.0.0" });
server.registerTool("consultar_pedido", {
    description: "Devuelve el estado de un pedido por su identificador (p. ej. A-1).",
    inputSchema: z.object({ idPedido: z.string() }),
    outputSchema: z.object({ id: z.string(), estado: z.string() }),
  },
  async ({ idPedido }) => {
    if (idPedido !== "A-1") return { isError: true, content: [{ type: "text", text: `No existe el pedido ${idPedido}` }] };
    const out = { id: idPedido, estado: "enviado" };
    return { content: [{ type: "text", text: JSON.stringify(out) }], structuredContent: out };
  });
// Producción: import { StdioServerTransport } from "@modelcontextprotocol/server/stdio"; await server.connect(new StdioServerTransport());
const [a, b] = InMemoryTransport.createLinkedPair();
await server.connect(a);
const client = new Client({ name: "prueba", version: "1.0.0" });
await client.connect(b);
console.log(await client.callTool({ name: "consultar_pedido", arguments: { idPedido: "A-1" } }));
```

Fuentes: modelcontextprotocol.io/specification/2026-07-28/changelog · blog.modelcontextprotocol.io/posts/2026-07-28/ · modelcontextprotocol.io/{docs/extensions/overview, extensions/apps/overview, extensions/tasks/overview, registry/about, community/governance, docs/2026-07-28/sdk}.md · platform.claude.com/docs/en/agents-and-tools/mcp-connector.

---

### 2.6 A2A (Agent2Agent)

- **Estado**: A2A **1.0** es la versión de protocolo vigente en el SDK oficial (`a2a/utils/constants.py`: `PROTOCOL_VERSION_CURRENT = '1.0'`, con compatibilidad con `0.3`). El README del paquete enlaza a `a2a-protocol.org/v1.0.0/specification/`. **SIN CONFIRMAR** la fecha de publicación de la especificación 1.0, porque no pude abrir a2a-protocol.org. Como referencia: `a2a-sdk` 1.0.0 salió en PyPI el **20 abr. 2026** y `@a2a-js/sdk` 1.0.0 en npm el **22 jul. 2026**; hoy van por 1.3.0 (27 oct. y 29 sep.).
- **Gobernanza**: la AAIF lista «Agent2Agent (A2A): an open protocol for agent communication» entre sus proyectos. El paquete proto se llama `lf.a2a.v1` (Linux Foundation). El SDK de Python lo publica Google LLC con licencia Apache 2.0; repositorios en `github.com/a2aproject`.
- **Conceptos** (del `a2a.proto` del SDK, **[verificado]**):
  - **AgentCard**: `name`, `description`, `supported_interfaces[{url, protocol_binding, protocol_version, tenant}]`, `provider`, `version`, `capabilities{streaming, push_notifications, extensions, extended_agent_card}`, `security_schemes` (API key, HTTP, OAuth2 con PKCE o *device code*, OIDC, mTLS), `default_input_modes`, `default_output_modes`, `skills[{id, name, description, tags, examples, …}]` y `signatures` (tarjetas firmadas). Se sirve en **`/.well-known/agent-card.json`**.
  - **Task**: `id`, `context_id`, `status{state, message, timestamp}`, `artifacts` e `history`. Estados: `SUBMITTED`, `WORKING`, `COMPLETED`, `FAILED`, `CANCELED`, `INPUT_REQUIRED`, `REJECTED`, `AUTH_REQUIRED`.
  - **Message**: `message_id`, `context_id`, `task_id`, `role` (`USER` o `AGENT`), `parts` y `reference_task_ids`.
  - **Part**: `text`, `raw`, `url` o `data`, más `media_type`.
  - **Artifact**: `artifact_id`, `name` y `parts`.
- **Operaciones** (servicio `A2AService`): `SendMessage` (`POST /message:send`), `SendStreamingMessage` (`/message:stream`), `GetTask`, `ListTasks`, `CancelTask`, `SubscribeToTask`, `Create/Get/List/DeleteTaskPushNotificationConfig` y `GetExtendedAgentCard`.
- **Bindings**: `JSONRPC`, `HTTP+JSON` (*media type* `application/a2a+json`) y `GRPC`. La versión viaja en la cabecera `A2A-Version`.
- **Relación con MCP**: complementarios. MCP conecta un agente con herramientas y datos; A2A conecta agentes entre sí (tareas con estado, artefactos, *push*). **SIN CONFIRMAR** cualquier postura oficial actualizada sobre convergencia de ambos protocolos.
- SDK: `pip install a2a-sdk` (con extras `http-server`, `fastapi`, `grpc`, `telemetry`, `sql`) y `npm i @a2a-js/sdk`. Herramienta de validación: `a2a-inspector`.

### 2.7 Agent Skills como estándar abierto

- **Qué es**: un formato abierto para empaquetar conocimiento procedimental. Es una carpeta con `SKILL.md` (frontmatter YAML y Markdown) y, opcionalmente, `scripts/`, `references/` y `assets/`. Se carga por *divulgación progresiva*: primero los metadatos (unos 100 tokens), luego las instrucciones (se recomiendan menos de 5.000 tokens y menos de 500 líneas) y los recursos solo bajo demanda.
- **Frontmatter**:
  - `name` (obligatorio): 1–64 caracteres `a-z0-9-`, sin guion al principio ni al final, sin `--`, y **igual al nombre del directorio**.
  - `description` (obligatorio): 1–1.024 caracteres; qué hace y cuándo usarla.
  - `license` (opcional).
  - `compatibility` (opcional, hasta 500 caracteres).
  - `metadata` (opcional, mapa de cadenas a cadenas).
  - `allowed-tools` (opcional, experimental, separado por espacios: `Bash(git:*) Read`).
- Validación: `skills-ref validate ./mi-skill`.
- **Gobernanza**: el **22 oct. 2026** Anthropic donó a la AAIF el estándar, el nombre, el logo, la organización de GitHub (`agentskills/agentskills`) y el dominio agentskills.io. Lo mantienen ingenieros de Anthropic, Google, OpenAI y otras empresas a título individual, con David Soria Parra y Mahesh Murag como Lead Maintainers. La hoja de ruta prevé versiones numeradas, un proceso formal de propuestas y guía de seguridad.
- **Adopción** (según Anthropic): más de 70 plataformas. Cita ChatGPT, Cursor, GitHub Copilot y VS Code, y menciona cargadores de la comunidad para Codex, Cursor y OpenCode. Unas 1M de *skills* publicadas y unos 280M instaladas. **SIN CONFIRMAR** la lista completa: la página de clientes de agentskills.io se genera con JavaScript y no se pudo leer.
- **Implementaciones de Anthropic**: Claude Code (con extensiones propias del frontmatter), la Skills API (GA) y claude.ai. El Agent SDK expone la opción `skills=`. Existe además la extensión MCP «Skills over MCP» (beta).

### 2.8 AGENTS.md

- **Qué es**: un formato abierto (Markdown sin esquema) para dar instrucciones a agentes de código en un repositorio. La AAIF lo lista como proyecto propio: «AGENTS.md: an open format for guiding coding agents».
- **Quién lo lee (confirmado)**: **Claude Code, de forma nativa desde la v2.1.277** (§2.3). Detalles: precedencia frente a `CLAUDE.md`, ficheros que no lee y cómo se activa (`cc-plugin-agents-md@builtin`).
- **SIN CONFIRMAR**: la lista de otras herramientas que lo leen (Codex, Cursor, Copilot, Jules, Gemini CLI…) y sus reglas de precedencia. La web agents.md no estaba permitida y no quedaban búsquedas. Recomendación: verificarlo en una pasada posterior antes de publicarlo.

### 2.9 Agentic AI Foundation (AAIF, Linux Foundation)

- Se define como «the neutral and open foundation built on transparency, collaboration, and standardization to advance the public interest in agentic AI innovation».
- **Proyectos alojados** (aaif.io, 29 oct. 2026): Agent Router (pasarela de IA sobre Envoy), **Agent Skills**, **A2A**, **AGENTS.md**, agentgateway, **goose**, **MCP**, Open Responses (formato compartido de API LLM para agentes), OpenEnv (entornos para entrenar agentes) y OpenSandbox.
- Grupos de trabajo: Accuracy & Reliability, Agentic Commerce, Governance/Risk & Regulatory Alignment, Identity & Trust, Observability & Traceability, Security & Privacy, Workflows & Process Integration, Taxonomy & Landscape.
- Eventos: MCP Dev Summit Nairobi (19–20 nov. 2026), AGNTCon + MCPCon NA (28–29 abr. 2027) y Europa (15–16 sep. 2027).
- Fundadores: Anthropic dice que la cofundó «with Block and OpenAI last year», es decir, en 2025. **SIN CONFIRMAR** la fecha exacta de fundación y la lista de miembros.

### 2.10 Otras novedades de jul.–oct. 2026 que cambian cómo se construye

- **Fin de la temperatura en Claude.** La consistencia ya no se busca con `temperature=0`: se busca con salidas estructuradas, validación, caché de respuestas y evals con varias muestras. Afecta a los jueces de evals.
- **No forzar herramientas** en los modelos 5.5. Para «entregar al final» usa `output_config.format`, deja solo la herramienta de entrega disponible (con `tool_removal` o `defer_loading`) o da la instrucción en un `system` de un solo turno.
- **Caché**: el `system` a mitad de conversación, `defer_loading` y el esfuerzo por mensaje permiten cambiar instrucciones o herramientas sin romper el prefijo. `diagnostics` explica los fallos de caché.
- **Harness alojado frente a propio**: Managed Agents, Agent SDK y la API en bruto forman ya un espectro documentado oficialmente.
- **MCP sin estado**: los servidores se escalan detrás de un balanceador normal. Quien guarde estado por sesión debe pasar a *handles* explícitos.
- **Rechazos como flujo normal**: `stop_reason: "refusal"` con categoría y `fallbacks`. Los *harness* deben manejarlo además de los errores HTTP.

---

## 3. Correcciones a la base

### 3.1 GUIA-CONTENIDO §8, punto por punto

| Dato de §8 | Estado | Corrección o matiz (fuente) |
|---|---|---|
| `MODEL = "claude-sonnet-5-5"` | **Correcto** (ID activo) | Matiz: la documentación recomienda **Opus 5.5** como punto de partida y Sonnet 5.5 como el mejor equilibrio entre velocidad e inteligencia. Si se mantiene Sonnet 5.5, hay que tener presentes sus restricciones: sin `thinking: disabled`, sin `tool_choice` forzado, esfuerzo por defecto `high`. (models/overview; effort) |
| `client = anthropic.Anthropic()` lee `ANTHROPIC_API_KEY` | Correcto | Desde el SDK 2.x la clave viaja como `Authorization: Bearer` y la versión de API es `2026-10-21` **[verificado]**. Conviene nombrar la versión de SDK mínima: `anthropic>=2`, `@anthropic-ai/sdk>=1`. (migration-2026-10-21) |
| `stop_reason`: `end_turn`, `tool_use`, `max_tokens`, `stop_sequence`, `pause_turn`, `refusal` | **Incompleto** | Añadir `model_context_window_exceeded` (GA) y, en beta con compactación, `compaction`. `refusal` trae `stop_details.category`. (handling-stop-reasons; SDK `StopReason` **[verificado]**) |
| `resp.content` con `text`, `tool_use`, `thinking` | Incompleto | Añadir `redacted_thinking`, `server_tool_use`, `*_tool_result` (por ejemplo `web_search_tool_result`), `mcp_tool_use` y `mcp_tool_result`, `compaction`, `fallback` y `advisor_tool_result`. En los modelos 4.7 y posteriores el bloque `thinking` llega **vacío** por defecto (`display: "omitted"`). (thinking; tool-reference) |
| `resp.usage` con 4 campos | Incompleto | Además: `cache_creation{ephemeral_5m_input_tokens, ephemeral_1h_input_tokens}`, `output_tokens_details.thinking_tokens`, `server_tool_use`, `service_tier`, `speed` e `inference_geo` **[verificado]**; `usage.iterations` con *advisor* o *fallback*. |
| Regla del `tool_result` | Correcta | Matiz: en la llamada programática el mensaje debe llevar **solo** `tool_result`, sin texto. (programmatic-tool-calling) |
| `tool_choice`: `auto`, `any`, `tool`, `none` y `disable_parallel_tool_use` | **Desfasado en parte** | **`any` y `tool` devuelven 400 en Opus 5.5, Sonnet 5.5, Fable 5.1 y Mythos 5.1**, y con razonamiento manual. `auto` y `none` funcionan. Añadir la alternativa recomendada. (thinking §Tool choice; release notes 22 y 28 sep.) |
| TypeScript: `import Anthropic from "@anthropic-ai/sdk"` | Correcto **[verificado]** con 1.3.0 | Indicar `@anthropic-ai/sdk>=1.0.0`. |
| *Streaming* Python con `client.messages.stream(...)` y `text_stream` | Correcto **[verificado]** (firma en 2.3.0) | — |
| `client.messages.count_tokens(...)` → `.input_tokens` | Correcto **[verificado]** | — |
| Prompt caching (4 puntos de corte, nivel superior, TTL 5 min o 1 h, orden, mínimo según modelo) | Correcto | Añadir: la caché automática **ocupa uno** de los 4 puntos de corte; ventana de **20 bloques** hacia atrás; mínimo de **512** tokens en los modelos actuales; las lecturas cuestan 0,05× o 0,025× según el modelo (no siempre 0,1×); precalentamiento con `max_tokens: 0`; `diagnostics` en GA. (prompt-caching; cache-diagnostics) |
| Razonamiento: `thinking={"type":"adaptive"}` + `effort` en 5 niveles; «`budget_tokens` es el modo antiguo» | **Desfasado en parte** | `budget_tokens` **devuelve 400** en todos los modelos 5.x y en Opus 4.7 y 4.8. Hay modelos donde el razonamiento **no se puede desactivar** (Opus 5.5, Fable, Mythos). Sonnet 5.5 tiene `between_tools`. Los valores por defecto de `effort` cambian por modelo (`medium` en Opus 5.5 y Haiku 5.5). `display: "summarized"` para leer el razonamiento. El esfuerzo por mensaje es beta. (thinking; effort) |
| Salidas estructuradas | Correcto | Matices: GA en todos los modelos; `minItems` solo admite 0 y 1; incompatibles con citas y con *prefill*; `output_format=` en `messages.create` de la beta lanza `TypeError` (en `parse()` sigue siendo correcto **[verificado]**); no disponibles en Managed Agents. |
| Embeddings: Anthropic no ofrece modelo propio | Correcto (evidencia indirecta) | No aparece ningún modelo de embeddings en la tabla de modelos ni en el `Literal` del SDK, y no existe un recurso `embeddings` en `client` **[verificado]**. **SIN CONFIRMAR** con una página oficial en esta sesión. |
| MCP: Python `mcp` 2.x con `MCPServer`, `ToolError`, snake_case, `FastMCP` en 1.x | **Correcto [verificado]** con 2.3.0 | Añadir: el mensaje de `ToolError` llega con el prefijo `Error executing tool <n>: `; el cliente de alto nivel es `mcp.Client`. |
| MCP: transportes `stdio` y Streamable HTTP | Correcto | Añadir: especificación **2026-07-28 sin estado** (sin `initialize` ni sesiones; con `server/discover`, MRTR y `subscriptions/listen`). HTTP+SSE deprecado. Roots, Sampling y Logging deprecados. |
| MCP: el servidor expone *tools*, *resources* y *prompts* | Correcto | Las extensiones (Apps, Tasks, Skills, Server Cards) se negocian en `capabilities.extensions`. |
| **SDK de TypeScript: `@modelcontextprotocol/sdk`** | **Desfasado** | El SDK v2 estable (2.0.0 del 27 jul. 2026; hoy 2.4.0) son **`@modelcontextprotocol/server`** y **`@modelcontextprotocol/client`**. Ejemplos: `import { McpServer } from "@modelcontextprotocol/server"` y `StdioServerTransport` de `@modelcontextprotocol/server/stdio`. `@modelcontextprotocol/sdk` (1.32.x) es la línea v1. **[verificado]** |
| Uso del ordenador: no copiar la versión | Correcto como política | Dato nuevo: `computer_toolset_20260801` es GA y tiene forma de *toolset* (una entrada sin `name`, con `configs` y el campo `toolset_name` en el `tool_use`); `browser_toolset_20260801` es nueva. |
| «Para lo que cambia rápido, remite a la doc» | Correcto | — |
| Tabla de referencias citables | Correcta | Propuesta de añadidos (fuentes primarias reales): especificación MCP 2026-07-28 (modelcontextprotocol.io/specification/2026-07-28); Anthropic, 22 oct. 2026, «Donating Agent Skills to the Agentic AI Foundation» (anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation); agentskills.io/specification; guía de migración a la API 2026-10-21 (platform.claude.com/docs/en/api/migration-2026-10-21). |

**Falta en §8**: la **eliminación de `temperature`, `top_p` y `top_k`** en la API de Claude. Hay que añadirla, porque el contenido actual los usa (ver §3.2).

### 3.2 Contenido existente con datos desfasados o código que ya no funciona

| Ruta (línea) | Problema | Corrección |
|---|---|---|
| `roadmap/80-evals/03-codigo-o-modelo-juez` (l. 117 y 126) | `client.messages.create(..., temperature=0, ...)` con `claude-sonnet-5-5`: con el SDK 2.x **lanza `TypeError`**; con la API 2026-10-21 da 400; con versiones anteriores también da 400 en modelos 4.7 o posteriores si el valor no es el de por defecto. | Quitar `temperature`. Para estabilizar al juez: salida estructurada (`output_config.format`), rúbrica cerrada, varias muestras y voto, y fijar el ID del modelo. (versioning; model-deprecations §API parameter deprecations) |
| `roadmap/80-evals/05-regresiones-en-ci` (l. 186) | «Fija… `temperature` en el juez». | Sustituir por fijar el modelo, el esfuerzo y el esquema de salida. |
| `modelos/06-parametros` (tabla l. 21–22; sección «temperature y top_p», l. 53–68) | Presenta `temperature` y `top_p` como parámetros que se pueden ajustar. | Reescribir: en la API de Claude **se eliminaron en la versión 2026-10-21** (400 en cualquier modelo) y ya no admitían valores no predeterminados desde Claude 4.7. Conservar el concepto para otros proveedores. Añadir `effort`, `task_budget` y `speed`. |
| `glosario/temperatura`, `glosario/top-p` | Faltan los avisos. | Añadir: «En la API de Claude ya no se envían (eliminados en la versión 2026-10-21)». |
| `cursos/sistemas-multiagente/02-disenar-subagentes` (l. 109, 153 y 178) y `roadmap/60-multiagente/03-pasar-contexto-entre-agentes` (l. 96) | Fuerzan `tool_choice={"type":"tool","name":"entregar"}` con `claude-sonnet-5-5` → **400**. | Opciones: (a) en el último paso, llamar sin herramientas con `output_config.format` y el esquema de entrega; (b) dejar solo `entregar` disponible (con `tool_removal` a mitad de conversación o `defer_loading`) más una instrucción en un `system` de un solo turno; (c) usar un modelo que admita forzar (por ejemplo, Opus 5 o anteriores). (thinking §Tool choice) |
| `docs/herramientas/01-uso-de-herramientas` (§`tool_choice`, l. 223) y `glosario/tool-choice` | No advierten de la restricción. | Añadir la tabla de qué modelos aceptan `any` y `tool`. |
| `glosario/razonamiento-extendido` (l. 16), `glosario/esfuerzo` (l. 21), `radar/2026-08-25-razonamiento-adaptativo` | «`budget_tokens` es el modo antiguo». | Matizar: devuelve 400 en los modelos actuales. Añadir `display` (por defecto `omitted`), `between_tools` y los modelos donde no se puede desactivar. |
| `cursos/mcp-de-cero-a-servidor/01-que-resuelve-mcp` (l. 57 y 64–77) | Enseña el saludo `initialize` con `"protocolVersion": "2025-06-18"` y presenta *sampling* y *roots* como capacidades normales. | Revisión 2026-07-28: sin `initialize`; `_meta` en cada petición; `server/discover`; MRTR; *sampling*, *roots* y *logging* **deprecados**. Mantener el saludo antiguo solo como «versiones ≤2025-11-25». |
| `cursos/mcp-de-cero-a-servidor/02-usar-servidores-existentes` (l. 87–88), `docs/herramientas/02-mcp` (l. 136–137), `recetas/servidor-mcp-de-solo-lectura` (l. 167–168) | `ClientSession(...)` + `await sesion.initialize()`. | Sigue existiendo como vía de compatibilidad, pero la API de 2.x es `from mcp import Client; async with Client(StdioServerParameters(...)) as c:` (también acepta una URL o una instancia de `MCPServer` para tests) **[verificado]**. |
| `cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor` (l. 110–111 y 170), `docs/herramientas/02-mcp` (l. 57 y 89–90) | Importan desde `@modelcontextprotocol/sdk/server/mcp.js` y `/server/stdio.js` (línea v1). | Pasar a `@modelcontextprotocol/server` y `@modelcontextprotocol/server/stdio`, con `registerTool(name, {description, inputSchema: z.object(...)}, handler)` **[verificado]**. |
| `cursos/mcp-de-cero-a-servidor/04-seguridad-y-despliegue` (l. 107) | Autorización OAuth 2.1 sin las novedades. | Añadir: CIMD en lugar de DCR (deprecado), validar `iss` (RFC 9207), credenciales ligadas al emisor, `application_type` y las extensiones de autorización (Client Credentials, EMA). |
| `radar/2026-09-08-mcp-forma-estandar` | Anterior al cambio sin estado y sin gobernanza. | Actualizar o añadir una entrada nueva: MCP 2026-07-28, AAIF y registro en vista previa. |
| `cursos/agentes-de-codigo/02-contexto-del-repositorio` (l. 23) | «Distintas herramientas usan nombres distintos (`CLAUDE.md`, `AGENTS.md`…)». | Precisar: Claude Code lee `AGENTS.md` de forma nativa (v2.1.277 o posterior) cuando no hay `CLAUDE.md`. Para compartir un único fichero, `@AGENTS.md` dentro de `CLAUDE.md`. |
| `cursos/context-engineering/03-compactacion-y-memoria` y `docs/contexto/04-memoria` | Solo cubren la compactación en cliente. | Añadir la vía del proveedor: `compact_20260112` (beta), limpieza de contexto (`clear_tool_uses_20250919`, `clear_thinking_20251015`), la herramienta `memory_20250818` y `task_budget`. Conceptos sin cambios. |
| `docs/herramientas/03-herramientas-del-servidor` | Política de no copiar el tipo (correcta) pero sin los cambios de comportamiento. | Añadir: `allowed_callers` por defecto con código en `_20260209` y posteriores (filtrado dinámico, no apto para ZDR, ejecución gratuita); `pause_turn` con las mismas `tools`; turnos mixtos servidor y cliente → `stop_reason: tool_use`. |
| `docs/contexto/01-ventana-de-contexto` y `roadmap/00-fundamentos/03-ventana-de-contexto` | Remiten a la documentación (correcto). | Opcional: «hoy 1M por defecto en los modelos actuales, salida máxima de 128k; `model_context_window_exceeded`». |
| `modelos/05-elegir-modelo-por-tarea` | Tabla por niveles sin nombres. | Opcional: añadir la tabla de la familia 5.5 con valores por defecto de esfuerzo y razonamiento (fechada) y la recomendación oficial de empezar por Opus 5.5. |

---

## 4. Propuestas de contenido

> Rutas con el estilo del MAPA. Propongo un grupo nuevo, `docs/claude-code/`, y otro, `docs/estandares/`, porque hoy no existen. Para no solaparme con la investigación de prácticas (*harness* o *context engineering* como disciplina), estas páginas son **de referencia de primitivas**.

### docs/fundamentos
1. **`docs/fundamentos/05-versiones-de-api-y-sdks`** · «Versiones de la API y de los SDK» · referencia.
   - Cabecera `anthropic-version` y qué preserva una versión.
   - Cambios de 2026-10-21: sin `temperature`, `top_p` ni `top_k`; restricciones de `document` y `citations`.
   - SDK mayores y su versión mínima por lenguaje; `Authorization: Bearer`; una sola credencial.
   - `MessageParam` como unión por rol (Python y TS).
   - Lista de comprobación de migración.

   Fuentes: api/versioning, api/migration-2026-10-21.
2. **`docs/fundamentos/06-motivos-de-parada-y-rechazos`** · referencia.
   - Los 7 `stop_reason` (+ `compaction` en beta).
   - `refusal` + `stop_details.category` y su facturación.
   - `fallbacks` en servidor (`"default"` o lista) y el bloque `fallback`.
   - `BetaRefusalFallbackMiddleware` en el cliente.
   - Cómo lo trata un bucle agéntico.

   Fuentes: handling-stop-reasons, refusals-and-fallback.

### docs/prompting
3. **Ampliar `docs/prompting/04-razonamiento`**:
   - Las 4 formas de `thinking` y `display`.
   - Tabla por modelo de qué se puede desactivar.
   - Valores por defecto de `effort` y niveles admitidos.
   - Esfuerzo por mensaje.
   - Por qué no pedir el razonamiento en la salida (`reasoning_extraction`).

   Fuentes: thinking, effort, refusals-and-fallback.

### docs/herramientas
4. **`docs/herramientas/05-busqueda-y-carga-diferida`** · «Muchas herramientas sin llenar el contexto».
   - `defer_loading` y su efecto en la caché.
   - `tool_search_tool_{regex,bm25}_20251119`, `tool_reference` y sus límites.
   - Búsqueda propia (por ejemplo, con embeddings).
   - `defer_loading` en `mcp_toolset`.
   - Qué dejar sin diferir.

   Fuentes: tool-search-tool, tool-reference.
5. **`docs/herramientas/06-llamada-programatica`**.
   - Qué resuelve: menos idas y vueltas y resultados intermedios fuera del contexto.
   - `code_execution_20260120` o posterior y `allowed_callers`.
   - Formato de `caller` y respuesta con solo `tool_result` + `container`.
   - Límites (4 min, 90 s por celda, sin `strict` ni MCP).
   - No usar `allowed_callers` como barrera de seguridad.

   Fuente: programmatic-tool-calling.
6. **`docs/herramientas/07-mcp-desde-la-api`** · el conector.
   - `mcp_servers` + `mcp_toolset` (`default_config` y `configs`).
   - Cabeceras `2025-11-20` y `2026-09-15`.
   - Solo herramientas y solo HTTP.
   - Bloques `mcp_tool_use` y `mcp_tool_result`.
   - Túneles para servidores privados; ZDR.

   Fuente: mcp-connector.
7. **Actualizar `docs/herramientas/04-uso-del-ordenador`**:
   - Modelo de *toolset* de cliente (`computer_toolset_20260801`, `browser_toolset_20260801`), `configs`, `toolset_name` y acciones por lotes.
   - Restricciones (sin `strict`, sin llamada programática).

   Fuente: tool-reference §Client toolsets.

### docs/contexto
8. **`docs/contexto/05-compactacion-y-limpieza-en-el-servidor`** · referencia.
   - `compact_20260112` (umbral, `pause_after_compaction`, `instructions`, reenviar el bloque).
   - `clear_tool_uses_20250919` y `clear_thinking_20251015`.
   - Cuándo compactar y cuándo limpiar.
   - Interacción con `task_budget`.

   Fuentes: compaction-threshold, context-editing, task-budgets.
9. **`docs/contexto/06-mensajes-de-sistema-a-mitad-de-conversacion`**.
   - `role: "system"` en `messages`: reglas de posición y prioridad.
   - `clear_at: "next_user_message"`.
   - `tool_addition` y `tool_removal`.
   - Esfuerzo por mensaje.
   - Por qué mantienen la caché.

   Fuente: mid-conversation-system-messages.
10. **Ampliar `docs/contexto/02-prompt-caching`**:
    - Multiplicadores por modelo y mínimos (512 tokens o más).
    - Ventana de 20 bloques y precalentamiento con `max_tokens: 0`.
    - **Diagnóstico de caché** (`diagnostics`, `cache_miss_reason`).

    Fuentes: prompt-caching, cache-diagnostics.

### docs/agentes
11. **`docs/agentes/04-claude-agent-sdk`** · referencia.
    - `query` frente a `ClaudeSDKClient`.
    - Los campos de `ClaudeAgentOptions` que importan (`tools`, `allowed_tools` frente a `disallowed_tools`, `setting_sources`, `skills`, `permission_mode`).
    - `@tool` y `create_sdk_mcp_server`; hooks y `can_use_tool` (cuándo se llama cada uno).
    - Sesiones (`resume`, `fork`, `SessionStore`).
    - Licencia y marca.

    Fuentes: agent-sdk/{overview,python,typescript}; ejemplos verificados de §2.2.
12. **`docs/agentes/05-managed-agents`**.
    - Agente, entorno, sesión y eventos.
    - `agent_toolset_20260401` y políticas de permisos.
    - Sesiones (presupuestos, *outcomes*, interrupción).
    - Memoria y *dreams*, despliegues programados, *sandbox* autoalojado.
    - Precio ($0,08 por hora de sesión), ZDR, y cuándo usarlo frente al SDK o la API.

    Fuentes: managed-agents/*, pricing.

### docs/claude-code (grupo nuevo)
13. **`docs/claude-code/index`** · portadilla: las primitivas de Claude Code como *harness* configurable y cómo se reparten (memoria, *skills*, subagentes, hooks, permisos, plugins, *headless*).
14. **`docs/claude-code/01-claude-md-y-agents-md`**.
    - Jerarquía y orden de carga; importaciones `@` (4 saltos, aprobación externa).
    - `.claude/rules` con `paths`.
    - **`AGENTS.md` nativo** y sus modos.
    - Memoria automática (`MEMORY.md`, 200 líneas o 25 KB).
    - `claudeMdExcludes`.

    Fuente: memory.md.
15. **`docs/claude-code/02-skills`**.
    - Ubicaciones y precedencia; tabla de frontmatter.
    - Sustituciones y `` !`cmd` ``.
    - `context: fork`; límite de 1.536 caracteres.
    - Relación con el estándar Agent Skills (qué campos acepta la API).

    Fuentes: skills.md, agentskills.io/specification.
16. **`docs/claude-code/03-hooks`**.
    - Los 33 eventos (cuáles bloquean) y los 5 tipos.
    - JSON de entrada y salida; códigos 0, 2 y otros.
    - `permissionDecision` y `updatedInput`.
    - Precedencia frente a las reglas.
    - Ejemplo «bloquear `rm -rf`» y «formatear tras cada edición».

    Fuente: hooks.md.
17. **`docs/claude-code/04-subagentes-workflows-y-equipos`**.
    - Frontmatter de `.claude/agents`.
    - Subagentes integrados; anidamiento; segundo plano.
    - *Dynamic workflows* (`agent`, `pipeline`, `parallel`, límites).
    - Equipos de agentes (experimental); tabla de cuándo usar cada uno.

    Fuentes: sub-agents.md, workflows.md, agent-teams.md.
18. **`docs/claude-code/05-permisos-y-sandbox`**.
    - Sintaxis de reglas; deny → ask → allow; modos (incluidos `auto` y `dontAsk`).
    - *Sandbox* (Seatbelt, bubblewrap, claves `filesystem` y `network`, qué queda fuera).
    - La confianza en el espacio de trabajo y `-p`.

    Fuentes: permissions.md, sandboxing.md.
19. **`docs/claude-code/06-plugins-y-marketplaces`**.
    - Estructura de un plugin y `plugin.json`.
    - `validate`, `init`, `eval`.
    - `--plugin-dir` y `--plugin-url`; `marketplace.json`.
    - Espacios de nombres de *skills* y agentes.
    - Seguridad.

    Fuente: plugins/create.md.
20. **`docs/claude-code/07-modo-headless-y-ci`**.
    - `-p`, formatos de salida y `--json-schema`.
    - **`--bare`** y `--permission-prompts none`.
    - Eventos `system/init` y `api_retry`.
    - `/goal` en *headless*.
    - Riesgo de hooks y MCP del repositorio sin `--bare`.

    Fuentes: headless.md, goal.md.

### docs/estandares (grupo nuevo)
21. **`docs/estandares/01-mcp-2026-07-28`** · «MCP sin estado: qué cambia».
    - Sin `initialize`, con `_meta` y `server/discover`.
    - MRTR; `subscriptions/listen`; `ttlMs` y `cacheScope`.
    - Deprecaciones con 12 meses de soporte.
    - Migración de servidores con estado a *handles*.

    Fuentes: changelog 2026-07-28, blog MCP.
22. **`docs/estandares/02-extensiones-mcp`**.
    - Ciclo de vida de las extensiones; negociación.
    - Apps (`ui://`, iframe, hosts); Tasks (estados, `tasks/get` y `update`).
    - Server Cards; registro (vista previa).

    Fuentes: extensions/overview, apps, tasks, registry/about.
23. **`docs/estandares/03-a2a`**.
    - Agent Card (`/.well-known/agent-card.json`) y operaciones.
    - Estados de una tarea; *bindings* y `A2A-Version`.
    - Cuándo A2A y cuándo MCP; SDK.

    Fuente: `a2a-sdk` 1.3.0. **Verificar la especificación 1.0 antes de publicar.**
24. **`docs/estandares/04-agent-skills-y-agents-md`**.
    - Especificación de `SKILL.md` y divulgación progresiva.
    - `skills-ref`; quién la adopta.
    - AGENTS.md y su relación con `CLAUDE.md`.
    - Gobernanza en la AAIF.

    Fuentes: agentskills.io, post de donación, memory.md.

### patrones
25. **`patrones/10-ejecutor-y-asesor`** · tipo: workflow.
    - Patrón *advisor*: un modelo barato que consulta a uno capaz.
    - Cuándo compensa (horizonte largo) y cuándo no.
    - Implementación con `advisor_20260301`; coste y `usage.iterations`.
    - Variante casera sin la herramienta.

    Fuente: advisor-tool.

### recetas
26. **`recetas/entregar-resultado-sin-forzar-herramienta`** · herramientas, intermedio. El sustituto de `tool_choice` forzado en los modelos 5.5: `output_config.format` en el último paso o un `system` de un solo turno con `tool_removal`.
27. **`recetas/compactacion-en-el-servidor`** · contexto, intermedio. Bucle con `compact_20260112`, reenvío del bloque y `pause_after_compaction` para inyectar estado.
28. **`recetas/diagnosticar-fallos-de-cache`** · producción, inicial. `diagnostics.previous_message_id`, interpretación de `cache_miss_reason` y los cinco fallos típicos.
29. **`recetas/hook-que-bloquea-comandos-peligrosos`** · seguridad, inicial. Hook `PreToolUse` en `settings.json` y su equivalente en el Agent SDK, con prueba.
30. **`recetas/fallback-ante-rechazos`** · producción, intermedio. `fallbacks: "default"` frente a una lista, con *middleware* en el cliente.
31. **`recetas/servidor-mcp-sin-estado-con-handles`** · herramientas, intermedio. Un servidor que antes guardaba estado por sesión, migrado a un *handle* explícito (MCP 2026-07-28).
32. **`recetas/agente-con-claude-agent-sdk`** · agentes, inicial. El ejemplo verificado de §2.2 (Python y TS).

### glosario (términos nuevos)
`agent-skills`, `agents-md`, `a2a`, `agent-card`, `hook`, `carga-diferida` (`defer_loading`), `llamada-programatica`, `rechazo` (`refusal`), `fallback`, `mensaje-de-sistema-intermedio`, `presupuesto-de-tarea`, `mrtr`, `managed-agents`, `toolset`.

### radar (entradas fechadas)
- `radar/2026-11-03-api-2026-10-21-sin-temperatura`: qué rompe y qué hacer.
- `radar/2026-11-10-mcp-sin-estado`: especificación 2026-07-28 y SDK v2.
- `radar/2026-11-17-agent-skills-y-agents-md-en-la-aaif`: gobernanza abierta y AGENTS.md nativo en Claude Code.
- `radar/2026-11-24-familia-5-5`: valores por defecto de esfuerzo y razonamiento, sin forzar herramienta, 1M y 128k, Sonnet 4.5 se retira el 30 nov.

---

## 5. Fuentes (consultadas el 29 oct. 2026 salvo indicación)

**Plataforma Claude (platform.claude.com/docs)**
- https://platform.claude.com/docs/en/release-notes/overview.md (notas ene.–oct. 2026)
- https://platform.claude.com/docs/models/overview
- https://platform.claude.com/docs/en/about-claude/model-deprecations.md
- https://platform.claude.com/docs/en/api/versioning.md
- https://platform.claude.com/docs/en/api/migration-2026-10-21.md
- https://platform.claude.com/docs/en/build-with-claude/effort
- https://platform.claude.com/docs/en/build-with-claude/thinking
- https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- https://platform.claude.com/docs/en/build-with-claude/cache-diagnostics.md
- https://platform.claude.com/docs/en/build-with-claude/fast-mode
- https://platform.claude.com/docs/en/build-with-claude/compaction-threshold
- https://platform.claude.com/docs/en/build-with-claude/context-editing
- https://platform.claude.com/docs/build-with-claude/task-budgets
- https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages.md
- https://platform.claude.com/docs/en/build-with-claude/context-windows
- https://platform.claude.com/docs/en/build-with-claude/files
- https://platform.claude.com/docs/en/build-with-claude/batch-processing
- https://platform.claude.com/docs/en/build-with-claude/skills-guide
- https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback.md
- https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference.md
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming
- https://platform.claude.com/docs/en/agents-and-tools/mcp-connector
- https://platform.claude.com/docs/en/about-claude/pricing
- https://platform.claude.com/docs/en/api/php/beta/user_profiles
- https://platform.claude.com/docs/en/managed-agents/overview.md
- https://platform.claude.com/docs/en/managed-agents/quickstart
- https://platform.claude.com/docs/en/managed-agents/tools
- https://platform.claude.com/docs/en/managed-agents/sessions
- https://platform.claude.com/docs/en/managed-agents/dreams

**Claude Code y Agent SDK (code.claude.com/docs)**
- https://code.claude.com/docs/llms.txt
- https://code.claude.com/docs/en/agent-sdk.md
- https://code.claude.com/docs/en/hooks.md
- https://code.claude.com/docs/en/skills.md
- https://code.claude.com/docs/en/sub-agents.md
- https://code.claude.com/docs/en/memory.md
- https://code.claude.com/docs/en/permissions.md
- https://code.claude.com/docs/en/sandboxing.md
- https://code.claude.com/docs/en/headless.md
- https://code.claude.com/docs/en/workflows.md
- https://code.claude.com/docs/en/goal.md
- https://code.claude.com/docs/en/agent-teams.md
- https://code.claude.com/docs/en/output-styles.md
- https://code.claude.com/docs/en/checkpointing.md
- https://code.claude.com/docs/en/plugins/create.md
- https://code.claude.com/docs/en/whats-new/index.md

**Anthropic (noticias)**
- https://www.anthropic.com/news (índice, publicaciones de sep.–oct. 2026)
- https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation (22 oct. 2026)
- https://www.anthropic.com/claude-opus-5-5 (22 sep. 2026)

**MCP**
- https://modelcontextprotocol.io/specification/2026-07-28/changelog
- https://blog.modelcontextprotocol.io/posts/2026-07-28/ (28 jul. 2026)
- https://modelcontextprotocol.io/docs/extensions/overview.md
- https://modelcontextprotocol.io/extensions/apps/overview.md
- https://modelcontextprotocol.io/extensions/tasks/overview.md
- https://modelcontextprotocol.io/registry/about.md
- https://modelcontextprotocol.io/community/governance.md
- https://modelcontextprotocol.io/docs/2026-07-28/sdk.md
- https://modelcontextprotocol.io/llms.txt
- https://aaif.io/blog/mcp-2026-changes-the-rules (3 sep. 2026)

**Estándares y fundación**
- https://aaif.io/?p=1382 (web de la Agentic AI Foundation)
- https://agentskills.io
- https://agentskills.io/specification.md
- https://agentskills.io/clients.md (contenido no legible: se genera con JS)

**Secundarias (solo para orientarme; cada dato se contrastó con la fuente primaria)**
- https://www.orcarouter.ai/blog/claude-news-what-anthropic-shipped-in-october-2026
- https://af.net/cn/realtime/anthropic-launches-claude-fable-5-announces-model-retirements-and-self-hosted-agent-sandboxes/

**Registros de paquetes (consulta y descarga, 29 oct. 2026)**
- PyPI: `anthropic` (1.0.0: 20 ago.; 2.0.0: 21 oct.; 2.3.0: 23 oct. 2026), `claude-agent-sdk` (0.2.174: 24 oct.), `mcp` (2.0.0: 28 jul.; 2.3.0: 2 oct.), `a2a-sdk` (1.0.0: 20 abr.; 1.3.0: 27 oct.) → https://pypi.org/pypi/<paquete>/json
- npm: `@anthropic-ai/sdk` (1.0.0: 21 oct.; 1.3.0: 23 oct.), `@anthropic-ai/claude-agent-sdk` (0.3.312: 27 oct.), `@anthropic-ai/claude-code` (2.1.312: 27 oct.), `@modelcontextprotocol/server|client|core` (2.0.0: 27 jul.; 2.4.0: 23 oct.), `@modelcontextprotocol/sdk` (1.32.2: 23 oct.), `@modelcontextprotocol/ext-apps` (2.0.4), `@a2a-js/sdk` (1.0.0: 22 jul.; 1.3.0: 29 sep.)

**No accesibles en esta sesión** (fuera de la lista permitida o sin búsquedas restantes): a2a-protocol.org (todas sus rutas), agents.md, linuxfoundation.org, platform.claude.com/docs/en/docs_site_map.md.

**Artefactos de verificación** (scratchpad):
- `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-1a/ejemplos/agente_sdk.py`
- `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-1a/ejemplos/servidor_mcp.py`
- `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-1a/ts-agent/agente.ts`
- `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-1a/ts-agent/sdkcheck.ts`
- `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-1a/ts-mcp/servidor.ts`
- venv: `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-1a/venv`
