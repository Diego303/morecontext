# MoreContext · Mapa del contenido (v2)

> Árbol canónico de `contenido/`: cada línea es un archivo `.md` y una página de la web.
> Usa estas rutas para enlazar con `[[ruta]]`. Si añades contenido, añádelo aquí también.
> Columna «Estado»: `nuevo` (paquete v2), `renombrado`, o vacío (existente, revisado en v2).

**692 archivos** en 17 carpetas.

## paginas/  ·  6 archivos

| Ruta | Título | Estado |
|---|---|---|
| `paginas/contribuir` | Cómo contribuir |  |
| `paginas/empieza-aqui` | Empieza aquí |  |
| `paginas/fuentes` | Fuentes para estar al día | nuevo |
| `paginas/licencia` | Licencia |  |
| `paginas/manifiesto` | Manifiesto |  |
| `paginas/sobre` | Sobre MoreContext |  |

## roadmap/  ·  72 archivos

| Ruta | Título | Estado |
|---|---|---|
| `roadmap/00-fundamentos/01-que-es-un-llm` | Qué es un LLM y qué no es |  |
| `roadmap/00-fundamentos/02-tokens` | Tokens: la unidad con la que se mide todo |  |
| `roadmap/00-fundamentos/03-ventana-de-contexto` | La ventana de contexto y qué cabe en ella |  |
| `roadmap/00-fundamentos/04-primera-llamada-api` | Tu primera llamada a la API |  |
| `roadmap/00-fundamentos/05-coste-y-latencia` | Coste y latencia: medir antes de optimizar |  |
| `roadmap/00-fundamentos/06-como-se-entrena-un-llm` | Cómo se entrena un LLM | nuevo |
| `roadmap/00-fundamentos/07-empresa-modelo-herramienta` | Empresa, modelo, concepto y herramienta: el mapa para no liarte | nuevo |
| `roadmap/00-fundamentos/index` | Nivel 00 · Fundamentos |  |
| `roadmap/10-prompting/01-instrucciones-claras` | Instrucciones claras y contexto suficiente |  |
| `roadmap/10-prompting/02-ejemplos-few-shot` | Ejemplos few-shot: enseñar con casos |  |
| `roadmap/10-prompting/03-formato-de-salida` | Formato de salida: pedir JSON y validarlo |  |
| `roadmap/10-prompting/04-prompt-de-sistema` | El prompt de sistema: rol y reglas fijas |  |
| `roadmap/10-prompting/05-iterar-con-casos-de-prueba` | Iterar con casos de prueba |  |
| `roadmap/10-prompting/index` | Nivel 10 · Prompting que funciona |  |
| `roadmap/100-produccion/01-observabilidad-y-trazas` | Observabilidad y trazas |  |
| `roadmap/100-produccion/02-costes-y-prompt-caching` | Control de costes y prompt caching |  |
| `roadmap/100-produccion/03-latencia` | Latencia: streaming, modelo adecuado y menos pasos |  |
| `roadmap/100-produccion/04-seguridad-y-prompt-injection` | Seguridad: prompt injection y permisos |  |
| `roadmap/100-produccion/05-humano-en-el-bucle` | Humano en el bucle |  |
| `roadmap/100-produccion/06-despliegue` | Despliegue |  |
| `roadmap/100-produccion/index` | Nivel 100 · Producción |  |
| `roadmap/20-herramientas/01-ciclo-tool-use` | Function calling: el ciclo tool_use → tool_result |  |
| `roadmap/20-herramientas/02-definir-herramientas` | Definir herramientas con JSON Schema |  |
| `roadmap/20-herramientas/03-errores-e-is-error` | Manejo de errores e is_error |  |
| `roadmap/20-herramientas/04-tool-choice` | Controlar la elección con tool_choice |  |
| `roadmap/20-herramientas/05-mcp-conectar-un-servidor` | MCP: conectar un servidor de herramientas |  |
| `roadmap/20-herramientas/index` | Nivel 20 · Uso de herramientas |  |
| `roadmap/30-contexto-y-rag/01-embeddings` | Embeddings: texto convertido en vectores |  |
| `roadmap/30-contexto-y-rag/02-chunking` | Chunking: cortar sin romper el sentido |  |
| `roadmap/30-contexto-y-rag/03-busqueda-hibrida` | Búsqueda híbrida: vectorial + BM25 |  |
| `roadmap/30-contexto-y-rag/04-reranking` | Reranking: reordenar antes de responder |  |
| `roadmap/30-contexto-y-rag/05-respuestas-con-citas` | Responder con citas verificables |  |
| `roadmap/30-contexto-y-rag/06-memoria-entre-sesiones` | Memoria entre sesiones |  |
| `roadmap/30-contexto-y-rag/index` | Nivel 30 · Contexto, memoria y RAG |  |
| `roadmap/40-primer-agente/01-que-es-un-agente` | Qué es un agente (y cuándo basta un workflow) |  |
| `roadmap/40-primer-agente/02-el-bucle-agentico` | El bucle agéntico |  |
| `roadmap/40-primer-agente/03-condiciones-de-parada` | Condiciones de parada y presupuesto |  |
| `roadmap/40-primer-agente/04-planificar-antes-de-actuar` | Planificar antes de actuar |  |
| `roadmap/40-primer-agente/05-agente-con-varias-herramientas` | Un agente con varias herramientas |  |
| `roadmap/40-primer-agente/06-depurar-con-trazas` | Depurar un agente leyendo sus trazas |  |
| `roadmap/40-primer-agente/index` | Nivel 40 · Tu primer agente |  |
| `roadmap/50-skills/01-que-es-una-skill` | Qué es una skill (y qué no) | nuevo |
| `roadmap/50-skills/02-anatomia-de-una-skill` | Anatomía de una skill | nuevo |
| `roadmap/50-skills/03-carga-bajo-demanda` | Carga bajo demanda: cómo una skill no llena el contexto | nuevo |
| `roadmap/50-skills/04-escribir-tu-primera-skill` | Escribe tu primera skill | nuevo |
| `roadmap/50-skills/05-skills-en-equipo` | Skills en equipo: compartir, versionar y no fiarse | nuevo |
| `roadmap/50-skills/index` | Nivel 50 · Skills: procedimientos para tu agente | nuevo |
| `roadmap/60-multiagente/01-cuando-no-usar-multiagente` | Cuándo NO usar multiagente |  |
| `roadmap/60-multiagente/02-orquestador-y-subagentes` | Orquestador y subagentes |  |
| `roadmap/60-multiagente/03-pasar-contexto-entre-agentes` | Pasar contexto entre agentes |  |
| `roadmap/60-multiagente/04-paralelismo` | Paralelismo: lanzar y recoger |  |
| `roadmap/60-multiagente/05-coste-de-multiplicar-agentes` | El coste de multiplicar agentes |  |
| `roadmap/60-multiagente/index` | Nivel 60 · Sistemas multiagente |  |
| `roadmap/70-flujos-con-especificacion/01-de-improvisar-a-especificar` | De improvisar prompts a especificar | nuevo |
| `roadmap/70-flujos-con-especificacion/02-requisitos-en-ears` | Requisitos en EARS | nuevo |
| `roadmap/70-flujos-con-especificacion/03-plan-y-tareas` | Plan y tareas que un agente puede ejecutar | nuevo |
| `roadmap/70-flujos-con-especificacion/04-aceptacion-ejecutable` | Criterios de aceptación ejecutables | nuevo |
| `roadmap/70-flujos-con-especificacion/05-una-sola-puerta-humana` | Una sola puerta humana | nuevo |
| `roadmap/70-flujos-con-especificacion/index` | Nivel 70 · Flujos con especificación | nuevo |
| `roadmap/80-evals/01-por-que-evals` | Por qué evals: lo que no mides, se rompe |  |
| `roadmap/80-evals/02-conjunto-de-prueba` | Construir un conjunto de prueba |  |
| `roadmap/80-evals/03-codigo-o-modelo-juez` | Evaluar con código o con un modelo juez |  |
| `roadmap/80-evals/04-evals-de-trayectoria` | Evals de trayectoria: cómo llegó, no solo qué dijo |  |
| `roadmap/80-evals/05-regresiones-en-ci` | Regresiones en CI |  |
| `roadmap/80-evals/index` | Nivel 80 · Evals |  |
| `roadmap/90-harness/01-que-es-un-harness` | Qué es un harness | nuevo |
| `roadmap/90-harness/02-las-piezas-de-un-harness` | Las piezas de un harness | nuevo |
| `roadmap/90-harness/03-permisos-y-hooks` | Permisos y hooks: fronteras deterministas | nuevo |
| `roadmap/90-harness/04-estado-coste-y-contexto` | Estado, coste y contexto | nuevo |
| `roadmap/90-harness/05-un-harness-minimo` | Un harness mínimo, paso a paso | nuevo |
| `roadmap/90-harness/index` | Nivel 90 · Harness: el entorno del agente | nuevo |
| `roadmap/index` | Roadmap 0→100 |  |

