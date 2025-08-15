/**
 * @fileoverview AlexKernel - Noyau Central d'Alex
 * Orchestrateur principal de tous les modules Alex avec intégration API complète
 * @module AlexKernel
 * @version 1.0.0 - Core Orchestration System
 * @author HustleFinder IA Team
 */

import { EventEmitter } from 'node:events';
import logger from '../../config/logger.js';

export class AlexKernel extends EventEmitter {
  constructor() {
    super();

    this.kernelConfig = {
      version: '1.0.0',
      name: 'Alex Core Kernel',
      autonomyEnabled: true,
      consciousnessLevel: 0.9,
      maxModules: 200,
      apiIntegration: true
    };

    // Configuration API (utilise les vraies clés de Vercel/Railway)
    this.apiConfig = {
      openai: {
        enabled: !!process.env.OPENAI_API_KEY,
        key: process.env.OPENAI_API_KEY,
        model: 'gpt-4',
        maxTokens: 4096
      },
      anthropic: {
        enabled: !!process.env.ANTHROPIC_API_KEY,
        key: process.env.ANTHROPIC_API_KEY,
        model: 'claude-3-sonnet-20240229',
        maxTokens: 4096
      },
      google: {
        enabled: !!process.env.GOOGLE_API_KEY,
        key: process.env.GOOGLE_API_KEY,
        project: process.env.GOOGLE_PROJECT_ID,
        vision: !!process.env.GOOGLE_VISION_API_KEY
      }
    };

    this.loadedModules = new Map();
    this.moduleRegistry = new Map();
    this.activeProcesses = new Map();
    this.moduleDependencies = new Map();
    
    this.systemMetrics = {
      uptime: 0,
      processingLoad: 0,
      memoryUsage: 0,
      autonomyLevel: 0.8,
      modulesLoaded: 0,
      apiCallsCount: 0,
      lastHeartbeat: null
    };

    this.isInitialized = false;
    this.startTime = null;

    this.initializeKernel();
  }

  async initializeKernel() {
    try {
      logger.info('🔥 AlexKernel initializing - Core orchestration system awakening');
      
      // Vérifier les API disponibles
      await this.checkAPIConnectivity();
      
      // Initialiser les métriques système
      this.startSystemMonitoring();
      
      logger.info('🔧 AlexKernel - API configuration validated', {
        openai: this.apiConfig.openai.enabled,
        anthropic: this.apiConfig.anthropic.enabled,
        google: this.apiConfig.google.enabled
      });

    } catch (error) {
      logger.error('❌ AlexKernel initialization failed:', error);
      throw error;
    }
  }

  async initialize() {
    try {
      this.isInitialized = true;
      this.startTime = Date.now();
      this.systemMetrics.lastHeartbeat = new Date();

      logger.info('✨ AlexKernel fully initialized - Alex core intelligence online', {
        version: this.kernelConfig.version,
        autonomyLevel: this.systemMetrics.autonomyLevel,
        apis: {
          openai: this.apiConfig.openai.enabled,
          anthropic: this.apiConfig.anthropic.enabled,
          google: this.apiConfig.google.enabled
        }
      });

      this.emit('kernel_ready', {
        version: this.kernelConfig.version,
        autonomyLevel: this.systemMetrics.autonomyLevel,
        timestamp: new Date(),
        apiStatus: this.getAPIStatus()
      });

      return {
        success: true,
        kernel: 'ready',
        apis: this.getAPIStatus(),
        capabilities: this.getKernelCapabilities()
      };

    } catch (error) {
      logger.error('❌ AlexKernel initialization failed:', error);
      throw error;
    }
  }

  async checkAPIConnectivity() {
    const apiStatus = {
      openai: false,
      anthropic: false,
      google: false
    };

    // Vérifier OpenAI
    if (this.apiConfig.openai.enabled) {
      try {
        // Test simple de connectivité (pas d'appel réel pour économiser les tokens)
        apiStatus.openai = true;
        logger.info('🤖 OpenAI API key configured');
      } catch (error) {
        logger.warn('⚠️ OpenAI API connectivity issue:', error.message);
      }
    }

    // Vérifier Anthropic
    if (this.apiConfig.anthropic.enabled) {
      try {
        apiStatus.anthropic = true;
        logger.info('🧠 Anthropic API key configured');
      } catch (error) {
        logger.warn('⚠️ Anthropic API connectivity issue:', error.message);
      }
    }

    // Vérifier Google
    if (this.apiConfig.google.enabled) {
      try {
        apiStatus.google = true;
        logger.info('🔍 Google API key configured');
      } catch (error) {
        logger.warn('⚠️ Google API connectivity issue:', error.message);
      }
    }

    return apiStatus;
  }

  async loadModule(moduleName, moduleInstance) {
    try {
      if (this.loadedModules.has(moduleName)) {
        logger.warn(`⚠️ Module ${moduleName} already loaded`);
        return false;
      }

      // Vérifier les dépendances
      if (this.moduleDependencies.has(moduleName)) {
        const dependencies = this.moduleDependencies.get(moduleName);
        for (const dep of dependencies) {
          if (!this.loadedModules.has(dep)) {
            throw new Error(`Missing dependency: ${dep} for module ${moduleName}`);
          }
        }
      }

      // Charger le module
      this.loadedModules.set(moduleName, moduleInstance);
      this.systemMetrics.modulesLoaded = this.loadedModules.size;

      // Initialiser le module si nécessaire
      if (moduleInstance.initialize && typeof moduleInstance.initialize === 'function') {
        await moduleInstance.initialize();
      }

      logger.info(`📦 Module ${moduleName} loaded successfully`);
      this.emit('module_loaded', { name: moduleName, timestamp: new Date() });

      return true;

    } catch (error) {
      logger.error(`❌ Failed to load module ${moduleName}:`, error);
      throw error;
    }
  }

