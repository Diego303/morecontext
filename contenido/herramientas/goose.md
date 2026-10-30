---
titulo: goose
descripcion: Agente abierto de propósito general, en escritorio y CLI, que se amplía con extensiones MCP y recetas reutilizables y funciona con varios proveedores.
creado: 2026-10-29
tags: [agente-de-codigo, mcp, terminal]
relacionados: ["[[docs/modelos-abiertos/10-agentes-de-codigo-abiertos]]", "[[glosario/mcp]]", "[[docs/seguridad/04-mcp-y-skills-de-terceros]]"]
categoria: agente-de-codigo
licencia: Apache-2.0
open_source: true
lenguajes: [Rust]
url: https://goose-docs.ai/
repositorio: https://github.com/aaif-goose/goose
version: "1.57.0"
revisado: 2026-10-29
---

goose es un agente de propósito general que su documentación describe como «the open-source agent application». Nació en Block y hoy su repositorio está en la organización `aaif-goose`. Funciona como aplicación de escritorio o como CLI, ejecuta tareas en tu máquina (código, comandos, ficheros) y se amplía con **extensiones**, que son servidores [[glosario/mcp]], y con **recetas**, flujos reutilizables descritos en un fichero.

**Licencia**: Apache-2.0, open source. Lo confirman el `LICENSE` del repositorio `aaif-goose/goose`, el campo `license` de su `Cargo.toml` y el README. Si en algún sitio de la documentación lees «MIT», está desfasado. La versión indicada (1.57.0) es la que declara el `Cargo.toml` del repositorio al revisar la ficha; las versiones empaquetadas pueden ir por detrás.

## Para qué sirve

- Un agente local que no se limita a programar: también automatiza tareas con las herramientas que le conectes por MCP.
- Recetas para repetir el mismo flujo (por ejemplo, revisar un repositorio o preparar un informe) con los mismos pasos y herramientas.
- Elegir proveedor de modelo, incluidos modelos locales como Ollama, según su guía de proveedores.

## Cuándo usarla

Si quieres un agente abierto con interfaz de escritorio además de CLI, y tu caso pasa por combinar varias herramientas MCP más que por editar código.

## Cuándo no

- Para trabajo de código muy centrado en git y cambios pequeños: [[herramientas/aider]].
- Con extensiones de terceros sin revisar: cada servidor MCP es código que se ejecuta con tus permisos y una vía de [[glosario/inyeccion-de-prompt]] ([[docs/seguridad/04-mcp-y-skills-de-terceros]]).

## Ejemplo mínimo

Instalación de la CLI según la documentación (no se ha ejecutado aquí):

```bash
curl -fsSL https://github.com/aaif-goose/goose/releases/download/stable/download_cli.sh | bash
```

Después se configura el proveedor de modelo y se abre una sesión desde la CLI o desde goose Desktop. Los subcomandos exactos (en las versiones que conocemos, `goose configure` para el proveedor y `goose session` para la sesión) pueden cambiar: compruébalos en la referencia de la CLI de la documentación antes de copiarlos en un script.

> [!aviso] Ejecutar un script remoto
> `curl … | bash` ejecuta lo que descargas sin que lo leas. En una máquina de trabajo, descarga el script, léelo y ejecútalo después, o instala desde las *releases* del repositorio.

## Alternativas

- [[herramientas/opencode]]: agente de terminal MIT para código.
- [[herramientas/cline]]: CLI y extensión con MCP y *skills*.
- [[herramientas/openhands]]: agentes con *sandbox* Docker y automatizaciones.
- [[herramientas/claude-code]]: propietario.

## Enlaces

- Documentación: [goose-docs.ai](https://goose-docs.ai/)
- Repositorio: [github.com/aaif-goose/goose](https://github.com/aaif-goose/goose)
