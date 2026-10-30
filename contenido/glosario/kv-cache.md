---
titulo: KV cache
descripcion: Memoria donde el motor de inferencia guarda las claves y valores de atención de los tokens ya procesados; crece con el contexto y suele decidir cuánto cabe.
creado: 2026-10-29
categoria: produccion
ingles: KV cache
aliases: [KV cache, caché KV, key-value cache, caché de claves y valores]
tags: [produccion, inferencia-local, memoria]
relacionados: ["[[modelos/12-inferencia-local]]", "[[glosario/atencion]]", "[[glosario/cuantizacion]]", "[[glosario/inferencia-local]]"]
---

La KV cache guarda, para cada token ya procesado, las claves y los valores que calcula la [[glosario/atencion]] en cada capa. Así, al generar el token siguiente, el modelo no recalcula todo el contexto. El precio es memoria, que crece en línea con la longitud del contexto y con el número de peticiones a la vez.

## En la práctica

Por token ocupa 2 × capas × (cabezas de clave y valor × dimensión por cabeza) × bytes por número. NVIDIA calcula unos 2 GB para Llama 2 7B con 4096 tokens en FP16 y una sola petición ([*Mastering LLM Techniques: Inference Optimization*](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/)). En modelos con atención agrupada usa `num_key_value_heads` del `config.json`. Multiplica por las peticiones en paralelo: en Ollama, `OLLAMA_NUM_PARALLEL`.

Por eso subir el contexto de un modelo local a 64 000 tokens puede no caber aunque los pesos sí quepan. Puedes cuantizar la caché (`OLLAMA_KV_CACHE_TYPE` a `q8_0` o `q4_0`, con Flash Attention activada), pero pierdes calidad: la documentación de llama.cpp avisa de que una caché demasiado cuantizada degrada el *tool calling*.

## No confundir con

- **[[glosario/prompt-caching]]**: reutilizar entre peticiones el procesamiento de un prefijo repetido. Se apoya en esta caché, pero la gestiona el proveedor o el servidor (en vLLM, `--enable-prefix-caching`).

## Ver también

- [[cursos/agentes-con-modelos-abiertos/02-tu-primer-modelo-en-local]]
- [[glosario/ventana-de-contexto]]
- [[glosario/transformer]]
