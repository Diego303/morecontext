---
titulo: Diseñar subagentes
descripcion: Cómo escribir el brief de un subagente, qué herramientas darle, cuánto presupuesto y cómo exigir un formato de retorno que el orquestador pueda usar.
creado: 2026-09-26
orden: 2
minutos: 50
tipo: practica
objetivos:
  - Redactar briefs autocontenidos con objetivo, contexto, límites, formato de retorno y criterio de parada
  - Asignar a cada subagente el conjunto mínimo de herramientas y un presupuesto de pasos
  - Implementar un subagente que entrega su resultado mediante una herramienta con esquema estricto
requiere: ["[[cursos/sistemas-multiagente/01-arquitecturas]]", "[[roadmap/60-multiagente/03-pasar-contexto-entre-agentes]]"]
relacionados: ["[[docs/agentes/02-subagentes]]", "[[glosario/subagente]]", "[[disciplinas/diseno-de-herramientas]]", "[[docs/prompting/03-salida-estructurada]]"]
tags: [agentes, multiagente, subagentes]
---

Al terminar esta lección sabrás escribir el encargo que recibe un subagente para que haga exactamente su parte, con las herramientas justas, y devuelva algo que el orquestador pueda usar sin interpretarlo. Es la diferencia entre un sistema que reparte trabajo y uno que lo duplica.

## La idea

Un [[glosario/subagente|subagente]] empieza sin nada. No ha visto la conversación con el usuario, ni el plan del orquestador, ni lo que hacen los demás subagentes. Todo lo que sabe está en su brief. Si el brief es «investiga los semiconductores», hará algo razonable, pero no lo que necesitabas.

Anthropic lo cuenta en *[How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)*: en las primeras versiones, el agente líder daba instrucciones cortas y vagas, y los subagentes malinterpretaban la tarea o repetían las mismas búsquedas que otros. La corrección fue enseñar al orquestador a delegar con un objetivo, un formato de salida, orientación sobre herramientas y fuentes, y límites claros de la tarea. El artículo también describe que tuvieron que indicar cuánto esfuerzo dedicar según la complejidad de la pregunta, porque el sistema tendía a lanzar demasiados subagentes para preguntas sencillas.

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

La forma más fiable es una **herramienta de entrega**: el subagente termina llamando a `entregar` con un esquema estricto. Con `strict: True`, los argumentos cumplen el `input_schema`, y tú recibes datos, no texto que haya que analizar ([[docs/prompting/03-salida-estructurada]]). Pide también que el retorno sea **condensado**: hallazgos con su evidencia, no la transcripción de todo lo que leyó. Ese condensado es precisamente la ventaja de usar subagentes.

## Un subagente completo

```python tab="Python" title="subagente.py"
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

ENTREGAR = {
    "name": "entregar",
    "description": "Entrega el resultado final. Llámala una sola vez, al terminar.",
    "strict": True,
    "input_schema": {
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
    },
}

def system_de(b: Brief) -> str:
    return (f"Eres un subagente de investigación.\n<objetivo>{b.objetivo}</objetivo>\n"
            f"<para_que>{b.para_que}</para_que>\n<limites>{b.limites}</limites>\n"
            f"<contexto>{b.contexto}</contexto>\n<parada>{b.parada}</parada>\n"
            "Termina siempre llamando a la herramienta entregar. No incluyas nada fuera de tus límites.")

async def ejecutar_subagente(b: Brief, tools: list[dict], handlers: dict) -> dict:
    messages = [{"role": "user", "content": "Empieza."}]
    for paso in range(b.max_pasos):
        ultimo = paso == b.max_pasos - 1
        resp = await client.messages.create(
            model=MODEL, max_tokens=4096, system=system_de(b), messages=messages,
            tools=tools + [ENTREGAR],
            # en el último paso, obligamos a entregar lo que tenga
            tool_choice={"type": "tool", "name": "entregar"} if ultimo else {"type": "auto"})
        messages.append({"role": "assistant", "content": resp.content})
        usos = [x for x in resp.content if x.type == "tool_use"]
        for u in usos:
            if u.name == "entregar":
                return u.input
        if resp.stop_reason == "pause_turn":
            continue
        if resp.stop_reason != "tool_use":
            messages.append({"role": "user", "content": "Llama a entregar con lo que tengas."})
            continue
        resultados = []
        for u in usos:
            try:
                salida, err = await handlers[u.name](**u.input), False
            except Exception as e:
                salida, err = f"Error: {e}", True
            resultados.append({"type": "tool_result", "tool_use_id": u.id,
                               "content": salida, "is_error": err})
        messages.append({"role": "user", "content": resultados})
    raise RuntimeError("El subagente no entregó.")
```

