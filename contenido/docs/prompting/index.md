---
titulo: Prompting
descripcion: Referencia de las herramientas para dirigir al modelo, con prompt de sistema, ejemplos few-shot, salida estructurada y control del razonamiento.
creado: 2026-07-21
actualizado: 2026-10-29
orden: 2
tags: [prompting]
relacionados: ["[[roadmap/10-prompting/index]]", "[[modelos/01-principios-de-prompting]]", "[[glosario/prompt]]"]
---

Este grupo documenta los mecanismos con los que controlas **qué hace el modelo y cómo lo entrega**: instrucciones fijas, ejemplos, formato garantizado por esquema y cuánto razona antes de responder. Cada artículo detalla el parámetro de la API correspondiente, sus límites y los fallos típicos.

El [[glosario/prompt|prompt]] bien escrito sigue siendo la palanca principal. Los parámetros de este grupo la complementan; no la sustituyen.

## Artículos

| Artículo | Para qué lo consultas |
|---|---|
| [[docs/prompting/01-prompt-de-sistema]] | Qué va en `system`, cómo estructurarlo y cómo cachearlo. |
| [[docs/prompting/02-ejemplos-few-shot]] | Cuántos ejemplos, dónde ponerlos, cómo evitar que el modelo los copie. |
| [[docs/prompting/03-salida-estructurada]] | JSON válido con `output_config.format`, herramientas con `strict`, sus limitaciones y el equivalente en LangChain. |
| [[docs/prompting/04-razonamiento]] | Razonamiento adaptativo, qué admite cada modelo, niveles de `effort` y cómo controlar su coste. |

## Cómo se relaciona con el resto

- Para **aprender** a escribir prompts con ejercicios, sigue el nivel [[roadmap/10-prompting/index]].
- Para **principios y antipatrones** con ejemplos antes/después, ve a la guía de modelos: [[modelos/01-principios-de-prompting]] y [[modelos/08-antipatrones]].
- Para **cambiar instrucciones a mitad de un agente** sin romper la caché, mira [[docs/contexto/06-mensajes-de-sistema-a-mitad-de-conversacion]].
- Para plantillas listas para copiar, ve a [[plantillas/prompt-de-sistema-de-agente]].
- Para **medir** si un cambio de prompt mejora o empeora, necesitas [[glosario/evals|evals]]: empieza por [[roadmap/10-prompting/05-iterar-con-casos-de-prueba]].

> [!consejo] Cambia una cosa cada vez
> Si tocas el prompt de sistema, los ejemplos y el nivel de esfuerzo a la vez, no sabrás qué cambio movió el resultado.
