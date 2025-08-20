/**
 * @fileoverview Test Phase 2 - Intelligent Response Generation System
 * Script de test et validation du système de génération de réponses intelligentes
 * @version 1.0.0 - Phase 2 Testing
 * RÈGLES ANTI-FAKE: Tests basés réponses mesurées, validation qualité authentique
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import des modules Phase 2
import IntelligentResponseGenerator from './backend/alex-modules/intelligence/IntelligentResponseGenerator.js';
import ExternalAPIManager from './backend/alex-modules/intelligence/ExternalAPIManager.js';
import QualityConfidenceScorer from './backend/alex-modules/intelligence/QualityConfidenceScorer.js';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Logger simple pour les tests
 */
class TestLogger {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  info(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`);
    if (data) console.log('  Data:', data);
  }

  error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`);
    if (error) console.error('  Error:', error);
  }

  warn(message, data = null) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`);
    if (data) console.warn('  Data:', data);
  }

  logTestResult(testName, success, metrics = {}) {
    const result = {
      testName,
      success,
      metrics,
      timestamp: Date.now(),
      duration: Date.now() - this.startTime
    };
    
    this.testResults.push(result);
    
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}`);
    if (Object.keys(metrics).length > 0) {
      console.log('  Metrics:', metrics);
    }
  }

  getSummary() {
    const passed = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    const duration = Date.now() - this.startTime;

    return {
      passed,
      total,
      success_rate: total > 0 ? passed / total : 0,
      duration,
      results: this.testResults
    };
  }
}

/**
 * Générateur de contextes de test pour Phase 2
 */
class Phase2TestDataGenerator {
  constructor() {
    this.testContexts = [
      {
        input: { text: "Comment optimiser les performances d'une API REST ?" },
        patterns: {
          primaryType: "TECHNICAL",
          typeConfidence: 0.9,
          complexityScore: 0.7,
          keywords: { "API": 2, "REST": 1, "performances": 2, "optimiser": 1 }
        },
        complexity: { overallComplexity: 0.8 },
        expectedResponseType: "technical_explanation"
      },
      {
        input: { text: "Quelle stratégie marketing adopter pour une startup B2B ?" },
        patterns: {
          primaryType: "BUSINESS",
          typeConfidence: 0.85,
          complexityScore: 0.6,
          keywords: { "stratégie": 1, "marketing": 2, "startup": 1, "B2B": 1 }
        },
        complexity: { overallComplexity: 0.7 },
        expectedResponseType: "strategic_advice"
      },
      {
        input: { text: "Peux-tu m'expliquer le machine learning pour débutants ?" },
        patterns: {
          primaryType: "REQUEST",
          typeConfidence: 0.8,
          complexityScore: 0.4,
          keywords: { "machine": 1, "learning": 1, "débutants": 1, "expliquer": 1 }
        },
        complexity: { overallComplexity: 0.3 },
        expectedResponseType: "educational_explanation"
      },
      {
        input: { text: "J'ai une erreur 500 sur mon serveur Node.js, comment la résoudre ?" },
        patterns: {
          primaryType: "PROBLEM",
          typeConfidence: 0.9,
          complexityScore: 0.8,
          keywords: { "erreur": 1, "500": 1, "serveur": 1, "Node.js": 1, "résoudre": 1 }
        },
        complexity: { overallComplexity: 0.75 },
        expectedResponseType: "troubleshooting_guide"
      }
    ];

    this.userProfiles = [
      { level: "beginner", interests: ["web", "basics"], experience: 1 },
      { level: "intermediate", interests: ["backend", "apis"], experience: 3 },
      { level: "advanced", interests: ["architecture", "performance"], experience: 7 },
      { level: "expert", interests: ["systems", "optimization"], experience: 15 }
    ];
  }

  getTestContext(index = null) {
    if (index !== null && index < this.testContexts.length) {
      return this.testContexts[index];
    }
    return this.testContexts[Math.floor(Math.random() * this.testContexts.length)];
  }

  getRandomUserProfile() {
    return this.userProfiles[Math.floor(Math.random() * this.userProfiles.length)];
  }

