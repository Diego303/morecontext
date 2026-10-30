---
titulo: Requisitos en EARS
descripcion: Escribe requisitos sin ambigüedad con los cinco patrones EARS, en español y en inglés, reconoce los malos y convierte cada requisito en un test con su ID.
creado: 2026-10-29
orden: 2
minutos: 30
tipo: practica
objetivos:
  - Redactar requisitos con los patrones ubicuo, por evento, por estado, no deseado y opcional.
  - Detectar y reescribir requisitos ambiguos, compuestos o no comprobables.
  - Asignar un ID a cada requisito y trazarlo a un test que lleva ese ID en el nombre.
requiere: ["[[roadmap/70-flujos-con-especificacion/01-de-improvisar-a-especificar]]"]
tags: [sdd, ears, requisitos, tests]
relacionados: ["[[glosario/ears]]", "[[biblioteca/ears]]", "[[plantillas/spec-con-ears]]", "[[recetas/criterios-de-aceptacion-ejecutables]]"]
---

Al terminar esta lección escribirás requisitos que un agente no puede malinterpretar y que se convierten casi solos en tests. Usarás EARS, una sintaxis de cinco patrones nacida en la ingeniería aeronáutica, y la aplicarás a una funcionalidad que seguirás en las lecciones 3 y 4: generar el *slug* (la parte legible de la URL) de un artículo.

## La idea

Un requisito en lenguaje libre falla de formas conocidas: es vago («rápido»), compuesto («valida y guarda»), pasivo («se debe comprobar», ¿quién?), o esconde la condición en mitad de la frase. Un agente de código lo leerá de una forma, tú de otra y el test de una tercera.

