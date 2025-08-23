// backend/services/anthropic.js
import fetch from "node-fetch";
import { AI_KEYS } from "../config/aiKeys.js";

export async function callAnthropic(prompt) {
  const r = await fetch(API_URL_1, {
    method: "POST",
    headers: {
      "x-api-key": AI_KEYS.ANTHROPIC,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 600,
      messages: [{ role: "user", content: String(prompt ?? "") }]
    })
  });
  const j = await r.json();
  return j?.content?.[0]?.text ?? "";
}