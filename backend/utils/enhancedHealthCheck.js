import crypto from 'crypto';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ERROR = 'error';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_HEALTHY = 'healthy';
/**
 * Health Check Amélioré avec diagnostics détaillés
 * Fournit des informations complètes sur l'état du système
 */

import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import logger from '../config/logger.js';

class EnhancedHealthCheck {
  constructor() {
    this.startTime = Date.now();
    this.checkHistory = [];
  }

  /**
   * Effectue un check de santé complet
   */
  async performFullCheck() {
    const checkStart = performance.now();
    const result = {
      timestamp: new Date().toISOString()
      status: STR_HEALTHY
      uptime: this.getUptime()
      checks: {}
      performance: {}
      recommendations: []
      autoFixApplied: []
    };

    try {
      // 1. Check système de base
      result.checks.system = await this.checkSystem();

      // 2. Check modules core
      result.checks.coreModules = await this.checkCoreModules();

      // 3. Check base de données
      result.checks.database = await this.checkDatabase();

      // 4. Check mémoire et performance
      result.performance = await this.checkPerformance();

      // 5. Check intégrité des fichiers
      result.checks.fileIntegrity = await this.checkFileIntegrity();

      // 6. Déterminer le statut global
      result.status = this.determineOverallStatus(result.checks);

      // 7. Générer des recommandations
      result.recommendations = this.generateRecommendations(result);

      // 8. Appliquer les corrections automatiques si nécessaire
      if (result.status !== STR_HEALTHY) {
        result.autoFixApplied = await this.applyAutoFixes(result);
      }

      const checkEnd = performance.now();
      result.checkDurationMs = Math.round(checkEnd - checkStart);

      // Enregistrer dans l'historique
      this.checkHistory.push({
        timestamp: result.timestamp
        status: result.status
        duration: result.checkDurationMs
      });

      // Garder seulement les 50 derniers checks
      if (this.checkHistory.length > 50) {
        this.checkHistory = this.checkHistory.slice(-50);
      }

      return result;

    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  /**
   * Check du système de base
   */
  async checkSystem() {
    const startMemory = process.memoryUsage();

    return {
      status: STR_HEALTHY
      nodeVersion: process.version
      platform: process.platform
      arch: process.arch
      memory: {
        used: Math.round(startMemory.heapUsed / 1024 / 1024)
        total: Math.round(startMemory.heapTotal / 1024 / 1024)
        external: Math.round(startMemory.external / 1024 / 1024)
      }
      pid: process.pid
      uptime: Math.round(process.uptime())
    };
  }

  /**
   * Check des modules core
   */
  async checkCoreModules() {
    const modules = [
      { name: 'HustleFinderCore', path: './core/HustleFinderCore.js' }
      { name: 'NeuroCore', path: './core/NeuroCore.js' }
      { name: 'AlexEvolutionCore', path: './core/AlexEvolutionCore.js' }
      { name: 'SoulPrintGenerator', path: './core/SoulPrintGenerator.js' }
    ];

    const results = {};
    let overallStatus = STR_HEALTHY;

    for (const module of modules) {
      try {
        const modulePath = path.resolve(module.path);

        if (!fs.existsSync(modulePath)) {
          results[module.name] = {
            status: STR_MISSING
            error: 'Fichier non trouvé'
          };
          overallStatus = STR_CRITICAL;
          continue;
        }

        // Tenter l'import
        const imported = await import(`file://${modulePath}`);

        results[module.name] = {
          status: STR_HEALTHY
          hasDefault: !!imported.default
          exports: Object.keys(imported).length
          size: fs.statSync(modulePath).size
        };

      } catch (error) {
      // Logger fallback - ignore error
    };
        overallStatus = STR_DEGRADED;
      }
    }

    return {
      status: overallStatus
      modules: results
      totalModules: modules.length
      healthyModules: Object.values(results).filter(r => r.status === STR_HEALTHY).length
    };
  }

  /**
   * Check de la base de données
   */
  async checkDatabase() {
    try {
      // Vérifier si SQLite fonctionne
      const dbPath = './database.sqlite';
      const dbExists = fs.existsSync(dbPath);

      return {
        status: STR_HEALTHY
        type: 'sqlite'
        exists: dbExists
        size: dbExists ? fs.statSync(dbPath).size : 0
        lastModified: dbExists ? fs.statSync(dbPath).mtime : null
      };
    } catch (error) {
      // Logger fallback - ignore error
    };
    }
  }

