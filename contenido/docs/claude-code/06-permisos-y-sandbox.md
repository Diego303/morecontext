---
titulo: Permisos y sandbox
descripcion: Referencia de los permisos de Claude Code - reglas allow, ask y deny con sus patrones, precedencia, modos, confianza en la carpeta y sandbox de Bash - y por qué un harness añade además un hook propio.
creado: 2026-10-29
orden: 6
nivel: avanzado
tags: [claude-code, permisos, seguridad, sandbox]
relacionados: ["[[docs/seguridad/02-permisos-y-minimo-privilegio]]", "[[cursos/harness-engineering/09-seguridad-en-profundidad]]", "[[recetas/proteger-secretos-del-agente]]", "[[glosario/sandbox]]"]
---

Los **permisos** de Claude Code deciden qué herramientas puede usar el agente sin preguntar, cuáles requieren tu confirmación y cuáles están prohibidas. Se escriben como reglas en los `settings.json` y las aplica Claude Code, no el modelo: una instrucción en `CLAUDE.md` cambia lo que Claude *intenta*, una regla cambia lo que Claude Code *permite*. El **sandbox** añade aislamiento del sistema operativo para los comandos de shell. Este artículo es la referencia de los dos y explica por qué un harness serio añade un hook encima.

## Dónde viven los permisos

| Archivo | Afecta a |
|---|---|
| Configuración gestionada (`managed-settings.json`, MDM o consola) | Toda la organización; nada la anula |
| `--settings` en la línea de comandos | Esa sesión |
| `.claude/settings.local.json` | Tú, en este proyecto (fuera de git) |
| `.claude/settings.json` | Todo el equipo (versionado) |
| `~/.claude/settings.json` | Tú, en todos tus proyectos |

Para claves normales gana el nivel más alto de la tabla. Pero las listas, como `permissions.allow`, **se fusionan** entre niveles. Y para permisos manda otra regla: si una herramienta está denegada en cualquier nivel, ningún otro puede permitirla. Un `deny` de usuario bloquea un `allow` de proyecto y al revés.

## Reglas y orden de evaluación

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Bash(git commit *)"],
    "ask": ["Bash(git push *)"],
    "deny": ["Read(./.env)", "Read(./secrets/**)"]
  }
}
```

Se evalúan **deny, después ask, después allow**, y gana la primera coincidencia en ese orden; la especificidad no cuenta. Un `deny` de `Bash(aws *)` bloquea también `aws s3 ls` aunque haya un `allow` exacto para él. Un `deny` con el nombre pelado (`Bash`) **retira la herramienta del contexto**: Claude ni la ve. Uno con patrón (`Bash(rm *)`) la deja disponible y bloquea las llamadas que encajan.

## Sintaxis por herramienta

**Bash.** La regla se compara con el texto del comando; `*` sustituye cualquier texto, espacios incluidos.

| Regla | Encaja | No encaja |
|---|---|---|
| `Bash(npm run build)` | `npm run build` | `npm run build --watch` |
| `Bash(npm run *)` | `npm run build`, `npm run` | `npm install` |
| `Bash(git log *)` | `git log --oneline` | `git push` |
| `Bash(git * main)` | `git merge main`, `git push origin main` | `git log` |
| `Bash(ls *)` | `ls -la`, `ls` | `lsof` |
| `Bash(ls*)` | `ls -la`, `lsof` | |

Pon el `*` **después del subcomando**: `Bash(git *)` permite cualquier comando git, incluido `git -c` con un programa arbitrario. El sufijo `:*` es una forma equivalente de escribir el comodín final (`Bash(ls:*)` = `Bash(ls *)`); el diálogo de permisos escribe hoy la forma con espacio. Claude Code entiende los operadores de shell: `Bash(safe *)` no aprueba `safe && otro`, porque cada subcomando debe encajar por separado, mientras que una regla `deny` o `ask` se aplica si **cualquier** subcomando encaja. Quita envoltorios conocidos (`timeout`, `nice`, `nohup`, `xargs` sin opciones…) antes de comparar.

**Read y Edit.** Usan patrones estilo gitignore:

| Patrón | Significa |
|---|---|
| `//ruta` | Ruta absoluta desde la raíz del sistema |
| `~/ruta` | Desde tu directorio personal |
| `/ruta` | Relativa al origen de la regla (en `.claude/settings.json`, la raíz del proyecto; en `~/.claude/settings.json`, `~/.claude`) |
| `ruta` o `./ruta` | Relativa al directorio actual |

