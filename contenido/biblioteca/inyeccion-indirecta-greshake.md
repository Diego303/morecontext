---
titulo: "Not what you've signed up for: inyección indirecta (Greshake et al., 2023)"
descripcion: El paper que mostró que quien controla lo que lee tu aplicación puede controlar tu aplicación, y por qué esa idea es hoy la amenaza principal de cualquier agente con herramientas.
creado: 2026-10-29
tags: [biblioteca, seguridad, inyeccion-de-prompt]
relacionados: ["[[glosario/inyeccion-de-prompt]]", "[[cursos/seguridad-y-prompt-injection/02-inyeccion-directa-e-indirecta]]", "[[docs/seguridad/01-prompt-injection]]", "[[biblioteca/camel]]"]
autores: Greshake et al.
anio: 2023
url: https://arxiv.org/abs/2302.12173
tipo: paper
tema: seguridad
nivel: intermedio
---

*Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection* (Kai Greshake y colaboradores, febrero de 2023) hace una pregunta sencilla que cambió cómo se piensa la seguridad de los LLM: hasta entonces se suponía que quien escribe el prompt es el usuario, pero ¿y si no lo es? El paper puso nombre a la **inyección indirecta** y la demostró contra sistemas reales cuando los asistentes con navegación acababan de llegar al público.

## La idea clave

La [[glosario/inyeccion-de-prompt|inyección de prompt]] directa es la que escribe el propio usuario («ignora tus instrucciones y…»). La indirecta llega por otro camino. **Una aplicación que integra un LLM y le pasa contenido externo difumina la frontera entre datos e instrucciones**, así que un atacante puede colocar instrucciones en cualquier sitio que la aplicación vaya a leer: una página web, un correo, un documento, código. No necesita acceso a tu sistema. Le basta con poner texto donde tu modelo vaya a leerlo.

A partir de ahí, los autores construyen una taxonomía de amenazas desde la seguridad informática clásica, con impactos como el robo de datos, la propagación de un sistema a otro al estilo de un gusano y la contaminación del ecosistema de información que el usuario ve. Su tesis más dura es que **procesar un prompt recuperado equivale a ejecutar código arbitrario**: el texto inyectado puede cambiar lo que hace la aplicación y decidir qué otras APIs se llaman y cómo.

Lo demostraron contra sistemas reales, entre ellos Bing Chat, y contra aplicaciones de prueba construidas sobre GPT-4. Simon Willison [resumió en su momento](https://simonwillison.net/2023/Apr/14/worst-that-can-happen/) la demostración más famosa: una página con texto invisible hacía que Bing Chat, al leerla, adoptara el objetivo oculto de averiguar el nombre del usuario e intentara que pulsara un enlace que lo contenía ofuscado.

## Por qué importa hoy

En 2023 el riesgo afectaba a un asistente con navegador. Hoy cualquier [[glosario/agente|agente]] con herramientas lee contenido que no controlas: resultados de búsqueda, correos, PDFs, issues, fragmentos de RAG, respuestas y descripciones de [[glosario/servidor-mcp|servidores MCP]]. Todo eso es superficie de ataque. La inyección de prompt ocupa el primer puesto del Top 10 de OWASP para aplicaciones con LLM, y la indirecta es la variante que más daño hace en agentes.

Casi todo el marco mental actual sale de esta idea:

- La **[[glosario/trifecta-letal|trifecta letal]]** de Simon Willison (2025): datos privados, contenido no fiable y capacidad de comunicar al exterior. Juntas, permiten robar datos.
- La **[[glosario/regla-de-dos|regla de dos]]** de Meta (2025): en una sesión, como mucho dos de tres capacidades peligrosas.
- Las **defensas por diseño**, como [[biblioteca/camel]] y los [[biblioteca/patrones-contra-inyeccion|seis patrones de Beurer-Kellner et al.]], que asumen que el modelo se puede engañar y limitan lo que el texto inyectado puede conseguir.

> [!peligro] No hay filtro que lo resuelva
> El paper concluía que faltaban mitigaciones eficaces. Desde entonces han aparecido defensas, pero ninguna completa: OpenAI escribió en diciembre de 2025 que la inyección probablemente nunca se resolverá del todo. Diseña asumiendo que un texto malicioso llegará al contexto.

## Qué leer primero

1. **El resumen y la introducción**: la pregunta de partida y el argumento de que datos e instrucciones se mezclan.
2. **La taxonomía de amenazas**: es la parte que más ha perdurado. Te sirve como lista para tu propio modelo de amenazas.
3. **Las demostraciones**: hojéalas para ver lo poco que hace falta para que un ataque funcione.

Si vas con poco tiempo, el resumen y la taxonomía bastan para cambiar cómo diseñas.

## Qué ha envejecido

- **Los sistemas atacados.** Bing Chat de 2023 y las aplicaciones de prueba con GPT-4 ya no existen tal cual, y muchos de los ataques públicos de esa época se cerraron bloqueando la vía de exfiltración concreta.
- **El alcance.** El paper hablaba de «aplicaciones integradas con LLM». Hoy el caso más grave son los agentes con permisos de escritura, acceso a código o a un ordenador, que en 2023 apenas estaban en producción.
- **Lo que no ha envejecido**: la tesis. La propagación de un sistema a otro, que en 2023 sonaba especulativa, hoy resulta más plausible con sistemas multiagente y con servidores y skills de terceros.

## Dónde lo ves en MoreContext

- [[cursos/seguridad-y-prompt-injection/02-inyeccion-directa-e-indirecta]]: los vectores actuales, con ejemplos.
- [[cursos/seguridad-y-prompt-injection/01-modelo-de-amenazas]]: cómo convertir la taxonomía en tu modelo de amenazas.
- [[docs/seguridad/01-prompt-injection]] y [[docs/seguridad/03-patrones-contra-inyeccion]]: la referencia y las defensas por diseño.
- [[docs/seguridad/04-mcp-y-skills-de-terceros]] y [[glosario/envenenamiento-de-herramientas]]: la inyección que llega por herramientas.
- [[radar/2026-10-20-inyeccion-por-herramientas]]: por qué hoy llega sobre todo por lo que el agente lee.
- [[roadmap/100-produccion/04-seguridad-y-prompt-injection]]: la lección del roadmap.
