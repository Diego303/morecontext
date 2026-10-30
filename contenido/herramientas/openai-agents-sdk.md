---
titulo: OpenAI Agents SDK
descripcion: SDK abierto y ligero de OpenAI para agentes y triaje multiagente con handoffs, guardrails, sesiones y aprobación humana; usa Claude a través de LiteLLM.
creado: 2026-10-29
tags: [frameworks, agentes, handoffs, python, typescript, open-source]
relacionados: ["[[docs/frameworks/06-openai-agents-sdk]]", "[[glosario/handoff]]", "[[herramientas/litellm]]", "[[patrones/04-enrutado]]"]
categoria: framework
licencia: MIT
open_source: true
lenguajes: [Python, TypeScript]
url: https://openai.github.io/openai-agents-python/
repositorio: https://github.com/openai/openai-agents-python
version: "0.24.0"
revisado: 2026-10-29
---

El OpenAI Agents SDK (`openai-agents`) es un SDK pequeño para agentes con pocas primitivas: `Agent` (configuración), `Runner` (el bucle), herramientas, *[[glosario/handoff|handoffs]]*, [[glosario/guardrails|guardrails]] y sesiones. Se declara independiente del proveedor: con el extra `[litellm]` funciona con Claude y con modelos locales.

**Licencia**: MIT, open source; la versión JavaScript (`@openai/agents` 0.21.0) también. Lo comercial: el panel de trazas de la plataforma OpenAI, que es **el destino por defecto de las trazas** aunque uses otro modelo.

## Para qué sirve

- Triaje entre especialistas: un handoff aparece ante el modelo como la herramienta `transfer_to_<agente>` y cambia el agente activo.
- Guardrails de entrada y salida declarativos, sesiones con historial (`SQLiteSession`) y aprobación humana con `function_tool(needs_approval=True)`.
- Un agente como herramienta de otro con `agente.as_tool()`.

## Cuándo usarla

Para el patrón de [[patrones/04-enrutado|enrutado]] con especialistas, guardrails y un modelo mental sencillo. Encaja bien en equipos que ya usan la plataforma de OpenAI.

## Cuándo no

- Si necesitas estado durable y reanudación tras una caída paso a paso: hay `RunState` serializable, pero no un checkpointer como el de [[herramientas/langgraph]].
- Si no quieres depender de [[herramientas/litellm]] para usar Claude.

## Ejemplo mínimo

```python title="agentes_openai_sdk.py"
from agents import Agent, ModelSettings, Runner, function_tool, set_tracing_disabled
from agents.extensions.models.litellm_model import LitellmModel

MODEL = LitellmModel(model="anthropic/claude-sonnet-5-5")   # local: LitellmModel(model="ollama_chat/qwen3")
set_tracing_disabled(True)       # por defecto las trazas se envían a la plataforma de OpenAI


def error_visible(ctx, error: Exception) -> str:
    return f"Error: {error}"     # sin esto, el modelo solo ve un mensaje genérico


@function_tool(failure_error_function=error_visible)
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email.

    Args:
        email: Email del cliente.
    """
    if email != "ana@example.com":
        raise ValueError(f"No hay ningún cliente con email {email}")
    return '[{"id": "P-1001", "estado": "enviado"}]'


devoluciones = Agent(name="Devoluciones", model=MODEL, handoff_description="Especialista en devoluciones.",
                     instructions="Gestiona devoluciones.", tools=[ver_pedidos])
triaje = Agent(name="Soporte", model=MODEL, model_settings=ModelSettings(max_tokens=1024),
               instructions="Eres el soporte de una tienda. Para devoluciones, pasa al especialista.",
               tools=[ver_pedidos], handoffs=[devoluciones])   # el handoff llega como transfer_to_devoluciones

r = Runner.run_sync(triaje, "Soy ana@example.com, ¿dónde está mi pedido?", max_turns=10)
print(r.final_output, "| último agente:", r.last_agent.name)
```

Lo ejecuté con un `Model` propio que devuelve respuestas guionizadas: el modelo ve `ver_pedidos` y `transfer_to_devoluciones`, recibe «Error: No hay ningún cliente…» tras el primer intento y termina con la respuesta final.

> [!peligro] Trazas a un tercero por defecto
> Sin `set_tracing_disabled(True)` (o la variable `OPENAI_AGENTS_DISABLE_TRACING`), el SDK intenta exportar tus trazas a `api.openai.com`, con prompts y resultados de herramientas. Desactívalo o configura tu propio exportador.

Otros valores por defecto: `max_turns=10` y `openai-agents[litellm]` fija litellm 1.83.0, no la última.

## Alternativas

- [[herramientas/pydantic-ai]] para salidas tipadas y aprobación diferida.
- [[herramientas/langchain]] y [[herramientas/langgraph]] para middleware y persistencia.
- [[herramientas/google-adk]] o [[herramientas/strands-agents]], SDK de otros proveedores de nube.

## Enlaces

- [Repositorio de Python](https://github.com/openai/openai-agents-python) · [Repositorio de JavaScript](https://github.com/openai/openai-agents-js)
- [PyPI](https://pypi.org/project/openai-agents/) · [npm](https://www.npmjs.com/package/@openai/agents)
- En MoreContext: [[docs/frameworks/06-openai-agents-sdk]] · [[docs/frameworks/02-equivalencias]] · [[recetas/probar-agentes-sin-api]]
