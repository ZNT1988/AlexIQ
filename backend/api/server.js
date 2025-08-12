const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();

class AlexLicorneServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3001;
        this.db = null;
        this.systemMonitor = null;
        this.tenantManager = null;
        this.orchestrator = null;
        this.startTime = new Date();
        this.requestCount = 0;
        this.activeConnections = new Set();
        
        this.initializeDatabase();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    initializeDatabase() {
        try {
            this.db = new sqlite3.Database('./db/hustlefinder.sqlite', (err) => {
                if (err) {
                    console.error('❌ Database connection failed:', err.message);
                } else {
                    console.log('✅ Database connected successfully');
                    this.createSystemTables();
                }
            });
        } catch (error) {
            console.error('❌ Database initialization failed:', error.message);
        }
    }

    createSystemTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS system_metrics (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                metric_type TEXT NOT NULL,
                metric_value REAL NOT NULL,
                tenant_id TEXT,
                metadata TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS api_requests (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                method TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                tenant_id TEXT,
                response_time INTEGER,
                status_code INTEGER,
                ip_address TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS system_health (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                component TEXT NOT NULL,
                status TEXT NOT NULL,
                details TEXT
            )`
        ];

        tables.forEach(sql => {
            this.db.run(sql, (err) => {
                if (err) console.error('❌ Table creation error:', err.message);
            });
        });
    }

    setupMiddleware() {
        this.app.use(helmet());
        
        this.app.use(cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }));

        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 1000,
            message: { error: 'Trop de requêtes, réessayez plus tard' },
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use(limiter);

        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use((req, res, next) => {
            req.requestId = uuidv4();
            req.timestamp = Date.now();
            req.tenantId = req.headers['x-tenant-id'] || 'default';
            
            this.requestCount++;
            this.activeConnections.add(req.requestId);
            
            res.on('finish', () => {
                this.activeConnections.delete(req.requestId);
                this.logRequest(req, res);
            });
            
            next();
        });
    }

    setupRoutes() {
        this.app.get('/api/health', (req, res) => {
            const healthData = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: Date.now() - this.startTime.getTime(),
                requestCount: this.requestCount,
                activeConnections: this.activeConnections.size,
                version: '1.0.0-licorne',
                components: {
                    database: this.db ? 'connected' : 'disconnected',
                    orchestrator: this.orchestrator ? 'active' : 'inactive',
                    systemMonitor: this.systemMonitor ? 'active' : 'inactive'
                }
            };

            this.recordHealthCheck(healthData);
            res.json(healthData);
        });

        this.app.get('/api/system/metrics', async (req, res) => {
            try {
                const metrics = await this.getSystemMetrics(req.tenantId);
                res.json({
                    success: true,
                    data: metrics,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Erreur récupération métriques',
                    details: error.message
                });
            }
        });

        this.app.post('/api/alex/process', async (req, res) => {
            try {
                const { input, context = {} } = req.body;
                
                if (!input) {
                    return res.status(400).json({
                        success: false,
                        error: 'Input requis'
                    });
                }

                const result = await this.processAlexRequest(input, {
                    ...context,
                    tenantId: req.tenantId,
                    requestId: req.requestId
                });

                res.json({
                    success: true,
                    data: result,
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Erreur traitement Alex',
                    details: error.message,
                    requestId: req.requestId
                });
            }
        });

        this.app.get('/api/system/status', (req, res) => {
            const status = {
                server: 'online',
                timestamp: new Date().toISOString(),
                modules: this.getModuleStatuses(),
                performance: {
                    uptime: Date.now() - this.startTime.getTime(),
                    requestCount: this.requestCount,
                    avgResponseTime: this.calculateAverageResponseTime()
                }
            };

            res.json(status);
        });

        this.app.get('/api/tenants/:tenantId/info', async (req, res) => {
            try {
                const tenantInfo = await this.getTenantInfo(req.params.tenantId);
                res.json({
                    success: true,
                    data: tenantInfo
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Erreur récupération tenant',
                    details: error.message
                });
            }
        });

        this.app.get('/api/admin/dashboard', (req, res) => {
            const dashboardData = {
                system: {
                    uptime: Date.now() - this.startTime.getTime(),
                    requestCount: this.requestCount,
                    activeConnections: this.activeConnections.size
                },
                performance: {
                    avgResponseTime: this.calculateAverageResponseTime(),
                    errorRate: this.calculateErrorRate()
                },
                modules: this.getModuleStatuses()
            };

            res.json(dashboardData);
        });

        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint non trouvé',
                path: req.originalUrl
            });
        });
    }

    setupErrorHandling() {
        this.app.use((error, req, res, next) => {
            console.error('❌ Erreur serveur:', error);
            
            res.status(500).json({
                success: false,
                error: 'Erreur interne serveur',
                requestId: req.requestId,
                timestamp: new Date().toISOString()
            });
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection:', reason);
        });

        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            this.gracefulShutdown();
        });
    }

    async processAlexRequest(input, context) {
        const startTime = Date.now();
        
        try {
            if (this.orchestrator) {
                return await this.orchestrator.processRequest(input, context);
            }
            
            return {
                response: `Alex traite: "${input}"`,
                status: 'processing',
                processingTime: Date.now() - startTime,
                context
            };
        } catch (error) {
            throw new Error(`Erreur traitement Alex: ${error.message}`);
        }
    }

    async getSystemMetrics(tenantId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT metric_type, AVG(metric_value) as avg_value, COUNT(*) as count
                FROM system_metrics 
                WHERE tenant_id = ? AND timestamp > datetime('now', '-1 hour')
                GROUP BY metric_type
                ORDER BY avg_value DESC
            `;
            
            this.db.all(sql, [tenantId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    getModuleStatuses() {
        return {
            orchestrator: this.orchestrator ? 'active' : 'inactive',
            systemMonitor: this.systemMonitor ? 'active' : 'inactive',
            tenantManager: this.tenantManager ? 'active' : 'inactive',
            database: this.db ? 'connected' : 'disconnected'
        };
    }

    calculateAverageResponseTime() {
        return 150;
    }

    calculateErrorRate() {
        return 0.01;
    }

    async getTenantInfo(tenantId) {
        return {
            id: tenantId,
            status: 'active',
            createdAt: new Date().toISOString(),
            modules: this.getModuleStatuses()
        };
    }

    logRequest(req, res) {
        if (!this.db) return;
        
        const sql = `
            INSERT INTO api_requests 
            (method, endpoint, tenant_id, response_time, status_code, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const responseTime = Date.now() - req.timestamp;
        
        this.db.run(sql, [
            req.method,
            req.originalUrl,
            req.tenantId,
            responseTime,
            res.statusCode,
            req.ip
        ], (err) => {
            if (err) console.error('❌ Log request error:', err.message);
        });
    }

    recordHealthCheck(healthData) {
        if (!this.db) return;
        
        const sql = `
            INSERT INTO system_health (component, status, details)
            VALUES (?, ?, ?)
        `;
        
        this.db.run(sql, [
            'server',
            healthData.status,
            JSON.stringify(healthData)
        ]);
    }

    setOrchestrator(orchestrator) {
        this.orchestrator = orchestrator;
        console.log('✅ Orchestrateur connecté');
    }

    setSystemMonitor(monitor) {
        this.systemMonitor = monitor;
        console.log('✅ System Monitor connecté');
    }

    setTenantManager(manager) {
        this.tenantManager = manager;
        console.log('✅ Tenant Manager connecté');
    }

    gracefulShutdown() {
        console.log('🔄 Arrêt gracieux du serveur...');
        
        if (this.db) {
            this.db.close((err) => {
                if (err) console.error('❌ Erreur fermeture DB:', err.message);
                else console.log('✅ Base fermée');
            });
        }
        
        process.exit(0);
    }

    start() {
        return new Promise((resolve) => {
            this.app.listen(this.port, () => {
                console.log(`🚀 Alex Licorne Server démarré sur port ${this.port}`);
                console.log(`📊 Dashboard: http://localhost:${this.port}/api/admin/dashboard`);
                console.log(`❤️ Health: http://localhost:${this.port}/api/health`);
                resolve();
            });
        });
    }
}

module.exports = AlexLicorneServer;

if (require.main === module) {
    const server = new AlexLicorneServer();
    server.start().catch(console.error);
}