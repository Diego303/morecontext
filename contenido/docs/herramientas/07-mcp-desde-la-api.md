---
titulo: "MCP desde la API: el conector"
descripcion: Cómo conectar un servidor MCP remoto directamente en la petición a la API de Claude con mcp_servers y mcp_toolset, qué bloques devuelve y qué no puede hacer.
creado: 2026-10-29
orden: 7
nivel: intermedio
tags: [herramientas, mcp, api, beta]
aliases: [MCP connector, Conector MCP, mcp_toolset]
relacionados: ["[[docs/herramientas/02-mcp]]", "[[glosario/mcp]]", "[[docs/estandares/01-mcp-2026-07-28]]", "[[docs/seguridad/04-mcp-y-skills-de-terceros]]"]
---

El **conector MCP** de la API de Claude hace que **la propia API actúe como cliente [[glosario/mcp|MCP]]**: en la petición declaras uno o varios [[glosario/servidor-mcp|servidores MCP]] remotos con `mcp_servers` y una entrada `mcp_toolset` por servidor en `tools`. Anthropic se conecta al servidor, lista sus herramientas, las ofrece al modelo y ejecuta las llamadas; tú recibes la respuesta con bloques `mcp_tool_use` y `mcp_tool_result` ya resueltos. No escribes cliente MCP ni bucle para esas herramientas.

Está en **beta** en todos los modelos. Cómo funciona MCP por dentro está en [[docs/herramientas/02-mcp]] y la revisión vigente del protocolo en [[docs/estandares/01-mcp-2026-07-28]].

## Conector o cliente propio

| | Conector de la API | Tu propio cliente MCP |
|---|---|---|
| Quién habla con el servidor | La API de Anthropic | Tu proceso (SDK `mcp`, LangChain, Claude Agent SDK…) |
| Transporte | Solo HTTP público (Streamable HTTP o SSE), URL `https://` | Cualquiera, incluido `stdio` local |
| Qué se usa del servidor | **Solo herramientas** | Herramientas, *resources* y *prompts* |
| Control de cada llamada | Activar o desactivar herramientas; ves la llamada después | Total: validas, registras, pides aprobación antes |
| ZDR | No apto | Depende de tu despliegue |

El conector compensa para servidores remotos de confianza que solo aportan herramientas de lectura. Si necesitas aprobar cada llamada antes de que ocurra, un servidor local o *resources*, usa tu propio cliente: [[cursos/mcp-de-cero-a-servidor/02-usar-servidores-existentes]] o, con frameworks, [[recetas/herramientas-mcp-en-un-agente-langchain]]. El SDK de Python trae ayudas para ese camino (`anthropic.lib.tools.mcp`: `mcp_tool`, `async_mcp_tool`, `mcp_message`, `mcp_resource_to_content`) que convierten lo que devuelve tu cliente MCP a bloques de la API.

## Cabeceras beta

| Cabecera | Qué incluye |
|---|---|
| `mcp-client-2025-11-20` | `mcp_servers` + `mcp_toolset` con `default_config` y `configs` |
| `mcp-client-2026-09-15` | Todo lo anterior y además registra la lista de herramientas de cada servidor y permite **fijarla** (campo `tools` del `mcp_toolset`), para que un servidor que cambia sus herramientas no cambie lo que ve el modelo a mitad de conversación. Devuelve bloques `mcp_tool_listing` que debes reenviar sin tocar. Solo en la API de Claude |

`mcp-client-2025-04-04` está deprecada. Con `client.beta.messages.create(..., betas=[…])` el SDK pone la cabecera por ti.

## Declarar servidores y herramientas

**`mcp_servers`**, una entrada por servidor:

| Campo | Obligatorio | Qué es |
|---|---|---|
| `type` | Sí | `"url"` (único valor) |
| `url` | Sí | URL del servidor; debe empezar por `https://` |
| `name` | Sí | Identificador único; lo usa el `mcp_toolset` |
| `authorization_token` | No | Token OAuth si el servidor lo pide. El flujo OAuth y la renovación son cosa tuya |

**`mcp_toolset`**, una entrada en `tools` por cada servidor (exactamente una: un servidor sin toolset, o con dos, da error):

| Campo | Qué es |
|---|---|
| `mcp_server_name` | El `name` del servidor |
| `default_config` | `{"enabled": bool, "defer_loading": bool}` para todas sus herramientas (por defecto `true` y `false`) |
| `configs` | Por herramienta: `{"nombre": {"enabled": …, "defer_loading": …}}`. Gana sobre `default_config` |
| `cache_control` | Punto de corte de caché, como en cualquier herramienta |

Con estos dos campos haces lista blanca (`default_config.enabled: false` y activas las que quieres) o lista negra (todo activo menos las peligrosas). La documentación recomienda **desactivar las herramientas de escritura o destructivas** en asistentes de solo lectura. Un nombre en `configs` que no existe en el servidor no da error, solo un aviso interno: comprueba los nombres con `tools/list` antes. Con muchos servidores, `defer_loading` activa la [[docs/herramientas/05-busqueda-y-carga-diferida|carga diferida]] y necesitas una herramienta de búsqueda en `tools`.

## Qué llega en la respuesta

```json
[
  {"type": "mcp_tool_use", "id": "mcptoolu_01", "name": "buscar_tickets",
   "server_name": "tickets", "input": {"estado": "abierto"}},
  {"type": "mcp_tool_result", "tool_use_id": "mcptoolu_01", "is_error": false,
   "content": [{"type": "text", "text": "[{\"id\": 81, \"prioridad\": \"alta\"}]"}]}
]
```

No son `tool_use` ni `tool_result`: **no los ejecutes ni respondas**. Guárdalos en el historial con el resto de `resp.content`. Si en la misma respuesta el modelo pide además una herramienta tuya, llegará un `tool_use` normal con `stop_reason: "tool_use"`, y ese sí lo respondes.

