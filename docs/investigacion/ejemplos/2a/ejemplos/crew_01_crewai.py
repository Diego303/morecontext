"""CrewAI · un Crew secuencial (investigador → redactor) y un Flow que lo envuelve.

pip install -U "crewai[anthropic]"      # el proveedor nativo de Anthropic va en el extra
export CREWAI_DISABLE_TELEMETRY=true    # telemetría anónima activada por defecto
"""
from crewai import LLM, Agent, Crew, Process, Task
from crewai.flow.flow import Flow, listen, start
from crewai.tools import tool
from pydantic import BaseModel

llm = LLM(model="anthropic/claude-sonnet-5-5", max_tokens=1024)   # local: LLM(model="ollama/qwen3", base_url="http://localhost:11434")


@tool("buscar_docs")
def buscar_docs(consulta: str) -> str:
    """Busca en la documentación interna y devuelve fragmentos relevantes."""
    return f"(fragmentos simulados para «{consulta}»)"


def crear_crew() -> Crew:
    investigador = Agent(role="Investigador", goal="Reunir hechos verificables con su fuente",
                         backstory="Analista meticuloso.", tools=[buscar_docs], llm=llm, max_iter=5)
    redactor = Agent(role="Redactor", goal="Escribir resúmenes claros en español",
                     backstory="Editor técnico.", llm=llm)
    investigar = Task(description="Investiga: {tema}", expected_output="5 hechos con fuente", agent=investigador)
    redactar = Task(description="Resume los hallazgos en 3 párrafos", expected_output="Resumen en markdown",
                    agent=redactor, context=[investigar])
    return Crew(agents=[investigador, redactor], tasks=[investigar, redactar], process=Process.sequential)


class Estado(BaseModel):
    tema: str = ""
    resumen: str = ""


class Informe(Flow[Estado]):
    @start()
    def preparar(self):
        self.state.tema = self.state.tema.strip() or "agentes de IA"

    @listen(preparar)
    def investigar(self):
        self.state.resumen = crear_crew().kickoff(inputs={"tema": self.state.tema}).raw
        return self.state.resumen


if __name__ == "__main__":
    print(Informe().kickoff(inputs={"tema": "LangGraph frente a CrewAI"}))
