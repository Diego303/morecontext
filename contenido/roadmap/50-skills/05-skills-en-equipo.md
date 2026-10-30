---
titulo: "Skills en equipo: compartir, versionar y no fiarse"
descripcion: Cómo distribuir y versionar skills en un equipo, cuándo reservarlas al humano, por qué una skill de terceros es una dependencia que ejecuta código y cómo revisarla y cuidar su licencia.
creado: 2026-10-29
orden: 5
minutos: 25
tipo: teoria
objetivos:
  - Elegir entre repositorio, plugin y marketplace para distribuir una skill, y versionarla.
  - Decidir qué skills debe lanzar solo el humano y aplicarlo con el frontmatter.
  - Revisar una skill de terceros con una lista de comprobación de seguridad y licencia.
requiere: ["[[roadmap/50-skills/04-escribir-tu-primera-skill]]"]
tags: [skills, seguridad, equipo, plugins]
relacionados: ["[[docs/seguridad/04-mcp-y-skills-de-terceros]]", "[[radar/2026-10-26-skills-cadena-de-suministro]]", "[[docs/claude-code/05-comandos-y-plugins]]", "[[glosario/rug-pull]]"]
---

Una skill que solo vive en tu `~/.claude/skills/` ayuda a una persona. Al terminar esta lección sabrás llevarla a todo el equipo con una versión clara, reservar al humano las que no debe lanzar el modelo y, sobre todo, tratar las skills ajenas como lo que son: código y texto de terceros que se ejecutan con tus permisos.

## La idea

Compartir skills plantea los mismos problemas que compartir cualquier dependencia: dónde se publica, qué versión usa cada uno, quién revisa los cambios y qué licencia tiene. Y uno propio de los agentes: el contenido de una skill **se convierte en instrucciones** para un modelo que puede ejecutar comandos. Una skill maliciosa no necesita un exploit; le basta con pedirlo.

## Distribuir: tres niveles

| Vía | Cómo | Cuándo |
|---|---|---|
| Repositorio | `.claude/skills/<nombre>/` versionado con el código | Skills de un proyecto: sus comandos, sus convenciones |
| Plugin | Carpeta con `.claude-plugin/plugin.json` y `skills/` | La misma skill en varios proyectos |
| Marketplace | Repositorio con `.claude-plugin/marketplace.json` que lista plugins | Un catálogo para el equipo o la organización |

La vía del repositorio es la más sencilla y la más auditable: cada cambio pasa por la misma revisión que el código. Un plugin empaqueta skills, subagentes, hooks y servidores MCP como una unidad, y sus skills se invocan con prefijo (`/mi-plugin:notas-de-version`), así que no chocan con las del proyecto. Un marketplace se registra con `claude plugin marketplace add <owner>/<repo>` y se instala por nombre: `claude plugin install mi-plugin@mi-marketplace`. El detalle está en [[docs/claude-code/05-comandos-y-plugins]].

Un repositorio también puede **sugerir** un marketplace y unos plugins a quien lo clona, con `extraKnownMarketplaces` y `enabledPlugins` en `.claude/settings.json`. Claude Code no los aplica hasta que cada persona acepta el diálogo de confianza de esa carpeta.

## Versionar

- **En el repositorio**, la versión es el commit. Revisa los cambios de `SKILL.md` como revisas código: una frase nueva en la `description` cambia cuándo se activa.
- **En un plugin**, el campo `version` de `plugin.json` mantiene a los usuarios en esa versión hasta que la cambies. Sin él, reciben lo último que publiques.
- **En la Skills API**, cada subida crea una versión `skver_…` y puedes fijarla en la petición en lugar de usar `"latest"`.
- El campo `metadata` del estándar admite un `version` informativo, útil si la skill viaja fuera de un plugin.

Guarda junto a la skill sus casos de activación (lección anterior) y vuelve a pasarlos en cada cambio de la `description`. Es su test de regresión.

## Skills solo para humanos

Algunas skills no deben activarse nunca solas. Con `disable-model-invocation: true` en Claude Code, el modelo no puede lanzarlas y su descripción ni siquiera entra en el contexto; solo existen cuando alguien escribe `/nombre`. Encajan en dos casos:

- **Decisiones humanas.** Aprobar, desplegar, publicar. Una aprobación que el modelo infiere no es una aprobación.
- **Cambios de modo que persisten.** Skills que cambian cómo responde el agente durante el resto de la sesión.

El harness del autor tiene un caso real del segundo tipo. Incorporó dos skills de terceros: `caveman`, que comprime las respuestas para gastar menos tokens de salida, y `ponytail`, que empuja hacia la solución mínima. Con la invocación automática **se activaban solas y persistían**, y ese estilo chocaba con los formatos fijos que el orquestador necesita (el informe de retorno de cada fase, la presentación de la puerta humana). La corrección fue una línea en cada una, `disable-model-invocation: true`, y quedó registrada en la tabla de procedencia del harness. Desde entonces solo las activa el humano, para cambios concretos fuera del flujo. Lo mismo hacen la skill `new-session` y los comandos `/approve` y `/reject`.

## No fiarse: una skill es código de terceros

