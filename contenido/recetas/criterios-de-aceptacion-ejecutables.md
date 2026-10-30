---
titulo: Criterios de aceptación ejecutables en YAML
descripcion: Escribe los criterios de aceptación de una tarea como checks de comando, archivo e inspección en un acceptance.yaml y ejecútalos con un runner que da PASS o FAIL con evidencia y timeout.
creado: 2026-10-29
nivel: intermedio
minutos: 30
tema: evals
stack: ["Python", "YAML"]
tags: [aceptacion, sdd, evals, harness, verificacion]
relacionados: ["[[plantillas/criterios-de-aceptacion]]", "[[roadmap/70-flujos-con-especificacion/04-aceptacion-ejecutable]]", "[[cursos/harness-engineering/07-spec-congelada-y-aceptacion]]", "[[glosario/aceptacion-ejecutable]]", "[[recetas/congelar-la-spec-con-un-hash]]"]
---

## Problema

Le pides a un agente una feature y te dice «hecho, todos los tests pasan». ¿Qué tests? ¿Los que escribió él para que pasaran? «Hecho» necesita una definición que no dependa de la opinión de quien lo hizo.

La [[glosario/aceptacion-ejecutable|aceptación ejecutable]] es esa definición: una lista de comprobaciones que se escribe **antes** de construir, la aprueba una persona y la ejecuta un programa. Cada check da `pass`, `fail` o `blocked` con evidencia. Lo que no se puede automatizar queda como inspección explícita, no como un «lo he revisado». Esta receta es la versión reducida del `run_acceptance.py` y la plantilla `acceptance.yaml` del harness del autor.

## Ingredientes

- Python 3.10 o superior (biblioteca estándar).
- Bash (los comandos se ejecutan con `bash` y `set -o pipefail`).
- Un proyecto con algo que comprobar. El ejemplo es una CLI mínima `src/saludo.py` con sus tests.

```python title="src/saludo.py"
import sys


def saludar(nombre: str) -> str:
    return f"Hola, {nombre}"


if __name__ == "__main__":
    if len(sys.argv) < 2 or not sys.argv[1]:
        print("uso: saludo.py NOMBRE (por ejemplo: saludo.py Ana)", file=sys.stderr)
        sys.exit(2)
    print(saludar(sys.argv[1]))
```

Añade un `tests/__init__.py` vacío y un `tests/test_saludo.py` con un test de `saludar("Ana")`: basta para que AC-001 tenga algo que ejecutar.

## Pasos

1. **Escribe los checks.** Tres tipos:
   - `command`: un comando no interactivo y su código de salida esperado. Es el más fuerte.
   - `file`: un archivo que debe existir (o no) y, opcionalmente, contener una regex.
   - `inspection`: un procedimiento y un resultado esperado que resuelve una persona o un revisor con evidencia escrita.

   Cada check tiene un `id` estable (`AC-NNN`), un título, si es obligatorio y qué requisito cubre (`covers`). Esa trazabilidad permite comprobar que ningún requisito se queda sin check ([[plantillas/spec-con-ears]]).

```yaml title="acceptance.yaml"
# Criterios de aceptación de SALUDO-001. Inmutables desde la aprobación.
version: 1
feature_id: SALUDO-001
checks:
  - id: AC-001
    title: La regresión del proyecto sigue pasando
    covers: [NFR-01]
    kind: command
    required: true
    command: python3 -m unittest discover -s tests -q
    cwd: .
    timeout_seconds: 120
    expected_exit_code: 0
  - id: AC-002
    title: El módulo expone saludar()
    covers: [FR-01]
    kind: file
    required: true
    path: src/saludo.py
    expected: exists
    contains: "def saludar\\("
  - id: AC-003
    title: La CLI rechaza un nombre vacío con exit 2
    covers: [FR-02]
    kind: command
    required: true
    command: python3 src/saludo.py ""
    expected_exit_code: 2
    timeout_seconds: 10
  - id: AC-004
    title: El mensaje de error dice cómo corregirlo
    covers: [FR-02]
    kind: inspection
    required: false
    procedure: Ejecuta la CLI sin nombre y lee el error.
    expected: El mensaje nombra el argumento y da un ejemplo.
```

