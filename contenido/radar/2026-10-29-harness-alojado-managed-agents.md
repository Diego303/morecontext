---
titulo: "El harness también se alquila: Claude Managed Agents"
descripcion: Claude Managed Agents, en beta desde abril de 2026, ejecuta el bucle y el sandbox por ti. Cuándo elegirlo frente a la API en bruto o el Claude Agent SDK.
creado: 2026-10-29
categoria: herramientas
tags: [agentes, harness, managed-agents, sandbox]
fuente:
  titulo: Claude Managed Agents overview · Documentación de la API de Claude
  url: https://platform.claude.com/docs/en/managed-agents/overview
relacionados: ["[[docs/agentes/04-managed-agents]]", "[[glosario/managed-agents]]", "[[recetas/agente-con-claude-agent-sdk]]", "[[radar/2026-10-22-harness-engineering]]"]
---

## Qué es

[[glosario/managed-agents|Claude Managed Agents]] es el [[glosario/harness|harness]] alojado de Anthropic: un bucle de agente configurable que corre en su infraestructura, con [[glosario/sandbox|sandbox]], herramientas integradas (bash, archivos, búsqueda y *fetch* web), [[glosario/prompt-caching|caché de prompts]] ([documentación](https://platform.claude.com/docs/en/managed-agents/overview)). Está en beta desde el 8 de abril de 2026, con la cabecera `managed-agents-2026-04-01`, que el SDK pone solo. Se arma con cuatro piezas: el agente (modelo, prompt, herramientas, servidores MCP y skills), el entorno (sandbox en la nube o autoalojado), la sesión (una ejecución) y los eventos que intercambias con ella por SSE.

## Qué cambia en la práctica

La documentación del Agent SDK ya compara estas opciones, además del CLI de Claude Code para uso interactivo ([comparativa](https://code.claude.com/docs/en/agent-sdk.md)). Resumido, de más control a menos trabajo:

| Opción | Quién ejecuta el bucle | Encaja cuando |
|---|---|---|
| API en bruto (Client SDK) | Tú, a mano | Quieres control fino del bucle y del contexto |
| Claude Agent SDK | Una biblioteca en tu proceso | No quieres escribir el bucle, pero sí ejecutarlo en tu infraestructura |
| Managed Agents | Anthropic, en su infraestructura | Tareas largas, asíncronas o programadas sin operar sandbox ni sesiones |

La tercera opción tiene contrapartidas. Es beta y puede cambiar entre versiones. No es apta para ZDR ni HIPAA, y las transcripciones quedan en el servidor hasta que las borras. No ofrece salidas estructuradas. Se factura por hora de sesión activa además de los tokens ([precios](https://platform.claude.com/docs/en/about-claude/pricing)).

## Qué hacer

1. Entiende el bucle a mano antes de alquilarlo: [[roadmap/40-primer-agente/02-el-bucle-agentico]]. Así sabrás qué hace cada capa por ti.
2. Si el agente vive junto a tu código y tus datos, prueba el SDK con [[recetas/agente-con-claude-agent-sdk]].
3. Si tus tareas duran horas y no quieres operar sandboxes, evalúa Managed Agents con [[docs/agentes/04-managed-agents]]. Mide el coste por tarea con tus evals antes de comprometerte.
