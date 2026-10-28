---
titulo: Cadena de pensamiento
descripcion: Técnica de prompting que pide al modelo razonar paso a paso antes de responder para mejorar tareas de varios pasos.
creado: 2026-07-17
categoria: prompting
ingles: chain of thought
aliases: [chain of thought, chain-of-thought, CoT, razonamiento paso a paso]
tags: [prompting, razonamiento]
relacionados: ["[[modelos/04-dejar-pensar-al-modelo]]", "[[glosario/razonamiento-extendido]]"]
---

La cadena de pensamiento (*chain of thought*, CoT) consiste en pedir al modelo que escriba los pasos intermedios de su razonamiento antes de la respuesta final. Wei et al. (2022) mostraron que mejora problemas de aritmética, lógica y sentido común; Kojima et al. (2022), que basta con una indicación como «piensa paso a paso».

## En la práctica

Separa el razonamiento de la respuesta para poder procesarla con código: pide el razonamiento dentro de `<razonamiento>` y la respuesta dentro de `<respuesta>`, y extrae solo la segunda. Ayuda en tareas con varios pasos; en tareas simples solo añade tokens y [[glosario/latencia]]. Con modelos que tienen [[glosario/razonamiento-extendido]], suele ser mejor activar esa función que forzar el razonamiento en el texto.

## No confundir con

- **[[glosario/razonamiento-extendido]]**: función de la API en la que el modelo razona en bloques `thinking` separados.
- **Explicaciones largas**: pedir que justifique la respuesta después de darla no mejora la respuesta.

## Ver también

- [[modelos/04-dejar-pensar-al-modelo]]
- [[docs/prompting/04-razonamiento]]
- [[glosario/react]]
- [[glosario/zero-shot]]
