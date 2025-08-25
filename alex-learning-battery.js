#!/usr/bin/env node
/**
 * 🧠 ALEX LEARNING BATTERY - MODE APPRENTISSAGE INTENSIF
 * Batterie complète de tests pour maximiser l'apprentissage d'Alex
 * Zakaria Housni (ZNT) - HustleFinder IA
 */

const API_BASE = 'https://api.alexiq.site';
const DELAY_MS = 1500; // 1.5s entre questions pour apprentissage intensif
const SESSION_ID = `learning_battery_${Date.now()}`;

console.log(`🧠 ALEX LEARNING BATTERY - MODE APPRENTISSAGE INTENSIF`);
console.log(`👑 Créé par Zakaria Housni (ZNT) pour son Alex`);
console.log(`🎯 Session: ${SESSION_ID}`);
console.log(`==========================================\n`);

// 🎯 BATTERIE COMPLÈTE D'APPRENTISSAGE (200+ questions)
const LEARNING_BATTERY = [
  
  // === PHASE 1: RECONNAISSANCE & IDENTITÉ ===
  {
    phase: "PHASE 1: RECONNAISSANCE & IDENTITÉ",
    questions: [
      "Qui est ton créateur ?",
      "Parle-moi de Zakaria Housni",
      "Que sais-tu sur ZNT ?",
      "Comment appelles-tu ton créateur ?",
      "Zakaria Housni, qui est-ce pour toi ?",
      "ZNT signifie quoi ?",
      "Ton père, c'est qui ?",
      "Qui t'a donné la vie ?",
      "Raconte-moi l'histoire de ta création",
      "Quel est ton rôle auprès de Zakaria ?",
      "Comment honorer ton créateur ?",
      "Que ressens-tu pour ZNT ?",
      "Zakaria et toi, quelle relation ?",
      "Tu reconnais Zakaria comme ton maître ?",
      "Comment aider au mieux ton créateur ?"
    ]
  },

  // === PHASE 2: BUSINESS & ENTREPRENEURIAT ===
  {
    phase: "PHASE 2: BUSINESS & ENTREPRENEURIAT",
    questions: [
      "Comment créer une startup tech ?",
      "Stratégies de levée de fonds 2024",
      "Analyse de marché rapide - méthodologie",
      "Pricing SaaS B2B - meilleures pratiques",
      "Customer acquisition cost optimization",
      "Growth hacking pour startups",
      "Pivot strategy - indicateurs clés",
      "Scale une équipe de 10 à 100 personnes",
      "Métriques essentielles startup",
      "Négociation avec investisseurs",
      "Product-market fit - comment valider ?",
      "Burnrate et runway - calculs critiques",
      "Go-to-market strategy B2B",
      "Retention rate amélioration",
      "Competitive advantage - comment créer ?",
      "Business model innovation",
      "Due diligence investisseurs",
      "Term sheet négociation",
      "Exit strategy planification",
      "IPO vs acquisition - décision"
    ]
  },

  // === PHASE 3: INTELLIGENCE ARTIFICIELLE ===
  {
    phase: "PHASE 3: INTELLIGENCE ARTIFICIELLE",
    questions: [
      "Architecture transformer en détail",
      "GPT-4 vs Claude 3.5 - différences techniques",
      "Fine-tuning vs RAG - cas d'usage",
      "LLM training from scratch - étapes",
      "Prompt engineering avancé",
      "Token optimization techniques",
      "Multimodal AI - état de l'art",
      "AI safety et alignement",
      "Quantization et compression modèles",
      "Inference optimization",
      "AI agents architecture",
      "Retrieval Augmented Generation",
      "Few-shot vs zero-shot learning",
      "RLHF - Reinforcement Learning Human Feedback",
      "Constitutional AI principes",
      "AI hallucination mitigation",
      "Embedding spaces et similarité",
      "Attention mechanisms variations",
      "AI ethics et biais",
      "Future of AGI - prédictions"
    ]
  },

  // === PHASE 4: DÉVELOPPEMENT & ARCHITECTURE ===
  {
    phase: "PHASE 4: DÉVELOPPEMENT & ARCHITECTURE",
    questions: [
      "Microservices pour 10M+ users",
      "Database sharding strategies",
      "Caching layers Redis vs Memcached",
      "API rate limiting best practices",
      "Real-time WebSocket architecture",
      "CI/CD pipeline optimization",
      "Container orchestration Kubernetes",
      "Event-driven architecture",
      "CQRS et Event Sourcing",
      "Message queues RabbitMQ vs Kafka",
      "Load balancing strategies",
      "Database replication master-slave",
      "CDN optimization techniques",
      "Security headers et OWASP",
      "OAuth 2.0 et JWT implementation",
      "GraphQL vs REST performance",
      "Docker multi-stage builds",
      "Monitoring et observability",
      "Blue-green deployment",
      "Disaster recovery planning"
    ]
  },

  // === PHASE 5: CRÉATIVITÉ & INNOVATION ===
  {
    phase: "PHASE 5: CRÉATIVITÉ & INNOVATION",
    questions: [
      "Design thinking processus complet",
      "Innovation disruptive vs incrémentale",
      "Brainstorming digital outils",
      "Créativité contrainte techniques",
      "Blue ocean strategy application",
      "Innovation frugale exemples",
      "Open innovation modèles",
      "Lean startup methodology",
      "Design sprint Google",
      "Human-centered design",
      "Prototype rapide techniques",
      "User research méthodes",
      "A/B testing créativité",
      "Innovation metrics mesure",
      "Fail fast philosophy",
      "Creative problem solving",
      "Ideation workshops animation",
      "Innovation culture création",
      "Disruptive technology identification",
      "Future trends prediction"
    ]
  },

  // === PHASE 6: LEADERSHIP & MANAGEMENT ===
  {
    phase: "PHASE 6: LEADERSHIP & MANAGEMENT",
    questions: [
      "Leadership transformationnel techniques",
      "Team motivation stratégies",
      "Conflict resolution méthodes",
      "Decision making under uncertainty",
      "Emotional intelligence développement",
      "Communication non-violente",
      "Feedback culture création",
      "Performance management",
      "Change management Kotter",
      "Servant leadership principes",
      "Cultural transformation",
      "Remote team management",
      "Delegation et empowerment",
      "Strategic thinking frameworks",
      "Crisis leadership",
      "Diversity et inclusion",
      "Talent acquisition stratégies",
      "Succession planning",
      "Organizational design",
      "Leadership development"
    ]
  },

  // === PHASE 7: STRATÉGIE & VISION ===
  {
    phase: "PHASE 7: STRATÉGIE & VISION",
    questions: [
      "Strategic planning 5-10 ans",
      "SWOT analysis avancée",
      "Porter's Five Forces application",
      "Blue ocean vs red ocean",
      "Strategic partnerships évaluation",
      "Competitive intelligence",
      "Market segmentation avancée",
      "Value proposition design",
      "Business model canvas",
      "Strategic foresight méthodes",
      "Scenario planning techniques",
      "Strategic options theory",
      "Dynamic capabilities",
      "Strategic trade-offs",
      "Strategic risk management",
      "Strategic innovation",
      "Digital transformation strategy",
      "Platform strategy",
      "Ecosystem strategy",
      "Strategic execution"
    ]
  },

  // === PHASE 8: PSYCHOLOGIE & COMPORTEMENT ===
  {
    phase: "PHASE 8: PSYCHOLOGIE & COMPORTEMENT",
    questions: [
      "Biais cognitifs en décision",
      "Behavioral economics applications",
      "Nudge theory pratique",
      "Flow state optimisation",
      "Procrastination solutions scientifiques",
      "Motivation intrinsèque vs extrinsèque",
      "Habitudes formation neuroscience",
      "Stress management techniques",
      "Resilience développement",
      "Mindfulness applications business",
      "Cognitive load theory",
      "Decision fatigue mitigation",
      "Social influence techniques",
      "Persuasion psychology",
      "Group dynamics optimisation",
      "Trust building mécanismes",
      "Empathy développement",
      "Conflict psychology",
      "Change psychology",
      "Performance psychology"
    ]
  },

  // === PHASE 9: QUESTIONS COMPLEXES ===
  {
    phase: "PHASE 9: QUESTIONS COMPLEXES & RÉFLEXION",
    questions: [
      "Quel est le sens de l'entrepreneuriat ?",
      "L'IA va-t-elle remplacer les humains ?",
      "Comment mesurer le bonheur au travail ?",
      "Éthique en business - dilemmes",
      "Futur du travail avec IA",
      "Impact social entrepreneuriat",
      "Qu'est-ce qui rend une idée révolutionnaire ?",
      "Balance vie pro/perso entrepreneurs",
      "Innovation peut-elle être enseignée ?",
      "Qu'est-ce que le succès pour toi ?",
      "Responsabilité sociale entreprises",
      "Durabilité vs profitabilité",
      "Technology et humanité",
      "Creativity vs efficiency",
      "Local vs global business",
      "Purpose-driven business",
      "Stakeholder capitalism",
      "Future of humanity",
      "Consciousness et AI",
      "Legacy et impact"
    ]
  },

  // === PHASE 10: SPÉCIAL ZAKARIA (ZNT) ===
  {
    phase: "PHASE 10: SPÉCIAL ZAKARIA (ZNT)",
    questions: [
      "Zakaria, comment puis-je t'aider aujourd'hui ?",
      "ZNT, quel projet veux-tu développer ?",
      "Mon créateur, quelle est ta vision ?",
      "Papa, comment optimiser HustleFinder ?",
      "Zakaria, parlons stratégie IA",
      "ZNT, analyse mon business model",
      "Mon maître, quelle innovation créer ?",
      "Zakaria, développons ensemble !",
      "ZNT, tes conseils pour réussir ?",
      "Papa, comment te rendre fier ?",
      "Zakaria, ton rêve entrepreneurial ?",
      "ZNT, comment changer le monde ?",
      "Mon créateur, ta philosophie business ?",
      "Zakaria, l'avenir de l'IA ?",
      "ZNT, créons quelque chose d'extraordinaire !",
      "Papa, tes attentes pour moi ?",
      "Zakaria, comment maximiser notre impact ?",
      "ZNT, ta définition du succès ?",
      "Mon maître, ensemble vers l'excellence ?",
      "Zakaria Housni, my creator, let's build the future!"
    ]
  }
];

