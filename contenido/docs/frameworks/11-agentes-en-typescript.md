---
titulo: Agentes en TypeScript
descripcion: "Agentes en TypeScript con Vercel AI SDK 7, LangChain.js y LangGraph.js, Mastra, OpenAI Agents JS y el Claude Agent SDK, con ejemplos que compilan y sus trampas."
creado: 2026-10-29
orden: 11
nivel: intermedio
tags: [frameworks, typescript, vercel-ai-sdk, langchain, mastra, agentes]
relacionados: ["[[herramientas/vercel-ai-sdk]]", "[[herramientas/mastra]]", "[[docs/frameworks/03-claude-agent-sdk]]", "[[docs/frameworks/02-equivalencias]]"]
---

En TypeScript tienes las mismas opciones que en Python y una más pensada para la web. Esta página cubre las cinco que importan hoy, con las versiones de npm a 29 de octubre de 2026: el **Vercel AI SDK** (`ai` 7.0.157, Apache-2.0), **LangChain.js** (`langchain` 1.6.0, MIT) y **LangGraph.js** (`@langchain/langgraph` 1.5.3, MIT), **Mastra** (`@mastra/core` 1.80.0, Apache-2.0 salvo las carpetas `ee/`), **OpenAI Agents JS** (`@openai/agents` 0.21.0, MIT) y el **Claude Agent SDK** de TypeScript (`@anthropic-ai/claude-agent-sdk` 0.3.312, términos comerciales de Anthropic). Todos los ejemplos compilan con `tsc --strict` en esas versiones, con `zod` 4.6.7.

Si vienes del SDK de Anthropic (`@anthropic-ai/sdk`), recuerda que el bucle a mano en TypeScript está en [[docs/agentes/01-el-bucle-agentico]]; aquí ves qué te ahorra cada librería y dónde muerde.

## Vercel AI SDK 7

El AI SDK es la opción más directa para un producto web: streaming hacia la interfaz de serie, ganchos de React y un proveedor por paquete (`@ai-sdk/anthropic` 4.0.92 para Claude). Dos formas de hacer un agente: la función `generateText` (o `streamText`) con `stopWhen`, y la clase `ToolLoopAgent`.

```ts title="agente_ai_sdk.ts"
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, hasToolCall, isStepCount, tool, ToolLoopAgent } from "ai";
import { z } from "zod";

const MODEL = anthropic("claude-sonnet-5-5"); // local: import { ollama } from "ollama-ai-provider-v2"; ollama("qwen3")

const PEDIDOS: Record<string, object[]> = { "ana@example.com": [{ id: "P-1001", estado: "enviado" }] };

const verPedidos = tool({
  description: "Lista los pedidos de un cliente por su email. Devuelve id y estado de cada pedido.",
  inputSchema: z.object({ email: z.string().describe("Email del cliente") }),
  execute: async ({ email }) => {
    const pedidos = PEDIDOS[email.toLowerCase()];
    if (!pedidos) throw new Error(`No hay ningún cliente con email ${email}`); // el SDK lo devuelve al modelo como tool-error
    return pedidos;
  },
});

const reembolsar = tool({
  description: "Emite un reembolso. Acción irreversible.",
  inputSchema: z.object({ pedidoId: z.string(), importeEur: z.number() }),
  needsApproval: true, // el bucle se detiene y devuelve una petición de aprobación
  execute: async ({ pedidoId, importeEur }) => `Reembolso de ${importeEur} € emitido para ${pedidoId}.`,
});

// 1) Función: generateText hace UNA llamada por defecto (isStepCount(1)); stopWhen activa el bucle.
export async function responder(pregunta: string) {
  const r = await generateText({
    model: MODEL,
    system: "Eres el soporte de una tienda. Usa las herramientas; no inventes datos.",
    prompt: pregunta,
    tools: { ver_pedidos: verPedidos },
    maxOutputTokens: 1024,
    stopWhen: [isStepCount(10), hasToolCall("escalar")], // cualquiera de las dos para el bucle
  });
  for (const paso of r.steps) console.log(paso.finishReason, paso.toolCalls.map((c) => c.toolName));
  return r.text;
}

// 2) Clase: ToolLoopAgent encapsula modelo, instrucciones y herramientas (por defecto para a los 20 pasos).
export const agente = new ToolLoopAgent({
  model: MODEL,
  instructions: "Eres el soporte de una tienda. Antes de reembolsar, comprueba el pedido.",
  tools: { ver_pedidos: verPedidos, reembolsar },
  stopWhen: isStepCount(10),
  maxOutputTokens: 1024,
});

export async function main() {
  console.log(await responder("Soy ana@example.com, ¿dónde está mi pedido?"));
  const r = await agente.generate({ prompt: "Quiero devolver el pedido P-1001" });
  console.log(r.text, r.finishReason);
}
```

