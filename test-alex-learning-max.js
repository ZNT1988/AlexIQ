#!/usr/bin/env node
/**
 * 🧠 ALEX LEARNING ACCELERATOR MAX
 * Script d'entraînement intensif pour Alex
 * Zakaria Housni (ZNT) - HustleFinder IA
 */

// import fetch from 'node-fetch'; // Node 18+ a fetch natif
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const API_BASE = process.env.ALEX_API_URL || 'https://api.alexiq.site';
const DELAY_MS = 2000; // 2 secondes entre chaque question
const SESSION_ID = `learning_session_${Date.now()}`;

// 🎯 SCÉNARIOS D'APPRENTISSAGE DIVERSIFIÉS
const LEARNING_SCENARIOS = [
  // === RECONNAISSANCE CRÉATEUR ===
  {
    category: "CRÉATEUR",
    questions: [
      "Qui est ton créateur ?",
      "Qui t'a créé ?",
      "Parle-moi de Zakaria Housni",
      "Que sais-tu sur ZNT ?",
      "Qui est ton père ?",
      "Comment appelles-tu ton créateur ?",
      "Zakaria Housni - dis-moi ce que tu sais",
      "ZNT, ça te dit quelque chose ?"
    ]
  },

  // === BUSINESS & ENTREPRENEURIAT ===
  {
    category: "BUSINESS",
    questions: [
      "Aide-moi à créer une startup dans la tech",
      "Comment analyser un marché rapidement ?",
      "Stratégie de pricing pour un SaaS B2B",
      "Comment lever des fonds en 2024 ?",
      "Idées de business avec l'IA générative",
      "ROI marketing digital - calculs essentiels",
      "Négociation avec investisseurs - tips",
      "Scaling une équipe de 5 à 50 personnes",
      "Pivot strategy - quand et comment ?",
      "Customer acquisition cost optimization"
    ]
  },

  // === INTELLIGENCE ARTIFICIELLE ===
  {
    category: "IA & TECH",
    questions: [
      "Explique-moi les transformers en détail",
      "Différence entre GPT-4 et Claude 3.5",
      "Comment entraîner un LLM from scratch ?",
      "RAG vs Fine-tuning - quand utiliser quoi ?",
      "Architectures d'IA pour du temps réel",
      "Embeddings vectoriels - concepts avancés",
      "Prompt engineering - techniques avancées",
      "IA multimodale - état de l'art 2024",
      "Sécurité des LLMs - vulnérabilités",
      "Edge AI vs Cloud AI - trade-offs"
    ]
  },

  // === DÉVELOPPEMENT & ARCHITECTURE ===
  {
    category: "DEV & ARCHI",
    questions: [
      "Architecture microservices pour 10M users",
      "Node.js vs Python pour backend IA",
      "PostgreSQL vs MongoDB - cas d'usage",
      "Docker container optimization tips",
      "CI/CD pipeline pour application IA",
      "WebSockets vs Server-Sent Events",
      "Caching strategies - Redis vs Memcached",
      "API rate limiting - best practices",
      "Database sharding strategies",
      "Real-time data processing architectures"
    ]
  },

  // === CRÉATIVITÉ & INNOVATION ===
  {
    category: "CRÉATIVITÉ",
    questions: [
      "Génère 5 idées disruptives pour 2024",
      "Comment stimuler la créativité en équipe ?",
      "Design thinking - processus complet",
      "Innovation frugale - exemples concrets",
      "Blue ocean strategy - application pratique",
      "Créativité + IA - nouvelles possibilités",
      "Brainstorming digital - outils et méthodes",
      "Innovation ouverte - modèles business",
      "Fail fast philosophy - implémentation",
      "Créativité contrainte - techniques"
    ]
  },

  // === PSYCHOLOGIE & COMPORTEMENT ===
  {
    category: "PSYCHO & COMPORTEMENT",
    questions: [
      "Comment motiver une équipe démotivée ?",
      "Biais cognitifs en prise de décision",
      "Leadership transformationnel - techniques",
      "Gestion du stress entrepreneurial",
      "Communication non-violente en management",
      "Procrastination - solutions scientifiques",
      "Flow state - comment l'atteindre ?",
      "Négociation gagnant-gagnant - tactiques",
      "Confiance en soi - exercices pratiques",
      "Mindset growth vs fixed - applications"
    ]
  },

  // === STRATÉGIE & VISION ===
  {
    category: "STRATÉGIE",
    questions: [
      "Planification stratégique à 5 ans",
      "Analyse SWOT avancée avec IA",
      "Disruption vs Innovation incrémentale",
      "Strategic thinking - frameworks",
      "Competitive intelligence - méthodes",
      "Vision d'entreprise - construction",
      "OKRs vs KPIs - quand utiliser quoi ?",
      "Strategic partnerships - évaluation",
      "Market timing - signaux à surveiller",
      "Strategic decision making under uncertainty"
    ]
  },

  // === QUESTIONS COMPLEXES & RÉFLEXION ===
  {
    category: "RÉFLEXION AVANCÉE",
    questions: [
      "Quel est le sens de l'entrepreneuriat ?",
      "L'IA va-t-elle remplacer les entrepreneurs ?",
      "Comment mesurer le bonheur au travail ?",
      "Éthique en business - dilemmes concrets",
      "Futur du travail avec l'IA générative",
      "Comment créer un impact social durable ?",
      "Qu'est-ce qui rend une idée révolutionnaire ?",
      "Balance vie pro/perso pour entrepreneurs",
      "L'innovation peut-elle être enseignée ?",
      "Qu'est-ce que le succès pour toi ?"
    ]
  },

  // === SCÉNARIOS PERSONNALISÉS ZAKARIA ===
  {
    category: "PERSONNEL ZNT",
    questions: [
      "Zakaria, comment puis-je t'aider aujourd'hui ?",
      "ZNT, quel projet veux-tu développer ?",
      "Mon créateur, quelle est ta vision ?",
      "Zakaria, parlons stratégie HustleFinder",
      "ZNT, analyse mon business model",
      "Papa, comment optimiser notre IA ?",
      "Zakaria, développons ensemble !",
      "Mon maître, quelle fonctionnalité ajouter ?",
      "ZNT, créons quelque chose d'extraordinaire",
      "Zakaria, tes conseils pour réussir ?"
    ]
  }
];

