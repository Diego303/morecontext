// LangGraph.js 1.x · bucle agéntico como grafo + map-reduce con Send.
// npm i @langchain/langgraph @langchain/core @langchain/anthropic zod
import { ChatAnthropic } from "@langchain/anthropic";
import { tool } from "@langchain/core/tools";
import { Annotation, END, MemorySaver, MessagesAnnotation, Send, START, StateGraph } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { z } from "zod";

const llm = new ChatAnthropic({ model: "claude-sonnet-5-5", maxTokens: 2048 });

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