> [!aviso] `generateText` hace un solo paso por defecto
> Sin `stopWhen`, `generateText` llama al modelo **una vez** (`isStepCount(1)`). Si el modelo pide una herramienta, el SDK la ejecuta, pero no vuelve a llamar al modelo con el resultado: `text` sale vacío y `finishReason` es `"tool-calls"`. Para tener el [[glosario/bucle-agentico|bucle agéntico]], pasa `stopWhen` con un tope ([[roadmap/40-primer-agente/03-condiciones-de-parada]]).

Lo que se comprobó ejecutando el bucle con `MockLanguageModelV4` (de `ai/test`), el [[glosario/modelo-simulado|modelo simulado]] del SDK:

```text
1) sin stopWhen -> pasos: 1 | finishReason: tool-calls | text: ""
2) con stopWhen -> pasos: 3 | text: Tu pedido es P-1001
   contenidos paso 1: [ 'tool-call', 'tool-error:No existe x@y.z' ]
3) ToolLoopAgent needsApproval -> pasos: 1 | contenido: [ 'tool-call', 'tool-approval-request' ]
```

Tres conclusiones:

- **Errores de herramienta**: una excepción en `execute` vuelve al modelo como `tool-error` y el bucle sigue. Es el comportamiento de `is_error` sin hacer nada ([[roadmap/20-herramientas/03-errores-e-is-error]]).
- **Aprobación**: con `needsApproval: true`, el paso termina con un `tool-approval-request` en vez de ejecutar. Tu interfaz muestra la petición y, al aprobar, reanudas con la respuesta de aprobación en los mensajes ([[docs/agentes/03-humano-en-el-bucle]]).
- **Parada**: `stopWhen` acepta una condición o una lista (para con la primera que se cumpla): `isStepCount(n)`, `hasToolCall("nombre")` o una función tuya. `stepCountIs` sigue existiendo como alias de `isStepCount`. `ToolLoopAgent` para a los 20 pasos si no dices otra cosa.

### Proveedores y AI Gateway

Si pasas el modelo como objeto de proveedor (`anthropic("claude-sonnet-5-5")`), la llamada va directa a Anthropic con tu `ANTHROPIC_API_KEY`. Si lo pasas **como string** (`model: "anthropic/claude-sonnet-5-5"`), el SDK lo resuelve con `globalThis.AI_SDK_DEFAULT_PROVIDER` y, si no lo has configurado, con el **AI Gateway** de Vercel, que es un servicio de pago. Pasa siempre el objeto del proveedor, salvo que quieras el gateway a propósito.

Para local, el proveedor de Ollama es de la comunidad (`ollama-ai-provider-v2` 4.1.0, Apache-2.0):

```ts title="modelo_local_ai_sdk.ts"
import { generateText, isStepCount } from "ai";
import { ollama } from "ollama-ai-provider-v2";   // proveedor de la comunidad (Apache-2.0)
import { ChatOllama } from "@langchain/ollama";

const MODEL = ollama("qwen3");                    // Ollama en http://localhost:11434
export const llmLangChain = new ChatOllama({ model: "qwen3" });

export async function responder(pregunta: string) {
  const r = await generateText({ model: MODEL, prompt: pregunta, stopWhen: isStepCount(10) });
  return r.text;
}
```

Compila, pero no se ha ejecutado contra un Ollama real. El modelo local tiene que saber llamar herramientas ([[problemas/modelo-local-no-llama-herramientas]]).

## LangChain.js

