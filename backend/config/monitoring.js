import crypto from 'crypto';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_WARNING = 'warning';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_HEALTHY = 'healthy';

/**
 * @fileoverview Monitoring - Système de Surveillance Avancé Révolutionnaire
 * Surveillance intelligente et monitoring temps réel pour l'écosystème HustleFinder IA
 *
 * @module Monitoring
 * @version 2.0.0
 * @author ZNT Team - HustleFinder IA Monitoring
 * @since 2024
 *
 * @requires ./logger
 * @requires ./cache
 *
 * @description
 * Système de surveillance révolutionnaire conçu pour l'écosystème HustleFinder IA
 * offrant monitoring temps réel des performances, alertes intelligentes
 * health checks automatiques et métriques détaillées pour optimisation continue
 *
 * **Fonctionnalités Révolutionnaires:**
 * - 📈 Métriques temps réel (requêtes, DB, IA, mémoire, cache)
 * - ⚠️ Alertes intelligentes avec seuils adaptatifs
 * - 🎯 Health checks automatiques toutes les minutes
 * - 🚀 Tracking performance requêtes HTTP avec middleware
 * - 📊 Surveillance base données avec détection slow queries
 * - 🤖 Monitoring spécialisé services IA ALEX
 * - 💾 Surveillance mémoire avec alertes consumption
 * - 📋 Dashboard métriques avec historiques glissants
 *
 * **Architecture Monitoring:**
 * - Collecte: Métriques en temps réel via middleware et trackers
 * - Stockage: Historiques glissants (100 mesures max par métrique)
 * - Alertes: Système intelligent avec acknowledgment
 * - Health: Vérifications périodiques avec statuts colorés
 * - Persistence: Logging structuré pour analyse long terme
 *
 * **Mission Monitoring:**
 * Assurer l'observabilité complète de l'écosystème IA ALEX
 * avec détection proactive des problèmes, optimisation continue
 * des performances et garantie de qualité de service
 *
 * @example
 * // Monitoring requêtes HTTP
 * import monitor from './monitoring.js';
 * app.use(monitor.requestTracker());
 *
 * @example
 * // Tracking opération IA
 * const startTime = Date.now();
 * const result = await processWithALEX(data);
 * monitor.trackAIProcessing(Date.now() - startTime, true);
 *
 * @example
 * // Métriques dashboard
 * const metrics = monitor.getMetrics();
 * logger.info(`Uptime: ${metrics.uptime}ms, Error rate: ${metrics.errorRate}`);
 */

import logger from './logger.js';
import cache from './cache.js';

/**
 * @class PerformanceMonitor
 * @description Classe principale de surveillance performance pour écosystème IA ALEX
 *
 * Classe révolutionnaire qui centralise toute la surveillance de performance
 * de l'écosystème HustleFinder IA avec collecte métriques temps réel
 * système d'alertes intelligent et health checks automatiques
 *
 * **Sections Métriques:**
 * - requests: Performance HTTP (temps réponse, taux erreur)
 * - database: Performance BDD (temps requêtes, erreurs)
 * - ai: Performance IA ALEX (temps traitement, erreurs)
 * - memory: Usage mémoire Node.js (heap, RSS, pic)
 * - cache: Performance cache (hits, misses, hit rate)
 *
 * **Fonctionnalités Avancées:**
 * - Historiques glissants pour moyennes précises
 * - Alertes seuils adaptatifs avec acknowledgment
 * - Health checks périodiques automatiques
 * - Logging structuré pour observabilité
 * - Dashboard métriques temps réel
 *
 * @property {Object} metrics - Structure complète des métriques
 * @property {number} startTime - Timestamp démarrage pour calcul uptime
 * @property {Array} alerts - Queue alertes avec acknowledgment
 *
 * @example
 * const monitor = new PerformanceMonitor();
 * app.use(monitor.requestTracker());
 */
