---
titulo: MRTR
descripcion: El mecanismo de MCP 2026-07-28 para que un servidor pida datos al usuario sin sesión, devolviendo input_required y esperando un reintento.
creado: 2026-10-29
categoria: herramientas
ingles: Multi Round-Trip Requests
aliases: [Multi Round-Trip Requests, input_required, peticiones de varias vueltas]
tags: [mcp, estandares, herramientas]
relacionados: ["[[docs/estandares/01-mcp-2026-07-28]]", "[[glosario/mcp]]", "[[radar/2026-10-25-mcp-sin-estado]]"]
---

MRTR (*Multi Round-Trip Requests*) es cómo un [[glosario/servidor-mcp]] pide información que le falta en la revisión `2026-07-28` de [[glosario/mcp]], que es sin estado. En lugar de abrir él una petición hacia el cliente, responde con `resultType: "input_required"` y una lista `inputRequests`. El cliente obtiene esos datos (por ejemplo, preguntando al usuario) y **repite la petición original** añadiendo `inputResponses`.

## En la práctica

Sustituye a las peticiones que antes iniciaba el servidor: *elicitation*, *sampling* y *roots*. Como no hay sesión de protocolo, el servidor no puede dejar una petición abierta esperando: todo lo que necesita para continuar viaja en el reintento, y si tiene estado propio lo guarda en *handles* que el modelo pasa como argumentos. Desde esta revisión todos los resultados llevan `resultType`, así que tu cliente debe comprobarlo siempre antes de leer el contenido. Un caso típico: una herramienta `borrar_proyecto` que devuelve `input_required` para pedir confirmación antes de actuar.

## No confundir con

- **El estado `input_required` de Tasks**: la extensión de tareas largas lo usa para pausar una tarea en curso; MRTR trabaja petición a petición.

## Ver también

- [[docs/estandares/01-mcp-2026-07-28]]
- [[recetas/servidor-mcp-sin-estado-con-handles]]
- [[radar/2026-10-25-mcp-sin-estado]]
- [[glosario/humano-en-el-bucle]]