  generateKnowledgeBase() {
    return {
      patterns: [
        {
          pattern: { type: "TECHNICAL", data: "performance optimization patterns" },
          confidence: 0.8,
          usageCount: 15,
          successRate: 0.85
        },
        {
          pattern: { type: "BUSINESS", data: "startup strategy frameworks" },
          confidence: 0.7,
          usageCount: 12,
          successRate: 0.78
        }
      ],
      sessions: [
        {
          outcomes: { successRate: 0.8, learningQuality: { score: 0.7 } }
        }
      ]
    };
  }
}

/**
 * Test Suite Principal Phase 2
 */
class Phase2TestSuite {
  constructor() {
    this.logger = new TestLogger();
    this.dataGenerator = new Phase2TestDataGenerator();
    
    // Components to test
    this.responseGenerator = null;
    this.apiManager = null;
    this.qualityScorer = null;
    
    // Test configuration
    this.testConfig = {
      strictMode: false, // Relaxed for testing without real API keys
      timeout: 10000,
      mockAPIEnabled: true
    };
  }

  async initialize() {
    this.logger.info("🚀 Initializing Phase 2 Test Suite");

    try {
      // Initialize API Manager (with mock APIs)
      await this.initializeAPIManager();

      // Initialize Quality Scorer
      await this.initializeQualityScorer();

      // Initialize Response Generator
      await this.initializeResponseGenerator();

      this.logger.info("✅ Phase 2 Test Suite initialized successfully");
      return true;
    } catch (error) {
      this.logger.error("❌ Phase 2 Test Suite initialization failed", error);
      return false;
    }
  }

  async initializeAPIManager() {
    const dependencies = {
      apiKeys: {
        // Mock API keys for testing
        OPENAI_API_KEY: 'mock-key-for-testing',
        ANTHROPIC_API_KEY: 'mock-key-for-testing',
        GOOGLE_API_KEY: 'mock-key-for-testing'
      },
      logger: this.logger,
      strictMode: this.testConfig.strictMode,
      config: {
        tracking: {
          performanceWindow: 60000, // 1 minute for testing
          maxHistorySize: 100
        }
      }
    };

    this.apiManager = new ExternalAPIManager(dependencies);
    await this.apiManager.initialize();
  }

  async initializeQualityScorer() {
    const dependencies = {
      logger: this.logger,
      strictMode: this.testConfig.strictMode,
      config: {
        weights: {
          coherence: 0.35,
          relevance: 0.35,
          completeness: 0.15,
          accuracy: 0.15
        },
        coherence: {
          coherenceThreshold: 0.6
        },
        relevance: {
          relevanceThreshold: 0.6
        }
      }
    };

    this.qualityScorer = new QualityConfidenceScorer(dependencies);
    await this.qualityScorer.initialize();
  }

  async initializeResponseGenerator() {
    const dependencies = {
      apiManager: this.apiManager,
      logger: this.logger,
      strictMode: this.testConfig.strictMode,
      config: {
        synthesis: {
          synthesisMethod: 'weighted_fusion',
          minConfidenceThreshold: 0.6
        }
      }
    };

    this.responseGenerator = new IntelligentResponseGenerator(dependencies);
    await this.responseGenerator.initialize();
  }

