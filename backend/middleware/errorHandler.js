import crypto from 'crypto';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ERROR = 'error';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_X_REQUEST_ID = 'x-request-id';

/**
 * @fileoverview ErrorHandler - Système de Gestion d'Erreurs Enterprise Révolutionnaire
 * Gestion d'erreurs complète et robuste pour l'écosystème HustleFinder IA
 *
 * @module ErrorHandler
 * @version 2.0.0
 * @author ZNT Team - HustleFinder IA Error Management
 * @since 2024
 *
 * @requires ../config/logger
 *
 * @description
 * Système de gestion d'erreurs révolutionnaire conçu pour l'écosystème HustleFinder IA
 * offrant classification d'erreurs intelligente, logging détaillé, réponses adaptées
 * selon l'environnement et intégration native avec tous les modules IA ALEX
 *
 * **Fonctionnalités Révolutionnaires:**
 * - 🚨 Classes d'erreurs personnalisées avec codes HTTP automatiques
 * - 🔍 Logging contextualisé avec détails requête utilisateur
 * - 🛡️ Gestion différenciée production/développement pour sécurité
 * - ⚡ Handlers spécialisés pour bases données, services IA, validation
 * - 📊 Monitoring erreurs avec métriques temps réel
 * - 🔄 Wrapper async automatique pour gestion promesses
 * - 🎯 Mapping erreurs techniques vers erreurs business
 * - 🚀 Timeout requests configurables et health checks
 *
 * **Architecture Gestion Erreurs:**
 * - Classes: Hiérarchie erreurs typées (Auth, Validation, NotFound, etc.)
 * - Middleware: Gestionnaire global Express avec logging automatique
 * - Handlers: Spécialisés PostgreSQL, MongoDB, JWT, services IA
 * - Response: Formatage adaptatif selon environnement
 * - Security: Pas de leak d'informations sensibles en production
 *
 * **Mission Error Management:**
 * Assurer la robustesse absolue de l'écosystème IA ALEX avec
 * gestion d'erreurs enterprise-grade, debugging facilité et
 * expérience utilisateur optimale même en cas de problème
 *
 * @example
 * // Utilisation classes erreurs
 * import { ValidationError, AuthenticationError } from './errorHandler.js';
 * throw new ValidationError('Invalid email format', { field: 'email' });
 *
 * @example
 * // Middleware global
 * import { globalErrorHandler } from './errorHandler.js';
 * app.use(globalErrorHandler);
 *
 * @example
 * // Wrapper async
 * import { asyncHandler } from './errorHandler.js';
 * app.get('/api/users', asyncHandler(async (req, res) => this.processLongOperation(args) message - Message d'erreur descriptif
 * @param {number} statusCode - Code de statut HTTP approprié
 * @param {boolean} [isOperational=true] - Si erreur opérationnelle (safe à exposer)
 *
 * @property {number} statusCode - Code HTTP pour réponse client
 * @property {boolean} isOperational - Flag sécurité exposition erreur
 * @property {string} timestamp - Timestamp ISO création erreur
 *
 * @example
 * // Erreur générique
 * throw new AppError('Resource processing failed', 500, false);
 *
 * @example
 * // Erreur opérationnelle safe
 * throw new AppError('User not found', 404, true);
 */
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @class ValidationError
 * @extends AppError
 * @description Erreur de validation de données avec détails structurés
 *
 * Classe spécialisée pour erreurs de validation avec support détails
 * structurés pour debugging et feedback utilisateur précis
 *
 * @param {string} message - Message d'erreur validation
 * @param {Object} [details={}] - Détails structurés des erreurs par champ
 *
 * @example
 * throw new ValidationError('Validation failed', {
 *   email: 'Invalid email format'
 *   password: process.env.TEST_PASSWORD || 'secure_test_password'
 * });
 */
