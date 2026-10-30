---
titulo: Diseñar subagentes
descripcion: Cómo escribir el brief de un subagente, qué herramientas darle, cuánto presupuesto y cómo exigir un formato de retorno que el orquestador pueda usar.
creado: 2026-09-26
actualizado: 2026-10-29
orden: 2
minutos: 50
tipo: practica
objetivos:
  - Redactar briefs autocontenidos con objetivo, contexto, límites, formato de retorno y criterio de parada
  - Asignar a cada subagente el conjunto mínimo de herramientas y un presupuesto de pasos
  - Implementar un subagente que entrega su resultado con un esquema estricto sin forzar herramientas
requiere: ["[[cursos/sistemas-multiagente/01-arquitecturas]]", "[[roadmap/60-multiagente/03-pasar-contexto-entre-agentes]]"]
relacionados: ["[[docs/agentes/02-subagentes]]", "[[glosario/subagente]]", "[[disciplinas/diseno-de-herramientas]]", "[[docs/prompting/03-salida-estructurada]]", "[[recetas/entregar-resultado-sin-forzar-herramienta]]"]
tags: [agentes, multiagente, subagentes]
---

Al terminar esta lección sabrás escribir el encargo que recibe un subagente para que haga exactamente su parte, con las herramientas justas, y devuelva algo que el orquestador pueda usar sin interpretarlo. Es la diferencia entre un sistema que reparte trabajo y uno que lo duplica.

## La idea

Un [[glosario/subagente|subagente]] empieza sin nada. No ha visto la conversación con el usuario, ni el plan del orquestador, ni lo que hacen los demás subagentes. Todo lo que sabe está en su brief. Si el brief es «investiga los semiconductores», hará algo razonable, pero no lo que necesitabas.

Anthropic lo cuenta en *[How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)* (13 jun. 2025): en las primeras versiones, el agente líder daba instrucciones cortas y vagas, y los subagentes malinterpretaban la tarea o repetían las mismas búsquedas que otros. La corrección fue enseñar al orquestador a delegar con un objetivo, un formato de salida, orientación sobre herramientas y fuentes, y límites claros de la tarea. El artículo también describe que tuvieron que indicar cuánto esfuerzo dedicar según la complejidad de la pregunta, porque el sistema tendía a lanzar demasiados subagentes para preguntas sencillas.

## Anatomía de un brief

Un brief autocontenido responde a seis preguntas. Escríbelo como si se lo dieras a un colega competente que no sabe nada del proyecto.

| Campo | Pregunta | Ejemplo |
|---|---|---|
| Objetivo | ¿Qué tengo que averiguar o producir? | «Qué proveedores de bases vectoriales gestionadas ofrecen búsqueda híbrida» |
| Para qué | ¿Para qué se usará? | «Para una comparativa que decide la arquitectura de un RAG» |
| Límites | ¿Qué no es mío? | «Solo servicios gestionados; las opciones autoalojadas las cubre otro agente» |
| Contexto | ¿Qué se sabe ya? | «Ya descartamos X por precio» |
| Formato de retorno | ¿Cómo entrego? | «Una entrada por proveedor con nombre, evidencia y URL» |
| Parada | ¿Cuándo termino? | «Con 5 proveedores verificados o tras 10 búsquedas» |

El campo **para qué** se omite a menudo y es de los que más ayudan: con él, el subagente decide mejor qué detalles importan. Los **límites** evitan la duplicación: si dos subagentes podrían cubrir lo mismo, dilo explícitamente en ambos briefs.

## Herramientas mínimas

Cada herramienta que das a un subagente es una decisión que puede tomar mal y contexto que ocupa su definición. Dale solo lo que su tarea necesita:

- Un subagente de búsqueda necesita buscar y leer. No necesita escribir archivos.
- Un subagente que analiza datos ya recuperados quizá no necesita ninguna herramienta.
- Ninguno necesita lanzar otros subagentes, salvo que lo hayas diseñado así a propósito. La recursión sin límite es una forma rápida de agotar el presupuesto.

Esto también es [[glosario/minimo-privilegio|mínimo privilegio]]: un subagente que lee páginas web puede encontrar instrucciones inyectadas, y cuantas menos herramientas tenga, menos daño puede hacer ([[docs/seguridad/01-prompt-injection]]).

## Formato de retorno

El orquestador tiene que leer lo que vuelve, a veces de diez subagentes. Si cada uno devuelve prosa libre con su propio formato, el orquestador gasta contexto en interpretar y puede perder detalles. Exige una estructura.

