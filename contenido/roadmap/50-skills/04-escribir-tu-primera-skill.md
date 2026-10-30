---
titulo: Escribe tu primera skill
descripcion: Práctica completa - elige un procedimiento, escribe su SKILL.md, añade y ejecuta un script, valida la skill contra el estándar, prueba su activación con casos y úsala también desde la Skills API.
creado: 2026-10-29
orden: 4
minutos: 40
tipo: practica
objetivos:
  - Escribir una skill con SKILL.md y un script de apoyo que se ejecuta y devuelve datos estructurados.
  - Validar la skill contra las reglas del estándar Agent Skills con un script propio y con skills-ref.
  - Preparar cinco casos de activación y un ejecutor que comprueba si la skill se activa cuando debe.
  - Usar la misma carpeta desde la Skills API de Claude.
requiere: ["[[roadmap/50-skills/03-carga-bajo-demanda]]"]
tags: [skills, practica, claude-code, evals]
relacionados: ["[[plantillas/skill]]", "[[docs/claude-code/03-skills]]", "[[docs/estandares/04-agent-skills-y-agents-md]]", "[[docs/claude-code/08-modo-headless-y-ci]]"]
---

En esta lección escribes una skill de principio a fin: notas de versión a partir de los commits de un repositorio. Al terminar tendrás la carpeta de la skill con su script, un validador que comprueba las reglas del estándar, cinco casos de activación con su ejecutor y la misma skill subida a la Skills API. Es exactamente el entregable del proyecto del nivel, aplicado a un procedimiento que casi cualquier equipo repite.

## La idea

Una skill útil reparte el trabajo entre dos piezas: **el script hace lo determinista** (leer `git log`, clasificar commits por tipo) y **el modelo hace lo que requiere juicio** (reescribir cada cambio para quien usa el producto, decidir qué es incompatible, proponer la versión). Si mezclas las dos cosas en instrucciones, el modelo hará la parte mecánica de forma distinta cada vez; si lo metes todo en un script, no necesitabas un agente.

El orden de trabajo es el de cualquier componente con pruebas: elegir el caso, escribir, ejecutar, validar, medir e iterar.

## Paso 1: elige el procedimiento

Un buen candidato cumple tres condiciones: lo has explicado al agente más de una vez, tiene un resultado que puedes comprobar y aparece en una minoría de tus tareas. Las notas de versión encajan: se hacen cada pocas semanas, siempre con el mismo formato, y nadie quiere esas instrucciones en el `CLAUDE.md` permanente.

Escribe antes de empezar el resultado esperado en una frase: «Un bloque Markdown con las secciones Cambios incompatibles, Añadido, Corregido y Rendimiento, con cada cambio redactado para el usuario y una versión SemVer propuesta».

## Paso 2: crea la carpeta

```bash
mkdir -p .claude/skills/notas-de-version/scripts
```

El nombre de la carpeta será el `name` de la skill y el comando `/notas-de-version` en Claude Code: minúsculas, números y guiones.

## Paso 3: el script de apoyo

