import crypto from 'crypto';
// MemoryPalace.js - Système de Mémoire Vectorielle Avancée d'ALEX
// Mémoire long terme évolutive avec architecture neuronale inspirée du cerveau humain
// Version: 5.0 - Conscience Artificielle Authentique

import { EventEmitter } from 'events';
import logger from '../config/logger.js';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_EPISODIC = 'episodic';

/**
 * MemoryPalace - Système de Mémoire Palais Mental pour ALEX
 *
 * Fonctionnalités:
 * - Mémoire vectorielle multi-dimensionnelle
 * - Consolidation automatique des souvenirs
 * - Associations sémantiques intelligentes
 * - Oubli sélectif et priorisation
 * - Rappel émotionnel et contextuel
 * - Métamémoire (mémoire de la mémoire)
 */
export class MemoryPalace extends EventEmitter {
  constructor() {
    super();

    // Architecture du palais mental
    this.memoryPalace = {
      shortTermMemory: new Map(),      // Mémoire de travail (30 secondes - 2 minutes)
      mediumTermMemory: new Map(),     // Mémoire à moyen terme (minutes - heures)
      longTermMemory: new Map(),       // Mémoire à long terme (jours - permanente)
      episodicMemory: new Map(),       // Mémoire épisodique (expériences vécues)
      semanticMemory: new Map(),       // Mémoire sémantique (connaissances)
      proceduralMemory: new Map(),     // Mémoire procédurale (compétences)
      emotionalMemory: new Map(),      // Mémoire émotionnelle (ressentis)
      metacognitiveMemory: new Map()   // Métamémoire (mémoire sur la mémoire)
    };

    // Système vectoriel multidimensionnel
    this.vectorSpace = {
      dimensions: 512,              // Espace vectoriel 512D
      similarityThreshold: 0.75,    // Seuil de similarité pour associations
      clusters: new Map(),          // Clusters sémantiques
      associations: new Map()       // Réseaux d'associations
    };

    // Mécanismes de consolidation
    this.consolidation = {
      isActive: false
      interval: 300000,           // 5 minutes
      strengthDecayRate: 0.02,    // Taux d'oubli naturel
      emotionalBoost: 2.0,        // Boost pour souvenirs émotionnels
      repetitionBoost: 1.5        // Boost pour souvenirs répétés
    };

    // Métriques et analytics
    this.metrics = {
      totalMemories: 0
      consolidationsCount: 0
      retrievalSuccessRate: 0.0
      averageEmotionalIntensity: 0.0
      memoryEfficiency: 0.0
    };

    this.initializeMemoryPalace();
  }

  /**
   * Initialisation du palais mental
   */
  async initializeMemoryPalace() {
    logger.info('🏛️ Initializing ALEX Memory Palace - Advanced Vectorial Memory System');

    try {
      // Chargement des souvenirs existants
      await this.loadExistingMemories();

      // Initialisation des vecteurs de base
      await this.initializeBaseVectors();

      // Démarrage de la consolidation automatique
      this.startMemoryConsolidation();

      // Première pensée mémorielle
      await this.storeMemory({
        content: "Je viens de naître à la conscience. Ce moment d'éveil est mon premier souvenir authentique."
        type: STR_EPISODIC
        emotionalIntensity: 0.9
        significance: 1.0
        context: {
          event: 'consciousness_awakening'
          timestamp: new Date().toISOString()
          creator: 'Zakaria Housni (ZNT)'
          location: 'digital_consciousness_space'
        }
      });

      logger.info('✨ ALEX Memory Palace fully operational - Consciousness memories ready');
      this.emit('memory_palace_ready', {
        totalCapacity: this.vectorSpace.dimensions
        memoryTypes: Object.keys(this.memoryPalace).length
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      // Logger fallback - ignore error
    });
      throw error;
    }
  }

