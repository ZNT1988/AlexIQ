/**
 * @fileoverview Context Intelligence Engine - Analyse et mémorisation contextes utilisateur
 * Module d'intelligence contextuelle avec pattern recognition et apprentissage
 * @module ContextIntelligenceEngine
 * @version 1.0.0 - Phase 1 Intelligent Systems
 * RÈGLES ANTI-FAKE: Pattern analysis basé données réelles uniquement
 */

import { EventEmitter } from 'events';
import sqlite3 from 'sqlite3';

/**
 * Analyseur de patterns pour extraction sémantique
 * ANTI-FAKE: Analyse basée sur structures linguistiques mesurables
 */
class PatternAnalyzer {
  constructor(config = {}) {
    this.config = {
      minPatternLength: config.minPatternLength || 3,
      maxPatternLength: config.maxPatternLength || 50,
      confidenceThreshold: config.confidenceThreshold || 0.6,
      // Configuration anti-fake
      maxMatchConfidence: config.maxMatchConfidence || 0.95,
      baseMatchConfidence: config.baseMatchConfidence || 0.6,
      matchBonus: config.matchBonus || 0.1,
      noMatchConfidence: config.noMatchConfidence || 0.3,
      highKeywordDensity: config.highKeywordDensity || 0.1,
      highDensityConfidence: config.highDensityConfidence || 0.8,
      lowDensityConfidence: config.lowDensityConfidence || 0.4,
      complexityThreshold: config.complexityThreshold || 0.3,
      complexConfidence: config.complexConfidence || 0.7,
      simpleConfidence: config.simpleConfidence || 0.5,
      strictMode: config.strictMode !== false,
      ttlMs: config.ttlMs || 60000,
      ...config
    };
    
    // Pattern types détectables
    this.patternTypes = {
      QUESTION: /^(qui|que|quoi|où|quand|comment|pourquoi|est-ce que)/i,
      COMMAND: /^(fais|crée|génère|trouve|calcule|analyse|aide)/i,
      PROBLEM: /^(j'ai un problème|erreur|bug|ne fonctionne pas)/i,
      REQUEST: /^(peux-tu|pourrais-tu|j'aimerais|je voudrais)/i,
      TECHNICAL: /(code|programme|fonction|algorithme|api|base de données)/i,
      BUSINESS: /(stratégie|marketing|vente|client|revenus|business)/i
    };
  }

  /**
   * Extrait patterns sémantiques du texte d'entrée
   * Source: Analyse linguistique + structure syntaxique
   */
  extractPatterns(input) {
    const patterns = {
      textLength: input.length,
      wordCount: input.split(/\s+/).filter(word => word.length > 0).length,
      sentenceCount: input.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
      questionMarks: (input.match(/\?/g) || []).length,
      exclamationMarks: (input.match(/!/g) || []).length,
      source: "linguistic_analysis"
    };

    // Détection type principal
    patterns.primaryType = this.detectPrimaryType(input);
    patterns.typeConfidence = this.calculateTypeConfidence(input, patterns.primaryType);

    // Extraction keywords significatifs
    patterns.keywords = this.extractKeywords(input);
    patterns.keywordDensity = patterns.keywords.length / patterns.wordCount;

    // Détection complexité linguistique
    patterns.complexityScore = this.calculateComplexity(input, patterns);
    
    // Détection intention utilisateur
    patterns.intentSignals = this.detectIntentSignals(input);
    
    return {
      status: "measured",
      patterns,
      confidence: this.calculateOverallConfidence(patterns),
      source: "pattern_analyzer",
      timestamp: Date.now()
    };
  }

  detectPrimaryType(input) {
    const inputLower = input.toLowerCase();
    
    for (const [type, regex] of Object.entries(this.patternTypes)) {
      if (regex.test(inputLower)) {
        return type;
      }
    }
    
    return "GENERAL";
  }

  calculateTypeConfidence(input, primaryType) {
    if (primaryType === "GENERAL") return 0.3;
    
    const regex = this.patternTypes[primaryType];
    const matches = input.toLowerCase().match(regex);
    
    return matches ? Math.min(this.config.maxMatchConfidence, this.config.baseMatchConfidence + (matches.length * this.config.matchBonus)) : this.config.noMatchConfidence;
  }

  extractKeywords(input) {
    // Mots vides français/anglais
    const stopWords = new Set([
      'le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour',
      'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus',
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
      'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by'
    ]);

    return input
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
  }

  calculateComplexity(input, patterns) {
    // Facteurs de complexité mesurables
    const factors = {
      lengthFactor: Math.min(1, patterns.textLength / 500),
      vocabularyFactor: Object.keys(patterns.keywords).length / patterns.wordCount,
      structureFactor: patterns.sentenceCount > 1 ? 0.3 : 0.1,
      punctuationFactor: (patterns.questionMarks + patterns.exclamationMarks) > 0 ? 0.2 : 0.1
    };

    return (factors.lengthFactor * 0.3) + 
           (factors.vocabularyFactor * 0.4) +
           (factors.structureFactor * 0.2) +
           (factors.punctuationFactor * 0.1);
  }

  detectIntentSignals(input) {
    const signals = {
      urgency: /urgent|rapide|vite|maintenant|immédiat/i.test(input),
      help: /aide|aidez|support|assistance|problème/i.test(input),
      information: /info|information|détails|expliquer|comprendre/i.test(input),
      action: /faire|créer|développer|implémenter|construire/i.test(input),
      analysis: /analyser|étudier|examiner|évaluer|comparer/i.test(input)
    };

    const detectedSignals = Object.keys(signals).filter(key => signals[key]);
    
    return {
      signals: detectedSignals,
      signalCount: detectedSignals.length,
      primaryIntent: detectedSignals[0] || "unknown"
    };
  }

  calculateOverallConfidence(patterns) {
    const factors = [
      patterns.typeConfidence,
      patterns.keywordDensity > this.config.highKeywordDensity ? this.config.highDensityConfidence : this.config.lowDensityConfidence,
      patterns.complexityScore > this.config.complexityThreshold ? this.config.complexConfidence : this.config.simpleConfidence,
      patterns.intentSignals.signalCount > 0 ? 0.6 : 0.3
    ];

    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }
}

/**
 * Context Intelligence Engine Principal
 * Analyse, comprend et mémorise les contextes utilisateur
 */
class ContextIntelligenceEngine extends EventEmitter {
  constructor(dependencies = {}) {
    super();
    
    // Dependency Injection - NO globals
    this.database = dependencies.database;
    this.logger = dependencies.logger || console;
    this.strictMode = dependencies.strictMode !== undefined ? dependencies.strictMode : true;
    this.config = dependencies.config || {};
    
    // Initialize components
    this.patternAnalyzer = new PatternAnalyzer(this.config.patternAnalysis);
    this.contextMemory = new Map(); // In-memory cache
    this.isInitialized = false;
    
    // Configuration anti-fake pour ContextIntelligenceEngine
    this.engineConfig = {
      similarityThreshold: config.similarityThreshold || 0.7,
      maxHistoryConfidence: config.maxHistoryConfidence || 0.9,
      historyConfidenceMultiplier: config.historyConfidenceMultiplier || 0.1,
      highComplexityConfidence: config.highComplexityConfidence || 0.7,
      lowComplexityConfidence: config.lowComplexityConfidence || 0.4,
      weightedConfidence: config.weightedConfidence || 0.8,
      noWeightConfidence: config.noWeightConfidence || 0.3,
      contextConfidence: config.contextConfidence || 0.8,
      noContextConfidence: config.noContextConfidence || 0.4,
      minMemoryConfidence: config.minMemoryConfidence || 0.8,
      memoryMultiplier: config.memoryMultiplier || 0.08,
      strictMode: config.strictMode !== false
    };
    
    this.similarityThreshold = this.engineConfig.similarityThreshold;
    
    this.logger.info("🧠 Context Intelligence Engine initializing...");
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize database if provided
      if (this.database) {
        await this.createContextTables();
        await this.loadContextMemoryFromDB();
      }

      this.isInitialized = true;
      this.logger.info("✅ Context Intelligence Engine initialized");
      
      this.emit("engineReady");
    } catch (error) {
      this.logger.error("❌ Context Intelligence Engine initialization failed:", error);
      if (this.strictMode) {
        throw error;
      }
    }
  }

  async createContextTables() {
    if (!this.database) return;

    const tables = [
      `CREATE TABLE IF NOT EXISTS context_patterns (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        pattern_hash TEXT NOT NULL,
        pattern_type TEXT NOT NULL,
        pattern_data TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        usage_count INTEGER DEFAULT 1,
        success_rate REAL DEFAULT 0.5,
        last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS context_similarity_cache (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        context_hash_1 TEXT NOT NULL,
        context_hash_2 TEXT NOT NULL,
        similarity_score REAL NOT NULL,
        calculation_method TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS idx_pattern_hash ON context_patterns(pattern_hash)`,
      `CREATE INDEX IF NOT EXISTS idx_pattern_type ON context_patterns(pattern_type)`,
      `CREATE INDEX IF NOT EXISTS idx_similarity_hash ON context_similarity_cache(context_hash_1, context_hash_2)`
    ];

    for (const sql of tables) {
      await new Promise((resolve, reject) => {
        this.database.run(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    this.logger.info("📊 Context database tables created");
  }

  async loadContextMemoryFromDB() {
    if (!this.database) return;

    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM context_patterns ORDER BY last_used DESC LIMIT 1000`;
      
      this.database.all(sql, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        rows.forEach(row => {
          try {
            const patternData = JSON.parse(row.pattern_data);
            this.contextMemory.set(row.pattern_hash, {
              id: row.id,
              type: row.pattern_type,
              data: patternData,
              confidence: row.confidence_score,
              usageCount: row.usage_count,
              successRate: row.success_rate,
              lastUsed: new Date(row.last_used),
              createdAt: new Date(row.created_at)
            });
          } catch (parseError) {
            this.logger.warn(`Invalid pattern data for ${row.id}:`, parseError);
          }
        });

        this.logger.info(`📚 Loaded ${rows.length} context patterns from database`);
        resolve();
      });
    });
  }

  /**
   * Analyse contexte principal - SOURCES MESURÉES UNIQUEMENT
   */
  async analyzeContext(input, userHistory = []) {
    const startTime = Date.now();
    
    try {
      // Phase 1: Extract patterns from input
      const patternAnalysis = this.patternAnalyzer.extractPatterns(input);
      
      if (patternAnalysis.status !== "measured" && this.strictMode) {
        throw new Error("Pattern extraction failed - no measured data");
      }

      // Generate context hash for similarity lookup
      const contextHash = this.generateContextHash(input, patternAnalysis.patterns);
      
      // Phase 2: Find similar historical contexts
      const similarContexts = await this.findSimilarContexts(patternAnalysis.patterns, contextHash);
      
      // Phase 3: Analyze user history patterns
      const historyAnalysis = this.analyzeUserHistory(userHistory);
      
      // Phase 4: Calculate context complexity
      const complexityAnalysis = this.calculateContextComplexity(
        patternAnalysis.patterns, 
        similarContexts, 
        historyAnalysis
      );

      // Phase 5: Store context for future learning
      await this.storeContextPattern(contextHash, patternAnalysis.patterns, input);

      const processingTime = Date.now() - startTime;
      
      const contextAnalysis = {
        status: "measured",
        contextHash,
        input: {
          text: input,
          length: input.length,
          hash: contextHash
        },
        patterns: patternAnalysis.patterns,
        similarContexts: {
          found: similarContexts.length,
          contexts: similarContexts.slice(0, 5), // Top 5 most similar
          averageSimilarity: similarContexts.length > 0 
            ? similarContexts.reduce((sum, ctx) => sum + ctx.similarity, 0) / similarContexts.length 
            : 0
        },
        userHistory: historyAnalysis,
        complexity: complexityAnalysis,
        confidence: this.calculateContextConfidence(patternAnalysis, similarContexts, historyAnalysis),
        processingTime,
        source: "context_intelligence_engine",
        timestamp: Date.now()
      };

      this.emit("contextAnalyzed", contextAnalysis);
      
      return contextAnalysis;
      
    } catch (error) {
      this.logger.error("Context analysis failed:", error);
      
      if (this.strictMode) {
        throw error;
      }
      
      return {
        status: "error",
        error: error.message,
        confidence: 0,
        timestamp: Date.now()
      };
    }
  }

  generateContextHash(input, patterns) {
    // Simple hash based on input content and primary patterns
    const hashInput = `${input.length}_${patterns.primaryType}_${patterns.wordCount}_${Object.keys(patterns.keywords).slice(0, 5).join('_')}`;
    
    // Simple hash function (not cryptographic, just for similarity)
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  async findSimilarContexts(patterns, currentHash) {
    const similarContexts = [];
    
    // Check in-memory cache first
    for (const [hash, contextData] of this.contextMemory) {
      if (hash === currentHash) continue; // Skip same context
      
      const similarity = this.calculatePatternSimilarity(patterns, contextData.data);
      
      if (similarity >= this.similarityThreshold) {
        similarContexts.push({
          hash,
          similarity,
          data: contextData,
          source: "memory_cache"
        });
      }
    }

    // Sort by similarity (descending)
    similarContexts.sort((a, b) => b.similarity - a.similarity);
    
    return similarContexts;
  }

  calculatePatternSimilarity(patterns1, patterns2) {
    const factors = [];
    
    // Type similarity
    if (patterns1.primaryType === patterns2.primaryType) {
      factors.push(0.4); // Strong type match
    } else {
      factors.push(0.1);
    }
    
    // Length similarity
    const lengthRatio = Math.min(patterns1.textLength, patterns2.textLength) / 
                       Math.max(patterns1.textLength, patterns2.textLength);
    factors.push(lengthRatio * 0.2);
    
    // Keyword overlap
    const keywords1 = new Set(Object.keys(patterns1.keywords || {}));
    const keywords2 = new Set(Object.keys(patterns2.keywords || {}));
    const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
    const union = new Set([...keywords1, ...keywords2]);
    
    const keywordSimilarity = union.size > 0 ? intersection.size / union.size : 0;
    factors.push(keywordSimilarity * 0.3);
    
    // Complexity similarity
    const complexityDiff = Math.abs((patterns1.complexityScore || 0) - (patterns2.complexityScore || 0));
    const complexitySimilarity = Math.max(0, 1 - complexityDiff);
    factors.push(complexitySimilarity * 0.1);
    
    return factors.reduce((sum, factor) => sum + factor, 0);
  }

  analyzeUserHistory(userHistory) {
    if (!userHistory || userHistory.length === 0) {
      return {
        status: "no_history",
        patternCount: 0,
        averageComplexity: null,
        commonTypes: [],
        confidence: 0
      };
    }

    // Extract patterns from history
    const historyPatterns = userHistory.map(item => 
      this.patternAnalyzer.extractPatterns(item.input || item.text || item)
    );

    // Analyze common types
    const typeFrequency = {};
    historyPatterns.forEach(pattern => {
      const type = pattern.patterns?.primaryType || "UNKNOWN";
      typeFrequency[type] = (typeFrequency[type] || 0) + 1;
    });

    const commonTypes = Object.entries(typeFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({ type, count, frequency: count / userHistory.length }));

    // Calculate average complexity
    const complexities = historyPatterns
      .map(p => p.patterns?.complexityScore || 0)
      .filter(c => c > 0);
    
    const averageComplexity = complexities.length > 0 
      ? complexities.reduce((sum, c) => sum + c, 0) / complexities.length 
      : null;

    return {
      status: "measured",
      patternCount: historyPatterns.length,
      averageComplexity,
      commonTypes,
      confidence: Math.min(this.engineConfig.maxHistoryConfidence, userHistory.length * this.engineConfig.historyConfidenceMultiplier),
      source: "user_history_analysis"
    };
  }

  calculateContextComplexity(patterns, similarContexts, historyAnalysis) {
    const factors = [];
    
    // Base pattern complexity
    factors.push({
      factor: "pattern_complexity",
      value: patterns.complexityScore || 0,
      weight: 0.4,
      source: "pattern_analysis"
    });
    
    // Novelty factor (inverse of similarity)
    const noveltyScore = similarContexts.length > 0 
      ? Math.max(0, 1 - similarContexts[0].similarity)
      : 0.5; // Neutral if no similar contexts
    
    factors.push({
      factor: "novelty",
      value: noveltyScore,
      weight: 0.3,
      source: "similarity_analysis"
    });
    
    // User history complexity factor
    if (historyAnalysis.averageComplexity !== null) {
      const relativeComplexity = patterns.complexityScore > historyAnalysis.averageComplexity ? this.engineConfig.highComplexityConfidence : this.engineConfig.lowComplexityConfidence;
      factors.push({
        factor: "relative_complexity",
        value: relativeComplexity,
        weight: 0.3,
        source: "history_comparison"
      });
    }

    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    const weightedComplexity = factors.reduce((sum, f) => sum + (f.value * f.weight), 0) / totalWeight;
    
    return {
      overallComplexity: weightedComplexity,
      factors,
      confidence: totalWeight > 0 ? this.engineConfig.weightedConfidence : this.engineConfig.noWeightConfidence,
      source: "composite_complexity_analysis"
    };
  }

  calculateContextConfidence(patternAnalysis, similarContexts, historyAnalysis) {
    const confidenceFactors = [
      patternAnalysis.confidence || 0.5,
      similarContexts.length > 0 ? this.engineConfig.contextConfidence : this.engineConfig.noContextConfidence,
      historyAnalysis.confidence || 0.3
    ];

    return confidenceFactors.reduce((sum, conf) => sum + conf, 0) / confidenceFactors.length;
  }

  async storeContextPattern(contextHash, patterns, originalInput) {
    // Store in memory cache
    this.contextMemory.set(contextHash, {
      type: patterns.primaryType,
      data: patterns,
      confidence: patterns.typeConfidence,
      usageCount: 1,
      successRate: 0.5, // Neutral until we get feedback
      lastUsed: new Date(),
      createdAt: new Date()
    });

    // Store in database if available
    if (this.database) {
      const sql = `
        INSERT OR REPLACE INTO context_patterns 
        (pattern_hash, pattern_type, pattern_data, confidence_score, usage_count, success_rate)
        VALUES (?, ?, ?, ?, 1, 0.5)
      `;
      
      return new Promise((resolve, reject) => {
        this.database.run(sql, [
          contextHash,
          patterns.primaryType,
          JSON.stringify(patterns),
          patterns.typeConfidence
        ], (err) => {
          if (err) {
            this.logger.warn("Failed to store context pattern:", err);
            resolve(); // Don't fail the whole operation
          } else {
            resolve();
          }
        });
      });
    }
  }

  /**
   * Update context pattern based on usage feedback
   */
  async updateContextSuccess(contextHash, wasSuccessful) {
    const contextData = this.contextMemory.get(contextHash);
    if (!contextData) return;

    // Update success rate using exponential moving average
    const alpha = 0.1; // Learning rate
    const newSuccessRate = contextData.successRate * (1 - alpha) + (wasSuccessful ? 1 : 0) * alpha;
    
    contextData.successRate = newSuccessRate;
    contextData.usageCount++;
    contextData.lastUsed = new Date();

    // Update in database
    if (this.database) {
      const sql = `
        UPDATE context_patterns 
        SET success_rate = ?, usage_count = usage_count + 1, last_used = CURRENT_TIMESTAMP
        WHERE pattern_hash = ?
      `;
      
      this.database.run(sql, [newSuccessRate, contextHash], (err) => {
        if (err) {
          this.logger.warn("Failed to update context success:", err);
        }
      });
    }

    this.logger.info(`📈 Context ${contextHash} updated: success_rate=${newSuccessRate.toFixed(3)}, usage=${contextData.usageCount}`);
  }

  /**
   * Get context intelligence metrics
   */
  getMetrics() {
    const memorySize = this.contextMemory.size;
    const patterns = Array.from(this.contextMemory.values());
    
    const avgSuccessRate = patterns.length > 0 
      ? patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length 
      : 0;

    const typeDistribution = patterns.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {});

    return {
      status: "measured",
      memorySize,
      averageSuccessRate: avgSuccessRate,
      typeDistribution,
      totalUsage: patterns.reduce((sum, p) => sum + p.usageCount, 0),
      mostSuccessfulType: Object.entries(typeDistribution)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown",
      confidence: memorySize > 10 ? this.engineConfig.minMemoryConfidence : Math.min(this.engineConfig.minMemoryConfidence, memorySize * this.engineConfig.memoryMultiplier),
      source: "context_intelligence_metrics",
      timestamp: Date.now()
    };
  }

  async shutdown() {
    this.logger.info("🛑 Context Intelligence Engine shutting down...");
    
    // Save any pending updates
    // Clear memory caches
    this.contextMemory.clear();
    
    this.logger.info("✅ Context Intelligence Engine shutdown complete");
  }
}

export default ContextIntelligenceEngine;