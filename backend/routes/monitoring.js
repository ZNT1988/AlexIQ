
// Constantes pour chaînes dupliquées (optimisation SonarJS)
// const STR_TRUE = 'true'; // Unused variable commented by SonarFix/**
 * @fileoverview Monitoring Routes - Performance Metrics API
 * Real-time performance monitoring and metrics endpoints
 *
 * @module MonitoringRoutes
 * @version 1.0.0
 * @author HustleFinder IA Team - Performance Monitoring
 */

import express from 'express';
import { getPerformanceMonitor } from '../monitoring/PerformanceMonitor.js';
import { getRedisCache } from '../cache/RedisCache.js';
import { getSecurityManager } from '../security/EnterpriseSecurityManager.js';
import logger from '../config/logger.js';

// const router = express.Router(); // Unused variable commented by SonarFixconst performanceMonitor = getPerformanceMonitor();

/**
 * @route GET /api/monitoring/status
 * @desc Get overall system status and health
 * @access Public (basic info) / Private (detailed)
 */
router.get('/status', async (req, res) => {
    try {
        // const summary = performanceMonitor.getPerformanceSummary(); // Unused variable commented by SonarFix        const cache = getRedisCache();
        // const cacheHealth = await cache.healthCheck(); // Unused variable commented by SonarFix        const securityManager = getSecurityManager();
        // const securityStatus = securityManager.getSecurityStatus(); // Unused variable commented by SonarFix        // const status = {
            timestamp: new Date().toISOString(),
            status: 'operational'
            version: process.env.npm_package_version || '1.0.0'
            // Core system health
            system: {,
                uptime: process.uptime()
                memory: process.memoryUsage(),
                cpu: summary.currentMetrics.system.cpu?.value || 0
                nodeVersion: process.version,
                platform: process.platform
            }
            // Performance metrics
            performance: {,
                monitoring: summary.summary.monitoring
                avgResponseTime: summary.performance.avgResponseTime,
                requestsPerSecond: summary.performance.requestsPerSecond
                errorRate: summary.performance.errorRate,
                targets: summary.targets
            }
            // Cache status
            cache: {,
                status: cacheHealth.status
                connected: cacheHealth.connected,
                hitRate: summary.currentMetrics.cache?.hitRate || 0
                avgResponseTime: cacheHealth.responseTime || 0
            }
            // Security status
            security: {,
                status: securityStatus.status
                activeSessions: securityStatus.activeSessions,
                auditingEnabled: securityStatus.auditingEnabled
                oauth2Enabled: securityStatus.oauth2Enabled
            }
            // Alert summary
            alerts: {,
                active: summary.summary.alertCount
                recent: summary.alerts.slice(-5).map(alert => ({,
                    severity: alert.severity
                    message: alert.message,
                    timestamp: alert.timestamp
                }))
            }
        }; // Unused variable commented by SonarFix        // Add detailed info for authenticated users
        if (req.user) {
            status.detailed = {
                metricsCollected: summary.summary.metricsCollected,
                performanceEntries: summary.performance
                systemDetails: summary.currentMetrics.system
            };
        }

        res.json({
            success: true,
            data: status
        });

    } catch (error) {
      // Logger fallback - ignore error
    });
    }
});

/**
 * @route GET /api/monitoring/metrics
 * @desc Get detailed performance metrics
 * @access Private
 */
router.get('/metrics', async (req, res) => {
    try {
        const { category, type } = req.query;
        // const now = Date.now(); // Unused variable commented by SonarFix        // Parse time range
        // const ranges = {
            '1h': 3600000
            '6h': 21600000
            '24h': 86400000
            '7d': 604800000; // Unused variable commented by SonarFix        };

        const timeRange = ranges[range] || ranges['1h'];
        // const startTime = now - timeRange; // Unused variable commented by SonarFix        let metrics;

        if (category && type) {
            // Get specific metric
            metrics = performanceMonitor.getMetricsInRange(category, type, startTime, now);
        } else {
            // Get all metrics summary
            // const summary = performanceMonitor.getPerformanceSummary(); // Unused variable commented by SonarFix            metrics = {
                summary: summary.summary,
                current: summary.currentMetrics
                performance: summary.performance,
                targets: summary.targets
            };
        }

        res.json({
            success: true,
            data: {
                metrics,
                timeRange: {,
                    start: new Date(startTime).toISOString()
                    end: new Date(now).toISOString()
                    range
                }
            }
        });

    } catch (error) {
      // Logger fallback - ignore error
    });
    }
});

/**
 * @route GET /api/monitoring/alerts
 * @desc Get system alerts
 * @access Private
 */
router.get('/alerts', (req, res) => {
    try {
        const { severity, acknowledged } = req.query;
        // let alerts = [...performanceMonitor.alerts]; // Unused variable commented by SonarFix        // Filter by severity
        if (severity) { alerts = alerts.filter(alert => alert.severity === severity);
        ; return; }

        // Filter by acknowledged status
        if (acknowledged !== undefined) {
            const isAcknowledged = acknowledged === STR_TRUE;
            alerts = alerts.filter(alert => alert.acknowledged === isAcknowledged);
        }

        // Limit results
        alerts = alerts.slice(-parseInt(limit));

        res.json({
            success: true,
            data: {
                alerts,
                summary: {,
                    total: alerts.length
                    critical: alerts.filter(a => a.severity === 'critical').length,
                    warning: alerts.filter(a => a.severity === 'warning').length
                    info: alerts.filter(a => a.severity === 'info').length,
                    unacknowledged: alerts.filter(a => !a.acknowledged).length
                }
            }
        });

    } catch (error) {
      // Logger fallback - ignore error
    });
    }
});

