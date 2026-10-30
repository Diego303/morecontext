---
titulo: Effective harnesses for long-running agents (Anthropic, 2025)
descripcion: El patrón de agente inicializador más agente de código para trabajar durante muchas ventanas de contexto, con lista de funcionalidades, progreso en archivo y git como memoria.
creado: 2026-10-29
tags: [biblioteca, agentes, harness, larga-duracion]
relacionados: ["[[patrones/10-inicializador-y-agente-de-trabajo]]", "[[sistemas/agente-de-larga-duracion]]", "[[cursos/harness-engineering/11-sesiones-largas]]", "[[glosario/harness]]"]
autores: Justin Young (Anthropic)
anio: 2025
url: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
tipo: ensayo
tema: agentes
nivel: intermedio
---

*Effective harnesses for long-running agents* (Justin Young, Anthropic, 26 de noviembre de 2025) cuenta cómo consiguieron que un agente avanzara de forma constante en un proyecto que no cabe en una ventana de contexto: construir un clon de una aplicación web de chat a partir de una petición de alto nivel. Es uno de los primeros textos que usa «harness» en el sentido actual y el origen del patrón [[patrones/10-inicializador-y-agente-de-trabajo|inicializador y agente de trabajo]].

## La idea clave

El problema de partida es que cada sesión empieza sin memoria de las anteriores, como ingenieros que trabajan por turnos sin traspaso. La [[glosario/compactacion|compactación]] ayuda, pero el texto lo dice claro: «compaction isn't sufficient». Con solo un modelo en bucle aparecían dos fallos:

1. **Querer hacerlo todo de golpe.** El agente intentaba construir la aplicación entera, se quedaba sin contexto a mitad y dejaba una funcionalidad a medias y sin documentar.
2. **Dar el trabajo por terminado antes de tiempo.** Una sesión posterior veía progreso y declaraba el proyecto acabado.

**La solución son dos agentes con el mismo prompt de sistema, las mismas herramientas y el mismo harness, que solo se diferencian en el primer mensaje.** El inicializador prepara el entorno una vez: un `init.sh` que arranca el servidor de desarrollo, un registro `claude-progress.txt`, una lista de funcionalidades y un primer commit. El agente de código trabaja en las sesiones siguientes, una funcionalidad cada vez, y termina con un commit descriptivo y una nota de progreso.

La lista de funcionalidades es la pieza que más se copia. En el ejemplo del artículo tenía más de 200 entradas, todas fallando al principio, con cuatro campos. Adaptado:

```json title="feature_list.json"
[
  {
    "category": "functional",
    "description": "El usuario abre un chat nuevo, escribe una pregunta, pulsa Intro y ve una respuesta",
    "steps": ["Abrir la aplicación", "Pulsar «Nuevo chat»", "Escribir una pregunta y pulsar Intro", "Comprobar que aparece la respuesta"],
    "passes": false
  }
]
```

El agente de código solo puede cambiar `passes`, y el prompt insiste en que es inaceptable borrar o editar pruebas. Eligieron JSON porque el modelo tiende menos a reescribirlo indebidamente que un Markdown.

Cada sesión empieza con la misma rutina: `pwd`, leer el log de git y el progreso, elegir la funcionalidad pendiente de más prioridad, ejecutar `init.sh` y una prueba extremo a extremo básica antes de tocar nada. Esa prueba inicial detecta lo que la sesión anterior dejó roto.

## Por qué importa hoy

Es una receta mínima y probada para agentes que trabajan horas. Se apoya en tres principios que verás repetidos en harnesses posteriores:

- **El estado vive fuera de la ventana**, en archivos y en git. La siguiente sesión lo reconstruye leyendo.
- **«Hecho» lo decide una prueba.** El texto define «estado limpio» como código que podrías fusionar en la rama principal sin limpieza previa.
- **Una unidad de trabajo por sesión**, con commit, para poder volver atrás.

El hallazgo sobre las pruebas es igual de práctico. Por defecto, Claude probaba con tests unitarios o `curl` y no veía que la funcionalidad fallaba de punta a punta. Pedirle que usara automatización de navegador (Puppeteer MCP) y probara como un usuario mejoró mucho los resultados.

> [!consejo] La versión de bolsillo
> Si solo copias una cosa, copia la lista de criterios en JSON donde el agente solo puede marcar `passes`. Convierte «creo que ya está» en algo que se comprueba.

## Qué leer primero

Léelo entero; es corto. Lo esencial:

1. **«The long-running agent problem»**: los dos fallos.
2. **«Environment management»**: lista de funcionalidades, progreso incremental y pruebas.
3. **La tabla de modos de fallo**: cada problema con lo que hace el inicializador y lo que hace el agente de código. Sirve como lista de comprobación.

## Qué ha envejecido

Poco, pero conviene saber tres cosas:

- **El caso es una aplicación web completa.** Los autores sugieren que puede servir para investigación o modelado financiero, sin demostrarlo.
- **Dejan abierta la pregunta multiagente**: si es mejor un agente general o varios especializados (pruebas, QA, limpieza). Anthropic dio un paso más en marzo de 2026 con planificador, generador y evaluador, que ves en [[patrones/11-planificador-generador-evaluador]].
- **Las limitaciones de las herramientas concretas.** Por ejemplo, el agente no veía los diálogos nativos del navegador a través de Puppeteer MCP. Detalles así cambian con cada versión.

## Dónde lo ves en MoreContext

- [[patrones/10-inicializador-y-agente-de-trabajo]]: el patrón con su esqueleto de código.
- [[sistemas/agente-de-larga-duracion]]: el sistema completo para trabajar horas sobre un repositorio.
- [[cursos/harness-engineering/11-sesiones-largas]] y [[glosario/traspaso-de-sesion]]: el traspaso entre sesiones en un harness real.
- [[roadmap/90-harness/04-estado-coste-y-contexto]]: dónde guardar el estado.
- [[cursos/context-engineering/04-contexto-para-agentes-largos]]: el lado del contexto.
- [[disciplinas/verificar-antes-de-dar-por-hecho]] y [[recetas/criterios-de-aceptacion-ejecutables]]: que «hecho» lo decida una prueba.
- [[patrones/12-bucle-ralph]]: otra forma de encadenar sesiones con contexto limpio.
