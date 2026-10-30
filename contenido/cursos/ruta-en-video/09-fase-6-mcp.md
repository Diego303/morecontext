---
titulo: "Fase 6 · MCP"
descripcion: "MCP como una API común para las herramientas de un agente: qué amplía, por qué lo llaman el USB-C de la IA y cómo se conecta un tablero de tareas a tu agente."
creado: 2026-10-29
revisado: 2026-10-29
orden: 9
minutos: 201
tipo: teoria
profundidad: imprescindible
objetivos:
  - Explicar qué parte de un agente amplía MCP y en qué se parece a una API.
  - Describir los pasos para conectar un servidor MCP remoto a una herramienta agéntica.
  - Decidir si una herramienta propia debe exponerse como servidor MCP o definirse directamente en la llamada a la API.
requiere: ["[[cursos/ruta-en-video/08-fase-5-que-es-un-agente]]"]
relacionados: ["[[cursos/mcp-de-cero-a-servidor/index]]", "[[roadmap/20-herramientas/05-mcp-conectar-un-servidor]]", "[[glosario/mcp]]", "[[docs/claude-code/07-mcp-en-claude-code]]"]
tags: [ruta-en-video, mcp, herramientas]
---

Al terminar esta fase sabrás qué es [[glosario/mcp|MCP]] (Model Context Protocol), qué capacidades le da a un agente y cómo se conecta uno a tu herramienta de trabajo. Es la forma estándar de que un agente hable con APIs, bases de datos, tu sistema de archivos o el tablero de tareas de tu equipo.

## Qué vas a ver

