---
titulo: LiteLLM
descripcion: SDK y proxy abiertos que traducen una sola interfaz (la de OpenAI) a más de cien proveedores, incluidos Claude, Ollama y vLLM.
creado: 2026-10-29
tags: [pasarela, proveedores, modelos-abiertos, python, open-source]
relacionados: ["[[cursos/agentes-con-modelos-abiertos/04-herramientas-con-modelos-abiertos]]", "[[herramientas/openai-agents-sdk]]", "[[herramientas/ollama]]", "[[glosario/fallback-de-modelo]]"]
categoria: pasarela
licencia: MIT
open_source: true
lenguajes: [Python]
url: https://pypi.org/project/litellm/
repositorio: https://github.com/BerriAI/litellm
version: "1.106.6"
revisado: 2026-10-29
---

LiteLLM es una capa de traducción entre proveedores de modelos. Como **SDK**, `completion(model="proveedor/modelo", …)` acepta y devuelve el formato de OpenAI Chat Completions sea cual sea el modelo de detrás; como **proxy** (`litellm --model …`, puerto 4000), expone ese formato y también `/v1/messages`, el de Anthropic, delante de cualquier backend.

**Licencia**: MIT, open source, con una excepción: lo que vive en el directorio `enterprise/` del repositorio va bajo la licencia comercial de BerriAI (uso en producción sujeto a sus términos de suscripción). PyPI declara el paquete como MIT; si usas o copias código de `enterprise/`, aplica la otra licencia.

## Para qué sirve

- Usar Claude desde frameworks que hablan formato OpenAI: [[herramientas/openai-agents-sdk]] (`LitellmModel`), [[herramientas/google-adk]] (`LiteLlm`), [[herramientas/smolagents]] (`LiteLLMModel`) y [[herramientas/dspy]] (`dspy.LM`) se apoyan en él.
- Cambiar entre API y modelo local con un string: `ollama`, `ollama_chat`, `hosted_vllm`, `vllm`, `lm_studio` y `llamafile` están en su lista de proveedores.
- Poner un proxy delante de tus modelos para que agentes de código y aplicaciones apunten a una sola URL.

## Cuándo usarla

Cuando necesitas varios proveedores detrás de una interfaz, quieres probar el mismo agente con Claude y con un modelo de [[glosario/pesos-abiertos|pesos abiertos]], o tu framework solo habla formato OpenAI.

## Cuándo no

Si solo usas Claude: el [[herramientas/anthropic-sdk]] te da antes las funciones nuevas (caché, razonamiento, herramientas del servidor), que una capa de traducción puede no cubrir igual.

## Ejemplo mínimo

```python title="litellm_minimo.py"
from litellm import completion

MODEL = "anthropic/claude-sonnet-5-5"           # local: "ollama_chat/qwen3" con api_base="http://localhost:11434"

mensajes = [{"role": "user", "content": "Resume en una frase qué es un agente de IA."}]
r = completion(model=MODEL, messages=mensajes, max_tokens=256,
               mock_response="Un modelo que usa herramientas en bucle.")   # quítalo para llamar de verdad
print(r.choices[0].message.content)             # la respuesta llega siempre con forma de OpenAI
```

Lo ejecuté con `litellm` 1.83.0 (la que instala `openai-agents[litellm]`): `mock_response` devuelve la respuesta simulada sin llamar a ninguna API, útil en pruebas.

> [!peligro] Fija versiones con hashes
> Las versiones 1.82.7 y 1.82.8 no existen hoy en PyPI: hay un hueco de publicación entre el 22 y el 31 de marzo de 2026, y la investigación no pudo confirmar el motivo en una fuente primaria. Para una dependencia que ve todas tus claves de API, fija la versión exacta e instala con hashes (`pip install --require-hashes`).

## Alternativas

- [[herramientas/vercel-ai-sdk]], la interfaz común equivalente en TypeScript.
- [[herramientas/langchain]] con `init_chat_model("proveedor:modelo")`.
- Servir el modelo tú mismo con [[herramientas/ollama]] o [[herramientas/vllm]], que ya exponen APIs compatibles con OpenAI y con Anthropic.

## Enlaces

- [PyPI](https://pypi.org/project/litellm/)
- En MoreContext: [[cursos/agentes-con-modelos-abiertos/index]] · [[recetas/agente-local-con-ollama]] · [[cursos/agentes-con-modelos-abiertos/06-local-o-api]]
