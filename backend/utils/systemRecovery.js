/**
 * Système de récupération automatique pour HustleFinderIA
 * Détecte et corrige automatiquement les erreurs courantes
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
   * Détecte et corrige les problèmes d'initialisation
   */
  async detectAndRecover() {
    if (this.isRecovering) {
      logger.warn('Recovery déjà en cours, abandon...');
      return false;
    }

    this.isRecovering = true;
    logger.info('🔧 Démarrage du système de récupération automatique...');

    try {
      // 1. Vérifier les modules core
      await this.checkCoreModules();

      // 2. Vérifier les doublons
      await this.removeDuplicates();

      // 3. Vérifier la configuration
      await this.validateConfiguration();

      // 4. Nettoyer les caches
      await this.clearCaches();

      logger.info('✅ Récupération automatique terminée avec succès');
      return true;

    } catch (error) {
      // Logger fallback - ignore error
    } finally {
      this.isRecovering = false;
    }
  }

  /**
   * Vérifier l'intégrité des modules core
   */
  async checkCoreModules() {
    const coreModules = [
      'core/HustleFinderCore.js'
      'core/NeuroCore.js'
      'core/AlexEvolutionCore.js'
      'core/SoulPrintGenerator.js'
    ];

    for (const module of coreModules) {
      const modulePath = path.resolve(module);

      if (!fs.existsSync(modulePath)) {
        logger.error(`Module manquant: ${module}');
        throw new Error('Module critique manquant: ${module}`);
      }

      // Vérifier que le module peut être importé
      try {
        await import(`file://${modulePath}`);
        try {
      logger.info(`✅ Module OK: ${module}`);

        } catch (error) {
    // Logger fallback - ignore error
  } catch (error) {
        logger.error(`❌ Erreur d'import pour ${module}:`, error.message);
        throw error;
      }
    }
  }

  /**
   * Supprimer les doublons automatiquement
   */
  async removeDuplicates() {
    const duplicates = [
      'systems/HustleFinderCore.js'
      'systems/AlexMasterSystem.js'
      'systems/PersonalAssistant.js'
      'systems/VisualCortex.js'
      'systems/AlexMemoryPalace.js'
    ];

    for (const duplicate of duplicates) {
      if (fs.existsSync(duplicate)) {
        try {
          fs.unlinkSync(duplicate);
          logger.info(`🗑️  Doublon supprimé: ${duplicate}');
          this.recoveryActions.push('Supprimé doublon: ${duplicate}`);
        } catch (error) {
          try {
      logger.warn(`Impossible de supprimer ${duplicate}:`, error.message);

          } catch (error) {
    // Logger fallback - ignore error
  }}
      }
    }
  }

  /**
   * Valider et corriger la configuration
   */
  async validateConfiguration() {
    // Vérifier .env
    if (!fs.existsSync('.env')) {
      const defaultEnv = `PORT=8080
      fs.writeFileSync('.env', defaultEnv);
      logger.info('📝 Fichier .env créé avec configuration par défaut');
      this.recoveryActions.push('Créé fichier .env par défaut');
    }

    // Vérifier dossier logs
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
      logger.info('📁 Dossier logs créé');
      this.recoveryActions.push('Créé dossier logs');
    }
  }

  /**
   * Nettoyer les caches et fichiers temporaires
   */
  async clearCaches() {
    const cachePaths = [
      'node_modules/.cache'
      '.cache'
      'temp'
    ];

    for (const cachePath of cachePaths) {
      if (fs.existsSync(cachePath)) {
        try {
          fs.rmSync(cachePath, { recursive: true, force: true });
          logger.info(`🧹 Cache nettoyé: ${cachePath}');
          this.recoveryActions.push('Nettoyé cache: ${cachePath}`);
        } catch (error) {
          try {
      logger.warn(`Impossible de nettoyer ${cachePath}:`, error.message);

          } catch (error) {
    // Logger fallback - ignore error
  }}
      }
    }
  }

  /**
   * Obtenir le rapport de récupération
   */
  getRecoveryReport() {
    return {
      timestamp: new Date().toISOString()
      actionsPerformed: this.recoveryActions
      totalActions: this.recoveryActions.length
    };
  }

  /**
   * Reset du système de récupération
   */
  reset() {
    this.recoveryActions = [];
    this.isRecovering = false;
  }
}

export default new SystemRecovery();