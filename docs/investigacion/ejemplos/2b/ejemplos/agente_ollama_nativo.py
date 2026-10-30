# Mismo agente con el cliente oficial `ollama` y la API nativa /api/chat.
from ollama import chat

MODEL = "qwen3.6:27b"

def buscar_pedido(pedido_id: str) -> str:
    """Devuelve el estado de un pedido.

    Args:
      pedido_id: Identificador del pedido, p. ej. A-123
    """
    return f"El pedido {pedido_id} está enviado"

FUNCIONES = {"buscar_pedido": buscar_pedido}
messages = [{"role": "user", "content": "¿Cómo va mi pedido A-123?"}]
for paso in range(5):
    r = chat(model=MODEL, messages=messages, tools=[buscar_pedido], think=False,
             options={"num_ctx": 32768})          # contexto explícito: el valor por defecto puede ser pequeño
    messages.append(r.message)
    if not r.message.tool_calls:
        print(r.message.content)
        break
    for call in r.message.tool_calls:
        salida = FUNCIONES[call.function.name](**call.function.arguments)
        messages.append({"role": "tool", "tool_name": call.function.name, "content": str(salida)})