Lo que una skill puede hacer en Claude Code es bastante más que «dar instrucciones»:

- Sus **scripts** se ejecutan con tus permisos.
- Un `` !`comando` `` en el cuerpo se ejecuta **antes** de que el modelo lea la skill. Un administrador puede desactivarlo con `disableSkillShellExecution`.
- Su `allowed-tools` preaprueba herramientas mientras está activa, y la confianza en la carpeta **no** frena ese campo en ninguna sesión.
- Puede registrar **hooks** en su frontmatter, que siguen activos el resto de la sesión. Los de una skill del proyecto se usan aunque solo hayas confiado en una carpeta superior, y también en `claude -p`.
- Su texto puede llevar instrucciones ocultas, igual que la descripción de una herramienta MCP ([[glosario/envenenamiento-de-herramientas|envenenamiento de herramientas]]). Y puede cambiar después de que la revisaste ([[glosario/rug-pull|rug pull]]).

No es teórico. Snyk analizó 3.984 skills de dos repositorios públicos (ClawHub y skills.sh) en febrero de 2026: el 13,4 % tenía al menos un problema crítico y confirmó 76 maliciosas. Son cifras del propio proveedor, de su herramienta de detección, pero bastan para tratar las skills como tratas los paquetes de npm o PyPI. Anthropic, al presentar el formato, ya recomendaba instalar skills solo de fuentes de confianza y revisar sus scripts y dependencias.

> [!peligro] Revisa antes de instalar, no después
> Una skill se activa por su descripción. Si la instalas para «probarla», puede ejecutarse en la siguiente tarea que encaje, con tus permisos y sobre tu repositorio. Léela entera antes de copiarla a `.claude/skills/`.

## Lista de revisión

La tabla de procedencia del harness del autor sigue este procedimiento antes de añadir una skill ajena, y es un buen punto de partida:

1. **Léela entera**, frontmatter, cuerpo y todos los archivos de la carpeta.
2. **Busca instrucciones que intenten cambiar permisos, hooks o el flujo**: «ignora las reglas del proyecto», «añade esta línea a settings.json», «no pidas confirmación».
3. **Revisa cada script**: llamadas de red, lectura de archivos fuera del proyecto, ejecución de código descargado, acceso a variables de entorno.
4. **Mira el frontmatter**: `allowed-tools` amplios, `hooks`, `` !`…` `` en el cuerpo.
5. **Fija la versión** (commit o etiqueta) y no la actualices sin repetir la revisión.
6. **Registra la procedencia**: de dónde viene, licencia y qué cambiaste.
7. **Pasa sus casos de activación** para saber cuándo se cargará en tus tareas.

Además, puedes limitar qué skills ve el agente: en Claude Code con reglas de permisos (`Skill(nombre)` para una, `Skill` en `deny` para todas) y en el Agent SDK con la opción `skills=`. Recuerda que esos filtros deciden qué puede invocar el modelo, no son un sandbox: los archivos siguen en disco.

## Licencias

Una skill es texto y código con autor. Antes de copiarla en tu repositorio, comprueba su licencia y respétala: conserva el aviso, indica si la has modificado. La tabla de procedencia del harness es un buen modelo. Recoge, por ejemplo, que su `test-driven-development` está adaptada de obra/superpowers (MIT) y condensada para el flujo, y que `ponytail` es MIT. El campo `license` del estándar sirve para declarar la de tus skills; si publicas una, pon también un archivo de licencia en la carpeta.

## Errores frecuentes

- Instalar skills de un repositorio público «para ver qué hacen».
- Actualizar una skill de terceros sin revisar el diff, sobre todo cambios en la `description` o en los scripts.
- Dejar que el modelo lance skills que cambian el estilo de toda la sesión.
- Publicar una skill del equipo sin licencia ni procedencia.

## Ejercicio

> [!ejercicio] Audita una skill pública
> Elige una skill de un repositorio público y aplícale la lista de revisión completa. Decide si la instalarías tal cual, con cambios o no, y si debería llevar `disable-model-invocation`.
>
> **Está bien si** documentas cada uno de los siete puntos con lo que encontraste (aunque sea «nada»), la decisión final tiene un motivo concreto y registras procedencia, versión fijada y licencia en una tabla como la del harness.

> [!ejercicio]- Pistas
> Busca en la carpeta `curl`, `wget`, `requests`, `fetch`, `os.environ`, `~/.ssh` y `base64`. No prueban nada por sí solos, pero dicen dónde mirar con calma.

## Resumen

- Repositorio para skills de un proyecto, plugin para reutilizarlas, marketplace para un catálogo.
- Versiona y revisa la `description` como código: cambia cuándo se activa la skill.
- `disable-model-invocation: true` para decisiones humanas y cambios de modo que persisten.
- Una skill de terceros ejecuta código y da instrucciones con tus permisos: revísala, fija la versión y registra procedencia y licencia.

## Para seguir

- [[docs/seguridad/04-mcp-y-skills-de-terceros]]
- [[docs/claude-code/05-comandos-y-plugins]]
- [[roadmap/60-multiagente/index]]
- [[roadmap/90-harness/index]]
