---
titulo: Modo headless y CI
descripcion: Cómo ejecutar Claude Code sin interfaz con claude -p - formatos de salida, --json-schema, permisos, presupuesto, reanudación, --bare para scripts y CI, eventos de stream-json y un job de CI completo.
creado: 2026-10-29
orden: 8
nivel: avanzado
tags: [claude-code, headless, ci, automatizacion]
relacionados: ["[[docs/frameworks/03-claude-agent-sdk]]", "[[recetas/evals-de-regresion-en-ci]]", "[[roadmap/80-evals/05-regresiones-en-ci]]", "[[recetas/agente-con-claude-agent-sdk]]"]
---

El **modo headless** de Claude Code es la misma herramienta sin interfaz interactiva: `claude -p "<prompt>"` ejecuta el bucle agéntico completo, imprime el resultado y termina con un código de salida. Es la forma de usar Claude Code desde scripts, *hooks* de git y pipelines de CI, y desde lenguajes que no tienen el Agent SDK. Si quieres controlar el bucle desde tu propio código Python o TypeScript, con callbacks de permisos y mensajes tipados, usa el [[docs/frameworks/03-claude-agent-sdk|Claude Agent SDK]], que es el mismo motor como biblioteca.

## Uso básico

```bash
claude -p "¿Qué hace el módulo de autenticación?"
cat build-error.txt | claude -p "explica la causa raíz de este error en dos frases" > causa.txt
git diff main | claude -p "eres un corrector de erratas: lista archivo:línea y la errata, nada más"
```

Lee la entrada estándar (hasta 10 MB), sale con 0 si todo va bien y con otro código si la ejecución falla. Los errores de opciones van a stderr antes de empezar; los fallos durante la ejecución (por ejemplo, sin autenticación) se imprimen como resultado en stdout. Las skills y los comandos propios funcionan escribiendo `/nombre` dentro del prompt; los comandos que solo existen en la interfaz, como `/login`, no.

## Formatos de salida

| `--output-format` | Qué devuelve |
|---|---|
| `text` (por defecto) | El texto final |
| `json` | Un objeto con `result`, `session_id`, uso, coste (`total_cost_usd` y desglose por modelo) y metadatos |
| `stream-json` | Un JSON por línea con cada evento, hasta un último mensaje `result` |

Con `--json-schema` la salida se ajusta a un esquema y llega en `structured_output`:

```bash
claude -p "Extrae los nombres de las funciones públicas de auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"funciones":{"type":"array","items":{"type":"string"}}},"required":["funciones"]}' \
  | jq '.structured_output.funciones'
```

Si la ejecución termina sin salida válida (por ejemplo, porque Claude rechazó la petición), **no hay campo `structured_output`**: compruébalo antes de usarlo. El coste de `total_cost_usd` es una estimación del cliente, no la factura.

En `stream-json`, el primer evento suele ser `system/init`, con el modelo, las herramientas, los servidores MCP (`mcp_servers` y `mcp_server_errors`), los plugins (`plugins` y `plugin_errors`) y un array `capabilities` para detectar funciones sin comparar versiones. Los reintentos de la API llegan como `system/api_retry` con `attempt`, `max_retries`, `retry_delay_ms` y la categoría del error. Para ver texto a medida que se genera, añade `--verbose --include-partial-messages`.

## Permisos sin nadie delante

Desde la v2.1.302, `claude -p` arranca en modo Manual si nada fija otro, y en ese modo **todo lo que pediría confirmación se deniega**. Tienes tres formas de darle margen:

```bash
# Herramientas concretas preaprobadas (sintaxis de reglas de permisos)
claude -p "Revisa los cambios en staging y crea el commit" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"

# Un modo de base para toda la sesión
claude -p "Aplica las correcciones del linter" --permission-mode acceptEdits

# Sin nadie que responda: deniega lo que no resuelvan reglas, hooks o modo, y dile a Claude que no reintente
claude -p "Actualiza las versiones fijadas y pasa los tests" --permission-mode auto --permission-prompts none
```

`dontAsk` es el modo más cerrado para CI: deniega todo lo que habría preguntado y deja pasar lo preaprobado. En `--allowedTools`, el espacio antes del `*` importa: `Bash(git diff *)` no encaja con `git diff-index`, `Bash(git diff*)` sí.

## Presupuesto y reanudación

- `--max-budget-usd 2` corta la ejecución al llegar a ese gasto estimado, incluido el trabajo en segundo plano que siga pendiente.
- `--continue` sigue la última conversación; `--resume <id>` una concreta, y también acepta la ruta absoluta de su transcript `.jsonl`.

```bash
id=$(claude -p "Empieza la revisión de rendimiento" --output-format json | jq -r '.session_id')
claude -p "Ahora céntrate en las consultas a la base de datos" --resume "$id"
```

Al reanudar, el coste que informa la salida JSON es el acumulado de toda la conversación.

## --bare: el modo para scripts y CI

Sin opciones, `claude -p` descubre y carga lo mismo que una sesión interactiva: hooks, skills, comandos, subagentes, plugins, servidores MCP, memoria automática y `CLAUDE.md`, del proyecto y de `~/.claude`. Con `--bare` no carga nada de eso:

