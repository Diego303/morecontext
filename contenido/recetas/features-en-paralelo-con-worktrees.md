---
titulo: Features en paralelo con git worktrees
descripcion: Abre un worktree y una rama temporal por feature, arranca una sesión de agente por ventana de tmux, copia los ajustes locales y vigila el estado con una versión reducida del script de olas del autor.
creado: 2026-10-29
nivel: avanzado
minutos: 35
tema: agentes
stack: ["Git", "tmux", "Bash"]
tags: [paralelo, worktrees, git, tmux, claude-code]
relacionados: ["[[cursos/harness-engineering/13-features-en-paralelo-con-olas]]", "[[recetas/integrar-features-en-paralelo]]", "[[disciplinas/trabajo-en-paralelo-con-agentes]]", "[[glosario/worktree]]", "[[sistemas/harness-sdd-olas]]"]
---

## Problema

Tienes cuatro features independientes y un agente que tarda una hora en cada una. Quieres lanzarlas a la vez. Si las pones en el mismo árbol de trabajo, se rompen tres cosas: el revisor de una ve en su `git diff` el código de las otras, la regresión de una falla por el código a medias de otra y, si tu harness guarda estado en archivos compartidos, dos procesos pueden pisarse una escritura ([[blog/2026-10-25-tres-cosas-que-se-rompen-sin-worktrees]]).

Un [[glosario/worktree|worktree]] de git es otra carpeta de trabajo del mismo repositorio, con su propia rama. Cada feature en su worktree y con su propia sesión de agente se comporta como si fuera la única. El autor lo llama trabajar por [[glosario/ola|olas]] y lo automatiza con `scripts/ola.sh`; esta receta es una versión reducida de sus órdenes `abrir`, `estado` y `cerrar`. La integración tiene su propia receta: [[recetas/integrar-features-en-paralelo]].

## Ingredientes

- Git 2.5 o superior (los worktrees) y Bash 4 o superior. El script usa `realpath -m` de GNU coreutils: en macOS instala `coreutils` o sustituye esa línea.
- tmux, opcional pero cómodo: una ventana por feature.
- Claude Code (o el agente que uses) instalado en la terminal.
- Una rama de integración (`develop` en el ejemplo) y features **sin dependencias pendientes entre sí** ([[plantillas/plan-de-olas]]).

## Pasos

1. **Aprende los cuatro comandos de git que lo sostienen.** Todo lo demás es comodidad:

```bash
git worktree add -b wt/app-101 ~/app-wt/app-101 develop   # carpeta nueva + rama temporal desde develop
git worktree list                                         # el primero es siempre el árbol principal
git worktree remove --force ~/app-wt/app-101              # borra la carpeta (y lo que no esté commiteado)
git branch -D wt/app-101                                  # borra la rama temporal
```

2. **Fija las reglas.** El árbol principal se queda en la rama de integración, limpio, y **solo integra**: no se construye nada en él mientras haya worktrees abiertos. Una feature por worktree y por sesión. Un máximo de features abiertas (el autor usa 4 por defecto; con poca RAM, 2 o 3). Los worktrees van **fuera** del repo (`~/<repo>-wt/`), para que ni git ni las herramientas del proyecto los recorran.

3. **Escribe el script.** `abrir` crea el worktree (o lo reutiliza si existe, o lo recrea sobre la rama si borraste la carpeta), copia lo que git no versiona y la sesión necesita (`.claude/settings.local.json`), instala dependencias si lo configuras y abre una ventana de tmux por feature con el agente ya lanzado y un prompt que lo ata a esa feature. `estado` resume cada worktree. `cerrar` se niega a borrar trabajo que no esté integrado.

