---
titulo: Salida estructurada
descripcion: Cómo obtener JSON que cumple un esquema con output_config.format y argumentos de herramienta garantizados con strict, y qué limitaciones tienen.
creado: 2026-07-24
orden: 3
nivel: intermedio
tags: [prompting, json, esquemas]
aliases: [Structured outputs, Salidas estructuradas]
relacionados: ["[[glosario/salida-estructurada]]", "[[modelos/03-formato-y-salidas-estructuradas]]", "[[roadmap/10-prompting/03-formato-de-salida]]", "[[sistemas/extraccion-documental]]"]
---

La [[glosario/salida-estructurada|salida estructurada]] es la capacidad de pedir al modelo una respuesta que **cumple un esquema JSON definido por ti**, garantizada por la API y no solo sugerida en el prompt. Hay dos mecanismos: `output_config.format` para la respuesta final del modelo y `strict: true` para los argumentos de una herramienta. Los dos eliminan el JSON mal formado; ninguno sustituye a validar el contenido en tu código.

Para aprender a pedir y validar JSON desde la base, ve a [[roadmap/10-prompting/03-formato-de-salida]].

## Los dos mecanismos

| Mecanismo | Dónde se configura | Qué garantiza | Úsalo para |
|---|---|---|---|
| `output_config.format` | Parámetro de la petición | El bloque `text` de la respuesta es JSON válido según tu esquema | Extracción, clasificación, cualquier respuesta que lee otro programa |
| `strict: true` | En la definición de una herramienta | El `input` de cada `tool_use` de esa herramienta cumple su `input_schema` | Agentes con herramientas cuyos argumentos no pueden fallar |

Antes de estos mecanismos se pedía JSON en el prompt y se rezaba, o se forzaba una herramienta ficticia con `tool_choice`. Siguen funcionando, pero sin garantía de forma.

## `output_config.format`

```python
output_config={
    "format": {
        "type": "json_schema",
        "schema": {
            "type": "object",
            "properties": {...},
            "required": [...],
            "additionalProperties": False,
        },
    }
}
```

La respuesta llega como texto en `resp.content`. Parséalo con `json.loads`. Puedes combinarlo con el esfuerzo de razonamiento en el mismo objeto: `output_config={"format": {...}, "effort": "low"}` (ver [[docs/prompting/04-razonamiento]]).

### Con Pydantic (Python)

El SDK de Python acepta un modelo de Pydantic y hace la conversión en los dos sentidos:

```python
resp = client.messages.parse(model=MODEL, max_tokens=1024, messages=..., output_format=Factura)
factura = resp.parsed_output  # instancia de Factura
```

## `strict` en herramientas

```python
herramienta = {
    "name": "crear_reembolso",
    "description": "Crea un reembolso para un pedido. Requiere aprobación humana si supera 50 €.",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "pedido_id": {"type": "string"},
            "importe_eur": {"type": "number"},
            "motivo": {"type": "string", "enum": ["defectuoso", "no_llego", "otro"]},
        },
        "required": ["pedido_id", "importe_eur", "motivo"],
        "additionalProperties": False,
    },
}
```

Con `strict`, el modelo no puede inventar un campo, omitir uno obligatorio o pasar un `motivo` fuera del `enum`. El resto del ciclo de herramientas es el habitual: [[docs/herramientas/01-uso-de-herramientas]].

## Limitaciones del esquema

La garantía tiene un coste: no todo JSON Schema está admitido.

| Admitido | No admitido |
|---|---|
| `object`, `array`, `string`, `number`, `integer`, `boolean`, `null` | Esquemas recursivos (un tipo que se contiene a sí mismo) |
| `properties`, `required`, `enum` | Restricciones numéricas (`minimum`, `maximum`…) |
| Objetos y listas anidados | Restricciones de longitud (`minLength`, `maxItems`…) |
| `additionalProperties: false` (obligatorio en cada objeto) | `additionalProperties` distinto de `false` |