## cursos/  ·  111 archivos

| Ruta | Título | Estado |
|---|---|---|
| `cursos/agentes-con-modelos-abiertos/01-pesos-abiertos-y-licencias` | Pesos abiertos, open source y licencias | nuevo |
| `cursos/agentes-con-modelos-abiertos/02-tu-primer-modelo-en-local` | Tu primer modelo en local | nuevo |
| `cursos/agentes-con-modelos-abiertos/03-servir-modelos-en-produccion` | Servir modelos en producción | nuevo |
| `cursos/agentes-con-modelos-abiertos/04-herramientas-con-modelos-abiertos` | Herramientas con modelos abiertos | nuevo |
| `cursos/agentes-con-modelos-abiertos/05-rag-cien-por-cien-local` | Un RAG 100 % local | nuevo |
| `cursos/agentes-con-modelos-abiertos/06-local-o-api` | Local, autoalojado o API: cómo decidir | nuevo |
| `cursos/agentes-con-modelos-abiertos/index` | Agentes con modelos abiertos | nuevo |
| `cursos/agentes-de-codigo/01-como-trabaja-un-agente-de-codigo` | Cómo trabaja un agente de código |  |
| `cursos/agentes-de-codigo/02-contexto-del-repositorio` | El contexto del repositorio |  |
| `cursos/agentes-de-codigo/03-explorar-planificar-implementar-verificar` | Explorar, planificar, implementar, verificar |  |
| `cursos/agentes-de-codigo/04-revisar-y-confiar` | Revisar y saber cuándo confiar |  |
| `cursos/agentes-de-codigo/index` | Agentes de código |  |
| `cursos/context-engineering/01-el-contexto-como-presupuesto` | El contexto como presupuesto |  |
| `cursos/context-engineering/02-que-meter-y-que-no` | Qué meter en el contexto y qué no |  |
| `cursos/context-engineering/03-compactacion-y-memoria` | Compactación y memoria |  |
| `cursos/context-engineering/04-contexto-para-agentes-largos` | Contexto para agentes de larga duración |  |
| `cursos/context-engineering/index` | Context engineering |  |
| `cursos/evals-para-agentes/01-que-medir` | Qué medir en un agente |  |
| `cursos/evals-para-agentes/02-datasets-de-evaluacion` | Datasets de evaluación |  |
| `cursos/evals-para-agentes/03-graders` | Graders: código, modelo y humano |  |
| `cursos/evals-para-agentes/04-evals-en-el-dia-a-dia` | Evals en el día a día |  |
| `cursos/evals-para-agentes/index` | Evals para agentes |  |
| `cursos/harness-engineering/01-del-prompt-al-harness` | Del prompt al harness | nuevo |
| `cursos/harness-engineering/02-los-problemas-que-resuelve` | Los problemas que resuelve un harness | nuevo |
| `cursos/harness-engineering/03-las-quince-piezas` | Las quince piezas, en un harness real | nuevo |
| `cursos/harness-engineering/04-patrones-y-principios` | Patrones de orquestación y principios de diseño | nuevo |
| `cursos/harness-engineering/05-agentes-y-orquestador` | Cuatro agentes y un orquestador | nuevo |
| `cursos/harness-engineering/06-el-flujo-como-maquina-de-estados` | El flujo como máquina de estados | nuevo |
| `cursos/harness-engineering/07-spec-congelada-y-aceptacion` | Spec congelada y aceptación ejecutable | nuevo |
| `cursos/harness-engineering/08-veredictos-y-reparacion-acotada` | Veredictos y una sola reparación | nuevo |
| `cursos/harness-engineering/09-seguridad-en-profundidad` | Seguridad en profundidad: permisos y guard | nuevo |
| `cursos/harness-engineering/10-coste-y-presupuesto` | Coste y presupuesto por feature | nuevo |
| `cursos/harness-engineering/11-sesiones-largas` | Sesiones largas: canario, traspaso y recuperación | nuevo |
| `cursos/harness-engineering/12-probar-y-evolucionar-el-harness` | Probar y evolucionar el harness | nuevo |
| `cursos/harness-engineering/13-features-en-paralelo-con-olas` | Features en paralelo con olas | nuevo |
| `cursos/harness-engineering/14-especializa-el-harness` | Especializa el harness para tu proyecto | nuevo |
| `cursos/harness-engineering/index` | Harness engineering: construye el tuyo | nuevo |
| `cursos/ia-en-la-empresa/01-lo-que-un-modelo-no-sabe-de-tu-empresa` | Lo que un modelo no sabe de tu empresa | nuevo |
| `cursos/ia-en-la-empresa/02-la-piramide-de-personalizacion` | La pirámide: prompt, RAG, fine-tuning o modelo propio | nuevo |
| `cursos/ia-en-la-empresa/03-donde-esta-el-valor` | Dónde está el valor y cómo encontrar casos de uso | nuevo |
| `cursos/ia-en-la-empresa/04-medir-el-valor` | Medir el valor de la IA | nuevo |
| `cursos/ia-en-la-empresa/05-errores-tipicos` | Seis errores típicos al llevar la IA a una empresa | nuevo |
| `cursos/ia-en-la-empresa/06-de-la-idea-al-piloto` | De la idea al piloto: un caso completo | nuevo |
| `cursos/ia-en-la-empresa/index` | IA en la empresa | nuevo |
| `cursos/index` | Cursos específicos |  |
| `cursos/la-ia-por-dentro/01-ia-machine-learning-y-deep-learning` | IA, machine learning y deep learning: el mapa | nuevo |
| `cursos/la-ia-por-dentro/02-aprendizaje-supervisado-y-no-supervisado` | Aprendizaje supervisado, no supervisado y por refuerzo | nuevo |
| `cursos/la-ia-por-dentro/03-de-las-reglas-a-las-probabilidades` | De las reglas a las probabilidades | nuevo |
| `cursos/la-ia-por-dentro/04-la-neurona-y-la-red` | La neurona y la red | nuevo |
| `cursos/la-ia-por-dentro/05-como-aprende-una-red` | Cómo aprende una red: pérdida, gradiente y backpropagation | nuevo |
| `cursos/la-ia-por-dentro/06-sobreajuste-y-generalizacion` | Sobreajuste y generalización | nuevo |
| `cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer` | De las RNN al Transformer: la atención | nuevo |
| `cursos/la-ia-por-dentro/index` | La IA por dentro | nuevo |
| `cursos/langchain-y-langgraph/01-cuando-usar-un-framework` | Cuándo usar un framework (y cuándo no) | nuevo |
| `cursos/langchain-y-langgraph/02-modelos-mensajes-y-herramientas` | Modelos, mensajes y herramientas en LangChain | nuevo |
| `cursos/langchain-y-langgraph/03-tu-primer-agente-con-create-agent` | Tu primer agente con create_agent | nuevo |
| `cursos/langchain-y-langgraph/04-middleware` | Middleware: controlar el bucle sin reescribirlo | nuevo |
| `cursos/langchain-y-langgraph/05-langgraph-estado-nodos-y-aristas` | LangGraph: estado, nodos y aristas | nuevo |
| `cursos/langchain-y-langgraph/06-memoria-y-persistencia` | Memoria y persistencia | nuevo |
| `cursos/langchain-y-langgraph/07-humano-en-el-bucle-con-interrupt` | Humano en el bucle con interrupt | nuevo |
| `cursos/langchain-y-langgraph/08-multiagente-con-langgraph` | Multiagente con LangGraph | nuevo |
| `cursos/langchain-y-langgraph/09-deep-agents` | Deep Agents: planificación, archivos y subagentes | nuevo |
| `cursos/langchain-y-langgraph/10-mcp-en-langchain` | MCP en LangChain y LangGraph | nuevo |
| `cursos/langchain-y-langgraph/11-observar-y-evaluar` | Observar y evaluar agentes de LangChain | nuevo |
| `cursos/langchain-y-langgraph/index` | LangChain y LangGraph | nuevo |
| `cursos/mcp-de-cero-a-servidor/01-que-resuelve-mcp` | Qué resuelve MCP |  |
| `cursos/mcp-de-cero-a-servidor/02-usar-servidores-existentes` | Usar servidores existentes |  |
| `cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor` | Tu primer servidor MCP |  |
| `cursos/mcp-de-cero-a-servidor/04-seguridad-y-despliegue` | Seguridad y despliegue de servidores |  |
| `cursos/mcp-de-cero-a-servidor/index` | MCP: de cero a tu propio servidor |  |
| `cursos/rag-a-fondo/01-anatomia-de-un-rag` | Anatomía de un RAG |  |
| `cursos/rag-a-fondo/02-indexar-bien` | Indexar bien: limpieza, troceado y metadatos |  |
| `cursos/rag-a-fondo/03-recuperar-bien` | Recuperar bien: híbrida, reranking y recuperación contextual |  |
| `cursos/rag-a-fondo/04-bases-vectoriales-por-dentro` | Bases vectoriales por dentro: ANN, HNSW, IVF y PQ | nuevo |
| `cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion` | Técnicas avanzadas de recuperación | nuevo |
| `cursos/rag-a-fondo/06-el-corpus-manda` | El corpus manda: PDF, OCR, tablas y jerarquía | nuevo |
| `cursos/rag-a-fondo/07-permisos-y-multi-tenant` | Permisos y multi-tenant en RAG | nuevo |
| `cursos/rag-a-fondo/08-mantener-el-indice` | Mantener el índice vivo | nuevo |
| `cursos/rag-a-fondo/09-cuando-el-rag-vectorial-no-basta` | Cuando el RAG vectorial no basta | nuevo |
| `cursos/rag-a-fondo/10-evaluar-un-rag` | Evaluar un RAG | renombrado (antes `cursos/rag-a-fondo/04-evaluar-un-rag`) |
| `cursos/rag-a-fondo/index` | RAG a fondo |  |
| `cursos/ruta-en-video/01-fase-0-que-es-la-ia` | Fase 0 · Qué es la IA | nuevo |
| `cursos/ruta-en-video/02-fase-1-redes-neuronales` | Fase 1 · Redes neuronales por dentro | nuevo |
| `cursos/ruta-en-video/03-fase-2-de-las-rnn-a-los-transformers` | Fase 2 · De las RNN a los Transformers | nuevo |
| `cursos/ruta-en-video/04-fase-3-llms-tokens-y-contexto` | Fase 3 · LLMs: tokens, contexto y prompting | nuevo |
| `cursos/ruta-en-video/05-fase-3-5-ia-en-la-empresa` | Fase 3.5 · La IA en la empresa | nuevo |
| `cursos/ruta-en-video/06-fase-3-5-rag` | Fase 3.5 · RAG con tus documentos | nuevo |
| `cursos/ruta-en-video/07-fase-4-herramientas-para-programar` | Fase 4 · Herramientas de IA para programar | nuevo |
| `cursos/ruta-en-video/08-fase-5-que-es-un-agente` | Fase 5 · Qué es un agente | nuevo |
| `cursos/ruta-en-video/09-fase-6-mcp` | Fase 6 · MCP | nuevo |
| `cursos/ruta-en-video/10-fase-7-agent-skills` | Fase 7 · Agent Skills | nuevo |
| `cursos/ruta-en-video/11-fase-8-multiagente-y-sdd` | Fase 8 · Multiagente y Spec-Driven Development | nuevo |
| `cursos/ruta-en-video/12-fase-9-harness-engineering` | Fase 9 · Harness engineering | nuevo |
| `cursos/ruta-en-video/13-fase-10-sistemas-y-plataformas` | Fase 10 · Sistemas y plataformas de agentes | nuevo |
| `cursos/ruta-en-video/14-ecosistema-y-estar-al-dia` | Ecosistema y cómo estar al día | nuevo |
| `cursos/ruta-en-video/index` | Ruta en vídeo: de cero a agentes | nuevo |
| `cursos/seguridad-y-prompt-injection/01-modelo-de-amenazas` | Modelo de amenazas de un agente |  |
| `cursos/seguridad-y-prompt-injection/02-inyeccion-directa-e-indirecta` | Inyección directa e indirecta |  |
| `cursos/seguridad-y-prompt-injection/03-defensas-en-capas` | Defensas en capas |  |
| `cursos/seguridad-y-prompt-injection/04-permisos-y-sandbox` | Permisos y sandbox |  |
| `cursos/seguridad-y-prompt-injection/index` | Seguridad y prompt injection |  |
| `cursos/sistemas-multiagente/01-arquitecturas` | Arquitecturas multiagente |  |
| `cursos/sistemas-multiagente/02-disenar-subagentes` | Diseñar subagentes |  |
| `cursos/sistemas-multiagente/03-coordinacion-y-estado` | Coordinación y estado compartido |  |
| `cursos/sistemas-multiagente/04-depurar-sistemas-multiagente` | Depurar sistemas multiagente |  |
| `cursos/sistemas-multiagente/index` | Sistemas multiagente |  |
| `cursos/uso-del-ordenador/01-como-funciona` | Cómo funciona el uso del ordenador |  |
| `cursos/uso-del-ordenador/02-navegador-o-api` | Navegador o API: cuándo cada uno |  |
| `cursos/uso-del-ordenador/03-fiabilidad` | Fiabilidad: reintentos, verificación y estados |  |
| `cursos/uso-del-ordenador/04-seguridad-y-aislamiento` | Seguridad y aislamiento |  |
| `cursos/uso-del-ordenador/index` | Uso del ordenador y del navegador |  |

