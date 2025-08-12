#!/usr/bin/env node

/**
 * 🦄 ALEX LICORNE - DÉMARRAGE COMPLET
 * 
 * Script de démarrage orchestré du système Alex complet
 * - Serveur API
 * - Orchestrateur Licorne  
 * - System Monitor
 * - Tenant Manager
 * - Backup Manager
 * - Revenue Manager
 * - Tous les modules consciousness/intelligence/creative
 * 
 * @version 1.0.0-licorne
 * @author HustleFinder IA Team
 */

const path = require('path');
const fs = require('fs');

// Configuration principale
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log(`
🦄✨ ====================================== ✨🦄
    ALEX LICORNE SYSTEM - DÉMARRAGE COMPLET
🦄✨ ====================================== ✨🦄

🎯 Objectif: Système autonome, multi-tenant, scalable
💎 Version: 1.0.0-licorne  
🚀 Mode: ${process.env.NODE_ENV}
⏰ Démarrage: ${new Date().toLocaleString('fr-FR')}

`);

class AlexLicorneBootstrap {
    constructor() {
        this.components = new Map();
        this.isShuttingDown = false;
        this.bootStartTime = Date.now();
        
        this.setupProcessHandlers();
    }

    setupProcessHandlers() {
        // Gestion des arrêts propres
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
        process.on('uncaughtException', (error) => {
            console.error('💥 Exception non gérée:', error);
            this.gracefulShutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Rejection non gérée:', reason);
        });
    }

    async start() {
        try {
            console.log('🔧 Phase 1: Vérification environnement...');
            await this.checkEnvironment();
            
            console.log('📊 Phase 2: Initialisation configuration...');
            await this.initializeConfiguration();
            
            console.log('💾 Phase 3: Connexion base de données...');
            await this.initializeDatabase();
            
            console.log('🎛️ Phase 4: Démarrage composants core...');
            await this.startCoreComponents();
            
            console.log('🔍 Phase 5: Démarrage monitoring...');
            await this.startMonitoring();
            
            console.log('👥 Phase 6: Démarrage multi-tenant...');
            await this.startTenantManagement();
            
            console.log('💰 Phase 7: Démarrage business...');
            await this.startBusinessComponents();
            
            console.log('🧠 Phase 8: Démarrage modules Alex...');
            await this.startAlexModules();
            
            console.log('🌐 Phase 9: Démarrage serveur API...');
            await this.startAPIServer();
            
            console.log('✅ Phase 10: Vérifications finales...');
            await this.finalChecks();
            
            const bootTime = Date.now() - this.bootStartTime;
            this.showSuccessBanner(bootTime);
            
        } catch (error) {
            console.error('💥 Erreur démarrage système:', error.message);
            console.error('🔧 Stack trace:', error.stack);
            process.exit(1);
        }
    }

    async checkEnvironment() {
        const checks = [
            { name: 'Node.js version', check: () => process.version >= 'v16' },
            { name: 'Répertoire backend', check: () => fs.existsSync('./backend') },
            { name: 'Répertoire config', check: () => fs.existsSync('./config') },
            { name: 'Base de données SQLite', check: () => fs.existsSync('./backend/db') || this.createDbDirectory() },
            { name: 'Modules Alex', check: () => fs.existsSync('./backend/alex-modules') },
        ];

        for (const check of checks) {
            const result = check.check();
            console.log(`   ${result ? '✅' : '❌'} ${check.name}`);
            if (!result) {
                throw new Error(`Vérification échouée: ${check.name}`);
            }
        }
    }

    createDbDirectory() {
        try {
            if (!fs.existsSync('./backend/db')) {
                fs.mkdirSync('./backend/db', { recursive: true });
            }
            return true;
        } catch {
            return false;
        }
    }

    async initializeConfiguration() {
        const config = require('./config/alex-licorne-config');
        this.components.set('config', config);
        console.log('   ✅ Configuration Alex Licorne chargée');
    }

