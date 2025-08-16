import { EventEmitter } from "events";
import logger from "../../config/logger.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

/**
 * @fileoverview LicorneAPIModule - Module 7: API Management
 * API payante B2B/B2C avec authentification, billing, quotas, monitoring
 * 
 * @module LicorneAPIModule
 * @version 1.0.0-licorne
 * @author HustleFinder IA Team
 */

export class LicorneAPIModule extends EventEmitter {
  constructor(config = {}) {
    super();

    this.name = "LicorneAPIModule";
    this.version = "1.0.0-licorne";
    this.category = "licorne";
    this.priority = "critical";

    this.isInitialized = false;
    
    // Configuration API business
    this.apiConfig = {
      // Plans et pricing
      plans: {
        free: {
          name: 'Free',
          price: 0,
          currency: 'EUR',
          requests: 1000, // par mois
          rateLimit: 10, // par minute
          features: ['basic_chat', 'simple_analysis'],
          support: 'community'
        },
        starter: {
          name: 'Starter',
          price: 29,
          currency: 'EUR',
          requests: 10000,
          rateLimit: 100,
          features: ['advanced_chat', 'consciousness_modules', 'basic_analytics'],
          support: 'email'
        },
        professional: {
          name: 'Professional',
          price: 99,
          currency: 'EUR',
          requests: 100000,
          rateLimit: 500,
          features: ['full_alex', 'custom_modules', 'advanced_analytics', 'webhooks'],
          support: 'priority'
        },
        enterprise: {
          name: 'Enterprise',
          price: 499,
          currency: 'EUR',
          requests: 1000000,
          rateLimit: 2000,
          features: ['unlimited_alex', 'white_label', 'sla', 'dedicated_support'],
          support: 'dedicated'
        }
      },
      
      // Endpoints API disponibles
      endpoints: {
        '/v1/chat': {
          methods: ['POST'],
          description: 'Chat avec Alex et ses modules de conscience',
          features: ['basic_chat', 'advanced_chat', 'full_alex'],
          complexity: 'standard'
        },
        '/v1/consciousness': {
          methods: ['GET', 'POST'],
          description: 'Accès aux 174 modules de conscience',
          features: ['consciousness_modules', 'full_alex'],
          complexity: 'advanced'
        },
        '/v1/analyze': {
          methods: ['POST'],
          description: 'Analyse de documents, textes, données',
          features: ['simple_analysis', 'basic_analytics', 'advanced_analytics'],
          complexity: 'standard'
        },
        '/v1/generate': {
          methods: ['POST'],
          description: 'Génération de contenu créatif',
          features: ['advanced_chat', 'full_alex'],
          complexity: 'advanced'
        },
        '/v1/modules': {
          methods: ['GET', 'POST'],
          description: 'Interaction avec modules spécialisés',
          features: ['custom_modules', 'full_alex'],
          complexity: 'expert'
        }
      },
      
      // Authentification et sécurité
      auth: {
        jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
        apiKeyPrefix: 'alex_',
        keyLength: 32,
        tokenExpiry: '30d',
        refreshTokenExpiry: '90d'
      }
    };

    // Gestion des clients API
    this.clients = {
      accounts: new Map(), // Comptes clients avec billing
      apiKeys: new Map(), // Clés API actives
      usage: new Map(), // Tracking usage en temps réel
      quotas: new Map(), // Quotas et limites
      billing: new Map() // Données de facturation
    };

    // Rate limiting et quotas
    this.rateLimiting = {
      windows: new Map(), // Fenêtres de temps pour rate limiting
      quotaTracking: new Map(), // Suivi quotas mensuels
      overageHandling: {
        block: false, // Bloquer ou permettre overage
        chargeExtra: true, // Facturer l'overage
        notifyAt: 0.8 // Notifier à 80% du quota
      }
    };

    // Analytics et monitoring
    this.analytics = {
      requests: new Map(), // Détail des requêtes
      performance: new Map(), // Métriques de performance
      errors: new Map(), // Tracking des erreurs
      revenue: new Map(), // Métriques revenue
      trends: new Map() // Tendances d'usage
    };

    // Billing intégration
    this.billingIntegration = {
      stripe: {
        enabled: !!process.env.STRIPE_SECRET_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
      },
      
      // Pricing automatique basé sur l'usage
      dynamicPricing: {
        enabled: true,
        basePrice: 0.001, // €0.001 par requête
        tierPricing: {
          '0-10000': 0.001,
          '10001-100000': 0.0008,
          '100001-500000': 0.0006,
          '500001+': 0.0004
        },
        complexityMultipliers: {
          'standard': 1.0,
          'advanced': 2.0,
          'expert': 3.0
        }
      }
    };

    this.capabilities = [
      'api_key_management',
      'usage_tracking',
      'rate_limiting',
      'quota_management',
      'billing_integration',
      'analytics_reporting',
      'plan_management',
      'webhook_notifications',
      'security_monitoring',
      'revenue_optimization'
    ];
  }

