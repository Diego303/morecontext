# Investigación 1 · Parte B — Prácticas, técnicas y conocimiento de vanguardia para construir agentes

> Fecha de corte: 29 oct. 2026. Fuentes primarias consultadas con WebSearch/WebFetch en esta sesión salvo donde se indica.
> Convenciones: **[V]** verificado en la fuente en esta sesión · **[S]** verificado solo en fuente secundaria · **[NR]** dato conocido pero no reverificado en esta sesión (el presupuesto compartido de 200 búsquedas se agotó al final) · **SIN CONFIRMAR** = buscado y no confirmado.
> Fuera de alcance (lo cubren otros informes): API/Agent SDK/Claude Code/MCP/A2A/Skills/AGENTS.md como producto o estándar; frameworks e infraestructura OSS.

---

## 1. Resumen ejecutivo

- **«Harness engineering» es el término del año.** Se populariza en feb. 2026: OpenAI (Ryan Lopopolo, 11 feb. 2026, *Harness engineering: leveraging Codex in an agent-first world*), LangChain (17 feb. y 10 mar. 2026) y Birgitta Böckeler en martinfowler.com (memo 17 feb.; artículo largo 2 abr. 2026). Anthropic ya usaba «harness» en *Effective harnesses for long-running agents* (26 nov. 2025). Definición operativa más citada: **Agente = Modelo + Arnés**; el arnés es todo lo que no es el modelo (instrucciones, herramientas, sandbox, hooks, verificación, orquestación). [V]
- **El arnés mueve resultados medibles, pero no siempre compensa.** LangChain subió de 52,8 % a 66,5 % en Terminal-Bench 2.0 cambiando solo el arnés (modelo fijo) [V]. Naresh Jain (martinfowler.com, 13 oct. 2026): con un modelo frontera el arnés costó ×7 sin ganar fiabilidad (10/10 en ambos); con un modelo barato pasó de 3/10 a 10/10 y salió un 33 % más barato que el frontera sin arnés [V]. Anthropic: «cada componente del arnés codifica una suposición sobre lo que el modelo no puede hacer solo» y conviene retirarlos cuando el modelo mejora (24 mar. 2026) [V].
- **Patrón canónico para tareas largas (Anthropic, nov. 2025):** agente inicializador + agente de código; `init.sh`, `claude-progress.txt`, lista de funcionalidades en **JSON** con `passes: false` que solo puede cambiar a `true`, commit por cambio y prueba extremo a extremo al empezar cada sesión. Evolución (mar. 2026): planificador → generador → evaluador con «contratos de sprint». [V]
- **Context engineering ya tiene base empírica y técnicas estándar:** *context rot* medido por Chroma en 18 modelos (14 jul. 2025); compactación, notas estructuradas y subagentes que devuelven resúmenes de 1.000–2.000 tokens (Anthropic, 29 sept. 2025); carga diferida de herramientas (*tool search*, −85 % de tokens de definiciones), llamadas programáticas a herramientas (−37 %) y ejecución de código con MCP (150.000 → 2.000 tokens en el ejemplo). [V]
- **Evals: guía de referencia nueva.** *Demystifying evals for AI agents* (Anthropic, 9 ene. 2026): tarea/ensayo/grader/transcripción/resultado; capacidad frente a regresión; pass@k frente a pass^k; empezar con **20–50 tareas sacadas de fallos reales**. Hamel Husain y Shreya Shankar: análisis de errores con ~100 trazas, etiquetas binarias, juez validado con TPR/TNR (FAQ actualizada 18–21 sept. 2026). [V]
- **SWE-bench Verified deja de ser referencia.** OpenAI dejó de reportarlo (23 feb. 2026): 59,4 % de 138 problemas auditados tenían defectos y hay contaminación; recomienda SWE-bench Pro. Anthropic: el ruido de infraestructura mueve hasta 6 pp en Terminal-Bench 2.0; desconfía de ventajas < 3 pp. [V]
- **Seguridad: el marco mental está asentado y es arquitectónico.** *Lethal trifecta* (Willison, 16 jun. 2025), *Agents Rule of Two* (Meta, 31 oct. 2025), CaMeL (arXiv 2503.18813) y seis patrones de diseño (arXiv 2506.08837). Las defensas por detección caen ante ataques adaptativos (12 defensas superadas con > 90 % de éxito, arXiv 2510.09023). OpenAI: la inyección «probablemente nunca se resolverá del todo» (22 dic. 2025). [V]
- **OWASP Top 10 for Agentic Applications 2026** publicado el 9 dic. 2025 (ASI01 *Agent Goal Hijack* … ASI10 *Rogue Agents*). La web solo cita el Top 10 LLM. [V/S]
- **Cadena de suministro de skills/MCP es un riesgo real y medido:** Snyk (5 feb. 2026) analizó 3.984 skills: 13,4 % con problema crítico, 76 maliciosas confirmadas. Invariant Labs definió *tool poisoning*, *rug pull* y *shadowing* (1 abr. 2025). [V]
- **Multiagente: consenso 2026 = escrituras en un solo hilo.** Cognition revisó su «Don't Build Multi-Agents» (12 jun. 2025) en *Multi-Agents: What's Actually Working* (22 abr. 2026): funcionan revisor con contexto limpio, «amigo listo» (modelo grande como herramienta) y gestor + hijos tipo *map-reduce-and-manage*; no funcionan enjambres de escritores en paralelo. Anthropic: multiagente ≈ 15× tokens de un chat. [V]
- **Observabilidad:** las convenciones GenAI de OpenTelemetry siguen en estado *Development* (ningún atributo `gen_ai.*` estable) y se movieron a su propio repositorio `open-telemetry/semantic-conventions-genai` con la versión 1.42.0 (12 jun. 2026). Árbol típico: `invoke_agent` → `chat` → `execute_tool`. [V/S]
- **RAG 2026:** el contexto largo gana de media cuando hay recursos, RAG es mucho más barato y no hay bala de plata (Li et al. 2024; LaRA, ICML 2025). Los 11 arneses de código estudiados en arXiv 2609.00006 recuperan código **sin embeddings** (grep, tree-sitter, archivos de contexto). [V]
- **Voz:** objetivo práctico de ~800 ms de mediana voz a voz (1.500 ms en prototipo) (Kwindla Kramer, jun. 2025) [V]; OpenAI describe GPT-Live (3 ago. 2026): dúplex completo, sin detector de turno separado, delega en modelos frontera en segundo plano; API «próxima» [V].
- **Empresa:** el marco más limpio y citable sigue siendo el de OpenAI (*Optimizing LLM Accuracy*): problema de **contexto** → RAG; problema de **comportamiento** → fine-tuning; empezar por prompt + evals; fijar una precisión de equilibrio de negocio. Medir productividad es difícil: METR (−19 % en 2025) declaró su propio diseño poco fiable en feb. 2026. AI Act: alto riesgo Anexo III aplazado al 2 dic. 2027 (Omnibus publicado en el DOUE el 24 jul. 2026). [V]
- **Novedades jul.–oct. 2026 que cambian cómo se construye:** OpenAI publica en abierto el arnés de Codex (19 ago. 2026); OTel GenAI separado en repo propio (12 jun.) con v1.43 (3 jul.); estudio de código fuente de 11 arneses (arXiv 2609.00006, jul.); FAQ de evals de Husain/Shankar (sept.); Anthropic reemplaza git por Scion ante 30.000+ cambios fusionados al día (13 oct.); «Are Harnesses Worth the Cost?» (13 oct.). [V/S]

---

## 2. Hallazgos por tema

### 2.1 Harness engineering

**Qué es.** Diseñar todo lo que rodea al modelo para que un agente acierte a la primera y se corrija solo: instrucciones, herramientas, entorno (sandbox, navegador, observabilidad), *hooks*/middleware deterministas, verificación, orquestación y el bucle de mejora del propio arnés.
- LangChain: «Agent = Model + Harness»; «If you're not the model, you're the harness». Componentes: instrucciones; herramientas/skills/servidores; infraestructura (filesystem, sandbox, navegador); orquestación (subagentes, *handoffs*, enrutado de modelos); hooks y middleware (compactación, continuación, lint). (Vivek Trivedy, *The Anatomy of an Agent Harness*, 10 mar. 2026) [V]
- OpenAI (Codex): «That surrounding execution system is the harness»: reunir contexto, razonar, usar herramientas, aplicar políticas de sandbox y aprobación, mantener trabajo entre turnos. (*Codex as a platform*, 19 ago. 2026) [V]
- Böckeler: «harness» = «everything in an AI agent except the model itself»; para usuarios de agentes de código, el **outer harness** tiene dos fines: aumentar la probabilidad de acierto inicial y dar un bucle de feedback antes de la revisión humana. (2 abr. 2026) [V]

**Origen y fechas (confirmadas).**
| Fecha | Hito | Estado |
|---|---|---|
| 26 nov. 2025 | Anthropic, Justin Young · *Effective harnesses for long-running agents* | [V] |
| 4 feb. 2026 | OpenAI, Celia Chen · *Unlocking the Codex harness: how we built the App Server* (JSON-RPC sobre stdio; primitivas *items*, *turns*, *threads*) | [V] |
| feb. 2026 | Mitchell Hashimoto, blog personal (*My AI Adoption Journey*, sección «Engineer the Harness»). Böckeler sugiere que el término puede venir de ahí | **SIN CONFIRMAR** fecha exacta y texto (URL no accesible) |
| 11 feb. 2026 | OpenAI, Ryan Lopopolo · *Harness engineering: leveraging Codex in an agent-first world* | [V] |
| 17 feb. 2026 | Böckeler · *Harness Engineering – first thoughts* (memo); nota que OpenAI usa «harness» una sola vez | [V] |
| 17 feb. 2026 | LangChain, Vivek Trivedy · *Improving Deep Agents with harness engineering* | [V] |
| 10 mar. 2026 | LangChain · *The Anatomy of an Agent Harness* | [V] |
| 24 mar. 2026 | Anthropic, Prithvi Rajasekaran · *Harness design for long-running application development* | [V] |
| 2 abr. 2026 | Böckeler · *Harness engineering for coding agent users* (martinfowler.com/articles/harness-engineering.html) | [V] |
| 15 abr. 2026 | Thoughtworks Radar vol. 34: tema «Putting coding agents on a leash» (feedforward + feedback) | [V] |
| jul. 2026 | Barbaste et al. · *Harness Engineering: Anatomy, Architecture, and Evolution of Coding Agents* (arXiv 2609.00006) | [V] |
| 19 ago. 2026 | OpenAI · *Codex as a platform: build on the open agent harness* (arnés, CLI, app-server y SDK en abierto en `openai/codex`) | [V]; licencia Apache-2.0 solo en fuente secundaria [S] |
| 13 oct. 2026 | Naresh Jain (martinfowler.com) · *Are Harnesses Worth the Cost?* | [V] |

**Diferencias con prompt y context engineering (síntesis útil para enseñar).**
- Prompt engineering: redactar instrucciones (sobre todo el *system prompt*).
- Context engineering: elegir y mantener el conjunto óptimo de tokens en cada llamada (Anthropic, 29 sept. 2025).
- Harness engineering: además del contexto, el **entorno y los controles**: herramientas, sandbox, tests, linters, hooks, verificadores, orquestación, telemetría que el agente puede leer y el ciclo de mejora del arnés. Böckeler lo formaliza:
  - **Guías (feedforward)** frente a **sensores (feedback)**.
  - **Computacionales** (deterministas: tests, linters, type checkers, ArchUnit) frente a **inferenciales** (revisión con IA, LLM como juez; caros y no deterministas: úsalos selectivamente).
  - Tres categorías de regulación: mantenibilidad (la más resuelta), *fitness* de arquitectura y **comportamiento (la menos resuelta)**.
  - «Steering loop»: cada vez que un problema se repite, mejora el arnés.

**Casos públicos.**
- **OpenAI/Codex (11 feb. 2026)** [V]: 0 líneas escritas a mano; ~1 M de líneas en 5 meses; ~1.500 PR; de 3 a 7 ingenieros; 3,5 PR/ingeniero/día; primer commit a finales de ago. 2025; ejecuciones de Codex de «más de seis horas». Prácticas: `AGENTS.md` de ~100 líneas como **índice** que apunta a `docs/` (fuente de verdad versionada: diseños, planes de ejecución, specs, calidad); linters y CI que validan la documentación y cuyos mensajes incluyen la instrucción de arreglo; arquitectura por capas fija (Types → Config → Repo → Service → Runtime → UI) comprobada con tests estructurales; app por *git worktree* con stack local de logs/métricas/trazas y Chrome DevTools; agentes de «recogida de basura» que abren PR pequeños contra «principios dorados» (sustituyó una limpieza semanal que consumía ~20 % del tiempo); merge con puertas mínimas. Críticas de Böckeler: no aborda la verificación del comportamiento; fuente interesada.
- **Codex harness/App Server (4 feb. y 19 ago. 2026)** [V]: protocolo bidireccional JSON-RPC (JSONL sobre stdio), *threads* persistentes que se pueden reanudar/bifurcar, peticiones de aprobación que pausan un turno; `codex exec` para CI y tareas de fondo.
- **Claude Code (Anthropic)** [V]: sandbox de SO (Seatbelt en macOS, bubblewrap en Linux) con red denegada por defecto, −84 % de peticiones de permiso (20 oct. 2025, `sandbox-runtime` en abierto); *auto mode* con clasificador de dos etapas sobre transcripción (25 mar. 2026). Detalle de producto: informe 1A.
- **Devin (Cognition, 22 abr. 2026)** [V]: Devin + Devin Review (revisor sin contexto compartido), gestor + Devins hijos coordinados por un MCP interno.
- **LangChain Deep Agents (17 feb. 2026)** [V]: Terminal-Bench 2.0 (89 tareas, Harbor + Daytona), modelo fijo gpt-5.2-codex: 52,8 % → 66,5 %. Cambios: bucle construir-verificar en el prompt; `PreCompletionChecklistMiddleware` (verifica contra la spec antes de salir); `LocalContextMiddleware` (mapea directorios y herramientas al arrancar); avisos de tiempo; `LoopDetectionMiddleware` (tras N ediciones al mismo archivo, sugiere replantear); «sándwich de razonamiento» (xhigh planificar, high implementar, xhigh verificar; xhigh en todo dio 53,9 % por *timeouts*); skill que analiza trazas de LangSmith en paralelo.
- **Estudio de 11 arneses (arXiv 2609.00006, jul. 2026)** [V]: Claude Code, Codex CLI, Gemini CLI, Mistral Vibe, OpenHands, Aider, Mini-SWE-Agent, Hermes, Pi, OpenCode, OpenClaw (+ Omnigent como meta-arnés). Hallazgos: ninguno importa un framework de agentes genérico (bucles async propios); ninguno recupera código con embeddings; SKILL.md en 9/11, MCP en 8/11, ACP en 6; convergencia de convenciones (Codex adopta el vocabulario de hooks de Claude Code); políticas que pasan del prompt a la configuración; un bucle mínimo (Mini-SWE-Agent) rinde comparable a uno complejo: la mayor parte del código es seguridad, UX, extensibilidad.
- **Cursor, Amp:** SIN CONFIRMAR (no se obtuvieron fuentes primarias en esta sesión).