2. **Prohíbe los checks que no verifican nada.** `command: true`, un `echo ok` o un `pytest || true` siempre pasan. El runner los rechaza antes de ejecutar nada, y exige al menos un check obligatorio ejecutable. Ojo con un detalle de YAML: `command: true` sin comillas es un booleano, no el comando `true`; valida el tipo.

3. **Escribe el runner.** Las decisiones que importan:
   - `set -o pipefail`: en `pytest | tee log`, sin él manda el código de `tee` y un fallo pasa por éxito.
   - Cada comando en su propio grupo de procesos (`start_new_session`) para que el timeout mate también a los hijos. Si no, un servidor que lanzaron tus tests sigue vivo.
   - `stdin` cerrado: un comando que pide algo por teclado falla en vez de colgarse.
   - Código 126 o 127 (no existe o no es ejecutable) es `blocked`, no `fail`: falta la herramienta, no falla la feature.
   - La evidencia guarda la cola de la salida y el SHA-256 del `acceptance.yaml` ejecutado, para saber qué versión de los criterios se comprobó.

   El harness del autor no depende de PyYAML: lleva su propio parser de un subconjunto de YAML para que funcione igual en cualquier máquina. Aquí va una versión mínima que entiende solo la forma de arriba.

```python title="aceptacion.py"
#!/usr/bin/env python3
"""Ejecuta los checks de un acceptance.yaml y guarda la evidencia.

Uso: python3 aceptacion.py acceptance.yaml [--salida resultados.json]
Exit: 0 pasan todos los obligatorios ejecutables · 1 alguno falla · 2 bloqueo (archivo inválido o herramienta ausente).
"""
import argparse
import hashlib
import json
import os
import re
import signal
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

TRIVIAL = re.compile(r"^\s*(true|:|exit\s+0|echo\b[^|;&]*)\s*$")
OCULTA_FALLO = re.compile(r"\|\|\s*(true|:|exit\s+0)\b|;\s*(true|exit\s+0)\s*$")


def valor(texto: str):
    texto = texto.strip()
    if texto.startswith("[") and texto.endswith("]"):
        return [valor(x) for x in texto[1:-1].split(",") if x.strip()]
    if texto[:1] == '"':
        return json.loads(texto)
    if texto[:1] == "'":
        return texto[1:-1].replace("''", "'")
    if re.fullmatch(r"-?\d+", texto):
        return int(texto)
    return {"true": True, "false": False}.get(texto, texto)


def cargar(ruta: Path) -> dict:
    """Subconjunto mínimo de YAML: claves de primer nivel y una lista `checks` de mapeos planos.
    Entrecomilla los valores que contengan ': ' o ' #'. Con PyYAML instalado, usa yaml.safe_load."""
    doc, actual = {"checks": []}, None
    for n, linea in enumerate(ruta.read_text(encoding="utf-8").splitlines(), 1):
        if not linea.strip() or linea.lstrip().startswith("#") or linea.strip() == "checks:":
            continue
        item = re.match(r"^\s*-\s+(\w+):\s*(.*)$", linea)
        campo = re.match(r"^(\s*)(\w+):\s*(.*)$", linea)
        if item:
            actual = {item[1]: valor(item[2])}
            doc["checks"].append(actual)
        elif campo and campo[1] and actual is not None:
            actual[campo[2]] = valor(campo[3])
        elif campo and not campo[1]:
            doc[campo[2]] = valor(campo[3])
        else:
            raise ValueError(f"línea {n}: no entiendo {linea.strip()!r}")
    return doc


def problemas(doc: dict) -> list[str]:
    errores, ids = [], set()
    for c in doc.get("checks") or []:
        cid = c.get("id", "?")
        if not re.fullmatch(r"AC-\d{3}", str(cid)) or cid in ids:
            errores.append(f"{cid}: id AC-NNN único")
        ids.add(cid)
        if not isinstance(c.get("required"), bool):
            errores.append(f"{cid}: required debe ser true o false")
        if c.get("kind") == "command":
            orden = c.get("command")
            if not isinstance(orden, str) or not orden.strip() or TRIVIAL.match(orden):  # «command: true» es un booleano
                errores.append(f"{cid}: command vacío o trivial: no verifica nada")
            elif OCULTA_FALLO.search(orden):
                errores.append(f"{cid}: el command oculta su código de salida")
        elif c.get("kind") == "file":
            if c.get("expected") not in ("exists", "absent") or str(c.get("path", "")).startswith(("/", "..")):
                errores.append(f"{cid}: file necesita path relativo y expected exists|absent")
        elif c.get("kind") == "inspection":
            if not c.get("procedure") or not c.get("expected"):
                errores.append(f"{cid}: inspection necesita procedure y expected")
        else:
            errores.append(f"{cid}: kind desconocido {c.get('kind')!r}")
    if not any(c.get("required") is True and c.get("kind") in ("command", "file") for c in doc.get("checks") or []):
        errores.append("hace falta al menos un check obligatorio ejecutable (command o file)")
    return errores


def cola(texto: str, n: int = 1500) -> str:
    return texto if len(texto) <= n else "…" + texto[-n:]


def ejecutar_comando(c: dict, raiz: Path) -> dict:
    timeout = int(c.get("timeout_seconds", 120))
    proceso = subprocess.Popen(
        "set -o pipefail\n" + c["command"], shell=True, executable="/bin/bash", cwd=raiz / str(c.get("cwd", ".")),
        stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        start_new_session=True)  # su propio grupo de procesos: el timeout mata también a los hijos
    try:
        out, err = proceso.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        os.killpg(proceso.pid, signal.SIGKILL)
        out, err = proceso.communicate()
        return {"status": "fail", "reason": f"timeout tras {timeout}s", "stdout_tail": cola(out), "stderr_tail": cola(err)}
    esperado = int(c.get("expected_exit_code", 0))
    if proceso.returncode == esperado:
        return {"status": "pass", "exit_code": proceso.returncode}
    estado = "blocked" if proceso.returncode in (126, 127) else "fail"  # 126/127: no existe o no es ejecutable
    return {"status": estado, "exit_code": proceso.returncode, "stdout_tail": cola(out), "stderr_tail": cola(err)}


def comprobar_archivo(c: dict, raiz: Path) -> dict:
    ruta = raiz / c["path"]
    if c["expected"] == "absent":
        return {"status": "fail" if ruta.exists() else "pass"}
    if not ruta.is_file():
        return {"status": "fail", "reason": "no existe"}
    texto = ruta.read_text(encoding="utf-8", errors="replace")
    if "contains" in c and not re.search(c["contains"], texto, re.M):
        return {"status": "fail", "reason": f"no contiene /{c['contains']}/"}
    return {"status": "pass"}


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("archivo", type=Path)
    p.add_argument("--salida", type=Path, default=Path("acceptance-results.json"))
    args = p.parse_args()
    try:
        doc = cargar(args.archivo)
    except ValueError as exc:
        print(f"BLOQUEADO: {exc}")
        return 2
    errores = problemas(doc)
    if errores:
        print("BLOQUEADO: acceptance inválido:\n  - " + "\n  - ".join(errores))
        return 2
    raiz = args.archivo.resolve().parent
    resultados = []
    for c in doc["checks"]:
        if c["kind"] == "command":
            r = ejecutar_comando(c, raiz)
        elif c["kind"] == "file":
            r = comprobar_archivo(c, raiz)
        else:
            r = {"status": "manual", "reason": "inspección: la resuelve el revisor con evidencia"}
        resultados.append({"id": c["id"], "kind": c["kind"], "required": c["required"], **r})
        detalle = r.get("reason") or (f"exit {r['exit_code']}" if "exit_code" in r else "")
        print(f"{r['status'].upper():8} {c['id']} {c.get('title', '')} {detalle}".rstrip())
    args.salida.write_text(json.dumps({
        "run_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "acceptance_sha256": hashlib.sha256(args.archivo.read_bytes()).hexdigest(),  # qué spec se ejecutó
        "results": resultados,
    }, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    obligatorios = [r for r in resultados if r["required"] and r["kind"] != "inspection"]
    if any(r["status"] == "blocked" for r in obligatorios):
        return 2
    return 1 if any(r["status"] == "fail" for r in obligatorios) else 0


if __name__ == "__main__":
    sys.exit(main())
```

