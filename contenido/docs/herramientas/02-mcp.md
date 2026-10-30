---
titulo: MCP
descripcion: Referencia del Model Context Protocol, con arquitectura host, cliente y servidor, primitivas, transportes y cómo escribir y conectar un servidor.
creado: 2026-08-06
actualizado: 2026-10-29
orden: 2
nivel: intermedio
tags: [herramientas, mcp, protocolo]
aliases: [Model Context Protocol]
relacionados: ["[[glosario/mcp]]", "[[glosario/servidor-mcp]]", "[[cursos/mcp-de-cero-a-servidor/index]]", "[[roadmap/20-herramientas/05-mcp-conectar-un-servidor]]"]
---

El [[glosario/mcp|Model Context Protocol (MCP)]] es un **estándar abierto para conectar aplicaciones de IA con herramientas y datos**. En lugar de programar cada integración dentro de cada aplicación, alguien escribe un [[glosario/servidor-mcp|servidor MCP]] una vez (para GitHub, una base de datos, tu sistema interno) y cualquier aplicación compatible puede usarlo. La especificación vive en [modelcontextprotocol.io](https://modelcontextprotocol.io); la revisión vigente es la `2026-07-28` y el proyecto está hoy en la Agentic AI Foundation (Linux Foundation), junto a A2A, Agent Skills y `AGENTS.md` ([[docs/estandares/index]]).

MCP no cambia cómo razona el modelo. Por debajo, las herramientas de un servidor MCP acaban siendo herramientas normales con su ciclo `tool_use` → `tool_result` ([[docs/herramientas/01-uso-de-herramientas]]). Lo que estandariza es **cómo se descubren, describen e invocan**.

Para aprenderlo paso a paso: [[roadmap/20-herramientas/05-mcp-conectar-un-servidor]] y el curso [[cursos/mcp-de-cero-a-servidor/index]].

## Arquitectura

```mermaid
flowchart LR
  H[Host: tu app o IDE] --> C1[Cliente MCP]
  H --> C2[Cliente MCP]
  C1 <--> S1[Servidor: base de datos]
  C2 <--> S2[Servidor: tickets]
  H <--> M[Modelo]
```

| Pieza | Qué es | Ejemplo |
|---|---|---|
| *Host* | La aplicación que usa el modelo y decide qué servidores conecta | Un asistente de escritorio, un IDE, tu agente |
| *Cliente* | Componente dentro del host que habla con **un** servidor | Una instancia de `mcp.Client` |
| *Servidor* | Proceso que expone capacidades a través del protocolo | Un servidor de solo lectura sobre tu base de datos |

## Primitivas de un servidor

| Primitiva | Quién decide usarla | Qué es | Ejemplo |
|---|---|---|---|
| *Tools* | El modelo | Funciones invocables con argumentos | `buscar_cliente(email)` |
| *Resources* | La aplicación | Datos de solo lectura identificados por URI | `libros://catalogo` |
| *Prompts* | La persona usuaria | Plantillas de prompt reutilizables | «Resume esta incidencia» |

La mayoría de integraciones empiezan solo con *tools*. Añade *resources* cuando quieras que la aplicación cargue contexto sin pasar por una decisión del modelo.

Del lado del cliente existían además *roots*, *sampling* (el servidor pide al modelo que genere) y *logging*. En la revisión `2026-07-28` **los tres están deprecados**: no los uses en servidores nuevos. Cuando un servidor necesita algo del usuario a mitad de una llamada, ahora devuelve un resultado `input_required` y el cliente reintenta con la respuesta ([[glosario/mrtr|MRTR]]).

## La revisión 2026-07-28: sin estado

Es el cambio más grande del protocolo desde su origen y afecta a cómo se despliega un servidor.

| Antes (≤ `2025-11-25`) | Ahora (`2026-07-28`) |
|---|---|
| Saludo `initialize` / `notifications/initialized` | No hay saludo: cada petición lleva versión y capacidades en `_meta` |
| Sesión del protocolo (`Mcp-Session-Id`) | Sin sesiones; el estado entre llamadas va en *handles* que crea el servidor |
| El cliente descubre capacidades en el saludo | `server/discover` (obligatorio en el servidor) |
| *Sampling*, *roots* y *elicitation* iniciados por el servidor | MRTR: `resultType: "input_required"` y reintento con `inputResponses` |
| Tasks en el núcleo | Tasks pasa a extensión; además MCP Apps, Server Cards y otras |

En la práctica, un servidor *Streamable HTTP* se escala detrás de un balanceador normal, sin afinidad de sesión. Los SDK actuales (Python `mcp` 2.x, TypeScript v2) ya hablan esta versión. Detalle y migración en [[docs/estandares/01-mcp-2026-07-28]] y [[docs/estandares/02-extensiones-mcp]]; un ejemplo con *handles* en [[recetas/servidor-mcp-sin-estado-con-handles]].

## Transportes

| Transporte | Cuándo | Cómo funciona |
|---|---|---|
| `stdio` | Servidor local en la misma máquina | El host lanza el servidor como subproceso y se comunican por entrada y salida estándar. |
| *Streamable HTTP* | Servidor remoto, compartido por varios usuarios | El servidor escucha en una URL; admite respuestas en streaming. Desde `2026-07-28`, sin sesión. |
| HTTP+SSE | Solo clientes antiguos | Deprecado. No lo uses en servidores nuevos. |

> [!aviso] En `stdio`, nada a la salida estándar
> Con transporte `stdio`, la salida estándar es el canal del protocolo. Un `print()` de depuración en el servidor rompe la comunicación. Escribe los logs en la salida de errores o en un archivo.

## Ejemplo completo: un servidor

Un servidor con una herramienta y un recurso. SDK de Python: paquete `mcp` (serie 2.x, `pip install "mcp[cli]"`; en la 1.x la clase `MCPServer` se llamaba `FastMCP`). SDK de TypeScript v2: `@modelcontextprotocol/server` y `@modelcontextprotocol/client`, que sustituyen al paquete único `@modelcontextprotocol/sdk` (hoy línea v1, sin la revisión `2026-07-28`).

```python tab="Python" title="servidor.py"
from mcp.server.mcpserver import MCPServer
from mcp.server.mcpserver.exceptions import ToolError

mcp = MCPServer("biblioteca", instructions="Catálogo de una biblioteca. Solo lectura.")

CATALOGO = {
    "978-84-376-0494-7": {"titulo": "Cien años de soledad", "disponible": True},
    "978-84-206-3311-2": {"titulo": "La Regenta", "disponible": False},
}

@mcp.tool()
def buscar_libro(texto: str) -> str:
    """Busca libros cuyo título contenga el texto. Devuelve ISBN, título y disponibilidad."""
    if len(texto.strip()) < 3:
        raise ToolError("Escribe al menos 3 letras del título.")  # el modelo lo recibe como error
    hallados = [
        f"{isbn} | {d['titulo']} | {'disponible' if d['disponible'] else 'prestado'}"
        for isbn, d in CATALOGO.items()
        if texto.lower() in d["titulo"].lower()
    ]
    return "\n".join(hallados) or "Sin resultados."

@mcp.resource("libros://catalogo")
def catalogo() -> str:
    """Lista completa del catálogo."""
    return "\n".join(f"{isbn} | {d['titulo']}" for isbn, d in CATALOGO.items())

if __name__ == "__main__":
    mcp.run()  # stdio por defecto
```

```ts tab="TypeScript" title="servidor.ts"
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

const CATALOGO: Record<string, { titulo: string; disponible: boolean }> = {
  "978-84-376-0494-7": { titulo: "Cien años de soledad", disponible: true },
  "978-84-206-3311-2": { titulo: "La Regenta", disponible: false },
};

const server = new McpServer({ name: "biblioteca", version: "1.0.0" });

server.registerTool(
  "buscar_libro",
  {
    description: "Busca libros cuyo título contenga el texto. Devuelve ISBN, título y disponibilidad.",
    inputSchema: z.object({ texto: z.string() }),
  },
  async ({ texto }) => {
    if (texto.trim().length < 3) {
      return { isError: true, content: [{ type: "text", text: "Escribe al menos 3 letras del título." }] };
    }
    const hallados = Object.entries(CATALOGO)
      .filter(([, d]) => d.titulo.toLowerCase().includes(texto.toLowerCase()))
      .map(([isbn, d]) => `${isbn} | ${d.titulo} | ${d.disponible ? "disponible" : "prestado"}`);
    return { content: [{ type: "text", text: hallados.join("\n") || "Sin resultados." }] };
  },
);

await server.connect(new StdioServerTransport());
```

En Python, `MCPServer` genera el esquema de entrada a partir de las anotaciones de tipo y la descripción a partir del *docstring*. Un `ToolError` llega al cliente como resultado con `is_error` y el texto con el prefijo `Error executing tool buscar_libro: `; en TypeScript devuelves `isError: true` tú mismo (el JSON del protocolo va en camelCase). Escríbelo con el mismo cuidado que la descripción de cualquier herramienta: [[disciplinas/diseno-de-herramientas]].

## Ejemplo completo: conectar el servidor a tu agente

El cliente lista las herramientas del servidor, se las pasa al modelo en `tools` y reenvía cada `tool_use` al servidor. Con el SDK 2.x, el cliente de alto nivel es `mcp.Client`: acepta los parámetros de un servidor `stdio`, una URL o, en pruebas, la propia instancia de `MCPServer`.

```python title="cliente.py"
import asyncio
import anthropic
from mcp import Client, StdioServerParameters

MODEL = "claude-sonnet-5-5"
MAX_PASOS = 8
client = anthropic.AsyncAnthropic()
servidor = StdioServerParameters(command="python", args=["servidor.py"])

async def main(pregunta: str) -> str:
    async with Client(servidor) as mcp:  # sin saludo initialize: el SDK habla 2026-07-28
        lista = await mcp.list_tools()
        tools = [
            {"name": t.name, "description": t.description or "", "input_schema": t.input_schema}
            for t in lista.tools
        ]
        mensajes = [{"role": "user", "content": pregunta}]
        for _ in range(MAX_PASOS):
            resp = await client.messages.create(
                model=MODEL, max_tokens=1024, tools=tools, messages=mensajes
            )
            mensajes.append({"role": "assistant", "content": resp.content})
            if resp.stop_reason != "tool_use":
                return "".join(b.text for b in resp.content if b.type == "text")
            resultados = []
            for b in resp.content:
                if b.type == "tool_use":
                    r = await mcp.call_tool(b.name, b.input)
                    texto = "".join(c.text for c in r.content if c.type == "text")
                    resultados.append({
                        "type": "tool_result", "tool_use_id": b.id,
                        "content": texto, "is_error": bool(r.is_error),
                    })
            mensajes.append({"role": "user", "content": resultados})
        return "[límite de pasos]"

print(asyncio.run(main("¿Está disponible La Regenta?")))
```

`ClientSession` con `await sesion.initialize()` sigue existiendo como vía de compatibilidad con servidores antiguos, pero en código nuevo usa `Client`. Para probar un servidor sin lanzar procesos, `async with Client(mcp) as c:` sobre la instancia de `MCPServer` lo ejecuta en memoria.

Si el servidor es remoto, la API de Claude puede conectarse a él directamente con `mcp_servers` y la herramienta `mcp_toolset`, sin que escribas este puente (beta; solo herramientas y solo servidores HTTP): ver [[docs/herramientas/07-mcp-desde-la-api]]. En Claude Code, los servidores se declaran en `.mcp.json`: [[docs/claude-code/07-mcp-en-claude-code]].

### Con LangChain

`langchain.mcp.MCPAdapter` (beta, `pip install "langchain[mcp]"`) convierte las herramientas de un servidor en herramientas de LangChain y es compatible con el SDK `mcp` 2.x:

```python title="cliente_lc.py"
import asyncio
from pathlib import Path
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain.mcp import MCPAdapter

MODEL = "anthropic:claude-sonnet-5-5"

async def main(pregunta: str) -> str:
    async with MCPAdapter(Path("servidor.py")) as mcp:  # Path = stdio; un str solo puede ser una URL http(s)
        tools = await mcp.list_tools()
        agente = create_agent(init_chat_model(MODEL, max_tokens=1024), tools)
        salida = await agente.ainvoke({"messages": [("user", pregunta)]})
        return salida["messages"][-1].text

print(asyncio.run(main("¿Está disponible La Regenta?")))
```

No lo mezcles con el paquete anterior `langchain-mcp-adapters` (`MultiServerMCPClient`): exige `mcp<2` y rompe el SDK 2.x en el mismo entorno. Más en [[recetas/herramientas-mcp-en-un-agente-langchain]] y [[cursos/langchain-y-langgraph/10-mcp-en-langchain]].

## Casos límite

| Situación | Qué hacer |
|---|---|
| Varios servidores con herramientas del mismo nombre | Añade un prefijo por servidor (`tickets_buscar`, `db_buscar`) al construir `tools`. |
| Servidor con decenas de herramientas | Expón solo las que necesita esta tarea o márcalas con `defer_loading` ([[docs/herramientas/05-busqueda-y-carga-diferida]]); muchas herramientas parecidas confunden al modelo y ocupan contexto. |
| Servidor antiguo (≤ `2025-11-25`) | Los SDK 2.x mantienen compatibilidad; si guarda estado por sesión, migra a *handles*. |
| Resultado con imágenes u otros tipos | `r.content` puede traer bloques no textuales; conviértelos al bloque equivalente o descártalos explícitamente. |
| Servidor caído | `call_tool` lanza excepción: devuélvela como `tool_result` con `is_error`. |

## Errores frecuentes

- **Instalar servidores de terceros sin revisarlos.** Un servidor ejecuta código en tu máquina y sus descripciones y resultados entran en el contexto del modelo, donde pueden traer [[glosario/inyeccion-de-prompt|inyecciones]]. Ver [[cursos/mcp-de-cero-a-servidor/04-seguridad-y-despliegue]] y [[docs/seguridad/04-mcp-y-skills-de-terceros]].
- **Dar permisos de escritura por defecto.** Empieza por solo lectura: [[recetas/servidor-mcp-de-solo-lectura]].
- **Herramientas que traducen la API interna una a una.** Diseña pensando en las tareas del modelo, no en tus *endpoints*.
- **Logs por la salida estándar** con `stdio`.

## Ver también

- [[cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor]]: escribir un servidor paso a paso.
- [[sistemas/asistente-de-datos-con-mcp]]: un sistema completo sobre una base de datos.
- [[glosario/mcp]] y [[glosario/servidor-mcp]].
- [[docs/estandares/01-mcp-2026-07-28]]: la revisión sin estado, a fondo.
- [[herramientas/mcp-sdks]]: los SDK oficiales por lenguaje.
- [[problemas/servidor-mcp-no-aparece]]: cuando el cliente no ve el servidor.
- [[radar/2026-09-08-mcp-forma-estandar]] y [[blog/2026-07-30-por-que-mcp-importa]].
