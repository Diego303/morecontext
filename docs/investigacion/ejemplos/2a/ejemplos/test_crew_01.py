"""Construye el Crew con Claude (sin llamar a la API) y ejecuta un Flow sin LLM."""
from crewai.flow.flow import Flow, listen, start

import crew_01_crewai as c

crew = c.crear_crew()
print("Crew:", type(crew).__name__, crew.process, [a.role for a in crew.agents], "| llm:", type(c.llm).__name__, c.llm.model)
print("tool:", c.buscar_docs.name, "|", c.buscar_docs.description[:80])


class FlowPrueba(Flow[c.Estado]):
    @start()
    def preparar(self):
        self.state.tema = self.state.tema.strip() or "agentes de IA"

    @listen(preparar)
    def investigar(self):
        self.state.resumen = f"resumen de {self.state.tema}"
        return self.state.resumen


f = FlowPrueba()
print("Flow ->", f.kickoff(inputs={"tema": "  "}))
