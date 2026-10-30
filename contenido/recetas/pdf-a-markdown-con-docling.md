---
titulo: De PDF a Markdown con Docling
descripcion: Convierte PDF con tablas a Markdown con Docling, trocéalos por su estructura de títulos para un RAG y compara el resultado con PyMuPDF y su licencia AGPL.
creado: 2026-10-29
nivel: inicial
minutos: 25
tema: rag
stack: [Docling, Python]
tags: [rag, ingesta, pdf, docling, chunking, open-source]
relacionados: ["[[herramientas/docling]]", "[[docs/modelos-abiertos/06-ingesta-de-documentos]]", "[[cursos/rag-a-fondo/06-el-corpus-manda]]", "[[recetas/trocear-documentos]]", "[[glosario/chunking]]"]
---

## Problema

Tu [[glosario/rag|RAG]] indexa manuales y contratos en PDF. Extraes el texto con la librería de siempre y las tablas salen aplanadas: «Electrónica 15 días Tarjeta Ropa 30 días…». Ningún [[glosario/embeddings|embedding]] sabe que «15 días» es el plazo de la electrónica, y el modelo responde mal aunque el fragmento correcto llegue al contexto.

Necesitas convertir el PDF a un formato que conserve la estructura (títulos, párrafos y tablas con filas y columnas) y trocear siguiendo esa estructura, no cada N caracteres. [[herramientas/docling|Docling]] hace las dos cosas. Es un proyecto de la LF AI & Data con el código bajo licencia MIT; los modelos que descarga para analizar la maquetación tienen sus propias licencias.

## Ingredientes

- Python 3.10 o superior.
- `pip install docling` (probado con 2.145.0, del 29 de octubre de 2026). Instala PyTorch: cuenta con varios GB de disco.
- Acceso a Hugging Face la primera vez, para descargar los modelos de maquetación y tablas. En una máquina sin red, descárgalos antes con `docling-tools models download` y pásale la ruta (paso 2).
- Un PDF con alguna tabla.

> [!nota] Qué se ha ejecutado aquí
> Docling se instaló y se probó en un entorno aislado sin acceso a Hugging Face. La ruta PDF necesita sus modelos y falló al descargarlos (`httpx.ProxyError: 403`), así que su código está comprobado en la construcción de objetos, no en la conversión. La conversión y el troceado se ejecutaron con el mismo documento en HTML, que Docling procesa sin modelos y con el mismo `DoclingDocument` de salida. PyMuPDF sí se ejecutó sobre el PDF. Todas las salidas son reales.

## Pasos

1. **Convierte con la configuración por defecto.** `DocumentConverter` detecta el formato por la extensión y devuelve un `DoclingDocument`, una representación con títulos, párrafos, tablas e imágenes como objetos. De ahí exportas a Markdown:

```python nocheck title="convertir.py"
from docling.document_converter import DocumentConverter

resultado = DocumentConverter().convert("devoluciones.pdf")
print(resultado.document.export_to_markdown())
```

   Lo mismo desde la terminal: `docling devoluciones.pdf` deja un `.md` en la carpeta actual.

2. **Ajusta el *pipeline* del PDF.** Dos decisiones cambian la velocidad y la calidad: el OCR (solo hace falta en PDF escaneados) y la reconstrucción de tablas. `artifacts_path` apunta a los modelos descargados de antemano, para máquinas sin red:

```python nocheck title="convertir_pdf.py"
from pathlib import Path

from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption

opciones = PdfPipelineOptions(
    do_ocr=False,               # PDF con texto: sin OCR va más rápido. Escaneados: True
    do_table_structure=True,    # reconstruye filas y columnas de las tablas
    artifacts_path=Path.home() / ".cache" / "docling" / "models",  # modelos descargados antes
)
convertidor = DocumentConverter(
    format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=opciones)}
)

if __name__ == "__main__":
    doc = convertidor.convert("devoluciones.pdf").document
    Path("devoluciones.md").write_text(doc.export_to_markdown(), encoding="utf-8")
```

   En la CLI, las mismas opciones son `--no-ocr`, `--tables` y `--artifacts-path`.

3. **Trocea por estructura.** En lugar de cortar el Markdown cada N caracteres, recorre el `DoclingDocument` con un *chunker*. `HierarchicalChunker` crea un fragmento por bloque del documento y guarda en `meta.headings` la ruta de títulos donde estaba. Las tablas se serializan fila a fila como «fila, columna = valor», que es justo lo que necesita un embedding para entender una celda suelta.

```python nocheck title="trocear.py"
import sys

from docling.chunking import HierarchicalChunker
from docling.document_converter import DocumentConverter

doc = DocumentConverter().convert(sys.argv[1]).document
print(doc.export_to_markdown())
print("-" * 40)

for i, chunk in enumerate(HierarchicalChunker().chunk(doc)):
    titulos = " > ".join(chunk.meta.headings or [])
    print(f"[{i}] {titulos} :: {chunk.text[:70]!r}")
```

4. **Indexa el texto con su contexto.** `chunker.contextualize(chunk)` devuelve el texto del fragmento precedido de sus títulos. Indexa eso, no `chunk.text` a secas: «15 días» bajo «Condiciones de devolución > Plazos por categoría» se recupera mucho mejor. Es la misma idea que la [[glosario/recuperacion-contextual|recuperación contextual]], gratis porque la estructura ya está en el documento. Guarda `meta.headings` y la página como [[glosario/metadatos|metadatos]] para citar la fuente.

## Cómo comprobar que funciona

