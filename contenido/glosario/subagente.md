---
titulo: Subagente
descripcion: Agente al que otro agente encarga una subtarea con su propio contexto limpio y que devuelve solo el resultado.
creado: 2026-09-04
categoria: agentes
ingles: subagent
aliases: [subagent, agente trabajador, worker]
tags: [agentes, multiagente]
relacionados: ["[[docs/agentes/02-subagentes]]", "[[cursos/sistemas-multiagente/02-disenar-subagentes]]"]
---

Un subagente es un [[glosario/agente]] al que otro agente, el [[glosario/orquestador]], encarga una parte de la tarea. Trabaja con su propia [[glosario/ventana-de-contexto]], sus propias herramientas y su propio bucle, y al terminar devuelve un resumen, no todo lo que ha leído.

## En la práctica

Su gran ventaja es aislar el contexto: un subagente puede leer veinte archivos o diez páginas web y devolver al orquestador solo las cinco líneas que importan, sin llenarle la ventana. También permite trabajar en paralelo. El precio es más tokens en total y el riesgo de perder información en el traspaso, así que el encargo debe decir con precisión qué buscar, en qué formato responder y cuándo parar. Si dos subagentes necesitan coordinarse constantemente, probablemente debería ser un único agente.

## Ver también

- [[docs/agentes/02-subagentes]]
- [[roadmap/60-multiagente/03-pasar-contexto-entre-agentes]]
- [[cursos/sistemas-multiagente/02-disenar-subagentes]]
- [[radar/2026-07-14-subagentes-para-buscar]]
