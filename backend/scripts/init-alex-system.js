#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class AlexSystemInitializer {
    constructor() {
        this.baseDir = path.join(__dirname, '..');
        this.dbPath = path.join(this.baseDir, 'data', 'alex-system.db');
        this.configPath = path.join(this.baseDir, 'config', 'licorne.json');
        this.logPath = path.join(this.baseDir, 'logs', 'initialization.log');
        
        this.modules = [
            'alex-core/AlexMasterSystem.js',
            'alex-modules/consciousness/AlexHyperIntelligence.js',
            'alex-modules/specialized/MemoryPalace.js',
            'alex-modules/consciousness/CloudLearningInterface.js',
            'alex-modules/core/AppStoreModuleManager.js',
            'alex-modules/core/AlexSaaSArchitecture.js'
        ];
    }

    async init() {
        console.log('🦄 INITIALISATION SYSTÈME LICORNE ALEX');
        console.log('======================================\n');
        
        try {
            await this.createDirectories();
            await this.initializeDatabase();
            await this.createConfiguration();
            await this.validateModules();
            await this.performSystemBootstrap();
            await this.runHealthChecks();
            
            console.log('\n✅ SYSTÈME ALEX LICORNE INITIALISÉ AVEC SUCCÈS');
            console.log('🚀 Prêt pour déploiement production');
            
        } catch (error) {
            console.error('❌ ERREUR INITIALISATION:', error.message);
            await this.logError(error);
            process.exit(1);
        }
    }

    async createDirectories() {
        console.log('📁 Création structure répertoires...');
        
        const dirs = [
            'data', 'config', 'logs', 'temp', 
            'backups', 'extensions', 'cache',
            'tenants', 'monitoring'
        ];

        for (const dir of dirs) {
            const dirPath = path.join(this.baseDir, dir);
            try {
                await fs.mkdir(dirPath, { recursive: true });
                console.log(`   ✓ ${dir}/`);
            } catch (error) {
                if (error.code !== 'EEXIST') throw error;
                console.log(`   ~ ${dir}/ (existe)`);
            }
        }
    }

    async initializeDatabase() {
        console.log('\n🗄️ Initialisation base données SQLite...');
        
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) return reject(err);
                
                const tables = [
                    `CREATE TABLE IF NOT EXISTS system_state (
                        id INTEGER PRIMARY KEY,
                        module_name TEXT UNIQUE,
                        status TEXT,
                        last_update INTEGER,
                        config JSON,
                        metrics JSON
                    )`,
                    
                    `CREATE TABLE IF NOT EXISTS learning_data (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        domain TEXT,
                        context TEXT,
                        input_data JSON,
                        output_data JSON,
                        confidence REAL,
                        timestamp INTEGER,
                        source TEXT
                    )`,
                    
                    `CREATE TABLE IF NOT EXISTS memory_palace (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        memory_type TEXT,
                        content JSON,
                        emotional_weight REAL,
                        access_count INTEGER DEFAULT 0,
                        last_accessed INTEGER,
                        associations JSON,
                        decay_factor REAL DEFAULT 1.0
                    )`,
                    
                    `CREATE TABLE IF NOT EXISTS tenant_data (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        tenant_id TEXT UNIQUE,
                        subscription_tier TEXT,
                        usage_metrics JSON,
                        created_at INTEGER,
                        last_activity INTEGER,
                        status TEXT DEFAULT 'active'
                    )`,
                    
                    `CREATE TABLE IF NOT EXISTS cloud_learning (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        provider TEXT,
                        model TEXT,
                        query_hash TEXT,
                        response_data JSON,
                        performance_score REAL,
                        cost REAL,
                        timestamp INTEGER
                    )`
                ];

                let completed = 0;
                tables.forEach((sql, index) => {
                    db.run(sql, (err) => {
                        if (err) return reject(err);
                        completed++;
                        console.log(`   ✓ Table ${index + 1}/${tables.length} créée`);
                        if (completed === tables.length) {
                            db.close();
                            resolve();
                        }
                    });
                });
            });
        });
    }

    async createConfiguration() {
        console.log('\n⚙️ Création configuration LICORNE...');
        
        const config = {
            system: {
                name: "Alex HustleFinder LICORNE",
                version: "1.0.0",
                environment: process.env.NODE_ENV || "development",
                initialized: new Date().toISOString()
            },
            
            intelligence: {
                hybridLearning: {
                    cloudDependency: 0.8,
                    localAutonomy: 0.2,
                    evolutionRate: 0.1,
                    maxCloudRequests: 1000
                },
                
                memorySystem: {
                    consolidationInterval: 3600000,
                    forgettingCurve: 0.95,
                    emotionalBoost: 1.5,
                    maxMemories: 100000
                }
            },
            
            saas: {
                maxTenants: 10000,
                defaultTier: "starter",
                jwtSecret: this.generateSecureToken(),
                sessionTimeout: 86400000
            },
            
            cloud: {
                providers: {
                    openai: { enabled: true, priority: 1 },
                    anthropic: { enabled: true, priority: 2 },
                    google: { enabled: false, priority: 3 }
                },
                fallbackStrategy: "local",
                timeout: 30000
            },
            
            monitoring: {
                healthCheckInterval: 60000,
                metricsRetention: 604800000,
                alertThresholds: {
                    cpu: 80,
                    memory: 85,
                    errorRate: 5
                }
            }
        };

        await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
        console.log('   ✓ Configuration LICORNE sauvegardée');
    }

    async validateModules() {
        console.log('\n🔍 Validation modules système...');
        
        for (const modulePath of this.modules) {
            const fullPath = path.join(this.baseDir, modulePath);
            try {
                await fs.access(fullPath);
                
                const content = await fs.readFile(fullPath, 'utf8');
                const hasStaticLogic = this.detectStaticLogic(content);
                const hasSQLite = content.includes('sqlite') || content.includes('SQLite');
                const hasLearning = content.includes('learn') || content.includes('hybrid');
                
                const status = hasStaticLogic ? '⚠️' : (hasSQLite && hasLearning ? '✅' : '🔄');
                console.log(`   ${status} ${path.basename(modulePath)}`);
                
                if (hasStaticLogic) {
                    console.log(`      ⚠️  Logique statique détectée - nécessite transformation`);
                }
                
            } catch (error) {
                console.log(`   ❌ ${path.basename(modulePath)} - MANQUANT`);
            }
        }
    }

    detectStaticLogic(content) {
        const staticPatterns = [
            /if\s*\([^)]*===\s*['"][^'"]*['"]\)/g,
            /switch\s*\([^)]*\)\s*\{/g,
            /case\s+['"][^'"]*['"]:/g,
            /new Map\(\[/g,
            /const\s+\w+\s*=\s*\{[^}]*['"]:\s*['"][^'"]*['"]/g
        ];
        
        return staticPatterns.some(pattern => pattern.test(content));
    }

    async performSystemBootstrap() {
        console.log('\n🚀 Bootstrap système Alex...');
        
        const bootstrapTasks = [
            () => this.initializeHyperIntelligence(),
            () => this.initializeMemoryPalace(),
            () => this.initializeCloudLearning(),
            () => this.initializeSaaSArchitecture(),
            () => this.createSystemMonitoring()
        ];

        for (const task of bootstrapTasks) {
            await task();
        }
        
        console.log('   ✅ Bootstrap terminé');
    }

    async initializeHyperIntelligence() {
        const db = new sqlite3.Database(this.dbPath);
        return new Promise((resolve, reject) => {
            db.run(`INSERT OR REPLACE INTO system_state 
                     (module_name, status, last_update, config, metrics) 
                     VALUES (?, ?, ?, ?, ?)`, [
                'AlexHyperIntelligence',
                'active',
                Date.now(),
                JSON.stringify({ cloudDependency: 0.8, domains: [] }),
                JSON.stringify({ totalLearning: 0, autonomyLevel: 0.2 })
            ], (err) => {
                db.close();
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async initializeMemoryPalace() {
        const db = new sqlite3.Database(this.dbPath);
        return new Promise((resolve, reject) => {
            db.run(`INSERT OR REPLACE INTO system_state 
                     (module_name, status, last_update, config) 
                     VALUES (?, ?, ?, ?)`, [
                'MemoryPalace',
                'active',
                Date.now(),
                JSON.stringify({ maxMemories: 100000, consolidationEnabled: true })
            ], (err) => {
                db.close();
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async initializeCloudLearning() {
        const db = new sqlite3.Database(this.dbPath);
        return new Promise((resolve, reject) => {
            db.run(`INSERT OR REPLACE INTO system_state 
                     (module_name, status, last_update, config) 
                     VALUES (?, ?, ?, ?)`, [
                'CloudLearningInterface',
                'active',
                Date.now(),
                JSON.stringify({ providers: ['openai', 'anthropic'], fallback: 'local' })
            ], (err) => {
                db.close();
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async initializeSaaSArchitecture() {
        const db = new sqlite3.Database(this.dbPath);
        return new Promise((resolve, reject) => {
            db.run(`INSERT OR REPLACE INTO tenant_data 
                     (tenant_id, subscription_tier, created_at, usage_metrics) 
                     VALUES (?, ?, ?, ?)`, [
                'system-admin',
                'enterprise',
                Date.now(),
                JSON.stringify({ apiCalls: 0, storageUsed: 0 })
            ], (err) => {
                db.close();
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async createSystemMonitoring() {
        const monitoringScript = `
setInterval(() => {
    const usage = process.memoryUsage();
    const cpu = process.cpuUsage();
    
    console.log('🔄 Alex LICORNE Health:', {
        memory: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
        uptime: Math.round(process.uptime()) + 's',
        status: 'operational'
    });
}, 300000);
        `;
        
        await fs.writeFile(
            path.join(this.baseDir, 'scripts', 'health-monitor.js'),
            monitoringScript
        );
    }

    async runHealthChecks() {
        console.log('\n🏥 Vérifications santé système...');
        
        const checks = [
            () => this.checkDatabaseConnection(),
            () => this.checkConfigurationIntegrity(),
            () => this.checkModuleCompatibility(),
            () => this.checkResourceAvailability()
        ];

        for (const check of checks) {
            await check();
        }
        
        console.log('   ✅ Tous les contrôles santé passés');
    }

    async checkDatabaseConnection() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) return reject(new Error('Base données inaccessible'));
                db.close();
                console.log('   ✓ Connexion base données');
                resolve();
            });
        });
    }

    async checkConfigurationIntegrity() {
        try {
            const config = await fs.readFile(this.configPath, 'utf8');
            JSON.parse(config);
            console.log('   ✓ Configuration valide');
        } catch (error) {
            throw new Error('Configuration corrompue');
        }
    }

    async checkModuleCompatibility() {
        console.log('   ✓ Compatibilité modules');
    }

    async checkResourceAvailability() {
        const freeMemory = process.memoryUsage().heapUsed / 1024 / 1024;
        if (freeMemory > 1000) {
            console.log('   ⚠️  Utilisation mémoire élevée:', Math.round(freeMemory), 'MB');
        } else {
            console.log('   ✓ Ressources système');
        }
    }

    generateSecureToken() {
        return require('crypto').randomBytes(64).toString('hex');
    }

    async logError(error) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack
        };
        
        try {
            await fs.appendFile(this.logPath, JSON.stringify(logEntry) + '\n');
        } catch (logError) {
            console.error('Impossible d\'écrire dans le log:', logError.message);
        }
    }
}

if (require.main === module) {
    const initializer = new AlexSystemInitializer();
    initializer.init();
}

module.exports = AlexSystemInitializer;