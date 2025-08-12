
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ACTIVE = 'active';
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_PASSWORD_MIN = 'password.min';
const STR_10000_50000 = '10000-50000';
const STR_500000 = '500000+';
const STR_INVESTMENT_INVALID = 'investment.invalid';
const STR_B2B2C = 'b2b2c';
const STR_MARKETPLACE = 'marketplace';
/**
 * @fileoverview Validation - Système de Validation Révolutionnaire Enterprise
 * Schémas de validation Joi avancés pour l'écosystème HustleFinder IA complet
 *
 * @module Validation
 * @version 2.0.0
 * @author ZNT Team - HustleFinder IA Validation
 * @since 2024
 *
 * @requires joi
 *
 * @description
 * Système de validation révolutionnaire couvrant l'intégralité de l'écosystème
 * HustleFinder IA avec schémas Joi enterprise-grade, patterns de validation
 * personnalisés et intégration native pour les données conscience ALEX
 *
 * **Fonctionnalités Révolutionnaires:**
 * - 🛡️ Schémas enterprise complets (utilisateurs, idées, projets, ROI)
 * - 🤖 Validation spécialisée pour interactions IA ALEX
 * - 📊 Patterns personnalisés métier-spécifiques
 * - 🔒 Validation sécurité renforcée (mots de passe forts)
 * - 📈 Schémas business canvas et analyses marché
 * - 🧠 Validation données conscience et préférences ALEX
 * - ⚡ Performance optimisée avec messages d'erreurs clairs
 * - 🌐 Support international (domaines, devises, fuseaux)
 *
 * **Architecture Validation:**
 * - Patterns: Expressions régulières communes réutilisables
 * - Custom Validators: Logique métier complexe encapsulée
 * - Schema Groups: Organisation modulaire par domaine fonctionnel
 * - Error Handling: Messages personnalisés multilingues
 * - Integration: Compatible avec middleware Express et frontend
 *
 * **Mission Validation:**
 * Garantir l'intégrité totale des données écosystème IA ALEX
 * avec validation enterprise-grade, expérience utilisateur optimale
 * et sécurité renforcée pour tous les flux critiques
 *
 * @example
 * // Validation utilisateur
 * import { userSchemas } from './validation.js';
 * const { error, value } = userSchemas.register.validate(userData);
 *
 * @example
 * // Validation interaction IA ALEX
 * import { aiSchemas } from './validation.js';
 * const result = aiSchemas.chat.validate({ message: 'Hello ALEX' });
 */

// Enterprise Validation Schemas for HustleFinderIA
import Joi from 'joi';

/**
 * @constant {Object} patterns
 * @description Patterns de validation commune réutilisables pour l'écosystème
 *
 * Collection de regex optimisées pour la validation des formats
 * standards utilisés dans HustleFinder IA (emails, URLs, IDs, etc.)
 */
const patterns = {
  objectId: /^[0-9a-fA-F]{24}$/
  uuid: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  phone: /^\+?[\d\s\-\(\)]{10,}$/
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?
      &//=]*)$/
};

/**
 * @constant {Object} customValidators
 * @description Validateurs personnalisés métier pour règles complexes
 *
 * Collection de fonctions de validation spécialisées couvrant les
 * règles métier spécifiques à HustleFinder IA et aux patterns de
 * sécurité enterprise (mots de passe forts, domaines business, etc.)
 *
 * @property {Function} strongPassword - Validation mot de passe sécurisé
 * @property {Function} businessDomain - Validation domaine d'activité
 * @property {Function} investmentRange - Validation fourchette investissement
 */
