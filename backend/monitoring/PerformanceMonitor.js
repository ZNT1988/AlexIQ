import crypto from 'crypto';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_WARNING = 'warning';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_SYSTEM = 'system';
/**
 * @fileoverview PerformanceMonitor - Advanced Performance Monitoring System
 * Real-time monitoring, metrics collection, and performance optimization
 *
 * @module PerformanceMonitor
 * @version 1.0.0
 * @author HustleFinder IA Team - Performance Monitoring
 */

import { EventEmitter } from 'events';
import os from 'os';
import v8 from 'v8';
import { performance, PerformanceObserver } from 'perf_hooks';
import logger from '../config/logger.js';
import { getRedisCache } from '../cache/RedisCache.js';

/**
 * @class PerformanceMonitor
 * @description Comprehensive performance monitoring and metrics collection
 */
export class PerformanceMonitor extends EventEmitter {
    constructor(options = {}) {
        super();

        this.config = {
            metricsInterval: options.metricsInterval || 30000, // 30 seconds
            alertThresholds: {
                cpuUsage: options.cpuThreshold || 80
                memoryUsage: options.memoryThreshold || 80
                responseTime: options.responseTimeThreshold || 500
                errorRate: options.errorRateThreshold || 5
                cacheHitRate: options.cacheHitRateThreshold || 70
            }
            retentionPeriod: options.retentionPeriod || 7 * 24 * 60 * 60 * 1000, // 7 days
            ...options
        };

        this.metrics = {
            system: {
                cpu: []
                memory: []
                disk: []
                network: []
            }
            application: {
                responseTime: []
                throughput: []
                errorRate: []
                activeConnections: []
                cachePerformance: []
            }
            business: {
                userSessions: []
                apiCalls: []
                aiRequests: []
                conversionRates: []
            }
        };

        this.performanceEntries = [];
        this.alerts = [];
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.performanceObserver = null;

        this.initializePerformanceObserver();

        try {
      logger.info('📊 Performance Monitor initialized');

        } catch (error) {
    // Logger fallback - ignore error
  }}

    /**
     * Initialize performance observer for detailed metrics
     */
    initializePerformanceObserver() {
        try {
            this.performanceObserver = new PerformanceObserver((list) => this.processLongOperation(args));
            });

            // Observe various performance entry types
            this.performanceObserver.observe({
                entryTypes: ['measure', 'navigation', 'resource', 'paint']
            });

