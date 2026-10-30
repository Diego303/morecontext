# Lo que no se pudo verificar

Salido de los registros de verificación independiente. Revísalo a mano antes de publicar: son afirmaciones que el verificador no pudo confirmar en una fuente primaria (algunas están suavizadas en el texto, otras se dejaron tal cual).


## Lote V1

- gpt-3-few-shot: el contenido de la sección 5 (repeticiones, sentido común físico, coste de inferencia, duda de si aprende en contexto o reconoce la tarea). ar5iv corta el texto antes de esa sección y arXiv está bloqueado. La duda sobre el aprendizaje en contexto sí aparece en la introducción; el resto coincide con el paper tal como lo conozco. Son afirmaciones cualitativas sin cifras: se dejan.
- backpropagation: los detalles internos (árboles genealógicos inglés/italiano, simetría, momentum, párrafo final sobre el cerebro) no se pudieron abrir en el PDF de Nature; el resumen sí se confirmó en ADS. Sin cifras: se dejan.
- leyes-de-escalado-y-chinchilla (parte de Hoffmann) y attention-is-all-you-need (números de sección 3.2.x, 3.5, 4, 5, 6): el abstract sí se confirmó; la estructura interna, no con el PDF. Coincide con el paper tal como lo conozco.
(La «fatiga de aprobación» y «99 % es un suspenso» de Willison en camel: confirmadas en simonwillison.net/2025/Apr/11/camel/.)


## Lote V2

- modelos/10 y cursos/ia-en-la-empresa/05: la afirmación de que el fine-tuning retiene hechos de forma poco fiable y puede aumentar la seguridad con la que inventa se presenta como conocimiento general, sin cita. Es coherente con la guía de OpenAI (fine-tuning para comportamiento, RAG para conocimiento), pero esa guía no habla del aumento de alucinaciones. No se añadió cita porque no la pude verificar en esta sesión; si se quiere una, buscar en una pasada posterior el paper de Gekhman et al. (2024) sobre fine-tuning con conocimiento nuevo.
- La guía de OpenAI se cita como «al menos una veintena»; el texto dice «a set of 20+ questions and answers» en un ejemplo, no como una regla explícita. Lo dejo: la paráfrasis es fiel.
- Los metadatos de arXiv no se pudieron sacar de export.arxiv.org ni de Semantic Scholar (proxy 403 / fuera de la lista permitida); se verificaron con arxiv.org/pdf, arxiv.org/abs y ar5iv a partir de resultados de búsqueda.


## Lote V3

- arXiv 2609.00006 (estudio de once harness; Codex adopta el vocabulario de hooks): arXiv no es accesible; se apoya en el informe 1B (marcado verificado) en 90/01 y 90/03.
- Radar vol. 34 de Thoughtworks (15 abr. 2026), Lütke/Karpathy (jun. 2025), LangChain (52,8 → 66,5 %, 10 mar. y 17 feb. 2026) y la cita de Cognition (abr. 2026, revisor sin contexto compartido): solo vía informes 1A/1B; las páginas de langchain.com, simonwillison.net y trychroma.com no se abrieron con WebFetch en esta pasada.
- «El mantenedor de Spec Kit observó que la fiabilidad baja tras compactar» (90/04): solo en 1B (may. 2026), sin enlace primario.
- Sesión real de Claude Code (90/05 paso 8, curso lecciones 5, 9, 11): no se ejecutó una sesión con el modelo. El hook y el harness se probaron alimentándolos con el JSON que enviaría Claude Code; el callback del Agent SDK se comprobó por firma e importación, no en una ejecución con API.
- Tiempos de la suite (1,3-1,5 s en el texto frente a unos 21 s en esta máquina) y la fecha/hora de las salidas pegadas son de la máquina del autor.


## Lote V4