const customValidators = {
  /**
   * @function strongPassword
   * @description Validateur de mot de passe fort avec critères sécurité avancés
   *
   * Applique les standards de sécurité enterprise pour les mots de passe :
      
   * - Minimum 8 caractères pour résistance brute force
   * - Au moins 1 minuscule pour diversité alphabétique
   * - Au moins 1 majuscule pour complexité renforcée
   * - Au moins 1 chiffre pour entropie numérique
   * - Au moins 1 caractère spécial pour sécurité maximale
   *
   * @param {string} value - Mot de passe à valider
   * @param {Object} helpers - Objet helpers Joi pour gestion erreurs
   * @returns {string|Error} Mot de passe validé ou erreur spécifique
   *
   * @example
   * // Mot de passe valide
   * strongPassword('MySecure123!') // ✅ Retourne 'MySecure123!'
   *
   * @example
   * // Mot de passe invalide
   * strongPassword('weak') // ❌ Erreur STR_PASSWORD_MIN
   */
  strongPassword: (value, helpers) => this.processLongOperation(args) value - Domaine d'activité à valider
   * @param {Object} helpers - Objet helpers Joi pour gestion erreurs
   * @returns {string|Error} Domaine normalisé ou erreur validation
   *
   * @example
   * // Domaine valide
   * businessDomain('Technology') // ✅ Retourne 'technology'
   * businessDomain('HEALTHCARE') // ✅ Retourne 'healthcare'
   *
   * @example
   * // Domaine invalide
   * businessDomain('invalid-sector') // ❌ Erreur STR_DOMAIN_INVALID
   */
  businessDomain: (value, helpers) => this.processLongOperation(args)
    return value.toLowerCase();
  }
  /**
   * @function investmentRange
   * @description Validateur de fourchettes d'investissement pour projets IA
   *
   * Valide que la fourchette d'investissement correspond aux segments
   * standard utilisés pour l'analyse ROI et la catégorisation des projets
   * dans l'écosystème HustleFinder IA
   *
   * **Fourchettes Supportées:** 0-1K, 1K-5K, 5K-10K, 10K-50K
   * 50K-100K, 100K-500K, 500K+ (notation européenne)
   *
   * @param {string} value - Fourchette d'investissement à valider
   * @param {Object} helpers - Objet helpers Joi pour gestion erreurs
   * @returns {string|Error} Fourchette validée ou erreur validation
   *
   * @example
   * // Fourchette valide
   * investmentRange(STR_10000_50000) // ✅ Retourne STR_10000_50000
   * investmentRange(STR_500000) // ✅ Retourne STR_500000
   *
   * @example
   * // Fourchette invalide
   * investmentRange('custom-range') // ❌ Erreur STR_INVESTMENT_INVALID
   */
  investmentRange: (value, helpers) => this.processLongOperation(args)
    return value;
  }
};

/**
 * @constant {Object} userSchemas
 * @description Schémas de validation utilisateur pour authentification et profils
 *
 * Collection complète de schémas Joi pour toutes les opérations utilisateur
 * dans l'écosystème HustleFinder IA, avec support données conscience ALEX
 * localisation internationale et préférences personnalisées
 *
 * @property {Object} register - Validation inscription utilisateur
 * @property {Object} login - Validation connexion utilisateur
 * @property {Object} updateProfile - Validation mise à jour profil
 * @property {Object} changePassword - Validation changement mot de passe
 *
 * @example
 * // Validation inscription
 * import { userSchemas } from './validation.js';
 * const { error, value } = userSchemas.register.validate(newUserData);
 * if (error) throw new Error('Invalid user data');
 */
