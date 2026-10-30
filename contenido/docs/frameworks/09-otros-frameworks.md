---
titulo: "Otros frameworks: CrewAI, ADK, Agent Framework, smolagents, Haystack, DSPy, Strands y Agno"
descripcion: "Ocho frameworks de agentes más allá de LangChain y Pydantic AI, cada uno con su licencia, lo que es comercial, su modelo mental, un ejemplo con Claude y sus trampas."
creado: 2026-10-29
orden: 9
nivel: intermedio
tags: [frameworks, crewai, google-adk, smolagents, haystack, dspy, strands, agno, open-source]
relacionados: ["[[docs/frameworks/01-elegir-framework]]", "[[herramientas/crewai]]", "[[herramientas/smolagents]]", "[[herramientas/dspy]]"]
---

Además de los frameworks con página propia en este grupo, hay ocho que encontrarás a menudo. Todos son open source (MIT o Apache-2.0) y todos pueden usar Claude; varios tienen detrás un producto de pago o una nube, y cuatro traen valores por defecto que conviene conocer antes del primer despliegue: telemetría activada, un ejecutor de código que no es un sandbox o un proveedor de modelos que no elegiste.

Sobre los ejemplos: estos paquetes no están en el entorno de comprobación de la web, así que cada uno se instaló en un entorno aparte con la versión indicada y se **construyó** el agente con Claude (con una clave falsa, sin llamar a la API). El de DSPy, además, se **ejecutó** con su modelo simulado `DummyLM`. Las llamadas reales no se han probado aquí: confírmalas con tu clave.

| Framework | Versión | Licencia | Parte comercial o de pago | Claude vía |
|---|---|---|---|---|
| CrewAI | 1.15.33 | MIT | CrewAI AMP Suite | Integración nativa (`crewai[anthropic]`) |
| Google ADK | 2.13.0 | Apache-2.0 | Vertex AI y Google Cloud | LiteLLM |
| Microsoft Agent Framework | 1.23.0 | MIT | Azure AI Foundry | `agent-framework-anthropic` (beta) |
| smolagents | 1.26.0 | Apache-2.0 | Sandboxes de terceros (E2B, Modal, Blaxel) | LiteLLM |
| Haystack | 3.4.1 | Apache-2.0 | Haystack Enterprise (deepset) | `anthropic-haystack` |
| DSPy | 3.4.1 | MIT | Ninguna | LiteLLM |
| Strands Agents | 1.62.0 | Apache-2.0 | Amazon Bedrock (por defecto) | `strands-agents[anthropic]` |
| Agno | 3.1.12 | Apache-2.0 | AgentOS (qué parte es de pago: consúltalo) | `agno.models.anthropic` |

Varios dependen de [[herramientas/litellm|LiteLLM]] para hablar con Claude. Es una capa de traducción más entre tu código y la API: fija su versión, usa hashes en las dependencias y comprueba que las funciones nuevas de Claude (caché, razonamiento, herramientas del servidor) pasan intactas.

## CrewAI

**Qué es.** Un framework de alto nivel con dos piezas. Los **Crews** son equipos de agentes con `role`, `goal` y `backstory`, que ejecutan tareas (`description`, `expected_output`) en secuencia (`Process.sequential`) o con un gestor (`Process.hierarchical`). Los **Flows** orquestan por eventos con `@start`, `@listen` y `@router` y un estado de Pydantic. No depende de LangChain. Lo comercial es **CrewAI AMP Suite** (plano de control y observabilidad).

**Modelo mental.** Describes un equipo de personas y el framework convierte cada rol en un prompt. Rápido de montar si tu equipo ya piensa en roles.

```python title="crew_soporte.py" nocheck
from crewai import LLM, Agent, Crew, Process, Task
from crewai.tools import tool

MODEL = "anthropic/claude-sonnet-5-5"          # local: LLM(model="ollama/qwen3", base_url="http://localhost:11434")
llm = LLM(model=MODEL, max_tokens=1024)        # necesita pip install "crewai[anthropic]"


@tool("buscar_docs")
def buscar_docs(consulta: str) -> str:
    """Busca en la documentación interna y devuelve fragmentos relevantes."""
    return f"(fragmentos simulados para «{consulta}»)"


investigador = Agent(role="Investigador", goal="Reunir hechos verificables con su fuente",
                     backstory="Analista meticuloso.", tools=[buscar_docs], llm=llm, max_iter=5)
redactor = Agent(role="Redactor", goal="Escribir resúmenes claros en español",
                 backstory="Editor técnico.", llm=llm)
investigar = Task(description="Investiga: {tema}", expected_output="5 hechos con fuente", agent=investigador)
redactar = Task(description="Resume los hallazgos en 3 párrafos", expected_output="Resumen en markdown",
                agent=redactor, context=[investigar])
crew = Crew(agents=[investigador, redactor], tasks=[investigar, redactar], process=Process.sequential)
# resultado = crew.kickoff(inputs={"tema": "agentes con aprobación humana"}); print(resultado.raw)
```

