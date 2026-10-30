---
titulo: "Nivel 50 · Skills: procedimientos para tu agente"
descripcion: Aprende a empaquetar procedimientos en skills que el agente carga solo cuando hacen falta, con scripts de apoyo, casos de activación y criterio para compartirlas sin riesgos.
creado: 2026-10-29
nivel: 50
horas: 3
objetivo: Empaquetar procedimientos en skills que el agente carga solo cuando hacen falta.
prerrequisitos: ["[[roadmap/20-herramientas/index]]", "[[roadmap/40-primer-agente/index]]"]
proyecto:
  titulo: Tu primera skill con evaluación
  descripcion: Una skill que resuelve un procedimiento real de tu trabajo, con un script de apoyo y cinco casos que demuestran que se activa cuando debe.
  entregable: Carpeta de la skill (SKILL.md + script) y un archivo de casos con el resultado de cada uno.
tags: [skills, agentes, contexto, claude-code]
relacionados: ["[[glosario/skill]]", "[[docs/claude-code/03-skills]]", "[[docs/estandares/04-agent-skills-y-agents-md]]", "[[plantillas/skill]]"]
---

Tu agente ya sabe usar herramientas y trabajar en bucle. Lo que todavía no sabe es **cómo se hacen las cosas en tu equipo**: cómo redactáis las notas de versión, qué pasos tiene una revisión de seguridad, qué comandos validan una migración. Una [[glosario/skill|skill]] es la forma de enseñárselo una vez y que el agente lo recupere solo cuando lo necesita, sin cargar el prompt de sistema con cien procedimientos que casi nunca usa.

## Para quién es

Para quien ha hecho el [[roadmap/20-herramientas/index|nivel 20]] (sabe qué es una herramienta y cómo la elige el modelo) y el [[roadmap/40-primer-agente/index|nivel 40]] (tiene un agente en bucle). Te servirá igual si usas un agente de código como Claude Code que si construyes el tuyo con un SDK: el formato `SKILL.md` es un estándar abierto, Agent Skills, que hoy custodia la Agentic AI Foundation y leen muchas herramientas.

## Qué vas a construir

Una skill propia para un procedimiento que repites en tu trabajo. La lección práctica usa como ejemplo una skill de notas de versión: un `SKILL.md` con el procedimiento, un script en Python que agrupa los commits (la parte determinista) y un archivo con cinco casos que dicen cuándo debe activarse y cuándo no. Lo importante del proyecto no es la skill en sí, sino **demostrar que se activa cuando toca**: una skill que nunca se carga no existe, y una que se carga siempre es un prompt de sistema disfrazado.

## Lecciones

1. [[roadmap/50-skills/01-que-es-una-skill]]. Qué es una skill y en qué se diferencia de un prompt de sistema, una herramienta, un servidor MCP, un subagente y un comando, con una tabla para elegir.
2. [[roadmap/50-skills/02-anatomia-de-una-skill]]. El `SKILL.md` campo a campo, los recursos de la carpeta, dónde vive cada skill y quién la invoca, con una skill real del harness del autor anotada.
3. [[roadmap/50-skills/03-carga-bajo-demanda]]. La divulgación progresiva: qué entra en el contexto y cuándo, cuánto cuesta y cómo escribir una `description` que active la skill en el momento justo.
4. [[roadmap/50-skills/04-escribir-tu-primera-skill]]. La práctica: elegir el procedimiento, escribir la skill, ejecutar su script, validarla contra el estándar, probar la activación e iterar. Incluye la Skills API.
5. [[roadmap/50-skills/05-skills-en-equipo]]. Distribuir y versionar skills, reservar algunas para el humano, revisar las de terceros como si fueran dependencias y cuidar las licencias.

> [!consejo] Empieza por un procedimiento que ya hayas explicado tres veces
> Las buenas skills nacen de la repetición: si te has visto escribiendo las mismas instrucciones al agente en varias sesiones, ahí hay una skill. Si no lo has repetido, aún no sabes qué poner en ella.

## Después de este nivel

Con skills, herramientas y un bucle ya tienes las piezas para repartir trabajo entre varios agentes: [[roadmap/60-multiagente/index]]. Si trabajas con Claude Code, la referencia completa está en [[docs/claude-code/03-skills]], y el [[roadmap/90-harness/index|nivel 90]] muestra cómo encajan las skills dentro de un harness con permisos, hooks y estado.
