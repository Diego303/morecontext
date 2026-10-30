---
titulo: Guardrails
descripcion: Controles alrededor del modelo que validan entradas, salidas y acciones para impedir comportamientos no deseados.
creado: 2026-09-15
actualizado: 2026-10-29
categoria: seguridad
aliases: [barreras de seguridad, salvaguardas, guardarraíles]
tags: [seguridad, produccion]
relacionados: ["[[cursos/seguridad-y-prompt-injection/03-defensas-en-capas]]", "[[disciplinas/seguridad]]"]
---

Los *guardrails* son comprobaciones que pones antes, después o alrededor de cada llamada al modelo para bloquear lo que no debe pasar: entradas maliciosas, salidas con datos sensibles, formato inválido o acciones fuera de lo permitido. Viven en tu código, no dentro del modelo, y por eso puedes probarlos y confiar en ellos.

## En la práctica

Los más útiles son deterministas: validar el JSON contra un esquema, rechazar URLs fuera de una lista permitida, limitar importes, exigir aprobación para herramientas con efectos. Un clasificador (otro modelo o una regla) puede filtrar temas fuera de alcance o detectar intentos de [[glosario/inyeccion-de-prompt]], pero no es infalible; hay clasificadores de pesos abiertos como [[herramientas/llama-guard]]. En agentes de código, un [[glosario/hook]] que se ejecuta antes de cada herramienta es un guardrail determinista. Combina varias capas y aplica [[glosario/minimo-privilegio]]: lo que una herramienta no puede hacer, no hay que vigilarlo.

## No confundir con

- **Instrucciones en el [[glosario/prompt-de-sistema]]**: orientan al modelo, pero un atacante puede saltárselas. Un guardrail se aplica aunque el modelo se equivoque.

## Ver también

- [[cursos/seguridad-y-prompt-injection/03-defensas-en-capas]]
- [[disciplinas/seguridad]]
- [[docs/seguridad/02-permisos-y-minimo-privilegio]]
- [[glosario/humano-en-el-bucle]]
- [[docs/modelos-abiertos/09-guardrails-y-sandbox]]
- [[docs/seguridad/03-patrones-contra-inyeccion]]
