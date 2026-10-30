---
titulo: SDK de Anthropic
descripcion: "El cliente oficial de la API de Claude (anthropic en Python, @anthropic-ai/sdk en TypeScript) para mensajes, herramientas, streaming, caché y salidas estructuradas."
creado: 2026-10-29
tags: [sdk, api, anthropic, python, typescript, open-source]
relacionados: ["[[roadmap/40-primer-agente/02-el-bucle-agentico]]", "[[docs/herramientas/01-uso-de-herramientas]]", "[[herramientas/claude-agent-sdk]]", "[[docs/frameworks/01-elegir-framework]]"]
categoria: sdk
licencia: Apache-2.0
open_source: true
lenguajes: [Python, TypeScript, C#, Go, Java, PHP, Ruby]
url: https://platform.claude.com/docs
repositorio: https://github.com/anthropics/anthropic-sdk-python
version: "2.3.0"
revisado: 2026-10-29
---

El SDK de Anthropic es el cliente oficial de la API de Mensajes de Claude: una llamada, una respuesta con bloques (`text`, `tool_use`, `thinking`…) y un `stop_reason`. No trae bucle de agente: lo escribes tú, y por eso es la referencia con la que MoreContext enseña el mecanismo.

**Licencia**: el SDK de Python (`anthropic` 2.3.0) es Apache-2.0, open source. Lo comercial es la API: cada llamada se paga según el modelo y los tokens (consulta los precios en la documentación oficial). Hay SDK oficiales para TypeScript (`@anthropic-ai/sdk` 1.x), C#, Go, Java, PHP y Ruby.

## Para qué sirve

- Llamar a Claude con `client.messages.create(model=…, max_tokens=…, system=…, tools=…, messages=…)`.
- [[glosario/tool-use|Uso de herramientas]], *streaming* (`messages.stream`), conteo de tokens (`count_tokens`), [[glosario/prompt-caching|caché de prompts]] y [[glosario/salida-estructurada|salidas estructuradas]] (`output_config.format` o `messages.parse`).
- Acceder antes que nadie a lo nuevo de la plataforma: herramientas del servidor, compactación, razonamiento adaptativo.

## Cuándo usarla

- Para aprender cómo funciona un agente de verdad: ves cada bloque, cada `stop_reason` y el `usage`.
- En productos con un solo proveedor y pocos pasos, donde un framework añade más de lo que quita.

## Cuándo no

- Si necesitas cambiar de proveedor o usar un modelo local con el mismo código: mira [[herramientas/langchain]], [[herramientas/pydantic-ai]] o [[herramientas/litellm]].
- Si quieres el arnés completo de Claude Code (archivos, Bash, permisos): [[herramientas/claude-agent-sdk]].

## Ejemplo mínimo

El [[glosario/bucle-agentico|bucle agéntico]] entero, con un tope de pasos y un `tool_result` por cada `tool_use`:

```python title="bucle_sdk.py"
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()                 # lee ANTHROPIC_API_KEY

TOOLS = [{
    "name": "ver_pedido",
    "description": "Devuelve el estado de un pedido por su id (formato P-NNNN).",
    "input_schema": {"type": "object", "properties": {"pedido_id": {"type": "string"}}, "required": ["pedido_id"]},
}]


def ver_pedido(pedido_id: str) -> str:
    return f'{{"id": "{pedido_id}", "estado": "enviado"}}'


messages = [{"role": "user", "content": "¿Cómo va mi pedido P-1001?"}]
for _ in range(10):                            # tope de pasos: lo pones tú
    resp = client.messages.create(model=MODEL, max_tokens=1024, tools=TOOLS, messages=messages)
    messages.append({"role": "assistant", "content": resp.content})
    if resp.stop_reason != "tool_use":         # end_turn, max_tokens, refusal…
        break
    resultados = [{"type": "tool_result", "tool_use_id": b.id, "content": ver_pedido(**b.input)}
                  for b in resp.content if b.type == "tool_use"]   # uno por cada tool_use
    messages.append({"role": "user", "content": resultados})
print(resp.stop_reason, resp.content[-1].text if resp.content[-1].type == "text" else "")
```

Lo ejecuté contra un simulador de la API que valida el emparejamiento `tool_use`/`tool_result`: dos llamadas, termina en `end_turn`.

> [!aviso] Lo que cambió con la versión 2026-10-21
> El SDK 2.x envía `anthropic-version: 2026-10-21`, exige Python 3.10 o superior y usa `httpx2`. `temperature`, `top_p` y `top_k` ya no existen (`TypeError` en el SDK, 400 en la API), y `tool_choice` `any` o `tool` da 400 en Opus 5.5 y Sonnet 5.5: para un resultado final estructurado usa `output_config.format`.

## Alternativas

- [[herramientas/claude-agent-sdk]] para el arnés de Claude Code.
- [[herramientas/litellm]] para hablar con muchos proveedores con una sola interfaz.
- [[herramientas/vercel-ai-sdk]] en aplicaciones web con TypeScript.

## Enlaces

- [Documentación de la API de Claude](https://platform.claude.com/docs)
- [PyPI](https://pypi.org/project/anthropic/) · [npm](https://www.npmjs.com/package/@anthropic-ai/sdk)
- En MoreContext: [[roadmap/20-herramientas/01-ciclo-tool-use]] · [[docs/herramientas/01-uso-de-herramientas]] · [[recetas/entregar-resultado-sin-forzar-herramienta]]
