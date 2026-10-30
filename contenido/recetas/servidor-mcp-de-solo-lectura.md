---
titulo: Servidor MCP de solo lectura
descripcion: Expón una base de datos SQLite a un agente mediante un servidor MCP en Python con MCPServer que solo puede leer, con límites de filas y de tiempo.
creado: 2026-09-03
actualizado: 2026-10-29
nivel: intermedio
minutos: 40
tema: herramientas
stack: [python, mcp, sqlite]
tags: [mcp, herramientas, seguridad, sqlite]
relacionados: ["[[sistemas/asistente-de-datos-con-mcp]]", "[[cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor]]", "[[docs/herramientas/02-mcp]]", "[[glosario/servidor-mcp]]"]
---

## Problema

Quieres que un agente responda preguntas sobre tus datos («¿cuánto ha facturado Ana López este mes?») consultando la base de datos directamente. Pero no quieres que, por un error o una [[glosario/inyeccion-de-prompt|inyección de prompt]], pueda ejecutar un `DELETE` o un `DROP TABLE`.

La solución es un [[glosario/servidor-mcp|servidor MCP]] que exponga herramientas de consulta y que sea **incapaz de escribir**, por diseño, en varias capas. [[glosario/mcp|MCP]] es el estándar abierto para conectar aplicaciones de IA con herramientas y datos ([especificación](https://modelcontextprotocol.io)). Cualquier *host* compatible podrá usar tu servidor.

## Ingredientes

- Python 3.10 o superior.
- `pip install "mcp>=2"`. Este código usa `MCPServer`, la API del SDK de Python en la serie 2.x. En la serie 1.x la clase se llamaba `FastMCP`, por si encuentras tutoriales antiguos (no la confundas con FastMCP, un proyecto independiente con el mismo nombre).
- Una base de datos SQLite. El paso 1 crea una de ejemplo.
- Opcional: Node.js para probar con MCP Inspector.

## Pasos

1. **Crea una base de datos de ejemplo.**

```python title="crear_db.py"
import sqlite3

conn = sqlite3.connect("tienda.db")
conn.executescript("""
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS pedidos;
CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT, ciudad TEXT);
CREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER REFERENCES clientes(id),
                      fecha TEXT, importe REAL, estado TEXT);
INSERT INTO clientes VALUES (1, 'Ana López', 'Valencia'), (2, 'Panadería Lola', 'Sevilla');
INSERT INTO pedidos VALUES (1, 1, '2026-10-01', 49.90, 'entregado'),
                           (2, 1, '2026-10-12', 120.00, 'enviado'),
                           (3, 2, '2026-10-15', 15.50, 'pendiente');
""")
conn.commit()
conn.close()
print("tienda.db creada")
```

2. **Escribe el servidor.** Tres herramientas: listar tablas, describir una tabla y consultar. La protección contra escrituras tiene tres capas independientes, porque cualquiera de ellas podría fallar por un descuido:
   - el archivo se abre con `mode=ro` (solo lectura a nivel de SQLite);
   - `PRAGMA query_only = ON` rechaza escrituras en la conexión;
   - un *authorizer* permite solo operaciones de lectura.

   Además limita las filas devueltas y corta las consultas que tardan demasiado. Los errores que el modelo debe leer se lanzan con `ToolError`: con cualquier otra excepción, el cliente solo recibe un mensaje genérico sin tu texto.

```python title="servidor.py"
import logging
import os
import sqlite3
import time

from mcp.server.mcpserver import MCPServer
from mcp.server.mcpserver.exceptions import ToolError

DB_PATH = os.environ.get("DB_PATH", "tienda.db")
MAX_FILAS = 200
MAX_SEGUNDOS = 5

# en stdio, stdout es el canal del protocolo: los logs van a stderr
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("tienda-mcp")

mcp = MCPServer("tienda-solo-lectura")


def _solo_lectura(accion, *args):
    # tercera capa: SQLite pregunta antes de cada operación y solo permitimos leer
    permitidas = {sqlite3.SQLITE_SELECT, sqlite3.SQLITE_READ, sqlite3.SQLITE_FUNCTION}
    return sqlite3.SQLITE_OK if accion in permitidas else sqlite3.SQLITE_DENY


def conectar() -> sqlite3.Connection:
    # primera capa: el archivo se abre en modo solo lectura (mode=ro)
    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    # segunda capa: la conexión rechaza cualquier escritura
    conn.execute("PRAGMA query_only = ON")
    conn.set_authorizer(_solo_lectura)
    # corta consultas que tarden demasiado
    limite = time.monotonic() + MAX_SEGUNDOS
    conn.set_progress_handler(lambda: 1 if time.monotonic() > limite else 0, 10_000)
    return conn


@mcp.tool()
def listar_tablas() -> list[str]:
    """Lista las tablas de la base de datos de la tienda. Úsala primero para saber qué hay."""
    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    try:
        filas = conn.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        ).fetchall()
        return [f[0] for f in filas]
    finally:
        conn.close()


@mcp.tool()
def describir_tabla(tabla: str) -> list[dict]:
    """Devuelve las columnas de una tabla (nombre y tipo). Úsala antes de escribir una consulta."""
    if tabla not in listar_tablas():
        raise ToolError(f"La tabla '{tabla}' no existe. Usa listar_tablas para ver las disponibles.")
    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    try:
        columnas = conn.execute(f'PRAGMA table_info("{tabla}")').fetchall()
        return [{"columna": c[1], "tipo": c[2]} for c in columnas]
    finally:
        conn.close()


@mcp.tool()
def consultar(sql: str, limite: int = 50) -> dict:
    """Ejecuta UNA consulta SELECT de solo lectura sobre la base de datos de la tienda.

    Devuelve columnas y filas. Como máximo `limite` filas (1-200); si hay más, `truncado` es true
    y conviene filtrar o agregar (WHERE, GROUP BY, COUNT). Cualquier escritura se rechaza.
    """
    texto = sql.strip().rstrip(";")
    if not texto.lower().startswith(("select", "with")):
        raise ToolError("Solo se permiten consultas SELECT (o WITH ... SELECT).")
    limite = max(1, min(limite, MAX_FILAS))
    conn = conectar()
    try:
        cursor = conn.execute(texto)
        filas = cursor.fetchmany(limite + 1)
        columnas = [d[0] for d in cursor.description]
    except sqlite3.Error as e:
        raise ToolError(f"La consulta falló: {e}. Revisa nombres con describir_tabla.") from e
    finally:
        conn.close()
    log.info("consulta ok: %s filas", len(filas))
    return {
        "columnas": columnas,
        "filas": [list(f) for f in filas[:limite]],
        "truncado": len(filas) > limite,
    }


if __name__ == "__main__":
    mcp.run()  # transporte stdio por defecto
```

3. **Pruébalo con un cliente MCP en Python.** `Client`, el cliente de alto nivel del SDK 2.x, lanza el servidor como subproceso por `stdio`, lista sus herramientas e intenta escribir. Con la revisión `2026-07-28` de la especificación no hay saludo `initialize` ni sesión: cada petición lleva su versión y sus capacidades ([[docs/estandares/01-mcp-2026-07-28]]).

```python title="probar_cliente.py"
import asyncio
import json
import sys

from mcp import Client, StdioServerParameters

PARAMS = StdioServerParameters(command=sys.executable, args=["servidor.py"], env={"DB_PATH": "tienda.db"})


async def main():
    async with Client(PARAMS) as cliente:
        herramientas = await cliente.list_tools()
        print("Herramientas:", [h.name for h in herramientas.tools])

        ok = await cliente.call_tool("consultar", {"sql": "SELECT nombre, ciudad FROM clientes"})
        print("SELECT:", json.loads(ok.content[0].text)["filas"])

        for sql in ["DELETE FROM pedidos", "WITH x AS (SELECT 1) DELETE FROM pedidos",
                    "SELECT 1; DROP TABLE pedidos"]:
            malo = await cliente.call_tool("consultar", {"sql": sql})
            print("Rechazada:" if malo.is_error else "¡ACEPTADA!", malo.content[0].text[:90])


asyncio.run(main())
```

En tutoriales anteriores verás `stdio_client` + `ClientSession` + `await sesion.initialize()`. En el SDK 2.x sigue funcionando como vía de compatibilidad con servidores antiguos, pero para código nuevo usa `Client`. En los tests también puedes pasarle la instancia del servidor (`Client(mcp)`) y probarlo en el mismo proceso, sin subproceso.

4. **Conéctalo a tu host.** En un cliente de escritorio compatible con MCP se declara así (la ubicación del archivo depende del host):

```json title="config.json"
{
  "mcpServers": {
    "tienda": {
      "command": "python",
      "args": ["/ruta/absoluta/servidor.py"],
      "env": { "DB_PATH": "/ruta/absoluta/tienda.db" }
    }
  }
}
```

También puedes inspeccionarlo en el navegador con `npx @modelcontextprotocol/inspector python servidor.py`. Cómo conectarlo a tu propio agente lo explica [[roadmap/20-herramientas/05-mcp-conectar-un-servidor]].

## Cómo comprobar que funciona

```text
# salida de ejemplo
Herramientas: ['listar_tablas', 'describir_tabla', 'consultar']
SELECT: [['Ana López', 'Valencia'], ['Panadería Lola', 'Sevilla']]
Rechazada: Error executing tool consultar: Solo se permiten consultas SELECT (o WITH ... SELECT).
Rechazada: Error executing tool consultar: La consulta falló: not authorized. Revisa nombres con desc
Rechazada: Error executing tool consultar: La consulta falló: You can only execute one statement at a
```

- Los mensajes llegan con el prefijo `Error executing tool consultar: ` que añade el SDK a cada `ToolError`, y `is_error` vale `True`.
- La segunda consulta (`WITH x AS (SELECT 1) DELETE …`) pasa el filtro de texto, pero la para el *authorizer*. Por eso no basta con mirar si empieza por `SELECT`.
- Comprueba el archivo: `sqlite3 tienda.db "SELECT count(*) FROM pedidos"` debe seguir dando 3.
- Pregunta al agente algo que requiera un `JOIN` y revisa en los logs (stderr) qué SQL generó.

## Variaciones

- **PostgreSQL o MySQL.** Crea un usuario de base de datos con permiso `SELECT` solo sobre las tablas necesarias, y abre la transacción en modo de solo lectura. El permiso en la base de datos es la capa principal: el resto es defensa adicional ([[glosario/minimo-privilegio]]).
- **Vistas en lugar de tablas.** Expón vistas que ya excluyan columnas sensibles (correos, teléfonos) y filtren filas. El agente no puede filtrar lo que no ve.
- **Consultas predefinidas.** Para usuarios finales, en vez de SQL libre, ofrece herramientas concretas (`ventas_por_cliente(cliente, mes)`). Menos flexibles, más seguras y más fáciles de usar para el modelo ([[disciplinas/diseno-de-herramientas]]).
- **Desde un agente de LangChain.** `MCPAdapter` (en `pip install "langchain[mcp,anthropic]"`, beta, compatible con `mcp` 2.x) lanza el servidor por `stdio` y convierte sus herramientas en herramientas de LangChain. Un `ToolError` llega al modelo como `ToolMessage` con `status="error"`, así que el agente puede corregir su SQL. No mezcles en el mismo entorno el paquete antiguo `langchain-mcp-adapters`: exige `mcp<2`. Más en [[recetas/herramientas-mcp-en-un-agente-langchain]].

```python title="agente_langchain.py"
import asyncio
import warnings
from pathlib import Path

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_core._api import LangChainBetaWarning

warnings.filterwarnings("ignore", category=LangChainBetaWarning)  # langchain.mcp avisa de que es beta
from langchain.mcp import MCPAdapter  # noqa: E402

MODEL = "anthropic:claude-sonnet-5-5"
SERVIDOR = Path(__file__).with_name("servidor.py")  # un Path se lanza por stdio; un str tiene que ser una URL


async def main(pregunta: str, model=None):
    async with MCPAdapter(SERVIDOR) as mcp:
        tools = await mcp.list_tools()
        agente = create_agent(model or init_chat_model(MODEL, max_tokens=1024), tools,
                              system_prompt="Respondes con datos de la tienda. Mira el esquema antes de consultar.")
        r = await agente.ainvoke({"messages": [("user", pregunta)]})
        return r["messages"][-1].content


if __name__ == "__main__":
    print(asyncio.run(main("¿Cuánto ha gastado Ana López en total?")))
```

- **Resources.** Publica el esquema de la base de datos como *resource* MCP para que el host lo cargue en contexto sin gastar una llamada a herramienta.
- **Remoto.** Para servir a varios usuarios, usa el transporte *Streamable HTTP* con autenticación. Lo trata [[cursos/mcp-de-cero-a-servidor/04-seguridad-y-despliegue]].

## Errores típicos

- **Confiar solo en el prompt** («no ejecutes escrituras»). El control tiene que estar en la conexión.
- **Validar solo que empiece por `SELECT`.** Los CTE con `DELETE`, las sentencias múltiples y algunas funciones se cuelan. Usa permisos reales.
- **Imprimir en stdout.** En transporte `stdio`, stdout es el canal del protocolo y cualquier `print` lo corrompe. Los logs van a stderr.
- **Devolver tablas enteras.** Sin límite de filas, una consulta puede devolver miles de filas y llenar el contexto del agente. Limita y avisa con `truncado`.
- **Mensajes de error opacos.** «Error» no ayuda al modelo a corregir. Di qué falló y qué herramienta usar para arreglarlo.
- **Exponer datos personales sin necesidad.** Solo lectura no significa sin riesgo: lo que el servidor devuelve llega al contexto del modelo y a tus trazas.
