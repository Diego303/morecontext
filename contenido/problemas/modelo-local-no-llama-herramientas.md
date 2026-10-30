---
titulo: Mi modelo local no llama a las herramientas
descripcion: Por qué un modelo en Ollama, vLLM o llama.cpp responde con texto en lugar de llamar a tus herramientas, y cómo comprobar el soporte, la plantilla de chat, num_ctx y el parser.
creado: 2026-10-29
sintoma: Mi modelo local no llama a las herramientas
tema: herramientas
nivel: intermedio
tags: [modelos-abiertos, ollama, vllm, herramientas]
relacionados: ["[[docs/modelos-abiertos/01-ollama]]", "[[docs/modelos-abiertos/02-vllm-y-llama-cpp]]", "[[cursos/agentes-con-modelos-abiertos/04-herramientas-con-modelos-abiertos]]", "[[recetas/agente-local-con-ollama]]"]
---

El mismo agente que funciona con la API de Claude, apuntado a un modelo local, nunca llama a las herramientas. Según el caso ves una de estas cosas: un error de Ollama que dice `registry.ollama.ai/library/<modelo>:latest does not support tools`; una respuesta en texto que contiene algo como `<tool_call>{"name": "buscar_pedido", …}</tool_call>` en lugar de una llamada estructurada; o un modelo que llamaba bien a las herramientas en una prueba corta y deja de hacerlo con el prompt completo del agente.

Esta página no la he podido reproducir aquí (no hay servidor de inferencia en este entorno): los datos vienen de la documentación de Ollama y vLLM verificada para MoreContext en octubre de 2026, y el mensaje de Ollama, de informes públicos de usuarios.

## Causas

- **El modelo no tiene soporte de herramientas.** No todos los [[glosario/pesos-abiertos|modelos de pesos abiertos]] están entrenados para *tool calling*, y no todas las variantes de una familia lo traen.
- **La [[glosario/plantilla-de-chat|plantilla de chat]] no incluye las herramientas.** Si importaste un GGUF con un Modelfile propio, la plantilla puede no tener el bloque de herramientas: el modelo nunca las ve. En llama.cpp hace falta `--jinja` (activo por defecto hoy) para usar la plantilla del modelo.
- **`num_ctx` demasiado bajo en Ollama.** El contexto por defecto es pequeño (la propia documentación da valores distintos según la página y la VRAM) y **trunca en silencio**. Un `system` largo más las definiciones de herramientas se cortan y el modelo deja de saber que existen.
- **vLLM sin el parser.** Sin `--enable-auto-tool-choice --tool-call-parser <parser>`, o con un parser que no corresponde al modelo, las llamadas llegan como texto en `content`.
- **Forzar la herramienta no funciona.** Ollama no implementa `tool_choice` ni en su API compatible con OpenAI ni en la compatible con Anthropic.
- **Un modelo demasiado pequeño o muy cuantizado.** Con el KV cache en `q4_0`, la documentación de llama.cpp avisa de que empeora el *tool calling*.

## Cómo confirmarlo

```bash
ollama show qwen3.6:27b                           # en «Capabilities» debe aparecer tools
ollama show qwen3.6:27b --modelfile               # la plantilla debe tratar las herramientas
ollama ps                                         # columna CONTEXT: el num_ctx con que está cargado
```

En vLLM, mira el comando de arranque: si falta `--tool-call-parser` o no es el de la *model card*, ahí está. Y prueba siempre con el prompt completo del agente, no con un «hola»: el truncado solo aparece cuando el contexto crece.

## Arreglo

1. **Elige un modelo con la capacidad `tools`** en su página de Ollama o en su *model card*.
2. **Sube el contexto.** Ollama recomienda al menos 64 000 tokens para agentes, si la memoria lo permite:

```python tab="Ollama" nocheck
from ollama import chat

r = chat(model="qwen3.6:27b", messages=messages, tools=[buscar_pedido],
         options={"num_ctx": 65536})                     # por petición, en la API nativa
```

```python tab="LangChain"
from langchain_ollama import ChatOllama

llm = ChatOllama(model="qwen3.6:27b", num_ctx=65536, reasoning=False)
```

La API compatible con OpenAI no tiene campo de contexto: crea un modelo con `PARAMETER num_ctx 65536` en un Modelfile (`ollama create`) o fija `OLLAMA_CONTEXT_LENGTH` en el servidor.

3. **En vLLM, arranca con el parser de la *model card*:**

```bash
vllm serve Qwen/Qwen3.6-35B-A3B --max-model-len 262144 \
  --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder
```

4. **Si importaste el GGUF tú**, copia la plantilla del modelo oficial (`ollama show <modelo> --modelfile`) y cambia solo la línea `FROM`.

5. **No dependas de forzar.** Para un resultado estructurado al final, usa salida con esquema (`format` en Ollama, `response_format` en vLLM) y valídalo ([[problemas/json-invalido-del-modelo]]).

## Cómo evitarlo

- Mide el modelo con tus herramientas y tu prompt antes de elegirlo, y repite al cambiar de versión de modelo o de motor: el parser o la plantilla pueden cambiar el resultado sin que cambie el modelo ([[modelos/11-modelos-abiertos]]).
- Fija `num_ctx` siempre de forma explícita y comprueba con `ollama ps` ([[modelos/12-inferencia-local]]).
- Valida los argumentos que llegan: un modelo local devuelve JSON roto más a menudo. Devuélvelo con `is_error` en lugar de romper el bucle.
- Ten un límite de pasos: con modelos pequeños los bucles son más frecuentes ([[problemas/el-agente-no-para]]).

## Ver también

- [[docs/modelos-abiertos/01-ollama]]
- [[recetas/servir-un-modelo-con-vllm]]
- [[recetas/agente-de-codigo-con-modelo-local]]
- [[glosario/inferencia-local]]