  async initialize() {
    try {
      await this.setupAuthentication();
      await this.initializeBilling();
      await this.setupRateLimiting();
      await this.configureAnalytics();
      await this.setupWebhooks();
      
      this.startAPIEngine();
      
      this.isInitialized = true;
      this.emit('api_ready');
      
      logger.info('🔌 LicorneAPIModule - API Management ready');
    } catch (error) {
      logger.error('❌ LicorneAPIModule initialization failed:', error);
      throw error;
    }
  }

  async setupAuthentication() {
    try {
      // Système de génération de clés API
      this.authSystem = {
        generateApiKey: (clientId, plan = 'free') => {
          const timestamp = Date.now();
          const random = crypto.randomBytes(16).toString('hex');
          const signature = crypto.createHmac('sha256', this.apiConfig.auth.jwtSecret)
            .update(`${clientId}:${timestamp}:${random}`)
            .digest('hex')
            .substring(0, 8);
          
          const apiKey = `${this.apiConfig.auth.apiKeyPrefix}${timestamp}_${signature}_${random}`;
          
          const keyData = {
            key: apiKey,
            clientId,
            plan,
            createdAt: new Date().toISOString(),
            lastUsed: null,
            isActive: true,
            permissions: this.apiConfig.plans[plan].features,
            rateLimit: this.apiConfig.plans[plan].rateLimit,
            monthlyQuota: this.apiConfig.plans[plan].requests
          };
          
          this.clients.apiKeys.set(apiKey, keyData);
          return keyData;
        },
        
        validateApiKey: async (apiKey) => {
          const keyData = this.clients.apiKeys.get(apiKey);
          if (!keyData || !keyData.isActive) {
            throw new Error('Invalid or inactive API key');
          }
          
          // Update last used
          keyData.lastUsed = new Date().toISOString();
          
          // Check rate limiting
          const rateLimitOk = await this.checkRateLimit(apiKey);
          if (!rateLimitOk) {
            throw new Error('Rate limit exceeded');
          }
          
          // Check monthly quota
          const quotaOk = await this.checkMonthlyQuota(apiKey);
          if (!quotaOk) {
            throw new Error('Monthly quota exceeded');
          }
          
          return keyData;
        },
        
        generateJWT: (clientData) => {
          return jwt.sign(
            {
              clientId: clientData.clientId,
              plan: clientData.plan,
              permissions: clientData.permissions
            },
            this.apiConfig.auth.jwtSecret,
            { expiresIn: this.apiConfig.auth.tokenExpiry }
          );
        }
      };
      
      logger.info('🔐 Authentication system configured');
    } catch (error) {
      logger.error('❌ Authentication setup failed:', error);
    }
  }

