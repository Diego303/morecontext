---
titulo: Un solo verify.sh para toda la regresión
descripcion: Un script que ejecuta sintaxis, lint, tipos y tests del proyecto con salida clara y un único código de salida, para que lo usen igual el agente, la aceptación, la CI y la integración.
creado: 2026-10-29
nivel: inicial
minutos: 15
tema: evals
stack: ["Bash"]
tags: [verificacion, regresion, ci, bash, harness]
relacionados: ["[[disciplinas/verificar-antes-de-dar-por-hecho]]", "[[recetas/criterios-de-aceptacion-ejecutables]]", "[[recetas/integrar-features-en-paralelo]]", "[[recetas/evals-de-regresion-en-ci]]", "[[cursos/harness-engineering/12-probar-y-evolucionar-el-harness]]"]
---

## Problema

El agente dice «tests en verde», pero ejecutó `pytest tests/test_nuevo.py`, no la suite. La CI usa `npm run ci`, tú en local `make check` y la persona que integra se salta el lint porque tarda. Cada uno verifica una cosa distinta y llamáis a todo «la regresión».

La solución del harness del autor es aburrida a propósito: **un solo script, `verify.sh`, que ejecuta la regresión completa y devuelve un único código de salida**. Lo usan el agente antes de decir «hecho», el check obligatorio de cada [[recetas/criterios-de-aceptacion-ejecutables|aceptación]], la CI y el paso de integración cuando trabajas [[recetas/features-en-paralelo-con-worktrees|en paralelo]]. Si pasa, está en verde para todos.

## Ingredientes

- Bash 4 o superior.
- Los comandos de verificación de tu proyecto (los mismos que la CI).
- Un proyecto de ejemplo: aquí, Python con `src/` y `tests/` y solo la biblioteca estándar.

## Pasos

1. **Lista los pasos de verdad.** Los mismos de tu CI, en orden de rapidez: sintaxis o compilación, lint, tipos, tests. Sin `--fix` ni formateadores que reescriben (verificar no cambia archivos) y sin `|| true`.

2. **Escribe el script.** Cuatro decisiones:
   - Se ejecuta **desde la raíz**, se llame desde donde se llame (`cd "$(dirname "$0")/.."`).
   - **Ejecuta todos los pasos** aunque falle uno, para ver todos los problemas en una pasada. Al final, un único código: 0 si todo pasa.
   - **Salida corta y clara**: una línea por paso con ✓ o ✗ y tiempo, y solo la cola de la salida de lo que falla. Un agente con 3.000 líneas de log en el contexto pierde el hilo.
   - **Sin configurar es un error.** Si no hay pasos, sale con 2: un `verify.sh` vacío que devuelve 0 da por buena cualquier cosa. El autor deja una marca en la plantilla y su validador avisa mientras exista.

```bash title="scripts/verify.sh"
#!/usr/bin/env bash
# verify.sh — la regresión completa del proyecto en un solo comando.
# La usan el agente antes de decir «hecho», los criterios de aceptación, la CI y la integración.
# Exit 0: todo en verde · 1: algún paso falla · 2: sin configurar.
set -uo pipefail

cd "$(dirname "$0")/.."   # siempre desde la raíz, se llame desde donde se llame

# Un paso por línea: «nombre::comando». Los mismos comandos que la CI, sin --fix ni || true.
PASOS=(
  "sintaxis::python3 -m compileall -q src tests"
  "tests::python3 -m unittest discover -s tests -q"
  # "lint::ruff check ."
  # "tipos::mypy src"
)

[ ${#PASOS[@]} -gt 0 ] || { echo "verify.sh sin configurar: añade los pasos del proyecto"; exit 2; }

fallos=()
for paso in "${PASOS[@]}"; do
  nombre="${paso%%::*}"; comando="${paso#*::}"
  inicio=$SECONDS
  if salida="$(bash -c "$comando" 2>&1 </dev/null)"; then
    printf '✓ %-10s %3ss\n' "$nombre" "$((SECONDS - inicio))"
  else
    codigo=$?
    printf '✗ %-10s %3ss  (exit %s: %s)\n' "$nombre" "$((SECONDS - inicio))" "$codigo" "$comando"
    printf '%s\n' "$salida" | tail -n 20 | sed 's/^/    │ /'   # solo la cola: lo útil para arreglar
    fallos+=("$nombre")
  fi
done

if [ ${#fallos[@]} -gt 0 ]; then
  echo "VERIFY FALLA: ${fallos[*]}"
  exit 1
fi
echo "VERIFY OK"
```

