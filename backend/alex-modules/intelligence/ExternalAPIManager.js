/**
 * @fileoverview External API Manager - Gestion intelligente des APIs externes
 * Module d'intégration OpenAI, Anthropic, Google avec sélection optimale et tracking
 * @module ExternalAPIManager
 * @version 1.0.0 - Phase 2 Intelligent Systems
 * RÈGLES ANTI-FAKE: Sélection basée performance mesurée, tracking usage réel
 */

import { EventEmitter } from 'events';

/**
 * Tracker d'usage et performance API
 * ANTI-FAKE: Métriques basées sur réponses et temps réels
 */
class APIUsageTracker {
  constructor(config = {}) {
    this.config = {
      performanceWindow: config.performanceWindow || 300000, // 5 minutes
      maxHistorySize: config.maxHistorySize || 1000,
      qualityDecayRate: config.qualityDecayRate || 0.05,
      ...config
    };
    
    this.usageHistory = new Map(); // API name -> usage records
    this.performanceMetrics = new Map(); // API name -> performance data
    this.costTracking = new Map(); // API name -> cost data
  }

  /**
   * Track API usage with real metrics
   * Source: Actual API call results and timings
   */
  trackUsage(apiName, request, response, metadata = {}) {
    const now = Date.now();
    const usage = {
      timestamp: now,
      requestTokens: metadata.requestTokens || this.estimateTokens(request),
      responseTokens: metadata.responseTokens || this.estimateTokens(response.content || ''),
      responseTime: metadata.responseTime || 0,
      success: response.success !== false,
      quality: response.quality || null,
      cost: metadata.cost || this.estimateCost(apiName, metadata),
      contextType: metadata.contextType || 'unknown',
      source: 'api_usage_tracker'
    };

    // Store usage record
    if (!this.usageHistory.has(apiName)) {
      this.usageHistory.set(apiName, []);
    }
    
    const history = this.usageHistory.get(apiName);
    history.push(usage);

    // Maintain history size limit
    if (history.length > this.config.maxHistorySize) {
      history.splice(0, history.length - this.config.maxHistorySize);
    }

    // Update performance metrics
    this.updatePerformanceMetrics(apiName, usage);
    
    return usage;
  }

  updatePerformanceMetrics(apiName, usage) {
    if (!this.performanceMetrics.has(apiName)) {
      this.performanceMetrics.set(apiName, {
        totalCalls: 0,
        successCalls: 0,
        totalResponseTime: 0,
        totalCost: 0,
        avgQuality: 0.5,
        lastUpdated: Date.now()
      });
    }

    const metrics = this.performanceMetrics.get(apiName);
    
    // Update counters
    metrics.totalCalls++;
    if (usage.success) metrics.successCalls++;
    metrics.totalResponseTime += usage.responseTime;
    metrics.totalCost += usage.cost;

    // Update average quality with exponential moving average
    if (usage.quality !== null) {
      const alpha = 0.1;
      metrics.avgQuality = metrics.avgQuality * (1 - alpha) + usage.quality * alpha;
    }

    metrics.lastUpdated = Date.now();
  }

  /**
   * Get performance metrics for API selection
   * Source: Historical usage data analysis
   */
  getPerformanceMetrics(apiName, timeWindow = null) {
    const windowStart = timeWindow ? Date.now() - timeWindow : 0;
    const history = this.usageHistory.get(apiName) || [];
    
    // Filter to time window
    const relevantHistory = history.filter(usage => usage.timestamp >= windowStart);
    
    if (relevantHistory.length === 0) {
      return {
        status: "no_data",
        apiName,
        confidence: 0,
        timestamp: Date.now()
      };
    }

    const totalCalls = relevantHistory.length;
    const successCalls = relevantHistory.filter(u => u.success).length;
    const avgResponseTime = relevantHistory.reduce((sum, u) => sum + u.responseTime, 0) / totalCalls;
    const totalCost = relevantHistory.reduce((sum, u) => sum + u.cost, 0);
    
    // Quality metrics
    const qualityRecords = relevantHistory.filter(u => u.quality !== null);
    const avgQuality = qualityRecords.length > 0 
      ? qualityRecords.reduce((sum, u) => sum + u.quality, 0) / qualityRecords.length
      : 0.5;

    // Performance score calculation
    const successRate = successCalls / totalCalls;
    const speedScore = Math.max(0, Math.min(1, 1 - (avgResponseTime / 10000))); // 10s max
    const qualityScore = avgQuality;
    const costEfficiency = this.calculateCostEfficiency(apiName, totalCost, qualityRecords.length);

    const performanceScore = (
      successRate * 0.3 +
      speedScore * 0.25 +
      qualityScore * 0.3 +
      costEfficiency * 0.15
    );

    return {
      status: "measured",
      apiName,
      performanceScore,
      successRate,
      avgResponseTime,
      avgQuality,
      totalCost,
      costEfficiency,
      totalCalls,
      dataFreshness: Date.now() - Math.max(...relevantHistory.map(u => u.timestamp)),
      confidence: Math.min(0.9, totalCalls * 0.1),
      source: "performance_analysis",
      timestamp: Date.now()
    };
  }

