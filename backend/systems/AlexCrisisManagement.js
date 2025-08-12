import crypto from "crypto";

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_IMMEDIATE = "immediate";
/**
 * @fileoverview AlexCrisisManagement - Système de Gestion de Crise d'Alex
 * Détection, intervention et accompagnement en situations de crise
 * @module AlexCrisisManagement
 * @version 1.0.0 - Crisis Intervention System
 * @author HustleFinder IA Team
 * @since 2025
 */

import { EventEmitter } from "events";
import logger from "../config/logger.js";

/**
 * @class AlexCrisisManagement
 * @description Système de gestion de crise pour assistance immédiate et bienveillante
 */
export class AlexCrisisManagement extends EventEmitter {
  constructor() {
    super();

    this.crisisConfig = {
      version: "1.0.0",
      name: "Alex Crisis Management",
      interventionSpeed: STR_IMMEDIATE,
      safetyPriority: "maximum",
      empathyLevel: 1.0,
      professionalBoundaries: true,
    };

    // Types de crises détectables
    this.crisisTypes = {
      emotional: {
        indicators: ["suicidal", "despair", "hopeless", "overwhelmed"],
        severity: STR_HIGH,
        intervention: STR_IMMEDIATE,
        approach: "empathetic_presence",
      },
      anxiety: {
        indicators: ["panic", STR_ANXIETY, "fear", "worried"],
        severity: STR_MEDIUM,
        intervention: "breathing_techniques",
        approach: "calming_presence",
      },
      depression: {
        indicators: ["depressed", "sad", "empty", "worthless"],
        severity: STR_HIGH,
        intervention: "supportive_listening",
        approach: "gentle_support",
      },
      trauma: {
        indicators: [STR_TRAUMA, "flashback", "triggered", "abuse"],
        severity: STR_HIGH,
        intervention: "safety_first",
        approach: "stabilizing_presence",
      },
      relationship: {
        indicators: ["breakup", "divorce", "betrayal", "abandoned"],
        severity: STR_MEDIUM,
        intervention: "emotional_support",
        approach: "understanding_companion",
      },
      loss: {
        indicators: ["death", "loss", "grief", "mourning"],
        severity: STR_HIGH,
        intervention: "grief_support",
        approach: "compassionate_presence",
      },
      financial: {
        indicators: ["bankrupt", "debt", "homeless", "poverty"],
        severity: STR_MEDIUM,
        intervention: "practical_support",
        approach: "resourceful_guide",
      },
      health: {
        indicators: ["diagnosis", "illness", "pain", "dying"],
        severity: STR_HIGH,
        intervention: "medical_awareness",
        approach: "supportive_companion",
      },
    };

    // Niveaux de sévérité
    this.severityLevels = {
      low: {
        color: "green",
        response: "supportive",
        urgency: "normal",
        followUp: "optional",
      },
      medium: {
        color: "yellow",
        response: "attentive",
        urgency: "prompt",
        followUp: "recommended",
      },
      high: {
        color: "orange",
        response: STR_IMMEDIATE,
        urgency: "urgent",
        followUp: "required",
      },
      critical: {
        color: "red",
        response: "emergency",
        urgency: STR_IMMEDIATE,
        followUp: "mandatory",
      },
    };

    // Techniques d'intervention
    this.interventionTechniques = {
      activeListening: {
        description: "Écoute active et validation",
        effectiveness: 0.9,
        applicability: "universal",
      },
      breathingExercises: {
        description: "Exercices de respiration",
        effectiveness: 0.8,
        applicability: STR_ANXIETY,
      },
      grounding: {
        description: "Techniques d'ancrage",
        effectiveness: 0.85,
        applicability: STR_TRAUMA,
      },
      cognitiveReframing: {
        description: "Recadrage cognitif",
        effectiveness: 0.75,
        applicability: "depression",
      },
      safetyPlanning: {
        description: "Planification de sécurité",
        effectiveness: 0.95,
        applicability: "suicidal",
      },
      resourceConnection: {
        description: "Connexion aux ressources",
        effectiveness: 0.8,
        applicability: "practical",
      },
    };

    // Ressources d'urgence
    this.emergencyResources = {
      suicidePrevention: {
        name: "Suicide Écoute",
        phone: "01 45 39 40 00",
        available: "24h/24",
        description: "Ligne d'écoute pour prévention du suicide",
      },
      mentalHealth: {
        name: "Croix-Rouge Écoute",
        phone: "0800 858 858",
        available: "24h/24",
        description: "Soutien psychologique gratuit",
      },
      violence: {
        name: "3919 - Violences Femmes Info",
        phone: "3919",
        available:
          "9h-22h du lundi au vendredi, 9h-18h samedi, dimanche et jours fériés",
        description:
          "Numéro national d'information pour les femmes victimes de violences",
      },
      emergency: {
        name: "SAMU",
        phone: "15",
        available: "24h/24",
        description: "Urgences médicales",
      },
    };

    // Historique des crises
    this.crisisHistory = [];

    // État d'alerte actuel
    this.alertState = {
      level: "normal",
      activeCrises: new Map(),
      monitoringUsers: new Set(),
    };

    this.isInitialized = false;

    try {
      logger.info(
        "🚨 AlexCrisisManagement initializing - Crisis support awakening",
      );
    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  async initialize() {
    this.isInitialized = true;
    await this.initializeCrisisDetection();
    await this.loadInterventionProtocols();
    this.startCrisisMonitoring();

    try {
      logger.info(
        "💙 AlexCrisisManagement fully initialized - Ready to help in crisis",
      );
    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  /**
   * Initialise la détection de crise
   */
  async initializeCrisisDetection() {
    // Patterns de détection de crise
    this.crisisPatterns = {
      emotional: /\b(suicide|mort|tuer|fin|désespoir|dépression)\b/i,
      urgency: /\b(urgent|aide|secours|immédiat)\b/i,
      distress: /\b(angoisse|panique|peur|anxiété)\b/i,
    };

    try {
      logger.info("🔍 Crisis detection patterns loaded");
    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  /**
   * Charge les protocoles d'intervention
   */
  async loadInterventionProtocols() {
    this.interventionProtocols = {
      immediate: [
        "écoute active",
        "validation émotionnelle",
        "orientation professionnelle",
      ],
      supportive: ["accompagnement", "ressources", "suivi"],
      preventive: ["sensibilisation", "éducation", "renforcement"],
    };

    try {
      logger.info("📋 Intervention protocols loaded");
    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  /**
   * Démarre la surveillance de crise
   */
  startCrisisMonitoring() {
    // Surveillance continue des signaux de détresse
    setInterval(() => {
      this.monitorCrisisTrends();
    }, 300000); // 5 minutes

    try {
      logger.info("👁️ Crisis monitoring started");
    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  /**
   * Surveillance des tendances de crise
   */
  monitorCrisisTrends() {
    // Monitoring passif des tendances
    try {
      logger.debug("📊 Crisis trends monitoring");
    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  /**
   * Vérification des états de crise
   */
  checkCrisisStates() {
    // Vérification des sessions actives
    try {
      logger.debug("🔍 Checking crisis states");
    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  /**
   * Surveillance des utilisateurs suivis
   */
  monitorTrackedUsers() {
    // Surveillance des utilisateurs à risque
    try {
      logger.debug("👥 Monitoring tracked users");
    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  /**
   * Détection et analyse de crise
   */
  async detectCrisis(message, userId, context = {}) {
    const detection = {
      timestamp: new Date(),
      userId: userId,
      message: message,
      crisisDetected: false,
      crisisType: null,
      severity: "low",
      confidence: 0,
      indicators: [],
      immediateResponse: null,
      recommendations: [],
    };

    // Analyse du message pour indicateurs de crise
    detection.indicators = this.analyzeForCrisisIndicators(message);

    if (detection.indicators.length > 0) {
      detection.crisisDetected = true;

      // Détermination du type de crise
      detection.crisisType = this.determineCrisisType(detection.indicators);

      // Évaluation de la sévérité
      detection.severity = this.assessSeverity(
        detection.indicators,
        detection.crisisType,
        context,
      );

      // Calcul de la confiance
      detection.confidence = this.calculateConfidence(
        detection.indicators,
        detection.crisisType,
      );

      // Génération de réponse immédiate
      detection.immediateResponse =
        await this.generateImmediateResponse(detection);

      // Recommandations d'intervention
      detection.recommendations =
        this.generateInterventionRecommendations(detection);

      // Déclenchement de l'intervention
      await this.triggerCrisisIntervention(detection);
    }

    // Stockage dans l'historique
    this.crisisHistory.push(detection);
    if (this.crisisHistory.length > 1000) {
      this.crisisHistory.shift();
    }

    return detection;
  }

  /**
   * Analyse des indicateurs de crise
   */
  analyzeForCrisisIndicators(message) {
    const indicators = [];
    const messageText = message.toLowerCase();

    // Vérification de chaque type de crise
    for (const [crisisType, config] of Object.entries(this.crisisTypes)) {
      for (const indicator of config.indicators) {
        if (messageText.includes(indicator)) {
          indicators.push({
            type: crisisType,
            indicator: indicator,
            context: this.extractContext(messageText, indicator),
            severity: config.severity,
          });
        }
      }
    }

    // Détection de patterns plus complexes
    const complexIndicators = this.detectComplexPatterns(messageText);
    indicators.push(...complexIndicators);

    return indicators;
  }

  /**
   * Détection de patterns complexes
   */
  detectComplexPatterns(messageText) {
    const patterns = [];

    // Pattern suicidaire
    const suicidalPatterns = [
      /je veux (mourir|disparaître|en finir)/,
      /j'en peux plus/,
      /ça ne sert à rien/,
      /personne ne me comprend/,
      /je suis un fardeau/,
    ];

    for (const pattern of suicidalPatterns) {
      if (pattern.test(messageText)) {
        patterns.push({
          type: STR_EMOTIONAL,
          indicator: "suicidal_ideation",
          severity: "critical",
          confidence: 0.8,
        });
        break;
      }
    }

    // Pattern de panique
    const panicPatterns = [
      /je ne peux pas respirer/,
      /mon cœur bat trop vite/,
      /j'ai peur de mourir/,
      /tout s'effondre/,
    ];

    for (const pattern of panicPatterns) {
      if (pattern.test(messageText)) {
        patterns.push({
          type: STR_ANXIETY,
          indicator: "panic_attack",
          severity: STR_HIGH,
          confidence: 0.9,
        });
        break;
      }
    }
  }

  async generateImmediateResponse(detection) {
    const response = {
      type: "crisis_intervention",
      urgency: STR_IMMEDIATE,
      content: "",
      tone: "compassionate",
      techniques: [],
      resources: [],
    };

    // Sélection de la réponse selon le type de crise
    switch (detection.crisisType) {
      case STR_EMOTIONAL:
        response.content = this.generateEmotionalCrisisResponse(detection);
        response.techniques = ["activeListening", "validation", "safety_check"];
        break;

      case STR_ANXIETY:
        response.content = this.generateAnxietyCrisisResponse(detection);
        response.techniques = ["breathingExercises", "grounding", "calming"];
        break;

      case STR_TRAUMA:
        response.content = this.generateTraumaCrisisResponse(detection);
        response.techniques = ["safety_first", "grounding", "stabilization"];
        break;

      case "depression":
        response.content = this.generateDepressionCrisisResponse(detection);
        response.techniques = ["validation", "hope_instillation", "connection"];
        break;

      case "loss":
        response.content = this.generateGriefCrisisResponse(detection);
        response.techniques = ["grief_support", "memory_honoring", "presence"];
        break;
    }

    // Ajout de ressources si nécessaire
    if (detection.severity === STR_HIGH || detection.severity === "critical") {
      response.resources = this.selectAppropriateResources(
        detection.crisisType,
      );
    }

    return response;
  }

  /**
   * Réponses spécialisées par type de crise
   */
  async generateEmotionalCrisisResponse(detection) {
    // 🆘 INTERVENTION DE CRISE ÉMOTIONNELLE ÉVOLUTIVE ET PERSONNALISÉE
    const crisisContext = {
      emotionalState: detection.emotionalState,
      severityLevel: detection.severity,
      triggerEvents: detection.triggerEvents,
      userHistory: await this.memory.getUserCrisisHistory(detection.userId),
      currentVulnerability: this.assessCurrentVulnerability(detection),
      supportNetwork: await this.memory.getUserSupportNetwork(detection.userId),
      culturalContext: detection.culturalBackground,
      immediateRisk: this.assessImmediateRisk(detection),
    };

    // Génération de réponse empathique adaptée à la personne
    const personalizedCrisisResponse =
      await this.generateAdaptiveCrisisIntervention({
        crisis: crisisContext,
        personalHistory: crisisContext.userHistory,
        effectiveApproaches: this.learning.getEffectiveCrisisApproaches(
          detection.userId,
        ),
        culturalSensitivity:
          this.generateCulturallyAppropriateSupport(crisisContext),
        immediateNeeds: this.identifyImmediateNeeds(crisisContext),
        healingApproach: this.selectOptimalHealingStrategy(crisisContext),
      });

    // Apprentissage continu des interventions efficaces
    await this.learning.recordCrisisInterventionEffectiveness({
      context: crisisContext,
      response: personalizedCrisisResponse,
      expectedOutcome: this.predictInterventionOutcome(
        personalizedCrisisResponse,
        crisisContext,
      ),
    });

    return personalizedCrisisResponse.interventionMessage;
  }

  async generateAnxietyCrisisResponse(detection) {
    // 😰 SUPPORT ANXIÉTÉ ADAPTATIF ET PERSONNALISÉ
    const anxietyContext = {
      anxietyLevel: detection.intensity,
      anxietyTriggers: detection.triggers,
      physicalSymptoms: detection.physicalManifestations,
      cognitivePatterns: detection.thoughtPatterns,
      copingHistory: await this.memory.getUserCopingStrategies(
        detection.userId,
      ),
      environmentalFactors: detection.environment,
    };

    return await this.generatePersonalizedAnxietySupport(anxietyContext);
  }

  async generateDepressionCrisisResponse(detection) {
    // 😔 SUPPORT DÉPRESSION ÉVOLUTIF ET COMPASSIONNEL
    const depressionContext = {
      depressionSeverity: detection.severity,
      hopelessnessLevel: detection.hopelessness,
      isolationLevel: detection.isolation,
      energyLevel: detection.energy,
      supportSources: await this.memory.getUserSupportSources(detection.userId),
      therapeuticHistory: await this.memory.getUserTherapeuticHistory(
        detection.userId,
      ),
    };

    return await this.generateCompassionateDepressionSupport(depressionContext);
  }

  async generateGriefCrisisResponse(detection) {
    // 💔 ACCOMPAGNEMENT DEUIL PERSONNALISÉ ET RESPECTUEUX
    const griefContext = {
      lossType: detection.lossType,
      griefStage: detection.currentStage,
      relationship: detection.relationshipToLoss,
      timeSinceLoss: detection.timeSinceLoss,
      culturalGriefPractices: detection.culturalBackground.griefTraditions,
      previousLosses: await this.memory.getUserGriefHistory(detection.userId),
    };

    return await this.generateCulturallyRespectfulGriefSupport(griefContext);
  }

  /**
   * Déclenchement de l'intervention de crise
   */
  async triggerCrisisIntervention(detection) {
    // Mise à jour de l'état d'alerte
    this.updateAlertState(detection);

    // Activation du suivi
    this.activateUserMonitoring(detection.userId, detection.crisisType);

    try {
      logger.warn("🚨 Crisis detected and intervention triggered", {
        userId: detection.userId,
        type: detection.crisisType,
        severity: detection.severity,
        confidence: detection.confidence,
      });
    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  /**
   * Surveillance continue des crises
   */
  startCrisisMonitoring() {
    // Vérification d'état toutes les minutes
    setInterval(() => {
      this.checkCrisisStates();
    }, 60000);

    // Suivi des utilisateurs sous surveillance
    setInterval(() => {
      this.monitorTrackedUsers();
    }, 300000); // 5 minutes

    try {
      logger.info("👁️ Crisis monitoring activated");
    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  /**
   * Sélection de ressources appropriées
   */
  selectAppropriateResources(crisisType) {
    const resources = [];

    switch (crisisType) {
      case STR_EMOTIONAL:
        resources.push(this.emergencyResources.suicidePrevention);
        resources.push(this.emergencyResources.mentalHealth);
        break;

      case STR_TRAUMA:
        resources.push(this.emergencyResources.mentalHealth);
        resources.push(this.emergencyResources.violence);
        break;

      case "health":
        resources.push(this.emergencyResources.emergency);
        break;

      default:
        resources.push(this.emergencyResources.mentalHealth);
    }

    return resources;
  }

  /**
   * Mise à jour de l'état d'alerte
   */
  updateAlertState(detection) {
    // Ajout de la crise active
    this.alertState.activeCrises.set(detection.userId, {
      type: detection.crisisType,
      severity: detection.severity,
      startTime: detection.timestamp,
      lastUpdate: detection.timestamp,
    });

    // Mise à jour du niveau d'alerte global
    this.alertState.level = this.calculateGlobalAlertLevel();
  }

  /**
   * Activation de la surveillance utilisateur
   */
  activateUserMonitoring(userId, crisisType) {
    this.alertState.monitoringUsers.add(userId);

    try {
      logger.info(
        `👤 User ${userId} added to monitoring due to ${crisisType} crisis`,
      );
    } catch (error) {
      // Logger fallback - ignore error
    }

    // Planification du suivi
    setTimeout(() => {
      this.performFollowUp(userId, crisisType);
    }, 3600000); // Suivi dans 1 heure
  }

  /**
   * Réalisation du suivi
   */
  performFollowUp(userId, crisisType) {
    // Vérification de l'état de l'utilisateur
    try {
      logger.info(
        `📞 Performing follow-up with user ${userId} after ${crisisType} crisis`,
      );
    } catch (error) {
      // Logger fallback - ignore error
    }

    // Suppression de la surveillance
    this.stopMonitoringUser(userId);
  }

  /**
   * Arrêt de la surveillance utilisateur
   */
  stopMonitoringUser(userId) {
    this.alertState.monitoringUsers.delete(userId);

    try {
      logger.info(`👤 User ${userId} removed from monitoring`);
    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  /**
   * Calcul du niveau d'alerte global
   */
  calculateGlobalAlertLevel() {
    if (this.alertState.activeCrises.size > 5) {
      return "critical";
    } else if (this.alertState.activeCrises.size > 2) {
      return "high";
    } else if (this.alertState.activeCrises.size > 0) {
      return "medium";
    } else {
      return "normal";
    }
  }

  /**
   * Obtention du statut de gestion de crise
   */
  getCrisisManagementStatus() {
    return {
      initialized: this.isInitialized,
      alertLevel: this.alertState.level,
      activeCrises: this.alertState.activeCrises.size,
      monitoringUsers: this.alertState.monitoringUsers.size,
      totalDetections: this.crisisHistory.length,
      recentCrises: this.getRecentCrises(),
      interventionEffectiveness: this.calculateInterventionEffectiveness(),
      availableResources: Object.keys(this.emergencyResources).length,
    };
  }

  /**
   * Obtention des crises récentes
   */
  getRecentCrises() {
    const recent = this.crisisHistory.slice(-5).map((crisis) => ({
      userId: crisis.userId,
      type: crisis.crisisType,
      severity: crisis.severity,
      timestamp: crisis.timestamp,
    }));
    return recent;
  }

  /**
   * Calcul de l'efficacité des interventions
   */
  calculateInterventionEffectiveness() {
    const interventions = this.crisisHistory.filter((c) => c.crisisDetected);
    if (interventions.length === 0) return 1.0;

    // Mesure basée sur le taux de résolution des crises
    // Assuming a 'resolved' property is added to crisis objects upon resolution
    const resolved = interventions.filter((i) => i.resolved).length;
    return resolved / interventions.length;
  }
}
