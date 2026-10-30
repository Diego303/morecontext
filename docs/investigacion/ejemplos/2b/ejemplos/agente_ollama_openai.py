# Agente mínimo con tool calling contra Ollama vía su API compatible con OpenAI.
# Requisitos: `ollama pull qwen3.6:27b` (o cualquier modelo con la etiqueta "tools") y `pip install openai`.
import json
from openai import OpenAI

MODEL = "qwen3.6:27b"   # una constante arriba; cámbiala por el modelo que tengas
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")  # la clave es obligatoria pero se ignora

def buscar_pedido(pedido_id: str) -> dict:
    return {"pedido_id": pedido_id, "estado": "enviado"}  # sustituye por tu sistema real

TOOLS = [{
    "type": "function",
    "function": {
        "name": "buscar_pedido",
        "description": "Devuelve el estado de un pedido a partir de su identificador.",
        "parameters": {"type": "object",
                       "properties": {"pedido_id": {"type": "string", "description": "Identificador, p. ej. A-123"}},
                       "required": ["pedido_id"]},
    },
}]
FUNCIONES = {"buscar_pedido": buscar_pedido}

messages = [{"role": "system", "content": "Eres un agente de soporte. Usa herramientas cuando necesites datos."},
            {"role": "user", "content": "¿Cómo va mi pedido A-123?"}]

for paso in range(5):                      # límite de pasos: nunca un bucle sin tope
    resp = client.chat.completions.create(model=MODEL, messages=messages, tools=TOOLS)
    msg = resp.choices[0].message
    if not msg.tool_calls:                 # sin llamadas: respuesta final
        print(msg.content)
        break
    messages.append(msg.model_dump(exclude_none=True))
    for call in msg.tool_calls:
        try:
            args = json.loads(call.function.arguments)   # valida: un modelo local puede generar JSON roto
            resultado = FUNCIONES[call.function.name](**args)
        except Exception as e:
            resultado = {"error": str(e)}
        messages.append({"role": "tool", "tool_call_id": call.id, "content": json.dumps(resultado, ensure_ascii=False)})