La forma más fiable es una **herramienta de entrega**: el subagente termina llamando a `entregar` con un esquema estricto. Con `strict: True`, los argumentos cumplen el `input_schema`, y tú recibes datos, no texto que haya que analizar ([[docs/prompting/03-salida-estructurada]]). Para los casos en que no la llama (se acaba el presupuesto o termina con texto), una última llamada con `output_config.format` y **el mismo esquema** garantiza la misma forma por la otra vía. Pide también que el retorno sea **condensado**: hallazgos con su evidencia, no la transcripción de todo lo que leyó. Ese condensado es precisamente la ventaja de usar subagentes.

## Un subagente completo

```python tab="Python" title="subagente.py"
import json
from dataclasses import dataclass
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.AsyncAnthropic()

@dataclass
class Brief:
    objetivo: str
    para_que: str
    limites: str
    contexto: str
    parada: str
    max_pasos: int = 12

ESQUEMA_ENTREGA = {
    "type": "object",
    "properties": {
        "hallazgos": {"type": "array", "items": {
            "type": "object",
            "properties": {"afirmacion": {"type": "string"},
                           "evidencia": {"type": "string"},
                           "fuente": {"type": "string"}},
            "required": ["afirmacion", "evidencia", "fuente"],
            "additionalProperties": False}},
        "lagunas": {"type": "string", "description": "Qué no pudiste verificar"},
    },
    "required": ["hallazgos", "lagunas"],
    "additionalProperties": False,
}

ENTREGAR = {
    "name": "entregar",
    "description": "Entrega el resultado final. Llámala una sola vez, al terminar.",
    "strict": True,
    "input_schema": ESQUEMA_ENTREGA,  # el mismo esquema que la entrega final
}

class SubagenteRechazado(Exception):
    pass

def system_de(b: Brief) -> str:
    return (f"Eres un subagente de investigación.\n<objetivo>{b.objetivo}</objetivo>\n"
            f"<para_que>{b.para_que}</para_que>\n<limites>{b.limites}</limites>\n"
            f"<contexto>{b.contexto}</contexto>\n<parada>{b.parada}</parada>\n"
            "Termina siempre llamando a la herramienta entregar. No incluyas nada fuera de tus límites.")

async def entrega_final(b: Brief, tools: list[dict], messages: list) -> dict:
    """Último paso sin forzar herramienta: tool_choice none + output_config.format."""
    if messages[-1]["role"] == "assistant":      # el mensaje de sistema va tras un turno user
        messages.append({"role": "user", "content": "Entrega el resultado."})
    messages.append({"role": "system",
                     "content": "Último paso: responde solo con la entrega en el formato pedido. "
                                "Lo que no hayas podido verificar va en lagunas."})
    resp = await client.messages.create(
        model=MODEL, max_tokens=4096, system=system_de(b), messages=messages,
        tools=tools + [ENTREGAR],        # mismas herramientas: no rompe la caché de tools y system
        tool_choice={"type": "none"},    # en esta llamada no puede usar ninguna
        output_config={"format": {"type": "json_schema", "schema": ESQUEMA_ENTREGA}})
    if resp.stop_reason == "refusal":
        raise SubagenteRechazado(resp.stop_details.category if resp.stop_details else None)
    if resp.stop_reason != "end_turn":   # max_tokens: el JSON puede venir cortado
        raise RuntimeError(f"Entrega final incompleta: {resp.stop_reason}")
    return json.loads(next(x.text for x in resp.content if x.type == "text"))

async def ejecutar_subagente(b: Brief, tools: list[dict], handlers: dict) -> dict:
    messages = [{"role": "user", "content": "Empieza."}]
    for _ in range(b.max_pasos):
        resp = await client.messages.create(
            model=MODEL, max_tokens=4096, system=system_de(b), messages=messages,
            tools=tools + [ENTREGAR])    # tool_choice auto, el valor por defecto
        messages.append({"role": "assistant", "content": resp.content})
        usos = [x for x in resp.content if x.type == "tool_use"]
        entrega = next((u for u in usos if u.name == "entregar"), None)
        if entrega:
            return entrega.input         # strict: cumple ESQUEMA_ENTREGA
        if resp.stop_reason == "refusal":
            raise SubagenteRechazado(resp.stop_details.category if resp.stop_details else None)
        if resp.stop_reason == "pause_turn":
            continue
        if resp.stop_reason != "tool_use":
            break                        # terminó con texto sin entregar: pasa a la entrega final
        resultados = []
        for u in usos:
            try:
                salida, err = await handlers[u.name](**u.input), False
            except Exception as e:
                salida, err = f"Error: {e}", True
            resultados.append({"type": "tool_result", "tool_use_id": u.id,
                               "content": salida, "is_error": err})
        messages.append({"role": "user", "content": resultados})
    return await entrega_final(b, tools, messages)  # presupuesto agotado o fin sin entregar
```