## docs/  ·  85 archivos

| Ruta | Título | Estado |
|---|---|---|
| `docs/agentes/01-el-bucle-agentico` | El bucle agéntico |  |
| `docs/agentes/02-subagentes` | Subagentes |  |
| `docs/agentes/03-humano-en-el-bucle` | Humano en el bucle |  |
| `docs/agentes/04-managed-agents` | Claude Managed Agents: el harness alojado | nuevo |
| `docs/agentes/index` | Agentes |  |
| `docs/claude-code/01-memoria-claude-md-y-agents-md` | Memoria del proyecto: CLAUDE.md y AGENTS.md | nuevo |
| `docs/claude-code/02-subagentes` | Subagentes | nuevo |
| `docs/claude-code/03-skills` | Skills en Claude Code | nuevo |
| `docs/claude-code/04-hooks` | Hooks | nuevo |
| `docs/claude-code/05-comandos-y-plugins` | Comandos y plugins | nuevo |
| `docs/claude-code/06-permisos-y-sandbox` | Permisos y sandbox | nuevo |
| `docs/claude-code/07-mcp-en-claude-code` | MCP en Claude Code | nuevo |
| `docs/claude-code/08-modo-headless-y-ci` | Modo headless y CI | nuevo |
| `docs/claude-code/09-workflows-equipos-y-segundo-plano` | Workflows, equipos de agentes y segundo plano | nuevo |
| `docs/claude-code/index` | Claude Code | nuevo |
| `docs/contexto/01-ventana-de-contexto` | Ventana de contexto |  |
| `docs/contexto/02-prompt-caching` | Prompt caching |  |
| `docs/contexto/03-rag` | RAG |  |
| `docs/contexto/04-memoria` | Memoria |  |
| `docs/contexto/05-compactacion-y-limpieza-en-el-servidor` | Compactación y limpieza de contexto en el servidor | nuevo |
| `docs/contexto/06-mensajes-de-sistema-a-mitad-de-conversacion` | Mensajes de sistema a mitad de conversación | nuevo |
| `docs/contexto/index` | Contexto |  |
| `docs/estandares/01-mcp-2026-07-28` | MCP 2026-07-28: el protocolo sin estado | nuevo |
| `docs/estandares/02-extensiones-mcp` | Extensiones de MCP: Apps, Tasks y Server Cards | nuevo |
| `docs/estandares/03-a2a` | A2A: agentes que hablan con agentes | nuevo |
| `docs/estandares/04-agent-skills-y-agents-md` | Agent Skills y AGENTS.md | nuevo |
| `docs/estandares/index` | Estándares abiertos | nuevo |
| `docs/evals/01-disenar-evals` | Diseñar evals |  |
| `docs/evals/02-modelo-como-juez` | Modelo como juez |  |
| `docs/evals/03-benchmarks-publicos` | Benchmarks públicos: qué miden y cómo leerlos | nuevo |
| `docs/evals/index` | Evals |  |
| `docs/frameworks/01-elegir-framework` | Elegir framework sin dogmas | nuevo |
| `docs/frameworks/02-equivalencias` | Equivalencias entre SDK y frameworks | nuevo |
| `docs/frameworks/03-claude-agent-sdk` | Claude Agent SDK | nuevo |
| `docs/frameworks/04-langchain` | LangChain | nuevo |
| `docs/frameworks/05-langgraph` | LangGraph | nuevo |
| `docs/frameworks/06-openai-agents-sdk` | OpenAI Agents SDK | nuevo |
| `docs/frameworks/07-pydantic-ai` | Pydantic AI | nuevo |
| `docs/frameworks/08-llamaindex` | LlamaIndex | nuevo |
| `docs/frameworks/09-otros-frameworks` | Otros frameworks: CrewAI, ADK, Agent Framework, smolagents, Haystack, DSPy, Strands y Agno | nuevo |
| `docs/frameworks/10-deep-agents` | Deep Agents | nuevo |
| `docs/frameworks/11-agentes-en-typescript` | Agentes en TypeScript | nuevo |
| `docs/frameworks/index` | Frameworks de agentes | nuevo |
| `docs/fundamentos/01-introduccion` | Introducción a la documentación |  |
| `docs/fundamentos/02-tu-primera-llamada` | Tu primera llamada |  |
| `docs/fundamentos/03-api-de-mensajes` | La API de mensajes: roles y bloques |  |
| `docs/fundamentos/04-streaming` | Streaming |  |
| `docs/fundamentos/05-versiones-de-api-y-sdks` | Versiones de la API y de los SDK | nuevo |
| `docs/fundamentos/06-motivos-de-parada-y-rechazos` | Motivos de parada y rechazos | nuevo |
| `docs/fundamentos/index` | Fundamentos |  |
| `docs/herramientas/01-uso-de-herramientas` | Uso de herramientas |  |
| `docs/herramientas/02-mcp` | MCP |  |
| `docs/herramientas/03-herramientas-del-servidor` | Herramientas del lado del servidor |  |
| `docs/herramientas/04-uso-del-ordenador` | Uso del ordenador |  |
| `docs/herramientas/05-busqueda-y-carga-diferida` | Búsqueda de herramientas y carga diferida | nuevo |
| `docs/herramientas/06-llamada-programatica` | Llamada programática a herramientas | nuevo |
| `docs/herramientas/07-mcp-desde-la-api` | MCP desde la API: el conector | nuevo |
| `docs/herramientas/index` | Herramientas |  |
| `docs/index` | Documentación |  |
| `docs/modelos-abiertos/01-ollama` | Ollama | nuevo |
| `docs/modelos-abiertos/02-vllm-y-llama-cpp` | vLLM y llama.cpp | nuevo |
| `docs/modelos-abiertos/03-apis-compatibles-y-litellm` | APIs compatibles y LiteLLM | nuevo |
| `docs/modelos-abiertos/04-embeddings-y-rerankers` | Embeddings y rerankers abiertos | nuevo |
| `docs/modelos-abiertos/05-bases-vectoriales` | Bases vectoriales abiertas | nuevo |
| `docs/modelos-abiertos/06-ingesta-de-documentos` | Ingesta de documentos con herramientas abiertas | nuevo |
| `docs/modelos-abiertos/07-observabilidad-abierta` | Observabilidad abierta: Langfuse, Phoenix y OpenTelemetry | nuevo |
| `docs/modelos-abiertos/08-evals-abiertas` | Evals con herramientas abiertas | nuevo |
| `docs/modelos-abiertos/09-guardrails-y-sandbox` | Guardrails y sandbox abiertos | nuevo |
| `docs/modelos-abiertos/10-agentes-de-codigo-abiertos` | Agentes de código abiertos | nuevo |
| `docs/modelos-abiertos/index` | Modelos abiertos | nuevo |
| `docs/produccion/01-observabilidad` | Observabilidad |  |
| `docs/produccion/02-costes-y-limites` | Costes y límites |  |
| `docs/produccion/03-latencia` | Latencia |  |
| `docs/produccion/04-opentelemetry-genai` | Trazas de agentes con OpenTelemetry GenAI | nuevo |
| `docs/produccion/index` | Producción |  |
| `docs/prompting/01-prompt-de-sistema` | Prompt de sistema |  |
| `docs/prompting/02-ejemplos-few-shot` | Ejemplos few-shot |  |
| `docs/prompting/03-salida-estructurada` | Salida estructurada |  |
| `docs/prompting/04-razonamiento` | Razonamiento y esfuerzo |  |
| `docs/prompting/index` | Prompting |  |
| `docs/seguridad/01-prompt-injection` | Prompt injection |  |
| `docs/seguridad/02-permisos-y-minimo-privilegio` | Permisos y mínimo privilegio |  |
| `docs/seguridad/03-patrones-contra-inyeccion` | Patrones de diseño contra la inyección de prompt | nuevo |
| `docs/seguridad/04-mcp-y-skills-de-terceros` | Seguridad de servidores MCP y skills de terceros | nuevo |
| `docs/seguridad/index` | Seguridad |  |

