---
titulo: Especializa el harness para tu proyecto
descripcion: Proyecto final del curso, del diseño técnico a un harness especializado, con AGENTS.md y verify.sh reales, backlog con dependencias, olas, especialistas y skills de dominio, usando el prompt de plan del autor.
creado: 2026-10-29
orden: 14
minutos: 60
tipo: proyecto
objetivos:
  - Adaptar el harness base a un repositorio real con AGENTS.md observable, verify.sh estricto y regresión obligatoria
  - Usar el prompt de plan de implementación para convertir un diseño técnico en plan por grupos, backlog con dependencias, olas y harness especializado
  - Revisar el resultado con el validador, los tests y un test de coherencia antes de construir la primera feature
requiere: ["[[cursos/harness-engineering/12-probar-y-evolucionar-el-harness]]", "[[cursos/harness-engineering/13-features-en-paralelo-con-olas]]"]
relacionados: ["[[plantillas/prompt-plan-de-implementacion]]", "[[plantillas/agents-md]]", "[[plantillas/plan-de-olas]]", "[[sistemas/harness-sdd-claude-code]]"]
tags: [harness, claude-code, proyecto, especializacion, plan]
---

Este es el proyecto final del curso. Vas a llevar el harness de base genérica a herramienta de tu proyecto: primero lo mínimo que necesita cualquier repositorio (reglas y regresión de verdad) y después, si el proyecto es grande, el plan completo con backlog, olas y agentes de dominio que genera el prompt de plan de implementación del autor. Terminarás con una feature archivada por ese harness.

## La idea

El núcleo del harness no sabe nada de tu stack, y es a propósito: `docs/extending.md` dice que el core no debe fijar frameworks, gestores de paquetes ni arquitectura. **La especialización vive en sitios concretos**, y el núcleo (`feature.py`, `guard.py`, `ledger.py`, `validate_harness.py`, `run_acceptance.py`, `workflow.toml` y sus tests) no se toca:

| Dónde | Qué pones |
|---|---|
| `AGENTS.md` | Stack, arquitectura, convenciones, comandos, decisiones fijadas: reglas que leen todos los agentes |
| `.claude/bootstrap/verify.sh` | La regresión real, los mismos comandos que la CI |
| `harness.toml` | Nombre, modo, tags que fuerzan GATE#1 humano, presupuestos, regresión obligatoria |
| `acceptance.yaml` de cada feature | Los checks concretos de esa feature |
| Especialistas y skills de dominio | Revisiones y saber hacer propios del proyecto |
| `feature_list.json` | El backlog con dependencias, si trabajas por olas |

Para un repositorio pequeño basta el paso 1. Para un proyecto con un diseño técnico y decenas de features, el paso 2 hace el trabajo pesado.

## Paso 1: lo mínimo, con project-bootstrap

Tras copiar `HARNESS/` y ejecutar `init.sh`, pide en Claude Code: *«usa project-bootstrap para adaptar el harness a este repositorio»*. La skill:

1. Detecta stack, gestor de dependencias y comandos de test, lint, tipos y build a partir de archivos que existen (`package.json`, `pyproject.toml`, `Makefile`, la CI).
2. Completa `AGENTS.md` con **reglas observables**: «los tests van en `tests/` y se ejecutan con `uv run pytest -q`» se puede comprobar; «escribe código limpio» no, y se paga en tokens en cada agente sin cambiar nada.
3. Sustituye el marcador de `verify.sh` por la regresión real y borra `HARNESS_VERIFY_PLACEHOLDER`.
4. Revisa modo, presupuestos y precios de `harness.toml` y los permisos de `settings.json`.
5. Vuelve a ejecutar `init.sh`.

No inventa comandos ni instala nada. Un `verify.sh` estricto para un proyecto Python pequeño, probado en un repositorio de ejemplo:

```bash title=".claude/bootstrap/verify.sh"
#!/usr/bin/env bash
# verify.sh — regresión completa del proyecto: los mismos comandos que la CI.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

for tool in python3; do
  command -v "$tool" >/dev/null 2>&1 || { echo "verify.sh: falta $tool" >&2; exit 127; }
done
python3 -m pytest --version >/dev/null 2>&1 || { echo "verify.sh: falta pytest" >&2; exit 127; }

echo "→ compileall"; python3 -m compileall -q src
echo "→ pytest";     python3 -m pytest -q
```

