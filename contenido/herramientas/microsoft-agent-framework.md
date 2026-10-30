---
titulo: Microsoft Agent Framework
descripcion: Framework abierto de Microsoft para agentes y workflows, sucesor de Semantic Kernel, con clientes para Claude y Ollama y herramientas MCP.
creado: 2026-10-29
tags: [frameworks, agentes, workflows, python, open-source]
relacionados: ["[[docs/frameworks/09-otros-frameworks]]", "[[herramientas/google-adk]]", "[[herramientas/langgraph]]", "[[docs/frameworks/01-elegir-framework]]"]
categoria: framework
licencia: MIT
open_source: true
lenguajes: [Python]
url: https://github.com/microsoft/agent-framework
repositorio: https://github.com/microsoft/agent-framework
version: "1.23.0"
revisado: 2026-10-29
---

Microsoft Agent Framework (`agent-framework`) es el framework de agentes de Microsoft. Un `Agent` recibe un cliente de modelo, instrucciones, herramientas, *middleware* y una estrategia de compactación; `WorkflowBuilder` y los `Executor` componen flujos de varios pasos.

**Licencia**: MIT, open source. Lo comercial: **Azure AI Foundry** y el resto de Azure, donde se integra de forma natural. El README de Semantic Kernel lo presenta como su sucesor («the enterprise-ready successor… now available at version 1.0»). AutoGen, el otro proyecto de agentes de Microsoft, no publica versiones en PyPI desde septiembre de 2025.

## Para qué sirve

- Agentes con herramientas y clientes intercambiables: `AnthropicClient` (paquete `agent-framework-anthropic`, en beta) y `OllamaChatClient`.
- Herramientas MCP con `MCPStdioTool` y `MCPStreamableHTTPTool`.
- Workflows con `WorkflowBuilder`, `Executor` y `@handler`.

## Cuándo usarla

Equipos en el ecosistema Microsoft, proyectos que vienen de Semantic Kernel y quieren migrar a la línea mantenida, o que despliegan en Azure.

## Cuándo no

- Si no usas Azure ni vienes de Semantic Kernel, hay opciones con más ejemplos y comunidad en Python, como [[herramientas/langgraph]] o [[herramientas/pydantic-ai]].
- Si necesitas la integración con Claude estable: hoy está en beta.

## Ejemplo mínimo

```python nocheck title="agente_maf.py"
import asyncio

from agent_framework import Agent, tool
from agent_framework.anthropic import AnthropicClient   # paquete agent-framework-anthropic (beta)

MODEL = "claude-sonnet-5-5"


def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email.

    Args:
        email: Email del cliente.
    """
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


agente = Agent(client=AnthropicClient(model=MODEL), name="soporte",
               instructions="Eres el soporte de una tienda. Usa las herramientas.", tools=[tool(ver_pedidos)])

if __name__ == "__main__":
    print(asyncio.run(agente.run("¿Y mi pedido? ana@example.com")).text)
```

Comprobé la construcción en un entorno aparte con `agent-framework-core` 1.23.0 y `agent-framework-anthropic` 1.0.0b261022: el agente `soporte` queda con la herramienta `ver_pedidos`. No llamé a la API.

> [!aviso] Instala por piezas
> `pip install agent-framework` (el metapaquete con todas las integraciones) resolvió a la 1.19.0 en la prueba. Instalar `agent-framework-core==1.23.0` y solo las integraciones que necesites dio la versión actual.

## Alternativas

- [[herramientas/google-adk]] y [[herramientas/strands-agents]], los frameworks abiertos de otras nubes.
- [[herramientas/langgraph]] para workflows con estado y aprobación humana.
- [[herramientas/openai-agents-sdk]] para triaje multiagente ligero.

## Enlaces

- [Repositorio](https://github.com/microsoft/agent-framework) · [PyPI](https://pypi.org/project/agent-framework/) · [Integración con Anthropic](https://pypi.org/project/agent-framework-anthropic/)
- En MoreContext: [[docs/frameworks/09-otros-frameworks]] · [[docs/frameworks/02-equivalencias]]
