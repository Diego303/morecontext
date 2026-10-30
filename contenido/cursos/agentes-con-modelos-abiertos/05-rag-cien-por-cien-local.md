---
titulo: Un RAG 100 % local
descripcion: Construye un RAG que no sale de tu máquina con embeddings abiertos en Ollama, pgvector en Docker, búsqueda híbrida con RRF en SQL, citas comprobadas y una evaluación mínima de recall.
creado: 2026-10-29
orden: 5
minutos: 45
tipo: proyecto
objetivos:
  - Indexar documentos en pgvector con embeddings de un modelo abierto servido por Ollama.
  - Recuperar con búsqueda híbrida (vectorial más tsvector en español) fusionada con RRF en una sola consulta SQL.
  - Generar con un modelo local, comprobar en código que las citas existen y medir recall@k con un conjunto de preguntas propio.
requiere: ["[[cursos/agentes-con-modelos-abiertos/02-tu-primer-modelo-en-local]]", "[[roadmap/30-contexto-y-rag/03-busqueda-hibrida]]"]
relacionados: ["[[recetas/rag-local-con-pgvector]]", "[[docs/modelos-abiertos/05-bases-vectoriales]]", "[[docs/modelos-abiertos/04-embeddings-y-rerankers]]", "[[herramientas/pgvector]]"]
tags: [rag, pgvector, embeddings, ollama, local]
---

En esta lección construyes un [[glosario/rag|RAG]] completo en el que ni los documentos, ni las preguntas, ni los vectores salen de tu máquina. Al terminar tendrás un módulo de unas 70 líneas que indexa, busca de forma híbrida, responde con citas y se evalúa con recall@k. Es la herramienta de búsqueda que usará el [[sistemas/asistente-100-local|asistente 100 % local]].

## La idea

Un RAG tiene tres modelos o motores, y en la versión local los tres son abiertos:

| Pieza | Aquí | Alternativas abiertas |
|---|---|---|
| Modelo de [[glosario/embeddings|embeddings]] | `qwen3-embedding:0.6b` en Ollama | `bge-m3`, `embeddinggemma`, `nomic-embed-text` (todos en la biblioteca de Ollama) |
| Base vectorial | [[herramientas/pgvector|pgvector]] 0.8.7 en un Postgres en Docker | [[herramientas/qdrant|Qdrant]], LanceDB, Chroma |
| Modelo generador | `qwen3.6:27b` en Ollama | Cualquiera de la lección 2 que quepa en tu máquina |

Elegimos pgvector porque, si ya tienes Postgres, es un sistema menos que operar: transacciones, copias de seguridad y permisos de siempre. Y porque permite la [[glosario/busqueda-hibrida|búsqueda híbrida]] en una sola consulta SQL: similitud vectorial más búsqueda léxica con `tsvector('spanish')`, fusionadas con [[glosario/rrf|RRF]].

```mermaid
flowchart LR
  D[Documentos] --> T[Trocear con ids]
  T --> E[Embeddings en Ollama]
  E --> P[(pgvector + tsvector)]
  Q[Pregunta] --> H[Híbrida + RRF en SQL]
  P --> H
  H --> G[Modelo local con citas]
  G --> V[Comprobar citas]
```

> [!aviso] Las licencias de los embeddings también cuentan
> La revisión de octubre de 2026 no pudo confirmar en la *model card* la licencia de varios modelos de embeddings (Qwen3-Embedding, bge-m3, EmbeddingGemma, nomic). Algunas familias han usado licencias no comerciales en el pasado. Lee el `LICENSE` del modelo que elijas antes de indexar datos de clientes.

## Paso 1: levantar Postgres con pgvector y los modelos

La imagen oficial de pgvector trae Postgres con la extensión instalada (consulta la etiqueta vigente en el README de pgvector). Estos comandos no se han ejecutado en el entorno de prueba de esta web, que no tiene Docker ni Ollama; el código Python sí, contra pgvector 0.8.7 real (PGlite con PostgreSQL 18.6) y un servidor que imita la API de Ollama.

```bash
docker run -d --name rag-db -e POSTGRES_PASSWORD=local -p 5432:5432 pgvector/pgvector:pg18
ollama pull qwen3-embedding:0.6b
ollama pull qwen3.6:27b
pip install psycopg pgvector numpy ollama
```

## Paso 2: el módulo completo

Todo el RAG cabe en un archivo. Léelo de arriba abajo: conexión, tabla, troceado, indexado, búsqueda híbrida y respuesta.

