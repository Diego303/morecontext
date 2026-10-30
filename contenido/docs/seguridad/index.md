---
titulo: Seguridad
descripcion: Referencia de seguridad para agentes con herramientas, centrada en la inyección de prompt y en limitar lo que un agente puede hacer.
creado: 2026-10-14
actualizado: 2026-10-29
orden: 8
tags: [seguridad, docs]
relacionados: ["[[disciplinas/seguridad]]", "[[cursos/seguridad-y-prompt-injection/index]]", "[[glosario/inyeccion-de-prompt]]"]
---

Un chatbot que solo genera texto puede, como mucho, decir algo inadecuado. Un agente con herramientas puede leer tu correo, cambiar tu base de datos o enviar dinero. La seguridad de un agente se decide sobre todo en qué herramientas tiene, con qué permisos y qué controles hay entre lo que el modelo pide y lo que se ejecuta. Este grupo reúne la referencia técnica.

## Qué cubre

- **[[docs/seguridad/01-prompt-injection]]**. Qué es la [[glosario/inyeccion-de-prompt|inyección de prompt]], por qué la variante indirecta (instrucciones escondidas en documentos, webs o resultados de herramientas) es la que más preocupa en agentes, y por qué no se resuelve con un buen prompt. Incluye las defensas que sí funcionan, combinadas en capas.
- **[[docs/seguridad/02-permisos-y-minimo-privilegio]]**. Cómo aplicar el [[glosario/minimo-privilegio|mínimo privilegio]] a un agente: herramientas acotadas, credenciales con alcance limitado, políticas en el código, [[glosario/sandbox|sandbox]] y registro de auditoría.
- **[[docs/seguridad/03-patrones-contra-inyeccion]]**. Seis patrones de arquitectura (Plan-Then-Execute, Dual LLM y otros) que hacen que un texto inyectado no pueda disparar acciones con consecuencias, con la trifecta letal y la regla de dos como criterio.
- **[[docs/seguridad/04-mcp-y-skills-de-terceros]]**. Qué ataques llegan por servidores MCP y skills ajenos (envenenamiento de herramientas, *rug pull*, suplantación) y cómo revisarlos, fijarlos y aislarlos antes de instalarlos.

## La idea que une estos artículos

Asume que el modelo puede acabar haciendo lo que un texto malicioso le pida. Con esa premisa, la pregunta deja de ser «¿cómo evito que lo engañen?» y pasa a ser «si lo engañan, ¿qué es lo peor que puede pasar?». Reducir esa respuesta es el trabajo de los permisos, las aprobaciones y el aislamiento.

## Para seguir

Las listas de [OWASP](https://genai.owasp.org) son una buena referencia externa de riesgos: la de aplicaciones con LLM y, desde diciembre de 2025, el Top 10 para aplicaciones agénticas 2026 (ASI01 a ASI10). Para un recorrido guiado, el curso [[cursos/seguridad-y-prompt-injection/index]]. Y para el control humano de acciones sensibles, [[docs/agentes/03-humano-en-el-bucle]].
