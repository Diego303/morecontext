---
titulo: Claude Agent SDK
descripcion: "Referencia del Claude Agent SDK, el harness de Claude Code como librería: query() y ClaudeSDKClient, opciones, herramientas MCP en proceso, hooks, permisos, subagentes, sesiones y condiciones."
creado: 2026-10-29
orden: 3
nivel: intermedio
tags: [frameworks, claude-agent-sdk, claude-code, agentes, python, typescript]
relacionados: ["[[herramientas/claude-agent-sdk]]", "[[recetas/agente-con-claude-agent-sdk]]", "[[docs/claude-code/index]]", "[[docs/agentes/04-managed-agents]]"]
---

El **Claude Agent SDK** es Claude Code convertido en librería: el mismo bucle agéntico, las mismas herramientas integradas (`Read`, `Edit`, `Bash`, `Grep`, `WebSearch`…), la misma gestión de contexto, y los mismos [[docs/claude-code/04-hooks|hooks]], [[docs/claude-code/02-subagentes|subagentes]], permisos, sesiones, *skills* y `CLAUDE.md`, pero dentro de tu programa. Existe para Python (`claude-agent-sdk` 0.2.174, 24 de octubre de 2026) y TypeScript (`@anthropic-ai/claude-agent-sdk` 0.3.312, 27 de octubre de 2026). Desde otros lenguajes, el equivalente es `claude -p --output-format json` ([[docs/claude-code/08-modo-headless-y-ci]]).

A diferencia del resto de este grupo, **no es open source**: se usa bajo los términos comerciales de Anthropic (detalles al final). Y solo funciona con modelos Claude.

## Dónde encaja

Anthropic ofrece cuatro formas de construir un agente. La diferencia está en quién escribe el bucle y dónde corre:

| Producto | El bucle | Úsalo para |
|---|---|---|
| SDK de cliente (`anthropic`) | Lo escribes tú | Control total, aprender el mecanismo ([[roadmap/40-primer-agente/02-el-bucle-agentico]]) |
| **Claude Agent SDK** | El de Claude Code, en tu proceso | Agentes que trabajan con archivos, terminal y web sin reconstruir el harness |
| CLI de Claude Code | El de Claude Code, interactivo | Programar a mano con un agente ([[docs/claude-code/index]]) |
| Managed Agents | El de Anthropic, en su infraestructura | Ejecutar el agente y su sandbox como servicio ([[docs/agentes/04-managed-agents]]) |

Elige el Agent SDK cuando tu agente se parece a un agente de código (lee y edita archivos, ejecuta comandos, busca) y no quieres escribir tú las herramientas, la compactación ni los permisos. Si tu agente solo llama a tres funciones de tu API, el SDK de cliente es más simple y más barato.

## Instalación

```bash
pip install claude-agent-sdk                     # trae el CLI de Claude Code empaquetado
npm install @anthropic-ai/claude-agent-sdk zod   # TypeScript; Node 18.14 o superior
export ANTHROPIC_API_KEY=...                     # o Bedrock, Vertex AI o Foundry
```

El paquete de Python incluye el CLI de Claude Code (la 0.2.174 trae la 2.1.310): el SDK lo lanza como subproceso y habla con él. Por eso hay opciones como `cli_path` o `stderr`.

## `query()` y `ClaudeSDKClient`

- **`query(prompt=…, options=…)`**: una tarea, de principio a fin. Devuelve un iterador asíncrono de mensajes (`AssistantMessage`, `UserMessage`, `SystemMessage`, `ResultMessage`, `StreamEvent`…). Lo normal para scripts y trabajos en lote.
- **`ClaudeSDKClient(options)`**: una conversación con varios turnos sobre el mismo contexto. Métodos: `connect`, `query`, `receive_response`, `receive_messages`, `interrupt`, `set_model`, `set_permission_mode`, `get_context_usage`, `get_mcp_status`, `rewind_files`, `disconnect`. Se usa con `async with`.

El último mensaje de cada tarea es un **`ResultMessage`** con `subtype`, `num_turns`, `duration_ms`, `total_cost_usd`, `usage`, `session_id`, `stop_reason`, `result`, `structured_output`, `permission_denials` y `errors`. Regístralo siempre: es tu traza mínima ([[docs/produccion/01-observabilidad]]).

## Ejemplo completo

Un agente con una herramienta propia, un hook que bloquea un comando peligroso, una política de permisos, un subagente revisor y topes de turnos y de gasto.