## modelos/  ·  13 archivos

| Ruta | Título | Estado |
|---|---|---|
| `modelos/01-principios-de-prompting` | Principios de prompting |  |
| `modelos/02-ingenieria-de-contexto` | Ingeniería de contexto |  |
| `modelos/03-formato-y-salidas-estructuradas` | Formato y salidas estructuradas |  |
| `modelos/04-dejar-pensar-al-modelo` | Dejar pensar al modelo |  |
| `modelos/05-elegir-modelo-por-tarea` | Elegir modelo por tarea |  |
| `modelos/06-parametros` | Parámetros: max_tokens, temperatura y compañía |  |
| `modelos/07-documentos-largos` | Trabajar con documentos largos |  |
| `modelos/08-antipatrones` | Antipatrones |  |
| `modelos/09-checklist-produccion` | Checklist antes de producción |  |
| `modelos/10-prompting-rag-o-fine-tuning` | Prompting, RAG o fine-tuning: cómo decidir | nuevo |
| `modelos/11-modelos-abiertos` | Usar bien modelos abiertos | nuevo |
| `modelos/12-inferencia-local` | Inferencia local: memoria, cuantización y contexto | nuevo |
| `modelos/index` | Guía de modelos |  |

## sistemas/  ·  12 archivos

| Ruta | Título | Estado |
|---|---|---|
| `sistemas/agente-de-codigo` | Agente de código |  |
| `sistemas/agente-de-larga-duracion` | Agente que trabaja horas sobre un repositorio | nuevo |
| `sistemas/agente-de-voz` | Agente de voz |  |
| `sistemas/asistente-100-local` | Asistente 100 % local | nuevo |
| `sistemas/asistente-de-datos-con-mcp` | Asistente sobre tu base de datos con MCP |  |
| `sistemas/extraccion-documental` | Extracción documental a JSON |  |
| `sistemas/harness-sdd-claude-code` | Harness SDD multiagente para Claude Code | nuevo |
| `sistemas/harness-sdd-olas` | Harness SDD con olas: features en paralelo | nuevo |
| `sistemas/index` | Sistemas |  |
| `sistemas/investigacion-multiagente` | Sistema multiagente de investigación |  |
| `sistemas/rag-con-citas` | RAG con citas verificables |  |
| `sistemas/soporte-con-aprobacion-humana` | Agente de soporte con aprobación humana |  |

## patrones/  ·  14 archivos

| Ruta | Título | Estado |
|---|---|---|
| `patrones/01-workflows-vs-agentes` | Workflows frente a agentes |  |
| `patrones/02-llamada-aumentada` | La llamada aumentada |  |
| `patrones/03-encadenado` | Encadenado de prompts |  |
| `patrones/04-enrutado` | Enrutado |  |
| `patrones/05-paralelizacion` | Paralelización |  |
| `patrones/06-orquestador-trabajadores` | Orquestador y trabajadores |  |
| `patrones/07-evaluador-optimizador` | Evaluador-optimizador |  |
| `patrones/08-agente-autonomo` | Agente autónomo |  |
| `patrones/09-elegir-patron` | Qué patrón elegir |  |
| `patrones/10-inicializador-y-agente-de-trabajo` | Inicializador y agente de trabajo | nuevo |
| `patrones/11-planificador-generador-evaluador` | Planificador, generador y evaluador | nuevo |
| `patrones/12-bucle-ralph` | Bucle Ralph | nuevo |
| `patrones/13-ejecutor-y-asesor` | Ejecutor y asesor | nuevo |
| `patrones/index` | Patrones de agentes |  |