  /**
   * Test 1: Response Generation Basic
   */
  async testResponseGeneration() {
    this.logger.info("🧪 Testing Response Generation...");
    
    try {
      const context = this.dataGenerator.getTestContext(0); // Technical context
      const knowledgeBase = this.dataGenerator.generateKnowledgeBase();
      const userProfile = this.dataGenerator.getRandomUserProfile();

      const startTime = Date.now();
      const response = await this.responseGenerator.generateResponse(context, knowledgeBase, userProfile);
      const responseTime = Date.now() - startTime;

      // Validate response structure
      const isValid = (
        response.status === "generated" &&
        response.response &&
        typeof response.response === 'string' &&
        response.response.length > 0 &&
        typeof response.confidence === 'number' &&
        response.confidence >= 0 && response.confidence <= 1 &&
        Array.isArray(response.sources) &&
        response.sources.length > 0
      );

      const metrics = {
        status: response.status,
        response_length: response.response?.length || 0,
        confidence: response.confidence,
        quality_score: response.qualityScore,
        sources_count: response.sources?.length || 0,
        processing_time_ms: responseTime,
        has_reasoning: !!response.reasoning,
        cache_hit: response.cacheHit || false
      };

      this.logger.logTestResult("Response Generation Basic", isValid, metrics);
      return isValid;
    } catch (error) {
      this.logger.logTestResult("Response Generation Basic", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 2: API Manager Selection
   */
  async testAPIManagerSelection() {
    this.logger.info("🧪 Testing API Manager Selection...");
    
    try {
      const context = this.dataGenerator.getTestContext(1); // Business context
      const prompt = "Test prompt for API selection";

      const startTime = Date.now();
      const apiResponse = await this.apiManager.queryBestAPI(context, prompt);
      const queryTime = Date.now() - startTime;

      // Validate API response structure
      const isValid = (
        apiResponse &&
        typeof apiResponse.content === 'string' &&
        apiResponse.content.length > 0 &&
        typeof apiResponse.quality === 'number' &&
        typeof apiResponse.responseTime === 'number' &&
        apiResponse.selectedAPI &&
        typeof apiResponse.selectionConfidence === 'number'
      );

      const metrics = {
        content_length: apiResponse.content?.length || 0,
        quality: apiResponse.quality,
        response_time_ms: queryTime,
        selected_api: apiResponse.selectedAPI,
        selection_confidence: apiResponse.selectionConfidence,
        selection_reason: apiResponse.selectionReason,
        cost: apiResponse.cost,
        success: apiResponse.success
      };

      this.logger.logTestResult("API Manager Selection", isValid, metrics);
      return isValid;
    } catch (error) {
      this.logger.logTestResult("API Manager Selection", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 3: Quality Scoring System
   */
  async testQualityScoring() {
    this.logger.info("🧪 Testing Quality Scoring System...");
    
    try {
      const context = this.dataGenerator.getTestContext(2); // Request context
      const testResponse = "Le machine learning est une branche de l'intelligence artificielle qui permet aux ordinateurs d'apprendre automatiquement à partir de données, sans être explicitement programmés pour chaque tâche spécifique. Pour un débutant, c'est comme enseigner à un ordinateur à reconnaître des patterns et à faire des prédictions basées sur ces patterns.";
      
      const metadata = {
        selectedAPI: "openai",
        quality: 0.8,
        responseTime: 1500
      };

      const startTime = Date.now();
      const qualityScore = await this.qualityScorer.scoreResponse(testResponse, context, metadata);
      const scoringTime = Date.now() - startTime;

      // Validate quality score structure
      const isValid = (
        qualityScore.status === "scored" &&
        typeof qualityScore.qualityScore === 'number' &&
        qualityScore.qualityScore >= 0 && qualityScore.qualityScore <= 1 &&
        typeof qualityScore.confidenceScore === 'number' &&
        qualityScore.breakdown &&
        qualityScore.breakdown.coherence &&
        qualityScore.breakdown.relevance &&
        qualityScore.breakdown.completeness &&
        qualityScore.breakdown.accuracy &&
        typeof qualityScore.reasoning === 'string' &&
        Array.isArray(qualityScore.recommendations)
      );

      const metrics = {
        status: qualityScore.status,
        quality_score: qualityScore.qualityScore,
        confidence_score: qualityScore.confidenceScore,
        processing_time_ms: scoringTime,
        coherence_score: qualityScore.breakdown?.coherence?.score,
        relevance_score: qualityScore.breakdown?.relevance?.score,
        completeness_score: qualityScore.breakdown?.completeness?.score,
        accuracy_score: qualityScore.breakdown?.accuracy?.score,
        recommendations_count: qualityScore.recommendations?.length || 0,
        has_reasoning: qualityScore.reasoning?.length > 0
      };

      this.logger.logTestResult("Quality Scoring System", isValid, metrics);
      return isValid;
    } catch (error) {
      this.logger.logTestResult("Quality Scoring System", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 4: End-to-End Integration
   */
  async testEndToEndIntegration() {
    this.logger.info("🧪 Testing End-to-End Integration...");
    
    try {
      const context = this.dataGenerator.getTestContext(3); // Problem context
      const knowledgeBase = this.dataGenerator.generateKnowledgeBase();
      const userProfile = this.dataGenerator.getRandomUserProfile();

      const startTime = Date.now();

      // Step 1: Generate response
      const response = await this.responseGenerator.generateResponse(context, knowledgeBase, userProfile);
      
      // Step 2: Score the response quality
      const qualityScore = await this.qualityScorer.scoreResponse(
        response.response, 
        context, 
        {
          selectedAPI: response.selectedAPI || 'unknown',
          quality: response.qualityScore || 0.5,
          responseTime: response.processingTime || 0
        }
      );

      const totalTime = Date.now() - startTime;

      // Validate end-to-end process
      const isValid = (
        response.status === "generated" &&
        qualityScore.status === "scored" &&
        response.response.length > 50 && // Reasonable response length
        response.confidence > 0.3 && // Minimum confidence
        qualityScore.qualityScore > 0.2 // Minimum quality
      );

      const metrics = {
        total_processing_time_ms: totalTime,
        response_generation: {
          status: response.status,
          length: response.response?.length || 0,
          confidence: response.confidence,
          sources: response.sources?.length || 0
        },
        quality_assessment: {
          status: qualityScore.status,
          quality_score: qualityScore.qualityScore,
          confidence_score: qualityScore.confidenceScore,
          recommendations: qualityScore.recommendations?.length || 0
        },
        integration_success: isValid
      };

      this.logger.logTestResult("End-to-End Integration", isValid, metrics);
      return isValid;
    } catch (error) {
      this.logger.logTestResult("End-to-End Integration", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 5: Performance Under Load
   */
  async testPerformanceUnderLoad() {
    this.logger.info("🧪 Testing Performance Under Load...");
    
    try {
      const startTime = Date.now();
      const promises = [];
      const testCount = 5; // Reduced for testing

      // Generate multiple concurrent requests
      for (let i = 0; i < testCount; i++) {
        const context = this.dataGenerator.getTestContext(i % this.dataGenerator.testContexts.length);
        const knowledgeBase = this.dataGenerator.generateKnowledgeBase();
        const userProfile = this.dataGenerator.getRandomUserProfile();
        
        promises.push(
          this.responseGenerator.generateResponse(context, knowledgeBase, userProfile)
            .then(response => ({
              success: response.status === "generated",
              responseTime: response.processingTime || 0,
              confidence: response.confidence || 0,
              length: response.response?.length || 0
            }))
            .catch(error => ({
              success: false,
              error: error.message,
              responseTime: 0,
              confidence: 0,
              length: 0
            }))
        );
      }

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // Analyze results
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      const avgResponseTime = successful.length > 0 
        ? successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length 
        : 0;
      const avgConfidence = successful.length > 0 
        ? successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length 
        : 0;

      // Performance criteria
      const isValid = (
        successful.length >= testCount * 0.8 && // 80% success rate
        avgResponseTime < 5000 && // Average under 5 seconds
        avgConfidence > 0.4 // Minimum average confidence
      );

      const metrics = {
        total_requests: testCount,
        successful_requests: successful.length,
        failed_requests: failed.length,
        success_rate: successful.length / testCount,
        total_time_ms: totalTime,
        avg_response_time_ms: avgResponseTime,
        avg_confidence: avgConfidence,
        performance_valid: isValid
      };

      this.logger.logTestResult("Performance Under Load", isValid, metrics);
      return isValid;
    } catch (error) {
      this.logger.logTestResult("Performance Under Load", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 6: Component Metrics
   */
  async testComponentMetrics() {
    this.logger.info("🧪 Testing Component Metrics...");
    
    try {
      // Get metrics from all components
      const responseMetrics = this.responseGenerator.getMetrics();
      const apiMetrics = this.apiManager.getMetrics();
      const qualityMetrics = this.qualityScorer.getMetrics();

      // Validate metrics structure
      const responseMetricsValid = (
        responseMetrics.status === "measured" &&
        typeof responseMetrics.totalResponses === 'number' &&
        typeof responseMetrics.avgConfidence === 'number' &&
        typeof responseMetrics.avgResponseTime === 'number'
      );

      const apiMetricsValid = (
        apiMetrics.status === "measured" &&
        Array.isArray(apiMetrics.enabledAPIs) &&
        apiMetrics.enabledAPIs.length > 0 &&
        typeof apiMetrics.totalAPIs === 'number'
      );

      const qualityMetricsValid = (
        (qualityMetrics.status === "measured" || qualityMetrics.status === "no_data") &&
        typeof qualityMetrics.totalScored === 'number' &&
        qualityMetrics.scoringWeights
      );

      const allValid = responseMetricsValid && apiMetricsValid && qualityMetricsValid;

      const metrics = {
        response_generator: {
          valid: responseMetricsValid,
          total_responses: responseMetrics.totalResponses,
          avg_confidence: responseMetrics.avgConfidence,
          cache_size: responseMetrics.cacheSize
        },
        api_manager: {
          valid: apiMetricsValid,
          enabled_apis: apiMetrics.enabledAPIs?.length || 0,
          total_calls: apiMetrics.usageStatistics?.totalCalls || 0
        },
        quality_scorer: {
          valid: qualityMetricsValid,
          total_scored: qualityMetrics.totalScored,
          avg_quality: qualityMetrics.avgQualityScore || 0
        },
        all_components_valid: allValid
      };

      this.logger.logTestResult("Component Metrics", allValid, metrics);
      return allValid;
    } catch (error) {
      this.logger.logTestResult("Component Metrics", false, { error: error.message });
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    this.logger.info("🎯 Starting Phase 2 Complete Test Suite");
    console.log("=" .repeat(80));

    const testResults = [];

    // Initialize
    const initSuccess = await this.initialize();
    if (!initSuccess) {
      this.logger.error("❌ Failed to initialize test suite");
      return false;
    }

    // Run individual tests
    testResults.push(await this.testResponseGeneration());
    testResults.push(await this.testAPIManagerSelection());
    testResults.push(await this.testQualityScoring());
    testResults.push(await this.testEndToEndIntegration());
    testResults.push(await this.testPerformanceUnderLoad());
    testResults.push(await this.testComponentMetrics());

    // Get final component metrics
    const finalMetrics = {
      responseGenerator: this.responseGenerator.getMetrics(),
      apiManager: this.apiManager.getMetrics(),
      qualityScorer: this.qualityScorer.getMetrics()
    };

    // Summary
    const summary = this.logger.getSummary();
    console.log("\n" + "=".repeat(80));
    console.log("📊 PHASE 2 TEST SUITE SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Tests Passed: ${summary.passed}/${summary.total}`);
    console.log(`📈 Success Rate: ${(summary.success_rate * 100).toFixed(1)}%`);
    console.log(`⏱️  Total Duration: ${summary.duration}ms`);
    console.log(`🎯 Response Generator:`, {
      total_responses: finalMetrics.responseGenerator.totalResponses,
      avg_confidence: finalMetrics.responseGenerator.avgConfidence?.toFixed(3),
      avg_response_time: Math.round(finalMetrics.responseGenerator.avgResponseTime || 0) + 'ms'
    });
    console.log(`🌐 API Manager:`, {
      enabled_apis: finalMetrics.apiManager.enabledAPIs?.length || 0,
      total_calls: finalMetrics.apiManager.usageStatistics?.totalCalls || 0
    });
    console.log(`📏 Quality Scorer:`, {
      total_scored: finalMetrics.qualityScorer.totalScored,
      avg_quality: finalMetrics.qualityScorer.avgQualityScore?.toFixed(3) || 'N/A'
    });

    const overallSuccess = summary.success_rate >= 0.8; // 80% tests must pass
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (overallSuccess) {
      console.log("🚀 Phase 2 Response Generation System is ready!");
      console.log("🎯 Ready to proceed to Phase 3 - Autonomous Adaptation");
    } else {
      console.log("⚠️  Phase 2 needs improvements before proceeding");
    }

    return overallSuccess;
  }
}

/**
 * Main test runner
 */
async function main() {
  const testSuite = new Phase2TestSuite();
  
  try {
    const success = await testSuite.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("❌ Test suite execution failed:", error);
    process.exit(1);
  }
}

// Run if called directly
main();