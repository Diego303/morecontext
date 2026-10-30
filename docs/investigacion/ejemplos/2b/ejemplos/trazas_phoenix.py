# Trazas con Arize Phoenix: servidor local con `phoenix serve` (UI en http://localhost:6006).
# pip install arize-phoenix-otel openinference-instrumentation-openai openai
from phoenix.otel import register

tracer_provider = register(project_name="agente-local", endpoint="http://localhost:6006/v1/traces",
                           auto_instrument=True)   # instrumenta las librerías con instrumentador OpenInference instalado
tracer = tracer_provider.get_tracer(__name__)

from openai import OpenAI
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

@tracer.agent
def agente(pregunta: str) -> str:
    r = client.chat.completions.create(model="qwen3.6:27b", messages=[{"role": "user", "content": pregunta}])
    return r.choices[0].message.content
