---
titulo: Congelar la spec con un hash
descripcion: Al aprobar una especificación, guarda el SHA-256 de cada artefacto en spec.lock.json y compruébalo antes de cada paso para que ningún agente la cambie sin una nueva aprobación.
creado: 2026-10-29
nivel: intermedio
minutos: 20
tema: agentes
stack: ["Python"]
tags: [sdd, spec, harness, hash, aprobacion]
relacionados: ["[[cursos/harness-engineering/07-spec-congelada-y-aceptacion]]", "[[recetas/criterios-de-aceptacion-ejecutables]]", "[[recetas/puerta-humana-con-comandos]]", "[[disciplinas/spec-primero]]", "[[glosario/sdd]]"]
---

## Problema

Apruebas una especificación: requisitos, diseño, tareas y [[recetas/criterios-de-aceptacion-ejecutables|criterios de aceptación]]. El agente que construye se atasca con un check y, con la mejor intención, «ajusta» `acceptance.yaml` para que pase. O el diseño cambia un poco en cada vuelta. Cuando revisas, lo que se cumplió ya no es lo que aprobaste, y nadie te lo dijo.

En un flujo [[glosario/sdd|SDD]] la regla es simple: **lo aprobado es inmutable hasta que una persona apruebe otra cosa**. Para que sea verificable y no una promesa, el harness del autor guarda en `spec.lock.json` el SHA-256 de cada artefacto en el momento de la aprobación y lo comprueba antes de cada paso. Esta receta es esa pieza, reducida.

## Ingredientes

- Python 3.10 o superior (biblioteca estándar).
- Una carpeta con los artefactos de la spec. Aquí, los del harness: `proposal.md`, `requirements.md`, `design.md`, `tasks.md` y `acceptance.yaml`.
- Un momento claro de aprobación humana ([[recetas/puerta-humana-con-comandos]]).

## Pasos

1. **Decide qué se congela.** Todo lo que define *qué* se construye y *cómo se comprueba*. Lo que se escribe durante la construcción (informe de implementación, resultados) queda fuera.

2. **Congela al aprobar.** El mismo comando que registra la aprobación escribe el lock: la huella de cada archivo, cuándo y quién. Si falta un artefacto, no congela: no se aprueba una spec incompleta. La escritura es atómica (archivo temporal y `os.replace`) para no dejar nunca un lock a medias.

3. **Comprueba antes de cada paso.** Antes de pasar a verificación, antes de ejecutar la aceptación y antes de cerrar la tarea. Si algo cambió, el paso se rechaza y **no escribe nada**. Un SHA-256 detecta cualquier cambio, también un espacio.

```python title="spec_lock.py"
#!/usr/bin/env python3
"""Congela la spec aprobada con SHA-256 y comprueba que no ha cambiado.

  spec_lock.py congelar <carpeta> --por <quién>   al aprobar: escribe <carpeta>/spec.lock.json
  spec_lock.py comprobar <carpeta>                antes de cada paso: exit 0 intacta, 1 cambió o falta el lock
"""
import argparse
import hashlib
import json
import os
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ARCHIVOS = ("proposal.md", "requirements.md", "design.md", "tasks.md", "acceptance.yaml")


def huella(carpeta: Path) -> dict:
    return {n: hashlib.sha256((carpeta / n).read_bytes()).hexdigest() for n in ARCHIVOS if (carpeta / n).is_file()}


def congelar(carpeta: Path, por: str) -> None:
    faltan = [n for n in ARCHIVOS if not (carpeta / n).is_file()]
    if faltan:
        sys.exit(f"No congelo una spec incompleta: faltan {', '.join(faltan)}")
    datos = {"locked_at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "approved_by": por,
             "files": huella(carpeta)}
    fd, tmp = tempfile.mkstemp(dir=carpeta)  # escritura atómica: nunca un lock a medias
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(datos, f, indent=2)
    os.replace(tmp, carpeta / "spec.lock.json")


def problemas(carpeta: Path) -> list[str]:
    lock = carpeta / "spec.lock.json"
    if not lock.is_file():
        return ["falta spec.lock.json: la spec no está aprobada"]
    guardada = json.loads(lock.read_text(encoding="utf-8"))["files"]
    actual = huella(carpeta)
    cambios = [f"{n} {'se borró' if n not in actual else 'cambió'} después de aprobarse"
               for n, h in sorted(guardada.items()) if actual.get(n) != h]
    return cambios + [f"{n} no estaba en la spec aprobada" for n in sorted(set(actual) - set(guardada))]


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("orden", choices=["congelar", "comprobar"])
    p.add_argument("carpeta", type=Path)
    p.add_argument("--por", default="human")
    a = p.parse_args()
    if a.orden == "congelar":
        congelar(a.carpeta, a.por)
        print(f"Spec congelada: {len(ARCHIVOS)} archivos en {a.carpeta / 'spec.lock.json'}")
        sys.exit(0)
    lista = problemas(a.carpeta)
    for linea in lista:
        print(f"SPEC CAMBIADA: {linea}")
    if not lista:
        print("Spec intacta")
    sys.exit(1 if lista else 0)
```

