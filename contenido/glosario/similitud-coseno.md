---
titulo: Similitud coseno
descripcion: Medida de lo parecidos que son dos vectores según el ángulo entre ellos; la más usada para comparar embeddings.
creado: 2026-08-03
actualizado: 2026-10-29
categoria: contexto
ingles: cosine similarity
aliases: [cosine similarity, similitud del coseno, distancia coseno]
tags: [rag, matematicas]
relacionados: ["[[glosario/embeddings]]", "[[roadmap/30-contexto-y-rag/01-embeddings]]"]
---

La similitud coseno mide el coseno del ángulo entre dos vectores: el producto escalar dividido por el producto de sus longitudes. Va de −1 a 1, y cuanto más cerca de 1, más parecida es la dirección de los vectores. Con [[glosario/embeddings]], dirección parecida significa significado parecido.

## En la práctica

```python
import math
def coseno(a: list[float], b: list[float]) -> float:
    punto = sum(x * y for x, y in zip(a, b))
    return punto / (math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)))
```

Si los vectores están normalizados a longitud 1, la similitud coseno coincide con el producto escalar, que es más barato de calcular; muchos proveedores ya devuelven embeddings normalizados. Los valores absolutos dependen del modelo de embeddings: un 0,8 no significa lo mismo en todos. No fijes umbrales a ciegas, ajústalos con tus datos. En una base vectorial no lo calculas tú: en pgvector, por ejemplo, el operador `<=>` ordena por distancia coseno, y un índice [[glosario/hnsw|HNSW]] evita compararlo con todos los vectores.

## No confundir con

- **Distancia euclídea**: mide la distancia entre puntos. Con vectores normalizados ordena los resultados igual que el coseno.

## Ver también

- [[glosario/embeddings]]
- [[glosario/vector-store]]
- [[roadmap/30-contexto-y-rag/01-embeddings]]
- [[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]
