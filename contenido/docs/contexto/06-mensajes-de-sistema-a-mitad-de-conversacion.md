---
titulo: Mensajes de sistema a mitad de conversación
descripcion: Cómo cambiar instrucciones, herramientas o esfuerzo en mitad de un agente con mensajes role system dentro de messages, sin invalidar la caché y respetando sus reglas de posición.
creado: 2026-10-29
orden: 6
nivel: avanzado
tags: [contexto, prompt-de-sistema, caching, herramientas]
aliases: [Mid-conversation system messages, Mensaje system intermedio]
relacionados: ["[[glosario/mensaje-de-sistema-intermedio]]", "[[recetas/entregar-resultado-sin-forzar-herramienta]]", "[[docs/contexto/02-prompt-caching]]", "[[docs/prompting/01-prompt-de-sistema]]"]
---

Un [[glosario/mensaje-de-sistema-intermedio|mensaje de sistema intermedio]] es un mensaje con `role: "system"` **dentro de la lista `messages`**, en el punto de la conversación en que una instrucción empieza a valer. Sirve para cambiar de fase («deja de investigar, redacta»), añadir o quitar herramientas o subir el esfuerzo a mitad de un [[glosario/agente|agente]], **sin tocar el `system` de nivel superior** y, por tanto, sin invalidar la caché del prefijo.

Es GA y sin cabecera en Fable 5.1, Mythos 5.1, Fable 5, Mythos 5, Opus 5.5, Opus 5, Opus 4.8, Sonnet 5.5 y Haiku 5.5. **No existe en Sonnet 5**: allí usa el `system` de nivel superior. Las variantes de un solo turno, de herramientas y de esfuerzo son beta.

## La forma

```json
{"role": "system", "content": "A partir de ahora responde solo en inglés."}
```

`content` es una cadena o una lista de bloques `text` (con las betas de herramientas, también `tool_addition` y `tool_removal`). En el SDK de Python 2.x es el tercer tipo de la unión `MessageParam` (`SystemMessageParam`), así que lo escribes como dict sin más ([[docs/fundamentos/05-versiones-de-api-y-sdks]]).

**Prioridad.** Si hay conflicto, un mensaje `system` posterior gana a uno anterior, y un mensaje `system` intermedio gana al `system` de nivel superior en los turnos que le siguen. Usa el de nivel superior para lo que vale toda la conversación (rol, reglas fijas) y los intermedios para lo que solo importa desde un momento dado.

## Por qué no rompe la caché

El [[docs/contexto/02-prompt-caching|prompt caching]] compara el prefijo byte a byte en el orden `tools` → `system` → `messages`. Si editas el `system` de nivel superior para cambiar de fase, cambias el principio del prefijo y pierdes la caché de todo lo que va detrás, incluido un historial de 100.000 tokens. El mensaje intermedio se añade **al final** del historial: todo lo anterior queda igual, la caché sigue acertando y solo el mensaje nuevo se procesa como entrada fresca.

Lo mismo pasa con el esfuerzo: cambiar `output_config.effort` de nivel superior reinicia la caché; cambiarlo con un mensaje `system` intermedio, no. La condición es no tocar lo ya enviado: editar o quitar un mensaje `system` que ya mandaste invalida la caché desde ese punto.

## Reglas de posición

Un mensaje `system` con contenido:

1. **Va justo después de un turno `user`** (vale un `user` que solo lleva `tool_result`) o de un `assistant` que termina en un resultado de herramienta del servidor.
2. **Es el último elemento de `messages` o va seguido de un `assistant`.**
3. **Nunca entre un `tool_use` y su `tool_result`.** Cualquier otra posición devuelve 400.

Tres matices: un mensaje que solo cambia el esfuerzo (con `content` vacío) se acepta en cualquier posición; varios `system` seguidos se juzgan juntos; y justo después de un turno pausado (`pause_turn`) se acepta texto, pero no `tool_addition` ni `tool_removal`. Como debe ir tras un `user`, un `system` con contenido no puede ser el primer mensaje. Por la misma regla, no puede ir justo después de un turno `assistant` que lleva un bloque `compaction` (por ejemplo, tras `pause_after_compaction`): añade antes un mensaje `user`, como hace el bucle de [[docs/contexto/05-compactacion-y-limpieza-en-el-servidor]].

En un [[glosario/bucle-agentico|bucle agéntico]] esto se traduce en una regla simple: **añade el `system` justo después del mensaje de `tool_result`**, antes de volver a llamar.

## Variantes beta

