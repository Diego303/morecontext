---
titulo: Criterios de aceptación ejecutables
descripcion: Convierte «terminado» en comandos con código de salida, comprobaciones de archivos e inspecciones, con un runner mínimo de acceptance.yaml, evidencia fresca y una aceptación que nadie puede debilitar.
creado: 2026-10-29
orden: 4
minutos: 35
tipo: practica
objetivos:
  - Escribir un acceptance.yaml con checks command, file e inspection trazados a requisitos.
  - Ejecutar los checks con un runner que guarda la evidencia y sale con 0, 1 o 2.
  - Comprobar que la evidencia es posterior al último cambio del código.
  - Impedir que la aceptación aprobada se cambie o se debilite durante la construcción.
requiere: ["[[roadmap/70-flujos-con-especificacion/03-plan-y-tareas]]"]
tags: [sdd, aceptacion, verificacion, tests]
relacionados: ["[[glosario/aceptacion-ejecutable]]", "[[plantillas/criterios-de-aceptacion]]", "[[recetas/criterios-de-aceptacion-ejecutables]]", "[[recetas/congelar-la-spec-con-un-hash]]", "[[disciplinas/verificar-antes-de-dar-por-hecho]]"]
---

Al terminar esta lección «terminado» dejará de ser una opinión. Tendrás un `acceptance.yaml` con los criterios de la funcionalidad de slugs, un runner de unas ciento treinta líneas que lo ejecuta y guarda la evidencia, y dos protecciones: la evidencia caduca si el código cambia después, y la aceptación no se puede tocar una vez aprobada.

## La idea

Un criterio de aceptación es **[[glosario/aceptacion-ejecutable|ejecutable]]** cuando una máquina puede decidir si se cumple sin interpretar nada. Hay tres tipos útiles, los mismos que usa el harness del autor:

| `kind` | Qué comprueba | Cuándo usarlo |
|---|---|---|
| `command` | Un comando no interactivo y su código de salida | Casi siempre: tests del comportamiento, regresión, lint |
| `file` | Que un archivo existe (o no) y contiene (o no) un patrón | Artefactos, configuración, patrones prohibidos |
| `inspection` | Un procedimiento con resultado observable | Solo si no hay alternativa automática: textos, experiencia de uso |

Las reglas que hacen buena una aceptación (de la skill `acceptance-criteria` del harness del autor):

- **Trazabilidad**: cada check dice qué requisitos demuestra (`covers`) y cada requisito aparece en algún check.
- **Al menos un check obligatorio ejecutable**: con solo inspecciones, el PASS vuelve a ser opinión.
- **Un buen check falla hoy y pasa cuando la funcionalidad está hecha.** La excepción es la regresión, que debe pasar siempre.
- **Nada trivial**: `echo ok`, `true` o `exit 0` no demuestran nada, y comprobar que existe un archivo que se puede crear vacío tampoco, salvo que añadas `contains`.
- **Comandos seguros**: sin interacción, deterministas, sin red salvo necesidad real y sin leer secretos. Se ejecutarán sin más confirmación, así que una persona los lee antes de aprobar (lección 5).
- **`required: true` solo si su fallo debe impedir dar la tarea por terminada.**

## El archivo

```yaml title="spec/acceptance.yaml"
version: 1
feature_id: SLUG-001
checks:
  - id: AC-001
    title: La regresión del proyecto sigue pasando
    covers: [NFR-01]
    kind: command
    required: true
    command: python3 -m pytest -q
    timeout_seconds: 300
    expected_exit_code: 0
  - id: AC-002
    title: Tildes, signos y espacios se normalizan
    covers: [FR-01]
    kind: command
    required: true
    command: python3 -m pytest -q tests/test_slug.py -k fr01
  - id: AC-003
    title: Un slug repetido recibe sufijo
    covers: [FR-03]
    kind: command
    required: true
    command: python3 -m pytest -q tests/test_slug.py -k fr03
  - id: AC-004
    title: Un título vacío se rechaza con TITULO_VACIO
    covers: [FR-04]
    kind: command
    required: true
    command: python3 -m pytest -q tests/test_slug.py -k fr04
  - id: AC-005
    title: Publicar genera el slug y lo conserva
    covers: [FR-02, FR-05]
    kind: command
    required: true
    command: python3 -m pytest -q tests/test_articulos.py
  - id: AC-006
    title: El slug se calcula en un único sitio
    covers: [FR-02]
    kind: file
    required: true
    path: src/articulos.py
    expected: exists
    contains: "from slug import slug_libre"
    not_contains: "unicodedata"
  - id: AC-007
    title: El error de título vacío se entiende
    covers: [FR-04]
    kind: inspection
    required: false
    procedure: Publica un artículo con el título «¿¡!?» y lee el mensaje.
    expected: El mensaje dice que el título no tiene letras ni números y cómo corregirlo.
```

