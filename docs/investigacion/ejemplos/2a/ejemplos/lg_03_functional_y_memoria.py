"""LangGraph 1.x · Functional API (@entrypoint/@task) y memoria a largo plazo (store).

1) Un encadenado con puerta de calidad escrito como funciones normales: cada @task
   se guarda en el checkpointer y no se repite al reanudar tras un interrupt.
2) Un agente de create_agent que recuerda preferencias entre conversaciones
   (threads distintos) usando el store a través de ToolRuntime.
"""
from dataclasses import dataclass

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain.tools import ToolRuntime, tool
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.func import entrypoint, task
from langgraph.store.memory import InMemoryStore   # en producción: PostgresStore
from langgraph.types import interrupt

MODEL = "anthropic:claude-sonnet-5-5"


# ---------- 1) Functional API: encadenado con aprobación humana ----------
def crear_flujo(llm):
    @task
    def borrador(tema: str) -> str:
        return llm.invoke(f"Escribe un borrador breve sobre: {tema}").text

    @task
    def pulir(texto: str, nota: str) -> str:
        return llm.invoke(f"Mejora este texto según la nota.\nNota: {nota}\n<texto>\n{texto}\n</texto>").text

    @entrypoint(checkpointer=InMemorySaver())
    def flujo(tema: str) -> str:
        b = borrador(tema).result()                 # .result() espera a la tarea
        nota = interrupt({"borrador": b, "pregunta": "¿Qué cambiarías?"})
        return pulir(b, nota).result()

    return flujo


# ---------- 2) Memoria a largo plazo con store ----------
@dataclass
class Contexto:
    user_id: str


@tool
def guardar_preferencia(preferencia: str, runtime: ToolRuntime[Contexto]) -> str:
    """Guarda una preferencia duradera del usuario (idioma, formato, tono)."""
    runtime.store.put(("preferencias", runtime.context.user_id), "general", {"texto": preferencia})
    return "Guardado."


@tool
def leer_preferencias(runtime: ToolRuntime[Contexto]) -> str:
    """Devuelve las preferencias guardadas del usuario."""
    item = runtime.store.get(("preferencias", runtime.context.user_id), "general")
    return item.value["texto"] if item else "Sin preferencias guardadas."


def crear_agente_con_memoria(model=None, store=None):
    return create_agent(
        model=model or init_chat_model(MODEL, max_tokens=1024),
        tools=[guardar_preferencia, leer_preferencias],
        context_schema=Contexto,
        store=store or InMemoryStore(),
        checkpointer=InMemorySaver(),      # memoria de la conversación (por thread_id)
    )