```bash title="scripts/ola.sh"
#!/usr/bin/env bash
# ola.sh — una feature por worktree, cada una con su sesión de agente en una ventana de tmux.
#   bash scripts/ola.sh abrir APP-101 APP-102   worktree + rama wt/<id> + ventana con su sesión
#   bash scripts/ola.sh estado                  qué hay abierto y qué falta
#   bash scripts/ola.sh cerrar APP-101          borra ventana, worktree y rama (si ya está integrada)
set -Eeuo pipefail

RAMA="${OLA_RAMA:-develop}"            # rama de integración: el árbol principal vive en ella
MAX="${OLA_MAX:-4}"                    # features abiertas a la vez
AGENTE="${OLA_AGENTE:-claude}"         # comando que arranca la sesión en cada ventana
INSTALAR="${OLA_INSTALAR:-}"           # p. ej. "pnpm install --frozen-lockfile"

die() { echo "✗ $*" >&2; exit 1; }
ROOT="$(git worktree list --porcelain | sed -n '1s/^worktree //p')"   # el primero es siempre el principal
cd "$ROOT"
REPO="$(basename "$ROOT")"
WT_DIR="$(realpath -m "${OLA_DIR:-$HOME/$REPO-wt}")"
TMUX_SESION="$REPO-olas"
case "$WT_DIR/" in "$ROOT"/*) die "los worktrees no pueden ir dentro del repo";; esac

slug()   { echo "${1,,}"; }
ruta()   { echo "$WT_DIR/$(slug "$1")"; }
rama()   { echo "wt/$(slug "$1")"; }
abiertas() { git worktree list --porcelain | sed -n 's/^worktree //p' | grep -c "^$WT_DIR/" || true; }
ventana() { tmux list-windows -t "$TMUX_SESION" -F '#W' 2>/dev/null | grep -qxF "$1"; }
prompt() {
  echo "Esta sesión trabaja en el worktree $(rama "$1") y solo lleva $1. Construye solo esta feature." \
       "No crees ramas ni hagas commits. Al terminar, dame el mensaje de commit sugerido y para."
}

abrir() {
  [ $# -ge 1 ] || die "abrir ID [ID...]"
  git show-ref --verify --quiet "refs/heads/$RAMA" || die "no existe la rama $RAMA"
  [ $(( $(abiertas) + $# )) -le "$MAX" ] || die "quedarían más de $MAX features abiertas"
  mkdir -p "$WT_DIR"; git worktree prune
  local id p r
  for id in "$@"; do
    [[ "$id" =~ ^[A-Z][A-Z0-9]*(-[A-Z0-9]+)*-[0-9]+$ ]] || die "ID no válido: $id"
    p="$(ruta "$id")"; r="$(rama "$id")"
    if git worktree list --porcelain | grep -qxF "worktree $p"; then echo "→ $id: el worktree ya existe; lo reutilizo"
    elif git show-ref --verify --quiet "refs/heads/$r"; then git worktree add -q "$p" "$r"; echo "→ $id: worktree recreado sobre $r"
    else git worktree add -q -b "$r" "$p" "$RAMA"; echo "→ $id: worktree $p (rama $r desde $RAMA)"; fi
    # Lo que git no versiona y la sesión necesita: ajustes locales de Claude Code
    if [ -f .claude/settings.local.json ] && [ ! -f "$p/.claude/settings.local.json" ]; then
      mkdir -p "$p/.claude" && cp .claude/settings.local.json "$p/.claude/"
    fi
    [ -z "$INSTALAR" ] || (cd "$p" && bash -c "$INSTALAR") || die "$id: falló la instalación; arregla y repite abrir"
  done
  if command -v tmux >/dev/null; then
    tmux has-session -t "$TMUX_SESION" 2>/dev/null || tmux new-session -d -s "$TMUX_SESION" -n integrar -c "$ROOT"
    for id in "$@"; do
      ventana "$(slug "$id")" && { echo "→ $id: ya tiene ventana"; continue; }
      tmux new-window -d -t "$TMUX_SESION:" -n "$(slug "$id")" -c "$(ruta "$id")"
      tmux send-keys -t "$TMUX_SESION:$(slug "$id")" -l "$AGENTE $(printf '%q' "$(prompt "$id")")"
      tmux send-keys -t "$TMUX_SESION:$(slug "$id")" Enter
      echo "✓ $id: sesión abierta en la ventana «$(slug "$id")»"
    done
    echo "Entra con: tmux attach -t $TMUX_SESION   (Ctrl+b w elige ventana · Ctrl+b d sale sin cerrar)"
  else
    for id in "$@"; do echo "  cd $(ruta "$id") && $AGENTE $(printf '%q' "$(prompt "$id")")"; done
  fi
}

estado() {
  echo "Árbol principal: $ROOT ($(git branch --show-current)), $(git status --porcelain | wc -l) cambios sin commit"
  local p id hay=0
  while read -r p; do
    case "$p" in "$WT_DIR"/*) ;; *) continue ;; esac
    hay=1; id="${p##*/}"; id="${id^^}"
    printf '%s  commits sin integrar: %s · cambios sin commit: %s · ventana: %s\n' "$id" \
      "$(git rev-list --count "$RAMA..$(rama "$id")")" "$(git -C "$p" status --porcelain | wc -l)" \
      "$(ventana "$(slug "$id")" && echo sí || echo no)"
  done < <(git worktree list --porcelain | sed -n 's/^worktree //p')
  [ "$hay" = 1 ] || echo "No hay features abiertas en $WT_DIR"
}

cerrar() {
  [ $# -ge 1 ] || die "cerrar ID [--forzar]"
  local id="$1" p r; p="$(ruta "$id")"; r="$(rama "$id")"
  # Integrada = hay un commit en la rama de integración que cita el ID (el squash lo lleva en el mensaje)
  if [ -z "$(git log "$RAMA" -F --grep="$id" -1 --format=%h)" ] && [ "${2:-}" != "--forzar" ]; then
    die "$id no aparece en ningún commit de $RAMA: su trabajo se perdería (cerrar $id --forzar si es lo que quieres)"
  fi
  ! ventana "$(slug "$id")" || tmux kill-window -t "$TMUX_SESION:$(slug "$id")"
  git worktree remove --force "$p" 2>/dev/null || { rm -rf "$p"; git worktree prune; }
  git branch -D "$r" >/dev/null 2>&1 || true
  echo "✓ $id cerrada (ventana, worktree y rama $r)"
}

orden="${1:-}"; shift || true
case "$orden" in
  abrir) abrir "$@" ;; estado) estado ;; cerrar) cerrar "$@" ;;
  *) die "uso: ola.sh abrir ID... | estado | cerrar ID" ;;
esac
```

   Para saber si una feature está integrada, esta versión busca su ID en los mensajes de commit de la rama de integración: el squash de la integración lo lleva («feat: APP-102 …»). El autor lo comprueba en el estado de la feature dentro del repo, pero la idea es la misma: nunca borres una rama sin una prueba de que su trabajo ya está a salvo.