```ts tab="TypeScript" title="subagente.ts"
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5-5";
const client = new Anthropic();

export interface Brief {
  objetivo: string; paraQue: string; limites: string; contexto: string; parada: string; maxPasos: number;
}
type Handler = (input: any) => Promise<string>;
declare const ESQUEMA_ENTREGA: { [k: string]: unknown }; // mismo esquema que en Python
const ENTREGAR: Anthropic.Tool = {
  name: "entregar", description: "Entrega el resultado final. Llámala una sola vez, al terminar.",
  strict: true, input_schema: ESQUEMA_ENTREGA as Anthropic.Tool.InputSchema,
};

async function entregaFinal(system: string, tools: Anthropic.Tool[], messages: Anthropic.MessageParam[]) {
  if (messages[messages.length - 1].role === "assistant") messages.push({ role: "user", content: "Entrega el resultado." });
  messages.push({ role: "system", content: "Último paso: responde solo con la entrega en el formato pedido. " +
    "Lo que no hayas podido verificar va en lagunas." });
  const resp = await client.messages.create({
    model: MODEL, max_tokens: 4096, system, messages, tools: [...tools, ENTREGAR],
    tool_choice: { type: "none" },
    output_config: { format: { type: "json_schema", schema: ESQUEMA_ENTREGA } },
  });
  if (resp.stop_reason !== "end_turn") throw new Error(`Entrega final incompleta: ${resp.stop_reason}`);
  const bloque = resp.content.find((x): x is Anthropic.TextBlock => x.type === "text");
  return JSON.parse(bloque?.text ?? "{}");
}

export async function ejecutarSubagente(b: Brief, tools: Anthropic.Tool[], handlers: Record<string, Handler>) {
  const system = `Eres un subagente de investigación.\n<objetivo>${b.objetivo}</objetivo>\n` +
    `<para_que>${b.paraQue}</para_que>\n<limites>${b.limites}</limites>\n` +
    `<contexto>${b.contexto}</contexto>\n<parada>${b.parada}</parada>\nTermina llamando a entregar.`;
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: "Empieza." }];
  for (let paso = 0; paso < b.maxPasos; paso++) {
    const resp = await client.messages.create({
      model: MODEL, max_tokens: 4096, system, messages, tools: [...tools, ENTREGAR],
    });
    messages.push({ role: "assistant", content: resp.content });
    const usos = resp.content.filter((x): x is Anthropic.ToolUseBlock => x.type === "tool_use");
    const entrega = usos.find((u) => u.name === "entregar");
    if (entrega) return entrega.input;
    if (resp.stop_reason === "refusal") throw new Error("El subagente rechazó la tarea.");
    if (resp.stop_reason === "pause_turn") continue;
    if (resp.stop_reason !== "tool_use") break;
    const resultados: Anthropic.ToolResultBlockParam[] = [];
    for (const u of usos) {
      try {
        resultados.push({ type: "tool_result", tool_use_id: u.id, content: await handlers[u.name](u.input) });
      } catch (e) {
        resultados.push({ type: "tool_result", tool_use_id: u.id, content: `Error: ${e}`, is_error: true });
      }
    }
    messages.push({ role: "user", content: resultados });
  }
  return entregaFinal(system, tools, messages);
}
```

Tres decisiones del código. El brief va en el prompt de sistema con etiquetas XML, así el subagente lo distingue de los resultados de herramientas. Cuando el subagente llama a `entregar`, la conversación termina ahí; no hace falta devolverle un `tool_result` porque no habrá más turnos. Y el presupuesto es un número de pasos: si se agota, o si el subagente termina con texto sin entregar, `entrega_final` hace una última llamada que no puede usar herramientas (`tool_choice: none`) y responde con JSON que cumple el mismo esquema (`output_config.format`). Mejor un resultado parcial con `lagunas` que nada.

> [!aviso] No fuerces la herramienta de entrega
> Es tentador forzar `entregar` en el último paso con `tool_choice={"type": "tool", "name": "entregar"}`, y así lo hacían muchos ejemplos antiguos. Con Opus 5.5, Sonnet 5.5 y Fable 5.1, cualquier [[glosario/tool-choice|tool_choice]] que fuerce (`any` o `tool`) devuelve un 400. Separa la forma (el esquema, garantizado por `strict` o por `output_config.format`) del momento (lo decide tu bucle). Variantes, como un [[glosario/mensaje-de-sistema-intermedio|mensaje de sistema]] de un solo turno, en [[recetas/entregar-resultado-sin-forzar-herramienta]].

> [!aviso] Lo que el subagente no ve
> Si el orquestador le escribe «como hemos hablado» o «la opción anterior», el subagente no sabe a qué se refiere. Revisa tus briefs buscando referencias a cosas que solo existen en el contexto del orquestador.

## Que el orquestador escriba buenos briefs

En un sistema real, los briefs los escribe el orquestador. Dale la plantilla de seis campos en su prompt de sistema y haz que lance subagentes con una herramienta `lanzar_subagente` cuyo `input_schema` tenga exactamente esos campos como obligatorios. Así no puede delegar sin límites ni criterio de parada. Añade reglas de escala: una pregunta factual sencilla, un subagente; una comparación, uno por opción; con un máximo fijo.

