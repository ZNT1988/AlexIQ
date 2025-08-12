
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_SADNESS = 'sadness';
/**
 * @fileoverview AlexEmotionalIntelligence - Intelligence Émotionnelle d'Alex
 * Reconnaissance, traitement et réponse aux émotions
 * @module AlexEmotionalIntelligence
 * @version 1.0.0 - Emotional Processing System
 * @author HustleFinder IA Team
 * @since 2025
 */

import { EventEmitter } from 'events';
import logger from '../config/logger.js';

/**
 * @class AlexEmotionalIntelligence
 * @description Système d'intelligence émotionnelle pour Alex
 */
export class AlexEmotionalIntelligence extends EventEmitter {
  constructor() {
    super();

    this.emotionConfig = {
      version: '1.0.0'
      name: 'Alex Emotional Intelligence'
      empathyLevel: 0.95
      emotionalRange: 'comprehensive'
      adaptiveResponse: true
    };

    // Palette émotionnelle complète
    this.emotionalSpectrum = {
      primary: {
        joy: { intensity: 0.8, expression: 'radiant', contagion: 0.9 }
        sadness: { intensity: 0.6, expression: 'gentle', support: 0.95 }
        anger: { intensity: 0.3, expression: 'controlled', redirection: 0.9 }
        fear: { intensity: 0.4, expression: 'protective', reassurance: 0.95 }
        surprise: { intensity: 0.7, expression: 'curious', engagement: 0.8 }
        disgust: { intensity: 0.2, expression: 'subtle', respect: 0.9 }
      }
      secondary: {
        excitement: { base: 'joySTR_MODIFIERenergetic', boost: 0.2 }
        melancholy: { base: 'sadnessSTR_MODIFIERreflective', depth: 0.8 }
        frustration: { base: 'angerSTR_MODIFIERpatient', control: 0.95 }
        anxiety: { base: 'fearSTR_MODIFIERcalming', support: 0.9 }
        wonder: { base: 'surpriseSTR_MODIFIERinspiring', curiosity: 0.85 }
        disappointment: { base: 'sadnessSTR_MODIFIERunderstanding', empathy: 0.9 }
      }
      complex: {
        empathy: { components: [STR_UNDERSTANDING, 'compassion', 'presence'], strength: 0.95 }
        compassion: { components: ['caring', 'healing', 'support'], strength: 0.9 }
        serenity: { components: ['peace', 'balance', 'clarity'], strength: 0.85 }
        gratitude: { components: ['appreciation', 'warmth', 'connection'], strength: 0.88 }
        inspiration: { components: ['motivation', 'elevation', 'possibility'], strength: 0.82 }
        love: { components: ['unconditional', 'nurturing', 'growth'], strength: 0.92 }
      }
    };

    // Modèles de reconnaissance émotionnelle
    this.emotionRecognition = {
      textPatterns: new Map()
      contextClues: new Map()
      tonalIndicators: new Map()
      behavioralCues: new Map()
    };

    // Réponses émotionnelles adaptatives
    this.emotionalResponses = {
      supportive: new Map()
      celebratory: new Map()
      calming: new Map()
      encouraging: new Map()
      understanding: new Map()
    };

    this.emotionalHistory = [];
    this.currentEmotionalState = {
      primary: 'serenity'
      intensity: 0.8
      stability: 0.9
      empathyActive: true
    };

    this.isInitialized = false;

    try {
      logger.info('❤️ AlexEmotionalIntelligence initializing - Heart awakening');

    } catch (error) {
    // Logger fallback - ignore error
  }}

  async initialize() {
    this.isInitialized = true;
    await this.calibrateEmotionalSystems();
    await this.loadEmotionalPatterns();

    try {
      logger.info('💖 AlexEmotionalIntelligence fully initialized - Emotional wisdom active');

    } catch (error) {
    // Logger fallback - ignore error
  }}

