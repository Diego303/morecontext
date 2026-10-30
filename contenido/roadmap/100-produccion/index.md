---
titulo: Nivel 100 · Producción
descripcion: Lleva un agente a usuarios reales con trazas, control de costes y latencia, defensas contra inyección, aprobación humana y un despliegue que aguanta fallos.
creado: 2026-10-13
actualizado: 2026-10-29
nivel: 100
horas: 6
objetivo: Poner en producción un agente con herramientas que se pueda observar, cuyo coste y latencia estén medidos, que resista la inyección de prompt con permisos mínimos, que pida aprobación antes de acciones irreversibles y que se despliegue y revierta de forma controlada.
prerrequisitos: ["[[roadmap/40-primer-agente/index]]", "[[roadmap/80-evals/index]]"]
proyecto:
  titulo: Agente de soporte listo para producción
  descripcion: Tomas un agente de soporte con herramientas (consultar pedidos, buscar en la documentación, emitir reembolsos) y le añades todo lo que necesita para atender a usuarios reales sin sorpresas.
  entregable: Un servicio desplegable con trazas estructuradas por petición, informe de coste y latencia por versión, prompt caching medido con usage, herramienta de reembolso protegida por aprobación humana, casos de inyección en la suite de evals, reintentos con backoff, prompts versionados y un feature flag que permita volver a la versión anterior sin desplegar.
tags: [produccion, observabilidad, seguridad, costes]
relacionados: ["[[sistemas/soporte-con-aprobacion-humana]]", "[[modelos/09-checklist-produccion]]", "[[docs/produccion/index]]"]
---

Un agente que funciona en tu portátil y un agente en producción se parecen en el código del bucle y en poco más. En producción hay usuarios que escriben cosas que no esperabas, documentos con instrucciones escondidas, picos de tráfico, límites de tasa, facturas a fin de mes y acciones que no se pueden deshacer. Este nivel cubre lo que hay alrededor del bucle para que todo eso no te pille por sorpresa.

## Para quién es

Para quien ya tiene un agente con herramientas y una suite de [[glosario/evals]] que lo mide ([[roadmap/80-evals/index]]). Sin evals, cada optimización de coste o latencia de este nivel es una apuesta: no sabrás qué calidad pierdes. Si vienes del [[roadmap/90-harness/index|nivel 90]], ya tienes permisos, hooks y estado alrededor del agente; aquí los llevas a usuarios reales.

## Lecciones

1. [[roadmap/100-produccion/01-observabilidad-y-trazas]]. Qué registrar en cada llamada y en cada herramienta, cómo relacionarlo con IDs, cómo sacar de ahí coste y latencia, y cómo emitirlo con OpenTelemetry hacia Langfuse o Phoenix.
2. [[roadmap/100-produccion/02-costes-y-prompt-caching]]. Dónde se va el dinero y cómo ponerle caché al prefijo con `cache_control`, midiendo el efecto en `usage`.
3. [[roadmap/100-produccion/03-latencia]]. Streaming, el modelo adecuado para cada paso, menos pasos y paralelizar lo independiente.
4. [[roadmap/100-produccion/04-seguridad-y-prompt-injection]]. Inyección directa e indirecta, la trifecta letal y la regla de dos, mínimo privilegio y tratar los datos como datos.
5. [[roadmap/100-produccion/05-humano-en-el-bucle]]. Pausar antes de lo irreversible y diseñar la aprobación para que la gente la lea, a mano y con `interrupt` de LangGraph.
6. [[roadmap/100-produccion/06-despliegue]]. Secretos, límites de tasa, reintentos con *backoff*, versionado de prompts, *feature flags* y dónde corre el agente (modelo autoalojado, ejecución duradera, agente alojado).

## Proyecto del nivel

El agente de soporte de [[sistemas/soporte-con-aprobacion-humana]] es el caso de referencia: tiene herramientas de lectura, una de escritura con dinero de por medio y usuarios externos que pueden intentar manipularlo. Cada lección añade una pieza. Al final, repasa [[modelos/09-checklist-produccion]] antes de dar el proyecto por terminado.

> [!peligro] Lo irreversible, siempre detrás de una puerta
> Si tu agente puede pagar, borrar o enviar algo en nombre de alguien, la lección 5 no es opcional. Ningún prompt sustituye a una comprobación en tu código.

## Para seguir

Es el último nivel del roadmap. Si quieres profundizar en seguridad, sigue con [[cursos/seguridad-y-prompt-injection/index]]; si quieres servir tus propios modelos, con [[cursos/agentes-con-modelos-abiertos/index]]. Para el día a día con trazas y métricas, la disciplina [[disciplinas/observabilidad]] recoge las prácticas que mantienen un sistema sano después del lanzamiento.
