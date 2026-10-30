---
titulo: LangChain
descripcion: Framework abierto para crear agentes con un bucle ya hecho (create_agent) que se personaliza con middleware y cambia de proveedor sin reescribir el código.
creado: 2026-10-29
tags: [frameworks, agentes, python, typescript, open-source]
relacionados: ["[[docs/frameworks/04-langchain]]", "[[cursos/langchain-y-langgraph/index]]", "[[herramientas/langgraph]]", "[[docs/frameworks/01-elegir-framework]]"]
categoria: framework
licencia: MIT
open_source: true
lenguajes: [Python, TypeScript]
url: https://docs.langchain.com/
repositorio: https://github.com/langchain-ai/langchain
version: "1.4.7"
revisado: 2026-10-29
---

LangChain es una librería para construir agentes con el [[glosario/bucle-agentico|bucle agéntico]] ya resuelto: `create_agent` llama al modelo, ejecuta las herramientas y repite hasta la respuesta. Desde la 1.0 el paquete se ha reducido a lo esencial (agentes, mensajes, herramientas, modelos) y lo antiguo vive en `langchain-classic`.

**Licencia**: MIT, open source. Lo comercial va aparte: **LangSmith** (trazas, evals y despliegue) es un servicio de pago que no necesitas para usar la librería. Hay versión JavaScript (`langchain` 1.6.0 en npm, también MIT).

## Para qué sirve

- Montar un agente con herramientas en pocas líneas y con el mismo código para Claude y para un modelo local (`"anthropic:…"` o `"ollama:…"`).
- Añadir piezas de producción como [[glosario/middleware|middleware]]: límites de llamadas, reintentos, resumen del historial, PII, aprobación humana y caché de prompts de Anthropic.
- Persistencia e interrupciones, porque `create_agent` compila por debajo un grafo de [[herramientas/langgraph]].

## Cuándo usarla

- Tu agente encaja en el ciclo modelo → herramientas → respuesta y quieres límites, aprobación o resumen sin escribirlos tú.
- Necesitas cambiar de proveedor o probar con un modelo local sin tocar la lógica.

## Cuándo no

- Estás aprendiendo el mecanismo: el bucle a mano de [[roadmap/40-primer-agente/02-el-bucle-agentico]] enseña más.
- El flujo mezcla pasos fijos con ramas propias: ve directamente a [[herramientas/langgraph]].
- Te pesa depender de un ecosistema que se mueve deprisa: en 2026 salió una versión menor cada pocos meses.

## Ejemplo mínimo

```python title="agente_langchain.py"
from langchain.agents import create_agent
from langchain.agents.middleware import ModelCallLimitMiddleware, ToolErrorMiddleware
from langchain.chat_models import init_chat_model
from langchain.tools import tool

MODEL = "anthropic:claude-sonnet-5-5"          # o "ollama:qwen3" con langchain-ollama


@tool(parse_docstring=True)                    # sin esto, "Args:" no llega al esquema
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email.

    Args:
        email: Email del cliente.
    """
    if email != "ana@example.com":
        raise ValueError(f"No hay ningún cliente con email {email}")
    return '[{"id": "P-1001", "estado": "enviado"}]'


agente = create_agent(
    model=init_chat_model(MODEL, max_tokens=1024),   # max_tokens explícito
    tools=[ver_pedidos],
    system_prompt="Eres el soporte de una tienda. Usa las herramientas; no inventes datos.",
    middleware=[
        ToolErrorMiddleware(on_error=lambda exc, req: f"Error: {exc}"),  # la excepción vuelve al modelo
        ModelCallLimitMiddleware(run_limit=10, exit_behavior="end"),     # tope de llamadas al modelo
    ],
)

resultado = agente.invoke({"messages": [{"role": "user", "content": "Soy ana@example.com, ¿y mi pedido?"}]})
print(resultado["messages"][-1].text)
```

Lo ejecuté con un [[glosario/modelo-simulado|modelo simulado]] (una subclase de `GenericFakeChatModel` con `bind_tools`): el primer email falla, el modelo recibe un `ToolMessage` con `status="error"` y el texto de la excepción, y el segundo intento responde.

> [!aviso] Tres trampas comprobadas
> Sin `ToolErrorMiddleware`, una excepción dentro de una herramienta **rompe el agente** en lugar de volver al modelo (solo vuelven solos los errores de validación de argumentos). Sin `max_tokens`, `ChatAnthropic` usa el máximo del modelo. Y con `claude-sonnet-5-5` no pases `temperature`: lanza `ValueError`.

## Alternativas

- [[herramientas/langgraph]] si necesitas controlar cada paso.
- [[herramientas/pydantic-ai]] si la salida tipada es el contrato.
- [[herramientas/openai-agents-sdk]] para triaje con *handoffs*.
- [[herramientas/anthropic-sdk]] sin framework, con el bucle a mano.

## Enlaces

- [Documentación de agentes](https://docs.langchain.com/oss/python/langchain/agents) · [Middleware incluido](https://docs.langchain.com/oss/python/langchain/middleware/built-in.md) · [Changelog](https://docs.langchain.com/oss/python/langchain/changelog-py)
- [Repositorio](https://github.com/langchain-ai/langchain) · [PyPI](https://pypi.org/project/langchain/) · [npm](https://www.npmjs.com/package/langchain)
- En MoreContext: [[docs/frameworks/04-langchain]] · [[cursos/langchain-y-langgraph/index]] · [[docs/frameworks/02-equivalencias]]