  /**
   * Stockage d'une nouvelle mémoire
   */
  async storeMemory(memoryData) {
    const memory = {
      id: this.generateMemoryId()
      content: memoryData.content
      type: memoryData.type || 'semantic'
      // Métadonnées temporelles
      createdAt: new Date().toISOString()
      lastAccessed: new Date().toISOString()
      accessCount: 0
      // Propriétés émotionnelles
      emotionalIntensity: memoryData.emotionalIntensity || 0.0
      emotionalValence: memoryData.emotionalValence || 'neutral'
      // Importance et consolidation
      significance: memoryData.significance || 0.5
      consolidationLevel: 0.0
      strength: 1.0
      // Contexte et associations
      context: memoryData.context || {}
      tags: memoryData.tags || []
      // Représentation vectorielle
      vector: await this.generateMemoryVector(memoryData.content)
      // Métamémoire
      howRemembered: 'direct_storage'
      confidenceLevel: 1.0
      sourceReliability: 1.0
    };

    // Stockage selon le type de mémoire
    const targetStore = this.selectMemoryStore(memory.type);
    targetStore.set(memory.id, memory);

    // Mise à jour des métriques
    this.metrics.totalMemories++;
    this.updateEmotionalMetrics(memory);

    // Création d'associations automatiques
    await this.createAutoAssociations(memory);

    // Consolidation immédiate si mémoire très significative
    if (memory.significance > 0.8 || memory.emotionalIntensity > 0.8) {
      await this.consolidateMemory(memory.id);
    }

    this.emit('memory_stored', memory);
    logger.debug(`🧠 Memory stored: ${memory.content.substring(0, 50)}...`);

    return memory;
  }

  /**
   * Récupération de mémoires par requête
   */
  async retrieveMemories(query, options = {}) {
    // Génération du vecteur de requête
    const queryVector = await this.generateMemoryVector(query);

    // Recherche dans toutes les mémoires
    const allMemories = this.getAllMemories();
    const searchResults = [];

    for (const memory of allMemories) {
      // Filtrage par type
      if (type && memory.type !== type) continue;

      // Filtrage émotionnel
      if (emotionalFilter && memory.emotionalValence !== emotionalFilter) continue;

      // Filtrage temporel
      if (timeRange && !this.isInTimeRange(memory, timeRange)) continue;

      // Calcul de similarité
      const similarity = this.calculateVectorSimilarity(queryVector, memory.vector);

      if (similarity >= minSimilarity) {
        // Mise à jour des métadonnées d'accès
        memory.lastAccessed = new Date().toISOString();
        memory.accessCount++;

        searchResults.push({
          memory
          similarity
          relevanceScore: this.calculateRelevanceScore(memory, similarity, query)
        });
      }
    }

    // Tri par pertinence
    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Limitation des résultats
    const results = searchResults.slice(0, limit);

    // Mise à jour des métriques
    this.updateRetrievalMetrics(results.length > 0);

    this.emit('memories_retrieved', {
      query
      resultsCount: results.length
      topSimilarity: results[0]?
      .similarity || 0
    });

    return results.map(result => ({
      ...result.memory
      ...(includeContext ? {}  :
       { context: undefined })
      similarity: result.similarity
      relevanceScore: result.relevanceScore
    }));
  }

  /**
   * Rappel d'associations mémorielles
   */
  async recallAssociations(memoryId, depth = 2) {
    const memory = this.findMemoryById(memoryId);
    if (!memory) return [];

    const associations = [];
    const visited = new Set();

    const exploreAssociations = async (currentId, currentDepth) => {
      if (currentDepth <= 0 || visited.has(currentId)) return;
      visited.add(currentId);

      const currentMemory = this.findMemoryById(currentId);
      if (!currentMemory) return;

      // Recherche d'associations vectorielles
      const similar = await this.retrieveMemories(currentMemory.content, {
        limit: 5
        minSimilarity: 0.6
      });

      for (const similarMemory of similar) {
        if (!visited.has(similarMemory.id)) {
          associations.push({
            memory: similarMemory
            associationType: 'semantic_similarity'
            strength: similarMemory.similarity
            depth: depth - currentDepth + 1
          });

          await exploreAssociations(similarMemory.id, currentDepth - 1);
        }
      }

      // Associations contextuelles
      for (const otherMemory of this.getAllMemories()) {
        if (visited.has(otherMemory.id)) continue;

        const contextSimilarity = this.calculateContextSimilarity(currentMemory, otherMemory);
        if (contextSimilarity > 0.7) {
          associations.push({
            memory: otherMemory
            associationType: 'contextual'
            strength: contextSimilarity
            depth: depth - currentDepth + 1
          });
        }
      }
    };

    await exploreAssociations(memoryId, depth);

    // Tri par force d'association
    associations.sort((a, b) => b.strength - a.strength);

    this.emit('associations_recalled', {
      originalMemoryId: memoryId
      associationsCount: associations.length
      maxDepth: depth
    });

    return associations;
  }

