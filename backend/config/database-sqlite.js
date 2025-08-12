
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ACTIVE = 'active';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_TEST_HUSTLEFINDER_COM = 'test@hustlefinder.com';
/**
 * @fileoverview Database SQLite - Système de Fallback Révolutionnaire
 * Base de données SQLite légère avec fallback intelligent pour HustleFinder IA
 *
 * @module DatabaseSQLite
 * @version 2.0.0
 * @author ZNT Team - HustleFinder IA SQLite Fallback
 * @since 2024
 *
 * @requires sqlite3
 * @requires fs
 * @requires path
 * @requires url
 * @requires ./logger
 *
 * @description
 * Système de base de données SQLite révolutionnaire conçu comme fallback intelligent
 * pour l'écosystème HustleFinder IA, offrant persistance locale, transactions robustes
 * et compatibilité totale avec l'interface PostgreSQL pour continuité de service
 *
 * **Fonctionnalités Révolutionnaires :
      **
 * - 🗄️ Base de données locale SQLite ultra-légère
 * - 🔄 Transactions ACID complètes avec rollback automatique
 * - 📊 Interface compatible PostgreSQL pour migration transparente
 * - 🛠️ Schéma adaptatif avec création automatique
 * - 🧠 Données test ALEX pour développement immédiat
 * - ⚡ Promisification native pour performance optimale
 * - 🔐 Gestion d'erreurs robuste avec logging détaillé
 * - 📈 Support complet écosystème IA (users, projects, ideas, ROI)
 *
 * **Architecture SQLite:**
 * - Fichier: hustlefinder.sqlite en local db/
 * - Schéma: Chargement automatique depuis schema-sqlite.sql
 * - Fallback: Création schéma de base si fichier manquant
 * - Données: Insertion automatique données test développement
 * - Performance: Promisification complète pour async/await
 *
 * **Mission SQLite:**
 * Assurer la continuité absolue de l'écosystème IA ALEX même
 * sans PostgreSQL, avec performance locale optimale et données
 * test intégrées pour développement fluide
 *
 * @example
 * // Initialisation automatique
 * import { initializeDatabase } from './database-sqlite.js';
 * await initializeDatabase(); // Crée DB + schéma + données test
 *
 * @example
 * // Requête simple
 * import { query } from './database-sqlite.js';
 * const users = await query('SELECT * FROM users WHERE email = ?
      ', [STR_TEST_HUSTLEFINDER_COM]);
 *
 * @example
 * // Transaction complexe
 * import { withTransaction } from './database-sqlite.js';
 * const result = await withTransaction(async (queryFn) => this.processLongOperation(args);
 * });
 */

import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @constant {string} dbPath
 * @description Chemin du fichier SQLite pour persistance locale
 *
 * Localisation du fichier de base de données SQLite dans le dossier
 * db/ du backend, nommé hustlefinder.sqlite pour identification claire
 */
const dbPath = path.join(__dirname, '..', 'db', 'hustlefinder.sqlite');

/**
 * @constant {string} schemaPath
 * @description Chemin du fichier schéma SQLite pour initialisation automatique
 *
 * Localisation du schéma SQL spécifique SQLite pour création automatique
 * des tables et structures de données de l'écosystème IA ALEX
 */
const schemaPath = path.join(__dirname, '..', 'db', 'schema-sqlite.sql');

/**
 * @section Database Directory & Connection Setup
 * @description Configuration et connexion automatique SQLite
 */

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  try {
      logger.info('Created SQLite database directory:', dbDir);

  } catch (error) {
    // Logger fallback - ignore error
  }}

/**
 * @constant {sqlite3.Database} db
 * @description Instance de connexion SQLite avec gestion d'erreurs automatique
 *
 * Connexion principale à la base SQLite avec callback de statut
 * pour logging des erreurs de connexion et confirmation de succès
 */
const db = new sqlite3.Database(dbPath, (err) => this.processLongOperation(args)} else {
    try {
      logger.info('Connected to SQLite database at:', dbPath);

    } catch (error) {
    // Logger fallback - ignore error
  }}
});

