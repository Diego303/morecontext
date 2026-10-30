---
titulo: Cline
descripcion: Agente de código open source en CLI y extensión de editor, con modos plan y act, MCP, skills y cualquier endpoint compatible con OpenAI.
creado: 2026-10-29
tags: [agente-de-codigo, mcp, terminal]
relacionados: ["[[docs/modelos-abiertos/10-agentes-de-codigo-abiertos]]", "[[glosario/servidor-mcp]]", "[[cursos/agentes-de-codigo/03-explorar-planificar-implementar-verificar]]"]
categoria: agente-de-codigo
licencia: Apache-2.0
open_source: true
lenguajes: [TypeScript]
url: https://cline.bot
repositorio: https://github.com/cline/cline
version: "3.0.74"
revisado: 2026-10-29
---

Cline es un agente de código con licencia Apache-2.0 que se usa como extensión del editor o como CLI (`npm install -g cline`). Separa **planificar** y **actuar** (modos *plan* y *act*), pide aprobación antes de cada herramienta salvo que lo desactives, y declara soporte nativo de [[glosario/mcp]], reglas y [[glosario/skill|skills]]. Acepta la API de varios proveedores y cualquier endpoint compatible con OpenAI.

## Para qué sirve

- Trabajar con un agente que primero propone un plan y luego lo ejecuta con tu visto bueno ([[cursos/agentes-de-codigo/03-explorar-planificar-implementar-verificar]]).
- Añadir herramientas con servidores MCP desde la propia CLI.
- Automatizar: ejecución de un solo turno, salida JSON por líneas (NDJSON) para encadenar con otras herramientas, revisión de un `git diff` por la entrada estándar.

## Cuándo usarla

Si quieres un agente open source con aprobaciones visibles, MCP y la opción de usarlo igual en el editor y en scripts.

## Cuándo no

- Con `--yolo` (sin aprobaciones) fuera de un entorno aislado: el agente ejecuta comandos sin preguntar.
- Si buscas un agente que solo edite y haga commits con git, sin más capas: [[herramientas/aider]].

## Ejemplo mínimo

Comandos del README de la CLI. No se ha ejecutado aquí (sin clave).

```bash
npm install -g cline
cline auth --provider anthropic --apikey <tu-clave> --modelid claude-sonnet-5-5

cline                                         # interfaz de terminal, con plan/act y aprobaciones
cline "Audita este paquete y propón arreglos"  # un solo turno y sale
git diff origin/main | cline "Revisa estos cambios"

# Un servidor MCP stdio: todo lo que va tras -- es el comando
cline mcp install fs -- npx -y @modelcontextprotocol/server-filesystem .
```

Para un endpoint compatible con OpenAI (por ejemplo, un servidor local), el README usa `cline auth --provider openai-native --apikey … --modelid … --baseurl <url>/v1`. Con modelos locales, elige uno con herramientas y contexto amplio.

> [!peligro] Servidores MCP de terceros
> Un servidor MCP ejecuta código en tu máquina y sus resultados entran en el contexto del agente. Instala solo los que conoces y dales el directorio mínimo, como en el ejemplo con `.` en lugar de tu `$HOME` ([[docs/seguridad/04-mcp-y-skills-de-terceros]]).

## Alternativas

- [[herramientas/opencode]]: agente de terminal MIT.
- [[herramientas/claude-code]]: propietario, con MCP, *skills*, *hooks* y subagentes.
- [[herramientas/goose]]: agente abierto extensible con MCP.

## Enlaces

- Web: [cline.bot](https://cline.bot)
- Documentación: [docs.cline.bot](https://docs.cline.bot)
- Repositorio: [github.com/cline/cline](https://github.com/cline/cline)
