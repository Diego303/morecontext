---
titulo: LlamaIndex
descripcion: "Referencia de LlamaIndex para agentes: Workflows por eventos, FunctionAgent y AgentWorkflow, ingesta e índices para RAG, Claude y Ollama, y cuándo encaja."
creado: 2026-10-29
orden: 8
nivel: intermedio
tags: [frameworks, llamaindex, rag, agentes, open-source, python]
relacionados: ["[[herramientas/llamaindex]]", "[[glosario/rag-agentico]]", "[[cursos/rag-a-fondo/index]]", "[[sistemas/rag-con-citas]]"]
---

**LlamaIndex** es un framework de Python orientado a datos: cargar documentos, trocearlos, indexarlos y recuperarlos para [[glosario/rag|RAG]]. Encima tiene agentes construidos sobre **Workflows**, un motor de pasos que se comunican con eventos. El núcleo es `llama-index-core` (0.14.25, 21 de septiembre de 2026), con licencia **MIT**, y cada integración es un paquete aparte: `llama-index-llms-anthropic`, `llama-index-llms-ollama`, `llama-index-embeddings-ollama`… La empresa detrás ofrece servicios de pago (LlamaCloud y LlamaParse, para ingesta y análisis de documentos); no hacen falta para nada de esta página y sus condiciones están en su web.

Su terreno es el RAG con mucha ingesta. Si tu agente no trabaja con documentos, aporta poco frente a un SDK más pequeño.

## Paquetes y modelos

```bash
pip install llama-index-core llama-index-llms-anthropic          # Claude
pip install llama-index-llms-ollama llama-index-embeddings-ollama # local
```

El modelo y los *embeddings* se configuran una vez en `Settings` (o se pasan a cada componente). Anthropic no ofrece modelo de [[glosario/embeddings|embeddings]], así que con Claude necesitas otro para indexar.

```python tab="LlamaIndex" title="config_llamaindex.py" nocheck
from llama_index.core import Settings
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.llms.anthropic import Anthropic

MODEL = "claude-sonnet-5-5"
Settings.llm = Anthropic(model=MODEL, max_tokens=1024)        # lee ANTHROPIC_API_KEY
Settings.embed_model = OllamaEmbedding(model_name="nomic-embed-text", base_url="http://localhost:11434")
```

```python tab="Ollama" title="config_llamaindex_local.py" nocheck
from llama_index.core import Settings
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.llms.ollama import Ollama

Settings.llm = Ollama(model="qwen3", request_timeout=120.0, context_window=32768)
Settings.embed_model = OllamaEmbedding(model_name="nomic-embed-text", base_url="http://localhost:11434")
```

Estos dos bloques usan integraciones que no están en el entorno de comprobación de la web: se construyeron (sin llamar a ningún servidor) en un entorno aparte con `llama-index-llms-anthropic` 0.12.3, `llama-index-llms-ollama` 0.11.0 y `llama-index-embeddings-ollama` 0.10.0. `Anthropic` admite también `thinking_dict` y `cache_idx` (caché de prompts); `Ollama`, `base_url` y `thinking`.

> [!aviso] El embedding por defecto es de OpenAI
> Si no configuras `Settings.embed_model`, LlamaIndex intenta usar el modelo de embeddings de OpenAI. Solo con `llama-index-core` falla con `ImportError` (pide `llama-index-embeddings-openai`); con ese paquete y una clave instalados, manda tus documentos a OpenAI sin que lo hayas decidido. Fíjalo siempre de forma explícita.

## Ingesta e índices

El camino de RAG en tres pasos, que es lo que explica [[cursos/rag-a-fondo/02-indexar-bien]]:

1. **Leer**: `SimpleDirectoryReader(carpeta).load_data()` devuelve `Document`s con metadatos (ruta del archivo, fechas).
2. **Trocear** ([[glosario/chunking]]): `SentenceSplitter(chunk_size=…, chunk_overlap=…)` corta respetando frases. Se pasa en `transformations`.
3. **Indexar y consultar**: `VectorStoreIndex.from_documents(docs, transformations=[…], storage_context=…)` calcula los embeddings y guarda los nodos; `indice.as_query_engine(similarity_top_k=3)` recupera y genera la respuesta; `indice.as_retriever()` solo recupera.

`storage_context` decide dónde viven los vectores. Por defecto, en memoria; con las integraciones de almacenes vectoriales, en [[herramientas/qdrant|Qdrant]], [[herramientas/pgvector|pgvector]] u otros.

## Agentes: `FunctionAgent`

