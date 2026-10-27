---
titulo: MCP
descripcion: Model Context Protocol, estándar abierto para conectar aplicaciones de IA con herramientas y fuentes de datos externas.
creado: 2026-07-22
categoria: herramientas
ingles: Model Context Protocol
aliases: [Model Context Protocol, protocolo MCP]
tags: [herramientas, mcp]
relacionados: ["[[docs/herramientas/02-mcp]]", "[[cursos/mcp-de-cero-a-servidor/index]]"]
---

MCP (*Model Context Protocol*) es un estándar abierto que define cómo una aplicación de IA se conecta con herramientas y datos externos. En lugar de programar una integración distinta para cada aplicación y cada servicio, el servicio se expone una vez como [[glosario/servidor-mcp]] y cualquier aplicación compatible puede usarlo. La especificación está en [modelcontextprotocol.io](https://modelcontextprotocol.io).

## En la práctica

La arquitectura tiene tres papeles: el *host* (la aplicación, por ejemplo un IDE o un asistente), que crea un *cliente* por cada *servidor* al que se conecta. Los servidores exponen *tools* (acciones que el modelo puede invocar), *resources* (datos que se leen) y *prompts* (plantillas reutilizables). Se comunican por `stdio` en local o por *Streamable HTTP* en remoto.

## No confundir con

- **[[glosario/tool-use]]**: el mecanismo de la API por el que el modelo pide una herramienta. MCP estandariza de dónde salen esas herramientas; al modelo le llegan igual.

## Ver también

- [[docs/herramientas/02-mcp]]
- [[roadmap/20-herramientas/05-mcp-conectar-un-servidor]]
- [[cursos/mcp-de-cero-a-servidor/01-que-resuelve-mcp]]
- [[blog/2026-07-30-por-que-mcp-importa]]
