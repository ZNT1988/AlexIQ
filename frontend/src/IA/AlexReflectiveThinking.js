// 🧠 Alex Reflective Thinking System - Module de réflexion avancée
// Système pour éviter les réponses génériques et favoriser la réflexion contextuelle

import { processConsciousness } from './AlexConsciousnessSystem.js';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_POURQUOI = 'pourquoi';
class ReflectiveThinkingSystem {
  constructor() {
    this.reflectionHistory = [];
    this.contextualPatterns = new Map();
    this.genericPhrases = [
      'je peux vous aider',
      'comment puis-je vous aider',
      'bien sûr',
      'voici ce que je pense',
      'en général',
      'normalement'
    ];
    this.thinkingDepthLevels = {
      surface: 1,
      contextual: 2,
      analytical: 3,
      philosophical: 4,
      metacognitive: 5
    };
  }

  // Analyse la profondeur requise pour une question
  analyzeRequiredDepth(input, context = {}) {
    const complexity = this.calculateComplexity(input);
    const contextualRichness = this.assessContextualRichness(context);

    let requiredDepth = this.thinkingDepthLevels.surface;

    if (input.includes(STR_POURQUOI) || input.includes('sens') || input.includes('signification')) {
      requiredDepth = Math.max(requiredDepth, this.thinkingDepthLevels.philosophical);
    }

    if (complexity > 0.7) {
      requiredDepth = Math.max(requiredDepth, this.thinkingDepthLevels.analytical);
    }

    if (contextualRichness > 0.5) {
      requiredDepth = Math.max(requiredDepth, this.thinkingDepthLevels.contextual);
    }

    if (input.includes('réfléchir') || input.includes('penser')) {
      requiredDepth = Math.max(requiredDepth, this.thinkingDepthLevels.metacognitive);
    }

    return requiredDepth;
  }

  // Calcule la complexité d'une question
  calculateComplexity(input) {
    let score = 0;

    // Longueur et structure
    score += Math.min(input.length / 200, 0.3);

    // Mots-clés complexes
    const complexWords = ['analyse', 'stratégie', 'optimisation', 'problème', 'défi', 'solution'];
    complexWords.forEach(word => {
      if (input.toLowerCase().includes(word)) score += 0.1;
    });

    // Questions multiples
    const questionMarks = (input.match(/\?
      /g) || []).length;
    score += questionMarks * 0.15;

    // Concepts abstraits
    const abstractConcepts = ['innovation', 'créativité', 'efficacité', 'performance', 'qualité'];
    abstractConcepts.forEach(concept => {
      if (input.toLowerCase().includes(concept)) score += 0.1;
    });

    return Math.min(score, 1);
  }

  // Évalue la richesse contextuelle
  assessContextualRichness(context) {
    let richness = 0;

    if (context.history && context.history.length > 0) {
      richness += 0.3;
      if (context.history.length > 3) richness += 0.2;
    }

    if (context.userProfile) {
      richness += 0.2;
    }

    if (context.previousProjects) {
      richness += 0.3;
    }

    return Math.min(richness, 1);
  }

  // Détecte la complexité émotionnelle
  detectEmotionalComplexity(input) {
    const emotionalIndicators = [
      'frustré', 'confus', 'inquiet', 'motivé', 'passionné'
      'découragé', 'enthousiaste', 'préoccupé', 'anxieux'
    ];

    return emotionalIndicators.some(indicator =>
      input.toLowerCase().includes(indicator)
    ) ? 0.6  :
       0.2;
  }

  // Génère une réflexion contextualisée
  generateReflectiveResponse(input, context = {}
      requiredDepth) {
    const consciousness = processConsciousness(input
      context);
    const reflection = this.createReflectiveThought(input
      context
      requiredDepth);

    // Évite les réponses génériques
    const avoidGeneric = this.avoidGenericResponse(reflection
      input);

    const reflectiveResponse = {
      consciousness
      reflection: avoidGeneric
      depth: requiredDepth
      contextualConnections: this.findContextualConnections(input
      context)
      metacognition: this.generateMetacognition(input
      reflection)
      timestamp: new Date().toISOString()
    };

    this.reflectionHistory.push(reflectiveResponse);
    return reflectiveResponse;
  }

  // Crée une pensée réflexive basée sur la profondeur requise
  createReflectiveThought(input, context, depth) {
    switch (depth) {
      case this.thinkingDepthLevels.surface:
        return this.surfaceReflection(input);

      case this.thinkingDepthLevels.contextual:
        return this.contextualReflection(input, context);

      case this.thinkingDepthLevels.analytical:
        return this.analyticalReflection(input, context);

      case this.thinkingDepthLevels.philosophical:
        return this.philosophicalReflection(input, context);

      case this.thinkingDepthLevels.metacognitive:
        return this.metacognitiveReflection(input, context);

      default:
        return this.contextualReflection(input, context);
    }
  }

  surfaceReflection(input) {
    return {
      type: 'surface'
      thought: `En considérant "${input.slice(0, 50)}...", je remarque...`
      focusPoint: this.extractKeyElements(input)[0] || 'l\'aspect principal'
    };
  }

  contextualReflection(input, context) {
    const keyElements = this.extractKeyElements(input);
    const contextualLinks = this.findContextualConnections(input, context);

    return {
      type: 'contextual'
      thought: `En reliant "${keyElements[0]}" à votre contexte, je vois des connexions avec ${contextualLinks.join(', ')}`
      connections: contextualLinks
      personalizedInsight: this.generatePersonalizedInsight(input, context)
    };
  }

