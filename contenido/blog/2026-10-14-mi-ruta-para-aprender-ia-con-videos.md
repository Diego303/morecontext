---
titulo: Mi ruta para aprender IA con vídeos gratuitos
descripcion: Por qué ordené en fases los vídeos gratuitos en español con los que se puede ir de qué es la IA a los agentes, y qué conviene ver a fondo y qué por encima.
creado: 2026-10-14
estado: revision
tipo: nota-de-campo
destacado: false
tags: [aprendizaje, ruta, videos]
relacionados: ["[[cursos/ruta-en-video/index]]", "[[roadmap/index]]", "[[recetas/apuntes-de-video-con-ia]]", "[[paginas/fuentes]]"]
---

En septiembre me senté a ordenar algo que llevaba tiempo haciendo a trozos: aprender IA con vídeos gratuitos. Hay muchísimo material en español y buena parte es bueno. El problema nunca fue encontrar vídeos. Era saber en qué orden verlos, cuáles ver enteros tomando apuntes y cuáles basta con ver una vez para quedarte con la idea. Así nació la ruta que ahora vive en [[cursos/ruta-en-video/index|Ruta en vídeo]].

## Por qué la hice

Quería un camino que fuera desde «¿qué es la IA?» hasta manejar [[glosario/agente|agentes]], [[glosario/mcp|MCP]], [[glosario/skill|skills]] y lo que ahora se llama [[glosario/harness-engineering|harness engineering]], usando casi solo contenido gratuito en español. Cada canal tiene su orden interno, pero nadie te dice cómo encajan entre sí.

Me puse una regla: si un tema no lo cubre ninguno de los divulgadores que sigo, lo digo claramente y doy el término exacto que hay que buscar. Pasó con harness engineering. El término se popularizó a principios de 2026, con un artículo de OpenAI en febrero y otros de LangChain y Birgitta Böckeler en los meses siguientes, y cuando hice la ruta no encontré ningún vídeo de estos canales con ese título. Así que la fase 9 lo dice tal cual, propone qué buscar y señala los vídeos que más se acercan.

## Quién es quién

La ruta se apoya en cuatro canales, y cada uno aporta algo distinto:

| Canal | Qué aporta | Para qué tramo |
|---|---|---|
| DotCSV (Carlos Santana) | Teoría de IA, machine learning y deep learning; el «por qué» técnico | Fundamentos |
| midudev y midulive (Miguel Ángel Durán) | IA aplicada para desarrolladores: LLMs, MCP, Claude Code, skills | De fundamentos a práctica |
| MoureDev (Brais Moure) | Rutas de estudio y cursos de desarrollo con agentes, multiagentes y SDD | Construir |
| BettaTech (Martí Cristóbal) | Criterio de ingeniería: calidad, arquitectura, herramientas deterministas | Afinar |

El orden que recomiendo sale de ahí: fundamentos con DotCSV, fundamentos para developers con midudev, construir con MoureDev y terminar afinando criterio con BettaTech. Lo completo con los cursos de Anthropic Academy sobre MCP y skills, que además te dan un certificado en PDF al terminarlos, y, como extra, los cursos de machine learning de Google.

## Cómo está ordenada

La ruta va de la fase 0 a la 10 (la 3.5 está partida en dos: empresa y RAG) y cierra con el ecosistema de herramientas y con cómo mantenerse al día. En la web son catorce lecciones. Las pienso en cuatro tramos:

1. **Cómo funciona por dentro (fases 0 a 2).** El mapa IA > machine learning > deep learning, las [[glosario/red-neuronal|redes neuronales]] y el salto a los [[glosario/transformer|Transformers]]. Los vídeos de DotCSV de esta parte son antiguos, pero los conceptos no caducan.
2. **El LLM desde el lado del developer (fases 3 y 3.5).** [[glosario/token|Tokens]], contexto, prompting, cómo dar valor a una empresa con un [[glosario/llm|LLM]] y [[glosario/rag|RAG]]. Aquí todo empieza a ser práctico.
3. **Agentes (fases 4 a 8).** Las herramientas de IA para programar, qué es un agente, MCP, skills, multiagentes y Spec-Driven Development.
4. **Arquitectura (fases 9 y 10).** El [[glosario/harness|harness]] y los sistemas y plataformas de agentes.

