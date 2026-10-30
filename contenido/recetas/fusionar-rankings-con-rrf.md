---
titulo: Fusionar rankings con Reciprocal Rank Fusion
descripcion: Combina los resultados de BM25 y de la búsqueda vectorial con RRF en Python puro, entiende qué hace la constante k y usa la fusión nativa de Qdrant y de pgvector.
creado: 2026-10-29
nivel: intermedio
minutos: 20
tema: rag
stack: ["Python"]
tags: [rag, rrf, busqueda-hibrida, bm25, qdrant]
relacionados: ["[[glosario/rrf]]", "[[recetas/busqueda-hibrida-con-bm25]]", "[[cursos/rag-a-fondo/03-recuperar-bien]]", "[[recetas/busqueda-hibrida-con-qdrant]]"]
---

## Problema

Tienes dos buscadores sobre el mismo corpus. [[glosario/bm25|BM25]] acierta con códigos, siglas y nombres exactos («E-4012», «RFC-9287»); la búsqueda vectorial acierta con paráfrasis («¿cómo devuelvo un pedido?» encuentra «devoluciones»). Quieres una sola lista que aproveche los dos.

Sumar sus puntuaciones no funciona: un BM25 de 12,4 y un coseno de 0,83 viven en escalas distintas, y la escala de BM25 cambia con cada consulta. **Reciprocal Rank Fusion** ([[glosario/rrf|RRF]]) evita el problema porque ignora las puntuaciones y usa solo las posiciones. Es la fusión que ofrecen Qdrant y LanceDB para la [[glosario/busqueda-hibrida|búsqueda híbrida]], y la que se escribe a mano en SQL con pgvector.

## Ingredientes

- Python 3.10 o superior, `pip install numpy rank-bm25` (y `qdrant-client` para la variante nativa).
- La función `embed()` de juguete de [[recetas/rag-minimo-viable]], guardada como `embed.py`. En producción, un modelo real ([[docs/modelos-abiertos/04-embeddings-y-rerankers]]).

## Pasos

1. **Entiende la fórmula.** Cada documento suma, en cada lista donde aparece, `1 / (k + posición)`, con posiciones desde 1. La propuso el artículo de Cormack, Clarke y Büttcher [*Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods*](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf) (SIGIR 2009). Allí `k = 60` se fijó en un estudio piloto y no se tocó en la validación; los autores observaron que el resultado era poco sensible al valor exacto. Ese 60 es el valor por defecto que verás en casi todas partes.

2. **Escribe la fusión.** Una docena de líneas. Dos detalles que suelen faltar: un id repetido dentro de la misma lista cuenta una sola vez, y los empates se resuelven de forma estable.

```python title="rrf.py"
from collections import defaultdict


def rrf(rankings: list[list[str]], k: int = 60, pesos: list[float] | None = None,
        top: int | None = None) -> list[tuple[str, float]]:
    """Reciprocal Rank Fusion (Cormack, Clarke y Büttcher, 2009).
    rankings: listas de ids ordenadas de mejor a peor. Devuelve (id, puntuación) de mayor a menor."""
    pesos = pesos or [1.0] * len(rankings)
    puntos: dict[str, float] = defaultdict(float)
    for ranking, peso in zip(rankings, pesos):
        vistos = set()
        for posicion, doc_id in enumerate(ranking, start=1):
            if doc_id in vistos:          # un id repetido en la misma lista solo cuenta una vez
                continue
            vistos.add(doc_id)
            puntos[doc_id] += peso / (k + posicion)
    # desempate estable: a igual puntuación, gana el que aparece antes en el primer ranking
    orden_original = {d: i for i, d in enumerate(dict.fromkeys(x for r in rankings for x in r))}
    fusion = sorted(puntos.items(), key=lambda par: (-par[1], orden_original[par[0]]))
    return fusion[:top] if top else fusion
```

3. **Genera los dos rankings y fusiónalos.** Cada buscador devuelve ids ordenados. BM25 solo devuelve los documentos con alguna coincidencia; el vectorial devuelve siempre algo, aunque no se parezca.