```python tab="Python" title="agente_claude_sdk.py"
import asyncio
from typing import Any

from claude_agent_sdk import (AgentDefinition, AssistantMessage, ClaudeAgentOptions, HookMatcher,
                              PermissionResultAllow, PermissionResultDeny, ResultMessage, TextBlock,
                              ToolPermissionContext, create_sdk_mcp_server, query, tool)

MODEL = "claude-sonnet-5-5"


# 1. Herramienta propia: un servidor MCP que corre dentro de tu proceso
@tool("contar_palabras", "Cuenta las palabras de un texto", {"texto": str})
async def contar_palabras(args: dict[str, Any]) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": str(len(args["texto"].split()))}]}

utilidades = create_sdk_mcp_server(name="utilidades", version="1.0.0", tools=[contar_palabras])


# 2. Hook: se ejecuta antes de CADA llamada a Bash, la apruebe quien la apruebe
async def bloquear_rm(input_data: dict[str, Any], tool_use_id: str | None, context: Any) -> dict[str, Any]:
    if "rm -rf" in input_data.get("tool_input", {}).get("command", ""):
        return {"hookSpecificOutput": {"hookEventName": "PreToolUse",
                "permissionDecision": "deny", "permissionDecisionReason": "rm -rf no está permitido"}}
    return {}


# 3. Permisos: solo se consulta cuando las reglas dirían «ask»
async def decidir(nombre: str, entrada: dict[str, Any], ctx: ToolPermissionContext):
    if nombre == "Write" and str(entrada.get("file_path", "")).endswith(".env"):
        return PermissionResultDeny(message="No se escriben secretos")
    return PermissionResultAllow()


opciones = ClaudeAgentOptions(
    model=MODEL,
    system_prompt={"type": "preset", "preset": "claude_code", "append": "Responde en español."},
    setting_sources=["project"],                       # carga CLAUDE.md del proyecto; [] = aislado
    allowed_tools=["Read", "Grep", "Glob", "mcp__utilidades__contar_palabras"],   # aprueba sin preguntar
    permission_mode="default",
    mcp_servers={"utilidades": utilidades},
    hooks={"PreToolUse": [HookMatcher(matcher="Bash", hooks=[bloquear_rm])]},
    can_use_tool=decidir,
    agents={"revisor": AgentDefinition(description="Revisa código; úsalo tras cambios.",
                                       prompt="Eres un revisor estricto.", tools=["Read", "Grep", "Glob"],
                                       model="haiku")},
    max_turns=20,
    max_budget_usd=1.0,                                # tope de gasto de la ejecución
    effort="medium",
)


async def main() -> None:
    async for m in query(prompt="Cuenta las palabras de README.md", options=opciones):
        if isinstance(m, AssistantMessage):
            for b in m.content:
                if isinstance(b, TextBlock):
                    print(b.text)
        elif isinstance(m, ResultMessage):
            print("fin:", m.subtype, "| coste USD:", m.total_cost_usd, "| sesión:", m.session_id)


if __name__ == "__main__":
    asyncio.run(main())
```

```ts tab="TypeScript" title="agente_claude_sdk.ts"
import { query, tool, createSdkMcpServer, type HookCallback } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const MODEL = "claude-sonnet-5-5";

const contarPalabras = tool(
  "contar_palabras",
  "Cuenta las palabras de un texto",
  { texto: z.string() },
  async ({ texto }) => ({ content: [{ type: "text", text: String(texto.split(/\s+/).filter(Boolean).length) }] }),
);

const utilidades = createSdkMcpServer({ name: "utilidades", version: "1.0.0", tools: [contarPalabras] });

const bloquearRm: HookCallback = async (input) => {
  if (input.hook_event_name === "PreToolUse") {
    const cmd = String((input.tool_input as { command?: string }).command ?? "");
    if (cmd.includes("rm -rf")) {
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: "rm -rf no está permitido",
        },
      };
    }
  }
  return {};
};

for await (const mensaje of query({
  prompt: "Cuenta las palabras de README.md",
  options: {
    model: MODEL,
    systemPrompt: { type: "preset", preset: "claude_code", append: "Responde en español." },
    settingSources: ["project"],
    allowedTools: ["Read", "Grep", "Glob", "mcp__utilidades__contar_palabras"],
    permissionMode: "default",
    mcpServers: { utilidades },
    hooks: { PreToolUse: [{ matcher: "Bash", hooks: [bloquearRm] }] },
    canUseTool: async (nombre, entrada) =>
      nombre === "Write" && String(entrada.file_path ?? "").endsWith(".env")
        ? { behavior: "deny", message: "No se escriben secretos" }
        : { behavior: "allow", updatedInput: entrada },
    agents: {
      revisor: {
        description: "Revisa código en busca de errores; úsalo tras cambios.",
        prompt: "Eres un revisor de código estricto. Señala solo problemas reales.",
        tools: ["Read", "Grep", "Glob"],
        model: "haiku",
      },
    },
    maxTurns: 20,
    maxBudgetUsd: 1,
    effort: "medium",
  },
})) {
  if (mensaje.type === "assistant") {
    for (const b of mensaje.message.content) if (b.type === "text") console.log(b.text);
  } else if (mensaje.type === "result") {
    console.log("coste USD:", mensaje.total_cost_usd, "sesión:", mensaje.session_id);
  }
}
```

