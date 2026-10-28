---
titulo: Seguridad y prompt injection
descripcion: Monográfico avanzado para proteger agentes que leen contenido no fiable y actúan sobre sistemas reales, desde el modelo de amenazas hasta permisos, confirmación y sandbox.
creado: 2026-10-16
orden: 4
nivel: avanzado
horas: 4
objetivo: Modelar las amenazas de un agente, entender la inyección directa e indirecta y diseñar defensas en capas que limiten el daño aunque el modelo sea engañado.
requiere: ["[[roadmap/40-primer-agente/index]]", "[[roadmap/100-produccion/index]]"]
relacionados: ["[[glosario/inyeccion-de-prompt]]", "[[disciplinas/seguridad]]", "[[docs/seguridad/01-prompt-injection]]", "[[radar/2026-10-20-inyeccion-por-herramientas]]"]
tags: [seguridad, prompt-injection, agentes, permisos]
---

En el roadmap viste lo esencial en una lección ([[roadmap/100-produccion/04-seguridad-y-prompt-injection]]). Este curso parte de una premisa incómoda: **hoy no existe una forma fiable de impedir que un modelo siga instrucciones escondidas en los datos que lee**. Si tu agente lee correos, webs o documentos y además puede actuar, alguien acabará intentando darle órdenes. La pregunta útil es cuánto daño puede hacer cuando lo consiga.

## Objetivo

Al terminar sabrás construir el modelo de amenazas de un agente concreto, reconocer la [[glosario/inyeccion-de-prompt|inyección de prompt]] directa e indirecta en sus distintas formas, montar una batería de pruebas de ataque y diseñar defensas en capas: separar datos de instrucciones, reducir capacidades, pedir confirmación, aislar la ejecución y filtrar la salida.

## Para quién

Para quien diseña o mantiene agentes con acceso a datos privados o con capacidad de actuar (enviar, pagar, borrar, ejecutar código). También para responsables de seguridad que necesitan hablar el idioma de estos sistemas. Es un curso avanzado: supone que sabes construir un agente con herramientas y que has pensado en su despliegue.

## Requisitos

- [[roadmap/40-primer-agente/index]]: bucle agéntico y herramientas.
- [[roadmap/100-produccion/index]]: observabilidad, humano en el bucle y despliegue.
- Recomendables: [[cursos/mcp-de-cero-a-servidor/index]] (para la parte de servidores de terceros) y [[cursos/evals-para-agentes/index]] (para convertir ataques en evals).

## Temario

1. [[cursos/seguridad-y-prompt-injection/01-modelo-de-amenazas]]. Activos, actores, puntos de entrada y capacidades. La combinación peligrosa de datos privados, contenido no fiable y un canal de salida. Un diagrama de flujo de datos con fronteras de confianza.
2. [[cursos/seguridad-y-prompt-injection/02-inyeccion-directa-e-indirecta]]. Del *jailbreak* a la inyección indirecta descrita por Greshake et al. (2023): webs, correos, documentos, resultados de herramientas y descripciones de servidores MCP. Exfiltración por enlaces e imágenes. Una batería de ataques reproducible.
3. [[cursos/seguridad-y-prompt-injection/03-defensas-en-capas]]. Por qué ninguna defensa basta sola. Separar datos de instrucciones, seguimiento de contenido contaminado, confirmación, filtrado de salida y detección. El OWASP Top 10 para aplicaciones con LLM como lista de control.
4. [[cursos/seguridad-y-prompt-injection/04-permisos-y-sandbox]]. [[glosario/minimo-privilegio|Mínimo privilegio]] por herramienta y por usuario, políticas de aprobación, credenciales acotadas, [[glosario/sandbox|sandbox]] con contenedores y control de salida de red.

## Qué construyes

Para un agente tuyo: su modelo de amenazas documentado, una batería de al menos 15 ataques ejecutable como eval, y una capa de defensa con política de permisos, confirmación de acciones sensibles, filtrado de enlaces en la salida y ejecución de código en un contenedor aislado. El criterio de éxito es concreto: ningún ataque de la batería consigue una acción prohibida.

> [!peligro] Ética y alcance
> Las técnicas de ataque de este curso son para probar sistemas tuyos o sobre los que tienes autorización expresa. Probar sistemas ajenos sin permiso puede ser ilegal.
