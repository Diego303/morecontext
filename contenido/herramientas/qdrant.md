---
titulo: Qdrant
descripcion: Base de datos vectorial open source con filtros por payload, multitenencia y búsqueda híbrida densa, sparse y BM25 con fusión RRF.
creado: 2026-10-29
tags: [rag, base-vectorial]
relacionados: ["[[recetas/busqueda-hibrida-con-qdrant]]", "[[docs/modelos-abiertos/05-bases-vectoriales]]", "[[glosario/busqueda-hibrida]]", "[[cursos/rag-a-fondo/07-permisos-y-multi-tenant]]"]
categoria: base-vectorial
licencia: Apache-2.0
open_source: true
lenguajes: [Python, TypeScript, Rust]
url: https://qdrant.tech
repositorio: https://github.com/qdrant/qdrant
version: "1.20.0"
revisado: 2026-10-29
---

Qdrant es una base de datos vectorial escrita en Rust, con licencia Apache-2.0. Guarda puntos con uno o varios vectores con nombre (densos y *sparse*) y un *payload* JSON por el que puedes filtrar. Su API de consultas combina varias búsquedas previas (`prefetch`) y las fusiona con [[glosario/rrf]] o DBSF. El cliente de Python trae un **modo embebido** (`:memory:` o una carpeta) que permite probar sin servidor.

## Para qué sirve

- Recuperación para [[glosario/rag]] con filtros ricos sobre metadatos.
- [[glosario/busqueda-hibrida]] nativa: denso + *sparse* (con `Modifier.IDF`) y, desde la 1.20, **BM25 directamente sobre el texto del payload** con `TextQuery`, sin calcular vectores *sparse*.
- [[glosario/multi-tenant]]: un índice de payload marcado con `is_tenant=True` separa los datos de cada cliente.

## Cuándo usarla

Cuando necesitas una base dedicada: muchos vectores, filtros complejos, varios clientes en la misma colección y una API de búsqueda híbrida que no tengas que escribir a mano. El modo embebido sirve para tests y notebooks con el mismo código que en producción.

## Cuándo no

- Si ya tienes Postgres y pocos millones de fragmentos: [[herramientas/pgvector]] evita otro sistema.
- Si quieres todo en un fichero, sin proceso aparte: [[herramientas/lancedb]].
- Para depender del modo embebido en producción: los índices de payload no tienen efecto en modo local (salvo los de texto con `scoring`).

## Ejemplo mínimo

Ejecutado con `qdrant-client` 1.20.0 en modo embebido:

```python title="qdrant_minimo.py"
from qdrant_client import QdrantClient, models

client = QdrantClient(":memory:")  # en servidor: QdrantClient(url="http://localhost:6333")
client.create_collection(
    collection_name="docs",
    vectors_config=models.VectorParams(size=3, distance=models.Distance.COSINE),
)
client.upsert("docs", points=[
    models.PointStruct(id=1, vector=[0.1, 0.9, 0.1], payload={"tenant_id": "acme", "texto": "Política de devoluciones"}),
    models.PointStruct(id=2, vector=[0.9, 0.1, 0.0], payload={"tenant_id": "acme", "texto": "Horario de soporte"}),
    models.PointStruct(id=3, vector=[0.1, 0.8, 0.2], payload={"tenant_id": "otra", "texto": "Devoluciones de otro cliente"}),
])
solo_acme = models.Filter(must=[models.FieldCondition(key="tenant_id", match=models.MatchValue(value="acme"))])
res = client.query_points("docs", query=[0.1, 0.9, 0.1], query_filter=solo_acme, limit=2, with_payload=True)
for p in res.points:
    print(p.id, round(p.score, 3), p.payload["texto"])
```

```text
# salida real
1 1.0 Política de devoluciones
2 0.218 Horario de soporte
```

El punto 3 es igual de parecido, pero el filtro lo deja fuera. La versión híbrida (vectores con nombre, `Prefetch` y `RrfQuery(rrf=Rrf(k=60))`) está en [[recetas/busqueda-hibrida-con-qdrant]].

> [!consejo] Versiones alineadas
> Cliente y servidor deben ir a la par: BM25 sobre texto exige servidor ≥ 1.20, la `k` de RRF ≥ 1.16 y el RRF ponderado ≥ 1.17. La documentación recomienda no tocar los pesos sin un conjunto de evaluación.

## Alternativas

- [[herramientas/pgvector]]: vectores dentro de Postgres.
- [[herramientas/lancedb]]: embebida y en ficheros, con híbrida local.
- [[herramientas/chroma]]: la más simple para prototipos.
- Weaviate (BSD-3) y Milvus (Apache-2.0) para plataformas mayores; ver [[docs/modelos-abiertos/05-bases-vectoriales]].

## Enlaces

- Web y documentación: [qdrant.tech](https://qdrant.tech)
- Consultas híbridas: [qdrant.tech/documentation/search/hybrid-queries](https://qdrant.tech/documentation/search/hybrid-queries/)
- Repositorio y *releases*: [github.com/qdrant/qdrant](https://github.com/qdrant/qdrant/releases)
- Cliente Python: [github.com/qdrant/qdrant-client](https://github.com/qdrant/qdrant-client)
