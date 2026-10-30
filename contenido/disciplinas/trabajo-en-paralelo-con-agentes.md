---
titulo: Trabajo en paralelo con agentes
descripcion: Cómo llevar varias sesiones de agente a la vez sin que se pisen, con un worktree por tarea, un árbol principal que solo integra, dependencias declaradas y una integración de cada vez.
creado: 2026-10-29
orden: 14
tipo: forma-de-trabajar
tags: [forma-de-trabajar, paralelo, worktrees, agentes-de-codigo]
relacionados: ["[[glosario/worktree]]", "[[glosario/ola]]", "[[recetas/features-en-paralelo-con-worktrees]]", "[[cursos/harness-engineering/13-features-en-paralelo-con-olas]]", "[[blog/2026-10-25-tres-cosas-que-se-rompen-sin-worktrees]]"]
---

Trabajar en paralelo con agentes es tener varias sesiones abiertas a la vez, cada una con una tarea, mientras tú apruebas, revisas e integras. Bien hecho, multiplica lo que sale de una jornada. Mal hecho, produce diffs mezclados, tests que fallan por código ajeno y una tarde entera deshaciendo conflictos.

## Qué es

Una forma de organizar el trabajo, no una función de la herramienta. Sus piezas:

- **Una tarea por sesión y por [[glosario/worktree|worktree]].** Cada tarea vive en su propia carpeta de trabajo de git (`git worktree`), con una rama temporal, y tiene su propia sesión del agente.
- **Un árbol principal que solo integra.** La carpeta original está en la rama de integración, limpia, y no se construye nada en ella mientras haya worktrees abiertos.
- **Dependencias declaradas.** Una tarea solo se abre cuando todo lo que necesita ya está integrado.
- **Integración de una en una**, con la regresión en verde después de cada una.

El harness del autor lo formaliza como **[[glosario/ola|olas]]**: grupos de como mucho cuatro funcionalidades sin dependencias pendientes entre sí y que no tocan el mismo módulo. Lo tienes completo en [[cursos/harness-engineering/13-features-en-paralelo-con-olas]] y en [[sistemas/harness-sdd-olas]].

## Por qué importa

Porque el cuello de botella eres tú. Simon Willison lo resume en [*Embracing the parallel coding agent lifestyle*](https://simonwillison.net/2025/Oct/5/parallel-coding-agents/) (octubre de 2025): el límite del paralelo es la revisión humana. Lo que paraleliza bien es lo que se revisa rápido: investigación y prototipos, explicaciones del código, mantenimiento pequeño y, sobre todo, trabajo muy especificado, porque el código que nace de tu propia spec cuesta mucho menos revisar.

Y porque en el mismo árbol, dos tareas a la vez rompen cosas concretas. El autor las enumera para su harness, pero valen para cualquiera:

1. **El diff se mezcla.** Quien revisa una tarea ve también el código a medias de la otra.
2. **La regresión falla por código ajeno.** Los tests de una tarea fallan por lo que está haciendo la otra.
3. **El estado compartido pierde escrituras.** Si dos procesos reescriben el mismo archivo de estado sin bloqueo, uno pisa al otro.

Con un worktree por tarea, cada sesión ve un repositorio propio y las tres cosas funcionan igual que en serie. Cognition llegó a una conclusión parecida para sistemas multiagente en abril de 2026: las escrituras en un solo hilo; los demás agentes aportan inteligencia, no acciones.

## Prácticas concretas

- **Abre un worktree por tarea desde la rama de integración**, y solo cuando sus dependencias estén integradas:

  ```bash
  git worktree add -b wt/app-101 ../repo-wt/app-101 develop
  git worktree list
  ```

- **Una sesión por worktree, con el ID de la tarea explícito** en el primer mensaje: «Esta sesión solo lleva APP-101 en el worktree `wt/app-101`. No crees ramas ni hagas commits».
- **Declara las dependencias donde se lean solas**, por ejemplo `depende de: APP-101` en las notas de cada tarea, y apunta también las implícitas (código que una usa de otra sin decirlo).
- **Una por módulo.** Dos tareas que tocan el mismo módulo, el mismo registro central o el mismo formato de datos del usuario no van a la vez.
- **Integra de una en una, en orden**, primero la que más otras esperan. Un commit por tarea con *squash*, y la regresión en verde antes de la siguiente:

  ```bash
  git merge --squash wt/app-101 && git commit -m "feat(APP-101): …"
  python3 -m pytest -q
  git worktree remove ../repo-wt/app-101 && git branch -D wt/app-101
  ```

- **Los conflictos mecánicos se resuelven conservando los dos lados**: registros de rutas, catálogos de textos, listas. Los *lockfiles* y el código generado, nunca a mano: lado de la rama de integración y regenerar.
- **Si la regresión falla al integrar, no arregles encima.** Aborta, registra el fallo y arréglalo en la rama de integración antes de seguir.
- **Limita las sesiones a lo que tu máquina y tu atención aguantan.** El autor pone un máximo de cuatro y, con 16 GB de RAM, dos o tres compilaciones a la vez.
- **Un verificador que reparta los fallos.** Nicholas Carlini, al coordinar dieciséis agentes en paralelo sobre un compilador, comprobó que si todos se atascan en el mismo fallo el paralelo no ayuda: necesitó un oráculo que asignara a cada agente un fallo distinto ([*Building a C compiler with a team of parallel Claudes*](https://www.anthropic.com/engineering/building-c-compiler), febrero de 2026).

## Cuándo no paralelizar

- Cuando una tarea es un **cuello de botella** del que dependen muchas otras: mejor sola, revisando su aprobación con calma.
- Cuando **la regresión falla al integrar**: para y arregla antes de integrar la siguiente, o los fallos se acumulan y ya no sabrás de quién son.
- Cuando **la máquina no da abasto** y los tests empiezan a superar sus tiempos: baja a dos sesiones.
- Cuando dos tareas tocan **el mismo formato de datos del usuario**.
- Cuando la tarea **no está especificada**: revisar en paralelo cinco improvisaciones es peor que hacer una bien.

## Señales de que lo haces mal

- Tienes dos sesiones del agente abiertas sobre la misma carpeta.
- Al revisar una tarea encuentras cambios que no tienen nada que ver con ella.
- Integras tres ramas seguidas y luego pasas los tests.
- Resuelves conflictos de *lockfile* a mano.
- Pasas el día aprobando y no revisando: has abierto más sesiones de las que puedes leer.

## Cómo empezar mañana

1. Elige dos tareas pequeñas, independientes y de módulos distintos, con su spec escrita.
2. Crea un worktree para cada una con `git worktree add` desde tu rama de integración y abre una sesión del agente en cada carpeta.
3. Cuando la primera termine y la revises, intégrala con `--squash`, pasa la regresión y borra su worktree. Después, la segunda.
4. Apunta cuánto tiempo pasaste revisando frente a esperando. Si revisar te lleva más de la mitad, no añadas una tercera sesión todavía.

## Para seguir

- [[recetas/features-en-paralelo-con-worktrees]]
- [[recetas/integrar-features-en-paralelo]]
- [[problemas/conflictos-al-integrar-en-paralelo]]
- [[plantillas/plan-de-olas]]
