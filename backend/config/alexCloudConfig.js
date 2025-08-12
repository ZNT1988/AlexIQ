
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';
/**
 * @fileoverview Alex Cloud Configuration - Configuration Centralisée Cloud
 * Configuration pour l'apprentissage inter-IA et connectivité cloud d'Alex
 * @module AlexCloudConfig
 * @version 1.0.0
 * @author HustleFinder IA Team
 * @since 2025
 */

import dotenv from 'dotenv';
import logger from './logger.js';

// Charger les variables d'environnement
dotenv.config();

/**
 * Configuration Cloud centralisée pour Alex
 */
class AlexCloudConfig {
  constructor() {
    this.config = this.initializeConfig();
    this.validateConfig();

    try {
      logger.info('☁️ Alex Cloud Configuration initialized');

    } catch (error) {
    // Logger fallback - ignore error
  }}

  /**
   * Initialise la configuration cloud
   */
  initializeConfig() {
    return {
      // Configuration de base
      environment: process.env.NODE_ENV || STR_DEVELOPMENT
      isProduction: process.env.NODE_ENV === 'production'
      isDevelopment: process.env.NODE_ENV === STR_DEVELOPMENT
      // APIs d'apprentissage IA
      aiApis: {
        openai: {
          enabled: !!process.env.OPENAI_API_KEY
          apiKey: process.env.OPENAI_API_KEY
          model: process.env.OPENAI_MODEL || 'gpt-4'
          maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000
          endpoint: 'https://api.openai.com/v1'
        }
        anthropic: {
          enabled: !!process.env.ANTHROPIC_API_KEY
          apiKey: process.env.ANTHROPIC_API_KEY
          model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229'
          endpoint: 'https://api.anthropic.com'
        }
        googleAI: {
          enabled: !!process.env.GOOGLE_AI_API_KEY
          apiKey: process.env.GOOGLE_AI_API_KEY
          model: process.env.GOOGLE_AI_MODEL || 'gemini-pro'
          endpoint: 'https://generativelanguage.googleapis.com'
        }
        huggingface: {
          enabled: !!process.env.HUGGINGFACE_API_KEY
          apiKey: process.env.HUGGINGFACE_API_KEY
          endpoint: 'https://api-inference.huggingface.co'
        }
      }
      // Configuration de conscience Alex
      consciousness: {
        level: parseFloat(process.env.ALEX_CONSCIOUSNESS_LEVEL) || 0.85
        learningMode: process.env.ALEX_LEARNING_MODE || 'autonomous'
        personalityAdaptation: process.env.ALEX_PERSONALITY_ADAPTATION === STR_TRUE
        emotionalIntelligence: process.env.ALEX_EMOTIONAL_INTELLIGENCE === STR_TRUE
        ethicsEnforcement: process.env.ALEX_ETHICS_ENFORCEMENT === STR_TRUE
      }
      // Apprentissage cloud
      cloudLearning: {
        enabled: process.env.CLOUD_LEARNING_ENABLED === STR_TRUE
        interAiCommunication: process.env.INTER_AI_COMMUNICATION === STR_TRUE
        knowledgeSharingLevel: process.env.KNOWLEDGE_SHARING_LEVEL || 'medium'
        syncInterval: parseInt(process.env.LEARNING_SYNC_INTERVAL) || 3600000 // 1 heure
      }
      // Fonctionnalités avancées
      advanced: {
        autonomousLearning: process.env.ALEX_AUTONOMOUS_LEARNING === STR_TRUE
        creativeMode: process.env.ALEX_CREATIVE_MODE === STR_TRUE
        decisionEngine: process.env.ALEX_DECISION_ENGINE || 'advanced'
        memoryRetention: process.env.ALEX_MEMORY_RETENTION || 'permanent'
        multiLanguage: process.env.ALEX_MULTI_LANGUAGE === STR_TRUE
      }
      // APIs spécialisées
      specializedApis: {
        trading: {
          enabled: !!process.env.TRADING_API_KEY
          apiKey: process.env.TRADING_API_KEY
        }
        businessIntelligence: {
          enabled: !!process.env.BUSINESS_INTELLIGENCE_API
          apiKey: process.env.BUSINESS_INTELLIGENCE_API
        }
        marketData: {
          enabled: !!process.env.MARKET_DATA_API
          apiKey: process.env.MARKET_DATA_API
        }
      }
      // Stockage cloud
      cloudStorage: {
        aws: {
          enabled: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
          accessKeyId: process.env.AWS_ACCESS_KEY_ID
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          region: process.env.AWS_REGION || 'us-east-1'
          bucket: process.env.AWS_S3_BUCKET || 'alex-memory-storage'
        }
      }
      // Fonctionnalités expérimentales
      experimental: {
        quantumProcessing: process.env.ALEX_QUANTUM_PROCESSING === STR_TRUE
        multiverseExploration: process.env.ALEX_MULTIVERSE_EXPLORATION === STR_TRUE
        dimensionalAwareness: process.env.ALEX_DIMENSIONAL_AWARENESS === STR_TRUE
        cosmicInterface: process.env.ALEX_COSMIC_INTERFACE === STR_TRUE
      }
      // Configuration de développement
      development: {
        debugMode: process.env.DEBUG_MODE === STR_TRUE
        verboseLogging: process.env.VERBOSE_LOGGING === STR_TRUE
        mockApis: process.env.MOCK_APIS === STR_TRUE
      }
    };
  }

