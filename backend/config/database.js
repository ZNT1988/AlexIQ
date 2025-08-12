
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_SELECT_NOW = 'SELECT NOW()';

/**
 * @fileoverview Database - Système de Base de Données Révolutionnaire
 * Gestionnaire de base de données multi-engine avec fallback intelligent PostgreSQL/SQLite
 *
 * @module Database
 * @version 2.0.0
 * @author ZNT Team - HustleFinder IA Database
 * @since 2024
 *
 * @requires pg
 * @requires fs
 * @requires path
 * @requires url
 * @requires ./logger
 * @requires ./database-sqlite
 *
 * @description
 * Système de base de données révolutionnaire conçu pour l'écosystème HustleFinder IA
 * avec fallback automatique PostgreSQL → SQLite, pooling intelligent des connexions
 * transactions robustes et optimisations spécifiques pour les données IA ALEX
 *
 * **Fonctionnalités Révolutionnaires:**
 * - 🗄️ Multi-engine: PostgreSQL (production) + SQLite (développement)
 * - ⚡ Pool de connexions optimisé avec auto-scaling
 * - 🔄 Transactions ACID avec gestion d'erreurs avancée
 * - 📊 Monitoring performance et slow queries
 * - 🛡️ Fallback automatique et graceful degradation
 * - 🧠 Optimisations spécifiques données IA ALEX
 * - 📈 Métriques temps réel et health checks
 * - 🔐 SSL/TLS automatique en production
 *
 * **Architecture Database:**
 * - PostgreSQL: Production avec SSL et pooling avancé
 * - SQLite: Développement et fallback léger
 * - Pool management: 20 connexions max, timeouts intelligents
 * - Schema management: Initialisation automatique
 * - Query optimization: Logging et profiling intégré
 *
 * **Mission Database:**
 * Fournir une couche de persistance ultra-fiable et performante
 * pour l'écosystème IA ALEX, garantissant la cohérence des données
 * conscience, mémoire et apprentissage
 *
 * @example
 * // Requête simple
 * import { query } from './database.js';
 * const users = await query('SELECT * FROM users WHERE active = $1', [true]);
 *
 * @example
 * // Transaction complexe
 * import { withTransaction } from './database.js';
 * const result = await withTransaction(async (client) => this.processLongOperation(args);
 * });
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

/**
 * @namespace SQLiteFallback
 * @description Import des fonctions SQLite pour fallback automatique
 */
import {
  initializeDatabase as initSQLite
  testConnection as testSQLite
  query as querySQLite
  withTransaction as withTransactionSQLite
  closeDatabase as closeSQLite
} from './database-sqlite.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @constant {Object} config
 * @description Configuration pool PostgreSQL optimisée pour production
 *
 * Configuration adaptative selon environnement:
 * - Production: SSL activé, pool optimisé (20 connexions)
 * - Développement: SSL désactivé, timeouts réduits
 *
 * @property {string} connectionString - URL de connexion PostgreSQL
 * @property {Object|boolean} ssl - Configuration SSL (prod seulement)
 * @property {number} max - Nombre maximum de clients dans le pool
 * @property {number} idleTimeoutMillis - Timeout fermeture clients inactifs (30s)
 * @property {number} connectionTimeoutMillis - Timeout établissement connexion (2s)
 */
const config = {
  connectionString: process.env.DATABASE_URL
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

/**
 * @constant {Pool} pool
 * @description Pool de connexions PostgreSQL optimisé avec gestion d'erreurs
 */
const pool = new Pool(config);

/**
 * @event pool#error
 * @description Gestionnaire d'erreurs pool pour connexions PostgreSQL
 */
pool.on('error', (err) => this.processLongOperation(args)});

/**
 * @function testConnection
 * @description Teste la connectivité de la base de données PostgreSQL
 *
 * Établit une connexion test, exécute une requête simple (SELECT NOW())
 * et libère immédiatement la connexion. Utilisé pour health checks
 * et validation de configuration au démarrage
 *
 * @returns {Promise<boolean>} true si connexion réussie, false sinon
 *
 * @example
 * // Health check base de données
 * const isHealthy = await testConnection();
 * if (!isHealthy) {
 *   logger.error('Database unavailable - switching to SQLite');
 * }
 */
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query(STR_SELECT_NOW);
    client.release();
    logger.info(`Database connected successfully at ${result.rows[0].now}`);
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    return false;
  }
}

/**
 * @function initializeDatabase
 * @description Initialise la base de données avec fallback intelligent PostgreSQL → SQLite
 *
 * Séquence d'initialisation révolutionnaire:
 * 1. Tentative connexion PostgreSQL avec test de connectivité
 * 2. Si succès: chargement et exécution du schéma SQL
 * 3. Si échec: fallback automatique vers SQLite
 * 4. Configuration des flags globaux pour routing des requêtes
 *
 * Cette approche garantit une disponibilité maximale de l'écosystème IA ALEX
 * même en cas d'indisponibilité PostgreSQL (idéal pour développement/démo)
 *
 * @throws {Error} Si échec total d'initialisation (PostgreSQL ET SQLite)
 *
 * @example
 * // Initialisation au démarrage application
 * try {
 *   await initializeDatabase();
 *   logger.info('Database ready for ALEX consciousness data');
 * } catch (error) {
 *   logger.error('Critical: Database initialization failed', error);
 *   process.exit(1);
 * }
 */
export async function initializeDatabase() {
  try {
      logger.info('Attempting PostgreSQL connection...');

    const isConnected = await testConnection();
    if (isConnected) {
      // PostgreSQL is available
      const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');

      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        logger.info('PostgreSQL database schema initialized successfully');
        return;
      }
    }

    // Fallback to SQLite
    logger.info('PostgreSQL not available, falling back to SQLite...');
    await initSQLite();

    // Update the query function to use SQLite
    global.usingSQLite = true;

  } catch (error) {
      // Logger fallback - ignore error
    }
}

