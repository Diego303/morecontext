---
titulo: RAG local con pgvector
descripcion: Monta un RAG que no sale de tu máquina con PostgreSQL y pgvector en Docker, índice HNSW, embeddings abiertos con Ollama, búsqueda híbrida con full-text y RRF en SQL y respuesta con un modelo local.
creado: 2026-10-29
nivel: intermedio
minutos: 40
tema: rag
stack: ["PostgreSQL", "pgvector", "Ollama", "Python"]
tags: [rag, pgvector, postgresql, busqueda-hibrida, ollama, modelos-abiertos]
relacionados: ["[[herramientas/pgvector]]", "[[docs/modelos-abiertos/05-bases-vectoriales]]", "[[recetas/busqueda-hibrida-con-bm25]]", "[[sistemas/asistente-100-local]]", "[[problemas/el-rag-no-encuentra-el-documento]]"]
---

## Problema

Quieres un [[glosario/rag|RAG]] sobre documentos internos que no pueden salir de tu red, y ya tienes (o puedes tener) PostgreSQL. No quieres montar una base vectorial aparte ni pagar por *embeddings*. Además, la búsqueda solo vectorial falla con términos exactos como códigos de error o referencias, así que necesitas también búsqueda por palabras.

Con [[herramientas/pgvector|pgvector]] los vectores viven en una tabla normal, al lado del texto y del índice de búsqueda de texto completo de Postgres. La [[glosario/busqueda-hibrida|búsqueda híbrida]] se resuelve en una sola consulta SQL fusionando los dos rankings con [[glosario/rrf|RRF]].

## Ingredientes

- Docker.
- [[herramientas/ollama|Ollama]] con un modelo de embeddings y uno de generación: `ollama pull qwen3-embedding:0.6b` y `ollama pull qwen3.6:27b` (o uno más pequeño con la misma API).
- Python 3.10 o superior: `pip install "psycopg[binary]" pgvector numpy ollama`.
- Los documentos ya troceados por párrafos o secciones ([[recetas/trocear-documentos]]).

## Pasos

1. **Arranca PostgreSQL con pgvector.** La imagen oficial `pgvector/pgvector` trae la extensión compilada; fija la versión en la etiqueta.

```bash
docker run -d --name rag-pg -p 5432:5432 \
  -e POSTGRES_USER=rag -e POSTGRES_PASSWORD=rag -e POSTGRES_DB=rag \
  -v rag-datos:/var/lib/postgresql \
  pgvector/pgvector:0.8.7-pg18
```

Usa pgvector 0.8.6 o posterior: de la 0.8.2 a la 0.8.6 se corrigieron fallos de corrupción y desbordamientos en el *vacuum* de HNSW y en la construcción de IVFFlat. En la imagen de PostgreSQL 18, el volumen se monta en `/var/lib/postgresql`, no en `/var/lib/postgresql/data` como en versiones anteriores.

2. **Diseña la tabla.** Una columna `vector(dim)` con la dimensión **medida** del modelo de embeddings (no la supongas: el código la lee del primer vector), y una columna `tsvector` generada con la configuración `'spanish'` para la parte léxica. Dos índices: [[glosario/hnsw|HNSW]] con distancia coseno para la vectorial y GIN para el texto. Los parámetros `m = 16` y `ef_construction = 64` son los de por defecto; escríbelos para que se vean.

3. **Escribe la búsqueda híbrida en SQL.** Dos subconsultas de 20 candidatos cada una (semántica por distancia `<=>` y léxica por `ts_rank_cd`), un `FULL OUTER JOIN` y la suma `1 / (60 + posición)` de cada ranking. Un fragmento que sale en los dos sube; uno que solo sale en uno también cuenta.

Para la parte léxica hay una trampa: `plainto_tsquery` y `websearch_to_tsquery` exigen **todas** las palabras (AND). Una pregunta natural larga casi nunca las contiene todas, y la parte léxica no devuelve nada. Convierte la consulta a OR.

