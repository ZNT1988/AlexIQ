// Service de paiement AlexIQ - Plans et abonnements
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'AlexIQ Gratuit',
    price: 0,
    currency: 'EUR',
    period: 'month',
    features: [
      '20 messages par jour',
      'Accès aux APIs de base',
      'Chat avec Alex',
      'Génération d\'images (5/jour)',
      'Support communautaire'
    ],
    limits: {
      messagesPerDay: 20,
      imagesPerDay: 5,
      contextHistory: 10,
      fileUploads: false,
      advancedModules: false
    },
    color: 'gray'
  },
  PRO: {
    id: 'pro',
    name: 'AlexIQ Pro',
    price: 20,
    currency: 'EUR',
    period: 'month',
    features: [
      'Messages illimités',
      'Génération d\'images illimitée',
      'Accès à tous les modules Alex',
      'Historique de conversation étendu',
      'Upload de fichiers',
      'APIs avancées (GPT-4, Claude)',
      'Support prioritaire',
      'Export des conversations'
    ],
    limits: {
      messagesPerDay: -1,
      imagesPerDay: -1,
      contextHistory: 100,
      fileUploads: true,
      advancedModules: true
    },
    color: 'blue',
    popular: true
  },
  BUSINESS: {
    id: 'business',
    name: 'AlexIQ Business',
    price: 50,
    currency: 'EUR',
    period: 'month',
    features: [
      'Tout AlexIQ Pro',
      'Modules Alex spécialisés',
      'Intégrations API personnalisées',
      'Analytics et reporting',
      'Support dédié 24/7',
      'Accès aux modules consciousness',
      'Formation équipe',
      'SLA garanti 99.9%'
    ],
    limits: {
      messagesPerDay: -1,
      imagesPerDay: -1,
      contextHistory: 500,
      fileUploads: true,
      advancedModules: true,
      businessModules: true
    },
    color: 'purple'
  }
};

export class PaymentService {
  constructor() {
    this.apiBase = '/api/payment';
  }

  async getCurrentPlan(userId) {
    try {
      const response = await fetch(`${this.apiBase}/plan/${userId}`);
      if (!response.ok) throw new Error('Failed to get current plan');
      return await response.json();
    } catch (error) {
      console.error('Error getting current plan:', error);
      return { plan: PLANS.FREE, subscription: null };
    }
  }

  async createSubscription(planId, userId, paymentMethod) {
    try {
      const response = await fetch(`${this.apiBase}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userId,
          paymentMethod
        })
      });
      
      if (!response.ok) throw new Error('Failed to create subscription');
      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch(`${this.apiBase}/cancel/${subscriptionId}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to cancel subscription');
      return await response.json();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async getUsage(userId) {
    try {
      const response = await fetch(`${this.apiBase}/usage/${userId}`);
      if (!response.ok) throw new Error('Failed to get usage');
      return await response.json();
    } catch (error) {
      console.error('Error getting usage:', error);
      return {
        messagesUsed: 0,
        imagesUsed: 0,
        resetDate: new Date()
      };
    }
  }

  checkFeatureAccess(currentPlan, feature) {
    const plan = PLANS[currentPlan.toUpperCase()] || PLANS.FREE;
    
    switch (feature) {
      case 'unlimited_messages':
        return plan.limits.messagesPerDay === -1;
      case 'unlimited_images':
        return plan.limits.imagesPerDay === -1;
      case 'file_uploads':
        return plan.limits.fileUploads;
      case 'advanced_modules':
        return plan.limits.advancedModules;
      case 'business_modules':
        return plan.limits.businessModules;
      default:
        return false;
    }
  }

  formatPrice(plan) {
    if (plan.price === 0) return 'Gratuit';
    return `${plan.price}${plan.currency === 'EUR' ? '€' : '$'}/${plan.period === 'month' ? 'mois' : 'an'}`;
  }
}

export default new PaymentService();