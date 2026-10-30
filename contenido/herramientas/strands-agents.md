---
titulo: Strands Agents
descripcion: SDK abierto de AWS para agentes con herramientas, gestión de conversación y multiagente (grafos y enjambres); usa Amazon Bedrock si no le pasas modelo.
creado: 2026-10-29
tags: [frameworks, agentes, aws, python, typescript, open-source]
relacionados: ["[[docs/frameworks/09-otros-frameworks]]", "[[herramientas/google-adk]]", "[[herramientas/openai-agents-sdk]]", "[[docs/frameworks/01-elegir-framework]]"]
categoria: framework
licencia: Apache-2.0
open_source: true
lenguajes: [Python, TypeScript]
url: https://strandsagents.com
repositorio: https://github.com/strands-agents/harness-sdk
version: "1.62.0"
revisado: 2026-10-29
---

Strands Agents es el SDK de agentes de AWS. Un `Agent` combina modelo, herramientas (funciones con `@tool`) y prompt de sistema, y se llama como una función: `agente("pregunta")`. Para varios agentes trae `GraphBuilder` y `Swarm` en `strands.multiagent`.

**Licencia**: Apache-2.0, open source (`strands-agents` 1.62.0 en Python, estable; `@strands-agents/sdk` 1.22.0 en npm). Lo comercial: **Amazon Bedrock**, que es el proveedor de modelos **por defecto** si no pasas `model=`. Su README lo dice: «For the default Amazon Bedrock model provider, you'll need AWS credentials».

## Para qué sirve

- Agentes con herramientas en pocas líneas, con proveedores intercambiables: `AnthropicModel`, `OllamaModel`, Bedrock.
- Salida estructurada (`structured_output_model`), gestión del historial (`conversation_manager`), sesiones (`session_manager`) y *hooks*.
- Multiagente con grafos y enjambres.

## Cuándo usarla

Equipos en AWS que quieren un SDK abierto con integración natural con Bedrock, o cualquiera que busque un SDK sencillo con multiagente incluido.

## Cuándo no

- Si no quieres que una configuración olvidada acabe llamando a Bedrock: pasa siempre el modelo explícito, o elige otro SDK.
- Si necesitas checkpoints y reanudación paso a paso: [[herramientas/langgraph]].

## Ejemplo mínimo

```python nocheck title="agente_strands.py"
from strands import Agent, tool
from strands.models.anthropic import AnthropicModel

MODEL = "claude-sonnet-5-5"


@tool
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email.

    Args:
        email: Email del cliente.
    """
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


agente = Agent(model=AnthropicModel(model_id=MODEL, max_tokens=1024),   # sin model= usa Amazon Bedrock
               tools=[ver_pedidos], system_prompt="Eres el soporte de una tienda.")

if __name__ == "__main__":
    print(agente("¿Y mi pedido? ana@example.com"))
```

Comprobé la construcción en un entorno aparte con `strands-agents[anthropic,ollama]` 1.62.0: el agente queda con la herramienta `ver_pedidos`. No llamé a la API. Para un modelo local: `OllamaModel(host=…, model_id=…)`.

> [!aviso] Modelo por defecto en la nube
> El valor por defecto manda tus prompts a Bedrock con las credenciales de AWS que encuentre en el entorno. En desarrollo, eso puede ser una cuenta de empresa que no esperabas.

## Alternativas

- [[herramientas/google-adk]] y [[herramientas/microsoft-agent-framework]], los frameworks abiertos de otras nubes.
- [[herramientas/openai-agents-sdk]], con handoffs y guardrails.
- [[herramientas/pydantic-ai]] si te importa sobre todo la salida tipada.

## Enlaces

- [Repositorio](https://github.com/strands-agents/harness-sdk) · [PyPI](https://pypi.org/project/strands-agents/) · [npm](https://www.npmjs.com/package/@strands-agents/sdk)
- En MoreContext: [[docs/frameworks/09-otros-frameworks]] · [[docs/frameworks/02-equivalencias]]
