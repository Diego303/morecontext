---
titulo: Integrar features en paralelo sin romper nada
descripcion: Lleva a la rama de integración, de una en una y con squash, features hechas en worktrees separados, resolviendo lo mecánico solo, con verify tras cada una y un aborto limpio si algo falla.
creado: 2026-10-29
nivel: avanzado
minutos: 35
tema: agentes
stack: ["Git", "Bash"]
tags: [paralelo, git, integracion, worktrees, conflictos]
relacionados: ["[[recetas/features-en-paralelo-con-worktrees]]", "[[problemas/conflictos-al-integrar-en-paralelo]]", "[[recetas/un-verify-para-toda-la-regresion]]", "[[cursos/harness-engineering/13-features-en-paralelo-con-olas]]", "[[disciplinas/trabajo-en-paralelo-con-agentes]]"]
---

## Problema

Tienes tres features terminadas, cada una en su [[glosario/worktree|worktree]] ([[recetas/features-en-paralelo-con-worktrees]]). Por separado, todas pasaron su verificación. Ahora hay que juntarlas en `develop`, y aparecen los problemas: las tres añadieron una línea al mismo registro de rutas, dos tocaron el lockfile, el archivo de seguimiento de tareas choca en cada integración y, peor, dos features que funcionaban solas fallan juntas.

La integración del autor sigue un procedimiento fijo, recogido en su `ola.sh integrar`: **una feature cada vez, squash, lo mecánico se resuelve solo, lo demás a mano y `verify.sh` en verde antes del commit**. Si algo falla, se aborta y la rama de integración queda exactamente como estaba. Esta receta lo reduce a un script.

## Ingredientes

- Git y Bash 4 o superior.
- Un `verify.sh` con la regresión completa ([[recetas/un-verify-para-toda-la-regresion]]).
- Features terminadas en ramas `wt/<id>` con su trabajo commiteado, y el árbol principal en la rama de integración y limpio.

## Pasos

1. **Integra de una en una, en un orden.** Primero la ruta crítica o la que cambia algo compartido. No empieces la siguiente hasta que la anterior tenga su commit: si fallan dos juntas, ya no sabrás de quién es el fallo.

2. **Usa squash.** `git merge --squash --no-commit wt/app-101` aplica todos los cambios de la rama como cambios preparados, sin commit. Ganas un commit por feature en la rama de integración, con un mensaje que cita su ID, y control total antes de confirmar. El precio: un squash no deja `MERGE_HEAD`, así que `git merge --abort` no sirve; para deshacer, `git reset --hard HEAD` sobre un árbol que estaba limpio.

3. **Resuelve lo mecánico sin preguntar.** Hay conflictos que tienen una única respuesta correcta y se repiten en cada integración:

| Dónde | Por qué choca | Cómo se resuelve |
| --- | --- | --- |
| Registro de tareas (`feature_list.json`) | Cada feature cambia su estado y añade seguimientos al final | Automático: unión por ID, gana el estado más avanzado |
| Lockfiles (`*.lock`, `pnpm-lock.yaml`, `uv.lock`…) | Dos features añaden dependencias | Nunca a mano: lado de la rama de integración y regenerar |
| Código generado (clientes, tipos, bindings) | Cada feature lo regenera | Nunca a mano: lado de la rama y su generador tras integrar |
| Manifiestos (`package.json`, `pyproject.toml`) | Dependencias nuevas en las dos | Conserva las dos líneas |
| Registros (rutas, comandos, errores, textos) | Cada feature registra lo suyo | Conserva las dos entradas |
| Migraciones de base de datos | Las dos añaden «la siguiente» | Primero la de la rama, después la nueva con el número siguiente |

   Las dos primeras filas las hace el script; las demás son a mano (o pidiéndoselo al agente del árbol principal con esta tabla y la orden de no cambiar comportamiento).

4. **Regenera, comprueba marcas y verifica.** Tras resolver, ejecuta los pasos que dependen de lo que cambió (si cambió el manifiesto, regenerar el lockfile), rechaza cualquier marca `<<<<<<<` que quede y pasa `verify.sh`. Solo con todo en verde te propone el commit, que haces tú.

