---
titulo: Reindexado incremental sin duplicados
descripcion: Mantén un índice de pgvector al día recalculando solo lo que cambió, con hashes, upsert por id estable, borrado de huérfanos y registro del modelo de embeddings.
creado: 2026-10-29
nivel: intermedio
minutos: 30
tema: rag
stack: ["Python", "PostgreSQL"]
tags: [rag, indexado, pgvector, embeddings]
relacionados: ["[[cursos/rag-a-fondo/08-mantener-el-indice]]", "[[herramientas/pgvector]]", "[[cursos/rag-a-fondo/02-indexar-bien]]", "[[recetas/rag-local-con-pgvector]]"]
---

## Problema

Tu RAG indexa una carpeta de documentos que cambia cada semana: se corrigen erratas, se reescriben secciones, se borran políticas antiguas. Reindexarlo todo en cada cambio es lento y paga embeddings que ya tenías. Y la alternativa ingenua (insertar lo nuevo sin más) deja **duplicados y fragmentos huérfanos**: la versión 2025 de una sección sigue en el índice junto a la 2026 y el modelo recibe las dos.

Necesitas una sincronización que, para cada documento, sepa qué secciones son nuevas, cuáles cambiaron, cuáles desaparecieron y cuáles siguen igual, y que se niegue a mezclar vectores de dos modelos de embeddings.

## Ingredientes

- PostgreSQL con la extensión pgvector ([[herramientas/pgvector]]).
- Python 3.10 o superior, `pip install "psycopg[binary]" pgvector numpy`.
- Una función `embed()`: la de juguete de [[recetas/rag-minimo-viable]] como `embed.py` para probar, o un modelo real ([[docs/modelos-abiertos/04-embeddings-y-rerankers]]).

## Pasos

1. **Tres tablas.** `indice_config` registra qué modelo y qué dimensión generaron los vectores. `documentos` guarda el hash de cada documento. `fragmentos` guarda, además del vector, el hash de su texto y el modelo que lo calculó. El `ON DELETE CASCADE` hace que borrar un documento borre sus fragmentos.

```sql title="esquema.sql"
CREATE EXTENSION IF NOT EXISTS vector;

-- qué modelo generó los vectores de este índice (una fila por índice)
CREATE TABLE IF NOT EXISTS indice_config (
  nombre            text PRIMARY KEY,
  modelo_embeddings text NOT NULL,
  dimension         int  NOT NULL,
  creado            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documentos (
  doc_id      text PRIMARY KEY,
  hash        text NOT NULL,                 -- hash del documento completo ya normalizado
  actualizado timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fragmentos (
  id                text PRIMARY KEY,         -- estable: documento + sección + posición
  doc_id            text NOT NULL REFERENCES documentos ON DELETE CASCADE,
  hash              text NOT NULL,            -- hash del texto del fragmento
  contenido         text NOT NULL,
  modelo_embeddings text NOT NULL,
  embedding         vector(512) NOT NULL      -- la dimensión de tu modelo
);
CREATE INDEX IF NOT EXISTS fragmentos_doc ON fragmentos (doc_id);
CREATE INDEX IF NOT EXISTS fragmentos_hash ON fragmentos (hash);
CREATE INDEX IF NOT EXISTS fragmentos_hnsw ON fragmentos USING hnsw (embedding vector_cosine_ops);
```

2. **Dos hashes y un id estable.** El hash del documento decide si hay que mirarlo (si no cambió, cero trabajo). El hash del fragmento decide si hay que recalcular su embedding. El **id** del fragmento sale del documento, la ruta de encabezados y la posición dentro de la sección, nunca del contenido: corregir una errata conserva el id (y las citas y el banco de evaluación que apuntan a él) y solo cambia el hash. Normaliza antes de calcular hashes, para que un salto de línea de más no cuente como cambio.

3. **El diff, en este orden.** Lee los `(id, hash)` actuales del documento; los fragmentos cuyo hash difiere son los cambiados. Antes de pagar embeddings, busca si ese texto exacto ya está vectorizado con el mismo modelo (una sección copiada o movida) y reutiliza el vector. Después, en una transacción: *upsert* del documento, *upsert* de los cambiados y borrado de los huérfanos (ids que estaban y ya no están).

4. **Documentos eliminados.** Al final de cada pasada, borra los documentos que ya no existen en la fuente. Protege el caso de una fuente vacía: un disco mal montado no debe vaciar el índice.

5. **El modelo de embeddings manda.** Si `MODELO_EMBEDDINGS` no coincide con el registrado, el script se para. Cambiar de modelo no es incremental: se reindexa todo en un índice nuevo y se cambia cuando esté completo ([[cursos/rag-a-fondo/08-mantener-el-indice]]).

