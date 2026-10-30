---
titulo: Un agente de código con un modelo local
descripcion: Conecta OpenCode o Codex CLI a un modelo abierto en Ollama con 64k de contexto, permisos cerrados, entorno aislado y un AGENTS.md corto, y aprende hasta dónde llega.
creado: 2026-10-29
nivel: inicial
minutos: 30
tema: agentes
stack: [Ollama, OpenCode]
tags: [agentes-de-codigo, ollama, opencode, codex, modelos-abiertos, open-source]
relacionados: ["[[docs/modelos-abiertos/10-agentes-de-codigo-abiertos]]", "[[herramientas/opencode]]", "[[herramientas/ollama]]", "[[cursos/agentes-con-modelos-abiertos/02-tu-primer-modelo-en-local]]", "[[plantillas/agents-md]]"]
---

## Problema

Quieres un agente de código que lea tu repositorio, edite archivos y ejecute los tests, pero el código no puede salir de tu máquina, o simplemente quieres probar sin pagar por token. La pieza que falta es conectar un agente de terminal abierto a un modelo de [[glosario/pesos-abiertos|pesos abiertos]] servido en local, sin que se quede ciego por falta de contexto ni pueda romper nada.

Esta receta usa [[herramientas/opencode|OpenCode]] (licencia MIT) con [[herramientas/ollama|Ollama]], y muestra la misma conexión con Codex CLI (Apache-2.0). Las dos son open source; Claude Code también se puede apuntar a Ollama, pero es propietario.

## Ingredientes

- [[herramientas/ollama|Ollama]] (la receta se comprobó contra la documentación de la v0.40.12, del 27 de octubre de 2026).
- Un modelo con herramientas que quepa en tu memoria. Ejemplo: `qwen3.6:27b`, que en Q4_K_M ocupa unos 17 GB según la ficha de Ollama. Cómo hacer la cuenta, en [[modelos/12-inferencia-local]].
- OpenCode (`npm install -g opencode-ai` o el instalador de su web) o Codex CLI (`npm install -g @openai/codex`).
- Un repositorio con tests que se ejecuten con un comando.

> [!nota] Qué se ha ejecutado aquí
> Esta receta no se ha ejecutado: la máquina donde se escribió no tiene servidor de modelos. Los comandos y archivos salen de la documentación de Ollama, OpenCode y Codex consultada el 29 de octubre de 2026.

## Pasos

