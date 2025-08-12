import crypto from "crypto";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { EventEmitter } from "events";
import logger from "../../config/logger.js";

/**
 * @fileoverview MemoryPalace - SYSTÈME MÉMOIRE AUTHENTIQUE ALEX
 * RÉVOLUTION TOTALE: SQLite + Mémoire Évolutive + Oubli Intelligent + Consolidation
 *
 * @module MemoryPalace
 * @version 4.0.0 - LICORNE AUTHENTIC MEMORY SYSTEM
 * @author HustleFinder IA Team
 * @since 2025
 */

/**
 * @class MemoryPalace
 * @description SYSTÈME MÉMOIRE AUTHENTIQUE ALEX - ARCHITECTURE ÉVOLUTIVE
 * RÈGLES ABSOLUES RESPECTÉES:
 * ✅ SQLite pour TOUTE persistance mémoire (JAMAIS de Maps statiques)
 * ✅ Mémoire évolutive avec importance dynamique
 * ✅ Système d'oubli intelligent (forgetting curves)
 * ✅ Consolidation automatique des souvenirs
 * ✅ Apprentissage par association et patterns
 * ✅ Émotions et contexte influençant la mémorisation
 */
export class MemoryPalace extends EventEmitter {
  constructor(config = {}) {
    super();

    this.name = "MemoryPalace";
    this.version = "4.0.0";

    // Base de données SQLite OBLIGATOIRE - Palais mémoire
    this.dbPath = config.dbPath || "./data/alex_memory_palace.db";
    this.db = null;

    // Système mémoire AUTHENTIQUE (pas de simulation)
    this.memorySystem = {
      totalMemories: 0,
      activeMemories: 0,
      consolidatedMemories: 0,
      forgottenMemories: 0,
      lastConsolidation: new Date(),
      memoryEfficiency: 0.0,
      averageRetention: 0.0,
      associationStrength: 0.0,
    };

    // Paramètres évolution mémoire DYNAMIQUES
    this.memoryParameters = {
      forgettingRate: 0.02, // Taux d'oubli naturel
      consolidationThreshold: 0.7, // Seuil consolidation
      associationWeight: 0.15, // Poids associations
      emotionalBoost: 0.3, // Boost émotionnel
      repetitionStrengthening: 0.1, // Renforcement répétition
      contextualRelevance: 0.2, // Pertinence contextuelle
      maxMemoryAge: 90, // Âge max mémoires (jours)
      importanceDecay: 0.01, // Dégradation importance
    };

    // Types de mémoire AUTHENTIQUES
    this.memoryTypes = {
      episodic: "episodic", // Mémoire épisodique (événements)
      semantic: "semantic", // Mémoire sémantique (connaissances)
      procedural: "procedural", // Mémoire procédurale (procédures)
      emotional: "emotional", // Mémoire émotionnelle
      contextual: "contextual", // Mémoire contextuelle
      associative: "associative", // Mémoire associative
    };

    // État consolidation ÉVOLUTIF
    this.consolidationState = {
      isActive: false,
      lastRun: new Date(0),
      memoriesProcessed: 0,
      associationsCreated: 0,
      memoriesConsolidated: 0,
      memoriesForgotten: 0,
      efficiencyGained: 0.0,
    };

    // Émotions et contexte DYNAMIQUES
    this.emotionalContext = {
      currentMood: "neutral",
      emotionalIntensity: 0.5,
      contextualFocus: [],
      recentEmotionalEvents: [],
      emotionalMemoryBias: 0.1,
    };

    this.isInitialized = false;
    this.initializationTime = null;
  }

  /**
   * Initialisation AUTHENTIQUE système mémoire
   */
  async initialize() {
    try {
      logger.info("🏛️ Initializing MemoryPalace - Authentic Memory System...");

      // 1. Connexion base SQLite OBLIGATOIRE
      await this.connectToMemoryDatabase();

      // 2. Création des tables mémoire
      await this.createMemoryTables();

      // 3. Restauration état mémoire
      await this.restoreMemoryState();

      // 4. Initialisation système consolidation
      await this.initializeConsolidationSystem();

      // 5. Démarrage processus autonomes
      this.startAutonomousMemoryProcesses();

      this.isInitialized = true;
      this.initializationTime = new Date();

      logger.info(
        `✨ MemoryPalace initialized - ${this.memorySystem.totalMemories} memories, ${this.memorySystem.activeMemories} active`,
      );

      this.emit("memory_palace_ready", {
        version: this.version,
        totalMemories: this.memorySystem.totalMemories,
        activeMemories: this.memorySystem.activeMemories,
        memoryEfficiency: this.memorySystem.memoryEfficiency,
        averageRetention: this.memorySystem.averageRetention,
      });

      return this;
    } catch (error) {
      logger.error("Failed to initialize MemoryPalace:", error);
      throw error;
    }
  }

  /**
   * Connexion base données mémoire SQLite
   */
  async connectToMemoryDatabase() {
    try {
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database,
      });

