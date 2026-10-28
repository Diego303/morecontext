---
titulo: Trocear documentos con solapamiento
descripcion: Divide documentos largos en trozos de tamaño controlado que respetan frases y párrafos, con solapamiento entre trozos y posiciones para citar la fuente.
creado: 2026-08-20
nivel: inicial
minutos: 20
tema: rag
stack: [python]
tags: [rag, chunking, indexado]
relacionados: ["[[roadmap/30-contexto-y-rag/02-chunking]]", "[[glosario/chunking]]", "[[cursos/rag-a-fondo/02-indexar-bien]]", "[[recetas/busqueda-hibrida-con-bm25]]"]
---

## Problema

Vas a montar un [[glosario/rag|RAG]] sobre manuales, contratos o una wiki interna. Los documentos son largos y tienes que partirlos en trozos para indexarlos. Si cortas cada 1 000 caracteres a lo bruto, partes frases por la mitad y una respuesta queda repartida entre dos trozos que nunca se recuperan juntos.

Necesitas un troceado ([[glosario/chunking|chunking]]) que respete frases y párrafos, que repita un poco de texto entre trozos consecutivos para no perder lo que cae en la frontera y que guarde la posición de cada trozo en el original para poder citarlo.

## Ingredientes

- Python 3.10 o superior. Solo biblioteca estándar.
- Un documento en texto plano o Markdown (`doc.txt`).

## Pasos

1. **Decide el tamaño y el solape.** Se mide en caracteres porque es rápido y no depende de ningún servicio. Un punto de partida razonable: trozos de 1 000 a 2 000 caracteres y un solape del 10 % al 20 %. El tamaño ideal depende de tus documentos y tus preguntas: mídelo con tu eval de recuperación (paso 4).

2. **Divide en unidades que no se deben romper.** Frases y párrafos. Si una frase supera el máximo (una tabla aplanada, un listado sin puntos), se corta por palabras.

3. **Agrupa unidades hasta el máximo y solapa.** Cada trozo acumula frases mientras quepan. El siguiente empieza unas frases antes del final del anterior, hasta `solape` caracteres. Si no hay un inicio de frase en ese margen, empieza en un inicio de palabra.

```python title="trocear.py"
import re
from dataclasses import dataclass


@dataclass
class Trozo:
    doc_id: str
    indice: int
    inicio: int  # posición en el texto original: sirve para citar y para depurar
    fin: int
    texto: str


def _unidades(texto: str, max_chars: int) -> list[tuple[int, int]]:
    """Frases y párrafos como (inicio, fin). Parte por palabras las que no caben."""
    spans = []
    for m in re.finditer(r"\S.*?(?:[.!?](?=\s)|\n\s*\n|$)", texto, re.S):
        ini, fin = m.start(), m.end()
        while fin - ini > max_chars:
            corte = texto.rfind(" ", ini, ini + max_chars)
            if corte <= ini:  # una "palabra" más larga que max_chars
                corte = ini + max_chars
            spans.append((ini, corte))
            ini = corte
            while ini < fin and texto[ini].isspace():
                ini += 1
        if fin > ini:
            spans.append((ini, fin))
    return spans


def _inicio_solape(texto: str, unidades, i: int, j: int, ini: int, max_chars: int, solape: int) -> int:
    """Dónde empieza el trozo siguiente: hasta `solape` caracteres antes del final del actual,
    en un inicio de frase si se puede y, si no, en un inicio de palabra."""
    fin, sig_fin = unidades[j][1], unidades[j + 1][1]
    minimo = max(fin - solape, sig_fin - max_chars, ini + 1)  # que quepa la unidad siguiente
    if minimo >= fin:
        return unidades[j + 1][0]  # sin hueco para solapar
    for u_ini, _ in unidades[i + 1 : j + 1]:
        if minimo <= u_ini < fin:
            return u_ini  # inicio de frase
    espacio = texto.find(" ", minimo, fin)
    if espacio == -1:
        return unidades[j + 1][0]
    pos = espacio + 1
    while pos < fin and texto[pos].isspace():
        pos += 1
    return pos if pos < fin else unidades[j + 1][0]


def trocear(texto: str, doc_id: str, max_chars: int = 1500, solape: int = 200) -> list[Trozo]:
    if solape >= max_chars:
        raise ValueError("El solape debe ser menor que max_chars")
    unidades = _unidades(texto, max_chars)
    trozos: list[Trozo] = []
    i = 0
    ini = unidades[0][0] if unidades else 0
    while i < len(unidades):
        # acumula frases completas mientras quepan en max_chars
        j = i
        while j + 1 < len(unidades) and unidades[j + 1][1] - ini <= max_chars:
            j += 1
        fin = unidades[j][1]
        trozos.append(Trozo(doc_id, len(trozos), ini, fin, texto[ini:fin].strip()))
        if j + 1 == len(unidades):
            break
        ini = _inicio_solape(texto, unidades, i, j, ini, max_chars, solape)
        i = next(n for n in range(i, len(unidades)) if ini < unidades[n][1])
    return trozos


if __name__ == "__main__":
    import sys

    texto = open(sys.argv[1], encoding="utf-8").read()
    for t in trocear(texto, doc_id=sys.argv[1], max_chars=600, solape=120):
        print(f"[{t.indice}] {t.inicio}-{t.fin} ({len(t.texto)} car.) {t.texto[:60]!r}…")
```