4. **Abre la ola y trabaja.** Desde el árbol principal: `bash scripts/ola.sh abrir APP-101 APP-102` y `tmux attach -t app-olas`. Cada ventana es una sesión normal; las decisiones humanas (aprobar la spec, decidir un bloqueo) se toman en la ventana de su feature. `Ctrl+b w` elige ventana y `Ctrl+b d` sale sin cerrar nada: las sesiones siguen vivas.

5. **Vigila y cierra.** `estado` te dice qué tiene cambios sin commit (lo normal mientras el agente trabaja) y qué tiene commits sin integrar. Tras integrar una feature, `cerrar` libera su hueco y puedes abrir la siguiente cuyas dependencias ya estén integradas.

## Cómo comprobar que funciona

Probado en un repositorio temporal con `OLA_AGENTE=echo` (en lugar de lanzar Claude Code, cada ventana imprime el prompt) y `OLA_DIR` apuntando a una carpeta de prueba; `~` sustituye a esa ruta:

```text
$ bash scripts/ola.sh abrir APP-101 APP-102
→ APP-101: worktree ~/app-wt/app-101 (rama wt/app-101 desde develop)
→ APP-102: worktree ~/app-wt/app-102 (rama wt/app-102 desde develop)
✓ APP-101: sesión abierta en la ventana «app-101»
✓ APP-102: sesión abierta en la ventana «app-102»
Entra con: tmux attach -t app-olas   (Ctrl+b w elige ventana · Ctrl+b d sale sin cerrar)
$ git worktree list
~/app             45a3d87 [develop]
~/app-wt/app-101  45a3d87 [wt/app-101]
~/app-wt/app-102  45a3d87 [wt/app-102]
$ ls ~/app-wt/app-101/.claude
settings.local.json
$ bash scripts/ola.sh estado
Árbol principal: ~/app (develop), 0 cambios sin commit
APP-101  commits sin integrar: 0 · cambios sin commit: 1 · ventana: sí
APP-102  commits sin integrar: 1 · cambios sin commit: 0 · ventana: sí
$ bash scripts/ola.sh cerrar APP-102
✗ APP-102 no aparece en ningún commit de develop: su trabajo se perdería (cerrar APP-102 --forzar si es lo que quieres)
$ bash scripts/ola.sh abrir APP-1O3
✗ ID no válido: APP-1O3
$ git merge --squash wt/app-102 && git commit -m 'feat: APP-102 nuevo archivo'
$ bash scripts/ola.sh cerrar APP-102
✓ APP-102 cerrada (ventana, worktree y rama wt/app-102)
$ bash scripts/ola.sh cerrar APP-101 --forzar
✓ APP-101 cerrada (ventana, worktree y rama wt/app-101)
$ bash scripts/ola.sh estado
Árbol principal: ~/app (develop), 0 cambios sin commit
No hay features abiertas en ~/app-wt
```

