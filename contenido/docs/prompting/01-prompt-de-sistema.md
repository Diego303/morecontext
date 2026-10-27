---
titulo: Prompt de sistema
descripcion: Qué es el parámetro system, qué conviene poner en él, cómo estructurarlo por secciones y cómo cachearlo cuando es largo.
creado: 2026-07-22
orden: 1
nivel: inicial
tags: [prompting, system]
aliases: [System prompt]
relacionados: ["[[glosario/prompt-de-sistema]]", "[[roadmap/10-prompting/04-prompt-de-sistema]]", "[[modelos/02-ingenieria-de-contexto]]", "[[docs/contexto/02-prompt-caching]]"]
---

El [[glosario/prompt-de-sistema|prompt de sistema]] es el texto que pasas en el parámetro `system` de la petición, separado de la conversación. Contiene **lo que no cambia de un turno a otro**: el papel del modelo, las reglas, el formato de salida y el contexto estable. El modelo lo trata como marco de toda la conversación y le da más peso que a una instrucción equivalente dentro de un mensaje `user`.

La lección [[roadmap/10-prompting/04-prompt-de-sistema]] lo enseña paso a paso. Aquí tienes la referencia.

## Qué va en `system` y qué no

| Va en `system` | Va en `messages` |
|---|---|
| Rol y destinatario («asistente de soporte para clientes de una tienda online») | La pregunta o tarea concreta de este turno |
| Reglas fijas y límites («no prometas plazos de entrega») | Datos que cambian en cada petición |
| Formato de salida y tono | Documentos subidos por la persona |
| Contexto estable: políticas, glosario del dominio, descripción del producto | Resultados de herramientas (`tool_result`) |
| Cuándo usar cada herramienta | Ejemplos específicos de un caso (salvo que sean fijos) |

La regla práctica: si el texto sería el mismo para todas las conversaciones de tu aplicación, va en `system`. Así además se puede cachear (ver más abajo).

## Forma del parámetro

`system` acepta una cadena o una lista de bloques de texto. La lista sirve para marcar puntos de caché o para separar secciones que montas desde distintas fuentes.

| Forma | Ejemplo | Cuándo |
|---|---|---|
| Cadena | `system="Eres…"` | Prompts cortos o que no cacheas. |
| Lista de bloques | `system=[{"type": "text", "text": "…"}]` | Prompts largos, caché, varias partes. |
| Bloque con caché | `{"type": "text", "text": "…", "cache_control": {"type": "ephemeral"}}` | Prompt estable que se repite en muchas llamadas. |

## Estructura recomendada

Un prompt de sistema largo se lee mejor (para ti y para el modelo) con secciones delimitadas. Las etiquetas XML funcionan bien porque el modelo las distingue con claridad del contenido.

```text title="sistema.txt"
Eres el asistente de soporte de Libroteca, una tienda online de libros.
Atiendes a clientes en español por chat.

<objetivo>
Resolver dudas sobre pedidos, envíos y devoluciones. Si no puedes resolverlo,
crea un ticket para el equipo humano.
</objetivo>

<reglas>
- Usa solo la información de <politicas> y de las herramientas. Si no está ahí, dilo.
- No prometas plazos que no aparezcan en el pedido.
- Las devoluciones de más de 50 € requieren aprobación humana: crea un ticket.
</reglas>

<formato>
Respuestas de 1 a 4 frases. Sin listas salvo que pidan pasos.
</formato>

<politicas>
...texto de las políticas de envío y devolución...
</politicas>
```

Explica el **porqué** de las reglas que no son obvias. «No uses listas, porque el chat las muestra mal en el móvil» funciona mejor que «NUNCA uses listas». El modelo generaliza a partir del motivo. Más principios en [[modelos/01-principios-de-prompting]].

## Ejemplo completo

```python tab="Python" title="soporte.py"
import pathlib
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

SISTEMA = pathlib.Path("sistema.txt").read_text(encoding="utf-8")

def responder(historial: list[dict]) -> str:
    resp = client.messages.create(
        model=MODEL,
        max_tokens=600,
        system=[
            {"type": "text", "text": SISTEMA, "cache_control": {"type": "ephemeral"}},
        ],
        messages=historial,
    )
    if resp.stop_reason == "refusal":
        return "No puedo ayudarte con eso. ¿Quieres que lo pase a una persona?"
    return "".join(b.text for b in resp.content if b.type == "text")

print(responder([{"role": "user", "content": "¿Puedo devolver un libro que compré hace 20 días?"}]))
```

```ts tab="TypeScript" title="soporte.ts"
import { readFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5-5";
const client = new Anthropic();

const SISTEMA = readFileSync("sistema.txt", "utf-8");

async function responder(historial: Anthropic.MessageParam[]): Promise<string> {
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }],
    messages: historial,
  });
  if (resp.stop_reason === "refusal") {
    return "No puedo ayudarte con eso. ¿Quieres que lo pase a una persona?";
  }
  return resp.content.map((b) => (b.type === "text" ? b.text : "")).join("");
}

console.log(await responder([{ role: "user", content: "¿Puedo devolver un libro que compré hace 20 días?" }]));
```

Guardar el prompt en un archivo aparte permite versionarlo, revisarlo en un *pull request* y compararlo en tus [[glosario/evals|evals]].

## Prompt de sistema y caché

El prompt de sistema es el candidato natural para el [[glosario/prompt-caching|prompt caching]]: es largo, estable y va al principio de cada petición. Recuerda el orden del prefijo cacheado: `tools` → `system` → `messages`. **Cualquier cambio en `system` invalida la caché de lo que va después**, así que no metas en él datos variables como la fecha y hora exactas o el nombre de la persona. Si los necesitas, ponlos en el primer mensaje `user` o en un bloque de `system` posterior al punto de caché. Detalles en [[docs/contexto/02-prompt-caching]].

## Casos límite

| Situación | Comportamiento |
|---|---|
| Instrucción de `system` contradicha por el usuario | El modelo suele dar prioridad a `system`, pero no es una garantía de seguridad. Refuerza con validación en código. |
| Prompt de sistema muy largo | Cuenta como tokens de entrada en cada llamada y ocupa espacio en la [[glosario/ventana-de-contexto]]. Cachéalo y recorta lo que no se usa. |
| Mismas reglas en `system` y en cada mensaje | Redundante y caro. Déjalas en `system`. |
| Herramientas | Su descripción va en `tools`, no en `system`. En `system` explica *cuándo* usar cada una si no es evidente. |

## Errores frecuentes

- **Tratarlo como barrera de seguridad.** Un texto que diga «no reveles X» no impide que X se filtre ante una [[glosario/inyeccion-de-prompt|inyección]]. Los permisos se aplican en código: [[docs/seguridad/02-permisos-y-minimo-privilegio]].
- **Mayúsculas y amenazas** («NUNCA», «es CRÍTICO»). Con modelos actuales provocan sobrecorrección. Explica el motivo en tono normal.
- **Prompts de sistema que crecen sin control.** Cada incidente añade una regla y nadie quita ninguna. Revísalo con casos de prueba.
- **Datos variables arriba del todo.** Rompen la caché en cada llamada.

## Ver también

- [[roadmap/10-prompting/04-prompt-de-sistema]]: la lección.
- [[modelos/02-ingenieria-de-contexto]]: qué meter y en qué orden.
- [[docs/prompting/02-ejemplos-few-shot]]: añadir ejemplos al prompt.
- [[glosario/prompt-de-sistema]].
