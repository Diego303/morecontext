---
titulo: promptfoo
descripcion: Herramienta de línea de comandos para evaluar prompts y modelos con casos declarados en YAML, comparar proveedores, hacer red teaming y meterlo en CI.
creado: 2026-10-29
tags: [evals, ci, red-teaming]
relacionados: ["[[recetas/evals-con-promptfoo]]", "[[docs/modelos-abiertos/08-evals-abiertas]]", "[[recetas/evals-de-regresion-en-ci]]", "[[glosario/evals]]"]
categoria: evals
licencia: MIT
open_source: true
lenguajes: [TypeScript, YAML]
url: https://promptfoo.dev
repositorio: https://github.com/promptfoo/promptfoo
version: "0.125.1"
revisado: 2026-10-29
---

promptfoo es una CLI de Node para [[glosario/evals]] declarativas: describes *prompts*, proveedores y casos de prueba en un `promptfooconfig.yaml`, lo ejecutas con `promptfoo eval` y obtienes una matriz caso × modelo con lo que pasa y lo que falla. Licencia MIT. El proyecto se presenta ahora como «parte de OpenAI» y sigue siendo open source.

## Para qué sirve

- Comparar dos versiones de un *prompt* o varios modelos (Claude, OpenAI, Ollama, vLLM…) con los mismos casos.
- Aserciones deterministas (`icontains`, `is-json`, `contains-json`, `javascript`, `tool-call-f1`) y con [[glosario/modelo-juez]] (`llm-rubric`).
- Evals de regresión en CI: el comando falla si un caso falla ([[recetas/evals-de-regresion-en-ci]]).
- *Red teaming*: generar ataques contra tu aplicación.

## Cuándo usarla

Cuando quieres evals sin escribir código de *harness*, con un fichero que cualquiera del equipo puede leer y revisar en un *pull request*. Es el camino corto para el método de [[cursos/evals-para-agentes/04-evals-en-el-dia-a-dia]].

## Cuándo no

- Para evaluar trayectorias largas de agentes con herramientas y *sandbox*: [[herramientas/inspect-ai]].
- Si tus tests ya viven en pytest: [[herramientas/deepeval]] encaja mejor.
- Para métricas específicas de RAG: [[herramientas/ragas]].

## Ejemplo mínimo

Configuración validada con `promptfoo validate` (0.125.1: «Configuration is valid.»), con un modelo local de Ollama como sistema evaluado y como juez:

```yaml title="promptfooconfig.yaml"
description: Clasificador de tickets con un modelo local
prompts:
  - "Clasifica el ticket en facturacion, envio, devolucion u otro. Responde solo la categoría.\n\nTicket: {{ticket}}"
providers:
  - id: ollama:chat:qwen3.6:27b
    config: { temperature: 0 }
defaultTest:
  options:
    provider: ollama:chat:qwen3.6:27b   # juez local para llm-rubric
tests:
  - vars: { ticket: "Me cobrasteis dos veces este mes" }
    assert: [{ type: icontains, value: facturacion }]
  - vars: { ticket: "El paquete no ha llegado" }
    assert:
      - { type: icontains, value: envio }
      - { type: llm-rubric, value: "Responde con una sola palabra, sin explicación" }
```

```bash
export PROMPTFOO_DISABLE_TELEMETRY=1   # la telemetría viene activada por defecto
npx promptfoo@latest eval
npx promptfoo@latest view              # la matriz de resultados en el navegador
```

`OLLAMA_BASE_URL` cambia el host de Ollama. `temperature` es un parámetro del modelo local; con Claude no lo pongas (la API `2026-10-21` lo eliminó).

> [!aviso] El juez por defecto
> Si no fijas `defaultTest.options.provider`, `llm-rubric` usa un proveedor por defecto de pago. Y un juez local más débil que el modelo evaluado infla las notas: valídalo antes con [[recetas/validar-un-modelo-juez]].

## Alternativas

- [[herramientas/deepeval]]: evals al estilo pytest.
- [[herramientas/inspect-ai]]: evals reproducibles de agentes con *sandbox*.
- [[herramientas/ragas]]: métricas de RAG.

## Enlaces

- Web y documentación: [promptfoo.dev](https://promptfoo.dev)
- Repositorio: [github.com/promptfoo/promptfoo](https://github.com/promptfoo/promptfoo)