La versión Python se importó y construyó sin errores, y su herramienta, su hook y su callback de permisos se ejecutaron en local con una prueba de `pytest` (sin llamar a la API: el SDK necesita Claude de verdad para el bucle). La versión TypeScript compila con `tsc --strict`.

## Opciones que más importan

`ClaudeAgentOptions` tiene más de cuarenta campos. Estos son los que deciden si el agente es seguro y predecible (en TypeScript, en camelCase):

| Opción | Qué hace | Cuidado con |
|---|---|---|
| `tools` | Qué herramientas integradas **existen**: lista de nombres, `[]` para ninguna o el preset `claude_code` | Es lo que limita de verdad |
| `allowed_tools` | Qué herramientas se **aprueban sin preguntar** | No limita: las demás siguen existiendo y pasan por permisos |
| `disallowed_tools` | Herramientas que se quitan | |
| `permission_mode` | `default`, `acceptEdits`, `plan`, `bypassPermissions`, `dontAsk`, `auto` (un clasificador decide cada llamada) | `bypassPermissions` solo en un entorno aislado |
| `system_prompt` | `None` (el del CLI), `{"type": "preset", "preset": "claude_code", "append": …}`, `{"type": "custom", "prompt": …}` o `{"type": "file", "path": …}` | |
| `setting_sources` | Qué ajustes de disco carga: `None` = todos (usuario, proyecto, local), `[]` = ninguno, `["project"]` para `CLAUDE.md` | El valor por defecto lee la configuración de la máquina donde corre |
| `max_turns`, `max_budget_usd`, `task_budget` | Topes de turnos y de gasto ([[roadmap/40-primer-agente/03-condiciones-de-parada]]) | Ponlos siempre |
| `model`, `fallback_model`, `effort`, `thinking` | Modelo y razonamiento ([[docs/prompting/04-razonamiento]]) | |
| `cwd`, `add_dirs`, `sandbox` | Directorio de trabajo, carpetas extra y sandbox de Bash | |
| `output_format` | Esquema JSON de la respuesta final; llega en `ResultMessage.structured_output` | |
| `skills`, `plugins` | Filtro de *skills* y plugins cargados ([[docs/claude-code/03-skills]]) | Es un filtro de contexto, no un sandbox |
| `verbatim_prompts` | Evita que un `@/ruta` dentro de texto ajeno haga leer archivos locales | Defensa contra [[glosario/inyeccion-de-prompt\|inyección]] |

## Herramientas propias: MCP en proceso

`@tool(nombre, descripción, esquema)` define una herramienta y `create_sdk_mcp_server(name, version, tools)` la publica como un [[glosario/servidor-mcp|servidor MCP]] que vive dentro de tu proceso: sin subproceso ni red. El esquema puede ser un dict de tipos (`{"texto": str}`) o un JSON Schema completo. La herramienta devuelve el formato de resultado de MCP (`{"content": [{"type": "text", "text": …}]}`) y el modelo la ve como `mcp__<servidor>__<herramienta>`; ese es el nombre que pones en `allowed_tools`. Los servidores MCP externos (stdio o HTTP) se pasan también en `mcp_servers` ([[docs/claude-code/07-mcp-en-claude-code]]).

## Hooks y permisos

Dos mecanismos que se confunden a menudo:

- **`can_use_tool(nombre, entrada, contexto)`** devuelve `PermissionResultAllow(updated_input=…)` o `PermissionResultDeny(message=…, interrupt=…)`, pero **solo se invoca cuando las reglas dirían «ask»**. No se llama para lo que ya aprueban `allowed_tools`, el modo o las reglas `allow`.
- **Hooks** (`hooks={"PreToolUse": [HookMatcher(matcher="Bash", hooks=[…])]}`) se ejecutan siempre en su evento. El callback recibe `(input_data, tool_use_id, context)` y devuelve el JSON de salida de Claude Code (`hookSpecificOutput` con `permissionDecision`: `allow`, `deny` o `ask`). Los *matchers* de un mismo evento corren en paralelo.