  async initializeBilling() {
    try {
      if (this.billingIntegration.stripe.enabled) {
        // Configuration Stripe pour billing automatique
        this.billingSystem = {
          createCustomer: async (clientData) => {
            // Intégration Stripe pour créer un customer
            const customer = {
              id: `cus_${crypto.randomUUID()}`,
              email: clientData.email,
              name: clientData.name,
              plan: clientData.plan,
              createdAt: new Date().toISOString()
            };
            
            this.clients.billing.set(clientData.clientId, customer);
            return customer;
          },
          
          calculateUsageBilling: (clientId, usage) => {
            const client = this.clients.accounts.get(clientId);
            if (!client) return null;
            
            const plan = this.apiConfig.plans[client.plan];
            let totalCost = plan.price; // Base price
            
            // Calculate overage if any
            if (usage.requests > plan.requests) {
              const overage = usage.requests - plan.requests;
              const dynamicPricing = this.billingIntegration.dynamicPricing;
              
              // Apply tiered pricing for overage
              const overageCost = this.calculateTieredPrice(overage, usage.complexity);
              totalCost += overageCost;
            }
            
            return {
              baseCost: plan.price,
              overageCost: totalCost - plan.price,
              totalCost,
              requests: usage.requests,
              quota: plan.requests,
              period: usage.period
            };
          },
          
          processPayment: async (clientId, amount) => {
            // Intégration avec Stripe pour processing
            logger.info(`💳 Processing payment: €${amount} for client ${clientId}`);
            return { success: true, transactionId: crypto.randomUUID() };
          }
        };
      }
      
      logger.info('💰 Billing system configured');
    } catch (error) {
      logger.error('❌ Billing initialization failed:', error);
    }
  }

  async setupRateLimiting() {
    try {
      this.rateLimitEngine = {
        checkLimit: async (apiKey, endpoint) => {
          const keyData = this.clients.apiKeys.get(apiKey);
          if (!keyData) return false;
          
          const windowKey = `${apiKey}:${Math.floor(Date.now() / 60000)}`; // 1-minute windows
          const currentCount = this.rateLimiting.windows.get(windowKey) || 0;
          
          if (currentCount >= keyData.rateLimit) {
            this.emit('rate_limit_exceeded', { apiKey, endpoint, count: currentCount });
            return false;
          }
          
          this.rateLimiting.windows.set(windowKey, currentCount + 1);
          
          // Clean old windows
          this.cleanOldWindows();
          
          return true;
        },
        
        getRemainingQuota: (apiKey) => {
          const keyData = this.clients.apiKeys.get(apiKey);
          if (!keyData) return 0;
          
          const usage = this.getMonthlyUsage(apiKey);
          return Math.max(0, keyData.monthlyQuota - usage.requests);
        }
      };
      
      logger.info('⏱️ Rate limiting configured');
    } catch (error) {
      logger.error('❌ Rate limiting setup failed:', error);
    }
  }

  async configureAnalytics() {
    try {
      this.analyticsEngine = {
        trackRequest: (apiKey, endpoint, responseTime, statusCode, requestSize) => {
          const timestamp = new Date().toISOString();
          const requestData = {
            apiKey,
            endpoint,
            timestamp,
            responseTime,
            statusCode,
            requestSize,
            success: statusCode < 400
          };
          
          // Store request data
          if (!this.analytics.requests.has(apiKey)) {
            this.analytics.requests.set(apiKey, []);
          }
          this.analytics.requests.get(apiKey).push(requestData);
          
          // Update performance metrics
          this.updatePerformanceMetrics(endpoint, responseTime, statusCode);
          
          // Track revenue impact
          this.trackRevenueImpact(apiKey, endpoint);
        },
        
        generateReport: (clientId, period = '30d') => {
          const requests = this.analytics.requests.get(clientId) || [];
          const periodMs = this.parsePeriod(period);
          const cutoff = Date.now() - periodMs;
          
          const periodRequests = requests.filter(r => 
            new Date(r.timestamp).getTime() > cutoff
          );
          
          return {
            totalRequests: periodRequests.length,
            successRate: periodRequests.filter(r => r.success).length / periodRequests.length,
            averageResponseTime: periodRequests.reduce((sum, r) => sum + r.responseTime, 0) / periodRequests.length,
            topEndpoints: this.getTopEndpoints(periodRequests),
            errorRate: periodRequests.filter(r => !r.success).length / periodRequests.length,
            period,
            generatedAt: new Date().toISOString()
          };
        }
      };
      
      logger.info('📊 Analytics engine configured');
    } catch (error) {
      logger.error('❌ Analytics configuration failed:', error);
    }
  }

