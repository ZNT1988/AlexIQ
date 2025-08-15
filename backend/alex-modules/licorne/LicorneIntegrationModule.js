import { EventEmitter } from "events";
import logger from "../../config/logger.js";

/**
 * @fileoverview LicorneIntegrationModule - Master Integration for all Licorne modules
 * Coordinates all Licorne business modules with existing Alex infrastructure
 * 
 * @module LicorneIntegrationModule
 * @version 1.0.0-licorne
 * @author HustleFinder IA Team
 */

export class LicorneIntegrationModule extends EventEmitter {
  constructor(config = {}) {
    super();

    this.name = "LicorneIntegrationModule";
    this.version = "1.0.0-licorne";
    this.category = "licorne";
    this.priority = "critical";

    this.isInitialized = false;
    this.modules = new Map();
    
    // Status of all Licorne modules
    this.licorneModules = {
      payment: { status: 'pending', instance: null },
      scalability: { status: 'pending', instance: null },
      security: { status: 'pending', instance: null },
      marketing: { status: 'pending', instance: null },
      onboarding: { status: 'pending', instance: null },
      api: { status: 'pending', instance: null },
      streaming: { status: 'pending', instance: null },
      context: { status: 'pending', instance: null },
      metrics: { status: 'pending', instance: null },
      enterprise: { status: 'pending', instance: null }
    };

    this.integrationStats = {
      totalModules: 0,
      activeModules: 0,
      failedModules: 0,
      lastHealthCheck: null,
      uptime: 0
    };

    this.capabilities = [
      'payment_processing',
      'auto_scaling',
      'enterprise_security',
      'marketing_automation',
      'user_onboarding',
      'api_management',
      'real_time_streaming',
      'context_awareness',
      'performance_metrics',
      'enterprise_features'
    ];
  }

  async initialize() {
    try {
      this.startTime = Date.now();
      
      await this.initializePaymentModule();
      await this.initializeScalabilityModule();
      // Other modules will be initialized based on configuration
      
      this.startHealthMonitoring();
      
      this.isInitialized = true;
      this.emit('licorne_ready');
      
      logger.info('🦄 LicorneIntegrationModule - All business modules ready');
    } catch (error) {
      logger.error('❌ LicorneIntegrationModule initialization failed:', error);
      throw error;
    }
  }

  async initializePaymentModule() {
    try {
      const { LicornePaymentModule } = await import('./LicornePaymentModule.js');
      const paymentModule = new LicornePaymentModule();
      
      await paymentModule.initialize();
      
      this.licorneModules.payment = {
        status: 'active',
        instance: paymentModule
      };
      
      this.modules.set('payment', paymentModule);
      
      logger.info('💳 Licorne Payment Module integrated');
    } catch (error) {
      this.licorneModules.payment.status = 'failed';
      logger.error('❌ Payment module integration failed:', error);
    }
  }

  async initializeScalabilityModule() {
    try {
      const { LicorneScalabilityModule } = await import('./LicorneScalabilityModule.js');
      const scalabilityModule = new LicorneScalabilityModule();
      
      await scalabilityModule.initialize();
      
      this.licorneModules.scalability = {
        status: 'active',
        instance: scalabilityModule
      };
      
      this.modules.set('scalability', scalabilityModule);
      
      logger.info('🚀 Licorne Scalability Module integrated');
    } catch (error) {
      this.licorneModules.scalability.status = 'failed';
      logger.error('❌ Scalability module integration failed:', error);
    }
  }

  startHealthMonitoring() {
    setInterval(async () => {
      await this.performHealthCheck();
    }, 60000); // Every minute

    logger.info('🏥 Licorne health monitoring started');
  }

