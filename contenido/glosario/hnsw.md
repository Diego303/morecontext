---
titulo: HNSW
descripcion: Índice de vecinos aproximados basado en un grafo de varias capas; el más usado en bases vectoriales como pgvector y Qdrant.
creado: 2026-10-29
categoria: contexto
ingles: Hierarchical Navigable Small World
aliases: [Hierarchical Navigable Small World, índice HNSW, grafo HNSW]
tags: [rag, busqueda, bases-vectoriales]
relacionados: ["[[glosario/ann]]", "[[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]", "[[herramientas/pgvector]]", "[[herramientas/qdrant]]"]
---

HNSW (*Hierarchical Navigable Small World*) es un índice [[glosario/ann|ANN]] que conecta cada vector con sus vecinos cercanos formando un grafo de varias capas. Las capas superiores tienen pocos nodos y enlaces largos; las inferiores, todos los nodos y enlaces cortos. La búsqueda entra por arriba, salta hacia la zona de la consulta y baja capa a capa afinando.

## En la práctica

Tiene tres parámetros. `m` es el número máximo de conexiones por nodo; `ef_construction`, cuántos candidatos se exploran al insertar; `ef_search`, cuántos al consultar. Más alto significa más recall y más memoria o latencia. En pgvector:

```sql
CREATE INDEX ON fragmentos USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);   -- los valores por defecto
SET hnsw.ef_search = 100;                -- por defecto 40
```

En Qdrant se llaman `m` y `ef_construct` (configuración de la colección) y `hnsw_ef` (en la búsqueda). Sube `ef_search` antes de reconstruir el índice: es lo único que se cambia en caliente. Si filtras por metadatos, recuerda que en pgvector el filtro se aplica después del índice; `hnsw.iterative_scan = relaxed_order` evita quedarte con menos resultados de los pedidos.

## No confundir con

- **[[glosario/ivf]]**: agrupa los vectores en clusters en vez de enlazarlos en un grafo. Se construye más rápido y ocupa menos, pero suele necesitar más ajuste para el mismo recall.

## Ver también

- [[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]
- [[glosario/ann]]
- [[herramientas/pgvector]]
- [[recetas/rag-local-con-pgvector]]
