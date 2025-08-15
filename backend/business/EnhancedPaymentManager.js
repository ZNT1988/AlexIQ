import { EventEmitter } from "events";
import logger from "../config/logger.js";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

/**
 * @fileoverview EnhancedPaymentManager - Licorne Module 1: Facturation & Paiements
 * Complete payment system with Stripe, PayPal, crypto support
 * 
 * @module EnhancedPaymentManager
 * @version 1.0.0-licorne
 * @author HustleFinder IA Team
 */

export class EnhancedPaymentManager extends EventEmitter {
  constructor(config = {}) {
    super();

    this.name = "EnhancedPaymentManager";
    this.version = "1.0.0-licorne";

    // Railway-compatible path
    const isRailway = process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN || (process.env.PORT && !process.env.LOCALDEV);
    this.dbPath = config.dbPath || (isRailway ? '/tmp/enhanced_payments.db' : './backend/db/enhanced_payments.db');
    this.db = null;

    this.config = {
      // Stripe Configuration
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publicKey: process.env.STRIPE_PUBLIC_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        enabled: Boolean(process.env.STRIPE_SECRET_KEY)
      },
      
      // PayPal Configuration
      paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        mode: process.env.PAYPAL_MODE || 'sandbox',
        enabled: Boolean(process.env.PAYPAL_CLIENT_ID)
      },
      
      // Crypto Configuration
      crypto: {
        acceptBitcoin: process.env.ACCEPT_BITCOIN === 'true',
        acceptEthereum: process.env.ACCEPT_ETHEREUM === 'true',
        bitcoinAddress: process.env.BITCOIN_ADDRESS,
        ethereumAddress: process.env.ETHEREUM_ADDRESS,
        enabled: process.env.ACCEPT_BITCOIN === 'true' || process.env.ACCEPT_ETHEREUM === 'true'
      },

      // Business Configuration
      business: {
        currency: process.env.DEFAULT_CURRENCY || 'EUR',
        taxRate: parseFloat(process.env.TAX_RATE) || 0.20,
        companyInfo: {
          name: process.env.COMPANY_NAME || 'AlexIQ SaaS',
          address: process.env.COMPANY_ADDRESS || 'France',
          vatNumber: process.env.VAT_NUMBER || 'FR00000000000',
          siret: process.env.SIRET_NUMBER
        }
      },
      
