/**
 * @fileoverview AlexKernel - Noyau Central d'Alex
 * Orchestrateur principal de tous les modules Alex
 * @module AlexKernel
 * @version 1.0.0 - Core Orchestration System
 * RÈGLES ANTI-FAKE: Sources mesurées uniquement, DI, traçabilité complète
 */

import { EventEmitter } from "events";
import os from "os";
import process from "process";
import logger from "../config/logger.js";

// Dependency Injection Container
class MetricsCollector {
  constructor() {
    this.collectors = new Map();
    this.sources = new Map();
  }

  registerCollector(name, collector, source) {
    this.collectors.set(name, collector);
    this.sources.set(name, { source, registeredAt: Date.now() });
  }

  async collect(metricName, strict = true) {
    const collector = this.collectors.get(metricName);
    const sourceInfo = this.sources.get(metricName);
    
    if (!collector) {
      if (strict) {
        throw new Error(`Metric collector '${metricName}' not registered`);
      }
      return {
        status: "unknown",
        reason: "collector_not_found",
        timestamp: Date.now()
      };
    }

    try {
      const result = await collector();
      const now = Date.now();
      
      return {
        value: result,
        source: sourceInfo.source,
        timestamp: now,
        collector: metricName,
        confidence: this.calculateConfidence(now - sourceInfo.registeredAt),
        status: "measured"
      };
    } catch (error) {
      logger.error(`Metric collection failed for ${metricName}:`, error);
      
      if (strict) {
        throw error;
      }
      
      return {
        status: "error",
        error: error.message,
        source: sourceInfo.source,
        timestamp: Date.now(),
        confidence: 0
      };
    }
  }

  calculateConfidence(age) {
    // Confidence degrades over time - fresh data = high confidence
    const maxAge = 60000; // 1 minute
    if (age > maxAge) return 0.1;
    return Math.max(0.1, 1 - (age / maxAge));
  }
}

export class AlexKernel extends EventEmitter {
  constructor(dependencies = {}) {
    super();

    // Dependency Injection - NO global access
    this.metricsCollector = dependencies.metricsCollector || new MetricsCollector();
    this.apiKeys = dependencies.apiKeys || process.env; // Injection des clés API
    this.strictMode = dependencies.strictMode !== undefined ? dependencies.strictMode : true;

    this.kernelConfig = {
      version: "1.0.0",
      name: "Alex Core Kernel",
      autonomyEnabled: true,
      strictMode: this.strictMode
    };

    this.loadedModules = new Map();
    this.activeProcesses = new Map();
    this.startTime = null;
    this.isInitialized = false;

    // Registrar des collectors de métriques système réelles
    this.setupSystemMetricsCollectors();
    
    try {
      logger.info("🔥 AlexKernel initializing with strict anti-fake rules");
    } catch (error) {
      // Logger fallback - no global access
    }
  }

