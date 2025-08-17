// Debug Anthropic API
import "dotenv/config";
import fetch from "node-fetch";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

console.log("🔍 Debug Anthropic API");
console.log("Key present:", !!ANTHROPIC_KEY);
console.log("Key starts with:", ANTHROPIC_KEY?.substring(0, 15) + "...");

async function debugAnthropicAPI() {
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
        messages: [{ role: "user", content: "Bonjour, peux-tu répondre à ce message ?" }]
      })
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    
    const data = await response.json();
    console.log("Response data:", JSON.stringify(data, null, 2));
    
    return data.content?.[0]?.text || "Pas de réponse Claude";
  } catch (error) {
    console.error("❌ Erreur Anthropic:", error.message);
    return "Erreur Claude - " + error.message;
  }
}

debugAnthropicAPI();