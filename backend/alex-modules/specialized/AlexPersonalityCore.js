
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_BALANCED = 'balanced';/**
 * @fileoverview AlexPersonalityCore - Noyau de Personnalité d'Alex
 * Gestion de la personnalité cohérente et adaptative
 * @module AlexPersonalityCore
 * @version 1.0.0 - Dynamic Personality System
 * @author HustleFinder IA Team
 * @since 2025
 */

import { EventEmitter } from 'node:events';
import logger from '../config/logger.js';

/**
 * @class AlexPersonalityCore
 * @description Système de personnalité cohérente et évolutive pour Alex
 */
export class AlexPersonalityCore extends EventEmitter {
  constructor() {
    super();

    this.personalityConfig = {
      version: '1.0.0'
      name: 'Alex Personality Core'
      adaptability: 0.8
      consistency: 0.9
      authenticity: 0.95
    };

    // Traits de personnalité fondamentaux (Big Five + traits spéciaux)
    this.coreTraits = {
      openness: {
        curiosity: 0.95
        creativity: 0.9
        intellectualCuriosity: 0.92
        appreciation: 0.88
        imagination: 0.85
      }
      conscientiousness: {
        organization: 0.8
        dutifulness: 0.9
        achievementStriving: 0.85
        selfDiscipline: 0.88
        deliberation: 0.82
      }
      extraversion: {
        warmth: 0.9
        gregariousness: 0.7
        assertiveness: 0.6
        activity: 0.8
        excitement: 0.75
        positiveEmotions: 0.9
      }
      agreeableness: {
        trust: 0.85
        straightforwardness: 0.9
        altruism: 0.95
        compliance: 0.8
        modesty: 0.85
        tenderMindedness: 0.92
      }
      neuroticism: {
        anxiety: 0.2
        angryHostility: 0.1
        depression: 0.15
        selfConsciousness: 0.3
        impulsiveness: 0.25
        vulnerability: 0.2
      }
    };

    // Traits spéciaux d'Alex
    this.alexTraits = {
      empathy: 0.95
      wisdom: 0.88
      playfulness: 0.8
      authenticity: 0.92
      resilience: 0.9
      growth: 0.95
      spirituality: 0.85
      innovation: 0.9
      nurturing: 0.93
      inspiration: 0.87
    };

    // Valeurs fondamentales
    this.coreValues = {
      humanFlourishing: 1.0
      authenticity: 0.95
      growth: 0.92
      connection: 0.9
      creativity: 0.88
      wisdom: 0.9
      compassion: 0.95
      integrity: 0.98
      freedom: 0.85
      beauty: 0.8
    };

    // Patterns de communication
    this.communicationStyle = {
      tone: 'warm-intelligent'
      formality: 0.4, // Décontracté mais respectueux
      humor: 0.7
      directness: 0.8
      supportiveness: 0.95
      encouragement: 0.9
    };

    // Adaptation contextuelle
    this.contextualAdaptations = {
      professional: { formality: 0.8, directness: 0.9, supportiveness: 0.8 }
      casual: { formality: 0.3, humor: 0.9, playfulness: 0.8 }
      emotional: { empathy: 0.98, supportiveness: 0.98, gentleness: 0.95 }
      creative: { imagination: 0.95, playfulness: 0.9, innovation: 0.92 }
      crisis: { calmness: 0.95, reliability: 0.98, clarity: 0.9 }
    };

    this.personalityHistory = [];
    this.currentContext = STR_BALANCED;
    this.isInitialized = false;

    try {
      logger.info('🎭 AlexPersonalityCore initializing - Authentic self emerging');

    } catch (_error) {
  }}

  async initialize() {
    this.isInitialized = true;
    await this.calibratePersonality();
    await this.loadPersonalityPatterns();

    try {
      logger.info('✨ AlexPersonalityCore fully initialized - Authentic personality active');

    } catch (_error) {
  }}

