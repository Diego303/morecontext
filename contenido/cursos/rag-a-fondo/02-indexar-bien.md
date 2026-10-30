---
titulo: "Indexar bien: limpieza, troceado y metadatos"
descripcion: Cómo convertir documentos reales en fragmentos limpios, con estructura, IDs estables y metadatos que sirven para filtrar, citar y reindexar.
creado: 2026-09-16
actualizado: 2026-10-29
orden: 2
minutos: 55
tipo: practica
objetivos:
  - Limpiar y deduplicar documentos antes de trocearlos.
  - Implementar un troceado por estructura que conserva la ruta de encabezados de cada fragmento.
  - Diseñar un esquema de metadatos que permita filtrar, citar y reindexar de forma incremental.
requiere: ["[[cursos/rag-a-fondo/01-anatomia-de-un-rag]]", "[[roadmap/30-contexto-y-rag/02-chunking]]"]
relacionados: ["[[glosario/chunking]]", "[[recetas/trocear-documentos]]", "[[glosario/vector-store]]", "[[sistemas/extraccion-documental]]"]
tags: [rag, chunking, metadatos, ingesta]
---

Al terminar tendrás un indexador que limpia documentos, los trocea siguiendo su estructura, da a cada fragmento un id que no cambia entre ejecuciones y guarda metadatos con los que luego podrás filtrar y citar. En el roadmap viste el [[roadmap/30-contexto-y-rag/02-chunking|troceado con solapamiento]]; aquí vas un paso más allá: el troceado empieza antes de cortar y termina después.

## La idea

La mayor parte de la calidad de un [[glosario/rag|RAG]] se gana o se pierde en la indexación, y es la etapa que menos se mira. Un fragmento bueno cumple tres condiciones:

1. **Se entiende solo.** Quien lo lea sin el resto del documento sabe de qué habla.
2. **Contiene una idea completa.** No corta una tabla, una lista de pasos o una definición por la mitad.
3. **Sabe de dónde viene.** Lleva fuente, sección, versión y fecha, para filtrar y para citar.

El orden de trabajo es: extraer texto con estructura, limpiar, deduplicar, trocear por estructura, enriquecer con metadatos y escribir en el índice solo lo que cambió.

```mermaid
flowchart LR
  E[Extraer con estructura] --> C[Limpiar]
  C --> D[Deduplicar]
  D --> T[Trocear por secciones]
  T --> M[Metadatos + id estable]
  M --> U[Upsert incremental]
```

## Extraer y limpiar

Extrae **conservando la estructura**: encabezados, listas y tablas. Si tu extractor de PDF devuelve texto plano sin saltos de sección, pierdes la información que necesitas para trocear bien. Convierte todo a un formato intermedio común; Markdown funciona bien porque mantiene encabezados y tablas de forma legible para el modelo. Para PDF hay conversores abiertos que lo hacen, como [[herramientas/docling|Docling]] (receta: [[recetas/pdf-a-markdown-con-docling]]); revisa la licencia antes de elegir otro (PyMuPDF, por ejemplo, es AGPL-3.0). Los casos difíciles (escaneados, OCR, tablas complejas) tienen lección propia: [[cursos/rag-a-fondo/06-el-corpus-manda]].

Limpia lo que no aporta y se repite:

- cabeceras y pies de página, números de página, avisos legales repetidos;
- menús, migas de pan y barras laterales de páginas web;
- guiones de partición de palabras al final de línea en PDF (`recupera-\nción`);
- espacios y caracteres invisibles (espacios de anchura cero, saltos raros).

Las tablas merecen trato aparte. Una tabla aplanada en una fila de números es irrecuperable. Mantenla en Markdown si es pequeña o conviértela a frases («Plan Pro: 20 usuarios, soporte 24 h») si la consulta típica pregunta por una celda.

> [!aviso] Mira el texto extraído
> Antes de tocar nada más, abre 20 documentos ya extraídos y léelos. Casi siempre aparece algo: columnas mezcladas, texto de imágenes que falta, páginas duplicadas. Es la revisión más rentable de todo el curso.

## Deduplicar

