---
titulo: AI SDK de Vercel
descripcion: SDK abierto de TypeScript para llamar a modelos y montar bucles con herramientas en aplicaciones web, con streaming a la interfaz y aprobación humana.
creado: 2026-10-29
tags: [sdk, typescript, web, streaming, open-source]
relacionados: ["[[docs/frameworks/11-agentes-en-typescript]]", "[[recetas/streaming-de-respuestas]]", "[[herramientas/mastra]]", "[[glosario/streaming]]"]
categoria: sdk
licencia: Apache-2.0
open_source: true
lenguajes: [TypeScript]
url: https://www.npmjs.com/package/ai
repositorio: https://github.com/vercel/ai
version: "7.0.157"
revisado: 2026-10-29
---

El AI SDK de Vercel (paquete `ai`, hoy en la v7) es una interfaz común en TypeScript para muchos proveedores: `generateText`, `streamText`, herramientas definidas con zod y `ToolLoopAgent`, que encapsula un agente con su bucle. Los proveedores van en paquetes aparte, como `@ai-sdk/anthropic` 4.0.92.

**Licencia**: Apache-2.0, open source. Lo comercial: el **AI Gateway** de Vercel. Si pasas el modelo como string, se resuelve por `globalThis.AI_SDK_DEFAULT_PROVIDER ?? gateway`, es decir, por el gateway salvo que configures otro proveedor. Pasa siempre una instancia explícita (`anthropic("…")`).

## Para qué sirve

- Productos web en TypeScript con [[glosario/streaming|streaming]] de la respuesta a la interfaz de serie.
- Bucles con herramientas: `generateText({ …, stopWhen })` o `new ToolLoopAgent({ … })`.
- [[glosario/humano-en-el-bucle|Aprobación humana]] con `needsApproval: true` en una herramienta: el bucle se detiene y devuelve una petición de aprobación.
- Pruebas sin API con `MockLanguageModelV4`.

## Cuándo usarla

Cuando el agente vive en una aplicación web o en Node y quieres poco código entre el modelo y la interfaz.

## Cuándo no

- Flujos con estado durable, reanudación y aprobaciones que tardan días: LangGraph.js o [[herramientas/langgraph]] en Python.
- Si tu backend es Python: [[herramientas/anthropic-sdk]], [[herramientas/pydantic-ai]] o [[herramientas/langchain]].

## Ejemplo mínimo

Recorte del ejemplo verificado de la investigación (allí se ejecutó con `MockLanguageModelV4`); esta versión compila con `tsc --noEmit` contra `ai` 7.0.157:

```ts title="agente.ts"
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, isStepCount, tool } from "ai";
import { z } from "zod";

const MODEL = anthropic("claude-sonnet-5-5"); // instancia explícita: un string iría por el AI Gateway de Vercel

const verPedidos = tool({
  description: "Lista los pedidos de un cliente por su email.",
  inputSchema: z.object({ email: z.string().describe("Email del cliente") }),
  execute: async ({ email }) => {
    if (email !== "ana@example.com") throw new Error(`No hay ningún cliente con email ${email}`); // vuelve como tool-error
    return [{ id: "P-1001", estado: "enviado" }];
  },
});

export async function responder(pregunta: string) {
  const r = await generateText({
    model: MODEL,
    system: "Eres el soporte de una tienda. Usa las herramientas; no inventes datos.",
    prompt: pregunta,
    tools: { ver_pedidos: verPedidos },
    maxOutputTokens: 1024,
    stopWhen: isStepCount(10), // sin stopWhen, generateText hace un solo paso
  });
  return r.text;
}
```

> [!aviso] Sin `stopWhen` no hay bucle
> `generateText` hace **un solo paso** por defecto (`isStepCount(1)`). Si el modelo pide una herramienta, el resultado sale con `finishReason: "tool-calls"` y el texto vacío. `ToolLoopAgent`, en cambio, para por defecto a los 20 pasos. `stepCountIs` sigue existiendo como alias de `isStepCount`.

A favor: una excepción dentro de `execute` vuelve sola al modelo como `tool-error`, sin configurar nada.

## Alternativas

- [[herramientas/mastra]] para una capa de agente más completa en TypeScript.
- [[herramientas/openai-agents-sdk]] (versión JS, que puede usar modelos del AI SDK con `aisdk()`).
- [[herramientas/anthropic-sdk]] en TypeScript (`@anthropic-ai/sdk`) si solo usas Claude.

## Enlaces

- [npm de `ai`](https://www.npmjs.com/package/ai) · [npm de `@ai-sdk/anthropic`](https://www.npmjs.com/package/@ai-sdk/anthropic)
- En MoreContext: [[docs/frameworks/11-agentes-en-typescript]] · [[recetas/probar-agentes-sin-api]] · [[recetas/streaming-de-respuestas]]
