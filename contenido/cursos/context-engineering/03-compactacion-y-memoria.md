---
titulo: Compactación y memoria
descripcion: Cómo limpiar resultados antiguos, resumir el historial de un agente sin romper los pares tool_use/tool_result y tomar notas persistentes fuera del contexto.
creado: 2026-10-09
orden: 3
minutos: 50
tipo: practica
objetivos:
  - Implementar la limpieza de resultados de herramientas antiguos manteniendo la estructura de la conversación
  - Implementar una compactación del historial que conserve decisiones, errores pendientes y estado de la tarea
  - Diseñar herramientas de notas persistentes para que el agente guarde lo importante fuera del contexto
requiere: ["[[cursos/context-engineering/02-que-meter-y-que-no]]"]
relacionados: ["[[glosario/compactacion]]", "[[glosario/memoria]]", "[[docs/contexto/04-memoria]]", "[[roadmap/30-contexto-y-rag/06-memoria-entre-sesiones]]"]
tags: [contexto, memoria, agentes]
---

Al terminar esta lección tendrás tres utilidades para un bucle agéntico: una que vacía los resultados de herramientas que ya no hacen falta, otra que resume el historial cuando se acerca al límite y unas herramientas de notas para que el agente guarde lo importante fuera del contexto. Con las tres, un agente puede trabajar mucho más allá de lo que cabe en su ventana.

## La idea

En un bucle agéntico el historial solo crece. Antes o después pasa una de dos cosas: llegas al límite de la ventana o, mucho antes, el agente empieza a rendir peor porque su contexto está lleno de material viejo ([[cursos/context-engineering/01-el-contexto-como-presupuesto]]). Hay tres respuestas, de más ligera a más profunda:

| Técnica | Qué hace | Qué pierde | Cuándo |
|---|---|---|---|
| Limpiar resultados antiguos | Sustituye el contenido de `tool_result` viejos por un marcador | El detalle de lo leído hace tiempo | Siempre, como higiene |
| Compactar | Resume el historial antiguo y continúa desde el resumen | Matices no recogidos en el resumen | Al pasar un umbral de tokens |
| Notas persistentes | El agente escribe lo importante en un archivo y lo lee cuando lo necesita | Nada, si las notas son buenas | Tareas largas o con varias sesiones |

*[Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)* (Anthropic, 2025) describe estas técnicas. Sobre la limpieza dice que es una de las formas más seguras y ligeras de compactación: una vez que una herramienta se ejecutó hace muchos pasos, el agente rara vez necesita volver a ver su resultado bruto.

## Limpiar resultados antiguos

La regla que no puedes romper: cada `tool_use` necesita su `tool_result` en el mensaje siguiente. Así que no borres mensajes; vacía su contenido.

```python tab="Python" title="compactacion.py"
MARCADOR = "[resultado antiguo eliminado; vuelve a llamar a la herramienta si lo necesitas]"

def limpiar_resultados(messages: list[dict], conservar: int = 3) -> list[dict]:
    """Vacía los tool_result salvo los de los últimos `conservar` mensajes de usuario con resultados."""
    con_resultados = [i for i, m in enumerate(messages)
                      if m["role"] == "user" and isinstance(m["content"], list)
                      and any(b.get("type") == "tool_result" for b in m["content"])]
    viejos = set(con_resultados[:-conservar]) if conservar else set(con_resultados)
    salida = []
    for i, m in enumerate(messages):
        if i in viejos:
            m = {**m, "content": [{**b, "content": MARCADOR} if b.get("type") == "tool_result" else b
                                  for b in m["content"]]}
        salida.append(m)
    return salida
```

```ts tab="TypeScript" title="compactacion.ts"
import Anthropic from "@anthropic-ai/sdk";

const MARCADOR = "[resultado antiguo eliminado; vuelve a llamar a la herramienta si lo necesitas]";

export function limpiarResultados(messages: Anthropic.MessageParam[], conservar = 3): Anthropic.MessageParam[] {
  const conResultados = messages.flatMap((m, i) =>
    m.role === "user" && Array.isArray(m.content) && m.content.some((b) => b.type === "tool_result") ? [i] : []);
  const viejos = new Set(conservar ? conResultados.slice(0, -conservar) : conResultados);
  return messages.map((m, i) =>
    viejos.has(i) && Array.isArray(m.content)
      ? { ...m, content: m.content.map((b) => (b.type === "tool_result" ? { ...b, content: MARCADOR } : b)) }
      : m);
}
```