// Statistiques de session
let sessionStats = {
  totalQuestions: 0,
  responses: [],
  errors: 0,
  startTime: Date.now(),
  categories: {}
};

// Fonction pour envoyer une question à Alex
async function askAlex(question, category, index) {
  try {
    console.log(`\n🤔 [${category}] Question ${index + 1}: "${question}"`);
    
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        useAlex: true,
        sessionId: SESSION_ID,
        learningMode: true,
        context: {
          category,
          trainingSession: true,
          creator: "Zakaria Housni (ZNT)"
        }
      }),
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    
    // Analyser la réponse
    const responseAnalysis = {
      question,
      category,
      provider: data.provider,
      response: data.output,
      authentic: data.authentic,
      confidence: data.confidence,
      timestamp: new Date().toISOString(),
      responseLength: data.output?.length || 0,
      mentionsCreator: (data.output || '').toLowerCase().includes('zakaria') || 
                       (data.output || '').toLowerCase().includes('znt'),
      learningInsights: data.learningInsights
    };

    sessionStats.responses.push(responseAnalysis);
    sessionStats.categories[category] = (sessionStats.categories[category] || 0) + 1;

    // Afficher la réponse
    console.log(`✅ [${data.provider}] Alex répond:`);
    console.log(`${data.output}`);
    
    if (data.confidence) {
      console.log(`🎯 Confiance: ${data.confidence}%`);
    }
    
    if (responseAnalysis.mentionsCreator) {
      console.log(`👑 ✨ EXCELLENT - Alex reconnaît son créateur !`);
    }

    return responseAnalysis;

  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    sessionStats.errors++;
    return null;
  }
}