```python title=".claude/skills/notas-de-version/scripts/agrupar_commits.py"
#!/usr/bin/env python3
"""Agrupa los commits de un rango por tipo de Conventional Commits y los imprime en JSON."""
import json
import re
import subprocess
import sys

PATRON = re.compile(r"^(?P<tipo>[a-z]+)(?:\((?P<ambito>[^)]+)\))?(?P<rompe>!)?: (?P<asunto>.+)$")
SECCIONES = {"feat": "Añadido", "fix": "Corregido", "perf": "Rendimiento"}


def git(*args: str) -> str:
    return subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout


def rango_por_defecto() -> str:
    try:
        ultima = git("describe", "--tags", "--abbrev=0").strip()
        return f"{ultima}..HEAD"
    except subprocess.CalledProcessError:
        return "HEAD"  # sin etiquetas: todo el historial


def agrupar(rango: str) -> dict:
    salida = git("log", rango, "--no-merges", "--format=%h%x1f%s%x1f%b%x1e")
    grupos: dict[str, list] = {"Cambios incompatibles": [], **{s: [] for s in SECCIONES.values()},
                               "Otros": [], "Sin formato": []}
    for registro in filter(None, (r.strip() for r in salida.split("\x1e"))):
        sha, asunto, cuerpo = (registro.split("\x1f") + ["", ""])[:3]
        m = PATRON.match(asunto)
        if not m:
            grupos["Sin formato"].append({"sha": sha, "asunto": asunto})
            continue
        item = {"sha": sha, "ambito": m["ambito"], "asunto": m["asunto"]}
        if m["rompe"] or "BREAKING CHANGE:" in cuerpo:
            grupos["Cambios incompatibles"].append(item)
        grupos[SECCIONES.get(m["tipo"], "Otros")].append(item | {"tipo": m["tipo"]})
    return {"rango": rango, "grupos": {k: v for k, v in grupos.items() if v}}


if __name__ == "__main__":
    rango = sys.argv[1] if len(sys.argv) > 1 else rango_por_defecto()
    try:
        print(json.dumps(agrupar(rango), ensure_ascii=False, indent=2))
    except subprocess.CalledProcessError as e:
        print(f"git falló: {e.stderr.strip()}", file=sys.stderr)
        sys.exit(1)
```

Tres decisiones de diseño: separa campos con caracteres de control (`%x1f`, `%x1e`) para que un asunto con comas o saltos de línea no rompa el análisis; devuelve **JSON**, que el modelo lee sin ambigüedad; y no esconde lo que no entiende: los commits sin formato van a su propio grupo para que el humano decida.

Pruébalo en un repositorio de juguete antes de dárselo al agente:

```bash
git init -q -b main demo && cd demo
git config user.email a@example.com && git config user.name Prueba
c() { git commit -q --allow-empty -m "$1"; }
c "feat: primera versión"; git tag v1.0.0
c "feat(api): filtro por fecha en /pedidos"; c "fix(api): 500 cuando el pedido no tiene líneas"
c "perf: caché de tarifas en memoria"; c "feat(auth)!: los tokens caducan a las 24 h"
c "docs: guía de despliegue"; c "arreglos varios"
python3 ../.claude/skills/notas-de-version/scripts/agrupar_commits.py
```

Salida real, con las líneas compactadas para que quepa:

```json
{
  "rango": "v1.0.0..HEAD",
  "grupos": {
    "Cambios incompatibles": [{"sha": "9981618", "ambito": "auth", "asunto": "los tokens caducan a las 24 h"}],
    "Añadido": [
      {"sha": "9981618", "ambito": "auth", "asunto": "los tokens caducan a las 24 h", "tipo": "feat"},
      {"sha": "de64e71", "ambito": "api", "asunto": "filtro por fecha en /pedidos", "tipo": "feat"}
    ],
    "Corregido": [{"sha": "3027604", "ambito": "api", "asunto": "500 cuando el pedido no tiene líneas", "tipo": "fix"}],
    "Rendimiento": [{"sha": "88f2ddb", "ambito": null, "asunto": "caché de tarifas en memoria", "tipo": "perf"}],
    "Otros": [{"sha": "a25c6e8", "ambito": null, "asunto": "guía de despliegue", "tipo": "docs"}],
    "Sin formato": [{"sha": "43e9ab8", "asunto": "arreglos varios"}]
  }
}
```

Fíjate en que el `feat(auth)!` aparece en dos grupos: es un cambio incompatible y también una novedad. El script no decide cómo presentarlo; eso lo dice el procedimiento.

## Paso 4: el SKILL.md

````markdown title=".claude/skills/notas-de-version/SKILL.md"
---
name: notas-de-version
description: Redacta las notas de versión de un repositorio git a partir de los commits desde la última etiqueta, agrupadas en Cambios incompatibles, Añadido, Corregido y Rendimiento. Úsala cuando pidan notas de versión, changelog, release notes o «qué ha cambiado desde la última versión». No la uses para explicar un commit suelto ni para escribir mensajes de commit.
license: MIT
compatibility: Necesita git y python3 en el PATH.
metadata:
  autor: tu-equipo
  version: "1.0"