Ejecución real de `python trocear.py devoluciones.html` (el documento de prueba, en HTML):

```text
# Condiciones de devolución

Puedes devolver cualquier producto durante los 30 días siguientes a la entrega.

## Plazos por categoría

| Categoría    | Plazo     | Reembolso      |
|--------------|-----------|----------------|
| Electrónica  | 15 días   | Tarjeta        |
| Ropa         | 30 días   | Tarjeta o vale |
| Alimentación | No admite | -              |

## Cómo solicitarla

Entra en Mis pedidos, elige el pedido y pulsa Devolver. Recibirás una etiqueta de envío.
----------------------------------------
[0] Condiciones de devolución :: 'Puedes devolver cualquier producto durante los 30 días siguientes a la'
[1] Condiciones de devolución > Plazos por categoría :: 'Electrónica, Plazo = 15 días. Electrónica, Reembolso = Tarjeta. Ropa, '
[2] Condiciones de devolución > Cómo solicitarla :: 'Entra en Mis pedidos, elige el pedido y pulsa Devolver. Recibirás una '
```

Y `contextualize()` sobre el fragmento 1:

```text
Condiciones de devolución
Plazos por categoría
Electrónica, Plazo = 15 días. Electrónica, Reembolso = Tarjeta. Ropa, Plazo = 30 días. Ropa, Reembolso = Tarjeta o vale. Alimentación, Plazo = No admite. Alimentación, Reembolso = -
```

Con tus PDF, revisa tres cosas en el Markdown: que la tabla tiene una fila por línea y las mismas columnas que el original, que los títulos tienen el nivel correcto (`#`, `##`) y que el orden de lectura de las páginas a dos columnas tiene sentido. Después mide la recuperación con preguntas cuya respuesta está en una tabla ([[cursos/rag-a-fondo/10-evaluar-un-rag]]).

**Comparación con PyMuPDF.** El mismo documento en PDF, con `pymupdf.open("devoluciones.pdf").to_markdown()` (PyMuPDF 2.0, salida real):

```text
# **Condiciones de devolución** 

Puedes devolver cualquier producto durante los 30 días siguientes a la entrega. 

## **Plazos por categoría** 

**Categoría Plazo Reembolso** Electrónica 15 días Tarjeta Ropa 30 días Tarjeta o vale Alimentación No admite - 

## **Cómo solicitarla** 

Entra en Mis pedidos, elige el pedido y pulsa Devolver. Recibirás una etiqueta de envío.
```

Recupera bien títulos y párrafos, pero la tabla de este PDF no tiene líneas dibujadas (`find_tables()` no encuentra ninguna) y sale aplanada. Docling detecta las tablas con un modelo de maquetación en vez de con las líneas; compruébalo con tus documentos, porque el resultado depende de cómo se generó cada PDF.

## Variaciones

- **Troceado por tokens.** `HybridChunker` parte de la jerarquía y además divide los bloques que superan un máximo de tokens y une los vecinos pequeños (`merge_peers`), repitiendo la cabecera en las tablas largas. Necesita el *tokenizador* de tu modelo de embeddings (por defecto descarga uno de Hugging Face). En la CLI, la opción `--to chunks`. Criterios de tamaño en [[recetas/trocear-documentos]] y [[recetas/chunks-padre-hijo]].
- **PDF escaneados.** Activa `do_ocr=True`. Docling trae varios motores de OCR (`--ocr-engine` en la CLI); PyMuPDF usa Tesseract o RapidOCR si está instalado (en la prueba de arriba eligió RapidOCR).
- **Modelo de visión.** `docling --pipeline vlm --vlm-model granite_docling` convierte con GraniteDocling, un modelo de visión y lenguaje, en lugar del *pipeline* clásico.
- **Como servicio o herramienta.** Docling tiene un servidor (`docling-serve`) y un [[glosario/servidor-mcp|servidor MCP]] para que un agente convierta documentos por su cuenta.
- **Otros formatos.** El mismo `convert()` acepta DOCX, PPTX, XLSX, HTML e imágenes, y devuelve el mismo tipo de documento: el troceado no cambia.
- **Alternativas.** Unstructured (Apache-2.0), marker (código Apache-2.0, pesos con licencia OpenRAIL-M modificada con límite comercial) y MinerU (licencia propia basada en Apache 2.0 con condiciones). Comparativa en [[docs/modelos-abiertos/06-ingesta-de-documentos]].

## Errores típicos

- **Elegir PyMuPDF sin mirar la licencia.** PyMuPDF es **AGPL-3.0 o comercial**: si lo usas en un servicio accesible por red, la AGPL te obliga a publicar tu código. Para un *script* interno puede no importarte; para un producto, sí.
- **Indexar `chunk.text` sin los títulos.** Un fragmento de tabla sin su encabezado de sección pierde de qué habla.
- **Aplanar las tablas a texto** antes de trocear. Conviértelas a Markdown o a filas «columna = valor» y, si son grandes, trocéalas por filas repitiendo la cabecera.
- **OCR en todo.** Activarlo en PDF que ya tienen texto es más lento y puede introducir errores donde no los había.
- **Contar con la red en producción.** La primera conversión descarga modelos. En contenedores o máquinas aisladas, descárgalos en la imagen y usa `artifacts_path`.
- **No revisar el resultado.** Abre el Markdown de diez documentos representativos antes de indexar mil: los PDF a dos columnas, con notas al pie o con tablas partidas entre páginas son donde falla cualquier conversor ([[cursos/rag-a-fondo/06-el-corpus-manda]]).
