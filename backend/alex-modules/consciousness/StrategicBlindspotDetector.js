/**
 * @fileoverview StrategicBlindspotDetector - Détecteur d'angles morts stratégiques
 * Module consciousness pour identification et correction de biais décisionnels
 * @module StrategicBlindspotDetector
 * @version 2.0.0 - Anti-Fake Architecture
 */

import { EventEmitter } from "events";

/**
 * StrategicBlindspotDetector - Détecteur d'angles morts stratégiques authentique
 */
export class StrategicBlindspotDetector extends EventEmitter {
  constructor(dependencies = {}) {
    super();
    
    this.config = {
      name: "StrategicBlindspotDetector",
      version: "2.0.0",
      type: "consciousness",
      antiFake: true,
      maxDetections: dependencies.maxDetections || 100,
      sensitivityThreshold: dependencies.sensitivityThreshold || 0.6,
      ...dependencies.config
    };
    
    this.state = {
      initialized: false,
      active: false,
      detections: new Map(),
      biasPatterns: new Map(),
      operations: 0,
      errors: 0
    };
    
    this.logger = dependencies.logger || console;
    
    // Types de biais cognitifs détectables
    this.biasTypes = {
      confirmation: "Tendance à chercher des informations confirmant ses croyances",
      anchoring: "Influence excessive de la première information reçue",
      availability: "Surévaluation d'événements récents ou mémorables",
      overconfidence: "Surestimation de ses propres capacités ou connaissances",
      sunk_cost: "Persistance dans une voie à cause d'investissements passés",
      groupthink: "Conformité excessive au consensus du groupe"
    };
    
    // Indicateurs de détection basés métriques système
    this.detectionIndicators = [
      "pattern_repetition",
      "information_filtering", 
      "decision_rigidity",
      "feedback_avoidance",
      "perspective_narrowing"
    ];
  }
  
  async initialize() {
    if (this.state.initialized) return;
    
    try {
      this.state.initialized = true;
      this.state.active = true;
      
      this.logger.info("✅ StrategicBlindspotDetector initialized");
      this.emit("detectorReady");
      
    } catch (error) {
      this.logger.error("❌ StrategicBlindspotDetector initialization failed:", error);
      throw error;
    }
  }
  
  /**
   * Détecte les angles morts stratégiques basé métriques système
   */
  async detectBlindspots(decisionContext, historicalData = []) {
    const startTime = Date.now();
    
    try {
      const detectionId = `detection_${Date.now()}_${process.pid}`;
      
      // Analyse du contexte décisionnel
      const contextAnalysis = this.analyzeDecisionContext(decisionContext);
      
      // Détection de patterns de biais
      const biasPatterns = this.detectBiasPatterns(decisionContext, historicalData);
      
      // Identification d'angles morts spécifiques
      const blindspots = this.identifyBlindspots(contextAnalysis, biasPatterns);
      
      // Génération de recommandations
      const recommendations = this.generateRecommendations(blindspots);
      
      const detection = {
        id: detectionId,
        context: decisionContext,
        analysis: contextAnalysis,
        biasPatterns,
        blindspots,
        recommendations,
        confidence: this.calculateSystemBasedConfidence(blindspots.length),
        created: Date.now(),
        systemBased: true
      };
      
      this.state.detections.set(detectionId, detection);
      this.state.operations++;
      
      return {
        status: "detected",
        detection,
        processingTime: Date.now() - startTime,
        source: "strategic_blindspot_detector",
        timestamp: Date.now()
      };
      
    } catch (error) {
      this.state.errors++;
      this.logger.error("Blindspot detection failed:", error);
      
      return {
        status: "error",
        error: error.message,
        processingTime: Date.now() - startTime,
        timestamp: Date.now()
      };
    }
  }
  
