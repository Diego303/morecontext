---
titulo: Regla de dos
descripcion: Regla de seguridad para agentes que impide combinar en una misma sesión entrada no fiable, datos sensibles y acciones con efectos.
creado: 2026-10-29
categoria: seguridad
ingles: Agents Rule of Two
aliases: [Agents Rule of Two, Rule of Two, regla de dos de Meta]
tags: [seguridad, agentes]
relacionados: ["[[glosario/trifecta-letal]]", "[[docs/seguridad/03-patrones-contra-inyeccion]]", "[[glosario/minimo-privilegio]]"]
---

La regla de dos, atribuida a Meta AI ([*Agents Rule of Two*, 31 oct. 2025](https://ai.meta.com/blog/practical-ai-agent-security/)), dice que en una sesión un agente debe cumplir **como mucho dos** de estas tres propiedades: [A] procesar entradas no fiables, [B] acceder a sistemas sensibles o datos privados y [C] cambiar estado o comunicarse con el exterior. Si la tarea necesita las tres, hace falta supervisión (aprobación humana u otra validación fiable) o empezar con un contexto nuevo.

## En la práctica

Dibuja el flujo de datos de tu agente y marca A, B y C en cada sesión. Un agente que lee correos de desconocidos (A) y consulta tu CRM (B) no debería poder enviar nada sin una [[glosario/puerta-humana]] (C). La regla no te protege de errores, alucinaciones ni permisos excesivos: complementa al [[glosario/minimo-privilegio]], no lo sustituye.

## No confundir con

- **[[glosario/trifecta-letal]]** (Willison, jun. 2025): datos privados + contenido no fiable + comunicación externa. La regla de dos amplía la tercera pata a cualquier cambio de estado.

## Ver también

- [[docs/seguridad/03-patrones-contra-inyeccion]]
- [[glosario/inyeccion-de-prompt]]
- [[cursos/seguridad-y-prompt-injection/01-modelo-de-amenazas]]
- [[disciplinas/seguridad]]
