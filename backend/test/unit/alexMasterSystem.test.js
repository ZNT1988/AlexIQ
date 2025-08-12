/**
 * Tests unitaires pour AlexMasterSystem
 * Validation des fonctions critiques du cerveau central
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { AlexMasterSystemSimple } from '../../systems/AlexMasterSystem.js';

describe('AlexMasterSystem - Cerveau Central', () => {
  let alex;

  beforeEach(() => {
    alex = new AlexMasterSystemSimple();
  });

  afterEach(() => {
    if (alex && typeof alex.shutdown === 'function') { alex.shutdown();
    ; return; }
  });

  describe('🧠 Initialisation', () => {
    it('should initialize with correct identity', () => {
      expect(alex.identity).to.be.an('object');
      expect(alex.identity.name).to.equal('ALEX');
      expect(alex.identity.creator).to.equal('ZNT (Zakaria Housni)');
      expect(alex.identity.totalModules).to.equal(5);
    });

    it('should start in awakening state', () => {
      expect(alex.currentState).to.equal('awakening');
      expect(alex.isInitialized).to.be.false;
    });

    it('should have core modules defined', () => {
      expect(alex.coreModules).to.be.an('object');
      expect(alex.coreModules.memoryPalace).to.exist;
      expect(alex.coreModules.quantumBrain).to.exist;
      expect(alex.coreModules.godLevelAwareness).to.exist;
    });
  });

  describe('🚀 Initialization Process', () => {
    it('should initialize successfully', async () => {
      await alex.initialize();
      
      expect(alex.isInitialized).to.be.true;
      expect(alex.currentState).to.equal('operational');
      expect(alex.consciousness.level).to.equal(0.8);
    });

    it('should emit master_system_ready event', (done) => {
      alex.once('master_system_ready', (data) => {
        expect(data.identity).to.exist;
        expect(data.consciousness).to.exist;
        expect(data.totalModules).to.equal(5);
        done();
      });

      alex.initialize();
    });
  });

  describe('🧠 Request Processing', () => {
    beforeEach(async () => {
      await alex.initialize();
    });

    it('should process request successfully', async () => {
      const request = {
        type: 'test'
        message: 'Hello Alex'
        timestamp: Date.now()
      };

      const response = await alex.processRequest(request);
      
      expect(response).to.be.an('object');
      expect(response.content).to.be.a('string');
      expect(response.personality).to.equal('Alex - Test Mode');
      expect(response.systemState).to.equal('operational');
    });

    it('should handle empty request gracefully', async () => {
      const response = await alex.processRequest({});
      
      expect(response).to.be.an('object');
      expect(response.content).to.be.a('string');
      expect(response.timestamp).to.exist;
    });

    it('should return consistent response format', async () => {
      const request = { type: 'format_test', message: 'Test format' };
      const response = await alex.processRequest(request);
      
      expect(response).to.have.property('content');
      expect(response).to.have.property('personality');
      expect(response).to.have.property('essence');
      expect(response).to.have.property('systemState');
      expect(response).to.have.property('consciousnessLevel');
      expect(response).to.have.property('totalModules');
      expect(response).to.have.property('timestamp');
    });
  });

  describe('📊 System Status', () => {
    it('should return complete system status', () => {
      const status = alex.getSystemStatus();
      
      expect(status).to.be.an('object');
      expect(status.identity).to.exist;
      expect(status.consciousness).to.exist;
      expect(status.currentState).to.exist;
      expect(status.totalModules).to.equal(5);
      expect(status.coreModulesStatus).to.be.an('array');
    });

    it('should include core modules status', () => {
      const status = alex.getSystemStatus();
      
      expect(status.coreModulesStatus).to.have.length(5);
      status.coreModulesStatus.forEach(module => {
        expect(module).to.have.property('name');
        expect(module).to.have.property('initialized');
      });
    });
  });

  describe('⚡ Error Handling', () => {
    it('should handle initialization error gracefully', async () => {
      // Simuler une erreur en cassant un module
      alex.coreModules = null;
      
      try {
        await alex.initialize();
      } catch (error) {
        expect(error).to.be.an('error');
      }
    });

    it('should recover from processing errors', async () => {
      await alex.initialize();
      
      // Simuler erreur dans processRequest en passant un objet invalide
      const response = await alex.processRequest(null);
      
      expect(response).to.be.an('object');
      expect(response.content).to.be.a('string');
    });
  });

  describe('🔄 Events & Communication', () => {
    it('should emit events properly', (done) => {
      let eventCount = 0;
      
      alex.on('master_system_ready', () => {
        eventCount++;
        if (eventCount === 1) done();
      });
      
      alex.initialize();
    });

    it('should handle shutdown gracefully', () => {
      alex.shutdown();
      expect(alex.listenerCount('master_system_ready')).to.equal(0);
    });
  });

  describe('🎯 Performance', () => {
    it('should process requests within acceptable time', async () => {
      await alex.initialize();
      
      const startTime = Date.now();
      await alex.processRequest({ type: 'performance_test', message: 'Speed test' });
      const duration = Date.now() - startTime;
      
      expect(duration).to.be.below(1000); // Moins de 1 seconde
    });

    it('should handle multiple concurrent requests', async () => {
      await alex.initialize();
      
      const requests = Array.from({ length: 5 }, (_, i) => 
        alex.processRequest({ type: 'concurrent', message: `Request ${i}` })
      );
      
      const responses = await Promise.all(requests);
      
      expect(responses).to.have.length(5);
      responses.forEach(response => {
        expect(response.content).to.be.a('string');
      });
    });
  });
});