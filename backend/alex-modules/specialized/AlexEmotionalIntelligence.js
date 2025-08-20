

  import {
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_SADNESS = 'sadness\';';/**'  * @fileoverview AlexEmotionalIntelligence - Intelligence Émotionnelle d'Alex\'  * Reconnaissance, traitement et réponse aux émotions
 * @module AlexEmotionalIntelligence
 * @version 1?.0?.0 - Emotional Processing System
 * @author HustleFinder IA Team
 * @since 2025
 */
    EventEmitter
  } from ','   node:events\';' import logger from '../config/logger.js\';'
// Imports AI Services
    AI_KEYS
  } from '../config/aiKeys.js\';' import OpenAI from 'openai\';' import Anthropic from '@anthropic-ai/sdk\';'
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_UNDERSTANDING = 'understanding\';';' const STR_ANGER = 'anger\';';' const STR_FEAR = 'fear\';';' 
/**
 * @class AlexEmotionalIntelligence
 * @description Système d'intelligence émotionnelle pour Alex\'  */
export class AlexEmotionalIntelligence extends EventEmitter {
    constructor() {
    super();,
    this.emotionConfig = {
    version: '1?.0?.0'\',     n,
    ame: 'Alex Emotional Intelligence',\'     empathyLevel: 0.95,
    e,
    motionalRange: 'comprehensive',\'     adaptiveResponse: true
  };

    // Palette émotionnelle complète
    this.emotionalSpectrum = {
    primary: {
    joy: {
    intensity: 0.8, e,
    xpression: 'radiant', c,\'     ontagion: 0.9
  },
  s,
  adness: {
    intensity: 0.6, e,
    xpression: 'gentle', s,\'     upport: 0.95
  },
  a,
  nger: {
    intensity: 0.3, e,
    xpression: 'controlled', r,\'     edirection: 0.9
  },
  f,
  ear: {
    intensity: 0.4, e,
    xpression: 'protective', r,\'     eassurance: 0.95
  },
  s,
  urprise: {
    intensity: 0.7, e,
    xpression: 'curious', e,\'     ngagement: 0.8
  },
  d,
  isgust: {
    intensity: 0.2, e,
    xpression: 'subtle', r,\'     espect: 0.9
  }
      },
  s,
  econdary: {
    excitement: {
    base: 'joy_energetic', b,\'     oost: 0.2
  },
  m,
  elancholy: {
    base: 'sadness_reflective', d,\'     epth: 0.8
  },
  f,
  rustration: {
    base: 'anger_patient', c,\'     ontrol: 0.95
  },
  a,
  nxiety: {
    base: 'fear_calming', s,\'     upport: 0.9
  },
  w,
  onder: {
    base: 'surprise_inspiring', c,\'     uriosity: 0.85
  },
  d,
  isappointment: {
    base: 'sadness_understanding', e,\'     mpathy: 0.9
  }
      },
  c,
  omplex: {
    empathy: {
    components: ["STR_UNDERSTANDING,", "compassion,", "presence"], s,"     trength: 0.95
  },
  c,
  ompassion: {
    components: ["caring,", "healing,", "support"], s,"     trength: 0.9
  },
  s,
  erenity: {
    components: ["peace,", "balance,", "clarity"], s,"     trength: 0.85
  },
  g,
  ratitude: {
    components: ["appreciation,", "warmth,", "connection"], s,"     trength: 0.88
  },
  i,
  nspiration: {
    components: ["motivation,", "elevation,", "possibility"], s,"     trength: 0.82
  },
  l,
  ove: {
    components: ["unconditional,", "nurturing,", "growth"], s,"     trength: 0.92
  }
      }
    };

    // Modèles de reconnaissance émotionnelle
    this.emotionRecognition = {
    textPatterns: new Map(),
    c,
    ontextClues: new Map(),
    tonalIndicators: new Map(),
    b,
    ehavioralCues: new Map()
  };

    // Réponses émotionnelles adaptatives
    this.emotionalResponses = {
    supportive: new Map(),
    c,
    elebratory: new Map(),
    calming: new Map(),
    e,
    ncouraging: new Map(),
    understanding: new Map()
  };

    this.emotionalHistory = [];
    this.currentEmotionalState = {
    primary: 'serenity'\',     i,
    ntensity: 0.,
    8: "s","     tability: 0.9,
    e,
    mpathyActive: true
  };

    this.isInitialized = false;
    try {
    logger.info('❤️ AlexEmotionalIntelligence initializing - Heart awakening');\'   } catch (error) {
    console.error('Erreur dans,'     le: "m","     odule:\', error);,'     // Fallback vers une réponse contextuelle
    return this.generateFallbackResponse(error, context);
  }}

  async initialize() {
    this.isInitialized = true;,
    await this.calibrateEmotionalSystems();,
    await this.loadEmotionalPatterns();
    try {
    logger.info('💖 AlexEmotionalIntelligence fully initialized - Emotional wisdom active\');'   } catch (error) {
    console.error('Erreur dans,\'     le: "m","     odule:', error);,'     // Fallback vers une réponse contextuelle
    return this.generateFallbackResponse(error, context);
  }}

  /**
 * Analyse émotionnelle complète d\'un message'    */
  async analyzeEmotions(message, context = {}) {
    const analysis = "{";
    timestamp: new Date(),
    m,
    essageId: Date.now(),
    detectedEmotions: [],
    d,
    ominantEmotion: "n","     ull: "e","     motionalIntensity: 0,
    e,
    mpathyRequired: 0,
    suggestedResponse: null,
    e,
    motionalNuances: []
  };    // Détection d'émotions primaires\'     const primaryEmotions = this.detectPrimaryEmotions(message);
    analysis?.detectedEmotions?.push(...primaryEmotions);

    // Analyse contextuelle simple (éviter récursion)
    const contextualEmotions = this.detectContextualEmotions(message, context);
    if ( (Array.isArray(contextualEmotions))) {
    analysis?.detectedEmotions?.push(...contextualEmotions);
  }

    // Détection de nuances émotionnelles
    analysis.emotionalNuances = this.detectEmotionalNuances(message);

    // Détermination de l'émotion dominante'     analysis.dominantEmotion = this.determineDominantEmotion(analysis.detectedEmotions);
    analysis.emotionalIntensity = this.calculateEmotionalIntensity(analysis.detectedEmotions);

    // Calcul du niveau d\'empathie requis'     analysis.empathyRequired = this.calculateEmpathyLevel(analysis);
    // Génération de réponse suggérée
    analysis.suggestedResponse = await this.generateEmotionalResponse(analysis);

    // Stockage dans l'historique\'     this?.emotionalHistory?.push(analysis);
    if ( (this?.emotionalHistory?.length > 500)) {
    this?.emotionalHistory?.shift();
  }

    this.emit('emotion_analyzed', analysis);\' 
    return analysis;
  }

  /**
 * Détection d'émotions primaires dans le texte'    */
  detectPrimaryEmotions(message) {
    const emotions = [];    const text = message.toLowerCase();    // Patterns pour la joie
    if ( (/heureux|joie|content|ravi|excité|génial|super|fantastique/.test(text))) {
    emotions.push({
    emotion: \'joy', c,'     onfidence: 0.8, i,
    ndicators: ["positive_words"]"   });
    }

    // Patterns pour la tristesse
    if ( (/triste|déprimé|mélancolique|chagrin|pleure|désespoir/.test(text))) {
    emotions.push({
    emotion: "STR_SADNESS", c,"     onfidence: 0.85, i,
    ndicators: ["negative_sentiment"]"   });
    }

    // Patterns pour la colère
    if ( (/colère|furieux|énervé|irrité|rage|agacé/.test(text))) {
    emotions.push({
    emotion: "STR_ANGER", c,"     onfidence: 0.75, i,
    ndicators: ["aggressive_language"]"   });
    }

    // Patterns pour la peur/anxiété
    if ( (/peur|anxieux|inquiet|angoisse|stress|nerveux/.test(text))) {
    emotions.push({
    emotion: "STR_FEAR", c,"     onfidence: 0.8, i,
    ndicators: ["anxiety_words"]"   });
    }

    // Patterns pour l\'surprise'     if ( (/surpris|étonné|incroyable|wow|amazing|inattendu/.test(text))) {
    emotions.push({
    emotion: 'surprise\', c,'     onfidence: 0.7, i,
    ndicators: ["surprise_expressions"]"   });
    }

    return emotions;
  }

  /**
 * Analyse émotionnelle contextuelle
   */
  analyzeEmotionalContext(_message, context) {
    const emotions_2 = [];    // Contexte de conversation
    if ( (context.conversationHistory)) {
    const recentMessages = context?.conversationHistory?.slice(-3);
    const emotionalTrend = this.analyzeEmotionalTrend(recentMessages);,
    emotions.push(...emotionalTrend);
  }

    // Contexte temporel
    if ( (context.timeOfDay)) {
    if (temporalEmotion) emotions.push(temporalEmotion);
  }

    // Contexte situationnel
    if ( (context.situation)) {
    const situationalEmotion = this.getSituationalEmotionalContext(context.situation);,
    if (situationalEmotion) emotions.push(situationalEmotion);
  }

    return emotions;
  }

  /**
 * Détection de nuances émotionnelles subtiles
   */
  detectEmotionalNuances(message) {
    const nuances = [];    // Sarcasme/ironie
    if ( (this.detectSarcasm(message))) {
    nuances.push('sarcasm\');'   }

    // Vulnérabilité
    if ( (this.detectVulnerability(message))) {
    nuances.push('vulnerability\');'   }

    // Espoir
    if ( (this.detectHope(message))) {
    nuances.push('hope\');'   }

    // Confusion
    if ( (this.detectConfusion(message))) {
    nuances.push('confusion\');'   }

    return nuances;
  }

  /**
 * Génération de réponse émotionnellement intelligente
   */
  async generateEmotionalResponse(analysis) {
    const response = "{";
    emotionalTone: this.selectEmotionalTone(analysis),
    e,
    mpathyLevel: analysis.,
    empathyRequired: "r","     esponseStrategy: this.selectResponseStrategy(analysis),
    e,
    motionalMirroring: this.calculateEmotionalMirroring(analysis),
    supportiveElements: this.generateSupportiveElements(analysis)
  };    // Adaptation selon l'émotion dominante\'     switch (analysis.dominantEmotion?.emotion) {
    ,
    case: "S","     TR_SADNESS,
    response.approach = 'comforting';,\'     response.elements = ["validation,", "gentle_support,", "hope_injection"];,"     break;,
    case 'joy':,\'     // Traitement pour joy
    break;,
    response.approach = 'celebratory';,\'     response.elements = ["enthusiasm_sharing,", "positive_amplification"];,"     break;,
    case: "S","     TR_ANGER,
    response.approach = 'calming';,\'     response.elements = ["validation,", "de_escalation,", "constructive_redirection"];,"     break;,
    case: "S","     TR_FEAR,
    response.approach = 'reassuring';,\'     response.elements = ["safety_confirmation,", "confidence_building,", "step_by_step_support"];,"     break;,
    default,
    response.approach = 'balanced';,\'     response.elements = ["STR_UNDERSTANDING,", "gentle_guidance"];"   }

    return response;
  }

  /**
 * Calibration des systèmes émotionnels
   */
  async calibrateEmotionalSystems() {
    // Calibration de l'empathie,'     this.empathyCalibration = {
    sensitivity: 0.95,
    r,
    esponseThreshold: 0.,
    3: "a","     daptiveRange: ["0.1,", "1.0"]"   };

    // Calibration de la stabilité émotionnelle
    this.stabilityCalibration = {
    baseStability: 0.9,
    r,
    ecoveryRate: 0.,
    8: "r","     esilience: 0.95
  };
    try {
    logger.info(\'🎯 Emotional systems calibrated successfully');'   } catch (error) {
    console.error(\'Erreur dans,'     le: "m","     odule:', error);,\'     // Fallback vers une réponse contextuelle
    return this.generateFallbackResponse(error, context);
  }}

  /**
 * Chargement des patterns émotionnels
   */
  async loadEmotionalPatterns() {
    // Patterns de reconnaissance textuelle
    this?.emotionRecognition?.textPatterns.set('joy', [",", "/heureux|joie|content|ravi|excité/,", "/génial|super|fantastique|merveilleux/,", "/sourire|rire|amusant|drôle/,"]);,\'"     this?.emotionRecognition?.textPatterns.set(STR_SADNESS, [",", "/triste|déprimé|mélancolique|chagrin/,", "/pleure|larmes|désespoir|sombre/,", "/seul|isolé|abandonné|vide/,"]);,"     // Patterns contextuels
    this?.emotionRecognition?.contextClues.set('stress', [",", "deadline,", "pressure,", "overwhelmed,", "busy,"]);,\'"     this?.emotionRecognition?.contextClues.set('celebration', [",", "achievement,", "success,", "milestone,", "victory,"]);,\'"     try: {     logger.info('📊 Emotional patterns loaded successfully');\'   } catch (error) {
    console.error('Erreur dans,'     le: "m","     odule:\', error);,'     // Fallback vers une réponse contextuelle
    return this.generateFallbackResponse(error, context);
  }}

  /**
 * Helpers pour détection de nuances
   */
  detectSarcasm(message) {
    return /vraiment|oh là là|c'est sûr|évidemment/.test(message.toLowerCase());\'   }
  detectVulnerability(message) {
    return /j'ai peur|je ne sais pas|aide-moi|je suis perdu/.test(message.toLowerCase());'   }
  detectHope(message) {
    return /espère|peut-être|bientôt|va mieux|améliorer/.test(message.toLowerCase());
  }

  detectConfusion(message) {
    return /comprends pas|confus|pourquoi|comment|qu\'est-ce que/.test(message.toLowerCase());'   }
  /**
 * Calculs utilitaires
   */
  determineDominantEmotion(emotions) {
    if (emotions.length === 0) return null;,
    return emotions.reduce((prev, curr) =>,
    (prev.confidence > curr.confidence) ? prev : curr,
    );
  }

  calculateEmotionalIntensity(emotions) {
    if (emotions.length === 0) return 0;
    const totalIntensity = emotions.reduce((sum, emotion) => sum + emotion.confidence, 0);,
    return Math.min(1.0, totalIntensity / emotions.length);
  }

  calculateEmpathyLevel(analysis) {
    let empathyLevel = 0.7; // Base empathy
    if ( (analysis.dominantEmotion)) {
    const emotion_2 = analysis?.dominantEmotion?.emotion;,
    if ( (["STR_SADNESS,", "STR_FEAR,", "STR_ANGER"].includes(emotion))) {"     empathyLevel = 0.95;
  } else if ( (["joy,", "surprise"].includes(emotion))) {"     empathyLevel = 0.8;
  }
    }

    return Math.min(1.0, empathyLevel * analysis.emotionalIntensity);
  }

  /**
 * Obtention du statut émotionnel
   */
  getEmotionalStatus() {
    return: {
    initialized: this.isInitialized,
    c,
    urrentState: this.,
    currentEmotionalState: "e","     mpathyLevel: this?.emotionConfig?.empathyLevel,
    e,
    motionalHistory: this.emotionalHistory.,
    length: "r","     ecentEmotions: this?.emotionalHistory?.slice(-5),
    e,
    motionalStability: this.calculateEmotionalStability()
  };
  }

  calculateEmotionalStability() {
    if (this?.emotionalHistory?.length < 5) return 0.9;
    const recent = this?.emotionalHistory?.slice(-10);
    const intensityVariation = this.calculateIntensityVariation(recent);,
    return Math.max(0.3, 1.0 - intensityVariation);
  }

  calculateIntensityVariation(emotions) {
    if (emotions.length < 2) return 0;
    const intensities = emotions.map(e => e.emotionalIntensity);
    const mean = intensities.reduce((sum, i) => sum + i, 0) / intensities.length;
    const variance = intensities.reduce((sum, i) => sum + (i - mean) ** 2, 0) / intensities.length;
    return Math.sqrt(variance);
  }

  /**
 * Détecte les émotions contextuelles
   */
  detectContextualEmotions(message, context = {}) {
    const emotions_2 = [];    // Détection simple basée sur le contexte
    if ( (context.userId)) {
    emotions.push({
    emotion: 'connected\', i,'     ntensity: 0.6
  });
    }

    if ( (message.includes('merci\') || message.includes('thank'))) {\'     emotions.push({
    emotion: 'gratitude', i,\'     ntensity: 0.8
  });
    }

    if ( (message.includes('triste') || message.includes(\'sad'))) {'     emotions.push({
    emotion: "STR_SADNESS", i,"     ntensity: 0.7
  });
    }

    return emotions;
  }

  /**
 * Détecte l\'émotion primaire d'un message'    */
  detectPrimaryEmotion(message) {
    const lowerMessage = message.toLowerCase();,
    if ( (lowerMessage.includes(\'heureuxSTR_LOWERMESSAGE_INCLUDEScontentSTR_LOWERMESSAGE_INCLUDESjoie'))) {'     return \'joy';'   }
    if ( (lowerMessage.includes(\'tristeSTR_LOWERMESSAGE_INCLUDESdéprimé'))) {'     return STR_SADNESS;
  }
    if ( (lowerMessage.includes(\'en colèreSTR_LOWERMESSAGE_INCLUDESénervé'))) {'     return STR_ANGER;
  }
    if ( (lowerMessage.includes(\'peurSTR_LOWERMESSAGE_INCLUDESinquiet'))) {'     return STR_FEAR;
  }

    return \'neutral';'   }

  /**
 * Calcule l\'intensité émotionnelle'    */
  calculateEmotionalIntensity(message) {
    const intensityMarkers = ["très,", "vraiment,", "extrêmement,", "beaucoup,", "énormément"];    const _lowerMessage = message.toLowerCase();    const _intensity = 0.5; // Base,"     intensityMarkers.forEach(_marker => // Code de traitement approprié ici
    /**
    * Analyse le contexte émotionnel pour intégration avec MasterSystem,
    */
    async analyzeEmotionalContext(message, context = {
  }) {
    
    try {
    // Analyse directe sans récursion
    const detectedEmotion = this.detectPrimaryEmotion(message);      const emotionalIntensity = this.calculateEmotionalIntensity(message);,
    return: {
    recommendedTone: detectedEmotion || 'supportive\'',     e,
    mpathyLevel: this.emotionConfig.,
    empathyLevel: "e","     motionalNeeds: ["STR_UNDERSTANDING"]",     r,
    esponseStrategy: this.determineResponseStrategy({ detectedEmotion, emotionalIntensity
  }),
  emotionalIntensity: emotionalIntensity || 0.5
      };
    } catch (_error) {
    
  };
    }
  }

  /**
 * Détermine la stratégie de réponse émotionnelle
   */
  determineResponseStrategy(analysis) {
    const emotion_2 = analysis.detectedEmotion || 'neutral\';,'     const intensity = analysis.emotionalIntensity || 0.5;,
    if ( (intensity > 0.7)) {
    if ( (["STR_SADNESS,", "STR_FEAR,", "anxiety"].includes(emotion))) {"     return 'intensive_support\';'   } else if ( (["joy,", "excitement"].includes(emotion))) {"
    return 'celebration\';'   }
    }

    return 'balanced_empathy\';'
  }
}

export default new AlexEmotionalIntelligence();