```python title="rag_local.py"
import sys

import numpy as np
import ollama
import psycopg
from pgvector.psycopg import register_vector

MODEL = "qwen3.6:27b"                    # generación
EMBED_MODEL = "qwen3-embedding:0.6b"     # embeddings abiertos; mide su dimensión, no la supongas
DSN = "postgresql://rag:rag@localhost:5432/rag"

ESQUEMA = """
CREATE TABLE IF NOT EXISTS fragmentos (
  id bigserial PRIMARY KEY,
  fuente text NOT NULL,
  contenido text NOT NULL,
  embedding vector({dim}) NOT NULL,
  tsv tsvector GENERATED ALWAYS AS (to_tsvector('spanish', contenido)) STORED
);
CREATE INDEX IF NOT EXISTS fragmentos_hnsw ON fragmentos USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
CREATE INDEX IF NOT EXISTS fragmentos_tsv ON fragmentos USING gin (tsv);
"""

# Híbrida: 20 candidatos semánticos + 20 léxicos, fusionados con RRF (k = 60) en SQL.
HIBRIDA = """
WITH semantica AS (
  SELECT id, RANK() OVER (ORDER BY embedding <=> %(v)s) AS rk
  FROM fragmentos ORDER BY embedding <=> %(v)s LIMIT 20
),
lexica AS (
  SELECT id, RANK() OVER (ORDER BY ts_rank_cd(tsv, q) DESC) AS rk
  FROM fragmentos, to_tsquery('spanish', replace(plainto_tsquery('spanish', %(texto)s)::text, ' & ', ' | ')) q
  WHERE tsv @@ q ORDER BY ts_rank_cd(tsv, q) DESC LIMIT 20
)
SELECT f.id, f.fuente, f.contenido,
       COALESCE(1.0 / (60 + s.rk), 0) + COALESCE(1.0 / (60 + l.rk), 0) AS rrf
FROM semantica s FULL OUTER JOIN lexica l USING (id) JOIN fragmentos f USING (id)
ORDER BY rrf DESC LIMIT %(k)s
"""


def embed(textos: list[str]) -> list[np.ndarray]:
    return [np.array(e, dtype=np.float32) for e in ollama.embed(model=EMBED_MODEL, input=textos).embeddings]


def conectar() -> psycopg.Connection:
    conn = psycopg.connect(DSN, autocommit=True)
    conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
    register_vector(conn)                         # después de CREATE EXTENSION, nunca antes
    return conn


def ingestar(conn, fuente: str, trozos: list[str]) -> None:
    vectores = embed(trozos)
    conn.execute(ESQUEMA.format(dim=len(vectores[0])))
    with conn.cursor() as cur:
        cur.executemany("INSERT INTO fragmentos (fuente, contenido, embedding) VALUES (%s, %s, %s)",
                        [(fuente, t, v) for t, v in zip(trozos, vectores)])


def buscar(conn, pregunta: str, k: int = 5) -> list[tuple]:
    conn.execute("SET hnsw.ef_search = 100")      # por defecto 40: más candidatos, más recall
    return conn.execute(HIBRIDA, {"v": embed([pregunta])[0], "texto": pregunta, "k": k}).fetchall()


def responder(conn, pregunta: str) -> str:
    filas = buscar(conn, pregunta)
    contexto = "\n".join(f'<fragmento id="{i}" fuente="{f}">\n{c}\n</fragmento>' for i, f, c, _ in filas)
    r = ollama.chat(
        model=MODEL, think=False,
        options={"num_ctx": 16384, "num_predict": 512, "temperature": 0},   # contexto explícito: el defecto trunca
        messages=[
            {"role": "system", "content": "Responde solo con la información de los fragmentos y cita su id entre "
                                          "corchetes, p. ej. [3]. Si no está en los fragmentos, dilo."},
            {"role": "user", "content": f"<fragmentos>\n{contexto}\n</fragmentos>\n\nPregunta: {pregunta}"},
        ])
    return r.message.content


if __name__ == "__main__":
    with conectar() as conn:
        if sys.argv[1] == "ingestar":             # python rag_local.py ingestar politicas.txt
            texto = open(sys.argv[2], encoding="utf-8").read()
            ingestar(conn, sys.argv[2], [p.strip() for p in texto.split("\n\n") if p.strip()])
        else:                                     # python rag_local.py preguntar "¿…?"
            print(responder(conn, sys.argv[2]))
```

4. **Ingesta y pregunta.**

```bash
python rag_local.py ingestar politicas.txt
python rag_local.py preguntar "¿Cuánto tiempo tengo para devolver un producto?"
```

5. **Comprueba que el índice se usa cuando importa.** Con pocas filas, Postgres prefiere recorrer la tabla entera y es lo correcto. Con datos reales, `EXPLAIN` sobre la subconsulta semántica debe mostrar `Index Scan using fragmentos_hnsw`. Si filtras por una columna muy selectiva (por cliente, por fecha), activa `SET hnsw.iterative_scan = relaxed_order`: sin él, el índice devuelve 20 candidatos, el filtro descarta la mayoría y te quedas con menos resultados de los pedidos.

