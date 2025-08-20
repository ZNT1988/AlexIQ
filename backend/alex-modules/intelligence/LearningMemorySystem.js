/**
 * @fileoverview Learning Memory System - Système de persistance des apprentissages
 * Module de mémoire d'apprentissage avec analyse des patterns et évolution
 * @module LearningMemorySystem
 * @version 1.0.0 - Phase 1 Intelligent Systems
 * RÈGLES ANTI-FAKE: Stockage basé données mesurées uniquement, traçabilité complète
 */

import { EventEmitter } from 'events';
import sqlite3 from 'sqlite3';

/**
 * Analyseur d'outcomes d'apprentissage
 * Évalue la qualité et l'efficacité des sessions d'apprentissage
 */
class LearningOutcomeAnalyzer {
  constructor(config = {}) {
    this.config = {
      minInteractionsForAnalysis: config.minInteractionsForAnalysis || 3,
      improvementThreshold: config.improvementThreshold || 0.1,
      confidenceDecay: config.confidenceDecay || 0.05,
      ...config
    };
  }

  /**
   * Analyse les outcomes d'une session d'apprentissage
   * Source: Métriques mesurées des interactions
   */
  analyzeLearningOutcomes(interactions) {
    if (!interactions || interactions.length === 0) {
      return {
        status: "no_data",
        reason: "no_interactions_provided",
        confidence: 0,
        timestamp: Date.now()
      };
    }

    const outcomes = {
      totalInteractions: interactions.length,
      successfulInteractions: 0,
      failedInteractions: 0,
      averageResponseTime: 0,
      complexityProgression: [],
      learningIndicators: {},
      source: "interaction_analysis"
    };

    let totalResponseTime = 0;
    const complexityScores = [];
    
    interactions.forEach((interaction, index) => {
      // Track success/failure
      if (interaction.success === true) {
        outcomes.successfulInteractions++;
      } else if (interaction.success === false) {
        outcomes.failedInteractions++;
      }

      // Track response times
      if (interaction.responseTime && typeof interaction.responseTime === 'number') {
        totalResponseTime += interaction.responseTime;
      }

      // Track complexity progression
      if (interaction.complexity && typeof interaction.complexity === 'number') {
        complexityScores.push({
          index,
          complexity: interaction.complexity,
          success: interaction.success
        });
      }

      // Extract learning indicators
      if (interaction.learningSignals) {
        Object.keys(interaction.learningSignals).forEach(signal => {
          outcomes.learningIndicators[signal] = (outcomes.learningIndicators[signal] || 0) + 1;
        });
      }
    });

    // Calculate metrics
    outcomes.successRate = outcomes.totalInteractions > 0 
      ? outcomes.successfulInteractions / outcomes.totalInteractions 
      : null;

    outcomes.averageResponseTime = outcomes.totalInteractions > 0 
      ? totalResponseTime / outcomes.totalInteractions 
      : null;

    // Analyze complexity progression
    if (complexityScores.length > 1) {
      outcomes.complexityProgression = this.analyzeComplexityProgression(complexityScores);
    }

    // Calculate learning quality score
    outcomes.learningQuality = this.calculateLearningQuality(outcomes);
    
    // Detect improvement patterns
    outcomes.improvementPatterns = this.detectImprovementPatterns(interactions);

    return {
      status: "measured",
      outcomes,
      confidence: this.calculateAnalysisConfidence(outcomes),
      source: "learning_outcome_analyzer",
      timestamp: Date.now()
    };
  }

  analyzeComplexityProgression(complexityScores) {
    const progression = {
      startComplexity: complexityScores[0].complexity,
      endComplexity: complexityScores[complexityScores.length - 1].complexity,
      averageComplexity: complexityScores.reduce((sum, item) => sum + item.complexity, 0) / complexityScores.length,
      trend: "stable"
    };

    progression.progressionRate = progression.endComplexity - progression.startComplexity;
    
    if (progression.progressionRate > 0.1) {
      progression.trend = "increasing";
    } else if (progression.progressionRate < -0.1) {
      progression.trend = "decreasing";
    }

    // Analyze success correlation with complexity
    const correlationData = complexityScores.filter(item => item.success !== undefined);
    if (correlationData.length > 0) {
      const successfulComplex = correlationData.filter(item => item.success);
      progression.complexitySuccessRate = successfulComplex.length / correlationData.length;
    }

    return progression;
  }