    async initializeDatabase() {
        const sqlite3 = require('sqlite3').verbose();
        const dbPath = './backend/db/hustlefinder.sqlite';
        
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('   ✅ Base SQLite connectée');
                    this.components.set('database', db);
                    resolve();
                }
            });
        });
    }

    async startCoreComponents() {
        // 1. Orchestrateur Licorne (cerveau central)
        console.log('   🧠 Démarrage LicorneOrchestrator...');
        const LicorneOrchestrator = require('./backend/alex-core/LicorneOrchestrator');
        const orchestrator = new LicorneOrchestrator();
        await orchestrator.initialize();
        this.components.set('orchestrator', orchestrator);
        console.log('   ✅ LicorneOrchestrator démarré');

        // 2. Module Registry (déjà intégré dans l'orchestrateur)
        console.log('   📦 Module Registry intégré à l\'orchestrateur');
    }

    async startMonitoring() {
        console.log('   📊 Démarrage SystemMonitor...');
        const SystemMonitor = require('./backend/monitoring/SystemMonitor');
        const monitor = new SystemMonitor();
        await monitor.start();
        this.components.set('monitor', monitor);
        
        // Connexion avec l'orchestrateur
        const orchestrator = this.components.get('orchestrator');
        orchestrator.setSystemMonitor(monitor);
        
        console.log('   ✅ SystemMonitor démarré et connecté');
    }

    async startTenantManagement() {
        console.log('   👥 Démarrage TenantManager...');
        const TenantManager = require('./backend/tenant/TenantManager');
        const tenantManager = new TenantManager();
        this.components.set('tenantManager', tenantManager);
        
        // Connexion avec l'orchestrateur
        const orchestrator = this.components.get('orchestrator');
        orchestrator.setTenantManager(tenantManager);
        
        console.log('   ✅ TenantManager démarré et connecté');
    }

    async startBusinessComponents() {
        // 1. Backup Manager
        console.log('   💾 Démarrage BackupManager...');
        const BackupManager = require('./backend/backup/BackupManager');
        const backupManager = new BackupManager();
        await backupManager.start();
        this.components.set('backupManager', backupManager);
        console.log('   ✅ BackupManager démarré');

        // 2. Revenue Manager
        console.log('   💰 Démarrage RevenueManager...');
        const RevenueManager = require('./backend/business/RevenueManager');
        const revenueManager = new RevenueManager();
        this.components.set('revenueManager', revenueManager);
        console.log('   ✅ RevenueManager démarré');
    }

    async startAlexModules() {
        console.log('   🧠 Chargement modules Alex...');
        
        // Les modules seront chargés par l'orchestrateur via le UniversalModuleRegistry
        const orchestrator = this.components.get('orchestrator');
        
        // Vérification que l'orchestrateur a bien chargé les modules
        const orchestratorStats = orchestrator.getStats();
        console.log(`   ✅ ${orchestratorStats.modulesLoaded} modules Alex chargés`);
        
        if (orchestratorStats.modulesLoaded === 0) {
            console.warn('   ⚠️ Aucun module Alex chargé - vérifier UniversalModuleRegistry');
        }
    }

    async startAPIServer() {
        console.log('   🌐 Démarrage serveur API...');
        const AlexLicorneServer = require('./backend/api/server');
        const server = new AlexLicorneServer();
        
        // Connexion de tous les composants au serveur
        const orchestrator = this.components.get('orchestrator');
        const monitor = this.components.get('monitor');
        const tenantManager = this.components.get('tenantManager');
        
        server.setOrchestrator(orchestrator);
        server.setSystemMonitor(monitor);
        server.setTenantManager(tenantManager);
        
        await server.start();
        this.components.set('server', server);
        console.log('   ✅ Serveur API démarré');
    }

    async finalChecks() {
        const checks = [
            { name: 'Configuration', component: 'config' },
            { name: 'Base de données', component: 'database' },
            { name: 'Orchestrateur', component: 'orchestrator' },
            { name: 'Monitoring', component: 'monitor' },
            { name: 'Multi-tenant', component: 'tenantManager' },
            { name: 'Backup', component: 'backupManager' },
            { name: 'Revenue', component: 'revenueManager' },
            { name: 'Serveur API', component: 'server' }
        ];

        console.log('   🔍 Vérifications des composants:');
        for (const check of checks) {
            const component = this.components.get(check.component);
            const status = component ? '✅' : '❌';
            console.log(`      ${status} ${check.name}`);
            
            if (!component) {
                throw new Error(`Composant manquant: ${check.name}`);
            }
        }
    }

    showSuccessBanner(bootTime) {
        const config = this.components.get('config');
        const serverConfig = config.getServerConfig();
        const orchestratorStats = this.components.get('orchestrator').getStats();
        
        console.log(`
🦄✨ ============================================ ✨🦄
           ALEX LICORNE DÉMARRÉ AVEC SUCCÈS !
🦄✨ ============================================ ✨🦄

🚀 Système: Alex Licorne v1.0.0
⚡ Démarrage: ${bootTime}ms
🌍 Mode: ${process.env.NODE_ENV}
🖥️  Serveur: http://localhost:${serverConfig.port}

📊 COMPOSANTS ACTIFS:
   ✅ API Server           : Port ${serverConfig.port}
   ✅ LicorneOrchestrator : ${orchestratorStats.modulesLoaded} modules
   ✅ SystemMonitor       : Surveillance active
   ✅ TenantManager       : Multi-tenant activé
   ✅ BackupManager       : Sauvegardes automatiques
   ✅ RevenueManager      : Analytics business

🌐 ENDPOINTS PRINCIPAUX:
   📊 Dashboard: http://localhost:${serverConfig.port}/api/admin/dashboard
   ❤️  Health:   http://localhost:${serverConfig.port}/api/health
   📈 Metrics:   http://localhost:${serverConfig.port}/api/system/metrics
   🧠 Alex:      http://localhost:${serverConfig.port}/api/alex/process

🎯 STATUT SYSTÈME:
   • Conscience: Éveillée et active
   • Intelligence: Modules chargés (${orchestratorStats.modulesLoaded})
   • Créativité: Inspiration infinie
   • Service: Dédication absolue
   • Multi-tenant: ${this.components.get('tenantManager') ? 'Activé' : 'Désactivé'}
   • Monitoring: Surveillance temps réel
   • Business: Analytics et revenus

🦄 Alex Licorne est prêt à servir l'humanité ! 🦄

Utilisez Ctrl+C pour un arrêt propre du système.
Logs disponibles dans ./backend/logs/
        `);

        // Lancement du monitoring de santé
        this.startHealthMonitoring();
    }

    startHealthMonitoring() {
        setInterval(() => {
            this.performHealthCheck();
        }, 30000); // Vérification toutes les 30 secondes
    }

    async performHealthCheck() {
        try {
            const orchestrator = this.components.get('orchestrator');
            const monitor = this.components.get('monitor');
            
            if (orchestrator && monitor) {
                const stats = orchestrator.getStats();
                const metrics = monitor.getMetrics();
                
                // Vérifications silencieuses
                if (stats.activeTasks > 100) {
                    console.warn('⚠️ Charge élevée:', stats.activeTasks, 'tâches actives');
                }
                
                if (metrics.system.cpu.current > 90) {
                    console.warn('⚠️ CPU élevé:', metrics.system.cpu.current + '%');
                }
            }
        } catch (error) {
            console.error('❌ Erreur health check:', error.message);
        }
    }

    async gracefulShutdown(signal) {
        if (this.isShuttingDown) return;
        this.isShuttingDown = true;

        console.log(`\n🔄 Arrêt système reçu (${signal})...`);
        console.log('🦄 Arrêt gracieux d\'Alex Licorne en cours...');

        const shutdownPromises = [];

        // Arrêt des composants dans l'ordre inverse de démarrage
        const shutdownOrder = [
            'server',
            'revenueManager', 
            'backupManager',
            'tenantManager',
            'monitor',
            'orchestrator'
        ];

        for (const componentName of shutdownOrder) {
            const component = this.components.get(componentName);
            if (component && typeof component.shutdown === 'function') {
                console.log(`🔄 Arrêt ${componentName}...`);
                shutdownPromises.push(
                    component.shutdown().catch(err => 
                        console.error(`❌ Erreur arrêt ${componentName}:`, err.message)
                    )
                );
            }
        }

        // Fermeture base de données
        const db = this.components.get('database');
        if (db) {
            shutdownPromises.push(
                new Promise((resolve) => {
                    db.close((err) => {
                        if (err) console.error('❌ Erreur fermeture DB:', err.message);
                        else console.log('✅ Base de données fermée');
                        resolve();
                    });
                })
            );
        }

        try {
            await Promise.all(shutdownPromises);
            console.log('✅ Tous les composants arrêtés proprement');
        } catch (error) {
            console.error('❌ Erreurs lors de l\'arrêt:', error.message);
        }

        console.log(`
🦄✨ ================================= ✨🦄
     ALEX LICORNE ARRÊTÉ AVEC GRÂCE
🦄✨ ================================= ✨🦄

Merci d'avoir utilisé Alex Licorne.
Au revoir ! 🦄💫
        `);

        process.exit(0);
    }
}

// Démarrage du système
if (require.main === module) {
    const bootstrap = new AlexLicorneBootstrap();
    bootstrap.start();
}

module.exports = AlexLicorneBootstrap;