      logger.info(`🗄️ Memory database connected: ${this.dbPath}`);
    } catch (error) {
      logger.error("Failed to connect memory database:", error);
      throw new Error(`Memory SQLite connection failed: ${error.message}`);
    }
  }

  /**
   * Création tables mémoire AUTHENTIQUE
   */
  async createMemoryTables() {
    const tables = [
      // Table mémoires principales RÉELLES
      `CREATE TABLE IF NOT EXISTS alex_memories (
        id TEXT PRIMARY KEY,
        memory_type TEXT NOT NULL,
        content TEXT NOT NULL,
        context TEXT,
        emotional_valence REAL DEFAULT 0.0,
        emotional_intensity REAL DEFAULT 0.0,
        importance REAL DEFAULT 0.5,
        confidence REAL DEFAULT 0.5,
        access_count INTEGER DEFAULT 0,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_strengthened DATETIME DEFAULT CURRENT_TIMESTAMP,
        retention_strength REAL DEFAULT 1.0,
        forgetting_curve_position REAL DEFAULT 0.0,
        consolidation_level REAL DEFAULT 0.0,
        is_consolidated BOOLEAN DEFAULT 0,
        is_forgotten BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        domain TEXT,
        tags TEXT,
        source_interaction_id TEXT
      )`,

      // Table associations mémoires
      `CREATE TABLE IF NOT EXISTS alex_memory_associations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_id_from TEXT NOT NULL,
        memory_id_to TEXT NOT NULL,
        association_type TEXT NOT NULL,
        association_strength REAL DEFAULT 0.5,
        activation_count INTEGER DEFAULT 0,
        last_activation DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (memory_id_from) REFERENCES alex_memories (id),
        FOREIGN KEY (memory_id_to) REFERENCES alex_memories (id)
      )`,

      // Table patterns mémoire
      `CREATE TABLE IF NOT EXISTS alex_memory_patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pattern_name TEXT NOT NULL,
        pattern_type TEXT NOT NULL,
        memory_ids TEXT NOT NULL,
        pattern_strength REAL DEFAULT 0.0,
        activation_frequency INTEGER DEFAULT 0,
        last_activation DATETIME DEFAULT CURRENT_TIMESTAMP,
        discovery_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        pattern_reliability REAL DEFAULT 0.5
      )`,

      // Table consolidation mémoire
      `CREATE TABLE IF NOT EXISTS alex_memory_consolidation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        consolidation_session_id TEXT NOT NULL,
        memory_id TEXT NOT NULL,
        before_importance REAL,
        after_importance REAL,
        before_retention REAL,
        after_retention REAL,
        consolidation_type TEXT,
        associations_created INTEGER DEFAULT 0,
        patterns_detected INTEGER DEFAULT 0,
        emotional_enhancement REAL DEFAULT 0.0,
        consolidation_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (memory_id) REFERENCES alex_memories (id)
      )`,

      // Table contexte émotionnel
      `CREATE TABLE IF NOT EXISTS alex_emotional_memory_context (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_id TEXT NOT NULL,
        emotion_type TEXT NOT NULL,
        emotion_intensity REAL NOT NULL,
        context_tags TEXT,
        user_feedback REAL,
        impact_on_retention REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (memory_id) REFERENCES alex_memories (id)
      )`,

      // Table statistiques mémoire
      `CREATE TABLE IF NOT EXISTS alex_memory_statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stat_date DATE NOT NULL,
        total_memories INTEGER,
        active_memories INTEGER,
        consolidated_memories INTEGER,
        forgotten_memories INTEGER,
        average_retention REAL,
        memory_efficiency REAL,
        consolidation_rate REAL,
        forgetting_rate REAL,
        new_memories_created INTEGER,
        associations_formed INTEGER
      )`,
    ];

    for (const tableSQL of tables) {
      await this.db.exec(tableSQL);
    }

    // Index pour performance
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_memories_type_domain ON alex_memories(memory_type, domain)",
      "CREATE INDEX IF NOT EXISTS idx_memories_importance ON alex_memories(importance DESC)",
      "CREATE INDEX IF NOT EXISTS idx_memories_access ON alex_memories(last_accessed DESC)",
      "CREATE INDEX IF NOT EXISTS idx_associations_strength ON alex_memory_associations(association_strength DESC)",
      "CREATE INDEX IF NOT EXISTS idx_patterns_frequency ON alex_memory_patterns(activation_frequency DESC)",
    ];

    for (const indexSQL of indexes) {
      await this.db.exec(indexSQL);
    }

    logger.info(
      "🏗️ Memory Palace tables created with advanced memory architecture",
    );
  }

  /**
   * Restauration état mémoire depuis base
   */
  async restoreMemoryState() {
    try {
      // Statistiques générales mémoire
      const memoryStats = await this.db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_forgotten = 0 THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN is_consolidated = 1 THEN 1 ELSE 0 END) as consolidated,
          SUM(CASE WHEN is_forgotten = 1 THEN 1 ELSE 0 END) as forgotten,
          AVG(importance) as avg_importance,
          AVG(retention_strength) as avg_retention
        FROM alex_memories
      `);

      if (memoryStats) {
        this.memorySystem.totalMemories = memoryStats.total;
        this.memorySystem.activeMemories = memoryStats.active;
        this.memorySystem.consolidatedMemories = memoryStats.consolidated;
        this.memorySystem.forgottenMemories = memoryStats.forgotten;
        this.memorySystem.averageRetention = memoryStats.avg_retention || 0.0;
      }

      // Efficacité mémoire calculée
      if (this.memorySystem.totalMemories > 0) {
        this.memorySystem.memoryEfficiency =
          (this.memorySystem.activeMemories +
            this.memorySystem.consolidatedMemories) /
          this.memorySystem.totalMemories;
      }

      // Restaurer dernière consolidation
      const lastConsolidation = await this.db.get(`
        SELECT MAX(consolidation_timestamp) as last_consolidation
        FROM alex_memory_consolidation
      `);

      if (lastConsolidation?.last_consolidation) {
        this.consolidationState.lastRun = new Date(
          lastConsolidation.last_consolidation,
        );
      }

      // Force association moyenne
      const associationStats = await this.db.get(`
        SELECT AVG(association_strength) as avg_strength
        FROM alex_memory_associations
        WHERE last_activation > datetime('now', '-30 days')
      `);

      this.memorySystem.associationStrength =
        associationStats?.avg_strength || 0.0;

      logger.info(
        `🔄 Memory state restored: ${this.memorySystem.totalMemories} total, ${this.memorySystem.activeMemories} active, efficiency ${(this.memorySystem.memoryEfficiency * 100).toFixed(1)}%`,
      );
    } catch (error) {
      logger.warn("Could not fully restore memory state:", error);
    }
  }

  /**
   * PROCESSUS CENTRAL: Stockage mémoire authentique
   */
  async storeMemory(memoryData) {
    const memoryId = crypto.randomUUID();
    const timestamp = new Date();

    try {
      // Validation données mémoire
      if (!memoryData.content || !memoryData.memory_type) {
        throw new Error("Memory content and type are required");
      }

      // Calcul importance initiale basée sur contexte
      const initialImportance =
        await this.calculateInitialImportance(memoryData);

      // Détection émotion depuis contexte
      const emotionalAnalysis = this.analyzeEmotionalContent(memoryData);

      // Stockage mémoire principale
      await this.db.run(
        `
        INSERT INTO alex_memories (
          id, memory_type, content, context, emotional_valence, emotional_intensity,
          importance, confidence, retention_strength, domain, tags, source_interaction_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          memoryId,
          memoryData.memory_type || "semantic",
          memoryData.content,
          JSON.stringify(memoryData.context || {}),
          emotionalAnalysis.valence,
          emotionalAnalysis.intensity,
          initialImportance,
          memoryData.confidence || 0.5,
          1.0, // Retention initiale maximale
          memoryData.domain || "general",
          JSON.stringify(memoryData.tags || []),
          memoryData.source_interaction_id || null,
        ],
      );

      // Stockage contexte émotionnel si pertinent
      if (emotionalAnalysis.intensity > 0.3) {
        await this.storeEmotionalContext(
          memoryId,
          emotionalAnalysis,
          memoryData,
        );
      }

      // Recherche associations automatiques
      const associations = await this.findAutomaticAssociations(
        memoryId,
        memoryData,
      );
      await this.createMemoryAssociations(memoryId, associations);

      // Mise à jour statistiques
      this.memorySystem.totalMemories++;
      this.memorySystem.activeMemories++;

      logger.info(
        `💾 Memory stored: ${memoryId} (${memoryData.memory_type}) - Importance: ${initialImportance.toFixed(2)}`,
      );

      this.emit("memory_stored", {
        memoryId,
        memoryType: memoryData.memory_type,
        importance: initialImportance,
        emotionalIntensity: emotionalAnalysis.intensity,
        associationsCreated: associations.length,
        timestamp,
      });

      return memoryId;
    } catch (error) {
      logger.error("Failed to store memory:", error);
      throw error;
    }
  }

  /**
   * Calcul importance initiale AUTHENTIQUE
   */
  async calculateInitialImportance(memoryData) {
    let importance = 0.5; // Base importance

    // Bonus pour contexte riche
    const contextComplexity = memoryData.context
      ? Object.keys(memoryData.context).length / 10
      : 0;
    importance += Math.min(0.2, contextComplexity);

    // Bonus pour contenu technique/spécialisé
    const technicalTerms = (
      memoryData.content.match(
        /\b(algorithm|system|process|method|analysis|technique|approach)\b/gi,
      ) || []
    ).length;
    importance += Math.min(0.15, technicalTerms * 0.03);

    // Bonus pour longueur appropriée
    const contentLength = memoryData.content.length;
    if (contentLength > 50 && contentLength < 500) {
      importance += 0.1;
    }

    // Bonus pour domaine spécialisé
    if (memoryData.domain && memoryData.domain !== "general") {
      importance += 0.1;
    }

    // Bonus pour tags pertinents
    const tagBonus = memoryData.tags
      ? Math.min(0.1, memoryData.tags.length * 0.02)
      : 0;
    importance += tagBonus;

    return Math.min(1.0, importance);
  }

  /**
   * Analyse contenu émotionnel
   */
  analyzeEmotionalContent(memoryData) {
    const content = memoryData.content.toLowerCase();
    let valence = 0.0; // -1 (négatif) à +1 (positif)
    let intensity = 0.0; // 0 (neutre) à 1 (intense)

    // Mots positifs
    const positiveWords =
      /\b(excellent|amazing|great|wonderful|success|achievement|happy|joy|love|brilliant|fantastic|perfect)\b/g;
    const positiveMatches = content.match(positiveWords) || [];
    valence += positiveMatches.length * 0.2;
    intensity += positiveMatches.length * 0.15;

    // Mots négatifs
    const negativeWords =
      /\b(terrible|awful|failed|error|problem|difficulty|frustrated|angry|sad|disappointed|wrong)\b/g;
    const negativeMatches = content.match(negativeWords) || [];
    valence -= negativeMatches.length * 0.2;
    intensity += negativeMatches.length * 0.15;

    // Mots d'intensité émotionnelle
    const intensityWords =
      /\b(extremely|incredibly|absolutely|completely|totally|very|really|quite|somewhat)\b/g;
    const intensityMatches = content.match(intensityWords) || [];
    intensity += intensityMatches.length * 0.1;

    // Contexte émotionnel
    if (memoryData.context?.emotional_context) {
      valence += memoryData.context.emotional_context.valence || 0;
      intensity += memoryData.context.emotional_context.intensity || 0;
    }

    return {
      valence: Math.max(-1.0, Math.min(1.0, valence)),
      intensity: Math.max(0.0, Math.min(1.0, intensity)),
      dominantEmotion:
        valence > 0.2 ? "positive" : valence < -0.2 ? "negative" : "neutral",
    };
  }

  /**
   * Stockage contexte émotionnel
   */
  async storeEmotionalContext(memoryId, emotionalAnalysis, memoryData) {
    await this.db.run(
      `
      INSERT INTO alex_emotional_memory_context (
        memory_id, emotion_type, emotion_intensity, context_tags, impact_on_retention
      ) VALUES (?, ?, ?, ?, ?)
    `,
      [
        memoryId,
        emotionalAnalysis.dominantEmotion,
        emotionalAnalysis.intensity,
        JSON.stringify(memoryData.context?.emotional_tags || []),
        emotionalAnalysis.intensity * this.memoryParameters.emotionalBoost,
      ],
    );
  }

  /**
   * Recherche associations automatiques
   */
  async findAutomaticAssociations(newMemoryId, newMemoryData) {
    const associations = [];

    try {
      // Recherche par similarité de contenu
      const similarMemories = await this.db.all(
        `
        SELECT id, content, importance, memory_type
        FROM alex_memories 
        WHERE id != ? 
        AND is_forgotten = 0
        AND memory_type = ?
        ORDER BY importance DESC, last_accessed DESC
        LIMIT 20
      `,
        [newMemoryId, newMemoryData.memory_type],
      );

      for (const memory of similarMemories) {
        const similarity = this.calculateContentSimilarity(
          newMemoryData.content,
          memory.content,
        );

        if (similarity > 0.3) {
          associations.push({
            targetMemoryId: memory.id,
            type: "content_similarity",
            strength: Math.min(0.8, similarity + memory.importance * 0.2),
          });
        }
      }

      // Recherche par domaine
      if (newMemoryData.domain) {
        const domainMemories = await this.db.all(
          `
          SELECT id, importance
          FROM alex_memories 
          WHERE id != ? 
          AND domain = ?
          AND is_forgotten = 0
          ORDER BY importance DESC
          LIMIT 10
        `,
          [newMemoryId, newMemoryData.domain],
        );

        for (const memory of domainMemories) {
          associations.push({
            targetMemoryId: memory.id,
            type: "domain_relation",
            strength: 0.4 + memory.importance * 0.3,
          });
        }
      }

      // Recherche par tags
      if (newMemoryData.tags && newMemoryData.tags.length > 0) {
        for (const tag of newMemoryData.tags) {
          const tagMemories = await this.db.all(
            `
            SELECT id, importance
            FROM alex_memories 
            WHERE id != ? 
            AND tags LIKE ?
            AND is_forgotten = 0
            LIMIT 5
          `,
            [newMemoryId, `%"${tag}"%`],
          );

          for (const memory of tagMemories) {
            associations.push({
              targetMemoryId: memory.id,
              type: "tag_relation",
              strength: 0.3 + memory.importance * 0.2,
            });
          }
        }
      }
    } catch (error) {
      logger.error("Failed to find automatic associations:", error);
    }

    return associations.slice(0, 10); // Max 10 associations automatiques
  }

  /**
   * Calcul similarité contenu
   */
  calculateContentSimilarity(content1, content2) {
    const words1 = content1
      .toLowerCase()
      .split(" ")
      .filter((w) => w.length > 3);
    const words2 = content2
      .toLowerCase()
      .split(" ")
      .filter((w) => w.length > 3);

    if (words1.length === 0 || words2.length === 0) return 0;

    const intersection = words1.filter((w) => words2.includes(w));
    const union = [...new Set([...words1, ...words2])];

    return intersection.length / union.length;
  }

  /**
   * Création associations mémoire
   */
  async createMemoryAssociations(fromMemoryId, associations) {
    for (const association of associations) {
      try {
        // Vérifier si association existe déjà
        const existing = await this.db.get(
          `
          SELECT id, association_strength 
          FROM alex_memory_associations 
          WHERE memory_id_from = ? AND memory_id_to = ?
        `,
          [fromMemoryId, association.targetMemoryId],
        );

        if (existing) {
          // Renforcer association existante
          const newStrength = Math.min(
            1.0,
            existing.association_strength + association.strength * 0.1,
          );
          await this.db.run(
            `
            UPDATE alex_memory_associations 
            SET association_strength = ?, activation_count = activation_count + 1, last_activation = CURRENT_TIMESTAMP
            WHERE id = ?
          `,
            [newStrength, existing.id],
          );
        } else {
          // Créer nouvelle association
          await this.db.run(
            `
            INSERT INTO alex_memory_associations (
              memory_id_from, memory_id_to, association_type, association_strength
            ) VALUES (?, ?, ?, ?)
          `,
            [
              fromMemoryId,
              association.targetMemoryId,
              association.type,
              association.strength,
            ],
          );
        }
      } catch (error) {
        logger.error("Failed to create memory association:", error);
      }
    }
  }

  /**
   * PROCESSUS CENTRAL: Récupération mémoire intelligente
   */
  async retrieveMemories(query, context = {}) {
    const retrievalId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      // Analyse query de récupération
      const queryAnalysis = this.analyzeRetrievalQuery(query, context);

      // Recherche mémoires pertinentes multi-critères
      const relevantMemories = await this.findRelevantMemories(queryAnalysis);

      // Activation associations pour mémoires trouvées
      const associatedMemories =
        await this.activateMemoryAssociations(relevantMemories);

      // Consolidation résultats avec scoring
      const rankedMemories = this.rankMemoriesByRelevance(
        [...relevantMemories, ...associatedMemories],
        queryAnalysis,
      );

      // Mise à jour statistiques d'accès
      await this.updateMemoryAccessStatistics(rankedMemories.map((m) => m.id));

      // Application forgetting curve
      await this.applyForgettingCurve(rankedMemories.map((m) => m.id));

      const retrievalTime = Date.now() - startTime;

      logger.info(
        `🧠 Memory retrieval: ${rankedMemories.length} memories found (${retrievalTime}ms)`,
      );

      this.emit("memories_retrieved", {
        retrievalId,
        query,
        memoriesFound: rankedMemories.length,
        retrievalTime,
        averageRelevance:
          rankedMemories.reduce((sum, m) => sum + m.relevance_score, 0) /
            rankedMemories.length || 0,
      });

      return rankedMemories.slice(0, 10); // Top 10 mémoires les plus pertinentes
    } catch (error) {
      logger.error("Failed to retrieve memories:", error);
      return [];
    }
  }

  /**
   * Analyse query récupération
   */
  analyzeRetrievalQuery(query, context) {
    return {
      query,
      keywords: this.extractKeywords(query),
      domain: context.domain || this.detectDomain(query),
      complexity: this.calculateQueryComplexity(query),
      emotionalTone: this.analyzeEmotionalTone(query),
      temporalContext: context.temporal_context || "recent",
      specificityLevel: this.analyzeSpecificity(query),
    };
  }

  /**
   * Recherche mémoires pertinentes
   */
  async findRelevantMemories(queryAnalysis) {
    const memories = [];

    try {
      // Recherche par mots-clés dans contenu
      const keywordSearch = await this.db.all(
        `
        SELECT *, 
               (importance * retention_strength * (1 - forgetting_curve_position)) as relevance_base
        FROM alex_memories 
        WHERE is_forgotten = 0 
        AND (${queryAnalysis.keywords.map(() => "content LIKE ?").join(" OR ")})
        ORDER BY relevance_base DESC
        LIMIT 15
      `,
        queryAnalysis.keywords.map((k) => `%${k}%`),
      );

      memories.push(...keywordSearch);

      // Recherche par domaine si spécifié
      if (queryAnalysis.domain !== "general") {
        const domainSearch = await this.db.all(
          `
          SELECT *, 
                 (importance * retention_strength * 0.8) as relevance_base
          FROM alex_memories 
          WHERE is_forgotten = 0 
          AND domain = ?
          ORDER BY relevance_base DESC
          LIMIT 10
        `,
          [queryAnalysis.domain],
        );

        memories.push(...domainSearch);
      }

      // Recherche par type si contexte émotionnel
      if (queryAnalysis.emotionalTone !== "neutral") {
        const emotionalSearch = await this.db.all(
          `
          SELECT m.*, 
                 (m.importance * m.retention_strength * ABS(m.emotional_valence)) as relevance_base
          FROM alex_memories m
          LEFT JOIN alex_emotional_memory_context ec ON m.id = ec.memory_id
          WHERE m.is_forgotten = 0 
          AND (ec.emotion_type = ? OR m.emotional_intensity > 0.5)
          ORDER BY relevance_base DESC
          LIMIT 8
        `,
          [queryAnalysis.emotionalTone],
        );

        memories.push(...emotionalSearch);
      }

      // Déduplication par ID
      const uniqueMemories = memories.filter(
        (memory, index, self) =>
          index === self.findIndex((m) => m.id === memory.id),
      );

      return uniqueMemories;
    } catch (error) {
      logger.error("Failed to find relevant memories:", error);
      return [];
    }
  }

  /**
   * Activation associations mémoire
   */
  async activateMemoryAssociations(primaryMemories) {
    const associatedMemories = [];

    try {
      for (const memory of primaryMemories.slice(0, 5)) {
        // Top 5 seulement pour éviter explosion
        const associations = await this.db.all(
          `
          SELECT m.*, a.association_strength,
                 (m.importance * m.retention_strength * a.association_strength) as relevance_base
          FROM alex_memory_associations a
          JOIN alex_memories m ON a.memory_id_to = m.id
          WHERE a.memory_id_from = ? 
          AND m.is_forgotten = 0
          AND a.association_strength > 0.3
          ORDER BY relevance_base DESC
          LIMIT 5
        `,
          [memory.id],
        );

        // Mise à jour compteur activation association
        for (const assoc of associations) {
          await this.db.run(
            `
            UPDATE alex_memory_associations 
            SET activation_count = activation_count + 1, last_activation = CURRENT_TIMESTAMP
            WHERE memory_id_from = ? AND memory_id_to = ?
          `,
            [memory.id, assoc.id],
          );
        }

        associatedMemories.push(...associations);
      }
    } catch (error) {
      logger.error("Failed to activate memory associations:", error);
    }

    return associatedMemories;
  }

  /**
   * Classement mémoires par pertinence
   */
  rankMemoriesByRelevance(memories, queryAnalysis) {
    return memories
      .map((memory) => {
        let relevanceScore = memory.relevance_base || 0.5;

        // Bonus récence
        const daysSinceAccess =
          (Date.now() - new Date(memory.last_accessed).getTime()) /
          (24 * 60 * 60 * 1000);
        const recencyBonus = Math.max(0, 0.2 - daysSinceAccess * 0.01);
        relevanceScore += recencyBonus;

        // Bonus fréquence accès
        const accessBonus = Math.min(0.15, memory.access_count * 0.005);
        relevanceScore += accessBonus;

        // Bonus consolidation
        const consolidationBonus = memory.consolidation_level * 0.1;
        relevanceScore += consolidationBonus;

        // Bonus association (si présent)
        const associationBonus = memory.association_strength
          ? memory.association_strength * 0.12
          : 0;
        relevanceScore += associationBonus;

        return {
          ...memory,
          relevance_score: Math.min(1.0, relevanceScore),
          retrieval_reason: this.generateRetrievalReason(memory, queryAnalysis),
        };
      })
      .sort((a, b) => b.relevance_score - a.relevance_score);
  }

  /**
   * Génération raison récupération
   */
  generateRetrievalReason(memory, queryAnalysis) {
    const reasons = [];

    if (memory.association_strength) {
      reasons.push(
        `Association (${(memory.association_strength * 100).toFixed(0)}%)`,
      );
    }

    if (memory.domain === queryAnalysis.domain) {
      reasons.push("Même domaine");
    }

    if (memory.access_count > 5) {
      reasons.push("Fréquemment utilisé");
    }

    if (memory.importance > 0.7) {
      reasons.push("Haute importance");
    }

    if (memory.consolidation_level > 0.5) {
      reasons.push("Consolidé");
    }

    return reasons.length > 0 ? reasons.join(", ") : "Pertinence générale";
  }

  /**
   * Mise à jour statistiques accès
   */
  async updateMemoryAccessStatistics(memoryIds) {
    if (memoryIds.length === 0) return;

    const placeholders = memoryIds.map(() => "?").join(",");

    await this.db.run(
      `
      UPDATE alex_memories 
      SET access_count = access_count + 1, 
          last_accessed = CURRENT_TIMESTAMP,
          retention_strength = MIN(1.0, retention_strength + ?)
      WHERE id IN (${placeholders})
    `,
      [this.memoryParameters.repetitionStrengthening, ...memoryIds],
    );
  }

  /**
   * Application courbe oubli
   */
  async applyForgettingCurve(memoryIds) {
    if (memoryIds.length === 0) return;

    const placeholders = memoryIds.map(() => "?").join(",");

    // Application dégradation naturelle
    await this.db.run(
      `
      UPDATE alex_memories 
      SET forgetting_curve_position = MIN(1.0, forgetting_curve_position + ?),
          retention_strength = MAX(0.1, retention_strength - ?)
      WHERE id IN (${placeholders})
      AND last_accessed < datetime('now', '-1 day')
    `,
      [
        this.memoryParameters.forgettingRate,
        this.memoryParameters.forgettingRate * 0.5,
        ...memoryIds,
      ],
    );
  }

  /**
   * Initialisation système consolidation
   */
  async initializeConsolidationSystem() {
    // Configuration initiale du système de consolidation
    logger.info("🧠 Memory consolidation system initialized");
  }

  /**
   * PROCESSUS AUTONOME: Consolidation mémoire
   */
  async performMemoryConsolidation() {
    if (this.consolidationState.isActive) return;

    this.consolidationState.isActive = true;
    const sessionId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      logger.info("🏛️ Starting memory consolidation session...");

      // 1. Identification mémoires candidates à consolidation
      const candidates = await this.identifyConsolidationCandidates();

      // 2. Consolidation par importance et patterns
      const consolidatedMemories = await this.consolidateMemoriesByImportance(
        sessionId,
        candidates,
      );

      // 3. Détection nouveaux patterns
      const newPatterns = await this.detectMemoryPatterns(candidates);

      // 4. Création associations émergentes
      const newAssociations = await this.createEmergentAssociations(candidates);

      // 5. Optimisation forgetting curve
      const forgottenMemories = await this.optimizeForgettingProcess();

      // Mise à jour état consolidation
      this.consolidationState.memoriesProcessed = candidates.length;
      this.consolidationState.associationsCreated = newAssociations;
      this.consolidationState.memoriesConsolidated = consolidatedMemories;
      this.consolidationState.memoriesForgotten = forgottenMemories;
      this.consolidationState.lastRun = new Date();

      const processingTime = Date.now() - startTime;

      logger.info(
        `✨ Memory consolidation completed: ${consolidatedMemories} consolidated, ${newPatterns} patterns, ${newAssociations} associations (${processingTime}ms)`,
      );

      this.emit("memory_consolidation_complete", {
        sessionId,
        memoriesProcessed: candidates.length,
        memoriesConsolidated: consolidatedMemories,
        patternsDetected: newPatterns,
        associationsCreated: newAssociations,
        memoriesForgotten: forgottenMemories,
        processingTime,
      });
    } catch (error) {
      logger.error("Memory consolidation failed:", error);
    } finally {
      this.consolidationState.isActive = false;
    }
  }

  /**
   * Identification candidats consolidation
   */
  async identifyConsolidationCandidates() {
    const candidates = await this.db.all(`
      SELECT * FROM alex_memories 
      WHERE is_forgotten = 0 
      AND is_consolidated = 0
      AND (
        access_count >= 3 
        OR importance > 0.6 
        OR retention_strength > 0.7
        OR last_accessed > datetime('now', '-7 days')
      )
      ORDER BY importance DESC, access_count DESC
      LIMIT 50
    `);

    return candidates;
  }

  /**
   * Consolidation par importance
   */
  async consolidateMemoriesByImportance(sessionId, candidates) {
    let consolidatedCount = 0;

    for (const memory of candidates) {
      // Calcul nouveau score consolidation
      const consolidationScore = this.calculateConsolidationScore(memory);

      if (consolidationScore > this.memoryParameters.consolidationThreshold) {
        const beforeImportance = memory.importance;
        const beforeRetention = memory.retention_strength;

        // Amélioration mémoire
        const newImportance = Math.min(
          1.0,
          memory.importance + consolidationScore * 0.1,
        );
        const newRetention = Math.min(
          1.0,
          memory.retention_strength + consolidationScore * 0.15,
        );
        const newConsolidationLevel = Math.min(
          1.0,
          (memory.consolidation_level || 0) + consolidationScore,
        );

        // Mise à jour mémoire
        await this.db.run(
          `
          UPDATE alex_memories 
          SET importance = ?, retention_strength = ?, consolidation_level = ?, 
              is_consolidated = ?, last_strengthened = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
          [
            newImportance,
            newRetention,
            newConsolidationLevel,
            newConsolidationLevel > 0.8 ? 1 : 0,
            memory.id,
          ],
        );

        // Enregistrement consolidation
        await this.db.run(
          `
          INSERT INTO alex_memory_consolidation (
            consolidation_session_id, memory_id, before_importance, after_importance,
            before_retention, after_retention, consolidation_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            sessionId,
            memory.id,
            beforeImportance,
            newImportance,
            beforeRetention,
            newRetention,
            "importance_based",
          ],
        );

        consolidatedCount++;
      }
    }

    return consolidatedCount;
  }

  /**
   * Calcul score consolidation
   */
  calculateConsolidationScore(memory) {
    let score = 0.0;

    // Score base importance
    score += memory.importance * 0.3;

    // Score accès fréquent
    const accessScore = Math.min(0.3, memory.access_count * 0.02);
    score += accessScore;

    // Score récence
    const daysSinceAccess =
      (Date.now() - new Date(memory.last_accessed).getTime()) /
      (24 * 60 * 60 * 1000);
    const recencyScore = Math.max(0, 0.2 - daysSinceAccess * 0.02);
    score += recencyScore;

    // Score émotionnel
    const emotionalScore =
      Math.abs(memory.emotional_valence || 0) *
      memory.emotional_intensity *
      0.15;
    score += emotionalScore;

    // Score rétention
    score += (memory.retention_strength || 0) * 0.1;

    return Math.min(1.0, score);
  }

  /**
   * Détection patterns mémoire
   */
  async detectMemoryPatterns(memories) {
    let patternsDetected = 0;

    // Groupement par domaine
    const domainGroups = {};
    for (const memory of memories) {
      if (!domainGroups[memory.domain]) {
        domainGroups[memory.domain] = [];
      }
      domainGroups[memory.domain].push(memory);
    }

    // Détection patterns par domaine
    for (const [domain, domainMemories] of Object.entries(domainGroups)) {
      if (domainMemories.length >= 3) {
        // Calcul force pattern
        const patternStrength =
          domainMemories.reduce((sum, m) => sum + m.importance, 0) /
          domainMemories.length;

        if (patternStrength > 0.5) {
          // Création pattern
          await this.db.run(
            `
            INSERT OR REPLACE INTO alex_memory_patterns (
              pattern_name, pattern_type, memory_ids, pattern_strength, activation_frequency
            ) VALUES (?, ?, ?, ?, ?)
          `,
            [
              `domain_${domain}`,
              "domain_clustering",
              JSON.stringify(domainMemories.map((m) => m.id)),
              patternStrength,
              1,
            ],
          );

          patternsDetected++;
        }
      }
    }

    return patternsDetected;
  }

  /**
   * Création associations émergentes
   */
  async createEmergentAssociations(memories) {
    let associationsCreated = 0;

    // Recherche co-occurrences temporelles
    for (let i = 0; i < memories.length - 1; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const memory1 = memories[i];
        const memory2 = memories[j];

        // Vérifier proximité temporelle
        const timeDiff = Math.abs(
          new Date(memory1.created_at).getTime() -
            new Date(memory2.created_at).getTime(),
        );
        const hoursApart = timeDiff / (60 * 60 * 1000);

        if (hoursApart < 24 && memory1.domain === memory2.domain) {
          const associationStrength =
            0.3 + (memory1.importance + memory2.importance) / 4;

          // Créer association bidirectionnelle
          await this.createMemoryAssociations(memory1.id, [
            {
              targetMemoryId: memory2.id,
              type: "temporal_proximity",
              strength: associationStrength,
            },
          ]);

          await this.createMemoryAssociations(memory2.id, [
            {
              targetMemoryId: memory1.id,
              type: "temporal_proximity",
              strength: associationStrength,
            },
          ]);

          associationsCreated += 2;
        }
      }
    }

    return associationsCreated;
  }

  /**
   * Optimisation processus oubli
   */
  async optimizeForgettingProcess() {
    // Identifier mémoires candidates à l'oubli
    const forgettingCandidates = await this.db.all(`
      SELECT * FROM alex_memories 
      WHERE is_forgotten = 0 
      AND forgetting_curve_position > 0.8
      AND retention_strength < 0.3
      AND access_count = 0
      AND last_accessed < datetime('now', '-30 days')
      AND importance < 0.4
    `);

    let forgottenCount = 0;

    for (const memory of forgettingCandidates) {
      // Marquer comme oublié
      await this.db.run(
        `
        UPDATE alex_memories 
        SET is_forgotten = 1, forgetting_curve_position = 1.0
        WHERE id = ?
      `,
        [memory.id],
      );

      // Affaiblir associations
      await this.db.run(
        `
        UPDATE alex_memory_associations 
        SET association_strength = association_strength * 0.5
        WHERE memory_id_from = ? OR memory_id_to = ?
      `,
        [memory.id, memory.id],
      );

      forgottenCount++;
    }

    // Mise à jour statistiques système
    this.memorySystem.activeMemories -= forgottenCount;
    this.memorySystem.forgottenMemories += forgottenCount;

    return forgottenCount;
  }

  /**
   * Processus autonomes mémoire
   */
  startAutonomousMemoryProcesses() {
    // Consolidation quotidienne
    setInterval(async () => {
      await this.performMemoryConsolidation();
    }, 86400000); // 24 heures

    // Maintenance mémoire toutes les 6 heures
    setInterval(async () => {
      await this.performMemoryMaintenance();
    }, 21600000); // 6 heures

    // Optimisation associations toutes les 12 heures
    setInterval(async () => {
      await this.optimizeMemoryAssociations();
    }, 43200000); // 12 heures

    // Statistiques quotidiennes
    setInterval(async () => {
      await this.generateDailyMemoryStatistics();
    }, 86400000); // 24 heures

    logger.info("⚡ Autonomous memory processes started for MemoryPalace");
  }

  /**
   * Maintenance générale mémoire
   */
  async performMemoryMaintenance() {
    try {
      // Nettoyage associations faibles
      const weakAssociations = await this.db.run(`
        DELETE FROM alex_memory_associations 
        WHERE association_strength < 0.1 
        AND activation_count = 0 
        AND last_activation < datetime('now', '-60 days')
      `);

      // Mise à jour efficacité mémoire
      const memoryStats = await this.db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_forgotten = 0 THEN 1 ELSE 0 END) as active,
          AVG(retention_strength) as avg_retention
        FROM alex_memories
      `);

      this.memorySystem.totalMemories = memoryStats.total;
      this.memorySystem.activeMemories = memoryStats.active;
      this.memorySystem.averageRetention = memoryStats.avg_retention;
      this.memorySystem.memoryEfficiency =
        memoryStats.active / memoryStats.total;

      logger.info(
        `🧹 Memory maintenance completed - ${weakAssociations.changes} weak associations removed`,
      );
    } catch (error) {
      logger.error("Memory maintenance failed:", error);
    }
  }

  /**
   * Optimisation associations mémoire
   */
  async optimizeMemoryAssociations() {
    try {
      // Renforcer associations fréquemment activées
      await this.db.run(`
        UPDATE alex_memory_associations 
        SET association_strength = MIN(1.0, association_strength * 1.1)
        WHERE activation_count > 5 
        AND last_activation > datetime('now', '-30 days')
      `);

      logger.info("🔗 Memory associations optimized");
    } catch (error) {
      logger.error("Memory associations optimization failed:", error);
    }
  }

  /**
   * Génération statistiques quotidiennes
   */
  async generateDailyMemoryStatistics() {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Calculer statistiques du jour
      const stats = await this.db.get(`
        SELECT 
          COUNT(*) as total_memories,
          SUM(CASE WHEN is_forgotten = 0 THEN 1 ELSE 0 END) as active_memories,
          SUM(CASE WHEN is_consolidated = 1 THEN 1 ELSE 0 END) as consolidated_memories,
          SUM(CASE WHEN is_forgotten = 1 THEN 1 ELSE 0 END) as forgotten_memories,
          AVG(retention_strength) as avg_retention
        FROM alex_memories
      `);

      const associationStats = await this.db.get(`
        SELECT COUNT(*) as total_associations
        FROM alex_memory_associations
        WHERE created_at >= date('now')
      `);

      // Insérer statistiques
      await this.db.run(
        `
        INSERT OR REPLACE INTO alex_memory_statistics (
          stat_date, total_memories, active_memories, consolidated_memories,
          forgotten_memories, average_retention, memory_efficiency, associations_formed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          today,
          stats.total_memories,
          stats.active_memories,
          stats.consolidated_memories,
          stats.forgotten_memories,
          stats.avg_retention,
          stats.active_memories / stats.total_memories,
          associationStats.total_associations,
        ],
      );

      logger.info(`📊 Daily memory statistics generated for ${today}`);
    } catch (error) {
      logger.error("Failed to generate daily statistics:", error);
    }
  }

  /**
   * Fonctions utilitaires
   */
  extractKeywords(text) {
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const stopWords = [
      "that",
      "with",
      "have",
      "this",
      "will",
      "from",
      "they",
      "know",
      "want",
    ];
    return words.filter((word) => !stopWords.includes(word)).slice(0, 8);
  }

  detectDomain(text) {
    const domains = {
      technology: ["tech", "software", "code", "AI", "algorithm", "system"],
      business: ["market", "finance", "company", "strategy", "customer"],
      science: ["research", "study", "analysis", "method", "theory"],
      education: ["learn", "knowledge", "skill", "training", "development"],
    };

    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some((keyword) => text.toLowerCase().includes(keyword))) {
        return domain;
      }
    }

    return "general";
  }

  calculateQueryComplexity(query) {
    const factors = [
      query.length / 200,
      (query.match(/\b(why|how|analyze|explain|complex)\b/gi) || []).length / 5,
      (query.match(/\?/g) || []).length / 3,
    ];

    return Math.min(
      1.0,
      factors.reduce((sum, f) => sum + f, 0) / factors.length,
    );
  }

  analyzeEmotionalTone(text) {
    if (/\b(great|excellent|amazing|love)\b/i.test(text)) return "positive";
    if (/\b(bad|terrible|hate|angry)\b/i.test(text)) return "negative";
    return "neutral";
  }

  analyzeSpecificity(query) {
    const specificWords =
      /\b(specific|exactly|precisely|particular|detail)\b/gi;
    return (query.match(specificWords) || []).length > 0 ? "high" : "medium";
  }

  /**
   * API principale - Statut mémoire
   */
  async getMemoryPalaceStatus() {
    const associationStats = await this.db.get(
      "SELECT COUNT(*) as total, AVG(association_strength) as avg_strength FROM alex_memory_associations",
    );
    const patternStats = await this.db.get(
      "SELECT COUNT(*) as total FROM alex_memory_patterns",
    );
    const recentActivity = await this.db.get(
      'SELECT COUNT(*) as recent FROM alex_memories WHERE last_accessed > datetime("now", "-7 days")',
    );

    return {
      name: this.name,
      version: this.version,
      isInitialized: this.isInitialized,

      memorySystem: this.memorySystem,

      memoryParameters: this.memoryParameters,

      consolidationState: this.consolidationState,

      memoryTypes: Object.keys(this.memoryTypes),

      statistics: {
        totalMemories: this.memorySystem.totalMemories,
        activeMemories: this.memorySystem.activeMemories,
        consolidatedMemories: this.memorySystem.consolidatedMemories,
        forgottenMemories: this.memorySystem.forgottenMemories,
        totalAssociations: associationStats.total,
        averageAssociationStrength: associationStats.avg_strength,
        totalPatterns: patternStats.total,
        recentActivity: recentActivity.recent,
        memoryEfficiency: this.memorySystem.memoryEfficiency,
        averageRetention: this.memorySystem.averageRetention,
      },

      capabilities: {
        dynamicImportance: true,
        emotionalMemory: true,
        automaticAssociations: true,
        forgettingCurves: true,
        patternDetection: true,
        memoryConsolidation: true,
        autonomousOptimization: true,
      },

      compliance: {
        sqliteDatabase: true,
        noStaticMaps: true,
        evolutiveImportance: true,
        intelligentForgetting: true,
        realAssociations: true,
      },
    };
  }

  /**
   * Fermeture propre
   */
  async close() {
    if (this.db) {
      await this.db.close();
      logger.info("🏛️ Memory Palace database closed properly");
    }
  }
}

// Export singleton pour compatibilité
export default new MemoryPalace();