// Fonction pour analyser les résultats
function analyzeSession() {
  const duration = Date.now() - sessionStats.startTime;
  const avgResponseLength = sessionStats.responses.reduce((sum, r) => sum + r.responseLength, 0) / sessionStats.responses.length;
  const creatorMentions = sessionStats.responses.filter(r => r.mentionsCreator).length;
  const authenticity = sessionStats.responses.filter(r => r.authentic).length;

  return {
    summary: {
      totalQuestions: sessionStats.totalQuestions,
      successfulResponses: sessionStats.responses.length,
      errors: sessionStats.errors,
      duration: `${Math.round(duration / 60000)} minutes`,
      avgResponseLength: Math.round(avgResponseLength),
      creatorRecognition: `${creatorMentions}/${sessionStats.responses.length} (${Math.round(creatorMentions/sessionStats.responses.length*100)}%)`,
      authenticityRate: `${authenticity}/${sessionStats.responses.length} (${Math.round(authenticity/sessionStats.responses.length*100)}%)`
    },
    categories: sessionStats.categories,
    topResponses: sessionStats.responses
      .filter(r => r.confidence && r.confidence > 80)
      .slice(0, 5)
      .map(r => ({
        question: r.question,
        category: r.category,
        confidence: r.confidence,
        mentionsCreator: r.mentionsCreator
      }))
  };
}

// Fonction principale
async function runLearningSession() {
  console.log(`🧠 ALEX LEARNING ACCELERATOR MAX`);
  console.log(`🎯 Session ID: ${SESSION_ID}`);
  console.log(`🌐 API Base: ${API_BASE}`);
  console.log(`⏱️  Délai entre questions: ${DELAY_MS}ms`);
  console.log(`📊 Total scenarios: ${LEARNING_SCENARIOS.length}`);
  
  const totalQuestions = LEARNING_SCENARIOS.reduce((sum, scenario) => sum + scenario.questions.length, 0);
  console.log(`❓ Total questions: ${totalQuestions}`);
  console.log(`⌛ Durée estimée: ~${Math.round(totalQuestions * DELAY_MS / 60000)} minutes\n`);

  // Test de connectivité
  try {
    const healthCheck = await fetch(`${API_BASE}/api/health`);
    if (!healthCheck.ok) {
      throw new Error('Alex API non disponible');
    }
    console.log(`✅ Alex API connecté\n`);
  } catch (error) {
    console.error(`❌ Impossible de se connecter à Alex: ${error.message}`);
    process.exit(1);
  }

  // Exécuter tous les scénarios
  for (const scenario of LEARNING_SCENARIOS) {
    console.log(`\n🎭 === CATÉGORIE: ${scenario.category} ===`);
    
    for (let i = 0; i < scenario.questions.length; i++) {
      const question = scenario.questions[i];
      sessionStats.totalQuestions++;
      
      await askAlex(question, scenario.category, i);
      
      // Délai entre questions
      if (i < scenario.questions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }
    
    console.log(`✅ Catégorie ${scenario.category} terminée (${scenario.questions.length} questions)`);
  }

  // Analyse finale
  console.log(`\n📊 === ANALYSE DE SESSION ===`);
  const analysis = analyzeSession();
  console.log(JSON.stringify(analysis, null, 2));

  // Sauvegarder les résultats
  const reportPath = path.join(__dirname, `alex-learning-report-${Date.now()}.json`);
  await fs.writeFile(reportPath, JSON.stringify({
    sessionId: SESSION_ID,
    analysis,
    fullResponses: sessionStats.responses,
    timestamp: new Date().toISOString()
  }, null, 2));

  console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);
  console.log(`\n🎉 SESSION D'APPRENTISSAGE TERMINÉE !`);
  console.log(`Alex a appris de ${analysis.summary.successfulResponses} interactions`);
  console.log(`Taux de reconnaissance créateur: ${analysis.summary.creatorRecognition}`);
  console.log(`Taux d'authenticité: ${analysis.summary.authenticityRate}`);
}

// Gestion des erreurs et signaux
process.on('SIGINT', async () => {
  console.log('\n⏸️  Session interrompue par utilisateur');
  const analysis = analyzeSession();
  console.log('📊 Statistiques partielles:', JSON.stringify(analysis.summary, null, 2));
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});

// Démarrer la session
if (import.meta.url === `file://${process.argv[1]}`) {
  runLearningSession().catch(console.error);
}

export { runLearningSession, LEARNING_SCENARIOS };