4. **Pruébalo.** Pasa y falla por código de salida, `pipefail`, timeout, herramienta ausente, checks que no verifican y opcionales que fallan sin tumbar el resultado.

```python title="test_aceptacion.py"
"""python3 -m unittest -v test_aceptacion.py"""
import json
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path

RUNNER = Path(__file__).parent / "aceptacion.py"
CABECERA = "version: 1\nfeature_id: DEMO-001\nchecks:\n"


def check(cid, command, required="true", **extra):
    lineas = [f"  - id: {cid}", "    title: prueba", "    covers: [FR-01]", "    kind: command",
              f"    required: {required}", f"    command: {command}"]
    return "\n".join(lineas + [f"    {k}: {v}" for k, v in extra.items()]) + "\n"


def correr(yaml: str):
    carpeta = Path(tempfile.mkdtemp())
    (carpeta / "acceptance.yaml").write_text(CABECERA + yaml, encoding="utf-8")
    r = subprocess.run([sys.executable, str(RUNNER), "acceptance.yaml"], cwd=carpeta, capture_output=True, text=True)
    resultados = carpeta / "acceptance-results.json"
    return r, json.loads(resultados.read_text()) if resultados.exists() else None


class Aceptacion(unittest.TestCase):
    def test_pasa_y_falla_por_codigo_de_salida(self):
        r, doc = correr(check("AC-001", "test -d .") + check("AC-002", "test -f no-existe.txt"))
        self.assertEqual(1, r.returncode)
        self.assertEqual(["pass", "fail"], [x["status"] for x in doc["results"]])
        self.assertEqual(64, len(doc["acceptance_sha256"]))

    def test_pipefail_no_esconde_fallos(self):
        r, doc = correr(check("AC-001", "'false | cat'"))
        self.assertEqual("fail", doc["results"][0]["status"])

    def test_timeout_mata_el_proceso(self):
        inicio = time.monotonic()
        r, doc = correr(check("AC-001", "sleep 30", timeout_seconds=1))
        self.assertLess(time.monotonic() - inicio, 10)
        self.assertEqual("timeout tras 1s", doc["results"][0]["reason"])

    def test_herramienta_ausente_es_bloqueo(self):
        r, doc = correr(check("AC-001", "herramienta-que-no-existe --version"))
        self.assertEqual(2, r.returncode)
        self.assertEqual("blocked", doc["results"][0]["status"])

    def test_rechaza_checks_que_no_verifican(self):
        for orden in ("true", "echo ok", "'pytest -q || true'"):
            with self.subTest(orden=orden):
                r, doc = correr(check("AC-001", orden))
                self.assertEqual(2, r.returncode)
                self.assertIn("BLOQUEADO", r.stdout)
                self.assertIsNone(doc)

    def test_opcional_que_falla_no_tumba(self):
        r, _ = correr(check("AC-001", "test -d .") + check("AC-002", "'exit 3'", required="false"))
        self.assertEqual(0, r.returncode)


if __name__ == "__main__":
    unittest.main()
```

