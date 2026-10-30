---
titulo: Mi hook bloquea todo (o nada)
descripcion: Por qué un hook PreToolUse de Claude Code deja pasar lo que debía bloquear, o bloquea cualquier comando, y cómo probarlo aislado con payloads por stdin antes de confiar en él.
creado: 2026-10-29
sintoma: Mi hook bloquea todo (o nada)
tema: seguridad
nivel: intermedio
tags: [hooks, claude-code, seguridad, permisos]
relacionados: ["[[recetas/hook-que-bloquea-comandos-peligrosos]]", "[[docs/claude-code/04-hooks]]", "[[glosario/hook]]", "[[glosario/fallo-en-cerrado]]"]
---

Escribiste un [[glosario/hook|hook]] `PreToolUse` para impedir `rm -rf` y Claude Code ejecuta el comando como si no existiera. O al revés: desde que lo instalaste, cualquier `ls` o `npm test` sale bloqueado con un motivo que no entiendes. En los dos casos, el hook parece correcto al leerlo.

## Causas

**No bloquea nada:**

- **Sale con 1 en lugar de 2.** En Claude Code, el código de salida 2 bloquea (y su stderr llega como motivo). Cualquier otro código distinto de 0 es un error que **no bloquea**: la acción sigue. Es la convención Unix al revés de lo que esperas.
- **Una excepción no capturada.** Python termina con código 1 y un traceback: error que no bloquea. Con un hook de seguridad, un fallo deja pasar todo.
- **Lee mal el JSON de stdin.** El comando está en `tool_input.command`; si lees `tool_input.cmd` o buscas en el nivel superior, nunca coincide (o lanza `KeyError`, que es la causa anterior).
- **El *matcher* no casa.** Un *matcher* con solo letras, números, `_`, `-`, espacios, `,` o `|` se compara como texto exacto: `mcp__memory` no coincide con ninguna herramienta; hace falta `mcp__memory__.*`. Y con caracteres de regex se evalúa como expresión regular sin anclar: `Edit.*` también casa `NotebookEdit`.
- **Se agota el tiempo.** Un hook que tarda más que su `timeout` se cancela y, en `PreToolUse`, no bloquea.

**Bloquea todo:**

- **Fallo en cerrado sin cuidado.** Envuelves todo en `try/except: sys.exit(2)` y un error tuyo (la clave equivocada, un import) se convierte en bloqueo de cualquier comando. Es el comportamiento seguro ([[glosario/fallo-en-cerrado]]), pero solo si el error es raro y el motivo dice qué pasó.
- **Patrones demasiado amplios.** `"rm"` casa con `npm run format`; `"DROP"` con un archivo `dropdown.tsx`.
- **El motivo va a stdout.** Con salida 2, Claude Code lee stderr como motivo; si lo imprimes en stdout, ves un bloqueo sin explicación.

## Cómo confirmarlo

Prueba el hook aislado, fuera de Claude Code, con los mismos payloads que recibe. Este script los envía por stdin y muestra el código de salida y los dos canales:

```bash title="probar_hook.sh"
#!/usr/bin/env bash
# Uso: probar_hook.sh <hook>  · prueba el hook con payloads como los de Claude Code
hook="$1"
probar() {
  printf '%s' "$2" | python3 "$hook" >/tmp/hook.out 2>/tmp/hook.err
  echo "$1 → salida $? | stdout: $(cat /tmp/hook.out) | stderr: $(head -c 120 /tmp/hook.err | tr '\n' ' ')"
}
probar "peligroso" '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"rm -rf /tmp/x"}}'
probar "inocuo   " '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"npm test"}}'
probar "basura   " 'no es json'
```

Con un hook que lee `tool_input["cmd"]` y sale con 1, las tres pruebas dan `salida 1` (con un `KeyError: 'cmd'` en stderr las dos primeras y un `JSONDecodeError` la tercera): en Claude Code, eso significa que **todo pasa**. Dentro de Claude Code, `/hooks` lista los hooks cargados y de dónde vienen, y `claude --debug` deja en el log su ejecución.

## Arreglo

Lee con `.get`, sale con 2 solo cuando quieres bloquear, escribe el motivo en stderr y decide qué hacer con una entrada ilegible:

```python title=".claude/hooks/bloquear_peligrosos.py"
#!/usr/bin/env python3
"""PreToolUse para Bash: bloquea comandos destructivos y deja pasar el resto."""
import json
import re
import sys

PELIGROSOS = [r"\brm\s+-[a-z]*(?:rf|fr)", r"\bgit\s+push\s+.*--force\b", r"\bDROP\s+TABLE\b"]


def main() -> int:
    try:
        datos = json.load(sys.stdin)
        comando = datos.get("tool_input", {}).get("command", "")
    except (json.JSONDecodeError, AttributeError) as e:
        print(f"hook: entrada ilegible ({e}); bloqueo por precaución", file=sys.stderr)
        return 2                                          # fallo en cerrado, pero con motivo
    for patron in PELIGROSOS:
        if re.search(patron, comando, re.IGNORECASE):
            print(f"Bloqueado por política: coincide con {patron}", file=sys.stderr)
            return 2                                      # 2 = bloquear; stderr llega como motivo
    return 0                                              # 0 = no opina; siguen las reglas de permisos


if __name__ == "__main__":
    sys.exit(main())
```

```text
peligroso → salida 2 | stdout:  | stderr: Bloqueado por política: coincide con \brm\s+-[a-z]*(?:rf|fr)
inocuo    → salida 0 | stdout:  | stderr:
basura    → salida 2 | stdout:  | stderr: hook: entrada ilegible (Expecting value: line 1 column 1 (char 0)); bloqueo por precaución
```

Y en `settings.json`, el *matcher* exacto de la herramienta:

```json title=".claude/settings.json"
{"hooks": {"PreToolUse": [{"matcher": "Bash", "hooks": [
  {"type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/bloquear_peligrosos.py", "timeout": 30}
]}]}}
```

Si prefieres decidir con JSON en lugar de con el código de salida, sal con 0 y escribe en stdout un único objeto con `hookSpecificOutput.permissionDecision` (`allow`, `deny`, `ask`) ([[docs/claude-code/04-hooks]]).

## Cómo evitarlo

- Prueba cada hook con `probar_hook.sh` en CI, con casos que deben pasar y casos que deben bloquearse ([[recetas/hook-que-bloquea-comandos-peligrosos]]).
- No confíes solo en el hook: un `allow` del hook no salta las reglas `deny`, y las reglas de permisos y el *sandbox* siguen siendo la primera barrera ([[docs/claude-code/06-permisos-y-sandbox]]).
- Si el hook debe bloquear también cuando falla, usa `"onFailure": "block"` en su configuración (Claude Code v2.1.295 o posterior) en lugar de capturarlo todo.
- Recuerda que los patrones de texto se pueden esquivar (`r""m -rf`, variables): el hook es una red, no un muro ([[cursos/harness-engineering/09-seguridad-en-profundidad]]).

## Ver también

- [[roadmap/90-harness/03-permisos-y-hooks]]
- [[docs/claude-code/04-hooks]]
- [[recetas/proteger-secretos-del-agente]]
- [[disciplinas/seguridad]]