`FunctionAgent(tools, llm, system_prompt, name, description, can_handoff_to, output_cls, …)` es el agente con llamada a herramientas. Acepta funciones Python normales: el nombre y el docstring se convierten en la definición de la herramienta. Un índice se convierte en herramienta con `QueryEngineTool`, y así el agente decide cuándo buscar: es [[glosario/rag-agentico|RAG agéntico]].

```python title="agente_rag_llamaindex.py"
from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex
from llama_index.core.agent.workflow import FunctionAgent
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.tools import QueryEngineTool


def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email."""
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


def crear_agente(carpeta: str = "docs_tienda") -> FunctionAgent:
    # 1. Ingesta: leer, trocear e indexar (usa Settings.embed_model para los embeddings)
    documentos = SimpleDirectoryReader(carpeta).load_data()
    indice = VectorStoreIndex.from_documents(
        documentos, transformations=[SentenceSplitter(chunk_size=512, chunk_overlap=64)])

    # 2. El índice como herramienta: el agente decide cuándo consultarlo (RAG agéntico)
    politicas = QueryEngineTool.from_defaults(
        indice.as_query_engine(similarity_top_k=3), name="buscar_politicas",
        description="Busca en las políticas de la tienda (devoluciones, envíos, pagos). Pasa una pregunta concreta.")

    # 3. El agente: las funciones Python se convierten en herramientas (docstring = descripción)
    return FunctionAgent(tools=[ver_pedidos, politicas], llm=Settings.llm,
                         system_prompt="Eres el soporte de una tienda. Usa las herramientas; no inventes datos.")


# respuesta = await crear_agente().run(user_msg="Soy ana@example.com, ¿puedo devolver mi pedido?")
```

`agente.run(...)` devuelve un *handler*: con `await handler` obtienes la respuesta final, y con `async for evento in handler.stream_events()` ves cada paso (`ToolCall`, `ToolCallResult`, tokens…), que es tu traza ([[roadmap/40-primer-agente/06-depurar-con-trazas]]). Tiene que llamarse dentro de un bucle de eventos en marcha: en un script, envuélvelo en una función `async` y `asyncio.run(...)`.

### Probarlo sin API

`llama-index-core` trae modelos simulados: `MockEmbedding(embed_dim=…)` para indexar sin servidor y `MockFunctionCallingLLM(response_generator=…)`, al que le das una función que recibe los mensajes y devuelve el siguiente `ChatMessage`, con bloques `ToolCallBlock` si quieres que pida una herramienta. Con ellos, el ejemplo de arriba se ejecuta entero: el «modelo» pide `buscar_politicas`, el índice recupera el fragmento de devoluciones y el agente responde. Más técnicas en [[recetas/probar-agentes-sin-api]].

```python title="prueba_rag_llamaindex.py"
import asyncio

from llama_index.core import MockEmbedding, Settings
from llama_index.core.base.llms.types import ChatMessage, ToolCallBlock
from llama_index.core.llms import MessageRole, MockFunctionCallingLLM


def guion(messages, **kwargs):
    if not any(m.role == MessageRole.TOOL for m in messages):     # primer turno: pide la herramienta
        return ChatMessage(role="assistant", blocks=[ToolCallBlock(
            tool_call_id="c1", tool_name="buscar_politicas", tool_kwargs={"input": "plazo de devolución"})])
    return ChatMessage(role="assistant", content="Tienes 30 días.")


Settings.embed_model = MockEmbedding(embed_dim=8)
Settings.llm = MockFunctionCallingLLM(response_generator=guion)
from agente_rag_llamaindex import crear_agente  # noqa: E402  (después de configurar Settings)


async def main():
    respuesta = await crear_agente().run(user_msg="¿Cuánto tiempo tengo para devolver?")
    assert str(respuesta) == "Tienes 30 días."


if __name__ == "__main__":
    asyncio.run(main())
```

## Varios agentes: `AgentWorkflow`

`AgentWorkflow(agents=[…], root_agent="…")` junta varios `FunctionAgent`. Cada uno declara a quién puede pasar la conversación con `can_handoff_to`, y LlamaIndex le añade una herramienta `handoff` para hacerlo: el mismo [[glosario/handoff|handoff]] del [[docs/frameworks/06-openai-agents-sdk|OpenAI Agents SDK]].

