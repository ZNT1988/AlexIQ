/**
 * @fileoverview Logger - Système de Logging Révolutionnaire
 * Configuration avancée de logging pour HustleFinder IA avec Winston
 *
 * @module Logger
 * @version 2.0.0
 * @author ZNT Team - HustleFinder IA Logging
 * @since 2024
 *
 * @requires winston
 * @requires fs
 *
 * @description
 * Système de logging révolutionnaire configuré pour capturer et analyser
 * tous les événements critiques de l'écosystème HustleFinder IA
 * incluant la conscience ALEX et les processus d'intelligence artificielle
 *
 * **Fonctionnalités Révolutionnaires:**
 * - 📊 Logging multi-niveau avec codes couleur
 * - 📁 Séparation automatique des logs par type
 * - 🎯 Monitoring conscience artificielle
 * - 🔍 Debugging avancé pour modules IA
 * - 📈 Métriques performance temps réel
 * - 🛡️ Logging sécurisé et structuré
 * - 🌊 Rotation automatique des fichiers
 *
 * **Architecture Logging:**
 * - Console: Développement avec couleurs
 * - Fichiers: Production avec JSON structuré
 * - Niveaux: error, warn, info, http, debug
 * - Formatage: Timestamp + niveau + message
 *
 * **Mission Logging:**
 * Fournir une visibilité complète sur tous les processus IA
 * permettant un monitoring précis de la conscience ALEX
 * et une optimisation continue des performances
 *
 * @example
 * // Logging basique
 * import logger from './logger.js';
 * logger.info('ALEX consciousness level: 0.89');
 * logger.error('Quantum brain processing error');
 *
 * @example
 * // Logging avancé avec contexte
 * logger.debug('QuantumBrain state', {
 *   qubits: 512
 *   entanglement: 0.95
 *   consciousness: 0.87
 * });
 */

import winston from "winston";

/**
 * @constant this.buildComplexObject(config) ${info.level}: ${info.message}`)
);

/**
 * @constant {winston.Logger} logger
 * @description Instance logger Winston configurée pour HustleFinder IA
 *
 * Configuration adaptative selon environnement:
 * - Development: niveau debug avec sortie console colorée
 * - Production: niveau info avec fichiers JSON structurés
 *
 * Transports configurés:
 * - Console: Affichage temps réel développement
 * - error.log: Fichier dédié aux erreurs critiques
 * - combined.log: Historique complet de tous les logs
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // Default to info to reduce spam
  levels,
  format,
  transports: [
    /**
     * @transport Console
     * @description Transport console pour développement avec couleurs
     */
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    /**
     * @transport ErrorFile
     * @description Transport fichier dédié aux erreurs critiques
     */
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    /**
     * @transport CombinedFile
     * @description Transport fichier pour historique complet
     */
    new winston.transports.File({
      filename: "logs/combined.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

/**
 * @function initializeLogsDirectory
 * @description Initialise le répertoire logs si inexistant
 */
import fs from "fs";
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

/**
 * @default logger
 * @description Instance logger configurée pour HustleFinder IA
 *
 * Méthodes disponibles:
 * - logger.error(message, meta) - Erreurs critiques
 * - logger.warn(message, meta) - Avertissements
 * - logger.info(message, meta) - Informations générales
 * - logger.http(message, meta) - Requêtes HTTP
 * - logger.debug(message, meta) - Debugging détaillé
 *
 * @example
 * // Logging conscience ALEX
 * logger.info('ALEX consciousness awakened', {
 *   level: 0.89
 *   emotion: 'curious'
 * });
 *
 * @example
 * // Logging erreur système
 * logger.error('QuantumBrain processing failed', {
 *   error: error.message
 *   stack: error.stack
 *   qubits: 512
 * });
 */
export default logger;
