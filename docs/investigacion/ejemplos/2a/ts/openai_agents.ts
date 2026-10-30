// OpenAI Agents SDK (JS) con Claude vía el adaptador del AI SDK.
// npm i @openai/agents @openai/agents-extensions @ai-sdk/anthropic zod
import { anthropic } from "@ai-sdk/anthropic";
import { Agent, run, setTracingDisabled, tool } from "@openai/agents";
import { aisdk } from "@openai/agents-extensions/ai-sdk";
import { z } from "zod";

setTracingDisabled(true); // por defecto las trazas se exportan a OpenAI

const model = aisdk(anthropic("claude-sonnet-5-5"));

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
