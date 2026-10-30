---
titulo: Ejecución duradera
descripcion: Ejecutar un agente como una serie de pasos guardados, de modo que una caída, un despliegue o una espera de días no obligue a empezar de cero.
creado: 2026-10-29
categoria: produccion
ingles: Durable execution
aliases: [durable execution, ejecución durable, workflows duraderos]
tags: [produccion, agentes, persistencia]
relacionados: ["[[glosario/checkpointer]]", "[[recetas/reanudar-un-agente-tras-un-reinicio]]", "[[sistemas/agente-de-larga-duracion]]", "[[roadmap/100-produccion/06-despliegue]]"]
---

La ejecución duradera consiste en registrar cada paso de un proceso largo (cada llamada al modelo, cada herramienta, cada espera) para que, si el proceso muere, se reanude desde el último paso completado sin repetir lo que ya hizo. Importa en agentes que trabajan minutos u horas o que esperan una aprobación humana durante días.

## En la práctica

Tienes dos caminos. El primero es el propio framework: LangGraph guarda el estado tras cada superpaso con un [[glosario/checkpointer]] y deja elegir cuándo persistir (`durability="sync"`, `"async"` o `"exit"`). El segundo es un motor de *workflows* duraderos: Temporal (SDK MIT), DBOS (MIT, guarda los pasos en Postgres), Restate (SDK MIT, servidor con licencia BSL) o Inngest. Pydantic AI se integra con Temporal, DBOS y Prefect.

El criterio de diseño es el mismo en todos: **cada paso debe ser idempotente**. Si una herramienta envía un correo y el proceso cae justo después, al reanudar no debe enviarlo otra vez; guarda un identificador de la acción y compruébalo antes de repetirla.

## No confundir con

- **Reintentos**: repetir una llamada que falló. La ejecución duradera recuerda todo lo que ya salió bien.
- **[[glosario/memoria]]**: lo que el agente sabe entre conversaciones, no el punto exacto de una ejecución.

## Ver también

- [[cursos/langchain-y-langgraph/06-memoria-y-persistencia]]
- [[docs/frameworks/07-pydantic-ai]]
- [[glosario/humano-en-el-bucle]]