Los corpus reales repiten contenido: la misma página en dos URLs, versiones sucesivas de un manual, plantillas copiadas. Los duplicados ocupan posiciones en el ranking y desplazan resultados distintos. Para duplicados exactos basta un hash del texto normalizado. Para casi duplicados (versiones) decide una política: indexar solo la vigente, o indexar todas con metadato `version` y filtrar en la consulta.

## Trocear por estructura

El troceado por número fijo de tokens es una base razonable. Mejora mucho si primero cortas por secciones y solo subdivides las que son demasiado largas. Además, cada fragmento hereda la **ruta de encabezados** («Facturación > Reembolsos > Plazos»), que le da contexto aunque el párrafo no repita el tema.

```python title="indexador.py"
import hashlib, re, unicodedata
from dataclasses import dataclass, field

MAX_PALABRAS = 300      # aproximación barata a tokens; ajusta con tu tokenizador
SOLAPE = 40

@dataclass
class Fragmento:
    id: str
    texto: str
    metadatos: dict = field(default_factory=dict)

def limpiar(md: str) -> str:
    md = unicodedata.normalize("NFC", md)
    md = re.sub(r"[​‌‍﻿]", "", md)       # caracteres invisibles
    md = re.sub(r"(\w)-\n(\w)", r"\1\2", md)                   # guiones de partición
    md = re.sub(r"^\s*Página \d+( de \d+)?\s*$", "", md, flags=re.M)
    return re.sub(r"\n{3,}", "\n\n", md).strip()

def secciones(md: str):
    """Devuelve (ruta_de_encabezados, texto) por cada sección del Markdown."""
    ruta, buffer = [], []
    for linea in md.splitlines():
        m = re.match(r"^(#{1,6})\s+(.*)", linea)
        if m:
            if buffer:
                yield list(ruta), "\n".join(buffer).strip()
                buffer = []
            nivel = len(m.group(1))
            ruta = ruta[: nivel - 1] + [m.group(2).strip()]
        else:
            buffer.append(linea)
    if buffer:
        yield list(ruta), "\n".join(buffer).strip()

def partir(texto: str):
    palabras = texto.split()
    if len(palabras) <= MAX_PALABRAS:
        yield texto
        return
    paso = MAX_PALABRAS - SOLAPE
    for i in range(0, len(palabras), paso):
        yield " ".join(palabras[i : i + MAX_PALABRAS])
        if i + MAX_PALABRAS >= len(palabras):
            break

def id_estable(doc_id: str, ruta: list[str], n: int) -> str:
    clave = f"{doc_id}|{' > '.join(ruta)}|{n}"
    return hashlib.sha1(clave.encode()).hexdigest()[:16]

def trocear(doc_id: str, md: str, meta_doc: dict) -> list[Fragmento]:
    fragmentos = []
    for ruta, texto in secciones(limpiar(md)):
        if not texto:
            continue
        for n, trozo in enumerate(partir(texto)):
            cabecera = " > ".join(ruta)
            fragmentos.append(Fragmento(
                id=id_estable(doc_id, ruta, n),
                texto=f"{cabecera}\n\n{trozo}" if cabecera else trozo,
                metadatos={**meta_doc, "doc_id": doc_id, "seccion": cabecera,
                           "hash": hashlib.sha1(trozo.encode()).hexdigest()},
            ))
    return fragmentos
```

Dos decisiones del código merecen explicación. La ruta de encabezados se **antepone al texto** que se indexa: así la búsqueda léxica y la vectorial la ven. Y el id se calcula a partir del documento, la sección y la posición, no del contenido: si corriges una errata, el fragmento conserva su id y el hash te dice que hay que reindexarlo.

## Metadatos que pagan su coste

Cada campo de metadatos debe servir para algo concreto. Estos son los que suelen merecer la pena:

| Campo | Para qué sirve |
|---|---|
| `doc_id`, `seccion`, `url` | citar con precisión y enlazar al original |
| `actualizado` | filtrar lo obsoleto y desempatar entre versiones |
| `version` / `producto` | filtrar por lo que el usuario tiene contratado |
| `idioma` | no mezclar resultados en dos idiomas |
| `tipo` (manual, FAQ, ticket) | ponderar fuentes con distinta fiabilidad |
| `acl` (grupos con acceso) | no devolver a un usuario lo que no puede ver |
| `hash` | saber si un fragmento cambió y hay que recalcular su embedding |