| Curso | Canal | Duración | Idioma | Profundidad |
|---|---|---|---|---|
| [«Curso Intensivo de Model Context Protocol»](https://midu.dev/curso/intensivo-mcp/) | midudev | 1:11 (20 clases) | español | a fondo |
| [Introducción a MCP](https://academy.claude.com/es/courses/introduction-to-model-context-protocol) | Anthropic Academy | — | inglés | a fondo |
| [MCP: temas avanzados](https://academy.claude.com/es/courses/model-context-protocol-advanced-topics) | Anthropic Academy | — | inglés | a fondo |

El curso de midudev también está en YouTube con el título «MCP desde cero: Conecta tu IA a cualquier dato», según la ruta del autor. Duración e idioma, según esa misma ruta; «—» indica una duración sin confirmar. El tiempo de la lección suma el curso de midudev, una estimación por lo bajo de 60 minutos por cada curso de Anthropic y 10 minutos de lectura. El catálogo completo de Anthropic Academy está en [academy.claude.com](https://academy.claude.com/es/all).

## Lo que importa

La nota del autor parte de lo visto en la fase 5. Un agente piensa porque está conectado a un LLM y, cuando necesita actuar, usa sus herramientas para interactuar con el entorno: crear, modificar o leer archivos y ejecutar comandos. **MCP amplía justo esa parte, la de las herramientas**: extiende lo que un agente puede hacer.

Un servidor MCP puede correr en tu propio ordenador, estar desplegado en remoto o ser el punto de conexión que te da una empresa. En el fondo funciona como una API. En una API llamas a un endpoint y detrás hay una función que ejecuta cualquier cosa que hayas programado. En MCP, el «endpoint» es el nombre de una herramienta, acompañado de la información que el LLM necesita para entender para qué sirve y qué parámetros lleva. El LLM decide llamarla, el agente envía la petición al servidor MCP y la herramienta, que es una función de código, hace lo que sea: una cuenta, una llamada a otro servicio, una consulta a una base de datos. Si lo puedes programar, puede ser una herramienta. Conecta tu agente a un servidor MCP de base de datos y podrá decirte qué tablas hay, lanzar consultas de lectura o crear tablas.

Por eso se le llama **el USB-C de la IA**: es una interfaz común para que todos se entiendan. Si creas, por ejemplo, una base de datos y quieres que sea compatible con el máximo de agentes posible, la conexión estándar que ofrecer delante es un servidor MCP, no un protocolo propio.

El ejemplo práctico del autor es conectar un tablero de tareas tipo Notion, Jira o Monday:

1. En la web del servicio configuras el acceso y obtienes la URL de conexión y un token (a veces es de pago).
2. Añades esa conexión MCP en tu herramienta agéntica (Codex, Claude Code u otra).
3. Pides en lenguaje natural: «mueve la tarea con id X a hecho».
4. El agente hace su bucle de siempre: al pensar ve que, además de sus herramientas normales, tiene las del servidor MCP, y las usa. Mismo bucle, más capacidades.

Sobre cuándo usarlo, el autor es honesto: en su desarrollo local lo que más usa son agentes, flujos multiagente y skills (la fase siguiente). Pero conviene saber que MCP existe porque abre muchas puertas: muchas empresas ya ofrecen un servidor MCP para sus productos, y si construyes una plataforma o un sistema propio y quieres que tus herramientas sirvan en muchos agentes, lo natural es exponerlas por MCP. Si una herramienta solo la usa tu propia aplicación, puedes definirla directamente en la llamada a la API, como harás en el nivel 20 del roadmap; un servidor añade un proceso y un protocolo que entonces no aportan nada.

> [!peligro] Un servidor MCP es una puerta con tus credenciales
> El token que configuras da al agente los permisos de esa cuenta. Empieza con permisos de solo lectura, revisa qué herramientas expone cada servidor y desconfía de servidores de terceros sin revisar: una descripción de herramienta maliciosa puede inyectar instrucciones en tu agente. Lo ves en [[cursos/mcp-de-cero-a-servidor/04-seguridad-y-despliegue]].

## Cómo verlo

1. **El curso intensivo de midudev primero.** Cubre qué es MCP y de dónde viene (lo publicó Anthropic como estándar abierto), RAG frente a MCP, tu primer servidor en TypeScript, conexiones a APIs, bases de datos y archivos, el MCP Inspector, el uso en VS Code y la automatización del navegador con Playwright MCP.
2. **Los dos cursos de Anthropic Academy después.** El autor recomienda hacer los dos; al terminar dan un certificado en PDF.
3. **Qué apuntar:** la analogía con una API, los pasos para conectar un servidor y la diferencia entre que una herramienta esté en tu código o en un servidor.
4. **Ojo con la versión.** La especificación vigente de MCP es la del 28 de julio de 2026, que elimina el saludo inicial (`initialize`) y las sesiones: cada petición viaja con su versión y sus capacidades. Los SDK también cambiaron: en Python la clase es `MCPServer` (la serie 1.x la llamaba `FastMCP`) y en TypeScript hay paquetes separados de servidor y cliente. Si el curso que ves es anterior, los conceptos siguen valiendo y los detalles del código pueden haber cambiado: compara con [[herramientas/mcp-sdks]].

## Practícalo en MoreContext

- [[roadmap/20-herramientas/05-mcp-conectar-un-servidor]]: conectar un servidor MCP a tu propio agente.
- [[cursos/mcp-de-cero-a-servidor/01-que-resuelve-mcp]], [[cursos/mcp-de-cero-a-servidor/02-usar-servidores-existentes]] y [[cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor]]: el curso completo, con un servidor en Python.
- [[recetas/servidor-mcp-de-solo-lectura]]: el primer servidor que deberías escribir.
- [[sistemas/asistente-de-datos-con-mcp]]: el ejemplo de la base de datos convertido en sistema.
- [[docs/claude-code/07-mcp-en-claude-code]] y [[cursos/langchain-y-langgraph/10-mcp-en-langchain]]: conectar servidores en Claude Code o en un agente de LangChain.
- Si no aparece: [[problemas/servidor-mcp-no-aparece]].

## Ejercicio

> [!ejercicio] Conecta y acota
> Conecta un servidor MCP existente a tu herramienta agéntica (un servidor de archivos, de GitHub o de tu gestor de tareas). Pídele en lenguaje natural una tarea de lectura y otra de escritura, y revisa en la traza qué herramientas del servidor usó.
>
> Está bien si la tarea de lectura funciona con un token o configuración de solo lectura, si para la de escritura amplías permisos de forma explícita y mínima y si anotas qué herramientas expone el servidor y cuáles no necesitabas.

> [!ejercicio]- Pistas
> Si el servidor expone muchas herramientas, comprueba si tu cliente permite desactivar las que no uses: menos herramientas significa menos tokens y menos riesgo. Si no aparece, revisa primero la ruta del comando o la URL en la configuración.

## Resumen

- MCP amplía las herramientas de un agente con un protocolo común: el USB-C de la IA.
- Un servidor MCP es como una API: cada herramienta tiene nombre, descripción y parámetros, y detrás hay código.
- Conectar un servicio es configurar URL y token en tu herramienta agéntica; el bucle no cambia.
- Exponlo por MCP si se va a reutilizar en varios agentes; si no, defínelo en tu llamada a la API.

## Para seguir

- [[cursos/ruta-en-video/10-fase-7-agent-skills]]
- [[cursos/mcp-de-cero-a-servidor/index]]
- [[blog/2026-07-30-por-que-mcp-importa]]
