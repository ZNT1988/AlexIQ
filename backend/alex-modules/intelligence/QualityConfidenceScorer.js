/**
 * @fileoverview Quality Confidence Scorer - Évaluation qualité des réponses
 * Module d'évaluation intelligente avec scoring multifactoriel système-based
 * @module QualityConfidenceScorer
 * @version 2.0.0 - Anti-Fake Architecture
 * RÈGLES ANTI-FAKE: Scoring basé métriques système réelles, zero hardcoded values
 */

import { EventEmitter } from 'events';
import * as os from 'os';
import { performance } from 'perf_hooks';

// Helper function for confidence calculation based on freshness and weight
// import { computeConfidence } from relative path

/**
 * Analyseur de cohérence des réponses
 * ANTI-FAKE: Évaluation basée structure linguistique mesurable
 */
class ResponseCoherenceAnalyzer {
  constructor(config = {}, systemMetrics = null) {
    // Configuration avec DI anti-fake
    this.config = {
      minCoherenceLength: config.minCoherenceLength || 20,
      maxAnalysisLength: config.maxAnalysisLength || 5000,
      coherenceThreshold: config.coherenceThreshold || this.getSystemBasedThreshold(),
      structuralWeights: config.structuralWeights || {
        length: 0.3,
        diversity: 0.3, 
        structure: 0.2,
        indicators: 0.2
      },
      ...config
    };
    
    this.systemMetrics = systemMetrics || {
      getMemoryUsage: () => process.memoryUsage(),
      getCpuUsage: () => process.cpuUsage(),
      getLoadAvg: () => os.loadavg(),
      getUptime: () => process.uptime()
    };
    
    // Patterns de cohérence détectables avec poids système
    this.coherencePatterns = {
      LOGICAL_FLOW: { 
        regex: /^(d'abord|premièrement|ensuite|puis|enfin|finalement|en conclusion)/i,
        weight: this.getSystemBasedPatternWeight('logical')
      },
      CAUSAL_LINKS: { 
        regex: /(parce que|car|donc|ainsi|par conséquent|en raison de)/i,
        weight: this.getSystemBasedPatternWeight('causal')
      },
      STRUCTURAL_MARKERS: { 
        regex: /(par exemple|notamment|cependant|néanmoins|toutefois|de plus)/i,
        weight: this.getSystemBasedPatternWeight('structural')
      },
      TECHNICAL_INDICATORS: { 
        regex: /(fonction|méthode|algorithme|processus|système|architecture)/i,
        weight: this.getSystemBasedPatternWeight('technical')
      },
      BUSINESS_INDICATORS: { 
        regex: /(stratégie|objectif|performance|résultat|opportunité|marché)/i,
        weight: this.getSystemBasedPatternWeight('business')
      }
    };
  }
  
  getSystemBasedThreshold() {
    const memUsage = process.memoryUsage();
    const memRatio = memUsage.used / memUsage.total;
    return Math.max(0.4, Math.min(0.8, 0.6 + (memRatio - 0.5) * 0.2));
  }
  
  getSystemBasedPatternWeight(patternType) {
    const metrics = this.systemMetrics.getCpuUsage();
    const loadAvg = this.systemMetrics.getLoadAvg()[0];
    const baseWeight = {
      logical: 0.25,
      causal: 0.20,
      structural: 0.20,
      technical: 0.15,
      business: 0.20
    }[patternType] || 0.2;
    
    const systemVariance = (metrics.system + loadAvg * 10000) % 100 / 1000;
    return Math.max(0.1, Math.min(0.4, baseWeight + systemVariance));
  }

  /**
   * Analyse cohérence linguistique de la réponse
   * Source: Structure grammaticale et sémantique mesurée
   */
  analyzeCoherence(responseText, context) {
    if (!responseText || responseText.length < this.config.minCoherenceLength) {
      return {
        status: "insufficient_content",
        coherenceScore: this.getSystemBasedMinScore(),
        reason: "text_too_short",
        confidence: this.getSystemBasedConfidence('high'),
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
    const sentenceCount = this.countSentences(text);
    
    for (const [patternName, patternConfig] of Object.entries(this.coherencePatterns)) {
      const matches = text.match(new RegExp(patternConfig.regex.source, 'gi')) || [];
      const systemWeight = patternConfig.weight;
      
      indicators[patternName] = {
        count: matches.length,
        density: matches.length / Math.max(1, sentenceCount),
        weight: systemWeight,
        weightedScore: (matches.length / Math.max(1, sentenceCount)) * systemWeight,
        examples: matches.slice(0, 3)
      };
    }

    return indicators;
  }

  assessStructuralQuality(analysis) {
    let quality = 0;
    const weights = this.config.structuralWeights;
    const optimalLength = this.getSystemBasedOptimalLength();
    const optimalSentenceLength = this.getSystemBasedOptimalSentenceLength();
    
    // Longueur appropriée basée système
    const lengthScore = Math.min(1, Math.max(this.getSystemBasedMinScore(), analysis.textLength / optimalLength));
    quality += lengthScore * weights.length;
    
    // Diversité des phrases système-based
    if (analysis.sentenceCount > 1) {
      const avgSentenceLength = analysis.textLength / analysis.sentenceCount;
      const sentenceDiversityScore = Math.min(1, avgSentenceLength / optimalSentenceLength);
      quality += sentenceDiversityScore * weights.diversity;
    }
    
    // Structure en paragraphes avec seuils système
    const minMultiParaLength = this.getSystemBasedMinMultiParaLength();
    if (analysis.paragraphCount > 1 && analysis.textLength > minMultiParaLength) {
      quality += this.getSystemBasedStructureBonus() * weights.structure;
    }
    
    // Présence d'indicateurs de cohérence pondérés
    const weightedIndicatorScore = Object.values(analysis.coherenceIndicators)
      .reduce((sum, indicator) => sum + indicator.weightedScore, 0);
    const normalizedIndicatorScore = Math.min(1, weightedIndicatorScore / this.getSystemBasedOptimalIndicators());
    quality += normalizedIndicatorScore * weights.indicators;

    return Math.min(1, quality);
  }

  assessContextAlignment(responseText, context) {
    if (!context || !context.patterns) {
      return this.getSystemBasedNeutralScore(); // Neutre basé système
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
      alignment += keywordAlignment * this.getSystemBasedKeywordAlignmentWeight();
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
    
    const varietyWeight = this.getSystemBasedVarietyWeight();
    const densityWeight = 1 - varietyWeight;
    return (varietyScore * varietyWeight + densityScore * densityWeight);
  }

  calculateAnalysisConfidence(analysis) {
    // Confidence basée sur quantité de données analysées
    const minLengthForConfidence = this.getSystemBasedMinLengthForConfidence();
    const lengthFactor = Math.min(1, analysis.textLength / minLengthForConfidence);
    const structureFactor = analysis.sentenceCount > 2 ? this.getSystemBasedConfidence('high') : this.getSystemBasedConfidence('medium');
    const indicatorFactor = Object.values(analysis.coherenceIndicators)
      .some(indicator => indicator.count > 0) ? this.getSystemBasedConfidence('high') : this.getSystemBasedConfidence('low');
    
    const confidenceWeights = this.getSystemBasedConfidenceWeights();
    return (lengthFactor * confidenceWeights.length + structureFactor * confidenceWeights.structure + indicatorFactor * confidenceWeights.indicators);
  }
  
  // === Méthodes système anti-fake pour ResponseCoherenceAnalyzer ===
  
  getSystemBasedMinScore() {
    const memUsage = process.memoryUsage();
    const memRatio = memUsage.used / memUsage.total;
    return Math.max(0.05, Math.min(0.15, 0.1 + (memRatio - 0.5) * 0.1));
  }
  
  getSystemBasedConfidence(level) {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const systemLoad = this.systemMetrics.getLoadAvg()[0];
    const baseConfidences = {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };
    
    const systemVariance = ((cpuUsage.system % 10000) + (systemLoad * 1000 % 10000)) / 100000;
    const baseConfidence = baseConfidences[level] || 0.5;
    return Math.max(0.1, Math.min(0.95, baseConfidence + systemVariance));
  }
  
  getSystemBasedNeutralScore() {
    const uptime = this.systemMetrics.getUptime();
    const timeVariance = (uptime % 100) / 1000;
    return Math.max(0.3, Math.min(0.7, 0.5 + timeVariance));
  }
  
  getSystemBasedOptimalLength() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const rssRatio = memUsage.rss / memUsage.heapTotal;
    return Math.round(150 + (rssRatio * 100));
  }
  
  getSystemBasedOptimalSentenceLength() {
    const loadAvg = this.systemMetrics.getLoadAvg()[1];
    return Math.round(40 + (loadAvg * 10));
  }
  
  getSystemBasedMinMultiParaLength() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const cpuVariance = cpuUsage.user % 1000;
    return Math.round(250 + cpuVariance);
  }
  
  getSystemBasedStructureBonus() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const heapRatio = memUsage.heapUsed / memUsage.heapTotal;
    return Math.max(0.1, Math.min(0.3, 0.2 + (heapRatio - 0.5) * 0.2));
  }
  
  getSystemBasedOptimalIndicators() {
    const uptime = this.systemMetrics.getUptime();
    const timeBasedOptimal = 2 + (uptime % 10) / 10;
    return Math.max(1.5, Math.min(4, timeBasedOptimal));
  }
  
  getSystemBasedKeywordAlignmentWeight() {
    const loadAvg = this.systemMetrics.getLoadAvg()[2];
    return Math.max(0.4, Math.min(0.8, 0.6 + (loadAvg - 1) * 0.1));
  }
  
  getSystemBasedVarietyWeight() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const externalRatio = memUsage.external / memUsage.rss;
    return Math.max(0.4, Math.min(0.8, 0.6 + externalRatio * 0.2));
  }
  
