---
titulo: "Multiagente: un solo escritor, varios pensadores"
descripcion: "Cognition revisa su postura sobre multiagente y concreta qué funciona en 2026: un único agente que escribe y otros que revisan, aconsejan o investigan sin actuar."
creado: 2026-10-28
categoria: practicas
tags: [multiagente, agentes, practicas]
fuente:
  titulo: "Cognition (Walden Yan), 22 abr. 2026 · Multi-Agents: What's Actually Working"
  url: https://cognition.com/blog/multi-agents-working
relacionados: ["[[roadmap/60-multiagente/01-cuando-no-usar-multiagente]]", "[[cursos/sistemas-multiagente/01-arquitecturas]]", "[[patrones/13-ejecutor-y-asesor]]", "[[roadmap/60-multiagente/05-coste-de-multiplicar-agentes]]"]
---

## Qué es

En junio de 2025, Cognition (Walden Yan) publicó [*Don't Build Multi-Agents*](https://cognition.com/blog/dont-build-multi-agents): las acciones llevan decisiones implícitas, y dos agentes que deciden por separado producen resultados que chocan. El 22 de abril de 2026 revisó esa postura con lo que les funciona en producción. Su conclusión: los sistemas multiagente funcionan mejor hoy cuando **las escrituras siguen en un solo hilo** y los agentes adicionales aportan inteligencia, no acciones.

Lo que funciona: un bucle de código y revisión donde el revisor **no comparte contexto** previo con quien escribió; un «amigo listo», un modelo principal que consulta a otro más capaz como herramienta (con los dos modelos fuertes); y un gestor que reparte una tarea grande entre agentes hijos (*map-reduce-and-manage*). Lo que no: enjambres de escritores en paralelo y redes de agentes sin estructura. Los problemas abiertos, dice, son todos de comunicación.

## Qué cambia en la práctica

- El patrón por defecto es un agente que escribe y subagentes de lectura, revisión o consejo.
- Un revisor con contexto limpio, que solo ve el diff, encuentra más que uno que heredó el razonamiento del autor.
- Si varios agentes escriben, la coordinación hay que diseñarla: los hijos no comparten estado con el gestor por arte de magia.

## Qué hacer

1. Empieza con un agente y añade [[glosario/subagente|subagentes]] de solo lectura para aislar contexto ([[roadmap/60-multiagente/01-cuando-no-usar-multiagente]]).
2. Si añades revisor, sin contexto compartido. El patrón [[patrones/13-ejecutor-y-asesor]] recoge el «amigo listo».
3. Mide los tokens por rol antes de multiplicar agentes ([[roadmap/60-multiagente/05-coste-de-multiplicar-agentes]]).