**[[glosario/ears|EARS]]** (*Easy Approach to Requirements Syntax*) limita la forma de cada frase a unos pocos patrones con palabras clave fijas. La propusieron Alistair Mavin, Philip Wilkinson, Adrian Harwood y Mark Novak en [*Easy Approach to Requirements Syntax (EARS)*](https://research.manchester.ac.uk/en/publications/easy-approach-to-requirements-syntax-ears/), presentado en la 17.ª IEEE International Requirements Engineering Conference (RE'09, Atlanta, 31 de agosto a 4 de septiembre de 2009, pp. 317–322). Mavin trabajaba entonces en requisitos en Rolls-Royce. Hoy es la notación que usa Kiro para los criterios de aceptación y la que verás en muchas plantillas de SDD. Tienes el comentario del paper en [[biblioteca/ears]].

Todas las frases comparten el mismo esqueleto: **condición opcional + sistema + «debe» + respuesta**.

## Los cinco patrones

| Patrón | Plantilla en español | Plantilla en inglés |
|---|---|---|
| Ubicuo | El `<sistema>` debe `<respuesta>`. | The `<system>` shall `<response>`. |
| Por evento | Cuando `<disparador>`, el `<sistema>` debe `<respuesta>`. | When `<trigger>`, the `<system>` shall `<response>`. |
| Por estado | Mientras `<estado>`, el `<sistema>` debe `<respuesta>`. | While `<state>`, the `<system>` shall `<response>`. |
| No deseado | Si `<condición no deseada>`, entonces el `<sistema>` debe `<respuesta>`. | If `<unwanted condition>`, then the `<system>` shall `<response>`. |
| Opcional | Donde `<característica incluida>`, el `<sistema>` debe `<respuesta>`. | Where `<feature is included>`, the `<system>` shall `<response>`. |

Y se pueden combinar (el patrón «complejo»): *Mientras `<estado>`, cuando `<disparador>`, el `<sistema>` debe `<respuesta>`*.

Qué patrón usar:

- **Ubicuo** para lo que se cumple siempre: invariantes, formatos.
- **Por evento** para reacciones a algo que ocurre: una petición, un clic, la llegada de un mensaje.
- **Por estado** para comportamiento que depende de una situación que dura: sesión iniciada, modo sin conexión, artículo publicado.
- **No deseado** para errores, entradas inválidas y fallos de dependencias. Es el patrón que más se olvida y el que más bugs evita.
- **Opcional** para lo que depende de una configuración o de un plan contratado.

## Un ejemplo completo

La funcionalidad: los artículos de un blog necesitan un slug. Así quedan los requisitos en `requirements.md`, cada uno con su ID:

```markdown title="requirements.md"
## Requisitos funcionales

- **FR-01** · El generador de slugs debe devolver solo minúsculas ASCII, dígitos y guiones, sin guiones al principio ni al final.
- **FR-02** · Cuando se publica un artículo sin slug, el sistema debe generar el slug a partir del título.
- **FR-03** · Si el slug generado ya existe, entonces el sistema debe añadir el sufijo `-2`, `-3`… hasta encontrar uno libre.
- **FR-04** · Si el título queda vacío tras normalizarlo, entonces el sistema debe rechazar la publicación con el error `TITULO_VACIO`.
- **FR-05** · Mientras un artículo esté publicado, el sistema debe conservar su slug aunque cambie el título.

## Requisitos no funcionales

- **NFR-01** · La regresión del proyecto (`pytest -q`) debe seguir pasando.
```

Fíjate en lo que fuerza el formato. FR-03 y FR-04 existen porque el patrón «no deseado» te obliga a preguntarte qué sale mal. FR-05 nace de preguntarse «¿y mientras…?»: sin él, un agente razonable regeneraría el slug al cambiar el título y rompería todos los enlaces publicados. Si mañana el blog permite URLs con fecha, añadirías un opcional: *Donde esté activada la fecha en la URL, el sistema debe anteponer `AAAA/MM/` al slug*.

## Buenos y malos

| Malo | Problema | Bueno |
|---|---|---|
| El sistema debe ser rápido. | No se puede medir | Cuando se pide el slug de un título de hasta 200 caracteres, el generador debe responder en menos de 5 ms. |
| Debe normalizar tildes, eñes, etc. | «etc.» deja el alcance abierto | El generador de slugs debe devolver solo minúsculas ASCII, dígitos y guiones. |
| El sistema debe validar el título y guardar el artículo. | Dos requisitos en uno: ¿y si uno pasa y otro no? | Dos frases, dos IDs. |
| Se debe comprobar que el slug no exista. | Pasivo: ¿quién?, ¿y qué pasa si existe? | Si el slug generado ya existe, entonces el sistema debe añadir el sufijo `-2`… |
| Normalmente el slug no cambia. | «Normalmente» no es una condición | Mientras un artículo esté publicado, el sistema debe conservar su slug aunque cambie el título. |
| El sistema debe gestionar los errores adecuadamente. | No dice qué error ni qué respuesta | Si el título queda vacío tras normalizarlo, entonces el sistema debe rechazar la publicación con el error `TITULO_VACIO`. |
| Usar `re.sub` para limpiar el título. | Es diseño, no requisito | Llévalo a `design.md`. |

Una prueba rápida: si dos personas leen el requisito y escriben tests distintos, está mal escrito.

## De requisito a test

Cada patrón EARS se lee como un test: la condición es la preparación, el disparador es la acción y la respuesta es la aserción. Pon el ID del requisito en el nombre del test y la trazabilidad sale gratis: `pytest -k fr03` ejecuta exactamente lo que demuestra FR-03. El código vive en `src/` y un `pyproject.toml` con `[tool.pytest.ini_options]` y `pythonpath = ["src"]` permite que los tests lo importen directamente.

```python title="src/slug.py"
import re
import unicodedata

class TituloVacio(ValueError):
    """FR-04: el título no deja ningún carácter válido."""

def slugificar(titulo: str) -> str:
    """FR-01: minúsculas ASCII, dígitos y guiones; sin guiones al principio ni al final."""
    sin_tildes = unicodedata.normalize("NFKD", titulo).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", sin_tildes.lower()).strip("-")
    if not slug:
        raise TituloVacio("TITULO_VACIO")
    return slug

def slug_libre(titulo: str, existentes: set[str]) -> str:
    """FR-03: si el slug ya existe, prueba -2, -3… hasta encontrar uno libre."""
    base = slugificar(titulo)
    slug, n = base, 2
    while slug in existentes:
        slug, n = f"{base}-{n}", n + 1
    return slug
```

```python title="tests/test_slug.py"
import pytest
from slug import TituloVacio, slug_libre, slugificar

def test_fr01_solo_minusculas_ascii_digitos_y_guiones():
    assert slugificar("¡Hola, Mundo! Año 2026") == "hola-mundo-ano-2026"

def test_fr03_slug_duplicado_recibe_sufijo():
    assert slug_libre("Hola mundo", {"hola-mundo", "hola-mundo-2"}) == "hola-mundo-3"

def test_fr04_titulo_vacio_tras_normalizar_se_rechaza():
    with pytest.raises(TituloVacio, match="TITULO_VACIO"):
        slugificar("¿¡!?")
```

```text
$ python3 -m pytest tests/test_slug.py -v
tests/test_slug.py::test_fr01_solo_minusculas_ascii_digitos_y_guiones PASSED
tests/test_slug.py::test_fr03_slug_duplicado_recibe_sufijo PASSED
tests/test_slug.py::test_fr04_titulo_vacio_tras_normalizar_se_rechaza PASSED
============================== 3 passed in 0.03s ===============================
```

FR-02 y FR-05 dependen del módulo de publicación y se prueban en la lección 4. La tabla de trazabilidad queda así:

| Requisito | Patrón | Test |
|---|---|---|
| FR-01 | Ubicuo | `test_fr01_…` |
| FR-02 | Por evento | `test_fr02_…` (lección 4) |
| FR-03 | No deseado | `test_fr03_…` |
| FR-04 | No deseado | `test_fr04_…` |
| FR-05 | Por estado | `test_fr05_…` (lección 4) |
| NFR-01 | Ubicuo | la regresión entera |

> [!consejo] Pide al agente los requisitos, no el código
> Un buen primer encargo es: «Lee `proposal.md` y el código relacionado y escribe `requirements.md` en EARS, con ID, cubriendo al menos un caso no deseado por cada evento. No escribas código». Corregir diez frases es mucho más barato que corregir un diff.

En el harness del autor, el validador comprueba esta trazabilidad de forma determinista: cada `FR` y `NFR` de `requirements.md` debe aparecer en algún criterio de `acceptance.yaml` y cada `FR` en alguna tarea de `tasks.md`. En la lección 3 escribirás un validador pequeño que hace la parte requisito → tarea, y en la 4, un `acceptance.yaml` en el que cada check dice qué requisitos cubre.

## Errores frecuentes

- Escribir solo el camino feliz: ningún «Si…, entonces…».
- Requisitos con dos verbos de respuesta unidos por «y».
- Meter decisiones de implementación en los requisitos.
- IDs que se renumeran al insertar uno nuevo: añade al final y no reutilices números.

## Ejercicio

> [!ejercicio] Reescribe cinco requisitos
> Coge cinco requisitos de un ticket o una spec real (tuya o de tu equipo). Reescríbelos en EARS con ID, añade al menos dos requisitos «no deseado» que faltaran y escribe el nombre del test que demostraría cada uno.
>
> **Está bien si**: cada frase usa exactamente un patrón (o una combinación explícita), ninguna contiene «etc.», «adecuadamente», «rápido» ni «normalmente», no hay dos respuestas en la misma frase y cada nombre de test empieza por el ID del requisito.

> [!ejercicio]- Pistas
> Para encontrar los «no deseado», recorre cada evento y pregúntate: ¿entrada vacía?, ¿duplicada?, ¿demasiado grande?, ¿la dependencia no responde?, ¿el usuario no tiene permiso?

## Resumen

- EARS (Mavin et al., RE'09) reduce cada requisito a condición + sistema + «debe» + respuesta.
- Cinco patrones: ubicuo, por evento, por estado, no deseado y opcional, combinables.
- El patrón «no deseado» es el que más bugs evita y el que más se olvida.
- Cada requisito lleva ID y su test lleva ese ID en el nombre.
- Si dos personas escribirían tests distintos para una frase, la frase está mal.

## Para seguir

- [[roadmap/70-flujos-con-especificacion/03-plan-y-tareas]]
- [[plantillas/spec-con-ears]]
- [[biblioteca/ears]]
- [[glosario/ears]]
