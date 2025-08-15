import { EventEmitter } from "events";
import logger from "../../config/logger.js";

/**
 * @fileoverview LicornePaymentModule - Integration with EnhancedPaymentManager
 * Bridge between Alex modules and payment system
 * 
 * @module LicornePaymentModule
 * @version 1.0.0-licorne
 * @author HustleFinder IA Team
 */

export class LicornePaymentModule extends EventEmitter {
  constructor(config = {}) {
    super();

    this.name = "LicornePaymentModule";
    this.version = "1.0.0-licorne";
    this.category = "licorne";
    this.priority = "high";

    this.paymentManager = null;
    this.isInitialized = false;

    this.capabilities = [
      'stripe_payments',
      'paypal_payments', 
      'crypto_payments',
      'subscription_management',
      'invoice_generation',
      'webhook_processing'
    ];
  }

  async initialize() {
    try {
      // Import and initialize payment manager
      const { EnhancedPaymentManager } = await import('../../business/EnhancedPaymentManager.js');
      this.paymentManager = new EnhancedPaymentManager();
      
      await this.paymentManager.initializePaymentSystem();
      
      this.isInitialized = true;
      this.emit('module_ready');
      
      logger.info('💳 LicornePaymentModule initialized');
    } catch (error) {
      logger.error('❌ LicornePaymentModule initialization failed:', error);
      throw error;
    }
  }

  async process(input, context = {}) {
    if (!this.isInitialized) {
      throw new Error('LicornePaymentModule not initialized');
    }

    const { action, data = {} } = this.parseInput(input);

    switch (action) {
      case 'create_payment':
        return await this.handleCreatePayment(data, context);
      case 'create_subscription':
        return await this.handleCreateSubscription(data, context);
      case 'get_payment_status':
        return await this.handleGetPaymentStatus(data, context);
      case 'generate_invoice':
        return await this.handleGenerateInvoice(data, context);
      case 'get_subscription_tiers':
        return this.handleGetSubscriptionTiers();
      default:
        return this.getPaymentInfo();
    }
  }

  parseInput(input) {
    if (typeof input === 'string') {
      const lower = input.toLowerCase();
      
      if (lower.includes('payment') || lower.includes('paiement')) {
        return { action: 'create_payment', data: {} };
      }
      if (lower.includes('subscription') || lower.includes('abonnement')) {
        return { action: 'create_subscription', data: {} };
      }
      if (lower.includes('invoice') || lower.includes('facture')) {
        return { action: 'generate_invoice', data: {} };
      }
      if (lower.includes('tier') || lower.includes('plan')) {
        return { action: 'get_subscription_tiers', data: {} };
      }
      
      return { action: 'info', data: {} };
    }

    return input;
  }

  async handleCreatePayment(data, context) {
    const { amount = 29, currency = 'EUR', provider = 'stripe' } = data;
    const tenantId = context.tenantId || 'default';

    try {
      let result;
      
      switch (provider) {
        case 'stripe':
          result = await this.paymentManager.createStripePayment(
            tenantId, amount, currency, data.metadata
          );
          break;
        case 'paypal':
          result = await this.paymentManager.createPayPalPayment(
            tenantId, amount, currency, data.returnUrl, data.cancelUrl
          );
          break;
        case 'crypto':
          result = await this.paymentManager.createCryptoPayment(
            tenantId, amount, currency, data.cryptoType
          );
          break;
        default:
          throw new Error(`Unsupported payment provider: ${provider}`);
      }

      return {
        success: true,
        payment: result,
        message: `Payment de ${amount} ${currency} créé via ${provider}`
      };
    } catch (error) {
      logger.error('❌ Payment creation failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Échec de la création du paiement'
      };
    }
  }

  async handleCreateSubscription(data, context) {
    const { tier = 'starter', paymentMethodId } = data;
    const tenantId = context.tenantId || 'default';

    try {
      const result = await this.paymentManager.createStripeSubscription(
        tenantId, tier, paymentMethodId
      );

      return {
        success: true,
        subscription: result,
        message: `Abonnement ${tier} créé avec succès`
      };
    } catch (error) {
      logger.error('❌ Subscription creation failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Échec de la création de l\'abonnement'
      };
    }
  }

  async handleGenerateInvoice(data, context) {
    const { items = [], subscriptionId } = data;
    const tenantId = context.tenantId || 'default';

    try {
      const result = await this.paymentManager.generateInvoice(
        tenantId, items, subscriptionId
      );

      return {
        success: true,
        invoice: result,
        message: `Facture ${result.invoice_number} générée`
      };
    } catch (error) {
      logger.error('❌ Invoice generation failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Échec de la génération de facture'
      };
    }
  }

  handleGetSubscriptionTiers() {
    return {
      success: true,
      tiers: this.paymentManager.subscriptionTiers,
      message: 'Plans d\'abonnement disponibles'
    };
  }

  getPaymentInfo() {
    const status = this.paymentManager.getPaymentStatus();
    
    return {
      success: true,
      status,
      capabilities: this.capabilities,
      message: 'Système de paiement AlexIQ disponible'
    };
  }

  getModuleInfo() {
    return {
      name: this.name,
      version: this.version,
      category: this.category,
      priority: this.priority,
      capabilities: this.capabilities,
      status: this.isInitialized ? 'ready' : 'initializing'
    };
  }

  async shutdown() {
    if (this.paymentManager) {
      await this.paymentManager.shutdown();
    }
    logger.info('💳 LicornePaymentModule shutdown complete');
  }
}

export default LicornePaymentModule;