## disciplinas/  ·  16 archivos

| Ruta | Título | Estado |
|---|---|---|
| `disciplinas/cambios-pequenos-y-revisables` | Cambios pequeños y revisables |  |
| `disciplinas/context-engineering` | Context engineering |  |
| `disciplinas/diseno-de-herramientas` | Diseño de herramientas |  |
| `disciplinas/evals` | Evals como disciplina |  |
| `disciplinas/explorar-planificar-implementar-verificar` | Explorar, planificar, implementar, verificar |  |
| `disciplinas/harness-engineering` | Harness engineering | nuevo |
| `disciplinas/humano-en-el-bucle` | Humano en el bucle |  |
| `disciplinas/index` | Disciplinas y formas de trabajar |  |
| `disciplinas/observabilidad` | Observabilidad |  |
| `disciplinas/orquestador-y-subagentes` | Orquestador y subagentes en tu día a día |  |
| `disciplinas/pair-programming-con-agentes` | Pair programming con un agente |  |
| `disciplinas/seguridad` | Seguridad de agentes |  |
| `disciplinas/spec-primero` | Spec primero |  |
| `disciplinas/trabajo-en-paralelo-con-agentes` | Trabajo en paralelo con agentes | nuevo |
| `disciplinas/ux-de-agentes` | UX de agentes |  |
| `disciplinas/verificar-antes-de-dar-por-hecho` | Verificar antes de dar por hecho | nuevo |

## recetas/  ·  52 archivos

| Ruta | Título | Estado |
|---|---|---|
| `recetas/agente-con-claude-agent-sdk` | Un agente con el Claude Agent SDK en 40 líneas | nuevo |
| `recetas/agente-de-codigo-con-modelo-local` | Un agente de código con un modelo local | nuevo |
| `recetas/agente-local-con-ollama` | Un agente con herramientas en local con Ollama | nuevo |
| `recetas/analisis-de-errores-de-trazas` | Análisis de errores con cien trazas | nuevo |
| `recetas/aprobacion-humana-antes-de-actuar` | Aprobación humana antes de actuar |  |
| `recetas/aprobacion-humana-con-langgraph` | Aprobación humana con LangGraph | nuevo |
| `recetas/apuntes-de-video-con-ia` | Apuntes de vídeo con IA para tu segundo cerebro | nuevo |
| `recetas/busqueda-hibrida-con-bm25` | Búsqueda híbrida con BM25 y embeddings |  |
| `recetas/busqueda-hibrida-con-qdrant` | Búsqueda híbrida con Qdrant | nuevo |
| `recetas/canario-de-contexto` | Un canario para detectar contexto saturado | nuevo |
| `recetas/carga-diferida-de-herramientas` | Muchas herramientas sin llenar el contexto | nuevo |
| `recetas/chunks-padre-hijo` | Chunks padre-hijo: buscar en pequeño, responder en grande | nuevo |
| `recetas/clasificar-y-enrutar-tickets` | Clasificar y enrutar tickets de soporte |  |
| `recetas/compactacion-en-el-servidor` | Compactación en el servidor en un bucle largo | nuevo |
| `recetas/congelar-la-spec-con-un-hash` | Congelar la spec con un hash | nuevo |
| `recetas/coste-por-subagente` | Medir el coste de cada subagente | nuevo |
| `recetas/criterios-de-aceptacion-ejecutables` | Criterios de aceptación ejecutables en YAML | nuevo |
| `recetas/depurar-un-rag` | Depurar un RAG en ocho preguntas | nuevo |
| `recetas/diagnosticar-fallos-de-cache` | Diagnosticar por qué no se aprovecha la caché | nuevo |
| `recetas/entregar-resultado-sin-forzar-herramienta` | Entregar un resultado sin forzar una herramienta | nuevo |
| `recetas/evals-con-promptfoo` | Evals de un prompt con promptfoo | nuevo |
| `recetas/evals-de-regresion-en-ci` | Evals de regresión en CI |  |
| `recetas/extraer-facturas-a-json` | Extraer datos de facturas a JSON validado |  |
| `recetas/fallback-ante-rechazos` | Qué hacer cuando el modelo rechaza | nuevo |
| `recetas/features-en-paralelo-con-worktrees` | Features en paralelo con git worktrees | nuevo |
| `recetas/fusionar-rankings-con-rrf` | Fusionar rankings con Reciprocal Rank Fusion | nuevo |
| `recetas/herramientas-mcp-en-un-agente-langchain` | Herramientas MCP en un agente de LangChain | nuevo |
| `recetas/hook-que-bloquea-comandos-peligrosos` | Un hook que bloquea comandos peligrosos | nuevo |
| `recetas/index` | Recetas |  |
| `recetas/integrar-features-en-paralelo` | Integrar features en paralelo sin romper nada | nuevo |
| `recetas/map-reduce-con-send` | Map-reduce en paralelo con Send de LangGraph | nuevo |
| `recetas/maquina-de-estados-con-guards` | Una máquina de estados con guards para tu agente | nuevo |
| `recetas/modelo-juez-con-rubrica` | Modelo juez con rúbrica |  |
| `recetas/pdf-a-markdown-con-docling` | De PDF a Markdown con Docling | nuevo |
| `recetas/probar-agentes-sin-api` | Probar agentes sin API con modelos simulados | nuevo |
| `recetas/proteger-secretos-del-agente` | Proteger secretos del agente | nuevo |
| `recetas/puerta-humana-con-comandos` | Una puerta humana con /approve y /reject | nuevo |
| `recetas/rag-local-con-pgvector` | RAG local con pgvector | nuevo |
| `recetas/rag-minimo-viable` | Un RAG mínimo viable en una tarde | nuevo |
| `recetas/reanudar-un-agente-tras-un-reinicio` | Reanudar un agente tras un reinicio | nuevo |
| `recetas/recortar-costes-con-prompt-caching` | Recortar costes con prompt caching |  |
| `recetas/reindexado-incremental` | Reindexado incremental sin duplicados | nuevo |
| `recetas/reintentos-y-limites-de-tasa` | Reintentos y límites de tasa |  |
| `recetas/resumen-de-reuniones-con-acciones` | Resumen de reuniones con acciones y responsables |  |
| `recetas/servidor-mcp-de-solo-lectura` | Servidor MCP de solo lectura |  |
| `recetas/servidor-mcp-sin-estado-con-handles` | Servidor MCP sin estado con handles | nuevo |
| `recetas/servir-un-modelo-con-vllm` | Servir un modelo abierto con vLLM | nuevo |
| `recetas/streaming-de-respuestas` | Streaming de respuestas |  |
| `recetas/trazas-con-langfuse` | Trazas de un agente con Langfuse | nuevo |
| `recetas/trocear-documentos` | Trocear documentos con solapamiento |  |
| `recetas/un-verify-para-toda-la-regresion` | Un solo verify.sh para toda la regresión | nuevo |
| `recetas/validar-un-modelo-juez` | Validar un modelo juez con TPR y TNR | nuevo |

## plantillas/  ·  15 archivos

| Ruta | Título | Estado |
|---|---|---|
| `plantillas/agents-md` | AGENTS.md para un proyecto con agentes | nuevo |
| `plantillas/checklist-de-rag` | Checklist para construir un RAG | nuevo |
| `plantillas/claude-md` | CLAUDE.md mínimo que importa tus reglas | nuevo |
| `plantillas/criterios-de-aceptacion` | acceptance.yaml: criterios ejecutables | nuevo |
| `plantillas/estado-de-feature` | Estado de una feature | nuevo |
| `plantillas/index` | Plantillas | nuevo |
| `plantillas/peticion-de-reparacion` | Petición de reparación acotada | nuevo |
| `plantillas/plan-de-olas` | Plan de olas para features en paralelo | nuevo |
| `plantillas/prompt-apuntes-de-video` | Prompt: apuntes de vídeo para Obsidian | nuevo |
| `plantillas/prompt-de-sistema-de-agente` | Prompt de sistema para un agente con herramientas | nuevo |
| `plantillas/prompt-plan-de-implementacion` | Prompt: plan de implementación y harness especializado | nuevo |
| `plantillas/skill` | Skill con procedimiento y recursos | nuevo |
| `plantillas/spec-con-ears` | Especificación con requisitos EARS | nuevo |
| `plantillas/subagente` | Subagente con contrato | nuevo |
| `plantillas/veredicto-de-revision` | Veredicto de revisión estructurado | nuevo |