  calculateCostEfficiency(apiName, totalCost, successfulResponses) {
    if (successfulResponses === 0) return 0;
    
    const avgCostPerResponse = totalCost / successfulResponses;
    
    // Cost efficiency based on API type (rough estimates)
    const costThresholds = {
      'openai': 0.002,  // Rough per-response estimate
      'anthropic': 0.003,
      'google': 0.001
    };
    
    const threshold = costThresholds[apiName.toLowerCase()] || 0.002;
    return Math.max(0, Math.min(1, 1 - (avgCostPerResponse / threshold)));
  }

  estimateTokens(text) {
    // Rough token estimation: ~4 chars per token average
    return Math.ceil(text.length / 4);
  }

  estimateCost(apiName, metadata) {
    // Rough cost estimates (would be more precise with actual pricing)
    const rates = {
      'openai': { input: 0.0015, output: 0.002 }, // per 1K tokens
      'anthropic': { input: 0.003, output: 0.015 },
      'google': { input: 0.0005, output: 0.0015 }
    };

    const rate = rates[apiName.toLowerCase()] || rates.openai;
    const inputCost = ((metadata.requestTokens || 0) / 1000) * rate.input;
    const outputCost = ((metadata.responseTokens || 0) / 1000) * rate.output;
    
    return inputCost + outputCost;
  }

  /**
   * Select best API based on context and performance
   */
  selectBestAPI(context, availableAPIs) {
    if (!availableAPIs || availableAPIs.length === 0) {
      return {
        status: "no_apis",
        selectedAPI: null,
        confidence: 0
      };
    }

    if (availableAPIs.length === 1) {
      return {
        status: "single_option",
        selectedAPI: availableAPIs[0],
        confidence: 0.7,
        reason: "only_available_api"
      };
    }

    // Get performance metrics for each API
    const apiPerformance = availableAPIs.map(apiName => {
      const metrics = this.getPerformanceMetrics(apiName, this.config.performanceWindow);
      return {
        apiName,
        ...metrics
      };
    });

    // Context-based preferences
    const contextPreferences = this.getContextPreferences(context);
    
    // Calculate weighted scores
    const scoredAPIs = apiPerformance.map(api => {
      let score = api.performanceScore || 0.5;
      
      // Apply context preferences
      if (contextPreferences[api.apiName]) {
        score += contextPreferences[api.apiName];
      }
      
      // Penalize if no recent data
      if (api.status === "no_data") {
        score *= 0.7;
      }
      
      return {
        ...api,
        finalScore: Math.min(1, score)
      };
    });

    // Select highest scoring API
    const bestAPI = scoredAPIs.reduce((best, current) => 
      current.finalScore > best.finalScore ? current : best
    );

    return {
      status: "selected",
      selectedAPI: bestAPI.apiName,
      confidence: bestAPI.confidence || 0.6,
      reason: `Best performance score: ${bestAPI.finalScore.toFixed(3)}`,
      alternatives: scoredAPIs.filter(api => api.apiName !== bestAPI.apiName)
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, 2)
        .map(api => ({ name: api.apiName, score: api.finalScore })),
      source: "intelligent_selection",
      timestamp: Date.now()
    };
  }

  getContextPreferences(context) {
    const preferences = {
      'openai': 0,
      'anthropic': 0,
      'google': 0
    };

    // Preferences based on context type
    switch (context.patterns?.primaryType) {
      case 'TECHNICAL':
        preferences.openai += 0.1; // Good for code
        break;
      case 'BUSINESS':
        preferences.anthropic += 0.1; // Good for analysis
        break;
      case 'CREATIVE':
        preferences.openai += 0.15; // Creative tasks
        break;
      case 'QUESTION':
        preferences.google += 0.1; // Good for factual
        break;
    }

    // Complexity preferences
    if (context.complexity?.overallComplexity > 0.7) {
      preferences.anthropic += 0.1; // Better for complex reasoning
    }

    return preferences;
  }

  getUsageStatistics(apiName = null) {
    if (apiName) {
      return this.getPerformanceMetrics(apiName);
    }

    // Overall statistics
    const allMetrics = {};
    for (const api of this.performanceMetrics.keys()) {
      allMetrics[api] = this.getPerformanceMetrics(api);
    }

    const totalCalls = Object.values(allMetrics).reduce((sum, m) => sum + (m.totalCalls || 0), 0);
    const totalCost = Object.values(allMetrics).reduce((sum, m) => sum + (m.totalCost || 0), 0);

    return {
      status: "measured",
      totalCalls,
      totalCost,
      apiBreakdown: allMetrics,
      mostUsedAPI: Object.entries(allMetrics).reduce((best, [name, metrics]) => 
        (metrics.totalCalls || 0) > (best.calls || 0) ? { name, calls: metrics.totalCalls } : best, 
        { name: 'none', calls: 0 }
      ),
      source: "usage_statistics",
      timestamp: Date.now()
    };
  }
}