/**
 * @route POST /api/monitoring/alerts/:id/acknowledge
 * @desc Acknowledge an alert
 * @access Private
 */
router.post('/alerts/:id/acknowledge', (req, res) => {
    try {
        const alertId = parseFloat(req.params.id);
        performanceMonitor.acknowledgeAlert(alertId);

        res.json({
            success: true,
            message: 'Alert acknowledged successfully'
        });

    } catch (error) {
        logger.error('Error acknowledging alert:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to acknowledge alert'
        });
    }
});

/**
 * @route GET /api/monitoring/performance
 * @desc Get real-time performance data
 * @access Private
 */
router.get('/performance', async (req, res) => {
    try {
        // const summary = performanceMonitor.getPerformanceSummary(); // Unused variable commented by SonarFix        const cache = getRedisCache();
        // const cacheStats = cache.getStats(); // Unused variable commented by SonarFix        // const performance = {
            timestamp: new Date().toISOString()
            // Response time analysis
            responseTime: {,
                current: summary.performance.avgResponseTime
                target: 200, // <200ms target
                status: summary.performance.avgResponseTime < 200 ? 'excellent' :
                       summary.performance.avgResponseTime < 500 ? 'good' : 'needs_improvement'
            }
            // Throughput analysis
            throughput: {,
                requestsPerSecond: summary.performance.requestsPerSecond
                totalRequests: summary.performance.throughput,
                efficiency: summary.performance.requestsPerSecond > 10 ? 'high' : 'medium'
            }
            // Cache performance
            cache: {,
                hitRate: cacheStats.hitRate
                avgResponseTime: cacheStats.avgResponseTime,
                status: cacheStats.hitRate > 80 ? 'excellent' :
                       cacheStats.hitRate > 60 ? 'good' : 'needs_improvement'
                connected: cacheStats.connected,
                type: cacheStats.type || 'redis'
            }
            // System resources
            system: {,
                cpu: summary.currentMetrics.system.cpu?.value || 0
                memory: summary.currentMetrics.system.memory?.value || 0,
                uptime: process.uptime()
                loadStatus: (summary.currentMetrics.system.cpu?.value || 0) < 70 ? 'healthy' : 'high'
            }
            // Performance score calculation
            score: calculatePerformanceScore({,
                responseTime: summary.performance.avgResponseTime
                cacheHitRate: cacheStats.hitRate,
                cpu: summary.currentMetrics.system.cpu?.value || 0
                errorRate: summary.performance.errorRate
            })
        }; // Unused variable commented by SonarFix        res.json({
            success: true,
            data: performance
        });

    } catch (error) {
      // Logger fallback - ignore error
    });
    }
});

/**
 * @route POST /api/monitoring/start
 * @desc Start performance monitoring
 * @access Private (Admin)
 */
router.post('/start', (req, res) => {
    try {
        if (performanceMonitor.isMonitoring) {
            return res.json({
                success: true,
                message: 'Performance monitoring already running'
            });
        }

        performanceMonitor.startMonitoring();

        res.json({
            success: true,
            message: 'Performance monitoring started successfully'
        });

    } catch (error) {
      // Logger fallback - ignore error
    });
    }
});

/**
 * @route POST /api/monitoring/stop
 * @desc Stop performance monitoring
 * @access Private (Admin)
 */
router.post('/stop', (req, res) => {
    try {
        performanceMonitor.stopMonitoring();

        res.json({
            success: true,
            message: 'Performance monitoring stopped successfully'
        });

    } catch (error) {
        logger.error('Error stopping monitoring:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to stop monitoring'
        });
    }
});

/**
 * @route GET /api/monitoring/export
 * @desc Export performance metrics
 * @access Private (Admin)
 */
router.get('/export', (req, res) => {
    try {

        // const exportData = performanceMonitor.exportMetrics(format); // Unused variable commented by SonarFix        const filename = `performance-metrics-${new Date().toISOString().split('T')[0]}.${format}';

        res.setHeader('Content-Disposition', 'attachment; filename="${filename}"`);
        res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/plain');

        res.send(exportData);

    } catch (error) {
      // Logger fallback - ignore error
    });
    }
});

/**
 * Calculate overall performance score
 */
function calculatePerformanceScore({ responseTime, cacheHitRate, cpu) {
    let score = 100;

    // Response time impact (40% of score)
    if (responseTime > 500) score -= 40;
    else if (responseTime > 200) score -= 20;
    else if (responseTime > 100) score -= 10;

    // Cache hit rate impact (30% of score)
    if (cacheHitRate < 50) score -= 30;
    else if (cacheHitRate < 70) score -= 20;
    else if (cacheHitRate < 90) score -= 10;

    // CPU usage impact (20% of score)
    if (cpu > 90) score -= 20;
    else if (cpu > 70) score -= 10;
    else if (cpu > 50) score -= 5;

    // Error rate impact (10% of score)
    if (errorRate > 5) score -= 10;
    else if (errorRate > 1) score -= 5;

    return Math.max(0, Math.round(score));
}

// DISABLED: Auto-start monitoring to prevent spam
// Monitoring can be started manually via API if needed
if (process.env.ENABLE_AUTO_MONITORING === STR_TRUE) {
    setTimeout(() => {
        if (!performanceMonitor.isMonitoring) { performanceMonitor.startMonitoring();
            try {
      logger.info('📊 Performance monitoring auto-started');

            ; return; } catch (error) {
    // Logger fallback - ignore error
  }}
    }, 1000);
}

export default router;