  async performHealthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      modules: {},
      stats: this.getIntegrationStats()
    };

    for (const [name, moduleInfo] of Object.entries(this.licorneModules)) {
      if (moduleInfo.status === 'active' && moduleInfo.instance) {
        try {
          health.modules[name] = {
            status: 'healthy',
            uptime: Date.now() - this.startTime,
            version: moduleInfo.instance.version || '1.0.0'
          };
        } catch (error) {
          health.modules[name] = {
            status: 'unhealthy',
            error: error.message
          };
          health.overall = 'degraded';
        }
      } else {
        health.modules[name] = {
          status: moduleInfo.status || 'inactive'
        };
      }
    }

    this.integrationStats.lastHealthCheck = health.timestamp;
    this.emit('health_check_complete', health);
  }

  async process(input, context = {}) {
    if (!this.isInitialized) {
      throw new Error('LicorneIntegrationModule not initialized');
    }

    const { action, module, data = {} } = this.parseInput(input);

    switch (action) {
      case 'payment':
        return await this.delegateToModule('payment', data, context);
      case 'scale':
      case 'scalability':
        return await this.delegateToModule('scalability', data, context);
      case 'health':
        return this.getHealthStatus();
      case 'stats':
        return this.getIntegrationStats();
      case 'capabilities':
        return this.getCapabilities();
      default:
        return this.getLicorneOverview();
    }
  }

  parseInput(input) {
    if (typeof input === 'string') {
      const lower = input.toLowerCase();
      
      if (lower.includes('payment') || lower.includes('paiement') || lower.includes('factur')) {
        return { action: 'payment', data: {} };
      }
      if (lower.includes('scale') || lower.includes('performance') || lower.includes('metric')) {
        return { action: 'scalability', data: {} };
      }
      if (lower.includes('health') || lower.includes('santé') || lower.includes('status')) {
        return { action: 'health', data: {} };
      }
      if (lower.includes('stats') || lower.includes('statistique')) {
        return { action: 'stats', data: {} };
      }
      if (lower.includes('capabilities') || lower.includes('capacité')) {
        return { action: 'capabilities', data: {} };
      }
      
      return { action: 'overview', data: {} };
    }

    return input;
  }

  async delegateToModule(moduleName, data, context) {
    const moduleInfo = this.licorneModules[moduleName];
    
    if (!moduleInfo || moduleInfo.status !== 'active' || !moduleInfo.instance) {
      return {
        success: false,
        error: `Module ${moduleName} not available`,
        message: `Le module ${moduleName} n'est pas disponible`
      };
    }

    try {
      const result = await moduleInfo.instance.process(data, context);
      
      this.emit('module_delegation_success', {
        module: moduleName,
        data,
        result
      });
      
      return result;
    } catch (error) {
      logger.error(`❌ Module delegation failed for ${moduleName}:`, error);
      
      this.emit('module_delegation_failed', {
        module: moduleName,
        error: error.message
      });
      
      return {
        success: false,
        error: error.message,
        message: `Erreur lors de la délégation au module ${moduleName}`
      };
    }
  }

  getHealthStatus() {
    const activeModules = Object.values(this.licorneModules)
      .filter(m => m.status === 'active').length;
    
    const failedModules = Object.values(this.licorneModules)
      .filter(m => m.status === 'failed').length;

    return {
      success: true,
      health: {
        overall: failedModules === 0 ? 'healthy' : 'degraded',
        modules: this.licorneModules,
        stats: {
          active: activeModules,
          failed: failedModules,
          total: Object.keys(this.licorneModules).length
        },
        uptime: Date.now() - this.startTime,
        timestamp: new Date().toISOString()
      },
      message: `Licorne Integration: ${activeModules} modules actifs`
    };
  }

  getIntegrationStats() {
    const stats = {
      ...this.integrationStats,
      uptime: Date.now() - this.startTime,
      modules: Object.keys(this.licorneModules).length,
      activeModules: Object.values(this.licorneModules)
        .filter(m => m.status === 'active').length,
      failedModules: Object.values(this.licorneModules)
        .filter(m => m.status === 'failed').length
    };

    return {
      success: true,
      stats,
      message: 'Statistiques d\'intégration Licorne'
    };
  }

  getCapabilities() {
    const moduleCapabilities = {};
    
    for (const [name, moduleInfo] of Object.entries(this.licorneModules)) {
      if (moduleInfo.status === 'active' && moduleInfo.instance) {
        moduleCapabilities[name] = moduleInfo.instance.capabilities || [];
      }
    }

    return {
      success: true,
      capabilities: {
        core: this.capabilities,
        modules: moduleCapabilities
      },
      message: 'Capacités de la suite Licorne'
    };
  }

  getLicorneOverview() {
    return {
      success: true,
      licorne: {
        name: this.name,
        version: this.version,
        status: this.isInitialized ? 'ready' : 'initializing',
        modules: this.licorneModules,
        capabilities: this.capabilities,
        stats: this.getIntegrationStats().stats,
        uptime: Date.now() - this.startTime
      },
      message: 'AlexIQ Licorne Business Suite - Version complète avec tous les modules'
    };
  }

  // Integration with existing Alex modules
  async integrateWithAlexCore(alexCore) {
    try {
      // Register Licorne modules with Alex's module registry
      if (alexCore.moduleRegistry) {
        for (const [name, module] of this.modules) {
          alexCore.moduleRegistry.registerModule(name, module);
        }
      }

      // Setup event forwarding
      this.on('payment_completed', (data) => {
        alexCore.emit && alexCore.emit('licorne_payment_completed', data);
      });

      this.on('scale_up_triggered', (data) => {
        alexCore.emit && alexCore.emit('licorne_scale_up', data);
      });

      logger.info('🔗 Licorne modules integrated with Alex Core');
    } catch (error) {
      logger.error('❌ Alex Core integration failed:', error);
    }
  }

  getModuleInfo() {
    return {
      name: this.name,
      version: this.version,
      category: this.category,
      priority: this.priority,
      capabilities: this.capabilities,
      modules: Object.keys(this.licorneModules),
      status: this.isInitialized ? 'ready' : 'initializing'
    };
  }

  async shutdown() {
    // Shutdown all active modules
    for (const [name, moduleInfo] of Object.entries(this.licorneModules)) {
      if (moduleInfo.status === 'active' && moduleInfo.instance) {
        try {
          await moduleInfo.instance.shutdown();
          logger.info(`🦄 Module ${name} shutdown complete`);
        } catch (error) {
          logger.error(`❌ Module ${name} shutdown failed:`, error);
        }
      }
    }

    logger.info('🦄 LicorneIntegrationModule shutdown complete');
  }
}

export default LicorneIntegrationModule;