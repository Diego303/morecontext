---
titulo: Bucle agéntico
descripcion: Ciclo de llamar al modelo, ejecutar las herramientas que pide y devolverle los resultados hasta que termina.
creado: 2026-07-09
categoria: agentes
ingles: agent loop
aliases: [agent loop, agentic loop, bucle del agente]
tags: [agentes, herramientas]
relacionados: ["[[roadmap/40-primer-agente/02-el-bucle-agentico]]", "[[docs/agentes/01-el-bucle-agentico]]"]
---

El bucle agéntico es el ciclo que convierte un modelo con herramientas en un [[glosario/agente]]: llamas al modelo, ejecutas las herramientas que pide, le devuelves los resultados y vuelves a llamarlo. Se repite hasta que el modelo responde sin pedir herramientas o hasta que tu código lo corta.

## En la práctica

```python
while pasos < MAX_PASOS:
    resp = client.messages.create(model=MODEL, max_tokens=2048, tools=tools, messages=messages)
    messages.append({"role": "assistant", "content": resp.content})
    if resp.stop_reason != "tool_use":
        break
    resultados = [ejecutar(b) for b in resp.content if b.type == "tool_use"]
    messages.append({"role": "user", "content": resultados})  # un tool_result por tool_use
    pasos += 1
```

La condición de salida es [[glosario/stop-reason]]. Pon siempre un tope de pasos y de gasto: sin él, un agente confundido puede repetir la misma llamada sin fin.

## Ver también

- [[roadmap/40-primer-agente/02-el-bucle-agentico]]
- [[roadmap/40-primer-agente/03-condiciones-de-parada]]
- [[docs/agentes/01-el-bucle-agentico]]
- [[glosario/tool-result]]
- [[glosario/react]]