AC-006 convierte una decisión de `design.md` («el slug se calcula en un único sitio») en algo comprobable: `articulos.py` debe importar `slug_libre` y no debe normalizar por su cuenta. Con `pytest -k`, cada check ejecuta solo los tests que llevan el ID del requisito en el nombre (lección 2); si no existe ningún test con ese nombre, pytest sale con código 5 y el check falla, que es justo lo que quieres.

## Un runner mínimo

Necesita PyYAML (`pip install pyyaml`) y git. Hace cuatro cosas: se niega a ejecutar una aceptación distinta de la aprobada, valida el esquema, ejecuta cada check sin heredar variables con aspecto de secreto y guarda la evidencia con la huella del código.

```python title="aceptacion.py"
"""Runner mínimo de acceptance.yaml.

  python3 aceptacion.py congelar spec   # al aprobar: guarda la huella de la aceptación
  python3 aceptacion.py ejecutar spec   # ejecuta los checks y guarda la evidencia
  python3 aceptacion.py fresca spec     # ¿la evidencia es posterior al último cambio?
Salida: 0 pasan todos los obligatorios · 1 alguno falla · 2 bloqueo.
"""
import datetime
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import yaml  # pip install pyyaml

SECRETO = re.compile(r"TOKEN|SECRET|PASSW|API_?KEY|PRIVATE_?KEY|CREDENTIAL", re.I)
TRIVIAL = re.compile(r"^\s*(true|:|exit 0|echo\b[^|]*)\s*$")

def sha256(ruta: Path) -> str:
    return hashlib.sha256(ruta.read_bytes()).hexdigest()

def huella_del_arbol() -> str:
    """Huella de todos los archivos del proyecto que git no ignora (versionados o no)."""
    archivos = subprocess.run(["git", "ls-files", "-co", "--exclude-standard"],
                              capture_output=True, text=True, check=True).stdout.split()
    h = hashlib.sha256()
    for nombre in sorted(archivos):
        if Path(nombre).is_file():
            h.update(nombre.encode() + b"\0" + Path(nombre).read_bytes())
    return h.hexdigest()

def problemas_de_esquema(spec: dict) -> list[str]:
    errores, vistos = [], set()
    checks = spec.get("checks") or []
    if spec.get("version") != 1 or not checks:
        return ["se espera version: 1 y al menos un check"]
    for c in checks:
        cid = str(c.get("id"))
        if not re.fullmatch(r"AC-\d{3}", cid) or cid in vistos:
            errores.append(f"{cid}: id inválido o repetido")
        vistos.add(cid)
        if not c.get("covers"):
            errores.append(f"{cid}: sin covers (¿qué requisito demuestra?)")
        if c.get("kind") == "command" and TRIVIAL.match(str(c.get("command", ""))):
            errores.append(f"{cid}: comando trivial, no demuestra nada")
        if c.get("kind") not in ("command", "file", "inspection"):
            errores.append(f"{cid}: kind desconocido")
    if not any(c.get("required") and c.get("kind") in ("command", "file") for c in checks):
        errores.append("hace falta al menos un check obligatorio ejecutable")
    return errores

def ejecutar_comando(c: dict) -> dict:
    entorno = {k: v for k, v in os.environ.items() if not SECRETO.search(k)}  # sin secretos
    try:
        r = subprocess.run(["bash", "-c", "set -o pipefail\n" + c["command"]], cwd=c.get("cwd", "."),
                           env=entorno, stdin=subprocess.DEVNULL, capture_output=True, text=True,
                           timeout=c.get("timeout_seconds", 120))
    except subprocess.TimeoutExpired:
        return {"status": "fail", "reason": "timeout"}
    esperado = c.get("expected_exit_code", 0)
    if r.returncode == esperado:
        return {"status": "pass", "exit_code": r.returncode}
    estado = "blocked" if r.returncode in (126, 127) else "fail"  # 126/127: falta la herramienta
    return {"status": estado, "exit_code": r.returncode, "tail": (r.stdout + r.stderr)[-500:]}

def ejecutar_archivo(c: dict) -> dict:
    ruta = Path(c["path"])
    if c.get("expected") == "absent":
        return {"status": "fail" if ruta.exists() else "pass"}
    if not ruta.is_file():
        return {"status": "fail", "reason": "no existe"}
    texto = ruta.read_text(encoding="utf-8")
    if "contains" in c and not re.search(c["contains"], texto, re.M):
        return {"status": "fail", "reason": f"no contiene /{c['contains']}/"}
    if "not_contains" in c and re.search(c["not_contains"], texto, re.M):
        return {"status": "fail", "reason": f"contiene /{c['not_contains']}/"}
    return {"status": "pass"}

def main(orden: str, carpeta: Path) -> int:
    aceptacion, candado = carpeta / "acceptance.yaml", carpeta / "spec.lock.json"
    resultados_json = carpeta / "acceptance-results.json"
    if orden == "congelar":
        candado.write_text(json.dumps({"acceptance_sha256": sha256(aceptacion)}))
        print("Aceptación congelada:", sha256(aceptacion)[:12])
        return 0
    if orden == "fresca":
        previa = json.loads(resultados_json.read_text())
        if previa["arbol_sha256"] == huella_del_arbol():
            print(f"Evidencia fresca ({previa['run_at']})")
            return 0
        print("CADUCADA: hay cambios posteriores a la última ejecución; vuelve a ejecutar")
        return 1
    if not candado.exists() or json.loads(candado.read_text())["acceptance_sha256"] != sha256(aceptacion):
        print("BLOQUEADO: acceptance.yaml no es el que se aprobó")
        return 2
    spec = yaml.safe_load(aceptacion.read_text(encoding="utf-8"))
    errores = problemas_de_esquema(spec)
    if errores:
        print("BLOQUEADO:", *errores, sep="\n  ")
        return 2
    resultados = []
    for c in spec["checks"]:
        if c["kind"] == "command":
            r = ejecutar_comando(c)
        elif c["kind"] == "file":
            r = ejecutar_archivo(c)
        else:
            r = {"status": "manual", "reason": "inspección: la resuelve quien revisa, con evidencia"}
        resultados.append({"id": c["id"], "required": c["required"], "covers": c["covers"], **r})
        print(f"{r['status'].upper():7} {c['id']} {c['title']}")
    resultados_json.write_text(json.dumps({
        "feature_id": spec["feature_id"],
        "run_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "acceptance_sha256": sha256(aceptacion),
        "arbol_sha256": huella_del_arbol(),
        "results": resultados}, indent=2, ensure_ascii=False))
    obligatorios = [r for r in resultados if r["required"] and r["status"] != "manual"]
    if any(r["status"] == "blocked" for r in obligatorios):
        return 2
    return 1 if any(r["status"] != "pass" for r in obligatorios) else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1], Path(sys.argv[2] if len(sys.argv) > 2 else "spec")))
```