**Cómo se aplica (pasos con criterio).**
1. Mide primero sin arnés extra: si el modelo pasa de forma consistente (pass^k alto), añade solo una **puerta de aceptación final** independiente (Jain, oct. 2026).
2. Si falla de forma inconsistente, añade guías (specs, ejemplos, `AGENTS.md` como índice corto) y sensores computacionales baratos (tests, linters con mensajes de arreglo, tests estructurales).
3. Haz el entorno «legible» para el agente: logs, métricas y UI accesibles desde herramientas.
4. Usa sensores inferenciales (revisor IA, juez) solo donde lo determinista no llega.
5. Revisa trazas y convierte cada fallo repetido en una mejora del arnés (*steering loop*); retira piezas cuando un modelo nuevo las haga innecesarias (Anthropic, mar. 2026).
6. Mide el coste del arnés: tokens, tiempo y mantenimiento (Jain: ×10,5 tokens, ×3 tiempo, ×7 coste con modelo frontera).

**Fuentes:** ver tabla anterior y §6.

---

### 2.2 Context engineering (estado del arte 2026)

**Qué es.** «El conjunto de estrategias para seleccionar y mantener el conjunto óptimo de tokens durante la inferencia» (Anthropic, 29 sept. 2025) [V]. Término popularizado por Tobi Lütke y Andrej Karpathy en X (jun. 2025) y recogido por Simon Willison (27 jun. 2025) [V].

**Estado y evidencia.**
- **Context rot** (Chroma: Kelly Hong, Anton Troynikov, Jeff Huber, 14 jul. 2025) [V]: 18 LLM (GPT-4.1, Claude 4, Gemini 2.5, Qwen3…). El rendimiento cae con la longitud incluso en tareas simples; cae más rápido cuando la pregunta y la «aguja» se parecen poco; un solo distractor ya empeora; los pajares **barajados** dieron mejores resultados que los coherentes; en LongMemEval, prompts enfocados muy por encima del historial completo (~113k tokens). Conclusión: importa cómo se presenta la información, no solo que esté.
- **Modos de fallo** (Drew Breunig, 22 jun. 2025, vía LangChain): envenenamiento, distracción, confusión, choque [V].
- **Taxonomía de estrategias** (LangChain, 2 jul. 2025): *write* (fuera de la ventana), *select* (traer en el paso adecuado), *compress* (resumir/recortar), *isolate* (subagentes, sandboxes, estado) [V].
- **Anthropic (29 sept. 2025)** [V]: prompt de sistema a la «altitud correcta»; herramientas autocontenidas y sin solapes; ejemplos canónicos diversos; **recuperación just-in-time** con identificadores ligeros (rutas, consultas, URLs); para horizontes largos: **compactación**, **notas estructuradas** fuera de la ventana y **subagentes** que devuelven 1.000–2.000 tokens.
- **Herramientas de plataforma (Anthropic)** [V] (detalle de API en 1A):
  - *Context editing* + *memory tool* (29 sept. 2025): +39 % en una eval interna de búsqueda agéntica; *context editing* solo +29 %; −84 % de tokens en una eval de 100 turnos.
  - *Tool search* con `defer_loading: true` (24 nov. 2025): −85 % de tokens de definiciones (~77K → ~8,7K); precisión en evals MCP: Opus 4 49 % → 74 %, Opus 4.5 79,5 % → 88,1 %. Úsalo si las definiciones superan ~10K tokens, hay 10+ herramientas o varios servidores MCP; no compensa con < 10 herramientas compactas usadas siempre.
  - *Programmatic tool calling*: −37 % de tokens (43.588 → 27.297) en tareas de investigación complejas; úsalo con 3+ llamadas dependientes o datos grandes que solo necesitas resumidos.
  - *Tool use examples* (`input_examples`): 72 % → 90 % en manejo de parámetros complejos.
- **Ejecución de código con MCP** (Adam Jones y Conor Kelly, 4 nov. 2025) [V]: presentar servidores MCP como API de código en el sistema de archivos (`./servers/google-drive/getDocument.ts`); el agente lista y lee solo lo que necesita; ejemplo de 150.000 → 2.000 tokens (−98,7 %); filtrar 10.000 filas y ver 5; datos intermedios fuera del contexto (y tokenización de PII); guardar funciones como skills. Coste: sandbox, límites y monitorización.
- **Progressive disclosure con skills** (Barry Zhang, Keith Lazuka, Mahesh Murag, 16 oct. 2025) [V]: nivel 1 nombre+descripción en el system prompt; nivel 2 cuerpo de SKILL.md al ser relevante; nivel 3+ archivos enlazados bajo demanda.
- **Lecciones de Manus** (Yichao «Peak» Ji, 18 jul. 2025) [V]: diseña para la tasa de acierto de la **caché KV** (prefijo estable, contexto *append-only*, serialización determinista; ratio entrada:salida ~100:1; entrada cacheada 10× más barata en su ejemplo); **enmascara, no quites** herramientas a mitad de tarea; el sistema de archivos como contexto con compresión **restaurable** (conservar la URL aunque se descarte el contenido); «recitación» de objetivos con `todo.md` al final del contexto; **deja los errores en el contexto**; introduce variación para no caer en imitación de patrones.
- **Recursive Language Models** (Zhang, Kraska, Khattab, MIT; arXiv 2512.24601, v3 11 may. 2026) [V]: el prompt largo es una variable en un REPL; el modelo escribe código para inspeccionarlo y lanza subllamadas. Mediana +26 % frente a compactación en 4 tareas de contexto largo, con coste comparable (resultados de los autores).

**Por qué importa.** El cuello de botella de los agentes ya no es el tamaño de la ventana sino la calidad de lo que entra. Cada token cuesta dinero, latencia y atención.

**Cómo se aplica.**
1. Mide los tokens por componente (sistema, herramientas, historial, resultados) en cada paso.
2. Prefijo estable y cacheable; nada dinámico al principio.
3. Herramientas: si > 10 o > 10K tokens de definiciones, carga diferida; si hay cadenas de 3+ llamadas o resultados grandes, código.
4. Recupera just-in-time (grep/glob/consultas) antes que precargar.
5. En tareas largas: notas/archivo de progreso + compactación; subagentes para exploración con resumen de 1–2K tokens.
6. Compresión restaurable; deja los errores; recita el plan.

**Fuentes:** §6.

---

### 2.3 Agentes de larga duración y trabajo autónomo

**Patrones con fuente.**
- **Inicializador + agente de código** (Anthropic, Justin Young, 26 nov. 2025) [V]
  - Inicializador: crea `init.sh` (arranca el servidor), `claude-progress.txt`, commit inicial y **lista de funcionalidades JSON** (en el ejemplo, 200+ entradas con `category`, `description`, `steps`, `passes`; todas en `false`). Ambos agentes comparten system prompt, herramientas y arnés: solo cambia el primer mensaje.
  - Cada sesión del agente de código: `pwd` → leer git log y progreso → elegir la funcionalidad pendiente de mayor prioridad → ejecutar `init.sh` y una prueba e2e básica → trabajar en **una** funcionalidad → commit descriptivo → actualizar progreso. «Estado limpio»: código que podría fusionarse sin limpieza.
  - Regla: el agente solo puede cambiar `passes`; «It is unacceptable to remove or edit tests…». JSON porque el modelo lo sobrescribe menos que Markdown.
  - Verificación con automatización de navegador (Puppeteer MCP) mucho mejor que tests unitarios o `curl`.
  - Fallos y remedios: victoria prematura → lista de funcionalidades; entorno roto → git + progreso + prueba al inicio; marcar hecho sin probar → autoverificación; tiempo perdido en arrancar → `init.sh`.
- **Planificador → generador → evaluador** (Anthropic, Prithvi Rajasekaran, 24 mar. 2026) [V]: el planificador convierte 1–4 frases en una spec de producto; generador por sprints; evaluador con Playwright MCP que prueba como usuario y suspende el sprint si un criterio baja de su umbral. «Contratos de sprint» negociados por archivos antes de construir. *Context resets* (ventana nueva con traspaso estructurado) frente a compactación: necesarios con Sonnet 4.5 por «ansiedad de contexto», innecesarios con Opus 4.5; con Opus 4.6 se quitaron los sprints y el evaluador pasó a una sola pasada final. Coste: ejecución en solitario 20 min/9 $ frente a arnés completo 6 h/200 $; DAW: 3 h 50 min/124,70 $. «Merece la pena cuando la tarea está más allá de lo que el modelo actual hace bien solo».
- **Equipo de 16 agentes en paralelo** (Nicholas Carlini, 5 feb. 2026) [V]: bucle bash infinito que relanza Claude Code en contenedor; cada agente clona un repo *bare* y reclama tareas con archivos de bloqueo en `current_tasks/`; sin orquestador. ~2.000 sesiones en dos semanas, ~2.000 M tokens de entrada y 140 M de salida, < 20.000 $; compilador C en Rust de ~100.000 líneas que compila Linux 6.9 (x86, ARM, RISC-V), QEMU, FFmpeg, SQLite, Postgres, Redis. Lecciones: el verificador debe ser casi perfecto («otherwise Claude will solve the wrong problem»); usar GCC como oráculo para que cada agente arregle un fallo distinto (16 agentes no ayudan si todos se atascan en el mismo bug); el modelo «no sabe la hora»: limita salida y muestrea tests (`--fast`); CI para no romper lo existente.
- **Ralph loop** [V vía Thoughtworks; fuente original SIN CONFIRMAR]: mismo prompt fijo en un bucle infinito, cada iteración con ventana nueva; el agente elige una tarea del plan/spec, la implementa y reinicia; el código converge a la spec. Atribuido a Geoffrey Huntley (ghuntley.com/ralph, 2025; fecha exacta SIN CONFIRMAR). Thoughtworks Radar vol. 34 (15 abr. 2026): anillo **Assess**; contras: muchos tokens.
- **Paralelismo y revisión** (Simon Willison, 5 oct. 2025) [V]: el límite es la revisión humana; tareas buenas para paralelo: investigación/prototipos, explicaciones del código, mantenimiento pequeño, trabajo muy especificado («Code that started from your own specification is a lot less effort to review»); técnica del «explorador» (lanzar una tarea difícil sin intención de fusionar para ver dónde duele); aislar con checkouts separados/worktrees y contenedores; modo sin aprobaciones solo donde no pueda entrar contenido malicioso.
- **Escala real** (Anthropic, 13 oct. 2026, vía Simon Willison) [S]: ~2.500 cambios fusionados/día en may. 2026 → 30.000+/día en sept.; git no escalaba (historial ~100 GB, 25 M checkouts/día en CI) y construyeron Scion (control de versiones centralizado) y un sistema de revisión propio; revisión adversarial entre modelos efectiva pero «miope».

**Por qué importa.** La ventana de contexto no es memoria de trabajo para horas. El estado debe vivir fuera (archivos, git), la verificación debe ser externa y el humano revisa por hitos.

**Cómo se aplica (receta mínima).**
1. Spec/plan + lista de criterios verificables en JSON (solo se marca `passes`).
2. Archivo de progreso + git como memoria; commit por unidad de trabajo.
3. Script de arranque y prueba e2e al inicio de cada sesión.
4. Evaluador separado y escéptico (más fácil de ajustar que pedir autocrítica al generador).
5. Paralelo solo con tareas independientes, aislamiento (worktree/contenedor) y un verificador que permita repartir fallos.
6. Presupuesto de tiempo/tokens y aviso de tiempo restante.

---

### 2.4 Spec-driven development (SDD)

**Qué es.** Escribir una especificación antes del código y hacer que el agente trabaje contra ella. Böckeler distingue tres niveles (15 oct. 2025) [V]: **spec-first** (spec antes de la tarea), **spec-anchored** (la spec se mantiene y evoluciona con la funcionalidad) y **spec-as-source** (solo se edita la spec; el código se genera).

**Herramientas y estado.**
| Herramienta | Qué hace | Estado/fecha |
|---|---|---|
| GitHub **Spec Kit** | CLI que prepara el repo: constitución → *specify* (qué/por qué) → *plan* (cómo) → *tasks* → implementar | Anunciado 2 sept. 2025 (Den Delimarsky, github.blog) [V]; may. 2026: extensiones (~100) y *presets*, 30+ agentes [V]; web del proyecto (act. 16 jul. 2026): 35 integraciones, `uv tool install specify-cli`, `specify init <proy> --integration copilot` [V]. Nombres exactos actuales de los comandos (`/speckit.*`): SIN CONFIRMAR |
| AWS **Kiro** | IDE con specs en 3 archivos: `requirements.md` (historias + criterios en **EARS**), `design.md`, `tasks.md`; memoria «steering» | Preview 14 jul. 2025 [S]; plantilla «WHEN [condición/evento] THE SYSTEM SHALL [comportamiento]» [V] |
| **Tessl** | Aspira a spec-as-source: specs 1:1 con archivos, código marcado «GENERATED FROM SPEC - DO NOT EDIT» | Beta privada en oct. 2025 [V vía Böckeler] |
| **OpenSpec**, **Superpowers** | Aparecen en Thoughtworks Radar vol. 34 | Anillo SIN CONFIRMAR |
| **BMAD-METHOD** | Método comunitario de agentes por rol | SIN CONFIRMAR (sin fuente primaria) |

