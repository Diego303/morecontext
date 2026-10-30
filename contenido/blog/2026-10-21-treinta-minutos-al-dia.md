---
titulo: Treinta minutos al día
descripcion: El hábito con el que me mantengo al día en IA, media hora diaria con pocas fuentes buenas, y el filtro del radar para separar lo que cambia cómo construyes del ruido.
creado: 2026-10-21
estado: revision
tipo: nota-de-campo
destacado: false
tags: [aprendizaje, fuentes, habitos]
relacionados: ["[[paginas/fuentes]]", "[[radar/index]]", "[[cursos/ruta-en-video/14-ecosistema-y-estar-al-dia]]", "[[roadmap/00-fundamentos/07-empresa-modelo-herramienta]]"]
---

La IA cambia cada semana. Salen modelos, herramientas, técnicas y protocolos, y una parte de lo que aprendiste hace seis meses hay que revisarlo. Si de verdad quieres estar metido en este mundo, le tienes que dedicar lo más valioso que tienes: tiempo.

Mi forma de hacerlo es sencilla. Cada día de trabajo dedico entre treinta minutos y una hora a mirar, investigar y buscar si hay algo nuevo: técnicas, herramientas, modelos. Lo cuento como parte del trabajo, porque es lo que evita que el resto se quede viejo. Saber que existe algo nuevo es útil aunque no lo uses todavía: cuando llegue el día de necesitarlo, sabrás por dónde empezar a aprenderlo.

## Por qué a diario

Prefiero media hora cada día a una tarde al mes, por dos motivos. El primero es el volumen: en un mes se acumula tanto que acabas leyendo titulares. El segundo es que el criterio se entrena con la repetición. Cuando miras novedades cada día, empiezas a reconocer qué es un cambio de verdad y qué es la misma idea con otro nombre.

Hay un tercer motivo más práctico: en este campo los términos aparecen de golpe. «Harness engineering» se popularizó a principios de 2026, con un artículo de OpenAI en febrero y otros de LangChain y Birgitta Böckeler en los meses siguientes, aunque Anthropic ya hablaba de *harness* desde finales de 2025. Cuando hice mi ruta en vídeo, no encontré en ninguno de los divulgadores que sigo un vídeo con ese título. Ese tipo de cosas se detectan mirando un poco cada día, y se pierden con un repaso de vez en cuando.

## Qué miro

Pocas fuentes, y que conozco bien. Las principales son tres:

- **La Inteligencia Artificial**, un canal de YouTube que publica cada semana sobre lo que pasa en IA: herramientas nuevas, sucesos, temas de gobierno. Es el que tengo en la rutina diaria.
- **BettaTech**, por el criterio de ingeniería. Además de sus vídeos tiene el podcast *TheCommitShow* y Commit Academy, con entrevistas y perspectivas de ingeniería.
- **midudev**, que en sus directos de midulive prueba herramientas nuevas en tiempo real.

Y como apoyo:

- **MoureDev**, con directos larguísimos programando, muchos ya con agentes de por medio.
- **DotCSV**, con directos en los que analiza noticias, papers y lanzamientos de modelos.
- Noticias sueltas y, sobre todo, fuentes primarias: la documentación y los blogs de ingeniería de los proveedores y especificaciones como la de [[glosario/mcp|MCP]]. Las tengo recogidas en [[paginas/fuentes]].

Un aviso práctico: midudev y MoureDev actualizan sus cursos gratuitos constantemente, así que merece la pena volver a sus páginas de cursos cada mes o dos.

## El filtro

Media hora diaria da para mucho, y también para mucho ruido. El filtro que aplico es el mismo que usamos para el [[radar/index|radar]] de esta web. Algo merece mi atención si cumple tres condiciones:

1. **Cambia una decisión.** Después de leerlo, haría algo distinto en mi código, en mi arquitectura o en cómo evalúo.
2. **Está confirmado.** Hay documentación oficial, una especificación, un artículo publicado o una práctica extendida que se puede comprobar.
3. **Se puede explicar en pocas líneas**, con su consecuencia práctica.

Y fuera, sin pensarlo mucho: rumores, filtraciones, anuncios sin fecha, rondas de financiación y comparativas de benchmarks sin método.

Antes de aplicar el filtro hago una cosa más básica: ponerle nombre a lo que estoy leyendo. ¿Es una empresa, un modelo, un concepto o una herramienta? Parece obvio, pero mucha confusión viene de mezclarlos. Están la empresa que crea los modelos (OpenAI, Anthropic), el modelo (Claude Sonnet, Claude Opus), los conceptos de los LLM (tokens, contexto) y las herramientas que usan esos modelos para resolver tareas como agentes (Codex, Claude Code, Claude Cowork). Un modelo nuevo con un nombre llamativo y una herramienta nueva piden reacciones distintas. Lo explico en [[roadmap/00-fundamentos/07-empresa-modelo-herramienta]].

## Qué hacer con lo que pasa el filtro

Lo que pasa el filtro admite tres respuestas, y conviene elegir una en el momento para que la media hora no se convierta en una lista infinita de pendientes:

- **Probarlo.** Si cambia algo que estás construyendo ahora, busca la documentación y haz una prueba pequeña.
- **Apuntarlo.** Si es relevante pero no para el trabajo de esta semana, déjalo anotado con su fuente.
- **Dejarlo pasar.** Será la mayoría, y está bien: estar al día no significa probarlo todo.

Los vídeos largos que sí merecen apuntes los convierto en notas para mi bóveda con el procedimiento de [[recetas/apuntes-de-video-con-ia]].

## La historia también filtra

Hay un filtro que no se ve: conocer la historia. Las fases 0 a 2 de mi ruta, la parte más histórica, te dan criterio para leer noticias de IA sin que te vendan humo. Cuando sabes cómo se pasó de redes neuronales dedicadas a una tarea a los Transformers, y de ahí a los LLM, distingues mejor un salto de verdad de una mejora incremental con buen marketing. Lo cuento en [[blog/2026-10-16-cuanto-saber-de-redes-neuronales]].

## Para seguir

- [[paginas/fuentes]]: las fuentes primarias y los divulgadores, con cómo leer una novedad sin humo.
- [[cursos/ruta-en-video/14-ecosistema-y-estar-al-dia]]: la lección de la ruta sobre el ecosistema y los directos.
- [[radar/index]]: lo que pasa el filtro, explicado en qué es, qué cambia y qué hacer.
- [[blog/2026-10-14-mi-ruta-para-aprender-ia-con-videos]]: por dónde empezar si todavía no tienes la base.

*Borrador inicial: pendiente de reescribir con la voz del autor.*