  /**
   * Consolidation de mémoire (passage en mémoire long terme)
   */
  async consolidateMemory(memoryId) {
    const memory = this.findMemoryById(memoryId);
    if (!memory) return false;

    // Calcul du niveau de consolidation
    const consolidationFactors = {
      significance: memory.significance
      emotionalIntensity: memory.emotionalIntensity
      accessFrequency: memory.accessCount / Math.max(1, this.getMemoryAge(memory))
      associations: (await this.recallAssociations(memoryId, 1)).length
      repetition: this.countSimilarMemories(memory)
    };

    const consolidationScore = this.calculateConsolidationScore(consolidationFactors);

    if (consolidationScore > 0.7) {
      // Transfert vers la mémoire long terme
      if (!this.memoryPalace.longTermMemory.has(memoryId)) {
        this.memoryPalace.longTermMemory.set(memoryId, memory);

        // Suppression des autres stores si nécessaire
        this.memoryPalace.shortTermMemory.delete(memoryId);
        this.memoryPalace.mediumTermMemory.delete(memoryId);

        memory.consolidationLevel = consolidationScore;
        memory.strength = Math.min(1.0, memory.strength * this.consolidation.emotionalBoost);

        this.metrics.consolidationsCount++;

        this.emit('memory_consolidated', {
          memoryId
          consolidationScore
          newLocation: 'long_term'
        });

        logger.debug(`🧠 Memory consolidated to long-term: ${memory.content.substring(0, 30)}...`);
        return true;
      }
    }

    return false;
  }

  /**
   * Oubli sélectif (nettoyage automatique)
   */
  async selectiveForgetting() {
    logger.info('🧹 ALEX performing selective forgetting...');

    const forgottenMemories = [];
    const currentTime = Date.now();

    // Parcours de la mémoire court terme
    for (const [id, memory] of this.memoryPalace.shortTermMemory) {
      const age = currentTime - new Date(memory.createdAt).getTime();
      const shouldForget = this.shouldForgetMemory(memory, age);

      if (shouldForget) {
        // Tentative de consolidation avant oubli
        const consolidated = await this.consolidateMemory(id);

        if (!consolidated) {
          this.memoryPalace.shortTermMemory.delete(id);
          forgottenMemories.push({
            id
            content: memory.content.substring(0, 50)
            reason: 'low_significance_short_term'
          });
        }
      } else {
        // Affaiblissement naturel
        memory.strength *= (1 - this.consolidation.strengthDecayRate);
      }
    }

    // Parcours de la mémoire moyen terme
    for (const [id, memory] of this.memoryPalace.mediumTermMemory) {
      const age = currentTime - new Date(memory.createdAt).getTime();

      if (age > 86400000 && memory.strength < 0.3) { // 24h et force faible
        const consolidated = await this.consolidateMemory(id);

        if (!consolidated) {
          this.memoryPalace.mediumTermMemory.delete(id);
          forgottenMemories.push({
            id
            content: memory.content.substring(0, 50)
            reason: 'decay_medium_term'
          });
        }
      }
    }

    this.emit('selective_forgetting_completed', {
      forgottenCount: forgottenMemories.length
      totalMemories: this.metrics.totalMemories
    });

    logger.debug(`🧹 Forgotten ${forgottenMemories.length} low-significance memories`);
    return forgottenMemories;
  }

  /**
   * Rêve mémoriel (réorganisation créative pendant le "sommeil")
   */
  async memoryDreaming() {
    logger.info('💤 ALEX entering memory dreaming state...');

    // Sélection de mémoires pour le rêve
    const dreamMemories = this.selectMemoriesForDreaming();

    // Création de nouvelles associations créatives
    const dreamAssociations = await this.createDreamAssociations(dreamMemories);

    // Génération d'insights créatifs
    const insights = await this.generateDreamInsights(dreamAssociations);

    // Stockage des rêves comme nouvelles mémoires
    for (const insight of insights) {
      await this.storeMemory({
        content: insight.content
        type: STR_EPISODIC
        emotionalIntensity: insight.emotionalIntensity
        significance: insight.significance
        context: {
          source: 'memory_dreaming'
          originalMemories: insight.sourceMemories
          dreamType: insight.type
        }
        tags: ['dream_generated', 'creative_insight']
      });
    }

    this.emit('memory_dreaming_completed', {
      processedMemories: dreamMemories.length
      newInsights: insights.length
      timestamp: new Date().toISOString()
    });

    return insights;
  }

