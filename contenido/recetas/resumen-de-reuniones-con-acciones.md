---
titulo: Resumen de reuniones con acciones y responsables
descripcion: Convierte la transcripción de una reunión en un JSON con resumen, decisiones y acciones con responsable, fecha y la cita que las respalda, y comprueba cada acción en código.
creado: 2026-10-15
actualizado: 2026-10-29
nivel: inicial
minutos: 20
tema: prompting
stack: [python, anthropic, pydantic]
tags: [resumen, salida-estructurada, productividad]
relacionados: ["[[recetas/extraer-facturas-a-json]]", "[[docs/prompting/03-salida-estructurada]]", "[[modelos/07-documentos-largos]]", "[[glosario/grounding]]"]
---

## Problema

Después de cada reunión, alguien tiene que repasar la grabación y escribir quién se comprometió a qué. Un resumen en prosa no sirve para eso: quieres una lista de acciones que puedas meter en tu gestor de tareas, cada una con su responsable y su fecha.

El riesgo de pedírselo a un modelo es que rellene huecos: asignar una tarea a alguien que no la asumió o inventar un plazo que nadie dijo. La receta lo ataca por dos lados: reglas claras en el prompt y una **cita literal** por acción que tu código comprueba contra la transcripción ([[glosario/grounding|grounding]]).

## Ingredientes

- Python 3.10 o superior.
- `pip install "anthropic>=2" pydantic` (SDK 2.x).
- La variable de entorno `ANTHROPIC_API_KEY`.
- Una transcripción con el nombre de quien habla en cada intervención (`reunion.txt`) y la lista de asistentes.

## Pasos

1. **Define la estructura de salida.** Cada acción lleva `responsable` y `fecha_limite` que pueden ser `null`. Hacerlos opcionales es lo que permite al modelo decir «nadie la asumió» en vez de inventar.

2. **Escribe reglas explícitas.** Qué cuenta como acción y qué es solo una idea, cómo resolver fechas relativas («el jueves») con la fecha de la reunión, y que la cita sea literal.

3. **Comprueba en código lo que el esquema no puede.** Que el responsable esté entre los asistentes, que la cita aparezca en la transcripción y que la fecha no sea anterior a la reunión. Lo que falle se marca para revisión.

```python title="reunion.py"
import re
import sys
from datetime import date

import anthropic
from pydantic import BaseModel, Field

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()


class Accion(BaseModel):
    tarea: str = Field(description="Qué hay que hacer, empezando por un verbo")
    responsable: str | None = Field(description="Nombre exacto de un asistente, o null si nadie la asumió")
    fecha_limite: date | None = Field(description="Solo si se dijo una fecha; si no, null")
    cita: str = Field(description="Frase literal de la transcripción donde se acordó")


class Resumen(BaseModel):
    resumen: str = Field(description="Tres o cuatro frases")
    decisiones: list[str]
    acciones: list[Accion]
    temas_abiertos: list[str]


SISTEMA = """Resumes reuniones de trabajo a partir de su transcripción.
Reglas:
- Una acción es algo que alguien se comprometió a hacer. Las ideas sin dueño van a temas_abiertos.
- responsable: el nombre tal como aparece en la lista de asistentes. Si nadie la asumió, null.
- fecha_limite: solo si se dijo explícitamente. Convierte expresiones como "el viernes" usando la
  fecha de la reunión. Si no hay fecha, null. No inventes plazos.
- cita: copia literalmente la frase de la transcripción que respalda la acción."""


def _normalizar(t: str) -> str:
    return re.sub(r"\s+", " ", t).strip().lower()


def resumir(transcripcion: str, asistentes: list[str], fecha: date) -> tuple[Resumen, list[str]]:
    resp = client.messages.parse(
        model=MODEL,
        max_tokens=4096,
        system=SISTEMA,
        messages=[{
            "role": "user",
            "content": f"Fecha de la reunión: {fecha.isoformat()}\n"
                       f"Asistentes: {', '.join(asistentes)}\n\n"
                       f"<transcripcion>\n{transcripcion}\n</transcripcion>",
        }],
        output_format=Resumen,
    )
    if resp.stop_reason != "end_turn":
        raise RuntimeError(f"Respuesta incompleta: {resp.stop_reason}")
    resumen = resp.parsed_output

    # comprobaciones que el esquema no puede hacer
    avisos = []
    texto = _normalizar(transcripcion)
    for a in resumen.acciones:
        if a.responsable is not None and a.responsable not in asistentes:
            avisos.append(f"'{a.tarea}': responsable '{a.responsable}' no está entre los asistentes")
        if _normalizar(a.cita) not in texto:
            avisos.append(f"'{a.tarea}': la cita no aparece en la transcripción")
        if a.fecha_limite and a.fecha_limite < fecha:
            avisos.append(f"'{a.tarea}': fecha límite anterior a la reunión")
    return resumen, avisos


if __name__ == "__main__":
    transcripcion = open(sys.argv[1], encoding="utf-8").read()
    resumen, avisos = resumir(transcripcion, ["Marta", "Luis", "Irene"], date(2026, 10, 19))
    print(resumen.model_dump_json(indent=2))
    for a in avisos:
        print("REVISAR:", a, file=sys.stderr)
```

