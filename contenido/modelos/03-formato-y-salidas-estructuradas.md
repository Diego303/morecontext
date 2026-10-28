---
titulo: Formato y salidas estructuradas
descripcion: Cómo pedir el formato que necesitas, cuándo usar ejemplos de salida, salidas estructuradas por esquema y herramientas estrictas, y por qué validar siempre.
creado: 2026-10-10
orden: 3
tags: [prompting, salida-estructurada, json, modelos]
relacionados: ["[[glosario/salida-estructurada]]", "[[docs/prompting/03-salida-estructurada]]", "[[roadmap/10-prompting/03-formato-de-salida]]", "[[recetas/extraer-facturas-a-json]]"]
---

**Principio**: si otro programa va a leer la respuesta, garantiza el formato con un esquema; si la lee una persona, descríbelo con precisión y da un ejemplo.

## Por qué funciona

El modelo genera texto. Sin indicaciones, elige el formato que le parece razonable, y eso cambia entre llamadas: a veces una lista, a veces párrafos, a veces JSON envuelto en un bloque de código con una frase de introducción. Para un humano es tolerable. Para un `json.loads()`, no. Hay tres niveles de control, de menos a más estricto: describir el formato, mostrar un ejemplo y forzar un esquema.

## Nivel 1: describir el formato

Para salidas que lee una persona, describe la estructura, la longitud y el estilo. Cuanto más concreto, mejor. El estilo del prompt también influye: un prompt escrito en prosa tiende a producir prosa; uno lleno de viñetas tiende a producir viñetas.

```text title="Antes"
Resume esta reunión.
```

```text title="Después"
Resume esta reunión con esta estructura:
1. Una frase con la decisión principal.
2. Acuerdos: una línea por acuerdo, con el responsable entre paréntesis.
3. Pendientes: lo que quedó sin decidir.
Sin introducción ni despedida. Máximo 120 palabras.
```

## Nivel 2: mostrar un ejemplo de salida

Un ejemplo fija detalles que cuesta describir: nombres de campos, formato de fechas, cómo se representa un dato que falta. Envuélvelo en etiquetas para que el modelo lo distinga del resto.

```text title="Después"
Extrae los datos del pedido. Devuelve el resultado con exactamente este formato:

<ejemplo_salida>
pedido: 88213
fecha: 2026-10-03
importe: 149,90 EUR
estado: enviado
</ejemplo_salida>

Si un dato no aparece en el texto, escribe "desconocido".
```

## Nivel 3: salidas garantizadas por esquema

Cuando un programa consume la salida, no te fíes de la descripción: usa [[glosario/salida-estructurada|salidas estructuradas]]. Con `output_config.format` pasas un JSON Schema y la respuesta llega en el bloque de texto como JSON que cumple ese esquema.

```python tab="Python" title="extraer.py"
import json
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

ESQUEMA = {
    "type": "object",
    "properties": {
        "pedido": {"type": "string"},
        "fecha": {"type": "string", "description": "AAAA-MM-DD"},
        "importe_eur": {"type": "number"},
        "estado": {"type": "string", "enum": ["pendiente", "enviado", "entregado", "desconocido"]},
    },
    "required": ["pedido", "fecha", "importe_eur", "estado"],
    "additionalProperties": False,
}

resp = client.messages.create(
    model=MODEL, max_tokens=500,
    messages=[{"role": "user", "content": "Extrae los datos: Pedido 88213, del 3 de octubre, 149,90 €. Ya ha salido del almacén."}],
    output_config={"format": {"type": "json_schema", "schema": ESQUEMA}},
)
datos = json.loads(resp.content[0].text)
```

```ts tab="TypeScript" title="extraer.ts"
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5-5";
const client = new Anthropic();

const resp = await client.messages.create({
  model: MODEL, max_tokens: 500,
  messages: [{ role: "user", content: "Extrae los datos: Pedido 88213, del 3 de octubre, 149,90 €. Ya ha salido del almacén." }],
  output_config: { format: { type: "json_schema", schema: {
    type: "object",
    properties: {
      pedido: { type: "string" }, fecha: { type: "string", description: "AAAA-MM-DD" },
      importe_eur: { type: "number" },
      estado: { type: "string", enum: ["pendiente", "enviado", "entregado", "desconocido"] },
    },
    required: ["pedido", "fecha", "importe_eur", "estado"],
    additionalProperties: false,
  } } },
});
const bloque = resp.content[0];
const datos = bloque.type === "text" ? JSON.parse(bloque.text) : null;
```

Con Pydantic en Python puedes usar `client.messages.parse(..., output_format=MiModelo)` y leer `.parsed_output` ya convertido en objeto.

### Herramientas estrictas

Si el JSON son los argumentos de una herramienta, añade `"strict": True` en su definición. Así los argumentos del `tool_use` cumplen siempre su `input_schema`. Es útil en agentes donde un argumento mal formado rompería la ejecución.

### Limitaciones del esquema

- Sin esquemas recursivos.
- Sin restricciones numéricas (mínimos, máximos) ni de longitud.
- `additionalProperties` debe ser `false` en los objetos.

Lo que el esquema no puede expresar lo compruebas tú después.

## Validar siempre

El esquema garantiza la forma. No garantiza que el contenido sea correcto: la fecha puede estar bien formada y ser la equivocada, el importe puede ser negativo, el estado puede no corresponder al texto. Valida en tu código las reglas de negocio:

```python title="validar.py"
from datetime import date

def validar(d: dict) -> list[str]:
    errores = []
    try:
        date.fromisoformat(d["fecha"])
    except ValueError:
        errores.append(f"Fecha no válida: {d['fecha']}")
    if d["importe_eur"] < 0:
        errores.append("Importe negativo")
    return errores  # si hay errores: reintenta con el error en el prompt o envía a revisión humana
```

Y comprueba `stop_reason`. Si es `max_tokens`, el JSON está cortado aunque el esquema estuviera activo. Si es `refusal`, no hay JSON que leer.

## Cuándo no aplica

- **Texto para personas**: forzar JSON para luego mostrar un párrafo añade complejidad sin beneficio.
- **Razonamiento largo**: si metes todo el análisis dentro de un campo JSON, el modelo pierde la libertad de estructurarlo. Mejor activa el [[modelos/04-dejar-pensar-al-modelo|razonamiento adaptativo]] y deja el JSON para el resultado.
- **Esquemas con restricciones que no admite**: entonces combina un esquema más laxo con validación en código.

## Para seguir

- [[docs/prompting/03-salida-estructurada]]: referencia técnica completa.
- [[sistemas/extraccion-documental]]: un sistema que vive de esto.
- [[modelos/06-parametros]]: `max_tokens` y JSON cortados.