5. **Úsalo como puerta.** El agente que construye lo ejecuta antes de decir «hecho»; el revisor lo vuelve a ejecutar y adjunta `acceptance-results.json`; tu flujo solo cierra la tarea con el código de salida 0 y las inspecciones obligatorias resueltas.

## Cómo comprobar que funciona

La primera versión de la CLI terminaba con `sys.exit("mensaje")`, que sale con 1, no con el 2 que pide AC-003, y el runner lo detectó:

```text
$ python3 aceptacion.py acceptance.yaml; echo "exit=$?"
PASS     AC-001 La regresión del proyecto sigue pasando exit 0
PASS     AC-002 El módulo expone saludar()
FAIL     AC-003 La CLI rechaza un nombre vacío con exit 2 exit 1
MANUAL   AC-004 El mensaje de error dice cómo corregirlo inspección: la resuelve el revisor con evidencia
exit=1
```

Tras corregir la CLI (la versión de arriba: mensaje a stderr y `sys.exit(2)`):

```text
$ python3 aceptacion.py acceptance.yaml; echo "exit=$?"
PASS     AC-001 La regresión del proyecto sigue pasando exit 0
PASS     AC-002 El módulo expone saludar()
PASS     AC-003 La CLI rechaza un nombre vacío con exit 2 exit 2
MANUAL   AC-004 El mensaje de error dice cómo corregirlo inspección: la resuelve el revisor con evidencia
exit=0
$ python3 aceptacion.py malo.yaml; echo "exit=$?"
BLOQUEADO: acceptance inválido:
  - AC-001: el command oculta su código de salida
exit=2
$ python3 -m unittest -v test_aceptacion.py
test_herramienta_ausente_es_bloqueo (test_aceptacion.Aceptacion.test_herramienta_ausente_es_bloqueo) ... ok
test_opcional_que_falla_no_tumba (test_aceptacion.Aceptacion.test_opcional_que_falla_no_tumba) ... ok
test_pasa_y_falla_por_codigo_de_salida (test_aceptacion.Aceptacion.test_pasa_y_falla_por_codigo_de_salida) ... ok
test_pipefail_no_esconde_fallos (test_aceptacion.Aceptacion.test_pipefail_no_esconde_fallos) ... ok
test_rechaza_checks_que_no_verifican (test_aceptacion.Aceptacion.test_rechaza_checks_que_no_verifican) ... ok
test_timeout_mata_el_proceso (test_aceptacion.Aceptacion.test_timeout_mata_el_proceso) ... ok

----------------------------------------------------------------------
Ran 6 tests in 2.093s

OK
```