4. **Engánchalo a tu flujo.** En un script, una línea antes de cada paso:

```bash
python3 spec_lock.py comprobar .claude/state/SALUDO-001/SDD || exit 1
```

   En el harness del autor lo hacen tres piezas: el motor de estado (la guard `spec_unchanged` en cada transición posterior a la aprobación), el runner de aceptación (se niega a ejecutar) y el hook de seguridad, que impide a cualquier agente escribir `spec.lock.json` y a todos salvo el diseñador escribir en la carpeta de la spec.

5. **Decide qué pasa si cambia.** El lock no se «actualiza»: si la spec tiene que cambiar, es una decisión humana. El camino del autor: la tarea pasa a bloqueada, una persona pide `replan`, el diseñador rehace la spec, el motor borra el lock anterior y se vuelve a aprobar, lo que crea uno nuevo. Si el cambio fue un accidente (un agente tocó lo que no debía), se revierte el archivo y la comprobación vuelve a pasar.

6. **Prueba los casos.** Sin lock, intacta, cambio, borrado, un solo espacio, lock retocado a mano y spec incompleta.

```python title="test_spec_lock.py"
"""python3 -m unittest -v test_spec_lock.py"""
import tempfile
import unittest
from pathlib import Path

import spec_lock


class SpecLock(unittest.TestCase):
    def setUp(self):
        self.sdd = Path(tempfile.mkdtemp())
        for nombre in spec_lock.ARCHIVOS:
            (self.sdd / nombre).write_text(f"contenido de {nombre}\n", encoding="utf-8")

    def test_sin_lock_no_hay_aprobacion(self):
        self.assertEqual(["falta spec.lock.json: la spec no está aprobada"], spec_lock.problemas(self.sdd))

    def test_intacta_tras_congelar(self):
        spec_lock.congelar(self.sdd, "human")
        self.assertEqual([], spec_lock.problemas(self.sdd))

    def test_detecta_cambios_y_borrados(self):
        spec_lock.congelar(self.sdd, "human")
        (self.sdd / "acceptance.yaml").write_text("checks relajados\n", encoding="utf-8")
        (self.sdd / "tasks.md").unlink()
        (self.sdd / "acceptance.yaml.bak").write_text("x", encoding="utf-8")  # no es de la spec: se ignora
        self.assertEqual(["acceptance.yaml cambió después de aprobarse", "tasks.md se borró después de aprobarse"],
                         spec_lock.problemas(self.sdd))

    def test_un_espacio_tambien_cuenta(self):
        spec_lock.congelar(self.sdd, "human")
        with (self.sdd / "design.md").open("a", encoding="utf-8") as f:
            f.write(" ")
        self.assertEqual(["design.md cambió después de aprobarse"], spec_lock.problemas(self.sdd))

    def test_lock_retocado_a_mano(self):
        spec_lock.congelar(self.sdd, "human")
        lock = self.sdd / "spec.lock.json"
        lock.write_text(lock.read_text(encoding="utf-8").replace('"design.md"', '"diseno.md"'), encoding="utf-8")
        self.assertIn("design.md no estaba en la spec aprobada", spec_lock.problemas(self.sdd))

    def test_no_congela_incompleta(self):
        (self.sdd / "design.md").unlink()
        with self.assertRaises(SystemExit):
            spec_lock.congelar(self.sdd, "human")


if __name__ == "__main__":
    unittest.main()
```

