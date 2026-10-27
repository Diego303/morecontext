---
titulo: Por qué MCP importa más de lo que parece
descripcion: Un análisis de lo que cambia MCP más allá de ser otro formato de herramientas, en reutilización, separación de responsabilidades y seguridad.
creado: 2026-07-30
estado: revision
tipo: analisis
tags: [mcp, herramientas, arquitectura]
relacionados: ["[[glosario/mcp]]", "[[docs/herramientas/02-mcp]]", "[[cursos/mcp-de-cero-a-servidor/01-que-resuelve-mcp]]", "[[radar/2026-09-08-mcp-forma-estandar]]"]
---

La primera vez que lees sobre [[glosario/mcp|MCP]] es fácil quedarse con una idea pequeña: es otra forma de definir herramientas. Al fin y al cabo, si ya sabes usar [[glosario/tool-use|tool use]] en la API, ¿qué te aporta un protocolo encima? Creo que esa lectura se queda corta. En este análisis explico qué cambia de verdad y qué no.

## Lo que MCP es, en una frase

El Model Context Protocol es un estándar abierto para conectar aplicaciones de IA con herramientas y datos. La especificación está en [modelcontextprotocol.io](https://modelcontextprotocol.io). Hay tres papeles: el *host* es la aplicación con la que interactúa el usuario; el *host* crea un *cliente* por cada servidor al que se conecta; y el [[glosario/servidor-mcp|servidor MCP]] expone capacidades. Esas capacidades son de tres tipos: *tools* (funciones que el modelo puede invocar), *resources* (datos que la aplicación puede leer) y *prompts* (plantillas reutilizables). La comunicación va por `stdio` en local o por *Streamable HTTP* en remoto.

## Primera idea: el problema N × M

Sin un estándar, cada aplicación que quiere hablar con cada servicio necesita su integración. Si tienes N aplicaciones y M servicios, escribes del orden de N × M conectores, cada uno con sus particularidades. Es el mismo problema que resolvieron en su día otros protocolos: un formato común reduce el trabajo a N + M.

Para quien construye agentes, esto significa que una herramienta bien hecha deja de estar atada a un único producto. Si escribes un servidor que da acceso de solo lectura a tu base de datos, lo puede usar tu asistente interno, un agente de código y cualquier otro host compatible. El sistema [[sistemas/asistente-de-datos-con-mcp]] parte justo de ahí.

## Segunda idea: separar quién razona de quién sabe

Creo que el cambio más interesante es organizativo. Con tool use directo, la definición de la herramienta, su implementación y el agente que la usa viven en el mismo código, mantenido por el mismo equipo. Con MCP, la herramienta pasa a tener dueño propio.

El equipo que conoce el sistema de facturación puede publicar un servidor con las operaciones correctas, bien nombradas, con los permisos adecuados y con resultados en un formato útil para un modelo. Los equipos que construyen agentes lo consumen. Cada uno se ocupa de lo que conoce. Es la misma separación que hacemos con las APIs internas, aplicada a la capa que hablan los modelos.

Esta separación tiene una consecuencia: la calidad de las herramientas pasa a ser un producto en sí mismo. Todo lo que recoge *Writing effective tools for agents* (Anthropic, 2025) sobre nombres claros, descripciones que explican cuándo usar cada herramienta y resultados concisos aplica igual o más, porque ahora tu herramienta la usarán agentes que no has escrito tú. Lo tratamos en [[disciplinas/diseno-de-herramientas]].

## Tercera idea: más que funciones

Si solo usas *tools*, te pierdes parte del diseño. Los *resources* permiten que la aplicación decida qué datos meter en el contexto sin que el modelo tenga que pedirlos con una llamada. Los *prompts* permiten que el servidor ofrezca flujos ya preparados que el usuario puede invocar. Las tres primitivas reflejan tres formas distintas de control: lo que decide el modelo, lo que decide la aplicación y lo que decide el usuario. Pensar en qué va en cada una ayuda a diseñar mejor el sistema, uses MCP o no.

## Lo que no cambia

Conviene ser claro con los límites.

MCP no hace que un agente sea mejor. Si las herramientas que expone un servidor son confusas o devuelven resultados enormes, el agente se equivocará igual. El protocolo resuelve la conexión, no el diseño.

MCP no elimina el coste de contexto. Cada herramienta conectada añade su definición al prompt. Conectar diez servidores con veinte herramientas cada uno es la forma más rápida de llenar la [[glosario/ventana-de-contexto|ventana]] de descripciones que el modelo no necesita para la tarea. Elegir qué conectar sigue siendo una decisión de [[disciplinas/context-engineering|context engineering]].

Y MCP no resuelve la seguridad. La empeora si no prestas atención, porque facilita conectar código de terceros a tu agente.

## La parte de seguridad

Conectar un servidor MCP es darle a tu agente nuevas capacidades y nuevas fuentes de texto. Las dos son superficie de ataque. Un servidor puede exponer herramientas con más permisos de los necesarios, y cualquier contenido que devuelva entra en el contexto del modelo. Es el escenario de [[glosario/inyeccion-de-prompt|inyección indirecta]] que describieron Greshake et al. en 2023, con una puerta más.

Las prácticas son las de siempre, aplicadas con más disciplina: conectar solo servidores de origen conocido, preferir servidores de solo lectura, dar [[glosario/minimo-privilegio|mínimo privilegio]] a las credenciales que usan y pedir confirmación antes de acciones con efecto. El curso las desarrolla en [[cursos/mcp-de-cero-a-servidor/04-seguridad-y-despliegue]].

## Por qué creo que merece la pena aprenderlo ya

Escribir un servidor MCP sencillo con el SDK de Python es poco código: `MCPServer`, un decorador `@mcp.tool()` por función y `mcp.run()`. El coste de entrada es bajo. Lo que ganas es que tus herramientas dejan de depender de un único agente y que te obliga a pensar en ellas como un producto con contrato, dueño y permisos. Si quieres probar, empieza por [[recetas/servidor-mcp-de-solo-lectura]] o por la lección [[roadmap/20-herramientas/05-mcp-conectar-un-servidor]].

*Borrador inicial: pendiente de reescribir con la voz del autor.*
