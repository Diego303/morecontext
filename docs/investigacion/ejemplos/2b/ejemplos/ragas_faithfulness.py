# RAGAS 0.4.x: métrica de fidelidad con un juez servido por Ollama (API compatible con OpenAI).
# Ojo: ragas 0.4.3 falla al importar con langchain-community>=0.4; fija "langchain-community<0.4".
import asyncio
from openai import AsyncOpenAI
from ragas.llms import llm_factory
from ragas.metrics.collections import Faithfulness

juez = llm_factory("qwen3.6:27b", provider="openai",
                   client=AsyncOpenAI(base_url="http://localhost:11434/v1", api_key="ollama"))
metrica = Faithfulness(llm=juez)

async def main():
    r = await metrica.ascore(
        user_input="¿Cuánto tiempo tengo para devolver un producto?",
        response="Tienes 30 días desde la entrega.",
        retrieved_contexts=["Las devoluciones se aceptan durante 30 días naturales desde la entrega."],
    )
    print(r.value, r.reason)

asyncio.run(main())
