from langchain_core.messages import AIMessage
from langgraph.store.memory import InMemoryStore
from langgraph.types import Command

from _fakes import FakeToolModel, guion, llamada
from lg_03_functional_y_memoria import Contexto, crear_agente_con_memoria, crear_flujo

llamadas = []


class Contador(FakeToolModel):
    def invoke(self, entrada, *a, **k):
        llamadas.append(entrada[:30])
        return AIMessage(content=f"[{len(llamadas)}] " + entrada[:30])


flujo = crear_flujo(Contador(messages=iter([])))
cfg = {"configurable": {"thread_id": "f1"}}
out = flujo.invoke("agentes", cfg, version="v2")
print("pausa:", out.interrupts[0].value["pregunta"], "| llamadas al modelo:", len(llamadas))
out = flujo.invoke(Command(resume="más corto"), cfg, version="v2")
print("final:", out.value, "| llamadas totales:", len(llamadas), "(el borrador no se repitió)")

store = InMemoryStore()
m1 = guion(AIMessage(content="", tool_calls=[llamada("guardar_preferencia", {"preferencia": "respuestas en inglés"}, "a")]),
           AIMessage(content="Anotado."))
crear_agente_con_memoria(m1, store).invoke({"messages": [("user", "Respóndeme siempre en inglés")]},
                                           {"configurable": {"thread_id": "t1"}}, context=Contexto(user_id="u42"))
m2 = guion(AIMessage(content="", tool_calls=[llamada("leer_preferencias", {}, "b")]), AIMessage(content="ok"))
r = crear_agente_con_memoria(m2, store).invoke({"messages": [("user", "¿Qué sabes de mí?")]},
                                               {"configurable": {"thread_id": "t2"}}, context=Contexto(user_id="u42"))
print("otro thread lee del store:", [m.content for m in r["messages"] if m.type == "tool"])
print("search:", [(i.namespace, i.key, i.value) for i in store.search(("preferencias", "u42"))])
