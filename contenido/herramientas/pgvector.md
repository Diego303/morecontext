---
titulo: pgvector
descripcion: Extensión de PostgreSQL para guardar embeddings y buscar por similitud con índices HNSW o IVFFlat, junto a tus datos y transacciones.
creado: 2026-10-29
tags: [rag, base-vectorial, postgres]
relacionados: ["[[recetas/rag-local-con-pgvector]]", "[[docs/modelos-abiertos/05-bases-vectoriales]]", "[[glosario/hnsw]]", "[[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]"]
categoria: base-vectorial
licencia: PostgreSQL
open_source: true
lenguajes: [SQL, Python]
url: https://github.com/pgvector/pgvector
repositorio: https://github.com/pgvector/pgvector
version: "0.8.7"
revisado: 2026-10-29
---

pgvector añade a PostgreSQL un tipo `vector` (y `halfvec`, `bit`, `sparsevec`), operadores de distancia (`<=>` coseno, `<->` L2, `<#>` producto interno) e índices aproximados [[glosario/hnsw]] e [[glosario/ivf|IVFFlat]]. Tus [[glosario/embeddings]] viven en la misma tabla que el texto, los permisos y los metadatos, y una búsqueda es un `SELECT`. El repositorio la publica con la licencia PostgreSQL (OSI, permisiva; es su `LICENSE`); el cliente Python `pgvector` es MIT.

## Para qué sirve

- Montar el [[glosario/vector-store]] de un [[glosario/rag]] sin añadir otro sistema.
- Filtrar con `WHERE` normal (por cliente, fecha, permisos) en la misma consulta.
- [[glosario/busqueda-hibrida]] en SQL: `tsvector('spanish')` para la parte léxica y [[glosario/rrf]] para fusionar, como en [[recetas/rag-local-con-pgvector]].

## Cuándo usarla

Cuando ya tienes Postgres y hasta varios millones de fragmentos. Ganas transacciones, copias de seguridad y un solo sistema que operar. Encaja con ejecución duradera sobre Postgres y con el [[glosario/multi-tenant]] por filas.

## Cuándo no

- Si necesitas filtros muy ricos sobre *payload*, multitenencia nativa o búsqueda dedicada a gran escala: [[herramientas/qdrant]].
- Si no tienes Postgres y quieres algo embebido en un fichero: [[herramientas/lancedb]].
- Si esperas un operador híbrido nativo: no lo hay; la fusión se escribe en SQL.

> [!aviso] Filtros selectivos
> El filtro se aplica **después** del índice aproximado. Con un `WHERE` muy selectivo puedes recibir menos filas que el `LIMIT`. Activa `SET hnsw.iterative_scan = relaxed_order` (o `strict_order`). Y actualiza: de la 0.8.2 a la 0.8.6 se corrigieron errores de corrupción en el *vacuum* de HNSW.

## Ejemplo mínimo

Ejecutado en PGlite (PostgreSQL 18.6 con pgvector 0.8.7):

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE fragmentos (
  id bigserial PRIMARY KEY,
  tenant_id text NOT NULL,
  contenido text NOT NULL,
  embedding vector(3) NOT NULL          -- en real, la dimensión de tu modelo
);
CREATE INDEX ON fragmentos USING hnsw (embedding vector_cosine_ops);   -- m=16, ef_construction=64 por defecto

INSERT INTO fragmentos (tenant_id, contenido, embedding) VALUES
  ('acme', 'Política de devoluciones: 30 días', '[0.1,0.9,0.1]'),
  ('acme', 'Horario de soporte técnico',        '[0.9,0.1,0.0]'),
  ('otra', 'Devoluciones de otro cliente',      '[0.1,0.9,0.1]');

SET hnsw.ef_search = 100;                -- más recall a cambio de latencia (defecto: 40)
SET hnsw.iterative_scan = relaxed_order;

SELECT id, contenido, 1 - (embedding <=> '[0.1,0.85,0.1]') AS similitud
FROM fragmentos
WHERE tenant_id = 'acme'
ORDER BY embedding <=> '[0.1,0.85,0.1]'
LIMIT 2;
```

```text
# salida real (datos de juguete, 3 dimensiones)
id 1 · Política de devoluciones: 30 días · 0.99996
id 2 · Horario de soporte técnico        · 0.22428
```

Desde Python, con `psycopg` 3 y el paquete `pgvector`, registra el tipo **después** de crear la extensión:

```python title="consulta_pgvector.py"
import numpy as np
import psycopg
from pgvector.psycopg import register_vector

with psycopg.connect("dbname=rag") as conn:
    register_vector(conn)
    filas = conn.execute(
        "SELECT contenido FROM fragmentos WHERE tenant_id = %s ORDER BY embedding <=> %s LIMIT 5",
        ("acme", np.array([0.1, 0.85, 0.1])),
    ).fetchall()
```

(Necesita un Postgres con la extensión; no se ha ejecutado aquí.) Con tablas pequeñas, Postgres hace *seq scan* y no usa el índice: es normal. Compruébalo con `EXPLAIN` sobre datos reales. `vector` indexa hasta 2000 dimensiones; `halfvec`, hasta 4000.

## Alternativas

- [[herramientas/qdrant]]: base vectorial dedicada, con híbrida nativa.
- [[herramientas/lancedb]]: embebida, sin servidor.
- [[herramientas/chroma]]: prototipos rápidos.

## Enlaces

- Repositorio y README: [github.com/pgvector/pgvector](https://github.com/pgvector/pgvector)
- Historial de cambios: [CHANGELOG.md](https://github.com/pgvector/pgvector/blob/master/CHANGELOG.md)