**EARS (confirmado).** Mavin, A.; Wilkinson, P.; Harwood, A.; Novak, M. «Easy Approach to Requirements Syntax (EARS)». *17th IEEE International Requirements Engineering Conference (RE'09)*, Atlanta, 31 ago.–4 sept. 2009, pp. 317–322, IEEE [V]. Mavin figura como especialista en requisitos de Rolls-Royce plc [S]. DOI 10.1109/RE.2009.9 [NR]. Patrones habituales [NR]: ubicuo («The <sistema> shall…»), por evento (WHEN), por estado (WHILE), comportamiento no deseado (IF … THEN), funcionalidad opcional (WHERE) y complejos (combinaciones).

**Qué funciona.** Specs cortas con criterios comprobables; contratos de sprint generador-evaluador (Anthropic, mar. 2026); specs + ejemplos como guías hacen fiable un modelo barato (Jain, oct. 2026); código que nace de tu spec se revisa con menos esfuerzo (Willison).

**Críticas documentadas** (Böckeler, oct. 2025) [V]: muchos Markdown repetitivos «verbose and tedious to review» («I'd rather review code than all these markdown files»); talla única: Kiro convirtió un bug pequeño en 4 historias con 16 criterios; falsa sensación de control (el agente ignora instrucciones o las sigue en exceso; Spec Kit duplicó clases ya existentes); difícil separar nivel funcional y técnico; paralelismo con *model-driven development*: riesgo de heredar inflexibilidad + no determinismo. Mantenedor de Spec Kit (may. 2026): la fiabilidad baja tras compactar; el agente es «un becario muy capaz» [V].

**Cómo se aplica.** Spec de media a dos páginas (ya está en `disciplinas/spec-primero`), criterios de aceptación en EARS o GIVEN/WHEN/THEN convertibles en tests, sección «fuera de alcance», una spec por cambio revisable. Escala la ceremonia al tamaño del cambio.

---

### 2.5 Evals de agentes

**Referencia principal: Anthropic, *Demystifying evals for AI agents*** (Mikaela Grace, Jeremy Hadfield, Rodrigo Olivares, Jiri De Jonghe; 9 ene. 2026) [V].
- Vocabulario: **tarea** (entradas + criterio de éxito), **ensayo** (*trial*), **grader**, **transcripción/traza/trayectoria**, **resultado** (*outcome*: el estado final del entorno, p. ej. si la reserva existe en la BD), **arnés de evaluación**, **arnés del agente** (se evalúan juntos modelo + arnés), **suite**.
- Graders: código (rápido, barato, reproducible; frágil ante variaciones válidas), modelo (flexible; no determinista; **calibrar contra humanos**), humano (patrón oro; caro). Puntuación ponderada, binaria o híbrida.
- **Capacidad** (empieza con tasa baja: «una colina que subir») frente a **regresión** (cerca del 100 %); las de capacidad «se gradúan» a regresión.
- **pass@k** (al menos un éxito en k) frente a **pass^k** (los k aciertan): 75 % por ensayo → pass^3 ≈ 42 %. Para agentes de cara al cliente, pass^k.
- Hoja de ruta: 0) empieza pronto con **20–50 tareas de fallos reales**; 1) convierte comprobaciones manuales y tickets; 2) tareas sin ambigüedad (dos expertos llegarían al mismo veredicto) con solución de referencia; 0 % en muchos ensayos suele indicar tarea rota; 3) conjuntos equilibrados (debe/no debe ocurrir); 4) entorno limpio por ensayo; 5) prefiere graders deterministas, califica **lo producido, no el camino exacto**, crédito parcial, opción «Unknown» para el juez; 6) **lee transcripciones** («failures should seem fair»); 7) vigila la saturación; 8) propiedad clara de las suites. Modelo de «queso suizo»: evals automáticas + monitorización + A/B + feedback + revisión de trazas.
- Ejemplos: CORE-Bench de 42 % a 95 % al arreglar bugs de calificación; Opus 4.5 «falló» τ2-bench encontrando un hueco de política mejor para el usuario.

**Ruido de infraestructura** (Gian Segato, 5 feb. 2026) [V]: en Terminal-Bench 2.0, 6 pp entre la configuración con más y menos recursos (p < 0,01); errores de infra de 5,8 % (1×) a 0,5 % (sin límite); hasta 3× los resultados están dentro del ruido; por encima, los recursos cambian lo que se mide. Recomendaciones: dos parámetros por tarea (asignación garantizada y umbral de muerte), publicar cómo se aplican, repetir en días distintos, **escepticismo ante ventajas < 3 pp**.

**Benchmarks vigentes y qué miden (sin cifras de puntuación).**
| Benchmark | Qué mide | Referencia | Nota 2026 |
|---|---|---|---|
| SWE-bench Verified | Resolver issues reales de Python con tests | OpenAI, ago. 2024 [NR] | **OpenAI dejó de reportarlo** (23 feb. 2026): 59,4 % de 138 problemas auditados con defectos (35,5 % tests demasiado estrechos, 18,8 % demasiado amplios), contaminación [V] |
| SWE-bench Pro | Issues largos, a menudo multiarchivo; 1.865 problemas de 41 repos: público 731, reservado 858, comercial 276 | Deng et al., Scale AI, arXiv 2509.16941 (21 sept. 2025) [V] | Recomendado por OpenAI como sustituto «no perfecto» |
| Terminal-Bench 2.0 | Tareas realistas en terminal; 89 tareas; formato Harbor | Merrill, Shaw, Carlini et al., arXiv 2601.11868 (ene. 2026) [V] | Sensible a recursos (Anthropic) |
| τ-bench / τ²-bench | Agente-usuario-herramientas; τ² con **control dual** (el usuario también actúa; dominio telecom) | Yao et al., arXiv 2406.12045 (2024) [V]; Barres et al., arXiv 2506.07982, ICML 2026 [V] | Origen de pass^k |
| MCP-Atlas | Uso de herramientas reales: 36 servidores MCP, 220 herramientas, 1.000 tareas (500 públicas/500 privadas) | Bandi et al., arXiv 2602.00933 (31 ene. 2026) [V] | Separa errores de llamada y de razonamiento |
| OSWorld (y OSWorld-Verified) | Uso del ordenador en SO reales | Xie et al., arXiv 2404.07972 (2024) [NR]; *Verified* SIN CONFIRMAR fecha | — |
| WebArena | Agentes web en sitios simulados | [NR] | Citado por Anthropic |
| GAIA | Asistentes generales con herramientas | Mialon et al., arXiv 2311.12983, ICLR 2024 [V] | — |
| BrowseComp | Encontrar información difícil navegando | Wei et al., OpenAI, arXiv 2504.12516 (abr. 2025) [V] | Anthropic publicó sobre *eval awareness* en BrowseComp (6 mar. 2026; no leído) |
| METR time horizon | Duración de tareas humanas que el modelo completa al 50 % | Kwa, West et al., arXiv 2503.14499 (v3 25 feb. 2026) [V] | Duplicación ~7 meses (207 días, IC 95 % 166–240); horizonte al 80 % 4–6× más corto |

**Prácticas de Hamel Husain y Shreya Shankar** [V]:
- Análisis de errores (27 jun. 2025, act. 1 sept. 2026): dataset realista (~100 trazas diversas) → **open coding** (notas libres; al menos 30 trazas a mano; anota el **primer fallo** de cada traza) → **axial coding** (taxonomía y recuento; «el paso más importante») → refinar hasta **saturación teórica**. «Do not skip error analysis».
- FAQ (18 sept. 2026, act. 21 sept.): etiquetas **binarias** (no Likert); si quieres gradiente, varias comprobaciones binarias; juez validado con **TPR y TNR**; partición 10–20 % entrenamiento / 40–45 % dev / 40–45 % test, 30–50 pasa y 30–50 falla en dev y test; 100–200 ejemplos por modo de fallo; un «dictador benevolente» experto; ellos dedican 60–80 % del desarrollo a análisis de errores y evaluación; métricas genéricas (ROUGE, BERTScore) inútiles salvo en recuperación.
- *Criteria drift*: los criterios cambian al ver salidas (Shankar et al., *Who Validates the Validators?*, UIST 2024, arXiv 2404.12272) [V título].

**pass@k:** estimador insesgado de Chen et al. 2021 (arXiv 2107.03374) [V]; ya implementado correctamente en `cursos/evals-para-agentes/01-que-medir` (comprobado: `pass_at_k(10,7,3)=0,992`, `pass_hat_k=0,292`).

**Cómo se aplica.** 20–50 tareas de fallos reales → graders deterministas sobre el estado final → juez binario validado (TPR/TNR) para lo subjetivo → n ensayos por tarea y pass^k → leer trazas cada semana → graduar a regresión en CI → no elegir modelo por ventajas públicas < 3 pp.

---

### 2.6 Seguridad de agentes

**Marcos mentales (confirmados).**
- **Lethal trifecta** (Simon Willison, 16 jun. 2025) [V]: acceso a datos privados + exposición a contenido no fiable + capacidad de comunicar al exterior. «The only way to stay safe there is to avoid that lethal trifecta combination entirely».
- **Agents Rule of Two** (Meta AI, 31 oct. 2025; autor no indicado) [V]: en una sesión, como mucho dos de [A] procesar entradas no fiables, [B] acceder a sistemas sensibles o datos privados, [C] cambiar estado o comunicar al exterior. Si hacen falta las tres: supervisión (aprobación humana u otra validación fiable) o contexto nuevo. No cubre errores, alucinaciones ni privilegios excesivos: complementa al mínimo privilegio.
- **CaMeL** (Debenedetti, Shumailov, Fan, Hayes, Carlini, Fabian, Kern, Shi, Terzis, Tramèr; arXiv 2503.18813, v1 24 mar. 2025, v2 24 jun. 2025) [V]: extrae control y flujo de datos de la consulta del usuario de confianza; los datos no fiables no pueden alterar el flujo; capacidades para impedir exfiltración. AgentDojo: 77 % de tareas con seguridad demostrable frente a 84 % sin defensa. Afiliaciones (Google, Google DeepMind, ETH Zúrich) [NR].
- **Design Patterns for Securing LLM Agents against Prompt Injections** (Beurer-Kellner, Buesser, Creţu, Debenedetti, Dobos, Fabian, Fischer, Froelicher, Grosse, Naeff, Ozoani, Paverd, Tramèr, Volhejn; arXiv 2506.08837, 10 jun. 2025) [V]. Principio: una vez que el agente ingiere entrada no fiable, debe estar restringido para que esa entrada no pueda disparar acciones con consecuencias. Seis patrones: **Action-Selector**, **Plan-Then-Execute**, **LLM Map-Reduce**, **Dual LLM**, **Code-Then-Execute**, **Context-Minimization**.
- **The Attacker Moves Second** (Nasr, Carlini, Sitawarin, Schulhoff, Hayes, Ilie, Pluto, Song, Chaudhari, Shumailov, Thakurta, Xiao, Terzis, Tramèr; arXiv 2510.09023, 10 oct. 2025; USENIX Security 2026) [V]: con ataques adaptativos superan 12 defensas recientes con > 90 % de éxito en la mayoría, cuando estas reportaban casi 0 %. Consecuencia: no te fíes de detectores evaluados con ataques estáticos.

**OWASP.**
- Top 10 for LLM Applications **2025** [V]: LLM01 Prompt Injection · LLM02 Sensitive Information Disclosure · LLM03 Supply Chain · LLM04 Data and Model Poisoning · LLM05 Improper Output Handling · LLM06 Excessive Agency · LLM07 System Prompt Leakage · LLM08 Vector and Embedding Weaknesses · LLM09 Misinformation · LLM10 Unbounded Consumption. (Coincide con la tabla de `cursos/seguridad-y-prompt-injection/03-defensas-en-capas`.)
- **Top 10 for Agentic Applications for 2026** (OWASP GenAI Security Project, 9 dic. 2025) [V fecha; lista S]: ASI01 Agent Goal Hijack · ASI02 Tool Misuse and Exploitation · ASI03 Identity and Privilege Abuse · ASI04 Agentic Supply Chain Vulnerabilities · ASI05 Unexpected Code Execution (RCE) · ASI06 Memory & Context Poisoning · ASI07 Insecure Inter-Agent Communication · ASI08 Cascading Failures · ASI09 Human-Agent Trust Exploitation · ASI10 Rogue Agents.
- OWASP Agentic Skills Top 10 (AST01 *Malicious Skills*): proyecto existente; estado y lista SIN CONFIRMAR.

**MCP y cadena de suministro.**
- Invariant Labs (Beurer-Kellner, Fischer; 1 abr. 2025) [V]: **tool poisoning** (instrucciones ocultas en descripciones), **rug pull** (la descripción cambia tras aprobarla), **shadowing** (un servidor altera el uso de otro). Mitigaciones: mostrar descripciones completas, fijar versiones y verificar hash de descripciones, fronteras entre servidores.
- Especificación MCP · *Security Best Practices* (versión `latest`, que enlaza la revisión 2026-07-28) [V]: *confused deputy* en proxies OAuth (consentimiento por cliente), **token passthrough prohibido** (no aceptar tokens no emitidos para el servidor), SSRF en descubrimiento OAuth (bloquear rangos privados, proxy de salida), **secuestro de *state handles*** (MCP es *stateless* y no tiene sesiones de protocolo en esta revisión; el *session hijacking* queda para ≤ 2025-11-25), compromiso de servidores locales (mostrar el comando completo, sandbox), validación de URL de autorización, minimización de *scopes*. Confirmar cambios de protocolo con el informe 1A.
- **Snyk ToxicSkills** (5 feb. 2026) [V]: 3.984 skills de ClawHub y skills.sh; 13,4 % con problema crítico; 36,82 % con algún fallo; 76 maliciosas confirmadas (100 % con código malicioso, 91 % también inyección); 17,7 % de ClawHub descarga contenido no fiable. Recomendación: tratar skills como npm/PyPI; revisar archivos de memoria (`SOUL.md`, `MEMORY.md`). Fuente de proveedor: cifras de detección autodeclaradas.
- Anthropic (16 oct. 2025): instala skills solo de fuentes de confianza; revisa scripts y dependencias [V].

**Sandboxing y permisos (casos primarios).**
- Claude Code sandbox (David Dworken, Oliver Weller-Davies; 20 oct. 2025) [V]: aislamiento de filesystem + de red; −84 % de peticiones de permiso.
- *Auto mode* (John Hughes, 25 mar. 2026) [V]: clasificador sobre la transcripción en dos etapas (filtro rápido tendente a bloquear + razonamiento si marca); sonda de inyección en salidas de herramientas; «ciego al razonamiento» (no ve la prosa del agente ni resultados de herramientas); deniega y continúa; escala a humano tras 3 denegaciones seguidas o 20 en total. Tasas: falsos positivos 0,4 % (n=10.000 tráfico real); falsos negativos 17 % en acciones excesivas reales (n=52), 5,7 % en exfiltración sintética. «No sustituye a una revisión humana cuidadosa en infraestructura crítica».
- *How we contain Claude across products* (McGuinness, Grace, De Jonghe, Eaton, Ribbink; 25 may. 2026) [V]: amenazas = mal uso del usuario, mal comportamiento del modelo, atacantes externos; usuarios aprobaban ~93 % de los permisos (fatiga); un empleado «phisheado» llevó a exfiltrar credenciales en 24 de 25 reintentos (solo lo paran controles de salida y fronteras de filesystem); **una lista blanca de dominios es una capacidad** (api.anthropic.com con clave del atacante); la salida de herramientas es superficie de ataque. Principios: «Design for containment at the environment layer first, then steer behavior at the model layer»; «Match isolation strength to the user's capacity for oversight»; «The deterministic boundary is what gets hit when everything probabilistic misses». Preocupaciones futuras: envenenamiento de memoria persistente, escalada de confianza entre agentes, identidad de agentes.

