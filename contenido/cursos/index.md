---
titulo: Cursos específicos
descripcion: Catorce monográficos sobre un solo tema, de la base de la IA a RAG, MCP, evals, seguridad, frameworks abiertos y harness, para profundizar donde el roadmap solo te deja empezar.
creado: 2026-07-02
actualizado: 2026-10-29
orden: 2
tags: [cursos]
relacionados: ["[[roadmap/index]]", "[[paginas/empieza-aqui]]", "[[docs/index]]", "[[cursos/ruta-en-video/index]]"]
---

Los cursos son **monográficos sobre un solo tema**. El [[roadmap/index|roadmap]] te da una base amplia; un curso te lleva a fondo en una parte concreta, con lecciones en orden y algo que construir al final.

## Para quién

Para quien ya tiene la base de los primeros niveles del roadmap y necesita dominar un tema porque lo va a usar en un proyecto. Tres cursos son la excepción y sirven desde cero: la base de la IA, la IA en la empresa y la ruta en vídeo. Cada ficha indica su nivel (inicial, intermedio o avanzado), las horas estimadas y qué niveles del roadmap conviene haber hecho antes.

## Qué cursos hay

**Para entender y decidir** (nivel inicial, sin requisitos):

| Curso | Nivel | Cuándo te sirve |
|---|---|---|
| [[cursos/la-ia-por-dentro/index]] | inicial | Quieres entender qué hay debajo de un LLM (redes neuronales, atención) sin dedicarte a entrenar modelos |
| [[cursos/ia-en-la-empresa/index]] | inicial | Tienes que decidir si un problema de tu organización pide prompt, RAG, fine-tuning o nada, y cómo medirlo |
| [[cursos/ruta-en-video/index]] | inicial | Aprendes mejor con vídeos y quieres una ruta ordenada de vídeos gratuitos que enlaza con la práctica en la web |

**Para construir** (intermedio):

| Curso | Nivel | Cuándo te sirve |
|---|---|---|
| [[cursos/rag-a-fondo/index]] | intermedio | Tu asistente responde sobre documentos y falla al recuperar; diez lecciones del índice a la evaluación |
| [[cursos/mcp-de-cero-a-servidor/index]] | intermedio | Quieres exponer tus herramientas o datos con un estándar (especificación 2026-07-28) |
| [[cursos/context-engineering/index]] | intermedio | Tus conversaciones largas pierden calidad o cuestan demasiado |
| [[cursos/agentes-de-codigo/index]] | intermedio | Trabajas con un agente de código o quieres construir uno |
| [[cursos/langchain-y-langgraph/index]] | intermedio | Quieres construir los agentes del roadmap con el framework open source más usado y saber qué esconde |
| [[cursos/agentes-con-modelos-abiertos/index]] | intermedio | Necesitas que todo corra en tu máquina o en tus servidores, con modelos de pesos abiertos |
| [[cursos/evals-para-agentes/index]] | intermedio | No sabes si tu agente mejora o empeora con cada cambio |

**Para producción y sistemas complejos** (avanzado):

| Curso | Nivel | Cuándo te sirve |
|---|---|---|
| [[cursos/seguridad-y-prompt-injection/index]] | avanzado | Tu agente lee contenido externo o ejecuta acciones |
| [[cursos/sistemas-multiagente/index]] | avanzado | Una sola tarea ya no cabe en un agente |
| [[cursos/uso-del-ordenador/index]] | avanzado | Necesitas automatizar una interfaz sin API |
| [[cursos/harness-engineering/index]] | avanzado | Quieres un harness multiagente completo para Claude Code y adaptarlo a tu repositorio |

## Cómo combinarlos con el roadmap

- **Después del nivel que lo introduce.** RAG a fondo encaja tras el [[roadmap/30-contexto-y-rag/index|nivel 30]]; MCP, tras el [[roadmap/20-herramientas/index|nivel 20]]; Evals para agentes, tras el [[roadmap/80-evals/index|nivel 80]]; Harness engineering, tras el [[roadmap/90-harness/index|nivel 90]].
- **Antes de empezar, si partes de cero.** La IA por dentro y la ruta en vídeo preparan el [[roadmap/00-fundamentos/index|nivel 0]]; IA en la empresa sirve a quien decide sin programar.
- **En paralelo, para cambiar de herramienta.** LangChain y LangGraph y Agentes con modelos abiertos rehacen con open source lo que construyes en el [[roadmap/40-primer-agente/index|nivel 40]] con el SDK. Hazlos cuando ya hayas escrito el bucle a mano: así sabes qué hace el framework por ti.
- **Como desvío puntual.** Si tu proyecto lo pide, haz el curso y vuelve al roadmap donde lo dejaste.
- **Los avanzados, al final.** Seguridad, multiagente, uso del ordenador y harness piden haber construido antes un agente sencillo en el nivel 40.

Algunas combinaciones que funcionan: RAG a fondo seguido de Evals para agentes (mides lo que has construido); MCP seguido de Seguridad (expones herramientas y luego las proteges); Agentes de código, Context engineering y Harness engineering, en ese orden, si trabajas a diario con un agente de código.

Cada lección indica qué requiere. Si te falta algo, el enlace te lleva a la lección previa.
