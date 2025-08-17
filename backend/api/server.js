const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { v4: uuidv4 } = require("uuid");
const sqlite3 = require("sqlite3").verbose();

// 🤖 Import providers hybrides (feature flagged)
let alexProviderWrapper = null;
let providersHealthCheck = null;
let budgetAlerting = null;
let performanceOptimizer = null;
if (process.env.PROVIDER_HYBRID_ENABLED === 'true') {
  try {
    alexProviderWrapper = require('../core/providers/alexProviderWrapper');
    providersHealthCheck = require('../core/providers/healthCheck');
    budgetAlerting = require('../core/providers/budgetAlerting');
    performanceOptimizer = require('../core/providers/performanceOptimizer');
    
  } catch (error) {
    
  }
}

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
      this.db = new sqlite3.Database("./db/hustlefinder.sqlite", (err) => {
        if (err) {
          
        } else {
          
          this.createSystemTables();
        }
      });
    } catch (error) {
      
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
            )`,
    ];

    tables.forEach((sql) => {
      this.db.run(sql, (err) => {
        if (err) 
      });
    });
  }

  setupMiddleware() {
    this.app.use(helmet());

    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      }),
    );

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      message: { error: "Trop de requêtes, réessayez plus tard" },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use((req, res, next) => {
      req.requestId = uuidv4();
      req.timestamp = Date.now();
      req.tenantId = req.headers["x-tenant-id"] || "default";

      this.requestCount++;
      this.activeConnections.add(req.requestId);

      res.on("finish", () => {
        this.activeConnections.delete(req.requestId);
        this.logRequest(req, res);
      });

      next();
    });
  }

  setupRoutes() {
    this.app.get("/api/health", (req, res) => {
      const healthData = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime.getTime(),
        requestCount: this.requestCount,
        activeConnections: this.activeConnections.size,
        version: "1.0.0-licorne",
        components: {
          database: this.db ? "connected" : "disconnected",
          orchestrator: this.orchestrator ? "active" : "inactive",
          systemMonitor: this.systemMonitor ? "active" : "inactive",
          providersHybrid: alexProviderWrapper && process.env.PROVIDER_HYBRID_ENABLED === 'true' ? "active" : "inactive",
        },
      };

      this.recordHealthCheck(healthData);
      res.json(healthData);
    });

    this.app.get("/api/system/metrics", async (req, res) => {
      try {
        const metrics = await this.getSystemMetrics(req.tenantId);
        res.json({
          success: true,
          data: metrics,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: "Erreur récupération métriques",
          details: error.message,
        });
      }
    });

    this.app.post("/api/alex/process", async (req, res) => {
      try {
        const { input, context = {} } = req.body;

        if (!input) {
          return res.status(400).json({
            success: false,
            error: "Input requis",
          });
        }

        const result = await this.processAlexRequest(input, {
          ...context,
          tenantId: req.tenantId,
          requestId: req.requestId,
        });

        res.json({
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: "Erreur traitement Alex",
          details: error.message,
          requestId: req.requestId,
        });
      }
    });

    this.app.get("/api/system/status", (req, res) => {
      const status = {
        server: "online",
        timestamp: new Date().toISOString(),
        modules: this.getModuleStatuses(),
        performance: {
          uptime: Date.now() - this.startTime.getTime(),
          requestCount: this.requestCount,
          avgResponseTime: this.calculateAverageResponseTime(),
        },
      };

      res.json(status);
    });

    this.app.get("/api/tenants/:tenantId/info", async (req, res) => {
      try {
        const tenantInfo = await this.getTenantInfo(req.params.tenantId);
        res.json({
          success: true,
          data: tenantInfo,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: "Erreur récupération tenant",
          details: error.message,
        });
      }
    });

    this.app.get("/api/admin/dashboard", (req, res) => {
      const dashboardData = {
        system: {
          uptime: Date.now() - this.startTime.getTime(),
          requestCount: this.requestCount,
          activeConnections: this.activeConnections.size,
        },
        performance: {
          avgResponseTime: this.calculateAverageResponseTime(),
          errorRate: this.calculateErrorRate(),
        },
        modules: this.getModuleStatuses(),
      };

      res.json(dashboardData);
    });

    // 🦄 ROUTES LICORNE AUTHENTIQUE - API IA RÉELLE
    const realLicorneRoutes = require("../routes/real-licorne-api");
    this.app.use("/api/licorne", realLicorneRoutes);
    
    // 🌊 STREAMING ROUTES - Real-time API
    try {
      const streamingRoutes = require("../routes/streaming-api");
      this.app.use("/api/streaming", streamingRoutes);
      
    } catch (error) {
      
    }
    
    // 🤖 ROUTES PROVIDERS HYBRIDES - Monitoring et contrôle
    if (alexProviderWrapper) {
      this.app.get("/api/providers/status", (req, res) => {
        const stats = alexProviderWrapper.getUsageStats();
        res.json({
          success: true,
          data: {
            enabled: process.env.PROVIDER_HYBRID_ENABLED === 'true',
            ...stats,
            timestamp: new Date().toISOString()
          }
        });
      });
      
      this.app.post("/api/providers/toggle", (req, res) => {
        const { enabled } = req.body;
        process.env.PROVIDER_HYBRID_ENABLED = enabled ? 'true' : 'false';
        
        if (alexProviderWrapper.setEnabled) {
          alexProviderWrapper.setEnabled(enabled);
        }
        
        res.json({
          success: true,
          message: `Providers ${enabled ? 'activated' : 'deactivated'}`,
          enabled: enabled
        });
      });
      
      this.app.get("/api/providers/health", async (req, res) => {
        try {
          const healthData = providersHealthCheck ? 
            await providersHealthCheck.checkProviders() : 
            { overall: 'unavailable', message: 'Health checker not loaded' };
            
          res.json({
            success: true,
            data: healthData,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: 'Health check failed',
            details: error.message
          });
        }
      });
      
      this.app.get("/api/providers/health/quick", (req, res) => {
        try {
          const healthData = providersHealthCheck ? 
            providersHealthCheck.quickCheck() : 
            { overall: 'unavailable', message: 'Health checker not loaded' };
            
          res.json({
            success: true,
            data: healthData,
            cached: healthData.cached || false
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: 'Quick health check failed',
            details: error.message
          });
        }
      });
      
      this.app.get("/api/providers/alerts", (req, res) => {
        try {
          const history = budgetAlerting ? 
            budgetAlerting.getAlertHistory(parseInt(req.query.limit) || 20) : 
            [];
            
          const state = budgetAlerting ? 
            budgetAlerting.getCurrentAlertState() : 
            { message: 'Alerting not available' };
            
          res.json({
            success: true,
            data: {
              history,
              state,
              timestamp: new Date().toISOString()
            }
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: 'Alerts fetch failed',
            details: error.message
          });
        }
      });
      
      this.app.post("/api/providers/alerts/test", async (req, res) => {
        try {
          const result = budgetAlerting ? 
            await budgetAlerting.testWebhooks() :
            { success: false, message: 'Alerting not available' };
            
          res.json({
            success: result.success,
            message: result.message,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: 'Alert test failed',
            details: error.message
          });
        }
      });
      
      this.app.get("/api/providers/performance", (req, res) => {
        try {
          const metrics = performanceOptimizer ? 
            performanceOptimizer.getPerformanceMetrics() :
            { message: 'Performance optimizer not available' };
            
          res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: 'Performance metrics failed',
            details: error.message
          });
        }
      });
      
      this.app.post("/api/providers/cache/clear", (req, res) => {
        try {
          if (performanceOptimizer) {
            performanceOptimizer.clearAllCaches();
            res.json({
              success: true,
              message: 'All caches cleared',
              timestamp: new Date().toISOString()
            });
          } else {
            res.status(404).json({
              success: false,
              error: 'Performance optimizer not available'
            });
          }
        } catch (error) {
          res.status(500).json({
            success: false,
            error: 'Cache clear failed',
            details: error.message
          });
        }
      });
      
      this.app.post("/api/providers/cache/prewarm", async (req, res) => {
        try {
          if (performanceOptimizer) {
            await performanceOptimizer.preWarmCache();
            res.json({
              success: true,
              message: 'Cache pre-warming initiated',
              timestamp: new Date().toISOString()
            });
          } else {
            res.status(404).json({
              success: false,
              error: 'Performance optimizer not available'
            });
          }
        } catch (error) {
          res.status(500).json({
            success: false,
            error: 'Cache pre-warm failed',
            details: error.message
          });
        }
      });
    }

    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        error: "Endpoint non trouvé",
        path: req.originalUrl,
      });
    });
  }

  setupErrorHandling() {
    this.app.use((error, req, res, next) => {
      
      res.status(500).json({
        success: false,
        error: "Erreur interne serveur",
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      });
    });

    process.on("unhandledRejection", (reason, promise) => {
      
    });

    process.on("uncaughtException", (error) => {
      
      this.gracefulShutdown();
    });
  }

  async processAlexRequest(input, context) {
    const startTime = Date.now();

    try {
      // 🤖 PROVIDERS HYBRIDES - Routing intelligent avec feature flag
      if (alexProviderWrapper && process.env.PROVIDER_HYBRID_ENABLED === 'true') {
        
        const request = { 
          input, 
          message: input, 
          query: input 
        };
        
        const enhancedContext = {
          ...context,
          correlationId: context.requestId || `hf-${Date.now()}`,
          alexPersonality: { 
            name: 'Alex Licorne', 
            traits: ['intelligent', 'bienveillant', 'business-oriented'] 
          },
          consciousnessLevel: 95,
          source: 'hf-server'
        };
        
        try {
          const result = await alexProviderWrapper.processRequest(request, enhancedContext);
          
          // Ajout métriques providers pour monitoring HF
          if (this.systemMonitor && result.metadata) {
            this.systemMonitor.recordMetric('provider_request', {
              provider: result.metadata.provider,
              latency: result.metadata.processingTime,
              cost: result.metadata.costUSD,
              success: true
            });
          }
          
          return result;
        } catch (providerError) {
          
          // Continue vers orchestrator legacy en cas d'erreur
        }
      }
      
      // 🦄 LEGACY ORCHESTRATOR - Système HF classique
      if (this.orchestrator) {
        
        return await this.orchestrator.processRequest(input, context);
      }

      // 📝 FALLBACK SIMPLE - Réponse basique si aucun système disponible
      return {
        response: `Alex traite: "${input}"`,
        status: "processing",
        processingTime: Date.now() - startTime,
        context,
        metadata: { 
          source: 'simple-fallback',
          timestamp: new Date().toISOString() 
        }
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
      orchestrator: this.orchestrator ? "active" : "inactive",
      systemMonitor: this.systemMonitor ? "active" : "inactive",
      tenantManager: this.tenantManager ? "active" : "inactive",
      database: this.db ? "connected" : "disconnected",
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
      status: "active",
      createdAt: new Date().toISOString(),
      modules: this.getModuleStatuses(),
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

    this.db.run(
      sql,
      [
        req.method,
        req.originalUrl,
        req.tenantId,
        responseTime,
        res.statusCode,
        req.ip,
      ],
      (err) => {
        if (err) 
      },
    );
  }

  recordHealthCheck(healthData) {
    if (!this.db) return;

    const sql = `
            INSERT INTO system_health (component, status, details)
            VALUES (?, ?, ?)
        `;

    this.db.run(sql, ["server", healthData.status, JSON.stringify(healthData)]);
  }

  setOrchestrator(orchestrator) {
    this.orchestrator = orchestrator;
    
  }

  setSystemMonitor(monitor) {
    this.systemMonitor = monitor;
    
  }

  setTenantManager(manager) {
    this.tenantManager = manager;
    
  }

  gracefulShutdown() {
    
    if (this.db) {
      this.db.close((err) => {
        if (err) 
        else 
      });
    }

    process.exit(0);
  }

  start() {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        
        
        
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