```python title="hibrida.py"
import re
import unicodedata

import numpy as np
from rank_bm25 import BM25Okapi

from rrf import rrf
from embed import embed            # el embed() de juguete de la receta de RAG mínimo

DOCS = {
    "dev-30": "Las devoluciones se aceptan durante 30 días desde la entrega del pedido.",
    "err-4012": "El error E-4012 aparece cuando la tarjeta de pago ha caducado.",
    "reemb": "Para pedir un reembolso entra en Mis pedidos y pulsa Devolver.",
    "envios": "Los envíos a Canarias tardan entre 5 y 7 días laborables.",
    "tarjeta": "Puedes cambiar la tarjeta de pago desde Ajustes > Facturación.",
}
ids = list(DOCS)


def tokens(texto: str) -> list[str]:
    texto = unicodedata.normalize("NFKD", texto.lower())
    return re.findall(r"\w+", "".join(c for c in texto if not unicodedata.combining(c)))


bm25 = BM25Okapi([tokens(t) for t in DOCS.values()])
matriz = np.array(embed(list(DOCS.values())), dtype=np.float32)


def ranking_bm25(consulta: str, n: int = 50) -> list[str]:
    puntos = bm25.get_scores(tokens(consulta))
    return [ids[i] for i in np.argsort(-puntos)[:n] if puntos[i] > 0]


def ranking_vectorial(consulta: str, n: int = 50) -> list[str]:
    sims = matriz @ np.array(embed([consulta])[0], dtype=np.float32)
    return [ids[i] for i in np.argsort(-sims)[:n]]


if __name__ == "__main__":
    for consulta in ["error E-4012 con la tarjeta", "¿cómo devuelvo un pedido?"]:
        lex, vec = ranking_bm25(consulta), ranking_vectorial(consulta)
        print(consulta)
        print("  BM25     ", lex)
        print("  vectorial", vec)
        print("  RRF      ", [(d, round(p, 4)) for d, p in rrf([lex, vec], top=3)])
```

```text
error E-4012 con la tarjeta
  BM25      ['err-4012', 'tarjeta', 'dev-30']
  vectorial ['err-4012', 'tarjeta', 'envios', 'reemb', 'dev-30']
  RRF       [('err-4012', 0.0328), ('tarjeta', 0.0323), ('dev-30', 0.0313)]
¿cómo devuelvo un pedido?
  BM25      ['reemb', 'dev-30']
  vectorial ['reemb', 'dev-30', 'tarjeta', 'err-4012', 'envios']
  RRF       [('reemb', 0.0328), ('dev-30', 0.0323), ('tarjeta', 0.0159)]
```

El primero en las dos listas suma 2/61 ≈ 0,0328. Un documento que solo aparece en una lista, aunque sea primero, suma como mucho 1/61: **RRF premia el acuerdo entre buscadores**. Fíjate también en que `dev-30` entra en BM25 para la primera consulta solo por compartir «la»: sin quitar palabras vacías, BM25 mete ruido.

4. **Pásalo a tu base vectorial.** En producción no fusionas en Python: la base lo hace en una sola consulta. En Qdrant (Apache-2.0), con BM25 sobre el índice de texto del *payload* (servidor ≥ 1.20) y `k` explícito (desde 1.16):

```python title="qdrant_rrf.py"
from qdrant_client import QdrantClient, models

from embed import embed
from hibrida import DOCS

client = QdrantClient(":memory:")            # en producción: QdrantClient(url="http://localhost:6333")
client.create_collection(
    "docs", vectors_config={"densa": models.VectorParams(size=512, distance=models.Distance.COSINE)})
client.create_payload_index(                  # índice de texto con scoring=True: BM25 (Qdrant >= 1.20)
    "docs", field_name="texto",
    field_schema=models.TextIndexParams(type=models.TextIndexType.TEXT, tokenizer=models.TokenizerType.WORD,
                                        lowercase=True, scoring=True))
client.upsert("docs", points=[
    models.PointStruct(id=i, vector={"densa": v}, payload={"doc_id": d, "texto": t})
    for i, ((d, t), v) in enumerate(zip(DOCS.items(), embed(list(DOCS.values()))))
])

consulta = "error E-4012 con la tarjeta"
res = client.query_points(
    "docs",
    prefetch=[
        models.Prefetch(query=embed([consulta])[0], using="densa", limit=50),
        models.Prefetch(query=models.TextQuery(text=consulta), using="texto", limit=50),
    ],
    query=models.RrfQuery(rrf=models.Rrf(k=60)),   # k explícito desde Qdrant 1.16
    limit=3, with_payload=True,
)
for p in res.points:
    print(round(p.score, 4), p.payload["doc_id"])
```

```text
0.0333 err-4012
0.0328 tarjeta
0.0318 dev-30
```

El orden coincide con el de Python. La puntuación del primero sale 2/60 en lugar de 2/61 porque Qdrant cuenta las posiciones desde 0; para ordenar da igual. El código se ha ejecutado en modo local (`":memory:"`); contra un servidor, alinea las versiones de cliente y servidor. Si usas vectores *sparse* en lugar del índice de texto, cambia el segundo `Prefetch` (ejemplo completo en [[recetas/busqueda-hibrida-con-qdrant]]).

