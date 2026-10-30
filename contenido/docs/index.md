---
titulo: Documentación
descripcion: Referencia por temas para consultar mientras construyes, de la API de mensajes a la seguridad, con ejemplos completos y tablas de parámetros.
creado: 2026-07-04
actualizado: 2026-10-29
orden: 3
tags: [docs]
relacionados: ["[[roadmap/index]]", "[[recetas/index]]", "[[glosario/index]]"]
---

La documentación es la **referencia por temas** de MoreContext. Aquí vienes a consultar algo concreto mientras construyes: qué bloques tiene una respuesta, cómo se marca un error de herramienta, dónde se pone el punto de caché.

## Cómo está organizada

Doce grupos. Los ocho primeros van del más básico al más operativo; los cuatro últimos cubren las plataformas y el ecosistema sobre los que construyes. Cada grupo tiene una portada con la lista comentada de sus artículos.

**Construir con la API**

- [[docs/fundamentos/index]]: la API de mensajes, roles, bloques, [[glosario/streaming|streaming]], [[docs/fundamentos/05-versiones-de-api-y-sdks|versiones de la API]] y [[docs/fundamentos/06-motivos-de-parada-y-rechazos|motivos de parada]]. Empieza por [[docs/fundamentos/03-api-de-mensajes]].
- [[docs/prompting/index]]: prompt de sistema, ejemplos, [[docs/prompting/03-salida-estructurada|salida estructurada]] y razonamiento.
- [[docs/herramientas/index]]: [[docs/herramientas/01-uso-de-herramientas]], MCP, herramientas del servidor, uso del ordenador, búsqueda de herramientas y llamada programática.
- [[docs/contexto/index]]: ventana de contexto, [[docs/contexto/02-prompt-caching|prompt caching]], RAG, memoria y gestión del contexto en el servidor.
- [[docs/agentes/index]]: [[docs/agentes/01-el-bucle-agentico|el bucle agéntico]], subagentes, aprobación humana y [[docs/agentes/04-managed-agents|Managed Agents]].
- [[docs/evals/index]]: diseñar evals, usar un modelo como juez y leer benchmarks públicos.
- [[docs/produccion/index]]: observabilidad, costes, límites, latencia y trazas con OpenTelemetry.
- [[docs/seguridad/index]]: [[docs/seguridad/01-prompt-injection|prompt injection]], mínimo privilegio, patrones contra la inyección y seguridad de MCP y skills de terceros.

**Plataformas y ecosistema**

- [[docs/claude-code/index]]: Claude Code como *harness* listo para usar: `CLAUDE.md` y `AGENTS.md`, subagentes, skills, hooks, permisos, MCP y modo *headless*.
- [[docs/frameworks/index]]: el Claude Agent SDK y los frameworks open source (LangChain, LangGraph, Pydantic AI, OpenAI Agents SDK…), con sus equivalencias con el código a mano.
- [[docs/modelos-abiertos/index]]: modelos de pesos abiertos e infraestructura abierta: Ollama, vLLM, llama.cpp, embeddings, bases vectoriales, observabilidad y evals.
- [[docs/estandares/index]]: los estándares abiertos de agentes: MCP 2026-07-28 y sus extensiones, A2A, Agent Skills y `AGENTS.md`.

Cada artículo empieza con una definición, sigue con secciones de referencia y un ejemplo completo, y termina con los errores habituales y enlaces relacionados.

## Docs o roadmap

| Si quieres… | Ve a |
|---|---|
| Aprender un tema desde cero, en orden | [[roadmap/index]] |
| Consultar un parámetro, un formato o un caso límite | Documentación |
| Resolver un problema concreto en pocos pasos | [[recetas/index]] |
| Saber qué significa una palabra | [[glosario/index]] |
| Elegir una herramienta o librería del ecosistema | [[herramientas/index]] |
| Arreglar un error que ya tienes delante | [[problemas/index]] |

Las lecciones del roadmap enlazan a los artículos de docs cuando necesitas el detalle. Los artículos de docs no explican desde cero: dan por hecho que conoces lo básico.

> [!nota] Datos que cambian
> Nombres de modelo, precios y límites cambian a menudo. Los artículos están revisados contra la versión `2026-10-21` de la API de Claude, la especificación MCP `2026-07-28` y las versiones de los frameworks a 29 de octubre de 2026. Explican el concepto y remiten a la [documentación oficial de la API](https://platform.claude.com/docs) para las cifras.
