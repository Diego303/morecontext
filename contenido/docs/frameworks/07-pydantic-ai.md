---
titulo: Pydantic AI
descripcion: "Referencia de Pydantic AI 2.x: Agent, herramientas, dependencias tipadas, output_type, aprobación diferida, Claude y Ollama, pruebas con TestModel y FunctionModel, y grafos."
creado: 2026-10-29
orden: 7
nivel: intermedio
tags: [frameworks, pydantic-ai, agentes, open-source, python, salida-estructurada]
relacionados: ["[[herramientas/pydantic-ai]]", "[[glosario/salida-estructurada]]", "[[glosario/modelo-simulado]]", "[[sistemas/extraccion-documental]]"]
---

**Pydantic AI** es el framework de agentes del equipo de Pydantic. Su idea central es el tipado de extremo a extremo: las dependencias que reciben tus herramientas tienen tipo, la salida del agente se valida contra un modelo de Pydantic y, si no valida, el error vuelve al modelo para que lo corrija. Esta referencia es de `pydantic-ai` 2.63.0 (28 de octubre de 2026), con licencia **MIT** y clasificado como estable. Lo acompañan `pydantic-graph` y `pydantic-evals`, también MIT. Lo comercial es **Logfire**, su servicio de observabilidad, que es opcional: vale cualquier backend OpenTelemetry.

Encaja cuando la salida estructurada es el contrato de tu sistema (extraer datos de documentos, clasificar, rellenar formularios) y cuando quieres probar el agente sin API, que es donde más brilla.

## Instalación y modelos

```bash
pip install "pydantic-ai-slim[anthropic]"     # solo Claude; pydantic-ai trae todos los proveedores
```

El modelo se indica como `"proveedor:modelo"`. Para Claude, `"anthropic:claude-sonnet-5-5"`; los ajustes propios de Anthropic van en `AnthropicModelSettings` con claves prefijadas: `anthropic_effort`, `anthropic_thinking`, `anthropic_cache_instructions`, `anthropic_cache_tool_definitions`, `anthropic_cache_messages`, `anthropic_betas`, `anthropic_context_management`. Para un modelo local con Ollama, la cadena `"ollama:qwen3"` o, con URL explícita:

```python title="modelo_local_pydantic_ai.py"
from pydantic_ai.models.ollama import OllamaModel
from pydantic_ai.providers.ollama import OllamaProvider

MODEL = OllamaModel("qwen3", provider=OllamaProvider(base_url="http://localhost:11434/v1"))
```

La construcción está verificada; la ejecución contra un Ollama real, no. Elige un modelo abierto con soporte de herramientas ([[cursos/agentes-con-modelos-abiertos/04-herramientas-con-modelos-abiertos]]).

## Las piezas

| Pieza | Para qué |
|---|---|
| `Agent(model, deps_type=…, output_type=…, instructions=…, model_settings=…, retries=…)` | Define el agente. Se reutiliza entre ejecuciones |
| `@agente.tool` | Herramienta que recibe `ctx: RunContext[Deps]` (acceso a `ctx.deps`) |
| `@agente.tool_plain` | Herramienta sin contexto |
| `requires_approval=True` | La herramienta no se ejecuta sin aprobación humana |
| `ModelRetry("…")` | Lánzalo desde una herramienta o validador: el texto vuelve al modelo y reintenta |
| `@agente.output_validator` | Validación propia de la salida final; con `ModelRetry` pide otra |
| `UsageLimits(request_limit=…, tool_calls_limit=…, total_tokens_limit=…)` | Topes; al superarlos, `UsageLimitExceeded` |
| `run`, `run_sync`, `run_stream`, `run_stream_events`, `iter` | Formas de ejecutar; `iter` recorre el bucle nodo a nodo |
| `ToolOutput`, `NativeOutput`, `PromptedOutput` | Cómo se obtiene la salida: herramienta de salida (por defecto), salida nativa del proveedor o instrucciones en el prompt |

**`deps_type`** es la pieza que más se echa de menos en otros frameworks. Declaras qué necesitan tus herramientas (una conexión a base de datos, un cliente HTTP, el usuario autenticado) y lo pasas en cada ejecución con `deps=…`. Las herramientas lo reciben tipado y no dependen de variables globales, así que en las pruebas pasas unas dependencias falsas.

## Ejemplo completo

Un agente de soporte con dependencias tipadas, salida validada, un reintento guiado y un reembolso que exige aprobación.