  /**
   * Check des performances
   */
  async checkPerformance() {
    const startTime = performance.now();

    // Test de calcul simple pour mesurer les performances
    let sum = 0;
    for (let i = 0; i < 100000; i++) {
      sum += (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF);
    }

    const endTime = performance.now();
    const computeTime = endTime - startTime;

    const memory = process.memoryUsage();

    return {
      computeSpeed: Math.round(computeTime * 100) / 100
      memoryUsage: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024)
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024)
        rss: Math.round(memory.rss / 1024 / 1024)
      }
      loadAverage: process.platform !== 'win32' ? require('os').loadAvg() : [0, 0, 0]
    };
  }

  /**
   * Check de l'intégrité des fichiers
   */
  async checkFileIntegrity() {
    const criticalFiles = [
      'index.js'
      'package.json'
      STR_ENV
    ];

    const results = {};
    let overallStatus = STR_HEALTHY;

    for (const file of criticalFiles) {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        results[file] = {
          status: 'present'
          size: stats.size
          lastModified: stats.mtime
        };
      } else {
        results[file] = {
          status: STR_MISSING
        };
        if (file !== STR_ENV) { // .env peut être recréé automatiquement
          overallStatus = STR_DEGRADED;
        }
      }
    }

    return {
      status: overallStatus
      files: results
    };
  }

  /**
   * Détermine le statut global
   */
  determineOverallStatus(checks) {
    const statuses = Object.values(checks).map(check => check.status);

    if (statuses.includes(STR_CRITICAL)) return STR_CRITICAL;
    if (statuses.includes(STR_ERROR)) return STR_ERROR;
    if (statuses.includes(STR_DEGRADED)) return STR_DEGRADED;
    return STR_HEALTHY;
  }

  /**
   * Génère des recommandations
   */
  generateRecommendations(result) {
    const recommendations = [];

    // Recommandations mémoire
    if (result.performance.memoryUsage.heapUsed > 100) {
      recommendations.push({
        type: 'performance'
        severity: 'medium'
        message: 'Utilisation mémoire élevée, considérez un redémarrage'
        action: 'restart_suggested'
      });
    }

    // Recommandations modules
    if (result.checks.coreModules.status !== STR_HEALTHY) {
      recommendations.push({
        type: 'modules'
        severity: 'high'
        message: 'Problèmes détectés dans les modules core'
        action: 'check_modules'
      });
    }

    // Recommandations fichiers
    if (result.checks.fileIntegrity.status !== STR_HEALTHY) {
      recommendations.push({
        type: 'files'
        severity: 'medium'
        message: 'Fichiers critiques manquants ou corrompus'
        action: 'restore_files'
      });
    }

    return recommendations;
  }

  /**
   * Applique les corrections automatiques
   */
  async applyAutoFixes(result) {
    const fixes = [];

    // Auto-fix: créer .env si manquant
    if (result.checks.fileIntegrity.files[STR_ENV]?
      .status === STR_MISSING) {
      try {
        const defaultEnv = 'PORT=8080\nNODE_ENV=development\n';
        fs.writeFileSync(STR_ENV, defaultEnv);
        fixes.push('Créé fichier .env par défaut');
      } catch (error) {
        try {
      logger.error('Impossible de créer .env :
      ', error);

        } catch (error) {
    // Logger fallback - ignore error
  }}
    }

    return fixes;
  }

  /**
   * Obtient l'uptime formaté
   */
  getUptime() {
    const uptimeMs = Date.now() - this.startTime;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;

    return {
      ms: uptimeMs
      formatted: `${hours}h ${minutes}m ${seconds}s`
    };
  }

  /**
   * Obtient l'historique des checks
   */
  getCheckHistory() {
    return this.checkHistory;
  }
}

export default new EnhancedHealthCheck();