La primera versión de este script falló en la prueba: en ese repo `.claude/` solo contenía `settings.local.json`, que no se versiona, así que el worktree no tenía carpeta `.claude` y la copia fallaba. De ahí el `mkdir -p` antes del `cp`.

## Variaciones

- **Dependencias implícitas.** Antes de abrir, el script del autor comprueba que todas las dependencias de cada feature (las declaradas en sus notas, «depende de: APP-101», y las implícitas de su plan) ya están integradas, y que la feature sigue sin empezar en la rama de integración y en el árbol principal.
- **Instalar antes de la ola.** Si varias features necesitan paquetes nuevos, instálalos una vez en la rama de integración antes de abrir: evitas casi todos los conflictos de lockfiles al integrar.
- **Sin tmux.** El script imprime el comando de cada sesión para que lo pegues en una terminal por feature.
- **Worktrees de Claude Code.** Claude Code trae su propio soporte de worktrees (la opción `--worktree` y `isolation: worktree` en subagentes). Sirve para aislar una sesión o un subagente; un script propio te da control sobre nombres, ramas, límites e integración ([[docs/claude-code/02-subagentes]]).
- **Coordinar desde una sesión.** El autor tiene una skill en la sesión del árbol principal que lanza estas órdenes, pero nunca hace commits, push ni descartes: el script lo detecta (`CLAUDECODE`) y le devuelve el comando para que lo lance la persona.

## Errores típicos

- **Worktrees dentro del repo.** Los linters, los tests y el propio agente los recorren como si fueran código del proyecto.
- **Construir en el árbol principal con worktrees abiertos.** Vuelves a tener dos features en el mismo árbol, justo lo que querías evitar.
- **Olvidar lo que no se versiona.** Ajustes locales, `.env` de desarrollo, dependencias instaladas: cada worktree empieza sin ellos. Copia los ajustes y configura la instalación.
- **La carpeta de confianza.** La primera vez que Claude Code se abre en cada worktree pregunta si confías en la carpeta (es una ruta nueva). Hasta que respondas en esa ventana, la sesión no arranca.
- **Demasiadas a la vez.** El límite real es tu atención: cada feature pide su aprobación y su integración. Si las pruebas empiezan a agotar el tiempo por la carga, baja el número.
- **Borrar la carpeta a mano.** Si lo haces, `git worktree prune` limpia el registro; si la rama tenía trabajo, `abrir` la recrea sin perder commits. En WSL, si mueves el repo, `git worktree repair`.