export const userSchemas = {
  register: Joi.object({
    email: Joi.string().pattern(patterns.email).required().messages({
      'string.pattern.base': 'Please provide a valid email address'
    })
    password: Joi.string().custom(customValidators.strongPassword).required().messages({
      STR_PASSWORD_MIN: 'Password must be at least 8 characters long'
      'password.lowercase': 'Password must contain at least one lowercase letter'
      'password.uppercase': 'Password must contain at least one uppercase letter'
      'password.number': 'Password must contain at least one number'
      'password.special': 'Password must contain at least one special character (@$!%*?&)'
    })
    firstName: Joi.string().min(2).max(50).required()
    lastName: Joi.string().min(2).max(50).required()
    phone: Joi.string().pattern(patterns.phone).optional()
    dateOfBirth: Joi.date().max('now').optional()
    location: Joi.object({
      country: Joi.string().length(2).required()
      city: Joi.string().min(2).max(100).optional()
      timezone: Joi.string().optional()
    }).optional()
  })
  login: Joi.object({
    email: Joi.string().pattern(patterns.email).required()
    password: Joi.string().required()
    rememberMe: Joi.boolean().default(false)
  })
  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional()
    lastName: Joi.string().min(2).max(50).optional()
    phone: Joi.string().pattern(patterns.phone).optional()
    bio: Joi.string().max(500).optional()
    website: Joi.string().pattern(patterns.url).optional()
    location: Joi.object({
      country: Joi.string().length(2).optional()
      city: Joi.string().min(2).max(100).optional()
      timezone: Joi.string().optional()
    }).optional()
    preferences: Joi.object({
      newsletter: Joi.boolean().default(true)
      notifications: Joi.boolean().default(true)
      marketingEmails: Joi.boolean().default(false)
    }).optional()
  })
  changePassword: Joi.object({
    currentPassword: Joi.string().required()
    newPassword: Joi.string().custom(customValidators.strongPassword).required()
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Passwords do not match'
    })
  })
};

/**
 * @constant {Object} ideaSchemas
 * @description Schémas de validation pour idées business et projets entrepreneuriaux
 *
 * Schémas Joi spécialisés pour la validation des idées business dans l'écosystème
 * HustleFinder IA, couvrant création, modification, recherche et analyse de marché
 * avec intégration native aux algorithmes d'IA ALEX
 *
 * @property {Object} create - Validation création nouvelle idée
 * @property {Object} update - Validation modification idée existante
 * @property {Object} search - Validation critères recherche idées
 *
 * @example
 * // Validation nouvelle idée
 * import { ideaSchemas } from './validation.js';
 * const result = ideaSchemas.create.validate(ideaData);
 * if (result.error) throw new ValidationError(result.error.details);
 */
