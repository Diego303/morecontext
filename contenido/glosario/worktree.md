---
titulo: Worktree
descripcion: Directorio de trabajo adicional de un mismo repositorio git, con su propia rama, que permite a varios agentes trabajar a la vez sin pisarse.
creado: 2026-10-29
categoria: agentes
ingles: Git worktree
aliases: [git worktree, worktrees, árbol de trabajo]
tags: [agentes, git, paralelo]
relacionados: ["[[recetas/features-en-paralelo-con-worktrees]]", "[[disciplinas/trabajo-en-paralelo-con-agentes]]", "[[glosario/ola]]", "[[cursos/harness-engineering/13-features-en-paralelo-con-olas]]"]
---

Un worktree es una carpeta más de trabajo de un repositorio git: comparte el historial y los objetos con el árbol principal, pero tiene su propia rama y sus propios archivos. Con un worktree por tarea, cada agente ve un repositorio para él solo.

## En la práctica

Se crea con `git worktree add ../repo-wt/tarea-1 -b wt/tarea-1` y se borra con `git worktree remove`. Claude Code puede abrir una sesión en uno nuevo (`--worktree`) o lanzar un subagente aislado así (`isolation: worktree`). Es la forma habitual de trabajar con agentes en paralelo, y el límite real pasa a ser cuánto puedes revisar.

En el harness del autor, dos features en el mismo árbol rompen tres cosas: el diff que revisa el revisor mezcla el código de ambas, la regresión falla por el código a medias de la otra y dos transiciones simultáneas pueden pisarse en el registro de estado. Con un worktree por feature, cada sesión funciona igual que en serie. Cuenta con el disco y la memoria: cada worktree tiene sus dependencias y sus compilados.

## No confundir con

- **Rama**: un worktree tiene una rama, pero una rama sola no te da otra carpeta.
- **Clon**: copia el repositorio entero; el worktree comparte el `.git`.
- **[[glosario/sandbox]]**: un worktree aísla cambios, no permisos ni red.

## Ver también

- [[recetas/integrar-features-en-paralelo]]
- [[problemas/conflictos-al-integrar-en-paralelo]]
- [[roadmap/60-multiagente/04-paralelismo]]
