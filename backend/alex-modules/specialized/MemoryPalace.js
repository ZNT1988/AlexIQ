import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../config/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');

export class MemoryPalace extends EventEmitter {
  constructor() {
    super();
    this.version = '1.0.0';
    this.name = 'Memory Palace';
    this.initialized = false;
    this.memories = new Map();
    this.associations = new Map();
    this.memoryFile = path.join(DATA_DIR, 'memory_palace.json');
  }

  async initialize() {
    try {
      logger.info('Initializing Memory Palace...');
      
      // Ensure data directory exists
      await fs.mkdir(DATA_DIR, { recursive: true });
      
      // Load existing memories
      await this.loadMemories();
      
      this.initialized = true;
      logger.info(`✅ Memory Palace initialized with ${this.memories.size} memories`);
    } catch (error) {
      logger.error('❌ Failed to initialize Memory Palace:', error);
      throw error;
    }
  }

  async loadMemories() {
    try {
      const data = await fs.readFile(this.memoryFile, 'utf8');
      const savedData = JSON.parse(data);
      
      this.memories = new Map(savedData.memories || []);
      this.associations = new Map(savedData.associations || []);
    } catch (error) {
      // File doesn't exist yet, start fresh
      this.memories = new Map();
      this.associations = new Map();
    }
  }

  async saveMemories() {
    try {
      const data = {
        memories: Array.from(this.memories.entries()),
        associations: Array.from(this.associations.entries()),
        lastSaved: new Date().toISOString()
      };
      
      await fs.writeFile(this.memoryFile, JSON.stringify(data, null, 2));
    } catch (error) {
      logger.error('Failed to save memories:', error);
    }
  }

  async storeMemory(userId, content, metadata = {}) {
    if (!this.initialized) {
      throw new Error('Memory Palace not initialized');
    }

    const memoryId = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const memory = {
      id: memoryId,
      userId: userId,
      content: content,
      metadata: metadata,
      timestamp: new Date().toISOString(),
      accessCount: 0,
      importance: this.calculateImportance(content, metadata),
      lastAccessed: new Date().toISOString()
    };

    this.memories.set(memoryId, memory);
    await this.saveMemories();

    // Create associations with existing memories
    await this.createAssociations(memoryId, userId);

    logger.info(`Memory stored: ${memoryId} for user ${userId}`);
    return memoryId;
  }

  calculateImportance(content, metadata) {
    let importance = 0.5; // Base importance
    
    // Content length bonus
    if (content.length > 100) importance += 0.1;
    if (content.length > 500) importance += 0.1;
    
    // Metadata bonuses
    if (metadata.category) importance += 0.1;
    if (metadata.tags && metadata.tags.length > 0) importance += 0.1;
    if (metadata.emotion) importance += 0.1;
    
    return Math.min(1.0, importance);
  }

  async createAssociations(memoryId, userId) {
    const userMemories = Array.from(this.memories.values())
      .filter(m => m.userId === userId)
      .filter(m => m.id !== memoryId)
      .slice(-10); // Last 10 memories

    for (const relatedMemory of userMemories) {
      const similarity = this.calculateSimilarity(
        this.memories.get(memoryId).content,
        relatedMemory.content
      );

      if (similarity > 0.3) {
        const associationId = `${memoryId}_${relatedMemory.id}`;
        this.associations.set(associationId, {
          memory1: memoryId,
          memory2: relatedMemory.id,
          strength: similarity,
          created: new Date().toISOString()
        });
      }
    }
  }

  calculateSimilarity(content1, content2) {
    const words1 = content1.toLowerCase().split(/\s+/);
    const words2 = content2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  async getUserInteractions(userId, limit = 20) {
    if (!this.initialized) {
      throw new Error('Memory Palace not initialized');
    }

    const userMemories = Array.from(this.memories.values())
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    return {
      userId: userId,
      totalMemories: userMemories.length,
      recent: userMemories.slice(0, 5),
      frequency: this.calculateInteractionFrequency(userId),
      patterns: this.analyzeUserPatterns(userMemories)
    };
  }

  calculateInteractionFrequency(userId) {
    const userMemories = Array.from(this.memories.values())
      .filter(m => m.userId === userId);

    if (userMemories.length === 0) return 0;

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const lastDay = userMemories.filter(m => new Date(m.timestamp) > dayAgo).length;
    const lastWeek = userMemories.filter(m => new Date(m.timestamp) > weekAgo).length;

    return {
      daily: lastDay,
      weekly: lastWeek,
      total: userMemories.length
    };
  }

  analyzeUserPatterns(memories) {
    const patterns = {
      mostActiveHours: this.getMostActiveHours(memories),
      commonTopics: this.getCommonTopics(memories),
      averageImportance: memories.reduce((sum, m) => sum + m.importance, 0) / Math.max(1, memories.length)
    };

    return patterns;
  }

  getMostActiveHours(memories) {
    const hourCounts = {};
    
    memories.forEach(memory => {
      const hour = new Date(memory.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const sortedHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return sortedHours.map(([hour, count]) => ({ hour: parseInt(hour), count }));
  }

  getCommonTopics(memories) {
    const wordFreq = {};
    
    memories.forEach(memory => {
      const words = memory.content.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
    });

    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  }

  async searchMemories(userId, query, limit = 10) {
    if (!this.initialized) {
      throw new Error('Memory Palace not initialized');
    }

    const queryWords = query.toLowerCase().split(/\s+/);
    const userMemories = Array.from(this.memories.values())
      .filter(m => m.userId === userId);

    const scored = userMemories.map(memory => {
      const content = memory.content.toLowerCase();
      const relevance = queryWords.reduce((score, word) => {
        return content.includes(word) ? score + 1 : score;
      }, 0);

      return { memory, relevance };
    })
    .filter(item => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);

    return scored.map(item => item.memory);
  }

  async getMemoryStats() {
    return {
      totalMemories: this.memories.size,
      totalAssociations: this.associations.size,
      uniqueUsers: new Set(Array.from(this.memories.values()).map(m => m.userId)).size,
      averageImportance: Array.from(this.memories.values())
        .reduce((sum, m) => sum + m.importance, 0) / Math.max(1, this.memories.size)
    };
  }

  async getStatus() {
    return {
      module: this.name,
      version: this.version,
      initialized: this.initialized,
      stats: await this.getMemoryStats(),
      timestamp: new Date().toISOString()
    };
  }
}

export default MemoryPalace;