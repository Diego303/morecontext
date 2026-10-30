---
titulo: Herramientas MCP en un agente de LangChain
descripcion: Conecta un servidor MCP local por stdio a un agente de create_agent con langchain.mcp.MCPAdapter y el SDK mcp 2.x, y evita el conflicto de langchain-mcp-adapters con mcp<2.
creado: 2026-10-29
nivel: intermedio
minutos: 25
tema: herramientas
stack: ["LangChain", "MCP", "Python"]
tags: [herramientas, mcp, langchain, agentes]
relacionados: ["[[cursos/langchain-y-langgraph/10-mcp-en-langchain]]", "[[recetas/servidor-mcp-de-solo-lectura]]", "[[docs/herramientas/02-mcp]]", "[[herramientas/mcp-sdks]]", "[[problemas/servidor-mcp-no-aparece]]"]
---

## Problema

Ya tienes (o quieres escribir) un [[glosario/servidor-mcp|servidor MCP]] con tus herramientas, y quieres que lo use un agente hecho con LangChain sin reescribir cada herramienta como `@tool`. Además quieres usar el SDK de [[glosario/mcp|MCP]] actual (`mcp` 2.x, especificación `2026-07-28`) para el servidor, y en ese entorno el adaptador que aparece en casi todos los tutoriales, `langchain-mcp-adapters`, ni siquiera se importa.

## Ingredientes

- Python 3.10 o superior.
- `pip install "langchain[mcp,anthropic]" "mcp[cli]"`. El extra `mcp` de LangChain trae `langchain.mcp.MCPAdapter` (beta desde langchain 1.4) sobre FastMCP 4, compatible con `mcp` 2.x.
- `ANTHROPIC_API_KEY` para la versión real.
- Saber qué es una herramienta MCP ([[roadmap/20-herramientas/05-mcp-conectar-un-servidor]]).

## Pasos

1. **Escribe el servidor con `MCPServer`.** Un archivo, una herramienta de solo lectura. Los errores que el modelo debe leer se lanzan con `ToolError`: llegan al cliente marcados como error y con el texto, en lugar de tumbar el servidor.

```python title="servidor_pedidos.py"
from mcp.server.mcpserver import MCPServer
from mcp.server.mcpserver.exceptions import ToolError

mcp = MCPServer("pedidos")
PEDIDOS = {"ana@example.com": [{"id": "P-1001", "estado": "enviado", "fecha": "2026-09-10"}]}


@mcp.tool()
def ver_pedidos(email: str) -> list[dict]:
    """Lista los pedidos de un cliente por su email. Devuelve id, estado y fecha de cada pedido."""
    pedidos = PEDIDOS.get(email.lower())
    if pedidos is None:
        raise ToolError(f"No hay ningún cliente con email {email}")   # el modelo lo recibe como error
    return pedidos


if __name__ == "__main__":
    mcp.run()          # stdio: el cliente lanza este proceso y habla por stdin/stdout
```

2. **Conecta el agente con `MCPAdapter`.** `MCPAdapter(Path("servidor.py"))` lanza el servidor como subproceso por stdio con el mismo intérprete de Python, descubre sus herramientas y las convierte en herramientas de LangChain. Las herramientas resultantes son asíncronas: invoca el agente con `ainvoke`.

```python title="agente_mcp.py"
import asyncio
import warnings
from pathlib import Path

from langchain.agents import create_agent
from langchain.agents.middleware import ModelCallLimitMiddleware
from langchain.chat_models import init_chat_model
from langchain_core._api import LangChainBetaWarning

warnings.filterwarnings("ignore", category=LangChainBetaWarning)   # langchain.mcp está en beta y lo avisa
from langchain.mcp import MCPAdapter  # noqa: E402

MODEL = "anthropic:claude-sonnet-5-5"
SERVIDOR = Path(__file__).with_name("servidor_pedidos.py")        # Path = stdio; un str solo puede ser una URL


async def preguntar(pregunta: str, modelo=None):
    async with MCPAdapter(SERVIDOR) as mcp:                         # lanza el servidor como subproceso
        tools = await mcp.list_tools()                              # herramientas MCP convertidas a BaseTool
        agente = create_agent(
            model=modelo or init_chat_model(MODEL, max_tokens=1024),
            tools=tools,
            system_prompt="Eres el asistente de soporte de una tienda. Usa las herramientas; no inventes datos.",
            middleware=[ModelCallLimitMiddleware(run_limit=8, exit_behavior="end")],
        )
        return await agente.ainvoke({"messages": [("user", pregunta)]})   # herramientas async: ainvoke


if __name__ == "__main__":
    print(asyncio.run(preguntar("¿Qué pedidos tiene ana@example.com?"))["messages"][-1].content)
```

3. **Elige bien el destino.** `MCPAdapter` acepta varias formas, y cada una dice explícitamente dónde está el servidor:

| Destino | Qué hace |
|---|---|
| `Path("servidor.py")` o `.js` | Lo lanza en local por stdio |
| `"https://mcp.example.com/mcp"` | Se conecta por Streamable HTTP (remoto) |
| `{"mcpServers": {"pedidos": {"command": …, "args": […]}, …}}` | Varios servidores a la vez; las herramientas llevan el prefijo del servidor (`pedidos_ver_pedidos`) |
| Un `MCPServer` o un cliente FastMCP ya creado | En el mismo proceso, útil en pruebas |

Un `str` que no sea una URL `http(s)` se **rechaza a propósito**. Es una decisión de seguridad: una cadena que llega de configuración o de un modelo no puede convertirse en silencio en un subproceso local. Para lanzar un script, pasa un `Path`.

4. **No mezcles `langchain-mcp-adapters` con `mcp` 2.x.** El paquete anterior (`MultiServerMCPClient`) exige `mcp<2`, y con `mcp` 2.3 instalado falla al importar (`ImportError: cannot import name 'RequestContext' from 'mcp.shared.context'`). Si un proyecto antiguo lo necesita, ponlo en un entorno virtual distinto del servidor: el protocolo sí es compatible, y un cliente con `mcp` 1.x habla con un servidor hecho con `mcp` 2.x.

5. **Limita lo que el agente puede hacer.** Las herramientas MCP son código de terceros cuando el servidor no es tuyo: lee sus descripciones antes de dárselas al modelo ([[glosario/envenenamiento-de-herramientas]]) y filtra la lista (`[t for t in tools if t.name in PERMITIDAS]`) en lugar de pasarlas todas.

## Cómo comprobar que funciona

Lo probé con el servidor real lanzado por stdio y un [[glosario/modelo-simulado|modelo simulado]] que pide `ver_pedidos` con un email que existe y con otro que no. Salida real (el log `INFO` del servidor va a stderr y lo omito):

```text
mcp 2.3.0 | fastmcp 4.1.4 | langchain 1.4.7
herramienta: ver_pedidos | Lista los pedidos de un cliente por su email. Devu | {'email': {'title': 'Email', 'type': 'string'}}
ana@example.com: status=success | '{\n  "id": "P-1001",\n  "estado": "enviado",\n  "fecha": "2026-09-10"\n}'
nadie@example.com: status=error | 'Error executing tool ver_pedidos: No hay ningún cliente con email nadie@exa'
el modelo vio: ['ver_pedidos']
str local: MCP target '/…/servidor_pedidos.py' is not a valid URL…
```

Qué confirma:

- La descripción y el esquema del servidor llegan intactos a LangChain.
- El `ToolError` vuelve al modelo como `ToolMessage(status="error")` con el prefijo `Error executing tool <nombre>: `, así que el agente puede corregirse; no hace falta `ToolErrorMiddleware` para estos errores.
- El contenido llega como lista de bloques (`tm.content[0]["text"]`), no como texto plano.
- Pasar la ruta como `str` falla antes de lanzar nada.

Para depurar el servidor por separado, ábrelo con el inspector: `mcp dev servidor_pedidos.py`.

## Variaciones

- **Servidor remoto.** Arranca el mismo archivo con `mcp.run(transport="streamable-http")` y conecta con `MCPAdapter("http://localhost:8000/mcp")`. Lo de cerrar el acceso y autenticar es tuyo ([[recetas/servidor-mcp-de-solo-lectura]]).
- **Varios servidores.** Un `dict` con `mcpServers`, como en la tabla. Los prefijos evitan choques de nombres entre servidores.
- **El servidor pide datos a mitad de llamada.** Si una herramienta MCP solicita información al usuario (*elicitation*), `MCPAdapter` lo convierte en un `interrupt()` de LangGraph: añade un checkpointer y reanuda con `Command(resume=…)`, como en [[recetas/aprobacion-humana-con-langgraph]].
- **Sin LangChain.** Con el SDK, el cliente `mcp` y la conversión de herramientas a mano: lo enseña [[roadmap/20-herramientas/05-mcp-conectar-un-servidor]]. Con la API de Claude también puedes conectar servidores remotos desde el servidor de Anthropic ([[docs/herramientas/07-mcp-desde-la-api]]).
- **En LangGraph.** Las mismas `tools` van a un `ToolNode` en tu grafo.

## Errores típicos

- **Instalar `langchain-mcp-adapters` junto a `mcp` 2.x.** Uno de los dos se rompe. Usa `langchain[mcp]`.
- **Llamar a `invoke` en lugar de `ainvoke`.** Las herramientas del adaptador son asíncronas; en síncrono fallan con `NotImplementedError: StructuredTool does not support sync invocation`.
- **Usar las herramientas fuera del `async with`.** El subproceso vive mientras dura el contexto; créalo y ejecuta el agente dentro.
- **Escribir en stdout desde el servidor.** Por stdio, stdout es el canal del protocolo: un `print()` corrompe los mensajes. Usa `logging` (que va a stderr).
- **El servidor no arranca y no ves por qué.** Ejecuta `python servidor_pedidos.py` a mano para ver la traza, y revisa [[problemas/servidor-mcp-no-aparece]].
- **Silenciar el aviso beta y olvidarlo.** `langchain.mcp` puede cambiar entre versiones menores: fija la versión de `langchain` en tu `requirements`.
