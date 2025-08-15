/**
 * MemoryPalace.js - Système de mémoire vectorielle pour Alex
 * Palier 2 - Mémoire & Décision
 */
import crypto from 'crypto'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { EventEmitter } from 'events'
import logger from '../../config/logger.js'

export class MemoryPalace extends EventEmitter {
  constructor(config = {}) {
    super()
    
    this.name = 'MemoryPalace'
    this.version = '2.0.0'
    // Railway-compatible path detection
    const isRailway = process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN || (process.env.PORT && !process.env.LOCALDEV)
    this.dbPath = config.dbPath || (isRailway ? '/tmp/alex_memory_palace.db' : './data/alex_memory_palace.db')
    this.db = null
    this.isInitialized = false
    
    // Configuration mémoire
    this.config = {
      maxMemories: config.maxMemories || 10000,
      retentionDays: config.retentionDays || 30,
      consolidationThreshold: config.consolidationThreshold || 0.7,
      associationStrength: config.associationStrength || 0.5,
      ...config
    }
    
    // Métriques mémoire
    this.metrics = {
      totalMemories: 0,
      activeMemories: 0,
      consolidatedMemories: 0,
      queriesProcessed: 0,
      averageRetrieval: 0
    }
  }

  /**
   * Initialise le système de mémoire
   */
  async initialize() {
    try {
      logger.info('🧠 Initializing MemoryPalace...')
      
      // Connexion SQLite
      await this.connectToDatabase()
      
      // Création des tables
      await this.createMemoryTables()
      
      // Restauration des métriques
      await this.restoreMemoryMetrics()
      
      this.isInitialized = true
      logger.info(`✅ MemoryPalace initialized - ${this.metrics.totalMemories} memories loaded`)
      
      this.emit('memory_palace_ready', {
        version: this.version,
        totalMemories: this.metrics.totalMemories,
        activeMemories: this.metrics.activeMemories
      })
      
      return this
    } catch (error) {
      logger.error('Failed to initialize MemoryPalace:', error)
      throw error
    }
  }