**Cuándo sí.** Prototipos de «equipos» con roles y tareas encadenadas. **Cuándo no.** Cuando necesitas saber qué texto exacto llega al modelo: el *role-play* añade instrucciones que no escribes tú. Antes de producción, pásalo a algo más explícito.

**Trampas.**
- **Telemetría anónima activada por defecto**: se desactiva con `CREWAI_DISABLE_TELEMETRY=true` u `OTEL_SDK_DISABLED=true`.
- Sin el extra `crewai[anthropic]`, `LLM("anthropic/…")` lanza `ImportError` pidiéndolo.
- Exige Python < 3.14, fija `pydantic<2.13` y `mcp<2`: puede chocar con el resto de tu proyecto (por ejemplo con el SDK `mcp` 2.x). Dale su propio entorno.

## Google ADK

**Qué es.** El Agent Development Kit de Google, en Python y también en Java, Kotlin, Go y TypeScript (`@google/adk` 2.4.0). `Agent` (alias de `LlmAgent`) con `name`, `model`, `instruction`, `tools`, `sub_agents`, `output_schema` y *callbacks* antes y después de cada llamada al modelo o a una herramienta; agentes de flujo fijo `SequentialAgent`, `ParallelAgent` y `LoopAgent`; y un módulo para el protocolo [[docs/estandares/03-a2a|A2A]]. La parte de pago es la nube: Vertex AI y su despliegue gestionado.

```python title="adk_soporte.py" nocheck
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.runners import InMemoryRunner

MODEL = LiteLlm(model="anthropic/claude-sonnet-5-5")   # local: LiteLlm(model="ollama_chat/qwen3")


def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email."""
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


agente = Agent(name="soporte", model=MODEL, tools=[ver_pedidos],
               instruction="Eres el soporte de una tienda. Usa las herramientas; no inventes datos.")
runner = InMemoryRunner(agent=agente, app_name="tienda")
# async for evento in runner.run_async(user_id="u1", session_id=sesion.id, new_message=mensaje): ...
```

**Cuándo sí.** Equipos en Google Cloud, jerarquías de agentes con `sub_agents`, interoperabilidad A2A. **Cuándo no.** Si Claude es tu modelo principal: dependes de LiteLLM (o de Claude en Vertex AI).

## Microsoft Agent Framework

**Qué es.** El sucesor de Semantic Kernel según el propio README de Semantic Kernel, que lo presenta como «enterprise-ready successor» y versión 1.0 de producción. AutoGen (`autogen-agentchat`) no publica versiones en PyPI desde el 30 de septiembre de 2025. `Agent(client, instructions, name, tools, middleware, context_providers, …)`, flujos con `WorkflowBuilder` y `Executor`, y herramientas MCP (`MCPStdioTool`, `MCPStreamableHTTPTool`). La nube asociada es Azure AI Foundry.

```python title="maf_soporte.py" nocheck
from agent_framework import Agent, tool
from agent_framework.anthropic import AnthropicClient   # pip install agent-framework-core agent-framework-anthropic

MODEL = "claude-sonnet-5-5"


@tool
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email."""
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


agente = Agent(client=AnthropicClient(model=MODEL), name="soporte",
               instructions="Eres el soporte de una tienda. Usa las herramientas.", tools=[ver_pedidos])
# respuesta = await agente.run("Soy ana@example.com, ¿y mi pedido?"); print(respuesta.text)
```

**Trampa.** `pip install agent-framework` (el metapaquete con todas las integraciones) resolvió a una versión antigua (1.19.0) en la investigación de la web. Instala `agent-framework-core` y solo las integraciones que necesites; la de Anthropic sigue en beta (`1.0.0b261022`).

**Cuándo sí.** Equipos .NET o Azure que venían de Semantic Kernel o AutoGen. **Cuándo no.** Si no estás en ese ecosistema, no aporta mucho frente a los demás.

## smolagents

