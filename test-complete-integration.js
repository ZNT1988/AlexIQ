// Test intégration complète avec les 3 APIs
import "dotenv/config";
import { AIClient } from "./backend/core/providers/AIClient.js";

console.log("🎯 Test intégration complète Alex avec 3 APIs");
console.log("============================================");

async function testCompleteIntegration() {
  const client = new AIClient();
  
  const testPrompt = "Donne-moi 2 idées de features pour AlexIQ";
  
  console.log(`📝 Prompt: "${testPrompt}"`);
  console.log("\n🚀 Test multi-API...\n");

  // Test avec queryMultiple pour avoir les 3 réponses
  const results = await client.queryMultiple(testPrompt);
  
  results.forEach((result, index) => {
    const emoji = ["🤖", "🧠", "🌐"][index];
    const provider = result.provider.toUpperCase();
    
    console.log(`${emoji} ${provider}:`);
    console.log(`   ✅ Succès: ${result.success}`);
    if (result.success) {
      console.log(`   📜 Réponse: ${result.content.substring(0, 120)}...`);
    } else {
      console.log(`   ❌ Erreur: ${result.error || result.content}`);
    }
    console.log("");
  });

  // Résumé
  const successful = results.filter(r => r.success).length;
  console.log(`🎯 RÉSUMÉ: ${successful}/3 APIs fonctionnelles`);
  
  return {
    total: results.length,
    successful: successful,
    results: results
  };
}

testCompleteIntegration().catch(console.error);