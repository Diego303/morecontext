---
titulo: Sistemas multiagente
descripcion: Arquitecturas, diseño de subagentes, coordinación del estado y depuración de sistemas donde varios agentes colaboran en una tarea.
creado: 2026-09-24
actualizado: 2026-10-29
orden: 6
nivel: avanzado
horas: 5
objetivo: Diseñar, construir y depurar un sistema multiagente con un orquestador, subagentes con instrucciones autocontenidas y estado externo, sabiendo cuándo compensa frente a un solo agente.
requiere: ["[[roadmap/40-primer-agente/index]]", "[[roadmap/60-multiagente/index]]"]
relacionados: ["[[sistemas/investigacion-multiagente]]", "[[patrones/06-orquestador-trabajadores]]", "[[docs/agentes/02-subagentes]]", "[[disciplinas/orquestador-y-subagentes]]", "[[cursos/langchain-y-langgraph/08-multiagente-con-langgraph]]"]
tags: [agentes, multiagente, orquestacion]
---

El nivel [[roadmap/60-multiagente/index]] del roadmap te enseñó la mecánica: un [[glosario/orquestador|orquestador]] reparte trabajo, los [[glosario/subagente|subagentes]] lo hacen en paralelo y alguien junta los resultados. Este curso va un paso más allá. Aquí aprendes a elegir la arquitectura según la tarea, a escribir subagentes que no dupliquen trabajo ni se pierdan, a guardar el estado fuera del contexto de los agentes y a depurar un sistema cuyo fallo puede estar en cualquiera de sus piezas.

La referencia de fondo es *[How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)* (Anthropic, 13 jun. 2025), que cuenta con detalle qué funcionó y qué no al llevar un sistema así a producción; lo tienes comentado en [[biblioteca/multi-agent-research-system]]. El contrapunto son los dos artículos de Walden Yan en Cognition: *[Don't Build Multi-Agents](https://cognition.com/blog/dont-build-multi-agents)* (jun. 2025) y *[Multi-Agents: What's Actually Working](https://cognition.com/blog/multi-agents-working)* (abr. 2026). Coinciden en lo esencial: los subagentes que leen e investigan funcionan; varios agentes escribiendo a la vez sobre lo mismo, no. Las escrituras van por un solo hilo ([[radar/2026-10-28-multiagente-un-solo-escritor]]).

El código del curso usa el SDK de Anthropic para que veas cada mecanismo. Donde aporta, cada lección muestra después cómo se hace lo mismo con [[herramientas/langgraph|LangGraph]] (open source, MIT): `Send` para repartir trabajo en paralelo, `Command` para decidir el siguiente paso desde un nodo, subgrafos para encapsular un subagente y *checkpointers* para que el estado sobreviva. El curso [[cursos/langchain-y-langgraph/index]] lo desarrolla entero.

## Para quién

Para quien ya tiene un agente funcionando y se plantea dividirlo, o ya tiene un sistema multiagente y le cuesta entender por qué falla. Si aún no has leído [[roadmap/60-multiagente/01-cuando-no-usar-multiagente]], léela primero: la mayoría de los problemas no necesitan varios agentes.

## Requisitos

- Haber completado [[roadmap/40-primer-agente/index]] y al menos [[roadmap/60-multiagente/02-orquestador-y-subagentes]] y [[roadmap/60-multiagente/04-paralelismo]].
- Python 3.10+ con `asyncio` o Node 18+.
- Saber leer trazas de un agente ([[roadmap/40-primer-agente/06-depurar-con-trazas]]).

## Temario

1. [[cursos/sistemas-multiagente/01-arquitecturas]]. Orquestador y trabajadores, pipeline y evaluador o debate. Qué problema resuelve cada una, cuándo falla y cómo elegir.
2. [[cursos/sistemas-multiagente/02-disenar-subagentes]]. Instrucciones autocontenidas, herramientas mínimas, presupuesto y formato de retorno estructurado.
3. [[cursos/sistemas-multiagente/03-coordinacion-y-estado]]. Un solo escritor, artefactos en almacenamiento externo, referencias en lugar de contenido y planes que sobreviven al contexto.
4. [[cursos/sistemas-multiagente/04-depurar-sistemas-multiagente]]. Trazas con identificadores padre-hijo, grabación y reproducción, y los fallos típicos de coordinación.

## Qué construyes

Un sistema de investigación con un orquestador y subagentes paralelos que:

- recibe briefs autocontenidos con objetivo, límites y formato de retorno;
- devuelve resultados validados por esquema mediante una herramienta de entrega;
- guarda los hallazgos como artefactos en disco y pasa solo referencias al orquestador;
- registra una traza por agente enlazada a la del orquestador y permite reproducir una ejecución.

Es la versión de curso de [[sistemas/investigacion-multiagente]].

> [!aviso] Antes de empezar
> Un sistema multiagente consume bastantes más tokens que un solo agente con la misma tarea. En el artículo de Anthropic, un agente gastaba unas 4 veces los tokens de un chat y su sistema multiagente unas 15 veces. Mide el coste desde el primer ejercicio con `usage` y compáralo con un agente único ([[roadmap/60-multiagente/05-coste-de-multiplicar-agentes]]).
