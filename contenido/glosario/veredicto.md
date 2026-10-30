---
titulo: Veredicto
descripcion: Resultado de una revisión expresado como un valor cerrado que el código puede leer, como PASS o FAIL_REPAIRABLE, para decidir el siguiente paso del flujo.
creado: 2026-10-29
categoria: evals
ingles: Verdict
aliases: [verdict, veredicto estructurado, PASS, FAIL_REPAIRABLE]
tags: [evals, harness, verificacion]
relacionados: ["[[cursos/harness-engineering/08-veredictos-y-reparacion-acotada]]", "[[plantillas/veredicto-de-revision]]", "[[glosario/aceptacion-ejecutable]]", "[[patrones/07-evaluador-optimizador]]"]
---

Un veredicto es la conclusión de un agente revisor escrita como uno de pocos valores fijos en un archivo estructurado, no como prosa. El modelo decide qué valor emite; el código lee ese valor y decide qué transición del flujo es legal.

## En la práctica

El harness del autor usa cuatro, en `verification-result.yaml`:

| Veredicto | Cuándo | Qué pasa |
|---|---|---|
| `PASS` | Checks obligatorios en verde y sin hallazgos bloqueantes | Se archiva, si pasan las guards de cierre |
| `FAIL_REPAIRABLE` | Fallo reproducible, dentro del alcance, sin tocar diseño ni aceptación | Una sola reparación con `repair-request.yaml` |
| `FAIL_NONREPAIRABLE` | Cualquier otro fallo | Bloqueo: decide el humano |
| `BLOCKED_TOOLING` | Un check no pudo ejecutarse por el entorno | Bloqueo; se reintenta tras arreglarlo |

Valores cerrados permiten guards deterministas: el motor rechaza un `PASS` si la evidencia de la [[glosario/aceptacion-ejecutable|aceptación]] es anterior a la verificación o si algún check obligatorio falló. Y acotan el bucle [[patrones/07-evaluador-optimizador|evaluador-optimizador]]: un repair como máximo, después decide una persona.

## No confundir con

- **Puntuación de un [[glosario/modelo-juez]]**: una nota sobre calidad. El veredicto es una decisión de flujo.
- **Resultado de los tests**: el veredicto los incluye, junto con la revisión de alcance y seguridad.

## Ver también

- [[plantillas/peticion-de-reparacion]]
- [[cursos/harness-engineering/06-el-flujo-como-maquina-de-estados]]
- [[glosario/salida-estructurada]]
