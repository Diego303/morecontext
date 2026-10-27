---
titulo: Sistemas multiagente
descripcion: Arquitecturas, diseño de subagentes, coordinación del estado y depuración de sistemas donde varios agentes colaboran en una tarea.
creado: 2026-09-24
orden: 6
nivel: avanzado
horas: 5
objetivo: Diseñar, construir y depurar un sistema multiagente con un orquestador, subagentes con instrucciones autocontenidas y estado externo, sabiendo cuándo compensa frente a un solo agente.
requiere: ["[[roadmap/40-primer-agente/index]]", "[[roadmap/60-multiagente/index]]"]
relacionados: ["[[sistemas/investigacion-multiagente]]", "[[patrones/06-orquestador-trabajadores]]", "[[docs/agentes/02-subagentes]]", "[[disciplinas/orquestador-y-subagentes]]"]
tags: [agentes, multiagente, orquestacion]
---

El nivel [[roadmap/60-multiagente/index]] del roadmap te enseñó la mecánica: un [[glosario/orquestador|orquestador]] reparte trabajo, los [[glosario/subagente|subagentes]] lo hacen en paralelo y alguien junta los resultados. Este curso va un paso más allá. Aquí aprendes a elegir la arquitectura según la tarea, a escribir subagentes que no dupliquen trabajo ni se pierdan, a guardar el estado fuera del contexto de los agentes y a depurar un sistema cuyo fallo puede estar en cualquiera de sus piezas.

La referencia de fondo es *[How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)* (Anthropic, 2025), que cuenta con detalle qué funcionó y qué no al llevar un sistema así a producción. Lo citamos a lo largo del curso.

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
> Un sistema multiagente consume bastantes más tokens que un solo agente con la misma tarea, y el artículo de Anthropic lo deja claro. Mide el coste desde el primer ejercicio con `usage` y compáralo con un agente único ([[roadmap/60-multiagente/05-coste-de-multiplicar-agentes]]).