- Arranca más rápido y da **el mismo resultado en cualquier máquina**: un hook del `~/.claude` de un compañero o un servidor del `.mcp.json` del proyecto no se ejecutan.
- Solo usa `ANTHROPIC_API_KEY` (o un `apiKeyHelper` pasado con `--settings`): no lee el login de la suscripción ni el llavero. Bedrock, Vertex y Foundry usan sus credenciales como siempre.
- Claude tiene Bash, lectura y edición de archivos. Lo demás se lo das explícitamente: `--append-system-prompt` o `--append-system-prompt-file` para instrucciones, `--settings` para configuración, `--mcp-config` para servidores, `--agents` para subagentes y `--plugin-dir` para un plugin.
- No hay tareas en segundo plano ni recordatorios del sistema.

La documentación lo recomienda para llamadas desde scripts y anuncia que **será el comportamiento por defecto de `-p`** en una versión futura.

> [!peligro] Sin --bare, -p ejecuta lo que traiga el repositorio
> Una sesión `-p` no muestra el diálogo de confianza ni la aprobación de servidores MCP. Ejecuta los hooks del `.claude/settings.json` del proyecto y conecta los servidores de su `.mcp.json` **aunque nunca hayas confiado en esa carpeta**. En CI que procesa ramas o pull requests de terceros, eso es ejecutar su código con tus secretos. Usa `--bare`, o como mínimo `--setting-sources user` y `--strict-mcp-config`.

## Ejemplo completo: un job de CI

Revisión automática de cada pull request, con salida estructurada que el job valida antes de publicar nada:

```yaml title=".github/workflows/revision-claude.yml"
name: Revisión con Claude Code
on:
  pull_request:
permissions:
  contents: read
  pull-requests: write
jobs:
  revisar:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Instalar Claude Code
        run: npm install -g @anthropic-ai/claude-code
      - name: Revisar el diff
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          git diff "origin/${{ github.base_ref }}...HEAD" > cambios.diff
          claude --bare -p "Revisa el diff de cambios.diff. Señala solo errores probables y riesgos de seguridad, con archivo y línea." \
            --allowedTools "Read" \
            --permission-mode dontAsk \
            --max-budget-usd 1.50 \
            --output-format json \
            --json-schema '{"type":"object","properties":{"hallazgos":{"type":"array","items":{"type":"object","properties":{"archivo":{"type":"string"},"linea":{"type":"integer"},"gravedad":{"type":"string","enum":["alta","media","baja"]},"detalle":{"type":"string"}},"required":["archivo","gravedad","detalle"]}}},"required":["hallazgos"]}' \
            > revision.json
          jq -e '.structured_output.hallazgos' revision.json > /dev/null
      - name: Fallar si hay hallazgos graves
        run: |
          jq -r '.structured_output.hallazgos[] | "\(.gravedad)\t\(.archivo):\(.linea // "-")\t\(.detalle)"' revision.json
          test "$(jq '[.structured_output.hallazgos[] | select(.gravedad == "alta")] | length' revision.json)" -eq 0
```

Las decisiones que importan:

- **`--bare`**: no se ejecuta nada que venga en la rama (hooks, MCP, skills). El diff es el único contexto.
- **Solo `Read` y `dontAsk`**: el agente lee el diff y el código, pero no puede ejecutar comandos ni escribir. La revisión no necesita más.
- **Presupuesto y `timeout-minutes`**: dos topes independientes, uno de gasto y otro de tiempo.
- **Esquema y validación**: `jq -e` falla si no hay `structured_output`, de modo que un rechazo o una respuesta mal formada rompen el job en lugar de pasar en silencio.
- **El secreto solo en el paso que lo necesita.**

Si en lugar de una revisión quieres medir un agente con un conjunto de casos, el patrón es el mismo con un bucle sobre los casos: [[recetas/evals-de-regresion-en-ci]]. Anthropic mantiene además una integración oficial con GitHub Actions; consúltala en la documentación de Claude Code.

## /goal

`/goal <condición>` hace que Claude siga trabajando hasta que se cumpla una condición. Internamente es un hook `Stop` basado en prompt que evalúa un modelo pequeño: termina cuando la condición se cumple, cuando se juzga imposible o ante errores que debes arreglar tú. En lo que hemos podido verificar está documentado para sesiones interactivas; para un objetivo en CI, una condición comprobable en el propio job (tests en verde, `jq -e` sobre la salida) es más predecible que un juez.

## Errores típicos

- **Usar `structured_output` sin comprobar que existe.**
- **Olvidar que `--bare` no carga `CLAUDE.md`**: pasa las instrucciones con `--append-system-prompt-file`.
- **`--allowedTools "Bash"` en CI**: cualquier comando pasa sin preguntar.
- **Matar el proceso con SIGTERM** y esperar un resultado: sale con 143 y deja el turno a medias. Para cerrar limpio, SIGINT.
- **Parsear el texto libre de `--output-format text`** en lugar de pedir un esquema.

## Ver también

- [[docs/frameworks/03-claude-agent-sdk]]: construir tu propio agente sobre el mismo harness.
- [[recetas/agente-con-claude-agent-sdk]]: un agente con el SDK en pocas líneas.
- [[docs/claude-code/06-permisos-y-sandbox]]: modos y reglas que usa `-p`.
- [[roadmap/50-skills/04-escribir-tu-primera-skill]]: usar `-p` para probar la activación de una skill.
