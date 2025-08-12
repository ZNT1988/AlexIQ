const EventEmitter = require('events');
const config = require('../../config/alex-licorne-config');
const sqlite3 = require('sqlite3').verbose();

class LicorneOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.config = config;
        this.db = null;
        this.modules = new Map();
        this.taskQueue = [];
        this.activeTasks = new Map();
        this.moduleRegistry = null;
        this.systemMonitor = null;
        this.tenantManager = null;
        this.isInitialized = false;
        this.startTime = Date.now();
        
        this.stats = {
            tasksProcessed: 0,
            tasksSucceeded: 0,
            tasksFailed: 0,
            averageResponseTime: 0,
            moduleLoadTime: {}
        };

        this.initializeDatabase();
        this.setupEventHandlers();
    }

    initializeDatabase() {
        const dbPath = this.config.get('database.path');
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Orchestrator DB connection failed:', err.message);
                return;
            }
            console.log('✅ Orchestrator connecté à la base');
            this.createOrchestratorTables();
        });
    }

    createOrchestratorTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS orchestrator_tasks (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                tenant_id TEXT NOT NULL,
                task_type TEXT NOT NULL,
                input_data TEXT NOT NULL,
                output_data TEXT,
                status TEXT DEFAULT 'pending',
                processing_time INTEGER,
                modules_used TEXT,
                error_message TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS module_performance (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                module_name TEXT NOT NULL,
                tenant_id TEXT NOT NULL,
                execution_time INTEGER NOT NULL,
                success BOOLEAN NOT NULL,
                input_size INTEGER,
                output_size INTEGER,
                memory_used INTEGER
            )`,
            `CREATE TABLE IF NOT EXISTS orchestrator_metrics (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                metric_name TEXT NOT NULL,
                metric_value REAL NOT NULL,
                metadata TEXT
            )`
        ];

        tables.forEach(sql => {
            this.db.run(sql, (err) => {
                if (err) console.error('❌ Orchestrator table error:', err.message);
            });
        });
    }

    setupEventHandlers() {
        this.on('taskCompleted', this.handleTaskCompleted.bind(this));
        this.on('taskFailed', this.handleTaskFailed.bind(this));
        this.on('moduleLoaded', this.handleModuleLoaded.bind(this));
        this.on('systemAlert', this.handleSystemAlert.bind(this));
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🚀 Initialisation LicorneOrchestrator...');
            
            await this.loadModuleRegistry();
            await this.initializeModules();
            await this.setupTaskProcessing();
            
            this.isInitialized = true;
            console.log('✅ LicorneOrchestrator initialisé avec succès');
            
            this.emit('orchestratorReady');
        } catch (error) {
            console.error('❌ Erreur initialisation orchestrateur:', error.message);
            throw error;
        }
    }

    async loadModuleRegistry() {
        try {
            const UniversalModuleRegistry = require('./UniversalModuleRegistry');
            this.moduleRegistry = new UniversalModuleRegistry();
            await this.moduleRegistry.initialize();
            console.log('✅ Module Registry chargé');
        } catch (error) {
            console.error('❌ Erreur chargement Module Registry:', error.message);
            throw error;
        }
    }

    async initializeModules() {
        const moduleConfig = this.config.get('orchestrator.modules');
        
        for (const [category, settings] of Object.entries(moduleConfig)) {
            if (settings.enabled) {
                await this.loadModuleCategory(category, settings);
            }
        }
        
        console.log(`✅ ${this.modules.size} modules chargés`);
    }

    async loadModuleCategory(category, settings) {
        const startTime = Date.now();
        
        try {
            if (!this.moduleRegistry) {
                throw new Error('Module Registry non initialisé');
            }

            const modules = await this.moduleRegistry.getModulesByCategory(category);
            
            for (const moduleInfo of modules) {
                const module = await this.loadModule(moduleInfo, settings);
                if (module) {
                    this.modules.set(moduleInfo.name, {
                        instance: module,
                        category,
                        priority: settings.priority,
                        timeout: settings.timeout,
                        stats: {
                            calls: 0,
                            successes: 0,
                            failures: 0,
                            avgTime: 0
                        }
                    });
                }
            }

            const loadTime = Date.now() - startTime;
            this.stats.moduleLoadTime[category] = loadTime;
            
            console.log(`✅ Catégorie ${category} chargée en ${loadTime}ms`);
        } catch (error) {
            console.error(`❌ Erreur chargement catégorie ${category}:`, error.message);
        }
    }

    async loadModule(moduleInfo, settings) {
        try {
            const ModuleClass = require(moduleInfo.path);
            const instance = new ModuleClass();
            
            if (instance.initialize && typeof instance.initialize === 'function') {
                await instance.initialize();
            }
            
            this.emit('moduleLoaded', {
                name: moduleInfo.name,
                category: moduleInfo.category,
                path: moduleInfo.path
            });
            
            return instance;
        } catch (error) {
            console.error(`❌ Erreur chargement module ${moduleInfo.name}:`, error.message);
            return null;
        }
    }

    setupTaskProcessing() {
        setInterval(() => {
            this.processTaskQueue();
        }, 100);
        
        console.log('✅ Traitement des tâches configuré');
    }

    async processRequest(input, context = {}) {
        const taskId = this.generateTaskId();
        const task = {
            id: taskId,
            input,
            context,
            timestamp: Date.now(),
            tenantId: context.tenantId || 'default',
            status: 'pending'
        };

        try {
            this.recordTask(task);
            const result = await this.executeTask(task);
            
            task.status = 'completed';
            task.result = result;
            task.completedAt = Date.now();
            
            this.updateTaskRecord(task);
            this.emit('taskCompleted', task);
            
            return result;
        } catch (error) {
            task.status = 'failed';
            task.error = error.message;
            task.completedAt = Date.now();
            
            this.updateTaskRecord(task);
            this.emit('taskFailed', task, error);
            
            throw error;
        }
    }

    async executeTask(task) {
        const startTime = Date.now();
        const results = {};
        const modulesUsed = [];

        try {
            this.activeTasks.set(task.id, task);

            const relevantModules = this.selectRelevantModules(task.input, task.context);
            
            for (const [moduleName, moduleData] of relevantModules) {
                const moduleStartTime = Date.now();
                
                try {
                    const result = await this.executeModule(
                        moduleName, 
                        moduleData, 
                        task.input, 
                        task.context
                    );
                    
                    results[moduleName] = result;
                    modulesUsed.push(moduleName);
                    
                    const moduleTime = Date.now() - moduleStartTime;
                    this.updateModuleStats(moduleName, true, moduleTime);
                    
                } catch (moduleError) {
                    console.error(`❌ Erreur module ${moduleName}:`, moduleError.message);
                    this.updateModuleStats(moduleName, false, Date.now() - moduleStartTime);
                    
                    results[moduleName] = {
                        error: moduleError.message,
                        status: 'failed'
                    };
                }
            }

            const processingTime = Date.now() - startTime;
            this.updateStats(processingTime, true);

            return {
                response: this.synthesizeResults(results),
                modules: modulesUsed,
                processingTime,
                timestamp: new Date().toISOString(),
                taskId: task.id
            };

        } finally {
            this.activeTasks.delete(task.id);
        }
    }

    selectRelevantModules(input, context) {
        const relevantModules = new Map();
        const inputLower = input.toLowerCase();

        for (const [moduleName, moduleData] of this.modules) {
            let relevanceScore = 0;
            
            if (moduleData.category === 'core') {
                relevanceScore += 0.8;
            }
            
            if (moduleData.category === 'consciousness' && this.isConsciousnessRequest(input)) {
                relevanceScore += 0.9;
            }
            
            if (moduleData.category === 'intelligence' && this.isIntelligenceRequest(input)) {
                relevanceScore += 0.7;
            }
            
            if (moduleData.category === 'creativity' && this.isCreativityRequest(input)) {
                relevanceScore += 0.6;
            }

            if (relevanceScore > 0.5) {
                relevantModules.set(moduleName, moduleData);
            }
        }

        const sortedModules = new Map([...relevantModules.entries()]
            .sort((a, b) => this.getPriority(b[1]) - this.getPriority(a[1]))
            .slice(0, 5)
        );

        return sortedModules;
    }

    isConsciousnessRequest(input) {
        const keywords = ['conscience', 'awareness', 'réflexion', 'méditation', 'introspection'];
        return keywords.some(keyword => input.toLowerCase().includes(keyword));
    }

    isIntelligenceRequest(input) {
        const keywords = ['analyse', 'résoudre', 'problème', 'décision', 'stratégie'];
        return keywords.some(keyword => input.toLowerCase().includes(keyword));
    }

    isCreativityRequest(input) {
        const keywords = ['créer', 'inventer', 'imaginer', 'design', 'art', 'innovation'];
        return keywords.some(keyword => input.toLowerCase().includes(keyword));
    }

    getPriority(moduleData) {
        const priorities = { critical: 100, high: 80, medium: 60, low: 40 };
        return priorities[moduleData.priority] || 50;
    }

    async executeModule(moduleName, moduleData, input, context) {
        const timeout = moduleData.timeout || 10000;
        
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Module ${moduleName} timeout`));
            }, timeout);

            try {
                const instance = moduleData.instance;
                
                if (instance.process && typeof instance.process === 'function') {
                    const result = instance.process(input, context);
                    
                    if (result && typeof result.then === 'function') {
                        result.then(resolve).catch(reject).finally(() => clearTimeout(timer));
                    } else {
                        clearTimeout(timer);
                        resolve(result);
                    }
                } else {
                    clearTimeout(timer);
                    resolve({
                        message: `Module ${moduleName} traité`,
                        status: 'processed'
                    });
                }
            } catch (error) {
                clearTimeout(timer);
                reject(error);
            }
        });
    }

    synthesizeResults(results) {
        const successful = Object.entries(results)
            .filter(([, result]) => !result.error)
            .map(([name, result]) => ({ module: name, result }));

        const failed = Object.entries(results)
            .filter(([, result]) => result.error)
            .map(([name, result]) => ({ module: name, error: result.error }));

        if (successful.length === 0) {
            return "Aucun module n'a pu traiter la demande avec succès.";
        }

        const mainResult = successful[0]?.result?.message || 
                          successful[0]?.result?.response ||
                          "Traitement effectué avec succès";

        return {
            main: mainResult,
            details: {
                successful: successful.length,
                failed: failed.length,
                results: successful.slice(0, 3)
            }
        };
    }

    updateModuleStats(moduleName, success, executionTime) {
        const moduleData = this.modules.get(moduleName);
        if (moduleData) {
            const stats = moduleData.stats;
            stats.calls++;
            
            if (success) {
                stats.successes++;
            } else {
                stats.failures++;
            }
            
            stats.avgTime = (stats.avgTime * (stats.calls - 1) + executionTime) / stats.calls;
            
            this.recordModulePerformance(moduleName, executionTime, success);
        }
    }

    updateStats(processingTime, success) {
        this.stats.tasksProcessed++;
        
        if (success) {
            this.stats.tasksSucceeded++;
        } else {
            this.stats.tasksFailed++;
        }
        
        this.stats.averageResponseTime = 
            (this.stats.averageResponseTime * (this.stats.tasksProcessed - 1) + processingTime) / 
            this.stats.tasksProcessed;
    }

    recordTask(task) {
        if (!this.db) return;
        
        const sql = `
            INSERT INTO orchestrator_tasks 
            (id, tenant_id, task_type, input_data, status)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        this.db.run(sql, [
            task.id,
            task.tenantId,
            'process_request',
            JSON.stringify(task.input),
            task.status
        ]);
    }

    updateTaskRecord(task) {
        if (!this.db) return;
        
        const sql = `
            UPDATE orchestrator_tasks 
            SET status = ?, output_data = ?, processing_time = ?, error_message = ?
            WHERE id = ?
        `;
        
        this.db.run(sql, [
            task.status,
            task.result ? JSON.stringify(task.result) : null,
            task.completedAt - task.timestamp,
            task.error || null,
            task.id
        ]);
    }

    recordModulePerformance(moduleName, executionTime, success) {
        if (!this.db) return;
        
        const sql = `
            INSERT INTO module_performance 
            (module_name, tenant_id, execution_time, success)
            VALUES (?, ?, ?, ?)
        `;
        
        this.db.run(sql, [moduleName, 'system', executionTime, success ? 1 : 0]);
    }

    processTaskQueue() {
        if (this.taskQueue.length === 0) return;
        
        const maxConcurrent = this.config.get('orchestrator.maxConcurrentTasks');
        const currentTasks = this.activeTasks.size;
        
        if (currentTasks >= maxConcurrent) return;
        
        const task = this.taskQueue.shift();
        if (task) {
            this.executeTask(task).catch(console.error);
        }
    }

    handleTaskCompleted(task) {
        console.log(`✅ Tâche ${task.id} terminée en ${task.completedAt - task.timestamp}ms`);
    }

    handleTaskFailed(task, error) {
        console.error(`❌ Tâche ${task.id} échouée:`, error.message);
    }

    handleModuleLoaded(moduleInfo) {
        console.log(`📦 Module chargé: ${moduleInfo.name} (${moduleInfo.category})`);
    }

    handleSystemAlert(alert) {
        console.warn(`⚠️ Alerte système:`, alert);
    }

    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    getStats() {
        return {
            ...this.stats,
            uptime: Date.now() - this.startTime,
            modulesLoaded: this.modules.size,
            activeTasks: this.activeTasks.size,
            queuedTasks: this.taskQueue.length,
            isInitialized: this.isInitialized
        };
    }

    getModuleStats() {
        const moduleStats = {};
        
        for (const [name, data] of this.modules) {
            moduleStats[name] = {
                ...data.stats,
                category: data.category,
                priority: data.priority
            };
        }
        
        return moduleStats;
    }

    setSystemMonitor(monitor) {
        this.systemMonitor = monitor;
    }

    setTenantManager(manager) {
        this.tenantManager = manager;
    }

    async shutdown() {
        console.log('🔄 Arrêt LicorneOrchestrator...');
        
        for (const [, task] of this.activeTasks) {
            console.log(`⏳ Attente tâche ${task.id}...`);
        }
        
        if (this.db) {
            this.db.close((err) => {
                if (err) console.error('❌ Erreur fermeture DB orchestrateur:', err.message);
                else console.log('✅ Base orchestrateur fermée');
            });
        }
        
        console.log('✅ LicorneOrchestrator arrêté');
    }
}

module.exports = LicorneOrchestrator;