Un `deny` de `Read` también bloquea `Edit` y `Write` sobre esa ruta. Las reglas `Write(ruta)`, `NotebookEdit(ruta)` y `Glob(ruta)` **se aceptan pero nunca encajan**: Claude Code solo compara rutas con `Read(...)` y `Edit(...)`. Para restringir escrituras, usa `Edit(...)`.

**Otras.** `WebFetch(domain:ejemplo.com)`; `mcp__servidor` o `mcp__servidor__*` para todas las herramientas de un servidor y `mcp__servidor__herramienta` para una; `Agent(Explore)` para un subagente; `Skill(nombre)` para una skill; `Workflow(nombre)` para un workflow guardado. Las reglas `deny` y `ask` admiten además `Herramienta(parametro:valor)`, como `Agent(model:opus)` o `Bash(run_in_background:true)`.

## Lo que una regla de Bash no ve

| Regla en `deny` | Para | No para |
|---|---|---|
| `Bash(curl *)` | `curl https://ejemplo.com` | `/usr/bin/curl …`, `sh -c 'curl …'` |
| `Bash(rm *)` | `rm -rf build/` | `/bin/rm -rf build/`, `bash -c 'rm -rf build/'` |
| `Bash(git push *)` | `git push origin main` | `git -C . push origin main`, `git 'push' origin main` |

La documentación lo dice sin rodeos: una regla de Bash cubre la forma en que Claude suele escribir el comando, **no es una frontera de seguridad** alrededor del programa. Los `deny` de `Read` tampoco paran un script de Python que abre el archivo por su cuenta. Para eso hay dos herramientas: el sandbox, que no depende del texto del comando, y un hook `PreToolUse` que inspecciona el comando completo con tu propia lógica.

## Modos de permisos

| Modo | Comportamiento |
|---|---|
| `default` (Manual) | Pregunta la primera vez que se usa cada herramienta |
| `acceptEdits` | Acepta ediciones y comandos de archivos comunes (`mkdir`, `mv`, `cp`…) dentro del proyecto |
| `plan` | Explora y lee, pero no edita archivos del proyecto |
| `auto` | Un clasificador revisa cada acción en lugar de preguntarte; modo por defecto en Pro, Max y Team desde agosto de 2026 |
| `dontAsk` | Deniega todo lo que habría preguntado; útil en CI cerrado |
| `bypassPermissions` | No pregunta nada, ni siquiera para `.git` o `.claude`; solo en contenedores o máquinas virtuales |

El modo inicial se fija con `permissions.defaultMode`; `auto` y `bypassPermissions` no se aceptan desde la configuración del proyecto. `permissions.disableBypassPermissionsMode` y `permissions.disableAutoMode` con valor `"disable"` los bloquean; en la configuración gestionada nadie puede revertirlo.

## Confianza en la carpeta

Las reglas `allow` y los `additionalDirectories` de un `.claude/settings.json` **conceden** capacidades, así que Claude Code no los aplica hasta que aceptas el diálogo de confianza de esa carpeta. Los `deny` y `ask` se aplican desde el principio porque solo restringen. En `claude -p` y en el Agent SDK no hay diálogo: las reglas `allow` del repositorio no se aplican, pero sus **hooks sí se ejecutan**, y sus servidores de `.mcp.json` se conectan sin preguntar ([[docs/claude-code/08-modo-headless-y-ci]]).

## Sandbox de Bash

Se activa con `/sandbox` o `"sandbox": {"enabled": true}`. Usa Seatbelt en macOS y bubblewrap con socat en Linux y WSL2; no existe en Windows nativo. Está construido sobre el paquete abierto `@anthropic-ai/sandbox-runtime`.

```json
{
  "sandbox": {
    "enabled": true,
    "filesystem": {"denyRead": ["~/.ssh", "~/.aws"]},
    "network": {"allowedDomains": ["registry.npmjs.org", "pypi.org"]}
  }
}
```

Claves: `filesystem.allowWrite`, `filesystem.denyWrite`, `filesystem.denyRead`, `network.allowedDomains`, `network.deniedDomains`, `excludedCommands`, `allowUnsandboxedCommands` y `autoAllowBashIfSandboxed` (por defecto `true`: los comandos aislados no piden permiso aunque haya una regla `ask` pelada de `Bash`; las reglas con patrón, como `Bash(git push *)`, siguen preguntando).

