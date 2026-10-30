---
titulo: Un agente con el Claude Agent SDK en 40 líneas
descripcion: Monta un agente con el Claude Agent SDK en Python o TypeScript con una herramienta propia, un hook que bloquea comandos, permisos, un subagente revisor y el coste de la sesión.
creado: 2026-10-29
nivel: inicial
minutos: 25
tema: agentes
stack: ["Python", "TypeScript", "Claude Agent SDK"]
tags: [agentes, claude-agent-sdk, hooks, permisos, subagentes]
relacionados: ["[[docs/frameworks/03-claude-agent-sdk]]", "[[herramientas/claude-agent-sdk]]", "[[recetas/hook-que-bloquea-comandos-peligrosos]]", "[[glosario/harness]]"]
---

## Problema

Quieres un agente que lea ficheros, busque en un repositorio, ejecute comandos y use una herramienta tuya, con reglas de seguridad y un subagente que revise. Escribir el bucle a mano con la API ([[docs/agentes/01-el-bucle-agentico]]) es la mejor forma de entenderlo, pero rehacer las herramientas de ficheros, los permisos, la gestión del contexto y las sesiones lleva semanas.

El Claude Agent SDK es Claude Code como biblioteca: el mismo [[glosario/harness|harness]], con sus herramientas integradas, [[glosario/hook|hooks]], subagentes, MCP, permisos y sesiones, ejecutándose en tu proceso ([[docs/frameworks/03-claude-agent-sdk]]). Existe para Python y TypeScript. No lo trates como open source: el README dice que se rige por los términos comerciales de Anthropic (el paquete de Python lleva un `LICENSE` MIT; la ambigüedad está explicada en [[herramientas/claude-agent-sdk]]) y se autentica con clave de API, Bedrock, Vertex o Foundry; no puedes ofrecer en tu producto el inicio de sesión de claude.ai.

## Ingredientes

- Python 3.10 o superior y `pip install claude-agent-sdk` (probado con 0.2.174; trae dentro el CLI de Claude Code), o Node 18.14 o superior y `npm i @anthropic-ai/claude-agent-sdk zod` (probado con 0.3.312).
- La variable de entorno `ANTHROPIC_API_KEY`.
- Un directorio de trabajo con algo que leer (un `README.md` basta).

## Pasos

1. **Crea la herramienta propia.** `@tool(nombre, descripción, esquema)` define una función asíncrona que devuelve bloques `content`. `create_sdk_mcp_server` la publica como servidor MCP en proceso. Dentro del agente se llama `mcp__<servidor>__<herramienta>`: aquí, `mcp__utilidades__contar_palabras`.

2. **Añade un hook que bloquea.** Un hook `PreToolUse` con `matcher="Bash"` ve cada comando antes de ejecutarse. Si devuelve `permissionDecision: "deny"`, el comando no se ejecuta y el motivo le llega al modelo. Es la misma lógica que en `settings.json` de Claude Code ([[docs/claude-code/04-hooks]]).

3. **Decide los permisos.** `allowed_tools` aprueba sin preguntar; `permission_mode="default"` hace que el resto pase por las reglas, y lo que acabe en «preguntar» llega a `can_use_tool`, que responde con `PermissionResultAllow` o `PermissionResultDeny`.

4. **Declara un subagente.** `agents={"revisor": AgentDefinition(...)}` con su descripción (cuándo usarlo), su prompt, sus herramientas de solo lectura y un modelo más barato. El agente principal lo invoca cuando lo cree oportuno.

5. **Lee el resultado y el coste.** `query()` devuelve un iterador de mensajes. El último, `ResultMessage`, trae `total_cost_usd`, `num_turns`, `session_id`, `usage` y `permission_denials`.

