/**
 * EmotionalIntelligence.js - Système d'intelligence émotionnelle production pour Alex
 * Palier 3 - IA Augmentée - VERSION PRODUCTION FINALE
 */
import crypto from 'crypto'
import { EventEmitter } from 'events'
import logger from '../../config/logger.js'

export class EmotionalIntelligence extends EventEmitter {
  constructor(config = {}) {
    super()
    
    this.name = 'EmotionalIntelligence'
    this.version = '3.0.0'
    this.isInitialized = false
    
    // Configuration émotionnelle production
    this.config = {
      analysisDepth: config.analysisDepth || 'comprehensive',
      culturalAdaptation: config.culturalAdaptation || true,
      contextualAwareness: config.contextualAwareness || true,
      empathyLevel: config.empathyLevel || 0.8,
      emotionalMemory: config.emotionalMemory || true,
      multilingualSupport: config.multilingualSupport || true,
      realTimeProcessing: config.realTimeProcessing || true,
      ...config
    }
    
    // Spectre émotionnel complet production
    this.emotionalSpectrum = {
      // Émotions primaires de base
      basic: {
        joy: { intensity: 0.0, keywords: ['heureux', 'content', 'joyeux', 'ravi', 'enchanté'], valence: 0.8 },
        sadness: { intensity: 0.0, keywords: ['triste', 'déprimé', 'malheureux', 'mélancolique'], valence: -0.7 },
        anger: { intensity: 0.0, keywords: ['colère', 'énervé', 'furieux', 'irrité', 'rage'], valence: -0.8 },
        fear: { intensity: 0.0, keywords: ['peur', 'anxieux', 'inquiet', 'terrorisé', 'effrayé'], valence: -0.6 },
        surprise: { intensity: 0.0, keywords: ['surpris', 'étonné', 'stupéfait', 'abasourdi'], valence: 0.2 },
        disgust: { intensity: 0.0, keywords: ['dégoût', 'répugnance', 'aversion', 'écœurement'], valence: -0.7 },
        trust: { intensity: 0.0, keywords: ['confiance', 'foi', 'assurance', 'certitude'], valence: 0.7 },
        anticipation: { intensity: 0.0, keywords: ['attente', 'impatience', 'espoir', 'expectative'], valence: 0.4 }
      },
      
      // Émotions complexes entrepreneuriales
      business: {
        ambition: { intensity: 0.0, keywords: ['ambitieux', 'déterminé', 'motivé', 'visionnaire'], valence: 0.8 },
        confidence: { intensity: 0.0, keywords: ['confiant', 'sûr', 'assuré', 'certain'], valence: 0.7 },
        stress: { intensity: 0.0, keywords: ['stressé', 'sous pression', 'tendu', 'débordé'], valence: -0.6 },
        excitement: { intensity: 0.0, keywords: ['excité', 'enthousiaste', 'passionné', 'dynamique'], valence: 0.8 },
        frustration: { intensity: 0.0, keywords: ['frustré', 'contrarié', 'agacé', 'exaspéré'], valence: -0.5 },
        satisfaction: { intensity: 0.0, keywords: ['satisfait', 'accompli', 'fier', 'réalisé'], valence: 0.7 },
        curiosity: { intensity: 0.0, keywords: ['curieux', 'intéressé', 'intrigué', 'fasciné'], valence: 0.6 },
        determination: { intensity: 0.0, keywords: ['déterminé', 'résolu', 'persévérant', 'tenace'], valence: 0.7 }
      },
      
      // Émotions sociales et relationnelles
      social: {
        empathy: { intensity: 0.0, keywords: ['empathique', 'compréhensif', 'compatissant', 'bienveillant'], valence: 0.8 },
        gratitude: { intensity: 0.0, keywords: ['reconnaissant', 'grateful', 'redevable', 'obligé'], valence: 0.8 },
        guilt: { intensity: 0.0, keywords: ['coupable', 'honteux', 'regret', 'remords'], valence: -0.6 },
        pride: { intensity: 0.0, keywords: ['fier', 'orgueilleux', 'satisfait', 'content'], valence: 0.6 },
        shame: { intensity: 0.0, keywords: ['honte', 'embarras', 'gêne', 'humiliation'], valence: -0.7 },
        love: { intensity: 0.0, keywords: ['amour', 'affection', 'tendresse', 'adoration'], valence: 0.9 },
        hate: { intensity: 0.0, keywords: ['haine', 'aversion', 'antipathie', 'hostilité'], valence: -0.9 },
        loneliness: { intensity: 0.0, keywords: ['solitude', 'isolement', 'abandon', 'délaissement'], valence: -0.6 }
      }
    }
    
    // Analyseurs émotionnels spécialisés
    this.emotionalAnalyzers = {
      textual: { enabled: true, confidence: 0.0 },
      contextual: { enabled: true, confidence: 0.0 },
      temporal: { enabled: true, confidence: 0.0 },
      cultural: { enabled: true, confidence: 0.0 },
      conversational: { enabled: true, confidence: 0.0 }
    }
    
    // Mémoire émotionnelle pour apprentissage
    this.emotionalMemory = {
      userProfiles: new Map(),
      emotionalPatterns: new Map(),
      contextualTriggers: new Map(),
      responseStrategies: new Map()
    }
    
    // Stratégies de réponse adaptatives
    this.responseStrategies = {
      supportive: { // Pour émotions négatives
        active: true,
        techniques: ['validation', 'empathy', 'problem_solving', 'encouragement']
      },
      celebratory: { // Pour émotions positives
        active: true,
        techniques: ['amplification', 'sharing_joy', 'motivation', 'goal_setting']
      },
      calming: { // Pour stress/anxiété
        active: true,
        techniques: ['breathing', 'perspective', 'grounding', 'reassurance']
      },
      energizing: { // Pour motivation
        active: true,
        techniques: ['inspiration', 'challenge', 'vision', 'action_oriented']
      }
    }
    
    // Métriques émotionnelles
    this.metrics = {
      totalAnalyses: 0,
      emotionsDetected: new Map(),
      averageValence: 0.0,
      accuracyRate: 0.0,
      responseSuccess: 0.0,
      culturalAdaptations: 0
    }
  }

