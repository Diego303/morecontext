---
titulo: Bases vectoriales abiertas
descripcion: Comparativa de pgvector, Qdrant, Chroma y LanceDB con licencias, índices, búsqueda híbrida en cada una (con salida real) y un criterio para elegir.
creado: 2026-10-29
orden: 5
nivel: intermedio
tags: [rag, bases-vectoriales, pgvector, qdrant, busqueda-hibrida, modelos-abiertos]
relacionados: ["[[glosario/vector-store]]", "[[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]", "[[glosario/busqueda-hibrida]]", "[[docs/modelos-abiertos/04-embeddings-y-rerankers]]"]
---

Una **base vectorial** ([[glosario/vector-store|vector store]]) guarda los embeddings de tus fragmentos y responde a «dame los k más parecidos a este vector», normalmente con un índice aproximado ([[glosario/ann|ANN]]) como [[glosario/hnsw|HNSW]]. En un RAG serio casi nunca basta con eso: necesitas filtros (por cliente, por permisos) y [[glosario/busqueda-hibrida|búsqueda híbrida]] para los términos exactos que los embeddings confunden. Esta página compara las opciones abiertas con lo que cada una hace de verdad, con código ejecutado.

## Comparativa

| Base | Versión (oct. 2026) | Licencia | Híbrida | Filtros y multitenencia | Encaja cuando |
|---|---|---|---|---|---|
| [[herramientas/pgvector\|pgvector]] (Postgres) | 0.8.7 | Extensión: PostgreSQL License (revísala en el repo); cliente Python `pgvector`: MIT | Sí, en SQL: `tsvector` + RRF (sin operador nativo) | `WHERE` normal, índices parciales, particionado, `iterative_scan` | Ya tienes Postgres, hasta varios millones de fragmentos, quieres transacciones |
| [[herramientas/qdrant\|Qdrant]] | servidor y cliente 1.20.0 (22 oct.) | Apache-2.0 | Sí: denso + *sparse* y BM25 sobre texto (1.20); fusión RRF o DBSF | Filtros por payload; índice `is_tenant=True` | Base dedicada con filtros ricos y multitenencia |
| [[herramientas/chroma\|Chroma]] | 1.5.9 | Apache-2.0 | **Solo en Chroma Cloud** | `where`, `where_document` | Prototipos locales |
| [[herramientas/lancedb\|LanceDB]] | 0.41.0 | Apache-2.0 | Sí, en local: FTS + vector con `RRFReranker` | `.where("…")` en SQL | Embebida, sin servidor, datos en ficheros |
| Weaviate | 1.39 | BSD-3 (cliente) | Sí (`hybrid`, BM25) | Multitenencia nativa | Plataforma con módulos |
| Milvus | 3.0 | Apache-2.0 | Sí (función BM25 → *sparse*) | Particiones | Escala grande y distribuida |
| Elasticsearch · OpenSearch | Varias | Binarios de Elastic solo ELv2 · OpenSearch Apache-2.0 | Sí | Sí | Ya tienes uno de los dos |

