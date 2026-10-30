"""Modelos de chat simulados para probar ejemplos de LangChain/LangGraph sin API.

GenericFakeChatModel (langchain_core) no implementa bind_tools, y create_agent
lo llama. Esta subclase lo convierte en un no-op y devuelve las respuestas
guionizadas en orden.
"""
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain_core.messages import AIMessage


class FakeToolModel(GenericFakeChatModel):
    estructuradas: list = []          # objetos que devolverá with_structured_output, en orden

    def bind_tools(self, tools, **kwargs):  # noqa: D401
        return self

    def with_structured_output(self, schema, **kwargs):
        from langchain_core.runnables import RunnableLambda
        cola = self.estructuradas
        return RunnableLambda(lambda _entrada: cola.pop(0))


def guion(*mensajes: AIMessage) -> FakeToolModel:
    return FakeToolModel(messages=iter(list(mensajes)))


def llamada(nombre: str, args: dict, id_: str) -> dict:
    return {"name": nombre, "args": args, "id": id_, "type": "tool_call"}