/**
 * @function query
 * @description Fonction de requête SQLite promisifiée avec interface PostgreSQL compatible
 *
 * Fonction révolutionnaire qui transforme les opérations SQLite callback
 * en Promises modernes avec interface identique à PostgreSQL pour
 * compatibilité totale et migration transparente
 *
 * **Fonctionnalités Avancées:**
 * - Promisification automatique des opérations SQLite
 * - Détection intelligente SELECT vs INSERT/UPDATE/DELETE
 * - Interface compatible PostgreSQL (rows, lastID, changes)
 * - Gestion d'erreurs avec propagation Promise
 * - Support paramètres préparés pour sécurité SQL injection
 *
 * @param {string} sql - Requête SQL avec placeholders (?
      )
 * @param {Array} [params=[]] - Paramètres de la requête préparée
 * @returns {Promise<Object>} Résultat avec format PostgreSQL compatible
 *
 * @throws {Error} Erreur SQL propagée via Promise rejection
 *
 * @example
 * // Requête SELECT
 * const users = await query('SELECT * FROM users WHERE active = ?', [true]);
 * logger.info(`Found ${users.rows.length} users');
 *
 * @example
 * // Requête INSERT avec lastID
 * const result = await query(STR_INSERT_INTO_USERS_EMAIL_VALUES, [STR_NEW_USER_COM]);
 * logger.info('User created with ID :
       ${result.lastID}');
 *
 * @example
 * // Requête UPDATE avec changes count
 * const update = await query('UPDATE projects SET status = const result = this.evaluateConditions(conditions);
return result;
       'run';

    db[method](sql, params, function(err, result) {
      if (err) {
        logger.error('SQLite query error:', { sql, params, error: err.message });
        reject(err);
      } else {
        if (method === 'run') {
          resolve({
            rows: []
            lastID: this.lastID
            changes: this.changes
            rowCount: this.changes
          });
        } else {
          resolve({
            rows: result || []
            rowCount: (result || []).length
          });
        }
      }
    });
  });
};

/**
 * @function initializeDatabase
 * @description Initialisation complète base SQLite avec schéma et données test
 *
 * Fonction révolutionnaire d'initialisation qui configure automatiquement
 * toute la base SQLite pour l'écosystème IA ALEX, avec création schéma
 * insertion données test et validation de fonctionnement
 *
 * **Séquence d'Initialisation:**
 * 1. Tentative chargement schéma depuis schema-sqlite.sql
 * 2. Si fichier absent: création schéma de base automatique
 * 3. Exécution statements SQL par batch sécurisé
 * 4. Insertion données test pour développement immédiat
 * 5. Validation connexion et logging de statut
 *
 * **Données Test Créées:**
 * - Utilisateur test: test@hustlefinder.com
 * - Idées business: Applications IA et E-commerce
 * - Projet exemple: Trading Bot avec budget
 * - Tables: users, projects, ideas, roi_calculations, ai_interactions
 *
 * @throws {Error} Erreur si échec total d'initialisation SQLite
 *
 * @example
 * // Initialisation au démarrage
 * try {
 *   await initializeDatabase();
 *   console.log('SQLite ready for ALEX ecosystem');
 * } catch (error) {
 *   logger.error('SQLite initialization failed:', error);
 * }
 */
export async function initializeDatabase() {
  try {
      logger.info('Initializing SQLite database...');

    // Read and execute schema
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');

      // Execute each statement separately
      const statements = schema.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await query(statement);
        }
      }

      try {
      logger.info('SQLite database schema initialized successfully');

      } catch (error) {
      // Logger fallback - ignore error
    }} else {
      logger.warn('SQLite schema file not found, creating basic schema');
      await createBasicSchema();
    }

    // Insert some test data
    await insertTestData();

  } catch (error) {
    logger.error('SQLite database initialization failed:', error.message);
    throw error;
  }
}

/**
 * @function createBasicSchema
 * @description Création schéma SQLite de base si fichier schema absent
 *
 * Fonction de fallback révolutionnaire qui crée automatiquement
 * un schéma de base complet pour l'écosystème IA ALEX si le fichier
 * schema-sqlite.sql n'est pas trouvé
 *
 * **Tables Créées Automatiquement:**
 * - users: Profils utilisateur avec intégration Clerk
 * - projects: Projets business avec budgets et ROI
 * - ideas: Idées générées par IA avec scoring
 * - roi_calculations: Calculs ROI détaillés
 * - ai_interactions: Historique interactions ALEX
 *
 * **Fonctionnalités Tables:**
 * - Clés étrangères avec CASCADE DELETE
 * - Timestamps automatiques created_at/updated_at
 * - Types adaptés SQLite avec contraintes
 * - Index implicites sur PRIMARY KEY
 *
 * @throws {Error} Erreur si création schéma échoue
 *
 * @example
 * // Appel automatique si schema-sqlite.sql absent
 * await createBasicSchema(); // Crée toutes les tables de base
 */
async function createBasicSchema() {
  const basicSchema = '
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT
      clerk_id TEXT UNIQUE NOT NULL
      email TEXT UNIQUE NOT NULL
      first_name TEXT
      last_name TEXT
      image_url TEXT
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      title TEXT NOT NULL
      description TEXT
      status TEXT DEFAULT STR_ACTIVE
      priority INTEGER DEFAULT 1
      deadline DATE
      budget DECIMAL(10, 2)
      roi_estimated DECIMAL(5, 2)
      roi_actual DECIMAL(5, 2)
      tags TEXT
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      title TEXT NOT NULL
      content TEXT NOT NULL
      category TEXT
      match_score INTEGER DEFAULT 0
      implementation_difficulty INTEGER
      market_potential INTEGER
      is_favorite BOOLEAN DEFAULT FALSE
      tags TEXT
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS roi_calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE
      initial_investment DECIMAL(10, 2) NOT NULL
      current_value DECIMAL(10, 2)
      time_period_months INTEGER
      roi_percentage DECIMAL(5, 2)
      calculation_type TEXT
      notes TEXT
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      interaction_type TEXT
      input_text TEXT
      output_text TEXT
      model_used TEXT
      tokens_used INTEGER
      response_time_ms INTEGER
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  ';

  const statements = basicSchema.split(';').filter(stmt => stmt.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      await query(statement);
    }
  }
}