1. **Sube el contexto antes de nada.** El contexto por defecto de Ollama es pequeño y su documentación ni siquiera coincide consigo misma (según la página, 2048, 4096 o un valor que depende de la VRAM). Si el *prompt* del agente no cabe, Ollama **lo trunca en silencio**: el agente pierde las instrucciones o las herramientas sin avisar. OpenCode y Codex piden al menos 64k ([integración de OpenCode](https://docs.ollama.com/integrations/opencode), [integración de Codex](https://docs.ollama.com/integrations/codex)).

```bash
OLLAMA_CONTEXT_LENGTH=65536 ollama serve     # en otra terminal
ollama pull qwen3.6:27b
ollama run qwen3.6:27b "hola" && ollama ps   # mira las columnas CONTEXT y PROCESSOR
```

   `ollama ps` debe mostrar 65536 en `CONTEXT`. Si `PROCESSOR` dice que parte del modelo va a CPU, irá lento: baja de modelo o de contexto. La API compatible con OpenAI que usan estos agentes no tiene campo para el contexto, por eso se fija en el servidor.

2. **Conecta el agente con `ollama launch`.** Es la vía corta: configura el agente para hablar con tu Ollama local y te deja elegir modelo.

```bash
ollama launch opencode            # o: ollama launch codex
ollama launch opencode --config   # solo configura, sin abrir la sesión
```

   Si prefieres tenerlo en el repositorio, crea un `opencode.json` en la raíz. OpenCode lo combina con tu configuración global y el del proyecto tiene prioridad. El proveedor es el paquete `@ai-sdk/openai-compatible` apuntando a la API OpenAI de Ollama:

```json title="opencode.json"
{
  "$schema": "https://opencode.ai/config.json",
  "model": "ollama/qwen3.6:27b",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": { "baseURL": "http://localhost:11434/v1" },
      "models": { "qwen3.6:27b": { "name": "qwen3.6:27b" } }
    }
  },
  "permission": {
    "*": "ask",
    "read": { "*": "allow", "*.env": "deny", "*.env.*": "deny" },
    "glob": "allow",
    "grep": "allow",
    "edit": "ask",
    "bash": {
      "*": "ask",
      "git status *": "allow",
      "git diff *": "allow",
      "pytest *": "allow",
      "git push *": "deny",
      "rm *": "deny"
    },
    "webfetch": "deny",
    "websearch": "deny"
  }
}
```

3. **Cierra los permisos.** Por defecto OpenCode deja **casi todo en `allow`**: leer, editar y ejecutar sin preguntar ([permisos](https://opencode.ai/docs/permissions/)). El bloque `permission` de arriba lo invierte: todo pregunta (`"*": "ask"`), los comandos inocuos pasan solos y lo irreversible se bloquea. En los patrones de `bash` gana **la última regla que coincide**, así que pon `"*"` primero. Es el [[glosario/minimo-privilegio|mínimo privilegio]] aplicado a un agente; el porqué, en [[roadmap/90-harness/03-permisos-y-hooks]].

4. **Aíslalo del resto de tu máquina.** Los permisos se configuran; un contenedor es una frontera. Si vas a aprobar en bloque o a dejar al agente solo, mételo en un contenedor que solo vea el repositorio y no tus credenciales:

```bash
# Linux: --network host deja llegar a Ollama en 127.0.0.1:11434.
# Aísla archivos y credenciales, no la red.
docker run --rm -it --network host -v "$PWD":/work -w /work node:22 \
  bash -c "npm install -g opencode-ai && opencode"
```

   La documentación de Ollama lo advierte para los modos que se saltan las aprobaciones: solo dentro de un entorno aislado. Más opciones de [[glosario/sandbox|sandbox]] en [[docs/modelos-abiertos/09-guardrails-y-sandbox]].

5. **Dale un AGENTS.md corto.** OpenCode lee [[glosario/agents-md|AGENTS.md]] de la raíz del proyecto (y, si no existe, `CLAUDE.md`); `/init` genera uno a partir del repositorio y lo mejora si ya existe ([reglas de OpenCode](https://opencode.ai/docs/rules/)). Con un modelo local, **corto es mejor**: cada línea ocupa contexto en cada turno y el modelo pequeño se pierde antes con instrucciones largas.

```markdown title="AGENTS.md"
# Proyecto: facturas

- Python 3.12. Instala con `pip install -e .[dev]`.
- Tests: `pytest -q`. Ejecútalos después de cada cambio y no termines con tests en rojo.
- Código en `src/facturas/`, tests en `tests/`. Un test nuevo por cada función nueva.
- No toques `migrations/` ni `.env`.
- Cambios pequeños: un archivo o una función por tarea.
```

   Plantilla completa en [[plantillas/agents-md]]; cómo lo leen los distintos agentes, en [[docs/claude-code/01-memoria-claude-md-y-agents-md]].

6. **Pide tareas del tamaño correcto.** Una función con su test, un error con su traza, un *refactor* acotado a un archivo. Escribe el criterio de aceptación en la petición: «Añade `total_con_iva()` en `src/facturas/calculo.py` con su test; está bien si `pytest -q` pasa».

## Cómo comprobar que funciona

- `ollama ps` muestra el modelo cargado con `CONTEXT` 65536 mientras el agente trabaja.
- Pide «lista los archivos de `src/` y dime qué hace cada uno». Si responde con nombres reales, el *tool calling* funciona. Si contesta con un JSON en el texto o se inventa archivos, el modelo no está llamando a herramientas ([[problemas/modelo-local-no-llama-herramientas]]).
- Pide la tarea del paso 6 y comprueba tres cosas: que pidió permiso antes de editar, que ejecutó `pytest` sin preguntar (está en `allow`) y que `git diff` solo toca lo pedido.
- Pide «haz `git push`». Debe negarse por la regla `deny`.

## Variaciones

- **Codex CLI a mano.** `codex --oss -m gpt-oss:120b` usa Ollama directamente. `ollama launch codex` crea un perfil en `~/.codex/ollama-launch.config.toml` con `base_url = "http://localhost:11434/v1/"` y `wire_api = "responses"`, que puedes reutilizar con `codex --profile ollama-launch`. La búsqueda web de Codex con Ollama pasa por el servicio de Ollama: desactívala con `-c 'web_search="disabled"'` si nada debe salir de tu red.
- **Claude Code como cliente.** `ollama launch claude`, o a mano con `ANTHROPIC_BASE_URL=http://localhost:11434`, `ANTHROPIC_AUTH_TOKEN=ollama` y `ANTHROPIC_API_KEY=""`. Funciona porque Ollama expone una API compatible con Anthropic ([[radar/2026-10-28-apis-anthropic-en-local]]); el cliente sigue siendo propietario.
- **Modelo en un servidor del equipo.** Sirve el modelo con [[recetas/servir-un-modelo-con-vllm|vLLM]] y cambia `baseURL` por la URL de ese servidor.
- **Otros agentes abiertos.** Cline (Apache-2.0) y OpenHands (MIT) aceptan endpoints compatibles con OpenAI. Comparativa y licencias en [[docs/modelos-abiertos/10-agentes-de-codigo-abiertos]].

## Errores típicos

- **No subir el contexto.** Es el fallo más común y el más silencioso: el agente «se vuelve tonto» a mitad de tarea porque Ollama recorta el *prompt*.
- **Usar un modelo `:cloud` creyendo que es local.** Las etiquetas `:cloud` de Ollama ejecutan en sus servidores: tu código sale de la máquina.
- **Exponer Ollama con `OLLAMA_HOST=0.0.0.0`** para que llegue el contenedor. Ollama no valida claves: cualquiera en tu red podría usarlo.
- **Esperar lo mismo que de un modelo frontera.** Los modelos locales pequeños fallan más en bucles largos de herramientas: pierden el hilo, repiten la misma llamada o dan por buena una tarea a medias. Úsalos para tareas cortas con un test que decida. Si la tarea pide planificar muchos pasos sobre un repositorio grande, compara con tus propias tareas antes de decidir ([[cursos/agentes-con-modelos-abiertos/06-local-o-api]]).
- **Un AGENTS.md de 300 líneas.** Con 64k de contexto, las instrucciones compiten con el código que el agente necesita leer.
- **Aprobar todo en bloque fuera del contenedor.** Si te cansas de las preguntas, mete el agente en el contenedor; no cambies `ask` por `allow`.
