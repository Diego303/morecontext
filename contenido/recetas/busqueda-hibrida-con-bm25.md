---
titulo: Búsqueda híbrida con BM25 y embeddings
descripcion: Combina búsqueda por palabras clave con BM25 y búsqueda vectorial con embeddings, y fusiona los dos rankings con Reciprocal Rank Fusion en Python.
creado: 2026-08-27
actualizado: 2026-10-29
nivel: intermedio
minutos: 35
tema: rag
stack: [python, rank-bm25, numpy]
tags: [rag, busqueda-hibrida, bm25, embeddings]
relacionados: ["[[roadmap/30-contexto-y-rag/03-busqueda-hibrida]]", "[[glosario/busqueda-hibrida]]", "[[glosario/bm25]]", "[[cursos/rag-a-fondo/03-recuperar-bien]]"]
---

## Problema

Tu RAG busca solo con [[glosario/embeddings|embeddings]]. Funciona bien con preguntas parafraseadas («¿cómo devuelvo un pedido?» encuentra «devoluciones»), pero falla con términos exactos: códigos de error, referencias de producto, nombres propios. La consulta «E-4012» no se parece semánticamente a nada.

La búsqueda por palabras clave con [[glosario/bm25|BM25]] tiene el problema contrario: clava los términos exactos y no entiende sinónimos. La [[glosario/busqueda-hibrida|búsqueda híbrida]] ejecuta las dos y combina los resultados.

## Ingredientes

- Python 3.10 o superior.
- `pip install rank-bm25 numpy`
- Un proveedor de embeddings (cualquiera). En el código es una función `embed()` que conectas tú.
- Documentos ya troceados ([[recetas/trocear-documentos]]).

## Pasos

1. **Tokeniza para BM25.** BM25 compara palabras, así que normaliza: minúsculas y sin tildes. Para español conviene además quitar palabras vacías o usar un *stemmer* (ver Variaciones).

2. **Calcula los dos rankings.** BM25 con `rank_bm25.BM25Okapi`. El vectorial con [[glosario/similitud-coseno|similitud coseno]]: si normalizas los vectores, es un producto escalar.

3. **Fusiónalos con Reciprocal Rank Fusion (RRF).** Las puntuaciones de BM25 y de coseno no son comparables entre sí (escalas distintas), así que RRF usa solo la **posición**: cada documento suma `1 / (k + posición)` en cada ranking donde aparece. El valor habitual de `k` es 60. Un documento que sale alto en los dos rankings gana a uno que sale primero en uno y no aparece en el otro.

```python title="hibrida.py"
import re
import unicodedata

import numpy as np
from rank_bm25 import BM25Okapi


def embed(textos: list[str]) -> list[list[float]]:
    """Devuelve un vector por texto. Usa el proveedor de embeddings que prefieras."""
    raise NotImplementedError("Conecta aquí tu proveedor de embeddings")


def tokenizar(texto: str) -> list[str]:
    # minúsculas y sin tildes: «Facturación» y «facturacion» deben coincidir
    texto = unicodedata.normalize("NFKD", texto.lower())
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return re.findall(r"\w+", texto)


class BuscadorHibrido:
    def __init__(self, documentos: list[str], embed_fn=embed):
        self.documentos = documentos
        self.embed = embed_fn
        self.bm25 = BM25Okapi([tokenizar(d) for d in documentos])
        vectores = np.array(self.embed(documentos), dtype=np.float32)
        # normalizados: así el producto escalar es la similitud coseno
        self.vectores = vectores / np.linalg.norm(vectores, axis=1, keepdims=True)

    def _ranking_bm25(self, consulta: str, n: int) -> list[int]:
        puntos = self.bm25.get_scores(tokenizar(consulta))
        orden = np.argsort(-puntos)[:n]
        return [int(i) for i in orden if puntos[i] > 0]  # sin coincidencias, no cuenta

    def _ranking_vectorial(self, consulta: str, n: int) -> list[int]:
        q = np.array(self.embed([consulta])[0], dtype=np.float32)
        q /= np.linalg.norm(q)
        similitudes = self.vectores @ q
        return [int(i) for i in np.argsort(-similitudes)[:n]]

    def buscar(self, consulta: str, k: int = 5, candidatos: int = 50, rrf_k: int = 60):
        rankings = [
            self._ranking_bm25(consulta, candidatos),
            self._ranking_vectorial(consulta, candidatos),
        ]
        # Reciprocal Rank Fusion: suma 1 / (rrf_k + posición) de cada ranking
        puntos: dict[int, float] = {}
        for ranking in rankings:
            for posicion, doc in enumerate(ranking, start=1):
                puntos[doc] = puntos.get(doc, 0.0) + 1.0 / (rrf_k + posicion)
        mejores = sorted(puntos.items(), key=lambda x: x[1], reverse=True)[:k]
        return [(doc, round(p, 4), self.documentos[doc]) for doc, p in mejores]
```

4. **Conecta tu proveedor** sustituyendo el cuerpo de `embed()`. Calcula los embeddings de los documentos una vez al indexar y guárdalos; en cada consulta solo calculas el de la pregunta. Anthropic no ofrece modelo de embeddings: usa el de otro proveedor o uno abierto. Con [[docs/modelos-abiertos/01-ollama|Ollama]] en local queda así (opciones y modelos en [[docs/modelos-abiertos/04-embeddings-y-rerankers]]):

