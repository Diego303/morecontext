---
titulo: El contexto como presupuesto
descripcion: Por qué el contexto de un modelo es un recurso finito que cuesta dinero, latencia y atención, y cómo medir cuánto ocupa cada componente de tu agente.
creado: 2026-10-05
actualizado: 2026-10-29
orden: 1
minutos: 40
tipo: practica
objetivos:
  - Explicar los tres costes del contexto (dinero, latencia y atención), el context rot y el efecto de la posición descrito en Lost in the Middle
  - Medir con count_tokens y usage cuántos tokens ocupa cada componente de una petición
  - Identificar qué componente crece más en un bucle agéntico y fijar un presupuesto por componente
requiere: ["[[roadmap/00-fundamentos/03-ventana-de-contexto]]", "[[roadmap/40-primer-agente/02-el-bucle-agentico]]"]
relacionados: ["[[docs/contexto/01-ventana-de-contexto]]", "[[glosario/contexto-largo]]", "[[modelos/07-documentos-largos]]", "[[blog/2026-09-28-el-contexto-es-un-presupuesto]]", "[[biblioteca/context-rot]]"]
tags: [contexto, tokens, costes]
---

Al terminar esta lección sabrás por qué llenar la ventana de contexto «por si acaso» empeora a tu agente, y tendrás un script que desglosa cuántos tokens ocupa cada parte de una petición. Es el primer paso de todo lo demás: no puedes gestionar lo que no mides.

## La idea

La [[glosario/ventana-de-contexto|ventana de contexto]] es todo lo que el modelo ve en una llamada: prompt de sistema, definiciones de herramientas, historial de mensajes, resultados de herramientas y la propia respuesta que genera. Tiene un tamaño máximo (hoy, un millón de tokens en los modelos de Claude, con hasta 128k de salida), pero el límite real llega mucho antes de ese máximo.

Piensa en el contexto como un **presupuesto con tres monedas**:

- **Dinero.** Pagas cada token de entrada en cada llamada. En un bucle agéntico, el historial se reenvía entero en cada paso, así que un resultado de herramienta de 5.000 tokens en el paso 3 lo pagas también en los pasos 4, 5, 6 y siguientes. El [[glosario/prompt-caching|prompt caching]] abarata el prefijo repetido, pero no lo elimina ([[docs/contexto/02-prompt-caching]]).
- **Latencia.** Más tokens de entrada significa más tiempo hasta el primer token de salida ([[glosario/latencia|latencia]]).
- **Atención.** Es la moneda menos visible. Cuanto más contexto, más le cuesta al modelo usar bien cada parte.

## La atención también se gasta