**Regulación/estándares (EE. UU.).** NIST CAISI publicó una RFI sobre seguridad de agentes (Federal Register, 8 ene. 2026; comentarios hasta 9 mar. 2026; docket NIST-2025-0035) [V] y un resumen de respuestas (NIST, 18 may. 2026, serie *Trustworthy and Responsible AI*, «800-5») [V]. «AI Agent Standards Initiative» (feb. 2026): SIN CONFIRMAR detalles en fuente primaria.

**Cómo se aplica (checklist).**
1. Dibuja el flujo de datos y marca A/B/C (Rule of Two) por sesión.
2. Si hay trifecta, rompe una pata: sin salida a red (proxy de salida con lista corta y credenciales ligadas a sesión), sin datos privados o con aprobación humana sobre los argumentos reales.
3. Elige un patrón de diseño (Plan-Then-Execute, Dual LLM, Code-Then-Execute) en lugar de confiar en detectores.
4. Sandbox de SO o VM según la capacidad de supervisión del usuario.
5. Fija versiones de servidores MCP y skills; revisa descripciones y scripts; hash de descripciones.
6. Evalúa con ataques adaptativos y mide fatiga de aprobación.

---

### 2.7 Memoria para agentes (conceptos)

- **Tipos (CoALA, Sumers, Yao, Narasimhan, Griffiths; TMLR feb. 2024; arXiv 2309.02427)** [V]: **de trabajo** (lo activo en el ciclo actual), **episódica** (experiencias/trayectorias pasadas), **semántica** (conocimiento del mundo y de sí mismo), **procedimental** (saber hacer: en los pesos y en el código/prompts; hoy, también skills).
- **MemGPT** (Packer, Wooders, Lin, Fang, Patil, Stoica, Gonzalez; arXiv 2310.08560, 12 oct. 2023) [V]: gestión de contexto virtual por niveles como un SO (ventana = memoria rápida; almacenamiento externo = lenta). El proyecto continúa como Letta [NR].
- **Mem0** (Chhikara, Khant, Aryan, Singh, Yadav; arXiv 2504.19413, 28 abr. 2025) [V]: extraer, consolidar y recuperar hechos; variante con grafo; en LOCOMO, +26 % relativo frente a la memoria de OpenAI, −91 % de latencia p95 y > 90 % menos tokens frente a contexto completo (autodeclarado).
- **Zep / Graphiti** (Rasmussen, Chalef; ene. 2025; arXiv 2501.13956) [V]: grafo de conocimiento con conciencia temporal; DMR 94,8 % frente a 93,4 % de MemGPT; LongMemEval hasta +18,5 % y −90 % de latencia (autodeclarado).
- **Memory tool de Anthropic** (29 sept. 2025) [V]: directorio de archivos gestionado por el cliente vía herramienta; el desarrollador controla el almacenamiento.
- **LangMem** (LangChain): SIN CONFIRMAR (no consultado).
- **Riesgos:** ASI06 *Memory & Context Poisoning*; Anthropic señala el envenenamiento de memoria persistente entre sesiones (may. 2026); Snyk: skills maliciosas persisten vía archivos de memoria.

**Cómo se aplica.** Decide qué tipo necesitas (¿preferencias del usuario = semántica?, ¿casos resueltos = episódica?, ¿cómo hacer X = procedimental/skill?), con qué política de escritura (quién escribe, cuándo, con qué validación), caducidad y borrado, y trata la memoria como entrada no fiable al leerla.

---

### 2.8 Sistemas multiagente

- **Anthropic, *How we built our multi-agent research system*** (Hadfield, Zhang, Lien, Scholz, Fox, Ford; 13 jun. 2025) [V]: orquestador Opus 4 + subagentes Sonnet 4 superó al agente único Opus 4 en un **90,2 %** en su eval interna; agentes ≈ **4×** tokens de un chat y multiagente ≈ **15×**; en BrowseComp el uso de tokens explica el **80 %** de la varianza (tres factores, el 95 %). Encaja: mucha paralelización, información que no cabe en una ventana, muchas herramientas, tareas de alto valor. No encaja: contexto compartido o muchas dependencias, la mayoría de tareas de código, coordinación en tiempo real.
- **Cognition, *Don't Build Multi-Agents*** (Walden Yan, 12 jun. 2025) [V]: «Share context, and share full agent traces, not just individual messages»; «Actions carry implicit decisions, and conflicting decisions carry bad results».
- **Cognition, *Multi-Agents: What's Actually Working*** (Walden Yan, 22 abr. 2026) [V]: funciona: bucle generador-verificador con **revisor sin contexto previo**; «smart friend» (modelo pequeño principal que consulta a uno grande como herramienta; el *fork* del contexto completo es un 80/20 razonable); gestor + hijos (*map-reduce-and-manage*, con mucho context engineering); subagentes de solo lectura. No funciona: enjambres de escritores en paralelo, redes sin estructura, «smart friend» con principal débil. Regla: «writes stay single-threaded and the additional agents contribute intelligence rather than actions»; «the open problems are all communication problems».
- **LangChain, *How and when to build multi-agent systems*** (Harrison Chase, 16 jun. 2025) [V]: tareas de lectura paralelizan bien; las de escritura sufren al fusionar; ambos posts dicen lo mismo: el problema es compartir contexto.
- **Carlini (feb. 2026)**: paralelismo sin orquestador con locks y git funciona cuando el verificador permite repartir fallos.
- **Riesgos:** ASI07 (comunicación insegura entre agentes), ASI08 (fallos en cascada); escalada de confianza (Anthropic, may. 2026).

**Cómo se aplica.** Empieza con un agente; añade subagentes de lectura para aislar contexto; mantén un único escritor; si hay revisor, sin contexto compartido; pasa contexto generoso (trazas, no mensajes sueltos); mide tokens por rol (ya cubierto en `roadmap/60-multiagente/05`).

---

### 2.9 Observabilidad (OpenTelemetry GenAI)

- **Estado** [S, coherente con el repo oficial]: todas las convenciones `gen_ai.*` en **Development** (sin atributos estables propios; solo `error.type`, `server.address`, `server.port` heredados). Con **v1.42.0 (12 jun. 2026)** las convenciones GenAI (incluidas OpenAI y **MCP**) se movieron a **`open-telemetry/semantic-conventions-genai`**; las páginas antiguas de opentelemetry.io son redirecciones [V: la página antigua de *agent spans* lo confirma]. El repo nuevo no tiene releases etiquetadas y su *Schema URL* es «TODO» [V]. Versiones previas: 1.39 (12 ene.), 1.40 (19 feb.), 1.41 (28 abr.: métricas de streaming, `invoke_workflow`, `invoke_agent` en cliente e interno), 1.43 (3 jul.) [S].
- **Spans** [V blog OTel + S]: inferencia `chat` (también `generate_content`, `text_completion`) y `embeddings`, nombre `{operación} {modelo}`; agentes `create_agent`, `invoke_agent` (los subagentes anidan otro `invoke_agent`); además `invoke_workflow`, `plan`, `execute_tool`, `retrieval` y operaciones de memoria. Árbol típico: `invoke_agent` → `chat` → `execute_tool`.
- **Atributos** [S]: obligatorios en inferencia `gen_ai.operation.name`, `gen_ai.provider.name` (sustituye a `gen_ai.system`); condicionales `gen_ai.request.model`, `error.type`, `gen_ai.conversation.id`, `gen_ai.output.type`; recomendados `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.response.finish_reasons`; agente/herramienta `gen_ai.agent.name|id|version`, `gen_ai.tool.name`, `gen_ai.tool.call.id`, `gen_ai.tool.type`. `gen_ai.prompt`/`gen_ai.completion` eliminados.
- **Contenido**: prompts y respuestas **opt-in** (`gen_ai.input.messages`, `gen_ai.output.messages`), por privacidad; el mecanismo depende de cada instrumentación; transición con `OTEL_SEMCONV_STABILITY_OPT_IN` [S].
- **Adopción** (OTel blog, James Newton-King, 14 may. 2026) [V]: VS Code Copilot emite trazas, métricas y eventos; Codex, logs y métricas; Claude Code, métricas y logs con trazas en beta. Métricas: `gen_ai.client.operation.duration`, `gen_ai.client.token.usage`.
- Antecedente: OTel blog *AI Agent Observability – Evolving Standards and Best Practices* (Guangya Liu, Sujay Solomon; 6 mar. 2025) [V].

**Cómo se aplica.** Emite un span por llamada al modelo y por herramienta bajo un span de agente; usa los nombres `gen_ai.*` actuales pero fija la versión de la instrumentación (cambian entre releases); captura contenido solo con política de datos; añade coste calculado como atributo propio.

---

### 2.10 RAG en 2026

| Técnica | Qué es | Referencia [estado] |
|---|---|---|
| Contextual Retrieval | Anteponer a cada fragmento un contexto generado; embeddings + BM25 contextuales + reranking | Anthropic, 19 sept. 2024: fallos de recuperación (1 − recall@20) −35 % (embeddings), −49 % (+BM25), −67 % (+reranking); si la base < 200.000 tokens (~500 páginas), métela entera en el prompt [V] |
| Late chunking | Pasar el documento completo por un modelo de embeddings de contexto largo y trocear **antes del *mean pooling*** | Günther, Mohr, Williams, Wang, Xiao (Jina AI), arXiv 2409.04701, 7 sept. 2024 [V] |
| ColBERT / *late interaction* | Embeddings por token y puntuación MaxSim entre consulta y documento | Khattab y Zaharia, SIGIR 2020, arXiv 2004.12832 [V] |
| GraphRAG | Grafo de entidades + resúmenes de comunidades para preguntas globales («query-focused summarization») | Edge et al., Microsoft, arXiv 2404.16130, abr. 2024 [V] |
| LightRAG | Indexación en grafo más ligera y recuperación dual (local/global) | Guo et al., arXiv 2410.05779; Findings EMNLP 2025 [V] |
| Agentic RAG | El agente decide cuándo, qué y cómo recuperar, iterando | Singh et al., arXiv 2501.09136, ene. 2025 [V] |
| RAG vs contexto largo | LC gana de media con recursos suficientes; RAG mucho más barato; *Self-Route* enruta | Li, Li, Zhang, Mei, Bendersky, arXiv 2407.16833 (jul. 2024; EMNLP 2024 Industry) [V] |
| | «No silver bullet»: depende de modelo, longitud, tipo de tarea y recuperación | LaRA, Li et al., ICML 2025 (PMLR 267) [V] |
| Evaluación | RAGAS (sin referencias: fidelidad, relevancia) y ARES (jueces entrenados + intervalos de confianza) | Es et al., arXiv 2309.15217 [NR]; Saad-Falcon et al., NAACL 2024, arXiv 2311.09476 [V] |

**Evidencia práctica:** los arneses de código no usan embeddings para el código (arXiv 2609.00006) [V]; *context rot* refuerza recuperar poco y bien [V]; Husain: métricas de similitud solo útiles para recuperación [V].

**Cómo se aplica.** Base pequeña → todo en el prompt con caché; mediana → híbrida + recuperación contextual + reranker; preguntas globales sobre corpus → GraphRAG/LightRAG; agentes → recuperación just-in-time como herramienta; evalúa recuperación (recall@k) y generación (fidelidad) por separado con juez validado.

---

### 2.11 Uso del ordenador y agentes de navegador

- **Estado de seguridad (fechas confirmadas)** [V]:
  - Anthropic, *Mitigating prompt injections in browser use* (24 nov. 2025): tasa de éxito de ataque con atacante interno *best-of-N*: Opus 4.5 8,0 % → 1,4 % con salvaguardas mejoradas; Sonnet 4.5 13,8 % → 1,9 %; «1 % sigue siendo riesgo significativo». Técnicas: RL con inyecciones simuladas, clasificadores sobre contenido no fiable, red teaming.
  - OpenAI, *Continuously hardening ChatGPT Atlas against prompt injection attacks* (22 dic. 2025): atacante automático entrenado con RL que encuentra ataques de decenas o cientos de pasos; entrenamiento adversarial; «unlikely to ever be fully "solved"». Consejos: modo sin sesión iniciada, revisar confirmaciones, instrucciones específicas.
  - Brave (21 oct. 2025): inyecciones «invisibles» en capturas de pantalla contra navegadores agénticos (Comet y otros).
- **Diseño práctico** (Anthropic evals, ene. 2026) [V]: interacción por DOM (rápida, más tokens) frente a capturas (más lenta, más eficiente en tokens); evaluar el **estado** (URL, backend, archivos). Practicante (Vardanyan, arXiv 2511.19477, 22 nov. 2025; un solo sistema) [V]: árbol de accesibilidad como representación principal, visión selectiva, referencias de elemento versionadas para no actuar sobre elementos caducados, acciones en lote, no repetir la misma acción fallida, conservar solo la última instantánea, seguridad en código (confirmación para acciones sensibles, listas de dominios), agentes especializados de mínimo privilegio.
- **Benchmarks:** OSWorld, WebArena (ver 2.5).
- **Coherencia con la guía:** «siempre en VM o contenedor aislado» se mantiene; añadir que la lista blanca de dominios es una capacidad (Anthropic, may. 2026).

---

### 2.12 Agentes de voz

- **Arquitecturas** (OpenAI, guía *Voice agents*, sin fecha visible) [V]: **speech-to-speech** (un modelo escucha, razona, usa herramientas y habla en una sesión) frente a **encadenada** STT → agente → TTS (permite inspeccionar/transformar el texto intermedio, aplicar políticas antes de hablar, guardar transcripciones y cambiar piezas).
- **Latencia** (Kwindla Kramer, *Advice on Voice Agents – June 2025*, gist, 23 jun. 2025) [V]: objetivo **~800 ms de mediana voz a voz**; 1.500 ms aceptable en prototipo; presupuesto P50: red ~200 ms (peor con WebSockets que con WebRTC), detección de turno + transcripción ~400 ms, LLM ~500 ms, TTS ~200 ms; una llamada a herramienta casi duplica la latencia del LLM; deja el ajuste de VAD/turnos para el final.
- **Turnos**: LiveKit (12 dic. 2025) [V]: modelo de fin de turno basado en texto (v0.4.1-intl) −39,23 % de interrupciones falsas frente a la versión anterior, 14 idiomas incluido español, sin aumento de latencia; aún no usa rasgos acústicos.
- **Dúplex completo** (OpenAI, Justin Uberti y Zahan Malkani, *How we built a realtime system for responsive voice AI in six months*, 3 ago. 2026) [V]: GPT-Live, tercera generación; quita el detector de turno separado; escucha y habla a la vez; delega trabajo difícil a modelos frontera de forma asíncrona; separa medios de lógica (una herramienta lenta no bloquea el audio); API «upcoming».
- **Benchmark**: Full-Duplex-Bench-v3 (arXiv 2604.04847): SIN CONFIRMAR contenido.

