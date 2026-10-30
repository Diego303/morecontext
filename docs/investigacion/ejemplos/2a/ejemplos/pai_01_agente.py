"""Pydantic AI · agente de soporte con dependencias tipadas, herramientas,
salida estructurada validada y aprobación humana (herramientas diferidas).

pip install -U "pydantic-ai-slim[anthropic]"     # Claude
pip install -U "pydantic-ai-slim[openai]"        # Ollama usa su API compatible con OpenAI
"""
from dataclasses import dataclass

from pydantic import BaseModel, Field
from pydantic_ai import Agent, DeferredToolRequests, ModelRetry, RunContext, UsageLimits
from pydantic_ai.models.anthropic import AnthropicModelSettings

MODEL = "anthropic:claude-sonnet-5-5"
# Local: from pydantic_ai.models.ollama import OllamaModel; from pydantic_ai.providers.ollama import OllamaProvider
#        MODEL = OllamaModel("qwen3", provider=OllamaProvider(base_url="http://localhost:11434/v1"))


@dataclass
class Deps:                                   # lo que tus herramientas necesitan (BD, cliente HTTP, usuario…)
    pedidos: dict[str, list[dict]]
    email_cliente: str


class Respuesta(BaseModel):
    respuesta: str = Field(description="Texto para el cliente")
    pedidos_citados: list[str] = Field(description="Ids de pedido usados en la respuesta")
    escalar: bool = Field(description="True si necesita un humano")


agente = Agent(
    MODEL,
    deps_type=Deps,
    output_type=[Respuesta, DeferredToolRequests],   # DeferredToolRequests: el run puede acabar pidiendo aprobación
    instructions="Eres el soporte de una tienda. Usa las herramientas; no inventes datos.",
    model_settings=AnthropicModelSettings(max_tokens=1024, anthropic_effort="medium"),
    retries=2,                                       # reintentos por validación/ModelRetry
)


@agente.tool
def ver_pedidos(ctx: RunContext[Deps]) -> list[dict]:
    """Lista los pedidos del cliente autenticado."""
    pedidos = ctx.deps.pedidos.get(ctx.deps.email_cliente)
    if pedidos is None:
        raise ModelRetry("Ese cliente no tiene pedidos; pide otro email.")   # vuelve al modelo como reintento
    return pedidos


@agente.tool_plain(requires_approval=True)          # no se ejecuta sin aprobación humana
def reembolsar(pedido_id: str, importe_eur: float) -> str:
    """Emite un reembolso. Acción irreversible."""
    return f"Reembolso de {importe_eur} € emitido para {pedido_id}."


if __name__ == "__main__":
    deps = Deps(pedidos={"ana@example.com": [{"id": "P-1001", "estado": "enviado"}]}, email_cliente="ana@example.com")
    r = agente.run_sync("¿Dónde está mi pedido?", deps=deps, usage_limits=UsageLimits(request_limit=10))
    print(r.output)            # Respuesta(...) validada por Pydantic, o DeferredToolRequests si pide aprobación
    print(r.usage)
