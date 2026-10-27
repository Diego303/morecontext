---
titulo: Encadenado de prompts
descripcion: Divide una tarea en pasos fijos, cada uno una llamada al modelo que recibe la salida del anterior, con comprobaciones en código entre ellos.
creado: 2026-07-15
tags: [patrones, workflows, prompting]
aliases: [Prompt chaining, Cadena de prompts]
orden: 3
tipo: workflow
coste: 2
latencia: 2
cuandoUsar: Cuando la tarea se descompone limpiamente en pasos fijos y conocidos de antemano.
cuandoNo: Si no puedes escribir los pasos antes de ver la entrada, o si una sola llamada ya acierta.
relacionados: ["[[glosario/workflow]]", "[[patrones/04-enrutado]]", "[[roadmap/10-prompting/03-formato-de-salida]]", "[[recetas/resumen-de-reuniones-con-acciones]]"]
---

El **encadenado de prompts** convierte una tarea grande en una secuencia de llamadas pequeñas: cada una procesa la salida de la anterior y hace una sola cosa. Entre paso y paso puedes meter **comprobaciones programáticas** (el artículo las llama *gates*, puertas) que detienen o corrigen el flujo antes de que un error se propague. Es el [[glosario/workflow|workflow]] más simple de *Building effective agents* ([Anthropic, 2024](https://www.anthropic.com/engineering/building-effective-agents)) y, a menudo, el que más rinde.

## Qué es

Cambias latencia por precisión. Cada llamada recibe una tarea más estrecha, con su propio *prompt* y sus propios ejemplos, y eso la hace más fácil de acertar y de probar por separado. El orden de los pasos lo fija tu código: el modelo nunca decide qué viene después.

```mermaid
flowchart LR
  E[Entrada] --> P1[LLM: paso 1]
  P1 --> G{Puerta}
  G -- pasa --> P2[LLM: paso 2]
  G -- falla --> X[Corregir o parar]
  P2 --> P3[LLM: paso 3]
  P3 --> S[Salida]
```

## Cuándo usarlo

- La tarea tiene **fases naturales** que podrías describir a una persona: extraer, luego transformar, luego redactar.
- Una sola llamada mezcla objetivos y falla en alguno. Por ejemplo, escribe bien pero se salta requisitos de formato.
- Quieres **puntos de control** donde validar con código: que el JSON sea válido, que el esquema tenga los apartados exigidos, que una cifra cuadre.

Ejemplos del artículo: generar un texto de marketing y después traducirlo; escribir el esquema de un documento, comprobar que cumple los criterios y redactar el documento a partir del esquema.

## Cuándo no

- **Pasos que dependen de la entrada**. Si para unos casos hacen falta tres pasos y para otros siete distintos, necesitas [[patrones/06-orquestador-trabajadores]] o un [[patrones/08-agente-autonomo|agente]].
- **Pasos independientes entre sí**. Si el paso 2 no usa la salida del 1, lánzalos en paralelo: [[patrones/05-paralelizacion]].
- **Cadenas largas sin medir**. Cada eslabón suma latencia y una probabilidad de fallo. Si no tienes [[glosario/evals|evals]] por paso, no sabrás cuál rompe la cadena.

## Ejemplo concreto

Convertir la transcripción de una reunión en un acta con tareas asignadas:

1. **Extraer**: el modelo lista decisiones y tareas con su responsable, en JSON.
2. **Puerta**: el código valida el JSON y comprueba que cada responsable aparece en la lista de asistentes. Si falla, reintenta el paso 1 con el error como contexto.
3. **Redactar**: el modelo escribe el acta en el formato de la empresa a partir del JSON validado, sin volver a leer la transcripción.

Separar extracción y redacción tiene una ventaja concreta: puedes evaluar la extracción con código (¿están todas las tareas?) y la redacción con un [[glosario/modelo-juez|modelo juez]]. Tienes la receta completa en [[recetas/resumen-de-reuniones-con-acciones]].

## Esqueleto de código

```python title="encadenado.py"
import json
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

def llm(prompt: str, system: str | None = None, max_tokens: int = 2048) -> str:
    extra = {"system": system} if system else {}
    resp = client.messages.create(model=MODEL, max_tokens=max_tokens,
                                  messages=[{"role": "user", "content": prompt}], **extra)
    if resp.stop_reason == "max_tokens":
        raise RuntimeError("Respuesta truncada: sube max_tokens o acorta el paso")
    return "".join(b.text for b in resp.content if b.type == "text")

def extraer(transcripcion: str, error_previo: str = "") -> dict:
    aviso = f"\nEl intento anterior falló: {error_previo}. Corrígelo." if error_previo else ""
    salida = llm(
        "Extrae decisiones y tareas de esta reunión. Devuelve solo JSON con la forma "
        '{"decisiones": [str], "tareas": [{"tarea": str, "responsable": str}]}.'
        f"{aviso}\n<transcripcion>\n{transcripcion}\n</transcripcion>"
    )
    return json.loads(salida)

def puerta(datos: dict, asistentes: set[str]) -> str | None:
    """Devuelve None si todo está bien, o el motivo del fallo."""
    for t in datos.get("tareas", []):
        if t["responsable"] not in asistentes:
            return f"'{t['responsable']}' no está entre los asistentes {sorted(asistentes)}"
    return None

def acta(transcripcion: str, asistentes: set[str], reintentos: int = 2) -> str:
    error = ""
    for _ in range(reintentos + 1):
        try:
            datos = extraer(transcripcion, error)
        except json.JSONDecodeError as e:
            error = f"JSON inválido ({e})"
            continue
        error = puerta(datos, asistentes)
        if error is None:
            break
    else:
        raise ValueError(f"La extracción no pasa la puerta: {error}")
    return llm(
        "Redacta el acta en Markdown con secciones Decisiones y Tareas a partir de estos datos. "
        f"No añadas nada que no esté en ellos.\n{json.dumps(datos, ensure_ascii=False)}"
    )
```

Para asegurar el JSON sin reintentos puedes usar salidas estructuradas con esquema; lo explica [[docs/prompting/03-salida-estructurada]]. Aun así, la puerta con reglas de negocio sigue siendo tuya.

> [!consejo] Cada eslabón, su propio test
> Guarda entradas y salidas intermedias. Cuando la salida final falla, mirar qué devolvió cada paso te dice en segundos qué eslabón arreglar.

## Coste y latencia

Coste medio: tantas llamadas como pasos, aunque cada una suele ser más corta que una llamada única que lo hiciera todo. La latencia se suma en serie, y eso es lo que más se nota: tres pasos son tres esperas. Para recortarla, usa un modelo más rápido en los pasos sencillos (consulta [[modelos/05-elegir-modelo-por-tarea]]) y haz *streaming* solo del último paso, que es el que ve el usuario.

## Patrones relacionados

- [[patrones/04-enrutado]]: elige qué cadena ejecutar según la entrada.
- [[patrones/05-paralelizacion]]: cuando los pasos no dependen unos de otros.
- [[patrones/07-evaluador-optimizador]]: una puerta que, en lugar de validar con código, critica con un modelo y pide mejoras.
- [[sistemas/extraccion-documental]]: un encadenado de extracción y validación en producción.