```python title="rag_local.py"
import re
import numpy as np
import psycopg
from ollama import chat, embed
from pgvector.psycopg import register_vector

LLM = "qwen3.6:27b"
EMBED_MODEL = "qwen3-embedding:0.6b"
DSN = "postgresql://postgres:local@localhost:5432/postgres"   # el contenedor de Docker

def embed_textos(textos: list[str]) -> list[np.ndarray]:
    return [np.array(v, dtype=np.float32) for v in embed(model=EMBED_MODEL, input=textos).embeddings]

def conectar() -> psycopg.Connection:
    conn = psycopg.connect(DSN, autocommit=True)
    conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
    register_vector(conn)                                   # después de crear la extensión
    return conn

def crear_tabla(conn, dim: int):
    conn.execute(f"""CREATE TABLE IF NOT EXISTS fragmentos (
        id text PRIMARY KEY, contenido text NOT NULL, embedding vector({dim}) NOT NULL,
        tsv tsvector GENERATED ALWAYS AS (to_tsvector('spanish', contenido)) STORED)""")
    conn.execute("CREATE INDEX IF NOT EXISTS fr_hnsw ON fragmentos USING hnsw (embedding vector_cosine_ops)")
    conn.execute("CREATE INDEX IF NOT EXISTS fr_tsv ON fragmentos USING gin (tsv)")

def trocear(doc_id: str, texto: str, max_chars: int = 1200) -> dict[str, str]:
    """Agrupa párrafos hasta max_chars; ids estables doc#n para poder citar."""
    trozos, actual = [], ""
    for parrafo in [p.strip() for p in texto.split("\n\n") if p.strip()]:
        if actual and len(actual) + len(parrafo) > max_chars:
            trozos.append(actual); actual = ""
        actual = f"{actual}\n\n{parrafo}".strip()
    if actual:
        trozos.append(actual)
    return {f"{doc_id}#{n}": t for n, t in enumerate(trozos, 1)}

def indexar(conn, fragmentos: dict[str, str]):
    ids, textos = list(fragmentos), list(fragmentos.values())
    crear_tabla(conn, dim=len(embed_textos(["prueba"])[0]))   # la dimensión la da el modelo
    with conn.cursor() as cur:
        cur.executemany("INSERT INTO fragmentos (id, contenido, embedding) VALUES (%s, %s, %s) "
                        "ON CONFLICT (id) DO UPDATE SET contenido = EXCLUDED.contenido, embedding = EXCLUDED.embedding",
                        list(zip(ids, textos, embed_textos(textos))))

HIBRIDA = """
WITH semantica AS (
  SELECT id, RANK() OVER (ORDER BY embedding <=> %(v)s) AS rk
  FROM fragmentos ORDER BY embedding <=> %(v)s LIMIT 20),
lexica AS (
  SELECT id, RANK() OVER (ORDER BY ts_rank_cd(tsv, q) DESC) AS rk
  FROM fragmentos, websearch_to_tsquery('spanish', %(q)s) q
  WHERE tsv @@ q ORDER BY ts_rank_cd(tsv, q) DESC LIMIT 20)
SELECT f.id, f.contenido,
       COALESCE(1.0 / (60 + s.rk), 0) + COALESCE(1.0 / (60 + l.rk), 0) AS rrf
FROM semantica s FULL OUTER JOIN lexica l USING (id) JOIN fragmentos f USING (id)
ORDER BY rrf DESC LIMIT %(k)s"""

def buscar(conn, pregunta: str, k: int = 4) -> list[tuple[str, str]]:
    v = embed_textos([pregunta])[0]
    return [(i, c) for i, c, _ in conn.execute(HIBRIDA, {"v": v, "q": pregunta, "k": k}).fetchall()]

SISTEMA = ("Responde solo con la información de los fragmentos. Cita cada afirmación con su id entre "
           "corchetes, por ejemplo [dev-1]. Si los fragmentos no contienen la respuesta, responde exactamente: No lo sé.")

def responder(conn, pregunta: str) -> dict:
    fragmentos = buscar(conn, pregunta)
    bloques = "\n".join(f'<fragmento id="{i}">\n{c}\n</fragmento>' for i, c in fragmentos)
    r = chat(model=LLM, think=False, options={"num_ctx": 16384, "num_predict": 512, "temperature": 0},
             messages=[{"role": "system", "content": SISTEMA},
                       {"role": "user", "content": f"<fragmentos>\n{bloques}\n</fragmentos>\n\nPregunta: {pregunta}"}])
    texto = r.message.content.strip()
    citas = set(re.findall(r"\[([\w#-]+)\]", texto))
    validas = citas & {i for i, _ in fragmentos}                # comprueba las citas en código
    return {"respuesta": texto, "recuperados": [i for i, _ in fragmentos],
            "citas_invalidas": sorted(citas - validas), "abstiene": texto == "No lo sé."}
```

Las decisiones que conviene entender:

- **La dimensión la decide el modelo de embeddings.** `crear_tabla` la mide con un texto de prueba. Si cambias de modelo, cambia la dimensión y hay que reindexar todo: los vectores de modelos distintos no son comparables.
- **`register_vector` va después de `CREATE EXTENSION`.** Antes, el tipo `vector` no existe y psycopg no puede registrarlo. Con él, los `numpy.array` viajan como vectores sin conversión manual.
- **El índice HNSW usa los valores por defecto** (`m=16`, `ef_construction=64`; `ef_search=40` en consulta). Con tablas pequeñas Postgres hace un recorrido secuencial y no usa el índice: es normal. Compruébalo con `EXPLAIN` cuando tengas datos reales.
- **La parte léxica usa la configuración `'spanish'`** de `to_tsvector`, que reduce «devoluciones» y «devolver» a raíces comparables. Con `'english'` perderías esa normalización. La búsqueda léxica rescata códigos de producto, nombres propios y siglas que los embeddings confunden.
- **RRF con k = 60** suma `1 / (60 + posición)` de cada lista. No necesita normalizar puntuaciones de naturaleza distinta (distancia coseno frente a `ts_rank_cd`), que es justo lo difícil de combinar.
- **Las citas se comprueban en código.** Cualquier modelo puede citar un id que no le diste, y con los pequeños conviene vigilarlo más; `citas_invalidas` te lo dice en cada respuesta.

## Paso 3: indexar tus documentos

Un script mínimo que recorre una carpeta de Markdown, trocea por párrafos con ids estables (`archivo#1`, `archivo#2`…) e indexa. Si vuelves a ejecutarlo, `ON CONFLICT` actualiza en lugar de duplicar.

```python title="indexar.py"
import pathlib
import rag_local

with rag_local.conectar() as conn:
    for ruta in sorted(pathlib.Path("docs").glob("**/*.md")):
        fragmentos = rag_local.trocear(ruta.stem, ruta.read_text(encoding="utf-8"))
        rag_local.indexar(conn, fragmentos)
        print(f"{ruta}: {len(fragmentos)} fragmentos")
```

El troceado por párrafos es deliberadamente simple. Para PDF, tablas o documentos con estructura, mira [[recetas/trocear-documentos]] y la ingesta con herramientas abiertas de [[docs/modelos-abiertos/06-ingesta-de-documentos]].

## Paso 4: una evaluación mínima

Sin medir, no sabrás si el siguiente cambio (otro modelo de embeddings, otro tamaño de trozo) mejora o empeora. El mínimo útil es **recall@k**: para cada pregunta, ¿está el fragmento que contiene la respuesta entre los k recuperados?

```python title="evaluar_rag.py"
from rag_local import buscar

CASOS = [  # (pregunta, id del fragmento que contiene la respuesta)
    ("¿Cuántos días tengo para devolver un producto?", "dev-1"),
    ("¿Me devolvéis los gastos de envío?", "dev-2"),
    ("¿A qué hora abre el soporte técnico?", "sop-1"),
    ("¿Puedo pagar a plazos?", "pag-1"),
]

def recall_at_k(conn, k: int = 2) -> float:
    aciertos = 0
    for pregunta, esperado in CASOS:
        ids = [i for i, _ in buscar(conn, pregunta, k=k)]
        aciertos += esperado in ids
        print(f"{'OK ' if esperado in ids else 'MAL'} {pregunta} → {ids}")
    return aciertos / len(CASOS)
```

Ejecutado con cuatro fragmentos de prueba (`dev-1`, `dev-2`, `sop-1`, `pag-1`) sobre pgvector 0.8.7 real. Los embeddings los dio un servidor simulado (una bolsa de palabras, no un modelo de verdad) y la respuesta del generador es la del guion de la prueba, así que lo que se comprueba es la tubería, no la calidad:

```text
{'respuesta': 'Tienes 30 días naturales desde la entrega para devolverlo [dev-1].', 'recuperados': ['dev-1', 'dev-2', 'sop-1', 'pag-1'], 'citas_invalidas': [], 'abstiene': False}
{'respuesta': 'No lo sé.', 'recuperados': ['pag-1', 'sop-1', 'dev-2', 'dev-1'], 'citas_invalidas': [], 'abstiene': True}
OK  ¿Cuántos días tengo para devolver un producto? → ['dev-1', 'dev-2']
OK  ¿Me devolvéis los gastos de envío? → ['dev-2', 'sop-1']
OK  ¿A qué hora abre el soporte técnico? → ['sop-1', 'dev-2']
OK  ¿Puedo pagar a plazos? → ['pag-1', 'dev-2']
recall@2 = 1.0
```