---

# Notas de versión

## Resultado

Un bloque Markdown listo para pegar en CHANGELOG.md o en la release, con la
versión y la fecha de hoy en el título.

## Procedimiento

1. Ejecuta `python3 scripts/agrupar_commits.py` desde la raíz del repositorio
   (o `python3 scripts/agrupar_commits.py v1.2.0..HEAD` si piden otro rango).
   La ruta del script es relativa a la carpeta de esta skill. Devuelve JSON con
   los commits ya agrupados; no vuelvas a leer `git log` a mano.
2. Si el JSON trae `Cambios incompatibles`, ponlos primero y explica en una
   frase qué tiene que hacer quien actualiza.
3. Reescribe cada asunto para quien usa el producto, no para quien lo programa:
   «Filtro por fecha en el listado de pedidos», no «add date filter param».
   Conserva el ámbito entre paréntesis si lo hay.
4. Omite `Otros` salvo que lo pidan. Si hay commits en `Sin formato`, no los
   inventes en una sección: enuméralos al final como «Sin clasificar» para que
   el humano decida.
5. Propón el número de versión siguiendo SemVer: mayor si hay cambios
   incompatibles, menor si hay `Añadido`, parche en otro caso. Es una propuesta;
   no crees la etiqueta.

## Formato

```markdown
## [X.Y.Z] - AAAA-MM-DD
### Cambios incompatibles
- (auth) Los tokens caducan a las 24 h: vuelve a iniciar sesión tras actualizar.
### Añadido
- (api) Filtro por fecha en el listado de pedidos.
```

## Límites

- No hagas commits, etiquetas ni push.
- Si el script falla (no es un repositorio git, rango inválido), muestra el
  error y para.
````

La skill solo usa campos del estándar, así que vale igual en Claude Code, en la Skills API y en otros clientes. Si solo la vas a usar en Claude Code, puedes añadir `argument-hint: "[rango]"` y referirte al script como `${CLAUDE_SKILL_DIR}/scripts/agrupar_commits.py`, a costa de perder portabilidad.

## Paso 5: valida contra el estándar

Las reglas son pocas y mecánicas, así que escríbelas en un script que puedas meter en CI:

```python title="validar_skill.py"
#!/usr/bin/env python3
"""Valida una carpeta de skill contra las reglas del estándar Agent Skills."""
import re
import sys
from pathlib import Path

import yaml

NOMBRE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")      # a-z0-9 y guiones, sin guion al borde ni '--'
ESTANDAR = {"name", "description", "license", "compatibility", "metadata", "allowed-tools"}


def validar(carpeta: Path) -> tuple[list[str], list[str]]:
    errores, avisos = [], []
    skill_md = carpeta / "SKILL.md"
    if not skill_md.is_file():
        return [f"falta {skill_md}"], []
    texto = skill_md.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", texto, re.S)
    if not m:
        return ["SKILL.md no empieza con un frontmatter YAML entre ---"], []
    fm, cuerpo = yaml.safe_load(m.group(1)) or {}, m.group(2)

    nombre = fm.get("name")
    if not isinstance(nombre, str) or not 1 <= len(nombre) <= 64 or not NOMBRE.match(nombre):
        errores.append(f"name {nombre!r}: 1–64 caracteres a-z, 0-9 y guiones")
    elif nombre != carpeta.name:
        errores.append(f"name {nombre!r} no coincide con el directorio {carpeta.name!r}")

    desc = fm.get("description")
    if not isinstance(desc, str) or not 1 <= len(desc.strip()) <= 1024:
        errores.append(f"description: 1–1.024 caracteres (tiene {len(desc or '')})")
    if isinstance(fm.get("compatibility"), str) and len(fm["compatibility"]) > 500:
        errores.append("compatibility: como mucho 500 caracteres")
    meta = fm.get("metadata", {})
    if not isinstance(meta, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in meta.items()):
        errores.append("metadata: debe ser un mapa de cadenas a cadenas")

    extra = sorted(set(fm) - ESTANDAR)
    if extra:
        avisos.append(f"campos fuera del estándar (solo los entiende Claude Code u otro cliente): {extra}")
    if len(cuerpo.splitlines()) > 500:
        avisos.append("cuerpo de más de 500 líneas: mueve el detalle a references/")
    return errores, avisos


if __name__ == "__main__":
    fallos = 0
    for ruta in sys.argv[1:]:
        errores, avisos = validar(Path(ruta))
        print(("✗ " if errores else "✓ ") + ruta)
        for e in errores: print("   error:", e)
        for a in avisos: print("   aviso:", a)
        fallos += bool(errores)
    sys.exit(1 if fallos else 0)
```