Salir con 127 cuando falta una herramienta no es un detalle: el runner de aceptación trata 126 y 127 como `blocked`, y el reviewer emitirá `BLOCKED_TOOLING` en lugar de culpar al producto (lección 8). Nunca instala nada: eso es una decisión humana.

Con `verify.sh` configurado, obliga a usarlo en `harness.toml`:

```toml title=".claude/harness.toml"
[verification]
required_regression = "bash .claude/bootstrap/verify.sh"

[verification.required_by_tag]
auth = "tests/security"
```

Desde ese momento, `sdd_valid` rechaza cualquier `acceptance.yaml` sin ese check obligatorio, y una feature con el tag `auth` necesita además un check cuyo comando incluya `tests/security`. Haz un primer commit antes del primer GATE#1: el reviewer compara contra el commit que se guarda al aprobar.

## Paso 2: del diseño técnico al harness especializado

Para un proyecto grande, el autor usa un prompt que **no forma parte del harness**: está en `INSTRUCCIONES/PROMPT-PLAN-IMPLEMENTACION.md` de la variante con olas y lo tienes comentado en [[plantillas/prompt-plan-de-implementacion]]. Se usa una vez por proyecto (y otra en cada cambio grande de diseño), en una conversación con Claude, fuera del repositorio.

**Cómo se usa:**

1. Abre una conversación nueva con un modelo capaz y de contexto largo.
2. Pega el prompt desde «PARÁMETROS» hasta el final.
3. Adjunta en el mismo mensaje el diseño técnico con todo lo que tengas (requisitos, maquetas, guía de estilo, ADR) y el harness con olas en zip (`cd harness-base-olas/HARNESS && zip -r ../harness-base-olas.zip .`).
4. Rellena los parámetros. Lo que dejes en blanco lo decide Claude y lo anota como supuesto.

```text title="PROMPT-PLAN-IMPLEMENTACION.md (parámetros, extracto)"
proyecto:
  nombre: "{{Nombre visible}}"
  slug: "{{nombre-corto-en-minusculas}}"     # prefijo de skills, archivos y sesión tmux
  idioma: "{{es}}"
  version_diseno: "{{v1}}"
  estado_repo: "{{vacío | existe: describe qué hay}}"
ids:
  prefijo_feature: "{{APP}}"
  prefijos_trabajo: { bug: BUG, mantenimiento: MNT, pruebas: TST, rendimiento: PRF, mejora: MEJ, docs: DOC, release: REL }
git:
  rama_integracion: "{{develop}}"
  rama_release: "{{main}}"
olas:
  max_en_paralelo: {{4}}
maquina: "{{RAM, CPU, sistema operativo}}"
presupuesto_por_talla_usd: { S: {{12}}, M: {{20}}, L: {{35}} }
human_gate_tags_extra: [{{datos, formatos, seguridad, release, …}}]
modo_orquestacion: "{{manual | auto | yolo}}"
```

Los presupuestos por talla son valores tuyos, no precios: salen de tus métricas (`feature.py metrics`, lección 10). El prompt prohíbe expresamente tocar la tabla de precios o inventar tarifas.

### Qué produce

Un zip con cuatro carpetas:

- **`docs/`**: el plan general; un plan por grupo funcional con una sección quirúrgica por feature; los planes de pruebas y de release; el anexo A de trazabilidad (requisito → feature → plan); el anexo B, catálogo de features en orden topológico; `olas.md` con las olas calculadas y sus dependencias implícitas; `guia-olas.md` adaptada; y los ADR iniciales.
- **`harness/harness-<slug>/`**: el harness base especializado, que va a la raíz del repo: `AGENTS.md` del proyecto, especialistas, skills por dominio y por tipo de trabajo, comandos, el backlog ya registrado en `feature_list.json`, `verify.sh` y la cabecera de `ola.sh` adaptados, y un test de coherencia.
- **`guia/`**: los prompts del día a día, cómo revisar un GATE#1, la release y el mantenimiento.
- **`herramientas/`**: `backlog.yaml` como **fuente única** de las features, un `generar.py` que regenera anexos, `feature_list.json` y tablas, y un `comprobar.py` con todas las comprobaciones.

