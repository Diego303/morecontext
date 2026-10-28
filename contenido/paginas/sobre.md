---
titulo: Sobre MoreContext
descripcion: Qué es MoreContext, quién lo escribe, cómo está hecho por dentro, cómo contactar y con qué licencias se publica.
creado: 2026-07-01
tags: [proyecto]
relacionados: ["[[paginas/manifiesto]]", "[[paginas/contribuir]]", "[[paginas/licencia]]"]
---

MoreContext es una referencia abierta y gratuita, en español, para entender y construir agentes de IA. Va desde qué es un [[glosario/token|token]] hasta cómo poner en producción un sistema con varios agentes, con código que puedes ejecutar.

## Qué hay

- Un [[roadmap/index|roadmap]] de ocho niveles, del 0 al 100, con lecciones y un proyecto por nivel.
- [[cursos/index|Cursos]] cortos sobre temas concretos: RAG, MCP, evals, seguridad, agentes de código.
- [[docs/index|Documentación]] de referencia por temas.
- Una [[modelos/index|guía de modelos]] para escribir prompts y contexto que funcionen.
- [[sistemas/index|Sistemas]] completos, [[patrones/index|patrones]], [[disciplinas/index|disciplinas]] y [[recetas/index|recetas]].
- Un [[glosario/index|glosario]] que enlaza todo lo anterior.
- El [[radar/index|radar]], el [[blog/index|blog]] y el [[boletin/index|boletín]] para lo que cambia.

Si es tu primera visita, ve a [[paginas/empieza-aqui]].

## Quién escribe

MoreContext lo escribe y lo mantiene [Diego](https://diego303.github.io/Portfolio/). Las correcciones y aportaciones de otras personas se reconocen en el historial del repositorio.

Los textos del blog son opinión del autor y van firmados. El resto del contenido intenta ser referencia: cuando algo es opinión, se dice.

## Cómo está hecho

- **Markdown.** Cada página es un archivo `.md` con un bloque de frontmatter. La ruta del archivo decide la URL.
- **Obsidian.** La carpeta de contenido se abre como bóveda de Obsidian, así que el sitio también funciona como segundo cerebro con enlaces entre notas.
- **Astro.** Genera la web estática a partir de esos archivos y comprueba que no haya enlaces rotos.
- **GitHub Pages.** Aloja la web. Cada cambio aprobado en el repositorio se publica con GitHub Actions.

No hay base de datos ni cuentas de usuario. El progreso que marcas en las lecciones se queda en tu navegador.

## Contacto

- Errores y propuestas: abre una incidencia en el repositorio (ver [[paginas/contribuir]]).
- Otras consultas: [tu correo de contacto].

## Licencias

Contenido con licencia CC BY-SA 4.0, código con licencia MIT; la marca y el icono no se licencian. Más detalles en [[paginas/licencia]].
