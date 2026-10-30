---
titulo: Lost in the middle
descripcion: El efecto por el que un modelo usa peor la información situada en mitad de un contexto largo que la del principio o el final.
creado: 2026-10-29
categoria: contexto
ingles: Lost in the middle
aliases: [lost in the middle, perdido en el medio, curva en U, sesgo de posición]
tags: [contexto, rag, contexto-largo]
relacionados: ["[[biblioteca/lost-in-the-middle]]", "[[glosario/context-rot]]", "[[modelos/07-documentos-largos]]"]
---

*Lost in the middle* es el nombre del efecto que describieron Liu et al. en [*Lost in the Middle: How Language Models Use Long Contexts*](https://arxiv.org/abs/2307.03172) (2023): cuando la información útil está en mitad de un contexto largo, el modelo la aprovecha peor que si está al principio o al final. Al mover el documento con la respuesta entre distractores, el acierto dibuja una curva en U.

## En la práctica

En un RAG cambia dos decisiones. Primero, cuántos fragmentos metes: recuperar veinte «por si acaso» puede empeorar la respuesta, así que corta en pocos tras un [[glosario/reranking]]. Segundo, dónde los pones: los documentos arriba, la pregunta y las instrucciones al final, cada fuente con su etiqueta. En un agente pasa lo mismo con el historial: un resultado de herramienta clave enterrado en medio de muchos turnos corre el mismo riesgo, y por eso se compacta y se repite el objetivo al final. Cuánto te afecta depende del modelo y de la tarea: mide con tu [[glosario/conjunto-de-evaluacion]] variando el número y el orden de fragmentos antes de fijarlos.

## No confundir con

- **[[glosario/context-rot]]**: la degradación general al crecer la entrada, aunque la información esté. *Lost in the middle* habla de la posición.
- **Truncado**: lo que no cabe en la [[glosario/ventana-de-contexto]] no llega al modelo; aquí sí llega, pero se usa mal.

## Ver también

- [[biblioteca/lost-in-the-middle]]
- [[modelos/07-documentos-largos]]
- [[glosario/contexto-largo]]
- [[cursos/rag-a-fondo/01-anatomia-de-un-rag]]
