# Investigación 2 · Parte B — Infraestructura y modelos open source

> Para: MoreContext (morecontextai.com). Fecha de corte: **29 de octubre de 2026**.
> Alcance: modelos de pesos abiertos, inferencia local y autoalojada, APIs compatibles, embeddings y rerankers, bases vectoriales, ingesta, observabilidad, evals, guardrails y sandbox, agentes de código, MCP, interfaces y despliegue. Los frameworks de agentes (LangChain, LangGraph, LlamaIndex, CrewAI…) los cubre la parte A; aquí solo aparecen para conectar.

## Cómo se ha verificado (leer antes de usar el informe)

- **Fuentes primarias**: model cards y ficheros `LICENSE` en Hugging Face, documentación oficial (docs.ollama.com, docs.vllm.ai, qdrant.tech, docs.mistral.ai…), páginas de *releases* de GitHub y metadatos de **PyPI** (`https://pypi.org/pypi/<paquete>/json`) y **npm** (`npm view`).
- **Código ejecutado de verdad** en `tmp-2b/` (venv con Python 3.13.17; versiones exactas en `tmp-2b/versiones-verificadas.txt`):
  - Qdrant: búsqueda híbrida densa + *sparse* con RRF y BM25 sobre índice de texto, en modo embebido `:memory:` (`qdrant-client` 1.20.0). **Ejecutado.**
  - pgvector: SQL de HNSW, `halfvec`, `ef_search`, `iterative_scan` y búsqueda híbrida con `tsvector` + RRF, en **PGlite 0.5.13 (PostgreSQL 18.6) con pgvector 0.8.7**. **Ejecutado.**
  - LanceDB híbrida con `RRFReranker` y Chroma con filtros. **Ejecutados.**
  - PyMuPDF 2.0 `doc.to_markdown()`. **Ejecutado.**
  - promptfoo 0.125.1: `promptfoo validate` sobre la configuración del informe. **Válida.**
  - Ollama, vLLM, LangChain `ChatOllama`, Langfuse, Phoenix, DeepEval, RAGAS, Inspect AI: **verificados contra la API instalada** (importaciones, firmas, construcción de objetos). No había GPU ni servidor de modelos, así que **no se ha ejecutado ninguna inferencia real**.
- **Límite encontrado**: a mitad de la investigación se agotó el presupuesto de búsquedas web compartido entre agentes (200 por turno). A partir de ahí solo se pudieron abrir URLs ya vistas y consultar PyPI/npm. Lo que no se pudo confirmar por esa vía aparece como **SIN CONFIRMAR**. Si hace falta cerrarlo, basta con pedir una ronda de seguimiento.
- Las fechas de GitHub y Hugging Face suelen salir sin año («27 Oct»). Cuando el orden de las *releases* y las fechas de PyPI/npm lo dejan claro, se da por 2026.

---

## 1. Resumen ejecutivo

