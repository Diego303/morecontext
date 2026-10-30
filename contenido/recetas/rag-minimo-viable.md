---
titulo: Un RAG mínimo viable en una tarde
descripcion: El RAG más simple que funciona de verdad (ingesta, embeddings, búsqueda, prompt con fuentes y citas comprobadas) y la misma idea con LangChain y con LlamaIndex.
creado: 2026-10-29
nivel: inicial
minutos: 40
tema: rag
stack: ["Python"]
tags: [rag, embeddings, citas, langchain, llamaindex]
relacionados: ["[[cursos/rag-a-fondo/01-anatomia-de-un-rag]]", "[[sistemas/rag-con-citas]]", "[[plantillas/checklist-de-rag]]", "[[recetas/rag-local-con-pgvector]]"]
---

## Problema

Tienes una carpeta de documentos internos (políticas, manuales, una wiki exportada) y quieres que un modelo responda preguntas sobre ellos citando de dónde saca cada dato. No necesitas todavía reranking, búsqueda híbrida ni un servidor de base vectorial. Necesitas **la versión más pequeña que funciona de punta a punta**, para tener algo que medir y mejorar.

Un [[glosario/rag|RAG]] mínimo tiene seis piezas: cargar, trocear, vectorizar, guardar, buscar y responder con fuentes. Todo lo demás (lo que ves en [[cursos/rag-a-fondo/index|RAG a fondo]]) se añade después, cuando los datos digan que hace falta.

## Ingredientes

- Python 3.10 o superior, `pip install anthropic numpy`.
- Una carpeta `docs/` con archivos Markdown. Si tienes PDF, conviértelos antes ([[recetas/pdf-a-markdown-con-docling]]).
- Un modelo de [[glosario/embeddings|embeddings]]. El código trae uno **de juguete** para ejecutarse sin servicios; para uso real, un modelo abierto como `bge-m3` o `qwen3-embedding` servido con Ollama ([[docs/modelos-abiertos/04-embeddings-y-rerankers]]). Anthropic no ofrece modelo de embeddings.

## Pasos

1. **Trocea por secciones.** Un fragmento por sección de Markdown, con la ruta de encabezados («Política de vacaciones 2026 > Solicitud»). Es el [[glosario/chunking|chunking]] más simple que respeta el sentido del documento.
2. **Vectoriza la sección y el texto juntos** y guarda vectores, textos y metadatos en un archivo `.npz`. Con unos miles de fragmentos, una matriz de numpy en memoria basta: la búsqueda exacta tarda milisegundos.
3. **Busca por similitud coseno.** Como los vectores están normalizados, la [[glosario/similitud-coseno|similitud coseno]] es un producto de matriz por vector.
4. **Monta el prompt con fuentes etiquetadas.** Cada fragmento va dentro de `<fuente id="…">`. El [[glosario/prompt-de-sistema|prompt de sistema]] pide citar con ese id y abstenerse si no hay respuesta.
5. **Comprueba las citas en código.** El modelo puede citar un id que no le enviaste. Separa las citas válidas de las inventadas y trata `stop_reason`.

