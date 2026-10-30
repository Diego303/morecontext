---
titulo: Multi-tenant
descripcion: Un mismo sistema que sirve a varios clientes con datos aislados; en RAG, que una consulta nunca recupere fragmentos de otro inquilino.
creado: 2026-10-29
categoria: contexto
ingles: Multi-tenancy
aliases: [multi-tenancy, multitenencia, multiinquilino, tenant, aislamiento por inquilino]
tags: [rag, seguridad, produccion]
relacionados: ["[[cursos/rag-a-fondo/07-permisos-y-multi-tenant]]", "[[glosario/metadatos]]", "[[glosario/minimo-privilegio]]"]
---

Un sistema multi-tenant atiende a varios clientes (inquilinos, *tenants*) con la misma infraestructura y mantiene sus datos separados. En un RAG el requisito es concreto: una consulta de la empresa A no puede recuperar nunca un fragmento de la empresa B, aunque sea el más parecido.

## En la práctica

El aislamiento se aplica en la recuperación, no en el prompt: si un fragmento ajeno llega al contexto, ya lo has filtrado mal, digas lo que digas al modelo. Guarda `tenant_id` como metadato obligatorio y fíltralo dentro de cada búsqueda, tomándolo de la sesión autenticada y nunca de lo que escriba el usuario. En pgvector es un `WHERE tenant_id = $1` con su propio índice; como el filtro se aplica tras el índice aproximado, activa `hnsw.iterative_scan` o usa índices parciales o particiones por inquilino. En Qdrant, crea el índice de payload con `is_tenant=True` y pasa el filtro en cada `Prefetch`. Si el contrato exige aislamiento físico, una colección o base por cliente es más simple de auditar, a cambio de operar muchas.

## No confundir con

- **Permisos por documento** (ACL): dentro de un mismo inquilino, qué puede ver cada usuario. Se aplican igual, como filtro, y se suman al de `tenant_id`.

## Ver también

- [[cursos/rag-a-fondo/07-permisos-y-multi-tenant]]
- [[glosario/metadatos]]
- [[cursos/seguridad-y-prompt-injection/04-permisos-y-sandbox]]
- [[herramientas/qdrant]]