1. **Abierto no es lo mismo que Apache 2.0.** En octubre de 2026 conviven tres regímenes: licencias permisivas OSI (Qwen 3.5/3.6 y Qwen3.8-27B, Gemma 4, gpt-oss, Mistral Small 4, Granite 4.2, OLMo 3 con Apache 2.0; DeepSeek V4 y Phi-4 con MIT), **licencias «MIT modificadas» con umbrales de ingresos o restricciones a vender el modelo como servicio** (Kimi K3, GLM-5.3, Qwen3.8-2.4T «Qwen3.8-Max License», Mistral Large 4 «Ecosystem Open-Weight», Mistral Medium 3.5) y licencias comunitarias (Llama 4, MiniMax M3, cuya concesión base es **no comercial**). Hay que leer el `LICENSE` de cada repo: la etiqueta de la web del proveedor no siempre coincide (Mistral documenta GLM 5.3 como «MIT», pero el `LICENSE` de Hugging Face es una licencia propia).
2. **«Open weights» no es «open source AI».** Según la Open Source AI Definition de la OSI, hacen falta información de datos, código y parámetros. De lo revisado, solo **OLMo 3** (Ai2) publica datos, código y checkpoints con Apache 2.0. NVIDIA Nemotron 3 publica parte de los datos.
3. **Novedades jul.–oct. 2026 en modelos**: Qwen3.8 (27B denso Apache 2.0; 2.4T-A95B con licencia propia, ago.), Kimi K3 (2.8T-A104B, jul.), GLM-5.2/5.3 (sep.–oct.), DeepSeek V4.1-Flash-1017 (oct., MIT), Granite 4.2 (ago.), **Mistral Large 4 con pesos abiertos (29 oct.)**, Gemma 4 12B (jun.). **Llama 5: SIN CONFIRMAR.** Lo anuncian fuentes secundarias, pero no aparece en la organización `meta-llama` de Hugging Face, cuyo modelo más reciente sigue siendo Llama 4 (2025).
4. **El patrón dominante es MoE con pocos parámetros activos y contexto largo**: 35B-A3B, 26B-A4B, 119B-A6.5B, 284B-A13B… Ojo: **en memoria hay que cargar todos los parámetros**, no solo los activos. Además, casi todos traen razonamiento activado por defecto y lo controlan con parámetros que no coinciden entre familias (`enable_thinking`, `reasoning_effort` con valores `xhigh`/`max`/`none`, `think`).
5. **Ollama v0.40.12 (27 oct.)** expone tres APIs: la nativa `/api/chat`, la compatible con OpenAI `/v1` (chat, completions, responses sin estado, embeddings) y la **compatible con Anthropic `/v1/messages`**. Con esta última, el código de la web (SDK `anthropic`) funciona apuntando `base_url` a local, con lagunas: sin `tool_choice`, sin *prompt caching* y sin `count_tokens`.
6. **Las APIs compatibles con Anthropic se extienden**: Ollama, LM Studio 0.4.1, llama.cpp (`llama-server`), vLLM (con lagunas documentadas en el RFC #58647) y el router de SGLang 0.5.22. El formato OpenAI Chat Completions sigue siendo el denominador común, y LiteLLM 1.106.6 (MIT) traduce entre ambos.
7. **vLLM 0.32.0 (18 oct.)** es el servidor de referencia para GPU. El *tool calling* requiere `--enable-auto-tool-choice --tool-call-parser <parser>`, y el parser correcto lo da la *model card* (`qwen3_coder`, `mistral`, `openai`…). Cambios que rompen: Python ≥ 3.11 y **CORS cerrado por defecto**. **TGI está en modo mantenimiento y su repositorio se archivó el 21 de marzo de 2026.**
8. **llama.cpp pasa a versiones semánticas (v0.7.0, 15 oct.) y cambia el puerto por defecto de `llama-server` de 8080 a 9931** (las imágenes Docker mantienen 8080). Esto rompe tutoriales que asumen `localhost:8080`.
9. **Memoria**: pesos ≈ parámetros × bits por peso / 8, más KV cache, más margen. La cuenta cuadra con la realidad: Qwen3.6-27B en Q4_K_M (4,89 bpw según llama.cpp) da ≈ 16,5 GB, y Ollama anuncia 17 GB. El valor por defecto de `num_ctx` en Ollama es pequeño y su propia documentación se contradice (2048/4096/según VRAM), lo que produce **truncado silencioso**. Para agentes, Ollama recomienda al menos 64 000 tokens.
10. **RAG local verificado**: pgvector 0.8.7 (HNSW `m=16`, `ef_construction=64`, `ef_search=40` por defecto; `halfvec` indexa hasta 4000 dimensiones) más búsqueda híbrida con `tsvector('spanish')` y RRF en SQL. **Qdrant 1.20 (22 oct.) añade BM25 sobre el índice de texto del payload** (`TextQuery`), además del clásico denso + *sparse* con `RrfQuery(rrf=Rrf(k=60))`. En Chroma, la búsqueda híbrida es **solo de Chroma Cloud**.
11. **Observabilidad**: Langfuse va por el **SDK Python v5** (5.0.4, OpenTelemetry; `get_client`, `@observe`, `start_as_current_observation`, variable `LANGFUSE_BASE_URL`). Quien diga «SDK v3» está desfasado. **Phoenix tiene licencia Elastic 2.0**, que no es OSI aunque su README diga «open-source». Las convenciones GenAI de OpenTelemetry **se han movido a un repositorio propio** y `gen_ai.system` queda obsoleto en favor de `gen_ai.provider.name`.
12. **Evals**: promptfoo 0.125.1 (MIT; ahora «parte de OpenAI», sigue siendo open source), DeepEval 4.3.2 (`LLMTestCaseParams` pasa a llamarse `SingleTurnParams`; `deepeval set-ollama`), Inspect AI 0.3.286 (proveedores `ollama/`, `vllm/`, `sglang/`). Trampa: **RAGAS 0.4.3 (enero de 2026) no importa con `langchain-community` 0.4.x** y hay que fijar `<0.4`.
13. **MCP cambió en julio de 2026**: la revisión **2026-07-28** elimina la sesión (`server/discover` en lugar del *handshake* `initialize`) y depreca *roots*, *sampling* y *logging*. El SDK de TypeScript v2 se divide en `@modelcontextprotocol/server` y `@modelcontextprotocol/client` (2.4.0, Apache-2.0), y `@modelcontextprotocol/sdk` queda como línea 1.x de mantenimiento. Varias páginas de la web y el §8 de la guía necesitan revisión (ver §5).
14. **Agentes de código abiertos**: OpenCode (MIT), Codex CLI (Apache-2.0), Gemini CLI (Apache-2.0), Cline (Apache-2.0), Kilo Code CLI (MIT), Aider (Apache-2.0; última versión de febrero de 2026), OpenHands (MIT). `ollama launch {claude|codex|opencode}` los conecta a modelos locales. Hay que distinguir «fuente disponible» (Crush: FSL-1.1-MIT) de OSI, y tener en cuenta que **Claude Code es propietario**.
15. **Plataformas «abiertas» con trampa de licencia**: Open WebUI (BSD-3 más una cláusula que prohíbe quitar la marca por encima de 50 usuarios), n8n (Sustainable Use License, *fair-code*, no OSI), Restate server (BSL), Phoenix (ELv2), PyMuPDF (AGPL-3.0), pesos de marker (OpenRAIL-M modificada, gratis por debajo de 5 M$). Antes de recomendar «autoalójalo», hay que revisar la licencia.

---

## 2. Tablas

### 2.1 Modelos de pesos abiertos (vigentes a 29-10-2026)

Leyenda. **TC**: *tool calling* documentado. **Raz.**: razonamiento. «A» indica parámetros activos (MoE). Contextos y tamaños según la *model card* citada. No se dan benchmarks.

| Familia · versión (fecha) | Tamaños | Contexto | Licencia exacta | TC | Raz. (control) | Fuente |
|---|---|---|---|---|---|---|
| **Qwen 3.8** (ago. 2026) | 27B denso, multimodal (imagen y vídeo) · 2.4T-A95B MoE, solo texto | 27B: 262 144 nativo, hasta 1 M con YaRN | 27B: **Apache-2.0** · 2.4T-A95B: **«Qwen3.8-Max License»** (base MIT; más de 100 M MAU o 20 M$ de ingresos mensuales obliga a mostrar el nombre; negocios de «Model as a Service» o «AI Work Assistant» con más de 50 M$ en 12 meses necesitan licencia aparte) | Sí (*parser* `qwen3_coder`) | Activado por defecto; `enable_thinking`, `reasoning_effort` = `xhigh` (defecto) / `medium` / `low`; `preserve_thinking` | HF Qwen3.8-27B; LICENSE de 2.4T; repo QwenLM/Qwen3.8 |
| **Qwen 3.6** (abr. 2026) | 35B-A3B MoE · 27B denso; ambos con visión | 262 144 (hasta 1 010 000 con YaRN) | **Apache-2.0** | Sí (`qwen3_coder`) | Activado por defecto; `chat_template_kwargs: {"enable_thinking": false}`; sin `/think` oficial | HF Qwen3.6-35B-A3B |
| **Qwen 3.5** (feb.–mar. 2026) | 397B-A17B, 122B-A10B, 35B-A3B, 27B, 9B, 4B, 2B, 0.8B | 262 144 (hasta ~1 M) | **Apache-2.0** (verificado en 35B-A3B) | Sí | Igual que 3.6 | HF Qwen3.5-35B-A3B; QwenLM/Qwen3.8 (news) |
| **DeepSeek V4** (abr. 2026) | V4-Pro 1.6T-A49B · V4-Flash 284B-A13B (FP4 + FP8) | 1 M | **MIT** (repo y pesos) | Sí (V4.1: casos de prueba de *tool calling* en `encoding`) | Tres modos: Non-think, Think High y Think Max (con *prompt* de sistema especial) | HF DeepSeek-V4-Pro |
| **DeepSeek V4.1-Flash-1017** (oct. 2026) | 763B MoE | 1 M recomendado | **MIT** | Sí | Esfuerzo numérico; **sin plantilla Jinja**: formato con `encoding.py` o `deepseek-recipe` | HF DeepSeek-V4.1-Flash-1017 |
| **Llama 4** (abr. 2025) | Scout 17B-16E · Maverick 17B-128E | SIN CONFIRMAR en esta sesión | **Llama 4 Community License** («Built with Llama»; más de 700 M MAU obliga a pedir licencia) | Sí (*parsers* `llama4_pythonic`) | No | HF meta-llama; Llama-Guard-4 card |
| **Llama 5** | — | — | **SIN CONFIRMAR**: no aparece en HF `meta-llama` a 29-10-2026 | — | — | HF meta-llama (ausencia); solo fuentes secundarias |
| **Mistral Large 4** (API 6 oct.; pesos 29 oct. 2026) | ~1T MoE (repo «1T-A52B»; el blog de HF dice 49B activos: inconsistente) | 1 M | **Mistral Ecosystem Open-Weight License** (MIT modificada: ofrecerlo comercialmente como servicio exige licencia aparte; uso interno exento; **sin umbrales**) | Sí | `low`/`medium`/`high` (defecto `high`; no se puede desactivar) | LICENSE HF; blog HF «Le Chonk»; docs.mistral.ai |
| **Mistral Medium 3.5** (v26.04) | 128B | SIN CONFIRMAR | **Modified MIT**: sin derechos si tu empresa factura más de 20 M$ al mes | SIN CONFIRMAR | SIN CONFIRMAR | LICENSE HF |
| **Mistral Small 4** (v26.03) | 119B-A6.5B MoE (128 expertos, 4 activos), visión | 256k | **Apache 2.0** | Sí (`--tool-call-parser mistral`) | `reasoning_effort` = `"none"` / `"high"` | HF Mistral-Small-4-119B-2603 |
| Mistral Large 3 / Ministral 3 (dic. 2025) | 675B · 14B, 8B, 3B | — | **Apache 2.0** | — | — | docs.mistral.ai/models |
| *Devstral 2, Magistral 1.2* | — | — | Retirados de la API de Mistral (jul. 2026); los pesos siguen publicados pero están superados | — | — | docs.mistral.ai/models |
| **gpt-oss** (ago. 2025) | 120b (117B-A5.1B) · 20b (21B-A3.6B) | 128k | **Apache 2.0** + política de uso | Sí (*parser* `openai`; formato *harmony* obligatorio) | `low`/`medium`/`high` | openai.com/introducing-gpt-oss |
| **Gemma 4** (2 abr. 2026; 12B el 3 jun.) | E2B, E4B (con audio), 12B, 26B-A4B MoE (25.2B-A3.8B), 31B denso | 128K (E2B/E4B), 256K (resto) | **Apache 2.0** (cambio respecto a Gemma 3, que usaba los términos propios de Gemma) | Sí (nativo) | `<|think|>` en el *prompt* de sistema o `enable_thinking=True` | blog.google Gemma 4; HF gemma-4-26B-A4B-it |
| **Kimi K3** (jul. 2026) | 2.8T-A104B MoE (896 expertos) | 1 048 576 | **Kimi K3 License** (base MIT; MaaS con más de 20 M$ en 12 meses exige acuerdo; más de 100 M MAU o 20 M$ al mes obliga a mostrar «Kimi K3»; uso interno exento) | Sí (devolver `reasoning_content` y `tool_calls`) | **Siempre activo**; `reasoning_effort` = `low`/`high`/`max` (defecto `max`) | HF Kimi-K3 + LICENSE |
| Kimi K2.5 (ene. 2026) | 1T-A32B | 256K | **Modified MIT** | Sí (intercalado con razonamiento) | Activado / *instant* | HF Kimi-K2.5 |
| **GLM-5.3 / 5.3-Flash** (oct. 2026; 5.2 en sep.) | 753B · Flash 321B (con visión) | 1M (según docs de Mistral) | **GLM-5.3 License** (base MIT; MaaS con más de 10 000 M$ en 12 meses requiere revisión de seguridad de Z.ai) | SIN CONFIRMAR (no hay *parser* en la card) | `reasoning_effort` = `low`/`high`/`max` (defecto `max`); `clear_thinking` | HF GLM-5.3-BF16 + LICENSE |
| **MiniMax M3** (2026; fecha SIN CONFIRMAR) | ~428B-A23B, multimodal | 1M | **MiniMax Community License**: concesión **no comercial**; el uso comercial exige «Built with MiniMax M3» y aviso (o autorización si se superan 20 M$/año); usos prohibidos | SIN CONFIRMAR | `thinking` = `enabled`/`adaptive`/`disabled` | LICENSE HF; ficha Dell HF |
| MiniMax M2.5 | 229B | SIN CONFIRMAR | **Modified-MIT** | Sí | Sí | HF MiniMax-M2.5 |
| **Phi-4-reasoning-vision** (4 mar. 2026) | 15B | 16 384 | **MIT** | No documentado | Híbrido `<think>` / `<nothink>` | HF Phi-4-reasoning-vision-15B |
| **OLMo 3 / 3.1** (nov.–dic. 2025) | 7B y 32B (Base/Think/Instruct) | SIN CONFIRMAR | **Apache 2.0** + datos (Dolma 3, Dolci), código y checkpoints | No documentado (vLLM tiene *parser* `olmo3`) | Variantes Think | allenai.org/olmo; HF Olmo-3.1-32B-Think |
| **NVIDIA Nemotron 3** (Super: 11 mar. 2026) | Super 120B-A12B · Ultra 550B-A55B; híbrido Mamba-2 + MoE | Hasta 1M (256k por defecto) | **NVIDIA Nemotron Open Model License**; datos parcialmente públicos | Sí (`qwen3_coder`) | `enable_thinking`; `low_effort`; `--reasoning-parser nemotron_v3` | HF Nemotron-3-Super |
| **IBM Granite 4.2** (25 ago. 2026) | 3B, 8B, 30B densos | 128K (hasta 512K) | **Apache 2.0** | Sí (`qwen3_coder`) | Completo, sin razonamiento o *low-effort* | HF granite-4.2-8b |
| Otros nuevos (oct. 2026, vistos en notas de Ollama) | Flint (Recursive) 40B MoE ~2.5B activos, 262K, **Apache 2.0** · LFM3 (Liquid AI) · Nemotron 3.5 Bolt E4B (basado en Gemma 4) | — | Licencias de LFM3 y Bolt: SIN CONFIRMAR | — | — | github.com/ollama/ollama/releases |

### 2.2 Motores de inferencia

| Motor | Versión (fecha) | APIs | Licencia | Notas clave |
|---|---|---|---|---|
| **Ollama** | v0.40.12 (27 oct. 2026) | Nativa `/api/*`; OpenAI `/v1/chat/completions`, `/v1/completions`, `/v1/responses` (sin estado), `/v1/embeddings`, `/v1/models`, `/v1/audio/speech`; **Anthropic `/v1/messages`** | MIT (cliente Python/npm verificado; servidor MIT según el repo, SIN CONFIRMAR en esta sesión) | `ollama launch` para agentes de código; modelos `:cloud` que **no son locales** |
| **llama.cpp** (`llama-server`) | v0.7.0 (15 oct. 2026), primera estable con semver; *builds* `b11936` (27 oct.) | OpenAI chat/completions/responses/embeddings, Anthropic Messages, rerank, `/health` | MIT | **Puerto por defecto 9931** desde v0.7.0; `--jinja` activado por defecto; `-hf repo:quant` (Q4_K_M por defecto); servidores MCP stdio con `--mcp-servers-config`; caché de expertos MoE `--moe-cache-mib` |
| **vLLM** | 0.32.0 (18 oct. 2026) | OpenAI chat/completions/responses/embeddings/audio; Anthropic `/v1/messages` (con lagunas) | Apache-2.0 | Python ≥ 3.11; CORS cerrado por defecto (`--allowed-origins`); *parser* genérico `hf` |
| **SGLang** | 0.5.22 (PyPI 16 oct.; *release* 19 oct.) | OpenAI-compatible; el router Rust añade `/v1/messages` | Apache-2.0 | Soporte de Apple Silicon (PyTorch y MLX); `--tool-call-parser`, `--reasoning-parser` |
| **TGI** (Hugging Face) | Modo mantenimiento; **repo archivado el 21-03-2026** | — | Apache-2.0 | HF recomienda vLLM, SGLang, llama.cpp o MLX |
| **LM Studio** | 0.4.x (0.4.0: REST `/api/v1`; 0.4.1: Anthropic `/v1/messages`) | OpenAI-compatible (incluye `/v1/responses`), Anthropic, REST nativa | App propietaria y gratuita; SDK y CLI abiertos (términos actuales SIN CONFIRMAR) | `lms server start`; los ejemplos usan el puerto 1234 |
| **MLX / mlx-lm** (Apple) | mlx 0.32.4 (14 oct.), mlx-lm 0.32.2 (16 oct.) | `mlx_lm.server` compatible con OpenAI | MIT | Hay *issues* abiertos de parseo de *tool calls* (Gemma 4 #1096, Kimi #1262); existe `vllm-metal` 0.32.0 |
| llama-cpp-python | 0.3.36 (1 oct. 2026) | Bindings y servidor OpenAI | MIT | — |
| TokenSpeed · Docker Model Runner | tokenspeed 0.1.1 · `docker model run hf.co/<repo>` | OpenAI-compatible | SIN CONFIRMAR | Aparecen en las cards de Qwen3.8 y Kimi K3; vigilar |

### 2.3 Bases vectoriales y búsqueda

| Base | Versión | Licencia | Híbrida | Filtros / multitenencia | Cuándo |
|---|---|---|---|---|---|
| **pgvector** (Postgres) | 0.8.7 (verificada en PG 18.6) | PostgreSQL License (SIN CONFIRMAR en esta sesión; cliente `pgvector` MIT) | Sí, en SQL: `tsvector` + RRF (no hay operador nativo) | `WHERE` normal; índices parciales; particionado; `hnsw.iterative_scan` para filtros selectivos | Ya tienes Postgres, hasta varios millones de vectores, quieres transacciones y un solo sistema |
| **Qdrant** | servidor v1.20.0 (22 oct.), cliente 1.20.0 | Apache-2.0 | Sí: denso + *sparse* (IDF) + **BM25 sobre texto (1.20)**; fusión RRF (con `k` desde 1.16, ponderada desde 1.17) o DBSF | Filtros por payload; índice con `is_tenant=True` | Búsqueda dedicada con filtros ricos, multitenencia y modo embebido para pruebas |
| **Chroma** | 1.5.9 (mayo 2026) | Apache-2.0 | **Solo en Chroma Cloud** (Search API con `Rrf`) | `where`, `where_document` | Prototipos locales sencillos |
| **LanceDB** | 0.41.0 (29 oct.) | Apache-2.0 | Sí, local: FTS + vector con `RRFReranker` | `.where("…")` SQL | Embebido, sin servidor, datos en ficheros (Lance/Arrow) |
| **Weaviate** | 1.39 (27 ago.); cliente 4.24.1 | BSD-3 (cliente verificado) | Sí (`hybrid`, BM25, MMR) | Multitenencia nativa | Plataforma completa con módulos |
| **Milvus** | 3.0.x (docs); pymilvus 3.0.2 | Apache-2.0 | Sí: función BM25 que genera *sparse* + densa | Particiones y claves | Escala grande, despliegue distribuido |
| **Elasticsearch** | cliente 9.5.1 | Fuentes: AGPLv3 / SSPL / ELv2 · **binarios: solo ELv2** | Sí | Sí | Ya tienes Elastic |
| **OpenSearch** | cliente 3.2.0 (servidor SIN CONFIRMAR) | Apache-2.0 | Sí | Sí | Alternativa Apache a Elastic |

### 2.4 Observabilidad, evals, guardrails, sandbox, agentes de código, MCP y plataformas

| Herramienta | Versión (fecha) | Licencia | Para qué |
|---|---|---|---|
| **Langfuse** (SDK Python) | 5.0.4 (21 oct.) · JS `@langfuse/tracing` 6.0.2 | MIT (SDK). Servidor: MIT en el núcleo, partes «ee» comerciales (**SIN CONFIRMAR** en esta sesión) | Trazas, *prompts*, datasets y evals; autoalojable |
| **Arize Phoenix** | 20.26.1 (25 oct.) · `arize-phoenix-otel` 0.17.2 | **Elastic-2.0** (servidor) · Apache-2.0 (otel) | Trazas OpenInference/OTel y evals; `phoenix serve` |
| **OpenLLMetry** (`traceloop-sdk`) | 0.62.4 (29 sep.) | Apache-2.0 | Instrumentación OTel de LLMs y bases vectoriales |
| OTel GenAI semconv | `opentelemetry-semantic-conventions` 0.66b2; `opentelemetry-util-genai` 1.3b0 | Apache-2.0 | Atributos `gen_ai.*` (movidos a `semantic-conventions-genai`) |
| **promptfoo** | 0.125.1 (25 oct.) | MIT («parte de OpenAI») | Evals declarativas en YAML, comparación de modelos, *red teaming*, CI |
| **DeepEval** | 4.3.2 (27 oct.) | Apache-2.0 | Evals tipo pytest; métricas de agente (`TaskCompletionMetric`, `ToolCorrectnessMetric`) |
| **RAGAS** | 0.4.3 (13 ene. 2026) | Apache-2.0 | Métricas de RAG (`Faithfulness`, `ContextPrecision`…) y de agentes |
| **Inspect AI** (UK AISI) | 0.3.286 (28 oct.) | MIT | Evals reproducibles con *sandbox*, agentes y límites de tokens, tiempo y coste |
| lm-evaluation-harness | 0.4.13 (31 ago.) | MIT | Benchmarks académicos de modelos base, no de apps |
| OpenAI Evals (`evals`) | 3.0.1.post1 (may. 2024) | SIN CONFIRMAR | Sin publicaciones en PyPI desde 2024: no recomendar |
| **Llama Guard 4** | 12B (abr. 2025) | Llama 4 Community License | Clasificador de seguridad de entrada y salida (S1–S14, multimodal) |
| **Llama Prompt Guard 2** | 86M y 22M (abr. 2025) | Llama 4 Community License (SIN CONFIRMAR) | Detectar ataques de *prompt* |
| **gpt-oss-safeguard** | 120b y 20b (oct. 2025) | Apache 2.0 | Clasificación con **tu propia política**, con razonamiento |
| **NeMo Guardrails** | 0.24.1 (16 sep.) | Apache-2.0 | *Rails* programables (Colang, `config.yml`) |
| **Guardrails AI** | 0.11.0 (14 ago.) | Apache-2.0 | Validadores de salida (Hub) |
| **LLM Guard** | 0.3.16 (19 may. 2025) | MIT | Escáneres de entrada y salida. **Sin versiones en 17 meses y requiere Python < 3.13** |
| **Presidio** | 2.2.366 (27 oct.) | MIT | Detección y anonimización de datos personales |
| **e2b** (SDK) | 2.62.0 (28 oct.) | MIT (SDK); infraestructura autoalojable SIN CONFIRMAR | *Sandboxes* en la nube para código generado |
| **microsandbox** | 0.7.11 (24 oct.) | Apache-2.0 | MicroVMs (libkrun) locales desde imágenes OCI |
| **OpenCode** | `opencode-ai` 1.19.5 | MIT | Agente de código en terminal, cualquier proveedor |
| **Codex CLI** | `@openai/codex` 0.166.0 (29 oct.) | Apache-2.0 | Agente de código; `--oss` para modelos locales |
| **Gemini CLI** | 0.66.0 | Apache-2.0 | Agente de código de Google |
| **Cline** (CLI y extensión) | 3.0.74 | Apache-2.0 | Agente con MCP, *skills* y cualquier endpoint OpenAI-compatible |
| **Kilo Code CLI** | 7.8.18 | MIT | Agente de código |
| **Continue CLI** | 1.5.47 (jun. 2026) | Apache-2.0 | Menor actividad reciente |
| **Aider** | 0.86.2 (12 feb. 2026) | Apache-2.0 | Edición en git por terminal; requiere Python < 3.13 |
| **OpenHands** | 1.11.0 (9 jul.) | MIT | Agente de desarrollo con *sandbox* Docker |
| Qwen Code | 0.26.4 | SIN CONFIRMAR (no figura en npm) | Agente de código (Qwen) |
| Crush (Charm) | 0.99.0 | **FSL-1.1-MIT** (fuente disponible, no OSI) | Agente de terminal |
| Goose (Block) · Roo Code | — | **SIN CONFIRMAR** en esta sesión | — |
| **MCP SDK Python** | `mcp` 2.3.0 (2 oct.) | MIT | Protocolo 2026-07-28 por defecto |
| **MCP SDK TypeScript** | `@modelcontextprotocol/server` y `/client` 2.4.0; `/sdk` 1.32.2 (v1.x) | Apache-2.0 (v2) / MIT (v1) | v2 desde el 27-07-2026 |
| MCP Inspector | 2.13.0 | MIT + Apache-2.0 (en transición) | Web, `--cli` y `--tui` |
| **Open WebUI** | 0.12.5 (29 oct.) | **Open WebUI License** (BSD-3 + no quitar la marca por encima de 50 usuarios en 30 días + CLA) | Interfaz de chat autoalojada |
| **Langflow** | 1.13.0 (22 oct.) | MIT | Constructor visual de flujos |
| **Flowise** | 3.1.4 | Apache 2.0 (README) | Constructor visual |
| **n8n** | 2.45.6 | **Sustainable Use License** (solo uso interno o no comercial) + ficheros `.ee` con licencia enterprise | Automatización con nodos de IA |
| LibreChat · AnythingLLM · Dify | — | **SIN CONFIRMAR** en esta sesión | — |
| **Temporal** (SDK) | Py 1.35.0 · TS 1.25.0 | MIT | Ejecución duradera |
| **Restate** | servidor 1.8.1 · SDK TS 1.18.0 · Py 1.2.0 | **Servidor BSL** · SDK MIT | Ejecución duradera |
| **DBOS** | Py 3.4.0 · TS 5.4.0 | MIT | Ejecución duradera sobre Postgres |
| **Inngest** | SDK Py 0.5.19 · TS 4.26.1 | SDK Apache-2.0; servidor/CLI «ver LICENSE.md» (SIN CONFIRMAR) | Funciones duraderas por eventos |
| **KServe** | 0.21.0 (25 sep.) | Apache-2.0 | Servir modelos en Kubernetes |
| LiteLLM | 1.106.6 (28 oct.) | MIT (partes enterprise SIN CONFIRMAR) | SDK y proxy unificado OpenAI ⇄ 100+ proveedores, incluido `/v1/messages` |

---

## 3. Por tema

### 3.1 Modelos de pesos abiertos

**Qué es.** Un modelo de pesos abiertos publica los parámetros entrenados para descargarlos y ejecutarlos donde quieras. **No** implica que se publiquen los datos, el código de entrenamiento ni una licencia OSI.

**Datos técnicos que importan para construir agentes**
- **MoE**: el coste por token depende de los parámetros activos, pero **la memoria depende de los totales**. Qwen3.6-35B-A3B en Q4_K_M ocupa 24 GB en Ollama aunque solo activa unos 3B por token.
- **Arquitecturas híbridas**: Qwen 3.5/3.6 intercalan Gated DeltaNet y atención (en 35B-A3B, 10 de 40 capas tienen atención con puertas). Nemotron 3 intercala Mamba-2. *Deducción, no cifra publicada*: el KV cache crece solo en las capas de atención, así que el contexto largo ocupa menos memoria que en un transformer puro del mismo tamaño.
- **Razonamiento por defecto** y controles distintos según la familia:

| Familia | Cómo se apaga o regula |
|---|---|
| Qwen 3.5/3.6 | `chat_template_kwargs: {"enable_thinking": false}` |
| Qwen 3.8 | además `reasoning_effort` = `xhigh` / `medium` / `low` |
| Mistral Small 4 | `reasoning_effort` = `"none"` / `"high"` |
| Mistral Large 4 | `low` / `medium` / `high` (no se puede desactivar) |
| Kimi K3 | siempre activo; `low` / `high` / `max` |
| GLM-5.3 | `low` / `high` / `max` |
| gpt-oss | `low` / `medium` / `high` (frase en el *prompt* de sistema o `reasoning_effort`) |
| Gemma 4 | `<|think|>` en el *prompt* de sistema |
| Ollama (cualquiera) | `think: true/false/"low"…`; valores admitidos en `/api/show` → `thinking.values` |

- **Plantillas de chat**: DeepSeek V4 y V4.1 **no traen plantilla Jinja**. El formato se hace con `encoding.py` o `deepseek-recipe`, y servirlos bien depende del soporte específico del motor. gpt-oss exige el formato *harmony*.
- **Muestreo recomendado por la card**, no el de tu código de Claude: DeepSeek V4, temperatura 1.0 y top_p 1.0. Kimi K2.5, 1.0 y 0.95 en modo razonamiento, 0.6 en modo instantáneo. Mistral Small 4 con `high`, temperatura 0.7.

**Licencias: cómo leerlas.** Hay cuatro preguntas en este orden:
1. ¿Es OSI (Apache-2.0, MIT sin añadidos)?
2. ¿Hay umbral de usuarios o ingresos (Llama 4: 700 M MAU; Qwen3.8-Max y Kimi K3: atribución por encima de 100 M MAU o 20 M$ al mes; Mistral Medium 3.5: sin derechos por encima de 20 M$ al mes)?
3. ¿Hay restricción de «Model as a Service» (Mistral Large 4, Kimi K3, GLM-5.3, Qwen3.8-Max)? Suele excluir el uso interno y el modelo integrado en una función de tu producto.
4. ¿La concesión base es no comercial (MiniMax M3)?

**«Open weights» frente a «open source AI» (OSI).** La Open Source AI Definition de la OSI (versión 1.0, oct. 2024; *dato de conocimiento previo, no reabierto en esta sesión*) exige libertad de uso para cualquier fin y acceso a la información de datos, al código y a los parámetros. La OSI dice que los *open weights* «se quedan cortos» porque no dan el proceso de entrenamiento (cita recogida en la fuente secundaria intuitionlabs.ai, que enlaza opensource.org/ai/open-weights). Para la web, usa **«de pesos abiertos»** por defecto y reserva «open source» para casos como OLMo.

**Trampas**
- Fiarse de la etiqueta de la web del proveedor y no del `LICENSE` del repositorio.
- Confundir parámetros activos con memoria necesaria.
- Usar `temperature=0` con modelos de razonamiento cuya card recomienda 1.0.
- Dar por hecho que el razonamiento está desactivado: casi todos lo traen activado y consumen `max_tokens`.
- Los modelos `:cloud` de Ollama o los «Inference Providers» no son locales: cambian la privacidad.

**Fuentes**: ver §7.1.

### 3.2 Inferencia local y autoalojada

#### Ollama (v0.40.12)

**Qué es.** Un servidor local que descarga modelos (GGUF y MLX), gestiona la memoria y expone APIs nativa, OpenAI y Anthropic.

**Datos exactos**
- Comandos: `ollama pull <modelo>`, `ollama run <modelo>`, `ollama serve`, `ollama ps` (columnas `PROCESSOR` y `CONTEXT`), `ollama create <nombre> -f Modelfile`, `ollama launch {claude|codex|opencode|droid}`.
- `OLLAMA_HOST` (defecto `127.0.0.1:11434`; `0.0.0.0:11434` para exponerlo en red), `OLLAMA_CONTEXT_LENGTH`, `OLLAMA_KEEP_ALIVE` (5 min), `OLLAMA_NUM_PARALLEL` (1; la RAM crece con el producto de paralelo por contexto), `OLLAMA_MAX_LOADED_MODELS` (3 × número de GPU, o 3 en CPU), `OLLAMA_MAX_QUEUE` (512; después devuelve 503), `OLLAMA_FLASH_ATTENTION`, `OLLAMA_KV_CACHE_TYPE` (`f16` / `q8_0` / `q4_0`, requiere Flash Attention), `OLLAMA_MODELS`.
- **Contexto (inconsistente en su propia documentación)**: la página *Context length* dice que el defecto depende de la VRAM (menos de 24 GiB: 4k; de 24 a 48 GiB: 32k; 48 GiB o más: 256k). La FAQ dice `OLLAMA_CONTEXT_LENGTH` = 4096. La referencia del Modelfile dice `num_ctx` = 2048. **Comprueba siempre con `ollama ps`.** Para agentes, herramientas de código y búsqueda web recomiendan al menos 64 000.
- Por petición: `options: {"num_ctx": 32768}` en la API nativa. La API OpenAI no tiene campo de contexto, así que hay que crear un Modelfile con `PARAMETER num_ctx`.
- Instrucciones del Modelfile: `FROM`, `PARAMETER`, `TEMPLATE`, `SYSTEM`, `LICENSE`, `MESSAGE`, `REQUIRES`, `CAPABILITY`. Defectos: `temperature` 0.8, `top_k` 40, `top_p` 0.9, `min_p` 0.0, `num_predict` -1 (**sin límite**), `repeat_penalty` 1.0.
- **API OpenAI**: en `/v1/chat/completions` acepta `tools`, `response_format`, `reasoning_effort`, `stream_options.include_usage`. **No acepta `tool_choice`**, `logit_bias`, `n` ni imágenes por URL. `/v1/responses` no tiene estado (no acepta `previous_response_id`).
- **API Anthropic** (`/v1/messages`): mensajes, *streaming*, sistema, visión en base64, *tools*, *thinking* y `output_config.effort`. **No acepta** `count_tokens`, `tool_choice`, *prompt caching*, *batches*, citas ni documentos PDF. `budget_tokens` se acepta pero no se aplica, y los recuentos de tokens son aproximados.
- Salidas estructuradas: `format` con un JSON Schema en la API nativa; `response_format` en la OpenAI.
- Biblioteca de modelos (capacidades `tools`/`thinking`): `qwen3.6` (27b, 35b), `qwen3.8` (27b), `qwen3.5` (0.8b…122b), `gemma4` (e2b, e4b, 12b, 26b, 31b), `gpt-oss` (20b, 120b), `gpt-oss-safeguard`, `granite4.1-guardian`, y para embeddings `qwen3-embedding` (0.6b/4b/8b), `bge-m3`, `embeddinggemma`, `nomic-embed-text`, `mxbai-embed-large`.

**Snippet: tool calling por la API compatible con OpenAI** (*verificado contra `openai` 2.54.0; no se ha ejecutado contra un servidor*)

```python
# agente_ollama_openai.py
import json
from openai import OpenAI

MODEL = "qwen3.6:27b"                                     # una constante arriba
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")  # clave obligatoria, se ignora

def buscar_pedido(pedido_id: str) -> dict:
    return {"pedido_id": pedido_id, "estado": "enviado"}  # tu sistema real

TOOLS = [{"type": "function", "function": {
    "name": "buscar_pedido",
    "description": "Devuelve el estado de un pedido a partir de su identificador.",
    "parameters": {"type": "object",
                   "properties": {"pedido_id": {"type": "string", "description": "p. ej. A-123"}},
                   "required": ["pedido_id"]}}}]
FUNCIONES = {"buscar_pedido": buscar_pedido}

messages = [{"role": "system", "content": "Eres un agente de soporte. Usa herramientas cuando necesites datos."},
            {"role": "user", "content": "¿Cómo va mi pedido A-123?"}]
for paso in range(5):                                     # límite de pasos
    msg = client.chat.completions.create(model=MODEL, messages=messages, tools=TOOLS).choices[0].message
    if not msg.tool_calls:
        print(msg.content); break
    messages.append(msg.model_dump(exclude_none=True))
    for call in msg.tool_calls:
        try:
            resultado = FUNCIONES[call.function.name](**json.loads(call.function.arguments))
        except Exception as e:                            # JSON roto o herramienta inexistente
            resultado = {"error": str(e)}
        messages.append({"role": "tool", "tool_call_id": call.id,
                         "content": json.dumps(resultado, ensure_ascii=False)})
```

**Snippet: API nativa con el cliente `ollama` 0.6.3** (*firma de `Client.chat` verificada; `convert_function_to_tool` genera el esquema a partir del docstring, comprobado*)

```python
from ollama import chat

def buscar_pedido(pedido_id: str) -> str:
    """Devuelve el estado de un pedido.

    Args:
      pedido_id: Identificador del pedido, p. ej. A-123
    """
    return f"El pedido {pedido_id} está enviado"

messages = [{"role": "user", "content": "¿Cómo va mi pedido A-123?"}]
for paso in range(5):
    r = chat(model="qwen3.6:27b", messages=messages, tools=[buscar_pedido], think=False,
             options={"num_ctx": 32768})                  # contexto explícito
    messages.append(r.message)
    if not r.message.tool_calls:
        print(r.message.content); break
    for call in r.message.tool_calls:
        messages.append({"role": "tool", "tool_name": call.function.name,
                         "content": buscar_pedido(**call.function.arguments)})
```

**Snippet: salida estructurada con `format`**

```python
from ollama import chat
from pydantic import BaseModel

class Ticket(BaseModel):
    categoria: str
    urgente: bool

r = chat(model="qwen3.6:27b", messages=[{"role": "user", "content": "Clasifica: 'Me cobrasteis dos veces, lo necesito hoy'"}],
         format=Ticket.model_json_schema(), options={"temperature": 0})
ticket = Ticket.model_validate_json(r.message.content)   # valida siempre
```

**Snippet: LangChain `ChatOllama` con `create_agent`** (*`langchain` 1.4.7 y `langchain-ollama` 1.1.0; el agente se construye y compila a `CompiledStateGraph`, verificado*)

```python
from langchain.agents import create_agent
from langchain_ollama import ChatOllama

def buscar_pedido(pedido_id: str) -> str:
    """Devuelve el estado de un pedido a partir de su identificador."""
    return f"El pedido {pedido_id} está enviado"

llm = ChatOllama(model="qwen3.6:27b", num_ctx=32768, temperature=0, reasoning=False)
agente = create_agent(model=llm, tools=[buscar_pedido], system_prompt="Eres un agente de soporte.")
salida = agente.invoke({"messages": [{"role": "user", "content": "¿Cómo va mi pedido A-123?"}]})
print(salida["messages"][-1].content)
```

`ChatOllama.with_structured_output(schema, method="json_schema")` usa `json_schema` por defecto, y `bind_tools(..., tool_choice=...)` existe en LangChain. Pero Ollama no implementa `tool_choice` en su API OpenAI, así que **no confíes en forzar una herramienta**.

**Snippet: el código de la web (SDK `anthropic`) contra Ollama** (*según docs.ollama.com/api/anthropic-compatibility*)

```python
import anthropic
client = anthropic.Anthropic(base_url="http://localhost:11434", api_key="ollama")
r = client.messages.create(model="qwen3.6:27b", max_tokens=1024,
                           messages=[{"role": "user", "content": "Hola"}])
```

**Trampas de Ollama**
- Contexto por defecto pequeño, que **trunca en silencio** los *prompts* de agentes.
- `num_predict` = -1 genera sin límite si no pones `max_tokens`.
- Sin `tool_choice` ni en la API OpenAI ni en la Anthropic.
- Las etiquetas `:cloud` envían los datos a ollama.com.
- `OLLAMA_HOST=0.0.0.0` sin autenticación expone el servidor local, que no valida claves.
- Cuantizar el KV cache a `q4_0` ahorra memoria pero empeora la calidad. La documentación de llama.cpp avisa expresamente de que degrada el *tool calling*.

#### llama.cpp (`llama-server`)

**Datos exactos**
- Desde v0.7.0 (15 oct. 2026) el **puerto por defecto es 9931** (Docker conserva 8080). `--host` 127.0.0.1.
- `--jinja` activado por defecto (necesario para *tool calling*).
- `-hf usuario/modelo[:quant]` descarga de Hugging Face (Q4_K_M por defecto) e incluye el `mmproj` multimodal si existe.
- `-c/--ctx-size` (0 = el del modelo), `-ngl` (`auto` por defecto), `--reasoning-format`, `--api-key`, `-j/--json-schema`.
- `parallel_tool_calls: true` por petición (desactivado por defecto).
- Herramientas integradas con `--tools all` y servidores MCP con `--mcp-servers-config` (solo stdio).
- Cuantizaciones (bits por peso medidos en Llama-3.1-8B, README de `llama-quantize`): Q4_K_M 4,89 · IQ4_XS 4,46 · Q5_K_M 5,70 · Q6_K 6,56 · Q8_0 8,50 · F16 16,0.

```bash
llama-server -hf ggml-org/Qwen3.8-27B-GGUF:Q4_K_M -c 65536 --port 8080   # fija el puerto: el defecto ya no es 8080
```

**Trampas**: tutoriales con `localhost:8080`; plantillas sin soporte de herramientas (el *handler* genérico gasta más tokens); KV cache cuantizado agresivo.

#### vLLM 0.32.0

**Datos exactos**
- `pip install vllm` (Python ≥ 3.11, `transformers` entre 5.16.1 y 5.20).
- Endpoints: `/v1/chat/completions`, `/v1/completions`, `/v1/responses`, `/v1/embeddings`, `/v1/audio/transcriptions` y `/v1/messages` (Anthropic; el RFC #58647 enumera lagunas: `thinking` ignorado, `is_error` descartado, `x-api-key` no aceptado, errores sin formato Anthropic).
- *Tool calling*: `--enable-auto-tool-choice` (obligatorio) y `--tool-call-parser <nombre>`; `--chat-template` opcional. `tool_choice` admite `auto`, `required` (desde 0.8.3), `none` y una función concreta. Con `required` y con función concreta usa salidas estructuradas: «garantiza una llamada parseable, no una buena».
- *Parsers* (docs): `hermes`, `mistral`, `llama3_json`, `llama4_pythonic`, `pythonic`, `openai` (gpt-oss), `qwen3_xml`, `deepseek_v3`, `deepseek_v31`, `kimi_k2`, `glm45`, `glm47`, `granite`, `granite4`, `olmo3`, `hf` (genérico, nuevo en 0.32)… Las cards de Qwen, Nemotron y Granite usan `qwen3_coder`.
- Salidas estructuradas: `response_format` con `json_schema` o `extra_body={"structured_outputs": {"choice": [...]}}`.
- Cambios que rompen en 0.32: CORS cerrado por defecto (`--allowed-origins`) y `max_tokens` pasa a ser un tope de salida.

```bash
# Qwen3.6-35B-A3B con herramientas y razonamiento (flags de la model card)
vllm serve Qwen/Qwen3.6-35B-A3B --max-model-len 262144 \
  --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder

# Mistral Small 4 (flags de la model card)
vllm serve mistralai/Mistral-Small-4-119B-2603 --max-model-len 262144 --tensor-parallel-size 2 \
  --tool-call-parser mistral --enable-auto-tool-choice --reasoning-parser mistral

# gpt-oss-20b (parser "openai" según la documentación de tool calling)
vllm serve openai/gpt-oss-20b --enable-auto-tool-choice --tool-call-parser openai
```

El cliente es el mismo de Ollama cambiando `base_url="http://localhost:8000/v1"`.

**Trampas**: un *parser* equivocado devuelve las llamadas como texto; `--max-model-len` por encima de la memoria disponible hace fallar el arranque; los navegadores fallan por CORS desde 0.32.

#### SGLang, TGI, LM Studio y MLX
- **SGLang 0.5.22**: `python3 -m sglang.launch_server --model-path <repo> --host 0.0.0.0 --port 30000` (de las cards), con `--tool-call-parser` y `--reasoning-parser`. Funciona en Apple Silicon.
- **TGI**: no recomendar para proyectos nuevos (archivado).
- **LM Studio**: aplicación de escritorio. `lms server start`; OpenAI-compatible (con `/v1/responses`), Anthropic `/v1/messages` desde 0.4.1 y REST `/api/v1` desde 0.4.0. Autenticación opcional con `x-api-key` o `Bearer`. **La aplicación no es open source.**
- **MLX** (Mac): `mlx-lm` 0.32.2 con `mlx_lm.server`. Hay *issues* abiertos de parseo de herramientas en Gemma 4 y Kimi: prueba antes de usarlo en un agente.

#### Regla práctica de memoria (con fuente)
- **Pesos** ≈ parámetros × bits por peso / 8. NVIDIA: «7B * sizeof(FP16) ~= 14 GB». Comprobación cruzada: Qwen3.6-27B × 4,89 bpw / 8 ≈ 16,5 GB, y Ollama anuncia 17 GB para `27b-q4_K_M` (Q8_0: 28,7 GB calculados frente a 30 GB; BF16: 54 GB frente a 56 GB). La diferencia corresponde a la visión, la tabla de embeddings y los metadatos.
- **KV cache por token** = 2 × capas × (cabezas × dim. de cabeza) × bytes. NVIDIA calcula para Llama 2 7B con batch 1 y 4096 tokens en FP16 unos 2 GB. Con GQA, usa `num_key_value_heads` del `config.json` en vez de las cabezas totales (*ajuste propio*). Multiplica por usuarios en paralelo (`OLLAMA_NUM_PARALLEL`).
- **MoE**: cuenta los parámetros totales. llama.cpp v0.7.0 permite dejar expertos en RAM de la CPU con `--moe-cache-mib`.
- **Margen**: deja de 1 a 2 GB más activaciones y no cuentes con toda la VRAM (vLLM usa `--gpu-memory-utilization`). *Margen orientativo, no cifra con fuente.*

### 3.3 Compatibilidad de APIs

- **Estándar de facto**: OpenAI Chat Completions (todos los motores) y cada vez más Responses (Ollama sin estado, vLLM, llama.cpp, LM Studio).
- **Anthropic Messages en local**: Ollama, LM Studio 0.4.1, llama.cpp, vLLM y el router de SGLang. Para MoreContext significa que **los ejemplos con el SDK `anthropic` pueden ejecutarse contra un modelo local cambiando `base_url`**, sabiendo que *prompt caching*, `count_tokens` y `tool_choice` no se garantizan y que el *tool use* depende del modelo.
- **LiteLLM 1.106.6** (MIT): SDK `completion(model="ollama_chat/qwen3.6:27b", api_base="http://localhost:11434", …)` con proveedores `ollama`, `ollama_chat`, `hosted_vllm`, `vllm`, `lm_studio` y `llamafile` (verificados en `litellm.provider_list`). El proxy (`litellm --model …`, puerto 4000) enruta `/v1/messages` y el SDK expone `litellm.anthropic.messages`. Así se puede servir Claude Code, Codex u OpenCode contra cualquier backend.
- **Trampa**: «compatible» casi nunca significa «idéntico». Cambian los campos no soportados (`tool_choice`, `logprobs`, `n`), el *streaming* de errores, el formato del razonamiento (`reasoning_content`, `thinking`, `reasoning`) y los recuentos de `usage`.

### 3.4 Embeddings y rerankers abiertos

**Modelos** (licencias de modelos sin reabrir en HF en esta sesión salvo indicación)

| Modelo | Tamaño · contexto · dims | Licencia | Notas | Fuente verificada |
|---|---|---|---|---|
| **Qwen3-Embedding** 0.6B / 4B / 8B | 32K–40K; hasta 4096 dims (8B), dimensión elegible de 32 a 4096 | Apache 2.0 (SIN CONFIRMAR en esta sesión) | Más de 100 idiomas; instrucciones por tarea; hay Qwen3-Reranker | ollama.com/library/qwen3-embedding |
| **bge-m3** (BAAI) | 567M; 8192 tokens | MIT (SIN CONFIRMAR en la card; el código FlagEmbedding es MIT) | Denso, *sparse* y multivector en un modelo | ollama.com/library/bge-m3; README FlagEmbedding |
| **EmbeddingGemma** | ~300M; 2K | SIN CONFIRMAR (Gemma 3 usaba términos propios; Gemma 4 es Apache) | Requiere Ollama ≥ 0.11.10; **EmbeddingGemma 2** ya está soportado en vLLM 0.32 y llama.cpp v0.7.0 | ollama.com/library/embeddinggemma |
| **nomic-embed-text** v1.5 (v2-moe no está en Ollama) | 137M; 2K | Apache 2.0 (SIN CONFIRMAR) | — | ollama.com/library/nomic-embed-text |
| mxbai-embed-large | 335M | Apache 2.0 (SIN CONFIRMAR) | — | ollama.com/library |
| **Jina embeddings** | — | SIN CONFIRMAR (las v3/v4 históricamente CC BY-NC: comprobar antes de recomendar) | — | — |
| **bge-reranker-v2-m3** | multilingüe, ligero | SIN CONFIRMAR | Cross-encoder | README FlagEmbedding |
| **mxbai-rerank** base-v2 (0.5B) / large-v2 (1.5B) | — | Apache 2.0 (paquete `mxbai-rerank` 0.1.6) | `MxbaiRerankV2(...).rank(query=, documents=)` | PyPI mxbai-rerank |
| ColBERT / PyLate | — | PyLate 1.6.0 MIT | `models.ColBERT`, índice `indexes.PLAID` (FastPLAID) | PyPI pylate |

**sentence-transformers 6.2.0** (21 oct. 2026, Apache-2.0). API verificada en el wheel:
- `SentenceTransformer(...).encode_query(...)`, `.encode_document(...)`, `.similarity(a, b)` y `truncate_dim` (Matryoshka).
- `CrossEncoder("…").predict(pares)` y `.rank(query, passages, return_documents=True)`.
- `SparseEncoder("naver/splade-…")` (SPLADE) con `.encode_query` y `.encode_document`.
- **Nuevo**: `MultiVectorEncoder("lightonai/GTE-ModernColBERT-v1")` para *late interaction* (MaxSim) dentro de sentence-transformers.

**MTEB con criterio** (`mteb` 2.26.30, Apache-2.0; leaderboard en huggingface.co/spaces/mteb/leaderboard):
1. Filtra por **tu idioma** (español o multilingüe) y por **tarea de recuperación**, no por la media global.
2. Mira tamaño, dimensiones y contexto: afectan al coste del índice y a la latencia.
3. Desconfía de los primeros puestos con diferencias pequeñas: pueden estar sobreajustados a los conjuntos públicos.
4. **Evalúa con tus datos**: `mteb.evaluate(model, tasks=…)` o, mejor, recall@k con tus preguntas reales.

### 3.5 Bases vectoriales y búsqueda

#### pgvector 0.8.7

**Datos exactos (README)**
- `CREATE EXTENSION vector;`
- Clases de operadores HNSW: `vector_l2_ops`, `vector_ip_ops` y `vector_cosine_ops`.
- HNSW: `m` 16 y `ef_construction` 64 por defecto; `SET hnsw.ef_search = 100` (defecto 40).
- IVFFlat: `lists` = filas / 1000 hasta 1 M de filas y √filas por encima; `ivfflat.probes` 1 por defecto (empieza por √lists). Crea el índice **después** de cargar datos.
- Límites de dimensiones indexables: `vector` 2000, `halfvec` 4000 (el tipo admite 16 000), `bit` 64 000, `sparsevec` 1000 no nulos.
- `SET hnsw.iterative_scan = strict_order | relaxed_order` para filtros selectivos.
- Versiones: 0.8.2 (feb. 2026) a 0.8.6 (29 jul. 2026) corrigen corrupción y desbordamientos en *vacuum* de HNSW y en la construcción de IVFFlat. **Actualiza.**

**Snippet verificado (ejecutado en PGlite: PostgreSQL 18.6 con pgvector 0.8.7)**

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE fragmentos (
  id bigserial PRIMARY KEY,
  tenant_id text NOT NULL,
  contenido text NOT NULL,
  embedding vector(1024) NOT NULL,              -- la dimensión de tu modelo
  tsv tsvector GENERATED ALWAYS AS (to_tsvector('spanish', contenido)) STORED
);
CREATE INDEX ON fragmentos USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX ON fragmentos USING gin (tsv);
CREATE INDEX ON fragmentos (tenant_id);

SET hnsw.ef_search = 100;
SET hnsw.iterative_scan = relaxed_order;        -- mejor recall con filtros selectivos

-- Búsqueda híbrida: semántica + léxica fusionadas con RRF (k = 60)
WITH semantica AS (
  SELECT id, RANK() OVER (ORDER BY embedding <=> $1::vector) AS rk
  FROM fragmentos WHERE tenant_id = $3
  ORDER BY embedding <=> $1::vector LIMIT 20
),
lexica AS (
  SELECT id, RANK() OVER (ORDER BY ts_rank_cd(tsv, q) DESC) AS rk
  FROM fragmentos, websearch_to_tsquery('spanish', $2) q
  WHERE tenant_id = $3 AND tsv @@ q
  ORDER BY ts_rank_cd(tsv, q) DESC LIMIT 20
)
SELECT f.id, f.contenido,
       COALESCE(1.0 / (60 + s.rk), 0) + COALESCE(1.0 / (60 + l.rk), 0) AS rrf
FROM semantica s FULL OUTER JOIN lexica l USING (id) JOIN fragmentos f USING (id)
ORDER BY rrf DESC LIMIT 5;

-- halfvec: índice en media precisión sobre la misma columna
CREATE INDEX ON fragmentos USING hnsw ((embedding::halfvec(1024)) halfvec_cosine_ops);
-- y la consulta debe usar la misma expresión: ORDER BY embedding::halfvec(1024) <=> $1::halfvec(1024)
```

```text
# salida real (datos de juguete, 3 dims)
id 1 · 'Política de devoluciones: tienes 30 días…' · rrf 0.0328
id 3 · 'Cómo solicitar un reembolso de un pedido' · rrf 0.0161
id 2 · 'Horario del servicio de soporte técnico'  · rrf 0.0159
```

Desde Python (`psycopg` 3.3.6 + `pgvector` 0.5.1, verificado): `from pgvector.psycopg import register_vector`, `register_vector(conn)` **después** de `CREATE EXTENSION`, y vectores como `numpy.array`. Script completo en `tmp-2b/ejemplos/pgvector_psycopg.py`.

**Trampas**
- Con tablas pequeñas Postgres hace *seq scan* y no usa el índice (normal; compruébalo con `EXPLAIN` sobre datos reales).
- El filtro se aplica **después** del índice aproximado: sin `iterative_scan`, un filtro muy selectivo devuelve menos de `LIMIT` filas.
- El índice `halfvec` solo se usa si la consulta repite la misma expresión de *cast*.
- Usa la configuración `'spanish'` de `to_tsvector`, no `'english'`.

#### Qdrant 1.20

**Snippet verificado (ejecutado en modo local `:memory:` con `qdrant-client` 1.20.0)**

```python
from qdrant_client import QdrantClient, models

client = QdrantClient(":memory:")     # en producción: QdrantClient(url="http://localhost:6333")
client.create_collection(
    collection_name="docs",
    vectors_config={"densa": models.VectorParams(size=1024, distance=models.Distance.COSINE)},
    sparse_vectors_config={"bm25": models.SparseVectorParams(modifier=models.Modifier.IDF)},
)
# multitenencia: índice de payload marcado como tenant (sin efecto en modo local)
client.create_payload_index("docs", field_name="tenant_id",
    field_schema=models.KeywordIndexParams(type=models.KeywordIndexType.KEYWORD, is_tenant=True))

filtro = models.Filter(must=[models.FieldCondition(key="tenant_id", match=models.MatchValue(value="acme"))])
res = client.query_points(
    collection_name="docs",
    prefetch=[
        models.Prefetch(query=vector_denso, using="densa", limit=20, filter=filtro),
        models.Prefetch(query=models.SparseVector(indices=ids, values=pesos), using="bm25", limit=20, filter=filtro),
    ],
    query=models.RrfQuery(rrf=models.Rrf(k=60)),   # o models.FusionQuery(fusion=models.Fusion.RRF)
    limit=10, with_payload=True,
)
```

**Novedad 1.20 (servidor ≥ 1.20, 22-10-2026): BM25 sobre el texto del payload, sin vectores *sparse***. Verificado en local:

```python
client.create_payload_index("docs", field_name="texto",
    field_schema=models.TextIndexParams(type=models.TextIndexType.TEXT,
        tokenizer=models.TokenizerType.WORD, lowercase=True, scoring=True))   # scoring=True activa BM25
res = client.query_points("docs",
    prefetch=[models.Prefetch(query=vector_denso, using="densa", limit=20),
              models.Prefetch(query=models.TextQuery(text="devoluciones"), using="texto", limit=20)],
    query=models.RrfQuery(rrf=models.Rrf(k=60)), limit=5)
```

- Versiones mínimas (docs): *prefetch* con RRF desde 1.10, DBSF desde 1.11, `k` de RRF desde 1.16, RRF ponderado (`Rrf(weights=[3.0, 1.0])`) desde 1.17. La documentación recomienda no tocar los pesos sin un conjunto de evaluación.
- **Trampas**: en modo local los índices de payload no tienen efecto (salvo los de texto con `scoring`); `Modifier.IDF` es necesario para que el *sparse* se comporte como BM25; cliente y servidor deben ir alineados en versión.

#### Chroma, LanceDB, Weaviate, Milvus y Elastic/OpenSearch
- **Chroma 1.5.9** (verificado): `EphemeralClient()` o `PersistentClient(path)`, `get_or_create_collection(name, metadata={"hnsw:space": "cosine"})` y `query(query_embeddings=…, n_results=…, where={…}, where_document={"$contains": …})`. La Search API híbrida (`Search`, `Knn`, `Rrf`) existe en el cliente, pero «**Search API is available in Chroma Cloud only**».
- **LanceDB 0.41.0** (verificado):
  ```python
  t.create_index("texto", config=FTS())   # create_fts_index está obsoleto desde 0.25
  t.search(query_type="hybrid").vector(v).text("devoluciones").where("tenant = 'acme'").rerank(RRFReranker()).limit(5).to_list()
  ```
  Imports: `from lancedb.index import FTS` y `from lancedb.rerankers import RRFReranker`.
- **Weaviate 1.39**: `hybrid` con BM25, *boost*, MMR, cuantización rotacional de 4 bits y una API REST de búsqueda experimental.
- **Milvus 3.0**: `Function(function_type=FunctionType.BM25)` convierte texto a *sparse* automáticamente (snippet en milvus.io/docs/full-text-search).
- **Elasticsearch**: binarios solo con ELv2. **OpenSearch**: Apache-2.0.

**Cuándo cada una (criterio)**
- ¿Ya tienes Postgres y menos de unos millones de fragmentos? → **pgvector**.
- ¿Necesitas filtros ricos, multitenencia y una base dedicada? → **Qdrant**.
- ¿Sin servidor y embebida? → **LanceDB**.
- ¿Prototipo en un notebook? → **Chroma**.
- ¿Escala muy grande y distribuida? → **Milvus**.
- ¿Ya tienes Elastic u OpenSearch? → úsalo.

*Criterio editorial sin benchmarks.*

### 3.6 Ingesta de documentos

| Herramienta | Versión | Licencia | Qué hace | API mínima |
|---|---|---|---|---|
| **Docling** (LF AI & Data) | 2.145.0 (29 oct.) | Código MIT; modelos con sus licencias | PDF (maquetación, orden de lectura, tablas, fórmulas), DOCX, PPTX, HTML e imágenes; OCR; VLM GraniteDocling; servidor MCP y `docling-serve` | `DocumentConverter().convert(src).document.export_to_markdown()` · CLI `docling <url>` · `--pipeline vlm --vlm-model granite_docling` |
| **Unstructured** | 0.27.35 | Apache-2.0 | Particionado multiformato | `from unstructured.partition.auto import partition` (conocimiento previo) |
| **marker** | 2.1.0 | Código Apache-2.0; **pesos OpenRAIL-M modificada** (gratis en investigación, uso personal y *startups* por debajo de 5 M$) | PDF a Markdown/JSON con modelos | — |
| **PyMuPDF** | 2.0 (19 oct.) | **AGPL-3.0 o comercial** | **Desde 2.0 incluye el código de 4llm**: `pymupdf.open(p).to_markdown()`, `to_json()`, `find_tables()`, OCR con Tesseract; `pymupdf4llm` 2.0 queda como paquete puente vacío | Verificado: `doc.to_markdown()` |
| **MinerU** | 4.1.2 (29 oct.) | **MinerU Open Source License** (Apache 2.0 con condiciones adicionales) | PDF complejos, tablas y fórmulas | — |

**Trampas**: la AGPL de PyMuPDF obliga a publicar el código si ofreces el servicio por red; los pesos de marker tienen límite comercial; los PDF escaneados necesitan OCR (Docling y PyMuPDF lo traen); las tablas grandes rinden mejor exportadas como Markdown o HTML por tabla, no aplanadas. Para fragmentar, mira la receta existente `recetas/trocear-documentos`.

### 3.7 Observabilidad

**Langfuse (SDK Python v5, basado en OpenTelemetry)**. API verificada en 5.0.4:
- `get_client()`, decorador `@observe(as_type=…)` y `start_as_current_observation(as_type=…, name=…, model=…)`.
- Tipos de observación: `span`, `generation`, `embedding`, `agent`, `tool`, `chain`, `retriever`, `evaluator`, `guardrail`.
- `propagate_attributes(user_id=, session_id=, tags=, …)` y el envoltorio `from langfuse.openai import OpenAI`.
- Constructor `Langfuse(base_url=…, host=…, …)`; README con `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` y `LANGFUSE_BASE_URL`.
- El cliente v2 (`trace()`, `span()`) está obsoleto.

```python
# trazas_langfuse.py  (construcción verificada con LANGFUSE_TRACING_ENABLED=false)
from langfuse import get_client, observe, propagate_attributes
from langfuse.openai import OpenAI            # cada llamada queda como "generation"

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

@observe(as_type="tool")
def buscar_pedido(pedido_id: str) -> dict:
    return {"pedido_id": pedido_id, "estado": "enviado"}

@observe(as_type="agent")
def agente(pregunta: str) -> str:
    with propagate_attributes(session_id="sesion-42", user_id="usuario-7", tags=["local"]):
        r = client.chat.completions.create(model="qwen3.6:27b", messages=[{"role": "user", "content": pregunta}])
        return r.choices[0].message.content

agente("¿Cómo va mi pedido A-123?")
get_client().flush()                           # en scripts cortos
```

Servidor autoalojado: requisitos (Postgres, ClickHouse, Redis, almacenamiento S3) y licencia exacta **SIN CONFIRMAR** en esta sesión (repo no accesible).

**Arize Phoenix** (servidor 20.26.1, **ELv2**). Arranque con `phoenix serve` o `uvx arize-phoenix serve`, imagen Docker `arizephoenix/phoenix` o Helm; UI y colector en `http://localhost:6006`. Instrumentación verificada:

```python
from phoenix.otel import register
tracer_provider = register(project_name="agente-local", endpoint="http://localhost:6006/v1/traces",
                           auto_instrument=True)   # necesita openinference-instrumentation-openai instalado
tracer = tracer_provider.get_tracer(__name__)

@tracer.agent                                  # también .tool, .chain y .llm
def agente(pregunta: str) -> str: ...
```

`register()` usa `SimpleSpanProcessor` por defecto y avisa de que en producción conviene `batch=True`. Variables: `PHOENIX_COLLECTOR_ENDPOINT`, `PHOENIX_PROJECT_NAME`, `PHOENIX_API_KEY`. Hay instrumentadores OpenInference para OpenAI, Anthropic, LangChain/LangGraph, LlamaIndex, LiteLLM, **Ollama**, CrewAI, smolagents y otros.

**OpenLLMetry** (`traceloop-sdk` 0.62.4): instrumentadores OTel, incluidos `opentelemetry-instrumentation-chromadb` y `-lancedb`. Inicialización con `Traceloop.init(...)` (conocimiento previo).

**Convenciones GenAI de OpenTelemetry** (verificado en `opentelemetry-semantic-conventions` 0.66b2):
- Las definiciones se marcan como «Moved to the OpenTelemetry GenAI semantic conventions repository» (`open-telemetry/semantic-conventions-genai`).
- **`gen_ai.system` queda obsoleto, sustituido por `gen_ai.provider.name`.**
- Atributos útiles para agentes: `gen_ai.operation.name` (valores `chat`, `generate_content`, `text_completion`, `embeddings`, `retrieval`, `create_agent`, `invoke_agent`, `execute_tool`, `invoke_workflow`), `gen_ai.request.model`, `gen_ai.response.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.usage.cache_read.input_tokens`, `gen_ai.usage.cache_creation.input_tokens`, `gen_ai.tool.name`, `gen_ai.tool.call.id`, `gen_ai.agent.name`, `gen_ai.conversation.id`, `gen_ai.input.messages`, `gen_ai.output.messages` y `gen_ai.system_instructions`.

**Cómo instrumentar un agente (receta conceptual)**: un *span* `invoke_agent` raíz por petición; hijos `chat` por cada llamada al modelo (con `usage` y `stop_reason`/`finish_reason`) y `execute_tool` por herramienta (nombre, argumentos recortados, error); `conversation.id` para agrupar sesiones. Exporta por OTLP a Langfuse o Phoenix. Encaja con lo que ya enseñan `roadmap/100-produccion/01-observabilidad-y-trazas` y `docs/produccion/01-observabilidad`.

### 3.8 Evals

**Cuál para qué**

| Necesidad | Herramienta |
|---|---|
| Comparar *prompts* y modelos en YAML, sin código, y meterlo en CI; *red teaming* | promptfoo |
| Tests de app al estilo pytest con jueces y métricas de agente | DeepEval |
| Métricas específicas de RAG | RAGAS |
| Evals reproducibles de agentes con *sandbox*, límites y registro | Inspect AI |
| Benchmarks de modelos base | lm-eval-harness (no para evaluar tu app) |

**promptfoo** (*config validada con `promptfoo validate`: «Configuration is valid.»*)

```yaml
# promptfooconfig.yaml  ·  ejecuta: npx promptfoo@latest eval
description: Clasificador de tickets con un modelo local
prompts:
  - "Clasifica el ticket en facturacion, envio, devolucion u otro. Responde solo la categoría.\n\nTicket: {{ticket}}"
providers:
  - id: ollama:chat:qwen3.6:27b
    config: { temperature: 0 }
defaultTest:
  options:
    provider: ollama:chat:qwen3.6:27b   # juez local para llm-rubric
tests:
  - vars: { ticket: "Me cobrasteis dos veces este mes" }
    assert: [{ type: icontains, value: facturacion }]
  - vars: { ticket: "El paquete no ha llegado" }
    assert:
      - { type: icontains, value: envio }
      - { type: llm-rubric, value: "Responde con una sola palabra, sin explicación" }
```

`OLLAMA_BASE_URL` cambia el host. Hay aserciones `is-json`, `contains-json`, `javascript`, `similar`, `is-valid-openai-tools-call` y `tool-call-f1`. Telemetría activada por defecto (`PROMPTFOO_DISABLE_TELEMETRY=1`).

**DeepEval 4.3.2** (verificado):

```python
# test_deepeval.py · antes: deepeval set-ollama --model qwen3.6:27b   (base URL por defecto http://localhost:11434)
from deepeval import assert_test
from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCase, SingleTurnParams   # LLMTestCaseParams está obsoleto

def test_devoluciones():
    m = GEval(name="Corrección", criteria="¿La respuesta real dice lo mismo que la esperada?",
              evaluation_params=[SingleTurnParams.ACTUAL_OUTPUT, SingleTurnParams.EXPECTED_OUTPUT], threshold=0.7)
    assert_test(LLMTestCase(input="¿Cuánto tiempo tengo para devolver?",
                            actual_output="Tienes 30 días desde la entrega.",
                            expected_output="30 días naturales desde la entrega."), [m])
# deepeval test run test_deepeval.py
```

**RAGAS 0.4.3** (verificado en un venv aparte con `langchain-community` 0.3.31):

```python
import asyncio
from openai import AsyncOpenAI
from ragas.llms import llm_factory
from ragas.metrics.collections import Faithfulness

juez = llm_factory("qwen3.6:27b", provider="openai",
                   client=AsyncOpenAI(base_url="http://localhost:11434/v1", api_key="ollama"))
r = asyncio.run(Faithfulness(llm=juez).ascore(
    user_input="¿Cuánto tiempo tengo para devolver?", response="Tienes 30 días.",
    retrieved_contexts=["Las devoluciones se aceptan durante 30 días naturales."]))
print(r.value, r.reason)
```

**Trampa verificada**: `pip install ragas` resuelve `langchain-community` 0.4.2 y **falla al importar** (`No module named 'langchain_community.chat_models.vertexai'`). Hay que fijar `pip install ragas==0.4.3 "langchain-community<0.4"`. Métricas en `ragas.metrics.collections`: `Faithfulness`, `ContextPrecision`, `ContextRecall`, `AnswerRelevancy`, `FactualCorrectness`, `ToolCallAccuracy`, `ToolCallF1`, `AgentGoalAccuracy` y otras.

**Inspect AI 0.3.286** (la tarea carga y arranca con `--model mockllm/model`; la ejecución se cortó por falta de red para descargar `tiktoken`):

```python
from inspect_ai import Task, task
from inspect_ai.dataset import Sample
from inspect_ai.scorer import includes
from inspect_ai.solver import generate, system_message

@task
def clasificar_tickets():
    return Task(dataset=[Sample(input="Me cobrasteis dos veces", target="facturacion")],
                solver=[system_message("Clasifica: facturacion, envio, devolucion u otro."), generate()],
                scorer=includes())
# inspect eval tarea.py --model ollama/qwen3.6:27b   (proveedores: ollama, vllm, sglang, llama_cpp_python, openai_compatible…)
```

`Task` admite `sandbox=`, `message_limit`, `token_limit`, `time_limit`, `cost_limit` y `approval=`. Es útil para evaluar trayectorias de agentes.

**Trampas de evals con modelos locales**: un juez local más débil que el modelo evaluado infla las notas (la guía ya dice «juez igual o mayor»); `llm-rubric` de promptfoo usa un proveedor por defecto de pago si no lo cambias; fija semillas y temperatura y repite ejecuciones, porque la variación entre corridas existe.

### 3.9 Guardrails, PII y sandbox

- **Clasificadores abiertos**:
  - **Llama Guard 4** (12B, abr. 2025, Llama 4 Community License): categorías S1–S14 de MLCommons (S14 = abuso de intérprete de código), filtra entrada y salida, admite varias imágenes. La propia card dice que puede ser vulnerable a inyección y recomienda Prompt Guard 2 para ataques de *prompt*.
  - **gpt-oss-safeguard** (Apache 2.0): clasificación con **política propia** y razonamiento visible.
  - Otros: Granite Guardian 4.1 (en Ollama), **Shieldstral 1.0** (aparece en la documentación de Mistral con Apache 2.0; detalles SIN CONFIRMAR) y `openai/privacy-filter` (1B, clasificación de tokens, abr. 2026; licencia SIN CONFIRMAR).
- **Frameworks**:
  - NeMo Guardrails: `RailsConfig.from_path("config")`, `LLMRails(config)`, `rails.generate(...)` (también asíncrono), con *rails* de entrada, diálogo (Colang) y salida.
  - Guardrails AI: `Guard().use(Validador, on_fail=OnFailAction.EXCEPTION).validate(texto)` con validadores del Hub.
  - LLM Guard: escáneres de entrada y salida, pero parado desde mayo de 2025 y sin soporte de Python 3.13.
- **Presidio** 2.2.366 (MIT): `AnalyzerEngine` y `AnonymizerEngine`. En español hace falta configurar un modelo spaCy en español con `NlpEngineProvider` (*conocimiento previo; verificar en la documentación de Presidio*).
- **Sandbox para ejecutar código de agentes**:
  - Contenedor Docker endurecido: sin red por defecto, usuario no root, sistema de ficheros de solo lectura y límites de CPU y memoria.
  - **gVisor** (núcleo en espacio de usuario) y **Firecracker** (microVM). Ambos son conocimiento previo; versiones SIN CONFIRMAR.
  - **microsandbox** 0.7.11 (Apache-2.0): microVM con libkrun desde imágenes OCI, local, con *snapshots* y *fork*:
    ```python
    async with await Sandbox.create("nombre", image="python") as sb:
        await sb.shell("…")
    ```
  - **e2b**: SDK MIT (`Sandbox.create()`, `sandbox.commands.run(...)`), servicio en la nube. Que su infraestructura se pueda autoalojar está SIN CONFIRMAR.
  - **Inspect AI** también ejecuta herramientas en *sandbox* Docker.
- **Trampa**: un clasificador no sustituye a los permisos. La guía ya lo dice (mínimo privilegio, aprobación humana). Úsalo como una capa más, igual que en `cursos/seguridad-y-prompt-injection/03-defensas-en-capas`.

### 3.10 Agentes de código open source

- **Conexión a modelos locales (verificado en docs.ollama.com)**:
  - `ollama launch claude`, `ollama launch codex` y `ollama launch opencode` (con `--config` para configurar sin lanzar).
  - Codex manual: `codex --oss -m gpt-oss:120b`, o un perfil en `~/.codex/ollama-launch.config.toml` con `[model_providers.ollama-launch] base_url = "http://localhost:11434/v1/"` y `wire_api = "responses"`.
  - OpenCode: proveedor en `opencode.json` con `"npm": "@ai-sdk/openai-compatible"` y `"baseURL": "http://localhost:11434/v1"`.
  - Claude Code: `ANTHROPIC_BASE_URL=http://localhost:11434`, `ANTHROPIC_AUTH_TOKEN=ollama`, `ANTHROPIC_API_KEY=""`. **Claude Code es propietario**; aquí solo como cliente.
  - Todos piden un modelo con herramientas y **al menos 64k de contexto**.
- **MCP, AGENTS.md y skills**: Cline declara MCP nativo, reglas y *skills*, y acepta cualquier endpoint compatible con OpenAI. Qwen Code menciona MCP y *skills*. El soporte de AGENTS.md por herramienta queda **SIN CONFIRMAR** en esta sesión (los READMEs de npm no lo detallan).
- **Licencias**:
  - OSI: OpenCode MIT, Codex CLI Apache-2.0, Gemini CLI Apache-2.0, Cline Apache-2.0, Kilo MIT, Aider Apache-2.0, OpenHands MIT.
  - **Crush: FSL-1.1-MIT** (fuente disponible; pasa a MIT con el tiempo, no es OSI al publicarse).
  - Goose (Block) y Roo Code: SIN CONFIRMAR estado y versión.
- **Trampas**: los modelos locales pequeños fallan más en bucles largos de herramientas; contexto insuficiente; con `--dangerously-skip-permissions` o equivalentes, solo dentro de un entorno aislado (la documentación de Ollama lo advierte).

### 3.11 MCP open source

- **Revisión del protocolo 2026-07-28** (verificado en `mcp` 2.3.0: `LATEST_PROTOCOL_VERSION = "2026-07-28"`, y en los READMEs de los servidores de referencia):
  - Los clientes nuevos se conectan con **`server/discover`**, envían versión, identidad y capacidades **en cada petición** y **no hay sesión**.
  - Novedades: peticiones de varias vueltas (`input_required`), `subscriptions/listen`, pistas de caché (`ttlMs`/`cacheScope`), la extensión de tareas `io.modelcontextprotocol/tasks` y esquemas JSON Schema 2020-12.
  - Quedan **obsoletos *roots*, *sampling* y *logging***. El transporte HTTP+SSE solo sirve a clientes de la era 2025.
  - Los servidores de referencia atienden **las dos eras** desde el mismo proceso.
- **SDK**:
  - Python `mcp` 2.3.0 (MIT): `from mcp.server import MCPServer` (README) o `from mcp.server.mcpserver import MCPServer` (también funciona); `ClientSession` tiene `discover()` e `initialize()` (fallback heredado).
  - TypeScript **v2** (27-07-2026): `@modelcontextprotocol/server` y `@modelcontextprotocol/client` 2.4.0, Apache-2.0.
  - `@modelcontextprotocol/sdk` 1.32.2 es la **línea 1.x de mantenimiento** (especificación hasta 2025-11-25; correcciones al menos seis meses).
  - Licencia del proyecto en transición de MIT a Apache-2.0.
- **Servidores de referencia**:
  - npm: `server-filesystem` 2.1.0 (directorios permitidos **por línea de comandos**: es el único método que funciona en todas las versiones), `server-everything` 2.1.0 (servidor de prueba; HTTP en `localhost:3001/mcp`), `server-memory` 2.0.1 y `server-sequential-thinking` 2.0.0.
  - PyPI: `mcp-server-git`, `mcp-server-fetch` y `mcp-server-time` (2026.10.28, MIT).
  - **Obsoletos en npm**: `server-github`, `server-puppeteer` y `server-postgres`.
- **Inspector** 2.13.0: `npx @modelcontextprotocol/inspector` (web), `--cli` y `--tui`. Guarda secretos OAuth en el llavero del sistema; **sin llavero, en `~/.mcp-inspector/secrets.json` sin cifrar**. Tiene un modo CLI para *smoke tests* en CI.
- **Populares mantenidos** (npm): `@playwright/mcp` 0.0.83 (Apache-2.0) y `@upstash/context7-mcp` 4.4.4 (MIT); `fastmcp` 4.1.4 (Apache-2.0, proyecto independiente).
- **Registro oficial**: `mcp-publisher` 0.4.2 (MIT) es la CLI de publicación. La URL y el estado del registro quedan SIN CONFIRMAR en esta sesión.
- **Riesgos**: inyección por resultados de herramientas (ya cubierto en `radar/2026-10-20-inyeccion-por-herramientas`), servidores de terceros con credenciales, secretos en claro en máquinas sin llavero y paquetes obsoletos que siguen apareciendo en tutoriales.

### 3.12 Interfaces y plataformas

- **Open WebUI** 0.12.5: interfaz de chat para Ollama y endpoints OpenAI, con RAG, herramientas y «Open Terminal». Licencia propia: BSD-3 más la obligación de **no alterar la marca «Open WebUI»** salvo con 50 usuarios o menos en 30 días, permiso escrito o licencia enterprise. Incluye CLA.
- **Langflow** 1.13.0 (MIT) y **Flowise** 3.1.4 (Apache 2.0): constructores visuales de flujos y agentes.
- **n8n** 2.45.6: automatización con nodos de IA. **Sustainable Use License**: «solo para tus fines internos de negocio o uso no comercial o personal», y los ficheros `.ee` requieren licencia enterprise. Es *fair-code*, no open source.
- **LibreChat, AnythingLLM y Dify**: SIN CONFIRMAR en esta sesión. Conocimiento previo: LibreChat y AnythingLLM con MIT; Dify con licencia propia basada en Apache 2.0 con condiciones (multitenencia SaaS y logotipo). Verificar antes de publicar.

### 3.13 Despliegue de agentes

- **Contenedores**: imagen del agente separada del servidor de modelos (Ollama, vLLM). Healthchecks (`/health` en llama.cpp; vLLM y SGLang exponen endpoints de salud), límites de memoria y GPU, y el modelo montado como volumen (no dentro de la imagen).
- **Colas y concurrencia**: Ollama encola (`OLLAMA_MAX_QUEUE` 512) y procesa `OLLAMA_NUM_PARALLEL` peticiones por modelo. vLLM y SGLang hacen *continuous batching*. Pon tu propia cola delante si las tareas del agente son largas.
- **Ejecución duradera** (agentes que duran minutos u horas; enlaza con `radar/2026-07-28-agentes-de-larga-duracion`):
  - **Temporal** (SDK MIT): *workflows* y actividades con reintentos.
  - **Restate** (SDK MIT, **servidor BSL**): *async/await* duradero.
  - **DBOS** (MIT): pasos duraderos guardados en Postgres; encaja con pgvector.
  - **Inngest** (SDK Apache-2.0; licencia del servidor SIN CONFIRMAR): funciones por eventos.
  - Criterio: cada llamada al modelo y cada herramienta es un paso idempotente con *checkpoint*.
- **Kubernetes**: **KServe** 0.21.0 (Apache-2.0) para servir modelos; **llm-d** (inferencia distribuida sobre vLLM; versión SIN CONFIRMAR). vLLM ofrece *PD disaggregation*, paralelismo experto y *prefix caching* (`--enable-prefix-caching`).
- **Coste local frente a API (sin cifras)**: ver §4.

### 3.14 Otras novedades jul.–oct. 2026 que cambian cómo se construye

1. **MCP sin sesión (2026-07-28)** y SDK TypeScript v2: cambia el *handshake* que enseñan los cursos.
2. **APIs Anthropic compatibles en motores locales**: el mismo código vale para nube y local.
3. **Gemma 4 pasa a Apache 2.0**, mientras otras licencias se endurecen con cláusulas de «Model as a Service» (Mistral Large 4, Kimi K3, GLM-5.3, Qwen3.8-Max).
4. **Razonamiento con niveles de esfuerzo** en casi todos los modelos abiertos, con nombres distintos.
5. **llama.cpp con semver y nuevo puerto**; **TGI archivado**; **Qdrant con BM25 nativo sobre texto**.
6. **Langfuse SDK v5** y la **migración de las convenciones GenAI de OTel** a un repositorio propio.
7. **promptfoo pasa a OpenAI** (sigue siendo MIT).
8. A vigilar, sin recomendar todavía: los «modelos de decisión» con respuestas tipadas y probabilidades (endpoint `/v1/systemone` en vLLM 0.32 y llama.cpp v0.7.0, modelos d1/d3 en Ollama). La documentación de LLM Gateway dice que `/v1/systemone` «will be deprecated soon» en favor de `/v1/decisions`. Es inmaduro.

---

## 4. Marco de decisión: API propietaria, modelo abierto alojado o local

Tres opciones: **A** = API propietaria (Claude…), **B** = modelo abierto servido por un tercero o en tu nube (vLLM o SGLang en tus GPU, o un proveedor de inferencia), **C** = local en tu máquina (Ollama, LM Studio, llama.cpp).

| Criterio | Pregunta que decide | A · API propietaria | B · Abierto alojado | C · Local |
|---|---|---|---|---|
| **Privacidad y soberanía** | ¿Pueden salir los datos de tu red? ¿Hay requisitos contractuales o de residencia? | Depende del contrato y la región del proveedor | Tú eliges dónde; con GPU propias, nada sale | Nada sale (salvo modelos `:cloud` o búsqueda web) |
| **Calidad** | ¿El modelo abierto pasa **tus** evals con el umbral que necesitas? | Suele ser el techo de partida (método de `modelos/05`) | Mídelo: varía mucho por tarea y modelo | Limitada por la memoria: modelos menores o más cuantizados |
| **Coste** | Volumen × tokens por tarea frente a coste fijo de hardware y operación | Variable por token; *prompt caching* reduce mucho | Fijo (GPU) más operación; compensa con volumen alto y estable | Hardware que ya tienes; coste marginal casi nulo con volumen bajo |
| **Latencia** | ¿Necesitas respuesta interactiva? ¿Hay muchos usuarios a la vez? | Red más cola del proveedor | Controlable (*batching*, cercanía) | Sin red, pero una GPU de consumo sirve a pocos usuarios a la vez |
| **Operación** | ¿Quién actualiza, monitoriza y escala? | El proveedor | Tú: drivers, versiones de vLLM, *parsers*, memoria | Tú, pero el alcance es pequeño (un equipo) |
| **Funcionalidades** | ¿Necesitas `tool_choice` forzado, *prompt caching*, citas, *batches*, salidas estructuradas garantizadas? | Completas en la API nativa | vLLM: `tool_choice` y salidas estructuradas sí; caché de prefijo sí | Ollama: sin `tool_choice`; salidas estructuradas por `format` |
| **Licencia** | ¿Tu caso de uso cumple la licencia del modelo (MaaS, umbrales, no comercial)? | Términos del proveedor | Revisa el `LICENSE` | Revisa el `LICENSE` |
| **Dependencia** | ¿Te importa poder cambiar de modelo sin reescribir? | Atado a la API, salvo con capa de compatibilidad | Formato OpenAI o Anthropic intercambiable | Igual |

**Cómo decidir en la práctica**
1. Empieza por **A** para fijar el techo de calidad con evals, como ya enseña `modelos/05`.
2. Si hay requisito duro de privacidad, salta a **C** (prototipo) o **B** (producción), y mide.
3. Si no lo hay, prueba un modelo abierto con **las mismas evals**. Si cumple el umbral y el volumen justifica GPU dedicadas, pasa a **B**.
4. **Mezcla**: el enrutado (`patrones/04-enrutado`) puede mandar la clasificación barata a un modelo local y los casos complejos a la API.
5. Repite la medición en cada versión de modelo o de motor: el *parser* de herramientas o la plantilla de chat pueden cambiar la calidad sin que cambie el modelo.

*No hay cifras porque dependen de tu volumen, tu hardware y tu tarea. Las únicas cifras aceptables son las que salgan de tus evals y de `usage`.*

---

## 5. Correcciones a la base

1. **`docs/GUIA-CONTENIDO.md` §8, MCP (SDK de TypeScript)**: dice «SDK de TypeScript: `@modelcontextprotocol/sdk`». Desde el 27-07-2026 la versión estable es la **v2**, dividida en `@modelcontextprotocol/server` y `@modelcontextprotocol/client` (2.4.0, Apache-2.0). `@modelcontextprotocol/sdk` 1.32.2 es la línea 1.x de mantenimiento y no implementa la especificación 2026-07-28.
2. **`docs/GUIA-CONTENIDO.md` §8, MCP (protocolo)**: añadir que la revisión vigente es **2026-07-28** (sin sesión, `server/discover`, *roots*, *sampling* y *logging* obsoletos, HTTP+SSE solo para clientes antiguos) y que la licencia del proyecto está pasando de MIT a Apache-2.0. El import Python que muestra el README es `from mcp.server import MCPServer`; `from mcp.server.mcpserver import MCPServer` sigue funcionando (verificado en 2.3.0).
3. **`contenido/cursos/mcp-de-cero-a-servidor/01-que-resuelve-mcp.md`** (líneas 57–77): el ejemplo enseña el *handshake* `initialize` con `protocolVersion: "2025-06-18"`, la capacidad `roots` y `notifications/initialized`. Con la revisión 2026-07-28, los clientes nuevos usan `server/discover` y no hay sesión, y *roots* y *sampling* están obsoletos. Propuesta: presentarlo como «era 2025» y añadir la secuencia nueva.
4. **`contenido/cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor.md`** (líneas 110–117 y 170): los imports `@modelcontextprotocol/sdk/server/mcp.js` son de la v1. Hay que actualizar a la v2 (nombres exactos de los imports de v2: **SIN CONFIRMAR**; consultar ts.sdk.modelcontextprotocol.io/v2).
5. **Clientes MCP con `await sesion.initialize()`** en `docs/herramientas/02-mcp.md`, `roadmap/20-herramientas/05-mcp-conectar-un-servidor.md`, `recetas/servidor-mcp-de-solo-lectura.md` y `cursos/mcp-de-cero-a-servidor/02-usar-servidores-existentes.md`: siguen funcionando en `mcp` 2.3.0 (fallback), pero el camino nuevo es `discover()`. Hay que revisarlos contra el SDK actual antes de la fase de código verificado.
6. **`modelos/06-parametros.md`**: «`max_tokens` … Obligatorio» es específico de Anthropic. En servidores locales compatibles con OpenAI es opcional, y en Ollama `num_predict` vale -1 (sin límite) por defecto, así que conviene recomendar ponerlo siempre. Faltan además:
   - `num_ctx` y el truncado silencioso;
   - `top_k`, `min_p` y `repeat_penalty`;
   - el muestreo recomendado en cada *model card* (p. ej. DeepSeek V4 recomienda temperatura 1.0);
   - que los niveles de `effort`/`reasoning_effort` cambian de nombre según la familia (`xhigh`, `max`, `none`).
7. **`modelos/05-elegir-modelo-por-tarea.md`**: el método vale tal cual para modelos abiertos, pero falta el eje «API frente a abierto frente a local» y el aviso de que un **juez local más débil** que el evaluado da notas infladas.
8. **`modelos/index.md`**: «Los ejemplos usan la API de Mensajes de Anthropic» puede ampliarse: los mismos ejemplos funcionan contra Ollama, LM Studio, llama.cpp o vLLM cambiando `base_url`, con las lagunas documentadas (§3.3).
9. **`roadmap/100-produccion/01-observabilidad-y-trazas.md` (l. 130) y `docs/produccion/01-observabilidad.md`**: si se citan atributos OTel, usar `gen_ai.provider.name` (no `gen_ai.system`) y mencionar que las convenciones GenAI viven ahora en `open-telemetry/semantic-conventions-genai`.
10. **`docs/GUIA-CONTENIDO.md` §8, embeddings**: está bien que el código use una función `embed()` abstracta. Se puede añadir una opción local por defecto (`ollama.embed(model=…, input=[…]).embeddings`, verificado en el cliente 0.6.3) para que los ejemplos de RAG se puedan ejecutar sin cuenta.
11. **`docs/GUIA-CONTENIDO.md` §8, «Referencias que puedes citar»**: añadir fuentes primarias del mundo abierto (OSI Open Source AI Definition, documentación de Ollama, vLLM, pgvector y Qdrant, OTel GenAI). Hoy la guía prohíbe citar lo que no está en la tabla.
12. **`docs/MAPA-CONTENIDO.md`**: no hay ninguna sección sobre modelos abiertos ni inferencia local. Hay que añadir las rutas del §6.

---

## 6. Propuestas de contenido

### Guía de modelos
1. **`modelos/10-modelos-de-pesos-abiertos`** · «Modelos de pesos abiertos: qué son y cómo elegir» · guía (orden 10)
   - Pesos abiertos frente a open source (OSI) frente a «fuente disponible».
   - Cómo leer un `LICENSE`: las cuatro preguntas del §3.1.
   - MoE: activos frente a totales.
   - Razonamiento activado por defecto y cómo controlarlo en cada familia (tabla).
   - Antes/después: «uso Llama porque es open source» frente a «compruebo licencia, umbrales y MaaS».
   - Fuentes: cards y `LICENSE` del §7.1.
2. **`modelos/11-inferencia-local`** · «Inferencia local: memoria, cuantización y contexto» · guía
   - Fórmula de memoria con el ejemplo Qwen3.6-27B (16,5 GB calculados frente a 17 GB reales).
   - Tabla de bits por peso (Q4_K_M, Q8_0, F16).
   - KV cache y contexto; `num_ctx` y el truncado silencioso.
   - Cuándo no aplica (API).
   - Fuentes: NVIDIA, README de quantize de llama.cpp, Ollama.

### Documentación (grupo nuevo)
3. **`docs/open-source/index`** · «Open source» · portada (orden 9)
4. **`docs/open-source/01-ollama`** · «Ollama: modelos locales con API OpenAI y Anthropic» · artículo
   - Comandos, variables, Modelfile, APIs, `think`, `format`, campos no soportados.
5. **`docs/open-source/02-vllm-y-sglang`** · «Servir modelos abiertos con vLLM y SGLang» · artículo
   - Flags de herramientas y razonamiento, *parsers*, `structured_outputs`, CORS, memoria.
6. **`docs/open-source/03-apis-compatibles`** · «APIs compatibles: OpenAI, Anthropic y LiteLLM» · artículo
   - Matriz motor × endpoint × lagunas.
7. **`docs/open-source/04-embeddings-y-rerankers`** · artículo
   - sentence-transformers 6 (`encode_query`, `CrossEncoder.rank`, `SparseEncoder`, `MultiVectorEncoder`), Ollama `embed` y MTEB con criterio.
8. **`docs/open-source/05-bases-vectoriales`** · artículo
   - Tabla §2.3, pgvector HNSW frente a IVFFlat, Qdrant híbrida y cuándo cada una.
9. **`docs/open-source/06-ingesta-de-documentos`** · artículo
   - Docling, PyMuPDF 2, marker y MinerU, con su licencia.
10. **`docs/open-source/07-observabilidad-abierta`** · artículo
    - Langfuse v5, Phoenix, OpenLLMetry y atributos `gen_ai.*`.
11. **`docs/open-source/08-evals-abiertas`** · artículo
    - Cuál para qué, juez local y trampas.
12. **`docs/open-source/09-guardrails-y-sandbox`** · artículo
    - Llama Guard 4, gpt-oss-safeguard, NeMo, Presidio, microsandbox y Docker endurecido.
13. **`docs/open-source/10-agentes-de-codigo-abiertos`** · artículo
    - Tabla de licencias, `ollama launch` y 64k de contexto.

### Recetas
14. **`recetas/agente-local-con-ollama`** (tema agentes, inicial, `stack: [ollama, openai]`)
    - Snippet §3.2, límite de pasos, validación de argumentos, `num_ctx`.
15. **`recetas/rag-local-con-pgvector`** (rag, intermedio, `stack: [postgres, pgvector, ollama]`)
    - SQL verificado del §3.5, embeddings con `ollama.embed`, `EXPLAIN`.
16. **`recetas/busqueda-hibrida-con-qdrant`** (rag, intermedio)
    - Denso + *sparse* con RRF y la variante BM25 sobre texto (Qdrant ≥ 1.20).
17. **`recetas/trazas-con-langfuse`** y **`recetas/trazas-con-phoenix`** (produccion, inicial)
18. **`recetas/evals-con-promptfoo-y-modelo-local`** (evals, inicial)
    - YAML validado, juez local, `PROMPTFOO_DISABLE_TELEMETRY`.
19. **`recetas/servir-un-modelo-con-vllm`** (produccion, intermedio)
20. **`recetas/pdf-a-markdown-con-docling`** (rag, inicial)
21. **`recetas/agente-de-codigo-con-modelo-local`** (agentes, inicial)
    - OpenCode o Codex con `ollama launch`, 64k de contexto, entorno aislado.

### Sistemas
22. Sección **«Variante 100 % local»** en `sistemas/rag-con-citas`, `sistemas/extraccion-documental` y `sistemas/asistente-de-datos-con-mcp`:
    - Componentes: Ollama o vLLM, Qwen3-Embedding o bge-m3, pgvector, Docling, Langfuse y promptfoo.
    - Qué se pierde (*prompt caching*, `tool_choice` en Ollama) y cómo evaluarlo.
    - Alternativa: una página nueva `sistemas/rag-100-local`.

### Glosario (categoría entre paréntesis)
23. `glosario/pesos-abiertos` (fundamentos), `glosario/cuantizacion` (produccion), `glosario/gguf` (produccion), `glosario/mezcla-de-expertos` (fundamentos, alias MoE), `glosario/kv-cache` (produccion), `glosario/plantilla-de-chat` (fundamentos), `glosario/decodificacion-restringida` (prompting, alias *structured outputs* y *constrained decoding*), `glosario/rrf` (contexto), `glosario/hnsw` (contexto), `glosario/late-interaction` (contexto, alias ColBERT), `glosario/ejecucion-duradera` (produccion), `glosario/open-source-ai` (fundamentos).

### Radar (`AAAA-MM-DD-titulo.md`, 150–350 palabras)
24. `radar/2026-11-03-mcp-sin-sesion` (herramientas): revisión 2026-07-28 y SDK TypeScript v2.
25. `radar/2026-11-03-apis-anthropic-en-local` (herramientas): Ollama, LM Studio, llama.cpp y vLLM con `/v1/messages`.
26. `radar/2026-11-17-licencias-model-as-a-service` (modelos): Gemma 4 pasa a Apache y otros pasan a MIT con cláusulas MaaS.
27. `radar/2026-11-17-tgi-archivado-y-llama-cpp-semver` (herramientas): motores que cambian (puerto 9931, TGI archivado).

### Curso (opcional, más adelante)
28. **`cursos/agentes-con-modelos-abiertos/`** (intermedio, 5 h), con lecciones:
    1. Elegir modelo y licencia.
    2. Servirlo (Ollama y vLLM).
    3. Agente con herramientas en local.
    4. RAG local.
    5. Trazas y evals locales.

---

## 7. Fuentes

### 7.1 Modelos
- DeepSeek-V4-Pro: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- DeepSeek-V4.1-Flash-1017: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017 · GGUF: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Qwen3.8 (news y despliegue): https://github.com/QwenLM/Qwen3.8 · https://huggingface.co/Qwen/Qwen3.8-27B · https://huggingface.co/collections/Qwen/qwen38 · licencia 2.4T: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B/raw/main/LICENSE
- Qwen3.6: https://huggingface.co/Qwen/Qwen3.6-35B-A3B · https://huggingface.co/collections/Qwen/qwen36
- Qwen3.5: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Meta: https://huggingface.co/meta-llama · Llama Guard 4: https://huggingface.co/meta-llama/Llama-Guard-4-12B
- Llama 5 (secundaria, **no confirmada**): https://plainai.aguidetocloud.com/changes/meta-llama-5/
- Mistral: https://docs.mistral.ai/models · https://docs.mistral.ai/models/mistral-large-4-0 · https://huggingface.co/blog/mistral-large4 · https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE · https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/raw/main/LICENSE · https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/ · https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12b/ · https://huggingface.co/google/gemma-4-26B-A4B-it
- gpt-oss: https://openai.com/index/introducing-gpt-oss/ · https://huggingface.co/openai · https://huggingface.co/openai/gpt-oss-safeguard-120b
- Kimi: https://huggingface.co/moonshotai/Kimi-K3 · https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE · https://huggingface.co/moonshotai/Kimi-K2.5
- GLM: https://huggingface.co/zai-org · https://huggingface.co/zai-org/GLM-5.3-BF16 · https://huggingface.co/zai-org/GLM-5.3/blob/935644c05e76fc198714f4cca449fd8b970ff6d7/LICENSE
- MiniMax: https://huggingface.co/MiniMaxAI/MiniMax-M3/blob/main/LICENSE · https://dell.huggingface.co/models/MiniMaxAI/MiniMax-M3 · https://huggingface.co/MiniMaxAI/MiniMax-M2.5
- Phi: https://huggingface.co/microsoft/Phi-4-reasoning-vision-15B
- OLMo: https://allenai.org/olmo · https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Nemotron 3: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Granite 4.2: https://huggingface.co/ibm-granite/granite-4.2-8b
- Open weights frente a open source (secundaria que cita a la OSI): https://intuitionlabs.ai/articles/open-weight-ai-model-licenses → https://opensource.org/ai/open-source-ai-definition · https://opensource.org/ai/open-weights (no abiertas en esta sesión)

### 7.2 Inferencia y APIs
- Ollama: https://github.com/ollama/ollama/releases · https://docs.ollama.com/api/openai-compatibility · https://docs.ollama.com/api/anthropic-compatibility · https://docs.ollama.com/capabilities/tool-calling · https://docs.ollama.com/capabilities/structured-outputs · https://docs.ollama.com/capabilities/thinking · https://docs.ollama.com/context-length · https://docs.ollama.com/faq · https://docs.ollama.com/modelfile · https://ollama.com/blog/launch · https://docs.ollama.com/integrations/codex · https://docs.ollama.com/integrations/opencode · https://docs.ollama.com/integrations/claude-code · https://ollama.com/library · https://ollama.com/library/qwen3.6/tags · https://ollama.com/search?q=gpt
- llama.cpp: https://github.com/ggml-org/llama.cpp/releases · https://github.com/ggml-org/llama.cpp/releases/tag/v0.7.0 · https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md · https://github.com/ggml-org/llama.cpp/blob/master/docs/function-calling.md · https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md · https://github.com/ggml-org/ggml/discussions/1579
- vLLM: https://docs.vllm.ai/en/latest/features/tool_calling/ · https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/ · https://github.com/vllm-project/vllm/releases/tag/v0.32.0 · https://github.com/vllm-project/vllm/issues/58647
- SGLang: https://github.com/sgl-project/sglang/releases/tag/v0.5.22
- TGI: https://github.com/huggingface/text-generation-inference
- LM Studio: https://lmstudio.ai/docs/developer/api-changelog · https://lmstudio.ai/docs/developer/anthropic-compat · https://lmstudio.ai/docs/developer/core/server
- Memoria: https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/
- Modelos de decisión (a vigilar): https://docs.llmgateway.io/features/system-one

### 7.3 Búsqueda y datos
- pgvector: https://github.com/pgvector/pgvector · https://github.com/pgvector/pgvector/blob/master/CHANGELOG.md
- Qdrant: https://qdrant.tech/documentation/search/hybrid-queries/ · https://github.com/qdrant/qdrant/releases
- Chroma: https://docs.trychroma.com/cloud/search-api/overview
- Weaviate: https://weaviate.io/blog/weaviate-1-39-release · https://github.com/weaviate/weaviate/releases
- Milvus: https://milvus.io/docs/full-text-search.md
- Elastic: https://www.elastic.co/pricing/faq/licensing
- Embeddings en Ollama: https://ollama.com/library/bge-m3 · https://ollama.com/library/qwen3-embedding · https://ollama.com/library/embeddinggemma · https://ollama.com/library/nomic-embed-text

### 7.4 Registros de paquetes (versión, fecha, licencia y README como fuente primaria)
- PyPI, `https://pypi.org/pypi/<paquete>/json` para: vllm, sglang, mlx, mlx-lm, llama-cpp-python, sentence-transformers, FlagEmbedding, pylate, mxbai-rerank, mteb, qdrant-client, chromadb, lancedb, weaviate-client, pymilvus, opensearch-py, elasticsearch, pgvector, psycopg, docling, unstructured, marker-pdf, pymupdf, pymupdf4llm, mineru, langfuse, arize-phoenix, arize-phoenix-otel, traceloop-sdk, opentelemetry-semantic-conventions, opentelemetry-util-genai, deepeval, ragas, inspect-ai, lm-eval, evals, nemoguardrails, guardrails-ai, llm-guard, presidio-analyzer, e2b, microsandbox, temporalio, restate-sdk, dbos, inngest, kserve, langflow, open-webui, litellm, aider-chat, openhands-ai, mcp, fastmcp, mcp-server-git, mcp-server-fetch, mcp-server-time, ollama, langchain-ollama.
- npm (`npm view`, `npm pack` para leer `LICENSE`): promptfoo, opencode-ai, @openai/codex, @google/gemini-cli, @kilocode/cli, @continuedev/cli, cline, @qwen-code/qwen-code, @charmland/crush, @anthropic-ai/claude-code, @modelcontextprotocol/{sdk,server,client,inspector,server-filesystem,server-everything,server-memory,server-sequential-thinking,server-github,server-puppeteer,server-postgres}, @playwright/mcp, @upstash/context7-mcp, mcp-publisher, flowise, n8n (LICENSE.md del tarball), @langfuse/tracing, @langfuse/otel, @arizeai/phoenix-otel, @restatedev/restate-server, @restatedev/restate-sdk, inngest, inngest-cli, @dbos-inc/dbos-sdk, @temporalio/client, @electric-sql/pglite, @electric-sql/pglite-pgvector.

### 7.5 Artefactos de verificación (en el scratchpad)
- `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-2b/ejemplos/`: `agente_ollama_openai.py`, `agente_ollama_nativo.py`, `salida_estructurada_ollama.py`, `agente_langchain_ollama.py`, `pgvector_hibrida_pglite.mjs` (ejecutado), `pgvector_psycopg.py`, `qdrant_hibrida.py` (ejecutado), `qdrant_bm25_texto.py` (ejecutado), `chroma_lance.py` (ejecutado), `trazas_langfuse.py`, `trazas_phoenix.py`, `promptfooconfig.yaml` (validado), `test_deepeval.py`, `ragas_faithfulness.py`.
- `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-2b/versiones-verificadas.txt`
- `/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-2b/evals/tarea_clasificar.py` (Inspect AI)

### 7.6 Pendiente por el límite de búsquedas (para una ronda de seguimiento)
Licencias exactas de los modelos de embeddings (Qwen3-Embedding, EmbeddingGemma 1 y 2, nomic v2, Jina) y de bge-reranker-v2-m3 · licencia y requisitos del servidor Langfuse · Goose y Roo Code · LibreChat, AnythingLLM y Dify · gVisor y Firecracker (versiones) · llm-d · registro oficial de MCP (URL y estado) · imports exactos del SDK TypeScript v2 de MCP · página de la OSI (versión y fecha de la OSAID) · soporte de AGENTS.md por agente · tamaños y contexto de Llama 4 · licencia del servidor de Inngest.
