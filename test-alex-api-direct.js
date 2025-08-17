// Test direct d'Alex avec nos services API
import "dotenv/config";
import { AIClient } from "./backend/core/providers/AIClient.js";

console.log("🔥 Test direct d'Alex avec vraies APIs");
console.log("=====================================");

async function testAlexWithRealAPIs() {
  const client = new AIClient();
  
  const testMessage = "Bonjour ! Peux-tu me parler de tes capacités en intelligence artificielle ?";
  
  console.log(`📝 Message: "${testMessage}"`);
  console.log("\n🚀 Test avec nos services réels...\n");

  // Test OpenAI
  console.log("1️⃣ Test OpenAI:");
  const openaiResult = await client.query(testMessage, "openai");
  console.log("✅ Réponse:", openaiResult.content.substring(0, 150) + "...");
  console.log("📊 Succès:", openaiResult.success);

  // Test Anthropic  
  console.log("\n2️⃣ Test Anthropic:");
  const anthropicResult = await client.query(testMessage, "anthropic");
  console.log("✅ Réponse:", anthropicResult.content.substring(0, 150) + "...");
  console.log("📊 Succès:", anthropicResult.success);

  // Test Google
  console.log("\n3️⃣ Test Google:");
  const googleResult = await client.query(testMessage, "google");
  console.log("✅ Réponse:", googleResult.content.substring(0, 150) + "...");
  console.log("📊 Succès:", googleResult.success);

  // Test Multi
  console.log("\n🔄 Test Multi-API:");
  const multiResults = await client.queryMultiple(testMessage);
  multiResults.forEach(result => {
    console.log(`${result.provider}: ${result.success ? "✅" : "❌"} ${result.content?.substring(0, 80) || result.error}...`);
  });
}

testAlexWithRealAPIs().catch(console.error);