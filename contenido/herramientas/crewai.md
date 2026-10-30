---
titulo: CrewAI
descripcion: Framework abierto de alto nivel para montar «equipos» de agentes con roles y tareas (Crews) y orquestarlos por eventos (Flows). Su plataforma AMP es comercial.
creado: 2026-10-29
tags: [frameworks, multiagente, python, open-source]
relacionados: ["[[docs/frameworks/09-otros-frameworks]]", "[[cursos/sistemas-multiagente/index]]", "[[patrones/06-orquestador-trabajadores]]", "[[docs/frameworks/01-elegir-framework]]"]
categoria: framework
licencia: MIT
open_source: true
lenguajes: [Python]
url: https://crewai.com
repositorio: https://github.com/crewAIInc/crewAI
version: "1.15.33"
revisado: 2026-10-29
---

CrewAI es un framework de alto nivel con dos piezas. Los **Crews** reúnen agentes con `role`, `goal` y `backstory` y tareas con `description` y `expected_output`, que se ejecutan en secuencia o de forma jerárquica; los **Flows** orquestan pasos por eventos (`@start`, `@listen`, `@router`) con estado Pydantic.

**Licencia**: MIT, open source (lo dicen el `LICENSE` y el README del repositorio; los metadatos del paquete en PyPI no declaran licencia). Lo comercial: **CrewAI AMP Suite**, el plano de control y la observabilidad de la empresa. Según su README, no depende de LangChain.

## Para qué sirve

- Prototipos de equipos de agentes cuando el problema se piensa en roles: investigador, redactor, revisor.
- Encadenar tareas que usan la salida de otras (`context=[…]`) y validar con `output_pydantic` o `guardrail`.
- Envolver uno o varios Crews en un Flow con pasos deterministas alrededor.

## Cuándo usarla

Para montar rápido un prototipo [[glosario/orquestador|multiagente]] con roles, sobre todo si el equipo de negocio ya describe el trabajo así.

## Cuándo no

- Cuando necesitas saber exactamente qué prompt llega al modelo: el *role-play* añade texto que no escribes tú. Antes de producción, valora pasarlo a algo más explícito ([[herramientas/langgraph]], [[herramientas/pydantic-ai]]).
- Con Python 3.14 (exige `<3.14`), si tu proyecto necesita `pydantic>=2.13` (fija `<2.13`) o el SDK `mcp` 2.x (fija `mcp<2`).

## Ejemplo mínimo

```python nocheck title="crew.py"
from crewai import LLM, Agent, Crew, Process, Task
from crewai.tools import tool

llm = LLM(model="anthropic/claude-sonnet-5-5", max_tokens=1024)   # necesita crewai[anthropic]


@tool("buscar_docs")
def buscar_docs(consulta: str) -> str:
    """Busca en la documentación interna y devuelve fragmentos relevantes."""
    return f"(fragmentos simulados para «{consulta}»)"


investigador = Agent(role="Investigador", goal="Reunir hechos verificables con su fuente",
                     backstory="Analista meticuloso.", tools=[buscar_docs], llm=llm, max_iter=5)
redactor = Agent(role="Redactor", goal="Escribir resúmenes claros en español", backstory="Editor técnico.", llm=llm)
investigar = Task(description="Investiga: {tema}", expected_output="5 hechos con fuente", agent=investigador)
redactar = Task(description="Resume los hallazgos en 3 párrafos", expected_output="Resumen en markdown",
                agent=redactor, context=[investigar])
crew = Crew(agents=[investigador, redactor], tasks=[investigar, redactar], process=Process.sequential)
# print(crew.kickoff(inputs={"tema": "agentes de IA"}).raw)
```

Comprobé la construcción en un entorno aparte con `crewai[anthropic]` 1.15.33 (choca con dependencias del entorno principal): `LLM("anthropic/…")` se resuelve al proveedor nativo de Anthropic y el Crew queda con dos tareas en secuencia. Sin el extra `[anthropic]`, lanza `ImportError` pidiéndolo. No llamé a la API.

> [!aviso] Telemetría activada por defecto
> CrewAI envía telemetría anónima salvo que pongas `CREWAI_DISABLE_TELEMETRY=true` (u `OTEL_SDK_DISABLED=true`).

## Alternativas

- [[herramientas/langgraph]] con `Send` para orquestador y trabajadores explícitos.
- [[herramientas/openai-agents-sdk]] para triaje entre especialistas.
- [[herramientas/google-adk]] o [[herramientas/microsoft-agent-framework]] para agentes jerárquicos en su nube.

## Enlaces

- [Repositorio](https://github.com/crewAIInc/crewAI) · [PyPI](https://pypi.org/project/crewai/) (README con las secciones de licencia, telemetría y AMP)
- En MoreContext: [[docs/frameworks/09-otros-frameworks]] · [[cursos/sistemas-multiagente/index]]