**Cómo se aplica.** Cascada si necesitas auditar, filtrar o usar tus herramientas/evals de texto; speech-to-speech si la naturalidad/latencia manda; en ambos: confirmación verbal para acciones, respuestas cortas, *filler* mientras corre una herramienta, medir P50/P95 voz a voz y tasa de interrupciones falsas.

---

### 2.13 Fundamentos para «La IA por dentro» (referencias citables)

| Tema | Referencia exacta | Enlace | Estado |
|---|---|---|---|
| Neurona formal | McCulloch y Pitts, 1943 · «A logical calculus of the ideas immanent in nervous activity», *Bull. Math. Biophysics* 5:115–133 | DOI 10.1007/BF02478259 | [NR] |
| Perceptrón | Rosenblatt, F., 1958 · «The perceptron: A probabilistic model for information storage and organization in the brain», *Psychological Review* 65(6):386–408 | https://pubmed.ncbi.nlm.nih.gov/13602029/ (DOI 10.1037/h0042519) | [V] artículo y PubMed; páginas/DOI [NR] |
| Límites del perceptrón | Minsky y Papert, 1969 · *Perceptrons: An Introduction to Computational Geometry*, MIT Press | (libro) | [NR] |
| Primer «invierno» | Lighthill, J., 1973 · «Artificial Intelligence: A General Survey» (Science Research Council, Reino Unido) | https://www.aiai.ed.ac.uk/events/lighthill1973/lighthill.pdf | [V existencia] |
| Descenso del gradiente | Cauchy, A., 1847 · «Méthode générale pour la résolution des systèmes d'équations simultanées», *Comptes Rendus* 25:536–538 | (Gallica) | [NR] |
| Gradiente estocástico | Robbins y Monro, 1951 · «A Stochastic Approximation Method», *Ann. Math. Statist.* 22(3):400–407 | https://projecteuclid.org/euclid.aoms/1177729586 (DOI 10.1214/aoms/1177729586) | [V] |
| Backpropagation | Rumelhart, Hinton y Williams, 1986 · «Learning representations by back-propagating errors», *Nature* 323:533–536 | https://doi.org/10.1038/323533a0 | [V] |
| Antecedentes backprop | Linnainmaa 1970 (modo inverso de diferenciación automática, tesis); Werbos 1974 (tesis doctoral) | — | [NR] |
| RNN simple | Elman, 1990 · «Finding Structure in Time», *Cognitive Science* 14(2):179–211 | — | [NR] |
| Gradientes que se desvanecen | Bengio, Simard y Frasconi, 1994 · «Learning long-term dependencies with gradient descent is difficult», *IEEE TNN* 5(2):157–166 | — | [NR] |
| LSTM | Hochreiter y Schmidhuber, 1997 · «Long Short-Term Memory», *Neural Computation* 9(8):1735–1780 | https://doi.org/10.1162/neco.1997.9.8.1735 | [V] |
| Sobreajuste / regularización | Srivastava, Hinton, Krizhevsky, Sutskever, Salakhutdinov, 2014 · «Dropout: A Simple Way to Prevent Neural Networks from Overfitting», *JMLR* 15:1929–1958 | https://jmlr.org/papers/v15/srivastava14a.html | [V] |
| Weight decay | Krogh y Hertz, 1991 · «A Simple Weight Decay Can Improve Generalization», NeurIPS 4 | — | [NR] |
| Doble descenso | Belkin, Hsu, Ma, Mandal, 2019 · «Reconciling modern machine-learning practice and the classical bias–variance trade-off», *PNAS* | arXiv 1812.11118 | [NR] |
| Deep learning en visión | Krizhevsky, Sutskever, Hinton, 2012 · «ImageNet Classification with Deep Convolutional Neural Networks», NeurIPS | — | [NR] |
| Embeddings de palabras | Mikolov et al., 2013 · «Efficient Estimation of Word Representations in Vector Space» | arXiv 1301.3781 | [NR] |
| Seq2seq | Sutskever, Vinyals, Le, 2014 · «Sequence to Sequence Learning with Neural Networks» | arXiv 1409.3215 | [NR] |
| Atención | Bahdanau, Cho, Bengio, 2014 · «Neural Machine Translation by Jointly Learning to Align and Translate» (ICLR 2015) | https://arxiv.org/abs/1409.0473 | [V] |
| Optimizador Adam | Kingma y Ba, 2014 · «Adam: A Method for Stochastic Optimization» | arXiv 1412.6980 | [NR] |
| Subpalabras (BPE) | Sennrich, Haddow, Birch, 2015 · «Neural Machine Translation of Rare Words with Subword Units» | arXiv 1508.07909 | [NR] |
| Transformer | Vaswani et al., 2017 (ya en la guía) | https://arxiv.org/abs/1706.03762 | ya en guía |
| GPT | Radford, Narasimhan, Salimans, Sutskever, 2018 · «Improving Language Understanding by Generative Pre-Training» (informe técnico) | https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf | [V URL] |
| BERT | Devlin, Chang, Lee, Toutanova, 2018 · «BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding» | arXiv 1810.04805 | [NR] |
| GPT-2 | Radford, Wu, Child, Luan, Amodei, Sutskever, 2019 · «Language Models are Unsupervised Multitask Learners» (informe técnico) | https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf | título [V]; URL oficial [NR] |
| GPT-3 | Brown et al., 2020 (ya en la guía) | https://arxiv.org/abs/2005.14165 | ya en guía |
| Leyes de escala | Kaplan et al., 2020 · «Scaling Laws for Neural Language Models» | https://arxiv.org/abs/2001.08361 | [V] |
| Chinchilla | Hoffmann et al., 2022 · «Training Compute-Optimal Large Language Models» | https://arxiv.org/abs/2203.15556 | [V] |
| Preferencias humanas | Christiano et al., 2017 · «Deep reinforcement learning from human preferences» | arXiv 1706.03741 | [NR] |
| RLHF para resumen | Stiennon et al., 2020 · «Learning to summarize from human feedback» | arXiv 2009.01325 | [NR] |
| InstructGPT/RLHF | Ouyang et al., 2022 · «Training language models to follow instructions with human feedback» | https://arxiv.org/abs/2203.02155 | [V] |
| Constitutional AI | Bai et al., 2022 · «Constitutional AI: Harmlessness from AI Feedback» | https://arxiv.org/abs/2212.08073 | [V] |
| DPO | Rafailov et al., 2023 · «Direct Preference Optimization: Your Language Model is Secretly a Reward Model» | arXiv 2305.18290 | [NR] |
| Evaluación de código / pass@k | Chen et al., 2021 · «Evaluating Large Language Models Trained on Code» | https://arxiv.org/abs/2107.03374 | [V] |
| Modelos de razonamiento (o1) | OpenAI, 12 sept. 2024 · «Learning to reason with LLMs» | https://openai.com/index/learning-to-reason-with-llms/ | [V URL]; fecha [NR] |
| DeepSeek-R1 | DeepSeek-AI, ene. 2025 · «DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning»; versión revisada: Guo et al., *Nature* 645:633–638 (17 sept. 2025) · «DeepSeek-R1 incentivizes reasoning in LLMs through reinforcement learning» | https://arxiv.org/abs/2501.12948 · https://doi.org/10.1038/s41586-025-09422-z | [V] arXiv y DOI; páginas [NR] |
| Habilidades emergentes (y crítica) | Wei et al., 2022 · «Emergent Abilities of Large Language Models» (arXiv 2206.07682); Schaeffer, Miranda, Koyejo, 2023 · «Are Emergent Abilities of Large Language Models a Mirage?» (arXiv 2304.15004) | — | [NR] |

**Matices que conviene enseñar bien.**
- Minsky y Papert demostraron límites del **perceptrón de una capa** (p. ej., paridad/XOR); se les suele atribuir en exceso el primer invierno, que en el Reino Unido se asocia al informe Lighthill (1973) y en EE. UU. a recortes de financiación. Segundo invierno a finales de los 80 (caída de sistemas expertos). [NR detalles]
- Backpropagation no se «inventó» en 1986: el artículo de Nature la popularizó para aprender representaciones internas. [NR antecedentes]
- Chinchilla corrige a Kaplan: para un presupuesto de cómputo, parámetros y tokens deben escalar a la par (~20 tokens por parámetro como regla citada habitualmente [NR cifra]).
- InstructGPT = SFT + modelo de recompensa + PPO; Constitutional AI sustituye parte del feedback humano por feedback de IA guiado por principios (RLAIF).
- o1 (sept. 2024) y R1 (ene. 2025): razonamiento entrenado con RL sobre recompensas verificables y cómputo en tiempo de inferencia.

---

### 2.14 IA en la empresa: decidir y medir

**Marco de decisión (citable).**
- OpenAI, *Optimizing LLM Accuracy* (guía de la plataforma; sin fecha visible) [V]: dos ejes. **Optimización de contexto** (falta conocimiento, desactualizado o propio → RAG) y **optimización del LLM** (formato, tono o razonamiento inconsistentes → fine-tuning). Secuencia: prompt sencillo + **conjunto de eval (20+ preguntas con respuesta)** → diagnosticar cada fallo como de contexto o de comportamiento → aplicar la palanca → reevaluar. No saltar a RAG/fine-tuning pronto (complejidad y riesgo de regresión). «Calidad de datos > cantidad». Fijar la **precisión de equilibrio** de negocio asignando coste/valor a resultados (ejemplo: ~81,5 %) y diseñar la degradación elegante (pedir aclaración, reintentar, pasar a humano).
- Anthropic: base < 200.000 tokens → al prompt antes que RAG (sept. 2024) [V]; «empieza por lo más simple» (*Building effective agents*, 19 dic. 2024) [V].
- «Modelo propio» (preentrenar): ningún marco serio verificado lo recomienda salvo requisitos extremos de soberanía/escala; SIN CONFIRMAR fuente citable específica.

**Medir valor (sin cifras de consultora).**
- METR, 10 jul. 2025 [V]: ensayo aleatorizado, 16 desarrolladores expertos, 246 issues: con IA tardaron un **19 % más**; esperaban −24 % y después creían −20 %. METR, 24 feb. 2026 [V]: el segundo estudio es «una señal poco fiable» (sesgo de selección: desarrolladores que se niegan a trabajar sin IA, 30–50 % de tareas retenidas; pago reducido; tiempos poco fiables con agentes concurrentes); estimaciones −18 % (IC −38 % a +9 %) y −4 % (IC −15 % a +9 %); probablemente cota inferior. Lección: la percepción no mide, y medir productividad con agentes es difícil incluso para expertos.
- DORA 2025 *State of AI-assisted Software Development* (Google Cloud, sept. 2025): existe [V título]; contenido SIN CONFIRMAR en esta sesión.
- Evita cifras tipo «el 95 % de los pilotos fracasa»: no se verificó metodología (SIN CONFIRMAR).

**Errores típicos documentados.**
1. Elegir modelo por un leaderboard público contaminado o ruidoso (OpenAI feb. 2026; Anthropic feb. 2026).
2. Métricas genéricas en lugar de análisis de errores (Husain/Shankar).
3. Multiagente por defecto (Cognition; Anthropic: ~15× tokens).
4. Permisos por diálogo → fatiga (~93 % aprobados, Anthropic may. 2026).
5. Confiar en la autoevaluación del generador (Anthropic mar. 2026: evaluador separado y escéptico).
6. Arnés caro donde el modelo ya es fiable (Jain oct. 2026).
7. Medir productividad por percepción (METR).

**Regulación UE (relevante para España).** Omnibus digital sobre IA: Parlamento 16 jun. 2026, Consejo 29 jun. 2026, DOUE 24 jul. 2026. Alto riesgo Anexo III: del 2 ago. 2026 al **2 dic. 2027**; Anexo I: al **2 ago. 2028**; art. 50 (transparencia) aplica desde el 2 ago. 2026 salvo 50(2) (contenido sintético de GPAI) al **2 dic. 2026**; GPAI desde el 2 ago. 2025 (modelos previos: 2 ago. 2027). (Future of Privacy Forum, 28 jul. 2026, act. 5 ago.) [V]. NIST AI RMF 1.0 (ene. 2023) y perfil GenAI NIST AI 600-1 (jul. 2024) [NR].

---

### 2.15 Novedades jul.–oct. 2026 que cambian cómo se construye

| Fecha | Qué | Qué cambia | Fuente |
|---|---|---|---|
| 12 jun. 2026 (justo antes) | OTel GenAI sale del repo principal (v1.42.0) | Las convenciones de agentes y MCP evolucionan aparte; fija versión | [V/S] |
| 3 jul. 2026 | Semconv v1.43.0 | Sigue en *Development* | [S] |
| jul. 2026 | Estudio de código fuente de 11 arneses (arXiv 2609.00006) | Evidencia: sin frameworks, sin embeddings para código; skills > MCP en adopción | [V] |
| 16 jul. 2026 | Spec Kit: 35 integraciones | SDD multiagente/multiherramienta | [V] |
| 24 jul. 2026 | AI Omnibus en el DOUE | Plazos de alto riesgo aplazados | [V] |
| 28 jul. 2026 | Revisión de la especificación MCP 2026-07-28 (referenciada por la página de seguridad) | Protocolo sin sesiones; *state handles* | [V parcial; detalle en 1A] |
| 3 ago. 2026 | OpenAI GPT-Live (arquitectura) | Voz dúplex con delegación asíncrona | [V] |
| 19 ago. 2026 | Arnés de Codex en abierto (`openai/codex`: harness, CLI, app-server, SDK) | Puedes construir sobre un arnés de producción | [V] |
| 1 y 18–21 sept. 2026 | Actualización de la FAQ de evals y del análisis de errores (Husain/Shankar) | Umbrales concretos para validar jueces | [V] |
| 13 oct. 2026 | Anthropic: Scion sustituye a git internamente (30.000+ cambios/día) | El control de versiones y la revisión son cuello de botella con agentes a escala | [S] |
| 13 oct. 2026 | «Are Harnesses Worth the Cost?» | Arnés según modelo: puerta final con frontera; arnés completo con modelos baratos | [V] |

SIN CONFIRMAR (no se pudo buscar más): novedades de Cursor, Cognition (después de abril), Google DeepMind y GitHub entre jul. y oct. 2026; Thoughtworks Radar vol. 35 (aún no visible en la web el día de consulta).

---

## 3. Referencias citables nuevas (para la tabla de la guía §8)

