---
titulo: Depurar un RAG en ocho preguntas
descripcion: El recorrido de diagnóstico de una respuesta mala de RAG, de la consulta a la generación, con qué mirar y cómo arreglar cada etapa, la matriz de síntomas y una traza de ejemplo.
creado: 2026-10-29
nivel: intermedio
minutos: 30
tema: rag
stack: ["Python"]
tags: [rag, depuracion, observabilidad, trazas]
relacionados: ["[[cursos/rag-a-fondo/01-anatomia-de-un-rag]]", "[[problemas/el-rag-no-encuentra-el-documento]]", "[[problemas/el-rag-encuentra-pero-responde-mal]]", "[[plantillas/checklist-de-rag]]"]
---

## Problema

Un usuario dice que el RAG «se lo ha inventado» o que «no encuentra nada». La tentación es tocar el prompt o cambiar de modelo. Casi nunca es lo primero que hay que mirar: **un RAG no se arregla siempre cambiando el LLM**, porque el modelo solo puede usar lo que le llega. Si el fragmento correcto no estaba en el contexto, ningún modelo lo salva.

Necesitas un recorrido fijo que vaya de la consulta a la respuesta y se pare en la primera etapa rota. Son ocho preguntas, siempre en el mismo orden.

## Ingredientes

- Una traza por consulta con, como mínimo: consulta buscada, modelo de embeddings, filtros, ids y puntuaciones de los candidatos, ids que llegaron al contexto (tras el reranking), modelo generador, respuesta, `stop_reason`, latencias y tokens. El esqueleto de [[cursos/rag-a-fondo/01-anatomia-de-un-rag]] la genera; con Langfuse la tienes en una interfaz ([[recetas/trazas-con-langfuse]]).
- Acceso al documento original, al texto extraído y a los fragmentos indexados.
- Para cada caso, la **evidencia**: la frase literal del documento que responde a la pregunta. Sin ella no puedes diagnosticar.

Cuidado con lo que guardas: la traza lleva preguntas y fragmentos que pueden contener datos personales. Registra lo necesario, con retención limitada ([[cursos/rag-a-fondo/07-permisos-y-multi-tenant]]).

## Pasos

