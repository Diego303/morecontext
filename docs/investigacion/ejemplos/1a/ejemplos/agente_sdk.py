"""Agente mínimo con Claude Agent SDK (Python, claude-agent-sdk 0.2.174)."""
import asyncio
from typing import Any

from claude_agent_sdk import (
    AgentDefinition,
    AssistantMessage,
    ClaudeAgentOptions,
    HookMatcher,
    PermissionResultAllow,
    PermissionResultDeny,
    ResultMessage,
    TextBlock,
    ToolPermissionContext,
    create_sdk_mcp_server,
    query,
    tool,
)

MODEL = "claude-sonnet-5-5"


# 1) Herramienta propia: se expone como servidor MCP en proceso.
@tool("contar_palabras", "Cuenta las palabras de un texto", {"texto": str})
async def contar_palabras(args: dict[str, Any]) -> dict[str, Any]:
    n = len(args["texto"].split())
    return {"content": [{"type": "text", "text": str(n)}]}


utilidades = create_sdk_mcp_server(name="utilidades", version="1.0.0", tools=[contar_palabras])


# 2) Hook PreToolUse: bloquea comandos peligrosos antes de ejecutarlos.
async def bloquear_rm(input_data: dict[str, Any], tool_use_id: str | None, context: Any) -> dict[str, Any]:
    comando = input_data.get("tool_input", {}).get("command", "")
    if "rm -rf" in comando:
        return {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": "rm -rf no está permitido",
            }
        }
    return {}


# 3) Permiso programático para lo que caería en «ask».
async def decidir(nombre: str, entrada: dict[str, Any], ctx: ToolPermissionContext):
    if nombre == "Write" and str(entrada.get("file_path", "")).endswith(".env"):
        return PermissionResultDeny(message="No se escriben secretos")
    return PermissionResultAllow()


opciones = ClaudeAgentOptions(
    model=MODEL,
    system_prompt={"type": "preset", "preset": "claude_code", "append": "Responde en español."},
    cwd=".",
    setting_sources=["project"],          # carga .claude/settings.json y CLAUDE.md del proyecto
    allowed_tools=["Read", "Grep", "Glob", "mcp__utilidades__contar_palabras"],
    permission_mode="default",
    mcp_servers={"utilidades": utilidades},
    hooks={"PreToolUse": [HookMatcher(matcher="Bash", hooks=[bloquear_rm])]},
    can_use_tool=decidir,
    agents={
        "revisor": AgentDefinition(
            description="Revisa código en busca de errores; úsalo tras cambios.",
            prompt="Eres un revisor de código estricto. Señala solo problemas reales.",
            tools=["Read", "Grep", "Glob"],
            model="haiku",
        )
    },
    max_turns=20,
    effort="medium",
)


async def main() -> None:
    async for mensaje in query(prompt="Cuenta las palabras de README.md", options=opciones):
        if isinstance(mensaje, AssistantMessage):
            for bloque in mensaje.content:
                if isinstance(bloque, TextBlock):
                    print(bloque.text)
        elif isinstance(mensaje, ResultMessage):
            print("coste USD:", mensaje.total_cost_usd, "sesión:", mensaje.session_id)


if __name__ == "__main__":
    asyncio.run(main())
