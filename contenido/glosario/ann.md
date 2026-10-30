---
titulo: ANN (vecinos aproximados)
descripcion: Búsqueda de los vectores más cercanos a una consulta sin compararla con todos, a cambio de perder a veces algún vecino.
creado: 2026-10-29
categoria: contexto
ingles: Approximate nearest neighbor
aliases: [ANN, approximate nearest neighbor, approximate nearest neighbour, vecinos más cercanos aproximados, búsqueda aproximada]
tags: [rag, busqueda, bases-vectoriales]
relacionados: ["[[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]", "[[glosario/hnsw]]", "[[glosario/ivf]]", "[[glosario/vector-store]]"]
---

ANN (*approximate nearest neighbor*) es la familia de algoritmos que encuentra vectores muy cercanos a una consulta sin recorrer toda la colección. Un índice organiza los [[glosario/embeddings]] de antemano (en un grafo, en grupos o comprimidos) para explorar solo la zona prometedora. A cambio, a veces se le escapa algún vecino que una búsqueda exhaustiva sí habría devuelto.

## En la práctica

Comparar la consulta con todos los vectores es exacto y sencillo, y con unos pocos miles de fragmentos va sobrado. Con millones, cada consulta se vuelve lenta y cara, y ahí entra el índice ANN. Casi todos exponen un parámetro que cambia exactitud por velocidad: en pgvector, `hnsw.ef_search` (40 por defecto) o `ivfflat.probes` (1 por defecto); en Qdrant, `hnsw_ef` en los parámetros de búsqueda, y `exact=True` para forzar la búsqueda exhaustiva. Mide cuánto pierdes: compara el top-K del índice con el de la búsqueda exacta sobre tus consultas reales y calcula su [[glosario/recall-at-k|recall@K]].

## No confundir con

- **Búsqueda exacta (kNN)**: compara contra todo y garantiza los K vecinos verdaderos. Es la referencia con la que mides un índice ANN.
- **[[glosario/similitud-coseno]]**: es la medida de distancia; ANN es la forma de buscar rápido con esa medida.

## Ver también

- [[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]
- [[glosario/hnsw]]
- [[glosario/ivf]]
- [[glosario/cuantizacion-de-producto]]
- [[docs/modelos-abiertos/05-bases-vectoriales]]
