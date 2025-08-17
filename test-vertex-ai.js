// Test Vertex AI Gemini
import "dotenv/config";
import { callGemini } from "./services/google-vertex.js";

console.log("🧪 Test Google Vertex AI / Gemini");
console.log("================================");

console.log("Project ID:", process.env.GOOGLE_PROJECT_ID);
console.log("Location:", process.env.GOOGLE_LOCATION);
console.log("Model:", process.env.GOOGLE_VERTEX_MODEL);
console.log("Credentials configured:", !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

async function testVertexAI() {
  const testMessage = "Bonjour ! Peux-tu me dire en une phrase ce qu'est Gemini ?";
  
  console.log(`\n📝 Message test: "${testMessage}"`);
  console.log("\n🔄 Test Vertex AI...\n");

  const result = await callGemini(testMessage);
  console.log("✅ Réponse Gemini:", result);
}

testVertexAI().catch(console.error);