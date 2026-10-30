---
titulo: "Agentes que trabajan horas: checkpoints y estado"
descripcion: Cuando un agente trabaja durante horas, la ventana de contexto deja de ser su memoria; hacen falta estado externo, checkpoints y compactación.
creado: 2026-07-28
actualizado: 2026-10-29
categoria: practicas
tags: [agentes, contexto, compactacion, estado]
fuente:
  titulo: "Anthropic (Justin Young), 26 nov. 2025 · Effective harnesses for long-running agents"
  url: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
relacionados: ["[[cursos/context-engineering/04-contexto-para-agentes-largos]]", "[[patrones/10-inicializador-y-agente-de-trabajo]]", "[[glosario/compactacion]]", "[[blog/2026-08-22-dejar-un-agente-trabajando-horas]]", "[[roadmap/40-primer-agente/03-condiciones-de-parada]]"]
---

## Qué es

Cada vez más agentes ejecutan tareas largas: migraciones de código, investigaciones con decenas de búsquedas, procesos por lotes. Ninguna [[glosario/ventana-de-contexto|ventana de contexto]] aguanta horas de [[glosario/tool-result|resultados de herramientas]]. La práctica que se consolida es sacar el estado fuera del contexto: notas o archivos de progreso que el agente escribe y relee, [[glosario/compactacion|compactación]] del historial y puntos de control desde los que reanudar.

## Qué cambia en la práctica

- El estado importante vive en un archivo, una base de datos o un repositorio, no en la conversación.
- Un fallo a mitad (límite de tasa, caída, `max_tokens`) no debe obligar a empezar de cero.
- El agente necesita un criterio de «hecho» verificable y un presupuesto, o seguirá gastando.
- Revisar resultados pasa a hacerse por hitos, no al final.

## Qué hacer

1. Define el estado mínimo para reanudar (objetivo, plan, pasos hechos, pendientes) y haz que el agente lo actualice tras cada paso.
2. Implementa compactación y [[glosario/memoria|memoria]] externa: [[cursos/context-engineering/03-compactacion-y-memoria]].
3. Fija [[roadmap/40-primer-agente/03-condiciones-de-parada|condiciones de parada y presupuesto]].
4. Registra trazas para auditar después: [[roadmap/100-produccion/01-observabilidad-y-trazas]].

> [!nota] Actualización (oct. 2026)
> Corregimos la fuente: la específica de esta entrada es [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (Anthropic, 26 nov. 2025), comentada en [[biblioteca/effective-harnesses]]. Para el punto 1, el patrón que describe separa una primera sesión que prepara el entorno y la lista de funcionalidades de las sesiones que avanzan una a una: [[patrones/10-inicializador-y-agente-de-trabajo]]. El marco general de gestión del contexto sigue en [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (Anthropic, 29 sept. 2025).
