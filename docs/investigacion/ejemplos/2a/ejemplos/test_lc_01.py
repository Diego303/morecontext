"""Ejecuta lc_01_agente con un modelo simulado: comprueba tool_calls paralelos,
ToolMessage por cada llamada, y qué pasa cuando una herramienta lanza excepción."""
import traceback

from langchain_core.messages import AIMessage

from _fakes import guion, llamada
from lc_01_agente import crear_agente

# Caso 1: dos herramientas en el mismo turno y respuesta final
modelo = guion(
    AIMessage(content="", tool_calls=[
        llamada("ver_pedidos", {"email": "ana@example.com"}, "c1"),
        llamada("buscar_ayuda", {"tema": "devoluciones"}, "c2"),
    ]),
    AIMessage(content="Tu pedido P-1001 se envió el 10 de septiembre; tienes 30 días para devolverlo."),
)
r = crear_agente(modelo).invoke({"messages": [{"role": "user", "content": "¿Dónde está mi pedido?"}]})
print("CASO 1 tipos:", [type(m).__name__ for m in r["messages"]])
print("CASO 1 tool msgs:", [(m.tool_call_id, m.content[:40]) for m in r["messages"] if m.type == "tool"])
print("CASO 1 final:", r["messages"][-1].content)

# Caso 2: la herramienta lanza ValueError -> ¿vuelve al modelo o rompe el bucle?
modelo = guion(
    AIMessage(content="", tool_calls=[llamada("ver_pedidos", {"email": "nadie@example.com"}, "c3")]),
    AIMessage(content="No encuentro ese email. ¿Puedes revisarlo?"),
)
try:
    r = crear_agente(modelo).invoke({"messages": [{"role": "user", "content": "Soy nadie@example.com"}]})
    t = [m for m in r["messages"] if m.type == "tool"][0]
    print("CASO 2 ToolMessage status:", t.status, "| content:", t.content[:80])
except Exception as e:
    print("CASO 2 EXCEPCIÓN PROPAGADA:", type(e).__name__, e)
