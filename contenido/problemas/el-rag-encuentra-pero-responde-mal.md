---
titulo: El RAG recupera bien pero responde mal
descripcion: Por qué el modelo se equivoca con los fragmentos correctos delante y cómo ordenar el contexto, recortarlo y pedir citas y abstención para que responda con lo que recuperaste.
creado: 2026-10-29
sintoma: El RAG recupera bien pero responde mal
tema: rag
nivel: intermedio
tags: [rag, prompting, citas, contexto]
relacionados: ["[[roadmap/30-contexto-y-rag/05-respuestas-con-citas]]", "[[problemas/el-rag-no-encuentra-el-documento]]", "[[glosario/lost-in-the-middle]]", "[[glosario/fidelidad]]"]
---

Miras la traza y el fragmento correcto está ahí, entre los recuperados. Aun así, la respuesta dice «22 días» cuando el convenio vigente dice 23, mezcla dos políticas, añade un dato que no aparece en ningún documento o dice «no lo encuentro» teniendo la respuesta delante. La recuperación funciona; la generación, no.

## Causas

- **Demasiado contexto.** Veinte fragmentos donde bastaban cinco. Cuanto más texto, más fácil que el modelo atienda al que no es: con contextos largos el rendimiento baja aunque la información esté ([[glosario/context-rot]]).
- **El bueno, en medio.** Los modelos aprovechan peor lo que está en el centro de un contexto largo que lo que está al principio o al final ([[biblioteca/lost-in-the-middle]]).
- **Sin instrucción de citar ni de abstenerse.** Si no le dices que responda solo con los documentos, completa con lo que sabe. Si no le dices qué hacer cuando no está, inventa o se rinde a medias.
- **Documentos que se contradicen.** La versión de 2024 y la de 2026 del mismo procedimiento, sin fecha visible. El modelo elige una, o las mezcla.
- **Fragmentos sin identidad.** Texto pegado sin fuente ni separadores: el modelo no puede citar y tú no puedes comprobar.
- **Duplicados.** El mismo párrafo tres veces (de tres versiones del archivo) pesa más que el correcto.

## Cómo confirmarlo

Guarda el prompt exacto que recibió el modelo, no solo los ids recuperados. Comprueba cuántos fragmentos hay, en qué posición está el bueno, si hay fechas y fuentes, y si las instrucciones dicen qué hacer cuando falta la respuesta. Luego mide la [[glosario/fidelidad|fidelidad]]: si las afirmaciones de la respuesta no se apoyan en los fragmentos, es generación ([[cursos/rag-a-fondo/10-evaluar-un-rag]]).

## Arreglo

Construye el mensaje con pocos fragmentos, ordenados, sin duplicados, con id, fuente y fecha, y la pregunta al final. Pon las reglas de citar, abstenerse y resolver contradicciones en el `system`:

```python title="responder.py"
import anthropic

MODEL = "claude-sonnet-5-5"
MAX_FRAGMENTOS = 6
client = anthropic.Anthropic()

SYSTEM = """Respondes preguntas sobre la documentación interna usando SOLO los documentos que te doy.
- Cita el id de cada documento que uses, así: [doc-3].
- Si los documentos no contienen la respuesta, di «No lo encuentro en la documentación» y no completes con lo que sepas.
- Si dos documentos se contradicen, dilo y da prioridad al de fecha más reciente."""


def construir_mensaje(pregunta: str, fragmentos: list[dict]) -> str:
    vistos, elegidos = set(), []
    for f in sorted(fragmentos, key=lambda f: f["score"], reverse=True):   # de más a menos relevante
        if f["texto"] not in vistos:                                          # fuera duplicados
            vistos.add(f["texto"])
            elegidos.append(f)
    docs = "\n".join(
        f'<documento id="{f["id"]}" fuente="{f["fuente"]}" fecha="{f["fecha"]}">\n{f["texto"]}\n</documento>'
        for f in elegidos[:MAX_FRAGMENTOS]
    )
    return f"<documentos>\n{docs}\n</documentos>\n\nPregunta: {pregunta}"   # la pregunta, al final


def responder(pregunta: str, fragmentos: list[dict]) -> str:
    resp = client.messages.create(
        model=MODEL, max_tokens=1024, system=SYSTEM,
        messages=[{"role": "user", "content": construir_mensaje(pregunta, fragmentos)}],
    )
    return "".join(b.text for b in resp.content if b.type == "text")
```

Con tres fragmentos (el convenio de 2026 duplicado y la política de 2024), el mensaje que se envía, comprobado con el simulador de la API, queda así:

```text
<documentos>
<documento id="doc-2" fuente="convenio-2026.pdf" fecha="2026-02-01">
23 días laborables.
</documento>
<documento id="doc-1" fuente="vacaciones-2024.pdf" fecha="2024-01-10">
22 días laborables.
</documento>
</documentos>

Pregunta: ¿Cuántos días de vacaciones tengo?
```

Para citas que la API valida contra el texto, en lugar de ids en el texto libre, usa los bloques `document` o `search_result` con citas activadas ([[roadmap/30-contexto-y-rag/05-respuestas-con-citas]]). Ten en cuenta que las citas son incompatibles con las salidas estructuradas.

## Cómo evitarlo

- Recupera muchos y pasa pocos: [[glosario/reranking]] sobre 30–50 y quédate con 5–8 ([[roadmap/30-contexto-y-rag/04-reranking]]).
- Deduplica y versiona el corpus: retira lo obsoleto o márcalo con fecha al indexar ([[cursos/rag-a-fondo/08-mantener-el-indice]]).
- Incluye en tus evals preguntas sin respuesta en el corpus: el comportamiento correcto es abstenerse.
- Mide recuperación y generación por separado. Un modelo juez con rúbrica sirve para la fidelidad ([[recetas/modelo-juez-con-rubrica]]).

## Ver también

- [[sistemas/rag-con-citas]]
- [[recetas/depurar-un-rag]]
- [[modelos/07-documentos-largos]]
- [[docs/contexto/03-rag]]
