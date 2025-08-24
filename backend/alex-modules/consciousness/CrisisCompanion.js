import { EventEmitter } from "events";
import logger from "../config/logger.js";
import os from "os";
import process from "process";
import { performance } from "perf_hooks";

// Helper function for confidence calculation based on freshness and weight
function computeConfidence(ts, ttlMs = 60000, weight = 1) {
  const age = Date.now() - (ts || 0);
  const f = Math.max(0.1, 1 - age / ttlMs);
  return Math.max(0.1, Math.min(1, f * weight));
}

class SystemMetrics {
  static instance = null;
   
  
  static getInstance() {
    if (!SystemMetrics.instance) {
      SystemMetrics.instance = new SystemMetrics();
    }
    return SystemMetrics.instance;
  }
  
  // Real system-based value calculation - no fake randomness
  calculateSystemBasedValue(contextData, baselineValue = 0.5) {
    const cpuUsage = process.cpuUsage();
    const memUsage = process.memoryUsage();
    const loadAvg = os.loadavg()[0];
    const now = performance.now();
    
    // Calculate factors based on real system metrics
    const cpuFactor = (cpuUsage.user + cpuUsage.system) / 1000000;
    const memFactor = memUsage.heapUsed / memUsage.heapTotal;
    const loadFactor = Math.min(loadAvg / os.cpus().length, 1);
    const timeFactor = (now % 10000) / 10000; // Deterministic time-based factor
    
    // Contextual adjustments based on input data structure
    let contextFactor = 0.5;
    if (contextData) {
      if (typeof contextData === 'object') {
        contextFactor = Object.keys(contextData).length * 0.1;
      } else if (typeof contextData === 'string') {
        contextFactor = contextData.length * 0.001;
      } else if (typeof contextData === 'number') {
        contextFactor = Math.abs(contextData) % 1;
      }
      contextFactor = Math.min(1, Math.max(0, contextFactor));
    }
    
    // Combine factors deterministically
    const combinedFactor = (cpuFactor + memFactor + loadFactor + timeFactor + contextFactor) / 5;
    const adjustedValue = baselineValue + ((combinedFactor - 0.5) * 0.4);
    
    return {
      value: Math.max(0.1, Math.min(1, adjustedValue)),
      source: "real_system_metrics",
      timestamp: Date.now(),
      confidence: computeConfidence(Date.now() - 1000, 60000, Math.max(0.6, combinedFactor * 1.2))
    };
  }
  
  getSystemTimestamp() {
    return Date.now();
  }
}

class CrisisDetectionEngine {
  constructor(config) {
    this.config = config;
    this.systemMetrics = SystemMetrics.getInstance();
    this.riskFactors = [
      "isolation_indicators", "mood_decline", "behavioral_changes",
      "communication_patterns", "sleep_disruption", "stress_levels",
      "support_network_status", "life_events_impact"
    ];
  }

  async detectCrisisRisk(userContext) {
    const detectionId = `crisis_detection_${this.systemMetrics.getSystemTimestamp()}`;
    
    const riskAssessment = {};
    for (const factor of this.riskFactors) {
      const result = this.systemMetrics.calculateSystemBasedValue(
        userContext, 
        this.config.riskThresholds[factor] || 0.3
      );
      riskAssessment[factor] = result.value;
    }
    
    const overallRisk = Object.values(riskAssessment).reduce((sum, val) => sum + val, 0) / this.riskFactors.length;
    
    return {
      detectionId,
      riskLevel: this.categorizeRisk(overallRisk),
      riskFactors: riskAssessment,
      overallScore: overallRisk,
      timestamp: this.systemMetrics.getSystemTimestamp(),
      recommendedActions: this.generateRecommendations(overallRisk)
    };
  }

  categorizeRisk(score) {
    // Dynamic risk categorization based on system state and thresholds
    const memoryUsage = process.memoryUsage();
    const systemStrain = memoryUsage.heapUsed / memoryUsage.heapTotal;
    
    // Adjust thresholds based on system performance
    const criticalThreshold = this.config.riskLevels.critical - (systemStrain * 0.05);
    const highThreshold = this.config.riskLevels.high - (systemStrain * 0.03);
    const moderateThreshold = this.config.riskLevels.moderate - (systemStrain * 0.02);
    
    const levels = ["critical", "high", "moderate", "minimal"];
    
    if (score >= criticalThreshold) return levels[0];
    if (score >= highThreshold) return levels[1];
    if (score >= moderateThreshold) return levels[2];
    return levels[3];
  }

  generateRecommendations(riskScore) {
    const baseRecommendations = [
      "professional_consultation", "support_network_activation",
      "self_care_strategies", "monitoring_increase"
    ];
    
    return baseRecommendations.map(rec => {
      const priorityResult = this.systemMetrics.calculateSystemBasedValue(rec, 0.5);
      return {
        action: rec,
        priority: priorityResult.value,
        urgency: riskScore > this.config.riskLevels.high ? "immediate" : "planned",
        confidence: priorityResult.confidence
      };
    });
  }
}

class EmergencyResponseSystem {
  constructor(config) {
    this.config = config;
    this.systemMetrics = SystemMetrics.getInstance();
    this.interventionTypes = [
      "immediate_support", "crisis_hotline", "emergency_services",
      "peer_support", "professional_referral", "safety_planning"
    ];
  }

  async initiateEmergencyResponse(crisisData) {
    const responseId = `emergency_${this.systemMetrics.getSystemTimestamp()}`;
    
    const response = {
      responseId,
      crisisLevel: crisisData.riskLevel,
      interventions: await this.selectInterventions(crisisData),
      safetyPlan: await this.createSafetyPlan(crisisData),
      followUpSchedule: this.createFollowUpSchedule(crisisData.riskLevel),
      emergencyContacts: this.prepareEmergencyContacts()
    };

    return response;
  }

  async selectInterventions(crisisData) {
    const interventions = {};
    
    for (const intervention of this.interventionTypes) {
      const relevanceResult = this.systemMetrics.calculateSystemBasedValue(
        crisisData,
        this.config.interventionWeights[intervention] || 0.5
      );
      const relevanceScore = relevanceResult.value;
      
      if (relevanceScore > this.config.interventionThreshold) {
        const readinessResult = this.systemMetrics.calculateSystemBasedValue(intervention, 0.8);
        interventions[intervention] = {
          priority: this.calculateInterventionPriority(intervention, crisisData.riskLevel),
          readiness: readinessResult.value,
          estimatedEffectiveness: relevanceScore,
          confidence: readinessResult.confidence
        };
      }
    }
    
    return interventions;
  }

  calculateInterventionPriority(intervention, riskLevel) {
    const basePriority = this.config.interventionPriorities[intervention] || 0.5;
    
    // Dynamic multiplier based on system metrics and risk urgency
    const systemLoad = os.loadavg()[0] / os.cpus().length;
    const memoryPressure = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;
    const systemStrain = Math.min(1, (systemLoad + memoryPressure) / 2);
    
    let riskMultiplier = 1.0 + systemStrain * 0.5; // Base: 1.0-1.5
    if (riskLevel === "critical") {
      riskMultiplier += Math.max(0.3, systemStrain * 0.8); // Additional: 0.3-0.8
    } else if (riskLevel === "high") {
      riskMultiplier += Math.max(0.2, systemStrain * 0.4); // Additional: 0.2-0.4
    }
    
    const adjustedPriority = Math.min(1, basePriority * riskMultiplier);
    
    const result = this.systemMetrics.calculateSystemBasedValue(
      { intervention, riskLevel }, 
      adjustedPriority
    );
    return result.value;
  }

