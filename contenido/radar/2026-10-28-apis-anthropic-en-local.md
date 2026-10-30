---
titulo: Tu código de Claude ya habla con modelos locales
descripcion: Ollama, LM Studio, llama.cpp y vLLM exponen /v1/messages compatible con Anthropic. El SDK funciona cambiando base_url, con lagunas en tool_choice y caché.
creado: 2026-10-28
categoria: herramientas
tags: [modelos-abiertos, ollama, vllm, compatibilidad, sdk]
fuente:
  titulo: Anthropic compatibility · Documentación de Ollama
  url: https://docs.ollama.com/api/anthropic-compatibility
relacionados: ["[[docs/modelos-abiertos/03-apis-compatibles-y-litellm]]", "[[docs/modelos-abiertos/01-ollama]]", "[[cursos/agentes-con-modelos-abiertos/04-herramientas-con-modelos-abiertos]]", "[[glosario/inferencia-local]]"]
---

## Qué es

Los servidores de modelos abiertos ya no hablan solo el formato de OpenAI. A finales de octubre de 2026 exponen también la API de Mensajes de Anthropic (`/v1/messages`): Ollama (v0.40.12, 27 oct.), LM Studio desde la 0.4.1, `llama-server` de llama.cpp, vLLM 0.32 y el *router* de SGLang 0.5.22. El código con el SDK `anthropic` que usa esta web funciona contra un modelo local cambiando una línea ([compatibilidad con Anthropic en Ollama](https://docs.ollama.com/api/anthropic-compatibility)):

```python nocheck
client = anthropic.Anthropic(base_url="http://localhost:11434", api_key="ollama")
```

## Qué cambia en la práctica

- Puedes probar un agente con un modelo de [[glosario/pesos-abiertos|pesos abiertos]] sin reescribir el bucle, y usar Claude Code u otros clientes de Anthropic contra un servidor local.
- «Compatible» no es «idéntico». Ollama acepta mensajes, *streaming*, sistema, imágenes en base64, herramientas, *thinking* y `output_config.effort`, pero **no** [[glosario/tool-choice|tool_choice]], [[glosario/prompt-caching|prompt caching]], `count_tokens`, *batches*, citas ni PDF. Acepta `budget_tokens` sin aplicarlo y sus recuentos de tokens son aproximados.
- vLLM documenta otras lagunas en su RFC #58647: ignora `thinking`, descarta `is_error`, no acepta la cabecera `x-api-key` y sus errores no siguen el formato de Anthropic.
- Que el modelo llame bien a las herramientas depende del modelo y del *parser* del servidor, no de la API.

## Qué hacer

1. Si un ejemplo depende de `tool_choice`, la caché o `count_tokens`, no lo des por bueno en local: pruébalo. La matriz de qué acepta cada motor está en [[docs/modelos-abiertos/03-apis-compatibles-y-litellm]].
2. Sube el contexto del servidor antes de culpar al modelo: [[docs/modelos-abiertos/01-ollama]].
3. Para un agente con herramientas en local, sigue [[cursos/agentes-con-modelos-abiertos/04-herramientas-con-modelos-abiertos]] o la receta [[recetas/agente-local-con-ollama]].
4. Pasa las mismas evals en local que en la API antes de cambiar de modelo.
