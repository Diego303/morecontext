---
titulo: Servidor MCP sin estado con handles
descripcion: Migra un servidor MCP que guardaba estado por sesión a handles explícitos que el modelo pasa como argumento, como pide la especificación 2026-07-28, con mcp 2.3 y pruebas en proceso.
creado: 2026-10-29
nivel: intermedio
minutos: 30
tema: herramientas
stack: ["Python", "MCP"]
tags: [mcp, servidor-mcp, sin-estado, herramientas, produccion]
relacionados: ["[[docs/estandares/01-mcp-2026-07-28]]", "[[radar/2026-10-25-mcp-sin-estado]]", "[[recetas/servidor-mcp-de-solo-lectura]]", "[[glosario/servidor-mcp]]"]
---

## Problema

Tienes un [[glosario/servidor-mcp|servidor MCP]] de pedidos con tres herramientas: `crear_borrador`, `anadir_linea` y `confirmar_pedido`. El borrador en curso vivía en memoria, asociado a la sesión: «el pedido de esta conexión». Con la serie 1.x y un solo proceso funcionaba.

La revisión `2026-07-28` de [[glosario/mcp|MCP]] es **sin estado**: desaparecen el saludo `initialize` y la cabecera `Mcp-Session-Id`, y cada petición lleva su versión y capacidades en `_meta` ([[docs/estandares/01-mcp-2026-07-28]]). Ya no hay nada que ate una llamada con la anterior. La ventaja es que el servidor escala detrás de un balanceador normal; el precio es que el estado entre llamadas tiene que ir en *handles* que crea el servidor y que el modelo pasa como argumento.

Con `mcp` 2.3.0 el fallo se ve incluso en local. Este es el servidor antiguo:

```python title="antes_mcp.py"
from mcp.server.mcpserver import Context, MCPServer
from mcp.server.mcpserver.exceptions import ToolError

mcp = MCPServer("pedidos")
BORRADORES: dict[int, list[dict]] = {}  # estado implícito: un borrador por sesión


@mcp.tool()
def crear_borrador(ctx: Context) -> str:
    """Empieza un pedido nuevo."""
    BORRADORES[id(ctx.session)] = []
    return "Borrador creado."


@mcp.tool()
def anadir_linea(sku: str, cantidad: int, ctx: Context) -> str:
    """Añade una línea al pedido en curso."""
    if id(ctx.session) not in BORRADORES:
        raise ToolError("No hay ningún borrador en curso.")
    BORRADORES[id(ctx.session)].append({"sku": sku, "cantidad": cantidad})
    return f"{len(BORRADORES[id(ctx.session)])} líneas"
```

Al llamarlo con `mcp.Client` en proceso, `anadir_linea` falla ya en la misma conexión: cada petición llega con su propio objeto de sesión (comprobado: dos llamadas seguidas del mismo cliente no comparten `ctx.session`).

```text
misma conexión: True Error executing tool anadir_linea: No hay ningún borrador en curso.
otra conexión: True Error executing tool anadir_linea: No hay ningún borrador en curso.
```

## Ingredientes

- Python 3.10 o superior y `pip install "mcp[cli]>=2.3"` (`MCPServer`, protocolo `2026-07-28`).
- Un almacén compartido entre réplicas para producción (Redis, Postgres…). En la receta, uno en memoria detrás de una interfaz.
- Haber hecho un servidor básico ([[cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor]] o [[recetas/servidor-mcp-de-solo-lectura]]).

## Pasos

1. **Haz explícito el estado.** La herramienta que empieza algo (`crear_borrador`) devuelve un identificador; las demás lo reciben como primer argumento. El estado deja de ser «lo de esta conexión» y pasa a ser «lo de `brd_…`».

2. **Genera handles opacos e imposibles de adivinar.** `secrets.token_urlsafe(16)` con un prefijo por tipo (`brd_`) que ayuda al modelo y a tus logs. Nunca un contador ni un id de base de datos: el modelo los pasa en texto y cualquiera que vea la conversación podría probar el siguiente.

3. **Liga cada handle a su propietario.** Guarda quién lo creó y compruébalo en cada uso. `authenticated_principal(ctx.request_context)` devuelve la identidad autenticada (cliente, emisor y sujeto de OAuth) o `None` sin autenticación, como en stdio o en tests. Ante un handle ajeno, responde lo mismo que ante uno inexistente para no revelar que existe.

4. **Ponles caducidad y guárdalos fuera del proceso.** Un TTL que se renueva al escribir. En producción, el almacén es compartido: si cada réplica tuviera su diccionario, volverías al problema del principio.

5. **Escribe errores que enseñen a recuperarse.** `ToolError` llega al modelo con el prefijo `Error executing tool <nombre>: `. Di qué hacer: «crea uno con `crear_borrador`». Y protege las operaciones que no deben repetirse: confirmar dos veces el mismo borrador es un error, no un segundo pedido.

