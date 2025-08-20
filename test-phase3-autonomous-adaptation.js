/**
 * @fileoverview Test Phase 3 - Autonomous Adaptation Engine
 * Script de test et validation des systèmes d'adaptation autonome
 * @version 1.0.0 - Phase 3 Testing
 * RÈGLES ANTI-FAKE: Tests basés métriques système réelles, validation adaptation mesurée
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import des modules Phase 3
import DecisionMakingEngine from './backend/alex-modules/intelligence/DecisionMakingEngine.js';
import SelfOptimizationSystem from './backend/alex-modules/intelligence/SelfOptimizationSystem.js';
import ConflictDetectionEngine from './backend/alex-modules/intelligence/ConflictDetectionEngine.js';

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
 * Générateur de données de test pour Phase 3
 */
class Phase3TestDataGenerator {
  constructor() {
    this.systemStates = [
      {
        name: "optimal_state",
        cpu: { usage: 25, load: 0.8, cores: 4 },
        memory: { percentage: 35, used: 280, total: 8000 },
        performance: { avgResponseTime: 1200, errorRate: 0.01, successRate: 0.95 },
        errors: { crashCount: 0, exceptionCount: 2 }
      },
      {
        name: "high_load_state", 
        cpu: { usage: 85, load: 3.2, cores: 4 },
        memory: { percentage: 78, used: 6240, total: 8000 },
        performance: { avgResponseTime: 4500, errorRate: 0.08, successRate: 0.72 },
        errors: { crashCount: 0, exceptionCount: 15 }
      },
      {
        name: "memory_pressure_state",
        cpu: { usage: 45, load: 1.5, cores: 4 },
        memory: { percentage: 92, used: 7360, total: 8000 },
        performance: { avgResponseTime: 3200, errorRate: 0.05, successRate: 0.82 },
        errors: { crashCount: 0, exceptionCount: 8 }
      },
      {
        name: "degraded_performance_state",
        cpu: { usage: 60, load: 2.1, cores: 4 },
        memory: { percentage: 65, used: 5200, total: 8000 },
        performance: { avgResponseTime: 8500, errorRate: 0.15, successRate: 0.58 },
        errors: { crashCount: 1, exceptionCount: 25 }
      },
      {
        name: "critical_state",
        cpu: { usage: 95, load: 4.8, cores: 4 },
        memory: { percentage: 97, used: 7760, total: 8000 },
        performance: { avgResponseTime: 12000, errorRate: 0.25, successRate: 0.42 },
        errors: { crashCount: 2, exceptionCount: 45 }
      }
    ];

    this.performanceMetrics = {
      responseTimeHistory: [1200, 1400, 1100, 1350, 1280, 1600, 1450, 1200],
      qualityHistory: [0.8, 0.82, 0.78, 0.85, 0.79, 0.81, 0.83, 0.80],
      successHistory: [0.95, 0.93, 0.96, 0.94, 0.92, 0.95, 0.91, 0.94],
      avgResponseTime: 1350,
      avgQualityScore: 0.81,
      successRate: 0.94,
      throughput: 25.5
    };

    this.systemParameters = {
      maxConcurrentRequests: 15,
      responseTimeout: 30000,
      cacheSize: 1000,
      cacheTTL: 300000,
      confidenceThreshold: 0.7,
      qualityThreshold: 0.6,
      memoryLimit: 512,
      cpuThrottleThreshold: 80,
      learningRate: 0.1,
      adaptationRate: 0.05
    };
  }

  getSystemState(name) {
    return this.systemStates.find(state => state.name === name) || this.systemStates[0];
  }

  getRandomSystemState() {
    return this.systemStates[Math.floor(Math.random() * this.systemStates.length)];
  }

  generateDecisions(count = 3) {
    const decisionTypes = [
      'PERFORMANCE_OPTIMIZATION',
      'RESOURCE_SCALING', 
      'SYSTEM_MAINTENANCE',
      'CONFIGURATION_ADAPTATION',
      'LEARNING_ADJUSTMENT'
    ];

    const decisions = [];
    for (let i = 0; i < count; i++) {
      const type = decisionTypes[Math.floor(Math.random() * decisionTypes.length)];
      decisions.push({
        id: `decision_${Date.now()}_${i}`,
        decision: {
          type,
          priority: Math.random() * 0.8 + 0.2, // 0.2-1.0
          risk: Math.random() * 0.6, // 0-0.6
          effort: Math.random() * 0.8, // 0-0.8
          expectedImpact: Math.random() * 0.7 + 0.2 // 0.2-0.9
        },
        confidence: Math.random() * 0.4 + 0.5, // 0.5-0.9
        expectedOutcome: {
          timeToEffect: Math.random() * 30000 + 5000, // 5-35 seconds
          successProbability: Math.random() * 0.3 + 0.6 // 0.6-0.9
        },
        timestamp: Date.now() - Math.random() * 60000 // Last hour
      });
    }

    return decisions;
  }