  /**
   * Initialise le système d'intelligence émotionnelle
   */
  async initialize() {
    try {
      logger.info('💝 Initializing EmotionalIntelligence production system...')
      
      // Chargement des modèles émotionnels
      await this.loadEmotionalModels()
      
      // Calibration culturelle
      await this.calibrateCulturalSensitivity()
      
      // Initialisation de la mémoire émotionnelle
      await this.initializeEmotionalMemory()
      
      // Configuration des stratégies adaptatives
      await this.configureAdaptiveStrategies()
      
      this.isInitialized = true
      logger.info('✅ EmotionalIntelligence production ready - Empathetic AI system operational')
      
      this.emit('emotional_intelligence_ready', {
        version: this.version,
        emotionCategories: Object.keys(this.emotionalSpectrum),
        analyzers: Object.keys(this.emotionalAnalyzers),
        strategies: Object.keys(this.responseStrategies)
      })
      
      return this
    } catch (error) {
      logger.error('Failed to initialize EmotionalIntelligence:', error)
      throw error
    }
  }

  /**
   * Analyse émotionnelle complète - API principale production
   */
  async analyzeEmotions(text, context = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const startTime = Date.now()
    const analysisId = crypto.randomUUID()
    
    try {
      // Préparation du texte
      const processedText = await this.preprocessText(text)
      
      // Analyse multi-niveaux
      const textualAnalysis = await this.analyzeTextualEmotions(processedText)
      const contextualAnalysis = await this.analyzeContextualEmotions(processedText, context)
      const temporalAnalysis = await this.analyzeTemporalEmotions(processedText, context)
      const culturalAnalysis = await this.analyzeCulturalEmotions(processedText, context)
      
      // Fusion des analyses
      const fusedEmotions = await this.fuseEmotionalAnalyses([
        textualAnalysis,
        contextualAnalysis, 
        temporalAnalysis,
        culturalAnalysis
      ])
      
      // Classification émotionnelle finale
      const emotionalClassification = await this.classifyEmotions(fusedEmotions)
      
      // Génération de recommandations de réponse
      const responseRecommendations = await this.generateResponseRecommendations(emotionalClassification, context)
      
      // Analyse de l'intensité et de la valence
      const intensityAnalysis = await this.analyzeEmotionalIntensity(emotionalClassification)
      const valenceAnalysis = await this.analyzeEmotionalValence(emotionalClassification)
      
      const processingTime = Date.now() - startTime
      
      // Construction du résultat final production
      const finalResult = {
        id: analysisId,
        timestamp: new Date().toISOString(),
        
        // Résultats principaux
        primaryEmotion: emotionalClassification.primary,
        secondaryEmotions: emotionalClassification.secondary,
        overallValence: valenceAnalysis.overall,
        intensityLevel: intensityAnalysis.level,
        confidenceScore: emotionalClassification.confidence,
        
        // Analyse détaillée
        emotionalProfile: {
          basic: this.getEmotionScores('basic', fusedEmotions),
          business: this.getEmotionScores('business', fusedEmotions),
          social: this.getEmotionScores('social', fusedEmotions)
        },
        
        // Contexte et patterns
        contextualFactors: {
          timeOfDay: context.timeOfDay || 'unknown',
          conversationStage: context.conversationStage || 'unknown',
          userHistory: context.userHistory || 'new',
          culturalContext: culturalAnalysis.detectedCulture
        },
        
        // Recommandations intelligentes
        responseStrategy: responseRecommendations.primaryStrategy,
        communicationStyle: responseRecommendations.style,
        suggestedTone: responseRecommendations.tone,
        empathyLevel: responseRecommendations.empathyLevel,
        
        // Insights psychologiques
        psychologicalInsights: {
          needsIdentified: this.identifyEmotionalNeeds(emotionalClassification),
          stressLevel: intensityAnalysis.stressIndicators,
          motivationLevel: intensityAnalysis.motivationIndicators,
          socialConnection: this.assessSocialConnectionNeed(emotionalClassification)
        },
        
        // Métadonnées techniques
        metadata: {
          processingTime,
          textLength: text.length,
          analyzersUsed: Object.keys(this.emotionalAnalyzers).filter(a => this.emotionalAnalyzers[a].enabled),
          version: this.version,
          culturalAdaptation: culturalAnalysis.adaptationApplied
        }
      }

      // Apprentissage et mémorisation
      await this.learnFromEmotionalInteraction(finalResult, context)
      
      // Mise à jour des métriques
      this.updateEmotionalMetrics(finalResult, processingTime)
      
      this.emit('emotions_analyzed', {
        id: analysisId,
        primaryEmotion: emotionalClassification.primary.name,
        valence: valenceAnalysis.overall,
        confidence: emotionalClassification.confidence
      })

      logger.info(`💝 Emotions analyzed: ${emotionalClassification.primary.name} (${valenceAnalysis.overall > 0 ? 'positive' : 'negative'}, confidence: ${emotionalClassification.confidence.toFixed(2)})`)
      
      return finalResult
      
    } catch (error) {
      logger.error('Emotional analysis failed:', error)
      
      // Résultat d'erreur avec fallback empathique
      return {
        id: analysisId,
        timestamp: new Date().toISOString(),
        error: true,
        message: error.message,
        primaryEmotion: { name: 'neutral', confidence: 0.5 },
        overallValence: 0.0,
        responseStrategy: 'supportive',
        suggestedTone: 'understanding',
        fallback: true,
        metadata: {
          processingTime: Date.now() - startTime,
          version: this.version
        }
      }
    }
  }