  setupSystemMetricsCollectors() {
    // CPU Usage - Source: os.loadavg()
    this.metricsCollector.registerCollector(
      'cpu_usage',
      () => {
        const loadAvg = os.loadavg();
        const cpuCount = os.cpus().length;
        return {
          load1min: loadAvg[0],
          load5min: loadAvg[1], 
          load15min: loadAvg[2],
          utilization: Math.min(1, loadAvg[0] / cpuCount),
          cpuCount
        };
      },
      'os.loadavg()'
    );

    // Memory Usage - Source: os.totalmem(), os.freemem()
    this.metricsCollector.registerCollector(
      'memory_usage',
      () => {
        const total = os.totalmem();
        const free = os.freemem();
        const used = total - free;
        return {
          total,
          free,
          used,
          utilization: used / total,
          available: free
        };
      },
      'os.totalmem()/os.freemem()'
    );

    // Process Metrics - Source: process.memoryUsage(), process.cpuUsage()
    this.metricsCollector.registerCollector(
      'process_metrics',
      () => {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        return {
          memory: {
            rss: memUsage.rss,
            heapTotal: memUsage.heapTotal,
            heapUsed: memUsage.heapUsed,
            external: memUsage.external
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          },
          uptime: process.uptime(),
          pid: process.pid
        };
      },
      'process.memoryUsage()/process.cpuUsage()'
    );

    // Module Health - Source: this.loadedModules analysis
    this.metricsCollector.registerCollector(
      'module_health',
      async () => {
        const states = [];
        let activeCount = 0;
        let healthyCount = 0;

        for (const [moduleId, module] of this.loadedModules) {
          try {
            // Try to call module health check if exists
            const health = typeof module.getHealth === 'function' 
              ? await module.getHealth()
              : { status: "unknown", reason: "no_health_check" };
            
            states.push({
              moduleId,
              health,
              hasHealthCheck: typeof module.getHealth === 'function',
              timestamp: Date.now()
            });

            if (health.status === 'active') activeCount++;
            if (health.status === 'healthy') healthyCount++;
          } catch (error) {
            states.push({
              moduleId,
              health: { status: "error", error: error.message },
              hasHealthCheck: false,
              timestamp: Date.now()
            });
          }
        }

        return {
          totalModules: this.loadedModules.size,
          activeCount,
          healthyCount,
          healthPercentage: this.loadedModules.size > 0 
            ? healthyCount / this.loadedModules.size 
            : null,
          moduleStates: states
        };
      },
      'this.loadedModules.analysis'
    );

    // Consciousness Metrics - Source: interaction complexity analysis
    this.metricsCollector.registerCollector(
      'consciousness_metrics',
      () => {
        if (!this.interactionTracker) {
          return {
            status: "no_data",
            reason: "interaction_tracking_not_initialized",
            complexityScore: null,
            integrationLevel: null,
            memoryDepth: null
          };
        }

        const now = Date.now();
        const timeWindow = 600000; // 10 minutes
        const cutoff = now - timeWindow;

        // Filter recent interactions
        const recentInteractions = this.interactionTracker.interactions.filter(i => i.timestamp > cutoff);
        
        if (recentInteractions.length === 0) {
          return {
            status: "no_recent_data",
            totalInteractions: 0,
            complexityScore: null,
            integrationLevel: null,
            memoryDepth: null
          };
        }

        // Calculate complexity score based on tool chains and integration depth
        const totalComplexity = recentInteractions.reduce((sum, interaction) => {
          return sum + (interaction.toolChainLength || 1) * (interaction.integrationDepth || 1);
        }, 0);
        
        const averageComplexity = totalComplexity / recentInteractions.length;
        const maxObservedComplexity = 50; // Theoretical maximum
        const complexityScore = Math.min(1, averageComplexity / maxObservedComplexity);

        // Calculate integration level from cross-module interactions
        const integrationEvents = recentInteractions.filter(i => i.crossModuleInteraction).length;
        const integrationLevel = recentInteractions.length > 0 
          ? integrationEvents / recentInteractions.length 
          : null;

        // Calculate memory depth from context retention
        const memoryEvents = recentInteractions.filter(i => i.contextRetained).length;
        const memoryDepth = recentInteractions.length > 0 
          ? memoryEvents / recentInteractions.length 
          : null;

        return {
          status: "measured",
          totalInteractions: recentInteractions.length,
          complexityScore,
          integrationLevel,
          memoryDepth,
          averageComplexity,
          timeWindow,
          dataFreshness: now - Math.max(...recentInteractions.map(i => i.timestamp))
        };
      },
      'this.interactionTracker.analysis'
    );
  }

  async initialize() {
    this.isInitialized = true;
    this.startTime = Date.now();

    // Test des collectors critiques
    try {
      await this.metricsCollector.collect('cpu_usage', true);
      await this.metricsCollector.collect('memory_usage', true);
      await this.metricsCollector.collect('process_metrics', true);
      
      logger.info("✅ AlexKernel metrics collectors validated - authentic sources active");
    } catch (error) {
      logger.error("❌ Critical metrics collectors failed:", error);
      if (this.strictMode) {
        throw new Error(`Kernel initialization failed: ${error.message}`);
      }
    }

    logger.info("✨ AlexKernel fully initialized - anti-fake rules active");

    // Emit with measured data only
    const autonomyData = await this.calculateDynamicAutonomyLevel();
    
    this.emit("kernel_ready", {
      version: this.kernelConfig.version,
      autonomyLevel: autonomyData.status === "measured" ? autonomyData : null,
      timestamp: new Date(),
      strictMode: this.strictMode
    });
  }

