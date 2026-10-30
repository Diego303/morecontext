// LangChain.js 1.x · createAgent con herramientas, límite de llamadas y aprobación humana.
// npm i langchain @langchain/core @langchain/anthropic @langchain/langgraph zod
import { MemorySaver } from "@langchain/langgraph";
import { Command } from "@langchain/langgraph";
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
