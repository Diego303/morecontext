---
titulo: Observabilidad
descripcion: Capacidad de ver qué hace tu sistema con LLM en cada petición mediante trazas, registros y métricas de coste y latencia.
creado: 2026-10-01
categoria: produccion
ingles: observability
aliases: [observability, trazabilidad, tracing]
tags: [produccion]
relacionados: ["[[docs/produccion/01-observabilidad]]", "[[roadmap/100-produccion/01-observabilidad-y-trazas]]"]
---

La observabilidad es poder responder, para cualquier petición, qué ha pasado dentro del sistema: qué prompt se envió, qué devolvió el modelo, qué herramientas llamó, cuánto tardó cada paso y cuántos tokens gastó. En un [[glosario/agente]] es la diferencia entre depurar leyendo la [[glosario/trayectoria]] y adivinar.

## En la práctica

Registra cada llamada como un *span* dentro de una traza por petición: modelo, entrada, salida, `stop_reason`, `usage` (incluidos los tokens de caché), duración y errores. Añade un identificador de petición y de usuario para poder buscar. Con eso calculas coste por petición, [[glosario/latencia]] por percentiles y tasa de errores de herramientas. Cuidado con los datos personales: decide qué se guarda, durante cuánto tiempo y quién lo ve. Las trazas reales son además la mejor fuente para tu [[glosario/conjunto-de-evaluacion]].

## Ver también

- [[docs/produccion/01-observabilidad]]
- [[roadmap/100-produccion/01-observabilidad-y-trazas]]
- [[disciplinas/observabilidad]]
- [[blog/2026-07-15-como-leer-una-traza]]
