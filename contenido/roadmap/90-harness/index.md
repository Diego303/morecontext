---
titulo: "Nivel 90 · Harness: el entorno del agente"
descripcion: Qué es el harness que rodea al modelo, qué piezas lo forman y cómo montar uno mínimo con permisos, un hook que bloquea, un registro de eventos y un presupuesto.
creado: 2026-10-29
nivel: 90
horas: 5
objetivo: Diseñar el entorno que hace a un agente fiable, verificable, reanudable, seguro y con coste controlado.
prerrequisitos: ["[[roadmap/50-skills/index]]", "[[roadmap/70-flujos-con-especificacion/index]]", "[[roadmap/80-evals/index]]"]
proyecto:
  titulo: Un harness mínimo para tu agente
  descripcion: Envuelve un agente de código con permisos, un hook que bloquea lo peligroso, un registro de eventos y un presupuesto.
  entregable: Repositorio con la configuración del harness, el hook con sus tests y una traza de una ejecución bloqueada y otra correcta.
tags: [harness, agentes-de-codigo, seguridad, costes]
relacionados: ["[[glosario/harness]]", "[[disciplinas/harness-engineering]]", "[[cursos/harness-engineering/index]]", "[[sistemas/harness-sdd-claude-code]]"]
---

Un agente es un modelo más todo lo que lo rodea: instrucciones, herramientas, permisos, memoria, verificación, puntos de aprobación, registro y límites de gasto. A eso se le llama **[[glosario/harness|harness]]** (arnés), y diseñarlo es la parte del trabajo que más influye en si el agente es fiable. En este nivel aprendes qué piezas tiene un harness, cuáles importan primero y montas uno mínimo que funciona.

## Para quién es

Para quien ya construyó un agente ([[roadmap/40-primer-agente/index]]), sabe empaquetar procedimientos en skills ([[roadmap/50-skills/index]]), trabaja con especificación y aceptación ejecutable ([[roadmap/70-flujos-con-especificacion/index]]) y mide con evals ([[roadmap/80-evals/index]]). Aquí juntas esas piezas en un entorno coherente.

El nivel es genérico. Las ideas valen igual para Claude Code, Codex, OpenCode o un bucle escrito por ti; el proyecto usa Claude Code (o el Claude Agent SDK) porque sus hooks reciben JSON por la entrada estándar y se prueban sin gastar un token. Si quieres ver un harness completo, con cuatro agentes, máquina de estados y una sola puerta humana, el estudio a fondo está en [[cursos/harness-engineering/index]].

## Qué vas a construir

Un harness mínimo para un repositorio tuyo:

```mermaid
flowchart LR
  A[Agente] -- cada herramienta --> G[Hook guard]
  G -- deny / ask --> A
  G -- sin opinión --> P[Permisos]
  P --> T[Herramienta]
  T --> R[Registro de eventos]
  G -. lee .-> C[Presupuesto]
```

Permisos declarativos en `.claude/settings.json`, un hook `PreToolUse` que bloquea comandos destructivos, secretos y git que publica, con sus tests; un registro JSONL de lo que pasa en cada sesión y un presupuesto que para el trabajo nuevo cuando se agota.

## Lecciones

1. [[roadmap/90-harness/01-que-es-un-harness]]. Agente = modelo + harness, de prompt a context a harness engineering con fechas, y ejemplos públicos.
2. [[roadmap/90-harness/02-las-piezas-de-un-harness]]. Las quince piezas y el problema que resuelve cada una.
3. [[roadmap/90-harness/03-permisos-y-hooks]]. Permisos frente a hooks, fallo en cerrado, instrucciones frente a datos y un hook `PreToolUse` probado.
4. [[roadmap/90-harness/04-estado-coste-y-contexto]]. Estado en disco, reanudar, medir coste por transcript, contexto mínimo y traspaso de sesión.
5. [[roadmap/90-harness/05-un-harness-minimo]]. El proyecto, paso a paso y comprobado.

> [!consejo] Mide antes de añadir piezas
> Un harness cuesta tokens, tiempo y mantenimiento. Con un modelo que ya acierta de forma consistente, a veces basta con una puerta de aceptación final. Añade cada pieza para un fallo que hayas visto.

## Después de este nivel

Con el harness mínimo funcionando, [[roadmap/100-produccion/index]] te lleva a desplegar agentes con observabilidad y control de costes. Para crecer hacia un harness completo, sigue [[cursos/harness-engineering/index]] o estudia [[sistemas/harness-sdd-claude-code]] y su variante en paralelo, [[sistemas/harness-sdd-olas]].
