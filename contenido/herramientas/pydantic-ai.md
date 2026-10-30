---
titulo: Pydantic AI
descripcion: Framework abierto de agentes del equipo de Pydantic, con salida validada, dependencias tipadas, aprobación diferida y modelos de prueba para no gastar API.
creado: 2026-10-29
tags: [frameworks, agentes, salida-estructurada, python, open-source]
relacionados: ["[[docs/frameworks/07-pydantic-ai]]", "[[sistemas/extraccion-documental]]", "[[recetas/probar-agentes-sin-api]]", "[[glosario/salida-estructurada]]"]
categoria: framework
licencia: MIT
open_source: true
lenguajes: [Python]
url: https://pydantic.dev/docs/ai/
repositorio: https://github.com/pydantic/pydantic-ai
version: "2.63.0"
revisado: 2026-10-29
---

Pydantic AI es el framework de agentes del equipo de Pydantic: tipado de extremo a extremo, [[glosario/salida-estructurada|salida]] validada con modelos Pydantic, dependencias inyectadas en las herramientas y modelo intercambiable (`"anthropic:…"`, `"ollama:…"`). Lo acompañan `pydantic-graph` (flujos tipados) y `pydantic-evals`.

**Licencia**: MIT, open source, versión estable. Lo comercial: **Logfire**, la plataforma de observabilidad del mismo equipo, que es opcional; vale cualquier backend de OpenTelemetry.

## Para qué sirve

- Agentes cuya salida es un contrato: `output_type=MiModelo` y el resultado llega validado.
- Herramientas que reciben `RunContext[Deps]` con tu base de datos, cliente HTTP o usuario, sin variables globales.
- [[glosario/humano-en-el-bucle|Aprobación humana]] con `requires_approval=True`: el run termina con `DeferredToolRequests` y se reanuda con `DeferredToolResults`.
- Límites con `UsageLimits` y [[glosario/ejecucion-duradera|ejecución duradera]] sobre Temporal, DBOS o Prefect.

## Cuándo usarla

- Extracción documental, clasificación o cualquier caso donde validar la salida importa más que el bucle.
- Cuando quieres pruebas sin API desde el primer día: `TestModel` y `FunctionModel` vienen incluidos.

## Cuándo no

- Grafos multiagente complejos con interrupciones encadenadas: se puede con `pydantic-graph`, pero hay menos ejemplos que en [[herramientas/langgraph]].
- Si necesitas el ecosistema de integraciones de [[herramientas/langchain]].

## Ejemplo mínimo

```python title="agente_pydantic_ai.py"
from dataclasses import dataclass

from pydantic import BaseModel, Field
from pydantic_ai import Agent, ModelRetry, RunContext, UsageLimits
from pydantic_ai.models.anthropic import AnthropicModelSettings

MODEL = "anthropic:claude-sonnet-5-5"     # local: "ollama:qwen3"


@dataclass
class Deps:                               # lo que tus herramientas necesitan (BD, cliente HTTP, usuario…)
    pedidos: dict[str, list[dict]]
    email_cliente: str


class Respuesta(BaseModel):
    respuesta: str = Field(description="Texto para el cliente")
    escalar: bool = Field(description="True si necesita un humano")


agente = Agent(MODEL, deps_type=Deps, output_type=Respuesta,
               instructions="Eres el soporte de una tienda. Usa las herramientas; no inventes datos.",
               model_settings=AnthropicModelSettings(max_tokens=1024))


@agente.tool
def ver_pedidos(ctx: RunContext[Deps]) -> list[dict]:
    """Lista los pedidos del cliente autenticado."""
    pedidos = ctx.deps.pedidos.get(ctx.deps.email_cliente)
    if pedidos is None:
        raise ModelRetry("Ese cliente no tiene pedidos; pide otro email.")   # vuelve al modelo
    return pedidos


deps = Deps(pedidos={"ana@example.com": [{"id": "P-1001", "estado": "enviado"}]}, email_cliente="ana@example.com")
r = agente.run_sync("¿Dónde está mi pedido?", deps=deps, usage_limits=UsageLimits(request_limit=10))
print(r.output)                           # Respuesta(...) validada por Pydantic
```

Lo ejecuté sustituyendo el modelo por `TestModel()`: llama a `ver_pedidos`, devuelve un `Respuesta` válido y `r.usage` registra dos peticiones y una llamada a herramienta.

> [!consejo] Detalles de la 2.x
> `r.usage` es una propiedad, no un método. El banner de consola se quita con `PYDANTIC_AI_NO_BANNER=1`. Para MCP necesitas el extra `pydantic-ai-slim[mcp]`.

## Alternativas

- [[herramientas/langchain]] (`response_format`) si quieres middleware listo.
- [[herramientas/openai-agents-sdk]] (`output_type`) para triaje con handoffs.
- [[herramientas/dspy]] si lo que quieres es optimizar prompts contra una métrica.
- [[herramientas/anthropic-sdk]] con `messages.parse(output_format=…)`, sin framework.

## Enlaces

- [Repositorio](https://github.com/pydantic/pydantic-ai) · [PyPI](https://pypi.org/project/pydantic-ai/)
- En MoreContext: [[docs/frameworks/07-pydantic-ai]] · [[sistemas/extraccion-documental]] · [[docs/frameworks/02-equivalencias]]
