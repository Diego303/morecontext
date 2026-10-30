---
titulo: Qué es un harness
descripcion: Agente es igual a modelo más harness. De dónde viene el término, en qué se diferencia del prompt y el context engineering y qué harness públicos conviene conocer.
creado: 2026-10-29
orden: 1
minutos: 25
tipo: teoria
objetivos:
  - Definir harness y separar en un agente concreto lo que es modelo de lo que es harness.
  - Situar prompt, context y harness engineering en el tiempo con sus fuentes.
  - Distinguir context, loop y graph engineering como partes del harness.
  - Describir qué aportan tres harness públicos (Codex, Deep Agents y el patrón de Anthropic para tareas largas).
requiere: ["[[roadmap/40-primer-agente/02-el-bucle-agentico]]"]
tags: [harness, agentes, fundamentos]
relacionados: ["[[glosario/harness]]", "[[glosario/harness-engineering]]", "[[disciplinas/harness-engineering]]", "[[cursos/harness-engineering/01-del-prompt-al-harness]]", "[[radar/2026-10-22-harness-engineering]]"]
---

Al terminar esta lección sabrás qué parte de un agente es el modelo y qué parte es todo lo demás, de dónde sale la palabra *harness* y por qué en 2026 se convirtió en una disciplina propia. Es la base para el resto del nivel.

## La idea

En [[roadmap/40-primer-agente/02-el-bucle-agentico]] escribiste un bucle que llama al modelo, ejecuta herramientas y vuelve a llamar. Ese bucle, las herramientas, sus permisos, los límites de pasos y gasto y las trazas no son el modelo. Son su entorno.

