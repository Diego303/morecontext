---
titulo: Checklist para construir un RAG
descripcion: Checklist accionable para diseñar un RAG antes de escribir código, de las fuentes y el chunking a los permisos, la evaluación, la observabilidad y el coste, con las decisiones a apuntar.
creado: 2026-10-29
tipo: checklist
formato: md
archivo: checklist-rag.md
tags: [plantillas, rag, checklist, produccion]
relacionados: ["[[cursos/rag-a-fondo/01-anatomia-de-un-rag]]", "[[recetas/rag-minimo-viable]]", "[[recetas/depurar-un-rag]]", "[[cursos/rag-a-fondo/10-evaluar-un-rag]]", "[[docs/contexto/03-rag]]"]
---

Un [[glosario/rag|RAG]] es sobre todo un sistema de **recuperación de información**: si el modelo no ve la evidencia correcta, en el momento correcto y con los permisos correctos, no hay prompt que lo arregle. Cuando un RAG falla, la causa suele estar antes del modelo, en decisiones que nadie tomó de forma explícita: cómo se extrae el texto de los PDF, qué metadatos se guardan, cómo se filtran los permisos, cómo se mide si recupera bien. Este checklist convierte esas decisiones en una lista que rellenas **antes de escribir código** y que revisas antes de ir a producción. Sale de los apuntes del autor sobre RAG (su «checklist mental» y la lista de piezas mínimas y de producción), ordenado por etapas y con lo que hay que dejar escrito en cada punto.

## Cuándo usarla

- Al diseñar un RAG nuevo, para no descubrir en producción que falta el filtrado por permisos o la evaluación.
- Al revisar un RAG que ya existe y «responde regular»: cada casilla sin respuesta es un sospechoso ([[recetas/depurar-un-rag]]).
- Como guion de una revisión de diseño con el equipo o con un agente que vaya a implementarlo.

No hace falta marcarlo todo para un prototipo: la parte «mínimo» basta para una prueba de concepto ([[recetas/rag-minimo-viable]]). La parte «producción» es la que separa una demo de un sistema.

## La plantilla

```markdown title="checklist-rag.md"
# Checklist de RAG · <nombre del sistema>

Responsable: <persona> · Fecha: <AAAA-MM-DD> · Usuarios: <quién pregunta y qué espera>
Pregunta tipo: «<una pregunta real que el sistema debe responder>»

## 1. Mínimo (prueba de concepto)

### Fuentes y corpus
- [ ] ¿De dónde vienen los datos? Fuentes: <wiki, PDF, base de datos, API…> · Volumen: <n documentos>
- [ ] ¿Son fiables y quién es su dueño? <responsable de cada fuente>
- [ ] ¿Hay versiones o documentos que se contradicen? Regla de vigencia: <campo y criterio>

### Extracción
- [ ] ¿Cómo extraigo el texto? Herramienta: <parser u OCR> · Probado con: <3 documentos difíciles>
- [ ] ¿Cómo manejo tablas, imágenes y la jerarquía (títulos, secciones)? <estrategia>

### Chunking
- [ ] ¿Cómo corto? Estrategia: <por tokens, por estructura, semántica, padre-hijo> · Tamaño: <n> · Solapamiento: <n>
- [ ] ¿Cada chunk se entiende solo? Si no: <añadir título o contexto del documento>

### Metadatos
- [ ] ¿Qué guardo con cada chunk? <documento, sección, fecha, versión, permisos, idioma, URL>

### Embeddings e índice
- [ ] ¿Qué modelo de embeddings uso? Modelo: <nombre y versión> · Dimensión: <n> · Idiomas: <…>
- [ ] ¿Qué métrica de similitud recomienda ese modelo? <coseno | producto escalar | euclídea>
- [ ] ¿Qué índice o base vectorial uso? <nombre> · ¿Búsqueda exacta o aproximada (ANN)? <decisión y por qué>

### Recuperación y respuesta
- [ ] ¿Cuántos resultados recupero (top-k) y cuántos pasan al modelo? <k recuperados> → <n al contexto>
- [ ] ¿Cómo construyo el contexto? Orden, formato y límite de tokens: <…>
- [ ] ¿Cómo genero citas? <id de chunk o documento en la respuesta, comprobable>
- [ ] ¿Qué hace si no encuentra nada? <decir que no lo sabe, pedir aclaración>

## 2. Producción

### Recuperación mejor
- [ ] ¿Necesito BM25 o búsqueda híbrida? (IDs, códigos, nombres propios) <decisión>
- [ ] ¿Cómo fusiono rankings? <RRF u otra> · ¿Necesito reranker? <modelo y cuántos candidatos>
- [ ] ¿Reescribo o descompongo la consulta? <cuándo y cómo>

### Permisos y seguridad
- [ ] ¿Cómo filtro por permisos? El filtro va en la consulta al índice, no después: <campo y regla>
- [ ] ¿Hay varios clientes (multi-tenant)? Aislamiento: <índice por cliente | filtro obligatorio>
- [ ] ¿Cómo manejo la inyección de prompt en los documentos? <se tratan como datos; qué herramientas puede usar el modelo>
- [ ] ¿Qué datos sensibles no deben entrar en el índice ni en los logs? <lista>

### Evaluación
- [ ] ¿Cómo evalúo la recuperación? Conjunto: <n preguntas con su documento esperado> · Métricas: <Recall@K, MRR>
- [ ] ¿Cómo evalúo las respuestas? <fidelidad al contexto, corrección, citas válidas> · Juez: <código | modelo | humano>
- [ ] ¿Corre en CI? <cuándo y con qué umbral>

### Mantenimiento
- [ ] ¿Qué pasa cuando cambia o se borra un documento? <reindexado incremental por id y hash>
- [ ] ¿Cómo detecto documentos obsoletos? <campo de vigencia y alerta>
- [ ] ¿Cómo versiono el modelo de embeddings? Cambiarlo obliga a reindexar todo: <procedimiento>

### Observabilidad, coste y latencia
- [ ] ¿Qué registro por consulta? <consulta, ids recuperados con puntuación, filtros, contexto enviado, modelo, tokens, latencia, respuesta>
- [ ] ¿Cuánto cuesta una consulta y cuánto tarda? Objetivo: <€ o tokens por consulta> · <p95 en ms>
- [ ] ¿Qué cacheo? <embeddings de consultas repetidas, prompt de sistema>
```

