---
titulo: Subagentes para buscar en paralelo
descripcion: Delegar búsquedas en subagentes con contexto propio permite explorar en paralelo y devolver al orquestador solo lo esencial, a cambio de más tokens.
creado: 2026-07-14
categoria: practicas
tags: [subagentes, multiagente, busqueda]
fuente:
  titulo: "Anthropic, jun. 2025 · How we built our multi-agent research system"
  url: https://www.anthropic.com/engineering/multi-agent-research-system
relacionados: ["[[glosario/subagente]]", "[[docs/agentes/02-subagentes]]", "[[sistemas/investigacion-multiagente]]", "[[roadmap/60-multiagente/01-cuando-no-usar-multiagente]]"]
---

## Qué es

Un patrón que se repite en agentes de investigación y de código: un [[glosario/orquestador|orquestador]] divide la pregunta y lanza varios [[glosario/subagente|subagentes]], cada uno con su propia ventana de contexto, para buscar en paralelo. Cada subagente lee mucho y devuelve poco: un resumen con fuentes. Anthropic describe esta arquitectura en su sistema de investigación multiagente, incluido su principal inconveniente: consume bastantes más tokens que un solo agente.

## Qué cambia en la práctica

- El contexto del orquestador se mantiene limpio porque no recibe páginas enteras, solo conclusiones.
- La latencia total baja cuando las búsquedas son independientes.
- El coste sube con cada subagente. Solo compensa en tareas amplias y valiosas.
- Las instrucciones de delegación pasan a ser críticas: objetivo, formato de respuesta, límites y qué no repetir.

## Qué hacer

1. Pregúntate primero si te hace falta: [[roadmap/60-multiagente/01-cuando-no-usar-multiagente]].
2. Diseña cada subagente con una tarea acotada y un formato de salida fijo: [[cursos/sistemas-multiagente/02-disenar-subagentes]].
3. Implementa el lanzamiento y la recogida: [[roadmap/60-multiagente/04-paralelismo]].
4. Mide el gasto antes de escalar: [[roadmap/60-multiagente/05-coste-de-multiplicar-agentes]].
