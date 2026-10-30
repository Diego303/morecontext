# Salida estructurada con la API nativa: `format` recibe un JSON Schema.
from ollama import chat
from pydantic import BaseModel

class Ticket(BaseModel):
    categoria: str
    urgente: bool

r = chat(model="qwen3.6:27b", messages=[{"role": "user", "content": "Clasifica: 'Me cobrasteis dos veces, lo necesito hoy'"}],
         format=Ticket.model_json_schema(), options={"temperature": 0})
ticket = Ticket.model_validate_json(r.message.content)   # valida siempre
print(ticket)