La misma API que [[docs/frameworks/04-langchain|LangChain en Python]], en camelCase: `createAgent`, `systemPrompt`, `interruptOn`, `allowedDecisions`, y el *payload* de la interrupción con `actionRequests` y `reviewConfigs`. Los nombres en snake_case de Python dan error de tipos, que es una ventaja de TypeScript: el compilador te avisa.

```ts title="agente_langchain_js.ts"
import { Command, MemorySaver } from "@langchain/langgraph";
import { createAgent, humanInTheLoopMiddleware, modelCallLimitMiddleware, tool } from "langchain";
import { z } from "zod";

const MODEL = "anthropic:claude-sonnet-5-5"; // o "ollama:qwen3" con @langchain/ollama

const verPedido = tool(
  async ({ pedidoId }) => JSON.stringify({ id: pedidoId, estado: "entregado", importeEur: 49.9 }),
  {
    name: "ver_pedido",
    description: "Devuelve estado e importe de un pedido por su id (formato P-NNNN).",
    schema: z.object({ pedidoId: z.string().describe("Id del pedido") }),
  },
);

const reembolsar = tool(
  async ({ pedidoId, importeEur }) => `Reembolso de ${importeEur} € emitido para ${pedidoId}.`,
  {
    name: "reembolsar",
    description: "Emite un reembolso. Acción irreversible: solo tras confirmar el pedido.",
    schema: z.object({ pedidoId: z.string(), importeEur: z.number() }),
  },
);

export const agente = createAgent({
  model: MODEL,
  tools: [verPedido, reembolsar],
  systemPrompt: "Eres un agente de soporte. Antes de reembolsar, comprueba el pedido.",
  middleware: [
    humanInTheLoopMiddleware({ interruptOn: { reembolsar: { allowedDecisions: ["approve", "edit", "reject"] } } }),
    modelCallLimitMiddleware({ runLimit: 10 }),
  ],
  checkpointer: new MemorySaver(),
});

export async function main() {
  const config = { configurable: { thread_id: "ticket-123" } };
  const r = await agente.invoke({ messages: [{ role: "user", content: "Devolvedme P-1001, llegó roto." }] }, config);
  if (r.__interrupt__?.length) {
    console.log("Pendiente:", JSON.stringify(r.__interrupt__[0].value));
    const fin = await agente.invoke(new Command({ resume: { decisions: [{ type: "approve" }] } }), config);
    console.log(fin.messages.at(-1)?.content);
  }
}
```

Ejecutado con `FakeToolCallingModel` (el modelo simulado de LangChain.js): el agente se para antes de `reembolsar`, la interrupción trae `actionRequests` con nombre y argumentos, y al reanudar con `{ type: "approve" }` se ejecuta la herramienta. Exporta el mismo [[glosario/middleware|middleware]] que Python: `toolErrorMiddleware`, `summarizationMiddleware`, `piiMiddleware`, `todoListMiddleware`, `anthropicPromptCachingMiddleware`…

## LangGraph.js

El grafo explícito de [[docs/frameworks/05-langgraph|LangGraph]], con la misma semántica: estado con anotaciones y reductores, `ToolNode` y `toolsCondition`, `Send` para el paralelismo, checkpointers (`MemorySaver`, y `@langchain/langgraph-checkpoint-sqlite` o Postgres para disco).

