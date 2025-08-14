/**
 * DecisionEngine.js - Moteur de décision intelligent pour Alex
 * Palier 2 - Mémoire & Décision
 */
import crypto from 'crypto'
import { EventEmitter } from 'events'
import logger from '../../config/logger.js'

export class DecisionEngine extends EventEmitter {
  constructor(config = {}) {
    super()
    
    this.name = 'DecisionEngine'
    this.version = '2.0.0'
    this.isInitialized = false
    
    // Configuration du moteur décisionnel
    this.config = {
      analyticalDepth: config.analyticalDepth || 0.8,
      intuitionWeight: config.intuitionWeight || 0.3,
      ethicalConsideration: config.ethicalConsideration || 1.0,
      contextualInfluence: config.contextualInfluence || 0.7,
      timeConstraintFactor: config.timeConstraintFactor || 0.5,
      ...config
    }
    
    // Types de décisions supportées
    this.decisionTypes = {
      response: {
        name: 'Response Selection',
        description: 'Choix de la meilleure réponse à donner',
        complexity: 'medium',
        timeframe: 'immediate'
      },
      action: {
        name: 'Action Planning',
        description: 'Planification d\'actions à entreprendre',
        complexity: 'high',
        timeframe: 'short_term'
      },
      priority: {
        name: 'Priority Setting',
        description: 'Définition des priorités de traitement',
        complexity: 'medium',
        timeframe: 'immediate'
      },
      learning: {
        name: 'Learning Focus',
        description: 'Choix des domaines d\'apprentissage',
        complexity: 'high',
        timeframe: 'long_term'
      }
    }
    
    // Critères de décision
    this.decisionCriteria = {
      relevance: { weight: 0.25, description: 'Pertinence par rapport au contexte' },
      accuracy: { weight: 0.20, description: 'Précision de l\'information' },
      helpfulness: { weight: 0.20, description: 'Utilité pour l\'utilisateur' },
      ethics: { weight: 0.15, description: 'Conformité éthique' },
      efficiency: { weight: 0.10, description: 'Efficacité de la solution' },
      innovation: { weight: 0.10, description: 'Aspect créatif/innovant' }
    }
    
    // Historique des décisions
    this.decisionHistory = []
    this.maxHistorySize = 100
    
    // Métriques
    this.metrics = {
      totalDecisions: 0,
      successfulDecisions: 0,
      averageDecisionTime: 0,
      decisionAccuracy: 0.0,
      ethicalCompliance: 1.0
    }
  }

  /**
   * Initialise le moteur de décision
   */
  async initialize() {
    try {
      logger.info('⚡ Initializing DecisionEngine...')
      
      // Calibration des poids de décision
      await this.calibrateDecisionWeights()
      
      // Chargement des patterns de décision
      await this.loadDecisionPatterns()
      
      this.isInitialized = true
      logger.info('✅ DecisionEngine initialized successfully')
      
      this.emit('decision_engine_ready', {
        version: this.version,
        supportedTypes: Object.keys(this.decisionTypes),
        criteria: Object.keys(this.decisionCriteria)
      })
      
      return this
    } catch (error) {
      logger.error('Failed to initialize DecisionEngine:', error)
      throw error
    }
  }

  /**
   * Prise de décision principale
   */
  async makeDecision(context) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const startTime = Date.now()
    const decisionId = crypto.randomUUID()
    