El marcador le dice al modelo qué pasó y cómo recuperar el dato. Ten en cuenta que modificar mensajes antiguos invalida el [[glosario/prompt-caching|prompt caching]] a partir de ese punto. Por eso conviene limpiar en bloque cada cierto número de pasos y no en cada paso.

## Compactar el historial

Cuando el historial pasa un umbral, resúmelo y continúa desde el resumen. El artículo de Anthropic advierte de que lo difícil es elegir qué conservar: una compactación demasiado agresiva pierde detalles sutiles cuya importancia solo se ve después. Su recomendación es ajustar el prompt de resumen con trazas reales: primero maximizar lo que recoge y después ir quitando lo superfluo. Para un agente que trabaja sobre código, el artículo menciona conservar decisiones de arquitectura, errores sin resolver y detalles de implementación, y descartar resultados de herramientas redundantes.

```python title="compactacion.py (continuación)"
import json
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

PROMPT_RESUMEN = """Resume el trabajo de un agente para que pueda continuar sin el historial.
Conserva, en este orden:
1. Objetivo de la tarea y restricciones del usuario, literalmente si es posible.
2. Decisiones tomadas y su motivo.
3. Estado actual: qué está hecho, qué falta.
4. Errores encontrados y si están resueltos.
5. Datos concretos que hagan falta después (rutas, identificadores, valores).
Descarta resultados de herramientas que ya se usaron y no aportan nada nuevo."""

def a_texto(messages: list[dict]) -> str:
    partes = []
    for m in messages:
        bloques = m["content"] if isinstance(m["content"], list) else [{"type": "text", "text": m["content"]}]
        for b in bloques:
            b = b.model_dump() if hasattr(b, "model_dump") else b
            if b["type"] == "text":
                partes.append(f"[{m['role']}] {b['text']}")
            elif b["type"] == "tool_use":
                partes.append(f"[llamada] {b['name']}({json.dumps(b['input'], ensure_ascii=False)})")
            elif b["type"] == "tool_result":
                partes.append(f"[resultado] {str(b['content'])[:2000]}")
    return "\n".join(partes)

def compactar(messages: list[dict], conservar: int = 6) -> list[dict]:
    """Resume todo salvo la cola reciente. El corte cae justo antes de un mensaje del asistente,
    así ningún tool_use queda separado de su tool_result."""
    corte = next((i for i in range(len(messages) - conservar, 0, -1)
                  if messages[i]["role"] == "assistant"), None)
    if corte is None:
        return messages
    resp = client.messages.create(
        model=MODEL, max_tokens=3000, system=PROMPT_RESUMEN,
        messages=[{"role": "user", "content": f"<historial>\n{a_texto(messages[:corte])}\n</historial>"}])
    resumen = "".join(b.text for b in resp.content if b.type == "text")
    return [{"role": "user", "content": f"<resumen_del_trabajo_previo>\n{resumen}\n"
                                        "</resumen_del_trabajo_previo>\nContinúa la tarea."}] + messages[corte:]

def gestionar(system: str, tools: list[dict], messages: list[dict], umbral: int) -> list[dict]:
    usados = client.messages.count_tokens(model=MODEL, system=system, tools=tools,
                                          messages=messages).input_tokens
    if usados < umbral:
        return messages
    messages = limpiar_resultados(messages)
    usados = client.messages.count_tokens(model=MODEL, system=system, tools=tools,
                                          messages=messages).input_tokens
    return compactar(messages) if usados >= umbral else messages
```

Llama a `gestionar` al principio de cada iteración del bucle, antes de `messages.create`. Primero intenta lo barato (limpiar) y solo si no basta, compacta. El primer mensaje del historial nuevo es del usuario y el siguiente del asistente, así que la alternancia de roles se mantiene.

Algunos proveedores ofrecen compactación o gestión de contexto en el propio servidor. Si la tuya lo hace, consulta su documentación: el criterio de qué conservar sigue siendo tuyo.

