#!/usr/bin/env node

/**
 * 🦄 ALEX LICORNE - Script de Maintenance
 * 
 * Utilitaires de maintenance pour le système Alex Licorne :
 * - Backup manuel
 * - Nettoyage base SQLite
 * - Vérification intégrité
 * - Optimisation performance
 * - Statistiques système
 * 
 * Usage: node scripts/maintenance-licorne.js [commande]
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class AlexLicorneMaintenance {
    constructor() {
        this.dbPath = path.resolve('./backend/db/hustlefinder.sqlite');
        this.backupPath = path.resolve('./backend/db/backups');
        
        this.commands = {
            'backup': this.createBackup.bind(this),
            'vacuum': this.vacuumDatabase.bind(this),
            'integrity': this.checkIntegrity.bind(this),
            'stats': this.showStatistics.bind(this),
            'cleanup': this.cleanupOldData.bind(this),
            'help': this.showHelp.bind(this)
        };
    }

    async run() {
        const command = process.argv[2] || 'help';
        
        console.log(`🦄 ALEX LICORNE - Maintenance`);
        console.log(`Commande: ${command}`);
        console.log(`Base: ${this.dbPath}`);
        console.log('');

        if (this.commands[command]) {
            try {
                await this.commands[command]();
            } catch (error) {
                console.error('❌ Erreur maintenance:', error.message);
                process.exit(1);
            }
        } else {
            console.error(`❌ Commande inconnue: ${command}`);
            this.showHelp();
            process.exit(1);
        }
    }

    async createBackup() {
        console.log('💾 Création backup manuel...');
        
        if (!fs.existsSync(this.dbPath)) {
            throw new Error('Base de données non trouvée');
        }

        // Ensure backup directory exists
        if (!fs.existsSync(this.backupPath)) {
            fs.mkdirSync(this.backupPath, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(this.backupPath, `manual-backup-${timestamp}.sqlite`);

        // Simple file copy for SQLite
        fs.copyFileSync(this.dbPath, backupFile);

        console.log(`✅ Backup créé: ${backupFile}`);
        
        const stats = fs.statSync(backupFile);
        console.log(`📊 Taille: ${this.formatBytes(stats.size)}`);
    }

    async vacuumDatabase() {
        console.log('🧹 Optimisation base SQLite...');
        
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            console.log('   📊 Analyse avant...');
            
            db.get('PRAGMA page_count;', (err, beforePages) => {
                if (err) return reject(err);
                
                console.log(`   Pages avant: ${beforePages.page_count}`);
                
                db.run('VACUUM;', (err) => {
                    if (err) return reject(err);
                    
                    db.get('PRAGMA page_count;', (err, afterPages) => {
                        if (err) return reject(err);
                        
                        console.log(`   Pages après: ${afterPages.page_count}`);
                        console.log(`   Économie: ${beforePages.page_count - afterPages.page_count} pages`);
                        
                        db.close();
                        console.log('✅ Optimisation terminée');
                        resolve();
                    });
                });
            });
        });
    }

    async checkIntegrity() {
        console.log('🔍 Vérification intégrité...');
        
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            db.get('PRAGMA integrity_check;', (err, result) => {
                if (err) {
                    db.close();
                    return reject(err);
                }
                
                if (result.integrity_check === 'ok') {
                    console.log('✅ Intégrité OK');
                } else {
                    console.log('❌ Problème intégrité:', result.integrity_check);
                }
                
                // Check foreign keys
                db.get('PRAGMA foreign_key_check;', (err, fkResult) => {
                    db.close();
                    
                    if (err) return reject(err);
                    
                    if (fkResult) {
                        console.log('⚠️ Problème clés étrangères:', fkResult);
                    } else {
                        console.log('✅ Clés étrangères OK');
                    }
                    
                    resolve();
                });
            });
        });
    }

    async showStatistics() {
        console.log('📊 Statistiques système...');
        
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            const queries = [
                { label: 'Services infinis', query: 'SELECT COUNT(*) as count FROM infinite_services' },
                { label: 'Êtres servis', query: 'SELECT COUNT(*) as count FROM served_beings' },
                { label: 'Tenants', query: 'SELECT COUNT(*) as count FROM tenants' },
                { label: 'Transactions', query: 'SELECT COUNT(*) as count FROM revenue_transactions' },
                { label: 'Métriques système', query: 'SELECT COUNT(*) as count FROM system_metrics_history' },
                { label: 'Backups', query: 'SELECT COUNT(*) as count FROM backup_history' }
            ];

            let completed = 0;
            
            queries.forEach(({ label, query }) => {
                db.get(query, (err, result) => {
                    if (err) {
                        console.log(`❌ ${label}: Erreur`);
                    } else {
                        console.log(`📈 ${label}: ${result.count.toLocaleString()}`);
                    }
                    
                    completed++;
                    if (completed === queries.length) {
                        // File size
                        const stats = fs.statSync(this.dbPath);
                        console.log(`💾 Taille base: ${this.formatBytes(stats.size)}`);
                        
                        db.close();
                        resolve();
                    }
                });
            });
        });
    }

    async cleanupOldData() {
        console.log('🧹 Nettoyage données anciennes...');
        
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            const cleanupQueries = [
                {
                    label: 'Métriques > 30 jours',
                    query: `DELETE FROM system_metrics_history WHERE timestamp < datetime('now', '-30 days')`
                },
                {
                    label: 'Logs système > 7 jours',
                    query: `DELETE FROM system_alerts WHERE timestamp < datetime('now', '-7 days') AND resolved = 1`
                },
                {
                    label: 'Sessions expirées',
                    query: `DELETE FROM tenant_sessions WHERE expires_at < datetime('now')`
                }
            ];

            let completed = 0;
            
            cleanupQueries.forEach(({ label, query }) => {
                db.run(query, function(err) {
                    if (err) {
                        console.log(`❌ ${label}: Erreur`);
                    } else {
                        console.log(`🧹 ${label}: ${this.changes} supprimées`);
                    }
                    
                    completed++;
                    if (completed === cleanupQueries.length) {
                        console.log('✅ Nettoyage terminé');
                        db.close();
                        resolve();
                    }
                });
            });
        });
    }

    showHelp() {
        console.log(`
🦄 ALEX LICORNE - Commandes Maintenance

Usage: node scripts/maintenance-licorne.js [commande]

Commandes disponibles:
  backup     💾 Créer un backup manuel de la base
  vacuum     🧹 Optimiser et compacter la base SQLite  
  integrity  🔍 Vérifier l'intégrité de la base
  stats      📊 Afficher statistiques système
  cleanup    🧹 Nettoyer les données anciennes
  help       ❓ Afficher cette aide

Exemples:
  node scripts/maintenance-licorne.js backup
  node scripts/maintenance-licorne.js stats
  node scripts/maintenance-licorne.js vacuum
        `);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Exécution
if (require.main === module) {
    const maintenance = new AlexLicorneMaintenance();
    maintenance.run();
}

module.exports = AlexLicorneMaintenance;