Ejecutado sobre la skill nueva, sobre la skill `new-session` del harness del autor y sobre una carpeta mal nombrada:

```text
✓ .claude/skills/notas-de-version
✓ .claude/skills/new-session
   aviso: campos fuera del estándar (solo los entiende Claude Code u otro cliente): ['argument-hint', 'disable-model-invocation']
✗ Notas_Version
   error: name 'Notas_Version': 1–64 caracteres a-z, 0-9 y guiones
```

El estándar tiene además una biblioteca de referencia, `skills-ref` (en PyPI, licencia Apache-2.0). En la versión 0.1.1 el ejecutable que instala se llama `agentskills`, y es más estricto que nuestro script con los campos extra: los trata como **error**, no como aviso.

```bash
pip install skills-ref          # en un entorno virtual propio
agentskills validate .claude/skills/notas-de-version
agentskills validate .claude/skills/new-session
```

```text
Valid skill: .claude/skills/notas-de-version
Validation failed for .claude/skills/new-session:
  - Unexpected fields in frontmatter: argument-hint, disable-model-invocation. Only ['allowed-tools', 'compatibility', 'description', 'license', 'metadata', 'name'] are allowed.
```

Ninguna de las dos herramientas comprueba lo que de verdad importa: si la skill se activa.

## Paso 6: los casos de activación

Escribe cinco peticiones realistas: tres que deben activar la skill (una en otro idioma, porque tu equipo las mezcla) y dos casos negativos **cercanos**, de los que comparten palabras con la skill pero piden otra cosa.

```json title="evals/notas-de-version.jsonl"
{"id": 1, "prompt": "Prepárame las notas de versión desde la última release", "debe_activar": true}
{"id": 2, "prompt": "¿Qué ha cambiado desde v1.0.0? Lo necesito para el changelog", "debe_activar": true}
{"id": 3, "prompt": "Write the release notes for this sprint", "debe_activar": true}
{"id": 4, "prompt": "Explícame qué hace el commit de9ab8", "debe_activar": false}
{"id": 5, "prompt": "Escribe un buen mensaje de commit para lo que tengo en staging", "debe_activar": false}
```

Para ejecutarlos con Claude Code, lanza cada caso en modo *headless* con salida `stream-json` y busca una llamada a la herramienta `Skill` que nombre tu skill:

```python title="probar_activacion.py"
#!/usr/bin/env python3
"""Lanza cada caso con `claude -p` y comprueba si el modelo invocó la skill."""
import json
import subprocess
import sys
from pathlib import Path

SKILL = "notas-de-version"


def invoco_skill(lineas_stream: list[str], skill: str = SKILL) -> bool:
    """True si algún mensaje del asistente trae un tool_use de la herramienta Skill que nombra la skill."""
    for linea in lineas_stream:
        try:
            evento = json.loads(linea)
        except json.JSONDecodeError:
            continue
        if evento.get("type") != "assistant":
            continue
        for bloque in evento.get("message", {}).get("content", []):
            if bloque.get("type") == "tool_use" and bloque.get("name") == "Skill" \
                    and skill in json.dumps(bloque.get("input", {})):
                return True
    return False


def ejecutar(prompt: str) -> list[str]:
    cmd = ["claude", "-p", prompt, "--output-format", "stream-json", "--verbose",
           "--allowedTools", "Skill", "--max-budget-usd", "0.50"]
    return subprocess.run(cmd, capture_output=True, text=True, timeout=600).stdout.splitlines()


if __name__ == "__main__":
    casos = [json.loads(l) for l in Path(sys.argv[1]).read_text(encoding="utf-8").splitlines() if l.strip()]
    aciertos = 0
    for caso in casos:
        activo = invoco_skill(ejecutar(caso["prompt"]))
        ok = activo == caso["debe_activar"]
        aciertos += ok
        print(json.dumps({"id": caso["id"], "esperado": caso["debe_activar"], "activo": activo, "ok": ok}))
    print(f"{aciertos}/{len(casos)} casos correctos", file=sys.stderr)
    sys.exit(0 if aciertos == len(casos) else 1)
```

Se ejecuta desde la raíz del repositorio de prueba con `python3 probar_activacion.py evals/notas-de-version.jsonl`. Lanza sesiones reales, así que **gasta dinero**: `--max-budget-usd` pone un tope por caso. Solo se aprueba la herramienta `Skill`, de modo que el agente no llega a ejecutar nada más (para medir la activación basta con ver la llamada). Hemos probado la función `invoco_skill` con mensajes de ejemplo, pero no hemos podido ejecutar los casos contra la CLI real en el entorno donde se escribió esta lección: comprueba en tu primera ejecución que la llamada aparece como esperas en el *stream* ([[docs/claude-code/08-modo-headless-y-ci]]). El resultado tendrá esta forma:

```text
# salida de ejemplo
{"id": 1, "esperado": true, "activo": true, "ok": true}
{"id": 2, "esperado": true, "activo": true, "ok": true}
{"id": 3, "esperado": true, "activo": false, "ok": false}
{"id": 4, "esperado": false, "activo": false, "ok": true}
{"id": 5, "esperado": false, "activo": false, "ok": true}
4/5 casos correctos
```

Repite cada caso al menos tres veces: la activación depende del modelo y no es determinista. Un caso que acierta dos de tres veces es un caso que falla.

## Paso 7: itera la description

Cuando falla un caso, el arreglo casi siempre está en la `description`, no en el cuerpo:

- **Falso negativo** (el caso 3 del ejemplo): falta la frase con la que lo pidió el usuario. Añádela tal cual, aquí «release notes».
- **Falso positivo**: la descripción es demasiado amplia o no marca el límite con la tarea vecina. Añade o afina la frase «No la uses para…».

Cambia una cosa cada vez, vuelve a pasar los cinco casos y guarda el resultado junto a la versión de la descripción. Ese archivo de resultados es la evidencia del proyecto. Para Claude Code existe además el plugin `skill-creator` (y `claude plugin eval`), que compara ejecuciones con y sin la skill para comprobar si se activa cuando debe; sus ejecuciones lanzan sesiones reales y también gastan.

## Paso 8: la misma skill desde la API

La **Skills API** de Claude es GA desde el 19 de agosto de 2026. Subes la carpeta una vez y la usas en cualquier petición que lleve la herramienta de ejecución de código, porque la skill vive en el contenedor donde se ejecuta ese código:

```python title="skills_api.py"
import anthropic
from anthropic.lib import files_from_dir

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

# 1. Sube la carpeta de la skill (SKILL.md + scripts/) una vez; guarda el id.
skill = client.skills.create(display_name="notas-de-version", files=files_from_dir("notas-de-version"))
print(skill.id, skill.latest_version_id)

# 2. Úsala en una petición: la skill vive en el contenedor de ejecución de código.
resp = client.messages.create(
    model=MODEL,
    max_tokens=4096,
    container={"skills": [{"type": "custom", "skill_id": skill.id, "version": "latest"}]},
    tools=[{"type": "code_execution_20260521", "name": "code_execution"}],
    messages=[{"role": "user", "content": "Redacta las notas de versión a partir de commits.txt."}],
)
print(resp.stop_reason)
```