```python title="rag_minimo.py"
import hashlib
import json
import pathlib
import re
import unicodedata

import anthropic
import numpy as np

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()


# 1. Embeddings. De juguete para que el ejemplo corra sin servicios.
def embed(textos: list[str]) -> list[list[float]]:
    """Trigramas de caracteres con hashing: deterministas, sin red, sin semántica real."""
    vectores = np.zeros((len(textos), 512), dtype=np.float32)
    for i, texto in enumerate(textos):
        texto = unicodedata.normalize("NFKD", texto.lower())
        texto = "".join(c for c in texto if not unicodedata.combining(c))
        for palabra in re.findall(r"\w+", texto):
            p = f"#{palabra}#"
            for j in range(len(p) - 2):
                vectores[i, int(hashlib.md5(p[j:j + 3].encode()).hexdigest()[:8], 16) % 512] += 1
    vectores /= np.linalg.norm(vectores, axis=1, keepdims=True) + 1e-9
    return vectores.tolist()


# 2. Ingesta: un fragmento por sección de Markdown, con su ruta de encabezados.
def trocear(ruta: pathlib.Path) -> list[dict]:
    fragmentos, titulos, buffer = [], [], []

    def cerrar():
        texto = " ".join(buffer).strip()
        if texto:
            fragmentos.append({
                "id": f"{ruta.name}#{len(fragmentos) + 1}",
                "fuente": ruta.name,
                "seccion": " > ".join(titulos),
                "texto": texto,
            })
        buffer.clear()

    for linea in ruta.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^(#{1,6})\s+(.*)", linea)
        if m:
            cerrar()
            titulos[:] = titulos[: len(m.group(1)) - 1] + [m.group(2).strip()]
        elif linea.strip():
            buffer.append(linea.strip())
    cerrar()
    return fragmentos


def indexar(carpeta: str, destino: str = "indice.npz") -> None:
    fragmentos = [f for ruta in sorted(pathlib.Path(carpeta).glob("*.md")) for f in trocear(ruta)]
    # se vectoriza la sección + el texto: el título aporta contexto al fragmento
    vectores = np.array(embed([f"{f['seccion']}\n{f['texto']}" for f in fragmentos]), dtype=np.float32)
    np.savez(destino, vectores=vectores, fragmentos=json.dumps(fragmentos, ensure_ascii=False))


# 3. Búsqueda: similitud coseno (los vectores ya están normalizados).
def buscar(pregunta: str, k: int = 3, indice: str = "indice.npz") -> list[dict]:
    datos = np.load(indice)
    fragmentos = json.loads(str(datos["fragmentos"]))
    q = np.array(embed([pregunta])[0], dtype=np.float32)
    sims = datos["vectores"] @ q
    return [dict(fragmentos[i], score=round(float(sims[i]), 3)) for i in np.argsort(-sims)[:k]]


# 4. Prompt con fuentes y respuesta con citas comprobadas.
SISTEMA = (
    "Respondes preguntas sobre la documentación interna. Usa solo la información de las <fuente>. "
    "Cita cada afirmación con el id de su fuente entre corchetes, por ejemplo [vacaciones.md#2]. "
    "Si las fuentes no contienen la respuesta, contesta exactamente: No lo encuentro en la documentación."
)


def responder(pregunta: str, k: int = 3) -> dict:
    fuentes = buscar(pregunta, k)
    contexto = "\n".join(
        f'<fuente id="{f["id"]}" seccion="{f["seccion"]}">\n{f["texto"]}\n</fuente>' for f in fuentes)
    resp = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SISTEMA,
        messages=[{"role": "user", "content": f"{contexto}\n\nPregunta: {pregunta}"}],
    )
    if resp.stop_reason not in ("end_turn", "stop_sequence"):
        raise RuntimeError(f"Respuesta incompleta: stop_reason={resp.stop_reason}")
    texto = "".join(b.text for b in resp.content if b.type == "text")
    citadas = set(re.findall(r"\[([\w.-]+#\d+)\]", texto))
    enviadas = {f["id"] for f in fuentes}
    return {
        "respuesta": texto,
        "fuentes": sorted(citadas & enviadas),
        "citas_inventadas": sorted(citadas - enviadas),   # deberían estar vacías
    }


if __name__ == "__main__":
    indexar("docs")
    for f in buscar("¿Con cuánta antelación pido las vacaciones?"):
        print(f["score"], f["id"], f["seccion"])
    print(responder("¿Con cuánta antelación pido las vacaciones?"))
```

Para pasar a un modelo real cambia solo el cuerpo de `embed()`. Con Ollama y su cliente de Python (`pip install ollama`, modelo descargado con `ollama pull bge-m3`):

```python title="embed_ollama.py"
import ollama

def embed(textos: list[str]) -> list[list[float]]:
    return ollama.embed(model="bge-m3", input=textos).embeddings
```

Si cambias de modelo de embeddings, **vuelve a indexar todo**: vectores de modelos distintos no son comparables ([[cursos/rag-a-fondo/08-mantener-el-indice]]). Y si tu modelo no devuelve vectores normalizados, normalízalos al guardar y al consultar.

