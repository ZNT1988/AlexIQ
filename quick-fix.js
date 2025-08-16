// Solution rapide : ajouter la méthode directement à l'instance
import AlexInfiniteCreator from './backend/alex-modules/consciousness/AlexInfiniteCreator.js';

console.log('🔧 Ajout de generateIdeas à l\'instance');

// Ajouter la méthode directement à l'instance
AlexInfiniteCreator.generateIdeas = async function(prompt, options = {}) {
  try {
    const domain = options.domain || 'general';
    const quantity = options.quantity || 3;
    const creativity = options.creativity || 0.7;
    
    // Génération d'idées simples
    const ideas = [];
    for (let i = 0; i < quantity; i++) {
      ideas.push({
        title: `Idée ${i + 1}`,
        description: `Idée créative pour "${prompt}" dans le domaine ${domain}`,
        domain: domain,
        creativity_score: creativity
      });
    }
    
    return {
      ideas: ideas,
      total: quantity,
      domain: domain,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      ideas: [{
        title: "Idée par défaut", 
        description: "Améliorer l'expérience utilisateur avec l'IA",
        domain: "business",
        creativity_score: 0.5
      }],
      total: 1,
      domain: "business",
      error: error.message
    };
  }
};

console.log('✅ generateIdeas ajouté');
console.log('Method exists now:', typeof AlexInfiniteCreator.generateIdeas);

// Test
const test = await AlexInfiniteCreator.generateIdeas("Test", { quantity: 1 });
console.log('Test result:', test);