## Cómo comprobar que funciona

Aquí no había servidor de Postgres ni de Ollama. Ejecuté el SQL **exacto** de `ESQUEMA` y `HIBRIDA` (cambiando los marcadores `%(…)s` de psycopg por `$1…$3`) en PGlite, que es PostgreSQL 18.6 con pgvector 0.8.7 compilado a WebAssembly, con cuatro fragmentos y vectores de juguete de tres dimensiones. La parte de Python (llamadas a `ollama.embed` y `ollama.chat`, firmas y construcción del prompt) la comprobé contra el cliente `ollama` 0.6.3 instalado, sin servidor. Salida real del SQL:

```text
{ extversion: '0.8.7' } PostgreSQL 18.6

¿cuánto tiempo tengo para devolver un producto?
  id 1 · rrf 0.0328 · Tienes 30 días naturales desde la entrega para devolver
  id 3 · rrf 0.0323 · Para pedir un reembolso, entra en Mis pedidos y pulsa D
  id 4 · rrf 0.0159 · El error E-4012 aparece cuando la tarjeta ha caducado.

error E-4012
  id 4 · rrf 0.0328 · El error E-4012 aparece cuando la tarjeta ha caducado.
  id 3 · rrf 0.0161 · Para pedir un reembolso, entra en Mis pedidos y pulsa D
  id 1 · rrf 0.0159 · Tienes 30 días naturales desde la entrega para devolver
```

Cómo leerlo: 0,0328 ≈ 2/61, primero en los dos rankings; 0,016 ≈ 1/61, solo en uno. Con `websearch_to_tsquery` (AND), la primera pregunta sacaba el fragmento 1 con solo 0,0164: la parte léxica no encontraba nada porque ningún fragmento contiene todas las palabras. Con OR, el fragmento de devoluciones sube a 2/61. «E-4012» lo encuentra la parte léxica aunque el vector de la consulta no se parezca.

Con tus datos, mide antes de creerte nada: 30 preguntas reales con su fragmento correcto y el *recall@5* de la vectorial sola, la léxica sola y la híbrida ([[recetas/depurar-un-rag]]).

## Variaciones

- **Multicliente.** Añade `tenant_id text NOT NULL`, un índice sobre esa columna y `WHERE tenant_id = %(t)s` en **las dos** subconsultas, con `hnsw.iterative_scan` activado.
- **Menos memoria.** Indexa en media precisión sin cambiar la columna: `CREATE INDEX ON fragmentos USING hnsw ((embedding::halfvec(1024)) halfvec_cosine_ops)`. La consulta debe repetir el mismo *cast* (`ORDER BY embedding::halfvec(1024) <=> …`) o no usará el índice. `halfvec` indexa hasta 4000 dimensiones; `vector`, hasta 2000.
- **Reranking.** Pide 20 a la híbrida y reordena con un *cross-encoder* abierto antes de quedarte con 5 ([[glosario/reranking]], [[docs/modelos-abiertos/04-embeddings-y-rerankers]]).
- **Generación con Claude.** Si los documentos pueden salir pero los embeddings no, cambia solo `responder` por una llamada a la API de Claude con citas ([[sistemas/rag-con-citas]]).
- **Otra base.** Si necesitas filtros más ricos o una base dedicada, la misma idea con Qdrant: [[recetas/busqueda-hibrida-con-qdrant]].

## Errores típicos

- **Suponer la dimensión.** Si creas `vector(1024)` y el modelo devuelve otra, la inserción falla. Mídela del primer vector, como hace `ingestar`.
- **Mezclar modelos de embeddings.** Si cambias de modelo, reindexa todo: vectores de modelos distintos no son comparables.
- **`register_vector` antes de crear la extensión.** psycopg no encuentra el tipo `vector`. El orden es `CREATE EXTENSION` y luego `register_vector(conn)`.
- **Usar `'english'` en `to_tsvector`.** La lematización y las palabras vacías serían las del inglés: «devoluciones» no casaría con «devolver».
- **Sumar distancias y `ts_rank` en bruto.** Están en escalas distintas; fusiona por posición con RRF.
- **Contexto truncado en la generación.** Con cinco fragmentos largos, el contexto por defecto de Ollama se queda corto y recorta sin avisar: fija `num_ctx`.
- **Confiar en que el modelo cite bien.** Comprueba en código que los ids citados existen entre los recuperados ([[problemas/el-rag-encuentra-pero-responde-mal]]).