## Cómo comprobar que funciona

```text
$ python3 -m unittest -v test_spec_lock.py
test_detecta_cambios_y_borrados (test_spec_lock.SpecLock.test_detecta_cambios_y_borrados) ... ok
test_intacta_tras_congelar (test_spec_lock.SpecLock.test_intacta_tras_congelar) ... ok
test_lock_retocado_a_mano (test_spec_lock.SpecLock.test_lock_retocado_a_mano) ... ok
test_no_congela_incompleta (test_spec_lock.SpecLock.test_no_congela_incompleta) ... ok
test_sin_lock_no_hay_aprobacion (test_spec_lock.SpecLock.test_sin_lock_no_hay_aprobacion) ... ok
test_un_espacio_tambien_cuenta (test_spec_lock.SpecLock.test_un_espacio_tambien_cuenta) ... ok

----------------------------------------------------------------------
Ran 6 tests in 0.358s

OK
```

El ciclo completo sobre una carpeta de ejemplo:

```text
$ python3 spec_lock.py comprobar SDD; echo "exit=$?"
SPEC CAMBIADA: falta spec.lock.json: la spec no está aprobada
exit=1
$ python3 spec_lock.py congelar SDD --por human
Spec congelada: 5 archivos en SDD/spec.lock.json
$ python3 spec_lock.py comprobar SDD; echo "exit=$?"
Spec intacta
exit=0
$ echo "  - id: AC-009" >> SDD/acceptance.yaml
$ python3 spec_lock.py comprobar SDD; echo "exit=$?"
SPEC CAMBIADA: acceptance.yaml cambió después de aprobarse
exit=1
```

## Variaciones

- **Lo aprobado es lo presentado.** El autor añade una huella anterior: cuando el diseñador termina, el evento de «diseño completo» guarda los hashes de lo que se presenta a la persona. Al aprobar, si la spec cambió entre la presentación y el «apruebo», la aprobación se rechaza. Así nadie aprueba algo distinto de lo que leyó.
- **Hash del conjunto.** Además de un hash por archivo, guarda uno del conjunto (hash de los hashes ordenados) para citarlo en el commit o en el registro de la aprobación.
- **Guardar la evidencia contra el lock.** Los resultados de la aceptación llevan el SHA-256 del `acceptance.yaml` ejecutado; al cerrar, compruébalo contra el del lock para saber que se ejecutó lo aprobado.
- **Git como alternativa.** Si la spec vive en el repo, puedes congelarla con un commit y comparar con `git diff --quiet <commit> -- SDD/`. El lock en JSON funciona aunque la spec no esté versionada todavía y deja constancia de quién aprobó.

## Errores típicos

- **Dejar que el agente reescriba el lock.** Si un agente puede editar `spec.lock.json`, el candado no cierra nada. Protégelo con un hook ([[recetas/hook-que-bloquea-comandos-peligrosos]]) y que solo lo escriba el motor.
- **Comprobar solo al final.** Si el cambio se detecta al cerrar, ya se construyó sobre la spec cambiada. Comprueba en cada paso.
- **Normalizar antes de hashear.** Quitar espacios o finales de línea «para no molestar» abre la puerta a cambios que no ves. Hashea los bytes tal cual.
- **Congelar demasiado.** Si metes en el lock el informe de implementación, cada build lo rompe. Solo lo que define qué se construye y cómo se comprueba.
- **Tratar el rechazo como un estorbo.** Cuando la comprobación falla, el sistema hace su trabajo: para y explica. Resolverlo es una decisión humana, no un `rm spec.lock.json`.