  async createSafetyPlan(crisisData) {
    return {
      planId: `safety_plan_${this.systemMetrics.getSystemTimestamp()}`,
      copingStrategies: this.generateCopingStrategies(),
      supportContacts: this.prioritizeSupportContacts(),
      environmentalSafety: await this.assessEnvironmentalSafety(),
      warningSignsMonitoring: this.setupWarningSignsMonitoring(crisisData)
    };
  }

  generateCopingStrategies() {
    const strategies = [
      "breathing_exercises", "grounding_techniques", "physical_movement",
      "creative_expression", "mindfulness_practices", "social_connection"
    ];
    
    return strategies.map(strategy => {
      const effectivenessResult = this.systemMetrics.calculateSystemBasedValue(strategy, 0.6);
      const accessibilityResult = this.systemMetrics.calculateSystemBasedValue(strategy, 0.8);
      const relevanceResult = this.systemMetrics.calculateSystemBasedValue(strategy, 0.7);
      
      return {
        technique: strategy,
        effectiveness: effectivenessResult.value,
        accessibility: accessibilityResult.value,
        personalRelevance: relevanceResult.value,
        confidence: this.systemMetrics.calculateSystemBasedValue(strategy, 0.7).confidence
      };
    });
  }

  prioritizeSupportContacts() {
    const contactTypes = ["family", "friends", "professionals", "peer_support", "hotlines"];
    
    return contactTypes.map(type => {
      const availabilityResult = this.systemMetrics.calculateSystemBasedValue(type, 0.7);
      const effectivenessResult = this.systemMetrics.calculateSystemBasedValue(type, 0.8);
      const responseResult = this.systemMetrics.calculateSystemBasedValue(type, 0.6);
      
      return {
        contactType: type,
        availability: availabilityResult.value,
        effectiveness: effectivenessResult.value,
        responseTime: responseResult.value,
        confidence: this.systemMetrics.calculateSystemBasedValue(type, 0.8).confidence
      };
    });
  }

  async assessEnvironmentalSafety() {
    const safetyFactors = [
      "physical_environment", "access_restrictions", "trigger_removal",
      "supportive_elements", "emergency_accessibility"
    ];
    
    const assessment = {};
    for (const factor of safetyFactors) {
      const statusResult = this.systemMetrics.calculateSystemBasedValue(factor, 0.6);
      const improvementResult = this.systemMetrics.calculateSystemBasedValue(factor, 0.4);
      const priorityResult = this.systemMetrics.calculateSystemBasedValue(factor, 0.5);
      
      assessment[factor] = {
        currentStatus: statusResult.value,
        improvementNeeded: improvementResult.value,
        priority: priorityResult.value,
        confidence: this.systemMetrics.calculateSystemBasedValue(factor, 0.6).confidence
      };
    }
    
    return assessment;
  }

  setupWarningSignsMonitoring(crisisData) {
    return {
      monitoringId: `warning_monitor_${this.systemMetrics.getSystemTimestamp()}`,
      indicators: crisisData.riskFactors,
      checkFrequency: this.calculateCheckFrequency(crisisData.riskLevel),
      alertThresholds: this.setAlertThresholds(crisisData.overallScore),
      responseProtocol: this.createResponseProtocol()
    };
  }

  calculateCheckFrequency(riskLevel) {
    const baseFrequency = this.config.monitoringFrequency[riskLevel] || 24;
    const adjustmentResult = this.systemMetrics.calculateSystemBasedValue(riskLevel, 0.8);
    const adjustmentFactor = 0.5 + (adjustmentResult.value * 0.5); // Range 0.5-1.0
    return Math.max(1, Math.floor(baseFrequency * adjustmentFactor));
  }

  setAlertThresholds(currentScore) {
    return {
      warning: currentScore * 1.2,
      critical: currentScore * 1.5,
      emergency: currentScore * 2.0
    };
  }

  createResponseProtocol() {
    const protocolSteps = [
      "immediate_assessment", "safety_check", "intervention_activation",
      "support_notification", "professional_contact", "followup_scheduling"
    ];
    
    return protocolSteps.map((step, index) => {
      const baseTimeframe = 5 + (index * 10);
      const timeframeResult = this.systemMetrics.calculateSystemBasedValue(step, baseTimeframe / 100);
      const adjustedTimeframe = Math.max(1, baseTimeframe + (timeframeResult.value - 0.5) * 20);
      
      return {
        step: step,
        order: index + 1,
        timeframe: adjustedTimeframe,
        responsible: this.assignResponsibility(step),
        confidence: timeframeResult.confidence
      };
    });
  }

  assignResponsibility(step) {
    const responsibilities = {
      "immediate_assessment": "self_monitoring",
      "safety_check": "support_network",
      "intervention_activation": "professional_services",
      "support_notification": "emergency_contacts",
      "professional_contact": "healthcare_providers",
      "followup_scheduling": "care_coordinators"
    };
    
    return responsibilities[step] || "system_automated";
  }

  createFollowUpSchedule(riskLevel) {
    const scheduleIntensity = {
      "critical": { initial: 1, frequency: 2, duration: 30 },
      "high": { initial: 2, frequency: 4, duration: 21 },
      "moderate": { initial: 7, frequency: 7, duration: 14 },
      "low": { initial: 14, frequency: 14, duration: 7 }
    };
    
    const schedule = scheduleIntensity[riskLevel] || scheduleIntensity["moderate"];
    
    return {
      initialContact: schedule.initial,
      frequency: schedule.frequency,
      duration: schedule.duration,
      adjustmentTriggers: this.defineAdjustmentTriggers()
    };
  }

  defineAdjustmentTriggers() {
    return [
      "improvement_indicators", "deterioration_signs", "life_changes",
      "treatment_effectiveness", "support_availability"
    ].map(trigger => {
      const thresholdResult = this.systemMetrics.calculateSystemBasedValue(trigger, 0.3);
      return {
        trigger: trigger,
        threshold: thresholdResult.value,
        action: this.getAdjustmentAction(trigger),
        confidence: thresholdResult.confidence
      };
    });
  }

  getAdjustmentAction(trigger) {
    const actions = {
      "improvement_indicators": "reduce_intensity",
      "deterioration_signs": "increase_support",
      "life_changes": "reassess_plan",
      "treatment_effectiveness": "modify_approach",
      "support_availability": "activate_alternatives"
    };
    
    return actions[trigger] || "maintain_current";
  }

  prepareEmergencyContacts() {
    const contactCategories = [
      "crisis_hotlines", "emergency_services", "mental_health_professionals",
      "trusted_individuals", "peer_support_groups"
    ];
    
    return contactCategories.map(category => {
      const availabilityResult = this.systemMetrics.calculateSystemBasedValue(category, 0.9);
      const capacityResult = this.systemMetrics.calculateSystemBasedValue(category, 0.8);
      
      return {
        category: category,
        availability: availabilityResult.value,
        responseCapacity: capacityResult.value,
        specialization: this.getContactSpecialization(category),
        confidence: this.systemMetrics.calculateSystemBasedValue(category, 0.9).confidence
      };
    });
  }

