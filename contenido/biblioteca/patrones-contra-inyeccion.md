---
titulo: Patrones de diseño para agentes seguros (Beurer-Kellner et al., 2025)
descripcion: Seis patrones para que la inyección de prompt no pueda disparar acciones con consecuencias, qué utilidad cuesta cada uno y diez casos de estudio para elegir.
creado: 2026-10-29
tags: [biblioteca, seguridad, inyeccion-de-prompt, patrones]
relacionados: ["[[docs/seguridad/03-patrones-contra-inyeccion]]", "[[biblioteca/camel]]", "[[glosario/regla-de-dos]]", "[[cursos/seguridad-y-prompt-injection/03-defensas-en-capas]]"]
autores: Beurer-Kellner et al.
anio: 2025
url: https://arxiv.org/abs/2506.08837
tipo: paper
tema: seguridad
nivel: intermedio
---

*Design Patterns for Securing LLM Agents against Prompt Injections* (Luca Beurer-Kellner y otros trece autores, 10 de junio de 2025) es lo más parecido a un catálogo de arquitectura para agentes seguros. Firmado por gente de IBM, Invariant Labs, ETH Zúrich, Google y Microsoft, entre otros, parte de una premisa honesta: con los modelos actuales, un agente de propósito general no puede dar garantías fiables frente a la [[glosario/inyeccion-de-prompt|inyección de prompt]]. Así que propone renunciar a algo de generalidad a cambio de seguridad.

## La idea clave

**El principio que guía todo el paper: una vez que el agente ha leído una entrada no fiable, hay que restringirlo para que esa entrada no pueda disparar ninguna acción con consecuencias.** Los autores lo llaman un intercambio valioso entre utilidad y seguridad, y lo concretan en seis patrones:

| Patrón | Cómo funciona | Qué pierdes |
|---|---|---|
| *Action-Selector* | El modelo elige una acción de una lista fija y nunca ve su resultado | Casi todo: no puede leer ni encadenar |
| *Plan-Then-Execute* | El plan de herramientas se fija antes de ver contenido no fiable; el contenido puede cambiar datos, no qué se hace | Flexibilidad para replanificar |
| *LLM Map-Reduce* | Subagentes procesan cada elemento no fiable por separado y devuelven un resultado acotado (por ejemplo, sí o no) | Solo vale para tareas que se trocean así |
| *Dual LLM* | Un LLM privilegiado con herramientas coordina a otro en cuarentena que lee lo no fiable y devuelve referencias simbólicas | Complejidad; el privilegiado no ve el contenido |
| *Code-Then-Execute* | El LLM escribe un programa en un lenguaje restringido que permite seguir el flujo de datos; es el enfoque de [[biblioteca/camel]] | Hay que construir intérprete y políticas |
| *Context-Minimization* | Se elimina del contexto lo que ya no hace falta, por ejemplo la petición original tras convertirla en consulta | Información para pasos posteriores |

El ejemplo de *Plan-Then-Execute* lo deja claro: «envía mi agenda de hoy a mi jefe» se convierte en leer el calendario y enviar un correo a una dirección fija. Un evento del calendario manipulado puede alterar el cuerpo del correo, pero no el destinatario.

## Por qué importa hoy

Te da un vocabulario para decidir la arquitectura antes de escribir código, en vez de confiar en un filtro. Las defensas por detección caen ante ataques adaptativos, y la [[glosario/trifecta-letal|trifecta letal]] y la [[glosario/regla-de-dos|regla de dos]] te dicen *cuándo* hay riesgo. Estos patrones te dicen *qué estructura* lo reduce.

Muchos encajan con patrones que ya conoces: *Action-Selector* es un [[patrones/04-enrutado|enrutado]] sin vuelta, *LLM Map-Reduce* es una [[patrones/05-paralelizacion|paralelización]] con salidas acotadas y *Plan-Then-Execute* lleva al extremo [[roadmap/40-primer-agente/04-planificar-antes-de-actuar|planificar antes de actuar]]. La diferencia es el motivo: aquí la estructura existe para que el texto inyectado no tenga a qué agarrarse.

> [!consejo] Empieza por tu caso
> Empieza por el caso de estudio más parecido al tuyo y mira qué combinación proponen. Rara vez basta un solo patrón.

## Qué leer primero

1. **La introducción y el principio guía**: resumen la filosofía de todo el paper.
2. **La sección de patrones**: los seis, con su ejemplo y su coste en utilidad.
3. **Uno o dos casos de estudio** de los diez: asistente de sistema operativo, agente SQL, asistente de correo y calendario, chatbot de atención al cliente, asistente de reservas, recomendador de productos, cribado de currículos, chatbot de prospectos de medicamentos, chatbot de diagnóstico médico y agente de ingeniería de software. Cada uno trae modelo de amenazas y mitigaciones.

El agente SQL es de los más complejos y el de ingeniería de software el más cercano a un agente de código.

## Qué ha envejecido

Es de 2025 y conceptual, así que ha envejecido poco. Matices al aplicarlo:

- **Algunas mitigaciones son discutibles.** En el agente de ingeniería de software se propone que un LLM en cuarentena convierta documentación no fiable en una descripción de API estrictamente formateada, con nombres cortos. Simon Willison [dudó](https://simonwillison.net/2025/Jun/13/prompt-injection-design-patterns/) de que limitar la longitud de un nombre baste contra un atacante decidido.
- **No resuelven agentes de propósito general.** Los propios autores lo asumen: si tu agente debe hacer cualquier cosa con cualquier contenido, ningún patrón lo protege del todo.
- **El ecosistema ha crecido.** Con skills y servidores MCP de terceros, el contenido no fiable también llega en las descripciones de las herramientas y en su código. Los patrones siguen sirviendo, pero tienes que contar esas fuentes como no fiables.

## Dónde lo ves en MoreContext

- [[docs/seguridad/03-patrones-contra-inyeccion]]: los seis patrones con diagramas y código.
- [[biblioteca/camel]]: el patrón *Code-Then-Execute* en detalle.
- [[cursos/seguridad-y-prompt-injection/03-defensas-en-capas]]: cómo combinar patrones con permisos y sandbox.
- [[recetas/map-reduce-con-send]]: la mecánica de un map-reduce con LangGraph.
- [[docs/seguridad/04-mcp-y-skills-de-terceros]]: el riesgo nuevo de las herramientas de terceros.
- [[disciplinas/seguridad]]: la seguridad de agentes como práctica diaria.