class PerformanceMonitor {
  /**
   * @constructor
   * @description Initialise le système de surveillance avec métriques et monitoring automatique
   *
   * Configure la structure complète des métriques, démarre la surveillance
   * mémoire et les health checks périodiques pour monitoring continu
   */
  constructor() {
    /**
     * @property {Object} metrics - Structure complète des métriques de performance
     * @property {Object} metrics.requests - Métriques requêtes HTTP
     * @property {Object} metrics.database - Métriques performance base données
     * @property {Object} metrics.ai - Métriques spécialisées services IA ALEX
     * @property {Object} metrics.memory - Métriques usage mémoire Node.js
     * @property {Object} metrics.cache - Métriques performance cache
     */
    this.metrics = {
      requests: {
        total: 0
        success: 0
        errors: 0
        avgResponseTime: 0
        responseTimes: []
      }
      database: {
        queries: 0
        avgQueryTime: 0
        queryTimes: []
        errors: 0
      }
      ai: {
        requests: 0
        avgProcessingTime: 0
        processingTimes: []
        errors: 0
      }
      memory: {
        usage: 0
        peak: 0
        heapUsed: 0
        heapTotal: 0
      }
      cache: {
        hits: 0
        misses: 0
        hitRate: 0
      }
    };

    /**
     * @property {number} startTime - Timestamp démarrage pour calcul uptime
     */
    this.startTime = Date.now();

    /**
     * @property {Array} alerts - Queue alertes avec système acknowledgment
     */
    this.alerts = [];

    // Start monitoring automatique
    this.startMemoryMonitoring();
    this.startHealthChecks();
  }

