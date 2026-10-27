---
titulo: Compactación
descripcion: Resumir o recortar el historial de una conversación larga para liberar ventana de contexto sin perder lo importante.
creado: 2026-08-22
categoria: contexto
ingles: compaction
aliases: [compaction, compactación del contexto, resumen del historial]
tags: [contexto, agentes]
relacionados: ["[[cursos/context-engineering/03-compactacion-y-memoria]]", "[[cursos/context-engineering/04-contexto-para-agentes-largos]]"]
---

La compactación es sustituir una parte del historial de una conversación o de un agente por una versión más corta, normalmente un resumen generado por el propio modelo, cuando la [[glosario/ventana-de-contexto]] se acerca a su límite. Permite que un agente siga trabajando durante horas sin arrastrar cada resultado intermedio.

## En la práctica

Decide qué conservar literal y qué resumir. Suele merecer la pena conservar el objetivo, las decisiones tomadas, los errores ya descartados, los archivos tocados y el siguiente paso; los resultados de herramientas antiguos se pueden resumir o eliminar. Una variante barata es borrar solo los [[glosario/tool-result|resultados de herramientas]] viejos y dejar el resto. Combínala con [[glosario/memoria]] externa: lo que el agente escribe en un archivo de notas sobrevive a cualquier compactación. Evalúa si el agente sigue haciendo bien la tarea tras compactar.

## No confundir con

- **Truncar**: cortar los mensajes más antiguos sin resumir. Más simple, pero pierde información.

## Ver también

- [[cursos/context-engineering/03-compactacion-y-memoria]]
- [[cursos/context-engineering/04-contexto-para-agentes-largos]]
- [[radar/2026-07-28-agentes-de-larga-duracion]]
- [[disciplinas/context-engineering]]
