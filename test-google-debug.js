// Debug Google API
import "dotenv/config";
import fetch from "node-fetch";

const GOOGLE_KEY = process.env.GOOGLE_API_KEY;

console.log("🔍 Debug Google Gemini API");
console.log("Key present:", !!GOOGLE_KEY);
console.log("Key:", GOOGLE_KEY);

async function debugGoogleAPI() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_KEY}`;
  
  console.log("URL:", url);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Bonjour, peux-tu répondre à ce message ?" }] }]
      })
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    
    const data = await response.json();
    console.log("Response data:", JSON.stringify(data, null, 2));
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Pas de réponse Google";
  } catch (error) {
    console.error("❌ Erreur Google:", error.message);
    return "Erreur Gemini - " + error.message;
  }
}

debugGoogleAPI();