---
titulo: Auditar tu propio harness
descripcion: Cómo audité mi harness archivo por archivo, qué hallazgos salieron y cómo se corrigieron, y qué preguntas hacerle al tuyo para encontrar sus puntos débiles.
creado: 2026-10-26
estado: revision
tipo: tutorial
destacado: false
tags: [harness, auditoria, calidad]
relacionados: ["[[cursos/harness-engineering/12-probar-y-evolucionar-el-harness]]", "[[sistemas/harness-sdd-claude-code]]", "[[disciplinas/harness-engineering]]", "[[blog/2026-10-22-de-codex-a-claude-code]]"]
---

Un [[glosario/harness|harness]] es software, y el software acumula deuda. Lo que lo hace delicado es que su trabajo consiste en darte confianza: si el harness falla en silencio, te fías de algo que no lo merece. Por eso, con la versión 0.5.0 en marcha, le hice a mi harness una auditoría con lupa. En este tutorial cuento cómo la hice, qué encontré y qué preguntas te propongo para auditar el tuyo.

## Paso 1: una línea base que se pueda repetir

Empieza por ejecutar lo que el propio harness tiene para comprobarse. En el mío, el validador del bundle y la suite de tests:

```bash
python3 .claude/tools/validate_harness.py
python3 -m unittest discover -s .claude/tests
```

En la 0.5.0, el validador pasaba con cero errores y un aviso (el `verify.sh` del proyecto sin configurar) y los 58 tests estaban en verde. Eso no demuestra que el harness esté bien. Demuestra que está bien según lo que él mismo sabe comprobar, y te da un punto de partida: cualquier cambio posterior tiene que dejar esto igual o mejor.

Si tu harness no tiene un comando así, ese es tu primer hallazgo.

## Paso 2: leerlo entero

La auditoría partió de una lectura íntegra de los 84 archivos del repositorio, incluido el código de las herramientas y el de los tests. Nada de resúmenes ni muestras. Varios hallazgos estaban justo en el hueco entre lo que dice un archivo y lo que hace otro, y ese hueco solo se ve leyendo los dos.

Al leer, contrastaba cuatro capas que tienen que decir lo mismo: el contrato de flujo, el motor de estado, el validador con sus guards y los tests. La primera conclusión fue buena: estaban alineados y no había referencias a funciones o comandos inexistentes, algo que la 0.4.0 no podía decir.

Después busqué con mentalidad de atacante: ¿puede un agente hacer creer que ha corrido sin correr?, ¿puede alguien colar una aprobación disfrazando el comando? Las dos respuestas fueron que no, y las anoté como puntos fuertes.

> [!consejo] Puedes delegarla, con condiciones
> Un agente en una sesión limpia, con el repositorio entero delante, puede hacer una buena auditoría si le exiges evidencia `ruta:línea` por cada hallazgo y que separe lo que comprobó de lo que no pudo comprobar. Después repasa tú cada hallazgo antes de aceptarlo.

## Paso 3: escribir cada hallazgo igual

Cada hallazgo lleva siempre los mismos campos:

```text
ID              H-01
Severidad       Media | Baja | Info
Hallazgo        qué pasa, en una o dos frases
Evidencia       ruta:línea, o el comando que lo muestra
Recomendación   el cambio mínimo que lo resuelve
Estado          abierto | resuelto en <versión> | sin cambios (motivo)
```

Usé tres severidades: **Media** para un comportamiento incorrecto o un riesgo operativo plausible, **Baja** para una inconsistencia menor e **Info** para observaciones o trabajo pendiente. Ningún hallazgo rompía el flujo; eran de pulido y operativos.

La columna de estado la añadí después, al sacar la 0.8.0. Convierte la auditoría en un documento vivo: se ve qué se resolvió y qué se dejó así a propósito.

## Lo que encontré

Doce hallazgos. Estos son los más instructivos:

- **H-01 · El lock «obsoleto» se medía mal.** La configuración decía que un lock se considera posiblemente obsoleto tras un tiempo *sin actividad*, pero el código lo medía desde que se activó. Una feature trabajada sin pausa más de 120 minutos aparecía como posiblemente obsoleta, y el procedimiento de reanudación pedía confirmación sin motivo. Resuelto: ahora cuenta desde la última transición o el último subagente.
- **H-02 · Un reintento que no reiniciaba la aprobación.** `retry_exploration` desde un bloqueo posterior a GATE#1 volvía a diseño con la aprobación anterior todavía registrada, y el estado mostraba «GATE#1: approved» en una feature que esperaba aprobación. Resuelto: ese reintento reinicia el gate, los contadores, la foto de git y el lock de la spec, igual que un replan.
- **H-03 · El riesgo de los alias de modelo.** Los agentes usaban alias como `sonnet`. Si el alias pasaba a resolver a un modelo nuevo sin precio en la tabla, la guard de presupuesto bloquearía todas las transiciones con trabajo nuevo desde el primer subagente. Resuelto: IDs completos en los agentes y avisos del validador para alias y modelos sin precio.
- **H-04 · Documentación que el agente podía leer.** Un documento histórico de 2448 líneas en la raíz que el explorer podía leer, con su coste en tokens y el riesgo de confundirlo con documentación del producto. Resuelto: los manuales viven fuera de lo que se copia al proyecto.
- **H-06 · Un aviso que no avisaba.** Con un presupuesto por feature menor que el umbral de aviso, se pasaba de «bien» a «superado» sin aviso intermedio. Resuelto: el aviso salta como tarde al 80 % del límite.
- **H-07 · El presupuesto no cuenta al orquestador.** Se quedó igual a propósito: la guard solo usa lo que se mide de forma determinista, y el coste del orquestador es una estimación. Queda escrito, con la recomendación de revisar el coste completo en GATE#1 y al cerrar.

Otros no se pueden cerrar desde el harness. H-10: campos del frontmatter de los agentes que dependen de la versión de Claude Code y que no pude verificar contra la documentación oficial. La recomendación es una prueba rápida tras cada actualización: que un subagente no reciba `CLAUDE.md` ni pueda lanzar otro subagente.

Los puntos fuertes también van por escrito, porque una auditoría que solo lista problemas invita a tocar lo que funciona: runtimes que las guards verifican contra el transcript real (no basta con escribir una línea en el registro de eventos), una firma humana que resiste ofuscaciones, «lo aprobado es lo presentado» comprobado por hash y un guard que [[glosario/fallo-en-cerrado|falla en cerrado]].

## Paso 4: corregir con un test

Cada corrección llegó con sus tests. Las del motor (H-01, H-02 y H-05) tienen un archivo dedicado, la del presupuesto (H-06) su caso en los tests del ledger y los avisos de modelo (H-03) los suyos en los del validador. Así un hallazgo no puede volver sin que algo se ponga en rojo. Entre la 0.5.0 y la 0.8.0 la suite pasó de 58 a 95 tests.

## Las preguntas para tu harness

Son las preguntas que me habrían llevado a cada hallazgo:

1. **¿Se comprueba solo?** ¿Hay un validador y unos tests que puedas ejecutar ahora mismo?
2. **¿Lo que dice la configuración es lo que hace el código?** (H-01)
3. **¿Qué datos declara el modelo y cuáles mide el código?** Runtimes, coste, resultados de los tests.
4. **¿Cada estado tiene una salida sin editar archivos a mano?** (H-02 y el `blocked` terminal de la 0.4.0)
5. **¿Qué pasa cuando cambia algo de fuera?** Alias de modelo, precios, versión de la herramienta. (H-03, H-10)
6. **¿Qué lee cada agente sin necesitarlo?** Documentación del propio harness, skills duplicadas. (H-04, H-09)
7. **¿Los avisos llegan antes que los bloqueos?** (H-06)
8. **¿Qué pasa si un control falla?** ¿Bloquea o deja pasar? (H-11)
9. **¿Puede un texto leído aprobar algo?** Prueba variantes: comillas, abreviaturas de opciones, comandos encadenados.
10. **¿Qué decisiones discutibles son deliberadas, y dónde están escritas?** (H-07)

Repite la auditoría cuando el harness cambie de forma notable o cuando cambie la herramienta sobre la que corre. La línea base del paso 1 te dirá enseguida si algo se ha movido.

## Para seguir

- [[cursos/harness-engineering/12-probar-y-evolucionar-el-harness]]: el validador, los tests y cuándo merece crecer el harness.
- [[sistemas/harness-sdd-claude-code]]: el harness auditado, tal como es hoy.
- [[disciplinas/harness-engineering]]: la disciplina de diseñar el entorno del agente.
- [[blog/2026-10-22-de-codex-a-claude-code]]: cómo se llegó de la 0.4.0 a la 0.8.0.

*Borrador inicial: pendiente de reescribir con la voz del autor.*