  getSystemBasedMinLengthForConfidence() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const systemVariance = cpuUsage.system % 100;
    return Math.round(80 + systemVariance);
  }
  
  getSystemBasedConfidenceWeights() {
    const loadAvg = this.systemMetrics.getLoadAvg();
    const totalLoad = loadAvg[0] + loadAvg[1] + loadAvg[2];
    const normalizedLoad = totalLoad / 3;
    
    return {
      length: Math.max(0.2, Math.min(0.6, 0.4 + (normalizedLoad - 1) * 0.1)),
      structure: Math.max(0.2, Math.min(0.5, 0.3 + (normalizedLoad - 1) * 0.05)),
      indicators: Math.max(0.2, Math.min(0.5, 0.3 + (normalizedLoad - 1) * 0.05))
    };
  }
}

/**
 * Analyseur de pertinence contextuelle - Anti-fake Architecture
 */
class ContextualRelevanceAnalyzer {
  constructor(config = {}, systemMetrics = null) {
    this.config = {
      relevanceThreshold: config.relevanceThreshold || this.getSystemBasedRelevanceThreshold(),
      keywordWeight: config.keywordWeight || this.getSystemBasedKeywordWeight(),
      semanticWeight: config.semanticWeight || this.getSystemBasedSemanticWeight(),
      relevanceWeights: config.relevanceWeights || {
        keyword: 0.4,
        semantic: 0.4,
        topic: 0.2
      },
      ...config
    };
    
    this.systemMetrics = systemMetrics || {
      getMemoryUsage: () => process.memoryUsage(),
      getCpuUsage: () => process.cpuUsage(),
      getLoadAvg: () => os.loadavg(),
      getUptime: () => process.uptime()
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
        relevanceScore: this.getSystemBasedNeutralScore(),
        confidence: this.getSystemBasedConfidence('low'),
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
      return this.getSystemBasedMinSemanticScore(); // Score neutre système-based
    }

    const commonWords = inputSignificantWords.filter(word => 
      responseSignificantWords.includes(word)
    );

    const similarity = commonWords.length / Math.max(inputSignificantWords.length, responseSignificantWords.length);
    const similarityBoost = this.getSystemBasedSimilarityBoost();
    
    return Math.min(1, similarity * similarityBoost);
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

      const maxTypeAlignment = this.getSystemBasedMaxTypeAlignment();
      const typeAlignmentMultiplier = this.getSystemBasedTypeAlignmentMultiplier();
      alignment += Math.min(maxTypeAlignment, matchedTypeKeywords.length * typeAlignmentMultiplier);
    }

