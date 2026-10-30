// Agente mínimo con Claude Agent SDK (TypeScript, @anthropic-ai/claude-agent-sdk 0.3.312)
import { query, tool, createSdkMcpServer, type HookCallback } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const MODEL = "claude-sonnet-5-5";

const contarPalabras = tool(
  "contar_palabras",
  "Cuenta las palabras de un texto",
  { texto: z.string() },
  async ({ texto }) => ({ content: [{ type: "text", text: String(texto.split(/\s+/).filter(Boolean).length) }] }),
);

const utilidades = createSdkMcpServer({ name: "utilidades", version: "1.0.0", tools: [contarPalabras] });

const bloquearRm: HookCallback = async (input) => {
  if (input.hook_event_name === "PreToolUse") {
    const cmd = String((input.tool_input as { command?: string }).command ?? "");
    if (cmd.includes("rm -rf")) {
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: "rm -rf no está permitido",
        },
      };
    }
  }
  return {};
};

for await (const mensaje of query({
  prompt: "Cuenta las palabras de README.md",
  options: {
    model: MODEL,
    systemPrompt: { type: "preset", preset: "claude_code", append: "Responde en español." },
    settingSources: ["project"],
    allowedTools: ["Read", "Grep", "Glob", "mcp__utilidades__contar_palabras"],
    permissionMode: "default",
    mcpServers: { utilidades },
    hooks: { PreToolUse: [{ matcher: "Bash", hooks: [bloquearRm] }] },
    canUseTool: async (nombre, entrada) =>
      nombre === "Write" && String(entrada.file_path ?? "").endsWith(".env")
        ? { behavior: "deny", message: "No se escriben secretos" }
        : { behavior: "allow", updatedInput: entrada },
    agents: {
      revisor: {
        description: "Revisa código en busca de errores; úsalo tras cambios.",
        prompt: "Eres un revisor de código estricto. Señala solo problemas reales.",
        tools: ["Read", "Grep", "Glob"],
        model: "haiku",
      },
    },
    maxTurns: 20,
    effort: "medium",
  },
})) {
  if (mensaje.type === "assistant") {
    for (const b of mensaje.message.content) if (b.type === "text") console.log(b.text);
  } else if (mensaje.type === "result") {
    console.log("coste USD:", mensaje.total_cost_usd, "sesión:", mensaje.session_id);
  }
}