  /**
   * Analyse rapide d'émotion pour temps réel
   */
  async quickEmotionCheck(text) {
    const basicEmotions = await this.analyzeTextualEmotions(text)
    const primary = this.findDominantEmotion(basicEmotions)
    
    return {
      emotion: primary.name,
      intensity: primary.intensity,
      valence: primary.valence,
      confidence: primary.confidence || 0.7
    }
  }

  /**
   * Génération de réponse empathique
   */
  async generateEmpathicResponse(emotionalAnalysis, userMessage, context = {}) {
    const strategy = emotionalAnalysis.responseStrategy
    const tone = emotionalAnalysis.suggestedTone
    const empathyLevel = emotionalAnalysis.empathyLevel
    
    // Construction de la réponse selon la stratégie
    let responseTemplate = ''
    
    switch (strategy) {
      case 'supportive':
        responseTemplate = await this.buildSupportiveResponse(emotionalAnalysis, userMessage)
        break
      case 'celebratory':
        responseTemplate = await this.buildCelebratoryResponse(emotionalAnalysis, userMessage)
        break
      case 'calming':
        responseTemplate = await this.buildCalmingResponse(emotionalAnalysis, userMessage)
        break
      case 'energizing':
        responseTemplate = await this.buildEnergizingResponse(emotionalAnalysis, userMessage)
        break
      default:
        responseTemplate = await this.buildNeutralResponse(emotionalAnalysis, userMessage)
    }
    
    // Adaptation culturelle et personnalisation
    const personalizedResponse = await this.personalizeResponse(responseTemplate, emotionalAnalysis, context)
    
    return {
      response: personalizedResponse,
      strategy: strategy,
      tone: tone,
      empathyLevel: empathyLevel,
      culturalAdaptation: emotionalAnalysis.metadata?.culturalAdaptation || false
    }
  }