6. **Documenta el handle en la herramienta.** El *docstring* es la descripción que ve el modelo ([[disciplinas/diseno-de-herramientas]]): di de dónde sale el valor y que hay que guardarlo. Devolver un modelo Pydantic genera el `outputSchema` y el `structured_content`, así el handle no se pierde en texto libre.

```python title="borradores.py"
import secrets
import time
from typing import Protocol

from pydantic import BaseModel

from mcp.server.mcpserver import Context, MCPServer, authenticated_principal
from mcp.server.mcpserver.exceptions import ToolError

TTL = 30 * 60  # un borrador caduca a los 30 minutos sin uso
CATALOGO = {"A-1": 12.5, "B-7": 3.0, "C-3": 40.0}


class Linea(BaseModel):
    sku: str
    cantidad: int


class Borrador(BaseModel):
    borrador: str          # el handle: el modelo lo pasa en cada llamada
    lineas: list[Linea]
    total: float


class Almacen(Protocol):
    """En producción, compartido entre réplicas (Redis, Postgres…); aquí, en memoria."""
    def guardar(self, clave: str, valor: dict, ttl: int) -> None: ...
    def leer(self, clave: str) -> dict | None: ...


class EnMemoria:
    def __init__(self):
        self._datos: dict[str, tuple[float, dict]] = {}

    def guardar(self, clave, valor, ttl):
        self._datos[clave] = (time.monotonic() + ttl, valor)

    def leer(self, clave):
        caduca, valor = self._datos.get(clave, (0.0, None))
        return valor if time.monotonic() < caduca else None


almacen: Almacen = EnMemoria()
mcp = MCPServer("pedidos", instructions="Crea un borrador, añade líneas y confírmalo. "
                "Pasa siempre el identificador de borrador que te devolvió crear_borrador.")


def propietario(ctx: Context) -> str:
    # con OAuth: (cliente, emisor, sujeto); sin autenticación (stdio, tests): None
    return authenticated_principal(ctx.request_context) or "anonimo"


def cargar(borrador: str, ctx: Context) -> dict:
    estado = almacen.leer(borrador)
    if estado is None or estado["propietario"] != propietario(ctx):  # mismo error: no reveles si existe
        raise ToolError(f"El borrador {borrador} no existe o ha caducado. Crea uno con crear_borrador.")
    if estado["confirmado"]:
        raise ToolError(f"El borrador {borrador} ya se confirmó como pedido {estado['pedido']}.")
    return estado


def vista(borrador: str, estado: dict) -> Borrador:
    lineas = [Linea(**l) for l in estado["lineas"]]
    return Borrador(borrador=borrador, lineas=lineas, total=sum(CATALOGO[l.sku] * l.cantidad for l in lineas))


@mcp.tool()
def crear_borrador(ctx: Context) -> Borrador:
    """Empieza un pedido vacío y devuelve su identificador (brd_…). Guárdalo: lo piden las demás herramientas."""
    borrador = "brd_" + secrets.token_urlsafe(16)  # opaco e imposible de adivinar
    estado = {"propietario": propietario(ctx), "lineas": [], "confirmado": False, "pedido": None}
    almacen.guardar(borrador, estado, TTL)
    return vista(borrador, estado)


@mcp.tool()
def anadir_linea(borrador: str, sku: str, cantidad: int, ctx: Context) -> Borrador:
    """Añade una línea al borrador indicado (el brd_… de crear_borrador). SKU del catálogo, cantidad de 1 a 99."""
    estado = cargar(borrador, ctx)
    if sku not in CATALOGO:
        raise ToolError(f"SKU desconocido: {sku}. Válidos: {', '.join(CATALOGO)}.")
    if not 1 <= cantidad <= 99:
        raise ToolError("La cantidad va de 1 a 99.")
    estado["lineas"].append({"sku": sku, "cantidad": cantidad})
    almacen.guardar(borrador, estado, TTL)  # escribir renueva la caducidad
    return vista(borrador, estado)


@mcp.tool()
def confirmar_pedido(borrador: str, ctx: Context) -> str:
    """Convierte el borrador en pedido. Solo una vez por borrador."""
    estado = cargar(borrador, ctx)
    if not estado["lineas"]:
        raise ToolError("El borrador está vacío: añade al menos una línea.")
    estado.update(confirmado=True, pedido="P-" + secrets.token_hex(3).upper())
    almacen.guardar(borrador, estado, TTL)
    return f"Pedido {estado['pedido']} creado con {len(estado['lineas'])} líneas."


if __name__ == "__main__":
    mcp.run()  # stdio; detrás de un balanceador: mcp.run(transport="streamable-http")
```

