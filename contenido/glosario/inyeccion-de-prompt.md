---
titulo: Inyección de prompt
descripcion: Ataque en el que un texto introducido en el contexto contiene instrucciones que intentan cambiar el comportamiento del modelo.
creado: 2026-09-22
actualizado: 2026-10-29
categoria: seguridad
ingles: prompt injection
aliases: [prompt injection, inyección indirecta, inyección de instrucciones]
tags: [seguridad]
relacionados: ["[[docs/seguridad/01-prompt-injection]]", "[[cursos/seguridad-y-prompt-injection/02-inyeccion-directa-e-indirecta]]"]
---

La inyección de prompt es un ataque en el que un texto que llega al contexto del modelo contiene instrucciones para que haga algo distinto de lo que quiere tu aplicación. Es **directa** cuando la escribe el propio usuario e **indirecta** cuando viene escondida en datos que el modelo lee: una web, un correo, un PDF, el resultado de una herramienta (Greshake et al., 2023). Encabeza el [Top 10 de OWASP para aplicaciones LLM](https://genai.owasp.org), y OWASP tiene desde diciembre de 2025 un Top 10 específico para aplicaciones agénticas.

## En la práctica

El modelo no distingue de forma fiable entre instrucciones y datos, así que no hay un filtro que lo resuelva del todo. La defensa es limitar el daño posible: [[glosario/minimo-privilegio]] en las herramientas, aprobación humana en acciones con efectos, no mezclar en el mismo agente datos no fiables con acceso a secretos y canales de salida (la [[glosario/trifecta-letal]]; la [[glosario/regla-de-dos]] lo convierte en criterio de diseño), y [[glosario/guardrails]] que validen las acciones en código. La descripción de una herramienta MCP también es texto que entra en el contexto: ver [[glosario/envenenamiento-de-herramientas]].

## Ver también

- [[docs/seguridad/01-prompt-injection]]
- [[roadmap/100-produccion/04-seguridad-y-prompt-injection]]
- [[cursos/seguridad-y-prompt-injection/02-inyeccion-directa-e-indirecta]]
- [[radar/2026-10-20-inyeccion-por-herramientas]]
- [[docs/seguridad/03-patrones-contra-inyeccion]]
- [[biblioteca/inyeccion-indirecta-greshake]]
