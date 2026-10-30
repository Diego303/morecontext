---
titulo: El prompt caching es la primera palanca de coste
descripcion: En agentes y asistentes con prefijos largos y repetidos, cachear el prompt suele ser el ahorro más grande y más fácil antes de tocar nada más.
creado: 2026-07-21
actualizado: 2026-10-29
categoria: practicas
tags: [costes, prompt-caching, produccion]
fuente:
  titulo: Documentación de la API de Claude
  url: https://platform.claude.com/docs
relacionados: ["[[glosario/prompt-caching]]", "[[docs/contexto/02-prompt-caching]]", "[[recetas/recortar-costes-con-prompt-caching]]", "[[roadmap/100-produccion/02-costes-y-prompt-caching]]"]
---

## Qué es

Un agente reenvía en cada paso lo mismo: definiciones de herramientas, [[glosario/prompt-de-sistema|prompt de sistema]], documentos y todo el historial. Con [[glosario/prompt-caching|prompt caching]] ese prefijo se guarda y las peticiones siguientes lo leen de caché, que cuesta mucho menos que la entrada normal y reduce la [[glosario/latencia|latencia]]. Antes de cambiar de modelo o recortar el prompt, es el primer sitio donde mirar.

## Qué cambia en la práctica

- Marcas un bloque con `"cache_control": {"type": "ephemeral"}` (hasta 4 puntos de corte) o activas la caché automática en el nivel superior de la petición.
- El prefijo se cachea en orden `tools` → `system` → `messages`. Cambiar algo invalida eso y todo lo posterior.
- La caché dura 5 minutos por defecto y se renueva al usarse; existe la opción de una hora.
- Escribir en caché cuesta algo más que la entrada normal, y hay un mínimo de tokens que depende del modelo. Consulta multiplicadores y mínimos en la documentación oficial.

## Qué hacer

1. Ordena el prompt de lo estable a lo variable. Nada de fechas ni identificadores al principio del sistema.
2. Mide `cache_creation_input_tokens` y `cache_read_input_tokens` en `resp.usage` para comprobar aciertos.
3. Sigue la receta [[recetas/recortar-costes-con-prompt-caching]] y la referencia [[docs/contexto/02-prompt-caching]].
4. Integra la medición en tu control de costes: [[docs/produccion/02-costes-y-limites]].

> [!nota] Actualización (oct. 2026)
> Dos datos concretos que aquí quedaban en «consulta la documentación»: en los modelos actuales el mínimo cacheable es de 512 tokens, y la caché automática ocupa uno de los 4 puntos de corte. Además, la API ya explica por qué no acertó la caché respecto a una petición anterior (`diagnostics`, GA): lo tienes en [[recetas/diagnosticar-fallos-de-cache]] y, por síntomas, en [[problemas/la-cache-no-se-aprovecha]].