- `claude-opus-4-8` en `allowed_fallback_models` de Sonnet 5.5: la documentación no publica la lista por modelo (solo la Models API con la cabecera beta, sin clave aquí). Los ejemplos usan Sonnet 5, que la guía de migración de Sonnet 5.5 sí nombra. Afecta además a `glosario/fallback-de-modelo.md` (fuera del lote): su ejemplo usa `claude-opus-4-8`; revisar con el mismo criterio.
- Si compactación y limpieza pueden ir en la misma lista `edits`: la documentación no lo dice; los tipos del SDK lo permiten. Queda dicho en `docs/contexto/05`.
- «No puede ir un `system` justo tras el turno con bloque `compaction`»: dato de LOTES; la página de mensajes de sistema no trata la compactación. Redactado como consecuencia de la regla de posición.
- Fecha exacta de la facturación de rechazos (24 sep. 2026): la página oficial dice solo «septiembre de 2026»; la fecha viene de 1A.
- Túneles MCP (`/v1/tunnels`, `mcp-tunnels-2026-06-22`, vista previa de investigación): solo en 1A.
- Forma de `budget` de sesión y valores de `stop_reason` de `session.status_idle` en Managed Agents: solo tipos del SDK 2.3.0 y 1A (la página de presupuestos no estaba en la lista permitida).
- Números de versión de Go/Java/C#/PHP/Ruby/CLI de 2026-10-21: la guía de migración solo da Python 2.0.0; el resto viene de 1A.
- Salidas «reales» pegadas en las recetas (ids `msg_000x` y cifras del simulador): proceden de scripts de comprobación más largos que los bloques publicados; los resultados esenciales se han reproducido, no los ids.


## Lote V5

- Qué otras herramientas leen `AGENTS.md` y con qué precedencia (docs/claude-code/01, roadmap/50/index y 01): no confirmado; los textos lo dicen y remiten a agents.md.
- Lista completa de clientes de Agent Skills y su soporte por campo (roadmap/50/01, 02, 04): agentskills.io/clients se genera con JavaScript; solo se cita lo de Anthropic y los cargadores de comunidad.
- `probar_activacion.py` (roadmap/50/04) contra la CLI real: no hay clave ni red a la API; `invoco_skill` probado solo con mensajes de ejemplo.
- Skills API real (roadmap/50/04): comprobado con el SDK y transporte simulado, no contra la API; la página de platform.claude.com no estaba en la lista de URL permitidas.
- Mini-ejemplos con `claude -p` en CI (docs/claude-code/08): sintaxis de flags contrastada con headless.md; el workflow de GitHub no se ha ejecutado.
- `/tasks` (docs/claude-code/09): solo citado en agent-view.md en la resolución de problemas; se usa para "lista lo que corre en segundo plano".


## Lote V6

- Mensaje «registry.ollama.ai/library/<modelo>:latest does not support tools» (problemas/modelo-local…): sin servidor Ollama; la página lo atribuye a informes públicos.
- Textos exactos de los 400 de tool_result sin tool_use (problemas/tool-result…): no se pueden provocar sin clave; coinciden con informes públicos y con el simulador.
- Cuerpo literal del 429 estándar (no figura en la documentación): la página no lo inventa (`'message': '…'`).
- Tasa de reintento de `diagnostics` en `messages.create` frente a `beta.messages.create`: la firma del SDK 2.3.0 lo acepta, pero no se pudo ejecutar contra la API real.
- Los enlaces de paginas/fuentes y radares no se pudieron abrir desde el entorno (proxy); se contrastaron por WebFetch los que están en la lista permitida (OpenAI, LangChain, Anthropic, Invariant, Snyk, OWASP, METR, FPF, Cognition, MCP, OpenTelemetry) y por los informes 1A/1B el resto. No contrastados: github.com/a2aproject, midu.dev, mouredev.pro, YouTube y docs.langchain.com (GRAPH_RECURSION_LIMIT; la URL sale del propio mensaje de error real de LangGraph).
- Lista ASI01-ASI10: solo fuente secundaria (la página de OWASP no la enumera).
- Nota para otros lotes: radar/2026-10-22-arnes-de-codex-en-abierto enlaza a una entrada fechada el 29 oct. (harness-alojado-managed-agents); existe en el mapa.


## Lote V7

