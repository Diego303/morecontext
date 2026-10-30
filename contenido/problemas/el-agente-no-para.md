---
titulo: El agente no para nunca
descripcion: Por qué un agente encadena llamadas sin dar una respuesta final y cómo ponerle límite de pasos, presupuesto y condiciones de parada, a mano y en LangGraph.
creado: 2026-10-29
sintoma: El agente no para nunca
tema: agentes
nivel: intermedio
tags: [agentes, bucle-agentico, presupuesto, langgraph]
relacionados: ["[[roadmap/40-primer-agente/03-condiciones-de-parada]]", "[[problemas/el-agente-repite-la-misma-herramienta]]", "[[glosario/presupuesto-de-tarea]]", "[[docs/agentes/01-el-bucle-agentico]]"]
---

Lanzas el agente, la consola no deja de mostrar llamadas a herramientas y la respuesta final no llega. Al rato lo cortas a mano o se acaba solo con una factura que no esperabas. No hay error: cada respuesta trae `stop_reason: "tool_use"` y tu bucle obedece. En LangGraph, si fijaste un tope, lo que ves es esto (salida real con `langgraph` 1.2.18):

```text
langgraph.errors.GraphRecursionError: Recursion limit of 10 reached without hitting a stop condition. You can increase the limit by setting the `recursion_limit` config key.
For troubleshooting, visit: https://docs.langchain.com/oss/python/langgraph/errors/GRAPH_RECURSION_LIMIT
```

## Causas

- **No hay límite de pasos.** El [[glosario/bucle-agentico|bucle agéntico]] es un `while True` que solo termina cuando el modelo deja de pedir herramientas. En LangGraph el `recursion_limit` por defecto es 10007 superpasos: en la práctica, sin tope.
- **Una herramienta que siempre dice «reintenta».** «Sin resultados, inténtalo de nuevo» invita a probar otra variante, y otra. El modelo hace lo que le pides.
- **Un objetivo sin criterio de terminado.** «Mejora el código» o «investiga el tema» no tienen final. El modelo no sabe cuándo ha acabado y sigue buscando.
- **Errores que no se ven como errores.** Si la herramienta devuelve un texto vacío o un traceback sin `is_error`, el modelo interpreta que debe insistir ([[problemas/el-agente-repite-la-misma-herramienta]]).

## Cómo confirmarlo

Registra en cada vuelta el número de paso, el nombre de la herramienta, sus argumentos y los tokens acumulados ([[roadmap/40-primer-agente/06-depurar-con-trazas]]). Si los argumentos se repiten, es un bucle de repetición. Si cambian sin converger y los resultados dicen «nada» o «reintenta», es la herramienta o el objetivo. Lee también el último texto del modelo antes de cada llamada: suele decir qué cree que le falta.

## Arreglo

Pon tres topes duros en tu bucle: pasos, tokens y repeticiones. Cuando salta uno, el agente para con un motivo legible, no con un cuelgue:

```python title="agente_con_limites.py"
import json

import anthropic

MODEL = "claude-sonnet-5-5"
MAX_PASOS = 15                 # tope duro de vueltas del bucle
MAX_TOKENS_TAREA = 200_000     # presupuesto de tokens (entrada + salida) de toda la tarea
MAX_REPETICIONES = 3           # misma herramienta con los mismos argumentos

client = anthropic.Anthropic()


class Parada(Exception):
    pass


def agente(tarea: str, tools: list[dict], ejecutar) -> str:
    messages = [{"role": "user", "content": tarea}]
    gastado, vistas = 0, {}
    for paso in range(1, MAX_PASOS + 1):
        resp = client.messages.create(model=MODEL, max_tokens=4096, tools=tools, messages=messages)
        gastado += resp.usage.input_tokens + resp.usage.output_tokens
        messages.append({"role": "assistant", "content": resp.content})
        if resp.stop_reason != "tool_use":
            return "".join(b.text for b in resp.content if b.type == "text")
        if gastado > MAX_TOKENS_TAREA:
            raise Parada(f"presupuesto agotado en el paso {paso}: {gastado} tokens")
        resultados = []
        for b in resp.content:
            if b.type != "tool_use":
                continue
            firma = (b.name, json.dumps(b.input, sort_keys=True))
            vistas[firma] = vistas.get(firma, 0) + 1
            if vistas[firma] > MAX_REPETICIONES:
                raise Parada(f"{b.name} llamada {vistas[firma]} veces con {b.input}")
            resultados.append({"type": "tool_result", "tool_use_id": b.id, **ejecutar(b.name, b.input)})
        messages.append({"role": "user", "content": resultados})
    raise Parada(f"sin respuesta final tras {MAX_PASOS} pasos")
```

`ejecutar(nombre, entrada)` devuelve `{"content": …, "is_error": …}`. Con el simulador de la API, un modelo que pide `buscar` sin parar acaba así: primero con argumentos distintos en cada vuelta, después siempre con los mismos.

```text
Parada: sin respuesta final tras 15 pasos | llamadas: 15
Parada: buscar llamada 4 veces con {'q': 'factura 2025'} | llamadas: 3
```

`max_tokens` limita cada respuesta, no la tarea; el `task_budget` de la API es orientativo ([[glosario/presupuesto-de-tarea]]). El tope de la tarea lo pones tú. Con LangChain, el equivalente es un middleware; con LangGraph, el `recursion_limit` explícito:

```python tab="LangChain" nocheck
from langchain.agents import create_agent
from langchain.agents.middleware import ModelCallLimitMiddleware

agente = create_agent("anthropic:claude-sonnet-5-5", tools,
                      middleware=[ModelCallLimitMiddleware(run_limit=15, exit_behavior="end")])
# al llegar al tope, el último mensaje es «Model call limits exceeded: run limit (15/15)»
```

```python tab="LangGraph" nocheck
from langgraph.errors import GraphRecursionError

try:
    grafo.invoke(entrada, {"recursion_limit": 25})   # cuenta superpasos, no llamadas al modelo
except GraphRecursionError:
    ...  # informa al usuario y guarda la traza
```

Probé los dos con un modelo falso que siempre pide herramienta: el middleware cierra con ese mensaje y el grafo lanza `GraphRecursionError`.

## Cómo evitarlo

- Define qué es «terminado» en la tarea: un entregable, una condición comprobable o un número de fuentes ([[roadmap/40-primer-agente/03-condiciones-de-parada]]).
- Haz que las herramientas digan cuándo no hay nada que hacer: «No hay facturas de 2025; no repitas la búsqueda con otras palabras».
- Fija los tres topes desde el primer día y registra cuál salta. Si salta mucho, el problema está en el diseño, no en el número.
- Para tareas largas de verdad, un harness con estado en disco y presupuesto por tarea ([[roadmap/90-harness/04-estado-coste-y-contexto]]).

## Ver también

- [[roadmap/40-primer-agente/02-el-bucle-agentico]]
- [[docs/agentes/01-el-bucle-agentico]]
- [[cursos/langchain-y-langgraph/04-middleware]]
- [[cursos/harness-engineering/10-coste-y-presupuesto]]
