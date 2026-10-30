---
titulo: OpenCode
descripcion: Agente de código open source para la terminal que funciona con cualquier proveedor, incluidos modelos locales a través de Ollama.
creado: 2026-10-29
tags: [agente-de-codigo, terminal, modelos-abiertos]
relacionados: ["[[recetas/agente-de-codigo-con-modelo-local]]", "[[docs/modelos-abiertos/10-agentes-de-codigo-abiertos]]", "[[cursos/agentes-de-codigo/01-como-trabaja-un-agente-de-codigo]]"]
categoria: agente-de-codigo
licencia: MIT
open_source: true
lenguajes: [TypeScript]
url: https://opencode.ai
repositorio: https://github.com/anomalyco/opencode
version: "1.19.5"
revisado: 2026-10-29
---

OpenCode es un agente de código para la terminal con licencia MIT (repositorio `anomalyco/opencode`; paquete npm `opencode-ai`, que instala el comando `opencode`). Lee y edita ficheros de tu repositorio, ejecuta comandos y trabaja en bucle hasta terminar la tarea, como cualquier [[sistemas/agente-de-codigo]]. No está atado a un proveedor: se configura con la API de Claude, la de OpenAI o cualquier endpoint compatible con OpenAI, incluido un [[glosario/inferencia-local|modelo local]].

## Para qué sirve

- Trabajar con un agente de código en la terminal eligiendo tú el modelo.
- Usar un modelo de [[glosario/pesos-abiertos]] en local para código privado, sin que nada salga de la máquina.
- Comparar modelos en las mismas tareas de tu repositorio sin cambiar de herramienta.

## Cuándo usarla

Cuando quieres un agente de terminal open source y sin dependencia de proveedor, o cuando la privacidad obliga a usar un modelo local ([[recetas/agente-de-codigo-con-modelo-local]]).

## Cuándo no

- Con modelos locales pequeños en bucles largos: fallan más con muchas llamadas a herramientas encadenadas. Mide en tus tareas antes de confiar.
- Sin contexto suficiente: la documentación de Ollama dice que OpenCode necesita **64k tokens de contexto o más**.

## Ejemplo mínimo

La forma más corta con Ollama, según su documentación de integraciones:

```bash
npm install -g opencode-ai          # en macOS y Linux también: curl -fsSL https://opencode.ai/install | bash
ollama launch opencode              # configura OpenCode contra tus modelos locales y lo arranca
ollama launch opencode --config     # solo configura, sin abrir la sesión
opencode                            # dentro de tu repositorio
```

O a mano, con un proveedor compatible con OpenAI en `opencode.json`:

```json title="opencode.json"
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": { "baseURL": "http://localhost:11434/v1" },
      "models": { "qwen3.6:27b": { "name": "qwen3.6:27b" } }
    }
  }
}
```

No se ha ejecutado aquí (sin modelo local). Recuerda subir el contexto del modelo en Ollama: con el valor por defecto, el *prompt* del agente se trunca en silencio.

> [!aviso] Dos líneas de versiones
> Esta ficha y sus ejemplos son de la línea 1.x (`opencode-ai` 1.19.5). El README actual del repositorio ya promociona la línea 2.x (paquete `@opencode/cli`, 2.2.2 el 29 oct. 2026; instalador `curl -fsSL https://opencode.ai/v2/install | bash`). No he comprobado que `opencode.json` y la integración de Ollama sean idénticos en la 2.x: mira su documentación antes de migrar.

> [!peligro] Modos sin permisos
> Saltarse las confirmaciones solo tiene sentido dentro de un entorno aislado (contenedor o máquina virtual). Un agente con acceso a tu terminal puede borrar, publicar o filtrar secretos ([[recetas/proteger-secretos-del-agente]]).

## Alternativas

- [[herramientas/claude-code]]: el agente de Anthropic, propietario.
- [[herramientas/aider]]: edición con git por terminal.
- [[herramientas/cline]]: CLI y extensión con MCP.
- [[herramientas/goose]] y [[herramientas/openhands]]: otros agentes abiertos.
- Codex CLI (Apache-2.0) y Gemini CLI (Apache-2.0); comparativa en [[docs/modelos-abiertos/10-agentes-de-codigo-abiertos]].

## Enlaces

- Web y documentación: [opencode.ai](https://opencode.ai)
- Integración con Ollama: [docs.ollama.com/integrations/opencode](https://docs.ollama.com/integrations/opencode)
- Paquete npm: [npmjs.com/package/opencode-ai](https://www.npmjs.com/package/opencode-ai)
- Repositorio: [github.com/anomalyco/opencode](https://github.com/anomalyco/opencode)