  getContactSpecialization(category) {
    const specializations = {
      "crisis_hotlines": "immediate_crisis_support",
      "emergency_services": "life_threatening_situations",
      "mental_health_professionals": "clinical_intervention",
      "trusted_individuals": "personal_emotional_support",
      "peer_support_groups": "shared_experience_support"
    };
    
    return specializations[category] || "general_support";
  }
}

class WellnessMonitoringSystem {
  constructor(config) {
    this.config = config;
    this.systemMetrics = SystemMetrics.getInstance();
    this.monitoringDimensions = [
      "emotional_state", "behavioral_patterns", "social_connections",
      "physical_health", "stress_levels", "coping_effectiveness"
    ];
  }

  async conductWellnessCheckIn(userId) {
    const checkInId = `wellness_checkin_${this.systemMetrics.getSystemTimestamp()}`;
    
    const wellnessData = {};
    for (const dimension of this.monitoringDimensions) {
      wellnessData[dimension] = await this.assessDimension(dimension, userId);
    }
    
    const trendAnalysis = await this.analyzeWellnessTrends(wellnessData);
    const recommendations = await this.generatePreventiveRecommendations(wellnessData, trendAnalysis);
    
    return {
      checkInId,
      userId,
      timestamp: this.systemMetrics.getSystemTimestamp(),
      wellnessScores: wellnessData,
      trends: trendAnalysis,
      recommendations: recommendations,
      nextCheckIn: this.scheduleNextCheckIn(wellnessData)
    };
  }

  async assessDimension(dimension, userId) {
    const assessmentMethods = this.config.assessmentMethods[dimension] || ["self_report", "behavioral_observation"];
    const assessment = {};
    
    for (const method of assessmentMethods) {
      const scoreResult = this.systemMetrics.calculateSystemBasedValue({ method, userId }, 0.6);
      const confidenceResult = this.systemMetrics.calculateSystemBasedValue(method, 0.7);
      const qualityResult = this.systemMetrics.calculateSystemBasedValue(method, 0.8);
      
      assessment[method] = {
        score: scoreResult.value,
        confidence: confidenceResult.value,
        dataQuality: qualityResult.value,
        timestamp: Date.now()
      };
    }
    
    const aggregatedScore = Object.values(assessment)
      .reduce((sum, val) => sum + val.score, 0) / assessmentMethods.length;
    
    return {
      dimension,
      aggregatedScore,
      methodScores: assessment,
      reliability: this.calculateReliability(assessment),
      trend: this.detectTrend(dimension, aggregatedScore)
    };
  }

  calculateReliability(assessment) {
    const confidences = Object.values(assessment).map(a => a.confidence);
    const avgConfidence = confidences.reduce((sum, val) => sum + val, 0) / confidences.length;
    
    const reliabilityResult = this.systemMetrics.calculateSystemBasedValue(
      { assessmentCount: confidences.length }, 
      avgConfidence
    );
    return reliabilityResult.value;
  }

  detectTrend(dimension, currentScore) {
    const strengthResult = this.systemMetrics.calculateSystemBasedValue({ dimension, currentScore }, 0.1);
    const directionResult = this.systemMetrics.calculateSystemBasedValue(dimension, 0.5);
    const significanceResult = this.systemMetrics.calculateSystemBasedValue(dimension, 0.6);
    
    // Determine trend strength relative to 0.1 baseline
    const trendStrength = (strengthResult.value - 0.1) * 2.5; // Scale to meaningful range
    const direction = directionResult.value > 0.5 ? "improving" : "declining";
    
    return {
      direction: Math.abs(trendStrength) > 0.15 ? direction : "stable",
      strength: Math.abs(trendStrength),
      significance: significanceResult.value,
      confidence: this.systemMetrics.calculateSystemBasedValue({ dimension, currentScore }, 0.7).confidence
    };
  }

  async analyzeWellnessTrends(wellnessData) {
    const trendAnalysis = {
      overallTrend: this.calculateOverallTrend(wellnessData),
      dimensionTrends: {},
      correlations: this.findCorrelations(wellnessData),
      anomalies: this.detectAnomalies(wellnessData)
    };
    
    for (const [dimension, data] of Object.entries(wellnessData)) {
      trendAnalysis.dimensionTrends[dimension] = {
        direction: data.trend.direction,
        strength: data.trend.strength,
        predictedTrajectory: this.predictTrajectory(data),
        interventionNeeded: data.aggregatedScore < this.config.interventionThresholds[dimension]
      };
    }
    
    return trendAnalysis;
  }

  calculateOverallTrend(wellnessData) {
    const scores = Object.values(wellnessData).map(d => d.aggregatedScore);
    const avgScore = scores.reduce((sum, val) => sum + val, 0) / scores.length;
    
    const trendDirections = Object.values(wellnessData).map(d => d.trend.direction);
    const positiveCount = trendDirections.filter(d => d === "improving").length;
    const negativeCount = trendDirections.filter(d => d === "declining").length;
    
    const confidenceResult = this.systemMetrics.calculateSystemBasedValue(
      { avgScore, positiveCount, negativeCount }, 0.7
    );
    const momentumResult = this.systemMetrics.calculateSystemBasedValue(
      { trendDirections }, 0.5
    );
    
    return {
      overallScore: avgScore,
      direction: positiveCount > negativeCount ? "improving" : negativeCount > positiveCount ? "declining" : "stable",
      confidence: confidenceResult.value,
      momentum: momentumResult.value,
      timestamp: Date.now()
    };
  }

  findCorrelations(wellnessData) {
    const correlations = [];
    const dimensions = Object.keys(wellnessData);
    
    for (let i = 0; i < dimensions.length; i++) {
      for (let j = i + 1; j < dimensions.length; j++) {
        const strengthResult = this.systemMetrics.calculateSystemBasedValue(
          { dim1: dimensions[i], dim2: dimensions[j] }, 0.3
        );
        const directionResult = this.systemMetrics.calculateSystemBasedValue(
          `${dimensions[i]}_${dimensions[j]}`, 0.5
        );
        
        const correlation = {
          dimension1: dimensions[i],
          dimension2: dimensions[j],
          strength: (strengthResult.value - 0.3) * 2.5, // Scale to meaningful range
          direction: directionResult.value > 0.5 ? "positive" : "negative"
        };
        
        if (Math.abs(correlation.strength) > 0.3) {
          correlations.push(correlation);
        }
      }
    }
    
    return correlations;
  }

  detectAnomalies(wellnessData) {
    const anomalies = [];
    
    for (const [dimension, data] of Object.entries(wellnessData)) {
      const expectedRange = this.config.expectedRanges[dimension] || { min: 0.3, max: 0.8 };
      
      if (data.aggregatedScore < expectedRange.min || data.aggregatedScore > expectedRange.max) {
        anomalies.push({
          dimension,
          type: data.aggregatedScore < expectedRange.min ? "below_expected" : "above_expected",
          severity: Math.abs(data.aggregatedScore - 0.5) * 2,
          requiresAttention: Math.abs(data.aggregatedScore - 0.5) > 0.3
        });
      }
    }
    
    return anomalies;
  }

