# Agente con LangChain 1.x: ChatOllama + create_agent (el bucle lo gestiona LangChain).
from langchain.agents import create_agent
from langchain_ollama import ChatOllama

def buscar_pedido(pedido_id: str) -> str:
    """Devuelve el estado de un pedido a partir de su identificador."""
    return f"El pedido {pedido_id} está enviado"

llm = ChatOllama(model="qwen3.6:27b", num_ctx=32768, temperature=0, reasoning=False)
agente = create_agent(model=llm, tools=[buscar_pedido], system_prompt="Eres un agente de soporte.")

if __name__ == "__main__":
    salida = agente.invoke({"messages": [{"role": "user", "content": "¿Cómo va mi pedido A-123?"}]})
    print(salida["messages"][-1].content)
