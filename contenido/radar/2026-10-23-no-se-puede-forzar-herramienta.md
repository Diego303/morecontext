---
titulo: Los modelos 5.5 ya no admiten forzar una herramienta
descripcion: Con Opus 5.5, Sonnet 5.5, Fable 5.1 y Mythos 5.1, tool_choice any o tool devuelve 400. Cómo entregar un resultado final sin forzar la llamada.
creado: 2026-10-23
categoria: modelos
tags: [tool-choice, herramientas, api, salida-estructurada]
fuente:
  titulo: Thinking · Documentación de la API de Claude
  url: https://platform.claude.com/docs/en/build-with-claude/thinking
relacionados: ["[[recetas/entregar-resultado-sin-forzar-herramienta]]", "[[glosario/tool-choice]]", "[[docs/herramientas/01-uso-de-herramientas]]", "[[docs/prompting/03-salida-estructurada]]"]
---

## Qué es

Con [[glosario/tool-choice|tool_choice]] `{"type": "any"}` o `{"type": "tool", "name": …}` obligabas al modelo a llamar a una herramienta. En Claude Opus 5.5, Sonnet 5.5, Fable 5.1 y Mythos 5.1 esas dos opciones devuelven 400 en cualquier petición, sea cual sea el modo de razonamiento ([documentación de razonamiento](https://platform.claude.com/docs/en/build-with-claude/thinking)). Las [notas de versión](https://platform.claude.com/docs/en/release-notes/overview) lo recogen en los lanzamientos de Opus 5.5 (22 sept. 2026, donde precisan que Fable 5.1 ya lo hacía) y de Sonnet 5.5 (28 sept.). `auto` y `none` siguen funcionando.

## Qué cambia en la práctica

- Forzar la herramienta `entregar` en el último paso, típico de subagentes que devuelven su trabajo a un orquestador, da error con `claude-sonnet-5-5`.
- Con `auto` el modelo decide. Tu bucle debe aceptar que a veces conteste con texto.
- La alternativa oficial: `auto` con herramientas `strict` o con [[glosario/salida-estructurada|salidas estructuradas]], y decir en el prompt cuándo usar cada herramienta.

## Qué hacer

1. Si lo que necesitas es un resultado con forma fija, pídelo en la última llamada con `output_config.format`. Mantén las mismas `tools` (cambiarlas invalida toda la caché) y prohíbe llamarlas con `none`:

```python title="entregar.py"
MODEL = "claude-sonnet-5-5"

def entregar(client, historial: list[dict], tools: list[dict], esquema: dict) -> str:
    """historial termina en un turno del asistente; devuelve el JSON que cumple el esquema."""
    resp = client.messages.create(
        model=MODEL, max_tokens=2048, tools=tools,
        tool_choice={"type": "none"},
        output_config={"format": {"type": "json_schema", "schema": esquema}},
        messages=historial + [{"role": "user", "content": "Entrega ya el resultado final."}],
    )
    return next(b.text for b in resp.content if b.type == "text")
```

2. Si la entrega tiene que ser una llamada a herramienta, deja solo esa herramienta con `strict: true`, usa `auto`, pídela en el prompt y comprueba en el bucle que llegó el `tool_use`; si no, repite con un recordatorio.
3. Busca `"any"` y `"tool"` en tus `tool_choice`. Paso a paso en [[recetas/entregar-resultado-sin-forzar-herramienta]] y referencia en [[docs/herramientas/01-uso-de-herramientas]].