## herramientas/  ·  43 archivos

| Ruta | Título | Estado |
|---|---|---|
| `herramientas/aider` | Aider | nuevo |
| `herramientas/anthropic-sdk` | SDK de Anthropic | nuevo |
| `herramientas/arize-phoenix` | Arize Phoenix | nuevo |
| `herramientas/chroma` | Chroma | nuevo |
| `herramientas/claude-agent-sdk` | Claude Agent SDK | nuevo |
| `herramientas/claude-code` | Claude Code | nuevo |
| `herramientas/cline` | Cline | nuevo |
| `herramientas/crewai` | CrewAI | nuevo |
| `herramientas/deepagents` | Deep Agents | nuevo |
| `herramientas/deepeval` | DeepEval | nuevo |
| `herramientas/docling` | Docling | nuevo |
| `herramientas/dspy` | DSPy | nuevo |
| `herramientas/google-adk` | Google ADK | nuevo |
| `herramientas/goose` | goose | nuevo |
| `herramientas/haystack` | Haystack | nuevo |
| `herramientas/index` | Herramientas | nuevo |
| `herramientas/inspect-ai` | Inspect | nuevo |
| `herramientas/lancedb` | LanceDB | nuevo |
| `herramientas/langchain` | LangChain | nuevo |
| `herramientas/langfuse` | Langfuse | nuevo |
| `herramientas/langgraph` | LangGraph | nuevo |
| `herramientas/litellm` | LiteLLM | nuevo |
| `herramientas/llama-cpp` | llama.cpp | nuevo |
| `herramientas/llama-guard` | Llama Guard | nuevo |
| `herramientas/llamaindex` | LlamaIndex | nuevo |
| `herramientas/lm-studio` | LM Studio | nuevo |
| `herramientas/mastra` | Mastra | nuevo |
| `herramientas/mcp-sdks` | SDK de MCP | nuevo |
| `herramientas/microsoft-agent-framework` | Microsoft Agent Framework | nuevo |
| `herramientas/ollama` | Ollama | nuevo |
| `herramientas/open-webui` | Open WebUI | nuevo |
| `herramientas/openai-agents-sdk` | OpenAI Agents SDK | nuevo |
| `herramientas/opencode` | OpenCode | nuevo |
| `herramientas/openhands` | OpenHands | nuevo |
| `herramientas/pgvector` | pgvector | nuevo |
| `herramientas/promptfoo` | promptfoo | nuevo |
| `herramientas/pydantic-ai` | Pydantic AI | nuevo |
| `herramientas/qdrant` | Qdrant | nuevo |
| `herramientas/ragas` | Ragas | nuevo |
| `herramientas/smolagents` | smolagents | nuevo |
| `herramientas/strands-agents` | Strands Agents | nuevo |
| `herramientas/vercel-ai-sdk` | AI SDK de Vercel | nuevo |
| `herramientas/vllm` | vLLM | nuevo |

## biblioteca/  ·  28 archivos

| Ruta | Título | Estado |
|---|---|---|
| `biblioteca/atencion-bahdanau` | La atención en traducción automática (Bahdanau, Cho y Bengio, 2014) | nuevo |
| `biblioteca/attention-is-all-you-need` | Attention Is All You Need (Vaswani et al., 2017) | nuevo |
| `biblioteca/backpropagation` | Aprender representaciones con backpropagation (Rumelhart, Hinton y Williams, 1986) | nuevo |
| `biblioteca/building-effective-agents` | Building effective agents (Anthropic, 2024) | nuevo |
| `biblioteca/camel` | CaMeL: derrotar la inyección por diseño (Debenedetti et al., 2025) | nuevo |
| `biblioteca/chain-of-thought` | Chain-of-thought prompting (Wei et al., 2022) | nuevo |
| `biblioteca/constitutional-ai` | Constitutional AI (Bai et al., 2022) | nuevo |
| `biblioteca/context-engineering-anthropic` | Effective context engineering for AI agents (Anthropic, 2025) | nuevo |
| `biblioteca/context-rot` | Context rot (Chroma, 2025) | nuevo |
| `biblioteca/deepseek-r1` | DeepSeek-R1: razonamiento con aprendizaje por refuerzo (2025) | nuevo |
| `biblioteca/demystifying-evals` | Demystifying evals for AI agents (Anthropic, 2026) | nuevo |
| `biblioteca/ears` | EARS: requisitos sin ambigüedad (Mavin et al., 2009) | nuevo |
| `biblioteca/effective-harnesses` | Effective harnesses for long-running agents (Anthropic, 2025) | nuevo |
| `biblioteca/el-perceptron` | El perceptrón (Rosenblatt, 1958) | nuevo |
| `biblioteca/gpt-3-few-shot` | Los modelos de lenguaje aprenden con pocos ejemplos (GPT-3, 2020) | nuevo |
| `biblioteca/harness-engineering-openai` | Harness engineering (OpenAI, 2026) | nuevo |
| `biblioteca/index` | Biblioteca | nuevo |
| `biblioteca/instructgpt` | InstructGPT: seguir instrucciones con feedback humano (Ouyang et al., 2022) | nuevo |
| `biblioteca/inyeccion-indirecta-greshake` | Not what you've signed up for: inyección indirecta (Greshake et al., 2023) | nuevo |
| `biblioteca/leyes-de-escalado-y-chinchilla` | Leyes de escalado y Chinchilla (Kaplan 2020, Hoffmann 2022) | nuevo |
| `biblioteca/llm-as-a-judge` | Judging LLM-as-a-Judge (Zheng et al., 2023) | nuevo |
| `biblioteca/lost-in-the-middle` | Lost in the Middle (Liu et al., 2023) | nuevo |
| `biblioteca/lstm` | Long Short-Term Memory (Hochreiter y Schmidhuber, 1997) | nuevo |
| `biblioteca/multi-agent-research-system` | Cómo construyó Anthropic su sistema multiagente de investigación (2025) | nuevo |
| `biblioteca/patrones-contra-inyeccion` | Patrones de diseño para agentes seguros (Beurer-Kellner et al., 2025) | nuevo |
| `biblioteca/rag-lewis-2020` | Retrieval-Augmented Generation (Lewis et al., 2020) | nuevo |
| `biblioteca/react` | ReAct: razonar y actuar (Yao et al., 2022) | nuevo |
| `biblioteca/toolformer` | Toolformer (Schick et al., 2023) | nuevo |

## problemas/  ·  17 archivos

| Ruta | Título | Estado |
|---|---|---|
| `problemas/conflictos-al-integrar-en-paralelo` | Conflictos al integrar features hechas en paralelo | nuevo |
| `problemas/contexto-saturado-en-sesiones-largas` | Sesiones largas: el agente olvida y se contradice | nuevo |
| `problemas/el-agente-no-para` | El agente no para nunca | nuevo |
| `problemas/el-agente-repite-la-misma-herramienta` | El agente repite la misma herramienta en bucle | nuevo |
| `problemas/el-hook-bloquea-todo` | Mi hook bloquea todo (o nada) | nuevo |
| `problemas/el-modelo-ignora-instrucciones` | El modelo ignora mis instrucciones | nuevo |
| `problemas/el-rag-encuentra-pero-responde-mal` | El RAG recupera bien pero responde mal | nuevo |
| `problemas/el-rag-no-encuentra-el-documento` | El RAG no encuentra el documento que existe | nuevo |
| `problemas/error-429-limite-de-tasa` | Error 429: demasiadas peticiones | nuevo |
| `problemas/index` | Problemas frecuentes | nuevo |
| `problemas/json-invalido-del-modelo` | El modelo devuelve JSON inválido | nuevo |
| `problemas/la-cache-no-se-aprovecha` | El prompt caching no ahorra nada | nuevo |
| `problemas/langgraph-no-reanuda-tras-interrupt` | LangGraph no reanuda tras un interrupt | nuevo |
| `problemas/modelo-local-no-llama-herramientas` | Mi modelo local no llama a las herramientas | nuevo |
| `problemas/respuesta-cortada-por-max-tokens` | La respuesta se corta a medias | nuevo |
| `problemas/servidor-mcp-no-aparece` | El servidor MCP no aparece en el cliente | nuevo |
| `problemas/tool-result-sin-tool-use` | Error 400: tool_result sin su tool_use | nuevo |

