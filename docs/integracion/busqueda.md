# Integración v2 · Búsqueda (fase I5)

Generado con Playwright sobre `dist/` (paleta Ctrl+K, índice de Pagefind), 2026-10-30.

## Búsquedas de aceptación

| Consulta | 1.º | 2.º | 3.º | ¿Esperada entre las 3 primeras? |
|---|---|---|---|---|
| «tool_result sin tool_use» | `/glosario/tool-result/` | `/problemas/tool-result-sin-tool-use/` | `/roadmap/20-herramientas/ciclo-tool-use/` | sí (`/problemas/tool-result-sin-tool-use/`) |
| «LangGraph interrupt» | `/glosario/checkpointer/` | `/problemas/langgraph-no-reanuda-tras-interrupt/` | `/docs/frameworks/langgraph/` | sí (`/problemas/langgraph-no-reanuda-tras-interrupt/` o `/cursos/langchain-y-langgraph/humano-en-el-bucle-con-interrupt/`) |
| «worktree» | `/glosario/worktree/` | `/glosario/ola/` | `/recetas/features-en-paralelo-con-worktrees/` | sí (`/glosario/worktree/` o `/recetas/features-en-paralelo-con-worktrees/` o `/blog/2026-10-25-tres-cosas-que-se-rompen-sin-worktrees/`) |
| «HNSW» | `/glosario/hnsw/` | `/glosario/ann/` | `/glosario/similitud-coseno/` | sí (`/glosario/hnsw/` o `/cursos/rag-a-fondo/bases-vectoriales-por-dentro/`) |
| «Ollama» | `/glosario/inferencia-local/` | `/docs/modelos-abiertos/ollama/` | `/herramientas/ollama/` | sí (`/herramientas/ollama/` o `/docs/modelos-abiertos/ollama/` o `/recetas/agente-local-con-ollama/`) |
| «unexpected tool_use_id found in tool_result blocks» | `/problemas/tool-result-sin-tool-use/` | `/problemas/` | — | sí (`/problemas/tool-result-sin-tool-use/`) |

## Pestañas (memoria por orden de uso)

1. Sin nada guardado, `/roadmap/10-prompting/instrucciones-claras/`: 1 grupos, activas: Python (la primera de cada grupo).
2. Se pulsa «TypeScript»: todos los grupos de la página pasan a TypeScript.
3. `/problemas/el-agente-no-para/` (etiquetas: LangChain, LangGraph): ninguna está guardada, así que al entrar se ve la primera (LangChain); se pulsa «LangGraph»; activas: LangGraph.
4. Vuelta a `/roadmap/10-prompting/instrucciones-claras/`: activas: TypeScript. **Sigue en TypeScript.**
5. `localStorage["mc.pestanas"]` = `["LangGraph","TypeScript"]`.

Resultado: correcto.

## Mermaid

| Página | Diagramas | Dibujados (SVG) | Errores de consola |
|---|---:|---:|---|
| `/cursos/harness-engineering/el-flujo-como-maquina-de-estados/` | 1 | 1 | ninguno |
| `/sistemas/harness-sdd-claude-code/` | 1 | 1 | ninguno |
| `/cursos/langchain-y-langgraph/langgraph-estado-nodos-y-aristas/` | 1 | 1 | ninguno |