```python title="equipo_llamaindex.py"
from llama_index.core import Settings
from llama_index.core.agent.workflow import AgentWorkflow, FunctionAgent


def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email."""
    return '[{"id": "P-1001", "estado": "entregado"}]' if email == "ana@example.com" else "Sin pedidos."


def abrir_devolucion(pedido_id: str, motivo: str) -> str:
    """Abre una solicitud de devolución. No emite el reembolso: eso lo revisa una persona."""
    return f"Solicitud de devolución abierta para {pedido_id}."


triaje = FunctionAgent(
    name="triaje", description="Atiende al cliente y deriva las devoluciones.",
    system_prompt="Eres el soporte de una tienda. Si piden una devolución, pasa a 'devoluciones'.",
    tools=[ver_pedidos], llm=Settings.llm, can_handoff_to=["devoluciones"])
devoluciones = FunctionAgent(
    name="devoluciones", description="Gestiona devoluciones.",
    system_prompt="Comprueba el pedido y abre la devolución.",
    tools=[ver_pedidos, abrir_devolucion], llm=Settings.llm)

equipo = AgentWorkflow(agents=[triaje, devoluciones], root_agent="triaje")
# respuesta = await equipo.run(user_msg="Soy ana@example.com y quiero devolver P-1001")
```

Con un modelo simulado que primero llama a `handoff` (`to_agent="devoluciones"`) y luego a `abrir_devolucion`, la respuesta final sale del agente `devoluciones`. Fíjate en que la herramienta irreversible (el reembolso) no está: el agente abre una solicitud y una persona decide ([[docs/agentes/03-humano-en-el-bucle]]).

## Workflows por eventos

Debajo de los agentes están los Workflows (paquete `llama-index-workflows`). Un `Workflow` es una clase con métodos `@step`; cada paso recibe un evento y devuelve otro, y el tipo del evento decide qué paso se ejecuta después. Empieza con `StartEvent` y acaba con `StopEvent(result=…)`. El estado compartido va en `ctx.store`.

```python title="titular_workflow.py"
from llama_index.core.workflow import Context, Event, StartEvent, StopEvent, Workflow, step


class Borrador(Event):
    texto: str


class Titular(Workflow):
    def __init__(self, generar, **kw):
        super().__init__(**kw)
        self.generar = generar                      # función async texto -> texto (tu LLM)

    @step
    async def escribir(self, ctx: Context, ev: StartEvent) -> Borrador:
        await ctx.store.set("intentos", 0)          # estado compartido entre pasos
        return Borrador(texto=await self.generar(f"Escribe un titular sobre: {ev.tema}"))

    @step
    async def revisar(self, ctx: Context, ev: Borrador) -> Borrador | StopEvent:
        intentos = await ctx.store.get("intentos") + 1
        await ctx.store.set("intentos", intentos)
        if len(ev.texto) <= 60 or intentos >= 3:    # la comprobación es código, no otro LLM
            return StopEvent(result=ev.texto)
        return Borrador(texto=await self.generar(f"Acórtalo a 60 caracteres: {ev.texto}"))


# titular = await Titular(generar=mi_llm, timeout=60).run(tema="agentes en producción")
```

Es un [[patrones/07-evaluador-optimizador|evaluador-optimizador]] con tope de tres intentos. `timeout` (45 s por defecto) corta el workflow entero: súbelo si tus pasos llaman a modelos lentos.

## Cuándo encaja

| Situación | ¿LlamaIndex? |
|---|---|
| RAG con muchos formatos y fuentes, ingesta que mantener | Sí: es su punto fuerte |
| Agente que consulta documentos y además usa herramientas | Sí, con `QueryEngineTool` |
| Agente sin documentos | Mejor [[docs/frameworks/04-langchain\|LangChain]], [[docs/frameworks/07-pydantic-ai\|Pydantic AI]] o el SDK |
| Flujos con aprobaciones que tardan días | Mejor [[docs/frameworks/05-langgraph\|LangGraph]], con checkpoints por paso |
| Pipelines de RAG explícitos y de producción | Compáralo con Haystack ([[docs/frameworks/09-otros-frameworks]]) |

## Errores frecuentes

- No fijar `Settings.embed_model` (ver el aviso).
- Reindexar todo en cada arranque: persiste el índice en un almacén vectorial y reindexa solo lo que cambia ([[recetas/reindexado-incremental]]).
- Llamar a `agente.run` fuera de un bucle de eventos: `RuntimeError: no running event loop`.
- Fragmentos demasiado grandes o pequeños: mide con [[cursos/rag-a-fondo/10-evaluar-un-rag]] antes de tocar `chunk_size`.

## Ver también

- [[cursos/rag-a-fondo/index]]: el RAG explicado sin framework.
- [[docs/contexto/03-rag]]: la referencia de RAG de MoreContext.
- [[herramientas/llamaindex]]: ficha del directorio.
- [[docs/frameworks/02-equivalencias]]: el mismo concepto en otros frameworks.