Los tres códigos de salida importan: **1** significa «el trabajo no está hecho» y **2** significa «no se ha podido comprobar» (falta una herramienta o la aceptación no es la aprobada). Confundirlos lleva a reparar código que no estaba roto. El `.gitignore` del proyecto excluye `__pycache__/`, `.pytest_cache/` y `spec/acceptance-results.json` para que la huella solo cambie cuando cambia el código.

## En rojo, en verde

Antes de construir, con la aceptación recién aprobada y solo los tests que ya tenía el proyecto:

```text
$ python3 aceptacion.py congelar spec
Aceptación congelada: 0c86f17e0ef3
$ python3 aceptacion.py ejecutar spec; echo "exit=$?"
PASS    AC-001 La regresión del proyecto sigue pasando
FAIL    AC-002 Tildes, signos y espacios se normalizan
FAIL    AC-003 Un slug repetido recibe sufijo
FAIL    AC-004 Un título vacío se rechaza con TITULO_VACIO
FAIL    AC-005 Publicar genera el slug y lo conserva
FAIL    AC-006 El slug se calcula en un único sitio
MANUAL  AC-007 El error de título vacío se entiende
exit=1
```

Es el resultado correcto: la regresión pasa y todo lo nuevo falla. Si algún check nuevo pasara ya, no demostraría nada. Después, el agente implementa `src/slug.py` (lección 2) y `src/articulos.py` con sus tests:

```python title="src/articulos.py"
from slug import slug_libre

def publicar(articulo: dict, existentes: set[str]) -> dict:
    """FR-02: genera el slug al publicar. FR-05: un artículo publicado conserva el suyo."""
    if articulo.get("publicado"):
        return articulo
    slug = articulo.get("slug") or slug_libre(articulo["titulo"], existentes)
    return {**articulo, "slug": slug, "publicado": True}
```

```python title="tests/test_articulos.py"
from articulos import publicar

def test_fr02_publicar_sin_slug_lo_genera():
    assert publicar({"titulo": "Mi primer post"}, set())["slug"] == "mi-primer-post"

def test_fr05_publicado_conserva_slug_si_cambia_el_titulo():
    art = publicar({"titulo": "Mi primer post"}, set())
    assert publicar({**art, "titulo": "Otro título"}, set())["slug"] == "mi-primer-post"
```

```text
$ python3 aceptacion.py ejecutar spec; echo "exit=$?"
PASS    AC-001 La regresión del proyecto sigue pasando
PASS    AC-002 Tildes, signos y espacios se normalizan
PASS    AC-003 Un slug repetido recibe sufijo
PASS    AC-004 Un título vacío se rechaza con TITULO_VACIO
PASS    AC-005 Publicar genera el slug y lo conserva
PASS    AC-006 El slug se calcula en un único sitio
MANUAL  AC-007 El error de título vacío se entiende
exit=0
```