Regla práctica: para **vigilar todas** las llamadas, hook `PreToolUse`; para **preguntar** en lo dudoso, `can_use_tool`. En Python hay 10 eventos de hook (`PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `SubagentStart`, `PreCompact`, `Notification`, `PermissionRequest`); en TypeScript, los mismos que Claude Code. Más en [[docs/claude-code/06-permisos-y-sandbox]] y [[recetas/hook-que-bloquea-comandos-peligrosos]].

> [!peligro] `allowed_tools` aprueba, no limita
> Si das `allowed_tools=["Read"]` pensando que el agente solo podrá leer, te equivocas: `Bash` y `Write` siguen ahí y pasan por el flujo de permisos. Para un agente de solo lectura, `tools=["Read", "Grep", "Glob"]`.

## Subagentes

`agents={"nombre": AgentDefinition(...)}` define subagentes que el principal invoca con su herramienta de agentes. Campos (en camelCase también en Python, como en el CLI): `description` (cuándo usarlo), `prompt`, `tools`, `disallowedTools`, `model`, `skills`, `memory`, `mcpServers`, `maxTurns`, `effort`, `permissionMode`, `background`. Cada subagente trabaja con su propio contexto y devuelve un resumen ([[docs/agentes/02-subagentes]]). Con `setting_sources=["project"]` también se cargan los de `.claude/agents/` del repositorio.

## Conversaciones y sesiones

```python title="conversacion_claude_sdk.py"
import asyncio

from claude_agent_sdk import AssistantMessage, ClaudeAgentOptions, ClaudeSDKClient, ResultMessage, TextBlock

MODEL = "claude-sonnet-5-5"

opciones = ClaudeAgentOptions(
    model=MODEL,
    tools=["Read", "Grep", "Glob"],     # SOLO estas herramientas existen (solo lectura)
    setting_sources=[],                 # aislado: no carga ajustes ni CLAUDE.md de la máquina
    max_turns=10,
)


async def imprimir(cliente: ClaudeSDKClient) -> str | None:
    async for m in cliente.receive_response():     # hasta el ResultMessage de este turno
        if isinstance(m, AssistantMessage):
            print("".join(b.text for b in m.content if isinstance(b, TextBlock)))
        elif isinstance(m, ResultMessage):
            return m.session_id


async def main() -> None:
    async with ClaudeSDKClient(options=opciones) as cliente:
        await cliente.query("Lee pyproject.toml y lista sus dependencias.")
        await imprimir(cliente)
        await cliente.query("¿Cuál de ellas fija una versión exacta?")   # mismo contexto
        sesion = await imprimir(cliente)
    print("para retomarla otro día: ClaudeAgentOptions(resume=%r)" % sesion)


if __name__ == "__main__":
    asyncio.run(main())
```

Las sesiones se guardan como en Claude Code. Para retomarlas: `resume=session_id`, `fork_session=True` (rama nueva desde ese punto), `continue_conversation=True` (la última) o `resume_session_at`. Para gestionarlas: `list_sessions`, `get_session_messages`, `fork_session`, `rename_session`, `tag_session`, `delete_session`, `list_subagents`. Si necesitas guardarlas fuera del disco local (varios servidores), `SessionStore` e `InMemorySessionStore`.

## Modelos y entorno local

El Agent SDK solo habla con Claude: por la API de Anthropic con clave, o a través de Amazon Bedrock, Google Vertex AI o Microsoft Foundry. **No hay modo para un modelo abierto en local.** Si necesitas que el agente funcione sin red o con pesos abiertos, el harness equivalente open source es [[docs/frameworks/10-deep-agents|Deep Agents]] con `ChatOllama`, o un agente de código abierto ([[cursos/agentes-con-modelos-abiertos/index]]).

## Licencia y condiciones

- Se usa bajo los **Commercial Terms** de Anthropic; no es software open source.
- **No se permite ofrecer el inicio de sesión de claude.ai ni sus límites de uso** en productos de terceros: tu producto se autentica con clave de API o con un proveedor de nube.
- Hay reglas de marca: puedes llamar a tu producto «Claude Agent» o «{TuAgente} Powered by Claude», pero no «Claude Code».

## Errores frecuentes

- Usar `allowed_tools` como lista blanca (ver el aviso).
- Dejar `setting_sources` por defecto en un servidor: el agente carga los ajustes, hooks y `CLAUDE.md` de quien haya en esa máquina. En producción, `[]` o `["project"]`.
- Esperar que `can_use_tool` vea todas las llamadas.
- No poner `max_turns` ni `max_budget_usd`.
- Copiar la «V2 session API» de TypeScript de ejemplos antiguos: está retirada.

## Ver también

- [[recetas/agente-con-claude-agent-sdk]]: un agente completo en pocas líneas.
- [[docs/claude-code/index]]: todo lo que el SDK hereda de Claude Code.
- [[docs/frameworks/02-equivalencias]]: el SDK frente a los frameworks abiertos.
- [[herramientas/claude-agent-sdk]]: ficha del directorio.
