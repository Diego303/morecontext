// Mastra · agente con una herramienta. El modelo se indica como "proveedor/modelo".
// npm i @mastra/core zod
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

export const agente = new Agent({
  id: "soporte",
  name: "Soporte",
  instructions: "Eres el soporte de una tienda. Usa las herramientas; no inventes datos.",
  model: "anthropic/claude-sonnet-5-5",
  tools: { verPedidos },
});

export async function main() {
  const r = await agente.generate("Soy ana@example.com, ¿dónde está mi pedido?", { maxSteps: 10 });
  console.log(r.text);
}
