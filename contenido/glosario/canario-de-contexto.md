---
titulo: Canario de contexto
descripcion: Regla trivial y visible en las instrucciones del agente, como empezar cada respuesta con un prefijo, cuyo incumplimiento avisa de que el contexto está saturado.
creado: 2026-10-29
categoria: contexto
ingles: Context canary
aliases: [context canary, canario, canario del contexto]
tags: [contexto, claude-code, sesiones-largas]
relacionados: ["[[recetas/canario-de-contexto]]", "[[cursos/harness-engineering/11-sesiones-largas]]", "[[glosario/traspaso-de-sesion]]", "[[problemas/contexto-saturado-en-sesiones-largas]]"]
---

Un canario de contexto es una instrucción fácil de cumplir y fácil de ver que pones al principio de las instrucciones del agente. Mientras la cumple, sigue atendiendo a sus reglas; cuando deja de cumplirla, es probable que también esté olvidando otras, y conviene cambiar de sesión.

## En la práctica

El harness del autor lo pone en la cabecera de `CLAUDE.md`: el agente debe empezar **siempre** cada respuesta con «&lt;TU NOMBRE&gt; ·», incluidas las cortas y las que siguen a una herramienta, sin explicarlo ni omitirlo. Tú pones tu nombre. Cuando una respuesta llega sin el prefijo, haces un [[glosario/traspaso-de-sesion]] a una sesión limpia en lugar de seguir. Solo lo lleva el orquestador: sus subagentes se definen con `omitClaudeMd: true`, no cargan `CLAUDE.md` y sus informes no cambian de formato.

Es una heurística: no te dice cuánto se ha degradado el agente, solo que algo que debería ser automático ha dejado de serlo. Su valor es que no cuesta casi nada y lo ves en cada respuesta. Responde a un problema real: el rendimiento baja con contextos largos aunque la información siga ahí ([[glosario/context-rot]]).

## No confundir con

- **Despliegue canario**: publicar una versión para una parte del tráfico.
- **Token canario**: un secreto falso que delata una fuga.

## Ver también

- [[glosario/claude-md]]
- [[glosario/compactacion]]
- [[cursos/context-engineering/04-contexto-para-agentes-largos]]
