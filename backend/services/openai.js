import { openai } from "../lib/aiClients.js";

export async function chatOpenAI(messages, model = "gpt-4o-mini", options = {}) {
  if (!openai) throw new Error("openai_not_configured");
  const r = await openai.chat.completions.create({ model, messages, ...options });
  return r.choices?.[0]?.message?.content ?? "";
}

export default { chatOpenAI };