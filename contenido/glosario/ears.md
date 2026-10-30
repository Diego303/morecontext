---
titulo: EARS
descripcion: Cinco plantillas de frase para escribir requisitos sin ambigüedad (ubicuo, por evento, por estado, no deseado y opcional) que un agente puede convertir en pruebas.
creado: 2026-10-29
categoria: agentes
ingles: Easy Approach to Requirements Syntax
aliases: [Easy Approach to Requirements Syntax, requisitos EARS, sintaxis EARS]
tags: [agentes, sdd, requisitos]
relacionados: ["[[roadmap/70-flujos-con-especificacion/02-requisitos-en-ears]]", "[[biblioteca/ears]]", "[[plantillas/spec-con-ears]]", "[[glosario/sdd]]"]
---

EARS es una forma de redactar requisitos con unas pocas plantillas de frase fijas, para que cada uno diga cuándo aplica y qué debe hacer el sistema. La propusieron Mavin, Wilkinson, Harwood y Novak en [RE'09](https://research.manchester.ac.uk/en/publications/easy-approach-to-requirements-syntax-ears/) (2009) y hoy es habitual en flujos de [[glosario/sdd]].

## En la práctica

Los cinco patrones, en español:

```text
Ubicuo:      El sistema debe <respuesta>.
Por evento:  Cuando <disparador>, el sistema debe <respuesta>.
Por estado:  Mientras <estado>, el sistema debe <respuesta>.
No deseado:  Si <condición no deseada>, entonces el sistema debe <respuesta>.
Opcional:    Donde <característica incluida>, el sistema debe <respuesta>.
```

Se combinan («Mientras…, cuando…, el sistema debe…»). Su valor está en lo que obliga a pensar: el patrón «no deseado» te hace preguntarte qué sale mal, y el de estado, qué debe mantenerse. Un requisito como «Si el slug ya existe, entonces el sistema debe añadir el sufijo `-2`» se traduce casi directamente en un test, y por eso un agente lo implementa y lo verifica con menos interpretación que «gestiona los duplicados».

## No confundir con

- **Gherkin** (*Given/When/Then*): describe escenarios de ejemplo; EARS describe la regla general.
- **[[glosario/aceptacion-ejecutable]]**: la comprobación que demuestra el requisito.

## Ver también

- [[roadmap/70-flujos-con-especificacion/03-plan-y-tareas]]
- [[disciplinas/spec-primero]]
