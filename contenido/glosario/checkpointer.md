---
titulo: Checkpointer
descripcion: Componente de LangGraph que guarda el estado del grafo tras cada paso bajo un thread_id, para pausar, reanudar, volver atrás o recuperarse de un fallo.
creado: 2026-10-29
categoria: agentes
ingles: Checkpointer
aliases: [checkpointer, checkpoint, InMemorySaver, SqliteSaver, PostgresSaver]
tags: [agentes, langgraph, persistencia]
relacionados: ["[[cursos/langchain-y-langgraph/06-memoria-y-persistencia]]", "[[glosario/grafo-de-estado]]", "[[glosario/ejecucion-duradera]]", "[[docs/frameworks/05-langgraph]]"]
---

Un checkpointer es el componente de LangGraph que persiste el estado de un [[glosario/grafo-de-estado]] al final de cada superpaso, asociado a un `thread_id`. Con él, una ejecución puede detenerse y continuar más tarde, incluso en otro proceso.

## En la práctica

Se pasa al compilar el grafo (o a `create_agent` en LangChain) y cada invocación indica su hilo en `config={"configurable": {"thread_id": "pedido-42"}}`. `InMemorySaver` sirve para pruebas; en producción usa `SqliteSaver` (paquete `langgraph-checkpoint-sqlite`; se abre con `SqliteSaver.from_conn_string("agente.db")`, que es un gestor de contexto) o `PostgresSaver`. Todos son MIT.

Sin checkpointer no hay [[glosario/humano-en-el-bucle]] con `interrupt()`: la pausa necesita guardar el estado y la reanudación con `Command(resume=…)` necesita el mismo `thread_id`. También da historial: `get_state_history(config)` devuelve cada paso, útil para depurar o volver a un punto anterior.

## No confundir con

- **Store** de LangGraph: memoria a largo plazo compartida entre hilos. El checkpointer guarda el estado de un hilo.
- **Checkpoints de Claude Code** (`/rewind`): deshacen cambios de una sesión interactiva.

## Ver también

- [[cursos/langchain-y-langgraph/07-humano-en-el-bucle-con-interrupt]]
- [[problemas/langgraph-no-reanuda-tras-interrupt]]
- [[recetas/aprobacion-humana-con-langgraph]]