> [!aviso] Compactar pierde información
> Cada resumen es una decisión sobre qué olvidar. Guarda siempre el historial completo fuera del contexto (en tu traza) para poder auditar qué se perdió cuando el agente se equivoque después de compactar.

## Notas persistentes

La tercera técnica no espera al umbral: el agente escribe a medida que trabaja. El artículo de Anthropic la llama toma de notas estructurada: el agente guarda notas fuera de la ventana de contexto y las recupera más tarde. Un archivo `NOTAS.md` o una lista de tareas bastan. Las notas sobreviven a la compactación y a un reinicio, y el agente decide qué es importante en el momento en que lo sabe, no después.

```python title="notas.py"
import pathlib

NOTAS = pathlib.Path("NOTAS.md")

def leer_notas() -> str:
    return NOTAS.read_text(encoding="utf-8") if NOTAS.exists() else "(sin notas todavía)"

def anotar(seccion: str, texto: str) -> str:
    if seccion not in ("decisiones", "pendiente", "hechos", "errores"):
        raise ValueError("seccion debe ser decisiones, pendiente, hechos o errores")
    with NOTAS.open("a", encoding="utf-8") as f:
        f.write(f"\n## {seccion}\n- {texto}\n")
    return "Anotado."

TOOLS_NOTAS = [
    {"name": "leer_notas", "description": "Lee tus notas de trabajo. Úsala al empezar y tras un resumen.",
     "input_schema": {"type": "object", "properties": {}}},
    {"name": "anotar", "description": "Guarda una nota breve que necesitarás más tarde: una decisión y su motivo, "
     "algo pendiente, un hecho verificado o un error. No anotes lo que ya está en el código o en los tests.",
     "input_schema": {"type": "object", "properties": {
         "seccion": {"type": "string", "enum": ["decisiones", "pendiente", "hechos", "errores"]},
         "texto": {"type": "string"}}, "required": ["seccion", "texto"]}},
]
```

Las secciones fijas obligan a notas útiles: decisiones con motivo, pendientes accionables, hechos comprobados. Una variante habitual es una herramienta de memoria con operaciones de archivo (ver, crear, editar) sobre una carpeta dedicada; la idea es la misma. Para memoria entre sesiones de usuario distintas, mira [[roadmap/30-contexto-y-rag/06-memoria-entre-sesiones]] y [[docs/contexto/04-memoria]].

## Errores frecuentes

- **Borrar mensajes con `tool_use` o `tool_result`.** La API rechaza la conversación. Vacía el contenido, no la estructura.
- **Compactar en cada paso.** Pierdes caché y detalle. Usa un umbral.
- **Resumen genérico.** «El agente estuvo trabajando en el bug» no sirve para continuar. Pide el formato con decisiones, estado y datos concretos.
- **Notas que nadie lee.** Si el prompt no dice cuándo leerlas, el agente las escribe y las ignora.

## Ejercicio

> [!ejercicio] Un agente que no se queda sin contexto
> Añade `gestionar` y las herramientas de notas a tu bucle agéntico. Fija un umbral bajo (por ejemplo, 20.000 tokens) para forzar la compactación en una tarea de unos 30 pasos.
> Está bien si: la ejecución pasa por al menos una compactación sin error de la API, tras compactar el agente llama a `leer_notas` y continúa sin repetir trabajo hecho, y la tarea termina con el mismo resultado que sin compactar en al menos dos de tres ejecuciones.

> [!ejercicio]- Pistas
> Añade al prompt de sistema: «Si ves un resumen del trabajo previo, lee tus notas antes de seguir». Para detectar trabajo repetido, compara en la traza las llamadas a herramientas antes y después del resumen.

## Resumen

- Tres técnicas de menos a más: limpiar resultados, compactar el historial, tomar notas persistentes.
- Nunca rompas los pares `tool_use`/`tool_result`: vacía el contenido o corta antes de un mensaje del asistente.
- Compacta con umbral y un prompt de resumen ajustado con trazas reales.
- Las notas guardan lo importante en el momento en que se sabe y sobreviven a todo.
- Guarda el historial completo fuera del contexto para auditar.

## Para seguir

- [[cursos/context-engineering/04-contexto-para-agentes-largos]]
- [[glosario/compactacion]]
- [[cursos/sistemas-multiagente/03-coordinacion-y-estado]]