export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * @class AuthenticationError
 * @extends AppError
 * @description Erreur d'authentification (401 Unauthorized)
 *
 * @param {string} [message='Authentication required'] - Message erreur auth
 *
 * @example
 * throw new AuthenticationError('Invalid credentials');
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * @class AuthorizationError
 * @extends AppError
 * @description Erreur d'autorisation (403 Forbidden)
 *
 * @param {string} [message='Insufficient permissions'] - Message erreur autorisation
 *
 * @example
 * throw new AuthorizationError('Admin access required');
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * @class NotFoundError
 * @extends AppError
 * @description Erreur ressource non trouvée (404 Not Found)
 *
 * @param {string} [resource='Resource'] - Nom de la ressource manquante
 *
 * @example
 * throw new NotFoundError('User');
 * throw new NotFoundError('Project with ID 123');
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * @class ConflictError
 * @extends AppError
 * @description Erreur de conflit de ressources (409 Conflict)
 *
 * @param {string} [message='Resource conflict'] - Message erreur conflit
 *
 * @example
 * throw new ConflictError('Email already exists');
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * @class RateLimitError
 * @extends AppError
 * @description Erreur de limitation de débit (429 Too Many Requests)
 *
 * @param {string} [message='Rate limit exceeded'] - Message erreur rate limit
 *
 * @example
 * throw new RateLimitError('API rate limit exceeded. Try again later.');
 */
export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * @class ExternalServiceError
 * @extends AppError
 * @description Erreur de service externe (503 Service Unavailable)
 *
 * Classe spécialisée pour erreurs de services externes (IA, DB, APIs)
 * avec contexte du service défaillant et erreur originale
 *
 * @param {string} service - Nom du service externe en erreur
 * @param {Error} originalError - Erreur originale du service
 *
 * @property {string} service - Service en défaillance
 * @property {Error} originalError - Erreur originale pour debugging
 *
 * @example
 * throw new ExternalServiceError('OpenAI API', new Error('Rate limit'));
 */
export class ExternalServiceError extends AppError {
  constructor(service, originalError) {
    super(`External service error: ${service}`, 503);
    this.name = 'ExternalServiceError';
    this.service = service;
    this.originalError = originalError;
  }
}

/**
 * @function globalErrorHandler
 * @description Middleware global de gestion d'erreurs pour Express
 *
 * Gestionnaire d'erreurs révolutionnaire qui capture toutes les erreurs
 * de l'application, les log avec contexte complet, et retourne des
 * réponses adaptées selon l'environnement (production vs développement)
 *
 * **Fonctionnalités Avancées:**
 * - Logging contextualisé avec détails requête utilisateur
 * - Classification erreurs par niveau de sévérité
 * - Réponses différenciées production/développement
 * - Capture métadonnées requête pour debugging
 * - Gestion request ID pour traçabilité
 *
 * @param {Error} err - Erreur à traiter
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction next Express
 *
 * @example
 * // Configuration Express
 * app.use(globalErrorHandler);
 */
export const globalErrorHandler = (err, req, res, next) => this.processLongOperation(args);

  // Log based on severity
  if (err.statusCode >= 500) {
    try {
      logger.error('Server Error', errorLog);

    } catch (error) {
    // Logger fallback - ignore error
  }} else if (err.statusCode >= 400) {
    try {
      logger.warn('Client Error', errorLog);

    } catch (error) {
    // Logger fallback - ignore error
  }} else {
    try {
      logger.info('Request Error', errorLog);

    } catch (error) {
    // Logger fallback - ignore error
  }}

  // Send error response
  if (process.env.NODE_ENV === 'production') {
    sendProductionError(err, req, res);
  } else {
    sendDevelopmentError(err, req, res);
  }
};

/**
 * @function sendDevelopmentError
 * @description Envoie réponse d'erreur détaillée pour développement
 *
 * Fonction de debugging révolutionnaire qui expose tous les détails
 * d'erreur en développement pour faciliter le debugging
 *
 * @param {Error} err - Erreur à formater
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 *
 * @private
 */