## Cómo comprobar que funciona

Con los tres documentos de ejemplo (vacaciones, teletrabajo y soporte) y el simulador de la API en lugar de la llamada real, la búsqueda devuelve esto:

```text
0.492 vacaciones.md#2 Política de vacaciones 2026 > Solicitud
0.385 vacaciones.md#1 Política de vacaciones 2026 > Días disponibles
0.366 soporte.md#1 Soporte técnico interno
{'respuesta': 'Debes pedirlas con al menos 15 días de antelación en el portal de RRHH [vacaciones.md#2]. Tu responsable tiene 5 días laborables para aprobarlas [vacaciones.md#2].', 'fuentes': ['vacaciones.md#2'], 'citas_inventadas': []}
```

La respuesta es la que devolvió el simulador; la búsqueda y la comprobación de citas son reales. Fíjate en que los *scores* están lejos de 1 y muy juntos: con el embed de juguete, «soporte» puntúa casi como «días disponibles». Con un modelo real la separación es mayor, pero no uses esos números como probabilidades ([[cursos/rag-a-fondo/09-cuando-el-rag-vectorial-no-basta]]).

Tres pruebas que debe pasar antes de enseñárselo a nadie:

- Una pregunta cuya respuesta está en un documento: cita el fragmento correcto y `citas_inventadas` sale vacía.
- Una pregunta sin respuesta en el corpus («¿cuánto cuesta el parking?»): contesta «No lo encuentro en la documentación.».
- Una pregunta con las palabras del usuario, no las del documento («¿puedo currar desde casa el primer mes?»). Si falla, el problema está en la búsqueda, no en el modelo.

Apunta esas preguntas con su fragmento correcto: son el principio de tu conjunto de evaluación ([[cursos/rag-a-fondo/10-evaluar-un-rag]]).

## La misma idea con frameworks

LangChain y LlamaIndex (los dos con licencia MIT) te dan el almacén de vectores, el adaptador de embeddings y el *retriever* hechos. Por debajo hacen lo mismo que el código anterior. Los dos ejemplos reutilizan `trocear` y `embed` de `rag_minimo.py` (y LangChain, también `SISTEMA`) para que compares solo lo que cambia.

```python tab="LangChain" title="rag_langchain.py"
from langchain.chat_models import init_chat_model
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_core.vectorstores import InMemoryVectorStore

from rag_minimo import SISTEMA, embed, trocear   # reutiliza la ingesta y el embed de juguete
import pathlib

MODEL = "anthropic:claude-sonnet-5-5"


class EmbedJuguete(Embeddings):
    """Adapta embed() a la interfaz de LangChain. En producción:
    from langchain_ollama import OllamaEmbeddings; OllamaEmbeddings(model="bge-m3")."""
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return embed(texts)

    def embed_query(self, text: str) -> list[float]:
        return embed([text])[0]


def crear_indice(carpeta: str) -> InMemoryVectorStore:
    docs = [
        Document(page_content=f"{f['seccion']}\n{f['texto']}", id=f["id"],
                 metadata={"fuente": f["fuente"], "seccion": f["seccion"]})
        for ruta in sorted(pathlib.Path(carpeta).glob("*.md")) for f in trocear(ruta)
    ]
    return InMemoryVectorStore.from_documents(docs, EmbedJuguete())


def responder(indice: InMemoryVectorStore, pregunta: str, llm=None) -> str:
    llm = llm or init_chat_model(MODEL, max_tokens=1024)
    docs = indice.similarity_search(pregunta, k=3)
    contexto = "\n".join(f'<fuente id="{d.id}">\n{d.page_content}\n</fuente>' for d in docs)
    msg = llm.invoke([("system", SISTEMA), ("user", f"{contexto}\n\nPregunta: {pregunta}")])
    return msg.text
```

