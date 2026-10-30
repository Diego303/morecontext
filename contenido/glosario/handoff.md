---
titulo: Handoff
descripcion: Pasar el control de una conversación de un agente a otro especialista, que continúa con el historial en lugar de devolver un resultado al primero.
creado: 2026-10-29
categoria: agentes
ingles: Handoff
aliases: [handoffs, transferencia entre agentes, transfer_to]
tags: [agentes, multiagente, frameworks]
relacionados: ["[[docs/frameworks/06-openai-agents-sdk]]", "[[cursos/sistemas-multiagente/01-arquitecturas]]", "[[glosario/subagente]]", "[[patrones/04-enrutado]]"]
---

Un handoff es cuando un agente cede la conversación a otro agente más adecuado, que sigue a partir de ahí con su propio prompt y sus herramientas. El primero deja de ser el agente activo: no espera una respuesta para continuar.

## En la práctica

El caso típico es el triaje: un agente de entrada decide si el cliente necesita a «devoluciones» o a «facturación» y le pasa el control. En el OpenAI Agents SDK cada handoff se expone al modelo como una herramienta `transfer_to_<agente>`; cuando el modelo la llama, cambia el agente activo. LlamaIndex tiene `can_handoff_to` y en LangGraph lo haces con `Command(goto=…)` desde un nodo.

Decide qué historial se lleva el agente que recibe: todo, un resumen o solo el último mensaje. Pasarlo todo mantiene el contexto pero arrastra ruido y tokens; pasar poco obliga a escribir bien el traspaso. Pon un límite de saltos para que dos agentes no se pasen la conversación indefinidamente.

## No confundir con

- **[[glosario/subagente]]** o agente como herramienta: el orquestador delega, recibe el resultado y sigue al mando.
- **[[glosario/traspaso-de-sesion]]**: pasar trabajo a una sesión nueva del mismo agente para limpiar el contexto.

## Ver también

- [[roadmap/60-multiagente/03-pasar-contexto-entre-agentes]]
- [[herramientas/openai-agents-sdk]]
- [[glosario/a2a]]
