---
titulo: Effective context engineering for AI agents (Anthropic, 2025)
descripcion: El ensayo que tomó el contexto como un presupuesto de atención finito y ordenó las técnicas para gestionarlo, de la altitud del prompt a la compactación y los subagentes.
creado: 2026-10-29
tags: [biblioteca, contexto, context-engineering, agentes]
relacionados: ["[[disciplinas/context-engineering]]", "[[cursos/context-engineering/01-el-contexto-como-presupuesto]]", "[[biblioteca/context-rot]]", "[[glosario/compactacion]]"]
autores: Rajasekaran, Dixon, Ryan y Hadfield (Anthropic)
anio: 2025
url: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
tipo: ensayo
tema: contexto
nivel: intermedio
---

*Effective context engineering for AI agents* (equipo de Applied AI de Anthropic, 29 de septiembre de 2025) sostiene que la pregunta central al construir con LLM ha cambiado. Ya no es tanto qué palabras poner en el prompt como qué configuración de contexto tiene más probabilidades de producir el comportamiento que buscas. El texto define el *context engineering*, explica por qué hace falta y reúne las técnicas que hoy usan los agentes largos.

## La idea clave

El ensayo define el contexto como el conjunto de tokens que el modelo tiene delante al generar, y el *[[disciplinas/context-engineering|context engineering]]* como las estrategias para seleccionar y mantener el mejor conjunto posible durante la inferencia. Eso incluye el prompt de sistema, las herramientas, los servidores [[glosario/mcp|MCP]], los datos externos y el historial. El *prompt engineering* queda como una parte: escribir y ordenar instrucciones.

**La premisa es que el contexto es un recurso finito con rendimientos decrecientes.** El texto habla de un «presupuesto de atención» que cada token nuevo gasta un poco. Da tres razones: en un Transformer cada token atiende a todos los demás, los modelos ven en el entrenamiento más secuencias cortas que largas y la extensión de posiciones a contextos largos pierde algo de precisión. El resultado es una pendiente, sin precipicio: el modelo sigue siendo capaz con mucho contexto, pero recupera y razona con menos precisión. Es el [[glosario/context-rot|context rot]].

De ahí sale el principio guía: encontrar **el conjunto más pequeño de tokens con mucha señal** que maximice la probabilidad del resultado. Mínimo no significa corto.

## Por qué importa hoy

Es el mapa más claro de las técnicas que usarás en cualquier agente. Por componentes:

- **Prompt de sistema a la «altitud correcta».** Entre dos fallos: lógica *if-else* rígida que se rompe y guías vagas que suponen contexto compartido. Empieza con un prompt mínimo con el mejor modelo y añade instrucciones según los fallos que observes.
- **Herramientas autocontenidas y sin solapes.** Si una persona no sabe qué herramienta usar en un caso, el agente tampoco.
- **Pocos ejemplos canónicos y variados**, en vez de listas de reglas para cada caso raro.
- **Recuperación *just in time*.** El agente guarda identificadores ligeros (rutas, consultas, URLs) y carga el contenido con herramientas cuando lo necesita. Claude Code lo combina con carga previa: `CLAUDE.md` entra al principio y `glob` y `grep` traen archivos bajo demanda.

Para tareas de horas, el ensayo propone tres técnicas, cada una con su terreno:

| Técnica | Qué hace | Encaja con |
|---|---|---|
| [[glosario/compactacion\|Compactación]] | Resume la conversación cerca del límite y sigue en una ventana nueva | Mucho ida y vuelta |
| Notas estructuradas | El agente escribe notas fuera de la ventana y las relee | Desarrollo iterativo con hitos |
| Subagentes | Exploran con contexto limpio y devuelven un resumen condensado, a menudo de 1.000 a 2.000 tokens | Investigación con exploración en paralelo |

Para la compactación da un consejo de ajuste útil: primero maximiza la exhaustividad para no perder nada relevante, y luego mejora la precisión quitando lo que sobra. La forma más ligera es borrar resultados de herramientas antiguos del historial.

> [!consejo] La pregunta para cada token
> Antes de añadir algo al contexto, pregúntate qué decisión del modelo cambia. Si no cambia ninguna, déjalo fuera o tráelo solo cuando haga falta.

## Qué leer primero

El ensayo es corto: léelo entero. Si vas con prisa:

1. **«Why context engineering is important to building capable agents»**: el presupuesto de atención y sus causas.
2. **«The anatomy of effective context»**: la altitud del prompt, herramientas y ejemplos.
3. **«Context engineering for long-horizon tasks»**: compactación, notas y subagentes, con el ejemplo de Claude jugando a Pokémon con sus propias notas.

## Qué ha envejecido

Poco, porque es reciente y conceptual. Dos matices:

- **Las funciones de plataforma citadas** (la herramienta de memoria en beta, el borrado de resultados de herramientas recién lanzado) evolucionan rápido. Consulta la documentación actual antes de copiar nombres o parámetros.
- **La evidencia del *context rot*** se apoya en pruebas de tipo «aguja en un pajar». Para la medición detallada ve a la fuente empírica, [[biblioteca/context-rot]] de Chroma, que el ensayo recoge.

El propio texto anticipa lo demás: con modelos más capaces hará falta menos ingeniería prescriptiva, pero tratar el contexto como recurso finito seguirá siendo central.

## Dónde lo ves en MoreContext

- [[cursos/context-engineering/01-el-contexto-como-presupuesto]], [[cursos/context-engineering/02-que-meter-y-que-no]], [[cursos/context-engineering/03-compactacion-y-memoria]] y [[cursos/context-engineering/04-contexto-para-agentes-largos]]: el curso completo sobre estas técnicas.
- [[modelos/02-ingenieria-de-contexto]]: el principio aplicado a cómo escribes para el modelo.
- [[roadmap/50-skills/03-carga-bajo-demanda]] y [[glosario/divulgacion-progresiva]]: la recuperación *just in time* llevada a las skills.
- [[roadmap/60-multiagente/03-pasar-contexto-entre-agentes]]: qué devuelve un subagente.
- [[recetas/canario-de-contexto]]: detectar cuándo el contexto empieza a pudrirse.
