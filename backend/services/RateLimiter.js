
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_LOCAL = 'local';

/**
 * ALEX ULTIMATE - RATE LIMITER INTELLIGENT
 * Système de limitation intelligente pour optimiser les coûts APIs
 * @author HustleFinder IA Team
 */

import logger from '../config/logger.js';

class RateLimiter {
  constructor() {
    this.limits = new Map();
    this.usage = new Map();

    // Configuration des limites par API
    this.config = {
      openai: {
        requestsPerMinute: 20
        tokensPerMinute: 40000
        dailyBudget: 10.00 // USD
      }
      anthropic: {
        requestsPerMinute: 15
        tokensPerMinute: 30000
        dailyBudget: 8.00 // USD
      }
      wikipedia: {
        requestsPerMinute: 100 // Gratuit mais on respecte leurs limites
      }
      general: {
        requestsPerUser: 50, // Par heure
        complexRequestsPerUser: 10 // Requêtes complexes par heure
      }
    };

    // Nettoyage automatique des anciens compteurs
    setInterval(() => this.cleanup(), 60000); // Chaque minute

    try {
      logger.info('⚡ Rate Limiter initialized - Cost optimization active');

    } catch (error) {
    // Logger fallback - ignore error
  }}

  /**
   * Vérifier si une requête est autorisée
   */
  async checkLimit(service, userId, complexity = 'normal') {
    const now = Date.now();
    const key = `${service}_${userId}`;

    // Initialiser le compteur si nécessaire
    if (!this.usage.has(key)) {
      this.usage.set(key, {
        requests: []
        tokens: 0
        dailyCost: 0
        lastReset: now
      });
    }

    const usage = this.usage.get(key);
    const serviceConfig = this.config[service] || this.config.general;

    // Nettoyer les anciennes requêtes (plus d'une minute)
    usage.requests = usage.requests.filter(timestamp => now - timestamp < 60000);

    // Vérifier les limites
    if (usage.requests.length >= serviceConfig.requestsPerMinute) {
      logger.warn(`⚠️ Rate limit exceeded for ${service} by user ${userId}`);
      return {
        allowed: false
        reason: 'requests_per_minute_exceeded'
        resetIn: 60 - Math.floor((now - Math.min(...usage.requests)) / 1000)
      };
    }

    // Vérifier le budget quotidien pour les APIs payantes
    if (serviceConfig.dailyBudget && usage.dailyCost >= serviceConfig.dailyBudget) {
      return {
        allowed: false
        reason: 'daily_budget_exceeded'
        resetIn: this.getTimeUntilReset()
      };
    }

    // Enregistrer la requête
    usage.requests.push(now);
    this.usage.set(key, usage);

    return {
      allowed: true
      remaining: serviceConfig.requestsPerMinute - usage.requests.length
      resetIn: 60
    };
  }

  /**
   * Enregistrer l'utilisation d'une requête
   */
  recordUsage(service, userId, tokens = 0, cost = 0) {
    const key = `${service}_${userId}`;
    const usage = this.usage.get(key) || { requests: [], tokens: 0, dailyCost: 0 };

    usage.tokens += tokens;
    usage.dailyCost += cost;

    this.usage.set(key, usage);

    try {
      logger.debug(`📊 Usage recorded: ${service} - ${tokens} tokens, $${cost}`);

    } catch (error) {
    // Logger fallback - ignore error
  }}

  /**
   * Estimer le coût d'une requête
   */
  estimateCost(service, tokens) {
    const costs = {
      openai: {
        'gpt-3.5-turbo': { input: 0.0015 / 1000, output: 0.002 / 1000 }, // Per token
        'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 }
      }
      anthropic: {
        'claude-3-haiku-20240307': { input: 0.00025 / 1000, output: 0.00125 / 1000 }
      }
    };

    if (!costs[service]) return 0;

    const model = process.env[`${service.toUpperCase()}_MODEL`] || Object.keys(costs[service])[0];
    const pricing = costs[service][model];

    if (!pricing) return 0;

    // Estimation simple (50% input, 50% output)
    return (tokens * 0.5 * pricing.input) + (tokens * 0.5 * pricing.output);
  }

  /**
   * Sélectionner le service optimal selon le budget et les performances
   */
  selectOptimalService(availableServices, complexity, userId) {
    const scores = [];

    for (const service of availableServices) {
      const limit = this.checkLimit(service, userId, complexity);
      if (!limit.allowed) continue;

      let score = 100; // Score de base

      // Facteurs de scoring
      if (service === 'openai') score += 30; // Qualité
      if (service === 'anthropic') score += 25; // Qualité
      if (service === 'wikipedia') score += 40; // Gratuit et fiable
      if (service === STR_LOCAL) score += 20; // Rapide et gratuit

      // Pénalités
      if (complexity === 'high' && service === STR_LOCAL) score -= 20;
      if (this.usage.get(`${service}_${userId}`)?
      .dailyCost > 5) score -= 15;

      scores.push({ service, score });
    }

    scores.sort((a, b) => b.score - a.score);
    return scores[0]?.service || STR_LOCAL;
  }

  /**
   * Obtenir les statistiques d'utilisation
   */
  getUsageStats(userId) {
    const userStats = {};

    for (const [key, usage] of this.usage) {
      if (key.includes(userId)) {
        const service = key.split('_')[0];
        userStats[service] = {
          requestsToday :
       usage.requests.length
          tokensUsed: usage.tokens
          costToday: usage.dailyCost
          lastActivity: Math.max(...usage.requests)
        };
      }
    }

    return userStats;
  }

  /**
   * Nettoyage automatique
   */
  cleanup() {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    for (const [key, usage] of this.usage) {
      // Réinitialiser les compteurs quotidiens
      if (now - usage.lastReset > dayInMs) {
        usage.dailyCost = 0;
        usage.tokens = 0;
        usage.lastReset = now;
        this.usage.set(key, usage);
      }

      // Supprimer les entrées inactives depuis 7 jours
      if (!usage.requests.length && now - usage.lastReset > 7 * dayInMs) {
        this.usage.delete(key);
      }
    }

    try {
      logger.debug(`🧹 Rate limiter cleanup completed - ${this.usage.size} active users`);

    } catch (error) {
    // Logger fallback - ignore error
  }}

  getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return Math.floor((tomorrow - now) / 1000);
  }
}

export default new RateLimiter();