4. **Prueba con una transcripción corta:**

```text title="reunion.txt"
Marta: Repasamos el lanzamiento. La landing sigue sin textos definitivos.
Luis: Yo me encargo de los textos, los tengo el jueves.
Irene: Habría que revisar los precios con finanzas en algún momento.
Marta: Vale. Decidimos lanzar el 3 de noviembre si los textos llegan a tiempo.
Irene: Yo preparo la campaña de correo para esa semana.
```

Ejecuta `python reunion.py reunion.txt`.

## Cómo comprobar que funciona

```text
# salida de ejemplo
{
  "resumen": "Se revisó el estado del lanzamiento...",
  "decisiones": ["Lanzar el 3 de noviembre si los textos llegan a tiempo"],
  "acciones": [
    {"tarea": "Escribir los textos de la landing", "responsable": "Luis",
     "fecha_limite": "2026-10-22", "cita": "Yo me encargo de los textos, los tengo el jueves."},
    {"tarea": "Preparar la campaña de correo", "responsable": "Irene",
     "fecha_limite": null, "cita": "Yo preparo la campaña de correo para esa semana."}
  ],
  "temas_abiertos": ["Revisar los precios con finanzas"]
}
```

- «El jueves» se resuelve a `2026-10-22`, porque la reunión fue el lunes 19.
- «Revisar los precios» va a `temas_abiertos`: nadie lo asumió.
- La campaña de Irene no tiene fecha concreta, así que `fecha_limite` es `null`.
- Si aparece alguna línea `REVISAR:` en stderr, mira esa acción a mano antes de crear la tarea.
- Para medir: resume 10 reuniones, anota a mano las acciones correctas y cuenta las que faltan y las inventadas ([[disciplinas/evals]]).

## Variaciones

- **Responsable como `enum`.** Construye el modelo en tiempo de ejecución con los asistentes de cada reunión: `create_model("Accion", responsable=(Literal[tuple(asistentes)] | None, ...), ...)`. Así el esquema impide nombres fuera de la lista.
- **Reuniones largas.** Para transcripciones de horas, pon la transcripción al principio y las instrucciones al final, o trocea por bloques de tiempo y fusiona las acciones ([[modelos/07-documentos-largos]]).
- **Enviar las tareas.** Crea las tareas en tu gestor con una herramienta, y pide confirmación antes de asignarlas a otras personas ([[recetas/aprobacion-humana-antes-de-actuar]]).
- **Con LangChain.** El mismo modelo `Resumen` sirve con `with_structured_output`. Pasa siempre `method="json_schema"`: así LangChain envía el esquema en `output_config.format`. Sin ese argumento, `ChatAnthropic` fuerza una herramienta con `tool_choice`, y eso da 400 en Opus 5.5 y Sonnet 5.5. Las comprobaciones de la cita y del responsable siguen siendo tuyas.

```python title="reunion_langchain.py"
from datetime import date

from langchain.chat_models import init_chat_model

from reunion import SISTEMA, Resumen

MODEL = "anthropic:claude-sonnet-5-5"

# method="json_schema" usa output_config.format; sin él, LangChain fuerza una herramienta (400 en los 5.5)
llm = init_chat_model(MODEL, max_tokens=4096).with_structured_output(Resumen, method="json_schema")


def resumir_lc(transcripcion: str, asistentes: list[str], fecha: date) -> Resumen:
    return llm.invoke([
        ("system", SISTEMA),
        ("user", f"Fecha de la reunión: {fecha.isoformat()}\nAsistentes: {', '.join(asistentes)}\n\n"
                 f"<transcripcion>\n{transcripcion}\n</transcripcion>"),
    ])
```

- **Sin nombres en la transcripción.** Si solo tienes «Hablante 1, Hablante 2», pide que el responsable sea ese identificador y mapea a personas después.

## Errores típicos

- **Campos obligatorios para todo.** Si `responsable` no admite `null`, el modelo pondrá un nombre aunque nadie se comprometiera.
- **Fechas relativas sin fecha de referencia.** Sin decirle cuándo fue la reunión, «el viernes» no se puede resolver bien.
- **Confundir intención con compromiso.** «Habría que…» no es una acción con dueño. Dilo en las reglas y pon un ejemplo.
- **No verificar la cita.** Si no compruebas que la cita existe, pierdes la única forma barata de detectar acciones inventadas.
- **Crear tareas sin revisión** cuando hay avisos. Una tarea asignada a la persona equivocada genera más trabajo que no tenerla.
