---
titulo: Inferencia local
descripcion: Ejecutar un modelo de pesos abiertos en tu propia máquina, con Ollama, llama.cpp o LM Studio, para que los datos no salgan de ella.
creado: 2026-10-29
categoria: produccion
ingles: Local inference
aliases: [local inference, modelo local, modelos locales, LLM local]
tags: [produccion, modelos-abiertos, privacidad]
relacionados: ["[[modelos/12-inferencia-local]]", "[[cursos/agentes-con-modelos-abiertos/02-tu-primer-modelo-en-local]]", "[[docs/modelos-abiertos/01-ollama]]", "[[sistemas/asistente-100-local]]"]
---

Inferencia local es ejecutar un modelo de [[glosario/pesos-abiertos]] en tu ordenador o en un servidor de tu red, sin llamar a la API de un proveedor. Ganas privacidad y coste marginal casi nulo; a cambio, la calidad queda limitada por tu memoria y la operación es tuya.

## En la práctica

Las herramientas habituales son Ollama, llama.cpp (`llama-server`) y LM Studio, que es una aplicación propietaria aunque gratuita. Todas exponen una API compatible con OpenAI y, cada vez más, con la API de Mensajes de Anthropic, así que el código de la web funciona cambiando `base_url`, con lagunas que varían según el motor (en Ollama, sin `tool_choice`, sin *prompt caching* y sin contar tokens).

Tres trampas frecuentes en agentes. El contexto por defecto de Ollama es pequeño y **trunca en silencio**: súbelo (Ollama recomienda al menos 64 000 tokens para agentes) y compruébalo con `ollama ps`. La memoria la marcan la [[glosario/cuantizacion]], la [[glosario/kv-cache]] y, en un MoE, todos los parámetros. Y los modelos con etiqueta `:cloud` en Ollama no se ejecutan en tu máquina.

## No confundir con

- **Autoalojado**: un modelo abierto servido en tus GPU o tu nube, normalmente con vLLM o SGLang, para muchos usuarios a la vez.
- **[[glosario/pesos-abiertos]]**: la condición para poder ejecutarlo; no dice dónde se ejecuta.

## Ver también

- [[cursos/agentes-con-modelos-abiertos/06-local-o-api]]
- [[recetas/agente-local-con-ollama]]
- [[problemas/modelo-local-no-llama-herramientas]]
- [[glosario/gguf]]
