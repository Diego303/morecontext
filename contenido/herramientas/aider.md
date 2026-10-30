---
titulo: Aider
descripcion: Agente de programación en pareja para la terminal que edita tu repositorio, hace commits con git y se conecta a casi cualquier modelo, también local.
creado: 2026-10-29
tags: [agente-de-codigo, terminal, git]
relacionados: ["[[disciplinas/pair-programming-con-agentes]]", "[[docs/modelos-abiertos/10-agentes-de-codigo-abiertos]]", "[[disciplinas/cambios-pequenos-y-revisables]]"]
categoria: agente-de-codigo
licencia: Apache-2.0
open_source: true
lenguajes: [Python]
url: https://aider.chat
repositorio: https://github.com/Aider-AI/aider
version: "0.86.2"
revisado: 2026-10-29
---

Aider es una herramienta de terminal para programar en pareja con un modelo, con licencia Apache-2.0. Le dices qué ficheros entran en la conversación y qué cambio quieres; él edita, y **cada cambio queda como un commit de git** con un mensaje razonable, así que deshacer es `git` normal. Construye un mapa del repositorio para dar contexto al modelo en proyectos grandes y se conecta a casi cualquier LLM, incluidos modelos locales.

## Para qué sirve

- [[disciplinas/pair-programming-con-agentes|Programar en pareja]] con cambios pequeños y revisables: un commit por paso.
- Pasar *linters* y tests tras cada cambio y pedir al modelo que arregle lo que falle.
- Trabajar desde tu editor dejando comentarios en el código que Aider recoge (modo *watch*).

## Cuándo usarla

Cuando quieres control fino de qué ficheros toca el modelo y un historial de git limpio, más cerca del «yo dirijo, él teclea» que de un agente autónomo. Encaja con [[disciplinas/cambios-pequenos-y-revisables]].

## Cuándo no

- Para tareas largas y autónomas con planificación, subagentes o *hooks*: [[herramientas/claude-code]], [[herramientas/opencode]] o [[herramientas/openhands]].
- Si necesitas un proyecto con publicaciones frecuentes: la última versión (0.86.2) es del **12 de febrero de 2026**. Es anterior a la versión `2026-10-21` de la API de Claude y a los modelos 5.5: comprueba que tu combinación de modelo y versión funciona antes de adoptarlo.

## Ejemplo mínimo

Del README del proyecto. `aider-install` crea su propio entorno, cosa útil porque Aider **requiere Python < 3.13**.

```bash
python -m pip install aider-install
aider-install

cd /ruta/a/tu/proyecto
aider --model sonnet --api-key anthropic=<tu-clave>
```

Dentro de la sesión, añade ficheros con `/add`, pide el cambio en lenguaje natural y revisa el commit que crea. No se ha ejecutado aquí (sin clave ni modelo). Los alias como `sonnet` los resuelve la propia versión de Aider: si necesitas un modelo concreto, consulta su documentación de modelos. Para modelos locales, Aider se conecta a través de LiteLLM ([[herramientas/litellm]]); revisa su guía de conexión a LLM y sube el contexto del modelo.

> [!consejo] Una rama por tarea
> Como Aider hace commits automáticos, trabaja en una rama propia y revisa el `git diff` antes de integrar. Si algo no te convence, `git reset` y vuelta a empezar.

## Alternativas

- [[herramientas/opencode]]: agente de terminal más autónomo, MIT.
- [[herramientas/cline]]: CLI y extensión con MCP.
- [[herramientas/claude-code]]: propietario, con *hooks*, subagentes y *skills*.

## Enlaces

- Web y documentación: [aider.chat](https://aider.chat)
- Instalación: [aider.chat/docs/install.html](https://aider.chat/docs/install.html)
- Conectar modelos: [aider.chat/docs/llms.html](https://aider.chat/docs/llms.html)
- Repositorio: [github.com/Aider-AI/aider](https://github.com/Aider-AI/aider)