**Qué es.** La librería de Hugging Face para agentes pequeños. Su `CodeAgent` no llama herramientas con JSON: **escribe y ejecuta Python** que llama a las herramientas como funciones. También tiene `ToolCallingAgent`, el clásico. Según su README, la lógica cabe en unas mil líneas, así que se puede leer entera. Modelos: `LiteLLMModel`, `InferenceClientModel`, `TransformersModel`, `OpenAIModel`.

```python title="smol_soporte.py" nocheck
from smolagents import CodeAgent, LiteLLMModel, ToolCallingAgent, tool

MODEL = LiteLLMModel(model_id="anthropic/claude-sonnet-5-5", max_tokens=1024)   # local: "ollama_chat/qwen3"


@tool
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email.

    Args:
        email: Email del cliente.
    """
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


# Por defecto ejecuta el código del modelo con LocalPythonExecutor, que NO es un sandbox.
# Fuera de pruebas: executor_type="docker", "e2b" o "modal" (cada uno con su extra de pip).
por_codigo = CodeAgent(tools=[ver_pedidos], model=MODEL, max_steps=6)
por_herramientas = ToolCallingAgent(tools=[ver_pedidos], model=MODEL, max_steps=6)
# por_herramientas.run("¿Qué pedidos tiene ana@example.com?")
```

> [!peligro] El ejecutor local no es un sandbox
> El README lo dice así: «The built-in `LocalPythonExecutor` is **not a security sandbox**. It applies some restrictions but can be bypassed and must not be used as a security boundary.» Es el valor por defecto de `CodeAgent`. Con datos reales o entradas de usuarios, usa `executor_type="docker"`, `"e2b"`, `"modal"` o `"blaxel"` ([[glosario/sandbox]], [[cursos/seguridad-y-prompt-injection/04-permisos-y-sandbox]]).

Además, `@tool` exige un docstring con `Args:` para cada parámetro. **Cuándo sí.** Aprender cómo funciona un agente que actúa con código, o tareas donde componer varias llamadas en un script ahorra pasos. **Cuándo no.** En producción sin un sandbox real.

## Haystack

**Qué es.** El framework de deepset para *pipelines* explícitos de RAG y agentes. Va por la serie **3.x** (`haystack-ai` 3.4.1). Componentes conectados en un `Pipeline` y un `Agent(chat_generator, tools, system_prompt, exit_conditions, state_schema, max_agent_steps, …)`. Hayhooks expone pipelines como API REST o como servidor MCP. Lo comercial es **Haystack Enterprise** (soporte y plataforma de deepset).

```python title="haystack_soporte.py" nocheck
from haystack.components.agents import Agent
from haystack.dataclasses import ChatMessage
from haystack.tools import create_tool_from_function
from haystack_integrations.components.generators.anthropic import AnthropicChatGenerator

MODEL = "claude-sonnet-5-5"   # local: OllamaChatGenerator(model="qwen3", url="http://localhost:11434")


def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email."""
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


agente = Agent(chat_generator=AnthropicChatGenerator(model=MODEL, generation_kwargs={"max_tokens": 1024}),
               tools=[create_tool_from_function(ver_pedidos)],
               system_prompt="Eres el soporte de una tienda.", max_agent_steps=10)
# agente.warm_up(); agente.run(messages=[ChatMessage.from_user("Soy ana@example.com, ¿y mi pedido?")])
```

**Cuándo sí.** RAG de producción con componentes intercambiables y un grafo de datos que quieres ver ([[cursos/rag-a-fondo/index]]). **Cuándo no.** Un agente conversacional simple. Para elegir entre Haystack y LlamaIndex, mira [[docs/frameworks/08-llamaindex]].

## DSPy

**Qué es.** Su README lo resume en una idea: programar en lugar de escribir prompts a mano. Declaras qué entra y qué sale (*signatures*), compones módulos (`Predict`, `ChainOfThought`, `ReAct`, `CodeAct`, `Refine`, `BestOfN`) y un **optimizador** (`MIPROv2`, `GEPA`, `SIMBA`, `BootstrapFewShot`) ajusta los prompts o los ejemplos contra una métrica tuya con `dspy.Evaluate`. Su clasificador en PyPI es «3 - Alpha».

```python title="dspy_clasificar.py" nocheck
import dspy
from dspy.utils.dummies import DummyLM

MODEL = "anthropic/claude-sonnet-5-5"


class Clasificar(dspy.Signature):
    """Clasifica un ticket de soporte."""
    ticket: str = dspy.InputField()
    categoria: str = dspy.OutputField(desc="facturacion | envio | cuenta | producto")


clasificar = dspy.ChainOfThought(Clasificar)

if __name__ == "__main__":
    # Real: dspy.configure(lm=dspy.LM(MODEL, max_tokens=1024))
    dspy.configure(lm=DummyLM([{"reasoning": "habla de un cobro", "categoria": "facturacion"}]))
    pred = clasificar(ticket="Me habéis cobrado dos veces")
    print(pred.categoria, "|", pred.reasoning)
```

