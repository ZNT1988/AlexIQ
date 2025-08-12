const EventEmitter = require('events');
const crypto = require('crypto');
const config = require('../../config/alex-licorne-config');
const sqlite3 = require('sqlite3').verbose();

class TenantManager extends EventEmitter {
    constructor() {
        super();
        this.config = config;
        this.db = null;
        this.tenants = new Map();
        this.resourceLimits = this.config.get('multiTenant.resourceLimits');
        this.pricingTiers = this.config.get('multiTenant.pricing.tiers');
        this.activeSessions = new Map();
        this.usageTracking = new Map();
        
        this.initializeDatabase();
        this.setupEventHandlers();
        this.startResourceMonitoring();
    }

    initializeDatabase() {
        const dbPath = this.config.get('database.path');
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ TenantManager DB connection failed:', err.message);
                return;
            }
            console.log('✅ TenantManager connecté à la base');
            this.createTenantTables();
        });
    }

    createTenantTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS tenants (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                tier TEXT DEFAULT 'free',
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                settings TEXT DEFAULT '{}',
                metadata TEXT DEFAULT '{}'
            )`,
            `CREATE TABLE IF NOT EXISTS tenant_usage (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                tenant_id TEXT NOT NULL,
                date DATE DEFAULT (date('now')),
                requests_count INTEGER DEFAULT 0,
                storage_used INTEGER DEFAULT 0,
                compute_time INTEGER DEFAULT 0,
                bandwidth_used INTEGER DEFAULT 0,
                features_used TEXT DEFAULT '[]',
                FOREIGN KEY (tenant_id) REFERENCES tenants(id),
                UNIQUE(tenant_id, date)
            )`,
            `CREATE TABLE IF NOT EXISTS tenant_sessions (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                tenant_id TEXT NOT NULL,
                session_token TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                metadata TEXT DEFAULT '{}',
                FOREIGN KEY (tenant_id) REFERENCES tenants(id)
            )`,
            `CREATE TABLE IF NOT EXISTS tenant_quotas (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                tenant_id TEXT NOT NULL,
                resource_type TEXT NOT NULL,
                current_usage INTEGER DEFAULT 0,
                quota_limit INTEGER NOT NULL,
                reset_period TEXT DEFAULT 'monthly',
                last_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tenant_id) REFERENCES tenants(id),
                UNIQUE(tenant_id, resource_type)
            )`,
            `CREATE TABLE IF NOT EXISTS tenant_billing (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                tenant_id TEXT NOT NULL,
                billing_cycle DATETIME NOT NULL,
                tier TEXT NOT NULL,
                base_amount REAL NOT NULL,
                usage_charges REAL DEFAULT 0,
                total_amount REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                paid_at DATETIME,
                metadata TEXT DEFAULT '{}',
                FOREIGN KEY (tenant_id) REFERENCES tenants(id)
            )`
        ];

        tables.forEach(sql => {
            this.db.run(sql, (err) => {
                if (err) console.error('❌ TenantManager table error:', err.message);
            });
        });

        this.createDefaultTenant();
    }

    createDefaultTenant() {
        const defaultTenant = {
            id: 'default',
            name: 'Default Tenant',
            email: 'system@alexlicorne.com',
            tier: 'enterprise',
            status: 'active'
        };

        this.db.run(`
            INSERT OR IGNORE INTO tenants (id, name, email, tier, status)
            VALUES (?, ?, ?, ?, ?)
        `, [defaultTenant.id, defaultTenant.name, defaultTenant.email, defaultTenant.tier, defaultTenant.status]);
    }

    setupEventHandlers() {
        this.on('tenantCreated', this.handleTenantCreated.bind(this));
        this.on('tenantUpdated', this.handleTenantUpdated.bind(this));
        this.on('usageExceeded', this.handleUsageExceeded.bind(this));
        this.on('quotaWarning', this.handleQuotaWarning.bind(this));
    }

    startResourceMonitoring() {
        setInterval(() => {
            this.monitorResourceUsage();
        }, 60000);
    }

    async createTenant(tenantData) {
        const tenantId = this.generateTenantId();
        
        const tenant = {
            id: tenantId,
            name: tenantData.name,
            email: tenantData.email,
            tier: tenantData.tier || 'free',
            status: 'active',
            settings: JSON.stringify(tenantData.settings || {}),
            metadata: JSON.stringify(tenantData.metadata || {})
        };

        try {
            await this.insertTenant(tenant);
            await this.initializeTenantQuotas(tenantId, tenant.tier);
            
            this.tenants.set(tenantId, tenant);
            this.usageTracking.set(tenantId, {
                requests: 0,
                storage: 0,
                computeTime: 0,
                bandwidth: 0
            });

            this.emit('tenantCreated', tenant);
            
            console.log(`✅ Tenant créé: ${tenant.name} (${tenantId})`);
            return tenant;
        } catch (error) {
            console.error(`❌ Erreur création tenant:`, error.message);
            throw error;
        }
    }

    async insertTenant(tenant) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO tenants (id, name, email, tier, status, settings, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                tenant.id, tenant.name, tenant.email, 
                tenant.tier, tenant.status, tenant.settings, tenant.metadata
            ], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    async initializeTenantQuotas(tenantId, tier) {
        const tierLimits = this.pricingTiers[tier];
        if (!tierLimits) return;

        const quotas = [
            {
                resource_type: 'requests',
                quota_limit: tierLimits.requests === -1 ? 999999999 : tierLimits.requests
            },
            {
                resource_type: 'storage',
                quota_limit: tierLimits.storage === -1 ? 999999999999 : tierLimits.storage
            }
        ];

        for (const quota of quotas) {
            await this.setTenantQuota(tenantId, quota.resource_type, quota.quota_limit);
        }
    }

    async setTenantQuota(tenantId, resourceType, limit) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO tenant_quotas 
                (tenant_id, resource_type, quota_limit)
                VALUES (?, ?, ?)
            `;
            
            this.db.run(sql, [tenantId, resourceType, limit], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    async getTenant(tenantId) {
        if (this.tenants.has(tenantId)) {
            return this.tenants.get(tenantId);
        }

        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM tenants WHERE id = ?';
            
            this.db.get(sql, [tenantId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    const tenant = {
                        ...row,
                        settings: JSON.parse(row.settings || '{}'),
                        metadata: JSON.parse(row.metadata || '{}')
                    };
                    this.tenants.set(tenantId, tenant);
                    resolve(tenant);
                } else {
                    resolve(null);
                }
            });
        });
    }

    async updateTenant(tenantId, updates) {
        const tenant = await this.getTenant(tenantId);
        if (!tenant) {
            throw new Error(`Tenant ${tenantId} non trouvé`);
        }

        const updatedTenant = { ...tenant, ...updates };
        if (updates.settings) {
            updatedTenant.settings = JSON.stringify(updates.settings);
        }
        if (updates.metadata) {
            updatedTenant.metadata = JSON.stringify(updates.metadata);
        }

        try {
            await this.updateTenantInDB(tenantId, updatedTenant);
            this.tenants.set(tenantId, updatedTenant);
            
            this.emit('tenantUpdated', updatedTenant);
            return updatedTenant;
        } catch (error) {
            console.error(`❌ Erreur mise à jour tenant ${tenantId}:`, error.message);
            throw error;
        }
    }

    async updateTenantInDB(tenantId, tenant) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE tenants 
                SET name = ?, email = ?, tier = ?, status = ?, 
                    settings = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            this.db.run(sql, [
                tenant.name, tenant.email, tenant.tier, tenant.status,
                tenant.settings, tenant.metadata, tenantId
            ], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    async createSession(tenantId, sessionData = {}) {
        const sessionToken = this.generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const session = {
            tenant_id: tenantId,
            session_token: sessionToken,
            expires_at: expiresAt.toISOString(),
            ip_address: sessionData.ipAddress,
            user_agent: sessionData.userAgent,
            metadata: JSON.stringify(sessionData.metadata || {})
        };

        try {
            await this.insertSession(session);
            this.activeSessions.set(sessionToken, {
                ...session,
                created_at: new Date()
            });

            return sessionToken;
        } catch (error) {
            console.error(`❌ Erreur création session:`, error.message);
            throw error;
        }
    }

    async insertSession(session) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO tenant_sessions 
                (tenant_id, session_token, expires_at, ip_address, user_agent, metadata)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                session.tenant_id, session.session_token, session.expires_at,
                session.ip_address, session.user_agent, session.metadata
            ], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    async validateSession(sessionToken) {
        const session = this.activeSessions.get(sessionToken);
        if (session) {
            const now = new Date();
            if (now < new Date(session.expires_at)) {
                return session;
            } else {
                this.activeSessions.delete(sessionToken);
                await this.expireSession(sessionToken);
            }
        }

        return null;
    }

    async expireSession(sessionToken) {
        this.activeSessions.delete(sessionToken);
        
        if (this.db) {
            this.db.run('DELETE FROM tenant_sessions WHERE session_token = ?', [sessionToken]);
        }
    }

    async trackUsage(tenantId, usageType, amount) {
        const today = new Date().toISOString().split('T')[0];
        
        let usage = this.usageTracking.get(tenantId);
        if (!usage) {
            usage = { requests: 0, storage: 0, computeTime: 0, bandwidth: 0 };
            this.usageTracking.set(tenantId, usage);
        }

        usage[usageType] = (usage[usageType] || 0) + amount;

        await this.updateUsageInDB(tenantId, today, usageType, amount);
        
        const quota = await this.getTenantQuota(tenantId, usageType);
        if (quota && usage[usageType] > quota.quota_limit) {
            this.emit('usageExceeded', {
                tenantId,
                usageType,
                current: usage[usageType],
                limit: quota.quota_limit
            });
        } else if (quota && usage[usageType] > quota.quota_limit * 0.8) {
            this.emit('quotaWarning', {
                tenantId,
                usageType,
                current: usage[usageType],
                limit: quota.quota_limit,
                percentage: (usage[usageType] / quota.quota_limit) * 100
            });
        }
    }

    async updateUsageInDB(tenantId, date, usageType, amount) {
        const columnMap = {
            requests: 'requests_count',
            storage: 'storage_used',
            computeTime: 'compute_time',
            bandwidth: 'bandwidth_used'
        };

        const column = columnMap[usageType];
        if (!column) return;

        const sql = `
            INSERT OR IGNORE INTO tenant_usage (tenant_id, date) VALUES (?, ?);
            UPDATE tenant_usage 
            SET ${column} = ${column} + ?
            WHERE tenant_id = ? AND date = ?
        `;

        if (this.db) {
            this.db.serialize(() => {
                this.db.run('INSERT OR IGNORE INTO tenant_usage (tenant_id, date) VALUES (?, ?)', [tenantId, date]);
                this.db.run(`UPDATE tenant_usage SET ${column} = ${column} + ? WHERE tenant_id = ? AND date = ?`, 
                    [amount, tenantId, date]);
            });
        }
    }

    async getTenantQuota(tenantId, resourceType) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM tenant_quotas 
                WHERE tenant_id = ? AND resource_type = ?
            `;
            
            this.db.get(sql, [tenantId, resourceType], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    async getTenantUsage(tenantId, period = 'current_month') {
        return new Promise((resolve, reject) => {
            let dateFilter;
            
            switch (period) {
                case 'today':
                    dateFilter = "date = date('now')";
                    break;
                case 'current_month':
                    dateFilter = "date >= date('now', 'start of month')";
                    break;
                case 'last_30_days':
                    dateFilter = "date >= date('now', '-30 days')";
                    break;
                default:
                    dateFilter = "date >= date('now', 'start of month')";
            }

            const sql = `
                SELECT 
                    SUM(requests_count) as total_requests,
                    SUM(storage_used) as total_storage,
                    SUM(compute_time) as total_compute,
                    SUM(bandwidth_used) as total_bandwidth
                FROM tenant_usage 
                WHERE tenant_id = ? AND ${dateFilter}
            `;
            
            this.db.get(sql, [tenantId], (err, row) => {
                if (err) reject(err);
                else resolve(row || {});
            });
        });
    }

    async listTenants(filters = {}) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM tenants';
            const params = [];
            const conditions = [];

            if (filters.tier) {
                conditions.push('tier = ?');
                params.push(filters.tier);
            }
            
            if (filters.status) {
                conditions.push('status = ?');
                params.push(filters.status);
            }

            if (conditions.length > 0) {
                sql += ' WHERE ' + conditions.join(' AND ');
            }

            sql += ' ORDER BY created_at DESC';

            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const tenants = rows.map(row => ({
                        ...row,
                        settings: JSON.parse(row.settings || '{}'),
                        metadata: JSON.parse(row.metadata || '{}')
                    }));
                    resolve(tenants);
                }
            });
        });
    }

    async deleteTenant(tenantId) {
        if (tenantId === 'default') {
            throw new Error('Impossible de supprimer le tenant par défaut');
        }

        try {
            await this.deleteTenantFromDB(tenantId);
            this.tenants.delete(tenantId);
            this.usageTracking.delete(tenantId);

            for (const [sessionToken, session] of this.activeSessions) {
                if (session.tenant_id === tenantId) {
                    this.activeSessions.delete(sessionToken);
                }
            }

            console.log(`✅ Tenant ${tenantId} supprimé`);
            return true;
        } catch (error) {
            console.error(`❌ Erreur suppression tenant ${tenantId}:`, error.message);
            throw error;
        }
    }

    async deleteTenantFromDB(tenantId) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('DELETE FROM tenant_sessions WHERE tenant_id = ?', [tenantId]);
                this.db.run('DELETE FROM tenant_usage WHERE tenant_id = ?', [tenantId]);
                this.db.run('DELETE FROM tenant_quotas WHERE tenant_id = ?', [tenantId]);
                this.db.run('DELETE FROM tenant_billing WHERE tenant_id = ?', [tenantId]);
                this.db.run('DELETE FROM tenants WHERE id = ?', [tenantId], function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                });
            });
        });
    }

    async monitorResourceUsage() {
        try {
            for (const [tenantId] of this.tenants) {
                const usage = await this.getTenantUsage(tenantId, 'today');
                this.usageTracking.set(tenantId, {
                    requests: usage.total_requests || 0,
                    storage: usage.total_storage || 0,
                    computeTime: usage.total_compute || 0,
                    bandwidth: usage.total_bandwidth || 0
                });
            }
        } catch (error) {
            console.error('❌ Erreur monitoring ressources:', error.message);
        }
    }

    handleTenantCreated(tenant) {
        console.log(`🎉 Nouveau tenant: ${tenant.name} (${tenant.tier})`);
    }

    handleTenantUpdated(tenant) {
        console.log(`🔄 Tenant mis à jour: ${tenant.name}`);
    }

    handleUsageExceeded(data) {
        console.warn(`⚠️ Quota dépassé - Tenant: ${data.tenantId}, Type: ${data.usageType}, Usage: ${data.current}/${data.limit}`);
    }

    handleQuotaWarning(data) {
        console.warn(`📊 Avertissement quota - Tenant: ${data.tenantId}, Type: ${data.usageType}, Usage: ${data.percentage.toFixed(1)}%`);
    }

    generateTenantId() {
        return `tenant-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    }

    generateSessionToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    getStats() {
        return {
            totalTenants: this.tenants.size,
            activeSessions: this.activeSessions.size,
            tierDistribution: this.getTierDistribution(),
            resourceUsage: this.getAggregatedUsage()
        };
    }

    getTierDistribution() {
        const distribution = {};
        for (const [, tenant] of this.tenants) {
            distribution[tenant.tier] = (distribution[tenant.tier] || 0) + 1;
        }
        return distribution;
    }

    getAggregatedUsage() {
        const aggregated = {
            requests: 0,
            storage: 0,
            computeTime: 0,
            bandwidth: 0
        };

        for (const [, usage] of this.usageTracking) {
            aggregated.requests += usage.requests || 0;
            aggregated.storage += usage.storage || 0;
            aggregated.computeTime += usage.computeTime || 0;
            aggregated.bandwidth += usage.bandwidth || 0;
        }

        return aggregated;
    }

    async shutdown() {
        console.log('🔄 Arrêt TenantManager...');
        
        if (this.db) {
            this.db.close((err) => {
                if (err) console.error('❌ Erreur fermeture DB tenant:', err.message);
                else console.log('✅ Base tenant fermée');
            });
        }
        
        console.log('✅ TenantManager arrêté');
    }
}

module.exports = TenantManager;