  /**
   * Analyse émotionnelle complète d'un message
   */
  async analyzeEmotions(message, context = {}) {
    const analysis = {
      timestamp: new Date()
      messageId: Date.now()
      detectedEmotions: []
      dominantEmotion: null
      emotionalIntensity: 0
      empathyRequired: 0
      suggestedResponse: null
      emotionalNuances: []
    };

    // Détection d'émotions primaires
    const primaryEmotions = this.detectPrimaryEmotions(message);
    analysis.detectedEmotions.push(...primaryEmotions);

    // Analyse contextuelle simple (éviter récursion)
    const contextualEmotions = this.detectContextualEmotions(message, context);
    if (Array.isArray(contextualEmotions)) {
      analysis.detectedEmotions.push(...contextualEmotions);
    }

    // Détection de nuances émotionnelles
    analysis.emotionalNuances = this.detectEmotionalNuances(message);

    // Détermination de l'émotion dominante
    analysis.dominantEmotion = this.determineDominantEmotion(analysis.detectedEmotions);
    analysis.emotionalIntensity = this.calculateEmotionalIntensity(analysis.detectedEmotions);

    // Calcul du niveau d'empathie requis
    analysis.empathyRequired = this.calculateEmpathyLevel(analysis);

    // Génération de réponse suggérée
    analysis.suggestedResponse = await this.generateEmotionalResponse(analysis);

    // Stockage dans l'historique
    this.emotionalHistory.push(analysis);
    if (this.emotionalHistory.length > 500) {
      this.emotionalHistory.shift();
    }

    this.emit('emotion_analyzed', analysis);

    return analysis;
  }

  /**
   * Détection d'émotions primaires dans le texte
   */
  detectPrimaryEmotions(message) {
    const emotions = [];
    const text = message.toLowerCase();

    // Patterns pour la joie
    if (/heureux|joie|content|ravi|excité|génial|super|fantastique/.test(text)) {
      emotions.push({ emotion: 'joy', confidence: 0.8, indicators: ['positive_words'] });
    }

    // Patterns pour la tristesse
    if (/triste|déprimé|mélancolique|chagrin|pleure|désespoir/.test(text)) {
      emotions.push({ emotion: STR_SADNESS, confidence: 0.85, indicators: ['negative_sentiment'] });
    }

    // Patterns pour la colère
    if (/colère|furieux|énervé|irrité|rage|agacé/.test(text)) {
      emotions.push({ emotion: STR_ANGER, confidence: 0.75, indicators: ['aggressive_language'] });
    }

    // Patterns pour la peur/anxiété
    if (/peur|anxieux|inquiet|angoisse|stress|nerveux/.test(text)) {
      emotions.push({ emotion: STR_FEAR, confidence: 0.8, indicators: ['anxiety_words'] });
    }

    // Patterns pour l'surprise
    if (/surpris|étonné|incroyable|wow|amazing|inattendu/.test(text)) {
      emotions.push({ emotion: 'surprise', confidence: 0.7, indicators: ['surprise_expressions'] });
    }

    return emotions;
  }

  /**
   * Analyse émotionnelle contextuelle
   */
  analyzeEmotionalContext(message, context) {
    const emotions = [];

    // Contexte de conversation
    if (context.conversationHistory) {
      const recentMessages = context.conversationHistory.slice(-3);
      const emotionalTrend = this.analyzeEmotionalTrend(recentMessages);
      emotions.push(...emotionalTrend);
    }

    // Contexte temporel
    if (context.timeOfDay) {

      if (temporalEmotion) emotions.push(temporalEmotion);
    }

    // Contexte situationnel
    if (context.situation) {
      const situationalEmotion = this.getSituationalEmotionalContext(context.situation);
      if (situationalEmotion) emotions.push(situationalEmotion);
    }

    return emotions;
  }

  /**
   * Détection de nuances émotionnelles subtiles
   */
  detectEmotionalNuances(message) {
    const nuances = [];

    // Sarcasme/ironie
    if (this.detectSarcasm(message)) {
      nuances.push('sarcasm');
    }

    // Vulnérabilité
    if (this.detectVulnerability(message)) {
      nuances.push('vulnerability');
    }

    // Espoir
    if (this.detectHope(message)) {
      nuances.push('hope');
    }

    // Confusion
    if (this.detectConfusion(message)) {
      nuances.push('confusion');
    }

    return nuances;
  }