```python title="agente_pydantic_ai.py"
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
    defer_model_check=True,                          # no pide la clave al importar (cómodo en pruebas)
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
    print(r.usage)             # en la 2.x es una propiedad, no un método
```

Cómo funciona la aprobación ([[glosario/humano-en-el-bucle]]): si el modelo pide `reembolsar`, el run **termina** con `r.output` de tipo `DeferredToolRequests` en lugar de ejecutar. Tu aplicación enseña la petición, guarda `r.all_messages()` y, cuando la persona decide, reanuda con:

```python nocheck
agente.run_sync(message_history=r.all_messages(),
                deferred_tool_results=DeferredToolResults(approvals={call_id: True}),   # o ToolDenied("motivo")
                deps=deps)
```

Un `ToolDenied("motivo")` llega al modelo como resultado de la herramienta, igual que el `tool_result` con `is_error` de [[docs/agentes/03-humano-en-el-bucle]]. Si tras agotar `retries` el modelo sigue fallando con `ModelRetry`, salta `UnexpectedModelBehavior`.

`defer_model_check=True` evita que el agente exija `ANTHROPIC_API_KEY` al importarse. Sin él, importar el módulo en una prueba sin clave falla con `UserError`.

## Probarlo sin API

Pydantic AI trae dos [[glosario/modelo-simulado|modelos simulados]] y una forma limpia de sustituir el real: `agente.override(model=…)`.

- **`TestModel`** llama a las herramientas que le indiques y genera datos válidos para tu `output_type`. Comprueba que el cableado funciona.
- **`FunctionModel(funcion)`** te deja escribir qué responde el «modelo» en cada turno. Comprueba una trayectoria concreta.

```python title="prueba_agente_pydantic_ai.py"
from pydantic_ai import DeferredToolRequests, DeferredToolResults, ToolDenied
from pydantic_ai.messages import ModelResponse, ToolCallPart
from pydantic_ai.models.function import AgentInfo, FunctionModel
from pydantic_ai.models.test import TestModel

from agente_pydantic_ai import Deps, Respuesta, agente

deps = Deps(pedidos={"ana@example.com": [{"id": "P-1001", "estado": "enviado"}]}, email_cliente="ana@example.com")


def test_testmodel_rellena_la_salida():
    # TestModel llama a las herramientas que le digas y genera una salida válida para el esquema.
    with agente.override(model=TestModel(call_tools=["ver_pedidos"])):
        r = agente.run_sync("¿Dónde está mi pedido?", deps=deps)
    assert isinstance(r.output, Respuesta)


def guion(mensajes, info: AgentInfo) -> ModelResponse:
    # FunctionModel: tú decides qué responde el "modelo" en cada turno.
    if len(mensajes) == 1:
        return ModelResponse(parts=[ToolCallPart("reembolsar", {"pedido_id": "P-1001", "importe_eur": 49.9},
                                                 tool_call_id="t1")])
    resultado = mensajes[-1].parts[-1].content            # lo que devolvió (o no) el reembolso
    salida = info.output_tools[0].name                    # la herramienta interna de salida
    return ModelResponse(parts=[ToolCallPart(salida, {"respuesta": str(resultado),
                                                      "pedidos_citados": ["P-1001"], "escalar": False})])


def test_reembolso_espera_aprobacion():
    with agente.override(model=FunctionModel(guion)):
        r = agente.run_sync("Devolvedme P-1001", deps=deps)
        assert isinstance(r.output, DeferredToolRequests)  # pausado: nada se ha ejecutado
        llamada = r.output.approvals[0]
        rechazo = DeferredToolResults(approvals={llamada.tool_call_id: ToolDenied("El supervisor no lo aprueba.")})
        r2 = agente.run_sync(message_history=r.all_messages(), deferred_tool_results=rechazo, deps=deps)
    assert "supervisor" in r2.output.respuesta
```

Las dos pruebas pasan sin clave ni red. La segunda fija lo que importa en producción: el reembolso no se ejecuta sin aprobación y el rechazo llega al modelo. Cómo llevar esto a CI: [[recetas/probar-agentes-sin-api]] y [[roadmap/80-evals/04-evals-de-trayectoria]].

## Grafos con `pydantic-graph`

Para flujos que son una máquina de estados y no un único bucle, `pydantic-graph` define nodos como clases. Cada nodo hereda de `BaseNode`, y **las aristas salen de los tipos de retorno de `run()`**: si `Revisar.run` devuelve `Escribir | End[str]`, el grafo sabe que de `Revisar` se va a `Escribir` o al final. Aquí, un [[patrones/07-evaluador-optimizador|evaluador-optimizador]] en el que el evaluador es código:

