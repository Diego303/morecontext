---
titulo: Haystack
descripcion: Framework abierto de deepset para RAG y agentes de producción construidos como pipelines explícitos de componentes intercambiables.
creado: 2026-10-29
tags: [frameworks, rag, pipelines, python, open-source]
relacionados: ["[[docs/frameworks/09-otros-frameworks]]", "[[herramientas/llamaindex]]", "[[sistemas/rag-con-citas]]", "[[glosario/rag]]"]
categoria: framework
licencia: Apache-2.0
open_source: true
lenguajes: [Python]
url: https://github.com/deepset-ai/haystack
repositorio: https://github.com/deepset-ai/haystack
version: "3.4.1"
revisado: 2026-10-29
---

Haystack es un framework para construir aplicaciones con modelos como **pipelines**: grafos explícitos de componentes (conversores, *retrievers*, generadores, agentes) que se conectan por sus entradas y salidas. La serie actual es la 3.x (`haystack-ai` 3.4.1), no la 2.x que aparece en muchos tutoriales.

**Licencia**: Apache-2.0, open source, igual que las integraciones `anthropic-haystack` y `ollama-haystack` (estas, en beta). Lo comercial: **Haystack Enterprise**, el soporte y la plataforma de deepset.

## Para qué sirve

- [[glosario/rag|RAG]] de producción donde quieres ver y probar cada pieza por separado.
- Agentes como componente: `Agent(chat_generator, tools, system_prompt, exit_conditions, max_agent_steps, …)`.
- Herramientas desde funciones (`create_tool_from_function`) o en `Toolset`.
- Exponer un pipeline como API REST o como servidor MCP con Hayhooks.

## Cuándo usarla

RAG con varios pasos que quieres explícitos y cambiables: otro *retriever*, otro *reranker*, otro modelo, sin reescribir el resto.

## Cuándo no

Agentes conversacionales simples: un SDK más pequeño como [[herramientas/pydantic-ai]] o el [[herramientas/anthropic-sdk]] te deja menos piezas que montar.

## Ejemplo mínimo

```python nocheck title="agente_haystack.py"
from haystack.components.agents import Agent
from haystack.dataclasses import ChatMessage
from haystack.tools import create_tool_from_function
from haystack_integrations.components.generators.anthropic import AnthropicChatGenerator

MODEL = "claude-sonnet-5-5"


def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email.

    Args:
        email: Email del cliente.
    """
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


agente = Agent(chat_generator=AnthropicChatGenerator(model=MODEL, generation_kwargs={"max_tokens": 1024}),
               tools=[create_tool_from_function(ver_pedidos)],
               system_prompt="Eres el soporte de una tienda.", max_agent_steps=10)

if __name__ == "__main__":
    agente.warm_up()
    salida = agente.run(messages=[ChatMessage.from_user("¿Y mi pedido? ana@example.com")])
    print(salida["messages"][-1].text)
```

Comprobé la construcción en un entorno aparte con `haystack-ai` 3.4.1 y `anthropic-haystack` 8.0.1: el agente queda con la herramienta `ver_pedidos`. No llamé a la API. Para un modelo local, cambia el generador por `OllamaChatGenerator(model=…, url=…)`.

> [!nota] De la 2.x a la 3.x
> La investigación de MoreContext no revisó qué cambió entre la 2 y la 3. Si vienes de un tutorial antiguo, contrasta cada import con la documentación de la versión que instales.

## Alternativas

- [[herramientas/llamaindex]], el otro framework centrado en datos.
- [[herramientas/docling]] para convertir documentos antes de indexarlos.
- [[herramientas/langgraph]] si el centro del problema es el flujo con estado y no la recuperación.

## Enlaces

- [Repositorio](https://github.com/deepset-ai/haystack) · [PyPI](https://pypi.org/project/haystack-ai/) · [Integración con Anthropic](https://pypi.org/project/anthropic-haystack/)
- En MoreContext: [[docs/frameworks/09-otros-frameworks]] · [[cursos/rag-a-fondo/index]]
