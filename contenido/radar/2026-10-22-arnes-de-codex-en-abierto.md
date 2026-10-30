---
titulo: El arnés de Codex se publica en abierto
descripcion: OpenAI publica como open source la capa que ejecuta Codex (CLI, app-server y SDK) para que construyas agentes sobre un arnés de producción en lugar de escribir el tuyo.
creado: 2026-10-22
categoria: herramientas
tags: [harness, codex, open-source, agentes-de-codigo]
fuente:
  titulo: "OpenAI Developers, 19 ago. 2026 · Codex as a platform: build on the open agent harness"
  url: https://developers.openai.com/blog/codex-as-a-platform
relacionados: ["[[glosario/harness]]", "[[radar/2026-10-22-harness-engineering]]", "[[docs/frameworks/01-elegir-framework]]", "[[radar/2026-10-29-harness-alojado-managed-agents]]"]
---

## Qué es

El 19 de agosto de 2026, OpenAI (Nicolas Bonamy y Derrick Choi) explicó cómo usar Codex como plataforma. Define el [[glosario/harness|arnés]] como el sistema de ejecución que rodea al modelo: estado de la conversación, streaming, uso de herramientas, políticas de sandbox y aprobación, y continuidad del trabajo entre turnos. Ese arnés es el que mueve todas sus superficies, y publican en abierto sus componentes: el CLI, el app-server y el SDK oficial, en el repositorio `openai/codex` (con licencia Apache-2.0; compruébala en su `LICENSE` antes de reutilizar código). El acceso a los modelos y los servicios gestionados quedan fuera.

## Qué cambia en la práctica

- Hay tres puntos de integración según el caso: `codex exec` para scripts, CI y tareas de fondo con salida estructurada; el SDK para código que lanza, reanuda o sigue tareas; y el app-server cuando el agente forma parte de tu producto (conversaciones persistentes, eventos, interrupciones y peticiones de aprobación).
- La recomendación de OpenAI es empezar por su arnés y decidir qué debe poseer tu aplicación: dónde corre el agente, a qué accede, qué acciones necesitan aprobación. Tus sistemas se exponen como servicios MCP propios.
- El código es abierto, pero el acceso a los modelos y los servicios gestionados quedan fuera: míralo antes de elegir proveedor. El CLI también puede apuntar a modelos locales con `--oss` ([[docs/modelos-abiertos/01-ollama]]).

## Qué hacer

1. Antes de escribir tu propio bucle, compara construir, adoptar un arnés abierto o alquilar uno alojado ([[radar/2026-10-29-harness-alojado-managed-agents]]).
2. Si lo adoptas, define fuera del agente los límites: sandbox, permisos y aprobaciones humanas sobre las escrituras con consecuencias.
3. Para entender qué hace un arnés por dentro, lee [[roadmap/90-harness/02-las-piezas-de-un-harness]].