| Variante | Cabecera | Forma |
|---|---|---|
| **Un solo turno** | `mid-conversation-system-clear-at-2026-08-21` | `"clear_at": "next_user_message"` (por defecto `"never"`) |
| **Cambiar herramientas** | `inline-tools-2026-09-15` en la API de Claude (cubre referencias y definiciones en línea); `mid-conversation-tool-changes-2026-07-01` solo para referencias, también en Bedrock y Google Cloud | Bloques `tool_addition` y `tool_removal` en `content` |
| **Esfuerzo por mensaje** | `mid-conversation-output-config-2026-07-01` | `{"role": "system", "content": [], "output_config": {"effort": "low"}}` |

**Un solo turno.** Con `clear_at: "next_user_message"`, el mensaje solo se tiene en cuenta mientras no llegue otro `user` detrás. Después sigue en la lista pero no cuenta ni cuesta tokens. Es ideal para pistas de un turno («antes de buscar, lista lo que necesitas»). Restricciones: solo bloques `text`, sin `tool_addition`, `tool_removal`, `output_config` ni `cache_control`.

**Cambiar herramientas.** Cada bloque lleva un `tool`:

| `tool.type` | Campos | Para qué |
|---|---|---|
| `tool_reference` | `name` | Una herramienta ya declarada en `tools` |
| `tool_definition` | `definition` (la definición completa, o un `mcp_toolset`) | Una herramienta nueva, en línea |
| `mcp_tool_reference` | `server_name`, `name` | Una herramienta de un servidor del [[docs/herramientas/07-mcp-desde-la-api\|conector MCP]] |
| `mcp_toolset_reference` | `server_name` | Todo un servidor MCP |

Ojo a un detalle que confunde: dentro de `tool_addition` la referencia usa **`name`**; en el resultado de una búsqueda de herramientas usa **`tool_name`**. Toda herramienta declarada en `tools` está disponible desde el principio **salvo que lleve `defer_loading: true`**, que la mantiene oculta hasta que un `tool_addition` la saca ([[docs/herramientas/05-busqueda-y-carga-diferida]]). `tool_addition` también devuelve una herramienta que quitaste antes. Límites: 10.000 herramientas diferidas y 4 MB de definiciones añadidas tras el primer mensaje (400 con `available_tools_limit_exceeded`). Una referencia a un nombre que no existe da 400 con `tool_reference_unresolved`.

## Ejemplo completo: cambiar de fase

Un agente de investigación con dos fases. En la primera busca y lee, con una pista de un solo turno al empezar. La búsqueda va con esfuerzo bajo. Tras unos pasos, un `system` intermedio quita `buscar` y `leer`, hace aparecer `entregar` (declarada desde el principio pero diferida) y sube el esfuerzo para redactar.

```python title="fases.py"
import anthropic

MODEL = "claude-sonnet-5-5"
BETA_HERRAMIENTAS = "inline-tools-2026-09-15"            # cambios de herramientas a mitad de conversación
BETA_ESFUERZO = "mid-conversation-output-config-2026-07-01"
BETA_UN_TURNO = "mid-conversation-system-clear-at-2026-08-21"
MAX_PASOS = 30
client = anthropic.Anthropic()

def herramienta(nombre: str, descripcion: str, props: dict) -> dict:
    return {"name": nombre, "description": descripcion,
            "input_schema": {"type": "object", "properties": props, "required": list(props)}}

TOOLS = [
    herramienta("buscar", "Busca fuentes sobre el tema. Devuelve títulos y URL.", {"consulta": {"type": "string"}}),
    herramienta("leer", "Devuelve el texto de una URL encontrada con buscar.", {"url": {"type": "string"}}),
    {**herramienta("entregar", "Entrega el informe final. Úsala una sola vez, al terminar.",
                   {"informe": {"type": "string"}}), "defer_loading": True},   # oculta hasta la fase final
]

def ejecutar(nombre: str, args: dict) -> str:
    return f"[{nombre}] {args}"  # tus implementaciones

def puede_ir_system(mensajes: list[dict]) -> bool:
    """Un system con contenido debe ir justo después de un turno user (vale uno con tool_result)."""
    return bool(mensajes) and mensajes[-1]["role"] == "user"

def fase_final(mensajes: list[dict]) -> None:
    assert puede_ir_system(mensajes), "el system debe ir justo después de un turno user"
    mensajes.append({"role": "system", "content": [
        {"type": "text", "text": "Fase de entrega: no busques más. Redacta el informe y entrégalo con entregar."},
        {"type": "tool_removal", "tool": {"type": "tool_reference", "name": "buscar"}},
        {"type": "tool_removal", "tool": {"type": "tool_reference", "name": "leer"}},
        {"type": "tool_addition", "tool": {"type": "tool_reference", "name": "entregar"}},
    ]})
    mensajes.append({"role": "system", "content": [], "output_config": {"effort": "high"}})  # solo esfuerzo

def investigar(tema: str, pasos_busqueda: int = 6) -> str:
    mensajes = [{"role": "user", "content": f"Investiga y escribe un informe breve sobre: {tema}"},
                {"role": "system", "clear_at": "next_user_message",       # solo para este turno
                 "content": "Antes de buscar, lista qué necesitas y pide en paralelo lo que no dependa de otra cosa."},
                {"role": "system", "content": [], "output_config": {"effort": "low"}}]   # buscar no pide mucho esfuerzo
    for paso in range(MAX_PASOS):
        resp = client.beta.messages.create(
            model=MODEL, max_tokens=4096, tools=TOOLS, messages=mensajes,
            betas=[BETA_HERRAMIENTAS, BETA_ESFUERZO, BETA_UN_TURNO],
        )
        mensajes.append({"role": "assistant", "content": resp.content})
        if resp.stop_reason != "tool_use":
            return "".join(b.text for b in resp.content if b.type == "text")
        resultados = []
        for b in resp.content:
            if b.type != "tool_use":
                continue
            if b.name == "entregar":
                return b.input["informe"]
            resultados.append({"type": "tool_result", "tool_use_id": b.id, "content": ejecutar(b.name, b.input)})
        mensajes.append({"role": "user", "content": resultados})
        if paso + 1 == pasos_busqueda:
            fase_final(mensajes)
    raise RuntimeError("Sin terminar")
```