AC-007 queda en `MANUAL`: quien revisa ejecuta el procedimiento y anota lo que vio. No impide el verde porque no es obligatorio.

## Evidencia fresca

«Lo ejecuté antes» no vale si después hubo un cambio. El runner guarda la huella de todos los archivos del proyecto junto a la evidencia, y `fresca` la compara con la actual:

```text
$ python3 aceptacion.py fresca spec
Evidencia fresca (2026-10-30T00:40:11+00:00)
$ echo "# cambio de última hora" >> src/slug.py
$ python3 aceptacion.py fresca spec; echo "exit=$?"
CADUCADA: hay cambios posteriores a la última ejecución; vuelve a ejecutar
exit=1
```

Ponlo como última comprobación antes de aceptar un «terminado» del agente, o en el hook de fin de sesión del harness ([[roadmap/90-harness/05-un-harness-minimo]]).

## Tests que no se debilitan

La forma más barata de poner un check en verde es cambiar el check. Un agente bajo presión lo hace sin malicia: «el test estaba mal». Dos defensas:

1. **La aceptación se congela al aprobarla.** `congelar` guarda su huella y `ejecutar` se niega si cambia. Si alguien rebaja un criterio, por ejemplo `-k fr03` por `-k "fr03 or not fr03"` (que pasa con cualquier test):

```text
$ python3 aceptacion.py ejecutar spec; echo "exit=$?"
BLOQUEADO: acceptance.yaml no es el que se aprobó
exit=2
```

2. **Los tests que demuestran requisitos no se editan durante la construcción** salvo que la tarea lo diga. Revisa el diff de `tests/` con lupa: un `assert` borrado, un `skip` nuevo o un `-k` más amplio son señales. Anthropic lo deja por escrito en su arnés para tareas largas: el agente solo puede marcar una funcionalidad como superada, nunca quitar ni editar sus pruebas ([*Effective harnesses for long-running agents*](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), noviembre de 2025).

Para cambiar una aceptación aprobada se vuelve a la puerta humana con una spec nueva. En el harness del autor la huella cubre los cinco archivos de la spec y la comprueban el motor de estado y el runner; lo tienes en [[cursos/harness-engineering/07-spec-congelada-y-aceptacion]] y en la receta [[recetas/congelar-la-spec-con-un-hash]].

> [!aviso] Los comandos de la aceptación se ejecutan tal cual
> Un `acceptance.yaml` es código que vas a ejecutar. Léelo antes de aprobarlo y desconfía de los que llaman a la red o ejecutan código en línea (`python -c`, `bash -c`, `curl … | sh`). Prefiere un test versionado del proyecto.

## Errores frecuentes

- Aceptación con solo inspecciones: el veredicto vuelve a ser una opinión.
- Checks que pasan antes de construir nada.
- Tratar un `blocked` (falta pytest, falta git) como un fallo del código.
- Dar por buena una ejecución anterior al último cambio.

## Ejercicio

> [!ejercicio] Tu acceptance.yaml en verde
> Para la funcionalidad de tu proyecto, escribe `acceptance.yaml` con al menos un `command` por requisito funcional, la regresión, un `file` y como mucho una `inspection`. Congélalo, ejecútalo antes de construir y guarda la salida en rojo. Después construye (tú o tu agente) y ejecútalo hasta el verde.
>
> **Está bien si**: antes de construir solo pasa la regresión, después salen todos los obligatorios en `PASS` con `exit=0`, `fresca` responde «Evidencia fresca» y cambiar una línea de la aceptación hace que el runner responda `BLOQUEADO`.

> [!ejercicio]- Pistas
> Si un requisito no admite un `command`, quizá está mal escrito: vuelve a la lección 2. Un `file` con `not_contains` es la forma más barata de prohibir un patrón (credenciales en claro, un `print` de depuración).

## Resumen

- Tres tipos de check: `command` (casi siempre), `file` y `inspection` (solo sin alternativa).
- Un buen check falla hoy y pasa al terminar; la regresión pasa siempre.
- El runner distingue fallo (1) de bloqueo (2) y guarda la evidencia con la huella del código.
- La evidencia caduca con cualquier cambio posterior.
- La aceptación aprobada se congela: cambiarla exige volver a aprobar.

## Para seguir

- [[roadmap/70-flujos-con-especificacion/05-una-sola-puerta-humana]]
- [[plantillas/criterios-de-aceptacion]]
- [[disciplinas/verificar-antes-de-dar-por-hecho]]
- [[recetas/un-verify-para-toda-la-regresion]]
