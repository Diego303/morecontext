---
titulo: Modelos, mensajes y herramientas en LangChain
descripcion: Crea modelos de Claude y Ollama con max_tokens explícito, define herramientas con @tool, haz a mano una vuelta tool_calls → ToolMessage y evita la trampa de las excepciones.
creado: 2026-10-29
orden: 2
minutos: 35
tipo: practica
objetivos:
  - Crear un modelo de Claude y uno local con init_chat_model fijando max_tokens y sin parámetros de muestreo rechazados.
  - Definir herramientas con @tool(parse_docstring=True) y comprobar el esquema que recibe el modelo.
  - Ejecutar a mano una vuelta del ciclo con bind_tools, tool_calls y ToolMessage, y relacionarla con tool_use, tool_result e is_error.
  - Devolver al modelo los errores de una herramienta en lugar de romper la ejecución, y pedir salida estructurada compatible con Claude.
requiere: ["[[cursos/langchain-y-langgraph/01-cuando-usar-un-framework]]", "[[roadmap/20-herramientas/03-errores-e-is-error]]"]
relacionados: ["[[docs/frameworks/04-langchain]]", "[[roadmap/20-herramientas/02-definir-herramientas]]", "[[glosario/tool-result]]", "[[docs/prompting/03-salida-estructurada]]"]
tags: [langchain, herramientas, mensajes, modelos]
---

Al terminar esta lección sabrás crear un modelo de Claude o uno local con LangChain sin caer en sus valores por defecto, escribir herramientas cuyo esquema llega completo al modelo y hacer a mano una vuelta del ciclo de herramientas. Es la pieza que `create_agent` repite por ti en la lección siguiente; verla suelta te enseña qué traduce y dónde puede fallar.

## La idea

LangChain pone una capa común sobre la API de cada proveedor. Tú trabajas con **mensajes** y **herramientas** de LangChain, y la integración (`langchain-anthropic`, `langchain-ollama`) los traduce al formato del proveedor en cada llamada. Todo lo que sabes del ciclo `tool_use` → `tool_result` sigue siendo verdad; solo cambian los nombres:

| API de Claude (lo que ya conoces) | LangChain |
|---|---|
| `client.messages.create(...)` | `modelo.invoke(mensajes)` |
| `tools=[{name, description, input_schema}]` | `modelo.bind_tools([funcion_con_tool])` |
| Bloque `tool_use` (`id`, `name`, `input`) | `AIMessage.tool_calls`: `{"id", "name", "args"}` |
| Bloque `tool_result` con `tool_use_id` | `ToolMessage(content, tool_call_id=…)` |
| `is_error: true` | `ToolMessage(..., status="error")` |
| `system=` | `SystemMessage` al principio de la lista |

## Modelos: siempre con max_tokens

`init_chat_model` crea el modelo a partir de `"proveedor:modelo"`. Con `"anthropic:…"` devuelve un `ChatAnthropic`; con `"ollama:…"`, un `ChatOllama`. La misma API sirve para los dos.

```python tab="LangChain" title="modelos.py"
from langchain.chat_models import init_chat_model

MODEL = "anthropic:claude-sonnet-5-5"

llm = init_chat_model(MODEL, max_tokens=1024)      # sin max_tokens pediría el máximo del modelo
respuesta = llm.invoke("¿Cuánto tarda un envío estándar? Responde en una frase.")
print(respuesta.text)
print(respuesta.usage_metadata)                    # input_tokens, output_tokens…
```

```python tab="Ollama" title="modelos_local.py"
from langchain.chat_models import init_chat_model

MODEL = "ollama:qwen3.6:27b"                        # un modelo local que admita herramientas

llm = init_chat_model(MODEL, num_ctx=32768)        # contexto explícito: el de Ollama por defecto es corto
respuesta = llm.invoke("¿Cuánto tarda un envío estándar? Responde en una frase.")
print(respuesta.text)
```

Dos comportamientos de `ChatAnthropic` que hemos comprobado y que no salen en los tutoriales:

- **Sin `max_tokens`**, toma el máximo del perfil del modelo: `init_chat_model("anthropic:claude-sonnet-5-5").max_tokens` vale `128000`. No es un fallo, pero sí un tope de gasto que nadie eligió. Pásalo siempre. En el SDK no podías olvidarlo porque era obligatorio.
- **`temperature` no existe en la API de Claude actual.** LangChain acepta `temperature=0.2` al construir el modelo, pero falla en la primera llamada con `ValueError: temperature is not supported for claude-sonnet-5-5 at non-default values`. Lo mismo con `top_p` y `top_k`. Muchos ejemplos de internet lo llevan: quítalo. En Ollama y otros modelos abiertos sigue existiendo.