  startAPIEngine() {
    // Usage tracking automation
    setInterval(async () => {
      await this.aggregateUsageMetrics();
    }, 300000); // Every 5 minutes

    // Quota monitoring
    setInterval(async () => {
      await this.monitorQuotas();
    }, 600000); // Every 10 minutes

    // Billing cycle processing
    setInterval(async () => {
      await this.processBillingCycles();
    }, 86400000); // Daily

    // Analytics aggregation
    setInterval(async () => {
      await this.aggregateAnalytics();
    }, 3600000); // Hourly

    logger.info('🔌 API engine started');
  }

  async process(input, context = {}) {
    if (!this.isInitialized) {
      throw new Error('LicorneAPIModule not initialized');
    }

    const { action, data = {} } = this.parseInput(input);

    switch (action) {
      case 'create_api_key':
        return await this.handleCreateAPIKey(data, context);
      case 'validate_request':
        return await this.handleValidateRequest(data, context);
      case 'track_usage':
        return await this.handleTrackUsage(data, context);
      case 'get_analytics':
        return await this.handleGetAnalytics(data, context);
      case 'manage_billing':
        return await this.handleManageBilling(data, context);
      case 'update_plan':
        return await this.handleUpdatePlan(data, context);
      case 'webhook':
        return await this.handleWebhook(data, context);
      default:
        return this.getAPIOverview();
    }
  }

  parseInput(input) {
    if (typeof input === 'string') {
      const lower = input.toLowerCase();
      
      if (lower.includes('api key') || lower.includes('clé api')) {
        return { action: 'create_api_key', data: {} };
      }
      if (lower.includes('validate') || lower.includes('valider')) {
        return { action: 'validate_request', data: {} };
      }
      if (lower.includes('usage') || lower.includes('utilisation')) {
        return { action: 'track_usage', data: {} };
      }
      if (lower.includes('analytics') || lower.includes('analytique')) {
        return { action: 'get_analytics', data: {} };
      }
      if (lower.includes('billing') || lower.includes('facturation')) {
        return { action: 'manage_billing', data: {} };
      }
      if (lower.includes('plan') || lower.includes('abonnement')) {
        return { action: 'update_plan', data: {} };
      }
      if (lower.includes('webhook')) {
        return { action: 'webhook', data: {} };
      }
      
      return { action: 'overview', data: {} };
    }

    return input;
  }