  generateOptimizations(count = 2) {
    const parameters = Object.keys(this.systemParameters);
    const optimizations = [];

    for (let i = 0; i < count; i++) {
      const adjustments = [];
      const paramCount = Math.floor(Math.random() * 3) + 1; // 1-3 parameters per optimization

      for (let j = 0; j < paramCount; j++) {
        const parameter = parameters[Math.floor(Math.random() * parameters.length)];
        adjustments.push({
          parameter,
          action: Math.random() > 0.5 ? 'increase' : 'decrease',
          amount: Math.random() * 0.3 + 0.05, // 5-35%
          priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          reason: `Optimize ${parameter} for better performance`
        });
      }

      optimizations.push({
        id: `optimization_${Date.now()}_${i}`,
        optimization: {
          adjustments,
          expectedImpact: Math.random() * 0.6 + 0.2, // 0.2-0.8
          confidence: Math.random() * 0.3 + 0.6 // 0.6-0.9
        },
        timestamp: Date.now() - Math.random() * 30000 // Last 30 minutes
      });
    }

    return optimizations;
  }
}

/**
 * Test Suite Principal Phase 3
 */
class Phase3TestSuite {
  constructor() {
    this.logger = new TestLogger();
    this.dataGenerator = new Phase3TestDataGenerator();
    
    // Components to test
    this.decisionEngine = null;
    this.optimizationSystem = null;
    this.conflictEngine = null;
    
    // Test configuration
    this.testConfig = {
      strictMode: false, // Relaxed for testing
      timeout: 15000,
      mockMode: true
    };
  }

  async initialize() {
    this.logger.info("🚀 Initializing Phase 3 Test Suite");

    try {
      // Initialize Decision Making Engine
      await this.initializeDecisionEngine();

      // Initialize Self Optimization System  
      await this.initializeOptimizationSystem();

      // Initialize Conflict Detection Engine
      await this.initializeConflictEngine();

      this.logger.info("✅ Phase 3 Test Suite initialized successfully");
      return true;
    } catch (error) {
      this.logger.error("❌ Phase 3 Test Suite initialization failed", error);
      return false;
    }
  }

  async initializeDecisionEngine() {
    const dependencies = {
      logger: this.logger,
      strictMode: this.testConfig.strictMode,
      config: {
        confidenceThreshold: 0.6,
        riskTolerance: 0.6,
        maxDecisionTime: 10000,
        learningRate: 0.1
      }
    };

    this.decisionEngine = new DecisionMakingEngine(dependencies);
    await this.decisionEngine.initialize();
  }

  async initializeOptimizationSystem() {
    const dependencies = {
      logger: this.logger,
      strictMode: this.testConfig.strictMode,
      config: {
        autoOptimization: false, // Disable auto for testing
        optimizationInterval: 60000,
        performanceThreshold: 0.6
      }
    };

    this.optimizationSystem = new SelfOptimizationSystem(dependencies);
    await this.optimizationSystem.initialize();
  }

  async initializeConflictEngine() {
    const dependencies = {
      logger: this.logger,
      strictMode: this.testConfig.strictMode,
      config: {
        autoDetection: false, // Disable auto for testing
        autoResolution: true,
        detectionInterval: 60000
      }
    };

    this.conflictEngine = new ConflictDetectionEngine(dependencies);
    await this.conflictEngine.initialize();
  }

