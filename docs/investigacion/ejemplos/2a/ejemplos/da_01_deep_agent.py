"""Deep Agents · un agente de investigación con plan (write_todos), sistema de
archivos virtual y un subagente al que delega con la herramienta task.

pip install -U deepagents          # trae langchain, langgraph y langchain-anthropic
"""
from deepagents import create_deep_agent
from langchain.agents.middleware import TodoListMiddleware
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.checkpoint.memory import InMemorySaver

MODEL = "anthropic:claude-sonnet-5-5"


@tool
def buscar_web(consulta: str) -> str:
    """Busca en la web y devuelve los 3 primeros resultados con título y URL."""
    return f"(resultados simulados para «{consulta}»)"   # aquí iría tu buscador real


INVESTIGADOR = {
    "name": "investigador",
    "description": "Investiga UNA pregunta concreta y devuelve hallazgos con fuentes. Dale una pregunta acotada.",
    "system_prompt": "Investiga solo la pregunta que te dan. Devuelve hallazgos breves, cada uno con su URL.",
    "tools": [buscar_web],
}


def crear_agente(model=None):
    return create_deep_agent(
        model=model or init_chat_model(MODEL, max_tokens=4096),   # pásalo siempre: model=None está obsoleto
        tools=[buscar_web],
        system_prompt="Eres un analista. Planifica con write_todos, delega preguntas acotadas "
                      "con task y escribe el informe final en /informe.md.",
        subagents=[INVESTIGADOR],
        middleware=[TodoListMiddleware()],       # desde deepagents 0.7 write_todos es opcional
        interrupt_on={"write_file": False},       # mismo formato que HumanInTheLoopMiddleware
        checkpointer=InMemorySaver(),
    )


if __name__ == "__main__":
    agente = crear_agente()
    out = agente.invoke({"messages": [("user", "Compara LangGraph y Pydantic AI para agentes con aprobación humana.")]},
                        {"configurable": {"thread_id": "inv-1"}})
    print(out["files"]["/informe.md"])          # el sistema de archivos virtual vive en el estado
