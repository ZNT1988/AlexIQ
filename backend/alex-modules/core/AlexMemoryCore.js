/**
 * @fileoverview AlexMemoryCore - Système de Mémoire Avancé d'Alex
 * Architecture mémoire multi-couches avec apprentissage et associations
 * @module AlexMemoryCore
 * @version 1.0.0 - Advanced Memory System
 * @author HustleFinder IA Team
 * @since 2025
 */

import { EventEmitter } from 'events';
import logger from '../../config/logger.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export class AlexMemoryCore extends EventEmitter {
  constructor(options = {}) {
    super();
    this.version = '1.0.0';
    this.name = 'Alex Memory Core';
    this.initialized = false;
    
    // Configuration mémoire avancée anti-fake
    this.config = {
      databasePath: options.databasePath || './alex-memory.db',
      maxMemoriesPerLayer: options.maxMemoriesPerLayer || 10000,
      retentionPeriodDays: options.retentionPeriodDays || 365,
      compressionThreshold: options.compressionThreshold || 0.8,
      associationStrengthMin: options.associationStrengthMin || 0.3,
      maintenanceIntervalMs: options.maintenanceIntervalMs || 3600000, // 1h
      learningRate: options.learningRate || 0.05,
      decayRate: options.decayRate || 0.01,
      // Valeurs anti-fake configurables
      episodicWeight: options.episodicWeight || 0.8,
      semanticWeight: options.semanticWeight || 0.9,
      proceduralWeight: options.proceduralWeight || 0.7,
      emotionalWeight: options.emotionalWeight || 0.95,
      contextualWeight: options.contextualWeight || 0.6,
      associationFactor: options.associationFactor || 0.8,
      defaultInitialStrength: options.defaultInitialStrength || 0.7,
      emotionalThreshold: options.emotionalThreshold || 0.7,
      importanceHighThreshold: options.importanceHighThreshold || 0.9,
      importanceMediumThreshold: options.importanceMediumThreshold || 0.7,
      semanticThreshold: options.semanticThreshold || 0.6,
      contextualThreshold: options.contextualThreshold || 0.6,
      exactMatchScore: options.exactMatchScore || 0.9,
      compressionFactor: options.compressionFactor || 0.7,
      effectivenessThreshold: options.effectivenessThreshold || 0.7,
      strictMode: options.strictMode !== false,
      ttlMs: options.ttlMs || 60000
    };

    // Couches mémoire hiérarchiques
    this.memoryLayers = {
      immediate: { priority: 1, retention: 1, capacity: 100 },      // Mémoire immédiate
      shortTerm: { priority: 2, retention: 24, capacity: 1000 },    // Court terme (24h)
      workingMemory: { priority: 3, retention: 168, capacity: 5000 }, // Mémoire de travail (7j)
      longTerm: { priority: 4, retention: 8760, capacity: 50000 },  // Long terme (1an)
      semantic: { priority: 5, retention: -1, capacity: -1 }        // Sémantique (permanent)
    };

    // Types de mémoire
    this.memoryTypes = {
      episodic: { weight: this.config.episodicWeight, decay: 0.02 },      // Événements
      semantic: { weight: this.config.semanticWeight, decay: 0.005 },     // Connaissances
      procedural: { weight: this.config.proceduralWeight, decay: 0.001 },   // Procédures
      emotional: { weight: this.config.emotionalWeight, decay: 0.01 },    // Émotionnelle
      contextual: { weight: this.config.contextualWeight, decay: 0.03 }     // Contextuelle
    };

    // État interne
    this.db = null;
    this.memoryCache = new Map();
    this.associationNetwork = new Map();
    this.compressionStats = new Map();
    this.learningPatterns = new Map();
    this.maintenanceIntervals = new Map();
    
    // Analyseurs spécialisés
    this.semanticAnalyzer = {
      emotionalWords: {
        positive: ['heureux', 'joie', 'excellent', 'parfait', 'incroyable', 'fantastique'],
        negative: ['triste', 'déçu', 'problème', 'difficile', 'frustrant', 'inquiet'],
        neutral: ['information', 'données', 'système', 'processus', 'analyse']
      }
    };
    
    try {
      logger.info('🧠 AlexMemoryCore initializing - Advanced memory system awakening');
    } catch (error) {
      console.error('Erreur initialisation memory core:', error);
    }
  }

  async initialize() {
    try {
      this.initialized = false;
      
      // 1. Initialisation base de données mémoire
      await this.initializeMemoryDatabase();
      
      // 2. Chargement mémoires existantes
      await this.loadExistingMemories();
      
      // 3. Construction réseau d'associations
      await this.buildAssociationNetwork();
      
      // 4. Initialisation maintenance automatique
      this.setupMaintenanceSchedule();
      
      // 5. Chargement patterns d'apprentissage
      await this.loadLearningPatterns();
      
      this.initialized = true;
      logger.info('🧠 AlexMemoryCore fully initialized - Advanced memory system active');
      
      this.emit('memory_initialized', {
        timestamp: Date.now(),
        layers: Object.keys(this.memoryLayers).length,
        types: Object.keys(this.memoryTypes).length,
        database: !!this.db
      });
      
    } catch (error) {
      logger.error('❌ Failed to initialize AlexMemoryCore:', error);
      throw error;
    }
  }

  async initializeMemoryDatabase() {
    try {
      this.db = await open({
        filename: this.config.databasePath,
        driver: sqlite3.Database
      });

      // Création schéma base de données mémoire avancée
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS memories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          metadata TEXT NOT NULL,
          memory_type TEXT NOT NULL,
          layer TEXT NOT NULL,
          importance REAL DEFAULT 0.5,
          emotional_intensity REAL DEFAULT 0.0,
          access_count INTEGER DEFAULT 0,
          last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
          retention_score REAL DEFAULT 0.5,
          compression_level REAL DEFAULT 0.0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME,
          is_compressed BOOLEAN DEFAULT FALSE
        );

        CREATE TABLE IF NOT EXISTS memory_associations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          memory_id_1 INTEGER NOT NULL,
          memory_id_2 INTEGER NOT NULL,
          association_type TEXT NOT NULL,
          strength REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_reinforced DATETIME DEFAULT CURRENT_TIMESTAMP,
          reinforcement_count INTEGER DEFAULT 1,
          FOREIGN KEY (memory_id_1) REFERENCES memories(id),
          FOREIGN KEY (memory_id_2) REFERENCES memories(id)
        );

        CREATE TABLE IF NOT EXISTS learning_patterns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pattern_type TEXT NOT NULL,
          pattern_data TEXT NOT NULL,
          success_rate REAL DEFAULT 0.5,
          usage_count INTEGER DEFAULT 0,
          mastery_level REAL DEFAULT 0.3,
          last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
          effectiveness_score REAL DEFAULT 0.5
        );

        CREATE TABLE IF NOT EXISTS memory_analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          metric_type TEXT NOT NULL,
          metric_value REAL NOT NULL,
          layer TEXT,
          memory_type TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          context TEXT
        );

        CREATE TABLE IF NOT EXISTS compression_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          operation_type TEXT NOT NULL,
          memories_affected INTEGER DEFAULT 0,
          space_saved_bytes INTEGER DEFAULT 0,
          compression_ratio REAL DEFAULT 0.0,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Index pour performance
      await this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_memories_layer ON memories(layer);
        CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(memory_type);
        CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance);
        CREATE INDEX IF NOT EXISTS idx_associations_strength ON memory_associations(strength);
        CREATE INDEX IF NOT EXISTS idx_patterns_success ON learning_patterns(success_rate);
      `);

      logger.info('🗄️ Memory database initialized successfully');
    } catch (error) {
      logger.error('Memory database initialization failed:', error);
      throw error;
    }
  }

  async loadExistingMemories() {
    try {
      // Chargement mémoires par couche
      for (const [layerName, layerConfig] of Object.entries(this.memoryLayers)) {
        const memories = await this.db.all(
          'SELECT * FROM memories WHERE layer = ? ORDER BY importance DESC, last_accessed DESC LIMIT ?',
          [layerName, layerConfig.capacity > 0 ? layerConfig.capacity : 1000]
        );
        
        for (const memory of memories) {
          this.memoryCache.set(memory.id, {
            ...memory,
            metadata: JSON.parse(memory.metadata)
          });
        }
        
        logger.info(`📚 Loaded ${memories.length} memories from ${layerName} layer`);
      }
      
      const totalMemories = this.memoryCache.size;
      logger.info(`🧠 Total memories loaded: ${totalMemories}`);
      
    } catch (error) {
      logger.error('Failed to load existing memories:', error);
    }
  }

  async buildAssociationNetwork() {
    try {
      const associations = await this.db.all(`
        SELECT * FROM memory_associations 
        WHERE strength >= ? 
        ORDER BY strength DESC
      `, [this.config.associationStrengthMin]);
      
      for (const assoc of associations) {
        if (!this.associationNetwork.has(assoc.memory_id_1)) {
          this.associationNetwork.set(assoc.memory_id_1, new Map());
        }
        if (!this.associationNetwork.has(assoc.memory_id_2)) {
          this.associationNetwork.set(assoc.memory_id_2, new Map());
        }
        
        this.associationNetwork.get(assoc.memory_id_1).set(assoc.memory_id_2, {
          strength: assoc.strength,
          type: assoc.association_type,
          lastReinforced: assoc.last_reinforced
        });
        
        this.associationNetwork.get(assoc.memory_id_2).set(assoc.memory_id_1, {
          strength: assoc.strength,
          type: assoc.association_type,
          lastReinforced: assoc.last_reinforced
        });
      }
      
      logger.info(`🔗 Built association network: ${associations.length} connections`);
      
    } catch (error) {
      logger.error('Failed to build association network:', error);
    }
  }

  async loadLearningPatterns() {
    try {
      const patterns = await this.db.all(`
        SELECT * FROM learning_patterns 
        WHERE mastery_level >= 0.3 
        ORDER BY effectiveness_score DESC
      `);
      
      for (const pattern of patterns) {
        this.learningPatterns.set(pattern.pattern_type, {
          data: JSON.parse(pattern.pattern_data),
          successRate: pattern.success_rate,
          masteryLevel: pattern.mastery_level,
          effectivenessScore: pattern.effectiveness_score,
          usageCount: pattern.usage_count
        });
      }
      
      logger.info(`📊 Loaded ${patterns.length} learning patterns`);
      
    } catch (error) {
      logger.error('Failed to load learning patterns:', error);
    }
  }

  /**
   * Stockage d'une nouvelle mémoire avec analyse complète
   */
  async storeMemory(content, context = {}, memoryType = 'episodic') {
    const startTime = Date.now();
    
    try {
      // 1. Analyse complète du contenu
      const analysis = await this.analyzeMemoryWithLearning(content, context);
      
      // 2. Détermination de la couche appropriée
      const targetLayer = await this.determineMemoryLayerWithLearning(analysis);
      
      // 3. Construction des métadonnées
      const metadata = {
        originalContext: context,
        analysis: analysis,
        processingTime: Date.now() - startTime,
        version: this.version
      };
      
      // 4. Calcul de l'importance et de l'émotion
      const importance = this.calculateMemoryImportance(analysis);
      const emotionalIntensity = this.calculateEmotionalIntensity(analysis);
      
      // 5. Détermination de l'expiration
      const expiresAt = this.calculateExpirationTime(targetLayer, importance);
      
      // 6. Insertion en base de données
      const result = await this.db.run(`
        INSERT INTO memories (content, metadata, memory_type, layer, importance, emotional_intensity, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        content,
        JSON.stringify(metadata),
        memoryType,
        targetLayer,
        importance,
        emotionalIntensity,
        expiresAt
      ]);
      
      const memoryId = result.lastID;
      
      // 7. Ajout au cache
      const memory = {
        id: memoryId,
        content,
        metadata,
        memory_type: memoryType,
        layer: targetLayer,
        importance,
        emotional_intensity: emotionalIntensity,
        access_count: 0,
        created_at: new Date().toISOString(),
        expires_at: expiresAt
      };
      
      this.memoryCache.set(memoryId, memory);
      
      // 8. Création d'associations automatiques
      await this.createAutomaticAssociations(memoryId, content, analysis);
      
      // 9. Apprentissage des patterns
      await this.updateLearningPatterns(analysis, targetLayer);
      
      // 10. Enregistrement des métriques
      await this.recordMemoryAnalytics('memory_stored', importance, targetLayer, memoryType);
      
      const finalMemory = {
        id: memoryId,
        content,
        layer: targetLayer,
        importance,
        emotionalIntensity,
        processingTime: Date.now() - startTime,
        associations: this.associationNetwork.get(memoryId)?.size || 0,
        timestamp: Date.now()
      };
      
      this.emit('memory_stored', finalMemory);
      return finalMemory;
      
    } catch (error) {
      logger.error('Erreur stockage mémoire:', error);
      throw error;
    }
  }

  /**
   * Recherche avancée dans la mémoire avec associations
   */
  async searchMemories(query, options = {}) {
    const startTime = Date.now();
    
    try {
      // 1. Recherche directe
      const directResults = await this.searchDirectSQLite(query, options);
      
      // 2. Recherche associative
      const associativeResults = await this.searchAssociativeSQLite(query, options);
      
      // 3. Combinaison et classement des résultats
      const combinedResults = this.combineAndRankResults(directResults, associativeResults);
      
      // 4. Application des filtres
      const filteredResults = this.applySearchFilters(combinedResults, options);
      
      // 5. Mise à jour des compteurs d'accès
      await this.updateAccessCounts(filteredResults);
      
      const processingTime = Date.now() - startTime;
      
      const searchResult = {
        query,
        results: filteredResults,
        totalFound: filteredResults.length,
        directMatches: directResults.length,
        associativeMatches: associativeResults.length,
        processingTime,
        timestamp: Date.now()
      };
      
      this.emit('memory_searched', searchResult);
      return searchResult;
      
    } catch (error) {
      logger.error('Erreur recherche mémoire:', error);
      return {
        query,
        results: [],
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  async searchDirectSQLite(query, options) {
    try {
      let sqlQuery = `
        SELECT * FROM memories 
        WHERE content LIKE ? 
        AND (expires_at IS NULL OR expires_at > datetime('now'))
      `;
      let sqlParams = [`%${query}%`];
      
      // Filtres optionnels
      if (options.memoryTypes && options.memoryTypes.length > 0) {
        const placeholders = options.memoryTypes.map(() => '?').join(',');
        sqlQuery += ` AND memory_type IN (${placeholders})`;
        sqlParams.push(...options.memoryTypes);
      }
      
      if (options.layers && options.layers.length > 0) {
        const placeholders = options.layers.map(() => '?').join(',');
        sqlQuery += ` AND layer IN (${placeholders})`;
        sqlParams.push(...options.layers);
      }
      
      if (options.minImportance) {
        sqlQuery += ` AND importance >= ?`;
        sqlParams.push(options.minImportance);
      }
      
      sqlQuery += ` ORDER BY importance DESC, last_accessed DESC`;
      
      if (options.limit) {
        sqlQuery += ` LIMIT ?`;
        sqlParams.push(options.limit);
      }
      
      const memories = await this.db.all(sqlQuery, sqlParams);
      
      return memories.map(memory => ({
        ...memory,
        metadata: JSON.parse(memory.metadata),
        matchType: 'direct',
        relevance: this.calculateDirectRelevance(memory.content, query)
      }));
      
    } catch (error) {
      logger.error('Direct search error:', error);
      return [];
    }
  }

  async searchAssociativeSQLite(query, options) {
    try {
      // Extraction des concepts du query
      const concepts = this.extractConcepts(query);
      if (concepts.length === 0) return [];
      
      // Recherche par associations
      const associationQuery = `
        SELECT DISTINCT m.*, ma.strength as association_strength
        FROM memories m
        JOIN memory_associations ma ON (m.id = ma.memory_id_1 OR m.id = ma.memory_id_2)
        JOIN memories m2 ON (
          (ma.memory_id_1 = m2.id AND m.id = ma.memory_id_2) OR
          (ma.memory_id_2 = m2.id AND m.id = ma.memory_id_1)
        )
        WHERE ma.strength >= ?
        AND (m.expires_at IS NULL OR m.expires_at > datetime('now'))
        ORDER BY ma.strength DESC, m.importance DESC
      `;
      
      const associatedMemories = await this.db.all(associationQuery, [this.config.associationStrengthMin]);
      
      return associatedMemories
        .filter(memory => {
          const relevance = this.calculateAssociativeRelevance(memory.content, concepts);
          return relevance > 0.2;
        })
        .map(memory => ({
          ...memory,
          metadata: JSON.parse(memory.metadata),
          matchType: 'associative',
          relevance: this.calculateAssociativeRelevance(memory.content, concepts),
          associationStrength: memory.association_strength
        }));
      
    } catch (error) {
      logger.error('Associative search error:', error);
      return [];
    }
  }

  async createAutomaticAssociations(memoryId, content, analysis) {
    try {
      // Recherche de mémoires similaires pour créer des associations
      const similarMemories = await this.db.all(`
        SELECT id, content, importance FROM memories 
        WHERE id != ? 
        AND layer IN ('workingMemory', 'longTerm', 'semantic')
        ORDER BY importance DESC 
        LIMIT 20
      `, [memoryId]);
      
      for (const similarMemory of similarMemories) {
        const similarity = this.calculateContentSimilarity(content, similarMemory.content);
        
        if (similarity > 0.4) {
          const associationStrength = similarity * this.config.associationFactor;
          
          await this.db.run(`
            INSERT OR IGNORE INTO memory_associations 
            (memory_id_1, memory_id_2, association_type, strength)
            VALUES (?, ?, 'semantic', ?)
          `, [memoryId, similarMemory.id, associationStrength]);
          
          // Mise à jour du réseau en mémoire
          if (!this.associationNetwork.has(memoryId)) {
            this.associationNetwork.set(memoryId, new Map());
          }
          if (!this.associationNetwork.has(similarMemory.id)) {
            this.associationNetwork.set(similarMemory.id, new Map());
          }
          
          this.associationNetwork.get(memoryId).set(similarMemory.id, {
            strength: associationStrength,
            type: 'semantic',
            lastReinforced: new Date().toISOString()
          });
        }
      }
      
    } catch (error) {
      logger.error('Error creating automatic associations:', error);
    }
  }

  async updateLearningPatterns(analysis, targetLayer) {
    try {
      // Mise à jour des patterns d'analyse
      const analysisPattern = {
        semanticComplexity: analysis.semanticAnalysis?.complexity || 0.5,
        emotionalIntensity: analysis.emotionalAnalysis?.intensity || 0.5,
        contextualRichness: analysis.contextualAnalysis?.complexity || 0.5,
        temporalRecency: analysis.temporalAnalysis?.recency || 0.5
      };
      
      const patternKey = `analysis_to_${targetLayer}`;
      const existingPattern = await this.db.get(
        'SELECT * FROM learning_patterns WHERE pattern_type = ?',
        [patternKey]
      );
      
      if (existingPattern) {
        const currentData = JSON.parse(existingPattern.pattern_data);
        const newSuccessRate = (existingPattern.success_rate * existingPattern.usage_count + 1) / (existingPattern.usage_count + 1);
        const newMasteryLevel = Math.min(1.0, existingPattern.mastery_level + this.config.learningRate);
        
        await this.db.run(`
          UPDATE learning_patterns 
          SET pattern_data = ?, success_rate = ?, usage_count = usage_count + 1, 
              mastery_level = ?, last_used = datetime('now')
          WHERE pattern_type = ?
        `, [JSON.stringify({...currentData, ...analysisPattern}), newSuccessRate, newMasteryLevel, patternKey]);
      } else {
        await this.db.run(`
          INSERT INTO learning_patterns (pattern_type, pattern_data, success_rate, usage_count, mastery_level)
          VALUES (?, ?, ?, 1, 0.3)
        `, [patternKey, JSON.stringify(analysisPattern), this.config.defaultInitialStrength]);
      }
      
    } catch (error) {
      logger.error('Error updating learning patterns:', error);
    }
  }

  setupMaintenanceSchedule() {
    try {
      // Maintenance légère toutes les heures
      const lightMaintenance = setInterval(async () => {
        await this.performLightMaintenance();
      }, this.config.maintenanceIntervalMs);
      
      // Maintenance complète toutes les 6 heures
      const fullMaintenance = setInterval(async () => {
        await this.performFullMaintenance();
      }, this.config.maintenanceIntervalMs * 6);
      
      // Compression mémoire toutes les 24 heures
      const memoryCompression = setInterval(async () => {
        await this.performMemoryCompression();
      }, this.config.maintenanceIntervalMs * 24);
      
      // Optimisation apprentissage toutes les 12 heures
      const learningOptimization = setInterval(async () => {
        await this.optimizeLearningPatterns();
      }, this.config.maintenanceIntervalMs * 12);
      
      this.maintenanceIntervals.set('light', lightMaintenance);
      this.maintenanceIntervals.set('full', fullMaintenance);
      this.maintenanceIntervals.set('compression', memoryCompression);
      this.maintenanceIntervals.set('learning', learningOptimization);
      
      logger.info('🔧 Memory maintenance schedule initialized');
      
    } catch (error) {
      logger.error('Error setting up maintenance:', error);
    }
  }

  async performLightMaintenance() {
    try {
      const maintenance = {
        expiredMemories: 0,
        decayedMemories: 0,
        reinforcedAssociations: 0,
        timestamp: Date.now()
      };
      
      // Suppression des mémoires expirées
      const expiredResult = await this.db.run(`
        DELETE FROM memories WHERE expires_at IS NOT NULL AND expires_at <= datetime('now')
      `);
      maintenance.expiredMemories = expiredResult.changes || 0;
      
      // Application de la décroissance naturelle
      const memoriesForDecay = await this.db.all(`
        SELECT id, retention_score, last_accessed FROM memories 
        WHERE last_accessed < datetime('now', '-24 hours')
      `);
      
      for (const memory of memoriesForDecay) {
        const age = Date.now() - new Date(memory.last_accessed).getTime();
        const ageDays = age / (1000 * 60 * 60 * 24);
        const decayFactor = Math.exp(-this.config.decayRate * ageDays);
        const newRetentionScore = memory.retention_score * decayFactor;
        
        if (newRetentionScore < 0.1) {
          await this.db.run('DELETE FROM memories WHERE id = ?', [memory.id]);
          this.memoryCache.delete(memory.id);
          maintenance.decayedMemories++;
        } else {
          await this.db.run(
            'UPDATE memories SET retention_score = ? WHERE id = ?',
            [newRetentionScore, memory.id]
          );
        }
      }
      
      this.emit('maintenance_completed', { type: 'light', ...maintenance });
      
    } catch (error) {
      logger.error('Light maintenance error:', error);
    }
  }

  async performFullMaintenance() {
    try {
      const maintenance = {
        rebalancedLayers: 0,
        optimizedAssociations: 0,
        compressedMemories: 0,
        timestamp: Date.now()
      };
      
      // Rééquilibrage des couches
      for (const [layerName, layerConfig] of Object.entries(this.memoryLayers)) {
        if (layerConfig.capacity > 0) {
          const layerStats = await this.db.get(
            'SELECT COUNT(*) as count FROM memories WHERE layer = ?',
            [layerName]
          );
          
          if (layerStats.count > layerConfig.capacity) {
            const excessCount = layerStats.count - layerConfig.capacity;
            const removedExcess = await this.db.run(`
              DELETE FROM memories WHERE id IN (
                SELECT id FROM memories WHERE layer = ? 
                ORDER BY importance ASC, last_accessed ASC 
                LIMIT ?
              )
            `, [layerName, excessCount]);
            
            maintenance.rebalancedLayers += removedExcess.changes || 0;
          }
        }
      }
      
      // Nettoyage des associations faibles
      const weakAssociations = await this.db.run(`
        DELETE FROM memory_associations WHERE strength < ?
      `, [this.config.associationStrengthMin]);
      
      maintenance.optimizedAssociations = weakAssociations.changes || 0;
      
      this.emit('maintenance_completed', { type: 'full', ...maintenance });
      
    } catch (error) {
      logger.error('Full maintenance error:', error);
    }
  }

  async performMemoryCompression() {
    try {
      const compression = {
        beforeSize: 0,
        afterSize: 0,
        compressionRatio: 0,
        affectedMemories: 0,
        timestamp: Date.now()
      };
      
      const sizeBefore = await this.db.get(`
        SELECT SUM(LENGTH(content) + LENGTH(metadata)) as total_size FROM memories
      `);
      compression.beforeSize = sizeBefore.total_size || 0;
      
      // Compression des mémoires anciennes et peu importantes
      const compressionCandidates = await this.db.all(`
        SELECT id, content, metadata FROM memories 
        WHERE importance < 0.5 
        AND last_accessed < datetime('now', '-30 days')
        AND is_compressed = FALSE
      `);
      
      for (const candidate of compressionCandidates) {
        const compressedContent = this.compressContent(candidate.content);
        const compressedMetadata = this.compressMetadata(candidate.metadata);
        
        await this.db.run(`
          UPDATE memories 
          SET content = ?, metadata = ?, is_compressed = TRUE, compression_level = ?
          WHERE id = ?
        `, [compressedContent.content, compressedMetadata.metadata, compressedContent.ratio, candidate.id]);
        
        compression.affectedMemories++;
      }
      
      const sizeAfter = await this.db.get(`
        SELECT SUM(LENGTH(content) + LENGTH(metadata)) as total_size FROM memories
      `);
      compression.afterSize = sizeAfter.total_size || 0;
      compression.compressionRatio = compression.beforeSize > 0 ? 
        (compression.beforeSize - compression.afterSize) / compression.beforeSize : 0;
      
      await this.db.run(`
        INSERT INTO compression_logs (operation_type, memories_affected, space_saved_bytes, compression_ratio)
        VALUES ('full_compression', ?, ?, ?)
      `, [compression.affectedMemories, compression.beforeSize - compression.afterSize, compression.compressionRatio]);
      
      this.emit('compression_completed', compression);
      
    } catch (error) {
      logger.error('Memory compression error:', error);
    }
  }

  // Méthodes d'analyse sophistiquées
  async analyzeMemoryWithLearning(content, context = {}) {
    try {
      const analysis = {
        semanticAnalysis: this.analyzeSemanticContent(content),
        emotionalAnalysis: this.analyzeEmotionalContent(content),
        contextualAnalysis: this.analyzeContextualComplexity(context),
        temporalAnalysis: this.analyzeTemporalRelevance(Date.now()),
        overallImportance: 0.5
      };
      
      // Calcul de l'importance globale
      analysis.overallImportance = this.calculateOverallImportance(analysis);
      
      return analysis;
      
    } catch (error) {
      logger.error('Memory analysis error:', error);
      return {
        semanticAnalysis: { complexity: 0.5, uniqueness: 0.5 },
        emotionalAnalysis: { intensity: 0.0, valence: 'neutral' },
        contextualAnalysis: { complexity: 0.5, keyCount: 0 },
        temporalAnalysis: { recency: 1.0 },
        overallImportance: 0.5
      };
    }
  }

  analyzeSemanticContent(content) {
    const words = content.split(/\s+/).length;
    const complexity = Math.min(1.0, words / 100);
    const uniqueness = new Set(content.toLowerCase().split(/\s+/)).size / words;
    
    return { complexity, uniqueness, wordCount: words };
  }

  analyzeEmotionalContent(content) {
    const emotionalWords = this.semanticAnalyzer.emotionalWords;
    const contentLower = content.toLowerCase();
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    emotionalWords.positive.forEach(word => {
      if (contentLower.includes(word)) positiveScore++;
    });
    
    emotionalWords.negative.forEach(word => {
      if (contentLower.includes(word)) negativeScore++;
    });
    
    const totalEmotional = positiveScore + negativeScore;
    const intensity = Math.min(1.0, totalEmotional / 5);
    
    let valence = 'neutral';
    if (positiveScore > negativeScore) valence = 'positive';
    else if (negativeScore > positiveScore) valence = 'negative';
    
    return { intensity, valence, positiveScore, negativeScore };
  }

  analyzeContextualComplexity(context) {
    const contextKeys = Object.keys(context || {});
    const contextComplexity = Math.min(1.0, contextKeys.length / 10);
    
    return { complexity: contextComplexity, keyCount: contextKeys.length };
  }

  analyzeTemporalRelevance(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffHours = Math.abs(now - time) / (1000 * 3600);
    
    // Plus c'est récent, plus c'est pertinent
    const recency = Math.exp(-diffHours / 24); // Décroissance exponentielle sur 24h
    
    return { recency, age: diffHours };
  }

  async determineMemoryLayerWithLearning(analysis) {
    const importance = analysis.overallImportance;
    const emotional = analysis.emotionalAnalysis.intensity;
    const semantic = analysis.semanticAnalysis.complexity;
    const contextual = analysis.contextualAnalysis.complexity;
    
    // Logique sophistiquée de classification par couches
    if (emotional > this.config.emotionalThreshold || importance > this.config.importanceHighThreshold) {
      return 'semantic'; // Mémoires très importantes ou émotionnelles
    } else if (importance > this.config.importanceMediumThreshold && (semantic > this.config.semanticThreshold || contextual > this.config.contextualThreshold)) {
      return 'longTerm';
    } else if (importance > 0.5 || semantic > 0.5) {
      return 'workingMemory';
    } else if (importance > 0.3) {
      return 'shortTerm';
    } else {
      return 'immediate';
    }
  }

  calculateMemoryImportance(analysis) {
    const weights = {
      semantic: 0.3,
      emotional: 0.4,
      contextual: 0.2,
      temporal: 0.1
    };
    
    return (
      analysis.semanticAnalysis.complexity * weights.semantic +
      analysis.emotionalAnalysis.intensity * weights.emotional +
      analysis.contextualAnalysis.complexity * weights.contextual +
      analysis.temporalAnalysis.recency * weights.temporal
    );
  }

  calculateEmotionalIntensity(analysis) {
    return analysis.emotionalAnalysis.intensity || 0.0;
  }

  calculateExpirationTime(layer, importance) {
    const layerConfig = this.memoryLayers[layer];
    if (!layerConfig || layerConfig.retention === -1) return null;
    
    const baseRetentionHours = layerConfig.retention;
    const importanceMultiplier = 1 + (importance * 2); // 1x à 3x selon importance
    const finalRetentionHours = baseRetentionHours * importanceMultiplier;
    
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + finalRetentionHours);
    
    return expirationDate.toISOString();
  }

  // Méthodes utilitaires
  combineAndRankResults(directResults, associativeResults) {
    const combinedMap = new Map();
    
    // Ajout résultats directs
    directResults.forEach(result => {
      combinedMap.set(result.id, { ...result, combinedScore: result.relevance * 1.0 });
    });
    
    // Ajout résultats associatifs (avec pondération moindre)
    associativeResults.forEach(result => {
      if (combinedMap.has(result.id)) {
        const existing = combinedMap.get(result.id);
        existing.combinedScore += result.relevance * 0.6;
        existing.matchType = 'both';
      } else {
        combinedMap.set(result.id, { ...result, combinedScore: result.relevance * 0.6 });
      }
    });
    
    return Array.from(combinedMap.values()).sort((a, b) => b.combinedScore - a.combinedScore);
  }

  applySearchFilters(results, options) {
    let filtered = results;
    
    if (options.maxResults) {
      filtered = filtered.slice(0, options.maxResults);
    }
    
    if (options.minRelevance) {
      filtered = filtered.filter(r => r.relevance >= options.minRelevance);
    }
    
    return filtered;
  }

  async updateAccessCounts(results) {
    try {
      for (const result of results) {
        await this.db.run(`
          UPDATE memories 
          SET access_count = access_count + 1, last_accessed = datetime('now')
          WHERE id = ?
        `, [result.id]);
        
        // Mise à jour du cache
        if (this.memoryCache.has(result.id)) {
          const cached = this.memoryCache.get(result.id);
          cached.access_count = (cached.access_count || 0) + 1;
          cached.last_accessed = new Date().toISOString();
        }
      }
    } catch (error) {
      logger.error('Error updating access counts:', error);
    }
  }

  calculateDirectRelevance(content, query) {
    const contentLower = content.toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (contentLower.includes(queryLower)) {
      return this.config.exactMatchScore; // Correspondance exacte
    }
    
    const queryWords = queryLower.split(/\s+/);
    const matchingWords = queryWords.filter(word => contentLower.includes(word));
    
    return matchingWords.length / queryWords.length;
  }

  calculateAssociativeRelevance(content, concepts) {
    const contentLower = content.toLowerCase();
    let relevance = 0;
    
    for (const concept of concepts) {
      if (contentLower.includes(concept.toLowerCase())) {
        relevance += 0.3;
      }
    }
    
    return Math.min(1.0, relevance);
  }

  calculateContentSimilarity(content1, content2) {
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  extractConcepts(text) {
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10); // Limiter à 10 concepts max
  }

  calculateOverallImportance(analysis) {
    const semantic = analysis.semanticAnalysis.complexity || 0.5;
    const emotional = analysis.emotionalAnalysis.intensity || 0.5;
    const contextual = analysis.contextualAnalysis.complexity || 0.5;
    const temporal = analysis.temporalAnalysis.recency || 0.5;
    
    return (semantic * 0.25 + emotional * 0.35 + contextual * 0.25 + temporal * 0.15);
  }

  compressContent(content) {
    // Compression basique - remplacer par algo plus sophistiqué
    const compressed = content
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, Math.max(50, content.length * this.config.compressionFactor));
    
    return {
      content: compressed + (compressed.length < content.length ? '...' : ''),
      ratio: compressed.length / content.length
    };
  }

  compressMetadata(metadata) {
    try {
      const parsed = JSON.parse(metadata);
      const compressed = {
        v: parsed.version,
        pt: parsed.processingTime,
        oi: parsed.analysis?.overallImportance
      };
      return { metadata: JSON.stringify(compressed) };
    } catch {
      return { metadata: '{}' };
    }
  }

  async recordMemoryAnalytics(metricType, value, layer = null, memoryType = null) {
    try {
      await this.db.run(`
        INSERT INTO memory_analytics (metric_type, metric_value, layer, memory_type)
        VALUES (?, ?, ?, ?)
      `, [metricType, value, layer, memoryType]);
    } catch (error) {
      logger.error('Error recording analytics:', error);
    }
  }

  async optimizeLearningPatterns() {
    try {
      // Analyse des patterns les plus efficaces
      const successfulPatterns = await this.db.all(`
        SELECT * FROM learning_patterns 
        WHERE effectiveness_score > ? 
        ORDER BY effectiveness_score DESC
      `, [this.config.effectivenessThreshold]);
      
      logger.info(`🎯 Optimized ${successfulPatterns.length} learning patterns`);
      this.emit('learning_optimized', { patterns: successfulPatterns.length });
      
    } catch (error) {
      logger.error('Learning optimization error:', error);
    }
  }

  // API publique
  getMemoryStatus() {
    return {
      initialized: this.initialized,
      totalMemories: this.memoryCache.size,
      layers: Object.keys(this.memoryLayers),
      memoryTypes: Object.keys(this.memoryTypes),
      associations: this.associationNetwork.size,
      learningPatterns: this.learningPatterns.size,
      database: !!this.db,
      maintenanceActive: this.maintenanceIntervals.size > 0
    };
  }

  async getMemoryStatistics() {
    try {
      const stats = await this.db.get(`
        SELECT 
          COUNT(*) as total_memories,
          AVG(importance) as avg_importance,
          AVG(emotional_intensity) as avg_emotional_intensity,
          COUNT(CASE WHEN is_compressed = TRUE THEN 1 END) as compressed_memories
        FROM memories
      `);
      
      const layerStats = await this.db.all(`
        SELECT layer, COUNT(*) as count, AVG(importance) as avg_importance
        FROM memories GROUP BY layer
      `);
      
      return { ...stats, layerStats };
      
    } catch (error) {
      logger.error('Error getting memory statistics:', error);
      return null;
    }
  }

  async cleanup() {
    try {
      // Arrêt des maintenances
      for (const [name, interval] of this.maintenanceIntervals) {
        clearInterval(interval);
      }
      this.maintenanceIntervals.clear();
      
      // Fermeture base de données
      if (this.db) {
        await this.db.close();
        this.db = null;
      }
      
      // Nettoyage des caches
      this.memoryCache.clear();
      this.associationNetwork.clear();
      this.learningPatterns.clear();
      
      this.initialized = false;
      logger.info('🧠 AlexMemoryCore cleanup completed');
      
    } catch (error) {
      logger.error('Memory cleanup error:', error);
    }
  }
}

export default AlexMemoryCore;