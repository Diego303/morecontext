---
titulo: Ollama
descripcion: Servidor local que descarga modelos de pesos abiertos y los expone con API nativa, compatible con OpenAI y compatible con Anthropic.
creado: 2026-10-29
tags: [inferencia, modelos-abiertos, local]
relacionados: ["[[docs/modelos-abiertos/01-ollama]]", "[[recetas/agente-local-con-ollama]]", "[[cursos/agentes-con-modelos-abiertos/02-tu-primer-modelo-en-local]]", "[[glosario/inferencia-local]]"]
categoria: inferencia
licencia: MIT
open_source: true
lenguajes: [Python, TypeScript]
url: https://ollama.com
repositorio: https://github.com/ollama/ollama
version: "0.40.12"
revisado: 2026-10-29
---

Ollama es un servidor que corre en tu máquina: descarga modelos de [[glosario/pesos-abiertos]] (en formato [[glosario/gguf]] y MLX), decide cuánto cargar en GPU y cuánto en CPU, y los sirve por HTTP en `127.0.0.1:11434`. Expone tres APIs: la nativa (`/api/chat`), una compatible con OpenAI (`/v1`) y otra compatible con Anthropic (`/v1/messages`). Licencia MIT, tanto el servidor (el `LICENSE` del repositorio) como los clientes oficiales de Python y JavaScript.

## Para qué sirve

- Probar un modelo abierto en tu portátil en dos comandos, sin cuenta ni clave.
- Ejecutar el mismo código que usas con Claude contra un modelo local cambiando `base_url`.
- Dar backend a otras piezas: [[herramientas/open-webui]], [[herramientas/opencode]] o [[herramientas/promptfoo]] como juez local.
- Prototipar agentes con [[glosario/tool-use]] sin coste por token.

## Cuándo usarla

Cuando quieres [[glosario/inferencia-local]] para desarrollo, privacidad o demos, con uno o pocos usuarios a la vez. `ollama launch claude|codex|opencode` configura agentes de código contra tus modelos locales.

## Cuándo no

- **Servir a muchos usuarios en producción**: encola peticiones (`OLLAMA_NUM_PARALLEL` es 1 por defecto) y no hace *continuous batching*. Para eso, [[herramientas/vllm]].
- **Si necesitas `tool_choice`**: no lo acepta ni en la API OpenAI ni en la Anthropic. Tampoco *prompt caching* ni `count_tokens`.
- **Si quieres que todo sea local y usas etiquetas `:cloud`**: esos modelos se ejecutan en ollama.com, no en tu máquina.

> [!aviso] Contexto pequeño por defecto
> El valor por defecto de `num_ctx` es pequeño y la propia documentación se contradice (2048, 4096 o según la VRAM). Si el *prompt* no cabe, **trunca en silencio**. Mira la columna `CONTEXT` de `ollama ps` y súbelo: para agentes, la documentación recomienda al menos 64 000 tokens.

## Ejemplo mínimo

```bash
ollama pull qwen3.6:27b
ollama run qwen3.6:27b "Resume en una frase qué es RAG"
ollama ps          # columnas PROCESSOR (GPU/CPU) y CONTEXT
```

El SDK de Anthropic contra Ollama, sin cambiar nada más que el cliente:

```python title="ollama_anthropic.py"
import anthropic

MODEL = "qwen3.6:27b"   # modelo local, no de Claude
client = anthropic.Anthropic(base_url="http://localhost:11434", api_key="ollama")  # la clave se ignora

resp = client.messages.create(
    model=MODEL,
    max_tokens=1024,
    messages=[{"role": "user", "content": "¿Qué es una ventana de contexto?"}],
)
print(resp.content[0].text)
```

No se ha ejecutado aquí (no hay servidor ni GPU); la sintaxis sigue la documentación de compatibilidad con Anthropic. Recuerda que `budget_tokens` se acepta pero no se aplica y que los recuentos de `usage` son aproximados. Si `OLLAMA_HOST=0.0.0.0`, el servidor queda expuesto en la red sin autenticación.

## Alternativas

- [[herramientas/llama-cpp]]: el motor sobre el que se apoyan muchos servidores locales, con más control fino.
- [[herramientas/lm-studio]]: aplicación de escritorio con interfaz gráfica (propietaria).
- [[herramientas/vllm]]: servidor para GPU y muchos usuarios.
- [[herramientas/litellm]]: no sirve modelos, pero traduce entre APIs si mezclas proveedores.

Más a fondo: [[docs/modelos-abiertos/01-ollama]], [[modelos/12-inferencia-local]] y el problema [[problemas/modelo-local-no-llama-herramientas]].

## Enlaces

- Web y biblioteca de modelos: [ollama.com](https://ollama.com)
- Documentación: [docs.ollama.com](https://docs.ollama.com)
- Compatibilidad con Anthropic: [docs.ollama.com/api/anthropic-compatibility](https://docs.ollama.com/api/anthropic-compatibility)
- Repositorio y *releases*: [github.com/ollama/ollama](https://github.com/ollama/ollama/releases)
