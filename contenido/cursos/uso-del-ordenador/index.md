---
titulo: Uso del ordenador y del navegador
descripcion: Agentes que manejan una pantalla o un navegador. Cómo funcionan, cuándo usarlos en lugar de una API, cómo hacerlos fiables y cómo aislarlos.
creado: 2026-10-14
orden: 8
nivel: avanzado
horas: 4
objetivo: Construir un agente que opera un navegador o un escritorio dentro de un entorno aislado, verificando cada acción y limitando lo que puede hacer, y saber cuándo una API es mejor opción.
requiere: ["[[roadmap/40-primer-agente/index]]", "[[roadmap/100-produccion/index]]"]
relacionados: ["[[docs/herramientas/04-uso-del-ordenador]]", "[[glosario/uso-del-ordenador]]", "[[radar/2026-07-02-uso-del-ordenador-en-sandbox]]", "[[cursos/seguridad-y-prompt-injection/index]]"]
tags: [uso-del-ordenador, navegador, seguridad, agentes]
---

El [[glosario/uso-del-ordenador|uso del ordenador]] permite a un modelo ver una pantalla mediante capturas y actuar con ratón y teclado. La automatización del navegador hace algo parecido sobre páginas web, a menudo leyendo la estructura de la página en lugar de píxeles. Las dos sirven para lo mismo: trabajar con aplicaciones que no tienen API o cuya API no puedes usar.

También son las herramientas más lentas, caras y arriesgadas que puedes darle a un agente. Este curso enseña a usarlas cuando toca, a hacerlas fiables y a aislarlas para que un error o una página maliciosa no tengan consecuencias.

## Para quién

Para quien necesita automatizar tareas en aplicaciones heredadas, paneles internos o webs sin API, y para quien evalúa si un agente de este tipo tiene sentido en su caso. Es un curso avanzado: das por sabido el bucle agéntico y las bases de seguridad.

## Requisitos

- Nivel [[roadmap/40-primer-agente/index]] completo.
- [[roadmap/100-produccion/04-seguridad-y-prompt-injection]] y, muy recomendable, [[cursos/seguridad-y-prompt-injection/index]].
- Docker (o una máquina virtual) y Python 3.10+. Para el navegador, Playwright.

## Temario

1. [[cursos/uso-del-ordenador/01-como-funciona]]. El bucle captura → acción → captura, qué hace el proveedor y qué haces tú, y un ejecutor mínimo de acciones dentro de un contenedor.
2. [[cursos/uso-del-ordenador/02-navegador-o-api]]. La escalera de opciones: API, servidor MCP, navegador por DOM y, al final, píxeles. Criterios para elegir.
3. [[cursos/uso-del-ordenador/03-fiabilidad]]. Verificar después de cada acción, esperar a condiciones en lugar de a tiempos, reintentar con límites y detectar bucles.
4. [[cursos/uso-del-ordenador/04-seguridad-y-aislamiento]]. Contenedor desechable, red restringida, cuentas de prueba, inyección a través de páginas web y confirmación humana.

## Qué construyes

Un agente que completa un flujo en una aplicación web de prueba dentro de un contenedor aislado:

- con herramientas de navegador basadas en el DOM y uso del ordenador como último recurso;
- que verifica el resultado de cada acción y reintenta con límite;
- con lista de dominios permitidos, sin credenciales reales y con aprobación humana antes de cualquier acción con efectos.

> [!peligro] Siempre en un entorno aislado
> Nunca ejecutes un agente de uso del ordenador en tu máquina de trabajo ni con tus sesiones iniciadas. Usa una máquina virtual o un contenedor desechable desde el primer ejercicio. Lo explica [[radar/2026-07-02-uso-del-ordenador-en-sandbox]].

La herramienta de uso del ordenador de cada proveedor tiene un tipo versionado que cambia con los modelos. En este curso no copiamos nombres de versión: consulta siempre la [documentación oficial](https://platform.claude.com/docs) y el artículo de referencia [[docs/herramientas/04-uso-del-ordenador]].