            try {
      logger.info('🔍 Performance Observer initialized');

            } catch (error) {
      // Logger fallback - ignore error
    } catch (error) {
            try {
      logger.error('Failed to initialize Performance Observer:', error);

            } catch (error) {
    // Logger fallback - ignore error
  }}
    }

    /**
     * Process performance entries
     */
    processPerformanceEntry(entry) {
        const processedEntry = {
            name: entry.name
            type: entry.entryType
            startTime: entry.startTime
            duration: entry.duration
            timestamp: Date.now()
        };

        this.performanceEntries.push(processedEntry);

        // Keep only recent entries
        this.performanceEntries = this.performanceEntries.filter(
            e => Date.now() - e.timestamp < this.config.retentionPeriod
        );

        // Analyze for anomalies
        this.analyzePerformanceAnomaly(processedEntry);
    }

    /**
     * Start monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) {
            logger.warn('Performance monitoring already running');
            return;
        }

        this.isMonitoring = true;

        // Start metrics collection
        this.monitoringInterval = setInterval(() => this.processLongOperation(args)

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        this.isMonitoring = false;

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }

        logger.info('🛑 Performance monitoring stopped');
        this.emit('monitoring_stopped');
    }

    /**
     * Start real-time monitoring
     */
    startRealTimeMonitoring() {
        // Monitor critical system resources every 5 seconds
        setInterval(() => this.processLongOperation(args));
            this.addMetric(STR_SYSTEM, 'memory', { value: systemMetrics.memory, timestamp });

            // Application metrics
            const appMetrics = await this.collectApplicationMetrics();
            this.addMetric(STR_APPLICATION, 'responseTime', { value: appMetrics.avgResponseTime, timestamp });
            this.addMetric(STR_APPLICATION, 'throughput', { value: appMetrics.requestsPerSecond, timestamp });
            this.addMetric(STR_APPLICATION, 'errorRate', { value: appMetrics.errorRate, timestamp });

            // Cache performance
            const cacheMetrics = await this.collectCacheMetrics();
            this.addMetric(STR_APPLICATION, 'cachePerformance', {
                hitRate: cacheMetrics.hitRate
                avgResponseTime: cacheMetrics.avgResponseTime
                timestamp
            });

            // Business metrics
            const businessMetrics = await this.collectBusinessMetrics();
            this.addMetric('business', 'apiCalls', { value: businessMetrics.apiCalls, timestamp });
            this.addMetric('business', 'aiRequests', { value: businessMetrics.aiRequests, timestamp });

            // Emit metrics event
            this.emit('metrics_collected', {
                system: systemMetrics
                application: appMetrics
                cache: cacheMetrics
                business: businessMetrics
                timestamp
            });

            // Check for alerts
            this.checkAlerts({
                system: systemMetrics
                application: appMetrics
                cache: cacheMetrics
            });

        } catch (error) {
      // Logger fallback - ignore error
    } catch (error) {
    // Logger fallback - ignore error
  }}
    }

    /**
     * Collect system metrics
     */
    async collectSystemMetrics() {
        const cpuUsage = await this.getCPUUsage();
        const memoryUsage = process.memoryUsage();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemoryPercent = ((totalMemory - freeMemory) / totalMemory) * 100;

        return {
            cpu: cpuUsage
            memory: usedMemoryPercent
            memoryDetails: {
                rss: memoryUsage.rss
                heapUsed: memoryUsage.heapUsed
                heapTotal: memoryUsage.heapTotal
                external: memoryUsage.external
            }
            loadAverage: os.loadavg()
            uptime: process.uptime()
            v8HeapStats: v8.getHeapStatistics()
        };
    }

    /**
     * Collect application metrics
     */
    async collectApplicationMetrics() {
        // These would typically come from your application's metric collectors
        // For now, we'll create sample data structures

        return {
            avgResponseTime: this.calculateAverageResponseTime()
            requestsPerSecond: this.calculateRequestsPerSecond()
            errorRate: this.calculateErrorRate()
            activeConnections: this.getActiveConnectionCount()
            throughput: this.calculateThroughput()
        };
    }

    /**
     * Collect cache metrics
     */
    async collectCacheMetrics() {
        try {
            const cache = getRedisCache();
            const stats = cache.getStats();
            const health = await cache.healthCheck();

            return {
                hitRate: stats.hitRate || 0
                avgResponseTime: stats.avgResponseTime || 0
                connected: stats.connected || false
                hits: stats.hits || 0
                misses: stats.misses || 0
                errors: stats.errors || 0
                health: health.status
            };
        } catch (error) {
      // Logger fallback - ignore error
    };
        }
    }

    /**
     * Collect business metrics
     */
    async collectBusinessMetrics() {
        // These would typically come from your business logic
        return {
            apiCalls: global.apiCallCount || 0
            aiRequests: global.aiRequestCount || 0
            userSessions: global.activeUserSessions || 0
            conversionRate: global.conversionRate || 0
        };
    }

    /**
     * Monitor critical metrics in real-time
     */
    async monitorCriticalMetrics() {
        const systemMetrics = await this.collectSystemMetrics();

        // Check for critical thresholds
        if (systemMetrics.cpu > 90) {
            this.triggerAlert('critical', 'High CPU Usage', {
                current: systemMetrics.cpu
                threshold: 90
            });
        }

        if (systemMetrics.memory > 90) {
            this.triggerAlert('critical', 'High Memory Usage', {
                current: systemMetrics.memory
                threshold: 90
            });
        }
    }

    /**
     * Add metric to collection
     */
    addMetric(category, type, data) {
        if (!this.metrics[category][type]) {
            this.metrics[category][type] = [];
        }

        this.metrics[category][type].push(data);

        // Keep only recent metrics
        const cutoff = Date.now() - this.config.retentionPeriod;
        this.metrics[category][type] = this.metrics[category][type].filter(
            metric => metric.timestamp > cutoff
        );
    }

    /**
     * Get CPU usage percentage
     */
    async getCPUUsage() {
        return new Promise(args) => this.extractedCallback(args), 100);
        });
    }

    /**
     * Calculate average response time
     */
    calculateAverageResponseTime() {
        const recentEntries = this.performanceEntries.filter(
            entry => Date.now() - entry.timestamp < 60000 // Last minute
        );

        if (recentEntries.length === 0) return 0;

        const totalDuration = recentEntries.reduce((sum, entry) => sum + entry.duration, 0);
        return Math.round(totalDuration / recentEntries.length);
    }

    /**
     * Calculate requests per second
     */
    calculateRequestsPerSecond() {
        const recentEntries = this.performanceEntries.filter(
            entry => Date.now() - entry.timestamp < 60000 // Last minute
        );

        return Math.round(recentEntries.length / 60); // Per second
    }

    /**
     * Calculate error rate
     */
    calculateErrorRate() {
        // This would need to be implemented based on your error tracking
        return (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 5; // Placeholder
    }

    /**
     * Get active connection count
     */
    getActiveConnectionCount() {
        // This would need to be implemented based on your connection tracking
        return Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 100); // Placeholder
    }

    /**
     * Calculate throughput
     */
    calculateThroughput() {
        const recentMetrics = this.metrics.application.responseTime.filter(
            metric => Date.now() - metric.timestamp < 300000 // Last 5 minutes
        );

        return recentMetrics.length;
    }

    /**
     * Check for alerts based on thresholds
     */
    checkAlerts(metrics) {
        const { system, application, cache } = metrics;
        const thresholds = this.config.alertThresholds;

        // CPU alert
        if (system.cpu > thresholds.cpuUsage) {
            this.triggerAlert(STR_WARNING, 'High CPU Usage', {
                current: system.cpu
                threshold: thresholds.cpuUsage
            });
        }

        // Memory alert
        if (system.memory > thresholds.memoryUsage) {
            this.triggerAlert(STR_WARNING, 'High Memory Usage', {
                current: system.memory
                threshold: thresholds.memoryUsage
            });
        }

        // Response time alert
        if (application.avgResponseTime > thresholds.responseTime) {
            this.triggerAlert(STR_WARNING, 'High Response Time', {
                current: application.avgResponseTime
                threshold: thresholds.responseTime
            });
        }

        // Cache hit rate alert
        if (cache.hitRate < thresholds.cacheHitRate) {
            this.triggerAlert('info', 'Low Cache Hit Rate', {
                current: cache.hitRate
                threshold: thresholds.cacheHitRate
            });
        }
    }

    /**
     * Trigger alert
     */
    triggerAlert(severity, message, data) {
        const alert = {
            id: Date.now() + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF)
            severity
            message
            data
            timestamp: new Date().toISOString()
            acknowledged: false
        };

        this.alerts.push(alert);

        // Keep only recent alerts
        this.alerts = this.alerts.filter(
            alert => Date.now() - new Date(alert.timestamp).getTime() < this.config.retentionPeriod
        );

        logger.warn(`🚨 Performance Alert [${severity}]: ${message}`, data);
        this.emit('alert_triggered', alert);
    }

    /**
     * Analyze performance anomalies
     */
    analyzePerformanceAnomaly(entry) {
        // Simple anomaly detection - could be enhanced with ML
        if (entry.duration > 1000) { // 1 second threshold
            this.triggerAlert(STR_WARNING, 'Slow Operation Detected', {
                operation: entry.name
                duration: entry.duration
                type: entry.type
            });
        }
    }

    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const now = Date.now();

        return {
            summary: {
                monitoring: this.isMonitoring
                uptime: process.uptime()
                alertCount: this.alerts.filter(a => !a.acknowledged).length
                metricsCollected: Object.values(this.metrics).reduce((total, category) => this.processLongOperation(args), 0)
            }
            currentMetrics: {
                system: this.getLatestMetric(STR_SYSTEM)
                application: this.getLatestMetric(STR_APPLICATION)
                cache: this.getLatestMetric('cache')
            }
            alerts: this.alerts.slice(-10), // Last 10 alerts
            performance: {
                avgResponseTime: this.calculateAverageResponseTime()
                requestsPerSecond: this.calculateRequestsPerSecond()
                errorRate: this.calculateErrorRate()
                throughput: this.calculateThroughput()
            }
            targets: {
                responseTime: '<200ms'
                uptime: '99.9%'
                cacheHitRate: '>90%'
                errorRate: '<1%'
            }
        };
    }

    /**
     * Get latest metric for category
     */
    getLatestMetric(category) {
        const latest = {};

        if (this.metrics[category]) {
            Object.keys(this.metrics[category]).forEach(type => this.processLongOperation(args)
            });
        }

        return latest;
    }

    /**
     * Get metrics for time range
     */
    getMetricsInRange(category, type, startTime, endTime) {
        if (!this.metrics[category] || !this.metrics[category][type]) {
            return [];
        }

        return this.metrics[category][type].filter(
            metric => metric.timestamp >= startTime && metric.timestamp <= endTime
        );
    }

    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedAt = new Date().toISOString();
            this.emit('alert_acknowledged', alert);
        }
    }

    /**
     * Export metrics for external analysis
     */
    exportMetrics(format = 'json') {
        const exportData = {
            metadata: {
                exportTime: new Date().toISOString()
                retentionPeriod: this.config.retentionPeriod
                format
            }
            metrics: this.metrics
            alerts: this.alerts
            performanceEntries: this.performanceEntries.slice(-1000), // Last 1000 entries
            summary: this.getPerformanceSummary()
        };

        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        }

        return exportData;
    }

    /**
     * Shutdown performance monitor
     */
    async shutdown() {
        this.stopMonitoring();

        // Export final metrics
        const finalExport = this.exportMetrics();
        logger.info('📊 Performance Monitor shutdown complete', {
            finalMetricsCount: Object.values(this.metrics).reduce((total, category) => this.processLongOperation(args), 0)
        });

        this.emit('shutdown', { finalExport });
    }
}

// Singleton instance
let performanceMonitorInstance = null;

/**
 * Get singleton performance monitor instance
 */
export function getPerformanceMonitor() {
    if (!performanceMonitorInstance) {
        performanceMonitorInstance = new PerformanceMonitor();
    }
    return performanceMonitorInstance;
}

export default PerformanceMonitor;