```python title="embed_local.py"
import ollama

MODELO_EMBEDDINGS = "bge-m3"  # descárgalo antes con `ollama pull bge-m3`


def embed(textos: list[str]) -> list[list[float]]:
    return [list(v) for v in ollama.embed(model=MODELO_EMBEDDINGS, input=textos).embeddings]
```

Pásalo como `BuscadorHibrido(docs, embed_fn=embed)`.

## Cómo comprobar que funciona

Para probar sin proveedor, este script usa un `embed` falso por *hashing* de palabras. No entiende significado, pero sirve para ver la tubería entera:

```python title="probar.py"
import hashlib

import numpy as np

from hibrida import BuscadorHibrido, tokenizar


def embed_de_prueba(textos: list[str]) -> list[list[float]]:
    """Solo para probar sin proveedor: bolsa de palabras con hashing. No captura significado."""
    vectores = []
    for t in textos:
        v = np.zeros(256, dtype=np.float32)
        for palabra in tokenizar(t):
            v[int(hashlib.md5(palabra.encode()).hexdigest(), 16) % 256] += 1.0
        vectores.append((v + 1e-6).tolist())  # evita vectores nulos
    return vectores


docs = [
    "Para pedir un reembolso, entra en Mis pedidos y pulsa Devolver.",
    "El error E-4012 aparece cuando la tarjeta ha caducado.",
    "Los envíos a Canarias tardan entre 5 y 7 días laborables.",
    "Puedes cambiar la contraseña desde Ajustes > Seguridad.",
    "Las devoluciones se aceptan durante 30 días desde la entrega.",
]
buscador = BuscadorHibrido(docs, embed_fn=embed_de_prueba)
for consulta in ["error E-4012", "¿cómo devuelvo un pedido?"]:
    print(consulta)
    for doc, puntos, texto in buscador.buscar(consulta, k=3):
        print(f"  {puntos:.4f}  [{doc}] {texto}")
```

```text
# salida de ejemplo
error E-4012
  0.0328  [1] El error E-4012 aparece cuando la tarjeta ha caducado.
  0.0161  [0] Para pedir un reembolso, entra en Mis pedidos y pulsa Devolver.
  0.0159  [2] Los envíos a Canarias tardan entre 5 y 7 días laborables.
```

- El documento con «E-4012» sale primero con unos 2/61 puntos: es el primero en los dos rankings.
- Con el `embed` falso, «¿cómo devuelvo un pedido?» no encuentra el documento de devoluciones, porque «devuelvo» y «devoluciones» son palabras distintas. Con embeddings reales debería subir. Es justo lo que aporta la parte vectorial.
- Para medir de verdad: 30 consultas con su documento correcto y compara el *recall@5* (¿está el correcto entre los 5 primeros?) de BM25 solo, vectorial solo e híbrida. Lo explica [[cursos/rag-a-fondo/10-evaluar-un-rag]].

## Variaciones

- **RRF a fondo.** Por qué `k = 60`, cómo fusionar más de dos rankings y cómo dar pesos: [[recetas/fusionar-rankings-con-rrf]].
- **Pesos.** Si en tu dominio pesan más los términos exactos, multiplica la contribución de BM25: `puntos += peso / (rrf_k + posicion)`.
- **Stemming y palabras vacías.** Una librería de *stemming* en español hace que «devuelvo» y «devolver» compartan raíz. Quitar «el», «de», «la» reduce ruido en consultas largas.
- **Reranking.** Fusiona 50 candidatos y pasa los 20 primeros por un modelo de [[glosario/reranking|reranking]] antes de quedarte con 5 ([[roadmap/30-contexto-y-rag/04-reranking]]).
- **Escala.** Este índice vive en memoria. Con cientos de miles de trozos, usa un [[glosario/vector-store|vector store]] o un motor de búsqueda con soporte de BM25 y vectores, y aplica RRF sobre sus resultados. Hay dos recetas con bases abiertas: [[recetas/busqueda-hibrida-con-qdrant]] (denso y *sparse* con RRF en el servidor) y [[recetas/rag-local-con-pgvector]] (vectores y `tsvector` en PostgreSQL).
- **Recuperación contextual.** Añadir a cada trozo una frase de contexto antes de indexarlo mejora las dos búsquedas ([[glosario/recuperacion-contextual]]).

## Errores típicos

- **Sumar puntuaciones crudas.** Un BM25 de 12,4 más un coseno de 0,83 no significa nada. Usa posiciones (RRF) o normaliza con cuidado.
- **Tokenizar distinto al indexar y al consultar.** Usa la misma función `tokenizar` en los dos sitios.
- **Recalcular embeddings de los documentos en cada consulta.** Es lento y caro. Indexa una vez.
- **No normalizar los vectores** y usar el producto escalar como si fuera coseno.
- **Mezclar modelos de embeddings.** Los vectores de la consulta y de los documentos tienen que venir del mismo modelo.
- **No medir.** La híbrida suele ayudar con términos exactos, pero compruébalo con tus consultas antes de asumirlo.
