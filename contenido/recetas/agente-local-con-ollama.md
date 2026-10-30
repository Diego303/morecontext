---
titulo: Un agente con herramientas en local con Ollama
descripcion: Monta un agente con tool calling que corre entero en tu máquina con Ollama, primero con el bucle a mano por la API compatible con OpenAI y después con ChatOllama y create_agent.
creado: 2026-10-29
nivel: inicial
minutos: 30
tema: agentes
stack: ["Ollama", "Python", "LangChain"]
tags: [agentes, ollama, modelos-abiertos, langchain, tool-use]
relacionados: ["[[docs/modelos-abiertos/01-ollama]]", "[[problemas/modelo-local-no-llama-herramientas]]", "[[cursos/langchain-y-langgraph/03-tu-primer-agente-con-create-agent]]", "[[herramientas/ollama]]", "[[sistemas/asistente-100-local]]"]
---

## Problema

Quieres un [[glosario/agente|agente]] que consulte tus datos con herramientas sin que nada salga de tu máquina: por privacidad, para trabajar sin conexión o para no pagar por token mientras prototipas. Necesitas un modelo de [[glosario/pesos-abiertos|pesos abiertos]] que sepa pedir herramientas, un servidor local que lo sirva y un bucle que no se rompa cuando el modelo local se equivoque, que lo hará más a menudo que un modelo grande en la nube.

## Ingredientes

