---
titulo: Guía de modelos
descripcion: Cómo sacar lo mejor de un modelo de lenguaje con prompts, contexto, formato, razonamiento y parámetros, con ejemplos de antes y después.
creado: 2026-07-06
actualizado: 2026-10-29
orden: 4
tags: [modelos, prompting]
relacionados: ["[[roadmap/10-prompting/index]]", "[[docs/prompting/index]]", "[[glosario/prompt]]", "[[docs/modelos-abiertos/index]]"]
---

La guía de modelos reúne lo que funciona al hablar con un modelo: cómo pedir, qué darle de contexto, qué formato exigir y cuándo dejarle pensar. Cada página enuncia un principio, explica **por qué funciona**, lo enseña con un ejemplo de antes y después, y dice cuándo no aplica.

## Qué cubre

1. [[modelos/01-principios-de-prompting]]: ocho principios para escribir un [[glosario/prompt|prompt]] claro. Empieza por aquí.
2. [[modelos/02-ingenieria-de-contexto]]: qué meter en el contexto, en qué orden y qué dejar fuera.
3. [[modelos/03-formato-y-salidas-estructuradas]]: pedir JSON, garantizarlo con esquema y validarlo siempre.
4. [[modelos/04-dejar-pensar-al-modelo]]: razonamiento adaptativo y [[glosario/esfuerzo|esfuerzo]], y cuándo no compensan.
5. [[modelos/05-elegir-modelo-por-tarea]]: un método para elegir modelo midiendo, sin rankings.
6. [[modelos/06-parametros]]: `max_tokens`, secuencias de parada, razonamiento y esfuerzo, y dónde siguen existiendo la temperatura y `top_p`.
7. [[modelos/07-documentos-largos]]: dónde colocar un documento largo, extraer antes de razonar y citar.
8. [[modelos/08-antipatrones]]: ocho errores frecuentes con su arreglo.
9. [[modelos/09-checklist-produccion]]: la lista que pasas a un prompt antes de ponerlo en producción.
10. [[modelos/10-prompting-rag-o-fine-tuning]]: qué palanca tocar, instrucciones, conocimiento o comportamiento.
11. [[modelos/11-modelos-abiertos]]: qué cambia al trabajar con modelos de [[glosario/pesos-abiertos|pesos abiertos]].
12. [[modelos/12-inferencia-local]]: memoria, cuantización y contexto cuando el modelo corre en tu máquina.

## Cómo usarla

Si estás empezando, lee las páginas 1 a 3 en orden después del [[roadmap/10-prompting/index|nivel 10 del roadmap]]. Si ya tienes un prompt en marcha, ve directo a los [[modelos/08-antipatrones|antipatrones]] y al checklist.

Los ejemplos usan la API de Mensajes de Anthropic, pero los principios sirven con cualquier proveedor y con modelos abiertos. Muchos servidores locales (Ollama, vLLM, llama.cpp) aceptan el formato de OpenAI o el de Anthropic, así que el mismo código funciona cambiando `base_url`, con lagunas que se explican en [[docs/modelos-abiertos/03-apis-compatibles-y-litellm]]. Lo que depende del modelo concreto se indica en cada página.

Si vas a usar un modelo abierto, empieza por las páginas 11 y 12 y por [[docs/modelos-abiertos/index]]. Ten presente que «pesos abiertos» no equivale a open source según la definición de la OSI ([[glosario/open-source-ai]]): lee siempre la licencia del modelo.

> [!consejo] Mide antes de creer
> Un cambio de prompt que parece mejor en tres ejemplos puede empeorar en treinta. Prueba cada cambio contra un conjunto de casos, como se explica en [[roadmap/10-prompting/05-iterar-con-casos-de-prueba]].
