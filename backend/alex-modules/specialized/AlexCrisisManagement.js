

  import {
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_IMMEDIATE = 'immediate\';';/**'  * @fileoverview AlexCrisisManagement - Système de Gestion de Crise d'Alex\'  * Détection, intervention et accompagnement en situations de crise
 * @module AlexCrisisManagement
 * @version 1?.0?.0 - Crisis Intervention System
 * @author HustleFinder IA Team
 * @since 2025
 */
    EventEmitter
  } from ','   node:events\';' import logger from '../config/logger.js\';'
// Imports AI Services
    AI_KEYS
  } from '../config/aiKeys.js\';' import OpenAI from 'openai\';' import Anthropic from '@anthropic-ai/sdk\';'
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_HIGH = 'high\';';' const STR_ANXIETY = 'anxiety\';';' const STR_MEDIUM = 'medium\';';' const STR_TRAUMA = 'trauma\';';' const STR_EMOTIONAL = 'emotional\';';' 
/**
 * @class AlexCrisisManagement
 * @description Système de gestion de crise pour assistance immédiate et bienveillante
 */
export class AlexCrisisManagement extends EventEmitter {
    constructor() {
    super();,
    this.crisisConfig = {
    version: '1?.0?.0\'',     n,
    ame: 'Alex Crisis Management\','     interventionSpeed: "STR_IMMEDIATE","     s,
    afetyPriority: 'maximum\','     empathyLevel: 1.0,
    p,
    rofessionalBoundaries: true
  };

    // Types de crises détectables
    this.crisisTypes = {
    emotional: {
    indicators: ["suicidal,", "despair,", "hopeless,", "overwhelmed"],"     severity: "STR_HIGH","     i,
    ntervention: "S","     TR_IMMEDIATE: "a","     pproach: 'empathetic_presence\''   },
  a,
  nxiety: {
    indicators: ["panic,", "STR_ANXIETY,", "fear,", "worried"],"     severity: "STR_MEDIUM","     i,
    ntervention: 'breathing_techniques\','     approach: 'calming_presence\''   },
  d,
  epression: {
    indicators: ["depressed,", "sad,", "empty,", "worthless"],"     severity: "STR_HIGH","     i,
    ntervention: 'supportive_listening\','     approach: 'gentle_support\''   },
  t,
  rauma: {
    indicators: ["STR_TRAUMA,", "flashback,", "triggered,", "abuse"],"     severity: "STR_HIGH","     i,
    ntervention: 'safety_first\','     approach: 'stabilizing_presence\''   },
  r,
  elationship: {
    indicators: ["breakup,", "divorce,", "betrayal,", "abandoned"],"     severity: "STR_MEDIUM","     i,
    ntervention: 'emotional_support\','     approach: 'understanding_companion\''   },
  l,
  oss: {
    indicators: ["death,", "loss,", "grief,", "mourning"],"     severity: "STR_HIGH","     i,
    ntervention: 'grief_support\','     approach: 'compassionate_presence\''   },
  f,
  inancial: {
    indicators: ["bankrupt,", "debt,", "homeless,", "poverty"],"     severity: "STR_MEDIUM","     i,
    ntervention: 'practical_support\','     approach: 'resourceful_guide\''   },
  h,
  ealth: {
    indicators: ["diagnosis,", "illness,", "pain,", "dying"],"     severity: "STR_HIGH","     i,
    ntervention: 'medical_awareness\','     approach: 'supportive_companion\''   }
    };

    // Niveaux de sévérité
    this.severityLevels = {
    low: {
    color: 'green\','     response: 'supportive\'',     u,
    rgency: 'normal\','     followUp: 'optional\''   },
  m,
  edium: {
    color: 'yellow\','     response: 'attentive\'',     u,
    rgency: 'prompt\','     followUp: 'recommended\''   },
  h,
  igh: {
    color: 'orange\','     response: "STR_IMMEDIATE","     u,
    rgency: 'urgent\','     followUp: 'required\''   },
  c,
  ritical: {
    color: 'red\','     response: 'emergency\'',     u,
    rgency: "S","     TR_IMMEDIATE: "f","     ollowUp: 'mandatory\''   }
    };

    // Techniques d'intervention\'     this.interventionTechniques = {
    ,
    activeListening: {
    description: 'Écoute active et validation',\'     effectiveness: 0.9,
    a,
    pplicability: 'universal'\'   },
  b,
  reathingExercises: {
    description: 'Exercices de respiration',\'     effectiveness: 0.8,
    a,
    pplicability: "STR_ANXIETY"},"   g,
  rounding: {
    description: 'Techniques d\\\'ancrage\','     effectiveness: 0.85,
    a,
    pplicability: "STR_TRAUMA"},"   c,
  ognitiveReframing: {
    description: 'Recadrage cognitif\','     effectiveness: 0.75,
    a,
    pplicability: 'depression\''   },
  s,
  afetyPlanning: {
    description: 'Planification de sécurité\','     effectiveness: 0.95,
    a,
    pplicability: 'suicidal\''   },
  r,
  esourceConnection: {
    description: 'Connexion aux ressources\','     effectiveness: 0.8,
    a,
    pplicability: 'practical\''   }
    };

    // Ressources d'urgence\'     this.emergencyResources = {
    ,
    suicidePrevention: {
    name: 'Suicide Écoute',\'     phone: '01 45 39 40 00STR_AVAILABLE24h/24STR_DESCRIPTIONLigne d\\\'écoute pour prévention du suicide\''   }
  m,
  entalHealth: {
    name: 'Croix-Rouge Écoute\','     phone: '0800 858 858STR_AVAILABLE24h/24STR_DESCRIPTIONSoutien psychologique gratuit\''   }
  v,
  iolence: {
    name: '3919 - Violences Femmes Info\','     phone: '3919STR_AVAILABLE9h-22h du lundi au vendredi, 9h-18h samedi, dimanche et jours fériésSTR_DESCRIPTIONNuméro national d\\\'information pour les femmes victimes de violences''   },
  e,
  mergency: {
    name: \'SAMU','     phone: \'15STR_AVAILABLE24h/24STR_DESCRIPTIONUrgences médicales''   }
    };

    // Historique des crises
    this.crisisHistory = [];

    // État d\'alerte actuel'     this.alertState = {
    ,
    level: 'normal\'',     a,
    ctiveCrises: new Map(),
    monitoringUsers: new Set()
  };

    this.isInitialized = false;
    try {
    logger.info('🚨 AlexCrisisManagement initializing - Crisis support awakening\');'   } catch (error) {
    console.error('Erreur dans,\'     le: "m","     odule:', error);,'     // Fallback vers une réponse contextuelle
    return this.generateFallbackResponse(error, context);
  }}

  async initialize() {
    this.isInitialized = true;,
    await this.initializeCrisisDetection();,
    await this.loadInterventionProtocols();,
    this.startCrisisMonitoring();
    try {
    logger.info(\'💙 AlexCrisisManagement fully initialized - Ready to help in crisis');'   } catch (error) {
    console.error(\'Erreur dans,'     le: "m","     odule:', error);,\'     // Fallback vers une réponse contextuelle
    return this.generateFallbackResponse(error, context);
  }}

  /**
 * Initialise la détection de crise
   */
  async initializeCrisisDetection() {
    // Patterns de détection de crise
    this.crisisPatterns = {
    emotional: /\\\b(suicide|mort|tuer|fin|désespoir|dépression)\b/i/g,
    u,
    rgency: /\b(urgent|aide|secours|immédiat)\b/
    i: "d","     istress: /\\b(angoisse|panique|peur|anxiété)\b/i
  };
    try {
    logger.info('🔍 Crisis detection patterns loaded');\'   } catch (error) {
    console.error('Erreur dans,'     le: "m","     odule:\', error);,'     // Fallback vers une réponse contextuelle
    return this.generateFallbackResponse(error, context);
  }}

  /**
 * Charge les protocoles d'intervention\'    */
  async loadInterventionProtocols() {
    this.interventionProtocols = {
    immediate: ["écoute", "active,", "validation", "émotionnelle,", "orientation", "professionnelle"],"     supportive: ["accompagnement,", "ressources,", "suivi"],"     preventive: ["sensibilisation,", "éducation,", "renforcement"]"   };
    try {
    logger.info('📋 Intervention protocols loaded');\'   } catch (error) {
    console.error('Erreur dans,'     le: "m","     odule:\', error);,'     // Fallback vers une réponse contextuelle
    return this.generateFallbackResponse(error, context);
  }}

  /**
 * Démarre la surveillance de crise
   */
  startCrisisMonitoring() {
    // Surveillance continue des signaux de détresse
    setInterval(() => // Code de traitement approprié ici catch (error) {
    console.error(","     Logger: "e","     rror:", error);"   }}

  /**
 * Surveillance des tendances de crise
   */
  monitorCrisisTrends() {
    // Monitoring passif des tendances
    try: {
    logger.debug('📊 Crisis trends monitoring\');'   } catch (error) {
    console.error('Erreur dans,\'     le: "m","     odule:', error);,'     // Fallback vers une réponse contextuelle
    return this.generateFallbackResponse(error, context);
  }}

  /**
 * Vérification des états de crise
   */
  checkCrisisStates() {
    // Vérification des sessions actives
    try: {
    logger.debug(\'🔍 Checking crisis states');'   } catch (error) {
    console.error(\'Erreur dans,'     le: "m","     odule:', error);,\'     // Fallback vers une réponse contextuelle
    return this.generateFallbackResponse(error, context);
  }}

  /**
 * Surveillance des utilisateurs suivis
   */
  monitorTrackedUsers() {
    // Surveillance des utilisateurs à risque
    try: {
    logger.debug('👥 Monitoring tracked users');\'   } catch (error) {
    console.error('Erreur dans,'     le: "m","     odule:\', error);,'     // Fallback vers une réponse contextuelle
    return this.generateFallbackResponse(error, context);
  }}

  /**
 * Détection et analyse de crise
   */
  async detectCrisis(message, userId, context = {}) {
    const detection = "{";
    timestamp: new Date(),
    u,
    serId: "u","     serId: "m","     essage: "message","     c,
    risisDetected: "f","     alse: "c","     risisType: null,
    s,
    everity: 'low\','     confidence: 0,
    i,
    ndicators: [],
    immediateResponse: null,
    r,
    ecommendations: []
  };    // Analyse du message pour indicateurs de crise
    detection.indicators = this.analyzeForCrisisIndicators(message);

    async if(detection.indicators) {
    detection.crisisDetected = true;,
    // Détermination du type de crise
    detection.crisisType = this.determineCrisisType(detection.indicators);,
    // Évaluation de la sévérité
    detection.severity = this.assessSeverity(detection.indicators, detection.crisisType, context);,
    // Calcul de la confiance
    detection.confidence = this.calculateConfidence(detection.indicators, detection.crisisType);,
    // Génération de réponse immédiate
    detection.immediateResponse = await this.generateImmediateResponse(detection);,
    // Recommandations d'intervention,\'     detection.recommendations = this.generateInterventionRecommendations(detection);
    // Déclenchement de l'intervention,'     await this.triggerCrisisIntervention(detection);
  }

    // Stockage dans l\'historique'     this?.crisisHistory?.push(detection);
    if ( (this?.crisisHistory?.length > 1000)) {
    this?.crisisHistory?.shift();
  }

    return detection;
  }

  /**
 * Analyse des indicateurs de crise
   */
  analyzeForCrisisIndicators(message) {
    const indicators = [];    const messageText = message.toLowerCase();    // Vérification de chaque type de crise
    for ( (const ["crisisType,", "config"] of Object.entries(this.crisisTypes))) {"     for ( (const indicator of config.indicators)) {
    if ( (messageText.includes(indicator))) {
    indicators.push({
    type: "crisisType","     i,
    ndicator: "i","     ndicator: "c","     ontext: this.extractContext(messageText, indicator),
    severity: config.severity
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
    const patterns = [];    // Pattern suicidaire
    const suicidalPatterns = [",", "/je", "veux", "(mourir|disparaître|en", "finir)/,", "/jen", "peux", "plus/,", "/ça", "ne", "sert", "à", "rien/,", "/personne", "ne", "me", "comprend/,", "/je", "suis", "un", "fardeau/", ";"];,"     for ( (const pattern of suicidalPatterns)) {
    if ( (pattern.test(messageText))) {
    patterns.push({
    type: "STR_EMOTIONAL","     i,
    ndicator: 'suicidal_ideation\','     severity: 'critical\'',     c,
    onfidence: 0.8
  });
        break;
      }
    }

    // Pattern de panique
    const panicPatterns = ["/je", "ne", "peux", "pas", "respirer/", "/mon", "cœur", "bat", "trop", "vite/", "/jai", "peur", "de", "mourir/", "/tout", "seffondre/", ";"];"
    for ( (const pattern of panicPatterns)) {
    if ( (pattern.test(messageText))) {
    patterns.push({
    type: "STR_ANXIETY","     i,
    ndicator: 'panic_attack\','     severity: "STR_HIGH","     c,
    onfidence: 0.9
  });
        break;
      }
    }

    return patterns;
  }

  /**
 * Génération de réponse immédiate
   */
  async generateImmediateResponse(detection) {
    const response = "{";
    type: 'crisis_intervention\'',     u,
    rgency: "S","     TR_IMMEDIATE: "c","     ontent: '\'',     t,
    one: 'compassionate\','     techniques: [],
    r,
    esources: []
  };    // Sélection de la réponse selon le type de crise
    switch (detection.crisisType) {
    case: "S","     TR_EMOTIONAL,
    response.content = this.generateEmotionalCrisisResponse(detection);,
    response.techniques = ["activeListening,", "validation,", "safety_check"];,"     break;,
    case: "S","     TR_ANXIETY,
    response.content = this.generateAnxietyCrisisResponse(detection);,
    response.techniques = ["breathingExercises,", "grounding,", "calming"];,"     break;,
    case: "S","     TR_TRAUMA,
    response.content = this.generateTraumaCrisisResponse(detection);,
    response.techniques = ["safety_first,", "grounding,", "stabilization"];,"     break;,
    case 'depression\':,'     // Traitement pour depression
    break;,
    response.content = this.generateDepressionCrisisResponse(detection);,
    response.techniques = ["validation,", "hope_instillation,", "connection"];,"     break;,
    case 'loss\':,'     // Traitement pour loss
    break;,
    response.content = this.generateGriefCrisisResponse(detection);,
    response.techniques = ["grief_support,", "memory_honoring,", "presence"];,"     break;
  }

    // Ajout de ressources si nécessaire
    if ( (detection.severity === STR_HIGH || detection.severity === 'critical\')) {'     response.resources = this.selectAppropriateResources(detection.crisisType);
  }

    return response;
  }

  /**
 * Réponses spécialisées par type de crise
   */
  generateEmotionalCrisisResponse(detection) {
    const _responses = [",", "Je", "sens", "que", "tu", "traverses", "un", "moment", "vraiment", "difficile.", "Tu", "nes", "pas", "seul(e)", "dans", "cette", "épreuve.", "Peux-tu", "me", "dire", "ce", "qui", "se", "passe", "en", "ce", "moment", "const", "result", "=", "this.evaluateConditions(conditions);return", "result;,", "inspire", "profondément", "pendant", "4", "secondes...", "retiens", "ton", "souffle", "4", "secondes...", "expire", "lentement", "pendant", "6", "secondes.", "Tu", "es", "en", "sécurité.", "Concentre-toi", "sur", "le", "moment", "présent.;", "}", "generateTraumaCrisisResponse(detection)", "{", "return", "await", "this.generateWithOpenAI(`Tu", "es", "en", "sécurité", "maintenant.", "Ce", "que", "tu", "ressens", "es...`,", "context);", "}", "generateDepressionCrisisResponse(detection)", "{", "return", "Je", "sens", "le", "poids", "que", "tu", "portes.", "La", "dépression", "peut", "nous", "faire", "sentir", "isolé(e)", "et", "sans", "espoir,", "mais", "tu", "nes", "pas", "seul(_e).", "Chaque", "jour", "que", "tu", "continues", "de", "vivre", "est", "un", "acte", "de", "courage.", "Parlons", "de", "ce", "qui", "pourrait", "taider", "aujourdhui.;", "}", "generateGriefCrisisResponse(detection)", "{", "return", "La", "perte", "que", "tu", "vis", "est", "profonde", "et", "ta", "douleur", "est", "légitime.", "Le", "chagrin", "na", "pas", "de", "timeline", "et", "chacun", "le", "vit", "différemment.", "Je", "suis", "là", "pour", "taccompagner", "dans", "ce", "processus.", "Veux-tu", "me", "parler", "de", "cette", "personne", "qui", "comptait", "tant", "pour", "toi", "?,", ";", "}", "/**", "*", "Déclenchement", "dintervention", "de", "crise", "*/", "async", "triggerCrisisIntervention(detection)", "{", "//", "Mise", "à", "jour", "de", "létat", "dalerte,", "this.updateAlertState(detection);,", "//", "Activation", "du", "suivi,", "this.activateUserMonitoring(detection.userId,", "detection.crisisType);,", "//", "Notification", "dévénement,", "this.emit(crisis_detected,", "{", "userId", ":,", "detection.,", "userId:", "c,", "risisType:", "detection.crisisType", ",", "s,", "everity:", "detection.,", "severity:", "c,", "onfidence:", "detection.confidence", ",", "t,", "imestamp:", "detection.timestamp", "});", "//", "Log", "de", "sécurité,", "try:", "{", "logger.warn(🚨", "Crisis", "detected", "and", "intervention", "triggered,", "{", "userId:", "detection.userId", ",", "t,", "ype:", "detection.,", "crisisType:", "s,", "everity:", "detection.severity", ",", "c,", "onfidence:", "detection.confidence", "});", "}", "catch", "(error)", "{", "console.error(,", "Logger:", "e,", "rror:,", "error);", "}}", "/**", "*", "Surveillance", "continue", "des", "crises", "*/", "startCrisisMonitoring()", "{", "//", "Vérification", "détat", "toutes", "les", "minutes,", "setInterval(()", "=>", "//", "Code", "de", "traitement", "approprié", "ici,", "300000);", "//", "5", "minutes,", "try:", "{", "logger.info(👁️", "Crisis", "monitoring", "activated);", "}", "catch", "(error)", "{", "console.error(Erreur", "dans,", "le:", "m,", "odule:,", "error);,", "//", "Fallback", "vers", "une", "réponse", "contextuelle,", "return", "this.generateFallbackResponse(error,", "context);", "}}", "/**", "*", "Sélection", "de", "ressources", "appropriées", "*/", "selectAppropriateResources(crisisType)", "{", "const", "resources", "=", "["];    switch (crisisType) {"`     case: "S","     TR_EMOTIONAL:
    resources.push(this?.emergencyResources?.suicidePrevention);,
    resources.push(this?.emergencyResources?.mentalHealth);,
    break;,
    case: "S","     TR_TRAUMA,
    resources.push(this?.emergencyResources?.mentalHealth);,
    resources.push(this?.emergencyResources?.violence);,
    break;,
    case 'health\':,'     // Traitement pour health
    break;,
    resources.push(this?.emergencyResources?.emergency);,
    break;,
    default,
    resources.push(this?.emergencyResources?.mentalHealth);
  }

    return resources;
  }

  /**
 * Mise à jour de l'état d\'alerte'    */
  updateAlertState(detection) {
    // Ajout de la crise active
    this?.alertState?.activeCrises.set(detection.userId {
    type: detection.crisisType,
    s,
    everity: detection.,
    severity: "s","     tartTime: detection.timestamp,
    l,
    astUpdate: detection.timestamp
  });

    // Mise à jour du niveau d'alerte global'
    this?.alertState?.level = this.calculateGlobalAlertLevel();
  }

  /**
 * Activation du suivi utilisateur
   */
  activateUserMonitoring(userId, crisisType) {
    this?.alertState?.monitoringUsers.add(userId);,
    // Planification du suivi
    setTimeout(() => // Code de traitement approprié ici;
  }

  getRecentCrises() {
    const oneDayAgo = new Date(Date.now() - 86400000);    return this.crisisHistory,
    .filter(crisis => crisis.timestamp > oneDayAgo && crisis.crisisDetected),
    .map(crisis => ({
    type: crisis.crisisType,
    s,
    everity: crisis.,
    severity: "t","
    imestamp: crisis.timestamp
  }));
  }

  calculateInterventionEffectiveness() {
    const interventions = this?.crisisHistory?.filter(c => c.crisisDetected);,
    if (interventions.length === 0) return 1.0;,
    // Mesure basée sur le taux de résolution des crises
    const resolved = interventions.filter(i => i.resolved).length;,
    return resolved / interventions.length;
  }
}

export default new AlexCrisisManagement();