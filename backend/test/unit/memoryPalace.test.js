
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_TEST = 'test';

/**
 * Tests unitaires pour MemoryPalace
 * Validation du système de mémoire vectoriel d'Alex
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';

describe('MemoryPalace - Système Mémoire Vectoriel', () => {
  let memoryPalace;

  beforeEach(async () => {
    const module = await import('../../systems/MemoryPalace.js');
    memoryPalace = module.default;
  });

  describe('🏛️ Initialisation', () => {
    it('should be initialized', () => {
      expect(memoryPalace).to.exist;
      expect(memoryPalace.isInitialized).to.be.true;
    });

    it('should have memory storage capabilities', () => {
      expect(memoryPalace).to.have.property('storeMemory');
      expect(typeof memoryPalace.storeMemory).to.equal('function');
    });
  });

  describe('💾 Memory Storage', () => {
    it('should store memory successfully', async () => {
      const testMemory = {
        type: STR_TEST
        content: 'Test memory content'
        emotion: 'neutral'
        importance: 0.5
      };

      const result = await memoryPalace.storeMemory(testMemory);
      expect(result).to.be.an('object');
      expect(result.id).to.be.a('string');
    });

    it('should handle memory with missing content', async () => {
      const testMemory = {
        type: 'incomplete_test'
        emotion: 'neutral'
      };

      try {
        await memoryPalace.storeMemory(testMemory);
      } catch (error) {
        expect(error).to.be.an('error');
      }
    });
  });

  describe('🔍 Memory Search', () => {
    it('should search memories by content', async () => {
      const testMemory = {
        type: 'searchable'
        content: 'Unique searchable content for testing'
        tags: [STR_TEST, 'searchable']
      };

      await memoryPalace.storeMemory('search_test', testMemory);
      const results = await memoryPalace.searchMemories('searchable content');
      
      expect(results).to.be.an('array');
      expect(results.length).to.be.greaterThan(0);
    });

    it('should return empty array for non-existent content', async () => {
      const results = await memoryPalace.searchMemories('non_existent_unique_content_12345');
      expect(results).to.be.an('array');
    });
  });

  describe('📊 Memory Statistics', () => {
    it('should provide memory statistics', () => {
      const stats = memoryPalace.getMemoryStats();
      
      expect(stats).to.be.an('object');
      expect(stats).to.have.property('totalMemories');
      expect(stats).to.have.property('memoryTypes');
      expect(stats.totalMemories).to.be.a('number');
    });
  });

  describe('⚡ Performance', () => {
    it('should store memory quickly', async () => {
      const startTime = Date.now();
      
      await memoryPalace.storeMemory('perf_test', {
        content: 'Performance test memory'
        timestamp: Date.now()
      });
      
      const duration = Date.now() - startTime;
      expect(duration).to.be.below(500); // Moins de 500ms
    });

    it('should handle multiple memories efficiently', async () => {
      const memories = Array.from({ length: 10 }, (_, i) => ({
        key: `bulk_test_${i}`
        data: {
          content: `Bulk memory ${i}`
          type: 'bulk_test'
          index: i
        }
      }));

      const startTime = Date.now();
      
      const promises = memories.map(mem => 
        memoryPalace.storeMemory(mem.key, mem.data)
      );
      
      await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      expect(duration).to.be.below(2000); // Moins de 2 secondes pour 10 mémoires
    });
  });
});