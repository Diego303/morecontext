# pgvector desde Python con psycopg 3. Embeddings con el proveedor que prefieras (aquí, Ollama /api/embed).
import numpy as np, psycopg
from pgvector.psycopg import register_vector
from ollama import embed

EMBED_MODEL = "qwen3-embedding:0.6b"   # comprueba la dimensión real antes de crear la tabla
def embed_textos(textos: list[str]) -> list[list[float]]:
    return embed(model=EMBED_MODEL, input=textos).embeddings

with psycopg.connect("postgresql://localhost/rag", autocommit=True) as conn:
    conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
    register_vector(conn)                      # después de crear la extensión
    dim = len(embed_textos(["prueba"])[0])
    conn.execute(f"""CREATE TABLE IF NOT EXISTS fragmentos (
        id bigserial PRIMARY KEY, tenant_id text NOT NULL, contenido text NOT NULL,
        embedding vector({dim}) NOT NULL,
        tsv tsvector GENERATED ALWAYS AS (to_tsvector('spanish', contenido)) STORED)""")
    conn.execute("CREATE INDEX IF NOT EXISTS fr_hnsw ON fragmentos USING hnsw (embedding vector_cosine_ops)")
    conn.execute("CREATE INDEX IF NOT EXISTS fr_tsv ON fragmentos USING gin (tsv)")
    textos = ["Tienes 30 días para devolver el producto.", "El soporte atiende de 9 a 18 h."]
    with conn.cursor() as cur:
        cur.executemany("INSERT INTO fragmentos (tenant_id, contenido, embedding) VALUES (%s, %s, %s)",
                        [("acme", t, np.array(e)) for t, e in zip(textos, embed_textos(textos))])
    q = np.array(embed_textos(["¿cuánto tiempo tengo para devolverlo?"])[0])
    filas = conn.execute("""SELECT contenido, embedding <=> %s AS distancia FROM fragmentos
                            WHERE tenant_id = %s ORDER BY embedding <=> %s LIMIT 5""", (q, "acme", q)).fetchall()
    print(filas)