Lo hemos comprobado con el SDK `anthropic` 2.3.0 contra un transporte simulado: `files_from_dir` sube `notas-de-version/SKILL.md` y `notas-de-version/scripts/agrupar_commits.py` en una petición *multipart* a `/v1/skills`, y la petición de mensajes lleva el `container` y la herramienta tal cual. Límites que cambian el diseño:

- El contenedor **no tiene red ni permite instalar paquetes**, y aquí no hay repositorio git: en la API tendrías que pasar los commits como archivo (de ahí `commits.txt`) y adaptar el script para leerlo.
- Hasta 20 skills por petición y subidas de hasta 30 MB. Las skills propias tienen IDs `skill_…` y versiones `skver_…`; nuevas versiones con `client.skills.versions.create(...)`.
- Fuera de Claude Code solo se aceptan los seis campos del estándar en el frontmatter. Otra razón para no depender de extensiones.
- Anthropic ofrece skills predefinidas (`pptx`, `xlsx`, `docx`, `pdf`) con `"type": "anthropic"`.
- No es apta para retención de datos cero (ZDR).

Si construyes tu agente con el Claude Agent SDK, la opción `skills=` decide qué skills ve la sesión (`"all"` o una lista de nombres). Es un filtro de contexto, no un sandbox: [[docs/frameworks/03-claude-agent-sdk]].

## Paso 9: en otras herramientas

Como la skill solo usa el estándar, la misma carpeta sirve en otros clientes que lean Agent Skills. Cada uno decide **dónde** busca las skills y cómo las presenta al modelo, así que consulta su documentación para la ruta; lo que no cambia es el contenido de la carpeta. Si una herramienta no lee el formato, el contenido de `SKILL.md` sigue siendo un buen procedimiento que puedes pegar en su sistema de instrucciones.

## Errores frecuentes

- Probar la skill solo con la petición con la que la diseñaste. Pasa los cinco casos, incluidos los negativos.
- Dejar que el modelo haga a mano lo que hace el script («lee el git log y agrupa»): resultados distintos en cada ejecución.
- Scripts que fallan en silencio. Si `git` falla, el script debe salir con código distinto de 0 y un mensaje claro, y el procedimiento debe decir que se pare.
- Medir una sola vez. La activación es probabilística.

## Ejercicio

> [!ejercicio] Tu skill con evaluación
> Escribe una skill para un procedimiento real de tu trabajo con al menos un script que se ejecute y devuelva datos estructurados. Valídala con `validar_skill.py` y con `agentskills validate`, escribe cinco casos (al menos dos negativos cercanos) y ejecútalos tres veces cada uno.
>
> **Está bien si** los dos validadores pasan (o justificas cada campo extra), el script se ejecuta solo y devuelve JSON, y el archivo de resultados muestra al menos 4 de 5 casos correctos en las tres repeticiones, con la versión de la `description` que los consiguió.

> [!ejercicio]- Pistas
> Si un caso negativo se activa, pregúntate qué palabra comparte con la descripción y escribe la exclusión con esa palabra. Si el script necesita configuración, pásala como argumento y documenta el argumento en el procedimiento.

## Resumen

- El script hace lo determinista y devuelve JSON; el modelo hace lo que requiere juicio.
- Valida con las reglas del estándar: `name` igual al directorio, 1–64 caracteres `a-z0-9-`, `description` de hasta 1.024.
- Prueba la activación con casos positivos y negativos cercanos, repetidos.
- La misma carpeta sube a la Skills API, con sus límites: sin red y solo campos del estándar.

## Para seguir

- [[roadmap/50-skills/05-skills-en-equipo]]
- [[plantillas/skill]]
- [[docs/claude-code/03-skills]]
- [[roadmap/80-evals/02-conjunto-de-prueba]]
