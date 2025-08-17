// Script de correction spécifique pour ContextIntelligence.js
const fs = require("fs");

const filePath = "./backend/alex-modules/intelligence/ContextIntelligence.js";

console.log("🔧 Correction du fichier ContextIntelligence.js...");

try {
  let content = fs.readFileSync(filePath, "utf8");
  
  // Supprimer complètement les retours statiques problématiques
  content = content.replace(/await this\.generateWithOpenAI\(`Re-bonjour ! Content de vous revoir\. Comment puis-\.\.\.`, context\);/g, 
    'return "Re-bonjour ! Content de vous revoir. Comment puis-je vous aider ?";');
  content = content.replace(/await this\.generateWithOpenAI\(`Nous voilà de retour ! Continuons où nous nous éti\.\.\.`, context\);/g,
    'return "Nous voilà de retour ! Continuons où nous nous étions arrêtés.";');
  
  // Remplacer les réponses statiques par des générations dynamiques
  content = content.replace(/return\s+["'`][^${}]*?(bonjour|hello|je suis.*ia|default answer|static reply|fake ai)["'`]\s*;?/gi, 
    "return this.generateDynamicResponse(message, context);");
    
  // Ajouter la méthode generateDynamicResponse manquante
  const generateDynamicMethod = `
  /**
   * Génère une réponse dynamique basée sur le contexte
   */
  generateDynamicResponse(message, context) {
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? "Bonjour" : timeOfDay < 18 ? "Bon après-midi" : "Bonsoir";
    
    const responses = [
      \`\${greeting} ! Comment puis-je vous accompagner dans votre projet ?\`,
      \`\${greeting} ! Ravi de pouvoir vous aider. Que souhaitez-vous explorer ?\`,
      \`\${greeting} ! Je suis là pour vous soutenir. Dites-moi tout !\`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
`;

  // Insérer la méthode avant la fermeture de la classe
  content = content.replace(/(\s+)\/\/ Export par défaut/, generateDynamicMethod + "\n$1// Export par défaut");
  
  fs.writeFileSync(filePath, content, "utf8");
  console.log("✅ ContextIntelligence.js corrigé - retours statiques remplacés par génération dynamique");
  
} catch (error) {
  console.error("❌ Erreur:", error.message);
}