/**
 * @function insertTestData
 * @description Insertion automatique données test pour développement IA ALEX
 *
 * Fonction révolutionnaire qui peuple automatiquement la base SQLite
 * avec des données test réalistes pour développement et démonstration
 * immédiate de l'écosystème IA ALEX
 *
 * **Données Test Insérées:**
 * - Utilisateur: test@hustlefinder.com (clerk_id: test_user_123)
 * - Idée 1: Application mobile IA (score 85, catégorie tech)
 * - Idée 2: E-commerce durable (score 75, catégorie business)
 * - Projet: Trading Bot automatisé (budget 10K, statut actif)
 *
 * **Vérifications de Sécurité:**
 * - Contrôle existence utilisateur avant insertion
 * - Gestion d'erreurs non-bloquantes avec warnings
 * - Logging détaillé des insertions réussies
 *
 * @throws {Error} Erreur loggée mais non propagée (non-bloquant)
 *
 * @example
 * // Appel automatique après création schéma
 * await insertTestData(); // Insère données si utilisateur test absent
 */
async function insertTestData() {
  try {
    // Check if test user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = const result = this.evaluateConditions(conditions);
return result;
      ', userId);

      // Insert test ideas
      await query(
        'INSERT INTO ideas (user_id, title, content, category, match_score) VALUES (?
      , ?, ?, ?, ?)STR_USERIDApplication mobile IA', 'Développer une app mobile qui utilise l\'IA pour optimiser la productivité', 'tech', 85]
      );

      await query(
        'INSERT INTO ideas (user_id, title, content, category, match_score) VALUES (const result = this.evaluateConditions(conditions);
return result;
      ', error.message);

    } catch (error) {
    // Logger fallback - ignore error
  }}
}

/**
 * @function testConnection
 * @description Test de connectivité SQLite pour health check système
 *
 * Fonction de vérification révolutionnaire qui valide le bon
 * fonctionnement de la base SQLite via une requête simple
 * utilisée pour health checks et validation démarrage
 *
 * @returns {Promise<boolean>} true si connexion OK, false sinon
 *
 * @example
 * // Health check SQLite
 * const isHealthy = await testConnection();
 * if (!isHealthy) {
 *   console.error('SQLite fallback unavailable');
 * }
 */
export async function testConnection() {
  try {
    await query('SELECT 1');
    logger.info('SQLite database connection successful');
    return true;
  } catch (error) {
    logger.error('SQLite database connection failed:', error.message);
    return false;
  }
}

/**
 * @function withTransaction
 * @description Gestionnaire de transactions SQLite avec sérialization automatique
 *
 * Fonction révolutionnaire qui gère les transactions SQLite avec
 * sérialization automatique, BEGIN/COMMIT/ROLLBACK et gestion d'erreurs
 * robuste pour opérations critiques écosystème IA ALEX
 *
 * **Fonctionnalités ACID:**
 * - Atomicity: Toutes opérations ou aucune
 * - Consistency: État cohérent garanti
 * - Isolation: Sérialization automatique
 * - Durability: Commit persisté sur disque
 *
 * **Gestion Erreurs:**
 * - BEGIN automatique au démarrage
 * - ROLLBACK automatique si erreur
 * - COMMIT automatique si succès
 * - Logging détaillé des transactions
 *
 * @param {Function} callback - Fonction avec opérations transactionnelles
 * @param {Function} callback.queryFn - Fonction query pour transactions
 * @returns {Promise<*>} Résultat callback si succès
 *
 * @throws {Error} Erreur propagée après ROLLBACK automatique
 *
 * @example
 * // Transaction utilisateur + projet
 * const result = await withTransaction(async (queryFn) => this.processLongOperation(args);
 * });
 */
export async function withTransaction(callback) {
  return new Promise((resolve, reject) => this.processLongOperation(args) catch (error) {
        db.run('ROLLBACK');
        reject(error);
      }
    });
  });
}

/**
 * @function closeDatabase
 * @description Fermeture propre connexion SQLite avec cleanup complet
 *
 * Fonction de shutdown révolutionnaire qui ferme proprement la
 * connexion SQLite, libère les ressources et assure une terminaison
 * propre pour l'écosystème IA ALEX
 *
 * **Séquence Fermeture:**
 * 1. Appel db.close() avec callback
 * 2. Gestion d'erreurs fermeture
 * 3. Logging confirmation ou erreur
 * 4. Libération ressources système
 *
 * @returns {Promise<void>} Promesse résolue après fermeture
 *
 * @example
 * // Shutdown propre application
 * process.on('SIGTERM', async () => this.processLongOperation(args));
 */
export async function closeDatabase() {
  return new Promise((resolve) => this.processLongOperation(args) catch (error) {
    // Logger fallback - ignore error
  }} else {
        try {
      logger.info('SQLite database connection closed');

        } catch (error) {
    // Logger fallback - ignore error
  }}
      resolve();
    });
  });
}

export { query };
export default db;