## Cómo rellenarla

Rellénala con frases cortas y decisiones, no con casillas marcadas a ciegas. Una casilla marcada sin el texto de la derecha no vale nada en una revisión.

- **Cabecera.** La *pregunta tipo* es la prueba más barata del diseño: si no sabes qué documento debería responderla, todavía no conoces tu corpus.
- **Fuentes y extracción.** Prueba la extracción con los tres documentos más feos que tengas (un PDF escaneado, uno con tablas, uno con columnas) antes de elegir herramienta. El corpus manda más que el modelo ([[cursos/rag-a-fondo/06-el-corpus-manda]]).
- **Chunking y metadatos.** Decide el tamaño por el tipo de pregunta: respuestas puntuales piden chunks pequeños; explicaciones, chunks grandes o padre-hijo ([[recetas/chunks-padre-hijo]]). Los [[glosario/metadatos|metadatos]] que no guardes hoy no podrás usarlos para filtrar mañana.
- **Embeddings.** Usa la métrica que indique el proveedor del modelo y anota la versión exacta: vectores de dos modelos distintos no son comparables entre sí.
- **Top-k.** Recuperar mucho y pasar poco: recupera más candidatos de los que caben y deja que el [[glosario/reranking|reranking]] elija.
- **Permisos.** Es la casilla que más cuesta añadir después. Filtra en la consulta: si recuperas primero y filtras al final, los documentos prohibidos ya han ocupado los puestos del top-k ([[cursos/rag-a-fondo/07-permisos-y-multi-tenant]]).
- **Evaluación.** Separa recuperación y generación: si mides solo la respuesta final, no sabrás si falló el índice o el modelo ([[cursos/rag-a-fondo/10-evaluar-un-rag]]).
- **Observabilidad.** Registra los ids recuperados con su puntuación en cada consulta. Sin eso, depurar un RAG es adivinar.
- **Coste.** Pon el objetivo en la unidad que te importe (dinero, tokens o tiempo por consulta) y mídelo desde la primera versión.

## Ejemplo

Parte de la checklist de un asistente interno sobre políticas de RRHH:

```markdown title="checklist-rag.md"
# Checklist de RAG · Asistente de políticas de RRHH

Responsable: equipo de plataforma · Fecha: 2026-10-29 · Usuarios: empleados con dudas sobre vacaciones y permisos
Pregunta tipo: «¿Cuántos días de vacaciones tengo si entré en marzo?»

### Fuentes y corpus
- [x] ¿De dónde vienen los datos? Fuentes: 38 PDF de la intranet y la wiki de RRHH · Volumen: unas 900 páginas
- [x] ¿Hay versiones que se contradicen? Sí: manuales de 2025 y 2026. Regla: solo `vigente: true`, y la fecha de vigencia va en la cita.

### Permisos y seguridad
- [x] ¿Cómo filtro por permisos? Filtro `departamento in grupos_del_usuario` dentro de la consulta al índice.
- [ ] ¿Qué datos sensibles no deben entrar en el índice? Pendiente: las tablas salariales por nivel. Decide RRHH.
```

## Errores típicos

- **Empezar por la base vectorial.** Es la decisión que menos cambia la calidad. Primero el corpus, la extracción y la evaluación.
- **Mezclar vectores de dos modelos de embeddings** en el mismo índice tras actualizar el modelo. Las distancias dejan de significar nada.
- **Solo búsqueda semántica** cuando las preguntas incluyen códigos, referencias o nombres exactos: añade BM25 ([[recetas/busqueda-hibrida-con-bm25]]).
- **Permisos aplicados en el prompt** («no muestres documentos de otros departamentos»). El modelo ya los ha visto. El filtro va en la recuperación.
- **Sin conjunto de evaluación.** Cada cambio de chunking o de top-k se decide a ojo y nadie sabe si mejoró ([[recetas/evals-de-regresion-en-ci]]).
- **Logs con datos personales** copiados de las consultas y del contexto. Registra lo necesario para depurar y nada más.

## Relacionadas

- [[cursos/rag-a-fondo/01-anatomia-de-un-rag]]: las piezas que recorre este checklist.
- [[cursos/rag-a-fondo/02-indexar-bien]] · [[cursos/rag-a-fondo/03-recuperar-bien]] · [[cursos/rag-a-fondo/08-mantener-el-indice]]
- [[recetas/depurar-un-rag]]: ocho preguntas cuando responde mal.
- [[sistemas/rag-con-citas]]: un RAG completo con citas verificables.
- [[problemas/el-rag-no-encuentra-el-documento]] · [[problemas/el-rag-encuentra-pero-responde-mal]]
