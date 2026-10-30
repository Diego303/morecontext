import threading
import time

from langchain_core.messages import AIMessage

from _fakes import FakeToolModel
from lg_02_orquestador_send import Plan, Subtarea, construir

hilos = set()


class Modelo(FakeToolModel):
    def invoke(self, entrada, *a, **k):
        hilos.add(threading.current_thread().name)
        time.sleep(0.2)
        texto = entrada if isinstance(entrada, str) else str(entrada)
        if texto.startswith("<tarea>"):
            return AIMessage(content=f"SÍNTESIS de {texto.count('<resultado')} resultados")
        return AIMessage(content="ficha de " + texto.split("\n")[0].removeprefix("Objetivo: "))


m = Modelo(messages=iter([]))
m.estructuradas = [Plan(subtareas=[Subtarea(objetivo=f"Convenio {x}", contexto="…", formato_respuesta="ficha")
                                   for x in "ABC"])]
t0 = time.time()
out = construir(m).invoke({"tarea": "Compara A, B y C"}, {"max_concurrency": 4})
print("resultados:", [r.split("\n")[1] for r in out["resultados"]])
print("respuesta:", out["respuesta"])
print(f"tiempo {time.time()-t0:.2f}s (3 trabajadores de 0.2s + síntesis) · hilos distintos: {len(hilos)}")
