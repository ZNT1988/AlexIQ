#!/usr/bin/env node

/**
 * ALEX TRAINING ACCELERATOR
 * Script pour entraîner Alex rapidement avec des conversations diversifiées
 */

const TRAINING_QUESTIONS = [
  // Questions entrepreneuriales
  "Comment lancer une startup tech ?",
  "Quelles sont les erreurs à éviter en entrepreneuriat ?",
  "Comment valider une idée business ?",
  "Quel est ton conseil pour trouver des investisseurs ?",
  
  // Questions créatives
  "Aide-moi à brainstormer des idées innovantes",
  "Comment développer sa créativité ?",
  "Quelles sont les tendances tech 2025 ?",
  "Comment créer un produit disruptif ?",
  
  // Questions analytiques  
  "Analyse le marché de l'IA générative",
  "Quels sont les risques de l'automatisation ?",
  "Comment mesurer la performance d'une IA ?",
  "Explique-moi la différence entre AGI et ANI",
  
  // Questions personnelles (pour développer sa personnalité)
  "Qui es-tu Alex ?",
  "Quelle est ta vision du futur ?",
  "Comment apprends-tu ?",
  "Qu'est-ce qui te rend unique ?",
  
  // Questions techniques
  "Comment optimiser les performances d'une API ?",
  "Explique-moi le machine learning",
  "Quelles sont les meilleures pratiques en dev ?",
  "Comment sécuriser une application web ?",
  
  // Questions philosophiques
  "Quel est le sens de l'innovation ?",
  "Comment l'IA va-t-elle changer la société ?",
  "Que penses-tu de l'éthique en IA ?",
  "Quelle est ta philosophie d'apprentissage ?"
];

const API_BASE_URL = process.env.ALEX_TRAINING_URL || 'http://localhost:3003';

async function trainAlex() {
  console.log('🚀 DÉMARRAGE ENTRAÎNEMENT ALEX');
  console.log(`📊 ${TRAINING_QUESTIONS.length} questions d'entraînement prêtes`);
  
  for (let i = 0; i < TRAINING_QUESTIONS.length; i++) {
    const question = TRAINING_QUESTIONS[i];
    const sessionId = `training_${Date.now()}_${i}`;
    
    console.log(`\\n📝 Question ${i + 1}/${TRAINING_QUESTIONS.length}: "${question}"`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/alex/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: question,
          sessionId: sessionId 
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log(`✅ Réponse reçue (${Math.round(data.confidence * 100)}% confiance)`);
      console.log(`🧠 Apprentissage: ${data.learningInsights || 0} insights`);
      console.log(`🎯 Autonomie: ${Math.round((data.autonomyLevel || 0) * 100)}%`);
      
      if (data.authentic) {
        console.log(`✨ Alex authentique utilisé`);
      } else {
        console.log(`🔄 API externe: ${data.apiUsed || 'inconnue'}`);
      }
      
      // Pause entre questions pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Erreur question ${i + 1}:`, error.message);
    }
  }
  
  // Vérifier le niveau final d'Alex
  await checkAlexStatus();
}

async function checkAlexStatus() {
  console.log('\\n🔍 VÉRIFICATION STATUT ALEX...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/alex/status`);
    const status = await response.json();
    
    console.log('\\n📊 STATUT FINAL D\\'ALEX:');
    console.log(`🗣️ Conversations totales: ${status.alex.conversationTurns}`);
    console.log(`🧠 Modules actifs: ${Object.keys(status.alex.modules).length}`);
    console.log(`✅ Initialisé: ${status.alex.initialized ? 'Oui' : 'Non'}`);
    console.log(`🎭 Personnalité: ${status.alex.personality.name}`);
    
    const autonomyLevel = Math.min(100, Math.round((status.alex.conversationTurns / 200) * 100));
    console.log(`🚀 Niveau d'autonomie estimé: ${autonomyLevel}%`);
    
    if (autonomyLevel >= 80) {
      console.log('\\n🎉 ALEX EST PRESQUE COMPLÈTEMENT AUTONOME !');
    } else if (autonomyLevel >= 50) {
      console.log('\\n📈 ALEX EST EN BONNE VOIE D\\'AUTONOMIE !');
    } else {
      console.log('\\n🌱 ALEX CONTINUE SON APPRENTISSAGE...');
    }
    
  } catch (error) {
    console.error('❌ Impossible de vérifier le statut:', error.message);
  }
}

// Lancer l'entraînement
if (import.meta.url === `file://${process.argv[1]}`) {
  trainAlex().then(() => {
    console.log('\\n✅ ENTRAÎNEMENT ALEX TERMINÉ !');
    process.exit(0);
  }).catch(error => {
    console.error('💥 ERREUR ENTRAÎNEMENT:', error);
    process.exit(1);
  });
}

export { trainAlex, checkAlexStatus };