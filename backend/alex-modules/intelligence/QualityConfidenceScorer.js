/**
 * @fileoverview Quality Confidence Scorer - Évaluation qualité des réponses
 * Module d'évaluation intelligente avec scoring multifactoriel et apprentissage
 * @module QualityConfidenceScorer
 * @version 1.0.0 - Phase 2 Intelligent Systems
 * RÈGLES ANTI-FAKE: Scoring basé métriques mesurées, apprentissage des patterns qualité
 */

import { EventEmitter } from 'events';

/**
 * Analyseur de cohérence des réponses
 * ANTI-FAKE: Évaluation basée structure linguistique mesurable
 */
class ResponseCoherenceAnalyzer {
  constructor(config = {}) {
    this.config = {
      minCoherenceLength: config.minCoherenceLength || 20,
      maxAnalysisLength: config.maxAnalysisLength || 5000,
      coherenceThreshold: config.coherenceThreshold || 0.6,
      ...config
    };
    
    // Patterns de cohérence détectables
    this.coherencePatterns = {
      LOGICAL_FLOW: /^(d'abord|premièrement|ensuite|puis|enfin|finalement|en conclusion)/i,
      CAUSAL_LINKS: /(parce que|car|donc|ainsi|par conséquent|en raison de)/i,
      STRUCTURAL_MARKERS: /(par exemple|notamment|cependant|néanmoins|toutefois|de plus)/i,
      TECHNICAL_INDICATORS: /(fonction|méthode|algorithme|processus|système|architecture)/i,
      BUSINESS_INDICATORS: /(stratégie|objectif|performance|résultat|opportunité|marché)/i
    };
  }

  /**
   * Analyse cohérence linguistique de la réponse
   * Source: Structure grammaticale et sémantique mesurée
   */
  analyzeCoherence(responseText, context) {
    if (!responseText || responseText.length < this.config.minCoherenceLength) {
      return {
        status: "insufficient_content",
        coherenceScore: 0.1,
        reason: "text_too_short",
        confidence: 0.9,
        timestamp: Date.now()
      };
    }

    const analysis = {
      textLength: responseText.length,
      sentenceCount: 0,
      paragraphCount: 0,
      coherenceIndicators: {},
      structuralQuality: 0,
      contextAlignment: 0,
      source: "coherence_analysis"
    };

    // Analyse structure basique
    analysis.sentenceCount = this.countSentences(responseText);
    analysis.paragraphCount = this.countParagraphs(responseText);
    
    // Détection patterns de cohérence
    analysis.coherenceIndicators = this.detectCoherencePatterns(responseText);
    
    // Évaluation qualité structurelle
    analysis.structuralQuality = this.assessStructuralQuality(analysis);
    
    // Alignement avec contexte
    analysis.contextAlignment = this.assessContextAlignment(responseText, context);
    
    // Score composite
    const coherenceScore = this.calculateCoherenceScore(analysis);

    return {
      status: "measured",
      coherenceScore,
      analysis,
      confidence: this.calculateAnalysisConfidence(analysis),
      source: "response_coherence_analyzer",
      timestamp: Date.now()
    };
  }

  countSentences(text) {
    // Compte les phrases basé sur ponctuation
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.length;
  }

  countParagraphs(text) {
    // Compte les paragraphes basé sur retours ligne
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    return Math.max(1, paragraphs.length);
  }

  detectCoherencePatterns(text) {
    const indicators = {};
    
    for (const [patternName, regex] of Object.entries(this.coherencePatterns)) {
      const matches = text.match(new RegExp(regex.source, 'gi')) || [];
      indicators[patternName] = {
        count: matches.length,
        density: matches.length / this.countSentences(text),
        examples: matches.slice(0, 3) // Garder quelques exemples
      };
    }

    return indicators;
  }

  assessStructuralQuality(analysis) {
    let quality = 0;
    
    // Longueur appropriée
    const lengthScore = Math.min(1, Math.max(0.1, analysis.textLength / 200)); // 200 chars optimal
    quality += lengthScore * 0.3;
    
    // Diversité des phrases
    if (analysis.sentenceCount > 1) {
      const avgSentenceLength = analysis.textLength / analysis.sentenceCount;
      const sentenceDiversityScore = Math.min(1, avgSentenceLength / 50); // 50 chars par phrase optimal
      quality += sentenceDiversityScore * 0.3;
    }
    
    // Structure en paragraphes
    if (analysis.paragraphCount > 1 && analysis.textLength > 300) {
      quality += 0.2; // Bonus pour structure multi-paragraphes
    }
    
    // Présence d'indicateurs de cohérence
    const totalIndicators = Object.values(analysis.coherenceIndicators)
      .reduce((sum, indicator) => sum + indicator.count, 0);
    const indicatorScore = Math.min(1, totalIndicators / 3); // 3+ indicateurs optimal
    quality += indicatorScore * 0.2;

    return Math.min(1, quality);
  }

  assessContextAlignment(responseText, context) {
    if (!context || !context.patterns) {
      return 0.5; // Neutre si pas de contexte
    }

    let alignment = 0;
    
    // Alignement avec type de contexte
    const contextType = context.patterns.primaryType;
    if (contextType && this.coherencePatterns[`${contextType}_INDICATORS`]) {
      const typePattern = this.coherencePatterns[`${contextType}_INDICATORS`];
      const matches = responseText.match(new RegExp(typePattern.source, 'gi')) || [];
      if (matches.length > 0) {
        alignment += 0.4;
      }
    }

    // Alignement avec mots-clés du contexte
    if (context.patterns.keywords) {
      const contextKeywords = Object.keys(context.patterns.keywords);
      const responseWords = new Set(responseText.toLowerCase().split(/\s+/));
      
      const matchedKeywords = contextKeywords.filter(keyword => 
        responseWords.has(keyword.toLowerCase())
      );
      
      const keywordAlignment = matchedKeywords.length / Math.max(1, contextKeywords.length);
      alignment += keywordAlignment * 0.6;
    }

    return Math.min(1, alignment);
  }

  calculateCoherenceScore(analysis) {
    const weights = {
      structural: 0.4,
      contextual: 0.4,
      linguistic: 0.2
    };

    const score = (
      analysis.structuralQuality * weights.structural +
      analysis.contextAlignment * weights.contextual +
      this.calculateLinguisticScore(analysis) * weights.linguistic
    );

    return Math.max(0.1, Math.min(1, score));
  }

  calculateLinguisticScore(analysis) {
    // Score basé sur diversité et richesse linguistique
    const totalIndicators = Object.values(analysis.coherenceIndicators)
      .reduce((sum, indicator) => sum + indicator.count, 0);
    
    const varietyScore = Math.min(1, Object.keys(analysis.coherenceIndicators)
      .filter(key => analysis.coherenceIndicators[key].count > 0).length / 5);
    
    const densityScore = Math.min(1, totalIndicators / analysis.sentenceCount);
    
    return (varietyScore * 0.6 + densityScore * 0.4);
  }

  calculateAnalysisConfidence(analysis) {
    // Confidence basée sur quantité de données analysées
    const lengthFactor = Math.min(1, analysis.textLength / 100);
    const structureFactor = analysis.sentenceCount > 2 ? 0.8 : 0.5;
    const indicatorFactor = Object.values(analysis.coherenceIndicators)
      .some(indicator => indicator.count > 0) ? 0.7 : 0.3;

    return (lengthFactor * 0.4 + structureFactor * 0.3 + indicatorFactor * 0.3);
  }
}

/**
 * Analyseur de pertinence contextuelle
 */
class ContextualRelevanceAnalyzer {
  constructor(config = {}) {
    this.config = {
      relevanceThreshold: config.relevanceThreshold || 0.6,
      keywordWeight: config.keywordWeight || 0.4,
      semanticWeight: config.semanticWeight || 0.6,
      ...config
    };
  }