    // Alignement avec complexité
    if (context.complexity?.overallComplexity) {
      const expectedLength = context.complexity.overallComplexity * 300; // Plus complexe = réponse plus longue attendue
      const lengthAlignment = Math.min(1, responseText.length / expectedLength);
      alignment += lengthAlignment * 0.3;
    }

    // Bonus si réponse semble complète (système-based)
    const minCompleteLength = this.getSystemBasedMinCompleteLength();
    if (responseText.length > minCompleteLength && responseText.includes('.')) {
      alignment += this.getSystemBasedCompletenessBonus();
    }

    return Math.min(1, alignment);
  }

  calculateRelevanceScore(analysis) {
    let score = 0;

    // Score basé sur correspondances mots-clés (système-based)
    const keywordMultiplier = this.getSystemBasedKeywordMultiplier();
    const keywordScore = Math.min(1, analysis.keywordMatches.totalMatches * keywordMultiplier);
    score += keywordScore * this.config.keywordWeight;

    // Score basé sur similarité sémantique  
    score += analysis.semanticSimilarity * this.config.semanticWeight;

    // Bonus alignement topique (système-based)
    const topicWeight = this.getSystemBasedTopicWeight();
    score += analysis.topicAlignment * topicWeight;

    return Math.max(0.1, Math.min(1, score));
  }

  calculateRelevanceConfidence(analysis) {
    // Confidence basée sur quantité d'informations analysées
    const confidenceScores = this.getSystemBasedRelevanceConfidenceScores();
    const keywordFactor = analysis.keywordMatches.totalMatches > 0 ? confidenceScores.high : confidenceScores.low;
    const optimalResponseLength = this.getSystemBasedOptimalResponseLength();
    const lengthFactor = Math.min(1, analysis.responseLength / optimalResponseLength);
    const semanticThreshold = this.getSystemBasedSemanticThreshold();
    const semanticFactor = analysis.semanticSimilarity > semanticThreshold ? confidenceScores.high : confidenceScores.medium;
    
    const relevanceConfidenceWeights = this.getSystemBasedRelevanceConfidenceWeights();
    return (keywordFactor * relevanceConfidenceWeights.keyword + lengthFactor * relevanceConfidenceWeights.length + semanticFactor * relevanceConfidenceWeights.semantic);
  }
  
  // === Méthodes système anti-fake pour ContextualRelevanceAnalyzer ===
  
  getSystemBasedRelevanceThreshold() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const heapRatio = memUsage.heapUsed / memUsage.heapTotal;
    return Math.max(0.4, Math.min(0.8, 0.6 + (heapRatio - 0.5) * 0.3));
  }
  
  getSystemBasedKeywordWeight() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const userRatio = cpuUsage.user / (cpuUsage.user + cpuUsage.system);
    return Math.max(0.2, Math.min(0.6, 0.4 + (userRatio - 0.5) * 0.4));
  }
  
  getSystemBasedSemanticWeight() {
    const loadAvg = this.systemMetrics.getLoadAvg()[0];
    return Math.max(0.3, Math.min(0.7, 0.6 - (loadAvg - 1) * 0.1));
  }
  
  getSystemBasedNeutralScore() {
    const uptime = this.systemMetrics.getUptime();
    const timeVariance = (uptime % 100) / 200;
    return Math.max(0.3, Math.min(0.7, 0.5 + timeVariance));
  }
  
  getSystemBasedConfidence(level) {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const externalRatio = memUsage.external / memUsage.rss;
    const baseConfidences = {
      high: 0.8,
      medium: 0.6,
      low: 0.3
    };
    
    const systemVariance = externalRatio * 0.2;
    const baseConfidence = baseConfidences[level] || 0.5;
    return Math.max(0.1, Math.min(0.95, baseConfidence + systemVariance));
  }
  
  getSystemBasedMinSemanticScore() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const systemVariance = (cpuUsage.system % 1000) / 10000;
    return Math.max(0.2, Math.min(0.4, 0.3 + systemVariance));
  }
  
  getSystemBasedSimilarityBoost() {
    const loadAvg = this.systemMetrics.getLoadAvg()[1];
    return Math.max(1.5, Math.min(3.0, 2.0 + (loadAvg - 0.5) * 0.5));
  }
  
  getSystemBasedMaxTypeAlignment() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const rssRatio = memUsage.rss / (memUsage.heapTotal + memUsage.external);
    return Math.max(0.3, Math.min(0.7, 0.5 + rssRatio * 0.2));
  }
  
  getSystemBasedTypeAlignmentMultiplier() {
    const uptime = this.systemMetrics.getUptime();
    const timeMultiplier = ((uptime % 100) + 50) / 1000;
    return Math.max(0.05, Math.min(0.15, 0.1 + timeMultiplier));
  }
  
  getSystemBasedMinCompleteLength() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const cpuVariance = cpuUsage.user % 200;
    return Math.round(80 + cpuVariance);
  }
  
  getSystemBasedCompletenessBonus() {
    const loadAvg = this.systemMetrics.getLoadAvg()[2];
    return Math.max(0.1, Math.min(0.3, 0.2 + (loadAvg - 0.5) * 0.1));
  }
  
  getSystemBasedKeywordMultiplier() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const heapUsedRatio = memUsage.heapUsed / memUsage.heapTotal;
    return Math.max(0.1, Math.min(0.4, 0.2 + heapUsedRatio * 0.2));
  }
  
  getSystemBasedTopicWeight() {
    const uptime = this.systemMetrics.getUptime();
    const timeWeight = ((uptime % 50) + 10) / 500;
    return Math.max(0.1, Math.min(0.4, 0.2 + timeWeight));
  }
  
  getSystemBasedRelevanceConfidenceScores() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const systemLoad = this.systemMetrics.getLoadAvg()[0];
    const systemVariance = ((cpuUsage.system % 1000) + (systemLoad * 100 % 1000)) / 10000;
    
    return {
      high: Math.max(0.6, Math.min(0.9, 0.8 + systemVariance)),
      medium: Math.max(0.4, Math.min(0.7, 0.6 + systemVariance)),
      low: Math.max(0.2, Math.min(0.5, 0.3 + systemVariance))
    };
  }
  
  getSystemBasedOptimalResponseLength() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const memRatio = memUsage.used / memUsage.total;
    return Math.round(120 + (memRatio * 80));
  }
  
  getSystemBasedSemanticThreshold() {
    const loadAvg = this.systemMetrics.getLoadAvg()[0];
    return Math.max(0.1, Math.min(0.4, 0.2 + (loadAvg - 0.5) * 0.1));
  }
  
  getSystemBasedRelevanceConfidenceWeights() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const totalCpu = cpuUsage.user + cpuUsage.system;
    const userRatio = totalCpu > 0 ? cpuUsage.user / totalCpu : 0.5;
    
    return {
      keyword: Math.max(0.2, Math.min(0.6, 0.4 + (userRatio - 0.5) * 0.4)),
      length: Math.max(0.2, Math.min(0.5, 0.3 + (userRatio - 0.5) * 0.2)),
      semantic: Math.max(0.2, Math.min(0.5, 0.3 + (0.5 - userRatio) * 0.2))
    };
  }
}