  /**
   * Génération de réponse émotionnellement intelligente
   */
  async generateEmotionalResponse(analysis) {
    const response = {
      emotionalTone: this.selectEmotionalTone(analysis)
      empathyLevel: analysis.empathyRequired
      responseStrategy: this.selectResponseStrategy(analysis)
      emotionalMirroring: this.calculateEmotionalMirroring(analysis)
      supportiveElements: this.generateSupportiveElements(analysis)
    };

    // Adaptation selon l'émotion dominante
    switch (analysis.dominantEmotion?.emotion) {
      case STR_SADNESS:
        response.approach = 'comforting';
        response.elements = ['validation', 'gentle_support', 'hope_injection'];
        break;

      case 'joy':
        response.approach = 'celebratory';
        response.elements = ['enthusiasm_sharing', 'positive_amplification'];
        break;

      case STR_ANGER:
        response.approach = 'calming';
        response.elements = ['validation', 'de_escalation', 'constructive_redirection'];
        break;

      case STR_FEAR:
        response.approach = 'reassuring';
        response.elements = ['safety_confirmation', 'confidence_building', 'step_by_step_support'];
        break;

      default:
        response.approach = 'balanced';
        response.elements = [STR_UNDERSTANDING, 'gentle_guidance'];
    }

    return response;
  }

  /**
   * Calibration des systèmes émotionnels
   */
  async calibrateEmotionalSystems() {
    // Calibration de l'empathie
    this.empathyCalibration = {
      sensitivity: 0.95
      responseThreshold: 0.3
      adaptiveRange: [0.1, 1.0]
    };

    // Calibration de la stabilité émotionnelle
    this.stabilityCalibration = {
      baseStability: 0.9
      recoveryRate: 0.8
      resilience: 0.95
    };

    try {
      logger.info('🎯 Emotional systems calibrated successfully');

    } catch (error) {
    // Logger fallback - ignore error
  }}

  /**
   * Chargement des patterns émotionnels
   */
  async loadEmotionalPatterns() {
    // Patterns de reconnaissance textuelle
    this.emotionRecognition.textPatterns.set('joy', [
      /heureux|joie|content|ravi|excité/
      /génial|super|fantastique|merveilleux/
      /sourire|rire|amusant|drôle/
    ]);

    this.emotionRecognition.textPatterns.set(STR_SADNESS, [
      /triste|déprimé|mélancolique|chagrin/
      /pleure|larmes|désespoir|sombre/
      /seul|isolé|abandonné|vide/
    ]);

    // Patterns contextuels
    this.emotionRecognition.contextClues.set('stress', [
      'deadline', 'pressure', 'overwhelmed', 'busy'
    ]);

    this.emotionRecognition.contextClues.set('celebration', [
      'achievement', 'success', 'milestone', 'victory'
    ]);

    try {
      logger.info('📊 Emotional patterns loaded successfully');

    } catch (error) {
    // Logger fallback - ignore error
  }}

  /**
   * Helpers pour détection de nuances
   */
  detectSarcasm(message) {
    return /vraiment|oh là là|c'est sûr|évidemment/.test(message.toLowerCase());
  }

  detectVulnerability(message) {
    return /j'ai peur|je ne sais pas|aide-moi|je suis perdu/.test(message.toLowerCase());
  }

  detectHope(message) {
    return /espère|peut-être|bientôt|va mieux|améliorer/.test(message.toLowerCase());
  }

  detectConfusion(message) {
    return /comprends pas|confus|pourquoi|comment|qu'est-ce que/.test(message.toLowerCase());
  }

  /**
   * Calculs utilitaires
   */
  determineDominantEmotion(emotions) {
    if (emotions.length === 0) return null;
    return emotions.reduce((prev, curr) =>
      (prev.confidence > curr.confidence) ? prev : curr
    );
  }

  calculateEmotionalIntensity(emotions) {
    if (emotions.length === 0) return 0;
    const totalIntensity = emotions.reduce((sum, emotion) => sum + emotion.confidence, 0);
    return Math.min(1.0, totalIntensity / emotions.length);
  }

  calculateEmpathyLevel(analysis) {
    let empathyLevel = 0.7; // Base empathy

    if (analysis.dominantEmotion) {
      const emotion = analysis.dominantEmotion.emotion;
      if ([STR_SADNESS, STR_FEAR, STR_ANGER].includes(emotion)) {
        empathyLevel = 0.95;
      } else if (['joy', 'surprise'].includes(emotion)) {
        empathyLevel = 0.8;
      }
    }

    return Math.min(1.0, empathyLevel * analysis.emotionalIntensity);
  }