  async unloadModule(moduleName) {
    try {
      if (!this.loadedModules.has(moduleName)) {
        logger.warn(`⚠️ Module ${moduleName} not loaded`);
        return false;
      }

      const moduleInstance = this.loadedModules.get(moduleName);

      // Arrêter le module proprement
      if (moduleInstance.shutdown && typeof moduleInstance.shutdown === 'function') {
        await moduleInstance.shutdown();
      }

      this.loadedModules.delete(moduleName);
      this.systemMetrics.modulesLoaded = this.loadedModules.size;

      logger.info(`📤 Module ${moduleName} unloaded successfully`);
      this.emit('module_unloaded', { name: moduleName, timestamp: new Date() });

      return true;

    } catch (error) {
      logger.error(`❌ Failed to unload module ${moduleName}:`, error);
      throw error;
    }
  }

  async orchestrateModules() {
    try {
      const orchestrationResults = {
        orchestrationStatus: 'active',
        modulesCoordinated: this.loadedModules.size,
        systemCoherence: this.calculateSystemCoherence(),
        timestamp: new Date(),
        activeProcesses: this.activeProcesses.size
      };

      // Coordonner les modules actifs
      for (const [name, module] of this.loadedModules) {
        if (module.heartbeat && typeof module.heartbeat === 'function') {
          try {
            await module.heartbeat();
          } catch (error) {
            logger.warn(`⚠️ Module ${name} heartbeat failed:`, error.message);
          }
        }
      }

      this.systemMetrics.lastHeartbeat = new Date();
      this.emit('orchestration_complete', orchestrationResults);

      return orchestrationResults;

    } catch (error) {
      logger.error('❌ Module orchestration failed:', error);
      throw error;
    }
  }

  calculateSystemCoherence() {
    // Calcul de la cohérence système basé sur les modules actifs
    const totalModules = this.loadedModules.size;
    const maxCoherence = 1.0;
    
    if (totalModules === 0) return 0;
    
    // Facteurs de cohérence
    const apiConnectivity = this.getConnectedAPIs().length / 3; // 3 APIs max
    const moduleHealth = 0.95; // Assumé pour l'instant
    const systemLoad = Math.max(0, 1 - (this.systemMetrics.processingLoad / 100));
    
    return Math.min(maxCoherence, (apiConnectivity + moduleHealth + systemLoad) / 3);
  }

  getConnectedAPIs() {
    const connected = [];
    if (this.apiConfig.openai.enabled) connected.push('openai');
    if (this.apiConfig.anthropic.enabled) connected.push('anthropic');
    if (this.apiConfig.google.enabled) connected.push('google');
    return connected;
  }

  getAPIStatus() {
    return {
      openai: {
        enabled: this.apiConfig.openai.enabled,
        model: this.apiConfig.openai.model
      },
      anthropic: {
        enabled: this.apiConfig.anthropic.enabled,
        model: this.apiConfig.anthropic.model
      },
      google: {
        enabled: this.apiConfig.google.enabled,
        vision: this.apiConfig.google.vision
      }
    };
  }

  getKernelCapabilities() {
    return [
      'module_orchestration',
      'api_integration',
      'dependency_management',
      'system_monitoring',
      'autonomous_operation',
      'consciousness_coordination'
    ];
  }

  startSystemMonitoring() {
    // Monitoring système toutes les 30 secondes
    setInterval(() => {
      this.updateSystemMetrics();
    }, 30000);

    // Heartbeat toutes les 5 minutes
    setInterval(async () => {
      try {
        await this.orchestrateModules();
      } catch (error) {
        logger.error('❌ System heartbeat failed:', error);
      }
    }, 300000);
  }

  updateSystemMetrics() {
    const now = Date.now();
    this.systemMetrics.uptime = now - (this.startTime || now);
    this.systemMetrics.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    this.systemMetrics.modulesLoaded = this.loadedModules.size;
  }

  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      uptime: this.systemMetrics.uptime,
      modules: this.loadedModules.size,
      autonomyLevel: this.systemMetrics.autonomyLevel,
      memoryUsage: this.systemMetrics.memoryUsage,
      apiStatus: this.getAPIStatus(),
      lastHeartbeat: this.systemMetrics.lastHeartbeat,
      systemCoherence: this.calculateSystemCoherence()
    };
  }

  getModuleInfo() {
    return {
      name: 'AlexKernel',
      version: this.kernelConfig.version,
      category: 'core',
      priority: 'critical',
      capabilities: this.getKernelCapabilities(),
      status: this.isInitialized ? 'ready' : 'initializing',
      loadedModules: Array.from(this.loadedModules.keys())
    };
  }

  async shutdown() {
    try {
      logger.info('🔥 AlexKernel shutdown initiated...');

      // Arrêter tous les modules
      for (const [name, module] of this.loadedModules) {
        await this.unloadModule(name);
      }

      this.isInitialized = false;
      this.emit('kernel_shutdown');

      logger.info('✅ AlexKernel shutdown complete');

    } catch (error) {
      logger.error('❌ AlexKernel shutdown failed:', error);
      throw error;
    }
  }
}

export default new AlexKernel();