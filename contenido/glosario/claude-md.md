---
titulo: CLAUDE.md
descripcion: Archivo de memoria del proyecto que Claude Code carga al arrancar, con niveles que se suman e imports, para fijar reglas, comandos y contexto.
creado: 2026-10-29
categoria: agentes
aliases: [claude.md, memoria del proyecto, CLAUDE.local.md]
tags: [agentes, claude-code, contexto]
relacionados: ["[[docs/claude-code/01-memoria-claude-md-y-agents-md]]", "[[plantillas/claude-md]]", "[[glosario/agents-md]]", "[[glosario/canario-de-contexto]]"]
---

`CLAUDE.md` es el archivo de instrucciones que Claude Code mete en el contexto al empezar cada sesión. Ahí van las reglas del proyecto, los comandos de verificación y lo que el agente debe saber siempre.

## En la práctica

Hay cuatro niveles y **se concatenan**, no se sustituyen: política gestionada, usuario (`~/.claude/CLAUDE.md`), proyecto (`./CLAUDE.md` o `./.claude/CLAUDE.md`) y local (`./CLAUDE.local.md`, fuera de git). Puedes importar otros archivos con `@ruta`, hasta 4 saltos; así un `CLAUDE.md` mínimo importa `@AGENTS.md` y el contrato de tu harness. Los comentarios HTML se eliminan antes de inyectarlo. Dos trampas: el Claude Agent SDK solo lo carga si `setting_sources` incluye `"project"`, y `claude -p --bare` lo ignora.

Como se lee en cada sesión, cada línea cuesta tokens y atención. Pon reglas concretas y deja el detalle en archivos a los que apunte. En el harness del autor, `CLAUDE.md` define el rol del orquestador y lleva el [[glosario/canario-de-contexto]].

## No confundir con

- **[[glosario/agents-md]]**: formato abierto para cualquier agente; Claude Code lo lee si no hay `CLAUDE.md`.
- **[[glosario/memoria]]** automática: notas que el propio agente escribe entre sesiones.

## Ver también

- [[cursos/agentes-de-codigo/02-contexto-del-repositorio]]
- [[docs/frameworks/03-claude-agent-sdk]]
- [[herramientas/claude-code]]
