---
titulo: Qué hace falta para dejar a un agente trabajando horas
descripcion: Un análisis de las piezas que necesita un agente para trabajar sin supervisión durante horas, del estado externo a los presupuestos y la verificación.
creado: 2026-08-22
estado: revision
tipo: analisis
tags: [agentes, larga-duracion, contexto, produccion]
relacionados: ["[[radar/2026-07-28-agentes-de-larga-duracion]]", "[[cursos/context-engineering/04-contexto-para-agentes-largos]]", "[[roadmap/40-primer-agente/03-condiciones-de-parada]]", "[[disciplinas/observabilidad]]"]
---

Un agente que resuelve una pregunta en treinta segundos y uno que trabaja tres horas en una migración usan el mismo [[glosario/bucle-agentico|bucle]]: llamar al modelo, ejecutar las herramientas que pida, devolver los resultados, repetir. Lo que cambia es todo lo que rodea al bucle. En este análisis repaso qué piezas creo que hacen falta para que dejar un agente trabajando solo sea una decisión razonable y no una apuesta.

Lo organizo en seis preguntas. Si no tienes respuesta para alguna, ese es el punto débil.

## 1. ¿Dónde vive el estado?

En una tarea corta, el estado es la conversación. En una tarea larga, la conversación no cabe. Cada [[glosario/tool-result|resultado de herramienta]] se suma al historial, y antes o después llegas al límite de la [[glosario/ventana-de-contexto|ventana de contexto]]. Aunque no llegues, un historial enorme es caro y ruidoso.

La respuesta que veo más sólida es separar dos cosas: el contexto de trabajo, que es temporal, y el estado de la tarea, que debe sobrevivir. El estado vive fuera: un archivo de progreso, un registro en base de datos o el propio repositorio con sus commits. Debería contener lo mínimo para que otra instancia del agente, sin historial, pueda continuar: el objetivo, el plan, qué está hecho, qué falta y qué se ha descubierto por el camino.

Anthropic describe en *Effective context engineering for AI agents* (2025) esta idea de notas estructuradas que el agente escribe fuera de la ventana y vuelve a leer cuando las necesita, junto con la [[glosario/compactacion|compactación]] del historial y el uso de [[glosario/subagente|subagentes]]. Las tres técnicas se combinan bien.

## 2. ¿Qué pasa si se cae a mitad?

En horas de trabajo, algo fallará: un límite de tasa, un error de red, una respuesta cortada por [[glosario/max-tokens|max_tokens]], un proceso reiniciado. Si el único estado es la conversación en memoria, empiezas de cero.

Con estado externo, la pregunta se convierte en otra: ¿desde qué punto puedo reanudar? Eso pide **checkpoints**. Después de cada paso con efecto, el agente actualiza el estado. Las operaciones deberían ser idempotentes cuando se pueda, para que repetir el último paso no duplique nada. Y el código que rodea al bucle tiene que tratar cada [[glosario/stop-reason|stop_reason]]: `max_tokens` y `pause_turn` indican que la respuesta quedó a medias y que hay que continuar, no que algo haya ido mal. La receta [[recetas/reintentos-y-limites-de-tasa]] cubre la parte de reintentos.

## 3. ¿Cómo sabe que ha terminado?

Un agente sin criterio de fin tiene dos modos de fallo: para demasiado pronto, convencido de que ha acabado, o sigue indefinidamente mejorando cosas que nadie pidió.

Lo que mejor funciona es un criterio **verificable desde fuera del modelo**: los tests pasan, el número de archivos migrados coincide con el inventario, el informe tiene una fuente por afirmación. Si el criterio solo existe en la cabeza del modelo, depende de su juicio en el peor momento, cuando lleva horas trabajando y el contexto está cargado.

## 4. ¿Cuánto puede gastar?

Una tarea larga puede hacer cientos de llamadas. Necesita un presupuesto explícito en pasos, en tokens o en dinero, y un comportamiento definido al agotarlo: parar, guardar estado y avisar. Lo detallamos en [[roadmap/40-primer-agente/03-condiciones-de-parada]].

El presupuesto también protege de bucles. Un agente que repite la misma búsqueda porque no entiende el resultado puede quemar mucho antes de que alguien lo mire. Un contador de llamadas repetidas a la misma herramienta con los mismos argumentos es una alarma barata.

El [[glosario/prompt-caching|prompt caching]] ayuda aquí más que en ningún otro sitio. En un bucle largo el prefijo (herramientas, sistema, primeros mensajes) se repite en cada llamada. Mantenerlo estable y cacheado reduce coste y latencia sin tocar el comportamiento.

## 5. ¿Qué puede romper?

Cuanto más tiempo trabaja un agente sin supervisión, más importa lo que tiene permitido hacer. Lo que en una sesión corta se resolvería con una confirmación, en una de tres horas puede pasar sin que nadie lo vea.

Mi lista mínima:

- [[glosario/minimo-privilegio|Mínimo privilegio]]: solo las herramientas y credenciales que la tarea necesita.
- Un [[glosario/sandbox|sandbox]] si ejecuta código o usa el ordenador.
- Acciones irreversibles detrás de [[glosario/humano-en-el-bucle|aprobación humana]], aunque eso obligue al agente a esperar. Puede seguir con otras partes mientras tanto.
- Tratar todo lo que lee de fuera como entrada no confiable, por la [[glosario/inyeccion-de-prompt|inyección de prompt]].

## 6. ¿Cómo revisas lo que hizo?

Tres horas de trabajo producen un resultado y una traza. Si solo miras el resultado, no sabes si llegó por buen camino. Si miras la traza entera, no terminas nunca.

Lo razonable es diseñar la revisión desde el principio: hitos donde el agente deja un resumen de lo hecho, una traza completa guardada para cuando haga falta investigar y cambios entregados en piezas revisables, como defiende [[disciplinas/cambios-pequenos-y-revisables]]. La [[disciplinas/observabilidad|observabilidad]] deja de ser un extra. Y conviene saber leer esas trazas; lo explico en [[blog/2026-07-15-como-leer-una-traza]].

## El orden en que lo construiría

Si tuviera que priorizar, empezaría por el criterio de fin y el presupuesto, porque sin ellos todo lo demás da igual. Después el estado externo con checkpoints. Después permisos y aprobaciones. La observabilidad la montaría en paralelo desde el primer día, porque es lo que te permite descubrir qué falla en las otras cinco.

Nada de esto es nuevo. Son las mismas ideas que aplicamos a cualquier proceso por lotes que corre de noche. La diferencia es que aquí el proceso toma decisiones, y eso hace que cada una de estas piezas importe más. Para seguir, mira [[cursos/context-engineering/04-contexto-para-agentes-largos]].

*Borrador inicial: pendiente de reescribir con la voz del autor.*