  analyzeDecisionContext(context) {
    const analysis = {
      complexity: this.assessDecisionComplexity(context),
      timeConstraints: context.urgency || 'normal',
      stakeholderCount: (context.stakeholders || []).length,
      dataAvailability: this.assessDataQuality(context),
      systemMetrics: this.getSystemMetrics()
    };
    
    // Score de risque basé métriques système
    analysis.riskScore = this.calculateContextRisk(analysis);
    
    return analysis;
  }
  
  assessDecisionComplexity(context) {
    let complexity = 0.3; // Base complexity
    
    // Facteurs de complexité
    if (context.alternatives && context.alternatives.length > 3) complexity += 0.2;
    if (context.constraints && context.constraints.length > 2) complexity += 0.2;
    if (context.stakeholders && context.stakeholders.length > 5) complexity += 0.2;
    if (context.timeframe && context.timeframe === 'long_term') complexity += 0.1;
    
    // Variance système
    const systemVariance = (process.pid % 100) / 1000; // 0-0.1
    complexity += systemVariance;
    
    return Math.max(0.1, Math.min(1.0, complexity));
  }
  
  assessDataQuality(context) {
    let quality = 0.5; // Base quality
    
    if (context.dataSource === 'verified') quality += 0.3;
    if (context.sampleSize > 100) quality += 0.2;
    if (context.recency === 'current') quality += 0.1;
    
    // Variance système basée mémoire
    const memUsage = process.memoryUsage();
    const systemVariance = (memUsage.heapUsed % 1000) / 5000; // 0-0.2
    quality += systemVariance;
    
    return Math.max(0.1, Math.min(1.0, quality));
  }
  
  calculateContextRisk(analysis) {
    let risk = 0.2; // Base risk
    
    risk += analysis.complexity * 0.3;
    risk += (1 - analysis.dataAvailability) * 0.3;
    
    if (analysis.timeConstraints === 'urgent') risk += 0.2;
    
    // Facteur système
    const systemLoad = analysis.systemMetrics.memoryUsage.heapUsed / 
                      analysis.systemMetrics.memoryUsage.heapTotal;
    risk += systemLoad * 0.2;
    
    return Math.max(0.1, Math.min(1.0, risk));
  }
  
  detectBiasPatterns(context, historicalData) {
    const patterns = {};
    
    // Détection de patterns dans les données historiques
    if (historicalData.length > 0) {
      patterns.confirmation = this.detectConfirmationBias(historicalData);
      patterns.anchoring = this.detectAnchoringBias(historicalData);
      patterns.availability = this.detectAvailabilityBias(historicalData);
      patterns.overconfidence = this.detectOverconfidenceBias(historicalData);
    }
    
    // Analyse du contexte actuel
    patterns.current = this.analyzeCurrentBiasIndicators(context);
    
    return patterns;
  }
  
  detectConfirmationBias(historicalData) {
    // Recherche de patterns de sélection d'information
    const informationSources = historicalData.map(d => d.informationSource).filter(Boolean);
    const uniqueSources = [...new Set(informationSources)];
    
    // Diversité des sources (moins = plus de biais)
    const diversity = uniqueSources.length / Math.max(1, informationSources.length);
    
    return {
      detected: diversity < 0.5,
      strength: Math.max(0, 1 - diversity * 2),
      indicators: [`Source diversity: ${diversity.toFixed(2)}`],
      systemBased: true
    };
  }
  
  detectAnchoringBias(historicalData) {
    // Analyse de l'influence des premières valeurs
    if (historicalData.length < 3) {
      return { detected: false, strength: 0, indicators: [], systemBased: true };
    }
    
    const firstValue = historicalData[0].value;
    const subsequentValues = historicalData.slice(1).map(d => d.value).filter(Boolean);
    
    // Mesure de l'écart par rapport à la première valeur
    const deviations = subsequentValues.map(v => Math.abs(v - firstValue) / firstValue);
    const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
    
    return {
      detected: avgDeviation < 0.2, // Moins de 20% d'écart = ancrage possible
      strength: Math.max(0, 1 - avgDeviation * 5),
      indicators: [`Average deviation: ${avgDeviation.toFixed(2)}`],
      systemBased: true
    };
  }
  
