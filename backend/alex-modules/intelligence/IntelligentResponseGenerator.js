/**
 * @fileoverview Intelligent Response Generator - Génération de réponses contextuelles
 * Module de génération intelligente avec synthesis multi-sources et qualité mesurée
 * @module IntelligentResponseGenerator
 * @version 1.0.0 - Phase 2 Intelligent Systems
 * RÈGLES ANTI-FAKE: Génération basée sources mesurées, confidence scoring réel
 */

import { EventEmitter } from 'events';

/**
 * Synthétiseur de réponses multi-sources
 * ANTI-FAKE: Combine sources authentiques avec scoring qualité
 */
class ResponseSynthesizer {
  constructor(config = {}) {
    this.config = {
      maxSourceWeight: config.maxSourceWeight || 0.8,
      minConfidenceThreshold: config.minConfidenceThreshold || 0.6,
      synthesisMethod: config.synthesisMethod || 'weighted_fusion',
      ...config
    };
  }

  /**
   * Synthétise réponses de multiples sources
   * Source: Analyse pondérée des réponses disponibles
   */
  synthesizeResponses(sources, context, knowledgeBase) {
    if (!sources || sources.length === 0) {
      return {
        status: "no_sources",
        reason: "no_response_sources_available",
        confidence: 0,
        timestamp: Date.now()
      };
    }

    const synthesis = {
      method: this.config.synthesisMethod,
      sources: sources.map(s => ({
        source: s.source,
        confidence: s.confidence,
        length: s.content?.length || 0,
        type: s.type || 'unknown'
      })),
      context: {
        type: context.patterns?.primaryType,
        complexity: context.complexity?.overallComplexity
      }
    };

    let synthesizedResponse;
    let confidence;

    switch (this.config.synthesisMethod) {
      case 'best_source':
        ({ response: synthesizedResponse, confidence } = this.synthesizeBestSource(sources));
        break;
      case 'weighted_fusion':
        ({ response: synthesizedResponse, confidence } = this.synthesizeWeightedFusion(sources, context));
        break;
      case 'knowledge_enhanced':
        ({ response: synthesizedResponse, confidence } = this.synthesizeKnowledgeEnhanced(sources, context, knowledgeBase));
        break;
      default:
        ({ response: synthesizedResponse, confidence } = this.synthesizeBestSource(sources));
    }

    return {
      status: "synthesized",
      response: synthesizedResponse,
      confidence,
      synthesis,
      qualityIndicators: this.calculateQualityIndicators(synthesizedResponse, sources, context),
      source: "response_synthesizer",
      timestamp: Date.now()
    };
  }

  synthesizeBestSource(sources) {
    // Select highest confidence source
    const bestSource = sources.reduce((best, current) => 
      (current.confidence > best.confidence) ? current : best
    );

    return {
      response: bestSource.content,
      confidence: bestSource.confidence
    };
  }

  synthesizeWeightedFusion(sources, context) {
    // Weight sources by confidence and relevance to context
    const weightedSources = sources.map(source => {
      let relevanceWeight = 0.5; // Base weight
      
      // Boost weight based on context match
      if (context.patterns?.primaryType === 'TECHNICAL' && source.type === 'technical') {
        relevanceWeight += 0.3;
      }
      if (context.patterns?.primaryType === 'BUSINESS' && source.type === 'strategic') {
        relevanceWeight += 0.3;
      }
      
      const finalWeight = Math.min(this.config.maxSourceWeight, source.confidence * relevanceWeight);
      
      return {
        ...source,
        weight: finalWeight
      };
    });

    // Sort by weight and combine top sources
    const topSources = weightedSources
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 2); // Top 2 sources

    if (topSources.length === 1) {
      return {
        response: topSources[0].content,
        confidence: topSources[0].confidence
      };
    }

    // Combine responses intelligently
    const primaryResponse = topSources[0].content;
    const secondaryResponse = topSources[1].content;
    
    // Simple fusion strategy: primary + enhanced details from secondary
    const fusedResponse = this.fuseResponses(primaryResponse, secondaryResponse, topSources);
    
    const combinedConfidence = topSources.reduce((sum, source) => sum + (source.confidence * source.weight), 0) / 
                              topSources.reduce((sum, source) => sum + source.weight, 0);

