---
titulo: Aceptación ejecutable
descripcion: Criterios de terminado escritos como comprobaciones que una máquina ejecuta y decide sin interpretar, aprobados antes de construir y con evidencia guardada.
creado: 2026-10-29
categoria: evals
ingles: Executable acceptance criteria
aliases: [criterios de aceptación ejecutables, acceptance.yaml, executable acceptance criteria]
tags: [evals, sdd, verificacion]
relacionados: ["[[roadmap/70-flujos-con-especificacion/04-aceptacion-ejecutable]]", "[[plantillas/criterios-de-aceptacion]]", "[[recetas/criterios-de-aceptacion-ejecutables]]", "[[glosario/veredicto]]"]
---

Una aceptación es ejecutable cuando «terminado» deja de ser una opinión: cada criterio es una comprobación que un programa ejecuta y que pasa o falla sin que nadie la interprete. Se escribe y se aprueba antes de construir, junto con la spec.

## En la práctica

En el harness del autor vive en `acceptance.yaml`. Cada check tiene un `id`, los requisitos que demuestra (`covers`), si es obligatorio (`required`) y un `kind`: `command` (un comando y su código de salida), `file` (un archivo existe y contiene o no un patrón) o `inspection` (un procedimiento observable, solo si no hay alternativa automática). Un runner los ejecuta y guarda la evidencia; el revisor debe lanzarlo él mismo después de entrar en verificación, no reutilizar el ensayo del builder. Un buen check falla hoy y pasa cuando la funcionalidad está hecha; `echo ok` o `exit 0` no demuestran nada. Como los comandos se ejecutarán sin más confirmación, una persona los lee en la [[glosario/puerta-humana]].

## No confundir con

- **Tests unitarios**: un check suele lanzar tests, pero añade trazabilidad a requisitos y queda congelado con la spec.
- **[[glosario/evals]]**: miden calidad con muchos casos y a menudo con puntuación; la aceptación es binaria por check.

## Ver también

- [[cursos/harness-engineering/07-spec-congelada-y-aceptacion]]
- [[recetas/un-verify-para-toda-la-regresion]]
- [[glosario/ears]]
- [[disciplinas/verificar-antes-de-dar-por-hecho]]