> [!aviso] Lo que el sandbox no cubre
> Solo aísla Bash, PowerShell y Monitor, y sus procesos hijos. **Las herramientas de archivos (Read, Edit, Write), los servidores MCP y los hooks quedan fuera.** Y una lista blanca de dominios es una capacidad: si permites un dominio donde un atacante puede subir datos, has permitido la exfiltración.

## Ejemplo completo: el harness del autor

Extracto del `.claude/settings.json` real:

```json title=".claude/settings.json (extracto)"
{
  "env": {"CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH": "1"},
  "permissions": {
    "allow": [
      "Bash(git status *)", "Bash(git diff *)", "Bash(git log *)", "Bash(ls *)", "Bash(date *)",
      "Bash(python3 .claude/tools/feature.py *)", "Bash(python3 .claude/tools/ledger.py *)",
      "Read(./**)", "Edit(./**)", "Write(./**)"
    ],
    "deny": [
      "Bash(git push)", "Bash(git push *)", "Bash(sudo *)", "Bash(rm -rf *)",
      "Read(./**/.env)", "Read(./**/.env.*.local)", "Read(./**/*.pem)", "Read(./**/*.key)",
      "Read(~/.ssh/**)", "Read(~/.aws/**)", "Read(./secrets/**)"
    ]
  }
}
```

Cómo leerlo:

- **El bloque `env`** fija variables para la sesión: aquí, que los subagentes no puedan lanzar otros.
- **Lo preaprobado es poco y concreto**: lectura de git y las herramientas del propio harness. Todo lo demás pregunta.
- **Los `deny` son la red de seguridad**: sin push, sin `sudo`, sin leer secretos. Con `git push` y `git push *` cubre el comando pelado y con argumentos.
- **`Write(./**)` no hace nada**: las reglas de ruta de `Write` nunca encajan. No molesta, y la escritura dentro del proyecto ya la cubre `Edit(./**)`. Si copias este archivo, puedes quitarla.

## Por qué el harness añade un hook

Con esas reglas, el harness todavía no puede expresar lo que necesita, y por eso añade `guard.py` como hook `PreToolUse` ([[docs/claude-code/04-hooks]]):

1. **Políticas por agente.** Las reglas son iguales para la sesión principal y para todos los subagentes. El hook recibe `agent_type` y aplica una política distinta a cada uno: el explorer solo escribe su `context.md`, el reviewer no escribe con Bash, solo el builder toca código del producto.
2. **Análisis del comando completo.** La tabla de lo que una regla no ve es exactamente el hueco que cubre el guard: analiza el comando con un léxico que respeta comillas y heredocs, detecta redirecciones, código en línea, rutas indirectas y lecturas de secretos con comodines.
3. **Rutas sin distinguir mayúsculas.** En discos de Windows (WSL) y macOS, `.Claude/` es `.claude/`; una regla de ruta literal no lo trata igual.
4. **Firmas humanas.** Las decisiones del flujo (aprobar la puerta humana) devuelven `ask`, de modo que solo el humano puede confirmarlas, aunque el comando estuviera preaprobado.
5. **Fallo en cerrado.** Si el hook falla, bloquea.

Ni así es absoluto, y el propio harness lo documenta: un agente que puede ejecutar código puede escribir un programa que eluda el hook, y en `bypassPermissions` las confirmaciones no aparecen. Por eso las capas se suman: permisos para lo obvio, hook para la política fina, sandbox para el sistema operativo y revisión humana del diff al final.

## Errores típicos

- **Esperar que un `allow` más específico gane a un `deny` general.** No: deny va primero.
- **`/ruta` creyendo que es absoluta.** Es relativa al origen de la regla; la absoluta es `//ruta`.
- **Proteger escrituras con `Write(...)`.** No encaja nunca; usa `Edit(...)`.
- **Tratar `Bash(curl *)` en `deny` como «sin red».** Para eso está el sandbox.
- **Ejecutar `claude -p` en un repositorio ajeno** sin `--bare`: sus hooks se ejecutan.

## Ver también

- [[roadmap/90-harness/03-permisos-y-hooks]]: fronteras deterministas, explicado desde cero.
- [[cursos/seguridad-y-prompt-injection/04-permisos-y-sandbox]]: el porqué de cada capa.
- [[recetas/proteger-secretos-del-agente]]: reglas y hook para secretos.
- [[problemas/el-hook-bloquea-todo]]: cuando la capa de seguridad estorba.
