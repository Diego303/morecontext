---
titulo: LM Studio
descripcion: Aplicación de escritorio gratuita y propietaria para descargar y ejecutar modelos abiertos con un servidor local compatible con OpenAI y Anthropic.
creado: 2026-10-29
tags: [inferencia, modelos-abiertos, local]
relacionados: ["[[cursos/agentes-con-modelos-abiertos/02-tu-primer-modelo-en-local]]", "[[docs/modelos-abiertos/03-apis-compatibles-y-litellm]]", "[[radar/2026-10-28-apis-anthropic-en-local]]"]
categoria: inferencia
licencia: propietaria
open_source: false
lenguajes: [Python, TypeScript]
url: https://lmstudio.ai
repositorio: https://github.com/lmstudio-ai
version: "0.4.1"
revisado: 2026-10-29
---

LM Studio es una aplicación de escritorio para buscar, descargar y ejecutar modelos de [[glosario/pesos-abiertos]] con interfaz gráfica. Además del chat, levanta un servidor local con API compatible con OpenAI (incluido `/v1/responses`), compatible con Anthropic (`/v1/messages`, desde la 0.4.1) y una REST nativa (`/api/v1`, desde la 0.4.0). **La aplicación es gratuita pero no es open source**; su SDK de JavaScript (`@lmstudio/sdk`) y el de Python (`lmstudio`) se publican aparte (el de npm declara MIT; el de PyPI no declara licencia en sus metadatos). Consulta la licencia de cada repositorio antes de integrarlos.

## Para qué sirve

- Probar modelos y cuantizaciones sin línea de comandos: ves cuánta memoria ocupa cada uno antes de cargarlo.
- Tener un endpoint local para tu código con `lms server start`.
- Apuntar el SDK de Anthropic o el de OpenAI a un modelo local para probar un agente sin coste por token.

## Cuándo usarla

En tu propio equipo, para explorar modelos y para que alguien sin experiencia en terminal pruebe [[glosario/inferencia-local]]. Es un buen primer paso antes de decidir el motor definitivo.

## Cuándo no

- Si la licencia importa: para distribuir o integrar en un producto, prefiere motores open source como [[herramientas/ollama]] (MIT) o [[herramientas/llama-cpp]] (MIT).
- En servidores o producción con varios usuarios: [[herramientas/vllm]].
- En CI o contenedores sin escritorio.

## Ejemplo mínimo

```bash
lms server start      # servidor local; los ejemplos de la documentación usan el puerto 1234
```

Con el modelo ya cargado en la aplicación:

```python title="cliente_lm_studio.py"
from openai import OpenAI

client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")  # sin autenticación activada, se ignora
MODEL = client.models.list().data[0].id   # el identificador del modelo cargado

r = client.chat.completions.create(
    model=MODEL,
    max_tokens=512,
    messages=[{"role": "user", "content": "¿Qué diferencia hay entre pesos abiertos y open source?"}],
)
print(r.choices[0].message.content)
```

No se ha ejecutado aquí (es una aplicación de escritorio). Si activas la autenticación, el servidor acepta la clave como `x-api-key` o `Bearer`. Como en cualquier API «compatible», no des por hecho que todo funciona igual que en el proveedor original: revisa `tool_choice`, el formato del razonamiento y los recuentos de `usage` ([[docs/modelos-abiertos/03-apis-compatibles-y-litellm]]).

## Alternativas

- [[herramientas/ollama]]: servidor local open source, con CLI y biblioteca de modelos.
- [[herramientas/llama-cpp]]: el motor directo, sin interfaz.
- [[herramientas/open-webui]]: si lo que buscas es una interfaz de chat sobre un servidor que ya tienes.

## Enlaces

- Web: [lmstudio.ai](https://lmstudio.ai)
- Servidor local: [lmstudio.ai/docs/developer/core/server](https://lmstudio.ai/docs/developer/core/server)
- Compatibilidad con Anthropic: [lmstudio.ai/docs/developer/anthropic-compat](https://lmstudio.ai/docs/developer/anthropic-compat)
- Cambios de la API: [lmstudio.ai/docs/developer/api-changelog](https://lmstudio.ai/docs/developer/api-changelog)
