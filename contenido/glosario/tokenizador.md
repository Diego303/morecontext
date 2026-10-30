---
titulo: Tokenizador
descripcion: Componente que convierte el texto en la secuencia de tokens que procesa el modelo, y los tokens de vuelta en texto.
creado: 2026-07-01
actualizado: 2026-10-29
categoria: fundamentos
ingles: tokenizer
aliases: [tokenizer, tokenización]
tags: [fundamentos]
relacionados: ["[[glosario/token]]", "[[roadmap/00-fundamentos/02-tokens]]"]
---

El tokenizador es la pieza que traduce texto a [[glosario/token|tokens]] (identificadores numéricos de un vocabulario fijo) antes de que el modelo lo procese, y hace la conversión inversa al generar. Cada familia de modelos tiene el suyo, aprendido sobre su corpus de entrenamiento, normalmente con métodos de subpalabras como *byte-pair encoding*.

## En la práctica

Como el vocabulario se construye con las secuencias más frecuentes, las palabras comunes en inglés suelen ser un token y las palabras raras, los nombres propios, otros idiomas o el código se parten en varios. Por eso el mismo contenido cuesta distinto según el idioma y el modelo. Al cambiar de modelo, vuelve a medir: el recuento puede variar. Usa el endpoint de conteo del proveedor (`client.messages.count_tokens(...)` en Anthropic) en lugar de librerías de otros modelos. Con modelos de pesos abiertos, el tokenizador se distribuye junto a los pesos (en un archivo [[glosario/gguf|GGUF]], por ejemplo, va dentro) y lo puedes ejecutar tú.

## No confundir con

- **[[glosario/embeddings]]**: los vectores que representan significado; el tokenizador solo corta y numera.
- **[[glosario/chunking]]**: trocear documentos para buscar en ellos.

## Ver también

- [[roadmap/00-fundamentos/02-tokens]]
- [[glosario/token]]
- [[glosario/transformer]]
- [[glosario/plantilla-de-chat]]