  /**
   * Évalue pertinence de la réponse par rapport au contexte
   * Source: Analyse sémantique et correspondance patterns
   */
  analyzeRelevance(responseText, originalContext) {
    if (!originalContext || !originalContext.input) {
      return {
        status: "no_context",
        relevanceScore: 0.5,
        confidence: 0.2,
        timestamp: Date.now()
      };
    }

    const analysis = {
      inputLength: originalContext.input.text?.length || 0,
      responseLength: responseText.length,
      keywordMatches: [],
      semanticSimilarity: 0,
      topicAlignment: 0,
      source: "relevance_analysis"
    };

    // Analyse correspondance mots-clés
    analysis.keywordMatches = this.findKeywordMatches(
      originalContext.input.text || '', 
      responseText,
      originalContext.patterns?.keywords || {}
    );

    // Évaluation similarité sémantique (simplified)
    analysis.semanticSimilarity = this.calculateSemanticSimilarity(
      originalContext.input.text || '',
      responseText
    );

    // Alignement topique
    analysis.topicAlignment = this.assessTopicAlignment(originalContext, responseText);

    // Score composite de pertinence
    const relevanceScore = this.calculateRelevanceScore(analysis);

    return {
      status: "measured",
      relevanceScore,
      analysis,
      confidence: this.calculateRelevanceConfidence(analysis),
      source: "contextual_relevance_analyzer", 
      timestamp: Date.now()
    };
  }