Para un modelo local, el contexto importa más que con una API: el que usa Ollama por defecto depende de la versión y de la memoria de tu máquina, puede ser de solo unos miles de tokens, y un agente con herramientas lo llena enseguida. Fíjalo con `num_ctx` y compruébalo con `ollama ps`. El detalle está en [[cursos/agentes-con-modelos-abiertos/04-herramientas-con-modelos-abiertos]].

## Mensajes y content blocks

Los mensajes viven en `langchain.messages`: `SystemMessage`, `HumanMessage`, `AIMessage` y `ToolMessage`. También aceptan la forma corta `("user", "texto")` o `{"role": "user", "content": "texto"}`.

Un `AIMessage` de Claude guarda el contenido original del proveedor en `.content` (una lista de bloques con `thinking`, `text`, `tool_use`) y además ofrece una vista estándar:

- `.text`: solo el texto, unido.
- `.tool_calls`: las peticiones de herramienta normalizadas.
- `.content_blocks`: los bloques traducidos a tipos comunes a todos los proveedores. Con un mensaje de Claude que lleva razonamiento, texto y una herramienta, `content_blocks` da los tipos `reasoning`, `text` y `tool_call`.
- `.usage_metadata` y `.response_metadata` (ahí está `stop_reason` en Claude; en Ollama, `done_reason`).

Usa `.text` y `.tool_calls` en tu código y deja `.content` para cuando necesites algo propio del proveedor.

## Herramientas con @tool

`@tool` convierte una función en herramienta: el nombre sale de la función, el esquema de los tipos y la descripción del *docstring*. Con un detalle importante: **sin `parse_docstring=True`, la sección `Args:` no llega a cada parámetro**, se queda pegada a la descripción general.

```python title="herramientas.py"
import json

from langchain.tools import tool

PEDIDOS = {"ana@example.com": [{"id": "P-1001", "estado": "enviado", "fecha": "2026-09-10"}]}
AYUDA = {"devoluciones": "Tienes 30 días desde la entrega para devolver un producto sin usar."}


@tool(parse_docstring=True)
def ver_pedidos(email: str) -> str:
    """Lista los pedidos de un cliente por su email. Devuelve id, estado y fecha de cada pedido.

    Args:
        email: Email del cliente, tal como lo escribió.
    """
    pedidos = PEDIDOS.get(email.lower())
    if pedidos is None:
        raise ValueError(f"No hay ningún cliente con email {email}")
    return json.dumps(pedidos, ensure_ascii=False)


@tool(parse_docstring=True)
def buscar_ayuda(tema: str) -> str:
    """Busca en el centro de ayuda. Úsala para políticas: devoluciones, envíos, pagos.

    Args:
        tema: Una o dos palabras, p. ej. "devoluciones".
    """
    tema = tema.lower()
    return next((t for k, t in AYUDA.items() if k in tema or tema in k), "Sin resultados.")


if __name__ == "__main__":
    print(json.dumps(ver_pedidos.tool_call_schema.model_json_schema(), ensure_ascii=False, indent=2))
```

Ejecutarlo imprime el esquema que verá el modelo (salida real):

```json
{
  "description": "Lista los pedidos de un cliente por su email. Devuelve id, estado y fecha de cada pedido.",
  "properties": {
    "email": {
      "description": "Email del cliente, tal como lo escribió.",
      "title": "Email",
      "type": "string"
    }
  },
  "required": ["email"],
  "title": "ver_pedidos",
  "type": "object"
}
```

Sin `parse_docstring=True`, `email` sale sin `description` y el bloque `Args:` entero acaba en la descripción de la herramienta. Es el mismo esquema que escribías a mano en [[roadmap/20-herramientas/02-definir-herramientas]]: mira siempre qué se genera, porque el modelo solo sabe lo que pone ahí.

## Una vuelta del ciclo, a mano

Antes de usar `create_agent`, haz una vuelta tú. `bind_tools` añade las herramientas a cada llamada; `tool.invoke(llamada)` ejecuta una `tool_call` y devuelve directamente un `ToolMessage` con el `tool_call_id` correcto.

