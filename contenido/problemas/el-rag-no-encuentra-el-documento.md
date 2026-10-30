---
titulo: El RAG no encuentra el documento que existe
descripcion: Diagnóstico por pasos cuando tu RAG responde «no lo sé» con el documento en el corpus, de la ingesta al filtro, con un script que dice en qué etapa se pierde.
creado: 2026-10-29
sintoma: El RAG no encuentra el documento que existe
tema: rag
nivel: intermedio
tags: [rag, recuperacion, chunking, diagnostico]
relacionados: ["[[recetas/depurar-un-rag]]", "[[cursos/rag-a-fondo/03-recuperar-bien]]", "[[problemas/el-rag-encuentra-pero-responde-mal]]", "[[glosario/recall-at-k]]"]
---

Preguntas «¿cuántos días de vacaciones tengo?» y el asistente contesta «No encuentro esa información en la documentación». Pero sabes que el convenio está indexado y que el artículo 12 lo dice con todas las letras. No hay error: la búsqueda devuelve cinco fragmentos, todos razonables y ninguno el bueno.

## Causas

El documento puede perderse en cualquiera de estas etapas, y cada una tiene un arreglo distinto:

1. **No llegó al índice.** La ingesta falló en silencio: formato no soportado, un PDF protegido, una excepción tragada, permisos de lectura.
2. **Llegó sin texto.** Un PDF escaneado sin OCR, tablas convertidas en ruido o texto en imágenes ([[cursos/rag-a-fondo/06-el-corpus-manda]]).
3. **El [[glosario/chunking|troceado]] partió la respuesta.** «23 días» quedó en un chunk y «permiso anual» en otro, o el chunk es tan grande que su *embedding* se diluye.
4. **La consulta no se parece al texto.** El usuario dice «vacaciones» y el documento, «permiso anual retribuido». El chunk correcto existe, pero sale en la posición 9 y tu `k` es 5.
5. **El modelo de *embeddings* no sirve para tu corpus.** Entrenado sobre todo en inglés, o distinto del que usaste al indexar (vectores incomparables).
6. **Un filtro lo excluye.** Metadatos mal puestos (`area: "RRHH"` frente a `"rrhh"`), un filtro de permisos o de fecha demasiado estricto.

## Cómo confirmarlo

Elige una pregunta que falla, el documento que debería salir y una frase literal de la respuesta. Después recorre las etapas en orden con este script, que solo necesita acceso a tus chunks y a tu función de búsqueda:

```python title="diagnosticar.py"
def diagnosticar(consulta: str, doc_id: str, frase: str, chunks: list[dict], buscar, k: int = 5) -> str:
    """Recorre el camino del documento hasta la respuesta y dice dónde se pierde.

    chunks: lo que hay en el índice ({"doc_id", "texto", "meta"}).
    buscar(consulta, k, filtros) -> lista ordenada de chunks.
    frase: un trozo literal de la respuesta que esperas encontrar.
    """
    suyos = [c for c in chunks if c["doc_id"] == doc_id]
    if not suyos:
        return "1. El documento no está en el índice: revisa la ingesta (formato, errores silenciosos, permisos)."
    if sum(len(c["texto"].strip()) for c in suyos) < 200:
        return "2. Está indexado pero casi sin texto: la extracción falló (PDF escaneado, tablas, imágenes)."
    con_frase = [c for c in suyos if frase.lower() in c["texto"].lower()]
    if not con_frase:
        return "3. Ningún chunk contiene la respuesta entera: el troceado la partió; revisa tamaño y solapamiento."
    todo = buscar(consulta, k=len(chunks), filtros=None)
    pos = next(i for i, c in enumerate(todo) if c in con_frase) + 1
    if pos > k:
        return (f"4. El chunk correcto sale en la posición {pos} de {len(todo)} (k={k}): la consulta no se parece "
                "al texto. Prueba búsqueda híbrida, reescritura de la consulta o reranking sobre un k mayor.")
    if con_frase[0] not in buscar(consulta, k=k, filtros=con_frase[0]["meta"]):
        return "6. Sin filtros aparece y con filtros no: revisa los metadatos y el filtro."
    return f"OK. Recuperación correcta (posición {pos}): el fallo está en la generación."
```

Lo probé con un corpus de juguete y BM25 (`rank-bm25`), para que sea reproducible sin modelo de *embeddings*. Con la consulta del usuario y con la del propio texto:

```text
4. El chunk correcto sale en la posición 9 de 11 (k=5): la consulta no se parece al texto. Prueba búsqueda híbrida, reescritura de la consulta o reranking sobre un k mayor.
OK. Recuperación correcta (posición 1): el fallo está en la generación.
```

Con *embeddings*, la etapa 4 cubre también la causa 5: si el chunk sale lejos incluso con una consulta parecida al texto, prueba otro modelo y comprueba que indexas y consultas con el mismo. Si sale «OK», tu problema es otro: [[problemas/el-rag-encuentra-pero-responde-mal]].

## Arreglo

| Etapa | Arreglo |
|---|---|
| 1–2 Ingesta | Registra cada documento procesado y cuántos caracteres salieron; OCR o un extractor de PDF a Markdown ([[recetas/pdf-a-markdown-con-docling]]) |
| 3 Troceado | Corta por estructura (títulos, artículos) con solapamiento ([[recetas/trocear-documentos]]) o chunks padre-hijo ([[recetas/chunks-padre-hijo]]) |
| 4 Consulta | Búsqueda híbrida con BM25 ([[recetas/busqueda-hibrida-con-bm25]]), [[glosario/reescritura-de-consulta]], recuperar 30–50 y [[glosario/reranking]] |
| 5 Embeddings | Modelo multilingüe que funcione en tu corpus ([[docs/modelos-abiertos/04-embeddings-y-rerankers]]); el mismo al indexar y al consultar |
| 6 Filtros | Normaliza metadatos al indexar; prueba siempre con y sin filtro ([[cursos/rag-a-fondo/07-permisos-y-multi-tenant]]) |

## Cómo evitarlo

- Ten un conjunto de 30–50 preguntas con su documento esperado y mide el [[glosario/recall-at-k]] en cada cambio de ingesta, troceado o modelo ([[cursos/rag-a-fondo/10-evaluar-un-rag]]).
- Guarda las preguntas reales que acabaron en «no lo sé» y revísalas cada semana.
- Al reindexar, compara el número de documentos y chunks con la vez anterior ([[recetas/reindexado-incremental]]).

## Ver también

- [[recetas/depurar-un-rag]]
- [[cursos/rag-a-fondo/02-indexar-bien]]
- [[roadmap/30-contexto-y-rag/03-busqueda-hibrida]]
- [[plantillas/checklist-de-rag]]
