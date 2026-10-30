---
titulo: SDD
descripcion: Desarrollo guiado por especificaciones, en el que escribes y apruebas qué construir antes del código y el agente trabaja contra esa spec.
creado: 2026-10-29
categoria: agentes
ingles: Spec-driven development
aliases: [Spec-driven development, desarrollo guiado por especificaciones, desarrollo guiado por specs, spec-first]
tags: [agentes, sdd, especificacion]
relacionados: ["[[roadmap/70-flujos-con-especificacion/index]]", "[[disciplinas/spec-primero]]", "[[glosario/ears]]", "[[sistemas/harness-sdd-claude-code]]"]
---

SDD (*spec-driven development*) es trabajar con agentes contra una especificación escrita antes del código: qué se quiere, con qué requisitos, cómo se diseña, en qué tareas se divide y cómo se demostrará que funciona. La spec es el contrato que el agente cumple y que tú revisas.

## En la práctica

Böckeler distingue tres niveles en [*Understanding Spec-Driven-Development*](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) (octubre de 2025): *spec-first* (la spec antes de cada tarea), *spec-anchored* (se mantiene y evoluciona con la funcionalidad) y *spec-as-source* (solo se edita la spec y el código se genera). Spec Kit de GitHub y Kiro de AWS son las herramientas más conocidas; Kiro escribe los requisitos en [[glosario/ears]]. En el harness del autor la spec son cinco archivos (propuesta, requisitos, diseño, tareas y [[glosario/aceptacion-ejecutable|aceptación]]) que se congelan con una huella al aprobar la [[glosario/puerta-humana]].

La crítica más repetida es la ceremonia: un cambio pequeño no necesita cuatro documentos. Ajusta el tamaño de la spec al del cambio y prioriza criterios que se puedan comprobar.

## No confundir con

- **TDD**: escribir primero los tests. Encaja dentro de SDD como forma de redactar la aceptación.
- **Planificar en el prompt**: un plan que nadie aprueba ni congela.

## Ver también

- [[roadmap/70-flujos-con-especificacion/01-de-improvisar-a-especificar]]
- [[plantillas/spec-con-ears]]
- [[cursos/harness-engineering/07-spec-congelada-y-aceptacion]]
- [[recetas/congelar-la-spec-con-un-hash]]
