---
titulo: Extraer datos de facturas a JSON validado
descripcion: Convierte el texto de una factura en un objeto JSON que cumple un esquema, con validación de importes en Pydantic y un camino claro para los casos dudosos.
creado: 2026-08-06
nivel: inicial
minutos: 25
tema: herramientas
stack: [python, anthropic, pydantic]
tags: [extraccion, salida-estructurada, pydantic]
relacionados: ["[[sistemas/extraccion-documental]]", "[[docs/prompting/03-salida-estructurada]]", "[[modelos/03-formato-y-salidas-estructuradas]]", "[[glosario/salida-estructurada]]"]
---

## Problema

Recibes facturas en texto (de un PDF, un correo o un OCR) y necesitas sus datos en un formato fijo para meterlos en tu ERP: número, fecha, emisor, líneas, base, IVA y total. Pedir «devuélveme un JSON» funciona casi siempre, y ese «casi» rompe la integración: un campo que falta, una coma decimal, un total que no cuadra.

La solución tiene dos capas. La API garantiza que la respuesta cumple el esquema (**[[glosario/salida-estructurada|salida estructurada]]**). Tu código comprueba lo que un esquema no puede expresar, como que los importes cuadren.

## Ingredientes

- Python 3.10 o superior.
- `pip install anthropic pydantic`
- La variable de entorno `ANTHROPIC_API_KEY`.
- Una factura de prueba en texto (`factura.txt`).

## Pasos

1. **Define el esquema con Pydantic.** Cada campo con su tipo. Las descripciones llegan al modelo y le ayudan a no confundir, por ejemplo, la cuota de IVA con el porcentaje. El validador comprueba que las cuentas salen.

```python title="modelo.py"
from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class Linea(BaseModel):
    descripcion: str
    cantidad: float
    precio_unitario: float
    importe: float


class Factura(BaseModel):
    numero: str = Field(description="Número de factura tal como aparece")
    fecha: date
    emisor_nombre: str
    emisor_nif: str = Field(description="NIF/CIF del emisor, sin espacios")
    cliente_nombre: str
    lineas: list[Linea]
    base_imponible: float
    iva: float = Field(description="Cuota de IVA en la moneda de la factura, no el porcentaje")
    total: float
    moneda: Literal["EUR", "USD", "GBP"]

    @model_validator(mode="after")
    def importes_cuadran(self) -> "Factura":
        suma_lineas = round(sum(l.importe for l in self.lineas), 2)
        if abs(suma_lineas - self.base_imponible) > 0.01:
            raise ValueError(f"Las líneas suman {suma_lineas} y la base es {self.base_imponible}")
        if abs(self.base_imponible + self.iva - self.total) > 0.01:
            raise ValueError("base_imponible + iva no coincide con total")
        return self
```

2. **Llama a la API con `messages.parse`.** El SDK convierte el modelo Pydantic en un esquema JSON, lo envía en `output_config.format` y valida la respuesta al recibirla. El resultado queda en `resp.parsed_output`.

```python title="extraer.py"
import sys

import anthropic
from pydantic import ValidationError

from modelo import Factura

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

SISTEMA = (
    "Extraes datos de facturas. Copia los valores tal como aparecen en el documento. "
    "No calcules ni completes datos que no estén escritos. Fechas en formato AAAA-MM-DD."
)


def extraer_factura(texto: str) -> Factura:
    resp = client.messages.parse(
        model=MODEL,
        max_tokens=2048,
        system=SISTEMA,
        messages=[{"role": "user", "content": f"<factura>\n{texto}\n</factura>"}],
        output_format=Factura,
    )
    if resp.stop_reason != "end_turn":
        raise RuntimeError(f"Respuesta incompleta: stop_reason={resp.stop_reason}")
    return resp.parsed_output


if __name__ == "__main__":
    texto = open(sys.argv[1], encoding="utf-8").read()
    try:
        factura = extraer_factura(texto)
    except ValidationError as e:
        print("A revisión manual:", e.errors()[0]["msg"])
        sys.exit(1)
    print(factura.model_dump_json(indent=2))
```