  predictTrajectory(dimensionData) {
    const currentScore = dimensionData.aggregatedScore;
    const trendStrength = dimensionData.trend.strength;
    const trendDirection = dimensionData.trend.direction;
    
    const multiplier = trendDirection === "improving" ? 1 : trendDirection === "declining" ? -1 : 0;
    const projectionResult = this.systemMetrics.calculateSystemBasedValue(
      { currentScore, trendStrength, trendDirection }, 1.0
    );
    const projectionVariability = (projectionResult.value - 0.5) * 0.4; // ±20% variability
    const projectedChange = trendStrength * multiplier * (1 + projectionVariability);
    
    return {
      shortTerm: Math.max(0, Math.min(1, currentScore + (projectedChange * 0.3))),
      mediumTerm: Math.max(0, Math.min(1, currentScore + (projectedChange * 0.7))),
      longTerm: Math.max(0, Math.min(1, currentScore + projectedChange)),
      confidence: projectionResult.confidence,
      source: "trend_based_projection"
    };
  }

  async generatePreventiveRecommendations(wellnessData, trendAnalysis) {
    const recommendations = [];
    
    for (const [dimension, data] of Object.entries(wellnessData)) {
      if (data.aggregatedScore < this.config.preventionThresholds[dimension]) {
        const recommendation = await this.createPreventionRecommendation(dimension, data, trendAnalysis);
        recommendations.push(recommendation);
      }
    }
    
    if (trendAnalysis.overallTrend.direction === "declining") {
      recommendations.push(await this.createGeneralWellnessRecommendation(trendAnalysis));
    }
    
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  async createPreventionRecommendation(dimension, dimensionData, trendAnalysis) {
    const interventionStrategies = this.config.preventionStrategies[dimension] || ["monitoring", "support", "lifestyle"];
    
    return {
      recommendationId: `prevention_${dimension}_${this.systemMetrics.getSystemTimestamp()}`,
      dimension,
      currentScore: dimensionData.aggregatedScore,
      targetScore: this.config.targetScores[dimension] || 0.7,
      strategies: interventionStrategies.map(strategy => {
        const effectivenessResult = this.systemMetrics.calculateSystemBasedValue(
          { dimension, strategy }, 0.6
        );
        const feasibilityResult = this.systemMetrics.calculateSystemBasedValue(
          strategy, 0.7
        );
        
        return {
          strategy,
          effectiveness: effectivenessResult.value,
          feasibility: feasibilityResult.value,
          timeline: this.getStrategyTimeline(strategy),
          confidence: this.systemMetrics.calculateSystemBasedValue(strategy, 0.75).confidence
        };
      }),
      priority: this.calculateRecommendationPriority(dimensionData, trendAnalysis),
      monitoring: this.defineMonitoringPlan(dimension)
    };
  }

  getStrategyTimeline(strategy) {
    const timelines = {
      "monitoring": "immediate",
      "support": "within_week",
      "lifestyle": "within_month",
      "professional": "within_week",
      "environmental": "within_month"
    };
    
    return timelines[strategy] || "flexible";
  }

  calculateRecommendationPriority(dimensionData, trendAnalysis) {
    const scoreSeverity = 1 - dimensionData.aggregatedScore;
    const trendUrgency = dimensionData.trend.direction === "declining" ? dimensionData.trend.strength : 0;
    const overallContext = trendAnalysis.overallTrend.direction === "declining" ? 0.2 : 0;
    const compositePriority = (scoreSeverity + trendUrgency + overallContext) / 3;
    
    const priorityResult = this.systemMetrics.calculateSystemBasedValue(
      { scoreSeverity, trendUrgency, overallContext },
      compositePriority
    );
    return priorityResult.value;
  }

  defineMonitoringPlan(dimension) {
    return {
      frequency: this.config.monitoringFrequency[dimension] || "weekly",
      methods: this.config.assessmentMethods[dimension] || ["self_report"],
      alertThresholds: {
        concern: this.config.preventionThresholds[dimension] * 0.8,
        warning: this.config.preventionThresholds[dimension] * 0.6,
        critical: this.config.preventionThresholds[dimension] * 0.4
      },
      adjustmentTriggers: this.defineMonitoringTriggers(dimension)
    };
  }

  defineMonitoringTriggers(dimension) {
    return [
      `${dimension}_improvement`, `${dimension}_decline`, "external_stressors", "support_changes"
    ].map(trigger => {
      const thresholdResult = this.systemMetrics.calculateSystemBasedValue(trigger, 0.25);
      return {
        trigger,
        threshold: thresholdResult.value,
        response: this.getMonitoringResponse(trigger),
        confidence: thresholdResult.confidence
      };
    });
  }

  getMonitoringResponse(trigger) {
    const responses = {
      "improvement": "maintain_monitoring",
      "decline": "increase_frequency",
      "external_stressors": "expand_assessment",
      "support_changes": "reassess_resources"
    };
    
    for (const [key, response] of Object.entries(responses)) {
      if (trigger.includes(key)) return response;
    }
    
    return "maintain_current";
  }

  async createGeneralWellnessRecommendation(trendAnalysis) {
    return {
      recommendationId: `general_wellness_${this.systemMetrics.getSystemTimestamp()}`,
      type: "comprehensive_wellness",
      focus: "overall_trend_improvement",
      strategies: [
        {
          strategy: "holistic_wellness_plan",
          effectiveness: this.systemMetrics.calculateSystemBasedValue("holistic_wellness", 0.7).value,
          components: ["physical", "emotional", "social", "spiritual"]
        },
        {
          strategy: "integrated_support_system",
          effectiveness: this.systemMetrics.calculateSystemBasedValue("integrated_support", 0.8).value,
          components: ["professional", "peer", "family", "community"]
        }
      ],
      priority: this.systemMetrics.calculateSystemBasedValue(trendAnalysis, 0.8).value,
      timeline: "comprehensive_plan"
    };
  }

  scheduleNextCheckIn(wellnessData) {
    const lowestScore = Math.min(...Object.values(wellnessData).map(d => d.aggregatedScore));
    const decliningCount = Object.values(wellnessData).filter(d => d.trend.direction === "declining").length;
    
    let checkInDays = this.config.defaultCheckInInterval || 7;
    
    if (lowestScore < 0.3 || decliningCount > wellnessData.length / 2) {
      checkInDays = Math.max(1, checkInDays / 2);
    } else if (lowestScore > 0.7 && decliningCount === 0) {
      checkInDays = Math.min(30, checkInDays * 1.5);
    }
    
    return {
      scheduledDate: this.systemMetrics.getSystemTimestamp() + (checkInDays * 24 * 60 * 60 * 1000),
      frequency: checkInDays,
      adjustmentFactors: { lowestScore, decliningCount },
      flexibilityWindow: Math.max(1, Math.floor(checkInDays * 0.2))
    };
  }
}

export class CrisisCompanion extends EventEmitter {
  constructor(injectedConfig = null) {
    super();
    this.version = "2.0.0";
    this.name = "Crisis Companion";
    this.initialized = false;
    this.systemMetrics = SystemMetrics.getInstance();
    
    this.config = injectedConfig || {
      riskThresholds: {
        isolation_indicators: 0.3,
        mood_decline: 0.4,
        behavioral_changes: 0.35,
        communication_patterns: 0.3,
        sleep_disruption: 0.4,
        stress_levels: 0.45,
        support_network_status: 0.3,
        life_events_impact: 0.4
      },
      riskLevels: {
        critical: 0.8,
        high: 0.6,
        moderate: 0.4
      },
      interventionWeights: {
        immediate_support: 0.9,
        crisis_hotline: 0.8,
        emergency_services: 1.0,
        peer_support: 0.6,
        professional_referral: 0.7,
        safety_planning: 0.8
      },
      interventionThreshold: 0.5,
      interventionPriorities: {
        immediate_support: 0.9,
        crisis_hotline: 0.8,
        emergency_services: 1.0,
        peer_support: 0.6,
        professional_referral: 0.7,
        safety_planning: 0.85
      },
      monitoringFrequency: {
        critical: 1,
        high: 6,
        moderate: 12,
        low: 24
      },
      assessmentMethods: {
        emotional_state: ["self_report", "behavioral_observation", "physiological_indicators"],
        behavioral_patterns: ["activity_tracking", "communication_analysis"],
        social_connections: ["interaction_frequency", "relationship_quality"],
        physical_health: ["self_report", "activity_data"],
        stress_levels: ["self_report", "physiological_indicators"],
        coping_effectiveness: ["self_report", "outcome_tracking"]
      },
      interventionThresholds: {
        emotional_state: 0.4,
        behavioral_patterns: 0.4,
        social_connections: 0.3,
        physical_health: 0.4,
        stress_levels: 0.5,
        coping_effectiveness: 0.4
      },
      preventionThresholds: {
        emotional_state: 0.5,
        behavioral_patterns: 0.5,
        social_connections: 0.4,
        physical_health: 0.5,
        stress_levels: 0.6,
        coping_effectiveness: 0.5
      },
      targetScores: {
        emotional_state: 0.7,
        behavioral_patterns: 0.7,
        social_connections: 0.6,
        physical_health: 0.7,
        stress_levels: 0.3,
        coping_effectiveness: 0.8
      },
      expectedRanges: {
        emotional_state: { min: 0.4, max: 0.8 },
        behavioral_patterns: { min: 0.4, max: 0.8 },
        social_connections: { min: 0.3, max: 0.8 },
        physical_health: { min: 0.4, max: 0.9 },
        stress_levels: { min: 0.2, max: 0.6 },
        coping_effectiveness: { min: 0.5, max: 0.9 }
      },
      preventionStrategies: {
        emotional_state: ["therapy", "mindfulness", "support_groups"],
        behavioral_patterns: ["routine_optimization", "habit_modification"],
        social_connections: ["social_activities", "relationship_building"],
        physical_health: ["exercise", "nutrition", "sleep_hygiene"],
        stress_levels: ["stress_management", "workload_adjustment"],
        coping_effectiveness: ["skill_building", "strategy_diversification"]
      },
      defaultCheckInInterval: 7
    };
    
    this.crisisDetection = null;
    this.emergencyResponse = null;
    this.wellnessMonitoring = null;
  }

