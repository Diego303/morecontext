---
titulo: Traspaso de sesión
descripcion: Resumen estructurado de lo que no está en disco para continuar el trabajo en una sesión nueva con el contexto limpio, en vez de compactar a ciegas.
creado: 2026-10-29
categoria: contexto
ingles: Session handoff
aliases: [session handoff, prompt de traspaso, context reset, /new-session]
tags: [contexto, sesiones-largas, claude-code]
relacionados: ["[[cursos/harness-engineering/11-sesiones-largas]]", "[[glosario/canario-de-contexto]]", "[[glosario/compactacion]]", "[[problemas/contexto-saturado-en-sesiones-largas]]"]
---

Un traspaso de sesión es cerrar una conversación saturada y abrir otra limpia con un prompt que lleva solo lo necesario para continuar: lo que se decidió, lo que está a medias y el siguiente paso. Todo lo que ya vive en archivos se pasa como ruta, no copiado.

## En la práctica

En el harness del autor lo genera la skill `new-session`, que solo lanza la persona (`/new-session`, normalmente cuando cae el [[glosario/canario-de-contexto]]). Primero lee el estado real (estado de las features, `git status`, últimos commits) y después extrae de la conversación lo que no está en disco, con secciones fijas: objetivo, decisiones tomadas, preferencias, trabajo a medias, hallazgos separados en verificados y sin verificar, lo descartado y su motivo, y el siguiente paso exacto. Lo guarda en `.claude/handoff/`, en unas 80 líneas como máximo, y termina pidiendo a la sesión nueva que compruebe el estado antes de actuar.

Separar lo verificado de lo que no lo está evita que una hipótesis llegue a la sesión nueva como un hecho. Anthropic describe la misma alternativa a compactar, una ventana nueva con un traspaso estructurado, en [*Harness design for long-running application development*](https://www.anthropic.com/engineering/harness-design-long-running-apps) (marzo de 2026).

## No confundir con

- **[[glosario/compactacion]]**: resume dentro de la misma sesión y decide el modelo qué conservar.
- **[[glosario/handoff]]**: pasar el control a otro agente dentro de una misma ejecución.

## Ver también

- [[recetas/reanudar-un-agente-tras-un-reinicio]]
- [[sistemas/agente-de-larga-duracion]]
- [[glosario/memoria]]
