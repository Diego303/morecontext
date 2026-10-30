---
titulo: Metadatos
descripcion: Datos estructurados que acompañan a cada fragmento indexado (origen, fecha, idioma, permisos) y sirven para filtrar, citar y reindexar.
creado: 2026-10-29
categoria: contexto
ingles: Metadata
aliases: [metadata, metadato, payload, filtros por metadatos, metadata filtering]
tags: [rag, indexacion, busqueda]
relacionados: ["[[cursos/rag-a-fondo/02-indexar-bien]]", "[[glosario/multi-tenant]]", "[[glosario/vector-store]]"]
---

En un RAG, los metadatos son los campos estructurados que guardas junto a cada fragmento: de qué documento sale, su sección, fecha, idioma, versión, quién puede verlo. No forman parte del embedding: el vector representa el contenido y los metadatos describen el fragmento para poder filtrarlo y citarlo.

## En la práctica

```json
{"id": "a3f9c2e1", "doc_id": "politica-vacaciones", "seccion": "Solicitud",
 "actualizado": "2026-03-01", "idioma": "es", "tenant_id": "acme", "acl": ["rrhh"]}
```

Sirven para cuatro cosas: **filtrar** dentro de la búsqueda (solo la versión vigente, solo español, solo lo que el usuario puede ver), **citar** con precisión, **reindexar** solo lo que cambió (un `hash` del texto) y **aislar** inquilinos en un sistema [[glosario/multi-tenant]]. Aplica los filtros dentro de cada búsqueda, no después de cortar el top-K, o te quedarás sin candidatos válidos. En pgvector son columnas normales en el `WHERE`; en Qdrant viven en el *payload* y conviene crearles un índice. Un campo que no filtra, no ordena ni se cita sobra.

## No confundir con

- **[[glosario/embeddings]]**: representan el significado y se comparan por cercanía. Los metadatos se comparan por igualdad o rango, como en una base de datos.
- **[[glosario/recuperacion-contextual]]**: añade contexto en lenguaje natural al texto del fragmento, que sí se vectoriza.

## Ver también

- [[cursos/rag-a-fondo/02-indexar-bien]]
- [[cursos/rag-a-fondo/07-permisos-y-multi-tenant]]
- [[recetas/reindexado-incremental]]
- [[recetas/chunks-padre-hijo]]