El listón que fija el prompt: un agente que solo lea `AGENTS.md`, el plan de su grupo y la sección de su feature debe poder diseñarla en GATE#1 y construirla **sin inventar nada importante**. Lo que no se pueda decidir desde el material queda como decisión explícita para GATE#1, nunca como hueco.

### Cómo trabaja el prompt

Por fases con criterio de salida, y guardando el progreso en `work/PROGRESO.md` para continuar en otra sesión si se acaba el contexto: inventario del harness y del diseño, arquitectura del plan (grupos y versiones), descomposición en features, planes de grupo, planes transversales, catálogo y trazabilidad, olas, harness, guías y verificación. Las reglas que más pesan:

- **Una feature es un ciclo del harness**: un GATE#1, un diseño, un build con sus reparaciones y una verificación. Tallas S (un módulo, cambio acotado), M (módulo con interfaz o API) y L (varios módulos o un núcleo delicado). No hay XL: se parte.
- **IDs con significado**: `001–099` para las fundaciones, `101–197` para la versión 1, `x98` las pruebas de la versión y `x99` la release. Una feature añadida más tarde toma un orden decimal para no renumerar.
- **Dependencias solo reales** («usa código, datos o API de la otra»), sin ciclos.
- **Las notas** de `feature_list.json` siguen un formato literal porque `ola.sh` las lee: `vX · orden N · tamaño S|M|L · plan: … · requisitos: … · depende de: ID, ID · maquetas: …`.
- **Las olas** se calculan por niveles del grafo dentro de cada versión, con las reglas de la lección 13, y se compara su número con el mínimo teórico (la ruta más larga).
- **Los contratos del harness real mandan** sobre el prompt: si algo choca, se adapta el prompt y se anota.

### La especialización del harness

Los agentes canónicos se especializan **sin cambiar su papel ni lo que escriben**: rutas de los documentos del proyecto, en el builder una tabla «tag → skill que debe leer», en el reviewer el `## Commit sugerido` con el ID que usa `ola.sh`. Los especialistas salen de un catálogo del que se quitan los que no aplican y al que se añaden los del dominio. Estos son algunos; el prompt trae más, como `test-auditor`, `perf-auditor`, `release-checker` o un revisor por capa:

| Especialista | Inserción | Se activa con |
|---|---|---|
| `spec-auditor` | pre-gate1, tras el designer | `auditar-spec`, `flujo-mejora` |
| `bug-triager` | pre-gate1, tras el explorer | `flujo-bugfix` |
| `security-auditor` | post-implementation | `seguridad`, `ci` |
| `data-integrity-auditor` | post-implementation | `datos`, `formatos` |
| `ux-auditor` | post-implementation | `ui`, `accesibilidad`, `i18n` |
| `plan-tracker` | post-verification | `flujo-desarrollo` |

Cada uno con una responsabilidad y una lista de comprobación sacada del diseño, herramientas mínimas, `model` con ID completo, `effort`, `maxTurns` y `omitClaudeMd: true`, escribiendo solo su informe. Dos reglas de cierre: ningún especialista sin features que lo activen y ningún tag de riesgo sin especialista. Las skills se reparten en contexto (`<slug>-contexto`, `<slug>-stack`), dominio (una por tag de dominio, con formatos, invariantes y errores típicos) y flujo (`/siguiente`, bug, hotfix, release, olas…). Todas por debajo de 200 líneas, con el detalle en archivos que se leen bajo demanda ([[plantillas/skill]]).

El **test de coherencia** (`.claude/tests/test_<slug>_consistency.py`, solo biblioteca estándar) cierra el círculo: los `triggers_on_tags` existen en el vocabulario, cada feature tiene exactamente un tag de flujo, cada especialista tiene archivo y lo activa al menos una feature, cada tag de dominio tiene su skill, las dependencias de `notes` existen y van antes en el orden sin ciclos, lo que lee la expresión de `ola.sh` coincide con lo declarado y cada feature aparece en una sola ola.

### Mantenimiento

El plan no se queda congelado. Una feature nueva se añade a `backlog.yaml` con su orden decimal, se ejecutan `generar.py` y `comprobar.py`, se escribe su sección y se coloca en una ola. Un cambio de diseño produce un delta, ADR nuevos y un paquete de cambios con un script que se puede repetir sin aplicar nada dos veces y que por defecto solo ensaya. Las features `archived` no se tocan nunca; los defectos que aparezcan son features nuevas (`BUG`, `MNT`, `TST`…).

