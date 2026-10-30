---
titulo: Uso del ordenador
descripcion: Herramienta que permite al modelo ver capturas de pantalla y manejar ratón y teclado para operar interfaces gráficas.
creado: 2026-07-02
actualizado: 2026-10-29
categoria: herramientas
ingles: computer use
aliases: [computer use, control del ordenador, agente de escritorio]
tags: [herramientas, seguridad]
relacionados: ["[[docs/herramientas/04-uso-del-ordenador]]", "[[cursos/uso-del-ordenador/index]]"]
---

El uso del ordenador es una herramienta con la que el modelo opera un escritorio como lo haría una persona: recibe capturas de pantalla, decide dónde hacer clic o qué teclear y tu código ejecuta esas acciones. Sirve para automatizar aplicaciones que no tienen API.

## En la práctica

Funciona como cualquier [[glosario/tool-use]]: el modelo pide una acción (captura, clic en unas coordenadas, escribir texto), tu entorno la ejecuta y devuelve el resultado, normalmente una nueva captura. En la API de Claude es hoy un [[glosario/toolset]] versionado de cliente (hay otro para el navegador): una sola entrada en `tools` que agrupa varias acciones. Consulta en la documentación oficial el nombre y la versión vigentes. Es más lento y frágil que una API, así que úsalo cuando no haya alternativa. Ejecútalo siempre en una máquina virtual o un contenedor aislado ([[glosario/sandbox]]), sin credenciales sensibles: cualquier web que vea puede intentar una [[glosario/inyeccion-de-prompt]], y en navegadores ese problema no está resuelto.

## Ver también

- [[docs/herramientas/04-uso-del-ordenador]]
- [[cursos/uso-del-ordenador/01-como-funciona]]
- [[cursos/uso-del-ordenador/02-navegador-o-api]]
- [[radar/2026-07-02-uso-del-ordenador-en-sandbox]]
