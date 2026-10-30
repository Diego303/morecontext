---
titulo: Google ADK
descripcion: Agent Development Kit de Google, abierto, para agentes jerárquicos y workflows (secuencial, paralelo, bucle) con soporte de A2A; usa Claude a través de LiteLLM.
creado: 2026-10-29
tags: [frameworks, agentes, a2a, python, typescript, open-source]
relacionados: ["[[docs/frameworks/09-otros-frameworks]]", "[[docs/estandares/03-a2a]]", "[[glosario/a2a]]", "[[herramientas/litellm]]"]
categoria: framework
licencia: Apache-2.0
open_source: true
lenguajes: [Python, TypeScript, Java, Kotlin, Go]
url: https://google.github.io/adk-docs/
repositorio: https://github.com/google/adk-python
version: "2.13.0"
revisado: 2026-10-29
---

Google ADK (Agent Development Kit) es el framework de agentes de Google. Un `Agent` (alias de `LlmAgent`) combina modelo, instrucciones, herramientas y subagentes; `SequentialAgent`, `ParallelAgent` y `LoopAgent` componen workflows, y un `Runner` ejecuta todo con sesiones.

**Licencia**: Apache-2.0, open source (`google-adk` 2.13.0 en Python; `@google/adk` 2.4.0 en npm; el README enlaza también versiones para Java, Kotlin y Go). Lo comercial: **Vertex AI** y el resto de Google Cloud, donde ADK se integra de forma natural, son servicios de pago.

## Para qué sirve

- Agentes jerárquicos con `sub_agents` y workflows deterministas alrededor.
- Callbacks antes y después de cada llamada al modelo y a cada herramienta (`before_model_callback`, `after_tool_callback`…), útiles para [[glosario/guardrails|guardrails]] y trazas.
- Interoperabilidad con el protocolo [[glosario/a2a|A2A]] (módulo `google.adk.a2a`).

## Cuándo usarla

Equipos que ya trabajan en Google Cloud, sistemas con jerarquías de agentes o que necesitan hablar A2A con agentes de otros equipos.

## Cuándo no

Si Claude es tu modelo principal: dependes de [[herramientas/litellm]] (o de Claude en Vertex) para llegar a él. Existe además una clase `google.adk.models.anthropic_llm.Claude` que necesita el paquete `anthropic`; la investigación no pudo confirmar si está pensada solo para Vertex.

## Ejemplo mínimo

```python nocheck title="agente_adk.py"
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.runners import InMemoryRunner


def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email.

    Args:
        email: Email del cliente.
    """
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


agente = Agent(name="soporte", model=LiteLlm(model="anthropic/claude-sonnet-5-5"),   # Claude vía LiteLLM
               instruction="Eres el soporte de una tienda. Usa las herramientas.", tools=[ver_pedidos])
runner = InMemoryRunner(agent=agente, app_name="tienda")   # luego runner.run_async(user_id, session_id, new_message)
```

Comprobé la construcción en un entorno aparte con `google-adk` 2.13.0 y LiteLLM: se crea un `LlmAgent` con el modelo `anthropic/claude-sonnet-5-5` y un `InMemoryRunner`. No llamé a la API. Fíjate en que el campo es `instruction`, en singular.

## Alternativas

- [[herramientas/openai-agents-sdk]] y [[herramientas/strands-agents]], los SDK abiertos de otros proveedores.
- [[herramientas/microsoft-agent-framework]] si tu nube es Azure.
- [[herramientas/langgraph]] para workflows con estado sin atarte a una nube.

## Enlaces

- [Repositorio de Python](https://github.com/google/adk-python) · [PyPI](https://pypi.org/project/google-adk/) · [npm](https://www.npmjs.com/package/@google/adk)
- En MoreContext: [[docs/frameworks/09-otros-frameworks]] · [[docs/estandares/03-a2a]]
