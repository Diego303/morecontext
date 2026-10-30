---
titulo: ReAct
descripcion: Patrón de agente que alterna razonar sobre la situación, ejecutar una acción y observar su resultado, en bucle.
creado: 2026-07-12
actualizado: 2026-10-29
categoria: agentes
ingles: Reasoning and Acting
aliases: [Reasoning and Acting, razonar y actuar, Reason + Act]
tags: [agentes, patrones]
relacionados: ["[[roadmap/40-primer-agente/02-el-bucle-agentico]]", "[[patrones/08-agente-autonomo]]"]
---

ReAct es un patrón propuesto por Yao et al. (2022) en el que el modelo intercala tres cosas: un **pensamiento** sobre qué sabe y qué le falta, una **acción** (llamar a una herramienta) y una **observación** (el resultado). Con cada observación vuelve a pensar, hasta tener la respuesta. Razonar guía las acciones; actuar trae datos reales que corrigen el razonamiento.

## En la práctica

El artículo original lo implementaba con texto y un formato fijo («Thought:», «Action:», «Observation:») que el código parseaba. Hoy la misma idea está integrada en las APIs: el modelo razona (en texto o con [[glosario/razonamiento-extendido]]), emite bloques `tool_use` y recibe un [[glosario/tool-result]]. Tu [[glosario/bucle-agentico]] es, en esencia, un ReAct. No hace falta imponer el formato antiguo. En LangGraph, `create_react_agent` está deprecado en favor de `create_agent` de LangChain, que monta el mismo bucle.

## No confundir con

- **React**: la librería de interfaces de JavaScript. Solo comparten el nombre.
- **[[glosario/cadena-de-pensamiento]]**: razona, pero no actúa ni observa el entorno.

## Ver también

- [[roadmap/40-primer-agente/02-el-bucle-agentico]]
- [[patrones/08-agente-autonomo]]
- [[docs/agentes/01-el-bucle-agentico]]
- [[glosario/agente]]
- [[biblioteca/react]]
