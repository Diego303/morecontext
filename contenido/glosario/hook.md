---
titulo: Hook
descripcion: Programa que el harness ejecuta en un evento del agente, como antes de usar una herramienta, y que puede bloquear la acción con código determinista.
creado: 2026-10-29
categoria: agentes
ingles: Hook
aliases: [hooks, gancho, PreToolUse]
tags: [agentes, claude-code, seguridad, harness]
relacionados: ["[[docs/claude-code/04-hooks]]", "[[roadmap/90-harness/03-permisos-y-hooks]]", "[[recetas/hook-que-bloquea-comandos-peligrosos]]", "[[glosario/fallo-en-cerrado]]"]
---

Un hook es un programa que el [[glosario/harness]] ejecuta automáticamente cuando ocurre un evento del agente: antes o después de usar una herramienta, al terminar un subagente, al compactar. Como es código y no prompt, sirve para poner fronteras que el modelo no puede saltarse.

## En la práctica

En Claude Code se declaran en `settings.json` por evento (`PreToolUse`, `PostToolUse`, `SubagentStop`, `Stop`…) con un `matcher` que filtra la herramienta. El hook recibe por stdin un JSON con `tool_name`, `tool_input` y el resto del contexto. **Si sale con código 2, la acción se bloquea** y lo que escriba en stderr llega al modelo como motivo; también puede devolver `hookSpecificOutput.permissionDecision` (`allow`, `deny` o `ask`). Un `allow` no salta las reglas `deny`. Cualquier otro código de salida es un error que no bloquea (salvo con `onFailure: "block"`), así que un hook de seguridad debe capturar sus propias excepciones y salir con 2 ([[glosario/fallo-en-cerrado]]). El harness del autor usa uno en `PreToolUse` para las fronteras de escritura y otro en `SubagentStop` para registrar el coste.

## No confundir con

- **Permisos**: reglas declarativas `allow`/`ask`/`deny`. El hook decide con lógica arbitraria.
- **Git hooks** y **webhooks**: el mismo nombre, otro mundo.
- **[[glosario/middleware]]**: la idea equivalente dentro del proceso en LangChain.

## Ver también

- [[problemas/el-hook-bloquea-todo]]
- [[cursos/harness-engineering/09-seguridad-en-profundidad]]
- [[glosario/minimo-privilegio]]
