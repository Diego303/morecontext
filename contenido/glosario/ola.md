---
titulo: Ola
descripcion: Grupo de features sin dependencias pendientes entre sí que se construyen a la vez, cada una en su worktree y su sesión, y se integran de una en una.
creado: 2026-10-29
categoria: agentes
ingles: Wave
aliases: [olas, wave, ola de features]
tags: [agentes, harness, paralelo, git]
relacionados: ["[[cursos/harness-engineering/13-features-en-paralelo-con-olas]]", "[[sistemas/harness-sdd-olas]]", "[[plantillas/plan-de-olas]]", "[[glosario/worktree]]"]
---

En el harness del autor, una ola es un lote de features que pueden construirse en paralelo porque todas sus dependencias ya están integradas y no tocan el mismo módulo. Cada feature va en su propio [[glosario/worktree]], con su propia sesión de Claude Code, y el flujo de cada una no cambia: su [[glosario/puerta-humana]] incluida.

## En la práctica

Las reglas que la hacen segura:

- Una feature se abre solo cuando sus dependencias están integradas en la rama de integración.
- Como mucho unas pocas abiertas a la vez (cuatro por defecto), y una por módulo.
- El árbol principal **solo integra**: no se construye nada en él mientras haya worktrees abiertos.
- Se integra de una en una, con un *squash* por feature, y la regresión completa debe quedar en verde antes de la siguiente.
- Los commits, el push y los descartes los hace la persona.

Las olas son lotes de referencia, no turnos fijos: si una feature de la ola siguiente ya tiene sus dependencias integradas y su módulo libre, puede arrancar antes. El cuello de botella suele ser tu revisión, no las máquinas.

## No confundir con

- **[[patrones/05-paralelizacion]]**: varias llamadas al modelo dentro de una tarea. La ola paraleliza tareas enteras.
- **Sprint**: un periodo de tiempo; la ola se define por dependencias.

## Ver también

- [[recetas/integrar-features-en-paralelo]]
- [[problemas/conflictos-al-integrar-en-paralelo]]
- [[disciplinas/trabajo-en-paralelo-con-agentes]]
