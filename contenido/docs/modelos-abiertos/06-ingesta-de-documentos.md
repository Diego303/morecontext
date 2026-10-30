---
titulo: Ingesta de documentos con herramientas abiertas
descripcion: Cómo convertir PDF, Office y escaneos a Markdown para un RAG con Docling, PyMuPDF, marker o MinerU, y cuál elegir según la licencia y el tipo de documento.
creado: 2026-10-29
orden: 6
nivel: intermedio
tags: [rag, ingesta, pdf, ocr, docling, pymupdf, modelos-abiertos]
relacionados: ["[[herramientas/docling]]", "[[cursos/rag-a-fondo/06-el-corpus-manda]]", "[[recetas/pdf-a-markdown-con-docling]]", "[[recetas/trocear-documentos]]"]
---

La **ingesta** es el paso que convierte tus documentos (PDF, Word, presentaciones, escaneos) en texto estructurado que puedas trocear e indexar. Es donde se pierde más calidad en un RAG sin que nadie lo note: una tabla aplanada, dos columnas mezcladas o un PDF escaneado que sale vacío no dan error, solo respuestas peores. Las herramientas abiertas actuales sacan Markdown con encabezados y tablas, y la decisión entre ellas depende sobre todo de **la licencia** y de **cómo son tus documentos**.

## Las opciones

| Herramienta | Versión (oct. 2026) | Licencia | Qué hace bien | Uso mínimo |
|---|---|---|---|---|
| [[herramientas/docling\|Docling]] (LF AI & Data) | 2.145.0 | Código MIT; cada modelo con su licencia | PDF con maquetación, orden de lectura, tablas y fórmulas; DOCX, PPTX, XLSX, HTML, imágenes; OCR; VLM GraniteDocling; servidor MCP y `docling-serve` | `DocumentConverter().convert(src).document.export_to_markdown()` |
| PyMuPDF | 2.0 (19 oct.) | **AGPL-3.0 o licencia comercial** | Rápido y sin modelos pesados: `to_markdown()`, `to_json()`, `find_tables()`, OCR con Tesseract | `pymupdf.open(p).to_markdown()` |
| marker | 2.1.0 | Código Apache-2.0; **pesos con OpenRAIL-M modificada** | PDF a Markdown o JSON con modelos; modo tabla y OCR | `marker_single archivo.pdf` |
| MinerU | 4.1.2 | **MinerU Open Source License** (Apache 2.0 con condiciones adicionales) | PDF complejos, tablas y fórmulas; biblioteca de documentos con localizadores por página y bloque | `mineru parse documento.pdf --json` |
| Unstructured | 0.27.35 | Apache-2.0 | Particionado multiformato | `partition(filename=…)` |

Versiones y licencias según PyPI y el README de cada proyecto a 29 de octubre de 2026.

## Licencias: lo primero que decides

- **PyMuPDF es AGPL-3.0.** Si ofreces tu servicio por red usando PyMuPDF, la AGPL te obliga a publicar el código de ese servicio, o a comprar la licencia comercial de Artifex. Para un script interno no suele importar; para un SaaS, sí.
- **Los pesos de marker** tienen una OpenRAIL-M modificada: según su README, gratis para investigación, uso personal y *startups* por debajo de 5 M$ de financiación o ingresos. Por encima, licencia comercial. El código es Apache-2.0, pero sin los pesos no convierte nada.
- **MinerU** añade condiciones a Apache 2.0: no la trates como Apache «a secas» y lee su `LICENSE.md`.
- **Docling** es MIT en el código y avisa de que los modelos que descarga tienen sus propias licencias. Revísalas si cambias de modelo (por ejemplo, al activar un VLM).

> [!aviso] «Open source» no siempre es «úsalo en tu producto»
> De las cuatro, solo el código de Docling y el de marker tienen licencias permisivas OSI sin más. Antes de meter una dependencia en la ingesta de un producto, pásala por quien lleve las licencias en tu empresa.

## PyMuPDF: el camino rápido

Desde la 2.0, PyMuPDF incluye el código que antes vivía en `pymupdf4llm` (que queda como paquete puente vacío). Para PDF con texto digital, es la opción con menos dependencias. Ejecutado con PyMuPDF 2.0 sobre un PDF generado con un título, un párrafo y una tabla de tres columnas:

```python nocheck title="pdf_a_markdown.py"
import pymupdf  # PyMuPDF 2.x: AGPL-3.0 o licencia comercial

doc = pymupdf.open("condiciones.pdf")
print(doc.to_markdown())                     # todo el documento en Markdown

for page in doc:
    for tabla in page.find_tables().tables:  # tablas detectadas por página
        print(tabla.to_markdown())
```

```text
=== Document parser messages ===
Warning: RapidOCR is missing. Install for much improved OCR results.
Using Tesseract for OCR processing.
# Condiciones de devolucion 

Tienes 30 dias desde la entrega para devolver un producto. 

|Producto|Plazo|Coste|
|---|---|---|
|Ropa|30 dias|Gratis|
|Electronica|15 dias|4,95 EUR|
```

