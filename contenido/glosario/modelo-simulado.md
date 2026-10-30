---
titulo: Modelo simulado
descripcion: Sustituto del modelo que devuelve respuestas fijadas de antemano para probar un agente sin API, sin coste y de forma determinista.
creado: 2026-10-29
categoria: evals
ingles: Fake model
aliases: [fake model, mock model, modelo falso, modelo de prueba, TestModel, GenericFakeChatModel]
tags: [evals, pruebas, frameworks]
relacionados: ["[[recetas/probar-agentes-sin-api]]", "[[roadmap/80-evals/05-regresiones-en-ci]]", "[[glosario/framework-de-agentes]]", "[[glosario/trayectoria]]"]
---

Un modelo simulado es un objeto que se hace pasar por el modelo y devuelve respuestas escritas por ti: un texto, una petición de herramienta, un error. Con él pruebas la lógica que rodea al modelo (el bucle, las herramientas, los límites, el manejo de errores) sin llamar a ninguna API.

## En la práctica

Todos los frameworks principales traen uno: `GenericFakeChatModel` y `FakeMessagesListChatModel` en LangChain, `TestModel` y `FunctionModel` en Pydantic AI, un `Model` propio en el OpenAI Agents SDK y `MockLanguageModelV4` en el AI SDK de Vercel.

```python title="test_fake.py"
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain_core.messages import AIMessage

modelo = GenericFakeChatModel(messages=iter([AIMessage(content="Pedido 42: enviado")]))
print(modelo.invoke("¿Dónde está mi pedido?").content)  # Pedido 42: enviado
```

Para un agente con herramientas, haz que el falso devuelva un `AIMessage` con `tool_calls` y comprueba que tu código ejecuta la herramienta correcta y para cuando debe. `GenericFakeChatModel` no implementa `bind_tools`, así que con `create_agent` necesitas una subclase. Así fijas la [[glosario/trayectoria]] esperada en CI por casi nada.

## No confundir con

- **[[glosario/evals]]**: miden la calidad del modelo real. El simulado prueba tu código, no al modelo.
- **Modelo pequeño o local**: sigue siendo un modelo y no es determinista.

## Ver también

- [[recetas/evals-de-regresion-en-ci]]
- [[cursos/langchain-y-langgraph/11-observar-y-evaluar]]
