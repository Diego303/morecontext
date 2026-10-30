---
titulo: Búsqueda híbrida con Qdrant
descripcion: Monta en Qdrant una búsqueda densa más léxica fusionada con RRF, con vectores sparse o con el BM25 sobre texto de la 1.20, y pruébala en memoria sin servidor.
creado: 2026-10-29
nivel: intermedio
minutos: 30
tema: rag
stack: [Qdrant, Python]
tags: [rag, busqueda-hibrida, qdrant, bm25, rrf, open-source]
relacionados: ["[[recetas/busqueda-hibrida-con-bm25]]", "[[herramientas/qdrant]]", "[[docs/modelos-abiertos/05-bases-vectoriales]]", "[[cursos/rag-a-fondo/03-recuperar-bien]]", "[[glosario/rrf]]"]
---

## Problema

Ya sabes por qué una [[glosario/busqueda-hibrida|búsqueda híbrida]] gana a la vectorial sola: los [[glosario/embeddings|embeddings]] entienden paráfrasis y [[glosario/bm25|BM25]] clava códigos y nombres propios. En [[recetas/busqueda-hibrida-con-bm25]] lo hiciste en memoria con `rank-bm25` y numpy. Eso no escala ni filtra por cliente.

Aquí lo llevas a [[herramientas/qdrant|Qdrant]], una base vectorial con licencia Apache-2.0 que hace las dos búsquedas y la fusión [[glosario/rrf|RRF]] en una sola consulta, con filtro por inquilino. Tienes dos formas de poner la parte léxica:

- **Vectores *sparse*** con el modificador IDF: tú calculas las frecuencias y Qdrant aplica el IDF. Funciona en cualquier versión reciente.
- **BM25 sobre el texto del payload**, nuevo en Qdrant 1.20 (22 oct. 2026, [notas de versión](https://github.com/qdrant/qdrant/releases)): indexas el campo de texto y consultas con `TextQuery`, sin generar vectores *sparse*.

## Ingredientes

- Python 3.10 o superior y `pip install qdrant-client` (probado con 1.20.0). Para producción, un servidor Qdrant 1.20 o superior: cliente y servidor deben ir alineados en versión.
- Un modelo de embeddings. El ejemplo usa uno abierto servido por [[herramientas/ollama|Ollama]] (`pip install ollama`); para la prueba hay un `embed` falso que no necesita nada.
- Documentos ya troceados ([[recetas/trocear-documentos]]) con un `tenant_id` si tienes varios clientes.

## Pasos

1. **Normaliza y genera el vector *sparse*.** El vector disperso es un diccionario término → peso. Aquí cada término se convierte en un índice entero con un *hash* y su peso es la frecuencia en el texto. Con `Modifier.IDF`, Qdrant multiplica por el IDF calculado sobre la colección, así que el resultado se parece a BM25, aunque sin su saturación de frecuencias ni su normalización por longitud. Usa la misma normalización (minúsculas, sin tildes) al indexar y al consultar.

2. **Crea la colección con dos espacios con nombre** (`densa` y `lexica`) y un índice de texto con `scoring=True` para la variante BM25.

3. **Consulta con `prefetch` y fusiona con `RrfQuery`.** Cada `Prefetch` es una búsqueda independiente que trae candidatos; la consulta principal los fusiona por posición. El filtro de inquilino va **dentro de cada `Prefetch`**, que es donde se eligen los candidatos. También puedes pasarlo una vez como `query_filter` en la consulta principal: en modo local se propaga a las ramas (comprobado con 1.20.0). Lo que no sirve es filtrar en tu código después de fusionar.

```python title="buscador.py"
import hashlib
import re
import unicodedata
from collections import Counter

from qdrant_client import QdrantClient, models

COLECCION = "docs"


def normalizar(texto: str) -> list[str]:
    """Minúsculas y sin tildes: «Envíos» y «envios» deben ser el mismo término."""
    texto = unicodedata.normalize("NFKD", texto.lower())
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return re.findall(r"\w+", texto)


def sparse(texto: str) -> models.SparseVector:
    """Vector disperso: un índice por término y su frecuencia. El IDF lo pone Qdrant."""
    tf = Counter(int(hashlib.md5(t.encode()).hexdigest(), 16) % 2**31 for t in normalizar(texto))
    return models.SparseVector(indices=list(tf), values=[float(n) for n in tf.values()])


def crear_coleccion(client: QdrantClient, dim: int) -> None:
    client.create_collection(
        COLECCION,
        vectors_config={"densa": models.VectorParams(size=dim, distance=models.Distance.COSINE)},
        sparse_vectors_config={"lexica": models.SparseVectorParams(modifier=models.Modifier.IDF)},
    )
    # índice de texto con BM25 (Qdrant >= 1.20) sobre el texto ya normalizado
    client.create_payload_index(
        COLECCION, field_name="busqueda",
        field_schema=models.TextIndexParams(type=models.TextIndexType.TEXT,
                                            tokenizer=models.TokenizerType.WORD,
                                            lowercase=True, scoring=True),
    )
    client.create_payload_index(
        COLECCION, field_name="tenant_id",
        field_schema=models.KeywordIndexParams(type=models.KeywordIndexType.KEYWORD, is_tenant=True),
    )


def indexar(client: QdrantClient, docs: list[dict], embed) -> None:
    vectores = embed([d["texto"] for d in docs])
    client.upsert(COLECCION, points=[
        models.PointStruct(
            id=d["id"],
            vector={"densa": v, "lexica": sparse(d["texto"])},
            payload={**d, "busqueda": " ".join(normalizar(d["texto"]))},
        )
        for d, v in zip(docs, vectores)
    ])


def buscar(client: QdrantClient, consulta: str, tenant: str, embed,
           lexica: str = "sparse", k: int = 5, candidatos: int = 20):
    filtro = models.Filter(must=[
        models.FieldCondition(key="tenant_id", match=models.MatchValue(value=tenant))])
    if lexica == "sparse":
        rama_lexica = models.Prefetch(query=sparse(consulta), using="lexica",
                                      limit=candidatos, filter=filtro)
    else:  # "texto": BM25 sobre el índice de texto del payload
        rama_lexica = models.Prefetch(query=models.TextQuery(text=" ".join(normalizar(consulta))),
                                      using="busqueda", limit=candidatos, filter=filtro)
    res = client.query_points(
        COLECCION,
        prefetch=[
            models.Prefetch(query=embed([consulta])[0], using="densa",
                            limit=candidatos, filter=filtro),
            rama_lexica,
        ],
        query=models.RrfQuery(rrf=models.Rrf(k=60)),
        limit=k, with_payload=True,
    )
    return [(p.id, round(p.score, 4), p.payload["texto"]) for p in res.points]
```

4. **Conecta los embeddings reales.** Cualquier función `embed(textos) -> list[list[float]]` vale. Con un modelo abierto en Ollama (catálogo y criterios en [[docs/modelos-abiertos/04-embeddings-y-rerankers]]):

```python title="embeddings.py"
import ollama

MODELO_EMBEDDINGS = "qwen3-embedding:0.6b"  # el mismo para documentos y consultas


def embed(textos: list[str]) -> list[list[float]]:
    return ollama.embed(model=MODELO_EMBEDDINGS, input=textos).embeddings
```

La dimensión de la colección la da el modelo: créala con `dim=len(embed(["prueba"])[0])` en vez de escribir el número a mano.

## Cómo comprobar que funciona

Este script usa `QdrantClient(":memory:")`, el modo local del cliente: la misma API sin servidor. El `embed` falso cuenta palabras con *hashing*; no entiende significado, pero deja ver la tubería entera. El documento 5 es de otro cliente y no debe salir nunca.

```python title="probar.py"
import hashlib

from qdrant_client import QdrantClient

from buscador import buscar, crear_coleccion, indexar, normalizar


def embed_de_prueba(textos: list[str]) -> list[list[float]]:
    """Solo para probar sin servicio: bolsa de palabras con hashing. No entiende significado."""
    vectores = []
    for t in textos:
        v = [1e-6] * 256
        for palabra in normalizar(t):
            v[int(hashlib.md5(palabra.encode()).hexdigest(), 16) % 256] += 1.0
        vectores.append(v)
    return vectores


DOCS = [
    {"id": 1, "tenant_id": "acme", "texto": "Para pedir un reembolso, entra en Mis pedidos y pulsa Devolver."},
    {"id": 2, "tenant_id": "acme", "texto": "El error E-4012 aparece cuando la tarjeta ha caducado."},
    {"id": 3, "tenant_id": "acme", "texto": "Los envíos a Canarias tardan entre 5 y 7 días laborables."},
    {"id": 4, "tenant_id": "acme", "texto": "Las devoluciones se aceptan durante 30 días desde la entrega."},
    {"id": 5, "tenant_id": "otra", "texto": "El error E-4012 de otra empresa no debe salir nunca."},
]

client = QdrantClient(":memory:")  # en producción: QdrantClient(url="http://localhost:6333")
crear_coleccion(client, dim=len(embed_de_prueba(["x"])[0]))
indexar(client, DOCS, embed_de_prueba)

for lexica in ["sparse", "texto"]:
    for consulta in ["error E-4012", "envios a canarias"]:
        print(f"[{lexica}] {consulta}")
        for fila in buscar(client, consulta, "acme", embed_de_prueba, lexica=lexica, k=3):
            print("   ", *fila)
```

Salida real con `qdrant-client` 1.20.0 (recortada a una consulta por variante):

```text
UserWarning: Payload indexes have no effect in the local Qdrant, except text indexes with `scoring`, which enable text queries. Please use server Qdrant if you need payload indexes.
[sparse] error E-4012
    2 0.0333 El error E-4012 aparece cuando la tarjeta ha caducado.
    1 0.0164 Para pedir un reembolso, entra en Mis pedidos y pulsa Devolver.
    3 0.0161 Los envíos a Canarias tardan entre 5 y 7 días laborables.
[texto] envios a canarias
    3 0.0333 Los envíos a Canarias tardan entre 5 y 7 días laborables.
    1 0.0164 Para pedir un reembolso, entra en Mis pedidos y pulsa Devolver.
    4 0.0161 Las devoluciones se aceptan durante 30 días desde la entrega.
```

Qué mirar:

- **El primero suma 0,0333 = 2/60**: está el primero en las dos listas. Qdrant cuenta la posición desde 0, así que el primer puesto aporta `1/(60 + 0)`.
- **El documento 5 no aparece** aunque contiene «E-4012»: el filtro por `tenant_id` funciona dentro de cada rama.
- **El aviso** dice que en modo local los índices de payload no hacen nada, salvo los de texto con `scoring`. El índice `is_tenant` solo cuenta en servidor; el filtro sí se aplica.
- Para medir de verdad, monta 30 consultas con su documento correcto y compara el *recall@5* de densa sola, léxica sola e híbrida, como en [[cursos/rag-a-fondo/10-evaluar-un-rag]].

## Variaciones

- **BM25 sobre texto o *sparse*.** La variante `texto` te ahorra generar y guardar vectores *sparse*, pero exige Qdrant 1.20 en servidor y cliente. Los *sparse* te dejan usar un codificador aprendido (SPLADE) en lugar de frecuencias; opciones en [[docs/modelos-abiertos/04-embeddings-y-rerankers]].
- **Pesos.** Desde la 1.17, `models.Rrf(weights=[3.0, 1.0])` da más peso a una rama. La documentación de Qdrant recomienda no tocarlos sin un conjunto de evaluación ([consultas híbridas](https://qdrant.tech/documentation/search/hybrid-queries/)).
- **Otra fusión.** `models.FusionQuery(fusion=models.Fusion.RRF)` es la forma clásica, sin `k` configurable; `Fusion.DBSF` normaliza puntuaciones en vez de usar posiciones. Cómo funciona RRF por dentro, en [[recetas/fusionar-rankings-con-rrf]].
- **Normalización en el servidor.** El cliente 1.20 expone en `TextIndexParams` opciones como `ascii_folding`, `stopwords` y `stemmer`. En modo local no se pueden usar (ver Errores típicos), por eso el ejemplo guarda el campo `busqueda` ya normalizado. En servidor, pruébalas con tus consultas antes de quitar la normalización propia.
- **Reranking.** Pide 50 candidatos fusionados y pasa los 20 primeros por un *cross-encoder* antes de quedarte con 5 ([[glosario/reranking]]).
- **Otra base.** Si ya tienes Postgres, la misma híbrida se hace en SQL con pgvector y `tsvector('spanish')`: [[recetas/rag-local-con-pgvector]]. Comparativa en [[docs/modelos-abiertos/05-bases-vectoriales]].

## Errores típicos

- **Filtrar después de fusionar.** Si descartas en tu código los resultados de otros clientes, esos candidatos ya han ocupado los huecos de cada rama y te quedan menos de los que pides. Filtra en la consulta (en cada `Prefetch` o con `query_filter`). Más sobre aislamiento en [[cursos/rag-a-fondo/07-permisos-y-multi-tenant]].
- **Olvidar `Modifier.IDF`.** Sin él, el *sparse* puntúa por frecuencia bruta y una palabra común pesa como un código de error.
- **`TextQuery` con un índice personalizado en modo local.** Si añades `ascii_folding`, `stemmer` o similares, el cliente local lanza `NotImplementedError: Text queries in the local Qdrant only support text indexes with the default tokenization`. Comprobado con 1.20.0: en local usa la tokenización por defecto.
- **Tildes.** Sin normalizar, «envios» no encuentra «envíos» con la tokenización por defecto (comprobado en local). Normaliza igual al indexar y al consultar.
- **Mezclar modelos de embeddings** entre documentos y consultas, o cambiar de modelo sin reindexar.
- **Cliente y servidor desalineados.** `RrfQuery` con `k` necesita servidor 1.16 o superior y `TextQuery` 1.20: un servidor antiguo rechazará la consulta.
