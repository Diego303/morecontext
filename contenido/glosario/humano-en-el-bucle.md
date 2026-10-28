---
titulo: Humano en el bucle
descripcion: Diseño en el que una persona revisa o aprueba ciertas decisiones del agente antes de que tengan efecto.
creado: 2026-09-18
categoria: agentes
ingles: human-in-the-loop
aliases: [human-in-the-loop, HITL, aprobación humana]
tags: [agentes, seguridad]
relacionados: ["[[docs/agentes/03-humano-en-el-bucle]]", "[[recetas/aprobacion-humana-antes-de-actuar]]"]
---

Humano en el bucle es diseñar un [[glosario/agente]] para que se detenga en puntos concretos y espere a que una persona apruebe, corrija o rechace lo que va a hacer. Se reserva para acciones irreversibles, caras o de alto impacto: pagar, borrar, enviar a un cliente, desplegar.

## En la práctica

Cuando el modelo pide una herramienta sensible, tu código no la ejecuta: guarda el estado, muestra al revisor la acción con sus argumentos y espera. Si la aprueba, ejecutas y devuelves el resultado; si la rechaza, devuelves un [[glosario/tool-result]] con `is_error: True` y el motivo, para que el agente replantee. La decisión de qué requiere aprobación vive en código, no en el prompt. Pide aprobación solo donde importa: si todo la requiere, el revisor acaba aprobando sin leer.

## Ver también

- [[docs/agentes/03-humano-en-el-bucle]]
- [[roadmap/100-produccion/05-humano-en-el-bucle]]
- [[recetas/aprobacion-humana-antes-de-actuar]]
- [[sistemas/soporte-con-aprobacion-humana]]
- [[disciplinas/humano-en-el-bucle]]