Salida real con `DummyLM`: `facturacion | habla de un cobro`. **Cuándo sí.** Tareas con métrica clara y datos etiquetados, cuando quieres optimizar prompts de forma sistemática en lugar de a mano ([[roadmap/80-evals/index]], [[disciplinas/evals]]). **Cuándo no.** Sin conjunto de evaluación: el optimizador no tiene contra qué optimizar ([[roadmap/80-evals/02-conjunto-de-prueba]]).

## Strands Agents

**Qué es.** El SDK de agentes de AWS (también en TypeScript, `@strands-agents/sdk` 1.22.0). `Agent(model, tools, system_prompt, structured_output_model, conversation_manager, session_manager, hooks, …)` y multiagente con `GraphBuilder` y `Swarm`. Modelos de Anthropic, Ollama (`OllamaModel(host, model_id=…)`) y otros.

```python title="strands_soporte.py" nocheck
from strands import Agent, tool
from strands.models.anthropic import AnthropicModel   # pip install "strands-agents[anthropic]"

MODEL = AnthropicModel(model_id="claude-sonnet-5-5", max_tokens=1024)   # sin model= usaría Amazon Bedrock


@tool
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email."""
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


agente = Agent(model=MODEL, tools=[ver_pedidos], system_prompt="Eres el soporte de una tienda.",
               callback_handler=None)
# print(agente("Soy ana@example.com, ¿y mi pedido?"))
```

**Trampa.** Si no pasas `model=`, usa **Amazon Bedrock** y necesita credenciales de AWS («For the default Amazon Bedrock model provider, you'll need AWS credentials», README). Pasa siempre el modelo explícito. **Cuándo sí.** Equipos en AWS. **Cuándo no.** Si no quieres que el valor por defecto sea una nube concreta.

## Agno

**Qué es.** Un framework con agentes (`agno.agent.Agent`), equipos (`agno.team.Team`) y workflows (`Workflow`, `Step`, `Parallel`, `Router`, `Loop`, `HumanReview`), además de memoria, conocimiento y una capa de ejecución (AgentOS). Qué parte de AgentOS es de pago no está confirmado en esta página: revísalo en su web antes de depender de ella.

```python title="agno_soporte.py" nocheck
from agno.agent import Agent
from agno.models.anthropic import Claude

MODEL = Claude(id="claude-sonnet-5-5", max_tokens=1024)


def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email."""
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


agente = Agent(model=MODEL, tools=[ver_pedidos], instructions="Eres el soporte de una tienda.")
# agente.print_response("Soy ana@example.com, ¿y mi pedido?")
```

**Trampas.** Envía **telemetría por defecto**; según su documentación, «Prompts, messages, and outputs are never sent». Se desactiva con `AGNO_TELEMETRY=false`. El modelo de Ollama necesita además `pip install ollama`.

## Cómo elegir entre ellos

- ¿Estás en una nube concreta? ADK (Google), Agent Framework (Azure) o Strands (AWS) encajan con sus servicios. Si no, ninguno de los tres te da ventaja.
- ¿Tu problema son los datos y no el bucle? Haystack o [[docs/frameworks/08-llamaindex|LlamaIndex]].
- ¿Tienes una métrica y datos etiquetados? DSPy.
- ¿Quieres un prototipo de equipo con roles para enseñar una idea? CrewAI, con su propio entorno.
- ¿Quieres entender agentes que escriben código? smolagents, con sandbox.

Para todo lo demás, empieza por [[docs/frameworks/01-elegir-framework]] y por los frameworks con página propia: [[docs/frameworks/04-langchain|LangChain]], [[docs/frameworks/05-langgraph|LangGraph]], [[docs/frameworks/06-openai-agents-sdk|OpenAI Agents SDK]] y [[docs/frameworks/07-pydantic-ai|Pydantic AI]].

## Ver también

- Fichas del directorio: [[herramientas/crewai]], [[herramientas/google-adk]], [[herramientas/microsoft-agent-framework]], [[herramientas/smolagents]], [[herramientas/haystack]], [[herramientas/dspy]] y [[herramientas/strands-agents]].
- [[docs/frameworks/02-equivalencias]]: la tabla de conceptos en los cinco frameworks principales.
- [[glosario/framework-de-agentes]].