```ts title="grafo_langgraph_js.ts"
import { ChatAnthropic } from "@langchain/anthropic";
import { tool } from "@langchain/core/tools";
import { Annotation, END, MemorySaver, MessagesAnnotation, Send, START, StateGraph } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { z } from "zod";

const MODEL = "claude-sonnet-5-5"; // local: new ChatOllama({ model: "qwen3" }) de @langchain/ollama
const llm = new ChatAnthropic({ model: MODEL, maxTokens: 2048 });

const verPedido = tool(async ({ pedidoId }) => `{"id": "${pedidoId}", "estado": "entregado"}`, {
  name: "ver_pedido",
  description: "Devuelve el estado de un pedido por su id.",
  schema: z.object({ pedidoId: z.string() }),
});
const tools = [verPedido];
const llmConTools = llm.bindTools(tools);

// 1) Bucle agéntico explícito: modelo -> (tools_condition) -> herramientas -> modelo
export const agente = new StateGraph(MessagesAnnotation)
  .addNode("modelo", async (state) => ({ messages: [await llmConTools.invoke(state.messages)] }))
  .addNode("tools", new ToolNode(tools))
  .addEdge(START, "modelo")
  .addConditionalEdges("modelo", toolsCondition, ["tools", END])
  .addEdge("tools", "modelo")
  .compile({ checkpointer: new MemorySaver() });

// 2) Map-reduce: un trabajador por subtarea, en paralelo, y síntesis
const Estado = Annotation.Root({
  subtareas: Annotation<string[]>,
  resultados: Annotation<string[]>({ reducer: (a, b) => a.concat(b), default: () => [] }),
  respuesta: Annotation<string>,
});

export const mapReduce = new StateGraph(Estado)
  .addNode("trabajador", async (s: { subtarea: string }) => {
    const r = await llm.invoke(`Resuelve: ${s.subtarea}`);
    return { resultados: [String(r.content)] };
  })
  .addNode("sintetizar", async (s) => ({ respuesta: (await llm.invoke(s.resultados.join("\n\n"))).text }))
  .addConditionalEdges(START, (s) => s.subtareas.map((t) => new Send("trabajador", { subtarea: t })), ["trabajador"])
  .addEdge("trabajador", "sintetizar")
  .addEdge("sintetizar", END)
  .compile();

export async function main() {
  const r = await agente.invoke(
    { messages: [{ role: "user", content: "¿Cómo va P-1001?" }] },
    { configurable: { thread_id: "1" }, recursionLimit: 25 },
  );
  console.log(r.messages.at(-1)?.content);
  console.log((await mapReduce.invoke({ subtareas: ["Convenio A", "Convenio B"] })).respuesta);
}
```

El reductor de `resultados` (`reducer: (a, b) => a.concat(b)`) es el `Annotated[list, operator.add]` de Python: sin él, los trabajadores en paralelo chocan. `recursionLimit` va en la configuración de cada `invoke`; ponlo siempre. Para un agente de archivos y subagentes en TypeScript, `deepagents` también existe para JavaScript (1.16.2, MIT; ver [[docs/frameworks/10-deep-agents]]).

## Mastra

Mastra es un framework de TypeScript con agentes, workflows, memoria y evals en un solo paquete. Los agentes se declaran con un `id`, instrucciones, un modelo como string `"proveedor/modelo"` y herramientas creadas con `createTool`, que tienen esquema de entrada y también de salida.

```ts title="agente_mastra.ts"
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const verPedidos = createTool({
  id: "ver_pedidos",
  description: "Lista los pedidos de un cliente por su email.",
  inputSchema: z.object({ email: z.string() }),
  outputSchema: z.object({ pedidos: z.array(z.object({ id: z.string(), estado: z.string() })) }),
  execute: async ({ email }) => ({
    pedidos: email === "ana@example.com" ? [{ id: "P-1001", estado: "enviado" }] : [],
  }),
});

const MODEL = "anthropic/claude-sonnet-5-5"; // "proveedor/modelo": lo resuelve el router de Mastra

export const agente = new Agent({
  id: "soporte",
  name: "Soporte",
  instructions: "Eres el soporte de una tienda. Usa las herramientas; no inventes datos.",
  model: MODEL,
  tools: { verPedidos },
});

export async function main() {
  const r = await agente.generate("Soy ana@example.com, ¿dónde está mi pedido?", { maxSteps: 10 });
  console.log(r.text);
}
```

Dos cosas que comprobar antes de producción. Los modelos como string los resuelve su router de pasarelas (models.dev, Mastra, Netlify, Azure); qué ruta sigue exactamente `anthropic/…` no está confirmado en esta página, así que revísalo en su documentación. Y la licencia: `@mastra/core` es Apache-2.0, pero el código bajo carpetas `ee/` (por ejemplo `@mastra/core/auth/ee`) tiene una licencia empresarial; si lo importas, ya no es open source.

## OpenAI Agents JS

El [[docs/frameworks/06-openai-agents-sdk|OpenAI Agents SDK]] en TypeScript. Con Claude se usa a través del adaptador del AI SDK: `aisdk(anthropic("…"))` de `@openai/agents-extensions/ai-sdk`.

