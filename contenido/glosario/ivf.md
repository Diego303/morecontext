---
titulo: IVF
descripcion: Índice de vecinos aproximados que reparte los vectores en clusters y, en cada consulta, solo busca dentro de los más cercanos.
creado: 2026-10-29
categoria: contexto
ingles: Inverted file index
aliases: [inverted file index, IVFFlat, índice IVF, índice de ficheros invertidos]
tags: [rag, busqueda, bases-vectoriales]
relacionados: ["[[glosario/ann]]", "[[glosario/hnsw]]", "[[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]"]
---

IVF (*inverted file index*) es un índice [[glosario/ann|ANN]] que agrupa los vectores en clusters, cada uno con un centroide. Al consultar, compara la consulta solo con los centroides, elige los más cercanos y busca dentro de esos grupos. Reduce el espacio de búsqueda; si el vecino bueno cayó en un cluster que no se visita, se pierde.

## En la práctica

Dos parámetros: cuántos clusters hay y cuántos se visitan por consulta. En pgvector el índice es IVFFlat, con `lists` y `ivfflat.probes`:

```sql
-- unas 500 000 filas: lists = filas / 1000 (por encima de 1 M, raíz cuadrada de filas)
CREATE INDEX ON fragmentos USING ivfflat (embedding vector_cosine_ops) WITH (lists = 500);
SET ivfflat.probes = 22;   -- por defecto 1; empieza por la raíz de lists
```

Crea el índice **después** de cargar los datos: los centroides se calculan con lo que hay en la tabla, y si la creas vacía quedan mal repartidos. Si el corpus cambia mucho, reconstrúyelo. IVF se combina a menudo con [[glosario/cuantizacion-de-producto]] para comprimir los vectores de cada cluster.

## No confundir con

- **[[glosario/hnsw]]**: grafo de vecinos. Suele dar mejor equilibrio entre velocidad y recall y admite inserciones sin reconstruir, a costa de más memoria y construcción más lenta.
- **Índice invertido de texto**: el de los buscadores léxicos como [[glosario/bm25|BM25]], que apunta de cada término a sus documentos. IVF toma de ahí la idea de listas, pero cada lista agrupa los vectores de un cluster.

## Ver también

- [[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]
- [[glosario/ann]]
- [[herramientas/pgvector]]
- [[cursos/rag-a-fondo/08-mantener-el-indice]]