  findKeywordMatches(inputText, responseText, contextKeywords) {
    const inputWords = new Set(inputText.toLowerCase().split(/\s+/));
    const responseWords = new Set(responseText.toLowerCase().split(/\s+/));
    
    const matches = {
      directMatches: [],
      contextMatches: [],
      totalMatches: 0
    };

    // Correspondances directes input-réponse
    for (const word of inputWords) {
      if (word.length > 3 && responseWords.has(word)) {
        matches.directMatches.push(word);
      }
    }

    // Correspondances avec mots-clés contextuels
    for (const keyword of Object.keys(contextKeywords)) {
      if (responseWords.has(keyword.toLowerCase())) {
        matches.contextMatches.push(keyword);
      }
    }

    matches.totalMatches = matches.directMatches.length + matches.contextMatches.length;
    
    return matches;
  }

  calculateSemanticSimilarity(inputText, responseText) {
    // Similarité basée sur mots significatifs partagés (simplified)
    const inputSignificantWords = this.extractSignificantWords(inputText);
    const responseSignificantWords = this.extractSignificantWords(responseText);

    if (inputSignificantWords.length === 0 || responseSignificantWords.length === 0) {
      return 0.3; // Score neutre si pas assez de mots significatifs
    }

    const commonWords = inputSignificantWords.filter(word => 
      responseSignificantWords.includes(word)
    );

    const similarity = commonWords.length / Math.max(inputSignificantWords.length, responseSignificantWords.length);
    
    return Math.min(1, similarity * 2); // Boost le score car c'est une métrique conservative
  }