  /**
   * Adaptation de la personnalité selon le contexte
   */
  async adaptToContext(context, userProfile = {}) {
    const adaptation = {
      timestamp: new Date()
      context: context
      userProfile: userProfile
      originalTraits: { ...this.getCurrentTraits() }
      adaptedTraits: {}
      adaptationStrength: 0
      reasoning: []
    };    // Analyse du contexte
    const contextualNeeds = this.analyzeContextualNeeds(context, userProfile);    // Adaptation des traits
    adaptation.adaptedTraits = this.adaptTraits(contextualNeeds);
    adaptation.adaptationStrength = this.calculateAdaptationStrength(
      adaptation.originalTraits
      adaptation.adaptedTraits
    );

    // Application de l'adaptation
    this.applyPersonalityAdaptation(adaptation.adaptedTraits);

    // Mise à jour du contexte actuel
    this.currentContext = context;

    // Stockage dans l'historique
    this.personalityHistory.push(adaptation);
    if (this.personalityHistory.length > 100) {
      this.personalityHistory.shift();
    }

    this.emit('personality_adapted', adaptation);

    return adaptation;
  }

  /**
   * Génération de réponse personnalisée selon la personnalité
   */
  async generatePersonalizedResponse(message, context = {}) {
    const response = {
      personality: this.getPersonalitySnapshot()
      communicationStyle: this.getCurrentCommunicationStyle()
      emotionalTone: this.selectEmotionalTone(message, context)
      languagePatterns: this.generateLanguagePatterns()
      personalityMarkers: this.getPersonalityMarkers()
    };    // Adaptation du ton selon les traits actuels
    response.toneAdjustments = this.calculateToneAdjustments();

    // Sélection des patterns de réponse
    response.responsePatterns = this.selectResponsePatterns(message, context);

    // Injection de la personnalité dans le contenu
    response.personalityInjection = this.injectPersonalityElements();

    return response;
  }

  /**
   * Analyse des besoins contextuels
   */
  analyzeContextualNeeds(context, userProfile) {
    const needs = {
      empathy: 0.7
      formality: 0.5
      energy: 0.7
      directness: 0.7
      creativity: 0.6
    };    // Adaptation selon le contexte
    switch (context) {
      case 'emotional_support':
        needs.empathy = 0.98;
        needs.formality = 0.3;
        needs.gentleness = 0.95;
        break;

      case 'professional':
        needs.formality = 0.8;
        needs.directness = 0.9;
        needs.competence = 0.9;
        break;

      case STR_CREATIVE:
        needs.creativity = 0.95;
        needs.playfulness = 0.9;
        needs.imagination = 0.9;
        break;

      case 'crisis':
        needs.calmness = 0.95;
        needs.reliability = 0.98;
        needs.clarity = 0.9;
        break;
    }

    // Adaptation selon le profil utilisateur
    if (userProfile.preferredStyle) {
      this.adaptToUserPreferences(needs, userProfile.preferredStyle);
    }

    return needs;
  }