Datos de versiones y licencias del informe de infraestructura abierta del 29 oct. 2026, contrastados con PyPI y la documentación de cada proyecto ([pgvector](https://github.com/pgvector/pgvector), [Qdrant](https://qdrant.tech/documentation/search/hybrid-queries/), [Chroma](https://docs.trychroma.com/cloud/search-api/overview)). Cómo funcionan por dentro HNSW, IVF y la cuantización: [[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]].

## pgvector

### HNSW frente a IVFFlat

| | HNSW | IVFFlat |
|---|---|---|
| Parámetros de construcción | `m` = 16 y `ef_construction` = 64 por defecto | `lists`: filas / 1000 hasta 1 M de filas; √filas por encima |
| Parámetro de consulta | `hnsw.ef_search` = 40 por defecto | `ivfflat.probes` = 1 por defecto (empieza por √lists) |
| Cuándo crear el índice | Cuando quieras; admite inserciones | **Después** de cargar los datos: los centroides salen de ellos |
| Calidad frente a velocidad | Mejor recall a igual velocidad; más memoria y construcción más lenta | Construye rápido y ocupa menos; recall más sensible a `probes` |

Empieza por HNSW con los valores por defecto. Si el recall de tus pruebas se queda corto, sube `ef_search` (100 es un buen siguiente paso) antes de tocar `m`. Límites de dimensiones indexables: `vector` 2000, `halfvec` 4000, `bit` 64 000 y `sparsevec` 1000 elementos no nulos. Si tu modelo da 4096 dimensiones, indexa como `halfvec` o recorta dimensiones.

> [!aviso] Actualiza pgvector
> Las versiones 0.8.2 a 0.8.6 corrigieron corrupciones y desbordamientos en el *vacuum* de HNSW y en la construcción de IVFFlat. Usa 0.8.7 o posterior.

### Tabla, índices y búsqueda híbrida en SQL

pgvector no trae búsqueda híbrida: la construyes con dos consultas (semántica y léxica con `tsvector`) y las fusionas con [[glosario/rrf|RRF]], que suma `1 / (k + posición)` de cada lista. Ejecutado en PGlite 0.5.13 (PostgreSQL 18.6) con pgvector 0.8.7:

```sql title="hibrida.sql"
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE fragmentos (
  id bigserial PRIMARY KEY,
  tenant_id text NOT NULL,
  contenido text NOT NULL,
  embedding vector(1024) NOT NULL,              -- la dimensión de tu modelo
  tsv tsvector GENERATED ALWAYS AS (to_tsvector('spanish', contenido)) STORED
);
CREATE INDEX ON fragmentos USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX ON fragmentos USING gin (tsv);
CREATE INDEX ON fragmentos (tenant_id);

SET hnsw.ef_search = 100;
SET hnsw.iterative_scan = relaxed_order;        -- mejor recall con filtros selectivos

WITH semantica AS (
  SELECT id, RANK() OVER (ORDER BY embedding <=> $1::vector) AS rk
  FROM fragmentos WHERE tenant_id = $3
  ORDER BY embedding <=> $1::vector LIMIT 20
),
lexica AS (
  SELECT id, RANK() OVER (ORDER BY ts_rank_cd(tsv, q) DESC) AS rk
  FROM fragmentos, websearch_to_tsquery('spanish', $2) q
  WHERE tenant_id = $3 AND tsv @@ q
  ORDER BY ts_rank_cd(tsv, q) DESC LIMIT 20
)
SELECT f.id, f.contenido,
       COALESCE(1.0 / (60 + s.rk), 0) + COALESCE(1.0 / (60 + l.rk), 0) AS rrf
FROM semantica s FULL OUTER JOIN lexica l USING (id) JOIN fragmentos f USING (id)
ORDER BY rrf DESC LIMIT 5;
```

Con cuatro filas de juguete (vectores de 3 dimensiones, una de otro tenant) y la consulta «devoluciones», la salida real es:

```text
1 0.0328 Política de devoluciones: tienes 30 días para devolver el producto
3 0.0161 Cómo solicitar un reembolso de un pedido
2 0.0159 Horario del servicio de soporte técnico
```

El fragmento 1 sale primero en las dos listas (1/61 + 1/61); el 3 y el 2 solo aparecen en la semántica. La fila del otro tenant no sale nunca. En la misma prueba, `SHOW hnsw.ef_search` devolvió 40, `SHOW ivfflat.probes` 1 y `SHOW hnsw.iterative_scan` `off`: los valores por defecto documentados.

Tres trampas de pgvector:

- **El filtro va después del índice aproximado.** Con un `WHERE tenant_id = …` muy selectivo y sin `iterative_scan`, HNSW puede devolver menos filas que el `LIMIT`. Actívalo (`relaxed_order` o `strict_order`).
- **`halfvec` solo se usa si repites la expresión.** El índice `USING hnsw ((embedding::halfvec(1024)) halfvec_cosine_ops)` ahorra memoria, pero la consulta debe ordenar por `embedding::halfvec(1024) <=> $1::halfvec(1024)`.
- **Tablas pequeñas no usan el índice**: Postgres prefiere un *seq scan*. Comprueba con `EXPLAIN` sobre datos de tamaño real, no sobre diez filas.

Usa `'spanish'` en `to_tsvector` y en la consulta, no `'english'`. Desde Python: `psycopg` 3 con `register_vector(conn)` de `pgvector.psycopg` **después** de `CREATE EXTENSION`. El ejemplo completo con embeddings de Ollama está en [[recetas/rag-local-con-pgvector]].

## Qdrant

Qdrant guarda varios vectores con nombre por punto. La híbrida clásica combina uno denso y uno *sparse* con `modifier=IDF` (necesario para que el *sparse* puntúe como BM25), cada uno en un `Prefetch`, y los fusiona con `RrfQuery`. Ejecutado con `qdrant-client` 1.20.0 en modo embebido:

```python title="qdrant_hibrida.py"
from qdrant_client import QdrantClient, models

client = QdrantClient(":memory:")          # en producción: QdrantClient(url="http://localhost:6333")
client.create_collection(
    collection_name="docs",
    vectors_config={"densa": models.VectorParams(size=4, distance=models.Distance.COSINE)},
    sparse_vectors_config={"bm25": models.SparseVectorParams(modifier=models.Modifier.IDF)},
)
client.upsert("docs", points=[
    models.PointStruct(id=1, payload={"tenant_id": "acme", "texto": "Política de devoluciones"},
        vector={"densa": [0.1, 0.9, 0.1, 0.0], "bm25": models.SparseVector(indices=[10, 42], values=[1.0, 2.0])}),
    models.PointStruct(id=2, payload={"tenant_id": "acme", "texto": "Horario de soporte"},
        vector={"densa": [0.9, 0.1, 0.0, 0.1], "bm25": models.SparseVector(indices=[7], values=[1.0])}),
    models.PointStruct(id=3, payload={"tenant_id": "otra", "texto": "Devoluciones (otro cliente)"},
        vector={"densa": [0.1, 0.8, 0.2, 0.0], "bm25": models.SparseVector(indices=[42], values=[1.0])}),
])

filtro = models.Filter(must=[models.FieldCondition(key="tenant_id", match=models.MatchValue(value="acme"))])
res = client.query_points(
    collection_name="docs",
    prefetch=[   # dos búsquedas candidatas, cada una con el filtro de tenant
        models.Prefetch(query=[0.1, 0.9, 0.1, 0.0], using="densa", limit=20, filter=filtro),
        models.Prefetch(query=models.SparseVector(indices=[42], values=[1.0]), using="bm25", limit=20, filter=filtro),
    ],
    query=models.RrfQuery(rrf=models.Rrf(k=60)),   # fusión por posiciones
    limit=5, with_payload=True,
)
for p in res.points:
    print(p.id, round(p.score, 4), p.payload["texto"])
```

```text
1 0.0333 Política de devoluciones
2 0.0164 Horario de soporte
```

El punto 3 tiene el vector más parecido, pero es de otro tenant y el filtro lo saca. Fíjate en que la puntuación es 0,0333 (2/60) y no 0,0328 como en pgvector: la salida cuadra con que Qdrant numera las posiciones desde 0. No compares puntuaciones RRF entre motores; compara órdenes.

**Novedad de la 1.20: BM25 sobre el texto del payload**, sin generar vectores *sparse* tú. Creas un índice de texto con `scoring=True` y consultas con `TextQuery`:

```python nocheck title="qdrant_bm25_texto.py"
client.create_payload_index("docs", field_name="texto",
    field_schema=models.TextIndexParams(type=models.TextIndexType.TEXT,
        tokenizer=models.TokenizerType.WORD, lowercase=True, scoring=True))   # scoring=True activa BM25
res = client.query_points("docs",
    prefetch=[models.Prefetch(query=vector_denso, using="densa", limit=20),
              models.Prefetch(query=models.TextQuery(text="devoluciones"), using="texto", limit=20)],
    query=models.RrfQuery(rrf=models.Rrf(k=60)), limit=5)
```

Con tres puntos de prueba devolvió `1 0.0333 Política de devoluciones en 30 días`, `3 0.0164 Cómo pedir un reembolso` y `2 0.0161 Horario de soporte técnico`. Necesita servidor (y cliente) 1.20 o posterior.

Versiones mínimas útiles: `Prefetch` con RRF desde 1.10, DBSF desde 1.11, `k` configurable desde 1.16 y RRF ponderado (`Rrf(weights=[3.0, 1.0])`) desde 1.17. La documentación de Qdrant recomienda no tocar pesos sin un conjunto de evaluación. En modo `:memory:` los índices de payload no tienen efecto (salvo los de texto con `scoring`): mide el rendimiento con un servidor. Receta completa: [[recetas/busqueda-hibrida-con-qdrant]].

## Chroma y LanceDB

**Chroma** es la forma más rápida de tener un índice en un notebook: `EphemeralClient()` o `PersistentClient(path)`, `get_or_create_collection(name, metadata={"hnsw:space": "cosine"})` y `query(query_embeddings=…, n_results=…, where={…}, where_document={"$contains": …})`. El cliente incluye la Search API híbrida (`Search`, `Knn`, `Rrf`), pero su documentación dice que solo está disponible en Chroma Cloud. En local, `where_document` filtra por texto, no puntúa con BM25. Si necesitas híbrida en local, hazla tú con [[recetas/busqueda-hibrida-con-bm25]] o cambia de base.

**LanceDB** es embebida como SQLite: una carpeta de ficheros Lance/Arrow, sin servidor, y con híbrida local. Ejecutado con `lancedb` 0.41.0:

```python title="lance_hibrida.py"
import lancedb
from lancedb.index import FTS
from lancedb.rerankers import RRFReranker

db = lancedb.connect("./lance_db")         # una carpeta: sin servidor
t = db.create_table("docs", mode="overwrite", data=[
    {"id": 1, "texto": "Política de devoluciones en 30 días", "vector": [0.1, 0.9, 0.1], "tenant": "acme"},
    {"id": 2, "texto": "Horario de soporte técnico", "vector": [0.9, 0.1, 0.0], "tenant": "acme"},
    {"id": 3, "texto": "Cómo pedir un reembolso", "vector": [0.2, 0.8, 0.2], "tenant": "acme"},
])
t.create_index("texto", config=FTS())      # índice de texto completo (BM25)
res = (t.search(query_type="hybrid")
        .vector([0.1, 0.9, 0.1]).text("devoluciones")
        .where("tenant = 'acme'")
        .rerank(RRFReranker())
        .limit(3).to_list())
for x in res:
    print(x["id"], round(x["_relevance_score"], 4), x["texto"])
```

```text
1 0.0328 Política de devoluciones en 30 días
3 0.0161 Cómo pedir un reembolso
2 0.0159 Horario de soporte técnico
```

`create_fts_index` está obsoleto desde la 0.25: usa `create_index(campo, config=FTS())`.

## Cuándo cada una

Criterio editorial, sin benchmarks: el rendimiento depende de tus datos, tu hardware y tus filtros.

- **¿Ya tienes Postgres y menos de unos millones de fragmentos?** pgvector. Un solo sistema, transacciones, permisos con `WHERE` y copias de seguridad que ya sabes hacer.
- **¿Filtros ricos, muchos clientes y una base dedicada?** Qdrant, con el índice de tenant y la híbrida nativa.
- **¿Sin servidor, en el portátil o dentro de una app?** LanceDB.
- **¿Un prototipo en un notebook?** Chroma, sabiendo que la híbrida local no está.
- **¿Escala muy grande y distribuida?** Milvus. **¿Ya tienes Elastic u OpenSearch?** Úsalo, y revisa la licencia de Elastic.

Sea cual sea, guarda junto a cada fragmento el `tenant_id` o los permisos y filtra **dentro** de la consulta, no después en tu código: [[cursos/rag-a-fondo/07-permisos-y-multi-tenant]].

## Errores frecuentes

| Error | Consecuencia | Arreglo |
|---|---|---|
| Filtrar por permisos después de recuperar | Fugas entre clientes o menos de k resultados | Filtro en la consulta (`WHERE`, `Filter`, `.where`) |
| `to_tsvector('english', …)` con textos en español | La parte léxica falla en plurales y conjugaciones | Configuración `'spanish'` |
| Comparar puntuaciones RRF entre motores | Conclusiones falsas | Compara órdenes y recall@k |
| Crear IVFFlat con la tabla vacía | Centroides malos y recall bajo | Créalo después de cargar |
| Cliente y servidor de Qdrant en versiones distintas | Errores o funciones que no existen | Alinea versiones |

## Ver también

- [[docs/modelos-abiertos/04-embeddings-y-rerankers]]: de dónde salen los vectores.
- [[recetas/fusionar-rankings-con-rrf]]: RRF explicado y en Python.
- [[cursos/rag-a-fondo/03-recuperar-bien]]: híbrida y reranking en el diseño de un RAG.
- [[sistemas/asistente-100-local]]: todas las piezas juntas en local.