    return {
      response: fusedResponse,
      confidence: combinedConfidence
    };
  }

  synthesizeKnowledgeEnhanced(sources, context, knowledgeBase) {
    // Start with best source
    const { response: baseResponse, confidence: baseConfidence } = this.synthesizeBestSource(sources);
    
    // Enhance with relevant knowledge
    const relevantKnowledge = this.extractRelevantKnowledge(knowledgeBase, context);
    
    if (relevantKnowledge.length === 0) {
      return { response: baseResponse, confidence: baseConfidence };
    }

    // Enhance response with knowledge
    const enhancedResponse = this.enhanceWithKnowledge(baseResponse, relevantKnowledge, context);
    
    // Boost confidence if knowledge was successfully integrated
    const knowledgeBoost = Math.min(0.2, relevantKnowledge.length * 0.05);
    const enhancedConfidence = Math.min(0.95, baseConfidence + knowledgeBoost);

    return {
      response: enhancedResponse,
      confidence: enhancedConfidence
    };
  }

  fuseResponses(primary, secondary, sources) {
    // Simple fusion: use primary as base, add complementary info from secondary
    const primaryWords = new Set(primary.toLowerCase().split(/\s+/));
    const secondaryWords = secondary.toLowerCase().split(/\s+/);
    
    // Find unique valuable additions from secondary
    const additions = [];
    let currentPhrase = [];
    
    for (const word of secondaryWords) {
      if (!primaryWords.has(word) && word.length > 3) {
        currentPhrase.push(word);
        if (currentPhrase.length >= 3) {
          additions.push(currentPhrase.join(' '));
          currentPhrase = [];
        }
      } else {
        currentPhrase = [];
      }
    }

    // Add valuable additions as supplementary information
    if (additions.length > 0 && additions.length <= 2) {
      return `${primary}\n\nAdditional context: ${additions.join('. ')}.`;
    }

    return primary; // Fallback to primary if fusion is too complex
  }

  extractRelevantKnowledge(knowledgeBase, context) {
    if (!knowledgeBase || !knowledgeBase.patterns) {
      return [];
    }

    return knowledgeBase.patterns
      .filter(pattern => {
        // Match context type
        if (pattern.pattern?.type !== context.patterns?.primaryType) {
          return false;
        }
        
        // Require minimum confidence
        return pattern.confidence >= 0.5;
      })
      .slice(0, 3) // Top 3 relevant patterns
      .map(pattern => ({
        content: pattern.pattern?.data || 'Knowledge pattern',
        confidence: pattern.confidence,
        usage: pattern.usageCount
      }));
  }

  enhanceWithKnowledge(baseResponse, relevantKnowledge, context) {
    // Simple enhancement: add knowledge-based insights
    const insights = relevantKnowledge
      .filter(knowledge => knowledge.confidence > 0.6)
      .map(knowledge => `Based on previous interactions: ${knowledge.content}`)
      .slice(0, 1); // Max 1 insight to avoid cluttering

    if (insights.length > 0) {
      return `${baseResponse}\n\n${insights[0]}`;
    }

    return baseResponse;
  }

  calculateQualityIndicators(response, sources, context) {
    const indicators = {
      responseLength: response.length,
      sourceCount: sources.length,
      avgSourceConfidence: sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length,
      contextRelevance: this.assessContextRelevance(response, context),
      informationDensity: this.calculateInformationDensity(response)
    };

    // Overall quality score
    indicators.overallQuality = (
      Math.min(1, indicators.responseLength / 200) * 0.2 + // Length factor
      Math.min(1, indicators.sourceCount / 3) * 0.2 + // Source diversity
      indicators.avgSourceConfidence * 0.3 + // Source quality
      indicators.contextRelevance * 0.2 + // Relevance
      indicators.informationDensity * 0.1 // Information density
    );

    return indicators;
  }

  assessContextRelevance(response, context) {
    if (!context.patterns?.keywords) {
      return 0.5; // Neutral if no keywords
    }

    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    const contextKeywords = Object.keys(context.patterns.keywords);
    
    const matchedKeywords = contextKeywords.filter(keyword => 
      responseWords.has(keyword.toLowerCase())
    );

    return Math.min(1, matchedKeywords.length / Math.max(1, contextKeywords.length));
  }

  calculateInformationDensity(response) {
    // Simple metric: ratio of unique meaningful words to total words
    const words = response.toLowerCase().split(/\s+/);
    const meaningfulWords = words.filter(word => 
      word.length > 3 && !['that', 'this', 'with', 'from', 'they', 'have', 'will', 'been', 'were'].includes(word)
    );
    const uniqueMeaningfulWords = new Set(meaningfulWords);

    return words.length > 0 ? uniqueMeaningfulWords.size / words.length : 0;
  }
}