## Cómo comprobar que funciona

La prueba crea el borrador con un cliente y sigue con otro, como si las peticiones cayeran en réplicas distintas:

```python title="probar_borradores.py"
import asyncio
import logging

from mcp import Client

from borradores import mcp

logging.disable(logging.INFO)


async def main():
    async with Client(mcp) as a:
        r = await a.call_tool("crear_borrador", {})
        h = r.structured_content["borrador"]
        print("creado:", h[:8] + "…", "| protocolo:", a.protocol_version)
    async with Client(mcp) as b:  # otra conexión: como otra réplica detrás del balanceador
        r = await b.call_tool("anadir_linea", {"borrador": h, "sku": "A-1", "cantidad": 2})
        print("otra conexión:", r.is_error, r.structured_content["total"])
        r = await b.call_tool("anadir_linea", {"borrador": "brd_inventado", "sku": "A-1", "cantidad": 1})
        print("handle falso:", r.is_error, r.content[0].text)
        r = await b.call_tool("confirmar_pedido", {"borrador": h})
        print("confirmar:", r.is_error, r.content[0].text[:23] + "…")
        r = await b.call_tool("confirmar_pedido", {"borrador": h})
        print("otra vez:", r.is_error, r.content[0].text[:70] + "…")
        t = {x.name: x for x in (await b.list_tools()).tools}["anadir_linea"]
        print("anadir_linea pide:", t.input_schema["required"], "| outputSchema:", bool(t.output_schema))

asyncio.run(main())
```

Salida real con `mcp` 2.3.0 (el handle y el número de pedido cambian en cada ejecución):

```text
creado: brd_EgoG… | protocolo: 2026-07-28
otra conexión: False 25.0
handle falso: True Error executing tool anadir_linea: El borrador brd_inventado no existe o ha caducado. Crea uno con crear_borrador.
confirmar: False Pedido P-0551D0 creado …
otra vez: True Error executing tool confirmar_pedido: El borrador brd_EgoGrqz2p7KO6yG…
anadir_linea pide: ['borrador', 'sku', 'cantidad'] | outputSchema: True
```

El handle sobrevive al cambio de conexión, un handle inventado recibe el mismo error que uno caducado y el segundo `confirmar_pedido` se rechaza. Después, conecta el servidor a un cliente real (Claude Code, Claude Desktop o tu agente) y pide «haz un pedido de dos A-1 y un C-3»: en la traza deberías ver el mismo `brd_…` en las tres llamadas. Si no aparece, revisa [[problemas/servidor-mcp-no-aparece]].

## Variaciones

- **Handle autocontenido.** Si el estado es pequeño (un cursor de paginación, unos filtros), no lo guardes: codifícalo en el propio handle y fírmalo con `hmac` y una clave del servidor, con la caducidad dentro. No necesitas almacén, pero el contenido viaja por el contexto: no metas datos sensibles sin cifrar.
- **Estado de varias rondas en una misma petición.** Si una herramienta necesita pedir datos al usuario a mitad, eso ya no va por sesión sino por MRTR (`input_required`) con un `requestState` que el SDK sella y verifica (`RequestStateSecurity`). Es otro mecanismo, para una sola llamada; los handles son para estado entre llamadas ([[glosario/mrtr]]).
- **TypeScript.** Con el SDK v2 (`@modelcontextprotocol/server`), el patrón es el mismo: `registerTool` con el handle como campo de `inputSchema`.
- **Listas deterministas.** Ya que tocas el servidor, devuelve las herramientas siempre en el mismo orden: lo recomienda la especificación y ayuda a la caché del modelo ([[recetas/diagnosticar-fallos-de-cache]]).

## Errores típicos

- **Guardar en un `dict` global y escalar a varias réplicas.** Funciona en tu portátil y falla un porcentaje de veces en producción, según a qué réplica vaya cada petición.
- **Handles secuenciales (`borrador-1`, `borrador-2`).** Un modelo manipulado por una [[glosario/inyeccion-de-prompt|inyección]] o un usuario curioso prueba el siguiente. Opacos y ligados al propietario.
- **No comprobar el propietario.** Un handle filtrado en un log o en otra conversación da acceso al estado de otro usuario.
- **Sin caducidad.** El almacén crece para siempre con borradores abandonados.
- **Esconder el handle en texto libre.** Si solo va en una frase, el modelo puede reescribirlo mal. Devuélvelo como campo estructurado y nómbralo igual en todas las herramientas.
- **Confiar en `ctx.session` o en cabeceras para identificar al usuario.** Las cabeceras las pone el cliente y la sesión ya no existe entre peticiones. La identidad sale de la autenticación ([[cursos/mcp-de-cero-a-servidor/04-seguridad-y-despliegue]]).