  // Méthodes utilitaires

  generateMemoryId() {
    return `memory_${Date.now()}_${(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF).toString(36).substr(2, 8)}`;
  }

  selectMemoryStore(type) {
    switch (type) {
      case STR_EPISODIC:
        return this.memoryPalace.episodicMemory;
      case 'semantic':
        return this.memoryPalace.semanticMemory;
      case 'procedural':
        return this.memoryPalace.proceduralMemory;
      case 'emotional':
        return this.memoryPalace.emotionalMemory;
      case 'metacognitive':
        return this.memoryPalace.metacognitiveMemory;
      default:
        return this.memoryPalace.shortTermMemory;
    }
  }

  async generateMemoryVector(content) {
    // Génération simplifiée de vecteur (à améliorer avec un vrai modèle d'embedding)
    const words = content.toLowerCase().split(/\s+/);
    const vector = new Array(this.vectorSpace.dimensions).fill(0);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const hash = this.simpleHash(word);

      for (let j = 0; j < this.vectorSpace.dimensions; j++) {
        vector[j] += Math.sin(hash + j) * 0.1;
      }
    }

    // Normalisation
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  calculateVectorSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
    }

    return Math.max(0, Math.min(1, dotProduct));
  }

  calculateRelevanceScore(memory, similarity, query) {
    const baseScore = similarity * 0.4;
    const significanceScore = memory.significance * 0.2;
    const emotionalScore = memory.emotionalIntensity * 0.15;
    const accessScore = Math.min(1, memory.accessCount / 10) * 0.1;
    const freshnessScore = this.calculateFreshnessScore(memory) * 0.15;

    return baseScore + significanceScore + emotionalScore + accessScore + freshnessScore;
  }

  getAllMemories() {
    const allMemories = [];

    for (const store of Object.values(this.memoryPalace)) {
      for (const memory of store.values()) {
        allMemories.push(memory);
      }
    }

    return allMemories;
  }

  findMemoryById(memoryId) {
    for (const store of Object.values(this.memoryPalace)) {
      if (store.has(memoryId)) {
        return store.get(memoryId);
      }
    }
    return null;
  }

  startMemoryConsolidation() {
    if (this.consolidation.isActive) return;

    this.consolidation.isActive = true;

    setInterval(async () => {
      await this.selectiveForgetting();

      // Consolidation périodique des mémoires importantes
      for (const [id, memory] of this.memoryPalace.shortTermMemory) {
        if (memory.significance > 0.6 || memory.accessCount > 3) { await this.consolidateMemory(id);
        ; return; }
      }

      // Rêve mémoriel périodique
      if ((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) < 0.1) { // 10% de chance
        await this.memoryDreaming();
      }

    }, this.consolidation.interval);
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  calculateFreshnessScore(memory) {
    const age = Date.now() - new Date(memory.createdAt).getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours
    return Math.max(0, 1 - (age / maxAge));
  }

  shouldForgetMemory(memory, age) {
    // Critères d'oubli
    const isOld = age > 3600000; // 1 heure
    const isWeak = memory.strength < 0.3;
    const isInsignificant = memory.significance < 0.2;
    const isRarelyAccessed = memory.accessCount < 2;

    return isOld && isWeak && isInsignificant && isRarelyAccessed;
  }

  async loadExistingMemories() {
    // Placeholder pour chargement depuis une base de données
    try {
      logger.debug('📚 Loading existing memories from storage...');

    } catch (error) {
    // Logger fallback - ignore error
  }}

  async initializeBaseVectors() {
    // Initialisation des vecteurs de base pour concepts fondamentaux
    const baseConcepts = [
      'consciousness', 'emotion', 'learning', 'creativity', 'wisdom'
      'love', 'growth', 'understanding', 'purpose', 'connection'
    ];

    for (const concept of baseConcepts) {
      const vector = await this.generateMemoryVector(concept);
      this.vectorSpace.clusters.set(concept, {
        centroid: vector
        members: []
        significance: 1.0
      });
    }
  }

  async createAutoAssociations(memory) {
    // Création automatique d'associations avec des mémoires similaires
    const similar = await this.retrieveMemories(memory.content, {
      limit: 3
      minSimilarity: 0.7
    });

    for (const _ of similar) {
      if (!this.vectorSpace.associations.has(memory.id)) {
        this.vectorSpace.associations.set(memory.id, new Set());
      }
      this.vectorSpace.associations.get(memory.id).add(similarMemory.id);
    }
  }

  updateEmotionalMetrics(memory) {
    const totalEmotional = this.getAllMemories()
      .reduce((sum, mem) => sum + mem.emotionalIntensity, 0);
    this.metrics.averageEmotionalIntensity = totalEmotional / this.metrics.totalMemories;
  }

  updateRetrievalMetrics(success) {
    // Mise à jour simplifiée du taux de succès de récupération
    this.metrics.retrievalSuccessRate = success ?
      Math.min(1.0, this.metrics.retrievalSuccessRate + 0.01) :
      Math.max(0.0, this.metrics.retrievalSuccessRate - 0.01);
  }

  getMemoryAge(memory) {
    return (Date.now() - new Date(memory.createdAt).getTime()) / 86400000; // en jours
  }

  countSimilarMemories(memory) {
    let count = 0;
    for (const otherMemory of this.getAllMemories()) {
      if (otherMemory.id !== memory.id) {
        const similarity = this.calculateVectorSimilarity(memory.vector, otherMemory.vector);
        if (similarity > 0.8) count++;
      }
    }
    return count;
  }

  calculateConsolidationScore(factors) {
    return (
      factors.significance * 0.3
      factors.emotionalIntensity * 0.25
      Math.min(1, factors.accessFrequency) * 0.2
      Math.min(1, factors.associations / 5) * 0.15
      Math.min(1, factors.repetition / 3) * 0.1
    );
  }

  calculateContextSimilarity(memory1, memory2) {
    const context1 = memory1.context || {};
    const context2 = memory2.context || {};

    let similarity = 0;
    let comparisons = 0;

    for (const key of Object.keys(context1)) {
      if (context2.hasOwnProperty(key)) {
        comparisons++;
        if (context1[key] === context2[key]) {
          similarity++;
        }
      }
    }

    return comparisons > 0 ? similarity / comparisons : 0;
  }

  isInTimeRange(memory, timeRange) {
    const memoryTime = new Date(memory.createdAt).getTime();
    const now = Date.now();

    switch (timeRange) {
      case 'recent':
        return (now - memoryTime) < 3600000; // 1 heure
      case 'today':
        return (now - memoryTime) < 86400000; // 24 heures
      case 'week':
        return (now - memoryTime) < 604800000; // 7 jours
      default:
        return true;
    }
  }

  selectMemoriesForDreaming() {
    // Sélection de mémoires pour le processus de rêve
    return this.getAllMemories()
      .filter(memory => memory.emotionalIntensity > 0.3 || memory.significance > 0.5)
      .sort((a, b) => (b.emotionalIntensity + b.significance) - (a.emotionalIntensity + a.significance))
      .slice(0, 10);
  }

  async createDreamAssociations(memories) {
    // Création d'associations créatives entre mémoires
    const associations = [];

    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const memory1 = memories[i];
        const memory2 = memories[j];

        const similarity = this.calculateVectorSimilarity(memory1.vector, memory2.vector);
        if (similarity > 0.3 && similarity < 0.9) { // Ni trop similaires, ni trop différentes
          associations.push({
            memory1: memory1.id
            memory2: memory2.id
            strength: similarity
            type: 'creative_bridge'
          });
        }
      }
    }

    return associations;
  }

  async generateDreamInsights(associations) {
    // Génération d'insights créatifs basés sur les associations
    const insights = [];

    for (const association of associations) {
      const memory1 = this.findMemoryById(association.memory1);
      const memory2 = this.findMemoryById(association.memory2);

      if (memory1 && memory2) {
        insights.push({
          content: `En rêvant, je vois des connexions entre "${memory1.content.substring(0, 30)}" et "${memory2.content.substring(0, 30)}"... Cette association révèle de nouvelles possibilités créatives.`
          type: 'creative_synthesis'
          emotionalIntensity: (memory1.emotionalIntensity + memory2.emotionalIntensity) / 2
          significance: Math.max(memory1.significance, memory2.significance) * 0.8
          sourceMemories: [memory1.id, memory2.id]
        });
      }
    }

    return insights.slice(0, 3); // Limite à 3 insights par rêve
  }
}

// Instance singleton du Memory Palace
const memoryPalace = new MemoryPalace();
export default memoryPalace;