- [Ollama](https://ollama.com) instalado y en marcha (`ollama serve`, escucha en `127.0.0.1:11434`). Ficha: [[herramientas/ollama]].
- Un modelo con la capacidad `tools` en la biblioteca de Ollama. Aquí, `qwen3.6:27b` (Apache 2.0, unos 17 GB en Q4_K_M). Con poca memoria, elige uno más pequeño de la misma biblioteca con la etiqueta `tools`.
- Python 3.10 o superior: `pip install openai langchain langchain-ollama`.
- Conocer el ciclo de [[glosario/tool-use|tool use]] ([[roadmap/20-herramientas/01-ciclo-tool-use]]).

## Pasos

1. **Descarga el modelo y mira su contexto real.** El contexto por defecto de Ollama es pequeño y depende de la versión y de la memoria. Si el prompt de tu agente no cabe, Ollama lo **trunca en silencio** y el modelo «olvida» las herramientas o el sistema.

```bash
ollama pull qwen3.6:27b
ollama run qwen3.6:27b "hola" && ollama ps      # la columna CONTEXT dice el contexto con el que se cargó
```

2. **Escribe el bucle a mano contra la API compatible con OpenAI.** Ollama expone `/v1/chat/completions`, así que el cliente `openai` sirve tal cual cambiando `base_url`. Es el mismo [[glosario/bucle-agentico|bucle agéntico]] que con Claude: llamas, si hay `tool_calls` ejecutas y devuelves un mensaje `tool` por cada llamada, y repites hasta que no las haya o hasta el límite de pasos.

```python title="agente_ollama.py"
import json

from openai import OpenAI

MODEL = "qwen3.6:27b"          # cualquier modelo con la etiqueta «tools» en ollama.com/library
MAX_PASOS = 6
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")  # la clave es obligatoria, Ollama la ignora

PEDIDOS = {"A-123": {"estado": "enviado", "transportista": "SEUR"}}


def buscar_pedido(pedido_id: str) -> dict:
    if pedido_id not in PEDIDOS:
        raise ValueError(f"No existe el pedido {pedido_id}")
    return {"pedido_id": pedido_id, **PEDIDOS[pedido_id]}


TOOLS = [{
    "type": "function",
    "function": {
        "name": "buscar_pedido",
        "description": "Devuelve estado y transportista de un pedido a partir de su identificador.",
        "parameters": {
            "type": "object",
            "properties": {"pedido_id": {"type": "string", "description": "Identificador, p. ej. A-123"}},
            "required": ["pedido_id"],
        },
    },
}]
FUNCIONES = {"buscar_pedido": buscar_pedido}
SYSTEM = "Eres un agente de soporte. Usa las herramientas para consultar datos; no los inventes."


def ejecutar(call) -> str:
    """Ejecuta una tool_call y devuelve SIEMPRE un texto para el modelo, también si falla."""
    try:
        funcion = FUNCIONES[call.function.name]           # el modelo puede inventarse el nombre
        args = json.loads(call.function.arguments or "{}")  # o generar JSON roto
        return json.dumps(funcion(**args), ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": f"{type(e).__name__}: {e}"}, ensure_ascii=False)


def agente(pregunta: str) -> str:
    messages = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": pregunta}]
    for _ in range(MAX_PASOS):                            # nunca un bucle sin tope
        r = client.chat.completions.create(model=MODEL, messages=messages, tools=TOOLS, max_tokens=1024)
        eleccion = r.choices[0]
        msg = eleccion.message
        if eleccion.finish_reason == "length":
            return "[respuesta cortada por max_tokens]"
        if not msg.tool_calls:                            # sin llamadas: es la respuesta final
            return msg.content or ""
        messages.append(msg.model_dump(exclude_none=True))  # el turno del asistente, con sus tool_calls
        for call in msg.tool_calls:                         # un mensaje "tool" por cada llamada
            messages.append({"role": "tool", "tool_call_id": call.id, "content": ejecutar(call)})
    return "[límite de pasos alcanzado]"


if __name__ == "__main__":
    print(agente("¿Cómo va mi pedido A-123?"))
```

Tres decisiones que importan más en local que con un modelo grande: `ejecutar()` nunca lanza (un nombre inventado o un JSON roto vuelven al modelo como error para que se corrija), `max_tokens` va siempre (en Ollama la salida no tiene límite por defecto) y el bucle tiene tope.

3. **Sube el contexto si hace falta.** La API compatible con OpenAI no tiene campo para el contexto. Crea una variante del modelo con un `Modelfile`:

```text title="Modelfile"
FROM qwen3.6:27b
PARAMETER num_ctx 32768
```

```bash
ollama create qwen3.6-32k -f Modelfile     # y usa MODEL = "qwen3.6-32k"
```

Para agentes con muchas herramientas o resultados largos, Ollama recomienda al menos 64k si la máquina lo permite. Más contexto es más memoria (la [[glosario/kv-cache|KV cache]] crece con él): compruébalo con `ollama ps`.

4. **Pasa a LangChain cuando quieras dejar de mantener el bucle.** `create_agent` hace el mismo bucle; `ChatOllama` habla con la API nativa de Ollama y sí acepta `num_ctx` por petición.

```python title="agente_langchain_ollama.py"
import json

from langchain.agents import create_agent
from langchain.agents.middleware import ModelCallLimitMiddleware, ToolErrorMiddleware
from langchain.tools import tool
from langchain_ollama import ChatOllama

MODEL = "qwen3.6:27b"
PEDIDOS = {"A-123": {"estado": "enviado", "transportista": "SEUR"}}


@tool(parse_docstring=True)               # sin esto, la descripción de Args no llega al esquema
def buscar_pedido(pedido_id: str) -> str:
    """Devuelve estado y transportista de un pedido a partir de su identificador.

    Args:
        pedido_id: Identificador del pedido, p. ej. A-123.
    """
    if pedido_id not in PEDIDOS:
        raise ValueError(f"No existe el pedido {pedido_id}")
    return json.dumps({"pedido_id": pedido_id, **PEDIDOS[pedido_id]}, ensure_ascii=False)


def crear_agente(modelo=None):
    modelo = modelo or ChatOllama(
        model=MODEL,
        num_ctx=32768,          # el contexto por defecto de Ollama es pequeño y trunca en silencio
        num_predict=1024,       # por defecto -1: sin límite de salida
        temperature=0,
        reasoning=False,        # razonamiento apagado: menos tokens por paso
    )
    return create_agent(
        model=modelo,
        tools=[buscar_pedido],
        system_prompt="Eres un agente de soporte. Usa las herramientas para consultar datos; no los inventes.",
        middleware=[
            ToolErrorMiddleware(on_error=lambda exc, request: f"Error: {exc}"),   # la excepción vuelve al modelo
            ModelCallLimitMiddleware(run_limit=6, exit_behavior="end"),          # límite de pasos
        ],
    )


if __name__ == "__main__":
    salida = crear_agente().invoke({"messages": [{"role": "user", "content": "¿Cómo va mi pedido A-123?"}]})
    for m in salida["messages"]:
        m.pretty_print()
```

Lo que esconde el framework: el bucle, el mensaje `tool` por llamada y la conversión de la función a esquema. Lo que **no** hace solo: sin `ToolErrorMiddleware`, una excepción en la herramienta rompe el agente en lugar de volver al modelo, y sin `ModelCallLimitMiddleware` no hay un tope de pasos útil. Lo explica [[cursos/langchain-y-langgraph/04-middleware]].

## Cómo comprobar que funciona

Con Ollama en marcha, `python agente_ollama.py` debe contestar con el estado del pedido. Para probar el bucle sin servidor, ejecuté los dos archivos con respuestas simuladas: el de OpenAI con un transporte HTTP falso que imita `/v1/chat/completions`, y el de LangChain con un [[glosario/modelo-simulado|modelo simulado]] (la técnica de [[recetas/probar-agentes-sin-api]]). En los dos guiones el modelo se equivoca primero de id (`A-12`) y luego acierta. Salida real:

```text
# bucle a mano (openai 3.41 contra un /v1 simulado)
final: Tu pedido A-123 está enviado con SEUR.
llamadas al modelo: 3
  assistant  ['{"pedido_id": "A-12"}']
  tool {"error": "ValueError: No existe el pedido A-12"} []
  assistant  ['{"pedido_id": "A-123"}']
  tool {"pedido_id": "A-123", "estado": "enviado", "transportista": "SEUR"} []
campos enviados: ['max_tokens', 'messages', 'model', 'tools']

# create_agent con modelo simulado (langchain 1.4.7, langchain-ollama 1.1.0)
tipos: ['HumanMessage', 'AIMessage', 'ToolMessage', 'AIMessage', 'ToolMessage', 'AIMessage']
tool: error | Error: No existe el pedido A-12
tool: success | {"pedido_id": "A-123", "estado": "enviado", "transportista": "SEUR"}
esquema: {'pedido_id': {'description': 'Identificador del pedido, p. ej. A-123.', 'title': 'Pedido Id', 'type': 'string'}}
init_chat_model: ChatOllama qwen3.6:27b
```

Comprueba además, con el modelo real:

- Que el error de herramienta vuelve como mensaje `tool` y el modelo se corrige en el paso siguiente.
- Que `ollama ps` muestra el contexto que esperas mientras el agente trabaja.
- Que una pregunta sin pedido («¿qué horario tenéis?») no dispara la herramienta.

## Variaciones

- **El SDK de Anthropic contra Ollama.** Ollama también expone `/v1/messages`: `anthropic.Anthropic(base_url="http://localhost:11434", api_key="ollama")` ejecuta el código de la web en local, sin `tool_choice`, sin caché y sin `count_tokens` ([[docs/modelos-abiertos/03-apis-compatibles-y-litellm]]).
- **Con la cadena del modelo.** `create_agent("ollama:qwen3.6:27b", tools)` también funciona: `init_chat_model` crea un `ChatOllama`. Pierdes el control de `num_ctx` y `num_predict`, así que mejor la instancia.
- **El mismo agente con Claude.** Cambia el modelo por `init_chat_model("anthropic:claude-sonnet-5-5", max_tokens=1024)` y nada más. Útil para fijar el techo de calidad con tus [[glosario/evals|evals]] antes de decidir si el modelo local basta.
- **Más tarde, en serio.** Para varios usuarios a la vez, sirve el modelo con vLLM ([[recetas/servir-un-modelo-con-vllm]]); el cliente es el mismo cambiando `base_url`.

## Errores típicos

- **El modelo responde en texto en lugar de llamar a la herramienta.** Suele ser un modelo sin la capacidad `tools`, un contexto truncado o una plantilla de chat que no la soporta. Diagnóstico completo en [[problemas/modelo-local-no-llama-herramientas]].
- **Forzar la herramienta con `tool_choice`.** Ollama no lo implementa ni en la API OpenAI ni en la Anthropic: no confíes en él. Describe bien la herramienta y valida en tu código.
- **Confiar en los argumentos.** Un modelo pequeño inventa ids y rompe el JSON con más frecuencia. Valida y devuelve el error al modelo; no lo dejes caer.
- **Sin límite de pasos ni de salida.** `num_predict` vale -1 por defecto: un modelo que divaga genera sin parar. Pon `max_tokens` o `num_predict` y un tope de pasos.
- **Usar una etiqueta `:cloud` creyendo que es local.** Esos modelos se ejecutan en los servidores de Ollama: tus datos salen de la máquina.
- **Exponer Ollama en la red.** `OLLAMA_HOST=0.0.0.0` sin nada delante deja el servidor abierto: no valida claves.
