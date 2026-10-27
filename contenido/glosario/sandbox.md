---
titulo: Sandbox
descripcion: Entorno aislado donde un agente ejecuta código o controla un ordenador sin poder dañar el sistema real ni acceder a secretos.
creado: 2026-07-02
categoria: seguridad
aliases: [entorno aislado, caja de arena, aislamiento]
tags: [seguridad]
relacionados: ["[[cursos/seguridad-y-prompt-injection/04-permisos-y-sandbox]]", "[[cursos/uso-del-ordenador/04-seguridad-y-aislamiento]]"]
---

Un *sandbox* es un entorno aislado (contenedor, máquina virtual o proceso con permisos recortados) donde un agente puede ejecutar comandos, código o acciones de navegador sin acceso a tu sistema, tus credenciales ni tu red interna. Si algo sale mal, el daño queda dentro y se descarta el entorno.

## En la práctica

Úsalo siempre que el agente ejecute código generado, use [[glosario/uso-del-ordenador]] o procese contenido no fiable. Lo mínimo: sin credenciales de producción dentro, red de salida restringida a una lista de dominios permitidos, sistema de archivos efímero, límites de CPU, memoria y tiempo, y montar solo los directorios necesarios. El sandbox no sustituye al [[glosario/minimo-privilegio]] en las herramientas: los dos se complementan frente a la [[glosario/inyeccion-de-prompt]].

## Ver también

- [[cursos/seguridad-y-prompt-injection/04-permisos-y-sandbox]]
- [[cursos/uso-del-ordenador/04-seguridad-y-aislamiento]]
- [[radar/2026-07-02-uso-del-ordenador-en-sandbox]]
- [[disciplinas/seguridad]]
