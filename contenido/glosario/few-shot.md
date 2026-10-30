---
titulo: Few-shot
descripcion: Técnica de prompting que incluye unos pocos ejemplos de entrada y salida para que el modelo imite el patrón.
creado: 2026-07-15
actualizado: 2026-10-29
categoria: prompting
aliases: [few-shot prompting, aprendizaje con pocos ejemplos]
tags: [prompting]
relacionados: ["[[roadmap/10-prompting/02-ejemplos-few-shot]]", "[[docs/prompting/02-ejemplos-few-shot]]"]
---

*Few-shot* es incluir en el [[glosario/prompt]] unos pocos ejemplos resueltos (normalmente entre dos y cinco) para que el modelo deduzca el formato, el tono y el criterio que buscas. Brown et al. (2020) mostraron que los modelos grandes aprenden tareas así, sin reentrenar, solo a partir de ejemplos en el contexto.

## En la práctica

Los ejemplos enseñan más que las instrucciones, para bien y para mal: el modelo copia también sus defectos. Elige ejemplos variados que cubran casos difíciles, no cinco casi iguales. Envuélvelos en etiquetas claras (`<ejemplo>…</ejemplo>`) para que no se mezclen con la tarea real.

```text
<ejemplo>Entrada: "No me llega el pedido 4411" → Categoría: envios</ejemplo>
<ejemplo>Entrada: "Me cobrasteis dos veces" → Categoría: facturacion</ejemplo>
Entrada: "{ticket}" → Categoría:
```

## No confundir con

- **[[glosario/zero-shot]]**: solo instrucciones, sin ejemplos.
- **[[glosario/fine-tuning]]**: cambia los pesos del modelo; few-shot no cambia nada fuera de la petición.

## Ver también

- [[roadmap/10-prompting/02-ejemplos-few-shot]]
- [[docs/prompting/02-ejemplos-few-shot]]
- [[modelos/01-principios-de-prompting]]
- [[recetas/clasificar-y-enrutar-tickets]]
- [[biblioteca/gpt-3-few-shot]]
