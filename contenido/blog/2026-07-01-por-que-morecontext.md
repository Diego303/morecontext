---
titulo: Por qué MoreContext
descripcion: El texto de lanzamiento de MoreContext, qué hueco intenta cubrir, para quién está pensada la web y qué no va a ser nunca.
creado: 2026-07-01
actualizado: 2026-10-29
estado: revision
tipo: ensayo
tags: [morecontext, lanzamiento]
relacionados: ["[[paginas/manifiesto]]", "[[paginas/empieza-aqui]]", "[[roadmap/index]]", "[[paginas/sobre]]"]
---

Hoy abro MoreContext: una referencia abierta y gratuita, en español, para entender y construir agentes de IA. El eslogan es «Más contexto, menos ruido», y en este primer texto quiero explicar qué significa, por qué creo que hacía falta, a quién intenta servir y, sobre todo, qué no va a ser.

## El hueco

Hay mucho escrito sobre modelos de lenguaje y agentes. El problema, tal como yo lo veo, está en tres sitios.

El primero es el **ruido**. Buena parte de lo que se publica habla de anuncios, comparativas de una semana y promesas. Para quien tiene que construir algo, eso sirve de poco. Lo que necesita es entender cómo funciona el [[glosario/bucle-agentico|bucle de un agente]], cómo se define una herramienta, cómo se mide si un cambio mejora o empeora el sistema.

El segundo es la **dispersión**. Las piezas buenas existen, pero están repartidas: un artículo de ingeniería por aquí, la documentación de un proveedor por allá, un paper que lo explica todo con notación que espanta. Falta un recorrido que las ordene de lo simple a lo complejo.

El tercero es el **idioma**. Casi todo el material de calidad está en inglés. Muchos desarrolladores leen inglés técnico sin problema, pero aprender un tema nuevo en tu idioma es más rápido y deja menos huecos. Y hay una parte del público, en producto o gestión, para la que el idioma sí es una barrera.

MoreContext intenta cubrir esos tres huecos a la vez: contenido sin humo, ordenado y en español.

## Qué hay dentro

La web está organizada como un segundo cerebro, con muchas piezas pequeñas enlazadas entre sí:

- El [[roadmap/index|Roadmap 0→100]], un recorrido por niveles desde qué es un [[glosario/llm|LLM]] hasta poner un agente en producción, con un proyecto por nivel.
- [[cursos/index|Cursos]] monográficos sobre temas concretos: RAG, MCP, evals, seguridad, agentes de código.
- [[docs/index|Documentación]] de referencia, para consultar cuando ya sabes qué buscas.
- [[patrones/index|Patrones]] de agentes y [[sistemas/index|sistemas]] completos con su arquitectura.
- [[recetas/index|Recetas]] cortas para problemas concretos.
- Un [[glosario/index|glosario]] con un término por página.
- El [[radar/index|Radar]], que recoge solo lo que cambia cómo construyes, y este blog.

Los ejemplos de código usan la API de Mensajes de Anthropic como implementación de referencia, porque hace falta elegir una para que el código sea ejecutable. Los conceptos están explicados para que sirvan con cualquier proveedor.

> [!nota] Actualización (oct. 2026)
> Desde octubre, después del código con el SDK de Anthropic muchas páginas enseñan el mismo caso con piezas abiertas: el curso [[cursos/langchain-y-langgraph/index]], [[cursos/agentes-con-modelos-abiertos/index|agentes con modelos abiertos]] y la referencia [[docs/frameworks/index]]. También hay secciones nuevas: [[plantillas/index|plantillas]], [[herramientas/index|herramientas]], [[biblioteca/index|biblioteca]], [[problemas/index|problemas frecuentes]] y una [[cursos/ruta-en-video/index|ruta en vídeo]] para quien prefiere aprender así.

## A quién sirve

Pienso en cuatro perfiles, y [[paginas/empieza-aqui]] tiene una ruta para cada uno:

- **Quien nunca ha usado una API de un modelo.** Programa, pero no ha hecho su primera llamada. El nivel [[roadmap/00-fundamentos/index|Fundamentos]] está pensado para empezar desde ahí.
- **Quien ya usa modelos y quiere construir agentes.** Ha escrito prompts y quizá algo de [[glosario/rag|RAG]], y quiere dar el salto a sistemas que usan herramientas y deciden pasos.
- **Quien tiene que llevar algo a producción.** Le preocupan los costes, la latencia, la seguridad y saber si el sistema funciona. Para eso están [[roadmap/80-evals/index|Evals]] y [[roadmap/100-produccion/index|Producción]].
- **Quien decide sin programar.** Producto, gestión, dirección técnica. Necesita criterio para saber cuándo un agente tiene sentido y cuándo basta algo más simple. El ensayo [[blog/2026-10-12-tu-primer-agente-deberia-ser-un-workflow]] va en esa línea.

## Qué no será

Esta es la parte que más me importa dejar escrita, porque es la que más fácil se olvida con el tiempo.

**No será un medio de noticias.** No voy a cubrir cada lanzamiento ni a especular sobre rumores. El radar solo recoge cambios que alteran la forma de construir, y cada entrada dice qué hacer con ellos.

**No tendrá cifras sin fuente.** Si una página da un dato, tiene que poder comprobarse. Cuando algo cambia rápido, como nombres de modelos, precios o límites, la web explica el concepto y remite a la documentación oficial, en lugar de copiar números que caducan.

**No venderá promesas.** Nada de «multiplica tu productividad» ni de agentes que lo hacen todo solos. Los agentes son útiles en ciertos problemas y una mala idea en otros, y la web intenta ayudarte a distinguirlos.

**No será cerrada.** El contenido es abierto y gratuito, se puede leer, copiar y adaptar según su [[paginas/licencia|licencia]], y cualquiera puede proponer correcciones. Cómo hacerlo está en [[paginas/contribuir]].

**No esconderá cómo se financia.** Hoy no tiene patrocinadores. Si algún día los tiene, se dirá con claridad. El [[paginas/manifiesto]] recoge este y los demás compromisos.

## Cómo está hecha

Cada página es un archivo de texto en markdown dentro de un repositorio. La misma carpeta se abre como bóveda de notas y se publica como web. Esto tiene una consecuencia práctica que me gusta: corregir un error es editar un archivo y proponer el cambio. La web se valida automáticamente para que no haya enlaces rotos, de modo que la red de enlaces entre páginas, que es buena parte del valor, se mantiene sana. Más detalles en [[paginas/sobre]].

## Una petición

Todo contenido técnico tiene errores, y este también los tendrá. Si encuentras uno, una explicación confusa o un ejemplo que no funciona, dímelo. Es la forma más útil de ayudar a que esto mejore. Y si no sabes por dónde empezar, empieza por [[paginas/empieza-aqui]].

*Borrador inicial: pendiente de reescribir con la voz del autor.*
