---
titulo: Bucle Ralph
descripcion: Técnica que relanza un agente con el mismo prompt y una ventana nueva en cada vuelta, con el plan y el progreso guardados en archivos.
creado: 2026-10-29
categoria: agentes
ingles: Ralph loop
aliases: [Ralph loop, Ralph Wiggum loop, técnica Ralph]
tags: [agentes, harness]
relacionados: ["[[patrones/12-bucle-ralph]]", "[[sistemas/agente-de-larga-duracion]]", "[[glosario/traspaso-de-sesion]]"]
---

El bucle Ralph ejecuta un [[glosario/agente]] en un bucle con **el mismo prompt fijo** y una [[glosario/ventana-de-contexto]] nueva en cada iteración. En cada vuelta el agente lee el plan o la spec, elige una tarea pendiente, la implementa, deja constancia en archivos y termina; la siguiente vuelta empieza limpia. La describió Geoffrey Huntley en [*Ralph Wiggum as a "software engineer"*](https://ghuntley.com/ralph/) (14 jul. 2025), en su forma más pura un `while` de Bash que pasa `PROMPT.md` al agente una y otra vez, y Thoughtworks la recogió en su [Technology Radar vol. 34](https://www.thoughtworks.com/es-cl/radar/techniques/ralph-loop) (abr. 2026) en el anillo *Assess*.

## En la práctica

El estado vive fuera del modelo: spec, lista de tareas, notas de progreso y git. La forma mínima con Claude Code en modo *headless* es un bucle de shell, dentro de un [[glosario/sandbox]] o contenedor. Ponle siempre un tope de vueltas:

```bash title="ralph.sh"
for i in $(seq 1 20); do
  claude -p "$(cat PROMPT.md)" || break
done
```

Con `-p` no hay nadie para aprobar permisos: declara antes en `settings.json` (`permissions.allow`) lo que puede editar y ejecutar. Funciona si cada vuelta tiene un verificador fiable (tests, [[glosario/aceptacion-ejecutable]]); sin él, el código no converge hacia la spec. El precio es el consumo de tokens, que Thoughtworks señala como su principal contra.

## No confundir con

- **[[glosario/compactacion]]**: resume el historial dentro de la misma sesión; Ralph lo tira entero y confía en los archivos.

## Ver también

- [[patrones/12-bucle-ralph]]
- [[patrones/10-inicializador-y-agente-de-trabajo]]
- [[docs/claude-code/08-modo-headless-y-ci]]
- [[cursos/harness-engineering/11-sesiones-largas]]
