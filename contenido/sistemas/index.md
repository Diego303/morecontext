---
titulo: Sistemas
descripcion: Arquitecturas completas de proyectos reales con agentes, con diagrama, componentes, código esencial, evaluación, costes y riesgos.
creado: 2026-07-08
actualizado: 2026-10-29
orden: 5
tags: [sistemas, arquitectura]
relacionados: ["[[patrones/index]]", "[[recetas/index]]", "[[roadmap/index]]"]
---

Un sistema es **un proyecto completo explicado de principio a fin**: qué problema resuelve, qué piezas tiene, cómo fluye una petición y qué decisiones de diseño hay detrás. Aquí se juntan las lecciones, los [[patrones/index|patrones]] y las [[recetas/index|recetas]] en algo que podrías poner en producción.

## Qué sistemas hay

- [[sistemas/rag-con-citas]]: responde sobre tus documentos, cita la fuente y se abstiene si no la encuentra. Buen primer sistema.
- [[sistemas/extraccion-documental]]: facturas y contratos a JSON validado, con revisión humana de los casos dudosos.
- [[sistemas/soporte-con-aprobacion-humana]]: resuelve tickets con herramientas y pide permiso antes de reembolsar.
- [[sistemas/asistente-de-datos-con-mcp]]: consultas en lenguaje natural sobre tu base de datos, con un servidor MCP de solo lectura.
- [[sistemas/agente-de-codigo]]: lee el repositorio, propone cambios, ejecuta tests y deja una propuesta revisable.
- [[sistemas/investigacion-multiagente]]: un orquestador reparte la pregunta entre subagentes que buscan en paralelo.
- [[sistemas/agente-de-voz]]: voz a texto, modelo con herramientas y texto a voz, con la latencia como problema central.
- [[sistemas/asistente-100-local]]: un asistente con herramientas y RAG que no sale de tu máquina, con modelo local, LangGraph, base vectorial y trazas autoalojadas.

### Agentes de código con arnés

- [[sistemas/harness-sdd-claude-code]]: el harness del autor para Claude Code, con orquestador, cuatro subagentes, spec congelada, una sola puerta humana y *hooks* de seguridad y coste.
- [[sistemas/harness-sdd-olas]]: la variante que construye varias features a la vez, cada una en su *worktree* y su sesión, y las integra de una en una.
- [[sistemas/agente-de-larga-duracion]]: un agente que avanza durante horas sobre un repositorio, con lista de funcionalidades en disco, git como memoria y un evaluador separado.

## Cómo leer cada ficha

La cabecera de cada sistema resume cuatro datos:

| Dato | Qué te dice |
|---|---|
| Complejidad (1–3) | Cuánto cuesta construirlo y mantenerlo |
| Tiempo | Lo que lleva una primera versión funcional |
| Stack y componentes | Las piezas que necesitas |
| Patrones | Qué patrones de agentes combina, con enlace a cada uno |

Después viene siempre la misma estructura: problema, diagrama, componentes, flujo paso a paso, decisiones de diseño y alternativas, código esencial, cómo evaluarlo, costes y riesgos, variantes y por dónde empezar.

El código esencial usa la API de Claude porque enseña el mecanismo sin capas. Donde aporta, la sección de variantes incluye la misma pieza con herramientas abiertas (LangGraph, LangChain, Pydantic AI, Qdrant, Ollama o vLLM), probada con modelos simulados, y una tabla corta de qué cambia. Para elegir entre ambas vías, [[docs/frameworks/01-elegir-framework]] y [[cursos/agentes-con-modelos-abiertos/06-local-o-api]].

> [!consejo] Empieza por la versión pequeña
> Cada ficha termina con «Por dónde empezar». Construye esa versión primero, mídela con un conjunto de prueba y añade piezas solo cuando sepas qué falla.