> [!peligro] Los permisos se filtran en la recuperación
> Si tus documentos tienen permisos distintos, filtra por `acl` en la consulta al índice. Pedirle al modelo que «no muestre lo confidencial» no es un control: el texto ya estaba en su contexto. Lo verás a fondo en [[cursos/rag-a-fondo/07-permisos-y-multi-tenant]] y en [[cursos/seguridad-y-prompt-injection/04-permisos-y-sandbox]].

## Reindexar de forma incremental

Recalcular todos los embeddings en cada cambio es lento y caro. Con IDs estables y hashes, la actualización es un *diff*:

```python title="sincronizar.py"
def sincronizar(indice, doc_id: str, md: str, meta_doc: dict):
    nuevos = {f.id: f for f in trocear(doc_id, md, meta_doc)}
    actuales = indice.hashes_de(doc_id)            # {id: hash} ya guardados
    a_escribir = [f for i, f in nuevos.items()
                  if actuales.get(i) != f.metadatos["hash"]]
    a_borrar = [i for i in actuales if i not in nuevos]
    if a_escribir:
        indice.upsert(a_escribir)                  # aquí se calculan los embeddings
    if a_borrar:
        indice.borrar(a_borrar)
    return len(a_escribir), len(a_borrar)
```

`indice` representa tu [[glosario/vector-store|vector store]]; casi todos ofrecen *upsert* por id y filtros por metadatos. Si cambias de modelo de embeddings o de estrategia de troceado, en cambio, reindexa todo y guarda el nombre de la configuración como metadato del índice: mezclar vectores de dos modelos distintos rompe la similitud. Cómo hacerlo sin cortar el servicio (doble índice, borrados, frescura) está en [[cursos/rag-a-fondo/08-mantener-el-indice]] y en la receta [[recetas/reindexado-incremental]].

## Errores frecuentes

- **Trocear el texto plano del PDF** sin estructura. La ruta de encabezados es el metadato más barato y útil que existe.
- **Fragmentos diminutos.** Una frase suelta se recupera bien y responde mal: le falta contexto.
- **IDs basados en el orden de lectura.** Insertar un párrafo al principio renumera todo y rompe citas y evaluaciones.
- **Metadatos que nadie usa.** Si un campo no filtra, no ordena ni se cita, sobra.

## Ejercicio

> [!ejercicio] Indexa tu corpus con estructura
> Pasa 20 documentos reales por `limpiar` y `trocear`. Revisa a mano 30 fragmentos al azar y anota cuántos cumplen las tres condiciones (se entiende solo, idea completa, sabe de dónde viene). Ajusta la limpieza o `MAX_PALABRAS` y repite.
>
> Está bien si al menos 25 de los 30 fragmentos cumplen las tres condiciones, si al ejecutar `sincronizar` dos veces seguidas la segunda escribe 0 fragmentos, y si corregir una errata en un documento reescribe solo el fragmento afectado.

> [!ejercicio]- Pistas
> Si muchos fragmentos fallan por «idea incompleta», suele ser una tabla o una lista partida: trátalas como bloques indivisibles en `partir`. Si fallan por «no se entiende solo», revisa que la ruta de encabezados se esté anteponiendo.

## Resumen

- La indexación decide lo que el RAG puede encontrar; revísala con tus ojos antes de medir.
- Extrae con estructura, limpia lo repetido y deduplica antes de trocear.
- Trocea por secciones y antepón la ruta de encabezados al texto.
- Usa IDs estables y hashes para reindexar solo lo que cambia.
- Filtra permisos en la consulta al índice, nunca en el prompt.

## Para seguir

- [[cursos/rag-a-fondo/03-recuperar-bien]]
- [[recetas/trocear-documentos]]
- [[recetas/chunks-padre-hijo]]
- [[glosario/chunking]]