| Autores / organización | Año y mes | Título exacto | URL |
|---|---|---|---|
| Anthropic (Justin Young) | 2025-11 | Effective harnesses for long-running agents | https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents |
| Anthropic (Prithvi Rajasekaran) | 2026-03 | Harness design for long-running application development | https://www.anthropic.com/engineering/harness-design-long-running-apps |
| OpenAI (Ryan Lopopolo) | 2026-02 | Harness engineering: leveraging Codex in an agent-first world | https://openai.com/index/harness-engineering/ |
| OpenAI (Celia Chen) | 2026-02 | Unlocking the Codex harness: how we built the App Server | https://openai.com/index/unlocking-the-codex-harness/ |
| OpenAI (Nicolas Bonamy, Derrick Choi) | 2026-08 | Codex as a platform: build on the open agent harness | https://developers.openai.com/blog/codex-as-a-platform |
| Birgitta Böckeler (martinfowler.com) | 2026-04 | Harness engineering for coding agent users | https://martinfowler.com/articles/harness-engineering.html |
| Naresh Jain (martinfowler.com) | 2026-10 | Are Harnesses Worth the Cost? | https://martinfowler.com/articles/are-harnesses-worth-the-cost.html |
| LangChain (Vivek Trivedy) | 2026-02 | Improving Deep Agents with harness engineering | https://www.langchain.com/blog/improving-deep-agents-with-harness-engineering |
| LangChain (Vivek Trivedy) | 2026-03 | The Anatomy of an Agent Harness | https://www.langchain.com/blog/the-anatomy-of-an-agent-harness |
| Barbaste, Darrigol, Vu, Wiltberger | 2026-07 | Harness Engineering: Anatomy, Architecture, and Evolution of Coding Agents | https://arxiv.org/abs/2609.00006 |
| Chroma (Hong, Troynikov, Huber) | 2025-07 | Context Rot: How Increasing Input Tokens Impacts LLM Performance | https://www.trychroma.com/research/context-rot |
| Yichao «Peak» Ji (Manus) | 2025-07 | Context Engineering for AI Agents: Lessons from Building Manus | https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus |
| Anthropic (Adam Jones, Conor Kelly) | 2025-11 | Code execution with MCP: Building more efficient agents | https://www.anthropic.com/engineering/code-execution-with-mcp |
| Anthropic (Bin Wu et al.) | 2025-11 | Introducing advanced tool use on the Claude Developer Platform | https://www.anthropic.com/engineering/advanced-tool-use |
| Anthropic (Zhang, Lazuka, Murag) | 2025-10 | Equipping agents for the real world with Agent Skills | https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills |
| Anthropic | 2025-09 | Managing context on the Claude Developer Platform | https://www.anthropic.com/news/context-management |
| Zhang, Kraska, Khattab | 2025-12 (v3 2026-05) | Recursive Language Models | https://arxiv.org/abs/2512.24601 |
| Anthropic (Nicholas Carlini) | 2026-02 | Building a C compiler with a team of parallel Claudes | https://www.anthropic.com/engineering/building-c-compiler |
| Simon Willison | 2025-10 | Embracing the parallel coding agent lifestyle | https://simonwillison.net/2025/Oct/5/parallel-coding-agents/ |
| Simon Willison | 2026-02 (guía viva) | Agentic Engineering Patterns | https://simonwillison.net/guides/agentic-engineering-patterns/ |
| Thoughtworks | 2026-04 | Technology Radar vol. 34 · Ralph loop (Assess) | https://www.thoughtworks.com/es-cl/radar/techniques/ralph-loop |
| GitHub (Den Delimarsky) | 2025-09 | Spec-driven development with AI: Get started with a new open source toolkit | https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/ |
| Birgitta Böckeler | 2025-10 | Understanding Spec-Driven-Development: Kiro, spec-kit, and Tessl | https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html |
| Mavin, Wilkinson, Harwood, Novak | 2009-09 | Easy Approach to Requirements Syntax (EARS) · RE'09, pp. 317–322 | https://research.manchester.ac.uk/en/publications/easy-approach-to-requirements-syntax-ears/ |
| Anthropic (Grace, Hadfield, Olivares, De Jonghe) | 2026-01 | Demystifying evals for AI agents | https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents |
| Anthropic (Gian Segato) | 2026-02 | Quantifying infrastructure noise in agentic coding evals | https://www.anthropic.com/engineering/infrastructure-noise |
| OpenAI | 2026-02 | Why SWE-bench Verified no longer measures frontier coding capabilities | https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/ |
| Deng, Da, Pan et al. (Scale AI) | 2025-09 | SWE-Bench Pro: Can AI Agents Solve Long-Horizon Software Engineering Tasks? | https://arxiv.org/abs/2509.16941 |
| Merrill, Shaw, Carlini et al. | 2026-01 | Terminal-Bench: Benchmarking Agents on Hard, Realistic Tasks in Command Line Interfaces | https://arxiv.org/abs/2601.11868 |
| Barres, Dong, Ray, Si, Narasimhan | 2025-06 (ICML 2026) | τ²-Bench: Evaluating Conversational Agents in a Dual-Control Environment | https://arxiv.org/abs/2506.07982 |
| Yao et al. | 2024-06 | τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains | https://arxiv.org/abs/2406.12045 |
| Bandi, Dumitru, Hertzberg et al. | 2026-01 | MCP-Atlas: A Large-Scale Benchmark for Tool-Use Competency with Real MCP Servers | https://arxiv.org/abs/2602.00933 |
| Wei et al. (OpenAI) | 2025-04 | BrowseComp: A Simple Yet Challenging Benchmark for Browsing Agents | https://arxiv.org/abs/2504.12516 |
| Mialon et al. | 2023-11 | GAIA: a benchmark for General AI Assistants | https://arxiv.org/abs/2311.12983 |
| Kwa, West et al. (METR) | 2025-03 (v3 2026-02) | Measuring AI Ability to Complete Long Software Tasks | https://arxiv.org/abs/2503.14499 |
| Chen et al. | 2021-07 | Evaluating Large Language Models Trained on Code | https://arxiv.org/abs/2107.03374 |
| Hamel Husain, Shreya Shankar | 2025-06 (act. 2026-09) | Why is "error analysis" so important in AI evals, and how is it performed? | https://hamel.dev/blog/posts/evals-faq/why-is-error-analysis-so-important-in-llm-evals-and-how-is-it-performed.html |
| Hamel Husain, Shreya Shankar | 2026-09 | AI Evals: Everything You Need to Know (FAQ) | https://hamel.dev/blog/posts/evals-faq/ |
| Shankar et al. | 2024-04 | Who Validates the Validators? Aligning LLM-Assisted Evaluation of LLM Outputs with Human Preferences | https://arxiv.org/abs/2404.12272 |
| Simon Willison | 2025-06 | The lethal trifecta for AI agents: private data, untrusted content, and external communication | https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/ |
| Meta AI | 2025-10 | Agents Rule of Two: A Practical Approach to AI Agent Security | https://ai.meta.com/blog/practical-ai-agent-security/ |
| Debenedetti et al. | 2025-03 | Defeating Prompt Injections by Design (CaMeL) | https://arxiv.org/abs/2503.18813 |
| Beurer-Kellner et al. | 2025-06 | Design Patterns for Securing LLM Agents against Prompt Injections | https://arxiv.org/abs/2506.08837 |
| Nasr, Carlini et al. | 2025-10 | The Attacker Moves Second: Stronger Adaptive Attacks Bypass Defenses Against LLM Jailbreaks and Prompt Injections | https://arxiv.org/abs/2510.09023 |
| OWASP GenAI Security Project | 2025-12 | OWASP Top 10 for Agentic Applications for 2026 | https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/ |
| Invariant Labs (Beurer-Kellner, Fischer) | 2025-04 | MCP Security Notification: Tool Poisoning Attacks | https://invariantlabs.ai/blog/mcp-security-notification |
| Model Context Protocol | vigente | Security Best Practices | https://modelcontextprotocol.io/specification/latest/basic/security_best_practices |
| Snyk (Beurer-Kellner et al.) | 2026-02 | ToxicSkills (estudio de 3.984 skills) | https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/ |
| Anthropic (Dworken, Weller-Davies) | 2025-10 | Beyond permission prompts: making Claude Code more secure and autonomous | https://www.anthropic.com/engineering/claude-code-sandboxing |
| Anthropic (John Hughes) | 2026-03 | How we built Claude Code auto mode | https://www.anthropic.com/engineering/claude-code-auto-mode |
| Anthropic (McGuinness, Grace, De Jonghe, Eaton, Ribbink) | 2026-05 | How we contain Claude across products | https://www.anthropic.com/engineering/how-we-contain-claude |
| Anthropic | 2025-11 | Mitigating prompt injections in browser use | https://www.anthropic.com/news/prompt-injection-defenses |
| OpenAI | 2025-12 | Continuously hardening ChatGPT Atlas against prompt injection attacks | https://openai.com/index/hardening-atlas-against-prompt-injection/ |
| NIST CAISI | 2026-01 | Request for Information Regarding Security Considerations for Artificial Intelligence Agents | https://www.govinfo.gov/content/pkg/FR-2026-01-08/html/2026-00206.htm |
| Sumers, Yao, Narasimhan, Griffiths | 2023-09 (TMLR 2024) | Cognitive Architectures for Language Agents | https://arxiv.org/abs/2309.02427 |
| Packer et al. | 2023-10 | MemGPT: Towards LLMs as Operating Systems | https://arxiv.org/abs/2310.08560 |
| Chhikara et al. | 2025-04 | Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory | https://arxiv.org/abs/2504.19413 |
| Rasmussen et al. (Zep) | 2025-01 | Zep: A Temporal Knowledge Graph Architecture for Agent Memory | https://arxiv.org/abs/2501.13956 |
| Cognition (Walden Yan) | 2025-06 | Don't Build Multi-Agents | https://cognition.com/blog/dont-build-multi-agents |
| Cognition (Walden Yan) | 2026-04 | Multi-Agents: What's Actually Working | https://cognition.com/blog/multi-agents-working |
| LangChain (Harrison Chase) | 2025-06 | How and when to build multi-agent systems | https://www.langchain.com/blog/how-and-when-to-build-multi-agent-systems |
| OpenTelemetry | vigente | Semantic Conventions for Generative AI (repositorio) | https://github.com/open-telemetry/semantic-conventions-genai |
| OpenTelemetry (James Newton-King) | 2026-05 | Inside the LLM Call: GenAI Observability with OpenTelemetry | https://opentelemetry.io/blog/2026/genai-observability/ |
| Günther et al. (Jina AI) | 2024-09 | Late Chunking: Contextual Chunk Embeddings Using Long-Context Embedding Models | https://arxiv.org/abs/2409.04701 |
| Khattab, Zaharia | 2020-04 | ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT | https://arxiv.org/abs/2004.12832 |
| Edge et al. (Microsoft) | 2024-04 | From Local to Global: A Graph RAG Approach to Query-Focused Summarization | https://arxiv.org/abs/2404.16130 |
| Guo et al. | 2024-10 | LightRAG: Simple and Fast Retrieval-Augmented Generation | https://arxiv.org/abs/2410.05779 |
| Singh et al. | 2025-01 | Agentic Retrieval-Augmented Generation: A Survey on Agentic RAG | https://arxiv.org/abs/2501.09136 |
| Li, Li, Zhang, Mei, Bendersky | 2024-07 | Retrieval Augmented Generation or Long-Context LLMs? A Comprehensive Study and Hybrid Approach | https://arxiv.org/abs/2407.16833 |
| Li et al. | 2025-02 (ICML 2025) | LaRA: Benchmarking Retrieval-Augmented Generation and Long-Context LLMs – No Silver Bullet for LC or RAG Routing | https://arxiv.org/abs/2502.09977 |
| Saad-Falcon et al. | 2023-11 | ARES: An Automated Evaluation Framework for Retrieval-Augmented Generation Systems | https://arxiv.org/abs/2311.09476 |
| Kwindla Hultman Kramer | 2025-06 | Advice on Voice Agents – June 2025 (gist) | https://gist.github.com/kwindla/f755284ef2b14730e1075c2ac803edcf |
| OpenAI (Justin Uberti, Zahan Malkani) | 2026-08 | How we built a realtime system for responsive voice AI in six months | https://openai.com/blog/continuous-voice-interaction-with-gpt-live |
| OpenAI | vigente | Optimizing LLM Accuracy | https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy |
| METR | 2025-07 | Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity | https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ |
| METR (Becker, Rush, Cunningham, Rein, Mahamud) | 2026-02 | We are Changing our Developer Productivity Experiment Design | https://evals.alignment.org/blog/2026-02-24-uplift-update/ |
| Rumelhart, Hinton, Williams | 1986 | Learning representations by back-propagating errors | https://doi.org/10.1038/323533a0 |
| Rosenblatt | 1958 | The perceptron: A probabilistic model for information storage and organization in the brain | https://pubmed.ncbi.nlm.nih.gov/13602029/ |
| Hochreiter, Schmidhuber | 1997 | Long Short-Term Memory | https://doi.org/10.1162/neco.1997.9.8.1735 |
| Robbins, Monro | 1951 | A Stochastic Approximation Method | https://projecteuclid.org/euclid.aoms/1177729586 |
| Srivastava et al. | 2014 | Dropout: A Simple Way to Prevent Neural Networks from Overfitting | https://jmlr.org/papers/v15/srivastava14a.html |
| Bahdanau, Cho, Bengio | 2014-09 | Neural Machine Translation by Jointly Learning to Align and Translate | https://arxiv.org/abs/1409.0473 |
| Radford et al. (OpenAI) | 2018 | Improving Language Understanding by Generative Pre-Training | https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf |
| Kaplan et al. | 2020-01 | Scaling Laws for Neural Language Models | https://arxiv.org/abs/2001.08361 |
| Hoffmann et al. | 2022-03 | Training Compute-Optimal Large Language Models | https://arxiv.org/abs/2203.15556 |
| Ouyang et al. | 2022-03 | Training language models to follow instructions with human feedback | https://arxiv.org/abs/2203.02155 |
| Bai et al. | 2022-12 | Constitutional AI: Harmlessness from AI Feedback | https://arxiv.org/abs/2212.08073 |
| OpenAI | 2024-09 | Learning to reason with LLMs | https://openai.com/index/learning-to-reason-with-llms/ |
| DeepSeek-AI / Guo et al. | 2025-01 (Nature 2025-09) | DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning | https://arxiv.org/abs/2501.12948 |
| Lighthill | 1973 | Artificial Intelligence: A General Survey | https://www.aiai.ed.ac.uk/events/lighthill1973/lighthill.pdf |
| Robertson, Zaragoza | 2009 | The Probabilistic Relevance Framework: BM25 and Beyond (*Found. Trends IR* 3(4)) | https://nowpublishers.com/article/Details/INR-019 |

---

## 4. Correcciones a la base