## glosario/  ·  158 archivos

| Ruta | Título | Estado |
|---|---|---|
| `glosario/a2a` | A2A | nuevo |
| `glosario/aceptacion-ejecutable` | Aceptación ejecutable | nuevo |
| `glosario/agent-card` | Agent Card | nuevo |
| `glosario/agente` | Agente |  |
| `glosario/agents-md` | AGENTS.md | nuevo |
| `glosario/alucinacion` | Alucinación |  |
| `glosario/analisis-de-errores` | Análisis de errores | nuevo |
| `glosario/ann` | ANN (vecinos aproximados) | nuevo |
| `glosario/aprendizaje-automatico` | Aprendizaje automático | nuevo |
| `glosario/aprendizaje-no-supervisado` | Aprendizaje no supervisado | nuevo |
| `glosario/aprendizaje-por-refuerzo` | Aprendizaje por refuerzo | nuevo |
| `glosario/aprendizaje-profundo` | Aprendizaje profundo | nuevo |
| `glosario/aprendizaje-supervisado` | Aprendizaje supervisado | nuevo |
| `glosario/atencion` | Atención | nuevo |
| `glosario/backpropagation` | Backpropagation | nuevo |
| `glosario/bi-encoder` | Bi-encoder | nuevo |
| `glosario/bm25` | BM25 |  |
| `glosario/bucle-agentico` | Bucle agéntico |  |
| `glosario/bucle-ralph` | Bucle Ralph | nuevo |
| `glosario/busqueda-hibrida` | Búsqueda híbrida |  |
| `glosario/cadena-de-pensamiento` | Cadena de pensamiento |  |
| `glosario/canario-de-contexto` | Canario de contexto | nuevo |
| `glosario/carga-diferida-de-herramientas` | Carga diferida de herramientas | nuevo |
| `glosario/checkpointer` | Checkpointer | nuevo |
| `glosario/chunking` | Chunking |  |
| `glosario/claude-md` | CLAUDE.md | nuevo |
| `glosario/compactacion` | Compactación |  |
| `glosario/conjunto-de-evaluacion` | Conjunto de evaluación |  |
| `glosario/contaminacion-de-benchmark` | Contaminación de benchmark | nuevo |
| `glosario/context-rot` | Context rot | nuevo |
| `glosario/contexto-largo` | Contexto largo |  |
| `glosario/convenciones-genai-otel` | Convenciones GenAI de OpenTelemetry | nuevo |
| `glosario/cross-encoder` | Cross-encoder | nuevo |
| `glosario/cuantizacion` | Cuantización | nuevo |
| `glosario/cuantizacion-de-producto` | Cuantización de producto | nuevo |
| `glosario/decodificacion-restringida` | Decodificación restringida | nuevo |
| `glosario/descenso-del-gradiente` | Descenso del gradiente | nuevo |
| `glosario/destilacion` | Destilación |  |
| `glosario/deteccion-de-turno` | Detección de fin de turno | nuevo |
| `glosario/divulgacion-progresiva` | Divulgación progresiva | nuevo |
| `glosario/ears` | EARS | nuevo |
| `glosario/ejecucion-duradera` | Ejecución duradera | nuevo |
| `glosario/embeddings` | Embeddings |  |
| `glosario/envenenamiento-de-herramientas` | Envenenamiento de herramientas | nuevo |
| `glosario/esfuerzo` | Esfuerzo (effort) |  |
| `glosario/evals` | Evals |  |
| `glosario/fallback-de-modelo` | Fallback de modelo | nuevo |
| `glosario/fallo-en-cerrado` | Fallo en cerrado | nuevo |
| `glosario/few-shot` | Few-shot |  |
| `glosario/fidelidad` | Fidelidad | nuevo |
| `glosario/fine-tuning` | Fine-tuning |  |
| `glosario/framework-de-agentes` | Framework de agentes | nuevo |
| `glosario/funcion-de-activacion` | Función de activación | nuevo |
| `glosario/funcion-de-perdida` | Función de pérdida | nuevo |
| `glosario/function-calling` | Function calling |  |
| `glosario/gguf` | GGUF | nuevo |
| `glosario/grafo-de-estado` | Grafo de estado | nuevo |
| `glosario/graphrag` | GraphRAG | nuevo |
| `glosario/grounding` | Grounding |  |
| `glosario/guardrails` | Guardrails |  |
| `glosario/guias-y-sensores` | Guías y sensores | nuevo |
| `glosario/handoff` | Handoff | nuevo |
| `glosario/harness` | Harness | nuevo |
| `glosario/harness-engineering` | Harness engineering | nuevo |
| `glosario/hnsw` | HNSW | nuevo |
| `glosario/hook` | Hook | nuevo |
| `glosario/humano-en-el-bucle` | Humano en el bucle |  |
| `glosario/hyde` | HyDE | nuevo |
| `glosario/index` | Glosario |  |
| `glosario/inferencia-local` | Inferencia local | nuevo |
| `glosario/interaccion-tardia` | Interacción tardía | nuevo |
| `glosario/inyeccion-de-prompt` | Inyección de prompt |  |
| `glosario/ivf` | IVF | nuevo |
| `glosario/kv-cache` | KV cache | nuevo |
| `glosario/late-chunking` | Late chunking | nuevo |
| `glosario/latencia` | Latencia |  |
| `glosario/leyes-de-escalado` | Leyes de escalado | nuevo |
| `glosario/llamada-programatica` | Llamada programática a herramientas | nuevo |
| `glosario/llm` | LLM |  |
| `glosario/lost-in-the-middle` | Lost in the middle | nuevo |
| `glosario/managed-agents` | Managed Agents | nuevo |
| `glosario/max-tokens` | max_tokens |  |
| `glosario/mcp` | MCP |  |
| `glosario/memoria` | Memoria |  |
| `glosario/mensaje-de-sistema-intermedio` | Mensaje de sistema intermedio | nuevo |
| `glosario/metadatos` | Metadatos | nuevo |
| `glosario/mezcla-de-expertos` | Mezcla de expertos | nuevo |
| `glosario/middleware` | Middleware de agente | nuevo |
| `glosario/minimo-privilegio` | Mínimo privilegio |  |
| `glosario/modelo-de-razonamiento` | Modelo de razonamiento | nuevo |
| `glosario/modelo-fundacional` | Modelo fundacional | nuevo |
| `glosario/modelo-juez` | Modelo juez |  |
| `glosario/modelo-simulado` | Modelo simulado | nuevo |
| `glosario/mrr` | MRR | nuevo |
| `glosario/mrtr` | MRTR | nuevo |
| `glosario/multi-hop` | Pregunta multi-hop | nuevo |
| `glosario/multi-tenant` | Multi-tenant | nuevo |
| `glosario/ndcg` | NDCG | nuevo |
| `glosario/observabilidad` | Observabilidad |  |
| `glosario/ola` | Ola | nuevo |
| `glosario/open-source-ai` | Open source AI | nuevo |
| `glosario/orquestador` | Orquestador |  |
| `glosario/parametros` | Parámetros | nuevo |
| `glosario/pass-k` | pass@k y pass^k | nuevo |
| `glosario/perceptron` | Perceptrón | nuevo |
| `glosario/pesos-abiertos` | Pesos abiertos | nuevo |
| `glosario/plantilla-de-chat` | Plantilla de chat | nuevo |
| `glosario/preentrenamiento` | Preentrenamiento | nuevo |
| `glosario/presupuesto-de-tarea` | Presupuesto de tarea | nuevo |
| `glosario/prompt` | Prompt |  |
| `glosario/prompt-caching` | Prompt caching |  |
| `glosario/prompt-de-sistema` | Prompt de sistema |  |
| `glosario/puerta-humana` | Puerta humana | nuevo |
| `glosario/rag` | RAG |  |
| `glosario/rag-agentico` | RAG agéntico | nuevo |
| `glosario/razonamiento-extendido` | Razonamiento extendido |  |
| `glosario/react` | ReAct |  |
| `glosario/recall-at-k` | Recall@K | nuevo |
| `glosario/rechazo` | Rechazo (refusal) | nuevo |
| `glosario/recuperacion-contextual` | Recuperación contextual |  |
| `glosario/red-neuronal` | Red neuronal | nuevo |
| `glosario/reescritura-de-consulta` | Reescritura de consulta | nuevo |
| `glosario/regla-de-dos` | Regla de dos | nuevo |
| `glosario/reranking` | Reranking |  |
| `glosario/rlhf` | RLHF | nuevo |
| `glosario/rrf` | RRF | nuevo |
| `glosario/rug-pull` | Rug pull | nuevo |
| `glosario/salida-estructurada` | Salida estructurada |  |
| `glosario/sandbox` | Sandbox |  |
| `glosario/sdd` | SDD | nuevo |
| `glosario/servidor-mcp` | Servidor MCP |  |
| `glosario/similitud-coseno` | Similitud coseno |  |
| `glosario/skill` | Skill | nuevo |
| `glosario/sobreajuste` | Sobreajuste | nuevo |
| `glosario/stop-reason` | Stop reason |  |
| `glosario/streaming` | Streaming |  |
| `glosario/subagente` | Subagente |  |
| `glosario/temperatura` | Temperatura |  |
| `glosario/tipos-de-memoria` | Memoria episódica, semántica y procedimental | nuevo |
| `glosario/token` | Token |  |
| `glosario/tokenizador` | Tokenizador |  |
| `glosario/tool-choice` | tool_choice |  |
| `glosario/tool-result` | Tool result |  |
| `glosario/tool-use` | Tool use |  |
| `glosario/toolset` | Toolset | nuevo |
| `glosario/top-p` | Top-p |  |
| `glosario/transformer` | Transformer |  |
| `glosario/traspaso-de-sesion` | Traspaso de sesión | nuevo |
| `glosario/trayectoria` | Trayectoria |  |
| `glosario/trifecta-letal` | Trifecta letal | nuevo |
| `glosario/uso-del-ordenador` | Uso del ordenador |  |
| `glosario/vector-store` | Vector store |  |
| `glosario/ventana-de-contexto` | Ventana de contexto |  |
| `glosario/veredicto` | Veredicto | nuevo |
| `glosario/voz-a-voz` | Voz a voz | nuevo |
| `glosario/workflow` | Workflow |  |
| `glosario/worktree` | Worktree | nuevo |
| `glosario/zero-shot` | Zero-shot |  |

