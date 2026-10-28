---
titulo: Top-p
descripcion: Parámetro de muestreo que limita la elección de cada token a los más probables cuya probabilidad acumulada llega a p.
creado: 2026-07-06
categoria: fundamentos
aliases: [top_p, nucleus sampling, muestreo de núcleo]
tags: [fundamentos, parametros]
relacionados: ["[[modelos/06-parametros]]", "[[glosario/temperatura]]"]
---

Top-p (*nucleus sampling*) es una forma de muestreo en la que, para cada [[glosario/token]], el modelo ordena los candidatos de más a menos probable y solo elige entre los primeros hasta que su probabilidad acumulada alcanza `p`. Con `top_p=0.9`, descarta la cola de opciones improbables que suman el 10 % restante.

## En la práctica

El efecto se parece al de la [[glosario/temperatura]]: valores bajos dan respuestas más predecibles y valores altos, más variadas. La diferencia es que top-p se adapta: cuando el modelo está muy seguro, quedan pocos candidatos; cuando duda, quedan más. En la mayoría de casos no necesitas tocarlo. Si ajustas el muestreo, cambia la temperatura o top-p, no los dos. Algunos modelos restringen estos parámetros con el razonamiento activado: consulta la documentación.

## No confundir con

- **Top-k**: limita a los `k` candidatos más probables, sea cual sea su probabilidad.
- **[[glosario/max-tokens]]**: limita la longitud, no cómo se elige cada token.

## Ver también

- [[modelos/06-parametros]]
- [[glosario/temperatura]]
- [[glosario/llm]]
