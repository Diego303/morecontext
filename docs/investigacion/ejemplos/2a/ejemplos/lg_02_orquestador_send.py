"""LangGraph 1.x · orquestador y trabajadores con Send (map-reduce).

El orquestador decide cuántas subtareas hay; Send lanza un trabajador por cada
una, en paralelo, y el reductor operator.add junta sus resultados.
Mismo patrón que patrones/06-orquestador-trabajadores.
"""
import operator
from typing import Annotated, TypedDict

from langchain.chat_models import init_chat_model
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send
from pydantic import BaseModel, Field

MODEL = "anthropic:claude-sonnet-5-5"
MAX_SUBTAREAS = 6


class Subtarea(BaseModel):
    objetivo: str
    contexto: str
    formato_respuesta: str


class Plan(BaseModel):
    subtareas: list[Subtarea] = Field(description="Subtareas independientes entre sí")


class Estado(TypedDict):
    tarea: str
    subtareas: list[Subtarea]
    resultados: Annotated[list[str], operator.add]   # cada trabajador añade; no se pisan
    respuesta: str


class EstadoTrabajador(TypedDict):                   # lo que recibe cada trabajador vía Send
    subtarea: Subtarea


def construir(modelo=None):
    llm = modelo or init_chat_model(MODEL, max_tokens=2048)
    planificador = llm.with_structured_output(Plan)   # salida estructurada para el plan

    def planificar(state: Estado):
        plan = planificador.invoke(
            f"Divide la tarea en como mucho {MAX_SUBTAREAS} subtareas independientes.\n<tarea>\n{state['tarea']}\n</tarea>")
        return {"subtareas": plan.subtareas[:MAX_SUBTAREAS]}     # el límite lo impone tu código

    def repartir(state: Estado):
        return [Send("trabajador", {"subtarea": s}) for s in state["subtareas"]]

    def trabajador(state: EstadoTrabajador):
        s = state["subtarea"]
        r = llm.invoke(f"Objetivo: {s.objetivo}\n<contexto>\n{s.contexto}\n</contexto>\n"
                       f"Formato de respuesta: {s.formato_respuesta}")
        return {"resultados": [f"<resultado objetivo='{s.objetivo}'>\n{r.text}\n</resultado>"]}

    def sintetizar(state: Estado):
        r = llm.invoke(f"<tarea>\n{state['tarea']}\n</tarea>\n" + "\n\n".join(state["resultados"])
                       + "\nSintetiza los resultados en una respuesta final.")
        return {"respuesta": r.text}

    g = StateGraph(Estado)
    g.add_node("planificar", planificar)
    g.add_node("trabajador", trabajador)
    g.add_node("sintetizar", sintetizar)
    g.add_edge(START, "planificar")
    g.add_conditional_edges("planificar", repartir, ["trabajador"])
    g.add_edge("trabajador", "sintetizar")            # sintetizar espera a todos los trabajadores
    g.add_edge("sintetizar", END)
    return g.compile()


if __name__ == "__main__":
    grafo = construir()
    out = grafo.invoke({"tarea": "Compara las condiciones de teletrabajo de los convenios de A, B y C."},
                       {"max_concurrency": 4})       # tope de trabajadores en paralelo
    print(out["respuesta"])
