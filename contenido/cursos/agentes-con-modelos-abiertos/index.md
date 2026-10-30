---
titulo: Agentes con modelos abiertos
descripcion: Curso para construir agentes con modelos de pesos abiertos en tu máquina o en tu servidor, con herramientas, RAG local y un criterio claro para elegir entre local y API.
creado: 2026-10-29
orden: 13
nivel: intermedio
horas: 5
objetivo: Servir un modelo de pesos abiertos, construir con él un agente con herramientas y RAG sin enviar datos fuera y decidir con evals cuándo compensa frente a una API.
requiere: ["[[roadmap/40-primer-agente/index]]"]
relacionados: ["[[sistemas/asistente-100-local]]", "[[docs/modelos-abiertos/index]]", "[[modelos/11-modelos-abiertos]]", "[[glosario/pesos-abiertos]]"]
tags: [modelos-abiertos, ollama, vllm, rag, local]
---

Los ejemplos de MoreContext usan la API de Claude como referencia porque enseña el mecanismo sin ruido. Pero hay casos en los que los datos no pueden salir de tu red, el volumen hace caro pagar por token o simplemente quieres entender qué pasa cuando el modelo corre en tu propio hardware. Este curso enseña a construir agentes con **modelos de [[glosario/pesos-abiertos|pesos abiertos]]** servidos en local o en tus servidores, con el mismo rigor que el resto de la web.

## Objetivo

Al terminar sabrás leer la licencia de un modelo antes de usarlo, calcular cuánta memoria necesita, servirlo con [[herramientas/ollama|Ollama]] o [[herramientas/vllm|vLLM]], conectarle herramientas sin que se rompa el bucle, montar un RAG que no sale de tu máquina y justificar con tus evals si te quedas en local, en un servidor propio o en una API.

## Para quién

Para desarrolladores que ya han construido un agente con herramientas (el [[roadmap/40-primer-agente/index|nivel 40 del roadmap]]) y quieren hacerlo con modelos abiertos. No hace falta experiencia con GPU: la lección 2 empieza en un portátil.

## Requisitos

- El bucle agéntico a mano: [[roadmap/40-primer-agente/02-el-bucle-agentico]] y el ciclo de herramientas de [[roadmap/20-herramientas/01-ciclo-tool-use]].
- Para la lección 5, lo básico de RAG: [[roadmap/30-contexto-y-rag/index]].
- Python 3.11 o superior. Un equipo con 16 GB de memoria basta para los modelos pequeños; los de 27B piden unos 20 GB libres (la lección 2 enseña a calcularlo).
- Para las lecciones 3 y 5, Docker. vLLM necesita una GPU; si no la tienes, la lección explica el despliegue y puedes seguir con Ollama.

> [!nota] Cómo se ha probado el código
> Todo el código Python de este curso se ha ejecutado contra un servidor que imita las rutas de Ollama (`/api/chat`, `/api/embed`, `/v1/chat/completions`) y, en el RAG, contra pgvector 0.8.7 real. Los comandos de Ollama, vLLM, llama.cpp y Docker no se han podido ejecutar en el entorno de prueba: van con la sintaxis de la documentación oficial (versiones de octubre de 2026) y así se indica en cada caso.

## Temario

1. [[cursos/agentes-con-modelos-abiertos/01-pesos-abiertos-y-licencias]]. Qué es un modelo de pesos abiertos, qué exige la definición de [[glosario/open-source-ai|open source AI]] de la OSI y cómo leer una licencia en cuatro preguntas.
2. [[cursos/agentes-con-modelos-abiertos/02-tu-primer-modelo-en-local]]. Ollama de cero, sus APIs, el contexto `num_ctx` que trunca en silencio, [[glosario/gguf|GGUF]] y [[glosario/cuantizacion|cuantización]], y la fórmula de memoria para elegir tamaño.
3. [[cursos/agentes-con-modelos-abiertos/03-servir-modelos-en-produccion]]. vLLM con *tool calling*, SGLang, *batching* y [[glosario/kv-cache|KV cache]], coste operativo y LiteLLM como pasarela.
4. [[cursos/agentes-con-modelos-abiertos/04-herramientas-con-modelos-abiertos]]. El bucle con la API compatible con OpenAI, con el SDK de Anthropic contra Ollama y con LangChain; validar argumentos, reintentar y salidas con esquema.
5. [[cursos/agentes-con-modelos-abiertos/05-rag-cien-por-cien-local]]. Embeddings abiertos, pgvector en Docker, búsqueda híbrida con RRF, citas comprobadas y una evaluación mínima.
6. [[cursos/agentes-con-modelos-abiertos/06-local-o-api]]. El marco de decisión: privacidad, coste total, calidad, latencia, operación, licencia y los híbridos que enrutan por tarea.

## Qué construyes

Un **asistente 100 % local**: un agente en LangGraph sobre un modelo servido por Ollama, con una herramienta de búsqueda sobre tus documentos en pgvector, otra que escribe con aprobación humana y trazas en un Langfuse autoalojado. Ninguna petición sale de tu máquina. La arquitectura completa está en [[sistemas/asistente-100-local]] y cada lección te deja una pieza.

> [!aviso] Local no significa privado por defecto
> Las etiquetas `:cloud` de Ollama ejecutan el modelo en ollama.com, y `OLLAMA_HOST=0.0.0.0` expone tu servidor a la red sin autenticación. Revisa ambas cosas antes de meter datos sensibles.

Para la referencia de cada herramienta, el grupo [[docs/modelos-abiertos/index]] documenta Ollama, vLLM, llama.cpp, las APIs compatibles, embeddings, bases vectoriales, observabilidad y evals abiertas.
