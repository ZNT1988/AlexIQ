// backend/AlexHyperIntelligence.js
import { callOpenAI } from "./services/openai.js";
import { callAnthropic } from "./services/anthropic.js";
import { callGemini } from "./services/google.js";

export async function AlexHyperIntelligence(prompt) {
  const [oai, claude, gemini] = await Promise.all([
    callOpenAI(prompt),
    callAnthropic(prompt),
    callGemini(prompt)
  ]);

  return {
    openai: oai,
    anthropic: claude,
    google: gemini
  };
}