## Variaciones

- **Regresión obligatoria.** Haz que todo `acceptance.yaml` incluya como check obligatorio el script de regresión del proyecto ([[recetas/un-verify-para-toda-la-regresion]]). El autor lo exige por configuración (`required_regression`) y, por etiqueta, suites concretas: una feature con el tag `auth` debe ejecutar los tests de seguridad.
- **Spec congelada.** El runner del autor se niega a ejecutar si el `acceptance.yaml` cambió desde que la persona lo aprobó: [[recetas/congelar-la-spec-con-un-hash]].
- **Comandos sensibles.** Marca para revisión humana los checks con red externa o código en línea (`python -c`, `bash -c`, `curl` a algo que no sea localhost): son válidos, pero nadie debería aprobarlos sin leerlos.
- **Sin secretos.** Ejecuta los comandos con un entorno filtrado y redacta la evidencia: [[recetas/proteger-secretos-del-agente]].
- **Ejecución parcial.** Un `--only AC-003` para reproducir un fallo durante una reparación, sin sobrescribir los resultados completos.
- **PyYAML.** Si ya lo tienes, sustituye `cargar()` por `yaml.safe_load` (nunca `yaml.load` con datos que no controlas).

## Errores típicos

- **Escribir los checks después del código.** Acaban describiendo lo que hace el código, no lo que se pidió. Se escriben con la spec y se aprueban antes de construir ([[disciplinas/spec-primero]]).
- **Encadenar a `head` o `less`.** `pytest | head` corta la salida y, con `pipefail`, puede fallar por la señal de la tubería. La evidencia ya se recorta: deja el comando solo.
- **Inspecciones como cajón de sastre.** Si medio `acceptance.yaml` son inspecciones, no tienes aceptación ejecutable. Usa `inspection` solo para lo que de verdad no se automatiza (un texto que se entiende, una pantalla que se ve bien).
- **Timeouts generosos por defecto.** Un comando colgado bloquea al agente sin que nadie se entere. Pon un timeout por check acorde a lo que hace.
- **Ejecutar comandos que nadie ha leído.** Los comandos de aceptación se ejecutan sin más confirmación: una persona debe verlos literales antes de aprobar la spec ([[recetas/puerta-humana-con-comandos]]).
