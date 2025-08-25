#!/usr/bin/env node
/**
 * 🧠 ALEX QUICK LEARNING TEST
 * Test rapide des capacités d'Alex
 */

const API_BASE = 'https://api.alexiq.site';

const questions = [
  "Qui est ton créateur ?",
  "Parle-moi de Zakaria Housni",
  "Que peux-tu faire ?",
  "Comment créer une startup ?",
  "Explique-moi l'intelligence artificielle"
];

async function askAlex(question, index) {
  try {
    console.log(`\n${index + 1}. ❓ "${question}"`);
    
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        useAlex: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ [${data.provider}] ${data.output}`);
    
    if (data.output && data.output.toLowerCase().includes('zakaria')) {
      console.log('👑 ✨ EXCELLENT - Reconnaît le créateur !');
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    return null;
  }
}

async function runQuickTest() {
  console.log('🧠 ALEX QUICK LEARNING TEST');
  console.log(`🌐 API: ${API_BASE}`);
  console.log('==========================================\n');

  // Test de connectivité
  try {
    const health = await fetch(`${API_BASE}/api/health`);
    if (health.ok) {
      const healthData = await health.json();
      console.log(`✅ Alex connecté - Providers: ${Object.keys(healthData.providers).filter(k => healthData.providers[k]).join(', ')}\n`);
    }
  } catch (e) {
    console.error('❌ Alex non disponible:', e.message);
    return;
  }

  // Poser les questions
  for (let i = 0; i < questions.length; i++) {
    await askAlex(questions[i], i);
    if (i < questions.length - 1) {
      console.log('\n⏳ Attente 3 secondes...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n🎉 Test terminé !');
}

runQuickTest().catch(console.error);