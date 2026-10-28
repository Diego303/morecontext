---
titulo: Nivel 40 · Tu primer agente
descripcion: Construye un agente de verdad, con su bucle, límites de pasos y de gasto, un plan previo, varias herramientas bien descritas y trazas para depurarlo.
creado: 2026-09-15
nivel: 40
horas: 6
objetivo: Escribir desde cero un agente con varias herramientas que sabe cuándo parar, planifica antes de actuar y deja una traza legible de cada ejecución.
prerrequisitos: ["[[roadmap/20-herramientas/index]]", "[[roadmap/30-contexto-y-rag/index]]"]
proyecto:
  titulo: Agente de soporte de pedidos con herramientas simuladas
  descripcion: Un agente de línea de comandos que atiende consultas de clientes sobre pedidos usando cuatro herramientas sobre datos simulados (buscar cliente, ver pedidos, buscar en la ayuda y abrir una incidencia), con presupuesto de pasos, tokens y tiempo, aprobación humana antes de abrir incidencias y una traza JSONL por ejecución.
  entregable: Un repositorio con agente.py (o agente.ts), herramientas.py con datos de prueba, un archivo tareas.jsonl con 10 consultas y el resultado esperado, las 10 trazas generadas y un informe de una página con cuántas tareas resuelve, cuántos pasos y tokens gasta de media y el fallo más interesante que encontraste leyendo las trazas.
tags: [agentes, bucle-agentico, herramientas]
relacionados: ["[[docs/agentes/01-el-bucle-agentico]]", "[[patrones/08-agente-autonomo]]", "[[patrones/01-workflows-vs-agentes]]", "[[glosario/agente]]"]
---

En el nivel 20 hiciste que el modelo pidiera herramientas una vez. En este nivel le dejas pedirlas **tantas veces como necesite**, en un bucle, hasta resolver la tarea. Eso es un [[glosario/agente|agente]]. El código es corto; lo difícil es que se comporte bien: que elija la herramienta correcta, que no dé vueltas, que no gaste sin límite y que puedas entender qué hizo cuando falla.

## Para quién es

Para quien domina el ciclo `tool_use` → `tool_result` y sabe definir herramientas con JSON Schema ([[roadmap/20-herramientas/index]]). Conviene haber hecho el nivel 30, porque una de las herramientas típicas de un agente es buscar en documentos.

## Qué vas a construir

Un agente de soporte sobre pedidos con datos simulados. Simulados a propósito: así puedes provocar errores, repetir ejecuciones y comparar trazas sin tocar sistemas reales. El agente puede leer libremente, pero **abrir una incidencia requiere tu aprobación**, que es tu primer contacto con el [[glosario/humano-en-el-bucle|humano en el bucle]].

## Lecciones

1. [[roadmap/40-primer-agente/01-que-es-un-agente]]. La diferencia entre un agente y un workflow, según *Building effective agents*, y cómo decidir si tu problema necesita un agente.
2. [[roadmap/40-primer-agente/02-el-bucle-agentico]]. El bucle completo y correcto en Python y TypeScript, con todos los `stop_reason` tratados.
3. [[roadmap/40-primer-agente/03-condiciones-de-parada]]. Límites de pasos, tokens, `max_tokens`, tiempo y aprobación humana, y qué devolver cuando se agota el presupuesto.
4. [[roadmap/40-primer-agente/04-planificar-antes-de-actuar]]. Pedir un plan antes de ejecutar, revisarlo y mantenerlo actualizado durante la ejecución.
5. [[roadmap/40-primer-agente/05-agente-con-varias-herramientas]]. Diseñar y describir herramientas para que el modelo elija bien, y probar esa elección.
6. [[roadmap/40-primer-agente/06-depurar-con-trazas]]. Un formato de traza sencillo y qué buscar en él cuando el agente se equivoca.

> [!consejo] Empieza por la lección 1 aunque tengas prisa
> Muchos problemas que parecen pedir un agente se resuelven mejor con un workflow. Decidirlo bien al principio te ahorra trabajo, coste y sustos.

## Después de este nivel

Con un agente fiable, el siguiente paso es coordinar varios: [[roadmap/60-multiagente/index]]. Para medir si tu agente mejora o empeora con cada cambio, salta a [[roadmap/80-evals/04-evals-de-trayectoria]]. Y si quieres un sistema completo como referencia, mira [[sistemas/soporte-con-aprobacion-humana]].