```python title="titular_grafo.py"
from __future__ import annotations

from dataclasses import dataclass

from pydantic_ai import Agent
from pydantic_graph import BaseNode, End, GraphBuilder, GraphRunContext

MODEL = "anthropic:claude-sonnet-5-5"
redactor = Agent(MODEL, instructions="Escribe titulares de prensa.", defer_model_check=True)


@dataclass
class Estado:
    tema: str
    intentos: int = 0


@dataclass
class Escribir(BaseNode[Estado]):
    nota: str = ""

    async def run(self, ctx: GraphRunContext[Estado]) -> Revisar:
        ctx.state.intentos += 1
        r = await redactor.run(f"Titular sobre: {ctx.state.tema}. {self.nota}")
        return Revisar(r.output)


@dataclass
class Revisar(BaseNode[Estado, None, str]):
    titular: str

    async def run(self, ctx: GraphRunContext[Estado]) -> Escribir | End[str]:
        if len(self.titular) <= 60 or ctx.state.intentos >= 3:   # la comprobación es código
            return End(self.titular)
        return Escribir(nota=f"El anterior tenía {len(self.titular)} caracteres: máximo 60.")


g = GraphBuilder(state_type=Estado, input_type=Escribir, output_type=str)
g.add(
    g.edge_from(g.start_node).to(Escribir),
    g.node(Escribir),                     # las aristas salen de los tipos de retorno de run()
    g.node(Revisar),
)
grafo = g.build()
# titular = grafo.run_sync(state=Estado(tema="agentes en producción"), inputs=Escribir())
```

Con un `FunctionModel` que devuelve primero un titular de 70 caracteres y luego uno corto, el grafo hace dos vueltas y termina. `GraphBuilder` admite también pasos como funciones (`@g.step`) y paralelismo con `Fork` y `Join`. Es menos usado que [[docs/frameworks/05-langgraph|LangGraph]] y hay menos ejemplos; para grafos con muchas interrupciones encadenadas, LangGraph va más rodado.

## Durabilidad, MCP y observabilidad

- **Ejecución duradera** ([[glosario/ejecucion-duradera]]): integraciones con Temporal, DBOS y Prefect en `pydantic_ai.durable_exec.*`, que se activan como *capabilities* del agente (`TemporalDurability`, `DBOSDurability`, `PrefectDurability`). Cada una necesita su paquete (`temporalio`, `dbos`…). Úsalas si ya tienes ese motor; montar uno solo para esto es mucho.
- **MCP**: `pydantic_ai.mcp.MCPToolset` (extra `pydantic-ai-slim[mcp]`) o `capabilities=[MCP(url)]` con `from pydantic_ai.capabilities import MCP` ([[docs/herramientas/02-mcp]]).
- **Trazas**: Logfire o cualquier backend OpenTelemetry ([[docs/produccion/04-opentelemetry-genai]]). Para depurar sin nada instalado, `r.all_messages()` y el gestor de contexto `capture_run_messages()`, que te da los mensajes aunque el run termine en excepción.

## Cuándo encaja y cuándo no

Encaja si:

- La salida estructurada es el producto ([[sistemas/extraccion-documental]]).
- Quieres herramientas con dependencias inyectadas y probables.
- Ya usas Pydantic y te gusta el tipado estricto.

No encaja tanto si:

- Necesitas el catálogo de integraciones de LangChain (cargadores, almacenes vectoriales, middleware).
- Tu flujo es un grafo grande con muchas pausas humanas.

## Errores frecuentes

- **Llamar a `r.usage()`**: en la 2.x es una propiedad, `r.usage`.
- **Olvidar `DeferredToolRequests` en `output_type`** cuando hay herramientas con aprobación: en cuanto el modelo pide una, el run falla con `UserError` («A deferred tool call was present, but `DeferredToolRequests` is not among output types»).
- **El banner de consola** de la 2.x en scripts y CI: se quita con `PYDANTIC_AI_NO_BANNER=1` o configurando la observabilidad.
- **No pasar `max_tokens`** en `model_settings`.

## Ver también

- [[docs/frameworks/02-equivalencias]]: el mismo concepto en los demás frameworks.
- [[docs/prompting/03-salida-estructurada]]: la salida estructurada sin framework.
- [[herramientas/pydantic-ai]]: ficha del directorio.
- [[docs/frameworks/01-elegir-framework]]: cuándo elegirlo.