Lo que el esquema no puede expresar (un importe positivo, una lista de 1 a 5 elementos, un NIF con formato válido) lo compruebas tú después. Consulta la [documentación oficial](https://platform.claude.com/docs) para la lista completa y actualizada.

## Ejemplo completo: extraer una factura

```python tab="Python" title="extraer_factura.py"
import json
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

ESQUEMA = {
    "type": "object",
    "properties": {
        "proveedor": {"type": "string"},
        "fecha": {"type": "string", "description": "AAAA-MM-DD"},
        "total_eur": {"type": "number"},
        "lineas": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "concepto": {"type": "string"},
                    "importe_eur": {"type": "number"},
                },
                "required": ["concepto", "importe_eur"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["proveedor", "fecha", "total_eur", "lineas"],
    "additionalProperties": False,
}

def extraer(texto_factura: str) -> dict:
    resp = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        messages=[{"role": "user", "content": f"<factura>{texto_factura}</factura>\nExtrae los datos."}],
        output_config={"format": {"type": "json_schema", "schema": ESQUEMA}},
    )
    if resp.stop_reason != "end_turn":
        raise ValueError(f"Respuesta incompleta: {resp.stop_reason}")
    datos = json.loads("".join(b.text for b in resp.content if b.type == "text"))

    # Lo que el esquema no garantiza, lo validas tú.
    suma = round(sum(l["importe_eur"] for l in datos["lineas"]), 2)
    if datos["total_eur"] <= 0 or abs(suma - datos["total_eur"]) > 0.01:
        raise ValueError("Total incoherente: revisión humana")
    return datos
```

```ts tab="TypeScript" title="extraer_factura.ts"
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5-5";
const client = new Anthropic();

const ESQUEMA = {
  type: "object",
  properties: {
    proveedor: { type: "string" },
    fecha: { type: "string", description: "AAAA-MM-DD" },
    total_eur: { type: "number" },
    lineas: {
      type: "array",
      items: {
        type: "object",
        properties: { concepto: { type: "string" }, importe_eur: { type: "number" } },
        required: ["concepto", "importe_eur"],
        additionalProperties: false,
      },
    },
  },
  required: ["proveedor", "fecha", "total_eur", "lineas"],
  additionalProperties: false,
};

type Factura = {
  proveedor: string;
  fecha: string;
  total_eur: number;
  lineas: { concepto: string; importe_eur: number }[];
};

async function extraer(textoFactura: string): Promise<Factura> {
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: `<factura>${textoFactura}</factura>\nExtrae los datos.` }],
    output_config: { format: { type: "json_schema", schema: ESQUEMA } },
  });
  if (resp.stop_reason !== "end_turn") throw new Error(`Respuesta incompleta: ${resp.stop_reason}`);
  const texto = resp.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const datos = JSON.parse(texto) as Factura;

  const suma = Math.round(datos.lineas.reduce((s, l) => s + l.importe_eur, 0) * 100) / 100;
  if (datos.total_eur <= 0 || Math.abs(suma - datos.total_eur) > 0.01) {
    throw new Error("Total incoherente: revisión humana");
  }
  return datos;
}
```

El sistema completo, con cola de revisión humana para los casos dudosos, está en [[sistemas/extraccion-documental]]. Una versión corta, en [[recetas/extraer-facturas-a-json]].

## Casos límite

| Situación | Qué pasa | Qué hacer |
|---|---|---|
| `stop_reason == "max_tokens"` | El JSON queda cortado y no parsea. | Sube `max_tokens` o reduce la salida. Comprueba siempre `stop_reason`. |
| `stop_reason == "refusal"` | La respuesta puede no seguir el esquema. | Trátalo como caso aparte antes de parsear. |
| Dato ausente en el documento | El modelo tiene que rellenar un campo obligatorio y puede inventarlo. | Permite `null` (`"type": ["string", "null"]`) y di en el prompt que use `null` si no aparece. |
| Esquema rechazado | Usas una construcción no admitida. | Simplifica y mueve la restricción a tu validación. |
| Primera petición con un esquema nuevo | Puede tardar algo más mientras se prepara el esquema. | Reutiliza esquemas estables. |

## Errores frecuentes

- **Confiar en el esquema como validación de negocio.** Garantiza forma, no verdad. Un total bien tipado puede ser incorrecto.
- **Campos obligatorios para datos que a veces no existen.** Invitan a [[glosario/alucinacion|alucinar]]. Usa `null`.
- **Olvidar `additionalProperties: false`** en objetos anidados.
- **Descripciones vacías.** El nombre del campo no basta: `"description"` en cada propiedad orienta al modelo sobre qué extraer y en qué formato.

## Ver también

- [[modelos/03-formato-y-salidas-estructuradas]]: buenas prácticas de formato.
- [[docs/herramientas/01-uso-de-herramientas]]: herramientas y `strict`.
- [[roadmap/10-prompting/03-formato-de-salida]]: la lección.
- [[radar/2026-08-11-salidas-estructuradas-garantizadas]].