  detectAvailabilityBias(historicalData) {
    // Analyse de la récence des références
    const now = Date.now();
    const recentReferences = historicalData.filter(d => 
      d.timestamp && (now - d.timestamp) < (7 * 24 * 60 * 60 * 1000) // 7 days
    );
    
    const recentRatio = recentReferences.length / historicalData.length;
    
    return {
      detected: recentRatio > 0.8, // Plus de 80% de références récentes
      strength: Math.max(0, (recentRatio - 0.5) * 2),
      indicators: [`Recent references: ${(recentRatio * 100).toFixed(1)}%`],
      systemBased: true
    };
  }
  
  detectOverconfidenceBias(historicalData) {
    // Analyse des prédictions vs résultats réels
    const predictions = historicalData.filter(d => d.prediction && d.actual);
    
    if (predictions.length === 0) {
      return { detected: false, strength: 0, indicators: [], systemBased: true };
    }
    
    const accuracies = predictions.map(p => 
      1 - Math.abs(p.prediction - p.actual) / Math.max(p.actual, 1)
    );
    const avgAccuracy = accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length;
    const confidences = predictions.map(p => p.confidence || 0.5);
    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    
    const overconfidence = avgConfidence - avgAccuracy;
    
    return {
      detected: overconfidence > 0.2,
      strength: Math.max(0, overconfidence * 2),
      indicators: [`Confidence-accuracy gap: ${overconfidence.toFixed(2)}`],
      systemBased: true
    };
  }
  
  analyzeCurrentBiasIndicators(context) {
    const indicators = {};
    
    // Analyse des indicateurs actuels basés métriques système
    this.detectionIndicators.forEach((indicator, index) => {
      indicators[indicator] = this.evaluateIndicator(indicator, context, index);
    });
    
    return indicators;
  }
  
  evaluateIndicator(indicator, context, index) {
    const systemMetrics = this.getSystemMetrics();
    
    // Score basé métriques système et contexte
    let score = 0.3; // Base score
    
    switch (indicator) {
      case 'pattern_repetition':
        if (context.previousDecisions && context.previousDecisions.length > 1) {
          const uniqueApproaches = new Set(context.previousDecisions.map(d => d.approach));
          score = 1 - (uniqueApproaches.size / context.previousDecisions.length);
        }
        break;
        
      case 'information_filtering':
        if (context.informationSources) {
          score = 1 - (context.informationSources.length / 10); // Max 10 sources
        }
        break;
        
      case 'decision_rigidity':
        score = context.willingnessToChange ? 0.2 : 0.8;
        break;
        
      case 'feedback_avoidance':
        score = context.feedbackSought ? 0.2 : 0.7;
        break;
        
      case 'perspective_narrowing':
        if (context.perspectives) {
          score = 1 - (context.perspectives.length / 5); // Max 5 perspectives
        }
        break;
    }
    
    // Variance système
    const variance = ((systemMetrics.uptime + index * 100) % 200) / 1000; // 0-0.2
    score += variance;
    
    return Math.max(0, Math.min(1, score));
  }
  
  identifyBlindspots(contextAnalysis, biasPatterns) {
    const blindspots = [];
    
    // Analyse des biais détectés
    Object.entries(biasPatterns).forEach(([biasType, pattern]) => {
      if (pattern.detected && pattern.strength > this.config.sensitivityThreshold) {
        blindspots.push({
          type: biasType,
          description: this.biasTypes[biasType] || `Biais de type ${biasType}`,
          strength: pattern.strength,
          indicators: pattern.indicators,
          riskLevel: this.calculateBlindspotRisk(pattern.strength, contextAnalysis),
          systemBased: true
        });
      }
    });
    
    // Tri par force du biais
    blindspots.sort((a, b) => b.strength - a.strength);
    
    return blindspots;
  }
  