```python tab="Python" title="agente_sdk.py"
import asyncio
from typing import Any

from claude_agent_sdk import (AgentDefinition, AssistantMessage, ClaudeAgentOptions, HookMatcher,
                              PermissionResultAllow, PermissionResultDeny, ResultMessage, TextBlock,
                              ToolPermissionContext, create_sdk_mcp_server, query, tool)

MODEL = "claude-sonnet-5-5"


@tool("contar_palabras", "Cuenta las palabras de un texto", {"texto": str})
async def contar_palabras(args: dict[str, Any]) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": str(len(args["texto"].split()))}]}


utilidades = create_sdk_mcp_server(name="utilidades", version="1.0.0", tools=[contar_palabras])


async def bloquear_rm(input_data: dict[str, Any], tool_use_id: str | None, context: Any) -> dict[str, Any]:
    if "rm -rf" in input_data.get("tool_input", {}).get("command", ""):
        return {"hookSpecificOutput": {"hookEventName": "PreToolUse",
                "permissionDecision": "deny", "permissionDecisionReason": "rm -rf no está permitido"}}
    return {}


async def decidir(nombre: str, entrada: dict[str, Any], ctx: ToolPermissionContext):
    if nombre == "Write" and str(entrada.get("file_path", "")).endswith(".env"):
        return PermissionResultDeny(message="No se escriben secretos")
    return PermissionResultAllow()


opciones = ClaudeAgentOptions(
    model=MODEL,
    system_prompt={"type": "preset", "preset": "claude_code", "append": "Responde en español."},
    setting_sources=["project"],
    allowed_tools=["Read", "Grep", "Glob", "mcp__utilidades__contar_palabras"],
    permission_mode="default",
    mcp_servers={"utilidades": utilidades},
    hooks={"PreToolUse": [HookMatcher(matcher="Bash", hooks=[bloquear_rm])]},
    can_use_tool=decidir,
    agents={"revisor": AgentDefinition(description="Revisa código; úsalo tras cambios.",
            prompt="Eres un revisor estricto.", tools=["Read", "Grep", "Glob"], model="haiku")},
    max_turns=20, effort="medium",
)


async def main() -> None:
    async for m in query(prompt="Cuenta las palabras de README.md", options=opciones):
        if isinstance(m, AssistantMessage):
            for b in m.content:
                if isinstance(b, TextBlock):
                    print(b.text)
        elif isinstance(m, ResultMessage):
            print("coste USD:", m.total_cost_usd, "sesión:", m.session_id)


if __name__ == "__main__":
    asyncio.run(main())
```

```ts tab="TypeScript" title="agente.ts"
import { query, tool, createSdkMcpServer, type HookCallback } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const MODEL = "claude-sonnet-5-5";
const contarPalabras = tool("contar_palabras", "Cuenta las palabras de un texto", { texto: z.string() },
  async ({ texto }) => ({ content: [{ type: "text", text: String(texto.split(/\s+/).filter(Boolean).length) }] }));
const utilidades = createSdkMcpServer({ name: "utilidades", version: "1.0.0", tools: [contarPalabras] });

const bloquearRm: HookCallback = async (input) => {
  if (input.hook_event_name === "PreToolUse") {
    const cmd = String((input.tool_input as { command?: string }).command ?? "");
    if (cmd.includes("rm -rf")) return { hookSpecificOutput: { hookEventName: "PreToolUse",
      permissionDecision: "deny", permissionDecisionReason: "rm -rf no está permitido" } };
  }
  return {};
};

for await (const m of query({ prompt: "Cuenta las palabras de README.md", options: {
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
  agents: { revisor: { description: "Revisa código; úsalo tras cambios.", prompt: "Eres un revisor estricto.",
                       tools: ["Read", "Grep", "Glob"], model: "haiku" } },
  maxTurns: 20, effort: "medium",
} })) {
  if (m.type === "assistant") for (const b of m.message.content) if (b.type === "text") console.log(b.text);
  if (m.type === "result") console.log("coste USD:", m.total_cost_usd, "sesión:", m.session_id);
}
```

### Qué hace cada opción

| Opción | Qué hace | Ojo con |
|---|---|---|
| `system_prompt` | `preset: "claude_code"` usa el prompt de Claude Code y `append` le añade lo tuyo; `{"type": "custom", "prompt": …}` lo sustituye | Con `None`, el CLI usa su valor por defecto |
| `setting_sources` | Qué configuración carga: `user`, `project`, `local` | Con `None` carga todas; hace falta `"project"` para leer `CLAUDE.md` |
| `allowed_tools` | Herramientas que se aprueban sin preguntar | No limita qué herramientas existen |
| `tools` / `disallowed_tools` | Qué herramientas integradas hay (`[]` = ninguna) / cuáles se quitan | Esto sí limita |
| `permission_mode` | `default`, `acceptEdits`, `plan`, `bypassPermissions`, `dontAsk`, `auto` | `bypassPermissions` solo en un *sandbox* |
| `can_use_tool` | Tu decisión para lo que cae en «preguntar» | No se invoca para lo ya permitido |
| `hooks` | Callbacks por evento (`PreToolUse`, `PostToolUse`, `Stop`…) | Los *matchers* de un evento se ejecutan en paralelo |
| `agents` | Subagentes con su prompt, herramientas y modelo | Campos en camelCase, como en el CLI |
| `max_turns`, `max_budget_usd`, `effort` | Límites de turnos y de gasto, y esfuerzo del modelo | Pon siempre algún límite |

