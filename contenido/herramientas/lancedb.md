---
titulo: LanceDB
descripcion: Base vectorial embebida y sin servidor que guarda los datos en ficheros Lance y hace búsqueda híbrida local con texto completo y RRF.
creado: 2026-10-29
tags: [rag, base-vectorial, embebida]
relacionados: ["[[docs/modelos-abiertos/05-bases-vectoriales]]", "[[cursos/agentes-con-modelos-abiertos/05-rag-cien-por-cien-local]]", "[[glosario/busqueda-hibrida]]"]
categoria: base-vectorial
licencia: Apache-2.0
open_source: true
lenguajes: [Python, TypeScript, Rust]
url: https://github.com/lancedb/lancedb
repositorio: https://github.com/lancedb/lancedb
version: "0.41.0"
revisado: 2026-10-29
---

LanceDB es una base de datos vectorial **embebida**: no hay proceso servidor, la abres como una biblioteca y los datos viven en una carpeta en formato Lance (columnar, basado en Arrow). Licencia Apache-2.0. Combina búsqueda vectorial, índice de texto completo (FTS) y filtros SQL (`.where("…")`), y puede fusionar ambas búsquedas con un *reranker* [[glosario/rrf]].

## Para qué sirve

- Un [[glosario/rag]] 100 % local sin desplegar nada: el índice es una carpeta que puedes copiar o versionar.
- [[glosario/busqueda-hibrida]] en local (vector + texto completo), cosa que Chroma solo ofrece en su nube.
- Tablas grandes con columnas de metadatos que consultas como un *dataframe*.

## Cuándo usarla

En aplicaciones de escritorio, scripts, agentes locales o *pipelines* por lotes, donde un servidor sobra. Encaja en el RAG local de [[cursos/agentes-con-modelos-abiertos/05-rag-cien-por-cien-local]].

## Cuándo no

- Con muchos procesos escribiendo a la vez desde máquinas distintas o un servicio con multitenencia estricta: [[herramientas/qdrant]] o [[herramientas/pgvector]].
- Si ya tienes Postgres: [[herramientas/pgvector]] te ahorra otro formato de datos.

## Ejemplo mínimo

Ejecutado con `lancedb` 0.41.0:

```python title="lance_minimo.py"
import lancedb
from lancedb.index import FTS
from lancedb.rerankers import RRFReranker

db = lancedb.connect("./datos_lance")  # una carpeta; no hay servidor
t = db.create_table("docs", mode="overwrite", data=[
    {"id": 1, "texto": "Política de devoluciones en 30 días", "vector": [0.1, 0.9, 0.1], "tenant": "acme"},
    {"id": 2, "texto": "Horario de soporte técnico", "vector": [0.9, 0.1, 0.0], "tenant": "acme"},
    {"id": 3, "texto": "Cómo pedir un reembolso", "vector": [0.2, 0.8, 0.2], "tenant": "acme"},
])
t.create_index("texto", config=FTS())  # índice de texto completo

res = (t.search(query_type="hybrid")
        .vector([0.1, 0.9, 0.1]).text("devoluciones")
        .where("tenant = 'acme'")
        .rerank(RRFReranker())
        .limit(2).to_list())
for fila in res:
    print(fila["id"], fila["texto"], round(fila["_relevance_score"], 4))
```

```text
# salida real
1 Política de devoluciones en 30 días 0.0328
3 Cómo pedir un reembolso 0.0161
```

El documento 1 sale primero porque aparece en las dos listas (vectorial y de texto); el 3 solo en la vectorial. Las puntuaciones son de RRF (1/(60+posición) sumadas), no similitudes.

> [!aviso] API cambiada
> `create_fts_index` está obsoleto desde la 0.25: usa `create_index("columna", config=FTS())`. Muchos tutoriales siguen con la forma antigua.

## Alternativas

- [[herramientas/chroma]]: también embebida, más simple, sin híbrida local.
- [[herramientas/qdrant]]: tiene modo embebido para pruebas y servidor para producción.
- [[herramientas/pgvector]]: dentro de Postgres.

Comparativa completa en [[docs/modelos-abiertos/05-bases-vectoriales]].

## Enlaces

- Repositorio: [github.com/lancedb/lancedb](https://github.com/lancedb/lancedb)
- Paquete Python: [pypi.org/project/lancedb](https://pypi.org/project/lancedb/)
