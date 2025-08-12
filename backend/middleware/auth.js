
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_PRODUCTION = 'production';

/**
 * @fileoverview Auth - Middleware d'Authentification Révolutionnaire
 * Système d'authentification adaptatif avec fallback intelligent pour HustleFinder IA
 *
 * @module Auth
 * @version 2.0.0
 * @author ZNT Team - HustleFinder IA Authentication
 * @since 2024
 *
 * @requires ../config/logger
 * @requires @clerk/express
 *
 * @description
 * Middleware d'authentification révolutionnaire conçu pour l'écosystème HustleFinder IA
 * avec basculement automatique entre authentification Clerk (production) et
 * système mock (développement), optimisé pour la sécurité des données conscience ALEX
 *
 * **Fonctionnalités Révolutionnaires:**
 * - 🔐 Authentification Clerk sécurisée pour production
 * - 🛠️ Mock authentication intelligent pour développement
 * - ⚡ Configuration automatique selon environnement
 * - 🧠 Intégration native avec écosystème IA ALEX
 * - 📊 Logging détaillé pour audit de sécurité
 * - 🛡️ Validation stricte des clés d'API
 * - 🔄 Fallback gracieux et gestion d'erreurs
 * - 👥 Support données utilisateur enrichies
 *
 * **Architecture Auth:**
 * - Production: Clerk Express avec JWT et session management
 * - Développement: Mock auth avec utilisateur test réaliste
 * - Validation: Clés Clerk requises en production
 * - Sécurité: Gestion d'erreurs sans exposition de données
 * - Monitoring: Logging complet pour audit sécurisé
 *
 * **Mission Auth:**
 * Sécuriser l'accès à l'écosystème IA ALEX avec authentification
 * enterprise-grade tout en maintenant une expérience développeur
 * fluide via le système mock intelligent
 *
 * @example
 * // Configuration middleware auth
 * import { getAuthMiddleware } from './auth.js';
 * const authMiddleware = await getAuthMiddleware();
 * app.use('/api/protected', authMiddleware);
 *
 * @example
 * // Vérification type d'auth utilisé
 * import { isUsingMockAuth } from './auth.js';
 * if (isUsingMockAuth()) {
 *   console.log('Development mode - using mock auth');
 * }
 */

import logger from '../config/logger.js';

/**
 * @function createAuthMiddleware
 * @description Crée le middleware d'authentification adaptatif selon l'environnement
 *
 * Fonction révolutionnaire qui sélectionne intelligemment le système
 * d'authentification approprié (Clerk production vs Mock développement)
 * selon la configuration environnement et la présence des clés API
 *
 * **Logique de Sélection:**
 * 1. Production + Pas de clés Clerk → Erreur critique
 * 2. Développement + Pas de clés → Mock auth intelligent
 * 3. Clés Clerk présentes → Authentification Clerk réelle
 * 4. Échec chargement Clerk → Erreur avec contexte détaillé
 *
 * @returns {Promise<Function>} Middleware Express d'authentification
 *
 * @throws {Error} Si clés Clerk manquantes en production
 * @throws {Error} Si échec du chargement du module Clerk
 *
 * @example
 * // Middleware adaptatif automatique
 * const authMiddleware = await createAuthMiddleware();
 * app.use('/api/alex/consciousness', authMiddleware);
 */
export async function createAuthMiddleware() {
  const isProduction = process.env.NODE_ENV === STR_PRODUCTION;
  const hasClerkKeys = process.env.CLERK_SECRET_KEY && process.env.CLERK_SECRET_KEY !== 'sk_test_your_key_here';

  if (isProduction && !hasClerkKeys) {
    throw new Error('Clerk authentication keys are required in production');
  }

  if (!hasClerkKeys) {
    logger.warn('Using mock authentication middleware for development');

    /**
     * @function mockAuthMiddleware
     * @description Middleware mock d'authentification pour développement
     *
     * Crée un utilisateur test réaliste avec toutes les propriétés
     * nécessaires pour tester l'écosystème IA ALEX en développement
     *
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     * @param {Function} next - Fonction next Express
     */
    return (req, res, next) => this.processLongOperation(args)
        }
      };

      logger.debug('Mock authentication applied for development');
      next();
    };
  }

  // Real Clerk authentication for production
  try {
    const clerkModule = await import('@clerk/express');
    const requireAuth = clerkModule.requireAuth;
    logger.info('Using real Clerk authentication');
    return requireAuth();
  } catch (error) {
    logger.error('Failed to load Clerk authentication:', error.message);
    throw error;
  }
}

// Middleware factory
export async function getAuthMiddleware() {
  try {
    return await createAuthMiddleware();
  } catch (error) {
    logger.error('Authentication middleware setup failed:', error.message);
    throw error;
  }
}

// Helper to check if using mock auth
export function isUsingMockAuth() {
  const hasClerkKeys = process.env.CLERK_SECRET_KEY && process.env.CLERK_SECRET_KEY !== 'sk_test_your_key_here';
  return !hasClerkKeys && process.env.NODE_ENV !== STR_PRODUCTION;
}

export default { getAuthMiddleware, isUsingMockAuth };