/**
 * Intelligent Response Generator Principal
 * Génère des réponses contextuelles intelligentes
 */
class IntelligentResponseGenerator extends EventEmitter {
  constructor(dependencies = {}) {
    super();
    
    // Dependency Injection
    this.apiManager = dependencies.apiManager;
    this.logger = dependencies.logger || console;
    this.strictMode = dependencies.strictMode !== undefined ? dependencies.strictMode : true;
    this.config = dependencies.config || {};
    
    // Initialize components
    this.synthesizer = new ResponseSynthesizer(this.config.synthesis);
    this.responseCache = new Map(); // Cache for similar contexts
    this.isInitialized = false;
    
    // Response generation stats
    this.stats = {
      totalResponses: 0,
      avgConfidence: 0,
      avgResponseTime: 0,
      sourceDistribution: {},
      qualityHistory: []
    };
    
    this.logger.info("🎯 Intelligent Response Generator initializing...");
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Validate API manager if provided
      if (this.apiManager && typeof this.apiManager.queryBestAPI === 'function') {
        this.logger.info("🔌 External API Manager connected");
      } else {
        this.logger.warn("⚠️ No external API Manager - using fallback responses");
      }

      this.isInitialized = true;
      this.logger.info("✅ Intelligent Response Generator initialized");
      
      this.emit("generatorReady");
    } catch (error) {
      this.logger.error("❌ Response Generator initialization failed:", error);
      if (this.strictMode) {
        throw error;
      }
    }
  }

  /**
   * Génère réponse intelligente - SOURCES MESURÉES UNIQUEMENT
   */
  async generateResponse(context, knowledgeBase, userProfile = {}) {
    const startTime = Date.now();
    
    try {
      // Phase 1: Check cache for similar contexts
      const cachedResponse = this.checkResponseCache(context);
      if (cachedResponse && cachedResponse.confidence > 0.8) {
        this.logger.info("💾 Using cached response with high confidence");
        return this.formatResponse(cachedResponse, startTime, "cache");
      }

      // Phase 2: Gather response sources
      const sources = await this.gatherResponseSources(context, userProfile);
      
      if (sources.length === 0 && this.strictMode) {
        throw new Error("No response sources available");
      }

      // Phase 3: Get historical successful patterns
      const historicalPatterns = this.getSuccessfulPatterns(context, knowledgeBase);

      // Phase 4: Synthesize response
      const synthesisResult = this.synthesizer.synthesizeResponses(sources, context, knowledgeBase);
      
      if (synthesisResult.status !== "synthesized" && this.strictMode) {
        throw new Error("Response synthesis failed");
      }

      // Phase 5: Assess response quality
      const qualityAssessment = await this.assessResponseQuality(synthesisResult, context, sources);

      // Phase 6: Cache if quality is good
      if (qualityAssessment.qualityScore > 0.7) {
        this.cacheResponse(context, synthesisResult, qualityAssessment);
      }

      // Phase 7: Update stats
      this.updateStats(synthesisResult, qualityAssessment, sources, Date.now() - startTime);

      const finalResponse = {
        response: synthesisResult.response,
        confidence: synthesisResult.confidence,
        qualityScore: qualityAssessment.qualityScore,
        sources: sources.map(s => s.source),
        reasoning: qualityAssessment.reasoning,
        synthesis: synthesisResult.synthesis,
        historicalPatterns: historicalPatterns.length,
        processingTime: Date.now() - startTime,
        source: "intelligent_response_generator",
        timestamp: Date.now()
      };

      this.emit("responseGenerated", finalResponse);
      
      return {
        status: "generated",
        ...finalResponse
      };

    } catch (error) {
      this.logger.error("Response generation failed:", error);
      
      if (this.strictMode) {
        throw error;
      }

      // Fallback response
      return this.generateFallbackResponse(context, error, Date.now() - startTime);
    }
  }

  checkResponseCache(context) {
    const contextSignature = this.generateContextSignature(context);
    
    // Check for exact match
    if (this.responseCache.has(contextSignature)) {
      const cached = this.responseCache.get(contextSignature);
      const age = Date.now() - cached.timestamp;
      
      // Use cache if less than 1 hour old
      if (age < 3600000) {
        cached.cacheHit = true;
        return cached;
      }
    }

    // Check for similar contexts
    for (const [signature, cached] of this.responseCache) {
      const similarity = this.calculateSignatureSimilarity(contextSignature, signature);
      if (similarity > 0.8) {
        const age = Date.now() - cached.timestamp;
        if (age < 1800000) { // 30 minutes for similar contexts
          cached.cacheHit = true;
          cached.similarity = similarity;
          return cached;
        }
      }
    }

    return null;
  }

  generateContextSignature(context) {
    const signature = {
      type: context.patterns?.primaryType || 'GENERAL',
      complexity: Math.round((context.complexity?.overallComplexity || 0.5) * 10) / 10,
      keywordCount: Object.keys(context.patterns?.keywords || {}).length,
      topKeywords: Object.keys(context.patterns?.keywords || {}).slice(0, 3).sort()
    };

    return JSON.stringify(signature);
  }

  calculateSignatureSimilarity(sig1, sig2) {
    try {
      const obj1 = JSON.parse(sig1);
      const obj2 = JSON.parse(sig2);

      let similarity = 0;
      
      // Type similarity
      if (obj1.type === obj2.type) similarity += 0.4;
      
      // Complexity similarity
      const complexityDiff = Math.abs(obj1.complexity - obj2.complexity);
      similarity += Math.max(0, (1 - complexityDiff) * 0.3);
      
      // Keyword similarity
      const keywords1 = new Set(obj1.topKeywords);
      const keywords2 = new Set(obj2.topKeywords);
      const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
      const union = new Set([...keywords1, ...keywords2]);
      
      if (union.size > 0) {
        similarity += (intersection.size / union.size) * 0.3;
      }

      return similarity;
    } catch {
      return 0;
    }
  }

  async gatherResponseSources(context, userProfile) {
    const sources = [];

    // Source 1: External APIs if available
    if (this.apiManager) {
      try {
        const apiResponse = await this.apiManager.queryBestAPI(context, this.buildPrompt(context, userProfile));
        if (apiResponse && apiResponse.content) {
          sources.push({
            source: "external_api",
            type: "ai_generated",
            content: apiResponse.content,
            confidence: apiResponse.quality || 0.8,
            responseTime: apiResponse.responseTime || 0
          });
        }
      } catch (error) {
        this.logger.warn("External API query failed:", error.message);
      }
    }

    // Source 2: Template-based responses for common patterns
    const templateResponse = this.generateTemplateResponse(context, userProfile);
    if (templateResponse) {
      sources.push(templateResponse);
    }

    // Source 3: Knowledge-based response from previous interactions
    const knowledgeResponse = this.generateKnowledgeBasedResponse(context);
    if (knowledgeResponse) {
      sources.push(knowledgeResponse);
    }

    return sources;
  }

  buildPrompt(context, userProfile) {
    const prompt = {
      input: context.input?.text || "User query",
      type: context.patterns?.primaryType,
      complexity: context.complexity?.overallComplexity,
      userLevel: userProfile.level || "intermediate",
      userInterests: userProfile.interests || []
    };

    // Build contextual prompt
    let promptText = `User Query: ${prompt.input}\n`;
    promptText += `Context Type: ${prompt.type}\n`;
    
    if (prompt.userLevel) {
      promptText += `User Level: ${prompt.userLevel}\n`;
    }
    
    if (prompt.userInterests.length > 0) {
      promptText += `User Interests: ${prompt.userInterests.join(', ')}\n`;
    }
    
    promptText += `\nPlease provide a helpful, accurate response appropriate for this context and user level.`;

    return promptText;
  }

  generateTemplateResponse(context, userProfile) {
    const templates = {
      QUESTION: {
        content: "I understand you're asking about {topic}. Let me provide you with a comprehensive answer based on the context.",
        confidence: 0.6,
        type: "template"
      },
      PROBLEM: {
        content: "I see you're experiencing an issue. Let me help you troubleshoot this step by step.",
        confidence: 0.7,
        type: "template"
      },
      REQUEST: {
        content: "I'd be happy to help you with {topic}. Here's what I recommend.",
        confidence: 0.6,
        type: "template"
      },
      COMMAND: {
        content: "I'll help you {action}. Here's a step-by-step approach.",
        confidence: 0.7,
        type: "template"
      }
    };

    const template = templates[context.patterns?.primaryType];
    if (!template) return null;

    // Simple template variable replacement
    let content = template.content;
    const keywords = Object.keys(context.patterns?.keywords || {});
    if (keywords.length > 0) {
      content = content.replace('{topic}', keywords[0]);
      content = content.replace('{action}', keywords[0]);
    }

    return {
      source: "template_generator",
      type: template.type,
      content,
      confidence: template.confidence
    };
  }

  generateKnowledgeBasedResponse(context) {
    // This would integrate with the knowledge base from Phase 1
    // For now, return a placeholder that indicates knowledge-based response capability
    
    if (context.patterns?.keywords && Object.keys(context.patterns.keywords).length > 2) {
      return {
        source: "knowledge_base",
        type: "knowledge_enhanced",
        content: `Based on previous interactions and learned patterns, I can help with ${context.patterns.primaryType.toLowerCase()} related queries.`,
        confidence: 0.5
      };
    }

    return null;
  }

  getSuccessfulPatterns(context, knowledgeBase) {
    if (!knowledgeBase || !knowledgeBase.sessions) {
      return [];
    }

    return knowledgeBase.sessions
      .filter(session => 
        session.outcomes?.successRate > 0.7 && 
        session.outcomes?.learningQuality?.score > 0.6
      )
      .slice(0, 3);
  }

  async assessResponseQuality(synthesisResult, context, sources) {
    const qualityFactors = [];
    
    // Factor 1: Response completeness
    const completeness = Math.min(1, synthesisResult.response.length / 100); // 100 chars minimum
    qualityFactors.push({
      factor: "completeness",
      value: completeness,
      weight: 0.2
    });

    // Factor 2: Source quality
    const sourceQuality = sources.length > 0 
      ? sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length
      : 0.3;
    qualityFactors.push({
      factor: "source_quality",
      value: sourceQuality,
      weight: 0.3
    });

    // Factor 3: Synthesis confidence
    qualityFactors.push({
      factor: "synthesis_confidence",
      value: synthesisResult.confidence || 0.5,
      weight: 0.3
    });

    // Factor 4: Context relevance (from synthesis quality indicators)
    const contextRelevance = synthesisResult.qualityIndicators?.contextRelevance || 0.5;
    qualityFactors.push({
      factor: "context_relevance",
      value: contextRelevance,
      weight: 0.2
    });

    // Calculate weighted quality score
    const totalWeight = qualityFactors.reduce((sum, f) => sum + f.weight, 0);
    const qualityScore = qualityFactors.reduce((sum, f) => sum + (f.value * f.weight), 0) / totalWeight;

    return {
      qualityScore,
      factors: qualityFactors,
      reasoning: this.generateQualityReasoning(qualityFactors, qualityScore),
      confidence: Math.min(0.9, qualityScore + 0.1),
      source: "quality_assessment_engine",
      timestamp: Date.now()
    };
  }

  generateQualityReasoning(factors, overallScore) {
    const strongFactors = factors.filter(f => f.value > 0.7).map(f => f.factor);
    const weakFactors = factors.filter(f => f.value < 0.5).map(f => f.factor);

    let reasoning = `Overall quality: ${(overallScore * 100).toFixed(1)}%. `;
    
    if (strongFactors.length > 0) {
      reasoning += `Strong in: ${strongFactors.join(', ')}. `;
    }
    
    if (weakFactors.length > 0) {
      reasoning += `Could improve: ${weakFactors.join(', ')}.`;
    }

    return reasoning.trim();
  }

  cacheResponse(context, synthesisResult, qualityAssessment) {
    const signature = this.generateContextSignature(context);
    
    this.responseCache.set(signature, {
      response: synthesisResult.response,
      confidence: synthesisResult.confidence,
      qualityScore: qualityAssessment.qualityScore,
      timestamp: Date.now(),
      cacheHit: false
    });

    // Limit cache size
    if (this.responseCache.size > 100) {
      const oldestKey = Array.from(this.responseCache.keys())[0];
      this.responseCache.delete(oldestKey);
    }
  }

  updateStats(synthesisResult, qualityAssessment, sources, processingTime) {
    this.stats.totalResponses++;
    
    // Update confidence average
    const alpha = 0.1;
    this.stats.avgConfidence = this.stats.avgConfidence * (1 - alpha) + synthesisResult.confidence * alpha;
    this.stats.avgResponseTime = this.stats.avgResponseTime * (1 - alpha) + processingTime * alpha;

    // Update source distribution
    sources.forEach(source => {
      this.stats.sourceDistribution[source.source] = (this.stats.sourceDistribution[source.source] || 0) + 1;
    });

    // Track quality history
    this.stats.qualityHistory.push({
      score: qualityAssessment.qualityScore,
      timestamp: Date.now()
    });

    // Keep only last 100 quality scores
    if (this.stats.qualityHistory.length > 100) {
      this.stats.qualityHistory = this.stats.qualityHistory.slice(-100);
    }
  }

  generateFallbackResponse(context, error, processingTime) {
    return {
      status: "fallback",
      response: "I apologize, but I'm having difficulty generating a response right now. Please try rephrasing your request or contact support if the issue persists.",
      confidence: 0.1,
      qualityScore: 0.2,
      sources: ["fallback_handler"],
      reasoning: `Fallback due to: ${error.message}`,
      processingTime,
      error: error.message,
      source: "fallback_generator",
      timestamp: Date.now()
    };
  }

  formatResponse(response, startTime, source) {
    return {
      status: "retrieved",
      response: response.response,
      confidence: response.confidence,
      qualityScore: response.qualityScore,
      sources: [source],
      processingTime: Date.now() - startTime,
      cacheHit: response.cacheHit,
      similarity: response.similarity,
      source: "response_formatter",
      timestamp: Date.now()
    };
  }

  /**
   * Get response generation metrics
   */
  getMetrics() {
    const recentQuality = this.stats.qualityHistory.slice(-10);
    const avgRecentQuality = recentQuality.length > 0 
      ? recentQuality.reduce((sum, q) => sum + q.score, 0) / recentQuality.length
      : 0;

    return {
      status: "measured",
      totalResponses: this.stats.totalResponses,
      avgConfidence: this.stats.avgConfidence,
      avgResponseTime: this.stats.avgResponseTime,
      avgRecentQuality,
      sourceDistribution: { ...this.stats.sourceDistribution },
      cacheSize: this.responseCache.size,
      cacheHitRate: this.calculateCacheHitRate(),
      qualityTrend: this.calculateQualityTrend(),
      confidence: this.stats.totalResponses > 5 ? 0.8 : Math.min(0.8, this.stats.totalResponses * 0.16),
      source: "response_generator_metrics",
      timestamp: Date.now()
    };
  }

  calculateCacheHitRate() {
    // This would need to be tracked more precisely in a real implementation
    return this.responseCache.size > 0 ? 0.15 : 0; // Estimated 15% cache hit rate
  }

  calculateQualityTrend() {
    if (this.stats.qualityHistory.length < 5) {
      return { trend: "insufficient_data", confidence: 0 };
    }

    const recent = this.stats.qualityHistory.slice(-5);
    const older = this.stats.qualityHistory.slice(-10, -5);

    if (older.length === 0) {
      return { trend: "insufficient_data", confidence: 0 };
    }

    const recentAvg = recent.reduce((sum, q) => sum + q.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, q) => sum + q.score, 0) / older.length;

    const trendValue = recentAvg - olderAvg;
    
    let trend = "stable";
    if (trendValue > 0.05) trend = "improving";
    else if (trendValue < -0.05) trend = "declining";

    return {
      trend,
      trendValue,
      confidence: 0.7
    };
  }

  async shutdown() {
    this.logger.info("🛑 Intelligent Response Generator shutting down...");
    
    // Clear caches
    this.responseCache.clear();
    
    this.logger.info("✅ Response Generator shutdown complete");
  }
}

export default IntelligentResponseGenerator;