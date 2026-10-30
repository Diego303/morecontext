---
titulo: Memoria episódica, semántica y procedimental
descripcion: Los tipos de memoria de un agente según CoALA y cómo te ayudan a decidir qué guardar, dónde y con qué reglas.
creado: 2026-10-29
categoria: contexto
ingles: Episodic, semantic and procedural memory
aliases: [episodic memory, semantic memory, procedural memory, memoria de trabajo, CoALA]
tags: [contexto, memoria, agentes]
relacionados: ["[[glosario/memoria]]", "[[docs/contexto/04-memoria]]", "[[roadmap/30-contexto-y-rag/06-memoria-entre-sesiones]]"]
---

La clasificación más usada para la [[glosario/memoria]] de un agente viene de CoALA ([Sumers, Yao, Narasimhan y Griffiths, 2023](https://arxiv.org/abs/2309.02427)), que la toma de la psicología cognitiva. La **memoria de trabajo** es lo que está activo en el ciclo actual (el contexto). La **episódica** guarda experiencias pasadas: conversaciones o [[glosario/trayectoria|trayectorias]] concretas. La **semántica** guarda conocimiento sobre el mundo y sobre el propio agente. La **procedimental** es el saber hacer: está en los pesos y en el código y los prompts del agente.

## En la práctica

Sirve para decidir qué construir. Las preferencias de un usuario o los datos de un cliente son memoria semántica (hechos que se consultan). Los casos resueltos que el agente puede imitar son episódica (se recuperan por parecido). «Cómo se despliega este servicio» es procedimental, y hoy suele vivir en una [[glosario/skill]] o en `AGENTS.md`. Para cada tipo define quién escribe, cuándo, con qué validación y cuándo caduca. Al leerla, trátala como entrada no fiable: OWASP recoge el envenenamiento de memoria y contexto como riesgo propio (ASI06).

## No confundir con

- **[[glosario/ventana-de-contexto]]**: es la memoria de trabajo; lo demás vive fuera y entra solo cuando se recupera.

## Ver también

- [[docs/contexto/04-memoria]]
- [[cursos/context-engineering/03-compactacion-y-memoria]]
- [[cursos/langchain-y-langgraph/06-memoria-y-persistencia]]
- [[glosario/rag]]
