---
titulo: Llama Guard
descripcion: Modelo clasificador de pesos abiertos de Meta que etiqueta entradas y salidas de un LLM como seguras o no según categorías de riesgo S1–S14.
creado: 2026-10-29
tags: [guardrails, seguridad, modelos-abiertos]
relacionados: ["[[docs/modelos-abiertos/09-guardrails-y-sandbox]]", "[[glosario/guardrails]]", "[[cursos/seguridad-y-prompt-injection/03-defensas-en-capas]]"]
categoria: guardrails
licencia: Llama 4 Community License
open_source: false
lenguajes: [Python]
url: https://huggingface.co/meta-llama/Llama-Guard-4-12B
version: "4 (12B)"
revisado: 2026-10-29
---

Llama Guard es una familia de modelos de Meta entrenados para **clasificar** conversaciones, no para responderlas. Le pasas un mensaje del usuario o una respuesta de tu modelo y devuelve si es seguro y, si no lo es, qué categorías incumple, según la taxonomía S1–S14 de MLCommons (S14 es abuso del intérprete de código). La versión vigente es **Llama Guard 4** (12B, abril de 2025), que filtra entrada y salida y admite varias imágenes.

**Licencia.** Son [[glosario/pesos-abiertos]] con la **Llama 4 Community License**: se descargan y se usan, con condiciones (atribución «Built with Llama» y licencia aparte por encima de 700 M de usuarios activos mensuales). No es una licencia OSI, así que esta ficha no lo marca como open source.

## Para qué sirve

- Una capa de [[glosario/guardrails]] delante y detrás de tu modelo: bloquear peticiones dañinas y respuestas que no deberían salir.
- Moderación con una taxonomía estándar que puedes registrar y auditar.
- Filtrar también contenido con imágenes.

## Cuándo usarla

Cuando necesitas moderación de contenido autoalojada, sin mandar los textos a un servicio externo, y las categorías estándar encajan con tu política.

## Cuándo no

- **Como defensa contra la [[glosario/inyeccion-de-prompt]]**: la propia *model card* reconoce que puede ser vulnerable a inyección y remite a Llama Prompt Guard 2 para detectar ataques de *prompt*.
- **Como sustituto de los permisos**: un clasificador se equivoca. Lo que protege de verdad es el [[glosario/minimo-privilegio]] y la aprobación humana en acciones irreversibles ([[cursos/seguridad-y-prompt-injection/03-defensas-en-capas]]).
- Si tu política no encaja con S1–S14: gpt-oss-safeguard (Apache 2.0) clasifica con **tu propia política** escrita y razona su decisión.

## Ejemplo mínimo

Sírvelo con un motor que lo soporte (comprueba en la *model card* y en la documentación del motor) y llámalo como a cualquier modelo de chat: la [[glosario/plantilla-de-chat]] del modelo envuelve el mensaje con la lista de categorías. No se ha ejecutado aquí (hace falta GPU); el formato exacto de la respuesta está en la *model card*: compruébalo antes de parsear.

```python title="moderar.py"
from openai import OpenAI

MODEL = "meta-llama/Llama-Guard-4-12B"
client = OpenAI(base_url="http://localhost:8000/v1", api_key="local")  # p. ej., un servidor vLLM

def moderar(texto_usuario: str) -> tuple[bool, list[str]]:
    r = client.chat.completions.create(
        model=MODEL,
        max_tokens=20,
        messages=[{"role": "user", "content": texto_usuario}],
    )
    salida = (r.choices[0].message.content or "").strip().lower()
    if salida.startswith("safe"):
        return True, []
    lineas = salida.splitlines()
    categorias = lineas[1].upper().split(",") if len(lineas) > 1 else []
    return False, [c.strip() for c in categorias]   # p. ej. ["S1"]; ante una salida rara, falla en cerrado

ok, cats = moderar("¿Cómo cambio la contraseña de mi cuenta?")
```

Trata cualquier salida que no entiendas como «no seguro» ([[glosario/fallo-en-cerrado]]) y registra la decisión en tus trazas.

## Alternativas

- gpt-oss-safeguard (Apache 2.0): clasificación con política propia.
- Granite Guardian 4.1: disponible en Ollama.
- NeMo Guardrails y Guardrails AI (Apache-2.0): frameworks de *rails* y validadores, no modelos.

Comparativa en [[docs/modelos-abiertos/09-guardrails-y-sandbox]].

## Enlaces

- *Model card* de Llama Guard 4: [huggingface.co/meta-llama/Llama-Guard-4-12B](https://huggingface.co/meta-llama/Llama-Guard-4-12B)
- Modelos de Meta: [huggingface.co/meta-llama](https://huggingface.co/meta-llama)
