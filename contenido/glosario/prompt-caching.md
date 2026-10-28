---
titulo: Prompt caching
descripcion: Reutilizar un prefijo de la petición ya procesado para que las siguientes llamadas cuesten menos y respondan antes.
creado: 2026-07-21
categoria: produccion
aliases: [caché de prompts, cache_control, caché de contexto]
tags: [produccion, costes]
relacionados: ["[[docs/contexto/02-prompt-caching]]", "[[recetas/recortar-costes-con-prompt-caching]]"]
---

*Prompt caching* es guardar en el servidor el procesamiento de la parte inicial de una petición (herramientas, prompt de sistema, documentos) para reutilizarlo en llamadas posteriores con el mismo prefijo. Leer de caché cuesta mucho menos que procesar la entrada de nuevo y reduce la [[glosario/latencia]].

## En la práctica

En la API de Anthropic marcas un bloque con `"cache_control": {"type": "ephemeral"}` (hasta 4 puntos de corte) o lo pones en el nivel superior de la petición para caché automática. El prefijo se cachea en orden `tools` → `system` → `messages`, y cambiar cualquier cosa invalida esa parte y todo lo posterior: pon lo estable arriba y lo variable al final. El TTL por defecto es de 5 minutos y se renueva con cada uso; existe la opción `"ttl": "1h"`. Hay un mínimo de tokens para cachear según el modelo. Comprueba que funciona en `usage.cache_read_input_tokens`.

## Ver también

- [[docs/contexto/02-prompt-caching]]
- [[roadmap/100-produccion/02-costes-y-prompt-caching]]
- [[recetas/recortar-costes-con-prompt-caching]]
- [[radar/2026-07-21-prompt-caching-palanca-de-coste]]