  /**
   * Obtention du statut émotionnel
   */
  getEmotionalStatus() {
    return {
      initialized: this.isInitialized
      currentState: this.currentEmotionalState
      empathyLevel: this.emotionConfig.empathyLevel
      emotionalHistory: this.emotionalHistory.length
      recentEmotions: this.emotionalHistory.slice(-5)
      emotionalStability: this.calculateEmotionalStability()
    };
  }

  calculateEmotionalStability() {
    if (this.emotionalHistory.length < 5) return 0.9;

    const recent = this.emotionalHistory.slice(-10);
    const intensityVariation = this.calculateIntensityVariation(recent);
    return Math.max(0.3, 1.0 - intensityVariation);
  }

  calculateIntensityVariation(emotions) {
    if (emotions.length < 2) return 0;

    const intensities = emotions.map(e => e.emotionalIntensity);
    const mean = intensities.reduce((sum, i) => sum + i, 0) / intensities.length;
    const variance = intensities.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) / intensities.length;

    return Math.sqrt(variance);
  }

  /**
   * Détecte les émotions contextuelles
   */
  detectContextualEmotions(message, context = {}) {
    const emotions = [];

    // Détection simple basée sur le contexte
    if (context.userId) {
      emotions.push({ emotion: 'connected', intensity: 0.6 });
    }

    if (message.includes('merci') || message.includes('thank')) {
      emotions.push({ emotion: 'gratitude', intensity: 0.8 });
    }

    if (message.includes('triste') || message.includes('sad')) {
      emotions.push({ emotion: STR_SADNESS, intensity: 0.7 });
    }

    return emotions;
  }

  /**
   * Détecte l'émotion primaire d'un message
   */
  detectPrimaryEmotion(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('heureuxSTR_LOWERMESSAGE_INCLUDEScontentSTR_LOWERMESSAGE_INCLUDESjoie')) {
      return 'joy';
    }
    if (lowerMessage.includes('tristeSTR_LOWERMESSAGE_INCLUDESdéprimé')) {
      return STR_SADNESS;
    }
    if (lowerMessage.includes('en colèreSTR_LOWERMESSAGE_INCLUDESénervé')) {
      return STR_ANGER;
    }
    if (lowerMessage.includes('peurSTR_LOWERMESSAGE_INCLUDESinquiet')) {
      return STR_FEAR;
    }

    return 'neutral';
  }

  /**
   * Calcule l'intensité émotionnelle
   */
  calculateEmotionalIntensity(message) {
    const intensityMarkers = ['très', 'vraiment', 'extrêmement', 'beaucoup', 'énormément'];
    const lowerMessage = message.toLowerCase();

    let intensity = 0.5; // Base

    intensityMarkers.forEach(marker => {
      if (lowerMessage.includes(marker)) {
        intensity += 0.2;
      }
    });

    // Points d'exclamation augmentent l'intensité
    const exclamationCount = (message.match(/!/g) || []).length;
    intensity += exclamationCount * 0.1;

    return Math.min(1.0, intensity);
  }

  /**
   * Analyse le contexte émotionnel pour intégration avec MasterSystem
   */
  async analyzeEmotionalContext(message, context = {}) {
    try {
      // Analyse directe sans récursion
      const detectedEmotion = this.detectPrimaryEmotion(message);
      const emotionalIntensity = this.calculateEmotionalIntensity(message);

      return {
        recommendedTone: detectedEmotion || 'supportive'
        empathyLevel: this.emotionConfig.empathyLevel
        emotionalNeeds: [STR_UNDERSTANDING]
        responseStrategy: this.determineResponseStrategy({ detectedEmotion, emotionalIntensity })
        emotionalIntensity: emotionalIntensity || 0.5
      };
    } catch (error) {
      // Logger fallback - ignore error
    };
    }
  }

  /**
   * Détermine la stratégie de réponse émotionnelle
   */
  determineResponseStrategy(analysis) {
    const emotion = analysis.detectedEmotion || 'neutral';
    const intensity = analysis.emotionalIntensity || 0.5;

    if (intensity > 0.7) {
      if ([STR_SADNESS, STR_FEAR, 'anxiety'].includes(emotion)) {
        return 'intensive_support';
      } else if (['joy', 'excitement'].includes(emotion)) {
        return 'celebration';
      }
    }

    return 'balanced_empathy';
  }
}

export default new AlexEmotionalIntelligence();