```python tab="LlamaIndex" title="rag_llamaindex.py"
import pathlib

from llama_index.core import VectorStoreIndex
from llama_index.core.embeddings import BaseEmbedding
from llama_index.core.schema import TextNode

from rag_minimo import embed, trocear   # reutiliza la ingesta y el embed de juguete


class EmbedJuguete(BaseEmbedding):
    """Adapta embed() a LlamaIndex. En producción, un paquete de integración
    (p. ej. llama-index-embeddings-ollama con model_name="bge-m3")."""
    def _get_text_embedding(self, text: str) -> list[float]:
        return embed([text])[0]

    def _get_query_embedding(self, query: str) -> list[float]:
        return embed([query])[0]

    async def _aget_query_embedding(self, query: str) -> list[float]:
        return self._get_query_embedding(query)


def crear_indice(carpeta: str) -> VectorStoreIndex:
    nodos = [
        TextNode(id_=f["id"], text=f"{f['seccion']}\n{f['texto']}",
                 metadata={"fuente": f["fuente"], "seccion": f["seccion"]})
        for ruta in sorted(pathlib.Path(carpeta).glob("*.md")) for f in trocear(ruta)
    ]
    return VectorStoreIndex(nodos, embed_model=EmbedJuguete())


def recuperar(indice: VectorStoreIndex, pregunta: str, k: int = 3) -> list[dict]:
    resultados = indice.as_retriever(similarity_top_k=k).retrieve(pregunta)
    return [{"id": r.node.node_id, "texto": r.node.get_content(), "score": round(r.score, 3)}
            for r in resultados]
```

Ejecutados con la pregunta «¿Puedo teletrabajar el primer mes?» (en LangChain, con `GenericFakeChatModel` en lugar del modelo real), los dos recuperan el mismo fragmento primero:

```text
LangChain   0.612 teletrabajo.md#1 · 0.455 teletrabajo.md#2
            No, durante los tres primeros meses el trabajo es presencial [teletrabajo.md#1].
LlamaIndex  0.64  teletrabajo.md#1 · 0.457 teletrabajo.md#2
```

Qué esconde cada uno:

- **LangChain** (`langchain-core`): `InMemoryVectorStore` es la matriz de numpy con otra interfaz; en producción lo cambias por pgvector, Qdrant o Chroma sin tocar el resto. `init_chat_model` necesita `langchain-anthropic` y conviene pasarle siempre `max_tokens`. La comprobación de citas sigue siendo cosa tuya.
- **LlamaIndex** (`llama-index-core`): `VectorStoreIndex` agrupa almacén y *retriever*; `as_query_engine()` añade la generación si instalas la integración del modelo (`llama-index-llms-anthropic`). Aquí se muestra solo la recuperación, que es donde aporta: la generación con citas comprobadas es la misma función `responder` del paso 5.

Más contexto en [[herramientas/langchain]] y [[herramientas/llamaindex]].

## Variaciones

- **Base vectorial de verdad** cuando pases de unas decenas de miles de fragmentos o necesites filtros y concurrencia: [[recetas/rag-local-con-pgvector]], [[herramientas/qdrant]] o [[herramientas/lancedb]] si la quieres embebida.
- **Búsqueda híbrida** si fallan las preguntas con códigos o nombres exactos: [[recetas/busqueda-hibrida-con-bm25]] y [[recetas/fusionar-rankings-con-rrf]].
- **Fragmentos pequeños y respuesta con la sección completa**: [[recetas/chunks-padre-hijo]].
- **Todo en local**, modelo generador incluido: [[cursos/agentes-con-modelos-abiertos/05-rag-cien-por-cien-local]].

## Errores típicos

- **Saltarse la comprobación de citas.** Un id inventado parece una cita válida hasta que alguien hace clic.
- **Vectorizar el documento entero.** Un vector por PDF mezcla temas y no encuentra nada concreto.
- **Usar modelos distintos para documentos y consultas.** Los vectores no son comparables aunque tengan la misma dimensión.
- **Recuperar 20 fragmentos «por si acaso».** Más contexto no es mejor respuesta: sube el coste y el dato clave se pierde en medio ([[glosario/lost-in-the-middle]]).
- **Culpar al modelo antes de mirar la búsqueda.** Si el fragmento correcto no llegó al prompt, ningún modelo lo arregla. Recorre [[recetas/depurar-un-rag]].