- 03-a2a: no pude abrir entera la especificación de a2a-protocol.org (página truncada y URL versionada fuera de la lista permitida). Las firmas JWS sobre JSON canonicalizado, la entrega *push* «al menos una vez» (la guía de la AAIF solo dice que se asuman duplicados) y la elección de la primera interfaz soportada quedan respaldadas por la guía de la AAIF y el informe 1A, no por el texto normativo.
- 04 y la plantilla agents-md: agents.md no está en la lista permitida. Lo que se afirma de AGENTS.md viene del blog de la AAIF y de la doc de Claude Code.
- 02: las implementaciones experimentales de Server Cards en los SDK de Python y Go salen de PR citados en SEP-2127. No comprobé si se han fusionado (el texto ya dice «compruébalo en el repositorio»).


## Lote V8

No se ha podido confirmar ni el título ni el canal de ninguno de ellos: oEmbed y noembed están bloqueados y WebSearch no los encontró. Siguen en las tablas con «—» como duración y con títulos descriptivos (sin comillas) donde el autor no recoge el título.

- 01-fase-0: ninguno. Faltan las duraciones de los cursos de Google y de midu.dev (no son vídeos).
- 02-fase-1: Tg1MjMIVArc y RkYuH_K7Fx4 (NLP), qTNUbPkR2ao (programar una red), V8j1oENVz00 y ysqpl6w6Wzg (convolucionales), 90QDe6DQXF4 (GAN). Sin título exacto, sin duración y sin ficha del autor: las fichas de la carpeta «Fase 1» acaban en la 1.9.
- 03-fase-2: aL-EmKuB078 y xi94v_jl26U (Transformers/GPT), _0GzTdr-EYs (Stable Diffusion; el autor lo titula «¿Es Stable Diffusion la mejor IA generadora de imágenes?», sin confirmar). Las fichas de «Fase 2» están vacías.
- 04-fase-3: Sz4qacFBHLk, yAF3bopYMGk y 4mkudbx-1qI (LLM, DotCSV). Las fichas de «Fase 3» están vacías.
- 07-fase-4: csIAc8rwooc (MoureDev, comparativa) y MgtM_Ktuc5A (BettaTech): título y duración.
- 08-fase-5: H3gH_Fe6xvs (título solo según el autor), GarWqdHzwac (día 1) y kcSKbwVYXCg (día 3): duración y, en el día 1, también el título. irR8437xihg: título confirmado, pero no el canal ni la duración (más de 1:26).
- 09-fase-6: midu.dev/curso/intensivo-mcp («1:11, 20 clases», solo según el autor; la página no se pudo abrir). Las dos URL de Anthropic Academy sobre MCP: duración, e idioma inglés deducido del curso de skills.
- 10-fase-7: UGh6q6rKVM4 (taller de skills, título según el autor), wxgwLTOh7wI (NotebookLM; canal desconocido, ya marcado «sin confirmar»), duración del curso de Academy.
- 11-fase-8: 5HaOxAAA5qI (título según el README del repositorio; duración desconocida), Q4MSS9WuomQ (BettaTech «Hermes Agent + Claude Code = Arquitectura IA de 5.000€», según el autor).
- 12-fase-9: q9Vaoz0hd0U (título y canal desconocidos, ya marcado «sin confirmar»).
- 14-ecosistema: los tres contenidos no tienen enlace en la ruta del autor («¡Curso de OpenCode ahora!», «Antigravity desde cero», comparativas de BettaTech), y @la_inteligencia_artificial no está comprobado.


## Lote V9

- Pesos y términos de LM Studio (aplicación): `lmstudio.ai` no está en la lista permitida; se mantiene `propietaria` según el informe 2B. Tampoco pude abrir el changelog para confirmar 0.4.1 como última (sigue el informe).
- Claude Agent SDK: la licencia efectiva es ambigua entre el archivo MIT del repositorio y el README (Commercial Terms); lo dejo como propietaria y marcado en el texto. Conviene que el autor decida.
- goose 1.57.0 sale del `Cargo.toml` de la rama principal, no de la página de releases (inaccesible por la proxy). Sin comprobar que sea una versión publicada.
- OpenCode 2.x: no se comprobó la compatibilidad de `opencode.json` ni de `ollama launch opencode` con la línea 2.
- Ejemplos no ejecutables aquí: Ollama, vLLM, LM Studio, Llama Guard, Docling, Phoenix real (la ficha lo declara en cada uno). Inspect: ejecución completa imposible sin red para el tokenizador. Haystack, Strands, MAF, CrewAI, ADK y smolagents solo se comprobó la construcción, sin llamada a la API (como dicen las fichas).
- GitHub API (`gh api`) denegada en la sesión: licencias leídas de los archivos raw, no del campo `license` de la API.


