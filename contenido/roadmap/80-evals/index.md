---
titulo: Nivel 80 · Evals
descripcion: Aprende a medir si tu agente funciona con un conjunto de prueba, evaluadores de código y de modelo, y comprobaciones automáticas en cada cambio.
creado: 2026-10-01
nivel: 80
horas: 5
objetivo: Construir un sistema de evals para un agente propio (conjunto de prueba, evaluadores de resultado y de trayectoria) y ejecutarlo en CI para que ningún cambio de prompt, modelo o herramienta empeore el comportamiento sin que lo sepas.
prerrequisitos: ["[[roadmap/40-primer-agente/index]]", "[[roadmap/10-prompting/05-iterar-con-casos-de-prueba]]"]
proyecto:
  titulo: Suite de evals en CI para tu agente
  descripcion: Conviertes el agente de un nivel anterior en algo medible, con casos reales y de borde, evaluadores por código, un modelo juez calibrado y comprobaciones de trayectoria, todo ejecutándose en GitHub Actions.
  entregable: Un repositorio con un conjunto de prueba versionado en JSONL, un script de evaluación que imprime métricas por categoría, un workflow de GitHub Actions que falla cuando la métrica baja de un umbral pactado y un breve documento con la tasa de acuerdo entre el juez y tus etiquetas humanas.
tags: [evals, calidad, ci]
relacionados: ["[[cursos/evals-para-agentes/index]]", "[[disciplinas/evals]]", "[[docs/evals/01-disenar-evals]]"]
---

Hasta aquí has construido agentes y has comprobado a ojo si respondían bien. Eso funciona con diez preguntas y un autor. Deja de funcionar cuando cambias el prompt, el modelo o una herramienta y no sabes qué has roto. Este nivel convierte «parece que va bien» en un número que puedes comparar entre versiones.

Unas [[glosario/evals]] son pruebas automáticas para sistemas con modelos: un [[glosario/conjunto-de-evaluacion]], una forma de puntuar cada caso y una métrica agregada. Se parecen a los tests unitarios, con una diferencia importante: la salida no es determinista y muchas veces no hay una única respuesta correcta.

## Para quién es

Para quien ya tiene un agente o un flujo con modelos que hace algo útil y quiere cambiarlo sin miedo. Necesitas saber leer trazas ([[roadmap/40-primer-agente/06-depurar-con-trazas]]) y haber iterado un prompt con casos de prueba ([[roadmap/10-prompting/05-iterar-con-casos-de-prueba]]). Si vienes del nivel 60, aquí tienes la forma de decidir con datos si tu sistema multiagente gana al agente único.

## Lecciones

1. [[roadmap/80-evals/01-por-que-evals]]. Qué falla sin evals, qué mide una eval y cómo encaja en tu ciclo de trabajo.
2. [[roadmap/80-evals/02-conjunto-de-prueba]]. De dónde salen los casos, cómo etiquetarlos y cuántos necesitas para empezar sin engañarte.
3. [[roadmap/80-evals/03-codigo-o-modelo-juez]]. Cuándo basta con una comprobación en código, cómo escribir la rúbrica de un [[glosario/modelo-juez]] y cómo calibrarlo con tus etiquetas.
4. [[roadmap/80-evals/04-evals-de-trayectoria]]. Evaluar qué herramientas llamó el agente, en qué orden y cuántos pasos dio.
5. [[roadmap/80-evals/05-regresiones-en-ci]]. Ejecutar todo en GitHub Actions con umbrales y un coste controlado.

## Proyecto del nivel

Eliges un agente tuyo, el del nivel 40 o el investigador del nivel 60, y le construyes una suite completa. Persigue un número fiable antes que un número alto: que suba cuando el agente mejora, que baje cuando empeora y que alguien de tu equipo entienda qué mide.

> [!consejo] Empieza pequeño y real
> Veinte casos sacados de uso real, bien etiquetados, valen más que doscientos inventados en una tarde. Crecerá cada vez que encuentres un fallo nuevo.

## Para seguir

Con evals en marcha, el nivel [[roadmap/100-produccion/index]] te enseña a llevar el agente a producción con trazas, control de costes y seguridad. Si quieres ir más a fondo en evaluadores y datasets, sigue con [[cursos/evals-para-agentes/index]].