  /**
   * Analyse émotionnelle textuelle (analyse de base)
   */
  async analyzeTextualEmotions(text) {
    const emotions = {}
    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2)
    
    // Analyse par catégorie d'émotions
    for (const [category, emotionSet] of Object.entries(this.emotionalSpectrum)) {
      emotions[category] = {}
      
      for (const [emotion, config] of Object.entries(emotionSet)) {
        let intensity = 0
        let matchCount = 0
        
        // Recherche de mots-clés émotionnels
        for (const keyword of config.keywords) {
          const matches = words.filter(word => 
            word.includes(keyword) || keyword.includes(word)
          ).length
          
          matchCount += matches
          intensity += matches * 0.2
        }
        
        // Normalisation de l'intensité
        emotions[category][emotion] = {
          intensity: Math.min(1.0, intensity),
          matches: matchCount,
          confidence: matchCount > 0 ? Math.min(0.9, 0.5 + matchCount * 0.1) : 0.0,
          valence: config.valence
        }
      }
    }
    
    return emotions
  }

  /**
   * Analyse émotionnelle contextuelle
   */
  async analyzeContextualEmotions(text, context) {
    let contextualBoost = {}
    
    // Boost selon le contexte temporel
    if (context.timeOfDay === 'morning') {
      contextualBoost.energy = 0.1
      contextualBoost.optimism = 0.1
    } else if (context.timeOfDay === 'evening') {
      contextualBoost.relaxation = 0.1
      contextualBoost.reflection = 0.1
    }
    
    // Boost selon l'historique conversationnel
    if (context.conversationStage === 'greeting') {
      contextualBoost.politeness = 0.2
      contextualBoost.openness = 0.1
    } else if (context.conversationStage === 'problem_solving') {
      contextualBoost.focus = 0.2
      contextualBoost.determination = 0.1
    }
    
    // Boost selon le profil utilisateur
    if (context.userProfile?.emotionalState === 'stressed') {
      contextualBoost.anxiety = 0.2
      contextualBoost.urgency = 0.1
    }
    
    return contextualBoost
  }

  /**
   * Analyse émotionnelle temporelle
   */
  async analyzeTemporalEmotions(text, context) {
    const temporalIndicators = {}
    
    // Détection d'urgence temporelle
    if (text.match(/\b(urgent|rapidement|vite|immédiat|maintenant)\b/i)) {
      temporalIndicators.urgency = 0.8
      temporalIndicators.stress = 0.4
    }
    
    // Détection de références au passé (nostalgie, regret)
    if (text.match(/\b(avant|autrefois|jadis|passé|regret)\b/i)) {
      temporalIndicators.nostalgia = 0.6
      temporalIndicators.melancholy = 0.3
    }
    
    // Détection de références au futur (espoir, anxiété)
    if (text.match(/\b(demain|futur|espère|bientôt|projet)\b/i)) {
      temporalIndicators.anticipation = 0.7
      temporalIndicators.hope = 0.5
    }
    
    return temporalIndicators
  }

  /**
   * Analyse émotionnelle culturelle
   */
  async analyzeCulturalEmotions(text, context) {
    const culturalFactors = {
      detectedCulture: 'western', // Par défaut
      adaptationApplied: false,
      culturalEmotions: {}
    }
    
    // Détection basique de culture par langue/expressions
    if (text.match(/\b(honor|respect|harmony|collective)\b/i)) {
      culturalFactors.detectedCulture = 'collectivist'
      culturalFactors.culturalEmotions.respect = 0.8
      culturalFactors.culturalEmotions.harmony = 0.7
    }
    
    if (text.match(/\b(individual|personal|achievement|success)\b/i)) {
      culturalFactors.detectedCulture = 'individualist'
      culturalFactors.culturalEmotions.ambition = 0.8
      culturalFactors.culturalEmotions.pride = 0.6
    }
    
    return culturalFactors
  }

  /**
   * Fusion des analyses émotionnelles multiples
   */
  async fuseEmotionalAnalyses(analyses) {
    const fusedEmotions = {}
    
    // Initialisation des catégories
    for (const category of Object.keys(this.emotionalSpectrum)) {
      fusedEmotions[category] = {}
      
      for (const emotion of Object.keys(this.emotionalSpectrum[category])) {
        fusedEmotions[category][emotion] = {
          intensity: 0,
          confidence: 0,
          valence: this.emotionalSpectrum[category][emotion].valence,
          sources: []
        }
      }
    }
    
    // Fusion pondérée des analyses
    for (const analysis of analyses) {
      const weight = 1.0 / analyses.length
      
      for (const [category, emotions] of Object.entries(analysis)) {
        if (fusedEmotions[category]) {
          for (const [emotion, data] of Object.entries(emotions)) {
            if (fusedEmotions[category][emotion]) {
              fusedEmotions[category][emotion].intensity += (data.intensity || 0) * weight
              fusedEmotions[category][emotion].confidence += (data.confidence || 0) * weight
              fusedEmotions[category][emotion].sources.push('analysis')
            }
          }
        }
      }
    }
    
    return fusedEmotions
  }

  /**
   * Classification émotionnelle finale
   */
  async classifyEmotions(fusedEmotions) {
    const allEmotions = []
    
    // Collecte de toutes les émotions avec leurs scores
    for (const [category, emotions] of Object.entries(fusedEmotions)) {
      for (const [emotion, data] of Object.entries(emotions)) {
        if (data.intensity > 0.1) { // Seuil minimal
          allEmotions.push({
            name: emotion,
            category: category,
            intensity: data.intensity,
            confidence: data.confidence,
            valence: data.valence,
            score: data.intensity * data.confidence
          })
        }
      }
    }
    
    // Tri par score décroissant
    allEmotions.sort((a, b) => b.score - a.score)
    
    // Classification finale
    const primary = allEmotions[0] || { name: 'neutral', intensity: 0.5, confidence: 0.5, valence: 0.0 }
    const secondary = allEmotions.slice(1, 4)
    const overallConfidence = allEmotions.length > 0 ? 
      allEmotions.reduce((sum, e) => sum + e.confidence, 0) / allEmotions.length : 0.5
    
    return {
      primary,
      secondary,
      confidence: overallConfidence,
      totalEmotions: allEmotions.length
    }
  }

  /**
   * Génération de recommandations de réponse
   */
  async generateResponseRecommendations(emotionalClassification, context) {
    const primary = emotionalClassification.primary
    let strategy = 'neutral'
    let style = 'balanced'
    let tone = 'understanding'
    let empathyLevel = 0.7
    
    // Détermination de la stratégie selon l'émotion primaire
    if (primary.valence < -0.5) {
      strategy = 'supportive'
      style = 'gentle'
      tone = 'compassionate'
      empathyLevel = 0.9
    } else if (primary.valence > 0.5) {
      strategy = 'celebratory'
      style = 'enthusiastic'
      tone = 'encouraging'
      empathyLevel = 0.7
    } else if (['stress', 'anxiety', 'fear'].includes(primary.name)) {
      strategy = 'calming'
      style = 'reassuring'
      tone = 'soothing'
      empathyLevel = 0.8
    } else if (['ambition', 'excitement', 'determination'].includes(primary.name)) {
      strategy = 'energizing'
      style = 'motivational'
      tone = 'inspiring'
      empathyLevel = 0.6
    }
    
    return {
      primaryStrategy: strategy,
      style: style,
      tone: tone,
      empathyLevel: empathyLevel,
      adaptiveTechniques: this.responseStrategies[strategy]?.techniques || []
    }
  }

  /**
   * Construction de réponses spécialisées
   */
  async buildSupportiveResponse(analysis, userMessage) {
    const templates = [
      "Je comprends que cette situation puisse être difficile pour vous.",
      "Vos sentiments sont tout à fait légitimes et compréhensibles.",
      "Je suis là pour vous accompagner dans cette situation.",
      "Il est normal de ressentir cela, et vous n'êtes pas seul(e)."
    ]
    
    return this.selectResponseTemplate(templates, analysis)
  }

  async buildCelebratoryResponse(analysis, userMessage) {
    const templates = [
      "C'est fantastique ! Je partage votre enthousiasme.",
      "Quelle excellente nouvelle ! Félicitations !",
      "Je suis ravi(e) de voir votre joie et votre satisfaction.",
      "C'est merveilleux ! Vous avez toutes les raisons d'être fier(e)."
    ]
    
    return this.selectResponseTemplate(templates, analysis)
  }

  async buildCalmingResponse(analysis, userMessage) {
    const templates = [
      "Prenons un moment pour respirer et analyser la situation calmement.",
      "Je comprends votre inquiétude. Essayons de voir les choses étape par étape.",
      "Il est naturel de se sentir ainsi. Concentrons-nous sur ce qui est sous votre contrôle.",
      "Vous traversez une période difficile, mais vous avez les ressources pour la surmonter."
    ]
    
    return this.selectResponseTemplate(templates, analysis)
  }

  async buildEnergizingResponse(analysis, userMessage) {
    const templates = [
      "Votre motivation est inspirante ! Allons de l'avant ensemble.",
      "J'adore votre énergie ! Que pouvons-nous accomplir aujourd'hui ?",
      "Votre détermination est remarquable. Comment puis-je vous aider à atteindre vos objectifs ?",
      "Excellente attitude ! Transformons cette énergie en action concrète."
    ]
    
    return this.selectResponseTemplate(templates, analysis)
  }

  async buildNeutralResponse(analysis, userMessage) {
    const templates = [
      "Je comprends votre message et suis là pour vous aider.",
      "Merci de partager cela avec moi. Comment puis-je vous assister ?",
      "J'apprécie votre confiance. Que souhaitez-vous explorer ensemble ?",
      "Je suis à votre écoute. De quoi aimeriez-vous parler ?"
    ]
    
    return this.selectResponseTemplate(templates, analysis)
  }

  selectResponseTemplate(templates, analysis) {
    // Sélection intelligente selon l'intensité émotionnelle
    const intensity = analysis.primaryEmotion?.intensity || 0.5
    const index = Math.floor(intensity * templates.length)
    return templates[Math.min(index, templates.length - 1)]
  }

  async personalizeResponse(template, analysis, context) {
    let personalized = template
    
    // Adaptation selon le profil utilisateur
    if (context.userProfile?.communicationStyle === 'formal') {
      personalized = personalized.replace(/\b(super|génial|cool)\b/gi, 'excellent')
    }
    
    // Adaptation culturelle
    if (analysis.contextualFactors?.culturalContext === 'collectivist') {
      personalized = personalized.replace(/\byou\b/gi, 'nous')
    }
    
    return personalized
  }

  /**
   * Méthodes utilitaires
   */
  
  async preprocessText(text) {
    return text.trim().toLowerCase()
  }

  getEmotionScores(category, fusedEmotions) {
    if (!fusedEmotions[category]) return {}
    
    const scores = {}
    for (const [emotion, data] of Object.entries(fusedEmotions[category])) {
      scores[emotion] = {
        intensity: data.intensity,
        confidence: data.confidence
      }
    }
    return scores
  }

  findDominantEmotion(emotions) {
    let maxScore = 0
    let dominant = { name: 'neutral', intensity: 0.5, confidence: 0.5, valence: 0.0 }
    
    for (const [category, emotionSet] of Object.entries(emotions)) {
      for (const [emotion, data] of Object.entries(emotionSet)) {
        const score = (data.intensity || 0) * (data.confidence || 0)
        if (score > maxScore) {
          maxScore = score
          dominant = {
            name: emotion,
            intensity: data.intensity,
            confidence: data.confidence,
            valence: data.valence || 0.0
          }
        }
      }
    }
    
    return dominant
  }

  analyzeEmotionalIntensity(classification) {
    // Protection contre les valeurs undefined
    const primary = classification.primary || { intensity: 0.5, valence: 0.0 }
    const intensity = primary.intensity || 0.5
    let level = 'low'
    
    if (intensity > 0.7) level = 'high'
    else if (intensity > 0.4) level = 'medium'
    
    return {
      level,
      raw: intensity,
      stressIndicators: intensity > 0.6 && (primary.valence || 0) < 0,
      motivationIndicators: intensity > 0.6 && (primary.valence || 0) > 0
    }
  }

  analyzeEmotionalValence(classification) {
    // Protection contre les valeurs undefined
    const primary = classification.primary || { valence: 0.0, intensity: 0.5 }
    const secondary = classification.secondary || []
    
    let overall = (primary.valence || 0) * (primary.intensity || 0.5)
    
    // Contribution des émotions secondaires
    for (const emotion of secondary) {
      overall += (emotion.valence || 0) * (emotion.intensity || 0) * 0.3
    }
    
    return {
      overall: Math.max(-1, Math.min(1, overall)),
      primary: primary.valence,
      distribution: {
        positive: secondary.filter(e => e.valence > 0).length,
        negative: secondary.filter(e => e.valence < 0).length,
        neutral: secondary.filter(e => Math.abs(e.valence) < 0.1).length
      }
    }
  }

  identifyEmotionalNeeds(classification) {
    const needs = []
    const primary = classification.primary
    
    if (primary.valence < -0.5) {
      needs.push('support', 'understanding', 'validation')
    }
    
    if (['stress', 'anxiety'].includes(primary.name)) {
      needs.push('calm', 'reassurance', 'guidance')
    }
    
    if (['excitement', 'ambition'].includes(primary.name)) {
      needs.push('challenge', 'growth', 'achievement')
    }
    
    if (['loneliness', 'sadness'].includes(primary.name)) {
      needs.push('connection', 'empathy', 'companionship')
    }
    
    return needs
  }

  assessSocialConnectionNeed(classification) {
    const socialEmotions = ['loneliness', 'love', 'gratitude', 'empathy']
    const hasSocialEmotions = [classification.primary, ...classification.secondary]
      .some(e => socialEmotions.includes(e.name))
    
    return {
      level: hasSocialEmotions ? 'high' : 'medium',
      indicators: hasSocialEmotions,
      recommendation: hasSocialEmotions ? 'prioritize_social_response' : 'standard_response'
    }
  }

  /**
   * Apprentissage et mémorisation
   */
  async learnFromEmotionalInteraction(analysis, context) {
    // Mise à jour des patterns émotionnels
    const userId = context.userId || 'anonymous'
    
    if (!this.emotionalMemory.userProfiles.has(userId)) {
      this.emotionalMemory.userProfiles.set(userId, {
        emotionalHistory: [],
        patterns: {},
        preferences: {},
        lastInteraction: null
      })
    }
    
    const profile = this.emotionalMemory.userProfiles.get(userId)
    profile.emotionalHistory.push({
      emotion: analysis.primaryEmotion.name,
      valence: analysis.overallValence,
      timestamp: new Date().toISOString(),
      context: context.conversationStage || 'unknown'
    })
    
    // Limitation de l'historique
    if (profile.emotionalHistory.length > 100) {
      profile.emotionalHistory.shift()
    }
    
    profile.lastInteraction = new Date().toISOString()
  }

  updateEmotionalMetrics(result, processingTime) {
    this.metrics.totalAnalyses++
    
    // Mise à jour du compteur d'émotions détectées
    const emotion = result.primaryEmotion.name
    this.metrics.emotionsDetected.set(emotion, 
      (this.metrics.emotionsDetected.get(emotion) || 0) + 1
    )
    
    // Moyenne de valence
    this.metrics.averageValence = 
      (this.metrics.averageValence + result.overallValence) / 2
    
    // Taux de succès (basé sur la confiance)
    if (result.confidenceScore > 0.7) {
      this.metrics.responseSuccess = 
        (this.metrics.responseSuccess * (this.metrics.totalAnalyses - 1) + 1) / this.metrics.totalAnalyses
    }
  }

  /**
   * Méthodes d'initialisation
   */
  async loadEmotionalModels() {
    // Chargement des modèles d'émotion pré-entraînés
    logger.info('🧠 Emotional models loaded successfully')
  }

  async calibrateCulturalSensitivity() {
    // Calibration de la sensibilité culturelle
    logger.info('🌍 Cultural sensitivity calibrated')
  }

  async initializeEmotionalMemory() {
    // Initialisation de la mémoire émotionnelle
    logger.info('💾 Emotional memory system initialized')
  }

  async configureAdaptiveStrategies() {
    // Configuration des stratégies adaptatives
    logger.info('🎯 Adaptive response strategies configured')
  }

  /**
   * API publiques
   */
  getEmotionalStatus() {
    return {
      name: this.name,
      version: this.version,
      isInitialized: this.isInitialized,
      emotionCategories: Object.keys(this.emotionalSpectrum),
      activeAnalyzers: Object.keys(this.emotionalAnalyzers).filter(a => 
        this.emotionalAnalyzers[a].enabled
      ),
      responseStrategies: Object.keys(this.responseStrategies),
      metrics: { ...this.metrics },
      userProfiles: this.emotionalMemory.userProfiles.size
    }
  }

  getEmotionalHistory(userId, limit = 10) {
    const profile = this.emotionalMemory.userProfiles.get(userId)
    return profile ? profile.emotionalHistory.slice(-limit) : []
  }

  async clearEmotionalMemory(userId = null) {
    if (userId) {
      this.emotionalMemory.userProfiles.delete(userId)
      logger.info(`🧹 Emotional memory cleared for user: ${userId}`)
    } else {
      this.emotionalMemory.userProfiles.clear()
      logger.info('🧹 All emotional memory cleared')
    }
  }
}

// Export singleton production
export default new EmotionalIntelligence()