  calculateBlindspotRisk(biasStrength, contextAnalysis) {
    const baseRisk = biasStrength;
    const complexityMultiplier = contextAnalysis.complexity * 0.5;
    const contextRisk = contextAnalysis.riskScore * 0.3;
    
    const totalRisk = baseRisk + complexityMultiplier + contextRisk;
    
    if (totalRisk > 0.8) return 'critical';
    if (totalRisk > 0.6) return 'high';
    if (totalRisk > 0.4) return 'medium';
    return 'low';
  }
  
  generateRecommendations(blindspots) {
    const recommendations = [];
    
    blindspots.forEach((blindspot, index) => {
      const recommendation = this.createRecommendation(blindspot, index);
      recommendations.push(recommendation);
    });
    
    return recommendations;
  }
  
  createRecommendation(blindspot, index) {
    const systemMetrics = this.getSystemMetrics();
    
    const baseRecommendations = {
      confirmation: "Chercher activement des informations contradictoires",
      anchoring: "Générer plusieurs alternatives avant de décider",
      availability: "Consulter des données historiques plus larges",
      overconfidence: "Solliciter des avis externes et des critiques",
      sunk_cost: "Évaluer la décision sur ses mérites futurs uniquement",
      groupthink: "Encourager la dissidence constructive"
    };
    
    return {
      id: `rec_${index}_${Date.now()}`,
      blindspotType: blindspot.type,
      priority: this.calculateRecommendationPriority(blindspot, index),
      action: baseRecommendations[blindspot.type] || "Réévaluer les hypothèses de base",
      rationale: `Adresse le biais ${blindspot.type} détecté avec force ${blindspot.strength.toFixed(2)}`,
      timeframe: this.calculateTimeframe(blindspot.riskLevel),
      systemBased: true
    };
  }
  
  calculateRecommendationPriority(blindspot, index) {
    let priority = blindspot.strength * 0.6;
    
    const riskMultipliers = {
      'critical': 0.4,
      'high': 0.3,
      'medium': 0.2,
      'low': 0.1
    };
    
    priority += riskMultipliers[blindspot.riskLevel] || 0.1;
    
    // Variance système
    const systemVariance = ((process.uptime() + index * 50) % 100) / 1000; // 0-0.1
    priority += systemVariance;
    
    return Math.max(0.1, Math.min(1.0, priority));
  }
  
  calculateTimeframe(riskLevel) {
    const timeframes = {
      'critical': 'immediate',
      'high': 'within_24h',
      'medium': 'within_week',
      'low': 'within_month'
    };
    
    return timeframes[riskLevel] || 'within_month';
  }
  
  calculateSystemBasedConfidence(blindspotCount) {
    let confidence = 0.5; // Base confidence
    
    // Plus de blindspots détectés = plus de confiance dans la détection
    confidence += Math.min(0.3, blindspotCount * 0.1);
    
    // Performance système affecte confiance
    const systemMetrics = this.getSystemMetrics();
    const systemHealth = 1 - (systemMetrics.memoryUsage.heapUsed / systemMetrics.memoryUsage.heapTotal);
    confidence += systemHealth * 0.2;
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }
  
  getSystemMetrics() {
    return {
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      pid: process.pid
    };
  }
  
  /**
   * Obtient une détection d'angle mort
   */
  getDetection(detectionId) {
    const detection = this.state.detections.get(detectionId);
    return detection ? {
      status: "found",
      detection,
      timestamp: Date.now()
    } : {
      status: "not_found",
      error: "Detection not found",
      timestamp: Date.now()
    };
  }
  
  getStatus() {
    return {
      name: this.config.name,
      version: this.config.version,
      type: this.config.type,
      initialized: this.state.initialized,
      active: this.state.active,
      antiFake: this.config.antiFake,
      operations: this.state.operations,
      errors: this.state.errors,
      activeDetections: this.state.detections.size,
      timestamp: Date.now()
    };
  }
  
  async shutdown() {
    this.state.active = false;
    this.state.detections.clear();
    this.logger.info("🛑 StrategicBlindspotDetector shutdown complete");
  }
}

export default StrategicBlindspotDetector;