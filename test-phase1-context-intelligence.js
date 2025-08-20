/**
 * @fileoverview Test Phase 1 - Context Intelligence Engine & Learning Memory System
 * Script de test et validation du fonctionnement des systèmes intelligents Phase 1
 * @version 1.0.0 - Phase 1 Testing
 * RÈGLES ANTI-FAKE: Tests basés données réelles, validation métriques mesurées
 */

import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import des modules Phase 1
import ContextIntelligenceEngine from './backend/alex-modules/intelligence/ContextIntelligenceEngine.js';
import LearningMemorySystem from './backend/alex-modules/intelligence/LearningMemorySystem.js';

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
 * Générateur de données de test réalistes
 */
class TestDataGenerator {
  constructor() {
    this.userInputs = [
      "Comment puis-je créer une fonction JavaScript pour calculer la moyenne ?",
      "J'ai un problème avec mon code React, le composant ne se met pas à jour",
      "Peux-tu m'aider à optimiser ma stratégie marketing digital ?",
      "Analyse les tendances du marché crypto pour Bitcoin",
      "Crée un plan de business pour une startup fintech",
      "Debug ce code SQL qui ne retourne pas les bons résultats",
      "Explique-moi le machine learning de façon simple",
      "Comment intégrer une API REST dans mon application ?",
      "Quelles sont les meilleures pratiques pour la sécurité web ?",
      "Aide-moi à structurer une base de données pour un e-commerce"
    ];

    this.userProfiles = [
      { level: "beginner", interests: ["web", "javascript"], experience: 1 },
      { level: "intermediate", interests: ["backend", "databases"], experience: 3 },
      { level: "advanced", interests: ["ai", "architecture"], experience: 7 },
      { level: "expert", interests: ["systems", "optimization"], experience: 15 }
    ];

    this.interactionTypes = [
      { type: "question", success_probability: 0.8 },
      { type: "debugging", success_probability: 0.6 },
      { type: "explanation", success_probability: 0.9 },
      { type: "analysis", success_probability: 0.7 },
      { type: "creation", success_probability: 0.5 }
    ];
  }

  generateRandomInput() {
    return this.userInputs[Math.floor(Math.random() * this.userInputs.length)];
  }

  generateRandomProfile() {
    return this.userProfiles[Math.floor(Math.random() * this.userProfiles.length)];
  }

  generateInteractionHistory(count = 5) {
    const history = [];
    for (let i = 0; i < count; i++) {
      history.push({
        input: this.generateRandomInput(),
        timestamp: Date.now() - (i * 60000), // Spaced 1 minute apart
        success: Math.random() > 0.3
      });
    }
    return history;
  }

  generateLearningInteractions(count = 10) {
    const interactions = [];
    for (let i = 0; i < count; i++) {
      const interactionType = this.interactionTypes[Math.floor(Math.random() * this.interactionTypes.length)];
      
      interactions.push({
        id: `interaction_${i}`,
        input: this.generateRandomInput(),
        type: interactionType.type,
        responseTime: 1000 + Math.random() * 5000, // 1-6 seconds
        complexity: Math.random(),
        success: Math.random() < interactionType.success_probability,
        timestamp: Date.now() - (i * 30000), // 30 seconds apart
        learningSignals: {
          pattern_recognition: Math.random() > 0.7 ? 1 : 0,
          context_awareness: Math.random() > 0.6 ? 1 : 0,
          adaptation: Math.random() > 0.8 ? 1 : 0
        }
      });
    }
    return interactions;
  }
}

/**
 * Test Suite Principal
 */
class Phase1TestSuite {
  constructor() {
    this.logger = new TestLogger();
    this.dataGenerator = new TestDataGenerator();
    this.database = null;
    this.contextEngine = null;
    this.learningSystem = null;
    
    // Test configuration
    this.testConfig = {
      database_path: path.join(__dirname, 'test_phase1.db'),
      strictMode: true,
      cleanup_after_tests: true
    };
  }

  async initialize() {
    this.logger.info("🚀 Initializing Phase 1 Test Suite");

    try {
      // Setup test database
      await this.setupTestDatabase();

      // Initialize Context Intelligence Engine
      await this.initializeContextEngine();

      // Initialize Learning Memory System
      await this.initializeLearningSystem();

      this.logger.info("✅ Phase 1 Test Suite initialized successfully");
      return true;
    } catch (error) {
      this.logger.error("❌ Phase 1 Test Suite initialization failed", error);
      return false;
    }
  }

  async setupTestDatabase() {
    return new Promise((resolve, reject) => {
      // Remove existing test database
      if (fs.existsSync(this.testConfig.database_path)) {
        fs.unlinkSync(this.testConfig.database_path);
      }

      this.database = new sqlite3.Database(this.testConfig.database_path, (err) => {
        if (err) {
          reject(err);
        } else {
          this.logger.info(`📊 Test database created: ${this.testConfig.database_path}`);
          resolve();
        }
      });
    });
  }

