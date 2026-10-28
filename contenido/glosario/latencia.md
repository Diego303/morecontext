---
titulo: Latencia
descripcion: Tiempo que tarda el sistema en responder, desde que envías la petición hasta el primer token o la respuesta completa.
creado: 2026-10-05
categoria: produccion
ingles: latency
aliases: [latency, tiempo de respuesta, tiempo hasta el primer token]
tags: [produccion, rendimiento]
relacionados: ["[[roadmap/100-produccion/03-latencia]]", "[[docs/produccion/03-latencia]]"]
---

La latencia es el tiempo de espera entre que envías una petición y obtienes la respuesta. En sistemas con LLM se miden dos cosas: el **tiempo hasta el primer token** (lo que el usuario percibe como «empieza a responder») y el **tiempo total**, que crece con el número de [[glosario/token|tokens]] de salida y, en un [[glosario/agente]], con cada paso del bucle.

## En la práctica

Mide antes de optimizar, por percentiles y no solo con la media. Las palancas, de más a menos impacto habitual: menos pasos y menos llamadas encadenadas, menos tokens de salida, un modelo más rápido para las tareas sencillas, [[glosario/prompt-caching]] para prefijos largos y llamadas en paralelo cuando no dependen entre sí. El [[glosario/streaming]] no reduce el tiempo total, pero hace que la espera se perciba mucho menor. El [[glosario/razonamiento-extendido]] añade latencia: actívalo donde aporte.

## Ver también

- [[roadmap/100-produccion/03-latencia]]
- [[roadmap/00-fundamentos/05-coste-y-latencia]]
- [[docs/produccion/03-latencia]]
- [[glosario/observabilidad]]