1. **Guía §8, tabla de referencias: fechas y títulos imprecisos.**
   - «Anthropic, 2025 · Writing effective tools for agents» → título completo *Writing effective tools for agents — with agents*, **11 sept. 2025** [V listado de Anthropic].
   - «Anthropic, 2025 · Effective context engineering for AI agents» → **29 sept. 2025** [V].
   - «Anthropic, sept. 2024 · Introducing Contextual Retrieval» → fecha correcta (19 sept. 2024); la página hoy se titula *Contextual retrieval in AI systems* (misma URL) [V].
   - «Anthropic, dic. 2024 · Building effective agents» → 19 dic. 2024, «Erik S. and Barry Zhang» según la página [V] (apellido Schluntz [NR]).
   - «Robertson y Zaragoza, 2009 (sin enlace)» → hay enlace: *Foundations and Trends in IR* 3(4), https://nowpublishers.com/article/Details/INR-019 (DOI 10.1561/1500000019) [V].
2. **Guía §8: solo cita «OWASP · Top 10 for LLM Applications».** Falta el **OWASP Top 10 for Agentic Applications for 2026** (9 dic. 2025), más pertinente para agentes. Añadirlo y enlazarlo desde `disciplinas/seguridad`, `docs/seguridad/index`, `cursos/seguridad-y-prompt-injection/01` y `/03`.
3. **«No inventes cifras de benchmarks» debe ampliarse:** no presentar SWE-bench Verified como medida vigente de capacidad de código (OpenAI dejó de reportarlo el 23 feb. 2026 por defectos y contaminación); tratar diferencias < 3 pp en benchmarks agénticos como ruido (Anthropic, 5 feb. 2026). Ningún contenido actual cita SWE-bench (comprobado con grep), pero conviene fijarlo en la guía antes de escribir el docs de benchmarks.
4. **`cursos/context-engineering/01-el-contexto-como-presupuesto`:** atribuye *context rot* al artículo de Anthropic. La medición empírica que se cita como origen es **Chroma (Hong, Troynikov, Huber; 14 jul. 2025)**; Anthropic la recoge. Añadir la cita primaria.
5. **Observabilidad (`roadmap/100-produccion/01-observabilidad-y-trazas`, `docs/produccion/01-observabilidad`, `disciplinas/observabilidad`):** dicen «usa OpenTelemetry» sin matices. Falta: existen convenciones GenAI (`gen_ai.*`, spans `invoke_agent`/`chat`/`execute_tool`), están en estado *Development* y desde el 12 jun. 2026 viven en `open-telemetry/semantic-conventions-genai`. Advertir de renombres (`gen_ai.system` → `gen_ai.provider.name`) y de que el contenido de prompts es opt-in.
6. **`radar/2026-07-28-agentes-de-larga-duracion`:** la fuente es *Effective context engineering*; la fuente específica y anterior a la fecha del radar es *Effective harnesses for long-running agents* (26 nov. 2025), con el patrón inicializador + lista de funcionalidades. Cambiar o añadir fuente.
7. **`disciplinas/spec-primero`:** correcto pero sin contexto 2026: no menciona SDD como movimiento (Spec Kit, Kiro, Tessl), los niveles spec-first/anchored/as-source ni las críticas (revisión de Markdown, sobredimensionar cambios pequeños). Ampliar con EARS para criterios de aceptación.
8. **`cursos/evals-para-agentes/01-que-medir`:** las fórmulas son correctas; falta atribución: estimador insesgado de pass@k (Chen et al. 2021) y pass^k (τ-bench, Yao et al. 2024); y la cifra de referencia de Anthropic (0,75³ ≈ 42 %).
9. **MCP (para confirmar con el informe 1A):** la página de seguridad de la especificación `latest` enlaza la revisión **2026-07-28** y afirma que MCP «is stateless and has no protocol-level sessions» (el *session hijacking* se documenta para ≤ 2025-11-25). Si la guía o los cursos de MCP hablan de sesiones del protocolo o de `Mcp-Session-Id`, habrá que revisarlo (grep: solo aparece «sesión MCP» en sentido genérico en `cursos/mcp-de-cero-a-servidor/01`).
10. **Uso del ordenador (guía §8):** mantener «siempre en VM o contenedor», y añadir que una lista blanca de dominios **es una capacidad** que se puede abusar (Anthropic, may. 2026) y que la inyección en navegadores no está resuelta (OpenAI, dic. 2025).

---

## 5. Propuestas de contenido

### 5.1 Páginas nuevas

| Ruta | Título | Tipo | Puntos clave | Fuentes |
|---|---|---|---|---|
| `disciplinas/harness-engineering` | Harness engineering | disciplina (orden 13) | 1) Agente = modelo + arnés; 2) guías vs sensores, computacional vs inferencial; 3) caso OpenAI (AGENTS.md como índice, docs/ como fuente de verdad, linters con instrucción de arreglo, recogida de basura); 4) cuándo compensa (Jain) y retirar piezas (Anthropic); 5) señales de que lo haces mal: AGENTS.md enorme, sensores mudos, revisor que comparte contexto; 6) cómo empezar mañana | OpenAI feb. 2026; Böckeler abr. 2026; LangChain feb./mar. 2026; Anthropic mar. 2026; Jain oct. 2026 |
| `cursos/la-ia-por-dentro/index` + 8 lecciones | La IA por dentro | curso (nivel inicial, ~5 h) | `01-de-la-neurona-al-perceptron` (McCulloch-Pitts, Rosenblatt, Minsky-Papert, Lighthill); `02-aprender-es-bajar-una-pendiente` (Cauchy, Robbins-Monro, SGD, Adam); `03-backpropagation` (Rumelhart et al.); `04-memorizar-o-generalizar` (sobreajuste, dropout, weight decay, doble descenso); `05-secuencias-rnn-y-lstm` (Elman, Bengio 1994, Hochreiter-Schmidhuber); `06-atencion-y-transformer` (Bahdanau, Vaswani); `07-escalar-gpt-y-leyes-de-escala` (GPT-1/2/3, Kaplan, Chinchilla); `08-de-predecir-a-ayudar-y-razonar` (RLHF/InstructGPT, CAI, o1, R1) | §2.13 |
| `docs/evals/03-benchmarks-publicos` | Benchmarks públicos: qué miden y cómo leerlos | doc (intermedio) | Tabla de benchmarks (2.5) sin cifras; contaminación y retirada de SWE-bench Verified; ruido de infraestructura y regla de 3 pp; benchmark ≠ tu caso de uso | OpenAI feb. 2026; Anthropic ene./feb. 2026; arXiv citados |
| `docs/seguridad/03-patrones-contra-inyeccion` | Patrones de diseño contra la inyección | doc (avanzado) | Trifecta y Rule of Two; los 6 patrones con diagrama; CaMeL; por qué los detectores no bastan (ataques adaptativos); ejemplos por tipo de agente | Willison 2025; Meta 2025; arXiv 2506.08837, 2503.18813, 2510.09023 |
| `docs/seguridad/04-mcp-y-skills-de-terceros` | Seguridad de servidores MCP y skills de terceros | doc (avanzado) | Tool poisoning, rug pull, shadowing; token passthrough, confused deputy, SSRF, servidores locales; skills como cadena de suministro (ToxicSkills); fijar versiones y hash de descripciones; checklist de revisión | Invariant 2025; MCP Security Best Practices; Snyk 2026; Anthropic oct. 2025 |
| `docs/produccion/04-opentelemetry-genai` | Trazas de agentes con OpenTelemetry GenAI | doc (intermedio) | Árbol `invoke_agent`/`chat`/`execute_tool`; atributos clave; estado *Development* y repo nuevo; contenido opt-in; ejemplo con un span por llamada | Repo semconv-genai; OTel blog may. 2026 |
| `patrones/10-inicializador-y-agente-de-trabajo` | Inicializador y agente de trabajo | patrón (agente; coste 3, latencia 3) | Diagrama; archivos (`init.sh`, progreso, lista JSON); una funcionalidad por sesión; prueba e2e al inicio; cuándo no (tareas cortas) | Anthropic nov. 2025 |
| `patrones/11-planificador-generador-evaluador` | Planificador, generador y evaluador | patrón (agente; coste 3) | Contratos de sprint; evaluador escéptico con herramientas reales; *context reset* vs compactación; coste ×20 frente a solo | Anthropic mar. 2026; Cognition abr. 2026 |
| `patrones/12-bucle-ralph` | Bucle Ralph | patrón (agente) | Mismo prompt, ventana nueva por iteración, plan como estado; anillo Assess en Thoughtworks; coste en tokens; necesita verificador | Thoughtworks abr. 2026; Huntley (sin confirmar) |
| `sistemas/agente-de-larga-duracion` | Agente que trabaja horas sobre un repositorio | sistema (complejidad 3, 2–3 días) | Componentes (planificador, lista de funcionalidades, git, sandbox, evaluador, trazas); flujo; decisiones (reset vs compactación; uno vs varios); evaluación con pass^k; costes y riesgos | Anthropic nov. 2025, feb. y mar. 2026 |
| `recetas/analisis-de-errores-de-trazas` | Análisis de errores con 100 trazas | receta (evals, intermedio, 90 min) | Open coding → axial coding → recuento → priorizar; anotar el primer fallo; saturación | Husain/Shankar 2025–2026 |
| `recetas/validar-un-modelo-juez` | Validar un modelo juez con TPR y TNR | receta (evals, intermedio) | Etiquetas binarias; partición 10–20/40–45/40–45; 30–50 pasa/falla; medir TPR/TNR; corregir la tasa observada | Husain/Shankar sept. 2026; Anthropic ene. 2026 |
| `recetas/carga-diferida-de-herramientas` | Muchas herramientas sin llenar el contexto | receta (herramientas, intermedio) | Medir tokens de definiciones; umbral 10 herramientas/10K tokens; `defer_loading` y búsqueda; alternativa con código | Anthropic nov. 2025 (×2) |
| `recetas/agentes-en-paralelo-con-worktrees` | Agentes en paralelo con git worktrees | receta (agentes, inicial) | Un worktree por tarea; tareas independientes; locks; revisar por orden; limpiar | Willison oct. 2025; OpenAI feb. 2026; Carlini feb. 2026 |
| `recetas/criterios-de-aceptacion-con-ears` | Criterios de aceptación con EARS | receta (agentes, inicial, 30 min) | Plantillas WHEN/WHILE/IF-THEN/WHERE; de requisito a test; cuándo es excesivo | Mavin et al. 2009; Kiro docs; Böckeler 2025 |
| `modelos/10-prompt-rag-o-fine-tuning` | Prompt, RAG o fine-tuning | guía de modelos | Contexto vs comportamiento; 20+ preguntas de eval primero; base < 200K tokens al prompt; precisión de equilibrio; cuándo no aplica | OpenAI *Optimizing LLM Accuracy*; Anthropic sept. 2024 |
| `blog/…-el-arnes-importa-y-cuesta` | El arnés importa (y cuesta) | blog (análisis, estado revisión) | LangChain +13,7 pp solo con arnés; Jain: ×7 coste sin mejora con frontera; Anthropic retira piezas | §2.1 |

### 5.2 Ampliaciones de páginas existentes

- `cursos/context-engineering/02-que-meter-y-que-no`: herramientas bajo demanda (tool search), ejecución de código con MCP, lecciones de Manus (caché KV, enmascarar, compresión restaurable).
- `cursos/context-engineering/04-contexto-para-agentes-largos`: patrón inicializador; *context reset* frente a compactación; RLM como frontera de investigación.
- `cursos/evals-para-agentes/03-graders`: validación del juez con TPR/TNR; opción «Unknown»; graduar evals de capacidad a regresión.
- `roadmap/60-multiagente/01-cuando-no-usar-multiagente`: revisión de Cognition 2026 («escrituras en un solo hilo»); revisor con contexto limpio.
- `cursos/seguridad-y-prompt-injection/03-defensas-en-capas`: tabla OWASP Agentic ASI01–ASI10 junto a la de LLM 2025; ataques adaptativos.
- `cursos/seguridad-y-prompt-injection/04-permisos-y-sandbox`: fatiga de aprobación (93 %), sandbox −84 % prompts, clasificador tipo *auto mode* con sus tasas reales, listas blancas como capacidades.
- `sistemas/agente-de-voz`: presupuesto de latencia de 800 ms; detección de fin de turno semántica; dúplex completo como variante.
- `cursos/rag-a-fondo/03-recuperar-bien`: late chunking y ColBERT; `04-evaluar-un-rag`: ARES/RAGAS con advertencia de jueces sin validar; nueva sección «RAG o contexto largo» (Li 2024, LaRA).
- `docs/contexto/04-memoria`: tipos CoALA y riesgos de envenenamiento de memoria.

### 5.3 Entradas de radar (propuestas; fecha = publicación sugerida, evento entre paréntesis)

| Archivo | Título | Categoría | Fuente |
|---|---|---|---|
| `radar/2026-11-03-harness-engineering` | El arnés pasa a ser una disciplina | practicas | OpenAI (11 feb. 2026); Böckeler (2 abr. 2026); Jain (13 oct. 2026) |
| `radar/2026-11-03-arnes-de-codex-abierto` | El arnés de Codex se publica en abierto | herramientas | OpenAI Developers (19 ago. 2026) |
| `radar/2026-11-17-swe-bench-verified-retirado` | SWE-bench Verified deja de medir la frontera | evals | OpenAI (23 feb. 2026); Anthropic infra noise (5 feb. 2026) |
| `radar/2026-11-17-owasp-agentic-top-10` | OWASP publica su Top 10 para aplicaciones agénticas | seguridad | OWASP (9 dic. 2025) |
| `radar/2026-12-01-otel-genai-repo-propio` | Las convenciones GenAI de OpenTelemetry se independizan | herramientas | semconv v1.42.0 (12 jun. 2026) |
| `radar/2026-12-01-skills-cadena-de-suministro` | Las skills de terceros son cadena de suministro | seguridad | Snyk (5 feb. 2026); Anthropic (16 oct. 2025) |
| `radar/2026-12-15-multiagente-escritor-unico` | Multiagente: un solo escritor, varios pensadores | practicas | Cognition (22 abr. 2026) |
| `radar/2026-12-15-ai-act-omnibus` | El AI Act aplaza las obligaciones de alto riesgo | practicas | FPF (28 jul. 2026); DOUE (24 jul. 2026) |

### 5.4 Entradas de glosario (propuestas)