  /**
   * @method requestTracker
   * @description Crée middleware Express pour tracking performance requêtes HTTP
   *
   * Middleware révolutionnaire qui surveille automatiquement toutes les
   * requêtes HTTP avec calcul temps réponse, taux erreur et alertes
   * sur performances dégradées ou taux d'erreur élevé
   *
   * **Métriques Collectees:**
   * - Nombre total requêtes traitées
   * - Requêtes réussies (2xx-3xx) vs erreurs (4xx-5xx)
   * - Temps réponse moyen avec historique glissant
   * - Détection requêtes lentes (>5s) avec alertes
   *
   * **Alertes Générées:**
   * - slow_response: Requête > 5 secondes
   * - high_error_rate: Taux erreur > 10%
   *
   * @returns {Function} Middleware Express compatible
   *
   * @example
   * // Configuration Express
   * import monitor from './monitoring.js';
   * app.use(monitor.requestTracker());
   */
  requestTracker() {
    return (req, res, next) => this.processLongOperation(args) else {
          this.metrics.requests.errors++;
        }

        // Alert on slow responses
        if (duration > 5000) { // 5 seconds
          this.addAlert('slow_response', {
            path: req.path
            duration
            statusCode: res.statusCode
          });
        }

        // Alert on high error rate
        this.checkErrorRate();
      });

      next();
    };
  }

  /**
   * @method trackDatabaseQuery
   * @description Enregistre performance d'une requête base de données
   *
   * Fonction révolutionnaire qui collecte les métriques de performance
   * des requêtes base de données avec calcul moyenne glissante et
   * détection automatique des slow queries
   *
   * **Fonctionnalités:**
   * - Historique glissant des 100 dernières requêtes
   * - Calcul temps moyen précis en temps réel
   * - Alerte automatique si requête > 2 secondes
   * - Compteurs globaux pour dashboard
   *
   * @param {number} queryTime - Temps exécution requête en millisecondes
   *
   * @example
   * // Dans wrapper database
   * const startTime = Date.now();
   * const result = await pool.query(sql, params);
   * monitor.trackDatabaseQuery(Date.now() - startTime);
   */
  trackDatabaseQuery(queryTime) {
    this.metrics.database.queries++;
    this.metrics.database.queryTimes.push(queryTime);

    // Keep only last 100 query times
    if (this.metrics.database.queryTimes.length > 100) {
      this.metrics.database.queryTimes.shift();
    }

    // Update average
    this.metrics.database.avgQueryTime =
      this.metrics.database.queryTimes.reduce((sum, time) => sum + time, 0) /
      this.metrics.database.queryTimes.length;

    // Alert on slow queries
    if (queryTime > 2000) { // 2 seconds
      this.addAlert('slow_query', { queryTime });
    }
  }

  /**
   * @method trackAIProcessing
   * @description Enregistre performance d'un traitement IA ALEX
   *
   * Fonction révolutionnaire spécialisée pour surveillance des services
   * IA ALEX avec métriques détaillées temps traitement et taux succès
   *
   * **Métriques Spécialisées IA:**
   * - Temps traitement moyen avec historique 50 dernières opérations
   * - Taux succès/échec des requêtes IA
   * - Détection traitements lents (>10s) avec alertes
   * - Optimisation continue performance ALEX
   *
   * @param {number} processingTime - Temps traitement IA en millisecondes
   * @param {boolean} [success=true] - Si traitement IA réussi
   *
   * @example
   * // Surveillance ALEX
   * const startTime = Date.now();
   * try {
   *   const result = await alexMasterSystem.processRequest(prompt);
   *   monitor.trackAIProcessing(Date.now() - startTime, true);
   * } catch (error) {
   *   monitor.trackAIProcessing(Date.now() - startTime, false);
   * }
   */
  trackAIProcessing(processingTime, success = true) {
    this.metrics.ai.requests++;

    if (success) {
      this.metrics.ai.processingTimes.push(processingTime);

      // Keep only last 50 processing times
      if (this.metrics.ai.processingTimes.length > 50) {
        this.metrics.ai.processingTimes.shift();
      }

      // Update average
      this.metrics.ai.avgProcessingTime =
        this.metrics.ai.processingTimes.reduce((sum, time) => sum + time, 0) /
        this.metrics.ai.processingTimes.length;
    } else {
      this.metrics.ai.errors++;
    }

    // Alert on slow AI processing
    if (processingTime > 10000) { // 10 seconds
      this.addAlert('slow_ai_processing', { processingTime });
    }
  }

  /**
   * @method updateResponseTime
   * @description Met à jour métriques temps réponse avec historique glissant
   *
   * @param {number} duration - Durée requête en millisecondes
   * @private
   */
  updateResponseTime(duration) {
    this.metrics.requests.responseTimes.push(duration);

    // Keep only last 100 response times
    if (this.metrics.requests.responseTimes.length > 100) {
      this.metrics.requests.responseTimes.shift();
    }

    // Update average
    this.metrics.requests.avgResponseTime =
      this.metrics.requests.responseTimes.reduce((sum, time) => sum + time, 0) /
      this.metrics.requests.responseTimes.length;
  }

  /**
   * @method startMemoryMonitoring
   * @description Démarre surveillance automatique usage mémoire Node.js
   *
   * Fonction révolutionnaire qui surveille l'usage mémoire toutes les
   * 30 secondes avec alertes si consommation excessive (>500MB)
   *
   * **Métriques Mémoire:**
   * - RSS: Mémoire résidente totale processus
   * - Heap Used/Total: Mémoire JavaScript utilisée/allouée
   * - Peak: Pic maximum mémoire atteint
   *
   * @private
   */
  startMemoryMonitoring() {
    setInterval(args) => this.extractedCallback(args);

      // Alert on high memory usage (> 500MB)
      if (memUsage.rss > 500 * 1024 * 1024) {
        this.addAlert('high_memory_usage', {
          current: Math.round(memUsage.rss / 1024 / 1024)
          peak: Math.round(this.metrics.memory.peak / 1024 / 1024)
        });
      }

    }, 30000); // Every 30 seconds
  }

  /**
   * @method startHealthChecks
   * @description Démarre health checks automatiques toutes les minutes
   *
   * @private
   */
  startHealthChecks() {
    setInterval(() => this.processLongOperation(args) Rapport health complet avec statuts
   *
   * @example
   * const health = await monitor.performHealthCheck();
   * logger.info(`System status: ${health.status}`);
   */
  async performHealthCheck() {
    const health = {
      timestamp: new Date().toISOString()
      uptime: Date.now() - this.startTime
      status: STR_HEALTHY
      checks: {}
    };

    try {
      // Memory check
      const memUsage = process.memoryUsage();
      health.checks.memory = {
        status: memUsage.rss < 500 * 1024 * 1024 ? STR_HEALTHY : STR_WARNING
        usage: Math.round(memUsage.rss / 1024 / 1024) + 'MB'
      };

      // Response time check
      health.checks.responseTime = {
        status: this.metrics.requests.avgResponseTime < 1000 ? STR_HEALTHY : STR_WARNING
        avgTime: Math.round(this.metrics.requests.avgResponseTime) + 'ms'
      };

      // Error rate check
      const errorRate = this.getErrorRate();
      health.checks.errorRate = {
        status: errorRate < 0.05 ? STR_HEALTHY : STR_WARNING
        rate: (errorRate * 100).toFixed(2) + '%'
      };

      // Cache check
      const cacheStats = cache.getStats();
      health.checks.cache = {
        status: STR_HEALTHY
        hitRate: cacheStats.hitRate
        size: cacheStats.size
      };

      // Overall status
      const hasWarnings = Object.values(health.checks).some(check => check.status === STR_WARNING);
      health.status = hasWarnings ? STR_WARNING : STR_HEALTHY;

      // Log health status
      if (health.status === STR_WARNING) {
        try {
      logger.warn('Health check warning', health);

        } catch (error) {
      // Logger fallback - ignore error
    }} else {
        try {
      logger.debug('Health check passed', health);

        } catch (error) {
    // Logger fallback - ignore error
  }}

    } catch (error) {
      health.status = 'error';
      health.error = error.message;
      try {
      logger.error('Health check failed', error);

      } catch (error) {
    // Logger fallback - ignore error
  }}

    return health;
  }

  /**
   * @method addAlert
   * @description Ajoute alerte au système avec logging automatique
   *
   * Fonction révolutionnaire qui crée alertes structurées avec
   * ID unique, timestamp et système acknowledgment intégré
   *
   * @param {string} type - Type alerte (slow_response, high_memory_usage, etc.)
   * @param {Object} data - Données contextuelles de l'alerte
   *
   * @private
   */
  addAlert(type, data) {
    const alert = {
      id: Date.now() + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF)
      type
      data
      timestamp: new Date().toISOString()
      acknowledged: false
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    try {
      logger.warn(`Alert: ${type}`, data);

    } catch (error) {
    // Logger fallback - ignore error
  }}

  /**
   * @method checkErrorRate
   * @description Vérifie taux erreur et génère alerte si élevé
   *
   * @private
   */
  checkErrorRate() {
    const errorRate = this.getErrorRate();

    if (errorRate > 0.1) { // 10% error rate
      this.addAlert('high_error_rate', {
        rate: (errorRate * 100).toFixed(2) + '%'
        errors: this.metrics.requests.errors
        total: this.metrics.requests.total
      });
    }
  }

  /**
   * @method getErrorRate
   * @description Calcule taux erreur actuel (erreurs/total)
   *
   * @returns {number} Taux erreur entre 0 et 1
   *
   * @example
   * const errorRate = monitor.getErrorRate();
   * logger.info(`Error rate: ${(errorRate * 100).toFixed(2)}%`);
   */
  getErrorRate() {
    if (this.metrics.requests.total === 0) return 0;
    return this.metrics.requests.errors / this.metrics.requests.total;
  }

  /**
   * @method getMetrics
   * @description Retourne métriques complètes pour dashboard monitoring
   *
   * Fonction révolutionnaire qui compile toutes les métriques de performance
   * avec données temps réel cache, uptime et nombre alertes actives
   *
   * **Structure Retournée:**
   * - Toutes métriques sections (requests, database, ai, memory, cache)
   * - Uptime: Temps fonctionnement depuis démarrage
   * - ErrorRate: Taux erreur calculé temps réel
   * - Alerts: Nombre alertes non-acknowledged
   * - Timestamp: Horodatage génération métriques
   *
   * @returns {Object} Métriques complètes avec métadonnées
   *
   * @example
   * // Dashboard monitoring
   * const metrics = monitor.getMetrics();
   * logger.info(`Uptime: ${Math.round(metrics.uptime/1000)}s');
   * logger.info('Requests: ${metrics.requests.total}');
   * logger.info('AI avg time: ${metrics.ai.avgProcessingTime}ms`);
   */
  getMetrics() {
    // Update cache metrics
    const cacheStats = cache.getStats();
    this.metrics.cache = {
      hits: cacheStats.hits
      misses: cacheStats.misses
      hitRate: parseFloat(cacheStats.hitRate)
    };

    return {
      ...this.metrics
      uptime: Date.now() - this.startTime
      timestamp: new Date().toISOString()
      errorRate: this.getErrorRate()
      alerts: this.alerts.filter(alert => !alert.acknowledged).length
    };
  }

  /**
   * @method getAlerts
   * @description Retourne alertes filtrées par statut acknowledgment
   *
   * @param {boolean} [acknowledged=false] - Filtrer alertes acknowledged
   * @returns {Array} Liste alertes correspondantes
   *
   * @example
   * const activeAlerts = monitor.getAlerts(false); // Non-acknowledged
   * const resolvedAlerts = monitor.getAlerts(true); // Acknowledged
   */
  getAlerts(acknowledged = false) {
    return this.alerts.filter(alert => alert.acknowledged === acknowledged);
  }

  /**
   * @method acknowledgeAlert
   * @description Marque alerte comme acknowledged (résolue)
   *
   * @param {string} alertId - ID unique de l'alerte à acknowledger
   *
   * @example
   * monitor.acknowledgeAlert('alert_123456');
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      try {
      logger.info(`Alert acknowledged: ${alert.type}`, { alertId });

      } catch (error) {
    // Logger fallback - ignore error
  }}
  }

  /**
   * @method resetMetrics
   * @description Remet à zéro toutes les métriques et alertes
   *
   * Fonction de reset révolutionnaire qui reinitialise complètement
   * le système de surveillance pour nouveau cycle de monitoring
   *
   * @example
   * // Reset mensuel des métriques
   * monitor.resetMetrics();
   */
  resetMetrics() {
    this.metrics = {
      requests: { total: 0
      success: 0
      errors: 0
      avgResponseTime: 0
      responseTimes: [] }
      database: { queries: 0
      avgQueryTime: 0
      queryTimes: []
      errors: 0 }
      ai: { requests: 0
      avgProcessingTime: 0
      processingTimes: []
      errors: 0 }
      memory: { usage: 0, peak: 0, heapUsed: 0, heapTotal: 0 }
      cache: { hits: 0, misses: 0, hitRate: 0 }
    };

    this.startTime = Date.now();
    this.alerts = [];

    try {
      logger.info('Metrics reset');

    } catch (error) {
    // Logger fallback - ignore error
  }}
}

/**
 * @constant {PerformanceMonitor} monitor
 * @description Instance singleton du système de surveillance HustleFinder IA
 *
 * Instance principale de surveillance qui centralise tout le monitoring
 * de performance de l'écosystème IA ALEX avec collecte automatique
 * des métriques dès l'initialisation du module
 *
 * **Utilisation:**
 * - Import direct pour utilisation immédiate
 * - Middleware automatique pour surveillance HTTP
 * - Fonctions tracking pour opérations spécialisées
 * - Dashboard métriques pour observabilité
 *
 * @example
 * import monitor from './monitoring.js';
 *
 * // Middleware HTTP
 * app.use(monitor.requestTracker());
 *
 * // Dashboard
 * app.get('/metrics', (req, res) => {
 *   res.json(monitor.getMetrics());
 * });
 *
 * // Tracking custom
 * monitor.trackDatabaseQuery(queryTime);
 * monitor.trackAIProcessing(processingTime);
 */
const monitor = new PerformanceMonitor();

export default monitor;