```ts tab="TypeScript" title="subagente.ts"
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5-5";
const client = new Anthropic();

export interface Brief {
  objetivo: string; paraQue: string; limites: string; contexto: string; parada: string; maxPasos: number;
}
type Handler = (input: any) => Promise<string>;
declare const ENTREGAR: Anthropic.Tool; // mismo esquema estricto que en Python

export async function ejecutarSubagente(b: Brief, tools: Anthropic.Tool[], handlers: Record<string, Handler>) {
  const system = `Eres un subagente de investigación.\n<objetivo>${b.objetivo}</objetivo>\n` +
    `<para_que>${b.paraQue}</para_que>\n<limites>${b.limites}</limites>\n` +
    `<contexto>${b.contexto}</contexto>\n<parada>${b.parada}</parada>\nTermina llamando a entregar.`;
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: "Empieza." }];
  for (let paso = 0; paso < b.maxPasos; paso++) {
    const ultimo = paso === b.maxPasos - 1;
    const resp = await client.messages.create({
      model: MODEL, max_tokens: 4096, system, messages, tools: [...tools, ENTREGAR],
      tool_choice: ultimo ? { type: "tool", name: "entregar" } : { type: "auto" },
    });
    messages.push({ role: "assistant", content: resp.content });
    const usos = resp.content.filter((x): x is Anthropic.ToolUseBlock => x.type === "tool_use");
    const entrega = usos.find((u) => u.name === "entregar");
    if (entrega) return entrega.input;
    if (resp.stop_reason === "pause_turn") continue;
    if (resp.stop_reason !== "tool_use") {
      messages.push({ role: "user", content: "Llama a entregar con lo que tengas." });
      continue;
    }
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
  throw new Error("El subagente no entregó.");
}
```

Tres decisiones del código. El brief va en el prompt de sistema con etiquetas XML, así el subagente lo distingue de los resultados de herramientas. El presupuesto es un número de pasos, y en el último se fuerza la entrega con [[glosario/tool-choice|tool_choice]]: mejor un resultado parcial con `lagunas` que nada. Y cuando el subagente llama a `entregar`, la conversación termina ahí; no hace falta devolverle un `tool_result` porque no habrá más turnos.

> [!aviso] Lo que el subagente no ve
> Si el orquestador le escribe «como hemos hablado» o «la opción anterior», el subagente no sabe a qué se refiere. Revisa tus briefs buscando referencias a cosas que solo existen en el contexto del orquestador.

## Que el orquestador escriba buenos briefs

En un sistema real, los briefs los escribe el orquestador. Dale la plantilla de seis campos en su prompt de sistema y haz que lance subagentes con una herramienta `lanzar_subagente` cuyo `input_schema` tenga exactamente esos campos como obligatorios. Así no puede delegar sin límites ni criterio de parada. Añade reglas de escala: una pregunta factual sencilla, un subagente; una comparación, uno por opción; con un máximo fijo.

## Errores frecuentes

- **Briefs de una línea.** Producen trabajo duplicado y resultados que no encajan.
- **Todas las herramientas para todos.** Más decisiones erróneas, más contexto gastado, más riesgo.
- **Retorno en prosa libre.** El orquestador interpreta mal o pierde detalles al sintetizar.
- **Sin presupuesto.** Un subagente sin límite de pasos sigue buscando mientras encuentre algo.

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
- Presupuesto de pasos y entrega forzada al final.

## Para seguir

- [[cursos/sistemas-multiagente/03-coordinacion-y-estado]]
- [[docs/agentes/02-subagentes]]
- [[roadmap/60-multiagente/04-paralelismo]]