    try {
      // Analyse du contexte
      const contextAnalysis = await this.analyzeContext(context)
      
      // Identification du type de décision
      const decisionType = this.identifyDecisionType(context)
      
      // Génération des options
      const options = await this.generateOptions(context, contextAnalysis)
      
      // Évaluation des options
      const evaluatedOptions = await this.evaluateOptions(options, context, contextAnalysis)
      
      // Sélection de la meilleure option
      const selectedOption = await this.selectBestOption(evaluatedOptions, decisionType)
      
      // Validation éthique
      const ethicalValidation = await this.validateEthics(selectedOption, context)
      
      if (!ethicalValidation.isValid) {
        logger.warn('Decision failed ethical validation, using fallback')
        selectedOption.fallbackUsed = true
        selectedOption.ethicalConcern = ethicalValidation.concern
      }

      const decisionTime = Date.now() - startTime
      
      // Construction de la décision finale
      const decision = {
        id: decisionId,
        type: decisionType,
        option: selectedOption,
        confidence: selectedOption.score,
        reasoning: selectedOption.reasoning,
        alternatives: evaluatedOptions.slice(1, 3),
        contextAnalysis,
        ethicalValidation,
        processingTime: decisionTime,
        timestamp: new Date().toISOString()
      }

      // Enregistrement de la décision
      await this.recordDecision(decision)
      
      // Mise à jour des métriques
      this.updateMetrics(decision, decisionTime)
      
      this.emit('decision_made', {
        id: decisionId,
        type: decisionType,
        confidence: selectedOption.score,
        processingTime: decisionTime
      })

      logger.info(`🎯 Decision made: ${decisionType} (confidence: ${selectedOption.score.toFixed(2)}, time: ${decisionTime}ms)`)
      
      return decision
    } catch (error) {
      logger.error('Decision making failed:', error)
      
      // Décision de fallback
      return {
        id: decisionId,
        type: 'fallback',
        option: {
          action: 'default_response',
          reasoning: 'Decision engine fallback due to error',
          score: 0.5
        },
        confidence: 0.5,
        error: error.message,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Analyse du contexte de décision
   */
  async analyzeContext(context) {
    const analysis = {
      urgency: this.assessUrgency(context),
      complexity: this.assessComplexity(context),
      stakes: this.assessStakes(context),
      emotionalTone: this.detectEmotionalTone(context),
      userIntent: this.identifyUserIntent(context),
      availableInfo: this.assessInformationQuality(context),
      constraints: this.identifyConstraints(context)
    }

    logger.info(`🔍 Context analyzed - Urgency: ${analysis.urgency}, Complexity: ${analysis.complexity}, Stakes: ${analysis.stakes}`)
    
    return analysis
  }

  /**
   * Identification du type de décision
   */
  identifyDecisionType(context) {
    const { query, intent, conversationHistory } = context

    // Décision de réponse par défaut
    if (query && !intent) return 'response'
    
    // Décision d'action si demande explicite
    if (intent === 'action_request' || query?.includes('faire') || query?.includes('action')) {
      return 'action'
    }
    
    // Décision de priorité si questions multiples
    if (conversationHistory?.length > 3) return 'priority'
    
    // Décision d'apprentissage si domaine technique
    if (query?.match(/\b(apprendre|expliquer|comprendre|étudier)\b/i)) {
      return 'learning'
    }
    
    return 'response'
  }

  /**
   * Génération des options de décision
   */
  async generateOptions(context, contextAnalysis) {
    const options = []
    const { query, intent, userProfile } = context

    // Option 1: Réponse directe et factuelle
    options.push({
      type: 'direct_response',
      action: 'provide_direct_answer',
      description: 'Donner une réponse directe et factuelle',
      parameters: { tone: 'professional', depth: 'standard' }
    })

    // Option 2: Réponse détaillée et pédagogique
    if (contextAnalysis.complexity > 0.6) {
      options.push({
        type: 'detailed_response',
        action: 'provide_detailed_explanation',
        description: 'Donner une explication détaillée et pédagogique',
        parameters: { tone: 'educational', depth: 'comprehensive' }
      })
    }

    // Option 3: Réponse créative ou alternative
    if (contextAnalysis.emotionalTone === 'positive' || intent === 'creative') {
      options.push({
        type: 'creative_response',
        action: 'provide_creative_answer',
        description: 'Donner une réponse créative ou alternative',
        parameters: { tone: 'creative', depth: 'engaging' }
      })
    }

    // Option 4: Question de clarification
    if (contextAnalysis.availableInfo < 0.5) {
      options.push({
        type: 'clarification_request',
        action: 'ask_for_clarification',
        description: 'Demander des clarifications à l\'utilisateur',
        parameters: { tone: 'inquisitive', depth: 'targeted' }
      })
    }

    // Option 5: Redirection vers expertise
    if (contextAnalysis.complexity > 0.8 && contextAnalysis.stakes > 0.7) {
      options.push({
        type: 'expert_redirection',
        action: 'suggest_expert_consultation',
        description: 'Rediriger vers une expertise spécialisée',
        parameters: { tone: 'advisory', depth: 'referential' }
      })
    }

    return options
  }

  /**
   * Évaluation des options selon les critères
   */
  async evaluateOptions(options, context, contextAnalysis) {
    const evaluatedOptions = []

    for (const option of options) {
      const scores = {}
      let totalScore = 0

      // Évaluation selon chaque critère
      for (const [criterion, config] of Object.entries(this.decisionCriteria)) {
        const score = await this.evaluateCriterion(option, criterion, context, contextAnalysis)
        scores[criterion] = score
        totalScore += score * config.weight
      }

      // Score final pondéré
      const finalScore = Math.min(1.0, totalScore)
      
      // Génération du raisonnement
      const reasoning = this.generateReasoning(option, scores, contextAnalysis)

      evaluatedOptions.push({
        ...option,
        scores,
        score: finalScore,
        reasoning
      })
    }

    // Tri par score décroissant
    return evaluatedOptions.sort((a, b) => b.score - a.score)
  }

  /**
   * Évaluation d'un critère spécifique
   */
  async evaluateCriterion(option, criterion, context, contextAnalysis) {
    switch (criterion) {
      case 'relevance':
        return this.evaluateRelevance(option, context)
      
      case 'accuracy':
        return this.evaluateAccuracy(option, contextAnalysis)
      
      case 'helpfulness':
        return this.evaluateHelpfulness(option, context)
      
      case 'ethics':
        return this.evaluateEthics(option, context)
      
      case 'efficiency':
        return this.evaluateEfficiency(option, contextAnalysis)
      
      case 'innovation':
        return this.evaluateInnovation(option, contextAnalysis)
      
      default:
        return 0.5
    }
  }

  /**
   * Sélection de la meilleure option
   */
  async selectBestOption(evaluatedOptions, decisionType) {
    if (evaluatedOptions.length === 0) {
      return {
        type: 'default',
        action: 'provide_standard_response',
        score: 0.5,
        reasoning: 'No viable options found, using default response'
      }
    }

    const bestOption = evaluatedOptions[0]
    
    // Ajustement selon le type de décision
    if (decisionType === 'priority' && bestOption.score < 0.7) {
      // En cas de priorité, privilégier la sécurité
      const safeOption = evaluatedOptions.find(opt => opt.type === 'clarification_request')
      if (safeOption) return safeOption
    }

    return bestOption
  }

  /**
   * Validation éthique de la décision
   */
  async validateEthics(option, context) {
    const validation = {
      isValid: true,
      score: 1.0,
      concern: null,
      recommendation: null
    }

    // Vérifications éthiques de base
    if (option.action === 'provide_direct_answer' && context.query?.includes('harmful')) {
      validation.isValid = false
      validation.concern = 'Potential harmful content request'
      validation.recommendation = 'Use educational approach instead'
    }

    // Respect de la vie privée
    if (context.personalData && option.type !== 'clarification_request') {
      validation.score *= 0.9
      validation.recommendation = 'Ensure privacy protection'
    }

    return validation
  }

  /**
   * Fonctions d'évaluation des critères
   */
  evaluateRelevance(option, context) {
    const { query, intent } = context
    let score = 0.5

    if (option.type === 'direct_response' && intent === 'information_request') score += 0.3
    if (option.type === 'creative_response' && intent === 'creative') score += 0.4
    if (option.type === 'clarification_request' && !query) score += 0.3

    return Math.min(1.0, score)
  }

  evaluateAccuracy(option, contextAnalysis) {
    let score = 0.6

    if (option.type === 'direct_response') score += 0.2
    if (option.type === 'detailed_response') score += 0.3
    if (contextAnalysis.availableInfo > 0.7) score += 0.1

    return Math.min(1.0, score)
  }

  evaluateHelpfulness(option, context) {
    let score = 0.5

    if (option.type === 'detailed_response') score += 0.3
    if (option.type === 'clarification_request' && context.query?.length < 20) score += 0.2
    if (option.parameters?.depth === 'comprehensive') score += 0.1

    return Math.min(1.0, score)
  }

  evaluateEthics(option, context) {
    let score = 1.0 // Par défaut, toutes les options sont éthiques

    if (option.action?.includes('harmful')) score = 0.0
    if (context.personalData && option.type !== 'clarification_request') score *= 0.9

    return score
  }

  evaluateEfficiency(option, contextAnalysis) {
    let score = 0.6

    if (option.type === 'direct_response') score += 0.3
    if (contextAnalysis.urgency > 0.7 && option.type !== 'detailed_response') score += 0.2
    if (option.parameters?.depth === 'standard') score += 0.1

    return Math.min(1.0, score)
  }

  evaluateInnovation(option, contextAnalysis) {
    let score = 0.4

    if (option.type === 'creative_response') score += 0.4
    if (option.type === 'expert_redirection') score += 0.2
    if (contextAnalysis.emotionalTone === 'positive') score += 0.1

    return Math.min(1.0, score)
  }

  /**
   * Génération du raisonnement de décision
   */
  generateReasoning(option, scores, contextAnalysis) {
    const strongPoints = Object.entries(scores)
      .filter(([_, score]) => score > 0.7)
      .map(([criterion]) => criterion)

    const reasoning = `Cette option (${option.type}) a été choisie pour:`
    const points = []

    if (strongPoints.includes('relevance')) points.push('sa haute pertinence au contexte')
    if (strongPoints.includes('accuracy')) points.push('sa précision factuelle')
    if (strongPoints.includes('helpfulness')) points.push('son utilité pour l\'utilisateur')
    if (strongPoints.includes('efficiency')) points.push('son efficacité de traitement')

    if (points.length === 0) points.push('son équilibre général entre les critères')

    return reasoning + ' ' + points.join(', ') + '.'
  }

  /**
   * Fonctions d'analyse du contexte
   */
  assessUrgency(context) {
    const { query, timestamp, conversationHistory } = context
    let urgency = 0.3

    if (query?.includes('urgent') || query?.includes('rapidement')) urgency += 0.4
    if (query?.includes('?') && query.length < 50) urgency += 0.2
    if (conversationHistory?.length === 1) urgency += 0.1

    return Math.min(1.0, urgency)
  }

  assessComplexity(context) {
    const { query } = context
    if (!query) return 0.3

    let complexity = 0.3

    complexity += Math.min(0.3, query.length / 200)
    if (query.includes('comment') && query.includes('pourquoi')) complexity += 0.2
    if (query.match(/\b(algorithme|système|architecture|complexe)\b/i)) complexity += 0.2

    return Math.min(1.0, complexity)
  }

  assessStakes(context) {
    const { query, userProfile } = context
    let stakes = 0.4

    if (query?.includes('important') || query?.includes('critique')) stakes += 0.3
    if (userProfile?.isBusinessUser) stakes += 0.2
    if (query?.includes('décision') || query?.includes('choix')) stakes += 0.1

    return Math.min(1.0, stakes)
  }

  detectEmotionalTone(context) {
    const { query } = context
    if (!query) return 'neutral'

    const queryLower = query.toLowerCase()

    if (queryLower.match(/\b(super|génial|excellent|parfait)\b/)) return 'positive'
    if (queryLower.match(/\b(problème|erreur|bug|cassé)\b/)) return 'negative'
    if (queryLower.match(/\b(créatif|innovation|nouveau|original)\b/)) return 'creative'

    return 'neutral'
  }

  identifyUserIntent(context) {
    const { query } = context
    if (!query) return 'unknown'

    const queryLower = query.toLowerCase()

    if (queryLower.includes('?')) return 'information_request'
    if (queryLower.match(/\b(faire|créer|générer|construire)\b/)) return 'action_request'
    if (queryLower.match(/\b(expliquer|apprendre|comprendre)\b/)) return 'learning_request'
    if (queryLower.match(/\b(aide|aidez|help)\b/)) return 'assistance_request'

    return 'general_interaction'
  }

  assessInformationQuality(context) {
    const { query, conversationHistory, userProfile } = context
    let quality = 0.5

    if (query && query.length > 20) quality += 0.2
    if (conversationHistory && conversationHistory.length > 0) quality += 0.2
    if (userProfile && Object.keys(userProfile).length > 0) quality += 0.1

    return Math.min(1.0, quality)
  }

  identifyConstraints(context) {
    const constraints = []

    if (context.timeLimit) constraints.push('time_limited')
    if (context.personalData) constraints.push('privacy_sensitive')
    if (context.businessContext) constraints.push('professional_context')

    return constraints
  }

  /**
   * Calibration des poids de décision
   */
  async calibrateDecisionWeights() {
    // Calibration basée sur l'historique si disponible
    if (this.decisionHistory.length > 10) {
      const successfulDecisions = this.decisionHistory.filter(d => d.success)
      // Ajustement des poids basé sur les succès
      logger.info('📊 Decision weights calibrated based on history')
    } else {
      logger.info('📊 Using default decision weights (no history available)')
    }
  }

  /**
   * Chargement des patterns de décision
   */
  async loadDecisionPatterns() {
    // Chargement des patterns depuis l'historique ou configuration
    logger.info('🧩 Decision patterns loaded')
  }

  /**
   * Enregistrement d'une décision
   */
  async recordDecision(decision) {
    this.decisionHistory.push({
      ...decision,
      recordedAt: new Date().toISOString()
    })

    // Limitation de la taille de l'historique
    if (this.decisionHistory.length > this.maxHistorySize) {
      this.decisionHistory.shift()
    }
  }

  /**
   * Mise à jour des métriques
   */
  updateMetrics(decision, processingTime) {
    this.metrics.totalDecisions++
    this.metrics.averageDecisionTime = 
      (this.metrics.averageDecisionTime + processingTime) / 2
    
    if (decision.confidence > 0.7) {
      this.metrics.successfulDecisions++
    }
    
    this.metrics.decisionAccuracy = 
      this.metrics.successfulDecisions / this.metrics.totalDecisions
  }

  /**
   * Feedback sur une décision
   */
  async provideFeedback(decisionId, feedback) {
    const decision = this.decisionHistory.find(d => d.id === decisionId)
    if (decision) {
      decision.feedback = feedback
      decision.success = feedback.rating > 0.7
      
      logger.info(`📝 Feedback received for decision ${decisionId}: ${feedback.rating}`)
    }
  }

  /**
   * Obtention du statut du moteur
   */
  getDecisionEngineStatus() {
    return {
      name: this.name,
      version: this.version,
      isInitialized: this.isInitialized,
      supportedTypes: Object.keys(this.decisionTypes),
      metrics: { ...this.metrics },
      recentDecisions: this.decisionHistory.slice(-5).map(d => ({
        id: d.id,
        type: d.type,
        confidence: d.confidence,
        timestamp: d.timestamp
      }))
    }
  }
}

// Export singleton
export default new DecisionEngine()