  extractSignificantWords(text) {
    const stopWords = new Set([
      'le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour',
      'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus',
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
      'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
  }

  assessTopicAlignment(context, responseText) {
    let alignment = 0;

    // Alignement avec type principal
    if (context.patterns?.primaryType) {
      const typeKeywords = {
        'TECHNICAL': ['code', 'fonction', 'algorithme', 'programme', 'développement', 'API', 'système'],
        'BUSINESS': ['stratégie', 'marché', 'client', 'revenus', 'opportunité', 'analyse', 'performance'],
        'QUESTION': ['réponse', 'information', 'explication', 'détails', 'comprendre'],
        'PROBLEM': ['solution', 'résoudre', 'problème', 'corriger', 'réparer', 'erreur'],
        'REQUEST': ['aide', 'assistance', 'support', 'conseil', 'recommandation']
      };

      const relevantKeywords = typeKeywords[context.patterns.primaryType] || [];
      const responseWords = responseText.toLowerCase().split(/\s+/);
      
      const matchedTypeKeywords = relevantKeywords.filter(keyword =>
        responseWords.some(word => word.includes(keyword))
      );

      alignment += Math.min(0.5, matchedTypeKeywords.length * 0.1);
    }

    // Alignement avec complexité
    if (context.complexity?.overallComplexity) {
      const expectedLength = context.complexity.overallComplexity * 300; // Plus complexe = réponse plus longue attendue
      const lengthAlignment = Math.min(1, responseText.length / expectedLength);
      alignment += lengthAlignment * 0.3;
    }

    // Bonus si réponse semble complète
    if (responseText.length > 100 && responseText.includes('.')) {
      alignment += 0.2;
    }

    return Math.min(1, alignment);
  }

  calculateRelevanceScore(analysis) {
    let score = 0;

    // Score basé sur correspondances mots-clés
    const keywordScore = Math.min(1, analysis.keywordMatches.totalMatches * 0.2);
    score += keywordScore * this.config.keywordWeight;

    // Score basé sur similarité sémantique  
    score += analysis.semanticSimilarity * this.config.semanticWeight;

    // Bonus alignement topique
    score += analysis.topicAlignment * 0.2;

    return Math.max(0.1, Math.min(1, score));
  }

  calculateRelevanceConfidence(analysis) {
    // Confidence basée sur quantité d'informations analysées
    const keywordFactor = analysis.keywordMatches.totalMatches > 0 ? 0.7 : 0.3;
    const lengthFactor = Math.min(1, analysis.responseLength / 150);
    const semanticFactor = analysis.semanticSimilarity > 0.2 ? 0.8 : 0.4;

    return (keywordFactor * 0.4 + lengthFactor * 0.3 + semanticFactor * 0.3);
  }
}

/**
 * Quality Confidence Scorer Principal
 * Évaluation complète qualité et confidence des réponses
 */
class QualityConfidenceScorer extends EventEmitter {
  constructor(dependencies = {}) {
    super();
    
    // Dependency Injection
    this.logger = dependencies.logger || console;
    this.strictMode = dependencies.strictMode !== undefined ? dependencies.strictMode : true;
    this.config = dependencies.config || {};
    
    // Initialize analyzers
    this.coherenceAnalyzer = new ResponseCoherenceAnalyzer(this.config.coherence);
    this.relevanceAnalyzer = new ContextualRelevanceAnalyzer(this.config.relevance);
    
    // Quality tracking
    this.qualityHistory = [];
    this.isInitialized = false;
    
    // Scoring weights configuration
    this.scoringWeights = {
      coherence: this.config.weights?.coherence || 0.35,
      relevance: this.config.weights?.relevance || 0.35, 
      completeness: this.config.weights?.completeness || 0.15,
      accuracy: this.config.weights?.accuracy || 0.15
    };

    this.logger.info("📏 Quality Confidence Scorer initializing...");
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.isInitialized = true;
      this.logger.info("✅ Quality Confidence Scorer initialized");
      
      this.emit("scorerReady");
    } catch (error) {
      this.logger.error("❌ Quality Scorer initialization failed:", error);
      if (this.strictMode) {
        throw error;
      }
    }
  }

  /**
   * Évalue qualité et confidence d'une réponse - SCORING MULTIFACTORIEL
   */
  async scoreResponse(responseText, originalContext, metadata = {}) {
    const startTime = Date.now();

    try {
      if (!responseText || responseText.trim().length === 0) {
        return this.createEmptyResponseScore(startTime);
      }

      // Phase 1: Analyse cohérence linguistique
      const coherenceAnalysis = this.coherenceAnalyzer.analyzeCoherence(responseText, originalContext);
      
      // Phase 2: Analyse pertinence contextuelle  
      const relevanceAnalysis = this.relevanceAnalyzer.analyzeRelevance(responseText, originalContext);
      
      // Phase 3: Évaluation complétude
      const completenessAnalysis = this.analyzeCompleteness(responseText, originalContext, metadata);
      
      // Phase 4: Estimation accuracy (basée sur métadonnées sources)
      const accuracyAnalysis = this.analyzeAccuracy(responseText, metadata);
      
      // Phase 5: Calcul score composite
      const compositeScore = this.calculateCompositeQualityScore({
        coherence: coherenceAnalysis,
        relevance: relevanceAnalysis,
        completeness: completenessAnalysis,
        accuracy: accuracyAnalysis
      });

      // Phase 6: Évaluation confidence globale
      const globalConfidence = this.calculateGlobalConfidence({
        coherence: coherenceAnalysis,
        relevance: relevanceAnalysis,
        completeness: completenessAnalysis,
        accuracy: accuracyAnalysis
      });

      const finalScore = {
        status: "scored",
        qualityScore: compositeScore.score,
        confidenceScore: globalConfidence.confidence,
        breakdown: {
          coherence: {
            score: coherenceAnalysis.coherenceScore,
            confidence: coherenceAnalysis.confidence,
            weight: this.scoringWeights.coherence
          },
          relevance: {
            score: relevanceAnalysis.relevanceScore,
            confidence: relevanceAnalysis.confidence,
            weight: this.scoringWeights.relevance
          },
          completeness: {
            score: completenessAnalysis.score,
            confidence: completenessAnalysis.confidence,
            weight: this.scoringWeights.completeness
          },
          accuracy: {
            score: accuracyAnalysis.score,
            confidence: accuracyAnalysis.confidence,
            weight: this.scoringWeights.accuracy
          }
        },
        reasoning: this.generateQualityReasoning(compositeScore, globalConfidence),
        recommendations: this.generateImprovementRecommendations({
          coherence: coherenceAnalysis,
          relevance: relevanceAnalysis,
          completeness: completenessAnalysis,
          accuracy: accuracyAnalysis
        }),
        processingTime: Date.now() - startTime,
        source: "quality_confidence_scorer",
        timestamp: Date.now()
      };

      // Track pour apprentissage futur
      this.trackQualityScore(finalScore);

      this.emit("responseScored", finalScore);

      return finalScore;

    } catch (error) {
      this.logger.error("Quality scoring failed:", error);
      
      if (this.strictMode) {
        throw error;
      }

      return this.createErrorResponseScore(error, Date.now() - startTime);
    }
  }

  analyzeCompleteness(responseText, originalContext, metadata) {
    const analysis = {
      responseLength: responseText.length,
      expectedLength: this.estimateExpectedLength(originalContext),
      structuralElements: this.countStructuralElements(responseText),
      addressesQuery: this.checkQueryAddressed(responseText, originalContext),
      source: "completeness_analysis"
    };

    // Score basé sur longueur appropriée
    const lengthScore = Math.min(1, analysis.responseLength / analysis.expectedLength);
    
    // Score basé sur éléments structurels (introduction, développement, conclusion)
    const structureScore = Math.min(1, analysis.structuralElements / 3);
    
    // Score basé sur adressage de la requête
    const queryScore = analysis.addressesQuery ? 0.8 : 0.3;

    const completenessScore = (lengthScore * 0.4 + structureScore * 0.3 + queryScore * 0.3);

    return {
      status: "measured",
      score: Math.max(0.1, Math.min(1, completenessScore)),
      analysis,
      confidence: this.calculateCompletenessConfidence(analysis),
      source: "completeness_analyzer",
      timestamp: Date.now()
    };
  }

  estimateExpectedLength(context) {
    let baseLength = 150; // Longueur de base

    // Ajuster selon complexité
    if (context?.complexity?.overallComplexity) {
      baseLength *= (1 + context.complexity.overallComplexity);
    }

    // Ajuster selon type de contexte
    switch (context?.patterns?.primaryType) {
      case 'TECHNICAL':
        baseLength *= 1.5; // Réponses techniques plus longues
        break;
      case 'BUSINESS':
        baseLength *= 1.3; // Analyses business détaillées
        break;
      case 'PROBLEM':
        baseLength *= 1.4; // Solutions détaillées
        break;
      case 'QUESTION':
        baseLength *= 1.1; // Réponses informatives
        break;
    }

    return Math.round(baseLength);
  }

  countStructuralElements(responseText) {
    let elements = 0;

    // Éléments d'introduction
    if (/^(bonjour|salut|pour répondre|concernant|à propos de)/i.test(responseText.trim())) {
      elements++;
    }

    // Éléments de développement (listes, exemples, étapes)
    if (/(premièrement|d'abord|ensuite|par exemple|notamment)/i.test(responseText)) {
      elements++;
    }

    // Éléments de conclusion
    if (/(en conclusion|pour résumer|finalement|en résumé)/i.test(responseText)) {
      elements++;
    }

    return elements;
  }

  checkQueryAddressed(responseText, context) {
    if (!context?.input?.text) return false;

    const queryWords = context.input.text.toLowerCase().split(/\s+/)
      .filter(word => word.length > 3);
    
    const responseWords = new Set(responseText.toLowerCase().split(/\s+/));
    
    const addressedWords = queryWords.filter(word => responseWords.has(word));
    
    return addressedWords.length >= Math.min(3, queryWords.length * 0.3);
  }

  calculateCompletenessConfidence(analysis) {
    const lengthFactor = Math.min(1, analysis.responseLength / 100);
    const structureFactor = analysis.structuralElements > 0 ? 0.7 : 0.4;
    const queryFactor = analysis.addressesQuery ? 0.8 : 0.5;

    return (lengthFactor * 0.4 + structureFactor * 0.3 + queryFactor * 0.3);
  }

  analyzeAccuracy(responseText, metadata) {
    // Accuracy basée sur sources et métadonnées
    let accuracyScore = 0.5; // Score neutre par défaut
    let confidence = 0.3;

    // Score basé sur source de la réponse
    if (metadata.selectedAPI) {
      switch (metadata.selectedAPI) {
        case 'openai':
          accuracyScore = 0.8;
          confidence = 0.7;
          break;
        case 'anthropic':
          accuracyScore = 0.85;
          confidence = 0.8;
          break;
        case 'google':
          accuracyScore = 0.75;
          confidence = 0.7;
          break;
        default:
          accuracyScore = 0.6;
          confidence = 0.5;
      }
    }

    // Ajustement basé sur qualité API rapportée
    if (metadata.quality && typeof metadata.quality === 'number') {
      accuracyScore = (accuracyScore + metadata.quality) / 2;
      confidence = Math.min(0.9, confidence + 0.1);
    }

    // Pénalité si réponse de fallback
    if (metadata.selectedAPI === 'fallback' || metadata.error) {
      accuracyScore = 0.2;
      confidence = 0.8; // High confidence that it's low accuracy
    }

    return {
      status: "estimated",
      score: accuracyScore,
      confidence,
      factors: {
        sourceAPI: metadata.selectedAPI,
        reportedQuality: metadata.quality,
        hasError: !!metadata.error
      },
      source: "accuracy_analyzer",
      timestamp: Date.now()
    };
  }

  calculateCompositeQualityScore(analyses) {
    let weightedSum = 0;
    let totalWeight = 0;
    const contributors = [];

    // Coherence contribution
    if (analyses.coherence.status === "measured") {
      const weight = this.scoringWeights.coherence * analyses.coherence.confidence;
      weightedSum += analyses.coherence.coherenceScore * weight;
      totalWeight += weight;
      contributors.push({
        factor: "coherence",
        score: analyses.coherence.coherenceScore,
        weight: weight,
        confidence: analyses.coherence.confidence
      });
    }

    // Relevance contribution
    if (analyses.relevance.status === "measured") {
      const weight = this.scoringWeights.relevance * analyses.relevance.confidence;
      weightedSum += analyses.relevance.relevanceScore * weight;
      totalWeight += weight;
      contributors.push({
        factor: "relevance",
        score: analyses.relevance.relevanceScore,
        weight: weight,
        confidence: analyses.relevance.confidence
      });
    }

    // Completeness contribution
    if (analyses.completeness.status === "measured") {
      const weight = this.scoringWeights.completeness * analyses.completeness.confidence;
      weightedSum += analyses.completeness.score * weight;
      totalWeight += weight;
      contributors.push({
        factor: "completeness",
        score: analyses.completeness.score,
        weight: weight,
        confidence: analyses.completeness.confidence
      });
    }

    // Accuracy contribution
    if (analyses.accuracy.status === "estimated") {
      const weight = this.scoringWeights.accuracy * analyses.accuracy.confidence;
      weightedSum += analyses.accuracy.score * weight;
      totalWeight += weight;
      contributors.push({
        factor: "accuracy",
        score: analyses.accuracy.score,
        weight: weight,
        confidence: analyses.accuracy.confidence
      });
    }

    const finalScore = totalWeight > 0 ? weightedSum / totalWeight : 0.3;

    return {
      score: Math.max(0.1, Math.min(1, finalScore)),
      contributors,
      totalWeight,
      method: "weighted_composite_scoring",
      confidence: totalWeight > 0.5 ? 0.8 : 0.4
    };
  }

  calculateGlobalConfidence(analyses) {
    const confidenceValues = Object.values(analyses)
      .filter(analysis => analysis.confidence !== undefined)
      .map(analysis => analysis.confidence);

    if (confidenceValues.length === 0) {
      return { confidence: 0.1, reason: "no_confidence_data" };
    }

    // Confidence globale = moyenne pondérée des confidences individuelles
    const avgConfidence = confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length;
    
    // Boost si tous les analyseurs sont confiants
    const allHighConfidence = confidenceValues.every(conf => conf > 0.7);
    const confidenceBoost = allHighConfidence ? 0.1 : 0;

    return {
      confidence: Math.min(0.95, avgConfidence + confidenceBoost),
      contributorCount: confidenceValues.length,
      avgIndividualConfidence: avgConfidence,
      allHighConfidence,
      reason: "composite_confidence_calculation"
    };
  }

  generateQualityReasoning(compositeScore, globalConfidence) {
    const score = compositeScore.score;
    const confidence = globalConfidence.confidence;
    
    let reasoning = `Quality score: ${(score * 100).toFixed(1)}% (confidence: ${(confidence * 100).toFixed(1)}%). `;

    // Analyse des forces
    const strongFactors = compositeScore.contributors.filter(c => c.score > 0.7);
    const weakFactors = compositeScore.contributors.filter(c => c.score < 0.5);

    if (strongFactors.length > 0) {
      const strongNames = strongFactors.map(f => f.factor).join(', ');
      reasoning += `Strong performance in: ${strongNames}. `;
    }

    if (weakFactors.length > 0) {
      const weakNames = weakFactors.map(f => f.factor).join(', ');
      reasoning += `Areas for improvement: ${weakNames}. `;
    }

    // Évaluation globale
    if (score > 0.8) {
      reasoning += "Excellent response quality.";
    } else if (score > 0.6) {
      reasoning += "Good response quality with room for improvement.";
    } else if (score > 0.4) {
      reasoning += "Moderate response quality, several areas need attention.";
    } else {
      reasoning += "Poor response quality, significant improvement needed.";
    }

    return reasoning.trim();
  }

  generateImprovementRecommendations(analyses) {
    const recommendations = [];

    // Recommendations basées sur scores faibles
    if (analyses.coherence.coherenceScore < 0.6) {
      recommendations.push({
        area: "coherence",
        issue: "Poor linguistic structure",
        suggestion: "Improve sentence flow, use transition words, organize in paragraphs",
        priority: "high"
      });
    }

    if (analyses.relevance.relevanceScore < 0.6) {
      recommendations.push({
        area: "relevance", 
        issue: "Low contextual alignment",
        suggestion: "Address query keywords more directly, stay on topic",
        priority: "high"
      });
    }

    if (analyses.completeness.score < 0.6) {
      recommendations.push({
        area: "completeness",
        issue: "Incomplete response",
        suggestion: "Provide more detailed explanation, add examples or steps",
        priority: "medium"
      });
    }

    if (analyses.accuracy.score < 0.6) {
      recommendations.push({
        area: "accuracy",
        issue: "Questionable accuracy",
        suggestion: "Verify information sources, use more reliable APIs",
        priority: "high"
      });
    }

    // Recommendations générales si score global faible
    const avgScore = Object.values(analyses).reduce((sum, a) => sum + (a.score || a.coherenceScore || a.relevanceScore || 0.5), 0) / 4;
    if (avgScore < 0.5) {
      recommendations.push({
        area: "overall",
        issue: "Generally poor response quality",
        suggestion: "Consider regenerating response, check context understanding",
        priority: "critical"
      });
    }

    return recommendations;
  }

  trackQualityScore(scoreResult) {
    this.qualityHistory.push({
      score: scoreResult.qualityScore,
      confidence: scoreResult.confidenceScore,
      breakdown: { ...scoreResult.breakdown },
      timestamp: Date.now()
    });

    // Limite taille historique
    if (this.qualityHistory.length > 1000) {
      this.qualityHistory = this.qualityHistory.slice(-1000);
    }
  }

  createEmptyResponseScore(startTime) {
    return {
      status: "empty_response",
      qualityScore: 0.1,
      confidenceScore: 0.9, // High confidence it's poor quality
      breakdown: {
        coherence: { score: 0.1, confidence: 0.9, weight: this.scoringWeights.coherence },
        relevance: { score: 0.1, confidence: 0.9, weight: this.scoringWeights.relevance },
        completeness: { score: 0.1, confidence: 0.9, weight: this.scoringWeights.completeness },
        accuracy: { score: 0.1, confidence: 0.5, weight: this.scoringWeights.accuracy }
      },
      reasoning: "Empty or whitespace-only response",
      recommendations: [{
        area: "overall",
        issue: "No response content",
        suggestion: "Generate actual response content",
        priority: "critical"
      }],
      processingTime: Date.now() - startTime,
      source: "quality_confidence_scorer",
      timestamp: Date.now()
    };
  }

  createErrorResponseScore(error, processingTime) {
    return {
      status: "error",
      qualityScore: 0.1,
      confidenceScore: 0.1,
      error: error.message,
      reasoning: `Quality scoring failed: ${error.message}`,
      processingTime,
      source: "quality_confidence_scorer",
      timestamp: Date.now()
    };
  }

  /**
   * Get quality scoring metrics
   */
  getMetrics() {
    if (this.qualityHistory.length === 0) {
      return {
        status: "no_data",
        totalScored: 0,
        confidence: 0,
        timestamp: Date.now()
      };
    }

    const recentScores = this.qualityHistory.slice(-50); // Last 50 scores
    const avgScore = recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length;
    const avgConfidence = recentScores.reduce((sum, s) => sum + s.confidence, 0) / recentScores.length;

    // Quality distribution
    const distribution = {
      excellent: recentScores.filter(s => s.score > 0.8).length,
      good: recentScores.filter(s => s.score > 0.6 && s.score <= 0.8).length,
      moderate: recentScores.filter(s => s.score > 0.4 && s.score <= 0.6).length,
      poor: recentScores.filter(s => s.score <= 0.4).length
    };

    return {
      status: "measured",
      totalScored: this.qualityHistory.length,
      recentScored: recentScores.length,
      avgQualityScore: avgScore,
      avgConfidenceScore: avgConfidence,
      qualityDistribution: distribution,
      scoringWeights: { ...this.scoringWeights },
      confidence: Math.min(0.9, this.qualityHistory.length * 0.02),
      source: "quality_scorer_metrics",
      timestamp: Date.now()
    };
  }

  async shutdown() {
    this.logger.info("🛑 Quality Confidence Scorer shutting down...");
    
    // Clear history to free memory
    this.qualityHistory = [];
    
    this.logger.info("✅ Quality Scorer shutdown complete");
  }
}

export default QualityConfidenceScorer;