  calculateLearningQuality(outcomes) {
    const factors = [];
    
    // Success rate factor
    if (outcomes.successRate !== null) {
      factors.push({
        factor: "success_rate",
        value: outcomes.successRate,
        weight: 0.4
      });
    }

    // Response time improvement factor
    if (outcomes.averageResponseTime !== null) {
      // Lower response time = better quality (inverse relationship)
      const responseTimeFactor = Math.max(0, Math.min(1, 1 - (outcomes.averageResponseTime / 10000))); // 10s max
      factors.push({
        factor: "response_efficiency",
        value: responseTimeFactor,
        weight: 0.3
      });
    }

    // Complexity handling factor
    if (outcomes.complexityProgression && outcomes.complexityProgression.complexitySuccessRate !== undefined) {
      factors.push({
        factor: "complexity_handling",
        value: outcomes.complexityProgression.complexitySuccessRate,
        weight: 0.3
      });
    }

    if (factors.length === 0) {
      return {
        score: null,
        reason: "insufficient_metrics",
        confidence: 0
      };
    }

    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    const weightedScore = factors.reduce((sum, f) => sum + (f.value * f.weight), 0) / totalWeight;

    return {
      score: weightedScore,
      factors,
      confidence: factors.length / 3, // More factors = higher confidence
      source: "composite_quality_analysis"
    };
  }

  detectImprovementPatterns(interactions) {
    if (interactions.length < 3) {
      return {
        detected: false,
        reason: "insufficient_data",
        patterns: []
      };
    }

    const patterns = [];
    
    // Detect response time improvement
    const responseTimes = interactions
      .filter(i => i.responseTime && typeof i.responseTime === 'number')
      .map(i => i.responseTime);
    
    if (responseTimes.length >= 3) {
      const firstThird = responseTimes.slice(0, Math.floor(responseTimes.length / 3));
      const lastThird = responseTimes.slice(-Math.floor(responseTimes.length / 3));
      
      const avgFirst = firstThird.reduce((a, b) => a + b, 0) / firstThird.length;
      const avgLast = lastThird.reduce((a, b) => a + b, 0) / lastThird.length;
      
      if (avgFirst - avgLast > avgFirst * this.config.improvementThreshold) {
        patterns.push({
          type: "response_time_improvement",
          improvement: (avgFirst - avgLast) / avgFirst,
          confidence: 0.7
        });
      }
    }

    // Detect success rate improvement
    const firstHalf = interactions.slice(0, Math.floor(interactions.length / 2));
    const secondHalf = interactions.slice(Math.floor(interactions.length / 2));
    
    const firstSuccessRate = firstHalf.filter(i => i.success === true).length / firstHalf.length;
    const secondSuccessRate = secondHalf.filter(i => i.success === true).length / secondHalf.length;
    
    if (secondSuccessRate - firstSuccessRate > this.config.improvementThreshold) {
      patterns.push({
        type: "success_rate_improvement",
        improvement: secondSuccessRate - firstSuccessRate,
        confidence: 0.8
      });
    }

    return {
      detected: patterns.length > 0,
      patterns,
      count: patterns.length
    };
  }

  calculateAnalysisConfidence(outcomes) {
    const factors = [
      outcomes.totalInteractions >= this.config.minInteractionsForAnalysis ? 0.8 : 0.4,
      outcomes.successRate !== null ? 0.7 : 0.3,
      outcomes.complexityProgression ? 0.6 : 0.3,
      Object.keys(outcomes.learningIndicators).length > 0 ? 0.5 : 0.2
    ];

    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }
}

/**
 * Learning Memory System Principal
 * Système de persistance et analyse des apprentissages
 */
