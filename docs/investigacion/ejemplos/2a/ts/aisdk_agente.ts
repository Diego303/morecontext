// Vercel AI SDK v7 · el bucle de herramientas con generateText + stopWhen, y la clase ToolLoopAgent.
// npm i ai @ai-sdk/anthropic zod
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