```python title="reindexar.py"
import hashlib
import json
import re
import unicodedata

import numpy as np

from embed import embed      # tu modelo de embeddings; aquí, el de juguete

INDICE = "docs-rrhh"
MODELO_EMBEDDINGS = "juguete-trigramas-512@1"   # p. ej. "bge-m3@ollama"; cámbialo y el índice se rechaza
DIMENSION = 512


def sha(texto: str) -> str:
    return hashlib.sha256(texto.encode()).hexdigest()


def normalizar(md: str) -> str:
    """Lo que no cambia el significado no debe cambiar el hash: espacios, saltos, Unicode."""
    md = unicodedata.normalize("NFC", md).replace("\r\n", "\n")
    return re.sub(r"[ \t]+\n", "\n", re.sub(r"\n{3,}", "\n\n", md)).strip()


def trocear(doc_id: str, md: str) -> list[dict]:
    """Un fragmento por sección. El id depende de la ruta de encabezados, no del contenido."""
    fragmentos, ruta, buffer, vistos = [], [], [], {}

    def cerrar():
        texto = "\n".join(buffer).strip()
        if texto:
            clave = " > ".join(ruta)
            n = vistos[clave] = vistos.get(clave, 0) + 1
            contenido = f"{clave}\n\n{texto}" if clave else texto
            fragmentos.append({"id": sha(f"{doc_id}|{clave}|{n}")[:16], "hash": sha(contenido),
                               "contenido": contenido})
        buffer.clear()

    for linea in md.splitlines():
        m = re.match(r"^(#{1,6})\s+(.*)", linea)
        if m:
            cerrar()
            ruta[:] = ruta[: len(m.group(1)) - 1] + [m.group(2).strip()]
        else:
            buffer.append(linea)
    cerrar()
    return fragmentos


def comprobar_modelo(conn) -> None:
    fila = conn.execute("SELECT modelo_embeddings, dimension FROM indice_config WHERE nombre = %s",
                        (INDICE,)).fetchone()
    if fila is None:
        conn.execute("INSERT INTO indice_config (nombre, modelo_embeddings, dimension) VALUES (%s, %s, %s)",
                     (INDICE, MODELO_EMBEDDINGS, DIMENSION))
    elif fila != (MODELO_EMBEDDINGS, DIMENSION):
        raise RuntimeError(f"El índice se creó con {fila}; reindexa en un índice nuevo, no mezcles vectores")


def sincronizar(conn, doc_id: str, md: str) -> dict:
    md = normalizar(md)
    hash_doc = sha(md)
    fila = conn.execute("SELECT hash FROM documentos WHERE doc_id = %s", (doc_id,)).fetchone()
    if fila and fila[0] == hash_doc:
        return {"doc": doc_id, "estado": "sin cambios", "embeddings": 0, "borrados": 0}

    nuevos = trocear(doc_id, md)
    actuales = dict(conn.execute("SELECT id, hash FROM fragmentos WHERE doc_id = %s", (doc_id,)).fetchall())
    cambiados = [f for f in nuevos if actuales.get(f["id"]) != f["hash"]]

    # un texto idéntico ya vectorizado (movido o copiado) reutiliza su vector
    reutilizables = dict(conn.execute(
        "SELECT DISTINCT ON (hash) hash, embedding::text FROM fragmentos "
        "WHERE hash = ANY(%s) AND modelo_embeddings = %s",
        ([f["hash"] for f in cambiados], MODELO_EMBEDDINGS)).fetchall()) if cambiados else {}
    pendientes = [f for f in cambiados if f["hash"] not in reutilizables]
    vectores = dict(zip([f["hash"] for f in pendientes], embed([f["contenido"] for f in pendientes]))) \
        if pendientes else {}

    with conn.transaction():
        conn.execute("INSERT INTO documentos (doc_id, hash) VALUES (%s, %s) "
                     "ON CONFLICT (doc_id) DO UPDATE SET hash = EXCLUDED.hash, actualizado = now()",
                     (doc_id, hash_doc))
        for f in cambiados:
            v = vectores.get(f["hash"])
            vector = np.array(v, dtype=np.float32) if v is not None else \
                np.array(json.loads(reutilizables[f["hash"]]), dtype=np.float32)
            conn.execute(
                "INSERT INTO fragmentos (id, doc_id, hash, contenido, modelo_embeddings, embedding) "
                "VALUES (%s, %s, %s, %s, %s, %s) "
                "ON CONFLICT (id) DO UPDATE SET hash = EXCLUDED.hash, contenido = EXCLUDED.contenido, "
                "modelo_embeddings = EXCLUDED.modelo_embeddings, embedding = EXCLUDED.embedding",
                (f["id"], doc_id, f["hash"], f["contenido"], MODELO_EMBEDDINGS, vector))
        # huérfanos: secciones que ya no existen en la versión nueva
        borrados = conn.execute("DELETE FROM fragmentos WHERE doc_id = %s AND NOT (id = ANY(%s)) RETURNING id",
                                (doc_id, [f["id"] for f in nuevos])).fetchall()
    return {"doc": doc_id, "estado": "actualizado", "embeddings": len(pendientes),
            "reutilizados": len(cambiados) - len(pendientes), "borrados": len(borrados)}


def purgar_borrados(conn, doc_ids_vivos: list[str]) -> list[str]:
    """Documentos que ya no están en la fuente: fuera, con sus fragmentos (ON DELETE CASCADE)."""
    if not doc_ids_vivos:          # una carpeta vacía o mal montada no debe vaciar el índice
        raise RuntimeError("La fuente no tiene documentos: no purgo nada")
    filas = conn.execute("DELETE FROM documentos WHERE NOT (doc_id = ANY(%s)) RETURNING doc_id",
                         (doc_ids_vivos,)).fetchall()
    return [f[0] for f in filas]
```

