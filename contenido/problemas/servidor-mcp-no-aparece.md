---
titulo: El servidor MCP no aparece en el cliente
descripcion: Por qué tu servidor MCP no sale en Claude Code u otro cliente, o sale sin herramientas, y cómo depurarlo con un cliente de prueba, el inspector y los logs, de la ruta al transporte.
creado: 2026-10-29
sintoma: El servidor MCP no aparece en el cliente
tema: herramientas
nivel: intermedio
tags: [mcp, depuracion, claude-code, herramientas]
relacionados: ["[[cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor]]", "[[docs/claude-code/07-mcp-en-claude-code]]", "[[glosario/servidor-mcp]]", "[[herramientas/mcp-sdks]]"]
---

Añadiste tu [[glosario/servidor-mcp|servidor MCP]] a la configuración, reinicias el cliente y no está. En Claude Code, `/mcp` lo muestra como fallido, o no lo muestra; el modelo dice que no tiene esa herramienta. A veces el servidor aparece conectado pero sin herramientas, o se cae en la primera llamada. Al ejecutarlo tú en una terminal parece que funciona: se queda esperando, sin errores.

## Causas

- **Ruta o comando mal escritos.** Una ruta relativa que el cliente resuelve desde otro directorio, `python` que apunta a otro intérprete sin tus dependencias, o un `npx` que no está en el `PATH` del cliente. El cliente lanza el proceso y este muere al instante.
- **El servidor escribe en stdout.** Con el transporte `stdio`, stdout es el canal del protocolo: cualquier `print` o log ahí mete líneas que no son JSON-RPC. La especificación lo prohíbe; los logs van a stderr.
- **Transporte equivocado.** Configuras una URL para un servidor que solo habla `stdio`, o un comando local para uno remoto. El conector MCP de la API de Claude, por ejemplo, solo admite servidores remotos.
- **Falta una variable de entorno.** La clave de API que el servidor necesita está en tu shell pero no en la configuración del cliente, y el servidor falla al arrancar.
- **Permisos o aprobación.** En Claude Code, los servidores de `.mcp.json` (ámbito de proyecto) esperan tu aprobación en una sesión interactiva; mientras tanto salen como `⏸ Pending approval`.
- **Tarda en arrancar.** Descargas con `npx -y` la primera vez o carga un modelo: el cliente se rinde antes (`MCP_TIMEOUT` en Claude Code).

## Cómo confirmarlo

Primero, fuera del cliente: lanza el servidor con un cliente MCP de prueba, con el mismo comando y argumentos que tu configuración. Con el SDK de Python (`mcp` 2.3.0):

```python title="probar_servidor.py"
import asyncio
import sys

from mcp import Client, StdioServerParameters

SERVIDOR = StdioServerParameters(command=sys.executable, args=["servidor_notas.py"])  # lo mismo que en tu config


async def main():
    async with asyncio.timeout(15):
        async with Client(SERVIDOR) as c:
            herramientas = await c.list_tools()
            print([t.name for t in herramientas.tools])


asyncio.run(main())
```

Lo que obtuve con cada fallo:

| Fallo | Lo que ves |
|---|---|
| El archivo no existe | `can't open file '…/no_existe.py'` en stderr y `mcp.shared.exceptions.MCPError: Connection closed` dentro de un `ExceptionGroup` |
| El comando no existe (`pyhton3`) | `FileNotFoundError: [Errno 2] No such file or directory: 'pyhton3'` |
| `print()` antes de `mcp.run()` | `Failed to parse JSONRPC message from server` … `input_value='Servidor de notas arrancando...'` |

El cliente de Python descarta la línea rota y sigue, pero no cuentes con que todos los clientes sean tan tolerantes. Un detalle de `mcp` 2.3.0: mientras sirve por `stdio`, redirige el stdout del proceso a stderr, así que un `print` dentro de una herramienta ya no llega al canal; uno ejecutado al importar el módulo, antes de `mcp.run()`, sí. En otros SDK o versiones no hay esa protección.

Después, con el **MCP Inspector** (`npx @modelcontextprotocol/inspector`, con interfaz web y modos `--cli` y `--tui`) puedes conectar a mano, listar herramientas y llamarlas viendo cada mensaje. En Claude Code, `claude mcp list` y `claude mcp get <nombre>` muestran la configuración que lee y su estado, y `/mcp` dentro de la sesión permite reconectar. Para el detalle, `claude --debug-file /tmp/claude-debug.log`.

## Arreglo

- **Rutas absolutas** y el intérprete exacto del entorno donde instalaste el servidor (`/ruta/a/venv/bin/python`).
- **Logs a stderr**, siempre:

```python title="servidor_notas.py"
import logging
import sys

from mcp.server.mcpserver import MCPServer

logging.basicConfig(stream=sys.stderr, level=logging.INFO)   # nunca a stdout en stdio
mcp = MCPServer("notas")


@mcp.tool()
def buscar_nota(texto: str) -> str:
    """Busca una nota por texto."""
    logging.info("buscando %s", texto)
    return "Nota: comprar pan"


if __name__ == "__main__":
    logging.info("Servidor de notas arrancando")
    mcp.run()                                    # stdio; transport="streamable-http" para remoto
```

- **El transporte que corresponde**: `claude mcp add notas -- /ruta/a/venv/bin/python /ruta/servidor_notas.py` para `stdio` y `claude mcp add --transport http notas https://…/mcp` para remoto ([[docs/claude-code/07-mcp-en-claude-code]]).
- **Variables con `--env CLAVE=valor`** al añadirlo, o en el bloque `env` de la configuración.
- **Aprueba los servidores de proyecto** al abrir Claude Code, o revisa `claude mcp reset-project-choices` si los rechazaste.

## Cómo evitarlo

- Una prueba automática que arranque el servidor con `Client` y liste sus herramientas, en CI ([[cursos/mcp-de-cero-a-servidor/04-seguridad-y-despliegue]]).
- Documenta en el README el comando exacto de configuración, con rutas absolutas de ejemplo.
- Antes de instalar un servidor de terceros, revisa qué ejecuta y qué permisos pide ([[docs/seguridad/04-mcp-y-skills-de-terceros]]).

## Ver también

- [[docs/herramientas/02-mcp]]
- [[roadmap/20-herramientas/05-mcp-conectar-un-servidor]]
- [[docs/estandares/01-mcp-2026-07-28]]
- [[recetas/servidor-mcp-de-solo-lectura]]