  /**
   * Orchestration authentique des modules Alex
   * ANTI-FAKE: Sources mesurées, traçabilité complète, pas de valeurs magiques
   */
  async orchestrateModules() {
    const orchestrationId = `orch_${Date.now()}_${process.pid}`;
    const startTime = Date.now();
    
    logger.info(`Starting orchestration ${orchestrationId}`, {
      moduleCount: this.loadedModules.size,
      strictMode: this.strictMode
    });

    try {
      // Phase 1: Analyse système basée sur sources mesurées
      const systemAnalysis = await this.performSystemHealthAnalysis();
      
      if (systemAnalysis.status !== "measured" && this.strictMode) {
        throw new Error("System analysis failed - no measured data available");
      }

      // Phase 2: Évaluation modules avec sources réelles
      const moduleStates = await this.evaluateAllModuleStates();

      // Phase 3: Détection conflits basée sur métriques réelles
      const conflictResolution = await this.resolveModuleConflicts(moduleStates);

      // Phase 4: Calcul cohérence système - AUCUNE valeur magique
      const systemCoherence = await this.calculateRealSystemCoherence(
        systemAnalysis, 
        moduleStates, 
        conflictResolution
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      const result = {
        orchestrationId,
        status: "completed",
        duration,
        timestamp: endTime,
        systemAnalysis: {
          status: systemAnalysis.status,
          source: systemAnalysis.source,
          confidence: systemAnalysis.confidence
        },
        moduleStates: {
          total: moduleStates.totalCount || 0,
          active: moduleStates.activeCount || 0,
          healthy: moduleStates.healthyCount || 0,
          confidence: moduleStates.confidence || 0
        },
        systemCoherence: {
          level: systemCoherence.coherenceLevel,
          confidence: systemCoherence.confidence,
          contributors: systemCoherence.contributors
        },
        metrics: {
          source: "measured",
          traceability: {
            systemMetrics: systemAnalysis.source,
            moduleMetrics: moduleStates.source,
            coherenceCalculation: "composite_measured_values"
          }
        }
      };

      logger.info(`Orchestration ${orchestrationId} completed`, {
        duration,
        systemHealth: systemAnalysis.status,
        moduleHealth: `${moduleStates.healthyCount}/${moduleStates.totalCount}`
      });

      return result;

    } catch (error) {
      logger.error(`Orchestration ${orchestrationId} failed:`, error);
      
      if (this.strictMode) {
        throw error;
      }

      return {
        orchestrationId,
        status: "error",
        error: error.message,
        timestamp: Date.now(),
        emergencyMode: true,
        source: "error_fallback"
      };
    }
  }

  /**
   * Analyse santé système - SOURCES MESURÉES UNIQUEMENT
   */
  async performSystemHealthAnalysis() {
    try {
      const cpuMetrics = await this.metricsCollector.collect('cpu_usage', this.strictMode);
      const memoryMetrics = await this.metricsCollector.collect('memory_usage', this.strictMode);
      const processMetrics = await this.metricsCollector.collect('process_metrics', this.strictMode);

      // Vérification: toutes les métriques doivent être mesurées
      const allMeasured = [cpuMetrics, memoryMetrics, processMetrics]
        .every(metric => metric.status === "measured");

      if (!allMeasured && this.strictMode) {
        throw new Error("Incomplete system metrics - cannot perform analysis");
      }

      // Calcul composite basé UNIQUEMENT sur valeurs mesurées
      const healthFactors = [];
      let totalConfidence = 0;
      let factorCount = 0;

      if (cpuMetrics.status === "measured") {
        // CPU health: inversely related to utilization
        const cpuHealth = Math.max(0, 1 - cpuMetrics.value.utilization);
        healthFactors.push({
          factor: "cpu",
          value: cpuHealth,
          source: cpuMetrics.source,
          confidence: cpuMetrics.confidence
        });
        totalConfidence += cpuMetrics.confidence;
        factorCount++;
      }

      if (memoryMetrics.status === "measured") {
        // Memory health: based on available memory
        const memoryHealth = memoryMetrics.value.free / memoryMetrics.value.total;
        healthFactors.push({
          factor: "memory", 
          value: memoryHealth,
          source: memoryMetrics.source,
          confidence: memoryMetrics.confidence
        });
        totalConfidence += memoryMetrics.confidence;
        factorCount++;
      }

      const overallConfidence = factorCount > 0 ? totalConfidence / factorCount : 0;

      if (healthFactors.length === 0) {
        return {
          status: "unknown",
          reason: "no_measured_health_factors",
          timestamp: Date.now(),
          confidence: 0
        };
      }

      // Weighted average of health factors
      const overallHealth = healthFactors.reduce((sum, factor) => 
        sum + (factor.value * factor.confidence), 0
      ) / healthFactors.reduce((sum, factor) => sum + factor.confidence, 0);

      return {
        status: "measured",
        overallHealth: overallHealth * 100, // Percentage
        confidence: overallConfidence,
        factors: healthFactors,
        metrics: {
          cpu: cpuMetrics,
          memory: memoryMetrics,
          process: processMetrics
        },
        source: "composite_system_metrics",
        timestamp: Date.now()
      };

    } catch (error) {
      logger.error("System health analysis failed:", error);
      
      if (this.strictMode) {
        throw error;
      }

      return {
        status: "error",
        error: error.message,
        timestamp: Date.now(),
        confidence: 0
      };
    }
  }

  /**
   * Évaluation états modules - SOURCES MESURÉES
   */
  async evaluateAllModuleStates() {
    try {
      const moduleHealth = await this.metricsCollector.collect('module_health', this.strictMode);

      if (moduleHealth.status !== "measured" && this.strictMode) {
        throw new Error("Module health metrics unavailable");
      }

      return {
        status: moduleHealth.status,
        source: moduleHealth.source,
        confidence: moduleHealth.confidence,
        totalCount: moduleHealth.value?.totalModules || 0,
        activeCount: moduleHealth.value?.activeCount || 0,
        healthyCount: moduleHealth.value?.healthyCount || 0,
        healthPercentage: moduleHealth.value?.healthPercentage || 0,
        moduleStates: moduleHealth.value?.moduleStates || [],
        timestamp: moduleHealth.timestamp
      };

    } catch (error) {
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

  /**
   * Résolution conflits - SOURCES MESURÉES UNIQUEMENT
   */
  async resolveModuleConflicts(moduleStates) {
    if (this.strictMode) {
      throw new Error("conflict_detection_not_implemented");
    }
    
    return {
      status: "not_implemented",
      reason: "no_conflict_detectors_available",
      resolvedCount: 0,
      resolutionSuccess: false,
      source: "none",
      timestamp: Date.now(),
      confidence: 0,
      todo: "Implement port/resource monitoring, dependency graph analysis"
    };
  }

  /**
   * Calcul cohérence système - COMPOSITE DE VALEURS MESURÉES
   */
  async calculateRealSystemCoherence(systemAnalysis, moduleStates, conflictResolution) {
    const contributors = [];
    let totalWeight = 0;
    let weightedSum = 0;

    // Contribution santé système (si mesurée)
    if (systemAnalysis.status === "measured" && systemAnalysis.overallHealth !== undefined) {
      const healthFactor = systemAnalysis.overallHealth / 100;
      const weight = systemAnalysis.confidence * 0.4;
      
      contributors.push({
        factor: "system_health",
        value: healthFactor,
        weight: weight,
        source: systemAnalysis.source,
        confidence: systemAnalysis.confidence
      });
      
      weightedSum += healthFactor * weight;
      totalWeight += weight;
    }

    // Contribution santé modules (si mesurée)
    if (moduleStates.status === "measured" && moduleStates.healthPercentage !== undefined) {
      const moduleFactor = moduleStates.healthPercentage / 100;
      const weight = moduleStates.confidence * 0.4;
      
      contributors.push({
        factor: "module_health",
        value: moduleFactor,
        weight: weight,
        source: moduleStates.source,
        confidence: moduleStates.confidence
      });
      
      weightedSum += moduleFactor * weight;
      totalWeight += weight;
    }

    // Contribution résolution conflits (si applicable)
    if (conflictResolution.resolutionSuccess !== undefined) {
      const conflictFactor = conflictResolution.resolutionSuccess ? 1.0 : 0.0;
      const weight = conflictResolution.confidence * 0.2;
      
      contributors.push({
        factor: "conflict_resolution",
        value: conflictFactor,
        weight: weight,
        source: conflictResolution.source,
        confidence: conflictResolution.confidence
      });
      
      weightedSum += conflictFactor * weight;
      totalWeight += weight;
    }

    if (totalWeight === 0) {
      return {
        status: "unknown",
        reason: "no_measurable_coherence_factors",
        coherenceLevel: null,
        confidence: 0,
        timestamp: Date.now()
      };
    }

    const coherenceLevel = weightedSum / totalWeight;
    const overallConfidence = contributors.reduce((sum, c) => sum + c.confidence, 0) / contributors.length;

    return {
      status: "measured",
      coherenceLevel,
      confidence: overallConfidence,
      contributors,
      calculation: {
        weightedSum,
        totalWeight,
        method: "weighted_average_measured_values"
      },
      source: "composite_coherence_calculation",
      timestamp: Date.now()
    };
  }

  /**
   * Statut système - MÉTRIQUES MESURÉES UNIQUEMENT
   */
  async getSystemStatus() {
    try {
      const realUptime = this.calculateRealUptime();
      const systemHealth = await this.performSystemHealthAnalysis();
      const moduleStates = await this.evaluateAllModuleStates();

      return {
        initialized: this.isInitialized,
        uptime: realUptime.value,
        uptimeFormatted: realUptime.formatted,
        uptimeSource: realUptime.source,
        modules: {
          total: moduleStates.totalCount,
          active: moduleStates.activeCount,
          healthy: moduleStates.healthyCount,
          source: moduleStates.source,
          confidence: moduleStates.confidence
        },
        systemHealth: {
          status: systemHealth.status,
          value: systemHealth.overallHealth,
          confidence: systemHealth.confidence,
          source: systemHealth.source
        },
        strictMode: this.strictMode,
        lastUpdate: Date.now(),
        traceability: {
          uptimeSource: realUptime.source,
          healthSource: systemHealth.source,
          moduleSource: moduleStates.source
        }
      };
    } catch (error) {
      logger.error("System status calculation failed:", error);
      
      if (this.strictMode) {
        throw error;
      }

      return {
        status: "error",
        error: error.message,
        initialized: this.isInitialized,
        strictMode: this.strictMode,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Calcul uptime réel - SOURCE MESURÉE
   */
  calculateRealUptime() {
    if (!this.startTime) {
      return {
        status: "unknown",
        reason: "start_time_not_recorded",
        source: "no_source"
      };
    }

    const uptimeMs = Date.now() - this.startTime;
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let formatted;
    if (days > 0) formatted = `${days}j ${hours % 24}h ${minutes % 60}m`;
    else if (hours > 0) formatted = `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    else if (minutes > 0) formatted = `${minutes}m ${seconds % 60}s`;
    else formatted = `${seconds}s`;

    return {
      value: uptimeMs,
      seconds,
      formatted,
      source: "this.startTime_measurement",
      timestamp: Date.now(),
      confidence: 1.0 // High confidence - direct measurement
    };
  }

  /**
   * Calcul autonomie dynamique - SOURCES MESURÉES UNIQUEMENT
   * Implémentation basée sur métriques de décisions réelles
   */
  async calculateDynamicAutonomyLevel() {
    // Register decision tracking collector if not exists
    if (!this.metricsCollector.collectors.has('decision_metrics')) {
      this.setupDecisionMetricsCollector();
    }

    try {
      const decisionMetrics = await this.metricsCollector.collect('decision_metrics', this.strictMode);
      
      if (decisionMetrics.status !== "measured") {
        if (this.strictMode) {
          throw new Error("Decision metrics not available for autonomy calculation");
        }
        return {
          status: "unknown",
          reason: "no_decision_data",
          confidence: 0,
          timestamp: Date.now(),
          source: "decision_tracking_unavailable"
        };
      }

      const decisions = decisionMetrics.value;
      
      // Calculate autonomy factors from real decision data
      const autonomyFactors = [];
      let totalWeight = 0;
      let weightedSum = 0;

      // Factor 1: Independent decision ratio
      if (decisions.totalDecisions > 0) {
        const independenceRatio = decisions.independentDecisions / decisions.totalDecisions;
        const weight = 0.4;
        
        autonomyFactors.push({
          factor: "decision_independence",
          value: independenceRatio,
          weight,
          source: "decision_tracking",
          confidence: decisionMetrics.confidence
        });
        
        weightedSum += independenceRatio * weight;
        totalWeight += weight;
      }

      // Factor 2: Learning adaptation rate
      if (decisions.adaptationEvents > 0) {
        const adaptationRate = Math.min(1, decisions.successfulAdaptations / decisions.adaptationEvents);
        const weight = 0.3;
        
        autonomyFactors.push({
          factor: "adaptation_rate", 
          value: adaptationRate,
          weight,
          source: "learning_tracking",
          confidence: decisionMetrics.confidence
        });
        
        weightedSum += adaptationRate * weight;
        totalWeight += weight;
      }

      // Factor 3: Decision latency (inverse - faster = more autonomous)
      if (decisions.averageLatency > 0) {
        const maxLatency = 10000; // 10s max acceptable
        const latencyScore = Math.max(0, 1 - (decisions.averageLatency / maxLatency));
        const weight = 0.3;
        
        autonomyFactors.push({
          factor: "decision_speed",
          value: latencyScore,
          weight,
          source: "timing_metrics",
          confidence: decisionMetrics.confidence
        });
        
        weightedSum += latencyScore * weight;
        totalWeight += weight;
      }

      if (totalWeight === 0) {
        return {
          status: "unknown",
          reason: "insufficient_decision_data",
          confidence: 0,
          timestamp: Date.now(),
          source: "decision_metrics_incomplete"
        };
      }

      const autonomyLevel = weightedSum / totalWeight;
      
      return {
        status: "measured",
        autonomyLevel,
        confidence: decisionMetrics.confidence,
        factors: autonomyFactors,
        calculation: {
          weightedSum,
          totalWeight,
          method: "weighted_decision_analysis"
        },
        source: "composite_decision_metrics",
        timestamp: Date.now()
      };

    } catch (error) {
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

  /**
   * Setup decision tracking metrics collector
   */
  setupDecisionMetricsCollector() {
    // Initialize decision tracking if not exists
    if (!this.decisionTracker) {
      this.decisionTracker = {
        decisions: [],
        adaptations: [],
        startTime: Date.now()
      };
    }

    this.metricsCollector.registerCollector(
      'decision_metrics',
      () => {
        const now = Date.now();
        const timeWindow = 300000; // 5 minutes
        const cutoff = now - timeWindow;

        // Filter recent decisions
        const recentDecisions = this.decisionTracker.decisions.filter(d => d.timestamp > cutoff);
        const recentAdaptations = this.decisionTracker.adaptations.filter(a => a.timestamp > cutoff);

        const totalDecisions = recentDecisions.length;
        const independentDecisions = recentDecisions.filter(d => d.type === 'independent').length;
        const adaptationEvents = recentAdaptations.length;
        const successfulAdaptations = recentAdaptations.filter(a => a.success).length;
        
        const averageLatency = totalDecisions > 0 
          ? recentDecisions.reduce((sum, d) => sum + d.latency, 0) / totalDecisions
          : null;

        return {
          totalDecisions,
          independentDecisions,
          adaptationEvents,
          successfulAdaptations,
          averageLatency,
          timeWindow,
          dataFreshness: now - Math.max(...recentDecisions.map(d => d.timestamp), 0)
        };
      },
      'this.decisionTracker.analysis'
    );
  }

  /**
   * Track a decision for autonomy calculation
   */
  trackDecision(type, latency, success = true) {
    if (!this.decisionTracker) {
      this.setupDecisionMetricsCollector();
    }

    this.decisionTracker.decisions.push({
      type, // 'independent', 'assisted', 'manual'
      latency,
      success,
      timestamp: Date.now()
    });
  }

  /**
   * Track an adaptation event for learning metrics
   */
  trackAdaptation(context, success) {
    if (!this.decisionTracker) {
      this.setupDecisionMetricsCollector();
    }

    this.decisionTracker.adaptations.push({
      context,
      success,
      timestamp: Date.now()
    });
  }

  /**
   * Track an interaction for consciousness metrics
   */
  trackInteraction(toolChainLength, integrationDepth, contextRetained, crossModuleInteraction = false) {
    if (!this.interactionTracker) {
      this.interactionTracker = {
        interactions: [],
        startTime: Date.now()
      };
    }

    this.interactionTracker.interactions.push({
      toolChainLength,
      integrationDepth, 
      contextRetained,
      crossModuleInteraction,
      timestamp: Date.now()
    });

    // Keep only last 1000 interactions to prevent memory leaks
    if (this.interactionTracker.interactions.length > 1000) {
      this.interactionTracker.interactions = this.interactionTracker.interactions.slice(-1000);
    }
  }

  /**
   * Calculate consciousness metrics based on interaction complexity
   */
  async calculateConsciousnessLevel() {
    try {
      const consciousnessMetrics = await this.metricsCollector.collect('consciousness_metrics', this.strictMode);
      
      if (consciousnessMetrics.status !== "measured") {
        if (this.strictMode) {
          throw new Error("Consciousness metrics not available");
        }
        return {
          status: "unknown",
          reason: "no_interaction_data",
          confidence: 0,
          timestamp: Date.now(),
          source: "consciousness_tracking_unavailable"
        };
      }

      const metrics = consciousnessMetrics.value;
      const factors = [];
      let totalWeight = 0;
      let weightedSum = 0;

      // Factor 1: Interaction complexity
      if (metrics.complexityScore !== null) {
        const weight = 0.4;
        factors.push({
          factor: "interaction_complexity",
          value: metrics.complexityScore,
          weight,
          source: "tool_chain_analysis"
        });
        weightedSum += metrics.complexityScore * weight;
        totalWeight += weight;
      }

      // Factor 2: Integration depth
      if (metrics.integrationLevel !== null) {
        const weight = 0.3;
        factors.push({
          factor: "integration_depth",
          value: metrics.integrationLevel,
          weight,
          source: "cross_module_analysis"
        });
        weightedSum += metrics.integrationLevel * weight;
        totalWeight += weight;
      }

      // Factor 3: Memory retention
      if (metrics.memoryDepth !== null) {
        const weight = 0.3;
        factors.push({
          factor: "memory_retention",
          value: metrics.memoryDepth,
          weight,
          source: "context_analysis"
        });
        weightedSum += metrics.memoryDepth * weight;
        totalWeight += weight;
      }

      if (totalWeight === 0) {
        return {
          status: "unknown",
          reason: "insufficient_interaction_data",
          confidence: 0,
          timestamp: Date.now(),
          source: "consciousness_metrics_incomplete"
        };
      }

      const consciousnessLevel = weightedSum / totalWeight;
      
      return {
        status: "measured",
        consciousnessLevel,
        confidence: consciousnessMetrics.confidence || 0.8,
        factors,
        rawMetrics: metrics,
        calculation: {
          weightedSum,
          totalWeight,
          method: "weighted_interaction_analysis"
        },
        source: "composite_consciousness_metrics",
        timestamp: Date.now()
      };

    } catch (error) {
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
}

export default AlexKernel;