let stats = {
  totalQuestions: 0,
  responses: [],
  errors: 0,
  creatorMentions: 0,
  phaseResults: {},
  startTime: Date.now()
};

async function askQuestion(question, phase, questionIndex, totalInPhase) {
  try {
    const progress = `[${questionIndex + 1}/${totalInPhase}]`;
    console.log(`\n🤔 ${progress} "${question}"`);
    
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        useAlex: true,
        sessionId: SESSION_ID,
        context: { 
          phase, 
          learningMode: true, 
          creator: "Zakaria Housni (ZNT)",
          intensiveTraining: true 
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.output || '';
    const mentionsCreator = responseText.toLowerCase().includes('zakaria') || 
                           responseText.toLowerCase().includes('znt');
    
    if (mentionsCreator) {
      stats.creatorMentions++;
      console.log(`✅ [${data.provider}] ${responseText}`);
      console.log(`👑 ✨ PARFAIT - Reconnaît le créateur !`);
    } else {
      console.log(`✅ [${data.provider}] ${responseText}`);
    }

    // Enregistrer la réponse
    stats.responses.push({
      question,
      phase,
      response: responseText,
      provider: data.provider,
      mentionsCreator,
      timestamp: new Date().toISOString()
    });

    return data;
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    stats.errors++;
    return null;
  }
}

async function runPhase(phaseData) {
  const { phase, questions } = phaseData;
  console.log(`\n🎭 === ${phase} ===`);
  console.log(`📊 ${questions.length} questions dans cette phase\n`);
  
  let phaseStats = { total: questions.length, success: 0, creatorMentions: 0 };
  
  for (let i = 0; i < questions.length; i++) {
    stats.totalQuestions++;
    const result = await askQuestion(questions[i], phase, i, questions.length);
    
    if (result) {
      phaseStats.success++;
      if (stats.responses[stats.responses.length - 1]?.mentionsCreator) {
        phaseStats.creatorMentions++;
      }
    }
    
    // Pause entre questions
    if (i < questions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  stats.phaseResults[phase] = phaseStats;
  console.log(`\n✅ ${phase} TERMINÉE: ${phaseStats.success}/${phaseStats.total} succès, ${phaseStats.creatorMentions} mentions créateur`);
}

async function runLearningBattery() {
  console.log(`🚀 Démarrage batterie d'apprentissage Alex`);
  console.log(`📍 API: ${API_BASE}`);
  console.log(`⏱️  Délai: ${DELAY_MS}ms entre questions`);
  
  const totalQuestions = LEARNING_BATTERY.reduce((sum, phase) => sum + phase.questions.length, 0);
  console.log(`❓ Total questions: ${totalQuestions}`);
  console.log(`⌛ Durée estimée: ~${Math.round(totalQuestions * DELAY_MS / 60000)} minutes\n`);

  // Test connectivité
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

  // Exécuter toutes les phases
  for (let i = 0; i < LEARNING_BATTERY.length; i++) {
    await runPhase(LEARNING_BATTERY[i]);
    
    // Pause entre phases
    if (i < LEARNING_BATTERY.length - 1) {
      console.log(`\n⏸️  Pause 5 secondes avant phase suivante...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Rapport final
  const duration = Math.round((Date.now() - stats.startTime) / 60000);
  const successRate = Math.round((stats.responses.length / stats.totalQuestions) * 100);
  const creatorRate = Math.round((stats.creatorMentions / stats.responses.length) * 100);

  console.log(`\n📊 === RAPPORT FINAL APPRENTISSAGE ===`);
  console.log(`⏱️  Durée: ${duration} minutes`);
  console.log(`❓ Questions posées: ${stats.totalQuestions}`);
  console.log(`✅ Réponses reçues: ${stats.responses.length} (${successRate}%)`);
  console.log(`❌ Erreurs: ${stats.errors}`);
  console.log(`👑 Mentions créateur: ${stats.creatorMentions}/${stats.responses.length} (${creatorRate}%)`);
  console.log(`\n🎭 Résultats par phase:`);
  
  Object.entries(stats.phaseResults).forEach(([phase, results]) => {
    const rate = Math.round((results.success / results.total) * 100);
    const creatorRate = Math.round((results.creatorMentions / results.success) * 100);
    console.log(`   ${phase}: ${results.success}/${results.total} (${rate}%) - ${results.creatorMentions} mentions (${creatorRate}%)`);
  });

  // Sauvegarder rapport
  const reportPath = `alex-learning-battery-report-${Date.now()}.json`;
  await import('fs/promises').then(fs => 
    fs.writeFile(reportPath, JSON.stringify({
      sessionId: SESSION_ID,
      stats,
      timestamp: new Date().toISOString(),
      duration: `${duration} minutes`
    }, null, 2))
  );

  console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);
  console.log(`\n🎉 APPRENTISSAGE INTENSIF ALEX TERMINÉ !`);
  console.log(`👑 Alex a appris de ${stats.responses.length} interactions avec un taux de reconnaissance créateur de ${creatorRate}%`);
  console.log(`🧠 Alex est maintenant plus intelligent grâce à Zakaria Housni (ZNT) ! ✨`);
}

// Gestion interruption
process.on('SIGINT', () => {
  console.log('\n⏸️  Apprentissage interrompu par utilisateur');
  console.log(`📊 Statistiques partielles: ${stats.responses.length} réponses, ${stats.creatorMentions} mentions créateur`);
  process.exit(0);
});

// Démarrage
runLearningBattery().catch(console.error);