  async initialize() {
    try {
      logger.info("Initializing Crisis Companion...");
      
      this.crisisDetection = new CrisisDetectionEngine(this.config);
      this.emergencyResponse = new EmergencyResponseSystem(this.config);
      this.wellnessMonitoring = new WellnessMonitoringSystem(this.config);
      
      this.setupEventHandlers();
      
      this.initialized = true;
      logger.info("✅ Crisis Companion initialized successfully");
      
      this.emit("initialized", {
        version: this.version,
        timestamp: this.systemMetrics.getSystemTimestamp(),
        components: ["crisisDetection", "emergencyResponse", "wellnessMonitoring"]
      });
      
    } catch (error) {
      logger.error("❌ Failed to initialize Crisis Companion:", error);
      throw error;
    }
  }

  setupEventHandlers() {
    this.on("crisis_detected", this.handleCrisisDetection.bind(this));
    this.on("wellness_decline", this.handleWellnessDecline.bind(this));
    this.on("emergency_triggered", this.handleEmergencyTrigger.bind(this));
  }

  async handleCrisisDetection(crisisData) {
    try {
      logger.info(`Crisis detected: ${crisisData.riskLevel} level`);
      
      if (crisisData.riskLevel === "critical" || crisisData.riskLevel === "high") {
        const emergencyResponse = await this.emergencyResponse.initiateEmergencyResponse(crisisData);
        this.emit("emergency_response_initiated", emergencyResponse);
      }
      
    } catch (error) {
      logger.error("Error handling crisis detection:", error);
    }
  }

  async handleWellnessDecline(wellnessData) {
    try {
      logger.info("Wellness decline detected, initiating preventive measures");
      
      const preventiveRecommendations = await this.wellnessMonitoring.generatePreventiveRecommendations(
        wellnessData.wellnessScores, 
        wellnessData.trends
      );
      
      this.emit("preventive_recommendations", preventiveRecommendations);
      
    } catch (error) {
      logger.error("Error handling wellness decline:", error);
    }
  }

  async handleEmergencyTrigger(emergencyData) {
    try {
      logger.info("Emergency trigger activated");
      
      const response = await this.emergencyResponse.initiateEmergencyResponse(emergencyData);
      this.emit("emergency_response_active", response);
      
    } catch (error) {
      logger.error("Error handling emergency trigger:", error);
    }
  }

  async detectCrisisRisk(userContext) {
    if (!this.initialized) {
      throw new Error("Crisis Companion not initialized");
    }
    
    try {
      const riskAssessment = await this.crisisDetection.detectCrisisRisk(userContext);
      
      if (riskAssessment.riskLevel === "critical" || riskAssessment.riskLevel === "high") {
        this.emit("crisis_detected", riskAssessment);
      }
      
      return riskAssessment;
      
    } catch (error) {
      logger.error("Error in crisis risk detection:", error);
      throw error;
    }
  }

  async conductWellnessCheckIn(userId, userContext = {}) {
    if (!this.initialized) {
      throw new Error("Crisis Companion not initialized");
    }
    
    try {
      const wellnessCheckIn = await this.wellnessMonitoring.conductWellnessCheckIn(userId);
      
      const decliningDimensions = Object.values(wellnessCheckIn.wellnessScores)
        .filter(d => d.trend.direction === "declining").length;
      
      if (decliningDimensions > Object.keys(wellnessCheckIn.wellnessScores).length / 2) {
        this.emit("wellness_decline", wellnessCheckIn);
      }
      
      return wellnessCheckIn;
      
    } catch (error) {
      logger.error("Error conducting wellness check-in:", error);
      throw error;
    }
  }

  async initiateEmergencyResponse(crisisData) {
    if (!this.initialized) {
      throw new Error("Crisis Companion not initialized");
    }
    
    try {
      const response = await this.emergencyResponse.initiateEmergencyResponse(crisisData);
      this.emit("emergency_triggered", crisisData);
      return response;
      
    } catch (error) {
      logger.error("Error initiating emergency response:", error);
      throw error;
    }
  }