```bash title="scripts/integrar.sh"
#!/usr/bin/env bash
# integrar.sh — lleva UNA feature de su rama wt/<id> a la rama de integración con un squash.
#   bash scripts/integrar.sh APP-101         squash, resuelve lo mecánico, regenera, verify
#   bash scripts/integrar.sh --continuar     tras resolver a mano los conflictos que queden
#   bash scripts/integrar.sh --abortar       deja la rama de integración como estaba
# Nunca hace commit ni push: te deja el comando.
set -Eeuo pipefail

RAMA="${OLA_RAMA:-develop}"
AUTO_RAMA=("*.lock" "package-lock.json" "pnpm-lock.yaml" "uv.lock")   # se toman de la rama y se regeneran
TRAS_INTEGRAR=(                                                         # «regex de archivos :: comando»
  '(^|/)deps\.txt$ :: python3 tools/lock.py'
)
VERIFY="bash scripts/verify.sh"

die() { echo "✗ $*" >&2; exit 1; }
cd "$(git rev-parse --show-toplevel)"
MARCA="$(git rev-parse --absolute-git-dir)/integrando"

resolver_mecanico() {
  local f
  while IFS= read -r f; do
    if [ "$f" = feature_list.json ]; then
      # Registro con una entrada por feature: unión por ID (gana el estado más avanzado)
      python3 - "$f" <<'PY'
import json, subprocess, sys
ruta = sys.argv[1]
lado = lambda n: json.loads(subprocess.run(["git", "show", f":{n}:{ruta}"], check=True, capture_output=True, text=True).stdout)
nuestro, suyo = lado(2), lado(3)
orden = {"done": 2, "cancelled": 1}
por_id = {f["id"]: f for f in nuestro["features"]}
for f in suyo["features"]:
    if f["id"] not in por_id or orden.get(f.get("status"), 0) > orden.get(por_id[f["id"]].get("status"), 0):
        por_id[f["id"]] = f
nuestro["features"] = list(por_id.values())
open(ruta, "w", encoding="utf-8").write(json.dumps(nuestro, ensure_ascii=False, indent=2) + "\n")
PY
      git add -- "$f"; echo "→ auto: $f (unión por ID)"
    else
      for patron in "${AUTO_RAMA[@]}"; do
        # shellcheck disable=SC2254
        case "$f" in $patron) git checkout --ours -- "$f"; git add -- "$f"; echo "→ auto: $f (lado de $RAMA; se regenera)"; break ;; esac
      done
    fi
  done < <(git diff --name-only --diff-filter=U)
}

rematar() {   # sin conflictos pendientes: regenerar, comprobar marcas, verify
  local id="$1" cambiados paso
  cambiados="$(git diff --cached --name-only; git diff --name-only "HEAD...wt/${id,,}")"
  for paso in "${TRAS_INTEGRAR[@]}"; do
    if grep -qE "${paso%% :: *}" <<<"$cambiados"; then echo "→ ${paso#* :: }"; bash -c "${paso#* :: }"; fi
  done
  git add -A
  if git diff --cached -U0 | grep -qE '^\+(<<<<<<<|>>>>>>>)( |$)'; then die "quedan marcas de conflicto: resuélvelas y --continuar"; fi
  echo "→ $VERIFY"
  if ! $VERIFY; then
    echo "✗ verify falla con $id integrada. Sin commit. Opciones:"
    echo "   a) conflicto mal resuelto: corrígelo y «integrar.sh --continuar»"
    echo "   b) incompatibilidad real: «integrar.sh --abortar» y registra un bug con este log"
    exit 1
  fi
  echo "✓ $id integrada y en verde. Haz tú el commit:"
  echo "   git commit -m \"feat: $id <resumen>\" && bash scripts/ola.sh cerrar $id"
  rm -f "$MARCA"
}

case "${1:-}" in
  --continuar)
    [ -f "$MARCA" ] || die "no hay ninguna integración a medias"
    for f in $(git diff --name-only --diff-filter=U); do
      ! grep -qE '^(<<<<<<<|>>>>>>>)( |$)' "$f" || die "$f todavía tiene marcas de conflicto"
      git add -- "$f"
    done
    rematar "$(cat "$MARCA")"; exit 0 ;;
  --abortar)
    [ -f "$MARCA" ] || die "no hay ninguna integración a medias"
    git reset -q --hard HEAD && rm -f "$MARCA"   # un squash no deja MERGE_HEAD: «git merge --abort» no sirve
    echo "✓ integración deshecha; $RAMA queda como estaba"; exit 0 ;;
  "") die "uso: integrar.sh ID | --continuar | --abortar" ;;
esac

id="$1"
[ ! -f "$MARCA" ] || die "hay una integración a medias de $(cat "$MARCA"): --continuar o --abortar"
[ "$(git branch --show-current)" = "$RAMA" ] || die "el árbol principal tiene que estar en $RAMA"
[ -z "$(git status --porcelain)" ] || die "el árbol principal tiene cambios sin commit"
git show-ref --verify --quiet "refs/heads/wt/${id,,}" || die "no existe la rama wt/${id,,}"

echo "$id" > "$MARCA"
echo "→ git merge --squash wt/${id,,}"
if git merge --squash --no-commit "wt/${id,,}" >/dev/null 2>&1; then rematar "$id"; exit 0; fi
echo "→ hay conflictos; resuelvo los mecánicos"
resolver_mecanico
quedan="$(git diff --name-only --diff-filter=U)"
[ -n "$quedan" ] || { rematar "$id"; exit 0; }
echo "! quedan conflictos a mano (en registros, conserva las dos entradas):"
echo "$quedan" | sed 's/^/     /'
echo "  Después: bash scripts/integrar.sh --continuar   ·   Para dejarlo: --abortar"
exit 2
```

   Adapta la ruta del registro (en el harness del autor es `.claude/feature_list.json` y el estado final se llama `archived`), los patrones de `AUTO_RAMA` y los pasos de `TRAS_INTEGRAR` a tu proyecto.

