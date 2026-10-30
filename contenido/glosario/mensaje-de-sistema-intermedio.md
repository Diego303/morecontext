---
titulo: Mensaje de sistema intermedio
descripcion: Un mensaje con rol system dentro de la conversación que cambia las instrucciones del modelo a mitad de tarea sin romper la caché.
creado: 2026-10-29
categoria: prompting
ingles: Mid-conversation system message
aliases: [mid-conversation system message, mensaje system a mitad de conversación, system intermedio]
tags: [prompting, contexto, api]
relacionados: ["[[docs/contexto/06-mensajes-de-sistema-a-mitad-de-conversacion]]", "[[glosario/prompt-de-sistema]]", "[[recetas/entregar-resultado-sin-forzar-herramienta]]"]
---

Un mensaje de sistema intermedio es un `{"role": "system", "content": "…"}` que va **dentro** de `messages`, no en el campo `system` de nivel superior. Sirve para cambiar o añadir instrucciones a mitad de una conversación o de un bucle de agente: tiene prioridad sobre el [[glosario/prompt-de-sistema]] en los turnos siguientes y no invalida el [[glosario/prompt-caching]] del prefijo, porque no toca lo anterior.

## En la práctica

En la API de Claude es GA en los modelos 5.x salvo Sonnet 5 (también en Opus 4.8). Debe ir justo después de un turno `user` y ser el último elemento o ir seguido de un `assistant`; entre un `tool_use` y su `tool_result` da 400.

```python title="system_intermedio.py"
mensajes = [
    {"role": "user", "content": "Investiga las incidencias de octubre."},
    {"role": "assistant", "content": "He revisado 12 tickets; sigo con los de pago."},
    {"role": "user", "content": "Vale, sigue."},
    {"role": "system", "content": "Te quedan dos pasos. Cierra y entrega el informe final."},
]
```

Es la forma limpia de pedir «entrega ya el resultado» ahora que no se puede forzar una herramienta en los modelos 5.5. En beta existen `clear_at: "next_user_message"` para que valga un solo turno y `output_config` por mensaje para cambiar el [[glosario/esfuerzo]]. En Managed Agents, el equivalente es el evento `system.message`.

## No confundir con

- **Cambiar el `system` de nivel superior**: también cambia las instrucciones, pero invalida la caché de todo lo que va detrás.

## Ver también

- [[docs/contexto/06-mensajes-de-sistema-a-mitad-de-conversacion]]
- [[recetas/entregar-resultado-sin-forzar-herramienta]]
- [[radar/2026-10-23-no-se-puede-forzar-herramienta]]