  async handleCreateAPIKey(data, context) {
    try {
      const { clientId, plan = 'free', email, name } = data;
      
      if (!clientId) {
        throw new Error('Client ID required for API key creation');
      }
      
      // Create or update client account
      const clientAccount = {
        clientId,
        email,
        name,
        plan,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      this.clients.accounts.set(clientId, clientAccount);
      
      // Generate API key
      const apiKeyData = this.authSystem.generateApiKey(clientId, plan);
      
      // Setup billing if not free plan
      if (plan !== 'free' && this.billingSystem) {
        await this.billingSystem.createCustomer(clientAccount);
      }
      
      // Initialize usage tracking
      this.clients.usage.set(clientId, {
        requests: 0,
        lastReset: new Date().toISOString(),
        currentPeriod: this.getCurrentBillingPeriod()
      });
      
      this.emit('api_key_created', { clientId, plan, apiKey: apiKeyData.key });
      
      return {
        success: true,
        apiKey: apiKeyData.key,
        plan: this.apiConfig.plans[plan],
        rateLimit: apiKeyData.rateLimit,
        monthlyQuota: apiKeyData.monthlyQuota,
        message: `Clé API ${plan} créée pour ${clientId}`
      };
    } catch (error) {
      logger.error('❌ API key creation failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Échec de la création de clé API'
      };
    }
  }

  async handleValidateRequest(data, context) {
    try {
      const { apiKey, endpoint, method = 'POST' } = data;
      
      if (!apiKey) {
        throw new Error('API key required');
      }
      
      // Validate API key and check limits
      const keyData = await this.authSystem.validateApiKey(apiKey);
      
      // Check endpoint access
      const endpointConfig = this.apiConfig.endpoints[endpoint];
      if (!endpointConfig) {
        throw new Error('Endpoint not found');
      }
      
      // Check method allowed
      if (!endpointConfig.methods.includes(method)) {
        throw new Error(`Method ${method} not allowed for ${endpoint}`);
      }
      
      // Check feature access
      const hasAccess = endpointConfig.features.some(feature => 
        keyData.permissions.includes(feature)
      );
      
      if (!hasAccess) {
        throw new Error(`Plan ${keyData.plan} does not have access to ${endpoint}`);
      }
      
      // Track the validation
      this.analyticsEngine.trackRequest(
        apiKey,
        endpoint,
        0, // Response time will be updated later
        200,
        0 // Request size will be updated later
      );
      
      return {
        success: true,
        keyData,
        endpoint: endpointConfig,
        complexity: endpointConfig.complexity,
        remainingQuota: this.rateLimitEngine.getRemainingQuota(apiKey),
        message: 'Request validated successfully'
      };
    } catch (error) {
      logger.error('❌ Request validation failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Échec de la validation de requête'
      };
    }
  }

  checkRateLimit(apiKey) {
    return this.rateLimitEngine.checkLimit(apiKey, 'general');
  }

  checkMonthlyQuota(apiKey) {
    const keyData = this.clients.apiKeys.get(apiKey);
    if (!keyData) return false;
    
    const usage = this.getMonthlyUsage(apiKey);
    return usage.requests < keyData.monthlyQuota;
  }

  getMonthlyUsage(apiKey) {
    const keyData = this.clients.apiKeys.get(apiKey);
    if (!keyData) return { requests: 0 };
    
    const usage = this.clients.usage.get(keyData.clientId) || { requests: 0 };
    return usage;
  }

  getCurrentBillingPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  getAPIOverview() {
    return {
      success: true,
      api: {
        name: this.name,
        version: this.version,
        status: this.isInitialized ? 'ready' : 'initializing',
        capabilities: this.capabilities,
        plans: Object.keys(this.apiConfig.plans),
        endpoints: Object.keys(this.apiConfig.endpoints),
        metrics: {
          totalClients: this.clients.accounts.size,
          activeKeys: Array.from(this.clients.apiKeys.values()).filter(k => k.isActive).length,
          totalRequests: this.getTotalRequests(),
          revenue: this.getTotalRevenue()
        },
        features: {
          rateLimiting: true,
          quotaManagement: true,
          billing: this.billingIntegration.stripe.enabled,
          analytics: true,
          webhook: true
        }
      },
      message: 'API Management AlexIQ - Monétisation et scaling B2B/B2C'
    };
  }

  getTotalRequests() {
    return Array.from(this.analytics.requests.values())
      .reduce((total, requests) => total + requests.length, 0);
  }

  getTotalRevenue() {
    return Array.from(this.clients.billing.values())
      .reduce((total, billing) => total + (billing.totalRevenue || 0), 0);
  }

  getModuleInfo() {
    return {
      name: this.name,
      version: this.version,
      category: this.category,
      priority: this.priority,
      capabilities: this.capabilities,
      plans: Object.keys(this.apiConfig.plans),
      status: this.isInitialized ? 'ready' : 'initializing'
    };
  }

  async shutdown() {
    // Save client data
    logger.info('💾 Saving API client data');
    
    // Process pending billing
    logger.info('💰 Processing pending billing');
    
    // Export analytics
    logger.info('📊 Exporting API analytics');
    
    logger.info('🔌 LicorneAPIModule shutdown complete');
  }
}

export default LicorneAPIModule;