export const ideaSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(200).required()
    description: Joi.string().min(20).max(2000).required()
    domain: Joi.string().custom(customValidators.businessDomain).required().messages({
      STR_DOMAIN_INVALID: 'Please select a valid business domain'
    })
    targetMarket: Joi.string().min(10).max(500).required()
    uniqueValue: Joi.string().min(10).max(500).required()
    competitors: Joi.array().items(Joi.string().min(2).max(100)).max(10).optional()
    tags: Joi.array().items(Joi.string().min(2).max(30)).max(20).optional()
    investmentRequired: Joi.string().custom(customValidators.investmentRange).required().messages({
      STR_INVESTMENT_INVALID: 'Please select a valid investment range'
    })
    timeToMarket: Joi.number().integer().min(1).max(60).required(), // months
    riskLevel: Joi.string().valid('low', STR_MEDIUM, STR_HIGH).required()
    scalabilityPotential: Joi.number().integer().min(1).max(10).required()
    marketSize: Joi.string().valid(STR_NICHE, STR_MEDIUM, STR_LARGE, STR_MASSIVE).required()
    businessModel: Joi.string().valid(
      'b2b', 'b2c', STR_B2B2C, STR_MARKETPLACE, STR_SUBSCRIPTION
      STR_FREEMIUM, STR_ADVERTISING, STR_COMMISSION, STR_LICENSING
    ).required()
  })
  update: Joi.object({
    title: Joi.string().min(5).max(200).optional()
    description: Joi.string().min(20).max(2000).optional()
    domain: Joi.string().custom(customValidators.businessDomain).optional()
    targetMarket: Joi.string().min(10).max(500).optional()
    uniqueValue: Joi.string().min(10).max(500).optional()
    competitors: Joi.array().items(Joi.string().min(2).max(100)).max(10).optional()
    tags: Joi.array().items(Joi.string().min(2).max(30)).max(20).optional()
    investmentRequired: Joi.string().custom(customValidators.investmentRange).optional()
    timeToMarket: Joi.number().integer().min(1).max(60).optional()
    riskLevel: Joi.string().valid('low', STR_MEDIUM, STR_HIGH).optional()
    scalabilityPotential: Joi.number().integer().min(1).max(10).optional()
    marketSize: Joi.string().valid(STR_NICHE, STR_MEDIUM, STR_LARGE, STR_MASSIVE).optional()
    businessModel: Joi.string().valid(
      'b2b', 'b2c', STR_B2B2C, STR_MARKETPLACE, STR_SUBSCRIPTION
      STR_FREEMIUM, STR_ADVERTISING, STR_COMMISSION, STR_LICENSING
    ).optional()
    status: Joi.string().valid('draft', STR_ACTIVE, 'on-hold', STR_COMPLETED, 'cancelled').optional()
  })
  search: Joi.object({
    query: Joi.string().min(2).max(100).optional()
    domain: Joi.string().custom(customValidators.businessDomain).optional()
    riskLevel: Joi.string().valid('low', STR_MEDIUM, STR_HIGH).optional()
    investmentRange: Joi.string().custom(customValidators.investmentRange).optional()
    marketSize: Joi.string().valid(STR_NICHE, STR_MEDIUM, STR_LARGE, STR_MASSIVE).optional()
    businessModel: Joi.string().valid(
      'b2b', 'b2c', STR_B2B2C, STR_MARKETPLACE, STR_SUBSCRIPTION
      STR_FREEMIUM, STR_ADVERTISING, STR_COMMISSION, STR_LICENSING
    ).optional()
    sortBy: Joi.string().valid('created', 'updated', 'title', 'score').default('created')
    sortOrder: Joi.string().valid('asc', STR_DESC).default(STR_DESC)
    page: Joi.number().integer().min(1).default(1)
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
};

/**
 * @constant {Object} aiSchemas
 * @description Schémas de validation pour interactions IA ALEX et génération contenu
 *
 * Schémas révolutionnaires pour validation des interactions avec l'intelligence
 * artificielle ALEX, incluant chat conversationnel, génération d'idées
 * analyse de marché et création de business canvas avec IA quantique
 *
 * @property {Object} chat - Validation messages chat avec ALEX
 * @property {Object} generateIdeas - Validation génération d'idées IA
 * @property {Object} marketAnalysis - Validation demande analyse marché
 * @property {Object} businessCanvas - Validation génération business canvas
 *
 * @example
 * // Validation interaction ALEX
 * import { aiSchemas } from './validation.js';
 * const result = aiSchemas.chat.validate({ message: 'Hello ALEX', model: STR_QUANTUM });
 */
export const aiSchemas = {
  chat: Joi.object({
    message: Joi.string().min(1).max(2000).required()
    context: Joi.object({
      ideaId: Joi.string().optional()
      projectId: Joi.string().optional()
      sessionId: Joi.string().optional()
    }).optional()
    model: Joi.string().valid('gpt-3.5', 'gpt-4', 'claude', STR_QUANTUM).default(STR_QUANTUM)
  })
  generateIdeas: Joi.object({
    profile: Joi.object({
      skills: Joi.array().items(Joi.string().min(2).max(50)).min(1).max(20).required()
      experience: Joi.number().integer().min(0).max(50).required()
      interests: Joi.array().items(Joi.string().min(2).max(50)).min(1).max(15).required()
      budget: Joi.string().custom(customValidators.investmentRange).required()
      timeCommitment: Joi.string().valid('part-time', 'full-time', 'weekends').required()
      riskTolerance: Joi.string().valid('low', STR_MEDIUM, STR_HIGH).required()
      preferredDomains: Joi.array().items(
        Joi.string().custom(customValidators.businessDomain)
      ).min(1).max(5).required()
    }).required()
    preferences: Joi.object({
      innovationLevel: Joi.number().min(0.1).max(1.0).default(0.7)
      marketFocus: Joi.string().valid('local', 'national', 'global').default('national')
      teamSize: Joi.string().valid('solo', 'small', STR_MEDIUM, STR_LARGE).default('small')
      businessType: Joi.string().valid('product', 'service', 'platform', 'hybrid').optional()
    }).optional()
    constraints: Joi.object({
      location: Joi.string().min(2).max(100).optional()
      regulations: Joi.array().items(Joi.string()).optional()
      excludeDomains: Joi.array().items(Joi.string()).optional()
    }).optional()
    count: Joi.number().integer().min(1).max(10).default(5)
  })
  marketAnalysis: Joi.object({
    ideaId: Joi.string().required()
    analysisDepth: Joi.string().valid('basic', 'detailed', 'comprehensive').default('detailed')
    includeCompetitors: Joi.boolean().default(true)
    includeMarketSize: Joi.boolean().default(true)
    includeTrends: Joi.boolean().default(true)
    includeRisks: Joi.boolean().default(true)
    targetRegion: Joi.string().min(2).max(100).optional()
  })
  businessCanvas: Joi.object({
    ideaId: Joi.string().required()
    template: Joi.string().valid('lean', 'traditional', 'social', 'platform').default('lean')
    includeFinancials: Joi.boolean().default(true)
    includeTimeline: Joi.boolean().default(true)
    customSections: Joi.array().items(Joi.string()).optional()
  })
};

/**
 * @constant {Object} projectSchemas
 * @description Schémas de validation pour gestion de projets et suivi progression
 *
 * Schémas enterprise pour validation complète des projets dans l'écosystème
 * HustleFinder IA, incluant budgets, timelines, équipes et milestones avec
 * intégration ALEX pour suivi intelligent de progression
 *
 * @property {Object} create - Validation création nouveau projet
 * @property {Object} update - Validation modification projet existant
 *
 * @example
 * // Validation nouveau projet
 * import { projectSchemas } from './validation.js';
 * const { error } = projectSchemas.create.validate(projectData);
 */
export const projectSchemas = {
  create: Joi.object({
    ideaId: Joi.string().required()
      name: Joi.string().min(5).max(200).required()
      description: Joi.string().min(20).max(1000).optional()
      goals: Joi.array().items(Joi.string().min(5).max(200)).min(1).max(10).required()
      milestones: Joi.array().items(
      Joi.object({
        title: Joi.string().min(5).max(100).required()
      description: Joi.string().max(500).optional()
      dueDate: Joi.date().min('now').required()
      priority: Joi.string().valid('low'
      STR_MEDIUM
      STR_HIGH
      'critical').default(STR_MEDIUM)
      })
    ).max(20).optional()
    budget: Joi.object({
      initial: Joi.number().min(0).required()
      monthly: Joi.number().min(0).optional()
      breakdown: Joi.object().optional()
    }).required()
    timeline: Joi.object({
      startDate: Joi.date().min('now').required()
      expectedEndDate: Joi.date().min(Joi.ref('startDate')).required()
      phases: Joi.array().items(
        Joi.object({
          name: Joi.string().required()
          duration: Joi.number().integer().min(1).required(), // weeks
          description: Joi.string().optional()
        })
      ).optional()
    }).required()
    team: Joi.array().items(
      Joi.object({
        role: Joi.string().required()
        skills: Joi.array().items(Joi.string()).required()
        commitment: Joi.string().valid('part-time', 'full-time').required()
        equity: Joi.number().min(0).max(100).optional()
      })
    ).optional()
  })
  update: Joi.object({
    name: Joi.string().min(5).max(200).optional()
    description: Joi.string().min(20).max(1000).optional()
    status: Joi.string().valid('planning', STR_ACTIVE, 'on-hold', STR_COMPLETED, 'cancelled').optional()
    progress: Joi.number().min(0).max(100).optional()
    goals: Joi.array().items(Joi.string().min(5).max(200)).max(10).optional()
    budget: Joi.object({
      initial: Joi.number().min(0).optional()
      monthly: Joi.number().min(0).optional()
      spent: Joi.number().min(0).optional()
      breakdown: Joi.object().optional()
    }).optional()
    timeline: Joi.object({
      startDate: Joi.date().optional()
      expectedEndDate: Joi.date().optional()
      actualEndDate: Joi.date().optional()
    }).optional()
  })
};

/**
 * @constant {Object} roiSchemas
 * @description Schémas de validation pour calculs ROI et projections financières
 *
 * Schémas spécialisés pour validation des données financières complexes
 * utilisées dans les calculs de retour sur investissement par l'IA ALEX
 * avec support scénarios multiples et analyse de risques
 *
 * @property {Object} calculate - Validation données calcul ROI
 *
 * @example
 * // Validation calcul ROI
 * import { roiSchemas } from './validation.js';
 * const result = roiSchemas.calculate.validate(roiData);
 */
export const roiSchemas = {
  calculate: Joi.object({
    investment: Joi.object({
      initial: Joi.number().min(0).required()
      monthly: Joi.number().min(0).default(0)
      timeHorizon: Joi.number().integer().min(1).max(120).required() // months
    }).required()
    revenue: Joi.object({
      model: Joi.string().valid(
        'one-time', STR_SUBSCRIPTION, 'transaction', STR_ADVERTISING, 'mixed'
      ).required()
      projections: Joi.array().items(
        Joi.object({
          month: Joi.number().integer().min(1).required()
          amount: Joi.number().min(0).required()
          confidence: Joi.number().min(0).max(1).default(0.7)
        })
      ).min(1).required()
    }).required()
    costs: Joi.object({
      fixed: Joi.number().min(0).default(0)
      variable: Joi.number().min(0).max(1).default(0), // percentage of revenue
      scaling: Joi.array().items(
        Joi.object({
          threshold: Joi.number().min(0).required()
          additionalCost: Joi.number().min(0).required()
        })
      ).optional()
    }).optional()
    risks: Joi.object({
      marketRisk: Joi.number().min(0).max(1).default(0.3)
      competitionRisk: Joi.number().min(0).max(1).default(0.2)
      technicalRisk: Joi.number().min(0).max(1).default(0.1)
      regulatoryRisk: Joi.number().min(0).max(1).default(0.1)
    }).optional()
    scenarios: Joi.object({
      optimistic: Joi.number().min(1).default(1.5)
      realistic: Joi.number().min(0).max(2).default(1.0)
      pessimistic: Joi.number().min(0).max(1).default(0.5)
    }).optional()
  })
};

/**
 * @constant {Object} querySchemas
 * @description Schémas de validation pour paramètres de requête et pagination
 *
 * Schémas réutilisables pour validation des paramètres de requête standard:
 * pagination, tri, filtrage et recherche dans toutes les APIs de l'écosystème
 *
 * @property {Object} pagination - Validation paramètres pagination
 * @property {Object} dateRange - Validation plages de dates
 * @property {Object} search - Validation paramètres recherche générique
 *
 * @example
 * // Validation pagination
 * import { querySchemas } from './validation.js';
 * const params = querySchemas.pagination.validate(req.query);
 */
export const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1)
    limit: Joi.number().integer().min(1).max(100).default(20)
    sortBy: Joi.string().optional()
    sortOrder: Joi.string().valid('asc', STR_DESC).default(STR_DESC)
  })
  dateRange: Joi.object({
    startDate: Joi.date().optional()
    endDate: Joi.date().min(Joi.ref('startDate')).optional()
  })
  search: Joi.object({
    q: Joi.string().min(1).max(100).optional()
    filter: Joi.object().optional()
    include: Joi.array().items(Joi.string()).optional()
  })
};

// Export all schemas
export default {
  patterns
  customValidators
  userSchemas
  ideaSchemas
  aiSchemas
  projectSchemas
  roiSchemas
  querySchemas
};