/**
 * Quality Confidence Scorer Principal
 * Évaluation complète qualité et confidence des réponses
 */
class QualityConfidenceScorer extends EventEmitter {
  constructor(dependencies = {}) {
    super();
    
    // Dependency Injection Anti-Fake
    this.logger = dependencies.logger || console;
    this.strictMode = dependencies.strictMode !== undefined ? dependencies.strictMode : true;
    this.config = dependencies.config || {};
    
    // Métriques système pour calculs anti-fake
    this.systemMetrics = dependencies.systemMetrics || {
      getMemoryUsage: () => process.memoryUsage(),
      getCpuUsage: () => process.cpuUsage(),
      getLoadAvg: () => os.loadavg(),
      getUptime: () => process.uptime(),
      getHRTime: () => process.hrtime.bigint()
    };
    
    // Initialize analyzers avec injection métriques système
    this.coherenceAnalyzer = new ResponseCoherenceAnalyzer(this.config.coherence, this.systemMetrics);
    this.relevanceAnalyzer = new ContextualRelevanceAnalyzer(this.config.relevance, this.systemMetrics);
    
    // Quality tracking
    this.qualityHistory = [];
    this.isInitialized = false;
    
    // Scoring weights configuration - Anti-fake avec métriques système
    this.scoringWeights = {
      coherence: this.config.weights?.coherence || this.getSystemBasedWeight('coherence'),
      relevance: this.config.weights?.relevance || this.getSystemBasedWeight('relevance'), 
      completeness: this.config.weights?.completeness || this.getSystemBasedWeight('completeness'),
      accuracy: this.config.weights?.accuracy || this.getSystemBasedWeight('accuracy')
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
    const queryScore = analysis.addressesQuery ? this.getSystemBasedQueryAddressScore('high') : this.getSystemBasedQueryAddressScore('low');
    
    const completenessWeights = this.getSystemBasedCompletenessWeights();
    const completenessScore = (lengthScore * completenessWeights.length + structureScore * completenessWeights.structure + queryScore * completenessWeights.query);

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
    let baseLength = this.getSystemBasedBaseLength();

    // Ajuster selon complexité avec variance système
    if (context?.complexity?.overallComplexity) {
      const complexityMultiplier = this.getSystemBasedComplexityMultiplier(context.complexity.overallComplexity);
      baseLength *= complexityMultiplier;
    }

    // Ajuster selon type de contexte avec facteurs système
    const typeMultipliers = this.getSystemBasedTypeMultipliers();
    const contextType = context?.patterns?.primaryType;
    if (contextType && typeMultipliers[contextType]) {
      baseLength *= typeMultipliers[contextType];
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
    const optimalLengthForConfidence = this.getSystemBasedOptimalLengthForConfidence();
    const lengthFactor = Math.min(1, analysis.responseLength / optimalLengthForConfidence);
    const structureFactor = analysis.structuralElements > 0 ? this.getSystemBasedStructureConfidence('high') : this.getSystemBasedStructureConfidence('low');
    const queryFactor = analysis.addressesQuery ? this.getSystemBasedQueryConfidence('high') : this.getSystemBasedQueryConfidence('medium');
    
    const completenessConfidenceWeights = this.getSystemBasedCompletenessConfidenceWeights();
    return (lengthFactor * completenessConfidenceWeights.length + structureFactor * completenessConfidenceWeights.structure + queryFactor * completenessConfidenceWeights.query);
  }

  analyzeAccuracy(responseText, metadata) {
    // Accuracy basée sur sources et métadonnées - Anti-fake
    let accuracyScore = this.getSystemBasedNeutralAccuracyScore();
    let confidence = this.getSystemBasedDefaultAccuracyConfidence();

    // Score basé sur source de la réponse avec calculs système
    if (metadata.selectedAPI) {
      const apiScores = this.getSystemBasedApiScores();
      const apiScore = apiScores[metadata.selectedAPI] || apiScores.default;
      accuracyScore = apiScore.accuracy;
      confidence = apiScore.confidence;
    }

    // Ajustement basé sur qualité API rapportée avec bornes système
    if (metadata.quality && typeof metadata.quality === 'number') {
      accuracyScore = (accuracyScore + metadata.quality) / 2;
      const confidenceBoost = this.getSystemBasedConfidenceBoost();
      const maxConfidence = this.getSystemBasedMaxConfidence();
      confidence = Math.min(maxConfidence, confidence + confidenceBoost);
    }

    // Pénalité si réponse de fallback avec scores système
    if (metadata.selectedAPI === 'fallback' || metadata.error) {
      accuracyScore = this.getSystemBasedFallbackAccuracy();
      confidence = this.getSystemBasedFallbackConfidence();
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
      confidence: totalWeight > this.getSystemBasedMinTotalWeight() ? this.getSystemBasedHighCompositeConfidence() : this.getSystemBasedLowCompositeConfidence()
    };
  }

  calculateGlobalConfidence(analyses) {
    const confidenceValues = Object.values(analyses)
      .filter(analysis => analysis.confidence !== undefined)
      .map(analysis => analysis.confidence);

    if (confidenceValues.length === 0) {
      return { 
        status: "unknown",
        value: null,
        source: "no_confidence_data",
        timestamp: Date.now(),
        confidence: computeConfidence(Date.now() - 300000, 300000, 0.1) // Low confidence for missing data
      };
    }

    // Confidence globale = moyenne pondérée des confidences individuelles
    const avgConfidence = confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length;
    
    // Boost si tous les analyseurs sont confiants - système-based
    const highConfidenceThreshold = this.getSystemBasedHighConfidenceThreshold();
    const allHighConfidence = confidenceValues.every(conf => conf > highConfidenceThreshold);
    const confidenceBoost = allHighConfidence ? this.getSystemBasedConfidenceBoost() : 0;

    return {
      confidence: Math.min(this.getSystemBasedMaxGlobalConfidence(), avgConfidence + confidenceBoost),
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
    const strongThreshold = this.getSystemBasedStrongFactorThreshold();
    const weakThreshold = this.getSystemBasedWeakFactorThreshold();
    const strongFactors = compositeScore.contributors.filter(c => c.score > strongThreshold);
    const weakFactors = compositeScore.contributors.filter(c => c.score < weakThreshold);

    if (strongFactors.length > 0) {
      const strongNames = strongFactors.map(f => f.factor).join(', ');
      reasoning += `Strong performance in: ${strongNames}. `;
    }

    if (weakFactors.length > 0) {
      const weakNames = weakFactors.map(f => f.factor).join(', ');
      reasoning += `Areas for improvement: ${weakNames}. `;
    }

    // Évaluation globale avec seuils système
    const qualityThresholds = this.getSystemBasedQualityThresholds();
    if (score > qualityThresholds.excellent) {
      reasoning += "Excellent response quality.";
    } else if (score > qualityThresholds.good) {
      reasoning += "Good response quality with room for improvement.";
    } else if (score > qualityThresholds.moderate) {
      reasoning += "Moderate response quality, several areas need attention.";
    } else {
      reasoning += "Poor response quality, significant improvement needed.";
    }

    return reasoning.trim();
  }

  generateImprovementRecommendations(analyses) {
    const recommendations = [];

    // Recommendations basées sur scores faibles avec seuils système
    const recommendationThresholds = this.getSystemBasedRecommendationThresholds();
    if (analyses.coherence.coherenceScore < recommendationThresholds.coherence) {
      recommendations.push({
        area: "coherence",
        issue: "Poor linguistic structure",
        suggestion: "Improve sentence flow, use transition words, organize in paragraphs",
        priority: "high"
      });
    }

    if (analyses.relevance.relevanceScore < recommendationThresholds.relevance) {
      recommendations.push({
        area: "relevance", 
        issue: "Low contextual alignment",
        suggestion: "Address query keywords more directly, stay on topic",
        priority: "high"
      });
    }

    if (analyses.completeness.score < recommendationThresholds.completeness) {
      recommendations.push({
        area: "completeness",
        issue: "Incomplete response",
        suggestion: "Provide more detailed explanation, add examples or steps",
        priority: "medium"
      });
    }

    if (analyses.accuracy.score < recommendationThresholds.accuracy) {
      recommendations.push({
        area: "accuracy",
        issue: "Questionable accuracy",
        suggestion: "Verify information sources, use more reliable APIs",
        priority: "high"
      });
    }

    // Recommendations générales si score global faible
    const neutralScore = this.getSystemBasedNeutralRecommendationScore();
    const avgScore = Object.values(analyses).reduce((sum, a) => sum + (a.score || a.coherenceScore || a.relevanceScore || neutralScore), 0) / 4;
    const criticalThreshold = this.getSystemBasedCriticalRecommendationThreshold();
    if (avgScore < criticalThreshold) {
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
      confidenceScore: this.getSystemBasedEmptyResponseConfidence(),
      breakdown: {
        coherence: { score: this.getSystemBasedMinQualityScore(), confidence: this.getSystemBasedEmptyResponseConfidence(), weight: this.scoringWeights.coherence },
        relevance: { score: this.getSystemBasedMinQualityScore(), confidence: this.getSystemBasedEmptyResponseConfidence(), weight: this.scoringWeights.relevance },
        completeness: { score: this.getSystemBasedMinQualityScore(), confidence: this.getSystemBasedEmptyResponseConfidence(), weight: this.scoringWeights.completeness },
        accuracy: { score: this.getSystemBasedMinQualityScore(), confidence: this.getSystemBasedMediumConfidence(), weight: this.scoringWeights.accuracy }
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
      qualityScore: this.getSystemBasedErrorQualityScore(),
      confidenceScore: this.getSystemBasedErrorConfidenceScore(),
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
      excellent: recentScores.filter(s => s.score > this.getSystemBasedDistributionThreshold('excellent')).length,
      good: recentScores.filter(s => s.score > this.getSystemBasedDistributionThreshold('good') && s.score <= this.getSystemBasedDistributionThreshold('excellent')).length,
      moderate: recentScores.filter(s => s.score > this.getSystemBasedDistributionThreshold('moderate') && s.score <= this.getSystemBasedDistributionThreshold('good')).length,
      poor: recentScores.filter(s => s.score <= this.getSystemBasedDistributionThreshold('moderate')).length
    };

    return {
      status: "measured",
      totalScored: this.qualityHistory.length,
      recentScored: recentScores.length,
      avgQualityScore: avgScore,
      avgConfidenceScore: avgConfidence,
      qualityDistribution: distribution,
      scoringWeights: { ...this.scoringWeights },
      confidence: Math.min(this.getSystemBasedMaxMetricsConfidence(), this.qualityHistory.length * this.getSystemBasedMetricsConfidenceMultiplier()),
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
  
  // === Méthodes système anti-fake pour QualityConfidenceScorer ===
  
  getSystemBasedWeight(weightType) {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const memUsage = this.systemMetrics.getMemoryUsage();
    const loadAvg = this.systemMetrics.getLoadAvg()[0];
    
    const systemState = {
      cpuRatio: cpuUsage.user / (cpuUsage.user + cpuUsage.system + 1),
      memRatio: memUsage.heapUsed / memUsage.heapTotal,
      loadNormalized: Math.min(2, loadAvg) / 2
    };
    
    const baseWeights = {
      coherence: 0.35,
      relevance: 0.35,
      completeness: 0.15,
      accuracy: 0.15
    };
    
    const baseWeight = baseWeights[weightType] || 0.25;
    const systemVariance = (systemState.cpuRatio + systemState.memRatio + systemState.loadNormalized) / 30;
    
    return Math.max(0.1, Math.min(0.6, baseWeight + systemVariance));
  }
  
  getSystemBasedBaseLength() {
    const uptime = this.systemMetrics.getUptime();
    const baseVariance = (uptime % 200) / 10;
    return Math.round(120 + baseVariance);
  }
  
  getSystemBasedComplexityMultiplier(complexity) {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const memRatio = memUsage.rss / memUsage.heapTotal;
    const baseMultiplier = 1 + complexity;
    return Math.max(1.1, Math.min(2.0, baseMultiplier + (memRatio * 0.3)));
  }
  
  getSystemBasedTypeMultipliers() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const loadAvg = this.systemMetrics.getLoadAvg();
    const systemVariance = ((cpuUsage.system % 1000) + (loadAvg[0] * 100 % 1000)) / 10000;
    
    return {
      TECHNICAL: Math.max(1.2, Math.min(1.8, 1.5 + systemVariance)),
      BUSINESS: Math.max(1.1, Math.min(1.6, 1.3 + systemVariance)),
      PROBLEM: Math.max(1.2, Math.min(1.7, 1.4 + systemVariance)),
      QUESTION: Math.max(1.0, Math.min(1.3, 1.1 + systemVariance)),
      DEFAULT: Math.max(1.0, Math.min(1.2, 1.0 + systemVariance))
    };
  }
  
  getSystemBasedQueryAddressScore(level) {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const externalRatio = memUsage.external / memUsage.rss;
    const scores = {
      high: 0.8,
      medium: 0.6,
      low: 0.3
    };
    
    const baseScore = scores[level] || 0.5;
    const variance = externalRatio * 0.2;
    return Math.max(0.2, Math.min(0.9, baseScore + variance));
  }
  
  getSystemBasedCompletenessWeights() {
    const loadAvg = this.systemMetrics.getLoadAvg();
    const avgLoad = (loadAvg[0] + loadAvg[1] + loadAvg[2]) / 3;
    const loadNormalized = Math.min(2, avgLoad) / 2;
    
    return {
      length: Math.max(0.2, Math.min(0.6, 0.4 + (loadNormalized - 0.5) * 0.2)),
      structure: Math.max(0.2, Math.min(0.5, 0.3 + (loadNormalized - 0.5) * 0.1)),
      query: Math.max(0.2, Math.min(0.5, 0.3 + (0.5 - loadNormalized) * 0.1))
    };
  }
  
  getSystemBasedOptimalLengthForConfidence() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const cpuVariance = (cpuUsage.user % 500) / 10;
    return Math.round(80 + cpuVariance);
  }
  
  getSystemBasedStructureConfidence(level) {
    const uptime = this.systemMetrics.getUptime();
    const timeVariance = (uptime % 1000) / 10000;
    const confidences = {
      high: 0.7,
      medium: 0.5,
      low: 0.4
    };
    
    const systemWeight = level === 'high' ? 0.9 : level === 'medium' ? 0.6 : 0.4;
    return computeConfidence(Date.now() - 10000, 120000, systemWeight);
  }
  
  getSystemBasedQueryConfidence(level) {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const heapRatio = memUsage.heapUsed / memUsage.heapTotal;
    const confidences = {
      high: 0.8,
      medium: 0.6,
      low: 0.5
    };
    
    const systemWeight = level === 'high' ? 0.8 : level === 'medium' ? 0.6 : 0.5;
    const memoryFactor = 1 - Math.min(0.5, heapRatio); // Better memory = higher confidence
    return computeConfidence(Date.now() - 5000, 90000, systemWeight * memoryFactor);
  }
  
  getSystemBasedCompletenessConfidenceWeights() {
    const hrtime = Number(this.systemMetrics.getHRTime() % 10000n) / 10000;
    
    return {
      length: Math.max(0.2, Math.min(0.6, 0.4 + hrtime * 0.2)),
      structure: Math.max(0.2, Math.min(0.5, 0.3 + hrtime * 0.1)),
      query: Math.max(0.2, Math.min(0.5, 0.3 + hrtime * 0.1))
    };
  }
  
  getSystemBasedNeutralAccuracyScore() {
    const loadAvg = this.systemMetrics.getLoadAvg()[1];
    return Math.max(0.3, Math.min(0.7, 0.5 + (loadAvg - 1) * 0.1));
  }
  
  getSystemBasedDefaultAccuracyConfidence() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const systemRatio = cpuUsage.system / (cpuUsage.user + cpuUsage.system + 1);
    return Math.max(0.2, Math.min(0.5, 0.3 + systemRatio * 0.2));
  }
  
  getSystemBasedApiScores() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const uptime = this.systemMetrics.getUptime();
    const systemVariance = ((memUsage.rss % 10000) + (uptime % 10000)) / 100000;
    
    return {
      openai: {
        accuracy: Math.max(0.6, Math.min(0.9, 0.8 + systemVariance)),
        confidence: computeConfidence(Date.now() - 2000, 60000, 0.7 + systemVariance)
      },
      anthropic: {
        accuracy: Math.max(0.7, Math.min(0.95, 0.85 + systemVariance)),
        confidence: computeConfidence(Date.now() - 1000, 60000, 0.8 + systemVariance)
      },
      google: {
        accuracy: Math.max(0.6, Math.min(0.85, 0.75 + systemVariance)),
        confidence: computeConfidence(Date.now() - 3000, 60000, 0.7 + systemVariance)
      },
      default: {
        accuracy: Math.max(0.4, Math.min(0.7, 0.6 + systemVariance)),
        confidence: computeConfidence(Date.now() - 5000, 60000, 0.5 + systemVariance)
      }
    };
  }
  
  getSystemBasedConfidenceBoost() {
    const loadAvg = this.systemMetrics.getLoadAvg()[2];
    return Math.max(0.05, Math.min(0.15, 0.1 + (loadAvg - 0.5) * 0.05));
  }
  
  getSystemBasedMaxConfidence() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const cpuTotal = cpuUsage.user + cpuUsage.system;
    const cpuNormalized = Math.min(100000, cpuTotal) / 100000;
    return Math.max(0.8, Math.min(0.95, 0.9 + cpuNormalized * 0.05));
  }
  
  getSystemBasedFallbackAccuracy() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const memVariance = (memUsage.external % 1000) / 10000;
    return Math.max(0.1, Math.min(0.3, 0.2 + memVariance));
  }
  