Probado con el simulador (`buscar` → `leer` → `entregar`, con la fase final tras dos pasos): la última petición lleva los roles `user, system, system, assistant, user, assistant, user, system, system`, es decir, la pista inicial y el esfuerzo bajo tras el primer `user` y los dos `system` de la fase final justo después del último `tool_result`, y las tres cabeceras beta van en `anthropic-beta`. Un bucle de producción trata además el resto de motivos de parada ([[docs/fundamentos/06-motivos-de-parada-y-rechazos]]).

Si no necesitas las betas, el cambio de fase más simple es GA: añade `{"role": "system", "content": "Fase de entrega: …"}` tras el último `tool_result` en una llamada normal a `client.messages.create`.

## Caso: entregar un resultado sin forzar una herramienta

En Opus 5.5, Sonnet 5.5, Fable 5.1 y Mythos 5.1, `tool_choice` de tipo `any` o `tool` devuelve 400 ([[radar/2026-10-23-no-se-puede-forzar-herramienta]]). El patrón de «forzar `entregar` en el último paso» hay que sustituirlo. Tres opciones, de más simple a más flexible:

1. **Última llamada sin herramientas y con `output_config.format`**: la respuesta es JSON que cumple tu esquema ([[docs/prompting/03-salida-estructurada]]).
2. **Un `system` intermedio con la instrucción y `tool_removal`** de todo salvo `entregar`, como en el ejemplo. El modelo no está obligado, pero es la única acción que le queda.
3. **Una pista de un solo turno** (`clear_at`) si solo quieres empujar sin quitar herramientas.

La receta paso a paso está en [[recetas/entregar-resultado-sin-forzar-herramienta]].

## En Managed Agents

El equivalente es el evento `system.message`: vale para ese turno y los siguientes, porque el `system` del agente no puede cambiar durante una sesión. Ver [[docs/agentes/04-managed-agents]].

## Errores frecuentes

- **Ponerlo entre un `tool_use` y su `tool_result`**, o justo después de un `assistant` normal. 400. Añádelo tras el mensaje de resultados.
- **Usarlo en Sonnet 5.** No existe allí.
- **Ponerlo justo tras un turno con bloque `compaction`.** Falta el `user` previo y la petición se rechaza.
- **Meter `tool_removal` o `output_config` en un mensaje con `clear_at: "next_user_message"`.** Los de un solo turno solo admiten texto.
- **`tool_reference` con `tool_name`.** En cambios de herramientas el campo es `name`.
- **Editar el `system` de nivel superior para cambiar de fase.** Funciona, pero pagas el prefijo entero otra vez.
- **Contradicciones acumuladas.** Gana el último mensaje, pero diez instrucciones que se pisan confunden. Prefiere pocos cambios de fase claros.

## Ver también

- [[docs/prompting/01-prompt-de-sistema]]: qué va en el `system` de nivel superior.
- [[docs/contexto/05-compactacion-y-limpieza-en-el-servidor]]: la otra forma de gestionar un contexto largo.
- [[recetas/diagnosticar-fallos-de-cache]]: comprobar que la caché sigue acertando.
- [[glosario/mensaje-de-sistema-intermedio]].