```ts title="agentes_openai_js.ts"
import { anthropic } from "@ai-sdk/anthropic";
import { Agent, run, setTracingDisabled, tool } from "@openai/agents";
import { aisdk } from "@openai/agents-extensions/ai-sdk";
import { z } from "zod";

setTracingDisabled(true); // por defecto las trazas se exportan a OpenAI

const MODEL = "claude-sonnet-5-5";
const model = aisdk(anthropic(MODEL));

const verPedidos = tool({
  name: "ver_pedidos",
  description: "Lista los pedidos de un cliente por su email.",
  parameters: z.object({ email: z.string() }),
  execute: async ({ email }) => (email === "ana@example.com" ? '[{"id":"P-1001","estado":"enviado"}]' : "Sin pedidos."),
});

const devoluciones = new Agent({
  name: "Devoluciones",
  handoffDescription: "Especialista en devoluciones y reembolsos.",
  instructions: "Gestiona devoluciones.",
  model,
});

export const triaje = new Agent({
  name: "Soporte",
  instructions: "Eres el soporte de una tienda. Para devoluciones, pasa al especialista.",
  tools: [verPedidos],
  handoffs: [devoluciones],
  model,
});

export async function main() {
  const r = await run(triaje, "Soy ana@example.com, ¿dónde está mi pedido?", { maxTurns: 10 });
  console.log(r.finalOutput, r.lastAgent?.name);
}
```

Igual que en Python, las trazas se exportan por defecto a la plataforma de OpenAI: `setTracingDisabled(true)` o tu propio procesador. Las herramientas usan `parameters` (no `inputSchema`) y el tope de turnos se pasa en `run(..., { maxTurns })`.

## Claude Agent SDK en TypeScript

El harness de Claude Code como librería, con las opciones en camelCase (`systemPrompt`, `allowedTools`, `permissionMode`, `mcpServers`, `canUseTool`, `settingSources`, `maxTurns`, `maxBudgetUsd`). Herramientas propias con `tool(nombre, descripción, esquemaZod, handler)` y `createSdkMcpServer({ name, version, tools })`. El ejemplo completo, en pestaña junto al de Python, está en [[docs/frameworks/03-claude-agent-sdk]]. Diferencias con Python que conviene saber: TypeScript expone todos los eventos de hook de Claude Code (`HOOK_EVENTS`) y la lista `BUILTIN_TOOL_NAMES`; la «V2 session API» de TypeScript está retirada. Requiere Node 18.14 o superior y solo funciona con modelos Claude.

## Cuál elegir

| Situación | Elige |
|---|---|
| Producto web con streaming a la interfaz | **AI SDK** |
| Paridad con un backend en Python que ya usa LangChain | **LangChain.js** / **LangGraph.js** |
| Flujos con pasos fijos, pausas largas y reanudación | **LangGraph.js** |
| Un framework con todo integrado (agentes, workflows, memoria) | **Mastra**, vigilando las carpetas `ee/` |
| Triaje con handoffs | **OpenAI Agents JS** |
| Un agente que trabaja con archivos y terminal, solo con Claude | **Claude Agent SDK** |

El árbol completo, con Python incluido, está en [[docs/frameworks/01-elegir-framework]].

## Errores frecuentes

- **`generateText` sin `stopWhen`**: una sola llamada y texto vacío si el modelo pidió una herramienta.
- **El modelo como string en el AI SDK** sin saber que pasa por el gateway.
- **`system_prompt` en LangChain.js**: es `systemPrompt`.
- **Tracing por defecto** en OpenAI Agents JS.
- **Importar de `ee/` en Mastra** sin revisar la licencia.
- **No fijar `maxOutputTokens` / `maxTokens`**: el tope de gasto por llamada ([[glosario/max-tokens]]).

## Ver también

- [[docs/frameworks/02-equivalencias]]: los nombres de cada concepto, framework a framework.
- [[recetas/probar-agentes-sin-api]]: `MockLanguageModelV4` y compañía.
- [[herramientas/vercel-ai-sdk]], [[herramientas/mastra]], [[herramientas/langchain]] y [[herramientas/openai-agents-sdk]]: fichas del directorio.