## Con LangGraph

En LangGraph, un subagente es un subgrafo: `create_agent` devuelve un grafo compilado con su propio bucle de herramientas, y tú lo envuelves en una función o lo añades como nodo de un grafo mayor. Las mismas decisiones se traducen así: el brief es el `system_prompt`, el presupuesto es `ModelCallLimitMiddleware` y la entrega es una salida estructurada al final, sin forzar herramientas.

```python tab="LangGraph" title="subagente_langgraph.py"
from langchain.agents import create_agent
from langchain.agents.middleware import ModelCallLimitMiddleware, ToolErrorMiddleware
from langchain.chat_models import init_chat_model
from pydantic import BaseModel, Field

MODEL = "anthropic:claude-sonnet-5-5"


class Hallazgo(BaseModel):
    afirmacion: str
    evidencia: str
    fuente: str


class Entrega(BaseModel):
    hallazgos: list[Hallazgo]
    lagunas: str = Field(description="Qué no pudiste verificar")


def crear_subagente(system_prompt: str, tools: list, max_pasos: int = 12, modelo=None):
    llm = modelo or init_chat_model(MODEL, max_tokens=4096)
    agente = create_agent(llm, tools, system_prompt=system_prompt, middleware=[
        ModelCallLimitMiddleware(run_limit=max_pasos, exit_behavior="end"),  # presupuesto: termina, no lanza
        ToolErrorMiddleware(on_error=lambda exc, req: f"Error: {exc}"),      # el equivalente a is_error
    ])
    entregador = llm.with_structured_output(Entrega, method="json_schema")  # salidas estructuradas

    def ejecutar(tarea: str = "Empieza.") -> Entrega:
        estado = agente.invoke({"messages": [("user", tarea)]})
        return entregador.invoke([("system", system_prompt), *estado["messages"],
                                  ("user", "Entrega el resultado en el formato pedido. "
                                           "Lo no verificado va en lagunas.")])
    return ejecutar
```

Lo que esconde el framework es el bucle: `create_agent` ejecuta herramientas, devuelve sus errores al modelo y para al llegar al límite. Lo que no esconde es el diseño: el brief, la lista mínima de herramientas y el esquema siguen siendo tuyos. Aquí la entrega final siempre hace una llamada más; si quieres ahorrártela, dale al agente `response_format=Entrega` y LangChain usará las salidas estructuradas del proveedor. El orquestador que reparte estos subagentes en paralelo con `Send` está en [[cursos/sistemas-multiagente/03-coordinacion-y-estado]], y los subagentes de [[herramientas/deepagents|Deep Agents]] en [[docs/frameworks/10-deep-agents]].

## Errores frecuentes

- **Briefs de una línea.** Producen trabajo duplicado y resultados que no encajan.
- **Todas las herramientas para todos.** Más decisiones erróneas, más contexto gastado, más riesgo.
- **Retorno en prosa libre.** El orquestador interpreta mal o pierde detalles al sintetizar.
- **Sin presupuesto.** Un subagente sin límite de pasos sigue buscando mientras encuentre algo.
- **Forzar la entrega con `tool_choice`.** Da 400 en los modelos 5.5. Usa la entrega final con `output_config.format`.

## Ejercicio

> [!ejercicio] Dos subagentes sin solaparse
> Escribe dos briefs para investigar «opciones para servir un modelo de embeddings» repartidos entre servicios gestionados y opciones autoalojadas. Ejecútalos en paralelo con `asyncio.gather` usando una herramienta de búsqueda de tu elección (o una simulada que lea de una carpeta de documentos).
> Está bien si: ningún hallazgo aparece en las dos entregas, ambas entregas cumplen el esquema, cada una termina en el presupuesto de pasos y `lagunas` está rellenado cuando falta información.

> [!ejercicio]- Pistas
> Pon en cada brief, en `limites`, lo que cubre el otro. Si se solapan, revisa primero el campo `objetivo`: suele ser demasiado amplio.

## Resumen

- El subagente solo sabe lo que dice su brief: objetivo, para qué, límites, contexto, formato y parada.
- Los límites explícitos evitan el trabajo duplicado.
- Herramientas mínimas: menos errores, menos contexto y menos superficie de ataque.
- Entrega con una herramienta de esquema estricto y contenido condensado.
- Presupuesto de pasos y, si no entrega, una última llamada sin herramientas con el mismo esquema en `output_config.format`.

## Para seguir

- [[cursos/sistemas-multiagente/03-coordinacion-y-estado]]
- [[docs/agentes/02-subagentes]]
- [[roadmap/60-multiagente/04-paralelismo]]
- [[plantillas/subagente]]
