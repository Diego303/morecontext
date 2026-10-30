---
titulo: Ejemplos few-shot
descripcion: Cómo incluir ejemplos de entrada y salida en el prompt, cuántos poner, dónde colocarlos y cómo evitar que el modelo los copie.
creado: 2026-07-23
actualizado: 2026-10-29
orden: 2
nivel: inicial
tags: [prompting, few-shot, ejemplos]
aliases: [Few-shot prompting]
relacionados: ["[[glosario/few-shot]]", "[[roadmap/10-prompting/02-ejemplos-few-shot]]", "[[glosario/zero-shot]]", "[[recetas/clasificar-y-enrutar-tickets]]"]
---

El *prompting* [[glosario/few-shot|few-shot]] consiste en **incluir en el prompt varios ejemplos resueltos** de la tarea (entrada y salida esperada) para que el modelo infiera el patrón. Es la forma más fiable de comunicar formato, tono y criterio en casos donde describirlos con palabras resulta ambiguo. La capacidad de aprender así, sin reentrenar, se describió en Brown et al., 2020, [*Language Models are Few-Shot Learners*](https://arxiv.org/abs/2005.14165).

Lo contrario es [[glosario/zero-shot|zero-shot]]: solo instrucciones, sin ejemplos. Empieza por ahí y añade ejemplos cuando las salidas no sean consistentes.

Para practicarlo con ejercicios, ve a [[roadmap/10-prompting/02-ejemplos-few-shot]].

## Cuándo usar ejemplos

| Situación | Ejemplos | Por qué |
|---|---|---|
| Formato peculiar (un estilo de resumen, una plantilla interna) | Sí | Un ejemplo vale más que una especificación larga. |
| Criterio difuso («urgente» frente a «normal») | Sí, con casos frontera | Los casos límite fijan dónde está la línea. |
| Tono de marca | Sí | El tono se describe mal y se imita bien. |
| JSON con esquema fijo | Mejor [[docs/prompting/03-salida-estructurada]] | El esquema garantiza la forma; los ejemplos solo la sugieren. |
| Tarea que el modelo ya hace bien sin ejemplos | No | Gastas tokens y puedes sesgarlo. |

## Dónde ponerlos

Hay dos formas habituales. Las dos funcionan; elige según si los ejemplos son fijos o dependen de la petición.

| Forma | Cómo | Ventaja | Inconveniente |
|---|---|---|---|
| En `system`, con etiquetas | Bloque `<ejemplos>` con `<ejemplo>` dentro | Fijos, se cachean con el resto del prompt de sistema | Todos los casos ven los mismos ejemplos |
| Como turnos previos | Pares `user` / `assistant` antes del mensaje real | El modelo los ve como conversación «ya ocurrida» | Ocupan historial; menos claros si la conversación sigue |
| Seleccionados dinámicamente | Recuperas los ejemplos más parecidos a la entrada (con [[glosario/embeddings]]) | Ejemplos relevantes para cada caso | Más infraestructura; rompe la caché si van en `system` |

## Cómo elegir los ejemplos

- **Entre 3 y 5 para empezar.** Mide con tu conjunto de prueba antes de añadir más; a partir de cierto punto ganas poco y pagas tokens en cada llamada.
- **Variados.** Cubre las categorías y longitudes que verás en producción. Si todos los ejemplos son cortos, el modelo acortará.
- **Incluye casos frontera.** El ejemplo más útil es el que está cerca de la línea entre dos respuestas.
- **Equilibrados.** Si 4 de 5 ejemplos son «normal», el modelo tenderá a «normal».
- **Realistas.** Mejor ejemplos sacados de datos reales (anonimizados) que inventados.
- **Correctos.** Un ejemplo con un error enseña ese error.

## Ejemplo completo

Clasificador de tickets de soporte con ejemplos fijos en `system`:

```python tab="Python" title="clasificar.py"
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

SISTEMA = """Clasificas tickets de soporte en una categoría: envio, devolucion, pago, otro.
Responde solo con la categoría, en minúsculas.

<ejemplos>
<ejemplo>
<ticket>Mi pedido lleva 10 días en "en reparto" y no llega.</ticket>
<categoria>envio</categoria>
</ejemplo>
<ejemplo>
<ticket>Me cobrasteis dos veces el mismo pedido.</ticket>
<categoria>pago</categoria>
</ejemplo>
<ejemplo>
<ticket>El libro llegó con la tapa rota, ¿cómo lo cambio?</ticket>
<categoria>devolucion</categoria>
</ejemplo>
<ejemplo>
<ticket>Me devolvieron el dinero de la devolución pero falta el envío.</ticket>
<categoria>pago</categoria>
</ejemplo>
<ejemplo>
<ticket>¿Tenéis tienda física en Valencia?</ticket>
<categoria>otro</categoria>
</ejemplo>
</ejemplos>"""

CATEGORIAS = {"envio", "devolucion", "pago", "otro"}

def clasificar(ticket: str) -> str:
    resp = client.messages.create(
        model=MODEL,
        max_tokens=256,  # deja margen: el razonamiento adaptativo también gasta salida
        output_config={"effort": "low"},  # tarea simple: poco razonamiento
        system=SISTEMA,
        messages=[{"role": "user", "content": f"<ticket>{ticket}</ticket>"}],
    )
    etiqueta = "".join(b.text for b in resp.content if b.type == "text").strip().lower()
    return etiqueta if etiqueta in CATEGORIAS else "otro"  # valida siempre

print(clasificar("Quiero cambiar la dirección de entrega de mi pedido."))
```

```ts tab="TypeScript" title="clasificar.ts"
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5-5";
const client = new Anthropic();

const SISTEMA = `Clasificas tickets de soporte en una categoría: envio, devolucion, pago, otro.
Responde solo con la categoría, en minúsculas.

<ejemplos>
<ejemplo><ticket>Mi pedido lleva 10 días en "en reparto" y no llega.</ticket><categoria>envio</categoria></ejemplo>
<ejemplo><ticket>Me cobrasteis dos veces el mismo pedido.</ticket><categoria>pago</categoria></ejemplo>
<ejemplo><ticket>El libro llegó con la tapa rota, ¿cómo lo cambio?</ticket><categoria>devolucion</categoria></ejemplo>
<ejemplo><ticket>Me devolvieron el dinero de la devolución pero falta el envío.</ticket><categoria>pago</categoria></ejemplo>
<ejemplo><ticket>¿Tenéis tienda física en Valencia?</ticket><categoria>otro</categoria></ejemplo>
</ejemplos>`;

const CATEGORIAS = new Set(["envio", "devolucion", "pago", "otro"]);

async function clasificar(ticket: string): Promise<string> {
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    output_config: { effort: "low" },
    system: SISTEMA,
    messages: [{ role: "user", content: `<ticket>${ticket}</ticket>` }],
  });
  const etiqueta = resp.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim()
    .toLowerCase();
  return CATEGORIAS.has(etiqueta) ? etiqueta : "otro";
}

console.log(await clasificar("Quiero cambiar la dirección de entrega de mi pedido."));
```

```text
# salida de ejemplo
envio
```

Dos detalles del código. `max_tokens` no es 10 aunque la respuesta sea una palabra: en los modelos 5.x el razonamiento es adaptativo y consume tokens de salida, así que un límite tan bajo puede cortar la respuesta antes del texto (`stop_reason: "max_tokens"`). Y `effort: "low"` pide poco razonamiento para una tarea que no lo necesita (en Sonnet 5.5 el valor por defecto es `high`). Si la etiqueta debe ser una de una lista cerrada sí o sí, combina los ejemplos con un esquema `enum` en [[docs/prompting/03-salida-estructurada|salida estructurada]].

El cuarto ejemplo es un caso frontera: menciona «devolución» pero el problema es de pago. Ese tipo de ejemplo es el que más mejora la precisión. La receta [[recetas/clasificar-y-enrutar-tickets]] lleva esto a un enrutador completo.

### Como turnos previos

La misma idea con pares de mensajes:

```python
mensajes = [
    {"role": "user", "content": "<ticket>Me cobrasteis dos veces.</ticket>"},
    {"role": "assistant", "content": "pago"},
    {"role": "user", "content": "<ticket>¿Tenéis tienda en Valencia?</ticket>"},
    {"role": "assistant", "content": "otro"},
    {"role": "user", "content": f"<ticket>{ticket}</ticket>"},
]
```

## Errores frecuentes

- **El modelo copia los ejemplos.** Reutiliza frases, nombres o longitudes. Varía los ejemplos y di explícitamente que son ilustrativos: «sigue el formato, no el contenido».
- **Ejemplos desequilibrados.** Sesgan hacia la clase mayoritaria. Cuenta las etiquetas.
- **Ejemplos sin delimitar.** Si el modelo no distingue dónde acaba un ejemplo y empieza la tarea real, mezcla. Usa etiquetas.
- **Ejemplos que contradicen las instrucciones.** El modelo suele seguir al ejemplo. Revísalos cada vez que cambies una regla.
- **`max_tokens` mínimo para respuestas cortas.** Con razonamiento adaptativo, la respuesta puede quedarse vacía. Deja margen y baja el `effort`.
- **No medir.** Añadir ejemplos «por si acaso» sin un [[glosario/conjunto-de-evaluacion|conjunto de evaluación]] es ir a ciegas: [[roadmap/10-prompting/05-iterar-con-casos-de-prueba]].

## Ver también

- [[roadmap/10-prompting/02-ejemplos-few-shot]]: la lección.
- [[docs/prompting/01-prompt-de-sistema]]: dónde viven los ejemplos fijos.
- [[docs/prompting/03-salida-estructurada]]: cuando lo que necesitas es forma garantizada.
- [[glosario/few-shot]] y [[glosario/zero-shot]].