5. **Si `verify.sh` falla con la feature integrada, no lo arregles encima.** Dos opciones: si fue un conflicto mal resuelto, corrígelo y `--continuar`; si es una incompatibilidad real entre features, `--abortar`, registra un bug en la rama de integración con el log y no integres nada más hasta arreglarlo.

## Cómo comprobar que funciona

Probado en un repositorio temporal con tres ramas: APP-101 añade `rich` y la ruta `pedidos`, APP-102 añade `s3fs` y la ruta `facturas` (las dos al final de los mismos archivos) y APP-106 añade una ruta que rompe `verify.sh`. El lockfile se regenera con `tools/lock.py`.

```text
$ bash scripts/integrar.sh APP-101
→ git merge --squash wt/app-101
→ python3 tools/lock.py
→ bash scripts/verify.sh
verify OK
✓ APP-101 integrada y en verde. Haz tú el commit:
   git commit -m "feat: APP-101 <resumen>" && bash scripts/ola.sh cerrar APP-101
$ git commit -qm "feat: APP-101 pedidos"
$ bash scripts/integrar.sh APP-102; echo "exit=$?"
→ git merge --squash wt/app-102
→ hay conflictos; resuelvo los mecánicos
→ auto: deps.lock (lado de develop; se regenera)
→ auto: feature_list.json (unión por ID)
! quedan conflictos a mano (en registros, conserva las dos entradas):
     deps.txt
     rutas.txt
  Después: bash scripts/integrar.sh --continuar   ·   Para dejarlo: --abortar
exit=2
$ cat rutas.txt
inicio
ajustes
<<<<<<< HEAD
pedidos
=======
facturas
>>>>>>> wt/app-102
$ bash scripts/integrar.sh --continuar      # con deps.txt todavía sin resolver
✗ deps.txt todavía tiene marcas de conflicto
$ bash scripts/integrar.sh --continuar      # resueltos: las dos líneas en cada archivo
→ python3 tools/lock.py
→ bash scripts/verify.sh
verify OK
✓ APP-102 integrada y en verde. Haz tú el commit:
   git commit -m "feat: APP-102 <resumen>" && bash scripts/ola.sh cerrar APP-102
$ cat deps.lock
requests sha256:ec72420df5df
rich sha256:7baa68f2418b
s3fs sha256:8de409c427f2
$ git commit -qm "feat: APP-102 facturas"
$ bash scripts/integrar.sh APP-106; echo "exit=$?"
→ git merge --squash wt/app-106
→ bash scripts/verify.sh
ruta rota
✗ verify falla con APP-106 integrada. Sin commit. Opciones:
   a) conflicto mal resuelto: corrígelo y «integrar.sh --continuar»
   b) incompatibilidad real: «integrar.sh --abortar» y registra un bug con este log
exit=1
$ git merge --abort
fatal: There is no merge to abort (MERGE_HEAD missing).
$ bash scripts/integrar.sh --abortar
✓ integración deshecha; develop queda como estaba
$ git log --oneline
f7f10ff feat: APP-102 facturas
6ca0a9b feat: APP-101 pedidos
aeec91b chore: base
```

El registro de tareas quedó con las cuatro entradas (las dos features en `done` y los dos seguimientos que añadieron) y el lockfile, regenerado con las dependencias de ambas.

## Variaciones

- **Commit con confirmación.** El script del autor lee el mensaje sugerido por el revisor en el archivo de cierre de la feature y pregunta si hace el commit y el push; si lo lanza Claude Code (variable `CLAUDECODE`) o no hay terminal, siempre contesta que no e imprime el comando para que lo ejecute la persona.
- **Commit del worktree.** Si la rama de la feature tiene cambios sin commit (lo normal al terminar, porque el agente no hace commits), el script del autor ofrece commitearlos allí antes del squash.
- **Rebase en lugar de squash.** Conserva los commits de la feature, pero los agentes suelen dejar historiales ruidosos; el squash con un mensaje revisado da un historial legible y un commit que revertir por feature.
- **Las otras features no necesitan rebase.** Sus conflictos se resuelven cuando les toca integrarse; rebasar todas tras cada integración multiplica el trabajo.

## Errores típicos

- **Integrar dos a la vez.** Si `verify.sh` falla, no sabes cuál de las dos lo rompió. Una cada vez.
- **Resolver lockfiles a mano.** Un lockfile fusionado a mano parece correcto y no lo es. Lado de la rama y regenerar.
- **Arreglar encima el fallo de integración.** Mezclas el arreglo con el squash y pierdes la trazabilidad. Aborta, registra el bug y arréglalo como una tarea más.
- **`git merge --abort` tras un squash.** No hay merge que abortar. Usa `--abortar` (o `git reset --hard HEAD` sobre un árbol que estaba limpio).
- **Integrar con el árbol principal sucio.** El reset del aborto se llevaría por delante cambios ajenos. El script se niega a empezar si hay cambios sin commit.
- **Paralelizar features que tocan el mismo formato de datos.** Ningún script resuelve eso: planifica las olas para que no coincidan ([[plantillas/plan-de-olas]], [[problemas/conflictos-al-integrar-en-paralelo]]).