En **pgvector** no hay operador de fusión: se escribe en SQL con dos subconsultas y `RANK()`. Esta consulta está verificada en PGlite (PostgreSQL 18.6 con pgvector 0.8.7); `$1` es el vector de la consulta, `$2` el texto y `$3` el cliente:

```sql title="hibrida_rrf.sql"
WITH semantica AS (
  SELECT id, RANK() OVER (ORDER BY embedding <=> $1::vector) AS rk
  FROM fragmentos WHERE tenant_id = $3
  ORDER BY embedding <=> $1::vector LIMIT 20
),
lexica AS (
  SELECT id, RANK() OVER (ORDER BY ts_rank_cd(tsv, q) DESC) AS rk
  FROM fragmentos, websearch_to_tsquery('spanish', $2) q
  WHERE tenant_id = $3 AND tsv @@ q
  ORDER BY ts_rank_cd(tsv, q) DESC LIMIT 20
)
SELECT f.id, f.contenido,
       COALESCE(1.0 / (60 + s.rk), 0) + COALESCE(1.0 / (60 + l.rk), 0) AS rrf
FROM semantica s FULL OUTER JOIN lexica l USING (id) JOIN fragmentos f USING (id)
ORDER BY rrf DESC LIMIT 5;
```

El `FULL OUTER JOIN` conserva los documentos que solo salen en una lista, y el `COALESCE` les da 0 en la otra. La tabla y los índices están en [[herramientas/pgvector]].

## Cómo comprobar que funciona

Primero, qué hace `k`. Con dos listas inventadas:

```python title="sensibilidad.py"
from rrf import rrf

lexico = ["a", "b", "c", "d"]
vector = ["d", "c", "e", "a"]
for k in (1, 60):
    print(f"k={k:<3}", [(d, round(p, 4)) for d, p in rrf([lexico, vector], k=k)])
print("pesos 2:1", [(d, round(p, 4)) for d, p in rrf([lexico, vector], pesos=[2.0, 1.0])][:3])
```

```text
k=1   [('a', 0.7), ('d', 0.7), ('c', 0.5833), ('b', 0.3333), ('e', 0.25)]
k=60  [('a', 0.032), ('d', 0.032), ('c', 0.032), ('b', 0.0161), ('e', 0.0159)]
pesos 2:1 [('a', 0.0484), ('c', 0.0479), ('d', 0.0476)]
```

Con `k = 1`, ser primero en una lista pesa muchísimo más que ser segundo. Con `k = 60` las diferencias entre posiciones altas se aplanan y manda aparecer en varias listas: `c`, segundo y tercero, empata con los que fueron primeros en una lista y cuartos en la otra. Los pesos rompen ese equilibrio a favor de un buscador.

Después, mide con tus datos. Toma 30 preguntas con su fragmento correcto y compara el [[glosario/recall-at-k|recall@k]] de BM25 solo, vectorial solo y fusión ([[cursos/rag-a-fondo/10-evaluar-un-rag]]). Si la fusión no mejora al mejor de los dos en tus preguntas, no te compensa la complejidad.

## Variaciones

- **RRF ponderado.** Si en tu dominio mandan los códigos exactos, da más peso a BM25 (`pesos=[2.0, 1.0]`; en Qdrant, `Rrf(weights=[…])` desde 1.17). La documentación de Qdrant recomienda no tocar los pesos sin un conjunto de evaluación.
- **Más de dos listas.** RRF admite cualquier número: varias reformulaciones de la consulta ([[cursos/rag-a-fondo/05-tecnicas-avanzadas-de-recuperacion]]), varios campos o varios modelos de embeddings.
- **Fusión por puntuaciones normalizadas.** Qdrant ofrece DBSF (normaliza cada lista antes de sumar). Úsala solo si has comprobado que tus puntuaciones son estables entre consultas.
- **Reranking después.** RRF decide qué candidatos pasan; un [[glosario/cross-encoder|cross-encoder]] decide el orden final de los pocos que llegan al modelo ([[glosario/reranking]]).

## Errores típicos

- **Sumar puntuaciones crudas.** Escalas distintas: el buscador con números más grandes manda siempre.
- **Cortar cada lista demasiado pronto.** Si cada buscador devuelve solo 5, la fusión no tiene material. Pide 20 a 50 a cada uno y corta después.
- **Filtrar después de fusionar.** Los filtros por cliente, idioma o permisos van dentro de cada búsqueda; si no, la fusión puede quedarse sin candidatos válidos (y, con permisos, filtrar tarde es una fuga: [[cursos/rag-a-fondo/07-permisos-y-multi-tenant]]).
- **Leer la puntuación RRF como relevancia.** 0,0328 solo dice «primero en las dos listas». No sirve como umbral para decidir si hay respuesta.