/**
 * External API Manager Principal
 * Gestion intelligente des APIs externes avec sélection optimale
 */
class ExternalAPIManager extends EventEmitter {
  constructor(dependencies = {}) {
    super();
    
    // Dependency Injection
    this.apiKeys = dependencies.apiKeys || {};
    this.logger = dependencies.logger || console;
    this.strictMode = dependencies.strictMode !== undefined ? dependencies.strictMode : true;
    this.config = dependencies.config || {};
    
    // Initialize components
    this.usageTracker = new APIUsageTracker(this.config.tracking);
    this.apiClients = {};
    this.isInitialized = false;
    
    // API configuration
    this.apiConfigs = {
      openai: {
        name: 'OpenAI',
        enabled: !!this.apiKeys.OPENAI_API_KEY,
        maxTokens: 4000,
        temperature: 0.7,
        timeout: 30000
      },
      anthropic: {
        name: 'Anthropic',
        enabled: !!this.apiKeys.ANTHROPIC_API_KEY,
        maxTokens: 4000,
        timeout: 30000
      },
      google: {
        name: 'Google AI',
        enabled: !!this.apiKeys.GOOGLE_API_KEY,
        maxTokens: 4000,
        timeout: 30000
      }
    };
    
    this.logger.info("🌐 External API Manager initializing...");
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize available API clients
      await this.initializeAPIClients();
      
      // Validate at least one API is available
      const enabledAPIs = this.getEnabledAPIs();
      if (enabledAPIs.length === 0) {
        this.logger.warn("⚠️ No external APIs configured - using fallback responses only");
      } else {
        this.logger.info(`🔌 External APIs enabled: ${enabledAPIs.join(', ')}`);
      }

      this.isInitialized = true;
      this.logger.info("✅ External API Manager initialized");
      
      this.emit("apiManagerReady");
    } catch (error) {
      this.logger.error("❌ API Manager initialization failed:", error);
      if (this.strictMode) {
        throw error;
      }
    }
  }

  async initializeAPIClients() {
    // OpenAI Client
    if (this.apiConfigs.openai.enabled) {
      try {
        // Dynamic import for OpenAI (since it might not be available)
        const { OpenAI } = await import('openai');
        this.apiClients.openai = new OpenAI({
          apiKey: this.apiKeys.OPENAI_API_KEY
        });
        this.logger.info("🤖 OpenAI client initialized");
      } catch (error) {
        this.logger.warn("OpenAI client initialization failed:", error.message);
        this.apiConfigs.openai.enabled = false;
      }
    }

    // Note: Anthropic and Google clients would be initialized similarly
    // For now, we'll implement mock clients to demonstrate the architecture
    
    if (this.apiConfigs.anthropic.enabled) {
      this.apiClients.anthropic = this.createMockClient('anthropic');
      this.logger.info("🧠 Anthropic mock client initialized");
    }

    if (this.apiConfigs.google.enabled) {
      this.apiClients.google = this.createMockClient('google');
      this.logger.info("🔍 Google AI mock client initialized");
    }
  }

  createMockClient(apiName) {
    // Mock client for demonstration - would be replaced with real clients
    return {
      query: async (prompt, options = {}) => {
        const delay = 1000 + Math.random() * 2000; // 1-3 second delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const responses = {
          anthropic: `I understand you're asking about this topic. Based on my analysis, here's a comprehensive response that addresses your question with careful consideration of the context and complexity involved.`,
          google: `Here's information about your query. I can provide factual details and helpful guidance based on available knowledge and current understanding of the subject matter.`
        };
        
        return {
          content: responses[apiName] || "Mock response from " + apiName,
          success: Math.random() > 0.1, // 90% success rate
          quality: 0.7 + Math.random() * 0.2, // 0.7-0.9 quality
          tokens: {
            input: Math.ceil(prompt.length / 4),
            output: Math.ceil((responses[apiName] || '').length / 4)
          }
        };
      }
    };
  }

  getEnabledAPIs() {
    return Object.entries(this.apiConfigs)
      .filter(([, config]) => config.enabled)
      .map(([name]) => name);
  }

  /**
   * Query best API for given context - SÉLECTION INTELLIGENTE
   */
  async queryBestAPI(context, prompt) {
    const startTime = Date.now();
    
    try {
      // Get available APIs
      const availableAPIs = this.getEnabledAPIs();
      
      if (availableAPIs.length === 0) {
        throw new Error("No external APIs available");
      }

      // Select best API based on context and performance
      const selection = this.usageTracker.selectBestAPI(context, availableAPIs);
      
      if (selection.status !== "selected" && selection.status !== "single_option") {
        throw new Error("API selection failed");
      }

      const selectedAPI = selection.selectedAPI;
      this.logger.info(`🎯 Selected API: ${selectedAPI} (confidence: ${selection.confidence.toFixed(3)})`);

      // Execute query
      const response = await this.executeAPIQuery(selectedAPI, prompt, context);
      
      // Track usage and performance
      const metadata = {
        responseTime: Date.now() - startTime,
        contextType: context.patterns?.primaryType,
        requestTokens: response.tokens?.input,
        responseTokens: response.tokens?.output,
        cost: this.usageTracker.estimateCost(selectedAPI, {
          requestTokens: response.tokens?.input,
          responseTokens: response.tokens?.output
        })
      };

      this.usageTracker.trackUsage(selectedAPI, prompt, response, metadata);

      // Format final response
      const finalResponse = {
        content: response.content,
        quality: response.quality || 0.7,
        responseTime: metadata.responseTime,
        selectedAPI,
        selectionReason: selection.reason,
        selectionConfidence: selection.confidence,
        cost: metadata.cost,
        tokens: response.tokens,
        success: response.success,
        source: "external_api_manager",
        timestamp: Date.now()
      };

      this.emit("apiQueryCompleted", {
        api: selectedAPI,
        success: response.success,
        responseTime: metadata.responseTime,
        quality: response.quality
      });

      return finalResponse;

    } catch (error) {
      this.logger.error("API query failed:", error);
      
      if (this.strictMode) {
        throw error;
      }

      return this.generateFallbackResponse(prompt, error, Date.now() - startTime);
    }
  }

  async executeAPIQuery(apiName, prompt, context) {
    const client = this.apiClients[apiName];
    const config = this.apiConfigs[apiName];
    
    if (!client) {
      throw new Error(`API client ${apiName} not available`);
    }

    // Prepare API-specific options
    const options = {
      maxTokens: config.maxTokens,
      temperature: config.temperature || 0.7,
      timeout: config.timeout
    };

    // Execute with timeout
    return Promise.race([
      client.query(prompt, options),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`${apiName} timeout`)), config.timeout)
      )
    ]);
  }

  generateFallbackResponse(prompt, error, responseTime) {
    return {
      content: "I apologize, but I'm currently unable to access external AI services. Please try again later or contact support if the issue persists.",
      quality: 0.2,
      responseTime,
      selectedAPI: "fallback",
      selectionReason: `API failure: ${error.message}`,
      selectionConfidence: 0.1,
      cost: 0,
      success: false,
      error: error.message,
      source: "fallback_response",
      timestamp: Date.now()
    };
  }

  /**
   * Update API performance metrics based on user feedback
   */
  async updateAPIQuality(apiName, queryId, userFeedback) {
    // This would update the quality metrics for the specific API
    // based on user feedback (thumbs up/down, rating, etc.)
    
    const feedbackScore = this.processFeedback(userFeedback);
    
    // Find and update the corresponding usage record
    const history = this.usageTracker.usageHistory.get(apiName);
    if (history) {
      // Find most recent query (simplified - would use queryId in real implementation)
      const recentQuery = history[history.length - 1];
      if (recentQuery) {
        recentQuery.userFeedback = feedbackScore;
        recentQuery.quality = (recentQuery.quality + feedbackScore) / 2; // Average with original quality
      }
    }

    this.logger.info(`📊 Updated ${apiName} quality based on user feedback: ${feedbackScore}`);
    
    return {
      status: "updated",
      apiName,
      feedbackScore,
      source: "user_feedback_integration",
      timestamp: Date.now()
    };
  }

  processFeedback(userFeedback) {
    // Convert various feedback formats to 0-1 score
    if (typeof userFeedback === 'number') {
      return Math.max(0, Math.min(1, userFeedback));
    }
    
    if (typeof userFeedback === 'string') {
      const positive = ['good', 'great', 'excellent', 'helpful', 'accurate', 'yes', 'thumbs_up'];
      const negative = ['bad', 'poor', 'wrong', 'unhelpful', 'inaccurate', 'no', 'thumbs_down'];
      
      const feedback = userFeedback.toLowerCase();
      if (positive.some(word => feedback.includes(word))) return 0.8;
      if (negative.some(word => feedback.includes(word))) return 0.2;
      return 0.5; // Neutral
    }
    
    if (typeof userFeedback === 'boolean') {
      return userFeedback ? 0.8 : 0.2;
    }
    
    return 0.5; // Default neutral
  }

  /**
   * Get API manager metrics
   */
  getMetrics() {
    const enabledAPIs = this.getEnabledAPIs();
    const usageStats = this.usageTracker.getUsageStatistics();
    
    return {
      status: "measured",
      enabledAPIs,
      totalAPIs: enabledAPIs.length,
      usageStatistics: usageStats,
      apiConfigurations: Object.fromEntries(
        Object.entries(this.apiConfigs).map(([name, config]) => [
          name, 
          { enabled: config.enabled, name: config.name }
        ])
      ),
      confidence: enabledAPIs.length > 0 ? 0.8 : 0.1,
      source: "api_manager_metrics",
      timestamp: Date.now()
    };
  }

  /**
   * Health check for all APIs
   */
  async healthCheck() {
    const results = {};
    const enabledAPIs = this.getEnabledAPIs();
    
    for (const apiName of enabledAPIs) {
      try {
        const startTime = Date.now();
        const response = await this.executeAPIQuery(apiName, "Test health check", { patterns: { primaryType: 'TECHNICAL' } });
        const responseTime = Date.now() - startTime;
        
        results[apiName] = {
          status: response.success ? "healthy" : "degraded",
          responseTime,
          lastChecked: Date.now()
        };
      } catch (error) {
        results[apiName] = {
          status: "unhealthy",
          error: error.message,
          lastChecked: Date.now()
        };
      }
    }

    return {
      status: "completed",
      results,
      overallHealth: Object.values(results).every(r => r.status === "healthy") ? "healthy" : "degraded",
      timestamp: Date.now()
    };
  }

  async shutdown() {
    this.logger.info("🛑 External API Manager shutting down...");
    
    // Close any persistent connections
    this.apiClients = {};
    
    this.logger.info("✅ API Manager shutdown complete");
  }
}

export default ExternalAPIManager;