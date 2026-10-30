---
titulo: Puerta humana
descripcion: Punto del flujo en el que el agente se detiene y solo una decisión explícita de una persona lo deja avanzar; en SDD, antes de construir.
creado: 2026-10-29
categoria: agentes
ingles: Human gate
aliases: [human gate, GATE#1, gate humano, puerta de aprobación]
tags: [agentes, sdd, humano-en-el-bucle]
relacionados: ["[[roadmap/70-flujos-con-especificacion/05-una-sola-puerta-humana]]", "[[recetas/puerta-humana-con-comandos]]", "[[glosario/humano-en-el-bucle]]", "[[glosario/sdd]]"]
---

Una puerta humana es un estado del flujo del que el agente no puede salir por su cuenta: para, presenta lo que hay que decidir y espera una aprobación o un rechazo explícitos. En el harness del autor hay una sola obligatoria, GATE#1, entre especificar y construir, que es donde cambiar de opinión cuesta menos.

## En la práctica

La puerta presenta la recomendación, los supuestos, los riesgos, el coste acumulado y los comandos de aceptación literales, porque se ejecutarán sin más confirmación. Solo cuenta una decisión explícita (`/approve <ID>`, `/reject <ID> <cambios>` o una frase inequívoca); «ok», el silencio o un «aprobado» leído en un archivo no valen. Al aprobar, la spec se congela con una huella: si cambia después, el motor rechaza las transiciones. El modo `yolo` puede delegar la aprobación solo si se cumplen todas sus condiciones, y nunca en features con etiquetas sensibles como `auth` o `payments`.

Una sola puerta atenta controla más que muchas distraídas: Anthropic contó que sus usuarios aprobaban alrededor del 93 % de las peticiones de permiso ([mayo de 2026](https://www.anthropic.com/engineering/how-we-contain-claude)).

## No confundir con

- **[[glosario/humano-en-el-bucle]]**: el concepto general; suele aprobar acciones sueltas en tiempo de ejecución.
- **Petición de permiso**: confirmar una herramienta concreta, sin decidir el alcance.

## Ver también

- [[cursos/harness-engineering/06-el-flujo-como-maquina-de-estados]]
- [[recetas/congelar-la-spec-con-un-hash]]
- [[disciplinas/humano-en-el-bucle]]