## Ejemplo completo

Un asistente de guardia que consulta un servidor MCP de tickets (sin poder cerrarlos ni borrarlos) y usa una herramienta propia para avisar.

```python title="conector_mcp.py"
import os
import anthropic

MODEL = "claude-sonnet-5-5"
BETA_MCP = "mcp-client-2025-11-20"
MAX_PASOS = 10
client = anthropic.Anthropic()

MCP_SERVERS = [{
    "type": "url",
    "url": "https://mcp.ejemplo.com/mcp",               # Streamable HTTP; tiene que ser https
    "name": "tickets",
    "authorization_token": os.environ.get("TOKEN_TICKETS", ""),  # OAuth: lo obtienes y renuevas tú
}]
TOOLS = [
    {   # todas las herramientas del servidor, menos las de escritura
        "type": "mcp_toolset",
        "mcp_server_name": "tickets",
        "default_config": {"enabled": True, "defer_loading": False},
        "configs": {"borrar_ticket": {"enabled": False}, "cerrar_ticket": {"enabled": False}},
    },
    {   # una herramienta tuya, en el mismo bucle
        "name": "avisar_guardia",
        "description": "Envía un aviso a la persona de guardia. Úsala solo con tickets de prioridad alta.",
        "input_schema": {"type": "object", "properties": {"resumen": {"type": "string"}}, "required": ["resumen"]},
    },
]

def avisar_guardia(resumen: str) -> str:
    print("AVISO:", resumen)
    return "Aviso enviado."

def agente(pregunta: str) -> str:
    mensajes = [{"role": "user", "content": pregunta}]
    for _ in range(MAX_PASOS):
        resp = client.beta.messages.create(
            model=MODEL, max_tokens=2048, betas=[BETA_MCP],
            mcp_servers=MCP_SERVERS, tools=TOOLS, messages=mensajes,
        )
        mensajes.append({"role": "assistant", "content": resp.content})
        for b in resp.content:   # las llamadas MCP ya vienen resueltas: solo se registran
            if b.type == "mcp_tool_use":
                print(f"[mcp] {b.server_name}.{b.name}({b.input})")
            elif b.type == "mcp_tool_result" and b.is_error:
                print("[mcp] error:", b.content)
        if resp.stop_reason == "pause_turn":
            continue
        if resp.stop_reason != "tool_use":
            return "".join(b.text for b in resp.content if b.type == "text")
        mensajes.append({"role": "user", "content": [
            {"type": "tool_result", "tool_use_id": b.id, "content": avisar_guardia(**b.input)}
            for b in resp.content if b.type == "tool_use"
        ]})
    raise RuntimeError("Sin terminar")

print(agente("¿Hay tickets abiertos urgentes?"))
```

Probado con el simulador: la petición sale con la cabecera `anthropic-beta: mcp-client-2025-11-20`, la respuesta con `mcp_tool_use`, `mcp_tool_result` y un `tool_use` propio se procesa en una vuelta, y en la segunda petición el historial conserva los bloques MCP intactos. Tratar `pause_turn` es una precaución: el conector se ejecuta en el servidor como las demás herramientas del servidor.

## Servidores privados, Batch y retención

- **Servidores privados.** El conector solo llega a URLs públicas. Para servidores en tu red existen los **túneles MCP** (`/v1/tunnels`, en el SDK `client.beta.tunnels`, cabecera `mcp-tunnels-2026-06-22`), en vista previa de investigación. Si no puedes usarlos, conecta el servidor desde tu proceso.
- **Batch.** `mcp_servers` funciona en lotes, al mismo precio por llamada.
- **ZDR.** El conector **no** está cubierto por acuerdos de retención cero: las definiciones y los resultados que pasan por él se retienen según la política estándar. Si tus datos lo exigen, no lo uses para ellos.
- **Managed Agents** usa este mismo conector, con credenciales OAuth guardadas en *vaults*: ver [[docs/agentes/04-managed-agents]].

> [!peligro] El servidor entra en tu perímetro
> Todo lo que devuelve un servidor MCP llega al contexto del modelo y puede traer instrucciones ([[glosario/envenenamiento-de-herramientas|envenenamiento de herramientas]]). Con el conector, además, la llamada ya ha ocurrido cuando la ves. Conecta solo servidores de confianza, desactiva lo que escribe y no mezcles en la misma conversación datos privados, contenido no fiable y herramientas que envían datos fuera ([[glosario/trifecta-letal]]). Más en [[docs/seguridad/04-mcp-y-skills-de-terceros]].

## Errores frecuentes

- **Un servidor en `mcp_servers` sin su `mcp_toolset`**, o con dos. Cada servidor, exactamente un toolset.
- **Intentar conectar un servidor `stdio`** o una URL `http://`. Solo HTTPS remoto.
- **Esperar *resources* o *prompts*.** El conector solo trae herramientas.
- **Responder a un `mcp_tool_use`.** Ya está ejecutado.
- **Token caducado.** El conector no hace el flujo OAuth ni renueva tokens: renuévalo en tu código antes de cada conversación larga.
- **Olvidar la cabecera beta** o mezclar `mcp_tool_listing` sin seguir enviando `mcp-client-2026-09-15`.

## Ver también

- [[docs/herramientas/02-mcp]]: el protocolo y cómo escribir un servidor.
- [[cursos/mcp-de-cero-a-servidor/04-seguridad-y-despliegue]]: desplegar un servidor remoto con autorización.
- [[docs/claude-code/07-mcp-en-claude-code]]: MCP desde Claude Code.
- [[docs/herramientas/05-busqueda-y-carga-diferida]]: muchos servidores sin llenar el contexto.
