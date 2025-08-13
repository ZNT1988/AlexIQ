/**
 * Systeme de recuperation automatique pour HustleFinderIA
 * Detecte et corrige automatiquement les erreurs courantes
 */

import fs from 'fs';
import path from 'path';
import logger from '../config/logger.js';

class SystemRecovery {
  constructor() {
    this.recoveryActions = [];
    this.isRecovering = false;
  }

  /**
   * Detecte et corrige les problemes d'initialisation
   */
  async detectAndRecover() {
    if (this.isRecovering) {
      logger.warn('Recovery deja en cours, abandon...');
      return false;
    }

    this.isRecovering = true;
    logger.info('Demarrage du systeme de recuperation automatique...');

    try {
      // 1. Verifier les modules core
      await this.checkCoreModules();

      // 2. Verifier les doublons
      await this.removeDuplicates();

      // 3. Verifier la configuration
      await this.validateConfiguration();

      // 4. Nettoyer les caches
      await this.clearCaches();

      logger.info('Recuperation automatique terminee avec succes');
      return true;

    } catch (error) {
      // Logger fallback - ignore error
    } finally {
      this.isRecovering = false;
    }
  }

  /**
   * Verifier l'integrite des modules core
   */
  async checkCoreModules() {
    const coreModules = [
      'core/HustleFinderCore.js',
      'core/NeuroCore.js',
      'core/AlexEvolutionCore.js',
      'core/SoulPrintGenerator.js'
    ];

    for (const module of coreModules) {
      const modulePath = path.resolve(module);

      if (!fs.existsSync(modulePath)) {
        logger.error('Module manquant: ' + module);
        throw new Error('Module critique manquant: ' + module);
      }

      // Verifier que le module peut etre importe
      try {
        await import('file://' + modulePath);
        logger.info('Module OK: ' + module);
      } catch (error) {
        logger.error('Erreur d\'import pour ' + module + ':', error.message);
        throw error;
      }
    }
  }

  /**
   * Supprimer les doublons automatiquement
   */
  async removeDuplicates() {
    const duplicates = [
      'systems/HustleFinderCore.js',
      'systems/AlexMasterSystem.js',
      'systems/PersonalAssistant.js',
      'systems/VisualCortex.js',
      'systems/AlexMemoryPalace.js'
    ];

    for (const duplicate of duplicates) {
      if (fs.existsSync(duplicate)) {
        try {
          fs.unlinkSync(duplicate);
          logger.info('Doublon supprime: ' + duplicate);
          this.recoveryActions.push('Supprime doublon: ' + duplicate);
        } catch (error) {
          try {
            logger.warn('Impossible de supprimer ' + duplicate + ':', error.message);
          } catch (error) {
            // Logger fallback - ignore error
          }
        }
      }
    }
  }

  /**
   * Valider et corriger la configuration
   */
  async validateConfiguration() {
    // Verifier .env
    if (!fs.existsSync('.env')) {
      const defaultEnv = 'PORT=8080\n';
      fs.writeFileSync('.env', defaultEnv);
      logger.info('Fichier .env cree avec configuration par defaut');
      this.recoveryActions.push('Cree fichier .env par defaut');
    }

    // Verifier dossier logs
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
      logger.info('Dossier logs cree');
      this.recoveryActions.push('Cree dossier logs');
    }
  }

  /**
   * Nettoyer les caches et fichiers temporaires
   */
  async clearCaches() {
    const cachePaths = [
      'node_modules/.cache',
      '.cache',
      'temp'
    ];

    for (const cachePath of cachePaths) {
      if (fs.existsSync(cachePath)) {
        try {
          fs.rmSync(cachePath, { recursive: true, force: true });
          logger.info('Cache nettoye: ' + cachePath);
          this.recoveryActions.push('Cache nettoye: ' + cachePath);
        } catch (error) {
          try {
            logger.warn('Impossible de nettoyer ' + cachePath + ':', error.message);
          } catch (error) {
            // Logger fallback - ignore error
          }
        }
      }
    }
  }

  /**
   * Obtenir le rapport de recuperation
   */
  getRecoveryReport() {
    return {
      timestamp: new Date().toISOString(),
      actionsPerformed: this.recoveryActions,
      totalActions: this.recoveryActions.length
    };
  }

  /**
   * Reset du systeme de recuperation
   */
  reset() {
    this.recoveryActions = [];
    this.isRecovering = false;
  }
}

export default new SystemRecovery();