import asyncio

from li_01_llamaindex import Encadenado, crear_agente

respuestas = iter(["Un titular larguísimo que no cabe en sesenta caracteres de ninguna manera posible", "Titular corto"])


async def generar(prompt: str) -> str:
    return next(respuestas)


async def main():
    wf = Encadenado(generar, timeout=10)
    print("workflow ->", await wf.run(tema="agentes"))
    a = crear_agente()
    print("FunctionAgent construido:", type(a).__name__, "| tools:", [t.metadata.name for t in a.tools],
          "| llm:", type(a.llm).__name__, a.llm.model)
    print("schema:", a.tools[0].metadata.fn_schema.model_json_schema())


asyncio.run(main())
