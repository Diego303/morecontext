// Ejecuta el bucle de generateText/ToolLoopAgent con MockLanguageModelV4 (sin API).
import { generateText, isStepCount, tool, ToolLoopAgent } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { z } from "zod";

const usage = { inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 }, outputTokens: { total: 5, text: 5, reasoning: 0 } };
const fin = (unified) => ({ unified, raw: unified });
function guion(...pasos) {
  let i = 0;
  return new MockLanguageModelV4({ doGenerate: async () => ({ content: pasos[i++], finishReason: fin(pasos[i - 1].some((c) => c.type === "tool-call") ? "tool-calls" : "stop"), usage, warnings: [] }) });
}
const call = (name, input, id) => ({ type: "tool-call", toolCallId: id, toolName: name, input: JSON.stringify(input) });
const verPedidos = tool({
  description: "Lista pedidos", inputSchema: z.object({ email: z.string() }),
  execute: async ({ email }) => { if (email !== "ana@example.com") throw new Error("No existe " + email); return [{ id: "P-1001" }]; },
});
const reembolsar = tool({ description: "Reembolsa", inputSchema: z.object({ pedidoId: z.string() }), needsApproval: true, execute: async () => "ok" });

// 1) sin stopWhen: una sola llamada aunque pida herramienta
let r = await generateText({ model: guion([call("ver_pedidos", { email: "ana@example.com" }, "a")], [{ type: "text", text: "fin" }]), prompt: "x", tools: { ver_pedidos: verPedidos } });
console.log("1) sin stopWhen -> pasos:", r.steps.length, "| finishReason:", r.finishReason, "| text:", JSON.stringify(r.text));
// 2) con stopWhen: bucle; error de herramienta vuelve al modelo
r = await generateText({ model: guion([call("ver_pedidos", { email: "x@y.z" }, "a")], [call("ver_pedidos", { email: "ana@example.com" }, "b")], [{ type: "text", text: "Tu pedido es P-1001" }]), prompt: "x", tools: { ver_pedidos: verPedidos }, stopWhen: isStepCount(5) });
console.log("2) con stopWhen -> pasos:", r.steps.length, "| text:", r.text);
console.log("   contenidos paso 1:", r.steps[0].content.map((c) => c.type + (c.error ? ":" + c.error.message : "")));
// 3) ToolLoopAgent + needsApproval
const ag = new ToolLoopAgent({ model: guion([call("reembolsar", { pedidoId: "P-1001" }, "r")], [{ type: "text", text: "hecho" }]), tools: { reembolsar } });
r = await ag.generate({ prompt: "reembolsa" });
console.log("3) ToolLoopAgent needsApproval -> pasos:", r.steps.length, "| contenido:", r.steps.at(-1).content.map((c) => c.type));
