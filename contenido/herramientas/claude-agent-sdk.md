---
titulo: Claude Agent SDK
descripcion: Claude Code como biblioteca de Python y TypeScript, con su bucle, herramientas integradas, hooks, subagentes, MCP y permisos. Se rige por los términos comerciales de Anthropic.
creado: 2026-10-29
tags: [sdk, agentes, claude-code, anthropic, python, typescript]
relacionados: ["[[docs/frameworks/03-claude-agent-sdk]]", "[[recetas/agente-con-claude-agent-sdk]]", "[[herramientas/claude-code]]", "[[herramientas/anthropic-sdk]]"]
categoria: sdk
licencia: propietaria
open_source: false
lenguajes: [Python, TypeScript]
url: https://code.claude.com/docs/en/agent-sdk
repositorio: https://github.com/anthropics/claude-agent-sdk-python
version: "0.2.174"
revisado: 2026-10-29
---

El Claude Agent SDK es [[herramientas/claude-code]] usado como biblioteca: el mismo bucle, las mismas herramientas integradas (`Read`, `Bash`, `Grep`…), la misma gestión de contexto, [[glosario/hook|hooks]], subagentes, MCP, permisos, sesiones y *skills*. Existe para Python (`claude-agent-sdk` 0.2.174, que incluye el CLI de Claude Code) y TypeScript (`@anthropic-ai/claude-agent-sdk` 0.3.312).

**Licencia**: la ficha lo trata como propietario. El README del SDK dice que su uso se rige por los Términos Comerciales de Anthropic, y el paquete de npm declara «SEE LICENSE IN README.md». Ojo con la ambigüedad: el paquete de Python incluye un archivo `LICENSE` con texto MIT y PyPI lo marca como MIT, pero el README establece que rigen los Términos Comerciales. Si la licencia es un requisito legal para ti, pregunta a Anthropic o a tu equipo jurídico. Se autentica con clave de API, Bedrock, Vertex o Foundry, y **no se permite ofrecer el inicio de sesión de claude.ai ni sus límites** en productos de terceros. Hay reglas de marca: vale «{TuAgente} Powered by Claude», no «Claude Code».

## Para qué sirve

- Un agente que trabaja sobre archivos y comandos en tu propio proceso, sin escribir el arnés.
- Herramientas propias con `@tool` + `create_sdk_mcp_server` (servidor MCP en proceso; se llaman `mcp__<servidor>__<herramienta>`).
- Control con `hooks`, `can_use_tool`, `permission_mode`, `max_turns` y `max_budget_usd`; subagentes con `agents`.

## Cuándo usarla

Cuando quieres el comportamiento de Claude Code dentro de tu producto, en CI o en un servicio: revisar código, automatizar tareas sobre un repositorio, agentes de operaciones. La tabla oficial lo resume así: Agent SDK si el bucle corre en tu proceso; [[herramientas/anthropic-sdk]] si el bucle lo escribes tú; Managed Agents si quieres que Anthropic aloje agente y sandbox.

## Cuándo no

- Si necesitas otro proveedor o un modelo local: solo funciona con Claude.
- Si tu proyecto exige licencia open source.
- Para una llamada simple con dos herramientas: el SDK de cliente es más ligero y ves cada `stop_reason`.

## Ejemplo mínimo

```python title="agente_sdk.py"
import asyncio
from typing import Any

from claude_agent_sdk import (ClaudeAgentOptions, HookMatcher, ResultMessage, create_sdk_mcp_server,
                              query, tool)

MODEL = "claude-sonnet-5-5"


@tool("contar_palabras", "Cuenta las palabras de un texto", {"texto": str})
async def contar_palabras(args: dict[str, Any]) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": str(len(args["texto"].split()))}]}


async def bloquear_rm(input_data: dict[str, Any], tool_use_id: str | None, context: Any) -> dict[str, Any]:
    if "rm -rf" in input_data.get("tool_input", {}).get("command", ""):
        return {"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny",
                                       "permissionDecisionReason": "rm -rf no está permitido"}}
    return {}


opciones = ClaudeAgentOptions(
    model=MODEL,
    setting_sources=["project"],                      # hace falta "project" para cargar CLAUDE.md
    mcp_servers={"utilidades": create_sdk_mcp_server(name="utilidades", tools=[contar_palabras])},
    allowed_tools=["Read", "Grep", "mcp__utilidades__contar_palabras"],   # aprueba, no limita
    hooks={"PreToolUse": [HookMatcher(matcher="Bash", hooks=[bloquear_rm])]},
    max_turns=20,
)


async def main() -> None:
    async for m in query(prompt="Cuenta las palabras de README.md", options=opciones):
        if isinstance(m, ResultMessage):
            print(m.result, "| coste USD:", m.total_cost_usd)


if __name__ == "__main__":
    asyncio.run(main())
```

Comprobé en local la construcción de las opciones, la herramienta y el hook (bloquea `rm -rf`, deja pasar `ls`); no llamé a la API.

> [!aviso] Dos matices que confunden
> `allowed_tools` aprueba sin preguntar, pero **no limita** qué herramientas existen: para eso están `tools` y `disallowed_tools`. Y `can_use_tool` solo se invoca cuando las reglas dicen «ask»; para vigilar todas las llamadas, usa un hook `PreToolUse`.

## Alternativas

- [[herramientas/anthropic-sdk]] para escribir el bucle tú.
- [[herramientas/deepagents]]: arnés open source parecido, con cualquier modelo.
- [[herramientas/openai-agents-sdk]] o [[herramientas/strands-agents]] si quieres un SDK abierto.

## Enlaces

- [Documentación del Agent SDK](https://code.claude.com/docs/en/agent-sdk.md) · [Referencia de Python](https://code.claude.com/docs/en/agent-sdk/python.md) · [Referencia de TypeScript](https://code.claude.com/docs/en/agent-sdk/typescript.md)
- [PyPI](https://pypi.org/project/claude-agent-sdk/) · [npm](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)
- En MoreContext: [[docs/frameworks/03-claude-agent-sdk]] · [[docs/claude-code/04-hooks]] · [[recetas/agente-con-claude-agent-sdk]]