## Lote V10

- Ninguno pendiente en el lote. Datos de Claude Code (omitClaudeMd, onFailure, --worktree, --bare, comentarios HTML) y de la API (tool search, PTC, fallback, task_budget, Managed Agents, toolsets) contrastados solo con el informe 1A, no con la documentación en vivo.
- Los detalles del harness del autor (GATE#1, acceptance.yaml, veredictos, new-session, olas) no se contrastaron con su repositorio; se dan por buenos como material del autor.


## Lote V11

- «llama.cpp v0.7.0 es la primera versión estable con versionado semántico» (radar tgi-archivado, docs/02, curso 02, herramientas/llama-cpp): las notas de la v0.7.0 confirman versión, puerto 9931 y Docker 8080, pero no dicen «semver»; la afirmación viene del informe 2B (enlaza una discusión de GitHub sobre versionado de ggml-org que no pude leer).
- Licencias de Qwen3.8-2.4T (50 M$), GLM-5.3 (10.000 M$) y MiniMax M3 (radar licencias): solo del informe 2B (LICENSE en Hugging Face); no los abrí uno a uno.
- LM Studio 0.4.1 y router de SGLang 0.5.22 con `/v1/messages` (radar APIs): del informe 2B.
- Licencias de modelos de embeddings y de Prompt Guard 2: las páginas lo dicen y remiten a la model card (correcto, sin confirmar).
- Ejemplos que necesitan Ollama, vLLM, GPU, PyTorch o Hugging Face (sentence-transformers, Phoenix, `vllm serve`, `ollama launch`): sintaxis contrastada con documentación oficial, no ejecutados.
- Un `sed -i` o `tee` sobre feature_list.json esquivaría el hook de ejemplo de sistemas/agente-de-larga-duracion (heurística `>`); es un ejemplo ilustrativo, lo dejo anotado.


## Lote V12

- Bloque RAGAS de rag/10 (`fidelidad_ragas.py`): RAGAS 0.4.3 y sus firmas vienen de 2B y de la ejecución de R03a contra un endpoint falso; intenté repetirlo en un venv propio pero la instalación por pip no terminó (resolución lenta por el proxy) y la abandoné. El venv de RAGAS de 2B ya no existe en disco. No hay inferencia real contra un juez local.
- `sandbox.py` de seguridad/04 (Docker): no hay demonio en esta máquina; solo sintaxis (ya anotado por R03a).
- Lista ASI01–ASI10 de OWASP: la fuente primaria no se pudo leer (WebFetch/arXiv bloqueados); consta en fuente secundaria y la página remite a la edición vigente.
- Nombres exactos de las URL anthropic.com/engineering usadas en seguridad/04 (how-we-contain-claude, claude-code-auto-mode, claude-code-sandboxing): proceden de las listas de 1B; anthropic.com no se pudo abrir desde aquí.
- Servidor de archivos de referencia (`npx @modelcontextprotocol/server-filesystem`) en mcp/02: no se lanzó (sin red a npm en el ejemplo); se probó con un servidor stdio propio.


## Lote V13

- Nombres exactos de ASI01–ASI10 de OWASP Agentic 2026 (100/04 solo cita algunas categorías): la página oficial no las lista en el texto accesible.
- Estado «Development» y fecha de junio de 2026 del repositorio semantic-conventions-genai: confirmado que el repo existe; el estado depende de 1B/2B (GitHub docs bloqueado a WebFetch).
- Ollama, vLLM, Langfuse/Phoenix reales, Temporal/DBOS/Restate: sin ejecutar (sintaxis de documentación).
- Versiones de actions/checkout@v4 y setup-python@v5 en 80/05: no comprobadas a oct. 2026 (sin cambios respecto al original).


## Lote V14

- Comportamiento exacto de promptfoo ante `temperature` en el proveedor de Claude y la salida pegada de `promptfoo eval` (recetas/evals-con-promptfoo): `npm i promptfoo` no terminó en el tiempo disponible; la salida se hizo con proveedores simulados y no la reejecuté.
- Licencia exacta del servidor de Langfuse (recetas/trazas-con-langfuse): sin acceso al repositorio; el texto remite al `LICENSE` y no afirma.
- Contenido literal de las URL externas de los cursos: sin acceso directo desde el entorno; se apoyan en 1B.
- `navegador.ts` (uso-del-ordenador/02) sin compilar: faltan los tipos de Playwright para TS en el entorno.
- Nota para el coordinador: roadmap/60-multiagente/03 podría seguir forzando `tool_choice` (aviso de R03b); `mock_anthropic.py` no devuelve 400 al forzado según R03b (no lo probé).


## Lote V15

- Enlaces arXiv (1706.03762, 2005.14165, 2201.11903, 2307.03172, 2203.02155, 2203.15556, 2001.08361, 2212.08073, 2501.12948) en roadmap 00–30: WebFetch/curl no llegan a arXiv; los ID corresponden a los artículos citados por conocimiento propio.
- Precio/multiplicadores de caché y tramos de 00/05: se remiten a la página oficial; no comprobados contra ella.
- Comportamiento exacto de la API cuando la entrada sola supera la ventana (00/03): la documentación consultada no lo detalla; el texto dice solo «error».
- Ollama (num_ctx que trunca, num_predict -1, endpoint compatible Anthropic), CrossEncoder (sentence-transformers) y modelos/licencias de embeddings y rerankers: no ejecutados aquí (sin servidor/torch); según informe 2B y la documentación.
- `npx @modelcontextprotocol/inspector` y `claude mcp add`: no ejecutados.


## Lote V16

- con_phoenix.py (11): requiere servidor Phoenix; sintaxis tomada del informe 2A; marcado nocheck y avisado en el texto. Licencias Elastic-2.0 (servidor Phoenix) / Apache-2.0 (arize-phoenix-otel): no recontrastadas con la fuente primaria.
- con_langfuse.py (11): ejecutado hasta la llamada al modelo (sin clave real); no se ha visto una traza llegar a un servidor Langfuse. Licencia del servidor autoalojado: el texto ya remite a revisarla.
- postgres.py (06): requiere PostgreSQL; nocheck, avisado en el texto.
- Ejemplos con ChatAnthropic/ChatOllama reales: no ejecutados (sin clave ni Ollama); solo se comprobó la petición con el simulador.
- Nombre de modelo local «qwen3.6:27b» (02, 03, soporte.py): no verificado contra el catálogo de Ollama.
- «Langfuse SDK 5.x»: PyPI muestra 5.0.4, coherente, pero no se ha leído su changelog.


## Lote V17

- LlamaIndex SentenceSplitter (recetas/trocear-documentos): solo en prosa; no se pudo ejecutar aquí (bloqueo de la caché de nltk).
- Ollama real (clasificar_local, embed_local, qwen3.6:27b, bge-m3): sintaxis comprobada con la API del paquete ollama y respuestas simuladas; no hay servidor Ollama aquí.
- El enlace anthropic.com/engineering/how-we-contain-claude resuelve a /research/ (misma página); se deja como está.


## Lote V18

- 04-langchain: «ToolErrorMiddleware (langchain >= 1.3.14)» y las versiones de LangChain.js: no hay changelog accesible; el middleware existe en 1.4.7.
- 03: «setting_sources=None carga todos» y la V2 session API de TS retirada: solo documentación, sin ejecutar el CLI.
- 11: qué ruta de pasarela usa Mastra para «anthropic/...» (ya señalado en el texto como no confirmado); ejecuciones contra Ollama real (ya declaradas como no hechas).
- 09: qué parte de AgentOS (Agno) es de pago (ya declarado como no confirmado). Versiones de TS del Claude Agent SDK avanzan (0.3.314 en npm hoy frente a 0.3.312 citada con fecha).