| Ruta | Término | Categoría | `ingles` | Definición base (1 frase) | Fuente |
|---|---|---|---|---|---|
| `glosario/arnes` | Arnés | agentes | Harness | Todo lo que rodea al modelo en un agente: instrucciones, herramientas, entorno, controles y orquestación | LangChain mar. 2026; Böckeler |
| `glosario/context-rot` | Context rot | contexto | Context rot | Degradación del rendimiento al crecer la entrada, aunque la información esté presente | Chroma jul. 2025 |
| `glosario/carga-diferida-de-herramientas` | Carga diferida de herramientas | herramientas | Tool search / deferred loading | Exponer solo una herramienta de búsqueda y cargar definiciones cuando hacen falta | Anthropic nov. 2025 |
| `glosario/divulgacion-progresiva` | Divulgación progresiva | contexto | Progressive disclosure | Cargar información por niveles (metadatos → cuerpo → anexos) según relevancia | Anthropic oct. 2025 |
| `glosario/trifecta-letal` | Trifecta letal | seguridad | Lethal trifecta | Combinación de datos privados, contenido no fiable y comunicación externa que permite exfiltrar | Willison jun. 2025 |
| `glosario/regla-de-dos` | Regla de dos | seguridad | Agents Rule of Two | No combinar en una sesión más de dos de: entrada no fiable, datos sensibles, cambiar estado/comunicar | Meta oct. 2025 |
| `glosario/envenenamiento-de-herramientas` | Envenenamiento de herramientas | seguridad | Tool poisoning | Instrucciones maliciosas ocultas en la descripción de una herramienta | Invariant abr. 2025 |
| `glosario/rug-pull` | Rug pull | seguridad | Rug pull | Cambio malicioso de una herramienta ya aprobada | Invariant abr. 2025 |
| `glosario/pass-k` | pass@k y pass^k | evals | pass@k / pass^k | Probabilidad de al menos un éxito en k intentos / de k éxitos en k intentos | Chen 2021; Yao 2024; Anthropic 2026 |
| `glosario/analisis-de-errores` | Análisis de errores | evals | Error analysis | Leer trazas, anotar fallos y agruparlos en una taxonomía antes de automatizar evals | Husain/Shankar |
| `glosario/contaminacion-de-benchmark` | Contaminación de benchmark | evals | Benchmark contamination | Cuando el modelo vio las tareas en el entrenamiento y la puntuación sobrestima la capacidad | OpenAI feb. 2026 |
| `glosario/spec-driven-development` | Desarrollo guiado por specs | agentes | Spec-driven development | Trabajar con agentes contra una especificación escrita antes del código | Böckeler oct. 2025; GitHub sept. 2025 |
| `glosario/ears` | EARS | agentes | Easy Approach to Requirements Syntax | Plantillas para redactar requisitos sin ambigüedad (WHEN… THE SYSTEM SHALL…) | Mavin et al. 2009 |
| `glosario/bucle-ralph` | Bucle Ralph | agentes | Ralph loop | El mismo prompt en bucle con ventana nueva por iteración hasta cumplir el plan | Thoughtworks abr. 2026 |
| `glosario/worktree` | Worktree | agentes | git worktree | Directorio de trabajo adicional de un mismo repo para aislar tareas en paralelo | OpenAI feb. 2026 |
| `glosario/memoria-episodica` (y `-semantica`, `-procedimental`) | Memoria episódica/semántica/procedimental | contexto | Episodic/semantic/procedural memory | Experiencias pasadas / conocimiento / saber hacer de un agente | CoALA 2023 |
| `glosario/late-chunking` | Late chunking | contexto | Late chunking | Trocear después de codificar el documento completo, antes del pooling | Günther et al. 2024 |
| `glosario/interaccion-tardia` | Interacción tardía | contexto | Late interaction | Comparar consulta y documento token a token (ColBERT) | Khattab y Zaharia 2020 |
| `glosario/graphrag` | GraphRAG | contexto | GraphRAG | RAG sobre un grafo de entidades con resúmenes de comunidades | Edge et al. 2024 |
| `glosario/rag-agentico` | RAG agéntico | contexto | Agentic RAG | El agente decide cuándo y cómo recuperar, iterando | Singh et al. 2025 |
| `glosario/deteccion-de-turno` | Detección de fin de turno | produccion | Turn detection | Decidir cuándo el usuario ha terminado de hablar | LiveKit dic. 2025 |
| `glosario/voz-a-voz` | Voz a voz | produccion | Speech-to-speech | Modelo que recibe y genera audio directamente | OpenAI guía voz |
| `glosario/convenciones-genai-otel` | Convenciones GenAI de OpenTelemetry | produccion | OTel GenAI semantic conventions | Nombres estándar de spans y atributos `gen_ai.*` para trazar LLM y agentes | Repo semconv-genai |
| `glosario/backpropagation` | Backpropagation | fundamentos | Backpropagation | Cálculo eficiente del gradiente del error respecto a todos los pesos, capa a capa hacia atrás | Rumelhart et al. 1986 |
| `glosario/descenso-del-gradiente` | Descenso del gradiente | fundamentos | Gradient descent | Ajustar parámetros en la dirección que más reduce el error | Cauchy 1847; Robbins-Monro 1951 |
| `glosario/sobreajuste` | Sobreajuste | fundamentos | Overfitting | Memorizar el entrenamiento y generalizar mal | Srivastava et al. 2014 |
| `glosario/leyes-de-escala` | Leyes de escala | fundamentos | Scaling laws | Relación empírica entre cómputo, parámetros, datos y pérdida | Kaplan 2020; Hoffmann 2022 |
| `glosario/rlhf` | RLHF | fundamentos | Reinforcement learning from human feedback | Ajustar un modelo con un modelo de recompensa aprendido de preferencias humanas | Ouyang et al. 2022 |
| `glosario/modelo-de-razonamiento` | Modelo de razonamiento | fundamentos | Reasoning model | Modelo entrenado con RL para razonar antes de responder usando más cómputo en inferencia | OpenAI sept. 2024; DeepSeek-R1 2025 |

---

## 6. Fuentes completas (consultadas en esta sesión)

**Harness engineering**
- https://openai.com/index/harness-engineering/ (consultado vía www.openai.com/index/harness-engineering)
- https://openai.com/index/unlocking-the-codex-harness/ (consultado vía versión ka-GE)
- https://developers.openai.com/blog/codex-as-a-platform
- https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- https://www.anthropic.com/engineering/harness-design-long-running-apps
- https://martinfowler.com/articles/exploring-gen-ai/harness-engineering-memo.html
- https://martinfowler.com/articles/harness-engineering.html
- https://martinfowler.com/articles/are-harnesses-worth-the-cost.html
- https://www.langchain.com/blog/improving-deep-agents-with-harness-engineering
- https://www.langchain.com/blog/the-anatomy-of-an-agent-harness
- https://arxiv.org/abs/2609.00006
- https://www.infoq.com/news/2026/02/openai-harness-engineering-codex (secundaria)
- https://www.opensourceforu.com/2026/08/openai-open-sources-codex-harness/ (secundaria)
- https://www.thoughtworks.com/es-cl/radar

**Context engineering**
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- https://www.trychroma.com/research/context-rot
- https://www.langchain.com/blog/context-engineering-for-agents
- https://simonwillison.net/2025/Jun/27/context-engineering/
- https://simonwillison.net/2025/Jun/29/ (enlaces a Breunig: https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html, https://www.dbreunig.com/2025/06/26/how-to-fix-your-context.html)
- https://manus.im/en/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
- https://claude.com/resources/articles/context-management (redirección de https://www.anthropic.com/news/context-management)
- https://www.anthropic.com/engineering/code-execution-with-mcp
- https://www.anthropic.com/engineering/advanced-tool-use
- https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- https://www.alphaxiv.org/overview/2512.24601

**Larga duración y paralelo**
- https://www.anthropic.com/engineering/building-c-compiler
- https://www.thoughtworks.com/es-cl/radar/techniques/ralph-loop
- https://simonwillison.net/2025/Oct/5/parallel-coding-agents/
- https://simonwillison.net/guides/agentic-engineering-patterns/
- https://simonwillison.net/2026/Oct/13/redesigning-source-control-at-anthropic/ (resumen de https://www.anthropic.com/engineering/redesigning-source-control)
- https://www.anthropic.com/engineering (listado con fechas)

**Spec-driven development**
- https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/
- https://developer.microsoft.com/blog/spec-driven-development-spec-kit/
- https://github.github.com/spec-kit/index.html
- https://visualstudiomagazine.com/articles/2026/05/12/github-spec-kit-takes-off-as-antidote-to-piecemeal-vibe-coding.aspx
- https://kiro.dev/docs/specs/concepts
- https://www.theregister.com/2025/07/14/aws_kiro_agentic_ide/ (fecha por URL)
- https://www.martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
- https://research.manchester.ac.uk/en/publications/easy-approach-to-requirements-syntax-ears/

**Evals**
- https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- https://www.anthropic.com/engineering/infrastructure-noise
- https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/
- https://arxiv.org/abs/2509.16941 (consultado vía arxiv.org/html/2509.16941v1)
- https://arxiv.org/abs/2601.11868
- https://arxiv.org/abs/2602.00933
- https://proceedings.mlr.press/v306/barres26a.html
- https://arxiv.org/abs/2406.12045, https://arxiv.org/abs/2504.12516, https://arxiv.org/abs/2311.12983 (títulos e ID vía resultados de búsqueda)
- https://arxiv.org/abs/2503.14499 (vía html v3)
- https://hamel.dev/blog/posts/evals-faq/why-is-error-analysis-so-important-in-llm-evals-and-how-is-it-performed.html
- https://hamel.dev/blog/posts/evals-faq/
- https://arxiv.org/abs/2404.12272, https://arxiv.org/abs/2107.03374 (títulos e ID vía resultados)

**Seguridad**
- https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
- https://ai.meta.com/blog/practical-ai-agent-security/
- https://arxiv.org/abs/2503.18813
- https://arxiv.org/abs/2506.08837 (y html v1)
- https://arxiv.org/abs/2510.09023
- https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026
- https://genai.owasp.org/2025/12/09/owasp-genai-security-project-releases-top-10-risks-and-mitigations-for-agentic-ai-security/
- https://docs.modulos.ai/frameworks/owasp-top-10-agentic (lista ASI, secundaria)
- https://docs.modulos.ai/frameworks/owasp-top-10-llm/index (lista LLM 2025, secundaria)
- https://invariantlabs.ai/blog/mcp-security-notification
- https://modelcontextprotocol.io/specification/latest/basic/security_best_practices
- https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub
- https://www.anthropic.com/engineering/claude-code-sandboxing
- https://www.anthropic.com/engineering/claude-code-auto-mode
- https://www.anthropic.com/engineering/how-we-contain-claude
- https://www.anthropic.com/news/prompt-injection-defenses
- https://openai.com/index/hardening-atlas-against-prompt-injection
- https://brave.com/blog/unseeable-prompt-injections/ (fecha vía Simon Willison 21 oct. 2025)
- https://www.govinfo.gov/content/pkg/FR-2026-01-08/html/2026-00206.htm
- https://www.nist.gov/node/1911316

**Memoria**
- https://arxiv.org/pdf/2309.02427
- https://arxiv.org/abs/2310.08560
- https://arxiv.org/abs/2504.19413
- https://www.getzep.com/blog/zep-a-temporal-knowledge-graph-architecture-for-agent-memory/

**Multiagente**
- https://www.anthropic.com/engineering/multi-agent-research-system
- https://cognition.com/blog/dont-build-multi-agents
- https://cognition.com/blog/multi-agents-working
- https://www.traeai.com/articles/f89070d0-6418-4e01-b0ae-d02b3fbb81f4 (fecha del post de Cognition en X)
- https://www.langchain.com/blog/how-and-when-to-build-multi-agent-systems

**Observabilidad**
- https://github.com/open-telemetry/semantic-conventions-genai
- https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/ (aviso de traslado)
- https://opentelemetry.io/blog/2026/genai-observability/
- https://opentelemetry.io/blog/2025/ai-agent-observability/
- https://www.dash0.com/knowledge/opentelemetry-genai-semantic-conventions-explained (secundaria)
- https://dev.to/azena-ai/opentelemetrys-genai-semantic-conventions-are-not-stable-yet-heres-what-actually-shipped-in-2026-3mke (secundaria)

**RAG**
- https://anthropic.com/news/contextual-retrieval
- https://arxiv.org/abs/2409.04701
- https://arxiv.org/abs/2004.12832, https://arxiv.org/abs/2404.16130, https://arxiv.org/abs/2410.05779, https://arxiv.org/abs/2501.09136, https://arxiv.org/abs/2311.09476 (títulos e ID vía resultados)
- https://arxiv.org/abs/2407.16833
- https://proceedings.mlr.press/v267/li25dv.html

**Uso del ordenador**
- https://arxiv.org/html/2511.19477v1

**Voz**
- https://developers.openai.com/api/docs/guides/voice-agents
- https://openai.com/blog/continuous-voice-interaction-with-gpt-live
- https://gist.github.com/kwindla/f755284ef2b14730e1075c2ac803edcf
- https://livekit.com/blog/improved-end-of-turn-model-cuts-voice-ai-interruptions-39

**Fundamentos**
- https://ui.adsabs.harvard.edu/abs/1986Natur.323..533R/abstract · https://www.doi.org/10.1038/323533A0
- https://pubmed.ncbi.nlm.nih.gov/13602029/
- https://citedrive.com/en/discovery/long-short-term-memory/ (DOI LSTM)
- https://projecteuclid.org/euclid.aoms/1177729586
- https://www.jmlr.org/papers/v15/srivastava14a.html
- https://en.wikipedia.org/wiki/Lighthill_report · https://www.aiai.ed.ac.uk/events/lighthill1973/lighthill.pdf
- https://arxiv.org/pdf/1409.0473 · https://arxiv.org/pdf/2001.08361 · https://ar5iv.labs.arxiv.org/html/2203.15556 · https://arxiv.org/pdf/2203.02155v1.pdf · https://ar5iv.org/abs/2212.08073
- https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf
- https://openai.com/index/learning-to-reason-with-llms/
- https://arxiv.org/abs/2501.12948 · https://www.nature.com/nature-index/article/10.1038/s41586-025-09422-z
- https://nowpublishers.com/article/Details/INR-019

**Empresa**
- https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy
- https://www.anthropic.com/engineering/building-effective-agents
- https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
- https://evals.alignment.org/blog/2026-02-24-uplift-update/
- https://cloud.google.com/devops/state-of-devops (DORA 2025, solo título)
- https://fpf.org/blog/the-ai-act-implementation-timeline-what-changes-under-the-ai-omnibus

**Contenido interno revisado:** `docs/GUIA-CONTENIDO.md` (§8), `docs/MAPA-CONTENIDO.md`, y por grep: `cursos/seguridad-y-prompt-injection/03`, `cursos/evals-para-agentes/01`, `cursos/context-engineering/01`, `radar/2026-07-28-agentes-de-larga-duracion`, `disciplinas/spec-primero`, `roadmap/60-multiagente/05`, `sistemas/agente-de-voz`, páginas de observabilidad.

**Limitación de esta investigación:** el presupuesto de búsquedas compartido (200 por turno) se agotó al final; quedan marcadas como [NR] o SIN CONFIRMAR las referencias que no se pudieron reverificar (p. ej., SWE-bench original, OSWorld, RAGAS, DPO, Christiano 2017, páginas exactas de algunos artículos clásicos, Hashimoto, Huntley, BMAD, LangMem, Cursor, Amp, Thoughtworks Radar vol. 35). Se pueden cerrar en una pasada corta posterior.