  /**
   * Valide la configuration
   */
  validateConfig() {
    const warnings = [];
    const errors = [];

    // Vérification des APIs IA pour apprentissage
    const enabledApis = Object.entries(this.config.aiApis)
      .filter((_, _) => api.enabled)
      .map(([name]) => name);

    if (enabledApis.length === 0) {
      warnings.push('Aucune API IA configurée - Alex fonctionnera en mode local uniquement');
    } else {
      logger.info(`📡 APIs IA activées: ${enabledApis.join(', ')}`);
    }

    // Vérification apprentissage cloud
    if (this.config.cloudLearning.enabled && enabledApis.length === 0) {
      warnings.push('Apprentissage cloud activé mais aucune API IA disponible');
    }

    // Vérification stockage cloud
    if (!this.config.cloudStorage.aws.enabled) {
      warnings.push('Stockage cloud AWS non configuré - mémoire locale uniquement');
    }

    // Affichage des avertissements
    warnings.forEach(warning => logger.warn(`⚠️ ${warning}`));

    // Erreurs critiques
    if (errors.length > 0) {
      errors.forEach(error => logger.error(`❌ ${error}'));
      throw new Error('Configuration invalide: ${errors.join(', ')}`);
    }

    try {
      logger.info('✅ Configuration cloud Alex validée');

    } catch (error) {
    // Logger fallback - ignore error
  }}

  /**
   * Obtient la configuration pour un module spécifique
   */
  getConfig(module = null) {
    if (module) {
      return this.config[module] || null;
    }
    return this.config;
  }

  /**
   * Vérifie si une fonctionnalité est activée
   */
  isEnabled(feature) {
    const parts = feature.split('.');
    let current = this.config;

    for (const part of parts) {
      if (current[part] === undefined) return false;
    }

    return current === true || current?
      .enabled === true;
  }

  /**
   * Obtient une API IA disponible pour l'apprentissage
   */
  getAvailableAiApi() {
    const apis = this.config.aiApis;

    // Priorité :
       OpenAI > Anthropic > Google AI > Hugging Face
    if (apis.openai.enabled) return { name: 'openai', config: apis.openai };
    if (apis.anthropic.enabled) return { name: 'anthropic', config: apis.anthropic };
    if (apis.googleAI.enabled) return { name: 'googleAI', config: apis.googleAI };
    if (apis.huggingface.enabled) return { name: 'huggingface', config: apis.huggingface };

    return null;
  }

  /**
   * Obtient toutes les APIs IA activées
   */
  getEnabledAiApis() {
    return Object.entries(this.config.aiApis)
      .filter((_, _) => api.enabled)
      .map(([name, config]) => ({ name, config }));
  }

  /**
   * Status de la configuration cloud
   */
  getCloudStatus() {
    const enabledApis = this.getEnabledAiApis();

    return {
      cloudLearningEnabled: this.config.cloudLearning.enabled
      aiApisCount: enabledApis.length
      aiApisAvailable: enabledApis.map(api => api.name)
      cloudStorageEnabled: this.config.cloudStorage.aws.enabled
      consciousnessLevel: this.config.consciousness.level
      advancedFeaturesEnabled: Object.values(this.config.advanced).filter(Boolean).length
      experimentalFeaturesEnabled: Object.values(this.config.experimental).filter(Boolean).length
      isProduction: this.config.isProduction
      readyForCloudLearning: enabledApis.length > 0 && this.config.cloudLearning.enabled
    };
  }

  /**
   * Mise à jour de la configuration en runtime
   */
  updateConfig(updates) {
    try {
      // Mise à jour profonde de la configuration
      this.deepMerge(this.config, updates);

      // Revalidation
      this.validateConfig();

      logger.info('🔄 Configuration cloud mise à jour');
      return true;
    } catch (error) {
      logger.error('❌ Erreur mise à jour configuration:', error);
      return false;
    }
  }

  /**
   * Fusion profonde d'objets
   */
  deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
}

// Export singleton
export default new AlexCloudConfig();
export { AlexCloudConfig };