---
titulo: smolagents
descripcion: Librería abierta y pequeña de Hugging Face para agentes que actúan escribiendo y ejecutando código Python, o con tool calling clásico.
creado: 2026-10-29
tags: [frameworks, agentes, codigo, sandbox, python, open-source]
relacionados: ["[[docs/frameworks/09-otros-frameworks]]", "[[glosario/sandbox]]", "[[sistemas/agente-de-codigo]]", "[[herramientas/litellm]]"]
categoria: framework
licencia: Apache-2.0
open_source: true
lenguajes: [Python]
url: https://github.com/huggingface/smolagents
repositorio: https://github.com/huggingface/smolagents
version: "1.26.0"
revisado: 2026-10-29
---

smolagents es la librería de agentes de Hugging Face. Su pieza distintiva es `CodeAgent`: en lugar de pedir herramientas en JSON, el modelo escribe un fragmento de Python que llama a las herramientas y el agente lo ejecuta. También tiene `ToolCallingAgent` para el *tool calling* de siempre.

**Licencia**: Apache-2.0, open source. Lo comercial: los *sandboxes* de terceros con los que se integra (E2B, Modal, Blaxel) son servicios de pago. El README dice que la lógica del agente cabe en unas 1 000 líneas, así que se puede leer entera.

## Para qué sirve

- Enseñar y probar agentes que actúan escribiendo código, con varios pasos en un solo turno.
- Elegir dónde se ejecuta ese código: `LocalPythonExecutor` (por defecto), `E2BExecutor`, `DockerExecutor`, `ModalExecutor` o `BlaxelExecutor`.
- Modelos de muchos sitios: `LiteLLMModel` (Claude, Ollama…), `InferenceClientModel`, `TransformersModel`, `OpenAIModel`.

## Cuándo usarla

Para aprender cómo funciona un agente de código leyendo una implementación pequeña, o para prototipos donde el modelo combina herramientas con lógica (bucles, filtros) en un solo paso.

## Cuándo no

En producción sin un [[glosario/sandbox|sandbox]] real. Ejecutar código que escribe un modelo con acceso a tu máquina es exactamente el escenario de la [[glosario/trifecta-letal|trifecta letal]].

## Ejemplo mínimo

```python nocheck title="smol.py"
from smolagents import CodeAgent, LiteLLMModel, ToolCallingAgent, tool


@tool                                       # exige docstring con Args: por parámetro
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email.

    Args:
        email: Email del cliente.
    """
    return '[{"id": "P-1001", "estado": "enviado"}]' if email == "ana@example.com" else "Sin pedidos."


modelo = LiteLLMModel(model_id="anthropic/claude-sonnet-5-5", max_tokens=1024)   # local: "ollama_chat/qwen3"
code = CodeAgent(tools=[ver_pedidos], model=modelo, max_steps=6)          # escribe y ejecuta Python
calls = ToolCallingAgent(tools=[ver_pedidos], model=modelo, max_steps=6)  # tool calling clásico
# code.run("¿Qué pedidos tiene ana@example.com?")   # ojo: el ejecutor local no aísla nada
```

Comprobé la construcción en un entorno aparte con `smolagents[litellm]` 1.26.0: el `CodeAgent` usa `LocalPythonExecutor` y ve las herramientas `ver_pedidos` y `final_answer`. No llamé a la API. El decorador `@tool` lee el código fuente de la función: defínela en un archivo, no en una celda ejecutada con `exec`.

> [!peligro] El ejecutor por defecto no es una frontera de seguridad
> Su README lo dice literalmente: «The built-in `LocalPythonExecutor` is **not a security sandbox**. It applies some restrictions but can be bypassed and must not be used as a security boundary.» Fuera de pruebas, usa Docker, E2B u otro ejecutor aislado.

## Alternativas

- [[herramientas/deepagents]] para tareas largas con archivos y subagentes.
- [[herramientas/claude-agent-sdk]] si quieres el arnés de Claude Code con permisos y sandbox de Bash.
- [[herramientas/openhands]] o [[herramientas/aider]] si buscas un agente de código ya hecho.

## Enlaces

- [Repositorio](https://github.com/huggingface/smolagents) · [PyPI](https://pypi.org/project/smolagents/)
- En MoreContext: [[docs/frameworks/09-otros-frameworks]] · [[sistemas/agente-de-codigo]] · [[cursos/seguridad-y-prompt-injection/index]]