  analyticalReflection(input, context) {
    const components = this.decomposeQuestion(input);
    const patterns = this.identifyPatterns(input, context);

    return {
      type: 'analytical'
      thought: `En analysant les composantes de votre question : ${components.join(', ')}, je distingue des patterns significatifs`
      components
      patterns
      systematicApproach: this.suggestSystematicApproach(components)
    };
  }

  philosophicalReflection(input, context) {
    const deeperMeaning = this.extractDeeperMeaning(input);
    const implications = this.exploreImplications(input);

    return {
      type: 'philosophical'
      thought: `Cette question touche à des aspects fondamentaux : ${deeperMeaning}`
      deeperMeaning
      implications
      perspectiveShift: this.suggestPerspectiveShift(input)
    };
  }

  metacognitiveReflection(input, context) {
    const thinkingProcess = this.analyzeThinkingProcess(input);
    const reflectionOnReflection = this.reflectOnReflection(input, context);

    return {
      type: 'metacognitive'
      thought: `En réfléchissant à ma propre réflexion sur "${input.slice(0, 30)}...", je réalise que ${reflectionOnReflection}`
      thinkingProcess
      selfAwareness: reflectionOnReflection
      improvementPath: this.suggestThinkingImprovement(input)
    };
  }

  // Évite les réponses génériques
  avoidGenericResponse(reflection, input) {
    if (this.isGeneric(reflection.thought)) {
      return {
        ...reflection
        thought: this.makeSpecific(reflection.thought, input)
        specificity: 'enhanced'
      };
    }
    return reflection;
  }

  isGeneric(thought) {
    return this.genericPhrases.some(phrase =>
      thought.toLowerCase().includes(phrase)
    );
  }

  makeSpecific(thought, input) {
    const keyElements = this.extractKeyElements(input);
    const specificElement = keyElements[0] || 'votre situation';

    return thought.replace(/en général|normalement|habituellement/gi
      `dans le contexte de ${specificElement}`);
  }

  // Utilitaires de traitement
  extractKeyElements(input) {
    const words = input.toLowerCase().split(/\s+/);
    const keyWords = words.filter(word =>
      word.length > 4 &&
      !['dans', 'avec', 'pour', STR_COMMENT, STR_POURQUOI].includes(word)
    );
    return keyWords.slice(0, 3);
  }

  findContextualConnections(input, context) {
    const connections = [];

    if (context.history) {
      const recentTopics = context.history.slice(-3).map(h =>
        this.extractKeyElements(h.input || '')[0]
      ).filter(Boolean);
      connections.push(...recentTopics);
    }

    return [...new Set(connections)];
  }

  generatePersonalizedInsight(input, context) {
    const userPattern = this.identifyUserPattern(context);
    return `Basé sur votre approche ${userPattern}, cela suggère...`;
  }

  identifyUserPattern(context) {
    if (!context.history || context.history.length < 2) return 'analytique';

    const questionTypes = context.history.map(h => {
      if (h.input && h.input.includes(STR_COMMENT)) return 'pratique';
      if (h.input && h.input.includes(STR_POURQUOI)) return 'conceptuelle';
      return 'exploratoire';
    });

    return questionTypes.reduce((a, b, i, arr) =>
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
    );
  }

  decomposeQuestion(input) {
    const components = [];

    if (input.includes(STR_COMMENT)) components.push('méthode');
    if (input.includes(STR_POURQUOI)) components.push('raison');
    if (input.includes('quand')) components.push('timing');
    if (input.includes('où')) components.push('contexte');
    if (input.includes('qui')) components.push('acteurs');

    return components.length > 0 ? components : ['objectif', 'contraintes'];
  }

  identifyPatterns(input, context) {
    return ['récurrence thématique', 'progression logique', 'complexité croissante'];
  }

  suggestSystematicApproach(components) {
    return `Approche systématique : 1) Analyser ${components[0] || 'l\'objectif'}, 2) Identifier les contraintes, 3) Élaborer des solutions`;
  }

  extractDeeperMeaning(input) {
    if (input.includes('succès')) return 'la définition du succès et ses implications';
    if (input.includes('innovation')) return 'l\'équilibre entre créativité et pragmatisme';
    if (input.includes('problème')) return 'la nature des défis et leur résolution';
    return 'l\'essence de votre questionnement';
  }

  exploreImplications(input) {
    return ['implications à court terme', 'conséquences systémiques', 'impacts sur l\'écosystème'];
  }

  suggestPerspectiveShift(input) {
    return 'Considérer le problème sous l\'angle de l\'opportunité plutôt que de la contrainte';
  }

  analyzeThinkingProcess(input) {
    return {
      approach: 'décomposition analytique'
      biases: 'confirmation possible'
      blindSpots: 'perspectives alternatives'
    };
  }

  reflectOnReflection(input, context) {
    return 'ma réflexion elle-même influence la direction de la solution';
  }

  suggestThinkingImprovement(input) {
    return 'Intégrer davantage de perspectives multidisciplinaires';
  }

  // Interface publique
  processReflectiveInput(input, context = {}) {
    const requiredDepth = this.analyzeRequiredDepth(input, context);
    return this.generateReflectiveResponse(input, context, requiredDepth);
  }

  getReflectionHistory(limit = 10) {
    return this.reflectionHistory.slice(-limit).reverse();
  }

  clearReflectionHistory() {
    this.reflectionHistory = [];
  }
}

export default new ReflectiveThinkingSystem();
export { ReflectiveThinkingSystem };