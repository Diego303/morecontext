---
titulo: Mezcla de expertos
descripcion: Arquitectura en la que cada token activa solo unos pocos bloques del modelo, los expertos, de modo que computa como uno pequeño pero ocupa como uno grande.
creado: 2026-10-29
categoria: fundamentos
ingles: Mixture of Experts
aliases: [MoE, mixture of experts, mezcla de expertos, modelo MoE]
tags: [fundamentos, modelos-abiertos, arquitectura]
relacionados: ["[[glosario/transformer]]", "[[glosario/pesos-abiertos]]", "[[modelos/12-inferencia-local]]", "[[glosario/cuantizacion]]"]
---

En un modelo de mezcla de expertos (MoE), algunas capas del [[glosario/transformer]] tienen muchos bloques paralelos, los expertos, y un enrutador elige para cada token solo unos pocos. El modelo tiene muchos parámetros en total, pero cada token pasa por una fracción pequeña.

## En la práctica

Lo verás en los nombres: «35B-A3B» significa 35 000 millones de parámetros totales y unos 3 000 millones activos por token. Mistral Small 4, por ejemplo, tiene 119B totales con 128 expertos, de los que se activan 4. Es el patrón dominante en los modelos abiertos de 2026.

La consecuencia práctica: **el coste por token depende de los activos, la memoria de los totales**. Tienes que cargar todos los expertos aunque cada token use pocos: Qwen3.6-35B-A3B en Q4_K_M ocupa 24 GB en Ollama. Un MoE genera rápido para su calidad, pero no cabe donde cabría un modelo denso de 3B. llama.cpp permite dejar parte de los expertos en la RAM de la CPU (`--moe-cache-mib`) cuando la GPU no da para todo.

## No confundir con

- **Sistema multiagente** o **[[patrones/04-enrutado]]**: ahí se enrutan tareas entre modelos o agentes. En un MoE el enrutado ocurre dentro del modelo, token a token.

## Ver también

- [[cursos/agentes-con-modelos-abiertos/01-pesos-abiertos-y-licencias]]
- [[glosario/inferencia-local]]
- [[glosario/parametros]]