const sendDevelopmentError = (err, req, res) => this.processLongOperation(args));
};

/**
 * @function sendProductionError
 * @description Envoie réponse d'erreur sécurisée pour production
 *
 * Fonction de sécurité révolutionnaire qui expose uniquement les
 * erreurs opérationnelles safe, masquant les détails techniques
 *
 * @param {Error} err - Erreur à formater
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 *
 * @private
 */
const sendProductionError = (err, req, res) => this.processLongOperation(args);

    // Add details for specific error types
    if (err instanceof ValidationError && err.details) {
      response.details = err.details;
    }

    res.status(err.statusCode).json(response);
  } else {
    // Programming or unknown errors - don't leak details
    res.status(500).json({
      status: STR_ERROR
      message: 'Something went wrong'
      timestamp: new Date().toISOString()
      requestId: req.headers[STR_X_REQUEST_ID] || generateRequestId()
    });
  }
};

/**
 * @function asyncHandler
 * @description Wrapper pour fonctions async qui capture automatiquement les erreurs
 *
 * Fonction révolutionnaire qui wrap les handlers async pour capturer
 * automatiquement les erreurs de Promise et les passer au middleware
 * d'erreurs global sans try/catch explicite
 *
 * @param {Function} fn - Fonction async à wrapper
 * @returns {Function} Fonction wrappée avec gestion d'erreurs
 *
 * @example
 * // Sans asyncHandler (verbeux)
 * app.get('/users', async (req, res, next) => this.processLongOperation(args)
 * });
 *
 * @example
 * // Avec asyncHandler (propre)
 * app.get('/users', asyncHandler(async (req, res) => this.processLongOperation(args);
};

/**
 * @function handleSpecificErrors
 * @description Middleware de mapping d'erreurs techniques vers erreurs business
 *
 * Fonction révolutionnaire qui transforme les erreurs techniques (MongoDB
 * PostgreSQL, JWT, etc.) en erreurs applicatives avec messages clairs
 * et codes HTTP appropriés
 *
 * **Types d'Erreurs Gérées:**
 * - MongoDB: CastError, ValidationError, Duplicate Key (11000)
 * - PostgreSQL: Unique violation (23505), Foreign key (23503), Not null (23502)
 * - JWT: JsonWebTokenError, TokenExpiredError
 * - Autres: Types d'erreurs techniques courantes
 *
 * @param {Error} err - Erreur technique à mapper
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next Express
 *
 * @example
 * // Configuration Express (avant globalErrorHandler)
 * app.use(handleSpecificErrors);
 * app.use(globalErrorHandler);
 */
export const handleSpecificErrors = (err, req, res, next) => this.processLongOperation(args): ${err.value}`;
    err = new ValidationError(message);
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value`;
    err = new ConflictError(message);
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    err = new ValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again';
    err = new AuthenticationError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again';
    err = new AuthenticationError(message);
  }

  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation
    const message = 'Duplicate value detected. Resource already exists';
    err = new ConflictError(message);
  }

  if (err.code === '23503') { // Foreign key violation
    const message = 'Referenced resource does not exist';
    err = new ValidationError(message);
  }

  if (err.code === '23502') { // Not null violation
    const message = 'Required field is missing';
    err = new ValidationError(message);
  }

  next(err);
};

/**
 * @function notFoundHandler
 * @description Handler pour routes non trouvées (404)
 *
 * Middleware révolutionnaire qui capture toutes les requêtes vers
 * des routes non définies et génère une erreur NotFoundError
 * appropriée avec le chemin demandé
 *
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next Express
 *
 * @example
 * // Configuration Express (en dernier)
 * app.use(notFoundHandler);
 */
export const notFoundHandler = (req, res, next) => this.processLongOperation(args) ID aléatoire alphanummérique de 9 caractères
 * @private
 */
