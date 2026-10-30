---
titulo: Subagente
descripcion: Agente al que otro agente encarga una subtarea con su propio contexto limpio y que devuelve solo el resultado.
creado: 2026-09-04
actualizado: 2026-10-29
categoria: agentes
ingles: subagent
aliases: [subagent, agente trabajador, worker]
tags: [agentes, multiagente]
relacionados: ["[[docs/agentes/02-subagentes]]", "[[cursos/sistemas-multiagente/02-disenar-subagentes]]"]
---

Un subagente es un [[glosario/agente]] al que otro agente, el [[glosario/orquestador]], encarga una parte de la tarea. Trabaja con su propia [[glosario/ventana-de-contexto]], sus propias herramientas y su propio bucle, y al terminar devuelve un resumen, no todo lo que ha leído.

## En la práctica

Su gran ventaja es aislar el contexto: un subagente puede leer veinte archivos o diez páginas web y devolver al orquestador solo las cinco líneas que importan, sin llenarle la ventana. También permite trabajar en paralelo. El precio es más tokens en total y el riesgo de perder información en el traspaso, así que el encargo debe decir con precisión qué buscar, en qué formato responder y cuándo parar. Si dos subagentes necesitan coordinarse constantemente, probablemente debería ser un único agente.

En Claude Code se definen como archivos Markdown en `.claude/agents/` (con `name`, `description` y, opcionalmente, `tools` y `model`). En Deep Agents, open source, el agente principal los lanza con su herramienta `task`.

## No confundir con

- **[[glosario/handoff]]**: el control pasa a otro agente, que sigue la conversación. El subagente trabaja aparte y devuelve un resultado a quien lo llamó.

## Ver también

- [[docs/agentes/02-subagentes]]
- [[roadmap/60-multiagente/03-pasar-contexto-entre-agentes]]
- [[cursos/sistemas-multiagente/02-disenar-subagentes]]
- [[radar/2026-07-14-subagentes-para-buscar]]
- [[docs/claude-code/02-subagentes]]
- [[plantillas/subagente]]
