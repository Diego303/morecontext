---
titulo: Recetas
descripcion: Soluciones cortas y probadas a problemas concretos al construir con modelos, con pasos numerados, código y cómo comprobar que funcionan.
creado: 2026-07-10
actualizado: 2026-10-29
orden: 8
tags: [recetas]
relacionados: ["[[docs/index]]", "[[sistemas/index]]", "[[paginas/contribuir]]"]
---

Una receta resuelve **un problema concreto en una sesión de trabajo**, casi siempre en menos de una hora. Sin teoría de fondo: lo justo para que funcione y para que sepas comprobarlo. Si necesitas entender el porqué, cada receta enlaza a la lección o al artículo de docs que lo explica.

## Formato de cada receta

Todas siguen la misma estructura, para que encuentres lo que buscas sin leer de arriba abajo:

1. **Problema**: qué quieres conseguir, en dos frases.
2. **Ingredientes**: lo que necesitas antes de empezar.
3. **Pasos**: lista numerada con el código de cada paso.
4. **Cómo comprobar que funciona**: una prueba que puedes ejecutar.
5. **Variaciones**: adaptaciones habituales.
6. **Errores típicos**: lo que suele fallar y cómo evitarlo.

La cabecera indica el tema, el nivel y los minutos estimados.

## Por tema

El listado de abajo se filtra por tema y por nivel. Hay siete temas:

- **Prompting**: tareas de una sola llamada bien planteada, como [[recetas/clasificar-y-enrutar-tickets]].
- **Herramientas**: definir, servir y conectar herramientas, de [[recetas/extraer-facturas-a-json]] a [[recetas/servidor-mcp-de-solo-lectura]].
- **RAG**: trocear, indexar y recuperar. Si partes de cero, [[recetas/rag-minimo-viable]].
- **Agentes**: el bucle y su control, con humanos en medio ([[recetas/aprobacion-humana-antes-de-actuar]]) o con frameworks ([[recetas/map-reduce-con-send]]).
- **Evals**: medir antes de cambiar, de [[recetas/evals-de-regresion-en-ci]] a [[recetas/validar-un-modelo-juez]].
- **Producción**: coste, latencia y fallos de red, como [[recetas/recortar-costes-con-prompt-caching]].
- **Seguridad**: fronteras deterministas alrededor del agente, como [[recetas/hook-que-bloquea-comandos-peligrosos]] y [[recetas/proteger-secretos-del-agente]].

El código va primero con el SDK de Anthropic. Cuando aporta, la receta añade la versión con un framework abierto (LangChain, LangGraph) o con un modelo local, y hay recetas enteras sobre piezas abiertas, como [[recetas/agente-local-con-ollama]] o [[recetas/rag-local-con-pgvector]].

## Por dónde empezar

Si tienes algo en producción, empieza por el caching, los reintentos y el streaming: te ahorran dinero y errores desde el primer día. Si estás montando tu primer RAG, empieza por [[recetas/trocear-documentos]]. Si algo ya falla y no sabes por qué, busca el síntoma en [[problemas/index|problemas frecuentes]].

> [!consejo] Propón la tuya
> Las recetas son la forma más fácil de contribuir. Usa la plantilla y sigue los pasos de [[paginas/contribuir]].