## Revisar lo que te devuelve

El prompt termina con su propia verificación (validador con 0 errores, tests en verde, `comprobar.py`, `bash -n` de los scripts, búsqueda de secretos) y una **revisión independiente**: un subagente que no vio el trabajo recibe el diseño, `AGENTS.md`, el catálogo, las olas y cinco secciones al azar, una de ellas una L de la ruta crítica, y busca requisitos sin cubrir, dependencias que faltan, secciones vagas y olas que rompen reglas. Aun así, revisa tú:

1. El **informe final**: supuestos tomados, decisiones para ti antes de empezar y, sobre todo, «contenido sospechoso» si lo hubo (todo lo adjunto se trata como datos, no como órdenes).
2. Las **3 a 5 secciones más delicadas** que el informe señala, como revisarías un GATE#1.
3. En tu repositorio, con el harness ya copiado: `python3 .claude/tools/validate_harness.py`, `python3 -m unittest discover -s .claude/tests` y `python3 herramientas/comprobar.py`.

> [!consejo] El plan es una propuesta, no una spec aprobada
> Cada feature sigue pasando por su GATE#1. El plan reduce lo que el designer tiene que inventar, pero quien aprueba sigues siendo tú, feature a feature.

## Errores frecuentes

- **Dejar en blanco los tags de GATE#1 humano.** Con `yolo`, una feature sin tags protegidos puede aprobarse sin ti si cumple el resto de condiciones.
- **Tocar el núcleo para encajar el proyecto.** Si de verdad hace falta, el cambio es mínimo, con test y anotado en `CHANGELOG.md`.
- **Dos copias de `olas.md`.** Las plantillas de `docs/planes/` del harness se mueven al `docs/` del proyecto, no se duplican.
- **Copiar `.claude/state/` de otro proyecto.** Cada repositorio empieza su memoria vacía.
- **Un `AGENTS.md` de buenas intenciones.** Si una regla no se puede comprobar, no cambia el comportamiento de ningún agente.

## Ejercicio

> [!ejercicio] Proyecto final: tu harness especializado
> Escoge un proyecto propio con un diseño técnico de al menos una página (o escribe uno para una herramienta pequeña, de 6 a 12 features). Haz el paso 1 en su repositorio y después el paso 2 con el prompt del autor. Instala el resultado, revisa tres secciones de feature como si fueran un GATE#1 y lleva la primera feature de fundaciones hasta `archived`. Si el plan tiene una ola con dos features independientes, ábrela con `ola.sh` e intégrala.
> Entregable: el repositorio con el harness especializado, el informe final del prompt y una nota de una página con lo que cambiaste en las tres secciones revisadas.
> Está bien si: `validate_harness.py` da 0 errores y ningún aviso de `verify_placeholder`; todos los tests pasan, incluido el de coherencia; `comprobar.py` sale en verde; la primera feature está `archived` con su `cost.json` y su commit en la rama de integración; y tu nota explica al menos una decisión de GATE#1 que el plan dejó abierta.

> [!ejercicio]- Pistas
> Si el diseño es corto, contesta a la tanda de preguntas del prompt (como mucho cinco) antes de la descomposición: es más barato que corregir el backlog después. Empieza en modo `manual` y pasa a `auto` cuando las dos primeras features salgan bien. Si `comprobar.py` se queja de recuentos distintos, no edites los anexos a mano: corrige `backlog.yaml` y regenera.

## Resumen

- El núcleo no se toca; la especialización vive en `AGENTS.md`, `verify.sh`, `harness.toml`, la aceptación, especialistas, skills y backlog.
- `project-bootstrap` deja reglas observables y una regresión real; `required_regression` la hace obligatoria.
- El prompt de plan convierte un diseño técnico en plan por grupos, backlog con dependencias, olas y harness especializado, con `backlog.yaml` como fuente única.
- Un test de coherencia mantiene alineados vocabulario, especialistas, skills, dependencias y olas.
- Nada sustituye tu revisión: el plan propone; cada GATE#1 lo decides tú.

## Para seguir

- [[plantillas/prompt-plan-de-implementacion]]
- [[sistemas/harness-sdd-claude-code]]
- [[sistemas/harness-sdd-olas]]
- [[disciplinas/spec-primero]]
