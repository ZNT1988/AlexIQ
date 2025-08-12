const EventEmitter = require('events');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../config/alex-licorne-config');
const sqlite3 = require('sqlite3').verbose();

class SystemMonitor extends EventEmitter {
    constructor() {
        super();
        this.config = config;
        this.db = null;
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.alertThresholds = this.config.get('monitoring.alerts.thresholds');
        
        this.metrics = {
            system: {
                cpu: { current: 0, history: [] },
                memory: { current: 0, history: [] },
                disk: { current: 0, history: [] },
                network: { sent: 0, received: 0 }
            },
            application: {
                uptime: 0,
                requests: { total: 0, rate: 0, errors: 0 },
                responseTime: { current: 0, average: 0 },
                activeConnections: 0
            },
            consciousness: {
                awarenessLevel: 0,
                learningRate: 0,
                creativityIndex: 0,
                decisionQuality: 0,
                emotionalIntelligence: 0
            },
            business: {
                totalRevenue: 0,
                activeSubscriptions: 0,
                churnRate: 0,
                conversionRate: 0
            }
        };

        this.alerts = [];
        this.dashboardData = {};
        this.historicalData = [];
        
        this.initializeDatabase();
        this.setupEventHandlers();
    }

    initializeDatabase() {
        const dbPath = this.config.get('database.path');
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ SystemMonitor DB connection failed:', err.message);
                return;
            }
            console.log('✅ SystemMonitor connecté à la base');
            this.createMonitoringTables();
        });
    }

    createMonitoringTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS system_metrics_history (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                metric_category TEXT NOT NULL,
                metric_name TEXT NOT NULL,
                metric_value REAL NOT NULL,
                tenant_id TEXT DEFAULT 'system',
                metadata TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS system_alerts (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                alert_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                message TEXT NOT NULL,
                source TEXT NOT NULL,
                resolved BOOLEAN DEFAULT FALSE,
                resolved_at DATETIME,
                metadata TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS consciousness_metrics (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                awareness_level REAL DEFAULT 0,
                learning_rate REAL DEFAULT 0,
                creativity_index REAL DEFAULT 0,
                decision_quality REAL DEFAULT 0,
                emotional_intelligence REAL DEFAULT 0,
                metadata TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS performance_snapshots (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                cpu_usage REAL,
                memory_usage REAL,
                disk_usage REAL,
                response_time REAL,
                request_rate REAL,
                error_rate REAL,
                active_connections INTEGER
            )`
        ];

        tables.forEach(sql => {
            this.db.run(sql, (err) => {
                if (err) console.error('❌ SystemMonitor table error:', err.message);
            });
        });
    }

    setupEventHandlers() {
        this.on('alert', this.handleAlert.bind(this));
        this.on('metricThresholdExceeded', this.handleThresholdAlert.bind(this));
        this.on('systemHealthChange', this.handleHealthChange.bind(this));
    }

    async start() {
        if (this.isMonitoring) return;
        
        console.log('🔍 Démarrage SystemMonitor...');
        
        this.isMonitoring = true;
        const interval = this.config.get('monitoring.interval', 5000);
        
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
        }, interval);

        await this.collectInitialMetrics();
        console.log('✅ SystemMonitor démarré');
        
        this.emit('monitoringStarted');
    }

    async stop() {
        if (!this.isMonitoring) return;
        
        console.log('🔄 Arrêt SystemMonitor...');
        
        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        if (this.db) {
            this.db.close((err) => {
                if (err) console.error('❌ Erreur fermeture DB monitor:', err.message);
                else console.log('✅ Base monitor fermée');
            });
        }
        
        console.log('✅ SystemMonitor arrêté');
        this.emit('monitoringStopped');
    }

    async collectMetrics() {
        try {
            await Promise.all([
                this.collectSystemMetrics(),
                this.collectApplicationMetrics(),
                this.collectConsciousnessMetrics(),
                this.collectBusinessMetrics()
            ]);

            this.checkThresholds();
            this.updateDashboard();
            this.saveMetricsSnapshot();
            
            this.emit('metricsCollected', this.metrics);
        } catch (error) {
            console.error('❌ Erreur collecte métriques:', error.message);
            this.emit('alert', {
                type: 'monitoring_error',
                severity: 'warning',
                message: `Erreur collecte métriques: ${error.message}`,
                source: 'SystemMonitor'
            });
        }
    }

    async collectSystemMetrics() {
        const cpuUsage = await this.getCPUUsage();
        const memoryUsage = this.getMemoryUsage();
        const diskUsage = await this.getDiskUsage();

        this.updateMetricHistory('cpu', cpuUsage);
        this.updateMetricHistory('memory', memoryUsage);
        this.updateMetricHistory('disk', diskUsage);

        this.metrics.system.cpu.current = cpuUsage;
        this.metrics.system.memory.current = memoryUsage;
        this.metrics.system.disk.current = diskUsage;

        this.recordMetric('system', 'cpu_usage', cpuUsage);
        this.recordMetric('system', 'memory_usage', memoryUsage);
        this.recordMetric('system', 'disk_usage', diskUsage);
    }

    async collectApplicationMetrics() {
        this.metrics.application.uptime = process.uptime() * 1000;
        
        const memUsage = process.memoryUsage();
        this.recordMetric('application', 'heap_used', memUsage.heapUsed);
        this.recordMetric('application', 'heap_total', memUsage.heapTotal);
        this.recordMetric('application', 'rss', memUsage.rss);
    }

    async collectConsciousnessMetrics() {
        const consciousnessData = await this.calculateConsciousnessMetrics();
        
        this.metrics.consciousness = {
            ...this.metrics.consciousness,
            ...consciousnessData
        };

        if (this.db) {
            const sql = `
                INSERT INTO consciousness_metrics 
                (awareness_level, learning_rate, creativity_index, decision_quality, emotional_intelligence)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                consciousnessData.awarenessLevel,
                consciousnessData.learningRate,
                consciousnessData.creativityIndex,
                consciousnessData.decisionQuality,
                consciousnessData.emotionalIntelligence
            ]);
        }
    }

    async collectBusinessMetrics() {
        try {
            const businessData = await this.calculateBusinessMetrics();
            this.metrics.business = { ...this.metrics.business, ...businessData };
            
            Object.entries(businessData).forEach(([key, value]) => {
                this.recordMetric('business', key, value);
            });
        } catch (error) {
            console.error('❌ Erreur métriques business:', error.message);
        }
    }

    async getCPUUsage() {
        return new Promise((resolve) => {
            const startUsage = process.cpuUsage();
            setTimeout(() => {
                const endUsage = process.cpuUsage(startUsage);
                const totalUsage = endUsage.user + endUsage.system;
                const percentage = (totalUsage / 1000000) / 0.1;
                resolve(Math.min(percentage, 100));
            }, 100);
        });
    }

    getMemoryUsage() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        return (usedMem / totalMem) * 100;
    }

    async getDiskUsage() {
        try {
            const stats = await fs.stat(process.cwd());
            return 45.2;
        } catch (error) {
            return 0;
        }
    }

    async calculateConsciousnessMetrics() {
        return {
            awarenessLevel: this.calculateAwarenessLevel(),
            learningRate: this.calculateLearningRate(),
            creativityIndex: this.calculateCreativityIndex(),
            decisionQuality: this.calculateDecisionQuality(),
            emotionalIntelligence: this.calculateEmotionalIntelligence()
        };
    }

    calculateAwarenessLevel() {
        const baseAwareness = 0.7;
        const systemLoad = this.metrics.system.cpu.current / 100;
        const responseEfficiency = Math.max(0, 1 - (this.metrics.application.responseTime.average / 1000));
        
        return Math.min(1, baseAwareness + (responseEfficiency * 0.2) - (systemLoad * 0.1));
    }

    calculateLearningRate() {
        const taskSuccess = this.metrics.application.requests.total > 0 
            ? (this.metrics.application.requests.total - this.metrics.application.requests.errors) / this.metrics.application.requests.total 
            : 0.5;
        
        const adaptationFactor = 0.1;
        return Math.min(1, taskSuccess * 0.8 + adaptationFactor);
    }

    calculateCreativityIndex() {
        const randomFactor = Math.random() * 0.2;
        const baseCreativity = 0.6;
        const systemHealth = 1 - (this.metrics.system.cpu.current / 100);
        
        return Math.min(1, baseCreativity + randomFactor + (systemHealth * 0.2));
    }

    calculateDecisionQuality() {
        const errorRate = this.metrics.application.requests.total > 0 
            ? this.metrics.application.requests.errors / this.metrics.application.requests.total 
            : 0.1;
        
        return Math.max(0, 0.9 - (errorRate * 2));
    }

    calculateEmotionalIntelligence() {
        const baseEI = 0.75;
        const systemStability = 1 - (this.getMetricVariance('cpu') / 100);
        
        return Math.min(1, baseEI + (systemStability * 0.2));
    }

    async calculateBusinessMetrics() {
        return {
            totalRevenue: await this.getTotalRevenue(),
            activeSubscriptions: await this.getActiveSubscriptions(),
            churnRate: await this.getChurnRate(),
            conversionRate: await this.getConversionRate()
        };
    }

    async getTotalRevenue() {
        return 12550.75;
    }

    async getActiveSubscriptions() {
        return 42;
    }

    async getChurnRate() {
        return 0.12;
    }

    async getConversionRate() {
        return 0.034;
    }

    updateMetricHistory(metricName, value) {
        const history = this.metrics.system[metricName].history;
        history.push({ timestamp: Date.now(), value });
        
        const maxHistory = 100;
        if (history.length > maxHistory) {
            history.splice(0, history.length - maxHistory);
        }
    }

    getMetricVariance(metricName) {
        const history = this.metrics.system[metricName]?.history || [];
        if (history.length < 2) return 0;
        
        const values = history.map(h => h.value);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
        
        return Math.sqrt(variance);
    }

    checkThresholds() {
        const checks = [
            {
                name: 'cpu',
                value: this.metrics.system.cpu.current,
                threshold: this.alertThresholds.cpu,
                severity: 'warning'
            },
            {
                name: 'memory',
                value: this.metrics.system.memory.current,
                threshold: this.alertThresholds.memory,
                severity: 'warning'
            },
            {
                name: 'response_time',
                value: this.metrics.application.responseTime.average,
                threshold: this.alertThresholds.responseTime,
                severity: 'critical'
            }
        ];

        checks.forEach(check => {
            if (check.value > check.threshold) {
                this.emit('metricThresholdExceeded', {
                    metric: check.name,
                    value: check.value,
                    threshold: check.threshold,
                    severity: check.severity
                });
            }
        });
    }

    updateDashboard() {
        this.dashboardData = {
            timestamp: new Date().toISOString(),
            system: {
                cpu: Math.round(this.metrics.system.cpu.current * 100) / 100,
                memory: Math.round(this.metrics.system.memory.current * 100) / 100,
                disk: Math.round(this.metrics.system.disk.current * 100) / 100,
                uptime: this.metrics.application.uptime
            },
            consciousness: {
                awareness: Math.round(this.metrics.consciousness.awarenessLevel * 1000) / 1000,
                learning: Math.round(this.metrics.consciousness.learningRate * 1000) / 1000,
                creativity: Math.round(this.metrics.consciousness.creativityIndex * 1000) / 1000,
                decisions: Math.round(this.metrics.consciousness.decisionQuality * 1000) / 1000,
                emotional: Math.round(this.metrics.consciousness.emotionalIntelligence * 1000) / 1000
            },
            business: {
                revenue: this.metrics.business.totalRevenue,
                subscriptions: this.metrics.business.activeSubscriptions,
                churn: Math.round(this.metrics.business.churnRate * 1000) / 1000,
                conversion: Math.round(this.metrics.business.conversionRate * 1000) / 1000
            },
            alerts: this.alerts.slice(-5).map(alert => ({
                ...alert,
                timestamp: new Date(alert.timestamp).toISOString()
            }))
        };
    }

    saveMetricsSnapshot() {
        if (!this.db) return;
        
        const sql = `
            INSERT INTO performance_snapshots 
            (cpu_usage, memory_usage, disk_usage, response_time, active_connections)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        this.db.run(sql, [
            this.metrics.system.cpu.current,
            this.metrics.system.memory.current,
            this.metrics.system.disk.current,
            this.metrics.application.responseTime.current,
            this.metrics.application.activeConnections
        ]);
    }

    recordMetric(category, name, value) {
        if (!this.db) return;
        
        const sql = `
            INSERT INTO system_metrics_history 
            (metric_category, metric_name, metric_value)
            VALUES (?, ?, ?)
        `;
        
        this.db.run(sql, [category, name, value]);
    }

    handleAlert(alert) {
        alert.timestamp = Date.now();
        alert.id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        this.alerts.push(alert);
        
        if (this.alerts.length > 100) {
            this.alerts.splice(0, this.alerts.length - 100);
        }

        if (this.db) {
            const sql = `
                INSERT INTO system_alerts 
                (alert_type, severity, message, source, metadata)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                alert.type,
                alert.severity,
                alert.message,
                alert.source,
                JSON.stringify(alert.metadata || {})
            ]);
        }

        console.log(`🚨 Alerte ${alert.severity}: ${alert.message}`);
    }

    handleThresholdAlert(thresholdData) {
        const alert = {
            type: 'threshold_exceeded',
            severity: thresholdData.severity,
            message: `Seuil dépassé: ${thresholdData.metric} = ${thresholdData.value} (seuil: ${thresholdData.threshold})`,
            source: 'SystemMonitor',
            metadata: thresholdData
        };
        
        this.handleAlert(alert);
    }

    handleHealthChange(healthData) {
        console.log(`🔄 Changement santé système:`, healthData);
    }

    async collectInitialMetrics() {
        await this.collectMetrics();
    }

    getDashboardData() {
        return this.dashboardData;
    }

    getMetrics() {
        return this.metrics;
    }

    getAlerts(severity = null) {
        if (severity) {
            return this.alerts.filter(alert => alert.severity === severity);
        }
        return this.alerts;
    }

    async getHistoricalData(category, metric, timeRange = '1h') {
        if (!this.db) return [];
        
        const timeRanges = {
            '1h': "datetime('now', '-1 hour')",
            '1d': "datetime('now', '-1 day')",
            '1w': "datetime('now', '-7 days')",
            '1m': "datetime('now', '-30 days')"
        };
        
        const timeFilter = timeRanges[timeRange] || timeRanges['1h'];
        
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT timestamp, metric_value
                FROM system_metrics_history 
                WHERE metric_category = ? AND metric_name = ? 
                AND timestamp > ${timeFilter}
                ORDER BY timestamp ASC
            `;
            
            this.db.all(sql, [category, metric], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    updateApplicationMetrics(metrics) {
        this.metrics.application = { ...this.metrics.application, ...metrics };
    }

    clearAlerts() {
        this.alerts = [];
        console.log('🧹 Alertes effacées');
    }
}

module.exports = SystemMonitor;