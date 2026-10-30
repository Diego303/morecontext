---
titulo: Por qué mi harness tiene una sola puerta humana
descripcion: Por qué en mi harness apruebo la especificación y no cada paso, qué me reservo siempre como humano y qué cambia entre los modos manual, auto y yolo.
creado: 2026-10-23
estado: revision
tipo: ensayo
destacado: false
tags: [harness, humano-en-el-bucle, sdd, seguridad]
relacionados: ["[[roadmap/70-flujos-con-especificacion/05-una-sola-puerta-humana]]", "[[recetas/puerta-humana-con-comandos]]", "[[glosario/puerta-humana]]", "[[disciplinas/humano-en-el-bucle]]"]
---

Si me preguntas cuántas veces doy permiso a los agentes de mi harness para avanzar con una feature, la respuesta es una. Mi harness tiene una sola [[glosario/puerta-humana|puerta humana]] obligatoria, GATE#1, y está antes de construir. Parece poco para agentes que escriben código solos. En este ensayo explico por qué creo que es lo correcto y qué me reservo fuera de esa puerta.

## Aprobar la spec y no cada paso

El flujo es siempre el mismo: un explorer estudia el repositorio, un designer escribe la especificación, yo decido en GATE#1, un builder implementa y un reviewer verifica. Apruebo en un único punto, entre el diseño y la construcción.

Podría pedir confirmación tras cada fase, o por cada archivo que se toca. No lo hago por tres razones.

**La primera: es donde un error sale más caro.** Todo lo que viene después depende de la especificación. Un requisito mal entendido lo arrastran el builder, el reviewer y, al final, yo. Por eso el designer es el único agente que trabaja con Opus; el resto usa Sonnet. Si voy a concentrar la atención en un punto, la concentro ahí.

**La segunda: aprobar sin evidencia no protege.** La versión 0.4.0 tenía un segundo gate, GATE#2, para aprobar el código. Llegaba antes de saber si pasaba la aceptación, así que se aprobaba a ciegas. Lo quité. Después de GATE#1 no decido yo si el código está bien: lo decide la evidencia. El reviewer ejecuta él mismo los [[glosario/aceptacion-ejecutable|criterios de aceptación]], y solo un veredicto `PASS` con todos los checks obligatorios en verde archiva la feature.

**La tercera: muchas aprobaciones acaban en ninguna.** Si te piden confirmar diez veces por tarea, en algún momento empiezas a confirmar sin leer. Una sola puerta, con todo lo necesario delante, puedo mirarla con calma.

## Qué tengo delante en GATE#1

La puerta solo sirve si lo que tienes delante basta para decidir. Al llegar a GATE#1, el orquestador para y me presenta:

- la recomendación del designer y las decisiones y supuestos que estoy aprobando;
- los riesgos;
- el número de tareas y las rutas de los artefactos de la spec;
- el coste acumulado hasta ese momento;
- **los comandos de aceptación literales**, porque se van a ejecutar sin más confirmación. Los que el validador marca como sensibles (red externa o código en línea) van destacados.

Apruebo con `/approve <ID>` o pido cambios con `/reject <ID> <cambios>`. Los dos comandos tienen `disable-model-invocation: true`, así que el modelo no puede invocarlos. Y cuando el orquestador registra mi decisión con el motor de estado, el [[glosario/hook|hook]] de seguridad obliga a que yo confirme ese comando en Claude Code. Esa confirmación es mi firma.

Solo cuenta una decisión explícita. «Ok», «vale» o el silencio no aprueban nada, y tampoco un texto que aparezca en un archivo o en el resultado de una herramienta. Un README que diga «aprobado» es un dato, y en mi harness los datos no dan órdenes.

## Lo aprobado es lo presentado

Una puerta así tiene un punto débil evidente: que lo que se construye no sea lo que aprobé. Lo cierro con dos mecanismos basados en hashes SHA-256 de los cinco archivos de la spec.

