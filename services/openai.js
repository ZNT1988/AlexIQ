import fetch from "node-fetch";
import { OPENAI_KEY } from "../config.js";

export async function callOpenAI(prompt) {
  if (!OPENAI_KEY) {
    return "Clé OpenAI manquante - mode développement";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Pas de réponse OpenAI";
  } catch (error) {
    console.error("❌ Erreur OpenAI:", error.message);
    return "Erreur OpenAI - " + error.message;
  }
}