El fenómeno tiene nombre: [[glosario/context-rot|context rot]]. La medición de referencia es de Chroma: Kelly Hong, Anton Troynikov y Jeff Huber publicaron el 14 de julio de 2025 *[Context Rot: How Increasing Input Tokens Impacts LLM Performance](https://www.trychroma.com/research/context-rot)* ([[biblioteca/context-rot]]). Probaron 18 modelos (entre ellos GPT-4.1, Claude 4, Gemini 2.5 y Qwen3) y encontraron que el rendimiento baja al crecer la entrada **incluso en tareas sencillas**. Baja más rápido cuando la pregunta y el dato que responde se parecen poco, y un solo texto distractor ya empeora el resultado. En una prueba de memoria conversacional, un prompt con solo lo relevante rindió muy por encima del historial completo de unos 113k tokens.

*[Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)* (Anthropic, 29 sept. 2025) recoge ese resultado y lo explica desde la arquitectura [[glosario/transformer|transformer]]: cada token se relaciona con todos los demás, y con muchos tokens la atención se reparte entre muchas más relaciones. Por eso habla del contexto como un recurso finito con rendimientos decrecientes y de un «presupuesto de atención» que cada token nuevo consume.

A esto se suma el efecto de la posición. Liu et al. (2023), en *[Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172)* ([[biblioteca/lost-in-the-middle]]), midieron cómo cambiaba el rendimiento al mover la información relevante dentro de un contexto largo. El resultado: los modelos aprovechaban mejor la información situada al principio o al final, y el rendimiento bajaba de forma notable cuando estaba en medio. Los modelos han mejorado desde entonces, pero la lección práctica sigue vigente: **no basta con que la información esté en el contexto; importa cuánta hay alrededor y dónde está**.

> [!nota] Ventana grande no es permiso
> Una ventana de cientos de miles de tokens te permite meter mucho. No te garantiza que el modelo lo use bien. Lo tienes desarrollado en [[radar/2026-09-22-contexto-largo-no-sustituye-recuperacion]].

## Qué ocupa el contexto de un agente

| Componente | Cuándo se fija | Cómo crece | Palanca principal |
|---|---|---|---|
| Prompt de sistema | Al diseñar | Fijo | Redacción concisa; caché |
| Herramientas | Al diseñar | Fijo, uno por herramienta | Menos herramientas, descripciones precisas |
| Archivos de memoria o documentos precargados | Al empezar | Fijo | Precargar solo lo que casi siempre hace falta |
| Mensajes del usuario y del asistente | Cada turno | Lineal | Compactación |
| Resultados de herramientas | Cada paso | Rápido y a saltos | Recortar, paginar, limpiar los antiguos |
| Respuesta del modelo | Cada paso | Limitada por `max_tokens` | Pedir formatos breves |

En casi todos los agentes que midas, los resultados de herramientas acaban siendo la mayor parte del contexto. Una lectura de archivo, una búsqueda web o una consulta SQL sin límite pueden ocupar más que todo lo demás junto.

## Medir

Hay dos fuentes de datos. `client.messages.count_tokens` cuenta la entrada antes de enviarla, con el mismo formato que `messages.create`. `resp.usage` te dice lo que se consumió de verdad, incluida la caché. El script siguiente desglosa una petición midiendo de forma incremental: cada componente es la diferencia entre contar con él y sin él.

```python tab="Python" title="presupuesto.py"
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()
MINIMO = [{"role": "user", "content": "."}]

def contar(**kwargs) -> int:
    return client.messages.count_tokens(model=MODEL, **kwargs).input_tokens

def desglose(system: str, tools: list[dict], messages: list[dict]) -> dict[str, int]:
    base = contar(messages=MINIMO)
    con_system = contar(system=system, messages=MINIMO)
    con_tools = contar(system=system, tools=tools, messages=MINIMO)
    total = contar(system=system, tools=tools, messages=messages)
    sin_resultados = contar(system=system, tools=tools, messages=quitar_resultados(messages))
    return {
        "system": con_system - base,
        "tools": con_tools - con_system,
        "historial (sin resultados)": sin_resultados - con_tools,
        "resultados de herramientas": total - sin_resultados,
        "total": total,
    }

def quitar_resultados(messages: list[dict]) -> list[dict]:
    """Sustituye el contenido de cada tool_result por un marcador mínimo."""
    limpio = []
    for m in messages:
        if m["role"] == "user" and isinstance(m["content"], list):
            m = {**m, "content": [{**b, "content": "-"} if b.get("type") == "tool_result" else b
                                  for b in m["content"]]}
        limpio.append(m)
    return limpio

if __name__ == "__main__":
    import json, sys
    datos = json.load(open(sys.argv[1]))  # {"system": ..., "tools": [...], "messages": [...]}
    for k, v in desglose(datos["system"], datos["tools"], datos["messages"]).items():
        print(f"{k:<30}{v:>8}")
```

```ts tab="TypeScript" title="presupuesto.ts"
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5-5";
const client = new Anthropic();
const MINIMO: Anthropic.MessageParam[] = [{ role: "user", content: "." }];

async function contar(p: Omit<Anthropic.MessageCountTokensParams, "model">): Promise<number> {
  return (await client.messages.countTokens({ model: MODEL, ...p })).input_tokens;
}

export async function desglose(system: string, tools: Anthropic.Tool[], messages: Anthropic.MessageParam[]) {
  const base = await contar({ messages: MINIMO });
  const conSystem = await contar({ system, messages: MINIMO });
  const conTools = await contar({ system, tools, messages: MINIMO });
  const total = await contar({ system, tools, messages });
  return { system: conSystem - base, tools: conTools - conSystem, mensajes: total - conTools, total };
}
```

```text
# salida de ejemplo
system                             412
tools                             1830
historial (sin resultados)        2210
resultados de herramientas       38950
total                            43402
```

Guarda el historial de una ejecución real de tu agente en JSON y pásalo por el script. La salida de ejemplo es típica: los resultados de herramientas dominan. Las restas son aproximadas (la plantilla interna añade algunos tokens), pero bastan para saber dónde está el gasto.

En producción, registra `resp.usage` en cada paso. La serie `input_tokens` por paso de una ejecución te dice cómo crece el contexto; si sube en escalones grandes, busca qué herramienta los produce. Ten en cuenta que, con [[glosario/prompt-caching|caché]], `input_tokens` cuenta solo lo que no se leyó de caché: el tamaño real del contexto es `input_tokens + cache_read_input_tokens + cache_creation_input_tokens`.

## Fijar un presupuesto

Con el desglose delante, pon límites explícitos por componente. Un punto de partida razonable para un agente es:

- prompt de sistema y herramientas: fijos, revisados en cada cambio, y cacheados;
- cada resultado de herramienta: un máximo de tokens o caracteres, con paginación si hace falta más;
- el historial completo: un umbral (por ejemplo, una fracción de la ventana de tu modelo) a partir del cual compactas.

Los números concretos dependen del modelo, de la tarea y de tus medidas. Lo importante es que existan y que los compruebes con datos. Las técnicas para cumplirlos son el resto del curso.

Si no fijas ninguno, el límite te lo pone la API. Cuando la entrada más `max_tokens` supera la ventana, la petición se acepta y el modelo genera hasta llenarla; entonces para con `stop_reason: "model_context_window_exceeded"`. Trátalo en el bucle como una señal de que toca compactar o empezar una sesión nueva, no como un error de red que se reintenta igual ([[docs/fundamentos/06-motivos-de-parada-y-rechazos]]).

## Errores frecuentes

- **Medir solo la primera llamada.** El problema aparece en el paso 30, no en el 1.
- **Confiar en que la ventana es grande.** Que quepa no significa que funcione igual de bien.
- **Mirar solo el coste.** Un agente barato que se olvida de la instrucción del paso 1 sale caro.
- **Ignorar las definiciones de herramientas.** Veinte herramientas con descripciones largas pueden ocupar más que tu prompt de sistema en cada llamada.

## Ejercicio

> [!ejercicio] El desglose de tu agente
> Ejecuta un agente tuyo en una tarea de al menos 10 pasos, guarda `system`, `tools` y `messages` en un JSON y pásalo por `presupuesto.py`. Registra también `resp.usage.input_tokens` en cada paso.
> Está bien si: tienes una tabla con los tokens por componente, una lista de `input_tokens` por paso, y puedes señalar la herramienta concreta que más contexto añade junto con una propuesta de límite para ella.

> [!ejercicio]- Pistas
> El historial contiene objetos del SDK en los mensajes del asistente. Conviértelos antes de guardarlos con `[b.model_dump() for b in resp.content]`. Para encontrar la herramienta más cara, agrupa los `tool_result` por el nombre del `tool_use` correspondiente y mide su longitud.

## Resumen

- El contexto cuesta dinero, latencia y atención; la atención es la moneda que más se olvida.
- Más tokens reducen la precisión incluso en tareas simples (*context rot*, medido por Chroma) y la posición importa (*Lost in the Middle*).
- En un agente, los resultados de herramientas suelen ser el componente más grande.
- Mide con `count_tokens` antes y con `usage` después, paso a paso.
- Fija presupuestos por componente y compruébalos con datos.

## Para seguir

- [[cursos/context-engineering/02-que-meter-y-que-no]]
- [[roadmap/00-fundamentos/05-coste-y-latencia]]
- [[modelos/07-documentos-largos]]
- [[problemas/contexto-saturado-en-sesiones-largas]]