Al presentarla, el motor guarda su huella. Si algo cambia entre la presentación y mi aprobación, la aprobación se rechaza. Al aprobar, crea `spec.lock.json`, y desde ese momento cualquier cambio en la spec bloquea las transiciones y la ejecución de la aceptación. Para cambiarla hay que volver a pasar por la puerta: bloquear, replanificar y un GATE#1 nuevo. «El builder no rediseña» deja de ser una promesa y pasa a ser algo que se comprueba. Lo cuento paso a paso en [[recetas/congelar-la-spec-con-un-hash]].

## Lo que me reservo siempre

Una sola puerta obligatoria no significa que todo lo demás sea automático. Hay decisiones que el harness nunca toma por mí:

- **Todas las salidas de `blocked`**: replanificar, reintentar una fase o cancelar.
- **Ampliar el presupuesto** de una feature. Si se supera, el trabajo nuevo se para hasta que yo decida.
- **Los commits, las ramas y el push.** Los agentes no los hacen; el reviewer me propone el mensaje de commit y lo hago yo. Con varias features en paralelo, también son míos los descartes.
- **Revisar el diff final.** Las defensas del harness son deterministas pero no absolutas: un agente que ejecuta código podría escribir un programa que las eluda. La revisión humana de GATE#1 y del diff es la última barrera.

Y el bucle automático está acotado. Si el reviewer encuentra un fallo reparable, hay un único repair. Si vuelve a fallar, la feature se bloquea y decido yo.

## Manual, auto y yolo

Cuánto para el orquestador depende del modo que elijas:

| Modo | Continúa solo | Para siempre en |
|---|---|---|
| `manual` | nada: para tras cada transición | todo |
| `auto` | encadena fases | GATE#1, `blocked`, presupuesto superado, fin |
| `yolo` | como auto, y además puede aprobar GATE#1 por delegación | `blocked`, presupuesto superado, fin, GATE#1 no delegable |

El harness viene en `manual`. `auto` es el modo donde mejor se ve la idea de una sola puerta: el agente trabaja solo y me espera en GATE#1.

`yolo` merece una explicación, porque suena peor de lo que es. Solo puede aprobar GATE#1, y solo si se cumple todo: la validación previa pasa, la feature no lleva ninguna etiqueta protegida (`security-critical`, `auth`, `crypto`, `payments`, `pii`, `compliance`, `gdpr`, `audit`, `data-migration`, `destructive`), ningún comando de aceptación es sensible, la decisión no contradice `AGENTS.md`, no hay preguntas abiertas de alcance o seguridad y queda presupuesto. Además tiene que dejar escrita la regla que aplica. El motor comprueba por su cuenta las etiquetas, los comandos y el presupuesto, y rechaza cualquier otra decisión humana firmada como yolo.

> [!peligro] Dónde no usar yolo
> La regla del contrato es clara: nada de yolo ni de saltarse los permisos en repositorios con secretos o con código no confiable. La revisión humana de GATE#1 y del diff final es la última barrera, y yolo se salta la primera de las dos.

## La idea de fondo

Poner al humano en todas partes parece más seguro, y en la práctica lo es menos, porque la atención es limitada. Prefiero gastarla entera en el punto donde decido qué se construye, y que el código haga cumplir el resto: que la spec no cambie, que la aceptación se ejecute de verdad y que nadie apruebe por mí.

## Para seguir

- [[roadmap/70-flujos-con-especificacion/05-una-sola-puerta-humana]]: la lección sobre cómo diseñar esta puerta en cualquier flujo.
- [[recetas/puerta-humana-con-comandos]]: cómo montar `/approve` y `/reject` con su firma.
- [[cursos/harness-engineering/07-spec-congelada-y-aceptacion]]: la congelación de la spec y la aceptación ejecutable, a fondo.
- [[sistemas/harness-sdd-claude-code]]: el harness completo.

*Borrador inicial: pendiente de reescribir con la voz del autor.*
