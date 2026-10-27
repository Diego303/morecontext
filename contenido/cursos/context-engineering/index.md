---
titulo: Context engineering
descripcion: Cómo decidir qué entra en el contexto de un modelo o agente, cuánto ocupa, cuándo compactarlo y cómo mantener agentes que trabajan durante horas.
creado: 2026-10-05
orden: 7
nivel: intermedio
horas: 4
objetivo: Medir y gestionar el contexto de un agente como un presupuesto, seleccionando lo que entra, compactando el historial y usando notas persistentes para tareas largas.
requiere: ["[[roadmap/00-fundamentos/index]]", "[[roadmap/30-contexto-y-rag/index]]", "[[roadmap/40-primer-agente/index]]"]
relacionados: ["[[disciplinas/context-engineering]]", "[[modelos/02-ingenieria-de-contexto]]", "[[docs/contexto/01-ventana-de-contexto]]", "[[blog/2026-09-28-el-contexto-es-un-presupuesto]]"]
tags: [contexto, agentes, memoria]
---

El *context engineering* es la práctica de decidir qué información ve el modelo en cada llamada: instrucciones, herramientas, documentos, historial y resultados. Con una llamada suelta se parece mucho al prompting. Con un agente que da cincuenta pasos se convierte en el problema principal, porque el contexto crece en cada paso y lo que entra condiciona todo lo que sale.

Este curso trata el contexto como lo que es: un recurso finito. Aprenderás a medirlo, a llenarlo con lo que aporta, a vaciarlo cuando estorba y a construir agentes que trabajan más allá de lo que cabe en una sola [[glosario/ventana-de-contexto|ventana de contexto]]. La referencia de fondo es *[Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)* (Anthropic, 2025).

## Para quién

Para quien ya tiene un agente o un RAG funcionando y nota que empeora con conversaciones largas, se vuelve caro o se olvida de cosas. También para quien diseña agentes que deben trabajar durante horas. Si no sabes qué es un [[glosario/token|token]] o cómo funciona la ventana de contexto, empieza por [[roadmap/00-fundamentos/03-ventana-de-contexto]].

## Requisitos

- Nivel [[roadmap/00-fundamentos/index]], sobre todo tokens y ventana de contexto.
- Nivel [[roadmap/40-primer-agente/index]]: necesitas un bucle agéntico propio para hacer los ejercicios.
- Recomendable: [[roadmap/30-contexto-y-rag/06-memoria-entre-sesiones]] y [[docs/contexto/02-prompt-caching]].

## Temario

1. [[cursos/context-engineering/01-el-contexto-como-presupuesto]]. Por qué más contexto no siempre es mejor, qué dice *Lost in the Middle* y cómo medir cuánto ocupa cada componente.
2. [[cursos/context-engineering/02-que-meter-y-que-no]]. Prompt de sistema, herramientas, ejemplos y resultados de herramientas: cómo dejar solo lo que aporta señal y cargar el resto bajo demanda.
3. [[cursos/context-engineering/03-compactacion-y-memoria]]. Limpiar resultados antiguos, resumir el historial sin romper pares `tool_use`/`tool_result` y tomar notas fuera del contexto.
4. [[cursos/context-engineering/04-contexto-para-agentes-largos]]. Combinar compactación, notas y subagentes, con puntos de control para reanudar.

## Qué construyes

Un conjunto de utilidades que puedes añadir a cualquier bucle agéntico:

- un medidor que desglosa los tokens por componente (sistema, herramientas, historial, resultados);
- un recortador de resultados de herramientas con paginación;
- un compactador que limpia resultados antiguos y resume el historial al pasar un umbral;
- un sistema de notas persistentes y puntos de control para reanudar una tarea larga con contexto limpio.

> [!nota] Relación con otras secciones
> La disciplina general está en [[disciplinas/context-engineering]] y los consejos de redacción en [[modelos/02-ingenieria-de-contexto]]. Este curso es la parte práctica, con código, para agentes.
