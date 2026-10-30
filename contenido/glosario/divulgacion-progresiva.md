---
titulo: Divulgación progresiva
descripcion: Cargar información en el contexto por niveles, primero un resumen y el detalle solo cuando hace falta, para que el agente sepa qué existe sin pagarlo todo.
creado: 2026-10-29
categoria: contexto
ingles: Progressive disclosure
aliases: [progressive disclosure, carga bajo demanda, carga progresiva]
tags: [contexto, skills, agentes]
relacionados: ["[[roadmap/50-skills/03-carga-bajo-demanda]]", "[[glosario/skill]]", "[[glosario/carga-diferida-de-herramientas]]", "[[disciplinas/context-engineering]]"]
---

La divulgación progresiva es dar al modelo la información por capas: al principio solo un índice de lo que existe y, cuando la tarea lo pide, el detalle. Así el agente sabe a qué puede recurrir sin que todo ocupe la [[glosario/ventana-de-contexto]] desde el primer turno.

## En la práctica

El caso de referencia son las [[glosario/skill|skills]]. Anthropic lo describió en [*Equipping agents for the real world with Agent Skills*](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) (octubre de 2025) con tres niveles: nombre y descripción en el prompt de sistema; el cuerpo de `SKILL.md` cuando la skill es relevante; y los archivos enlazados solo si el agente los abre. La especificación habla de unos 100 tokens por skill en el primer nivel y recomienda cuerpos de menos de 5.000 tokens. El mismo principio sirve para un `AGENTS.md` que funciona como índice y apunta a documentos, o para un catálogo de herramientas que se carga bajo demanda.

La condición es que cada capa diga lo suficiente para decidir si abrir la siguiente. Una descripción vaga hace que el agente no cargue lo que necesita o cargue lo que no.

## No confundir con

- **[[glosario/carga-diferida-de-herramientas]]**: una aplicación concreta del principio a definiciones de herramientas.
- **[[glosario/rag]]**: busca fragmentos por similitud; aquí el agente navega una estructura que tú diseñas.

## Ver también

- [[cursos/context-engineering/02-que-meter-y-que-no]]
- [[docs/estandares/04-agent-skills-y-agents-md]]
- [[glosario/agents-md]]
