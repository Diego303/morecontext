---
titulo: El modelo devuelve JSON inválido
descripcion: Por qué json.loads falla con lo que devuelve el modelo y cómo arreglarlo con salidas estructuradas, un esquema compatible, validación con Pydantic y un reintento con el error.
creado: 2026-10-29
sintoma: El modelo devuelve JSON inválido
tema: prompting
nivel: intermedio
tags: [salida-estructurada, json, pydantic, prompting]
relacionados: ["[[docs/prompting/03-salida-estructurada]]", "[[roadmap/10-prompting/03-formato-de-salida]]", "[[glosario/salida-estructurada]]", "[[problemas/respuesta-cortada-por-max-tokens]]"]
---

Pides «responde solo con JSON» y casi siempre funciona. Hasta que tu parser explota en producción con uno de estos errores (reales, de `json.loads` en Python; a la derecha, qué los provoca):

```text
JSONDecodeError('Expecting value: line 1 column 1 (char 0)')                          ← un bloque de código Markdown o «Aquí tienes el JSON:» delante
JSONDecodeError("Expecting ',' delimiter: line 1 column 50 (char 49)")                ← JSON cortado a medias
JSONDecodeError('Expecting property name enclosed in double quotes: line 1 column 2 (char 1)') ← comillas simples
```

O, peor, el JSON es válido pero no es el que esperabas: falta un campo, `total` llega como `"42,50 €"` o hay un importe negativo.

## Causas

- **Pides el formato en el prompt, sin salidas estructuradas.** El modelo obedece casi siempre, pero nada lo garantiza: un preámbulo, un bloque de código Markdown o una clave inventada bastan.
- **La respuesta se cortó.** `stop_reason: "max_tokens"` deja el JSON sin cerrar ([[problemas/respuesta-cortada-por-max-tokens]]). Con `refusal` puede no haber JSON.
- **El esquema usa algo que la API no aplica.** Las [[glosario/salida-estructurada|salidas estructuradas]] no admiten esquemas recursivos, `minimum`/`maximum` ni `minLength`/`maxLength`, y exigen `additionalProperties: false`. El formato queda garantizado; esas restricciones, no.
- **No validas.** Que el JSON sea sintácticamente válido no significa que cumpla tus reglas de negocio.

## Cómo confirmarlo

Guarda el texto crudo de las respuestas que fallan junto con su `stop_reason`. Si empiezan por texto o por tres comillas invertidas, es la primera causa; si acaban de golpe, la segunda. Si el JSON parsea pero tu código falla después, valida contra el esquema y mira qué campo rompe.

## Arreglo

Usa `output_config.format` con un esquema generado desde Pydantic, comprueba `stop_reason` y valida siempre. Si la validación falla, devuelve el error al modelo una vez:

```python title="extraer.py"
import anthropic
from pydantic import BaseModel, Field, ValidationError

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()


class Factura(BaseModel):
    numero: str
    total: float = Field(ge=0)   # la API no aplica minimum: lo valida Pydantic


ESQUEMA = anthropic.transform_schema(Factura)   # quita lo no soportado y lo pasa a description


def extraer(texto: str, intentos: int = 2) -> Factura:
    messages = [{"role": "user", "content": f"Extrae la factura:\n\n{texto}"}]
    for _ in range(intentos):
        resp = client.messages.create(
            model=MODEL, max_tokens=2048, messages=messages,
            output_config={"format": {"type": "json_schema", "schema": ESQUEMA}},
        )
        if resp.stop_reason != "end_turn":                 # max_tokens o refusal: el JSON no está completo
            raise RuntimeError(f"sin JSON completo: stop_reason={resp.stop_reason}")
        bruto = next(b.text for b in resp.content if b.type == "text")
        try:
            return Factura.model_validate_json(bruto)       # valida SIEMPRE, aunque el formato esté garantizado
        except ValidationError as e:
            messages += [
                {"role": "assistant", "content": resp.content},
                {"role": "user", "content": f"Ese JSON no pasa la validación:\n{e}\nCorrígelo."},
            ]
    raise ValueError("JSON inválido tras reintentar")
```

Lo comprobé con el SDK 2.3.0: `transform_schema` convierte `ge=0` en `"description": "{minimum: 0}"` y añade `"additionalProperties": false`, así que la API recibe un esquema que acepta y el modelo ve la restricción como texto. Con el simulador devolviendo primero `{"numero": "F-1", "total": -3}`, Pydantic lo rechaza (`Input should be greater than or equal to 0`), el error vuelve al modelo y el segundo intento pasa. Si no necesitas el reintento, `client.messages.parse(..., output_format=Factura)` hace lo mismo en una línea y deja el objeto en `.parsed_output`; ante un JSON que no valida lanza la `ValidationError`.

Si el JSON son los argumentos de una herramienta, pon `"strict": True` en su definición ([[docs/prompting/03-salida-estructurada]]). En modelos abiertos, usa el `format` de Ollama o el `response_format` de vLLM, y valida igual ([[docs/modelos-abiertos/01-ollama]]).

## Cómo evitarlo

- Nunca parsees sin mirar antes `stop_reason`.
- Genera el esquema desde tu modelo de datos, no lo escribas a mano en el prompt ([[modelos/03-formato-y-salidas-estructuradas]]).
- Las reglas que la API no aplica (rangos, longitudes, coherencia entre campos) van en tu validador.
- Un solo reintento con el error concreto. Si falla dos veces, el problema es el esquema o la entrada.
- Añade los casos que fallaron a tu conjunto de pruebas ([[roadmap/10-prompting/05-iterar-con-casos-de-prueba]]).

## Ver también

- [[roadmap/10-prompting/03-formato-de-salida]]
- [[recetas/extraer-facturas-a-json]]
- [[recetas/entregar-resultado-sin-forzar-herramienta]]
- [[sistemas/extraccion-documental]]
