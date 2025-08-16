import fetch from "node-fetch";
import { ANTHROPIC_KEY } from "../config.js";

export async function callAnthropic(prompt) {
  if (!ANTHROPIC_KEY) {
    return "Clé Anthropic manquante - mode développement";
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    return data.content?.[0]?.text || "Pas de réponse Claude";
  } catch (error) {
    console.error("❌ Erreur Anthropic:", error.message);
    return "Erreur Claude - " + error.message;
  }
}