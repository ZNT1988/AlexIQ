/**
 * Tests unitaires simplifiés pour MemoryPalace
 * Tests adaptés à l'interface réelle du module
 */

import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';

describe('MemoryPalace - Tests Simplifiés', () => {
  let memoryPalace;

  beforeEach(async () => {
    const module = await import('../../systems/MemoryPalace.js');
    memoryPalace = module.default;
  });

  describe('🏛️ Initialisation', () => {
    it('should exist and be initialized', () => {
      expect(memoryPalace).to.exist;
      expect(memoryPalace.isInitialized).to.be.true;
    });

    it('should have storeMemory method', () => {
      expect(memoryPalace).to.have.property('storeMemory');
      expect(typeof memoryPalace.storeMemory).to.equal('function');
    });
  });

  describe('💾 Memory Storage', () => {
    it('should store memory with content', async () => {
      const testMemory = {
        type: 'test'
        content: 'Simple test memory content'
        emotion: 'neutral'
        importance: 0.5
      };

      const result = await memoryPalace.storeMemory(testMemory);
      expect(result).to.be.an('object');
      expect(result.id).to.be.a('string');
    });
  });

  describe('📊 Basic Functionality', () => {
    it('should have metrics', () => {
      expect(memoryPalace.metrics).to.exist;
      expect(memoryPalace.metrics.totalMemories).to.be.a('number');
    });

    it('should have memory stores', () => {
      expect(memoryPalace.episodicMemory).to.exist;
      expect(memoryPalace.semanticMemory).to.exist;
      expect(memoryPalace.workingMemory).to.exist;
    });
  });
});