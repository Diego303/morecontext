---
titulo: Cuantización
descripcion: Guardar los pesos de un modelo con menos bits por parámetro para que ocupe menos memoria y corra en hardware más modesto, a cambio de algo de calidad.
creado: 2026-10-29
categoria: produccion
ingles: Quantization
aliases: [quantization, cuantizar, modelo cuantizado, Q4_K_M]
tags: [produccion, modelos-abiertos, inferencia-local]
relacionados: ["[[modelos/12-inferencia-local]]", "[[glosario/gguf]]", "[[glosario/kv-cache]]", "[[glosario/inferencia-local]]"]
---

Cuantizar es representar los pesos de un modelo con menos bits (8, 5, 4…) en lugar de los 16 con los que suelen publicarse. El modelo ocupa menos memoria y se mueve más rápido por ella, a cambio de perder algo de precisión.

## En la práctica

La cuenta de memoria es directa: pesos ≈ parámetros × bits por peso / 8. Según el [README de `llama-quantize`](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md), Q4_K_M usa unos 4,89 bits por peso, Q8_0 unos 8,50 y F16, 16. Un modelo de 27B en Q4_K_M sale por unos 16,5 GB, cerca de los 17 GB que anuncia Ollama para ese archivo. A eso súmale la [[glosario/kv-cache]] y un margen.

Q4_K_M es el punto de partida habitual en local: llama.cpp lo descarga por defecto. Baja de ahí solo si no te cabe, y sube a Q5 o Q8 si tus evals notan la pérdida, sobre todo en *tool calling* y en tareas largas. Mide con tus casos, no con la intuición.

## No confundir con

- **Cuantizar la KV cache**: ahorra memoria de contexto, con su propia pérdida de calidad.
- **[[glosario/cuantizacion-de-producto]]**: comprime vectores en una base vectorial, no los pesos.
- **[[glosario/destilacion]]**: entrena un modelo más pequeño; cuantizar reduce el mismo modelo.

## Ver también

- [[cursos/agentes-con-modelos-abiertos/02-tu-primer-modelo-en-local]]
- [[docs/modelos-abiertos/02-vllm-y-llama-cpp]]
- [[glosario/mezcla-de-expertos]]
