---
titulo: Prompt de sistema
descripcion: Instrucciones fijas que se envían aparte de los mensajes para definir el rol, las reglas y el contexto estable del modelo.
creado: 2026-07-16
actualizado: 2026-10-29
categoria: prompting
ingles: system prompt
aliases: [system prompt, mensaje de sistema, instrucciones de sistema]
tags: [prompting, api]
relacionados: ["[[roadmap/10-prompting/04-prompt-de-sistema]]", "[[docs/prompting/01-prompt-de-sistema]]"]
---

El prompt de sistema es el texto que fija cómo debe comportarse el modelo durante toda la conversación: su papel, las reglas que no cambian, el formato de respuesta y el contexto estable de tu producto. En la API de Anthropic va en el parámetro `system`, separado de la lista `messages`.

## En la práctica

```python
resp = client.messages.create(
    model=MODEL, max_tokens=1024,
    system="Eres el asistente de soporte de Acme. Responde en español y en menos de 120 palabras. "
           "Si la pregunta no trata de nuestros productos, dilo y no respondas.",
    messages=[{"role": "user", "content": "¿Cómo cambio mi contraseña?"}],
)
```

Explica el porqué de cada regla: el modelo generaliza mejor cuando entiende la intención. Como se repite en cada llamada y cambia poco, es un buen candidato para [[glosario/prompt-caching]]. Si necesitas cambiar instrucciones a mitad de una conversación, los modelos 5.x aceptan un [[glosario/mensaje-de-sistema-intermedio]] sin invalidar la caché. Con modelos abiertos, el `system` acaba dentro de la [[glosario/plantilla-de-chat]] del modelo.

## No confundir con

- **Mensaje del usuario**: la petición concreta de cada turno.
- **[[glosario/guardrails]]**: el prompt de sistema orienta, pero no impide nada por sí solo.

## Ver también

- [[roadmap/10-prompting/04-prompt-de-sistema]]
- [[docs/prompting/01-prompt-de-sistema]]
- [[modelos/01-principios-de-prompting]]
- [[glosario/prompt]]
- [[plantillas/prompt-de-sistema-de-agente]]
