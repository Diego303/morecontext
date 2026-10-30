import Anthropic from "@anthropic-ai/sdk";
const MODEL = "claude-sonnet-5-5";
const client = new Anthropic({ apiKey: "x" });
async function main() {
  const r = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    messages: [{ role: "user", content: "Hola" }],
  });
  console.log(r.stop_reason, r.usage.cache_read_input_tokens);
  const n = await client.messages.countTokens({ model: MODEL, messages: [{ role: "user", content: "Hola" }] });
  console.log(n.input_tokens);
}
void main;