  async initializeContextEngine() {
    const dependencies = {
      database: this.database,
      logger: this.logger,
      strictMode: this.testConfig.strictMode,
      config: {
        patternAnalysis: {
          confidenceThreshold: 0.6
        },
        similarityThreshold: 0.7
      }
    };

    this.contextEngine = new ContextIntelligenceEngine(dependencies);
    await this.contextEngine.initialize();
  }

  async initializeLearningSystem() {
    const dependencies = {
      database: this.database,
      logger: this.logger,
      strictMode: this.testConfig.strictMode,
      config: {
        outcomeAnalysis: {
          minInteractionsForAnalysis: 3,
          improvementThreshold: 0.1
        }
      }
    };

    this.learningSystem = new LearningMemorySystem(dependencies);
    await this.learningSystem.initialize();
  }

  /**
   * Test 1: Context Analysis Functionality
   */
  async testContextAnalysis() {
    this.logger.info("🧪 Testing Context Analysis...");
    
    try {
      const testInput = "Comment puis-je optimiser les performances de mon application React ?";
      const userHistory = this.dataGenerator.generateInteractionHistory(3);

      const startTime = Date.now();
      const contextAnalysis = await this.contextEngine.analyzeContext(testInput, userHistory);
      const analysisTime = Date.now() - startTime;

      // Validate results
      const isValid = (
        contextAnalysis.status === "measured" &&
        contextAnalysis.patterns &&
        contextAnalysis.contextHash &&
        contextAnalysis.confidence > 0 &&
        contextAnalysis.processingTime > 0
      );

      const metrics = {
        status: contextAnalysis.status,
        confidence: contextAnalysis.confidence,
        processing_time_ms: analysisTime,
        pattern_type: contextAnalysis.patterns?.primaryType,
        pattern_confidence: contextAnalysis.patterns?.typeConfidence,
        complexity_score: contextAnalysis.complexity?.overallComplexity,
        similar_contexts_found: contextAnalysis.similarContexts?.found || 0
      };

      this.logger.logTestResult("Context Analysis Functionality", isValid, metrics);
      return isValid;
    } catch (error) {
      this.logger.logTestResult("Context Analysis Functionality", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 2: Pattern Recognition Accuracy
   */
  async testPatternRecognition() {
    this.logger.info("🧪 Testing Pattern Recognition...");
    
    try {
      const testCases = [
        { input: "Qu'est-ce que le machine learning ?", expectedType: "QUESTION" },
        { input: "Crée une fonction pour calculer la factorielle", expectedType: "COMMAND" },
        { input: "J'ai un bug dans mon code Python", expectedType: "PROBLEM" },
        { input: "Peux-tu m'expliquer les closures en JavaScript ?", expectedType: "REQUEST" },
        { input: "Analyse de la stratégie marketing digitale", expectedType: "BUSINESS" }
      ];

      let correctPredictions = 0;
      const results = [];

      for (const testCase of testCases) {
        const analysis = await this.contextEngine.analyzeContext(testCase.input);
        const predictedType = analysis.patterns?.primaryType;
        const isCorrect = predictedType === testCase.expectedType;
        
        if (isCorrect) correctPredictions++;
        
        results.push({
          input: testCase.input.substring(0, 50) + "...",
          expected: testCase.expectedType,
          predicted: predictedType,
          correct: isCorrect,
          confidence: analysis.patterns?.typeConfidence
        });
      }

      const accuracy = correctPredictions / testCases.length;
      const avgConfidence = results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length;

      const metrics = {
        accuracy: accuracy,
        correct_predictions: correctPredictions,
        total_cases: testCases.length,
        average_confidence: avgConfidence,
        results: results
      };

      const isValid = accuracy >= 0.6; // At least 60% accuracy expected

      this.logger.logTestResult("Pattern Recognition Accuracy", isValid, metrics);
      return isValid;
    } catch (error) {
      this.logger.logTestResult("Pattern Recognition Accuracy", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 3: Learning Session Recording
   */
  async testLearningSessionRecording() {
    this.logger.info("🧪 Testing Learning Session Recording...");
    
    try {
      const context = {
        patterns: {
          primaryType: "TECHNICAL",
          complexityScore: 0.7,
          keywords: { "javascript": 3, "function": 2, "performance": 1 }
        },
        userProfile: this.dataGenerator.generateRandomProfile()
      };

      const interactions = this.dataGenerator.generateLearningInteractions(8);
      
      const startTime = Date.now();
      const recordingResult = await this.learningSystem.recordLearningSession(context, interactions);
      const recordingTime = Date.now() - startTime;

      // Validate results
      const isValid = (
        recordingResult.status === "recorded" &&
        recordingResult.sessionId &&
        recordingResult.record &&
        recordingResult.confidence > 0
      );

      const metrics = {
        status: recordingResult.status,
        session_id: recordingResult.sessionId,
        recording_time_ms: recordingTime,
        interactions_count: interactions.length,
        quality_score: recordingResult.record?.qualityScore,
        performance_delta: recordingResult.record?.performanceDelta,
        improvement_detected: recordingResult.record?.improvementDetected,
        knowledge_updates: recordingResult.record?.knowledgeUpdates ? Object.keys(recordingResult.record.knowledgeUpdates).length : 0
      };

      this.logger.logTestResult("Learning Session Recording", isValid, metrics);
      return isValid;
    } catch (error) {
      this.logger.logTestResult("Learning Session Recording", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 4: Database Persistence Simple
   */
  async testDatabasePersistence() {
    this.logger.info("🧪 Testing Database Persistence...");
    
    try {
      // Simple test - analyze context and check if data is stored
      const testInput = "Test database persistence functionality";
      await this.contextEngine.analyzeContext(testInput);

      // Wait for database operations
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check database directly
      const contextPatterns = await new Promise((resolve, reject) => {
        this.database.all("SELECT COUNT(*) as count FROM context_patterns", (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0].count);
        });
      });

      const persistenceValid = contextPatterns > 0;

      const metrics = {
        context_patterns_stored: contextPatterns
      };

      this.logger.logTestResult("Database Persistence", persistenceValid, metrics);
      return persistenceValid;
    } catch (error) {
      this.logger.logTestResult("Database Persistence", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 5: Performance Basic
   */
  async testPerformanceBasic() {
    this.logger.info("🧪 Testing Basic Performance...");
    
    try {
      const startTime = Date.now();

      // Perform 5 context analyses
      const promises = [];
      for (let i = 0; i < 5; i++) {
        const input = this.dataGenerator.generateRandomInput();
        promises.push(this.contextEngine.analyzeContext(input));
      }

      const analyses = await Promise.all(promises);
      const endTime = Date.now();

      // Calculate metrics
      const totalTime = endTime - startTime;
      const avgTimePerAnalysis = totalTime / analyses.length;

      // Performance thresholds (relaxed for basic test)
      const performanceValid = (
        avgTimePerAnalysis < 2000 && // Less than 2 seconds per analysis
        analyses.every(a => a.status === "measured")
      );

      const metrics = {
        total_time_ms: totalTime,
        avg_time_per_analysis_ms: avgTimePerAnalysis,
        analyses_completed: analyses.length,
        all_analyses_successful: analyses.every(a => a.status === "measured")
      };

      this.logger.logTestResult("Basic Performance", performanceValid, metrics);
      return performanceValid;
    } catch (error) {
      this.logger.logTestResult("Basic Performance", false, { error: error.message });
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    this.logger.info("🎯 Starting Phase 1 Complete Test Suite");
    console.log("=" .repeat(80));

    const testResults = [];

    // Initialize
    const initSuccess = await this.initialize();
    if (!initSuccess) {
      this.logger.error("❌ Failed to initialize test suite");
      return false;
    }

    // Run individual tests
    testResults.push(await this.testContextAnalysis());
    testResults.push(await this.testPatternRecognition());
    testResults.push(await this.testLearningSessionRecording());
    testResults.push(await this.testDatabasePersistence());
    testResults.push(await this.testPerformanceBasic());

    // Get final metrics
    const contextMetrics = this.contextEngine.getMetrics();
    const learningMetrics = this.learningSystem.getLearningMetrics();

    // Cleanup
    await this.cleanup();

    // Summary
    const summary = this.logger.getSummary();
    console.log("\n" + "=".repeat(80));
    console.log("📊 PHASE 1 TEST SUITE SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Tests Passed: ${summary.passed}/${summary.total}`);
    console.log(`📈 Success Rate: ${(summary.success_rate * 100).toFixed(1)}%`);
    console.log(`⏱️  Total Duration: ${summary.duration}ms`);
    console.log(`🧠 Context Engine Metrics:`, {
      memory_size: contextMetrics.memorySize,
      avg_success_rate: contextMetrics.averageSuccessRate?.toFixed(3),
      confidence: contextMetrics.confidence?.toFixed(3)
    });
    console.log(`📚 Learning System Metrics:`, {
      knowledge_patterns: learningMetrics.totalKnowledgePatterns,
      learning_sessions: learningMetrics.totalLearningSessions,
      avg_quality: learningMetrics.averageLearningQuality?.toFixed(3),
      improvement_rate: learningMetrics.improvementRate?.toFixed(3)
    });

    const overallSuccess = summary.success_rate >= 0.8; // 80% tests must pass
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (overallSuccess) {
      console.log("🚀 Phase 1 Context Intelligence & Learning Systems are ready!");
      console.log("🎯 Ready to proceed to Phase 2 - Response Generation");
    } else {
      console.log("⚠️  Phase 1 needs improvements before proceeding");
    }

    return overallSuccess;
  }

  async cleanup() {
    if (this.testConfig.cleanup_after_tests) {
      // Close database
      if (this.database) {
        this.database.close();
      }
      
      // Remove test database file
      if (fs.existsSync(this.testConfig.database_path)) {
        fs.unlinkSync(this.testConfig.database_path);
        this.logger.info("🧹 Test database cleaned up");
      }
    }
  }
}

/**
 * Main test runner
 */
async function main() {
  const testSuite = new Phase1TestSuite();
  
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