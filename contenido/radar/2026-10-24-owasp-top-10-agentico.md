---
titulo: OWASP publica su Top 10 para aplicaciones agénticas
descripcion: El OWASP GenAI Security Project publica una lista de los diez riesgos de seguridad propios de agentes, de secuestrar su objetivo a agentes que se descontrolan.
creado: 2026-10-24
categoria: seguridad
tags: [seguridad, owasp, agentes]
fuente:
  titulo: "OWASP GenAI Security Project, 9 dic. 2025 · OWASP Top 10 for Agentic Applications for 2026"
  url: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
relacionados: ["[[disciplinas/seguridad]]", "[[docs/seguridad/03-patrones-contra-inyeccion]]", "[[cursos/seguridad-y-prompt-injection/03-defensas-en-capas]]", "[[docs/seguridad/01-prompt-injection]]"]
---

## Qué es

El 9 de diciembre de 2025, el OWASP GenAI Security Project publicó el *Top 10 for Agentic Applications for 2026*, elaborado con más de cien expertos. Complementa al Top 10 para aplicaciones con LLM (2025), que se centra en la llamada al modelo, con los riesgos de sistemas que planifican, usan herramientas y actúan. La página de OWASP no reproduce la lista; esta es la que recogen los resúmenes publicados del documento (compruébala en el PDF oficial):

| Código | Riesgo |
|---|---|
| ASI01 | Agent Goal Hijack (secuestro del objetivo) |
| ASI02 | Tool Misuse and Exploitation |
| ASI03 | Identity and Privilege Abuse |
| ASI04 | Agentic Supply Chain Vulnerabilities |
| ASI05 | Unexpected Code Execution (RCE) |
| ASI06 | Memory & Context Poisoning |
| ASI07 | Insecure Inter-Agent Communication |
| ASI08 | Cascading Failures |
| ASI09 | Human-Agent Trust Exploitation |
| ASI10 | Rogue Agents |

## Qué cambia en la práctica

- Tienes un vocabulario común para revisar un diseño con tu equipo de seguridad, más allá de «prompt injection».
- Aparecen riesgos que la lista de LLM no cubría bien: la memoria que se envenena entre sesiones, la comunicación entre agentes, los fallos que se propagan en cadena y la confianza excesiva del humano que aprueba.
- La cadena de suministro (ASI04) abarca lo que el agente carga de terceros, como servidores MCP y skills.

## Qué hacer

1. Recorre la lista con el diagrama de flujo de datos de tu agente y anota qué riesgos aplican.
2. Para ASI01 a ASI03, aplica un patrón de [[docs/seguridad/03-patrones-contra-inyeccion]] y [[glosario/minimo-privilegio|mínimo privilegio]].
3. Para ASI04, sigue la lista de [[docs/seguridad/04-mcp-y-skills-de-terceros]].
4. Consulta el documento oficial para las mitigaciones de cada riesgo.