1. **¿La consulta era correcta?** Compara la pregunta del usuario con la consulta que se buscó. Fallos típicos: una pregunta de seguimiento («¿y en ese caso?») buscada sin el historial, una reescritura que perdió un código o un nombre, filtros equivocados (idioma, versión, cliente). Arreglo: reescritura con el historial y comprobación de filtros ([[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]).
2. **¿El documento estaba indexado?** Busca la evidencia en la fuente y luego en la tabla de documentos del índice. Puede faltar el documento, estar la versión vieja o haber fallado la ingesta en silencio. Arreglo: sincronización incremental con registro de errores ([[recetas/reindexado-incremental]]).
3. **¿La extracción fue correcta?** Busca la evidencia en el texto extraído. PDF a dos columnas, tablas aplanadas, OCR malo o cabeceras repetidas rompen aquí ([[cursos/rag-a-fondo/06-el-corpus-manda]]).
4. **¿El chunking fue correcto?** ¿La evidencia está entera en un fragmento o partida entre dos? ¿El fragmento se entiende solo? Arreglo: troceado por estructura, [[recetas/chunks-padre-hijo]] o [[glosario/recuperacion-contextual|recuperación contextual]].
5. **¿El modelo de embeddings es apropiado?** Calcula la similitud entre la pregunta y el fragmento correcto y compárala con la de los que ganaron. Si gana un fragmento parecido en la forma pero equivocado (otro número, otro producto), o si el dominio tiene mucha jerga, el modelo no captura lo que importa. Arreglo: probar otro modelo con tus preguntas (no con la media de MTEB) o añadir BM25 ([[docs/modelos-abiertos/04-embeddings-y-rerankers]]).
6. **¿La recuperación lo devolvió?** ¿En qué posición de los candidatos está? Si no aparece en el top-50, el problema está en los pasos 1 a 5 o en el índice ANN (un `ef_search` bajo o un filtro muy selectivo, [[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]). Si fallan los identificadores exactos, falta búsqueda léxica ([[recetas/fusionar-rankings-con-rrf]]).
7. **¿El reranker lo mantuvo?** Estaba en los candidatos y no llegó al contexto: el reranker lo desplazó o el corte (top-5) es demasiado estrecho. Revisa qué ganó y por qué; a veces el reranker premia fragmentos largos y genéricos o recibe el texto recortado.
8. **¿El LLM usó el contexto?** Estaba en el contexto y la respuesta no lo usa, lo contradice o cita otra fuente. Ahora sí: orden de los fragmentos ([[glosario/lost-in-the-middle]]), instrucciones de abstención y de citas, contradicciones entre fuentes, o `stop_reason` distinto de `end_turn` ([[problemas/el-rag-encuentra-pero-responde-mal]]).

Los pasos 2 a 6 cubren el caso [[problemas/el-rag-no-encuentra-el-documento]]. Este script automatiza el recorrido sobre una traza y se para en el primer fallo:

```python title="diagnosticar.py"
import json
import re
import unicodedata


def norm(t: str) -> str:
    t = unicodedata.normalize("NFKD", t.lower())
    return re.sub(r"\s+", " ", "".join(c for c in t if not unicodedata.combining(c))).strip()


def diagnosticar(traza: dict, evidencia: str, fuente: str, original: str,
                 extraido: str, fragmentos: dict[str, str]) -> list[tuple[str, str]]:
    """Recorre las preguntas en orden y se para en la primera que falla.
    evidencia: frase literal que responde a la pregunta; fuente: documento donde está."""
    e = norm(evidencia)
    informe = [("1. consulta", f"se buscó: {traza['consulta_buscada']!r} (usuario: {traza['pregunta']!r})")]
    if e not in norm(original):
        return informe + [("2. indexado", f"FALLO: la frase no está en {fuente}: falta el documento o la versión")]
    if e not in norm(extraido):
        return informe + [("3. extracción", "FALLO: está en el original pero no en el texto extraído")]
    contienen = [i for i, t in fragmentos.items() if e in norm(t)]
    if not contienen:
        return informe + [("4. chunking", "FALLO: la frase queda partida entre fragmentos")]
    objetivo = contienen[0]
    informe.append(("2-4. ingesta", f"OK: la evidencia está entera en {objetivo}"))
    informe.append(("5. embeddings", f"modelo {traza['modelo_embeddings']}: compáralo con BM25 si falla el 6"))
    if objetivo not in traza["candidatos"]:
        return informe + [("6. recuperación", f"FALLO: {objetivo} no está en el top-{len(traza['candidatos'])}")]
    informe.append(("6. recuperación", f"OK: posición {traza['candidatos'].index(objetivo) + 1} de candidatos"))
    if objetivo not in traza["contexto"]:
        return informe + [("7. reranking", f"FALLO: {objetivo} se quedó fuera del contexto tras reordenar")]
    informe.append(("7. reranking", f"OK: posición {traza['contexto'].index(objetivo) + 1} en el contexto"))
    citas = re.findall(r"\[([\w.#§-]+)\]", traza["respuesta"])
    if objetivo not in citas:
        return informe + [("8. generación", f"FALLO: el modelo tenía {objetivo} y no lo usó (citó {citas})")]
    return informe + [("8. generación", "OK: respuesta apoyada en la evidencia")]


if __name__ == "__main__":
    traza = json.loads(open("traza.json", encoding="utf-8").read())
    fragmentos = {
        "teletrabajo.md#1": "Quién puede teletrabajar. El teletrabajo está disponible a partir del cuarto mes "
                            "en la empresa. Durante los tres primeros meses el trabajo es presencial.",
        "teletrabajo.md#2": "Días por semana. Se pueden teletrabajar hasta 3 días por semana.",
        "vacaciones.md#1": "Días disponibles. Cada empleado dispone de 23 días laborables de vacaciones al año.",
    }
    original = extraido = " ".join(fragmentos.values())
    for etapa, nota in diagnosticar(traza, "durante los tres primeros meses el trabajo es presencial",
                                    "teletrabajo.md", original, extraido, fragmentos):
        print(f"{etapa:<17} {nota}")
```

## Cómo comprobar que funciona

Con esta traza de ejemplo (datos inventados para la receta, con la forma de una traza real):

```json title="traza.json"
{
  "request_id": "abc123",
  "pregunta": "¿Puedo currar desde casa el primer mes?",
  "consulta_buscada": "¿Puedo currar desde casa el primer mes?",
  "modelo_embeddings": "bge-m3@ollama",
  "filtros": {"tenant_id": "acme", "idioma": "es"},
  "candidatos": ["vacaciones.md#1", "teletrabajo.md#2", "soporte.md#1", "teletrabajo.md#1"],
  "scores_candidatos": [0.61, 0.58, 0.55, 0.54],
  "contexto": ["vacaciones.md#1", "teletrabajo.md#2"],
  "scores_reranker": [0.41, 0.39],
  "modelo": "claude-sonnet-5-5",
  "respuesta": "Puedes teletrabajar hasta 3 días por semana [teletrabajo.md#2].",
  "stop_reason": "end_turn",
  "ms": {"embedding": 18, "busqueda": 9, "rerank": 140, "generacion": 1650},
  "tokens": {"entrada": 820, "salida": 31}
}
```

La salida real del script:

```text
1. consulta       se buscó: '¿Puedo currar desde casa el primer mes?' (usuario: '¿Puedo currar desde casa el primer mes?')
2-4. ingesta      OK: la evidencia está entera en teletrabajo.md#1
5. embeddings     modelo bge-m3@ollama: compáralo con BM25 si falla el 6
6. recuperación   OK: posición 4 de candidatos
7. reranking      FALLO: teletrabajo.md#1 se quedó fuera del contexto tras reordenar
```

La respuesta («hasta 3 días por semana») es falsa para alguien en su primer mes, y no es culpa del modelo: el fragmento que lo prohíbe llegó cuarto a los candidatos y el corte en dos lo dejó fuera. Hay dos arreglos baratos que probar con el banco de evaluación: subir el contexto a 4 o 5 fragmentos, o reescribir la consulta («teletrabajo durante los primeros meses») para que el fragmento suba. Cambiar de LLM no habría servido.

Cada caso que diagnostiques entra en tu conjunto de evaluación con su evidencia: así compruebas que el arreglo funciona y que no vuelve a romperse ([[cursos/rag-a-fondo/10-evaluar-un-rag]]).

## La matriz de diagnóstico

Cuando el problema es un patrón y no un caso, empieza por el síntoma:

| Síntoma | Dónde mirar primero |
|---|---|
| Nunca encuentra la información | indexación, embeddings, recuperación (pasos 2 a 6) |
| Encuentra cosas irrelevantes | chunking, modelo de embeddings, consulta |
| Encuentra el documento correcto pero no lo usa | prompt, orden del contexto, modelo (paso 8) |
| Respuesta correcta pero imprecisa | contexto insuficiente: fragmento partido o corte demasiado estrecho |
| Respuestas muy largas o divagantes | demasiado contexto |
| Fallan los identificadores exactos | falta búsqueda léxica (BM25) |
| Dominan los documentos antiguos | metadatos de vigencia y versionado |
| Aparece información de otro usuario o cliente | permisos y filtros en la recuperación, no en el prompt |
| Mucha latencia | demasiadas etapas, reranking sobre demasiados candidatos, generación |
| Coste alto | tokens de contexto, llamadas extra por consulta |

Las dos filas de seguridad no se depuran: se paran. Una fuga entre clientes es un incidente ([[cursos/rag-a-fondo/07-permisos-y-multi-tenant]]).

## Variaciones

- **Por lotes.** Ejecuta `diagnosticar` sobre todos los casos fallidos del banco y cuenta en qué etapa se para cada uno. Ataca primero la etapa con más fallos.
- **Con un juez.** El paso 8 por código solo mira citas. Para saber si la respuesta está apoyada en el contexto, añade un [[glosario/modelo-juez|modelo juez]] de [[glosario/fidelidad|fidelidad]], validado contra tus etiquetas ([[recetas/validar-un-modelo-juez]]).
- **Lista para el equipo.** Las ocho preguntas, junto con el resto de decisiones de diseño, están en [[plantillas/checklist-de-rag]].

## Errores típicos

- **Empezar por el final.** Reescribir el prompt cuando el fragmento nunca llegó.
- **Diagnosticar sin evidencia.** «Debería saberlo» no es un criterio; la frase literal del documento sí.
- **Trazas sin candidatos.** Si solo guardas el contexto final, no distingues un fallo de recuperación de uno de reranking.
- **Arreglar un caso y no medir.** Un cambio que arregla una pregunta puede romper otras diez. Pasa el banco entero.
- **Registrar todo para siempre.** Las trazas son datos sensibles: limita qué guardas y cuánto tiempo.
