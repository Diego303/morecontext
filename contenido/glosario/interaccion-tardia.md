---
titulo: Interacción tardía
descripcion: Recuperación que guarda un embedding por token y compara consulta y documento token a token con MaxSim, como hace ColBERT.
creado: 2026-10-29
categoria: contexto
ingles: Late interaction
aliases: [late interaction, ColBERT, MaxSim, multivector]
tags: [rag, embeddings]
relacionados: ["[[glosario/bi-encoder]]", "[[glosario/cross-encoder]]", "[[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]"]
---

La interacción tardía codifica la consulta y cada documento **por separado**, como un [[glosario/bi-encoder]], pero guarda un vector por token en lugar de uno por texto. La comparación llega al final: para cada token de la consulta se busca el token del documento más parecido y se suman esas similitudes máximas (MaxSim). Es la idea de ColBERT ([Khattab y Zaharia, 2020](https://arxiv.org/abs/2004.12832)).

## En la práctica

```python title="maxsim.py"
import numpy as np

def maxsim(q: np.ndarray, d: np.ndarray) -> float:
    # q: (tokens_consulta, dim) y d: (tokens_doc, dim), normalizados
    return float((q @ d.T).max(axis=1).sum())

rng = np.random.default_rng(0)
norm = lambda m: m / np.linalg.norm(m, axis=1, keepdims=True)
q, d = norm(rng.normal(size=(4, 8))), norm(rng.normal(size=(30, 8)))
print(round(maxsim(q, d), 3))
```

Los documentos se codifican al indexar, así que la búsqueda es rápida, y la comparación token a token captura coincidencias finas que un único vector por texto diluye. El coste es el índice: un vector por token ocupa muchas veces más que uno por fragmento. Úsala como recuperador principal si te cabe el índice, o como [[glosario/reranking]] sobre los candidatos de una búsqueda barata.

## No confundir con

- **[[glosario/late-chunking]]**: también usa vectores por token, pero los promedia en uno por fragmento antes de guardarlos.

## Ver también

- [[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]
- [[roadmap/30-contexto-y-rag/04-reranking]]
- [[glosario/embeddings]]
- [[docs/modelos-abiertos/04-embeddings-y-rerankers]]