Y el script que recorre la carpeta:

```python title="sincronizar_carpeta.py"
import pathlib

import psycopg
from pgvector.psycopg import register_vector

import reindexar

with psycopg.connect("postgresql://localhost/rag", autocommit=True) as conn:
    conn.execute(pathlib.Path("esquema.sql").read_text())
    register_vector(conn)                      # después de CREATE EXTENSION
    reindexar.comprobar_modelo(conn)
    vivos = []
    for ruta in sorted(pathlib.Path("docs").glob("**/*.md")):
        doc_id = ruta.relative_to("docs").as_posix()
        vivos.append(doc_id)
        print(reindexar.sincronizar(conn, doc_id, ruta.read_text(encoding="utf-8")))
    print("eliminados:", reindexar.purgar_borrados(conn, vivos))
```

## Cómo comprobar que funciona

Prueba la secuencia que rompe los indexadores ingenuos: indexar, repetir sin cambios, editar una sección y borrar otra, copiar el documento con otro nombre, añadir uno y purgar. Esta es la salida real del módulo `reindexar.py` contra PGlite (PostgreSQL 18.6 con pgvector 0.8.7) con una conexión de pruebas que imita la interfaz de psycopg; el script con psycopg no se ha ejecutado contra un servidor:

```text
{'doc': 'vacaciones', 'estado': 'actualizado', 'embeddings': 3, 'reutilizados': 0, 'borrados': 0}
{'doc': 'vacaciones', 'estado': 'sin cambios', 'embeddings': 0, 'borrados': 0}
{'doc': 'vacaciones', 'estado': 'actualizado', 'embeddings': 1, 'reutilizados': 0, 'borrados': 1}
{'doc': 'vacaciones-copia', 'estado': 'actualizado', 'embeddings': 0, 'reutilizados': 2, 'borrados': 0}
{'doc': 'soporte', 'estado': 'actualizado', 'embeddings': 1, 'reutilizados': 0, 'borrados': 0}
purgados: ['soporte']
[('vacaciones-copia', 2), ('vacaciones', 2)]
Error: El índice se creó con ('juguete-trigramas-512@1', 512); reindexa en un índice nuevo, no mezcles vectores
```

Línea a línea: tres secciones, tres embeddings. Repetir con espacios de más no hace nada. Cambiar «23 días» por «25 días» y quitar una sección recalcula un embedding y borra un huérfano. La copia reutiliza los dos vectores sin llamar al modelo. El documento que desaparece de la fuente se purga con sus fragmentos. Y un cambio de modelo se rechaza.

Dos comprobaciones para tu corpus: ejecuta la sincronización dos veces seguidas y la segunda debe decir «sin cambios» en todo; y `SELECT hash, count(*) FROM fragmentos GROUP BY hash HAVING count(*) > 1` te enseña duplicados exactos entre documentos (decide si los quieres: ocupan puestos del top-k).

## Variaciones

- **Qdrant.** El mismo diff con `upsert` por id (un UUID derivado del id estable) y `delete` con un filtro por `doc_id` e `id` fuera de la lista. El hash va en el *payload* ([[herramientas/qdrant]]).
- **Versionado en lugar de borrado.** Si necesitas responder «qué decía la política en enero», no borres: marca `valido_hasta` y filtra por fecha en la consulta ([[cursos/rag-a-fondo/08-mantener-el-indice]]).
- **Disparadores.** En lugar de recorrer la carpeta, sincroniza desde los eventos de la fuente (un *webhook* del gestor documental, una cola). El diff es el mismo.
- **Ids por contenido.** Si tus documentos no tienen estructura estable, el id puede salir del hash del texto. Ganas simplicidad y pierdes citas estables: cada edición es un borrado y una inserción.
- **Recuperación contextual.** Si antepones a cada fragmento un contexto generado con el documento completo, cualquier cambio del documento cambia ese contexto: guarda su hash aparte y decide si lo regeneras ([[glosario/recuperacion-contextual]]).

## Errores típicos

- **Ids por orden de lectura** (`doc#1`, `doc#2`). Insertar una sección al principio renumera todo y obliga a recalcularlo todo.
- **Insertar sin borrar huérfanos.** Las versiones viejas se quedan y compiten con las nuevas.
- **Hash sin normalizar.** Un cambio de espacios o de codificación dispara el reindexado completo.
- **Mezclar modelos.** Vectores de dos modelos en la misma columna dan similitudes sin sentido, aunque la dimensión coincida.
- **Purgar con la fuente vacía.** Un fallo de lectura se convierte en un índice borrado.
- **Olvidar las cachés.** Si cacheas resultados de búsqueda o respuestas, invalídalas cuando cambie un documento ([[cursos/rag-a-fondo/08-mantener-el-indice]]).
