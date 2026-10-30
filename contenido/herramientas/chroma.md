---
titulo: Chroma
descripcion: "Base vectorial open source pensada para prototipos: se instala con pip, guarda en memoria o en disco y filtra por metadatos."
creado: 2026-10-29
tags: [rag, base-vectorial, prototipos]
relacionados: ["[[docs/modelos-abiertos/05-bases-vectoriales]]", "[[recetas/rag-minimo-viable]]", "[[glosario/vector-store]]"]
categoria: base-vectorial
licencia: Apache-2.0
open_source: true
lenguajes: [Python, TypeScript]
url: https://docs.trychroma.com
repositorio: https://github.com/chroma-core/chroma
version: "1.5.9"
revisado: 2026-10-29
---

Chroma es una base de datos vectorial con licencia Apache-2.0 que se usa como biblioteca: `pip install chromadb` y en tres líneas tienes una colección en memoria o en una carpeta. Guarda documentos, [[glosario/embeddings]] y metadatos, y consulta por similitud con filtros `where` (metadatos) y `where_document` (texto). La empresa detrás ofrece además Chroma Cloud, un servicio comercial.

## Para qué sirve

- Un [[glosario/vector-store]] para el primer [[glosario/rag]] de un notebook o una demo.
- Probar troceados y modelos de embeddings sin montar infraestructura.
- Tests de una aplicación RAG con un cliente efímero que desaparece al terminar.

## Cuándo usarla

Para prototipos locales sencillos, como el de [[recetas/rag-minimo-viable]], y cuando el volumen y los filtros son modestos.

## Cuándo no

- **Si necesitas búsqueda híbrida en local.** El cliente tiene una Search API con `Rrf`, pero la documentación es clara: «Search API is available in Chroma Cloud only». Para híbrida local, [[herramientas/lancedb]], [[herramientas/qdrant]] o [[herramientas/pgvector]].
- Si ya tienes Postgres o necesitas multitenencia seria: [[herramientas/pgvector]] o [[herramientas/qdrant]].

## Ejemplo mínimo

Ejecutado con `chromadb` 1.5.9 (en un entorno aparte del de comprobación de la web, por eso el bloque no se valida automáticamente):

```python nocheck title="chroma_minimo.py"
import chromadb

client = chromadb.EphemeralClient()  # en memoria; para disco: chromadb.PersistentClient(path="./chroma")
col = client.get_or_create_collection("docs", metadata={"hnsw:space": "cosine"})
col.add(
    ids=["1", "2", "3"],
    documents=["Política de devoluciones en 30 días", "Horario de soporte técnico", "Cómo pedir un reembolso"],
    embeddings=[[0.1, 0.9, 0.1], [0.9, 0.1, 0.0], [0.2, 0.8, 0.2]],  # tus embeddings
    metadatas=[{"tenant": "acme"}, {"tenant": "acme"}, {"tenant": "otra"}],
)
r = col.query(query_embeddings=[[0.1, 0.9, 0.1]], n_results=2, where={"tenant": "acme"})
print(r["ids"][0], r["documents"][0])
```

```text
# salida real
['1', '2'] ['Política de devoluciones en 30 días', 'Horario de soporte técnico']
```

El documento 3 se parece más a la consulta que el 2, pero pertenece a otro cliente y el filtro lo excluye. Si no pasas `embeddings`, Chroma calcula los vectores con su función por defecto: en un proyecto real, fija tú el modelo de embeddings para que el índice y las consultas usen el mismo. Fíjate también en `hnsw:space`: si lo omites, la distancia por defecto puede no ser la que espera tu modelo.

## Alternativas

- [[herramientas/lancedb]]: también embebida, con híbrida local.
- [[herramientas/qdrant]]: base dedicada con modo embebido para pruebas.
- [[herramientas/pgvector]]: dentro de Postgres.

## Enlaces

- Documentación: [docs.trychroma.com](https://docs.trychroma.com)
- Search API (solo Chroma Cloud): [docs.trychroma.com/cloud/search-api/overview](https://docs.trychroma.com/cloud/search-api/overview)
- Repositorio: [github.com/chroma-core/chroma](https://github.com/chroma-core/chroma)
