---
titulo: Rechazo (refusal)
descripcion: Cuando el modelo se niega a completar una petición y la API lo señala con stop_reason refusal, y cómo tratarlo en tu bucle.
creado: 2026-10-29
categoria: seguridad
ingles: Refusal
aliases: [refusal, stop_reason refusal, negativa del modelo]
tags: [seguridad, api]
relacionados: ["[[docs/fundamentos/06-motivos-de-parada-y-rechazos]]", "[[recetas/fallback-ante-rechazos]]", "[[glosario/stop-reason]]"]
---

Un rechazo es una respuesta en la que el modelo no completa lo que le pides porque lo considera dañino o fuera de política. En la API de Claude, los modelos con clasificadores (Fable 5.1, Fable 5, Opus 5.5, Opus 5, Sonnet 5.5 y Haiku 5.5) lo señalan con `stop_reason: "refusal"` y una respuesta **HTTP 200**, no con un error. `stop_details.category` indica el motivo: `cyber`, `bio`, `frontier_llm`, `reasoning_extraction`, `general_harms` o `null`.

## En la práctica

Trátalo como un final más del [[glosario/bucle-agentico]]:

```python title="rechazo.py"
def texto_final(resp) -> str:
    if resp.stop_reason == "refusal":
        categoria = resp.stop_details.category if resp.stop_details else None
        print("rechazo:", categoria)          # llévalo a tus métricas
        return "No puedo ayudar con esto."    # no reintentes igual
    return "".join(b.text for b in resp.content if b.type == "text")
```

Reintentar la misma petición no suele cambiar nada; si el caso es legítimo, reformula o usa un [[glosario/fallback-de-modelo]]. Desde el 24 sep. 2026, un rechazo sin salida **se factura** si la categoría es `bio`, `frontier_llm` o `reasoning_extraction`. No pidas al modelo que escriba su razonamiento paso a paso en la respuesta, porque dispara rechazos `reasoning_extraction`; si lo necesitas, lee el `thinking` con `display: "summarized"`.

## No confundir con

- **Un error de la API** (4xx o 5xx): la petición falló; en un rechazo la petición fue bien.
- **[[glosario/guardrails]] propios**: los decides y aplicas tú en tu código.

## Ver también

- [[docs/fundamentos/06-motivos-de-parada-y-rechazos]]
- [[recetas/fallback-ante-rechazos]]
- [[glosario/stop-reason]]
