---
titulo: LLM
descripcion: Modelo de lenguaje grande, una red neuronal entrenada con mucho texto que genera texto prediciendo el siguiente token.
creado: 2026-07-01
actualizado: 2026-10-29
categoria: fundamentos
ingles: Large Language Model
aliases: [Large Language Model, modelo de lenguaje grande, gran modelo de lenguaje, modelo de lenguaje]
tags: [fundamentos]
relacionados: ["[[roadmap/00-fundamentos/01-que-es-un-llm]]", "[[glosario/transformer]]"]
---

Un LLM (*Large Language Model*) es una [[glosario/red-neuronal]], casi siempre un [[glosario/transformer]], entrenada con enormes cantidades de texto para predecir el siguiente [[glosario/token]]. Generando un token tras otro produce respuestas, código o JSON. Después del [[glosario/preentrenamiento]] se ajusta para seguir instrucciones y conversar, por ejemplo con [[glosario/rlhf|RLHF]].

## En la práctica

Trátalo como una función sin estado: recibe un contexto y devuelve texto. No recuerda conversaciones anteriores (le reenvías el historial en cada llamada), no consulta internet salvo que le des herramientas y su conocimiento tiene una fecha de corte. Su salida es probabilística, así que puede variar entre ejecuciones y puede [[glosario/alucinacion|alucinar]]. Por eso se combina con herramientas, recuperación de datos y validación en código. Unos se usan solo por API (Claude, por ejemplo) y otros publican sus [[glosario/pesos-abiertos]], que puedes ejecutar en tu máquina.

## No confundir con

- **[[glosario/agente|Agente]]**: un sistema construido alrededor de un LLM que actúa en un bucle con herramientas.
- **Chatbot**: una interfaz de conversación; el LLM es el motor que hay detrás.

## Ver también

- [[roadmap/00-fundamentos/01-que-es-un-llm]]
- [[roadmap/00-fundamentos/04-primera-llamada-api]]
- [[docs/fundamentos/03-api-de-mensajes]]
- [[glosario/ventana-de-contexto]]
- [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]
