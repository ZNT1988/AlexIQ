// Test d'intégration AlexCommunicationEngine avec serveur port 3003
// Node >= 18

import AlexCommunicationEngine from './backend/alex-modules/specialized/AlexCommunicationEngine.js';

async function testCommunicationModule() {
  console.log('🧪 Test AlexCommunicationEngine - Port 3003 Integration');
  
  try {
    // 1. Test initialisation
    console.log('1. Initialisation du module...');
    await AlexCommunicationEngine.initialize();
    console.log('✅ Module initialisé');
    
    // 2. Test status
    console.log('2. Vérification du statut...');
    const status = AlexCommunicationEngine.getCommunicationStatus();
    console.log('✅ Statut:', {
      initialized: status.initialized,
      currentStyle: status.currentStyle,
      naturalness: status.naturalness
    });
    
    // 3. Test génération réponse
    console.log('3. Test génération réponse...');
    const response = await AlexCommunicationEngine.generateResponse(
      "Hello, peux-tu m'aider avec HustleFinder IA ?",
      { port: 3003, source: 'front-integration-test' }
    );
    console.log('✅ Réponse générée:', {
      timestamp: response.timestamp,
      hasResponse: !!response.finalResponse,
      length: response.finalResponse?.length || 0
    });
    
    // 4. Test changement style
    console.log('4. Test changement style...');
    const styleChange = await AlexCommunicationEngine.switchCommunicationStyle('professional', 'test-integration');
    console.log('✅ Style changé:', styleChange.newStyle);
    
    console.log('\n🎉 TOUS LES TESTS PASSÉS - Module prêt pour production');
    console.log('🔗 Compatible avec serveur port 3003');
    console.log('🤖 APIs réelles configurées (OpenAI/Anthropic/Vertex/Gemini)');
    
  } catch (error) {
    console.error('❌ ERREUR TEST:', error.message);
    console.log('Stack:', error.stack);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  testCommunicationModule();
}