Con tus documentos y tu modelo real, cuatro preguntas no bastan: el curso [[cursos/rag-a-fondo/10-evaluar-un-rag]] explica cómo montar un conjunto de 30 o más y qué otras métricas añadir (MRR, fidelidad, abstención correcta). Añade también preguntas **sin respuesta en los documentos**: un modelo local que nunca dice «No lo sé» es un riesgo.

## Paso 5 (opcional): reranking abierto

Si recall@20 es bueno pero recall@4 no, el fragmento correcto está entre los candidatos pero mal ordenado. Un [[glosario/reranking|reranker]] (un *cross-encoder* que puntúa cada par pregunta-fragmento) lo arregla. Con sentence-transformers 6.2 (Apache 2.0) la API es `CrossEncoder(...).rank(...)`. Este fragmento no se ha ejecutado aquí (necesita PyTorch y descargar el modelo), y la licencia del modelo de ejemplo no está confirmada: revísala.

```python nocheck title="rerank.py"
from sentence_transformers import CrossEncoder

RERANKER = CrossEncoder("BAAI/bge-reranker-v2-m3")     # multilingüe; comprueba su licencia en la card

def reordenar(pregunta: str, fragmentos: list[tuple[str, str]], k: int = 4) -> list[tuple[str, str]]:
    ranking = RERANKER.rank(pregunta, [c for _, c in fragmentos])   # [{"corpus_id": i, "score": …}, …]
    return [fragmentos[r["corpus_id"]] for r in ranking[:k]]
```

Úsalo pidiendo `buscar(conn, pregunta, k=20)` y quedándote con los 4 primeros tras `reordenar`. Mide recall@4 antes y después: si no mejora, no lo añadas.

## Si prefieres Qdrant

[[herramientas/qdrant|Qdrant]] 1.20 (Apache 2.0) es una base dedicada con filtros ricos y multitenencia. Hace la híbrida con *prefetch* y `RrfQuery(rrf=Rrf(k=60))`, y desde la 1.20 también BM25 sobre el texto del *payload*. Su cliente tiene un modo `QdrantClient(":memory:")` para pruebas y el mismo código vale contra el servidor en Docker (`QdrantClient(url="http://localhost:6333")`). La receta [[recetas/busqueda-hibrida-con-qdrant]] tiene la versión completa y [[docs/modelos-abiertos/05-bases-vectoriales]] compara las opciones.

## Errores frecuentes

- **Mezclar vectores de dos modelos de embeddings** en la misma tabla tras cambiar de modelo. Reindexa.
- **Filtros muy selectivos que devuelven menos de k filas.** El filtro se aplica después del índice aproximado: `SET hnsw.iterative_scan = relaxed_order`.
- **`num_ctx` corto en el generador.** Cuatro fragmentos de 1200 caracteres más el sistema caben en 16k, pero veinte no.
- **No probar preguntas sin respuesta.** El modelo responde con lo que «sabe» y nadie lo detecta.

## Ejercicio

> [!ejercicio] Tu RAG local, medido
> Indexa una carpeta de documentos tuyos (al menos 20 archivos) con `indexar.py`. Escribe 15 preguntas con el id del fragmento que las responde y 5 preguntas sin respuesta en los documentos. Mide recall@4 y la tasa de abstención correcta. Después cambia `EMBED_MODEL` por otro de la tabla, reindexa y repite.
>
> Está bien si entregas una tabla con recall@4 y abstención correcta para los dos modelos de embeddings, si ninguna respuesta tiene `citas_invalidas` sin que lo hayas detectado y si explicas qué modelo eliges y por qué.

> [!ejercicio]- Pistas
> Usa un nombre de tabla distinto por modelo para comparar sin borrar (`fragmentos_qwen`, `fragmentos_bge`). Las preguntas sin respuesta funcionan mejor si son del mismo tema que tus documentos pero sobre algo que no dicen.

## Resumen

- Un RAG local tiene tres piezas abiertas: modelo de embeddings, base vectorial y generador.
- pgvector hace la híbrida en una consulta SQL: vector + `tsvector('spanish')` + RRF con k = 60.
- La dimensión del vector la fija el modelo de embeddings; cambiar de modelo obliga a reindexar.
- Comprueba las citas en código y mide recall@k con tus preguntas, incluidas las que no tienen respuesta.
- El reranker es opcional: añádelo solo si mejora tu recall@k.

## Para seguir

- [[cursos/agentes-con-modelos-abiertos/06-local-o-api]]: ¿compensa todo esto frente a una API?
- [[recetas/rag-local-con-pgvector]]: la receta con `EXPLAIN` y filtros por *tenant*.
- [[sistemas/asistente-100-local]]: este RAG como herramienta de un agente.
