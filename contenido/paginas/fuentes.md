---
titulo: Fuentes para estar al día
descripcion: Las fuentes primarias, especificaciones, autores técnicos y divulgadores en español que usamos para seguir el campo de los agentes, y una checklist para leer una novedad sin humo.
creado: 2026-10-29
tags: [fuentes, aprendizaje, radar]
relacionados: ["[[radar/index]]", "[[blog/2026-10-21-treinta-minutos-al-dia]]", "[[cursos/ruta-en-video/14-ecosistema-y-estar-al-dia]]", "[[roadmap/00-fundamentos/07-empresa-modelo-herramienta]]"]
---

En IA salen cada semana modelos, herramientas y términos nuevos. No hace falta leerlo todo: hace falta leer **pocas fuentes, primarias y con fecha**. Esta es la lista que usamos para escribir MoreContext y para el [[radar/index|radar]]. Está agrupada por tipo, y cada grupo sirve para una cosa distinta. No hay enlaces de afiliado ni orden de preferencia dentro de cada grupo.

## Fuentes primarias: documentación y blogs de ingeniería

Es donde se anuncian los cambios que afectan a tu código. Cuando un dato importa (un parámetro, un límite, una fecha), compruébalo aquí.

- **Anthropic**: [documentación de la API de Claude](https://platform.claude.com/docs) y [blog de ingeniería](https://www.anthropic.com/engineering), donde publican guías como *Building effective agents*, *Effective context engineering* o *Demystifying evals for AI agents*.
- **OpenAI**: [documentación para desarrolladores](https://developers.openai.com) y su [blog de desarrolladores](https://developers.openai.com/blog/codex-as-a-platform), además de los artículos técnicos en [openai.com](https://openai.com/index/harness-engineering/).
- **LangChain**: [blog](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness) con experimentos sobre arneses, contexto y multiagente hechos con sus librerías abiertas.
- **Cognition**: [blog](https://cognition.com/blog/multi-agents-working), con lo que aprenden construyendo Devin.
- **Chroma**: [investigación](https://www.trychroma.com/research/context-rot) sobre recuperación y *context rot*.
- **METR**: [blog](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) con mediciones de capacidad y productividad; marca como desfasados sus resultados antiguos cuando publica otros nuevos.

Ten presente que un blog de proveedor es una fuente interesada: cuenta sus resultados con su arnés. Es primaria para saber qué ha cambiado y qué dicen haber medido, no para decidir qué te conviene.

## Especificaciones y estándares

Cambian menos y se leen despacio, pero son la referencia cuando dos herramientas no se entienden.

- **MCP**: [especificación y documentación](https://modelcontextprotocol.io), incluida la página de [Security Best Practices](https://modelcontextprotocol.io/specification/latest/basic/security_best_practices). Explicado en [[docs/estandares/01-mcp-2026-07-28]].
- **A2A**: repositorios oficiales en [github.com/a2aproject](https://github.com/a2aproject). Ver [[docs/estandares/03-a2a]].
- **OpenTelemetry GenAI**: [convenciones semánticas](https://github.com/open-telemetry/semantic-conventions-genai) para trazar modelos y agentes, todavía en estado *Development*. Ver [[docs/produccion/04-opentelemetry-genai]].
- **Agent Skills**: [agentskills.io](https://agentskills.io), el formato abierto de las skills. Ver [[docs/estandares/04-agent-skills-y-agents-md]].
- **Agentic AI Foundation**: [aaif.io](https://aaif.io), la fundación de la Linux Foundation que aloja MCP, A2A, Agent Skills y AGENTS.md, entre otros.
- **OWASP GenAI Security Project**: [genai.owasp.org](https://genai.owasp.org), con el Top 10 para aplicaciones con LLM y el de aplicaciones agénticas.

## Autores técnicos

Personas que prueban las cosas, enlazan a la fuente y dicen cuándo se equivocaron.

- **Simon Willison**, [simonwillison.net](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/): seguridad de agentes (la trifecta letal), trabajo diario con agentes de código y notas cortas con enlace a la fuente.
- **Hamel Husain y Shreya Shankar**, [FAQ de evals](https://hamel.dev/blog/posts/evals-faq/): análisis de errores, jueces validados y evals que sirven para decidir.
- **martinfowler.com**, con los artículos de Birgitta Böckeler sobre [harness engineering](https://martinfowler.com/articles/harness-engineering.html) y desarrollo guiado por specs, y otros autores invitados.
- **Thoughtworks Technology Radar**, [thoughtworks.com/radar](https://www.thoughtworks.com/es-cl/radar): técnicas y herramientas clasificadas por anillos según su madurez (adoptar, probar, evaluar, precaución).

## Divulgadores en español

Son los que sigue el autor y los que forman su [[cursos/ruta-en-video/index|ruta en vídeo]]. Cada uno tiene un enfoque distinto.

| Canal | Enfoque | Para qué lo usamos |
|---|---|---|
| **DotCSV** (Carlos Santana) | Teoría de IA y análisis de papers, modelos y lanzamientos desde hace años | Fundamentos y el «por qué» técnico; sus directos sobre lo que está pasando |
| **midudev** y **midulive** (Miguel Ángel Durán) | Programación web volcada en IA aplicada: LLM, MCP, Claude Code, skills | Cursos gratuitos en [midu.dev](https://midu.dev/curso/intro-ia-para-devs/) y directos donde prueba herramientas nuevas |
| **MoureDev** (Brais Moure) | Rutas de programación y cursos de desarrollo con IA: agentes, multiagente, SDD | Construir; su [roadmap](https://mouredev.pro/roadmap) y directos largos programando con agentes |
| **BettaTech** (Martí Cristóbal) | Calidad, arquitectura y buenas prácticas al programar con agentes | Criterio de ingeniería; su podcast *TheCommitShow* y Commit Academy |
| **[La Inteligencia Artificial](https://www.youtube.com/@la_inteligencia_artificial)** | Resumen semanal de lo que pasa: herramientas nuevas, sucesos, regulación | El repaso de la semana |

midudev y MoureDev actualizan sus cursos a menudo: vuelve a sus páginas cada mes o dos. Cómo encaja esto en una rutina diaria lo cuenta el autor en [[blog/2026-10-21-treinta-minutos-al-dia]].

## Cómo usar el radar

El [[radar/index|radar]] de MoreContext es el filtro aplicado: solo entra lo que cambia una decisión al construir, está confirmado en una fuente primaria con fecha y se puede explicar en pocas líneas. Cada entrada tiene tres partes: qué es, qué cambia en la práctica y qué hacer, con enlace a la fuente y a las páginas donde se aplica. Si solo tienes diez minutos a la semana, lee el radar y abre la fuente de lo que te afecte.

## Checklist para leer una novedad sin humo

1. **¿Qué es?** ¿Una empresa, un modelo, un concepto o una herramienta? Ver [[roadmap/00-fundamentos/07-empresa-modelo-herramienta]].
2. **¿Dónde está la fuente primaria?** Si solo hay un hilo o un vídeo que lo cuenta, espera a la documentación, la especificación o el paper.
3. **¿Tiene fecha y versión?** Una función sin versión ni fecha no se puede comprobar.
4. **¿Quién midió y cómo?** Una cifra de benchmark del propio proveedor, con su arnés, no se compara con otra; las diferencias de menos de 3 puntos en benchmarks agénticos son ruido ([[docs/evals/03-benchmarks-publicos]]).
5. **¿Qué licencia tiene?** Open source, pesos abiertos o comercial cambian lo que puedes hacer con ello.
6. **¿Cambia algo que haría mañana?** Si no cambia ninguna decisión, apúntalo y sigue.
7. **¿Puedo probarlo en pequeño?** Una prueba de media hora con tu caso vale más que diez opiniones.

Lo que no pasa este filtro (rumores, filtraciones, anuncios sin fecha, rondas de financiación, comparativas sin método) no entra en el radar ni en las lecciones.
