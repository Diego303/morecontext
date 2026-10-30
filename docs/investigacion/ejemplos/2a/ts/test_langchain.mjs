// createAgent + humanInTheLoopMiddleware + MemorySaver con FakeToolCallingModel (sin API).
import { Command, MemorySaver } from "@langchain/langgraph";
import { createAgent, FakeToolCallingModel, humanInTheLoopMiddleware, tool } from "langchain";
import { z } from "zod";

const reembolsar = tool(async ({ pedidoId }) => `Reembolso emitido para ${pedidoId}`, {
  name: "reembolsar", description: "Reembolsa", schema: z.object({ pedidoId: z.string() }),
});
const model = new FakeToolCallingModel({ toolCalls: [[{ name: "reembolsar", args: { pedidoId: "P-1001" }, id: "c1" }], []] });
const agente = createAgent({
  model, tools: [reembolsar],
  middleware: [humanInTheLoopMiddleware({ interruptOn: { reembolsar: { allowedDecisions: ["approve", "reject"] } } })],
  checkpointer: new MemorySaver(),
});
const config = { configurable: { thread_id: "t1" } };
const r = await agente.invoke({ messages: [{ role: "user", content: "Devuélveme P-1001" }] }, config);
console.log("interrupt:", JSON.stringify(r.__interrupt__?.[0]?.value).slice(0, 200));
const fin = await agente.invoke(new Command({ resume: { decisions: [{ type: "approve" }] } }), config);
console.log("tool msgs:", fin.messages.filter((m) => m.type === "tool").map((m) => m.content));
