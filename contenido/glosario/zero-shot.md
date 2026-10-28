---
titulo: Zero-shot
descripcion: Pedir al modelo una tarea solo con instrucciones, sin incluir ningún ejemplo resuelto en el prompt.
creado: 2026-07-14
categoria: prompting
aliases: [zero-shot prompting, sin ejemplos]
tags: [prompting]
relacionados: ["[[glosario/few-shot]]", "[[roadmap/10-prompting/01-instrucciones-claras]]"]
---

*Zero-shot* es resolver una tarea dándole al modelo solo la descripción de lo que quieres, sin ejemplos de entrada y salida. Funciona porque los modelos actuales están entrenados para seguir instrucciones; Kojima et al. (2022) mostraron además que añadir una indicación de razonar paso a paso mejora el resultado sin ejemplos.

## En la práctica

Es el punto de partida: rápido de escribir y barato en tokens. Si la salida no tiene el formato o el criterio que buscas, primero mejora las instrucciones (contexto, formato, casos límite) y, si sigue fallando, añade ejemplos y pasa a [[glosario/few-shot]]. Para tareas de clasificación con categorías ambiguas o formatos muy específicos, los ejemplos suelen ganar a cualquier instrucción.

## No confundir con

- **[[glosario/few-shot]]**: incluye ejemplos resueltos en el prompt.
- **[[glosario/cadena-de-pensamiento]]**: pedir razonamiento; se puede combinar con zero-shot o con few-shot.

## Ver también

- [[roadmap/10-prompting/01-instrucciones-claras]]
- [[modelos/01-principios-de-prompting]]
- [[glosario/prompt]]