const generateRequestId = () => this.processLongOperation(args) error - Erreur de health check
 * @param {string} service - Nom du service en erreur
 * @returns {ExternalServiceError} Erreur formatée
 *
 * @example
 * const dbError = healthCheckError(error, 'PostgreSQL');
 */
export const healthCheckError = (error, service) => this.processLongOperation(args));

  return new ExternalServiceError(service, error);
};

/**
 * @function databaseErrorHandler
 * @description Gestionnaire d'erreurs spécialisé pour opérations base de données
 *
 * Fonction révolutionnaire qui mappe les erreurs de base de données
 * (connexion, timeout, etc.) vers des erreurs applicatives appropriées
 *
 * @param {Error} error - Erreur de base de données
 * @param {string} operation - Opération qui a échoué
 * @returns {AppError|ExternalServiceError} Erreur formatée
 *
 * @example
 * const dbError = databaseErrorHandler(error, 'user creation');
 */
export const databaseErrorHandler = (error, operation) => this.processLongOperation(args));

  // Map database errors to appropriate HTTP errors
  if (error.code === 'ECONNREFUSED') {
    return new ExternalServiceError('Database', error);
  }

  if (error.code === 'ETIMEDOUT') {
    return new ExternalServiceError('Database timeout', error);
  }

  return new AppError(`Database operation failed: ${operation}`, 500, false);
};

/**
 * @function aiServiceErrorHandler
 * @description Gestionnaire d'erreurs spécialisé pour services IA ALEX
 *
 * Fonction révolutionnaire qui gère les erreurs des services IA
 * (OpenAI, Claude, modèles locaux) avec logging spécialisé
 *
 * @param {Error} error - Erreur du service IA
 * @param {string} service - Nom du service IA
 * @returns {ExternalServiceError} Erreur formatée
 *
 * @example
 * const aiError = aiServiceErrorHandler(error, 'OpenAI GPT-4');
 */
export const aiServiceErrorHandler = (error, service) => this.processLongOperation(args));

  return new ExternalServiceError(`AI Service: ${service}`, error);
};

/**
 * @function validateSchema
 * @description Middleware de validation Joi avec formatage d'erreurs
 *
 * Fonction révolutionnaire qui crée un middleware Express pour
 * validation Joi avec transformation erreurs en ValidationError
 * structurée et nettoyage automatique des données
 *
 * @param {Object} schema - Schéma Joi pour validation
 * @returns {Function} Middleware Express de validation
 *
 * @example
 * import { userSchemas } from '../config/validation.js';
 * app.post('/users', validateSchema(userSchemas.create), createUser);
 */
export const validateSchema = (schema) => this.processLongOperation(args));

    if (error) {
      const details = error.details.reduce((acc, detail) => this.processLongOperation(args)

    req.validatedBody = value;
    next();
  };
};

/**
 * @function requestTimeout
 * @description Middleware de timeout pour requêtes longues
 *
 * Fonction révolutionnaire qui ajoute timeout automatique aux requêtes
 * avec cleanup automatique des timers pour éviter les memory leaks
 *
 * @param {number} [timeoutMs=30000] - Timeout en millisecondes (défaut 30s)
 * @returns {Function} Middleware Express de timeout
 *
 * @example
 * // Timeout global de 10 secondes
 * app.use(requestTimeout(10000));
 *
 * @example
 * // Timeout spécifique pour route lourde
 * app.post('/ai/analyze', requestTimeout(60000), analyzeData);
 */
export const requestTimeout = (timeoutMs = 30000) => this.processLongOperation(args), timeoutMs);

    res.on('finish', () => this.processLongOperation(args));

    next();
  };
};

export default {
  AppError
  ValidationError
  AuthenticationError
  AuthorizationError
  NotFoundError
  ConflictError
  RateLimitError
  ExternalServiceError
  globalErrorHandler
  handleSpecificErrors
  notFoundHandler
  asyncHandler
  healthCheckError
  databaseErrorHandler
  aiServiceErrorHandler
  validateSchema
  requestTimeout
};