```python title="ciclo.py"
from langchain.chat_models import init_chat_model
from langchain.messages import HumanMessage, SystemMessage, ToolMessage

from herramientas import buscar_ayuda, ver_pedidos

MODEL = "anthropic:claude-sonnet-5-5"
TOOLS = {t.name: t for t in [ver_pedidos, buscar_ayuda]}


def una_vuelta(pregunta: str, modelo=None) -> list:
    llm = (modelo or init_chat_model(MODEL, max_tokens=1024)).bind_tools(list(TOOLS.values()))
    mensajes = [SystemMessage("Eres el soporte de una tienda online. Usa las herramientas."),
                HumanMessage(pregunta)]
    respuesta = llm.invoke(mensajes)                  # AIMessage
    mensajes.append(respuesta)                        # entero, como el bloque assistant
    for llamada in respuesta.tool_calls:              # una por cada tool_use
        try:
            mensajes.append(TOOLS[llamada["name"]].invoke(llamada))   # devuelve un ToolMessage
        except Exception as e:                        # sin esto, la excepción sale de aquí
            mensajes.append(ToolMessage(f"Error: {e}", tool_call_id=llamada["id"],
                                        name=llamada["name"], status="error"))
    mensajes.append(llm.invoke(mensajes))             # segunda llamada con los resultados
    return mensajes


if __name__ == "__main__":
    for m in una_vuelta("Soy ana@example.com. ¿Dónde está mi pedido y hasta cuándo puedo devolverlo?"):
        m.pretty_print()
```

Para probarlo sin clave, sustituye Claude por un [[glosario/modelo-simulado|modelo simulado]] que devuelve respuestas guionizadas. `GenericFakeChatModel` de `langchain-core` no implementa `bind_tools`, así que usamos una subclase mínima; la verás entera en la lección 3. Con un email que no existe:

```python title="prueba_ciclo.py"
from langchain.messages import AIMessage

from _fakes import guion, llamada
from ciclo import una_vuelta

modelo = guion(                                       # lo que «diría» Claude, guionizado
    AIMessage(content="", tool_calls=[llamada("ver_pedidos", {"email": "nadie@example.com"}, "toolu_01"),
                                      llamada("buscar_ayuda", {"tema": "devoluciones"}, "toolu_02")]),
    AIMessage(content="No encuentro pedidos con ese email. Puedes devolver un producto sin usar en 30 días."),
)
for m in una_vuelta("Soy nadie@example.com. ¿Y mi pedido?", modelo):
    detalle = [c["name"] for c in m.tool_calls] if m.type == "ai" and m.tool_calls else m.text
    print(f"{m.type:6} {getattr(m, 'status', '') or '':8} {detalle}")
```

Salida real:

```text
system          Eres el soporte de una tienda online. Usa las herramientas.
human           Soy nadie@example.com. ¿Y mi pedido?
ai              ['ver_pedidos', 'buscar_ayuda']
tool   error    Error: No hay ningún cliente con email nadie@example.com
tool   success  Tienes 30 días desde la entrega para devolver un producto sin usar.
ai              No encuentro pedidos con ese email. Puedes devolver un producto sin usar en 30 días.
```

¿Qué llega a Claude? Inspeccionando la petición que construye `ChatAnthropic` con estos mensajes, el `SystemMessage` pasa a `system`, el `AIMessage` a un mensaje `assistant` con su bloque `tool_use`, y **los dos `ToolMessage` consecutivos se agrupan en un único mensaje `user`** con dos `tool_result`, el del error con `"is_error": true`. Es exactamente la regla que cumplías a mano: un resultado por cada petición, todos juntos.

## La trampa de las excepciones

Fíjate en el `try` de `ciclo.py`. `tool.invoke()` **no captura las excepciones de tu función**: si `ver_pedidos` lanza `ValueError`, la excepción sube y, dentro de un agente, rompe la ejecución entera en lugar de volver al modelo como `is_error`. Es justo lo contrario de lo que aprendiste en [[roadmap/20-herramientas/03-errores-e-is-error]]. Dentro de un agente, lo único que vuelve solo al modelo son los errores de validación de argumentos (un campo que falta), porque los captura el nodo de herramientas.

Tienes dos formas de conseguir el equivalente a `is_error`:

1. **`ToolException` + `handle_tool_error`**: lanza `ToolException` (de `langchain.tools`) en lugar de otra excepción y activa `ver_pedidos.handle_tool_error = True`. Comprobado: `invoke` devuelve entonces un `ToolMessage` con `status="error"` y tu mensaje. Ojo, solo vale para `ToolException`; un `ValueError` sigue rompiendo.
2. **`ToolErrorMiddleware(on_error=…)`** en `create_agent`: convierte cualquier excepción de cualquier herramienta en un `ToolMessage` de error. Es la opción que usa el curso desde la lección 3, porque no te obliga a cambiar cada herramienta.

> [!peligro] Un error de herramienta no debe tumbar al agente
> Un email mal escrito, un pedido que no existe o una API que tarda son fallos esperables. Si llegan como excepción, tu agente responde con un error 500 a una pregunta que el modelo habría resuelto pidiendo otro dato.

## Salida estructurada

Para obtener un objeto validado en lugar de texto, `with_structured_output`. Con Claude hay un matiz: el método por defecto (`"function_calling"`) se basa en forzar una herramienta, y **los modelos 5.5 no admiten forzar herramientas**. LangChain lo avisa en `claude-sonnet-5-5` y puede acabar en `OutputParserException`. Usa `method="json_schema"`, que se traduce a `output_config.format`, la salida estructurada nativa de la API:

```python title="clasificar.py"
from typing import Literal

from langchain.chat_models import init_chat_model
from pydantic import BaseModel, Field

MODEL = "anthropic:claude-sonnet-5-5"


class Clasificacion(BaseModel):
    """Clasificación de un ticket de soporte."""
    categoria: Literal["pedido", "devolucion", "pago", "otro"]
    urgente: bool = Field(description="True si el cliente no puede usar el producto")


llm = init_chat_model(MODEL, max_tokens=512)
clasificador = llm.with_structured_output(Clasificacion, method="json_schema")   # output_config.format

if __name__ == "__main__":
    print(clasificador.invoke("Me ha llegado la cafetera rota y no puedo usarla"))
```

```text
# salida de ejemplo
categoria='devolucion' urgente=True
```

Hemos comprobado la petición: lleva `output_config={"format": {"type": "json_schema", "schema": {…, "additionalProperties": False}}}` y ninguna herramienta forzada. Más sobre esquemas y sus límites en [[docs/prompting/03-salida-estructurada]].

## Errores frecuentes

- Crear el modelo sin `max_tokens` o con `temperature`.
- Olvidar `parse_docstring=True` y dejar los parámetros sin descripción.
- Lanzar `ValueError` en una herramienta y esperar que el modelo lo vea.
- Guardar en el historial solo `respuesta.text` y perder los `tool_calls`: la siguiente llamada no tendría a qué asociar los `ToolMessage` (el error de [[problemas/tool-result-sin-tool-use]]).
- Usar `with_structured_output` sin `method="json_schema"` con los modelos 5.5.

## Ejercicio

> [!ejercicio] Tu herramienta, a mano
> Añade a `herramientas.py` una herramienta `estado_envio(pedido_id)` que lance `ToolException` con un mensaje útil cuando el id no tenga el formato `P-NNNN`. Activa `handle_tool_error`. Imprime su esquema y haz una vuelta con `una_vuelta` y un modelo simulado que la llame con `"1001"`.
>
> **Está bien si** el esquema muestra la descripción de `pedido_id`, si la vuelta termina sin excepción con un `ToolMessage` en `status="error"` que dice cómo corregir el id, y si al cambiar `ToolException` por `ValueError` (sin el `try` de `una_vuelta`) ves que la ejecución se rompe.

> [!ejercicio]- Pistas
> Para la prueba sin el `try`, llama directamente a `estado_envio.invoke(llamada("estado_envio", {"pedido_id": "1001"}, "t1"))`. La función `llamada` del módulo `_fakes` construye el diccionario de la `tool_call`.

## Resumen

- `init_chat_model("anthropic:…", max_tokens=…)` o `"ollama:…"`: misma API, y siempre con `max_tokens`; sin `temperature` en Claude.
- `tool_calls` y `ToolMessage` son `tool_use` y `tool_result`; LangChain agrupa los resultados en un mensaje por ti.
- `@tool(parse_docstring=True)` para que cada parámetro lleve su descripción.
- Las excepciones de una herramienta no vuelven al modelo: usa `ToolException` o `ToolErrorMiddleware`.
- Salida estructurada con Claude 5.5: `method="json_schema"`.

## Para seguir

- [[cursos/langchain-y-langgraph/03-tu-primer-agente-con-create-agent]]
- [[docs/frameworks/04-langchain]]
- [[herramientas/ollama]]
