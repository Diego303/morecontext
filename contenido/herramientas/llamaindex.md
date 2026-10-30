---
titulo: LlamaIndex
descripcion: Framework abierto orientado a datos y RAG (ingesta, índices, retrievers) con agentes y workflows por eventos encima.
creado: 2026-10-29
tags: [frameworks, rag, workflows, python, open-source]
relacionados: ["[[docs/frameworks/08-llamaindex]]", "[[cursos/rag-a-fondo/index]]", "[[herramientas/haystack]]", "[[glosario/rag]]"]
categoria: framework
licencia: MIT
open_source: true
lenguajes: [Python]
url: https://llamaindex.ai
repositorio: https://github.com/run-llama/llama_index
version: "0.14.25"
revisado: 2026-10-29
---

LlamaIndex es un framework pensado para conectar modelos con tus datos: ingesta de documentos, índices, *retrievers* y [[glosario/rag|RAG]]. Encima trae agentes (`FunctionAgent`, `AgentWorkflow`) construidos sobre *Workflows*, un motor de pasos que se comunican por eventos.

**Licencia**: MIT, open source (`llama-index-core` 0.14.25 y las integraciones como `llama-index-llms-anthropic` o `llama-index-llms-ollama`). Lo comercial: **LlamaCloud** y **LlamaParse** son servicios de pago de la misma empresa; no los necesitas para usar la librería.

## Para qué sirve

- RAG con mucha ingesta: muchos formatos, conectores y estrategias de troceado (`VectorStoreIndex.from_documents(...)`).
- Workflows por eventos: cada `@step` recibe un evento y devuelve otro, con estado compartido en `ctx.store`.
- Agentes con herramientas: `FunctionAgent(tools=[…], llm=Anthropic(model="claude-sonnet-5-5", max_tokens=1024), system_prompt=…)` y `await agente.run(user_msg=…)`.

## Cuándo usarla

Cuando el problema son los datos: muchos documentos, varios formatos, índices que mantener. También si te encaja modelar un flujo como eventos.

## Cuándo no

Agentes sin documentos: frente a SDK más pequeños como [[herramientas/pydantic-ai]] o [[herramientas/anthropic-sdk]], aporta poco.

## Ejemplo mínimo

Un Workflow que genera un titular y lo recorta hasta que cabe. La comprobación es código, no otro modelo, y el número de intentos tiene tope:

```python title="workflow_titular.py"
import asyncio

from llama_index.core.workflow import Context, Event, StartEvent, StopEvent, Workflow, step


class Borrador(Event):
    texto: str


class Titular(Workflow):
    def __init__(self, generar, **kw):
        super().__init__(**kw)
        self.generar = generar                      # función async texto -> texto (tu LLM)

    @step
    async def escribir(self, ctx: Context, ev: StartEvent) -> Borrador:
        await ctx.store.set("intentos", 0)
        return Borrador(texto=await self.generar(f"Escribe un titular sobre: {ev.tema}"))

    @step
    async def revisar(self, ctx: Context, ev: Borrador) -> Borrador | StopEvent:
        intentos = await ctx.store.get("intentos") + 1
        await ctx.store.set("intentos", intentos)
        if len(ev.texto) <= 60 or intentos >= 3:    # la comprobación es código, no otro LLM
            return StopEvent(result=ev.texto)
        return Borrador(texto=await self.generar(f"Acórtalo a 60 caracteres: {ev.texto}"))


async def generar_simulado(prompt: str) -> str:     # sustitúyelo por tu LLM (Anthropic, Ollama…)
    return "Un titular demasiado largo para caber en sesenta caracteres, de verdad" if "Escribe" in prompt else "Titular corto"


async def main():
    return await Titular(generar_simulado, timeout=30).run(tema="agentes de IA")   # run() se espera con await


print(asyncio.run(main()))
```

Lo ejecuté tal cual: el primer borrador supera los 60 caracteres, el paso `revisar` pide otro y el resultado es «Titular corto». La construcción de `FunctionAgent` con Claude está verificada aparte (necesita `pip install llama-index-llms-anthropic`).

> [!aviso] `run()` necesita un bucle de eventos en marcha
> En la versión actual, `Workflow.run()` crea su tarea en el bucle que ya está corriendo, así que hay que llamarlo dentro de una función `async`. Escribir `asyncio.run(flujo.run(...))` falla con `RuntimeError: no running event loop`, porque `run()` se evalúa antes de que exista el bucle.

## Alternativas

- [[herramientas/haystack]] para RAG de producción con pipelines explícitos.
- [[herramientas/docling]] si solo necesitas convertir documentos.
- [[herramientas/langgraph]] para flujos con estado y aprobación humana.

## Enlaces

- [PyPI de llama-index-core](https://pypi.org/project/llama-index-core/) · [Integración con Anthropic](https://pypi.org/project/llama-index-llms-anthropic/) · [Integración con Ollama](https://pypi.org/project/llama-index-llms-ollama/)
- En MoreContext: [[docs/frameworks/08-llamaindex]] · [[sistemas/rag-con-citas]] · [[cursos/rag-a-fondo/index]]
