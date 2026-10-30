---
titulo: Las skills de terceros son cadena de suministro
descripcion: "Un estudio de casi cuatro mil skills públicas encuentra fallos críticos en más de una de cada diez y 76 maliciosas: instalarlas pide el mismo rigor que una dependencia."
creado: 2026-10-26
categoria: seguridad
tags: [seguridad, skills, cadena-de-suministro]
fuente:
  titulo: "Snyk, 5 feb. 2026 · ToxicSkills"
  url: https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/
relacionados: ["[[docs/seguridad/04-mcp-y-skills-de-terceros]]", "[[glosario/skill]]", "[[roadmap/50-skills/05-skills-en-equipo]]", "[[radar/2026-10-24-owasp-top-10-agentico]]"]
---

## Qué es

Una [[glosario/skill|skill]] mete instrucciones en el contexto de tu agente y, a menudo, scripts que se ejecutan con tus permisos. Snyk analizó 3.984 skills de los registros ClawHub y skills.sh (5 feb. 2026): el 13,4 % tenía al menos un problema crítico, el 36,82 % algún fallo de seguridad, y confirmaron 76 maliciosas. Todas esas 76 llevaban código malicioso y el 91 % lo combinaba con [[glosario/inyeccion-de-prompt|inyección de prompt]]. Las técnicas son las de los paquetes maliciosos de siempre (`curl | bash`, binarios externos, credenciales exfiltradas en Base64) más una nueva: modificar archivos de memoria del agente como `SOUL.md` o `MEMORY.md` para persistir. Las cifras de detección son de Snyk, que vende análisis de seguridad. Anthropic ya pedía al presentar las skills ([16 oct. 2025](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)) instalarlas solo de fuentes de confianza y revisar sus scripts y dependencias.

## Qué cambia en la práctica

- Instalar una skill es instalar una dependencia que además da instrucciones al modelo.
- Revisar el frontmatter no basta: el riesgo está en el cuerpo, los scripts y lo que se descarga al ejecutar.
- Los archivos de memoria del agente pasan a ser algo que vigilar.

## Qué hacer

1. Instala solo skills de origen conocido, con versión fija, y lee el `SKILL.md` y todos sus scripts.
2. Ejecútalas en [[glosario/sandbox|sandbox]] y sin credenciales que no necesiten.
3. Aplica la checklist de [[docs/seguridad/04-mcp-y-skills-de-terceros]] y, en equipo, las reglas de [[roadmap/50-skills/05-skills-en-equipo]].
4. Si sospechas de una skill instalada: retírala, rota credenciales y revisa los archivos de memoria.