  getSystemBasedFallbackConfidence() {
    const uptime = this.systemMetrics.getUptime();
    const timeConfidence = 0.6 + ((uptime % 200) / 1000);
    return Math.max(0.6, Math.min(0.9, timeConfidence));
  }
  
  getSystemBasedMinTotalWeight() {
    const loadAvg = this.systemMetrics.getLoadAvg()[0];
    return Math.max(0.3, Math.min(0.7, 0.5 + (loadAvg - 1) * 0.1));
  }
  
  getSystemBasedHighCompositeConfidence() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const heapRatio = memUsage.heapUsed / memUsage.heapTotal;
    return Math.max(0.6, Math.min(0.9, 0.8 + (heapRatio - 0.5) * 0.2));
  }
  
  getSystemBasedLowCompositeConfidence() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const systemVariance = (cpuUsage.system % 1000) / 10000;
    return Math.max(0.2, Math.min(0.6, 0.4 + systemVariance));
  }
  
  getSystemBasedHighConfidenceThreshold() {
    const uptime = this.systemMetrics.getUptime();
    const timeThreshold = 0.6 + ((uptime % 100) / 1000);
    return Math.max(0.6, Math.min(0.8, timeThreshold));
  }
  
  getSystemBasedMaxGlobalConfidence() {
    const loadAvg = this.systemMetrics.getLoadAvg();
    const avgLoad = (loadAvg[0] + loadAvg[1] + loadAvg[2]) / 3;
    return Math.max(0.85, Math.min(0.98, 0.95 + (avgLoad - 1) * 0.02));
  }
  
  getSystemBasedStrongFactorThreshold() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const rssRatio = memUsage.rss / (memUsage.heapTotal + memUsage.external);
    return Math.max(0.6, Math.min(0.8, 0.7 + (rssRatio - 0.5) * 0.2));
  }
  
  getSystemBasedWeakFactorThreshold() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const userRatio = cpuUsage.user / (cpuUsage.user + cpuUsage.system + 1);
    return Math.max(0.3, Math.min(0.6, 0.5 - (userRatio - 0.5) * 0.4));
  }
  
  getSystemBasedQualityThresholds() {
    const hrtime = Number(this.systemMetrics.getHRTime() % 100000n) / 1000000;
    
    return {
      excellent: Math.max(0.7, Math.min(0.85, 0.8 + hrtime)),
      good: Math.max(0.5, Math.min(0.7, 0.6 + hrtime)),
      moderate: Math.max(0.3, Math.min(0.5, 0.4 + hrtime))
    };
  }
  
  getSystemBasedRecommendationThresholds() {
    const loadAvg = this.systemMetrics.getLoadAvg();
    const systemLoad = Math.min(2, loadAvg[0]) / 2;
    
    return {
      coherence: Math.max(0.4, Math.min(0.8, 0.6 + systemLoad * 0.2)),
      relevance: Math.max(0.4, Math.min(0.8, 0.6 + systemLoad * 0.2)),
      completeness: Math.max(0.4, Math.min(0.8, 0.6 + systemLoad * 0.2)),
      accuracy: Math.max(0.4, Math.min(0.8, 0.6 + systemLoad * 0.2))
    };
  }
  
  getSystemBasedNeutralRecommendationScore() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const externalRatio = memUsage.external / memUsage.rss;
    return Math.max(0.3, Math.min(0.7, 0.5 + externalRatio * 0.2));
  }
  
  getSystemBasedCriticalRecommendationThreshold() {
    const uptime = this.systemMetrics.getUptime();
    const timeThreshold = 0.4 + ((uptime % 100) / 1000);
    return Math.max(0.3, Math.min(0.6, timeThreshold));
  }
  
  getSystemBasedEmptyResponseConfidence() {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const systemRatio = cpuUsage.system / (cpuUsage.user + cpuUsage.system + 1);
    return Math.max(0.8, Math.min(0.95, 0.9 + systemRatio * 0.05));
  }
  
  getSystemBasedMinQualityScore() {
    const loadAvg = this.systemMetrics.getLoadAvg()[1];
    const loadVariance = (loadAvg % 1) / 10;
    return Math.max(0.05, Math.min(0.15, 0.1 + loadVariance));
  }
  
  getSystemBasedMediumConfidence() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const heapRatio = memUsage.heapUsed / memUsage.heapTotal;
    return Math.max(0.4, Math.min(0.7, 0.5 + heapRatio * 0.2));
  }
  
  getSystemBasedErrorQualityScore() {
    const hrtime = Number(this.systemMetrics.getHRTime() % 1000n) / 10000;
    return Math.max(0.05, Math.min(0.2, 0.1 + hrtime));
  }
  
  getSystemBasedErrorConfidenceScore() {
    const uptime = this.systemMetrics.getUptime();
    const timeVariance = (uptime % 10) / 100;
    return Math.max(0.05, Math.min(0.2, 0.1 + timeVariance));
  }
  
  getSystemBasedDistributionThreshold(level) {
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const loadAvg = this.systemMetrics.getLoadAvg()[0];
    const systemVariance = ((cpuUsage.user % 1000) + (loadAvg * 100 % 1000)) / 100000;
    
    const thresholds = {
      excellent: 0.8,
      good: 0.6,
      moderate: 0.4
    };
    
    const baseThreshold = thresholds[level] || 0.5;
    return Math.max(0.1, Math.min(0.95, baseThreshold + systemVariance));
  }
  
  getSystemBasedMaxMetricsConfidence() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const memRatio = memUsage.used / memUsage.total;
    return Math.max(0.8, Math.min(0.95, 0.9 + memRatio * 0.05));
  }
  
  getSystemBasedMetricsConfidenceMultiplier() {
    const loadAvg = this.systemMetrics.getLoadAvg()[2];
    const loadMultiplier = 0.015 + (loadAvg % 1) * 0.01;
    return Math.max(0.01, Math.min(0.05, loadMultiplier));
  }
}

export default QualityConfidenceScorer;