La salida es real; se omite la tabla que imprime después el bucle, idéntica a la de arriba. (El bloque lleva `nocheck` porque PyMuPDF no está en el entorno común de comprobación; se ejecutó en otro entorno.) `to_markdown()` reconoce el título por el tamaño de letra y conserva la tabla con sus celdas. `find_tables()` devuelve además cada tabla por separado, útil para indexarla como un fragmento propio. El aviso del principio indica que, para OCR, PyMuPDF usa Tesseract si no encuentra RapidOCR: Tesseract y sus datos de idioma se instalan aparte (`apt install tesseract-ocr`) y la página escaneada se lee con `page.get_textpage_ocr(language=…)`.

## Docling: maquetación compleja y muchos formatos

Docling analiza la maquetación con modelos (orden de lectura, columnas, tablas, fórmulas) y exporta a Markdown, HTML, JSON sin pérdida o DocTags. Es más lento y pesado que PyMuPDF (descarga modelos y usa PyTorch), y a cambio aguanta mejor informes a dos columnas y tablas con celdas combinadas.

```python nocheck title="docling_minimo.py"
from docling.document_converter import DocumentConverter

converter = DocumentConverter()
result = converter.convert("informe.pdf")         # ruta local o URL
print(result.document.export_to_markdown())
```

```bash
pip install docling                                # Python 3.10 o superior
docling informe.pdf                                # escribe informe.md en el directorio actual
docling --pipeline vlm --vlm-model granite_docling informe.pdf   # con el VLM GraniteDocling
```

Este ejemplo sale del README de Docling 2.145; no se ha ejecutado aquí porque necesita descargar modelos de Hugging Face. Paso a paso, con el troceado por encabezados: [[recetas/pdf-a-markdown-con-docling]].

## Tablas y OCR

Las dos fuentes de error más caras:

- **Tablas.** Aplanadas a texto, una fila de «Electrónica | 15 días | 4,95 €» se convierte en una sopa de palabras que el embedding no relaciona. Exporta cada tabla como Markdown o HTML y guárdala como un fragmento entero, con el título de la sección en los [[glosario/metadatos|metadatos]]. Si es muy grande, trocéala por filas repitiendo la cabecera en cada trozo.
- **Escaneos.** Un PDF escaneado no tiene texto: la extracción devuelve vacío sin avisar. Detecta las páginas sin texto (o con muy pocos caracteres) y pásalas por OCR. Docling y PyMuPDF lo traen; configura el idioma español en el motor de OCR.

Comprueba siempre una muestra a mano: abre el PDF y el Markdown lado a lado en 10–20 documentos representativos. Es la única forma de ver columnas mezcladas, encabezados perdidos o pies de página repetidos en cada fragmento. Más en [[cursos/rag-a-fondo/06-el-corpus-manda]].

## Qué elegir

| Tus documentos | Primera opción | Por qué |
|---|---|---|
| PDF digitales sencillos, servicio interno | PyMuPDF | Rápido, sin modelos, buen Markdown; la AGPL no te afecta si no lo ofreces por red |
| PDF digitales en un producto SaaS | Docling | MIT; evita la AGPL |
| Informes a dos columnas, tablas complejas, fórmulas | Docling o MinerU | Modelos de maquetación; revisa la licencia de MinerU |
| Mezcla de PDF, Word, PowerPoint, Excel | Docling | Un solo conversor y un mismo formato de salida |
| Escaneos | Docling o PyMuPDF con OCR | Ambos integran OCR; prueba la calidad en español |
| Necesitas la mejor calidad en PDF difíciles y eres pequeño | marker | Dentro del umbral de su licencia de pesos |

## Errores frecuentes

| Error | Consecuencia | Arreglo |
|---|---|---|
| No mirar el Markdown resultante | Columnas mezcladas y tablas rotas en el índice | Revisión manual de una muestra |
| Tratar todos los PDF igual | Escaneos indexados vacíos | Detecta páginas sin texto y aplica OCR |
| Elegir por calidad sin mirar la licencia | AGPL o límite comercial descubiertos en producción | Licencia antes que benchmark |
| Trocear sin respetar encabezados | Fragmentos sin contexto | Trocea por secciones del Markdown: [[recetas/trocear-documentos]] |
| Reconvertir todo en cada cambio | Horas de proceso y duplicados | [[recetas/reindexado-incremental]] |

## Ver también

- [[docs/modelos-abiertos/04-embeddings-y-rerankers]]: el siguiente paso, vectorizar los fragmentos.
- [[sistemas/extraccion-documental]]: cuando quieres JSON validado, no Markdown.
- [[recetas/chunks-padre-hijo]]: buscar en pequeño y responder con la sección entera.
- [[plantillas/checklist-de-rag]]: lo que revisar antes de dar el índice por bueno.