  /**
   * Connexion à la base SQLite
   */
  async connectToDatabase() {
    try {
      // Ensure directory exists for development environment
      const isRailway = process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN || (process.env.PORT && !process.env.LOCALDEV)
      if (!isRailway) {
        const fs = await import('fs/promises')
        const path = await import('path')
        const dbDir = path.dirname(this.dbPath)
        try {
          await fs.access(dbDir)
        } catch {
          await fs.mkdir(dbDir, { recursive: true })
          logger.info(`📁 Created directory: ${dbDir}`)
        }
      }

      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      })
      logger.info(`📊 MemoryPalace database connected: ${this.dbPath}`)
    } catch (error) {
      logger.error('Failed to connect MemoryPalace database:', error)
      throw new Error(`MemoryPalace SQLite connection failed: ${error.message}`)
    }
  }

  /**
   * Création des tables mémoire
   */
  async createMemoryTables() {
    const tables = [
      // Table des souvenirs
      `CREATE TABLE IF NOT EXISTS alex_memories (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        context TEXT,
        emotion TEXT DEFAULT 'neutral',
        importance REAL DEFAULT 0.5,
        confidence REAL DEFAULT 0.5,
        access_count INTEGER DEFAULT 0,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tags TEXT,
        associated_memories TEXT,
        is_consolidated BOOLEAN DEFAULT 0
      )`,
      
      // Table des associations mémoire
      `CREATE TABLE IF NOT EXISTS alex_memory_associations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_id_1 TEXT NOT NULL,
        memory_id_2 TEXT NOT NULL,
        strength REAL DEFAULT 0.5,
        association_type TEXT DEFAULT 'semantic',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (memory_id_1) REFERENCES alex_memories(id),
        FOREIGN KEY (memory_id_2) REFERENCES alex_memories(id)
      )`,
      
      // Table des contextes conversationnels
      `CREATE TABLE IF NOT EXISTS alex_conversation_contexts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        turn_number INTEGER NOT NULL,
        user_input TEXT NOT NULL,
        alex_response TEXT NOT NULL,
        context_summary TEXT,
        emotions_detected TEXT,
        importance REAL DEFAULT 0.5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ]

    for (const tableSQL of tables) {
      await this.db.exec(tableSQL)
    }
    
    logger.info('🏗️ MemoryPalace tables created successfully')
  }

  /**
   * Restauration des métriques depuis la base
   */
  async restoreMemoryMetrics() {
    try {
      const totalMemories = await this.db.get('SELECT COUNT(*) as count FROM alex_memories')
      const activeMemories = await this.db.get(
        'SELECT COUNT(*) as count FROM alex_memories WHERE last_accessed > datetime("now", "-7 days")'
      )
      const consolidatedMemories = await this.db.get(
        'SELECT COUNT(*) as count FROM alex_memories WHERE is_consolidated = 1'
      )

      this.metrics.totalMemories = totalMemories.count
      this.metrics.activeMemories = activeMemories.count
      this.metrics.consolidatedMemories = consolidatedMemories.count
    } catch (error) {
      logger.warn('Could not restore memory metrics:', error)
    }
  }

  /**
   * Stockage d'un nouveau souvenir
   */
  async storeMemory(content, context = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const memoryId = crypto.randomUUID()
    const importance = this.calculateImportance(content, context)
    const emotion = this.detectEmotion(content)
    
    try {
      await this.db.run(
        `INSERT INTO alex_memories (
          id, content, context, emotion, importance, tags, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          memoryId,
          content,
          JSON.stringify(context),
          emotion,
          importance,
          this.extractTags(content).join(',')
        ]
      )

      // Recherche d'associations avec mémoires existantes
      await this.createAssociations(memoryId, content)
      
      this.metrics.totalMemories++
      
      this.emit('memory_stored', {
        id: memoryId,
        content: content.substring(0, 100) + '...',
        importance,
        emotion
      })

      logger.info(`💾 Memory stored: ${memoryId} (importance: ${importance.toFixed(2)})`)
      
      return memoryId
    } catch (error) {
      logger.error('Failed to store memory:', error)
      throw error
    }
  }

  /**
   * Récupération de souvenirs pertinents
   */
  async retrieveMemories(query, limit = 5) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const queryLower = query.toLowerCase()
    const keywords = this.extractKeywords(query)
    
    try {
      // Recherche par similarité de contenu et tags
      const memories = await this.db.all(
        `SELECT * FROM alex_memories 
         WHERE (
           content LIKE ? OR
           tags LIKE ? OR
           context LIKE ?
         )
         ORDER BY 
           importance DESC,
           access_count DESC,
           created_at DESC
         LIMIT ?`,
        [
          `%${queryLower}%`,
          `%${keywords.join('%')}%`,
          `%${queryLower}%`,
          limit
        ]
      )

      // Mise à jour du compteur d'accès
      for (const memory of memories) {
        await this.db.run(
          'UPDATE alex_memories SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP WHERE id = ?',
          [memory.id]
        )
      }

      this.metrics.queriesProcessed++
      
      logger.info(`🔍 Retrieved ${memories.length} memories for query: "${query.substring(0, 50)}..."`)
      
      return memories.map(memory => ({
        id: memory.id,
        content: memory.content,
        context: JSON.parse(memory.context || '{}'),
        emotion: memory.emotion,
        importance: memory.importance,
        confidence: memory.confidence,
        accessCount: memory.access_count,
        tags: memory.tags ? memory.tags.split(',') : [],
        createdAt: memory.created_at
      }))
    } catch (error) {
      logger.error('Failed to retrieve memories:', error)
      return []
    }
  }

  /**
   * Stockage du contexte conversationnel
   */
  async storeConversationContext(sessionId, turnNumber, userInput, alexResponse, contextSummary = '') {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const importance = this.calculateConversationImportance(userInput, alexResponse)
      const emotions = this.detectEmotion(userInput)

      await this.db.run(
        `INSERT INTO alex_conversation_contexts (
          session_id, turn_number, user_input, alex_response, 
          context_summary, emotions_detected, importance
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sessionId, turnNumber, userInput, alexResponse, contextSummary, emotions, importance]
      )

      // Stocker aussi comme mémoire si important
      if (importance > 0.6) {
        await this.storeMemory(
          `Conversation: ${userInput} → ${alexResponse}`,
          { sessionId, turnNumber, type: 'conversation' }
        )
      }

      logger.info(`💬 Conversation context stored: session ${sessionId}, turn ${turnNumber}`)
    } catch (error) {
      logger.error('Failed to store conversation context:', error)
    }
  }

  /**
   * Récupération du contexte conversationnel
   */
  async getConversationContext(sessionId, limit = 10) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const contexts = await this.db.all(
        `SELECT * FROM alex_conversation_contexts 
         WHERE session_id = ? 
         ORDER BY turn_number DESC 
         LIMIT ?`,
        [sessionId, limit]
      )

      return contexts.reverse() // Ordre chronologique
    } catch (error) {
      logger.error('Failed to get conversation context:', error)
      return []
    }
  }

  /**
   * Consolidation des mémoires importantes
   */
  async consolidateMemories() {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Consolider les mémoires avec haute importance et accès fréquent
      const result = await this.db.run(
        `UPDATE alex_memories 
         SET is_consolidated = 1 
         WHERE importance > ? AND access_count > 3 AND is_consolidated = 0`,
        [this.config.consolidationThreshold]
      )

      this.metrics.consolidatedMemories += result.changes || 0
      
      logger.info(`🔄 Consolidated ${result.changes || 0} memories`)
      
      return result.changes || 0
    } catch (error) {
      logger.error('Failed to consolidate memories:', error)
      return 0
    }
  }

  /**
   * Nettoyage des mémoires anciennes peu importantes
   */
  async cleanupOldMemories() {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const result = await this.db.run(
        `DELETE FROM alex_memories 
         WHERE importance < 0.3 
         AND access_count < 2 
         AND created_at < datetime('now', '-${this.config.retentionDays} days')
         AND is_consolidated = 0`
      )

      this.metrics.totalMemories -= result.changes || 0
      
      logger.info(`🧹 Cleaned up ${result.changes || 0} old memories`)
      
      return result.changes || 0
    } catch (error) {
      logger.error('Failed to cleanup old memories:', error)
      return 0
    }
  }

  /**
   * Calcul de l'importance d'un contenu
   */
  calculateImportance(content, context) {
    let importance = 0.5

    // Longueur du contenu
    importance += Math.min(0.2, content.length / 1000)

    // Mots-clés importants
    const importantKeywords = ['important', 'critique', 'urgent', 'remember', 'retenir']
    const hasImportantKeywords = importantKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    )
    if (hasImportantKeywords) importance += 0.2

    // Contexte émotionnel
    const emotion = this.detectEmotion(content)
    if (['joy', 'surprise', 'anger'].includes(emotion)) {
      importance += 0.1
    }

    // Questions complexes
    if (content.includes('?') && content.length > 50) {
      importance += 0.1
    }

    return Math.min(1.0, importance)
  }

  /**
   * Calcul de l'importance d'une conversation
   */
  calculateConversationImportance(userInput, alexResponse) {
    let importance = 0.4

    // Longueur des échanges
    const totalLength = userInput.length + alexResponse.length
    importance += Math.min(0.3, totalLength / 500)

    // Complexité de la question
    if (userInput.includes('comment') || userInput.includes('pourquoi')) {
      importance += 0.2
    }

    // Réponse détaillée d'Alex
    if (alexResponse.length > 200) {
      importance += 0.1
    }

    return Math.min(1.0, importance)
  }

  /**
   * Détection d'émotion simple
   */
  detectEmotion(text) {
    const textLower = text.toLowerCase()

    if (textLower.match(/\b(heureux|joie|content|génial|super|excellent)\b/)) return 'joy'
    if (textLower.match(/\b(triste|déprimé|malheureux|déçu)\b/)) return 'sadness'
    if (textLower.match(/\b(en colère|énervé|furieux|irrité)\b/)) return 'anger'
    if (textLower.match(/\b(peur|anxieux|inquiet|stressé)\b/)) return 'fear'
    if (textLower.match(/\b(surpris|étonné|wow|incroyable)\b/)) return 'surprise'

    return 'neutral'
  }

  /**
   * Extraction de mots-clés
   */
  extractKeywords(text) {
    const words = text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .filter(word => !['that', 'with', 'have', 'this', 'will', 'from', 'they', 'been', 'said', 'each', 'which', 'what', 'comment', 'pour', 'avec', 'dans', 'mais', 'cette', 'tout', 'sont', 'fait', 'peut', 'aussi'].includes(word))

    return [...new Set(words)].slice(0, 5)
  }

  /**
   * Extraction de tags
   */
  extractTags(content) {
    const keywords = this.extractKeywords(content)
    const emotion = this.detectEmotion(content)
    
    const tags = [...keywords]
    if (emotion !== 'neutral') tags.push(emotion)
    
    // Tags basés sur le type de contenu
    if (content.includes('?')) tags.push('question')
    if (content.length > 500) tags.push('detailed')
    if (content.match(/\b(code|programming|script)\b/i)) tags.push('technical')
    
    return tags
  }

  /**
   * Création d'associations entre mémoires
   */
  async createAssociations(memoryId, content) {
    try {
      const keywords = this.extractKeywords(content)
      
      // Recherche de mémoires similaires
      const similarMemories = await this.db.all(
        `SELECT id, content FROM alex_memories 
         WHERE id != ? AND (
           ${keywords.map(() => 'content LIKE ?').join(' OR ')}
         )
         ORDER BY importance DESC
         LIMIT 3`,
        [memoryId, ...keywords.map(k => `%${k}%`)]
      )

      // Création des associations
      for (const similar of similarMemories) {
        const strength = this.calculateAssociationStrength(content, similar.content)
        
        if (strength > 0.3) {
          await this.db.run(
            'INSERT INTO alex_memory_associations (memory_id_1, memory_id_2, strength, association_type) VALUES (?, ?, ?, ?)',
            [memoryId, similar.id, strength, 'semantic']
          )
        }
      }
    } catch (error) {
      logger.warn('Failed to create memory associations:', error)
    }
  }

  /**
   * Calcul de la force d'association
   */
  calculateAssociationStrength(content1, content2) {
    const keywords1 = new Set(this.extractKeywords(content1))
    const keywords2 = new Set(this.extractKeywords(content2))
    
    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)))
    const union = new Set([...keywords1, ...keywords2])
    
    return intersection.size / union.size
  }

  /**
   * Obtention du statut de la mémoire
   */
  getMemoryStatus() {
    return {
      name: this.name,
      version: this.version,
      isInitialized: this.isInitialized,
      metrics: { ...this.metrics },
      config: { ...this.config }
    }
  }

  /**
   * Fermeture propre
   */
  async close() {
    if (this.db) {
      await this.db.close()
      logger.info('📊 MemoryPalace database closed properly')
    }
  }
}

// Export singleton
export default new MemoryPalace()