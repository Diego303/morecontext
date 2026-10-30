---
titulo: Cuantización de producto
descripcion: Técnica que comprime cada vector partiéndolo en trozos y sustituyendo cada trozo por el código de un centroide, para ahorrar memoria.
creado: 2026-10-29
categoria: contexto
ingles: Product quantization
aliases: [product quantization, PQ, cuantización por producto]
tags: [rag, busqueda, bases-vectoriales]
relacionados: ["[[glosario/ann]]", "[[glosario/ivf]]", "[[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]", "[[herramientas/qdrant]]"]
---

La cuantización de producto (PQ) comprime [[glosario/embeddings]]: divide cada vector en varios subvectores, aprende un pequeño diccionario de centroides para cada posición y guarda, en lugar de los números, el índice del centroide más cercano a cada trozo. Así el vector ocupa una fracción de su tamaño original. Las distancias se calculan sobre esa versión aproximada, así que se pierde precisión.

## En la práctica

Úsala cuando el índice ya no cabe en memoria, no antes. El patrón habitual es buscar con los vectores comprimidos, pedir más candidatos de los necesarios y reordenarlos con los vectores originales. En Qdrant:

```python
from qdrant_client import QdrantClient, models

client = QdrantClient(":memory:")
client.create_collection(
    collection_name="docs",
    vectors_config=models.VectorParams(size=1024, distance=models.Distance.COSINE),
    quantization_config=models.ProductQuantization(
        product=models.ProductQuantizationConfig(compression=models.CompressionRatio.X16)),
)
# al buscar: search_params=models.SearchParams(quantization=models.QuantizationSearchParams(rescore=True, oversampling=2.0))
```

Qdrant admite compresiones de `x4` a `x64` y avisa de que PQ pierde precisión y es más lenta que la cuantización escalar; la recomienda para vectores de muchas dimensiones. pgvector no implementa PQ: para reducir tamaño ofrece `halfvec` (media precisión) y `binary_quantize`.

## No confundir con

- **[[glosario/cuantizacion]] de modelos**: reduce los bits de los pesos de un LLM para ejecutarlo con menos memoria. Misma idea de aproximar números, otro objeto.
- **Cuantización escalar o binaria**: reduce los bits de cada componente del vector sin partirlo ni usar diccionarios.

## Ver también

- [[cursos/rag-a-fondo/04-bases-vectoriales-por-dentro]]
- [[glosario/ivf]]
- [[glosario/ann]]
- [[docs/modelos-abiertos/05-bases-vectoriales]]