Una cosa la hice a propósito: dejar que se repitan conceptos. El curso de midudev de la fase 0 ya habla de tokens, herramientas, agentes, MCP y skills, y todo eso vuelve a salir después. No lo quité. Ver lo mismo explicado por otra persona y desde otro ángulo es justo lo que asienta un concepto.

## A fondo o por encima

Esta es la parte que más me importaba. Cada vídeo de la ruta lleva una marca de profundidad, y el criterio es siempre el mismo: ¿vas a usar modelos que ya existen o vas a crear modelos?

Hoy, si te dedicas a usar agentes o a construirlos sobre LLMs que ya están en el mercado, las fases 1 y 2 son secundarias. Está bien saber cómo funciona una red neuronal y por qué los Transformers dieron paso a los LLM, pero basta con verlo por encima. Para mí, por encima quiere decir verlo sin tomar mil apuntes y quedarte con la idea de cómo funciona todo por detrás. Si vas a dedicarte a entrenar modelos, el criterio cambia: vídeos de DotCSV con calma y los cursos de Google, que piden saber Python y TensorFlow. Lo desarrollo en [[blog/2026-10-16-cuanto-saber-de-redes-neuronales]].

Lo que marco para ver a fondo, con apuntes:

- **El curso de introducción de midudev** (fase 0). Es algo más de hora y media de vídeo y te da el mapa actual entero: LLMs, tokens, herramientas, agentes, MCP y skills. Recomiendo hacerlo completo, aunque adelante cosas que se ven más tarde.
- **La fase 3**, porque ahí está la idea que más repito: un LLM genera la respuesta más probable, y la más probable no siempre es la correcta. Le dediqué una entrada: [[blog/2026-10-15-la-respuesta-mas-probable]].
- **Las fases 4 y 5**, que explican qué es un agente y cómo se usa. El curso en directo de tres días de MoureDev sobre programar con agentes es de lo que más recomiendo de toda la ruta: míratelo entero.
- **MCP y skills** (fases 6 y 7), con los cursos de Anthropic Academy.

Y lo que marco como extra: los cursos de Google y el vídeo sobre Stable Diffusion de la fase 2. Útiles si el tema te interesa; prescindibles si tu objetivo son los agentes.

## Cómo la uso

La ruta da contexto, pero no sustituye a escribir código. Por eso cada fase enlaza a las lecciones del [[roadmap/index|roadmap]] donde se practica lo que acabas de ver. Mi recomendación es alternar: ves una fase, tomas apuntes y luego haces la lección que la acompaña.

Los apuntes acaban en mi bóveda de Obsidian, y varias páginas de esta web nacieron de ellos. Para no ver tres veces un vídeo de dos horas, genero un primer borrador de apuntes con un prompt fijo en una herramienta de IA que puede ver el vídeo, y después reviso a mano lo delicado: datos, cifras y lo que es opinión del autor del vídeo. El procedimiento está en [[recetas/apuntes-de-video-con-ia]] y el prompt en [[plantillas/prompt-apuntes-de-video]].

## Antes de empezar

- **Los enlaces caducan.** Los revisé en septiembre de 2026, y midudev y MoureDev actualizan sus cursos gratuitos constantemente. Vale la pena volver a sus páginas de cursos cada mes o dos.
- **No todo está en español.** Algunos cursos, como los de Anthropic, pueden estar en inglés.
- **Está viva.** Hay fases que sigo completando, y la de harness engineering cambiará en cuanto estos canales publiquen sobre el tema.

## Por dónde seguir

- [[cursos/ruta-en-video/index]]: la ruta completa, con el temario comentado.
- [[cursos/ruta-en-video/01-fase-0-que-es-la-ia]]: para empezar hoy mismo.
- [[roadmap/index]]: el recorrido práctico que acompaña a los vídeos.
- [[paginas/fuentes]] y [[blog/2026-10-21-treinta-minutos-al-dia]]: cómo seguir al día cuando termines.

*Borrador inicial: pendiente de reescribir con la voz del autor.*