3. **Úsalo en todas partes.** Las cuatro llamadas son el mismo comando:

   - El agente: en tus instrucciones (`AGENTS.md` o `CLAUDE.md`), «antes de decir que algo está hecho, ejecuta `bash scripts/verify.sh` y pega el resumen» ([[disciplinas/verificar-antes-de-dar-por-hecho]]).
   - La aceptación: un check obligatorio en cada `acceptance.yaml`.

```yaml title="acceptance.yaml (fragmento)"
  - id: AC-001
    title: La regresión del proyecto sigue pasando
    covers: [NFR-01]
    kind: command
    required: true
    command: bash scripts/verify.sh
    timeout_seconds: 600
    expected_exit_code: 0
```

   - La CI: un paso que llama al script, sin repetir los comandos en el YAML.

```yaml title=".github/workflows/verify.yml"
name: verify
on: [pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/verify.sh
```

   - La integración: tras cada squash de una feature, `verify.sh` en verde antes de hacer commit ([[recetas/integrar-features-en-paralelo]]).

4. **Permítelo sin preguntar.** En Claude Code, preaprueba exactamente ese comando para que el agente lo ejecute a menudo: `"allow": ["Bash(bash scripts/verify.sh)"]` en `.claude/settings.json`. El autor lo pone además en la lista de comandos que sus [[glosario/subagente|subagentes]] de solo lectura sí pueden ejecutar.

## Cómo comprobar que funciona

Con el proyecto en verde:

```text
$ bash scripts/verify.sh; echo "exit=$?"
✓ sintaxis     0s
✓ tests        0s
VERIFY OK
exit=0
```

Con un error introducido a propósito (el descuento suma en vez de restar), llamado desde una subcarpeta:

```text
$ cd src && bash ../scripts/verify.sh; echo "exit=$?"
✓ sintaxis     0s
✗ tests        1s  (exit 1: python3 -m unittest discover -s tests -q)
    │ ======================================================================
    │ FAIL: test_descuento (test_calculo.Total.test_descuento)
    │ ----------------------------------------------------------------------
    │ Traceback (most recent call last):
    │   File "…/proyecto/tests/test_calculo.py", line 11, in test_descuento
    │     self.assertEqual(18.0, total([10, 10], descuento=0.1))
    │     ~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    │ AssertionError: 18.0 != 22.0
    │ 
    │ ----------------------------------------------------------------------
    │ Ran 1 test in 0.001s
    │ 
    │ FAILED (failures=1)
VERIFY FALLA: tests
exit=1
```

Con una herramienta que no está instalada y sin pasos configurados:

```text
$ bash scripts/verify.sh; echo "exit=$?"
✓ sintaxis     0s
✓ tests        1s
✗ lint         0s  (exit 127: ruff-que-no-existe check .)
    │ bash: line 1: ruff-que-no-existe: command not found
VERIFY FALLA: lint
exit=1
$ bash scripts/verify.sh; echo "exit=$?"     # con PASOS vacío
verify.sh sin configurar: añade los pasos del proyecto
exit=2
```

## Variaciones

- **Modo rápido.** Un `--rapido` que pare en el primer fallo, para el ciclo corto del agente; la CI y la integración usan el completo.
- **Monorepo.** Un paso por paquete afectado, calculado con `git diff --name-only` contra la rama base. Mantén un modo completo para la integración.
- **Pruebas que no se pisan.** Si las suites usan puertos o bases de datos fijas, dos `verify.sh` a la vez (dos worktrees) chocan. Parametriza el puerto o ejecuta una E2E cada vez.
- **Make o just.** Si tu proyecto ya tiene `make check`, `verify.sh` puede ser una línea que lo llama. Lo importante es que haya un único punto de entrada y que todos lo usen.

## Errores típicos

- **Saltar pasos lentos «solo esta vez».** Si el lint tarda, arréglalo; no lo saques del script.
- **Tragarse los fallos.** `pytest || true` o un `set +e` olvidado convierten el script en un sello de goma. El harness del autor rechaza los comandos de aceptación con `|| true`.
- **Salida kilométrica.** El agente lee todo lo que imprimes. Cola de lo que falla y resumen.
- **Herramienta ausente que pasa.** Si un paso no encuentra su herramienta, es un fallo (exit 127), no un «no aplica». Si el problema es el entorno, dilo como bloqueo, no como verde.
- **Que la CI y el script diverjan.** Si la CI tiene sus propios comandos, en un mes no coincidirán. La CI llama al script.
