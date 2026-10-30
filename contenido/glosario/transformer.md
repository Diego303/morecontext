---
titulo: Transformer
descripcion: Arquitectura de red neuronal basada en atención sobre la que se construyen los LLM actuales.
creado: 2026-07-01
actualizado: 2026-10-29
categoria: fundamentos
aliases: [arquitectura Transformer, transformador]
tags: [fundamentos]
relacionados: ["[[glosario/llm]]", "[[roadmap/00-fundamentos/01-que-es-un-llm]]"]
---

El Transformer es la arquitectura de red neuronal presentada en *Attention Is All You Need* (Vaswani et al., 2017). Su pieza central es la **autoatención** ([[glosario/atencion]]): para procesar cada [[glosario/token]], el modelo pondera todos los demás tokens del contexto y decide cuáles importan. Permite entrenar en paralelo con mucho texto, y por eso es la base de los [[glosario/llm|LLM]] actuales.

## En la práctica

No necesitas saber implementarlo para construir agentes, pero dos consecuencias te afectan a diario. Primera: los LLM de tipo decodificador generan un token cada vez, cada uno condicionado por todos los anteriores, así que la salida larga es lenta y cara; para no recalcular lo anterior en cada token, el modelo guarda una [[glosario/kv-cache]]. Segunda: el coste de la atención crece con la longitud del contexto, lo que explica en parte que la [[glosario/ventana-de-contexto]] tenga un límite y que los tokens de entrada se paguen.

## No confundir con

- **[[glosario/llm]]**: el modelo entrenado. El Transformer es la arquitectura; el LLM, el resultado de entrenarla con datos.

## Ver también

- [[roadmap/00-fundamentos/01-que-es-un-llm]]
- [[glosario/tokenizador]]
- [[glosario/llm]]
- [[biblioteca/attention-is-all-you-need]]
- [[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]
