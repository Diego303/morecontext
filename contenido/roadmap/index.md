---
titulo: Roadmap 0→100
descripcion: Once niveles en orden, de qué es un LLM a un agente en producción con skills, especificación, evals y harness, con lecciones cortas y un proyecto con entregable en cada nivel.
creado: 2026-07-02
actualizado: 2026-10-29
orden: 1
tags: [roadmap]
relacionados: ["[[paginas/empieza-aqui]]", "[[cursos/index]]", "[[patrones/index]]", "[[cursos/ruta-en-video/index]]"]
---

El roadmap es el camino principal de MoreContext: lo que necesitas saber para construir agentes de IA, **en el orden en que conviene aprenderlo**. Cada nivel se apoya en el anterior.

## Cómo está organizado

Son once niveles. El número indica dónde estás en el camino del 0 al 100:

| Nivel | Qué aprendes |
|---|---|
| [[roadmap/00-fundamentos/index]] | Qué es un LLM, tokens, contexto y tu primera llamada |
| [[roadmap/10-prompting/index]] | Instrucciones, ejemplos, formato y prompt de sistema |
| [[roadmap/20-herramientas/index]] | El ciclo `tool_use` → `tool_result` y MCP |
| [[roadmap/30-contexto-y-rag/index]] | Embeddings, búsqueda, citas y memoria |
| [[roadmap/40-primer-agente/index]] | El bucle agéntico, límites y trazas |
| [[roadmap/50-skills/index]] | Procedimientos empaquetados que el agente carga cuando los necesita |
| [[roadmap/60-multiagente/index]] | Orquestador, subagentes y su coste |
| [[roadmap/70-flujos-con-especificacion/index]] | Requisitos, plan, aceptación ejecutable y una sola puerta humana |
| [[roadmap/80-evals/index]] | Conjuntos de prueba, jueces y regresiones |
| [[roadmap/90-harness/index]] | El entorno del agente: permisos, hooks, estado, coste y contexto |
| [[roadmap/100-produccion/index]] | Observabilidad, costes, latencia, seguridad y despliegue |

Los niveles se agrupan en tres tramos. Del 00 al 30 aprendes a hablar con un modelo y darle herramientas y contexto. Del 40 al 60 construyes agentes: uno, uno con procedimientos reutilizables y varios coordinados. Del 70 al 100 aprendes a fiarte de lo que hacen: especificar antes de construir, medir, rodear al agente de un [[glosario/harness|harness]] y llevarlo a producción.

Cada nivel tiene una ficha con su objetivo, lo que necesitas antes y un **proyecto con un entregable concreto**. Las lecciones son cortas, de teoría o práctica, y casi todas terminan con un ejercicio con criterio de aceptación. El código usa la API de Claude como referencia y, donde aporta, muestra después lo mismo con frameworks abiertos como LangChain y LangGraph.

## Cómo usarlo

- Ve en orden si empiezas de cero. Si ya tienes base, haz el test de [[paginas/empieza-aqui]] y entra en el nivel que te toque.
- Haz el proyecto de cada nivel antes de pasar al siguiente. Es donde se fija lo aprendido.
- Cuando un tema te interese a fondo, salta al [[cursos/index|curso]] correspondiente y vuelve.

## Caminos complementarios

El roadmap no es la única puerta. Tres cursos lo acompañan sin sustituirlo:

- [[cursos/ruta-en-video/index]]: la ruta del autor con vídeos y cursos gratuitos, para quien prefiere ver antes de leer. Sus fases encajan con los niveles del roadmap y puedes alternar.
- [[cursos/langchain-y-langgraph/index]]: rehace con frameworks abiertos el agente que construyes a mano en el nivel 40. Tiene más sentido después de ese nivel.
- [[cursos/agentes-con-modelos-abiertos/index]]: los mismos agentes con modelos de pesos abiertos, en local o autoalojados, cuando no quieres o no puedes depender de una API.

## Cuánto tiempo

Las fichas estiman entre 3 y 6 horas por nivel, unas 53 en total. Depende de tu ritmo y de cuánto te detengas en los proyectos.

## Requisitos

Saber programar a nivel básico en Python o TypeScript, usar la terminal y tener una clave de API de un proveedor de modelos (o un modelo local con [[herramientas/ollama|Ollama]], con las limitaciones que explica el curso de modelos abiertos). No necesitas saber matemáticas ni aprendizaje automático.
