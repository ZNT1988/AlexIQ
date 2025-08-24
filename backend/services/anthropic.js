import { anthropic } from "../lib/aiClients.js";

export async function chatAnthropic(messages, model = "claude-3.5-sonnet-20240620", system = "", options = {}) {
  if (!anthropic) throw new Error("anthropic_not_configured");
  const r = await anthropic.messages.create({
    model, system, max_tokens: options.max_tokens ?? 1024, messages
  });
  return r.content?.[0]?.text ?? "";
}

export default { chatAnthropic };