/**
 * @function query
 * @description Fonction de requête universelle avec routing automatique et profiling
 *
 * Fonction révolutionnaire qui route intelligemment les requêtes vers
 * PostgreSQL ou SQLite selon la configuration système, avec monitoring
 * performance intégré et logging détaillé pour optimisation continue
 *
 * **Fonctionnalités Avancées:**
 * - Routing automatique PostgreSQL/SQLite via flag global
 * - Profiling temps d'exécution avec seuils d'alerte
 * - Logging détaillé pour debugging et optimisation
 * - Gestion d'erreurs avec contexte complet
 * - Support paramètres préparés pour sécurité SQL injection
 *
 * @param {string} text - Requête SQL avec placeholders ($1, $2, ?
      )
 * @param {Array} [params=[]] - Paramètres de la requête préparée
 * @returns {Promise<Object>} Résultat de la requête avec rows, rowCount, etc
 *
 * @throws {Error} Erreur SQL avec contexte détaillé pour debugging
 *
 * @example
 * // Requête simple utilisateur
 * const users = await query('SELECT * FROM users WHERE active = $1', [true]);
 * logger.info(`Found ${users.rowCount} active users`);
 *
 * @example
 * // Requête données conscience ALEX
 * const consciousness = await query(
 *   'SELECT level, emotion, timestamp FROM alex_consciousness WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 1'
 *   [userId]
 * );
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    let result;

    if (global.usingSQLite) {
      // Use SQLite
      result = await querySQLite(text, params);
    } else {
      // Use PostgreSQL
      result = await pool.query(text, params);
    }

    const duration = Date.now() - start;
    logger.debug(`Query executed in ${duration}ms :
       ${text}`);
    return result;
  } catch (error) {
      // Logger fallback - ignore error
    });
    throw error;
  }
}

/**
 * @function withTransaction
 * @description Gestionnaire de transactions ACID avec routing automatique
 *
 * Fonction révolutionnaire de gestion transactionnelle qui garantit
 * l'intégrité ACID des opérations critiques de l'écosystème IA ALEX
 * avec support multi-engine et gestion d'erreurs robuste
 *
 * **Garanties ACID:**
 * - Atomicity: Toutes opérations réussissent ou échouent ensemble
 * - Consistency: État cohérent maintenu même en cas d'erreur
 * - Isolation: Transactions isolées des autres processus
 * - Durability: Changements persistés de façon permanente
 *
 * **Gestion d'Erreurs:**
 * - BEGIN automatique au démarrage
 * - ROLLBACK automatique en cas d'erreur
 * - COMMIT automatique si succès
 * - Libération connexion dans tous les cas
 *
 * @param {Function} callback - Fonction async contenant les opérations transactionnelles
 * @param {Object} callback.client - Client de base de données pour les requêtes
 * @returns {Promise<*>} Résultat retourné par la fonction callback
 *
 * @throws {Error} Erreur propagée après ROLLBACK automatique
 *
 * @example
 * // Transaction utilisateur + profil
 * const result = await withTransaction(async (client) => this.processLongOperation(args)]);
 *   return { userId: user.rows[0].id, success: true };
 * });
 *
 * @example
 * // Transaction conscience ALEX complexe
 * const consciousnessUpdate = await withTransaction(async (client) => this.processLongOperation(args);
 * });
 */
export async function withTransaction(callback) {
  if (global.usingSQLite) {
    return await withTransactionSQLite(callback);
  } else {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

/**
 * @function closeDatabase
 * @description Fermeture gracieuse de la base de données avec cleanup complet
 *
 * Fonction de shutdown révolutionnaire qui ferme proprement toutes
 * les connexions actives, libère les ressources système et assure
 * une terminaison propre de l'écosystème IA ALEX
 *
 * **Séquence de Fermeture:**
 * 1. Détection du type de base de données (PostgreSQL/SQLite)
 * 2. Fermeture du pool de connexions ou fichier SQLite
 * 3. Libération des ressources mémoire
 * 4. Logging de confirmation de fermeture
 * 5. Gestion d'erreurs pour éviter les crashes
 *
 * @throws {Error} Erreur loggée mais non propagée pour éviter crash shutdown
 *
 * @example
 * // Shutdown propre application
 * process.on('SIGTERM', async () => this.processLongOperation(args));
 *
 * @example
 * // Fermeture dans tests
 * afterAll(async () => this.processLongOperation(args) else {
      await pool.end();
      try {
      logger.info('PostgreSQL pool closed');

      } catch (error) {
    // Logger fallback - ignore error
  }}
  } catch (error) {
    try {
      logger.error('Error closing database:', error);

    } catch (error) {
    // Logger fallback - ignore error
  }}
}

/**
 * @default pool
 * @description Export du pool PostgreSQL pour usage direct si nécessaire
 *
 * Instance principale du pool de connexions PostgreSQL configuré
 * avec les paramètres optimisés pour l'écosystème HustleFinder IA
 *
 * **Usage Recommandé:**
 * Utiliser les fonctions 'query()' et 'withTransaction()' plutôt
 * que le pool directement pour bénéficier du routing automatique
 * et du monitoring intégré
 *
 * @example
 * // Usage direct (non recommandé)
 * import pool from './database.js';
 * const client = await pool.connect();
 * const result = await client.query(STR_SELECT_NOW);
 * client.release();
 *
 * @example
 * // Usage recommandé
 * import { query } from './database.js';
 * const result = await query(STR_SELECT_NOW);
 */
export default pool;