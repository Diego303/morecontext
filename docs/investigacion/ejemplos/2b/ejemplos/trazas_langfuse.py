# Trazas de un agente local con Langfuse (SDK Python v5, basado en OpenTelemetry).
# Entorno: LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_BASE_URL (p. ej. http://localhost:3000 si lo autoalojas)
from langfuse import get_client, observe, propagate_attributes
from langfuse.openai import OpenAI          # envoltorio: cada llamada queda registrada como "generation"

MODEL = "qwen3.6:27b"
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

@observe(as_type="tool")
def buscar_pedido(pedido_id: str) -> dict:
    return {"pedido_id": pedido_id, "estado": "enviado"}

@observe(as_type="agent")
def agente(pregunta: str) -> str:
    with propagate_attributes(session_id="sesion-42", user_id="usuario-7", tags=["local", "soporte"]):
        r = client.chat.completions.create(model=MODEL, messages=[{"role": "user", "content": pregunta}])
        return r.choices[0].message.content

if __name__ == "__main__":
    print(agente("¿Cómo va mi pedido A-123?"))
    get_client().flush()                    # en scripts cortos, vacía el buffer antes de salir
