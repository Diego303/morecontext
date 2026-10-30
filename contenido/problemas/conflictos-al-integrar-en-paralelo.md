---
titulo: Conflictos al integrar features hechas en paralelo
descripcion: Por qué dos features que pasan sus tests por separado chocan al integrarlas (registros, lockfiles, migraciones, código generado) y cómo resolver cada tipo sin romper nada.
creado: 2026-10-29
sintoma: Conflictos al integrar features hechas en paralelo
tema: agentes
nivel: intermedio
tags: [paralelo, worktrees, git, olas]
relacionados: ["[[recetas/integrar-features-en-paralelo]]", "[[cursos/harness-engineering/13-features-en-paralelo-con-olas]]", "[[disciplinas/trabajo-en-paralelo-con-agentes]]", "[[glosario/worktree]]"]
---

Tienes dos agentes trabajando a la vez, cada uno en su [[glosario/worktree|worktree]]. Los dos terminan con la verificación en verde. Integras la primera sin problemas y, al integrar la segunda, git se para (salida real de `git merge --squash` en un repositorio de prueba):

```text
Auto-merging rutas.py
CONFLICT (content): Merge conflict in rutas.py
Squash commit -- not updating HEAD
Automatic merge failed; fix conflicts and then commit the result.
```

O peor: git integra sin quejarse y algo se rompe después. Dos migraciones con el mismo número (`0005_facturas.sql` y `0005_clientes.sql`), un lockfile que ya no corresponde a las dependencias o tests que fallan solo con las dos features juntas.

## Causas

Casi todos los conflictos vienen de archivos donde cada feature añade una línea en el mismo sitio:

- **Registros compartidos**: rutas, comandos, catálogos de errores o de textos, ajustes, listas de *features*. Cada una añade su entrada al final y las dos tocan las mismas líneas.
- **Manifiestos y lockfiles**: las dos añaden dependencias. El manifiesto choca en una línea; el lockfile, en cientos.
- **Migraciones de base de datos**: las dos crean «la siguiente». Git no ve conflicto porque son archivos distintos, pero el número está repetido.
- **Código generado** (clientes de API, tipos, *bindings*): se regenera entero en cada feature y difiere en todas partes.
- **Dependencias implícitas**: las dos cambian el mismo formato o la misma función compartida sin saberlo. Esto no es mecánico y suele acabar en tests rojos tras integrar.

## Cómo confirmarlo

`git status --short` lista los archivos en conflicto (`UU`). Para lo que git no detecta, comprueba las migraciones con un script como este, que devuelve 1 si hay números repetidos:

```python title="migraciones_duplicadas.py"
import collections
import pathlib
import sys

carpeta = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "migraciones")
por_numero = collections.defaultdict(list)
for f in sorted(carpeta.glob("[0-9]*_*")):
    por_numero[f.name.split("_", 1)[0]].append(f.name)
duplicadas = {n: fs for n, fs in por_numero.items() if len(fs) > 1}
for n, fs in duplicadas.items():
    print(f"migración {n} duplicada: {', '.join(fs)}")
sys.exit(1 if duplicadas else 0)
```

```text
migración 0005 duplicada: 0005_clientes.sql, 0005_facturas.sql
```

Y ejecuta la regresión completa con las dos features juntas: es la única forma de ver las dependencias implícitas.

## Arreglo

La tabla que usa el harness de olas del autor para cada tipo de archivo ([[sistemas/harness-sdd-olas]]):

| Dónde | Cómo se resuelve |
|---|---|
| Registros (rutas, comandos, errores, textos, ajustes) | Conserva las dos entradas |
| Manifiestos (`package.json`, `pyproject.toml`…) | Conserva las dos líneas |
| Lockfiles (`pnpm-lock.yaml`, `uv.lock`, `Cargo.lock`…) | Nunca a mano: el lado de la rama de integración y reinstalar |
| Código generado | Nunca a mano: el lado de la rama de integración y regenerar |
| Migraciones | Primero la de la rama de integración; la nueva, con el número siguiente |
| Documentación de formatos | Une los dos apartados |

Para los registros donde siempre se conservan los dos lados, git puede hacerlo solo con el *driver* `union`. En el mismo repositorio de prueba, con esta línea en `.gitattributes`, la segunda integración pasa sin conflicto y `rutas.py` queda con las dos entradas:

```text title=".gitattributes"
rutas.py merge=union
```

Úsalo solo en archivos de una entrada por línea sin orden significativo: en otros, `union` produce código inválido sin avisar. Para lockfiles y código generado:

```bash
git checkout --ours pnpm-lock.yaml   # en un merge, --ours es la rama de integración (en un rebase se invierte)
pnpm install                          # regenera el lockfile con las dependencias de las dos features
git add pnpm-lock.yaml
```

Después, la regresión completa. Si falla con las dos features juntas, aborta la integración y abre un bug: no lo arregles a mano en la rama de integración. El procedimiento con *squash*, una feature cada vez, está en [[recetas/integrar-features-en-paralelo]].

## Cómo evitarlo

- **Integra de una en una**, con la regresión en verde antes de la siguiente: así cada fallo tiene un único sospechoso.
- **No paralelices features que tocan lo mismo**: declara las dependencias en el plan de la ola, también las implícitas (mismo módulo, mismo formato) ([[plantillas/plan-de-olas]]).
- Automatiza lo mecánico (registros, lockfiles, generados) y deja al humano o al orquestador solo lo que requiere criterio.
- Numera las migraciones al integrar, no al crearlas, o usa marcas de tiempo.

## Ver también

- [[recetas/features-en-paralelo-con-worktrees]]
- [[cursos/harness-engineering/13-features-en-paralelo-con-olas]]
- [[blog/2026-10-25-tres-cosas-que-se-rompen-sin-worktrees]]
- [[glosario/ola]]