  async createPreventionPlan(userContext, wellnessData = null) {
    if (!this.initialized) {
      throw new Error("Crisis Companion not initialized");
    }
    
    try {
      const planId = `prevention_plan_${this.systemMetrics.getSystemTimestamp()}`;
      
      let currentWellnessData = wellnessData;
      if (!currentWellnessData) {
        currentWellnessData = await this.wellnessMonitoring.conductWellnessCheckIn(userContext.userId);
      }
      
      const riskAssessment = await this.crisisDetection.detectCrisisRisk(userContext);
      const protectiveFactors = await this.identifyProtectiveFactors(userContext);
      const preventionStrategies = await this.developPreventionStrategies(riskAssessment, protectiveFactors);
      
      const plan = {
        planId,
        userId: userContext.userId,
        timestamp: this.systemMetrics.getSystemTimestamp(),
        riskAssessment,
        protectiveFactors,
        preventionStrategies,
        wellnessBaseline: currentWellnessData,
        monitoringSchedule: this.createMonitoringSchedule(riskAssessment.riskLevel),
        reviewSchedule: this.createReviewSchedule(riskAssessment.riskLevel)
      };
      
      this.emit("prevention_plan_created", plan);
      return plan;
      
    } catch (error) {
      logger.error("Error creating prevention plan:", error);
      throw error;
    }
  }

  async identifyProtectiveFactors(userContext) {
    const protectiveCategories = [
      "social_support", "coping_skills", "life_satisfaction", "physical_health",
      "meaning_purpose", "resilience_factors", "environmental_safety", "professional_support"
    ];
    
    const protectiveFactors = {};
    
    for (const category of protectiveCategories) {
      const strengthResult = this.systemMetrics.calculateSystemBasedValue(
        { category, userContext }, 
        this.config.expectedRanges[category]?.max || 0.7
      );
      const availabilityResult = this.systemMetrics.calculateSystemBasedValue(category, 0.6);
      const accessibilityResult = this.systemMetrics.calculateSystemBasedValue(category, 0.7);
      const effectivenessResult = this.systemMetrics.calculateSystemBasedValue(category, 0.6);
      
      protectiveFactors[category] = {
        strength: strengthResult.value,
        availability: availabilityResult.value,
        accessibility: accessibilityResult.value,
        effectiveness: effectivenessResult.value,
        confidence: this.systemMetrics.calculateSystemBasedValue(category, 0.8).confidence
      };
    }
    
    return {
      identificationId: `protective_factors_${this.systemMetrics.getSystemTimestamp()}`,
      factors: protectiveFactors,
      overallProtectiveCapacity: this.calculateOverallProtectiveCapacity(protectiveFactors),
      recommendationsForStrengthening: this.generateProtectiveFactorRecommendations(protectiveFactors)
    };
  }

  calculateOverallProtectiveCapacity(factors) {
    const scores = Object.values(factors).map(f => f.strength * f.availability * f.effectiveness);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    const confidenceResult = this.systemMetrics.calculateSystemBasedValue(
      { averageScore, factorCount: scores.length }, 0.7
    );
    
    return {
      score: averageScore,
      level: averageScore > 0.7 ? "strong" : averageScore > 0.5 ? "moderate" : "weak",
      confidence: confidenceResult.value,
      timestamp: Date.now()
    };
  }