## radar/  ·  27 archivos

| Ruta | Título | Estado |
|---|---|---|
| `radar/2026-07-02-uso-del-ordenador-en-sandbox` | Uso del ordenador: siempre en sandbox |  |
| `radar/2026-07-14-subagentes-para-buscar` | Subagentes para buscar en paralelo |  |
| `radar/2026-07-21-prompt-caching-palanca-de-coste` | El prompt caching es la primera palanca de coste |  |
| `radar/2026-07-28-agentes-de-larga-duracion` | Agentes que trabajan horas: checkpoints y estado |  |
| `radar/2026-08-11-salidas-estructuradas-garantizadas` | Salidas estructuradas garantizadas por esquema |  |
| `radar/2026-08-25-razonamiento-adaptativo` | El razonamiento pasa a ser adaptativo |  |
| `radar/2026-09-08-mcp-forma-estandar` | MCP se asienta como forma estándar de conectar herramientas |  |
| `radar/2026-09-22-contexto-largo-no-sustituye-recuperacion` | Ventanas de contexto enormes: no sustituyen a la recuperación |  |
| `radar/2026-10-06-evals-continuas-en-ci` | Las evals pasan del notebook al CI |  |
| `radar/2026-10-20-inyeccion-por-herramientas` | La inyección de prompt llega por las herramientas |  |
| `radar/2026-10-22-arnes-de-codex-en-abierto` | El arnés de Codex se publica en abierto | nuevo |
| `radar/2026-10-22-harness-engineering` | El arnés pasa a ser una disciplina | nuevo |
| `radar/2026-10-23-api-2026-10-21-sin-temperatura` | La API de Claude estrena versión y se despide de temperature | nuevo |
| `radar/2026-10-23-no-se-puede-forzar-herramienta` | Los modelos 5.5 ya no admiten forzar una herramienta | nuevo |
| `radar/2026-10-24-owasp-top-10-agentico` | OWASP publica su Top 10 para aplicaciones agénticas | nuevo |
| `radar/2026-10-24-swe-bench-verified-retirado` | SWE-bench Verified deja de medir la frontera | nuevo |
| `radar/2026-10-25-mcp-sin-estado` | MCP pasa a ser un protocolo sin estado | nuevo |
| `radar/2026-10-26-otel-genai-repositorio-propio` | Las convenciones GenAI de OpenTelemetry se independizan | nuevo |
| `radar/2026-10-26-skills-cadena-de-suministro` | Las skills de terceros son cadena de suministro | nuevo |
| `radar/2026-10-27-agent-skills-en-la-aaif` | Agent Skills pasa a la Agentic AI Foundation | nuevo |
| `radar/2026-10-28-ai-act-aplaza-alto-riesgo` | El AI Act aplaza las obligaciones de alto riesgo | nuevo |
| `radar/2026-10-28-apis-anthropic-en-local` | Tu código de Claude ya habla con modelos locales | nuevo |
| `radar/2026-10-28-multiagente-un-solo-escritor` | Multiagente: un solo escritor, varios pensadores | nuevo |
| `radar/2026-10-29-harness-alojado-managed-agents` | El harness también se alquila: Claude Managed Agents | nuevo |
| `radar/2026-10-29-licencias-model-as-a-service` | Pesos abiertos con letra pequeña: licencias contra el modelo como servicio | nuevo |
| `radar/2026-10-29-tgi-archivado-y-llama-cpp-semver` | Cambian los motores: TGI se archiva y llama.cpp cambia de puerto | nuevo |
| `radar/index` | Radar |  |

## blog/  ·  20 archivos

| Ruta | Título | Estado |
|---|---|---|
| `blog/2026-07-01-por-que-morecontext` | Por qué MoreContext |  |
| `blog/2026-07-15-como-leer-una-traza` | Cómo leer la traza de un agente |  |
| `blog/2026-07-30-por-que-mcp-importa` | Por qué MCP importa más de lo que parece |  |
| `blog/2026-08-22-dejar-un-agente-trabajando-horas` | Qué hace falta para dejar a un agente trabajando horas |  |
| `blog/2026-09-10-evals-antes-que-prompts` | Evals antes que prompts |  |
| `blog/2026-09-28-el-contexto-es-un-presupuesto` | El contexto es un presupuesto, no un cajón |  |
| `blog/2026-10-12-tu-primer-agente-deberia-ser-un-workflow` | Por qué tu primer agente debería ser un workflow |  |
| `blog/2026-10-14-mi-ruta-para-aprender-ia-con-videos` | Mi ruta para aprender IA con vídeos gratuitos | nuevo |
| `blog/2026-10-15-la-respuesta-mas-probable` | La respuesta más probable no es la respuesta correcta | nuevo |
| `blog/2026-10-16-cuanto-saber-de-redes-neuronales` | Cuánto necesitas saber de redes neuronales para construir agentes | nuevo |
| `blog/2026-10-18-del-autocompletado-al-agente` | Del autocompletado al agente: lo que cambió en un año | nuevo |
| `blog/2026-10-19-haz-que-funcione-no-es-una-instruccion` | «Haz que funcione» no es una instrucción | nuevo |
| `blog/2026-10-21-treinta-minutos-al-dia` | Treinta minutos al día | nuevo |
| `blog/2026-10-22-de-codex-a-claude-code` | De Codex a Claude Code: cómo evolucionó mi harness | nuevo |
| `blog/2026-10-23-una-sola-puerta-humana` | Por qué mi harness tiene una sola puerta humana | nuevo |
| `blog/2026-10-25-tres-cosas-que-se-rompen-sin-worktrees` | Tres cosas que se rompen si paralelizas sin worktrees | nuevo |
| `blog/2026-10-26-auditar-tu-propio-harness` | Auditar tu propio harness | nuevo |
| `blog/2026-10-27-el-arnes-importa-y-cuesta` | El arnés importa (y cuesta) | nuevo |
| `blog/2026-10-28-sdk-o-framework` | SDK del proveedor o framework: cómo elijo | nuevo |
| `blog/index` | Blog y ensayos |  |

## boletin/  ·  3 archivos

| Ruta | Título | Estado |
|---|---|---|
| `boletin/001` | Boletín n.º 1 · Bienvenida |  |
| `boletin/002` | Boletín n.º 2 · Contexto justo |  |
| `boletin/index` | Boletín |  |
