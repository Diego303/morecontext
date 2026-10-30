---
titulo: Reescritura de consulta
descripcion: Transformar la pregunta del usuario en una o varias consultas mejores para el buscador antes de recuperar.
creado: 2026-10-29
categoria: contexto
ingles: Query rewriting
aliases: [query rewriting, reescritura de la consulta, query transformation, multi-query, descomposición de consulta, query decomposition]
tags: [rag, busqueda, consulta]
relacionados: ["[[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]", "[[glosario/hyde]]", "[[glosario/multi-hop]]"]
---

La reescritura de consulta usa un modelo para convertir lo que escribió el usuario en lo que conviene buscar. La pregunta original suele ser mala consulta: depende de la conversación, es vaga o mezcla varias preguntas en una.

## En la práctica

Tres variantes, de menos a más coste:

- **Autocontenida**: con el historial, «¿y en ese caso cuánto sería?» pasa a «días de vacaciones de un empleado contratado el 1 de octubre». Es la que más se nota en un chat, porque las preguntas de seguimiento fallan sin ella.
- **Multi-consulta**: generas tres o cuatro formulaciones, buscas con todas y fusionas con [[glosario/rrf|RRF]]. Más cobertura, más coste y algo más de ruido.
- **Descomposición**: partes una pregunta compuesta («compara la política de España con la de Portugal») en subpreguntas y recuperas para cada una. Es la base de las [[glosario/multi-hop|preguntas multi-hop]].

Pide la salida con [[glosario/salida-estructurada]] (una lista de consultas) y guarda en la traza la consulta original y las reescritas: cuando un documento no aparece, lo primero es mirar qué se buscó de verdad.

## No confundir con

- **[[glosario/hyde]]**: genera un documento hipotético que responde, no una consulta mejor.
- **Autoconsulta** (*self-querying*): el modelo extrae filtros de [[glosario/metadatos]] de la pregunta («de 2026», «del departamento legal»). Se combina bien con la reescritura.

## Ver también

- [[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]
- [[cursos/rag-a-fondo/03-recuperar-bien]]
- [[recetas/depurar-un-rag]]
- [[problemas/el-rag-no-encuentra-el-documento]]