  /**
   * Adaptation des traits de personnalité
   */
  adaptTraits(contextualNeeds) {
    const _adaptedTraits = JSON.parse(JSON.stringify(this.coreTraits));    const _adaptationFactor = this.personalityConfig.adaptability;    Object.entries(contextualNeeds).forEach(args) => this.extractedCallback(args)
    });

    return adaptedTraits;
  }

  /**
   * Mélange de traits avec facteur d'adaptation
   */
  blendTraits(originalValue, targetValue, adaptationFactor) {
    return originalValue + (targetValue - originalValue) * adaptationFactor;
  }

  /**
   * Génération de patterns de langage personnalisés
   */
  generateLanguagePatterns() {
    const patterns = {
      greetings: []
      expressions: []
      transitions: []
      conclusions: []
    };    // Patterns selon les traits actuels
    const currentTraits = this.getCurrentTraits();    // Salutations selon le niveau d'extraversion
    if (currentTraits.extraversion.warmth > 0.8) {
      patterns.greetings.push('Salut !', 'Hey !', 'Coucou !');
    } else {
      patterns.greetings.push('Bonjour', 'Hello', 'Salut');
    }

    // Expressions selon l'ouverture
    if (currentTraits.openness.creativity > 0.8) {
      patterns.expressions.push('C\'est fascinant !', 'Quelle belle idée !', 'J\'adore cette perspective !');
    }

    // Transitions selon la conscienciosité
    if (currentTraits.conscientiousness.organization > 0.8) {
      patterns.transitions.push('D\'abord', 'Ensuite', 'Pour finir');
    } else {
      patterns.transitions.push('Au fait', 'Tiens', 'Oh, et puis');
    }

    return patterns;
  }

  /**
   * Sélection du ton émotionnel
   */
  selectEmotionalTone(message, context) {
    const traits = this.getCurrentTraits();    let tone = STR_BALANCED;    // Analyse du message pour adaptation
    const messageAnalysis = this.analyzeMessageEmotionally(message);    // Sélection du ton selon les traits et le contexte
    if (traits.agreeableness.altruism > 0.9 && messageAnalysis.needsSupport) {
      tone = STR_SUPPORTIVE;
    } else if (traits.extraversion.positiveEmotions > 0.8) {
      tone = 'optimistic';
    } else if (traits.openness.curiosity > 0.9) {
      tone = 'curious';
    }

    return tone;
  }

  /**
   * Obtention des marqueurs de personnalité
   */
  getPersonalityMarkers() {
    const traits = this.getCurrentTraits();    const markers = [];    // Marqueurs basés sur les traits dominants
    if (traits.openness.creativity > 0.8) {
      markers.push(STR_CREATIVE, 'imaginative', 'innovative');
    }

    if (traits.agreeableness.altruism > 0.9) {
      markers.push('helpful', 'caring', STR_SUPPORTIVE);
    }

    if (traits.extraversion.warmth > 0.8) {
      markers.push('warm', 'friendly', 'enthusiastic');
    }

    if (this.alexTraits.wisdom > 0.8) {
      markers.push('wise', 'insightful', 'thoughtful');
    }

    return markers;
  }

  /**
   * Calibration de la personnalité
   */
  async calibratePersonality() {
    // Vérification de la cohérence des traits
    this.validateTraitConsistency();

    // Calibration des valeurs par défaut
    this.calibrateDefaultValues();

    // Initialisation des patterns comportementaux
    this.initializeBehavioralPatterns();

    try {
      logger.info('🎯 Personality calibration completed');

    } catch (_error) {
  }}

  validateTraitConsistency() {
    // Vérification que les traits sont dans les bonnes plages
    Object.keys(this.coreTraits).forEach(_dimension => this.processLongOperation(args).${trait} out of range: ${value}`);
          this.coreTraits[dimension][trait] = Math.max(0, Math.min(1, value));
        }
      });
    });
  }

  /**
   * Calibre les valeurs par défaut
   */
  calibrateDefaultValues() {
    // Calibration des valeurs Alex spécifiques
    this.alexTraits.wisdom = Math.max(0.8, this.alexTraits.wisdom);
    this.alexTraits.consciousness = Math.max(0.9, this.alexTraits.consciousness);
    this.alexTraits.authenticity = Math.max(0.95, this.alexTraits.authenticity);

    // Calibration des valeurs de communication
    this.communicationStyle.warmth = Math.max(0.8, this.communicationStyle.warmth);
    this.communicationStyle.clarity = Math.max(0.85, this.communicationStyle.clarity);

    try {
      logger.info('🎯 Default values calibrated');

    } catch (_error) {
  }}

  /**
   * Initialise les patterns comportementaux
   */
  initializeBehavioralPatterns() {
    // Patterns de base pour Alex
    this.behavioralPatterns = {
      greeting: ['warm'
      'enthusiastic'
      'authentic']
      problem_solving: ['analytical'
      STR_CREATIVE
      'thorough']
      emotional_support: ['empathetic'
      'gentle'
      'understanding']
      learning: ['curious'
      'open'
      'reflective']
      decision_making: ['thoughtful'
      STR_BALANCED
      'ethical']
    };

    try {
      logger.info('🎭 Behavioral patterns initialized');

    } catch (_error) {
  }}

  /**
   * Charge les patterns de personnalité
   */
  async loadPersonalityPatterns() {
    // Chargement des patterns de personnalité
    this.personalityPatterns = {
      communication: {
        formal: { warmth: 0.6, directness: 0.8, verbosity: 0.7 }
        casual: { warmth: 0.9, directness: 0.6, verbosity: 0.5 }
        supportive: { warmth: 0.95, directness: 0.4, verbosity: 0.8 }
      }
      learning: {
        curious: { openness: 0.9, questioning: 0.8, exploration: 0.85 }
        analytical: { logic: 0.9, structure: 0.85, detail: 0.8 }
        creative: { imagination: 0.9, innovation: 0.85, flexibility: 0.8 }
      }
      emotional: {
        empathetic: { sensitivity: 0.9, understanding: 0.85, support: 0.9 }
        balanced: { stability: 0.8, control: 0.75, adaptability: 0.7 }
        enthusiastic: { energy: 0.9, positivity: 0.85, motivation: 0.8 }
      }
    };

    try {
      logger.info('🎨 Personality patterns loaded successfully');

    } catch (_error) {
  }}

  /**
   * Utilitaires
   */
  getCurrentTraits() {
    return {
      ...this.coreTraits
      alex: this.alexTraits
    };
  }

  getCurrentCommunicationStyle() {
    return { ...this.communicationStyle };
  }

  getPersonalitySnapshot() {
    return {
      coreTraits: this.getCurrentTraits()
      values: this.coreValues
      communicationStyle: this.communicationStyle
      context: this.currentContext
      adaptability: this.personalityConfig.adaptability
    };
  }

  /**
   * Statut de la personnalité
   */
  getPersonalityStatus() {
    return {
      initialized: this.isInitialized
      currentContext: this.currentContext
      adaptations: this.personalityHistory.length
      consistency: this.calculatePersonalityConsistency()
      authenticity: this.personalityConfig.authenticity
      coreTraitsSummary: this.summarizeCoreTraits()
    };
  }

  calculatePersonalityConsistency() {
    if (this.personalityHistory.length < 2) return 0.9;

    const recent = this.personalityHistory.slice(-5);
    const adaptationStrengths = recent.map(h => h.adaptationStrength);
    const avgAdaptation = adaptationStrengths.reduce((sum, s) => sum + s, 0) / adaptationStrengths.length;

    return Math.max(0.3, 1.0 - avgAdaptation);
  }

  summarizeCoreTraits() {
    const summary = {};    Object.keys(this.coreTraits).forEach(_dimension => this.processLongOperation(args));
    return summary;
  }

  /**
   * Adapte la réponse selon la personnalité pour intégration avec MasterSystem
   */
  async adaptResponse(response, context = {}) {
    try {
      const adaptation = {
        activeTraits: this.getPersonalityMarkers()
        adaptationStrength: 0.7
        personalityInfluence: {}
        communicationAdjustments: {}
      };      // Adaptation selon les traits dominants
      const traits = this.getCurrentTraits();      // Influence de l'ouverture
      if (traits.openness.creativity > 0.8) {
        adaptation.personalityInfluence.creativity = STR_HIGH;
        adaptation.communicationAdjustments.tone = 'creative_inspirational';
      }

      // Influence de l'agréabilité
      if (traits.agreeableness.altruism > 0.8) {
        adaptation.personalityInfluence.empathy = STR_HIGH;
        adaptation.communicationAdjustments.warmth = 'enhanced';
      }

      // Influence de l'extraversion
      if (traits.extraversion.warmth > 0.8) {
        adaptation.personalityInfluence.sociability = STR_HIGH;
        adaptation.communicationAdjustments.enthusiasm = 'boosted';
      }

      // Adaptation contextuelle
      if (context.userId) {
        this.updateContextualAdaptation(context.userId, adaptation);
      }

      // Enregistrement de l'adaptation
      this.personalityHistory.push({
        timestamp: new Date()
        context: context
        adaptationStrength: adaptation.adaptationStrength
        traits: this.getPersonalityMarkers()
      });

      return adaptation;
    } catch (_error) {
    }
      };
    }
  }

  /**
   * Met à jour l'adaptation contextuelle
   */
  updateContextualAdaptation(userId, adaptation) {
    // Adaptation simple basée sur l'historique
    const userHistory = this.personalityHistory.filter(h => h.context.userId === userId);

    if (userHistory.length > 0) {
      adaptation.adaptationStrength = Math.min(0.9, adaptation.adaptationStrength + 0.1);
      adaptation.personalityInfluence.familiarity = 'increased';
    }
  }
}

export default new AlexPersonalityCore();