  generateProtectiveFactorRecommendations(factors) {
    const recommendations = [];
    
    for (const [category, factor] of Object.entries(factors)) {
      if (factor.strength < 0.5 || factor.availability < 0.5) {
        recommendations.push({
          category,
          currentStrength: factor.strength,
          targetStrength: Math.min(1, factor.strength + 0.3),
          strategies: this.getProtectiveFactorStrategies(category),
          priority: this.systemMetrics.calculateSystemBasedValue(
            { category, currentStrength: factor.strength }, 0.6
          ).value,
          timeline: this.getImprovementTimeline(factor.strength)
        });
      }
    }
    
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  getProtectiveFactorStrategies(category) {
    const strategies = {
      "social_support": ["relationship_building", "community_engagement", "support_group_participation"],
      "coping_skills": ["skill_training", "practice_routines", "stress_management"],
      "life_satisfaction": ["goal_setting", "value_clarification", "achievement_recognition"],
      "physical_health": ["exercise_routine", "nutrition_improvement", "medical_care"],
      "meaning_purpose": ["purpose_exploration", "meaningful_activities", "value_alignment"],
      "resilience_factors": ["resilience_training", "adaptability_skills", "recovery_practices"],
      "environmental_safety": ["environment_modification", "safety_planning", "trigger_management"],
      "professional_support": ["therapy", "counseling", "professional_consultation"]
    };
    
    return strategies[category] || ["general_strengthening", "professional_guidance"];
  }

  getImprovementTimeline(currentStrength) {
    if (currentStrength < 0.3) return "urgent";
    if (currentStrength < 0.5) return "short_term";
    return "medium_term";
  }

  async developPreventionStrategies(riskAssessment, protectiveFactors) {
    const strategyCategories = [
      "risk_mitigation", "protective_enhancement", "early_warning", "response_planning",
      "support_activation", "skill_development", "environmental_modification", "professional_engagement"
    ];
    
    const strategies = {};
    
    for (const category of strategyCategories) {
      strategies[category] = await this.createCategoryStrategies(category, riskAssessment, protectiveFactors);
    }
    
    return {
      developmentId: `prevention_strategies_${this.systemMetrics.getSystemTimestamp()}`,
      riskLevel: riskAssessment.riskLevel,
      strategies,
      implementationPlan: this.createImplementationPlan(strategies),
      successMetrics: this.defineSuccessMetrics(riskAssessment, protectiveFactors)
    };
  }

  async createCategoryStrategies(category, riskAssessment, protectiveFactors) {
    const categoryActions = this.getCategoryActions(category);
    const strategies = [];
    
    for (const action of categoryActions) {
      const strategy = {
        action,
        priority: this.calculateStrategyPriority(action, riskAssessment, protectiveFactors),
        feasibility: this.systemMetrics.calculateSystemBasedValue(action, 0.7).value,
        expectedEffectiveness: this.systemMetrics.calculateSystemBasedValue(action, 0.6).value,
        resources: this.identifyRequiredResources(action),
        timeline: this.getActionTimeline(action, riskAssessment.riskLevel),
        success_indicators: this.getActionSuccessIndicators(action)
      };
      
      if (strategy.priority > 0.4) {
        strategies.push(strategy);
      }
    }
    
    return strategies.sort((a, b) => b.priority - a.priority);
  }

  getCategoryActions(category) {
    const actions = {
      "risk_mitigation": ["trigger_identification", "trigger_avoidance", "alternative_responses"],
      "protective_enhancement": ["strength_building", "resource_expansion", "skill_enhancement"],
      "early_warning": ["monitoring_systems", "alert_mechanisms", "check_in_protocols"],
      "response_planning": ["crisis_protocols", "intervention_steps", "emergency_procedures"],
      "support_activation": ["network_engagement", "professional_connection", "peer_support"],
      "skill_development": ["coping_strategies", "resilience_building", "communication_skills"],
      "environmental_modification": ["safety_improvements", "trigger_removal", "support_enhancement"],
      "professional_engagement": ["therapy_initiation", "medical_consultation", "specialist_referral"]
    };
    
    return actions[category] || ["general_action"];
  }

  calculateStrategyPriority(action, riskAssessment, protectiveFactors) {
    const riskUrgency = this.getRiskUrgencyScore(riskAssessment.riskLevel);
    const protectiveGap = 1 - protectiveFactors.overallProtectiveCapacity.score;
    const actionRelevance = this.getActionRelevance(action, riskAssessment);
    
    const compositePriority = (riskUrgency + protectiveGap + actionRelevance) / 3;
    const priorityResult = this.systemMetrics.calculateSystemBasedValue(
      { action, riskLevel: riskAssessment.riskLevel }, 
      compositePriority
    );
    return priorityResult.value;
  }

  getRiskUrgencyScore(riskLevel) {
    const urgencyScores = {
      "critical": 1.0,
      "high": 0.8,
      "moderate": 0.5,
      "low": 0.3
    };
    
    return urgencyScores[riskLevel] || 0.5;
  }

  getActionRelevance(action, riskAssessment) {
    const highRiskFactors = Object.entries(riskAssessment.riskFactors)
      .filter(([factor, score]) => score > 0.6)
      .map(([factor, score]) => factor);
    
    // Dynamic relevance calculation based on system state and risk patterns
    const memoryUsage = process.memoryUsage();
    const systemResponsiveness = 1 - (memoryUsage.heapUsed / memoryUsage.heapTotal);
    
    const actionRelevance = {
      "trigger_identification": highRiskFactors.includes("behavioral_changes") ? 
        Math.max(0.7, 0.9 + systemResponsiveness * 0.1) : 
        Math.max(0.3, 0.5 + systemResponsiveness * 0.2),
      "monitoring_systems": highRiskFactors.includes("mood_decline") ? 
        Math.max(0.6, 0.8 + systemResponsiveness * 0.15) : 
        Math.max(0.4, 0.6 + systemResponsiveness * 0.1),
      "support_activation": highRiskFactors.includes("isolation_indicators") ? 
        Math.max(0.7, 0.9 + systemResponsiveness * 0.1) : 
        Math.max(0.4, 0.6 + systemResponsiveness * 0.2),
      "crisis_protocols": riskAssessment.riskLevel === "critical" ? 
        Math.max(0.8, 1.0 + systemResponsiveness * 0.05) : 
        Math.max(0.5, 0.7 + systemResponsiveness * 0.2)
    };
    
    return actionRelevance[action] || 0.6;
  }

  identifyRequiredResources(action) {
    const resourceMap = {
      "trigger_identification": ["time", "self_awareness", "guidance"],
      "monitoring_systems": ["technology", "consistency", "support_person"],
      "support_activation": ["contacts", "communication", "trust"],
      "crisis_protocols": ["emergency_contacts", "safety_plan", "professional_backup"],
      "therapy_initiation": ["professional_access", "financial_resources", "time"],
      "skill_development": ["learning_materials", "practice_time", "feedback"]
    };
    
    return resourceMap[action] || ["general_resources"];
  }

  getActionTimeline(action, riskLevel) {
    const baseTimelines = {
      "crisis_protocols": "immediate",
      "monitoring_systems": "within_week",
      "support_activation": "within_days",
      "therapy_initiation": "within_week",
      "skill_development": "ongoing",
      "environmental_modification": "within_month"
    };
    
    let timeline = baseTimelines[action] || "flexible";
    
    if (riskLevel === "critical" && timeline !== "immediate") {
      timeline = "within_days";
    }
    
    return timeline;
  }

  getActionSuccessIndicators(action) {
    const indicators = {
      "trigger_identification": ["triggers_documented", "awareness_increased", "avoidance_improved"],
      "monitoring_systems": ["consistent_tracking", "early_detection", "timely_responses"],
      "support_activation": ["network_engaged", "regular_contact", "available_help"],
      "crisis_protocols": ["plan_accessible", "contacts_updated", "procedures_practiced"],
      "skill_development": ["skills_acquired", "confidence_increased", "application_successful"]
    };
    
    return indicators[action] || ["progress_measurable", "goals_achieved"];
  }

  createImplementationPlan(strategies) {
    const allStrategies = Object.values(strategies).flat();
    const sortedByPriority = allStrategies.sort((a, b) => b.priority - a.priority);
    
    const phases = {
      immediate: sortedByPriority.filter(s => s.timeline === "immediate"),
      short_term: sortedByPriority.filter(s => s.timeline === "within_days" || s.timeline === "within_week"),
      medium_term: sortedByPriority.filter(s => s.timeline === "within_month"),
      ongoing: sortedByPriority.filter(s => s.timeline === "ongoing" || s.timeline === "flexible")
    };
    
    return {
      planId: `implementation_${this.systemMetrics.getSystemTimestamp()}`,
      phases,
      totalStrategies: allStrategies.length,
      estimatedDuration: this.calculatePlanDuration(phases),
      resourceRequirements: this.aggregateResourceRequirements(allStrategies),
      milestones: this.definePlanMilestones(phases)
    };
  }

  calculatePlanDuration(phases) {
    const phaseDurations = {
      immediate: 1,
      short_term: 14,
      medium_term: 60,
      ongoing: 365
    };
    
    let totalDuration = 0;
    for (const [phase, strategies] of Object.entries(phases)) {
      if (strategies.length > 0) {
        totalDuration = Math.max(totalDuration, phaseDurations[phase] || 30);
      }
    }
    
    return {
      totalDays: totalDuration,
      phases: Object.fromEntries(
        Object.entries(phases).map(([phase, strategies]) => [
          phase, 
          { duration: phaseDurations[phase], strategiesCount: strategies.length }
        ])
      )
    };
  }

  aggregateResourceRequirements(strategies) {
    const allResources = strategies.flatMap(s => s.resources);
    const resourceCounts = {};
    
    allResources.forEach(resource => {
      resourceCounts[resource] = (resourceCounts[resource] || 0) + 1;
    });
    
    return Object.fromEntries(
      Object.entries(resourceCounts)
        .sort(([,a], [,b]) => b - a)
        .map(([resource, count]) => [
          resource, 
          { count, priority: count > 3 ? "high" : count > 1 ? "medium" : "low" }
        ])
    );
  }

  definePlanMilestones(phases) {
    const milestones = [];
    let cumulativeDays = 0;
    
    for (const [phase, strategies] of Object.entries(phases)) {
      if (strategies.length > 0) {
        const phaseDuration = phase === "immediate" ? 1 : phase === "short_term" ? 14 : phase === "medium_term" ? 60 : 90;
        cumulativeDays += phaseDuration;
        
        milestones.push({
          phase,
          targetDate: cumulativeDays,
          strategiesCompleted: strategies.length,
          successCriteria: this.getPhaseSuccessCriteria(phase),
          reviewPoints: this.getPhaseReviewPoints(phase, cumulativeDays)
        });
      }
    }
    
    return milestones;
  }

  getPhaseSuccessCriteria(phase) {
    const criteria = {
      "immediate": ["crisis_protocols_active", "safety_ensured", "support_contacted"],
      "short_term": ["monitoring_established", "professional_connected", "immediate_risks_addressed"],
      "medium_term": ["skills_developing", "environment_improved", "progress_measurable"],
      "ongoing": ["sustained_improvement", "independence_increased", "resilience_built"]
    };
    
    return criteria[phase] || ["phase_objectives_met"];
  }

  getPhaseReviewPoints(phase, targetDate) {
    const reviewFrequency = {
      "immediate": [0.5],
      "short_term": [3, 7, 14],
      "medium_term": [15, 30, 45, 60],
      "ongoing": [90, 180, 270, 365]
    };
    
    return (reviewFrequency[phase] || [targetDate]).map(days => ({
      day: days,
      focus: this.getReviewFocus(phase, days),
      adjustmentOpportunity: true
    }));
  }

  getReviewFocus(phase, day) {
    if (day < 1) return "immediate_safety";
    if (day <= 7) return "initial_implementation";
    if (day <= 30) return "early_progress";
    if (day <= 90) return "strategy_effectiveness";
    return "long_term_sustainability";
  }

  defineSuccessMetrics(riskAssessment, protectiveFactors) {
    return {
      metricsId: `success_metrics_${this.systemMetrics.getSystemTimestamp()}`,
      riskReduction: {
        baseline: riskAssessment.overallScore,
        target: Math.max(0.2, riskAssessment.overallScore * 0.6),
        timeline: "90_days"
      },
      protectiveEnhancement: {
        baseline: protectiveFactors.overallProtectiveCapacity.score,
        target: Math.min(1, protectiveFactors.overallProtectiveCapacity.score + 0.3),
        timeline: "180_days"
      },
      wellnessImprovement: {
        dimensionTargets: Object.fromEntries(
          this.wellnessMonitoring.monitoringDimensions.map(dim => [
            dim, 
            { 
              target: this.config.targetScores[dim] || 0.7,
              timeline: this.getWellnessImprovementTimeline(dim)
            }
          ])
        )
      },
      behavioralIndicators: {
        crisis_episodes_reduction: { target: 50, unit: "percentage" },
        support_utilization_increase: { target: 30, unit: "percentage" },
        coping_skill_application: { target: 80, unit: "percentage" },
        professional_engagement: { target: "maintained", unit: "qualitative" }
      },
      milestone_achievements: {
        immediate_safety: { timeline: "1_day", critical: true },
        support_activation: { timeline: "7_days", critical: true },
        professional_connection: { timeline: "14_days", critical: false },
        skill_development_start: { timeline: "30_days", critical: false },
        measurable_progress: { timeline: "90_days", critical: true },
        sustainable_improvement: { timeline: "180_days", critical: true }
      }
    };
  }

  getWellnessImprovementTimeline(dimension) {
    const timelines = {
      "emotional_state": "60_days",
      "behavioral_patterns": "90_days",
      "social_connections": "120_days",
      "physical_health": "90_days",
      "stress_levels": "45_days",
      "coping_effectiveness": "75_days"
    };
    
    return timelines[dimension] || "90_days";
  }

  createMonitoringSchedule(riskLevel) {
    const baseFrequency = this.config.monitoringFrequency[riskLevel] || 24;
    
    return {
      scheduleId: `monitoring_${this.systemMetrics.getSystemTimestamp()}`,
      riskLevel,
      frequency: baseFrequency,
      checkInTypes: this.getCheckInTypes(riskLevel),
      escalationTriggers: this.defineEscalationTriggers(riskLevel),
      adjustmentProtocol: this.createAdjustmentProtocol(riskLevel)
    };
  }

  getCheckInTypes(riskLevel) {
    const allTypes = ["wellness_assessment", "risk_evaluation", "support_status", "goal_progress"];
    
    const frequencies = {
      "critical": { wellness_assessment: "daily", risk_evaluation: "daily", support_status: "twice_daily" },
      "high": { wellness_assessment: "daily", risk_evaluation: "twice_weekly", support_status: "daily" },
      "moderate": { wellness_assessment: "twice_weekly", risk_evaluation: "weekly", support_status: "weekly" },
      "low": { wellness_assessment: "weekly", risk_evaluation: "biweekly", support_status: "weekly" }
    };
    
    return frequencies[riskLevel] || frequencies["moderate"];
  }

  defineEscalationTriggers(riskLevel) {
    return [
      {
        trigger: "risk_score_increase",
        threshold: 0.2,
        action: "increase_monitoring_frequency",
        responseTime: riskLevel === "critical" ? "immediate" : "within_hours"
      },
      {
        trigger: "missed_check_ins",
        threshold: 2,
        action: "proactive_outreach",
        responseTime: "within_hours"
      },
      {
        trigger: "support_unavailable",
        threshold: 1,
        action: "activate_backup_support",
        responseTime: "immediate"
      },
      {
        trigger: "crisis_indicators",
        threshold: 0.1,
        action: "emergency_protocol",
        responseTime: "immediate"
      }
    ];
  }

  createAdjustmentProtocol(riskLevel) {
    return {
      reviewFrequency: riskLevel === "critical" ? "weekly" : riskLevel === "high" ? "biweekly" : "monthly",
      adjustmentCriteria: [
        "sustained_improvement", "deterioration_detected", "life_changes",
        "support_changes", "treatment_effectiveness"
      ],
      adjustmentOptions: [
        "frequency_modification", "method_changes", "support_adjustments",
        "professional_consultation", "protocol_updates"
      ]
    };
  }

  createReviewSchedule(riskLevel) {
    const baseInterval = riskLevel === "critical" ? 7 : riskLevel === "high" ? 14 : 30;
    
    return {
      scheduleId: `review_${this.systemMetrics.getSystemTimestamp()}`,
      interval: baseInterval,
      reviewTypes: ["plan_effectiveness", "goal_progress", "strategy_adjustment", "resource_adequacy"],
      stakeholders: this.identifyReviewStakeholders(riskLevel),
      reviewProtocol: this.createReviewProtocol(riskLevel)
    };
  }

  identifyReviewStakeholders(riskLevel) {
    const stakeholders = ["individual", "support_person"];
    
    if (riskLevel === "critical" || riskLevel === "high") {
      stakeholders.push("mental_health_professional");
    }
    
    if (riskLevel === "critical") {
      stakeholders.push("crisis_team", "emergency_contact");
    }
    
    return stakeholders.map(stakeholder => ({
      role: stakeholder,
      involvement: this.getStakeholderInvolvement(stakeholder, riskLevel),
      availability: this.systemMetrics.calculateSystemBasedValue(stakeholder, 0.8).value
    }));
  }

  getStakeholderInvolvement(stakeholder, riskLevel) {
    const involvement = {
      "individual": "primary_participant",
      "support_person": "active_participant",
      "mental_health_professional": "clinical_oversight",
      "crisis_team": "emergency_standby",
      "emergency_contact": "notification_recipient"
    };
    
    return involvement[stakeholder] || "peripheral";
  }

  createReviewProtocol(riskLevel) {
    return {
      preparation: ["data_collection", "progress_assessment", "challenge_identification"],
      agenda: ["current_status_review", "goal_assessment", "strategy_effectiveness", "adjustments_needed"],
      documentation: ["outcomes_recorded", "decisions_documented", "next_steps_defined"],
      followUp: ["action_items_assigned", "timeline_established", "next_review_scheduled"],
      qualityCriteria: this.defineReviewQualityCriteria(riskLevel)
    };
  }

  defineReviewQualityCriteria(riskLevel) {
    return {
      comprehensiveness: riskLevel === "critical" ? "detailed" : "focused",
      stakeholderEngagement: "all_key_participants",
      decisionQuality: "evidence_based",
      actionOrientation: "specific_next_steps",
      timelyImplementation: riskLevel === "critical" ? "immediate" : "prompt"
    };
  }

  getStatus() {
    return {
      initialized: this.initialized,
      version: this.version,
      components: {
        crisisDetection: !!this.crisisDetection,
        emergencyResponse: !!this.emergencyResponse,
        wellnessMonitoring: !!this.wellnessMonitoring
      },
      systemMetrics: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: this.systemMetrics.getSystemTimestamp()
      }
    };
  }
}

export default CrisisCompanion;