class LearningMemorySystem extends EventEmitter {
  constructor(dependencies = {}) {
    super();
    
    // Dependency Injection
    this.database = dependencies.database;
    this.logger = dependencies.logger || console;
    this.strictMode = dependencies.strictMode !== undefined ? dependencies.strictMode : true;
    this.config = dependencies.config || {};
    
    // Initialize components
    this.outcomeAnalyzer = new LearningOutcomeAnalyzer(this.config.outcomeAnalysis);
    this.knowledgePatterns = new Map(); // In-memory cache
    this.learningSessions = new Map(); // Recent sessions cache
    this.isInitialized = false;
    
    // Performance tracking
    this.stats = {
      totalSessions: 0,
      totalOutcomes: 0,
      averageLearningQuality: 0,
      knowledgePatternCount: 0
    };
    
    this.logger.info("🧠 Learning Memory System initializing...");
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      if (this.database) {
        await this.createLearningTables();
        await this.loadRecentLearningData();
      }

      this.isInitialized = true;
      this.logger.info("✅ Learning Memory System initialized");
      
      this.emit("systemReady");
    } catch (error) {
      this.logger.error("❌ Learning Memory System initialization failed:", error);
      if (this.strictMode) {
        throw error;
      }
    }
  }

  async createLearningTables() {
    if (!this.database) return;

    const tables = [
      `CREATE TABLE IF NOT EXISTS knowledge_patterns (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        pattern_type TEXT NOT NULL,
        pattern_signature TEXT NOT NULL,
        pattern_data TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        usage_count INTEGER DEFAULT 1,
        success_rate REAL DEFAULT 0.5,
        learning_source TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS learning_sessions (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        session_context TEXT NOT NULL,
        interactions_count INTEGER NOT NULL,
        learning_outcomes TEXT NOT NULL,
        knowledge_updates TEXT,
        performance_delta REAL,
        quality_score REAL,
        improvement_detected BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS contextual_memory (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        context_hash TEXT NOT NULL,
        context_data TEXT NOT NULL,
        response_history TEXT NOT NULL,
        adaptation_rules TEXT,
        relevance_score REAL DEFAULT 0.5,
        access_count INTEGER DEFAULT 1,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS idx_pattern_type ON knowledge_patterns(pattern_type)`,
      `CREATE INDEX IF NOT EXISTS idx_pattern_signature ON knowledge_patterns(pattern_signature)`,
      `CREATE INDEX IF NOT EXISTS idx_context_hash ON contextual_memory(context_hash)`,
      `CREATE INDEX IF NOT EXISTS idx_session_timestamp ON learning_sessions(created_at)`
    ];

    for (const sql of tables) {
      await new Promise((resolve, reject) => {
        this.database.run(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    this.logger.info("📊 Learning database tables created");
  }

  async loadRecentLearningData() {
    if (!this.database) return;

    // Load recent knowledge patterns
    const patternsPromise = new Promise((resolve, reject) => {
      const sql = `SELECT * FROM knowledge_patterns ORDER BY updated_at DESC LIMIT 500`;
      this.database.all(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Load recent learning sessions
    const sessionsPromise = new Promise((resolve, reject) => {
      const sql = `SELECT * FROM learning_sessions ORDER BY created_at DESC LIMIT 100`;
      this.database.all(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    try {
      const [patterns, sessions] = await Promise.all([patternsPromise, sessionsPromise]);
      
      // Load patterns into memory
      patterns.forEach(row => {
        try {
          const patternData = JSON.parse(row.pattern_data);
          this.knowledgePatterns.set(row.pattern_signature, {
            id: row.id,
            type: row.pattern_type,
            data: patternData,
            confidence: row.confidence_score,
            usageCount: row.usage_count,
            successRate: row.success_rate,
            source: row.learning_source,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
          });
        } catch (parseError) {
          this.logger.warn(`Invalid pattern data for ${row.id}:`, parseError);
        }
      });

      // Load sessions into memory
      sessions.forEach(row => {
        try {
          const outcomes = JSON.parse(row.learning_outcomes);
          this.learningSessions.set(row.id, {
            context: JSON.parse(row.session_context),
            interactionsCount: row.interactions_count,
            outcomes,
            knowledgeUpdates: row.knowledge_updates ? JSON.parse(row.knowledge_updates) : null,
            performanceDelta: row.performance_delta,
            qualityScore: row.quality_score,
            improvementDetected: row.improvement_detected === 1,
            createdAt: new Date(row.created_at)
          });
        } catch (parseError) {
          this.logger.warn(`Invalid session data for ${row.id}:`, parseError);
        }
      });

      this.stats.knowledgePatternCount = this.knowledgePatterns.size;
      this.stats.totalSessions = this.learningSessions.size;

      this.logger.info(`📚 Loaded ${patterns.length} knowledge patterns and ${sessions.length} learning sessions`);
    } catch (error) {
      this.logger.error("Failed to load learning data:", error);
      if (this.strictMode) {
        throw error;
      }
    }
  }

  /**
   * Enregistre une session d'apprentissage - SOURCES MESURÉES
   */
  async recordLearningSession(context, interactions, outcomes = null) {
    const startTime = Date.now();
    
    try {
      // Generate session ID
      const sessionId = this.generateSessionId();
      
      // Analyze outcomes if not provided
      let learningOutcomes = outcomes;
      if (!learningOutcomes) {
        const outcomeAnalysis = this.outcomeAnalyzer.analyzeLearningOutcomes(interactions);
        if (outcomeAnalysis.status !== "measured" && this.strictMode) {
          throw new Error("Outcome analysis failed - no measured data");
        }
        learningOutcomes = outcomeAnalysis.outcomes;
      }

      // Extract knowledge updates from outcomes
      const knowledgeUpdates = this.extractKnowledgeUpdates(learningOutcomes, context);
      
      // Calculate performance delta
      const performanceDelta = this.calculatePerformanceDelta(learningOutcomes, context);
      
      // Detect improvement patterns
      const improvementDetected = learningOutcomes.improvementPatterns?.detected || false;

      // Create learning record
      const learningRecord = {
        sessionId,
        context: this.serializeContext(context),
        interactionsCount: interactions.length,
        outcomes: learningOutcomes,
        knowledgeUpdates,
        performanceDelta,
        qualityScore: learningOutcomes.learningQuality?.score || null,
        improvementDetected,
        processingTime: Date.now() - startTime,
        timestamp: Date.now(),
        source: "learning_memory_system"
      };

      // Store in memory cache
      this.learningSessions.set(sessionId, learningRecord);
      
      // Store in database
      if (this.database) {
        await this.storeLearningSession(learningRecord);
      }

      // Update knowledge patterns
      await this.updateKnowledgePatterns(learningRecord);
      
      // Update stats
      this.updateStats(learningRecord);

      this.logger.info(`📝 Learning session recorded: ${sessionId}, quality=${learningRecord.qualityScore?.toFixed(3)}, delta=${performanceDelta?.toFixed(3)}`);
      
      this.emit("learningSessionRecorded", learningRecord);
      
      return {
        status: "recorded",
        sessionId,
        record: learningRecord,
        confidence: 0.9,
        source: "learning_memory_system",
        timestamp: Date.now()
      };
      
    } catch (error) {
      this.logger.error("Learning session recording failed:", error);
      
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

  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `session_${timestamp}_${random}`;
  }

  serializeContext(context) {
    // Safely serialize context, handling circular references
    try {
      return JSON.stringify(context, (key, value) => {
        if (typeof value === 'function') return '[Function]';
        if (value instanceof Date) return value.toISOString();
        return value;
      });
    } catch (error) {
      return JSON.stringify({ error: "serialization_failed", type: typeof context });
    }
  }

  extractKnowledgeUpdates(outcomes, context) {
    const updates = {
      patternsLearned: [],
      conceptsReinforced: [],
      strategiesAdapted: [],
      source: "outcome_analysis"
    };

    // Extract from learning indicators
    if (outcomes.learningIndicators) {
      Object.entries(outcomes.learningIndicators).forEach(([indicator, count]) => {
        if (count > 1) { // Significant pattern
          updates.patternsLearned.push({
            type: indicator,
            strength: Math.min(1, count / 5), // Normalize to 0-1
            confidence: 0.7
          });
        }
      });
    }

    // Extract from improvement patterns
    if (outcomes.improvementPatterns?.patterns) {
      outcomes.improvementPatterns.patterns.forEach(pattern => {
        updates.strategiesAdapted.push({
          strategy: pattern.type,
          improvement: pattern.improvement,
          confidence: pattern.confidence
        });
      });
    }

    // Context-specific learning
    if (context.patterns?.primaryType) {
      updates.conceptsReinforced.push({
        concept: context.patterns.primaryType,
        reinforcement: outcomes.successRate || 0.5,
        confidence: 0.6
      });
    }

    return updates;
  }

  calculatePerformanceDelta(outcomes, context) {
    // Calculate improvement since last similar context
    if (!outcomes.learningQuality?.score) {
      return null;
    }

    // Get historical performance for similar contexts
    const historicalSessions = Array.from(this.learningSessions.values())
      .filter(session => {
        try {
          const sessionContext = JSON.parse(session.context);
          return sessionContext.patterns?.primaryType === context.patterns?.primaryType;
        } catch {
          return false;
        }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5); // Last 5 similar sessions

    if (historicalSessions.length === 0) {
      return null; // No comparison data
    }

    const historicalQuality = historicalSessions.reduce((sum, session) => sum + (session.qualityScore || 0.5), 0) / historicalSessions.length;
    
    return outcomes.learningQuality.score - historicalQuality;
  }

  async storeLearningSession(record) {
    if (!this.database) return;

    const sql = `
      INSERT INTO learning_sessions 
      (id, session_context, interactions_count, learning_outcomes, knowledge_updates, performance_delta, quality_score, improvement_detected)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.database.run(sql, [
        record.sessionId,
        record.context,
        record.interactionsCount,
        JSON.stringify(record.outcomes),
        record.knowledgeUpdates ? JSON.stringify(record.knowledgeUpdates) : null,
        record.performanceDelta,
        record.qualityScore,
        record.improvementDetected ? 1 : 0
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async updateKnowledgePatterns(learningRecord) {
    if (!learningRecord.knowledgeUpdates) return;

    // Process learned patterns
    for (const pattern of learningRecord.knowledgeUpdates.patternsLearned) {
      const signature = this.generatePatternSignature(pattern);
      
      if (this.knowledgePatterns.has(signature)) {
        // Update existing pattern
        const existing = this.knowledgePatterns.get(signature);
        existing.usageCount++;
        existing.confidence = Math.min(0.95, existing.confidence + 0.05);
        existing.updatedAt = new Date();
        
        // Update in database
        if (this.database) {
          await this.updateKnowledgePatternInDB(signature, existing);
        }
      } else {
        // Create new pattern
        const newPattern = {
          id: this.generatePatternId(),
          type: pattern.type,
          data: pattern,
          confidence: pattern.confidence,
          usageCount: 1,
          successRate: 0.5,
          source: "learning_session",
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.knowledgePatterns.set(signature, newPattern);
        
        // Store in database
        if (this.database) {
          await this.storeKnowledgePatternInDB(signature, newPattern);
        }
      }
    }

    this.stats.knowledgePatternCount = this.knowledgePatterns.size;
  }

  generatePatternSignature(pattern) {
    const signatureData = `${pattern.type}_${JSON.stringify(pattern).length}_${pattern.confidence || 0.5}`;
    return signatureData.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  }

  generatePatternId() {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async updateKnowledgePatternInDB(signature, pattern) {
    if (!this.database) return;

    const sql = `
      UPDATE knowledge_patterns 
      SET usage_count = ?, confidence_score = ?, updated_at = CURRENT_TIMESTAMP
      WHERE pattern_signature = ?
    `;

    return new Promise((resolve, reject) => {
      this.database.run(sql, [pattern.usageCount, pattern.confidence, signature], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async storeKnowledgePatternInDB(signature, pattern) {
    if (!this.database) return;

    const sql = `
      INSERT INTO knowledge_patterns 
      (id, pattern_type, pattern_signature, pattern_data, confidence_score, usage_count, success_rate, learning_source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.database.run(sql, [
        pattern.id,
        pattern.type,
        signature,
        JSON.stringify(pattern.data),
        pattern.confidence,
        pattern.usageCount,
        pattern.successRate,
        pattern.source
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  updateStats(learningRecord) {
    this.stats.totalSessions++;
    this.stats.totalOutcomes += learningRecord.interactionsCount;
    
    if (learningRecord.qualityScore) {
      // Update average learning quality using exponential moving average
      const alpha = 0.1;
      this.stats.averageLearningQuality = this.stats.averageLearningQuality * (1 - alpha) + learningRecord.qualityScore * alpha;
    }
  }

  /**
   * Retrieve relevant knowledge for context
   */
  async retrieveRelevantKnowledge(contextAnalysis) {
    const relevantKnowledge = {
      patterns: [],
      sessions: [],
      confidence: 0,
      source: "knowledge_retrieval"
    };

    // Find relevant patterns
    const contextType = contextAnalysis.patterns?.primaryType;
    if (contextType) {
      for (const [signature, pattern] of this.knowledgePatterns) {
        if (pattern.type === contextType || pattern.data.type === contextType) {
          relevantKnowledge.patterns.push({
            signature,
            pattern: pattern.data,
            confidence: pattern.confidence,
            usageCount: pattern.usageCount,
            successRate: pattern.successRate
          });
        }
      }
    }

    // Find relevant learning sessions
    const similarSessions = Array.from(this.learningSessions.values())
      .filter(session => {
        try {
          const sessionContext = JSON.parse(session.context);
          return sessionContext.patterns?.primaryType === contextType;
        } catch {
          return false;
        }
      })
      .sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0))
      .slice(0, 3);

    relevantKnowledge.sessions = similarSessions.map(session => ({
      outcomes: session.outcomes,
      qualityScore: session.qualityScore,
      improvementDetected: session.improvementDetected
    }));

    // Calculate confidence
    relevantKnowledge.confidence = Math.min(0.9, 
      (relevantKnowledge.patterns.length * 0.2) + 
      (relevantKnowledge.sessions.length * 0.3)
    );

    return relevantKnowledge;
  }

  /**
   * Get learning metrics
   */
  getLearningMetrics() {
    const recentSessions = Array.from(this.learningSessions.values())
      .filter(session => Date.now() - new Date(session.createdAt).getTime() < 24 * 60 * 60 * 1000) // Last 24h
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const improvementRate = recentSessions.length > 0 
      ? recentSessions.filter(s => s.improvementDetected).length / recentSessions.length 
      : 0;

    return {
      status: "measured",
      totalKnowledgePatterns: this.knowledgePatterns.size,
      totalLearningSessions: this.learningSessions.size,
      recentSessions: recentSessions.length,
      averageLearningQuality: this.stats.averageLearningQuality,
      improvementRate,
      topPatternTypes: this.getTopPatternTypes(),
      learningTrend: this.calculateLearningTrend(recentSessions),
      confidence: this.knowledgePatterns.size > 10 ? 0.8 : Math.min(0.8, this.knowledgePatterns.size * 0.08),
      source: "learning_memory_metrics",
      timestamp: Date.now()
    };
  }

  getTopPatternTypes() {
    const typeCount = {};
    for (const pattern of this.knowledgePatterns.values()) {
      typeCount[pattern.type] = (typeCount[pattern.type] || 0) + 1;
    }

    return Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  calculateLearningTrend(recentSessions) {
    if (recentSessions.length < 2) {
      return { trend: "insufficient_data", confidence: 0 };
    }

    const qualityScores = recentSessions
      .map(s => s.qualityScore)
      .filter(score => score !== null);

    if (qualityScores.length < 2) {
      return { trend: "insufficient_quality_data", confidence: 0 };
    }

    // Simple linear trend calculation
    const firstHalf = qualityScores.slice(0, Math.floor(qualityScores.length / 2));
    const secondHalf = qualityScores.slice(Math.floor(qualityScores.length / 2));

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const trendValue = avgSecond - avgFirst;
    
    let trend = "stable";
    if (trendValue > 0.05) trend = "improving";
    else if (trendValue < -0.05) trend = "declining";

    return {
      trend,
      trendValue,
      confidence: Math.min(0.9, qualityScores.length * 0.1)
    };
  }

  async shutdown() {
    this.logger.info("🛑 Learning Memory System shutting down...");
    
    // Save any pending updates
    this.knowledgePatterns.clear();
    this.learningSessions.clear();
    
    this.logger.info("✅ Learning Memory System shutdown complete");
  }
}

export default LearningMemorySystem;