      ...config
    };

    // Payment providers
    this.providers = {
      stripe: null,
      paypal: null,
      crypto: null
    };

    // Subscription tiers
    this.subscriptionTiers = {
      free: {
        name: 'Free',
        price: 0,
        currency: 'EUR',
        features: ['Basic AI', '10 queries/day', 'Email support'],
        limits: { queries: 10, storage: '100MB' }
      },
      starter: {
        name: 'Starter',
        price: 29,
        currency: 'EUR',
        features: ['Advanced AI', '1000 queries/day', 'Priority support'],
        limits: { queries: 1000, storage: '1GB' }
      },
      pro: {
        name: 'Pro',
        price: 99,
        currency: 'EUR',
        features: ['Professional AI', 'Unlimited queries', '24/7 support', 'API access'],
        limits: { queries: -1, storage: '10GB' }
      },
      enterprise: {
        name: 'Enterprise',
        price: 299,
        currency: 'EUR',
        features: ['Enterprise AI', 'Custom integrations', 'Dedicated support', 'SLA'],
        limits: { queries: -1, storage: '100GB' }
      }
    };

    this.isInitialized = false;
    this.initializePaymentSystem();
  }

  async initializePaymentSystem() {
    try {
      await this.initializeDatabase();
      await this.initializeProviders();
      
      this.isInitialized = true;
      this.emit('payment_system_ready');
      
      logger.info('💳 Enhanced Payment Manager initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Enhanced Payment Manager:', error);
      throw error;
    }
  }

  async initializeDatabase() {
    try {
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      await this.createPaymentTables();
      logger.info('✅ Enhanced Payment database initialized');
    } catch (error) {
      logger.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async createPaymentTables() {
    const tables = [
      // Enhanced payments table
      `CREATE TABLE IF NOT EXISTS enhanced_payments (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        tenant_id TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_payment_id TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'EUR',
        status TEXT DEFAULT 'pending',
        subscription_tier TEXT,
        billing_period TEXT,
        tax_amount REAL DEFAULT 0,
        net_amount REAL NOT NULL,
        description TEXT,
        metadata TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        failed_at DATETIME,
        refunded_at DATETIME
      )`,

      // Subscriptions table
      `CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        tenant_id TEXT NOT NULL,
        tier TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        provider TEXT NOT NULL,
        provider_subscription_id TEXT,
        current_period_start DATETIME NOT NULL,
        current_period_end DATETIME NOT NULL,
        next_billing_date DATETIME,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'EUR',
        trial_ends_at DATETIME,
        canceled_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Invoices table
      `CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        tenant_id TEXT NOT NULL,
        invoice_number TEXT UNIQUE NOT NULL,
        subscription_id TEXT,
        payment_id TEXT,
        status TEXT DEFAULT 'draft',
        subtotal REAL NOT NULL,
        tax_amount REAL NOT NULL,
        total_amount REAL NOT NULL,
        currency TEXT DEFAULT 'EUR',
        due_date DATE,
        issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        paid_at DATETIME,
        items TEXT DEFAULT '[]',
        billing_address TEXT DEFAULT '{}',
        company_info TEXT DEFAULT '{}'
      )`,

      // Payment methods table
      `CREATE TABLE IF NOT EXISTS payment_methods (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        tenant_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_method_id TEXT NOT NULL,
        type TEXT NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        last_four TEXT,
        exp_month INTEGER,
        exp_year INTEGER,
        brand TEXT,
        country TEXT,
        metadata TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Webhooks log
      `CREATE TABLE IF NOT EXISTS webhook_events (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        provider TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_id TEXT UNIQUE NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        payload TEXT NOT NULL,
        response TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME
      )`
    ];

    for (const sql of tables) {
      await this.db.exec(sql);
    }
  }

  async initializeProviders() {
    // Initialize Stripe
    if (this.config.stripe.enabled) {
      try {
        const stripe = await import('stripe');
        this.providers.stripe = stripe.default(this.config.stripe.secretKey);
        logger.info('✅ Stripe provider initialized');
      } catch (error) {
        logger.warn('⚠️ Stripe initialization failed:', error.message);
      }
    }

    // Initialize PayPal
    if (this.config.paypal.enabled) {
      try {
        const paypal = await import('@paypal/checkout-server-sdk');
        const environment = this.config.paypal.mode === 'live' 
          ? new paypal.core.LiveEnvironment(this.config.paypal.clientId, this.config.paypal.clientSecret)
          : new paypal.core.SandboxEnvironment(this.config.paypal.clientId, this.config.paypal.clientSecret);
        
        this.providers.paypal = new paypal.core.PayPalHttpClient(environment);
        logger.info('✅ PayPal provider initialized');
      } catch (error) {
        logger.warn('⚠️ PayPal initialization failed:', error.message);
      }
    }

    // Initialize Crypto
    if (this.config.crypto.enabled) {
      this.providers.crypto = {
        bitcoin: this.config.crypto.bitcoinAddress,
        ethereum: this.config.crypto.ethereumAddress
      };
      logger.info('✅ Crypto payments initialized');
    }
  }

  // Stripe Payment Methods
  async createStripePayment(tenantId, amount, currency = 'EUR', metadata = {}) {
    if (!this.providers.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const paymentIntent = await this.providers.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          tenant_id: tenantId,
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Store payment in database
      const paymentId = await this.storePayment({
        tenant_id: tenantId,
        payment_method: 'card',
        provider: 'stripe',
        provider_payment_id: paymentIntent.id,
        amount,
        currency,
        status: 'pending',
        net_amount: amount,
        metadata: JSON.stringify(metadata)
      });

      return {
        id: paymentId,
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount,
        currency
      };
    } catch (error) {
      logger.error('❌ Stripe payment creation failed:', error);
      throw error;
    }
  }

  async createStripeSubscription(tenantId, tier, paymentMethodId) {
    if (!this.providers.stripe) {
      throw new Error('Stripe not configured');
    }

    const tierConfig = this.subscriptionTiers[tier];
    if (!tierConfig) {
      throw new Error(`Invalid subscription tier: ${tier}`);
    }

    try {
      // Create customer if not exists
      let customer = await this.getOrCreateStripeCustomer(tenantId);

      // Attach payment method
      await this.providers.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id
      });

      // Create subscription
      const subscription = await this.providers.stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price_data: {
            currency: tierConfig.currency.toLowerCase(),
            product_data: {
              name: `${tierConfig.name} Plan`
            },
            unit_amount: Math.round(tierConfig.price * 100),
            recurring: {
              interval: 'month'
            }
          }
        }],
        default_payment_method: paymentMethodId,
        metadata: {
          tenant_id: tenantId,
          tier
        }
      });

      // Store subscription
      const subscriptionId = await this.storeSubscription({
        tenant_id: tenantId,
        tier,
        provider: 'stripe',
        provider_subscription_id: subscription.id,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        amount: tierConfig.price,
        currency: tierConfig.currency
      });

      return {
        id: subscriptionId,
        provider_id: subscription.id,
        status: subscription.status,
        tier,
        amount: tierConfig.price
      };
    } catch (error) {
      logger.error('❌ Stripe subscription creation failed:', error);
      throw error;
    }
  }

  // PayPal Payment Methods
  async createPayPalPayment(tenantId, amount, currency = 'EUR', returnUrl, cancelUrl) {
    if (!this.providers.paypal) {
      throw new Error('PayPal not configured');
    }

    try {
      const paypal = await import('@paypal/checkout-server-sdk');
      
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toFixed(2)
          },
          description: `AlexIQ Payment for tenant ${tenantId}`
        }],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl
        }
      });

      const order = await this.providers.paypal.execute(request);

      // Store payment
      const paymentId = await this.storePayment({
        tenant_id: tenantId,
        payment_method: 'paypal',
        provider: 'paypal',
        provider_payment_id: order.result.id,
        amount,
        currency,
        status: 'pending',
        net_amount: amount
      });

      return {
        id: paymentId,
        paypal_order_id: order.result.id,
        approval_url: order.result.links.find(link => link.rel === 'approve').href,
        amount,
        currency
      };
    } catch (error) {
      logger.error('❌ PayPal payment creation failed:', error);
      throw error;
    }
  }

  // Crypto Payment Methods
  async createCryptoPayment(tenantId, amount, currency = 'EUR', cryptoType = 'bitcoin') {
    if (!this.config.crypto.enabled) {
      throw new Error('Crypto payments not configured');
    }

    try {
      const cryptoAddress = cryptoType === 'bitcoin' 
        ? this.config.crypto.bitcoinAddress 
        : this.config.crypto.ethereumAddress;

      if (!cryptoAddress) {
        throw new Error(`${cryptoType} address not configured`);
      }

      // For production, integrate with crypto payment processor
      // For now, generate a simple payment request
      const paymentId = await this.storePayment({
        tenant_id: tenantId,
        payment_method: cryptoType,
        provider: 'crypto',
        provider_payment_id: `crypto_${Date.now()}`,
        amount,
        currency,
        status: 'pending',
        net_amount: amount,
        metadata: JSON.stringify({ crypto_type: cryptoType })
      });

      return {
        id: paymentId,
        crypto_type: cryptoType,
        address: cryptoAddress,
        amount,
        currency,
        qr_code: `crypto:${cryptoAddress}?amount=${amount}&label=AlexIQ-Payment-${paymentId}`
      };
    } catch (error) {
      logger.error('❌ Crypto payment creation failed:', error);
      throw error;
    }
  }

  // Invoice Generation
  async generateInvoice(tenantId, items, subscriptionId = null) {
    try {
      const invoiceNumber = this.generateInvoiceNumber();
      
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxAmount = subtotal * this.config.business.taxRate;
      const totalAmount = subtotal + taxAmount;

      const invoiceId = await this.db.run(
        `INSERT INTO invoices (
          tenant_id, invoice_number, subscription_id, status,
          subtotal, tax_amount, total_amount, currency,
          due_date, items, company_info
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tenantId,
          invoiceNumber,
          subscriptionId,
          'issued',
          subtotal,
          taxAmount,
          totalAmount,
          this.config.business.currency,
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          JSON.stringify(items),
          JSON.stringify(this.config.business.companyInfo)
        ]
      );

      return {
        id: invoiceId.lastID,
        invoice_number: invoiceNumber,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        items
      };
    } catch (error) {
      logger.error('❌ Invoice generation failed:', error);
      throw error;
    }
  }

  generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${year}${month}-${timestamp}`;
  }

  // Webhook Handlers
  async handleStripeWebhook(payload, signature) {
    if (!this.providers.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const event = this.providers.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.stripe.webhookSecret
      );

      await this.storeWebhookEvent('stripe', event.type, event.id, payload);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object, 'stripe');
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object, 'stripe');
          break;
        case 'invoice.payment_succeeded':
          await this.handleSubscriptionPayment(event.data.object, 'stripe');
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event.data.object, 'stripe');
          break;
      }

      await this.markWebhookProcessed(event.id);
      return { received: true };
    } catch (error) {
      logger.error('❌ Stripe webhook processing failed:', error);
      throw error;
    }
  }

  async handlePaymentSuccess(paymentObject, provider) {
    const tenantId = paymentObject.metadata.tenant_id;
    
    await this.db.run(
      `UPDATE enhanced_payments 
       SET status = 'completed', processed_at = CURRENT_TIMESTAMP 
       WHERE provider_payment_id = ? AND provider = ?`,
      [paymentObject.id, provider]
    );

    this.emit('payment_completed', {
      tenant_id: tenantId,
      provider,
      amount: paymentObject.amount / 100,
      currency: paymentObject.currency
    });

    logger.info(`💳 Payment completed: ${tenantId} - ${paymentObject.amount / 100} ${paymentObject.currency}`);
  }

  async handlePaymentFailed(paymentObject, provider) {
    await this.db.run(
      `UPDATE enhanced_payments 
       SET status = 'failed', failed_at = CURRENT_TIMESTAMP 
       WHERE provider_payment_id = ? AND provider = ?`,
      [paymentObject.id, provider]
    );

    this.emit('payment_failed', {
      tenant_id: paymentObject.metadata.tenant_id,
      provider,
      reason: paymentObject.last_payment_error?.message
    });
  }

  // Utility Methods
  async storePayment(paymentData) {
    const result = await this.db.run(
      `INSERT INTO enhanced_payments (
        tenant_id, payment_method, provider, provider_payment_id,
        amount, currency, status, net_amount, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentData.tenant_id,
        paymentData.payment_method,
        paymentData.provider,
        paymentData.provider_payment_id,
        paymentData.amount,
        paymentData.currency,
        paymentData.status,
        paymentData.net_amount,
        paymentData.metadata
      ]
    );
    return result.lastID;
  }

  async storeSubscription(subscriptionData) {
    const result = await this.db.run(
      `INSERT INTO subscriptions (
        tenant_id, tier, provider, provider_subscription_id,
        current_period_start, current_period_end, amount, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subscriptionData.tenant_id,
        subscriptionData.tier,
        subscriptionData.provider,
        subscriptionData.provider_subscription_id,
        subscriptionData.current_period_start,
        subscriptionData.current_period_end,
        subscriptionData.amount,
        subscriptionData.currency
      ]
    );
    return result.lastID;
  }

  async storeWebhookEvent(provider, eventType, eventId, payload) {
    await this.db.run(
      `INSERT INTO webhook_events (provider, event_type, event_id, payload)
       VALUES (?, ?, ?, ?)`,
      [provider, eventType, eventId, JSON.stringify(payload)]
    );
  }

  async markWebhookProcessed(eventId) {
    await this.db.run(
      `UPDATE webhook_events 
       SET processed = TRUE, processed_at = CURRENT_TIMESTAMP 
       WHERE event_id = ?`,
      [eventId]
    );
  }

  async getOrCreateStripeCustomer(tenantId) {
    if (!this.providers.stripe) {
      throw new Error('Stripe not configured');
    }

    // In production, link this with user data
    const customers = await this.providers.stripe.customers.list({
      metadata: { tenant_id: tenantId },
      limit: 1
    });

    if (customers.data.length > 0) {
      return customers.data[0];
    }

    return await this.providers.stripe.customers.create({
      metadata: { tenant_id: tenantId }
    });
  }

  getPaymentStatus() {
    return {
      providers: {
        stripe: this.config.stripe.enabled,
        paypal: this.config.paypal.enabled,
        crypto: this.config.crypto.enabled
      },
      subscription_tiers: this.subscriptionTiers,
      currencies_supported: ['EUR', 'USD', 'GBP'],
      features: [
        'stripe_integration',
        'paypal_integration',
        'crypto_payments',
        'subscription_billing',
        'invoice_generation',
        'webhook_processing',
        'tax_calculation',
        'multi_currency'
      ]
    };
  }

  async shutdown() {
    if (this.db) {
      await this.db.close();
    }
    logger.info('💳 Enhanced Payment Manager shutdown complete');
  }
}

export default EnhancedPaymentManager;