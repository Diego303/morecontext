---
titulo: Producción
descripcion: Referencia para llevar agentes a producción con trazas, control de costes, límites de tasa, reintentos y latencia razonable.
creado: 2026-10-14
actualizado: 2026-10-29
orden: 7
tags: [produccion, docs]
relacionados: ["[[roadmap/100-produccion/index]]", "[[disciplinas/observabilidad]]", "[[glosario/observabilidad]]"]
---

Un prototipo responde bien en tu portátil. Un sistema en producción responde bien con mil usuarios a la vez, sabe cuánto cuesta cada petición, sobrevive a errores de la API y te deja reconstruir qué pasó cuando algo sale mal. Este grupo reúne la referencia técnica para ese salto. La versión guiada, con proyecto, está en el nivel [[roadmap/100-produccion/index]].

## Qué cubre

- **[[docs/produccion/01-observabilidad]]**. Qué registrar de cada llamada y de cada paso del agente, cómo organizarlo en trazas y qué métricas mirar a diario. Es lo primero que montas: sin trazas, los demás artículos se quedan en intuiciones.
- **[[docs/produccion/04-opentelemetry-genai]]**. El estándar abierto para nombrar esas trazas: los spans `invoke_agent`, `chat` y `execute_tool`, los atributos `gen_ai.*`, su estado real y un bucle instrumentado a mano. Léelo después del primero.
- **[[docs/produccion/02-costes-y-limites]]**. Cómo leer `usage`, qué palancas bajan el coste (*[[glosario/prompt-caching|prompt caching]]*, procesamiento por lotes, modelo adecuado, contexto más corto) y cómo manejar los límites de tasa y los errores 429 y 529 con reintentos y *backoff*.
- **[[docs/produccion/03-latencia]]**. De qué se compone el tiempo de respuesta, cómo medirlo y qué hacer para bajarlo: [[glosario/streaming|streaming]], menos tokens de salida, menos pasos, paralelismo y caché.

## Orden recomendado

Primero observabilidad, porque te da los datos (y, si quieres un formato común, el artículo de OpenTelemetry GenAI). Después costes y latencia, que se optimizan con esos datos y suelen tirar en direcciones opuestas: lo más barato no siempre es lo más rápido. Antes de abrir el sistema a usuarios reales, repasa también [[docs/seguridad/index]] y la [[modelos/09-checklist-produccion|checklist de la guía de modelos]].

Para soluciones concretas y cortas, las recetas [[recetas/recortar-costes-con-prompt-caching]], [[recetas/reintentos-y-limites-de-tasa]] y [[recetas/streaming-de-respuestas]] complementan estos artículos. Si alojas tú los modelos, las trazas con herramientas abiertas están en [[docs/modelos-abiertos/07-observabilidad-abierta]] y la receta [[recetas/trazas-con-langfuse]].