3. **Prepara una factura de prueba** y ejecútalo con `python extraer.py factura.txt`.

```text title="factura.txt"
FACTURA N.º 2026-0147        Fecha: 14/10/2026
Emisor: Talleres Ruiz S.L.   CIF: B12345678
Cliente: Panadería Lola
Concepto                 Uds   Precio   Importe
Revisión horno            1    120,00    120,00
Junta puerta              2     15,50     31,00
Base imponible: 151,00 €   IVA 21 %: 31,71 €   TOTAL: 182,71 €
```

4. **Separa los casos dudosos.** Si la validación falla, la factura no entra en el ERP: va a una cola de revisión con el motivo. Así un error del modelo o una factura mal hecha nunca se convierte en un asiento contable.

## Cómo comprobar que funciona

```text
# salida de ejemplo
{
  "numero": "2026-0147",
  "fecha": "2026-10-14",
  "emisor_nombre": "Talleres Ruiz S.L.",
  "emisor_nif": "B12345678",
  ...
  "base_imponible": 151.0,
  "iva": 31.71,
  "total": 182.71,
  "moneda": "EUR"
}
```

- La fecha sale en ISO aunque la factura diga `14/10/2026`, y los importes son números.
- Edita el total de `factura.txt` a `190,00 €` y vuelve a ejecutar. Debe salir `A revisión manual: ...` con el motivo.
- Para medir la calidad de verdad, reúne 20 facturas reales con su JSON correcto y compara campo a campo ([[disciplinas/evals]]).

## Variaciones

- **Con una herramienta `strict`.** Si ya trabajas con herramientas, define una cuyo `input_schema` sea el esquema y fuerza su uso. `strict: True` garantiza que los argumentos cumplen el esquema. Validas igual con Pydantic.

```python title="extraer_con_herramienta.py"
import anthropic

from modelo import Factura

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

herramienta = {
    "name": "guardar_factura",
    "description": "Guarda los datos extraídos de una factura.",
    "input_schema": anthropic.transform_schema(Factura),  # adapta el esquema a lo que acepta la API
    "strict": True,
}


def extraer_factura(texto: str) -> Factura:
    resp = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        tools=[herramienta],
        tool_choice={"type": "tool", "name": "guardar_factura"},
        messages=[{"role": "user", "content": f"<factura>\n{texto}\n</factura>"}],
    )
    bloque = next(b for b in resp.content if b.type == "tool_use")
    return Factura.model_validate(bloque.input)  # lanza ValidationError si no cuadra
```

- **PDF directo.** La API acepta PDF como bloque de documento en el mensaje, sin extraer el texto antes. Consulta el formato en la [documentación oficial](https://platform.claude.com/docs).
- **Campos opcionales.** Usa `str | None = None` para lo que no siempre aparece (número de pedido, IRPF). Evita que el modelo invente un valor para rellenar.
- **Volumen.** Para miles de facturas, procesa en paralelo con un límite de concurrencia ([[recetas/reintentos-y-limites-de-tasa]]).

## Errores típicos

- **Confiar en el esquema para las reglas de negocio.** Las salidas estructuradas no admiten restricciones numéricas ni de longitud. El SDK las pasa a la descripción como pista, pero el control real es tu validador.
- **Dejar que el modelo calcule.** Si le pides «calcula el total», lo hará, y a veces mal. Pide que copie y calcula tú.
- **No mirar `stop_reason`.** Con `max_tokens` corto y muchas líneas, la respuesta se corta y no hay JSON completo que validar.
- **Meter en el ERP lo que falla la validación «porque casi cuadra».** Esa es justo la factura que hay que mirar.
- **Esquemas recursivos o con `additionalProperties: true`.** No están soportados. Aplana la estructura.

Más contexto en [[sistemas/extraccion-documental]] y [[roadmap/10-prompting/03-formato-de-salida]].
