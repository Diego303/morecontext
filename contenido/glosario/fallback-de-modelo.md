---
titulo: Fallback de modelo
descripcion: Pasar automáticamente la petición a otro modelo cuando el principal la rechaza o no está disponible, en el servidor o en tu código.
creado: 2026-10-29
categoria: produccion
ingles: Model fallback
aliases: [model fallback, fallback, fallbacks, modelo de respaldo]
tags: [produccion, api, fiabilidad]
relacionados: ["[[recetas/fallback-ante-rechazos]]", "[[glosario/rechazo]]", "[[docs/fundamentos/06-motivos-de-parada-y-rechazos]]"]
---

Un *fallback* de modelo es una cadena de respaldo: si el modelo principal no puede responder, la petición pasa a otro. El disparador puede ser un [[glosario/rechazo]], un error o la falta de capacidad. Lo puedes montar en tu código, en una pasarela como [[herramientas/litellm|LiteLLM]] o, en la API de Claude, dejar que lo haga el servidor.

## En la práctica

El *fallback* en servidor de Anthropic está en beta (`server-side-fallback-2026-07-01`) y solo salta cuando el modelo rechaza la petición. Pasas `fallbacks="default"` o una lista de hasta 3 modelos:

```python title="fallback.py"
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

resp = client.beta.messages.create(
    model=MODEL, max_tokens=4096,
    messages=[{"role": "user", "content": "Resume este informe de incidentes."}],
    betas=["server-side-fallback-2026-07-01"],
    fallbacks=[{"model": "claude-sonnet-5"}],   # o fallbacks="default"
)
```

Si salta, la respuesta incluye un bloque `{"type": "fallback", "from": …, "to": …, "trigger": {"type": "refusal", "category": …}}` y el uso se desglosa en `usage.iterations`. Haiku 5.5 no lo admite. En el cliente, el SDK de Python ofrece `BetaRefusalFallbackMiddleware` (en `anthropic.lib.middleware`), que se aplica con `client.with_middleware(...)`. Registra cada salto: el modelo de respaldo cambia calidad, coste y [[glosario/latencia]].

## No confundir con

- **Reintentos**: repiten la misma petición contra el mismo modelo (útil ante un 429 o un 529, no ante un rechazo).

## Ver también

- [[recetas/fallback-ante-rechazos]]
- [[recetas/reintentos-y-limites-de-tasa]]
- [[docs/produccion/02-costes-y-limites]]