Ejecútalo con `python trocear.py doc.txt`.

4. **Indexa cada trozo con sus metadatos.** Guarda `doc_id`, `indice`, `inicio` y `fin` junto al texto. Con las posiciones puedes enseñar al usuario el fragmento exacto, ampliar el contexto alrededor de un trozo recuperado o detectar duplicados al reindexar.

## Cómo comprobar que funciona

```text
# salida de ejemplo
[0] 0-579 (579 car.) 'El contrato entra en vigor el 1 de enero de 2026. Las partes…'…
[1] 466-1008 (542 car.) 'Las partes acuerdan revisar las tarifas cada doce meses. En…'…
[2] 951-1548 (597 car.) 'En caso de impago, el proveedor podrá suspender el servicio…'…
```

- **Solape visible.** El `inicio` de cada trozo es menor que el `fin` del anterior.
- **Nada se pierde.** Comprueba que cada carácter no blanco del documento cae en algún trozo:

```python title="comprobar.py"
from trocear import trocear

texto = open("doc.txt", encoding="utf-8").read()
trozos = trocear(texto, "doc", max_chars=600, solape=120)

cubierto = [False] * len(texto)
for t in trozos:
    assert len(t.texto) <= 600
    assert texto[t.inicio : t.fin].strip() == t.texto
    for p in range(t.inicio, t.fin):
        cubierto[p] = True
assert all(cubierto[p] or texto[p].isspace() for p in range(len(texto)))
print(f"{len(trozos)} trozos, todo cubierto")
```

- **Lo que de verdad importa:** escribe 20 preguntas con el trozo que debería responderlas y mide si aparece entre los primeros resultados de tu búsqueda. Cambia `max_chars` y `solape` y compara. Lo trata [[cursos/rag-a-fondo/04-evaluar-un-rag]].

## Variaciones

- **Por encabezados.** En Markdown, divide primero por secciones (`##`) y trocea cada sección por separado. Así ningún trozo mezcla dos temas.
- **Con contexto.** Antepón al texto indexado el título del documento y de la sección: «Contrato Acme 2026 > Penalizaciones > …». Ayuda a que el trozo se entienda solo. La idea completa es la [[glosario/recuperacion-contextual|recuperación contextual]] ([Anthropic, 2024](https://www.anthropic.com/news/contextual-retrieval)).
- **En tokens.** La relación entre caracteres y [[glosario/token|tokens]] cambia según el idioma y el tipo de texto. Si necesitas controlar tokens, calibra una vez con `client.messages.count_tokens(...)` sobre una muestra y ajusta `max_chars`.
- **Ventana ampliada.** Indexa trozos pequeños para que la búsqueda sea precisa, pero al responder pasa al modelo el trozo con sus vecinos (`indice - 1` e `indice + 1`).

## Errores típicos

- **Cortar por número fijo de caracteres** sin mirar frases. Las palabras partidas empeoran los [[glosario/embeddings|embeddings]] y la búsqueda por palabras clave.
- **Solape cero.** Una respuesta que cruza la frontera entre dos trozos no aparece completa en ninguno.
- **Solape enorme.** Con un 50 % indexas casi todo dos veces, pagas el doble de embeddings y los resultados se llenan de trozos repetidos.
- **Perder la procedencia.** Sin `doc_id` y posiciones no puedes citar ni depurar por qué se recuperó algo.
- **Trocear basura.** Cabeceras, pies de página y menús repetidos en cada página acaban en todos los trozos. Limpia antes de trocear ([[cursos/rag-a-fondo/02-indexar-bien]]).
- **Elegir el tamaño a ojo y no volver a mirarlo.** Mide con preguntas reales.
