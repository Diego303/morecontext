---
titulo: "Error 400: tool_result sin su tool_use"
descripcion: Por qué la API rechaza tu historial con «unexpected tool_use_id found in tool_result blocks» y cómo reconstruir los turnos para que cada resultado tenga su llamada.
creado: 2026-10-29
sintoma: "Error 400: tool_result sin su tool_use"
tema: herramientas
nivel: intermedio
tags: [herramientas, tool-use, errores, api]
relacionados: ["[[roadmap/20-herramientas/01-ciclo-tool-use]]", "[[docs/herramientas/01-uso-de-herramientas]]", "[[glosario/tool-result]]", "[[problemas/el-agente-repite-la-misma-herramienta]]"]
---

Tu agente funciona en la primera vuelta y, justo al devolver el resultado de una herramienta, la API responde con un 400. En Python lo ves como `anthropic.BadRequestError` con uno de estos dos mensajes (`invalid_request_error`), tal como los devuelve la API real:

```text
messages.2.content.0: unexpected `tool_use_id` found in `tool_result` blocks: toolu_01A….
Each `tool_result` block must have a corresponding `tool_use` block in the previous message.

messages.2: `tool_use` ids were found without `tool_result` blocks immediately after: toolu_01B….
Each `tool_use` block must have a corresponding `tool_result` block in the next message.
```

El número (`messages.2`) es la posición del mensaje problemático en tu lista. El primero dice que mandas un resultado que no responde a ninguna llamada; el segundo, que una llamada se quedó sin resultado.

## Causas

- **Guardaste solo el texto del asistente.** Haces `messages.append({"role": "assistant", "content": texto})` y el bloque [[glosario/tool-use|tool_use]] desaparece del historial. El [[glosario/tool-result|tool_result]] siguiente ya no tiene a quién responder.
- **Los ids no casan.** Generas tú el `tool_use_id`, lo copias de otra vuelta o reconstruyes el historial desde una base de datos que no guarda los ids.
- **Resultados repartidos en varios mensajes.** El modelo pidió dos herramientas en paralelo y devuelves cada resultado en su propio mensaje `user`. El primero deja una llamada sin respuesta.
- **Texto antes de los resultados.** Un bloque `text` («Aquí tienes:») delante de los `tool_result` en el mismo mensaje. Van todos al principio; el texto, si lo hay, detrás.
- **Recortaste el historial por la mitad de un par.** Al compactar o quitar mensajes viejos borras el turno del asistente y dejas su resultado, o al revés.

## Cómo confirmarlo

Imprime los dos mensajes que rodean la posición del error y mira los bloques. O, mejor, revisa el historial antes de enviarlo con una función como esta (la probé contra los tres primeros casos de arriba):

```python title="revisar_historial.py"
def _bloques(m):
    c = m["content"]
    return [] if isinstance(c, str) else [b if isinstance(b, dict) else b.model_dump() for b in c]


def revisar_historial(messages: list[dict]) -> list[str]:
    """Devuelve los problemas de emparejamiento tool_use/tool_result antes de enviar."""
    problemas = []
    for i, m in enumerate(messages):
        if m["role"] != "user":
            continue
        bloques = _bloques(m)
        resultados = [b["tool_use_id"] for b in bloques if b.get("type") == "tool_result"]
        if not resultados:
            continue
        previo = messages[i - 1] if i > 0 else {"role": "user", "content": []}
        pedidos = [b["id"] for b in _bloques(previo) if b.get("type") == "tool_use"] if previo["role"] == "assistant" else []
        for rid in resultados:
            if rid not in pedidos:
                problemas.append(f"messages.{i}: tool_result {rid} sin tool_use en messages.{i - 1}")
        for pid in pedidos:
            if pid not in resultados:
                problemas.append(f"messages.{i}: falta el tool_result de {pid}")
        if any(b.get("type") != "tool_result" for b in bloques[: len(resultados)]):
            problemas.append(f"messages.{i}: hay bloques antes de los tool_result")
    return problemas
```

```text
solo texto del asistente  ['messages.2: tool_result toolu_01A sin tool_use en messages.1']
texto antes               ['messages.2: hay bloques antes de los tool_result']
repartidos                ['messages.2: falta el tool_result de toolu_01B', 'messages.3: tool_result toolu_01B sin tool_use en messages.2']
```

## Arreglo

Añade el `content` completo de la respuesta, tal cual, y responde a todas las llamadas en un único mensaje:

```python title="turno.py"
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()
TOOLS = [{"name": "ver_pedido", "description": "Estado de un pedido por id (P-123).",
          "input_schema": {"type": "object", "properties": {"id": {"type": "string"}}, "required": ["id"]}}]


def ver_pedido(id: str) -> str:
    return f"{id}: enviado"


def turno(messages: list[dict]) -> anthropic.types.Message:
    resp = client.messages.create(model=MODEL, max_tokens=1024, tools=TOOLS, messages=messages)
    messages.append({"role": "assistant", "content": resp.content})  # el turno ENTERO, con sus tool_use
    if resp.stop_reason == "tool_use":
        resultados = [
            {"type": "tool_result", "tool_use_id": b.id, "content": ver_pedido(**b.input)}
            for b in resp.content if b.type == "tool_use"
        ]
        messages.append({"role": "user", "content": resultados})  # todos juntos, en un solo mensaje
    return resp
```

Lo ejecuté con el simulador de la API del proyecto: con dos llamadas en paralelo, `revisar_historial` devuelve `[]` y la segunda vuelta termina en `end_turn`. Si una herramienta falla, no omitas su resultado: devuélvelo con `"is_error": True` ([[roadmap/20-herramientas/03-errores-e-is-error]]).

## Cómo evitarlo

- Trata el historial como solo-añadir: nunca reconstruyas un turno del asistente desde su texto. Además rompe la caché ([[problemas/la-cache-no-se-aprovecha]]).
- Si persistes conversaciones, guarda los bloques completos (con `id`, `name` e `input`), no solo el texto.
- Al recortar o compactar, quita pares completos `tool_use` + `tool_result`, o usa la compactación del servidor ([[docs/contexto/05-compactacion-y-limpieza-en-el-servidor]]).
- Llama a `revisar_historial` en tus pruebas y en desarrollo; un [[glosario/modelo-simulado|modelo simulado]] te lo enseña sin gastar ([[recetas/probar-agentes-sin-api]]).

## Ver también

- [[roadmap/20-herramientas/01-ciclo-tool-use]]
- [[roadmap/40-primer-agente/02-el-bucle-agentico]]
- [[docs/fundamentos/03-api-de-mensajes]]
- [[docs/herramientas/01-uso-de-herramientas]]
