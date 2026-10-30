---
titulo: Problemas frecuentes
descripcion: Síntomas reales al construir agentes y aplicaciones con modelos de lenguaje, con su causa, cómo confirmarla y el arreglo con código. Busca pegando tu mensaje de error.
creado: 2026-10-29
orden: 16
tags: [problemas, depuracion, errores]
relacionados: ["[[roadmap/40-primer-agente/06-depurar-con-trazas]]", "[[recetas/index]]", "[[paginas/contribuir]]"]
---

Esta sección empieza por lo que ves: un error 400, un agente que no termina, un RAG que no encuentra lo que existe. Cada página sigue el mismo camino, **síntoma → causa → arreglo**: el síntoma literal (con el mensaje de error exacto cuando lo hay), las causas posibles, cómo confirmar cuál es la tuya, el arreglo con código, cómo evitar que vuelva y dónde se explica a fondo. Los errores que se pueden reproducir sin servicios externos están reproducidos con el SDK, LangGraph, MCP o git; cuando no, la página lo dice y da su fuente.

## Cómo buscar

**Pega el mensaje de error en el buscador de la web**, sin los datos que cambian en cada caso: quita ids (`toolu_01…`, `msg_…`), rutas y números de posición. Por ejemplo, busca `unexpected tool_use_id found in tool_result blocks` o `Cannot use Command(resume=...) without checkpointer`. Si no hay error, describe el síntoma como lo dirías: «se corta», «no para», «ignora».

## Herramientas y API

- [[problemas/tool-result-sin-tool-use]]
- [[problemas/respuesta-cortada-por-max-tokens]]
- [[problemas/json-invalido-del-modelo]]
- [[problemas/el-modelo-ignora-instrucciones]]
- [[problemas/modelo-local-no-llama-herramientas]]
- [[problemas/servidor-mcp-no-aparece]]

## Agentes

- [[problemas/el-agente-no-para]]
- [[problemas/el-agente-repite-la-misma-herramienta]]
- [[problemas/contexto-saturado-en-sesiones-largas]]
- [[problemas/langgraph-no-reanuda-tras-interrupt]]
- [[problemas/conflictos-al-integrar-en-paralelo]]

## RAG

- [[problemas/el-rag-no-encuentra-el-documento]]
- [[problemas/el-rag-encuentra-pero-responde-mal]]

## Producción y seguridad

- [[problemas/error-429-limite-de-tasa]]
- [[problemas/la-cache-no-se-aprovecha]]
- [[problemas/el-hook-bloquea-todo]]

> [!consejo] Antes de buscar, mira la traza
> La mitad de estos problemas se ven en cuanto lees lo que de verdad recibió el modelo y lo que devolvió: `stop_reason`, los `tool_result` y `usage`. Si aún no registras eso, empieza por [[roadmap/40-primer-agente/06-depurar-con-trazas]].

## Proponer uno nuevo

Si te has peleado con un problema que no está aquí, propónlo como se explica en [[paginas/contribuir]]. Para que se pueda publicar, incluye:

1. El síntoma tal como lo viste y el mensaje de error completo, copiado, no parafraseado.
2. Versiones: modelo, SDK o framework y sistema operativo.
3. Un ejemplo mínimo que lo reproduzca (con un modelo simulado si puedes: [[recetas/probar-agentes-sin-api]]).
4. La causa que encontraste y cómo la confirmaste.
5. El arreglo que te funcionó.

Un problema sin reproducción también vale si dice de dónde salen los datos; se publica marcado así hasta que alguien lo reproduzca.