La definición más citada es una ecuación: **agente = modelo + harness**. LangChain la resume así en [*The Anatomy of an Agent Harness*](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness) (Vivek Trivedy, 10 de marzo de 2026): «If you're not the model, you're the harness». Birgitta Böckeler, en [*Harness engineering for coding agent users*](https://martinfowler.com/articles/harness-engineering.html) (2 de abril de 2026), lo define como todo lo que hay en un agente salvo el propio modelo. Y OpenAI, al publicar en abierto el de Codex, llama harness al sistema de ejecución que reúne contexto, usa herramientas, aplica políticas de sandbox y aprobación y mantiene el trabajo entre turnos.

En la práctica, un harness incluye:

- **Instrucciones**: prompt de sistema, `CLAUDE.md` o `AGENTS.md`, contratos de cada agente.
- **Herramientas y permisos**: qué puede hacer cada agente y qué tiene prohibido.
- **Entorno**: sistema de archivos, sandbox, navegador, logs y tests que el agente puede leer.
- **Controles deterministas**: hooks, validadores, linters, runners de aceptación.
- **Orquestación**: subagentes, fases, puntos de aprobación.
- **Estado, registro y coste**: dónde se guarda lo aprendido, qué pasó, cuánto costó.

**[[glosario/harness-engineering|Harness engineering]]** es diseñar ese entorno para que un modelo no determinista produzca trabajo fiable, verificable, reanudable, seguro y con coste controlado. No sustituye el juicio del modelo: delimita dónde actúa, con qué información, qué evidencia debe dejar y quién tiene la última palabra.

## De prompt a context a harness engineering

La progresión que usa el autor en su roadmap tiene tres escalones. Cada uno incluye al anterior.

| Etapa | Pregunta | Hitos con fecha |
|---|---|---|
| Prompt engineering (2022–2024) | ¿Cómo redacto la instrucción? | Se centra en el prompt de sistema y los ejemplos |
| Context engineering (2025) | ¿Qué tokens ve el modelo en cada llamada? | El término lo popularizan Tobi Lütke y Andrej Karpathy en junio de 2025; Anthropic lo define el 29 de septiembre de 2025 como elegir y mantener el conjunto óptimo de tokens durante la inferencia |
| Harness engineering (2026) | ¿En qué entorno trabaja el agente y cómo se comprueba lo que hace? | Anthropic ya habla de *harnesses* el 26 de noviembre de 2025; OpenAI publica *Harness engineering* el 11 de febrero de 2026; Böckeler y LangChain escriben sobre ello el 17 de febrero; Thoughtworks lo recoge en su Radar vol. 34 el 15 de abril; OpenAI abre el arnés de Codex el 19 de agosto |

Las fuentes primarias de esos hitos: [*Effective harnesses for long-running agents*](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (Anthropic), [*Harness engineering: leveraging Codex in an agent-first world*](https://openai.com/index/harness-engineering/) (OpenAI, Ryan Lopopolo), [*Improving Deep Agents with harness engineering*](https://www.langchain.com/blog/improving-deep-agents-with-harness-engineering) (LangChain) y [*Codex as a platform*](https://developers.openai.com/blog/codex-as-a-platform) (OpenAI).

## Context, loop y graph engineering

Dentro del harness conviene separar tres preguntas, porque se diseñan y se depuran por separado:

| Disciplina | Pregunta | Ejemplo de decisión |
|---|---|---|
| Context engineering | ¿Qué información ve cada modelo en cada momento? | Cada subagente arranca con contexto limpio y lee solo sus archivos |
| Loop engineering | ¿Cuántas vueltas de autocorrección se permiten y cuándo se para? | Constructor, revisor y como mucho una reparación; después decide una persona |
| Graph engineering | ¿Qué caminos puede recorrer el trabajo? | Fases y transiciones explícitas en un archivo; el código rechaza las ilegales |

El harness engineering suma a esas tres los permisos, el estado, la verificación, el registro, la seguridad y el coste. Lo verás pieza a pieza en la lección 2.

## Ejemplos públicos

**OpenAI y Codex.** El equipo que describe Lopopolo construyó un producto sin escribir código a mano. Lo que destaca de su harness: un `AGENTS.md` de unas cien líneas que funciona como **índice** hacia una carpeta `docs/` versionada (diseños, planes, especificaciones); linters y CI que validan esa documentación con mensajes que incluyen **cómo arreglar** el fallo; una arquitectura por capas comprobada con tests estructurales; una copia de la aplicación por *git worktree*, con logs, métricas y trazas que el agente puede consultar; y agentes de «recogida de basura» que abren PR pequeños contra unos principios fijados. Böckeler le pone dos peros: la fuente es interesada y apenas aborda cómo se verifica el comportamiento.

**LangChain Deep Agents.** Con el modelo fijo, cambiar solo el harness subió su agente de 52,8 % a 66,5 % en Terminal-Bench 2.0. Los cambios: un bucle de construir y verificar en el prompt, un *middleware* que comprueba contra la spec antes de terminar, otro que detecta ediciones repetidas al mismo archivo y avisos de tiempo.

**Anthropic, tareas largas.** Un agente inicializador prepara el entorno (un script de arranque, un archivo de progreso y una lista de funcionalidades en JSON, todas con `passes: false`) y un agente de código trabaja en una funcionalidad por sesión, prueba de punta a punta y solo puede cambiar `passes`. Lo tienes como patrón en [[patrones/10-inicializador-y-agente-de-trabajo]].

**Once harness por dentro.** Un estudio del código de once agentes de código (Claude Code, Codex CLI, Gemini CLI, OpenHands, Aider, OpenCode y otros; [arXiv 2609.00006](https://arxiv.org/abs/2609.00006), julio de 2026) encontró que ninguno usa un framework de agentes genérico, ninguno recupera código con *embeddings*, la mayoría adopta `SKILL.md` y MCP, las convenciones convergen (Codex adopta el vocabulario de hooks de Claude Code) y un bucle mínimo rinde parecido a uno complejo: casi todo el código está en seguridad, experiencia de uso y extensibilidad.

> [!nota] Un harness no siempre compensa
> Naresh Jain midió en [*Are Harnesses Worth the Cost?*](https://martinfowler.com/articles/are-harnesses-worth-the-cost.html) (13 de octubre de 2026) que, con un modelo frontera que ya acertaba, el harness completo multiplicó el coste sin mejorar la fiabilidad, mientras que con un modelo barato la llevó de 3 de 10 a 10 de 10. Lo desarrolla [[disciplinas/harness-engineering]].

## Tu agente también tiene harness

Si usas Claude Code, Codex u OpenCode, ya trabajas dentro de un harness ajeno: su bucle, sus herramientas, su sandbox, su forma de pedir permiso. Lo que añades tú (instrucciones del proyecto, permisos, hooks, skills, subagentes) es tu capa. Böckeler la llama el *outer harness* y le asigna dos fines: que el agente acierte más a la primera y que tenga un bucle de *feedback* antes de que llegue a tu revisión. Este nivel trata de esa capa.

## Errores frecuentes

- Atribuir al modelo fallos que son del harness: herramientas mal descritas, permisos de más, sin verificación.
- Confundir harness con framework: un harness puede ser un bucle de cien líneas y tres hooks.
- Añadir piezas por moda en lugar de por un fallo observado.

## Ejercicio

> [!ejercicio] Separa modelo y harness
> Elige el agente que más uses. Haz dos columnas: lo que hace el modelo y lo que hace el harness. En la del harness, marca qué pone la herramienta (Claude Code, Codex…) y qué has puesto tú.
>
> **Está bien si**: la columna del harness tiene al menos ocho elementos, entre ellos uno de cada tipo de la lista de arriba (instrucciones, permisos, entorno, controles, orquestación, estado o coste), y puedes señalar al menos dos que no existen todavía en tu capa.

> [!ejercicio]- Pistas
> Mira tu `CLAUDE.md` o `AGENTS.md`, tu `.claude/settings.json` (o el equivalente de tu herramienta) y qué pasa cuando el agente intenta hacer `git push`.

## Resumen

- Agente = modelo + harness: todo lo que no es el modelo es harness.
- Prompt, context y harness engineering son escalones; cada uno incluye al anterior.
- El término se asienta entre noviembre de 2025 y abril de 2026 (Anthropic, OpenAI, Böckeler, LangChain, Thoughtworks).
- Codex, Deep Agents y el patrón de Anthropic muestran harness concretos con resultados medibles.
- Un harness tiene coste: añade piezas con evidencia.

## Para seguir

- [[roadmap/90-harness/02-las-piezas-de-un-harness]]
- [[cursos/harness-engineering/01-del-prompt-al-harness]]
- [[biblioteca/harness-engineering-openai]]
- [[biblioteca/effective-harnesses]]
