---
titulo: Token
descripcion: Unidad mínima de texto que procesa el modelo, normalmente un trozo de palabra; con ella se miden contexto, coste y límites.
creado: 2026-07-01
categoria: fundamentos
aliases: [tokens]
tags: [fundamentos, costes]
relacionados: ["[[roadmap/00-fundamentos/02-tokens]]", "[[glosario/tokenizador]]"]
---

Un token es la unidad en la que el modelo lee y escribe texto. Suele ser un fragmento de palabra, una palabra corta, un signo de puntuación o un espacio. El [[glosario/tokenizador]] de cada modelo decide cómo se corta el texto, así que el mismo texto puede dar recuentos distintos en modelos distintos.

## En la práctica

Todo se mide en tokens: el tamaño de la [[glosario/ventana-de-contexto]], el límite de respuesta ([[glosario/max-tokens]]), el precio y buena parte de la [[glosario/latencia]]. No estimes a ojo: cuéntalos.

```python
n = client.messages.count_tokens(model=MODEL, messages=messages).input_tokens
```

Tras cada llamada, `resp.usage` te da `input_tokens` y `output_tokens`. Los de salida suelen costar más y son los que más tiempo tardan en generarse. El español, el código y el JSON tienden a ocupar más tokens por palabra que el inglés corriente.

## No confundir con

- **Palabra o carácter**: no hay una equivalencia fija con los tokens.
- **[[glosario/embeddings|Embedding]]**: un vector que representa un texto entero, no una unidad de texto.

## Ver también

- [[roadmap/00-fundamentos/02-tokens]]
- [[roadmap/00-fundamentos/05-coste-y-latencia]]
- [[docs/produccion/02-costes-y-limites]]