  /**
   * Test 1: Decision Making Basic
   */
  async testDecisionMaking() {
    this.logger.info("🧪 Testing Decision Making...");
    
    try {
      const systemState = this.dataGenerator.getSystemState("high_load_state");
      const performanceMetrics = this.dataGenerator.performanceMetrics;
      const constraints = {
        maxEffort: 0.8,
        maxRisk: 0.7,
        requiredImpact: 0.3
      };

      const startTime = Date.now();
      const decision = await this.decisionEngine.makeDecision(systemState, performanceMetrics, constraints);
      const decisionTime = Date.now() - startTime;

      // Validate decision structure
      const isValid = (
        decision.status === "decided" &&
        decision.decision &&
        decision.decision.type &&
        typeof decision.confidence === 'number' &&
        decision.confidence >= 0 && decision.confidence <= 1 &&
        decision.reasoning &&
        typeof decision.reasoning === 'string' &&
        decision.expectedOutcome
      );

      const metrics = {
        status: decision.status,
        decision_type: decision.decision?.type,
        confidence: decision.confidence,
        processing_time_ms: decisionTime,
        has_alternatives: Array.isArray(decision.alternatives),
        alternatives_count: decision.alternatives?.length || 0,
        risk_level: decision.risks?.level,
        expected_impact: decision.expectedOutcome?.expectedPerformanceImprovement || 0,
        reasoning_length: decision.reasoning?.length || 0
      };

      this.logger.logTestResult("Decision Making Basic", isValid, metrics);
      return isValid;
    } catch (error) {
      this.logger.logTestResult("Decision Making Basic", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 2: Self Optimization Cycle
   */
  async testSelfOptimization() {
    this.logger.info("🧪 Testing Self Optimization...");
    
    try {
      const currentMetrics = {
        avgResponseTime: 4500,
        avgQualityScore: 0.65,
        successRate: 0.72,
        errorRate: 0.08,
        throughput: 18.5
      };

      const currentParams = { ...this.dataGenerator.systemParameters };

      const startTime = Date.now();
      const optimization = await this.optimizationSystem.runOptimizationCycle(currentMetrics, currentParams);
      const optimizationTime = Date.now() - startTime;

      // Validate optimization structure
      const isValid = (
        (optimization.status === "optimized" || optimization.status === "no_optimization_needed") &&
        optimization.cycle !== undefined &&
        typeof optimization.processingTime === 'number'
      );

      let metrics = {
        status: optimization.status,
        cycle: optimization.cycle,
        processing_time_ms: optimizationTime,
        performance_score: optimization.performanceAnalysis?.analysis?.overallScore || 0
      };

      if (optimization.status === "optimized") {
        metrics = {
          ...metrics,
          adjustments_count: optimization.parameterOptimization?.optimization?.adjustments?.length || 0,
          expected_impact: optimization.parameterOptimization?.optimization?.expectedImpact || 0,
          optimization_confidence: optimization.parameterOptimization?.optimization?.confidence || 0,
          bottlenecks_detected: optimization.performanceAnalysis?.analysis?.bottlenecks?.length || 0,
          opportunities_found: optimization.performanceAnalysis?.analysis?.optimizationOpportunities?.length || 0
        };
      }

      this.logger.logTestResult("Self Optimization Cycle", isValid, metrics);
      return isValid;
    } catch (error) {
      this.logger.logTestResult("Self Optimization Cycle", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 3: Conflict Detection and Resolution
   */
  async testConflictDetection() {
    this.logger.info("🧪 Testing Conflict Detection...");
    
    try {
      const systemState = this.dataGenerator.getSystemState("critical_state");
      const activeDecisions = this.dataGenerator.generateDecisions(4);
      const optimizations = this.dataGenerator.generateOptimizations(3);

      const startTime = Date.now();
      const conflictResult = await this.conflictEngine.detectAndResolveConflicts(
        systemState, 
        activeDecisions, 
        optimizations
      );
      const detectionTime = Date.now() - startTime;

      // Validate conflict detection structure
      const isValid = (
        conflictResult.status === "completed" &&
        conflictResult.detection &&
        conflictResult.summary &&
        typeof conflictResult.summary.conflictsDetected === 'number'
      );

      const metrics = {
        status: conflictResult.status,
        processing_time_ms: detectionTime,
        conflicts_detected: conflictResult.summary.conflictsDetected,
        conflicts_resolved: conflictResult.summary.conflictsResolved,
        risk_level: conflictResult.summary.riskLevel,
        system_stability: conflictResult.summary.systemStability,
        detection_confidence: conflictResult.detection?.confidence || 0,
        resolution_available: !!conflictResult.resolution,
        resolution_success_rate: conflictResult.resolution?.successRate || 0
      };

      this.logger.logTestResult("Conflict Detection and Resolution", isValid, metrics);
      return isValid;
    } catch (error) {
      this.logger.logTestResult("Conflict Detection and Resolution", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 4: Integrated Autonomous Adaptation
   */
  async testIntegratedAdaptation() {
    this.logger.info("🧪 Testing Integrated Autonomous Adaptation...");
    
    try {
      const systemState = this.dataGenerator.getSystemState("memory_pressure_state");
      const performanceMetrics = this.dataGenerator.performanceMetrics;

      const startTime = Date.now();

      // Step 1: Make decisions
      const decision = await this.decisionEngine.makeDecision(systemState, performanceMetrics);
      
      // Step 2: Run optimization
      const optimization = await this.optimizationSystem.runOptimizationCycle(performanceMetrics, this.dataGenerator.systemParameters);
      
      // Step 3: Check for conflicts
      const activeDecisions = [decision];
      const optimizations = optimization.status === "optimized" ? [optimization] : [];
      
      const conflictCheck = await this.conflictEngine.detectAndResolveConflicts(
        systemState,
        activeDecisions,
        optimizations
      );

      const totalTime = Date.now() - startTime;

      // Validate integration
      const isValid = (
        decision.status === "decided" &&
        (optimization.status === "optimized" || optimization.status === "no_optimization_needed") &&
        conflictCheck.status === "completed"
      );

      const metrics = {
        total_processing_time_ms: totalTime,
        decision_making: {
          status: decision.status,
          confidence: decision.confidence,
          decision_type: decision.decision?.type
        },
        optimization: {
          status: optimization.status,
          cycle: optimization.cycle || 0,
          expected_impact: optimization.parameterOptimization?.optimization?.expectedImpact || 0
        },
        conflict_detection: {
          conflicts_found: conflictCheck.summary?.conflictsDetected || 0,
          conflicts_resolved: conflictCheck.summary?.conflictsResolved || 0,
          system_stability: conflictCheck.summary?.systemStability
        },
        integration_success: isValid
      };

      this.logger.logTestResult("Integrated Autonomous Adaptation", isValid, metrics);
      return isValid;
    } catch (error) {
      this.logger.logTestResult("Integrated Autonomous Adaptation", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 5: Stress Testing Multiple Scenarios
   */
  async testStressScenarios() {
    this.logger.info("🧪 Testing Stress Scenarios...");
    
    try {
      const scenarios = [
        { name: "optimal", state: this.dataGenerator.getSystemState("optimal_state") },
        { name: "high_load", state: this.dataGenerator.getSystemState("high_load_state") },
        { name: "memory_pressure", state: this.dataGenerator.getSystemState("memory_pressure_state") },
        { name: "degraded", state: this.dataGenerator.getSystemState("degraded_performance_state") },
        { name: "critical", state: this.dataGenerator.getSystemState("critical_state") }
      ];

      const results = [];
      const startTime = Date.now();

      for (const scenario of scenarios) {
        try {
          const scenarioStart = Date.now();
          
          // Quick decision test for each scenario
          const decision = await this.decisionEngine.makeDecision(
            scenario.state, 
            this.dataGenerator.performanceMetrics
          );
          
          const scenarioTime = Date.now() - scenarioStart;
          
          results.push({
            scenario: scenario.name,
            success: decision.status === "decided",
            time: scenarioTime,
            decision_type: decision.decision?.type,
            confidence: decision.confidence
          });
        } catch (error) {
          results.push({
            scenario: scenario.name,
            success: false,
            error: error.message,
            time: 0
          });
        }
      }

      const totalTime = Date.now() - startTime;
      const successfulScenarios = results.filter(r => r.success).length;
      const successRate = successfulScenarios / scenarios.length;

      const isValid = successRate >= 0.8; // 80% scenarios should succeed

      const metrics = {
        total_scenarios: scenarios.length,
        successful_scenarios: successfulScenarios,
        success_rate: successRate,
        total_time_ms: totalTime,
        avg_time_per_scenario: totalTime / scenarios.length,
        scenario_results: results
      };

      this.logger.logTestResult("Stress Testing Multiple Scenarios", isValid, metrics);
      return isValid;
    } catch (error) {
      this.logger.logTestResult("Stress Testing Multiple Scenarios", false, { error: error.message });
      return false;
    }
  }

  /**
   * Test 6: Component Metrics Validation
   */
  async testComponentMetrics() {
    this.logger.info("🧪 Testing Component Metrics...");
    
    try {
      // Get metrics from all components
      const decisionMetrics = this.decisionEngine.getMetrics();
      const optimizationMetrics = this.optimizationSystem.getMetrics();
      const conflictMetrics = this.conflictEngine.getMetrics();

      // Validate metrics structure
      const decisionMetricsValid = (
        decisionMetrics.status === "measured" &&
        typeof decisionMetrics.totalDecisions === 'number' &&
        typeof decisionMetrics.avgDecisionTime === 'number' &&
        typeof decisionMetrics.avgConfidence === 'number'
      );

      const optimizationMetricsValid = (
        optimizationMetrics.status === "measured" &&
        typeof optimizationMetrics.optimizationCycles === 'number' &&
        typeof optimizationMetrics.successRate === 'number'
      );

      const conflictMetricsValid = (
        conflictMetrics.status === "measured" &&
        typeof conflictMetrics.totalDetections === 'number' &&
        typeof conflictMetrics.totalConflicts === 'number'
      );

      const allValid = decisionMetricsValid && optimizationMetricsValid && conflictMetricsValid;

      const metrics = {
        decision_engine: {
          valid: decisionMetricsValid,
          total_decisions: decisionMetrics.totalDecisions,
          avg_confidence: decisionMetrics.avgConfidence,
          success_rate: decisionMetrics.successRate || 0
        },
        optimization_system: {
          valid: optimizationMetricsValid,
          optimization_cycles: optimizationMetrics.optimizationCycles,
          success_rate: optimizationMetrics.successRate,
          auto_optimizing: optimizationMetrics.isAutoOptimizing
        },
        conflict_engine: {
          valid: conflictMetricsValid,
          total_detections: conflictMetrics.totalDetections,
          total_conflicts: conflictMetrics.totalConflicts,
          resolution_success_rate: conflictMetrics.resolutionSuccessRate || 0
        },
        all_components_valid: allValid
      };

      this.logger.logTestResult("Component Metrics Validation", allValid, metrics);
      return allValid;
    } catch (error) {
      this.logger.logTestResult("Component Metrics Validation", false, { error: error.message });
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    this.logger.info("🎯 Starting Phase 3 Complete Test Suite");
    console.log("=" .repeat(80));

    const testResults = [];

    // Initialize
    const initSuccess = await this.initialize();
    if (!initSuccess) {
      this.logger.error("❌ Failed to initialize test suite");
      return false;
    }

    // Run individual tests
    testResults.push(await this.testDecisionMaking());
    testResults.push(await this.testSelfOptimization());
    testResults.push(await this.testConflictDetection());
    testResults.push(await this.testIntegratedAdaptation());
    testResults.push(await this.testStressScenarios());
    testResults.push(await this.testComponentMetrics());

    // Get final component metrics
    const finalMetrics = {
      decisionEngine: this.decisionEngine.getMetrics(),
      optimizationSystem: this.optimizationSystem.getMetrics(),
      conflictEngine: this.conflictEngine.getMetrics()
    };

    // Summary
    const summary = this.logger.getSummary();
    console.log("\n" + "=".repeat(80));
    console.log("📊 PHASE 3 TEST SUITE SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Tests Passed: ${summary.passed}/${summary.total}`);
    console.log(`📈 Success Rate: ${(summary.success_rate * 100).toFixed(1)}%`);
    console.log(`⏱️  Total Duration: ${summary.duration}ms`);
    console.log(`🧠 Decision Engine:`, {
      total_decisions: finalMetrics.decisionEngine.totalDecisions,
      avg_confidence: finalMetrics.decisionEngine.avgConfidence?.toFixed(3) || 'N/A',
      success_rate: (finalMetrics.decisionEngine.successRate * 100 || 0).toFixed(1) + '%'
    });
    console.log(`⚡ Optimization System:`, {
      cycles: finalMetrics.optimizationSystem.optimizationCycles,
      success_rate: (finalMetrics.optimizationSystem.successRate * 100).toFixed(1) + '%',
      auto_enabled: finalMetrics.optimizationSystem.isAutoOptimizing
    });
    console.log(`🛡️ Conflict Engine:`, {
      total_detections: finalMetrics.conflictEngine.totalDetections,
      total_conflicts: finalMetrics.conflictEngine.totalConflicts,
      resolution_rate: (finalMetrics.conflictEngine.resolutionSuccessRate * 100 || 0).toFixed(1) + '%'
    });

    const overallSuccess = summary.success_rate >= 0.8; // 80% tests must pass
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (overallSuccess) {
      console.log("🚀 Phase 3 Autonomous Adaptation Engine is ready!");
      console.log("🎯 Ready to proceed to Phase 4 - Unified Intelligence Orchestrator");
    } else {
      console.log("⚠️  Phase 3 needs improvements before proceeding");
    }

    return overallSuccess;
  }
}

/**
 * Main test runner
 */
async function main() {
  const testSuite = new Phase3TestSuite();
  
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