## Cómo comprobar que funciona

Aquí no hay clave de API, así que se verificó lo que se puede sin llamar al modelo: que el módulo importa con `claude-agent-sdk` 0.2.174, que las opciones se construyen y que la herramienta, el hook y el callback de permisos responden como deben, llamándolos directamente:

```python title="probar_sdk.py"
import asyncio

from claude_agent_sdk import ToolPermissionContext

import agente_sdk as a


async def main():
    print("herramienta:", (await a.contar_palabras.handler({"texto": "hola que tal"}))["content"][0]["text"])
    deny = await a.bloquear_rm({"tool_input": {"command": "rm -rf /"}}, None, None)
    print("hook rm -rf:", deny["hookSpecificOutput"]["permissionDecision"])
    print("hook ls:", await a.bloquear_rm({"tool_input": {"command": "ls"}}, None, None))
    ctx = ToolPermissionContext()
    print("Write .env:", type(await a.decidir("Write", {"file_path": "app/.env"}, ctx)).__name__)
    print("Write main.py:", type(await a.decidir("Write", {"file_path": "main.py"}, ctx)).__name__)
    o = a.opciones
    print("opciones:", o.model, o.setting_sources, o.max_turns, o.effort, list(o.agents),
          o.mcp_servers["utilidades"]["type"])

asyncio.run(main())
```

```text
herramienta: 3
hook rm -rf: deny
hook ls: {}
Write .env: PermissionResultDeny
Write main.py: PermissionResultAllow
opciones: claude-sonnet-5-5 ['project'] 20 medium ['revisor'] sdk
```

La versión TypeScript compila con `tsc --strict` contra `@anthropic-ai/claude-agent-sdk` 0.3.312. Con clave, ejecuta `python agente_sdk.py` en un directorio con `README.md`: debes ver el número de palabras y una línea final con el coste en dólares y el id de sesión. Para probar el hook, pide «borra la carpeta build con rm -rf»: el agente debe contestar que no puede, con el motivo del hook.

## Variaciones

- **Conversación con estado.** `ClaudeSDKClient` mantiene la sesión abierta entre preguntas (`connect`, `query`, `receive_response`) y permite interrumpir o cambiar de modelo. Para retomar más tarde, `resume=<session_id>`.
- **Salida estructurada.** `output_format` en las opciones y `ResultMessage.structured_output` en el resultado: útil cuando el agente es un paso de un *pipeline*.
- **En CI.** `setting_sources=[]` aísla el agente de la configuración de la máquina, y `max_budget_usd` pone un tope de gasto. Si prefieres no escribir código, `claude -p` con `--bare` hace lo mismo desde la terminal ([[docs/claude-code/08-modo-headless-y-ci]]).
- **Alojado por Anthropic.** Si no quieres ejecutar el bucle ni el *sandbox* tú, está Managed Agents ([[docs/agentes/04-managed-agents]]).
- **Con frameworks abiertos.** El mismo agente con LangGraph u OpenAI Agents SDK, que son open source y funcionan con varios proveedores, está comparado en [[docs/frameworks/02-equivalencias]].

## Errores típicos

- **Dejar `setting_sources` sin poner.** Con `None` se cargan las fuentes de usuario, proyecto y local, igual que el CLI: en tu máquina el agente hereda tus hooks, permisos y servidores MCP personales, y en CI se comporta distinto. Pon la lista explícita.
- **Creer que `allowed_tools` limita.** Solo aprueba sin preguntar. Las demás herramientas integradas siguen existiendo y pasan por los permisos. Para quitarlas, `tools` o `disallowed_tools`.
- **Vigilar todo con `can_use_tool`.** Solo se llama cuando las reglas dicen «preguntar». Lo que ya permiten `allowed_tools`, el modo o las reglas `allow` no pasa por ahí. Para ver todas las llamadas, un hook `PreToolUse` ([[problemas/el-hook-bloquea-todo]]).
- **Nombrar mal la herramienta propia en `allowed_tools`.** Es `mcp__utilidades__contar_palabras`, no `contar_palabras`.
- **Tomar el hook por un *sandbox*.** Buscar `"rm -rf"` en el texto es una guía, no una barrera: `rm -r -f` pasa. Para aislar de verdad, permisos y *sandbox* del sistema ([[docs/claude-code/06-permisos-y-sandbox]]).
- **Sin límites.** Sin `max_turns` ni `max_budget_usd`, una tarea mal planteada sigue gastando ([[problemas/el-agente-no-para]]).
