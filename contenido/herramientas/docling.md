---
titulo: Docling
descripcion: Convierte PDF, DOCX, PPTX, HTML e imágenes en Markdown o JSON estructurado, con maquetación, tablas, OCR y orden de lectura, listo para un RAG.
creado: 2026-10-29
tags: [ingesta, rag, pdf]
relacionados: ["[[recetas/pdf-a-markdown-con-docling]]", "[[docs/modelos-abiertos/06-ingesta-de-documentos]]", "[[cursos/rag-a-fondo/06-el-corpus-manda]]", "[[glosario/chunking]]"]
categoria: ingesta
licencia: MIT
open_source: true
lenguajes: [Python]
url: https://docling-project.github.io/docling/
repositorio: https://github.com/docling-project/docling
version: "2.145.0"
revisado: 2026-10-29
---

Docling es una biblioteca de Python (proyecto de LF AI & Data) que convierte documentos en una representación estructurada: títulos, párrafos en orden de lectura, tablas, fórmulas e imágenes. Lee PDF, DOCX, PPTX, HTML e imágenes, aplica OCR a los escaneados y exporta a Markdown, HTML o JSON. El **código es MIT**; los modelos que descarga (maquetación, tablas, el VLM GraniteDocling) tienen **cada uno su licencia**, que conviene revisar.

## Para qué sirve

- La fase de ingesta de un [[glosario/rag]]: sacar texto limpio y con jerarquía antes del [[glosario/chunking]].
- Conservar las tablas como tablas (Markdown o HTML por tabla) en vez de aplanarlas en texto sin estructura.
- Ofrecer conversión como servicio (`docling-serve`) o como herramienta para un agente (tiene servidor MCP).

## Cuándo usarla

Con PDF reales: columnas, cabeceras repetidas, tablas, escaneados. Es donde una extracción ingenua rompe el orden de lectura y el RAG empieza a fallar sin que lo notes ([[cursos/rag-a-fondo/06-el-corpus-manda]]).

## Cuándo no

- Con texto plano, Markdown o HTML sencillo: un lector simple basta y es mucho más rápido.
- En máquinas muy justas o lotes enormes sin GPU: los modelos de maquetación y OCR cuestan tiempo; mide antes con una muestra.
- Alternativas con trampas de licencia: PyMuPDF 2.0 (incluye `to_markdown()`) es **AGPL-3.0 o comercial**, y los pesos de marker usan una OpenRAIL-M modificada con límite comercial.

## Ejemplo mínimo

Del README del proyecto. No se ha ejecutado aquí: Docling no está en el entorno de comprobación de la web (por eso el bloque Python no se valida automáticamente) y la primera ejecución descarga modelos.

```bash
pip install docling                      # Python 3.10 o superior
docling https://arxiv.org/pdf/2206.01062 # CLI: convierte a Markdown en el directorio actual
docling --pipeline vlm --vlm-model granite_docling https://arxiv.org/pdf/2206.01062   # con el VLM
```

```python nocheck title="pdf_a_markdown.py"
from docling.document_converter import DocumentConverter

converter = DocumentConverter()
result = converter.convert("informe.pdf")       # ruta local o URL
markdown = result.document.export_to_markdown()
print(markdown[:500])
```

El paso siguiente es trocear ese Markdown por secciones ([[recetas/trocear-documentos]]) y guardar con cada fragmento su título y página como [[glosario/metadatos]] para citar.

> [!consejo] Revisa una muestra a mano
> Convierte diez documentos representativos y léelos antes de indexar miles. Los fallos de ingesta (tablas partidas, cabeceras repetidas, OCR con basura) no se ven en las métricas de recuperación hasta mucho después.

## Alternativas

- Unstructured (Apache-2.0): particionado multiformato.
- MinerU: PDF complejos; licencia propia basada en Apache 2.0 con condiciones adicionales.
- PyMuPDF y marker: ver las licencias arriba.

Comparativa en [[docs/modelos-abiertos/06-ingesta-de-documentos]]; paso a paso en [[recetas/pdf-a-markdown-con-docling]].

## Enlaces

- Documentación: [docling-project.github.io/docling](https://docling-project.github.io/docling/)
- Repositorio: [github.com/docling-project/docling](https://github.com/docling-project/docling)
- Servidor MCP: [docling-project.github.io/docling/usage/mcp](https://docling-project.github.io/docling/usage/mcp/)
